"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { HEROES } from "@/data/heroes";
import { ALL_MISSIONS } from "@/data/missions";
import { ADVENTURE } from "@/data/adventure";
import { SHOP_OFFERS, SHOP_OFFERS_BY_ID } from "@/data/shop";
import { DAILY_LOGIN } from "@/data/dailyLogin";
import { ROADMAP, type RoadmapStep } from "@/data/roadmap";
import { MILESTONES } from "@/data/milestones";
import { CARD_BY_ID } from "@/data/cards";
import { FORTRESS_BUILDING_BY_ID } from "@/data/fortress";
import type { LocaleCode } from "@/lib/i18n/locales";
import { defaultInitial, todayISO, todayYMD } from "@/lib/defaultGameState";
import { freshMissionProgress, missionNeedsReset } from "@/lib/missionProgress";
import { mergePersistedGameState } from "@/lib/persistedGameState";
import { applyRewardResources, canAfford, spendResources } from "@/lib/resourceMath";
import {
  firstVisibleRoadmapStep,
  getDailyLoginClaimState,
  isAdventureFirstClearRewardAvailable,
  isDailyRotationRewardClaimedToday,
  isMilestoneRewardClaimable,
  isRoadmapRewardClaimable,
  localDayKey,
} from "@/lib/rewardVisibility";
import {
  FRONTLINE_CARD_MAX_LEVEL,
  frontlineCardUpgradeCost,
  isFrontlineCardUnlocked,
  isFrontlineProgressionCard,
  normalizeFrontlineCardLevel,
  type FrontlineCardLevels,
  type FrontlineCardUnlocks,
} from "@/features/frontline/cardProgression";
import {
  FRONTLINE_FORTRESS_BUILDING_BY_ID,
  frontlineFortressRaidReady,
  frontlineFortressUpgradeCost,
  resolveFrontlineFortressRaid,
} from "@/features/frontline/fortress";
import { createFrontlineHeroProfileMap } from "@/features/frontline/heroProfile";
import {
  ADVENTURE_MAP_INTERACTIONS_BY_ID,
  getAdventureMapInteractionStatus,
  getAdventureMapInteractionResetAvailableAt,
  isAdventureKeySystemUnlocked,
  rollAdventureMapInteractionLoot,
  type AdventureMapInteractionClaim,
  type AdventureMapInteractionOpenResult,
} from "@/features/adventure/mapInteractions";
import {
  getAdventureChestClaimRewards,
  getAdventureNodeType,
  type AdventureProgressEntry,
} from "@/features/adventure/nodeResolution";
import { isAdventureLevelUnlocked } from "@/features/adventure/progression";
import {
  ACCOUNT_XP_PER_LEVEL,
  DAILY_ARENA_TICKETS,
  DECK_SIZE,
  LEVEL_UP_GOLD,
  MAX_SKILL_LEVEL,
  MAX_STARS,
  SHARDS_FOR_STAR,
  SKILL_COOLDOWN_REDUCTION_AT_MAX,
  SKILL_MULTIPLIER_BONUS,
  SKILL_UP_DUST,
} from "./constants";
import type {
  AccountState,
  AdventureLevel,
  FortressState,
  FrontlineFortressBuildingId,
  FrontlineFortressState,
  FrontlineLoadout,
  Mission,
  MissionProgress,
  PlayerHero,
  Resources,
  Rewards,
} from "./types";
import type { TacticalState } from "@/features/tactical/types";

export type NotificationKind = "success" | "error" | "info";
export type Notification = { id: string; kind: NotificationKind; message: string };
export type TextScale = "normal" | "large";

export type GameState = {
  hydrated: boolean;
  account: AccountState;
  resources: Resources;
  heroes: PlayerHero[];
  team: (string | null)[]; // length TEAM_SIZE
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
  /** Snapshot of a tactical battle in progress, so the player can resume. */
  savedBattle: { levelId: string; state: TacticalState } | null;
  /** Daily login state: streak + last claim date (YYYY-MM-DD). */
  dailyLogin: { streak: number; lastClaim: string | null };
  /** Roadmap step progress: once claimed, step is done forever. */
  roadmapClaimed: Record<string, boolean>;
  /** Milestone rewards claimed (keyed by account level). */
  milestonesClaimed: Record<number, boolean>;
  /** Last completion date (YYYY-MM-DD) for each event id — enables one-time-per-rotation gating. */
  eventCompletions: Record<string, string>;
  /** Purchases of each shop offer made on the current daily cycle. */
  dailyShopPurchases: Record<string, number>;
  /** YMD of the last shop daily refresh. */
  shopRefreshedAt: string | null;
  /** Global audio mute preference. */
  audioMuted: boolean;
  /** Music bus volume (0..1). */
  musicVolume: number;
  /** SFX bus volume (0..1). */
  sfxVolume: number;
  /** Current UI language. */
  language: LocaleCode;
  /** Reduce non-essential UI motion. */
  reducedMotion: boolean;
  /** Toggle decorative visual effects. */
  visualEffects: boolean;
  /** UI text scale preference. */
  textScale: TextScale;
  /** Lightweight onboarding progress. */
  onboarding: { step: number; completed: boolean };
  /** Queue of unlocks the player hasn't yet acknowledged (level reached but modal not shown). */
  pendingUnlockLevel: number | null;
  /** YMD of the last arena ticket daily refresh. */
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
  unlockFrontlineCard: (cardId: string) => boolean;
  upgradeFrontlineCard: (cardId: string) => boolean;
  addHero: (heroId: string) => void;
  collectFortressIncome: () => Rewards | null;
  upgradeFortressBuilding: (buildingId: string) => boolean;
  upgradeFrontlineFortress: (buildingId: FrontlineFortressBuildingId) => boolean;
  setFrontlineGarrisonSlot: (slotIdx: number, heroId: string | null) => void;
  resolveFrontlineFortressRaid: () => ReturnType<typeof resolveFrontlineFortressRaid>["report"] | null;
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
  claimAdventureNode: (levelId: string) => Rewards | null;
  claimAdventureMapInteraction: (interactionId: string) => AdventureMapInteractionOpenResult | null;
  claimMission: (missionId: string) => Rewards | null;
  purchaseOffer: (offerId: string) => { ok: boolean; reason?: string };
  pushNotification: (kind: NotificationKind, message: string) => void;
  dismissNotification: (id: string) => void;
  nextSeed: () => number;
  ensureMissionsInitialized: () => void;
  updateMissionProgress: (metric: Mission["metric"], delta: number) => void;
  saveBattle: (levelId: string, state: TacticalState) => void;
  clearSavedBattle: () => void;
  /** Claim today's daily login reward. Returns null if already claimed. */
  claimDailyLogin: () => Rewards | null;
  /** Claim a completed roadmap step. Returns null if not claimable. */
  claimRoadmapStep: (id: string) => Rewards | null;
  /** Claim a reached milestone reward. */
  claimMilestone: (level: number) => Rewards | null;
  /** Mark an event as completed for the current daily rotation. */
  markEventCompleted: (eventId: string) => void;
  /** Ensure today's shop rotation is current (resets daily counters). */
  refreshShopIfNeeded: () => void;
  /** Remaining purchases allowed for an offer today (null = unlimited / one-time uses oneTime gate). */
  offerRemaining: (offerId: string) => number | null;
  /** Toggle/set global mute. */
  setAudioMuted: (m: boolean) => void;
  /** Set music bus volume. */
  setMusicVolume: (volume: number) => void;
  /** Set SFX bus volume. */
  setSfxVolume: (volume: number) => void;
  /** Set UI language. */
  setLanguage: (language: LocaleCode) => void;
  /** Toggle reduced motion. */
  setReducedMotion: (enabled: boolean) => void;
  /** Toggle decorative visual effects. */
  setVisualEffects: (enabled: boolean) => void;
  /** Set UI text scale. */
  setTextScale: (scale: TextScale) => void;
  /** Advance onboarding. */
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  /** Clear the pending level-up acknowledgement (called after the LevelUpModal shows). */
  ackPendingUnlock: () => void;
  /** Reset arena tickets to daily allowance if a new day has begun. */
  refreshArenaTicketsIfNeeded: () => void;
};

function fortressLevel(state: FortressState, buildingId: string) {
  return state.buildings[buildingId] ?? 0;
}

export function fortressIncomePreview(state: FortressState, now: Date = new Date()) {
  const last = state.lastCollectedAt ? Date.parse(state.lastCollectedAt) : now.getTime();
  const elapsedHours = Math.max(0, Math.min(8, (now.getTime() - last) / 3_600_000));
  const treasury = fortressLevel(state, "treasury");
  const arcane = fortressLevel(state, "arcane_spire");
  const market = fortressLevel(state, "market_square");
  return {
    hours: elapsedHours,
    gold: Math.floor(elapsedHours * treasury * 40),
    dust: Math.floor(elapsedHours * arcane * 8),
    gems: Math.floor((elapsedHours / 3) * Math.max(0, Math.floor(market / 2))),
  };
}

export function fortressBattleBonuses(state: FortressState) {
  const walls = fortressLevel(state, "bastion_walls");
  const academy = fortressLevel(state, "war_academy");
  return {
    leaderHpBonus: walls * 10,
    startingHandBonus: Math.floor(academy / 3),
  };
}

function buildingUpgradeCost(state: FortressState, buildingId: string) {
  const def = FORTRESS_BUILDING_BY_ID[buildingId];
  const nextLevel = fortressLevel(state, buildingId) + 1;
  return {
    gold: def.baseCost.gold ? Math.round(def.baseCost.gold * Math.pow(def.scaling, nextLevel - 1)) : undefined,
    dust: def.baseCost.dust ? Math.round(def.baseCost.dust * Math.pow(def.scaling, nextLevel - 1)) : undefined,
    gems: def.baseCost.gems ? Math.round(def.baseCost.gems * Math.pow(def.scaling, nextLevel - 1)) : undefined,
  };
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
} as unknown as Storage;

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...defaultInitial(),
      hydrated: false,
      notifications: [],

      hydrate: () => set({ hydrated: true }),

      resetAll: () => {
        const base = defaultInitial();
        set({ ...base, notifications: [], hydrated: true });
      },

      setName: (name) => set((s) => ({ account: { ...s.account, name } })),

      setTeamSlot: (slotIdx, heroId) =>
        set((s) => {
          const team = s.team.slice();
          if (heroId) {
            for (let i = 0; i < team.length; i++) {
              if (i !== slotIdx && team[i] === heroId) team[i] = null;
            }
          }
          team[slotIdx] = heroId;
          return { team };
        }),

      setDeckSlot: (slotIdx, cardId) =>
        set((s) => {
          const activeDeck = s.activeDeck.slice();
          if (cardId) {
            for (let i = 0; i < activeDeck.length; i++) {
              if (i !== slotIdx && activeDeck[i] === cardId) activeDeck[i] = null;
            }
          }
          activeDeck[slotIdx] = cardId;
          return { activeDeck };
        }),

      setActiveLeader: (leaderId) => set({ activeLeaderId: leaderId }),

      setFrontlineLeader: (leaderId) =>
        set((s) => ({ frontlineLoadout: { ...s.frontlineLoadout, leaderId } })),

      setFrontlineSquadSlot: (slotIdx, heroId) =>
        set((s) => {
          const squad = [...s.frontlineLoadout.squad];
          if (heroId) {
            for (let i = 0; i < squad.length; i += 1) {
              if (i !== slotIdx && squad[i] === heroId) squad[i] = null;
            }
          }
          squad[slotIdx] = heroId;
          return { frontlineLoadout: { ...s.frontlineLoadout, squad: squad as FrontlineLoadout["squad"] } };
        }),

      toggleFrontlineDeckCard: (cardId) =>
        set((s) => {
          if (!isFrontlineCardUnlocked(s.frontlineCardUnlocks, cardId)) return {};
          const current = s.frontlineLoadout.deck.filter(Boolean) as string[];
          const hasCard = current.includes(cardId);
          let nextDeck = current;
          if (hasCard) {
            nextDeck = current.filter((entry) => entry !== cardId);
          } else if (current.length < DECK_SIZE) {
            nextDeck = [...current, cardId];
          } else {
            nextDeck = [...current.slice(0, DECK_SIZE - 1), cardId];
          }
          return {
            frontlineLoadout: {
              ...s.frontlineLoadout,
              deck: nextDeck,
            },
          };
        }),

      unlockFrontlineCard: (cardId) => {
        if (!isFrontlineProgressionCard(cardId)) return false;
        const s = get();
        if (isFrontlineCardUnlocked(s.frontlineCardUnlocks, cardId)) return false;
        set((st) => ({ frontlineCardUnlocks: { ...st.frontlineCardUnlocks, [cardId]: true } }));
        get().pushNotification("success", "New Frontline card unlocked");
        return true;
      },

      upgradeFrontlineCard: (cardId) => {
        if (!isFrontlineProgressionCard(cardId)) return false;
        const s = get();
        if (!isFrontlineCardUnlocked(s.frontlineCardUnlocks, cardId)) return false;
        const currentLevel = normalizeFrontlineCardLevel(s.frontlineCardLevels[cardId]);
        if (currentLevel >= FRONTLINE_CARD_MAX_LEVEL) {
          get().pushNotification("error", "Card already at max level");
          return false;
        }
        const cost = frontlineCardUpgradeCost(currentLevel);
        if (!get().spend(cost)) {
          get().pushNotification("error", "Not enough resources");
          return false;
        }
        set((st) => ({
          frontlineCardLevels: {
            ...st.frontlineCardLevels,
            [cardId]: currentLevel + 1,
          },
        }));
        get().pushNotification("success", "Frontline card upgraded");
        return true;
      },

      addHero: (heroId) =>
        set((s) => {
          if (s.heroes.some((h) => h.heroId === heroId)) return {};
          return { heroes: [...s.heroes, { heroId, level: 1, stars: 1, shards: 0, xp: 0, skillLevel: 1 }] };
        }),

      collectFortressIncome: () => {
        const s = get();
        const preview = fortressIncomePreview(s.fortress);
        if (preview.gold <= 0 && preview.dust <= 0 && preview.gems <= 0) return null;
        const rewards: Rewards = {};
        if (preview.gold > 0) rewards.gold = preview.gold;
        if (preview.dust > 0) rewards.dust = preview.dust;
        if (preview.gems > 0) rewards.gems = preview.gems;
        set((st) => ({
          fortress: { ...st.fortress, lastCollectedAt: new Date().toISOString() },
        }));
        get().awardRewards(rewards, "fortress income");
        return rewards;
      },

      upgradeFortressBuilding: (buildingId) => {
        const s = get();
        const def = FORTRESS_BUILDING_BY_ID[buildingId];
        if (!def) return false;
        const currentLevel = fortressLevel(s.fortress, buildingId);
        if (currentLevel >= def.maxLevel) {
          get().pushNotification("error", "Building already at max level");
          return false;
        }
        const cost = buildingUpgradeCost(s.fortress, buildingId);
        if (!get().spend(cost)) {
          get().pushNotification("error", "Not enough resources");
          return false;
        }
        set((st) => {
          const nextBuildings = {
            ...st.fortress.buildings,
            [buildingId]: (st.fortress.buildings[buildingId] ?? 0) + 1,
          };
          const totalLevels = Object.values(nextBuildings).reduce((sum, level) => sum + level, 0);
          return {
            fortress: {
              ...st.fortress,
              buildings: nextBuildings,
              level: Math.max(st.fortress.level, 1 + Math.floor(totalLevels / 5)),
            },
          };
        });
        get().pushNotification("success", `${def.name} upgraded`);
        return true;
      },

      upgradeFrontlineFortress: (buildingId) => {
        const s = get();
        const def = FRONTLINE_FORTRESS_BUILDING_BY_ID[buildingId];
        if (!def) return false;
        const cost = frontlineFortressUpgradeCost(s.frontlineFortress, buildingId);
        if (!get().spend(cost)) {
          get().pushNotification("error", "Not enough resources");
          return false;
        }
        set((st) => ({
          frontlineFortress: {
            ...st.frontlineFortress,
            buildings: {
              ...st.frontlineFortress.buildings,
              [buildingId]: st.frontlineFortress.buildings[buildingId] + 1,
            },
          },
        }));
        get().pushNotification("success", `${def.name} upgraded`);
        return true;
      },

      setFrontlineGarrisonSlot: (slotIdx, heroId) =>
        set((s) => {
          const garrison = [...s.frontlineFortress.garrison];
          if (heroId) {
            for (let i = 0; i < garrison.length; i += 1) {
              if (i !== slotIdx && garrison[i] === heroId) garrison[i] = null;
            }
          }
          garrison[slotIdx] = heroId;
          return {
            frontlineFortress: {
              ...s.frontlineFortress,
              garrison: garrison as FrontlineFortressState["garrison"],
            },
          };
        }),

      resolveFrontlineFortressRaid: () => {
        const s = get();
        if (!frontlineFortressRaidReady(s.frontlineFortress)) return null;
        const heroProfiles = createFrontlineHeroProfileMap(s.heroes);
        const { nextState, report } = resolveFrontlineFortressRaid(s.frontlineFortress, s.account.level, new Date(), heroProfiles);
        set({ frontlineFortress: nextState });
        get().awardRewards(report.rewards, "fortress defense");
        get().pushNotification(
          report.outcome === "breach" ? "error" : "success",
          report.outcome === "full_repel"
            ? "Fortress held the line"
            : report.outcome === "partial_hold"
              ? "Fortress held with damage"
              : "Fortress was breached",
        );
        return report;
      },

      awardRewards: (r, source) => {
        const newlyUnlockedFrontlineCards =
          r.frontlineCards?.filter(
            (card) =>
              isFrontlineProgressionCard(card.cardId) &&
              !isFrontlineCardUnlocked(get().frontlineCardUnlocks, card.cardId),
          ) ?? [];

        set((s) => {
          const next: Partial<GameState> = {};
          next.resources = applyRewardResources(s.resources, r);

          if (r.accountXp) {
            let xp = s.account.xp + r.accountXp;
            let lvl = s.account.level;
            while (xp >= ACCOUNT_XP_PER_LEVEL * lvl) {
              xp -= ACCOUNT_XP_PER_LEVEL * lvl;
              lvl += 1;
            }
            next.account = { ...s.account, xp, level: lvl };
            if (lvl > s.account.level) {
              // Remember the highest unacknowledged level so the LevelUpModal can fire once.
              next.pendingUnlockLevel = Math.max(s.pendingUnlockLevel ?? 0, lvl);
            }
          }

          if (r.shards?.length) {
            const heroes = s.heroes.slice();
            for (const sh of r.shards) {
              const idx = heroes.findIndex((h) => h.heroId === sh.heroId);
              if (idx === -1) {
                if (sh.amount >= 10) {
                  heroes.push({ heroId: sh.heroId, level: 1, stars: 1, shards: sh.amount - 10, xp: 0, skillLevel: 1 });
                } else {
                  heroes.push({ heroId: sh.heroId, level: 0, stars: 0, shards: sh.amount, xp: 0, skillLevel: 1 });
                }
              } else {
                const h = heroes[idx];
                let combinedShards = h.shards + sh.amount;
                // unlock if locked and enough shards
                if (h.stars === 0 && combinedShards >= 10) {
                  heroes[idx] = { ...h, stars: 1, level: 1, shards: combinedShards - 10 };
                } else {
                  heroes[idx] = { ...h, shards: combinedShards };
                }
              }
            }
            next.heroes = heroes;
          }

          if (r.xp) {
            const heroes = (next.heroes ?? s.heroes).slice();
            const teamIds = s.team.filter(Boolean) as string[];
            for (const id of teamIds) {
              const idx = heroes.findIndex((h) => h.heroId === id);
              if (idx >= 0) heroes[idx] = { ...heroes[idx], xp: heroes[idx].xp + r.xp! };
            }
            next.heroes = heroes;
          }

          if (r.frontlineCards?.length) {
            const frontlineCardUnlocks = { ...s.frontlineCardUnlocks };
            for (const card of r.frontlineCards) {
              if (isFrontlineProgressionCard(card.cardId)) {
                frontlineCardUnlocks[card.cardId] = true;
              }
            }
            next.frontlineCardUnlocks = frontlineCardUnlocks;
          }
          return next;
        });
        if (newlyUnlockedFrontlineCards.length) {
          get().pushNotification("success", "Frontline card unlocked");
        }
        if (source) get().pushNotification("success", `Rewards from ${source}`);
      },

      spend: (cost) => {
        const s = get();
        if (!canAfford(s.resources, cost)) return false;
        set((st) => ({
          resources: spendResources(st.resources, cost),
        }));
        return true;
      },

      levelUpHero: (heroId) => {
        const s = get();
        const idx = s.heroes.findIndex((h) => h.heroId === heroId);
        if (idx < 0 || s.heroes[idx].stars === 0) return false;
        const ph = s.heroes[idx];
        const cost = LEVEL_UP_GOLD(ph.level);
        if (s.resources.gold < cost) {
          get().pushNotification("error", "Not enough gold");
          return false;
        }
        set((st) => {
          const heroes = st.heroes.slice();
          heroes[idx] = { ...heroes[idx], level: heroes[idx].level + 1 };
          return {
            heroes,
            resources: { ...st.resources, gold: st.resources.gold - cost },
            heroesUpgraded: st.heroesUpgraded + 1,
          };
        });
        get().updateMissionProgress("heroes_upgraded", 1);
        return true;
      },

      starUpHero: (heroId) => {
        const s = get();
        const idx = s.heroes.findIndex((h) => h.heroId === heroId);
        if (idx < 0) return false;
        const ph = s.heroes[idx];
        if (ph.stars >= MAX_STARS || ph.stars === 0) return false;
        const needed = SHARDS_FOR_STAR[ph.stars] ?? 0;
        if (ph.shards < needed) {
          get().pushNotification("error", "Not enough shards");
          return false;
        }
        set((st) => {
          const heroes = st.heroes.slice();
          heroes[idx] = {
            ...heroes[idx],
            stars: heroes[idx].stars + 1,
            shards: heroes[idx].shards - needed,
          };
          return { heroes, heroesUpgraded: st.heroesUpgraded + 1 };
        });
        get().updateMissionProgress("heroes_upgraded", 1);
        return true;
      },

      skillUpHero: (heroId) => {
        const s = get();
        const idx = s.heroes.findIndex((h) => h.heroId === heroId);
        if (idx < 0 || s.heroes[idx].stars === 0) return false;
        const ph = s.heroes[idx];
        const sl = ph.skillLevel ?? 1;
        if (sl >= MAX_SKILL_LEVEL) {
          get().pushNotification("error", "Skill already at max level");
          return false;
        }
        const cost = SKILL_UP_DUST[sl] ?? 0;
        if (s.resources.dust < cost) {
          get().pushNotification("error", "Not enough Arcane Dust");
          return false;
        }
        set((st) => {
          const heroes = st.heroes.slice();
          heroes[idx] = { ...heroes[idx], skillLevel: (heroes[idx].skillLevel ?? 1) + 1 };
          return {
            heroes,
            resources: { ...st.resources, dust: st.resources.dust - cost },
            heroesUpgraded: st.heroesUpgraded + 1,
          };
        });
        get().updateMissionProgress("heroes_upgraded", 1);
        get().pushNotification("success", `Skill enhanced to level ${sl + 1}!`);
        return true;
      },

      recordBattleResult: (won, source) => {
        if (won) {
          set((s) => ({ battlesWon: s.battlesWon + 1 }));
          get().updateMissionProgress("battles_won", 1);
        }
        if (source === "arena") {
          set((s) => (won ? { arenaWins: s.arenaWins + 1 } : { arenaLosses: s.arenaLosses + 1 }));
          get().updateMissionProgress("arena_battles", 1);
        }
        if (source === "event") get().updateMissionProgress("events_played", 1);
      },

      markAdventureCleared: (levelId) => {
        const s = get();
        const prev = s.adventureProgress[levelId] ?? { cleared: false, firstClearTaken: false };
        const firstClear = isAdventureFirstClearRewardAvailable(prev);
        set((st) => ({
          adventureProgress: {
            ...st.adventureProgress,
            [levelId]: {
              ...prev,
              cleared: true,
              firstClearTaken: prev.firstClearTaken || firstClear,
              completions: (prev.completions ?? 0) + 1,
              lastCompletedAt: localDayKey(),
            },
          },
        }));
        if (firstClear) get().updateMissionProgress("adventure_levels_cleared", 1);
        return { firstClear };
      },

      claimAdventureNode: (levelId) => {
        const level = ADVENTURE.find((entry) => entry.id === levelId);
        if (!level) return null;
        const type = getAdventureNodeType(level);
        const prev = get().adventureProgress[levelId] ?? { cleared: false, firstClearTaken: false };
        const rewards = getAdventureChestClaimRewards(level, prev);
        if (!rewards) {
          get().pushNotification("info", type === "chest" ? "Chest already claimed" : "Node cannot be claimed");
          return null;
        }
        set((st) => ({
          adventureProgress: {
            ...st.adventureProgress,
            [levelId]: {
              ...prev,
              cleared: true,
              firstClearTaken: true,
              claimed: true,
              completions: (prev.completions ?? 0) + 1,
              lastCompletedAt: localDayKey(),
            },
          },
        }));
        get().updateMissionProgress("adventure_levels_cleared", 1);
        get().awardRewards(rewards, level.name);
        return rewards;
      },

      claimAdventureMapInteraction: (interactionId) => {
        const interaction = ADVENTURE_MAP_INTERACTIONS_BY_ID[interactionId];
        if (!interaction) {
          get().pushNotification("error", "Map interaction not found");
          return null;
        }
        const s = get();
        const claim = s.adventureMapClaims[interactionId];
        const status = getAdventureMapInteractionStatus({
          interaction,
          progress: s.adventureProgress,
          resources: s.resources,
          claim,
        });
        if (status === "claimed") {
          get().pushNotification("info", "Map cache already claimed");
          return null;
        }
        if (status === "locked") {
          get().pushNotification("error", "Map cache is still sealed");
          return null;
        }
        if (status === "needs_key") {
          get().pushNotification("error", "Adventure key required");
          return null;
        }
        if (!get().spend({ adventureKeys: interaction.keyCost })) {
          get().pushNotification("error", "Adventure key required");
          return null;
        }
        const result = rollAdventureMapInteractionLoot(interaction);
        const claimedAt = todayISO();
        set((st) => ({
          adventureMapClaims: {
            ...st.adventureMapClaims,
            [interactionId]: {
              claimed: true,
              claimedAt,
              lootId: result.lootId,
              lootTier: result.lootTier,
              lootTitle: result.lootTitle,
              rewards: result.rewards,
              resetAvailableAt: getAdventureMapInteractionResetAvailableAt(interaction, { claimed: true, claimedAt }) ?? undefined,
            },
          },
        }));
        get().awardRewards(result.rewards, interaction.title);
        return result;
      },

      claimMission: (missionId) => {
        get().ensureMissionsInitialized();
        const s = get();
        const m = ALL_MISSIONS.find((x) => x.id === missionId);
        if (!m) return null;
        const p = s.missionsProgress[missionId];
        if (!p || p.claimed || p.progress < m.goal) return null;
        set((st) => ({
          missionsProgress: { ...st.missionsProgress, [missionId]: { ...p, claimed: true } },
        }));
        get().awardRewards(m.rewards, `mission ${m.name}`);
        return m.rewards;
      },

      purchaseOffer: (offerId) => {
        get().refreshShopIfNeeded();
        const s = get();
        const offer = SHOP_OFFERS_BY_ID[offerId];
        if (!offer) return { ok: false, reason: "Offer not found" };
        if (offer.contents.adventureKeys && !isAdventureKeySystemUnlocked(s.adventureProgress)) {
          return { ok: false, reason: "Adventure keys are not unlocked yet" };
        }
        if (offer.oneTime && (s.shopPurchases[offerId] ?? 0) > 0)
          return { ok: false, reason: "Already purchased" };
        if (offer.dailyLimit && (s.dailyShopPurchases[offerId] ?? 0) >= offer.dailyLimit)
          return { ok: false, reason: "Daily limit reached" };
        if (!get().spend(offer.cost)) return { ok: false, reason: "Not enough resources" };
        set((st) => ({
          shopPurchases: { ...st.shopPurchases, [offerId]: (st.shopPurchases[offerId] ?? 0) + 1 },
          dailyShopPurchases: {
            ...st.dailyShopPurchases,
            [offerId]: (st.dailyShopPurchases[offerId] ?? 0) + 1,
          },
        }));
        get().awardRewards(offer.contents, `shop: ${offer.name}`);
        return { ok: true };
      },

      pushNotification: (kind, message) => {
        const id = `${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
        set((s) => ({ notifications: [...s.notifications, { id, kind, message }] }));
        if (typeof window !== "undefined") {
          setTimeout(() => get().dismissNotification(id), 3500);
        }
      },

      dismissNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      nextSeed: () => {
        const s = get();
        const next = (s.lastSeed * 1664525 + 1013904223) >>> 0;
        set({ lastSeed: next });
        return next;
      },

      ensureMissionsInitialized: () => {
        const s = get();
        const now = new Date();
        const updates: Record<string, MissionProgress> = {};
        let changed = false;
        for (const m of ALL_MISSIONS) {
          const current = s.missionsProgress[m.id];
          if (missionNeedsReset(current, now)) {
            updates[m.id] = freshMissionProgress(m, now);
            changed = true;
          }
        }
        if (changed) set((st) => ({ missionsProgress: { ...st.missionsProgress, ...updates } }));
      },

      saveBattle: (levelId, state) => {
        // Don't persist already-finished battles.
        if (state.winner) {
          set({ savedBattle: null });
          return;
        }
        set({ savedBattle: { levelId, state } });
      },

      clearSavedBattle: () => set({ savedBattle: null }),

      claimDailyLogin: () => {
        const s = get();
        const status = getDailyLoginClaimState(s.dailyLogin);
        if (!status.claimable) return null;
        const newStreak = status.nextDay;
        const day = status.nextDay; // 1..7
        const entry = DAILY_LOGIN.find((e) => e.day === day) ?? DAILY_LOGIN[0];
        set({ dailyLogin: { streak: newStreak, lastClaim: status.today } });
        get().awardRewards(entry.rewards, `Daily ${entry.label}`);
        return entry.rewards;
      },

      claimRoadmapStep: (id) => {
        const s = get();
        const step = ROADMAP.find((r) => r.id === id);
        if (!step) return null;
        if (!isRoadmapRewardClaimable(s.roadmapClaimed[id], isRoadmapStepComplete(s, step))) return null;
        set((st) => ({ roadmapClaimed: { ...st.roadmapClaimed, [id]: true } }));
        get().awardRewards(step.rewards, `Roadmap: ${step.title}`);
        return step.rewards;
      },

      claimMilestone: (level) => {
        const s = get();
        const m = MILESTONES.find((x) => x.level === level);
        if (!m) return null;
        if (!isMilestoneRewardClaimable(s.account.level, level, s.milestonesClaimed[level])) return null;
        set((st) => ({ milestonesClaimed: { ...st.milestonesClaimed, [level]: true } }));
        get().awardRewards(m.rewards, `Level ${level}: ${m.title}`);
        return m.rewards;
      },

      markEventCompleted: (eventId) => {
        const today = todayYMD();
        set((st) => ({
          eventCompletions: { ...st.eventCompletions, [eventId]: today },
          eventsPlayed: { ...st.eventsPlayed, [eventId]: (st.eventsPlayed[eventId] ?? 0) + 1 },
        }));
      },

      refreshShopIfNeeded: () => {
        const s = get();
        const today = todayYMD();
        if (s.shopRefreshedAt !== today) {
          set({ shopRefreshedAt: today, dailyShopPurchases: {} });
        }
      },

      offerRemaining: (offerId) => {
        const s = get();
        const offer = SHOP_OFFERS_BY_ID[offerId];
        if (!offer) return 0;
        if (offer.oneTime) {
          return (s.shopPurchases[offerId] ?? 0) > 0 ? 0 : 1;
        }
        if (offer.dailyLimit) {
          return Math.max(0, offer.dailyLimit - (s.dailyShopPurchases[offerId] ?? 0));
        }
        return null;
      },

      setAudioMuted: (m) => set({ audioMuted: m }),
      setMusicVolume: (volume) => set({ musicVolume: Math.max(0, Math.min(1, volume)) }),
      setSfxVolume: (volume) => set({ sfxVolume: Math.max(0, Math.min(1, volume)) }),
      setLanguage: (language) => set({ language }),
      setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
      setVisualEffects: (enabled) => set({ visualEffects: enabled }),
      setTextScale: (scale) => set({ textScale: scale }),
      setOnboardingStep: (step) =>
        set((st) => ({ onboarding: { ...st.onboarding, step } })),
      completeOnboarding: () =>
        set({ onboarding: { step: 99, completed: true } }),
      ackPendingUnlock: () => set({ pendingUnlockLevel: null }),

      refreshArenaTicketsIfNeeded: () => {
        const s = get();
        const today = todayYMD();
        if (s.arenaTicketsRefreshedAt !== today) {
          set({
            arenaTicketsRefreshedAt: today,
            resources: { ...s.resources, arenaTickets: Math.max(s.resources.arenaTickets, DAILY_ARENA_TICKETS) },
          });
        }
      },


      updateMissionProgress: (metric, delta) => {
        get().ensureMissionsInitialized();
        const s = get();
        const now = new Date();
        const updates: Record<string, MissionProgress> = {};
        for (const m of ALL_MISSIONS) {
          if (m.metric !== metric) continue;
          const p = s.missionsProgress[m.id] ?? freshMissionProgress(m, now);
          if (p.claimed) continue;
          updates[m.id] = { ...p, progress: Math.min(m.goal, p.progress + delta) };
        }
        if (Object.keys(updates).length)
          set((st) => ({ missionsProgress: { ...st.missionsProgress, ...updates } }));
      },
    }),
    {
      name: "duskkeep-fronts:player:v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage,
      ),
      partialize: (s) => {
        const { notifications, hydrated, ...rest } = s;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        state?.hydrate();
      },
      // Merge persisted data on top of defaults so new fields appear automatically on upgrade without wiping.
      merge: mergePersistedGameState,
      version: 5,
    },
  ),
);

// Selectors / helpers (used by screens)
export function selectAvailableHeroes(state: GameState) {
  return state.heroes.filter((h) => h.stars > 0);
}
export function findAdventureLevel(id: string): AdventureLevel | undefined {
  return ADVENTURE.find((l) => l.id === id);
}
export function nextUnlockedLevel(state: GameState): AdventureLevel | undefined {
  for (const lvl of ADVENTURE) {
    const progress = state.adventureProgress[lvl.id];
    if (progress?.cleared || progress?.claimed) continue;
    if (isAdventureLevelUnlocked(lvl, state.adventureProgress, state.account.level)) return lvl;
  }
  return undefined;
}

export function heroKnown(state: GameState, heroId: string): boolean {
  return state.heroes.some((h) => h.heroId === heroId);
}
export const heroDefsById = Object.fromEntries(HEROES.map((h) => [h.id, h]));

export function ownedHeroCardIds(state: GameState) {
  return state.heroes
    .filter((hero) => hero.stars > 0)
    .map((hero) => `card_${hero.heroId}`);
}

// --- Roadmap helpers ------------------------------------------------------

export function roadmapMetricValue(state: GameState, metric: RoadmapStep["metric"]): number {
  switch (metric) {
    case "adventure_clears":
      return Object.values(state.adventureProgress).filter((p) => p.cleared).length;
    case "heroes_upgraded":
      return state.heroesUpgraded;
    case "hero_stars":
      return state.heroes.reduce((m, h) => Math.max(m, h.stars), 0);
    case "collection_size":
      return state.heroes.filter((h) => h.stars > 0).length;
    case "battles_won":
      return state.battlesWon;
    case "arena_battles":
      return state.arenaWins + state.arenaLosses;
    case "events_played":
      return Object.values(state.eventsPlayed).reduce((a, b) => a + b, 0);
    case "shop_purchases":
      return Object.values(state.shopPurchases).reduce((a, b) => a + b, 0);
    case "account_level":
      return state.account.level;
  }
}

export function isRoadmapStepComplete(state: GameState, step: RoadmapStep): boolean {
  return roadmapMetricValue(state, step.metric) >= step.goal;
}

/** The next visible roadmap step: first unclaimed step. */
export function activeRoadmapStep(state: GameState): RoadmapStep | undefined {
  return firstVisibleRoadmapStep(ROADMAP, state.roadmapClaimed);
}

/** True when the event's last completion matches today (YMD) — locked until rotation. */
export function isEventCompletedToday(state: GameState, eventId: string): boolean {
  return isDailyRotationRewardClaimedToday(state.eventCompletions, eventId);
}

export function dailyLoginStatus(state: GameState) {
  const { claimed, streak, nextDay } = getDailyLoginClaimState(state.dailyLogin);
  return { claimed, streak, nextDay };
}

export { isAdventureFirstClearRewardAvailable } from "@/lib/rewardVisibility";
