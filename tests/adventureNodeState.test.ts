import { describe, expect, it } from "vitest";
import { planAdventureLevelClear, planAdventureNodeClaim } from "@/lib/adventureNodeState";

describe("adventure node state plans", () => {
  it("plans a first clear and marks mission eligibility", () => {
    expect(planAdventureLevelClear({}, "c1l1", "2026-05-08")).toEqual({
      firstClear: true,
      adventureProgress: {
        c1l1: {
          cleared: true,
          firstClearTaken: true,
          completions: 1,
          lastCompletedAt: "2026-05-08",
        },
      },
    });
  });

  it("plans a repeated clear without first-clear eligibility", () => {
    expect(
      planAdventureLevelClear(
        {
          c1l1: {
            cleared: true,
            firstClearTaken: true,
            completions: 1,
          },
        },
        "c1l1",
        "2026-05-08",
      ),
    ).toMatchObject({
      firstClear: false,
      adventureProgress: {
        c1l1: {
          cleared: true,
          firstClearTaken: true,
          completions: 2,
        },
      },
    });
  });

  it("plans claim rewards for claimable adventure nodes", () => {
    const plan = planAdventureNodeClaim({}, "c1l3", "2026-05-08");

    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.source).toBe("Thistle Road");
    expect(plan.rewards.frontlineCards).toEqual([{ cardId: "order_shadow_dive" }]);
    expect(plan.adventureProgress.c1l3).toMatchObject({
      cleared: true,
      firstClearTaken: true,
      claimed: true,
      completions: 1,
    });
  });

  it("blocks already claimed adventure claim nodes with the existing user message", () => {
    expect(
      planAdventureNodeClaim(
        {
          c1l3: {
            cleared: true,
            firstClearTaken: true,
            claimed: true,
          },
        },
        "c1l3",
        "2026-05-08",
      ),
    ).toEqual({
      ok: false,
      notification: { kind: "info", message: "Chest already claimed" },
    });
  });

  it("returns null-like failure for unknown nodes", () => {
    expect(planAdventureNodeClaim({}, "missing", "2026-05-08")).toEqual({ ok: false });
  });
});
