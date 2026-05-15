import { NextResponse, type NextRequest } from "next/server";
import { createAuthoritativeRateLimitKey } from "@/features/server/authoritativeRateLimit";
import { createAuthoritativeRateLimiter } from "@/features/server/authoritativeRateLimiter";
import { createAuthoritativeRequestId } from "@/features/server/authoritativeRequestId";
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

const rateLimiter = createAuthoritativeRateLimiter();

export async function POST(request: NextRequest) {
  const now = Date.now();
  const requestId = createAuthoritativeRequestId(now);
  const respond = (body: unknown, init: ResponseInit = {}) => authoritativeJson(body, init, requestId);
  const authorizationHeader = checkAuthoritativeAuthorizationHeaderSize({ headers: request.headers });
  if (!authorizationHeader.ok) {
    await maybeLogAuthoritativeSecurityEvent({
      stage: "request_guard",
      status: authorizationHeader.status,
      code: authorizationHeader.body.code,
      requestId,
    });
    return respond(authorizationHeader.body, { status: authorizationHeader.status });
  }

  const rateLimitKey = createAuthoritativeRateLimitKey(request.headers);
  const rateLimit = await rateLimiter.checkGlobal({ identityKey: rateLimitKey, now });
  if (!rateLimit.ok) {
    await maybeLogAuthoritativeSecurityEvent({
      stage: "global_rate_limit",
      status: rateLimit.status,
      code: rateLimit.body.code,
      identityKey: rateLimitKey,
      requestId,
    });
    return respond(rateLimit.body, {
      status: rateLimit.status,
      headers: rateLimit.headers,
    });
  }

  const bodySize = checkAuthoritativeBodySize({ headers: request.headers });
  if (!bodySize.ok) {
    await maybeLogAuthoritativeSecurityEvent({
      stage: "request_guard",
      status: bodySize.status,
      code: bodySize.body.code,
      identityKey: rateLimitKey,
      requestId,
    });
    return respond(bodySize.body, { status: bodySize.status });
  }

  const contentType = checkAuthoritativeContentType({ headers: request.headers });
  if (!contentType.ok) {
    await maybeLogAuthoritativeSecurityEvent({
      stage: "request_guard",
      status: contentType.status,
      code: contentType.body.code,
      identityKey: rateLimitKey,
      requestId,
    });
    return respond(contentType.body, { status: contentType.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    await maybeLogAuthoritativeSecurityEvent({
      stage: "json_parse",
      status: 400,
      code: "invalid_json",
      identityKey: rateLimitKey,
      requestId,
    });
    return respond({ ok: false, code: "invalid_request", reason: "Invalid JSON body" }, { status: 400 });
  }

  const prepared = prepareAuthoritativeRpcCall({
    body,
    headers: request.headers,
  });
  if (!prepared.ok) {
    await maybeLogAuthoritativeSecurityEvent({
      stage: "request_validation",
      status: prepared.status,
      code: prepared.body.code,
      operationType: getSafeOperationType(body),
      identityKey: rateLimitKey,
      requestId,
    });
    return respond(prepared.body, { status: prepared.status });
  }

  const operationRateLimit = await rateLimiter.checkOperation({
    identityKey: rateLimitKey,
    operationType: prepared.operationType,
    now,
  });
  if (!operationRateLimit.ok) {
    await maybeLogAuthoritativeSecurityEvent({
      stage: "operation_rate_limit",
      status: operationRateLimit.status,
      code: operationRateLimit.body.code,
      operationType: prepared.operationType,
      identityKey: rateLimitKey,
      requestId,
    });
    return respond(operationRateLimit.body, {
      status: operationRateLimit.status,
      headers: operationRateLimit.headers,
    });
  }

  const result = await executeAuthoritativeRpcCall(prepared);
  if (result.status >= 400 || isAuthoritativeFailureBody(result.body)) {
    await maybeLogAuthoritativeSecurityEvent({
      stage: "rpc",
      status: result.status,
      code: isAuthoritativeFailureBody(result.body) ? result.body.code : "invalid_state",
      operationType: prepared.operationType,
      identityKey: rateLimitKey,
      requestId,
    });
  }
  return respond(result.body, { status: result.status });
}

function authoritativeJson(body: unknown, init: ResponseInit = {}, requestId?: string) {
  return NextResponse.json(body, {
    ...init,
    headers: mergeAuthoritativeResponseHeaders(init.headers, { requestId }),
  });
}

function isAuthoritativeFailureBody(body: unknown): body is { ok: false; code: "invalid_state" } {
  return Boolean(body && typeof body === "object" && !Array.isArray(body) && (body as { ok?: unknown }).ok === false);
}
