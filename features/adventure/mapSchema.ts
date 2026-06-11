import type { HomeEffectId } from "@/lib/homeEffectAssets";

export const ADVENTURE_MAP_DESIGN = {
  width: 1920,
  height: 1080,
} as const;

export type AdventureMapNodeType =
  | "battle"
  | "elite"
  | "boss"
  | "chest"
  | "shrine"
  | "merchant"
  | "event"
  | "locked"
  | "hidden"
  | "danger";

export type AdventureMapNodeStatus = "locked" | "available" | "cleared" | "current" | "completed" | "claimed" | "hidden";

export type AdventureMapRouteState = "cleared" | "available" | "locked" | "boss";

export type AdventureNodeLayout = {
  id?: string;
  x: number;
  y: number;
  type?: AdventureMapNodeType;
  status?: AdventureMapNodeStatus;
  size?: number;
  zIndex?: number;
  connectsTo?: string[];
};

export type AdventureMapRouteLayout = {
  id: string;
  from: string;
  to: string;
  state?: AdventureMapRouteState;
  control1?: { x: number; y: number };
  control2?: { x: number; y: number };
};

export type AdventureMapPropType =
  | "key_chest"
  | "campfire"
  | "small_camp"
  | "road_lantern"
  | "ruin_marker"
  | "hidden_glow"
  | "merchant_cart"
  | "hidden_glow_alt"
  | "flame_loop"
  | "flag_red_loop"
  | "portal_blue_loop"
  | "crystal_purple_loop"
  | "blue_flame_loop"
  | "purple_flame_loop"
  | "lantern_warm_loop"
  | "candle_loop"
  | "banner_red_loop"
  | "crow_fly_loop"
  | "clouds_dark_layer"
  | "chest_prop"
  | "camp_prop";

export type AdventureMapPropEffectLayout = {
  type: HomeEffectId;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  opacity?: number;
  durationMs?: number;
  enabled?: boolean;
};

export type AdventureMapPropLayout = {
  id: string;
  type: AdventureMapPropType;
  x: number;
  y: number;
  size?: number;
  width?: number;
  height?: number;
  rotation?: number;
  rotationX?: number;
  rotationY?: number;
  zIndex: number;
  opacity?: number;
  enabled: boolean;
  effect?: AdventureMapPropEffectLayout;
  interaction?: {
    id: string;
    kind: "keyChest";
    keyCost?: number;
    unlockAfter?: string[];
    rewardId?: string;
    enabled?: boolean;
  };
};

export type AdventureMapPartyMarkerLayout = {
  x?: number;
  y?: number;
  size: number;
  zIndex: number;
  anchorNodeId?: string;
  style: "banner" | "token" | "camp";
};

export type AdventureMapChapterLayout = {
  nodes: AdventureNodeLayout[];
  routes?: AdventureMapRouteLayout[];
  props?: AdventureMapPropLayout[];
  partyMarker?: AdventureMapPartyMarkerLayout;
};

export const ADVENTURE_MAP_NODE_TYPES: AdventureMapNodeType[] = [
  "battle",
  "elite",
  "boss",
  "chest",
  "shrine",
  "merchant",
  "event",
  "locked",
  "hidden",
  "danger",
];

export const ADVENTURE_MAP_NODE_STATUSES: AdventureMapNodeStatus[] = [
  "locked",
  "available",
  "cleared",
  "current",
  "completed",
  "claimed",
  "hidden",
];

export const ADVENTURE_MAP_PROP_TYPES: AdventureMapPropType[] = [
  "key_chest",
  "campfire",
  "small_camp",
  "road_lantern",
  "ruin_marker",
  "hidden_glow",
  "merchant_cart",
  "hidden_glow_alt",
  "flame_loop",
  "flag_red_loop",
  "portal_blue_loop",
  "crystal_purple_loop",
  "blue_flame_loop",
  "purple_flame_loop",
  "lantern_warm_loop",
  "candle_loop",
  "banner_red_loop",
  "crow_fly_loop",
  "clouds_dark_layer",
  "chest_prop",
  "camp_prop",
];

export const ADVENTURE_MAP_INTERACTION_KINDS = ["keyChest"] as const;
