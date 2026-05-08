import { describe, expect, it } from "vitest";
import {
  applyFrontlineCardRewards,
  getNewlyUnlockedFrontlineCardRewards,
} from "@/lib/frontlineCardRewards";
import { createDefaultFrontlineCardUnlocks } from "@/features/frontline/cardProgression";

describe("frontline card rewards", () => {
  it("returns null when no card reward is present", () => {
    expect(applyFrontlineCardRewards(createDefaultFrontlineCardUnlocks(), undefined)).toBeNull();
    expect(applyFrontlineCardRewards(createDefaultFrontlineCardUnlocks(), [])).toBeNull();
  });

  it("unlocks progression cards from rewards", () => {
    const unlocks = createDefaultFrontlineCardUnlocks();

    expect(applyFrontlineCardRewards(unlocks, [{ cardId: "order_shadow_dive" }])).toEqual({
      ...unlocks,
      order_shadow_dive: true,
    });
  });

  it("ignores rewards that are not registered progression cards", () => {
    const unlocks = createDefaultFrontlineCardUnlocks();

    expect(applyFrontlineCardRewards(unlocks, [{ cardId: "unknown_card" }])).toEqual(unlocks);
  });

  it("detects only progression cards that were not already unlocked", () => {
    const unlocks = createDefaultFrontlineCardUnlocks();

    expect(
      getNewlyUnlockedFrontlineCardRewards(unlocks, [
        { cardId: "order_guard_wall" },
        { cardId: "order_shadow_dive" },
        { cardId: "unknown_card" },
      ]),
    ).toEqual([{ cardId: "order_shadow_dive" }]);
  });
});
