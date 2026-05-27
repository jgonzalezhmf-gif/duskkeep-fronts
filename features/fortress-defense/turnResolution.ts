import { FORTRESS_DEFENSE_BALANCE } from "./balance";
import { createFortressWaveEnemies } from "./catalog";
import { clampFortressDefenseRange, effectiveFortressDefenseDamage } from "./combatMath";
import { canFortressEnemyAttack, compareFortressDefenseThreat } from "./targeting";
import type {
  FortressDefenseEnemy,
  FortressDefenseGuard,
  FortressDefenseLane,
  FortressDefenseRange,
  FortressDefenseState,
  FortressDefenseTrap,
} from "./types";

const GUARD_COUNTER_DAMAGE = FORTRESS_DEFENSE_BALANCE.guards.counterDamage;
const ARCHER_COUNTER_DAMAGE = FORTRESS_DEFENSE_BALANCE.guards.archerCounterDamage;
const GUARD_COUNTER_REACH = FORTRESS_DEFENSE_BALANCE.guards.counterReach;
const WAR_CHANT_DAMAGE_BONUS = FORTRESS_DEFENSE_BALANCE.actions.warChant.damageBonus;

export function applyFortressDefenseEnemyPhase(state: FortressDefenseState): FortressDefenseState {
  let totalDamage = 0;
  let attackerCount = 0;
  const survivors: FortressDefenseEnemy[] = [];
  const guards = state.guards.map((guard) => ({ ...guard }));
  const traps = (state.traps ?? []).map((trap) => ({ ...trap }));
  for (const originalEnemy of state.enemies) {
    let enemy = triggerTrapAtEnemySlot(state, traps, originalEnemy);
    if (enemy.hp <= 0) {
      survivors.push(enemy);
      continue;
    }
    if ((enemy.stunnedTurns ?? 0) > 0) {
      state.log.push({
        turn: state.turn,
        title: "Enemy advance",
        detail: `${enemy.name} is stunned at range ${enemy.range}.`,
        tone: "enemy",
      });
      survivors.push(consumeMovementControl(enemy));
      continue;
    }

    const guardAtEnemyRange = findGuardAtLaneRange(guards, enemy.lane, enemy.range);
    if (guardAtEnemyRange && enemy.attackRange === 1) {
      applyGuardDamage(state, guardAtEnemyRange, enemy);
      survivors.push(consumeMovementControl(enemy));
      continue;
    }

    if (canFortressEnemyAttack(enemy)) {
      totalDamage += enemy.attackDamage;
      attackerCount += 1;
      state.log.push({
        turn: state.turn,
        title: "Enemy attack",
        detail: `${enemy.name} attacks from range ${enemy.range} for ${enemy.attackDamage}.`,
        tone: "enemy",
      });
      if (!enemy.traits?.some((trait) => trait === "suicide" || trait === "breach")) {
        survivors.push(consumeMovementControl(enemy));
      }
      continue;
    }

    const effectiveMove = Math.max(0, enemy.moveSpeed - (enemy.slowedTurns > 0 ? 1 : 0));
    const targetRange = clampFortressDefenseRange(enemy.range - effectiveMove);
    const guardBlocker = enemy.attackRange === 1 ? findGuardBlockingAdvance(guards, enemy.lane, enemy.range, targetRange) : null;
    const moved = {
      ...enemy,
      range: guardBlocker ? guardBlocker.range : targetRange,
      slowedTurns: Math.max(0, enemy.slowedTurns - 1),
      stunnedTurns: Math.max(0, (enemy.stunnedTurns ?? 0) - 1),
    };
    if (guardBlocker) {
      state.log.push({
        turn: state.turn,
        title: "Guard block",
        detail: `${guardBlocker.name} blocks ${enemy.name} at range ${guardBlocker.range}.`,
        tone: "ally",
      });
    } else {
      state.log.push({
        turn: state.turn,
        title: "Enemy advance",
        detail: moved.range < enemy.range
          ? `${enemy.name} advances to range ${moved.range}.`
          : `${enemy.name} is pinned at range ${enemy.range}.`,
        tone: "enemy",
      });
    }
    survivors.push(triggerTrapAtEnemySlot(state, traps, moved));
  }

  if (totalDamage > 0) {
    const absorbed = Math.min(state.shield, totalDamage);
    const damage = Math.max(0, totalDamage - absorbed);
    state.shield -= absorbed;
    state.castleHp = Math.max(0, state.castleHp - damage);
    state.log.push({
      turn: state.turn,
      title: "Gate impact",
      detail: `${attackerCount} attackers deal ${totalDamage}. Bulwark absorbs ${absorbed}. Castle takes ${damage}.`,
      tone: "enemy",
    });
  }

  state.enemies = survivors;
  state.guards = guards
    .filter((guard) => guard.hp > 0)
    .map((guard) => ({ ...guard, inspiredTurns: Math.max(0, (guard.inspiredTurns ?? 0) - 1) }));
  state.traps = traps;
  if (state.castleHp <= 0) state.status = "breach";
  return state;
}

export function applyFortressDefenseGuardCounterattacks(state: FortressDefenseState): FortressDefenseState {
  const activeGuards = state.guards.filter((guard) => guard.hp > 0);
  if (activeGuards.length === 0 || state.enemies.length === 0) return state;

  for (const guard of activeGuards) {
    const target = findGuardCounterTarget(state.enemies, guard);
    if (!target) continue;
    const damage = effectiveFortressDefenseDamage(guardCounterDamage(guard, state.morale), target.armor);
    target.hp -= damage;
    state.log.push({
      turn: state.turn,
      title: "Guard strike",
      detail: `${guard.name} ${guard.unitType === "archer" ? "fires at" : "strikes"} ${target.name} from ${guard.lane} range ${guard.range} for ${damage}.`,
      tone: "ally",
    });
  }

  return state;
}

export function clearFortressDefenseDefeated(state: FortressDefenseState): FortressDefenseState {
  const before = state.enemies.length;
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
  state.defeated += before - state.enemies.length;
  return state;
}

export function advanceFortressDefenseWaveIfNeeded(state: FortressDefenseState): FortressDefenseState {
  if (state.status !== "active" || state.enemies.length > 0) return state;
  if (state.wave >= state.maxWaves) {
    state.status = "victory";
    state.log.push({
      turn: state.turn,
      title: "Raid broken",
      detail: "The last attackers scatter below the gate.",
      tone: "system",
    });
    return state;
  }
  state.wave += 1;
  state.enemies = createFortressWaveEnemies(state.wave, state.seed, state.raidPressure);
  state.log.push({
    turn: state.turn,
    title: `Wave ${state.wave}`,
    detail: "Fresh attackers emerge from the lower road.",
    tone: "system",
  });
  return state;
}

function findGuardAtLaneRange(
  guards: FortressDefenseGuard[],
  lane: FortressDefenseLane,
  range: FortressDefenseRange,
) {
  return guards.find((guard) => guard.hp > 0 && guard.lane === lane && guard.range === range) ?? null;
}

function findGuardBlockingAdvance(
  guards: FortressDefenseGuard[],
  lane: FortressDefenseLane,
  fromRange: FortressDefenseRange,
  toRange: FortressDefenseRange,
) {
  return guards
    .filter((guard) => guard.hp > 0 && guard.lane === lane && guard.range <= fromRange && guard.range >= toRange)
    .sort((a, b) => b.range - a.range)[0] ?? null;
}

function findGuardCounterTarget(
  enemies: FortressDefenseEnemy[],
  guard: FortressDefenseGuard,
) {
  return enemies
    .filter((enemy) => enemy.hp > 0 && enemy.lane === guard.lane)
    .filter((enemy) => guard.unitType === "archer" || (enemy.range >= guard.range && enemy.range <= guard.range + GUARD_COUNTER_REACH))
    .sort(compareFortressDefenseThreat)[0] ?? null;
}

function guardCounterDamage(guard: FortressDefenseGuard, morale: number) {
  const baseDamage = guard.unitType === "archer" ? ARCHER_COUNTER_DAMAGE : GUARD_COUNTER_DAMAGE;
  const inspiredBonus = (guard.inspiredTurns ?? 0) > 0 ? WAR_CHANT_DAMAGE_BONUS : 0;
  return baseDamage + Math.floor(morale / 3) + inspiredBonus;
}

function applyGuardDamage(
  state: FortressDefenseState,
  guard: FortressDefenseGuard,
  enemy: FortressDefenseEnemy,
) {
  const absorbed = Math.min(Math.max(0, guard.shield ?? 0), enemy.attackDamage);
  const damage = Math.max(0, enemy.attackDamage - absorbed);
  const hpDamage = Math.min(guard.hp, damage);
  guard.shield = Math.max(0, (guard.shield ?? 0) - absorbed);
  guard.hp = Math.max(0, guard.hp - hpDamage);
  state.log.push({
    turn: state.turn,
    title: "Guard block",
    detail: `${guard.name} blocks ${enemy.name} and absorbs ${absorbed > 0 ? absorbed : hpDamage}.`,
    tone: "ally",
  });
  if (guard.hp <= 0) {
    state.log.push({
      turn: state.turn,
      title: "Guard down",
      detail: `${guard.name} falls in the ${guard.lane} lane.`,
      tone: "ally",
    });
  }
}

function triggerTrapAtEnemySlot(
  state: FortressDefenseState,
  traps: FortressDefenseTrap[],
  enemy: FortressDefenseEnemy,
): FortressDefenseEnemy {
  const trapIndex = traps.findIndex((trap) => trap.lane === enemy.lane && trap.range === enemy.range);
  if (trapIndex < 0) return enemy;

  const [trap] = traps.splice(trapIndex, 1);
  const damage = effectiveFortressDefenseDamage(trap.damage, enemy.armor);
  state.log.push({
    turn: state.turn,
    title: "Shadow trap sprung",
    detail: `${trap.name} triggers on ${enemy.name} at ${trap.lane} range ${trap.range} for ${damage} and stuns for ${trap.stun}.`,
    tone: "ally",
  });
  return {
    ...enemy,
    hp: enemy.hp - damage,
    slowedTurns: Math.max(enemy.slowedTurns, trap.slow),
    stunnedTurns: Math.max(enemy.stunnedTurns ?? 0, trap.stun),
  };
}

function consumeMovementControl(enemy: FortressDefenseEnemy): FortressDefenseEnemy {
  return {
    ...enemy,
    slowedTurns: Math.max(0, enemy.slowedTurns - 1),
    stunnedTurns: Math.max(0, (enemy.stunnedTurns ?? 0) - 1),
  };
}
