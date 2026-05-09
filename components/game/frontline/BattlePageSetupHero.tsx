"use client";

import type { FrontlineHeroDef } from "@/features/frontline/types";
import { useI18n } from "@/lib/i18n/useI18n";
import { EnemyStagePiece, PowerChip, ReadinessChip } from "./BattlePageMatchup";

export function BattlePageSetupHero({
  adventureChapter,
  title,
  squadCount,
  deckCount,
  squadReady,
  deckReady,
  allyPower,
  enemyPower,
  enemyHeroes,
  selectedPresetId,
}: {
  adventureChapter: number | null;
  title: string;
  squadCount: number;
  deckCount: number;
  squadReady: boolean;
  deckReady: boolean;
  allyPower: number;
  enemyPower: number;
  enemyHeroes: (FrontlineHeroDef | null)[];
  selectedPresetId: string;
}) {
  const { t } = useI18n();

  return (
    <div className="relative min-w-0 overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(8,10,16,0.52)_54%,rgba(0,0,0,0.16))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:p-5">
      <div className="pointer-events-none absolute inset-x-6 bottom-6 h-24 rounded-[50%] bg-[radial-gradient(ellipse_at_50%_50%,rgba(245,196,81,0.16),transparent_70%)]" />
      <div className="relative z-[1] flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="inline-flex rounded-full border border-[#f5c451]/24 bg-[#f5c451]/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">
            {adventureChapter ? t("frontline.adventureGate", { chapter: adventureChapter }) : t("frontline.command")}
          </div>
          <h1 className="mt-4 max-w-[44rem] text-[2.1rem] font-black leading-[0.94] text-white md:text-[3.35rem]">
            {title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <ReadinessChip label={t("frontline.squad")} value={`${squadCount}/3`} ok={squadReady} t={t} />
            <ReadinessChip label={t("frontline.deck")} value={`${deckCount}/8`} ok={deckReady} t={t} />
            <PowerChip label={t("frontline.allyPower")} value={allyPower} tone="ally" />
            <PowerChip label={t("frontline.enemyPower")} value={enemyPower} tone="enemy" />
          </div>
        </div>
        <div className="relative grid min-h-[9.5rem] min-w-[16rem] grid-cols-3 items-end gap-2 rounded-[28px] border border-rose-200/12 bg-[radial-gradient(circle_at_50%_18%,rgba(240,95,114,0.18),transparent_48%),linear-gradient(180deg,rgba(72,24,34,0.3),rgba(6,7,12,0.68))] px-4 pb-3 pt-4">
          <div className="absolute left-5 top-3 text-[9px] font-black uppercase tracking-[0.18em] text-rose-100/58">{t("frontline.missionEnemy")}</div>
          {enemyHeroes.map((hero, index) => (
            <EnemyStagePiece key={`${selectedPresetId}-stage-${hero?.heroId ?? index}`} hero={hero} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
