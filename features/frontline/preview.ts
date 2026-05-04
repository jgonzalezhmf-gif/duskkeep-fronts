import type { FrontlineLane, FrontlineSide } from "@/lib/types";
import { FRONTLINE_SUPPORT_BY_ID } from "./data";
import { getFrontlineCard } from "./engine";
import type {
  FrontlineBattleState,
  FrontlineCardDef,
  FrontlineHeroState,
  FrontlineLaneState,
  FrontlineSupportState,
} from "./types";

export type FrontlinePreviewKind =
  | "damage"
  | "heal"
  | "shield"
  | "buff"
  | "summon"
  | "stun"
  | "core";

export type FrontlinePreview = {
  kind: FrontlinePreviewKind;
  amount: number;
  scope: "single" | "all";
  targetName?: string;
  targetHpBefore?: number;
  targetHpAfter?: number;
  note?: "to_core" | "stun_turns" | "first_strike" | "lane_full" | "no_target";
};

function otherSide(side: FrontlineSide): FrontlineSide {
  return side === "ally" ? "enemy" : "ally";
}

function laneFor(state: FrontlineBattleState, lane: FrontlineLane): FrontlineLaneState {
  return state.lanes[lane];
}

function getHero(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane): FrontlineHeroState | null {
  const ls = laneFor(state, lane);
  return side === "ally" ? ls.allyHero : ls.enemyHero;
}

function getSupport(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane): FrontlineSupportState | null {
  const ls = laneFor(state, lane);
  return side === "ally" ? ls.allySupport : ls.enemySupport;
}

function damageOnHero(hero: FrontlineHeroState, amount: number) {
  let remaining = amount;
  if (hero.shield > 0) {
    remaining = Math.max(0, remaining - hero.shield);
  }
  const before = hero.hp;
  const after = Math.max(0, before - remaining);
  return { dealt: before - after, before, after };
}

function damageOnSupport(support: FrontlineSupportState, amount: number) {
  const before = support.hp;
  const after = Math.max(0, before - amount);
  return { dealt: before - after, before, after };
}

export function previewCardOutcome(
  state: FrontlineBattleState,
  side: FrontlineSide,
  cardId: string,
  lane?: FrontlineLane,
): FrontlinePreview | null {
  let card: FrontlineCardDef;
  try {
    card = getFrontlineCard(cardId, side === "ally" ? state.allyCardProfiles : undefined);
  } catch {
    return null;
  }
  const targetSide = otherSide(side);

  if (card.effect.type === "hero_strike" && lane) {
    const hero = getHero(state, side, lane);
    if (!hero) return null;
    return {
      kind: "buff",
      amount: card.effect.atk,
      scope: "single",
      targetName: hero.name,
      note: card.effect.strikeFirst ? "first_strike" : undefined,
    };
  }

  if (card.effect.type === "front_shot" && lane) {
    const support = getSupport(state, targetSide, lane);
    if (support) {
      const sim = damageOnSupport(support, card.effect.damage);
      return {
        kind: "damage",
        amount: sim.dealt,
        scope: "single",
        targetName: support.name,
        targetHpBefore: sim.before,
        targetHpAfter: sim.after,
      };
    }
    const hero = getHero(state, targetSide, lane);
    if (hero) {
      const sim = damageOnHero(hero, card.effect.damage);
      return {
        kind: "damage",
        amount: sim.dealt,
        scope: "single",
        targetName: hero.name,
        targetHpBefore: sim.before,
        targetHpAfter: sim.after,
      };
    }
    return {
      kind: "core",
      amount: card.effect.damage,
      scope: "single",
      note: "to_core",
    };
  }

  if (card.effect.type === "rally") {
    return { kind: "buff", amount: card.effect.atk, scope: "all" };
  }

  if (card.effect.type === "heal_front" && lane) {
    const hero = getHero(state, side, lane);
    if (!hero) return null;
    const before = hero.hp;
    const after = Math.min(hero.maxHp, before + card.effect.heal);
    return {
      kind: "heal",
      amount: after - before,
      scope: "single",
      targetName: hero.name,
      targetHpBefore: before,
      targetHpAfter: after,
    };
  }

  if (card.effect.type === "stun_front" && lane) {
    const hero = getHero(state, targetSide, lane);
    return {
      kind: "stun",
      amount: card.effect.turns,
      scope: "single",
      targetName: hero?.name,
      note: "stun_turns",
    };
  }

  if (card.effect.type === "execute_front" && lane) {
    const support = getSupport(state, targetSide, lane);
    const hero = getHero(state, targetSide, lane);
    if (support || hero) {
      const target = support ?? hero;
      const sim = support
        ? damageOnSupport(support, card.effect.damage)
        : damageOnHero(hero!, card.effect.damage);
      return {
        kind: "damage",
        amount: sim.dealt,
        scope: "single",
        targetName: target!.name,
        targetHpBefore: sim.before,
        targetHpAfter: sim.after,
      };
    }
    if (card.effect.bonusOpenCore) {
      return {
        kind: "core",
        amount: card.effect.bonusOpenCore,
        scope: "single",
        note: "to_core",
      };
    }
    return null;
  }

  if (card.effect.type === "summon" && lane) {
    const supportDef =
      (side === "ally" ? state.allySupportProfiles?.[card.effect.supportId] : undefined) ??
      FRONTLINE_SUPPORT_BY_ID[card.effect.supportId];
    if (!supportDef) return null;
    const occupant = getSupport(state, side, lane);
    return {
      kind: "summon",
      amount: supportDef.maxHp,
      scope: "single",
      targetName: supportDef.name,
      note: occupant ? "lane_full" : undefined,
    };
  }

  return null;
}
