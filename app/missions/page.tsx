"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SceneBackdrop from "@/components/game/screens/SceneBackdrop";
import GameBackNav from "@/components/game/shared/GameBackNav";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import { LazyRewardFlightOverlay } from "@/components/game/shared/LazyRewardFlightOverlay";
import { usePendingActions } from "@/components/game/shared/PendingActionFeedback";
import ScreenBackground from "@/components/ui/ScreenBackground";
import { DAILY_MISSIONS, WEEKLY_MISSIONS } from "@/data/missions";
import { sfx } from "@/lib/audio";
import { useI18n } from "@/lib/i18n/useI18n";
import { createPendingActionKey } from "@/lib/pendingActions";
import { useGameStore } from "@/lib/store";
import { MissionColumn, MissionRouteMap, NextContract, type ClaimFx } from "./MissionContracts";
import {
  buildMissionStats,
  getNearestResetLabel,
  pickNextMission,
} from "./missionsPageHelpers";
import { LogMetric, MiniBadge } from "./MissionsPrimitives";

export default function MissionsPage() {
  const { t } = useI18n();
  const [clientReady, setClientReady] = useState(false);
  const [claimFx, setClaimFx] = useState<ClaimFx | null>(null);
  const { activeKeys: pendingClaimKeys, runPendingAction } = usePendingActions();
  const claimFxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const claimFxNonce = useRef(0);
  const progress = useGameStore((state) => state.missionsProgress);
  const resources = useGameStore((state) => state.resources);
  const ensureMissionsInitialized = useGameStore((state) => state.ensureMissionsInitialized);
  const claimRaw = useGameStore((state) => state.claimMissionOnlineFirst);

  useEffect(() => {
    setClientReady(true);
    ensureMissionsInitialized();
    return () => {
      if (claimFxTimer.current) clearTimeout(claimFxTimer.current);
    };
  }, [ensureMissionsInitialized]);

  const allMissions = useMemo(() => [...DAILY_MISSIONS, ...WEEKLY_MISSIONS], []);
  const stats = useMemo(() => buildMissionStats(allMissions, progress), [allMissions, progress]);
  const nextMission = useMemo(() => pickNextMission(allMissions, progress), [allMissions, progress]);
  const nextReset = getNearestResetLabel(allMissions, progress, t);

  const claim = async (id: string) => {
    await runPendingAction(createPendingActionKey("missions.claim", id), async () => {
      const rewards = await claimRaw(id);
      if (rewards) {
        sfx.claim();
        claimFxNonce.current += 1;
        setClaimFx({ missionId: id, rewards, nonce: claimFxNonce.current });
        if (claimFxTimer.current) clearTimeout(claimFxTimer.current);
        claimFxTimer.current = setTimeout(() => setClaimFx(null), 1500);
      } else {
        sfx.error();
      }
    }, true);
  };

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-[#04070d] px-3 pb-20 pt-28 sm:pt-28 md:px-6 md:pb-24 md:pt-24">
      <ScreenBackground screen="missions" overlayIntensity="medium" fallback={<SceneBackdrop scene="missions" className="opacity-55" />} />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_16%_12%,rgba(93,211,158,0.08),transparent_20%),radial-gradient(circle_at_82%_16%,rgba(245,196,81,0.08),transparent_20%),linear-gradient(180deg,rgba(3,7,12,0.2),rgba(4,8,12,0.4)_46%,rgba(4,7,11,0.72))]" />
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.028] [background-image:linear-gradient(90deg,rgba(245,212,152,0.8)_1px,transparent_1px),linear-gradient(180deg,rgba(245,212,152,0.45)_1px,transparent_1px)] [background-size:72px_72px]" />
      <GameBackNav />
      <GameResourceBar resources={resources} size="sm" className="pointer-events-auto fixed right-3 top-3 z-40 max-w-[calc(100vw-9rem)] md:right-5 md:top-4 md:max-w-none" />
      <LazyRewardFlightOverlay rewards={claimFx?.rewards} active={Boolean(claimFx)} nonce={claimFx?.nonce} origin="center" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-4">
        {!clientReady ? (
          <section className="relative overflow-hidden rounded-[28px] border border-[#f5d498]/12 bg-[linear-gradient(135deg,rgba(18,30,27,0.7),rgba(10,13,19,0.92)_48%,rgba(5,7,12,0.96)_100%)] p-3 shadow-[0_28px_74px_rgba(0,0,0,0.42)] md:rounded-[34px] md:p-4" aria-busy="true">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(93,211,158,0.1),transparent_22%),radial-gradient(circle_at_82%_10%,rgba(245,196,81,0.1),transparent_22%)]" />
            <div className="relative z-[1]">
              <div className="flex flex-wrap gap-2">
                <div className="h-7 w-36 rounded-full border border-[#f5c451]/20 bg-[#f5c451]/10" />
                <div className="h-7 w-24 rounded-full border border-white/10 bg-white/[0.05]" />
              </div>
              <div className="mt-4 h-10 max-w-[28rem] rounded-full bg-white/[0.07]" />
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div className="h-44 rounded-[24px] border border-white/10 bg-white/[0.045]" />
                <div className="h-44 rounded-[24px] border border-white/10 bg-white/[0.045]" />
              </div>
            </div>
          </section>
        ) : (
          <>
          <section className="relative overflow-hidden rounded-[28px] border border-[#f5d498]/12 bg-[linear-gradient(135deg,rgba(18,30,27,0.76),rgba(10,13,19,0.94)_48%,rgba(5,7,12,0.98)_100%)] p-3 shadow-[0_28px_74px_rgba(0,0,0,0.42)] md:rounded-[34px] md:p-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(93,211,158,0.13),transparent_22%),radial-gradient(circle_at_82%_10%,rgba(245,196,81,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_42%)]" />
          <div className="relative z-[1] grid gap-3 xl:grid-cols-[minmax(0,0.88fr)_minmax(25rem,1.12fr)]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-full border border-[#f5c451]/20 bg-[#f5c451]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d498]">
                  {t("missionsScreen.commandLog")}
                </div>
                <MiniBadge tone={stats.ready > 0 ? "gold" : "neutral"}>{t("missionsScreen.progress.readyCount", { count: stats.ready })}</MiniBadge>
              </div>
              <h1 className="mt-3 max-w-[44rem] text-[1.85rem] font-black leading-[0.92] tracking-[-0.045em] text-white sm:text-[2.25rem] md:text-[2.8rem]">
                {t("missionsScreen.title")}
              </h1>
              <p className="mt-2 max-w-[38rem] text-[12px] leading-5 text-white/58 md:text-[13px]">
                {t("missionsScreen.copy")}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <LogMetric progressionIcon="claim" label={t("missionsScreen.metrics.ready")} value={String(stats.ready)} tone="gold" active={stats.ready > 0} />
                <LogMetric icon="missions" label={t("missionsScreen.metrics.active")} value={String(stats.active)} tone="emerald" />
                <LogMetric icon="events" label={t("missionsScreen.metrics.reset")} value={nextReset} tone="sky" />
              </div>
              <MissionRouteMap missions={allMissions} progress={progress} t={t} />
            </div>

            <NextContract mission={nextMission} progress={progress} claim={claim} claimFx={claimFx} pendingClaimKeys={pendingClaimKeys} t={t} />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <MissionColumn title={t("missionsScreen.columns.dailyTitle")} cadence={t("missionsScreen.columns.dailyCadence")} missions={DAILY_MISSIONS} progress={progress} claim={claim} claimFx={claimFx} pendingClaimKeys={pendingClaimKeys} t={t} />
          <MissionColumn title={t("missionsScreen.columns.weeklyTitle")} cadence={t("missionsScreen.columns.weeklyCadence")} missions={WEEKLY_MISSIONS} progress={progress} claim={claim} claimFx={claimFx} pendingClaimKeys={pendingClaimKeys} t={t} />
        </section>
          </>
        )}
      </div>
    </div>
  );
}
