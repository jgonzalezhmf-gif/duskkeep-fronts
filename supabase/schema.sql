-- Duskkeep Fronts alpha — reproducible schema.
-- Run:  supabase db reset  (or apply manually in your project).
-- Philosophy: small, boring tables. No fancy RLS in alpha.

create extension if not exists "pgcrypto";

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Commander',
  level int not null default 1,
  xp int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists player_resources (
  player_id uuid primary key references players(id) on delete cascade,
  gold int not null default 500,
  dust int not null default 50,
  gems int not null default 50,
  arena_tickets int not null default 5
);

create table if not exists heroes (
  id text primary key,
  name text not null,
  rarity text not null,
  faction text not null,
  role text not null,
  base_stats jsonb not null,
  active jsonb not null,
  passive jsonb not null,
  tags text[] not null default '{}',
  emoji text
);

create table if not exists player_heroes (
  player_id uuid references players(id) on delete cascade,
  hero_id text references heroes(id),
  level int not null default 1,
  stars int not null default 1,
  shards int not null default 0,
  xp int not null default 0,
  primary key (player_id, hero_id)
);

create table if not exists decks (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  name text not null default 'Main',
  created_at timestamptz not null default now()
);

create table if not exists deck_slots (
  deck_id uuid references decks(id) on delete cascade,
  slot_idx int not null check (slot_idx between 0 and 3),
  hero_id text references heroes(id),
  primary key (deck_id, slot_idx)
);

create table if not exists adventure_chapters (
  id int primary key,
  name text not null
);

create table if not exists adventure_levels (
  id text primary key,
  chapter int references adventure_chapters(id),
  index int not null,
  name text not null,
  enemy_team jsonb not null,
  rewards jsonb not null,
  first_clear_rewards jsonb,
  recommended_power int not null default 0,
  unlock_account_level int
);

create table if not exists battles (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  source text not null, -- adventure|arena|vsai|event
  seed bigint not null,
  winner text not null,
  turns int not null,
  created_at timestamptz not null default now()
);

create table if not exists missions (
  id text primary key,
  kind text not null check (kind in ('daily','weekly')),
  name text not null,
  description text,
  goal int not null,
  metric text not null,
  rewards jsonb not null
);

create table if not exists player_missions (
  player_id uuid references players(id) on delete cascade,
  mission_id text references missions(id),
  progress int not null default 0,
  claimed boolean not null default false,
  reset_at timestamptz not null default now(),
  primary key (player_id, mission_id)
);

create table if not exists events (
  id text primary key,
  name text not null,
  description text,
  enemy_team jsonb not null,
  rewards jsonb not null,
  starts_at timestamptz,
  ends_at timestamptz,
  emoji text
);

create table if not exists shop_offers (
  id text primary key,
  name text not null,
  description text,
  cost jsonb not null,
  contents jsonb not null,
  one_time boolean not null default false,
  emoji text
);

create table if not exists arena_snapshots (
  id text primary key,
  owner_name text not null,
  power int not null,
  team jsonb not null,
  updated_at timestamptz not null default now()
);

-- Useful indexes
create index if not exists idx_battles_player on battles(player_id, created_at desc);
create index if not exists idx_arena_power on arena_snapshots(power);
