import { describe, expect, it } from "vitest";
import {
  ADVENTURE_MAP_INTERACTIONS_BY_ID,
  getAdventureMapInteractionStatus,
  isAdventureMapInteractionUnlocked,
} from "@/features/adventure/mapInteractions";

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

  it("does not reopen claimed map interactions", () => {
    expect(
      getAdventureMapInteractionStatus({
        interaction: cache,
        progress: { c1l2: { cleared: true, firstClearTaken: true } },
        resources: { adventureKeys: 5 },
        claim: { claimed: true, claimedAt: "2026-05-06" },
      }),
    ).toBe("claimed");
  });
});
