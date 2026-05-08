import type { FrontlineLane, FrontlineSide } from "@/lib/types";
import { FRONTLINE_CARD_BY_ID, FRONTLINE_LANES, FRONTLINE_SUPPORT_BY_ID } from "./data";
import type {
  FrontlineBattleState,
  FrontlineCardDef,
  FrontlineCardProfileMap,
  FrontlineDeckState,
} from "./types";
import {
  getHeroInLane,
  getSupportInLane,
  otherSide,
  ownDeck,
} from "./frontlineBattleAccessors";

export function getFrontlineCard(cardId: string, cardProfiles?: FrontlineCardProfileMap) {
  const card = cardProfiles?.[cardId] ?? FRONTLINE_CARD_BY_ID[cardId];
  if (!card) throw new Error(`Unknown frontline card ${cardId}`);
  return card as FrontlineCardDef;
}

export function getStateCard(state: FrontlineBattleState, side: FrontlineSide, cardId: string) {
  return getFrontlineCard(cardId, side === "ally" ? state.allyCardProfiles : undefined);
}

export function getStateSupport(state: FrontlineBattleState, side: FrontlineSide, supportId: string) {
  return side === "ally" ? state.allySupportProfiles?.[supportId] ?? FRONTLINE_SUPPORT_BY_ID[supportId] : FRONTLINE_SUPPORT_BY_ID[supportId];
}

export function effectiveCardCost(state: FrontlineBattleState, side: FrontlineSide, baseCost: number) {
  if (side === "ally" && state.playerCardCostMod > 0) return baseCost + state.playerCardCostMod;
  return baseCost;
}

export function getEffectiveCardCost(state: FrontlineBattleState, side: FrontlineSide, cardId: string) {
  return effectiveCardCost(state, side, getStateCard(state, side, cardId).cost);
}

export function validCardTargets(state: FrontlineBattleState, side: FrontlineSide, cardId: string): FrontlineLane[] {
  const card = getStateCard(state, side, cardId);
  if (ownDeck(state, side).command < effectiveCardCost(state, side, card.cost)) return [];
  if (!ownDeck(state, side).hand.includes(card.id)) return [];
  if (card.target === "none") return [];
  if (card.target === "ally_front") {
    return FRONTLINE_LANES.filter((lane) => {
      if (card.kind === "summon") return !getSupportInLane(state, side, lane);
      return Boolean(getHeroInLane(state, side, lane));
    });
  }
  if (card.target === "enemy_front") {
    return FRONTLINE_LANES.filter((lane) =>
      card.effect.type === "execute_front"
        ? true
        : Boolean(getHeroInLane(state, otherSide(side), lane) || getSupportInLane(state, otherSide(side), lane)),
    );
  }
  return [...FRONTLINE_LANES];
}

export function playableCards(state: FrontlineBattleState, side: FrontlineSide) {
  return ownDeck(state, side).hand
    .map((cardId) => getStateCard(state, side, cardId))
    .filter((card) => effectiveCardCost(state, side, card.cost) <= ownDeck(state, side).command);
}

export function consumeHandCard(deck: FrontlineDeckState, card: FrontlineCardDef) {
  const cardId = card.id;
  const handIndex = deck.hand.indexOf(cardId);
  if (handIndex === -1) return deck;

  const nextUseCounts = { ...deck.cardUseCounts, [cardId]: (deck.cardUseCounts[cardId] ?? 0) + 1 };
  const reachedLimit = card.usesPerBattle != null && nextUseCounts[cardId] >= card.usesPerBattle;

  const newHand = [...deck.hand];
  newHand.splice(handIndex, 1);

  if (reachedLimit) {
    // Card hits its battle-wide limit. Remove every remaining copy from
    // hand + deck + discard and add the id to exhaustedCardIds so reshuffles
    // can never pull it again.
    return {
      ...deck,
      hand: newHand.filter((id) => id !== cardId),
      deck: deck.deck.filter((id) => id !== cardId),
      discard: deck.discard.filter((id) => id !== cardId),
      exhaustedCardIds: deck.exhaustedCardIds.includes(cardId)
        ? deck.exhaustedCardIds
        : [...deck.exhaustedCardIds, cardId],
      cardUseCounts: nextUseCounts,
    };
  }

  return {
    ...deck,
    hand: newHand,
    discard: [...deck.discard, cardId],
    cardUseCounts: nextUseCounts,
  };
}
