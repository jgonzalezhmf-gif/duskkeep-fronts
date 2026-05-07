"use client";

import { FortressIcon } from "@/components/game/shared/FortressIcon";
import GameIcon from "@/components/game/shared/GameIcon";
import { RewardBurstOverlay } from "@/components/game/shared/RewardBurstOverlay";
import { cn } from "@/lib/cn";
import type { FrontlineFortressOutcome, Rewards } from "@/lib/types";
import { integrityMeta, outcomeMeta, type TranslateFn } from "./fortressPageHelpers";
import { MiniFact, RewardRow } from "./FortressPrimitives";

export function FortressStatus({
  integrity,
  integrityState,
  forecast,
  lastReport,
  reportPulse,
  t,
}: {
  integrity: number;
  integrityState: ReturnType<typeof integrityMeta>;
  forecast: { attackPower: number; defensePower: number; outcome: FrontlineFortressOutcome; rewards: Rewards };
  lastReport: { outcome: FrontlineFortressOutcome; attackPower: number; defensePower: number; integrityDelta: number; rewards: Rewards } | null;
  reportPulse: boolean;
  t: TranslateFn;
}) {
  const lastState = lastReport ? outcomeMeta(lastReport.outcome, t) : null;
  return (
    <section className="grid gap-3">
      <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,20,31,0.66),rgba(6,8,14,0.86))] p-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <FortressIcon name="integrity" size="md" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/44">{t("fortressScreen.status.wallCondition")}</div>
              <div className="mt-1 text-xl font-black text-white">{integrityState.label}</div>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{integrity}%</div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/8">
          <div className={cn("h-full rounded-full", integrityState.bar)} style={{ width: `${Math.max(8, integrity)}%` }} />
        </div>
      </div>

      <div className={cn("relative overflow-hidden rounded-[24px] border p-3 backdrop-blur-xl transition", lastState ? lastState.panel : "border-white/10 bg-[linear-gradient(180deg,rgba(15,20,31,0.58),rgba(6,8,14,0.84))]", reportPulse && "frontline-reward-success animate-[rewardPop_0.85s_ease-out_1] ring-2 ring-[#f5c451]/24")}>
        <RewardBurstOverlay rewards={lastReport?.rewards} active={reportPulse} compact />
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <FortressIcon name={lastReport && lastReport.integrityDelta < 0 ? "repair" : "raid"} size="md" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/44">{t("fortressScreen.status.lastRaidReport")}</div>
              <div className="mt-1 text-lg font-black text-white">{lastState?.headline ?? t("fortressScreen.status.noReport")}</div>
            </div>
          </div>
          <GameIcon kind="rewards" tone={lastState?.iconTone ?? "steel"} size="sm" />
        </div>
        {lastReport ? (
          <>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <MiniFact label={t("fortressScreen.metrics.attack")} value={lastReport.attackPower} />
              <MiniFact label={t("fortressScreen.metrics.defense")} value={lastReport.defensePower} />
              <MiniFact label={t("fortressScreen.metrics.wall")} value={lastReport.integrityDelta} danger={lastReport.integrityDelta < 0} />
            </div>
            <RewardRow rewards={lastReport.rewards} className="mt-3" t={t} />
          </>
        ) : (
          <div className="mt-3 text-[12px] leading-5 text-white/52">
            {t("fortressScreen.status.emptyReport")}
          </div>
        )}
      </div>

      <div className="rounded-[24px] border border-white/10 bg-black/18 p-3 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/44">
          <FortressIcon name="watchtower" size="sm" />
          <span>{t("fortressScreen.status.currentForecast")}</span>
        </div>
        <div className="mt-2 text-sm font-black text-white">{outcomeMeta(forecast.outcome, t).headline}</div>
      </div>
    </section>
  );
}

export function RaidHistoryPanel({
  lastReport,
  raidsResolved,
  integrity,
  t,
}: {
  lastReport: { outcome: FrontlineFortressOutcome } | null;
  raidsResolved: number;
  integrity: number;
  t: TranslateFn;
}) {
  const outcome = lastReport ? outcomeMeta(lastReport.outcome, t) : null;
  return (
    <details className="group rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,15,22,0.5),rgba(5,7,12,0.78))] p-3 backdrop-blur-xl">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{t("fortressScreen.loop.eyebrow")}</div>
          <div className="mt-1 text-base font-black text-white">{outcome?.label ?? t("fortressScreen.loop.awaiting")}</div>
        </div>
        <span className="inline-flex items-center gap-2">
          <FortressIcon name="keep" size="md" />
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/42 group-open:hidden">{raidsResolved} / {integrity}%</span>
        </span>
      </summary>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniFact label={t("fortressScreen.metrics.resolved")} value={raidsResolved} />
        <MiniFact label={t("fortressScreen.metrics.integrity")} value={`${integrity}%`} />
      </div>
    </details>
  );
}
