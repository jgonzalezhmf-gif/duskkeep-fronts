export const AUTH_IDLE_TIMEOUT_MS = 60 * 60 * 1000;
export const AUTH_ACTIVITY_THROTTLE_MS = 15 * 1000;
export const AUTH_SESSION_EXPIRED_NOTICE = "Session expired. Sign in again to continue.";

export type AuthAccountLinkMode = "undecided" | "guest" | "linked";
export type AuthSessionStatus = "unconfigured" | "anonymous" | "authenticated";
export type AuthGateIntent = "entry" | "guestUpgrade";
export type AuthGateMode = "signIn" | "signUp";

export function reconcileAuthSessionState({
  accountLinkMode,
  sessionStatus,
  sessionIsAnonymous = false,
}: {
  accountLinkMode: AuthAccountLinkMode;
  sessionStatus: AuthSessionStatus;
  sessionIsAnonymous?: boolean;
}): { accountLinkMode: AuthAccountLinkMode; requiresLogin: boolean } {
  if (sessionStatus === "authenticated") {
    if (sessionIsAnonymous) {
      return { accountLinkMode: "guest", requiresLogin: false };
    }
    return { accountLinkMode: "linked", requiresLogin: false };
  }

  if (accountLinkMode !== "linked") {
    return { accountLinkMode, requiresLogin: false };
  }

  if (sessionStatus === "unconfigured") {
    return { accountLinkMode: "guest", requiresLogin: false };
  }

  return { accountLinkMode: "undecided", requiresLogin: true };
}

export function shouldBlockLocalAuthoritativeFallback({
  accountLinkMode,
  reason,
}: {
  accountLinkMode: AuthAccountLinkMode;
  reason: string;
}) {
  return accountLinkMode === "linked" && reason === "missing_session";
}

export function getAuthGateModeForIntent({
  intent,
  requestedMode,
}: {
  intent: AuthGateIntent;
  requestedMode: AuthGateMode;
}): AuthGateMode {
  return intent === "guestUpgrade" ? "signUp" : requestedMode;
}

export function shouldBlockGuestUpgradeForSession({
  intent,
  sessionStatus,
  sessionIsAnonymous = false,
}: {
  intent: AuthGateIntent;
  sessionStatus: AuthSessionStatus;
  sessionIsAnonymous?: boolean;
}) {
  return intent === "guestUpgrade" && sessionStatus === "authenticated" && !sessionIsAnonymous;
}

export function shouldUseGenericGuestUpgradeError({
  intent,
  reason,
}: {
  intent: AuthGateIntent;
  reason: string;
}) {
  return intent === "guestUpgrade" && reason !== "unconfigured" && reason !== "rate_limited";
}

export function shouldShowEntryAuthGate({
  hydrated,
  introEligible,
  showIntro,
  accountLinkMode,
  guestChoiceResolvedThisPageLoad,
}: {
  hydrated: boolean;
  introEligible: boolean;
  showIntro: boolean;
  accountLinkMode: AuthAccountLinkMode;
  guestChoiceResolvedThisPageLoad: boolean;
}) {
  if (!hydrated || !introEligible || showIntro) return false;
  if (accountLinkMode === "undecided") return true;
  return accountLinkMode === "guest" && !guestChoiceResolvedThisPageLoad;
}

export function hasAuthIdleSessionExpired({
  linked,
  lastActivityAt,
  now,
  idleTimeoutMs = AUTH_IDLE_TIMEOUT_MS,
}: {
  linked: boolean;
  lastActivityAt: number;
  now: number;
  idleTimeoutMs?: number;
}) {
  return linked && now - lastActivityAt >= idleTimeoutMs;
}

export function shouldRecordAuthActivity({
  lastRecordedAt,
  now,
  throttleMs = AUTH_ACTIVITY_THROTTLE_MS,
}: {
  lastRecordedAt: number;
  now: number;
  throttleMs?: number;
}) {
  return now - lastRecordedAt >= throttleMs;
}
