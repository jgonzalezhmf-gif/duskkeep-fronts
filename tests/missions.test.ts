import { describe, expect, it } from "vitest";
import {
  ALL_MISSIONS,
  DAILY_MISSIONS,
  WEEKLY_MISSIONS,
} from "@/data/missions";
import {
  applyMissionMetricProgress,
  claimMissionProgress,
  ensureMissionProgress,
  getMissionResetAt,
  missionNeedsReset,
} from "@/lib/missionProgress";
import { isAdventureFirstClearRewardAvailable } from "@/lib/rewardVisibility";
import { METRIC_META, buildMissionRouteSummaries } from "@/app/missions/missionsPageHelpers";
import type { Mission, MissionProgress } from "@/lib/types";

const missions: Mission[] = [
  {
    id: "daily-battle",
    kind: "daily",
    name: "Win Battles",
    description: "Win battles.",
    goal: 3,
    metric: "battles_won",
    rewards: { gold: 100 },
  },
  {
    id: "weekly-arena",
    kind: "weekly",
    name: "Arena Drill",
    description: "Play arena.",
    goal: 2,
    metric: "arena_battles",
    rewards: { gems: 10 },
  },
];

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

  it("initializes missing or expired mission progress", () => {
    const now = new Date(2026, 3, 22, 12, 0, 0);

    expect(ensureMissionProgress({}, missions, now)).toMatchObject({
      "daily-battle": {
        progress: 0,
        claimed: false,
      },
      "weekly-arena": {
        progress: 0,
        claimed: false,
      },
    });
  });

  it("applies progress only to matching unclaimed missions and caps at the goal", () => {
    const now = new Date(2026, 3, 22, 12, 0, 0);
    const resetAt = new Date(2026, 3, 23, 0, 0, 0).toISOString();

    expect(
      applyMissionMetricProgress(
        {
          "daily-battle": { progress: 2, claimed: false, resetAt },
          "weekly-arena": { progress: 1, claimed: false, resetAt },
        },
        missions,
        "battles_won",
        5,
        now,
      ),
    ).toMatchObject({
      "daily-battle": { progress: 3, claimed: false, resetAt },
      "weekly-arena": { progress: 1, claimed: false, resetAt },
    });
  });

  it("claims a completed mission and returns its rewards", () => {
    const resetAt = new Date(2026, 3, 23, 0, 0, 0).toISOString();

    expect(
      claimMissionProgress(
        {
          "daily-battle": { progress: 3, claimed: false, resetAt },
        },
        missions,
        "daily-battle",
      ),
    ).toEqual({
      missionsProgress: {
        "daily-battle": { progress: 3, claimed: true, resetAt },
      },
      rewards: { gold: 100 },
      source: "mission Win Battles",
    });
  });

  it("does not claim incomplete or already claimed missions", () => {
    const resetAt = new Date(2026, 3, 23, 0, 0, 0).toISOString();

    expect(claimMissionProgress({ "daily-battle": { progress: 2, claimed: false, resetAt } }, missions, "daily-battle")).toBeNull();
    expect(claimMissionProgress({ "daily-battle": { progress: 3, claimed: true, resetAt } }, missions, "daily-battle")).toBeNull();
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

describe("mission route helpers", () => {
  it("routes risky battle missions to Arena instead of generic combat", () => {
    expect(METRIC_META.arena_battles.route).toBe("/arena");
    expect(METRIC_META.battles_won.route).toBe("/arena");
  });

  it("counts the daily and weekly battle missions from Arena/Ladder battles", () => {
    expect(DAILY_MISSIONS.find((mission) => mission.id === "d_battles_3")?.metric).toBe("arena_battles");
    expect(WEEKLY_MISSIONS.find((mission) => mission.id === "w_battles_20")?.metric).toBe("arena_battles");
  });

  it("advances risky battle missions from arena battle progress", () => {
    const progress = applyMissionMetricProgress({}, ALL_MISSIONS, "arena_battles", 1, new Date(2026, 4, 21, 12));

    expect(progress).not.toBeNull();
    if (!progress) return;
    expect(progress.d_battles_3.progress).toBe(1);
    expect(progress.d_arena_1.progress).toBe(1);
    expect(progress.w_battles_20.progress).toBe(1);
    expect(progress.d_adv_2?.progress ?? 0).toBe(0);
  });

  it("summarizes open contracts by route and prioritizes ready routes", () => {
    const resetAt = new Date(2026, 4, 22, 12).toISOString();
    const summaries = buildMissionRouteSummaries(
      [
        {
          id: "daily-arena",
          kind: "daily",
          name: "Arena",
          description: "Play arena.",
          goal: 2,
          metric: "arena_battles",
          rewards: { gold: 100 },
        },
        {
          id: "daily-claimed",
          kind: "daily",
          name: "Claimed",
          description: "Already done.",
          goal: 1,
          metric: "arena_battles",
          rewards: { gold: 100 },
        },
        {
          id: "weekly-adventure",
          kind: "weekly",
          name: "Adventure",
          description: "Clear nodes.",
          goal: 4,
          metric: "adventure_levels_cleared",
          rewards: { gems: 5 },
        },
      ],
      {
        "daily-arena": { progress: 2, claimed: false, resetAt },
        "daily-claimed": { progress: 1, claimed: true, resetAt },
        "weekly-adventure": { progress: 1, claimed: false, resetAt },
      },
    );

    expect(summaries).toMatchObject([
      {
        metric: "arena_battles",
        route: "/arena",
        active: 1,
        ready: 1,
        progress: 1,
      },
      {
        metric: "adventure_levels_cleared",
        route: "/adventure",
        active: 1,
        ready: 0,
        progress: 0.25,
      },
    ]);
  });
});
