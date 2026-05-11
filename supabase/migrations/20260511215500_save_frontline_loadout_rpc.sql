-- Duskkeep Fronts - RPC autoritativa para persistir loadout Frontline.
-- Persiste leader/squad/deck del jugador sin cambiar reglas de combate.

create or replace function public.save_frontline_loadout(
  p_idempotency_key text,
  p_leader_id text,
  p_squad jsonb,
  p_deck jsonb
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
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_leader_id is null or trim(p_leader_id) = '' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid leader id');
  end if;

  if p_squad is null or jsonb_typeof(p_squad) <> 'array' or jsonb_array_length(p_squad) <> 3 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid squad shape');
  end if;

  if p_deck is null or jsonb_typeof(p_deck) <> 'array' or jsonb_array_length(p_deck) <> 8 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid deck shape');
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
      'saveLoadout:'
      || p_leader_id || ':'
      || p_squad::text || ':'
      || p_deck::text,
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
    if v_existing_operation.operation_type <> 'saveLoadout'
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
    'saveLoadout',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  insert into public.frontline_loadouts (
    profile_id,
    leader_id,
    squad,
    deck,
    updated_at
  )
  values (
    v_profile_id,
    p_leader_id,
    p_squad,
    p_deck,
    v_now
  )
  on conflict (profile_id) do update
    set leader_id = excluded.leader_id,
        squad = excluded.squad,
        deck = excluded.deck,
        updated_at = excluded.updated_at;

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'leaderId', p_leader_id,
      'squad', p_squad,
      'deck', p_deck,
      'updatedAt', v_now
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

revoke all on function public.save_frontline_loadout(text, text, jsonb, jsonb) from public;
grant execute on function public.save_frontline_loadout(text, text, jsonb, jsonb) to authenticated;
