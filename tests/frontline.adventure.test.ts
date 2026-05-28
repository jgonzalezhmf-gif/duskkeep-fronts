import { describe, expect, it } from "vitest";
import { ADVENTURE } from "@/data/adventure";
import { FRONTLINE_PRESET_BY_ID } from "@/features/frontline/data";
import {
  FRONTLINE_ADVENTURE_DEFEAT_REWARDS,
  FRONTLINE_ADVENTURE_DRAW_REWARDS,
  getFrontlinePresetForAdventure,
  getFrontlinePresetIdForAdventure,
} from "@/features/frontline/adventure";

describe("frontline adventure presets", () => {
  it("uses explicit Frontline presets for every Adventure node", () => {
    expect(ADVENTURE.length).toBeGreaterThan(0);

    for (const level of ADVENTURE) {
      expect(level.frontlinePresetId, level.id).toBeTruthy();
      expect(FRONTLINE_PRESET_BY_ID[level.frontlinePresetId!], level.id).toBeTruthy();
      expect(getFrontlinePresetIdForAdventure(level)).toBe(level.frontlinePresetId);
    }
  });

  it("keeps boss nodes on boss-grade enemy presets", () => {
    const bossLevels = ADVENTURE.filter((level) => /boss/i.test(level.name));

    expect(bossLevels.map((level) => getFrontlinePresetForAdventure(level).id)).toEqual([
      "the_eclipse",
      "crown_of_ashes",
    ]);
    const eclipse = bossLevels.find((level) => level.id === "c1l12")!;
    expect(getFrontlinePresetForAdventure(eclipse).bossId).toBe("the_eclipse");
  });

  it("keeps non-victory Adventure rewards centralized for store orchestration", () => {
    expect(FRONTLINE_ADVENTURE_DRAW_REWARDS).toEqual({ gold: 20, dust: 2, gems: 0, accountXp: 1 });
    expect(FRONTLINE_ADVENTURE_DEFEAT_REWARDS).toEqual({ gold: 0, dust: 0, gems: 0, accountXp: 0 });
  });
});
