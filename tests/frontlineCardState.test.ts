import { describe, expect, it } from "vitest";
import { createDefaultFrontlineCardUnlocks } from "@/features/frontline/cardProgression";
import { planFrontlineCardUnlock, planFrontlineCardUpgrade } from "@/lib/frontlineCardState";

describe("frontline card state plans", () => {
  it("unlocks registered non-starter cards", () => {
    const unlocks = createDefaultFrontlineCardUnlocks();

    expect(planFrontlineCardUnlock(unlocks, "order_shadow_dive")).toEqual({
      ok: true,
      frontlineCardUnlocks: {
        ...unlocks,
        order_shadow_dive: true,
      },
    });
  });

  it("does not unlock unknown or already unlocked cards", () => {
    const unlocks = createDefaultFrontlineCardUnlocks();

    expect(planFrontlineCardUnlock(unlocks, "unknown_card")).toEqual({ ok: false });
    expect(planFrontlineCardUnlock(unlocks, "order_guard_wall")).toEqual({ ok: false });
  });

  it("plans card upgrades with the current cost curve", () => {
    const unlocks = { ...createDefaultFrontlineCardUnlocks(), order_shadow_dive: true };

    expect(
      planFrontlineCardUpgrade({
        unlocks,
        levels: { order_shadow_dive: 2 },
        cardId: "order_shadow_dive",
      }),
    ).toEqual({
      ok: true,
      cost: { gold: 180, dust: 28 },
      frontlineCardLevels: { order_shadow_dive: 3 },
      nextLevel: 3,
    });
  });

  it("blocks unknown, locked, and max-level card upgrades", () => {
    const unlocks = createDefaultFrontlineCardUnlocks();

    expect(planFrontlineCardUpgrade({ unlocks, levels: {}, cardId: "unknown_card" })).toEqual({ ok: false });
    expect(planFrontlineCardUpgrade({ unlocks, levels: {}, cardId: "order_shadow_dive" })).toEqual({ ok: false });
    expect(planFrontlineCardUpgrade({ unlocks, levels: { order_guard_wall: 5 }, cardId: "order_guard_wall" })).toEqual({
      ok: false,
      reason: "Card already at max level",
    });
  });
});
