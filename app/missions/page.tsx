"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import SceneBackdrop from "@/components/game/screens/SceneBackdrop";
import GameBackNav from "@/components/game/shared/GameBackNav";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { GameResourceBar, GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { ProgressionIcon, type ProgressionIconName } from "@/components/game/shared/ProgressionIcon";
import { RewardBurstOverlay } from "@/components/game/shared/RewardBurstOverlay";
import { RewardFlightOverlay } from "@/components/game/shared/RewardFlightOverlay";
import type { GlyphKind } from "@/components/ui/GameGlyph";
import ScreenBackground from "@/components/ui/ScreenBackground";
import { DAILY_MISSIONS, WEEKLY_MISSIONS } from "@/data/missions";
import { cn } from "@/lib/cn";
import { sfx } from "@/lib/audio";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";
import type { Mission, MissionMetric, MissionProgress, Rewards } from "@/lib/types";

type MissionMeta = {
  icon: GlyphKind;
  tone: GameIconTone;
  route: string;
};

type ClaimFx = {
  missionId: string;
  rewards: Rewards;
  nonce: number;
};

const METRIC_META: Record<MissionMetric, MissionMeta> = {
  battles_won: {
    icon: "battle",
    tone: "ember",
    route: "/battle",
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

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

function tx(t: TranslateFn, key: string, fallback: string, params?: Record<string, string | number>) {
  const value = t(key, params);
  return value === key ? fallback : value;
}

function metricText(metric: MissionMetric, field: "cta" | "source" | "short", t: TranslateFn) {
  return t(`missionsScreen.metricsMeta.${metric}.${field}`);
}

function missionName(mission: Mission, t: TranslateFn) {
  return tx(t, `missionsScreen.missions.${mission.id}.name`, mission.name);
}

function missionDescription(mission: Mission, t: TranslateFn) {
  return tx(t, `missionsScreen.missions.${mission.id}.description`, mission.description);
}

export default function MissionsPage() {
  const { t } = useI18n();
  const [claimFx, setClaimFx] = useState<ClaimFx | null>(null);
  const claimFxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const claimFxNonce = useRef(0);
  const progress = useGameStore((state) => state.missionsProgress);
  const resources = useGameStore((state) => state.resources);
  const ensureMissionsInitialized = useGameStore((state) => state.ensureMissionsInitialized);
  const claimRaw = useGameStore((state) => state.claimMission);

  useEffect(() => {
    ensureMissionsInitialized();
    return () => {
      if (claimFxTimer.current) clearTimeout(claimFxTimer.current);
    };
  }, [ensureMissionsInitialized]);

  const allMissions = useMemo(() => [...DAILY_MISSIONS, ...WEEKLY_MISSIONS], []);
  const stats = useMemo(() => buildMissionStats(allMissions, progress), [allMissions, progress]);
  const nextMission = useMemo(() => pickNextMission(allMissions, progress), [allMissions, progress]);
  const nextReset = getNearestResetLabel(allMissions, progress, t);

  const claim = (id: string) => {
    const rewards = claimRaw(id);
    if (rewards) {
      sfx.claim();
      claimFxNonce.current += 1;
      setClaimFx({ missionId: id, rewards, nonce: claimFxNonce.current });
      if (claimFxTimer.current) clearTimeout(claimFxTimer.current);
      claimFxTimer.current = setTimeout(() => setClaimFx(null), 1500);
    } else {
      sfx.error();
    }
  };

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-[#04070d] px-3 pb-20 pt-28 sm:pt-28 md:px-6 md:pb-24 md:pt-24">
      <ScreenBackground screen="missions" overlayIntensity="medium" fallback={<SceneBackdrop scene="missions" className="opacity-55" />} />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_16%_12%,rgba(93,211,158,0.08),transparent_20%),radial-gradient(circle_at_82%_16%,rgba(245,196,81,0.08),transparent_20%),linear-gradient(180deg,rgba(3,7,12,0.2),rgba(4,8,12,0.4)_46%,rgba(4,7,11,0.72))]" />
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.028] [background-image:linear-gradient(90deg,rgba(245,212,152,0.8)_1px,transparent_1px),linear-gradient(180deg,rgba(245,212,152,0.45)_1px,transparent_1px)] [background-size:72px_72px]" />
      <GameBackNav />
      <GameResourceBar resources={resources} size="sm" className="pointer-events-auto fixed right-3 top-3 z-40 max-w-[calc(100vw-9rem)] md:right-5 md:top-4 md:max-w-none" />
      <RewardFlightOverlay rewards={claimFx?.rewards} active={Boolean(claimFx)} nonce={claimFx?.nonce} origin="center" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-4">
        <section className="relative overflow-hidden rounded-[28px] border border-[#f5d498]/12 bg-[linear-gradient(135deg,rgba(18,30,27,0.76),rgba(10,13,19,0.94)_48%,rgba(5,7,12,0.98)_100%)] p-3 shadow-[0_28px_74px_rgba(0,0,0,0.42)] md:rounded-[34px] md:p-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(93,211,158,0.13),transparent_22%),radial-gradient(circle_at_82%_10%,rgba(245,196,81,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_42%)]" />
          <div className="relative z-[1] grid gap-3 xl:grid-cols-[minmax(0,0.88fr)_minmax(25rem,1.12fr)]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-full border border-[#f5c451]/20 bg-[#f5c451]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d498]">
                  {t("missionsScreen.commandLog")}
                </div>
                <MiniBadge tone={stats.ready > 0 ? "gold" : "neutral"}>{t("missionsScreen.progress.readyCount", { count: stats.ready })}</MiniBadge>
              </div>
              <h1 className="mt-3 max-w-[44rem] text-[1.85rem] font-black leading-[0.92] tracking-[-0.045em] text-white sm:text-[2.25rem] md:text-[2.8rem]">
                {t("missionsScreen.title")}
              </h1>
              <p className="mt-2 max-w-[38rem] text-[12px] leading-5 text-white/58 md:text-[13px]">
                {t("missionsScreen.copy")}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <LogMetric progressionIcon="claim" label={t("missionsScreen.metrics.ready")} value={String(stats.ready)} tone="gold" active={stats.ready > 0} />
                <LogMetric icon="missions" label={t("missionsScreen.metrics.active")} value={String(stats.active)} tone="emerald" />
                <LogMetric icon="events" label={t("missionsScreen.metrics.reset")} value={nextReset} tone="sky" />
              </div>
            </div>

            <NextContract mission={nextMission} progress={progress} claim={claim} claimFx={claimFx} t={t} />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <MissionColumn title={t("missionsScreen.columns.dailyTitle")} cadence={t("missionsScreen.columns.dailyCadence")} missions={DAILY_MISSIONS} progress={progress} claim={claim} claimFx={claimFx} t={t} />
          <MissionColumn title={t("missionsScreen.columns.weeklyTitle")} cadence={t("missionsScreen.columns.weeklyCadence")} missions={WEEKLY_MISSIONS} progress={progress} claim={claim} claimFx={claimFx} t={t} />
        </section>
      </div>
    </div>
  );
}

function NextContract({
  mission,
  progress,
  claim,
  claimFx,
  t,
}: {
  mission: Mission | null;
  progress: Record<string, MissionProgress>;
  claim: (id: string) => void;
  claimFx: ClaimFx | null;
  t: TranslateFn;
}) {
  if (!mission) {
    return (
      <div className="rounded-[26px] border border-emerald-300/18 bg-[linear-gradient(180deg,rgba(93,211,158,0.12),rgba(8,12,18,0.92))] p-4">
        <ProgressionIcon name="reward_chest" size="lg" />
        <div className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200/72">{t("missionsScreen.next.allClear")}</div>
        <div className="mt-1 text-xl font-black leading-tight text-white">{t("missionsScreen.next.noUrgent")}</div>
      </div>
    );
  }

  const meta = METRIC_META[mission.metric] ?? METRIC_META.battles_won;
  const p = progress[mission.id] ?? freshProgress();
  const pct = Math.min(1, p.progress / mission.goal);
  const ready = p.progress >= mission.goal && !p.claimed;
  const activeClaim = claimFx?.missionId === mission.id ? claimFx : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[26px] border p-3 shadow-[0_20px_52px_rgba(0,0,0,0.3)] md:p-4",
        ready
          ? "border-[#f5c451]/28 bg-[radial-gradient(circle_at_78%_8%,rgba(245,196,81,0.18),transparent_34%),linear-gradient(180deg,rgba(50,35,18,0.68),rgba(8,11,16,0.96))]"
            : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(8,11,16,0.94))]",
        activeClaim && "frontline-reward-success",
      )}
    >
      <RewardBurstOverlay key={`next-claim-${activeClaim?.nonce ?? 0}`} rewards={activeClaim?.rewards} active={Boolean(activeClaim)} />
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="relative z-[1] flex items-start justify-between gap-3">
        <GameIcon kind={meta.icon} tone={meta.tone} size="md" className="h-12 w-12" />
        <StatusSeal ready={ready} claimed={p.claimed} compact t={t} />
      </div>
      <div className="relative z-[1] mt-3">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d498]">{t("missionsScreen.next.priority")}</div>
        <div className="mt-1 text-2xl font-black leading-tight text-white">{missionName(mission, t)}</div>
        <div className="mt-1 text-[12px] leading-5 text-white/58">{missionDescription(mission, t)}</div>
        <div className="mt-2 text-[12px] font-black uppercase tracking-[0.14em] text-white/44">{metricText(mission.metric, "short", t)}</div>
        <ProgressRail progress={pct} ready={ready} value={`${p.progress}/${mission.goal}`} t={t} />
        <div className="mt-3 flex flex-wrap gap-2 rounded-[18px] border border-white/10 bg-black/18 p-2">
          <RewardChips rewards={mission.rewards} t={t} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href={meta.route}
            className="frontline-motion-action rounded-[18px] border border-white/10 bg-white/[0.06] px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-[0.16em] text-white/76 transition hover:border-white/18 hover:bg-white/[0.09]"
          >
            {metricText(mission.metric, "cta", t)}
          </Link>
          <button
            type="button"
            onClick={() => claim(mission.id)}
            disabled={!ready}
            className={cn(
              "rounded-[18px] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] transition",
              ready ? "bg-[#f5c451] text-black shadow-[0_16px_34px_rgba(245,196,81,0.2)]" : "bg-white/8 text-white/42",
              ready && "frontline-motion-action frontline-feedback-claim",
            )}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <ProgressionIcon name={p.claimed ? "claim" : ready ? "claim" : "unlock"} size="sm" withGlow={ready} />
              {p.claimed ? t("missionsScreen.actions.claimed") : ready ? t("missionsScreen.actions.claim") : t("missionsScreen.actions.locked")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MissionColumn({
  title,
  cadence,
  missions,
  progress,
  claim,
  claimFx,
  t,
}: {
  title: string;
  cadence: string;
  missions: Mission[];
  progress: Record<string, MissionProgress>;
  claim: (id: string) => void;
  claimFx: ClaimFx | null;
  t: TranslateFn;
}) {
  const openMissions = missions.filter((mission) => !(progress[mission.id]?.claimed));
  const ready = missions.filter((mission) => {
    const p = progress[mission.id];
    return p && p.progress >= mission.goal && !p.claimed;
  }).length;
  const resetLabel = formatResetLabel(missions.map((mission) => progress[mission.id]?.resetAt).find(Boolean), t);

  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.052),rgba(7,10,15,0.92))] p-3 shadow-[0_22px_52px_rgba(0,0,0,0.28)] md:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f5d498]">{cadence}</div>
          <div className="mt-1 text-xl font-black text-white md:text-2xl">{title}</div>
        </div>
        <div className="flex items-center gap-2">
          <MiniBadge tone={ready > 0 ? "gold" : "neutral"}>{t("missionsScreen.progress.readyCount", { count: ready })}</MiniBadge>
          <MiniBadge>{resetLabel}</MiniBadge>
        </div>
      </div>
      <div className="grid gap-2.5">
        {openMissions.length ? (
          openMissions.map((mission) => (
            <MissionContract key={mission.id} mission={mission} progress={progress[mission.id] ?? freshProgress()} claim={claim} claimFx={claimFx} t={t} />
          ))
        ) : (
          <div className="rounded-[24px] border border-emerald-300/14 bg-emerald-300/[0.045] px-4 py-6 text-center">
            <ProgressionIcon name="claim" size="lg" />
            <div className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200/70">{t("missionsScreen.emptyColumn.eyebrow")}</div>
            <div className="mt-2 text-xl font-black text-white">{t("missionsScreen.emptyColumn.title")}</div>
            <div className="mt-2 text-[12px] leading-6 text-white/56">{resetLabel}</div>
          </div>
        )}
      </div>
    </section>
  );
}

function MissionContract({
  mission,
  progress,
  claim,
  claimFx,
  t,
}: {
  mission: Mission;
  progress: MissionProgress;
  claim: (id: string) => void;
  claimFx: ClaimFx | null;
  t: TranslateFn;
}) {
  const meta = METRIC_META[mission.metric] ?? METRIC_META.battles_won;
  const pct = Math.min(1, progress.progress / mission.goal);
  const ready = progress.progress >= mission.goal && !progress.claimed;
  const claimed = progress.claimed;
  const activeClaim = claimFx?.missionId === mission.id ? claimFx : null;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[22px] border p-2.5 transition duration-300 hover:-translate-y-0.5 md:p-3",
        ready
          ? "border-[#f5c451]/28 bg-[radial-gradient(circle_at_82%_12%,rgba(245,196,81,0.16),transparent_30%),linear-gradient(180deg,rgba(245,196,81,0.08),rgba(8,11,16,0.92))]"
          : claimed
            ? "border-emerald-300/16 bg-emerald-300/[0.045]"
            : "border-white/10 bg-white/[0.035]",
        activeClaim && "frontline-reward-success",
      )}
    >
      <RewardBurstOverlay key={`mission-claim-${activeClaim?.nonce ?? 0}`} rewards={activeClaim?.rewards} active={Boolean(activeClaim)} compact />
      <div className="flex gap-2.5">
        <GameIcon kind={meta.icon} tone={meta.tone} size="sm" className="mt-0.5 h-10 w-10 rounded-[13px]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-base font-black leading-tight text-white md:text-lg">{missionName(mission, t)}</div>
                <MiniBadge>{metricText(mission.metric, "source", t)}</MiniBadge>
              </div>
              <div className="mt-1 text-[11px] leading-4 text-white/52 md:text-[12px]">{missionDescription(mission, t)}</div>
              <div className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-white/40">{metricText(mission.metric, "short", t)}</div>
            </div>
            <StatusSeal ready={ready} claimed={claimed} compact t={t} />
          </div>

          <ProgressRail progress={pct} ready={ready} value={`${progress.progress}/${mission.goal}`} t={t} />
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap gap-2">
              <RewardChips rewards={mission.rewards} t={t} />
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href={meta.route}
                className="frontline-motion-action rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/66 transition hover:border-white/18"
              >
                {metricText(mission.metric, "cta", t)}
              </Link>
              <button
                type="button"
                onClick={() => claim(mission.id)}
                disabled={!ready}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] transition",
                  ready ? "bg-[#f5c451] text-black" : "bg-white/8 text-white/38",
                  ready && "frontline-motion-action frontline-feedback-claim",
                )}
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <ProgressionIcon name={claimed ? "claim" : ready ? "claim" : "unlock"} size="xs" withGlow={ready} />
                  {claimed ? t("missionsScreen.actions.done") : ready ? t("missionsScreen.actions.claim") : t("missionsScreen.actions.hold")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function LogMetric({
  icon,
  progressionIcon,
  label,
  value,
  tone,
  active,
}: {
  icon?: GlyphKind;
  progressionIcon?: ProgressionIconName;
  label: string;
  value: string;
  tone: GameIconTone;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[16px] border px-2 py-2 md:gap-2.5 md:rounded-[20px] md:px-3 md:py-2.5",
        active ? "border-[#f5c451]/24 bg-[#f5c451]/10" : "border-white/10 bg-white/[0.045]",
      )}
    >
      {progressionIcon ? (
        <ProgressionIcon name={progressionIcon} size="lg" />
      ) : (
        <GameIcon kind={icon ?? "rewards"} tone={tone} size="sm" className="h-10 w-10 md:h-11 md:w-11" />
      )}
      <div>
        <div className="text-[8px] font-black uppercase tracking-[0.14em] text-white/42 md:text-[9px] md:tracking-[0.18em]">{label}</div>
        <div className="mt-0.5 text-sm font-black text-white md:mt-1 md:text-lg">{value}</div>
      </div>
    </div>
  );
}

function ProgressRail({ progress, ready, value, t }: { progress: number; ready: boolean; value: string; t: TranslateFn }) {
  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em] text-white/46">
        <span>{ready ? t("missionsScreen.progress.readyToClaim") : t("missionsScreen.progress.progress")}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-black/34 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            ready ? "bg-[linear-gradient(90deg,#f5c451,#fff0bc)]" : "bg-[linear-gradient(90deg,#5dd39e,#8bdfff)]",
          )}
          style={{ width: `${Math.max(4, progress * 100)}%` }}
        />
      </div>
    </div>
  );
}

function RewardChips({ rewards, t }: { rewards: Rewards; t: TranslateFn }) {
  const chips: Array<{ icon: GlyphKind; tone: GameIconTone; value: number }> = [];
  if (rewards.gold) chips.push({ icon: "gold", tone: "gold", value: rewards.gold });
  if (rewards.dust) chips.push({ icon: "dust", tone: "violet", value: rewards.dust });
  if (rewards.gems) chips.push({ icon: "gem", tone: "sky", value: rewards.gems });
  if (rewards.accountXp) chips.push({ icon: "power", tone: "emerald", value: rewards.accountXp });
  if (rewards.arenaTickets) chips.push({ icon: "tickets", tone: "ember", value: rewards.arenaTickets });

  return (
    <>
      {chips.map((chip) => (
        <GameRewardToken
          key={`${chip.icon}-${chip.value}`}
          icon={chip.icon}
          tone={chip.tone}
          label={t(`missionsScreen.rewards.${chip.icon === "gem" ? "gems" : chip.icon === "power" ? "power" : chip.icon}`)}
          value={chip.value}
          size="sm"
          featured={chip.icon === "gold" || chip.icon === "gem" || chip.icon === "dust"}
        />
      ))}
    </>
  );
}

function StatusSeal({ ready, claimed, compact, t }: { ready: boolean; claimed: boolean; compact?: boolean; t: TranslateFn }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border font-black uppercase tracking-[0.14em]",
        compact ? "px-2.5 py-1 text-[9px]" : "px-3 py-1.5 text-[10px]",
        claimed
          ? "border-emerald-300/22 bg-emerald-300/10 text-emerald-200"
          : ready
            ? "border-[#f5c451]/24 bg-[#f5c451]/14 text-[#f5d498]"
            : "border-white/10 bg-white/[0.045] text-white/46",
      )}
    >
      <ProgressionIcon name={claimed ? "claim" : ready ? "claim" : "unlock"} size={compact ? "xs" : "sm"} withGlow={ready} />
      {claimed ? t("missionsScreen.status.claimed") : ready ? t("missionsScreen.status.ready") : t("missionsScreen.status.active")}
    </span>
  );
}

function MiniBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" }) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em]",
        tone === "gold" ? "border-[#f5c451]/22 bg-[#f5c451]/12 text-[#f5d498]" : "border-white/10 bg-white/[0.05] text-white/54",
      )}
    >
      {children}
    </span>
  );
}

function buildMissionStats(missions: Mission[], progress: Record<string, MissionProgress>) {
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

function pickNextMission(missions: Mission[], progress: Record<string, MissionProgress>) {
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

function getNearestResetLabel(missions: Mission[], progress: Record<string, MissionProgress>, t: TranslateFn) {
  const resetAt = missions
    .map((mission) => progress[mission.id]?.resetAt)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => Date.parse(a) - Date.parse(b))[0];
  return formatResetLabel(resetAt, t);
}

function formatResetLabel(resetAt: string | undefined, t: TranslateFn) {
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

function freshProgress(): MissionProgress {
  return { progress: 0, claimed: false, resetAt: "" };
}
