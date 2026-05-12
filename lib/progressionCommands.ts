import { applyHeroLevelUp, applyHeroSkillUp, applyHeroStarUp } from "@/lib/heroUpgrades";
import { planFrontlineCardUpgrade } from "@/lib/frontlineCardState";
import {
  applyFortressBuildingUpgrade,
  applyFrontlineFortressUpgrade,
  getFortressBuildingUpgradePlan,
  getFrontlineFortressUpgradePlan,
} from "@/lib/fortressState";
import { canAfford, spendResources } from "@/lib/resourceMath";
import type { FrontlineCardLevels, FrontlineCardUnlocks } from "@/features/frontline/cardProgression";
import type {
  FortressState,
  FrontlineFortressBuildingId,
  FrontlineFortressState,
  MissionMetric,
  PlayerHero,
  Resources,
} from "@/lib/types";

export type ProgressionCommandKind =
  | "hero.levelUp"
  | "hero.starUp"
  | "hero.skillUp"
  | "frontlineCard.upgrade"
  | "fortress.upgradeBuilding"
  | "frontlineFortress.upgradeBuilding";

export type ProgressionCommandPatch = {
  heroes?: PlayerHero[];
  resources?: Resources;
  frontlineCardLevels?: FrontlineCardLevels;
  fortress?: FortressState;
  frontlineFortress?: FrontlineFortressState;
};

export type ProgressionCommandEffect = {
  notification?: {
    kind: "success" | "error";
    message: string;
  };
  missionProgress?: {
    metric: MissionMetric;
    amount: number;
  };
};

export type ProgressionCommandSuccess = {
  ok: true;
  kind: ProgressionCommandKind;
  patch: ProgressionCommandPatch;
  effects: ProgressionCommandEffect[];
};

export type ProgressionCommandFailure = {
  ok: false;
  kind: ProgressionCommandKind;
  effects: ProgressionCommandEffect[];
};

export type ProgressionCommandResult = ProgressionCommandSuccess | ProgressionCommandFailure;

export function createHeroLevelUpCommand(
  heroes: PlayerHero[],
  resources: Resources,
  heroId: string,
): ProgressionCommandResult {
  const result = applyHeroLevelUp(heroes, resources, heroId);
  if (!result.ok) {
    return commandFailure("hero.levelUp", result.reason === "not_enough_gold" ? error("Not enough gold") : undefined);
  }

  return commandSuccess("hero.levelUp", {
    patch: {
      heroes: result.heroes,
      resources: result.resources,
    },
    effects: [missionProgress("heroes_upgraded")],
  });
}

export function createHeroStarUpCommand(heroes: PlayerHero[], heroId: string): ProgressionCommandResult {
  const result = applyHeroStarUp(heroes, heroId);
  if (!result.ok) {
    return commandFailure("hero.starUp", result.reason === "not_enough_shards" ? error("Not enough shards") : undefined);
  }

  return commandSuccess("hero.starUp", {
    patch: { heroes: result.heroes },
    effects: [missionProgress("heroes_upgraded")],
  });
}

export function createHeroSkillUpCommand(
  heroes: PlayerHero[],
  resources: Resources,
  heroId: string,
): ProgressionCommandResult {
  const result = applyHeroSkillUp(heroes, resources, heroId);
  if (!result.ok) {
    const message =
      result.reason === "max_skill_level"
        ? "Skill already at max level"
        : result.reason === "not_enough_dust"
          ? "Not enough Arcane Dust"
          : undefined;
    return commandFailure("hero.skillUp", message ? error(message) : undefined);
  }

  return commandSuccess("hero.skillUp", {
    patch: {
      heroes: result.heroes,
      resources: result.resources,
    },
    effects: [missionProgress("heroes_upgraded"), success(`Skill enhanced to level ${result.nextSkillLevel}!`)],
  });
}

export function createFrontlineCardUpgradeCommand({
  unlocks,
  levels,
  resources,
  cardId,
}: {
  unlocks: FrontlineCardUnlocks;
  levels: FrontlineCardLevels;
  resources: Resources;
  cardId: string;
}): ProgressionCommandResult {
  const plan = planFrontlineCardUpgrade({ unlocks, levels, cardId });
  if (!plan.ok) {
    return commandFailure("frontlineCard.upgrade", plan.reason ? error(plan.reason) : undefined);
  }

  if (!canAfford(resources, plan.cost)) {
    return commandFailure("frontlineCard.upgrade", error("Not enough resources"));
  }

  return commandSuccess("frontlineCard.upgrade", {
    patch: {
      resources: spendResources(resources, plan.cost),
      frontlineCardLevels: plan.frontlineCardLevels,
    },
    effects: [success("Frontline card upgraded")],
  });
}

export function createFortressBuildingUpgradeCommand(
  fortress: FortressState,
  resources: Resources,
  buildingId: string,
): ProgressionCommandResult {
  const plan = getFortressBuildingUpgradePlan(fortress, buildingId);
  if (!plan.ok) {
    return commandFailure(
      "fortress.upgradeBuilding",
      plan.reason === "max_level" ? error("Building already at max level") : undefined,
    );
  }

  if (!canAfford(resources, plan.cost)) {
    return commandFailure("fortress.upgradeBuilding", error("Not enough resources"));
  }

  return commandSuccess("fortress.upgradeBuilding", {
    patch: {
      resources: spendResources(resources, plan.cost),
      fortress: applyFortressBuildingUpgrade(fortress, buildingId),
    },
    effects: [success(`${plan.name} upgraded`)],
  });
}

export function createFrontlineFortressUpgradeCommand(
  fortress: FrontlineFortressState,
  resources: Resources,
  buildingId: FrontlineFortressBuildingId,
): ProgressionCommandResult {
  const plan = getFrontlineFortressUpgradePlan(fortress, buildingId);
  if (!plan.ok) return commandFailure("frontlineFortress.upgradeBuilding");

  if (!canAfford(resources, plan.cost)) {
    return commandFailure("frontlineFortress.upgradeBuilding", error("Not enough resources"));
  }

  return commandSuccess("frontlineFortress.upgradeBuilding", {
    patch: {
      resources: spendResources(resources, plan.cost),
      frontlineFortress: applyFrontlineFortressUpgrade(fortress, buildingId),
    },
    effects: [success(`${plan.name} upgraded`)],
  });
}

function commandSuccess(
  kind: ProgressionCommandKind,
  result: Pick<ProgressionCommandSuccess, "patch" | "effects">,
): ProgressionCommandSuccess {
  return { ok: true, kind, ...result };
}

function commandFailure(kind: ProgressionCommandKind, effect?: ProgressionCommandEffect): ProgressionCommandFailure {
  return { ok: false, kind, effects: effect ? [effect] : [] };
}

function error(message: string): ProgressionCommandEffect {
  return { notification: { kind: "error", message } };
}

function success(message: string): ProgressionCommandEffect {
  return { notification: { kind: "success", message } };
}

function missionProgress(metric: MissionMetric, amount = 1): ProgressionCommandEffect {
  return { missionProgress: { metric, amount } };
}
