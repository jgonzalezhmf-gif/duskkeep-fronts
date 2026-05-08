import { applyAccountXpReward } from "@/lib/accountProgression";
import { applyFrontlineCardRewards } from "@/lib/frontlineCardRewards";
import { applyHeroShardRewards } from "@/lib/heroShards";
import { applyTeamXpReward } from "@/lib/heroXp";
import { applyRewardResources } from "@/lib/resourceMath";
import type { FrontlineCardUnlocks } from "@/features/frontline/cardProgression";
import type { AccountState, PlayerHero, Resources, Rewards } from "@/lib/types";

export type RewardApplicationState = {
  account: AccountState;
  resources: Resources;
  heroes: PlayerHero[];
  team: (string | null)[];
  frontlineCardUnlocks: FrontlineCardUnlocks;
  pendingUnlockLevel: number | null;
};

export type RewardApplicationPatch = Partial<RewardApplicationState> & {
  resources: Resources;
};

export function applyRewardsToGameState(state: RewardApplicationState, rewards: Rewards): RewardApplicationPatch {
  const next: RewardApplicationPatch = {
    resources: applyRewardResources(state.resources, rewards),
  };

  const accountProgression = applyAccountXpReward(state.account, rewards.accountXp, state.pendingUnlockLevel);
  if (accountProgression) {
    next.account = accountProgression.account;
    if (typeof accountProgression.pendingUnlockLevel === "number") {
      next.pendingUnlockLevel = accountProgression.pendingUnlockLevel;
    }
  }

  const heroesWithShardRewards = applyHeroShardRewards(state.heroes, rewards.shards);
  if (heroesWithShardRewards) {
    next.heroes = heroesWithShardRewards;
  }

  const heroesWithXpReward = applyTeamXpReward(next.heroes ?? state.heroes, state.team, rewards.xp);
  if (heroesWithXpReward) {
    next.heroes = heroesWithXpReward;
  }

  const frontlineCardUnlocks = applyFrontlineCardRewards(state.frontlineCardUnlocks, rewards.frontlineCards);
  if (frontlineCardUnlocks) {
    next.frontlineCardUnlocks = frontlineCardUnlocks;
  }

  return next;
}
