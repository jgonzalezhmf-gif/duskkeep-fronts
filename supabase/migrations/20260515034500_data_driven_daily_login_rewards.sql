-- Duskkeep Fronts - Daily Login usa reward definitions server-side.
-- La RPC decide elegibilidad/streak; el contenido del reward vive en datos.

insert into public.server_reward_definitions (reward_id, enabled, rewards, notes)
values
  ('daily_login_streak_1', true, '{"gold":150}'::jsonb, 'Daily login streak day 1'),
  ('daily_login_streak_2', true, '{"gold":200,"dust":30}'::jsonb, 'Daily login streak day 2'),
  ('daily_login_streak_3', true, '{"gems":25}'::jsonb, 'Daily login streak day 3'),
  ('daily_login_streak_4', true, '{"gold":300,"dust":50}'::jsonb, 'Daily login streak day 4'),
  ('daily_login_streak_5', true, '{"shards":[{"heroId":"mira","amount":4}]}'::jsonb, 'Daily login streak day 5'),
  ('daily_login_streak_6', true, '{"gems":40,"dust":60}'::jsonb, 'Daily login streak day 6'),
  ('daily_login_streak_7', true, '{"gold":1000,"gems":80,"shards":[{"heroId":"noct","amount":5}]}'::jsonb, 'Daily login streak day 7')
on conflict (reward_id) do update set
  enabled = excluded.enabled,
  rewards = excluded.rewards,
  notes = excluded.notes;

create or replace function public.claim_daily_login(
  p_idempotency_key text,
  p_local_day_key text
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
  v_day_key text := to_char(now() at time zone 'utc', 'YYYY-MM-DD');
  v_previous_claim public.daily_login_claims%rowtype;
  v_streak int := 1;
  v_reward_id text;
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

  if p_local_day_key is null or p_local_day_key !~ '^\d{4}-\d{2}-\d{2}$' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid day key');
  end if;

  if p_local_day_key <> v_day_key then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Daily login day does not match server day');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(digest('claimDailyLogin:' || p_local_day_key, 'sha256'), 'hex');

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'claimDailyLogin'
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

  if exists (
    select 1
      from public.daily_login_claims
      where profile_id = v_profile_id
        and day_key = v_day_key
  ) then
    return jsonb_build_object('ok', false, 'code', 'already_claimed', 'reason', 'Daily reward already claimed');
  end if;

  select *
    into v_previous_claim
    from public.daily_login_claims
    where profile_id = v_profile_id
      and day_key < v_day_key
    order by day_key desc
    limit 1;

  if found and v_previous_claim.day_key::date = (v_day_key::date - 1) then
    v_streak := least(v_previous_claim.streak + 1, 7);
  else
    v_streak := 1;
  end if;

  v_reward_id := 'daily_login_streak_' || v_streak::text;

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
    'claimDailyLogin',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  v_reward_result := public.grant_reward_definition(
    v_profile_id,
    v_operation_id,
    'daily_login',
    v_reward_id,
    jsonb_build_object('dayKey', v_day_key, 'streak', v_streak)
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

  insert into public.daily_login_claims (
    profile_id,
    day_key,
    streak,
    rewards,
    claimed_at,
    operation_id
  )
  values (
    v_profile_id,
    v_day_key,
    v_streak,
    v_rewards,
    v_now,
    v_operation_id
  );

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'dayKey', v_day_key,
      'streak', v_streak,
      'rewardId', v_reward_id,
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

revoke all on function public.claim_daily_login(text, text) from public;
grant execute on function public.claim_daily_login(text, text) to authenticated;
