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
      operationType: "upgradeFrontlineCard";
    };

const PROGRESSION_AUTHORITATIVE_POLICY: Record<ProgressionCommandKind, ProgressionAuthoritativePolicy> = {
  "hero.levelUp": { mode: "local", reason: "hero_progression_model_pending" },
  "hero.starUp": { mode: "local", reason: "hero_progression_model_pending" },
  "hero.skillUp": { mode: "local", reason: "hero_progression_model_pending" },
  "frontlineCard.upgrade": { mode: "local", reason: "card_progression_rpc_pending" },
  "fortress.upgradeBuilding": { mode: "local", reason: "fortress_progression_rpc_pending" },
  "frontlineFortress.upgradeBuilding": { mode: "local", reason: "fortress_progression_rpc_pending" },
};

export function getProgressionAuthoritativePolicy(kind: ProgressionCommandKind): ProgressionAuthoritativePolicy {
  return PROGRESSION_AUTHORITATIVE_POLICY[kind];
}

export function isProgressionCommandAuthoritative(kind: ProgressionCommandKind) {
  return getProgressionAuthoritativePolicy(kind).mode === "authoritative";
}
