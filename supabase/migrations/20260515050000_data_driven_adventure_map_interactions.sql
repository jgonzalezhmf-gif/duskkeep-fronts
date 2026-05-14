-- Duskkeep Fronts - Adventure map interactions data-driven.
-- Externaliza key chest, coste, cooldown y loot table en catalogos internos.

create table if not exists public.server_adventure_map_interactions (
  interaction_id text primary key check (interaction_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  enabled boolean not null default true,
  kind text not null check (kind in ('keyChest')),
  chapter_id text not null check (chapter_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  key_cost int not null default 0 check (key_cost >= 0 and key_cost <= 100),
  reset_hours int null check (reset_hours is null or (reset_hours > 0 and reset_hours <= 720)),
  required_node_ids text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_array_length(to_jsonb(required_node_ids)) <= 32)
);

drop trigger if exists server_adventure_map_interactions_set_updated_at on public.server_adventure_map_interactions;
create trigger server_adventure_map_interactions_set_updated_at
before update on public.server_adventure_map_interactions
for each row execute function public.set_updated_at();

alter table public.server_adventure_map_interactions enable row level security;

revoke all on table public.server_adventure_map_interactions from public;
revoke all on table public.server_adventure_map_interactions from anon;
revoke all on table public.server_adventure_map_interactions from authenticated;

create table if not exists public.server_adventure_map_loot_entries (
  interaction_id text not null references public.server_adventure_map_interactions(interaction_id) on delete cascade,
  loot_id text not null check (loot_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  enabled boolean not null default true,
  tier text not null check (tier in ('common', 'rare', 'epic', 'legendary')),
  title text not null check (length(trim(title)) between 1 and 80),
  weight int not null check (weight > 0 and weight <= 100000),
  reward_id text not null references public.server_reward_definitions(reward_id),
  sort_order int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (interaction_id, loot_id)
);

create index if not exists server_adventure_map_loot_entries_interaction_idx
on public.server_adventure_map_loot_entries(interaction_id, enabled, sort_order);

drop trigger if exists server_adventure_map_loot_entries_set_updated_at on public.server_adventure_map_loot_entries;
create trigger server_adventure_map_loot_entries_set_updated_at
before update on public.server_adventure_map_loot_entries
for each row execute function public.set_updated_at();

alter table public.server_adventure_map_loot_entries enable row level security;

revoke all on table public.server_adventure_map_loot_entries from public;
revoke all on table public.server_adventure_map_loot_entries from anon;
revoke all on table public.server_adventure_map_loot_entries from authenticated;

insert into public.server_reward_definitions (reward_id, enabled, rewards, notes)
values
  ('adventure_map_loot_road_cache_common_supplies', true, '{"gold":220,"dust":25,"accountXp":8}'::jsonb, 'Road cache common loot'),
  ('adventure_map_loot_road_cache_rare_gem_purse', true, '{"gems":18,"accountXp":10}'::jsonb, 'Road cache rare loot'),
  ('adventure_map_loot_road_cache_epic_war_cache', true, '{"gold":420,"dust":70,"accountXp":16,"shards":[{"heroId":"vex","amount":4}]}'::jsonb, 'Road cache epic loot'),
  ('adventure_map_loot_road_cache_legendary_frontline_vault', true, '{"gems":35,"dust":95,"accountXp":24,"frontlineCards":[{"cardId":"war_drums"}]}'::jsonb, 'Road cache legendary loot')
on conflict (reward_id) do update set
  enabled = excluded.enabled,
  rewards = excluded.rewards,
  notes = excluded.notes;

insert into public.server_adventure_map_interactions (
  interaction_id,
  enabled,
  kind,
  chapter_id,
  key_cost,
  reset_hours,
  required_node_ids,
  notes
)
values
  ('c1-lower-cache', true, 'keyChest', 'chapter-1', 1, 8, array['c1l2'], 'Chapter 1 lower road key chest')
on conflict (interaction_id) do update set
  enabled = excluded.enabled,
  kind = excluded.kind,
  chapter_id = excluded.chapter_id,
  key_cost = excluded.key_cost,
  reset_hours = excluded.reset_hours,
  required_node_ids = excluded.required_node_ids,
  notes = excluded.notes;

insert into public.server_adventure_map_loot_entries (
  interaction_id,
  loot_id,
  enabled,
  tier,
  title,
  weight,
  reward_id,
  sort_order,
  notes
)
values
  ('c1-lower-cache', 'road-cache-common-supplies', true, 'common', 'Roadside Supplies', 50, 'adventure_map_loot_road_cache_common_supplies', 10, '50% common loot'),
  ('c1-lower-cache', 'road-cache-rare-gem-purse', true, 'rare', 'Gem-Sealed Purse', 30, 'adventure_map_loot_road_cache_rare_gem_purse', 20, '30% rare loot'),
  ('c1-lower-cache', 'road-cache-epic-war-cache', true, 'epic', 'War Cache', 15, 'adventure_map_loot_road_cache_epic_war_cache', 30, '15% epic loot'),
  ('c1-lower-cache', 'road-cache-legendary-frontline-vault', true, 'legendary', 'Frontline Vault', 5, 'adventure_map_loot_road_cache_legendary_frontline_vault', 40, '5% legendary loot')
on conflict (interaction_id, loot_id) do update set
  enabled = excluded.enabled,
  tier = excluded.tier,
  title = excluded.title,
  weight = excluded.weight,
  reward_id = excluded.reward_id,
  sort_order = excluded.sort_order,
  notes = excluded.notes;

create or replace function public.open_adventure_map_interaction(
  p_idempotency_key text,
  p_interaction_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_interaction public.server_adventure_map_interactions%rowtype;
  v_loot public.server_adventure_map_loot_entries%rowtype;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_resources public.player_resources%rowtype;
  v_claim public.adventure_map_claims%rowtype;
  v_total_weight int;
  v_roll double precision;
  v_reward_result jsonb;
  v_rewards jsonb := '{}'::jsonb;
  v_reset_available_at timestamptz;
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_interaction_id is null or trim(p_interaction_id) = '' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid interaction id');
  end if;

  select *
    into v_interaction
    from public.server_adventure_map_interactions
    where interaction_id = p_interaction_id
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Map interaction not found');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(digest('openAdventureMapInteraction:' || p_interaction_id, 'sha256'), 'hex');

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'openAdventureMapInteraction'
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

  perform pg_advisory_xact_lock(hashtext(v_profile_id::text || ':' || p_interaction_id));

  if exists (
    select 1
      from unnest(v_interaction.required_node_ids) as required_node_id
      where not exists (
        select 1
          from public.adventure_progress
          where profile_id = v_profile_id
            and node_id = required_node_id
            and (cleared = true or first_clear_taken = true or claimed = true)
      )
  ) then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Map interaction is locked');
  end if;

  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
  end if;

  if v_resources.adventure_keys < v_interaction.key_cost then
    return jsonb_build_object('ok', false, 'code', 'insufficient_resources', 'reason', 'Adventure key required');
  end if;

  select *
    into v_claim
    from public.adventure_map_claims
    where profile_id = v_profile_id
      and interaction_id = p_interaction_id
    for update;

  if found and v_claim.claimed = true and (v_claim.reset_available_at is null or v_claim.reset_available_at > v_now) then
    return jsonb_build_object('ok', false, 'code', 'already_claimed', 'reason', 'Map interaction is still on cooldown');
  end if;

  select coalesce(sum(loot.weight), 0)
    into v_total_weight
    from public.server_adventure_map_loot_entries loot
    join public.server_reward_definitions reward on reward.reward_id = loot.reward_id
    where loot.interaction_id = p_interaction_id
      and loot.enabled = true
      and reward.enabled = true;

  if v_total_weight <= 0 then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Map interaction has no loot');
  end if;

  v_roll := random() * v_total_weight;

  select weighted.interaction_id,
         weighted.loot_id,
         weighted.enabled,
         weighted.tier,
         weighted.title,
         weighted.weight,
         weighted.reward_id,
         weighted.sort_order,
         weighted.notes,
         weighted.created_at,
         weighted.updated_at
    into v_loot
    from (
      select loot.*,
             sum(loot.weight) over (order by loot.sort_order, loot.loot_id) as cumulative_weight
        from public.server_adventure_map_loot_entries loot
        join public.server_reward_definitions reward on reward.reward_id = loot.reward_id
        where loot.interaction_id = p_interaction_id
          and loot.enabled = true
          and reward.enabled = true
    ) weighted
    where weighted.cumulative_weight > v_roll
    order by weighted.cumulative_weight
    limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Map interaction loot roll failed');
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
    'openAdventureMapInteraction',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  if v_interaction.key_cost > 0 then
    update public.player_resources
      set adventure_keys = adventure_keys - v_interaction.key_cost
      where profile_id = v_profile_id
      returning * into v_resources;

    insert into public.resource_ledger (
      profile_id,
      operation_id,
      source,
      resource,
      delta,
      balance_after,
      metadata
    )
    values (
      v_profile_id,
      v_operation_id,
      'adventure_map_interaction_cost',
      'adventure_keys',
      -v_interaction.key_cost,
      v_resources.adventure_keys,
      jsonb_build_object('interactionId', p_interaction_id)
    );
  end if;

  v_reward_result := public.grant_reward_definition(
    v_profile_id,
    v_operation_id,
    'adventure_map_interaction',
    v_loot.reward_id,
    jsonb_build_object(
      'interactionId', p_interaction_id,
      'lootId', v_loot.loot_id,
      'lootTier', v_loot.tier
    )
  );

  if coalesce((v_reward_result ->> 'ok')::boolean, false) is not true then
    raise exception 'Failed to grant adventure map interaction reward: %', v_reward_result;
  end if;

  v_rewards := coalesce(v_reward_result -> 'rewardsGranted', '{}'::jsonb);
  if v_interaction.reset_hours is not null then
    v_reset_available_at := v_now + make_interval(hours => v_interaction.reset_hours);
  end if;

  insert into public.adventure_map_claims (
    profile_id,
    interaction_id,
    claimed,
    claimed_at,
    reset_available_at,
    loot_id,
    loot_tier,
    loot_title,
    rewards,
    operation_id,
    updated_at
  )
  values (
    v_profile_id,
    p_interaction_id,
    true,
    v_now,
    v_reset_available_at,
    v_loot.loot_id,
    v_loot.tier,
    v_loot.title,
    v_rewards,
    v_operation_id,
    v_now
  )
  on conflict (profile_id, interaction_id)
  do update set
    claimed = true,
    claimed_at = excluded.claimed_at,
    reset_available_at = excluded.reset_available_at,
    loot_id = excluded.loot_id,
    loot_tier = excluded.loot_tier,
    loot_title = excluded.loot_title,
    rewards = excluded.rewards,
    operation_id = excluded.operation_id,
    updated_at = excluded.updated_at;

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'interactionId', p_interaction_id,
      'status', 'claimed',
      'lootId', v_loot.loot_id,
      'lootTier', v_loot.tier,
      'lootTitle', v_loot.title,
      'rewardsGranted', v_rewards,
      'resources', v_reward_result -> 'resources',
      'resetAvailableAt', v_reset_available_at,
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

revoke all on function public.open_adventure_map_interaction(text, text) from public;
grant execute on function public.open_adventure_map_interaction(text, text) to authenticated;
