"use client";

import { cn } from "@/lib/cn";
import type { Hero, PlayerHero, Rarity } from "@/lib/types";
import { MAX_STARS } from "@/lib/constants";

const rarityClass: Record<Rarity, string> = {
  common: "rarity-common",
  rare: "rarity-rare",
  epic: "rarity-epic",
  legendary: "rarity-legendary",
};

type Props = {
  hero: Hero;
  playerHero?: PlayerHero;
  locked?: boolean;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
};

export default function HeroCard({ hero, playerHero, locked, compact, selected, onClick }: Props) {
  const level = playerHero?.level ?? 0;
  const stars = playerHero?.stars ?? 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "card w-full text-left p-2",
        onClick && "hover:border-accent/50 cursor-pointer",
        selected && "border-accent",
        locked && "opacity-60",
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-10 h-10 rounded-md grid place-items-center text-2xl",
            "bg-panel2",
          )}
        >
          {hero.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className={cn("text-sm font-semibold truncate", rarityClass[hero.rarity])}>
            {hero.name}
          </div>
          <div className="text-[10px] text-muted capitalize">
            {hero.role} · {hero.faction} · {hero.rarity}
          </div>
          {!compact && (
            <div className="mt-1 flex items-center gap-2 text-[10px] text-muted">
              {stars > 0 ? (
                <>
                  <span className="tabular-nums text-accent">Lv {level}</span>
                  <span className="tracking-widest">
                    {"★".repeat(stars)}
                    <span className="opacity-30">{"★".repeat(Math.max(0, MAX_STARS - stars))}</span>
                  </span>
                </>
              ) : (
                <span className="text-accent2">Locked — {playerHero?.shards ?? 0}/10 shards</span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
