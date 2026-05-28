import { isServerAuthoritativePersistenceEnabled } from "@/lib/persistedGameState";
import {
  createClientSensitiveMutationDecision,
  createLocalAuthoritativeFallbackDecision,
} from "@/lib/storeAuthoritativeFallback";
import type { GameActions, GameState } from "@/lib/storeTypes";

type StoreSetPatch = (patch: Partial<GameState & GameActions>) => void;
type StoreGetState = () => GameState & GameActions;

export function blockLocalAuthoritativeFallbackIfNeeded(
  reason: string,
  set: StoreSetPatch,
  get: StoreGetState,
) {
  const decision = createLocalAuthoritativeFallbackDecision({
    accountLinkMode: get().accountLinkMode,
    reason,
  });
  if (!decision.blocked) {
    return false;
  }

  set({ accountLinkMode: decision.accountLinkMode });
  get().pushNotification(decision.notification.kind, decision.notification.message);
  return true;
}

export function blockClientSensitiveMutationIfNeeded(get: StoreGetState) {
  const decision = createClientSensitiveMutationDecision({
    accountLinkMode: get().accountLinkMode,
  });
  if (!decision.blocked) return false;

  get().pushNotification(decision.notification.kind, decision.notification.message);
  return true;
}

export function shouldRefreshServerSnapshotAfterMutation(get: StoreGetState) {
  const accountLinkMode = get().accountLinkMode;
  return accountLinkMode === "linked" || (accountLinkMode === "guest" && isServerAuthoritativePersistenceEnabled());
}

export async function refreshServerSnapshotAfterAuthoritativeMutation(get: StoreGetState) {
  if (!shouldRefreshServerSnapshotAfterMutation(get)) return;
  await get().loadServerSnapshotOnlineFirst();
}
