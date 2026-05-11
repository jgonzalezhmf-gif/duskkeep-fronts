-- Duskkeep Fronts - RPC autoritativa para abrir interactuables de mapa.
-- Implementa el primer cofre de llaves sin confiar en rewards enviados
-- por cliente. La funcion es atomica dentro de Postgres.

create or replace function public.open_adventure_map_interaction(
  p_idempotency_key text,
  p_interaction_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_resources public.player_resources%rowtype;
  v_claim public.adventure_map_claims%rowtype;
  v_roll double precision;
  v_loot_id text;
  v_loot_tier text;
  v_loot_title text;
  v_reward_gold int := 0;
  v_reward_dust int := 0;
  v_reward_gems int := 0;
  v_reward_account_xp int := 0;
  v_reward_vex_shards int := 0;
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

  if p_interaction_id is null or trim(p_interaction_id) = '' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid interaction id');
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

  if p_interaction_id <> 'c1-lower-cache' then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Map interaction not found');
  end if;

  if not exists (
    select 1
      from public.adventure_progress
      where profile_id = v_profile_id
        and node_id = 'c1l2'
        and (cleared = true or first_clear_taken = true or claimed = true)
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

  if v_resources.adventure_keys < 1 then
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

  v_roll := random() * 100;
  if v_roll < 50 then
    v_loot_id := 'road-cache-common-supplies';
    v_loot_tier := 'common';
    v_loot_title := 'Roadside Supplies';
    v_reward_gold := 220;
    v_reward_dust := 25;
    v_reward_account_xp := 8;
  elsif v_roll < 80 then
    v_loot_id := 'road-cache-rare-gem-purse';
    v_loot_tier := 'rare';
    v_loot_title := 'Gem-Sealed Purse';
    v_reward_gems := 18;
    v_reward_account_xp := 10;
  elsif v_roll < 95 then
    v_loot_id := 'road-cache-epic-war-cache';
    v_loot_tier := 'epic';
    v_loot_title := 'War Cache';
    v_reward_gold := 420;
    v_reward_dust := 70;
    v_reward_account_xp := 16;
    v_reward_vex_shards := 4;
  else
    v_loot_id := 'road-cache-legendary-frontline-vault';
    v_loot_tier := 'legendary';
    v_loot_title := 'Frontline Vault';
    v_reward_gems := 35;
    v_reward_dust := 95;
    v_reward_account_xp := 24;
    v_reward_card_id := 'war_drums';
  end if;

  v_rewards := jsonb_strip_nulls(jsonb_build_object(
    'gold', nullif(v_reward_gold, 0),
    'dust', nullif(v_reward_dust, 0),
    'gems', nullif(v_reward_gems, 0),
    'accountXp', nullif(v_reward_account_xp, 0),
    'shards', case when v_reward_vex_shards > 0 then jsonb_build_array(jsonb_build_object('heroId', 'vex', 'amount', v_reward_vex_shards)) end,
    'frontlineCards', case when v_reward_card_id is not null then jsonb_build_array(jsonb_build_object('cardId', v_reward_card_id)) end
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
    'openAdventureMapInteraction',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  update public.player_resources
    set adventure_keys = adventure_keys - 1,
        gold = gold + v_reward_gold,
        dust = dust + v_reward_dust,
        gems = gems + v_reward_gems
    where profile_id = v_profile_id
    returning * into v_resources;

  update public.profiles
    set account_xp = account_xp + v_reward_account_xp
    where id = v_profile_id;

  insert into public.resource_ledger (
    profile_id,
    operation_id,
    source,
    resource,
    delta,
    balance_after,
    metadata
  )
  values
    (v_profile_id, v_operation_id, 'adventure_map_interaction', 'adventure_keys', -1, v_resources.adventure_keys, jsonb_build_object('interactionId', p_interaction_id));

  if v_reward_gold > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'adventure_map_interaction', 'gold', v_reward_gold, v_resources.gold, jsonb_build_object('interactionId', p_interaction_id, 'lootId', v_loot_id));
  end if;

  if v_reward_dust > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'adventure_map_interaction', 'dust', v_reward_dust, v_resources.dust, jsonb_build_object('interactionId', p_interaction_id, 'lootId', v_loot_id));
  end if;

  if v_reward_gems > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'adventure_map_interaction', 'gems', v_reward_gems, v_resources.gems, jsonb_build_object('interactionId', p_interaction_id, 'lootId', v_loot_id));
  end if;

  if v_reward_vex_shards > 0 then
    insert into public.player_heroes (profile_id, hero_id, shards, unlocked)
    values (v_profile_id, 'vex', v_reward_vex_shards, false)
    on conflict (profile_id, hero_id)
    do update set
      shards = public.player_heroes.shards + excluded.shards,
      updated_at = v_now;
  end if;

  if v_reward_card_id is not null then
    insert into public.player_frontline_cards (profile_id, card_id, unlocked)
    values (v_profile_id, v_reward_card_id, true)
    on conflict (profile_id, card_id)
    do update set
      unlocked = true,
      updated_at = v_now;
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
    v_now + interval '8 hours',
    v_loot_id,
    v_loot_tier,
    v_loot_title,
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
      'lootId', v_loot_id,
      'lootTier', v_loot_tier,
      'lootTitle', v_loot_title,
      'rewardsGranted', v_rewards,
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      ),
      'resetAvailableAt', v_now + interval '8 hours'
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
