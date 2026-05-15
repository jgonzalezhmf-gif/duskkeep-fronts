"use client";

import { ModeIcon } from "@/components/game/shared/ModeIcon";
import { SceneButton, ScreenBadge } from "@/components/game/screens/ScreenChrome";
import { FRONTLINE_LEADER_BY_ID, FRONTLINE_PRESET_BY_ID } from "@/features/frontline/data";
import { cn } from "@/lib/cn";
import { frontlineLeaderName, frontlinePresetName } from "@/lib/i18n/frontlineText";
import { EnemyLineup, RewardChips, SmallStat } from "./EventsPrimitives";
import type { FrontlineEventOperation, TranslateFn } from "./eventsPageHelpers";

const NEUTRAL_SIGNAL_STYLE = {
  frame: "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.052),rgba(8,10,16,0.88))]",
  signal: "border-white/10 bg-white/[0.045]",
  accent: "from-white/50 via-white/24 to-transparent",
};

const OPERATION_SIGNAL_STYLES: Record<
  FrontlineEventOperation["tone"],
  {
    frame: string;
    signal: string;
    accent: string;
  }
> = {
  ember: {
    frame: "border-rose-200/18 bg-[radial-gradient(circle_at_50%_0%,rgba(248,113,113,0.16),transparent_35%),linear-gradient(180deg,rgba(45,20,24,0.62),rgba(8,10,16,0.9))]",
    signal: "border-rose-200/16 bg-rose-300/8",
    accent: "from-rose-200/70 via-amber-200/46 to-transparent",
  },
  emerald: {
    frame: "border-emerald-200/18 bg-[radial-gradient(circle_at_50%_0%,rgba(110,231,183,0.14),transparent_35%),linear-gradient(180deg,rgba(18,42,34,0.58),rgba(8,10,16,0.9))]",
    signal: "border-emerald-200/16 bg-emerald-300/8",
    accent: "from-emerald-200/70 via-cyan-200/42 to-transparent",
  },
  gold: {
    frame: "border-[#f5c451]/22 bg-[radial-gradient(circle_at_50%_0%,rgba(245,196,81,0.18),transparent_35%),linear-gradient(180deg,rgba(48,36,18,0.62),rgba(8,10,16,0.9))]",
    signal: "border-[#f5c451]/18 bg-[#f5c451]/10",
    accent: "from-[#f5d498]/80 via-[#f5c451]/42 to-transparent",
  },
  sky: {
    frame: "border-sky-200/18 bg-[radial-gradient(circle_at_50%_0%,rgba(125,211,252,0.15),transparent_35%),linear-gradient(180deg,rgba(18,34,48,0.58),rgba(8,10,16,0.9))]",
    signal: "border-sky-200/16 bg-sky-300/8",
    accent: "from-sky-200/74 via-cyan-200/42 to-transparent",
  },
  steel: {
    frame: "border-slate-200/16 bg-[radial-gradient(circle_at_50%_0%,rgba(203,213,225,0.12),transparent_35%),linear-gradient(180deg,rgba(28,35,47,0.58),rgba(8,10,16,0.9))]",
    signal: "border-slate-200/14 bg-slate-300/7",
    accent: "from-slate-100/64 via-slate-300/32 to-transparent",
  },
  violet: {
    frame: "border-violet-200/20 bg-[radial-gradient(circle_at_50%_0%,rgba(211,167,255,0.18),transparent_35%),linear-gradient(180deg,rgba(40,27,62,0.64),rgba(8,10,16,0.9))]",
    signal: "border-violet-200/16 bg-violet-300/9",
    accent: "from-violet-100/76 via-fuchsia-200/42 to-transparent",
  },
};

export function EventOperationCard({
  operation,
  featured,
  unlocked,
  done,
  disabled,
  onStart,
  t,
}: {
  operation: FrontlineEventOperation;
  featured?: boolean;
  unlocked: boolean;
  done: boolean;
  disabled: boolean;
  onStart: () => void;
  t: TranslateFn;
}) {
  const preset = FRONTLINE_PRESET_BY_ID[operation.presetId];
  const leader = FRONTLINE_LEADER_BY_ID[preset?.leaderId ?? ""];
  const signalStyle = OPERATION_SIGNAL_STYLES[operation.tone] ?? NEUTRAL_SIGNAL_STYLE;
  const buttonLabel = !unlocked
    ? t("eventsScreen.card.unlocksAtLevel", { level: operation.unlockLevel })
    : done
      ? t("eventsScreen.card.replayOperation")
      : t("eventsScreen.card.startOperation");

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[26px] border p-3 shadow-[0_20px_44px_rgba(0,0,0,0.26)]",
        featured ? signalStyle.frame : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.052),rgba(8,10,16,0.88))]",
      )}
    >
      <div className={cn("pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r", signalStyle.accent)} />
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/8 blur-2xl" />
      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/44">{operation.eyebrow}</div>
            <div className={cn("mt-1 font-black leading-none text-white", featured ? "text-3xl" : "text-2xl")}>{operation.name}</div>
          </div>
          <ModeIcon name={operation.icon} size={featured ? "lg" : "md"} />
        </div>

        <div className={cn("mt-3 overflow-hidden rounded-[18px] border px-3 py-2", signalStyle.signal)}>
          <div className={cn("mb-2 h-px w-24 bg-gradient-to-r", signalStyle.accent)} />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-[0.13em]">
            <span className="text-white/78">{operation.signature}</span>
            <span className="h-1 w-1 rounded-full bg-white/24" aria-hidden="true" />
            <span className="text-white/48">{operation.mutator}</span>
          </div>
        </div>

        {unlocked ? <p className="mt-2 max-w-[42rem] text-[12px] leading-5 text-white/58">{operation.description}</p> : null}

        <div className="mt-3 flex flex-wrap gap-2">
          <ScreenBadge tone={done ? "emerald" : unlocked ? "gold" : "neutral"}>{done ? t("eventsScreen.card.clearedToday") : unlocked ? t("eventsScreen.card.live") : t("eventsScreen.card.locked")}</ScreenBadge>
          <ScreenBadge tone={operation.threat === "epic" ? "ember" : operation.threat === "rare" ? "sky" : "neutral"}>{t(`eventsScreen.card.${operation.threat}`)}</ScreenBadge>
        </div>

        {unlocked ? <EnemyLineup operationId={operation.id} preset={preset} t={t} /> : null}

        {unlocked ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <SmallStat label={t("eventsScreen.card.preset")} value={frontlinePresetName(t, preset)} />
            <SmallStat label={t("eventsScreen.card.leader")} value={frontlineLeaderName(t, leader)} />
            <SmallStat
              label={t("eventsScreen.card.reward")}
              value={
                done ? (
                  <ScreenBadge tone="emerald">{t("eventsScreen.result.dailyPayoutClaimed")}</ScreenBadge>
                ) : (
                  <RewardChips rewards={operation.rewards} compact t={t} />
                )
              }
            />
          </div>
        ) : (
          <div className="mt-3 rounded-[16px] border border-white/10 bg-black/18 px-3 py-2">
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{t("eventsScreen.card.reward")}</div>
            <div className="mt-2">
              <RewardChips rewards={operation.rewards} compact t={t} />
            </div>
          </div>
        )}

        {operation.firstClearRewards && !done ? (
          <div className="mt-2.5 rounded-[16px] border border-[#f5c451]/16 bg-[#f5c451]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#f5d498]">
            {t("eventsScreen.card.firstClearBonus")}
          </div>
        ) : null}

        <SceneButton onClick={onStart} disabled={disabled} className="mt-3 w-full">
          {buttonLabel}
        </SceneButton>
      </div>
    </article>
  );
}
