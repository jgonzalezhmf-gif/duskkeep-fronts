import { callAuthoritativeOperation, type AuthoritativeClientFetch } from "@/features/server/authoritativeClient";
import { getSupabaseAccessToken } from "@/features/server/supabaseBrowserSession";
import type { Resources } from "@/lib/types";

const AUTHORITATIVE_SHOP_OFFERS = new Set(["adventure_key_ring"]);

export type AuthoritativeDispatcherMode = "authoritative" | "local";

export type AuthoritativePurchaseSuccess = {
  ok: true;
  mode: "authoritative";
  resources: Resources;
};

export type AuthoritativePurchaseFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export type AuthoritativePurchaseFallback = {
  ok: false;
  mode: "local";
  reason: "unsupported_offer" | "missing_session" | "api_disabled";
};

export type AuthoritativePurchaseResult =
  | AuthoritativePurchaseSuccess
  | AuthoritativePurchaseFailure
  | AuthoritativePurchaseFallback;

export type PurchaseShopOfferAuthoritativelyOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  tokenProvider?: () => Promise<string | null>;
};

export async function purchaseShopOfferAuthoritatively(
  offerId: string,
  options: PurchaseShopOfferAuthoritativelyOptions = {},
): Promise<AuthoritativePurchaseResult> {
  if (!AUTHORITATIVE_SHOP_OFFERS.has(offerId)) {
    return { ok: false, mode: "local", reason: "unsupported_offer" };
  }

  const token = await (options.tokenProvider ?? getSupabaseAccessToken)();
  if (!token) {
    return { ok: false, mode: "local", reason: "missing_session" };
  }

  const response = await callAuthoritativeOperation(
    "purchaseShopOffer",
    {
      idempotencyKey: createIdempotencyKey(offerId),
      payload: { offerId, quantity: 1 },
    },
    {
      endpoint: options.endpoint,
      fetcher: options.fetcher,
      token,
    },
  );

  if (!response.body.ok) {
    if (response.status === 404 && response.body.code === "not_found" && response.body.reason.includes("disabled")) {
      return { ok: false, mode: "local", reason: "api_disabled" };
    }
    return { ok: false, mode: "authoritative", reason: response.body.reason };
  }

  const resources = extractResources(response.body.result);
  if (!resources) {
    return { ok: false, mode: "authoritative", reason: "Invalid server response" };
  }

  return {
    ok: true,
    mode: "authoritative",
    resources,
  };
}

function createIdempotencyKey(offerId: string) {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `shop:${offerId}:${Date.now()}:${suffix}`;
}

function extractResources(result: unknown): Resources | null {
  if (!isRecord(result) || !isRecord(result.resources)) return null;

  const gold = parseResourceValue(result.resources.gold);
  const dust = parseResourceValue(result.resources.dust);
  const gems = parseResourceValue(result.resources.gems);
  const arenaTickets = parseResourceValue(result.resources.arenaTickets);
  const adventureKeys = parseResourceValue(result.resources.adventureKeys);
  if (gold === null || dust === null || gems === null || arenaTickets === null || adventureKeys === null) {
    return null;
  }

  return {
    gold,
    dust,
    gems,
    arenaTickets,
    adventureKeys,
  };
}

function parseResourceValue(value: unknown): number | null {
  if (typeof value !== "number") return null;
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
