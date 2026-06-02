"use client";

import { ModeIcon } from "@/components/game/shared/ModeIcon";
import { FortressIcon } from "@/components/game/shared/FortressIcon";
import { ScreenBadge } from "@/components/game/screens/ScreenChrome";
import { cn } from "@/lib/cn";
import type { FrontlineFortressOutcome, Rewards } from "@/lib/types";
import { buildFortressLoopSteps, outcomeMeta, type FortressLoopStepTone, type TranslateFn } from "./fortressPageHelpers";
import { HeroMetric, PressureBar, RewardRow } from "./FortressPrimitives";

export function FortressHero({
  raidReady,
  forecast,
  nextAttackLabel,
  integrity,
  defenseRating,
  garrisonFilled,
  upgradeReady,
  t,
}: {
  raidReady: boolean;
  forecast: FrontlineFortressOutcome;
  nextAttackLabel: string;
  integrity: number;
  defenseRating: number;
  garrisonFilled: number;
  upgradeReady: boolean;
  t: TranslateFn;
}) {
  const state = outcomeMeta(forecast, t);
  const loopSteps = buildFortressLoopSteps({ raidReady, garrisonFilled, upgradeReady, nextAttackLabel });
  return (
    <div className="max-w-[44rem]">
      <div className="flex flex-wrap items-center gap-2">
        <ScreenBadge tone={raidReady ? "ember" : "gold"}>{raidReady ? t("fortressScreen.watch.raidAtGate") : t("fortressScreen.watch.castleWatch")}</ScreenBadge>
        <ScreenBadge tone={state.badgeTone}>{state.label}</ScreenBadge>
      </div>
      <h1 className="mt-1.5 max-w-[31rem] text-[1.65rem] font-black leading-[0.92] text-white drop-shadow-[0_12px_28px_rgba(0,0,0,0.42)] md:text-[2.3rem]">
        {t("fortressScreen.watch.title")}
      </h1>
      <p className="mt-1.5 hidden max-w-[31rem] text-[11px] leading-4 text-white/50 2xl:block">
        {t("fortressScreen.watch.copy")}
      </p>

      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <HeroMetric icon="integrity" label={t("fortressScreen.metrics.integrity")} value={`${integrity}%`} />
        <HeroMetric icon="defense_rating" label={t("fortressScreen.metrics.defense")} value={defenseRating} />
        <HeroMetric icon="garrison" label={t("fortressScreen.metrics.guards")} value={`${garrisonFilled}/3`} />
        <HeroMetric icon="raid" label={t("fortressScreen.metrics.nextRaid")} value={nextAttackLabel} />
      </div>

      <div className="mt-2.5 grid gap-1.5 sm:grid-cols-3">
        {loopSteps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "relative overflow-hidden rounded-[17px] border px-2 py-2 backdrop-blur-xl",
              LOOP_TONE_CLASSES[step.tone],
            )}
          >
            <div className="flex items-center gap-1.5">
              <FortressIcon name={step.icon} size="sm" className="h-8 w-8" />
              <div className="min-w-0">
                <div className="text-[8px] font-black uppercase tracking-[0.13em] text-white/42">
                  {index + 1}. {t(step.labelKey)}
                </div>
                <div className="mt-0.5 truncate text-[10px] font-black uppercase tracking-[0.1em] text-white">
                  {step.value ?? (step.valueKey ? t(step.valueKey) : "")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const LOOP_TONE_CLASSES: Record<FortressLoopStepTone, string> = {
  ready: "border-[#f5c451]/20 bg-[#f5c451]/10",
  waiting: "border-white/10 bg-black/22",
  attention: "border-orange-200/18 bg-orange-300/10",
};

export function RaidActionPanel({
  raidReady,
  nextAttackLabel,
  forecast,
  forecastState,
  onResolve,
  t,
}: {
  raidReady: boolean;
  nextAttackLabel: string;
  forecast: { attackPower: number; defensePower: number; outcome: FrontlineFortressOutcome; rewards: Rewards };
  forecastState: ReturnType<typeof outcomeMeta>;
  onResolve: () => void;
  t: TranslateFn;
}) {
  const max = Math.max(forecast.attackPower, forecast.defensePower, 1);
  return (
    <div className={cn("relative overflow-hidden rounded-[22px] border p-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.22)]", forecastState.panel)}>
      <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/14 blur-2xl" />
      <div className="relative z-[1] flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/44">{t("fortressScreen.raid.watch")}</div>
          <div className="mt-1 text-lg font-black text-white">{raidReady ? t("fortressScreen.raid.resolveNow") : nextAttackLabel}</div>
        </div>
        <ModeIcon name="fortress_raid" size="lg" />
      </div>

      <div className="relative z-[1] mt-2.5 space-y-2">
        <PressureBar label={t("fortressScreen.metrics.raid")} value={forecast.attackPower} max={max} tone="enemy" />
        <PressureBar label={t("fortressScreen.metrics.walls")} value={forecast.defensePower} max={max} tone="ally" />
      </div>

      <RewardRow rewards={forecast.rewards} className="relative z-[1] mt-2.5" t={t} />

      <button
        className="frontline-motion-action frontline-feedback-claim relative z-[1] mt-2.5 w-full overflow-hidden rounded-[18px] border border-[#f8d57b]/28 bg-[linear-gradient(180deg,#fff0bc_0%,#f5c451_46%,#b96d1f_100%)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#221102] shadow-[0_16px_30px_rgba(245,196,81,0.2)] transition disabled:opacity-40 disabled:hover:translate-y-0"
        disabled={!raidReady}
        onClick={onResolve}
      >
        {raidReady ? t("fortressScreen.raid.resolveRaid") : t("fortressScreen.raid.notReady")}
      </button>
    </div>
  );
}
