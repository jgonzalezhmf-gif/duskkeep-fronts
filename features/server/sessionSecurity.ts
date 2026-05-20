export const AUTH_IDLE_TIMEOUT_MS = 60 * 60 * 1000;
export const AUTH_ACTIVITY_THROTTLE_MS = 15 * 1000;
export const AUTH_SESSION_EXPIRED_NOTICE = "Session expired. Sign in again to continue.";
export const AUTH_ONLINE_PERSISTENCE_UNAVAILABLE_NOTICE =
  "Online persistence is temporarily unavailable. Try again shortly.";

export type AuthAccountLinkMode = "undecided" | "guest" | "linked";
export type AuthSessionStatus = "unconfigured" | "anonymous" | "authenticated";
export type AuthGateIntent = "entry" | "guestUpgrade";
export type AuthGateMode = "signIn" | "signUp";
export type AuthFailureReason = "unconfigured" | "invalid_credentials" | "rate_limited" | "auth_error";
export type AuthFailureNoticeKey =
  | "auth.accountRequestGeneric"
  | "auth.unconfigured"
  | "auth.invalidCredentials"
  | "auth.rateLimited"
  | "auth.providerError";
export type PasswordUpdateFailureNoticeKey = "auth.unconfigured" | "auth.rateLimited" | "auth.passwordRecoveryGenericError";
export type PasswordRecoveryRequestFailureReason = "unconfigured" | "rate_limited" | "auth_error";
export type PasswordRecoveryRequestNoticeKey = "auth.unconfigured" | "auth.rateLimited" | "auth.recoveryGeneric";
export type PasswordSetupSource = "guestUpgrade" | "passwordRecovery";
export type AuthRecoveryUrlParts = {
  pathname: string;
  search?: string;
  hash?: string;
};

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
  serverPersistenceEnabled = false,
}: {
  accountLinkMode: AuthAccountLinkMode;
  reason: string;
  serverPersistenceEnabled?: boolean;
}) {
  if (reason !== "missing_session" && reason !== "api_disabled") return false;
  if (accountLinkMode === "linked") return true;
  return serverPersistenceEnabled;
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
  return intent === "guestUpgrade" && shouldUseGenericAccountRequestError({ intent, mode: "signUp", reason });
}

export function shouldUseGenericAccountRequestError({
  intent,
  mode,
  reason,
}: {
  intent: AuthGateIntent;
  mode: AuthGateMode;
  reason: string;
}) {
  if (reason === "unconfigured" || reason === "rate_limited") return false;
  return intent === "guestUpgrade" || mode === "signUp";
}

export function getAuthFailureNoticeKey({
  intent,
  mode,
  reason,
}: {
  intent: AuthGateIntent;
  mode: AuthGateMode;
  reason: AuthFailureReason;
}): AuthFailureNoticeKey {
  if (shouldUseGenericAccountRequestError({ intent, mode, reason })) return "auth.accountRequestGeneric";

  switch (reason) {
    case "unconfigured":
      return "auth.unconfigured";
    case "invalid_credentials":
      return "auth.invalidCredentials";
    case "rate_limited":
      return "auth.rateLimited";
    case "auth_error":
    default:
      return "auth.providerError";
  }
}

export function getPasswordUpdateFailureNoticeKey(reason: AuthFailureReason): PasswordUpdateFailureNoticeKey {
  if (reason === "unconfigured") return "auth.unconfigured";
  if (reason === "rate_limited") return "auth.rateLimited";
  return "auth.passwordRecoveryGenericError";
}

export function getPasswordRecoveryRequestNoticeKey(reason: PasswordRecoveryRequestFailureReason): PasswordRecoveryRequestNoticeKey {
  if (reason === "unconfigured") return "auth.unconfigured";
  if (reason === "rate_limited") return "auth.rateLimited";
  return "auth.recoveryGeneric";
}

export function hasPasswordRecoveryUrlMarker({ search = "", hash = "" }: Pick<AuthRecoveryUrlParts, "search" | "hash">) {
  return `${hash} ${search}`.toLowerCase().includes("type=recovery");
}

export function hasGuestUpgradePasswordSetupUrlMarker({ search = "", hash = "" }: Pick<AuthRecoveryUrlParts, "search" | "hash">) {
  const marker = `${hash} ${search}`.toLowerCase();
  return marker.includes("guestupgrade=confirm");
}

export function hasPasswordSetupUrlMarker(parts: Pick<AuthRecoveryUrlParts, "search" | "hash">) {
  const marker = `${parts.hash ?? ""} ${parts.search ?? ""}`.toLowerCase();
  return hasPasswordRecoveryUrlMarker(parts) || hasGuestUpgradePasswordSetupUrlMarker(parts) || marker.includes("type=email_change");
}

export function getPasswordSetupUrlSource(
  { search = "", hash = "" }: Pick<AuthRecoveryUrlParts, "search" | "hash">,
): PasswordSetupSource | null {
  const marker = `${hash} ${search}`.toLowerCase();
  if (hasGuestUpgradePasswordSetupUrlMarker({ search, hash })) return "guestUpgrade";
  if (hasPasswordRecoveryUrlMarker({ search, hash }) || marker.includes("type=email_change")) return "passwordRecovery";
  return null;
}

export function shouldStripPasswordRecoveryUrl({ search = "", hash = "" }: Pick<AuthRecoveryUrlParts, "search" | "hash">) {
  const marker = `${hash} ${search}`.toLowerCase();
  return (
    marker.includes("access_token") ||
    marker.includes("refresh_token") ||
    marker.includes("code=") ||
    marker.includes("token_hash") ||
    marker.includes("guestupgrade=confirm") ||
    marker.includes("type=recovery") ||
    marker.includes("type=email_change")
  );
}

export function createPasswordRecoveryCleanPath({ pathname, search = "" }: AuthRecoveryUrlParts) {
  const params = new URLSearchParams(search);
  params.delete("type");
  params.delete("guestUpgrade");
  params.delete("code");
  params.delete("token_hash");
  const cleanSearch = params.toString();
  return `${pathname}${cleanSearch ? `?${cleanSearch}` : ""}`;
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
