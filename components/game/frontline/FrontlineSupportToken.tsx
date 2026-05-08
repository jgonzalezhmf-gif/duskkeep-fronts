"use client";

import type { FrontlineBattleState } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import { frontlineSupportName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { CombatIcon } from "./FrontlineCombatIcon";

export function SupportToken({
  support,
  active,
  side = "ally",
}: {
  support: FrontlineBattleState["lanes"]["left"]["allySupport"];
  active?: boolean;
  side?: "ally" | "enemy";
}) {
  const { t } = useI18n();

  if (!support) return null;

  const icon: CombatAssetIconName =
    support.effect?.type === "shield" ? "shield" : support.effect?.type === "mark" ? "target" : "summon";
  const supportName = frontlineSupportName(t, support);
  const hpRatio = support.maxHp > 0 ? Math.max(0, Math.min(1, support.hp / support.maxHp)) : 0;
  const tone =
    side === "ally"
      ? "border-cyan-200/40 bg-cyan-300/14 text-cyan-50"
      : "border-rose-200/40 bg-rose-300/14 text-rose-50";

  return (
    <div
      title={`${supportName} - ${support.hp}/${support.maxHp} - ${support.duration}T`}
      className={cn(
        "relative inline-flex min-w-[6.5rem] items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] backdrop-blur-md transition",
        tone,
        active && "frontline-support-pop-fx ring-2 ring-[#f5c451]/40",
      )}
    >
      <CombatIcon name={icon} size="sm" className="h-4 w-4 shrink-0" fallbackClassName="opacity-95 h-4 w-4" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-1.5">
          <span className="truncate max-w-[5rem]">{supportName}</span>
          <span className="text-[9px] opacity-80">T{support.duration}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-black/40">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#ff8a5b,#ffd86f)] transition-[width] duration-300"
            style={{ width: `${hpRatio * 100}%` }}
          />
        </div>
        <div className="text-[9px] opacity-72">
          {support.hp}/{support.maxHp}
          {support.atk > 0 ? ` - ${support.atk} ATK` : ""}
        </div>
      </div>
    </div>
  );
}
