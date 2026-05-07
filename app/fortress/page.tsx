"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getFrontlineHeroVisualAsset } from "@/components/game/frontline/frontlineVisualAssets";
import { FortressIcon, type FortressIconName } from "@/components/game/shared/FortressIcon";
import GameBackNav from "@/components/game/shared/GameBackNav";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { GameResourceBar, GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import { ProgressionIcon } from "@/components/game/shared/ProgressionIcon";
import { RewardBurstOverlay } from "@/components/game/shared/RewardBurstOverlay";
import { RewardFlightOverlay } from "@/components/game/shared/RewardFlightOverlay";
import { ScreenBadge, ScreenScaffold } from "@/components/game/screens/ScreenChrome";
import { FRONTLINE_HEROES } from "@/features/frontline/data";
import {
  FRONTLINE_FORTRESS_BUILDINGS,
  frontlineFortressDefenseRating,
  frontlineFortressProjectedOutcome,
  frontlineFortressRaidReady,
  frontlineFortressUpgradeCost,
} from "@/features/frontline/fortress";
import {
  createFrontlineHeroProfileMap,
  getFrontlineHeroProfileById,
  type FrontlineHeroProfileMap,
} from "@/features/frontline/heroProfile";
import type { FrontlineHeroDef } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import { getHomeLandmarkAsset } from "@/lib/homeLandmarkAssets";
import { frontlineHeroName, frontlineHeroRole } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";
import type { FrontlineFortressBuildingId, FrontlineFortressOutcome, Rewards } from "@/lib/types";
import {
  BUILDING_META,
  buildingLabel,
  buildingPerk,
  buildingShort,
  firstOpenSlot,
  formatRaidCountdown,
  integrityMeta,
  outcomeMeta,
  type TranslateFn,
} from "./fortressPageHelpers";

export default function FortressPage() {
  const { t } = useI18n();
  const fortress = useGameStore((state) => state.frontlineFortress);
  const account = useGameStore((state) => state.account);
  const resources = useGameStore((state) => state.resources);
  const playerHeroes = useGameStore((state) => state.heroes);
  const upgrade = useGameStore((state) => state.upgradeFrontlineFortress);
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

  return (
    <ScreenScaffold scene="fortress" dock={false} hud={false} homeNav={false}>
      <FortressTopChrome resources={resources} />
      <RewardFlightOverlay rewards={fortress.lastReport?.rewards} active={reportPulse} nonce={fortress.raidsResolved} origin="center" />

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
              onUpgrade={() => upgrade(selectedBuilding)}
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

function FortressTopChrome({ resources }: { resources: { gold: number; dust: number; gems: number } }) {
  const { t } = useI18n();

  return (
    <div className="pointer-events-none fixed inset-x-3 top-4 z-30 flex items-start justify-between gap-2 md:inset-x-5 md:gap-3">
      <div className="pointer-events-auto">
        <GameBackNav label={t("common.home")} eyebrow={t("nav.fortress")} icon="fortress" tone="gold" placement="top-left" />
      </div>
      <GameResourceBar resources={resources} size="md" className="pointer-events-auto max-w-[calc(100vw-1.5rem)] pt-16 sm:max-w-[calc(100vw-9rem)] sm:pt-0 md:max-w-none" />
    </div>
  );
}

function FortressHero({
  raidReady,
  forecast,
  nextAttackLabel,
  integrity,
  defenseRating,
  garrisonFilled,
  t,
}: {
  raidReady: boolean;
  forecast: FrontlineFortressOutcome;
  nextAttackLabel: string;
  integrity: number;
  defenseRating: number;
  garrisonFilled: number;
  t: TranslateFn;
}) {
  const state = outcomeMeta(forecast, t);
  return (
    <div className="max-w-[44rem]">
      <div className="flex flex-wrap items-center gap-2">
        <ScreenBadge tone={raidReady ? "ember" : "gold"}>{raidReady ? t("fortressScreen.watch.raidAtGate") : t("fortressScreen.watch.castleWatch")}</ScreenBadge>
        <ScreenBadge tone={state.badgeTone}>{state.label}</ScreenBadge>
      </div>
      <h1 className="mt-2 max-w-[34rem] text-[1.75rem] font-black leading-[0.92] text-white drop-shadow-[0_12px_28px_rgba(0,0,0,0.42)] md:text-[2.65rem]">
        {t("fortressScreen.watch.title")}
      </h1>
      <p className="mt-2 hidden max-w-[34rem] text-[12px] leading-5 text-white/54 xl:block">
        {t("fortressScreen.watch.copy")}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <HeroMetric icon="integrity" label={t("fortressScreen.metrics.integrity")} value={`${integrity}%`} />
        <HeroMetric icon="defense_rating" label={t("fortressScreen.metrics.defense")} value={defenseRating} />
        <HeroMetric icon="garrison" label={t("fortressScreen.metrics.guards")} value={`${garrisonFilled}/3`} />
        <HeroMetric icon="raid" label={t("fortressScreen.metrics.nextRaid")} value={nextAttackLabel} />
      </div>
    </div>
  );
}

function RaidActionPanel({
  raidReady,
  nextAttackLabel,
  forecast,
  forecastState,
  onResolve,
  t,
}: {
  raidReady: boolean;
  nextAttackLabel: string;
  forecast: { attackPower: number; defensePower: number; outcome: FrontlineFortressOutcome; rewards: Rewards };
  forecastState: ReturnType<typeof outcomeMeta>;
  onResolve: () => void;
  t: TranslateFn;
}) {
  const max = Math.max(forecast.attackPower, forecast.defensePower, 1);
  return (
    <div className={cn("relative overflow-hidden rounded-[22px] border p-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.22)]", forecastState.panel)}>
      <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/14 blur-2xl" />
      <div className="relative z-[1] flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/44">{t("fortressScreen.raid.watch")}</div>
          <div className="mt-1 text-lg font-black text-white">{raidReady ? t("fortressScreen.raid.resolveNow") : nextAttackLabel}</div>
        </div>
        <ModeIcon name="fortress_raid" size="lg" />
      </div>

      <div className="relative z-[1] mt-2.5 space-y-2">
        <PressureBar label={t("fortressScreen.metrics.raid")} value={forecast.attackPower} max={max} tone="enemy" />
        <PressureBar label={t("fortressScreen.metrics.walls")} value={forecast.defensePower} max={max} tone="ally" />
      </div>

      <RewardRow rewards={forecast.rewards} className="relative z-[1] mt-2.5" t={t} />

      <button
        className="frontline-motion-action frontline-feedback-claim relative z-[1] mt-2.5 w-full overflow-hidden rounded-[18px] border border-[#f8d57b]/28 bg-[linear-gradient(180deg,#fff0bc_0%,#f5c451_46%,#b96d1f_100%)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#221102] shadow-[0_16px_30px_rgba(245,196,81,0.2)] transition disabled:opacity-40 disabled:hover:translate-y-0"
        disabled={!raidReady}
        onClick={onResolve}
      >
        {raidReady ? t("fortressScreen.raid.resolveRaid") : t("fortressScreen.raid.notReady")}
      </button>
    </div>
  );
}

function CastleStage({
  selectedBuilding,
  setSelectedBuilding,
  levels,
  integrity,
  raidReady,
  reportPulse,
  t,
}: {
  selectedBuilding: FrontlineFortressBuildingId;
  setSelectedBuilding: (building: FrontlineFortressBuildingId) => void;
  levels: Record<FrontlineFortressBuildingId, number>;
  integrity: number;
  raidReady: boolean;
  reportPulse: boolean;
  t: TranslateFn;
}) {
  return (
    <div className="relative z-[1] mt-3 h-[18rem] md:absolute md:inset-x-0 md:top-[11rem] md:mt-0 md:h-[22rem]">
      <div className="absolute left-1/2 top-[50%] h-[13rem] w-[54%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(circle_at_50%_44%,rgba(110,159,217,0.11),rgba(31,53,86,0.13)_42%,rgba(4,7,12,0.3)_78%,transparent_100%)]" />
      <div className="absolute bottom-[13%] left-[22%] right-[22%] h-[12%] rounded-[50%] border border-sky-200/8 bg-[radial-gradient(circle_at_50%_45%,rgba(71,162,218,0.18),rgba(22,58,99,0.16)_42%,rgba(2,7,12,0.38)_100%)] animate-[waterShimmer_12s_ease-in-out_infinite]" />

      <FortressSilhouette integrity={integrity} raidReady={raidReady} reportPulse={reportPulse} />

      {(Object.keys(BUILDING_META) as FrontlineFortressBuildingId[]).map((buildingId) => {
        const meta = BUILDING_META[buildingId];
        const selected = selectedBuilding === buildingId;
        const label = buildingLabel(buildingId, t);
        return (
          <button
            key={buildingId}
            className={cn(
              "frontline-motion-tab group absolute isolate grid place-items-center rounded-[28px] border border-transparent bg-transparent transition duration-300",
              meta.position,
              selected
                ? "shadow-[0_0_24px_rgba(245,196,81,0.1)]"
                : "hover:bg-white/[0.015]",
            )}
            onClick={() => setSelectedBuilding(buildingId)}
          >
            <span className={cn("pointer-events-none absolute inset-6 rounded-[26px] bg-[radial-gradient(circle_at_50%_34%,var(--tw-gradient-stops))] blur-lg opacity-40", selected && meta.glow)} />
            <span className="relative z-[1] flex flex-col items-center">
              <FortressIcon name={meta.icon} size="md" className={cn("transition", selected ? "opacity-90 animate-[iconBreath_2.8s_ease-in-out_infinite]" : "opacity-0 group-hover:opacity-70")} />
              <span className={cn("mt-1 rounded-full border border-white/12 bg-black/56 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_16px_rgba(0,0,0,0.24)] transition", !selected && "opacity-0 group-hover:opacity-100")}>
                {label} {t("fortressScreen.buildings.level", { level: levels[buildingId] })}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FortressSilhouette({
  integrity,
  raidReady,
  reportPulse,
}: {
  integrity: number;
  raidReady: boolean;
  reportPulse: boolean;
}) {
  const fortressAsset = getHomeLandmarkAsset("fortress");

  return (
    <div className={cn("absolute left-1/2 top-[3%] h-[16rem] w-[28rem] max-w-[80%] -translate-x-1/2 transition", reportPulse && "animate-[fortressHit_0.7s_ease-in-out_1]")}>
      <div className="absolute bottom-[12%] left-[19%] right-[19%] h-[13%] rounded-[50%] bg-black/28 blur-lg" />
      {fortressAsset ? (
        <img
          src={fortressAsset.src}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-[0_24px_26px_rgba(0,0,0,0.44)]"
        />
      ) : (
        <>
          <div className="absolute inset-x-[8%] bottom-[23%] h-[20%] rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(92,116,177,0.82),rgba(27,38,65,0.98))] shadow-[0_24px_56px_rgba(0,0,0,0.36)]" />
          <div className="absolute bottom-[39%] left-[19%] h-[31%] w-[16%] rounded-t-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(98,125,191,0.88),rgba(29,42,72,0.98))]" />
          <div className="absolute bottom-[34%] left-[42%] h-[47%] w-[17%] rounded-t-[40px] border border-white/10 bg-[linear-gradient(180deg,rgba(122,151,217,0.92),rgba(31,45,78,0.98))]" />
          <div className="absolute bottom-[39%] right-[19%] h-[31%] w-[16%] rounded-t-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(98,125,191,0.88),rgba(29,42,72,0.98))]" />
          <div className="absolute bottom-[28%] left-[45%] h-[24%] w-[10%] rounded-t-[20px] border border-amber-100/10 bg-[linear-gradient(180deg,rgba(76,48,28,0.92),rgba(22,15,13,0.98))]" />
        </>
      )}

      {[24, 50, 76].map((left, index) => (
        <span
          key={left}
          className="absolute h-6 w-2.5 -translate-x-1/2 rounded-full bg-amber-100/28 blur-sm animate-[iconBreath_4.6s_ease-in-out_infinite]"
          style={{ left: `${left}%`, top: `${36 + (index === 1 ? -5 : 2)}%`, animationDelay: `${index * 0.5}s` }}
        />
      ))}

      <div
        className={cn(
          "absolute left-1/2 top-[8%] h-[12.5rem] w-[12.5rem] -translate-x-1/2 rounded-full border blur-[1px] transition",
          raidReady
            ? "border-rose-300/18 bg-[radial-gradient(circle,rgba(244,63,94,0.16),transparent_66%)]"
            : "border-cyan-200/10 bg-[radial-gradient(circle,rgba(125,211,252,0.12),transparent_68%)]",
        )}
      />

      <div className="absolute bottom-[6%] left-[25%] right-[25%] h-2.5 overflow-hidden rounded-full bg-black/42">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            integrity >= 70
              ? "bg-[linear-gradient(90deg,#5fd092,#f5d498)]"
              : integrity >= 40
                ? "bg-[linear-gradient(90deg,#f0b25f,#ffe2a4)]"
                : "bg-[linear-gradient(90deg,#d95764,#ffab8a)]",
          )}
          style={{ width: `${Math.max(8, integrity)}%` }}
        />
      </div>
    </div>
  );
}

function BuildingInspector({
  building,
  level,
  cost,
  affordable,
  resources,
  onUpgrade,
  t,
}: {
  building: (typeof FRONTLINE_FORTRESS_BUILDINGS)[number];
  level: number;
  cost: { gold: number; dust: number };
  affordable: boolean;
  resources: { gold: number; dust: number };
  onUpgrade: () => void;
  t: TranslateFn;
}) {
  const meta = BUILDING_META[building.id];
  const label = buildingLabel(building.id, t);
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,20,31,0.62),rgba(6,8,14,0.82))] p-3 shadow-[0_16px_36px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <span className={cn("pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,var(--tw-gradient-stops))] blur-2xl opacity-70", meta.glow)} />
      <div className="relative z-[1] flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <FortressIcon name={meta.icon} size="xl" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{buildingShort(building.id, t)}</div>
            <div className="mt-1 text-xl font-black text-white">{label} {t("fortressScreen.buildings.level", { level })}</div>
          </div>
        </div>
        <ScreenBadge tone={affordable ? "emerald" : "gold"}>{affordable ? t("fortressScreen.upgrade.ready") : t("fortressScreen.upgrade.gathering")}</ScreenBadge>
      </div>
      <p className="relative z-[1] mt-1.5 max-w-[46rem] text-[12px] leading-5 text-white/52">{buildingPerk(building.id, t)}</p>
      <div className="relative z-[1] mt-2.5 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="grid grid-cols-2 gap-2">
          <CostTile label={t("fortressScreen.resources.gold")} icon="gold" current={resources.gold} required={cost.gold} tone="gold" />
          <CostTile label={t("fortressScreen.resources.dust")} icon="dust" current={resources.dust} required={cost.dust ?? 0} tone="violet" />
        </div>
        <button
          className="frontline-motion-action frontline-feedback-upgrade rounded-[20px] border border-[#f8d57b]/28 bg-[linear-gradient(180deg,#fff0bc_0%,#f5c451_46%,#b96d1f_100%)] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#221102] shadow-[0_16px_32px_rgba(245,196,81,0.22)] transition disabled:opacity-40 disabled:hover:translate-y-0"
          disabled={!affordable}
          onClick={onUpgrade}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <ProgressionIcon name="upgrade" size="sm" />
            {t("fortressScreen.upgrade.action")}
          </span>
        </button>
      </div>
    </section>
  );
}

function FortressStatus({
  integrity,
  integrityState,
  forecast,
  lastReport,
  reportPulse,
  t,
}: {
  integrity: number;
  integrityState: ReturnType<typeof integrityMeta>;
  forecast: { attackPower: number; defensePower: number; outcome: FrontlineFortressOutcome; rewards: Rewards };
  lastReport: { outcome: FrontlineFortressOutcome; attackPower: number; defensePower: number; integrityDelta: number; rewards: Rewards } | null;
  reportPulse: boolean;
  t: TranslateFn;
}) {
  const lastState = lastReport ? outcomeMeta(lastReport.outcome, t) : null;
  return (
    <section className="grid gap-3">
      <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,20,31,0.66),rgba(6,8,14,0.86))] p-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <FortressIcon name="integrity" size="md" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/44">{t("fortressScreen.status.wallCondition")}</div>
              <div className="mt-1 text-xl font-black text-white">{integrityState.label}</div>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{integrity}%</div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/8">
          <div className={cn("h-full rounded-full", integrityState.bar)} style={{ width: `${Math.max(8, integrity)}%` }} />
        </div>
      </div>

      <div className={cn("relative overflow-hidden rounded-[24px] border p-3 backdrop-blur-xl transition", lastState ? lastState.panel : "border-white/10 bg-[linear-gradient(180deg,rgba(15,20,31,0.58),rgba(6,8,14,0.84))]", reportPulse && "frontline-reward-success animate-[rewardPop_0.85s_ease-out_1] ring-2 ring-[#f5c451]/24")}>
        <RewardBurstOverlay rewards={lastReport?.rewards} active={reportPulse} compact />
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <FortressIcon name={lastReport && lastReport.integrityDelta < 0 ? "repair" : "raid"} size="md" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/44">{t("fortressScreen.status.lastRaidReport")}</div>
              <div className="mt-1 text-lg font-black text-white">{lastState?.headline ?? t("fortressScreen.status.noReport")}</div>
            </div>
          </div>
          <GameIcon kind="rewards" tone={lastState?.iconTone ?? "steel"} size="sm" />
        </div>
        {lastReport ? (
          <>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <MiniFact label={t("fortressScreen.metrics.attack")} value={lastReport.attackPower} />
              <MiniFact label={t("fortressScreen.metrics.defense")} value={lastReport.defensePower} />
              <MiniFact label={t("fortressScreen.metrics.wall")} value={lastReport.integrityDelta} danger={lastReport.integrityDelta < 0} />
            </div>
            <RewardRow rewards={lastReport.rewards} className="mt-3" t={t} />
          </>
        ) : (
          <div className="mt-3 text-[12px] leading-5 text-white/52">
            {t("fortressScreen.status.emptyReport")}
          </div>
        )}
      </div>

      <div className="rounded-[24px] border border-white/10 bg-black/18 p-3 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/44">
          <FortressIcon name="watchtower" size="sm" />
          <span>{t("fortressScreen.status.currentForecast")}</span>
        </div>
        <div className="mt-2 text-sm font-black text-white">{outcomeMeta(forecast.outcome, t).headline}</div>
      </div>
    </section>
  );
}

function GarrisonPanel({
  garrison,
  setGarrisonSlot,
  defenseRating,
  heroProfiles,
  t,
}: {
  garrison: [string | null, string | null, string | null];
  setGarrisonSlot: (slot: number, heroId: string | null) => void;
  defenseRating: number;
  heroProfiles: FrontlineHeroProfileMap;
  t: TranslateFn;
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,17,28,0.58),rgba(5,7,12,0.84))] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{t("fortressScreen.garrison.eyebrow")}</div>
          <div className="mt-1 text-lg font-black text-white">{t("fortressScreen.garrison.title")}</div>
        </div>
        <FortressIcon name="garrison" size="lg" />
      </div>

      <div className="mt-3 grid gap-2">
        {garrison.map((heroId, index) => {
          const hero = heroId ? heroProfiles[heroId] ?? getFrontlineHeroProfileById(heroId) : null;
          return (
            <GarrisonSlotCard
              key={`garrison-slot-${index}`}
              hero={hero}
              label={index === 0 ? t("fortressScreen.garrison.leftWall") : index === 1 ? t("fortressScreen.garrison.mainGate") : t("fortressScreen.garrison.rightWall")}
              emptyLabel={t("fortressScreen.garrison.emptyGuard")}
              clearLabel={t("fortressScreen.garrison.clear")}
              onClear={heroId ? () => setGarrisonSlot(index, null) : undefined}
              t={t}
            />
          );
        })}
      </div>

      <div className="mt-3 rounded-[18px] border border-white/10 bg-white/[0.035] p-2.5">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.16em] text-white/46">
          <span className="inline-flex items-center gap-2">
            <FortressIcon name="defense_rating" size="sm" />
            {t("fortressScreen.garrison.defenseRating")}
          </span>
          <span>{defenseRating}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {FRONTLINE_HEROES.map((hero) => {
          const selectedIndex = garrison.findIndex((entry) => entry === hero.heroId);
          const progressedHero = heroProfiles[hero.heroId] ?? hero;
          return (
            <button
              key={hero.heroId}
              className={cn(
                "frontline-motion-tab rounded-[16px] border p-2 text-left transition",
                selectedIndex >= 0
                  ? "border-[#f5c451]/24 bg-[#f5c451]/10 shadow-[0_12px_28px_rgba(245,196,81,0.1)]"
                  : "border-white/10 bg-white/[0.035] hover:border-white/18",
              )}
              onClick={() => {
                const targetSlot = selectedIndex >= 0 ? selectedIndex : firstOpenSlot(garrison);
                setGarrisonSlot(targetSlot, hero.heroId);
              }}
            >
              <div className="flex items-center gap-2">
                <GameIcon kind={selectedIndex >= 0 ? "shield" : "heroes"} tone={selectedIndex >= 0 ? "gold" : "steel"} size="sm" className="h-9 w-9 rounded-[14px]" />
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-black text-white">{hero.name.split(" ")[0]}</div>
                  <div className="truncate text-[10px] uppercase tracking-[0.1em] text-white/42">{progressedHero.role}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RaidHistoryPanel({
  lastReport,
  raidsResolved,
  integrity,
  t,
}: {
  lastReport: { outcome: FrontlineFortressOutcome } | null;
  raidsResolved: number;
  integrity: number;
  t: TranslateFn;
}) {
  const outcome = lastReport ? outcomeMeta(lastReport.outcome, t) : null;
  return (
    <details className="group rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,15,22,0.5),rgba(5,7,12,0.78))] p-3 backdrop-blur-xl">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{t("fortressScreen.loop.eyebrow")}</div>
          <div className="mt-1 text-base font-black text-white">{outcome?.label ?? t("fortressScreen.loop.awaiting")}</div>
        </div>
        <span className="inline-flex items-center gap-2">
          <FortressIcon name="keep" size="md" />
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/42 group-open:hidden">{raidsResolved} / {integrity}%</span>
        </span>
      </summary>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniFact label={t("fortressScreen.metrics.resolved")} value={raidsResolved} />
        <MiniFact label={t("fortressScreen.metrics.integrity")} value={`${integrity}%`} />
      </div>
    </details>
  );
}

function GarrisonSlotCard({
  hero,
  label,
  emptyLabel,
  clearLabel,
  onClear,
  t,
}: {
  hero: FrontlineHeroDef | null;
  label: string;
  emptyLabel: string;
  clearLabel: string;
  onClear?: () => void;
  t: TranslateFn;
}) {
  const visual = hero ? getFrontlineHeroVisualAsset(hero.heroId) : null;
  return (
    <div className={cn("flex items-center gap-2 rounded-[18px] border p-2", hero ? "border-[#f5c451]/18 bg-[#f5c451]/8" : "border-dashed border-white/10 bg-white/[0.025]")}>
      <div className="grid h-16 w-14 shrink-0 place-items-end overflow-hidden rounded-[14px] border border-white/10 bg-black/22">
        {visual?.standeeSrc ? (
          <img
            src={visual.standeeSrc}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain object-bottom drop-shadow-[0_10px_14px_rgba(0,0,0,0.44)]"
          />
        ) : (
          <FortressIcon name="garrison" size="md" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#f5d498]/82">{label}</div>
        <div className="mt-0.5 truncate text-sm font-black text-white">{hero ? frontlineHeroName(t, hero) : emptyLabel}</div>
        {hero ? (
          <div className="mt-1 flex gap-2 text-[9px] font-black uppercase tracking-[0.08em] text-white/52">
            <span>{frontlineHeroRole(t, hero)}</span>
            <span>HP {hero.maxHp}</span>
            <span>ATK {hero.atk}</span>
            <span>DEF {hero.def}</span>
          </div>
        ) : null}
      </div>
      {onClear ? (
        <button
          className="frontline-motion-action rounded-full border border-white/12 bg-black/30 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/58 transition hover:text-white"
          onClick={onClear}
        >
          {clearLabel}
        </button>
      ) : null}
    </div>
  );
}

function SceneLight() {
  return (
    <>
      <span className="pointer-events-none absolute left-[12%] top-[16%] h-40 w-40 rounded-full bg-[#f5c451]/12 blur-[70px]" />
      <span className="pointer-events-none absolute right-[10%] top-[20%] h-44 w-44 rounded-full bg-sky-300/12 blur-[80px]" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,rgba(2,5,10,0.72),transparent)]" />
    </>
  );
}

function HeroMetric({
  icon,
  label,
  value,
}: {
  icon: FortressIconName;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/24 px-3 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <FortressIcon name={icon} size="lg" />
        <div className="min-w-0">
          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
          <div className="mt-1 truncate text-sm font-black text-white">{value}</div>
        </div>
      </div>
    </div>
  );
}

function PressureBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "ally" | "enemy" }) {
  const width = Math.max(8, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.14em] text-white/48">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-black/34">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "ally" ? "bg-[linear-gradient(90deg,#55d18f,#f5d498)]" : "bg-[linear-gradient(90deg,#d95764,#ffb16f)]",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function RewardRow({ rewards, className, t }: { rewards: Rewards; className?: string; t: TranslateFn }) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      <GameRewardToken icon="gold" tone="gold" label={t("fortressScreen.resources.gold")} value={rewards.gold ?? 0} size="sm" featured />
      <GameRewardToken icon="dust" tone="violet" label={t("fortressScreen.resources.dust")} value={rewards.dust ?? 0} size="sm" featured />
      <GameRewardToken icon="gem" tone="sky" label={t("fortressScreen.resources.gems")} value={rewards.gems ?? 0} size="sm" featured />
    </div>
  );
}

function CostTile({
  label,
  icon,
  current,
  required,
  tone,
}: {
  label: string;
  icon: "gold" | "dust";
  current: number;
  required: number;
  tone: GameIconTone;
}) {
  const enough = current >= required;
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/20 p-3">
      <div className="flex items-center gap-2">
        <GameIcon kind={icon} tone={tone} size="sm" className="h-8 w-8 rounded-[12px] p-1" />
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.14em] text-white/42">{label}</div>
          <div className={cn("text-sm font-black", enough ? "text-white" : "text-rose-200")}>{current}/{required}</div>
        </div>
      </div>
    </div>
  );
}

function MiniFact({ label, value, danger }: { label: string; value: ReactNode; danger?: boolean }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/18 px-3 py-2">
      <div className="text-[9px] font-black uppercase tracking-[0.14em] text-white/38">{label}</div>
      <div className={cn("mt-1 text-sm font-black", danger ? "text-rose-200" : "text-white")}>{value}</div>
    </div>
  );
}
