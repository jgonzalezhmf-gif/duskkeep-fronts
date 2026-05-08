import {
  ADVENTURE_MAP_INTERACTIONS_BY_ID,
  getAdventureMapInteractionStatus,
  rollAdventureMapInteractionLoot,
} from "@/features/adventure/mapInteractions";
import type {
  AdventureMapInteractionClaim,
  AdventureMapInteractionDefinition,
  AdventureMapInteractionOpenResult,
} from "@/features/adventure/mapInteractions";
import type { AdventureProgressEntry } from "@/features/adventure/nodeResolution";
import { markAdventureMapInteractionClaimed } from "@/lib/adventureProgressState";
import type { Resources } from "@/lib/types";

type ClaimFailure = {
  ok: false;
  notification: {
    kind: "error" | "info";
    message: string;
  };
};

type ClaimSuccess = {
  ok: true;
  interaction: AdventureMapInteractionDefinition;
  result: AdventureMapInteractionOpenResult;
  nextClaims: Record<string, AdventureMapInteractionClaim>;
};

export function createAdventureMapInteractionClaimPlan({
  interactionId,
  progress,
  resources,
  claims,
  claimedAt,
  seed,
}: {
  interactionId: string;
  progress: Record<string, AdventureProgressEntry>;
  resources: Pick<Resources, "adventureKeys">;
  claims: Record<string, AdventureMapInteractionClaim>;
  claimedAt: string;
  seed?: number;
}): ClaimFailure | ClaimSuccess {
  const interaction = ADVENTURE_MAP_INTERACTIONS_BY_ID[interactionId];
  if (!interaction) {
    return { ok: false, notification: { kind: "error", message: "Map interaction not found" } };
  }

  const status = getAdventureMapInteractionStatus({
    interaction,
    progress,
    resources,
    claim: claims[interactionId],
  });
  if (status === "claimed") {
    return { ok: false, notification: { kind: "info", message: "Map cache already claimed" } };
  }
  if (status === "locked") {
    return { ok: false, notification: { kind: "error", message: "Map cache is still sealed" } };
  }
  if (status === "needs_key") {
    return { ok: false, notification: { kind: "error", message: "Adventure key required" } };
  }

  const result = rollAdventureMapInteractionLoot(interaction, seed);
  return {
    ok: true,
    interaction,
    result,
    nextClaims: markAdventureMapInteractionClaimed(claims, interaction, result, claimedAt),
  };
}
