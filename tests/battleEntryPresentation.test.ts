import { describe, expect, it } from "vitest";
import {
  battleEntryCopyKeys,
  battleEntryDurationMs,
  battleEntryTheme,
  BATTLE_ENTRY_NORMAL_DURATION_MS,
  BATTLE_ENTRY_REDUCED_MOTION_DURATION_MS,
} from "@/features/frontline/battleEntryPresentation";

describe("battle entry presentation", () => {
  it("uses shorter timing for reduced motion", () => {
    expect(battleEntryDurationMs(false)).toBe(BATTLE_ENTRY_NORMAL_DURATION_MS);
    expect(battleEntryDurationMs(true)).toBe(BATTLE_ENTRY_REDUCED_MOTION_DURATION_MS);
    expect(BATTLE_ENTRY_REDUCED_MOTION_DURATION_MS).toBeLessThan(BATTLE_ENTRY_NORMAL_DURATION_MS);
  });

  it("starts each battle mode with its matching music theme", () => {
    expect(battleEntryTheme("adventure")).toBe("battle");
    expect(battleEntryTheme("boss")).toBe("boss");
    expect(battleEntryTheme("ladder")).toBe("ladder");
    expect(battleEntryTheme("arena")).toBe("arena_trials");
    expect(battleEntryTheme("event")).toBe("event");
  });

  it("keeps battle-entry copy grouped by mode", () => {
    expect(battleEntryCopyKeys("adventure")).toMatchObject({
      eyebrowKey: "battleEntry.adventure.eyebrow",
      fallbackTitleKey: "battleEntry.adventure.title",
      subtitleKey: "battleEntry.adventure.subtitle",
    });
    expect(battleEntryCopyKeys("direct").fallbackTitleKey).toBe("battleEntry.direct.title");
  });
});
