export type AuthoritativeSecurityEventStage =
  | "request_guard"
  | "global_rate_limit"
  | "json_parse"
  | "request_validation"
  | "operation_rate_limit"
  | "replay_validation"
  | "rpc";

export type AuthoritativeSecurityEvent = {
  event: "authoritative_api";
  stage: AuthoritativeSecurityEventStage;
  status: number;
  code: string;
  operationType?: string;
  identityKey?: string;
  requestId?: string;
  at: string;
};

type AuthoritativeSecurityEventInput = {
  stage: AuthoritativeSecurityEventStage;
  status: number;
  code: AuthoritativeSecurityEvent["code"];
  operationType?: unknown;
  identityKey?: string;
  requestId?: string;
  now?: Date;
};

type AuthoritativeSecurityEventSink =
  | { mode: "console" }
  | { mode: "disabled" }
  | { mode: "webhook"; url: string; timeoutMs: number };

type SecurityEventLogger = Pick<Console, "warn">;

type SecurityEventFetch = (
  input: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
    signal?: AbortSignal;
  },
) => Promise<{ ok: boolean; status: number }>;

type AuthoritativeSecurityEventDispatchOptions = {
  env?: Record<string, string | undefined>;
  logger?: SecurityEventLogger;
  fetchImpl?: SecurityEventFetch;
};

const SECURITY_EVENT_SINK_ENV = "AUTHORITATIVE_SECURITY_EVENT_SINK";
const SECURITY_EVENT_WEBHOOK_URL_ENV = "AUTHORITATIVE_SECURITY_EVENT_WEBHOOK_URL";
const SECURITY_EVENT_WEBHOOK_TIMEOUT_MS_ENV = "AUTHORITATIVE_SECURITY_EVENT_WEBHOOK_TIMEOUT_MS";
const DEFAULT_WEBHOOK_TIMEOUT_MS = 1_500;

export function createAuthoritativeSecurityEvent({
  stage,
  status,
  code,
  operationType,
  identityKey,
  requestId,
  now = new Date(),
}: AuthoritativeSecurityEventInput): AuthoritativeSecurityEvent {
  return {
    event: "authoritative_api",
    stage,
    status,
    code: sanitizeEventCode(code),
    ...(typeof operationType === "string" ? { operationType: sanitizeOperationType(operationType) } : {}),
    ...(identityKey ? { identityKey: sanitizeIdentityKey(identityKey) } : {}),
    ...(requestId ? { requestId: sanitizeRequestId(requestId) } : {}),
    at: now.toISOString(),
  };
}

export async function logAuthoritativeSecurityEvent(
  event: AuthoritativeSecurityEvent,
  options: AuthoritativeSecurityEventDispatchOptions = {},
) {
  const env = options.env ?? process.env;
  const logger = options.logger ?? console;
  const sink = resolveAuthoritativeSecurityEventSink(env);

  if (sink.mode === "disabled") return;
  if (sink.mode === "console") {
    logger.warn(JSON.stringify(event));
    return;
  }

  await postAuthoritativeSecurityEventToWebhook(event, sink, {
    logger,
    fetchImpl: options.fetchImpl,
  });
}

export async function maybeLogAuthoritativeSecurityEvent(input: AuthoritativeSecurityEventInput) {
  await logAuthoritativeSecurityEvent(createAuthoritativeSecurityEvent(input));
}

export function getSafeOperationType(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  const operationType = (input as { operationType?: unknown }).operationType;
  return typeof operationType === "string" ? sanitizeOperationType(operationType) : undefined;
}

export function resolveAuthoritativeSecurityEventSink(
  env: Record<string, string | undefined> = process.env,
): AuthoritativeSecurityEventSink {
  const mode = env[SECURITY_EVENT_SINK_ENV]?.trim().toLowerCase() ?? "console";
  if (mode === "disabled" || mode === "off" || mode === "none") return { mode: "disabled" };

  if (mode === "webhook") {
    const url = resolveSafeWebhookUrl(env[SECURITY_EVENT_WEBHOOK_URL_ENV], env.NODE_ENV);
    if (!url) return { mode: "console" };
    return {
      mode: "webhook",
      url,
      timeoutMs: resolveWebhookTimeoutMs(env[SECURITY_EVENT_WEBHOOK_TIMEOUT_MS_ENV]),
    };
  }

  return { mode: "console" };
}

async function postAuthoritativeSecurityEventToWebhook(
  event: AuthoritativeSecurityEvent,
  sink: Extract<AuthoritativeSecurityEventSink, { mode: "webhook" }>,
  {
    logger,
    fetchImpl = globalThis.fetch as SecurityEventFetch | undefined,
  }: {
    logger: SecurityEventLogger;
    fetchImpl?: SecurityEventFetch;
  },
) {
  if (!fetchImpl) {
    logSecurityEventSinkFailure(logger, "missing_fetch");
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), sink.timeoutMs);

  try {
    const response = await fetchImpl(sink.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
      signal: controller.signal,
    });
    if (!response.ok) logSecurityEventSinkFailure(logger, "webhook_rejected", response.status);
  } catch {
    logSecurityEventSinkFailure(logger, "webhook_failed");
  } finally {
    clearTimeout(timeout);
  }
}

function logSecurityEventSinkFailure(logger: SecurityEventLogger, code: string, status?: number) {
  logger.warn(
    JSON.stringify({
      event: "authoritative_api_sink",
      code: sanitizeEventCode(code),
      ...(typeof status === "number" ? { status } : {}),
      at: new Date().toISOString(),
    }),
  );
}

function sanitizeOperationType(operationType: string) {
  return operationType.trim().slice(0, 64).replace(/[^a-zA-Z0-9:_./-]/g, "_");
}

function sanitizeEventCode(code: string) {
  return code.trim().slice(0, 64).replace(/[^a-zA-Z0-9:_-]/g, "_");
}

function sanitizeIdentityKey(identityKey: string) {
  return identityKey.trim().slice(0, 96).replace(/[^a-zA-Z0-9:._-]/g, "_");
}

function sanitizeRequestId(requestId: string) {
  return requestId.trim().slice(0, 96).replace(/[^a-zA-Z0-9:._-]/g, "_");
}

function resolveSafeWebhookUrl(rawUrl: string | undefined, nodeEnv: string | undefined) {
  if (!rawUrl) return undefined;
  try {
    const url = new URL(rawUrl);
    if (url.protocol === "https:") return url.toString();
    if (nodeEnv !== "production" && url.protocol === "http:" && isLocalhost(url.hostname)) return url.toString();
    return undefined;
  } catch {
    return undefined;
  }
}

function resolveWebhookTimeoutMs(rawTimeout: string | undefined) {
  const parsed = Number.parseInt(rawTimeout ?? "", 10);
  if (!Number.isFinite(parsed)) return DEFAULT_WEBHOOK_TIMEOUT_MS;
  return Math.min(Math.max(parsed, 250), 5_000);
}

function isLocalhost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}
