import { STARTER_DECK } from "@/data/cards";
import { FORTRESS_BUILDINGS } from "@/data/fortress";
import { STARTER_LEADER_ID } from "@/data/leaders";
import { createDefaultFrontlineCardUnlocks } from "@/features/frontline/cardProgression";
import { createDefaultFrontlineLoadout } from "@/features/frontline/engine";
import { createDefaultFrontlineFortress } from "@/features/frontline/fortress";
import { createDefaultLadderState } from "@/features/ladder/data";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { localDayKey } from "@/lib/rewardVisibility";
import { DECK_SIZE, TEAM_SIZE } from "./constants";
import type { FortressState, PlayerHero } from "./types";

export const todayISO = () => new Date().toISOString();
export const todayYMD = () => localDayKey();

const freshStarterTeam = () => ["bran", "kara", "vex", "mira"];
const frontlineStarterHeroes = ["bran", "kara", "vex", "mira", "drak", "tovi"];

export const freshStarterDeck = () => {
  const deck = [...STARTER_DECK];
  while (deck.length < DECK_SIZE) deck.push(null as unknown as string);
  return deck.slice(0, DECK_SIZE).map((id) => id ?? null);
};

export function defaultFortress(): FortressState {
  return {
    level: 1,
    style: "dawnkeep",
    buildings: Object.fromEntries(FORTRESS_BUILDINGS.map((building) => [building.id, 1])),
    lastCollectedAt: null,
  };
}

export function defaultInitial() {
  const starter = freshStarterTeam();
  const heroes: PlayerHero[] = frontlineStarterHeroes.map((id) => ({
    heroId: id, level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1,
  }));
  const team: (string | null)[] = [...starter];
  while (team.length < TEAM_SIZE) team.push(null);
  return {
    account: { name: "Commander", level: 1, xp: 0, createdAt: todayISO() },
    resources: { gold: 500, dust: 50, gems: 50, arenaTickets: 5, adventureKeys: 0 },
    heroes,
    team,
    activeDeck: freshStarterDeck(),
    activeLeaderId: STARTER_LEADER_ID,
    knownSpellIds: ["spell_battle_hymn", "spell_sanctuary", "spell_guardian_aegis", "spell_meteor"],
    fortress: defaultFortress(),
    frontlineLoadout: createDefaultFrontlineLoadout(),
    frontlineCardUnlocks: createDefaultFrontlineCardUnlocks(),
    frontlineCardLevels: {},
    frontlineFortress: createDefaultFrontlineFortress(),
    adventureProgress: {},
    adventureMapClaims: {},
    missionsProgress: {},
    arenaWins: 0,
    arenaLosses: 0,
    ladder: createDefaultLadderState(),
    shopPurchases: {},
    eventsPlayed: {},
    battlesWon: 0,
    heroesUpgraded: 0,
    lastSeed: 1,
    savedBattle: null,
    dailyLogin: { streak: 0, lastClaim: null },
    roadmapClaimed: {},
    milestonesClaimed: {},
    eventCompletions: {},
    dailyShopPurchases: {},
    shopRefreshedAt: null,
    audioMuted: false,
    musicVolume: 0.78,
    sfxVolume: 0.92,
    language: DEFAULT_LOCALE,
    reducedMotion: false,
    visualEffects: true,
    textScale: "normal" as const,
    onboarding: { step: 0, completed: false },
    hasSeenIntro: false,
    accountLinkMode: "undecided" as const,
    pendingUnlockLevel: null,
    arenaTicketsRefreshedAt: null,
  };
}
