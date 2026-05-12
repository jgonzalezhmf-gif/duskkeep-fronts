-- Duskkeep Fronts - RPC autoritativa para reclamar recompensas de misiones.
-- No acepta progreso ni rewards del cliente: solo reclama filas existentes
-- en missions_progress para el ciclo server-side actual.

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
  v_resources public.player_resources%rowtype;
  v_target int := 0;
  v_reward_gold int := 0;
  v_reward_dust int := 0;
  v_reward_gems int := 0;
  v_reward_account_xp int := 0;
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

  case p_mission_id
    when 'd_battles_3' then
      v_expected_cycle_key := 'daily:' || to_char(v_now at time zone 'utc', 'YYYY-MM-DD');
      v_target := 3; v_reward_gold := 100; v_reward_dust := 20; v_reward_account_xp := 10;
    when 'd_adv_2' then
      v_expected_cycle_key := 'daily:' || to_char(v_now at time zone 'utc', 'YYYY-MM-DD');
      v_target := 2; v_reward_gold := 150; v_reward_gems := 5; v_reward_account_xp := 10;
    when 'd_upgrade_1' then
      v_expected_cycle_key := 'daily:' || to_char(v_now at time zone 'utc', 'YYYY-MM-DD');
      v_target := 1; v_reward_gold := 80; v_reward_dust := 15;
    when 'd_arena_1' then
      v_expected_cycle_key := 'daily:' || to_char(v_now at time zone 'utc', 'YYYY-MM-DD');
      v_target := 1; v_reward_gold := 100; v_reward_gems := 5;
    when 'w_battles_20' then
      v_expected_cycle_key := 'weekly:' || to_char(v_now at time zone 'utc', 'IYYY-IW');
      v_target := 20; v_reward_gold := 1000; v_reward_dust := 200; v_reward_gems := 20; v_reward_account_xp := 50;
    when 'w_adv_10' then
      v_expected_cycle_key := 'weekly:' || to_char(v_now at time zone 'utc', 'IYYY-IW');
      v_target := 10; v_reward_gold := 800; v_reward_gems := 30; v_reward_account_xp := 50;
    when 'w_events_3' then
      v_expected_cycle_key := 'weekly:' || to_char(v_now at time zone 'utc', 'IYYY-IW');
      v_target := 3; v_reward_gold := 500; v_reward_gems := 20;
    else
      return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Mission not supported by server yet');
  end case;

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

  if v_progress.target <> v_target or v_progress.progress < v_target then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Mission is not complete');
  end if;

  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
  end if;

  v_rewards := jsonb_strip_nulls(jsonb_build_object(
    'gold', nullif(v_reward_gold, 0),
    'dust', nullif(v_reward_dust, 0),
    'gems', nullif(v_reward_gems, 0),
    'accountXp', nullif(v_reward_account_xp, 0)
  ));

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

  update public.player_resources
    set gold = gold + v_reward_gold,
        dust = dust + v_reward_dust,
        gems = gems + v_reward_gems
    where profile_id = v_profile_id
    returning * into v_resources;

  update public.profiles
    set account_xp = account_xp + v_reward_account_xp
    where id = v_profile_id;

  update public.missions_progress
    set claimed = true,
        claimed_at = v_now,
        updated_at = v_now
    where profile_id = v_profile_id
      and mission_id = p_mission_id
      and cycle_key = p_cycle_key;

  if v_reward_gold > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'mission_claim', 'gold', v_reward_gold, v_resources.gold, jsonb_build_object('missionId', p_mission_id, 'cycleKey', p_cycle_key));
  end if;

  if v_reward_dust > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'mission_claim', 'dust', v_reward_dust, v_resources.dust, jsonb_build_object('missionId', p_mission_id, 'cycleKey', p_cycle_key));
  end if;

  if v_reward_gems > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'mission_claim', 'gems', v_reward_gems, v_resources.gems, jsonb_build_object('missionId', p_mission_id, 'cycleKey', p_cycle_key));
  end if;

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'missionId', p_mission_id,
      'cycleKey', p_cycle_key,
      'rewardsGranted', v_rewards,
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

revoke all on function public.claim_mission_reward(text, text, text) from public;
grant execute on function public.claim_mission_reward(text, text, text) to authenticated;
