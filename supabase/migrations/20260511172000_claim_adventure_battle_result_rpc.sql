-- Duskkeep Fronts - RPC autoritativa para resultados de batalla Adventure.
-- Alcance inicial: nodos de combate de Chapter 1. No conecta cliente todavia.

create or replace function public.claim_adventure_battle_result(
  p_idempotency_key text,
  p_node_id text,
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
  v_previous_progress public.adventure_progress%rowtype;
  v_resources public.player_resources%rowtype;
  v_node_type text;
  v_chapter_id text := 'chapter-1';
  v_required_nodes text[] := array[]::text[];
  v_unlocked_nodes text[] := array[]::text[];
  v_unlock_node text;
  v_first_clear boolean := false;
  v_base_gold int := 0;
  v_base_dust int := 0;
  v_base_gems int := 0;
  v_base_xp int := 0;
  v_base_account_xp int := 0;
  v_first_gems int := 0;
  v_first_adventure_keys int := 0;
  v_first_shard_hero text;
  v_first_shard_amount int := 0;
  v_first_card_id text;
  v_reward_gold int := 0;
  v_reward_dust int := 0;
  v_reward_gems int := 0;
  v_reward_xp int := 0;
  v_reward_account_xp int := 0;
  v_reward_adventure_keys int := 0;
  v_rewards jsonb := '{}'::jsonb;
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

  if p_winner not in ('ally', 'enemy') then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid winner');
  end if;

  if p_turns is null or p_turns < 0 or p_turns > 500 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid turn count');
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
      'claimAdventureBattleResult:'
      || p_node_id || ':'
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
    if v_existing_operation.operation_type <> 'claimAdventureBattleResult'
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
    when 'c1l1' then
      v_node_type := 'battle';
      v_base_gold := 80; v_base_xp := 30; v_base_account_xp := 10;
      v_first_gems := 20; v_first_shard_hero := 'bran'; v_first_shard_amount := 3;
      v_unlocked_nodes := array['c1l2'];
    when 'c1l2' then
      v_node_type := 'battle';
      v_required_nodes := array['c1l1'];
      v_base_gold := 100; v_base_xp := 40; v_base_account_xp := 12;
      v_first_gems := 10; v_first_adventure_keys := 1; v_first_shard_hero := 'vex'; v_first_shard_amount := 3;
      v_unlocked_nodes := array['c1l3', 'c1l4', 'c1l7', 'c1l8'];
    when 'c1l4' then
      v_node_type := 'battle';
      v_required_nodes := array['c1l2'];
      v_base_gold := 150; v_base_dust := 25; v_base_xp := 55; v_base_account_xp := 16;
      v_first_shard_hero := 'mira'; v_first_shard_amount := 4;
      v_unlocked_nodes := array['c1l5'];
    when 'c1l5' then
      v_node_type := 'elite';
      v_required_nodes := array['c1l4'];
      v_base_gold := 180; v_base_dust := 30; v_base_xp := 70; v_base_account_xp := 18;
      v_first_gems := 20; v_first_adventure_keys := 1; v_first_shard_hero := 'ursa'; v_first_shard_amount := 3;
      v_unlocked_nodes := array['c1l6'];
    when 'c1l6' then
      v_node_type := 'battle';
      v_required_nodes := array['c1l5'];
      v_base_gold := 200; v_base_dust := 35; v_base_xp := 80; v_base_account_xp := 20;
      v_first_shard_hero := 'lyria'; v_first_shard_amount := 4;
    when 'c1l8' then
      v_node_type := 'battle';
      v_required_nodes := array['c1l2'];
      v_base_gold := 250; v_base_dust := 45; v_base_xp := 100; v_base_account_xp := 24;
      v_unlocked_nodes := array['c1l9'];
    when 'c1l9' then
      v_node_type := 'elite';
      v_required_nodes := array['c1l8'];
      v_base_gold := 280; v_base_dust := 50; v_base_xp := 110; v_base_account_xp := 26;
      v_first_shard_hero := 'drak'; v_first_shard_amount := 3;
      v_unlocked_nodes := array['c1l10'];
    when 'c1l10' then
      v_node_type := 'battle';
      v_required_nodes := array['c1l9'];
      v_base_gold := 320; v_base_dust := 60; v_base_xp := 130; v_base_account_xp := 30;
      v_first_shard_hero := 'morr'; v_first_shard_amount := 4; v_first_card_id := 'summon_totem';
      v_unlocked_nodes := array['c1l11'];
    when 'c1l11' then
      v_node_type := 'elite';
      v_required_nodes := array['c1l10'];
      v_base_gold := 360; v_base_dust := 70; v_base_xp := 150; v_base_account_xp := 34;
      v_first_gems := 30; v_first_adventure_keys := 1; v_first_shard_hero := 'grom'; v_first_shard_amount := 3;
    when 'c1l12' then
      v_node_type := 'boss';
      v_required_nodes := array['c1l6', 'c1l11'];
      v_base_gold := 500; v_base_dust := 100; v_base_xp := 200; v_base_account_xp := 50; v_base_gems := 25;
      v_first_gems := 100; v_first_shard_hero := 'noct'; v_first_shard_amount := 5;
    else
      return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Adventure combat node not supported');
  end case;

  if exists (
    select 1
      from unnest(v_required_nodes) as required_node(node_id)
      where not exists (
        select 1
          from public.adventure_progress
          where profile_id = v_profile_id
            and node_id = required_node.node_id
            and (cleared = true or first_clear_taken = true or claimed = true)
      )
  ) then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Adventure node is locked');
  end if;

  select *
    into v_previous_progress
    from public.adventure_progress
    where profile_id = v_profile_id
      and node_id = p_node_id
    for update;

  v_first_clear := not coalesce(v_previous_progress.first_clear_taken, false);

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
    'claimAdventureBattleResult',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  if p_winner = 'ally' then
    if v_first_clear then
      v_reward_gold := v_base_gold;
      v_reward_dust := v_base_dust;
      v_reward_gems := v_base_gems + v_first_gems;
      v_reward_xp := v_base_xp;
      v_reward_account_xp := v_base_account_xp;
      v_reward_adventure_keys := v_first_adventure_keys;
    elsif v_node_type = 'boss' then
      v_reward_gold := 0;
      v_reward_dust := 0;
      v_reward_gems := 0;
      v_reward_xp := 0;
      v_reward_account_xp := 0;
    elsif v_node_type = 'elite' then
      v_reward_gold := greatest(12, round(v_base_gold * 0.12)::int);
      v_reward_dust := case when v_base_dust > 0 then greatest(2, round(v_base_dust * 0.12)::int) else 0 end;
      v_reward_account_xp := greatest(1, round(v_base_account_xp * 0.12)::int);
    else
      v_reward_gold := greatest(15, round(v_base_gold * 0.20)::int);
      v_reward_dust := case when v_base_dust > 0 then greatest(2, round(v_base_dust * 0.20)::int) else 0 end;
      v_reward_account_xp := greatest(1, round(v_base_account_xp * 0.20)::int);
    end if;
  end if;

  v_rewards := jsonb_strip_nulls(jsonb_build_object(
    'gold', nullif(v_reward_gold, 0),
    'dust', nullif(v_reward_dust, 0),
    'gems', nullif(v_reward_gems, 0),
    'xp', nullif(v_reward_xp, 0),
    'accountXp', nullif(v_reward_account_xp, 0),
    'adventureKeys', nullif(v_reward_adventure_keys, 0),
    'shards', case when p_winner = 'ally' and v_first_clear and v_first_shard_amount > 0 then jsonb_build_array(jsonb_build_object('heroId', v_first_shard_hero, 'amount', v_first_shard_amount)) end,
    'frontlineCards', case when p_winner = 'ally' and v_first_clear and v_first_card_id is not null then jsonb_build_array(jsonb_build_object('cardId', v_first_card_id)) end
  ));

  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
  end if;

  if p_winner = 'ally' then
    update public.player_resources
      set gold = gold + v_reward_gold,
          dust = dust + v_reward_dust,
          gems = gems + v_reward_gems,
          adventure_keys = adventure_keys + v_reward_adventure_keys
      where profile_id = v_profile_id
      returning * into v_resources;

    update public.profiles
      set account_xp = account_xp + v_reward_account_xp
      where id = v_profile_id;

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
      v_chapter_id,
      p_node_id,
      case when v_node_type = 'boss' then 'completed' else 'cleared' end,
      true,
      true,
      false,
      v_now,
      v_now
    )
    on conflict (profile_id, node_id)
    do update set
      status = excluded.status,
      cleared = true,
      first_clear_taken = public.adventure_progress.first_clear_taken or excluded.first_clear_taken,
      cleared_at = excluded.cleared_at,
      updated_at = excluded.updated_at;

    foreach v_unlock_node in array v_unlocked_nodes loop
      insert into public.adventure_progress (
        profile_id,
        chapter_id,
        node_id,
        status,
        cleared,
        first_clear_taken,
        claimed,
        updated_at
      )
      values (v_profile_id, v_chapter_id, v_unlock_node, 'available', false, false, false, v_now)
      on conflict (profile_id, node_id)
      do update set
        status = case
          when public.adventure_progress.cleared or public.adventure_progress.claimed then public.adventure_progress.status
          else 'available'
        end,
        updated_at = excluded.updated_at;
    end loop;

    if v_reward_gold <> 0 then
      insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
      values (v_profile_id, v_operation_id, 'adventure_battle_result', 'gold', v_reward_gold, v_resources.gold, jsonb_build_object('nodeId', p_node_id, 'firstClear', v_first_clear));
    end if;
    if v_reward_dust <> 0 then
      insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
      values (v_profile_id, v_operation_id, 'adventure_battle_result', 'dust', v_reward_dust, v_resources.dust, jsonb_build_object('nodeId', p_node_id, 'firstClear', v_first_clear));
    end if;
    if v_reward_gems <> 0 then
      insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
      values (v_profile_id, v_operation_id, 'adventure_battle_result', 'gems', v_reward_gems, v_resources.gems, jsonb_build_object('nodeId', p_node_id, 'firstClear', v_first_clear));
    end if;
    if v_reward_adventure_keys <> 0 then
      insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
      values (v_profile_id, v_operation_id, 'adventure_battle_result', 'adventure_keys', v_reward_adventure_keys, v_resources.adventure_keys, jsonb_build_object('nodeId', p_node_id, 'firstClear', v_first_clear));
    end if;

    if v_first_clear and v_first_shard_amount > 0 then
      insert into public.player_heroes (profile_id, hero_id, shards, unlocked)
      values (v_profile_id, v_first_shard_hero, v_first_shard_amount, false)
      on conflict (profile_id, hero_id)
      do update set
        shards = public.player_heroes.shards + excluded.shards,
        updated_at = v_now;
    end if;

    if v_first_clear and v_first_card_id is not null then
      insert into public.player_frontline_cards (profile_id, card_id, unlocked)
      values (v_profile_id, v_first_card_id, true)
      on conflict (profile_id, card_id)
      do update set
        unlocked = true,
        updated_at = v_now;
    end if;
  end if;

  insert into public.battle_results (
    profile_id,
    source,
    node_id,
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
    'adventure',
    p_node_id,
    p_node_id,
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
      'nodeId', p_node_id,
      'winner', p_winner,
      'firstClear', p_winner = 'ally' and v_first_clear,
      'rewardsGranted', v_rewards,
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      ),
      'unlockedNodeIds', case when p_winner = 'ally' then to_jsonb(v_unlocked_nodes) else '[]'::jsonb end
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

revoke all on function public.claim_adventure_battle_result(text, text, bigint, text, int, jsonb) from public;
grant execute on function public.claim_adventure_battle_result(text, text, bigint, text, int, jsonb) to authenticated;
