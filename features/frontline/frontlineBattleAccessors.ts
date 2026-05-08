import type { FrontlineLane, FrontlineSide } from "@/lib/types";
import type {
  FrontlineBattleState,
  FrontlineDeckState,
  FrontlineHeroState,
  FrontlineSupportState,
} from "./types";

export function otherSide(side: FrontlineSide): FrontlineSide {
  return side === "ally" ? "enemy" : "ally";
}

export function ownDeck(state: FrontlineBattleState, side: FrontlineSide) {
  return side === "ally" ? state.allyDeck : state.enemyDeck;
}

export function setOwnDeck(state: FrontlineBattleState, side: FrontlineSide, deckState: FrontlineDeckState) {
  if (side === "ally") state.allyDeck = deckState;
  else state.enemyDeck = deckState;
}

export function sideCoreKey(side: FrontlineSide) {
  return side === "ally" ? "allyCoreHp" : "enemyCoreHp";
}

export function getHeroInLane(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const laneState = state.lanes[lane];
  return side === "ally" ? laneState.allyHero : laneState.enemyHero;
}

export function getSupportInLane(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const laneState = state.lanes[lane];
  return side === "ally" ? laneState.allySupport : laneState.enemySupport;
}

export function setHeroInLane(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane, hero: FrontlineHeroState | null) {
  if (side === "ally") state.lanes[lane].allyHero = hero;
  else state.lanes[lane].enemyHero = hero;
}

export function setSupportInLane(
  state: FrontlineBattleState,
  side: FrontlineSide,
  lane: FrontlineLane,
  support: FrontlineSupportState | null,
) {
  if (side === "ally") state.lanes[lane].allySupport = support;
  else state.lanes[lane].enemySupport = support;
}
