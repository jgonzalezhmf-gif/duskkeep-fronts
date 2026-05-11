import {
  isSupportedAuthoritativeApiOperation,
  parseServerActionRequest,
  type ServerActionResponse,
  type ServerOperationInputPayload,
  type SupportedAuthoritativeApiOperation,
} from "@/features/server/authoritativeOperations";

const DEFAULT_AUTHORITATIVE_ENDPOINT = "/api/server/authoritative";

export type AuthoritativeClientFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Pick<Response, "ok" | "status" | "json">>;

export type AuthoritativeClientOptions = {
  endpoint?: string;
  fetcher?: AuthoritativeClientFetch;
  token: string;
};

export type AuthoritativeClientResult<TResult = unknown> = {
  status: number;
  body: ServerActionResponse<TResult>;
};

export async function callAuthoritativeOperation<TType extends SupportedAuthoritativeApiOperation>(
  operationType: TType,
  request: {
    idempotencyKey: string;
    payload: ServerOperationInputPayload<TType>;
  },
  options: AuthoritativeClientOptions,
): Promise<AuthoritativeClientResult> {
  if (!isSupportedAuthoritativeApiOperation(operationType)) {
    return clientFailure(400, "invalid_request", "Unsupported server operation");
  }

  const token = options.token.trim();
  if (!token) {
    return clientFailure(401, "unauthenticated", "Bearer token required");
  }

  const parsed = parseServerActionRequest(operationType, request);
  if (!parsed.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        code: parsed.code,
        reason: parsed.reason,
      },
    };
  }

  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(options.endpoint ?? DEFAULT_AUTHORITATIVE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operationType,
      idempotencyKey: parsed.request.idempotencyKey,
      payload: parsed.request.payload,
    }),
  });

  const body = (await response.json()) as ServerActionResponse<unknown>;
  return {
    status: response.status,
    body,
  };
}

function clientFailure(status: number, code: "unauthenticated" | "invalid_request", reason: string) {
  return {
    status,
    body: {
      ok: false as const,
      code,
      reason,
    },
  };
}
