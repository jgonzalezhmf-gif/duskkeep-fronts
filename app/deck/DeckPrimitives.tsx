"use client";

import type { ReactNode } from "react";
import { CardTypeIcon, type CardTypeIconName } from "@/components/game/shared/CardTypeIcon";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { ResourceIcon } from "@/components/game/shared/ResourceIcon";
import { FRONTLINE_CARD_MAX_LEVEL } from "@/features/frontline/cardProgression";
import type { FrontlineCardDef } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import { frontlineCardEffectSummary, frontlineCardKindLabel, frontlineCardName } from "@/lib/i18n/frontlineText";

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.052),rgba(8,10,16,0.9))] p-3 shadow-[0_18px_38px_rgba(0,0,0,0.22)]">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{title}</div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Metric({ label, value, ok, t }: { label: string; value: string | number; ok: boolean; t: TranslateFn }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(9,11,17,0.88))] px-3 py-2">
      <div className="text-[9px] uppercase tracking-[0.15em] text-white/44">{label}</div>
      <div className="mt-1 text-sm font-black text-white">{value}</div>
      <div className={cn("mt-0.5 text-[9px] uppercase tracking-[0.13em]", ok ? "text-emerald-300/70" : "text-rose-300/70")}>
        {ok ? t("deckScreen.metrics.ready") : t("deckScreen.metrics.missing")}
      </div>
    </div>
  );
}

export function BuildPill({ icon, label, value }: { icon: CardTypeIconName; label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1.5">
      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-white/56">
        <CardTypeIcon type={icon} size="xs" className="h-5 w-5" />
        <span>{label}</span>
      </div>
      <div className="text-sm font-black text-white">{value}</div>
    </div>
  );
}

export function SelectedPackageRow({ card, t }: { card: FrontlineCardDef; t: TranslateFn }) {
  return (
    <div className="group flex items-center gap-2 rounded-[16px] border border-[#f5c451]/14 bg-[#f5c451]/8 px-2.5 py-2">
      <CardTypeIcon type={card.kind as CardTypeIconName} size="sm" className="h-6 w-6 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-black text-white">{frontlineCardName(t, card)}</div>
        <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[9px] font-black uppercase tracking-[0.1em] text-white/46">
          <span>{frontlineCardKindLabel(t, card)}</span>
          <span className="truncate text-[#f5d498]/76">{frontlineCardEffectSummary(t, card)}</span>
        </div>
      </div>
      <div className="rounded-full border border-white/10 bg-black/24 px-2 py-1 text-[10px] font-black text-white">{card.cost}</div>
    </div>
  );
}

export function CardUpgradeBar({
  level,
  cost,
  unlocked,
  unlockHint,
  canUpgrade,
  onUpgrade,
  t,
}: {
  level: number;
  cost: { gold: number; dust: number };
  unlocked: boolean;
  unlockHint: string;
  canUpgrade: boolean;
  onUpgrade: () => void;
  t: TranslateFn;
}) {
  const maxed = level >= FRONTLINE_CARD_MAX_LEVEL;
  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-[18px] border border-white/10 bg-white/[0.04] px-3 py-2">
      <div className="min-w-0">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#f5d498]">
          <ProgressionIcon name={!unlocked ? "unlock" : maxed ? "star" : "upgrade"} size="xs" className="h-5 w-5" />
          {!unlocked ? t("deckScreen.cardUpgrade.locked") : maxed ? t("deckScreen.cardUpgrade.max") : t("deckScreen.cardUpgrade.level", { level })}
        </div>
        {!unlocked ? (
          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-white/42">
            {unlockHint}
          </div>
        ) : !maxed ? (
          <div className="mt-1 flex items-center gap-2 text-[10px] font-black text-white/58">
            <span className="inline-flex items-center gap-1"><ResourceIcon kind="gold" size="small" className="h-5 w-5" />{cost.gold}</span>
            <span className="inline-flex items-center gap-1"><ResourceIcon kind="dust" size="small" className="h-5 w-5" />{cost.dust}</span>
          </div>
        ) : null}
      </div>
      <button
        type="button"
        disabled={!unlocked || maxed || !canUpgrade}
        onClick={onUpgrade}
        className={cn(
          "frontline-motion-action rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] transition",
          !unlocked
            ? "border-white/10 bg-black/20 text-white/28"
            : maxed
              ? "border-[#f5c451]/18 bg-[#f5c451]/10 text-[#f5d498]"
              : canUpgrade
                ? "border-[#f5c451]/32 bg-[#f5c451]/16 text-[#ffe0a2] hover:-translate-y-0.5"
                : "border-white/10 bg-black/20 text-white/34",
        )}
      >
        {!unlocked ? t("deckScreen.cardUpgrade.locked") : maxed ? t("deckScreen.cardUpgrade.done") : t("deckScreen.cardUpgrade.action")}
      </button>
    </div>
  );
}
