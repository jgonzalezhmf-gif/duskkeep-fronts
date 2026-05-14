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
  v_shop_arena_result jsonb;
  v_shop_arena_replay jsonb;
  v_shop_arena_second_result jsonb;
  v_shop_resource_result jsonb;
  v_cache_claim_count int;
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
  if coalesce((v_fortress_upgrade_result #>> '{result,costPaid,gold}')::int, 0) <> 209 then
    raise exception 'Expected keep level 3 gold cost 209: %', v_fortress_upgrade_result;
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
  if coalesce((v_arena_result #>> '{result,resources,arenaTickets}')::int, -1) <> 4 then
    raise exception 'Expected Arena result to consume exactly 1 ticket: %', v_arena_result;
  end if;
  if coalesce((v_arena_result #>> '{result,rewardsGranted,gems}')::int, 0) <> 3 then
    raise exception 'Expected arena_bonewood win to grant 3 gems: %', v_arena_result;
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
  if coalesce((v_event_result #>> '{result,rewardsGranted,gold}')::int, 0) <> 400 then
    raise exception 'Expected gold_rush first clear to grant 400 gold: %', v_event_result;
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
  if coalesce((v_daily_result #>> '{result,rewardsGranted,gold}')::int, 0) <> 150 then
    raise exception 'Expected daily login day 1 gold reward: %', v_daily_result;
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

  insert into public.missions_progress (
    profile_id,
    mission_id,
    cycle_key,
    progress,
    target,
    claimed
  )
  values (v_profile_id, 'd_battles_3', v_mission_cycle_key, 3, 3, false)
  on conflict (profile_id, mission_id, cycle_key)
  do update set
    progress = 3,
    target = 3,
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
  if coalesce((v_mission_result #>> '{result,rewardsGranted,gold}')::int, 0) <> 100 then
    raise exception 'Expected d_battles_3 gold reward: %', v_mission_result;
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
  if coalesce((v_battle_second_clear #>> '{result,rewardsGranted,gold}')::int, 0) <> 16 then
    raise exception 'Expected c1l1 replay gold to be 16: %', v_battle_second_clear;
  end if;

  v_node_claim_result := public.claim_adventure_node_reward(
    'smoke-node-claim-20260511-0001',
    'c1l3'
  );
  if coalesce((v_node_claim_result ->> 'ok')::boolean, false) is not true then
    raise exception 'claim_adventure_node_reward failed: %', v_node_claim_result;
  end if;
  if coalesce(v_node_claim_result #>> '{result,rewardsGranted,frontlineCards,0,cardId}', '') <> 'order_shadow_dive' then
    raise exception 'Expected c1l3 to unlock order_shadow_dive: %', v_node_claim_result;
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
  if coalesce((v_generated_mission_result #>> '{result,rewardsGranted,gems}')::int, 0) <> 5 then
    raise exception 'Expected d_adv_2 generated claim to grant gems: %', v_generated_mission_result;
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

  v_shop_daily_result := public.purchase_shop_offer('smoke-shop-daily-20260514-0001', 'daily_raid_payout', 1);
  if coalesce((v_shop_daily_result ->> 'ok')::boolean, false) is not true then
    raise exception 'purchase_shop_offer daily_raid_payout failed: %', v_shop_daily_result;
  end if;
  if coalesce((v_shop_daily_result #>> '{result,contentsGranted,gold}')::int, 0) <> 450 then
    raise exception 'Expected daily_raid_payout to grant 450 gold: %', v_shop_daily_result;
  end if;
  if coalesce((v_shop_daily_result #>> '{result,remaining}')::int, -1) <> 1 then
    raise exception 'Expected daily_raid_payout remaining count 1 after first purchase: %', v_shop_daily_result;
  end if;

  v_shop_daily_replay := public.purchase_shop_offer('smoke-shop-daily-20260514-0001', 'daily_raid_payout', 1);
  if v_shop_daily_replay <> v_shop_daily_result then
    raise exception 'purchase_shop_offer daily_raid_payout is not idempotent: % <> %', v_shop_daily_replay, v_shop_daily_result;
  end if;

  v_shop_daily_second_result := public.purchase_shop_offer('smoke-shop-daily-20260514-0002', 'daily_raid_payout', 1);
  if coalesce((v_shop_daily_second_result ->> 'ok')::boolean, false) is not true then
    raise exception 'Second daily_raid_payout purchase should be allowed: %', v_shop_daily_second_result;
  end if;
  if coalesce((v_shop_daily_second_result #>> '{result,remaining}')::int, -1) <> 0 then
    raise exception 'Expected daily_raid_payout remaining count 0 after second purchase: %', v_shop_daily_second_result;
  end if;

  v_shop_daily_third_result := public.purchase_shop_offer('smoke-shop-daily-20260514-0003', 'daily_raid_payout', 1);
  if coalesce(v_shop_daily_third_result ->> 'code', '') <> 'daily_limit_reached' then
    raise exception 'Expected third daily_raid_payout purchase to hit daily limit: %', v_shop_daily_third_result;
  end if;

  v_shop_arena_result := public.purchase_shop_offer('smoke-shop-arena-20260515-0001', 'daily_arena_tickets', 1);
  if coalesce((v_shop_arena_result ->> 'ok')::boolean, false) is not true then
    raise exception 'purchase_shop_offer daily_arena_tickets failed: %', v_shop_arena_result;
  end if;
  if coalesce((v_shop_arena_result #>> '{result,contentsGranted,arenaTickets}')::int, 0) <> 3 then
    raise exception 'Expected daily_arena_tickets to grant 3 tickets: %', v_shop_arena_result;
  end if;
  if coalesce((v_shop_arena_result #>> '{result,remaining}')::int, -1) <> 0 then
    raise exception 'Expected daily_arena_tickets remaining count 0 after purchase: %', v_shop_arena_result;
  end if;

  v_shop_arena_replay := public.purchase_shop_offer('smoke-shop-arena-20260515-0001', 'daily_arena_tickets', 1);
  if v_shop_arena_replay <> v_shop_arena_result then
    raise exception 'purchase_shop_offer daily_arena_tickets is not idempotent: % <> %', v_shop_arena_replay, v_shop_arena_result;
  end if;

  v_shop_arena_second_result := public.purchase_shop_offer('smoke-shop-arena-20260515-0002', 'daily_arena_tickets', 1);
  if coalesce(v_shop_arena_second_result ->> 'code', '') <> 'daily_limit_reached' then
    raise exception 'Expected second daily_arena_tickets purchase to hit daily limit: %', v_shop_arena_second_result;
  end if;

  v_shop_resource_result := public.purchase_shop_offer('smoke-shop-resource-20260515-0001', 'keep_construction_chest', 1);
  if coalesce((v_shop_resource_result ->> 'ok')::boolean, false) is not true then
    raise exception 'purchase_shop_offer keep_construction_chest failed: %', v_shop_resource_result;
  end if;
  if coalesce((v_shop_resource_result #>> '{result,contentsGranted,gold}')::int, 0) <> 2200 then
    raise exception 'Expected keep_construction_chest to grant 2200 gold from server catalog: %', v_shop_resource_result;
  end if;
  if (v_shop_resource_result #>> '{result,remaining}') is not null then
    raise exception 'Expected unlimited catalog offer remaining to be null: %', v_shop_resource_result;
  end if;

  v_cache_result := public.open_adventure_map_interaction('smoke-cache-20260511-0001', 'c1-lower-cache');
  if coalesce((v_cache_result ->> 'ok')::boolean, false) is not true then
    raise exception 'open_adventure_map_interaction failed: %', v_cache_result;
  end if;

  v_cache_replay := public.open_adventure_map_interaction('smoke-cache-20260511-0001', 'c1-lower-cache');
  if v_cache_replay <> v_cache_result then
    raise exception 'open_adventure_map_interaction is not idempotent: % <> %', v_cache_replay, v_cache_result;
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
