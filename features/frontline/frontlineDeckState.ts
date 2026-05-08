import { createRng } from "@/lib/rng";
import { FRONTLINE_CARD_BY_ID } from "./data";
import type { FrontlineDeckState } from "./types";

const HAND_MAX = 5;
const OPENING_HAND = 3;

export function drawInto(deckState: FrontlineDeckState, amount: number, seed: number) {
  const exhaustedSet = new Set(deckState.exhaustedCardIds);
  const next = {
    ...deckState,
    deck: deckState.deck.filter((id) => !exhaustedSet.has(id)),
    hand: [...deckState.hand],
    discard: deckState.discard.filter((id) => !exhaustedSet.has(id)),
    exhaustedCardIds: [...deckState.exhaustedCardIds],
    cardUseCounts: { ...deckState.cardUseCounts },
  };
  const rng = createRng(seed);
  for (let draw = 0; draw < amount && next.hand.length < HAND_MAX; draw += 1) {
    if (next.deck.length === 0 && next.discard.length > 0) {
      const pool = [...next.discard];
      const reshuffled: string[] = [];
      while (pool.length) {
        const pickIndex = rng.int(pool.length);
        reshuffled.push(pool.splice(pickIndex, 1)[0]);
      }
      next.deck = reshuffled;
      next.discard = [];
    }
    const cardId = next.deck.shift();
    if (!cardId) break;
    next.hand.push(cardId);
  }
  return next;
}

export function seededDeckState(deckIds: string[], leaderId: string, seed: number): FrontlineDeckState {
  const pool = deckIds.filter((id): id is string => Boolean(FRONTLINE_CARD_BY_ID[id]));
  const rng = createRng(seed);
  const shuffled = [...pool];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = rng.int(index + 1);
    const temp = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = temp;
  }
  return drawInto(
    {
      leaderId,
      deck: shuffled,
      hand: [],
      discard: [],
      command: 0,
      powerCooldown: 0,
      usedLeaderPower: false,
      exhaustedCardIds: [],
      cardUseCounts: {},
    },
    OPENING_HAND,
    seed + 17,
  );
}
