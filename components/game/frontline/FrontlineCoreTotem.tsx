"use client";

import ArtPortrait from "@/components/ui/ArtPortrait";
import GameGlyph from "@/components/ui/GameGlyph";
import { FRONTLINE_LEADER_BY_ID } from "@/features/frontline/data";
import { getLeaderPortrait } from "@/lib/art";
import { cn } from "@/lib/cn";
import { frontlineLeaderName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { CombatIcon } from "./FrontlineCombatIcon";

export function CoreTotem({
  leaderId,
  leaderNameOverride,
  portraitSrc,
  title,
  hp,
  maxHp,
  accent,
  flash,
  powerCooldown,
  powerReadyExtra,
}: {
  leaderId: string;
  leaderNameOverride?: string | null;
  portraitSrc?: string | null;
  title: string;
  hp: number;
  maxHp: number;
  accent: "ally" | "enemy";
  flash?: boolean;
  powerCooldown?: number;
  powerReadyExtra?: boolean;
}) {
  const { t } = useI18n();
  const leader = FRONTLINE_LEADER_BY_ID[leaderId];
  const leaderName = leaderNameOverride ?? frontlineLeaderName(t, leader);
  const width = Math.max(0, (hp / maxHp) * 100);
  const cooldownMax = leader?.power.cooldown ?? 0;
  const cooldownRemaining = typeof powerCooldown === "number" ? Math.max(0, powerCooldown) : 0;
  const cooldownProgress = cooldownMax > 0 ? Math.min(1, cooldownRemaining / cooldownMax) : 0;
  const cooldownDeg = Math.round((1 - cooldownProgress) * 360);
  const showRing = typeof powerCooldown === "number";
  const powerReady = cooldownRemaining === 0 && (powerReadyExtra ?? true);
  const powerLabel = cooldownRemaining > 0 ? `cd ${cooldownRemaining}` : t("frontline.ready");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[26px] border px-3 py-2.5 text-center shadow-[inset_0_1px_0_rgba(245,212,152,0.035),0_14px_34px_rgba(0,0,0,0.14)] backdrop-blur-[1px]",
        accent === "ally"
          ? "border-[#f5d498]/5 bg-[linear-gradient(180deg,rgba(35,83,112,0.11),rgba(8,12,17,0.24))]"
          : "border-[#f5d498]/5 bg-[linear-gradient(180deg,rgba(110,44,55,0.11),rgba(14,8,13,0.24))]",
        flash && "frontline-core-hit-fx ring-2 ring-[#f5c451]/24 shadow-[0_0_34px_rgba(245,196,81,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]",
      )}
    >
      <div className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,212,152,0.18),transparent)]" />
      <span className="sr-only">{title}</span>
      <div className="relative">
        <div className="truncate text-sm font-black leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">{leaderName}</div>
        <div className="relative mx-auto mt-2 h-24 w-20">
          {showRing ? (
            <div
              className={cn(
                "pointer-events-none absolute -inset-1 rounded-[24px]",
                powerReady && "frontline-power-ready-ring-fx",
              )}
              style={{
                background:
                  cooldownProgress > 0
                    ? `conic-gradient(rgba(245,196,81,0.86) 0deg ${cooldownDeg}deg, rgba(255,255,255,0.08) ${cooldownDeg}deg 360deg)`
                    : powerReady
                      ? "conic-gradient(rgba(245,196,81,0.86) 0deg 360deg)"
                      : "conic-gradient(rgba(255,255,255,0.16) 0deg 360deg)",
                WebkitMask: "radial-gradient(circle, transparent 64%, black 66%)",
                mask: "radial-gradient(circle, transparent 64%, black 66%)",
              }}
              aria-hidden
            />
          ) : null}
          <ArtPortrait
            src={portraitSrc ?? getLeaderPortrait(leaderId)}
            alt={leaderName}
            className="h-24 w-20 rounded-[22px] bg-black/10 object-contain p-0.5 shadow-[0_16px_30px_rgba(0,0,0,0.24)]"
            fallback={<GameGlyph kind="battle" shell="none" className="h-6 w-6" />}
          />
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/26">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#ff8a5b,#f5d498)]" style={{ width: `${width}%` }} />
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/62">
          <span>{hp}/{maxHp}</span>
          <span className="inline-flex items-center gap-1" title={powerLabel}>
            <CombatIcon name="leader_power" size="sm" className="h-5 w-5" fallbackClassName="opacity-75" />
            {cooldownRemaining > 0 ? cooldownRemaining : null}
            <span className="sr-only">{powerLabel}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
