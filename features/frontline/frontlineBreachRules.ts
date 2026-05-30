import type { FrontlineLane, FrontlineSide } from "@/lib/types";
import { FRONTLINE_LANES } from "./data";
import type { FrontlineBattleState } from "./types";
import { getHeroInLane, getSupportInLane } from "./frontlineBattleAccessors";
import { activeBreachPresence, frontlineBreachAmount } from "./frontlineBreachMath";
import { pushEvent, pushResolution } from "./frontlineEvents";

export function livingPresence(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  return Boolean(getHeroInLane(state, side, lane)?.alive || getSupportInLane(state, side, lane));
}

export function applyBreach(state: FrontlineBattleState) {
  for (const lane of FRONTLINE_LANES) {
    const allyPresent = activeBreachPresence(state, "ally", lane);
    const enemyPresent = activeBreachPresence(state, "enemy", lane);
    if (allyPresent && !enemyPresent) {
      const amount = frontlineBreachAmount(state, "ally", lane);
      state.enemyCoreHp = Math.max(0, state.enemyCoreHp - amount);
      pushEvent(state, { kind: "breach", side: "ally", lane, label: `${lane} breach`, amount, emphasis: "high" });
      pushResolution(state, `Ally breaches ${lane} for ${amount}.`);
    } else if (enemyPresent && !allyPresent) {
      const amount = frontlineBreachAmount(state, "enemy", lane);
      state.allyCoreHp = Math.max(0, state.allyCoreHp - amount);
      pushEvent(state, { kind: "breach", side: "enemy", lane, label: `${lane} breach`, amount, emphasis: "high" });
      pushResolution(state, `Enemy breaches ${lane} for ${amount}.`);
    }
  }
}
