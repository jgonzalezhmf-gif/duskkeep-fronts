-- Duskkeep Fronts - defensive validation for server-recorded Frontline battle results.
-- This is not full server-side simulation yet. It rejects impossible winner/core summaries
-- before rewards, missions, Arena records or future ladder state can rely on forged results.

create or replace function public.frontline_battle_summary_is_consistent(
  p_winner text,
  p_turns int,
  p_battle_summary jsonb
)
returns boolean
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  v_ally_core_hp int;
  v_enemy_core_hp int;
  v_summary_round int;
  v_summary_winner text;
  v_max_rounds int := 8;
begin
  if p_winner not in ('ally', 'enemy', 'draw') then
    return false;
  end if;

  if p_turns is null or p_turns < 0 or p_turns > 500 then
    return false;
  end if;

  if p_battle_summary is null or jsonb_typeof(p_battle_summary) <> 'object' then
    return false;
  end if;

  if jsonb_typeof(p_battle_summary -> 'allyCoreHp') <> 'number'
    or jsonb_typeof(p_battle_summary -> 'enemyCoreHp') <> 'number' then
    return false;
  end if;

  begin
    v_ally_core_hp := (p_battle_summary ->> 'allyCoreHp')::int;
    v_enemy_core_hp := (p_battle_summary ->> 'enemyCoreHp')::int;
  exception when others then
    return false;
  end;

  if v_ally_core_hp < 0 or v_ally_core_hp > 999
    or v_enemy_core_hp < 0 or v_enemy_core_hp > 999 then
    return false;
  end if;

  if p_battle_summary ? 'round' then
    if jsonb_typeof(p_battle_summary -> 'round') <> 'number' then
      return false;
    end if;

    begin
      v_summary_round := (p_battle_summary ->> 'round')::int;
    exception when others then
      return false;
    end;

    if v_summary_round <> p_turns then
      return false;
    end if;
  end if;

  if p_battle_summary ? 'winner' then
    if jsonb_typeof(p_battle_summary -> 'winner') <> 'string' then
      return false;
    end if;

    v_summary_winner := p_battle_summary ->> 'winner';
    if v_summary_winner <> p_winner then
      return false;
    end if;
  end if;

  if p_winner = 'ally' then
    return v_enemy_core_hp <= 0 or (p_turns >= v_max_rounds and v_ally_core_hp > v_enemy_core_hp);
  end if;

  if p_winner = 'enemy' then
    return v_ally_core_hp <= 0 or (p_turns >= v_max_rounds and v_enemy_core_hp > v_ally_core_hp);
  end if;

  return (v_ally_core_hp <= 0 and v_enemy_core_hp <= 0)
    or (p_turns >= v_max_rounds and v_ally_core_hp = v_enemy_core_hp);
end;
$$;

create or replace function public.validate_frontline_battle_result_summary()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.source in ('adventure', 'arena', 'event') then
    if public.frontline_battle_summary_is_consistent(new.winner, new.turns, new.summary) is not true then
      raise exception 'Invalid Frontline battle summary for recorded result'
        using errcode = '22023';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists battle_results_validate_frontline_summary on public.battle_results;
create trigger battle_results_validate_frontline_summary
before insert or update of winner, turns, summary, source on public.battle_results
for each row execute function public.validate_frontline_battle_result_summary();

revoke all on function public.frontline_battle_summary_is_consistent(text, int, jsonb) from public;
revoke all on function public.frontline_battle_summary_is_consistent(text, int, jsonb) from anon;
revoke all on function public.frontline_battle_summary_is_consistent(text, int, jsonb) from authenticated;
grant execute on function public.frontline_battle_summary_is_consistent(text, int, jsonb) to authenticated;

revoke all on function public.validate_frontline_battle_result_summary() from public;
revoke all on function public.validate_frontline_battle_result_summary() from anon;
revoke all on function public.validate_frontline_battle_result_summary() from authenticated;
