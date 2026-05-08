import { describe, expect, it } from "vitest";
import { createDefaultFrontlineFortress } from "@/features/frontline/fortress";
import { defaultFortress } from "@/lib/defaultGameState";
import {
  applyFortressBuildingUpgrade,
  applyFrontlineFortressUpgrade,
  fortressBattleBonuses,
  fortressIncomePreview,
  getFortressBuildingUpgradePlan,
  getFortressIncomeRewards,
  getFrontlineFortressUpgradePlan,
  markFortressIncomeCollected,
  setFrontlineFortressGarrisonSlot,
} from "@/lib/fortressState";

describe("fortress state helpers", () => {
  it("previews and converts passive fortress income to rewards", () => {
    const now = new Date("2026-05-08T08:00:00.000Z");
    const fortress = {
      ...defaultFortress(),
      buildings: {
        ...defaultFortress().buildings,
        treasury: 2,
        arcane_spire: 1,
        market_square: 2,
      },
      lastCollectedAt: "2026-05-08T04:00:00.000Z",
    };

    expect(fortressIncomePreview(fortress, now)).toEqual({
      hours: 4,
      gold: 320,
      dust: 32,
      gems: 1,
    });
    expect(getFortressIncomeRewards(fortress, now)).toEqual({ gold: 320, dust: 32, gems: 1 });
  });

  it("returns no income reward when no income elapsed", () => {
    const now = new Date("2026-05-08T08:00:00.000Z");
    const fortress = {
      ...defaultFortress(),
      lastCollectedAt: now.toISOString(),
    };

    expect(getFortressIncomeRewards(fortress, now)).toBeNull();
  });

  it("marks income collection without changing buildings", () => {
    const fortress = defaultFortress();
    const collected = markFortressIncomeCollected(fortress, "2026-05-08T09:00:00.000Z");

    expect(collected.lastCollectedAt).toBe("2026-05-08T09:00:00.000Z");
    expect(collected.buildings).toEqual(fortress.buildings);
  });

  it("plans and applies normal fortress upgrades", () => {
    const fortress = defaultFortress();
    const plan = getFortressBuildingUpgradePlan(fortress, "treasury");

    expect(plan).toEqual({ ok: true, name: "Royal Treasury", cost: { gold: 388, dust: undefined, gems: undefined } });
    expect(applyFortressBuildingUpgrade(fortress, "treasury").buildings.treasury).toBe(2);
  });

  it("blocks normal fortress upgrades at max level", () => {
    const fortress = {
      ...defaultFortress(),
      buildings: {
        ...defaultFortress().buildings,
        treasury: 10,
      },
    };

    expect(getFortressBuildingUpgradePlan(fortress, "treasury")).toEqual({ ok: false, reason: "max_level" });
  });

  it("calculates battle bonuses from fortress buildings", () => {
    const fortress = {
      ...defaultFortress(),
      buildings: {
        ...defaultFortress().buildings,
        bastion_walls: 3,
        war_academy: 6,
      },
    };

    expect(fortressBattleBonuses(fortress)).toEqual({ leaderHpBonus: 30, startingHandBonus: 2 });
  });

  it("plans and applies frontline fortress upgrades", () => {
    const fortress = createDefaultFrontlineFortress();
    const plan = getFrontlineFortressUpgradePlan(fortress, "keep");

    expect(plan).toEqual({ ok: true, name: "Keep", cost: { gold: 120, dust: 8 } });
    expect(applyFrontlineFortressUpgrade(fortress, "keep").buildings.keep).toBe(2);
  });

  it("keeps a hero in only one frontline garrison slot", () => {
    const fortress = {
      ...createDefaultFrontlineFortress(),
      garrison: ["bran", "kara", "mira"] as [string | null, string | null, string | null],
    };

    expect(setFrontlineFortressGarrisonSlot(fortress, 2, "bran").garrison).toEqual([null, "kara", "bran"]);
  });
});
