import {
  FRONTLINE_CARD_MAX_LEVEL,
  frontlineCardUpgradeCost,
  isFrontlineCardUnlocked,
  isFrontlineProgressionCard,
  normalizeFrontlineCardLevel,
} from "@/features/frontline/cardProgression";
import type { FrontlineCardLevels, FrontlineCardUnlocks } from "@/features/frontline/cardProgression";

type FrontlineCardUnlockPlan =
  | { ok: true; frontlineCardUnlocks: FrontlineCardUnlocks }
  | { ok: false };

type FrontlineCardUpgradePlan =
  | {
      ok: true;
      cost: { gold: number; dust: number };
      frontlineCardLevels: FrontlineCardLevels;
      nextLevel: number;
    }
  | { ok: false; reason?: "Card already at max level" };

export function planFrontlineCardUnlock(
  unlocks: FrontlineCardUnlocks,
  cardId: string,
): FrontlineCardUnlockPlan {
  if (!isFrontlineProgressionCard(cardId)) return { ok: false };
  if (isFrontlineCardUnlocked(unlocks, cardId)) return { ok: false };
  return {
    ok: true,
    frontlineCardUnlocks: {
      ...unlocks,
      [cardId]: true,
    },
  };
}

export function planFrontlineCardUpgrade({
  unlocks,
  levels,
  cardId,
}: {
  unlocks: FrontlineCardUnlocks;
  levels: FrontlineCardLevels;
  cardId: string;
}): FrontlineCardUpgradePlan {
  if (!isFrontlineProgressionCard(cardId)) return { ok: false };
  if (!isFrontlineCardUnlocked(unlocks, cardId)) return { ok: false };
  const currentLevel = normalizeFrontlineCardLevel(levels[cardId]);
  if (currentLevel >= FRONTLINE_CARD_MAX_LEVEL) {
    return { ok: false, reason: "Card already at max level" };
  }
  const nextLevel = currentLevel + 1;
  return {
    ok: true,
    cost: frontlineCardUpgradeCost(currentLevel),
    frontlineCardLevels: {
      ...levels,
      [cardId]: nextLevel,
    },
    nextLevel,
  };
}
