-- Duskkeep Fronts - amplia el snapshot autoritativo con agregados de batalla/eventos.
-- Fuente de verdad: public.battle_results. El cliente solo consume estos contadores.

create or replace function public.get_player_snapshot()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_snapshot jsonb;
  v_heroes jsonb;
  v_card_unlocks jsonb;
  v_card_levels jsonb;
  v_loadout jsonb;
  v_frontline_fortress jsonb;
  v_adventure_progress jsonb;
  v_adventure_claims jsonb;
  v_missions_progress jsonb;
  v_daily_login_claims jsonb;
  v_shop_purchases jsonb;
  v_battle_stats jsonb;
  v_events_played jsonb;
  v_event_completions jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'heroId', h.hero_id,
        'level', h.level,
        'stars', h.stars,
        'shards', h.shards,
        'xp', h.xp,
        'skillLevel', h.skill_level,
        'unlocked', h.unlocked,
        'updatedAt', h.updated_at
      )
      order by h.hero_id
    ),
    '[]'::jsonb
  )
    into v_heroes
    from public.player_heroes h
    where h.profile_id = v_profile_id;

  select coalesce(jsonb_object_agg(c.card_id, c.unlocked), '{}'::jsonb)
    into v_card_unlocks
    from public.player_frontline_cards c
    where c.profile_id = v_profile_id;

  select coalesce(jsonb_object_agg(c.card_id, c.level), '{}'::jsonb)
    into v_card_levels
    from public.player_frontline_cards c
    where c.profile_id = v_profile_id;

  select case
    when fl.profile_id is null then null
    else jsonb_build_object(
      'leaderId', fl.leader_id,
      'squad', fl.squad,
      'deck', fl.deck,
      'updatedAt', fl.updated_at
    )
  end
    into v_loadout
    from public.frontline_loadouts fl
    where fl.profile_id = v_profile_id;

  select public.frontline_fortress_snapshot(v_profile_id)
    into v_frontline_fortress;

  select coalesce(
    jsonb_object_agg(
      ap.node_id,
      jsonb_build_object(
        'chapterId', ap.chapter_id,
        'nodeId', ap.node_id,
        'status', ap.status,
        'cleared', ap.cleared,
        'firstClearTaken', ap.first_clear_taken,
        'claimed', ap.claimed,
        'clearedAt', ap.cleared_at,
        'updatedAt', ap.updated_at
      )
    ),
    '{}'::jsonb
  )
    into v_adventure_progress
    from public.adventure_progress ap
    where ap.profile_id = v_profile_id;

  select coalesce(
    jsonb_object_agg(
      amc.interaction_id,
      jsonb_build_object(
        'interactionId', amc.interaction_id,
        'claimed', amc.claimed,
        'claimedAt', amc.claimed_at,
        'resetAvailableAt', amc.reset_available_at,
        'lootId', amc.loot_id,
        'lootTier', amc.loot_tier,
        'lootTitle', amc.loot_title,
        'rewards', amc.rewards,
        'updatedAt', amc.updated_at
      )
    ),
    '{}'::jsonb
  )
    into v_adventure_claims
    from public.adventure_map_claims amc
    where amc.profile_id = v_profile_id;

  select coalesce(
    jsonb_object_agg(
      mp.mission_id || ':' || mp.cycle_key,
      jsonb_build_object(
        'missionId', mp.mission_id,
        'cycleKey', mp.cycle_key,
        'progress', mp.progress,
        'target', mp.target,
        'claimed', mp.claimed,
        'claimedAt', mp.claimed_at,
        'updatedAt', mp.updated_at
      )
    ),
    '{}'::jsonb
  )
    into v_missions_progress
    from public.missions_progress mp
    where mp.profile_id = v_profile_id;

  select coalesce(
    jsonb_object_agg(
      dlc.day_key,
      jsonb_build_object(
        'dayKey', dlc.day_key,
        'streak', dlc.streak,
        'rewards', dlc.rewards,
        'claimedAt', dlc.claimed_at
      )
    ),
    '{}'::jsonb
  )
    into v_daily_login_claims
    from public.daily_login_claims dlc
    where dlc.profile_id = v_profile_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'offerId', sp.offer_id,
        'purchaseDay', sp.purchase_day,
        'quantity', sp.quantity,
        'cost', sp.cost,
        'contents', sp.contents,
        'createdAt', sp.created_at
      )
      order by sp.created_at desc
    ),
    '[]'::jsonb
  )
    into v_shop_purchases
    from (
      select *
        from public.shop_purchases
        where profile_id = v_profile_id
        order by created_at desc
        limit 128
    ) sp;

  select jsonb_build_object(
    'battlesWon', count(*) filter (where br.winner = 'ally'),
    'arenaWins', count(*) filter (where br.source = 'arena' and br.winner = 'ally'),
    'arenaLosses', count(*) filter (where br.source = 'arena' and br.winner = 'enemy')
  )
    into v_battle_stats
    from public.battle_results br
    where br.profile_id = v_profile_id;

  select coalesce(jsonb_object_agg(event_id, plays), '{}'::jsonb)
    into v_events_played
    from (
      select br.event_id, count(*)::int as plays
        from public.battle_results br
        where br.profile_id = v_profile_id
          and br.source = 'event'
          and br.event_id is not null
        group by br.event_id
    ) event_counts;

  select coalesce(jsonb_object_agg(event_id, completed_day), '{}'::jsonb)
    into v_event_completions
    from (
      select
        br.event_id,
        to_char(max(br.created_at) at time zone 'UTC', 'YYYY-MM-DD') as completed_day
        from public.battle_results br
        where br.profile_id = v_profile_id
          and br.source = 'event'
          and br.winner = 'ally'
          and br.event_id is not null
        group by br.event_id
    ) event_wins;

  select jsonb_build_object(
    'account', jsonb_build_object(
      'name', p.display_name,
      'level', p.account_level,
      'xp', p.account_xp,
      'createdAt', p.created_at,
      'updatedAt', p.updated_at
    ),
    'resources', jsonb_build_object(
      'gold', r.gold,
      'dust', r.dust,
      'gems', r.gems,
      'arenaTickets', r.arena_tickets,
      'adventureKeys', r.adventure_keys,
      'updatedAt', r.updated_at
    ),
    'heroes', v_heroes,
    'frontlineCardUnlocks', v_card_unlocks,
    'frontlineCardLevels', v_card_levels,
    'frontlineLoadout', v_loadout,
    'frontlineFortress', v_frontline_fortress,
    'adventureProgress', v_adventure_progress,
    'adventureMapClaims', v_adventure_claims,
    'missionsProgress', v_missions_progress,
    'dailyLoginClaims', v_daily_login_claims,
    'shopPurchases', v_shop_purchases,
    'battleStats', v_battle_stats,
    'eventsPlayed', v_events_played,
    'eventCompletions', v_event_completions
  )
    into v_snapshot
    from public.profiles p
    join public.player_resources r on r.profile_id = p.id
    where p.id = v_profile_id;

  return jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'profileId', v_profile_id,
      'snapshot', v_snapshot
    )
  );
end;
$$;

revoke all on function public.get_player_snapshot() from public;
grant execute on function public.get_player_snapshot() to authenticated;
