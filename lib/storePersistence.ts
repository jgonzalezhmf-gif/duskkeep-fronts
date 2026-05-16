import { createJSONStorage, type PersistOptions } from "zustand/middleware";
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
export const GAME_STORE_PERSIST_VERSION = 6;

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

export const gameStorePersistOptions: PersistOptions<GameStoreShape, PersistedGameStoreShape> = {
  name: GAME_STORE_STORAGE_NAME,
  storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : noopStorage)),
  partialize: createPersistedGameStoreState,
  onRehydrateStorage: () => (state) => {
    state?.hydrate();
  },
  // Merge persisted data on top of defaults so new fields appear automatically on upgrade without wiping.
  merge: mergePersistedGameState,
  version: GAME_STORE_PERSIST_VERSION,
};
