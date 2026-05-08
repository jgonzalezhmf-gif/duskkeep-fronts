import { describe, expect, it } from "vitest";
import { ADVENTURE_BY_ID } from "@/data/adventure";
import {
  accountProgressPercent,
  deriveEncounterBadge,
  encounterModifiers,
  heroPreviewPower,
  projectAccountProgress,
  resolveBattleBackgroundKey,
} from "@/components/game/frontline/frontlineBattlePageLogic";

describe("frontline battle page logic", () => {
  it("derives encounter badges from adventure node type", () => {
    expect(deriveEncounterBadge(ADVENTURE_BY_ID.c1l1)).toBeNull();
    expect(deriveEncounterBadge(ADVENTURE_BY_ID.c1l5)).toBe("elite");
    expect(deriveEncounterBadge(ADVENTURE_BY_ID.c1l12)).toBe("boss");
  });

  it("maps encounter badges to combat modifiers", () => {
    expect(encounterModifiers(null)).toBeUndefined();
    expect(encounterModifiers("elite")).toEqual({ enemyCoreBonus: 2 });
    expect(encounterModifiers("boss")).toEqual({ enemyCoreBonus: 5, enemyStartingCommandBonus: 1 });
  });

  it("resolves battle backgrounds by chapter and encounter kind", () => {
    expect(resolveBattleBackgroundKey(ADVENTURE_BY_ID.c1l1, null, undefined)).toBe("ch1_battle_road");
    expect(resolveBattleBackgroundKey(ADVENTURE_BY_ID.c1l5, "elite", undefined)).toBe("ch1_battle_ruins");
    expect(resolveBattleBackgroundKey(ADVENTURE_BY_ID.c1l12, "boss", "the_eclipse")).toBe("ch1_boss_eclipse_gate");
    expect(resolveBattleBackgroundKey({ chapter: 2 }, null, undefined)).toBeNull();
    expect(resolveBattleBackgroundKey({ chapter: 2 }, null, "the_eclipse")).toBe("ch1_boss_eclipse_gate");
  });

  it("projects account xp through multiple level thresholds", () => {
    expect(projectAccountProgress(1, 90, 20)).toEqual({ level: 2, xp: 10 });
    expect(projectAccountProgress(2, 190, 250)).toEqual({ level: 3, xp: 240 });
  });

  it("clamps account progress percent", () => {
    expect(accountProgressPercent(1, -10)).toBe(0);
    expect(accountProgressPercent(1, 50)).toBe(50);
    expect(accountProgressPercent(1, 150)).toBe(100);
  });

  it("calculates preview power for lane matchup readouts", () => {
    expect(heroPreviewPower(null)).toBe(0);
    expect(heroPreviewPower({ maxHp: 10, atk: 2, def: 3, speed: 4 })).toBe(26);
  });
});
