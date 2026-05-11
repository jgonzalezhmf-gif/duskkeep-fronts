-- Duskkeep Fronts - RPC autoritativa para nodos Adventure sin combate.
-- Alcance inicial: cofres de Chapter 1 (`c1l3`, `c1l7`).

create or replace function public.claim_adventure_node_reward(
  p_idempotency_key text,
  p_node_id text
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
  v_progress public.adventure_progress%rowtype;
  v_resources public.player_resources%rowtype;
  v_required_node text := 'c1l2';
  v_reward_gold int := 0;
  v_reward_dust int := 0;
  v_reward_gems int := 0;
  v_reward_xp int := 0;
  v_reward_account_xp int := 0;
  v_reward_card_id text;
  v_rewards jsonb;
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_node_id is null or trim(p_node_id) = '' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid node id');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(digest('claimAdventureNodeReward:' || p_node_id, 'sha256'), 'hex');

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'claimAdventureNodeReward'
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

  case p_node_id
    when 'c1l3' then
      v_reward_gold := 120;
      v_reward_dust := 20;
      v_reward_xp := 45;
      v_reward_account_xp := 14;
      v_reward_gems := 15;
      v_reward_card_id := 'order_shadow_dive';
    when 'c1l7' then
      v_reward_gold := 220;
      v_reward_dust := 40;
      v_reward_xp := 90;
      v_reward_account_xp := 22;
      v_reward_gems := 25;
      v_reward_card_id := 'tactic_core_burst';
    else
      return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Adventure claim node not supported');
  end case;

  if not exists (
    select 1
      from public.adventure_progress
      where profile_id = v_profile_id
        and node_id = v_required_node
        and (cleared = true or first_clear_taken = true or claimed = true)
  ) then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Adventure node is locked');
  end if;

  select *
    into v_progress
    from public.adventure_progress
    where profile_id = v_profile_id
      and node_id = p_node_id
    for update;

  if found and (v_progress.claimed = true or (v_progress.cleared = true and v_progress.first_clear_taken = true)) then
    return jsonb_build_object('ok', false, 'code', 'already_claimed', 'reason', 'Adventure node reward already claimed');
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
    'xp', nullif(v_reward_xp, 0),
    'accountXp', nullif(v_reward_account_xp, 0),
    'frontlineCards', jsonb_build_array(jsonb_build_object('cardId', v_reward_card_id))
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
    'claimAdventureNodeReward',
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

  insert into public.player_frontline_cards (profile_id, card_id, unlocked)
  values (v_profile_id, v_reward_card_id, true)
  on conflict (profile_id, card_id)
  do update set
    unlocked = true,
    updated_at = v_now;

  insert into public.adventure_progress (
    profile_id,
    chapter_id,
    node_id,
    status,
    cleared,
    first_clear_taken,
    claimed,
    cleared_at,
    updated_at
  )
  values (
    v_profile_id,
    'chapter-1',
    p_node_id,
    'claimed',
    true,
    true,
    true,
    v_now,
    v_now
  )
  on conflict (profile_id, node_id)
  do update set
    status = 'claimed',
    cleared = true,
    first_clear_taken = true,
    claimed = true,
    cleared_at = excluded.cleared_at,
    updated_at = excluded.updated_at;

  if v_reward_gold <> 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'adventure_node_claim', 'gold', v_reward_gold, v_resources.gold, jsonb_build_object('nodeId', p_node_id));
  end if;
  if v_reward_dust <> 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'adventure_node_claim', 'dust', v_reward_dust, v_resources.dust, jsonb_build_object('nodeId', p_node_id));
  end if;
  if v_reward_gems <> 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'adventure_node_claim', 'gems', v_reward_gems, v_resources.gems, jsonb_build_object('nodeId', p_node_id));
  end if;

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'nodeId', p_node_id,
      'status', 'claimed',
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

revoke all on function public.claim_adventure_node_reward(text, text) from public;
grant execute on function public.claim_adventure_node_reward(text, text) to authenticated;
