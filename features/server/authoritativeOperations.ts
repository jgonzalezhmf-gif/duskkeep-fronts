import { z } from "zod";
import { DECK_SIZE } from "@/lib/constants";
import type { Rewards } from "@/lib/types";

export const SERVER_FRONTLINE_SQUAD_SIZE = 3;
export const MAX_SYNC_FRONTLINE_CARD_RECORDS = 256;
export const MAX_SYNC_ADVENTURE_PROGRESS_RECORDS = 128;
export const MAX_SYNC_ADVENTURE_CLAIM_RECORDS = 64;

export const serverActionErrorCodes = [
  "unauthenticated",
  "forbidden",
  "not_found",
  "locked",
  "insufficient_resources",
  "already_claimed",
  "daily_limit_reached",
  "invalid_loadout",
  "invalid_request",
  "invalid_state",
  "idempotency_conflict",
  "rate_limited",
] as const;

export type ServerActionErrorCode = (typeof serverActionErrorCodes)[number];

export type ServerActionResponse<TResult> =
  | { ok: true; result: TResult; authoritative: true }
  | { ok: false; reason: string; code: ServerActionErrorCode };

export type ServerActionRequest<TPayload> = {
  idempotencyKey: string;
  payload: TPayload;
};

const idSchema = z
  .string()
  .trim()
  .min(1)
  .max(96)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9:_./_-]*$/, "invalid id format");

const nullableIdSchema = idSchema.nullable();

export const idempotencyKeySchema = z
  .string()
  .trim()
  .min(12)
  .max(160)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9:_=./_-]*$/, "invalid idempotency key format");

const rewardsSchema: z.ZodType<Rewards> = z
  .object({
    gold: z.number().int().nonnegative().optional(),
    dust: z.number().int().nonnegative().optional(),
    gems: z.number().int().nonnegative().optional(),
    xp: z.number().int().nonnegative().optional(),
    accountXp: z.number().int().nonnegative().optional(),
    arenaTickets: z.number().int().nonnegative().optional(),
    adventureKeys: z.number().int().nonnegative().optional(),
    shards: z.array(z.object({ heroId: idSchema, amount: z.number().int().positive() })).optional(),
    frontlineCards: z.array(z.object({ cardId: idSchema })).optional(),
  })
  .strict();

const syncResourcesSchema = z
  .object({
    gold: z.number().int().nonnegative().max(200_000).optional(),
    dust: z.number().int().nonnegative().max(100_000).optional(),
    gems: z.number().int().nonnegative().max(10_000).optional(),
    arenaTickets: z.number().int().nonnegative().max(99).optional(),
    adventureKeys: z.number().int().nonnegative().max(99).optional(),
  })
  .strict();

const syncHeroSchema = z
  .object({
    heroId: idSchema,
    level: z.number().int().min(1).max(60).optional(),
    stars: z.number().int().min(1).max(6).optional(),
    shards: z.number().int().nonnegative().max(5000).optional(),
    xp: z.number().int().nonnegative().max(1_000_000).optional(),
    skillLevel: z.number().int().min(1).max(5).optional(),
  })
  .strict();

const syncAdventureProgressEntrySchema = z
  .object({
    status: z.enum(["locked", "available", "current", "cleared", "completed", "claimed", "hidden"]).optional(),
    cleared: z.boolean().optional(),
    firstClearTaken: z.boolean().optional(),
    claimed: z.boolean().optional(),
  })
  .strict();

const syncAdventureClaimSchema = z
  .object({
    claimed: z.boolean().optional(),
    claimedAt: z.string().trim().max(64).nullable().optional(),
    resetAvailableAt: z.string().trim().max(64).nullable().optional(),
  })
  .strict();

function cappedRecordSchema<TValue extends z.ZodTypeAny>(valueSchema: TValue, maxEntries: number) {
  return z.record(idSchema, valueSchema).refine((record) => Object.keys(record).length <= maxEntries, {
    message: `must contain at most ${maxEntries} entries`,
  });
}

const syncLocalSnapshotSchema = z
  .object({
    account: z
      .object({
        name: z.string().trim().min(1).max(48).optional(),
        level: z.number().int().min(1).max(60).optional(),
        xp: z.number().int().nonnegative().max(1_000_000).optional(),
      })
      .strict()
      .optional(),
    resources: syncResourcesSchema.optional(),
    heroes: z.array(syncHeroSchema).max(64).optional(),
    frontlineLoadout: z
      .object({
        leaderId: idSchema,
        squad: z.array(nullableIdSchema).length(SERVER_FRONTLINE_SQUAD_SIZE),
        deck: z.array(nullableIdSchema).length(DECK_SIZE),
      })
      .strict()
      .optional(),
    frontlineCardUnlocks: cappedRecordSchema(z.boolean(), MAX_SYNC_FRONTLINE_CARD_RECORDS).optional(),
    frontlineCardLevels: cappedRecordSchema(z.number().int().min(1).max(5), MAX_SYNC_FRONTLINE_CARD_RECORDS).optional(),
    adventureProgress: cappedRecordSchema(syncAdventureProgressEntrySchema, MAX_SYNC_ADVENTURE_PROGRESS_RECORDS).optional(),
    adventureMapClaims: cappedRecordSchema(syncAdventureClaimSchema, MAX_SYNC_ADVENTURE_CLAIM_RECORDS).optional(),
  })
  .strict();

export const serverOperationPayloadSchemas = {
  syncLocalSnapshot: z.object({
    localVersion: z.string().trim().min(1).max(32),
    snapshot: syncLocalSnapshotSchema,
  }),
  saveLoadout: z.object({
    leaderId: idSchema,
    squad: z.array(nullableIdSchema).length(SERVER_FRONTLINE_SQUAD_SIZE),
    deck: z.array(nullableIdSchema).length(DECK_SIZE),
  }),
  claimAdventureBattleResult: z.object({
    nodeId: idSchema,
    battleSeed: z.number().int().safe(),
    winner: z.enum(["ally", "enemy"]),
    turns: z.number().int().nonnegative().max(500),
    battleSummary: z.unknown(),
  }),
  openAdventureMapInteraction: z.object({
    interactionId: idSchema,
  }),
  claimAdventureNodeReward: z.object({
    nodeId: idSchema,
  }),
  purchaseShopOffer: z.object({
    offerId: idSchema,
    quantity: z.number().int().positive().max(99).default(1),
  }),
  claimMission: z.object({
    missionId: idSchema,
    cycleKey: idSchema,
  }),
  claimDailyLogin: z.object({
    localDayKey: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  levelUpHero: z.object({
    heroId: idSchema,
  }),
  upgradeFrontlineCard: z.object({
    cardId: idSchema,
  }),
  recordArenaResult: z.object({
    opponentId: idSchema,
    battleSeed: z.number().int().safe(),
    winner: z.enum(["ally", "enemy"]),
    turns: z.number().int().nonnegative().max(500),
    battleSummary: z.unknown(),
  }),
} as const;

export type ServerOperationType = keyof typeof serverOperationPayloadSchemas;
export type ServerOperationPayload<TType extends ServerOperationType> = z.infer<
  (typeof serverOperationPayloadSchemas)[TType]
>;
export type ServerOperationInputPayload<TType extends ServerOperationType> = z.input<
  (typeof serverOperationPayloadSchemas)[TType]
>;

export const serverOperationTypes = Object.keys(serverOperationPayloadSchemas) as ServerOperationType[];

export const supportedAuthoritativeApiOperations = [
  "syncLocalSnapshot",
  "saveLoadout",
  "claimAdventureBattleResult",
  "claimAdventureNodeReward",
  "openAdventureMapInteraction",
  "purchaseShopOffer",
  "claimMission",
  "claimDailyLogin",
  "levelUpHero",
  "upgradeFrontlineCard",
] as const satisfies ServerOperationType[];

export type SupportedAuthoritativeApiOperation = (typeof supportedAuthoritativeApiOperations)[number];

export function isSupportedAuthoritativeApiOperation(
  operationType: string,
): operationType is SupportedAuthoritativeApiOperation {
  return supportedAuthoritativeApiOperations.includes(operationType as SupportedAuthoritativeApiOperation);
}

export type ServerActionValidationResult<TPayload> =
  | { ok: true; request: ServerActionRequest<TPayload> }
  | { ok: false; code: "invalid_request"; reason: string; issues: string[] };

export function getServerActionRequestSchema<TType extends ServerOperationType>(operationType: TType) {
  return z
    .object({
      idempotencyKey: idempotencyKeySchema,
      payload: serverOperationPayloadSchemas[operationType],
    })
    .strict();
}

export function parseServerActionRequest<TType extends ServerOperationType>(
  operationType: TType,
  input: unknown,
): ServerActionValidationResult<ServerOperationPayload<TType>> {
  const parsed = getServerActionRequestSchema(operationType).safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid_request",
      reason: "Invalid server action request",
      issues: parsed.error.issues.map((issue) => `${issue.path.join(".") || "request"}: ${issue.message}`),
    };
  }

  return {
    ok: true,
    request: parsed.data as ServerActionRequest<ServerOperationPayload<TType>>,
  };
}

export function parseRewardPayload(input: unknown) {
  return rewardsSchema.safeParse(input);
}
