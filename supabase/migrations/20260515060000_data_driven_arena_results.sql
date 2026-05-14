-- Duskkeep Fronts - Arena results data-driven.
-- Externaliza rivales, presets, coste y rewards por resultado en catalogo interno.

create table if not exists public.server_arena_opponents (
  opponent_id text primary key check (opponent_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  enabled boolean not null default true,
  preset_id text not null check (preset_id ~ '^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$'),
  arena_ticket_cost int not null default 1 check (arena_ticket_cost >= 0 and arena_ticket_cost <= 100),
  win_reward_id text not null references public.server_reward_definitions(reward_id),
  draw_reward_id text not null references public.server_reward_definitions(reward_id),
  loss_reward_id text not null references public.server_reward_definitions(reward_id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists server_arena_opponents_set_updated_at on public.server_arena_opponents;
create trigger server_arena_opponents_set_updated_at
before update on public.server_arena_opponents
for each row execute function public.set_updated_at();

alter table public.server_arena_opponents enable row level security;

revoke all on table public.server_arena_opponents from public;
revoke all on table public.server_arena_opponents from anon;
revoke all on table public.server_arena_opponents from authenticated;

insert into public.server_reward_definitions (reward_id, enabled, rewards, notes)
values
  ('arena_bonewood_win', true, '{"gold":120,"gems":3,"accountXp":8}'::jsonb, 'Arena Bonewood win reward'),
  ('arena_plague_win', true, '{"gold":180,"dust":20,"gems":5,"accountXp":10}'::jsonb, 'Arena Plague win reward'),
  ('arena_ember_win', true, '{"gold":260,"dust":35,"gems":8,"accountXp":14}'::jsonb, 'Arena Ember win reward'),
  ('arena_draw', true, '{"gold":45,"dust":5,"accountXp":3}'::jsonb, 'Arena draw consolation reward'),
  ('arena_loss', true, '{"gold":25,"accountXp":2}'::jsonb, 'Arena loss consolation reward')
on conflict (reward_id) do update set
  enabled = excluded.enabled,
  rewards = excluded.rewards,
  notes = excluded.notes;

insert into public.server_arena_opponents (
  opponent_id,
  enabled,
  preset_id,
  arena_ticket_cost,
  win_reward_id,
  draw_reward_id,
  loss_reward_id,
  notes
)
values
  ('arena_bonewood', true, 'bonewood_raiders', 1, 'arena_bonewood_win', 'arena_draw', 'arena_loss', 'Arena Bonewood rival'),
  ('arena_plague', true, 'plague_pack', 1, 'arena_plague_win', 'arena_draw', 'arena_loss', 'Arena Plague rival'),
  ('arena_ember', true, 'ember_court', 1, 'arena_ember_win', 'arena_draw', 'arena_loss', 'Arena Ember rival')
on conflict (opponent_id) do update set
  enabled = excluded.enabled,
  preset_id = excluded.preset_id,
  arena_ticket_cost = excluded.arena_ticket_cost,
  win_reward_id = excluded.win_reward_id,
  draw_reward_id = excluded.draw_reward_id,
  loss_reward_id = excluded.loss_reward_id,
  notes = excluded.notes;

create or replace function public.record_arena_result(
  p_idempotency_key text,
  p_opponent_id text,
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
  v_opponent public.server_arena_opponents%rowtype;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_resources public.player_resources%rowtype;
  v_reward_id text;
  v_reward_result jsonb;
  v_rewards jsonb := '{}'::jsonb;
  v_arena_wins int := 0;
  v_arena_losses int := 0;
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
    into v_opponent
    from public.server_arena_opponents
    where opponent_id = p_opponent_id
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Arena opponent not supported');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(
    digest(
      'recordArenaResult:'
      || p_opponent_id || ':'
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
    if v_existing_operation.operation_type <> 'recordArenaResult'
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
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
  end if;

  if v_resources.arena_tickets < v_opponent.arena_ticket_cost then
    return jsonb_build_object('ok', false, 'code', 'insufficient_resources', 'reason', 'Arena ticket required');
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
    'recordArenaResult',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now
  );

  if v_opponent.arena_ticket_cost > 0 then
    update public.player_resources
      set arena_tickets = arena_tickets - v_opponent.arena_ticket_cost
      where profile_id = v_profile_id
      returning * into v_resources;

    insert into public.resource_ledger (
      profile_id,
      operation_id,
      source,
      resource,
      delta,
      balance_after,
      metadata
    )
    values (
      v_profile_id,
      v_operation_id,
      'arena_result_cost',
      'arena_tickets',
      -v_opponent.arena_ticket_cost,
      v_resources.arena_tickets,
      jsonb_build_object('opponentId', p_opponent_id)
    );
  end if;

  v_reward_id := case
    when p_winner = 'ally' then v_opponent.win_reward_id
    when p_winner = 'draw' then v_opponent.draw_reward_id
    else v_opponent.loss_reward_id
  end;

  v_reward_result := public.grant_reward_definition(
    v_profile_id,
    v_operation_id,
    'arena_result',
    v_reward_id,
    jsonb_build_object('opponentId', p_opponent_id, 'winner', p_winner)
  );

  if coalesce((v_reward_result ->> 'ok')::boolean, false) is not true then
    raise exception 'Failed to grant arena result reward: %', v_reward_result;
  end if;

  v_rewards := coalesce(v_reward_result -> 'rewardsGranted', '{}'::jsonb);
  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id;

  insert into public.battle_results (
    profile_id,
    source,
    arena_opponent_id,
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
    'arena',
    p_opponent_id,
    v_opponent.preset_id,
    p_battle_seed,
    p_winner,
    p_turns,
    coalesce(p_battle_summary, '{}'::jsonb),
    v_rewards,
    v_operation_id,
    v_now
  );

  select count(*) filter (where winner = 'ally'),
         count(*) filter (where winner <> 'ally')
    into v_arena_wins, v_arena_losses
    from public.battle_results
    where profile_id = v_profile_id
      and source = 'arena';

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'opponentId', p_opponent_id,
      'winner', p_winner,
      'rewardId', v_reward_id,
      'rewardsGranted', v_rewards,
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      ),
      'arenaWins', v_arena_wins,
      'arenaLosses', v_arena_losses,
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

revoke all on function public.record_arena_result(text, text, bigint, text, int, jsonb) from public;
grant execute on function public.record_arena_result(text, text, bigint, text, int, jsonb) to authenticated;
