import type { FrontlineSide } from "@/lib/types";
import { FRONTLINE_LANES } from "./data";
import type { FrontlineBattleState, FrontlineHeroState } from "./types";
import {
  getHeroInLane,
  getSupportInLane,
  otherSide,
  setHeroInLane,
  setSupportInLane,
} from "./frontlineBattleAccessors";
import {
  applyCinderMarkOnHit,
  applyHeroDamageWithVeilArmor,
  applySoulDrain,
  emberCrownBonus,
} from "./frontlineBossSignatures";
import { heroDefinition } from "./frontlineCombatantRules";
import { applyDirectDamage } from "./frontlineDirectDamage";
import { pushEvent } from "./frontlineEvents";
import { dealSupportDamage, healHero } from "./frontlineHealthRules";
import type { FrontlineActor } from "./frontlineStrikeOrder";

function chantAura(state: FrontlineBattleState, side: FrontlineSide) {
  let bonus = 0;
  for (const lane of FRONTLINE_LANES) {
    const hero = getHeroInLane(state, side, lane);
    if (!hero?.alive || hero.stun > 0) continue;
    const trait = heroDefinition(hero).trait;
    if (trait.type === "chant") bonus += trait.atkAura;
  }
  return bonus;
}

function attackPower(state: FrontlineBattleState, hero: FrontlineHeroState) {
  const trait = heroDefinition(hero).trait;
  let value = hero.atk + hero.tempAtk + chantAura(state, hero.side) + emberCrownBonus(state, hero);
  if (trait.type === "flurry" && hero.hp > hero.maxHp / 2) value += trait.atk;
  return value;
}

export function resolveActorStrike(state: FrontlineBattleState, actor: FrontlineActor) {
  if (actor.kind === "hero") {
    const hero = getHeroInLane(state, actor.side, actor.lane);
    if (!hero?.alive || hero.stun > 0) return;
    const targetSide = otherSide(actor.side);
    const support = getSupportInLane(state, targetSide, actor.lane);
    const enemyHero = getHeroInLane(state, targetSide, actor.lane);
    const damage = Math.max(1, attackPower(state, hero));

    if (support) {
      dealSupportDamage(support, damage);
      pushEvent(state, { kind: "damage", side: actor.side, lane: actor.lane, label: `${hero.name} hits ${support.name}`, amount: damage, emphasis: "mid" });
      if (support.hp <= 0) {
        setSupportInLane(state, targetSide, actor.lane, null);
        pushEvent(state, { kind: "ko", side: actor.side, lane: actor.lane, label: `${support.name} breaks`, emphasis: "mid", subKind: "support" });
      }
      return;
    }

    if (enemyHero) {
      let dealt = Math.max(1, damage - Math.floor(enemyHero.def / 2));
      const trait = heroDefinition(hero).trait;
      const ambushTriggered = trait.type === "ambush" && enemyHero.hp < enemyHero.maxHp;
      if (ambushTriggered) dealt += trait.bonusVsWounded;
      dealt = applyHeroDamageWithVeilArmor(state, enemyHero, dealt);
      pushEvent(state, {
        kind: "damage",
        side: actor.side,
        lane: actor.lane,
        label: `${hero.name} hits ${enemyHero.name}`,
        amount: dealt,
        emphasis: "mid",
        ...(ambushTriggered ? { trait: "ambush" as const } : {}),
      });
      if (dealt > 0) applyCinderMarkOnHit(state, actor.side, actor.lane);
      if (dealt > 0 && trait.type === "lifesteal") {
        const healed = healHero(hero, trait.heal);
        if (healed > 0) {
          pushEvent(state, { kind: "heal", side: actor.side, lane: actor.lane, label: `${hero.name} drains life`, amount: healed, emphasis: "low", trait: "lifesteal" });
        }
      }
      if (dealt > 0 && trait.type === "venom" && enemyHero.alive) {
        const venomDealt = applyHeroDamageWithVeilArmor(state, enemyHero, trait.damage);
        pushEvent(state, { kind: "damage", side: actor.side, lane: actor.lane, label: `${hero.name} venom burns`, amount: venomDealt, emphasis: "mid", trait: "venom" });
      }
      if (dealt > 0 && actor.side === "enemy") applySoulDrain(state, hero, actor.lane);
      if (!enemyHero.alive) {
        setHeroInLane(state, targetSide, actor.lane, null);
        pushEvent(state, { kind: "ko", side: actor.side, lane: actor.lane, label: `${enemyHero.name} falls`, emphasis: "high", subKind: "hero" });
      }
    }
    return;
  }

  const support = getSupportInLane(state, actor.side, actor.lane);
  if (!support || support.hp <= 0 || support.atk <= 0) return;
  applyDirectDamage(state, actor.side, actor.lane, support.atk, support.name);
}
