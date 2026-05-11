import { NextResponse, type NextRequest } from "next/server";
import {
  executeAuthoritativeRpcCall,
  prepareAuthoritativeRpcCall,
} from "@/features/server/authoritativeRpcProxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
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
