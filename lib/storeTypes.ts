import type { AdventureMapInteractionClaim, AdventureMapInteractionOpenResult } from "@/features/adventure/mapInteractions";
import type { AdventureProgressEntry } from "@/features/adventure/nodeResolution";
import type { FrontlineCardLevels, FrontlineCardUnlocks } from "@/features/frontline/cardProgression";
import type { TacticalState } from "@/features/tactical/types";
import type { LocaleCode } from "@/lib/i18n/locales";
import type {
  AccountState,
  FortressState,
  FrontlineFortressBuildingId,
  FrontlineFortressReport,
  FrontlineFortressState,
  FrontlineLoadout,
  Mission,
  MissionProgress,
  PlayerHero,
  Resources,
  Rewards,
} from "@/lib/types";

export type NotificationKind = "success" | "error" | "info";
export type Notification = { id: string; kind: NotificationKind; message: string };
export type TextScale = "normal" | "large";
export type AdventureBattleWinner = "ally" | "enemy" | "draw";
export type AdventureBattleResultClaim = {
  rewards: Rewards;
  firstClear: boolean;
  authoritative?: boolean;
  resources?: Resources;
};

export type GameState = {
  hydrated: boolean;
  account: AccountState;
  resources: Resources;
  heroes: PlayerHero[];
  team: (string | null)[];
  activeDeck: (string | null)[];
  activeLeaderId: string;
  knownSpellIds: string[];
  fortress: FortressState;
  frontlineLoadout: FrontlineLoadout;
  frontlineCardUnlocks: FrontlineCardUnlocks;
  frontlineCardLevels: FrontlineCardLevels;
  frontlineFortress: FrontlineFortressState;
  adventureProgress: Record<string, AdventureProgressEntry>;
  adventureMapClaims: Record<string, AdventureMapInteractionClaim>;
  missionsProgress: Record<string, MissionProgress>;
  arenaWins: number;
  arenaLosses: number;
  shopPurchases: Record<string, number>;
  eventsPlayed: Record<string, number>;
  battlesWon: number;
  heroesUpgraded: number;
  lastSeed: number;
  notifications: Notification[];
  savedBattle: { levelId: string; state: TacticalState } | null;
  dailyLogin: { streak: number; lastClaim: string | null };
  roadmapClaimed: Record<string, boolean>;
  milestonesClaimed: Record<number, boolean>;
  eventCompletions: Record<string, string>;
  dailyShopPurchases: Record<string, number>;
  shopRefreshedAt: string | null;
  audioMuted: boolean;
  musicVolume: number;
  sfxVolume: number;
  language: LocaleCode;
  reducedMotion: boolean;
  visualEffects: boolean;
  textScale: TextScale;
  onboarding: { step: number; completed: boolean };
  hasSeenIntro: boolean;
  pendingUnlockLevel: number | null;
  arenaTicketsRefreshedAt: string | null;
};

export type GameActions = {
  resetAll: () => void;
  hydrate: () => void;
  setName: (name: string) => void;
  setTeamSlot: (slotIdx: number, heroId: string | null) => void;
  setDeckSlot: (slotIdx: number, cardId: string | null) => void;
  setActiveLeader: (leaderId: string) => void;
  setFrontlineLeader: (leaderId: string) => void;
  setFrontlineSquadSlot: (slotIdx: number, heroId: string | null) => void;
  toggleFrontlineDeckCard: (cardId: string) => void;
  syncFrontlineLoadoutOnlineFirst: () => Promise<{ ok: boolean; reason?: string; authoritative?: boolean }>;
  unlockFrontlineCard: (cardId: string) => boolean;
  upgradeFrontlineCard: (cardId: string) => boolean;
  addHero: (heroId: string) => void;
  collectFortressIncome: () => Rewards | null;
  upgradeFortressBuilding: (buildingId: string) => boolean;
  upgradeFrontlineFortress: (buildingId: FrontlineFortressBuildingId) => boolean;
  setFrontlineGarrisonSlot: (slotIdx: number, heroId: string | null) => void;
  resolveFrontlineFortressRaid: () => FrontlineFortressReport | null;
  awardRewards: (r: Rewards, source?: string) => void;
  spend: (cost: { gold?: number; gems?: number; dust?: number; adventureKeys?: number }) => boolean;
  levelUpHero: (heroId: string) => boolean;
  starUpHero: (heroId: string) => boolean;
  skillUpHero: (heroId: string) => boolean;
  recordBattleResult: (
    won: boolean,
    source: "adventure" | "arena" | "vsai" | "event",
    meta?: Record<string, unknown>,
  ) => void;
  markAdventureCleared: (levelId: string) => { firstClear: boolean };
  claimAdventureBattleResultOnlineFirst: (input: {
    levelId: string;
    battleSeed: number;
    winner: AdventureBattleWinner;
    turns: number;
    battleSummary: unknown;
  }) => Promise<AdventureBattleResultClaim | null>;
  claimAdventureNode: (levelId: string) => Rewards | null;
  claimAdventureNodeOnlineFirst: (levelId: string) => Promise<Rewards | null>;
  claimAdventureMapInteraction: (interactionId: string) => AdventureMapInteractionOpenResult | null;
  claimAdventureMapInteractionOnlineFirst: (interactionId: string) => Promise<AdventureMapInteractionOpenResult | null>;
  claimMission: (missionId: string) => Rewards | null;
  claimMissionOnlineFirst: (missionId: string) => Promise<Rewards | null>;
  purchaseOffer: (offerId: string) => { ok: boolean; reason?: string };
  purchaseOfferOnlineFirst: (offerId: string) => Promise<{ ok: boolean; reason?: string; authoritative?: boolean }>;
  pushNotification: (kind: NotificationKind, message: string) => void;
  dismissNotification: (id: string) => void;
  nextSeed: () => number;
  ensureMissionsInitialized: () => void;
  updateMissionProgress: (metric: Mission["metric"], delta: number) => void;
  saveBattle: (levelId: string, state: TacticalState) => void;
  clearSavedBattle: () => void;
  claimDailyLogin: () => Rewards | null;
  claimDailyLoginOnlineFirst: () => Promise<Rewards | null>;
  claimRoadmapStep: (id: string) => Rewards | null;
  claimMilestone: (level: number) => Rewards | null;
  markEventCompleted: (eventId: string) => void;
  refreshShopIfNeeded: () => void;
  offerRemaining: (offerId: string) => number | null;
  setAudioMuted: (m: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setLanguage: (language: LocaleCode) => void;
  setReducedMotion: (enabled: boolean) => void;
  setVisualEffects: (enabled: boolean) => void;
  setTextScale: (scale: TextScale) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  markIntroSeen: () => void;
  resetIntro: () => void;
  ackPendingUnlock: () => void;
  refreshArenaTicketsIfNeeded: () => void;
};
