-- Duskkeep Fronts - Hero progression data-driven.
-- Externaliza heroes upgradeables, limites y costes de level/star/skill en catalogos internos.

create table if not exists public.server_upgradeable_heroes (
  hero_id text primary key check (hero_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  enabled boolean not null default true,
  max_level int not null default 60 check (max_level >= 1 and max_level <= 1000),
  max_stars int not null default 6 check (max_stars >= 1 and max_stars <= 20),
  max_skill_level int not null default 5 check (max_skill_level >= 1 and max_skill_level <= 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists server_upgradeable_heroes_set_updated_at on public.server_upgradeable_heroes;
create trigger server_upgradeable_heroes_set_updated_at
before update on public.server_upgradeable_heroes
for each row execute function public.set_updated_at();

alter table public.server_upgradeable_heroes enable row level security;

revoke all on table public.server_upgradeable_heroes from public;
revoke all on table public.server_upgradeable_heroes from anon;
revoke all on table public.server_upgradeable_heroes from authenticated;

insert into public.server_upgradeable_heroes (hero_id, enabled, max_level, max_stars, max_skill_level, notes)
values
  ('bran', true, 60, 6, 5, 'Upgradeable hero'),
  ('kara', true, 60, 6, 5, 'Upgradeable hero'),
  ('vex', true, 60, 6, 5, 'Upgradeable hero'),
  ('lyria', true, 60, 6, 5, 'Upgradeable hero'),
  ('mira', true, 60, 6, 5, 'Upgradeable hero'),
  ('drak', true, 60, 6, 5, 'Upgradeable hero'),
  ('morr', true, 60, 6, 5, 'Upgradeable hero'),
  ('ursa', true, 60, 6, 5, 'Upgradeable hero'),
  ('fenra', true, 60, 6, 5, 'Upgradeable hero'),
  ('sol', true, 60, 6, 5, 'Upgradeable hero'),
  ('noct', true, 60, 6, 5, 'Upgradeable hero'),
  ('ren', true, 60, 6, 5, 'Upgradeable hero'),
  ('tovi', true, 60, 6, 5, 'Upgradeable hero'),
  ('grom', true, 60, 6, 5, 'Upgradeable hero')
on conflict (hero_id) do update set
  enabled = excluded.enabled,
  max_level = excluded.max_level,
  max_stars = excluded.max_stars,
  max_skill_level = excluded.max_skill_level,
  notes = excluded.notes;

create table if not exists public.server_hero_upgrade_costs (
  upgrade_kind text not null check (upgrade_kind in ('level', 'star', 'skill')),
  current_value int not null check (current_value >= 1 and current_value <= 1000),
  enabled boolean not null default true,
  cost_gold int not null default 0 check (cost_gold >= 0 and cost_gold <= 10000000),
  cost_dust int not null default 0 check (cost_dust >= 0 and cost_dust <= 10000000),
  cost_shards int not null default 0 check (cost_shards >= 0 and cost_shards <= 10000000),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (upgrade_kind, current_value)
);

drop trigger if exists server_hero_upgrade_costs_set_updated_at on public.server_hero_upgrade_costs;
create trigger server_hero_upgrade_costs_set_updated_at
before update on public.server_hero_upgrade_costs
for each row execute function public.set_updated_at();

alter table public.server_hero_upgrade_costs enable row level security;

revoke all on table public.server_hero_upgrade_costs from public;
revoke all on table public.server_hero_upgrade_costs from anon;
revoke all on table public.server_hero_upgrade_costs from authenticated;

insert into public.server_hero_upgrade_costs (upgrade_kind, current_value, enabled, cost_gold, cost_dust, cost_shards, notes)
select
  'level',
  level_value,
  true,
  50 + level_value * 25,
  0,
  0,
  'Hero level up gold cost'
from generate_series(1, 59) as level_value
on conflict (upgrade_kind, current_value) do update set
  enabled = excluded.enabled,
  cost_gold = excluded.cost_gold,
  cost_dust = excluded.cost_dust,
  cost_shards = excluded.cost_shards,
  notes = excluded.notes;

insert into public.server_hero_upgrade_costs (upgrade_kind, current_value, enabled, cost_gold, cost_dust, cost_shards, notes)
values
  ('star', 1, true, 0, 0, 10, 'Hero 1 to 2 stars shard cost'),
  ('star', 2, true, 0, 0, 20, 'Hero 2 to 3 stars shard cost'),
  ('star', 3, true, 0, 0, 40, 'Hero 3 to 4 stars shard cost'),
  ('star', 4, true, 0, 0, 80, 'Hero 4 to 5 stars shard cost'),
  ('star', 5, true, 0, 0, 160, 'Hero 5 to 6 stars shard cost'),
  ('skill', 1, true, 0, 100, 0, 'Hero skill 1 to 2 dust cost'),
  ('skill', 2, true, 0, 250, 0, 'Hero skill 2 to 3 dust cost'),
  ('skill', 3, true, 0, 500, 0, 'Hero skill 3 to 4 dust cost'),
  ('skill', 4, true, 0, 1000, 0, 'Hero skill 4 to 5 dust cost')
on conflict (upgrade_kind, current_value) do update set
  enabled = excluded.enabled,
  cost_gold = excluded.cost_gold,
  cost_dust = excluded.cost_dust,
  cost_shards = excluded.cost_shards,
  notes = excluded.notes;

create or replace function public.hero_upgrade_cost(p_upgrade_kind text, p_current_value int)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_cost public.server_hero_upgrade_costs%rowtype;
begin
  select *
    into v_cost
    from public.server_hero_upgrade_costs
    where upgrade_kind = p_upgrade_kind
      and current_value = p_current_value
      and enabled = true;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'gold', v_cost.cost_gold,
    'dust', v_cost.cost_dust,
    'shards', v_cost.cost_shards
  );
end;
$$;

revoke all on function public.hero_upgrade_cost(text, int) from public;
revoke all on function public.hero_upgrade_cost(text, int) from authenticated;

create or replace function public.level_up_hero(
  p_idempotency_key text,
  p_hero_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_hero_rule public.server_upgradeable_heroes%rowtype;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_resources public.player_resources%rowtype;
  v_hero public.player_heroes%rowtype;
  v_cost jsonb;
  v_cost_gold int;
  v_next_level int;
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_hero_id is null or trim(p_hero_id) = '' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid hero id');
  end if;

  select *
    into v_hero_rule
    from public.server_upgradeable_heroes
    where hero_id = trim(p_hero_id)
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Hero is not upgradeable');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(digest('levelUpHero:' || trim(p_hero_id), 'sha256'), 'hex');

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'levelUpHero'
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

  select *
    into v_hero
    from public.player_heroes
    where profile_id = v_profile_id
      and hero_id = trim(p_hero_id)
    for update;

  if not found or v_hero.unlocked is not true or v_hero.stars <= 0 then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Hero is locked');
  end if;

  if v_hero.level >= v_hero_rule.max_level then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Hero is already at max level');
  end if;

  v_cost := public.hero_upgrade_cost('level', v_hero.level);
  if v_cost is null then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Hero level cost is unavailable');
  end if;

  v_cost_gold := coalesce((v_cost ->> 'gold')::int, 0);
  v_next_level := v_hero.level + 1;

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
    'levelUpHero',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  update public.player_resources
    set gold = gold - v_cost_gold
    where profile_id = v_profile_id
    returning * into v_resources;

  update public.player_heroes
    set level = v_next_level,
        updated_at = v_now
    where profile_id = v_profile_id
      and hero_id = trim(p_hero_id);

  insert into public.resource_ledger (
    profile_id,
    operation_id,
    source,
    resource,
    delta,
    balance_after,
    metadata
  )
  values (
    v_profile_id,
    v_operation_id,
    'hero_level_up',
    'gold',
    -v_cost_gold,
    v_resources.gold,
    jsonb_build_object('heroId', trim(p_hero_id), 'level', v_next_level)
  );

  perform public.advance_mission_progress(v_profile_id, 'heroes_upgraded', 1);

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'heroId', trim(p_hero_id),
      'level', v_next_level,
      'costPaid', jsonb_build_object('gold', v_cost_gold),
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      )
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

revoke all on function public.level_up_hero(text, text) from public;
grant execute on function public.level_up_hero(text, text) to authenticated;

create or replace function public.star_up_hero(
  p_idempotency_key text,
  p_hero_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_hero_rule public.server_upgradeable_heroes%rowtype;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_resources public.player_resources%rowtype;
  v_hero public.player_heroes%rowtype;
  v_cost jsonb;
  v_shards_needed int;
  v_next_stars int;
  v_next_shards int;
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_hero_id is null or trim(p_hero_id) = '' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid hero id');
  end if;

  select *
    into v_hero_rule
    from public.server_upgradeable_heroes
    where hero_id = trim(p_hero_id)
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Hero is not upgradeable');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(digest('starUpHero:' || trim(p_hero_id), 'sha256'), 'hex');

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'starUpHero'
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

  select *
    into v_hero
    from public.player_heroes
    where profile_id = v_profile_id
      and hero_id = trim(p_hero_id)
    for update;

  if not found or v_hero.unlocked is not true or v_hero.stars <= 0 then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Hero is locked');
  end if;

  if v_hero.stars >= v_hero_rule.max_stars then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Hero is already at max stars');
  end if;

  v_cost := public.hero_upgrade_cost('star', v_hero.stars);
  if v_cost is null then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Hero star cost is unavailable');
  end if;

  v_shards_needed := coalesce((v_cost ->> 'shards')::int, 0);

  if v_hero.shards < v_shards_needed then
    return jsonb_build_object('ok', false, 'code', 'insufficient_resources', 'reason', 'Not enough shards');
  end if;

  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
  end if;

  v_next_stars := v_hero.stars + 1;
  v_next_shards := v_hero.shards - v_shards_needed;

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
    'starUpHero',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  update public.player_heroes
    set stars = v_next_stars,
        shards = v_next_shards,
        updated_at = v_now
    where profile_id = v_profile_id
      and hero_id = trim(p_hero_id);

  perform public.advance_mission_progress(v_profile_id, 'heroes_upgraded', 1);

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'heroId', trim(p_hero_id),
      'stars', v_next_stars,
      'shards', v_next_shards,
      'shardsSpent', v_shards_needed,
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      )
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

revoke all on function public.star_up_hero(text, text) from public;
grant execute on function public.star_up_hero(text, text) to authenticated;

create or replace function public.skill_up_hero(
  p_idempotency_key text,
  p_hero_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_hero_rule public.server_upgradeable_heroes%rowtype;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_resources public.player_resources%rowtype;
  v_hero public.player_heroes%rowtype;
  v_cost jsonb;
  v_cost_dust int;
  v_next_skill_level int;
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_hero_id is null or trim(p_hero_id) = '' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid hero id');
  end if;

  select *
    into v_hero_rule
    from public.server_upgradeable_heroes
    where hero_id = trim(p_hero_id)
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Hero is not upgradeable');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(digest('skillUpHero:' || trim(p_hero_id), 'sha256'), 'hex');

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'skillUpHero'
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

  select *
    into v_hero
    from public.player_heroes
    where profile_id = v_profile_id
      and hero_id = trim(p_hero_id)
    for update;

  if not found or v_hero.unlocked is not true or v_hero.stars <= 0 then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Hero is locked');
  end if;

  if v_hero.skill_level >= v_hero_rule.max_skill_level then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Skill already at max level');
  end if;

  v_cost := public.hero_upgrade_cost('skill', v_hero.skill_level);
  if v_cost is null then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Hero skill cost is unavailable');
  end if;

  v_cost_dust := coalesce((v_cost ->> 'dust')::int, 0);
  v_next_skill_level := v_hero.skill_level + 1;

  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
  end if;

  if v_resources.dust < v_cost_dust then
    return jsonb_build_object('ok', false, 'code', 'insufficient_resources', 'reason', 'Not enough Arcane Dust');
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
    'skillUpHero',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  update public.player_resources
    set dust = dust - v_cost_dust
    where profile_id = v_profile_id
    returning * into v_resources;

  update public.player_heroes
    set skill_level = v_next_skill_level,
        updated_at = v_now
    where profile_id = v_profile_id
      and hero_id = trim(p_hero_id);

  insert into public.resource_ledger (
    profile_id,
    operation_id,
    source,
    resource,
    delta,
    balance_after,
    metadata
  )
  values (
    v_profile_id,
    v_operation_id,
    'hero_skill_up',
    'dust',
    -v_cost_dust,
    v_resources.dust,
    jsonb_build_object('heroId', trim(p_hero_id), 'skillLevel', v_next_skill_level)
  );

  perform public.advance_mission_progress(v_profile_id, 'heroes_upgraded', 1);

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'heroId', trim(p_hero_id),
      'skillLevel', v_next_skill_level,
      'costPaid', jsonb_build_object('dust', v_cost_dust),
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      )
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

revoke all on function public.skill_up_hero(text, text) from public;
grant execute on function public.skill_up_hero(text, text) to authenticated;
