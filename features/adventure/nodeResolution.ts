import { ADVENTURE_BY_ID } from "@/data/adventure";
import { mergeRewards } from "@/features/battle/rewards";
import { isAdventureFirstClearRewardAvailable } from "@/lib/rewardVisibility";
import type { AdventureLevel, Rewards } from "@/lib/types";

export type AdventureNodeType =
  | "battle"
  | "elite"
  | "boss"
  | "chest"
  | "shrine"
  | "merchant"
  | "event"
  | "secret"
  | "danger"
  | "locked";

export type AdventureNodeStatus =
  | "locked"
  | "available"
  | "current"
  | "cleared"
  | "completed"
  | "claimed"
  | "hidden";

export type AdventureRepeatPolicy = "never" | "reduced" | "free_no_reward" | "ticket_cost";

export type AdventureProgressEntry = {
  cleared: boolean;
  firstClearTaken: boolean;
  claimed?: boolean;
  completions?: number;
  lastCompletedAt?: string;
};

export type AdventureNodeRule = {
  label: string;
  description: string;
};

export type AdventureNodeDefinition = {
  id: string;
  chapterId: string;
  title: string;
  type: AdventureNodeType;
  status?: AdventureNodeStatus;
  encounterId?: string;
  rewardId?: string;
  firstClearReward: Rewards;
  repeatReward?: Rewards;
  repeatPolicy: AdventureRepeatPolicy;
  unlocks?: string[];
  nodeRule?: AdventureNodeRule;
};

type AdventureNodeOverride = Partial<
  Pick<AdventureNodeDefinition, "type" | "repeatPolicy" | "nodeRule" | "unlocks" | "encounterId" | "rewardId">
>;

const ADVENTURE_NODE_OVERRIDES: Record<string, AdventureNodeOverride> = {
  c1l3: { type: "chest", repeatPolicy: "never", rewardId: "eclipse-thistle-cache" },
  c1l5: { type: "elite", nodeRule: eliteRule("Wolf-pack ambush") },
  c1l7: { type: "chest", repeatPolicy: "never", rewardId: "eclipse-breach-cache" },
  c1l9: { type: "elite", nodeRule: eliteRule("Shadow flank") },
  c1l11: { type: "elite", nodeRule: eliteRule("Ember vanguard") },
  c1l12: { type: "boss", repeatPolicy: "free_no_reward", nodeRule: bossRule("Eclipse command cell"), unlocks: ["chapter-2"] },
  c2l3: { type: "chest", repeatPolicy: "never", rewardId: "ashen-ember-vault" },
  c2l4: { type: "elite", nodeRule: eliteRule("Sunken choir guard") },
  c2l6: { type: "elite", nodeRule: eliteRule("Mire brute wall") },
  c2l8: { type: "boss", repeatPolicy: "free_no_reward", nodeRule: bossRule("Crown of Ashes"), unlocks: ["chapter-3"] },
};

export function getAdventureNodeType(level: AdventureLevel): AdventureNodeType {
  const override = ADVENTURE_NODE_OVERRIDES[level.id]?.type;
  if (override) return override;
  if (/boss/i.test(level.name)) return "boss";
  return "battle";
}

export function getAdventureNodeDefinition(level: AdventureLevel): AdventureNodeDefinition {
  const override = ADVENTURE_NODE_OVERRIDES[level.id] ?? {};
  const type = override.type ?? getAdventureNodeType(level);
  const repeatPolicy = override.repeatPolicy ?? getDefaultRepeatPolicy(type);
  return {
    id: level.id,
    chapterId: `chapter-${level.chapter}`,
    title: level.name,
    type,
    encounterId: override.encounterId ?? level.frontlinePresetId,
    rewardId: override.rewardId ?? `${level.id}-reward`,
    firstClearReward: getAdventureFirstClearReward(level),
    repeatReward: getAdventureRepeatReward(level, type, repeatPolicy),
    repeatPolicy,
    unlocks: override.unlocks,
    nodeRule: override.nodeRule ?? getDefaultNodeRule(type),
  };
}

export function isAdventureCombatNode(type: AdventureNodeType) {
  return type === "battle" || type === "elite" || type === "boss" || type === "danger";
}

export function isAdventureClaimNode(type: AdventureNodeType) {
  return type === "chest" || type === "shrine" || type === "event" || type === "merchant" || type === "secret";
}

export function getAdventureFirstClearReward(level: AdventureLevel) {
  return mergeRewards(level.rewards, level.firstClearRewards);
}

export function getAdventureNodeRewardPreview(
  level: AdventureLevel,
  progress: AdventureProgressEntry | undefined,
) {
  const definition = getAdventureNodeDefinition(level);
  if (definition.type === "locked") return {};
  if (isAdventureClaimed(definition.type, progress)) return {};
  if (isAdventureFirstClearRewardAvailable(progress)) return definition.firstClearReward;
  return definition.repeatReward ?? {};
}

export function getAdventureVictoryRewards(
  level: AdventureLevel,
  firstClear: boolean,
) {
  const definition = getAdventureNodeDefinition(level);
  if (firstClear) return definition.firstClearReward;
  return definition.repeatReward ?? {};
}

export function getAdventureChestClaimRewards(
  level: AdventureLevel,
  progress: AdventureProgressEntry | undefined,
) {
  const definition = getAdventureNodeDefinition(level);
  if (!isAdventureClaimNode(definition.type) || isAdventureClaimed(definition.type, progress)) return null;
  return definition.firstClearReward;
}

export function isAdventureClaimed(type: AdventureNodeType, progress: AdventureProgressEntry | undefined) {
  return isAdventureClaimNode(type) && Boolean(progress?.claimed || (progress?.cleared && progress?.firstClearTaken));
}

export function isAdventureLevelCombatPlayable(level: AdventureLevel) {
  return isAdventureCombatNode(getAdventureNodeType(level));
}

export function getAdventureLevelNodeDefinition(levelId: string) {
  const level = ADVENTURE_BY_ID[levelId];
  return level ? getAdventureNodeDefinition(level) : null;
}

function getDefaultRepeatPolicy(type: AdventureNodeType): AdventureRepeatPolicy {
  if (type === "battle") return "reduced";
  if (type === "elite") return "reduced";
  if (type === "boss") return "free_no_reward";
  return "never";
}

function getAdventureRepeatReward(
  level: AdventureLevel,
  type: AdventureNodeType,
  repeatPolicy: AdventureRepeatPolicy,
): Rewards | undefined {
  if (repeatPolicy === "free_no_reward" || repeatPolicy === "never") return undefined;
  if (repeatPolicy !== "reduced") return undefined;
  if (type === "battle") return scaleRepeatReward(level.rewards, 0.2, 15);
  if (type === "elite") return scaleRepeatReward(level.rewards, 0.12, 12);
  if (type === "danger") return scaleRepeatReward(level.rewards, 0.16, 12);
  return undefined;
}

function scaleRepeatReward(rewards: Rewards, ratio: number, minimumGold: number): Rewards {
  return {
    gold: rewards.gold ? Math.max(minimumGold, Math.round(rewards.gold * ratio)) : undefined,
    dust: rewards.dust ? Math.max(2, Math.round(rewards.dust * ratio)) : undefined,
    accountXp: rewards.accountXp ? Math.max(1, Math.round(rewards.accountXp * ratio)) : undefined,
  };
}

function eliteRule(label: string): AdventureNodeRule {
  return {
    label,
    description: "Harder Frontline preset. First clear pays elite rewards; replay payout is reduced.",
  };
}

function bossRule(label: string): AdventureNodeRule {
  return {
    label,
    description: "Chapter closer. First clear pays the full cache; replay is practice with no major reward.",
  };
}

function getDefaultNodeRule(type: AdventureNodeType): AdventureNodeRule | undefined {
  if (type === "chest") {
    return {
      label: "Reward cache",
      description: "Open once for the first-clear cache. This node does not launch combat.",
    };
  }
  if (type === "battle") {
    return {
      label: "Frontline breach",
      description: "Normal battle. First clear advances the route; replay pays reduced rewards.",
    };
  }
  return undefined;
}
