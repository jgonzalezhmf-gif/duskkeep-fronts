import { arenaTrialModifiersForRival } from "@/features/arena/trialMutators";
import { createFrontlineCardProfileMap, createFrontlineSupportProfileMap } from "@/features/frontline/cardProgression";
import {
  getFrontlineBattleReplayMismatches,
  replayFrontlineBattleFromActionLog,
} from "@/features/frontline/battleReplay";
import type { FrontlineBattleSummary } from "@/features/frontline/battleSummary";
import {
  getFrontlinePresetForAdventureNode,
  getFrontlinePresetForArenaOpponent,
  getFrontlinePresetForEvent,
  getFrontlinePresetForLadderOpponent,
} from "@/features/frontline/encounterPresets";
import { createFrontlineHeroProfileMap } from "@/features/frontline/heroProfile";
import type { FrontlinePlayerActionLogEntry, FrontlinePreset } from "@/features/frontline/types";
import type { ServerOperationPayload, SupportedAuthoritativeApiOperation } from "@/features/server/authoritativeOperations";
import type { FrontlineLoadout, PlayerHero } from "@/lib/types";

type RuntimeEnv = Record<string, string | undefined>;

export type FrontlineBattleServerOperation = Extract<
  SupportedAuthoritativeApiOperation,
  "claimAdventureBattleResult" | "recordArenaResult" | "recordLadderResult" | "recordEventResult"
>;

type FrontlineLoadoutRow = {
  leader_id?: unknown;
  squad?: unknown;
  deck?: unknown;
};

type PlayerHeroRow = {
  hero_id?: unknown;
  level?: unknown;
  stars?: unknown;
  shards?: unknown;
  xp?: unknown;
  skill_level?: unknown;
  unlocked?: unknown;
};

type PlayerFrontlineCardRow = {
  card_id?: unknown;
  level?: unknown;
  unlocked?: unknown;
};

export type FrontlineReplayValidationContext = {
  loadout: FrontlineLoadout;
  enemyPreset: FrontlinePreset;
  playerHeroes: PlayerHero[];
  cardLevels: Record<string, number>;
};

export type FrontlineReplayValidationResult =
  | { ok: true }
  | { ok: false; code: "invalid_request" | "invalid_state"; reason: string };

export function isAuthoritativeBattleReplayValidationEnabled(env: RuntimeEnv = process.env) {
  return env.SERVER_FRONTLINE_REPLAY_VALIDATION === "true";
}

export function isFrontlineBattleOperation(operationType: SupportedAuthoritativeApiOperation): operationType is FrontlineBattleServerOperation {
  return (
    operationType === "claimAdventureBattleResult" ||
    operationType === "recordArenaResult" ||
    operationType === "recordLadderResult" ||
    operationType === "recordEventResult"
  );
}

export function validateFrontlineBattleReplayPayload(
  operationType: FrontlineBattleServerOperation,
  payload: ServerOperationPayload<FrontlineBattleServerOperation>,
  context: FrontlineReplayValidationContext,
): FrontlineReplayValidationResult {
  const battleSummary = payload.battleSummary;
  const actionLog = Array.isArray(battleSummary.actionLog) ? battleSummary.actionLog : null;
  if (!actionLog?.length) {
    return replayFailure("invalid_request", "Battle action log is required for replay validation.");
  }

  const replay = replayFrontlineBattleFromActionLog({
    seed: payload.battleSeed,
    loadout: context.loadout,
    enemyPreset: context.enemyPreset,
    actionLog: actionLog as FrontlinePlayerActionLogEntry[],
    allyHeroProfiles: createFrontlineHeroProfileMap(context.playerHeroes),
    allyCardProfiles: createFrontlineCardProfileMap(context.cardLevels),
    allySupportProfiles: createFrontlineSupportProfileMap(context.cardLevels),
    modifiers: resolveFrontlineBattleModifiersForOperation(operationType, payload),
  });
  if (!replay.ok) {
    return replayFailure("invalid_request", "Battle replay validation failed.");
  }

  const mismatches = getFrontlineBattleReplayMismatches(battleSummary as Partial<FrontlineBattleSummary>, replay.summary);
  if (replay.summary.round !== payload.turns) mismatches.push("turns");
  if (replay.summary.winner !== payload.winner) mismatches.push("winner");
  if (mismatches.length > 0) {
    return replayFailure("invalid_request", "Battle summary does not match replay output.");
  }

  return { ok: true };
}

export function resolveFrontlineBattleModifiersForOperation(
  operationType: FrontlineBattleServerOperation,
  payload: ServerOperationPayload<FrontlineBattleServerOperation>,
) {
  if (operationType === "recordArenaResult") {
    const arenaPayload = payload as ServerOperationPayload<"recordArenaResult">;
    return arenaTrialModifiersForRival(arenaPayload.opponentId);
  }
  return undefined;
}

export function resolveFrontlineBattlePresetForOperation(
  operationType: FrontlineBattleServerOperation,
  payload: ServerOperationPayload<FrontlineBattleServerOperation>,
) {
  if (operationType === "claimAdventureBattleResult") {
    const battlePayload = payload as ServerOperationPayload<"claimAdventureBattleResult">;
    return getFrontlinePresetForAdventureNode(battlePayload.nodeId);
  }
  if (operationType === "recordArenaResult") {
    const arenaPayload = payload as ServerOperationPayload<"recordArenaResult">;
    return getFrontlinePresetForArenaOpponent(arenaPayload.opponentId);
  }
  if (operationType === "recordLadderResult") {
    const ladderPayload = payload as ServerOperationPayload<"recordLadderResult">;
    return getFrontlinePresetForLadderOpponent(ladderPayload.opponentId);
  }
  const eventPayload = payload as ServerOperationPayload<"recordEventResult">;
  return getFrontlinePresetForEvent(eventPayload.eventId);
}

export function normalizeFrontlineReplayContext(input: {
  loadoutRow: FrontlineLoadoutRow | null;
  heroRows: PlayerHeroRow[] | null;
  cardRows: PlayerFrontlineCardRow[] | null;
  enemyPreset: FrontlinePreset | null;
}): FrontlineReplayValidationContext | null {
  const loadout = normalizeLoadout(input.loadoutRow);
  if (!loadout || !input.enemyPreset) return null;

  return {
    loadout,
    enemyPreset: input.enemyPreset,
    playerHeroes: normalizePlayerHeroes(input.heroRows ?? []),
    cardLevels: normalizeCardLevels(input.cardRows ?? []),
  };
}

function normalizeLoadout(row: FrontlineLoadoutRow | null): FrontlineLoadout | null {
  if (!row || typeof row.leader_id !== "string") return null;
  if (!Array.isArray(row.squad) || !Array.isArray(row.deck)) return null;
  if (row.squad.length !== 3 || row.deck.length !== 8) return null;

  return {
    leaderId: row.leader_id,
    squad: row.squad.map((entry) => (typeof entry === "string" ? entry : null)) as FrontlineLoadout["squad"],
    deck: row.deck.map((entry) => (typeof entry === "string" ? entry : null)) as FrontlineLoadout["deck"],
  };
}

function normalizePlayerHeroes(rows: PlayerHeroRow[]) {
  return rows
    .filter((row) => row.unlocked === true && typeof row.hero_id === "string")
    .map((row) => ({
      heroId: row.hero_id as string,
      level: toPositiveInt(row.level, 1),
      stars: toPositiveInt(row.stars, 1),
      shards: toNonNegativeInt(row.shards),
      xp: toNonNegativeInt(row.xp),
      skillLevel: toPositiveInt(row.skill_level, 1),
    }));
}

function normalizeCardLevels(rows: PlayerFrontlineCardRow[]) {
  return Object.fromEntries(
    rows
      .filter((row) => row.unlocked === true && typeof row.card_id === "string")
      .map((row) => [row.card_id as string, toPositiveInt(row.level, 1)] as const),
  );
}

function toPositiveInt(value: unknown, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
}

function toNonNegativeInt(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
}

function replayFailure(code: "invalid_request" | "invalid_state", reason: string): FrontlineReplayValidationResult {
  return { ok: false, code, reason };
}
