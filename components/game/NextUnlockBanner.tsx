"use client";

import { nextUpcomingUnlock } from "@/data/unlocks";
import { ProgressionIcon, type ProgressionIconName } from "@/components/game/shared/ProgressionIcon";
import { ACCOUNT_XP_PER_LEVEL } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/lib/store";

const KIND_ICON: Record<string, ProgressionIconName> = {
  hero: "unlock",
  event: "reward_chest",
  chapter: "unlock",
  shop_section: "claim",
  feature: "level_up",
};

export default function NextUnlockBanner() {
  const state = useGameStore();
  const { account } = state;
  const next = nextUpcomingUnlock(account.level);
  if (!next) return null;

  const levelsAway = next.level - account.level;
  const xpToNext = ACCOUNT_XP_PER_LEVEL * account.level;
  const pct = Math.min(1, account.xp / xpToNext);

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-panel/70 p-2.5">
      <ProgressionIcon name={KIND_ICON[next.kind] ?? "unlock"} size="md" className={cn("shrink-0", levelsAway <= 1 && "anim-sparkle")} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] uppercase tracking-widest text-muted">Next unlock</div>
          <div className="text-[10px] font-bold text-accent">
            Lv {next.level} ({levelsAway === 0 ? "now" : `+${levelsAway}`})
          </div>
        </div>
        <div className="truncate text-xs font-semibold">{next.label}</div>
        {next.detail ? <div className="truncate text-[10px] text-muted">{next.detail}</div> : null}
        {levelsAway === 1 ? (
          <div className="hpbar mt-1 h-1 overflow-hidden rounded-full">
            <div className="h-full bg-gradient-to-r from-accent to-amber-400" style={{ width: `${pct * 100}%` }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
