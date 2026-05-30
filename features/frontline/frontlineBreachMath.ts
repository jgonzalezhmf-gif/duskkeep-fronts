import type { FrontlineLane, FrontlineSide } from "@/lib/types";
import type { FrontlineBattleState } from "./types";
import { getHeroInLane, getSupportInLane } from "./frontlineBattleAccessors";
import { breachBonus } from "./frontlineCombatantRules";

const BREACH_DAMAGE: Record<FrontlineLane, number> = { left: 2, center: 3, right: 2 };

export function frontlineLaneBaseBreachValue(lane: FrontlineLane) {
  return BREACH_DAMAGE[lane];
}

export function activeBreachPresence(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const hero = getHeroInLane(state, side, lane);
  return Boolean((hero?.alive && hero.stun <= 0) || getSupportInLane(state, side, lane));
}

function activeBreachTraitBonus(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const hero = getHeroInLane(state, side, lane);
  return hero?.alive && hero.stun <= 0 ? breachBonus(hero) : 0;
}

function activeTemporaryPressureBonus(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const hero = getHeroInLane(state, side, lane);
  if (!hero?.alive || hero.stun > 0) return 0;
  const temporaryAttack = Math.max(0, hero.tempAtk);
  if (temporaryAttack <= 0) return 0;
  return Math.max(1, Math.ceil(temporaryAttack / 2));
}

export function frontlineBreachAmount(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  if (!activeBreachPresence(state, side, lane)) return 0;
  return (
    frontlineLaneBaseBreachValue(lane) +
    activeBreachTraitBonus(state, side, lane) +
    activeTemporaryPressureBonus(state, side, lane)
  );
}
