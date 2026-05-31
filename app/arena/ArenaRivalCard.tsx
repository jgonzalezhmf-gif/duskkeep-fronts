"use client";

import { FrontlineHeroStandee } from "@/components/game/frontline/FrontlineVisualPrimitives";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import { SceneButton } from "@/components/game/screens/ScreenChrome";
import {
  FRONTLINE_LEADER_BY_ID,
  FRONTLINE_PRESET_BY_ID,
  FRONTLINE_UNIT_BY_ID,
} from "@/features/frontline/data";
import { getArenaTrialMutatorForRival } from "@/features/arena/trialMutators";
import { cn } from "@/lib/cn";
import { frontlineLeaderName } from "@/lib/i18n/frontlineText";
import { RewardChips, SmallStat } from "./ArenaPrimitives";
import { arenaModifierLabel, arenaModifierText, rivalText, type ArenaRival, type TranslateFn } from "./arenaPageHelpers";

export function ArenaRivalCard({
  rival,
  featured,
  disabled,
  onChallenge,
  t,
}: {
  rival: ArenaRival;
  featured?: boolean;
  disabled: boolean;
  onChallenge: () => void;
  t: TranslateFn;
}) {
  const preset = FRONTLINE_PRESET_BY_ID[rival.presetId];
  const leader = FRONTLINE_LEADER_BY_ID[preset?.leaderId ?? ""];
  const mutator = getArenaTrialMutatorForRival(rival.id);
  const mutatorChips = [
    mutator?.modifiers.enemyCoreBonus
      ? t("frontline.modifierEnemyCore", { amount: mutator.modifiers.enemyCoreBonus })
      : null,
    mutator?.modifiers.enemyStartingCommandBonus
      ? t("frontline.modifierEnemyCommand", { amount: mutator.modifiers.enemyStartingCommandBonus })
      : null,
  ].filter((chip): chip is string => Boolean(chip));

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[28px] border p-3 shadow-[0_22px_52px_rgba(0,0,0,0.28)]",
        featured
          ? "border-[#f5c451]/28 bg-[radial-gradient(circle_at_50%_0%,rgba(245,196,81,0.18),transparent_32%),linear-gradient(180deg,rgba(54,34,17,0.58),rgba(8,10,16,0.96))]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(8,10,16,0.94))]",
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/44">{t("arenaScreen.trials.badge")}</div>
            <div className="mt-1 text-2xl font-black text-white">{rival.ownerName}</div>
            <div className="mt-1 text-[12px] font-black uppercase tracking-[0.13em] text-[#f5d498]">{rivalText(t, rival, "style")}</div>
          </div>
          <div className="rounded-[18px] border border-[#f5c451]/16 bg-[#f5c451]/8 p-1.5">
            <ModeIcon name="arena_draft" size="md" />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <TrialPill>{t("arenaScreen.trials.ticketCost")}</TrialPill>
          <TrialPill>{t("arenaScreen.trials.specialReward")}</TrialPill>
          <TrialPill>{t("arenaScreen.trials.specialChallenge")}</TrialPill>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {preset?.squad.map((unitId, index) => {
            const unit = FRONTLINE_UNIT_BY_ID[unitId] ?? null;
            return (
              <FrontlineHeroStandee
                key={`${rival.id}-${unitId}-${index}`}
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
          <SmallStat label={t("arenaScreen.card.power")} value={rival.power} />
          <SmallStat label={t("arenaScreen.card.leader")} value={frontlineLeaderName(t, leader)} />
        </div>

        <div className="mt-3 rounded-[18px] border border-[#f5c451]/14 bg-[radial-gradient(circle_at_14%_16%,rgba(245,196,81,0.16),transparent_32%),rgba(245,196,81,0.08)] px-3 py-2 text-[11px] font-bold leading-snug text-[#ffe0a4]/82">
          <span className="mb-1 block text-[8px] font-black uppercase tracking-[0.18em] text-[#f5d498]/72">{t("arenaScreen.trials.modifier")}</span>
          <span className="block text-[12px] font-black uppercase tracking-[0.14em] text-white">{arenaModifierLabel(t, rival)}</span>
          <span className="mt-1 block">{arenaModifierText(t, rival)}</span>
          {mutatorChips.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {mutatorChips.map((chip) => (
                <TrialEffectChip key={chip}>{chip}</TrialEffectChip>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <RewardChips rewards={rival.rewards} t={t} />
        </div>

        <SceneButton onClick={onChallenge} disabled={disabled} className="mt-4 w-full">
          {t("arenaScreen.trials.challenge")}
        </SceneButton>
      </div>
    </article>
  );
}

function TrialPill({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full border border-orange-200/14 bg-orange-300/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-orange-100/82">
      {children}
    </span>
  );
}

function TrialEffectChip({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full border border-white/12 bg-black/24 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-white/72">
      {children}
    </span>
  );
}
