import type { AccountLinkMode } from "@/lib/storeTypes";

type BattleOutcomePersistenceInput = {
  accountLinkMode: AccountLinkMode;
  adventureLevelActive: boolean;
  adventureClaimSucceeded: boolean;
  serverPersistenceEnabled?: boolean;
};

export function shouldPersistBattleOutcome({
  accountLinkMode,
  adventureLevelActive,
  adventureClaimSucceeded,
  serverPersistenceEnabled = false,
}: BattleOutcomePersistenceInput) {
  if (adventureLevelActive) return adventureClaimSucceeded;
  if (serverPersistenceEnabled) return false;
  return accountLinkMode !== "linked";
}

export function shouldRecordLocalBattleOutcome({
  accountLinkMode,
  serverPersistenceEnabled = false,
}: Pick<BattleOutcomePersistenceInput, "accountLinkMode" | "serverPersistenceEnabled">) {
  if (serverPersistenceEnabled) return false;
  return accountLinkMode !== "linked";
}
