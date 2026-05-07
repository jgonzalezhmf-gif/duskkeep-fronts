"use client";

import { ModeIcon } from "@/components/game/shared/ModeIcon";
import { SceneButton, ScreenBadge } from "@/components/game/screens/ScreenChrome";
import { FRONTLINE_LEADER_BY_ID, FRONTLINE_PRESET_BY_ID } from "@/features/frontline/data";
import { cn } from "@/lib/cn";
import { frontlineLeaderName, frontlinePresetName } from "@/lib/i18n/frontlineText";
import { EnemyLineup, RewardChips, SmallStat } from "./EventsPrimitives";
import type { FrontlineEventOperation, TranslateFn } from "./eventsPageHelpers";

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
  const buttonLabel = !unlocked
    ? t("eventsScreen.card.unlocksAtLevel", { level: operation.unlockLevel })
    : done
      ? t("eventsScreen.card.replayOperation")
      : t("eventsScreen.card.startOperation");

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[26px] border p-3 shadow-[0_20px_44px_rgba(0,0,0,0.26)]",
        featured
          ? "border-violet-200/24 bg-[radial-gradient(circle_at_48%_0%,rgba(211,167,255,0.18),transparent_34%),linear-gradient(180deg,rgba(40,27,62,0.64),rgba(8,10,16,0.9))]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.052),rgba(8,10,16,0.88))]",
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/8 blur-2xl" />
      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/44">{operation.eyebrow}</div>
            <div className={cn("mt-1 font-black leading-none text-white", featured ? "text-3xl" : "text-2xl")}>{operation.name}</div>
            <div className="mt-2 text-[12px] font-black uppercase tracking-[0.13em] text-[#f5d498]">{operation.signature}</div>
          </div>
          <ModeIcon name={operation.icon} size={featured ? "lg" : "md"} />
        </div>

        {unlocked ? <p className="mt-2 max-w-[42rem] text-[12px] leading-5 text-white/58">{operation.description}</p> : null}

        <div className="mt-3 flex flex-wrap gap-2">
          <ScreenBadge tone={done ? "emerald" : unlocked ? "gold" : "neutral"}>{done ? t("eventsScreen.card.clearedToday") : unlocked ? t("eventsScreen.card.live") : t("eventsScreen.card.locked")}</ScreenBadge>
          <ScreenBadge tone={operation.threat === "epic" ? "ember" : operation.threat === "rare" ? "sky" : "neutral"}>{t(`eventsScreen.card.${operation.threat}`)}</ScreenBadge>
          <ScreenBadge tone="sky">{operation.mutator}</ScreenBadge>
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
