-- Duskkeep Fronts - catalogo server-authoritative de Shop.
-- La RPC de compra deja de depender de ramas por oferta y lee coste/rewards/limites desde datos.

create or replace function public.jsonb_object_has_only_keys(p_value jsonb, p_allowed text[])
returns boolean
language sql
immutable
as $$
  select jsonb_typeof(p_value) = 'object'
    and not exists (
      select 1
        from jsonb_object_keys(p_value) as key
        where not key = any(p_allowed)
    );
$$;

create or replace function public.jsonb_object_has_only_nonnegative_int_values(p_value jsonb)
returns boolean
language sql
immutable
as $$
  select jsonb_typeof(p_value) = 'object'
    and not exists (
      select 1
        from jsonb_each(p_value) as entry(key, value)
        where jsonb_typeof(value) <> 'number'
          or (value #>> '{}')::numeric < 0
          or (value #>> '{}')::numeric <> trunc((value #>> '{}')::numeric)
    );
$$;

create table if not exists public.server_shop_offers (
  offer_id text primary key check (offer_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  enabled boolean not null default true,
  cost jsonb not null default '{}'::jsonb,
  contents jsonb not null default '{}'::jsonb,
  daily_limit int null check (daily_limit is null or daily_limit > 0),
  one_time boolean not null default false,
  unlock_after_node_ids text[] not null default '{}',
  starts_at timestamptz null,
  ends_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (public.jsonb_object_has_only_keys(cost, array['gold', 'dust', 'gems', 'adventureKeys'])),
  check (public.jsonb_object_has_only_keys(contents, array['gold', 'dust', 'gems', 'arenaTickets', 'adventureKeys'])),
  check (public.jsonb_object_has_only_nonnegative_int_values(cost)),
  check (public.jsonb_object_has_only_nonnegative_int_values(contents)),
  check (jsonb_array_length(to_jsonb(unlock_after_node_ids)) <= 16),
  check (starts_at is null or ends_at is null or starts_at < ends_at)
);

drop trigger if exists server_shop_offers_set_updated_at on public.server_shop_offers;
create trigger server_shop_offers_set_updated_at
before update on public.server_shop_offers
for each row execute function public.set_updated_at();

alter table public.server_shop_offers enable row level security;

drop policy if exists server_shop_offers_select_enabled on public.server_shop_offers;
create policy server_shop_offers_select_enabled
on public.server_shop_offers for select
to authenticated
using (enabled = true);

insert into public.server_shop_offers (
  offer_id,
  enabled,
  cost,
  contents,
  daily_limit,
  one_time,
  unlock_after_node_ids
)
values
  ('adventure_key_ring', true, '{"gems":45}'::jsonb, '{"adventureKeys":1}'::jsonb, 1, false, array['c1l2']),
  ('daily_raid_payout', true, '{"gems":20}'::jsonb, '{"gold":450,"dust":35}'::jsonb, 2, false, '{}'),
  ('daily_arena_tickets', true, '{"gems":30}'::jsonb, '{"arenaTickets":3}'::jsonb, 1, false, '{}'),
  ('keep_construction_chest', true, '{"gems":100}'::jsonb, '{"gold":2200}'::jsonb, null, false, '{}'),
  ('arcane_ink_crate', true, '{"gems":80}'::jsonb, '{"dust":540}'::jsonb, null, false, '{}'),
  ('arena_push_kit', true, '{"gems":55}'::jsonb, '{"arenaTickets":4,"gold":350}'::jsonb, 1, false, '{}')
on conflict (offer_id) do update set
  enabled = excluded.enabled,
  cost = excluded.cost,
  contents = excluded.contents,
  daily_limit = excluded.daily_limit,
  one_time = excluded.one_time,
  unlock_after_node_ids = excluded.unlock_after_node_ids;

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
  v_reward_gold int := 0;
  v_reward_dust int := 0;
  v_reward_gems int := 0;
  v_reward_arena_tickets int := 0;
  v_reward_adventure_keys int := 0;
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
  v_reward_gold := coalesce((v_offer.contents ->> 'gold')::int, 0);
  v_reward_dust := coalesce((v_offer.contents ->> 'dust')::int, 0);
  v_reward_gems := coalesce((v_offer.contents ->> 'gems')::int, 0);
  v_reward_arena_tickets := coalesce((v_offer.contents ->> 'arenaTickets')::int, 0);
  v_reward_adventure_keys := coalesce((v_offer.contents ->> 'adventureKeys')::int, 0);

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
    set gold = gold - v_cost_gold + v_reward_gold,
        dust = dust - v_cost_dust + v_reward_dust,
        gems = gems - v_cost_gems + v_reward_gems,
        arena_tickets = arena_tickets + v_reward_arena_tickets,
        adventure_keys = adventure_keys - v_cost_adventure_keys + v_reward_adventure_keys
    where profile_id = v_profile_id
    returning * into v_resources;

  if v_cost_gold > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'gold', -v_cost_gold, v_resources.gold - v_reward_gold, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_reward_gold > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'gold', v_reward_gold, v_resources.gold, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_cost_dust > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'dust', -v_cost_dust, v_resources.dust - v_reward_dust, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_reward_dust > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'dust', v_reward_dust, v_resources.dust, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_cost_gems > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'gems', -v_cost_gems, v_resources.gems - v_reward_gems, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_reward_gems > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'gems', v_reward_gems, v_resources.gems, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_reward_arena_tickets > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'arena_tickets', v_reward_arena_tickets, v_resources.arena_tickets, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_cost_adventure_keys > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'adventure_keys', -v_cost_adventure_keys, v_resources.adventure_keys - v_reward_adventure_keys, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_reward_adventure_keys > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'adventure_keys', v_reward_adventure_keys, v_resources.adventure_keys, jsonb_build_object('offerId', p_offer_id));
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
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      ),
      'remaining',
        case
          when v_offer.one_time then 0
          when v_offer.daily_limit is not null then greatest(0, v_offer.daily_limit - v_purchase_count - 1)
          else null
        end
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
