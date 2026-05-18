-- Smoke test local para Ladder MVP.
-- Ejecutar con:
-- npx.cmd supabase db query --local --file supabase/smoke-tests/ladder_rpc.sql --output table

do $$
declare
  v_user_id uuid := '22222222-2222-4222-8222-222222222222';
  v_profile_id uuid;
  v_result jsonb;
  v_replay jsonb;
  v_locked jsonb;
  v_reduced jsonb;
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
    'ladder-smoke@duskkeep.local',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  )
  on conflict (id) do nothing;

  insert into public.profiles (user_id, display_name)
  values (v_user_id, 'Ladder Smoke')
  on conflict (user_id) do update set display_name = excluded.display_name
  returning id into v_profile_id;

  delete from public.battle_results where profile_id = v_profile_id;
  delete from public.player_ladder_daily_state where profile_id = v_profile_id;
  delete from public.player_ladder_state where profile_id = v_profile_id;
  delete from public.resource_ledger where profile_id = v_profile_id;
  delete from public.server_operations where profile_id = v_profile_id;

  insert into public.player_resources (profile_id, gold, dust, gems, arena_tickets, adventure_keys)
  values (v_profile_id, 500, 50, 50, 5, 0)
  on conflict (profile_id) do update set
    gold = excluded.gold,
    dust = excluded.dust,
    gems = excluded.gems,
    arena_tickets = excluded.arena_tickets,
    adventure_keys = excluded.adventure_keys;

  perform set_config('request.jwt.claim.sub', v_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  v_result := public.record_ladder_result(
    'smoke-ladder-20260517-0001',
    'ladder_bronze_iii_iron_vow',
    12345,
    'ally',
    7,
    '{"round":7,"winner":"ally","allyCoreHp":12,"enemyCoreHp":0}'::jsonb
  );

  if coalesce((v_result ->> 'ok')::boolean, false) is not true then
    raise exception 'record_ladder_result failed: %', v_result;
  end if;

  if coalesce((v_result #>> '{result,ladder,points}')::int, 0) <> 25 then
    raise exception 'Expected ladder points 25: %', v_result;
  end if;

  if v_result #>> '{result,rewardMode}' <> 'normal' then
    raise exception 'Expected normal reward mode: %', v_result;
  end if;

  if coalesce((v_result #>> '{result,keyProgressDelta}')::int, 0) <= 0 then
    raise exception 'Expected positive key progress: %', v_result;
  end if;

  v_replay := public.record_ladder_result(
    'smoke-ladder-20260517-0001',
    'ladder_bronze_iii_iron_vow',
    12345,
    'ally',
    7,
    '{"round":7,"winner":"ally","allyCoreHp":12,"enemyCoreHp":0}'::jsonb
  );

  if v_replay <> v_result then
    raise exception 'Ladder idempotency replay changed result: % / %', v_result, v_replay;
  end if;

  v_locked := public.record_ladder_result(
    'smoke-ladder-20260517-0002',
    'ladder_bronze_ii_ash_squire',
    12346,
    'ally',
    7,
    '{"round":7,"winner":"ally","allyCoreHp":12,"enemyCoreHp":0}'::jsonb
  );

  if v_locked ->> 'code' <> 'locked' then
    raise exception 'Expected locked opponent response: %', v_locked;
  end if;

  update public.player_ladder_daily_state
    set rewarded_wins = 5
    where profile_id = v_profile_id
      and season_id = 'alpha_s1'
      and cycle_key = to_char(now() at time zone 'utc', 'YYYY-MM-DD');

  v_reduced := public.record_ladder_result(
    'smoke-ladder-20260517-0003',
    'ladder_bronze_iii_iron_vow',
    12347,
    'ally',
    7,
    '{"round":7,"winner":"ally","allyCoreHp":12,"enemyCoreHp":0}'::jsonb
  );

  if coalesce((v_reduced ->> 'ok')::boolean, false) is not true
    or v_reduced #>> '{result,rewardMode}' <> 'reduced'
    or coalesce((v_reduced #>> '{result,keyProgressDelta}')::int, -1) <> 0 then
    raise exception 'Expected reduced no-key-progress reward after daily limit: %', v_reduced;
  end if;

  raise notice 'Ladder RPC smoke test passed.';
end;
$$;
