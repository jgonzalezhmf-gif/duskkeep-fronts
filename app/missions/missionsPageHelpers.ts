import type { GameIconTone } from "@/components/game/shared/GameIcon";
import type { GlyphKind } from "@/components/ui/GameGlyph";
import type { Mission, MissionMetric, MissionProgress } from "@/lib/types";

export type MissionMeta = {
  icon: GlyphKind;
  tone: GameIconTone;
  route: string;
};

export type MissionRouteSummary = MissionMeta & {
  metric: MissionMetric;
  active: number;
  ready: number;
  progress: number;
};

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export const METRIC_META: Record<MissionMetric, MissionMeta> = {
  battles_won: {
    icon: "battle",
    tone: "ember",
    route: "/arena",
  },
  adventure_levels_cleared: {
    icon: "adventure",
    tone: "gold",
    route: "/adventure",
  },
  arena_battles: {
    icon: "arena",
    tone: "sky",
    route: "/arena",
  },
  heroes_upgraded: {
    icon: "heroes",
    tone: "violet",
    route: "/roster",
  },
  events_played: {
    icon: "events",
    tone: "emerald",
    route: "/events",
  },
};

function tx(t: TranslateFn, key: string, fallback: string, params?: Record<string, string | number>) {
  const value = t(key, params);
  return value === key ? fallback : value;
}

export function metricText(metric: MissionMetric, field: "cta" | "source" | "short", t: TranslateFn) {
  return t(`missionsScreen.metricsMeta.${metric}.${field}`);
}

export function missionName(mission: Mission, t: TranslateFn) {
  return tx(t, `missionsScreen.missions.${mission.id}.name`, mission.name);
}

export function missionDescription(mission: Mission, t: TranslateFn) {
  return tx(t, `missionsScreen.missions.${mission.id}.description`, mission.description);
}

export function buildMissionStats(missions: Mission[], progress: Record<string, MissionProgress>) {
  let ready = 0;
  let active = 0;
  for (const mission of missions) {
    const p = progress[mission.id] ?? freshProgress();
    if (p.claimed) continue;
    active += 1;
    if (p.progress >= mission.goal) ready += 1;
  }
  return { ready, active };
}

export function buildMissionRouteSummaries(missions: Mission[], progress: Record<string, MissionProgress>): MissionRouteSummary[] {
  const summaries = new Map<MissionMetric, MissionRouteSummary & { progressTotal: number }>();

  for (const mission of missions) {
    const missionProgress = progress[mission.id] ?? freshProgress();
    if (missionProgress.claimed) continue;

    const meta = METRIC_META[mission.metric] ?? METRIC_META.battles_won;
    const current = summaries.get(mission.metric) ?? {
      ...meta,
      metric: mission.metric,
      active: 0,
      ready: 0,
      progress: 0,
      progressTotal: 0,
    };

    const pct = mission.goal > 0 ? Math.min(1, missionProgress.progress / mission.goal) : 0;
    current.active += 1;
    current.ready += missionProgress.progress >= mission.goal ? 1 : 0;
    current.progressTotal += pct;
    current.progress = current.progressTotal / current.active;
    summaries.set(mission.metric, current);
  }

  return [...summaries.values()]
    .map(({ progressTotal: _progressTotal, ...summary }) => summary)
    .sort((a, b) => b.ready - a.ready || b.progress - a.progress || b.active - a.active);
}

export function pickNextMission(missions: Mission[], progress: Record<string, MissionProgress>) {
  const available = missions.filter((mission) => !(progress[mission.id]?.claimed));
  return (
    available.find((mission) => {
      const p = progress[mission.id] ?? freshProgress();
      return p.progress >= mission.goal;
    }) ??
    available
      .slice()
      .sort((a, b) => {
        const ap = progress[a.id] ?? freshProgress();
        const bp = progress[b.id] ?? freshProgress();
        return bp.progress / b.goal - ap.progress / a.goal;
      })[0] ??
    null
  );
}

export function getNearestResetLabel(missions: Mission[], progress: Record<string, MissionProgress>, t: TranslateFn) {
  const resetAt = missions
    .map((mission) => progress[mission.id]?.resetAt)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => Date.parse(a) - Date.parse(b))[0];
  return formatResetLabel(resetAt, t);
}

export function formatResetLabel(resetAt: string | undefined, t: TranslateFn) {
  if (!resetAt) return t("missionsScreen.resetLabels.later");
  const ms = Date.parse(resetAt) - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return t("missionsScreen.resetLabels.now");
  const totalMinutes = Math.ceil(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 24) return `${Math.floor(hours / 24)}d`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function freshProgress(): MissionProgress {
  return { progress: 0, claimed: false, resetAt: "" };
}
