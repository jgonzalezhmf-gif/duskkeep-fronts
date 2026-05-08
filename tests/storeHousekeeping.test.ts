import { describe, expect, it } from "vitest";
import {
  addNotificationState,
  completeOnboardingState,
  dismissNotificationState,
  markEventCompletedState,
  nextStoreSeed,
  refreshArenaTicketsState,
  refreshShopState,
  saveBattleState,
  setOnboardingStepState,
} from "@/lib/storeHousekeeping";
import type { TacticalState } from "@/features/tactical/types";

const resources = {
  gold: 100,
  dust: 10,
  gems: 5,
  arenaTickets: 1,
  adventureKeys: 0,
};

const tacticalState = {
  grid: { w: 3, h: 3 },
  obstacles: [],
  units: [],
  round: 1,
  side: "ally",
  selectedUid: null,
  mode: "idle",
  log: [],
  winner: null,
  seed: 1,
} satisfies TacticalState;

describe("store housekeeping helpers", () => {
  it("adds and dismisses notifications", () => {
    const notifications = addNotificationState([], "success", "Saved", "n1");

    expect(notifications).toEqual([{ id: "n1", kind: "success", message: "Saved" }]);
    expect(dismissNotificationState(notifications, "n1")).toEqual([]);
  });

  it("advances the deterministic store seed", () => {
    expect(nextStoreSeed(1)).toBe(1015568748);
  });

  it("marks event completions and increments play counts", () => {
    expect(
      markEventCompletedState({
        eventCompletions: {},
        eventsPlayed: { event_a: 1 },
        eventId: "event_a",
        today: "2026-05-08",
      }),
    ).toEqual({
      eventCompletions: { event_a: "2026-05-08" },
      eventsPlayed: { event_a: 2 },
    });
  });

  it("refreshes daily shop only when day changes", () => {
    expect(refreshShopState("2026-05-08", "2026-05-08")).toBeNull();
    expect(refreshShopState("2026-05-07", "2026-05-08")).toEqual({
      shopRefreshedAt: "2026-05-08",
      dailyShopPurchases: {},
    });
  });

  it("refreshes arena tickets without lowering existing tickets", () => {
    expect(refreshArenaTicketsState({ arenaTicketsRefreshedAt: "2026-05-08", resources, today: "2026-05-08", dailyArenaTickets: 5 })).toBeNull();
    expect(
      refreshArenaTicketsState({
        arenaTicketsRefreshedAt: "2026-05-07",
        resources: { ...resources, arenaTickets: 9 },
        today: "2026-05-08",
        dailyArenaTickets: 5,
      })?.resources.arenaTickets,
    ).toBe(9);
  });

  it("does not persist completed battles", () => {
    expect(saveBattleState("c1l1", tacticalState)).toEqual({ savedBattle: { levelId: "c1l1", state: tacticalState } });
    expect(saveBattleState("c1l1", { ...tacticalState, winner: "ally" })).toEqual({ savedBattle: null });
  });

  it("updates onboarding state", () => {
    expect(setOnboardingStepState({ step: 1, completed: false }, 2)).toEqual({ step: 2, completed: false });
    expect(completeOnboardingState()).toEqual({ step: 99, completed: true });
  });
});
