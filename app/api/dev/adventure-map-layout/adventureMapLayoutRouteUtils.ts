import path from "node:path";

import {
  ADVENTURE_MAP_NODE_STATUSES,
  ADVENTURE_MAP_NODE_TYPES,
  ADVENTURE_MAP_PROP_TYPES,
  type AdventureMapChapterLayout,
  type AdventureMapNodeStatus,
  type AdventureMapNodeType,
  type AdventureMapPropType,
  type AdventureMapRouteState,
} from "@/components/game/adventure/adventureMapLayout";
import { HOME_EFFECT_IDS, type HomeEffectId } from "@/lib/homeEffectAssets";

const VALID_NODE_TYPES = new Set<AdventureMapNodeType>(ADVENTURE_MAP_NODE_TYPES);
const VALID_NODE_STATUSES = new Set<AdventureMapNodeStatus>(ADVENTURE_MAP_NODE_STATUSES);
const VALID_PROP_TYPES = new Set<AdventureMapPropType>(ADVENTURE_MAP_PROP_TYPES);
const VALID_HOME_EFFECTS = new Set<HomeEffectId>(HOME_EFFECT_IDS);
const VALID_ROUTE_STATES = new Set<AdventureMapRouteState>(["cleared", "available", "locked", "boss"]);
const VALID_PARTY_STYLES = new Set(["banner", "token", "camp"]);
const VALID_INTERACTION_KINDS = new Set(["keyChest"]);

export const TARGET_FILE = path.join(process.cwd(), "components", "game", "adventure", "adventureMapLayout.ts");

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim().length ? value.trim() : null;
}

function normalizePoint(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const point = value as { x?: unknown; y?: unknown };
  if (!isFiniteNumber(point.x) || !isFiniteNumber(point.y)) return undefined;
  return { x: round(point.x), y: round(point.y) };
}

function normalizeNode(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const node = value as Record<string, unknown>;
  if (!isFiniteNumber(node.x) || !isFiniteNumber(node.y)) return null;
  const id = cleanString(node.id);
  const type = VALID_NODE_TYPES.has(node.type as AdventureMapNodeType) ? (node.type as AdventureMapNodeType) : undefined;
  const status = VALID_NODE_STATUSES.has(node.status as AdventureMapNodeStatus) ? (node.status as AdventureMapNodeStatus) : undefined;
  const connectsTo = Array.isArray(node.connectsTo) ? node.connectsTo.map(cleanString).filter((item): item is string => Boolean(item)) : undefined;
  return {
    ...(id ? { id } : {}),
    x: round(node.x),
    y: round(node.y),
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    ...(isFiniteNumber(node.size) ? { size: Math.max(1, round(node.size)) } : {}),
    ...(isFiniteNumber(node.zIndex) ? { zIndex: Math.round(node.zIndex) } : {}),
    ...(connectsTo?.length ? { connectsTo } : {}),
  };
}

function normalizeRoute(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const route = value as Record<string, unknown>;
  const id = cleanString(route.id);
  const from = cleanString(route.from);
  const to = cleanString(route.to);
  if (!id || !from || !to) return null;
  const state = VALID_ROUTE_STATES.has(route.state as AdventureMapRouteState) ? (route.state as AdventureMapRouteState) : undefined;
  return {
    id,
    from,
    to,
    ...(state ? { state } : {}),
    ...(normalizePoint(route.control1) ? { control1: normalizePoint(route.control1) } : {}),
    ...(normalizePoint(route.control2) ? { control2: normalizePoint(route.control2) } : {}),
  };
}

function normalizeProp(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const prop = value as Record<string, unknown>;
  const id = cleanString(prop.id);
  if (!id || !VALID_PROP_TYPES.has(prop.type as AdventureMapPropType) || !isFiniteNumber(prop.x) || !isFiniteNumber(prop.y)) return null;
  const effect = normalizePropEffect(prop.effect);
  const fallbackSize = isFiniteNumber(prop.size) ? Math.max(1, round(prop.size)) : undefined;
  const width = isFiniteNumber(prop.width) ? Math.max(1, round(prop.width)) : fallbackSize;
  const height = isFiniteNumber(prop.height) ? Math.max(1, round(prop.height)) : fallbackSize;
  if (!width || !height) return null;
  return {
    id,
    type: prop.type as AdventureMapPropType,
    x: round(prop.x),
    y: round(prop.y),
    ...(isFiniteNumber(prop.size) && !isFiniteNumber(prop.width) && !isFiniteNumber(prop.height) ? { size: fallbackSize } : { width, height }),
    ...(isFiniteNumber(prop.rotation) ? { rotation: round(prop.rotation) } : {}),
    ...(isFiniteNumber(prop.rotationX) ? { rotationX: round(prop.rotationX) } : {}),
    ...(isFiniteNumber(prop.rotationY) ? { rotationY: round(prop.rotationY) } : {}),
    zIndex: isFiniteNumber(prop.zIndex) ? Math.round(prop.zIndex) : 20,
    ...(isFiniteNumber(prop.opacity) ? { opacity: Math.round(Math.min(1, Math.max(0, prop.opacity)) * 100) / 100 } : {}),
    enabled: typeof prop.enabled === "boolean" ? prop.enabled : true,
    ...(effect ? { effect } : {}),
    ...(normalizeInteraction(prop.interaction) ? { interaction: normalizeInteraction(prop.interaction) } : {}),
  };
}

function normalizeInteraction(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const interaction = value as Record<string, unknown>;
  const id = cleanString(interaction.id);
  const kind = cleanString(interaction.kind);
  if (!id || !kind || !VALID_INTERACTION_KINDS.has(kind)) return undefined;
  const unlockAfter = Array.isArray(interaction.unlockAfter) ? interaction.unlockAfter.map(cleanString).filter((item): item is string => Boolean(item)) : undefined;
  const rewardId = cleanString(interaction.rewardId);
  return {
    id,
    kind: "keyChest" as const,
    ...(isFiniteNumber(interaction.keyCost) ? { keyCost: Math.max(0, Math.round(interaction.keyCost)) } : {}),
    ...(unlockAfter?.length ? { unlockAfter } : {}),
    ...(rewardId ? { rewardId } : {}),
    ...(typeof interaction.enabled === "boolean" ? { enabled: interaction.enabled } : {}),
  };
}

function normalizePropEffect(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const effect = value as Record<string, unknown>;
  if (!VALID_HOME_EFFECTS.has(effect.type as HomeEffectId)) return undefined;
  if (
    !isFiniteNumber(effect.xPercent) ||
    !isFiniteNumber(effect.yPercent) ||
    !isFiniteNumber(effect.widthPercent) ||
    !isFiniteNumber(effect.heightPercent)
  ) {
    return undefined;
  }
  return {
    type: effect.type as HomeEffectId,
    xPercent: round(effect.xPercent),
    yPercent: round(effect.yPercent),
    widthPercent: Math.max(1, round(effect.widthPercent)),
    heightPercent: Math.max(1, round(effect.heightPercent)),
    ...(isFiniteNumber(effect.opacity) ? { opacity: Math.round(Math.min(1, Math.max(0, effect.opacity)) * 100) / 100 } : {}),
    ...(isFiniteNumber(effect.durationMs) ? { durationMs: Math.max(1, Math.round(effect.durationMs)) } : {}),
    ...(typeof effect.enabled === "boolean" ? { enabled: effect.enabled } : {}),
  };
}

function normalizeParty(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const party = value as Record<string, unknown>;
  if (!isFiniteNumber(party.size) || !isFiniteNumber(party.zIndex)) return undefined;
  const style = VALID_PARTY_STYLES.has(String(party.style)) ? (party.style as "banner" | "token" | "camp") : "banner";
  const anchorNodeId = cleanString(party.anchorNodeId);
  return {
    ...(isFiniteNumber(party.x) ? { x: round(party.x) } : {}),
    ...(isFiniteNumber(party.y) ? { y: round(party.y) } : {}),
    size: Math.max(1, round(party.size)),
    zIndex: Math.round(party.zIndex),
    ...(anchorNodeId ? { anchorNodeId } : {}),
    style,
  };
}

export function normalizeLayout(value: unknown): AdventureMapChapterLayout | null {
  if (!value || typeof value !== "object") return null;
  const layout = value as Record<string, unknown>;
  if (!Array.isArray(layout.nodes)) return null;
  const nodes = layout.nodes.map(normalizeNode);
  if (!nodes.length || nodes.some((node) => node === null)) return null;
  const routes = Array.isArray(layout.routes) ? layout.routes.map(normalizeRoute) : [];
  if (routes.some((route) => route === null)) return null;
  const props = Array.isArray(layout.props) ? layout.props.map(normalizeProp) : [];
  if (props.some((prop) => prop === null)) return null;
  return {
    nodes: nodes as AdventureMapChapterLayout["nodes"],
    ...(routes.length ? { routes: routes as AdventureMapChapterLayout["routes"] } : {}),
    ...(props.length ? { props: props as AdventureMapChapterLayout["props"] } : {}),
    ...(normalizeParty(layout.partyMarker) ? { partyMarker: normalizeParty(layout.partyMarker) } : {}),
  };
}

function keyToTs(value: string) {
  return /^[a-zA-Z_$][\w$]*$/.test(value) ? value : JSON.stringify(value);
}

function serialize(value: unknown, indent = 0): string {
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    const nextIndent = indent + 2;
    return `[\n${value.map((item) => `${" ".repeat(nextIndent)}${serialize(item, nextIndent)}`).join(",\n")}\n${" ".repeat(indent)}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, item]) => item !== undefined);
    if (!entries.length) return "{}";
    const nextIndent = indent + 2;
    return `{\n${entries.map(([key, item]) => `${" ".repeat(nextIndent)}${keyToTs(key)}: ${serialize(item, nextIndent)}`).join(",\n")}\n${" ".repeat(indent)}}`;
  }

  return JSON.stringify(value);
}

export function renderAdventureMapLayout(layouts: Record<number, AdventureMapChapterLayout>) {
  return `import type { HomeEffectId } from "@/lib/homeEffectAssets";

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

export const ADVENTURE_MAP_CHAPTER_LAYOUTS: Record<number, AdventureMapChapterLayout> = ${serialize(layouts, 0)};
`;
}
