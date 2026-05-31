import { describe, expect, it } from "vitest";
import { FRONTLINE_ARENA_RIVALS } from "@/app/arena/arenaPageHelpers";
import { FRONTLINE_PRESET_BY_ID } from "@/features/frontline/data";
import { createDefaultFrontlineLoadout, createFrontlineBattleState } from "@/features/frontline/engine";
import {
  arenaTrialModifiersForRival,
  getArenaTrialMutatorForRival,
} from "@/features/arena/trialMutators";

describe("arena trial mutators", () => {
  it("assigns a visible mutator to every trial rival", () => {
    for (const rival of FRONTLINE_ARENA_RIVALS) {
      const mutator = getArenaTrialMutatorForRival(rival.id);

      expect(mutator, rival.id).toBeTruthy();
      expect(mutator?.labelKey).toMatch(/^arenaScreen\.trialMutators\./);
      expect(mutator?.descriptionKey).toMatch(/^arenaScreen\.trialMutators\./);
      expect(Object.values(mutator?.modifiers ?? {}).some((value) => (value ?? 0) > 0)).toBe(true);
    }
  });

  it("maps trial rivals to lightweight combat modifiers", () => {
    expect(arenaTrialModifiersForRival("arena_bonewood")).toEqual({ enemyStartingCommandBonus: 1 });
    expect(arenaTrialModifiersForRival("arena_plague")).toEqual({ enemyCoreBonus: 2 });
    expect(arenaTrialModifiersForRival("arena_ember")).toEqual({ enemyCoreBonus: 4, enemyStartingCommandBonus: 1 });
    expect(arenaTrialModifiersForRival("unknown")).toBeUndefined();
  });

  it("feeds trial modifiers into Frontline battle state without changing allied setup", () => {
    const preset = FRONTLINE_PRESET_BY_ID[FRONTLINE_ARENA_RIVALS[2].presetId];
    const state = createFrontlineBattleState({
      seed: 91,
      allyLoadout: createDefaultFrontlineLoadout(),
      enemyPreset: preset,
      modifiers: arenaTrialModifiersForRival("arena_ember"),
    });

    expect(state.enemyCoreHp).toBe(state.enemyCoreMaxHp);
    expect(state.enemyCoreHp).toBe(28);
    expect(state.enemyStartCommandBonus).toBe(1);
    expect(state.allyCoreHp).toBe(state.allyCoreMaxHp);
  });
});
