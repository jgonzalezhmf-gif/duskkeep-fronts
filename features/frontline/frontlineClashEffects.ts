import type { FrontlineLane, FrontlineSide } from "@/lib/types";
import { FRONTLINE_LANES } from "./data";
import type { FrontlineBattleState, FrontlineHeroState } from "./types";
import { getHeroInLane, getSupportInLane, setSupportInLane } from "./frontlineBattleAccessors";
import { heroDefinition } from "./frontlineCombatantRules";
import { applyDirectDamage } from "./frontlineDirectDamage";
import { pushEvent } from "./frontlineEvents";
import { addShield, healHero } from "./frontlineHealthRules";

export function cleanupExpiredSupport(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const support = getSupportInLane(state, side, lane);
  if (!support) return;
  support.duration -= 1;
  if (support.duration <= 0 || support.hp <= 0) {
    setSupportInLane(state, side, lane, null);
  }
}

export function applyHeroAftermath(state: FrontlineBattleState, side: FrontlineSide) {
  for (const lane of FRONTLINE_LANES) {
    const hero = getHeroInLane(state, side, lane);
    if (!hero?.alive) continue;
    const trait = heroDefinition(hero).trait;
    if (trait.type === "bulwark") {
      addShield(hero, trait.shield);
      pushEvent(state, { kind: "shield", side, lane, label: `${hero.name} braces`, amount: trait.shield, emphasis: "low", trait: "bulwark" });
    }
    if (trait.type === "mend") {
      let healed = 0;
      let targetHero: FrontlineHeroState | null = null;
      for (const candidateLane of FRONTLINE_LANES) {
        const candidate = getHeroInLane(state, side, candidateLane);
        if (!candidate?.alive) continue;
        if (!targetHero || candidate.hp / candidate.maxHp < targetHero.hp / targetHero.maxHp) {
          targetHero = candidate;
        }
      }
      if (targetHero) healed = healHero(targetHero, trait.heal);
      if (healed > 0) {
        pushEvent(state, { kind: "heal", side, lane, label: `${hero.name} mends ${targetHero?.name}`, amount: healed, emphasis: "low", trait: "mend" });
      }
    }
  }
}

export function applySupportEffectsForLane(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const support = getSupportInLane(state, side, lane);
  if (!support?.effect) return;
  if (support.effect.type === "shield") {
    const hero = getHeroInLane(state, side, lane);
    if (hero?.alive) {
      addShield(hero, support.effect.amount, true);
      pushEvent(state, { kind: "shield", side, lane, label: `${support.name} fortifies ${hero.name}`, amount: support.effect.amount, emphasis: "low" });
    }
  }
  if (support.effect.type === "mark") {
    applyDirectDamage(state, side, lane, support.effect.damage, support.name);
  }
  if (support.effect.type === "strike") {
    applyDirectDamage(state, side, lane, support.effect.damage, support.name);
  }
}

export function clearClashTemps(state: FrontlineBattleState) {
  for (const side of ["ally", "enemy"] as const) {
    for (const lane of FRONTLINE_LANES) {
      const hero = getHeroInLane(state, side, lane);
      if (!hero) continue;
      if (hero.tempShield > 0) {
        hero.shield = Math.max(0, hero.shield - hero.tempShield);
      }
      hero.tempShield = 0;
      hero.tempAtk = 0;
      hero.strikeFirst = false;
      if (hero.stun > 0) hero.stun -= 1;
    }
  }
}
