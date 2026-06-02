import type { FortressIconName } from "@/components/game/shared/FortressIcon";
import type { FrontlineFortressBuildingId, FrontlineFortressOutcome } from "@/lib/types";

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export type FortressLoopStepTone = "ready" | "waiting" | "attention";

export type FortressLoopStep = {
  id: "garrison" | "upgrade" | "raid";
  icon: FortressIconName;
  labelKey: string;
  value?: string;
  valueKey?: string;
  tone: FortressLoopStepTone;
};

export const BUILDING_META: Record<
  FrontlineFortressBuildingId,
  {
    label: string;
    icon: FortressIconName;
    position: string;
    glow: string;
    short: string;
    perk: string;
  }
> = {
  keep: {
    label: "Keep",
    icon: "keep",
    position: "left-[38%] top-[10%] h-[44%] w-[24%]",
    glow: "from-[#ffe5a3]/30 via-[#f5c451]/12 to-transparent",
    short: "Integrity anchor",
    perk: "Protects raid efficiency and softens long-term damage.",
  },
  treasury: {
    label: "Treasury",
    icon: "treasury",
    position: "left-[17%] top-[45%] h-[31%] w-[26%]",
    glow: "from-emerald-200/22 via-[#f5c451]/12 to-transparent",
    short: "Payout engine",
    perk: "Turns successful holds into better gold, dust and gems.",
  },
  barracks: {
    label: "Barracks",
    icon: "barracks",
    position: "right-[15%] top-[43%] h-[33%] w-[28%]",
    glow: "from-sky-200/24 via-cyan-300/10 to-transparent",
    short: "Garrison force",
    perk: "Makes assigned defenders matter more during wave defense.",
  },
};

export function buildingLabel(id: FrontlineFortressBuildingId, t: TranslateFn) {
  return t(`fortressScreen.buildings.${id}.label`);
}

export function buildingShort(id: FrontlineFortressBuildingId, t: TranslateFn) {
  return t(`fortressScreen.buildings.${id}.short`);
}

export function buildingPerk(id: FrontlineFortressBuildingId, t: TranslateFn) {
  return t(`fortressScreen.buildings.${id}.perk`);
}

export function formatRaidCountdown(nextAttackAt: string | null, now: number, t: TranslateFn) {
  if (!nextAttackAt) return t("fortressScreen.raid.pending");
  const delta = Math.max(0, Date.parse(nextAttackAt) - now);
  if (!Number.isFinite(delta) || delta <= 0) return t("fortressScreen.raid.ready");
  const totalSeconds = Math.floor(delta / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

export function integrityMeta(integrity: number, t: TranslateFn) {
  if (integrity >= 70) {
    return {
      label: t("fortressScreen.integrityStates.stable"),
      bar: "bg-[linear-gradient(90deg,#5fd092,#f5d498)]",
    };
  }
  if (integrity >= 40) {
    return {
      label: t("fortressScreen.integrityStates.strained"),
      bar: "bg-[linear-gradient(90deg,#f0b25f,#ffe2a4)]",
    };
  }
  return {
    label: t("fortressScreen.integrityStates.risk"),
    bar: "bg-[linear-gradient(90deg,#d95764,#ffab8a)]",
  };
}

export function outcomeMeta(outcome: FrontlineFortressOutcome, t: TranslateFn) {
  if (outcome === "full_repel") {
    return {
      label: t("fortressScreen.outcomes.full_repel.label"),
      headline: t("fortressScreen.outcomes.full_repel.headline"),
      badgeTone: "emerald" as const,
      iconTone: "emerald" as const,
      panel: "border-emerald-200/18 bg-[linear-gradient(180deg,rgba(49,129,91,0.22),rgba(8,17,13,0.86))]",
    };
  }
  if (outcome === "partial_hold") {
    return {
      label: t("fortressScreen.outcomes.partial_hold.label"),
      headline: t("fortressScreen.outcomes.partial_hold.headline"),
      badgeTone: "gold" as const,
      iconTone: "gold" as const,
      panel: "border-[#f5c451]/20 bg-[linear-gradient(180deg,rgba(245,196,81,0.16),rgba(22,15,9,0.88))]",
    };
  }
  return {
    label: t("fortressScreen.outcomes.breach.label"),
    headline: t("fortressScreen.outcomes.breach.headline"),
    badgeTone: "ember" as const,
    iconTone: "ember" as const,
    panel: "border-rose-200/18 bg-[linear-gradient(180deg,rgba(139,48,62,0.22),rgba(21,8,13,0.88))]",
  };
}

export function firstOpenSlot(garrison: [string | null, string | null, string | null]) {
  const open = garrison.findIndex((entry) => !entry);
  return open >= 0 ? open : 0;
}

export function buildFortressLoopSteps({
  raidReady,
  garrisonFilled,
  upgradeReady,
  nextAttackLabel,
}: {
  raidReady: boolean;
  garrisonFilled: number;
  upgradeReady: boolean;
  nextAttackLabel: string;
}): FortressLoopStep[] {
  const safeGarrisonFilled = Math.min(3, Math.max(0, garrisonFilled));
  return [
    {
      id: "garrison",
      icon: "garrison",
      labelKey: "fortressScreen.loop.garrison",
      value: `${safeGarrisonFilled}/3`,
      tone: safeGarrisonFilled >= 3 ? "ready" : "attention",
    },
    {
      id: "upgrade",
      icon: "keep",
      labelKey: "fortressScreen.loop.upgrade",
      valueKey: upgradeReady ? "fortressScreen.loop.upgradeReady" : "fortressScreen.loop.gatherResources",
      tone: upgradeReady ? "ready" : "waiting",
    },
    {
      id: "raid",
      icon: "raid",
      labelKey: "fortressScreen.loop.raid",
      value: nextAttackLabel,
      tone: raidReady ? "ready" : "waiting",
    },
  ];
}
