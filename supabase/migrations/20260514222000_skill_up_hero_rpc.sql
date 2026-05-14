-- Duskkeep Fronts - RPC autoritativa para mejorar skill de heroes.
-- Consume Arcane Dust server-side, registra ledger y conserva idempotencia.

create or replace function public.skill_up_hero(
  p_idempotency_key text,
  p_hero_id text
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
  v_hero public.player_heroes%rowtype;
  v_cost_dust int;
  v_next_skill_level int;
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_hero_id is null or trim(p_hero_id) = '' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid hero id');
  end if;

  if trim(p_hero_id) <> all(array[
    'bran',
    'kara',
    'vex',
    'lyria',
    'mira',
    'drak',
    'morr',
    'ursa',
    'fenra',
    'sol',
    'noct',
    'ren',
    'tovi',
    'grom'
  ]) then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Hero is not upgradeable');
  end if;

  select id
    into v_profile_id
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(digest('skillUpHero:' || trim(p_hero_id), 'sha256'), 'hex');

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'skillUpHero'
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
    into v_hero
    from public.player_heroes
    where profile_id = v_profile_id
      and hero_id = trim(p_hero_id)
    for update;

  if not found or v_hero.unlocked is not true or v_hero.stars <= 0 then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Hero is locked');
  end if;

  if v_hero.skill_level >= 5 then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Skill already at max level');
  end if;

  v_cost_dust := case v_hero.skill_level
    when 1 then 100
    when 2 then 250
    when 3 then 500
    when 4 then 1000
    else 0
  end;
  v_next_skill_level := v_hero.skill_level + 1;

  select *
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Resources row not found');
  end if;

  if v_resources.dust < v_cost_dust then
    return jsonb_build_object('ok', false, 'code', 'insufficient_resources', 'reason', 'Not enough Arcane Dust');
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
    'skillUpHero',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now,
    null
  );

  update public.player_resources
    set dust = dust - v_cost_dust
    where profile_id = v_profile_id
    returning * into v_resources;

  update public.player_heroes
    set skill_level = v_next_skill_level,
        updated_at = v_now
    where profile_id = v_profile_id
      and hero_id = trim(p_hero_id);

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
    'hero_skill_up',
    'dust',
    -v_cost_dust,
    v_resources.dust,
    jsonb_build_object('heroId', trim(p_hero_id), 'skillLevel', v_next_skill_level)
  );

  perform public.advance_mission_progress(v_profile_id, 'heroes_upgraded', 1);

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'heroId', trim(p_hero_id),
      'skillLevel', v_next_skill_level,
      'costPaid', jsonb_build_object('dust', v_cost_dust),
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

revoke all on function public.skill_up_hero(text, text) from public;
grant execute on function public.skill_up_hero(text, text) to authenticated;
