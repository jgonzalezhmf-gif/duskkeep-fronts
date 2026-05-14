-- Duskkeep Fronts - autorizar compra diaria de tickets de Arena.
-- Mantiene coste, limite diario e idempotencia en servidor para otra oferta simple de Shop.

create or replace function public.purchase_shop_offer(
  p_idempotency_key text,
  p_offer_id text,
  p_quantity int default 1
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
  v_purchase_day text := to_char(now() at time zone 'utc', 'YYYY-MM-DD');
  v_daily_count int;
  v_daily_limit int := 1;
  v_resources public.player_resources%rowtype;
  v_cost_gold int := 0;
  v_cost_gems int := 0;
  v_reward_gold int := 0;
  v_reward_dust int := 0;
  v_reward_gems int := 0;
  v_reward_arena_tickets int := 0;
  v_reward_adventure_keys int := 0;
  v_cost jsonb;
  v_contents jsonb;
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_offer_id is null or trim(p_offer_id) = '' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid offer id');
  end if;

  if p_quantity is null or p_quantity <> 1 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'This offer only supports quantity 1');
  end if;

  case p_offer_id
    when 'adventure_key_ring' then
      v_cost_gems := 45;
      v_reward_adventure_keys := 1;
      v_daily_limit := 1;
    when 'daily_raid_payout' then
      v_cost_gems := 20;
      v_reward_gold := 450;
      v_reward_dust := 35;
      v_daily_limit := 2;
    when 'daily_arena_tickets' then
      v_cost_gems := 30;
      v_reward_arena_tickets := 3;
      v_daily_limit := 1;
    else
      return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Shop offer is not supported by the server yet');
  end case;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(digest('purchaseShopOffer:' || p_offer_id || ':' || p_quantity::text, 'sha256'), 'hex');

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'purchaseShopOffer'
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

  perform pg_advisory_xact_lock(hashtext(v_profile_id::text || ':' || p_offer_id || ':' || v_purchase_day));

  if p_offer_id = 'adventure_key_ring' and not exists (
    select 1
      from public.adventure_progress
      where profile_id = v_profile_id
        and node_id = 'c1l2'
        and (cleared = true or first_clear_taken = true or claimed = true)
  ) then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Adventure keys are not unlocked yet');
  end if;

  select coalesce(sum(quantity), 0)
    into v_daily_count
    from public.shop_purchases
    where profile_id = v_profile_id
      and offer_id = p_offer_id
      and purchase_day = v_purchase_day;

  if v_daily_count >= v_daily_limit then
    return jsonb_build_object('ok', false, 'code', 'daily_limit_reached', 'reason', 'Daily limit reached');
  end if;

  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
  end if;

  if v_resources.gold < v_cost_gold then
    return jsonb_build_object('ok', false, 'code', 'insufficient_resources', 'reason', 'Not enough gold');
  end if;
  if v_resources.gems < v_cost_gems then
    return jsonb_build_object('ok', false, 'code', 'insufficient_resources', 'reason', 'Not enough gems');
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
    'purchaseShopOffer',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  update public.player_resources
    set gold = gold - v_cost_gold + v_reward_gold,
        dust = dust + v_reward_dust,
        gems = gems - v_cost_gems + v_reward_gems,
        arena_tickets = arena_tickets + v_reward_arena_tickets,
        adventure_keys = adventure_keys + v_reward_adventure_keys
    where profile_id = v_profile_id
    returning * into v_resources;

  if v_cost_gold > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'gold', -v_cost_gold, v_resources.gold - v_reward_gold, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_reward_gold > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'gold', v_reward_gold, v_resources.gold, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_reward_dust > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'dust', v_reward_dust, v_resources.dust, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_cost_gems > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'gems', -v_cost_gems, v_resources.gems - v_reward_gems, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_reward_gems > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'gems', v_reward_gems, v_resources.gems, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_reward_arena_tickets > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'arena_tickets', v_reward_arena_tickets, v_resources.arena_tickets, jsonb_build_object('offerId', p_offer_id));
  end if;
  if v_reward_adventure_keys > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'shop_purchase', 'adventure_keys', v_reward_adventure_keys, v_resources.adventure_keys, jsonb_build_object('offerId', p_offer_id));
  end if;

  v_cost := jsonb_strip_nulls(jsonb_build_object(
    'gold', nullif(v_cost_gold, 0),
    'gems', nullif(v_cost_gems, 0)
  ));
  v_contents := jsonb_strip_nulls(jsonb_build_object(
    'gold', nullif(v_reward_gold, 0),
    'dust', nullif(v_reward_dust, 0),
    'gems', nullif(v_reward_gems, 0),
    'arenaTickets', nullif(v_reward_arena_tickets, 0),
    'adventureKeys', nullif(v_reward_adventure_keys, 0)
  ));

  insert into public.shop_purchases (
    profile_id,
    offer_id,
    purchase_day,
    quantity,
    cost,
    contents,
    idempotency_key,
    operation_id,
    created_at
  )
  values (
    v_profile_id,
    p_offer_id,
    v_purchase_day,
    1,
    v_cost,
    v_contents,
    p_idempotency_key,
    v_operation_id,
    v_now
  );

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'offerId', p_offer_id,
      'quantity', 1,
      'costPaid', v_cost,
      'contentsGranted', v_contents,
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      ),
      'remaining', greatest(0, v_daily_limit - v_daily_count - 1)
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

revoke all on function public.purchase_shop_offer(text, text, int) from public;
grant execute on function public.purchase_shop_offer(text, text, int) to authenticated;
