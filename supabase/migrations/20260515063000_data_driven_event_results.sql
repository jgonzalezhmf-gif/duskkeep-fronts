-- Duskkeep Fronts - Event results data-driven.
-- Externaliza eventos, unlock level, presets y rewards diarios first-clear en catalogo interno.

create table if not exists public.server_event_definitions (
  event_id text primary key check (event_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  enabled boolean not null default true,
  preset_id text not null check (preset_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  unlock_account_level int not null default 1 check (unlock_account_level >= 1 and unlock_account_level <= 1000),
  daily_first_clear_reward_id text not null references public.server_reward_definitions(reward_id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists server_event_definitions_set_updated_at on public.server_event_definitions;
create trigger server_event_definitions_set_updated_at
before update on public.server_event_definitions
for each row execute function public.set_updated_at();

alter table public.server_event_definitions enable row level security;

revoke all on table public.server_event_definitions from public;
revoke all on table public.server_event_definitions from anon;
revoke all on table public.server_event_definitions from authenticated;

insert into public.server_reward_definitions (reward_id, enabled, rewards, notes)
values
  ('event_gold_rush_daily_first_clear', true, '{"gold":400,"xp":60,"accountXp":12}'::jsonb, 'Gold Rush daily first clear reward'),
  ('event_arcane_surge_daily_first_clear', true, '{"gold":150,"dust":120,"xp":60,"accountXp":12}'::jsonb, 'Arcane Surge daily first clear reward'),
  ('event_td_fortress_siege_daily_first_clear', true, '{"gold":300,"dust":50,"gems":50,"accountXp":20,"shards":[{"heroId":"ursa","amount":4}]}'::jsonb, 'Fortress Siege daily first clear reward')
on conflict (reward_id) do update set
  enabled = excluded.enabled,
  rewards = excluded.rewards,
  notes = excluded.notes;

insert into public.server_event_definitions (
  event_id,
  enabled,
  preset_id,
  unlock_account_level,
  daily_first_clear_reward_id,
  notes
)
values
  ('gold_rush', true, 'bonewood_raiders', 4, 'event_gold_rush_daily_first_clear', 'Gold Rush event'),
  ('arcane_surge', true, 'plague_pack', 8, 'event_arcane_surge_daily_first_clear', 'Arcane Surge event'),
  ('td_fortress_siege', true, 'ember_court', 6, 'event_td_fortress_siege_daily_first_clear', 'Fortress Siege event')
on conflict (event_id) do update set
  enabled = excluded.enabled,
  preset_id = excluded.preset_id,
  unlock_account_level = excluded.unlock_account_level,
  daily_first_clear_reward_id = excluded.daily_first_clear_reward_id,
  notes = excluded.notes;

create or replace function public.record_event_result(
  p_idempotency_key text,
  p_event_id text,
  p_battle_seed bigint,
  p_winner text,
  p_turns int,
  p_battle_summary jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_account_level int;
  v_event public.server_event_definitions%rowtype;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_today_utc date := (now() at time zone 'utc')::date;
  v_resources public.player_resources%rowtype;
  v_first_clear boolean := false;
  v_reward_result jsonb;
  v_rewards jsonb := '{}'::jsonb;
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_winner not in ('ally', 'enemy', 'draw') then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid winner');
  end if;

  if p_turns is null or p_turns < 0 or p_turns > 500 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid turn count');
  end if;

  select *
    into v_event
    from public.server_event_definitions
    where event_id = p_event_id
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Event operation not supported');
  end if;

  select id, account_level
    into v_profile_id, v_account_level
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  if v_account_level < v_event.unlock_account_level then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Event operation is locked');
  end if;

  v_payload_hash := encode(
    digest(
      'recordEventResult:'
      || p_event_id || ':'
      || p_battle_seed::text || ':'
      || p_winner || ':'
      || p_turns::text || ':'
      || coalesce(p_battle_summary, '{}'::jsonb)::text,
      'sha256'
    ),
    'hex'
  );

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'recordEventResult'
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

  v_first_clear := p_winner = 'ally' and not exists (
    select 1
      from public.battle_results
      where profile_id = v_profile_id
        and source = 'event'
        and event_id = p_event_id
        and winner = 'ally'
        and (created_at at time zone 'utc')::date = v_today_utc
  );

  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
  end if;

  insert into public.server_operations (
    id,
    profile_id,
    idempotency_key,
    operation_type,
    payload_hash,
    status,
    result,
    created_at
  )
  values (
    v_operation_id,
    v_profile_id,
    p_idempotency_key,
    'recordEventResult',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now
  );

  if v_first_clear then
    v_reward_result := public.grant_reward_definition(
      v_profile_id,
      v_operation_id,
      'event_result',
      v_event.daily_first_clear_reward_id,
      jsonb_build_object('eventId', p_event_id, 'firstClear', true)
    );

    if coalesce((v_reward_result ->> 'ok')::boolean, false) is not true then
      raise exception 'Failed to grant event result reward: %', v_reward_result;
    end if;

    v_rewards := coalesce(v_reward_result -> 'rewardsGranted', '{}'::jsonb);
    select *
      into v_resources
      from public.player_resources
      where profile_id = v_profile_id;
  end if;

  insert into public.battle_results (
    profile_id,
    source,
    event_id,
    preset_id,
    seed,
    winner,
    turns,
    summary,
    rewards,
    operation_id,
    created_at
  )
  values (
    v_profile_id,
    'event',
    p_event_id,
    v_event.preset_id,
    p_battle_seed,
    p_winner,
    p_turns,
    coalesce(p_battle_summary, '{}'::jsonb),
    v_rewards,
    v_operation_id,
    v_now
  );

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'eventId', p_event_id,
      'winner', p_winner,
      'firstClear', v_first_clear,
      'rewardId', case when v_first_clear then v_event.daily_first_clear_reward_id else null end,
      'rewardsGranted', v_rewards,
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      ),
      'requiresSnapshotRefresh', coalesce((v_reward_result ->> 'requiresSnapshotRefresh')::boolean, false)
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

revoke all on function public.record_event_result(text, text, bigint, text, int, jsonb) from public;
grant execute on function public.record_event_result(text, text, bigint, text, int, jsonb) to authenticated;
