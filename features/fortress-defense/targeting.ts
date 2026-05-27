import { FORTRESS_DEFENSE_BALANCE } from "./balance";
import { isFortressDefenseLane, isFortressDefenseRange } from "./grid";
import type {
  FortressDefenseActionId,
  FortressDefenseEnemy,
  FortressDefenseGuard,
  FortressDefenseLane,
  FortressDefenseRange,
  FortressDefenseState,
  FortressDefenseTarget,
  FortressDefenseTargetType,
  FortressDefenseTrap,
} from "./types";

const MAX_ACTIVE_GUARDS = FORTRESS_DEFENSE_BALANCE.guards.maxActive;
const MAX_ACTIVE_GUARDS_PER_LANE = FORTRESS_DEFENSE_BALANCE.guards.maxPerLane;
const DEPLOY_GUARD_RANGES = [1, 2] as const satisfies FortressDefenseGuard["range"][];
const SHADOW_TRAP_RANGES = [2, 3, 4] as const satisfies FortressDefenseTrap["range"][];

export function canFortressEnemyAttack(enemy: FortressDefenseEnemy) {
  return enemy.range <= enemy.attackRange;
}

export function getFortressDefensePriorityTarget(enemies: FortressDefenseEnemy[]) {
  return [...enemies].sort(compareFortressDefenseThreat)[0] ?? null;
}

export function createFortressDefenseTarget(
  type: FortressDefenseTargetType,
  value?: string,
): FortressDefenseTarget {
  if (type === "enemy" && value) return { type, enemyId: value };
  if (type === "lane" && isFortressDefenseLane(value)) return { type, lane: value };
  if (type === "slot" && value) {
    const [lane, range] = value.split(":");
    const numericRange = Number(range);
    if (isFortressDefenseLane(lane) && isFortressDefenseRange(numericRange)) return { type, lane, range: numericRange };
  }
  if (type === "castle") return { type };
  if (type === "allEnemies") return { type };
  return { type: "none" };
}

export function isFortressDefenseGuardCapacityFull(state: FortressDefenseState) {
  return state.guards.filter((guard) => guard.hp > 0).length >= MAX_ACTIVE_GUARDS;
}

export function isFortressDefenseGuardSlotAvailable(
  state: FortressDefenseState,
  lane: FortressDefenseLane,
  range: FortressDefenseRange,
) {
  if (!DEPLOY_GUARD_RANGES.includes(range as FortressDefenseGuard["range"])) return false;
  const activeGuards = state.guards.filter((guard) => guard.hp > 0);
  if (activeGuards.length >= MAX_ACTIVE_GUARDS) return false;
  if (activeGuards.some((guard) => guard.lane === lane && guard.range === range)) return false;
  return activeGuards.filter((guard) => guard.lane === lane).length < MAX_ACTIVE_GUARDS_PER_LANE;
}

export function isFortressDefenseTrapSlotAvailable(
  state: FortressDefenseState,
  lane: FortressDefenseLane,
  range: FortressDefenseRange,
) {
  if (!SHADOW_TRAP_RANGES.includes(range as FortressDefenseTrap["range"])) return false;
  return !(state.traps ?? []).some((trap) => trap.lane === lane && trap.range === range);
}

export function findFortressDefenseEnemyTarget(state: FortressDefenseState, targetId?: string) {
  if (targetId) {
    const exact = state.enemies.find((enemy) => enemy.id === targetId);
    if (exact) return exact;
  }
  return null;
}

export function findFortressDefenseBladeRushFollowUpTarget(
  enemies: FortressDefenseEnemy[],
  primaryTarget: FortressDefenseEnemy,
) {
  const sameLaneTarget = enemies
    .filter((enemy) => enemy.hp > 0 && enemy.id !== primaryTarget.id && enemy.lane === primaryTarget.lane)
    .sort(compareFortressDefenseThreat)[0];
  if (sameLaneTarget) return sameLaneTarget;
  return primaryTarget.hp > 0 ? primaryTarget : null;
}

export function isFortressDefenseActionTargetValid(
  state: FortressDefenseState,
  targetType: FortressDefenseTargetType,
  targetId?: string,
  actionId?: FortressDefenseActionId,
) {
  if (targetType === "enemy") return Boolean(targetId && state.enemies.some((enemy) => enemy.id === targetId && enemy.hp > 0));
  if (targetType === "allEnemies") return state.enemies.some((enemy) => enemy.hp > 0);
  if (actionId === "deploy_guard") {
    const target = createFortressDefenseTarget("slot", targetId);
    return target.type === "slot" && isFortressDefenseGuardSlotAvailable(state, target.lane, target.range);
  }
  if (actionId === "deploy_archer") {
    const target = createFortressDefenseTarget("slot", targetId);
    return target.type === "slot" && isFortressDefenseGuardSlotAvailable(state, target.lane, target.range);
  }
  if (actionId === "traps") {
    const target = createFortressDefenseTarget("slot", targetId);
    return target.type === "slot" && isFortressDefenseTrapSlotAvailable(state, target.lane, target.range);
  }
  return true;
}

export function compareFortressDefenseThreat(a: FortressDefenseEnemy, b: FortressDefenseEnemy) {
  const attackReady = Number(canFortressEnemyAttack(b)) - Number(canFortressEnemyAttack(a));
  if (attackReady !== 0) return attackReady;
  const rangePressure = a.range - b.range;
  if (rangePressure !== 0) return rangePressure;
  const rangedThreat = b.attackRange - a.attackRange;
  if (rangedThreat !== 0) return rangedThreat;
  return b.attackDamage - a.attackDamage;
}
