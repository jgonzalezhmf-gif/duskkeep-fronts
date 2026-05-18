import { createJSONStorage, type PersistOptions } from "zustand/middleware";
import { createDefaultLadderState } from "@/features/ladder/data";
import {
  isServerAuthoritativePersistenceEnabled,
  mergePersistedGameState,
} from "@/lib/persistedGameState";
import type { GameActions, GameState } from "@/lib/storeTypes";

type GameStoreShape = GameState & GameActions;
type PersistedGameStoreShape = Partial<GameStoreShape>;

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
} as unknown as Storage;

export const GAME_STORE_STORAGE_NAME = "duskkeep-fronts:player:v1";
export const GAME_STORE_PERSIST_VERSION = 7;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createPersistedGameStoreState(state: GameState): PersistedGameStoreShape {
  if (isServerAuthoritativePersistenceEnabled()) {
    return {
      audioMuted: state.audioMuted,
      musicVolume: state.musicVolume,
      sfxVolume: state.sfxVolume,
      language: state.language,
      reducedMotion: state.reducedMotion,
      visualEffects: state.visualEffects,
      textScale: state.textScale,
      onboarding: state.onboarding,
      hasSeenIntro: state.hasSeenIntro,
      accountLinkMode: state.accountLinkMode,
    };
  }

  const { notifications, hydrated, ...rest } = state;
  return rest;
}

export function migratePersistedGameStoreState(
  persistedState: unknown,
  persistedVersion: number,
): PersistedGameStoreShape {
  if (!isRecord(persistedState)) {
    return {};
  }

  if (persistedVersion < 7 && !isRecord(persistedState.ladder)) {
    return {
      ...persistedState,
      ladder: createDefaultLadderState(),
    } as PersistedGameStoreShape;
  }

  return persistedState as PersistedGameStoreShape;
}

export const gameStorePersistOptions: PersistOptions<GameStoreShape, PersistedGameStoreShape> = {
  name: GAME_STORE_STORAGE_NAME,
  storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : noopStorage)),
  partialize: createPersistedGameStoreState,
  migrate: migratePersistedGameStoreState,
  onRehydrateStorage: () => (state) => {
    state?.hydrate();
  },
  // Merge persisted data on top of defaults so new fields appear automatically on upgrade without wiping.
  merge: mergePersistedGameState,
  version: GAME_STORE_PERSIST_VERSION,
};
