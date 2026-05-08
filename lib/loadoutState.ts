import type { FrontlineLoadout } from "@/lib/types";

function setUniqueSlot<T>(items: T[], slotIdx: number, value: T | null) {
  const next = items.slice();
  if (value) {
    for (let i = 0; i < next.length; i += 1) {
      if (i !== slotIdx && next[i] === value) next[i] = null as T;
    }
  }
  next[slotIdx] = value as T;
  return next;
}

export function setTeamSlotState(team: Array<string | null>, slotIdx: number, heroId: string | null) {
  return setUniqueSlot(team, slotIdx, heroId);
}

export function setDeckSlotState(activeDeck: Array<string | null>, slotIdx: number, cardId: string | null) {
  return setUniqueSlot(activeDeck, slotIdx, cardId);
}

export function setFrontlineLeaderState(loadout: FrontlineLoadout, leaderId: string): FrontlineLoadout {
  return {
    ...loadout,
    leaderId,
  };
}

export function setFrontlineSquadSlotState(
  loadout: FrontlineLoadout,
  slotIdx: number,
  heroId: string | null,
): FrontlineLoadout {
  return {
    ...loadout,
    squad: setUniqueSlot([...loadout.squad], slotIdx, heroId) as FrontlineLoadout["squad"],
  };
}

export function toggleFrontlineDeckCardState(
  loadout: FrontlineLoadout,
  cardId: string,
  deckSize: number,
): FrontlineLoadout {
  const current = loadout.deck.filter(Boolean) as string[];
  const hasCard = current.includes(cardId);
  let nextDeck = current;
  if (hasCard) {
    nextDeck = current.filter((entry) => entry !== cardId);
  } else if (current.length < deckSize) {
    nextDeck = [...current, cardId];
  } else {
    nextDeck = [...current.slice(0, deckSize - 1), cardId];
  }
  return {
    ...loadout,
    deck: nextDeck,
  };
}
