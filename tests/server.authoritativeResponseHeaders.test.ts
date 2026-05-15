import { describe, expect, it } from "vitest";
import {
  AUTHORITATIVE_CACHE_CONTROL,
  AUTHORITATIVE_PRAGMA,
  AUTHORITATIVE_REQUEST_ID_HEADER,
  mergeAuthoritativeResponseHeaders,
} from "@/features/server/authoritativeResponseHeaders";

describe("authoritative response headers", () => {
  it("marks authoritative API responses as non-cacheable", () => {
    const headers = mergeAuthoritativeResponseHeaders();

    expect(headers.get("Cache-Control")).toBe(AUTHORITATIVE_CACHE_CONTROL);
    expect(headers.get("Pragma")).toBe(AUTHORITATIVE_PRAGMA);
  });

  it("preserves operational headers while enforcing no-store", () => {
    const headers = mergeAuthoritativeResponseHeaders({
      "Cache-Control": "public, max-age=3600",
      "Retry-After": "30",
    });

    expect(headers.get("Cache-Control")).toBe(AUTHORITATIVE_CACHE_CONTROL);
    expect(headers.get("Pragma")).toBe(AUTHORITATIVE_PRAGMA);
    expect(headers.get("Retry-After")).toBe("30");
  });

  it("adds a request id header when provided", () => {
    const headers = mergeAuthoritativeResponseHeaders(undefined, { requestId: "authreq_test_123" });

    expect(headers.get(AUTHORITATIVE_REQUEST_ID_HEADER)).toBe("authreq_test_123");
  });
});
