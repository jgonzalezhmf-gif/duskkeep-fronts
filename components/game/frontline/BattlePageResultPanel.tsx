"use client";

import Link from "next/link";
import { FRONTLINE_CARD_BY_ID } from "@/features/frontline/data";
import { cn } from "@/lib/cn";
import type { FrontlineBattleStats } from "@/lib/frontlineBattleStats";
import { frontlineCardName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { BattleStatsPanel, Panel, ResultMetric } from "./BattlePagePanels";
import { ProgressionIcon } from "../shared/ProgressionIcon";
import { ResourceIcon } from "../shared/ResourceIcon";
import { RewardBurstOverlay } from "../shared/RewardBurstOverlay";
import { RewardFlightOverlay } from "../shared/RewardFlightOverlay";

export type BattlePageResultContext = {
  winner: "ally" | "enemy" | "draw";
  enemyName: string;
  enemyPortraitSrc: string;
  rounds: number;
  allyCoreHp: number;
  enemyCoreHp: number;
  rewards: { gold: number; dust: number; gems: number; accountXp: number; adventureKeys: number; frontlineCards?: { cardId: string }[] };
  resourcesBefore: { gold: number; dust: number; gems: number };
  resourcesAfter: { gold: number; dust: number; gems: number };
  accountBefore: { level: number; xp: number };
  accountAfter: { level: number; xp: number };
  stats: FrontlineBattleStats;
  firstClear: boolean;
  adventureName: string | null;
};

type RewardRevealState = {
  gold: number;
  dust: number;
  gems: number;
  accountXp: number;
  adventureKeys: number;
  progress: number;
};

type BattlePageResultPanelProps = {
  resultContext: BattlePageResultContext;
  rewardReveal: RewardRevealState;
  animatedAccountProgress: number;
  adventureLevelActive: boolean;
  onRunItBack: () => void;
};

export function BattlePageResultPanel({
  resultContext,
  rewardReveal,
  animatedAccountProgress,
  adventureLevelActive,
  onRunItBack,
}: BattlePageResultPanelProps) {
  const { t } = useI18n();
  return (
    <Panel title={resultContext.winner === "ally" ? t("frontline.victory") : resultContext.winner === "draw" ? t("frontline.draw") : t("frontline.defeat")}>
      <div
        className={cn(
          "frontline-reward-success relative overflow-hidden rounded-[22px] border px-4 py-4",
          resultContext.winner === "ally"
            ? "border-[#f5c451]/26 bg-[linear-gradient(180deg,rgba(245,196,81,0.14),rgba(34,22,12,0.92))]"
            : resultContext.winner === "draw"
              ? "border-sky-200/16 bg-[linear-gradient(180deg,rgba(77,138,206,0.14),rgba(14,18,28,0.92))]"
              : "border-rose-200/16 bg-[linear-gradient(180deg,rgba(128,48,58,0.16),rgba(18,12,18,0.92))]",
        )}
      >
        {resultContext.firstClear ? (
          <div className="frontline-first-clear-banner relative mb-3 overflow-hidden rounded-[18px] border border-[#f5c451]/56 bg-[linear-gradient(120deg,rgba(245,196,81,0.32),rgba(120,46,11,0.78))] px-3 py-2 shadow-[0_18px_42px_rgba(245,196,81,0.32)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.28),transparent_44%)]" />
            <div className="relative flex items-center gap-2">
              <ProgressionIcon name="reward_chest" size="md" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-black uppercase tracking-[0.32em] text-[#fff0bd]">{t("frontline.firstClearBadge")}</div>
                {resultContext.adventureName ? (
                  <div className="truncate text-base font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{resultContext.adventureName}</div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
        <RewardBurstOverlay rewards={resultContext.rewards} />
        <RewardFlightOverlay rewards={resultContext.rewards} active nonce={`${resultContext.winner}-${resultContext.rounds}`} origin="lower" />
        <div className="flex items-start gap-3">
          <img
            src={resultContext.enemyPortraitSrc}
            alt=""
            className="h-14 w-12 shrink-0 rounded-[16px] border border-rose-200/16 bg-black/24 object-cover shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
            loading="lazy"
            aria-hidden
          />
          <ProgressionIcon name={resultContext.winner === "ally" ? "reward_chest" : "claim"} size="xl" />
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">{t("frontline.resultPulse")}</div>
            <div className="mt-2 text-2xl font-black text-white">
              {resultContext.winner === "ally"
                ? t("frontline.resultWinCopy")
                : resultContext.winner === "draw"
                  ? t("frontline.resultDrawCopy")
                  : t("frontline.resultDefeatCopy")}
            </div>
          </div>
        </div>
        <div className="mt-2 text-[13px] leading-6 text-white/62">
          {t("frontline.resultSummary", {
            enemy: resultContext.enemyName,
            rounds: resultContext.rounds,
            allyCore: resultContext.allyCoreHp,
            enemyCore: resultContext.enemyCoreHp,
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <ResultMetric label={t("resources.gold")} value={rewardReveal.gold} finalValue={resultContext.rewards.gold} />
          <ResultMetric label={t("resources.dust")} value={rewardReveal.dust} finalValue={resultContext.rewards.dust} />
          <ResultMetric label={t("resources.gems")} value={rewardReveal.gems} finalValue={resultContext.rewards.gems} />
          <ResultMetric label={t("frontline.accountXp")} value={rewardReveal.accountXp} finalValue={resultContext.rewards.accountXp} icon="level_up" />
          {resultContext.rewards.adventureKeys ? (
            <ResultMetric label={t("resources.adventureKeys")} value={rewardReveal.adventureKeys} finalValue={resultContext.rewards.adventureKeys} icon="reward_chest" />
          ) : null}
        </div>

        {resultContext.rewards.frontlineCards?.length ? (
          <div className="mt-3 rounded-[18px] border border-[#f5c451]/18 bg-[#f5c451]/8 px-3 py-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#f5d498]">
              <ProgressionIcon name="unlock" size="sm" />
              {t("frontline.unlockedCards")}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {resultContext.rewards.frontlineCards.map((unlock) => {
                const card = FRONTLINE_CARD_BY_ID[unlock.cardId];
                return (
                  <span key={unlock.cardId} className="rounded-full border border-white/10 bg-black/24 px-3 py-1.5 text-[11px] font-black text-white/74">
                    {frontlineCardName(t, card) || unlock.cardId}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        <BattleStatsPanel stats={resultContext.stats} />

        <div className="mt-4 rounded-[18px] border border-white/10 bg-black/16 p-3">
          <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/48">
            <span className="inline-flex items-center gap-2">
              <ProgressionIcon name="level_up" size="sm" />
              {t("frontline.accountProgress")}
            </span>
            <span>
              {t("frontline.levelFromTo", { from: resultContext.accountBefore.level, to: resultContext.accountAfter.level })}
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#7fc2ff,#f5d498)] transition-[width] duration-500"
              style={{
                width: `${Math.max(6, animatedAccountProgress * Math.max(rewardReveal.progress, 0.22))}%`,
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-white/56">
            <span className="inline-flex items-center gap-1">
              <ResourceIcon kind="gold" size="small" className="h-4 w-4" />
              {t("frontline.resourceShift", { before: resultContext.resourcesBefore.gold, after: resultContext.resourcesAfter.gold })}
            </span>
            <span className="inline-flex items-center gap-1">
              <ResourceIcon kind="dust" size="small" className="h-4 w-4" />
              {t("frontline.resourceShift", { before: resultContext.resourcesBefore.dust, after: resultContext.resourcesAfter.dust })}
            </span>
            <span className="inline-flex items-center gap-1">
              <ResourceIcon kind="gems" size="small" className="h-4 w-4" />
              {t("frontline.resourceShift", { before: resultContext.resourcesBefore.gems, after: resultContext.resourcesAfter.gems })}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            className="rounded-[18px] border border-emerald-300/24 bg-[linear-gradient(180deg,rgba(48,129,97,0.96),rgba(12,28,20,0.98))] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white"
            onClick={onRunItBack}
          >
            {t("frontline.runItBack")}
          </button>
          <Link
            href="/deck"
            className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white/74"
          >
            {t("frontline.tuneSquadInDeck")}
          </Link>
          {adventureLevelActive ? (
            <Link
              href="/adventure"
              className="rounded-[18px] border border-[#f5d498]/16 bg-[#f5c451]/8 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498] transition hover:bg-[#f5c451]/14"
            >
              {t("adventure.returnToMap")}
            </Link>
          ) : null}
          <Link
            href="/"
            className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white/74 transition hover:bg-white/[0.07]"
          >
            {t("common.home")}
          </Link>
        </div>
      </div>
    </Panel>
  );
}
