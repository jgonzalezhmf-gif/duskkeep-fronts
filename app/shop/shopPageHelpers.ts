import type { GlyphKind } from "@/components/ui/GameGlyph";
import type { ExtendedShopOffer, ShopCategory } from "@/data/shop";
import { sfx } from "@/lib/audio";
import { describeRewards } from "@/lib/rewards";
import type { ShopIconName } from "@/components/game/shared/ShopIcon";

export const CATEGORY_SHOP_ICONS: Record<ShopCategory, ShopIconName> = {
  featured: "featured",
  daily: "daily_offer",
  resources: "premium_pack",
  shards: "bundle",
  consumables: "limited_time",
};

export const CATEGORY_TONES: Record<ShopCategory, string> = {
  featured: "from-[#fff4c9] via-[#f5c451] to-[#b86118]",
  daily: "from-[#e4f4ff] via-[#86c8ff] to-[#2d63b5]",
  resources: "from-[#e7ffe9] via-[#78d8a3] to-[#1d7553]",
  shards: "from-[#f4ddff] via-[#ca8cff] to-[#6b35aa]",
  consumables: "from-[#ffe1c4] via-[#ff9f67] to-[#ac4720]",
};

const VALUE_TAG_SHOP_ICONS: Record<string, ShopIconName> = {
  "best value": "best_value",
  "card prep": "premium_pack",
  fortress: "bundle",
  daily: "daily_offer",
  upgrade: "discount",
  crafting: "premium_pack",
  balanced: "discount",
  training: "premium_pack",
  ladder: "bundle",
  "map key": "daily_offer",
  tank: "bundle",
  striker: "bundle",
  healer: "bundle",
  breach: "bundle",
  finisher: "bundle",
  support: "bundle",
};

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function nextMidnightMs() {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

export function fmtMs(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function tx(t: TranslateFn, key: string, fallback: string, params?: Record<string, string | number>) {
  const value = t(key, params);
  return value === key ? fallback : value;
}

export function categoryLabel(category: ShopCategory, t: TranslateFn) {
  return tx(t, `shop.categories.${category}.label`, category);
}

export function offerName(offer: ExtendedShopOffer, t: TranslateFn) {
  return tx(t, `shop.offers.${offer.id}.name`, offer.name);
}

export function offerDescription(offer: ExtendedShopOffer, t: TranslateFn) {
  return tx(t, `shop.offers.${offer.id}.description`, offer.description);
}

export function offerValueTag(offer: ExtendedShopOffer, t: TranslateFn) {
  if (!offer.valueTag) return undefined;
  return tx(t, `shop.offers.${offer.id}.valueTag`, offer.valueTag);
}

export function offerCost(offer: ExtendedShopOffer, t: TranslateFn) {
  if (offer.cost.gems && offer.cost.gems > 0) return t("shop.costs.gems", { amount: offer.cost.gems });
  if (offer.cost.gold && offer.cost.gold > 0) return t("shop.costs.gold", { amount: offer.cost.gold });
  return t("shop.costs.free");
}

export function offerStateLabel(offer: ExtendedShopOffer, remaining: number | null, bought: boolean, t: TranslateFn, compact = false) {
  if (offer.dailyLimit) return t("shop.left", { count: `${remaining ?? 0}/${offer.dailyLimit}` });
  if (offer.oneTime) return bought ? t(compact ? "shop.states.ownedLower" : "shop.states.owned") : t(compact ? "shop.states.oneTimeLower" : "shop.states.oneTime");
  return compact ? t("shop.states.open") : t("shop.openStock");
}

export function productLineLabel(offer: ExtendedShopOffer, t: TranslateFn) {
  if (!offer.productLine) return describeRewards(offer.contents);
  const line = tx(t, `shop.productLines.${offer.productLine}`, offer.productLine);
  return t("shop.productLineStock", { line });
}

export function bestUseLabel(category: ShopCategory, t: TranslateFn) {
  if (category === "shards") return t("shop.bestUse.shards");
  if (category === "resources") return t("shop.bestUse.resources");
  return t("shop.bestUse.default");
}

function offerSearchText(offer: ExtendedShopOffer) {
  return `${offer.name} ${offer.description} ${offer.valueTag ?? ""} ${offer.productLine ?? ""}`.toLowerCase();
}

function hasOfferSignal(offer: ExtendedShopOffer, signals: string[]) {
  const text = offerSearchText(offer);
  return signals.some((signal) => text.includes(signal));
}

export function offerShopIcon(offer: ExtendedShopOffer): ShopIconName {
  const tagIcon = shopIconForValueTag(offer.valueTag);

  if (!offer.cost.gems && !offer.cost.gold) return "free_claim";
  if (offer.valueTag?.toLowerCase().includes("best")) return "best_value";
  if (offer.hot) return "hot_deal";
  if (tagIcon !== "featured") return tagIcon;
  if (offer.category === "daily") return "daily_offer";
  if (offer.category === "shards" || offer.productLine === "hero") return "bundle";
  if (offer.productLine === "frontline") return "premium_pack";
  if (offer.productLine === "resource" || hasOfferSignal(offer, ["gold", "dust", "supplies", "stock", "chest", "crate", "upgrade"])) return "discount";
  if (offer.productLine === "fortress" || offer.productLine === "arena") return "bundle";
  return CATEGORY_SHOP_ICONS[offer.category] ?? "bundle";
}

export function offerStateShopIcon(offer: ExtendedShopOffer, remaining: number | null, bought: boolean, clientReady: boolean): ShopIconName {
  if (!clientReady) return offerShopIcon(offer);
  if (bought && offer.oneTime) return "owned";
  if (remaining === 0) return "sold_out";
  if (!offer.cost.gems && !offer.cost.gold) return "free_claim";
  if (offer.dailyLimit) return "limited_time";
  return offerShopIcon(offer);
}

export function isOfferConsumed(offer: ExtendedShopOffer, remaining: number | null, bought: boolean, clientReady: boolean) {
  if (!clientReady) return false;
  if (offer.oneTime && bought) return true;
  if (offer.dailyLimit && remaining === 0) return true;
  return false;
}

export function productLineShopIcon(offer: ExtendedShopOffer): ShopIconName {
  if (offer.productLine === "frontline") return "premium_pack";
  if (offer.productLine === "resource") return "discount";
  if (offer.productLine === "hero" || offer.productLine === "fortress" || offer.productLine === "arena") return "bundle";
  return offerShopIcon(offer);
}

export function shopIconForValueTag(valueTag?: string): ShopIconName {
  const tag = valueTag?.toLowerCase() ?? "";
  const exactMatch = VALUE_TAG_SHOP_ICONS[tag];
  if (exactMatch) return exactMatch;
  if (tag.includes("best")) return "best_value";
  if (tag.includes("daily")) return "daily_offer";
  if (tag.includes("free")) return "free_claim";
  if (tag.includes("discount")) return "discount";
  if (tag.includes("card") || tag.includes("craft") || tag.includes("train")) return "premium_pack";
  if (tag.includes("fortress") || tag.includes("ladder") || tag.includes("tank") || tag.includes("striker") || tag.includes("healer") || tag.includes("breach") || tag.includes("finisher") || tag.includes("support")) return "bundle";
  if (tag.includes("upgrade") || tag.includes("balanced")) return "discount";
  return "featured";
}

export function categoryGlyph(category: ShopCategory): GlyphKind {
  switch (category) {
    case "resources":
      return "gem";
    case "shards":
      return "heroes";
    case "consumables":
      return "power";
    case "daily":
      return "rewards";
    default:
      return "offers";
  }
}

export function handleBuy(
  offer: ExtendedShopOffer,
  buy: (offerId: string) => { ok: boolean; reason?: string },
  pushNote: (kind: "success" | "error" | "info", message: string) => void,
  t: TranslateFn,
) {
  const result = buy(offer.id);
  if (result.ok) {
    sfx.purchase();
    pushNote("success", t("shop.notifications.bought", { name: offerName(offer, t) }));
    return true;
  }

  sfx.error();
  pushNote("error", result.reason ?? t("shop.notifications.purchaseFailed"));
  return false;
}

export async function handleBuyAsync(
  offer: ExtendedShopOffer,
  buy: (offerId: string) => Promise<{ ok: boolean; reason?: string }>,
  pushNote: (kind: "success" | "error" | "info", message: string) => void,
  t: TranslateFn,
) {
  const result = await buy(offer.id);
  if (result.ok) {
    sfx.purchase();
    pushNote("success", t("shop.notifications.bought", { name: offerName(offer, t) }));
    return true;
  }

  sfx.error();
  pushNote("error", result.reason ?? t("shop.notifications.purchaseFailed"));
  return false;
}
