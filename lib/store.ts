"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ALL_MISSIONS } from "@/data/missions";
import { ADVENTURE } from "@/data/adventure";
import { SHOP_OFFERS, SHOP_OFFERS_BY_ID } from "@/data/shop";
import { DAILY_LOGIN } from "@/data/dailyLogin";
import { ROADMAP } from "@/data/roadmap";
import { MILESTONES } from "@/data/milestones";
import { CARD_BY_ID } from "@/data/cards";
import {
  getAdventureProgressEntry,
  markAdventureLevelCleared,
  markAdventureMapInteractionClaimed,
  markAdventureNodeClaimed,
} from "@/lib/adventureProgressState";
import { defaultInitial, todayISO, todayYMD } from "@/lib/defaultGameState";
import {
  applyFortressBuildingUpgrade,
  applyFrontlineFortressUpgrade,
  getFortressBuildingUpgradePlan,
  getFortressIncomeRewards,
  getFrontlineFortressUpgradePlan,
  markFortressIncomeCollected,
  setFrontlineFortressGarrisonSlot,
} from "@/lib/fortressState";
import { getNewlyUnlockedFrontlineCardRewards } from "@/lib/frontlineCardRewards";
import { applyHeroLevelUp, applyHeroSkillUp, applyHeroStarUp } from "@/lib/heroUpgrades";
import {
  setDeckSlotState,
  setFrontlineLeaderState,
  setFrontlineSquadSlotState,
  setTeamSlotState,
  toggleFrontlineDeckCardState,
} from "@/lib/loadoutState";
import { claimDailyLoginReward, claimMilestoneReward, claimRoadmapReward } from "@/lib/metaRewardClaims";
import { applyMissionMetricProgress, claimMissionProgress, ensureMissionProgress } from "@/lib/missionProgress";
import { mergePersistedGameState } from "@/lib/persistedGameState";
import { applyRewardsToGameState } from "@/lib/rewardApplication";
import { canAfford, spendResources } from "@/lib/resourceMath";
import { applyShopOfferPurchase, getShopOfferRemaining, validateShopOfferPurchase } from "@/lib/shopPurchases";
import { isRoadmapStepComplete } from "@/lib/storeSelectors";
import type { GameActions, GameState } from "@/lib/storeTypes";
import {
  isAdventureFirstClearRewardAvailable,
  localDayKey,
} from "@/lib/rewardVisibility";
import {
  FRONTLINE_CARD_MAX_LEVEL,
  frontlineCardUpgradeCost,
  isFrontlineCardUnlocked,
  isFrontlineProgressionCard,
  normalizeFrontlineCardLevel,
} from "@/features/frontline/cardProgression";
import {
  frontlineFortressRaidReady,
  resolveFrontlineFortressRaid,
} from "@/features/frontline/fortress";
import { createFrontlineHeroProfileMap } from "@/features/frontline/heroProfile";
import {
  ADVENTURE_MAP_INTERACTIONS_BY_ID,
  getAdventureMapInteractionStatus,
  rollAdventureMapInteractionLoot,
} from "@/features/adventure/mapInteractions";
import {
  getAdventureChestClaimRewards,
  getAdventureNodeType,
} from "@/features/adventure/nodeResolution";
import {
  DAILY_ARENA_TICKETS,
  DECK_SIZE,
  SKILL_COOLDOWN_REDUCTION_AT_MAX,
  SKILL_MULTIPLIER_BONUS,
} from "./constants";

export type { GameActions, GameState, Notification, NotificationKind, TextScale } from "@/lib/storeTypes";
export { fortressBattleBonuses, fortressIncomePreview } from "@/lib/fortressState";

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
        set((s) => ({
          team: setTeamSlotState(s.team, slotIdx, heroId),
        })),

      setDeckSlot: (slotIdx, cardId) =>
        set((s) => ({
          activeDeck: setDeckSlotState(s.activeDeck, slotIdx, cardId),
        })),

      setActiveLeader: (leaderId) => set({ activeLeaderId: leaderId }),

      setFrontlineLeader: (leaderId) =>
        set((s) => ({ frontlineLoadout: setFrontlineLeaderState(s.frontlineLoadout, leaderId) })),

      setFrontlineSquadSlot: (slotIdx, heroId) =>
        set((s) => ({ frontlineLoadout: setFrontlineSquadSlotState(s.frontlineLoadout, slotIdx, heroId) })),

      toggleFrontlineDeckCard: (cardId) =>
        set((s) => {
          if (!isFrontlineCardUnlocked(s.frontlineCardUnlocks, cardId)) return {};
          return {
            frontlineLoadout: toggleFrontlineDeckCardState(s.frontlineLoadout, cardId, DECK_SIZE),
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
        const rewards = getFortressIncomeRewards(get().fortress);
        if (!rewards) return null;
        set((st) => ({
          fortress: markFortressIncomeCollected(st.fortress, new Date().toISOString()),
        }));
        get().awardRewards(rewards, "fortress income");
        return rewards;
      },

      upgradeFortressBuilding: (buildingId) => {
        const plan = getFortressBuildingUpgradePlan(get().fortress, buildingId);
        if (!plan.ok) {
          if (plan.reason === "max_level") {
            get().pushNotification("error", "Building already at max level");
          }
          return false;
        }
        if (!get().spend(plan.cost)) {
          get().pushNotification("error", "Not enough resources");
          return false;
        }
        set((st) => ({
          fortress: applyFortressBuildingUpgrade(st.fortress, buildingId),
        }));
        get().pushNotification("success", `${plan.name} upgraded`);
        return true;
      },

      upgradeFrontlineFortress: (buildingId) => {
        const plan = getFrontlineFortressUpgradePlan(get().frontlineFortress, buildingId);
        if (!plan.ok) return false;
        if (!get().spend(plan.cost)) {
          get().pushNotification("error", "Not enough resources");
          return false;
        }
        set((st) => ({
          frontlineFortress: applyFrontlineFortressUpgrade(st.frontlineFortress, buildingId),
        }));
        get().pushNotification("success", `${plan.name} upgraded`);
        return true;
      },

      setFrontlineGarrisonSlot: (slotIdx, heroId) =>
        set((s) => ({
          frontlineFortress: setFrontlineFortressGarrisonSlot(s.frontlineFortress, slotIdx, heroId),
        })),

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
        const newlyUnlockedFrontlineCards = getNewlyUnlockedFrontlineCardRewards(get().frontlineCardUnlocks, r.frontlineCards);

        set((s) => applyRewardsToGameState(s, r));
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
        const result = applyHeroLevelUp(s.heroes, s.resources, heroId);
        if (!result.ok) {
          if (result.reason === "not_enough_gold") {
            get().pushNotification("error", "Not enough gold");
          }
          return false;
        }
        set((st) => ({
          heroes: result.heroes,
          resources: result.resources,
          heroesUpgraded: st.heroesUpgraded + 1,
        }));
        get().updateMissionProgress("heroes_upgraded", 1);
        return true;
      },

      starUpHero: (heroId) => {
        const result = applyHeroStarUp(get().heroes, heroId);
        if (!result.ok) {
          if (result.reason === "not_enough_shards") {
            get().pushNotification("error", "Not enough shards");
          }
          return false;
        }
        set((st) => ({
          heroes: result.heroes,
          heroesUpgraded: st.heroesUpgraded + 1,
        }));
        get().updateMissionProgress("heroes_upgraded", 1);
        return true;
      },

      skillUpHero: (heroId) => {
        const s = get();
        const result = applyHeroSkillUp(s.heroes, s.resources, heroId);
        if (!result.ok) {
          if (result.reason === "max_skill_level") {
            get().pushNotification("error", "Skill already at max level");
          }
          if (result.reason === "not_enough_dust") {
            get().pushNotification("error", "Not enough Arcane Dust");
          }
          return false;
        }
        set((st) => ({
          heroes: result.heroes,
          resources: result.resources,
          heroesUpgraded: st.heroesUpgraded + 1,
        }));
        get().updateMissionProgress("heroes_upgraded", 1);
        get().pushNotification("success", `Skill enhanced to level ${result.nextSkillLevel}!`);
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
        const prev = getAdventureProgressEntry(s.adventureProgress, levelId);
        const firstClear = isAdventureFirstClearRewardAvailable(prev);
        set((st) => ({
          adventureProgress: markAdventureLevelCleared(st.adventureProgress, levelId, {
            firstClear,
            completedAt: localDayKey(),
          }),
        }));
        if (firstClear) get().updateMissionProgress("adventure_levels_cleared", 1);
        return { firstClear };
      },

      claimAdventureNode: (levelId) => {
        const level = ADVENTURE.find((entry) => entry.id === levelId);
        if (!level) return null;
        const type = getAdventureNodeType(level);
        const prev = getAdventureProgressEntry(get().adventureProgress, levelId);
        const rewards = getAdventureChestClaimRewards(level, prev);
        if (!rewards) {
          get().pushNotification("info", type === "chest" ? "Chest already claimed" : "Node cannot be claimed");
          return null;
        }
        set((st) => ({
          adventureProgress: markAdventureNodeClaimed(st.adventureProgress, levelId, localDayKey()),
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
          adventureMapClaims: markAdventureMapInteractionClaimed(st.adventureMapClaims, interaction, result, claimedAt),
        }));
        get().awardRewards(result.rewards, interaction.title);
        return result;
      },

      claimMission: (missionId) => {
        get().ensureMissionsInitialized();
        const result = claimMissionProgress(get().missionsProgress, ALL_MISSIONS, missionId);
        if (!result) return null;
        set({ missionsProgress: result.missionsProgress });
        get().awardRewards(result.rewards, result.source);
        return result.rewards;
      },

      purchaseOffer: (offerId) => {
        get().refreshShopIfNeeded();
        const s = get();
        const offer = SHOP_OFFERS_BY_ID[offerId];
        if (!offer) return { ok: false, reason: "Offer not found" };
        const validation = validateShopOfferPurchase(offer, s, s.adventureProgress);
        if (!validation.ok) return validation;
        if (!get().spend(offer.cost)) return { ok: false, reason: "Not enough resources" };
        set((st) => applyShopOfferPurchase(st, offerId));
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
        const missionsProgress = ensureMissionProgress(get().missionsProgress, ALL_MISSIONS);
        if (missionsProgress) set({ missionsProgress });
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
        const result = claimDailyLoginReward(get().dailyLogin, DAILY_LOGIN);
        if (!result) return null;
        set(result.patch);
        get().awardRewards(result.rewards, result.source);
        return result.rewards;
      },

      claimRoadmapStep: (id) => {
        const s = get();
        const step = ROADMAP.find((r) => r.id === id);
        const result = claimRoadmapReward(s.roadmapClaimed, step, step ? isRoadmapStepComplete(s, step) : false);
        if (!result) return null;
        set(result.patch);
        get().awardRewards(result.rewards, result.source);
        return result.rewards;
      },

      claimMilestone: (level) => {
        const s = get();
        const m = MILESTONES.find((x) => x.level === level);
        const result = claimMilestoneReward(s.account.level, s.milestonesClaimed, m);
        if (!result) return null;
        set(result.patch);
        get().awardRewards(result.rewards, result.source);
        return result.rewards;
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
        return getShopOfferRemaining(offer, s);
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
        const missionsProgress = applyMissionMetricProgress(get().missionsProgress, ALL_MISSIONS, metric, delta);
        if (missionsProgress) set({ missionsProgress });
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

/** True when the event's last completion matches today (YMD) — locked until rotation. */
export {
  activeRoadmapStep,
  dailyLoginStatus,
  findAdventureLevel,
  heroDefsById,
  heroKnown,
  isEventCompletedToday,
  isRoadmapStepComplete,
  nextUnlockedLevel,
  ownedHeroCardIds,
  roadmapMetricValue,
  selectAvailableHeroes,
} from "@/lib/storeSelectors";

export { isAdventureFirstClearRewardAvailable } from "@/lib/rewardVisibility";
