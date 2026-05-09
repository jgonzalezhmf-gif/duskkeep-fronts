"use client";

import type { FrontlineCardDef } from "@/features/frontline/types";
import { useI18n } from "@/lib/i18n/useI18n";
import { FrontlineCardView } from "./FrontlineVisualPrimitives";
import { EmptyCard, Panel } from "./BattlePagePanels";

export function BattlePagePackagePanel({ cards }: { cards: Array<FrontlineCardDef | null> }) {
  const { t } = useI18n();

  return (
    <Panel title={t("frontline.battlePackage")}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) =>
          card ? (
            <FrontlineCardView key={`ally-card-${index}-${card.id}`} card={card} compact className="min-h-[12rem]" />
          ) : (
            <EmptyCard key={`ally-card-${index}-empty`} />
          ),
        )}
      </div>
    </Panel>
  );
}
