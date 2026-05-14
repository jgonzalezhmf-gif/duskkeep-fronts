import type { ProgressionCommandKind } from "@/lib/progressionCommands";

export type ProgressionAuthoritativeHoldReason =
  | "hero_progression_model_pending"
  | "card_progression_rpc_pending"
  | "fortress_progression_rpc_pending";

export type ProgressionAuthoritativePolicy =
  | {
      mode: "local";
      reason: ProgressionAuthoritativeHoldReason;
    }
  | {
      mode: "authoritative";
      operationType: "levelUpHero" | "starUpHero" | "skillUpHero" | "upgradeFrontlineCard";
    };

const PROGRESSION_AUTHORITATIVE_POLICY: Record<ProgressionCommandKind, ProgressionAuthoritativePolicy> = {
  "hero.levelUp": { mode: "authoritative", operationType: "levelUpHero" },
  "hero.starUp": { mode: "authoritative", operationType: "starUpHero" },
  "hero.skillUp": { mode: "authoritative", operationType: "skillUpHero" },
  "frontlineCard.upgrade": { mode: "authoritative", operationType: "upgradeFrontlineCard" },
  "fortress.upgradeBuilding": { mode: "local", reason: "fortress_progression_rpc_pending" },
  "frontlineFortress.upgradeBuilding": { mode: "local", reason: "fortress_progression_rpc_pending" },
};

export function getProgressionAuthoritativePolicy(kind: ProgressionCommandKind): ProgressionAuthoritativePolicy {
  return PROGRESSION_AUTHORITATIVE_POLICY[kind];
}

export function isProgressionCommandAuthoritative(kind: ProgressionCommandKind) {
  return getProgressionAuthoritativePolicy(kind).mode === "authoritative";
}
