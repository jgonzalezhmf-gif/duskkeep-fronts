import {
  FRONTLINE_CARD_BY_ID,
  FRONTLINE_CARD_POOL,
  FRONTLINE_STARTER_DECK,
  FRONTLINE_SUPPORT_BY_ID,
} from "./data";
import type {
  FrontlineCardDef,
  FrontlineCardEffect,
  FrontlineCardProfileMap,
  FrontlineSupportDef,
  FrontlineSupportProfileMap,
} from "./types";

export type FrontlineCardLevels = Record<string, number>;
export type FrontlineCardUnlocks = Record<string, boolean>;

export const FRONTLINE_CARD_MAX_LEVEL = 5;

export function isFrontlineProgressionCard(cardId: string) {
  return Boolean(FRONTLINE_CARD_BY_ID[cardId]) && FRONTLINE_CARD_POOL.includes(cardId);
}

export function createDefaultFrontlineCardUnlocks(): FrontlineCardUnlocks {
  return Object.fromEntries(FRONTLINE_STARTER_DECK.map((cardId) => [cardId, true]));
}

export function isFrontlineCardUnlocked(unlocks: FrontlineCardUnlocks, cardId: string) {
  return Boolean(unlocks[cardId] || FRONTLINE_STARTER_DECK.includes(cardId));
}

export function normalizeFrontlineCardLevel(level: number | undefined) {
  if (typeof level !== "number" || !Number.isFinite(level)) return 1;
  return Math.max(1, Math.min(FRONTLINE_CARD_MAX_LEVEL, Math.floor(level)));
}

export function frontlineCardUpgradeCost(level: number) {
  const safeLevel = normalizeFrontlineCardLevel(level);
  return {
    gold: 90 + safeLevel * 45,
    dust: 12 + safeLevel * 8,
  };
}

function scaleEffect(effect: FrontlineCardEffect, level: number): FrontlineCardEffect {
  const bonus = Math.max(0, level - 1);
  if (bonus <= 0) return effect;

  switch (effect.type) {
    case "hero_strike":
      return {
        ...effect,
        atk: effect.atk + Math.ceil(bonus / 2),
        shield: effect.shield ? effect.shield + bonus : effect.shield,
      };
    case "front_shot":
      return { ...effect, damage: effect.damage + bonus };
    case "rally":
      return {
        ...effect,
        atk: effect.atk + Math.ceil(bonus / 2),
        shield: effect.shield ? effect.shield + bonus : effect.shield,
      };
    case "heal_front":
      return {
        ...effect,
        heal: effect.heal + bonus * 2,
        coreHeal: effect.coreHeal ? effect.coreHeal + Math.floor(bonus / 2) : effect.coreHeal,
      };
    case "stun_front":
      return { ...effect, turns: level >= 4 ? effect.turns + 1 : effect.turns };
    case "execute_front":
      return {
        ...effect,
        damage: effect.damage + bonus,
        bonusOpenCore: effect.bonusOpenCore ? effect.bonusOpenCore + Math.floor(bonus / 2) : effect.bonusOpenCore,
      };
    case "summon":
      return effect;
  }
}

export function applyFrontlineCardProgression(card: FrontlineCardDef, level: number | undefined): FrontlineCardDef {
  const safeLevel = normalizeFrontlineCardLevel(level);
  if (safeLevel <= 1) return { ...card, level: 1 };
  return {
    ...card,
    level: safeLevel,
    effect: scaleEffect(card.effect, safeLevel),
  };
}

export function applyFrontlineSupportProgression(support: FrontlineSupportDef, level: number | undefined): FrontlineSupportDef {
  const safeLevel = normalizeFrontlineCardLevel(level);
  const bonus = Math.max(0, safeLevel - 1);
  if (bonus <= 0) return support;
  return {
    ...support,
    maxHp: support.maxHp + bonus * 2,
    atk: support.atk + Math.floor((bonus + 1) / 2),
    duration: support.duration + (safeLevel >= 5 ? 1 : 0),
  };
}

export function getFrontlineCardLevel(levels: FrontlineCardLevels, cardId: string) {
  return normalizeFrontlineCardLevel(levels[cardId]);
}

export function createFrontlineCardProfileMap(levels: FrontlineCardLevels): FrontlineCardProfileMap {
  return Object.fromEntries(
    FRONTLINE_CARD_POOL.map((cardId) => {
      const card = FRONTLINE_CARD_BY_ID[cardId];
      return card ? ([cardId, applyFrontlineCardProgression(card, levels[cardId])] as const) : null;
    }).filter((entry): entry is readonly [string, FrontlineCardDef] => Boolean(entry)),
  );
}

export function createFrontlineSupportProfileMap(levels: FrontlineCardLevels): FrontlineSupportProfileMap {
  const entries = FRONTLINE_CARD_POOL.flatMap((cardId) => {
    const card = FRONTLINE_CARD_BY_ID[cardId];
    if (!card || card.effect.type !== "summon") return [];
    const support = FRONTLINE_SUPPORT_BY_ID[card.effect.supportId];
    if (!support) return [];
    return [[support.id, applyFrontlineSupportProgression(support, levels[cardId])] as const];
  });
  return Object.fromEntries(entries);
}

export function sanitizeFrontlineCardLevels(value: unknown): FrontlineCardLevels {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(source)
      .filter(isFrontlineProgressionCard)
      .map((cardId) => [cardId, normalizeFrontlineCardLevel(Number(source[cardId]))] as const),
  );
}

export function sanitizeFrontlineCardUnlocks(value: unknown): FrontlineCardUnlocks {
  const defaults = createDefaultFrontlineCardUnlocks();
  if (!value || typeof value !== "object") return defaults;
  const source = value as Record<string, unknown>;
  return {
    ...defaults,
    ...Object.fromEntries(
      Object.keys(source)
        .filter(isFrontlineProgressionCard)
        .map((cardId) => [cardId, Boolean(source[cardId])] as const),
    ),
  };
}
