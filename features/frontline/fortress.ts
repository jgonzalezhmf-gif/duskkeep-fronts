import type {
  FrontlineFortressBuildingId,
  FrontlineFortressOutcome,
  FrontlineFortressReport,
  FrontlineFortressState,
  Rewards,
} from "@/lib/types";
import { frontPresenceScore } from "./engine";
import type { FrontlineHeroProfileMap } from "./heroProfile";

const RAID_INTERVAL_HOURS = 8;

export const FRONTLINE_FORTRESS_BUILDINGS: Array<{
  id: FrontlineFortressBuildingId;
  name: string;
  description: string;
  baseCost: { gold: number; dust?: number };
}> = [
  {
    id: "keep",
    name: "Keep",
    description: "Raises integrity and stabilizes the core of your realm.",
    baseCost: { gold: 120, dust: 8 },
  },
  {
    id: "treasury",
    name: "Treasury",
    description: "Improves raid rewards and soft economy output.",
    baseCost: { gold: 110 },
  },
  {
    id: "barracks",
    name: "Barracks",
    description: "Increases garrison efficiency and defense rating.",
    baseCost: { gold: 130, dust: 6 },
  },
];

export const FRONTLINE_FORTRESS_BUILDING_BY_ID = Object.fromEntries(
  FRONTLINE_FORTRESS_BUILDINGS.map((entry) => [entry.id, entry]),
);

export function createDefaultFrontlineFortress(): FrontlineFortressState {
  return {
    buildings: {
      keep: 1,
      treasury: 1,
      barracks: 1,
    },
    integrity: 100,
    garrison: ["bran", "kara", "mira"],
    lastResolvedAt: null,
    nextAttackAt: new Date(Date.now() + RAID_INTERVAL_HOURS * 3_600_000).toISOString(),
    raidsResolved: 0,
    lastReport: null,
  };
}

export function frontlineFortressUpgradeCost(
  state: FrontlineFortressState,
  buildingId: FrontlineFortressBuildingId,
) {
  const building = FRONTLINE_FORTRESS_BUILDING_BY_ID[buildingId];
  const level = state.buildings[buildingId];
  return {
    gold: Math.round(building.baseCost.gold * Math.pow(1.32, level - 1)),
    dust: building.baseCost.dust ? Math.round(building.baseCost.dust * Math.pow(1.28, level - 1)) : 0,
  };
}

export function frontlineFortressDefenseRating(
  state: FrontlineFortressState,
  heroProfiles?: FrontlineHeroProfileMap,
) {
  const keep = state.buildings.keep;
  const treasury = state.buildings.treasury;
  const barracks = state.buildings.barracks;
  const heroPower = state.garrison
    .filter((heroId): heroId is string => Boolean(heroId))
    .reduce((sum, heroId) => sum + Math.round(frontPresenceScore(heroId, heroProfiles) * (0.22 + barracks * 0.05)), 0);
  return keep * 10 + treasury * 4 + barracks * 12 + heroPower + Math.round(state.integrity * 0.25);
}

export function frontlineFortressRaidReady(state: FrontlineFortressState, now: Date = new Date()) {
  if (!state.nextAttackAt) return true;
  const target = Date.parse(state.nextAttackAt);
  return !Number.isFinite(target) || now.getTime() >= target;
}

export function frontlineFortressAttackPower(
  state: FrontlineFortressState,
  accountLevel: number,
  now: Date = new Date(),
) {
  const keep = state.buildings.keep;
  const barracks = state.buildings.barracks;
  const raidTempo = Math.floor(now.getTime() / 86_400_000) % 5;
  return 44 + state.raidsResolved * 7 + accountLevel * 4 + keep * 2 + barracks * 2 + raidTempo * 3;
}

export function frontlineFortressProjectedOutcome(
  state: FrontlineFortressState,
  accountLevel: number,
  now: Date = new Date(),
  heroProfiles?: FrontlineHeroProfileMap,
) {
  const defensePower = frontlineFortressDefenseRating(state, heroProfiles);
  const attackPower = frontlineFortressAttackPower(state, accountLevel, now);
  let outcome: FrontlineFortressOutcome;
  if (defensePower >= attackPower + 10) {
    outcome = "full_repel";
  } else if (defensePower >= attackPower - 12) {
    outcome = "partial_hold";
  } else {
    outcome = "breach";
  }
  return {
    attackPower,
    defensePower,
    margin: defensePower - attackPower,
    outcome,
    rewards: frontlineFortressRewardsForOutcome(state, outcome),
  };
}

export function frontlineFortressRewardsForOutcome(
  state: FrontlineFortressState,
  outcome: FrontlineFortressOutcome,
): Rewards {
  const treasury = state.buildings.treasury;
  const keep = state.buildings.keep;
  const base = {
    gold: 60 + treasury * 35,
    dust: 6 + keep * 2,
    gems: treasury >= 3 ? 2 : treasury >= 2 ? 1 : 0,
  };
  if (outcome === "full_repel") return { gold: base.gold, dust: base.dust, gems: base.gems };
  if (outcome === "partial_hold") {
    return {
      gold: Math.floor(base.gold * 0.75),
      dust: Math.floor(base.dust * 0.75),
      gems: base.gems ? 1 : 0,
    };
  }
  return {
    gold: Math.floor(base.gold * 0.45),
    dust: Math.floor(base.dust * 0.5),
  };
}

export function resolveFrontlineFortressRaid(
  state: FrontlineFortressState,
  accountLevel: number,
  now: Date = new Date(),
  heroProfiles?: FrontlineHeroProfileMap,
) {
  const defensePower = frontlineFortressDefenseRating(state, heroProfiles);
  const attackPower = frontlineFortressAttackPower(state, accountLevel, now);
  let outcome: FrontlineFortressOutcome;
  let integrityDelta = 0;
  if (defensePower >= attackPower + 10) {
    outcome = "full_repel";
    integrityDelta = 0;
  } else if (defensePower >= attackPower - 12) {
    outcome = "partial_hold";
    integrityDelta = -12;
  } else {
    outcome = "breach";
    integrityDelta = -26;
  }

  const rewards = frontlineFortressRewardsForOutcome(state, outcome);
  const report: FrontlineFortressReport = {
    resolvedAt: now.toISOString(),
    outcome,
    attackPower,
    defensePower,
    integrityDelta,
    rewards,
  };

  return {
    nextState: applyFrontlineFortressReport(state, report),
    report,
  };
}

export function applyFrontlineFortressReport(
  state: FrontlineFortressState,
  report: FrontlineFortressReport,
): FrontlineFortressState {
  const resolvedAt = Date.parse(report.resolvedAt);
  const nextAttackAt = Number.isFinite(resolvedAt)
    ? new Date(resolvedAt + RAID_INTERVAL_HOURS * 3_600_000).toISOString()
    : new Date(Date.now() + RAID_INTERVAL_HOURS * 3_600_000).toISOString();

  return {
    ...state,
    integrity: Math.max(0, Math.min(100, state.integrity + report.integrityDelta)),
    lastResolvedAt: report.resolvedAt,
    nextAttackAt,
    raidsResolved: state.raidsResolved + 1,
    lastReport: report,
  };
}
