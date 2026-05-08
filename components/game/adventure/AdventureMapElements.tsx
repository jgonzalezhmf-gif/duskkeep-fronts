import type { AdventureVisualNode } from "./AdventureCampaignTypes";
export { AdventureMapInteractionStyles } from "./AdventureMapPropVisuals";
export { AdventureMapRoute, RouteControlHandle, RouteRune } from "./AdventureMapRouteElements";
export { AdventureMapNode } from "./AdventureMapNodeElement";
export { AdventurePartyMarker } from "./AdventurePartyMarkerElement";
export { AdventureMapProp } from "./AdventureMapPropElement";

export function isCompletedPartyNode(node: AdventureVisualNode) {
  return node.status === "cleared" || node.status === "claimed" || node.status === "completed";
}
