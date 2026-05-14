-- Duskkeep Fronts - resolucion autoritativa de raids de Fortress.
-- El cliente solo solicita resolver; el servidor valida timing, calcula
-- ataque/defensa/rewards, persiste estado y registra ledger de recursos.

create or replace function public.frontline_fortress_hero_presence_score(
  p_profile_id uuid,
  p_hero_id text
)
returns numeric
language plpgsql
stable
set search_path = public, pg_temp
as $$
declare
  v_base_hp int;
  v_base_atk int;
  v_base_def int;
  v_base_speed int;
  v_level int;
  v_stars int;
  v_level_bonus int;
  v_star_bonus int;
begin
  if p_hero_id = 'bran' then
    v_base_hp := 22; v_base_atk := 4; v_base_def := 3; v_base_speed := 2;
  elsif p_hero_id = 'kara' then
    v_base_hp := 16; v_base_atk := 7; v_base_def := 1; v_base_speed := 5;
  elsif p_hero_id = 'vex' then
    v_base_hp := 14; v_base_atk := 6; v_base_def := 1; v_base_speed := 4;
  elsif p_hero_id = 'mira' then
    v_base_hp := 18; v_base_atk := 4; v_base_def := 2; v_base_speed := 3;
  elsif p_hero_id = 'drak' then
    v_base_hp := 15; v_base_atk := 8; v_base_def := 1; v_base_speed := 6;
  elsif p_hero_id = 'tovi' then
    v_base_hp := 17; v_base_atk := 4; v_base_def := 2; v_base_speed := 3;
  else
    return 0;
  end if;

  select h.level, h.stars
    into v_level, v_stars
    from public.player_heroes h
    where h.profile_id = p_profile_id
      and h.hero_id = p_hero_id
      and h.unlocked = true;

  if not found then
    return 0;
  end if;

  v_level_bonus := greatest(v_level - 1, 0);
  v_star_bonus := greatest(v_stars - 1, 0);

  return
    (v_base_hp + v_level_bonus + v_star_bonus * 3)
    + (v_base_atk + floor((v_level_bonus + 1) / 3)::int + v_star_bonus) * 2
    + (v_base_def + floor(v_level_bonus / 4)::int + floor((v_star_bonus + 1) / 2)::int) * 2
    + (v_base_speed + floor(v_star_bonus / 3)::int);
end;
$$;

create or replace function public.resolve_frontline_fortress_raid(
  p_idempotency_key text
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
  v_resources public.player_resources%rowtype;
  v_fortress public.player_frontline_fortress%rowtype;
  v_keep int;
  v_treasury int;
  v_barracks int;
  v_account_level int;
  v_hero_power int := 0;
  v_defense_power int;
  v_attack_power int;
  v_raid_tempo int;
  v_outcome text;
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

  select id, account_level
    into v_profile_id, v_account_level
    from public.profiles
    where user_id = v_user_id;

  if v_profile_id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found', 'reason', 'Profile not found');
  end if;

  v_payload_hash := encode(digest('resolveFrontlineFortressRaid', 'sha256'), 'hex');

  select *
    into v_existing_operation
    from public.server_operations
    where profile_id = v_profile_id
      and idempotency_key = p_idempotency_key
    for update;

  if found then
    if v_existing_operation.operation_type <> 'resolveFrontlineFortressRaid'
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
    into v_resources
    from public.player_resources
    where profile_id = v_profile_id
    for update;

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
    'resolveFrontlineFortressRaid',
    v_payload_hash,
    'pending',
    '{}'::jsonb,
    v_now
  );

  v_keep := coalesce((v_fortress.buildings ->> 'keep')::int, 1);
  v_treasury := coalesce((v_fortress.buildings ->> 'treasury')::int, 1);
  v_barracks := coalesce((v_fortress.buildings ->> 'barracks')::int, 1);

  select coalesce(sum(round(public.frontline_fortress_hero_presence_score(v_profile_id, value #>> '{}') * (0.22 + v_barracks * 0.05)))::int, 0)
    into v_hero_power
    from jsonb_array_elements(v_fortress.garrison)
    where value <> 'null'::jsonb;

  v_defense_power := v_keep * 10 + v_treasury * 4 + v_barracks * 12 + coalesce(v_hero_power, 0) + round(v_fortress.integrity * 0.25)::int;
  v_raid_tempo := mod(floor(extract(epoch from v_now) / 86400)::int, 5);
  v_attack_power := 44 + v_fortress.raids_resolved * 7 + v_account_level * 4 + v_keep * 2 + v_barracks * 2 + v_raid_tempo * 3;

  if v_defense_power >= v_attack_power + 10 then
    v_outcome := 'full_repel';
    v_integrity_delta := 0;
  elsif v_defense_power >= v_attack_power - 12 then
    v_outcome := 'partial_hold';
    v_integrity_delta := -12;
  else
    v_outcome := 'breach';
    v_integrity_delta := -26;
  end if;

  v_gold_reward := 60 + v_treasury * 35;
  v_dust_reward := 6 + v_keep * 2;
  v_gems_reward := case when v_treasury >= 3 then 2 when v_treasury >= 2 then 1 else 0 end;

  if v_outcome = 'partial_hold' then
    v_gold_reward := floor(v_gold_reward * 0.75)::int;
    v_dust_reward := floor(v_dust_reward * 0.75)::int;
    v_gems_reward := case when v_gems_reward > 0 then 1 else 0 end;
  elsif v_outcome = 'breach' then
    v_gold_reward := floor(v_gold_reward * 0.45)::int;
    v_dust_reward := floor(v_dust_reward * 0.5)::int;
    v_gems_reward := 0;
  end if;

  v_rewards := jsonb_build_object('gold', v_gold_reward, 'dust', v_dust_reward, 'gems', v_gems_reward);
  v_report := jsonb_build_object(
    'resolvedAt', v_now,
    'outcome', v_outcome,
    'attackPower', v_attack_power,
    'defensePower', v_defense_power,
    'integrityDelta', v_integrity_delta,
    'rewards', v_rewards
  );

  update public.player_resources
    set gold = gold + v_gold_reward,
        dust = dust + v_dust_reward,
        gems = gems + v_gems_reward
    where profile_id = v_profile_id
    returning * into v_resources;

  update public.player_frontline_fortress
    set integrity = least(100, greatest(0, integrity + v_integrity_delta)),
        last_resolved_at = v_now,
        next_attack_at = v_now + interval '8 hours',
        raids_resolved = raids_resolved + 1
    where profile_id = v_profile_id
    returning * into v_fortress;

  if v_gold_reward > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'frontline_fortress_raid', 'gold', v_gold_reward, v_resources.gold, jsonb_build_object('outcome', v_outcome));
  end if;
  if v_dust_reward > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'frontline_fortress_raid', 'dust', v_dust_reward, v_resources.dust, jsonb_build_object('outcome', v_outcome));
  end if;
  if v_gems_reward > 0 then
    insert into public.resource_ledger (profile_id, operation_id, source, resource, delta, balance_after, metadata)
    values (v_profile_id, v_operation_id, 'frontline_fortress_raid', 'gems', v_gems_reward, v_resources.gems, jsonb_build_object('outcome', v_outcome));
  end if;

  v_snapshot := jsonb_set(public.frontline_fortress_snapshot(v_profile_id), '{lastReport}', v_report, true);

  v_result := jsonb_build_object(
    'ok', true,
    'authoritative', true,
    'result', jsonb_build_object(
      'report', v_report,
      'resources', jsonb_build_object(
        'gold', v_resources.gold,
        'dust', v_resources.dust,
        'gems', v_resources.gems,
        'arenaTickets', v_resources.arena_tickets,
        'adventureKeys', v_resources.adventure_keys
      ),
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

revoke all on function public.frontline_fortress_hero_presence_score(uuid, text) from public;
grant execute on function public.frontline_fortress_hero_presence_score(uuid, text) to authenticated;

revoke all on function public.resolve_frontline_fortress_raid(text) from public;
grant execute on function public.resolve_frontline_fortress_raid(text) to authenticated;
