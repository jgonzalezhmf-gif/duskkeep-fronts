"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LazyRewardFlightOverlay } from "@/components/game/shared/LazyRewardFlightOverlay";
import { ScreenScaffold } from "@/components/game/screens/ScreenChrome";
import {
  FRONTLINE_FORTRESS_BUILDINGS,
  frontlineFortressDefenseRating,
  frontlineFortressProjectedOutcome,
  frontlineFortressRaidReady,
  frontlineFortressRewardsForOutcome,
  frontlineFortressUpgradeCost,
} from "@/features/frontline/fortress";
import {
  createFortressDefenseClaimPayload,
  createFortressDefenseState,
  getFortressDefenseOutcome,
  resolveFortressDefenseTurn,
  type FortressDefenseActionId,
  type FortressDefenseState,
} from "@/features/fortress-defense/engine";
import {
  createFrontlineHeroProfileMap,
} from "@/features/frontline/heroProfile";
import { useI18n } from "@/lib/i18n/useI18n";
import { audio } from "@/lib/audio";
import { useGameStore } from "@/lib/store";
import type { FrontlineFortressBuildingId } from "@/lib/types";
import {
  formatRaidCountdown,
  integrityMeta,
  type TranslateFn,
} from "./fortressPageHelpers";
import { BuildingInspector } from "./FortressBuildingInspector";
import { CastleStage } from "./FortressCastleStage";
import { FortressDefenseBattle } from "./FortressDefenseBattle";
import { FortressDefensePanel } from "./FortressDefensePanel";
import { SceneLight } from "./FortressPrimitives";
import { FortressTopChrome } from "./FortressChrome";
import { GarrisonPanel } from "./FortressGarrisonPanel";
import { FortressHero } from "./FortressRaidOverview";
import { FortressStatus, RaidHistoryPanel } from "./FortressStatusPanels";

const FORTRESS_DEFENSE_START_TRANSITION_MS = 1320;

export default function FortressPage() {
  const { t } = useI18n();
  const fortress = useGameStore((state) => state.frontlineFortress);
  const account = useGameStore((state) => state.account);
  const resources = useGameStore((state) => state.resources);
  const playerHeroes = useGameStore((state) => state.heroes);
  const upgrade = useGameStore((state) => state.upgradeFrontlineFortressOnlineFirst);
  const setGarrisonSlot = useGameStore((state) => state.setFrontlineGarrisonSlot);
  const claimDefense = useGameStore((state) => state.claimFrontlineFortressDefenseOnlineFirst);
  const [now, setNow] = useState<number | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<FrontlineFortressBuildingId>("keep");
  const [reportPulse, setReportPulse] = useState(false);
  const [defenseState, setDefenseState] = useState<FortressDefenseState | null>(null);
  const [claimPending, setClaimPending] = useState(false);
  const [defenseTransition, setDefenseTransition] = useState(false);
  const defenseTransitionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!reportPulse) return;
    const timeout = window.setTimeout(() => setReportPulse(false), 1700);
    return () => window.clearTimeout(timeout);
  }, [reportPulse]);

  useEffect(() => {
    return () => {
      if (defenseTransitionTimerRef.current !== null) {
        window.clearTimeout(defenseTransitionTimerRef.current);
      }
    };
  }, []);

  const currentTime = useMemo(() => new Date(now ?? 0), [now]);
  const heroProfiles = useMemo(() => createFrontlineHeroProfileMap(playerHeroes), [playerHeroes]);
  const raidReady = now === null ? false : frontlineFortressRaidReady(fortress, currentTime);
  const defenseRating = frontlineFortressDefenseRating(fortress, heroProfiles);
  const forecast = frontlineFortressProjectedOutcome(fortress, account.level, currentTime, heroProfiles);
  const nextAttackLabel = now === null ? "--" : raidReady ? t("fortressScreen.raid.ready") : formatRaidCountdown(fortress.nextAttackAt, now, t);
  const integrityState = integrityMeta(fortress.integrity, t);
  const selectedBuildingData = FRONTLINE_FORTRESS_BUILDINGS.find((entry) => entry.id === selectedBuilding)!;
  const selectedCost = frontlineFortressUpgradeCost(fortress, selectedBuilding);
  const selectedAffordable = resources.gold >= selectedCost.gold && resources.dust >= (selectedCost.dust ?? 0);
  const garrisonFilled = fortress.garrison.filter(Boolean).length;
  const defenseRewards = defenseState && defenseState.status !== "active" ? frontlineFortressRewardsForOutcome(fortress, getFortressDefenseOutcome(defenseState)) : undefined;

  function handleStartDefense() {
    if (!raidReady || defenseTransition) return;
    audio.setTheme("fortress_defense", { immediate: true, assetOnly: true });
    setDefenseTransition(true);
    defenseTransitionTimerRef.current = window.setTimeout(() => {
      setDefenseState(createFortressDefenseState({ fortress, accountLevel: account.level, heroProfiles, now: currentTime }));
      setDefenseTransition(false);
      defenseTransitionTimerRef.current = null;
    }, FORTRESS_DEFENSE_START_TRANSITION_MS);
  }

  function handleDefenseAction(actionId: FortressDefenseActionId, targetId?: string) {
    setDefenseState((state) => (state ? resolveFortressDefenseTurn(state, actionId, targetId) : state));
  }

  async function handleClaimDefense() {
    if (!defenseState || defenseState.status === "active" || claimPending) return;
    setClaimPending(true);
    const report = await claimDefense(createFortressDefenseClaimPayload(defenseState)).finally(() => setClaimPending(false));
    if (!report) return;
    setDefenseState(null);
    setReportPulse(true);
    setNow(Date.now());
  }

  if (now === null) {
    return (
      <ScreenScaffold scene="fortress" dock={false} hud={false} homeNav={false}>
        <FortressTopChrome resources={resources} />
        {defenseTransition ? <FortressDefenseStartTransition t={t} /> : null}
        <main className="mx-auto grid w-full max-w-[1500px] gap-3 px-3 pb-16 pt-36 sm:pt-[7.5rem] md:px-6 md:pt-[5.75rem] xl:grid-cols-[minmax(0,1fr)_21rem] xl:px-8" aria-busy="true">
          <section className="relative isolate min-h-[45rem] overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_50%_16%,rgba(255,219,143,0.08),transparent_30%),linear-gradient(180deg,rgba(14,18,28,0.24),rgba(6,8,14,0.74))] shadow-[0_24px_62px_rgba(0,0,0,0.32)] backdrop-blur-sm md:min-h-[34rem]">
            <SceneLight />
            <div className="relative z-[2] grid gap-3 p-3 md:p-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
              <div className="h-36 rounded-[26px] border border-white/10 bg-white/[0.045]" />
              <div className="h-36 rounded-[26px] border border-white/10 bg-white/[0.04]" />
            </div>
            <div className="relative z-[2] mx-auto mt-12 h-60 w-[min(34rem,80vw)] rounded-[32px] border border-[#f5c451]/12 bg-[#f5c451]/[0.045]" />
            <div className="relative z-[2] mt-10 grid gap-3 p-3 md:p-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="h-40 rounded-[26px] border border-white/10 bg-white/[0.045]" />
              <div className="h-40 rounded-[26px] border border-white/10 bg-white/[0.04]" />
            </div>
          </section>
          <aside className="grid gap-4 xl:content-start">
            <div className="h-72 rounded-[28px] border border-white/10 bg-white/[0.04]" />
            <div className="h-44 rounded-[28px] border border-white/10 bg-white/[0.035]" />
          </aside>
        </main>
      </ScreenScaffold>
    );
  }

  if (defenseState) {
    return (
      <ScreenScaffold scene="fortress" dock={false} hud={false} homeNav={false}>
        <LazyRewardFlightOverlay rewards={fortress.lastReport?.rewards} active={reportPulse} nonce={fortress.raidsResolved} origin="center" />

        <main className="relative min-h-dvh w-full overflow-hidden">
          <FortressDefenseBattle
            defenseState={defenseState}
            forecast={forecast}
            defenseRewards={defenseRewards}
            claimPending={claimPending}
            onAction={handleDefenseAction}
            onClaim={handleClaimDefense}
            onRetreat={() => setDefenseState(null)}
            t={t}
          />
        </main>
      </ScreenScaffold>
    );
  }

  return (
    <ScreenScaffold scene="fortress" dock={false} hud={false} homeNav={false}>
      <FortressTopChrome resources={resources} />
      <LazyRewardFlightOverlay rewards={fortress.lastReport?.rewards} active={reportPulse} nonce={fortress.raidsResolved} origin="center" />
      {defenseTransition ? <FortressDefenseStartTransition t={t} /> : null}

      <main className="mx-auto grid w-full max-w-[1500px] gap-3 px-3 pb-16 pt-36 sm:pt-[7.5rem] md:px-6 md:pt-[5.75rem] xl:grid-cols-[minmax(0,1fr)_21rem] xl:px-8">
        <section className="relative isolate min-h-[45rem] overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_50%_16%,rgba(255,219,143,0.08),transparent_30%),linear-gradient(180deg,rgba(14,18,28,0.26),rgba(6,8,14,0.76))] shadow-[0_24px_62px_rgba(0,0,0,0.32)] backdrop-blur-sm md:min-h-[35rem]">
          <SceneLight />

          <div className="relative z-[2] grid gap-3 p-3 md:p-3.5 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <FortressHero
              raidReady={raidReady}
              forecast={forecast.outcome}
              nextAttackLabel={nextAttackLabel}
              integrity={fortress.integrity}
              defenseRating={defenseRating}
              garrisonFilled={garrisonFilled}
              t={t}
            />

            <FortressDefensePanel
              raidReady={raidReady}
              nextAttackLabel={nextAttackLabel}
              forecast={forecast}
              defenseRewards={defenseRewards}
              defenseState={defenseState}
              claimPending={claimPending}
              onStartDefense={handleStartDefense}
              onAction={handleDefenseAction}
              onClaim={handleClaimDefense}
              t={t}
            />
          </div>

          <CastleStage
            selectedBuilding={selectedBuilding}
            setSelectedBuilding={setSelectedBuilding}
            levels={fortress.buildings}
            integrity={fortress.integrity}
            raidReady={raidReady}
            reportPulse={reportPulse}
            t={t}
          />

          <div className="relative z-[2] mt-0 grid gap-3 p-3 md:mt-[17.5rem] md:p-3.5 lg:grid-cols-[minmax(0,1fr)_18rem] xl:mt-[17.25rem]">
            <BuildingInspector
              building={selectedBuildingData}
              level={fortress.buildings[selectedBuilding]}
              cost={selectedCost}
              affordable={selectedAffordable}
              resources={resources}
              onUpgrade={() => void upgrade(selectedBuilding)}
              t={t}
            />

            <FortressStatus
              integrity={fortress.integrity}
              integrityState={integrityState}
              forecast={forecast}
              lastReport={fortress.lastReport}
              reportPulse={reportPulse}
              t={t}
            />
          </div>
        </section>

        <aside className="grid gap-4 xl:content-start">
          <GarrisonPanel garrison={fortress.garrison} setGarrisonSlot={setGarrisonSlot} defenseRating={defenseRating} heroProfiles={heroProfiles} t={t} />
          <RaidHistoryPanel
            lastReport={fortress.lastReport}
            raidsResolved={fortress.raidsResolved}
            integrity={fortress.integrity}
            t={t}
          />
        </aside>
      </main>
    </ScreenScaffold>
  );
}

function FortressDefenseStartTransition({ t }: { t: TranslateFn }) {
  return (
    <div className="fortress-defense-start-overlay pointer-events-none fixed inset-0 z-[90] overflow-hidden bg-black/0" aria-live="polite" aria-label={t("fortressScreen.defense.start")}>
      <div className="fortress-defense-start-veil absolute inset-0 bg-black" />
      <div className="fortress-defense-start-ember absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(245,196,81,0.2),transparent_25%),linear-gradient(90deg,rgba(12,9,8,0.92),rgba(55,24,18,0.48),rgba(5,7,12,0.92))]" />
      <div className="fortress-defense-start-gate-left absolute inset-y-0 left-0 w-1/2 border-r border-[#f5c451]/20 bg-[linear-gradient(90deg,rgba(3,4,8,0.98),rgba(22,17,14,0.7))]" />
      <div className="fortress-defense-start-gate-right absolute inset-y-0 right-0 w-1/2 border-l border-[#f5c451]/20 bg-[linear-gradient(270deg,rgba(3,4,8,0.98),rgba(22,17,14,0.7))]" />
      <div className="fortress-defense-start-title absolute left-1/2 top-1/2 w-[min(34rem,84vw)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-[#f5c451]/24 bg-[linear-gradient(180deg,rgba(245,196,81,0.18),rgba(6,7,12,0.58))] px-6 py-5 text-center shadow-[0_30px_90px_rgba(0,0,0,0.56)]">
        <div className="text-[10px] font-black uppercase tracking-[0.26em] text-[#f5d498]/78">{t("fortressScreen.defense.start")}</div>
        <div className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-white sm:text-4xl">{t("fortressScreen.defense.battleTitle")}</div>
        <div className="mx-auto mt-4 h-px w-40 bg-[linear-gradient(90deg,transparent,#f5c451,transparent)]" />
      </div>
      <style>{`
        @keyframes fortress-defense-start-veil {
          0% { opacity: 0; }
          58% { opacity: 0.78; }
          100% { opacity: 0.96; }
        }
        @keyframes fortress-defense-start-ember {
          0% { opacity: 0; transform: scale(1.04); filter: blur(2px) brightness(1.15); }
          36% { opacity: 0.92; transform: scale(1.01); filter: blur(0) brightness(1.04); }
          100% { opacity: 0.42; transform: scale(1); filter: blur(1px) brightness(0.82); }
        }
        @keyframes fortress-defense-start-gate-left {
          0% { transform: translateX(-24%); opacity: 0; }
          42% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-4%); opacity: 0.88; }
        }
        @keyframes fortress-defense-start-gate-right {
          0% { transform: translateX(24%); opacity: 0; }
          42% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(4%); opacity: 0.88; }
        }
        @keyframes fortress-defense-start-title {
          0% { opacity: 0; transform: translate(-50%, -46%) scale(0.94); filter: brightness(1.2); }
          34% { opacity: 1; transform: translate(-50%, -50%) scale(1.02); filter: brightness(1.08); }
          76% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
          100% { opacity: 0.28; transform: translate(-50%, -51%) scale(0.985); filter: brightness(0.74); }
        }
        .fortress-defense-start-veil { animation: fortress-defense-start-veil ${FORTRESS_DEFENSE_START_TRANSITION_MS}ms cubic-bezier(.16,1,.3,1) both; }
        .fortress-defense-start-ember { animation: fortress-defense-start-ember ${FORTRESS_DEFENSE_START_TRANSITION_MS}ms cubic-bezier(.16,1,.3,1) both; }
        .fortress-defense-start-gate-left { animation: fortress-defense-start-gate-left ${FORTRESS_DEFENSE_START_TRANSITION_MS}ms cubic-bezier(.16,1,.3,1) both; }
        .fortress-defense-start-gate-right { animation: fortress-defense-start-gate-right ${FORTRESS_DEFENSE_START_TRANSITION_MS}ms cubic-bezier(.16,1,.3,1) both; }
        .fortress-defense-start-title { animation: fortress-defense-start-title ${FORTRESS_DEFENSE_START_TRANSITION_MS}ms cubic-bezier(.16,1,.3,1) both; }
        html[data-motion="reduced"] .fortress-defense-start-veil,
        html[data-motion="reduced"] .fortress-defense-start-ember,
        html[data-motion="reduced"] .fortress-defense-start-gate-left,
        html[data-motion="reduced"] .fortress-defense-start-gate-right,
        html[data-motion="reduced"] .fortress-defense-start-title { animation-duration: 120ms !important; }
      `}</style>
    </div>
  );
}
