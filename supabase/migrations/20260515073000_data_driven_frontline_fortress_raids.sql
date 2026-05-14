-- Duskkeep Fronts - Frontline Fortress raids data-driven.
-- Externaliza puntuacion de heroes, formula de raid, rewards y cooldown en catalogos internos.

create table if not exists public.server_frontline_fortress_hero_scores (
  hero_id text primary key check (hero_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  enabled boolean not null default true,
  base_hp int not null check (base_hp >= 0 and base_hp <= 100000),
  base_atk int not null check (base_atk >= 0 and base_atk <= 100000),
  base_def int not null check (base_def >= 0 and base_def <= 100000),
  base_speed int not null check (base_speed >= 0 and base_speed <= 100000),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists server_frontline_fortress_hero_scores_set_updated_at on public.server_frontline_fortress_hero_scores;
create trigger server_frontline_fortress_hero_scores_set_updated_at
before update on public.server_frontline_fortress_hero_scores
for each row execute function public.set_updated_at();

alter table public.server_frontline_fortress_hero_scores enable row level security;

revoke all on table public.server_frontline_fortress_hero_scores from public;
revoke all on table public.server_frontline_fortress_hero_scores from anon;
revoke all on table public.server_frontline_fortress_hero_scores from authenticated;

insert into public.server_frontline_fortress_hero_scores (
  hero_id,
  enabled,
  base_hp,
  base_atk,
  base_def,
  base_speed,
  notes
)
values
  ('bran', true, 22, 4, 3, 2, 'Starter guard fortress presence'),
  ('kara', true, 16, 7, 1, 5, 'Starter ranger fortress presence'),
  ('vex', true, 14, 6, 1, 4, 'Starter rogue fortress presence'),
  ('mira', true, 18, 4, 2, 3, 'Starter healer fortress presence'),
  ('drak', true, 15, 8, 1, 6, 'Starter duelist fortress presence'),
  ('tovi', true, 17, 4, 2, 3, 'Starter support fortress presence')
on conflict (hero_id) do update set
  enabled = excluded.enabled,
  base_hp = excluded.base_hp,
  base_atk = excluded.base_atk,
  base_def = excluded.base_def,
  base_speed = excluded.base_speed,
  notes = excluded.notes;

create table if not exists public.server_frontline_fortress_raid_profiles (
  raid_profile_id text primary key check (raid_profile_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  enabled boolean not null default true,
  cooldown_hours int not null default 8 check (cooldown_hours > 0 and cooldown_hours <= 168),
  defense_keep_weight numeric(10,4) not null default 10 check (defense_keep_weight >= 0),
  defense_treasury_weight numeric(10,4) not null default 4 check (defense_treasury_weight >= 0),
  defense_barracks_weight numeric(10,4) not null default 12 check (defense_barracks_weight >= 0),
  defense_integrity_weight numeric(10,4) not null default 0.25 check (defense_integrity_weight >= 0),
  hero_base_weight numeric(10,4) not null default 0.22 check (hero_base_weight >= 0),
  hero_barracks_weight numeric(10,4) not null default 0.05 check (hero_barracks_weight >= 0),
  attack_base int not null default 44 check (attack_base >= 0),
  attack_per_resolved_raid numeric(10,4) not null default 7 check (attack_per_resolved_raid >= 0),
  attack_account_level_weight numeric(10,4) not null default 4 check (attack_account_level_weight >= 0),
  attack_keep_weight numeric(10,4) not null default 2 check (attack_keep_weight >= 0),
  attack_barracks_weight numeric(10,4) not null default 2 check (attack_barracks_weight >= 0),
  attack_tempo_weight numeric(10,4) not null default 3 check (attack_tempo_weight >= 0),
  attack_tempo_days int not null default 5 check (attack_tempo_days > 0 and attack_tempo_days <= 365),
  full_repel_margin int not null default 10,
  partial_hold_margin int not null default -12,
  partial_integrity_delta int not null default -12 check (partial_integrity_delta between -100 and 0),
  breach_integrity_delta int not null default -26 check (breach_integrity_delta between -100 and 0),
  reward_gold_base int not null default 60 check (reward_gold_base >= 0),
  reward_gold_treasury_weight numeric(10,4) not null default 35 check (reward_gold_treasury_weight >= 0),
  reward_dust_base int not null default 6 check (reward_dust_base >= 0),
  reward_dust_keep_weight numeric(10,4) not null default 2 check (reward_dust_keep_weight >= 0),
  reward_gems_treasury_level_2 int not null default 1 check (reward_gems_treasury_level_2 >= 0),
  reward_gems_treasury_level_3 int not null default 2 check (reward_gems_treasury_level_3 >= 0),
  partial_gold_multiplier numeric(10,4) not null default 0.75 check (partial_gold_multiplier >= 0 and partial_gold_multiplier <= 1),
  partial_dust_multiplier numeric(10,4) not null default 0.75 check (partial_dust_multiplier >= 0 and partial_dust_multiplier <= 1),
  partial_min_gems_if_any int not null default 1 check (partial_min_gems_if_any >= 0),
  breach_gold_multiplier numeric(10,4) not null default 0.45 check (breach_gold_multiplier >= 0 and breach_gold_multiplier <= 1),
  breach_dust_multiplier numeric(10,4) not null default 0.5 check (breach_dust_multiplier >= 0 and breach_dust_multiplier <= 1),
  breach_gems_reward int not null default 0 check (breach_gems_reward >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists server_frontline_fortress_raid_profiles_set_updated_at on public.server_frontline_fortress_raid_profiles;
create trigger server_frontline_fortress_raid_profiles_set_updated_at
before update on public.server_frontline_fortress_raid_profiles
for each row execute function public.set_updated_at();

alter table public.server_frontline_fortress_raid_profiles enable row level security;

revoke all on table public.server_frontline_fortress_raid_profiles from public;
revoke all on table public.server_frontline_fortress_raid_profiles from anon;
revoke all on table public.server_frontline_fortress_raid_profiles from authenticated;

insert into public.server_frontline_fortress_raid_profiles (
  raid_profile_id,
  enabled,
  cooldown_hours,
  defense_keep_weight,
  defense_treasury_weight,
  defense_barracks_weight,
  defense_integrity_weight,
  hero_base_weight,
  hero_barracks_weight,
  attack_base,
  attack_per_resolved_raid,
  attack_account_level_weight,
  attack_keep_weight,
  attack_barracks_weight,
  attack_tempo_weight,
  attack_tempo_days,
  full_repel_margin,
  partial_hold_margin,
  partial_integrity_delta,
  breach_integrity_delta,
  reward_gold_base,
  reward_gold_treasury_weight,
  reward_dust_base,
  reward_dust_keep_weight,
  reward_gems_treasury_level_2,
  reward_gems_treasury_level_3,
  partial_gold_multiplier,
  partial_dust_multiplier,
  partial_min_gems_if_any,
  breach_gold_multiplier,
  breach_dust_multiplier,
  breach_gems_reward,
  notes
)
values (
  'default',
  true,
  8,
  10,
  4,
  12,
  0.25,
  0.22,
  0.05,
  44,
  7,
  4,
  2,
  2,
  3,
  5,
  10,
  -12,
  -12,
  -26,
  60,
  35,
  6,
  2,
  1,
  2,
  0.75,
  0.75,
  1,
  0.45,
  0.5,
  0,
  'Default Fortress raid formula'
)
on conflict (raid_profile_id) do update set
  enabled = excluded.enabled,
  cooldown_hours = excluded.cooldown_hours,
  defense_keep_weight = excluded.defense_keep_weight,
  defense_treasury_weight = excluded.defense_treasury_weight,
  defense_barracks_weight = excluded.defense_barracks_weight,
  defense_integrity_weight = excluded.defense_integrity_weight,
  hero_base_weight = excluded.hero_base_weight,
  hero_barracks_weight = excluded.hero_barracks_weight,
  attack_base = excluded.attack_base,
  attack_per_resolved_raid = excluded.attack_per_resolved_raid,
  attack_account_level_weight = excluded.attack_account_level_weight,
  attack_keep_weight = excluded.attack_keep_weight,
  attack_barracks_weight = excluded.attack_barracks_weight,
  attack_tempo_weight = excluded.attack_tempo_weight,
  attack_tempo_days = excluded.attack_tempo_days,
  full_repel_margin = excluded.full_repel_margin,
  partial_hold_margin = excluded.partial_hold_margin,
  partial_integrity_delta = excluded.partial_integrity_delta,
  breach_integrity_delta = excluded.breach_integrity_delta,
  reward_gold_base = excluded.reward_gold_base,
  reward_gold_treasury_weight = excluded.reward_gold_treasury_weight,
  reward_dust_base = excluded.reward_dust_base,
  reward_dust_keep_weight = excluded.reward_dust_keep_weight,
  reward_gems_treasury_level_2 = excluded.reward_gems_treasury_level_2,
  reward_gems_treasury_level_3 = excluded.reward_gems_treasury_level_3,
  partial_gold_multiplier = excluded.partial_gold_multiplier,
  partial_dust_multiplier = excluded.partial_dust_multiplier,
  partial_min_gems_if_any = excluded.partial_min_gems_if_any,
  breach_gold_multiplier = excluded.breach_gold_multiplier,
  breach_dust_multiplier = excluded.breach_dust_multiplier,
  breach_gems_reward = excluded.breach_gems_reward,
  notes = excluded.notes;

create or replace function public.frontline_fortress_hero_presence_score(
  p_profile_id uuid,
  p_hero_id text
)
returns numeric
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_hero public.server_frontline_fortress_hero_scores%rowtype;
  v_level int;
  v_stars int;
  v_level_bonus int;
  v_star_bonus int;
begin
  select *
    into v_hero
    from public.server_frontline_fortress_hero_scores
    where hero_id = p_hero_id
      and enabled = true;

  if not found then
    return 0;
  end if;

  select h.level, h.stars
    into v_level, v_stars
    from public.player_heroes h
    where h.profile_id = p_profile_id
      and h.hero_id = p_hero_id
      and h.unlocked = true;

  if not found then
    return 0;
  end if;

  v_level_bonus := greatest(v_level - 1, 0);
  v_star_bonus := greatest(v_stars - 1, 0);

  return
    (v_hero.base_hp + v_level_bonus + v_star_bonus * 3)
    + (v_hero.base_atk + floor((v_level_bonus + 1) / 3)::int + v_star_bonus) * 2
    + (v_hero.base_def + floor(v_level_bonus / 4)::int + floor((v_star_bonus + 1) / 2)::int) * 2
    + (v_hero.base_speed + floor(v_star_bonus / 3)::int);
end;
$$;

revoke all on function public.frontline_fortress_hero_presence_score(uuid, text) from public;
revoke all on function public.frontline_fortress_hero_presence_score(uuid, text) from authenticated;

create or replace function public.resolve_frontline_fortress_raid(
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_rule public.server_frontline_fortress_raid_profiles%rowtype;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_result jsonb;
  v_reward_result jsonb;
  v_fortress public.player_frontline_fortress%rowtype;
  v_keep int;
  v_treasury int;
  v_barracks int;
  v_account_level int;
  v_hero_power int := 0;
  v_defense_power int;
  v_attack_power int;
  v_raid_tempo int;
  v_outcome text;
  v_integrity_delta int := 0;
  v_rewards jsonb;
  v_gold_reward int := 0;
  v_dust_reward int := 0;
  v_gems_reward int := 0;
  v_report jsonb;
  v_snapshot jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  select *
    into v_rule
    from public.server_frontline_fortress_raid_profiles
    where raid_profile_id = 'default'
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Fortress raid profile is unavailable');
  end if;

  select id, account_level
    into v_profile_id, v_account_level
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(digest('resolveFrontlineFortressRaid', 'sha256'), 'hex');

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'resolveFrontlineFortressRaid'
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
    into v_fortress
    from public.player_frontline_fortress
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Fortress state not found');
  end if;

  if v_fortress.next_attack_at is not null and v_fortress.next_attack_at > v_now then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Fortress raid is not ready');
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
    'resolveFrontlineFortressRaid',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now
  );

  v_keep := coalesce((v_fortress.buildings ->> 'keep')::int, 1);
  v_treasury := coalesce((v_fortress.buildings ->> 'treasury')::int, 1);
  v_barracks := coalesce((v_fortress.buildings ->> 'barracks')::int, 1);

  select coalesce(sum(round(public.frontline_fortress_hero_presence_score(v_profile_id, value #>> '{}') * (v_rule.hero_base_weight + v_barracks * v_rule.hero_barracks_weight)))::int, 0)
    into v_hero_power
    from jsonb_array_elements(v_fortress.garrison)
    where value <> 'null'::jsonb;

  v_defense_power := round(
    v_keep * v_rule.defense_keep_weight
    + v_treasury * v_rule.defense_treasury_weight
    + v_barracks * v_rule.defense_barracks_weight
    + coalesce(v_hero_power, 0)
    + v_fortress.integrity * v_rule.defense_integrity_weight
  )::int;
  v_raid_tempo := mod(floor(extract(epoch from v_now) / 86400)::int, v_rule.attack_tempo_days);
  v_attack_power := round(
    v_rule.attack_base
    + v_fortress.raids_resolved * v_rule.attack_per_resolved_raid
    + v_account_level * v_rule.attack_account_level_weight
    + v_keep * v_rule.attack_keep_weight
    + v_barracks * v_rule.attack_barracks_weight
    + v_raid_tempo * v_rule.attack_tempo_weight
  )::int;

  if v_defense_power >= v_attack_power + v_rule.full_repel_margin then
    v_outcome := 'full_repel';
    v_integrity_delta := 0;
  elsif v_defense_power >= v_attack_power + v_rule.partial_hold_margin then
    v_outcome := 'partial_hold';
    v_integrity_delta := v_rule.partial_integrity_delta;
  else
    v_outcome := 'breach';
    v_integrity_delta := v_rule.breach_integrity_delta;
  end if;

  v_gold_reward := round(v_rule.reward_gold_base + v_treasury * v_rule.reward_gold_treasury_weight)::int;
  v_dust_reward := round(v_rule.reward_dust_base + v_keep * v_rule.reward_dust_keep_weight)::int;
  v_gems_reward := case
    when v_treasury >= 3 then v_rule.reward_gems_treasury_level_3
    when v_treasury >= 2 then v_rule.reward_gems_treasury_level_2
    else 0
  end;

  if v_outcome = 'partial_hold' then
    v_gold_reward := floor(v_gold_reward * v_rule.partial_gold_multiplier)::int;
    v_dust_reward := floor(v_dust_reward * v_rule.partial_dust_multiplier)::int;
    v_gems_reward := case when v_gems_reward > 0 then v_rule.partial_min_gems_if_any else 0 end;
  elsif v_outcome = 'breach' then
    v_gold_reward := floor(v_gold_reward * v_rule.breach_gold_multiplier)::int;
    v_dust_reward := floor(v_dust_reward * v_rule.breach_dust_multiplier)::int;
    v_gems_reward := v_rule.breach_gems_reward;
  end if;

  v_rewards := jsonb_build_object('gold', v_gold_reward, 'dust', v_dust_reward, 'gems', v_gems_reward);
  v_report := jsonb_build_object(
    'resolvedAt', v_now,
    'outcome', v_outcome,
    'attackPower', v_attack_power,
    'defensePower', v_defense_power,
    'integrityDelta', v_integrity_delta,
    'rewards', v_rewards
  );

  v_reward_result := public.grant_reward_bundle(
    v_profile_id,
    v_operation_id,
    'frontline_fortress_raid',
    v_rewards,
    jsonb_build_object('outcome', v_outcome, 'raidProfileId', v_rule.raid_profile_id)
  );

  if coalesce((v_reward_result ->> 'ok')::boolean, false) is not true then
    return v_reward_result;
  end if;

  update public.player_frontline_fortress
    set integrity = least(100, greatest(0, integrity + v_integrity_delta)),
        last_resolved_at = v_now,
        next_attack_at = v_now + make_interval(hours => v_rule.cooldown_hours),
        raids_resolved = raids_resolved + 1
    where profile_id = v_profile_id
    returning * into v_fortress;

  v_snapshot := jsonb_set(public.frontline_fortress_snapshot(v_profile_id), '{lastReport}', v_report, true);

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'report', v_report,
      'resources', v_reward_result -> 'resources',
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

revoke all on function public.resolve_frontline_fortress_raid(text) from public;
grant execute on function public.resolve_frontline_fortress_raid(text) to authenticated;
