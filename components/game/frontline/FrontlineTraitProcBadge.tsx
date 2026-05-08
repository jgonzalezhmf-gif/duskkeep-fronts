"use client";

import { StatusIcon, type StatusIconName } from "@/components/game/shared/StatusIcon";
import type { FrontlineEvent } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";

export function TraitProcBadge({ trait, side }: { trait: NonNullable<FrontlineEvent["trait"]>; side: "ally" | "enemy" }) {
  const { t } = useI18n();
  const label = t(`frontlineData.traits.${trait}.label`);
  const traitMeta: Record<typeof trait, { icon: StatusIconName }> = {
    bulwark: { icon: "guard" },
    flurry: { icon: "rush" },
    breach: { icon: "armor_break" },
    mend: { icon: "regen" },
    ambush: { icon: "rush" },
    chant: { icon: "buff" },
    lifesteal: { icon: "bleed" },
    venom: { icon: "poison" },
  };
  const icon = traitMeta[trait].icon;
  const tone = side === "ally"
    ? "border-cyan-200/72 bg-cyan-300/26 text-cyan-50"
    : "border-rose-200/72 bg-rose-300/26 text-rose-50";
  return (
    <div
      className={cn(
        "frontline-trait-proc-fx pointer-events-none absolute left-1/2 top-[-1.6rem] z-[5] inline-flex -translate-x-1/2 items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(255,255,255,0.18)] backdrop-blur-sm",
        tone,
      )}
    >
      <StatusIcon name={icon} size="sm" className="h-4 w-4" fallbackClassName="opacity-95 h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}
