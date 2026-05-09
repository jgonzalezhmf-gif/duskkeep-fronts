"use client";

import Link from "next/link";
import { RewardPreview } from "@/components/game/frontline/BattlePagePanels";
import { useI18n } from "@/lib/i18n/useI18n";
import type { Rewards } from "@/lib/types";

export function BattlePageLaunchPanel({
  squadReady,
  deckReady,
  adventureLevelActive,
  rewardPreview,
  onStart,
}: {
  squadReady: boolean;
  deckReady: boolean;
  adventureLevelActive: boolean;
  rewardPreview: Rewards;
  onStart: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[#f5d498]/18 bg-[linear-gradient(180deg,rgba(245,196,81,0.13),rgba(16,12,11,0.94))] p-4 shadow-[0_24px_58px_rgba(0,0,0,0.32)]">
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#f5c451]/18 blur-2xl" />
      <div className="relative z-[1]">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d498]">{t("frontline.launchGate")}</div>
        <div className="mt-2 text-2xl font-black leading-tight text-white">{squadReady && deckReady ? t("frontline.readyToBreach") : t("frontline.loadoutIncomplete")}</div>
        <button
          className="frontline-motion-cta mt-4 w-full rounded-[22px] border border-emerald-200/28 bg-[linear-gradient(180deg,rgba(64,178,124,0.98),rgba(13,45,31,0.98))] px-4 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_18px_38px_rgba(25,166,105,0.2)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40"
          disabled={!squadReady || !deckReady}
          onClick={onStart}
        >
          {t("frontline.startBattle")}
        </button>
        <Link
          href={adventureLevelActive ? "/adventure" : "/"}
          className="mt-3 block rounded-[18px] border border-[#f5d498]/16 bg-[#f5c451]/8 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498] transition hover:bg-[#f5c451]/14"
        >
          {adventureLevelActive ? t("adventure.returnToMap") : `${t("common.return")} ${t("common.home")}`}
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <RewardPreview label={t("resources.gold")} value={rewardPreview.gold ?? 0} icon="gold" tone="gold" />
          <RewardPreview label={t("resources.dust")} value={rewardPreview.dust ?? 0} icon="dust" tone="dust" />
          <RewardPreview label={t("resources.gems")} value={rewardPreview.gems ?? 0} icon="gems" tone="gems" />
          <RewardPreview label="XP" value={rewardPreview.accountXp ?? 0} progressionIcon="level_up" tone="xp" />
          {rewardPreview.adventureKeys ? (
            <RewardPreview label={t("resources.adventureKeys")} value={rewardPreview.adventureKeys} progressionIcon="reward_chest" tone="card" />
          ) : null}
        </div>
        <Link
          href="/deck"
          className="mt-3 block rounded-[18px] border border-white/10 bg-white/[0.045] px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white/70 transition hover:bg-white/[0.08]"
        >
          {t("frontline.tuneSquadDeck")}
        </Link>
      </div>
    </div>
  );
}
