import { describe, expect, it, vi } from "vitest";
import {
  createAuthoritativeSecurityEvent,
  getSafeOperationType,
  logAuthoritativeSecurityEvent,
  resolveAuthoritativeSecurityEventSink,
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

  it("logs structured JSON only through the provided logger", async () => {
    const warn = vi.fn();
    const event = createAuthoritativeSecurityEvent({
      stage: "global_rate_limit",
      status: 429,
      code: "rate_limited",
      identityKey: "ip:abc123",
      now: new Date("2026-05-15T10:00:00.000Z"),
    });

    await logAuthoritativeSecurityEvent(event, { logger: { warn } });

    expect(warn).toHaveBeenCalledWith(JSON.stringify(event));
  });

  it("can disable the security event sink by environment", async () => {
    const warn = vi.fn();
    const fetchImpl = vi.fn();
    const event = createAuthoritativeSecurityEvent({
      stage: "request_guard",
      status: 415,
      code: "unsupported_media_type",
      now: new Date("2026-05-15T10:00:00.000Z"),
    });

    await logAuthoritativeSecurityEvent(event, {
      env: { AUTHORITATIVE_SECURITY_EVENT_SINK: "disabled", NODE_ENV: "production" },
      logger: { warn },
      fetchImpl,
    });

    expect(warn).not.toHaveBeenCalled();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts sanitized events to a configured HTTPS webhook", async () => {
    const warn = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 202 });
    const event = createAuthoritativeSecurityEvent({
      stage: "rpc",
      status: 409,
      code: "idempotency_conflict",
      operationType: "purchaseShopOffer",
      identityKey: "auth:abcdef",
      now: new Date("2026-05-15T10:00:00.000Z"),
    });

    await logAuthoritativeSecurityEvent(event, {
      env: {
        AUTHORITATIVE_SECURITY_EVENT_SINK: "webhook",
        AUTHORITATIVE_SECURITY_EVENT_WEBHOOK_URL: "https://observability.example/events",
        AUTHORITATIVE_SECURITY_EVENT_WEBHOOK_TIMEOUT_MS: "500",
        NODE_ENV: "production",
      },
      logger: { warn },
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://observability.example/events",
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(event),
      }),
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it("falls back to console when webhook URL is not production-safe", () => {
    expect(
      resolveAuthoritativeSecurityEventSink({
        AUTHORITATIVE_SECURITY_EVENT_SINK: "webhook",
        AUTHORITATIVE_SECURITY_EVENT_WEBHOOK_URL: "http://attacker.example/events",
        NODE_ENV: "production",
      }),
    ).toEqual({ mode: "console" });

    expect(
      resolveAuthoritativeSecurityEventSink({
        AUTHORITATIVE_SECURITY_EVENT_SINK: "webhook",
        AUTHORITATIVE_SECURITY_EVENT_WEBHOOK_URL: "http://localhost:4000/events",
        NODE_ENV: "development",
      }),
    ).toEqual({ mode: "webhook", url: "http://localhost:4000/events", timeoutMs: 1500 });
  });
});
