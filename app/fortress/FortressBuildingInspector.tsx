"use client";

import { FortressIcon } from "@/components/game/shared/FortressIcon";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { ScreenBadge } from "@/components/game/screens/ScreenChrome";
import { FRONTLINE_FORTRESS_BUILDINGS } from "@/features/frontline/fortress";
import { cn } from "@/lib/cn";
import {
  BUILDING_META,
  buildingLabel,
  buildingPerk,
  buildingShort,
  type TranslateFn,
} from "./fortressPageHelpers";
import { CostTile } from "./FortressPrimitives";

export function BuildingInspector({
  building,
  level,
  cost,
  affordable,
  resources,
  onUpgrade,
  t,
}: {
  building: (typeof FRONTLINE_FORTRESS_BUILDINGS)[number];
  level: number;
  cost: { gold: number; dust: number };
  affordable: boolean;
  resources: { gold: number; dust: number };
  onUpgrade: () => void;
  t: TranslateFn;
}) {
  const meta = BUILDING_META[building.id];
  const label = buildingLabel(building.id, t);
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,20,31,0.62),rgba(6,8,14,0.82))] p-3 shadow-[0_16px_36px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <span className={cn("pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,var(--tw-gradient-stops))] blur-2xl opacity-70", meta.glow)} />
      <div className="relative z-[1] flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <FortressIcon name={meta.icon} size="xl" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{buildingShort(building.id, t)}</div>
            <div className="mt-1 text-xl font-black text-white">{label} {t("fortressScreen.buildings.level", { level })}</div>
          </div>
        </div>
        <ScreenBadge tone={affordable ? "emerald" : "gold"}>{affordable ? t("fortressScreen.upgrade.ready") : t("fortressScreen.upgrade.gathering")}</ScreenBadge>
      </div>
      <p className="relative z-[1] mt-1.5 max-w-[46rem] text-[12px] leading-5 text-white/52">{buildingPerk(building.id, t)}</p>
      <div className="relative z-[1] mt-2.5 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="grid grid-cols-2 gap-2">
          <CostTile label={t("fortressScreen.resources.gold")} icon="gold" current={resources.gold} required={cost.gold} tone="gold" />
          <CostTile label={t("fortressScreen.resources.dust")} icon="dust" current={resources.dust} required={cost.dust ?? 0} tone="violet" />
        </div>
        <button
          className="frontline-motion-action frontline-feedback-upgrade rounded-[20px] border border-[#f8d57b]/28 bg-[linear-gradient(180deg,#fff0bc_0%,#f5c451_46%,#b96d1f_100%)] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#221102] shadow-[0_16px_32px_rgba(245,196,81,0.22)] transition disabled:opacity-40 disabled:hover:translate-y-0"
          disabled={!affordable}
          onClick={onUpgrade}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <ProgressionIcon name="upgrade" size="sm" />
            {t("fortressScreen.upgrade.action")}
          </span>
        </button>
      </div>
    </section>
  );
}
