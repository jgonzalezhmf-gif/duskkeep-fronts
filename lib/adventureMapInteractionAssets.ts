import type { AdventureMapInteractionStatus } from "@/features/adventure/mapInteractions";

export type AdventureMapInteractionAssetId = "key_chest_locked" | "key_chest_needed" | "key_chest_claimable" | "key_chest_claimed";

const INTERACTION_ROOT = "/assets/adventures/interactions";

export const ADVENTURE_MAP_INTERACTION_ASSETS: Record<AdventureMapInteractionAssetId, string> = {
  key_chest_locked: `${INTERACTION_ROOT}/key_chest_locked.png`,
  key_chest_needed: `${INTERACTION_ROOT}/key_chest_needed.png`,
  key_chest_claimable: `${INTERACTION_ROOT}/key_chest_claimable.png`,
  key_chest_claimed: `${INTERACTION_ROOT}/key_chest_claimed.png`,
};

export function getAdventureMapInteractionAsset(status: AdventureMapInteractionStatus) {
  if (status === "ready") return ADVENTURE_MAP_INTERACTION_ASSETS.key_chest_claimable;
  if (status === "needs_key") return ADVENTURE_MAP_INTERACTION_ASSETS.key_chest_needed;
  if (status === "claimed") return ADVENTURE_MAP_INTERACTION_ASSETS.key_chest_claimed;
  return ADVENTURE_MAP_INTERACTION_ASSETS.key_chest_locked;
}
