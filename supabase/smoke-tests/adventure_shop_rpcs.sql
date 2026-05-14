-- Smoke test local para las primeras RPC autoritativas.
-- Requiere `npx.cmd supabase start` o `npx.cmd supabase db reset`.
--
-- Ejecutar con:
-- psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/smoke-tests/adventure_shop_rpcs.sql

do $$
declare
  v_user_id uuid := '11111111-1111-4111-8111-111111111111';
  v_profile_id uuid;
  v_shop_result jsonb;
  v_shop_replay jsonb;
  v_cache_result jsonb;
  v_cache_replay jsonb;
  v_battle_result jsonb;
  v_battle_replay jsonb;
  v_battle_second_clear jsonb;
  v_loadout_result jsonb;
  v_loadout_replay jsonb;
  v_invalid_loadout_result jsonb;
  v_hero_level_result jsonb;
  v_hero_level_replay jsonb;
  v_invalid_hero_level_result jsonb;
  v_hero_star_result jsonb;
  v_hero_star_replay jsonb;
  v_invalid_hero_star_result jsonb;
  v_hero_skill_result jsonb;
  v_hero_skill_replay jsonb;
  v_invalid_hero_skill_result jsonb;
  v_card_upgrade_result jsonb;
  v_card_upgrade_replay jsonb;
  v_invalid_card_upgrade_result jsonb;
  v_fortress_upgrade_result jsonb;
  v_fortress_upgrade_replay jsonb;
  v_invalid_fortress_upgrade_result jsonb;
  v_fortress_raid_result jsonb;
  v_fortress_raid_replay jsonb;
  v_fortress_raid_second_attempt jsonb;
  v_arena_result jsonb;
  v_arena_replay jsonb;
  v_invalid_arena_result jsonb;
  v_event_result jsonb;
  v_event_replay jsonb;
  v_event_second_attempt jsonb;
  v_invalid_event_result jsonb;
  v_daily_result jsonb;
  v_daily_replay jsonb;
  v_daily_second_attempt jsonb;
  v_mission_cycle_key text := 'daily:' || to_char(now() at time zone 'utc', 'YYYY-MM-DD');
  v_mission_result jsonb;
  v_mission_replay jsonb;
  v_mission_second_attempt jsonb;
  v_generated_mission_result jsonb;
  v_node_claim_result jsonb;
  v_node_claim_replay jsonb;
  v_node_claim_second_attempt jsonb;
  v_sync_result jsonb;
  v_sync_replay jsonb;
  v_shop_purchase_count int;
  v_shop_daily_result jsonb;
  v_shop_daily_replay jsonb;
  v_shop_daily_second_result jsonb;
  v_shop_daily_third_result jsonb;
  v_shop_daily_limit_result jsonb;
  v_shop_arena_result jsonb;
  v_shop_arena_replay jsonb;
  v_shop_arena_second_result jsonb;
  v_shop_arena_limit_result jsonb;
  v_shop_resource_result jsonb;
  v_shop_progression_result jsonb;
  v_shop_shard_result jsonb;
  v_catalog_contents jsonb;
  v_catalog_daily_limit int;
  v_catalog_xp int;
  v_catalog_account_xp int;
  v_catalog_shards int;
  v_purchase_index int;
  v_catalog_target int;
  v_cache_claim_count int;
  v_catalog_cost int;
  v_catalog_fortress_cost jsonb;
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    'rpc-smoke@duskkeep.local',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  )
  on conflict (id) do nothing;

  insert into public.profiles (user_id, display_name)
  values (v_user_id, 'RPC Smoke')
  on conflict (user_id) do update set display_name = excluded.display_name
  returning id into v_profile_id;

  insert into public.player_resources (profile_id, gold, dust, gems, arena_tickets, adventure_keys)
  values (v_profile_id, 500, 50, 50, 5, 0)
  on conflict (profile_id) do update set
    gold = excluded.gold,
    dust = excluded.dust,
    gems = excluded.gems,
    arena_tickets = excluded.arena_tickets,
    adventure_keys = excluded.adventure_keys;

  delete from public.adventure_progress where profile_id = v_profile_id;

  insert into public.adventure_progress (
    profile_id,
    chapter_id,
    node_id,
    status,
    cleared,
    first_clear_taken,
    claimed,
    cleared_at
  )
  values (v_profile_id, 'chapter-1', 'c1l2', 'cleared', true, true, false, now())
  on conflict (profile_id, node_id) do update set
    status = excluded.status,
    cleared = excluded.cleared,
    first_clear_taken = excluded.first_clear_taken,
    claimed = excluded.claimed,
    cleared_at = excluded.cleared_at;

  delete from public.shop_purchases where profile_id = v_profile_id;
  delete from public.adventure_map_claims where profile_id = v_profile_id;
  delete from public.frontline_loadouts where profile_id = v_profile_id;
  delete from public.player_heroes where profile_id = v_profile_id;
  delete from public.player_frontline_cards where profile_id = v_profile_id;
  delete from public.player_frontline_fortress where profile_id = v_profile_id;
  delete from public.daily_login_claims where profile_id = v_profile_id;
  delete from public.missions_progress where profile_id = v_profile_id;
  delete from public.battle_results where profile_id = v_profile_id;
  delete from public.resource_ledger where profile_id = v_profile_id;
  delete from public.server_operations where profile_id = v_profile_id;

  perform public.provision_player_starter_state(v_profile_id);

  perform set_config('request.jwt.claim.sub', v_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  v_sync_result := public.sync_local_snapshot(
    'smoke-sync-local-20260514-0001',
    '1',
    jsonb_build_object(
      'account', jsonb_build_object('name', 'RPC Smoke', 'level', 4, 'xp', 240),
      'resources', jsonb_build_object('gold', 650, 'dust', 400, 'gems', 200, 'arenaTickets', 5, 'adventureKeys', 0),
      'heroes', jsonb_build_array(jsonb_build_object('heroId', 'bran', 'level', 3, 'stars', 2, 'shards', 25, 'xp', 40, 'skillLevel', 2)),
      'frontlineLoadout', jsonb_build_object(
        'leaderId', 'leader_aurora',
        'squad', '["bran","kara","mira"]'::jsonb,
        'deck', '["order_guard_wall","order_twin_slash","order_focus_fire","tactic_battle_hymn","tactic_sanctuary","tactic_smokescreen","summon_wolf","summon_barrier"]'::jsonb
      ),
      'frontlineCardUnlocks', jsonb_build_object('order_guard_wall', true),
      'frontlineCardLevels', jsonb_build_object('order_guard_wall', 2),
      'frontlineFortress', jsonb_build_object(
        'buildings', jsonb_build_object('keep', 3, 'treasury', 2, 'barracks', 1),
        'integrity', 92,
        'garrison', '["bran","kara","mira"]'::jsonb,
        'lastResolvedAt', null,
        'nextAttackAt', null,
        'raidsResolved', 2
      ),
      'adventureProgress', jsonb_build_object(),
      'adventureMapClaims', jsonb_build_object()
    )
  );
  if coalesce((v_sync_result ->> 'ok')::boolean, false) is not true then
    raise exception 'sync_local_snapshot failed: %', v_sync_result;
  end if;
  if coalesce((v_sync_result #>> '{result,normalizedSnapshot,resources,gold}')::int, 0) < 650 then
    raise exception 'Expected synced gold in normalized snapshot: %', v_sync_result;
  end if;
  if coalesce((v_sync_result #>> '{result,normalizedSnapshot,frontlineFortress,buildings,keep}')::int, 0) <> 3 then
    raise exception 'Expected synced Frontline Fortress keep level 3: %', v_sync_result;
  end if;

  v_sync_replay := public.sync_local_snapshot(
    'smoke-sync-local-20260514-0001',
    '1',
    jsonb_build_object(
      'account', jsonb_build_object('name', 'RPC Smoke', 'level', 4, 'xp', 240),
      'resources', jsonb_build_object('gold', 650, 'dust', 400, 'gems', 200, 'arenaTickets', 5, 'adventureKeys', 0),
      'heroes', jsonb_build_array(jsonb_build_object('heroId', 'bran', 'level', 3, 'stars', 2, 'shards', 25, 'xp', 40, 'skillLevel', 2)),
      'frontlineLoadout', jsonb_build_object(
        'leaderId', 'leader_aurora',
        'squad', '["bran","kara","mira"]'::jsonb,
        'deck', '["order_guard_wall","order_twin_slash","order_focus_fire","tactic_battle_hymn","tactic_sanctuary","tactic_smokescreen","summon_wolf","summon_barrier"]'::jsonb
      ),
      'frontlineCardUnlocks', jsonb_build_object('order_guard_wall', true),
      'frontlineCardLevels', jsonb_build_object('order_guard_wall', 2),
      'frontlineFortress', jsonb_build_object(
        'buildings', jsonb_build_object('keep', 3, 'treasury', 2, 'barracks', 1),
        'integrity', 92,
        'garrison', '["bran","kara","mira"]'::jsonb,
        'lastResolvedAt', null,
        'nextAttackAt', null,
        'raidsResolved', 2
      ),
      'adventureProgress', jsonb_build_object(),
      'adventureMapClaims', jsonb_build_object()
    )
  );
  if v_sync_replay <> v_sync_result then
    raise exception 'sync_local_snapshot is not idempotent: % <> %', v_sync_replay, v_sync_result;
  end if;

  v_loadout_result := public.save_frontline_loadout(
    'smoke-loadout-20260511-0001',
    'leader_aurora',
    '["bran","kara","mira"]'::jsonb,
    '["order_guard_wall","order_twin_slash","order_focus_fire","tactic_battle_hymn","tactic_sanctuary","tactic_smokescreen","summon_wolf","summon_barrier"]'::jsonb
  );
  if coalesce((v_loadout_result ->> 'ok')::boolean, false) is not true then
    raise exception 'save_frontline_loadout failed: %', v_loadout_result;
  end if;
  if coalesce(v_loadout_result #>> '{result,leaderId}', '') <> 'leader_aurora' then
    raise exception 'Expected saved leader_aurora loadout: %', v_loadout_result;
  end if;

  v_loadout_replay := public.save_frontline_loadout(
    'smoke-loadout-20260511-0001',
    'leader_aurora',
    '["bran","kara","mira"]'::jsonb,
    '["order_guard_wall","order_twin_slash","order_focus_fire","tactic_battle_hymn","tactic_sanctuary","tactic_smokescreen","summon_wolf","summon_barrier"]'::jsonb
  );
  if v_loadout_replay <> v_loadout_result then
    raise exception 'save_frontline_loadout is not idempotent: % <> %', v_loadout_replay, v_loadout_result;
  end if;

  v_invalid_loadout_result := public.save_frontline_loadout(
    'smoke-loadout-invalid-20260514-0001',
    'leader_aurora',
    '["bran","unknown_hero","mira"]'::jsonb,
    '["order_guard_wall","order_twin_slash","order_focus_fire","tactic_battle_hymn","tactic_sanctuary","tactic_smokescreen","summon_wolf","summon_barrier"]'::jsonb
  );
  if coalesce(v_invalid_loadout_result ->> 'code', '') <> 'invalid_loadout' then
    raise exception 'Expected invalid_loadout for unknown squad hero: %', v_invalid_loadout_result;
  end if;

  v_invalid_loadout_result := public.save_frontline_loadout(
    'smoke-loadout-invalid-20260514-0002',
    'leader_aurora',
    '["bran","kara","mira"]'::jsonb,
    '["order_guard_wall","order_twin_slash","order_focus_fire","tactic_battle_hymn","tactic_sanctuary","tactic_smokescreen","summon_wolf","unknown_card"]'::jsonb
  );
  if coalesce(v_invalid_loadout_result ->> 'code', '') <> 'invalid_loadout' then
    raise exception 'Expected invalid_loadout for unknown deck card: %', v_invalid_loadout_result;
  end if;

  v_hero_level_result := public.level_up_hero(
    'smoke-hero-level-20260514-0001',
    'bran'
  );
  if coalesce((v_hero_level_result ->> 'ok')::boolean, false) is not true then
    raise exception 'level_up_hero failed: %', v_hero_level_result;
  end if;
  if coalesce((v_hero_level_result #>> '{result,level}')::int, 0) <> 4 then
    raise exception 'Expected bran to reach level 4: %', v_hero_level_result;
  end if;
  if coalesce((v_hero_level_result #>> '{result,costPaid,gold}')::int, 0) <> 125 then
    raise exception 'Expected level 3 hero gold cost 125: %', v_hero_level_result;
  end if;

  v_hero_level_replay := public.level_up_hero(
    'smoke-hero-level-20260514-0001',
    'bran'
  );
  if v_hero_level_replay <> v_hero_level_result then
    raise exception 'level_up_hero is not idempotent: % <> %', v_hero_level_replay, v_hero_level_result;
  end if;

  if not exists (
    select 1
      from public.player_heroes
      where profile_id = v_profile_id
        and hero_id = 'bran'
        and unlocked = true
        and level = 4
  ) then
    raise exception 'Expected bran to be upgraded to level 4';
  end if;

  v_invalid_hero_level_result := public.level_up_hero(
    'smoke-hero-level-invalid-20260514-0001',
    'unknown_hero'
  );
  if coalesce(v_invalid_hero_level_result ->> 'code', '') <> 'invalid_request' then
    raise exception 'Expected invalid_request for unknown hero level up: %', v_invalid_hero_level_result;
  end if;

  v_hero_star_result := public.star_up_hero(
    'smoke-hero-star-20260514-0001',
    'bran'
  );
  if coalesce((v_hero_star_result ->> 'ok')::boolean, false) is not true then
    raise exception 'star_up_hero failed: %', v_hero_star_result;
  end if;
  if coalesce((v_hero_star_result #>> '{result,stars}')::int, 0) <> 3 then
    raise exception 'Expected bran to reach 3 stars: %', v_hero_star_result;
  end if;
  if coalesce((v_hero_star_result #>> '{result,shardsSpent}')::int, 0) <> 20 then
    raise exception 'Expected 2-star hero shard cost 20: %', v_hero_star_result;
  end if;
  if coalesce((v_hero_star_result #>> '{result,shards}')::int, -1) <> 5 then
    raise exception 'Expected bran to keep 5 shards after star up: %', v_hero_star_result;
  end if;

  v_hero_star_replay := public.star_up_hero(
    'smoke-hero-star-20260514-0001',
    'bran'
  );
  if v_hero_star_replay <> v_hero_star_result then
    raise exception 'star_up_hero is not idempotent: % <> %', v_hero_star_replay, v_hero_star_result;
  end if;

  v_invalid_hero_star_result := public.star_up_hero(
    'smoke-hero-star-invalid-20260514-0001',
    'unknown_hero'
  );
  if coalesce(v_invalid_hero_star_result ->> 'code', '') <> 'invalid_request' then
    raise exception 'Expected invalid_request for unknown hero star up: %', v_invalid_hero_star_result;
  end if;

  v_hero_skill_result := public.skill_up_hero(
    'smoke-hero-skill-20260514-0001',
    'bran'
  );
  if coalesce((v_hero_skill_result ->> 'ok')::boolean, false) is not true then
    raise exception 'skill_up_hero failed: %', v_hero_skill_result;
  end if;
  if coalesce((v_hero_skill_result #>> '{result,skillLevel}')::int, 0) <> 3 then
    raise exception 'Expected bran skill to reach level 3: %', v_hero_skill_result;
  end if;
  if coalesce((v_hero_skill_result #>> '{result,costPaid,dust}')::int, 0) <> 250 then
    raise exception 'Expected skill level 2 dust cost 250: %', v_hero_skill_result;
  end if;

  v_hero_skill_replay := public.skill_up_hero(
    'smoke-hero-skill-20260514-0001',
    'bran'
  );
  if v_hero_skill_replay <> v_hero_skill_result then
    raise exception 'skill_up_hero is not idempotent: % <> %', v_hero_skill_replay, v_hero_skill_result;
  end if;

  v_invalid_hero_skill_result := public.skill_up_hero(
    'smoke-hero-skill-invalid-20260514-0001',
    'unknown_hero'
  );
  if coalesce(v_invalid_hero_skill_result ->> 'code', '') <> 'invalid_request' then
    raise exception 'Expected invalid_request for unknown hero skill up: %', v_invalid_hero_skill_result;
  end if;

  v_card_upgrade_result := public.upgrade_frontline_card(
    'smoke-card-upgrade-20260514-0001',
    'order_twin_slash'
  );
  if coalesce((v_card_upgrade_result ->> 'ok')::boolean, false) is not true then
    raise exception 'upgrade_frontline_card failed: %', v_card_upgrade_result;
  end if;
  if coalesce((v_card_upgrade_result #>> '{result,level}')::int, 0) <> 2 then
    raise exception 'Expected upgraded card level 2: %', v_card_upgrade_result;
  end if;
  if coalesce((v_card_upgrade_result #>> '{result,costPaid,gold}')::int, 0) <> 135 then
    raise exception 'Expected level 1 card gold cost 135: %', v_card_upgrade_result;
  end if;

  v_card_upgrade_replay := public.upgrade_frontline_card(
    'smoke-card-upgrade-20260514-0001',
    'order_twin_slash'
  );
  if v_card_upgrade_replay <> v_card_upgrade_result then
    raise exception 'upgrade_frontline_card is not idempotent: % <> %', v_card_upgrade_replay, v_card_upgrade_result;
  end if;

  if not exists (
    select 1
      from public.player_frontline_cards
      where profile_id = v_profile_id
        and card_id = 'order_twin_slash'
        and unlocked = true
        and level = 2
  ) then
    raise exception 'Expected order_twin_slash to be upgraded to level 2';
  end if;

  v_invalid_card_upgrade_result := public.upgrade_frontline_card(
    'smoke-card-upgrade-invalid-20260514-0001',
    'enemy_order_bone_arrow'
  );
  if coalesce(v_invalid_card_upgrade_result ->> 'code', '') <> 'invalid_request' then
    raise exception 'Expected invalid_request for non-player card upgrade: %', v_invalid_card_upgrade_result;
  end if;

  v_fortress_upgrade_result := public.upgrade_frontline_fortress(
    'smoke-frontline-fortress-20260514-0001',
    'keep'
  );
  if coalesce((v_fortress_upgrade_result ->> 'ok')::boolean, false) is not true then
    raise exception 'upgrade_frontline_fortress failed: %', v_fortress_upgrade_result;
  end if;
  if coalesce((v_fortress_upgrade_result #>> '{result,level}')::int, 0) <> 4 then
    raise exception 'Expected keep to reach level 4 after imported snapshot: %', v_fortress_upgrade_result;
  end if;
  v_catalog_fortress_cost := public.frontline_fortress_building_cost('keep', 3);
  if coalesce((v_fortress_upgrade_result #>> '{result,costPaid,gold}')::int, 0) <> coalesce((v_catalog_fortress_cost ->> 'gold')::int, -1) then
    raise exception 'Expected keep level 3 gold cost to match catalog: % <> %', v_fortress_upgrade_result, v_catalog_fortress_cost;
  end if;
  if coalesce((v_fortress_upgrade_result #>> '{result,costPaid,dust}')::int, -1) <> coalesce((v_catalog_fortress_cost ->> 'dust')::int, -2) then
    raise exception 'Expected keep level 3 dust cost to match catalog: % <> %', v_fortress_upgrade_result, v_catalog_fortress_cost;
  end if;

  v_fortress_upgrade_replay := public.upgrade_frontline_fortress(
    'smoke-frontline-fortress-20260514-0001',
    'keep'
  );
  if v_fortress_upgrade_replay <> v_fortress_upgrade_result then
    raise exception 'upgrade_frontline_fortress is not idempotent: % <> %', v_fortress_upgrade_replay, v_fortress_upgrade_result;
  end if;

  if not exists (
    select 1
      from public.player_frontline_fortress
      where profile_id = v_profile_id
        and (buildings ->> 'keep')::int = 4
  ) then
    raise exception 'Expected keep to be upgraded to level 4';
  end if;

  v_invalid_fortress_upgrade_result := public.upgrade_frontline_fortress(
    'smoke-frontline-fortress-invalid-20260514-0001',
    'unknown'
  );
  if coalesce(v_invalid_fortress_upgrade_result ->> 'code', '') <> 'invalid_request' then
    raise exception 'Expected invalid_request for unknown fortress building: %', v_invalid_fortress_upgrade_result;
  end if;

  update public.player_frontline_fortress
    set next_attack_at = now() - interval '1 minute'
    where profile_id = v_profile_id;

  v_fortress_raid_result := public.resolve_frontline_fortress_raid(
    'smoke-frontline-fortress-raid-20260515-0001'
  );
  if coalesce((v_fortress_raid_result ->> 'ok')::boolean, false) is not true then
    raise exception 'resolve_frontline_fortress_raid failed: %', v_fortress_raid_result;
  end if;
  if coalesce(v_fortress_raid_result #>> '{result,report,outcome}', '') not in ('full_repel', 'partial_hold', 'breach') then
    raise exception 'Expected fortress raid outcome report: %', v_fortress_raid_result;
  end if;
  if coalesce((v_fortress_raid_result #>> '{result,frontlineFortress,raidsResolved}')::int, 0) <> 3 then
    raise exception 'Expected fortress raid to increment raidsResolved to 3: %', v_fortress_raid_result;
  end if;
  if coalesce((v_fortress_raid_result #>> '{result,resources,gold}')::int, 0) <= 0 then
    raise exception 'Expected fortress raid to return authoritative resources: %', v_fortress_raid_result;
  end if;

  v_fortress_raid_replay := public.resolve_frontline_fortress_raid(
    'smoke-frontline-fortress-raid-20260515-0001'
  );
  if v_fortress_raid_replay <> v_fortress_raid_result then
    raise exception 'resolve_frontline_fortress_raid is not idempotent: % <> %', v_fortress_raid_replay, v_fortress_raid_result;
  end if;

  v_fortress_raid_second_attempt := public.resolve_frontline_fortress_raid(
    'smoke-frontline-fortress-raid-20260515-0002'
  );
  if coalesce(v_fortress_raid_second_attempt ->> 'code', '') <> 'locked' then
    raise exception 'Expected second fortress raid to be blocked by cooldown: %', v_fortress_raid_second_attempt;
  end if;

  v_arena_result := public.record_arena_result(
    'smoke-arena-result-20260515-0001',
    'arena_bonewood',
    12345,
    'ally',
    6,
    '{"allyCoreHp":12,"enemyCoreHp":0}'::jsonb
  );
  if coalesce((v_arena_result ->> 'ok')::boolean, false) is not true then
    raise exception 'record_arena_result failed: %', v_arena_result;
  end if;
  select arena_ticket_cost
    into v_catalog_cost
    from public.server_arena_opponents
    where opponent_id = 'arena_bonewood'
      and enabled = true;
  if coalesce((v_arena_result #>> '{result,resources,arenaTickets}')::int, -1) <> (5 - v_catalog_cost) then
    raise exception 'Expected Arena result to consume exactly 1 ticket: %', v_arena_result;
  end if;
  select reward.rewards
    into v_catalog_contents
    from public.server_arena_opponents opponent
    join public.server_reward_definitions reward on reward.reward_id = opponent.win_reward_id
    where opponent.opponent_id = 'arena_bonewood'
      and opponent.enabled = true
      and reward.enabled = true;
  if (v_arena_result #> '{result,rewardsGranted}') <> v_catalog_contents then
    raise exception 'Arena win reward must match server arena catalog: % <> %', v_arena_result #> '{result,rewardsGranted}', v_catalog_contents;
  end if;
  if coalesce((v_arena_result #>> '{result,arenaWins}')::int, 0) <> 1 then
    raise exception 'Expected Arena win count 1: %', v_arena_result;
  end if;

  v_arena_replay := public.record_arena_result(
    'smoke-arena-result-20260515-0001',
    'arena_bonewood',
    12345,
    'ally',
    6,
    '{"allyCoreHp":12,"enemyCoreHp":0}'::jsonb
  );
  if v_arena_replay <> v_arena_result then
    raise exception 'record_arena_result is not idempotent: % <> %', v_arena_replay, v_arena_result;
  end if;

  v_invalid_arena_result := public.record_arena_result(
    'smoke-arena-result-invalid-20260515-0001',
    'unknown_rival',
    12345,
    'ally',
    6,
    '{}'::jsonb
  );
  if coalesce(v_invalid_arena_result ->> 'code', '') <> 'not_found' then
    raise exception 'Expected unsupported Arena opponent to be rejected: %', v_invalid_arena_result;
  end if;

  v_event_result := public.record_event_result(
    'smoke-event-result-20260515-0001',
    'gold_rush',
    22345,
    'ally',
    7,
    '{"allyCoreHp":12,"enemyCoreHp":0}'::jsonb
  );
  if coalesce((v_event_result ->> 'ok')::boolean, false) is not true then
    raise exception 'record_event_result failed: %', v_event_result;
  end if;
  if coalesce((v_event_result #>> '{result,firstClear}')::boolean, false) is not true then
    raise exception 'Expected first Event clear to be marked firstClear: %', v_event_result;
  end if;
  select reward.rewards
    into v_catalog_contents
    from public.server_event_definitions event_definition
    join public.server_reward_definitions reward on reward.reward_id = event_definition.daily_first_clear_reward_id
    where event_definition.event_id = 'gold_rush'
      and event_definition.enabled = true
      and reward.enabled = true;
  if (v_event_result #> '{result,rewardsGranted}') <> v_catalog_contents then
    raise exception 'Event first clear reward must match server event catalog: % <> %', v_event_result #> '{result,rewardsGranted}', v_catalog_contents;
  end if;

  v_event_replay := public.record_event_result(
    'smoke-event-result-20260515-0001',
    'gold_rush',
    22345,
    'ally',
    7,
    '{"allyCoreHp":12,"enemyCoreHp":0}'::jsonb
  );
  if v_event_replay <> v_event_result then
    raise exception 'record_event_result is not idempotent: % <> %', v_event_replay, v_event_result;
  end if;

  v_event_second_attempt := public.record_event_result(
    'smoke-event-result-20260515-0002',
    'gold_rush',
    22346,
    'ally',
    6,
    '{}'::jsonb
  );
  if coalesce((v_event_second_attempt ->> 'ok')::boolean, false) is not true then
    raise exception 'Second record_event_result attempt should return ok with no reward: %', v_event_second_attempt;
  end if;
  if coalesce((v_event_second_attempt #>> '{result,firstClear}')::boolean, true) is not false then
    raise exception 'Expected second Event clear in same day to not be firstClear: %', v_event_second_attempt;
  end if;
  if coalesce((v_event_second_attempt #>> '{result,rewardsGranted,gold}')::int, 0) <> 0 then
    raise exception 'Expected second Event clear in same day to grant no gold: %', v_event_second_attempt;
  end if;

  v_invalid_event_result := public.record_event_result(
    'smoke-event-result-invalid-20260515-0001',
    'unknown_event',
    22347,
    'ally',
    5,
    '{}'::jsonb
  );
  if coalesce(v_invalid_event_result ->> 'code', '') <> 'not_found' then
    raise exception 'Expected unsupported Event to be rejected: %', v_invalid_event_result;
  end if;

  v_daily_result := public.claim_daily_login(
    'smoke-daily-login-20260511-0001',
    to_char(now() at time zone 'utc', 'YYYY-MM-DD')
  );
  if coalesce((v_daily_result ->> 'ok')::boolean, false) is not true then
    raise exception 'claim_daily_login failed: %', v_daily_result;
  end if;
  select rewards
    into v_catalog_contents
    from public.server_reward_definitions
    where reward_id = coalesce(v_daily_result #>> '{result,rewardId}', 'daily_login_streak_1')
      and enabled = true;
  if (v_daily_result #> '{result,rewardsGranted}') <> v_catalog_contents then
    raise exception 'Daily login reward must match server reward definition: % <> %', v_daily_result #> '{result,rewardsGranted}', v_catalog_contents;
  end if;

  v_daily_replay := public.claim_daily_login(
    'smoke-daily-login-20260511-0001',
    to_char(now() at time zone 'utc', 'YYYY-MM-DD')
  );
  if v_daily_replay <> v_daily_result then
    raise exception 'claim_daily_login is not idempotent: % <> %', v_daily_replay, v_daily_result;
  end if;

  v_daily_second_attempt := public.claim_daily_login(
    'smoke-daily-login-20260511-0002',
    to_char(now() at time zone 'utc', 'YYYY-MM-DD')
  );
  if coalesce(v_daily_second_attempt ->> 'code', '') <> 'already_claimed' then
    raise exception 'Expected second daily login claim to be blocked: %', v_daily_second_attempt;
  end if;

  select target
    into v_catalog_target
    from public.server_mission_definitions
    where mission_id = 'd_battles_3'
      and enabled = true;

  insert into public.missions_progress (
    profile_id,
    mission_id,
    cycle_key,
    progress,
    target,
    claimed
  )
  values (v_profile_id, 'd_battles_3', v_mission_cycle_key, v_catalog_target, v_catalog_target, false)
  on conflict (profile_id, mission_id, cycle_key)
  do update set
    progress = v_catalog_target,
    target = v_catalog_target,
    claimed = false,
    updated_at = now();

  v_mission_result := public.claim_mission_reward(
    'smoke-mission-20260512-0001',
    'd_battles_3',
    v_mission_cycle_key
  );
  if coalesce((v_mission_result ->> 'ok')::boolean, false) is not true then
    raise exception 'claim_mission_reward failed: %', v_mission_result;
  end if;
  select reward.rewards, mission.target
    into v_catalog_contents, v_catalog_target
    from public.server_mission_definitions mission
    join public.server_reward_definitions reward on reward.reward_id = mission.reward_id
    where mission.mission_id = 'd_battles_3'
      and mission.enabled = true
      and reward.enabled = true;
  if (v_mission_result #> '{result,rewardsGranted}') <> v_catalog_contents then
    raise exception 'd_battles_3 reward must match server mission catalog: % <> %', v_mission_result #> '{result,rewardsGranted}', v_catalog_contents;
  end if;
  if coalesce((v_mission_result #>> '{result,rewardId}'), '') <> coalesce((select reward_id from public.server_mission_definitions where mission_id = 'd_battles_3'), '') then
    raise exception 'd_battles_3 response must include catalog rewardId: %', v_mission_result;
  end if;

  v_mission_replay := public.claim_mission_reward(
    'smoke-mission-20260512-0001',
    'd_battles_3',
    v_mission_cycle_key
  );
  if v_mission_replay <> v_mission_result then
    raise exception 'claim_mission_reward is not idempotent: % <> %', v_mission_replay, v_mission_result;
  end if;

  v_mission_second_attempt := public.claim_mission_reward(
    'smoke-mission-20260512-0002',
    'd_battles_3',
    v_mission_cycle_key
  );
  if coalesce(v_mission_second_attempt ->> 'code', '') <> 'already_claimed' then
    raise exception 'Expected second mission claim to be blocked: %', v_mission_second_attempt;
  end if;

  v_battle_result := public.claim_adventure_battle_result(
    'smoke-battle-20260511-0001',
    'c1l1',
    12345,
    'ally',
    6,
    '{"lanes":[]}'::jsonb
  );
  if coalesce((v_battle_result ->> 'ok')::boolean, false) is not true then
    raise exception 'claim_adventure_battle_result failed: %', v_battle_result;
  end if;
  if coalesce((v_battle_result #>> '{result,firstClear}')::boolean, false) is not true then
    raise exception 'Expected c1l1 first clear reward: %', v_battle_result;
  end if;
  select reward.rewards
    into v_catalog_contents
    from public.server_adventure_battle_nodes battle_node
    join public.server_reward_definitions reward on reward.reward_id = battle_node.first_clear_reward_id
    where battle_node.node_id = 'c1l1'
      and battle_node.enabled = true
      and reward.enabled = true;
  if (v_battle_result #> '{result,rewardsGranted}') <> v_catalog_contents then
    raise exception 'c1l1 first clear reward must match server battle catalog: % <> %', v_battle_result #> '{result,rewardsGranted}', v_catalog_contents;
  end if;

  v_battle_replay := public.claim_adventure_battle_result(
    'smoke-battle-20260511-0001',
    'c1l1',
    12345,
    'ally',
    6,
    '{"lanes":[]}'::jsonb
  );
  if v_battle_replay <> v_battle_result then
    raise exception 'claim_adventure_battle_result is not idempotent: % <> %', v_battle_replay, v_battle_result;
  end if;

  v_battle_second_clear := public.claim_adventure_battle_result(
    'smoke-battle-20260511-0002',
    'c1l1',
    12346,
    'ally',
    5,
    '{"lanes":[]}'::jsonb
  );
  if coalesce((v_battle_second_clear #>> '{result,firstClear}')::boolean, true) is not false then
    raise exception 'Expected replay to avoid first-clear rewards: %', v_battle_second_clear;
  end if;
  select reward.rewards
    into v_catalog_contents
    from public.server_adventure_battle_nodes battle_node
    join public.server_reward_definitions reward on reward.reward_id = battle_node.repeat_reward_id
    where battle_node.node_id = 'c1l1'
      and battle_node.enabled = true
      and reward.enabled = true;
  if (v_battle_second_clear #> '{result,rewardsGranted}') <> v_catalog_contents then
    raise exception 'c1l1 replay reward must match server battle catalog: % <> %', v_battle_second_clear #> '{result,rewardsGranted}', v_catalog_contents;
  end if;

  v_node_claim_result := public.claim_adventure_node_reward(
    'smoke-node-claim-20260511-0001',
    'c1l3'
  );
  if coalesce((v_node_claim_result ->> 'ok')::boolean, false) is not true then
    raise exception 'claim_adventure_node_reward failed: %', v_node_claim_result;
  end if;
  select reward.rewards
    into v_catalog_contents
    from public.server_adventure_node_rewards node_reward
    join public.server_reward_definitions reward on reward.reward_id = node_reward.reward_id
    where node_reward.node_id = 'c1l3'
      and node_reward.enabled = true
      and reward.enabled = true;
  if (v_node_claim_result #> '{result,rewardsGranted}') <> v_catalog_contents then
    raise exception 'c1l3 reward must match server adventure node catalog: % <> %', v_node_claim_result #> '{result,rewardsGranted}', v_catalog_contents;
  end if;
  if coalesce((v_node_claim_result #>> '{result,rewardId}'), '') <> coalesce((select reward_id from public.server_adventure_node_rewards where node_id = 'c1l3'), '') then
    raise exception 'c1l3 response must include catalog rewardId: %', v_node_claim_result;
  end if;

  v_node_claim_replay := public.claim_adventure_node_reward(
    'smoke-node-claim-20260511-0001',
    'c1l3'
  );
  if v_node_claim_replay <> v_node_claim_result then
    raise exception 'claim_adventure_node_reward is not idempotent: % <> %', v_node_claim_replay, v_node_claim_result;
  end if;

  v_node_claim_second_attempt := public.claim_adventure_node_reward(
    'smoke-node-claim-20260511-0002',
    'c1l3'
  );
  if coalesce(v_node_claim_second_attempt ->> 'code', '') <> 'already_claimed' then
    raise exception 'Expected second node claim to be blocked: %', v_node_claim_second_attempt;
  end if;

  if not exists (
    select 1
      from public.missions_progress
      where profile_id = v_profile_id
        and mission_id = 'd_adv_2'
        and cycle_key = v_mission_cycle_key
        and progress = 2
        and target = 2
        and claimed = false
  ) then
    raise exception 'Expected Adventure RPCs to advance d_adv_2 mission progress';
  end if;

  v_generated_mission_result := public.claim_mission_reward(
    'smoke-generated-mission-20260512-0001',
    'd_adv_2',
    v_mission_cycle_key
  );
  if coalesce((v_generated_mission_result ->> 'ok')::boolean, false) is not true then
    raise exception 'claim_mission_reward for generated Adventure progress failed: %', v_generated_mission_result;
  end if;
  select reward.rewards
    into v_catalog_contents
    from public.server_mission_definitions mission
    join public.server_reward_definitions reward on reward.reward_id = mission.reward_id
    where mission.mission_id = 'd_adv_2'
      and mission.enabled = true
      and reward.enabled = true;
  if (v_generated_mission_result #> '{result,rewardsGranted}') <> v_catalog_contents then
    raise exception 'd_adv_2 reward must match server mission catalog: % <> %', v_generated_mission_result #> '{result,rewardsGranted}', v_catalog_contents;
  end if;

  v_shop_result := public.purchase_shop_offer('smoke-shop-20260511-0001', 'adventure_key_ring', 1);
  if coalesce((v_shop_result ->> 'ok')::boolean, false) is not true then
    raise exception 'purchase_shop_offer failed: %', v_shop_result;
  end if;

  v_shop_replay := public.purchase_shop_offer('smoke-shop-20260511-0001', 'adventure_key_ring', 1);
  if v_shop_replay <> v_shop_result then
    raise exception 'purchase_shop_offer is not idempotent: % <> %', v_shop_replay, v_shop_result;
  end if;

  select count(*)
    into v_shop_purchase_count
    from public.shop_purchases
    where profile_id = v_profile_id
      and offer_id = 'adventure_key_ring';

  if v_shop_purchase_count <> 1 then
    raise exception 'Expected exactly 1 shop purchase, found %', v_shop_purchase_count;
  end if;

  select contents, daily_limit
    into v_catalog_contents, v_catalog_daily_limit
    from public.server_shop_offers
    where offer_id = 'daily_raid_payout';

  v_shop_daily_result := public.purchase_shop_offer('smoke-shop-daily-20260514-0001', 'daily_raid_payout', 1);
  if coalesce((v_shop_daily_result ->> 'ok')::boolean, false) is not true then
    raise exception 'purchase_shop_offer daily_raid_payout failed: %', v_shop_daily_result;
  end if;
  if (v_shop_daily_result #> '{result,contentsGranted}') <> v_catalog_contents then
    raise exception 'daily_raid_payout contents must match server catalog: % <> %', v_shop_daily_result #> '{result,contentsGranted}', v_catalog_contents;
  end if;
  if coalesce((v_shop_daily_result #>> '{result,remaining}')::int, -1) <> v_catalog_daily_limit - 1 then
    raise exception 'Expected daily_raid_payout remaining count to follow catalog limit: %', v_shop_daily_result;
  end if;

  v_shop_daily_replay := public.purchase_shop_offer('smoke-shop-daily-20260514-0001', 'daily_raid_payout', 1);
  if v_shop_daily_replay <> v_shop_daily_result then
    raise exception 'purchase_shop_offer daily_raid_payout is not idempotent: % <> %', v_shop_daily_replay, v_shop_daily_result;
  end if;

  v_purchase_index := 2;
  while v_purchase_index <= v_catalog_daily_limit loop
    v_shop_daily_second_result := public.purchase_shop_offer(
      'smoke-shop-daily-20260514-' || lpad(v_purchase_index::text, 4, '0'),
      'daily_raid_payout',
      1
    );
    if coalesce((v_shop_daily_second_result ->> 'ok')::boolean, false) is not true then
      raise exception 'daily_raid_payout purchase % should be allowed by catalog limit %: %', v_purchase_index, v_catalog_daily_limit, v_shop_daily_second_result;
    end if;
    if coalesce((v_shop_daily_second_result #>> '{result,remaining}')::int, -1) <> greatest(0, v_catalog_daily_limit - v_purchase_index) then
      raise exception 'daily_raid_payout remaining count must follow catalog limit after purchase %: %', v_purchase_index, v_shop_daily_second_result;
    end if;
    v_purchase_index := v_purchase_index + 1;
  end loop;

  v_shop_daily_limit_result := public.purchase_shop_offer(
    'smoke-shop-daily-20260514-' || lpad((v_catalog_daily_limit + 1)::text, 4, '0'),
    'daily_raid_payout',
    1
  );
  if coalesce(v_shop_daily_limit_result ->> 'code', '') <> 'daily_limit_reached' then
    raise exception 'Expected daily_raid_payout purchase after catalog limit % to be blocked: %', v_catalog_daily_limit, v_shop_daily_limit_result;
  end if;

  select contents, daily_limit
    into v_catalog_contents, v_catalog_daily_limit
    from public.server_shop_offers
    where offer_id = 'daily_arena_tickets';

  v_shop_arena_result := public.purchase_shop_offer('smoke-shop-arena-20260515-0001', 'daily_arena_tickets', 1);
  if coalesce((v_shop_arena_result ->> 'ok')::boolean, false) is not true then
    raise exception 'purchase_shop_offer daily_arena_tickets failed: %', v_shop_arena_result;
  end if;
  if (v_shop_arena_result #> '{result,contentsGranted}') <> v_catalog_contents then
    raise exception 'daily_arena_tickets contents must match server catalog: % <> %', v_shop_arena_result #> '{result,contentsGranted}', v_catalog_contents;
  end if;
  if coalesce((v_shop_arena_result #>> '{result,remaining}')::int, -1) <> greatest(0, v_catalog_daily_limit - 1) then
    raise exception 'Expected daily_arena_tickets remaining count 0 after purchase: %', v_shop_arena_result;
  end if;

  v_shop_arena_replay := public.purchase_shop_offer('smoke-shop-arena-20260515-0001', 'daily_arena_tickets', 1);
  if v_shop_arena_replay <> v_shop_arena_result then
    raise exception 'purchase_shop_offer daily_arena_tickets is not idempotent: % <> %', v_shop_arena_replay, v_shop_arena_result;
  end if;

  v_purchase_index := 2;
  while v_purchase_index <= v_catalog_daily_limit loop
    v_shop_arena_second_result := public.purchase_shop_offer(
      'smoke-shop-arena-20260515-' || lpad(v_purchase_index::text, 4, '0'),
      'daily_arena_tickets',
      1
    );
    if coalesce((v_shop_arena_second_result ->> 'ok')::boolean, false) is not true then
      raise exception 'daily_arena_tickets purchase % should be allowed by catalog limit %: %', v_purchase_index, v_catalog_daily_limit, v_shop_arena_second_result;
    end if;
    if coalesce((v_shop_arena_second_result #>> '{result,remaining}')::int, -1) <> greatest(0, v_catalog_daily_limit - v_purchase_index) then
      raise exception 'daily_arena_tickets remaining count must follow catalog limit after purchase %: %', v_purchase_index, v_shop_arena_second_result;
    end if;
    v_purchase_index := v_purchase_index + 1;
  end loop;

  v_shop_arena_limit_result := public.purchase_shop_offer(
    'smoke-shop-arena-20260515-' || lpad((v_catalog_daily_limit + 1)::text, 4, '0'),
    'daily_arena_tickets',
    1
  );
  if coalesce(v_shop_arena_limit_result ->> 'code', '') <> 'daily_limit_reached' then
    raise exception 'Expected daily_arena_tickets purchase after catalog limit % to be blocked: %', v_catalog_daily_limit, v_shop_arena_limit_result;
  end if;

  select contents
    into v_catalog_contents
    from public.server_shop_offers
    where offer_id = 'keep_construction_chest';

  v_shop_resource_result := public.purchase_shop_offer('smoke-shop-resource-20260515-0001', 'keep_construction_chest', 1);
  if coalesce((v_shop_resource_result ->> 'ok')::boolean, false) is not true then
    raise exception 'purchase_shop_offer keep_construction_chest failed: %', v_shop_resource_result;
  end if;
  if (v_shop_resource_result #> '{result,contentsGranted}') <> v_catalog_contents then
    raise exception 'keep_construction_chest contents must match server catalog: % <> %', v_shop_resource_result #> '{result,contentsGranted}', v_catalog_contents;
  end if;
  if (v_shop_resource_result #>> '{result,remaining}') is not null then
    raise exception 'Expected unlimited catalog offer remaining to be null: %', v_shop_resource_result;
  end if;

  select contents, coalesce((contents ->> 'xp')::int, 0), coalesce((contents ->> 'accountXp')::int, 0)
    into v_catalog_contents, v_catalog_xp, v_catalog_account_xp
    from public.server_shop_offers
    where offer_id = 'daily_command_drill';

  v_shop_progression_result := public.purchase_shop_offer('smoke-shop-progression-20260515-0001', 'daily_command_drill', 1);
  if coalesce((v_shop_progression_result ->> 'ok')::boolean, false) is not true then
    raise exception 'purchase_shop_offer daily_command_drill failed: %', v_shop_progression_result;
  end if;
  if (v_shop_progression_result #> '{result,contentsGranted}') <> v_catalog_contents then
    raise exception 'daily_command_drill contents must match server catalog: % <> %', v_shop_progression_result #> '{result,contentsGranted}', v_catalog_contents;
  end if;
  if coalesce((v_shop_progression_result #>> '{result,requiresSnapshotRefresh}')::boolean, false) is not true then
    raise exception 'Expected daily_command_drill to require snapshot refresh: %', v_shop_progression_result;
  end if;
  if not exists (
    select 1
      from public.profiles
      where id = v_profile_id
        and account_xp >= v_catalog_account_xp
  ) then
    raise exception 'Expected daily_command_drill to grant account xp';
  end if;
  if not exists (
    select 1
      from public.player_heroes
      where profile_id = v_profile_id
        and hero_id = 'bran'
        and xp >= v_catalog_xp
  ) then
    raise exception 'Expected daily_command_drill to grant squad hero xp';
  end if;

  select contents, coalesce((contents #>> '{shards,0,amount}')::int, 0)
    into v_catalog_contents, v_catalog_shards
    from public.server_shop_offers
    where offer_id = 'shard_bran_pack';

  v_shop_shard_result := public.purchase_shop_offer('smoke-shop-shard-20260515-0001', 'shard_bran_pack', 1);
  if coalesce((v_shop_shard_result ->> 'ok')::boolean, false) is not true then
    raise exception 'purchase_shop_offer shard_bran_pack failed: %', v_shop_shard_result;
  end if;
  if (v_shop_shard_result #> '{result,contentsGranted}') <> v_catalog_contents then
    raise exception 'shard_bran_pack contents must match server catalog: % <> %', v_shop_shard_result #> '{result,contentsGranted}', v_catalog_contents;
  end if;
  if coalesce((v_shop_shard_result #>> '{result,requiresSnapshotRefresh}')::boolean, false) is not true then
    raise exception 'Expected shard_bran_pack to require snapshot refresh: %', v_shop_shard_result;
  end if;
  if not exists (
    select 1
      from public.player_heroes
      where profile_id = v_profile_id
        and hero_id = 'bran'
        and shards >= v_catalog_shards
  ) then
    raise exception 'Expected shard_bran_pack to grant Bran shards';
  end if;

  v_cache_result := public.open_adventure_map_interaction('smoke-cache-20260511-0001', 'c1-lower-cache');
  if coalesce((v_cache_result ->> 'ok')::boolean, false) is not true then
    raise exception 'open_adventure_map_interaction failed: %', v_cache_result;
  end if;

  v_cache_replay := public.open_adventure_map_interaction('smoke-cache-20260511-0001', 'c1-lower-cache');
  if v_cache_replay <> v_cache_result then
    raise exception 'open_adventure_map_interaction is not idempotent: % <> %', v_cache_replay, v_cache_result;
  end if;

  select reward.rewards
    into v_catalog_contents
    from public.adventure_map_claims claim
    join public.server_adventure_map_loot_entries loot
      on loot.interaction_id = claim.interaction_id
     and loot.loot_id = claim.loot_id
    join public.server_reward_definitions reward on reward.reward_id = loot.reward_id
    where claim.profile_id = v_profile_id
      and claim.interaction_id = 'c1-lower-cache'
      and loot.enabled = true
      and reward.enabled = true;

  if (v_cache_result #> '{result,rewardsGranted}') <> v_catalog_contents then
    raise exception 'Cache reward must match server map loot catalog: % <> %', v_cache_result #> '{result,rewardsGranted}', v_catalog_contents;
  end if;

  select count(*)
    into v_cache_claim_count
    from public.adventure_map_claims
    where profile_id = v_profile_id
      and interaction_id = 'c1-lower-cache'
      and claimed = true;

  if v_cache_claim_count <> 1 then
    raise exception 'Expected exactly 1 cache claim, found %', v_cache_claim_count;
  end if;

  if not exists (
    select 1
      from public.player_resources
      where profile_id = v_profile_id
        and adventure_keys = 0
  ) then
    raise exception 'Expected adventure key to be consumed after cache open';
  end if;

  raise notice 'Adventure/Shop RPC smoke test passed.';
end;
$$;
