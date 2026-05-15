import {
  callOperationWithSession,
  createIdempotencyKey,
} from "@/features/server/authoritativeOperationCaller";
import {
  authoritativeResponseMismatch,
  invalidAuthoritativeServerResponse,
} from "@/features/server/authoritativeDispatcherErrors";
import {
  extractAdventureBattleResult,
  extractMapInteractionOpenResult,
  extractNodeRewardResult,
} from "@/features/server/authoritativeOperationParsers";
import type {
  AuthoritativeAdventureBattleResult,
  AuthoritativeMapInteractionResult,
  AuthoritativeNodeRewardResult,
  ClaimAdventureBattleResultAuthoritativelyOptions,
  ClaimAdventureBattleResultInput,
  ClaimAdventureNodeRewardAuthoritativelyOptions,
  OpenAdventureMapInteractionAuthoritativelyOptions,
} from "@/features/server/authoritativeOperationTypes";

export async function openAdventureMapInteractionAuthoritatively(
  interactionId: string,
  options: OpenAdventureMapInteractionAuthoritativelyOptions = {},
): Promise<AuthoritativeMapInteractionResult> {
  const response = await callOperationWithSession(
    "openAdventureMapInteraction",
    {
      idempotencyKey: createIdempotencyKey("map", interactionId),
      payload: { interactionId },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractMapInteractionOpenResult(response.result);
  if (!parsed) {
    return invalidAuthoritativeServerResponse();
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function claimAdventureNodeRewardAuthoritatively(
  nodeId: string,
  options: ClaimAdventureNodeRewardAuthoritativelyOptions = {},
): Promise<AuthoritativeNodeRewardResult> {
  const response = await callOperationWithSession(
    "claimAdventureNodeReward",
    {
      idempotencyKey: createIdempotencyKey("node", nodeId),
      payload: { nodeId },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractNodeRewardResult(response.result);
  if (!parsed) {
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.nodeId !== nodeId) {
    return authoritativeResponseMismatch("node");
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function claimAdventureBattleResultAuthoritatively(
  input: ClaimAdventureBattleResultInput,
  options: ClaimAdventureBattleResultAuthoritativelyOptions = {},
): Promise<AuthoritativeAdventureBattleResult> {
  const response = await callOperationWithSession(
    "claimAdventureBattleResult",
    {
      idempotencyKey: createIdempotencyKey("battle", `${input.nodeId}:${input.battleSeed}:${input.winner}`),
      payload: input,
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractAdventureBattleResult(response.result);
  if (!parsed) {
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.nodeId !== input.nodeId) {
    return authoritativeResponseMismatch("node");
  }
  if (parsed.winner !== input.winner) {
    return authoritativeResponseMismatch("winner");
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}
