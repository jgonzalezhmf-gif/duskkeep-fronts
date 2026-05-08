import { describe, expect, it } from "vitest";
import { getMissionResetAt, missionNeedsReset } from "@/lib/missionProgress";
import { isAdventureFirstClearRewardAvailable } from "@/lib/rewardVisibility";
import type { MissionProgress } from "@/lib/types";

describe("mission reset helpers", () => {
  it("computes daily reset at next local midnight", () => {
    const now = new Date(2026, 3, 22, 15, 30, 0);
    const resetAt = new Date(getMissionResetAt("daily", now));

    expect(resetAt.getFullYear()).toBe(2026);
    expect(resetAt.getMonth()).toBe(3);
    expect(resetAt.getDate()).toBe(23);
  });

  it("computes weekly reset at next Monday midnight", () => {
    const now = new Date(2026, 3, 22, 15, 30, 0); // Wednesday, April 22, 2026
    const resetAt = new Date(getMissionResetAt("weekly", now));

    expect(resetAt.getDay()).toBe(1);
    expect(resetAt.getHours()).toBe(0);
    expect(resetAt.getMinutes()).toBe(0);
  });

  it("marks missing or expired progress as needing reset", () => {
    const now = new Date(2026, 3, 22, 12, 0, 0);
    const expired: MissionProgress = {
      progress: 2,
      claimed: true,
      resetAt: new Date(2026, 3, 22, 11, 0, 0).toISOString(),
    };

    expect(missionNeedsReset(undefined, now)).toBe(true);
    expect(missionNeedsReset(expired, now)).toBe(true);
  });

  it("keeps active progress until the reset timestamp passes", () => {
    const now = new Date(2026, 3, 22, 12, 0, 0);
    const active: MissionProgress = {
      progress: 1,
      claimed: false,
      resetAt: new Date(2026, 3, 23, 0, 0, 0).toISOString(),
    };

    expect(missionNeedsReset(active, now)).toBe(false);
  });
});

describe("adventure reward visibility helpers", () => {
  it("only exposes first-clear rewards before the node has been cleared or consumed", () => {
    expect(isAdventureFirstClearRewardAvailable(undefined)).toBe(true);
    expect(isAdventureFirstClearRewardAvailable({ cleared: false, firstClearTaken: false })).toBe(true);
    expect(isAdventureFirstClearRewardAvailable({ cleared: true })).toBe(false);
    expect(isAdventureFirstClearRewardAvailable({ cleared: false, firstClearTaken: true })).toBe(false);
  });
});
