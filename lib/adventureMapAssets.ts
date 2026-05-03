export const ADVENTURE_NODE_ASSET_IDS = [
  "battle",
  "chest",
  "boss",
  "locked",
  "current",
  "cleared",
  "elite",
  "event",
  "shrine",
  "merchant",
  "secret",
  "danger",
] as const;

export type AdventureNodeAssetId = (typeof ADVENTURE_NODE_ASSET_IDS)[number];

export const ADVENTURE_PROP_ASSET_IDS = [
  "campfire",
  "small_camp",
  "road_lantern",
  "ruin_marker",
  "hidden_glow",
  "merchant_cart",
  "hidden_glow_alt",
] as const;

export type AdventurePropAssetId = (typeof ADVENTURE_PROP_ASSET_IDS)[number];

type AdventureMapAsset = {
  src: string;
  expectedFile: string;
};

export const ADVENTURE_NODE_ASSETS: Partial<Record<AdventureNodeAssetId, AdventureMapAsset>> = {
  battle: { src: "/assets/adventures/nodes/battle_node.png", expectedFile: "battle_node.png" },
  chest: { src: "/assets/adventures/nodes/chest_node.png", expectedFile: "chest_node.png" },
  boss: { src: "/assets/adventures/nodes/boss_node.png", expectedFile: "boss_node.png" },
  locked: { src: "/assets/adventures/nodes/locked_node.png", expectedFile: "locked_node.png" },
  current: { src: "/assets/adventures/nodes/current_marker.png", expectedFile: "current_marker.png" },
  cleared: { src: "/assets/adventures/nodes/cleared_node.png", expectedFile: "cleared_node.png" },
  elite: { src: "/assets/adventures/nodes/elite_node.png", expectedFile: "elite_node.png" },
  event: { src: "/assets/adventures/nodes/event_node.png", expectedFile: "event_node.png" },
  shrine: { src: "/assets/adventures/nodes/shrine_node.png", expectedFile: "shrine_node.png" },
  merchant: { src: "/assets/adventures/nodes/merchant_node.png", expectedFile: "merchant_node.png" },
  secret: { src: "/assets/adventures/nodes/secret_node.png", expectedFile: "secret_node.png" },
  danger: { src: "/assets/adventures/nodes/danger_node.png", expectedFile: "danger_node.png" },
};

export const ADVENTURE_PROP_ASSETS: Partial<Record<AdventurePropAssetId, AdventureMapAsset>> = {
  campfire: { src: "/assets/adventures/props/campfire_prop.png", expectedFile: "campfire_prop.png" },
  small_camp: { src: "/assets/adventures/props/small_camp_prop.png", expectedFile: "small_camp_prop.png" },
  road_lantern: { src: "/assets/adventures/props/road_lantern_prop.png", expectedFile: "road_lantern_prop.png" },
  ruin_marker: { src: "/assets/adventures/props/ruin_marker_prop.png", expectedFile: "ruin_marker_prop.png" },
  hidden_glow: { src: "/assets/adventures/props/hidden_glow_prop.png", expectedFile: "hidden_glow_prop.png" },
  merchant_cart: { src: "/assets/adventures/props/merchant_cart_prop.png", expectedFile: "merchant_cart_prop.png" },
  hidden_glow_alt: { src: "/assets/adventures/props/hidden_glow_alt.png", expectedFile: "hidden_glow_alt.png" },
};

export function getAdventureNodeAsset(id: AdventureNodeAssetId) {
  return ADVENTURE_NODE_ASSETS[id] ?? null;
}

export function getAdventurePropAsset(id: AdventurePropAssetId) {
  return ADVENTURE_PROP_ASSETS[id] ?? null;
}
