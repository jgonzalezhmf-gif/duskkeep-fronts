import { describe, expect, it } from "vitest";
import { createLocalSyncSnapshot, LOCAL_SYNC_SNAPSHOT_VERSION } from "@/lib/localSyncSnapshot";
import { defaultInitial } from "@/lib/defaultGameState";
import type { GameState } from "@/lib/storeTypes";

function currentState(): GameState {
  return {
    ...defaultInitial(),
    hydrated: true,
    notifications: [],
  };
}

describe("local sync snapshot", () => {
  it("exports only the whitelisted account progression fields", () => {
    const state = currentState();
    const snapshot = createLocalSyncSnapshot(state);

    expect(LOCAL_SYNC_SNAPSHOT_VERSION).toBe("1");
    expect(snapshot).toMatchObject({
      account: {
        name: "Commander",
        level: 1,
        xp: 0,
      },
      resources: {
        gold: 500,
        dust: 50,
        gems: 50,
        arenaTickets: 5,
        adventureKeys: 0,
      },
      frontlineLoadout: state.frontlineLoadout,
    });
    expect(JSON.stringify(snapshot)).not.toContain("notifications");
    expect(JSON.stringify(snapshot)).not.toContain("audioMuted");
    expect(JSON.stringify(snapshot)).not.toContain("accountLinkMode");
    expect(JSON.stringify(snapshot)).not.toContain("hasSeenIntro");
  });
});
