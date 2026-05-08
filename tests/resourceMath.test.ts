import { describe, expect, it } from "vitest";
import { applyRewardResources, canAfford, spendResources } from "@/lib/resourceMath";
import type { Resources } from "@/lib/types";

const baseResources: Resources = {
  gold: 100,
  dust: 20,
  gems: 5,
  arenaTickets: 2,
  adventureKeys: 1,
};

describe("resource math", () => {
  it("applies reward resources without losing existing fields", () => {
    expect(applyRewardResources(baseResources, { gold: 25, dust: 3, gems: 2, arenaTickets: 1, adventureKeys: 4 })).toEqual({
      gold: 125,
      dust: 23,
      gems: 7,
      arenaTickets: 3,
      adventureKeys: 5,
    });
  });

  it("checks affordability across resource types", () => {
    expect(canAfford(baseResources, { gold: 100, dust: 20, gems: 5, adventureKeys: 1 })).toBe(true);
    expect(canAfford(baseResources, { gold: 101 })).toBe(false);
    expect(canAfford(baseResources, { adventureKeys: 2 })).toBe(false);
  });

  it("spends only provided resource costs", () => {
    expect(spendResources(baseResources, { gold: 40, adventureKeys: 1 })).toEqual({
      gold: 60,
      dust: 20,
      gems: 5,
      arenaTickets: 2,
      adventureKeys: 0,
    });
  });
});
