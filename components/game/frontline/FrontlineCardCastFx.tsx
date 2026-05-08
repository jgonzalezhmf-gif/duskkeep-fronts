"use client";

import { FRONTLINE_CARD_BY_ID } from "@/features/frontline/data";
import type { FrontlineEvent } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import { useI18n } from "@/lib/i18n/useI18n";
import type { FrontlineLane } from "@/lib/types";
import { CombatIcon } from "./FrontlineCombatIcon";
import type { FrontlineVisualFxTone } from "./FrontlineLaneActionTrail";

export type FrontlineCardPlayFx = {
  id: number;
  cardId: string;
  lane: FrontlineLane | null;
  targetSide: "ally" | "enemy" | "both" | null;
  tone: FrontlineVisualFxTone;
  events: FrontlineEvent[];
};

const CAST_TONE_LABEL_KEY: Record<FrontlineVisualFxTone, string> = {
  heal: "frontline.castHeal",
  shield: "frontline.castShield",
  summon: "frontline.castSummon",
  stun: "frontline.castStun",
  power: "frontline.castPower",
  damage: "frontline.castStrike",
  breach: "frontline.castStrike",
  ko: "frontline.castStrike",
};

function combatIconForTone(tone: FrontlineVisualFxTone): CombatAssetIconName {
  if (tone === "heal") return "heal";
  if (tone === "shield") return "shield";
  if (tone === "breach") return "breach";
  if (tone === "summon") return "summon";
  if (tone === "stun") return "stun";
  if (tone === "power") return "leader_power";
  return "attack";
}

export function CardCastFx({ fx }: { fx: FrontlineCardPlayFx | null }) {
  const { t } = useI18n();

  if (!fx) return null;

  const icon = combatIconForTone(fx.tone);
  const card = fx.cardId.startsWith("leader:") ? null : FRONTLINE_CARD_BY_ID[fx.cardId];
  const fallbackKey = card ? "frontline.castStrike" : "frontline.castCast";
  const label = t(CAST_TONE_LABEL_KEY[fx.tone] ?? fallbackKey).toUpperCase();
  const toneClass =
    fx.tone === "heal"
      ? "border-emerald-200/60 bg-emerald-300/16 text-emerald-50 shadow-[0_0_54px_rgba(75,224,141,0.34)]"
      : fx.tone === "shield"
        ? "border-cyan-100/60 bg-cyan-300/16 text-cyan-50 shadow-[0_0_54px_rgba(101,210,200,0.34)]"
        : fx.tone === "summon"
          ? "border-emerald-100/60 bg-emerald-300/16 text-emerald-50 shadow-[0_0_54px_rgba(75,224,141,0.34)]"
          : fx.tone === "stun" || fx.tone === "power"
            ? "border-[#f5c451]/70 bg-[#f5c451]/16 text-[#fff0b8] shadow-[0_0_58px_rgba(245,196,81,0.38)]"
            : "border-rose-100/60 bg-rose-400/16 text-rose-50 shadow-[0_0_58px_rgba(240,95,114,0.36)]";

  return (
    <div className="pointer-events-none absolute inset-0 z-[6]">
      <div
        className={cn(
          "frontline-cast-wave-fx absolute left-1/2 top-1/2 h-40 w-40 rounded-full border-2",
          fx.tone === "damage" || fx.tone === "ko" ? "border-rose-200/54 bg-rose-300/10" : "border-[#f5c451]/46 bg-[#f5c451]/8",
        )}
      />
      <div
        className={cn(
          "frontline-card-cast-fx absolute left-1/2 top-1/2 grid h-32 w-32 place-items-center rounded-[34px] border-2 backdrop-blur-md",
          toneClass,
        )}
      >
        <div className="grid place-items-center gap-1">
          <CombatIcon name={icon} size="xl" className="h-16 w-16" fallbackClassName="h-16 w-16 drop-shadow-[0_10px_18px_rgba(0,0,0,0.44)]" />
          <div className="rounded-full bg-black/34 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
