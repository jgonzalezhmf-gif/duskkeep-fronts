-- Duskkeep Fronts - Frontline Fortress upgrades data-driven.
-- Externaliza coste, crecimiento y nivel maximo de edificios en catalogo interno.

create table if not exists public.server_frontline_fortress_buildings (
  building_id text primary key check (building_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  enabled boolean not null default true,
  max_level int not null default 60 check (max_level >= 1 and max_level <= 1000),
  gold_base int not null check (gold_base >= 0 and gold_base <= 10000000),
  dust_base int not null default 0 check (dust_base >= 0 and dust_base <= 10000000),
  gold_growth numeric(8,4) not null default 1.32 check (gold_growth > 0),
  dust_growth numeric(8,4) not null default 1.28 check (dust_growth > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists server_frontline_fortress_buildings_set_updated_at on public.server_frontline_fortress_buildings;
create trigger server_frontline_fortress_buildings_set_updated_at
before update on public.server_frontline_fortress_buildings
for each row execute function public.set_updated_at();

alter table public.server_frontline_fortress_buildings enable row level security;

revoke all on table public.server_frontline_fortress_buildings from public;
revoke all on table public.server_frontline_fortress_buildings from anon;
revoke all on table public.server_frontline_fortress_buildings from authenticated;

insert into public.server_frontline_fortress_buildings (
  building_id,
  enabled,
  max_level,
  gold_base,
  dust_base,
  gold_growth,
  dust_growth,
  notes
)
values
  ('keep', true, 60, 120, 8, 1.32, 1.28, 'Fortress keep upgrade curve'),
  ('treasury', true, 60, 110, 0, 1.32, 1.28, 'Fortress treasury upgrade curve'),
  ('barracks', true, 60, 130, 6, 1.32, 1.28, 'Fortress barracks upgrade curve')
on conflict (building_id) do update set
  enabled = excluded.enabled,
  max_level = excluded.max_level,
  gold_base = excluded.gold_base,
  dust_base = excluded.dust_base,
  gold_growth = excluded.gold_growth,
  dust_growth = excluded.dust_growth,
  notes = excluded.notes;

create or replace function public.frontline_fortress_building_cost(p_building_id text, p_current_level int)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_building public.server_frontline_fortress_buildings%rowtype;
  v_level int := greatest(coalesce(p_current_level, 1), 1);
begin
  select *
    into v_building
    from public.server_frontline_fortress_buildings
    where building_id = p_building_id
      and enabled = true;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'gold', round(v_building.gold_base * power(v_building.gold_growth, v_level - 1))::int,
    'dust', case
      when v_building.dust_base > 0 then round(v_building.dust_base * power(v_building.dust_growth, v_level - 1))::int
      else 0
    end
  );
end;
$$;

revoke all on function public.frontline_fortress_building_cost(text, int) from public;
grant execute on function public.frontline_fortress_building_cost(text, int) to authenticated;

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
  v_building public.server_frontline_fortress_buildings%rowtype;
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

  select *
    into v_building
    from public.server_frontline_fortress_buildings
    where building_id = p_building_id
      and enabled = true;

  if not found then
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
  if v_current_level >= v_building.max_level then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Fortress building is at max level');
  end if;

  v_cost := public.frontline_fortress_building_cost(p_building_id, v_current_level);
  if v_cost is null then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Unsupported fortress building');
  end if;

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

revoke all on function public.upgrade_frontline_fortress(text, text) from public;
grant execute on function public.upgrade_frontline_fortress(text, text) to authenticated;
