import type { AdventureMapChapterLayout } from "./adventureMapLayout";
import type { AdventureNodeState, AdventureVisualNode } from "./AdventureCampaignTypes";
import { deriveNodeStatus, deriveNodeType } from "./AdventureMapStateHelpers";

type BuildAdventureVisualNodesParams = {
  nodes: AdventureNodeState[];
  activeLayout: AdventureMapChapterLayout;
  qaEnabled: boolean;
};

export function buildAdventureVisualNodes({ nodes, activeLayout, qaEnabled }: BuildAdventureVisualNodesParams): AdventureVisualNode[] {
  const realIds = new Set(nodes.map((node) => node.lvl.id));
  const baseNodes = nodes.map((node, index): AdventureVisualNode => {
    const id = node.lvl.id;
    const layout =
      activeLayout.nodes.find((entry) => entry.id === id) ??
      activeLayout.nodes[index] ??
      activeLayout.nodes[activeLayout.nodes.length - 1] ??
      { x: 280 + index * 130, y: 820 - index * 42 };
    const type = layout.type ?? deriveNodeType(node, index, nodes.length);
    const status = qaEnabled && layout.status ? layout.status : deriveNodeStatus(node);
    return {
      id,
      node,
      x: layout.x,
      y: layout.y,
      size: layout.size,
      zIndex: layout.zIndex,
      type: qaEnabled ? type : status === "locked" ? "locked" : type,
      status,
      connectsTo: layout.connectsTo ?? (nodes[index + 1] ? [nodes[index + 1].lvl.id] : []),
    };
  });

  if (!qaEnabled) return baseNodes;

  const editorOnlyNodes = activeLayout.nodes
    .filter((entry) => entry.id && !realIds.has(entry.id))
    .map((layout, index): AdventureVisualNode => {
      const id = layout.id ?? `qa-node-${index + 1}`;
      return {
        id,
        node: {
          lvl: {
            id,
            chapter: 0,
            index: baseNodes.length + index + 1,
            name: id,
            enemyTeam: [],
            rewards: {},
            recommendedPower: 0,
          },
          cleared: false,
          locked: false,
          current: false,
          pausedHere: false,
          firstClearAvailable: false,
        },
        x: layout.x,
        y: layout.y,
        size: layout.size,
        zIndex: layout.zIndex,
        type: layout.type ?? "battle",
        status: layout.status ?? "available",
        connectsTo: layout.connectsTo ?? [],
      };
    });

  return [...baseNodes, ...editorOnlyNodes];
}
