import {
  callOperationWithSession,
  createIdempotencyKey,
} from "@/features/server/authoritativeOperationCaller";
import {
  authoritativeResponseMismatch,
  invalidAuthoritativeServerResponse,
} from "@/features/server/authoritativeDispatcherErrors";
import {
  extractHeroLevelUpResult,
  extractHeroSkillUpResult,
  extractHeroStarUpResult,
} from "@/features/server/authoritativeOperationParsers";
import type {
  AuthoritativeHeroLevelUpResult,
  AuthoritativeHeroSkillUpResult,
  AuthoritativeHeroStarUpResult,
  LevelUpHeroAuthoritativelyOptions,
  SkillUpHeroAuthoritativelyOptions,
  StarUpHeroAuthoritativelyOptions,
} from "@/features/server/authoritativeOperationTypes";

export async function skillUpHeroAuthoritatively(
  heroId: string,
  options: SkillUpHeroAuthoritativelyOptions = {},
): Promise<AuthoritativeHeroSkillUpResult> {
  const response = await callOperationWithSession(
    "skillUpHero",
    {
      idempotencyKey: createIdempotencyKey("hero-skill", heroId),
      payload: { heroId },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractHeroSkillUpResult(response.result);
  if (!parsed) {
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.heroId !== heroId) {
    return authoritativeResponseMismatch("hero");
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function starUpHeroAuthoritatively(
  heroId: string,
  options: StarUpHeroAuthoritativelyOptions = {},
): Promise<AuthoritativeHeroStarUpResult> {
  const response = await callOperationWithSession(
    "starUpHero",
    {
      idempotencyKey: createIdempotencyKey("hero-star", heroId),
      payload: { heroId },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractHeroStarUpResult(response.result);
  if (!parsed) {
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.heroId !== heroId) {
    return authoritativeResponseMismatch("hero");
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}

export async function levelUpHeroAuthoritatively(
  heroId: string,
  options: LevelUpHeroAuthoritativelyOptions = {},
): Promise<AuthoritativeHeroLevelUpResult> {
  const response = await callOperationWithSession(
    "levelUpHero",
    {
      idempotencyKey: createIdempotencyKey("hero", heroId),
      payload: { heroId },
    },
    options,
  );

  if (!response.ok) return response;

  const parsed = extractHeroLevelUpResult(response.result);
  if (!parsed) {
    return invalidAuthoritativeServerResponse();
  }
  if (parsed.heroId !== heroId) {
    return authoritativeResponseMismatch("hero");
  }

  return {
    ok: true,
    mode: "authoritative",
    ...parsed,
  };
}
