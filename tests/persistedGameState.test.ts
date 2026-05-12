import { describe, expect, it } from "vitest";
import { defaultInitial } from "@/lib/defaultGameState";
import { mergePersistedGameState } from "@/lib/persistedGameState";
import type { GameState } from "@/lib/store";

function currentState(): GameState {
  return {
    ...defaultInitial(),
    hydrated: false,
    notifications: [],
  };
}

describe("persisted game state merge", () => {
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
});
