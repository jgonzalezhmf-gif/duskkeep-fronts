import { describe, expect, it } from "vitest";
import {
  AUTHORITATIVE_AUTHORIZATION_TOO_LARGE_REASON,
  AUTHORITATIVE_BODY_TOO_LARGE_REASON,
  AUTHORITATIVE_CROSS_SITE_REASON,
  AUTHORITATIVE_UNSUPPORTED_MEDIA_TYPE_REASON,
  checkAuthoritativeAuthorizationHeaderSize,
  checkAuthoritativeBodySize,
  checkAuthoritativeContentType,
  checkAuthoritativeFetchSite,
} from "@/features/server/authoritativeRequestGuards";

function headers({
  contentLength,
  contentType,
  authorization,
  fetchSite,
}: {
  contentLength?: string;
  contentType?: string;
  authorization?: string;
  fetchSite?: string;
} = {}) {
  return {
    get(name: string) {
      const normalized = name.toLowerCase();
      if (normalized === "authorization") return authorization ?? null;
      if (normalized === "content-length") return contentLength ?? null;
      if (normalized === "content-type") return contentType ?? null;
      if (normalized === "sec-fetch-site") return fetchSite ?? null;
      return null;
    },
  };
}

describe("authoritative request guards", () => {
  it("allows requests without content-length because chunked bodies are still parsed by Next", () => {
    expect(checkAuthoritativeBodySize({ headers: headers() })).toEqual({ ok: true });
  });

  it("allows bodies at the configured limit", () => {
    expect(checkAuthoritativeBodySize({ headers: headers({ contentLength: "1024" }), maxBytes: 1024 })).toEqual({ ok: true });
  });

  it("rejects bodies above the configured limit before JSON parsing", () => {
    expect(checkAuthoritativeBodySize({ headers: headers({ contentLength: "1025" }), maxBytes: 1024 })).toEqual({
      ok: false,
      status: 413,
      body: {
        ok: false,
        code: "request_too_large",
        reason: AUTHORITATIVE_BODY_TOO_LARGE_REASON,
      },
    });
  });

  it("does not expose parser details for malformed content-length headers", () => {
    expect(checkAuthoritativeBodySize({ headers: headers({ contentLength: "not-a-number" }), maxBytes: 1024 })).toEqual({ ok: true });
  });

  it("allows JSON content types including charset parameters and vendor JSON", () => {
    expect(checkAuthoritativeContentType({ headers: headers({ contentType: "application/json; charset=utf-8" }) })).toEqual({ ok: true });
    expect(checkAuthoritativeContentType({ headers: headers({ contentType: "application/vnd.duskkeep+json" }) })).toEqual({ ok: true });
  });

  it("rejects missing or non-JSON content types before body parsing", () => {
    expect(checkAuthoritativeContentType({ headers: headers() })).toEqual({
      ok: false,
      status: 415,
      body: {
        ok: false,
        code: "unsupported_media_type",
        reason: AUTHORITATIVE_UNSUPPORTED_MEDIA_TYPE_REASON,
      },
    });

    expect(checkAuthoritativeContentType({ headers: headers({ contentType: "text/plain" }) })).toEqual({
      ok: false,
      status: 415,
      body: {
        ok: false,
        code: "unsupported_media_type",
        reason: AUTHORITATIVE_UNSUPPORTED_MEDIA_TYPE_REASON,
      },
    });
  });

  it("allows missing or bounded authorization headers", () => {
    expect(checkAuthoritativeAuthorizationHeaderSize({ headers: headers(), maxChars: 12 })).toEqual({ ok: true });
    expect(checkAuthoritativeAuthorizationHeaderSize({ headers: headers({ authorization: "Bearer abcdef" }), maxChars: 13 })).toEqual({ ok: true });
  });

  it("rejects oversized authorization headers before rate limiting or proxy preparation", () => {
    expect(checkAuthoritativeAuthorizationHeaderSize({ headers: headers({ authorization: "Bearer abcdef" }), maxChars: 12 })).toEqual({
      ok: false,
      status: 431,
      body: {
        ok: false,
        code: "request_header_fields_too_large",
        reason: AUTHORITATIVE_AUTHORIZATION_TOO_LARGE_REASON,
      },
    });
  });

  it("allows same-origin, same-site and non-browser requests by fetch metadata", () => {
    expect(checkAuthoritativeFetchSite({ headers: headers() })).toEqual({ ok: true });
    expect(checkAuthoritativeFetchSite({ headers: headers({ fetchSite: "same-origin" }) })).toEqual({ ok: true });
    expect(checkAuthoritativeFetchSite({ headers: headers({ fetchSite: "same-site" }) })).toEqual({ ok: true });
    expect(checkAuthoritativeFetchSite({ headers: headers({ fetchSite: "none" }) })).toEqual({ ok: true });
  });

  it("rejects browser cross-site requests before rate limiting or body parsing", () => {
    expect(checkAuthoritativeFetchSite({ headers: headers({ fetchSite: "cross-site" }) })).toEqual({
      ok: false,
      status: 403,
      body: {
        ok: false,
        code: "forbidden",
        reason: AUTHORITATIVE_CROSS_SITE_REASON,
      },
    });
  });
});
