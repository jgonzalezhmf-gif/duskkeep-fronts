import type { ShopOffer } from "@/lib/types";

export type ShopCategory = "featured" | "daily" | "resources" | "shards" | "consumables";

export type ExtendedShopOffer = ShopOffer & {
  category: ShopCategory;
  /** Per-rotation limit. If set, the offer disappears once bought N times until next daily refresh. */
  dailyLimit?: number;
  /** Marked as a burning "hot" deal. */
  hot?: boolean;
  /** Value ratio tag, purely cosmetic. */
  valueTag?: string;
  /** Product-facing intent for the current Frontline economy. */
  productLine?: "frontline" | "fortress" | "arena" | "hero" | "resource";
  /** Visual preview hooks. These do not grant cards yet; rewards remain in `contents`. */
  previewCards?: string[];
  previewHeroes?: string[];
};

export const SHOP_OFFERS: ExtendedShopOffer[] = [
  // ---------- Featured ----------
  {
    id: "frontline_starter_cache",
    category: "featured",
    name: "Frontline Starter Cache",
    description: "A one-time launch cache for Command upgrades, early hero growth and first Arena runs.",
    emoji: "cache",
    cost: { gems: 0 },
    oneTime: true,
    hot: true,
    valueTag: "BEST VALUE",
    productLine: "frontline",
    previewCards: ["order_guard_wall", "order_twin_slash", "summon_wolf"],
    previewHeroes: ["bran", "kara", "mira"],
    contents: {
      gold: 1000,
      dust: 200,
      gems: 50,
      arenaTickets: 2,
      shards: [
        { heroId: "bran", amount: 6 },
        { heroId: "kara", amount: 6 },
        { heroId: "mira", amount: 6 },
      ],
    },
  },
  {
    id: "command_spellforge_bundle",
    category: "featured",
    name: "Command Spellforge Bundle",
    description: "Dust and account progress staged for future card upgrades, command tuning and build experimentation.",
    emoji: "spellforge",
    cost: { gems: 120 },
    hot: true,
    valueTag: "CARD PREP",
    productLine: "frontline",
    previewCards: ["tactic_battle_hymn", "tactic_sanctuary", "tactic_core_burst"],
    contents: { dust: 650, accountXp: 35, gold: 500 },
  },
  {
    id: "fortress_supply_writ",
    category: "featured",
    name: "Fortress Supply Writ",
    description: "A practical upgrade shipment for Keep, Treasury and Barracks progression.",
    emoji: "fortress",
    cost: { gems: 90 },
    valueTag: "FORTRESS",
    productLine: "fortress",
    previewHeroes: ["bran", "tovi", "mira"],
    contents: { gold: 1800, dust: 120, accountXp: 15 },
  },

  // ---------- Daily ----------
  {
    id: "daily_raid_payout",
    category: "daily",
    name: "Raid Payout Advance",
    description: "A small daily cash injection for upgrades when Fortress income is not ready yet.",
    emoji: "gold",
    cost: { gems: 20 },
    dailyLimit: 2,
    valueTag: "DAILY",
    productLine: "fortress",
    contents: { gold: 450, dust: 35 },
  },
  {
    id: "daily_command_drill",
    category: "daily",
    name: "Command Drill",
    description: "A quick training packet for account and hero progress.",
    emoji: "drill",
    cost: { gold: 350 },
    dailyLimit: 3,
    productLine: "frontline",
    previewCards: ["order_focus_fire", "tactic_smokescreen"],
    contents: { xp: 70, accountXp: 8 },
  },
  {
    id: "daily_arena_tickets",
    category: "daily",
    name: "Arena Entry Writs",
    description: "Refill Arena entries for another ladder push.",
    emoji: "tickets",
    cost: { gems: 30 },
    dailyLimit: 1,
    productLine: "arena",
    contents: { arenaTickets: 3 },
  },

  // ---------- Resources ----------
  {
    id: "keep_construction_chest",
    category: "resources",
    name: "Keep Construction Chest",
    description: "Bulk gold for Fortress upgrades, Adventure prep and early account momentum.",
    emoji: "gold",
    cost: { gems: 100 },
    valueTag: "UPGRADE",
    productLine: "resource",
    contents: { gold: 2200 },
  },
  {
    id: "arcane_ink_crate",
    category: "resources",
    name: "Arcane Ink Crate",
    description: "Dust stock for future card evolution, hero tuning and event preparation.",
    emoji: "dust",
    cost: { gems: 80 },
    valueTag: "CRAFTING",
    productLine: "frontline",
    previewCards: ["tactic_sanctuary", "summon_barrier"],
    contents: { dust: 540 },
  },
  {
    id: "mixed_command_supplies",
    category: "resources",
    name: "Mixed Command Supplies",
    description: "A balanced stock of gold, dust and small account progress for flexible early spending.",
    emoji: "supplies",
    cost: { gems: 130 },
    valueTag: "BALANCED",
    productLine: "resource",
    contents: { gold: 1300, dust: 260, accountXp: 15 },
  },

  // ---------- Consumables ----------
  {
    id: "battlefield_training_token",
    category: "consumables",
    name: "Battlefield Training Token",
    description: "Hero XP and account XP for pushing your active trio forward.",
    emoji: "training",
    cost: { gold: 800 },
    dailyLimit: 2,
    valueTag: "TRAINING",
    productLine: "frontline",
    previewHeroes: ["kara", "drak", "vex"],
    contents: { xp: 140, accountXp: 10 },
  },
  {
    id: "arena_push_kit",
    category: "consumables",
    name: "Arena Push Kit",
    description: "Tickets and resources for a short Arena session.",
    emoji: "arena",
    cost: { gems: 55 },
    dailyLimit: 1,
    valueTag: "LADDER",
    productLine: "arena",
    contents: { arenaTickets: 4, gold: 350 },
  },

  // ---------- Shards ----------
  {
    id: "shard_bran_pack",
    category: "shards",
    name: "Bran Wallguard Shards",
    description: "Shards for the anchor tank. Good for Fortress defense identity and safer fronts.",
    emoji: "bran",
    cost: { gold: 1000 },
    dailyLimit: 1,
    valueTag: "TANK",
    productLine: "hero",
    previewHeroes: ["bran"],
    contents: { shards: [{ heroId: "bran", amount: 5 }] },
  },
  {
    id: "shard_kara_pack",
    category: "shards",
    name: "Kara Blade Shards",
    description: "Shards for the center striker. Good for early pressure and faster clashes.",
    emoji: "kara",
    cost: { gold: 1200 },
    dailyLimit: 1,
    valueTag: "STRIKER",
    productLine: "hero",
    previewHeroes: ["kara"],
    contents: { shards: [{ heroId: "kara", amount: 5 }] },
  },
  {
    id: "shard_mira_pack",
    category: "shards",
    name: "Mira Sanctuary Shards",
    description: "Shards for the healer. Good for sustain builds and safer raid recovery.",
    emoji: "mira",
    cost: { gems: 38 },
    dailyLimit: 1,
    valueTag: "HEALER",
    productLine: "hero",
    previewHeroes: ["mira"],
    contents: { shards: [{ heroId: "mira", amount: 5 }] },
  },
  {
    id: "shard_vex_pack",
    category: "shards",
    name: "Vex Breach Shards",
    description: "Shards for the archer. Good for breach pressure and aggressive builds.",
    emoji: "vex",
    cost: { gems: 42 },
    dailyLimit: 1,
    valueTag: "BREACH",
    productLine: "hero",
    previewHeroes: ["vex"],
    contents: { shards: [{ heroId: "vex", amount: 5 }] },
  },
  {
    id: "shard_drak_pack",
    category: "shards",
    name: "Drak Finisher Shards",
    description: "Shards for the execution finisher. Good for high-tempo kill turns.",
    emoji: "drak",
    cost: { gems: 45 },
    dailyLimit: 1,
    valueTag: "FINISHER",
    productLine: "hero",
    previewHeroes: ["drak"],
    contents: { shards: [{ heroId: "drak", amount: 5 }] },
  },
  {
    id: "shard_tovi_pack",
    category: "shards",
    name: "Tovi War-Chant Shards",
    description: "Shards for the support chanter. Good for squad-wide tempo plans.",
    emoji: "tovi",
    cost: { gems: 40 },
    dailyLimit: 1,
    valueTag: "SUPPORT",
    productLine: "hero",
    previewHeroes: ["tovi"],
    contents: { shards: [{ heroId: "tovi", amount: 5 }] },
  },
];

export const SHOP_OFFERS_BY_ID: Record<string, ExtendedShopOffer> = Object.fromEntries(
  SHOP_OFFERS.map((offer) => [offer.id, offer]),
);

export const SHOP_CATEGORIES: { id: ShopCategory; label: string; icon: string }[] = [
  { id: "featured", label: "Featured", icon: "offers" },
  { id: "daily", label: "Daily", icon: "rewards" },
  { id: "resources", label: "Resources", icon: "gold" },
  { id: "shards", label: "Shards", icon: "heroes" },
  { id: "consumables", label: "Boosts", icon: "power" },
];

export const SHOP_CATEGORY_UNLOCK_LEVEL: Partial<Record<ShopCategory, number>> = {
  featured: 1,
  resources: 1,
  consumables: 1,
  daily: 3,
  shards: 7,
};
