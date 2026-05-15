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

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const rateLimitStore: AuthoritativeRateLimitStore = new Map();
const operationRateLimitStore: AuthoritativeRateLimitStore = new Map();

export async function POST(request: NextRequest) {
  const now = Date.now();
  const authorizationHeader = checkAuthoritativeAuthorizationHeaderSize({ headers: request.headers });
  if (!authorizationHeader.ok) {
    return authoritativeJson(authorizationHeader.body, { status: authorizationHeader.status });
  }

  const rateLimitKey = createAuthoritativeRateLimitKey(request.headers);
  const rateLimit = checkAuthoritativeRateLimit({
    key: rateLimitKey,
    store: rateLimitStore,
    now,
  });
  if (!rateLimit.ok) {
    return authoritativeJson(rateLimit.body, {
      status: rateLimit.status,
      headers: rateLimit.headers,
    });
  }

  const bodySize = checkAuthoritativeBodySize({ headers: request.headers });
  if (!bodySize.ok) {
    return authoritativeJson(bodySize.body, { status: bodySize.status });
  }

  const contentType = checkAuthoritativeContentType({ headers: request.headers });
  if (!contentType.ok) {
    return authoritativeJson(contentType.body, { status: contentType.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return authoritativeJson({ ok: false, code: "invalid_request", reason: "Invalid JSON body" }, { status: 400 });
  }

  const prepared = prepareAuthoritativeRpcCall({
    body,
    headers: request.headers,
  });
  if (!prepared.ok) {
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
    return authoritativeJson(operationRateLimit.body, {
      status: operationRateLimit.status,
      headers: operationRateLimit.headers,
    });
  }

  const result = await executeAuthoritativeRpcCall(prepared);
  return authoritativeJson(result.body, { status: result.status });
}

function authoritativeJson(body: unknown, init: ResponseInit = {}) {
  return NextResponse.json(body, {
    ...init,
    headers: mergeAuthoritativeResponseHeaders(init.headers),
  });
}
