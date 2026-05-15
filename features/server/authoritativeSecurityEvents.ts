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
  at: string;
};

type AuthoritativeSecurityEventInput = {
  stage: AuthoritativeSecurityEventStage;
  status: number;
  code: AuthoritativeSecurityEvent["code"];
  operationType?: unknown;
  identityKey?: string;
  now?: Date;
};

export function createAuthoritativeSecurityEvent({
  stage,
  status,
  code,
  operationType,
  identityKey,
  now = new Date(),
}: AuthoritativeSecurityEventInput): AuthoritativeSecurityEvent {
  return {
    event: "authoritative_api",
    stage,
    status,
    code: sanitizeEventCode(code),
    ...(typeof operationType === "string" ? { operationType: sanitizeOperationType(operationType) } : {}),
    ...(identityKey ? { identityKey: sanitizeIdentityKey(identityKey) } : {}),
    at: now.toISOString(),
  };
}

export function logAuthoritativeSecurityEvent(
  event: AuthoritativeSecurityEvent,
  logger: Pick<Console, "warn"> = console,
) {
  logger.warn(JSON.stringify(event));
}

export function maybeLogAuthoritativeSecurityEvent(input: AuthoritativeSecurityEventInput) {
  logAuthoritativeSecurityEvent(createAuthoritativeSecurityEvent(input));
}

export function getSafeOperationType(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  const operationType = (input as { operationType?: unknown }).operationType;
  return typeof operationType === "string" ? sanitizeOperationType(operationType) : undefined;
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
