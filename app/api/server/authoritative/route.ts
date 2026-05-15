import { NextResponse, type NextRequest } from "next/server";
import {
  checkAuthoritativeRateLimit,
  createAuthoritativeRateLimitKey,
  createAuthoritativeOperationRateLimitKey,
  getAuthoritativeOperationRateLimitMaxRequests,
  AUTHORITATIVE_OPERATION_RATE_LIMIT_MAX_KEYS,
  AUTHORITATIVE_OPERATION_RATE_LIMIT_WINDOW_MS,
  type AuthoritativeRateLimitStore,
} from "@/features/server/authoritativeRateLimit";
import {
  checkAuthoritativeAuthorizationHeaderSize,
  checkAuthoritativeBodySize,
  checkAuthoritativeContentType,
} from "@/features/server/authoritativeRequestGuards";
import { mergeAuthoritativeResponseHeaders } from "@/features/server/authoritativeResponseHeaders";
import {
  executeAuthoritativeRpcCall,
  prepareAuthoritativeRpcCall,
} from "@/features/server/authoritativeRpcProxy";
import {
  getSafeOperationType,
  maybeLogAuthoritativeSecurityEvent,
} from "@/features/server/authoritativeSecurityEvents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const rateLimitStore: AuthoritativeRateLimitStore = new Map();
const operationRateLimitStore: AuthoritativeRateLimitStore = new Map();

export async function POST(request: NextRequest) {
  const now = Date.now();
  const authorizationHeader = checkAuthoritativeAuthorizationHeaderSize({ headers: request.headers });
  if (!authorizationHeader.ok) {
    maybeLogAuthoritativeSecurityEvent({
      stage: "request_guard",
      status: authorizationHeader.status,
      code: authorizationHeader.body.code,
    });
    return authoritativeJson(authorizationHeader.body, { status: authorizationHeader.status });
  }

  const rateLimitKey = createAuthoritativeRateLimitKey(request.headers);
  const rateLimit = checkAuthoritativeRateLimit({
    key: rateLimitKey,
    store: rateLimitStore,
    now,
  });
  if (!rateLimit.ok) {
    maybeLogAuthoritativeSecurityEvent({
      stage: "global_rate_limit",
      status: rateLimit.status,
      code: rateLimit.body.code,
      identityKey: rateLimitKey,
    });
    return authoritativeJson(rateLimit.body, {
      status: rateLimit.status,
      headers: rateLimit.headers,
    });
  }

  const bodySize = checkAuthoritativeBodySize({ headers: request.headers });
  if (!bodySize.ok) {
    maybeLogAuthoritativeSecurityEvent({
      stage: "request_guard",
      status: bodySize.status,
      code: bodySize.body.code,
      identityKey: rateLimitKey,
    });
    return authoritativeJson(bodySize.body, { status: bodySize.status });
  }

  const contentType = checkAuthoritativeContentType({ headers: request.headers });
  if (!contentType.ok) {
    maybeLogAuthoritativeSecurityEvent({
      stage: "request_guard",
      status: contentType.status,
      code: contentType.body.code,
      identityKey: rateLimitKey,
    });
    return authoritativeJson(contentType.body, { status: contentType.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    maybeLogAuthoritativeSecurityEvent({
      stage: "json_parse",
      status: 400,
      code: "invalid_json",
      identityKey: rateLimitKey,
    });
    return authoritativeJson({ ok: false, code: "invalid_request", reason: "Invalid JSON body" }, { status: 400 });
  }

  const prepared = prepareAuthoritativeRpcCall({
    body,
    headers: request.headers,
  });
  if (!prepared.ok) {
    maybeLogAuthoritativeSecurityEvent({
      stage: "request_validation",
      status: prepared.status,
      code: prepared.body.code,
      operationType: getSafeOperationType(body),
      identityKey: rateLimitKey,
    });
    return authoritativeJson(prepared.body, { status: prepared.status });
  }

  const operationRateLimit = checkAuthoritativeRateLimit({
    key: createAuthoritativeOperationRateLimitKey(rateLimitKey, prepared.operationType),
    store: operationRateLimitStore,
    now,
    maxRequests: getAuthoritativeOperationRateLimitMaxRequests(prepared.operationType),
    windowMs: AUTHORITATIVE_OPERATION_RATE_LIMIT_WINDOW_MS,
    maxKeys: AUTHORITATIVE_OPERATION_RATE_LIMIT_MAX_KEYS,
  });
  if (!operationRateLimit.ok) {
    maybeLogAuthoritativeSecurityEvent({
      stage: "operation_rate_limit",
      status: operationRateLimit.status,
      code: operationRateLimit.body.code,
      operationType: prepared.operationType,
      identityKey: rateLimitKey,
    });
    return authoritativeJson(operationRateLimit.body, {
      status: operationRateLimit.status,
      headers: operationRateLimit.headers,
    });
  }

  const result = await executeAuthoritativeRpcCall(prepared);
  if (result.status >= 400 || isAuthoritativeFailureBody(result.body)) {
    maybeLogAuthoritativeSecurityEvent({
      stage: "rpc",
      status: result.status,
      code: isAuthoritativeFailureBody(result.body) ? result.body.code : "invalid_state",
      operationType: prepared.operationType,
      identityKey: rateLimitKey,
    });
  }
  return authoritativeJson(result.body, { status: result.status });
}

function authoritativeJson(body: unknown, init: ResponseInit = {}) {
  return NextResponse.json(body, {
    ...init,
    headers: mergeAuthoritativeResponseHeaders(init.headers),
  });
}

function isAuthoritativeFailureBody(body: unknown): body is { ok: false; code: "invalid_state" } {
  return Boolean(body && typeof body === "object" && !Array.isArray(body) && (body as { ok?: unknown }).ok === false);
}
