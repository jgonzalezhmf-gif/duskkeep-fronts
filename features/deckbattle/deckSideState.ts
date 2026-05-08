import { getCard } from "@/data/cards";
import { fortressBattleBonuses } from "@/lib/store";
import type { FortressState } from "@/lib/types";

export type DeckSideState = {
  deck: string[];
  hand: string[];
  discard: string[];
  mana: number;
  maxMana: number;
  powerCooldown: number;
  processedTurnStamp: string;
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleIds(ids: string[], seed: number) {
  const rng = mulberry32(seed);
  const out = ids.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function drawCards(state: DeckSideState, amount: number): DeckSideState {
  let next = { ...state, deck: state.deck.slice(), hand: state.hand.slice(), discard: state.discard.slice() };
  for (let i = 0; i < amount; i++) {
    if (next.deck.length === 0 && next.discard.length > 0) {
      next.deck = next.discard.slice();
      next.discard = [];
    }
    if (next.deck.length === 0) break;
    const top = next.deck.shift()!;
    next.hand.push(top);
  }
  return next;
}

export function createDeckSide(
  deck: (string | null)[],
  seed: number,
  openingHand: number,
  processedTurnStamp: string,
): DeckSideState {
  const shuffled = shuffleIds(deck.filter((id): id is string => Boolean(id)), seed);
  return drawCards(
    {
      deck: shuffled,
      hand: [],
      discard: [],
      mana: 2,
      maxMana: 2,
      powerCooldown: 0,
      processedTurnStamp,
    },
    openingHand,
  );
}

export function removeCardFromHand(side: DeckSideState, cardId: string) {
  const idx = side.hand.indexOf(cardId);
  if (idx === -1) return side;
  const hand = side.hand.slice();
  hand.splice(idx, 1);
  return { ...side, hand, discard: [...side.discard, cardId] };
}

export function playableCards(side: DeckSideState) {
  return side.hand.map((id) => getCard(id)).filter((card) => card.cost <= side.mana);
}

export function starterOpeningHandSize(fortress: FortressState) {
  return 3 + fortressBattleBonuses(fortress).startingHandBonus;
}
