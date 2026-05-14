-- Duskkeep Fronts - provisioning starter de estado jugable.
-- Amplia el alta de usuario para crear heroes/cartas/loadout iniciales en
-- servidor. Es idempotente y no pisa progreso ni loadouts existentes.

create or replace function public.provision_player_starter_state(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_profile_id is null then
    return;
  end if;

  insert into public.player_resources (profile_id)
  values (p_profile_id)
  on conflict (profile_id) do nothing;

  insert into public.player_heroes (profile_id, hero_id, level, stars, shards, xp, skill_level, unlocked)
  values
    (p_profile_id, 'bran', 1, 1, 0, 0, 1, true),
    (p_profile_id, 'kara', 1, 1, 0, 0, 1, true),
    (p_profile_id, 'vex', 1, 1, 0, 0, 1, true),
    (p_profile_id, 'mira', 1, 1, 0, 0, 1, true),
    (p_profile_id, 'drak', 1, 1, 0, 0, 1, true),
    (p_profile_id, 'tovi', 1, 1, 0, 0, 1, true)
  on conflict (profile_id, hero_id) do update set
    unlocked = public.player_heroes.unlocked or excluded.unlocked;

  insert into public.player_frontline_cards (profile_id, card_id, unlocked, level)
  values
    (p_profile_id, 'order_guard_wall', true, 1),
    (p_profile_id, 'order_twin_slash', true, 1),
    (p_profile_id, 'order_focus_fire', true, 1),
    (p_profile_id, 'tactic_battle_hymn', true, 1),
    (p_profile_id, 'tactic_sanctuary', true, 1),
    (p_profile_id, 'tactic_smokescreen', true, 1),
    (p_profile_id, 'summon_wolf', true, 1),
    (p_profile_id, 'summon_barrier', true, 1)
  on conflict (profile_id, card_id) do update set
    unlocked = public.player_frontline_cards.unlocked or excluded.unlocked,
    level = greatest(public.player_frontline_cards.level, excluded.level);

  insert into public.frontline_loadouts (profile_id, leader_id, squad, deck)
  values (
    p_profile_id,
    'leader_aurora',
    '["bran","kara","mira"]'::jsonb,
    '["order_guard_wall","order_twin_slash","order_focus_fire","tactic_battle_hymn","tactic_sanctuary","tactic_smokescreen","summon_wolf","summon_barrier"]'::jsonb
  )
  on conflict (profile_id) do nothing;
end;
$$;

revoke all on function public.provision_player_starter_state(uuid) from public;
revoke all on function public.provision_player_starter_state(uuid) from anon;
revoke all on function public.provision_player_starter_state(uuid) from authenticated;

create or replace function public.provision_player_account()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid;
  v_display_name text;
begin
  v_display_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'displayName', '')), '');

  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(v_display_name, 'Commander'))
  on conflict (user_id) do update set
    display_name = coalesce(v_display_name, public.profiles.display_name)
  returning id into v_profile_id;

  perform public.provision_player_starter_state(v_profile_id);

  return new;
end;
$$;

do $$
declare
  v_profile_id uuid;
begin
  for v_profile_id in select id from public.profiles
  loop
    perform public.provision_player_starter_state(v_profile_id);
  end loop;
end;
$$;
