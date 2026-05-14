-- Duskkeep Fronts - Missions data-driven server-authoritative.
-- Ciclo, metrica, target y reward se leen desde catalogo server-side.

create table if not exists public.server_mission_definitions (
  mission_id text primary key check (mission_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  enabled boolean not null default true,
  kind text not null check (kind in ('daily', 'weekly')),
  metric text not null check (metric ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  target int not null check (target > 0 and target <= 100000),
  reward_id text not null references public.server_reward_definitions(reward_id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists server_mission_definitions_set_updated_at on public.server_mission_definitions;
create trigger server_mission_definitions_set_updated_at
before update on public.server_mission_definitions
for each row execute function public.set_updated_at();

alter table public.server_mission_definitions enable row level security;

revoke all on table public.server_mission_definitions from public;
revoke all on table public.server_mission_definitions from anon;
revoke all on table public.server_mission_definitions from authenticated;

insert into public.server_reward_definitions (reward_id, enabled, rewards, notes)
values
  ('mission_d_battles_3', true, '{"gold":100,"dust":20,"accountXp":10}'::jsonb, 'Daily mission reward: win battles'),
  ('mission_d_adv_2', true, '{"gold":150,"gems":5,"accountXp":10}'::jsonb, 'Daily mission reward: clear Adventure nodes'),
  ('mission_d_upgrade_1', true, '{"gold":80,"dust":15}'::jsonb, 'Daily mission reward: upgrade a hero'),
  ('mission_d_arena_1', true, '{"gold":100,"gems":5}'::jsonb, 'Daily mission reward: play Arena'),
  ('mission_w_battles_20', true, '{"gold":1000,"dust":200,"gems":20,"accountXp":50}'::jsonb, 'Weekly mission reward: win battles'),
  ('mission_w_adv_10', true, '{"gold":800,"gems":30,"accountXp":50}'::jsonb, 'Weekly mission reward: clear Adventure nodes'),
  ('mission_w_events_3', true, '{"gold":500,"gems":20}'::jsonb, 'Weekly mission reward: play Events')
on conflict (reward_id) do update set
  enabled = excluded.enabled,
  rewards = excluded.rewards,
  notes = excluded.notes;

insert into public.server_mission_definitions (mission_id, enabled, kind, metric, target, reward_id, notes)
values
  ('d_battles_3', true, 'daily', 'battles_won', 3, 'mission_d_battles_3', 'Win 3 battles'),
  ('d_adv_2', true, 'daily', 'adventure_levels_cleared', 2, 'mission_d_adv_2', 'Clear 2 Adventure nodes'),
  ('d_upgrade_1', true, 'daily', 'heroes_upgraded', 1, 'mission_d_upgrade_1', 'Upgrade 1 hero'),
  ('d_arena_1', true, 'daily', 'arena_battles', 1, 'mission_d_arena_1', 'Play 1 Arena battle'),
  ('w_battles_20', true, 'weekly', 'battles_won', 20, 'mission_w_battles_20', 'Win 20 battles'),
  ('w_adv_10', true, 'weekly', 'adventure_levels_cleared', 10, 'mission_w_adv_10', 'Clear 10 Adventure nodes'),
  ('w_events_3', true, 'weekly', 'events_played', 3, 'mission_w_events_3', 'Play 3 Events')
on conflict (mission_id) do update set
  enabled = excluded.enabled,
  kind = excluded.kind,
  metric = excluded.metric,
  target = excluded.target,
  reward_id = excluded.reward_id,
  notes = excluded.notes;

create or replace function public.mission_cycle_key(p_kind text, p_now timestamptz default now())
returns text
language sql
stable
as $$
  select case
    when p_kind = 'daily' then 'daily:' || to_char(p_now at time zone 'utc', 'YYYY-MM-DD')
    when p_kind = 'weekly' then 'weekly:' || to_char(p_now at time zone 'utc', 'IYYY-IW')
    else null
  end;
$$;

create or replace function public.advance_mission_progress(
  p_profile_id uuid,
  p_metric text,
  p_delta int default 1
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_mission public.server_mission_definitions%rowtype;
  v_cycle_key text;
begin
  if p_profile_id is null or p_delta <= 0 or p_metric is null or trim(p_metric) = '' then
    return;
  end if;

  for v_mission in
    select *
      from public.server_mission_definitions
      where enabled = true
        and metric = p_metric
  loop
    v_cycle_key := public.mission_cycle_key(v_mission.kind);
    if v_cycle_key is not null then
      perform public.upsert_mission_progress(
        p_profile_id,
        v_mission.mission_id,
        v_cycle_key,
        v_mission.target,
        p_delta
      );
    end if;
  end loop;
end;
$$;

create or replace function public.claim_mission_reward(
  p_idempotency_key text,
  p_mission_id text,
  p_cycle_key text
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
  v_expected_cycle_key text;
  v_progress public.missions_progress%rowtype;
  v_mission public.server_mission_definitions%rowtype;
  v_reward_result jsonb;
  v_rewards jsonb := '{}'::jsonb;
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_mission_id is null or trim(p_mission_id) = '' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid mission id');
  end if;

  if p_cycle_key is null or trim(p_cycle_key) = '' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid cycle key');
  end if;

  select *
    into v_mission
    from public.server_mission_definitions
    where mission_id = p_mission_id
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Mission not supported by server yet');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(digest('claimMission:' || p_mission_id || ':' || p_cycle_key, 'sha256'), 'hex');

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'claimMission'
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

  v_expected_cycle_key := public.mission_cycle_key(v_mission.kind, v_now);
  if p_cycle_key <> v_expected_cycle_key then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Mission cycle does not match server cycle');
  end if;

  select *
    into v_progress
    from public.missions_progress
    where profile_id = v_profile_id
      and mission_id = p_mission_id
      and cycle_key = p_cycle_key
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Mission progress not found');
  end if;

  if v_progress.claimed then
    return jsonb_build_object('ok', false, 'code', 'already_claimed', 'reason', 'Mission reward already claimed');
  end if;

  if v_progress.progress < v_mission.target then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Mission is not complete');
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
    'claimMission',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  v_reward_result := public.grant_reward_definition(
    v_profile_id,
    v_operation_id,
    'mission_claim',
    v_mission.reward_id,
    jsonb_build_object('missionId', p_mission_id, 'cycleKey', p_cycle_key)
  );

  if coalesce((v_reward_result ->> 'ok')::boolean, false) is not true then
    update public.server_operations
      set status = 'failed',
          error_code = coalesce(v_reward_result ->> 'code', 'invalid_state'),
          result = v_reward_result,
          completed_at = v_now
      where id = v_operation_id;
    return v_reward_result;
  end if;

  v_rewards := coalesce(v_reward_result -> 'rewardsGranted', '{}'::jsonb);

  update public.missions_progress
    set target = v_mission.target,
        claimed = true,
        claimed_at = v_now,
        updated_at = v_now
    where profile_id = v_profile_id
      and mission_id = p_mission_id
      and cycle_key = p_cycle_key;

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'missionId', p_mission_id,
      'cycleKey', p_cycle_key,
      'rewardId', v_mission.reward_id,
      'rewardsGranted', v_rewards,
      'resources', v_reward_result -> 'resources',
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

revoke all on function public.mission_cycle_key(text, timestamptz) from public;
revoke all on function public.advance_mission_progress(uuid, text, int) from public;
revoke all on function public.claim_mission_reward(text, text, text) from public;
grant execute on function public.claim_mission_reward(text, text, text) to authenticated;
