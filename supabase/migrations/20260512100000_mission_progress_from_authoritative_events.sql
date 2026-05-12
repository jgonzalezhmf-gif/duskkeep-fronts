-- Duskkeep Fronts - progreso de misiones desde eventos autoritativos.
-- El cliente no puede enviar progreso arbitrario: las misiones avanzan
-- desde tablas escritas por RPCs server-side.

create or replace function public.upsert_mission_progress(
  p_profile_id uuid,
  p_mission_id text,
  p_cycle_key text,
  p_target int,
  p_delta int
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_profile_id is null or p_delta <= 0 then
    return;
  end if;

  insert into public.missions_progress (
    profile_id,
    mission_id,
    cycle_key,
    progress,
    target,
    claimed
  )
  values (
    p_profile_id,
    p_mission_id,
    p_cycle_key,
    least(p_target, p_delta),
    p_target,
    false
  )
  on conflict (profile_id, mission_id, cycle_key)
  do update set
    target = excluded.target,
    progress = case
      when public.missions_progress.claimed then public.missions_progress.progress
      else least(excluded.target, public.missions_progress.progress + excluded.progress)
    end,
    updated_at = now();
end;
$$;

create or replace function public.advance_mission_progress(
  p_profile_id uuid,
  p_metric text,
  p_delta int default 1
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := now();
  v_daily_cycle text := 'daily:' || to_char(now() at time zone 'utc', 'YYYY-MM-DD');
  v_weekly_cycle text := 'weekly:' || to_char(now() at time zone 'utc', 'IYYY-IW');
begin
  if p_profile_id is null or p_delta <= 0 then
    return;
  end if;

  case p_metric
    when 'battles_won' then
      perform public.upsert_mission_progress(p_profile_id, 'd_battles_3', v_daily_cycle, 3, p_delta);
      perform public.upsert_mission_progress(p_profile_id, 'w_battles_20', v_weekly_cycle, 20, p_delta);
    when 'adventure_levels_cleared' then
      perform public.upsert_mission_progress(p_profile_id, 'd_adv_2', v_daily_cycle, 2, p_delta);
      perform public.upsert_mission_progress(p_profile_id, 'w_adv_10', v_weekly_cycle, 10, p_delta);
    when 'arena_battles' then
      perform public.upsert_mission_progress(p_profile_id, 'd_arena_1', v_daily_cycle, 1, p_delta);
    when 'events_played' then
      perform public.upsert_mission_progress(p_profile_id, 'w_events_3', v_weekly_cycle, 3, p_delta);
    when 'heroes_upgraded' then
      perform public.upsert_mission_progress(p_profile_id, 'd_upgrade_1', v_daily_cycle, 1, p_delta);
    else
      return;
  end case;
end;
$$;

create or replace function public.on_adventure_progress_mission_progress()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now_complete boolean;
  v_was_complete boolean;
begin
  v_now_complete := coalesce(new.cleared, false) or coalesce(new.claimed, false) or coalesce(new.first_clear_taken, false);
  v_was_complete := case
    when tg_op = 'UPDATE' then coalesce(old.cleared, false) or coalesce(old.claimed, false) or coalesce(old.first_clear_taken, false)
    else false
  end;

  if v_now_complete and not v_was_complete then
    perform public.advance_mission_progress(new.profile_id, 'adventure_levels_cleared', 1);
  end if;

  return new;
end;
$$;

drop trigger if exists adventure_progress_mission_progress on public.adventure_progress;
create trigger adventure_progress_mission_progress
after insert or update of cleared, claimed, first_clear_taken
on public.adventure_progress
for each row execute function public.on_adventure_progress_mission_progress();

create or replace function public.on_battle_result_mission_progress()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.winner = 'ally' then
    perform public.advance_mission_progress(new.profile_id, 'battles_won', 1);
  end if;

  if new.source = 'arena' then
    perform public.advance_mission_progress(new.profile_id, 'arena_battles', 1);
  elsif new.source = 'event' then
    perform public.advance_mission_progress(new.profile_id, 'events_played', 1);
  end if;

  return new;
end;
$$;

drop trigger if exists battle_results_mission_progress on public.battle_results;
create trigger battle_results_mission_progress
after insert on public.battle_results
for each row execute function public.on_battle_result_mission_progress();

revoke all on function public.upsert_mission_progress(uuid, text, text, int, int) from public;
revoke all on function public.advance_mission_progress(uuid, text, int) from public;
revoke all on function public.on_adventure_progress_mission_progress() from public;
revoke all on function public.on_battle_result_mission_progress() from public;
