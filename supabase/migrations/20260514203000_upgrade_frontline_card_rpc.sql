-- Duskkeep Fronts - RPC autoritativa para mejorar cartas Frontline.
-- Mantiene costes, ownership, idempotencia y ledger en servidor.

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
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_resources public.player_resources%rowtype;
  v_card public.player_frontline_cards%rowtype;
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

  if trim(p_card_id) <> all(array[
    'order_guard_wall',
    'order_twin_slash',
    'order_shadow_dive',
    'order_focus_fire',
    'tactic_battle_hymn',
    'tactic_sanctuary',
    'tactic_smokescreen',
    'tactic_core_burst',
    'summon_wolf',
    'summon_barrier',
    'summon_totem'
  ]) then
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

  if v_card.level >= 5 then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Frontline card is already at max level');
  end if;

  v_cost_gold := 90 + v_card.level * 45;
  v_cost_dust := 12 + v_card.level * 8;
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
