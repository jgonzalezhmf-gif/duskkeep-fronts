"use client";

import { useEffect, useMemo, useState } from "react";
import { LazyRewardFlightOverlay } from "@/components/game/shared/LazyRewardFlightOverlay";
import { ScreenScaffold } from "@/components/game/screens/ScreenChrome";
import {
  FRONTLINE_FORTRESS_BUILDINGS,
  frontlineFortressDefenseRating,
  frontlineFortressProjectedOutcome,
  frontlineFortressRaidReady,
  frontlineFortressUpgradeCost,
} from "@/features/frontline/fortress";
import {
  createFrontlineHeroProfileMap,
} from "@/features/frontline/heroProfile";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";
import type { FrontlineFortressBuildingId } from "@/lib/types";
import {
  formatRaidCountdown,
  integrityMeta,
  outcomeMeta,
} from "./fortressPageHelpers";
import { BuildingInspector } from "./FortressBuildingInspector";
import { CastleStage } from "./FortressCastleStage";
import { SceneLight } from "./FortressPrimitives";
import { FortressTopChrome } from "./FortressChrome";
import { GarrisonPanel } from "./FortressGarrisonPanel";
import { FortressHero, RaidActionPanel } from "./FortressRaidOverview";
import { FortressStatus, RaidHistoryPanel } from "./FortressStatusPanels";

export default function FortressPage() {
  const { t } = useI18n();
  const fortress = useGameStore((state) => state.frontlineFortress);
  const account = useGameStore((state) => state.account);
  const resources = useGameStore((state) => state.resources);
  const playerHeroes = useGameStore((state) => state.heroes);
  const upgrade = useGameStore((state) => state.upgradeFrontlineFortressOnlineFirst);
  const setGarrisonSlot = useGameStore((state) => state.setFrontlineGarrisonSlot);
  const resolveRaid = useGameStore((state) => state.resolveFrontlineFortressRaid);
  const [now, setNow] = useState<number | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<FrontlineFortressBuildingId>("keep");
  const [reportPulse, setReportPulse] = useState(false);

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

  const currentTime = useMemo(() => new Date(now ?? 0), [now]);
  const heroProfiles = useMemo(() => createFrontlineHeroProfileMap(playerHeroes), [playerHeroes]);
  const raidReady = now === null ? false : frontlineFortressRaidReady(fortress, currentTime);
  const defenseRating = frontlineFortressDefenseRating(fortress, heroProfiles);
  const forecast = frontlineFortressProjectedOutcome(fortress, account.level, currentTime, heroProfiles);
  const nextAttackLabel = now === null ? "--" : raidReady ? t("fortressScreen.raid.ready") : formatRaidCountdown(fortress.nextAttackAt, now, t);
  const integrityState = integrityMeta(fortress.integrity, t);
  const forecastState = outcomeMeta(forecast.outcome, t);
  const selectedBuildingData = FRONTLINE_FORTRESS_BUILDINGS.find((entry) => entry.id === selectedBuilding)!;
  const selectedCost = frontlineFortressUpgradeCost(fortress, selectedBuilding);
  const selectedAffordable = resources.gold >= selectedCost.gold && resources.dust >= (selectedCost.dust ?? 0);
  const garrisonFilled = fortress.garrison.filter(Boolean).length;

  function handleResolveRaid() {
    const report = resolveRaid();
    if (!report) return;
    setReportPulse(true);
    setNow(Date.now());
  }

  if (now === null) {
    return (
      <ScreenScaffold scene="fortress" dock={false} hud={false} homeNav={false}>
        <FortressTopChrome resources={resources} />
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

  return (
    <ScreenScaffold scene="fortress" dock={false} hud={false} homeNav={false}>
      <FortressTopChrome resources={resources} />
      <LazyRewardFlightOverlay rewards={fortress.lastReport?.rewards} active={reportPulse} nonce={fortress.raidsResolved} origin="center" />

      <main className="mx-auto grid w-full max-w-[1500px] gap-3 px-3 pb-16 pt-36 sm:pt-[7.5rem] md:px-6 md:pt-[5.75rem] xl:grid-cols-[minmax(0,1fr)_21rem] xl:px-8">
        <section className="relative isolate min-h-[45rem] overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_50%_16%,rgba(255,219,143,0.08),transparent_30%),linear-gradient(180deg,rgba(14,18,28,0.26),rgba(6,8,14,0.76))] shadow-[0_24px_62px_rgba(0,0,0,0.32)] backdrop-blur-sm md:min-h-[34rem]">
          <SceneLight />

          <div className="relative z-[2] grid gap-3 p-3 md:p-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <FortressHero
              raidReady={raidReady}
              forecast={forecast.outcome}
              nextAttackLabel={nextAttackLabel}
              integrity={fortress.integrity}
              defenseRating={defenseRating}
              garrisonFilled={garrisonFilled}
              t={t}
            />

            <RaidActionPanel
              raidReady={raidReady}
              nextAttackLabel={nextAttackLabel}
              forecast={forecast}
              forecastState={forecastState}
              onResolve={handleResolveRaid}
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

          <div className="relative z-[2] mt-0 grid gap-3 p-3 md:mt-[15.25rem] md:p-4 lg:grid-cols-[minmax(0,1fr)_18rem] xl:mt-[15rem]">
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
