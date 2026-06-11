import {
  ADVENTURE_MAP_DESIGN,
  type AdventureMapChapterLayout,
} from "@/features/adventure/mapLayout";

export type AdventurePanelDock = "top" | "bottom";

export const ADVENTURE_PANEL_COMPACT_DOCK_SWITCH_Y = ADVENTURE_MAP_DESIGN.height * 0.58;
export const ADVENTURE_PANEL_EXPANDED_DOCK_SWITCH_Y = ADVENTURE_MAP_DESIGN.height * 0.45;

export function getAdventurePanelDockForY(
  y?: number | null,
  { expanded = false }: { expanded?: boolean } = {},
): AdventurePanelDock {
  if (typeof y !== "number") return "bottom";

  const switchY = expanded
    ? ADVENTURE_PANEL_EXPANDED_DOCK_SWITCH_Y
    : ADVENTURE_PANEL_COMPACT_DOCK_SWITCH_Y;

  return y >= switchY ? "top" : "bottom";
}

export function getAdventureSelectedFocusY({
  mapLayout,
  selectedInteractionId,
  selectedNodeId,
}: {
  mapLayout: AdventureMapChapterLayout;
  selectedInteractionId?: string | null;
  selectedNodeId: string;
}) {
  if (selectedInteractionId) {
    const selectedProp = mapLayout.props?.find((prop) => prop.interaction?.id === selectedInteractionId);
    if (selectedProp) return selectedProp.y;
  }

  return mapLayout.nodes.find((node) => node.id === selectedNodeId)?.y ?? null;
}
