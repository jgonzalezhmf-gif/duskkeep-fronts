-- Duskkeep Fronts - nucleo seguro de persistencia online.
-- Esta migracion crea las tablas base para cuenta, recursos, ledger,
-- heroes/cartas del jugador y loadout Frontline.
-- No conecta el cliente ni sustituye todavia el fallback local.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null default 'Commander',
  account_level int not null default 1 check (account_level >= 1),
  account_xp int not null default 0 check (account_xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.player_resources (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  gold int not null default 500 check (gold >= 0),
  dust int not null default 50 check (dust >= 0),
  gems int not null default 50 check (gems >= 0),
  arena_tickets int not null default 5 check (arena_tickets >= 0),
  adventure_keys int not null default 0 check (adventure_keys >= 0),
  updated_at timestamptz not null default now()
);

drop trigger if exists player_resources_set_updated_at on public.player_resources;
create trigger player_resources_set_updated_at
before update on public.player_resources
for each row execute function public.set_updated_at();

create table if not exists public.resource_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  operation_id uuid not null,
  source text not null,
  resource text not null check (resource in ('gold', 'dust', 'gems', 'arena_tickets', 'adventure_keys')),
  delta int not null,
  balance_after int not null check (balance_after >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists resource_ledger_profile_created_idx
on public.resource_ledger(profile_id, created_at desc);

create index if not exists resource_ledger_operation_idx
on public.resource_ledger(profile_id, operation_id);

create table if not exists public.player_heroes (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  hero_id text not null,
  level int not null default 1 check (level >= 1),
  stars int not null default 1 check (stars between 1 and 6),
  shards int not null default 0 check (shards >= 0),
  xp int not null default 0 check (xp >= 0),
  skill_level int not null default 1 check (skill_level between 1 and 5),
  unlocked boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (profile_id, hero_id)
);

drop trigger if exists player_heroes_set_updated_at on public.player_heroes;
create trigger player_heroes_set_updated_at
before update on public.player_heroes
for each row execute function public.set_updated_at();

create table if not exists public.player_frontline_cards (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  card_id text not null,
  unlocked boolean not null default false,
  level int not null default 1 check (level between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (profile_id, card_id)
);

drop trigger if exists player_frontline_cards_set_updated_at on public.player_frontline_cards;
create trigger player_frontline_cards_set_updated_at
before update on public.player_frontline_cards
for each row execute function public.set_updated_at();

create table if not exists public.frontline_loadouts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  leader_id text not null,
  squad jsonb not null default '[]'::jsonb check (jsonb_typeof(squad) = 'array'),
  deck jsonb not null default '[]'::jsonb check (jsonb_typeof(deck) = 'array'),
  updated_at timestamptz not null default now()
);

drop trigger if exists frontline_loadouts_set_updated_at on public.frontline_loadouts;
create trigger frontline_loadouts_set_updated_at
before update on public.frontline_loadouts
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.player_resources enable row level security;
alter table public.resource_ledger enable row level security;
alter table public.player_heroes enable row level security;
alter table public.player_frontline_cards enable row level security;
alter table public.frontline_loadouts enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles for select
using (user_id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles for insert
with check (user_id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists player_resources_select_own on public.player_resources;
create policy player_resources_select_own
on public.player_resources for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = player_resources.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists player_heroes_select_own on public.player_heroes;
create policy player_heroes_select_own
on public.player_heroes for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = player_heroes.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists player_frontline_cards_select_own on public.player_frontline_cards;
create policy player_frontline_cards_select_own
on public.player_frontline_cards for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = player_frontline_cards.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists frontline_loadouts_select_own on public.frontline_loadouts;
create policy frontline_loadouts_select_own
on public.frontline_loadouts for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = frontline_loadouts.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists resource_ledger_select_own on public.resource_ledger;
create policy resource_ledger_select_own
on public.resource_ledger for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = resource_ledger.profile_id
      and profiles.user_id = auth.uid()
  )
);

-- Las escrituras de tablas sensibles quedan reservadas para funciones de servidor
-- con rol privilegiado. No se crean policies de insert/update/delete para cliente.
