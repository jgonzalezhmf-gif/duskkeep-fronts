-- Duskkeep Fronts - Ladder MVP server-authoritative.
-- Ladder se separa de Arena: no consume tickets y usa puntos/rangos/rewards
-- definidos en catalogos internos. El cliente solo envia rival, seed y resumen.

create table if not exists public.server_ladder_tiers (
  season_id text not null,
  league text not null check (league in ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster')),
  division text not null check (division in ('iii', 'ii', 'i')),
  min_points int not null check (min_points >= 0),
  max_points int not null check (max_points >= min_points),
  enabled boolean not null default false,
  sort_order int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (season_id, league, division)
);

drop trigger if exists server_ladder_tiers_set_updated_at on public.server_ladder_tiers;
create trigger server_ladder_tiers_set_updated_at
before update on public.server_ladder_tiers
for each row execute function public.set_updated_at();

alter table public.server_ladder_tiers enable row level security;

revoke all on table public.server_ladder_tiers from public;
revoke all on table public.server_ladder_tiers from anon;
revoke all on table public.server_ladder_tiers from authenticated;

create table if not exists public.server_ladder_reward_rules (
  season_id text not null,
  league text not null check (league in ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster')),
  division text not null check (division in ('iii', 'ii', 'i')),
  enabled boolean not null default true,
  daily_normal_win_limit int not null default 5 check (daily_normal_win_limit >= 0 and daily_normal_win_limit <= 100),
  normal_gold int not null default 0 check (normal_gold >= 0),
  normal_dust int not null default 0 check (normal_dust >= 0),
  normal_account_xp int not null default 0 check (normal_account_xp >= 0),
  normal_key_progress_min int not null default 0 check (normal_key_progress_min >= 0),
  normal_key_progress_max int not null default 0 check (normal_key_progress_max >= normal_key_progress_min),
  reduced_gold int not null default 0 check (reduced_gold >= 0),
  reduced_account_xp int not null default 0 check (reduced_account_xp >= 0),
  draw_gold int not null default 0 check (draw_gold >= 0),
  draw_account_xp int not null default 0 check (draw_account_xp >= 0),
  loss_account_xp int not null default 0 check (loss_account_xp >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (season_id, league, division),
  foreign key (season_id, league, division) references public.server_ladder_tiers(season_id, league, division)
);

drop trigger if exists server_ladder_reward_rules_set_updated_at on public.server_ladder_reward_rules;
create trigger server_ladder_reward_rules_set_updated_at
before update on public.server_ladder_reward_rules
for each row execute function public.set_updated_at();

alter table public.server_ladder_reward_rules enable row level security;

revoke all on table public.server_ladder_reward_rules from public;
revoke all on table public.server_ladder_reward_rules from anon;
revoke all on table public.server_ladder_reward_rules from authenticated;

create table if not exists public.server_ladder_opponents (
  opponent_id text primary key check (opponent_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  season_id text not null,
  enabled boolean not null default true,
  league text not null check (league in ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster')),
  division text not null check (division in ('iii', 'ii', 'i')),
  preset_id text not null check (preset_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  display_name text not null,
  points_win int not null default 25,
  points_draw int not null default 5,
  points_loss int not null default -10,
  power int not null default 0 check (power >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (season_id, league, division) references public.server_ladder_tiers(season_id, league, division)
);

drop trigger if exists server_ladder_opponents_set_updated_at on public.server_ladder_opponents;
create trigger server_ladder_opponents_set_updated_at
before update on public.server_ladder_opponents
for each row execute function public.set_updated_at();

alter table public.server_ladder_opponents enable row level security;

revoke all on table public.server_ladder_opponents from public;
revoke all on table public.server_ladder_opponents from anon;
revoke all on table public.server_ladder_opponents from authenticated;

create table if not exists public.player_ladder_state (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  season_id text not null,
  points int not null default 0 check (points >= 0),
  league text not null default 'bronze' check (league in ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster')),
  division text not null default 'iii' check (division in ('iii', 'ii', 'i')),
  key_progress int not null default 0 check (key_progress >= 0 and key_progress < 100),
  updated_at timestamptz not null default now(),
  primary key (profile_id, season_id)
);

drop trigger if exists player_ladder_state_set_updated_at on public.player_ladder_state;
create trigger player_ladder_state_set_updated_at
before update on public.player_ladder_state
for each row execute function public.set_updated_at();

create table if not exists public.player_ladder_daily_state (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  season_id text not null,
  cycle_key text not null,
  rewarded_wins int not null default 0 check (rewarded_wins >= 0),
  updated_at timestamptz not null default now(),
  primary key (profile_id, season_id, cycle_key)
);

drop trigger if exists player_ladder_daily_state_set_updated_at on public.player_ladder_daily_state;
create trigger player_ladder_daily_state_set_updated_at
before update on public.player_ladder_daily_state
for each row execute function public.set_updated_at();

alter table public.player_ladder_state enable row level security;
alter table public.player_ladder_daily_state enable row level security;

drop policy if exists player_ladder_state_select_own on public.player_ladder_state;
create policy player_ladder_state_select_own
on public.player_ladder_state for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = player_ladder_state.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists player_ladder_daily_state_select_own on public.player_ladder_daily_state;
create policy player_ladder_daily_state_select_own
on public.player_ladder_daily_state for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = player_ladder_daily_state.profile_id
      and profiles.user_id = auth.uid()
  )
);

insert into public.server_ladder_tiers (season_id, league, division, min_points, max_points, enabled, sort_order, notes)
values
  ('alpha_s1', 'bronze', 'iii', 0, 99, true, 10, 'Bronze III active MVP'),
  ('alpha_s1', 'bronze', 'ii', 100, 199, true, 20, 'Bronze II active MVP'),
  ('alpha_s1', 'bronze', 'i', 200, 300, true, 30, 'Bronze I active MVP'),
  ('alpha_s1', 'silver', 'iii', 301, 399, false, 40, 'Preview tier'),
  ('alpha_s1', 'silver', 'ii', 400, 499, false, 50, 'Preview tier'),
  ('alpha_s1', 'silver', 'i', 500, 599, false, 60, 'Preview tier'),
  ('alpha_s1', 'gold', 'iii', 600, 699, false, 70, 'Preview tier'),
  ('alpha_s1', 'gold', 'ii', 700, 799, false, 80, 'Preview tier'),
  ('alpha_s1', 'gold', 'i', 800, 899, false, 90, 'Preview tier'),
  ('alpha_s1', 'platinum', 'iii', 900, 999, false, 100, 'Preview tier'),
  ('alpha_s1', 'platinum', 'ii', 1000, 1099, false, 110, 'Preview tier'),
  ('alpha_s1', 'platinum', 'i', 1100, 1199, false, 120, 'Preview tier'),
  ('alpha_s1', 'diamond', 'iii', 1200, 1299, false, 130, 'Preview tier'),
  ('alpha_s1', 'diamond', 'ii', 1300, 1399, false, 140, 'Preview tier'),
  ('alpha_s1', 'diamond', 'i', 1400, 1499, false, 150, 'Preview tier'),
  ('alpha_s1', 'master', 'iii', 1500, 1599, false, 160, 'Preview tier'),
  ('alpha_s1', 'master', 'ii', 1600, 1699, false, 170, 'Preview tier'),
  ('alpha_s1', 'master', 'i', 1700, 1799, false, 180, 'Preview tier'),
  ('alpha_s1', 'grandmaster', 'iii', 1800, 1899, false, 190, 'Preview tier'),
  ('alpha_s1', 'grandmaster', 'ii', 1900, 1999, false, 200, 'Preview tier'),
  ('alpha_s1', 'grandmaster', 'i', 2000, 9999, false, 210, 'Preview tier')
on conflict (season_id, league, division) do update set
  min_points = excluded.min_points,
  max_points = excluded.max_points,
  enabled = excluded.enabled,
  sort_order = excluded.sort_order,
  notes = excluded.notes;

insert into public.server_ladder_reward_rules (
  season_id,
  league,
  division,
  enabled,
  daily_normal_win_limit,
  normal_gold,
  normal_dust,
  normal_account_xp,
  normal_key_progress_min,
  normal_key_progress_max,
  reduced_gold,
  reduced_account_xp,
  draw_gold,
  draw_account_xp,
  loss_account_xp,
  notes
)
values
  ('alpha_s1', 'bronze', 'iii', true, 5, 60, 4, 4, 30, 45, 15, 1, 10, 1, 1, 'Bronze III ladder rewards'),
  ('alpha_s1', 'bronze', 'ii', true, 5, 75, 6, 5, 35, 55, 18, 1, 12, 1, 1, 'Bronze II ladder rewards'),
  ('alpha_s1', 'bronze', 'i', true, 5, 90, 8, 6, 45, 65, 22, 1, 15, 1, 1, 'Bronze I ladder rewards')
on conflict (season_id, league, division) do update set
  enabled = excluded.enabled,
  daily_normal_win_limit = excluded.daily_normal_win_limit,
  normal_gold = excluded.normal_gold,
  normal_dust = excluded.normal_dust,
  normal_account_xp = excluded.normal_account_xp,
  normal_key_progress_min = excluded.normal_key_progress_min,
  normal_key_progress_max = excluded.normal_key_progress_max,
  reduced_gold = excluded.reduced_gold,
  reduced_account_xp = excluded.reduced_account_xp,
  draw_gold = excluded.draw_gold,
  draw_account_xp = excluded.draw_account_xp,
  loss_account_xp = excluded.loss_account_xp,
  notes = excluded.notes;

insert into public.server_ladder_opponents (
  opponent_id,
  season_id,
  enabled,
  league,
  division,
  preset_id,
  display_name,
  points_win,
  points_draw,
  points_loss,
  power,
  notes
)
values
  ('ladder_bronze_iii_iron_vow', 'alpha_s1', true, 'bronze', 'iii', 'bonewood_scouts', 'Iron Vow', 25, 5, -10, 105, 'Bronze III pseudo-PVP rival'),
  ('ladder_bronze_ii_ash_squire', 'alpha_s1', true, 'bronze', 'ii', 'bonewood_raiders', 'Ash Squire', 25, 5, -10, 135, 'Bronze II pseudo-PVP rival'),
  ('ladder_bronze_i_dusk_knight', 'alpha_s1', true, 'bronze', 'i', 'rotwood_pack', 'Dusk Knight', 25, 5, -10, 165, 'Bronze I pseudo-PVP rival')
on conflict (opponent_id) do update set
  season_id = excluded.season_id,
  enabled = excluded.enabled,
  league = excluded.league,
  division = excluded.division,
  preset_id = excluded.preset_id,
  display_name = excluded.display_name,
  points_win = excluded.points_win,
  points_draw = excluded.points_draw,
  points_loss = excluded.points_loss,
  power = excluded.power,
  notes = excluded.notes;

alter table public.battle_results
  drop constraint if exists battle_results_source_check;

alter table public.battle_results
  add constraint battle_results_source_check
  check (source in ('adventure', 'arena', 'event', 'fortress', 'practice', 'ladder'));

create or replace function public.validate_frontline_battle_result_summary()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.source in ('adventure', 'arena', 'event', 'ladder') then
    if public.frontline_battle_summary_is_consistent(new.winner, new.turns, new.summary) is not true then
      raise exception 'Invalid Frontline battle summary for recorded result'
        using errcode = '22023';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.record_ladder_result(
  p_idempotency_key text,
  p_opponent_id text,
  p_battle_seed bigint,
  p_winner text,
  p_turns int,
  p_battle_summary jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_season_id text := 'alpha_s1';
  v_opponent public.server_ladder_opponents%rowtype;
  v_rule public.server_ladder_reward_rules%rowtype;
  v_state public.player_ladder_state%rowtype;
  v_daily public.player_ladder_daily_state%rowtype;
  v_current_tier public.server_ladder_tiers%rowtype;
  v_next_tier public.server_ladder_tiers%rowtype;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_cycle_key text := to_char(now() at time zone 'utc', 'YYYY-MM-DD');
  v_enabled_max_points int := 300;
  v_points_delta int := 0;
  v_next_points int := 0;
  v_reward_mode text := 'loss';
  v_key_progress_delta int := 0;
  v_total_key_progress int := 0;
  v_adventure_keys_granted int := 0;
  v_next_key_progress int := 0;
  v_resources public.player_resources%rowtype;
  v_reward_result jsonb;
  v_rewards jsonb := '{}'::jsonb;
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_winner not in ('ally', 'enemy', 'draw') then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid winner');
  end if;

  if p_turns is null or p_turns < 0 or p_turns > 500 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid turn count');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(
    digest(
      'recordLadderResult:'
      || p_opponent_id || ':'
      || p_battle_seed::text || ':'
      || p_winner || ':'
      || p_turns::text || ':'
      || coalesce(p_battle_summary, '{}'::jsonb)::text,
      'sha256'
    ),
    'hex'
  );

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'recordLadderResult'
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

  insert into public.player_ladder_state (profile_id, season_id, points, league, division, key_progress)
  values (v_profile_id, v_season_id, 0, 'bronze', 'iii', 0)
  on conflict (profile_id, season_id) do nothing;

  select *
    into v_state
    from public.player_ladder_state
    where profile_id = v_profile_id
      and season_id = v_season_id
    for update;

  select coalesce(max(max_points), 300)
    into v_enabled_max_points
    from public.server_ladder_tiers
    where season_id = v_season_id
      and enabled = true;

  select *
    into v_current_tier
    from public.server_ladder_tiers
    where season_id = v_season_id
      and enabled = true
      and v_state.points between min_points and max_points
    order by min_points desc
    limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Ladder tier not available');
  end if;

  select *
    into v_opponent
    from public.server_ladder_opponents
    where opponent_id = p_opponent_id
      and season_id = v_season_id
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Ladder opponent not supported');
  end if;

  if v_opponent.league <> v_current_tier.league or v_opponent.division <> v_current_tier.division then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Ladder opponent is not available for current rank');
  end if;

  select *
    into v_rule
    from public.server_ladder_reward_rules
    where season_id = v_season_id
      and league = v_current_tier.league
      and division = v_current_tier.division
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Ladder reward rule not available');
  end if;

  insert into public.player_ladder_daily_state (profile_id, season_id, cycle_key, rewarded_wins)
  values (v_profile_id, v_season_id, v_cycle_key, 0)
  on conflict (profile_id, season_id, cycle_key) do nothing;

  select *
    into v_daily
    from public.player_ladder_daily_state
    where profile_id = v_profile_id
      and season_id = v_season_id
      and cycle_key = v_cycle_key
    for update;

  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
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
    'recordLadderResult',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now
  );

  if p_winner = 'ally' then
    v_points_delta := v_opponent.points_win;
    if v_daily.rewarded_wins < v_rule.daily_normal_win_limit then
      v_reward_mode := 'normal';
      v_key_progress_delta := floor(
        random() * (v_rule.normal_key_progress_max - v_rule.normal_key_progress_min + 1)
        + v_rule.normal_key_progress_min
      )::int;
      v_total_key_progress := v_state.key_progress + v_key_progress_delta;
      v_adventure_keys_granted := floor(v_total_key_progress / 100);
      v_next_key_progress := v_total_key_progress % 100;
      v_rewards := jsonb_build_object(
        'gold', v_rule.normal_gold,
        'dust', v_rule.normal_dust,
        'accountXp', v_rule.normal_account_xp
      );
      if v_adventure_keys_granted > 0 then
        v_rewards := v_rewards || jsonb_build_object('adventureKeys', v_adventure_keys_granted);
      end if;
      update public.player_ladder_daily_state
        set rewarded_wins = rewarded_wins + 1
        where profile_id = v_profile_id
          and season_id = v_season_id
          and cycle_key = v_cycle_key
        returning * into v_daily;
    else
      v_reward_mode := 'reduced';
      v_next_key_progress := v_state.key_progress;
      v_rewards := jsonb_build_object(
        'gold', v_rule.reduced_gold,
        'accountXp', v_rule.reduced_account_xp
      );
    end if;
  elsif p_winner = 'draw' then
    v_points_delta := v_opponent.points_draw;
    v_reward_mode := 'draw';
    v_next_key_progress := v_state.key_progress;
    v_rewards := jsonb_build_object(
      'gold', v_rule.draw_gold,
      'accountXp', v_rule.draw_account_xp
    );
  else
    v_points_delta := v_opponent.points_loss;
    v_reward_mode := 'loss';
    v_next_key_progress := v_state.key_progress;
    v_rewards := jsonb_build_object(
      'accountXp', v_rule.loss_account_xp
    );
  end if;

  v_next_points := greatest(0, least(v_enabled_max_points, v_state.points + v_points_delta));

  select *
    into v_next_tier
    from public.server_ladder_tiers
    where season_id = v_season_id
      and enabled = true
      and v_next_points between min_points and max_points
    order by min_points desc
    limit 1;

  if not found then
    select *
      into v_next_tier
      from public.server_ladder_tiers
      where season_id = v_season_id
        and enabled = true
      order by max_points desc
      limit 1;
  end if;

  update public.player_ladder_state
    set points = v_next_points,
        league = v_next_tier.league,
        division = v_next_tier.division,
        key_progress = v_next_key_progress
    where profile_id = v_profile_id
      and season_id = v_season_id
    returning * into v_state;

  v_reward_result := public.grant_reward_bundle(
    v_profile_id,
    v_operation_id,
    'ladder_result',
    v_rewards,
    jsonb_build_object(
      'opponentId', p_opponent_id,
      'winner', p_winner,
      'rewardMode', v_reward_mode,
      'pointsDelta', v_points_delta,
      'keyProgressDelta', v_key_progress_delta
    )
  );

  if coalesce((v_reward_result ->> 'ok')::boolean, false) is not true then
    raise exception 'Failed to grant ladder result reward: %', v_reward_result;
  end if;

  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id;

  insert into public.battle_results (
    profile_id,
    source,
    arena_opponent_id,
    preset_id,
    seed,
    winner,
    turns,
    summary,
    rewards,
    operation_id,
    created_at
  )
  values (
    v_profile_id,
    'ladder',
    p_opponent_id,
    v_opponent.preset_id,
    p_battle_seed,
    p_winner,
    p_turns,
    coalesce(p_battle_summary, '{}'::jsonb),
    coalesce(v_reward_result -> 'rewardsGranted', '{}'::jsonb),
    v_operation_id,
    v_now
  );

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'opponentId', p_opponent_id,
      'winner', p_winner,
      'rewardsGranted', coalesce(v_reward_result -> 'rewardsGranted', '{}'::jsonb),
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      ),
      'ladder', jsonb_build_object(
        'seasonId', v_state.season_id,
        'points', v_state.points,
        'league', v_state.league,
        'division', v_state.division,
        'keyProgress', v_state.key_progress,
        'dailyRewardedWins', v_daily.rewarded_wins,
        'dailyCycleKey', v_daily.cycle_key
      ),
      'pointsDelta', v_points_delta,
      'keyProgressDelta', v_key_progress_delta,
      'adventureKeysGranted', v_adventure_keys_granted,
      'rewardMode', v_reward_mode,
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

revoke all on function public.record_ladder_result(text, text, bigint, text, int, jsonb) from public;
grant execute on function public.record_ladder_result(text, text, bigint, text, int, jsonb) to authenticated;

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
  v_ladder jsonb;
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

  select coalesce(
    (
      select jsonb_build_object(
        'seasonId', pls.season_id,
        'points', pls.points,
        'league', pls.league,
        'division', pls.division,
        'keyProgress', pls.key_progress,
        'dailyRewardedWins', coalesce(plds.rewarded_wins, 0),
        'dailyCycleKey', plds.cycle_key
      )
      from public.player_ladder_state pls
      left join public.player_ladder_daily_state plds
        on plds.profile_id = pls.profile_id
        and plds.season_id = pls.season_id
        and plds.cycle_key = to_char(now() at time zone 'utc', 'YYYY-MM-DD')
      where pls.profile_id = v_profile_id
        and pls.season_id = 'alpha_s1'
      limit 1
    ),
    jsonb_build_object(
      'seasonId', 'alpha_s1',
      'points', 0,
      'league', 'bronze',
      'division', 'iii',
      'keyProgress', 0,
      'dailyRewardedWins', 0,
      'dailyCycleKey', null
    )
  )
    into v_ladder;

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
    'ladder', v_ladder,
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
