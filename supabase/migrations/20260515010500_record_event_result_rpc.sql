-- Duskkeep Fronts - resultado autoritativo MVP para Events.
-- El cliente no envia rewards finales; el servidor valida evento, unlock,
-- daily first-clear y concede solo el payout permitido.

create or replace function public.record_event_result(
  p_idempotency_key text,
  p_event_id text,
  p_battle_seed bigint,
  p_winner text,
  p_turns int,
  p_battle_summary jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_account_level int;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_today_utc date := (now() at time zone 'utc')::date;
  v_resources public.player_resources%rowtype;
  v_preset_id text;
  v_unlock_level int;
  v_first_clear boolean := false;
  v_reward_gold int := 0;
  v_reward_dust int := 0;
  v_reward_gems int := 0;
  v_reward_xp int := 0;
  v_reward_account_xp int := 0;
  v_shard_hero text;
  v_shard_amount int := 0;
  v_rewards jsonb;
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_winner not in ('ally', 'enemy', 'draw') then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid winner');
  end if;

  if p_turns is null or p_turns < 0 or p_turns > 500 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid turn count');
  end if;

  case p_event_id
    when 'gold_rush' then
      v_preset_id := 'bonewood_raiders';
      v_unlock_level := 4;
      v_reward_gold := 400; v_reward_xp := 60; v_reward_account_xp := 12;
    when 'arcane_surge' then
      v_preset_id := 'plague_pack';
      v_unlock_level := 8;
      v_reward_gold := 150; v_reward_dust := 120; v_reward_xp := 60; v_reward_account_xp := 12;
    when 'td_fortress_siege' then
      v_preset_id := 'ember_court';
      v_unlock_level := 6;
      v_reward_gold := 300; v_reward_dust := 50; v_reward_account_xp := 20;
      v_reward_gems := 50; v_shard_hero := 'ursa'; v_shard_amount := 4;
    else
      return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Event operation not supported');
  end case;

  select id, account_level
    into v_profile_id, v_account_level
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  if v_account_level < v_unlock_level then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Event operation is locked');
  end if;

  v_payload_hash := encode(
    digest(
      'recordEventResult:'
      || p_event_id || ':'
      || p_battle_seed::text || ':'
      || p_winner || ':'
      || p_turns::text || ':'
      || coalesce(p_battle_summary, '{}'::jsonb)::text,
      'sha256'
    ),
    'hex'
  );

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'recordEventResult'
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

  v_first_clear := p_winner = 'ally' and not exists (
    select 1
      from public.battle_results
      where profile_id = v_profile_id
        and source = 'event'
        and event_id = p_event_id
        and winner = 'ally'
        and (created_at at time zone 'utc')::date = v_today_utc
  );

  if not v_first_clear then
    v_reward_gold := 0;
    v_reward_dust := 0;
    v_reward_gems := 0;
    v_reward_xp := 0;
    v_reward_account_xp := 0;
    v_shard_amount := 0;
  end if;

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
    created_at
  )
  values (
    v_operation_id,
    v_profile_id,
    p_idempotency_key,
    'recordEventResult',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now
  );

  v_rewards := jsonb_strip_nulls(jsonb_build_object(
    'gold', nullif(v_reward_gold, 0),
    'dust', nullif(v_reward_dust, 0),
    'gems', nullif(v_reward_gems, 0),
    'xp', nullif(v_reward_xp, 0),
    'accountXp', nullif(v_reward_account_xp, 0),
    'shards', case when v_first_clear and v_shard_amount > 0 then jsonb_build_array(jsonb_build_object('heroId', v_shard_hero, 'amount', v_shard_amount)) end
  ));

  if v_first_clear then
    update public.player_resources
      set gold = gold + v_reward_gold,
          dust = dust + v_reward_dust,
          gems = gems + v_reward_gems
      where profile_id = v_profile_id
      returning * into v_resources;

    if v_reward_account_xp > 0 then
      update public.profiles
        set account_xp = account_xp + v_reward_account_xp
        where id = v_profile_id;
    end if;

    if v_reward_gold > 0 then
      insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
      values (v_profile_id, v_operation_id, 'event_result', 'gold', v_reward_gold, v_resources.gold, jsonb_build_object('eventId', p_event_id));
    end if;
    if v_reward_dust > 0 then
      insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
      values (v_profile_id, v_operation_id, 'event_result', 'dust', v_reward_dust, v_resources.dust, jsonb_build_object('eventId', p_event_id));
    end if;
    if v_reward_gems > 0 then
      insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
      values (v_profile_id, v_operation_id, 'event_result', 'gems', v_reward_gems, v_resources.gems, jsonb_build_object('eventId', p_event_id));
    end if;

    if v_shard_amount > 0 then
      insert into public.player_heroes (profile_id, hero_id, shards, unlocked)
      values (v_profile_id, v_shard_hero, v_shard_amount, false)
      on conflict (profile_id, hero_id)
      do update set
        shards = public.player_heroes.shards + excluded.shards,
        updated_at = v_now;
    end if;
  end if;

  insert into public.battle_results (
    profile_id,
    source,
    event_id,
    preset_id,
    seed,
    winner,
    turns,
    summary,
    rewards,
    operation_id,
    created_at
  )
  values (
    v_profile_id,
    'event',
    p_event_id,
    v_preset_id,
    p_battle_seed,
    p_winner,
    p_turns,
    coalesce(p_battle_summary, '{}'::jsonb),
    v_rewards,
    v_operation_id,
    v_now
  );

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'eventId', p_event_id,
      'winner', p_winner,
      'firstClear', v_first_clear,
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

revoke all on function public.record_event_result(text, text, bigint, text, int, jsonb) from public;
grant execute on function public.record_event_result(text, text, bigint, text, int, jsonb) to authenticated;
