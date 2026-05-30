"use client";

import { useMemo } from "react";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { PendingActionLabel, usePendingActions } from "@/components/game/shared/PendingActionFeedback";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { ResourceIcon, type ResourceIconKind } from "@/components/game/shared/ResourceIcon";
import { DAILY_LOGIN } from "@/data/dailyLogin";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import { createPendingActionKey, isPendingAction } from "@/lib/pendingActions";
import { getRewardDisplayEntries, type RewardDisplayEntryKind } from "@/lib/rewardDisplayEntries";
import { dailyLoginStatus, useGameStore } from "@/lib/store";

type DailyRewardPillMeta =
  | { icon: ResourceIconKind; tone: "resource" }
  | { icon: "power" | "heroes" | "rewards"; tone: GameIconTone };

const DAILY_REWARD_META: Record<RewardDisplayEntryKind, DailyRewardPillMeta> = {
  gold: { icon: "gold", tone: "resource" },
  dust: { icon: "dust", tone: "resource" },
  gems: { icon: "gems", tone: "resource" },
  tickets: { icon: "tickets", tone: "resource" },
  keys: { icon: "adventure_key", tone: "resource" },
  xp: { icon: "power", tone: "emerald" },
  shards: { icon: "heroes", tone: "violet" },
  cards: { icon: "rewards", tone: "gold" },
};

export function DailyLoginCharm() {
  const { t } = useI18n();
  const status = useGameStore(dailyLoginStatus);
  const claimDailyLogin = useGameStore((state) => state.claimDailyLoginOnlineFirst);
  const { activeKeys, runPendingAction } = usePendingActions();
  const pendingKey = createPendingActionKey("dailyLogin.claim");
  const pending = isPendingAction(activeKeys, pendingKey);

  const entry = useMemo(
    () => DAILY_LOGIN.find((item) => item.day === status.nextDay) ?? DAILY_LOGIN[0],
    [status.nextDay],
  );
  const rewardEntries = useMemo(() => getRewardDisplayEntries(entry.rewards).slice(0, 3), [entry.rewards]);

  const handleClaim = async () => {
    if (status.claimed) return;
    await runPendingAction(pendingKey, async () => {
      await claimDailyLogin();
    }, true);
  };

  return (
    <section className="relative w-[17.4rem] overflow-hidden rounded-[24px] border border-[#f0c75a]/18 bg-[linear-gradient(180deg,rgba(21,18,15,0.68),rgba(8,10,16,0.94))] px-3 py-2 shadow-[0_18px_36px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <span className="pointer-events-none absolute inset-x-[18%] top-0 h-[34%] rounded-full bg-[#ffe2a3]/12 blur-md" />
      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[8px] font-black uppercase tracking-[0.24em] text-white/46">{t("home.dailyLogin.title")}</div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-sm font-black text-[#fff0cf]">
              {t("home.dailyLogin.day", { day: String(entry.day) })}
            </span>
            <span className="rounded-full border border-white/10 bg-black/24 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/56">
              {t("home.dailyLogin.streak", { streak: String(status.streak) })}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClaim}
          disabled={status.claimed || pending}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] shadow-[0_10px_22px_rgba(0,0,0,0.24)] transition",
            status.claimed
              ? "border-white/10 bg-white/6 text-white/42"
              : "border-[#ffe6a8]/34 bg-[linear-gradient(180deg,#f8d47a,#bb6d31)] text-[#201006] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(245,196,81,0.22)]",
          )}
        >
          <PendingActionLabel pending={pending} pendingLabel={t("home.dailyLogin.claiming")}>
            {status.claimed ? t("home.dailyLogin.claimed") : t("home.dailyLogin.claim")}
          </PendingActionLabel>
        </button>
      </div>

      <div className="relative mt-2 flex flex-wrap gap-1.5">
        {rewardEntries.map((reward) => (
          <DailyRewardPill key={`${reward.kind}-${reward.value}`} kind={reward.kind} value={reward.value} label={t(reward.labelKey)} />
        ))}
      </div>
    </section>
  );
}

function DailyRewardPill({
  kind,
  value,
  label,
}: {
  kind: RewardDisplayEntryKind;
  value: number;
  label: string;
}) {
  const meta = DAILY_REWARD_META[kind];

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/28 px-1.5 py-1 text-[9px] font-black text-white/82">
      {meta.tone === "resource" ? (
        <ResourceIcon kind={meta.icon} size="small" className="h-5 w-5" />
      ) : meta.icon === "power" ? (
        <ProgressionIcon name="level_up" size="sm" className="h-5 w-5" />
      ) : meta.icon === "rewards" ? (
        <ProgressionIcon name="reward_chest" size="sm" className="h-5 w-5" />
      ) : (
        <GameIcon kind={meta.icon} tone={meta.tone} size="sm" className="h-5 w-5" />
      )}
      <span className="tabular-nums">+{value}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
