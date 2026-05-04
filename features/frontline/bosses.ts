import type { FrontlineBossConfig } from "./types";

export const FRONTLINE_BOSSES: Record<string, FrontlineBossConfig> = {
  crown_of_ashes: {
    id: "crown_of_ashes",
    nameKey: "frontlineBosses.crown_of_ashes.name",
    assetKey: "crown_of_ashes",
    segments: [
      { lane: "left", segmentId: "head", titleKey: "frontlineBosses.crown_of_ashes.segments.head" },
      { lane: "center", segmentId: "core", titleKey: "frontlineBosses.crown_of_ashes.segments.core", weakpoint: true },
      { lane: "right", segmentId: "blade", titleKey: "frontlineBosses.crown_of_ashes.segments.blade" },
    ],
    signatures: [
      { type: "inferno_wave", cadenceRounds: 3, damagePerHero: 4 },
      { type: "ember_crown", minSegmentsAlive: 2, atkBonus: 1 },
      { type: "cinder_mark", damagePerStack: 1 },
    ],
  },
};

export function getFrontlineBoss(id: string | undefined | null): FrontlineBossConfig | null {
  if (!id) return null;
  return FRONTLINE_BOSSES[id] ?? null;
}
