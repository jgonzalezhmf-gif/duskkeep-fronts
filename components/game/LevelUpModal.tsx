"use client";

import { useEffect } from "react";
import { unlocksAt } from "@/data/unlocks";
import { ProgressionIcon, type ProgressionIconName } from "@/components/game/shared/ProgressionIcon";
import Button from "@/components/ui/Button";
import { sfx } from "@/lib/audio";
import { useGameStore } from "@/lib/store";

const KIND_ICON: Record<string, ProgressionIconName> = {
  hero: "unlock",
  event: "reward_chest",
  chapter: "unlock",
  shop_section: "claim",
  feature: "level_up",
};

export default function LevelUpModal() {
  const pending = useGameStore((s) => s.pendingUnlockLevel);
  const ack = useGameStore((s) => s.ackPendingUnlock);

  useEffect(() => {
    if (pending) sfx.unlock();
  }, [pending]);

  if (!pending) return null;
  const items = unlocksAt(pending);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm anim-slide-up" onClick={ack}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-accent/60 bg-gradient-to-br from-accent/25 via-panel to-panel p-5 shadow-[0_10px_40px_rgba(245,196,81,0.4)] anim-pulse-ring"
      >
        <div className="text-center">
          <ProgressionIcon name="level_up" size="xl" className="mx-auto" />
          <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-accent">Commander</div>
          <div className="mt-1 bg-gradient-to-br from-accent via-amber-300 to-amber-600 bg-clip-text text-5xl font-black tabular-nums text-transparent">
            Lv {pending}
          </div>
          <div className="mt-1 text-xs text-white/70">Level up!</div>
        </div>

        {items.length > 0 ? (
          <div className="mt-4 space-y-2">
            <div className="text-center text-[10px] uppercase tracking-widest text-muted">New unlocks</div>
            {items.map((unlock) => (
              <div key={`${unlock.kind}:${unlock.id}`} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 p-2">
                <ProgressionIcon name={KIND_ICON[unlock.kind] ?? "unlock"} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{unlock.label}</div>
                  {unlock.detail ? <div className="truncate text-[10px] text-muted">{unlock.detail}</div> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 text-center text-xs text-muted">Keep grinding - new rewards ahead.</div>
        )}

        <Button fullWidth className="mt-4" onClick={ack}>
          <span className="inline-flex items-center justify-center gap-2">
            <ProgressionIcon name="claim" size="sm" />
            Continue
          </span>
        </Button>
      </div>
    </div>
  );
}
