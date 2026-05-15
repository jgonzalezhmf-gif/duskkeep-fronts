import {
  AUTH_SESSION_EXPIRED_NOTICE,
  shouldBlockLocalAuthoritativeFallback,
} from "@/features/server/sessionSecurity";
import type { AccountLinkMode, NotificationKind } from "@/lib/storeTypes";

export type LocalAuthoritativeFallbackBlock = {
  blocked: true;
  accountLinkMode: AccountLinkMode;
  notification: {
    kind: NotificationKind;
    message: string;
  };
};

export type LocalAuthoritativeFallbackDecision = { blocked: false } | LocalAuthoritativeFallbackBlock;

export function createLocalAuthoritativeFallbackDecision(input: {
  accountLinkMode: AccountLinkMode;
  reason: string;
}): LocalAuthoritativeFallbackDecision {
  if (!shouldBlockLocalAuthoritativeFallback(input)) {
    return { blocked: false };
  }

  return {
    blocked: true,
    accountLinkMode: "undecided",
    notification: {
      kind: "info",
      message: AUTH_SESSION_EXPIRED_NOTICE,
    },
  };
}
