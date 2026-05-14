-- Duskkeep Fronts - base reutilizable para rewards server-authoritative.
-- La intencion es que Shop, Adventure, Missions y futuros sistemas llamen
-- a una misma primitiva de concesion en vez de duplicar balance/reward logic.

create or replace function public.jsonb_reward_payload_is_valid(p_value jsonb)
returns boolean
language plpgsql
immutable
as $$
declare
  v_key text;
  v_value jsonb;
  v_entry jsonb;
  v_number numeric;
begin
  if p_value is null or jsonb_typeof(p_value) <> 'object' then
    return false;
  end if;

  for v_key, v_value in select key, value from jsonb_each(p_value) loop
    if v_key in ('gold', 'dust', 'gems', 'arenaTickets', 'adventureKeys', 'accountXp', 'xp') then
      if jsonb_typeof(v_value) <> 'number' then
        return false;
      end if;

      v_number := (v_value #>> '{}')::numeric;
      if v_number < 0 or v_number <> trunc(v_number) then
        return false;
      end if;
    elsif v_key = 'shards' then
      if jsonb_typeof(v_value) <> 'array' or jsonb_array_length(v_value) > 32 then
        return false;
      end if;

      for v_entry in select value from jsonb_array_elements(v_value) loop
        if jsonb_typeof(v_entry) <> 'object'
          or not (v_entry ? 'heroId')
          or not (v_entry ? 'amount')
          or (v_entry ->> 'heroId') !~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'
          or jsonb_typeof(v_entry -> 'amount') <> 'number'
          or ((v_entry ->> 'amount')::numeric) <= 0
          or ((v_entry ->> 'amount')::numeric) <> trunc((v_entry ->> 'amount')::numeric)
          or ((v_entry ->> 'amount')::int) > 10000
        then
          return false;
        end if;
      end loop;
    elsif v_key = 'frontlineCards' then
      if jsonb_typeof(v_value) <> 'array' or jsonb_array_length(v_value) > 64 then
        return false;
      end if;

      for v_entry in select value from jsonb_array_elements(v_value) loop
        if jsonb_typeof(v_entry) <> 'object'
          or not (v_entry ? 'cardId')
          or (v_entry ->> 'cardId') !~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'
        then
          return false;
        end if;
      end loop;
    else
      return false;
    end if;
  end loop;

  return true;
end;
$$;

create or replace function public.jsonb_shop_contents_are_valid(p_value jsonb)
returns boolean
language sql
immutable
as $$
  select public.jsonb_reward_payload_is_valid(p_value);
$$;

create table if not exists public.server_reward_definitions (
  reward_id text primary key check (reward_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  enabled boolean not null default true,
  rewards jsonb not null default '{}'::jsonb check (public.jsonb_reward_payload_is_valid(rewards)),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists server_reward_definitions_set_updated_at on public.server_reward_definitions;
create trigger server_reward_definitions_set_updated_at
before update on public.server_reward_definitions
for each row execute function public.set_updated_at();

alter table public.server_reward_definitions enable row level security;

revoke all on table public.server_reward_definitions from public;
revoke all on table public.server_reward_definitions from anon;
revoke all on table public.server_reward_definitions from authenticated;

create or replace function public.grant_reward_bundle(
  p_profile_id uuid,
  p_operation_id uuid,
  p_source text,
  p_rewards jsonb,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_resources public.player_resources%rowtype;
  v_reward_gold int := 0;
  v_reward_dust int := 0;
  v_reward_gems int := 0;
  v_reward_arena_tickets int := 0;
  v_reward_adventure_keys int := 0;
  v_reward_account_xp int := 0;
  v_reward_team_xp int := 0;
  v_entry jsonb;
  v_requires_snapshot_refresh boolean := false;
begin
  if p_profile_id is null or p_operation_id is null then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid reward context');
  end if;

  if p_source is null or length(trim(p_source)) = 0 or length(trim(p_source)) > 80 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid reward source');
  end if;

  if p_metadata is null or jsonb_typeof(p_metadata) <> 'object' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid reward metadata');
  end if;

  if public.jsonb_reward_payload_is_valid(p_rewards) is not true then
    return jsonb_build_object('ok', false, 'code', 'invalid_reward', 'reason', 'Invalid reward payload');
  end if;

  v_reward_gold := coalesce((p_rewards ->> 'gold')::int, 0);
  v_reward_dust := coalesce((p_rewards ->> 'dust')::int, 0);
  v_reward_gems := coalesce((p_rewards ->> 'gems')::int, 0);
  v_reward_arena_tickets := coalesce((p_rewards ->> 'arenaTickets')::int, 0);
  v_reward_adventure_keys := coalesce((p_rewards ->> 'adventureKeys')::int, 0);
  v_reward_account_xp := coalesce((p_rewards ->> 'accountXp')::int, 0);
  v_reward_team_xp := coalesce((p_rewards ->> 'xp')::int, 0);

  update public.player_resources
    set gold = gold + v_reward_gold,
        dust = dust + v_reward_dust,
        gems = gems + v_reward_gems,
        arena_tickets = arena_tickets + v_reward_arena_tickets,
        adventure_keys = adventure_keys + v_reward_adventure_keys
    where profile_id = p_profile_id
    returning * into v_resources;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
  end if;

  if v_reward_account_xp > 0 then
    update public.profiles
      set account_xp = account_xp + v_reward_account_xp
      where id = p_profile_id;
    v_requires_snapshot_refresh := true;
  end if;

  if v_reward_team_xp > 0 then
    insert into public.player_heroes (profile_id, hero_id, xp, unlocked)
    select p_profile_id, squad_hero.hero_id, v_reward_team_xp, true
      from (
        select distinct squad.value #>> '{}' as hero_id
          from public.frontline_loadouts fl
          cross join lateral jsonb_array_elements(fl.squad) as squad(value)
          where fl.profile_id = p_profile_id
            and jsonb_typeof(squad.value) = 'string'
            and length(squad.value #>> '{}') > 0
      ) squad_hero
    on conflict (profile_id, hero_id)
    do update set
      xp = public.player_heroes.xp + excluded.xp,
      updated_at = now();
    v_requires_snapshot_refresh := true;
  end if;

  for v_entry in select value from jsonb_array_elements(coalesce(p_rewards -> 'shards', '[]'::jsonb)) loop
    insert into public.player_heroes (profile_id, hero_id, shards, unlocked)
    values (p_profile_id, v_entry ->> 'heroId', (v_entry ->> 'amount')::int, false)
    on conflict (profile_id, hero_id)
    do update set
      shards = public.player_heroes.shards + excluded.shards,
      updated_at = now();
    v_requires_snapshot_refresh := true;
  end loop;

  for v_entry in select value from jsonb_array_elements(coalesce(p_rewards -> 'frontlineCards', '[]'::jsonb)) loop
    insert into public.player_frontline_cards (profile_id, card_id, unlocked, level)
    values (p_profile_id, v_entry ->> 'cardId', true, 1)
    on conflict (profile_id, card_id)
    do update set
      unlocked = true,
      updated_at = now();
    v_requires_snapshot_refresh := true;
  end loop;

  if v_reward_gold > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (p_profile_id, p_operation_id, p_source, 'gold', v_reward_gold, v_resources.gold, p_metadata);
  end if;
  if v_reward_dust > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (p_profile_id, p_operation_id, p_source, 'dust', v_reward_dust, v_resources.dust, p_metadata);
  end if;
  if v_reward_gems > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (p_profile_id, p_operation_id, p_source, 'gems', v_reward_gems, v_resources.gems, p_metadata);
  end if;
  if v_reward_arena_tickets > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (p_profile_id, p_operation_id, p_source, 'arena_tickets', v_reward_arena_tickets, v_resources.arena_tickets, p_metadata);
  end if;
  if v_reward_adventure_keys > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (p_profile_id, p_operation_id, p_source, 'adventure_keys', v_reward_adventure_keys, v_resources.adventure_keys, p_metadata);
  end if;

  return jsonb_build_object(
    'ok', true,
    'rewardsGranted', p_rewards,
    'resources', jsonb_build_object(
      'gold', v_resources.gold,
      'dust', v_resources.dust,
      'gems', v_resources.gems,
      'arenaTickets', v_resources.arena_tickets,
      'adventureKeys', v_resources.adventure_keys
    ),
    'requiresSnapshotRefresh', v_requires_snapshot_refresh
  );
end;
$$;

create or replace function public.grant_reward_definition(
  p_profile_id uuid,
  p_operation_id uuid,
  p_source text,
  p_reward_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_rewards jsonb;
  v_result jsonb;
begin
  select rewards
    into v_rewards
    from public.server_reward_definitions
    where reward_id = p_reward_id
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Reward definition not found');
  end if;

  v_result := public.grant_reward_bundle(p_profile_id, p_operation_id, p_source, v_rewards, p_metadata || jsonb_build_object('rewardId', p_reward_id));
  if coalesce((v_result ->> 'ok')::boolean, false) is not true then
    return v_result;
  end if;

  return v_result || jsonb_build_object('rewardId', p_reward_id);
end;
$$;

revoke all on function public.grant_reward_bundle(uuid, uuid, text, jsonb, jsonb) from public;
revoke all on function public.grant_reward_bundle(uuid, uuid, text, jsonb, jsonb) from authenticated;
revoke all on function public.grant_reward_definition(uuid, uuid, text, text, jsonb) from public;
revoke all on function public.grant_reward_definition(uuid, uuid, text, text, jsonb) from authenticated;

create or replace function public.purchase_shop_offer(
  p_idempotency_key text,
  p_offer_id text,
  p_quantity int default 1
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_offer public.server_shop_offers%rowtype;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_purchase_day text := to_char(now() at time zone 'utc', 'YYYY-MM-DD');
  v_purchase_count int;
  v_resources public.player_resources%rowtype;
  v_cost_gold int := 0;
  v_cost_dust int := 0;
  v_cost_gems int := 0;
  v_cost_adventure_keys int := 0;
  v_reward_result jsonb;
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_offer_id is null or trim(p_offer_id) = '' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid offer id');
  end if;

  if p_quantity is null or p_quantity <> 1 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'This offer only supports quantity 1');
  end if;

  select *
    into v_offer
    from public.server_shop_offers
    where offer_id = p_offer_id
      and enabled = true
      and (starts_at is null or starts_at <= v_now)
      and (ends_at is null or ends_at > v_now);

  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Shop offer is not available');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(digest('purchaseShopOffer:' || p_offer_id || ':' || p_quantity::text, 'sha256'), 'hex');

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'purchaseShopOffer'
      or v_existing_operation.payload_hash <> v_payload_hash then
      return jsonb_build_object(
        'ok', false,
        'code', 'idempotency_conflict',
        'reason', 'Idempotency key was already used with a different payload'
      );
    end if;

    if v_existing_operation.status = 'completed' then
      return v_existing_operation.result;
    end if;

    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Operation is not completed');
  end if;

  perform pg_advisory_xact_lock(hashtext(v_profile_id::text || ':' || p_offer_id || ':' || v_purchase_day));

  if exists (
    select 1
      from unnest(v_offer.unlock_after_node_ids) as required_node_id
      where not exists (
        select 1
          from public.adventure_progress
          where profile_id = v_profile_id
            and node_id = required_node_id
            and (cleared = true or first_clear_taken = true or claimed = true)
      )
  ) then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Shop offer is locked');
  end if;

  if v_offer.one_time then
    select coalesce(sum(quantity), 0)
      into v_purchase_count
      from public.shop_purchases
      where profile_id = v_profile_id
        and offer_id = p_offer_id;

    if v_purchase_count >= 1 then
      return jsonb_build_object('ok', false, 'code', 'daily_limit_reached', 'reason', 'Offer already purchased');
    end if;
  elsif v_offer.daily_limit is not null then
    select coalesce(sum(quantity), 0)
      into v_purchase_count
      from public.shop_purchases
      where profile_id = v_profile_id
        and offer_id = p_offer_id
        and purchase_day = v_purchase_day;

    if v_purchase_count >= v_offer.daily_limit then
      return jsonb_build_object('ok', false, 'code', 'daily_limit_reached', 'reason', 'Daily limit reached');
    end if;
  else
    v_purchase_count := 0;
  end if;

  v_cost_gold := coalesce((v_offer.cost ->> 'gold')::int, 0);
  v_cost_dust := coalesce((v_offer.cost ->> 'dust')::int, 0);
  v_cost_gems := coalesce((v_offer.cost ->> 'gems')::int, 0);
  v_cost_adventure_keys := coalesce((v_offer.cost ->> 'adventureKeys')::int, 0);

  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
  end if;

  if v_resources.gold < v_cost_gold then
    return jsonb_build_object('ok', false, 'code', 'insufficient_resources', 'reason', 'Not enough gold');
  end if;
  if v_resources.dust < v_cost_dust then
    return jsonb_build_object('ok', false, 'code', 'insufficient_resources', 'reason', 'Not enough dust');
  end if;
  if v_resources.gems < v_cost_gems then
    return jsonb_build_object('ok', false, 'code', 'insufficient_resources', 'reason', 'Not enough gems');
  end if;
  if v_resources.adventure_keys < v_cost_adventure_keys then
    return jsonb_build_object('ok', false, 'code', 'insufficient_resources', 'reason', 'Not enough adventure keys');
  end if;

  insert into public.server_operations (
    id,
    profile_id,
    idempotency_key,
    operation_type,
    payload_hash,
    status,
    result,
    created_at,
    completed_at
  )
  values (
    v_operation_id,
    v_profile_id,
    p_idempotency_key,
    'purchaseShopOffer',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  update public.player_resources
    set gold = gold - v_cost_gold,
        dust = dust - v_cost_dust,
        gems = gems - v_cost_gems,
        adventure_keys = adventure_keys - v_cost_adventure_keys
    where profile_id = v_profile_id
    returning * into v_resources;

  if v_cost_gold > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'gold', -v_cost_gold, v_resources.gold, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_cost_dust > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'dust', -v_cost_dust, v_resources.dust, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_cost_gems > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'gems', -v_cost_gems, v_resources.gems, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_cost_adventure_keys > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'adventure_keys', -v_cost_adventure_keys, v_resources.adventure_keys, jsonb_build_object('offerId', p_offer_id));
  end if;

  v_reward_result := public.grant_reward_bundle(
    v_profile_id,
    v_operation_id,
    'shop_purchase',
    v_offer.contents,
    jsonb_build_object('offerId', p_offer_id)
  );

  if coalesce((v_reward_result ->> 'ok')::boolean, false) is not true then
    return v_reward_result;
  end if;

  insert into public.shop_purchases (
    profile_id,
    offer_id,
    purchase_day,
    quantity,
    cost,
    contents,
    idempotency_key,
    operation_id,
    created_at
  )
  values (
    v_profile_id,
    p_offer_id,
    v_purchase_day,
    1,
    v_offer.cost,
    v_offer.contents,
    p_idempotency_key,
    v_operation_id,
    v_now
  );

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'offerId', p_offer_id,
      'quantity', 1,
      'costPaid', v_offer.cost,
      'contentsGranted', v_offer.contents,
      'resources', v_reward_result -> 'resources',
      'remaining',
        case
          when v_offer.one_time then 0
          when v_offer.daily_limit is not null then greatest(0, v_offer.daily_limit - v_purchase_count - 1)
          else null
        end,
      'requiresSnapshotRefresh', coalesce((v_reward_result ->> 'requiresSnapshotRefresh')::boolean, false)
    )
  );

  update public.server_operations
    set status = 'completed',
        result = v_result,
        completed_at = v_now
    where id = v_operation_id;

  return v_result;
end;
$$;

revoke all on function public.purchase_shop_offer(text, text, int) from public;
grant execute on function public.purchase_shop_offer(text, text, int) to authenticated;
