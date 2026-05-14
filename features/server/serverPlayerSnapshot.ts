import { getSupabaseBrowserClient } from "@/features/server/supabaseBrowserSession";
import type { FrontlineFortressState } from "@/lib/types";

export type ServerPlayerSnapshot = {
  profileId: string;
  snapshot: {
    account: {
      name: string;
      level: number;
      xp: number;
      createdAt?: string | null;
      updatedAt?: string | null;
    };
    resources: {
      gold: number;
      dust: number;
      gems: number;
      arenaTickets: number;
      adventureKeys: number;
      updatedAt?: string | null;
    };
    heroes: Array<Record<string, unknown>>;
    frontlineCardUnlocks: Record<string, boolean>;
    frontlineCardLevels: Record<string, number>;
    frontlineLoadout: {
      leaderId: string;
      squad: string[];
      deck: string[];
      updatedAt?: string | null;
    } | null;
    frontlineFortress: FrontlineFortressState | null;
    adventureProgress: Record<string, Record<string, unknown>>;
    adventureMapClaims: Record<string, Record<string, unknown>>;
    missionsProgress: Record<string, Record<string, unknown>>;
    dailyLoginClaims: Record<string, Record<string, unknown>>;
    shopPurchases: Array<Record<string, unknown>>;
  };
};

export type ServerPlayerSnapshotResult =
  | { ok: true; authoritative: true; result: ServerPlayerSnapshot }
  | { ok: false; reason: ServerPlayerSnapshotFailureReason };

export type ServerPlayerSnapshotFailureReason =
  | "unconfigured"
  | "unauthenticated"
  | "not_found"
  | "invalid_response"
  | "server_error";

type RpcClient = {
  rpc: (fn: "get_player_snapshot") => Promise<{ data: unknown; error: { message?: string } | null }>;
};

export async function loadServerPlayerSnapshot(options: {
  clientProvider?: () => RpcClient | null;
} = {}): Promise<ServerPlayerSnapshotResult> {
  const supabase = options.clientProvider?.() ?? getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };

  const { data, error } = await supabase.rpc("get_player_snapshot");
  if (error) return { ok: false, reason: "server_error" };

  return parseServerPlayerSnapshotRpcResult(data);
}

export function parseServerPlayerSnapshotRpcResult(value: unknown): ServerPlayerSnapshotResult {
  if (!isRecord(value)) return { ok: false, reason: "invalid_response" };

  if (value.ok !== true) {
    const code = typeof value.code === "string" ? value.code : "";
    if (code === "unauthenticated") return { ok: false, reason: "unauthenticated" };
    if (code === "not_found") return { ok: false, reason: "not_found" };
    return { ok: false, reason: "server_error" };
  }

  if (value.authoritative !== true || !isRecord(value.result)) {
    return { ok: false, reason: "invalid_response" };
  }

  const profileId = value.result.profileId;
  const snapshot = value.result.snapshot;
  if (typeof profileId !== "string" || !isRecord(snapshot)) {
    return { ok: false, reason: "invalid_response" };
  }

  const account = snapshot.account;
  const resources = snapshot.resources;
  if (!isRecord(account) || !isRecord(resources)) {
    return { ok: false, reason: "invalid_response" };
  }

  if (typeof account.name !== "string" || !isFiniteNumber(account.level) || !isFiniteNumber(account.xp)) {
    return { ok: false, reason: "invalid_response" };
  }

  if (
    !isFiniteNumber(resources.gold) ||
    !isFiniteNumber(resources.dust) ||
    !isFiniteNumber(resources.gems) ||
    !isFiniteNumber(resources.arenaTickets) ||
    !isFiniteNumber(resources.adventureKeys)
  ) {
    return { ok: false, reason: "invalid_response" };
  }

  const frontlineLoadout = normalizeLoadout(snapshot.frontlineLoadout);
  if (frontlineLoadout === undefined) return { ok: false, reason: "invalid_response" };
  const frontlineFortress = normalizeFrontlineFortress(snapshot.frontlineFortress);
  if (frontlineFortress === undefined) return { ok: false, reason: "invalid_response" };

  const parsed: ServerPlayerSnapshot = {
    profileId,
    snapshot: {
      account: {
        name: account.name,
        level: account.level,
        xp: account.xp,
        createdAt: optionalString(account.createdAt),
        updatedAt: optionalString(account.updatedAt),
      },
      resources: {
        gold: resources.gold,
        dust: resources.dust,
        gems: resources.gems,
        arenaTickets: resources.arenaTickets,
        adventureKeys: resources.adventureKeys,
        updatedAt: optionalString(resources.updatedAt),
      },
      heroes: Array.isArray(snapshot.heroes) ? snapshot.heroes.filter(isRecord) : [],
      frontlineCardUnlocks: normalizeBooleanRecord(snapshot.frontlineCardUnlocks),
      frontlineCardLevels: normalizeNumberRecord(snapshot.frontlineCardLevels),
      frontlineLoadout,
      frontlineFortress,
      adventureProgress: normalizeRecordMap(snapshot.adventureProgress),
      adventureMapClaims: normalizeRecordMap(snapshot.adventureMapClaims),
      missionsProgress: normalizeRecordMap(snapshot.missionsProgress),
      dailyLoginClaims: normalizeRecordMap(snapshot.dailyLoginClaims),
      shopPurchases: Array.isArray(snapshot.shopPurchases) ? snapshot.shopPurchases.filter(isRecord) : [],
    },
  };

  return { ok: true, authoritative: true, result: parsed };
}

function normalizeFrontlineFortress(value: unknown): FrontlineFortressState | null | undefined {
  if (value === null || value === undefined) return null;
  if (!isRecord(value) || !isRecord(value.buildings)) return undefined;

  const keep = normalizeInt(value.buildings.keep, 1, 60);
  const treasury = normalizeInt(value.buildings.treasury, 1, 60);
  const barracks = normalizeInt(value.buildings.barracks, 1, 60);
  const integrity = normalizeInt(value.integrity, 0, 100);
  const raidsResolved = normalizeInt(value.raidsResolved, 0, 100000);
  if (
    keep === null ||
    treasury === null ||
    barracks === null ||
    integrity === null ||
    raidsResolved === null ||
    !isNullableStringArray(value.garrison, 3)
  ) {
    return undefined;
  }

  return {
    buildings: { keep, treasury, barracks },
    integrity,
    garrison: [value.garrison[0] ?? null, value.garrison[1] ?? null, value.garrison[2] ?? null],
    lastResolvedAt: optionalString(value.lastResolvedAt) ?? null,
    nextAttackAt: optionalString(value.nextAttackAt) ?? null,
    raidsResolved,
    lastReport: null,
  };
}

function normalizeLoadout(value: unknown): ServerPlayerSnapshot["snapshot"]["frontlineLoadout"] | undefined {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) return undefined;
  if (typeof value.leaderId !== "string" || !isStringArray(value.squad) || !isStringArray(value.deck)) {
    return undefined;
  }

  return {
    leaderId: value.leaderId,
    squad: value.squad,
    deck: value.deck,
    updatedAt: optionalString(value.updatedAt),
  };
}

function normalizeRecordMap(value: unknown): Record<string, Record<string, unknown>> {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, Record<string, unknown>] => isRecord(entry[1])),
  );
}

function normalizeBooleanRecord(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) return {};

  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, boolean] => typeof entry[1] === "boolean"));
}

function normalizeNumberRecord(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};

  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, number] => isFiniteNumber(entry[1])));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNullableStringArray(value: unknown, length: number): value is Array<string | null> {
  return Array.isArray(value) && value.length === length && value.every((item) => item === null || typeof item === "string");
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeInt(value: unknown, min: number, max: number): number | null {
  if (!isFiniteNumber(value) || !Number.isInteger(value) || value < min || value > max) return null;
  return value;
}

function optionalString(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return value;
  return typeof value === "string" ? value : undefined;
}
