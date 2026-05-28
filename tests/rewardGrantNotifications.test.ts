import { describe, expect, it } from "vitest";
import { getRewardGrantNotifications } from "@/lib/rewardGrantNotifications";

describe("reward grant notifications", () => {
  it("reports newly unlocked Frontline cards before the reward source", () => {
    expect(
      getRewardGrantNotifications({
        source: "Ashmarket",
        unlockedFrontlineCardCount: 1,
      }),
    ).toEqual([
      { kind: "success", message: "Frontline card unlocked" },
      { kind: "success", message: "Rewards from Ashmarket" },
    ]);
  });

  it("reports only the reward source when no Frontline card unlocks", () => {
    expect(
      getRewardGrantNotifications({
        source: "Daily reward",
        unlockedFrontlineCardCount: 0,
      }),
    ).toEqual([{ kind: "success", message: "Rewards from Daily reward" }]);
  });

  it("does not emit notifications without card unlocks or source", () => {
    expect(getRewardGrantNotifications({ unlockedFrontlineCardCount: 0 })).toEqual([]);
  });
});
