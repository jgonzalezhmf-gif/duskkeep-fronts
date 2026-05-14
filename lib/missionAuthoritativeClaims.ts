import type { Mission } from "@/lib/types";

const AUTHORITATIVE_MISSION_METRICS = new Set<Mission["metric"]>([
  "adventure_levels_cleared",
  "arena_battles",
  "battles_won",
  "events_played",
  "heroes_upgraded",
]);

export type MissionAuthoritativeClaimPlan =
  | { ok: true; cycleKey: string }
  | { ok: false; reason: "unsupported_metric" };

export function getMissionAuthoritativeClaimPlan(mission: Mission, now: Date = new Date()): MissionAuthoritativeClaimPlan {
  if (!AUTHORITATIVE_MISSION_METRICS.has(mission.metric)) {
    return { ok: false, reason: "unsupported_metric" };
  }

  return {
    ok: true,
    cycleKey: getMissionServerCycleKey(mission, now),
  };
}

export function getMissionServerCycleKey(mission: Pick<Mission, "kind">, now: Date = new Date()) {
  if (mission.kind === "weekly") {
    return `weekly:${getUtcIsoWeekKey(now)}`;
  }

  return `daily:${now.toISOString().slice(0, 10)}`;
}

function getUtcIsoWeekKey(date: Date) {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utcDate.getUTCFullYear()}-${String(week).padStart(2, "0")}`;
}
