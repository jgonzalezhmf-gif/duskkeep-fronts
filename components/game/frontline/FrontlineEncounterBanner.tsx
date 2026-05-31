"use client";

import { cn } from "@/lib/cn";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import { useI18n } from "@/lib/i18n/useI18n";
import { CombatIcon } from "./FrontlineCombatIcon";

export type FrontlineEncounterBadgeKind = "elite" | "boss" | "danger" | "arena";

const ENCOUNTER_KIND_META: Record<FrontlineEncounterBadgeKind, { labelKey: string; tone: string; icon: CombatAssetIconName }> = {
  boss: {
    labelKey: "frontline.encounterBoss",
    tone: "border-[#f5c451]/56 bg-[linear-gradient(180deg,rgba(245,196,81,0.22),rgba(40,18,8,0.8))] text-[#fff0bd] shadow-[0_18px_48px_rgba(245,196,81,0.22)]",
    icon: "leader_power",
  },
  elite: {
    labelKey: "frontline.encounterElite",
    tone: "border-violet-300/40 bg-[linear-gradient(180deg,rgba(192,132,252,0.22),rgba(28,12,46,0.78))] text-violet-50 shadow-[0_18px_48px_rgba(192,132,252,0.22)]",
    icon: "advantage",
  },
  danger: {
    labelKey: "frontline.encounterDanger",
    tone: "border-rose-300/42 bg-[linear-gradient(180deg,rgba(240,95,114,0.22),rgba(54,12,20,0.8))] text-rose-50 shadow-[0_18px_48px_rgba(240,95,114,0.22)]",
    icon: "danger",
  },
  arena: {
    labelKey: "arenaScreen.trials.badge",
    tone: "border-[#f5c451]/46 bg-[linear-gradient(180deg,rgba(245,196,81,0.18),rgba(54,34,17,0.78))] text-[#fff0bd] shadow-[0_18px_48px_rgba(245,196,81,0.18)]",
    icon: "advantage",
  },
};

export function EncounterBanner({ kind, title }: { kind: FrontlineEncounterBadgeKind; title: string | null }) {
  const { t } = useI18n();
  const meta = ENCOUNTER_KIND_META[kind];
  const label = t(meta.labelKey);
  const tone = meta.tone;
  const icon = meta.icon;
  return (
    <div data-encounter-banner={kind} className={cn("flex items-center justify-center gap-3 rounded-[20px] border px-4 py-2 backdrop-blur-md", tone)}>
      <CombatIcon name={icon} size="md" className="h-7 w-7" fallbackClassName="h-7 w-7" />
      <div className="flex flex-col items-center sm:flex-row sm:items-baseline sm:gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.32em]">{label}</span>
        {title ? <span className="text-sm font-black uppercase tracking-[0.18em] text-white/86">{title}</span> : null}
      </div>
    </div>
  );
}
