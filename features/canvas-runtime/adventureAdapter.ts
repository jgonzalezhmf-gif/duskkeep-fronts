import type { AdventureMapInteractionAssetId } from "@/lib/adventureMapInteractionAssets";
import {
  ADVENTURE_NODE_ASSET_IDS,
  ADVENTURE_PROP_ASSET_IDS,
  type AdventureNodeAssetId,
  type AdventurePropAssetId,
} from "@/lib/adventureMapAssets";
import { getScreenBackgroundAsset } from "@/lib/screenBackgroundAssets";
import { HOME_EFFECT_IDS, type HomeEffectId } from "@/lib/homeEffectAssets";
import {
  ADVENTURE_MAP_DESIGN,
  type AdventureMapChapterLayout,
  type AdventureMapNodeStatus,
  type AdventureMapNodeType,
  type AdventureMapPropLayout,
  type AdventureMapPropType,
  type AdventureMapRouteState,
} from "@/components/game/adventure/adventureMapLayout";
import { buildAdventureVisualNodes } from "@/components/game/adventure/AdventureCampaignVisualNodes";
import { buildRoutes, getPropHeight, getPropVisualOpacity, getPropWidth, getRouteControls } from "@/components/game/adventure/AdventureMapGeometry";
import type { AdventureCampaignMeta, AdventureNodeState } from "@/components/game/adventure/AdventureCampaignTypes";
import type { AdventureMapInteractionKind, AdventureMapInteractionStatus } from "@/features/adventure/mapInteractions";

export type AdventureCanvasIntent =
  | { type: "selectNode"; nodeId: string }
  | { type: "selectInteraction"; interactionId: string };

export type AdventureCanvasAssetRef =
  | { manifest: "screenBackground"; id: "adventure" }
  | { manifest: "adventureNode"; id: AdventureNodeAssetId }
  | { manifest: "adventureProp"; id: AdventurePropAssetId }
  | { manifest: "adventureMapInteraction"; id: AdventureMapInteractionAssetId }
  | { manifest: "homeEffect"; id: HomeEffectId }
  | { manifest: "semanticToken"; id: AdventureMapPropType };

export type AdventureCanvasPoint = {
  x: number;
  y: number;
};

export type AdventureCanvasNodeModel = {
  id: string;
  label: string;
  accessibleLabel: string;
  index: number;
  total: number;
  position: AdventureCanvasPoint;
  size: number;
  zIndex: number;
  type: AdventureMapNodeType;
  status: AdventureMapNodeStatus;
  selected: boolean;
  assetRef: Extract<AdventureCanvasAssetRef, { manifest: "adventureNode" }>;
  stateFlags: {
    locked: boolean;
    cleared: boolean;
    current: boolean;
    claimed: boolean;
    available: boolean;
    pausedHere: boolean;
    firstClearAvailable: boolean;
  };
  intent: AdventureCanvasIntent;
};

export type AdventureCanvasRouteModel = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  state?: AdventureMapRouteState;
  pathPoints: [AdventureCanvasPoint, AdventureCanvasPoint, AdventureCanvasPoint, AdventureCanvasPoint];
};

export type AdventureCanvasPropModel = {
  id: string;
  type: AdventureMapPropType;
  position: AdventureCanvasPoint;
  dimensions: {
    width: number;
    height: number;
  };
  zIndex: number;
  opacity: number;
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  assetRef: Exclude<AdventureCanvasAssetRef, { manifest: "screenBackground" } | { manifest: "adventureNode" }>;
  effectRef?: Extract<AdventureCanvasAssetRef, { manifest: "homeEffect" }>;
  interaction?: {
    id: string;
    kind: AdventureMapInteractionKind;
    status: AdventureMapInteractionStatus;
    selected: boolean;
    intent: AdventureCanvasIntent;
  };
};

export type AdventureCanvasPartyMarkerModel = {
  anchorNodeId?: string;
  position: AdventureCanvasPoint;
  size: number;
  zIndex: number;
  style: "banner" | "token" | "camp";
  intent?: AdventureCanvasIntent;
};

export type AdventureCanvasSceneModel = {
  designSize: {
    width: number;
    height: number;
  };
  chapter: number;
  meta: Pick<AdventureCampaignMeta, "name" | "subtitle" | "accent" | "scene" | "terrainLabel" | "threatLabel">;
  background: Extract<AdventureCanvasAssetRef, { manifest: "screenBackground" }> & {
    src?: string;
    position?: string;
  };
  selected: {
    nodeId: string;
    interactionId: string | null;
  };
  nodes: AdventureCanvasNodeModel[];
  routes: AdventureCanvasRouteModel[];
  props: AdventureCanvasPropModel[];
  partyMarker: AdventureCanvasPartyMarkerModel | null;
};

export type BuildAdventureCanvasSceneModelInput = {
  meta: AdventureCampaignMeta;
  nodes: AdventureNodeState[];
  mapLayout: AdventureMapChapterLayout;
  chapter: number;
  selectedId: string;
  selectedInteractionId?: string | null;
  interactionStates?: Record<string, AdventureMapInteractionStatus>;
  qaEnabled?: boolean;
};

const NODE_ASSET_IDS = new Set<string>(ADVENTURE_NODE_ASSET_IDS);
const PROP_ASSET_IDS = new Set<string>(ADVENTURE_PROP_ASSET_IDS);
const HOME_EFFECT_ASSET_IDS = new Set<string>(HOME_EFFECT_IDS);

export function buildAdventureCanvasSceneModel({
  meta,
  nodes,
  mapLayout,
  chapter,
  selectedId,
  selectedInteractionId = null,
  interactionStates = {},
  qaEnabled = false,
}: BuildAdventureCanvasSceneModelInput): AdventureCanvasSceneModel {
  const visualNodes = buildAdventureVisualNodes({ nodes, activeLayout: mapLayout, qaEnabled });
  const routes = buildRoutes(visualNodes, mapLayout.routes).map((route): AdventureCanvasRouteModel => {
    const controls = getRouteControls(route);
    return {
      id: route.id,
      fromNodeId: route.from.id,
      toNodeId: route.to.id,
      state: route.state,
      pathPoints: [
        toPoint(route.from),
        toPoint(controls.control1),
        toPoint(controls.control2),
        toPoint(route.to),
      ],
    };
  });
  const canvasNodes = visualNodes.map((visualNode): AdventureCanvasNodeModel => {
    const id = visualNode.id;
    return {
      id,
      label: visualNode.node.lvl.name,
      accessibleLabel: `${visualNode.node.lvl.name} ${visualNode.type} ${visualNode.status}`,
      index: visualNode.node.lvl.index,
      total: visualNodes.length,
      position: toPoint(visualNode),
      size: visualNode.size ?? getDefaultNodeSize(visualNode.type),
      zIndex: visualNode.zIndex ?? 6,
      type: visualNode.type,
      status: visualNode.status,
      selected: id === selectedId,
      assetRef: { manifest: "adventureNode", id: getNodeAssetRefId(visualNode.type, visualNode.status) },
      stateFlags: {
        locked: visualNode.node.locked || visualNode.status === "locked",
        cleared: visualNode.node.cleared || visualNode.status === "cleared" || visualNode.status === "completed",
        current: visualNode.node.current || visualNode.node.pausedHere || visualNode.status === "current",
        claimed: Boolean(visualNode.node.claimed) || visualNode.status === "claimed",
        available: visualNode.status === "available" || visualNode.status === "current",
        pausedHere: visualNode.node.pausedHere,
        firstClearAvailable: visualNode.node.firstClearAvailable,
      },
      intent: { type: "selectNode", nodeId: id },
    };
  });
  const nodeById = new Map(canvasNodes.map((node) => [node.id, node]));
  const props = (mapLayout.props ?? [])
    .filter((prop) => qaEnabled || prop.enabled)
    .map((prop) => buildPropModel({ prop, interactionStates, selectedInteractionId }));

  return {
    designSize: { width: ADVENTURE_MAP_DESIGN.width, height: ADVENTURE_MAP_DESIGN.height },
    chapter,
    meta: {
      name: meta.name,
      subtitle: meta.subtitle,
      accent: meta.accent,
      scene: meta.scene,
      terrainLabel: meta.terrainLabel,
      threatLabel: meta.threatLabel,
    },
    background: buildBackgroundRef(),
    selected: {
      nodeId: selectedId,
      interactionId: selectedInteractionId,
    },
    nodes: canvasNodes,
    routes,
    props,
    partyMarker: buildPartyMarkerModel({ mapLayout, nodeById }),
  };
}

function buildPropModel({
  prop,
  interactionStates,
  selectedInteractionId,
}: {
  prop: AdventureMapPropLayout;
  interactionStates: Record<string, AdventureMapInteractionStatus>;
  selectedInteractionId: string | null;
}): AdventureCanvasPropModel {
  const interaction = prop.interaction?.enabled === false ? undefined : prop.interaction;
  const status = interaction?.id ? interactionStates[interaction.id] ?? "locked" : undefined;

  return {
    id: prop.id,
    type: prop.type,
    position: toPoint(prop),
    dimensions: {
      width: getPropWidth(prop),
      height: getPropHeight(prop),
    },
    zIndex: interaction ? Math.max(prop.zIndex, 32) : prop.zIndex,
    opacity: interaction ? prop.opacity ?? 1 : getPropVisualOpacity(prop),
    rotation: {
      x: prop.rotationX ?? 0,
      y: prop.rotationY ?? 0,
      z: prop.rotation ?? 0,
    },
    assetRef: getPropAssetRef(prop, status),
    effectRef: getPropEffectRef(prop),
    interaction: interaction?.id
      ? {
          id: interaction.id,
          kind: interaction.kind,
          status: status ?? "locked",
          selected: interaction.id === selectedInteractionId,
          intent: { type: "selectInteraction", interactionId: interaction.id },
        }
      : undefined,
  };
}

function buildPartyMarkerModel({
  mapLayout,
  nodeById,
}: {
  mapLayout: AdventureMapChapterLayout;
  nodeById: Map<string, AdventureCanvasNodeModel>;
}): AdventureCanvasPartyMarkerModel | null {
  const marker = mapLayout.partyMarker;
  if (!marker) return null;
  const anchoredNode = marker.anchorNodeId ? nodeById.get(marker.anchorNodeId) : undefined;
  const position = {
    x: marker.x ?? anchoredNode?.position.x ?? 0,
    y: marker.y ?? anchoredNode?.position.y ?? 0,
  };

  return {
    anchorNodeId: marker.anchorNodeId,
    position,
    size: marker.size,
    zIndex: marker.zIndex,
    style: marker.style,
    intent: marker.anchorNodeId ? { type: "selectNode", nodeId: marker.anchorNodeId } : undefined,
  };
}

function buildBackgroundRef(): AdventureCanvasSceneModel["background"] {
  const asset = getScreenBackgroundAsset("adventure");
  return {
    manifest: "screenBackground",
    id: "adventure",
    src: asset?.src,
    position: asset?.position,
  };
}

function getNodeAssetRefId(type: AdventureMapNodeType, status: AdventureMapNodeStatus): AdventureNodeAssetId {
  if (status === "locked") return "locked";
  if (status === "current") return "current";
  if (status === "cleared" || status === "claimed" || status === "completed") return "cleared";
  if (type === "hidden") return "secret";
  return NODE_ASSET_IDS.has(type) ? (type as AdventureNodeAssetId) : "battle";
}

function getPropAssetRef(
  prop: AdventureMapPropLayout,
  interactionStatus?: AdventureMapInteractionStatus,
): AdventureCanvasPropModel["assetRef"] {
  if (prop.interaction?.enabled !== false && prop.interaction?.kind === "keyChest") {
    return {
      manifest: "adventureMapInteraction",
      id: getInteractionAssetId(interactionStatus ?? "locked"),
    };
  }

  if (PROP_ASSET_IDS.has(prop.type)) {
    return { manifest: "adventureProp", id: prop.type as AdventurePropAssetId };
  }

  if (HOME_EFFECT_ASSET_IDS.has(prop.type)) {
    return { manifest: "homeEffect", id: prop.type as HomeEffectId };
  }

  return { manifest: "semanticToken", id: prop.type };
}

function getPropEffectRef(prop: AdventureMapPropLayout): AdventureCanvasPropModel["effectRef"] {
  const effectType = prop.effect?.type;
  if (!effectType || prop.effect?.enabled === false || !HOME_EFFECT_ASSET_IDS.has(effectType)) {
    return undefined;
  }

  return { manifest: "homeEffect", id: effectType };
}

function getInteractionAssetId(status: AdventureMapInteractionStatus): AdventureMapInteractionAssetId {
  if (status === "ready") return "key_chest_claimable";
  if (status === "needs_key") return "key_chest_needed";
  if (status === "claimed") return "key_chest_claimed";
  return "key_chest_locked";
}

function getDefaultNodeSize(type: AdventureMapNodeType): number {
  if (type === "boss") return 68;
  if (type === "chest") return 54;
  return 48;
}

function toPoint(point: { x: number; y: number }): AdventureCanvasPoint {
  return { x: point.x, y: point.y };
}
