import { FORTRESS_DEFENSE_BALANCE } from "./balance";
import type { FortressDefenseRange } from "./types";

export function clampFortressDefenseRange(value: number): FortressDefenseRange {
  return Math.max(
    FORTRESS_DEFENSE_BALANCE.range.min,
    Math.min(FORTRESS_DEFENSE_BALANCE.range.max, Math.round(value)),
  ) as FortressDefenseRange;
}

export function effectiveFortressDefenseDamage(damage: number, armor: number) {
  return Math.max(1, damage - armor);
}
