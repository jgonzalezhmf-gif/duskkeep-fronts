"use client";

import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/cn";

export default function Notifications() {
  const notifications = useGameStore((s) => s.notifications);
  const dismiss = useGameStore((s) => s.dismissNotification);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-14 z-50 flex flex-col items-center gap-2 px-3">
      {notifications.map((n) => (
        <button
          key={n.id}
          onClick={() => dismiss(n.id)}
          className={cn(
            "pointer-events-auto w-full max-w-[440px] text-left px-3 py-2 rounded-lg text-sm shadow-card",
            n.kind === "success" && "bg-success/20 text-success border border-success/30",
            n.kind === "error" && "bg-danger/20 text-danger border border-danger/30",
            n.kind === "info" && "bg-panel text-white border border-white/10",
          )}
        >
          {n.message}
        </button>
      ))}
    </div>
  );
}
