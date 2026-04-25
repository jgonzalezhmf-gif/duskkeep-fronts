import type { GlyphKind } from "@/components/ui/GameGlyph";

export type GameAssetIconCategory = "resources" | "nav" | "combat" | "cards" | "fortress" | "progression" | "status" | "shop";
export type GameAssetIconSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ResourceAssetIconName = "gold" | "gems" | "gem" | "dust" | "shards" | "tickets" | "command";
export type NavAssetIconName =
  | "adventure"
  | "deck"
  | "heroes"
  | "fortress"
  | "arena"
  | "market"
  | "shop"
  | "events"
  | "quests"
  | "missions"
  | "battle_pass"
  | "pass";
export type CombatAssetIconName =
  | "core"
  | "breach"
  | "clash"
  | "attack"
  | "shield"
  | "heal"
  | "stun"
  | "summon"
  | "target"
  | "leader_power"
  | "danger"
  | "advantage";
export type CardAssetIconName = "order" | "tactic" | "summon" | "gear" | "signature" | "relic";
export type FortressAssetIconName =
  | "keep"
  | "treasury"
  | "barracks"
  | "integrity"
  | "defense_rating"
  | "raid"
  | "repair"
  | "garrison"
  | "watchtower";
export type ProgressionAssetIconName =
  | "upgrade"
  | "evolve"
  | "star"
  | "unlock"
  | "claim"
  | "level_up"
  | "tier_up"
  | "reward_chest";
export type StatusAssetIconName =
  | "buff"
  | "debuff"
  | "poison"
  | "burn"
  | "freeze"
  | "silence"
  | "guard"
  | "rush"
  | "bleed"
  | "curse"
  | "regen"
  | "armor_break";
export type ShopAssetIconName =
  | "daily_offer"
  | "bundle"
  | "hot_deal"
  | "best_value"
  | "limited_time"
  | "owned"
  | "sold_out"
  | "refresh"
  | "premium_pack"
  | "free_claim"
  | "featured"
  | "discount";

export type GameAssetIconName =
  | ResourceAssetIconName
  | NavAssetIconName
  | CombatAssetIconName
  | CardAssetIconName
  | FortressAssetIconName
  | ProgressionAssetIconName
  | StatusAssetIconName
  | ShopAssetIconName;

const RESOURCE_ROOT = "/assets/icons/resources";
const NAV_ROOT = "/assets/icons/nav";
const COMBAT_ROOT = "/assets/icons/combat";
const CARD_ROOT = "/assets/icons/cards";
const FORTRESS_ROOT = "/assets/icons/fortress";
const PROGRESSION_ROOT = "/assets/icons/progression";
const STATUS_ROOT = "/assets/icons/status";

// Explicit manifest. Only assets registered here are requested by the browser.
export const GAME_ICON_ASSET_MANIFEST = {
  resources: {
    gold: `${RESOURCE_ROOT}/gold.png`,
    gems: `${RESOURCE_ROOT}/gems.png`,
    gem: `${RESOURCE_ROOT}/gems.png`,
    dust: `${RESOURCE_ROOT}/dust.png`,
    shards: `${RESOURCE_ROOT}/shards.png`,
    tickets: `${RESOURCE_ROOT}/tickets.png`,
    command: `${RESOURCE_ROOT}/command.png`,
  },
  nav: {
    adventure: `${NAV_ROOT}/adventure.png`,
    deck: `${NAV_ROOT}/deck.png`,
    heroes: `${NAV_ROOT}/heroes.png`,
    fortress: `${NAV_ROOT}/fortress.png`,
    arena: `${NAV_ROOT}/arena.png`,
    market: `${NAV_ROOT}/market.png`,
    shop: `${NAV_ROOT}/market.png`,
    events: `${NAV_ROOT}/events.png`,
    quests: `${NAV_ROOT}/quests.png`,
    missions: `${NAV_ROOT}/quests.png`,
    battle_pass: `${NAV_ROOT}/battle_pass.png`,
    pass: `${NAV_ROOT}/battle_pass.png`,
  },
  combat: {
    core: `${COMBAT_ROOT}/core.png`,
    breach: `${COMBAT_ROOT}/breach.png`,
    // clash.png is not present yet; it intentionally falls back to GameGlyph.
    attack: `${COMBAT_ROOT}/attack.png`,
    shield: `${COMBAT_ROOT}/shield.png`,
    heal: `${COMBAT_ROOT}/heal.png`,
    stun: `${COMBAT_ROOT}/stun.png`,
    summon: `${COMBAT_ROOT}/summon.png`,
    target: `${COMBAT_ROOT}/target.png`,
    leader_power: `${COMBAT_ROOT}/leader_power.png`,
    danger: `${COMBAT_ROOT}/danger.png`,
    advantage: `${COMBAT_ROOT}/advantage.png`,
  },
  cards: {
    order: `${CARD_ROOT}/order.png`,
    tactic: `${CARD_ROOT}/tactic.png`,
    summon: `${CARD_ROOT}/summon.png`,
    gear: `${CARD_ROOT}/gear.png`,
    signature: `${CARD_ROOT}/signature.png`,
    relic: `${CARD_ROOT}/relic.png`,
  },
  fortress: {
    keep: `${FORTRESS_ROOT}/keep.png`,
    treasury: `${FORTRESS_ROOT}/treasury.png`,
    barracks: `${FORTRESS_ROOT}/barracks.png`,
    integrity: `${FORTRESS_ROOT}/integrity.png`,
    defense_rating: `${FORTRESS_ROOT}/defense_rating.png`,
    raid: `${FORTRESS_ROOT}/raid.png`,
    repair: `${FORTRESS_ROOT}/repair.png`,
    garrison: `${FORTRESS_ROOT}/garrison.png`,
    watchtower: `${FORTRESS_ROOT}/watchtower.png`,
  },
  progression: {
    upgrade: `${PROGRESSION_ROOT}/upgrade.png`,
    // evolve.png is not present yet; it intentionally falls back to GameGlyph.
    star: `${PROGRESSION_ROOT}/star.png`,
    unlock: `${PROGRESSION_ROOT}/unlock.png`,
    claim: `${PROGRESSION_ROOT}/claim.png`,
    level_up: `${PROGRESSION_ROOT}/level_up.png`,
    tier_up: `${PROGRESSION_ROOT}/tier_up.png`,
    reward_chest: `${PROGRESSION_ROOT}/reward_chest.png`,
  },
  status: {
    buff: `${STATUS_ROOT}/buff.png`,
    debuff: `${STATUS_ROOT}/debuff.png`,
    poison: `${STATUS_ROOT}/poison.png`,
    burn: `${STATUS_ROOT}/burn.png`,
    freeze: `${STATUS_ROOT}/freeze.png`,
    silence: `${STATUS_ROOT}/silence.png`,
    guard: `${STATUS_ROOT}/guard.png`,
    rush: `${STATUS_ROOT}/rush.png`,
    bleed: `${STATUS_ROOT}/bleed.png`,
    curse: `${STATUS_ROOT}/curse.png`,
    regen: `${STATUS_ROOT}/regen.png`,
    armor_break: `${STATUS_ROOT}/armor_break.png`,
  },
  shop: {
    daily_offer: "/assets/icons/shop/daily_offer.png",
    bundle: "/assets/icons/shop/bundle.png",
    hot_deal: "/assets/icons/shop/hot_deal.png",
    best_value: "/assets/icons/shop/best_value.png",
    limited_time: "/assets/icons/shop/limited_time.png",
    owned: "/assets/icons/shop/owned.png",
    sold_out: "/assets/icons/shop/sold_out.png",
    refresh: "/assets/icons/shop/refresh.png",
    premium_pack: "/assets/icons/shop/premium_pack.png",
    free_claim: "/assets/icons/shop/free_claim.png",
    featured: "/assets/icons/shop/featured.png",
    discount: "/assets/icons/shop/discount.png",
  },
} as const satisfies Record<GameAssetIconCategory, Partial<Record<GameAssetIconName, string>>>;

export const GAME_ASSET_ICON_FALLBACK_GLYPH: Record<GameAssetIconName, GlyphKind> = {
  gold: "gold",
  gems: "gem",
  gem: "gem",
  dust: "dust",
  shards: "heroes",
  tickets: "tickets",
  command: "power",
  adventure: "adventure",
  deck: "deck",
  heroes: "heroes",
  fortress: "fortress",
  arena: "arena",
  market: "market",
  shop: "market",
  events: "events",
  quests: "quests",
  missions: "quests",
  battle_pass: "pass",
  pass: "pass",
  core: "battle",
  breach: "attack",
  clash: "battle",
  attack: "attack",
  shield: "shield",
  heal: "heal",
  stun: "power",
  summon: "heroes",
  target: "skill",
  leader_power: "power",
  danger: "shield",
  advantage: "rewards",
  order: "attack",
  tactic: "skill",
  gear: "shield",
  signature: "power",
  relic: "rewards",
  keep: "fortress",
  treasury: "gold",
  barracks: "heroes",
  integrity: "shield",
  defense_rating: "shield",
  raid: "battle",
  repair: "heal",
  garrison: "heroes",
  watchtower: "fortress",
  upgrade: "power",
  evolve: "skill",
  star: "rewards",
  unlock: "skill",
  claim: "rewards",
  level_up: "power",
  tier_up: "rewards",
  reward_chest: "rewards",
  buff: "power",
  debuff: "skill",
  poison: "skill",
  burn: "attack",
  freeze: "skill",
  silence: "power",
  guard: "shield",
  rush: "attack",
  bleed: "attack",
  curse: "skill",
  regen: "heal",
  armor_break: "shield",
  daily_offer: "offers",
  bundle: "rewards",
  hot_deal: "market",
  best_value: "rewards",
  limited_time: "events",
  owned: "skill",
  sold_out: "shield",
  refresh: "power",
  premium_pack: "pass",
  free_claim: "rewards",
  featured: "offers",
  discount: "gold",
};

export function getGameAssetIconSrc(category: GameAssetIconCategory, name: GameAssetIconName) {
  const categoryManifest = GAME_ICON_ASSET_MANIFEST[category] as Partial<Record<GameAssetIconName, string>>;
  return categoryManifest[name] ?? null;
}

export function isResourceAssetIconName(name: string): name is ResourceAssetIconName {
  return name === "gold" || name === "gems" || name === "gem" || name === "dust" || name === "shards" || name === "tickets" || name === "command";
}

export function isNavAssetIconName(name: string): name is NavAssetIconName {
  return (
    name === "adventure" ||
    name === "deck" ||
    name === "heroes" ||
    name === "fortress" ||
    name === "arena" ||
    name === "market" ||
    name === "shop" ||
    name === "events" ||
    name === "quests" ||
    name === "missions" ||
    name === "battle_pass" ||
    name === "pass"
  );
}

export function isCombatAssetIconName(name: string): name is CombatAssetIconName {
  return (
    name === "core" ||
    name === "breach" ||
    name === "clash" ||
    name === "attack" ||
    name === "shield" ||
    name === "heal" ||
    name === "stun" ||
    name === "summon" ||
    name === "target" ||
    name === "leader_power" ||
    name === "danger" ||
    name === "advantage"
  );
}

export function isCardAssetIconName(name: string): name is CardAssetIconName {
  return name === "order" || name === "tactic" || name === "summon" || name === "gear" || name === "signature" || name === "relic";
}

export function isFortressAssetIconName(name: string): name is FortressAssetIconName {
  return (
    name === "keep" ||
    name === "treasury" ||
    name === "barracks" ||
    name === "integrity" ||
    name === "defense_rating" ||
    name === "raid" ||
    name === "repair" ||
    name === "garrison" ||
    name === "watchtower"
  );
}

export function isProgressionAssetIconName(name: string): name is ProgressionAssetIconName {
  return (
    name === "upgrade" ||
    name === "evolve" ||
    name === "star" ||
    name === "unlock" ||
    name === "claim" ||
    name === "level_up" ||
    name === "tier_up" ||
    name === "reward_chest"
  );
}

export function isStatusAssetIconName(name: string): name is StatusAssetIconName {
  return (
    name === "buff" ||
    name === "debuff" ||
    name === "poison" ||
    name === "burn" ||
    name === "freeze" ||
    name === "silence" ||
    name === "guard" ||
    name === "rush" ||
    name === "bleed" ||
    name === "curse" ||
    name === "regen" ||
    name === "armor_break"
  );
}

export function isShopAssetIconName(name: string): name is ShopAssetIconName {
  return (
    name === "daily_offer" ||
    name === "bundle" ||
    name === "hot_deal" ||
    name === "best_value" ||
    name === "limited_time" ||
    name === "owned" ||
    name === "sold_out" ||
    name === "refresh" ||
    name === "premium_pack" ||
    name === "free_claim" ||
    name === "featured" ||
    name === "discount"
  );
}

export function resolveGlyphAssetIcon(kind: GlyphKind): { category: GameAssetIconCategory; name: GameAssetIconName } | null {
  if (isResourceAssetIconName(kind)) return { category: "resources", name: kind };
  if (isNavAssetIconName(kind)) return { category: "nav", name: kind };
  return null;
}
