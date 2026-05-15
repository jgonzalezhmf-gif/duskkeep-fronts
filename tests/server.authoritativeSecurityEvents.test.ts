import { describe, expect, it, vi } from "vitest";
import {
  createAuthoritativeSecurityEvent,
  getSafeOperationType,
  logAuthoritativeSecurityEvent,
} from "@/features/server/authoritativeSecurityEvents";

describe("authoritative security events", () => {
  it("creates sanitized security events without request payloads or tokens", () => {
    const event = createAuthoritativeSecurityEvent({
      stage: "request_validation",
      status: 400,
      code: "invalid_request",
      operationType: "purchaseShopOffer<script>",
      identityKey: "auth:abcdef1234567890",
      now: new Date("2026-05-15T10:00:00.000Z"),
    });

    expect(event).toEqual({
      event: "authoritative_api",
      stage: "request_validation",
      status: 400,
      code: "invalid_request",
      operationType: "purchaseShopOffer_script_",
      identityKey: "auth:abcdef1234567890",
      at: "2026-05-15T10:00:00.000Z",
    });

    const serialized = JSON.stringify(event);
    expect(serialized).not.toContain("Bearer");
    expect(serialized).not.toContain("payload");
    expect(serialized).not.toContain("rewards");
    expect(serialized).not.toContain("resources");
  });

  it("extracts only a safe operation type from unknown request bodies", () => {
    expect(getSafeOperationType({ operationType: "recordArenaResult" })).toBe("recordArenaResult");
    expect(getSafeOperationType({ operationType: "bad op\nwith spaces" })).toBe("bad_op_with_spaces");
    expect(getSafeOperationType({ operationType: 123 })).toBeUndefined();
    expect(getSafeOperationType(null)).toBeUndefined();
  });

  it("logs structured JSON only through the provided logger", () => {
    const warn = vi.fn();
    const event = createAuthoritativeSecurityEvent({
      stage: "global_rate_limit",
      status: 429,
      code: "rate_limited",
      identityKey: "ip:abc123",
      now: new Date("2026-05-15T10:00:00.000Z"),
    });

    logAuthoritativeSecurityEvent(event, { warn });

    expect(warn).toHaveBeenCalledWith(JSON.stringify(event));
  });
});
