"use client";

import type { ComponentProps, ReactNode } from "react";
import { CardTypeIcon, type CardTypeIconName } from "@/components/game/shared/CardTypeIcon";
import GameIcon from "@/components/game/shared/GameIcon";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { ResourceIcon } from "@/components/game/shared/ResourceIcon";
import { FRONTLINE_CARD_MAX_LEVEL } from "@/features/frontline/cardProgression";
import type { FrontlineCardDef } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import { frontlineCardEffectSummary, frontlineCardKindLabel, frontlineCardName } from "@/lib/i18n/frontlineText";

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;
type GameIconKind = ComponentProps<typeof GameIcon>["kind"];

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

export function WarTableSeal({
  ready,
  label,
  nextAction,
}: {
  ready: boolean;
  label: string;
  nextAction: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[28px] border p-3 shadow-[0_24px_52px_rgba(0,0,0,0.3)]",
        ready
          ? "border-emerald-200/24 bg-[radial-gradient(circle_at_50%_0%,rgba(167,243,208,0.2),transparent_38%),linear-gradient(180deg,rgba(16,185,129,0.18),rgba(8,15,14,0.86))]"
          : "border-[#f5c451]/24 bg-[radial-gradient(circle_at_50%_0%,rgba(245,196,81,0.22),transparent_38%),linear-gradient(180deg,rgba(245,196,81,0.14),rgba(18,14,9,0.88))]",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_38%,rgba(0,0,0,0.28))]" />
      <div className="relative z-[1] flex items-center gap-3">
        <GameIcon kind="battle" tone={ready ? "emerald" : "gold"} size="lg" />
        <div className="min-w-0">
          <div className={cn("text-[10px] font-black uppercase tracking-[0.2em]", ready ? "text-emerald-100/80" : "text-[#f5d498]/82")}>
            {label}
          </div>
          <div className="mt-1 truncate text-[1.45rem] font-black leading-none text-white md:text-[1.75rem]">
            {nextAction}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReadinessRune({
  kind,
  label,
  value,
  ready,
}: {
  kind: GameIconKind;
  label: string;
  value: string | number;
  ready: boolean;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[20px] border px-3 py-2",
        ready
          ? "border-emerald-200/18 bg-emerald-400/10"
          : "border-orange-200/18 bg-orange-500/10",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.12),transparent_34%)]" />
      <div className="relative z-[1] flex items-center gap-2">
        <GameIcon kind={kind} tone={ready ? "emerald" : "ember"} size="sm" />
        <div className="min-w-0">
          <div className="text-[9px] font-black uppercase tracking-[0.15em] text-white/42">{label}</div>
          <div className="mt-0.5 truncate text-sm font-black text-white">{value}</div>
        </div>
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

export function PackageSlotGrid({
  cards,
  targetSize,
  emptyLabel,
  t,
}: {
  cards: FrontlineCardDef[];
  targetSize: number;
  emptyLabel: string;
  t: TranslateFn;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
      {Array.from({ length: targetSize }).map((_, index) => {
        const card = cards[index];
        if (!card) {
          return (
            <div
              key={`empty-${index}`}
              className="grid min-h-[5.35rem] place-items-center rounded-[18px] border border-dashed border-white/12 bg-white/[0.025] px-2 text-center text-[9px] font-black uppercase tracking-[0.12em] text-white/30"
            >
              {emptyLabel}
            </div>
          );
        }

        return (
          <div
            key={card.id}
            className="group relative isolate min-h-[5.35rem] overflow-hidden rounded-[18px] border border-[#f5c451]/18 bg-[linear-gradient(180deg,rgba(245,196,81,0.11),rgba(8,10,16,0.82))] p-2"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.14),transparent_34%)]" />
            <div className="relative z-[1] flex h-full flex-col justify-between gap-2">
              <div className="flex items-start justify-between gap-2">
                <CardTypeIcon type={card.kind as CardTypeIconName} size="sm" className="h-8 w-8" />
                <div className="rounded-full border border-white/10 bg-black/26 px-2 py-1 text-[10px] font-black text-white">{card.cost}</div>
              </div>
              <div>
                <div className="truncate text-[12px] font-black text-white">{frontlineCardName(t, card)}</div>
                <div className="mt-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white/42">
                  {frontlineCardKindLabel(t, card)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
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
