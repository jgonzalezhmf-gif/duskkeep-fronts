"use client";

import GameGlyph from "@/components/ui/GameGlyph";
import { getFrontlineHeroVisualAsset } from "@/components/game/frontline/frontlineVisualAssets";
import type { FrontlineHeroDef } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import type { TranslateFn } from "./deckPageHelpers";

export function HeroRosterButton({
  hero,
  selectedIndex,
  tierLabel,
  laneLabel,
  onPick,
  t,
}: {
  hero: FrontlineHeroDef;
  selectedIndex: number;
  tierLabel: string;
  laneLabel: string | null;
  onPick: (slotIdx: number) => void;
  t: TranslateFn;
}) {
  const visual = getFrontlineHeroVisualAsset(hero.heroId);
  const active = selectedIndex !== -1;

  return (
    <div
      className={cn(
        "rounded-[18px] border bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(8,10,16,0.84))] p-2",
        active ? "border-[#f5c451]/26 bg-[#f5c451]/10" : "border-white/10",
      )}
    >
      <div className="flex items-center gap-2">
        <div className="grid h-16 w-14 shrink-0 place-items-end overflow-hidden rounded-[16px] border border-white/10 bg-black/22">
          {visual.standeeSrc || visual.portraitFallbackSrc ? (
            <img
              src={visual.standeeSrc ?? visual.portraitFallbackSrc ?? undefined}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className={cn(
                "h-full w-full object-bottom drop-shadow-[0_10px_14px_rgba(0,0,0,0.44)]",
                visual.standeeSrc ? "object-contain" : "object-cover",
              )}
            />
          ) : (
            <GameGlyph kind="heroes" shell="none" className="h-8 w-8 text-white/60" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-black text-white">{hero.name}</div>
          <div className="mt-0.5 truncate text-[10px] font-black uppercase tracking-[0.12em] text-white/44">{hero.role}</div>
          <div className="mt-1 flex justify-between gap-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/58">
            <span>HP {hero.maxHp}</span>
            <span>ATK {hero.atk}</span>
            <span>DEF {hero.def}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 text-[9px] font-black uppercase tracking-[0.14em] text-[#f5d498]">
        {laneLabel ?? tierLabel}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {[0, 1, 2].map((slotIdx) => (
          <button
            key={`${hero.heroId}-${slotIdx}`}
            onClick={() => onPick(slotIdx)}
            className={cn(
              "frontline-motion-tab rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] transition",
              selectedIndex === slotIdx
                ? "border-[#f5c451]/28 bg-[#f5c451]/14 text-[#f5d498]"
                : "border-white/10 bg-white/[0.04] text-white/58",
            )}
          >
            {slotIdx === 0 ? t("deckScreen.lanes.left") : slotIdx === 1 ? t("deckScreen.lanes.center") : t("deckScreen.lanes.right")}
          </button>
        ))}
      </div>
    </div>
  );
}
