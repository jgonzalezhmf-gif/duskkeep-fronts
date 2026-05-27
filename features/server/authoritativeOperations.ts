import { z } from "zod";
import { DECK_SIZE } from "@/lib/constants";
import type { Rewards } from "@/lib/types";

export const SERVER_FRONTLINE_SQUAD_SIZE = 3;
export const SERVER_FRONTLINE_MAX_ROUNDS = 8;
export const MAX_SYNC_FRONTLINE_CARD_RECORDS = 256;
export const MAX_SYNC_ADVENTURE_PROGRESS_RECORDS = 128;
export const MAX_SYNC_ADVENTURE_CLAIM_RECORDS = 64;
export const MAX_FRONTLINE_ACTION_LOG_RECORDS = 256;

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
  "request_too_large",
  "request_header_fields_too_large",
  "unsupported_media_type",
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
const frontlineWinnerSchema = z.enum(["ally", "enemy", "draw"]);
const frontlineCoreHpSchema = z.number().int().min(0).max(999);

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

const frontlineBattleLaneSummarySchema = z
  .object({
    lane: z.enum(["left", "center", "right"]),
    allyHp: z.number().int().min(-999).max(999).optional(),
    enemyHp: z.number().int().min(-999).max(999).optional(),
    allyAlive: z.boolean().optional(),
    enemyAlive: z.boolean().optional(),
  })
  .strict();

const frontlineBattleRecentEventSchema = z
  .object({
    kind: z.string().trim().min(1).max(48),
    side: z.enum(["ally", "enemy"]).optional(),
    lane: z.enum(["left", "center", "right"]).optional(),
    amount: z.number().int().min(-999).max(999).optional(),
    emphasis: z.enum(["low", "mid", "high"]).optional(),
    signature: z.enum(["charge", "cast", "exhaust", "synergy"]).optional(),
    signatureId: z.string().trim().min(1).max(96).optional(),
  })
  .strict();

const frontlineBattleActionLogEntrySchema = z
  .object({
    seq: z.number().int().positive().max(10000),
    round: z.number().int().nonnegative().max(500),
    side: z.enum(["ally"]),
    action: z.enum(["play_card", "leader_power", "resolve_turn"]),
    cardId: idSchema.optional(),
    lane: z.enum(["left", "center", "right"]).optional(),
  })
  .strict()
  .superRefine((entry, ctx) => {
    if (entry.action === "play_card" && !entry.cardId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cardId"],
        message: "play_card actions require cardId",
      });
    }

    if (entry.action !== "play_card" && entry.cardId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cardId"],
        message: "only play_card actions can include cardId",
      });
    }

    if (entry.action === "leader_power" && !entry.lane) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lane"],
        message: "leader_power actions require lane",
      });
    }

    if (entry.action === "resolve_turn" && entry.lane) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lane"],
        message: "resolve_turn actions cannot include lane",
      });
    }
  });

const frontlineBattleSummarySchema = z
  .object({
    schemaVersion: z.number().int().positive().max(10).optional(),
    engineVersion: z.string().trim().min(1).max(48).optional(),
    seed: z.number().int().safe().optional(),
    round: z.number().int().nonnegative().max(500).optional(),
    maxRounds: z.number().int().positive().max(100).optional(),
    winner: frontlineWinnerSchema.optional(),
    allyCoreHp: frontlineCoreHpSchema,
    enemyCoreHp: frontlineCoreHpSchema,
    lanes: z.array(frontlineBattleLaneSummarySchema).max(3).optional(),
    recentEvents: z.array(frontlineBattleRecentEventSchema).max(16).optional(),
    actionLog: z.array(frontlineBattleActionLogEntrySchema).max(MAX_FRONTLINE_ACTION_LOG_RECORDS).optional(),
  })
  .strict();

export type FrontlineBattleSummaryPayload = z.input<typeof frontlineBattleSummarySchema>;

const fortressDefenseOutcomeSchema = z.enum(["full_repel", "partial_hold", "breach"]);
const fortressDefenseActionIdSchema = z.enum([
  "castle_shot",
  "bulwark",
  "volley",
  "arcane_barrage",
  "traps",
  "mend",
  "war_chant",
]);

const fortressDefenseActionLogEntrySchema = z
  .object({
    turn: z.number().int().positive().max(80),
    action: fortressDefenseActionIdSchema,
    targetId: idSchema.optional(),
    castleHp: z.number().int().min(0).max(999),
    enemyCount: z.number().int().min(0).max(12),
  })
  .strict();

const fortressDefenseSummarySchema = z
  .object({
    schemaVersion: z.literal(1),
    seed: z.number().int().safe(),
    turns: z.number().int().positive().max(80),
    outcome: fortressDefenseOutcomeSchema,
    castleHp: z.number().int().min(0).max(999),
    maxCastleHp: z.number().int().positive().max(999),
    enemiesDefeated: z.number().int().min(0).max(80),
    wavesCleared: z.number().int().min(0).max(3),
    actionLog: z.array(fortressDefenseActionLogEntrySchema).max(80),
  })
  .strict();

function refineFortressDefensePayload(
  payload: {
    battleSeed: number;
    outcome: "full_repel" | "partial_hold" | "breach";
    turns: number;
    castleHp: number;
    maxCastleHp: number;
    enemiesDefeated: number;
    defenseSummary: z.infer<typeof fortressDefenseSummarySchema>;
  },
  ctx: z.RefinementCtx,
) {
  if (payload.defenseSummary.seed !== payload.battleSeed) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["defenseSummary", "seed"],
      message: "defense summary seed must match battleSeed",
    });
  }
  if (payload.defenseSummary.outcome !== payload.outcome) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["defenseSummary", "outcome"],
      message: "defense summary outcome must match outcome",
    });
  }
  if (payload.defenseSummary.turns !== payload.turns) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["defenseSummary", "turns"],
      message: "defense summary turns must match turns",
    });
  }
  if (payload.defenseSummary.castleHp !== payload.castleHp || payload.defenseSummary.maxCastleHp !== payload.maxCastleHp) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["defenseSummary", "castleHp"],
      message: "defense summary castle HP must match payload",
    });
  }
  if (payload.defenseSummary.enemiesDefeated !== payload.enemiesDefeated) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["defenseSummary", "enemiesDefeated"],
      message: "defense summary defeated count must match payload",
    });
  }
  if (payload.outcome === "breach" && payload.castleHp > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["castleHp"],
      message: "breach requires castleHp to be zero",
    });
  }
  if (payload.outcome !== "breach" && payload.castleHp <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["castleHp"],
      message: "successful defense requires remaining castle HP",
    });
  }
}

function frontlineSummaryMatchesWinner(input: {
  winner: "ally" | "enemy" | "draw";
  turns: number;
  battleSummary: z.infer<typeof frontlineBattleSummarySchema>;
}) {
  const { allyCoreHp, enemyCoreHp } = input.battleSummary;
  if (input.winner === "ally") {
    return enemyCoreHp <= 0 || (input.turns >= SERVER_FRONTLINE_MAX_ROUNDS && allyCoreHp > enemyCoreHp);
  }
  if (input.winner === "enemy") {
    return allyCoreHp <= 0 || (input.turns >= SERVER_FRONTLINE_MAX_ROUNDS && enemyCoreHp > allyCoreHp);
  }
  return (allyCoreHp <= 0 && enemyCoreHp <= 0) || (input.turns >= SERVER_FRONTLINE_MAX_ROUNDS && allyCoreHp === enemyCoreHp);
}

function refineFrontlineBattlePayload(
  payload: {
    battleSeed: number;
    winner: "ally" | "enemy" | "draw";
    turns: number;
    battleSummary: z.infer<typeof frontlineBattleSummarySchema>;
  },
  ctx: z.RefinementCtx,
) {
  if (payload.battleSummary.seed !== undefined && payload.battleSummary.seed !== payload.battleSeed) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["battleSummary", "seed"],
      message: "battle summary seed must match battleSeed",
    });
  }

  if (payload.battleSummary.round !== undefined && payload.battleSummary.round !== payload.turns) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["battleSummary", "round"],
      message: "battle summary round must match turns",
    });
  }

  if (payload.battleSummary.winner !== undefined && payload.battleSummary.winner !== payload.winner) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["battleSummary", "winner"],
      message: "battle summary winner must match winner",
    });
  }

  if (!frontlineSummaryMatchesWinner(payload)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["battleSummary"],
      message: "battle summary core HP is not consistent with winner",
    });
  }

  validateFrontlineActionLog(payload.battleSummary.actionLog, payload.turns, ctx);
}

function validateFrontlineActionLog(
  actionLog: z.infer<typeof frontlineBattleActionLogEntrySchema>[] | undefined,
  turns: number,
  ctx: z.RefinementCtx,
) {
  if (!actionLog) return;

  let previousSeq = 0;
  for (const [index, entry] of actionLog.entries()) {
    if (entry.seq <= previousSeq) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["battleSummary", "actionLog", index, "seq"],
        message: "action log sequence must be strictly increasing",
      });
    }
    previousSeq = entry.seq;

    if (entry.round > turns) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["battleSummary", "actionLog", index, "round"],
        message: "action log round cannot exceed battle turns",
      });
    }
  }
}

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

const syncFrontlineFortressSchema = z
  .object({
    buildings: z
      .object({
        keep: z.number().int().min(1).max(60),
        treasury: z.number().int().min(1).max(60),
        barracks: z.number().int().min(1).max(60),
      })
      .strict(),
    integrity: z.number().int().min(0).max(100),
    garrison: z.array(nullableIdSchema).length(SERVER_FRONTLINE_SQUAD_SIZE),
    lastResolvedAt: z.string().trim().max(64).nullable().optional(),
    nextAttackAt: z.string().trim().max(64).nullable().optional(),
    raidsResolved: z.number().int().nonnegative().max(100000),
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
    frontlineFortress: syncFrontlineFortressSchema.optional(),
    adventureProgress: cappedRecordSchema(syncAdventureProgressEntrySchema, MAX_SYNC_ADVENTURE_PROGRESS_RECORDS).optional(),
    adventureMapClaims: cappedRecordSchema(syncAdventureClaimSchema, MAX_SYNC_ADVENTURE_CLAIM_RECORDS).optional(),
  })
  .strict();

export const serverOperationPayloadSchemas = {
  syncLocalSnapshot: z
    .object({
      localVersion: z.string().trim().min(1).max(32),
      snapshot: syncLocalSnapshotSchema,
    })
    .strict(),
  saveLoadout: z
    .object({
      leaderId: idSchema,
      squad: z.array(nullableIdSchema).length(SERVER_FRONTLINE_SQUAD_SIZE),
      deck: z.array(nullableIdSchema).length(DECK_SIZE),
    })
    .strict(),
  claimAdventureBattleResult: z
    .object({
      nodeId: idSchema,
      battleSeed: z.number().int().safe(),
      winner: z.enum(["ally", "enemy"]),
      turns: z.number().int().nonnegative().max(500),
      battleSummary: frontlineBattleSummarySchema,
    })
    .strict()
    .superRefine(refineFrontlineBattlePayload),
  openAdventureMapInteraction: z
    .object({
      interactionId: idSchema,
    })
    .strict(),
  claimAdventureNodeReward: z
    .object({
      nodeId: idSchema,
    })
    .strict(),
  purchaseShopOffer: z
    .object({
      offerId: idSchema,
      quantity: z.number().int().positive().max(99).default(1),
    })
    .strict(),
  claimMission: z
    .object({
      missionId: idSchema,
      cycleKey: idSchema,
    })
    .strict(),
  claimDailyLogin: z
    .object({
      localDayKey: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .strict(),
  levelUpHero: z
    .object({
      heroId: idSchema,
    })
    .strict(),
  starUpHero: z
    .object({
      heroId: idSchema,
    })
    .strict(),
  skillUpHero: z
    .object({
      heroId: idSchema,
    })
    .strict(),
  upgradeFrontlineCard: z
    .object({
      cardId: idSchema,
    })
    .strict(),
  upgradeFrontlineFortress: z
    .object({
      buildingId: z.enum(["keep", "treasury", "barracks"]),
    })
    .strict(),
  resolveFrontlineFortressRaid: z.object({}).strict(),
  claimFrontlineFortressDefense: z
    .object({
      battleSeed: z.number().int().safe(),
      outcome: fortressDefenseOutcomeSchema,
      turns: z.number().int().positive().max(80),
      castleHp: z.number().int().min(0).max(999),
      maxCastleHp: z.number().int().positive().max(999),
      enemiesDefeated: z.number().int().min(0).max(80),
      defenseSummary: fortressDefenseSummarySchema,
    })
    .strict()
    .superRefine(refineFortressDefensePayload),
  recordArenaResult: z
    .object({
      opponentId: idSchema,
      battleSeed: z.number().int().safe(),
      winner: z.enum(["ally", "enemy", "draw"]),
      turns: z.number().int().nonnegative().max(500),
      battleSummary: frontlineBattleSummarySchema,
    })
    .strict()
    .superRefine(refineFrontlineBattlePayload),
  recordLadderResult: z
    .object({
      opponentId: idSchema,
      battleSeed: z.number().int().safe(),
      winner: z.enum(["ally", "enemy", "draw"]),
      turns: z.number().int().nonnegative().max(500),
      battleSummary: frontlineBattleSummarySchema,
    })
    .strict()
    .superRefine(refineFrontlineBattlePayload),
  recordEventResult: z
    .object({
      eventId: idSchema,
      battleSeed: z.number().int().safe(),
      winner: z.enum(["ally", "enemy", "draw"]),
      turns: z.number().int().nonnegative().max(500),
      battleSummary: frontlineBattleSummarySchema,
    })
    .strict()
    .superRefine(refineFrontlineBattlePayload),
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
  "starUpHero",
  "skillUpHero",
  "upgradeFrontlineCard",
  "upgradeFrontlineFortress",
  "resolveFrontlineFortressRaid",
  "claimFrontlineFortressDefense",
  "recordArenaResult",
  "recordLadderResult",
  "recordEventResult",
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
