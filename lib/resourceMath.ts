import type { Resources, Rewards } from "@/lib/types";

export type ResourceCost = {
  gold?: number;
  gems?: number;
  dust?: number;
  adventureKeys?: number;
};

export function applyRewardResources(resources: Resources, rewards: Rewards): Resources {
  return {
    ...resources,
    gold: resources.gold + (rewards.gold ?? 0),
    dust: resources.dust + (rewards.dust ?? 0),
    gems: resources.gems + (rewards.gems ?? 0),
    arenaTickets: resources.arenaTickets + (rewards.arenaTickets ?? 0),
    adventureKeys: (resources.adventureKeys ?? 0) + (rewards.adventureKeys ?? 0),
  };
}

export function canAfford(resources: Resources, cost: ResourceCost) {
  if (cost.gold && resources.gold < cost.gold) return false;
  if (cost.gems && resources.gems < cost.gems) return false;
  if (cost.dust && resources.dust < cost.dust) return false;
  if (cost.adventureKeys && (resources.adventureKeys ?? 0) < cost.adventureKeys) return false;
  return true;
}

export function spendResources(resources: Resources, cost: ResourceCost): Resources {
  return {
    ...resources,
    gold: resources.gold - (cost.gold ?? 0),
    gems: resources.gems - (cost.gems ?? 0),
    dust: resources.dust - (cost.dust ?? 0),
    adventureKeys: (resources.adventureKeys ?? 0) - (cost.adventureKeys ?? 0),
  };
}
