import type { MutableRefObject } from "react";
import {
  canFortressEnemyAttack,
  previewFortressDefenseActionDamage,
  previewFortressDefenseActionHeal,
  previewFortressDefenseActionShield,
  previewFortressDefenseGuardShield,
  type FortressDefenseActionId,
  type FortressDefenseEnemy,
  type FortressDefenseGuard,
  type FortressDefenseLane,
  type FortressDefenseLogEntry,
  type FortressDefenseRange,
  type FortressDefenseState,
  type FortressDefenseTrap,
} from "@/features/fortress-defense/engine";

export type DefenseVisualPhase = "idle" | "resolvingOrder" | "enemyAdvancing" | "enemyAttacking" | "castleHit" | "waveIncoming";

export type EnemyVisualAction = {
  enemyId: string;
  type: "advance" | "attack";
};

export type EnemyVisualOrigin = {
  lane: FortressDefenseLane;
  range: FortressDefenseRange;
};

export type TurnVisualEvent = {
  key: string;
  actionId: FortressDefenseActionId | null;
  actionLog: FortressDefenseLogEntry | null;
  enemyLog: FortressDefenseLogEntry | null;
  damagedEnemyIds: string[];
  enemyActions: EnemyVisualAction[];
  enemyOrigins: Record<string, EnemyVisualOrigin>;
  defeatedEnemyIds: string[];
  advancedEnemyIds: string[];
  attackingEnemyIds: string[];
  spawnedEnemyIds: string[];
  departedEnemies: FortressDefenseEnemy[];
  deployedGuardIds: string[];
  guardStrikeSlots: string[];
  damagedGuardIds: string[];
  defeatedGuardIds: string[];
  departedGuards: FortressDefenseGuard[];
  deployedTrapIds: string[];
  triggeredTrapIds: string[];
  departedTraps: FortressDefenseTrap[];
  targetSlot: EnemyVisualOrigin | null;
  guardDamageById: Record<string, number>;
  guardHealById: Record<string, number>;
  guardShieldGainById: Record<string, number>;
  damageByEnemyId: Record<string, number>;
  castleDamage: number;
  shieldAbsorbed: number;
  heal: number;
  shieldGain: number;
  waveIncoming: boolean;
  wave: number;
  terminalStatus: FortressDefenseState["status"] | null;
};

export function createOpeningVisualEvent(state: FortressDefenseState): TurnVisualEvent {
  const traps = state.traps ?? [];
  return {
    key: "opening",
    actionId: null,
    actionLog: null,
    enemyLog: null,
    damagedEnemyIds: [],
    enemyActions: [],
    enemyOrigins: {},
    defeatedEnemyIds: [],
    advancedEnemyIds: [],
    attackingEnemyIds: [],
    spawnedEnemyIds: state.enemies.map((enemy) => enemy.id),
    departedEnemies: [],
    deployedGuardIds: state.guards.map((guard) => guard.id),
    guardStrikeSlots: [],
    damagedGuardIds: [],
    defeatedGuardIds: [],
    departedGuards: [],
    deployedTrapIds: traps.map((trap) => trap.id),
    triggeredTrapIds: [],
    departedTraps: [],
    targetSlot: null,
    guardDamageById: {},
    guardHealById: {},
    guardShieldGainById: {},
    damageByEnemyId: {},
    castleDamage: 0,
    shieldAbsorbed: 0,
    heal: 0,
    shieldGain: 0,
    waveIncoming: false,
    wave: state.wave,
    terminalStatus: null,
  };
}

export function createPendingVisualEvent(state: FortressDefenseState, actionId: FortressDefenseActionId, targetId?: string): TurnVisualEvent {
  const targetIds = pendingTargetIds(state, actionId, targetId);
  const pendingHeal = actionId === "mend" ? previewFortressDefenseActionHeal(state) : 0;
  const pendingShieldGain = actionId === "bulwark" ? previewFortressDefenseActionShield(state) : 0;
  const pendingGuardShieldGain = actionId === "bulwark"
    ? Object.fromEntries(state.guards.filter((guard) => guard.hp > 0).map((guard) => [guard.id, previewFortressDefenseGuardShield(state)]))
    : {};
  return {
    ...createOpeningVisualEvent(state),
    key: `pending-${state.turn + 1}-${actionId}`,
    actionId,
    damagedEnemyIds: actionTargetsEnemies(actionId) ? targetIds : [],
    targetSlot: targetSlotFromId(targetId),
    heal: pendingHeal,
    shieldGain: pendingShieldGain,
    guardShieldGainById: pendingGuardShieldGain,
  };
}

export function describeTurnVisualEvent(previous: FortressDefenseState, next: FortressDefenseState, pendingActionId: FortressDefenseActionId | null, pendingTargetId?: string): TurnVisualEvent {
  const actionLog = findLatestTurnLog(next, next.turn, "ally");
  const enemyLog = findLatestTurnLog(next, next.turn, "enemy");
  const actionId = pendingActionId ?? actionIdFromLogTitle(actionLog?.title ?? null);
  const previousEnemiesById = new Map(previous.enemies.map((enemy) => [enemy.id, enemy]));
  const nextEnemiesById = new Map(next.enemies.map((enemy) => [enemy.id, enemy]));
  const previousGuardsById = new Map(previous.guards.map((guard) => [guard.id, guard]));
  const nextGuardsById = new Map(next.guards.map((guard) => [guard.id, guard]));
  const previousTraps = previous.traps ?? [];
  const nextTraps = next.traps ?? [];
  const previousTrapsById = new Map(previousTraps.map((trap) => [trap.id, trap]));
  const nextTrapsById = new Map(nextTraps.map((trap) => [trap.id, trap]));
  const defeatedCount = Math.max(0, next.defeated - previous.defeated);
  const candidatesGone = previous.enemies.filter((enemy) => !nextEnemiesById.has(enemy.id));
  const defeatedEnemies = candidatesGone.slice(0, defeatedCount);
  const attackingEnemies = enemyLog?.title === "Gate impact"
    ? uniqueEnemies([
        ...next.enemies.filter((enemy) => {
          const before = previousEnemiesById.get(enemy.id);
          return before ? canFortressEnemyAttack(before) && before.range === enemy.range : false;
        }),
        ...candidatesGone.filter((enemy) => !defeatedEnemies.some((defeated) => defeated.id === enemy.id) && canFortressEnemyAttack(enemy)),
      ])
    : [];
  const departedEnemies = uniqueEnemies([...defeatedEnemies, ...attackingEnemies]);
  const defeatedEnemyIds = defeatedEnemies.map((enemy) => enemy.id);
  const attackingEnemyIds = attackingEnemies.map((enemy) => enemy.id);
  const damageByEnemyId: Record<string, number> = {};
  const guardDamageById: Record<string, number> = {};
  const guardHealById: Record<string, number> = {};
  const guardShieldGainById: Record<string, number> = {};

  for (const previousEnemy of previous.enemies) {
    const nextEnemy = nextEnemiesById.get(previousEnemy.id);
    if (nextEnemy && previousEnemy.hp > nextEnemy.hp) {
      damageByEnemyId[previousEnemy.id] = previousEnemy.hp - nextEnemy.hp;
      continue;
    }
    if (defeatedEnemyIds.includes(previousEnemy.id)) {
      damageByEnemyId[previousEnemy.id] = estimateActionDamage(previous, previousEnemy, actionId);
    }
  }

  const damagedEnemyIds = Object.keys(damageByEnemyId);
  for (const previousGuard of previous.guards) {
    const nextGuard = nextGuardsById.get(previousGuard.id);
    if (nextGuard && previousGuard.hp < nextGuard.hp) {
      guardHealById[previousGuard.id] = nextGuard.hp - previousGuard.hp;
    }
    if (actionId === "bulwark" && previousGuard.hp > 0) {
      guardShieldGainById[previousGuard.id] = previewFortressDefenseGuardShield(previous);
    } else if (nextGuard && (previousGuard.shield ?? 0) < (nextGuard.shield ?? 0)) {
      guardShieldGainById[previousGuard.id] = (nextGuard.shield ?? 0) - (previousGuard.shield ?? 0);
    }
    if (nextGuard && previousGuard.hp > nextGuard.hp) {
      guardDamageById[previousGuard.id] = previousGuard.hp - nextGuard.hp;
      continue;
    }
    if (!nextGuard) guardDamageById[previousGuard.id] = previousGuard.hp;
  }

  const damagedGuardIds = Object.keys(guardDamageById);
  const defeatedGuards = previous.guards.filter((guard) => !nextGuardsById.has(guard.id));
  const defeatedGuardIds = defeatedGuards.map((guard) => guard.id);
  const deployedTrapIds = nextTraps.filter((trap) => !previousTrapsById.has(trap.id)).map((trap) => trap.id);
  const departedTraps = previousTraps.filter((trap) => !nextTrapsById.has(trap.id));
  const triggeredTrapIds = departedTraps.map((trap) => trap.id);
  const enemyOrigins: Record<string, EnemyVisualOrigin> = Object.fromEntries(
    previous.enemies.map((enemy) => [enemy.id, { lane: enemy.lane, range: enemy.range }]),
  );
  const advancedEnemyIds = next.enemies.filter((enemy) => {
    const before = previousEnemiesById.get(enemy.id);
    return before ? enemy.range < before.range : false;
  }).map((enemy) => enemy.id);
  const enemyActions: EnemyVisualAction[] = [
    ...advancedEnemyIds.map((enemyId) => ({ enemyId, type: "advance" as const })),
    ...attackingEnemyIds.map((enemyId) => ({ enemyId, type: "attack" as const })),
  ];
  const spawnedEnemyIds = next.enemies.filter((enemy) => !previousEnemiesById.has(enemy.id)).map((enemy) => enemy.id);
  const deployedGuardIds = next.guards.filter((guard) => !previousGuardsById.has(guard.id)).map((guard) => guard.id);
  const guardStrikeSlots = guardStrikeSlotsFromLogs(next.log, next.turn);
  const shieldAbsorbed = parseAbsorbed(enemyLog?.detail ?? "");
  const castleDamage = Math.max(0, previous.castleHp - next.castleHp);
  const actionHeal = actionId === "mend" ? previewFortressDefenseActionHeal(previous) : 0;
  const shieldGain = actionId === "bulwark" ? previewFortressDefenseActionShield(previous) : 0;
  const waveIncoming = next.wave > previous.wave || spawnedEnemyIds.length > 0;

  return {
    key: `turn-${next.turn}-${actionId ?? "system"}-${next.wave}-${next.castleHp}-${next.enemies.map((enemy) => `${enemy.id}:${enemy.hp}:${enemy.range}:${enemy.slowedTurns}:${enemy.stunnedTurns ?? 0}`).join("|")}`,
    actionId,
    actionLog,
    enemyLog,
    damagedEnemyIds,
    enemyActions,
    enemyOrigins,
    defeatedEnemyIds,
    advancedEnemyIds,
    attackingEnemyIds,
    spawnedEnemyIds,
    departedEnemies,
    deployedGuardIds,
    guardStrikeSlots,
    damagedGuardIds,
    defeatedGuardIds,
    departedGuards: defeatedGuards,
    deployedTrapIds,
    triggeredTrapIds,
    departedTraps,
    targetSlot: targetSlotFromId(pendingTargetId),
    guardDamageById,
    guardHealById,
    guardShieldGainById,
    damageByEnemyId,
    castleDamage,
    shieldAbsorbed,
    heal: actionHeal,
    shieldGain,
    waveIncoming,
    wave: next.wave,
    terminalStatus: next.status !== "active" ? next.status : null,
  };
}

export function startVisualTimeline(
  event: TurnVisualEvent,
  setVisualPhase: (phase: DefenseVisualPhase) => void,
  setInputLocked: (locked: boolean) => void,
  setActiveEnemyActionId: (enemyId: string | null) => void,
  timersRef: MutableRefObject<number[]>,
  reducedMotion: boolean,
) {
  clearVisualTimers(timersRef);
  setInputLocked(true);
  setActiveEnemyActionId(null);
  setVisualPhase(event.waveIncoming && !event.actionId ? "waveIncoming" : "resolvingOrder");

  if (reducedMotion) {
    scheduleVisualTimer(timersRef, () => {
      setActiveEnemyActionId(event.enemyActions[0]?.enemyId ?? null);
      setVisualPhase(event.waveIncoming ? "waveIncoming" : event.castleDamage > 0 ? "castleHit" : "idle");
    }, 120);
    scheduleVisualTimer(timersRef, () => {
      setVisualPhase("idle");
      setActiveEnemyActionId(null);
      setInputLocked(false);
    }, 340);
    return;
  }

  const advanceActions = event.enemyActions.filter((action) => action.type === "advance");
  const attackActions = event.enemyActions.filter((action) => action.type === "attack");
  const hasEnemyAdvance = advanceActions.length > 0;
  const hasEnemyAttack = attackActions.length > 0;
  const showCastleHit = event.castleDamage > 0 || event.shieldAbsorbed > 0;
  const showWave = event.waveIncoming;
  let elapsed = event.actionId ? 780 : 260;

  if (hasEnemyAdvance) {
    scheduleVisualTimer(timersRef, () => setVisualPhase("enemyAdvancing"), elapsed);
    advanceActions.forEach((action, index) => {
      scheduleVisualTimer(timersRef, () => setActiveEnemyActionId(action.enemyId), elapsed + index * 260);
    });
    elapsed += Math.max(520, advanceActions.length * 260 + 220);
  }

  if (hasEnemyAttack) {
    scheduleVisualTimer(timersRef, () => setVisualPhase("enemyAttacking"), elapsed);
    attackActions.forEach((action, index) => {
      scheduleVisualTimer(timersRef, () => setActiveEnemyActionId(action.enemyId), elapsed + index * 420);
    });
    elapsed += Math.max(680, attackActions.length * 420 + 260);
  }

  if (showCastleHit) {
    scheduleVisualTimer(timersRef, () => setVisualPhase("castleHit"), elapsed);
    elapsed += 780;
  }

  if (showWave) {
    scheduleVisualTimer(timersRef, () => setVisualPhase("waveIncoming"), elapsed);
    elapsed += 980;
  }

  scheduleVisualTimer(timersRef, () => {
    setVisualPhase("idle");
    setActiveEnemyActionId(null);
    setInputLocked(false);
  }, Math.max(elapsed, event.actionId ? 1180 : 760));
}

export function clearVisualTimers(timersRef: MutableRefObject<number[]>) {
  timersRef.current.forEach((timer) => window.clearTimeout(timer));
  timersRef.current = [];
}

export function scheduleVisualTimer(timersRef: MutableRefObject<number[]>, callback: () => void, delay: number) {
  const timer = window.setTimeout(callback, delay);
  timersRef.current.push(timer);
}

export function parseAbsorbed(detail: string) {
  const match = detail.match(/absorbs (\d+)|, (\d+) absorbed/);
  return match ? Number(match[1] ?? match[2]) : 0;
}

function pendingTargetIds(state: FortressDefenseState, actionId: FortressDefenseActionId, targetId?: string) {
  if (actionId === "castle_shot") {
    return targetId && state.enemies.some((enemy) => enemy.id === targetId) ? [targetId] : [];
  }
  if (actionId === "blade_rush") {
    return targetId && state.enemies.some((enemy) => enemy.id === targetId) ? [targetId] : [];
  }
  if (actionId === "arcane_barrage") return state.enemies.filter((enemy) => enemy.range <= 3).map((enemy) => enemy.id);
  if (actionId === "volley") return state.enemies.map((enemy) => enemy.id);
  return [];
}

function findLatestTurnLog(state: FortressDefenseState, turn: number, tone: FortressDefenseLogEntry["tone"]) {
  return [...state.log].reverse().find((entry) => entry.turn === turn && entry.tone === tone) ?? null;
}

function actionTargetsEnemies(actionId: FortressDefenseActionId) {
  return actionId === "castle_shot" || actionId === "blade_rush" || actionId === "volley" || actionId === "arcane_barrage";
}

function actionIdFromLogTitle(title: string | null): FortressDefenseActionId | null {
  if (title === "Castle shot") return "castle_shot";
  if (title === "Deploy guard") return "deploy_guard";
  if (title === "Deploy archer") return "deploy_archer";
  if (title === "Blade rush") return "blade_rush";
  if (title === "Bulwark") return "bulwark";
  if (title === "Arrow volley") return "volley";
  if (title === "Arcane barrage") return "arcane_barrage";
  if (title === "Shadow trap") return "traps";
  if (title === "Mend walls") return "mend";
  if (title === "War chant") return "war_chant";
  return null;
}

function estimateActionDamage(state: FortressDefenseState, enemy: FortressDefenseEnemy, actionId: FortressDefenseActionId | null) {
  const actionDamage = actionId ? previewFortressDefenseActionDamage(state, actionId, enemy) : 0;
  return actionDamage > 0 ? Math.min(enemy.hp, actionDamage) : enemy.hp;
}

function uniqueEnemies(enemies: FortressDefenseEnemy[]) {
  const seen = new Set<string>();
  return enemies.filter((enemy) => {
    if (seen.has(enemy.id)) return false;
    seen.add(enemy.id);
    return true;
  });
}

function guardStrikeSlotsFromLogs(entries: FortressDefenseLogEntry[], turn: number) {
  return entries
    .filter((entry) => entry.turn === turn && entry.title === "Guard strike")
    .map((entry) => {
      const match = entry.detail.match(/from (\w+) range (\d+)/);
      const lane = match?.[1];
      const range = Number(match?.[2]);
      if ((lane === "top" || lane === "middle" || lane === "bottom") && [1, 2].includes(range)) return `${lane}:${range}`;
      return null;
    })
    .filter((slot): slot is string => Boolean(slot));
}

function targetSlotFromId(targetId?: string): EnemyVisualOrigin | null {
  if (!targetId) return null;
  const [lane, range] = targetId.split(":");
  const numericRange = Number(range);
  if ((lane === "top" || lane === "middle" || lane === "bottom") && [1, 2, 3, 4, 5].includes(numericRange)) {
    return { lane, range: numericRange as FortressDefenseRange };
  }
  return null;
}
