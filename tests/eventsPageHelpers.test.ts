import { describe, expect, it } from "vitest";
import { buildEventFocus, type FrontlineEventOperation } from "@/app/events/eventsPageHelpers";

function operation(overrides: Partial<FrontlineEventOperation> & Pick<FrontlineEventOperation, "id">): FrontlineEventOperation {
  return {
    id: overrides.id,
    name: overrides.name ?? overrides.id,
    eyebrow: "Rotating Event",
    description: "Test operation",
    presetId: "bonewood_raiders",
    rewards: { gold: 10 },
    unlockLevel: overrides.unlockLevel ?? 1,
    tone: overrides.tone ?? "gold",
    icon: overrides.icon ?? "daily_event",
    signature: "Test signal",
    mutator: "Test mutator",
    threat: overrides.threat ?? "common",
    firstClearRewards: overrides.firstClearRewards,
  };
}

describe("events page helpers", () => {
  it("highlights deck setup before recommending an operation", () => {
    const focus = buildEventFocus({
      operations: [operation({ id: "gold_rush" })],
      loadoutReady: false,
      level: 10,
      isDoneToday: () => false,
    });

    expect(focus).toMatchObject({
      operation: { id: "gold_rush" },
      state: "deck",
      reasonKey: "eventsScreen.focus.deckReason",
    });
  });

  it("recommends the first unlocked operation not cleared today", () => {
    const focus = buildEventFocus({
      operations: [operation({ id: "gold_rush" }), operation({ id: "arcane_surge" })],
      loadoutReady: true,
      level: 10,
      isDoneToday: (id) => id === "gold_rush",
    });

    expect(focus).toMatchObject({
      operation: { id: "arcane_surge" },
      state: "ready",
      reasonKey: "eventsScreen.focus.readyReason",
    });
  });

  it("shows the next locked operation when all available operations are cleared", () => {
    const focus = buildEventFocus({
      operations: [operation({ id: "gold_rush" }), operation({ id: "fortress_siege", unlockLevel: 8 })],
      loadoutReady: true,
      level: 3,
      isDoneToday: () => true,
    });

    expect(focus).toMatchObject({
      operation: { id: "fortress_siege" },
      state: "locked",
      reasonKey: "eventsScreen.focus.lockedReason",
    });
  });
});
