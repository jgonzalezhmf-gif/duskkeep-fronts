import { getFrontlineAdventureSquad } from "@/features/frontline/adventure";
import type { AdventureMapNodeStatus, AdventureMapNodeType } from "./mapLayout";
import type { AdventureNodeState, AdventureVisualNode } from "./campaignTypes";

export function isCompletedPartyNode(node: AdventureVisualNode) {
  return node.status === "cleared" || node.status === "claimed" || node.status === "completed";
}

export function deriveNodeStatus(node: AdventureNodeState): AdventureMapNodeStatus {
  if (node.locked) return "locked";
  if (node.claimed) return "claimed";
  if (node.pausedHere || node.current) return "current";
  if (node.cleared) return "cleared";
  return "available";
}

export function deriveNodeType(node: AdventureNodeState, index: number, total: number): AdventureMapNodeType {
  if (node.locked) return "locked";
  if (/boss/i.test(node.lvl.name) || index === total - 1) return "boss";
  if (node.firstClearAvailable && (node.lvl.firstClearRewards?.frontlineCards?.length || node.lvl.firstClearRewards?.gems)) return "chest";
  const squad = getFrontlineAdventureSquad(node.lvl);
  if ((node.lvl.obstacles?.length ?? 0) >= 2 || squad.some((enemy) => enemy.tier >= 3)) return "elite";
  return "battle";
}
