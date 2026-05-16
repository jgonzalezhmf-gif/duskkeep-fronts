import { describe, expect, it } from "vitest";
import { getAdventureUnlockedLevelIds } from "@/features/adventure/progression";

describe("Adventure progression graph", () => {
  it("keeps branch combat nodes locked until their visible cache prerequisite is claimed", () => {
    const afterBrokenMill = getAdventureUnlockedLevelIds(
      {
        c1l1: { cleared: true, firstClearTaken: true },
        c1l2: { cleared: true, firstClearTaken: true },
      },
      1,
    );

    expect(afterBrokenMill.has("c1l3")).toBe(true);
    expect(afterBrokenMill.has("c1l7")).toBe(true);
    expect(afterBrokenMill.has("c1l4")).toBe(false);
    expect(afterBrokenMill.has("c1l8")).toBe(false);

    const afterLeftCache = getAdventureUnlockedLevelIds(
      {
        c1l1: { cleared: true, firstClearTaken: true },
        c1l2: { cleared: true, firstClearTaken: true },
        c1l3: { cleared: true, firstClearTaken: true, claimed: true },
      },
      1,
    );

    expect(afterLeftCache.has("c1l4")).toBe(true);
    expect(afterLeftCache.has("c1l8")).toBe(false);
  });
});
