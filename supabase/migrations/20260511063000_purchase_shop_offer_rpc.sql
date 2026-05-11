-- Duskkeep Fronts - RPC autoritativa para compras de Shop.
-- Primera implementacion: `adventure_key_ring`.
-- Mantiene la compra atomica: limite diario, coste, reward, ledger e idempotencia.

create unique index if not exists shop_purchases_adventure_key_ring_daily_once_idx
on public.shop_purchases(profile_id, offer_id, purchase_day)
where offer_id = 'adventure_key_ring' and purchase_day is not null;

create or replace function public.purchase_shop_offer(
  p_idempotency_key text,
  p_offer_id text,
  p_quantity int default 1
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
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
  v_resources public.player_resources%rowtype;
  v_cost_gems int := 45;
  v_reward_adventure_keys int := 1;
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

  if p_offer_id <> 'adventure_key_ring' then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Shop offer is not supported by the server yet');
  end if;

  perform pg_advisory_xact_lock(hashtext(v_profile_id::text || ':' || p_offer_id || ':' || v_purchase_day));

  if not exists (
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

  if v_daily_count >= 1 then
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
    set gems = gems - v_cost_gems,
        adventure_keys = adventure_keys + v_reward_adventure_keys
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
  values
    (
      v_profile_id,
      v_operation_id,
      'shop_purchase',
      'gems',
      -v_cost_gems,
      v_resources.gems,
      jsonb_build_object('offerId', p_offer_id)
    ),
    (
      v_profile_id,
      v_operation_id,
      'shop_purchase',
      'adventure_keys',
      v_reward_adventure_keys,
      v_resources.adventure_keys,
      jsonb_build_object('offerId', p_offer_id)
    );

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
    jsonb_build_object('gems', v_cost_gems),
    jsonb_build_object('adventureKeys', v_reward_adventure_keys),
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
      'costPaid', jsonb_build_object('gems', v_cost_gems),
      'contentsGranted', jsonb_build_object('adventureKeys', v_reward_adventure_keys),
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      ),
      'remaining', 0
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
