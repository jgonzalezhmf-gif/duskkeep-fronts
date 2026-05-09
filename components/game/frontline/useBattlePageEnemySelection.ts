"use client";

import { useMemo, useState } from "react";
import { FRONTLINE_PRESETS } from "@/features/frontline/data";
import { getAdventureLevelForFrontline } from "@/features/frontline/adventure";
import {
  resolveForcedEnemyPresetId,
  resolveSelectedEnemyPreset,
} from "./frontlineBattlePageLogic";

export function useBattlePageEnemySelection({
  adventureLevelId,
  enemyPresetId,
}: {
  adventureLevelId?: string | null;
  enemyPresetId?: string | null;
}) {
  const adventureLevel = useMemo(() => getAdventureLevelForFrontline(adventureLevelId), [adventureLevelId]);
  const forcedPresetId = resolveForcedEnemyPresetId({
    adventureLevel,
    enemyPresetId,
    presets: FRONTLINE_PRESETS,
  });
  const [selectedEnemyPresetId, setSelectedEnemyPresetId] = useState(forcedPresetId ?? FRONTLINE_PRESETS[0].id);
  const selectedPreset = useMemo(
    () => resolveSelectedEnemyPreset({ forcedPresetId, selectedEnemyPresetId, presets: FRONTLINE_PRESETS }),
    [forcedPresetId, selectedEnemyPresetId],
  );

  return {
    adventureLevel,
    selectedEnemyPresetId,
    setSelectedEnemyPresetId,
    selectedPreset,
  };
}
