import { describe, expect, it } from "vitest";
import { AUTH_SESSION_EXPIRED_NOTICE } from "@/features/server/sessionSecurity";
import { createLocalAuthoritativeFallbackDecision } from "@/lib/storeAuthoritativeFallback";

describe("store authoritative fallback decision", () => {
  it("blocks linked accounts when an authoritative operation has no session", () => {
    expect(
      createLocalAuthoritativeFallbackDecision({
        accountLinkMode: "linked",
        reason: "missing_session",
      }),
    ).toEqual({
      blocked: true,
      accountLinkMode: "undecided",
      notification: {
        kind: "info",
        message: AUTH_SESSION_EXPIRED_NOTICE,
      },
    });
  });

  it("keeps guest local fallback available for offline alpha play", () => {
    expect(
      createLocalAuthoritativeFallbackDecision({
        accountLinkMode: "guest",
        reason: "missing_session",
      }),
    ).toEqual({ blocked: false });
  });

  it("does not convert authoritative server rejections into local fallback blocks", () => {
    expect(
      createLocalAuthoritativeFallbackDecision({
        accountLinkMode: "linked",
        reason: "Shop offer is not available",
      }),
    ).toEqual({ blocked: false });
  });
});
