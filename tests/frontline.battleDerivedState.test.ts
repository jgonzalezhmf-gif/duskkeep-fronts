import { describe, expect, it } from "vitest";
import { getCoreShockChange } from "@/components/game/frontline/FrontlineBattleDerivedState";

describe("frontline battle derived state", () => {
  it("returns null when neither core loses hp", () => {
    expect(getCoreShockChange({ ally: 20, enemy: 18 }, { ally: 20, enemy: 18 }, 1)).toBeNull();
  });

  it("tracks ally core damage", () => {
    expect(getCoreShockChange({ ally: 20, enemy: 18 }, { ally: 16, enemy: 18 }, 2)).toEqual({
      side: "ally",
      amount: 4,
      key: 2,
    });
  });

  it("tracks enemy core damage", () => {
    expect(getCoreShockChange({ ally: 20, enemy: 18 }, { ally: 20, enemy: 13 }, 3)).toEqual({
      side: "enemy",
      amount: 5,
      key: 3,
    });
  });

  it("prefers ally when both cores lose the same amount", () => {
    expect(getCoreShockChange({ ally: 20, enemy: 18 }, { ally: 17, enemy: 15 }, 4)).toEqual({
      side: "ally",
      amount: 3,
      key: 4,
    });
  });
});
