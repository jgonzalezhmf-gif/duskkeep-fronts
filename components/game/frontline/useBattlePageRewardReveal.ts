"use client";

import { useCallback, useEffect, useState } from "react";
import type { BattlePageResultContext } from "./BattlePageResultPanel";

export type BattlePageRewardReveal = {
  gold: number;
  dust: number;
  gems: number;
  accountXp: number;
  adventureKeys: number;
  progress: number;
};

function createEmptyRewardReveal(): BattlePageRewardReveal {
  return { gold: 0, dust: 0, gems: 0, accountXp: 0, adventureKeys: 0, progress: 0 };
}

export function useBattlePageRewardReveal({
  active,
  resultContext,
}: {
  active: boolean;
  resultContext: BattlePageResultContext | null;
}) {
  const [rewardReveal, setRewardReveal] = useState<BattlePageRewardReveal>(() => createEmptyRewardReveal());

  const resetRewardReveal = useCallback(() => {
    setRewardReveal(createEmptyRewardReveal());
  }, []);

  useEffect(() => {
    if (!active || !resultContext) return;
    let frame = 0;
    const steps = 16;
    const interval = window.setInterval(() => {
      frame += 1;
      const ratio = Math.min(1, frame / steps);
      setRewardReveal({
        gold: Math.round(resultContext.rewards.gold * ratio),
        dust: Math.round(resultContext.rewards.dust * ratio),
        gems: Math.round(resultContext.rewards.gems * ratio),
        accountXp: Math.round(resultContext.rewards.accountXp * ratio),
        adventureKeys: Math.round(resultContext.rewards.adventureKeys * ratio),
        progress: ratio,
      });
      if (ratio >= 1) window.clearInterval(interval);
    }, 28);
    return () => window.clearInterval(interval);
  }, [active, resultContext]);

  return { rewardReveal, resetRewardReveal };
}
