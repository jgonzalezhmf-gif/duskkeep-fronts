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
  v_daily_result jsonb;
  v_daily_replay jsonb;
  v_daily_second_attempt jsonb;
  v_node_claim_result jsonb;
  v_node_claim_replay jsonb;
  v_node_claim_second_attempt jsonb;
  v_shop_purchase_count int;
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
  delete from public.daily_login_claims where profile_id = v_profile_id;
  delete from public.resource_ledger where profile_id = v_profile_id;
  delete from public.server_operations where profile_id = v_profile_id;

  perform set_config('request.jwt.claim.sub', v_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

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
