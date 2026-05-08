import { ADVENTURE_BY_ID } from "@/data/adventure";
import {
  getAdventureChestClaimRewards,
  getAdventureNodeType,
} from "@/features/adventure/nodeResolution";
import type { AdventureProgressEntry } from "@/features/adventure/nodeResolution";
import {
  getAdventureProgressEntry,
  markAdventureLevelCleared,
  markAdventureNodeClaimed,
} from "@/lib/adventureProgressState";
import { isAdventureFirstClearRewardAvailable } from "@/lib/rewardVisibility";
import type { Rewards } from "@/lib/types";

type AdventureProgressMap = Record<string, AdventureProgressEntry>;

export function planAdventureLevelClear(
  progress: AdventureProgressMap,
  levelId: string,
  completedAt: string,
) {
  const prev = getAdventureProgressEntry(progress, levelId);
  const firstClear = isAdventureFirstClearRewardAvailable(prev);
  return {
    firstClear,
    adventureProgress: markAdventureLevelCleared(progress, levelId, {
      firstClear,
      completedAt,
    }),
  };
}

export function planAdventureNodeClaim(
  progress: AdventureProgressMap,
  levelId: string,
  completedAt: string,
):
  | {
      ok: true;
      adventureProgress: AdventureProgressMap;
      rewards: Rewards;
      source: string;
    }
  | {
      ok: false;
      notification?: {
        kind: "info";
        message: string;
      };
    } {
  const level = ADVENTURE_BY_ID[levelId];
  if (!level) return { ok: false };

  const type = getAdventureNodeType(level);
  const rewards = getAdventureChestClaimRewards(level, getAdventureProgressEntry(progress, levelId));
  if (!rewards) {
    return {
      ok: false,
      notification: {
        kind: "info",
        message: type === "chest" ? "Chest already claimed" : "Node cannot be claimed",
      },
    };
  }

  return {
    ok: true,
    adventureProgress: markAdventureNodeClaimed(progress, levelId, completedAt),
    rewards,
    source: level.name,
  };
}
