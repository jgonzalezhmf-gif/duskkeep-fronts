-- Duskkeep Fronts - Adventure node rewards data-driven.
-- Alcance: nodos no-combate reclamables. No toca combate ni mapa visual.

create table if not exists public.server_adventure_node_rewards (
  node_id text primary key check (node_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  enabled boolean not null default true,
  chapter_id text not null check (chapter_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  required_node_ids text[] not null default '{}',
  reward_id text not null references public.server_reward_definitions(reward_id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists server_adventure_node_rewards_set_updated_at on public.server_adventure_node_rewards;
create trigger server_adventure_node_rewards_set_updated_at
before update on public.server_adventure_node_rewards
for each row execute function public.set_updated_at();

alter table public.server_adventure_node_rewards enable row level security;

revoke all on table public.server_adventure_node_rewards from public;
revoke all on table public.server_adventure_node_rewards from anon;
revoke all on table public.server_adventure_node_rewards from authenticated;

insert into public.server_reward_definitions (reward_id, enabled, rewards, notes)
values
  ('adventure_node_c1l3', true, '{"gold":120,"dust":20,"gems":15,"xp":45,"accountXp":14,"frontlineCards":[{"cardId":"order_shadow_dive"}]}'::jsonb, 'Adventure node reward c1l3'),
  ('adventure_node_c1l7', true, '{"gold":220,"dust":40,"gems":25,"xp":90,"accountXp":22,"frontlineCards":[{"cardId":"tactic_core_burst"}]}'::jsonb, 'Adventure node reward c1l7')
on conflict (reward_id) do update set
  enabled = excluded.enabled,
  rewards = excluded.rewards,
  notes = excluded.notes;

insert into public.server_adventure_node_rewards (
  node_id,
  enabled,
  chapter_id,
  required_node_ids,
  reward_id,
  notes
)
values
  ('c1l3', true, 'chapter-1', array['c1l2'], 'adventure_node_c1l3', 'Chapter 1 side chest'),
  ('c1l7', true, 'chapter-1', array['c1l2'], 'adventure_node_c1l7', 'Chapter 1 breach cache')
on conflict (node_id) do update set
  enabled = excluded.enabled,
  chapter_id = excluded.chapter_id,
  required_node_ids = excluded.required_node_ids,
  reward_id = excluded.reward_id,
  notes = excluded.notes;

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
  v_node_reward public.server_adventure_node_rewards%rowtype;
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

  select *
    into v_node_reward
    from public.server_adventure_node_rewards
    where node_id = p_node_id
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Adventure claim node not supported');
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

  if exists (
    select 1
      from unnest(v_node_reward.required_node_ids) as required_node_id
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
    into v_progress
    from public.adventure_progress
    where profile_id = v_profile_id
      and node_id = p_node_id
    for update;

  if found and (v_progress.claimed = true or (v_progress.cleared = true and v_progress.first_clear_taken = true)) then
    return jsonb_build_object('ok', false, 'code', 'already_claimed', 'reason', 'Adventure node reward already claimed');
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
    'claimAdventureNodeReward',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  v_reward_result := public.grant_reward_definition(
    v_profile_id,
    v_operation_id,
    'adventure_node_claim',
    v_node_reward.reward_id,
    jsonb_build_object('nodeId', p_node_id)
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
    v_node_reward.chapter_id,
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
    chapter_id = excluded.chapter_id,
    status = 'claimed',
    cleared = true,
    first_clear_taken = true,
    claimed = true,
    cleared_at = excluded.cleared_at,
    updated_at = excluded.updated_at;

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'nodeId', p_node_id,
      'status', 'claimed',
      'rewardId', v_node_reward.reward_id,
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

revoke all on function public.claim_adventure_node_reward(text, text) from public;
grant execute on function public.claim_adventure_node_reward(text, text) to authenticated;
