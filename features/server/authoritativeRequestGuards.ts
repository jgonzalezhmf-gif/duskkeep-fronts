export const AUTHORITATIVE_MAX_BODY_BYTES = 256 * 1024;
export const AUTHORITATIVE_MAX_AUTHORIZATION_HEADER_CHARS = 4096;
export const AUTHORITATIVE_BODY_TOO_LARGE_REASON = "Request body is too large";
export const AUTHORITATIVE_AUTHORIZATION_TOO_LARGE_REASON = "Authorization header is too large";
export const AUTHORITATIVE_UNSUPPORTED_MEDIA_TYPE_REASON = "Content-Type must be application/json";
export const AUTHORITATIVE_CROSS_SITE_REASON = "Cross-site requests are not allowed";

export type AuthoritativeRequestGuardFailure =
  | {
      ok: false;
      status: 413;
      body: {
        ok: false;
        code: "request_too_large";
        reason: typeof AUTHORITATIVE_BODY_TOO_LARGE_REASON;
      };
    }
  | {
      ok: false;
      status: 431;
      body: {
        ok: false;
        code: "request_header_fields_too_large";
        reason: typeof AUTHORITATIVE_AUTHORIZATION_TOO_LARGE_REASON;
      };
    }
  | {
      ok: false;
      status: 415;
      body: {
        ok: false;
        code: "unsupported_media_type";
        reason: typeof AUTHORITATIVE_UNSUPPORTED_MEDIA_TYPE_REASON;
      };
    }
  | {
      ok: false;
      status: 403;
      body: {
        ok: false;
        code: "forbidden";
        reason: typeof AUTHORITATIVE_CROSS_SITE_REASON;
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

export function checkAuthoritativeAuthorizationHeaderSize({
  headers,
  maxChars = AUTHORITATIVE_MAX_AUTHORIZATION_HEADER_CHARS,
}: {
  headers: Pick<Headers, "get">;
  maxChars?: number;
}): { ok: true } | AuthoritativeRequestGuardFailure {
  const authorization = headers.get("authorization");
  if (!authorization || authorization.length <= maxChars) return { ok: true };

  return {
    ok: false,
    status: 431,
    body: {
      ok: false,
      code: "request_header_fields_too_large",
      reason: AUTHORITATIVE_AUTHORIZATION_TOO_LARGE_REASON,
    },
  };
}

export function checkAuthoritativeContentType({
  headers,
}: {
  headers: Pick<Headers, "get">;
}): { ok: true } | AuthoritativeRequestGuardFailure {
  const contentType = headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (contentType === "application/json" || contentType?.endsWith("+json")) return { ok: true };

  return {
    ok: false,
    status: 415,
    body: {
      ok: false,
      code: "unsupported_media_type",
      reason: AUTHORITATIVE_UNSUPPORTED_MEDIA_TYPE_REASON,
    },
  };
}

export function checkAuthoritativeFetchSite({
  headers,
}: {
  headers: Pick<Headers, "get">;
}): { ok: true } | AuthoritativeRequestGuardFailure {
  const fetchSite = headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (!fetchSite || fetchSite === "same-origin" || fetchSite === "same-site" || fetchSite === "none") {
    return { ok: true };
  }

  return {
    ok: false,
    status: 403,
    body: {
      ok: false,
      code: "forbidden",
      reason: AUTHORITATIVE_CROSS_SITE_REASON,
    },
  };
}
