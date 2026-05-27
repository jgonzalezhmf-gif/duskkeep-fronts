import type { AdventureMapInteractionStatus } from "@/features/adventure/mapInteractions";

export type AdventureMapInteractionAssetId = "key_chest_locked" | "key_chest_needed" | "key_chest_claimable" | "key_chest_claimed";
export type AdventureMapInteractionEffectAssetId = "gold_shine_loop";

const INTERACTION_ROOT = "/assets/adventures/interactions";
const INTERACTION_EFFECT_ROOT = "/assets/adventures/effects";

export const ADVENTURE_MAP_INTERACTION_ASSETS: Record<AdventureMapInteractionAssetId, string> = {
  key_chest_locked: `${INTERACTION_ROOT}/key_chest_locked.webp`,
  key_chest_needed: `${INTERACTION_ROOT}/key_chest_needed.webp`,
  key_chest_claimable: `${INTERACTION_ROOT}/key_chest_claimable.webp`,
  key_chest_claimed: `${INTERACTION_ROOT}/key_chest_claimed.webp`,
};

export const ADVENTURE_MAP_INTERACTION_EFFECT_ASSETS: Record<AdventureMapInteractionEffectAssetId, { src: string; frameCount: number }> = {
  gold_shine_loop: { src: `${INTERACTION_EFFECT_ROOT}/gold_shine_loop_core_aligned.webp`, frameCount: 5 },
};

export function getAdventureMapInteractionAsset(status: AdventureMapInteractionStatus) {
  if (status === "ready") return ADVENTURE_MAP_INTERACTION_ASSETS.key_chest_claimable;
  if (status === "needs_key") return ADVENTURE_MAP_INTERACTION_ASSETS.key_chest_needed;
  if (status === "claimed") return ADVENTURE_MAP_INTERACTION_ASSETS.key_chest_claimed;
  return ADVENTURE_MAP_INTERACTION_ASSETS.key_chest_locked;
}

export function getAdventureMapInteractionEffectAsset(id: AdventureMapInteractionEffectAssetId) {
  return ADVENTURE_MAP_INTERACTION_EFFECT_ASSETS[id] ?? null;
}
