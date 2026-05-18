"use client";

import { FrontlineHeroStandee } from "@/components/game/frontline/FrontlineVisualPrimitives";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import { SceneButton } from "@/components/game/screens/ScreenChrome";
import {
  FRONTLINE_LEADER_BY_ID,
  FRONTLINE_PRESET_BY_ID,
  FRONTLINE_UNIT_BY_ID,
} from "@/features/frontline/data";
import type { LadderOpponent } from "@/features/ladder/data";
import { ladderRankLabel } from "@/features/ladder/data";
import { cn } from "@/lib/cn";
import { frontlineLeaderName } from "@/lib/i18n/frontlineText";
import { RewardChips, SmallStat } from "./ArenaPrimitives";
import type { TranslateFn } from "./arenaPageHelpers";

export function LadderRivalCard({
  opponent,
  active,
  disabled,
  onChallenge,
  t,
}: {
  opponent: LadderOpponent;
  active: boolean;
  disabled: boolean;
  onChallenge: () => void;
  t: TranslateFn;
}) {
  const preset = FRONTLINE_PRESET_BY_ID[opponent.presetId];
  const leader = FRONTLINE_LEADER_BY_ID[preset?.leaderId ?? ""];

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[28px] border p-3 shadow-[0_22px_52px_rgba(0,0,0,0.28)]",
        active
          ? "border-[#f5c451]/30 bg-[radial-gradient(circle_at_50%_0%,rgba(245,196,81,0.2),transparent_34%),linear-gradient(180deg,rgba(48,33,18,0.6),rgba(7,9,15,0.96))]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(8,10,16,0.94))] opacity-72",
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#f5c451]/12 blur-2xl" />
      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/44">
              {ladderRankLabel(opponent)}
            </div>
            <div className="mt-1 text-2xl font-black text-white">{opponent.ownerName}</div>
            <div className="mt-1 text-[12px] font-black uppercase tracking-[0.13em] text-[#f5d498]">
              {opponent.style}
            </div>
          </div>
          <div className="rounded-[18px] border border-[#f5c451]/16 bg-[#f5c451]/8 p-1.5">
            <ModeIcon name="ladder" size="md" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {preset?.squad.map((unitId, index) => {
            const unit = FRONTLINE_UNIT_BY_ID[unitId] ?? null;
            return (
              <FrontlineHeroStandee
                key={`${opponent.id}-${unitId}-${index}`}
                hero={unit}
                compact
                side="enemy"
                label={index === 0 ? t("arenaScreen.card.left") : index === 1 ? t("arenaScreen.card.center") : t("arenaScreen.card.right")}
                className="min-h-[9.25rem] rounded-[20px] p-1.5"
              />
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <SmallStat label={t("arenaScreen.card.power")} value={opponent.power} />
          <SmallStat label={t("arenaScreen.card.leader")} value={frontlineLeaderName(t, leader)} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <RewardChips rewards={opponent.previewRewards} t={t} />
        </div>

        <SceneButton onClick={onChallenge} disabled={disabled || !active} className="mt-4 w-full">
          {active ? t("arenaScreen.ladder.challenge") : t("arenaScreen.ladder.locked")}
        </SceneButton>
      </div>
    </article>
  );
}
