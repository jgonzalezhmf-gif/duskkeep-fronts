import { describe, expect, it } from "vitest";
import { planLocalEventResult } from "@/features/events/resultState";

describe("event local result planning", () => {
  it("grants rewards for an unclaimed daily event victory", () => {
    expect(
      planLocalEventResult({
        eventCompletions: {},
        eventId: "gold_rush",
        winner: "ally",
        rewards: { gold: 120, accountXp: 6 },
        today: "2026-05-28",
      }),
    ).toEqual({
      won: true,
      firstClear: true,
      rewards: { gold: 120, accountXp: 6 },
    });
  });

  it("does not grant repeat daily rewards for the same event day", () => {
    expect(
      planLocalEventResult({
        eventCompletions: { gold_rush: "2026-05-28" },
        eventId: "gold_rush",
        winner: "ally",
        rewards: { gold: 120, accountXp: 6 },
        today: "2026-05-28",
      }),
    ).toEqual({
      won: true,
      firstClear: false,
      rewards: {},
    });
  });

  it("does not grant rewards on draw or defeat", () => {
    expect(
      planLocalEventResult({
        eventCompletions: {},
        eventId: "gold_rush",
        winner: "draw",
        rewards: { gold: 120 },
        today: "2026-05-28",
      }),
    ).toEqual({
      won: false,
      firstClear: false,
      rewards: {},
    });
  });
});
