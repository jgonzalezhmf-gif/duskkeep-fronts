-- Normalize server-owned account XP into account levels.
-- Rewards must not leave profiles with threshold-crossing XP and stale levels,
-- otherwise clients can repeatedly project the same level-up before snapshot reconciliation.

create or replace function public.normalize_account_progress(
  p_account_level int,
  p_account_xp int
)
returns table(account_level int, account_xp int)
language plpgsql
immutable
as $$
declare
  v_level int := greatest(coalesce(p_account_level, 1), 1);
  v_xp int := greatest(coalesce(p_account_xp, 0), 0);
begin
  while v_xp >= 100 * v_level loop
    v_xp := v_xp - 100 * v_level;
    v_level := v_level + 1;
  end loop;

  account_level := v_level;
  account_xp := v_xp;
  return next;
end;
$$;

revoke all on function public.normalize_account_progress(int, int) from public;
revoke all on function public.normalize_account_progress(int, int) from anon;
revoke all on function public.normalize_account_progress(int, int) from authenticated;

update public.profiles as profile_to_repair
set account_level = normalized.account_level,
    account_xp = normalized.account_xp
from (
  select
    profile_source.id,
    normalized_progress.account_level,
    normalized_progress.account_xp
  from public.profiles as profile_source
  cross join lateral public.normalize_account_progress(
    profile_source.account_level,
    profile_source.account_xp
  ) as normalized_progress
) as normalized
where normalized.id = profile_to_repair.id
  and (
    normalized.account_level <> profile_to_repair.account_level
    or normalized.account_xp <> profile_to_repair.account_xp
  );

create or replace function public.grant_reward_bundle(
  p_profile_id uuid,
  p_operation_id uuid,
  p_source text,
  p_rewards jsonb,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_resources public.player_resources%rowtype;
  v_reward_gold int := 0;
  v_reward_dust int := 0;
  v_reward_gems int := 0;
  v_reward_arena_tickets int := 0;
  v_reward_adventure_keys int := 0;
  v_reward_account_xp int := 0;
  v_reward_team_xp int := 0;
  v_account_level int := 1;
  v_account_xp int := 0;
  v_next_account_level int := 1;
  v_next_account_xp int := 0;
  v_entry jsonb;
  v_requires_snapshot_refresh boolean := false;
begin
  if p_profile_id is null or p_operation_id is null then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid reward context');
  end if;

  if p_source is null or length(trim(p_source)) = 0 or length(trim(p_source)) > 80 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid reward source');
  end if;

  if p_metadata is null or jsonb_typeof(p_metadata) <> 'object' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid reward metadata');
  end if;

  if public.jsonb_reward_payload_is_valid(p_rewards) is not true then
    return jsonb_build_object('ok', false, 'code', 'invalid_reward', 'reason', 'Invalid reward payload');
  end if;

  v_reward_gold := coalesce((p_rewards ->> 'gold')::int, 0);
  v_reward_dust := coalesce((p_rewards ->> 'dust')::int, 0);
  v_reward_gems := coalesce((p_rewards ->> 'gems')::int, 0);
  v_reward_arena_tickets := coalesce((p_rewards ->> 'arenaTickets')::int, 0);
  v_reward_adventure_keys := coalesce((p_rewards ->> 'adventureKeys')::int, 0);
  v_reward_account_xp := coalesce((p_rewards ->> 'accountXp')::int, 0);
  v_reward_team_xp := coalesce((p_rewards ->> 'xp')::int, 0);

  update public.player_resources
    set gold = gold + v_reward_gold,
        dust = dust + v_reward_dust,
        gems = gems + v_reward_gems,
        arena_tickets = arena_tickets + v_reward_arena_tickets,
        adventure_keys = adventure_keys + v_reward_adventure_keys
    where profile_id = p_profile_id
    returning * into v_resources;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
  end if;

  if v_reward_account_xp > 0 then
    select account_level, account_xp
      into v_account_level, v_account_xp
      from public.profiles
      where id = p_profile_id
      for update;

    if not found then
      return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Profile row not found');
    end if;

    select account_level, account_xp
      into v_next_account_level, v_next_account_xp
      from public.normalize_account_progress(v_account_level, v_account_xp + v_reward_account_xp);

    update public.profiles
      set account_level = v_next_account_level,
          account_xp = v_next_account_xp
      where id = p_profile_id;

    v_requires_snapshot_refresh := true;
  end if;

  if v_reward_team_xp > 0 then
    insert into public.player_heroes (profile_id, hero_id, xp, unlocked)
    select p_profile_id, squad_hero.hero_id, v_reward_team_xp, true
      from (
        select distinct squad.value #>> '{}' as hero_id
          from public.frontline_loadouts fl
          cross join lateral jsonb_array_elements(fl.squad) as squad(value)
          where fl.profile_id = p_profile_id
            and jsonb_typeof(squad.value) = 'string'
            and length(squad.value #>> '{}') > 0
      ) squad_hero
    on conflict (profile_id, hero_id)
    do update set
      xp = public.player_heroes.xp + excluded.xp,
      updated_at = now();
    v_requires_snapshot_refresh := true;
  end if;

  for v_entry in select value from jsonb_array_elements(coalesce(p_rewards -> 'shards', '[]'::jsonb)) loop
    insert into public.player_heroes (profile_id, hero_id, shards, unlocked)
    values (p_profile_id, v_entry ->> 'heroId', (v_entry ->> 'amount')::int, false)
    on conflict (profile_id, hero_id)
    do update set
      shards = public.player_heroes.shards + excluded.shards,
      updated_at = now();
    v_requires_snapshot_refresh := true;
  end loop;

  for v_entry in select value from jsonb_array_elements(coalesce(p_rewards -> 'frontlineCards', '[]'::jsonb)) loop
    insert into public.player_frontline_cards (profile_id, card_id, unlocked, level)
    values (p_profile_id, v_entry ->> 'cardId', true, 1)
    on conflict (profile_id, card_id)
    do update set
      unlocked = true,
      updated_at = now();
    v_requires_snapshot_refresh := true;
  end loop;

  if v_reward_gold > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (p_profile_id, p_operation_id, p_source, 'gold', v_reward_gold, v_resources.gold, p_metadata);
  end if;
  if v_reward_dust > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (p_profile_id, p_operation_id, p_source, 'dust', v_reward_dust, v_resources.dust, p_metadata);
  end if;
  if v_reward_gems > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (p_profile_id, p_operation_id, p_source, 'gems', v_reward_gems, v_resources.gems, p_metadata);
  end if;
  if v_reward_arena_tickets > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (p_profile_id, p_operation_id, p_source, 'arena_tickets', v_reward_arena_tickets, v_resources.arena_tickets, p_metadata);
  end if;
  if v_reward_adventure_keys > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (p_profile_id, p_operation_id, p_source, 'adventure_keys', v_reward_adventure_keys, v_resources.adventure_keys, p_metadata);
  end if;

  return jsonb_build_object(
    'ok', true,
    'rewardsGranted', p_rewards,
    'resources', jsonb_build_object(
      'gold', v_resources.gold,
      'dust', v_resources.dust,
      'gems', v_resources.gems,
      'arenaTickets', v_resources.arena_tickets,
      'adventureKeys', v_resources.adventure_keys
    ),
    'requiresSnapshotRefresh', v_requires_snapshot_refresh
  );
end;
$$;

revoke all on function public.grant_reward_bundle(uuid, uuid, text, jsonb, jsonb) from public;
revoke all on function public.grant_reward_bundle(uuid, uuid, text, jsonb, jsonb) from authenticated;
