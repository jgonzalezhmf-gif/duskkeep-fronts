import { describe, expect, it } from "vitest";
import { createAdventureMapInteractionClaimPlan } from "@/lib/adventureMapInteractionClaims";

describe("adventure map interaction claim planning", () => {
  const claimedAt = "2026-05-08T10:00:00.000Z";

  it("returns an error notification for unknown interactions", () => {
    expect(
      createAdventureMapInteractionClaimPlan({
        interactionId: "missing-cache",
        progress: {},
        resources: { adventureKeys: 1 },
        claims: {},
        claimedAt,
      }),
    ).toEqual({
      ok: false,
      notification: { kind: "error", message: "Map interaction not found" },
    });
  });

  it("blocks locked interactions before route progress", () => {
    expect(
      createAdventureMapInteractionClaimPlan({
        interactionId: "c1-lower-cache",
        progress: {},
        resources: { adventureKeys: 1 },
        claims: {},
        claimedAt,
      }),
    ).toEqual({
      ok: false,
      notification: { kind: "error", message: "Map cache is still sealed" },
    });
  });

  it("requires an adventure key for unlocked interactions", () => {
    expect(
      createAdventureMapInteractionClaimPlan({
        interactionId: "c1-lower-cache",
        progress: { c1l2: { cleared: true, firstClearTaken: true } },
        resources: { adventureKeys: 0 },
        claims: {},
        claimedAt,
      }),
    ).toEqual({
      ok: false,
      notification: { kind: "error", message: "Adventure key required" },
    });
  });

  it("blocks active claims during the reset window", () => {
    expect(
      createAdventureMapInteractionClaimPlan({
        interactionId: "c1-lower-cache",
        progress: { c1l2: { cleared: true, firstClearTaken: true } },
        resources: { adventureKeys: 1 },
        claims: {
          "c1-lower-cache": { claimed: true, claimedAt },
        },
        claimedAt,
        now: new Date("2026-05-08T12:00:00.000Z"),
      }),
    ).toEqual({
      ok: false,
      notification: { kind: "info", message: "Map cache already claimed" },
    });
  });

  it("creates deterministic loot and next claim state for ready interactions", () => {
    const plan = createAdventureMapInteractionClaimPlan({
      interactionId: "c1-lower-cache",
      progress: { c1l2: { cleared: true, firstClearTaken: true } },
      resources: { adventureKeys: 1 },
      claims: {},
      claimedAt,
      seed: 42,
    });

    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.interaction.id).toBe("c1-lower-cache");
    expect(plan.result.interactionId).toBe("c1-lower-cache");
    expect(plan.nextClaims["c1-lower-cache"]).toMatchObject({
      claimed: true,
      claimedAt,
      lootId: plan.result.lootId,
      rewards: plan.result.rewards,
    });
  });
});
