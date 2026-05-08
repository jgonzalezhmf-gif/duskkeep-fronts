"use client";

import { FRONTLINE_CARD_BY_ID, FRONTLINE_LEADER_BY_ID } from "@/features/frontline/data";
import { cn } from "@/lib/cn";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import {
  frontlineCardName,
  frontlineCardShortTargetLabel,
  frontlineLeaderPowerName,
} from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { getFrontlineCardVisualAsset } from "./frontlineVisualAssets";
import type { FrontlineCardPlayFx } from "./FrontlineCardCastFx";
import { CombatIcon } from "./FrontlineCombatIcon";
import { VisualAssetImage } from "./FrontlineVisualAssetImage";
import type { FrontlineVisualFxTone } from "./FrontlineLaneActionTrail";

function combatIconForTone(tone: FrontlineVisualFxTone): CombatAssetIconName {
  if (tone === "heal") return "heal";
  if (tone === "shield") return "shield";
  if (tone === "breach") return "breach";
  if (tone === "summon") return "summon";
  if (tone === "stun") return "stun";
  if (tone === "power") return "leader_power";
  return "attack";
}

export function CardUseToast({ fx }: { fx: FrontlineCardPlayFx | null }) {
  const { t } = useI18n();

  if (!fx) return null;

  const isLeader = fx.cardId.startsWith("leader:");
  const leaderId = isLeader ? fx.cardId.replace("leader:", "") : "";
  const card = isLeader ? null : FRONTLINE_CARD_BY_ID[fx.cardId];
  const leader = isLeader ? FRONTLINE_LEADER_BY_ID[leaderId] : null;
  const name = card ? frontlineCardName(t, card) : leader ? frontlineLeaderPowerName(t, leader) : t("frontline.power");
  const visual = card ? getFrontlineCardVisualAsset(card) : null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-[7.4rem] z-[9] hidden md:block">
      <div
        key={fx.id}
        className={cn(
          "frontline-card-use-toast-fx flex min-w-[17rem] items-center gap-3 rounded-[24px] border px-3 py-2 shadow-[0_22px_60px_rgba(0,0,0,0.42)] backdrop-blur-md",
          fx.tone === "heal"
            ? "border-emerald-200/40 bg-emerald-300/16"
            : fx.tone === "shield"
              ? "border-cyan-100/40 bg-cyan-300/16"
              : fx.tone === "summon"
                ? "border-emerald-100/40 bg-emerald-300/16"
                : "border-[#f5c451]/44 bg-[#f5c451]/16",
        )}
      >
        <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-[14px] bg-black/26 shadow-[0_12px_28px_rgba(0,0,0,0.34)]">
          {visual ? (
            <VisualAssetImage
              src={visual.cardArtSrc}
              fallbackSrc={visual.fallbackPortraitSrc}
              alt={`${name} art`}
              className="h-full w-full"
              imgClassName="h-full w-full object-contain object-center p-0.5"
              fallback={
                <div className="grid h-full w-full place-items-center">
                  <CombatIcon name={combatIconForTone(fx.tone)} size="md" fallbackClassName="opacity-90" />
                </div>
              }
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <CombatIcon name="leader_power" size="md" fallbackClassName="opacity-90" />
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.38))]" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d498]">{t("frontline.playCard")}</div>
          <div className="mt-1 max-w-[12rem] truncate text-lg font-black leading-none text-white">{name}</div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/72">
            <CombatIcon name={combatIconForTone(fx.tone)} size="xs" fallbackClassName="opacity-90" />
            <span>{card ? frontlineCardShortTargetLabel(t, card) : fx.lane ?? t("frontline.front")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
