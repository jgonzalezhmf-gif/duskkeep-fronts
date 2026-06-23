import { callAuthoritativeOperation } from "@/features/server/authoritativeClient";
import type { SupportedAuthoritativeApiOperation } from "@/features/server/authoritativeOperations";
import { createEntropyToken } from "@/lib/clientEntropy";
import type {
  AuthoritativeDispatcherOptions,
  AuthoritativeOperationCallResult,
  AuthoritativeOperationRequest,
} from "@/features/server/authoritativeOperationTypes";
import { getSupabaseAccessToken } from "@/features/server/supabaseBrowserSession";

export function createIdempotencyKey(scope: string, id: string) {
  return `${scope}:${id}:${Date.now()}:${createEntropyToken()}`;
}

export async function callOperationWithSession<TType extends SupportedAuthoritativeApiOperation>(
  operationType: TType,
  request: AuthoritativeOperationRequest<TType>,
  options: AuthoritativeDispatcherOptions,
): Promise<AuthoritativeOperationCallResult> {
  const token = await (options.tokenProvider ?? getSupabaseAccessToken)();
  if (!token) {
    return { ok: false, mode: "local", reason: "missing_session" };
  }

  const response = await callAuthoritativeOperation(operationType, request, {
    endpoint: options.endpoint,
    fetcher: options.fetcher,
    token,
  });

  if (!response.body.ok) {
    if (response.status === 404 && response.body.code === "not_found" && response.body.reason.includes("disabled")) {
      return { ok: false, mode: "local", reason: "api_disabled" };
    }

    return { ok: false, mode: "authoritative", reason: response.body.reason };
  }

  return { ok: true, result: response.body.result };
}
