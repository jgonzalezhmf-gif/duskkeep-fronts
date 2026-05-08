import type { AdventureMapPropLayout, AdventureMapPropType, AdventureMapRouteLayout, AdventureNodeLayout } from "./adventureMapLayout";
import type { AdventureMapEditorSelection, AdventureVisualNode } from "./AdventureCampaignTypes";
import { ADVENTURE_MAP_DESIGN } from "./adventureMapLayout";
import { clamp, getDefaultPropDimensions, getDefaultPropEffect } from "./AdventureMapGeometry";

const DESIGN_WIDTH = ADVENTURE_MAP_DESIGN.width;
const DESIGN_HEIGHT = ADVENTURE_MAP_DESIGN.height;

export function createEditorProp(type: AdventureMapPropType, cursor: { x: number; y: number } | null, suffix = Date.now().toString(36)): AdventureMapPropLayout {
  const id = `${type}-${suffix}`;
  const dimensions = getDefaultPropDimensions(type);
  return {
    id,
    type,
    x: cursor?.x ?? Math.round(DESIGN_WIDTH * 0.42),
    y: cursor?.y ?? Math.round(DESIGN_HEIGHT * 0.5),
    width: dimensions.width,
    height: dimensions.height,
    zIndex: 35,
    opacity: 1,
    enabled: true,
    ...(getDefaultPropEffect(type) ? { effect: getDefaultPropEffect(type) } : {}),
    ...(type === "key_chest"
      ? {
          interaction: {
            id: "c1-lower-cache",
            kind: "keyChest" as const,
            keyCost: 1,
            unlockAfter: ["c1l2"],
            rewardId: "c1-lower-cache",
            enabled: true,
          },
        }
      : {}),
  };
}

export function createEditorNode(cursor: { x: number; y: number } | null, suffix = Date.now().toString(36)): AdventureNodeLayout {
  return {
    id: `qa-node-${suffix}`,
    x: cursor?.x ?? DESIGN_WIDTH / 2,
    y: cursor?.y ?? DESIGN_HEIGHT / 2,
    type: "battle",
    status: "available",
    size: 48,
    zIndex: 20,
    connectsTo: [],
  };
}

export function createEditorRouteFromSelection(
  selection: AdventureMapEditorSelection | null,
  visualNodes: AdventureVisualNode[],
  suffix = Date.now().toString(36),
): AdventureMapRouteLayout | null {
  const from = selection?.kind === "node" ? selection.id : visualNodes[0]?.id;
  const to = visualNodes.find((node) => node.id !== from)?.id;
  if (!from || !to) return null;
  const fromNode = visualNodes.find((node) => node.id === from);
  const toNode = visualNodes.find((node) => node.id === to);
  if (!fromNode || !toNode) return null;
  return {
    id: `${from}-${to}-${suffix}`,
    from,
    to,
    state: "available",
    control1: { x: Math.round(fromNode.x + (toNode.x - fromNode.x) * 0.34), y: Math.round(fromNode.y - 60) },
    control2: { x: Math.round(fromNode.x + (toNode.x - fromNode.x) * 0.66), y: Math.round(toNode.y + 60) },
  };
}

export function duplicateEditorNode(source: AdventureNodeLayout, sourceId: string, suffix = Date.now().toString(36)): AdventureNodeLayout {
  return {
    ...source,
    id: `${sourceId}-copy-${suffix}`,
    x: clamp(source.x + 42, 0, DESIGN_WIDTH),
    y: clamp(source.y + 42, 0, DESIGN_HEIGHT),
    connectsTo: [],
  };
}

export function duplicateEditorProp(source: AdventureMapPropLayout, sourceId: string, suffix = Date.now().toString(36)): AdventureMapPropLayout {
  return {
    ...source,
    id: `${sourceId}-copy-${suffix}`,
    x: clamp(source.x + 36, 0, DESIGN_WIDTH),
    y: clamp(source.y + 36, 0, DESIGN_HEIGHT),
  };
}
