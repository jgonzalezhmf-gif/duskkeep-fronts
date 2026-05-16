-- Smoke test local para la RPC read-only de snapshot de jugador.
-- Requiere `npx.cmd supabase start` o `npx.cmd supabase db reset`.
--
-- Ejecutar con:
-- npm.cmd run smoke:supabase:snapshot

do $$
declare
  v_user_id uuid := '33333333-3333-4333-8333-333333333333';
  v_other_user_id uuid := '44444444-4444-4444-8444-444444444444';
  v_profile_id uuid;
  v_other_profile_id uuid;
  v_snapshot_result jsonb;
  v_other_result jsonb;
begin
  delete from public.shop_purchases
    where profile_id in (select id from public.profiles where user_id in (v_user_id, v_other_user_id));
  delete from public.adventure_map_claims
    where profile_id in (select id from public.profiles where user_id in (v_user_id, v_other_user_id));
  delete from public.adventure_progress
    where profile_id in (select id from public.profiles where user_id in (v_user_id, v_other_user_id));
  delete from public.frontline_loadouts
    where profile_id in (select id from public.profiles where user_id in (v_user_id, v_other_user_id));
  delete from public.player_frontline_cards
    where profile_id in (select id from public.profiles where user_id in (v_user_id, v_other_user_id));
  delete from public.player_heroes
    where profile_id in (select id from public.profiles where user_id in (v_user_id, v_other_user_id));
  delete from public.player_resources
    where profile_id in (select id from public.profiles where user_id in (v_user_id, v_other_user_id));
  delete from public.profiles
    where user_id in (v_user_id, v_other_user_id);
  delete from auth.users
    where id in (v_user_id, v_other_user_id);

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
  values
    (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'snapshot-smoke@duskkeep.local',
      '',
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      v_other_user_id,
      'authenticated',
      'authenticated',
      'snapshot-other@duskkeep.local',
      '',
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    );

  insert into public.profiles (user_id, display_name, account_level, account_xp)
  values (v_user_id, 'Snapshot Smoke', 5, 420)
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    account_level = excluded.account_level,
    account_xp = excluded.account_xp
  returning id into v_profile_id;

  insert into public.profiles (user_id, display_name, account_level, account_xp)
  values (v_other_user_id, 'Other Smoke', 2, 40)
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    account_level = excluded.account_level,
    account_xp = excluded.account_xp
  returning id into v_other_profile_id;

  insert into public.player_resources (profile_id, gold, dust, gems, arena_tickets, adventure_keys)
  values
    (v_profile_id, 700, 90, 55, 4, 2),
    (v_other_profile_id, 100, 10, 5, 1, 0)
  on conflict (profile_id) do update set
    gold = excluded.gold,
    dust = excluded.dust,
    gems = excluded.gems,
    arena_tickets = excluded.arena_tickets,
    adventure_keys = excluded.adventure_keys;

  insert into public.player_heroes (profile_id, hero_id, level, stars, shards, xp, skill_level, unlocked)
  values (v_profile_id, 'bran', 3, 2, 12, 40, 2, true)
  on conflict (profile_id, hero_id) do update set
    level = excluded.level,
    stars = excluded.stars,
    shards = excluded.shards,
    xp = excluded.xp,
    skill_level = excluded.skill_level,
    unlocked = excluded.unlocked;

  insert into public.player_frontline_cards (profile_id, card_id, unlocked, level)
  values (v_profile_id, 'order_guard_wall', true, 2)
  on conflict (profile_id, card_id) do update set
    unlocked = excluded.unlocked,
    level = excluded.level;

  insert into public.frontline_loadouts (profile_id, leader_id, squad, deck)
  values (
    v_profile_id,
    'leader_aurora',
    '["bran","kara","mira"]'::jsonb,
    '["order_guard_wall","order_twin_slash","order_focus_fire","tactic_battle_hymn","tactic_sanctuary","tactic_smokescreen","summon_wolf","summon_barrier"]'::jsonb
  )
  on conflict (profile_id) do update set
    leader_id = excluded.leader_id,
    squad = excluded.squad,
    deck = excluded.deck;

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
  values (v_profile_id, 'chapter-1', 'c1l2', 'cleared', true, true, false, now());

  insert into public.battle_results (
    profile_id,
    source,
    node_id,
    event_id,
    arena_opponent_id,
    preset_id,
    seed,
    winner,
    turns,
    summary,
    rewards,
    created_at
  )
  values
    (
      v_profile_id,
      'adventure',
      'c1l2',
      null,
      null,
      'c1l2',
      101,
      'ally',
      3,
      '{"allyCoreHp":12,"enemyCoreHp":0,"round":3,"winner":"ally"}'::jsonb,
      '{"gold":80}'::jsonb,
      now()
    ),
    (
      v_profile_id,
      'arena',
      null,
      null,
      'arena-smoke-opponent',
      'arena-smoke',
      102,
      'enemy',
      4,
      '{"allyCoreHp":0,"enemyCoreHp":7,"round":4,"winner":"enemy"}'::jsonb,
      '{}'::jsonb,
      now()
    ),
    (
      v_profile_id,
      'event',
      null,
      'event-smoke',
      null,
      'event-smoke',
      103,
      'ally',
      8,
      '{"allyCoreHp":10,"enemyCoreHp":4,"round":8,"winner":"ally"}'::jsonb,
      '{"dust":15}'::jsonb,
      now()
    );

  perform set_config('request.jwt.claim.sub', v_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  v_snapshot_result := public.get_player_snapshot();

  if coalesce((v_snapshot_result ->> 'ok')::boolean, false) is not true then
    raise exception 'get_player_snapshot failed: %', v_snapshot_result;
  end if;

  if v_snapshot_result #>> '{result,profileId}' <> v_profile_id::text then
    raise exception 'Expected own profile id in snapshot: %', v_snapshot_result;
  end if;

  if coalesce((v_snapshot_result #>> '{result,snapshot,resources,gold}')::int, 0) <> 700 then
    raise exception 'Expected own resources in snapshot: %', v_snapshot_result;
  end if;

  if v_snapshot_result #>> '{result,snapshot,account,name}' <> 'Snapshot Smoke' then
    raise exception 'Expected own account in snapshot: %', v_snapshot_result;
  end if;

  if v_snapshot_result #>> '{result,snapshot,frontlineCardLevels,order_guard_wall}' <> '2' then
    raise exception 'Expected card levels in snapshot: %', v_snapshot_result;
  end if;

  if coalesce((v_snapshot_result #>> '{result,snapshot,battleStats,battlesWon}')::int, 0) <> 2 then
    raise exception 'Expected battle win stats in snapshot: %', v_snapshot_result;
  end if;

  if coalesce((v_snapshot_result #>> '{result,snapshot,battleStats,arenaLosses}')::int, 0) <> 1 then
    raise exception 'Expected arena loss stats in snapshot: %', v_snapshot_result;
  end if;

  if coalesce((v_snapshot_result #>> '{result,snapshot,eventsPlayed,event-smoke}')::int, 0) <> 1 then
    raise exception 'Expected event play counters in snapshot: %', v_snapshot_result;
  end if;

  if v_snapshot_result #>> '{result,snapshot,eventCompletions,event-smoke}' is null then
    raise exception 'Expected event completion counters in snapshot: %', v_snapshot_result;
  end if;

  if v_snapshot_result::text like '%' || v_other_profile_id::text || '%' then
    raise exception 'Snapshot leaked another profile id: %', v_snapshot_result;
  end if;

  perform set_config('request.jwt.claim.sub', v_other_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  v_other_result := public.get_player_snapshot();

  if v_other_result #>> '{result,profileId}' <> v_other_profile_id::text then
    raise exception 'Expected other user to only read its own profile: %', v_other_result;
  end if;

  if v_other_result::text like '%' || v_profile_id::text || '%' then
    raise exception 'Other snapshot leaked first profile id: %', v_other_result;
  end if;

  raise notice 'Player snapshot RPC smoke test passed.';
end;
$$;
