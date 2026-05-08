import type { FrontlineBossConfig, FrontlineBossSegmentConfig, FrontlineCardDef, FrontlineEvent } from "@/features/frontline/types";
import type { TranslateFn } from "@/lib/i18n/frontlineText";
import { frontlineCardName } from "@/lib/i18n/frontlineText";
import type { FrontlineLane } from "@/lib/types";
import { cardEffectSummary, cardTargetLabel, laneLabel } from "./FrontlineBattleUiState";
import { laneStatusSubtitle, type LaneInsight } from "./FrontlineLaneInsights";

export function buildBossSegmentByLane(boss: FrontlineBossConfig | null): Partial<Record<FrontlineLane, FrontlineBossSegmentConfig>> {
  const map: Partial<Record<FrontlineLane, FrontlineBossSegmentConfig>> = {};
  if (boss) for (const segment of boss.segments) map[segment.lane] = segment;
  return map;
}

export function getSelectedBattleContext({
  t,
  selectedLeaderPower,
  allyLeaderPowerName,
  allyLeaderPowerDescription,
  selectedCard,
  displayLane,
  displayInsight,
}: {
  t: TranslateFn;
  selectedLeaderPower: boolean;
  allyLeaderPowerName: string;
  allyLeaderPowerDescription: string;
  selectedCard: FrontlineCardDef | null;
  displayLane: FrontlineLane;
  displayInsight: LaneInsight;
}) {
  if (selectedLeaderPower) {
    return {
      title: allyLeaderPowerName,
      body: allyLeaderPowerDescription,
    };
  }

  if (selectedCard) {
    return {
      title: frontlineCardName(t, selectedCard),
      body: `${cardEffectSummary(t, selectedCard)} - ${cardTargetLabel(t, selectedCard)}`,
    };
  }

  return {
    title: `${laneLabel(t, displayLane)} ${t("frontline.front")}`,
    body: laneStatusSubtitle(t, displayInsight.lane, displayInsight.status),
  };
}

export function isInfernoCastingEvent(event: FrontlineEvent | null) {
  return event?.kind === "boss_signature" && event.signature === "cast";
}
