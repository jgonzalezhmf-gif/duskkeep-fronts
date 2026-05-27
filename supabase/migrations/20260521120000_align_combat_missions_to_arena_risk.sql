-- Duskkeep Fronts - align generic combat missions with Arena/Ladder risk.
-- Rewards stay unchanged; only the qualifying metric and notes move away from low-risk generic wins.

update public.server_mission_definitions
set
  metric = 'arena_battles',
  notes = 'Play 3 Arena or Ladder battles',
  updated_at = now()
where mission_id = 'd_battles_3';

update public.server_mission_definitions
set
  metric = 'arena_battles',
  notes = 'Play 20 Arena or Ladder battles',
  updated_at = now()
where mission_id = 'w_battles_20';

update public.server_reward_definitions
set
  notes = 'Daily mission reward: play Arena or Ladder battles',
  updated_at = now()
where reward_id = 'mission_d_battles_3';

update public.server_reward_definitions
set
  notes = 'Weekly mission reward: play Arena or Ladder battles',
  updated_at = now()
where reward_id = 'mission_w_battles_20';

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

  if new.source in ('arena', 'ladder') then
    perform public.advance_mission_progress(new.profile_id, 'arena_battles', 1);
  elsif new.source = 'event' then
    perform public.advance_mission_progress(new.profile_id, 'events_played', 1);
  end if;

  return new;
end;
$$;
