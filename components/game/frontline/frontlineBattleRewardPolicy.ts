import type { AccountLinkMode } from "@/lib/storeTypes";

type BattleOutcomePersistenceInput = {
  accountLinkMode: AccountLinkMode;
  adventureLevelActive: boolean;
  adventureClaimSucceeded: boolean;
};

export function shouldPersistBattleOutcome({
  accountLinkMode,
  adventureLevelActive,
  adventureClaimSucceeded,
}: BattleOutcomePersistenceInput) {
  if (adventureLevelActive) return adventureClaimSucceeded;
  return accountLinkMode !== "linked";
}
