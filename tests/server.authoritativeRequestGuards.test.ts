import { describe, expect, it } from "vitest";
import {
  AUTHORITATIVE_BODY_TOO_LARGE_REASON,
  checkAuthoritativeBodySize,
} from "@/features/server/authoritativeRequestGuards";

function headers(contentLength?: string) {
  return {
    get(name: string) {
      return name.toLowerCase() === "content-length" ? contentLength ?? null : null;
    },
  };
}

describe("authoritative request guards", () => {
  it("allows requests without content-length because chunked bodies are still parsed by Next", () => {
    expect(checkAuthoritativeBodySize({ headers: headers() })).toEqual({ ok: true });
  });

  it("allows bodies at the configured limit", () => {
    expect(checkAuthoritativeBodySize({ headers: headers("1024"), maxBytes: 1024 })).toEqual({ ok: true });
  });

  it("rejects bodies above the configured limit before JSON parsing", () => {
    expect(checkAuthoritativeBodySize({ headers: headers("1025"), maxBytes: 1024 })).toEqual({
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
    expect(checkAuthoritativeBodySize({ headers: headers("not-a-number"), maxBytes: 1024 })).toEqual({ ok: true });
  });
});
