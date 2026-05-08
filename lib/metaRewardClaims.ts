import type { AccountMilestone } from "@/data/milestones";
import type { RoadmapStep } from "@/data/roadmap";
import {
  getDailyLoginClaimState,
  isMilestoneRewardClaimable,
  isRoadmapRewardClaimable,
  type DailyLoginProgress,
} from "@/lib/rewardVisibility";
import type { Rewards } from "@/lib/types";

export type DailyLoginRewardEntry = {
  day: number;
  rewards: Rewards;
  label: string;
};

export type MetaRewardClaimResult<TPatch> = {
  patch: TPatch;
  rewards: Rewards;
  source: string;
};

export function claimDailyLoginReward(
  progress: DailyLoginProgress,
  entries: DailyLoginRewardEntry[],
  now: Date = new Date(),
): MetaRewardClaimResult<{ dailyLogin: DailyLoginProgress }> | null {
  const status = getDailyLoginClaimState(progress, now);
  if (!status.claimable) return null;

  const entry = entries.find((candidate) => candidate.day === status.nextDay) ?? entries[0];

  return {
    patch: {
      dailyLogin: {
        streak: status.nextDay,
        lastClaim: status.today,
      },
    },
    rewards: entry.rewards,
    source: `Daily ${entry.label}`,
  };
}

export function claimRoadmapReward(
  claimed: Record<string, boolean>,
  step: RoadmapStep | undefined,
  complete: boolean,
): MetaRewardClaimResult<{ roadmapClaimed: Record<string, boolean> }> | null {
  if (!step) return null;
  if (!isRoadmapRewardClaimable(claimed[step.id], complete)) return null;

  return {
    patch: {
      roadmapClaimed: {
        ...claimed,
        [step.id]: true,
      },
    },
    rewards: step.rewards,
    source: `Roadmap: ${step.title}`,
  };
}

export function claimMilestoneReward(
  accountLevel: number,
  claimed: Record<number, boolean>,
  milestone: AccountMilestone | undefined,
): MetaRewardClaimResult<{ milestonesClaimed: Record<number, boolean> }> | null {
  if (!milestone) return null;
  if (!isMilestoneRewardClaimable(accountLevel, milestone.level, claimed[milestone.level])) return null;

  return {
    patch: {
      milestonesClaimed: {
        ...claimed,
        [milestone.level]: true,
      },
    },
    rewards: milestone.rewards,
    source: `Level ${milestone.level}: ${milestone.title}`,
  };
}
