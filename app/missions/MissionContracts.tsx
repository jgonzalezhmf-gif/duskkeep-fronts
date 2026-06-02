"use client";

import Link from "next/link";
import GameIcon from "@/components/game/shared/GameIcon";
import { LazyRewardBurstOverlay } from "@/components/game/shared/LazyRewardBurstOverlay";
import { PendingActionLabel } from "@/components/game/shared/PendingActionFeedback";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { cn } from "@/lib/cn";
import { createPendingActionKey, isPendingAction } from "@/lib/pendingActions";
import type { Mission, MissionProgress, Rewards } from "@/lib/types";
import {
  METRIC_META,
  buildMissionRouteSummaries,
  freshProgress,
  formatResetLabel,
  metricText,
  missionDescription,
  missionName,
  type TranslateFn,
} from "./missionsPageHelpers";
import { MiniBadge, ProgressRail, RewardChips, StatusSeal } from "./MissionsPrimitives";

export type ClaimFx = {
  missionId: string;
  rewards: Rewards;
  nonce: number;
};

export function MissionRouteMap({
  missions,
  progress,
  t,
}: {
  missions: Mission[];
  progress: Record<string, MissionProgress>;
  t: TranslateFn;
}) {
  const summaries = buildMissionRouteSummaries(missions, progress);
  if (!summaries.length) return null;

  return (
    <div className="mt-3 hidden gap-2 md:grid md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
      {summaries.map((summary) => {
        const ready = summary.ready > 0;
        return (
          <Link
            key={summary.metric}
            href={summary.route}
            className={cn(
              "frontline-motion-action group relative overflow-hidden rounded-[18px] border p-2.5 transition hover:-translate-y-0.5 md:p-3",
              ready
                ? "border-[#f5c451]/24 bg-[#f5c451]/10 shadow-[0_16px_34px_rgba(245,196,81,0.08)]"
                : "border-white/10 bg-white/[0.045] hover:border-white/18 hover:bg-white/[0.065]",
            )}
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/10 blur-2xl opacity-0 transition group-hover:opacity-100" />
            <div className="relative z-[1] flex items-center gap-2.5">
              <GameIcon kind={summary.icon} tone={summary.tone} size="sm" className="h-10 w-10 rounded-[14px]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-[11px] font-black uppercase tracking-[0.16em] text-white/76">
                    {metricText(summary.metric, "source", t)}
                  </div>
                  <span className={cn("shrink-0 text-[10px] font-black uppercase tracking-[0.12em]", ready ? "text-[#f5d498]" : "text-white/42")}>
                    {summary.ready}/{summary.active}
                  </span>
                </div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-white/42">
                  {metricText(summary.metric, "short", t)}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/35">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      ready ? "bg-[linear-gradient(90deg,#f5c451,#fff0bc)]" : "bg-[linear-gradient(90deg,#5dd39e,#8bdfff)]",
                    )}
                    style={{ width: `${Math.max(8, summary.progress * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function NextContract({
  mission,
  progress,
  claim,
  claimFx,
  pendingClaimKeys,
  t,
}: {
  mission: Mission | null;
  progress: Record<string, MissionProgress>;
  claim: (id: string) => void | Promise<void>;
  claimFx: ClaimFx | null;
  pendingClaimKeys: readonly string[];
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
  const pending = isPendingAction(pendingClaimKeys, createPendingActionKey("missions.claim", mission.id));
  const anyPending = pendingClaimKeys.length > 0;

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
      <LazyRewardBurstOverlay key={`next-claim-${activeClaim?.nonce ?? 0}`} rewards={activeClaim?.rewards} active={Boolean(activeClaim)} />
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
            disabled={!ready || anyPending}
            className={cn(
              "rounded-[18px] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] transition",
              ready ? "bg-[#f5c451] text-black shadow-[0_16px_34px_rgba(245,196,81,0.2)]" : "bg-white/8 text-white/42",
              ready && "frontline-motion-action frontline-feedback-claim",
            )}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <ProgressionIcon name={p.claimed ? "claim" : ready ? "claim" : "unlock"} size="sm" withGlow={ready} />
              <PendingActionLabel pending={pending} pendingLabel={t("missionsScreen.actions.claiming")}>
                {p.claimed ? t("missionsScreen.actions.claimed") : ready ? t("missionsScreen.actions.claim") : t("missionsScreen.actions.locked")}
              </PendingActionLabel>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function MissionColumn({
  title,
  cadence,
  missions,
  progress,
  claim,
  claimFx,
  pendingClaimKeys,
  t,
}: {
  title: string;
  cadence: string;
  missions: Mission[];
  progress: Record<string, MissionProgress>;
  claim: (id: string) => void | Promise<void>;
  claimFx: ClaimFx | null;
  pendingClaimKeys: readonly string[];
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
            <MissionContract key={mission.id} mission={mission} progress={progress[mission.id] ?? freshProgress()} claim={claim} claimFx={claimFx} pendingClaimKeys={pendingClaimKeys} t={t} />
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
  pendingClaimKeys,
  t,
}: {
  mission: Mission;
  progress: MissionProgress;
  claim: (id: string) => void | Promise<void>;
  claimFx: ClaimFx | null;
  pendingClaimKeys: readonly string[];
  t: TranslateFn;
}) {
  const meta = METRIC_META[mission.metric] ?? METRIC_META.battles_won;
  const pct = Math.min(1, progress.progress / mission.goal);
  const ready = progress.progress >= mission.goal && !progress.claimed;
  const claimed = progress.claimed;
  const activeClaim = claimFx?.missionId === mission.id ? claimFx : null;
  const pending = isPendingAction(pendingClaimKeys, createPendingActionKey("missions.claim", mission.id));
  const anyPending = pendingClaimKeys.length > 0;

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
      <LazyRewardBurstOverlay key={`mission-claim-${activeClaim?.nonce ?? 0}`} rewards={activeClaim?.rewards} active={Boolean(activeClaim)} compact />
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
                disabled={!ready || anyPending}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] transition",
                  ready ? "bg-[#f5c451] text-black" : "bg-white/8 text-white/38",
                  ready && "frontline-motion-action frontline-feedback-claim",
                )}
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <ProgressionIcon name={claimed ? "claim" : ready ? "claim" : "unlock"} size="xs" withGlow={ready} />
                  <PendingActionLabel pending={pending} pendingLabel={t("missionsScreen.actions.claiming")}>
                    {claimed ? t("missionsScreen.actions.done") : ready ? t("missionsScreen.actions.claim") : t("missionsScreen.actions.hold")}
                  </PendingActionLabel>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
