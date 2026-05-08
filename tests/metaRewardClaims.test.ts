import { describe, expect, it } from "vitest";
import { claimDailyLoginReward, claimMilestoneReward, claimRoadmapReward } from "@/lib/metaRewardClaims";
import type { AccountMilestone } from "@/data/milestones";
import type { RoadmapStep } from "@/data/roadmap";

const dailyEntries = [
  { day: 1, label: "Welcome", rewards: { gold: 100 } },
  { day: 2, label: "Day 2", rewards: { dust: 20 } },
];

const roadmapStep: RoadmapStep = {
  id: "r_test",
  title: "Test Step",
  hint: "Do test work.",
  metric: "battles_won",
  goal: 1,
  rewards: { gems: 5 },
};

const milestone: AccountMilestone = {
  level: 3,
  title: "Initiate",
  unlock: "Test unlock",
  rewards: { gold: 250 },
};

describe("meta reward claims", () => {
  it("claims the next daily login reward", () => {
    expect(
      claimDailyLoginReward({ streak: 1, lastClaim: "2026-05-07" }, dailyEntries, new Date("2026-05-08T12:00:00")),
    ).toEqual({
      patch: {
        dailyLogin: {
          streak: 2,
          lastClaim: "2026-05-08",
        },
      },
      rewards: { dust: 20 },
      source: "Daily Day 2",
    });
  });

  it("does not claim daily login twice on the same day", () => {
    expect(
      claimDailyLoginReward({ streak: 1, lastClaim: "2026-05-08" }, dailyEntries, new Date("2026-05-08T12:00:00")),
    ).toBeNull();
  });

  it("claims a complete roadmap step once", () => {
    expect(claimRoadmapReward({}, roadmapStep, true)).toEqual({
      patch: {
        roadmapClaimed: {
          r_test: true,
        },
      },
      rewards: { gems: 5 },
      source: "Roadmap: Test Step",
    });

    expect(claimRoadmapReward({ r_test: true }, roadmapStep, true)).toBeNull();
    expect(claimRoadmapReward({}, roadmapStep, false)).toBeNull();
  });

  it("claims a reached account milestone once", () => {
    expect(claimMilestoneReward(3, {}, milestone)).toEqual({
      patch: {
        milestonesClaimed: {
          3: true,
        },
      },
      rewards: { gold: 250 },
      source: "Level 3: Initiate",
    });

    expect(claimMilestoneReward(2, {}, milestone)).toBeNull();
    expect(claimMilestoneReward(3, { 3: true }, milestone)).toBeNull();
  });
});
