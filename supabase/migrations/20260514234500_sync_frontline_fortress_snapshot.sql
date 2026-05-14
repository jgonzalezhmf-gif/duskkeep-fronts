-- Duskkeep Fronts - importacion de Frontline Fortress en snapshot local.
-- Reemplaza sync_local_snapshot para aceptar el subestado whitelisted
-- `frontlineFortress` usado por la Fortress visible.

create or replace function public.sync_local_snapshot(
  p_idempotency_key text,
  p_local_version text,
  p_snapshot jsonb
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
  v_result jsonb;
  v_account jsonb := coalesce(p_snapshot -> 'account', '{}'::jsonb);
  v_resources jsonb := coalesce(p_snapshot -> 'resources', '{}'::jsonb);
  v_loadout jsonb := p_snapshot -> 'frontlineLoadout';
  v_frontline_fortress jsonb := p_snapshot -> 'frontlineFortress';
  v_name text;
  v_level int := 1;
  v_xp int := 0;
  v_gold int := 500;
  v_dust int := 50;
  v_gems int := 50;
  v_arena_tickets int := 5;
  v_adventure_keys int := 0;
  v_key text;
  v_value jsonb;
  v_id_pattern text := '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]{0,95}$';
  v_status text;
  v_ff_keep int := 1;
  v_ff_treasury int := 1;
  v_ff_barracks int := 1;
  v_ff_integrity int := 100;
  v_ff_raids_resolved int := 0;
  v_ff_garrison jsonb := '["bran","kara","mira"]'::jsonb;
  v_garrison_valid boolean := true;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_local_version is null or length(trim(p_local_version)) < 1 or length(trim(p_local_version)) > 32 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid local version');
  end if;

  if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid snapshot shape');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(
    digest('syncLocalSnapshot:' || p_local_version || ':' || p_snapshot::text, 'sha256'),
    'hex'
  );

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'syncLocalSnapshot'
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

  insert into public.server_operations (
    id,
    profile_id,
    idempotency_key,
    operation_type,
    payload_hash,
    status,
    result,
    created_at
  )
  values (
    v_operation_id,
    v_profile_id,
    p_idempotency_key,
    'syncLocalSnapshot',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now
  );

  if jsonb_typeof(v_account -> 'name') = 'string' then
    v_name := left(nullif(trim(v_account ->> 'name'), ''), 48);
  end if;
  if jsonb_typeof(v_account -> 'level') = 'number' then
    v_level := least(greatest((v_account ->> 'level')::numeric, 1), 60)::int;
  end if;
  if jsonb_typeof(v_account -> 'xp') = 'number' then
    v_xp := least(greatest((v_account ->> 'xp')::numeric, 0), 1000000)::int;
  end if;

  if jsonb_typeof(v_resources -> 'gold') = 'number' then
    v_gold := least(greatest((v_resources ->> 'gold')::numeric, 0), 200000)::int;
  end if;
  if jsonb_typeof(v_resources -> 'dust') = 'number' then
    v_dust := least(greatest((v_resources ->> 'dust')::numeric, 0), 100000)::int;
  end if;
  if jsonb_typeof(v_resources -> 'gems') = 'number' then
    v_gems := least(greatest((v_resources ->> 'gems')::numeric, 0), 10000)::int;
  end if;
  if jsonb_typeof(v_resources -> 'arenaTickets') = 'number' then
    v_arena_tickets := least(greatest((v_resources ->> 'arenaTickets')::numeric, 0), 99)::int;
  end if;
  if jsonb_typeof(v_resources -> 'adventureKeys') = 'number' then
    v_adventure_keys := least(greatest((v_resources ->> 'adventureKeys')::numeric, 0), 99)::int;
  end if;

  update public.profiles
    set display_name = coalesce(v_name, display_name),
        account_level = greatest(account_level, v_level),
        account_xp = greatest(account_xp, v_xp)
    where id = v_profile_id;

  insert into public.player_resources (profile_id, gold, dust, gems, arena_tickets, adventure_keys)
  values (v_profile_id, v_gold, v_dust, v_gems, v_arena_tickets, v_adventure_keys)
  on conflict (profile_id) do update set
    gold = greatest(public.player_resources.gold, excluded.gold),
    dust = greatest(public.player_resources.dust, excluded.dust),
    gems = greatest(public.player_resources.gems, excluded.gems),
    arena_tickets = greatest(public.player_resources.arena_tickets, excluded.arena_tickets),
    adventure_keys = greatest(public.player_resources.adventure_keys, excluded.adventure_keys);

  if jsonb_typeof(p_snapshot -> 'heroes') = 'array' and jsonb_array_length(p_snapshot -> 'heroes') <= 64 then
    for v_value in select value from jsonb_array_elements(p_snapshot -> 'heroes')
    loop
      v_key := v_value ->> 'heroId';
      if v_key ~ v_id_pattern then
        insert into public.player_heroes (profile_id, hero_id, level, stars, shards, xp, skill_level, unlocked)
        values (
          v_profile_id,
          v_key,
          case when jsonb_typeof(v_value -> 'level') = 'number' then least(greatest((v_value ->> 'level')::numeric, 1), 60)::int else 1 end,
          case when jsonb_typeof(v_value -> 'stars') = 'number' then least(greatest((v_value ->> 'stars')::numeric, 1), 6)::int else 1 end,
          case when jsonb_typeof(v_value -> 'shards') = 'number' then least(greatest((v_value ->> 'shards')::numeric, 0), 5000)::int else 0 end,
          case when jsonb_typeof(v_value -> 'xp') = 'number' then least(greatest((v_value ->> 'xp')::numeric, 0), 1000000)::int else 0 end,
          case when jsonb_typeof(v_value -> 'skillLevel') = 'number' then least(greatest((v_value ->> 'skillLevel')::numeric, 1), 5)::int else 1 end,
          true
        )
        on conflict (profile_id, hero_id) do update set
          level = greatest(public.player_heroes.level, excluded.level),
          stars = greatest(public.player_heroes.stars, excluded.stars),
          shards = greatest(public.player_heroes.shards, excluded.shards),
          xp = greatest(public.player_heroes.xp, excluded.xp),
          skill_level = greatest(public.player_heroes.skill_level, excluded.skill_level),
          unlocked = public.player_heroes.unlocked or excluded.unlocked;
      end if;
    end loop;
  end if;

  if jsonb_typeof(p_snapshot -> 'frontlineCardUnlocks') = 'object'
    and (select count(*) from jsonb_object_keys(p_snapshot -> 'frontlineCardUnlocks')) <= 128 then
    for v_key, v_value in select key, value from jsonb_each(p_snapshot -> 'frontlineCardUnlocks')
    loop
      if v_key ~ v_id_pattern and v_value = 'true'::jsonb then
        insert into public.player_frontline_cards (profile_id, card_id, unlocked, level)
        values (v_profile_id, v_key, true, 1)
        on conflict (profile_id, card_id) do update set
          unlocked = public.player_frontline_cards.unlocked or excluded.unlocked;
      end if;
    end loop;
  end if;

  if jsonb_typeof(p_snapshot -> 'frontlineCardLevels') = 'object'
    and (select count(*) from jsonb_object_keys(p_snapshot -> 'frontlineCardLevels')) <= 128 then
    for v_key, v_value in select key, value from jsonb_each(p_snapshot -> 'frontlineCardLevels')
    loop
      if v_key ~ v_id_pattern and jsonb_typeof(v_value) = 'number' then
        insert into public.player_frontline_cards (profile_id, card_id, unlocked, level)
        values (v_profile_id, v_key, true, least(greatest((v_value #>> '{}')::numeric, 1), 5)::int)
        on conflict (profile_id, card_id) do update set
          unlocked = true,
          level = greatest(public.player_frontline_cards.level, excluded.level);
      end if;
    end loop;
  end if;

  if jsonb_typeof(v_loadout) = 'object'
    and jsonb_typeof(v_loadout -> 'squad') = 'array'
    and jsonb_array_length(v_loadout -> 'squad') = 3
    and jsonb_typeof(v_loadout -> 'deck') = 'array'
    and jsonb_array_length(v_loadout -> 'deck') = 8
    and coalesce(v_loadout ->> 'leaderId', '') ~ v_id_pattern then
    insert into public.frontline_loadouts (profile_id, leader_id, squad, deck, updated_at)
    values (v_profile_id, v_loadout ->> 'leaderId', v_loadout -> 'squad', v_loadout -> 'deck', v_now)
    on conflict (profile_id) do update set
      leader_id = excluded.leader_id,
      squad = excluded.squad,
      deck = excluded.deck,
      updated_at = excluded.updated_at;
  end if;

  if jsonb_typeof(v_frontline_fortress) = 'object'
    and jsonb_typeof(v_frontline_fortress -> 'buildings') = 'object' then
    if jsonb_typeof(v_frontline_fortress #> '{buildings,keep}') = 'number' then
      v_ff_keep := least(greatest((v_frontline_fortress #>> '{buildings,keep}')::numeric, 1), 60)::int;
    end if;
    if jsonb_typeof(v_frontline_fortress #> '{buildings,treasury}') = 'number' then
      v_ff_treasury := least(greatest((v_frontline_fortress #>> '{buildings,treasury}')::numeric, 1), 60)::int;
    end if;
    if jsonb_typeof(v_frontline_fortress #> '{buildings,barracks}') = 'number' then
      v_ff_barracks := least(greatest((v_frontline_fortress #>> '{buildings,barracks}')::numeric, 1), 60)::int;
    end if;
    if jsonb_typeof(v_frontline_fortress -> 'integrity') = 'number' then
      v_ff_integrity := least(greatest((v_frontline_fortress ->> 'integrity')::numeric, 0), 100)::int;
    end if;
    if jsonb_typeof(v_frontline_fortress -> 'raidsResolved') = 'number' then
      v_ff_raids_resolved := least(greatest((v_frontline_fortress ->> 'raidsResolved')::numeric, 0), 100000)::int;
    end if;

    if jsonb_typeof(v_frontline_fortress -> 'garrison') = 'array'
      and jsonb_array_length(v_frontline_fortress -> 'garrison') = 3 then
      for v_value in select value from jsonb_array_elements(v_frontline_fortress -> 'garrison')
      loop
        if v_value <> 'null'::jsonb
          and (jsonb_typeof(v_value) <> 'string' or not ((v_value #>> '{}') ~ v_id_pattern)) then
          v_garrison_valid := false;
        end if;
      end loop;

      if v_garrison_valid then
        v_ff_garrison := v_frontline_fortress -> 'garrison';
      end if;
    end if;

    insert into public.player_frontline_fortress (
      profile_id,
      buildings,
      integrity,
      garrison,
      raids_resolved
    )
    values (
      v_profile_id,
      jsonb_build_object('keep', v_ff_keep, 'treasury', v_ff_treasury, 'barracks', v_ff_barracks),
      v_ff_integrity,
      v_ff_garrison,
      v_ff_raids_resolved
    )
    on conflict (profile_id) do update set
      buildings = jsonb_build_object(
        'keep', greatest(coalesce((public.player_frontline_fortress.buildings ->> 'keep')::int, 1), (excluded.buildings ->> 'keep')::int),
        'treasury', greatest(coalesce((public.player_frontline_fortress.buildings ->> 'treasury')::int, 1), (excluded.buildings ->> 'treasury')::int),
        'barracks', greatest(coalesce((public.player_frontline_fortress.buildings ->> 'barracks')::int, 1), (excluded.buildings ->> 'barracks')::int)
      ),
      integrity = greatest(public.player_frontline_fortress.integrity, excluded.integrity),
      garrison = excluded.garrison,
      raids_resolved = greatest(public.player_frontline_fortress.raids_resolved, excluded.raids_resolved);
  end if;

  if jsonb_typeof(p_snapshot -> 'adventureProgress') = 'object'
    and (select count(*) from jsonb_object_keys(p_snapshot -> 'adventureProgress')) <= 128 then
    for v_key, v_value in select key, value from jsonb_each(p_snapshot -> 'adventureProgress')
    loop
      if v_key ~ v_id_pattern then
        v_status := coalesce(v_value ->> 'status', 'available');
        if v_status in ('locked', 'available', 'current', 'cleared', 'completed', 'claimed', 'hidden') then
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
          values (
            v_profile_id,
            case when v_key like 'c1%' then 'chapter-1' else 'unknown' end,
            v_key,
            v_status,
            case when jsonb_typeof(v_value -> 'cleared') = 'boolean' then (v_value ->> 'cleared')::boolean else v_status in ('cleared', 'completed', 'claimed') end,
            case when jsonb_typeof(v_value -> 'firstClearTaken') = 'boolean' then (v_value ->> 'firstClearTaken')::boolean else v_status in ('cleared', 'completed', 'claimed') end,
            case when jsonb_typeof(v_value -> 'claimed') = 'boolean' then (v_value ->> 'claimed')::boolean else v_status = 'claimed' end,
            case when v_status in ('cleared', 'completed', 'claimed') then v_now else null end
          )
          on conflict (profile_id, node_id) do update set
            cleared = public.adventure_progress.cleared or excluded.cleared,
            first_clear_taken = public.adventure_progress.first_clear_taken or excluded.first_clear_taken,
            claimed = public.adventure_progress.claimed or excluded.claimed,
            status = case
              when public.adventure_progress.claimed or excluded.claimed then 'claimed'
              when public.adventure_progress.cleared or excluded.cleared then 'cleared'
              else excluded.status
            end,
            cleared_at = coalesce(public.adventure_progress.cleared_at, excluded.cleared_at);
        end if;
      end if;
    end loop;
  end if;

  if jsonb_typeof(p_snapshot -> 'adventureMapClaims') = 'object'
    and (select count(*) from jsonb_object_keys(p_snapshot -> 'adventureMapClaims')) <= 64 then
    for v_key, v_value in select key, value from jsonb_each(p_snapshot -> 'adventureMapClaims')
    loop
      if v_key ~ v_id_pattern and jsonb_typeof(v_value -> 'claimed') = 'boolean' and (v_value ->> 'claimed')::boolean then
        insert into public.adventure_map_claims (profile_id, interaction_id, claimed, claimed_at, rewards, operation_id)
        values (v_profile_id, v_key, true, v_now, '{}'::jsonb, v_operation_id)
        on conflict (profile_id, interaction_id) do update set
          claimed = public.adventure_map_claims.claimed or excluded.claimed,
          claimed_at = coalesce(public.adventure_map_claims.claimed_at, excluded.claimed_at);
      end if;
    end loop;
  end if;

  select jsonb_build_object(
    'account', jsonb_build_object(
      'name', p.display_name,
      'level', p.account_level,
      'xp', p.account_xp
    ),
    'resources', jsonb_build_object(
      'gold', r.gold,
      'dust', r.dust,
      'gems', r.gems,
      'arenaTickets', r.arena_tickets,
      'adventureKeys', r.adventure_keys
    ),
    'frontlineLoadout', case
      when fl.profile_id is null then null
      else jsonb_build_object('leaderId', fl.leader_id, 'squad', fl.squad, 'deck', fl.deck)
    end,
    'frontlineFortress', public.frontline_fortress_snapshot(v_profile_id)
  )
    into v_value
    from public.profiles p
    join public.player_resources r on r.profile_id = p.id
    left join public.frontline_loadouts fl on fl.profile_id = p.id
    where p.id = v_profile_id;

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'profileId', v_profile_id,
      'imported', true,
      'normalizedSnapshot', v_value
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

revoke all on function public.sync_local_snapshot(text, text, jsonb) from public;
grant execute on function public.sync_local_snapshot(text, text, jsonb) to authenticated;
