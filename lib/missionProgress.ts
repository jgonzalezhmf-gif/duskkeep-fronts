import type { Mission, MissionKind, MissionProgress } from "@/lib/types";

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
