import { describe, expect, it } from "vitest";
import {
  createAuthoritativeRequestId,
  sanitizeAuthoritativeRequestId,
} from "@/features/server/authoritativeRequestId";

describe("authoritative request ids", () => {
  it("creates bounded opaque request ids", () => {
    const requestId = createAuthoritativeRequestId(1_700_000_000_000, "550e8400-e29b-41d4-a716-446655440000");

    expect(requestId).toBe("authreq_loyw3v28_550e8400-e29b-41d4-a716-446655440000");
    expect(requestId.length).toBeLessThanOrEqual(96);
  });

  it("sanitizes unsafe external values defensively", () => {
    expect(sanitizeAuthoritativeRequestId(" request\nwith<script> ")).toBe("request_with_script_");
  });
});
