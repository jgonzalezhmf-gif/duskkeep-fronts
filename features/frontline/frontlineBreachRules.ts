import type { FrontlineLane, FrontlineSide } from "@/lib/types";
import { FRONTLINE_LANES } from "./data";
import type { FrontlineBattleState } from "./types";
import { getHeroInLane, getSupportInLane } from "./frontlineBattleAccessors";
import { breachBonus } from "./frontlineCombatantRules";
import { pushEvent, pushResolution } from "./frontlineEvents";

const BREACH_DAMAGE: Record<FrontlineLane, number> = { left: 2, center: 3, right: 2 };

export function livingPresence(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  return Boolean(getHeroInLane(state, side, lane)?.alive || getSupportInLane(state, side, lane));
}

function activeBreachPresence(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const hero = getHeroInLane(state, side, lane);
  return Boolean((hero?.alive && hero.stun <= 0) || getSupportInLane(state, side, lane));
}

function activeBreachBonus(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const hero = getHeroInLane(state, side, lane);
  return hero?.alive && hero.stun <= 0 ? breachBonus(hero) : 0;
}

export function applyBreach(state: FrontlineBattleState) {
  for (const lane of FRONTLINE_LANES) {
    const allyPresent = activeBreachPresence(state, "ally", lane);
    const enemyPresent = activeBreachPresence(state, "enemy", lane);
    if (allyPresent && !enemyPresent) {
      const amount = BREACH_DAMAGE[lane] + activeBreachBonus(state, "ally", lane);
      state.enemyCoreHp = Math.max(0, state.enemyCoreHp - amount);
      pushEvent(state, { kind: "breach", side: "ally", lane, label: `${lane} breach`, amount, emphasis: "high" });
      pushResolution(state, `Ally breaches ${lane} for ${amount}.`);
    } else if (enemyPresent && !allyPresent) {
      const amount = BREACH_DAMAGE[lane] + activeBreachBonus(state, "enemy", lane);
      state.allyCoreHp = Math.max(0, state.allyCoreHp - amount);
      pushEvent(state, { kind: "breach", side: "enemy", lane, label: `${lane} breach`, amount, emphasis: "high" });
      pushResolution(state, `Enemy breaches ${lane} for ${amount}.`);
    }
  }
}
