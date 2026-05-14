-- Duskkeep Fronts - resultado autoritativo MVP para Arena.
-- El cliente envia la accion/result summary; el servidor consume ticket,
-- calcula rewards permitidas por rival/resultado y persiste el battle_result.

create or replace function public.record_arena_result(
  p_idempotency_key text,
  p_opponent_id text,
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
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_resources public.player_resources%rowtype;
  v_preset_id text;
  v_reward_gold int := 0;
  v_reward_dust int := 0;
  v_reward_gems int := 0;
  v_reward_account_xp int := 0;
  v_rewards jsonb;
  v_arena_wins int := 0;
  v_arena_losses int := 0;
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

  case p_opponent_id
    when 'arena_bonewood' then
      v_preset_id := 'bonewood_raiders';
      if p_winner = 'ally' then
        v_reward_gold := 120; v_reward_gems := 3; v_reward_account_xp := 8;
      end if;
    when 'arena_plague' then
      v_preset_id := 'plague_pack';
      if p_winner = 'ally' then
        v_reward_gold := 180; v_reward_dust := 20; v_reward_gems := 5; v_reward_account_xp := 10;
      end if;
    when 'arena_ember' then
      v_preset_id := 'ember_court';
      if p_winner = 'ally' then
        v_reward_gold := 260; v_reward_dust := 35; v_reward_gems := 8; v_reward_account_xp := 14;
      end if;
    else
      return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Arena opponent not supported');
  end case;

  if p_winner = 'draw' then
    v_reward_gold := 45;
    v_reward_dust := 5;
    v_reward_gems := 0;
    v_reward_account_xp := 3;
  elsif p_winner = 'enemy' then
    v_reward_gold := 25;
    v_reward_dust := 0;
    v_reward_gems := 0;
    v_reward_account_xp := 2;
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(
    digest(
      'recordArenaResult:'
      || p_opponent_id || ':'
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
    if v_existing_operation.operation_type <> 'recordArenaResult'
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
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
  end if;

  if v_resources.arena_tickets < 1 then
    return jsonb_build_object('ok', false, 'code', 'insufficient_resources', 'reason', 'Arena ticket required');
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
    'recordArenaResult',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now
  );

  v_rewards := jsonb_strip_nulls(jsonb_build_object(
    'gold', nullif(v_reward_gold, 0),
    'dust', nullif(v_reward_dust, 0),
    'gems', nullif(v_reward_gems, 0),
    'accountXp', nullif(v_reward_account_xp, 0)
  ));

  update public.player_resources
    set arena_tickets = arena_tickets - 1,
        gold = gold + v_reward_gold,
        dust = dust + v_reward_dust,
        gems = gems + v_reward_gems
    where profile_id = v_profile_id
    returning * into v_resources;

  if v_reward_account_xp > 0 then
    update public.profiles
      set account_xp = account_xp + v_reward_account_xp
      where id = v_profile_id;
  end if;

  insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
  values (v_profile_id, v_operation_id, 'arena_result', 'arena_tickets', -1, v_resources.arena_tickets, jsonb_build_object('opponentId', p_opponent_id));

  if v_reward_gold > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'arena_result', 'gold', v_reward_gold, v_resources.gold, jsonb_build_object('opponentId', p_opponent_id, 'winner', p_winner));
  end if;
  if v_reward_dust > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'arena_result', 'dust', v_reward_dust, v_resources.dust, jsonb_build_object('opponentId', p_opponent_id, 'winner', p_winner));
  end if;
  if v_reward_gems > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'arena_result', 'gems', v_reward_gems, v_resources.gems, jsonb_build_object('opponentId', p_opponent_id, 'winner', p_winner));
  end if;

  insert into public.battle_results (
    profile_id,
    source,
    arena_opponent_id,
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
    'arena',
    p_opponent_id,
    v_preset_id,
    p_battle_seed,
    p_winner,
    p_turns,
    coalesce(p_battle_summary, '{}'::jsonb),
    v_rewards,
    v_operation_id,
    v_now
  );

  select count(*) filter (where winner = 'ally'),
         count(*) filter (where winner <> 'ally')
    into v_arena_wins, v_arena_losses
    from public.battle_results
    where profile_id = v_profile_id
      and source = 'arena';

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'opponentId', p_opponent_id,
      'winner', p_winner,
      'rewardsGranted', v_rewards,
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      ),
      'arenaWins', v_arena_wins,
      'arenaLosses', v_arena_losses
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

revoke all on function public.record_arena_result(text, text, bigint, text, int, jsonb) from public;
grant execute on function public.record_arena_result(text, text, bigint, text, int, jsonb) to authenticated;
