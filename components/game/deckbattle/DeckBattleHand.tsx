"use client";

import { BattleHandCard } from "@/components/game/deckbattle/DeckBattleCards";
import { HeaderChip } from "@/components/game/deckbattle/DeckBattlePrimitives";
import { getCard } from "@/data/cards";

export function DeckBattleHand({
  hand,
  selectedCardId,
  playableIds,
  mana,
  maxMana,
  canPlay,
  onCardClick,
}: {
  hand: string[];
  selectedCardId: string | null;
  playableIds: Set<string>;
  mana: number;
  maxMana: number;
  canPlay: boolean;
  onCardClick: (cardId: string) => void;
}) {
  return (
    <div className="min-w-0 rounded-[20px] bg-[linear-gradient(180deg,rgba(18,23,33,0.34),rgba(10,12,18,0.74))] p-2 shadow-[0_12px_20px_rgba(0,0,0,0.16)]">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/42">War hand</div>
          <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/68">
            {canPlay ? "Playable cards and summons" : "Locked while enemy resolves"}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <HeaderChip label="Cards" value={`${hand.length}`} tone="neutral" compact />
          <HeaderChip label="Mana" value={`${mana}/${maxMana}`} tone="ally" compact />
        </div>
      </div>

      <div className="rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.06))] p-1.5">
        <div className="flex items-end gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {hand.map((cardId) => {
            const card = getCard(cardId);
            const selected = selectedCardId === card.id;
            const playable = canPlay && playableIds.has(card.id);
            const manaShort = Math.max(0, card.cost - mana);
            const blockedLabel = !canPlay ? "Wait" : manaShort > 0 ? `Need ${manaShort}` : null;
            return (
              <button
                key={card.id}
                disabled={!playable}
                aria-label={`${card.name}, cost ${card.cost}, ${card.kind}`}
                data-hand-card={card.id}
                data-card-kind={card.kind}
                data-playable={playable ? "true" : "false"}
                onClick={() => onCardClick(card.id)}
                className="min-w-[7.2rem] text-left md:min-w-[8rem]"
              >
                <BattleHandCard cardId={card.id} selected={selected} playable={playable} blockedLabel={blockedLabel} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
