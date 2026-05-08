import { getAdventureMapInteractionResetAvailableAt } from "@/features/adventure/mapInteractions";
import type {
  AdventureMapInteractionClaim,
  AdventureMapInteractionDefinition,
  AdventureMapInteractionOpenResult,
} from "@/features/adventure/mapInteractions";
import type { AdventureProgressEntry } from "@/features/adventure/nodeResolution";

export type AdventureProgressMap = Record<string, AdventureProgressEntry>;
export type AdventureMapClaimMap = Record<string, AdventureMapInteractionClaim>;

const DEFAULT_PROGRESS_ENTRY: AdventureProgressEntry = {
  cleared: false,
  firstClearTaken: false,
};

export function getAdventureProgressEntry(progress: AdventureProgressMap, levelId: string): AdventureProgressEntry {
  return progress[levelId] ?? DEFAULT_PROGRESS_ENTRY;
}

export function markAdventureLevelCleared(
  progress: AdventureProgressMap,
  levelId: string,
  {
    firstClear,
    completedAt,
  }: {
    firstClear: boolean;
    completedAt: string;
  },
): AdventureProgressMap {
  const previous = getAdventureProgressEntry(progress, levelId);

  return {
    ...progress,
    [levelId]: {
      ...previous,
      cleared: true,
      firstClearTaken: previous.firstClearTaken || firstClear,
      completions: (previous.completions ?? 0) + 1,
      lastCompletedAt: completedAt,
    },
  };
}

export function markAdventureNodeClaimed(
  progress: AdventureProgressMap,
  levelId: string,
  completedAt: string,
): AdventureProgressMap {
  const previous = getAdventureProgressEntry(progress, levelId);

  return {
    ...progress,
    [levelId]: {
      ...previous,
      cleared: true,
      firstClearTaken: true,
      claimed: true,
      completions: (previous.completions ?? 0) + 1,
      lastCompletedAt: completedAt,
    },
  };
}

export function markAdventureMapInteractionClaimed(
  claims: AdventureMapClaimMap,
  interaction: AdventureMapInteractionDefinition,
  result: AdventureMapInteractionOpenResult,
  claimedAt: string,
): AdventureMapClaimMap {
  return {
    ...claims,
    [interaction.id]: {
      claimed: true,
      claimedAt,
      lootId: result.lootId,
      lootTier: result.lootTier,
      lootTitle: result.lootTitle,
      rewards: result.rewards,
      resetAvailableAt:
        getAdventureMapInteractionResetAvailableAt(interaction, {
          claimed: true,
          claimedAt,
        }) ?? undefined,
    },
  };
}
