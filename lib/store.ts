"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ALL_MISSIONS } from "@/data/missions";
import { SHOP_OFFERS, SHOP_OFFERS_BY_ID } from "@/data/shop";
import { DAILY_LOGIN } from "@/data/dailyLogin";
import { ROADMAP } from "@/data/roadmap";
import { MILESTONES } from "@/data/milestones";
import { CARD_BY_ID } from "@/data/cards";
import { ADVENTURE_BY_ID } from "@/data/adventure";
import { createAdventureMapInteractionClaimPlan } from "@/lib/adventureMapInteractionClaims";
import { markAdventureLevelCleared, markAdventureNodeClaimed } from "@/lib/adventureProgressState";
import { planAdventureLevelClear, planAdventureNodeClaim } from "@/lib/adventureNodeState";
import { defaultInitial, todayISO, todayYMD } from "@/lib/defaultGameState";
import { getFortressIncomeRewards, markFortressIncomeCollected, setFrontlineFortressGarrisonSlot } from "@/lib/fortressState";
import { getNewlyUnlockedFrontlineCardRewards } from "@/lib/frontlineCardRewards";
import {
  setDeckSlotState,
  setFrontlineLeaderState,
  setFrontlineSquadSlotState,
  setTeamSlotState,
  toggleFrontlineDeckCardState,
} from "@/lib/loadoutState";
import { claimDailyLoginReward, claimMilestoneReward, claimRoadmapReward } from "@/lib/metaRewardClaims";
import { applyMissionMetricProgress, claimMissionProgress, ensureMissionProgress, getMissionResetAt } from "@/lib/missionProgress";
import { getMissionAuthoritativeClaimPlan } from "@/lib/missionAuthoritativeClaims";
import { mergePersistedGameState } from "@/lib/persistedGameState";
import { applyRewardsToGameState } from "@/lib/rewardApplication";
import { canAfford, spendResources } from "@/lib/resourceMath";
import { applyShopOfferPurchase, getShopOfferRemaining, validateShopOfferPurchase } from "@/lib/shopPurchases";
import { addNotificationState, completeOnboardingState, createNotificationId, dismissNotificationState, markEventCompletedState, nextStoreSeed, refreshArenaTicketsState, refreshShopState, saveBattleState, setOnboardingStepState } from "@/lib/storeHousekeeping";
import { isRoadmapStepComplete } from "@/lib/storeSelectors";
import { createLocalSyncSnapshot, LOCAL_SYNC_SNAPSHOT_VERSION } from "@/lib/localSyncSnapshot";
import {
  createFortressBuildingUpgradeCommand,
  createFrontlineCardUpgradeCommand,
  createFrontlineFortressUpgradeCommand,
  createHeroLevelUpCommand,
  createHeroSkillUpCommand,
  createHeroStarUpCommand,
} from "@/lib/progressionCommands";
import { applyProgressionCommandResultToStore } from "@/lib/progressionCommandStoreAdapter";
import type { GameActions, GameState } from "@/lib/storeTypes";
import {
  isAdventureFirstClearRewardAvailable,
  localDayKey,
} from "@/lib/rewardVisibility";
import { isFrontlineCardUnlocked } from "@/features/frontline/cardProgression";
import { getFrontlineAdventureVictoryRewards } from "@/features/frontline/adventure";
import {
  frontlineFortressRaidReady,
  resolveFrontlineFortressRaid,
} from "@/features/frontline/fortress";
import { planFrontlineCardUnlock } from "@/lib/frontlineCardState";
import { createFrontlineHeroProfileMap } from "@/features/frontline/heroProfile";
import {
  claimAdventureBattleResultAuthoritatively,
  claimAdventureNodeRewardAuthoritatively,
  claimDailyLoginAuthoritatively,
  claimMissionAuthoritatively,
  levelUpHeroAuthoritatively,
  openAdventureMapInteractionAuthoritatively,
  purchaseShopOfferAuthoritatively,
  recordArenaResultAuthoritatively,
  recordEventResultAuthoritatively,
  resolveFrontlineFortressRaidAuthoritatively,
  saveFrontlineLoadoutAuthoritatively,
  skillUpHeroAuthoritatively,
  starUpHeroAuthoritatively,
  syncLocalSnapshotAuthoritatively,
  upgradeFrontlineCardAuthoritatively,
  upgradeFrontlineFortressAuthoritatively,
} from "@/features/server/authoritativeOperationDispatcher";
import {
  AUTH_SESSION_EXPIRED_NOTICE,
  shouldBlockLocalAuthoritativeFallback,
} from "@/features/server/sessionSecurity";
import { loadServerPlayerSnapshot } from "@/features/server/serverPlayerSnapshot";
import { createServerPlayerSnapshotPatch } from "@/lib/serverPlayerSnapshotState";
import {
  DAILY_ARENA_TICKETS,
  DECK_SIZE,
  SKILL_COOLDOWN_REDUCTION_AT_MAX,
  SKILL_MULTIPLIER_BONUS,
} from "./constants";
import type { Rewards } from "@/lib/types";

export type { AccountLinkMode, GameActions, GameState, Notification, NotificationKind, TextScale } from "@/lib/storeTypes";
export { fortressBattleBonuses, fortressIncomePreview } from "@/lib/fortressState";

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
} as unknown as Storage;

const ADVENTURE_DRAW_REWARDS: Rewards = { gold: 20, dust: 2, gems: 0, accountXp: 1 };
const ADVENTURE_DEFEAT_REWARDS: Rewards = { gold: 0, dust: 0, gems: 0, accountXp: 0 };

type StoreSetPatch = (patch: Partial<GameState & GameActions>) => void;
type StoreGetState = () => GameState & GameActions;

function blockLocalAuthoritativeFallbackIfNeeded(
  reason: string,
  set: StoreSetPatch,
  get: StoreGetState,
) {
  if (
    !shouldBlockLocalAuthoritativeFallback({
      accountLinkMode: get().accountLinkMode,
      reason,
    })
  ) {
    return false;
  }

  set({ accountLinkMode: "undecided" });
  get().pushNotification("info", AUTH_SESSION_EXPIRED_NOTICE);
  return true;
}

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

      syncFrontlineLoadoutOnlineFirst: async () => {
        const authoritative = await saveFrontlineLoadoutAuthoritatively(get().frontlineLoadout);
        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return { ok: false, reason: authoritative.reason, authoritative: true };
          }
          return { ok: true, authoritative: false };
        }

        if (!authoritative.ok) {
          get().pushNotification("error", authoritative.reason);
          return { ok: false, reason: authoritative.reason, authoritative: true };
        }

        set({ frontlineLoadout: authoritative.loadout });
        return { ok: true, authoritative: true };
      },

      unlockFrontlineCard: (cardId) => {
        const plan = planFrontlineCardUnlock(get().frontlineCardUnlocks, cardId);
        if (!plan.ok) return false;
        set({ frontlineCardUnlocks: plan.frontlineCardUnlocks });
        get().pushNotification("success", "New Frontline card unlocked");
        return true;
      },

      upgradeFrontlineCard: (cardId) => {
        const command = createFrontlineCardUpgradeCommand({
          unlocks: get().frontlineCardUnlocks,
          levels: get().frontlineCardLevels,
          resources: get().resources,
          cardId,
        });
        return applyProgressionCommandResultToStore(command, set, get);
      },

      upgradeFrontlineCardOnlineFirst: async (cardId) => {
        const authoritative = await upgradeFrontlineCardAuthoritatively(cardId);
        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return { ok: false, reason: authoritative.reason, authoritative: true };
          }
          return { ok: get().upgradeFrontlineCard(cardId), authoritative: false };
        }

        if (!authoritative.ok) {
          get().pushNotification("error", authoritative.reason);
          return { ok: false, reason: authoritative.reason, authoritative: true };
        }

        set((s) => ({
          resources: authoritative.resources,
          frontlineCardLevels: {
            ...s.frontlineCardLevels,
            [authoritative.cardId]: authoritative.level,
          },
        }));
        get().pushNotification("success", "Frontline card upgraded");
        return { ok: true, authoritative: true };
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
        const command = createFortressBuildingUpgradeCommand(get().fortress, get().resources, buildingId);
        return applyProgressionCommandResultToStore(command, set, get);
      },

      upgradeFrontlineFortress: (buildingId) => {
        const command = createFrontlineFortressUpgradeCommand(get().frontlineFortress, get().resources, buildingId);
        return applyProgressionCommandResultToStore(command, set, get);
      },

      upgradeFrontlineFortressOnlineFirst: async (buildingId) => {
        const authoritative = await upgradeFrontlineFortressAuthoritatively(buildingId);
        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return { ok: false, reason: authoritative.reason, authoritative: true };
          }
          return { ok: get().upgradeFrontlineFortress(buildingId), authoritative: false };
        }

        if (!authoritative.ok) {
          get().pushNotification("error", authoritative.reason);
          return { ok: false, reason: authoritative.reason, authoritative: true };
        }

        set({
          resources: authoritative.resources,
          frontlineFortress: authoritative.frontlineFortress,
        });
        get().pushNotification("success", "Fortress upgraded");
        return { ok: true, authoritative: true };
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

      resolveFrontlineFortressRaidOnlineFirst: async () => {
        const authoritative = await resolveFrontlineFortressRaidAuthoritatively();
        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return null;
          }
          return get().resolveFrontlineFortressRaid();
        }

        if (!authoritative.ok) {
          get().pushNotification("error", authoritative.reason);
          return null;
        }

        set({
          resources: authoritative.resources,
          frontlineFortress: authoritative.frontlineFortress,
        });
        get().pushNotification(
          authoritative.report.outcome === "breach" ? "error" : "success",
          authoritative.report.outcome === "full_repel"
            ? "Fortress held the line"
            : authoritative.report.outcome === "partial_hold"
              ? "Fortress held with damage"
              : "Fortress was breached",
        );
        return authoritative.report;
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
        return applyProgressionCommandResultToStore(createHeroLevelUpCommand(s.heroes, s.resources, heroId), set, get);
      },

      levelUpHeroOnlineFirst: async (heroId) => {
        const authoritative = await levelUpHeroAuthoritatively(heroId);
        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return { ok: false, reason: authoritative.reason, authoritative: true };
          }
          return { ok: get().levelUpHero(heroId), authoritative: false };
        }

        if (!authoritative.ok) {
          get().pushNotification("error", authoritative.reason);
          return { ok: false, reason: authoritative.reason, authoritative: true };
        }

        set((s) => ({
          resources: authoritative.resources,
          heroes: s.heroes.map((hero) =>
            hero.heroId === authoritative.heroId ? { ...hero, level: authoritative.level } : hero,
          ),
          heroesUpgraded: s.heroesUpgraded + 1,
        }));
        get().updateMissionProgress("heroes_upgraded", 1);
        get().pushNotification("success", "Hero leveled up");
        return { ok: true, authoritative: true };
      },

      starUpHero: (heroId) => {
        return applyProgressionCommandResultToStore(createHeroStarUpCommand(get().heroes, heroId), set, get);
      },

      starUpHeroOnlineFirst: async (heroId) => {
        const authoritative = await starUpHeroAuthoritatively(heroId);
        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return { ok: false, reason: authoritative.reason, authoritative: true };
          }
          return { ok: get().starUpHero(heroId), authoritative: false };
        }

        if (!authoritative.ok) {
          get().pushNotification("error", authoritative.reason);
          return { ok: false, reason: authoritative.reason, authoritative: true };
        }

        set((s) => ({
          resources: authoritative.resources,
          heroes: s.heroes.map((hero) =>
            hero.heroId === authoritative.heroId
              ? { ...hero, stars: authoritative.stars, shards: authoritative.shards }
              : hero,
          ),
          heroesUpgraded: s.heroesUpgraded + 1,
        }));
        get().updateMissionProgress("heroes_upgraded", 1);
        get().pushNotification("success", "Hero starred up");
        return { ok: true, authoritative: true };
      },

      skillUpHero: (heroId) => {
        const s = get();
        return applyProgressionCommandResultToStore(createHeroSkillUpCommand(s.heroes, s.resources, heroId), set, get);
      },

      skillUpHeroOnlineFirst: async (heroId) => {
        const authoritative = await skillUpHeroAuthoritatively(heroId);
        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return { ok: false, reason: authoritative.reason, authoritative: true };
          }
          return { ok: get().skillUpHero(heroId), authoritative: false };
        }

        if (!authoritative.ok) {
          get().pushNotification("error", authoritative.reason);
          return { ok: false, reason: authoritative.reason, authoritative: true };
        }

        set((s) => ({
          resources: authoritative.resources,
          heroes: s.heroes.map((hero) =>
            hero.heroId === authoritative.heroId ? { ...hero, skillLevel: authoritative.skillLevel } : hero,
          ),
          heroesUpgraded: s.heroesUpgraded + 1,
        }));
        get().updateMissionProgress("heroes_upgraded", 1);
        get().pushNotification("success", `Skill enhanced to level ${authoritative.skillLevel}!`);
        return { ok: true, authoritative: true };
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

      recordArenaResultOnlineFirst: async ({
        opponentId,
        battleSeed,
        winner,
        turns,
        battleSummary,
        rewards,
        source,
        ticketAlreadySpent,
      }) => {
        const authoritative = await recordArenaResultAuthoritatively({
          opponentId,
          battleSeed,
          winner,
          turns,
          battleSummary,
        });

        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return null;
          }

          if (!ticketAlreadySpent) {
            const currentTickets = get().resources.arenaTickets;
            if (currentTickets <= 0) {
              get().pushNotification("error", "Arena ticket required");
              return null;
            }
            set((state) => ({
              resources: { ...state.resources, arenaTickets: Math.max(0, state.resources.arenaTickets - 1) },
            }));
          }

          get().recordBattleResult(winner === "ally", "arena");
          get().awardRewards(rewards, source);
          return { rewards, authoritative: false };
        }

        if (!authoritative.ok) {
          get().pushNotification("error", authoritative.reason);
          return null;
        }

        set((state) => {
          const rewardedState = applyRewardsToGameState(state, authoritative.rewards);
          return {
            ...rewardedState,
            resources: authoritative.resources,
            arenaWins: authoritative.arenaWins,
            arenaLosses: authoritative.arenaLosses,
            battlesWon: authoritative.winner === "ally" ? state.battlesWon + 1 : state.battlesWon,
          };
        });
        if (authoritative.winner === "ally") get().updateMissionProgress("battles_won", 1);
        get().updateMissionProgress("arena_battles", 1);
        return {
          rewards: authoritative.rewards,
          authoritative: true,
          resources: authoritative.resources,
        };
      },

      recordEventResultOnlineFirst: async ({ eventId, battleSeed, winner, turns, battleSummary, rewards, source }) => {
        const authoritative = await recordEventResultAuthoritatively({
          eventId,
          battleSeed,
          winner,
          turns,
          battleSummary,
        });

        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return null;
          }

          const won = winner === "ally";
          const today = todayYMD();
          const firstClear = won && get().eventCompletions[eventId] !== today;
          get().recordBattleResult(won, "event");
          if (firstClear) {
            get().awardRewards(rewards, source);
            get().markEventCompleted(eventId);
          }
          return { rewards: firstClear ? rewards : {}, firstClear, authoritative: false };
        }

        if (!authoritative.ok) {
          get().pushNotification("error", authoritative.reason);
          return null;
        }

        set((state) => {
          const rewardedState = applyRewardsToGameState(state, authoritative.rewards);
          return {
            ...rewardedState,
            resources: authoritative.resources,
            battlesWon: authoritative.winner === "ally" ? state.battlesWon + 1 : state.battlesWon,
          };
        });
        if (authoritative.winner === "ally") get().updateMissionProgress("battles_won", 1);
        get().updateMissionProgress("events_played", 1);
        if (authoritative.firstClear) get().markEventCompleted(authoritative.eventId);
        return {
          rewards: authoritative.rewards,
          firstClear: authoritative.firstClear,
          authoritative: true,
          resources: authoritative.resources,
        };
      },

      markAdventureCleared: (levelId) => {
        const plan = planAdventureLevelClear(get().adventureProgress, levelId, localDayKey());
        set({ adventureProgress: plan.adventureProgress });
        if (plan.firstClear) get().updateMissionProgress("adventure_levels_cleared", 1);
        return { firstClear: plan.firstClear };
      },

      claimAdventureBattleResultOnlineFirst: async ({ levelId, battleSeed, winner, turns, battleSummary }) => {
        const level = ADVENTURE_BY_ID[levelId];
        if (!level) {
          get().pushNotification("error", "Adventure node not found");
          return null;
        }

        if (winner === "draw") {
          if (get().accountLinkMode === "linked") {
            get().pushNotification("info", "Draw rewards are not available for linked Adventure sessions yet");
            return { rewards: ADVENTURE_DEFEAT_REWARDS, firstClear: false };
          }
          get().awardRewards(ADVENTURE_DRAW_REWARDS, "Adventure draw");
          return { rewards: ADVENTURE_DRAW_REWARDS, firstClear: false };
        }

        const authoritative = await claimAdventureBattleResultAuthoritatively({
          nodeId: levelId,
          battleSeed,
          winner,
          turns,
          battleSummary,
        });

        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return null;
          }
          if (winner === "ally") {
            const plan = planAdventureLevelClear(get().adventureProgress, levelId, localDayKey());
            const rewards = getFrontlineAdventureVictoryRewards(level, plan.firstClear);
            set({ adventureProgress: plan.adventureProgress });
            if (plan.firstClear) get().updateMissionProgress("adventure_levels_cleared", 1);
            get().awardRewards(rewards, level.name);
            return { rewards, firstClear: plan.firstClear };
          }

          return { rewards: ADVENTURE_DEFEAT_REWARDS, firstClear: false };
        }

        if (!authoritative.ok) {
          get().pushNotification("error", authoritative.reason);
          return null;
        }

        set((st) => {
          const rewardedState = applyRewardsToGameState(st, authoritative.rewards);
          return {
            ...rewardedState,
            resources: authoritative.resources,
            adventureProgress:
              authoritative.winner === "ally"
                ? markAdventureLevelCleared(st.adventureProgress, authoritative.nodeId, {
                    firstClear: authoritative.firstClear,
                    completedAt: localDayKey(),
                  })
                : st.adventureProgress,
          };
        });
        if (authoritative.winner === "ally" && authoritative.firstClear) {
          get().updateMissionProgress("adventure_levels_cleared", 1);
        }
        return {
          rewards: authoritative.rewards,
          firstClear: authoritative.firstClear,
          authoritative: true,
          resources: authoritative.resources,
        };
      },

      claimAdventureNode: (levelId) => {
        const plan = planAdventureNodeClaim(get().adventureProgress, levelId, localDayKey());
        if (!plan.ok) {
          if (plan.notification) get().pushNotification(plan.notification.kind, plan.notification.message);
          return null;
        }
        set({ adventureProgress: plan.adventureProgress });
        get().updateMissionProgress("adventure_levels_cleared", 1);
        get().awardRewards(plan.rewards, plan.source);
        return plan.rewards;
      },

      claimAdventureNodeOnlineFirst: async (levelId) => {
        const authoritative = await claimAdventureNodeRewardAuthoritatively(levelId);
        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return null;
          }
          return get().claimAdventureNode(levelId);
        }

        if (!authoritative.ok) {
          get().pushNotification("error", authoritative.reason);
          return null;
        }

        set((st) => {
          const rewardedState = applyRewardsToGameState(st, authoritative.rewards);
          return {
            ...rewardedState,
            resources: authoritative.resources,
            adventureProgress: markAdventureNodeClaimed(st.adventureProgress, authoritative.nodeId, localDayKey()),
          };
        });
        get().updateMissionProgress("adventure_levels_cleared", 1);
        return authoritative.rewards;
      },

      claimAdventureMapInteraction: (interactionId) => {
        const s = get();
        const plan = createAdventureMapInteractionClaimPlan({
          interactionId,
          progress: s.adventureProgress,
          resources: s.resources,
          claims: s.adventureMapClaims,
          claimedAt: todayISO(),
        });
        if (!plan.ok) {
          get().pushNotification(plan.notification.kind, plan.notification.message);
          return null;
        }
        if (!get().spend({ adventureKeys: plan.interaction.keyCost })) {
          get().pushNotification("error", "Adventure key required");
          return null;
        }
        set({ adventureMapClaims: plan.nextClaims });
        get().awardRewards(plan.result.rewards, plan.interaction.title);
        return plan.result;
      },

      claimAdventureMapInteractionOnlineFirst: async (interactionId) => {
        const authoritative = await openAdventureMapInteractionAuthoritatively(interactionId);
        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return null;
          }
          return get().claimAdventureMapInteraction(interactionId);
        }

        if (!authoritative.ok) {
          get().pushNotification("error", authoritative.reason);
          return null;
        }

        set((st) => {
          const rewardedState = applyRewardsToGameState(st, authoritative.result.rewards);
          return {
            ...rewardedState,
            resources: authoritative.resources,
            adventureMapClaims: {
              ...st.adventureMapClaims,
              [interactionId]: {
                claimed: true,
                claimedAt: todayISO(),
                lootId: authoritative.result.lootId,
                lootTier: authoritative.result.lootTier,
                lootTitle: authoritative.result.lootTitle,
                rewards: authoritative.result.rewards,
                resetAvailableAt: authoritative.resetAvailableAt ?? undefined,
              },
            },
          };
        });
        return authoritative.result;
      },

      claimMission: (missionId) => {
        get().ensureMissionsInitialized();
        const result = claimMissionProgress(get().missionsProgress, ALL_MISSIONS, missionId);
        if (!result) return null;
        set({ missionsProgress: result.missionsProgress });
        get().awardRewards(result.rewards, result.source);
        return result.rewards;
      },

      claimMissionOnlineFirst: async (missionId) => {
        get().ensureMissionsInitialized();
        const mission = ALL_MISSIONS.find((entry) => entry.id === missionId);
        if (!mission) return null;

        const plan = getMissionAuthoritativeClaimPlan(mission);
        if (!plan.ok) {
          if (get().accountLinkMode === "linked") {
            get().pushNotification("error", "Mission requires server validation");
            return null;
          }
          return get().claimMission(missionId);
        }

        const authoritative = await claimMissionAuthoritatively(missionId, plan.cycleKey);
        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return null;
          }
          return get().claimMission(missionId);
        }

        if (!authoritative.ok) {
          get().pushNotification("error", authoritative.reason);
          return null;
        }

        set((st) => {
          const current = st.missionsProgress[missionId];
          const rewardedState = applyRewardsToGameState(st, authoritative.rewards);
          return {
            ...rewardedState,
            resources: authoritative.resources,
            missionsProgress: {
              ...st.missionsProgress,
              [missionId]: {
                progress: current?.progress ?? mission.goal,
                resetAt: current?.resetAt ?? getMissionResetAt(mission.kind),
                claimed: true,
              },
            },
          };
        });
        get().pushNotification("success", `Rewards from mission ${mission.name}`);
        return authoritative.rewards;
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

      purchaseOfferOnlineFirst: async (offerId) => {
        get().refreshShopIfNeeded();
        const offer = SHOP_OFFERS_BY_ID[offerId];
        if (!offer) return { ok: false, reason: "Offer not found" };

        const authoritative = await purchaseShopOfferAuthoritatively(offerId);
        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return { ok: false, reason: authoritative.reason, authoritative: true };
          }
          return get().purchaseOffer(offerId);
        }

        if (!authoritative.ok) {
          return { ok: false, reason: authoritative.reason, authoritative: true };
        }

        set((st) => ({
          ...applyShopOfferPurchase(st, offerId),
          resources: authoritative.resources,
        }));
        if (authoritative.requiresSnapshotRefresh) {
          await get().loadServerSnapshotOnlineFirst();
        }
        return { ok: true, authoritative: true };
      },

      pushNotification: (kind, message) => {
        const id = createNotificationId();
        set((s) => ({ notifications: addNotificationState(s.notifications, kind, message, id) }));
        if (typeof window !== "undefined") {
          setTimeout(() => get().dismissNotification(id), 3500);
        }
      },

      dismissNotification: (id) =>
        set((s) => ({ notifications: dismissNotificationState(s.notifications, id) })),

      nextSeed: () => {
        const next = nextStoreSeed(get().lastSeed);
        set({ lastSeed: next });
        return next;
      },

      ensureMissionsInitialized: () => {
        const missionsProgress = ensureMissionProgress(get().missionsProgress, ALL_MISSIONS);
        if (missionsProgress) set({ missionsProgress });
      },

      saveBattle: (levelId, state) => set(saveBattleState(levelId, state)),

      clearSavedBattle: () => set({ savedBattle: null }),

      claimDailyLogin: () => {
        const result = claimDailyLoginReward(get().dailyLogin, DAILY_LOGIN);
        if (!result) return null;
        set(result.patch);
        get().awardRewards(result.rewards, result.source);
        return result.rewards;
      },

      claimDailyLoginOnlineFirst: async () => {
        const authoritative = await claimDailyLoginAuthoritatively(localDayKey());
        if (authoritative.mode === "local") {
          if (blockLocalAuthoritativeFallbackIfNeeded(authoritative.reason, set, get)) {
            return null;
          }
          return get().claimDailyLogin();
        }

        if (!authoritative.ok) {
          get().pushNotification("error", authoritative.reason);
          return null;
        }

        set((st) => {
          const rewardedState = applyRewardsToGameState(st, authoritative.rewards);
          return {
            ...rewardedState,
            resources: authoritative.resources,
            dailyLogin: {
              streak: authoritative.streak,
              lastClaim: authoritative.dayKey,
            },
          };
        });
        get().pushNotification("success", "Daily reward claimed");
        return authoritative.rewards;
      },

      claimRoadmapStep: (id) => {
        if (get().accountLinkMode === "linked") {
          get().pushNotification("error", "Roadmap rewards require server validation");
          return null;
        }
        const s = get();
        const step = ROADMAP.find((r) => r.id === id);
        const result = claimRoadmapReward(s.roadmapClaimed, step, step ? isRoadmapStepComplete(s, step) : false);
        if (!result) return null;
        set(result.patch);
        get().awardRewards(result.rewards, result.source);
        return result.rewards;
      },

      claimMilestone: (level) => {
        if (get().accountLinkMode === "linked") {
          get().pushNotification("error", "Milestone rewards require server validation");
          return null;
        }
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
        set((st) => markEventCompletedState({ eventCompletions: st.eventCompletions, eventsPlayed: st.eventsPlayed, eventId, today }));
      },

      refreshShopIfNeeded: () => {
        const s = get();
        const today = todayYMD();
        const patch = refreshShopState(s.shopRefreshedAt, today);
        if (patch) set(patch);
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
      syncLocalSnapshotOnlineFirst: async () => {
        const result = await syncLocalSnapshotAuthoritatively(
          LOCAL_SYNC_SNAPSHOT_VERSION,
          createLocalSyncSnapshot(get()),
        );

        if (!result.ok) {
          return {
            ok: false,
            reason: result.reason,
            authoritative: result.mode === "authoritative",
          };
        }

        const normalized = result.normalizedSnapshot;
        set((state) => ({
          account: {
            ...state.account,
            ...(normalized.account ?? {}),
          },
          resources: {
            ...state.resources,
            ...(normalized.resources ?? {}),
          },
          frontlineLoadout: normalized.frontlineLoadout ?? state.frontlineLoadout,
          accountLinkMode: "linked",
        }));

        return { ok: true, authoritative: true };
      },
      loadServerSnapshotOnlineFirst: async () => {
        const result = await loadServerPlayerSnapshot();
        if (!result.ok) {
          if (
            blockLocalAuthoritativeFallbackIfNeeded(
              result.reason === "unauthenticated" ? "missing_session" : result.reason,
              set,
              get,
            )
          ) {
            return { ok: false, reason: result.reason, authoritative: true };
          }
          return { ok: false, reason: result.reason, authoritative: result.reason !== "unconfigured" };
        }

        set((state) => createServerPlayerSnapshotPatch(state, result.result));
        return { ok: true, authoritative: true };
      },
      setOnboardingStep: (step) =>
        set((st) => ({ onboarding: setOnboardingStepState(st.onboarding, step) })),
      completeOnboarding: () =>
        set({ onboarding: completeOnboardingState() }),
      markIntroSeen: () => set({ hasSeenIntro: true }),
      resetIntro: () => set({ hasSeenIntro: false }),
      setAccountLinkMode: (mode) => set({ accountLinkMode: mode }),
      ackPendingUnlock: () => set({ pendingUnlockLevel: null }),

      refreshArenaTicketsIfNeeded: () => {
        const s = get();
        const today = todayYMD();
        const patch = refreshArenaTicketsState({ arenaTicketsRefreshedAt: s.arenaTicketsRefreshedAt, resources: s.resources, today, dailyArenaTickets: DAILY_ARENA_TICKETS });
        if (patch) set(patch);
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

/** True when the event's last completion matches today (YMD), locked until rotation. */
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
