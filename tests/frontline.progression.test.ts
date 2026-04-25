import { describe, expect, it } from "vitest";
import {
  createDefaultFrontlineCardUnlocks,
  isFrontlineCardUnlocked,
  sanitizeFrontlineCardUnlocks,
} from "@/features/frontline/cardProgression";
import { getFrontlineCardUnlockSource } from "@/features/frontline/cardUnlockSources";
import { getFrontlineAdventureRewardPreview, getFrontlineAdventureVictoryRewards } from "@/features/frontline/adventure";
import { ADVENTURE_BY_ID } from "@/data/adventure";

describe("frontline card progression", () => {
  it("unlocks the starter deck by default and keeps non-starter cards locked", () => {
    const unlocks = createDefaultFrontlineCardUnlocks();

    expect(isFrontlineCardUnlocked(unlocks, "order_guard_wall")).toBe(true);
    expect(isFrontlineCardUnlocked(unlocks, "order_shadow_dive")).toBe(false);
  });

  it("sanitizes persisted unlocks without losing starter cards", () => {
    const unlocks = sanitizeFrontlineCardUnlocks({
      order_shadow_dive: true,
      unknown_card: true,
    });

    expect(isFrontlineCardUnlocked(unlocks, "order_guard_wall")).toBe(true);
    expect(isFrontlineCardUnlocked(unlocks, "order_shadow_dive")).toBe(true);
    expect(unlocks.unknown_card).toBeUndefined();
  });

  it("derives Adventure first-clear unlock sources from reward data", () => {
    expect(getFrontlineCardUnlockSource("order_shadow_dive")).toMatchObject({
      kind: "adventure_first_clear",
      levelId: "c1l3",
      chapter: 1,
      index: 3,
    });
    expect(getFrontlineCardUnlockSource("tactic_core_burst")).toMatchObject({
      levelId: "c1l7",
      chapter: 1,
      index: 7,
    });
    expect(getFrontlineCardUnlockSource("summon_totem")).toMatchObject({
      levelId: "c1l10",
      chapter: 1,
      index: 10,
    });
  });

  it("previews Adventure first-clear card rewards only while available", () => {
    const level = ADVENTURE_BY_ID.c1l3;

    expect(getFrontlineAdventureRewardPreview(level, undefined).frontlineCards).toEqual([
      { cardId: "order_shadow_dive" },
    ]);
    expect(
      getFrontlineAdventureRewardPreview(level, { cleared: true, firstClearTaken: true }).frontlineCards,
    ).toBeUndefined();
  });

  it("grants Adventure first-clear card rewards only on first victory", () => {
    const level = ADVENTURE_BY_ID.c1l7;

    expect(getFrontlineAdventureVictoryRewards(level, true).frontlineCards).toEqual([
      { cardId: "tactic_core_burst" },
    ]);
    expect(getFrontlineAdventureVictoryRewards(level, false).frontlineCards).toBeUndefined();
  });
});
