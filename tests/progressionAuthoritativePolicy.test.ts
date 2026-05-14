import { describe, expect, it } from "vitest";
import {
  getProgressionAuthoritativePolicy,
  isProgressionCommandAuthoritative,
} from "@/lib/progressionAuthoritativePolicy";
import { PROGRESSION_COMMAND_KINDS } from "@/lib/progressionCommands";

describe("progression authoritative policy", () => {
  it("routes only stabilized progression commands through server authority", () => {
    expect(PROGRESSION_COMMAND_KINDS.map((kind) => [kind, getProgressionAuthoritativePolicy(kind)])).toEqual([
      ["hero.levelUp", { mode: "local", reason: "hero_progression_model_pending" }],
      ["hero.starUp", { mode: "local", reason: "hero_progression_model_pending" }],
      ["hero.skillUp", { mode: "local", reason: "hero_progression_model_pending" }],
      ["frontlineCard.upgrade", { mode: "authoritative", operationType: "upgradeFrontlineCard" }],
      ["fortress.upgradeBuilding", { mode: "local", reason: "fortress_progression_rpc_pending" }],
      ["frontlineFortress.upgradeBuilding", { mode: "local", reason: "fortress_progression_rpc_pending" }],
    ]);
  });

  it("exposes only Frontline card upgrades as authoritative for now", () => {
    expect(PROGRESSION_COMMAND_KINDS.filter(isProgressionCommandAuthoritative)).toEqual(["frontlineCard.upgrade"]);
  });
});
