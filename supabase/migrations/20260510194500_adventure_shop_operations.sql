-- Duskkeep Fronts - progreso, claims y operaciones sensibles.
-- Extiende el nucleo seguro con tablas para Adventure, Shop, misiones,
-- resultados de batalla e idempotencia. No conecta el cliente todavia.

create table if not exists public.server_operations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  idempotency_key text not null,
  operation_type text not null,
  payload_hash text not null,
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  result jsonb not null default '{}'::jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (profile_id, idempotency_key)
);

create index if not exists server_operations_profile_created_idx
on public.server_operations(profile_id, created_at desc);

create table if not exists public.adventure_progress (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  chapter_id text not null,
  node_id text not null,
  status text not null check (status in ('locked', 'available', 'current', 'cleared', 'completed', 'claimed', 'hidden')),
  cleared boolean not null default false,
  first_clear_taken boolean not null default false,
  claimed boolean not null default false,
  cleared_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (profile_id, node_id)
);

drop trigger if exists adventure_progress_set_updated_at on public.adventure_progress;
create trigger adventure_progress_set_updated_at
before update on public.adventure_progress
for each row execute function public.set_updated_at();

create index if not exists adventure_progress_profile_chapter_idx
on public.adventure_progress(profile_id, chapter_id);

create table if not exists public.adventure_map_claims (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  interaction_id text not null,
  claimed boolean not null default false,
  claimed_at timestamptz,
  reset_available_at timestamptz,
  loot_id text,
  loot_tier text check (loot_tier is null or loot_tier in ('common', 'rare', 'epic', 'legendary')),
  loot_title text,
  rewards jsonb not null default '{}'::jsonb,
  operation_id uuid references public.server_operations(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (profile_id, interaction_id)
);

drop trigger if exists adventure_map_claims_set_updated_at on public.adventure_map_claims;
create trigger adventure_map_claims_set_updated_at
before update on public.adventure_map_claims
for each row execute function public.set_updated_at();

create index if not exists adventure_map_claims_reset_idx
on public.adventure_map_claims(profile_id, reset_available_at);

create table if not exists public.shop_purchases (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  offer_id text not null,
  purchase_day text,
  quantity int not null default 1 check (quantity > 0),
  cost jsonb not null default '{}'::jsonb,
  contents jsonb not null default '{}'::jsonb,
  idempotency_key text,
  operation_id uuid references public.server_operations(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists shop_purchases_profile_created_idx
on public.shop_purchases(profile_id, created_at desc);

create index if not exists shop_purchases_daily_limit_idx
on public.shop_purchases(profile_id, offer_id, purchase_day);

create unique index if not exists shop_purchases_idempotency_idx
on public.shop_purchases(profile_id, idempotency_key)
where idempotency_key is not null;

create table if not exists public.missions_progress (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  mission_id text not null,
  cycle_key text not null,
  progress int not null default 0 check (progress >= 0),
  target int not null default 1 check (target > 0),
  claimed boolean not null default false,
  claimed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (profile_id, mission_id, cycle_key)
);

drop trigger if exists missions_progress_set_updated_at on public.missions_progress;
create trigger missions_progress_set_updated_at
before update on public.missions_progress
for each row execute function public.set_updated_at();

create table if not exists public.daily_login_claims (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day_key text not null,
  streak int not null default 1 check (streak >= 1),
  rewards jsonb not null default '{}'::jsonb,
  claimed_at timestamptz not null default now(),
  operation_id uuid references public.server_operations(id) on delete set null,
  primary key (profile_id, day_key)
);

create table if not exists public.battle_results (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('adventure', 'arena', 'event', 'fortress', 'practice')),
  node_id text,
  event_id text,
  arena_opponent_id text,
  preset_id text,
  seed bigint not null,
  winner text not null check (winner in ('ally', 'enemy', 'draw')),
  turns int not null check (turns >= 0),
  summary jsonb not null default '{}'::jsonb,
  rewards jsonb not null default '{}'::jsonb,
  operation_id uuid references public.server_operations(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists battle_results_profile_created_idx
on public.battle_results(profile_id, created_at desc);

create index if not exists battle_results_adventure_node_idx
on public.battle_results(profile_id, node_id)
where node_id is not null;

alter table public.server_operations enable row level security;
alter table public.adventure_progress enable row level security;
alter table public.adventure_map_claims enable row level security;
alter table public.shop_purchases enable row level security;
alter table public.missions_progress enable row level security;
alter table public.daily_login_claims enable row level security;
alter table public.battle_results enable row level security;

drop policy if exists server_operations_select_own on public.server_operations;
create policy server_operations_select_own
on public.server_operations for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = server_operations.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists adventure_progress_select_own on public.adventure_progress;
create policy adventure_progress_select_own
on public.adventure_progress for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = adventure_progress.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists adventure_map_claims_select_own on public.adventure_map_claims;
create policy adventure_map_claims_select_own
on public.adventure_map_claims for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = adventure_map_claims.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists shop_purchases_select_own on public.shop_purchases;
create policy shop_purchases_select_own
on public.shop_purchases for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = shop_purchases.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists missions_progress_select_own on public.missions_progress;
create policy missions_progress_select_own
on public.missions_progress for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = missions_progress.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists daily_login_claims_select_own on public.daily_login_claims;
create policy daily_login_claims_select_own
on public.daily_login_claims for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = daily_login_claims.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists battle_results_select_own on public.battle_results;
create policy battle_results_select_own
on public.battle_results for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = battle_results.profile_id
      and profiles.user_id = auth.uid()
  )
);

-- Sin policies de escritura para cliente: claims, compras, resultados,
-- misiones y ledger deben pasar por funciones/endpoints autoritativos.
