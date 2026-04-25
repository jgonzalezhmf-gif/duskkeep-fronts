// Account-level unlock table.
// Consumed by: home (next unlock banner), roster (locked hero reasons),
// events (gate), shop (category gate), LevelUpModal (what's new).

export type UnlockKind =
  | "hero"
  | "event"
  | "chapter"
  | "shop_section"
  | "feature";

export type Unlock = {
  level: number;
  kind: UnlockKind;
  id: string; // hero id, event id, "chapter_2", shop section id, feature id
  label: string;
  detail?: string;
};

export const UNLOCKS: Unlock[] = [
  { level: 2, kind: "feature", id: "missions", label: "Daily Missions", detail: "Earn recurring rewards" },
  { level: 3, kind: "feature", id: "arena_t1", label: "Arena Tier 1", detail: "Fight other commanders" },
  { level: 3, kind: "shop_section", id: "daily", label: "Daily Shop", detail: "Rotating daily offers" },
  { level: 4, kind: "hero", id: "ursa", label: "Ursa Stoneheart", detail: "Wild tank joins the pool" },
  { level: 4, kind: "event", id: "gold_rush", label: "Gold Rush Event", detail: "Quick gold farm event" },
  { level: 5, kind: "feature", id: "shop_refresh", label: "Shop Refresh", detail: "Daily offers rotate" },
  { level: 6, kind: "chapter", id: "chapter_2", label: "Chapter 2: Ashes of the Pact", detail: "New campaign zone" },
  { level: 6, kind: "event", id: "tower_defense_1", label: "Fortress Siege (Tower Defense)", detail: "Defend the keep" },
  { level: 7, kind: "shop_section", id: "shards", label: "Shard Market", detail: "Buy hero shards directly" },
  { level: 8, kind: "event", id: "arcane_surge", label: "Arcane Surge Event", detail: "Harvest arcane dust" },
  { level: 8, kind: "hero", id: "fenra", label: "Fenra Wolfcaller", detail: "Pack tactics summoner" },
  { level: 10, kind: "feature", id: "arena_t2", label: "Arena Tier 2", detail: "Higher stakes arena" },
  { level: 10, kind: "shop_section", id: "legendary_kits", label: "Legendary Summon Kits" },
  { level: 12, kind: "hero", id: "grom", label: "Grom the Wrathful", detail: "Earthcleave bruiser" },
  { level: 15, kind: "hero", id: "sol", label: "Sol the Radiant", detail: "Legendary support" },
  { level: 18, kind: "hero", id: "noct", label: "Noct the Eclipse", detail: "Legendary DPS/AOE" },
];

export const UNLOCKS_BY_LEVEL: Record<number, Unlock[]> = (() => {
  const m: Record<number, Unlock[]> = {};
  for (const u of UNLOCKS) (m[u.level] ??= []).push(u);
  return m;
})();

export function unlocksAt(level: number): Unlock[] {
  return UNLOCKS_BY_LEVEL[level] ?? [];
}

export function isHeroUnlockedByLevel(heroId: string, accountLevel: number): boolean {
  const req = UNLOCKS.find((u) => u.kind === "hero" && u.id === heroId);
  if (!req) return true; // heroes without a gate are free to collect
  return accountLevel >= req.level;
}

export function heroUnlockLevel(heroId: string): number | null {
  return UNLOCKS.find((u) => u.kind === "hero" && u.id === heroId)?.level ?? null;
}

export function isEventUnlockedByLevel(eventId: string, accountLevel: number): boolean {
  const req = UNLOCKS.find((u) => u.kind === "event" && u.id === eventId);
  if (!req) return true;
  return accountLevel >= req.level;
}

export function eventUnlockLevel(eventId: string): number | null {
  return UNLOCKS.find((u) => u.kind === "event" && u.id === eventId)?.level ?? null;
}

export function isShopSectionUnlocked(section: string, accountLevel: number): boolean {
  const req = UNLOCKS.find((u) => u.kind === "shop_section" && u.id === section);
  if (!req) return true;
  return accountLevel >= req.level;
}

export function nextUpcomingUnlock(level: number): Unlock | null {
  return UNLOCKS.find((u) => u.level > level) ?? null;
}
