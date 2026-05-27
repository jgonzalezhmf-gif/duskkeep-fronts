import type { FortressDefenseLane, FortressDefenseRange } from "./types";

export type FortressDefenseSlot = {
  lane: FortressDefenseLane;
  range: FortressDefenseRange;
  xPct: number;
  yPct: number;
  scale: number;
  z: number;
};

export const FORTRESS_DEFENSE_SLOTS: FortressDefenseSlot[] = [
  { lane: "top", range: 5, xPct: 96, yPct: 28, scale: 0.76, z: 8 },
  { lane: "middle", range: 5, xPct: 96, yPct: 54, scale: 0.76, z: 12 },
  { lane: "bottom", range: 5, xPct: 96, yPct: 80, scale: 0.76, z: 16 },
  { lane: "top", range: 4, xPct: 79, yPct: 28, scale: 0.86, z: 10 },
  { lane: "middle", range: 4, xPct: 79, yPct: 54, scale: 0.86, z: 14 },
  { lane: "bottom", range: 4, xPct: 79, yPct: 80, scale: 0.86, z: 18 },
  { lane: "top", range: 3, xPct: 62, yPct: 28, scale: 0.98, z: 12 },
  { lane: "middle", range: 3, xPct: 62, yPct: 54, scale: 0.98, z: 16 },
  { lane: "bottom", range: 3, xPct: 62, yPct: 80, scale: 0.98, z: 20 },
  { lane: "top", range: 2, xPct: 45, yPct: 28, scale: 1.1, z: 14 },
  { lane: "middle", range: 2, xPct: 45, yPct: 54, scale: 1.1, z: 18 },
  { lane: "bottom", range: 2, xPct: 45, yPct: 80, scale: 1.1, z: 22 },
  { lane: "top", range: 1, xPct: 28, yPct: 28, scale: 1.2, z: 16 },
  { lane: "middle", range: 1, xPct: 28, yPct: 54, scale: 1.2, z: 20 },
  { lane: "bottom", range: 1, xPct: 28, yPct: 80, scale: 1.2, z: 24 },
];

export function fortressDefenseSlot(lane: FortressDefenseLane, range: FortressDefenseRange) {
  return FORTRESS_DEFENSE_SLOTS.find((slot) => slot.lane === lane && slot.range === range) ?? FORTRESS_DEFENSE_SLOTS[1];
}

export function isFortressDefenseLane(value: unknown): value is FortressDefenseLane {
  return value === "top" || value === "middle" || value === "bottom";
}

export function isFortressDefenseRange(value: unknown): value is FortressDefenseRange {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}
