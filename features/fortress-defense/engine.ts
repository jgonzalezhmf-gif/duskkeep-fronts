import {
  frontlineFortressAttackPower,
  frontlineFortressDefenseRating,
  frontlineFortressRewardsForOutcome,
} from "@/features/frontline/fortress";
import type { FrontlineHeroProfileMap } from "@/features/frontline/heroProfile";
import type { FrontlineFortressOutcome, FrontlineFortressReport, FrontlineFortressState } from "@/lib/types";
import {
  consumeFortressDefenseActionCharge,
  createInitialActionStates,
  getFortressDefenseActionState,
  markFortressDefenseActionUsed,
  tickFortressDefenseActionCooldowns,
} from "./actionRuntime";
import { FORTRESS_DEFENSE_BALANCE } from "./balance";
import { createFortressWaveEnemies, FORTRESS_DEFENSE_ACTIONS } from "./catalog";
import { effectiveFortressDefenseDamage } from "./combatMath";
import {
  createFortressDefenseTarget,
  findFortressDefenseBladeRushFollowUpTarget,
  findFortressDefenseEnemyTarget,
  isFortressDefenseActionTargetValid,
  isFortressDefenseGuardCapacityFull,
  isFortressDefenseGuardSlotAvailable,
  isFortressDefenseTrapSlotAvailable,
} from "./targeting";
import {
  advanceFortressDefenseWaveIfNeeded,
  applyFortressDefenseEnemyPhase,
  applyFortressDefenseGuardCounterattacks,
  clearFortressDefenseDefeated,
} from "./turnResolution";
import type {
  FortressDefenseActionDef,
  FortressDefenseActionDisabledReason,
  FortressDefenseActionId,
  FortressDefenseClaimPayload,
  FortressDefenseEnemy,
  FortressDefenseGuard,
  FortressDefenseTrap,
  FortressDefenseState,
} from "./types";

export type {
  FortressDefenseActionDef,
  FortressDefenseActionId,
  FortressDefenseActionDisabledReason,
  FortressDefenseActionRuntimeState,
  FortressDefenseActionStateMap,
  FortressDefenseClaimPayload,
  FortressDefenseEnemy,
  FortressDefenseGuard,
  FortressDefenseLane,
  FortressDefenseLogEntry,
  FortressDefenseRange,
  FortressDefenseTarget,
  FortressDefenseTargetType,
  FortressDefenseTrap,
  FortressDefenseState,
  FortressDefenseStatus,
} from "./types";

export { getFortressDefenseActionState } from "./actionRuntime";
export {
  canFortressEnemyAttack,
  createFortressDefenseTarget,
  getFortressDefensePriorityTarget,
  isFortressDefenseGuardSlotAvailable,
  isFortressDefenseTrapSlotAvailable,
} from "./targeting";

const MAX_WAVES = FORTRESS_DEFENSE_BALANCE.maxWaves;
export const FORTRESS_DEFENSE_MIN_RANGE = FORTRESS_DEFENSE_BALANCE.range.min;
export const FORTRESS_DEFENSE_MAX_RANGE = FORTRESS_DEFENSE_BALANCE.range.max;

const CASTLE_SHOT_DAMAGE = FORTRESS_DEFENSE_BALANCE.actions.castleShot.damage;
const CASTLE_SHOT_CLOSE_RANGE_BONUS = FORTRESS_DEFENSE_BALANCE.actions.castleShot.closeRangeBonus;
const BLADE_RUSH_DAMAGE = FORTRESS_DEFENSE_BALANCE.actions.bladeRush.damage;
const BLADE_RUSH_CLOSE_RANGE_BONUS = FORTRESS_DEFENSE_BALANCE.actions.bladeRush.closeRangeBonus;
const BLADE_RUSH_FOLLOW_UP_DAMAGE = FORTRESS_DEFENSE_BALANCE.actions.bladeRush.followUpDamage;
const VOLLEY_DAMAGE = FORTRESS_DEFENSE_BALANCE.actions.volley.damage;
const BULWARK_SHIELD = FORTRESS_DEFENSE_BALANCE.actions.bulwark.castleShield;
const BULWARK_GUARD_SHIELD = FORTRESS_DEFENSE_BALANCE.actions.bulwark.guardShield;
const ARCANE_BARRAGE_DAMAGE = FORTRESS_DEFENSE_BALANCE.actions.arcaneBarrage.damage;
const TRAP_DAMAGE = FORTRESS_DEFENSE_BALANCE.actions.trap.damage;
const TRAP_SLOW = FORTRESS_DEFENSE_BALANCE.actions.trap.slow;
const TRAP_STUN_TURNS = FORTRESS_DEFENSE_BALANCE.actions.trap.stunTurns;
const MEND_HEAL = FORTRESS_DEFENSE_BALANCE.actions.mend.castleHeal;
const MEND_GUARD_HEAL = FORTRESS_DEFENSE_BALANCE.actions.mend.guardHeal;
const WAR_CHANT_MORALE = FORTRESS_DEFENSE_BALANCE.actions.warChant.morale;
const WAR_CHANT_INSPIRED_TURNS = FORTRESS_DEFENSE_BALANCE.actions.warChant.inspiredTurns;
const WAR_CHANT_DAMAGE_BONUS = FORTRESS_DEFENSE_BALANCE.actions.warChant.damageBonus;
const DEPLOY_GUARD_HP = FORTRESS_DEFENSE_BALANCE.actions.deployGuard.hp;
const DEPLOY_ARCHER_HP = FORTRESS_DEFENSE_BALANCE.actions.deployArcher.hp;

const HERO_FORTRESS_ACTIONS: Partial<Record<string, FortressDefenseActionId>> = {
  bran: "bulwark",
  kara: "blade_rush",
  vex: "volley",
  mira: "mend",
  drak: "traps",
  tovi: "war_chant",
};

export function createFortressDefenseState({
  fortress,
  accountLevel,
  heroProfiles,
  now = new Date(),
}: {
  fortress: FrontlineFortressState;
  accountLevel: number;
  heroProfiles?: FrontlineHeroProfileMap;
  now?: Date;
}): FortressDefenseState {
  const seed = createFortressDefenseSeed(fortress, now);
  const maxCastleHp = getFortressDefenseMaxCastleHp(fortress);
  const raidPressure = Math.max(1, accountLevel + fortress.raidsResolved + fortress.buildings.barracks);
  const actionIds = getAvailableActionIds(fortress, heroProfiles);
  return {
    schemaVersion: 1,
    seed,
    status: "active",
    turn: 0,
    wave: 1,
    maxWaves: MAX_WAVES,
    castleHp: Math.max(20, Math.round(maxCastleHp * Math.max(0.35, fortress.integrity / 100))),
    maxCastleHp,
    shield: 0,
    morale: 0,
    raidPressure,
    enemies: createFortressWaveEnemies(1, seed, raidPressure),
    guards: [],
    traps: [],
    defeated: 0,
    actionIds,
    actionStates: createInitialActionStates(actionIds),
    log: [
      {
        turn: 0,
        title: "The horns sound",
        detail: "Attackers are advancing toward the lower gate.",
        tone: "system",
      },
    ],
  };
}

export function getFortressDefenseActions(state: FortressDefenseState): FortressDefenseActionDef[] {
  return state.actionIds.map((id) => {
    const config = FORTRESS_DEFENSE_ACTIONS[id];
    const runtime = getFortressDefenseActionState(state, id);
    return {
      ...config,
      currentCooldown: runtime.currentCooldown,
      charges: runtime.charges,
      maxCharges: runtime.maxCharges,
      disabledReason: getFortressDefenseActionDisabledReason(state, id),
    };
  });
}

export function getFortressDefenseActionDisabledReason(
  state: FortressDefenseState,
  actionId: FortressDefenseActionId,
): FortressDefenseActionDisabledReason | undefined {
  const config = FORTRESS_DEFENSE_ACTIONS[actionId];
  const runtime = getFortressDefenseActionState(state, actionId);
  if (runtime.currentCooldown > 0) return "cooldown";
  if (runtime.maxCharges !== undefined && (runtime.charges ?? 0) <= 0) return "charges";
  if ((actionId === "deploy_guard" || actionId === "deploy_archer") && isFortressDefenseGuardCapacityFull(state)) return "maxGuards";
  if ((config.targetType === "enemy" || config.targetType === "allEnemies") && !state.enemies.some((enemy) => enemy.hp > 0)) return "noTargets";
  if (actionId === "mend" && state.castleHp >= state.maxCastleHp && !state.guards.some((guard) => guard.hp > 0 && guard.hp < guard.maxHp)) return "fullHp";
  return undefined;
}

export function resolveFortressDefenseTurn(
  state: FortressDefenseState,
  actionId: FortressDefenseActionId,
  targetId?: string,
): FortressDefenseState {
  if (state.status !== "active") return state;
  if (!state.actionIds.includes(actionId)) actionId = "castle_shot";
  const action = FORTRESS_DEFENSE_ACTIONS[actionId];
  if (getFortressDefenseActionDisabledReason(state, actionId)) return state;
  if (!isFortressDefenseActionTargetValid(state, action.targetType, targetId, actionId)) return state;

  let next: FortressDefenseState = {
    ...state,
    turn: state.turn + 1,
    shield: state.shield,
    log: state.log.slice(-5),
    enemies: state.enemies.map((enemy) => ({ ...enemy })),
    guards: state.guards.map((guard) => ({ ...guard })),
    traps: (state.traps ?? []).map((trap) => ({ ...trap })),
    actionStates: tickFortressDefenseActionCooldowns(state),
  };

  next = applyPlayerAction(next, actionId, targetId);
  next = markFortressDefenseActionUsed(next, actionId);
  next = clearFortressDefenseDefeated(next);
  next = applyFortressDefenseGuardCounterattacks(next);
  next = clearFortressDefenseDefeated(next);
  next = advanceFortressDefenseWaveIfNeeded(next);
  if (next.status !== "active") return next;
  if (next.wave !== state.wave || next.enemies.length === 0) return next;

  next = applyFortressDefenseEnemyPhase(next);
  next = clearFortressDefenseDefeated(next);
  next = advanceFortressDefenseWaveIfNeeded(next);
  return next;
}

export function previewFortressDefenseActionDamage(
  state: FortressDefenseState,
  actionId: FortressDefenseActionId,
  enemy: FortressDefenseEnemy,
) {
  const moraleBonus = Math.min(10, state.morale);
  if (actionId === "castle_shot") {
    const closeRangeBonus = enemy.range <= 2 ? CASTLE_SHOT_CLOSE_RANGE_BONUS : 0;
    return effectiveFortressDefenseDamage(CASTLE_SHOT_DAMAGE + closeRangeBonus + moraleBonus, enemy.armor);
  }
  if (actionId === "blade_rush") {
    const closeRangeBonus = enemy.range <= 2 ? BLADE_RUSH_CLOSE_RANGE_BONUS : 0;
    return effectiveFortressDefenseDamage(BLADE_RUSH_DAMAGE + closeRangeBonus + moraleBonus, enemy.armor);
  }
  if (actionId === "volley") return effectiveFortressDefenseDamage(VOLLEY_DAMAGE + Math.floor(moraleBonus / 2), enemy.armor);
  if (actionId === "arcane_barrage" && enemy.range <= 3) return effectiveFortressDefenseDamage(ARCANE_BARRAGE_DAMAGE + moraleBonus, Math.max(0, enemy.armor - 1));
  if (actionId === "traps") return effectiveFortressDefenseDamage(TRAP_DAMAGE, enemy.armor);
  if (actionId === "deploy_guard" || actionId === "deploy_archer") return 0;
  return 0;
}

export function previewFortressDefenseBladeRushFollowUpDamage(
  state: FortressDefenseState,
  enemy: FortressDefenseEnemy,
) {
  const moraleBonus = Math.floor(Math.min(10, state.morale) / 2);
  return effectiveFortressDefenseDamage(BLADE_RUSH_FOLLOW_UP_DAMAGE + moraleBonus, Math.max(0, enemy.armor - 1));
}

export function previewFortressDefenseActionShield(state: FortressDefenseState) {
  return BULWARK_SHIELD + Math.floor(Math.min(10, state.morale) / 2);
}

export function previewFortressDefenseGuardShield(state: FortressDefenseState) {
  return BULWARK_GUARD_SHIELD + Math.floor(Math.min(10, state.morale) / 4);
}

export function previewFortressDefenseActionHeal(state: FortressDefenseState) {
  const heal = MEND_HEAL + Math.floor(Math.min(10, state.morale) / 2);
  return Math.max(0, Math.min(state.maxCastleHp, state.castleHp + heal) - state.castleHp);
}

export function getFortressDefenseOutcome(state: FortressDefenseState): FrontlineFortressOutcome {
  if (state.status === "breach" || state.castleHp <= 0) return "breach";
  const hpRatio = state.castleHp / Math.max(1, state.maxCastleHp);
  return hpRatio >= 0.68 ? "full_repel" : "partial_hold";
}

export function createFortressDefenseClaimPayload(
  state: FortressDefenseState,
): FortressDefenseClaimPayload {
  const outcome = getFortressDefenseOutcome(state);
  const actionLog = state.log
    .filter((entry) => entry.tone === "ally")
    .slice(-40)
    .flatMap((entry) => {
      const action = parseActionFromLog(entry.title);
      return action ? [{
        turn: entry.turn,
        action,
        castleHp: state.castleHp,
        enemyCount: state.enemies.length,
      }] : [];
    });

  return {
    battleSeed: state.seed,
    outcome,
    turns: state.turn,
    castleHp: Math.max(0, Math.round(state.castleHp)),
    maxCastleHp: state.maxCastleHp,
    enemiesDefeated: state.defeated,
    defenseSummary: {
      schemaVersion: 1,
      seed: state.seed,
      turns: state.turn,
      outcome,
      castleHp: Math.max(0, Math.round(state.castleHp)),
      maxCastleHp: state.maxCastleHp,
      enemiesDefeated: state.defeated,
      wavesCleared: state.status === "victory" ? state.maxWaves : Math.max(0, state.wave - 1),
      actionLog,
    },
  };
}

export function createFrontlineFortressDefenseReport({
  fortress,
  accountLevel,
  heroProfiles,
  defenseState,
  now = new Date(),
}: {
  fortress: FrontlineFortressState;
  accountLevel: number;
  heroProfiles?: FrontlineHeroProfileMap;
  defenseState: FortressDefenseState;
  now?: Date;
}): FrontlineFortressReport {
  const outcome = getFortressDefenseOutcome(defenseState);
  return {
    resolvedAt: now.toISOString(),
    outcome,
    attackPower: frontlineFortressAttackPower(fortress, accountLevel, now),
    defensePower: frontlineFortressDefenseRating(fortress, heroProfiles),
    integrityDelta: getFortressDefenseIntegrityDelta(outcome, defenseState.castleHp, defenseState.maxCastleHp),
    rewards: frontlineFortressRewardsForOutcome(fortress, outcome),
  };
}

export function createFrontlineFortressDefenseReportFromPayload({
  fortress,
  accountLevel,
  heroProfiles,
  payload,
  now = new Date(),
}: {
  fortress: FrontlineFortressState;
  accountLevel: number;
  heroProfiles?: FrontlineHeroProfileMap;
  payload: FortressDefenseClaimPayload;
  now?: Date;
}): FrontlineFortressReport {
  return {
    resolvedAt: now.toISOString(),
    outcome: payload.outcome,
    attackPower: frontlineFortressAttackPower(fortress, accountLevel, now),
    defensePower: frontlineFortressDefenseRating(fortress, heroProfiles),
    integrityDelta: getFortressDefenseIntegrityDelta(payload.outcome, payload.castleHp, payload.maxCastleHp),
    rewards: frontlineFortressRewardsForOutcome(fortress, payload.outcome),
  };
}

function getFortressDefenseMaxCastleHp(fortress: FrontlineFortressState) {
  return 76 + fortress.buildings.keep * 18 + fortress.buildings.barracks * 6;
}

function createFortressDefenseSeed(fortress: FrontlineFortressState, now: Date) {
  const scheduled = fortress.nextAttackAt ? Date.parse(fortress.nextAttackAt) : NaN;
  const base = Number.isFinite(scheduled) ? scheduled : now.getTime();
  return Math.abs(
    Math.floor(base / 1000) +
      fortress.raidsResolved * 7919 +
      fortress.buildings.keep * 101 +
      fortress.buildings.treasury * 211 +
      fortress.buildings.barracks * 307,
  );
}

function getAvailableActionIds(
  fortress: FrontlineFortressState,
  heroProfiles?: FrontlineHeroProfileMap,
): FortressDefenseActionId[] {
  const ids = new Set<FortressDefenseActionId>(["castle_shot", "deploy_guard", "deploy_archer"]);
  fortress.garrison.forEach((heroId) => {
    if (!heroId) return;
    const mappedAction = HERO_FORTRESS_ACTIONS[heroId] ?? actionForHeroProfile(heroProfiles?.[heroId]);
    if (mappedAction) ids.add(mappedAction);
  });
  return [...ids];
}

function actionForHeroProfile(profile: FrontlineHeroProfileMap[string] | undefined): FortressDefenseActionId | null {
  const role = profile?.role.toLowerCase() ?? "";
  const trait = profile?.trait.type;
  if (trait === "bulwark") return "bulwark";
  if (trait === "flurry") return "blade_rush";
  if (trait === "breach") return "volley";
  if (trait === "mend") return "mend";
  if (trait === "ambush") return "traps";
  if (trait === "chant") return "war_chant";
  if (role.includes("tank")) return "bulwark";
  if (role.includes("striker")) return "blade_rush";
  if (role.includes("archer")) return "volley";
  if (role.includes("healer")) return "mend";
  if (role.includes("shadow") || role.includes("finisher")) return "traps";
  if (role.includes("chanter")) return "war_chant";
  if (role.includes("mage") || role.includes("arcane")) return "arcane_barrage";
  return null;
}

function applyPlayerAction(
  state: FortressDefenseState,
  actionId: FortressDefenseActionId,
  targetId?: string,
): FortressDefenseState {
  if (actionId === "castle_shot") {
    const target = findFortressDefenseEnemyTarget(state, targetId);
    if (!target) return state;
    const damage = previewFortressDefenseActionDamage(state, actionId, target);
    target.hp -= damage;
    state.log.push({
      turn: state.turn,
      title: "Castle shot",
      detail: `The keep battery hits ${target.name} for ${damage}.`,
      tone: "ally",
    });
    return state;
  }

  if (actionId === "deploy_guard" || actionId === "deploy_archer") {
    const target = createFortressDefenseTarget("slot", targetId);
    if (target.type !== "slot" || !isFortressDefenseGuardSlotAvailable(state, target.lane, target.range)) return state;
    const isArcher = actionId === "deploy_archer";
    const guard: FortressDefenseGuard = {
      id: `${isArcher ? "archer" : "guard"}-${state.turn}-${target.lane}-${target.range}`,
      name: isArcher ? "Garrison archer" : "Garrison guard",
      unitType: isArcher ? "archer" : "guard",
      maxHp: isArcher ? DEPLOY_ARCHER_HP : DEPLOY_GUARD_HP,
      hp: isArcher ? DEPLOY_ARCHER_HP : DEPLOY_GUARD_HP,
      shield: 0,
      inspiredTurns: 0,
      lane: target.lane,
      range: target.range as FortressDefenseGuard["range"],
      deployedTurn: state.turn,
    };
    state.guards.push(guard);
    consumeFortressDefenseActionCharge(state, actionId);
    state.log.push({
      turn: state.turn,
      title: isArcher ? "Deploy archer" : "Deploy guard",
      detail: `${isArcher ? "Garrison archer" : "Garrison guard"} deploys to ${target.lane} range ${target.range}.`,
      tone: "ally",
    });
    return state;
  }

  if (actionId === "blade_rush") {
    const target = findFortressDefenseEnemyTarget(state, targetId);
    if (!target) return state;
    const damage = previewFortressDefenseActionDamage(state, actionId, target);
    target.hp -= damage;
    const followUpTarget = findFortressDefenseBladeRushFollowUpTarget(state.enemies, target);
    const followUpDamage = followUpTarget ? previewFortressDefenseBladeRushFollowUpDamage(state, followUpTarget) : 0;
    if (followUpTarget) followUpTarget.hp -= followUpDamage;
    state.log.push({
      turn: state.turn,
      title: "Blade rush",
      detail: followUpTarget
        ? followUpTarget.id === target.id
          ? `Kara rushes ${target.name} for ${damage} and follows through for ${followUpDamage}.`
          : `Kara rushes ${target.name} for ${damage}, then cuts ${followUpTarget.name} for ${followUpDamage}.`
        : `Kara rushes ${target.name} for ${damage}.`,
      tone: "ally",
    });
    return state;
  }

  if (actionId === "bulwark") {
    const shield = previewFortressDefenseActionShield(state);
    const guardShield = previewFortressDefenseGuardShield(state);
    state.shield += shield;
    state.guards.forEach((guard) => {
      if (guard.hp > 0) guard.shield = Math.max(0, guard.shield ?? 0) + guardShield;
    });
    state.log.push({
      turn: state.turn,
      title: "Bulwark",
      detail: `The garrison raises ${shield} castle shield and ${guardShield} defender shield.`,
      tone: "ally",
    });
    return state;
  }

  if (actionId === "volley") {
    state.enemies.forEach((enemy) => {
      enemy.hp -= previewFortressDefenseActionDamage(state, actionId, enemy);
    });
    state.log.push({
      turn: state.turn,
      title: "Arrow volley",
      detail: "Arrows rake the whole approach.",
      tone: "ally",
    });
    return state;
  }

  if (actionId === "arcane_barrage") {
    state.enemies
      .filter((enemy) => enemy.range <= 3)
      .forEach((enemy) => {
        enemy.hp -= previewFortressDefenseActionDamage(state, actionId, enemy);
      });
    state.log.push({
      turn: state.turn,
      title: "Arcane barrage",
      detail: "Unstable light tears through the clustered line.",
      tone: "ally",
    });
    return state;
  }

  if (actionId === "traps") {
    const target = createFortressDefenseTarget("slot", targetId);
    if (target.type !== "slot" || !isFortressDefenseTrapSlotAvailable(state, target.lane, target.range)) return state;
    const trap: FortressDefenseTrap = {
      id: `trap-${state.turn}-${target.lane}-${target.range}`,
      name: "Shadow trap",
      lane: target.lane,
      range: target.range as FortressDefenseTrap["range"],
      damage: TRAP_DAMAGE,
      slow: TRAP_SLOW,
      stun: TRAP_STUN_TURNS,
      deployedTurn: state.turn,
    };
    state.traps.push(trap);
    state.log.push({
      turn: state.turn,
      title: "Shadow trap",
      detail: `Shadow trap placed at ${target.lane} range ${target.range}.`,
      tone: "ally",
    });
    return state;
  }

  if (actionId === "mend") {
    const heal = previewFortressDefenseActionHeal(state);
    const guardHeal = MEND_GUARD_HEAL + Math.floor(Math.min(10, state.morale) / 2);
    state.castleHp = Math.min(state.maxCastleHp, state.castleHp + heal);
    const healedGuards = state.guards.filter((guard) => guard.hp > 0 && guard.hp < guard.maxHp);
    healedGuards.forEach((guard) => {
      guard.hp = Math.min(guard.maxHp, guard.hp + guardHeal);
    });
    consumeFortressDefenseActionCharge(state, actionId);
    state.log.push({
      turn: state.turn,
      title: "Mend walls",
      detail: healedGuards.length > 0
        ? `Field rites restore ${heal} castle life and ${guardHeal} to deployed defenders.`
        : `Field rites restore ${heal} castle life.`,
      tone: "ally",
    });
    return state;
  }

  state.morale = Math.min(18, state.morale + WAR_CHANT_MORALE);
  state.guards.forEach((guard) => {
    if (guard.hp > 0) guard.inspiredTurns = Math.max(guard.inspiredTurns ?? 0, WAR_CHANT_INSPIRED_TURNS);
  });
  state.log.push({
    turn: state.turn,
    title: "War chant",
    detail: `The wall answers with a grim cadence. Deployed defenders gain +${WAR_CHANT_DAMAGE_BONUS} strike for ${WAR_CHANT_INSPIRED_TURNS} turns.`,
    tone: "ally",
  });
  return state;
}

function getFortressDefenseIntegrityDelta(
  outcome: FrontlineFortressOutcome,
  castleHp: number,
  maxCastleHp: number,
) {
  if (outcome === "full_repel") return 0;
  if (outcome === "breach") return -26;
  const lostRatio = 1 - castleHp / Math.max(1, maxCastleHp);
  return -Math.max(8, Math.min(18, Math.round(lostRatio * 24)));
}

function parseActionFromLog(title: string): Exclude<FortressDefenseActionId, "deploy_guard" | "deploy_archer" | "blade_rush"> | null {
  if (title === "Deploy guard" || title === "Deploy archer" || title === "Blade rush" || title === "Guard strike" || title === "Guard block" || title === "Guard down" || title === "Shadow trap sprung") return null;
  const match = Object.values(FORTRESS_DEFENSE_ACTIONS).find((action) => action.label === title);
  if (!match || match.id === "deploy_guard" || match.id === "deploy_archer" || match.id === "blade_rush") return null;
  return match.id;
}
