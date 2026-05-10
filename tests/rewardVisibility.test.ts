import { describe, expect, it } from "vitest";
import {
  firstVisibleRoadmapStep,
  getDailyLoginClaimState,
  hasRewardEntries,
  isAdventureFirstClearRewardAvailable,
  isDailyRotationRewardClaimedToday,
  isMilestoneRewardClaimable,
  isRoadmapRewardClaimable,
  localDayKey,
} from "@/lib/rewardVisibility";

describe("reward visibility rules", () => {
  it("detects empty and non-empty reward payloads", () => {
    expect(hasRewardEntries({})).toBe(false);
    expect(hasRewardEntries({ gold: 0, dust: 0 })).toBe(false);
    expect(hasRewardEntries({ gold: 1 })).toBe(true);
    expect(hasRewardEntries({ xp: 1 })).toBe(true);
    expect(hasRewardEntries({ adventureKeys: 1 })).toBe(true);
    expect(hasRewardEntries({ shards: [{ heroId: "kara", amount: 0 }] })).toBe(false);
    expect(hasRewardEntries({ shards: [{ heroId: "kara", amount: 1 }] })).toBe(true);
    expect(hasRewardEntries({ frontlineCards: [{ cardId: "order_shadow_dive" }] })).toBe(true);
  });

  it("exposes first-clear rewards only before they are cleared or consumed", () => {
    expect(isAdventureFirstClearRewardAvailable(undefined)).toBe(true);
    expect(isAdventureFirstClearRewardAvailable({ cleared: false, firstClearTaken: false })).toBe(true);
    expect(isAdventureFirstClearRewardAvailable({ cleared: true, firstClearTaken: true })).toBe(false);
    expect(isAdventureFirstClearRewardAvailable({ cleared: false, firstClearTaken: true })).toBe(false);
  });

  it("computes daily login claim state from local day keys", () => {
    const now = new Date(2026, 3, 28, 12, 0, 0);
    expect(localDayKey(now)).toBe("2026-04-28");

    expect(getDailyLoginClaimState({ streak: 2, lastClaim: "2026-04-28" }, now)).toMatchObject({
      claimed: true,
      claimable: false,
      nextDay: 2,
    });
    expect(getDailyLoginClaimState({ streak: 2, lastClaim: "2026-04-27" }, now)).toMatchObject({
      claimed: false,
      claimable: true,
      nextDay: 3,
    });
    expect(getDailyLoginClaimState({ streak: 6, lastClaim: "2026-04-26" }, now)).toMatchObject({
      claimed: false,
      claimable: true,
      nextDay: 1,
    });
  });

  it("keeps roadmap rewards visible only until claimed", () => {
    const steps = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(firstVisibleRoadmapStep(steps, { a: true })?.id).toBe("b");
    expect(isRoadmapRewardClaimable(false, true)).toBe(true);
    expect(isRoadmapRewardClaimable(true, true)).toBe(false);
    expect(isRoadmapRewardClaimable(false, false)).toBe(false);
  });

  it("gates milestone rewards by account level and claim state", () => {
    expect(isMilestoneRewardClaimable(4, 5, false)).toBe(false);
    expect(isMilestoneRewardClaimable(5, 5, false)).toBe(true);
    expect(isMilestoneRewardClaimable(6, 5, true)).toBe(false);
  });

  it("detects daily rotation rewards claimed today", () => {
    const now = new Date(2026, 3, 28, 12, 0, 0);
    expect(isDailyRotationRewardClaimedToday({ event_a: "2026-04-28" }, "event_a", now)).toBe(true);
    expect(isDailyRotationRewardClaimedToday({ event_a: "2026-04-27" }, "event_a", now)).toBe(false);
  });
});
