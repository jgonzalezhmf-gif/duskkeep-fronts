-- Duskkeep Fronts - claim autoritativo de defensa manual de Fortress.
-- El cliente envia un resumen acotado de la defensa, pero el servidor decide
-- cooldown, recursos, ledger, estado de Fortress e idempotencia.

create or replace function public.claim_frontline_fortress_defense(
  p_idempotency_key text,
  p_battle_seed bigint,
  p_outcome text,
  p_turns int,
  p_castle_hp int,
  p_max_castle_hp int,
  p_enemies_defeated int,
  p_defense_summary jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile_id uuid;
  v_rule public.server_frontline_fortress_raid_profiles%rowtype;
  v_existing_operation public.server_operations%rowtype;
  v_operation_id uuid := gen_random_uuid();
  v_payload_hash text;
  v_now timestamptz := now();
  v_result jsonb;
  v_reward_result jsonb;
  v_fortress public.player_frontline_fortress%rowtype;
  v_keep int;
  v_treasury int;
  v_barracks int;
  v_account_level int;
  v_hero_power int := 0;
  v_defense_power int;
  v_attack_power int;
  v_raid_tempo int;
  v_integrity_delta int := 0;
  v_rewards jsonb;
  v_gold_reward int := 0;
  v_dust_reward int := 0;
  v_gems_reward int := 0;
  v_report jsonb;
  v_snapshot jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'unauthenticated', 'reason', 'Authentication required');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 12 or length(trim(p_idempotency_key)) > 160 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid idempotency key');
  end if;

  if p_outcome not in ('full_repel', 'partial_hold', 'breach')
    or p_turns is null or p_turns < 1 or p_turns > 80
    or p_castle_hp is null or p_castle_hp < 0 or p_castle_hp > 999
    or p_max_castle_hp is null or p_max_castle_hp < 1 or p_max_castle_hp > 999
    or p_enemies_defeated is null or p_enemies_defeated < 0 or p_enemies_defeated > 80
    or p_defense_summary is null or jsonb_typeof(p_defense_summary) <> 'object' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid fortress defense payload');
  end if;

  if jsonb_typeof(p_defense_summary -> 'seed') is distinct from 'number'
    or jsonb_typeof(p_defense_summary -> 'turns') is distinct from 'number'
    or jsonb_typeof(p_defense_summary -> 'castleHp') is distinct from 'number'
    or jsonb_typeof(p_defense_summary -> 'maxCastleHp') is distinct from 'number'
    or jsonb_typeof(p_defense_summary -> 'enemiesDefeated') is distinct from 'number'
    or jsonb_typeof(p_defense_summary -> 'actionLog') is distinct from 'array' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid fortress defense summary');
  end if;

  if (p_defense_summary ->> 'seed') !~ '^-?[0-9]+$'
    or (p_defense_summary ->> 'turns') !~ '^[0-9]+$'
    or (p_defense_summary ->> 'castleHp') !~ '^[0-9]+$'
    or (p_defense_summary ->> 'maxCastleHp') !~ '^[0-9]+$'
    or (p_defense_summary ->> 'enemiesDefeated') !~ '^[0-9]+$' then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid fortress defense summary');
  end if;

  if (p_defense_summary ->> 'outcome') is distinct from p_outcome
    or coalesce((p_defense_summary ->> 'seed')::bigint, -1) <> p_battle_seed
    or coalesce((p_defense_summary ->> 'turns')::int, -1) <> p_turns
    or coalesce((p_defense_summary ->> 'castleHp')::int, -1) <> p_castle_hp
    or coalesce((p_defense_summary ->> 'maxCastleHp')::int, -1) <> p_max_castle_hp
    or coalesce((p_defense_summary ->> 'enemiesDefeated')::int, -1) <> p_enemies_defeated then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid fortress defense summary');
  end if;

  if p_outcome = 'breach' and p_castle_hp > 0 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid fortress defense outcome');
  end if;

  if p_outcome <> 'breach' and p_castle_hp <= 0 then
    return jsonb_build_object('ok', false, 'code', 'invalid_request', 'reason', 'Invalid fortress defense outcome');
  end if;

  select *
    into v_rule
    from public.server_frontline_fortress_raid_profiles
    where raid_profile_id = 'default'
      and enabled = true;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Fortress raid profile is unavailable');
  end if;

  select id, account_level
    into v_profile_id, v_account_level
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(digest(
    'claimFrontlineFortressDefense:'
      || p_battle_seed::text || ':'
      || p_outcome || ':'
      || p_turns::text || ':'
      || p_castle_hp::text || ':'
      || p_max_castle_hp::text || ':'
      || p_enemies_defeated::text || ':'
      || p_defense_summary::text,
    'sha256'
  ), 'hex');

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'claimFrontlineFortressDefense'
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

  insert into public.player_frontline_fortress (profile_id)
  values (v_profile_id)
  on conflict (profile_id) do nothing;

  select *
    into v_fortress
    from public.player_frontline_fortress
    where profile_id = v_profile_id
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_state', 'reason', 'Fortress state not found');
  end if;

  if v_fortress.next_attack_at is not null and v_fortress.next_attack_at > v_now then
    return jsonb_build_object('ok', false, 'code', 'locked', 'reason', 'Fortress raid is not ready');
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
    'claimFrontlineFortressDefense',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now
  );

  v_keep := coalesce((v_fortress.buildings ->> 'keep')::int, 1);
  v_treasury := coalesce((v_fortress.buildings ->> 'treasury')::int, 1);
  v_barracks := coalesce((v_fortress.buildings ->> 'barracks')::int, 1);

  select coalesce(sum(round(public.frontline_fortress_hero_presence_score(v_profile_id, value #>> '{}') * (v_rule.hero_base_weight + v_barracks * v_rule.hero_barracks_weight)))::int, 0)
    into v_hero_power
    from jsonb_array_elements(v_fortress.garrison)
    where value <> 'null'::jsonb;

  v_defense_power := round(
    v_keep * v_rule.defense_keep_weight
    + v_treasury * v_rule.defense_treasury_weight
    + v_barracks * v_rule.defense_barracks_weight
    + coalesce(v_hero_power, 0)
    + v_fortress.integrity * v_rule.defense_integrity_weight
  )::int;
  v_raid_tempo := mod(floor(extract(epoch from v_now) / 86400)::int, v_rule.attack_tempo_days);
  v_attack_power := round(
    v_rule.attack_base
    + v_fortress.raids_resolved * v_rule.attack_per_resolved_raid
    + v_account_level * v_rule.attack_account_level_weight
    + v_keep * v_rule.attack_keep_weight
    + v_barracks * v_rule.attack_barracks_weight
    + v_raid_tempo * v_rule.attack_tempo_weight
  )::int;

  if p_outcome = 'full_repel' then
    v_integrity_delta := 0;
  elsif p_outcome = 'partial_hold' then
    v_integrity_delta := v_rule.partial_integrity_delta;
  else
    v_integrity_delta := v_rule.breach_integrity_delta;
  end if;

  v_gold_reward := round(v_rule.reward_gold_base + v_treasury * v_rule.reward_gold_treasury_weight)::int;
  v_dust_reward := round(v_rule.reward_dust_base + v_keep * v_rule.reward_dust_keep_weight)::int;
  v_gems_reward := case
    when v_treasury >= 3 then v_rule.reward_gems_treasury_level_3
    when v_treasury >= 2 then v_rule.reward_gems_treasury_level_2
    else 0
  end;

  if p_outcome = 'partial_hold' then
    v_gold_reward := floor(v_gold_reward * v_rule.partial_gold_multiplier)::int;
    v_dust_reward := floor(v_dust_reward * v_rule.partial_dust_multiplier)::int;
    v_gems_reward := case when v_gems_reward > 0 then v_rule.partial_min_gems_if_any else 0 end;
  elsif p_outcome = 'breach' then
    v_gold_reward := floor(v_gold_reward * v_rule.breach_gold_multiplier)::int;
    v_dust_reward := floor(v_dust_reward * v_rule.breach_dust_multiplier)::int;
    v_gems_reward := v_rule.breach_gems_reward;
  end if;

  v_rewards := jsonb_build_object('gold', v_gold_reward, 'dust', v_dust_reward, 'gems', v_gems_reward);
  v_report := jsonb_build_object(
    'resolvedAt', v_now,
    'outcome', p_outcome,
    'attackPower', v_attack_power,
    'defensePower', v_defense_power,
    'integrityDelta', v_integrity_delta,
    'rewards', v_rewards
  );

  v_reward_result := public.grant_reward_bundle(
    v_profile_id,
    v_operation_id,
    'frontline_fortress_defense',
    v_rewards,
    jsonb_build_object(
      'outcome', p_outcome,
      'raidProfileId', v_rule.raid_profile_id,
      'battleSeed', p_battle_seed,
      'turns', p_turns,
      'enemiesDefeated', p_enemies_defeated
    )
  );

  if coalesce((v_reward_result ->> 'ok')::boolean, false) is not true then
    return v_reward_result;
  end if;

  update public.player_frontline_fortress
    set integrity = least(100, greatest(0, integrity + v_integrity_delta)),
        last_resolved_at = v_now,
        next_attack_at = v_now + make_interval(hours => v_rule.cooldown_hours),
        raids_resolved = raids_resolved + 1
    where profile_id = v_profile_id
    returning * into v_fortress;

  v_snapshot := jsonb_set(public.frontline_fortress_snapshot(v_profile_id), '{lastReport}', v_report, true);

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'report', v_report,
      'resources', v_reward_result -> 'resources',
      'frontlineFortress', v_snapshot
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

revoke all on function public.claim_frontline_fortress_defense(text, bigint, text, int, int, int, int, jsonb) from public;
grant execute on function public.claim_frontline_fortress_defense(text, bigint, text, int, int, int, int, jsonb) to authenticated;
