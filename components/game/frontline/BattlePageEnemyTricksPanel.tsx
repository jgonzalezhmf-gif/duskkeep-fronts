"use client";

import type { FrontlineCardDef } from "@/features/frontline/types";
import { frontlineCardKindLabel, frontlineCardName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { Panel } from "./BattlePagePanels";

export function BattlePageEnemyTricksPanel({ cards }: { cards: FrontlineCardDef[] }) {
  const { t } = useI18n();

  return (
    <Panel title={t("frontline.enemyTricks")} variant="enemy">
      <div className="grid grid-cols-2 gap-2">
        {cards.slice(0, 4).map((card, index) => (
          <div
            key={`enemy-card-${index}-${card.id}`}
            className="relative overflow-hidden rounded-[18px] border border-rose-200/12 bg-[linear-gradient(180deg,rgba(111,37,45,0.3),rgba(10,8,14,0.94))] px-3 py-3 shadow-[0_14px_26px_rgba(0,0,0,0.22)]"
          >
            <div className="pointer-events-none absolute -right-5 -top-6 h-14 w-14 rounded-full bg-rose-300/14 blur-xl" />
            <div className="relative z-[1] text-[9px] font-black uppercase tracking-[0.15em] text-rose-100/58">
              {frontlineCardKindLabel(t, card)}
            </div>
            <div className="relative z-[1] mt-1 line-clamp-2 text-[12px] font-black leading-4 text-white">
              {frontlineCardName(t, card)}
            </div>
            <div className="relative z-[1] mt-2 h-1.5 overflow-hidden rounded-full bg-black/34">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#f05f72,#ffd86f)]"
                style={{ width: `${Math.min(100, 24 + card.cost * 18)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
