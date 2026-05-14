import { describe, expect, it } from "vitest";
import {
  getAuthGateModeForIntent,
  hasAuthIdleSessionExpired,
  reconcileAuthSessionState,
  shouldBlockLocalAuthoritativeFallback,
  shouldBlockGuestUpgradeForSession,
  shouldUseGenericAccountRequestError,
  shouldRecordAuthActivity,
  shouldShowEntryAuthGate,
  shouldUseGenericGuestUpgradeError,
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

  it("reconciles anonymous authenticated sessions as guest server sessions", () => {
    expect(
      reconcileAuthSessionState({
        accountLinkMode: "undecided",
        sessionStatus: "authenticated",
        sessionIsAnonymous: true,
      }),
    ).toEqual({
      accountLinkMode: "guest",
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

  it("forces guest account upgrades through account creation only", () => {
    expect(getAuthGateModeForIntent({ intent: "guestUpgrade", requestedMode: "signIn" })).toBe("signUp");
    expect(getAuthGateModeForIntent({ intent: "guestUpgrade", requestedMode: "signUp" })).toBe("signUp");
    expect(getAuthGateModeForIntent({ intent: "entry", requestedMode: "signIn" })).toBe("signIn");
  });

  it("blocks guest upgrades when a session is already authenticated", () => {
    expect(shouldBlockGuestUpgradeForSession({ intent: "guestUpgrade", sessionStatus: "authenticated" })).toBe(true);
    expect(
      shouldBlockGuestUpgradeForSession({
        intent: "guestUpgrade",
        sessionStatus: "authenticated",
        sessionIsAnonymous: true,
      }),
    ).toBe(false);
    expect(shouldBlockGuestUpgradeForSession({ intent: "guestUpgrade", sessionStatus: "anonymous" })).toBe(false);
    expect(shouldBlockGuestUpgradeForSession({ intent: "entry", sessionStatus: "authenticated" })).toBe(false);
  });

  it("uses generic account request errors for guest upgrades without hiding config or rate-limit states", () => {
    expect(shouldUseGenericGuestUpgradeError({ intent: "guestUpgrade", reason: "invalid_credentials" })).toBe(true);
    expect(shouldUseGenericGuestUpgradeError({ intent: "guestUpgrade", reason: "auth_error" })).toBe(true);
    expect(shouldUseGenericGuestUpgradeError({ intent: "guestUpgrade", reason: "unconfigured" })).toBe(false);
    expect(shouldUseGenericGuestUpgradeError({ intent: "guestUpgrade", reason: "rate_limited" })).toBe(false);
    expect(shouldUseGenericGuestUpgradeError({ intent: "entry", reason: "invalid_credentials" })).toBe(false);
  });

  it("uses generic account request errors for registration to avoid account enumeration", () => {
    expect(shouldUseGenericAccountRequestError({ intent: "entry", mode: "signUp", reason: "invalid_credentials" })).toBe(true);
    expect(shouldUseGenericAccountRequestError({ intent: "entry", mode: "signUp", reason: "auth_error" })).toBe(true);
    expect(shouldUseGenericAccountRequestError({ intent: "entry", mode: "signUp", reason: "unconfigured" })).toBe(false);
    expect(shouldUseGenericAccountRequestError({ intent: "entry", mode: "signUp", reason: "rate_limited" })).toBe(false);
    expect(shouldUseGenericAccountRequestError({ intent: "entry", mode: "signIn", reason: "invalid_credentials" })).toBe(false);
  });

  it("shows the entry auth gate for guests once per page load so they can choose login or continue guest", () => {
    expect(
      shouldShowEntryAuthGate({
        hydrated: true,
        introEligible: true,
        showIntro: false,
        accountLinkMode: "guest",
        guestChoiceResolvedThisPageLoad: false,
      }),
    ).toBe(true);
    expect(
      shouldShowEntryAuthGate({
        hydrated: true,
        introEligible: true,
        showIntro: false,
        accountLinkMode: "guest",
        guestChoiceResolvedThisPageLoad: true,
      }),
    ).toBe(false);
  });

  it("only shows the entry auth gate after hydration and after the intro is no longer active", () => {
    expect(
      shouldShowEntryAuthGate({
        hydrated: false,
        introEligible: true,
        showIntro: false,
        accountLinkMode: "undecided",
        guestChoiceResolvedThisPageLoad: false,
      }),
    ).toBe(false);
    expect(
      shouldShowEntryAuthGate({
        hydrated: true,
        introEligible: true,
        showIntro: true,
        accountLinkMode: "undecided",
        guestChoiceResolvedThisPageLoad: false,
      }),
    ).toBe(false);
    expect(
      shouldShowEntryAuthGate({
        hydrated: true,
        introEligible: false,
        showIntro: false,
        accountLinkMode: "undecided",
        guestChoiceResolvedThisPageLoad: false,
      }),
    ).toBe(false);
  });
});
