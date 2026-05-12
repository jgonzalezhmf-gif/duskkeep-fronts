"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";
import type { FrontlineLoadout } from "@/lib/types";

type SyncState = "idle" | "dirty" | "saving" | "saved-online" | "saved-local" | "error";

function loadoutSignature(loadout: FrontlineLoadout) {
  return JSON.stringify({
    leaderId: loadout.leaderId,
    squad: loadout.squad,
    deck: loadout.deck,
  });
}

export function DeckLoadoutSyncButton({ loadout }: { loadout: FrontlineLoadout }) {
  const { t } = useI18n();
  const syncLoadout = useGameStore((state) => state.syncFrontlineLoadoutOnlineFirst);
  const [state, setState] = useState<SyncState>("idle");
  const [reason, setReason] = useState("");
  const signature = useMemo(() => loadoutSignature(loadout), [loadout]);
  const lastSyncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (state === "saving") return;
    if (lastSyncedRef.current && lastSyncedRef.current !== signature) {
      setState("dirty");
      setReason("");
    }
  }, [signature, state]);

  const handleSave = async () => {
    if (state === "saving") return;

    setState("saving");
    setReason("");
    const result = await syncLoadout();
    if (!result.ok) {
      setState("error");
      setReason(result.reason ?? t("deckScreen.sync.error"));
      return;
    }

    lastSyncedRef.current = signature;
    setState(result.authoritative ? "saved-online" : "saved-local");
  };

  const label =
    state === "saving"
      ? t("deckScreen.sync.saving")
      : state === "saved-online"
        ? t("deckScreen.sync.savedOnline")
        : state === "saved-local"
          ? t("deckScreen.sync.savedLocal")
          : state === "dirty"
            ? t("deckScreen.sync.unsaved")
            : state === "error"
              ? t("deckScreen.sync.retry")
              : t("deckScreen.sync.save");

  return (
    <div className="flex min-w-[10.5rem] flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSave}
        disabled={state === "saving"}
        className={cn(
          "rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] shadow-[0_14px_28px_rgba(0,0,0,0.22)] transition",
          state === "error"
            ? "border-rose-300/32 bg-rose-500/16 text-rose-100 hover:bg-rose-500/22"
            : state === "saved-online" || state === "saved-local"
              ? "border-emerald-200/22 bg-emerald-500/12 text-emerald-100"
              : "border-[#f5c451]/30 bg-[linear-gradient(180deg,rgba(245,196,81,0.18),rgba(84,47,19,0.64))] text-[#ffe5a3] hover:-translate-y-0.5 hover:border-[#ffe4a5]/44",
        )}
      >
        {label}
      </button>
      <span className={cn("max-w-[13rem] text-right text-[9px] font-bold uppercase tracking-[0.12em]", state === "error" ? "text-rose-100/78" : "text-white/38")}>
        {state === "error" ? reason : t("deckScreen.sync.hint")}
      </span>
    </div>
  );
}
