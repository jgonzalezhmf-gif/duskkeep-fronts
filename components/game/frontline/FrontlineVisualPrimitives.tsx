"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CardTypeIcon } from "@/components/game/shared/CardTypeIcon";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import GameGlyph, { type GlyphKind } from "@/components/ui/GameGlyph";
import { StatusIcon, type StatusIconName } from "@/components/game/shared/StatusIcon";
import type { FrontlineCardDef, FrontlineHeroDef } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import {
  frontlineCardDescription,
  frontlineCardEffectSummary,
  frontlineCardKindLabel,
  frontlineCardName,
  frontlineCardTargetLabel,
  frontlineHeroName,
  frontlineHeroRole,
} from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { getFrontlineCardVisualAsset, getFrontlineHeroVisualAsset } from "./frontlineVisualAssets";

function cardTone(card: FrontlineCardDef): GameIconTone {
  if (card.kind === "order") return "sky";
  if (card.kind === "tactic") return "violet";
  return "emerald";
}

function statusIconForCard(card: FrontlineCardDef): StatusIconName | null {
  if (card.effect.type === "hero_strike") {
    if (card.effect.shield) return "guard";
    if (card.effect.strikeFirst) return "rush";
  }
  if (card.effect.type === "rally") return "buff";
  if (card.effect.type === "heal_front") return "regen";
  if (card.effect.type === "stun_front") return "debuff";
  return null;
}

function cardSurface(card: FrontlineCardDef, selected?: boolean, disabled?: boolean) {
  const base =
    card.kind === "order"
      ? "border-sky-300/18 bg-[radial-gradient(circle_at_74%_16%,rgba(125,211,252,0.22),transparent_34%),linear-gradient(180deg,rgba(37,83,108,0.92),rgba(8,16,24,0.98))]"
      : card.kind === "tactic"
        ? "border-violet-300/18 bg-[radial-gradient(circle_at_72%_16%,rgba(196,181,253,0.2),transparent_35%),linear-gradient(180deg,rgba(64,39,92,0.92),rgba(12,10,23,0.98))]"
        : "border-emerald-300/18 bg-[radial-gradient(circle_at_72%_16%,rgba(110,231,183,0.18),transparent_35%),linear-gradient(180deg,rgba(28,82,62,0.92),rgba(8,19,17,0.98))]";
  return cn(
    base,
    selected && "ring-2 ring-[#f5c451]/36 shadow-[0_0_34px_rgba(245,196,81,0.2),0_20px_42px_rgba(0,0,0,0.36)]",
    disabled && "opacity-55 grayscale-[0.25]",
  );
}

export function FrontlineCardView({
  card,
  selected,
  disabled,
  compact,
  status,
  className,
}: {
  card: FrontlineCardDef;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  status?: ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  const visual = getFrontlineCardVisualAsset(card);
  const iconTone = cardTone(card);
  const statusIcon = statusIconForCard(card);
  const cardName = frontlineCardName(t, card);
  const cardDescription = frontlineCardDescription(t, card);
  return (
    <div
      title={cardDescription}
      className={cn(
        "frontline-motion-card group/card relative isolate overflow-hidden rounded-[24px] border p-3 text-left text-white transition duration-300",
        compact ? "min-h-[13rem]" : "min-h-[18rem]",
        cardSurface(card, selected, disabled),
        selected && "frontline-motion-selected",
        className,
      )}
      data-disabled={disabled ? "true" : "false"}
      data-playable={!disabled ? "true" : "false"}
    >
      <div className="absolute inset-2 z-0 overflow-hidden rounded-[21px] bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.16),transparent_52%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.38))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <VisualAssetImage
          src={visual.cardArtSrc}
          fallbackSrc={visual.fallbackPortraitSrc}
          alt={`${cardName} art`}
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-contain object-center p-1 opacity-95 saturate-[1.14] contrast-[1.04] drop-shadow-[0_14px_18px_rgba(0,0,0,0.34)] transition duration-300 group-hover/card:scale-[1.025]"
          fallback={
            <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.16),rgba(0,0,0,0.24))]">
              <GameIcon kind={visual.iconKind} tone={iconTone} size="lg" />
            </div>
          }
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.66),rgba(0,0,0,0.08)_32%,rgba(0,0,0,0.04)_58%,rgba(0,0,0,0.82))]" />
      </div>
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-current opacity-60" />
      <span className="pointer-events-none absolute -right-12 -top-14 h-32 w-32 rounded-full bg-white/12 blur-2xl transition group-hover/card:bg-white/18" />
      {selected ? <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(245,196,81,0.22),transparent_50%)]" /> : null}

      <div className="relative z-[1] flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white/70">
            <CardTypeIcon type={card.kind} size="sm" className="h-6 w-6" />
            <span>{frontlineCardKindLabel(t, card)}</span>
            {card.level && card.level > 1 ? <span className="rounded-full bg-[#f5c451]/18 px-1.5 py-0.5 text-[#ffe5a4]">Lv {card.level}</span> : null}
          </div>
          <div className="mt-1 line-clamp-2 text-[1rem] font-black leading-[1.02] text-white">{cardName}</div>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#f5c451]/24 bg-[radial-gradient(circle_at_35%_28%,rgba(255,247,213,0.62),rgba(245,196,81,0.34)_44%,rgba(0,0,0,0.42)_100%)] text-lg font-black text-[#ffe7a2] shadow-[0_0_24px_rgba(245,196,81,0.22),inset_0_1px_0_rgba(255,255,255,0.24)]">
          {card.cost}
        </div>
      </div>

      <div className={cn("relative z-[1]", compact ? "mt-[7rem]" : "mt-[11rem]")}>
        <div className="flex items-center gap-2 rounded-[16px] bg-black/20 px-3 py-2 text-[12px] font-black leading-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          {statusIcon ? <StatusIcon name={statusIcon} size="sm" className="h-7 w-7" fallbackClassName="opacity-90" /> : null}
          {frontlineCardEffectSummary(t, card)}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <VisualPill>{frontlineCardTargetLabel(t, card)}</VisualPill>
          {status ? <VisualPill tone={selected ? "gold" : "neutral"}>{status}</VisualPill> : null}
        </div>
      </div>
    </div>
  );
}

export function FrontlineHeroStandee({
  hero,
  label,
  selected,
  side = "ally",
  compact,
  emptyLabel = "Empty slot",
  className,
}: {
  hero: FrontlineHeroDef | null;
  label?: ReactNode;
  selected?: boolean;
  side?: "ally" | "enemy";
  compact?: boolean;
  emptyLabel?: string;
  className?: string;
}) {
  const { t } = useI18n();
  if (!hero) {
    return (
      <div
        className={cn(
          "grid min-h-[13rem] place-items-center rounded-[26px] border border-dashed border-white/12 bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0.08),transparent_48%),rgba(255,255,255,0.025)] px-4 text-center",
          className,
        )}
      >
        <div>
          <GameIcon kind="heroes" tone="steel" size="lg" className="mx-auto opacity-70" />
          <div className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/42">{emptyLabel}</div>
        </div>
      </div>
    );
  }

  const visual = getFrontlineHeroVisualAsset(hero.heroId);
  const heroName = frontlineHeroName(t, hero);
  const heroRole = frontlineHeroRole(t, hero);
  const hpWidth = Math.max(8, Math.min(100, Math.round((hero.maxHp / 30) * 100)));
  const sideClasses =
    side === "ally"
      ? "border-cyan-200/16 bg-[radial-gradient(circle_at_48%_28%,rgba(103,232,249,0.14),transparent_38%),linear-gradient(180deg,rgba(24,55,60,0.58),rgba(7,11,17,0.96))]"
      : "border-rose-200/16 bg-[radial-gradient(circle_at_48%_28%,rgba(251,113,133,0.14),transparent_38%),linear-gradient(180deg,rgba(72,24,34,0.58),rgba(10,8,14,0.96))]";

  return (
    <div
      title={`${heroName} - ${heroRole}`}
      className={cn(
        "frontline-motion-standee group/hero relative isolate overflow-hidden rounded-[28px] border p-3 text-left shadow-[0_20px_44px_rgba(0,0,0,0.26)] transition duration-300",
        compact ? "min-h-[14rem]" : "min-h-[17rem]",
        sideClasses,
        selected && "frontline-motion-selected ring-2 ring-[#f5c451]/30 shadow-[0_0_34px_rgba(245,196,81,0.18),0_20px_44px_rgba(0,0,0,0.32)]",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_32%)]" />
      <span className="pointer-events-none absolute left-1/2 top-[46%] h-10 w-36 -translate-x-1/2 rounded-full bg-black/36 blur-md" />
      <span
        className={cn(
          "pointer-events-none absolute bottom-6 left-1/2 h-8 w-[70%] -translate-x-1/2 rounded-full border shadow-[0_12px_28px_rgba(0,0,0,0.34)]",
          side === "ally"
            ? "border-cyan-200/16 bg-[linear-gradient(90deg,rgba(12,55,62,0.72),rgba(91,221,206,0.2),rgba(10,26,30,0.68))]"
            : "border-rose-200/16 bg-[linear-gradient(90deg,rgba(62,13,23,0.72),rgba(240,95,114,0.2),rgba(25,8,12,0.68))]",
        )}
      />

      <div className="relative z-[1] flex items-start justify-between gap-2">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/48">{label ?? `Tier ${hero.tier}`}</div>
          <div className="mt-1 text-lg font-black leading-tight text-white">{heroName}</div>
          <div className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-white/50">{heroRole}</div>
        </div>
        <GameIcon kind={hero.family === "enemy" ? "battle" : "heroes"} tone={side === "ally" ? "sky" : "ember"} size="sm" />
      </div>

      <div className={cn("relative z-[1] mx-auto mt-2", compact ? "h-24 w-24" : "h-32 w-28")}>
        <VisualAssetImage
          src={visual.standeeSrc}
          fallbackSrc={visual.portraitFallbackSrc}
          alt={heroName}
          className="h-full w-full overflow-visible rounded-t-[34px] rounded-b-[24px]"
          imgClassName={cn("h-full w-full object-top drop-shadow-[0_20px_28px_rgba(0,0,0,0.48)] transition duration-300 group-hover/hero:scale-105", visual.standeeSrc ? "object-contain" : "object-cover rounded-[24px]")}
          fallback={
            <div className="grid h-full w-full place-items-center rounded-[24px] bg-black/24">
              <GameGlyph kind="heroes" shell="none" className="h-10 w-10" />
            </div>
          }
        />
      </div>

      <div className="relative z-[1] mt-3">
        <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/58">
          <span>HP {hero.maxHp}</span>
          <span>ATK {hero.atk}</span>
          <span>DEF {hero.def}</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/34">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#ff6d69,#ffd86f)]" style={{ width: `${hpWidth}%` }} />
        </div>
      </div>
    </div>
  );
}

function VisualPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em]",
        tone === "gold" ? "border-[#f5c451]/22 bg-[#f5c451]/12 text-[#f5d498]" : "border-white/10 bg-black/18 text-white/58",
      )}
    >
      {children}
    </span>
  );
}

function VisualAssetImage({
  src,
  fallbackSrc,
  alt,
  className,
  imgClassName,
  fallback,
}: {
  src?: string | null;
  fallbackSrc?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallback?: ReactNode;
}) {
  const initialSrc = src ?? fallbackSrc ?? null;
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(initialSrc);
  const [failed, setFailed] = useState(initialSrc === null);

  useEffect(() => {
    const nextSrc = src ?? fallbackSrc ?? null;
    setResolvedSrc(nextSrc);
    setFailed(nextSrc === null);
  }, [fallbackSrc, src]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {resolvedSrc && !failed ? (
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={imgClassName}
          onError={() => {
            if (fallbackSrc && resolvedSrc !== fallbackSrc) {
              setResolvedSrc(fallbackSrc);
              return;
            }
            setFailed(true);
          }}
        />
      ) : (
        fallback ?? null
      )}
    </div>
  );
}
