"use client";

import { cn } from "@/lib/cn";
import type { Hero, PlayerHero, Rarity } from "@/lib/types";
import { MAX_STARS } from "@/lib/constants";

const frameClass: Record<Rarity, string> = {
  common: "frame-common",
  rare: "frame-rare",
  epic: "frame-epic",
  legendary: "frame-legendary",
};

const rarityText: Record<Rarity, string> = {
  common: "rarity-common",
  rare: "rarity-rare",
  epic: "rarity-epic",
  legendary: "rarity-legendary",
};

type State = "owned" | "locked-shards" | "locked-unknown";

export default function HeroCollectionCard({
  hero,
  playerHero,
  state,
  unlockLevel,
  accountLevel = 99,
  onClick,
}: {
  hero: Hero;
  playerHero?: PlayerHero;
  state: State;
  unlockLevel?: number;
  accountLevel?: number;
  onClick?: () => void;
}) {
  const owned = state === "owned";
  const shards = playerHero?.shards ?? 0;
  const stars = playerHero?.stars ?? 0;
  const level = playerHero?.level ?? 0;
  const levelGated = unlockLevel && accountLevel < unlockLevel;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-[24px] p-2 text-left shadow-[0_14px_36px_rgba(0,0,0,0.34)] transition hover:translate-y-[-2px]",
        frameClass[hero.rarity],
        hero.rarity === "legendary" && "rarity-glow-legendary",
        !owned && "opacity-95",
      )}
    >
      <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em]">
        <span className={rarityText[hero.rarity]}>{hero.rarity}</span>
      </div>

      <div className="relative grid aspect-[3/4] place-items-center overflow-hidden rounded-[18px] border border-white/5 bg-black/40">
        <div
          className={cn(
            "text-[58px] transition",
            owned ? "grayscale-0" : "grayscale brightness-[0.25] contrast-125",
          )}
        >
          {hero.emoji}
        </div>
        {!owned ? (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.55))]" />
        ) : null}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px]">
          <span className="rounded-full border border-white/10 bg-black/70 px-2 py-1 tabular-nums">
            Lv {owned ? level : 1}
          </span>
          <span className="rounded-full border border-white/10 bg-black/70 px-2 py-1 tracking-tight">
            <span className="text-accent">{"*".repeat(owned ? stars : 0)}</span>
            <span className="opacity-30">{"*".repeat(Math.max(0, MAX_STARS - (owned ? stars : 0)))}</span>
          </span>
        </div>
      </div>

      <div className={cn("mt-2 text-sm font-black truncate", rarityText[hero.rarity])}>{hero.name}</div>
      <div className="text-[11px] capitalize text-white/54">
        {hero.role} • {hero.faction}
      </div>

      {!owned ? (
        <div className="mt-2 rounded-[16px] border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-[#f5d498]">
          {levelGated ? `Unlocks at account level ${unlockLevel}` : `${shards}/10 shards collected`}
        </div>
      ) : null}
    </button>
  );
}
