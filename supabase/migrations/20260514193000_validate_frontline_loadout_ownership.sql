-- Duskkeep Fronts - validacion server-side de ownership del loadout.
-- La forma ya se valida en API/RPC; esta migracion impide que el cliente
-- guarde heroes/cartas que no pertenezcan al perfil o no esten desbloqueados.

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
  v_squad_non_null_count int;
  v_squad_distinct_count int;
  v_squad_owned_count int;
  v_deck_non_null_count int;
  v_deck_distinct_count int;
  v_deck_owned_count int;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_leader_id is null or trim(p_leader_id) not in ('leader_aurora', 'leader_morrow', 'leader_elowen') then
    return jsonb_build_object('ok', false, 'code', 'invalid_loadout', 'reason', 'Invalid leader id');
  end if;

  if p_squad is null or jsonb_typeof(p_squad) <> 'array' or jsonb_array_length(p_squad) <> 3 then
    return jsonb_build_object('ok', false, 'code', 'invalid_loadout', 'reason', 'Invalid squad shape');
  end if;

  if p_deck is null or jsonb_typeof(p_deck) <> 'array' or jsonb_array_length(p_deck) <> 8 then
    return jsonb_build_object('ok', false, 'code', 'invalid_loadout', 'reason', 'Invalid deck shape');
  end if;

  if exists (
    select 1
      from jsonb_array_elements(p_squad) as squad_slot(value)
      where jsonb_typeof(squad_slot.value) not in ('string', 'null')
  ) then
    return jsonb_build_object('ok', false, 'code', 'invalid_loadout', 'reason', 'Invalid squad slot');
  end if;

  if exists (
    select 1
      from jsonb_array_elements(p_deck) as deck_slot(value)
      where jsonb_typeof(deck_slot.value) not in ('string', 'null')
  ) then
    return jsonb_build_object('ok', false, 'code', 'invalid_loadout', 'reason', 'Invalid deck slot');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  with squad_ids as (
    select value #>> '{}' as hero_id
      from jsonb_array_elements(p_squad)
      where jsonb_typeof(value) = 'string'
  )
  select count(*), count(distinct hero_id)
    into v_squad_non_null_count, v_squad_distinct_count
    from squad_ids;

  if v_squad_non_null_count <> v_squad_distinct_count then
    return jsonb_build_object('ok', false, 'code', 'invalid_loadout', 'reason', 'Duplicate squad hero');
  end if;

  with squad_ids as (
    select value #>> '{}' as hero_id
      from jsonb_array_elements(p_squad)
      where jsonb_typeof(value) = 'string'
  )
  select count(*)
    into v_squad_owned_count
    from squad_ids
    join public.player_heroes h
      on h.profile_id = v_profile_id
      and h.hero_id = squad_ids.hero_id
      and h.unlocked = true;

  if v_squad_owned_count <> v_squad_non_null_count then
    return jsonb_build_object('ok', false, 'code', 'invalid_loadout', 'reason', 'Squad hero is not unlocked');
  end if;

  with deck_ids as (
    select value #>> '{}' as card_id
      from jsonb_array_elements(p_deck)
      where jsonb_typeof(value) = 'string'
  )
  select count(*), count(distinct card_id)
    into v_deck_non_null_count, v_deck_distinct_count
    from deck_ids;

  if v_deck_non_null_count <> v_deck_distinct_count then
    return jsonb_build_object('ok', false, 'code', 'invalid_loadout', 'reason', 'Duplicate deck card');
  end if;

  with deck_ids as (
    select value #>> '{}' as card_id
      from jsonb_array_elements(p_deck)
      where jsonb_typeof(value) = 'string'
  )
  select count(*)
    into v_deck_owned_count
    from deck_ids
    join public.player_frontline_cards c
      on c.profile_id = v_profile_id
      and c.card_id = deck_ids.card_id
      and c.unlocked = true;

  if v_deck_owned_count <> v_deck_non_null_count then
    return jsonb_build_object('ok', false, 'code', 'invalid_loadout', 'reason', 'Deck card is not unlocked');
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
