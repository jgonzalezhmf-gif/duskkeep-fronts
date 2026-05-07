import { describe, expect, it } from "vitest";
import {
  ADVENTURE_MAP_INTERACTIONS_BY_ID,
  canClaimAdventureMapInteraction,
  ADVENTURE_MAP_INTERACTION_RESET_HOURS,
  getAdventureMapInteractionResetAvailableAt,
  getAdventureMapInteractionStatus,
  isAdventureKeySystemUnlocked,
  isAdventureMapInteractionUnlocked,
  rollAdventureMapInteractionLoot,
} from "@/features/adventure/mapInteractions";
import { ADVENTURE_BY_ID } from "@/data/adventure";
import { SHOP_OFFERS_BY_ID } from "@/data/shop";
import { getAdventureVictoryRewards } from "@/features/adventure/nodeResolution";

describe("Adventure map interactions", () => {
  const cache = ADVENTURE_MAP_INTERACTIONS_BY_ID["c1-lower-cache"];

  it("keeps key chests locked until their route requirement is cleared", () => {
    expect(isAdventureMapInteractionUnlocked(cache, {})).toBe(false);
    expect(
      getAdventureMapInteractionStatus({
        interaction: cache,
        progress: {},
        resources: { adventureKeys: 1 },
      }),
    ).toBe("locked");
  });

  it("requires an adventure key after the route unlocks", () => {
    const progress = { c1l2: { cleared: true, firstClearTaken: true } };

    expect(isAdventureKeySystemUnlocked(progress)).toBe(true);
    expect(
      getAdventureMapInteractionStatus({
        interaction: cache,
        progress,
        resources: { adventureKeys: 0 },
      }),
    ).toBe("needs_key");
    expect(
      getAdventureMapInteractionStatus({
        interaction: cache,
        progress,
        resources: { adventureKeys: 1 },
      }),
    ).toBe("ready");
  });

  it("keeps claimed map interactions closed during the reset window", () => {
    const claimedAt = "2026-05-06T08:00:00.000Z";
    const now = new Date("2026-05-06T12:00:00.000Z");

    expect(
      getAdventureMapInteractionStatus({
        interaction: cache,
        progress: { c1l2: { cleared: true, firstClearTaken: true } },
        resources: { adventureKeys: 5 },
        claim: { claimed: true, claimedAt },
        now,
      }),
    ).toBe("claimed");
    expect(
      canClaimAdventureMapInteraction({
        interaction: cache,
        progress: { c1l2: { cleared: true, firstClearTaken: true } },
        resources: { adventureKeys: 5 },
        claim: { claimed: true, claimedAt },
        now,
      }),
    ).toBe(false);
  });

  it("reopens resettable map interactions after eight hours", () => {
    const claimedAt = "2026-05-06T08:00:00.000Z";
    const claim = { claimed: true, claimedAt };

    expect(cache.resetEveryHours).toBe(ADVENTURE_MAP_INTERACTION_RESET_HOURS);
    expect(getAdventureMapInteractionResetAvailableAt(cache, claim)).toBe("2026-05-06T16:00:00.000Z");
    expect(
      getAdventureMapInteractionStatus({
        interaction: cache,
        progress: { c1l2: { cleared: true, firstClearTaken: true } },
        resources: { adventureKeys: 1 },
        claim,
        now: new Date("2026-05-06T16:00:01.000Z"),
      }),
    ).toBe("ready");
    expect(
      getAdventureMapInteractionStatus({
        interaction: cache,
        progress: { c1l2: { cleared: true, firstClearTaken: true } },
        resources: { adventureKeys: 0 },
        claim,
        now: new Date("2026-05-06T16:00:01.000Z"),
      }),
    ).toBe("needs_key");
  });

  it("rolls a single hidden loot bundle instead of exposing fixed rewards", () => {
    const result = rollAdventureMapInteractionLoot(cache, 42);

    expect(result.interactionId).toBe(cache.id);
    expect(cache.lootTable.some((entry) => entry.id === result.lootId)).toBe(true);
    expect(result.rewards).toEqual(cache.lootTable.find((entry) => entry.id === result.lootId)?.rewards);
  });

  it("grants adventure keys only on configured first clears", () => {
    expect(getAdventureVictoryRewards(ADVENTURE_BY_ID.c1l2, true).adventureKeys).toBe(1);
    expect(getAdventureVictoryRewards(ADVENTURE_BY_ID.c1l5, true).adventureKeys).toBe(1);
    expect(getAdventureVictoryRewards(ADVENTURE_BY_ID.c1l11, true).adventureKeys).toBe(1);
    expect(getAdventureVictoryRewards(ADVENTURE_BY_ID.c1l2, false).adventureKeys).toBeUndefined();
    expect(getAdventureVictoryRewards(ADVENTURE_BY_ID.c1l5, false).adventureKeys).toBeUndefined();
    expect(getAdventureVictoryRewards(ADVENTURE_BY_ID.c1l11, false).adventureKeys).toBeUndefined();
  });

  it("defines a single daily shop key offer", () => {
    expect(SHOP_OFFERS_BY_ID.adventure_key_ring).toMatchObject({
      dailyLimit: 1,
      cost: { gems: 45 },
      contents: { adventureKeys: 1 },
    });
  });
});
