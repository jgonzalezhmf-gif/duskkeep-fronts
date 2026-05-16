-- Duskkeep Fronts - Adventure battle rewards data-driven.
-- Externaliza nodos de combate, prerequisitos, unlocks y rewards para no tocar la RPC por balance.

create table if not exists public.server_adventure_battle_nodes (
  node_id text primary key check (node_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  enabled boolean not null default true,
  chapter_id text not null check (chapter_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  node_type text not null check (node_type in ('battle', 'elite', 'boss')),
  required_node_ids text[] not null default '{}',
  unlock_node_ids text[] not null default '{}',
  first_clear_reward_id text not null references public.server_reward_definitions(reward_id),
  repeat_reward_id text null references public.server_reward_definitions(reward_id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_array_length(to_jsonb(required_node_ids)) <= 32),
  check (jsonb_array_length(to_jsonb(unlock_node_ids)) <= 32)
);

drop trigger if exists server_adventure_battle_nodes_set_updated_at on public.server_adventure_battle_nodes;
create trigger server_adventure_battle_nodes_set_updated_at
before update on public.server_adventure_battle_nodes
for each row execute function public.set_updated_at();

alter table public.server_adventure_battle_nodes enable row level security;

revoke all on table public.server_adventure_battle_nodes from public;
revoke all on table public.server_adventure_battle_nodes from anon;
revoke all on table public.server_adventure_battle_nodes from authenticated;

insert into public.server_reward_definitions (reward_id, enabled, rewards, notes)
values
  ('adventure_battle_c1l1_first', true, '{"gold":80,"gems":20,"xp":30,"accountXp":10,"shards":[{"heroId":"bran","amount":3}]}'::jsonb, 'Adventure battle c1l1 first clear'),
  ('adventure_battle_c1l1_repeat', true, '{"gold":16,"accountXp":2}'::jsonb, 'Adventure battle c1l1 replay'),
  ('adventure_battle_c1l2_first', true, '{"gold":100,"gems":10,"xp":40,"accountXp":12,"adventureKeys":1,"shards":[{"heroId":"vex","amount":3}]}'::jsonb, 'Adventure battle c1l2 first clear'),
  ('adventure_battle_c1l2_repeat', true, '{"gold":20,"accountXp":2}'::jsonb, 'Adventure battle c1l2 replay'),
  ('adventure_battle_c1l4_first', true, '{"gold":150,"dust":25,"xp":55,"accountXp":16,"shards":[{"heroId":"mira","amount":4}]}'::jsonb, 'Adventure battle c1l4 first clear'),
  ('adventure_battle_c1l4_repeat', true, '{"gold":30,"dust":5,"accountXp":3}'::jsonb, 'Adventure battle c1l4 replay'),
  ('adventure_battle_c1l5_first', true, '{"gold":180,"dust":30,"gems":20,"xp":70,"accountXp":18,"adventureKeys":1,"shards":[{"heroId":"ursa","amount":3}]}'::jsonb, 'Adventure elite c1l5 first clear'),
  ('adventure_battle_c1l5_repeat', true, '{"gold":22,"dust":4,"accountXp":2}'::jsonb, 'Adventure elite c1l5 replay'),
  ('adventure_battle_c1l6_first', true, '{"gold":200,"dust":35,"xp":80,"accountXp":20,"shards":[{"heroId":"lyria","amount":4}]}'::jsonb, 'Adventure battle c1l6 first clear'),
  ('adventure_battle_c1l6_repeat', true, '{"gold":40,"dust":7,"accountXp":4}'::jsonb, 'Adventure battle c1l6 replay'),
  ('adventure_battle_c1l8_first', true, '{"gold":250,"dust":45,"xp":100,"accountXp":24}'::jsonb, 'Adventure battle c1l8 first clear'),
  ('adventure_battle_c1l8_repeat', true, '{"gold":50,"dust":9,"accountXp":5}'::jsonb, 'Adventure battle c1l8 replay'),
  ('adventure_battle_c1l9_first', true, '{"gold":280,"dust":50,"xp":110,"accountXp":26,"shards":[{"heroId":"drak","amount":3}]}'::jsonb, 'Adventure elite c1l9 first clear'),
  ('adventure_battle_c1l9_repeat', true, '{"gold":34,"dust":6,"accountXp":3}'::jsonb, 'Adventure elite c1l9 replay'),
  ('adventure_battle_c1l10_first', true, '{"gold":320,"dust":60,"xp":130,"accountXp":30,"shards":[{"heroId":"morr","amount":4}],"frontlineCards":[{"cardId":"summon_totem"}]}'::jsonb, 'Adventure battle c1l10 first clear'),
  ('adventure_battle_c1l10_repeat', true, '{"gold":64,"dust":12,"accountXp":6}'::jsonb, 'Adventure battle c1l10 replay'),
  ('adventure_battle_c1l11_first', true, '{"gold":360,"dust":70,"gems":30,"xp":150,"accountXp":34,"adventureKeys":1,"shards":[{"heroId":"grom","amount":3}]}'::jsonb, 'Adventure elite c1l11 first clear'),
  ('adventure_battle_c1l11_repeat', true, '{"gold":43,"dust":8,"accountXp":4}'::jsonb, 'Adventure elite c1l11 replay'),
  ('adventure_battle_c1l12_first', true, '{"gold":500,"dust":100,"gems":125,"xp":200,"accountXp":50,"shards":[{"heroId":"noct","amount":5}]}'::jsonb, 'Adventure boss c1l12 first clear'),
  ('adventure_battle_c1l12_repeat', true, '{}'::jsonb, 'Adventure boss c1l12 practice replay')
on conflict (reward_id) do update set
  enabled = excluded.enabled,
  rewards = excluded.rewards,
  notes = excluded.notes;

insert into public.server_adventure_battle_nodes (
  node_id,
  enabled,
  chapter_id,
  node_type,
  required_node_ids,
  unlock_node_ids,
  first_clear_reward_id,
  repeat_reward_id,
  notes
)
values
  ('c1l1', true, 'chapter-1', 'battle', '{}', array['c1l2'], 'adventure_battle_c1l1_first', 'adventure_battle_c1l1_repeat', 'Chapter 1 combat node'),
  ('c1l2', true, 'chapter-1', 'battle', array['c1l1'], array['c1l3','c1l7'], 'adventure_battle_c1l2_first', 'adventure_battle_c1l2_repeat', 'Chapter 1 branch combat node'),
  ('c1l4', true, 'chapter-1', 'battle', array['c1l3'], array['c1l5'], 'adventure_battle_c1l4_first', 'adventure_battle_c1l4_repeat', 'Chapter 1 combat node'),
  ('c1l5', true, 'chapter-1', 'elite', array['c1l4'], array['c1l6'], 'adventure_battle_c1l5_first', 'adventure_battle_c1l5_repeat', 'Chapter 1 elite node'),
  ('c1l6', true, 'chapter-1', 'battle', array['c1l5'], '{}', 'adventure_battle_c1l6_first', 'adventure_battle_c1l6_repeat', 'Chapter 1 combat node'),
  ('c1l8', true, 'chapter-1', 'battle', array['c1l7'], array['c1l9'], 'adventure_battle_c1l8_first', 'adventure_battle_c1l8_repeat', 'Chapter 1 combat node'),
  ('c1l9', true, 'chapter-1', 'elite', array['c1l8'], array['c1l10'], 'adventure_battle_c1l9_first', 'adventure_battle_c1l9_repeat', 'Chapter 1 elite node'),
  ('c1l10', true, 'chapter-1', 'battle', array['c1l9'], array['c1l11'], 'adventure_battle_c1l10_first', 'adventure_battle_c1l10_repeat', 'Chapter 1 combat node'),
  ('c1l11', true, 'chapter-1', 'elite', array['c1l10'], '{}', 'adventure_battle_c1l11_first', 'adventure_battle_c1l11_repeat', 'Chapter 1 elite node'),
  ('c1l12', true, 'chapter-1', 'boss', array['c1l6','c1l11'], '{}', 'adventure_battle_c1l12_first', 'adventure_battle_c1l12_repeat', 'Chapter 1 boss node')
on conflict (node_id) do update set
  enabled = excluded.enabled,
  chapter_id = excluded.chapter_id,
  node_type = excluded.node_type,
  required_node_ids = excluded.required_node_ids,
  unlock_node_ids = excluded.unlock_node_ids,
  first_clear_reward_id = excluded.first_clear_reward_id,
  repeat_reward_id = excluded.repeat_reward_id,
  notes = excluded.notes;

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
  v_node public.server_adventure_battle_nodes%rowtype;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_previous_progress public.adventure_progress%rowtype;
  v_resources public.player_resources%rowtype;
  v_unlocked_nodes text[] := array[]::text[];
  v_unlock_node text;
  v_first_clear boolean := false;
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

  if p_node_id is null or trim(p_node_id) = '' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid node id');
  end if;

  if p_winner not in ('ally', 'enemy') then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid winner');
  end if;

  if p_turns is null or p_turns < 0 or p_turns > 500 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid turn count');
  end if;

  select *
    into v_node
    from public.server_adventure_battle_nodes
    where node_id = p_node_id
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Adventure combat node not supported');
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

  perform pg_advisory_xact_lock(hashtext(v_profile_id::text || ':' || p_node_id));

  if exists (
    select 1
      from unnest(v_node.required_node_ids) as required_node_id
      where not exists (
        select 1
          from public.adventure_progress
          where profile_id = v_profile_id
            and node_id = required_node_id
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
    'claimAdventureBattleResult',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  if p_winner = 'ally' then
    v_reward_id := case when v_first_clear then v_node.first_clear_reward_id else v_node.repeat_reward_id end;

    if v_reward_id is not null then
      v_reward_result := public.grant_reward_definition(
        v_profile_id,
        v_operation_id,
        'adventure_battle_result',
        v_reward_id,
        jsonb_build_object('nodeId', p_node_id, 'firstClear', v_first_clear)
      );

      if coalesce((v_reward_result ->> 'ok')::boolean, false) is not true then
        raise exception 'Failed to grant adventure battle reward: %', v_reward_result;
      end if;

      v_rewards := coalesce(v_reward_result -> 'rewardsGranted', '{}'::jsonb);
      select *
        into v_resources
        from public.player_resources
        where profile_id = v_profile_id;
    end if;

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
      v_node.chapter_id,
      p_node_id,
      case when v_node.node_type = 'boss' then 'completed' else 'cleared' end,
      true,
      true,
      false,
      v_now,
      v_now
    )
    on conflict (profile_id, node_id)
    do update set
      chapter_id = excluded.chapter_id,
      status = excluded.status,
      cleared = true,
      first_clear_taken = public.adventure_progress.first_clear_taken or excluded.first_clear_taken,
      cleared_at = excluded.cleared_at,
      updated_at = excluded.updated_at;

    v_unlocked_nodes := v_node.unlock_node_ids;
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
      values (v_profile_id, v_node.chapter_id, v_unlock_node, 'available', false, false, false, v_now)
      on conflict (profile_id, node_id)
      do update set
        chapter_id = excluded.chapter_id,
        status = case
          when public.adventure_progress.cleared or public.adventure_progress.claimed then public.adventure_progress.status
          else 'available'
        end,
        updated_at = excluded.updated_at;
    end loop;
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
      'rewardId', v_reward_id,
      'rewardsGranted', v_rewards,
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      ),
      'unlockedNodeIds', case when p_winner = 'ally' then to_jsonb(v_unlocked_nodes) else '[]'::jsonb end,
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

revoke all on function public.claim_adventure_battle_result(text, text, bigint, text, int, jsonb) from public;
grant execute on function public.claim_adventure_battle_result(text, text, bigint, text, int, jsonb) to authenticated;
