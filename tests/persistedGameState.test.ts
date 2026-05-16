import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defaultInitial } from "@/lib/defaultGameState";
import { mergePersistedGameState } from "@/lib/persistedGameState";
import { createPersistedGameStoreState } from "@/lib/storePersistence";
import type { GameState } from "@/lib/store";

function currentState(): GameState {
  return {
    ...defaultInitial(),
    hydrated: false,
    notifications: [],
  };
}

describe("persisted game state merge", () => {
  const originalPersistence = process.env.NEXT_PUBLIC_PERSISTENCE;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_PERSISTENCE = "local";
  });

  afterEach(() => {
    if (originalPersistence === undefined) {
      delete process.env.NEXT_PUBLIC_PERSISTENCE;
      return;
    }
    process.env.NEXT_PUBLIC_PERSISTENCE = originalPersistence;
  });

  it("keeps newly introduced adventureKeys default when persisted resources are older", () => {
    const merged = mergePersistedGameState(
      { resources: { gold: 25 } },
      currentState(),
    );

    expect(merged.resources.gold).toBe(25);
    expect(merged.resources.adventureKeys).toBe(0);
  });

  it("keeps intro unseen by default for older saves", () => {
    const merged = mergePersistedGameState(
      { resources: { gold: 25 } },
      currentState(),
    );

    expect(merged.hasSeenIntro).toBe(false);
  });

  it("preserves intro completion for returning players", () => {
    const merged = mergePersistedGameState(
      { hasSeenIntro: true },
      currentState(),
    );

    expect(merged.hasSeenIntro).toBe(true);
  });

  it("keeps account linking undecided by default for older saves", () => {
    const merged = mergePersistedGameState(
      { resources: { gold: 25 } },
      currentState(),
    );

    expect(merged.accountLinkMode).toBe("undecided");
  });

  it("preserves the account linking choice for returning players", () => {
    const merged = mergePersistedGameState(
      { accountLinkMode: "guest" },
      currentState(),
    );

    expect(merged.accountLinkMode).toBe("guest");
  });

  it("sanitizes unknown account linking values", () => {
    const merged = mergePersistedGameState(
      { accountLinkMode: "admin" },
      currentState(),
    );

    expect(merged.accountLinkMode).toBe("undecided");
  });

  it("sanitizes persisted deck ids against registered cards", () => {
    const merged = mergePersistedGameState(
      { activeDeck: ["spell_battle_hymn", "missing_card"] },
      currentState(),
    );

    expect(merged.activeDeck).toEqual(["spell_battle_hymn", null]);
  });

  it("migrates old heroes with missing skill levels", () => {
    const merged = mergePersistedGameState(
      {
        heroes: [
          { heroId: "bran", level: 3, stars: 1, shards: 0, xp: 10 },
        ],
      },
      currentState(),
    );

    expect(merged.heroes[0]).toMatchObject({
      heroId: "bran",
      skillLevel: 1,
    });
  });

  it("ignores persisted sensitive state when Supabase persistence is enabled", () => {
    process.env.NEXT_PUBLIC_PERSISTENCE = "supabase";
    const merged = mergePersistedGameState(
      {
        resources: { gold: 99999, gems: 99999, adventureKeys: 99 },
        adventureProgress: { c1l12: { cleared: true, firstClearTaken: true } },
        adventureMapClaims: { "c1-lower-cache": { claimed: true } },
        heroes: [{ heroId: "bran", level: 60, stars: 6, shards: 9999, xp: 9999, skillLevel: 5 }],
        accountLinkMode: "linked",
        hasSeenIntro: true,
        audioMuted: true,
      },
      currentState(),
    );

    expect(merged.resources).toEqual(defaultInitial().resources);
    expect(merged.adventureProgress).toEqual({});
    expect(merged.adventureMapClaims).toEqual({});
    expect(merged.heroes.find((hero) => hero.heroId === "bran")?.level).toBe(1);
    expect(merged.accountLinkMode).toBe("linked");
    expect(merged.hasSeenIntro).toBe(true);
    expect(merged.audioMuted).toBe(true);
  });

  it("persists only client-safe fields when Supabase persistence is enabled", () => {
    process.env.NEXT_PUBLIC_PERSISTENCE = "supabase";
    const state = {
      ...currentState(),
      resources: { gold: 99999, dust: 99999, gems: 99999, arenaTickets: 99, adventureKeys: 99 },
      adventureProgress: { c1l1: { cleared: true, firstClearTaken: true } },
      accountLinkMode: "linked" as const,
      hasSeenIntro: true,
      audioMuted: true,
      musicVolume: 0.5,
    };

    const persisted = createPersistedGameStoreState(state);

    expect(persisted).toMatchObject({
      accountLinkMode: "linked",
      hasSeenIntro: true,
      audioMuted: true,
      musicVolume: 0.5,
    });
    expect(persisted.resources).toBeUndefined();
    expect(persisted.adventureProgress).toBeUndefined();
    expect(persisted.heroes).toBeUndefined();
    expect(persisted.frontlineLoadout).toBeUndefined();
  });
});
