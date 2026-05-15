export const AUTHORITATIVE_MAX_BODY_BYTES = 256 * 1024;
export const AUTHORITATIVE_BODY_TOO_LARGE_REASON = "Request body is too large";

export type AuthoritativeRequestGuardFailure = {
  ok: false;
  status: 413;
  body: {
    ok: false;
    code: "request_too_large";
    reason: typeof AUTHORITATIVE_BODY_TOO_LARGE_REASON;
  };
};

export function checkAuthoritativeBodySize({
  headers,
  maxBytes = AUTHORITATIVE_MAX_BODY_BYTES,
}: {
  headers: Pick<Headers, "get">;
  maxBytes?: number;
}): { ok: true } | AuthoritativeRequestGuardFailure {
  const rawContentLength = headers.get("content-length")?.trim();
  if (!rawContentLength) return { ok: true };

  const contentLength = Number(rawContentLength);
  if (!Number.isFinite(contentLength) || contentLength < 0) return { ok: true };
  if (contentLength <= maxBytes) return { ok: true };

  return {
    ok: false,
    status: 413,
    body: {
      ok: false,
      code: "request_too_large",
      reason: AUTHORITATIVE_BODY_TOO_LARGE_REASON,
    },
  };
}
