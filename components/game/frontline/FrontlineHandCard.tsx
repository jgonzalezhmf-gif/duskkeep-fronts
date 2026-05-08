"use client";

import { CardTypeIcon } from "@/components/game/shared/CardTypeIcon";
import { ResourceIcon } from "@/components/game/shared/ResourceIcon";
import type { FrontlineCardDef } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import {
  frontlineCardDescription,
  frontlineCardEffectSummary,
  frontlineCardKindLabel,
  frontlineCardName,
  frontlineCardShortTargetLabel,
  type TranslateFn,
} from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import type { FrontlineLane } from "@/lib/types";
import { CombatIcon } from "./FrontlineCombatIcon";
import { getFrontlineCardVisualAsset } from "./frontlineVisualAssets";
import { cardSurfaceClass } from "./FrontlineBattleSurfaceClasses";
import { VisualAssetImage } from "./FrontlineVisualAssetImage";

type FrontlineHandCardProps = {
  card: FrontlineCardDef;
  selected: boolean;
  playable: boolean;
  recommendedLane: FrontlineLane | null;
  command: number;
  onClick: () => void;
};

function combatIconForCard(card: FrontlineCardDef): CombatAssetIconName {
  if (card.kind === "summon" || card.effect.type === "summon") return "summon";
  if (card.effect.type === "heal_front") return "heal";
  if (card.effect.type === "stun_front") return "stun";
  if (card.effect.type === "hero_strike" && card.effect.shield) return "shield";
  if (card.effect.type === "rally") return "leader_power";
  return "attack";
}

function laneLabel(t: TranslateFn, lane: FrontlineLane) {
  if (lane === "left") return t("frontline.left");
  if (lane === "center") return t("frontline.center");
  return t("frontline.right");
}

function cardFamilyLabel(t: TranslateFn, card: FrontlineCardDef) {
  return frontlineCardKindLabel(t, card);
}

function cardTargetLabel(t: TranslateFn, card: FrontlineCardDef) {
  return frontlineCardShortTargetLabel(t, card);
}

function cardEffectSummary(t: TranslateFn, card: FrontlineCardDef) {
  return frontlineCardEffectSummary(t, card);
}

function cardFrameTone(card: FrontlineCardDef) {
  if (card.cost >= 4 || (card.level ?? 1) >= 4) return "legendary";
  if (card.kind === "summon") return "epic";
  if (card.kind === "order") return "rare";
  return "common";
}

export function FrontlineHandCard({
  card,
  selected,
  playable,
  recommendedLane,
  command,
  onClick,
}: FrontlineHandCardProps) {
  const { t } = useI18n();
  const visual = getFrontlineCardVisualAsset(card);
  const combatIcon = combatIconForCard(card);
  const cardName = frontlineCardName(t, card);
  const cardDescription = frontlineCardDescription(t, card);
  const insufficientCommand = card.cost > command;
  const frameTone = cardFrameTone(card);

  return (
    <button
      type="button"
      data-hand-card={card.id}
      title={cardDescription}
      disabled={!playable}
      className={cn(
        "group relative h-[15.15rem] w-[11.35rem] shrink-0 overflow-hidden rounded-[24px] p-2 text-left shadow-[0_18px_38px_rgba(0,0,0,0.3)] transition duration-300 xl:h-[15.35rem] xl:w-[11.55rem]",
        cardSurfaceClass(frameTone, selected, playable),
        playable
          ? "frontline-card-ready-fx hover:-translate-y-1 hover:shadow-[0_24px_46px_rgba(0,0,0,0.38)]"
          : "opacity-65 grayscale-[0.5] saturate-[0.7]",
        selected && "frontline-card-selected-fx",
      )}
      onClick={onClick}
    >
      <div
        className="absolute inset-[5px] z-0 overflow-hidden rounded-[19px] bg-cover bg-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        style={visual.cardArtSrc ? { backgroundImage: `url('${visual.cardArtSrc}')` } : undefined}
      >
        <div className="absolute inset-0 bg-black/20" />
        <VisualAssetImage
          src={visual.cardArtSrc}
          fallbackSrc={visual.fallbackPortraitSrc}
          alt={`${cardName} art`}
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-contain object-center opacity-100 saturate-[1.12] contrast-[1.04] transition duration-300 group-hover:scale-[1.018]"
          fallback={
            <div className="grid h-full w-full place-items-center">
              <CombatIcon name={combatIcon} size="xl" fallbackClassName="opacity-95 drop-shadow-[0_12px_18px_rgba(0,0,0,0.36)] transition duration-300 group-hover:scale-110" />
            </div>
          }
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.02)_36%,rgba(0,0,0,0.06)_58%,rgba(0,0,0,0.82))]" />
      </div>
      <div className="absolute inset-x-3 top-2 h-1.5 rounded-full bg-current opacity-80" />
      <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-white/10 blur-xl transition duration-300 group-hover:bg-white/16" />
      {selected ? (
        <div className="frontline-target-pulse-fx pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(245,196,81,0.28),transparent_54%)]" />
      ) : null}
      {playable && !selected ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-3 h-px bg-[linear-gradient(90deg,transparent,rgba(245,212,152,0.42),transparent)] opacity-70" />
      ) : null}

      <div className="sr-only">
        <CardTypeIcon type={card.kind} size="sm" className="h-7 w-7" />
        <span>{cardFamilyLabel(t, card)}</span>
        <span>{cardName}</span>
      </div>

      {card.usesPerBattle ? (
        <div
          className="absolute left-2 top-2 z-[3] inline-flex items-center gap-1 rounded-full border border-violet-300/70 bg-violet-500/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-violet-50 shadow-[0_0_14px_rgba(180,120,255,0.36)] backdrop-blur-sm"
          title={t("frontline.cardLimitedTimes", { count: card.usesPerBattle })}
        >
          <CombatIcon name="leader_power" size="xs" fallbackClassName="opacity-90" />
          <span>
            {card.usesPerBattle}
            {"\u00d7"}
          </span>
        </div>
      ) : null}
      <div
        className={cn(
          "absolute right-2 top-2 z-[3] inline-flex h-9 min-w-12 shrink-0 items-center justify-center gap-1 rounded-full px-2 text-lg font-black shadow-[0_0_24px_rgba(245,196,81,0.22),inset_0_1px_0_rgba(255,255,255,0.24)]",
          insufficientCommand
            ? "bg-[radial-gradient(circle_at_35%_28%,rgba(255,200,200,0.55),rgba(220,80,90,0.42)_44%,rgba(40,0,0,0.5)_100%)] ring-2 ring-rose-300/60 text-rose-50"
            : "bg-[radial-gradient(circle_at_35%_28%,rgba(255,247,213,0.6),rgba(245,196,81,0.34)_44%,rgba(0,0,0,0.36)_100%)] text-[#ffe7a2]",
        )}
      >
        <ResourceIcon kind="command" size="small" className={cn("h-5 w-5 opacity-90", insufficientCommand && "opacity-70")} />
        <span className="text-base font-black leading-none text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">{card.cost}</span>
      </div>

      <div className="absolute inset-x-3 bottom-3 z-[1]">
        <div className="flex items-center gap-2 truncate rounded-[16px] bg-black/38 px-2.5 py-2 text-[12px] font-black leading-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[1px]">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <CombatIcon name={combatIcon} size="lg" className="h-10 w-10 scale-[1.18]" fallbackClassName="opacity-88" />
          </span>
          <span className="truncate">{cardEffectSummary(t, card)}</span>
        </div>

        <div className="sr-only">
          {cardTargetLabel(t, card)}
          {recommendedLane ? ` ${laneLabel(t, recommendedLane)}` : ""}
          {selected ? ` ${t("frontline.targeting")}` : ""}
        </div>

        <div className="hidden">
          <span className={cn(playable ? "text-emerald-200" : "text-rose-200")}>
            {playable ? t("frontline.ready") : t("frontline.needCommand", { amount: Math.max(0, card.cost - command) })}
          </span>
        </div>
      </div>

      {!playable ? (
        <div className="pointer-events-none absolute inset-0 z-[2] grid place-items-center rounded-[24px] bg-[radial-gradient(circle_at_50%_45%,rgba(20,8,8,0.34),rgba(8,5,5,0.62)_72%)] backdrop-blur-[1px]">
          <div className="flex items-center gap-1.5 rounded-full border border-rose-200/40 bg-[#1a0a10]/86 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-rose-100 shadow-[0_8px_22px_rgba(0,0,0,0.4)]">
            <ResourceIcon kind="command" size="small" className="h-4 w-4 opacity-80" />
            <span>{t("frontline.needCommand", { amount: Math.max(0, card.cost - command) })}</span>
          </div>
        </div>
      ) : null}
    </button>
  );
}
