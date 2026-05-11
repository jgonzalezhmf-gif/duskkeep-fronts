import { z } from "zod";
import { DECK_SIZE } from "@/lib/constants";
import type { Rewards } from "@/lib/types";

export const SERVER_FRONTLINE_SQUAD_SIZE = 3;

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

export const serverOperationPayloadSchemas = {
  syncLocalSnapshot: z.object({
    localVersion: z.string().trim().min(1).max(32),
    snapshot: z.unknown(),
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
  "saveLoadout",
  "claimAdventureBattleResult",
  "claimAdventureNodeReward",
  "openAdventureMapInteraction",
  "purchaseShopOffer",
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
