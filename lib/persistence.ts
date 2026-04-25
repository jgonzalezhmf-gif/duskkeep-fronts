// Persistence abstraction. Default backend is "local" (localStorage).
// Supabase backend is wired but inactive unless NEXT_PUBLIC_PERSISTENCE=supabase
// AND credentials are present. The Zustand store consumes only this interface,
// so swapping later is a 1-line change.

import type { AccountState, FortressState, MissionProgress, PlayerHero, Resources } from "./types";

export type PersistedState = {
  account: AccountState;
  resources: Resources;
  heroes: PlayerHero[];
  team: (string | null)[]; // hero ids in slots
  activeDeck: (string | null)[];
  activeLeaderId: string;
  knownSpellIds: string[];
  fortress: FortressState;
  adventureProgress: Record<string, { cleared: boolean; firstClearTaken: boolean }>;
  missionsProgress: Record<string, MissionProgress>;
  arenaWins: number;
  arenaLosses: number;
  shopPurchases: Record<string, number>;
  eventsPlayed: Record<string, number>;
  battlesWon: number;
  heroesUpgraded: number;
  lastSeed: number;
};

const STORAGE_KEY = "duskkeep-fronts:player:v1";

export interface PersistenceBackend {
  load(): Promise<PersistedState | null>;
  save(state: PersistedState): Promise<void>;
  clear(): Promise<void>;
}

class LocalBackend implements PersistenceBackend {
  async load() {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PersistedState;
    } catch {
      return null;
    }
  }
  async save(state: PersistedState) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  async clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

// Stub Supabase backend — selected when NEXT_PUBLIC_PERSISTENCE=supabase.
// Falls back to local if creds absent. Real queries can be plugged in here
// against the schema in /supabase/schema.sql.
class SupabaseBackend implements PersistenceBackend {
  private fallback = new LocalBackend();
  async load() {
    return this.fallback.load();
  }
  async save(s: PersistedState) {
    return this.fallback.save(s);
  }
  async clear() {
    return this.fallback.clear();
  }
}

export function getBackend(): PersistenceBackend {
  const mode = process.env.NEXT_PUBLIC_PERSISTENCE;
  if (mode === "supabase") return new SupabaseBackend();
  return new LocalBackend();
}
