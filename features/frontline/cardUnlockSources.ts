import { ADVENTURE } from "@/data/adventure";
import { FRONTLINE_CARD_BY_ID } from "@/features/frontline/data";

export type FrontlineCardUnlockSource = {
  kind: "adventure_first_clear";
  levelId: string;
  levelName: string;
  chapter: number;
  index: number;
};

export function getFrontlineCardUnlockSource(cardId: string): FrontlineCardUnlockSource | null {
  if (!FRONTLINE_CARD_BY_ID[cardId]) return null;

  for (const level of ADVENTURE) {
    if (level.firstClearRewards?.frontlineCards?.some((reward) => reward.cardId === cardId)) {
      return {
        kind: "adventure_first_clear",
        levelId: level.id,
        levelName: level.name,
        chapter: level.chapter,
        index: level.index,
      };
    }
  }

  return null;
}
