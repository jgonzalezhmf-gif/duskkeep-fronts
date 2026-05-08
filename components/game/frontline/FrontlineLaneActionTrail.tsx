"use client";

import type { FrontlineEvent } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import { CombatIcon } from "./FrontlineCombatIcon";

export type FrontlineVisualFxTone = "damage" | "heal" | "shield" | "breach" | "ko" | "summon" | "stun" | "power";

export function LaneActionTrail({
  event,
  targetSide,
  tone,
  icon,
}: {
  event: FrontlineEvent | null;
  targetSide: "ally" | "enemy" | null;
  tone: FrontlineVisualFxTone | null;
  icon: CombatAssetIconName | null;
}) {
  if (!event || !event.side || !targetSide || !tone || !icon) return null;

  const isAttack = event.kind === "damage" || event.kind === "stun" || event.kind === "ko";
  const direction = isAttack && event.side === "ally" ? "up" : "down";
  const targetTop = targetSide === "enemy" ? "top-[25%]" : "top-[72%]";
  const trailClass =
    tone === "heal"
      ? "from-emerald-200/0 via-emerald-200/85 to-emerald-200/0 shadow-[0_0_28px_rgba(75,224,141,0.36)]"
      : tone === "shield"
        ? "from-cyan-100/0 via-cyan-100/85 to-cyan-100/0 shadow-[0_0_28px_rgba(101,210,200,0.36)]"
        : tone === "breach" || tone === "ko"
          ? "from-[#f5c451]/0 via-[#f5c451]/90 to-[#f5c451]/0 shadow-[0_0_34px_rgba(245,196,81,0.42)]"
          : "from-rose-200/0 via-rose-200/90 to-rose-200/0 shadow-[0_0_34px_rgba(240,95,114,0.38)]";

  return (
    <div className="pointer-events-none absolute inset-0 z-[6]">
      {isAttack ? (
        <div
          className={cn(
            "absolute left-1/2 top-[31%] h-[38%] w-4 rounded-full bg-gradient-to-b",
            trailClass,
            direction === "up" ? "frontline-action-trail-up-fx" : "frontline-action-trail-down-fx",
          )}
        />
      ) : null}
      <div
        className={cn(
          "frontline-action-impact-fx absolute left-1/2 grid h-24 w-24 place-items-center rounded-full border-2 backdrop-blur-sm",
          targetTop,
          tone === "heal"
            ? "border-emerald-100/55 bg-emerald-300/14 text-emerald-50 shadow-[0_0_44px_rgba(75,224,141,0.34)]"
            : tone === "shield"
              ? "border-cyan-100/55 bg-cyan-300/14 text-cyan-50 shadow-[0_0_44px_rgba(101,210,200,0.34)]"
              : tone === "breach" || tone === "ko"
                ? "border-[#f5c451]/62 bg-[#f5c451]/16 text-[#fff0bd] shadow-[0_0_52px_rgba(245,196,81,0.4)]"
                : "border-rose-100/58 bg-rose-400/16 text-rose-50 shadow-[0_0_50px_rgba(240,95,114,0.38)]",
        )}
      >
        <CombatIcon name={icon} size="lg" className="h-12 w-12" fallbackClassName="h-12 w-12" />
      </div>
    </div>
  );
}
