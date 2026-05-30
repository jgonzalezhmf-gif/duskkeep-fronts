"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

export function usePendingActions() {
  const activeRef = useRef<string[]>([]);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const sync = useCallback((nextKeys: string[]) => {
    activeRef.current = nextKeys;
    setActiveKeys(nextKeys);
  }, []);

  const runPendingAction = useCallback(
    async <T,>(key: string, action: () => Promise<T> | T, exclusive = false): Promise<T | undefined> => {
      if (exclusive && activeRef.current.length > 0) return undefined;
      if (activeRef.current.includes(key)) return undefined;
      sync([...activeRef.current, key]);
      try {
        return await action();
      } finally {
        sync(activeRef.current.filter((activeKey) => activeKey !== key));
      }
    },
    [sync],
  );

  return {
    activeKeys,
    runPendingAction,
  };
}

function PendingActionSpinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-3 w-3 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin${className ? ` ${className}` : ""}`}
    />
  );
}

export function PendingActionLabel({
  pending,
  pendingLabel,
  children,
}: {
  pending: boolean;
  pendingLabel: ReactNode;
  children: ReactNode;
}) {
  if (!pending) return <>{children}</>;
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <PendingActionSpinner />
      {pendingLabel}
    </span>
  );
}

export function PendingActionOverlay({ label }: { label: ReactNode }) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-50 grid place-items-center bg-black/60" aria-live="polite" aria-busy="true">
      <div className="inline-flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-yellow-100 shadow-2xl">
        <PendingActionSpinner className="h-4 w-4" />
        {label}
      </div>
    </div>
  );
}
