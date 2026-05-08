import { describe, expect, it } from "vitest";
import {
  getAdventureProgressEntry,
  markAdventureLevelCleared,
  markAdventureMapInteractionClaimed,
  markAdventureNodeClaimed,
} from "@/lib/adventureProgressState";
import type { AdventureMapInteractionDefinition, AdventureMapInteractionOpenResult } from "@/features/adventure/mapInteractions";

const completedAt = "2026-05-08";

const interaction: AdventureMapInteractionDefinition = {
  id: "cache",
  chapter: 1,
  kind: "keyChest",
  title: "Cache",
  description: "Test cache",
  keyCost: 1,
  unlockAfter: ["c1l2"],
  resetEveryHours: 8,
  lootTable: [],
};

const openResult: AdventureMapInteractionOpenResult = {
  interactionId: "cache",
  lootId: "cache-common",
  lootTier: "common",
  lootTitle: "Common Cache",
  rewards: { gold: 100 },
};

describe("adventure progress state", () => {
  it("returns a default progress entry for unknown levels", () => {
    expect(getAdventureProgressEntry({}, "c1l1")).toEqual({
      cleared: false,
      firstClearTaken: false,
    });
  });

  it("marks a level cleared and preserves an already taken first clear", () => {
    expect(
      markAdventureLevelCleared(
        {
          c1l1: {
            cleared: true,
            firstClearTaken: true,
            completions: 2,
          },
        },
        "c1l1",
        {
          firstClear: false,
          completedAt,
        },
      ),
    ).toEqual({
      c1l1: {
        cleared: true,
        firstClearTaken: true,
        completions: 3,
        lastCompletedAt: completedAt,
      },
    });
  });

  it("marks a claimable adventure node as claimed", () => {
    expect(markAdventureNodeClaimed({}, "c1l3", completedAt)).toEqual({
      c1l3: {
        cleared: true,
        firstClearTaken: true,
        claimed: true,
        completions: 1,
        lastCompletedAt: completedAt,
      },
    });
  });

  it("records map interaction loot and reset timing", () => {
    expect(markAdventureMapInteractionClaimed({}, interaction, openResult, "2026-05-08T00:00:00.000Z")).toEqual({
      cache: {
        claimed: true,
        claimedAt: "2026-05-08T00:00:00.000Z",
        lootId: "cache-common",
        lootTier: "common",
        lootTitle: "Common Cache",
        rewards: { gold: 100 },
        resetAvailableAt: "2026-05-08T08:00:00.000Z",
      },
    });
  });
});
