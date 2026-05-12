import { describe, expect, it, vi } from "vitest";
import { applyProgressionCommandResultToStore } from "@/lib/progressionCommandStoreAdapter";
import type { GameActions, GameState } from "@/lib/storeTypes";
import type { ProgressionCommandResult } from "@/lib/progressionCommands";
import type { ProgressionStoreSet } from "@/lib/progressionCommandStoreAdapter";

describe("progression command store adapter", () => {
  it("applies command patches and emits mission progress before notifications", () => {
    const pushNotification = vi.fn();
    const updateMissionProgress = vi.fn();
    const state = {
      heroesUpgraded: 2,
      pushNotification,
      updateMissionProgress,
    } as unknown as GameState & GameActions;
    const set: ProgressionStoreSet = vi.fn((partial) => {
      Object.assign(state, typeof partial === "function" ? partial(state) : partial);
    });
    const get = () => state;
    const command: ProgressionCommandResult = {
      ok: true,
      kind: "hero.levelUp",
      patch: { resources: { gold: 10, dust: 2, gems: 0, arenaTickets: 0, adventureKeys: 0 } },
      effects: [
        { missionProgress: { metric: "heroes_upgraded", amount: 1 } },
        { notification: { kind: "success", message: "Upgraded" } },
      ],
    };

    expect(applyProgressionCommandResultToStore(command, set, get)).toBe(true);
    expect(state.resources).toEqual({ gold: 10, dust: 2, gems: 0, arenaTickets: 0, adventureKeys: 0 });
    expect(state.heroesUpgraded).toBe(3);
    expect(updateMissionProgress).toHaveBeenCalledWith("heroes_upgraded", 1);
    expect(pushNotification).toHaveBeenCalledWith("success", "Upgraded");
  });

  it("emits failure notifications without mutating state", () => {
    const pushNotification = vi.fn();
    const set = vi.fn();
    const get = () => ({ pushNotification }) as unknown as GameState & GameActions;
    const command: ProgressionCommandResult = {
      ok: false,
      kind: "frontlineCard.upgrade",
      effects: [{ notification: { kind: "error", message: "Not enough resources" } }],
    };

    expect(applyProgressionCommandResultToStore(command, set, get)).toBe(false);
    expect(set).not.toHaveBeenCalled();
    expect(pushNotification).toHaveBeenCalledWith("error", "Not enough resources");
  });
});
