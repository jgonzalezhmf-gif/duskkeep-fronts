import type { Mission, MissionKind, MissionMetric, MissionProgress, Rewards } from "@/lib/types";

export type MissionProgressMap = Record<string, MissionProgress>;

export type MissionClaimResult = {
  missionsProgress: MissionProgressMap;
  rewards: Rewards;
  source: string;
};

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getMissionResetAt(kind: MissionKind, now: Date = new Date()) {
  const reset = startOfLocalDay(now);
  if (kind === "daily") {
    reset.setDate(reset.getDate() + 1);
    return reset.toISOString();
  }

  const localWeekday = (reset.getDay() + 6) % 7; // Monday = 0
  const daysUntilNextMonday = 7 - localWeekday;
  reset.setDate(reset.getDate() + daysUntilNextMonday);
  return reset.toISOString();
}

export function missionNeedsReset(progress: MissionProgress | undefined, now: Date = new Date()) {
  if (!progress?.resetAt) return true;
  const at = Date.parse(progress.resetAt);
  if (!Number.isFinite(at)) return true;
  return at <= now.getTime();
}

export function freshMissionProgress(mission: Mission, now: Date = new Date()): MissionProgress {
  return {
    progress: 0,
    claimed: false,
    resetAt: getMissionResetAt(mission.kind, now),
  };
}

export function ensureMissionProgress(
  progress: MissionProgressMap,
  missions: Mission[],
  now: Date = new Date(),
): MissionProgressMap | null {
  const updates: MissionProgressMap = {};

  for (const mission of missions) {
    const current = progress[mission.id];
    if (missionNeedsReset(current, now)) {
      updates[mission.id] = freshMissionProgress(mission, now);
    }
  }

  if (!Object.keys(updates).length) return null;

  return {
    ...progress,
    ...updates,
  };
}

export function applyMissionMetricProgress(
  progress: MissionProgressMap,
  missions: Mission[],
  metric: MissionMetric,
  delta: number,
  now: Date = new Date(),
): MissionProgressMap | null {
  const ensuredProgress = ensureMissionProgress(progress, missions, now) ?? progress;
  const updates: MissionProgressMap = {};

  for (const mission of missions) {
    if (mission.metric !== metric) continue;

    const current = ensuredProgress[mission.id] ?? freshMissionProgress(mission, now);
    if (current.claimed) continue;

    updates[mission.id] = {
      ...current,
      progress: Math.min(mission.goal, current.progress + delta),
    };
  }

  if (!Object.keys(updates).length && ensuredProgress === progress) return null;

  return {
    ...ensuredProgress,
    ...updates,
  };
}

export function claimMissionProgress(
  progress: MissionProgressMap,
  missions: Mission[],
  missionId: string,
): MissionClaimResult | null {
  const mission = missions.find((entry) => entry.id === missionId);
  if (!mission) return null;

  const current = progress[missionId];
  if (!current || current.claimed || current.progress < mission.goal) return null;

  return {
    missionsProgress: {
      ...progress,
      [missionId]: {
        ...current,
        claimed: true,
      },
    },
    rewards: mission.rewards,
    source: `mission ${mission.name}`,
  };
}
