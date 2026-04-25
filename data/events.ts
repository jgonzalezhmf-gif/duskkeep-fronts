import type { EventDef } from "@/lib/types";

// Two always-on rotating events for alpha. Dates are symbolic.
export const EVENTS: EventDef[] = [
  {
    id: "gold_rush",
    name: "Gold Rush",
    description: "Defeat the bandit lords for extra gold.",
    emoji: "💰",
    startsAt: "2026-01-01T00:00:00Z",
    endsAt: "2099-12-31T23:59:59Z",
    enemyTeam: [
      { heroId: "ren", level: 6, stars: 1 },
      { heroId: "kara", level: 6, stars: 1 },
      { heroId: "drak", level: 5, stars: 1 },
      { heroId: "tovi", level: 5, stars: 1 },
    ],
    rewards: { gold: 400, xp: 60, accountXp: 12 },
  },
  {
    id: "arcane_surge",
    name: "Arcane Surge",
    description: "Harvest arcane dust from rogue spellcasters.",
    emoji: "✨",
    startsAt: "2026-01-01T00:00:00Z",
    endsAt: "2099-12-31T23:59:59Z",
    enemyTeam: [
      { heroId: "lyria", level: 7, stars: 2 },
      { heroId: "morr", level: 6, stars: 1 },
      { heroId: "tovi", level: 6, stars: 1 },
      { heroId: "mira", level: 6, stars: 1 },
    ],
    rewards: { gold: 150, dust: 120, xp: 60, accountXp: 12 },
  },
];

export const EVENTS_BY_ID = Object.fromEntries(EVENTS.map((e) => [e.id, e]));
