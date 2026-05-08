"use client";

import { ScreenBadge, ScreenPanel } from "@/components/game/screens/ScreenChrome";
import { FRONTLINE_UNIT_BY_ID } from "@/features/frontline/data";
import { EventSquadChip } from "./EventsPrimitives";
import type { TranslateFn } from "./eventsPageHelpers";

export function EventEntryPanel({
  squad,
  loadoutReady,
  t,
}: {
  squad: readonly (string | null)[];
  loadoutReady: boolean;
  t: TranslateFn;
}) {
  return (
    <ScreenPanel className="p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#f5d498]">{t("eventsScreen.entry.eyebrow")}</div>
          <div className="mt-1 text-lg font-black text-white">{t("eventsScreen.entry.title")}</div>
        </div>
        <ScreenBadge tone={loadoutReady ? "gold" : "ember"}>{loadoutReady ? t("eventsScreen.entry.ready") : t("eventsScreen.entry.deckNeeded")}</ScreenBadge>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5 lg:grid-cols-1 lg:gap-2">
        {squad.map((heroId, index) => {
          const hero = heroId ? FRONTLINE_UNIT_BY_ID[heroId] : null;
          return (
            <EventSquadChip
              key={`${heroId ?? "empty"}-${index}`}
              hero={hero}
              label={index === 0 ? t("eventsScreen.entry.left") : index === 1 ? t("eventsScreen.entry.center") : t("eventsScreen.entry.right")}
              emptyLabel={t("eventsScreen.entry.deckNeeded")}
              t={t}
              compact
            />
          );
        })}
      </div>
      {!loadoutReady ? (
        <a href="/deck" className="mt-3 block rounded-[18px] border border-[#f5c451]/22 bg-[#f5c451]/12 px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#f5d498]">
          {t("eventsScreen.entry.fixDeck")}
        </a>
      ) : null}
    </ScreenPanel>
  );
}
