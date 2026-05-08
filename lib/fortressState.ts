import { FORTRESS_BUILDING_BY_ID } from "@/data/fortress";
import {
  FRONTLINE_FORTRESS_BUILDING_BY_ID,
  frontlineFortressUpgradeCost,
} from "@/features/frontline/fortress";
import type {
  FortressState,
  FrontlineFortressBuildingId,
  FrontlineFortressState,
  Rewards,
} from "@/lib/types";

type UpgradePlan =
  | { ok: true; cost: Rewards; name: string }
  | { ok: false; reason: "not_found" | "max_level" };

function fortressLevel(state: FortressState, buildingId: string) {
  return state.buildings[buildingId] ?? 0;
}

export function fortressIncomePreview(state: FortressState, now: Date = new Date()) {
  const last = state.lastCollectedAt ? Date.parse(state.lastCollectedAt) : now.getTime();
  const elapsedHours = Math.max(0, Math.min(8, (now.getTime() - last) / 3_600_000));
  const treasury = fortressLevel(state, "treasury");
  const arcane = fortressLevel(state, "arcane_spire");
  const market = fortressLevel(state, "market_square");
  return {
    hours: elapsedHours,
    gold: Math.floor(elapsedHours * treasury * 40),
    dust: Math.floor(elapsedHours * arcane * 8),
    gems: Math.floor((elapsedHours / 3) * Math.max(0, Math.floor(market / 2))),
  };
}

export function fortressBattleBonuses(state: FortressState) {
  const walls = fortressLevel(state, "bastion_walls");
  const academy = fortressLevel(state, "war_academy");
  return {
    leaderHpBonus: walls * 10,
    startingHandBonus: Math.floor(academy / 3),
  };
}

export function getFortressIncomeRewards(state: FortressState, now: Date = new Date()): Rewards | null {
  const preview = fortressIncomePreview(state, now);
  if (preview.gold <= 0 && preview.dust <= 0 && preview.gems <= 0) return null;
  const rewards: Rewards = {};
  if (preview.gold > 0) rewards.gold = preview.gold;
  if (preview.dust > 0) rewards.dust = preview.dust;
  if (preview.gems > 0) rewards.gems = preview.gems;
  return rewards;
}

export function markFortressIncomeCollected(state: FortressState, collectedAt: string): FortressState {
  return {
    ...state,
    lastCollectedAt: collectedAt,
  };
}

export function getFortressBuildingUpgradePlan(state: FortressState, buildingId: string): UpgradePlan {
  const def = FORTRESS_BUILDING_BY_ID[buildingId];
  if (!def) return { ok: false, reason: "not_found" };
  const currentLevel = fortressLevel(state, buildingId);
  if (currentLevel >= def.maxLevel) return { ok: false, reason: "max_level" };
  const nextLevel = currentLevel + 1;
  return {
    ok: true,
    name: def.name,
    cost: {
      gold: def.baseCost.gold ? Math.round(def.baseCost.gold * Math.pow(def.scaling, nextLevel - 1)) : undefined,
      dust: def.baseCost.dust ? Math.round(def.baseCost.dust * Math.pow(def.scaling, nextLevel - 1)) : undefined,
      gems: def.baseCost.gems ? Math.round(def.baseCost.gems * Math.pow(def.scaling, nextLevel - 1)) : undefined,
    },
  };
}

export function applyFortressBuildingUpgrade(state: FortressState, buildingId: string): FortressState {
  const nextBuildings = {
    ...state.buildings,
    [buildingId]: fortressLevel(state, buildingId) + 1,
  };
  const totalLevels = Object.values(nextBuildings).reduce((sum, level) => sum + level, 0);
  return {
    ...state,
    buildings: nextBuildings,
    level: Math.max(state.level, 1 + Math.floor(totalLevels / 5)),
  };
}

export function getFrontlineFortressUpgradePlan(
  state: FrontlineFortressState,
  buildingId: FrontlineFortressBuildingId,
): UpgradePlan {
  const def = FRONTLINE_FORTRESS_BUILDING_BY_ID[buildingId];
  if (!def) return { ok: false, reason: "not_found" };
  return {
    ok: true,
    name: def.name,
    cost: frontlineFortressUpgradeCost(state, buildingId),
  };
}

export function applyFrontlineFortressUpgrade(
  state: FrontlineFortressState,
  buildingId: FrontlineFortressBuildingId,
): FrontlineFortressState {
  return {
    ...state,
    buildings: {
      ...state.buildings,
      [buildingId]: state.buildings[buildingId] + 1,
    },
  };
}

export function setFrontlineFortressGarrisonSlot(
  state: FrontlineFortressState,
  slotIdx: number,
  heroId: string | null,
): FrontlineFortressState {
  const garrison = [...state.garrison];
  if (heroId) {
    for (let i = 0; i < garrison.length; i += 1) {
      if (i !== slotIdx && garrison[i] === heroId) garrison[i] = null;
    }
  }
  garrison[slotIdx] = heroId;
  return {
    ...state,
    garrison: garrison as FrontlineFortressState["garrison"],
  };
}
