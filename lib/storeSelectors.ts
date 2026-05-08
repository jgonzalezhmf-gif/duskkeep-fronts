import { ADVENTURE } from "@/data/adventure";
import { HEROES } from "@/data/heroes";
import { ROADMAP, type RoadmapStep } from "@/data/roadmap";
import { isAdventureLevelUnlocked } from "@/features/adventure/progression";
import { firstVisibleRoadmapStep, getDailyLoginClaimState, isDailyRotationRewardClaimedToday } from "@/lib/rewardVisibility";
import type { GameState } from "@/lib/storeTypes";
import type { AdventureLevel } from "@/lib/types";

export function selectAvailableHeroes(state: GameState) {
  return state.heroes.filter((hero) => hero.stars > 0);
}

export function findAdventureLevel(id: string): AdventureLevel | undefined {
  return ADVENTURE.find((level) => level.id === id);
}

export function nextUnlockedLevel(state: GameState): AdventureLevel | undefined {
  for (const level of ADVENTURE) {
    const progress = state.adventureProgress[level.id];
    if (progress?.cleared || progress?.claimed) continue;
    if (isAdventureLevelUnlocked(level, state.adventureProgress, state.account.level)) return level;
  }
  return undefined;
}

export function heroKnown(state: GameState, heroId: string): boolean {
  return state.heroes.some((hero) => hero.heroId === heroId);
}

export const heroDefsById = Object.fromEntries(HEROES.map((hero) => [hero.id, hero]));

export function ownedHeroCardIds(state: GameState) {
  return state.heroes.filter((hero) => hero.stars > 0).map((hero) => `card_${hero.heroId}`);
}

export function roadmapMetricValue(state: GameState, metric: RoadmapStep["metric"]): number {
  switch (metric) {
    case "adventure_clears":
      return Object.values(state.adventureProgress).filter((progress) => progress.cleared).length;
    case "heroes_upgraded":
      return state.heroesUpgraded;
    case "hero_stars":
      return state.heroes.reduce((maxStars, hero) => Math.max(maxStars, hero.stars), 0);
    case "collection_size":
      return state.heroes.filter((hero) => hero.stars > 0).length;
    case "battles_won":
      return state.battlesWon;
    case "arena_battles":
      return state.arenaWins + state.arenaLosses;
    case "events_played":
      return Object.values(state.eventsPlayed).reduce((total, count) => total + count, 0);
    case "shop_purchases":
      return Object.values(state.shopPurchases).reduce((total, count) => total + count, 0);
    case "account_level":
      return state.account.level;
  }
}

export function isRoadmapStepComplete(state: GameState, step: RoadmapStep): boolean {
  return roadmapMetricValue(state, step.metric) >= step.goal;
}

export function activeRoadmapStep(state: GameState): RoadmapStep | undefined {
  return firstVisibleRoadmapStep(ROADMAP, state.roadmapClaimed);
}

export function isEventCompletedToday(state: GameState, eventId: string): boolean {
  return isDailyRotationRewardClaimedToday(state.eventCompletions, eventId);
}

export function dailyLoginStatus(state: GameState) {
  const { claimed, streak, nextDay } = getDailyLoginClaimState(state.dailyLogin);
  return { claimed, streak, nextDay };
}
