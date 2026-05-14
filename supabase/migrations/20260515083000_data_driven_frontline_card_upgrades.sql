-- Duskkeep Fronts - Frontline card upgrades data-driven.
-- Externaliza cartas upgradeables, nivel maximo y costes en catalogos internos.

create table if not exists public.server_upgradeable_frontline_cards (
  card_id text primary key check (card_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  enabled boolean not null default true,
  max_level int not null default 5 check (max_level >= 1 and max_level <= 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists server_upgradeable_frontline_cards_set_updated_at on public.server_upgradeable_frontline_cards;
create trigger server_upgradeable_frontline_cards_set_updated_at
before update on public.server_upgradeable_frontline_cards
for each row execute function public.set_updated_at();

alter table public.server_upgradeable_frontline_cards enable row level security;

revoke all on table public.server_upgradeable_frontline_cards from public;
revoke all on table public.server_upgradeable_frontline_cards from anon;
revoke all on table public.server_upgradeable_frontline_cards from authenticated;

insert into public.server_upgradeable_frontline_cards (card_id, enabled, max_level, notes)
values
  ('order_guard_wall', true, 5, 'Upgradeable Frontline card'),
  ('order_twin_slash', true, 5, 'Upgradeable Frontline card'),
  ('order_shadow_dive', true, 5, 'Upgradeable Frontline card'),
  ('order_focus_fire', true, 5, 'Upgradeable Frontline card'),
  ('tactic_battle_hymn', true, 5, 'Upgradeable Frontline card'),
  ('tactic_sanctuary', true, 5, 'Upgradeable Frontline card'),
  ('tactic_smokescreen', true, 5, 'Upgradeable Frontline card'),
  ('tactic_core_burst', true, 5, 'Upgradeable Frontline card'),
  ('summon_wolf', true, 5, 'Upgradeable Frontline card'),
  ('summon_barrier', true, 5, 'Upgradeable Frontline card'),
  ('summon_totem', true, 5, 'Upgradeable Frontline card')
on conflict (card_id) do update set
  enabled = excluded.enabled,
  max_level = excluded.max_level,
  notes = excluded.notes;

create table if not exists public.server_frontline_card_upgrade_costs (
  current_level int primary key check (current_level >= 1 and current_level <= 100),
  enabled boolean not null default true,
  cost_gold int not null default 0 check (cost_gold >= 0 and cost_gold <= 10000000),
  cost_dust int not null default 0 check (cost_dust >= 0 and cost_dust <= 10000000),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists server_frontline_card_upgrade_costs_set_updated_at on public.server_frontline_card_upgrade_costs;
create trigger server_frontline_card_upgrade_costs_set_updated_at
before update on public.server_frontline_card_upgrade_costs
for each row execute function public.set_updated_at();

alter table public.server_frontline_card_upgrade_costs enable row level security;

revoke all on table public.server_frontline_card_upgrade_costs from public;
revoke all on table public.server_frontline_card_upgrade_costs from anon;
revoke all on table public.server_frontline_card_upgrade_costs from authenticated;

insert into public.server_frontline_card_upgrade_costs (current_level, enabled, cost_gold, cost_dust, notes)
select
  level_value,
  true,
  90 + level_value * 45,
  12 + level_value * 8,
  'Frontline card upgrade cost'
from generate_series(1, 4) as level_value
on conflict (current_level) do update set
  enabled = excluded.enabled,
  cost_gold = excluded.cost_gold,
  cost_dust = excluded.cost_dust,
  notes = excluded.notes;

create or replace function public.frontline_card_upgrade_cost(p_current_level int)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_cost public.server_frontline_card_upgrade_costs%rowtype;
begin
  select *
    into v_cost
    from public.server_frontline_card_upgrade_costs
    where current_level = p_current_level
      and enabled = true;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'gold', v_cost.cost_gold,
    'dust', v_cost.cost_dust
  );
end;
$$;

revoke all on function public.frontline_card_upgrade_cost(int) from public;
revoke all on function public.frontline_card_upgrade_cost(int) from authenticated;

create or replace function public.upgrade_frontline_card(
  p_idempotency_key text,
  p_card_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_card_rule public.server_upgradeable_frontline_cards%rowtype;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_resources public.player_resources%rowtype;
  v_card public.player_frontline_cards%rowtype;
  v_cost jsonb;
  v_cost_gold int;
  v_cost_dust int;
  v_next_level int;
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_card_id is null or trim(p_card_id) = '' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid card id');
  end if;

  select *
    into v_card_rule
    from public.server_upgradeable_frontline_cards
    where card_id = trim(p_card_id)
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Card is not upgradeable');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(digest('upgradeFrontlineCard:' || trim(p_card_id), 'sha256'), 'hex');

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'upgradeFrontlineCard'
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

  select *
    into v_card
    from public.player_frontline_cards
    where profile_id = v_profile_id
      and card_id = trim(p_card_id)
    for update;

  if not found or v_card.unlocked is not true then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Frontline card is locked');
  end if;

  if v_card.level >= v_card_rule.max_level then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Frontline card is already at max level');
  end if;

  v_cost := public.frontline_card_upgrade_cost(v_card.level);
  if v_cost is null then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Frontline card upgrade cost is unavailable');
  end if;

  v_cost_gold := coalesce((v_cost ->> 'gold')::int, 0);
  v_cost_dust := coalesce((v_cost ->> 'dust')::int, 0);
  v_next_level := v_card.level + 1;

  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
  end if;

  if v_resources.gold < v_cost_gold or v_resources.dust < v_cost_dust then
    return jsonb_build_object('ok', false, 'code', 'insufficient_resources', 'reason', 'Not enough resources');
  end if;

  insert into public.server_operations (
    id,
    profile_id,
    idempotency_key,
    operation_type,
    payload_hash,
    status,
    result,
    created_at,
    completed_at
  )
  values (
    v_operation_id,
    v_profile_id,
    p_idempotency_key,
    'upgradeFrontlineCard',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  update public.player_resources
    set gold = gold - v_cost_gold,
        dust = dust - v_cost_dust
    where profile_id = v_profile_id
    returning * into v_resources;

  update public.player_frontline_cards
    set level = v_next_level,
        updated_at = v_now
    where profile_id = v_profile_id
      and card_id = trim(p_card_id);

  insert into public.resource_ledger (
    profile_id,
    operation_id,
    source,
    resource,
    delta,
    balance_after,
    metadata
  )
  values
    (
      v_profile_id,
      v_operation_id,
      'frontline_card_upgrade',
      'gold',
      -v_cost_gold,
      v_resources.gold,
      jsonb_build_object('cardId', trim(p_card_id), 'level', v_next_level)
    ),
    (
      v_profile_id,
      v_operation_id,
      'frontline_card_upgrade',
      'dust',
      -v_cost_dust,
      v_resources.dust,
      jsonb_build_object('cardId', trim(p_card_id), 'level', v_next_level)
    );

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'cardId', trim(p_card_id),
      'level', v_next_level,
      'costPaid', jsonb_build_object('gold', v_cost_gold, 'dust', v_cost_dust),
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      )
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

revoke all on function public.upgrade_frontline_card(text, text) from public;
grant execute on function public.upgrade_frontline_card(text, text) to authenticated;
