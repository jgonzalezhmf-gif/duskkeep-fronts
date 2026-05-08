import type { ExtendedShopOffer } from "@/data/shop";
import { isAdventureKeySystemUnlocked } from "@/features/adventure/mapInteractions";
import type { AdventureProgressEntry } from "@/features/adventure/nodeResolution";

export type ShopPurchaseCounts = {
  shopPurchases: Record<string, number>;
  dailyShopPurchases: Record<string, number>;
};

export type ShopPurchaseValidation =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: string;
    };

export function validateShopOfferPurchase(
  offer: ExtendedShopOffer,
  counts: ShopPurchaseCounts,
  adventureProgress: Record<string, AdventureProgressEntry>,
): ShopPurchaseValidation {
  if (offer.contents.adventureKeys && !isAdventureKeySystemUnlocked(adventureProgress)) {
    return { ok: false, reason: "Adventure keys are not unlocked yet" };
  }

  if (offer.oneTime && (counts.shopPurchases[offer.id] ?? 0) > 0) {
    return { ok: false, reason: "Already purchased" };
  }

  if (offer.dailyLimit && (counts.dailyShopPurchases[offer.id] ?? 0) >= offer.dailyLimit) {
    return { ok: false, reason: "Daily limit reached" };
  }

  return { ok: true };
}

export function applyShopOfferPurchase(counts: ShopPurchaseCounts, offerId: string): ShopPurchaseCounts {
  return {
    shopPurchases: {
      ...counts.shopPurchases,
      [offerId]: (counts.shopPurchases[offerId] ?? 0) + 1,
    },
    dailyShopPurchases: {
      ...counts.dailyShopPurchases,
      [offerId]: (counts.dailyShopPurchases[offerId] ?? 0) + 1,
    },
  };
}

export function getShopOfferRemaining(offer: ExtendedShopOffer | undefined, counts: ShopPurchaseCounts): number | null {
  if (!offer) return 0;

  if (offer.oneTime) {
    return (counts.shopPurchases[offer.id] ?? 0) > 0 ? 0 : 1;
  }

  if (offer.dailyLimit) {
    return Math.max(0, offer.dailyLimit - (counts.dailyShopPurchases[offer.id] ?? 0));
  }

  return null;
}
