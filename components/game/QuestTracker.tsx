"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store";
import { ALL_MISSIONS } from "@/data/missions";
import { cn } from "@/lib/cn";

export default function QuestTracker() {
  const progress = useGameStore((s) => s.missionsProgress);

  // Show up to 3 dailies that aren't claimed yet, prioritising those ready to claim.
  const open = ALL_MISSIONS.filter((m) => m.kind === "daily")
    .map((m) => {
      const p = progress[m.id] ?? { progress: 0, claimed: false, resetAt: "" };
      return { m, p };
    })
    .filter((x) => !x.p.claimed)
    .sort((a, b) => {
      const aReady = a.p.progress >= a.m.goal ? 0 : 1;
      const bReady = b.p.progress >= b.m.goal ? 0 : 1;
      if (aReady !== bReady) return aReady - bReady;
      return b.p.progress / b.m.goal - a.p.progress / a.m.goal;
    })
    .slice(0, 3);

  if (open.length === 0) {
    return (
      <div className="rounded-xl bg-panel/70 border border-white/5 p-3">
        <div className="text-[10px] uppercase tracking-widest text-muted">Dailies</div>
        <div className="text-xs text-success">All claimed today ✓</div>
      </div>
    );
  }

  return (
    <Link href="/missions" className="block">
      <div className="rounded-xl bg-panel/70 border border-white/10 p-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-widest text-muted">Daily Quests</div>
          <div className="text-[10px] text-accent">See all →</div>
        </div>
        {open.map(({ m, p }) => {
          const ready = p.progress >= m.goal;
          const pct = Math.min(1, p.progress / m.goal);
          return (
            <div key={m.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="text-xs font-semibold truncate">{m.name}</div>
                  <div className="text-[10px] text-muted tabular-nums shrink-0">
                    {Math.min(p.progress, m.goal)}/{m.goal}
                  </div>
                </div>
                <div className="hpbar h-1 rounded-full overflow-hidden mt-0.5">
                  <div
                    className={cn("h-full", ready ? "bg-success" : "bg-accent")}
                    style={{ width: `${pct * 100}%` }}
                  />
                </div>
              </div>
              {ready && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-success text-black">
                  READY
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Link>
  );
}
