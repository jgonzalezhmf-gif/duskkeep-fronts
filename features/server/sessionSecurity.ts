export const AUTH_IDLE_TIMEOUT_MS = 60 * 60 * 1000;
export const AUTH_ACTIVITY_THROTTLE_MS = 15 * 1000;

export type AuthAccountLinkMode = "undecided" | "guest" | "linked";
export type AuthSessionStatus = "unconfigured" | "anonymous" | "authenticated";

export function reconcileAuthSessionState({
  accountLinkMode,
  sessionStatus,
}: {
  accountLinkMode: AuthAccountLinkMode;
  sessionStatus: AuthSessionStatus;
}): { accountLinkMode: AuthAccountLinkMode; requiresLogin: boolean } {
  if (sessionStatus === "authenticated") {
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
