import { describe, expect, it } from "vitest";
import {
  getProgressionAuthoritativePolicy,
  isProgressionCommandAuthoritative,
} from "@/lib/progressionAuthoritativePolicy";
import type { ProgressionCommandKind } from "@/lib/progressionCommands";

const progressionKinds: ProgressionCommandKind[] = [
  "hero.levelUp",
  "hero.starUp",
  "hero.skillUp",
  "frontlineCard.upgrade",
  "fortress.upgradeBuilding",
  "frontlineFortress.upgradeBuilding",
];

describe("progression authoritative policy", () => {
  it("keeps all progression commands local until their server-side models are stable", () => {
    expect(progressionKinds.map((kind) => [kind, getProgressionAuthoritativePolicy(kind)])).toEqual([
      ["hero.levelUp", { mode: "local", reason: "hero_progression_model_pending" }],
      ["hero.starUp", { mode: "local", reason: "hero_progression_model_pending" }],
      ["hero.skillUp", { mode: "local", reason: "hero_progression_model_pending" }],
      ["frontlineCard.upgrade", { mode: "local", reason: "card_progression_rpc_pending" }],
      ["fortress.upgradeBuilding", { mode: "local", reason: "fortress_progression_rpc_pending" }],
      ["frontlineFortress.upgradeBuilding", { mode: "local", reason: "fortress_progression_rpc_pending" }],
    ]);
  });

  it("does not expose a progression command as authoritative by accident", () => {
    expect(progressionKinds.some(isProgressionCommandAuthoritative)).toBe(false);
  });
});
