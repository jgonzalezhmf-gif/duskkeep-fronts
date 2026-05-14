-- Smoke test local para provisioning de usuarios anonimos Supabase.
-- Requiere `npx.cmd supabase start` o `npx.cmd supabase db reset`.
--
-- Ejecutar con:
-- npx.cmd supabase db query --local --file supabase/smoke-tests/auth_guest_provisioning.sql --output table

do $$
declare
  v_guest_user_id uuid := '22222222-2222-4222-8222-222222222222';
  v_profile_id uuid;
begin
  delete from public.resource_ledger
    where profile_id in (select id from public.profiles where user_id = v_guest_user_id);
  delete from public.player_resources
    where profile_id in (select id from public.profiles where user_id = v_guest_user_id);
  delete from public.profiles
    where user_id = v_guest_user_id;
  delete from auth.users
    where id = v_guest_user_id;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    is_anonymous,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    v_guest_user_id,
    'authenticated',
    'authenticated',
    null,
    '',
    null,
    true,
    '{"provider":"anonymous","providers":["anonymous"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_guest_user_id;

  if v_profile_id is null then
    raise exception 'Expected anonymous auth user to provision a profile';
  end if;

  if not exists (
    select 1
      from public.player_resources
      where profile_id = v_profile_id
        and gold = 500
        and dust = 50
        and gems = 50
        and arena_tickets = 5
        and adventure_keys = 0
  ) then
    raise exception 'Expected anonymous profile to provision starter resources';
  end if;

  if not exists (
    select 1
      from auth.users
      where id = v_guest_user_id
        and is_anonymous = true
  ) then
    raise exception 'Expected auth user to remain marked anonymous';
  end if;

  raise notice 'Anonymous guest provisioning smoke test passed.';
end;
$$;
