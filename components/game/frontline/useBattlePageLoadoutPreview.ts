"use client";

import { useMemo } from "react";
import { FRONTLINE_CARD_BY_ID, FRONTLINE_UNIT_BY_ID } from "@/features/frontline/data";
import { getFrontlineBoss } from "@/features/frontline/bosses";
import {
  createFrontlineCardProfileMap,
  createFrontlineSupportProfileMap,
  type FrontlineCardLevels,
} from "@/features/frontline/cardProgression";
import {
  createFrontlineHeroProfileMap,
  getFrontlineHeroProfileById,
} from "@/features/frontline/heroProfile";
import type { FrontlinePreset } from "@/features/frontline/types";
import type { FrontlineLoadout, PlayerHero } from "@/lib/types";
import { heroPreviewPower } from "./frontlineBattlePageLogic";

export function useBattlePageLoadoutPreview({
  frontlineLoadout,
  playerHeroes,
  frontlineCardLevels,
  selectedPreset,
}: {
  frontlineLoadout: FrontlineLoadout;
  playerHeroes: PlayerHero[];
  frontlineCardLevels: FrontlineCardLevels;
  selectedPreset: FrontlinePreset;
}) {
  const playerHeroById = useMemo(() => new Map(playerHeroes.map((hero) => [hero.heroId, hero] as const)), [playerHeroes]);
  const allyHeroProfiles = useMemo(() => createFrontlineHeroProfileMap(playerHeroes), [playerHeroes]);
  const allyCardProfiles = useMemo(() => createFrontlineCardProfileMap(frontlineCardLevels), [frontlineCardLevels]);
  const allySupportProfiles = useMemo(() => createFrontlineSupportProfileMap(frontlineCardLevels), [frontlineCardLevels]);
  const allyHeroes = useMemo(
    () => frontlineLoadout.squad.map((heroId) => (heroId ? getFrontlineHeroProfileById(heroId, playerHeroById.get(heroId)) : null)),
    [frontlineLoadout.squad, playerHeroById],
  );
  const allyCards = useMemo(
    () => frontlineLoadout.deck.map((cardId) => (cardId ? allyCardProfiles[cardId] ?? FRONTLINE_CARD_BY_ID[cardId] ?? null : null)),
    [allyCardProfiles, frontlineLoadout.deck],
  );
  const enemyHeroes = useMemo(
    () => selectedPreset.squad.map((heroId) => FRONTLINE_UNIT_BY_ID[heroId] ?? null),
    [selectedPreset.squad],
  );
  const enemyCards = useMemo(
    () => selectedPreset.deck.map((cardId) => FRONTLINE_CARD_BY_ID[cardId]).filter(Boolean),
    [selectedPreset.deck],
  );
  const bossConfig = useMemo(() => getFrontlineBoss(selectedPreset.bossId), [selectedPreset.bossId]);
  const allyPower = allyHeroes.reduce((sum, hero) => sum + heroPreviewPower(hero), 0);
  const enemyPower = enemyHeroes.reduce((sum, hero) => sum + heroPreviewPower(hero), 0);

  return {
    allyHeroProfiles,
    allyCardProfiles,
    allySupportProfiles,
    allyHeroes,
    allyCards,
    enemyHeroes,
    enemyCards,
    bossConfig,
    allyPower,
    enemyPower,
  };
}
