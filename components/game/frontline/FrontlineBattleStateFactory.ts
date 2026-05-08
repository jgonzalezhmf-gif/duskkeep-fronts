import { createFrontlineBattleState, getEnemyPreset } from "@/features/frontline/engine";
import type {
  FrontlineBattleModifiers,
  FrontlineCardProfileMap,
  FrontlineSupportProfileMap,
} from "@/features/frontline/types";
import type { FrontlineHeroProfileMap } from "@/features/frontline/heroProfile";
import type { FrontlineLoadout } from "@/lib/types";

type CreateBattleStateInput = {
  seed: number;
  loadout: FrontlineLoadout;
  enemyPresetId: string;
  allyHeroProfiles?: FrontlineHeroProfileMap;
  allyCardProfiles?: FrontlineCardProfileMap;
  allySupportProfiles?: FrontlineSupportProfileMap;
  modifiers?: FrontlineBattleModifiers;
};

export function createBattleStateFromProps({
  seed,
  loadout,
  enemyPresetId,
  allyHeroProfiles,
  allyCardProfiles,
  allySupportProfiles,
  modifiers,
}: CreateBattleStateInput) {
  return createFrontlineBattleState({
    seed,
    allyLoadout: loadout,
    enemyPreset: getEnemyPreset(enemyPresetId),
    allyHeroProfiles,
    allyCardProfiles,
    allySupportProfiles,
    modifiers,
  });
}
