import { describe, expect, it } from "vitest";
import {
  createPasswordRecoveryCleanPath,
  getAuthFailureNoticeKey,
  getAuthGateModeForIntent,
  getPasswordRecoveryRequestNoticeKey,
  getPasswordUpdateFailureNoticeKey,
  hasGuestUpgradePasswordSetupUrlMarker,
  hasPasswordRecoveryUrlMarker,
  hasPasswordSetupUrlMarker,
  hasAuthIdleSessionExpired,
  reconcileAuthSessionState,
  shouldBlockLocalAuthoritativeFallback,
  shouldBlockGuestUpgradeForSession,
  shouldStripPasswordRecoveryUrl,
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

  it("keeps local fallback available for guests but blocks linked accounts when online persistence is unavailable", () => {
    expect(
      shouldBlockLocalAuthoritativeFallback({
        accountLinkMode: "guest",
        reason: "missing_session",
        serverPersistenceEnabled: false,
      }),
    ).toBe(false);
    expect(
      shouldBlockLocalAuthoritativeFallback({
        accountLinkMode: "guest",
        reason: "missing_session",
        serverPersistenceEnabled: true,
      }),
    ).toBe(true);
    expect(
      shouldBlockLocalAuthoritativeFallback({
        accountLinkMode: "linked",
        reason: "api_disabled",
      }),
    ).toBe(true);
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

  it("maps auth failures to user-safe notice keys", () => {
    expect(getAuthFailureNoticeKey({ intent: "entry", mode: "signIn", reason: "invalid_credentials" })).toBe("auth.invalidCredentials");
    expect(getAuthFailureNoticeKey({ intent: "entry", mode: "signIn", reason: "auth_error" })).toBe("auth.providerError");
    expect(getAuthFailureNoticeKey({ intent: "entry", mode: "signUp", reason: "invalid_credentials" })).toBe("auth.accountRequestGeneric");
    expect(getAuthFailureNoticeKey({ intent: "entry", mode: "signUp", reason: "auth_error" })).toBe("auth.accountRequestGeneric");
    expect(getAuthFailureNoticeKey({ intent: "guestUpgrade", mode: "signUp", reason: "invalid_credentials" })).toBe("auth.accountRequestGeneric");
    expect(getAuthFailureNoticeKey({ intent: "guestUpgrade", mode: "signUp", reason: "auth_error" })).toBe("auth.accountRequestGeneric");
    expect(getAuthFailureNoticeKey({ intent: "guestUpgrade", mode: "signUp", reason: "unconfigured" })).toBe("auth.unconfigured");
    expect(getAuthFailureNoticeKey({ intent: "entry", mode: "signUp", reason: "rate_limited" })).toBe("auth.rateLimited");
  });

  it("maps password update failures without exposing recovery token details", () => {
    expect(getPasswordUpdateFailureNoticeKey("unconfigured")).toBe("auth.unconfigured");
    expect(getPasswordUpdateFailureNoticeKey("rate_limited")).toBe("auth.rateLimited");
    expect(getPasswordUpdateFailureNoticeKey("invalid_credentials")).toBe("auth.passwordRecoveryGenericError");
    expect(getPasswordUpdateFailureNoticeKey("auth_error")).toBe("auth.passwordRecoveryGenericError");
  });

  it("maps password recovery request failures without exposing account existence", () => {
    expect(getPasswordRecoveryRequestNoticeKey("unconfigured")).toBe("auth.unconfigured");
    expect(getPasswordRecoveryRequestNoticeKey("rate_limited")).toBe("auth.rateLimited");
    expect(getPasswordRecoveryRequestNoticeKey("auth_error")).toBe("auth.recoveryGeneric");
  });

  it("detects password recovery links and strips recovery tokens from the visible URL", () => {
    expect(hasPasswordRecoveryUrlMarker({ search: "?type=recovery", hash: "" })).toBe(true);
    expect(hasPasswordRecoveryUrlMarker({ search: "", hash: "#access_token=secret&type=recovery" })).toBe(true);
    expect(hasPasswordRecoveryUrlMarker({ search: "?next=/home", hash: "" })).toBe(false);
    expect(hasGuestUpgradePasswordSetupUrlMarker({ search: "?guestUpgrade=confirm", hash: "" })).toBe(true);
    expect(hasGuestUpgradePasswordSetupUrlMarker({ search: "", hash: "#access_token=secret&type=email_change" })).toBe(true);
    expect(hasPasswordSetupUrlMarker({ search: "?guestUpgrade=confirm", hash: "" })).toBe(true);

    expect(shouldStripPasswordRecoveryUrl({ search: "?type=recovery&next=/home", hash: "" })).toBe(true);
    expect(shouldStripPasswordRecoveryUrl({ search: "?guestUpgrade=confirm&code=secret", hash: "" })).toBe(true);
    expect(shouldStripPasswordRecoveryUrl({ search: "?next=/home", hash: "#access_token=secret&refresh_token=secret" })).toBe(true);
    expect(shouldStripPasswordRecoveryUrl({ search: "?guestUpgrade=confirm", hash: "#type=email_change&access_token=secret" })).toBe(true);
    expect(shouldStripPasswordRecoveryUrl({ search: "?next=/home", hash: "#safe=1" })).toBe(false);

    expect(createPasswordRecoveryCleanPath({ pathname: "/home", search: "?type=recovery&next=%2Fdeck", hash: "#access_token=secret" })).toBe(
      "/home?next=%2Fdeck",
    );
    expect(createPasswordRecoveryCleanPath({ pathname: "/home", search: "?guestUpgrade=confirm", hash: "#type=email_change" })).toBe("/home");
    expect(createPasswordRecoveryCleanPath({ pathname: "/home", search: "?guestUpgrade=confirm&code=secret&next=%2Fhome" })).toBe(
      "/home?next=%2Fhome",
    );
    expect(createPasswordRecoveryCleanPath({ pathname: "/home", search: "?type=recovery", hash: "#refresh_token=secret" })).toBe("/home");
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

  it("shows the entry auth gate for undecided players after intro and keeps linked players inside the game", () => {
    expect(
      shouldShowEntryAuthGate({
        hydrated: true,
        introEligible: true,
        showIntro: false,
        accountLinkMode: "undecided",
        guestChoiceResolvedThisPageLoad: false,
      }),
    ).toBe(true);
    expect(
      shouldShowEntryAuthGate({
        hydrated: true,
        introEligible: true,
        showIntro: false,
        accountLinkMode: "linked",
        guestChoiceResolvedThisPageLoad: false,
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
