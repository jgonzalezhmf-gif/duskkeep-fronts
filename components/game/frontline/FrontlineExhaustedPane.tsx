"use client";

import { FRONTLINE_CARD_BY_ID } from "@/features/frontline/data";
import type { FrontlineBattleState } from "@/features/frontline/types";
import { frontlineCardName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { CombatIcon } from "./FrontlineCombatIcon";

export function ExhaustedPane({
  allyDeck,
  enemyDeck,
}: {
  allyDeck: FrontlineBattleState["allyDeck"];
  enemyDeck: FrontlineBattleState["enemyDeck"];
}) {
  const { t } = useI18n();
  const ally = allyDeck.exhaustedCardIds;
  const enemy = enemyDeck.exhaustedCardIds;

  if (ally.length === 0 && enemy.length === 0) return null;

  const cardName = (cardId: string) => {
    const card = FRONTLINE_CARD_BY_ID[cardId];
    return card ? frontlineCardName(t, card) : cardId;
  };

  return (
    <details className="group/exhaust rounded-full border border-violet-300/40 bg-violet-500/14 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-violet-50 backdrop-blur-sm">
      <summary className="flex cursor-pointer list-none items-center gap-1.5">
        <CombatIcon name="leader_power" size="xs" fallbackClassName="opacity-90" />
        <span>{t("frontline.exhaustedPaneTitle")}</span>
        <span className="opacity-72">{ally.length + enemy.length}</span>
      </summary>
      <div className="mt-2 grid gap-2 pb-1 text-[9px] tracking-[0.14em]">
        <div>
          <div className="text-cyan-100/80">{t("frontline.exhaustedPaneAlly")}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {ally.length === 0 ? (
              <span className="opacity-60">{t("frontline.exhaustedPaneEmpty")}</span>
            ) : (
              ally.map((id) => (
                <span key={`ally-${id}`} className="rounded-full border border-cyan-200/30 bg-cyan-300/14 px-2 py-0.5 text-cyan-50">
                  {cardName(id)}
                </span>
              ))
            )}
          </div>
        </div>
        <div>
          <div className="text-rose-100/80">{t("frontline.exhaustedPaneEnemy")}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {enemy.length === 0 ? (
              <span className="opacity-60">{t("frontline.exhaustedPaneEmpty")}</span>
            ) : (
              enemy.map((id) => (
                <span key={`enemy-${id}`} className="rounded-full border border-rose-200/30 bg-rose-300/14 px-2 py-0.5 text-rose-50">
                  {cardName(id)}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </details>
  );
}
