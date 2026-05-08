import type {
  FrontlineBattleState,
  FrontlineHeroState,
  FrontlineLaneState,
  FrontlineSupportState,
} from "./types";

function cloneHero(hero: FrontlineHeroState | null) {
  return hero ? { ...hero } : null;
}

function cloneSupport(support: FrontlineSupportState | null) {
  return support ? { ...support } : null;
}

function cloneLane(lane: FrontlineLaneState): FrontlineLaneState {
  return {
    allyHero: cloneHero(lane.allyHero),
    enemyHero: cloneHero(lane.enemyHero),
    allySupport: cloneSupport(lane.allySupport),
    enemySupport: cloneSupport(lane.enemySupport),
  };
}

export function cloneState(state: FrontlineBattleState): FrontlineBattleState {
  return {
    ...state,
    lanes: {
      left: cloneLane(state.lanes.left),
      center: cloneLane(state.lanes.center),
      right: cloneLane(state.lanes.right),
    },
    allyDeck: {
      ...state.allyDeck,
      deck: [...state.allyDeck.deck],
      hand: [...state.allyDeck.hand],
      discard: [...state.allyDeck.discard],
      exhaustedCardIds: [...state.allyDeck.exhaustedCardIds],
      cardUseCounts: { ...state.allyDeck.cardUseCounts },
    },
    enemyDeck: {
      ...state.enemyDeck,
      deck: [...state.enemyDeck.deck],
      hand: [...state.enemyDeck.hand],
      discard: [...state.enemyDeck.discard],
      exhaustedCardIds: [...state.enemyDeck.exhaustedCardIds],
      cardUseCounts: { ...state.enemyDeck.cardUseCounts },
    },
    allyCardProfiles: state.allyCardProfiles,
    allySupportProfiles: state.allySupportProfiles,
    events: [...state.events],
    lastResolution: [...state.lastResolution],
    bossState: state.bossState ? { ...state.bossState, scorch: { ...state.bossState.scorch } } : null,
  };
}
