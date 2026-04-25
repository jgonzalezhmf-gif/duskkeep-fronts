"use client";

import ArtPortrait from "@/components/ui/ArtPortrait";
import GameGlyph, { type GlyphKind } from "@/components/ui/GameGlyph";
import { getHero } from "@/data/heroes";
import { getHeroPortrait } from "@/lib/art";
import { cn } from "@/lib/cn";
import type { DeckCard } from "@/lib/types";

const rarityFrame: Record<string, string> = {
  common: "from-slate-700/86 via-[#101722]/94 to-slate-950/98 border-slate-100/14",
  rare: "from-sky-700/84 via-[#101722]/94 to-slate-950/98 border-sky-200/24",
  epic: "from-fuchsia-700/80 via-[#161127]/94 to-slate-950/98 border-fuchsia-200/26",
  legendary: "from-amber-600/78 via-[#2a1d0c]/94 to-slate-950/98 border-amber-200/30",
};

const factionGlow: Record<string, string> = {
  order: "from-amber-200/28 via-transparent to-transparent",
  shadow: "from-violet-300/24 via-transparent to-transparent",
  wild: "from-emerald-300/22 via-transparent to-transparent",
  arcane: "from-sky-300/24 via-transparent to-transparent",
};

const roleGlyph: Record<string, GlyphKind> = {
  tank: "shield",
  fighter: "attack",
  archer: "attack",
  mage: "skill",
  support: "heal",
  summoner: "power",
};

const spellGlyph: Record<string, GlyphKind> = {
  spell_meteor: "attack",
  spell_battle_hymn: "power",
  spell_sanctuary: "heal",
  spell_guardian_aegis: "shield",
};

function compactStat(value: number, divisor: number) {
  return Math.max(1, Math.round(value / divisor));
}

export default function CardShowcase({
  card,
  compact,
  selected,
  disabled,
  className,
}: {
  card: DeckCard;
  compact?: boolean;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const hero = card.kind === "hero" ? getHero(card.heroId) : null;
  const portrait = hero ? getHeroPortrait(hero.id) : null;
  const glyph = hero ? roleGlyph[hero.role] ?? "skill" : spellGlyph[card.id] ?? "skill";
  const attackValue = hero ? compactStat(hero.baseStats.atk, 25) : null;
  const hpValue = hero ? compactStat(hero.baseStats.hp, 300) : null;
  const frame = rarityFrame[card.rarity] ?? rarityFrame.common;
  const heightClass = compact ? "min-h-[198px]" : "min-h-[264px]";
  const arcTone = hero ? factionGlow[hero.faction] ?? "from-white/10 via-transparent to-transparent" : "from-sky-300/16 via-transparent to-transparent";

  return (
    <div
      className={cn(
        "group relative isolate overflow-hidden rounded-[26px] border bg-gradient-to-b shadow-[0_22px_42px_rgba(0,0,0,0.34)] transition-transform duration-200",
        frame,
        heightClass,
        selected && "ring-2 ring-[#f5c451]/72 shadow-[0_0_26px_rgba(245,196,81,0.2)]",
        disabled && "opacity-45 saturate-[0.72]",
        !disabled && "hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_16%,transparent_72%,rgba(0,0,0,0.3))]" />
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-85", arcTone)} />
      <div className="absolute right-[-16%] top-[-10%] h-[9rem] w-[9rem] rounded-full bg-white/10 blur-3xl opacity-55" />
      <div className="absolute left-[-20%] bottom-[14%] h-[8rem] w-[8rem] rounded-full bg-white/8 blur-3xl opacity-45" />

      <div className="absolute inset-[5px] overflow-hidden rounded-[21px] border border-white/8 bg-black/18">
        <ArtPortrait
          src={portrait}
          alt={card.name}
          className="absolute inset-0"
          imgClassName={cn(
            "scale-[1.14] saturate-[1.18] contrast-[1.04]",
            compact ? "object-[center_14%]" : "object-[center_12%]",
          )}
          fallback={
            <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.1),rgba(0,0,0,0.22)_38%,rgba(0,0,0,0.54)_100%)]">
              <div className={cn("rounded-full border border-white/10 bg-black/18 p-3 shadow-[0_12px_24px_rgba(0,0,0,0.34)]", compact ? "h-16 w-16" : "h-20 w-20")}>
                <GameGlyph kind={glyph} shell="none" />
              </div>
            </div>
          }
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(255,255,255,0.18),transparent_24%),linear-gradient(180deg,transparent_0%,transparent_42%,rgba(7,10,18,0.18)_58%,rgba(7,10,18,0.82)_80%,rgba(7,10,18,0.98)_100%)]" />
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-[11%] bg-gradient-to-b opacity-95",
            card.rarity === "legendary"
              ? "from-amber-300/95 to-amber-500/0"
              : card.rarity === "epic"
                ? "from-fuchsia-300/92 to-fuchsia-500/0"
                : card.rarity === "rare"
                  ? "from-sky-300/92 to-sky-500/0"
                  : "from-white/78 to-white/0",
          )}
        />
        <div className="absolute left-[4%] top-[18%] bottom-[24%] w-[8%] rounded-full bg-white/10 blur-xl opacity-60" />
      </div>

      <div className="absolute left-2 top-2 z-10">
        <CornerGem value={card.cost} tone="gold" />
      </div>

      <div className="absolute right-2 top-2 z-10">
        {hero ? <CornerGem value={attackValue ?? 0} tone="ember" icon="attack" /> : <GlyphSeal tone="arcane" icon={glyph} />}
      </div>

      <div className="absolute left-2 bottom-[3.8rem] z-10">
        {hero ? <CornerGem value={hpValue ?? 0} tone="sky" icon="heart" /> : <GlyphSeal tone="sky" icon={glyph} />}
      </div>

      <div className="absolute right-2 bottom-[3.95rem] z-10">
        <EdgeTag tone={hero ? hero.faction : card.rarity}>{hero ? hero.faction : card.rarity}</EdgeTag>
      </div>

      <div className="absolute left-2.5 top-[3.5rem] z-10">
        <VerticalFactionTag tone={hero ? hero.faction : "spell"}>{hero ? hero.role : "spell"}</VerticalFactionTag>
      </div>

      <div className="absolute inset-x-3 bottom-3 z-10">
        <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,22,0.6),rgba(9,12,18,0.98))] px-3 py-2.5 shadow-[0_14px_24px_rgba(0,0,0,0.26)]">
          <div className="absolute inset-y-0 left-[-18%] w-[40%] skew-x-[-22deg] bg-white/10 blur-md opacity-50" />
          <div className="relative flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className={cn("truncate font-black text-white", compact ? "text-[12px]" : "text-[14px]")}>{card.name}</div>
              <div className="mt-0.5 truncate text-[8px] font-black uppercase tracking-[0.18em] text-white/50">
                {hero ? `${hero.faction} / ${hero.role}` : "tactical spell"}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  card.rarity === "legendary"
                    ? "bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.5)]"
                    : card.rarity === "epic"
                      ? "bg-fuchsia-300 shadow-[0_0_8px_rgba(232,121,249,0.45)]"
                      : card.rarity === "rare"
                        ? "bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.45)]"
                        : "bg-white/70",
                )}
              />
              <span className="text-[8px] font-black uppercase tracking-[0.18em] text-white/46">{card.kind}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CornerGem({
  value,
  tone,
  icon,
}: {
  value: number;
  tone: "gold" | "ember" | "sky";
  icon?: GlyphKind;
}) {
  const palette =
    tone === "gold"
      ? "from-[#fff2b8] via-[#f5c451] to-[#c97b18] border-[#fff5cb]/56 text-[#2d1703]"
      : tone === "ember"
        ? "from-[#ffb6a2] via-[#ff7a64] to-[#bc372a] border-[#ffe0d9]/56 text-white"
        : "from-[#d8f5ff] via-[#71c7ff] to-[#247fd9] border-[#eefbff]/56 text-white";

  return (
    <div
      className={cn(
        "flex min-w-[2.8rem] items-center gap-1 rounded-[16px] border bg-gradient-to-b px-2 py-1 shadow-[0_10px_18px_rgba(0,0,0,0.26)]",
        palette,
      )}
    >
      {icon ? (
        <span className="h-3.5 w-3.5">
          <GameGlyph kind={icon} shell="none" />
        </span>
      ) : null}
      <span className="text-[11px] font-black leading-none [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]">{value}</span>
    </div>
  );
}

function GlyphSeal({
  tone,
  icon,
}: {
  tone: "arcane" | "sky";
  icon: GlyphKind;
}) {
  return (
    <div
      className={cn(
        "grid h-9 w-9 place-items-center rounded-[14px] border p-2 shadow-[0_10px_18px_rgba(0,0,0,0.24)]",
        tone === "arcane"
          ? "border-fuchsia-100/30 bg-[linear-gradient(180deg,rgba(232,121,249,0.78),rgba(90,32,131,0.96))]"
          : "border-sky-100/30 bg-[linear-gradient(180deg,rgba(125,211,252,0.76),rgba(26,97,163,0.96))]",
      )}
    >
      <GameGlyph kind={icon} shell="none" />
    </div>
  );
}

function EdgeTag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: string;
}) {
  const classes =
    tone === "order" || tone === "legendary"
      ? "border-amber-200/28 bg-amber-300/14 text-amber-50"
      : tone === "shadow" || tone === "epic"
        ? "border-fuchsia-200/28 bg-fuchsia-300/14 text-fuchsia-50"
        : tone === "wild"
          ? "border-emerald-200/28 bg-emerald-300/14 text-emerald-50"
          : "border-sky-200/28 bg-sky-300/14 text-sky-50";

  return (
    <div className={cn("rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.18em] shadow-[0_8px_14px_rgba(0,0,0,0.22)]", classes)}>
      {children}
    </div>
  );
}

function VerticalFactionTag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: string;
}) {
  const classes =
    tone === "order"
      ? "border-amber-200/24 bg-[linear-gradient(180deg,rgba(252,211,77,0.16),rgba(10,12,18,0.82))] text-amber-50"
      : tone === "shadow"
        ? "border-fuchsia-200/24 bg-[linear-gradient(180deg,rgba(232,121,249,0.16),rgba(10,12,18,0.82))] text-fuchsia-50"
        : tone === "wild"
          ? "border-emerald-200/24 bg-[linear-gradient(180deg,rgba(74,222,128,0.16),rgba(10,12,18,0.82))] text-emerald-50"
          : tone === "arcane"
            ? "border-sky-200/24 bg-[linear-gradient(180deg,rgba(125,211,252,0.16),rgba(10,12,18,0.82))] text-sky-50"
            : "border-slate-200/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(10,12,18,0.82))] text-white/82";

  return (
    <div
      className={cn(
        "rounded-[14px] border px-1.5 py-2 text-[8px] font-black uppercase tracking-[0.18em] shadow-[0_8px_14px_rgba(0,0,0,0.22)] [writing-mode:vertical-rl] [text-orientation:mixed]",
        classes,
      )}
    >
      {children}
    </div>
  );
}
