import { NextResponse, type NextRequest } from "next/server";
import {
  checkAuthoritativeRateLimit,
  createAuthoritativeRateLimitKey,
  type AuthoritativeRateLimitStore,
} from "@/features/server/authoritativeRateLimit";
import {
  executeAuthoritativeRpcCall,
  prepareAuthoritativeRpcCall,
} from "@/features/server/authoritativeRpcProxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const rateLimitStore: AuthoritativeRateLimitStore = new Map();

export async function POST(request: NextRequest) {
  const rateLimit = checkAuthoritativeRateLimit({
    key: createAuthoritativeRateLimitKey(request.headers),
    store: rateLimitStore,
    now: Date.now(),
  });
  if (!rateLimit.ok) {
    return NextResponse.json(rateLimit.body, {
      status: rateLimit.status,
      headers: rateLimit.headers,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid_request", reason: "Invalid JSON body" }, { status: 400 });
  }

  const prepared = prepareAuthoritativeRpcCall({
    body,
    headers: request.headers,
  });
  if (!prepared.ok) {
    return NextResponse.json(prepared.body, { status: prepared.status });
  }

  const result = await executeAuthoritativeRpcCall(prepared);
  return NextResponse.json(result.body, { status: result.status });
}
