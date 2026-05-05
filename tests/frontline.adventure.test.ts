import { describe, expect, it } from "vitest";
import { ADVENTURE } from "@/data/adventure";
import { FRONTLINE_PRESET_BY_ID } from "@/features/frontline/data";
import { getFrontlinePresetForAdventure, getFrontlinePresetIdForAdventure } from "@/features/frontline/adventure";

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
    for (const bossLevel of bossLevels) {
      expect(getFrontlinePresetForAdventure(bossLevel).bossId, bossLevel.id).toBeTruthy();
    }
  });
});
