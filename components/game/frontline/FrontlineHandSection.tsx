"use client";

import { FRONTLINE_CARD_BY_ID } from "@/features/frontline/data";
import { validCardTargets } from "@/features/frontline/engine";
import type { FrontlineBattleState } from "@/features/frontline/types";
import { useI18n } from "@/lib/i18n/useI18n";
import { ExhaustedPane } from "./FrontlineExhaustedPane";
import { FrontlineHandCard } from "./FrontlineHandCard";
import type { LaneInsight } from "./FrontlineLaneInsights";

type FrontlineHandSectionProps = {
  state: FrontlineBattleState;
  actionsLocked: boolean;
  laneInsights: LaneInsight[];
  onCardClick: (cardId: string) => void;
};

export function FrontlineHandSection({
  state,
  actionsLocked,
  laneInsights,
  onCardClick,
}: FrontlineHandSectionProps) {
  const { t } = useI18n();

  return (
    <section className="relative overflow-visible rounded-[28px] border border-[#f5d498]/10 bg-[linear-gradient(180deg,rgba(255,236,185,0.026),rgba(0,0,0,0.055))] px-3 pb-3 pt-3 shadow-[inset_0_1px_0_rgba(245,212,152,0.035)] backdrop-blur-[1px] md:px-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f5d498]">{t("frontline.hand")}</div>
        <div className="flex items-center gap-2">
          <ExhaustedPane allyDeck={state.allyDeck} enemyDeck={state.enemyDeck} />
          <div className="rounded-full bg-white/[0.055] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/62">
            {t("frontline.handFooter", { deck: state.allyDeck.deck.length, discard: state.allyDeck.discard.length })}
          </div>
        </div>
      </div>

      <div className="-mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-1 xl:mx-0 xl:justify-center xl:overflow-visible xl:px-0 xl:pb-0">
        {state.allyDeck.hand.map((cardId) => {
          const card = state.allyCardProfiles?.[cardId] ?? FRONTLINE_CARD_BY_ID[cardId];
          const selected = state.selectedCardId === card.id;
          const playable = card.cost <= state.allyDeck.command && !actionsLocked;
          const validTargets = validCardTargets(state, "ally", card.id);
          const recommendedLane =
            validTargets.length > 0
              ? laneInsights.find((entry) => validTargets.includes(entry.lane))?.lane ?? validTargets[0]
              : null;

          return (
            <FrontlineHandCard
              key={card.id}
              card={card}
              selected={selected}
              playable={playable}
              recommendedLane={recommendedLane}
              command={state.allyDeck.command}
              onClick={() => onCardClick(card.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
