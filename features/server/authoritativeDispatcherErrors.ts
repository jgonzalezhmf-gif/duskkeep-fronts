export const INVALID_AUTHORITATIVE_SERVER_RESPONSE_REASON = "Invalid server response";

export type AuthoritativeDispatcherFailure = {
  ok: false;
  mode: "authoritative";
  reason: string;
};

export function invalidAuthoritativeServerResponse(): AuthoritativeDispatcherFailure {
  return {
    ok: false,
    mode: "authoritative",
    reason: INVALID_AUTHORITATIVE_SERVER_RESPONSE_REASON,
  };
}

export function authoritativeResponseMismatch(entity: string): AuthoritativeDispatcherFailure {
  return {
    ok: false,
    mode: "authoritative",
    reason: `Server response ${entity} mismatch`,
  };
}
