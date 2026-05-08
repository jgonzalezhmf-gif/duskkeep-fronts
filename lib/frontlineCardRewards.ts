import {
  isFrontlineCardUnlocked,
  isFrontlineProgressionCard,
  type FrontlineCardUnlocks,
} from "@/features/frontline/cardProgression";
import type { Rewards } from "@/lib/types";

type FrontlineCardRewards = NonNullable<Rewards["frontlineCards"]>;

export function getNewlyUnlockedFrontlineCardRewards(
  unlocks: FrontlineCardUnlocks,
  rewards: FrontlineCardRewards | undefined,
): FrontlineCardRewards {
  return (
    rewards?.filter((card) => isFrontlineProgressionCard(card.cardId) && !isFrontlineCardUnlocked(unlocks, card.cardId)) ??
    []
  );
}

export function applyFrontlineCardRewards(
  unlocks: FrontlineCardUnlocks,
  rewards: FrontlineCardRewards | undefined,
): FrontlineCardUnlocks | null {
  if (!rewards?.length) return null;

  const nextUnlocks = { ...unlocks };

  for (const card of rewards) {
    if (isFrontlineProgressionCard(card.cardId)) {
      nextUnlocks[card.cardId] = true;
    }
  }

  return nextUnlocks;
}
