import {
  AUTHORITATIVE_OPERATION_RATE_LIMIT_MAX_KEYS,
  AUTHORITATIVE_OPERATION_RATE_LIMIT_WINDOW_MS,
  checkAuthoritativeRateLimit,
  createAuthoritativeOperationRateLimitKey,
  getAuthoritativeOperationRateLimitMaxRequests,
  type AuthoritativeRateLimitResult,
  type AuthoritativeRateLimitStore,
} from "@/features/server/authoritativeRateLimit";

export type AuthoritativeRateLimiter = {
  checkGlobal(input: { identityKey: string; now: number }): Promise<AuthoritativeRateLimitResult>;
  checkOperation(input: { identityKey: string; operationType: string; now: number }): Promise<AuthoritativeRateLimitResult>;
};

export type AuthoritativeRateLimiterBackend = "memory";

type InMemoryAuthoritativeRateLimiterOptions = {
  globalStore?: AuthoritativeRateLimitStore;
  operationStore?: AuthoritativeRateLimitStore;
};

export function createAuthoritativeRateLimiter(
  env: Record<string, string | undefined> = process.env,
  options: InMemoryAuthoritativeRateLimiterOptions = {},
): AuthoritativeRateLimiter {
  const backend = resolveAuthoritativeRateLimiterBackend(env);
  if (backend === "memory") return createInMemoryAuthoritativeRateLimiter(options);
  return createInMemoryAuthoritativeRateLimiter(options);
}

export function createInMemoryAuthoritativeRateLimiter({
  globalStore = new Map(),
  operationStore = new Map(),
}: InMemoryAuthoritativeRateLimiterOptions = {}): AuthoritativeRateLimiter {
  return {
    async checkGlobal({ identityKey, now }) {
      return checkAuthoritativeRateLimit({
        key: identityKey,
        store: globalStore,
        now,
      });
    },
    async checkOperation({ identityKey, operationType, now }) {
      return checkAuthoritativeRateLimit({
        key: createAuthoritativeOperationRateLimitKey(identityKey, operationType),
        store: operationStore,
        now,
        maxRequests: getAuthoritativeOperationRateLimitMaxRequests(operationType),
        windowMs: AUTHORITATIVE_OPERATION_RATE_LIMIT_WINDOW_MS,
        maxKeys: AUTHORITATIVE_OPERATION_RATE_LIMIT_MAX_KEYS,
      });
    },
  };
}

export function resolveAuthoritativeRateLimiterBackend(
  env: Record<string, string | undefined> = process.env,
): AuthoritativeRateLimiterBackend {
  const backend = env.AUTHORITATIVE_RATE_LIMIT_BACKEND?.trim().toLowerCase();
  if (!backend || backend === "memory") return "memory";
  throw new Error("Unsupported AUTHORITATIVE_RATE_LIMIT_BACKEND. Supported value: memory.");
}
