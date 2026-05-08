import type { FrontlineLane, FrontlineSide } from "@/lib/types";
import type { FrontlineBattleState } from "./types";
import {
  getHeroInLane,
  getSupportInLane,
  otherSide,
  setHeroInLane,
  setSupportInLane,
  sideCoreKey,
} from "./frontlineBattleAccessors";
import { applyHeroDamageWithVeilArmor } from "./frontlineBossSignatures";
import { pushEvent, pushResolution } from "./frontlineEvents";
import { dealSupportDamage } from "./frontlineHealthRules";

export function applyDirectDamage(
  state: FrontlineBattleState,
  side: FrontlineSide,
  lane: FrontlineLane,
  amount: number,
  source: string,
) {
  const targetSide = otherSide(side);
  const support = getSupportInLane(state, targetSide, lane);
  if (support) {
    dealSupportDamage(support, amount);
    pushEvent(state, { kind: "damage", side, lane, label: `${source} hits ${support.name}`, amount, emphasis: "mid" });
    pushResolution(state, `${source} cracked ${support.name} on ${lane}.`);
    if (support.hp <= 0) {
      setSupportInLane(state, targetSide, lane, null);
      pushEvent(state, { kind: "ko", side, lane, label: `${support.name} breaks`, emphasis: "high", subKind: "support" });
    }
    return;
  }

  const hero = getHeroInLane(state, targetSide, lane);
  if (hero) {
    const dealt = applyHeroDamageWithVeilArmor(state, hero, amount);
    pushEvent(state, { kind: "damage", side, lane, label: `${source} hits ${hero.name}`, amount: dealt, emphasis: "mid" });
    pushResolution(state, `${source} struck ${hero.name} on ${lane} for ${dealt}.`);
    if (!hero.alive) {
      setHeroInLane(state, targetSide, lane, null);
      pushEvent(state, { kind: "ko", side, lane, label: `${hero.name} falls`, emphasis: "high", subKind: "hero" });
    }
    return;
  }

  const coreKey = sideCoreKey(targetSide);
  state[coreKey] = Math.max(0, state[coreKey] - amount);
  pushEvent(state, { kind: "damage", side, lane, label: `${source} burns the core`, amount, emphasis: "high" });
  pushResolution(state, `${source} burned the ${targetSide} core for ${amount}.`);
}
