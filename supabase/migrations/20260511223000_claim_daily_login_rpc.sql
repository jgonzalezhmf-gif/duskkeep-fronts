-- Duskkeep Fronts - RPC autoritativa para recompensa diaria.
-- Usa dia UTC del servidor, claim unico por dia e idempotencia.

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
  v_resources public.player_resources%rowtype;
  v_streak int := 1;
  v_reward_gold int := 0;
  v_reward_dust int := 0;
  v_reward_gems int := 0;
  v_reward_shard_hero text;
  v_reward_shard_amount int := 0;
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

  case v_streak
    when 1 then
      v_reward_gold := 150;
    when 2 then
      v_reward_gold := 200; v_reward_dust := 30;
    when 3 then
      v_reward_gems := 25;
    when 4 then
      v_reward_gold := 300; v_reward_dust := 50;
    when 5 then
      v_reward_shard_hero := 'mira'; v_reward_shard_amount := 4;
    when 6 then
      v_reward_gems := 40; v_reward_dust := 60;
    when 7 then
      v_reward_gold := 1000; v_reward_gems := 80; v_reward_shard_hero := 'noct'; v_reward_shard_amount := 5;
  end case;

  v_rewards := jsonb_strip_nulls(jsonb_build_object(
    'gold', nullif(v_reward_gold, 0),
    'dust', nullif(v_reward_dust, 0),
    'gems', nullif(v_reward_gems, 0),
    'shards', case when v_reward_shard_amount > 0 then jsonb_build_array(jsonb_build_object('heroId', v_reward_shard_hero, 'amount', v_reward_shard_amount)) end
  ));

  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
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
    'claimDailyLogin',
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

  if v_reward_gold > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'daily_login', 'gold', v_reward_gold, v_resources.gold, jsonb_build_object('dayKey', v_day_key, 'streak', v_streak));
  end if;

  if v_reward_dust > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'daily_login', 'dust', v_reward_dust, v_resources.dust, jsonb_build_object('dayKey', v_day_key, 'streak', v_streak));
  end if;

  if v_reward_gems > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'daily_login', 'gems', v_reward_gems, v_resources.gems, jsonb_build_object('dayKey', v_day_key, 'streak', v_streak));
  end if;

  if v_reward_shard_amount > 0 then
    insert into public.player_heroes (profile_id, hero_id, shards, unlocked)
    values (v_profile_id, v_reward_shard_hero, v_reward_shard_amount, false)
    on conflict (profile_id, hero_id)
    do update set
      shards = public.player_heroes.shards + excluded.shards,
      updated_at = v_now;
  end if;

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

revoke all on function public.claim_daily_login(text, text) from public;
grant execute on function public.claim_daily_login(text, text) to authenticated;
