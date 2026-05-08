import { ACCOUNT_XP_PER_LEVEL } from "./constants";
import type { AccountState } from "./types";

export type AccountRewardProgression = {
  account: AccountState;
  pendingUnlockLevel?: number;
};

export function applyAccountXpReward(
  account: AccountState,
  accountXp: number | undefined,
  pendingUnlockLevel: number | null,
): AccountRewardProgression | null {
  if (!accountXp) return null;

  let xp = account.xp + accountXp;
  let level = account.level;
  while (xp >= ACCOUNT_XP_PER_LEVEL * level) {
    xp -= ACCOUNT_XP_PER_LEVEL * level;
    level += 1;
  }

  const result: AccountRewardProgression = {
    account: { ...account, xp, level },
  };

  if (level > account.level) {
    result.pendingUnlockLevel = Math.max(pendingUnlockLevel ?? 0, level);
  }

  return result;
}
