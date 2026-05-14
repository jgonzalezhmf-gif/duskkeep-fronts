"use client";

import { FrontlineCardView } from "@/components/game/frontline/FrontlineVisualPrimitives";
import {
  FRONTLINE_CARD_BY_ID,
  FRONTLINE_CARD_POOL,
} from "@/features/frontline/data";
import {
  FRONTLINE_CARD_MAX_LEVEL,
  frontlineCardUpgradeCost,
  getFrontlineCardLevel,
  isFrontlineCardUnlocked,
  type FrontlineCardLevels,
  type FrontlineCardUnlocks,
} from "@/features/frontline/cardProgression";
import { getFrontlineCardUnlockSource } from "@/features/frontline/cardUnlockSources";
import type { FrontlineCardProfileMap } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import type { Resources } from "@/lib/types";
import { CardUpgradeBar } from "./DeckPrimitives";
import type { TranslateFn } from "./deckPageHelpers";

export function DeckCardPoolSection({
  selectedDeck,
  cardProfiles,
  frontlineCardUnlocks,
  frontlineCardLevels,
  resources,
  onToggleCard,
  onUpgradeCard,
  t,
}: {
  selectedDeck: string[];
  cardProfiles: FrontlineCardProfileMap;
  frontlineCardUnlocks: FrontlineCardUnlocks;
  frontlineCardLevels: FrontlineCardLevels;
  resources: Pick<Resources, "gold" | "dust">;
  onToggleCard: (cardId: string) => void;
  onUpgradeCard: (cardId: string) => void | Promise<unknown>;
  t: TranslateFn;
}) {
  const selectedDeckSet = new Set(selectedDeck);
  const orderedCardPool = [
    ...FRONTLINE_CARD_POOL.filter((cardId) => selectedDeckSet.has(cardId)),
    ...FRONTLINE_CARD_POOL.filter((cardId) => !selectedDeckSet.has(cardId) && isFrontlineCardUnlocked(frontlineCardUnlocks, cardId)),
    ...FRONTLINE_CARD_POOL.filter((cardId) => !selectedDeckSet.has(cardId) && !isFrontlineCardUnlocked(frontlineCardUnlocks, cardId)),
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f5d498]">{t("deckScreen.pool.eyebrow")}</div>
          <div className="mt-1 text-sm text-white/62">{t("deckScreen.pool.copy")}</div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/62">
          {t("deckScreen.pool.selected", { count: selectedDeck.length })}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {orderedCardPool.map((cardId) => {
          const card = cardProfiles[cardId] ?? FRONTLINE_CARD_BY_ID[cardId];
          const unlocked = isFrontlineCardUnlocked(frontlineCardUnlocks, card.id);
          const active = selectedDeckSet.has(card.id);
          const level = getFrontlineCardLevel(frontlineCardLevels, card.id);
          const cost = frontlineCardUpgradeCost(level);
          const canUpgrade = unlocked && level < FRONTLINE_CARD_MAX_LEVEL && resources.gold >= cost.gold && resources.dust >= cost.dust;
          const unlockSource = getFrontlineCardUnlockSource(card.id);
          const unlockHint = unlockSource
            ? t("deckScreen.cardUpgrade.unlockAt", { chapter: unlockSource.chapter, index: unlockSource.index })
            : t("deckScreen.cardUpgrade.unlockHint");
          return (
            <div
              key={card.id}
              className={cn(
                "rounded-[26px] border border-white/10 bg-black/18 p-2",
                !unlocked && "border-white/8 bg-black/22 opacity-82 grayscale-[0.08]",
                unlocked && !active && selectedDeck.length >= 8 && "opacity-70",
              )}
            >
              <button
                onClick={() => {
                  if (unlocked) onToggleCard(card.id);
                }}
                disabled={!unlocked}
                className="frontline-motion-action w-full rounded-[24px] text-left transition"
              >
                <FrontlineCardView
                  card={card}
                  selected={active}
                  disabled={!unlocked || (!active && selectedDeck.length >= 8)}
                  status={active ? t("deckScreen.package.inPackage") : unlocked ? t("deckScreen.package.tapToAdd") : t("deckScreen.package.locked")}
                />
              </button>
              <CardUpgradeBar
                level={level}
                cost={cost}
                unlocked={unlocked}
                unlockHint={unlockHint}
                canUpgrade={canUpgrade}
                t={t}
                onUpgrade={() => onUpgradeCard(card.id)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
