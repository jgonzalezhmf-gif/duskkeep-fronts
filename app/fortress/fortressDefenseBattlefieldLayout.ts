import type { CSSProperties } from "react";
import {
  FORTRESS_DEFENSE_MAX_RANGE,
  type FortressDefenseEnemy,
  type FortressDefenseLane,
  type FortressDefenseRange,
} from "@/features/fortress-defense/engine";
import { FORTRESS_DEFENSE_SLOTS, fortressDefenseSlot } from "@/features/fortress-defense/grid";
import type { DefenseVisualPhase, EnemyVisualOrigin, TurnVisualEvent } from "./fortressDefenseVisualEvents";

type EnemyBattlefieldPosition = {
  mobileLeft: number;
  mobileTop: number;
  desktopLeft: number;
  desktopTop: number;
  scale: number;
  advanceX: string;
  advanceY: string;
  zIndex: number;
};

export const RANGE_MARKERS = FORTRESS_DEFENSE_SLOTS.filter((slot) => slot.lane === "middle").map((slot) => ({
  range: slot.range,
  left: slotStagePoint(slot).left,
  top: slotStagePoint(slot).top,
  size: 1.75 + (FORTRESS_DEFENSE_MAX_RANGE + 1 - slot.range) * 0.12,
}));

export function slotStagePoint(
  slot: { xPct: number; yPct: number },
  offset: { xOffset?: number; yOffset?: number } = {},
) {
  return {
    left: slot.xPct + (offset.xOffset ?? 0),
    top: slot.yPct + (offset.yOffset ?? 0),
  };
}

export function slotCssPosition(
  slot: { xPct: number; yPct: number },
  offset: { xOffset?: number; yOffset?: number } = {},
): CSSProperties {
  const point = slotStagePoint(slot, offset);
  return { left: `${point.left}%`, top: `${point.top}%` };
}

export function defenseSlotKey(lane: FortressDefenseLane, range: FortressDefenseRange) {
  return `${lane}:${range}`;
}

export function enemyBattlefieldPosition(
  enemy: FortressDefenseEnemy,
  index: number,
  origin?: EnemyVisualOrigin,
  options: { contested?: boolean } = {},
): EnemyBattlefieldPosition {
  const range = Math.max(1, Math.min(5, Math.round(enemy.range))) as FortressDefenseRange;
  const slot = fortressDefenseSlot(enemy.lane, range);
  const originSlot = origin ? fortressDefenseSlot(origin.lane, origin.range) : slot;
  const point = slotStagePoint(slot, options.contested ? { xOffset: 3.8, yOffset: -2.6 } : undefined);
  const originPoint = slotStagePoint(originSlot);
  const stack = Math.floor(index / 3);
  const sideOffset = stack % 2 === 0 ? stack * 3.2 : -stack * 3.2;
  const verticalOffset = stack === 0 ? 0 : stack * 1.2;
  const kindScale = enemy.kind === "siege" ? 1.08 : enemy.kind === "brute" ? 1.03 : enemy.kind === "acolyte" ? 0.92 : 0.9;

  return {
    mobileLeft: Math.max(25, Math.min(97, point.left + sideOffset)),
    desktopLeft: Math.max(25, Math.min(97, point.left + sideOffset)),
    mobileTop: Math.max(26, Math.min(89, point.top + verticalOffset)),
    desktopTop: Math.max(25, Math.min(90, point.top + verticalOffset)),
    scale: slot.scale * kindScale,
    advanceX: `${originPoint.left - point.left}vw`,
    advanceY: `${originPoint.top - point.top}vh`,
    zIndex: 8 + slot.z + stack,
  };
}

export function enemyForVisualPhase(enemy: FortressDefenseEnemy, event: TurnVisualEvent, phase: DefenseVisualPhase): FortressDefenseEnemy {
  const origin = event.enemyOrigins[enemy.id];
  if (!origin || phase !== "resolvingOrder" || !event.advancedEnemyIds.includes(enemy.id)) return enemy;
  return { ...enemy, lane: origin.lane, range: origin.range };
}

export function findOrderFxTarget(event: TurnVisualEvent, enemies: FortressDefenseEnemy[]) {
  const targetId = event.damagedEnemyIds[0] ?? event.defeatedEnemyIds[0] ?? enemies[0]?.id;
  const index = Math.max(0, enemies.findIndex((enemy) => enemy.id === targetId));
  const enemy = enemies[index];
  if (!enemy) return null;
  return { enemy, position: enemyBattlefieldPosition(enemy, index) };
}
