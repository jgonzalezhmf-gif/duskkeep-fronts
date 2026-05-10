import { getRewardDisplayEntries } from "@/lib/rewardDisplayEntries";
import type { Rewards } from "@/lib/types";

export type DailyLoginProgress = {
  streak: number;
  lastClaim: string | null;
};

export type AdventureFirstClearProgress = {
  cleared?: boolean;
  firstClearTaken?: boolean;
};

export function localDayKey(date: Date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function daysBetweenLocalDayKeys(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00`) - Date.parse(`${from}T00:00:00`)) / 86_400_000);
}

export function hasRewardEntries(rewards: Rewards | null | undefined) {
  return getRewardDisplayEntries(rewards).length > 0;
}

export function isAdventureFirstClearRewardAvailable(progress: AdventureFirstClearProgress | undefined): boolean {
  return !progress?.cleared && !progress?.firstClearTaken;
}

export function getDailyLoginClaimState(progress: DailyLoginProgress, now: Date = new Date()) {
  const today = localDayKey(now);
  const claimed = progress.lastClaim === today;
  const gap = progress.lastClaim ? daysBetweenLocalDayKeys(progress.lastClaim, today) : 99;
  const nextDay = claimed ? progress.streak : gap === 1 ? Math.min(progress.streak + 1, 7) : 1;

  return {
    claimed,
    claimable: !claimed,
    nextDay,
    streak: progress.streak,
    today,
  };
}

export function isRoadmapRewardVisible(claimed: boolean | undefined) {
  return !claimed;
}

export function isRoadmapRewardClaimable(claimed: boolean | undefined, complete: boolean) {
  return isRoadmapRewardVisible(claimed) && complete;
}

export function firstVisibleRoadmapStep<T extends { id: string }>(steps: readonly T[], claimed: Record<string, boolean>) {
  return steps.find((step) => isRoadmapRewardVisible(claimed[step.id]));
}

export function isMilestoneRewardVisible(accountLevel: number, milestoneLevel: number, claimed: boolean | undefined) {
  return accountLevel >= milestoneLevel && !claimed;
}

export function isMilestoneRewardClaimable(accountLevel: number, milestoneLevel: number, claimed: boolean | undefined) {
  return isMilestoneRewardVisible(accountLevel, milestoneLevel, claimed);
}

export function isDailyRotationRewardClaimedToday(completions: Record<string, string>, id: string, now: Date = new Date()) {
  return completions[id] === localDayKey(now);
}
