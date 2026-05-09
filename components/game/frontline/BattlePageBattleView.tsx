"use client";

import FrontlineBattle, { type FrontlineEncounterBadgeKind } from "./FrontlineBattle";
import type {
  FrontlineBattleModifiers,
  FrontlineBattleState,
  FrontlineCardProfileMap,
  FrontlineSupportProfileMap,
} from "@/features/frontline/types";
import type { FrontlineHeroProfileMap } from "@/features/frontline/heroProfile";
import type { FrontlineLoadout } from "@/lib/types";

export function BattlePageBattleView({
  seed,
  loadout,
  enemyPresetId,
  allyHeroProfiles,
  allyCardProfiles,
  allySupportProfiles,
  modifiers,
  encounterKind,
  encounterTitle,
  battleBackgroundSrc,
  onFinished,
}: {
  seed: number;
  loadout: FrontlineLoadout;
  enemyPresetId: string;
  allyHeroProfiles: FrontlineHeroProfileMap;
  allyCardProfiles: FrontlineCardProfileMap;
  allySupportProfiles: FrontlineSupportProfileMap;
  modifiers?: FrontlineBattleModifiers;
  encounterKind: FrontlineEncounterBadgeKind | null;
  encounterTitle: string | null;
  battleBackgroundSrc: string | null;
  onFinished: (winner: "ally" | "enemy" | "draw", battleState: FrontlineBattleState) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1840px] flex-col gap-3 px-2 pb-3 pt-2 md:px-3 md:pb-4 md:pt-3 xl:px-4">
      <FrontlineBattle
        seed={seed}
        loadout={loadout}
        enemyPresetId={enemyPresetId}
        allyHeroProfiles={allyHeroProfiles}
        allyCardProfiles={allyCardProfiles}
        allySupportProfiles={allySupportProfiles}
        modifiers={modifiers}
        encounterKind={encounterKind}
        encounterTitle={encounterTitle}
        battleBackgroundSrc={battleBackgroundSrc}
        onFinished={onFinished}
      />
    </div>
  );
}
