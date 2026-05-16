import {
  AUTH_ONLINE_PERSISTENCE_UNAVAILABLE_NOTICE,
  AUTH_SESSION_EXPIRED_NOTICE,
  shouldBlockLocalAuthoritativeFallback,
} from "@/features/server/sessionSecurity";
import { isServerAuthoritativePersistenceEnabled } from "@/lib/persistedGameState";
import type { AccountLinkMode, NotificationKind } from "@/lib/storeTypes";

export const CLIENT_SENSITIVE_MUTATION_BLOCKED_NOTICE =
  "Online progress must be validated by the server. Try again shortly.";

export type LocalAuthoritativeFallbackBlock = {
  blocked: true;
  accountLinkMode: AccountLinkMode;
  notification: {
    kind: NotificationKind;
    message: string;
  };
};

export type LocalAuthoritativeFallbackDecision = { blocked: false } | LocalAuthoritativeFallbackBlock;

export type ClientSensitiveMutationDecision =
  | { blocked: false }
  | {
      blocked: true;
      notification: {
        kind: NotificationKind;
        message: string;
      };
    };

export function createClientSensitiveMutationDecision(input: {
  accountLinkMode: AccountLinkMode;
  serverPersistenceEnabled?: boolean;
}): ClientSensitiveMutationDecision {
  const serverPersistenceEnabled = input.serverPersistenceEnabled ?? isServerAuthoritativePersistenceEnabled();
  if (!serverPersistenceEnabled) return { blocked: false };
  if (input.accountLinkMode === "undecided") return { blocked: false };

  return {
    blocked: true,
    notification: {
      kind: "error",
      message: CLIENT_SENSITIVE_MUTATION_BLOCKED_NOTICE,
    },
  };
}

export function createLocalAuthoritativeFallbackDecision(input: {
  accountLinkMode: AccountLinkMode;
  reason: string;
  serverPersistenceEnabled?: boolean;
}): LocalAuthoritativeFallbackDecision {
  const serverPersistenceEnabled = input.serverPersistenceEnabled ?? isServerAuthoritativePersistenceEnabled();
  if (!shouldBlockLocalAuthoritativeFallback({ ...input, serverPersistenceEnabled })) {
    return { blocked: false };
  }

  if (input.reason === "api_disabled") {
    return {
      blocked: true,
      accountLinkMode: input.accountLinkMode,
      notification: {
        kind: "error",
        message: AUTH_ONLINE_PERSISTENCE_UNAVAILABLE_NOTICE,
      },
    };
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
