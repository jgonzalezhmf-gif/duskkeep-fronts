-- Duskkeep Fronts - progresion autoritativa de Frontline Fortress.
-- La mejora de edificios visibles en /fortress deja de confiar en el cliente:
-- el servidor valida edificio, coste, recursos, idempotencia y persiste estado.

create table if not exists public.player_frontline_fortress (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  buildings jsonb not null default '{"keep":1,"treasury":1,"barracks":1}'::jsonb
    check (jsonb_typeof(buildings) = 'object'),
  integrity int not null default 100 check (integrity between 0 and 100),
  garrison jsonb not null default '["bran","kara","mira"]'::jsonb
    check (jsonb_typeof(garrison) = 'array' and jsonb_array_length(garrison) = 3),
  last_resolved_at timestamptz,
  next_attack_at timestamptz default (now() + interval '8 hours'),
  raids_resolved int not null default 0 check (raids_resolved >= 0),
  updated_at timestamptz not null default now()
);

drop trigger if exists player_frontline_fortress_set_updated_at on public.player_frontline_fortress;
create trigger player_frontline_fortress_set_updated_at
before update on public.player_frontline_fortress
for each row execute function public.set_updated_at();

alter table public.player_frontline_fortress enable row level security;

drop policy if exists player_frontline_fortress_select_own on public.player_frontline_fortress;
create policy player_frontline_fortress_select_own
on public.player_frontline_fortress for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = player_frontline_fortress.profile_id
      and profiles.user_id = auth.uid()
  )
);

insert into public.player_frontline_fortress (profile_id)
select p.id
  from public.profiles p
  left join public.player_frontline_fortress ff on ff.profile_id = p.id
  where ff.profile_id is null;

create or replace function public.provision_player_starter_state(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_profile_id is null then
    return;
  end if;

  insert into public.player_resources (profile_id)
  values (p_profile_id)
  on conflict (profile_id) do nothing;

  insert into public.player_heroes (profile_id, hero_id, level, stars, shards, xp, skill_level, unlocked)
  values
    (p_profile_id, 'bran', 1, 1, 0, 0, 1, true),
    (p_profile_id, 'kara', 1, 1, 0, 0, 1, true),
    (p_profile_id, 'vex', 1, 1, 0, 0, 1, true),
    (p_profile_id, 'mira', 1, 1, 0, 0, 1, true),
    (p_profile_id, 'drak', 1, 1, 0, 0, 1, true),
    (p_profile_id, 'tovi', 1, 1, 0, 0, 1, true)
  on conflict (profile_id, hero_id) do update set
    unlocked = public.player_heroes.unlocked or excluded.unlocked;

  insert into public.player_frontline_cards (profile_id, card_id, unlocked, level)
  values
    (p_profile_id, 'order_guard_wall', true, 1),
    (p_profile_id, 'order_twin_slash', true, 1),
    (p_profile_id, 'order_focus_fire', true, 1),
    (p_profile_id, 'tactic_battle_hymn', true, 1),
    (p_profile_id, 'tactic_sanctuary', true, 1),
    (p_profile_id, 'tactic_smokescreen', true, 1),
    (p_profile_id, 'summon_wolf', true, 1),
    (p_profile_id, 'summon_barrier', true, 1)
  on conflict (profile_id, card_id) do update set
    unlocked = public.player_frontline_cards.unlocked or excluded.unlocked,
    level = greatest(public.player_frontline_cards.level, excluded.level);

  insert into public.frontline_loadouts (profile_id, leader_id, squad, deck)
  values (
    p_profile_id,
    'leader_aurora',
    '["bran","kara","mira"]'::jsonb,
    '["order_guard_wall","order_twin_slash","order_focus_fire","tactic_battle_hymn","tactic_sanctuary","tactic_smokescreen","summon_wolf","summon_barrier"]'::jsonb
  )
  on conflict (profile_id) do nothing;

  insert into public.player_frontline_fortress (profile_id)
  values (p_profile_id)
  on conflict (profile_id) do nothing;
end;
$$;

create or replace function public.provision_player_account()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid;
  v_display_name text;
begin
  v_display_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'displayName', '')), '');

  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(v_display_name, 'Commander'))
  on conflict (user_id) do update set
    display_name = coalesce(v_display_name, public.profiles.display_name)
  returning id into v_profile_id;

  perform public.provision_player_starter_state(v_profile_id);

  return new;
end;
$$;

create or replace function public.frontline_fortress_building_cost(p_building_id text, p_current_level int)
returns jsonb
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  v_gold_base int;
  v_dust_base int := 0;
begin
  if p_building_id = 'keep' then
    v_gold_base := 120;
    v_dust_base := 8;
  elsif p_building_id = 'treasury' then
    v_gold_base := 110;
  elsif p_building_id = 'barracks' then
    v_gold_base := 130;
    v_dust_base := 6;
  else
    return null;
  end if;

  return jsonb_build_object(
    'gold', round(v_gold_base * power(1.32, greatest(p_current_level, 1) - 1))::int,
    'dust', case
      when v_dust_base > 0 then round(v_dust_base * power(1.28, greatest(p_current_level, 1) - 1))::int
      else 0
    end
  );
end;
$$;

create or replace function public.frontline_fortress_snapshot(p_profile_id uuid)
returns jsonb
language sql
stable
set search_path = public, pg_temp
as $$
  select case
    when ff.profile_id is null then null
    else jsonb_build_object(
      'buildings', ff.buildings,
      'integrity', ff.integrity,
      'garrison', ff.garrison,
      'lastResolvedAt', ff.last_resolved_at,
      'nextAttackAt', ff.next_attack_at,
      'raidsResolved', ff.raids_resolved,
      'lastReport', null,
      'updatedAt', ff.updated_at
    )
  end
    from public.player_frontline_fortress ff
    where ff.profile_id = p_profile_id
$$;

create or replace function public.upgrade_frontline_fortress(
  p_idempotency_key text,
  p_building_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_result jsonb;
  v_resources public.player_resources%rowtype;
  v_fortress public.player_frontline_fortress%rowtype;
  v_current_level int;
  v_next_level int;
  v_cost jsonb;
  v_gold_cost int;
  v_dust_cost int;
  v_next_buildings jsonb;
  v_snapshot jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_building_id not in ('keep', 'treasury', 'barracks') then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Unsupported fortress building');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(
    digest('upgradeFrontlineFortress:' || p_building_id, 'sha256'),
    'hex'
  );

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'upgradeFrontlineFortress'
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

  insert into public.player_frontline_fortress (profile_id)
  values (v_profile_id)
  on conflict (profile_id) do nothing;

  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

  select *
    into v_fortress
    from public.player_frontline_fortress
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Fortress state not found');
  end if;

  v_current_level := coalesce((v_fortress.buildings ->> p_building_id)::int, 1);
  if v_current_level >= 60 then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Fortress building is at max level');
  end if;

  v_cost := public.frontline_fortress_building_cost(p_building_id, v_current_level);
  v_gold_cost := coalesce((v_cost ->> 'gold')::int, 0);
  v_dust_cost := coalesce((v_cost ->> 'dust')::int, 0);

  if v_resources.gold < v_gold_cost or v_resources.dust < v_dust_cost then
    return jsonb_build_object('ok', false, 'code', 'insufficient_resources', 'reason', 'Not enough resources');
  end if;

  insert into public.server_operations (
    id,
    profile_id,
    idempotency_key,
    operation_type,
    payload_hash,
    status,
    result,
    created_at
  )
  values (
    v_operation_id,
    v_profile_id,
    p_idempotency_key,
    'upgradeFrontlineFortress',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now
  );

  v_next_level := v_current_level + 1;
  v_next_buildings := jsonb_set(v_fortress.buildings, array[p_building_id], to_jsonb(v_next_level), true);

  update public.player_resources
    set gold = gold - v_gold_cost,
        dust = dust - v_dust_cost
    where profile_id = v_profile_id
    returning * into v_resources;

  update public.player_frontline_fortress
    set buildings = v_next_buildings
    where profile_id = v_profile_id
    returning * into v_fortress;

  if v_gold_cost > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (
      v_profile_id,
      v_operation_id,
      'frontline_fortress_upgrade',
      'gold',
      -v_gold_cost,
      v_resources.gold,
      jsonb_build_object('buildingId', p_building_id, 'level', v_next_level)
    );
  end if;

  if v_dust_cost > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (
      v_profile_id,
      v_operation_id,
      'frontline_fortress_upgrade',
      'dust',
      -v_dust_cost,
      v_resources.dust,
      jsonb_build_object('buildingId', p_building_id, 'level', v_next_level)
    );
  end if;

  v_snapshot := public.frontline_fortress_snapshot(v_profile_id);

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'buildingId', p_building_id,
      'level', v_next_level,
      'costPaid', jsonb_build_object('gold', v_gold_cost, 'dust', v_dust_cost),
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      ),
      'frontlineFortress', v_snapshot
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

revoke all on function public.frontline_fortress_building_cost(text, int) from public;
grant execute on function public.frontline_fortress_building_cost(text, int) to authenticated;

revoke all on function public.frontline_fortress_snapshot(uuid) from public;
grant execute on function public.frontline_fortress_snapshot(uuid) to authenticated;

revoke all on function public.upgrade_frontline_fortress(text, text) from public;
grant execute on function public.upgrade_frontline_fortress(text, text) to authenticated;

create or replace function public.get_player_snapshot()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_snapshot jsonb;
  v_heroes jsonb;
  v_card_unlocks jsonb;
  v_card_levels jsonb;
  v_loadout jsonb;
  v_frontline_fortress jsonb;
  v_adventure_progress jsonb;
  v_adventure_claims jsonb;
  v_missions_progress jsonb;
  v_daily_login_claims jsonb;
  v_shop_purchases jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'heroId', h.hero_id,
        'level', h.level,
        'stars', h.stars,
        'shards', h.shards,
        'xp', h.xp,
        'skillLevel', h.skill_level,
        'unlocked', h.unlocked,
        'updatedAt', h.updated_at
      )
      order by h.hero_id
    ),
    '[]'::jsonb
  )
    into v_heroes
    from public.player_heroes h
    where h.profile_id = v_profile_id;

  select coalesce(jsonb_object_agg(c.card_id, c.unlocked), '{}'::jsonb)
    into v_card_unlocks
    from public.player_frontline_cards c
    where c.profile_id = v_profile_id;

  select coalesce(jsonb_object_agg(c.card_id, c.level), '{}'::jsonb)
    into v_card_levels
    from public.player_frontline_cards c
    where c.profile_id = v_profile_id;

  select case
    when fl.profile_id is null then null
    else jsonb_build_object(
      'leaderId', fl.leader_id,
      'squad', fl.squad,
      'deck', fl.deck,
      'updatedAt', fl.updated_at
    )
  end
    into v_loadout
    from public.frontline_loadouts fl
    where fl.profile_id = v_profile_id;

  select public.frontline_fortress_snapshot(v_profile_id)
    into v_frontline_fortress;

  select coalesce(
    jsonb_object_agg(
      ap.node_id,
      jsonb_build_object(
        'chapterId', ap.chapter_id,
        'nodeId', ap.node_id,
        'status', ap.status,
        'cleared', ap.cleared,
        'firstClearTaken', ap.first_clear_taken,
        'claimed', ap.claimed,
        'clearedAt', ap.cleared_at,
        'updatedAt', ap.updated_at
      )
    ),
    '{}'::jsonb
  )
    into v_adventure_progress
    from public.adventure_progress ap
    where ap.profile_id = v_profile_id;

  select coalesce(
    jsonb_object_agg(
      amc.interaction_id,
      jsonb_build_object(
        'interactionId', amc.interaction_id,
        'claimed', amc.claimed,
        'claimedAt', amc.claimed_at,
        'resetAvailableAt', amc.reset_available_at,
        'lootId', amc.loot_id,
        'lootTier', amc.loot_tier,
        'lootTitle', amc.loot_title,
        'rewards', amc.rewards,
        'updatedAt', amc.updated_at
      )
    ),
    '{}'::jsonb
  )
    into v_adventure_claims
    from public.adventure_map_claims amc
    where amc.profile_id = v_profile_id;

  select coalesce(
    jsonb_object_agg(
      mp.mission_id || ':' || mp.cycle_key,
      jsonb_build_object(
        'missionId', mp.mission_id,
        'cycleKey', mp.cycle_key,
        'progress', mp.progress,
        'target', mp.target,
        'claimed', mp.claimed,
        'claimedAt', mp.claimed_at,
        'updatedAt', mp.updated_at
      )
    ),
    '{}'::jsonb
  )
    into v_missions_progress
    from public.missions_progress mp
    where mp.profile_id = v_profile_id;

  select coalesce(
    jsonb_object_agg(
      dlc.day_key,
      jsonb_build_object(
        'dayKey', dlc.day_key,
        'streak', dlc.streak,
        'rewards', dlc.rewards,
        'claimedAt', dlc.claimed_at
      )
    ),
    '{}'::jsonb
  )
    into v_daily_login_claims
    from public.daily_login_claims dlc
    where dlc.profile_id = v_profile_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'offerId', sp.offer_id,
        'purchaseDay', sp.purchase_day,
        'quantity', sp.quantity,
        'cost', sp.cost,
        'contents', sp.contents,
        'createdAt', sp.created_at
      )
      order by sp.created_at desc
    ),
    '[]'::jsonb
  )
    into v_shop_purchases
    from (
      select *
        from public.shop_purchases
        where profile_id = v_profile_id
        order by created_at desc
        limit 128
    ) sp;

  select jsonb_build_object(
    'account', jsonb_build_object(
      'name', p.display_name,
      'level', p.account_level,
      'xp', p.account_xp,
      'createdAt', p.created_at,
      'updatedAt', p.updated_at
    ),
    'resources', jsonb_build_object(
      'gold', r.gold,
      'dust', r.dust,
      'gems', r.gems,
      'arenaTickets', r.arena_tickets,
      'adventureKeys', r.adventure_keys,
      'updatedAt', r.updated_at
    ),
    'heroes', v_heroes,
    'frontlineCardUnlocks', v_card_unlocks,
    'frontlineCardLevels', v_card_levels,
    'frontlineLoadout', v_loadout,
    'frontlineFortress', v_frontline_fortress,
    'adventureProgress', v_adventure_progress,
    'adventureMapClaims', v_adventure_claims,
    'missionsProgress', v_missions_progress,
    'dailyLoginClaims', v_daily_login_claims,
    'shopPurchases', v_shop_purchases
  )
    into v_snapshot
    from public.profiles p
    join public.player_resources r on r.profile_id = p.id
    where p.id = v_profile_id;

  return jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'profileId', v_profile_id,
      'snapshot', v_snapshot
    )
  );
end;
$$;

revoke all on function public.get_player_snapshot() from public;
grant execute on function public.get_player_snapshot() to authenticated;
