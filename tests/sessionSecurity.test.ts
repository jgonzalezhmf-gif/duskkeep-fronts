import { describe, expect, it } from "vitest";
import {
  hasAuthIdleSessionExpired,
  reconcileAuthSessionState,
  shouldBlockLocalAuthoritativeFallback,
  shouldRecordAuthActivity,
} from "@/features/server/sessionSecurity";

describe("auth session security helpers", () => {
  it("expires linked sessions only after the idle timeout", () => {
    expect(
      hasAuthIdleSessionExpired({
        linked: true,
        lastActivityAt: 1_000,
        now: 5_000,
        idleTimeoutMs: 4_000,
      }),
    ).toBe(true);

    expect(
      hasAuthIdleSessionExpired({
        linked: true,
        lastActivityAt: 1_000,
        now: 4_999,
        idleTimeoutMs: 4_000,
      }),
    ).toBe(false);
  });

  it("does not expire guest or undecided sessions", () => {
    expect(
      hasAuthIdleSessionExpired({
        linked: false,
        lastActivityAt: 1_000,
        now: 99_000,
        idleTimeoutMs: 4_000,
      }),
    ).toBe(false);
  });

  it("throttles activity writes", () => {
    expect(shouldRecordAuthActivity({ lastRecordedAt: 1_000, now: 14_999, throttleMs: 14_000 })).toBe(false);
    expect(shouldRecordAuthActivity({ lastRecordedAt: 1_000, now: 15_000, throttleMs: 14_000 })).toBe(true);
  });

  it("reconciles authenticated sessions as linked", () => {
    expect(reconcileAuthSessionState({ accountLinkMode: "guest", sessionStatus: "authenticated" })).toEqual({
      accountLinkMode: "linked",
      requiresLogin: false,
    });
  });

  it("requires login when a linked account has no active session", () => {
    expect(reconcileAuthSessionState({ accountLinkMode: "linked", sessionStatus: "anonymous" })).toEqual({
      accountLinkMode: "undecided",
      requiresLogin: true,
    });
  });

  it("falls back to guest when auth is not configured", () => {
    expect(reconcileAuthSessionState({ accountLinkMode: "linked", sessionStatus: "unconfigured" })).toEqual({
      accountLinkMode: "guest",
      requiresLogin: false,
    });
  });

  it("blocks local authoritative fallback when a linked account has no session", () => {
    expect(
      shouldBlockLocalAuthoritativeFallback({
        accountLinkMode: "linked",
        reason: "missing_session",
      }),
    ).toBe(true);
  });

  it("keeps local fallback available for guests and non-session reasons", () => {
    expect(
      shouldBlockLocalAuthoritativeFallback({
        accountLinkMode: "guest",
        reason: "missing_session",
      }),
    ).toBe(false);
    expect(
      shouldBlockLocalAuthoritativeFallback({
        accountLinkMode: "linked",
        reason: "api_disabled",
      }),
    ).toBe(false);
  });
});
