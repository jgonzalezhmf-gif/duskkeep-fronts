"use client";

import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import { CombatIcon } from "./FrontlineCombatIcon";

type FrontlineLaneCenterMarkerProps = {
  active: boolean;
  breachSide: "ally" | "enemy" | null;
};

export function FrontlineLaneCenterMarker({ active, breachSide }: FrontlineLaneCenterMarkerProps) {
  const { t } = useI18n();
  const iconName = active ? "target" : breachSide === "ally" ? "breach" : breachSide === "enemy" ? "danger" : "clash";
  const label = active
    ? t("frontline.target")
    : breachSide === "ally"
      ? t("frontline.statusBreach")
      : breachSide === "enemy"
        ? t("frontline.defend")
        : t("frontline.clash");

  return (
    <div className="relative z-[1] my-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28))]" />
      <div
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-full text-[9px] font-black uppercase tracking-[0.18em]",
          active
            ? "bg-[#f5c451]/16 text-[#f5d498] shadow-[0_0_26px_rgba(245,196,81,0.22)]"
            : breachSide === "ally"
              ? "bg-emerald-300/12 text-emerald-100"
              : breachSide === "enemy"
                ? "bg-rose-300/12 text-rose-100"
                : "bg-black/24 text-white/44",
        )}
      >
        <CombatIcon name={iconName} size="md" className="h-7 w-7" fallbackClassName="opacity-90" />
        <span className="sr-only">{label}</span>
      </div>
      <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0.28),transparent)]" />
    </div>
  );
}
