-- Duskkeep Fronts - provision inicial de cuenta al crear usuario Auth.
-- Mantiene el cliente sin permisos directos de escritura sobre recursos:
-- el alta de usuario crea profile y resources base server-side.

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

  insert into public.player_resources (profile_id)
  values (v_profile_id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

drop trigger if exists auth_users_provision_player_account on auth.users;
create trigger auth_users_provision_player_account
after insert on auth.users
for each row execute function public.provision_player_account();
