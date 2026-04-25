import { describe, it, expect } from "vitest";
import {
  isHeroUnlockedByLevel,
  heroUnlockLevel,
  isEventUnlockedByLevel,
  eventUnlockLevel,
  isShopSectionUnlocked,
  nextUpcomingUnlock,
  unlocksAt,
  UNLOCKS,
} from "@/data/unlocks";

describe("unlocks table", () => {
  it("hero gating respects account level", () => {
    expect(isHeroUnlockedByLevel("ursa", 1)).toBe(false);
    expect(isHeroUnlockedByLevel("ursa", 4)).toBe(true);
    expect(isHeroUnlockedByLevel("ursa", 99)).toBe(true);
    // bran has no gate — always unlocked
    expect(isHeroUnlockedByLevel("bran", 1)).toBe(true);
  });

  it("returns the gate level for gated heroes only", () => {
    expect(heroUnlockLevel("ursa")).toBe(4);
    expect(heroUnlockLevel("bran")).toBe(null);
  });

  it("event gating", () => {
    expect(isEventUnlockedByLevel("tower_defense_1", 5)).toBe(false);
    expect(isEventUnlockedByLevel("tower_defense_1", 6)).toBe(true);
    expect(eventUnlockLevel("tower_defense_1")).toBe(6);
  });

  it("shop section gating", () => {
    expect(isShopSectionUnlocked("daily", 1)).toBe(false);
    expect(isShopSectionUnlocked("daily", 3)).toBe(true);
    expect(isShopSectionUnlocked("shards", 6)).toBe(false);
    expect(isShopSectionUnlocked("shards", 7)).toBe(true);
    expect(isShopSectionUnlocked("featured", 1)).toBe(true);
  });

  it("nextUpcomingUnlock returns the soonest unlock above current level", () => {
    const u = nextUpcomingUnlock(1);
    expect(u).toBeTruthy();
    expect(u!.level).toBe(2);
    expect(nextUpcomingUnlock(99)).toBe(null);
  });

  it("unlocksAt returns every unlock for that level", () => {
    const lvl3 = unlocksAt(3);
    expect(lvl3.length).toBeGreaterThanOrEqual(2);
    const ids = lvl3.map((u) => u.id);
    expect(ids).toContain("arena_t1");
    expect(ids).toContain("daily");
  });

  it("the table is sorted ascending by level", () => {
    let prev = 0;
    for (const u of UNLOCKS) {
      expect(u.level).toBeGreaterThanOrEqual(prev);
      prev = u.level;
    }
  });
});
