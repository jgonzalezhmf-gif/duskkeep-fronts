"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import BattleEntryTransition from "@/components/game/frontline/BattleEntryTransition";
import { FrontlineBattleViewport } from "@/components/game/frontline/FrontlineBattleViewport";
import FrontlineBattleLoadingShell from "@/components/game/frontline/FrontlineBattleLoadingShell";
import GameBackNav from "@/components/game/shared/GameBackNav";
import GameIcon from "@/components/game/shared/GameIcon";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import { LazyRewardBurstOverlay } from "@/components/game/shared/LazyRewardBurstOverlay";
import { LazyRewardFlightOverlay } from "@/components/game/shared/LazyRewardFlightOverlay";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import {
  SceneButton,
  ScreenBadge,
  ScreenPanel,
  ScreenScaffold,
} from "@/components/game/screens/ScreenChrome";
import { audio } from "@/lib/audio";
import { battleEntryTheme } from "@/features/frontline/battleEntryPresentation";
import { FRONTLINE_PRESET_BY_ID, FRONTLINE_UNIT_BY_ID } from "@/features/frontline/data";
import { getFrontlineHeroProfileById } from "@/features/frontline/heroProfile";
import { getFrontlineBattleBackgroundSrc } from "@/components/game/frontline/frontlineVisualAssets";
import { createFrontlineBattleSummary } from "@/features/frontline/battleSummary";
import { translate, useI18n } from "@/lib/i18n/useI18n";
import { hasRewardEntries } from "@/lib/rewardVisibility";
import { mergeRewards } from "@/lib/rewards";
import { useGameStore } from "@/lib/store";
import type { FrontlineBattleState } from "@/features/frontline/types";
import type { Rewards } from "@/lib/types";
import { EventMetric, ResultMetric, RewardChips } from "./EventsPrimitives";
import { EventEntryPanel } from "./EventEntryPanel";
import { EventOperationCard } from "./EventOperationCard";
import {
  buildEventFocus,
  eventOperations,
  todayKey,
  type EventFocus,
  type FrontlineEventOperation,
  type TranslateFn,
} from "./eventsPageHelpers";

const FrontlineBattle = dynamic(() => import("@/components/game/frontline/FrontlineBattle"), {
  ssr: false,
  loading: FrontlineBattleLoadingShell,
});

type EventPhase = "list" | "intro" | "battle" | "post";

type EventResult = {
  winner: "ally" | "enemy" | "draw";
  operation: FrontlineEventOperation;
  rewards: Rewards;
  rounds: number;
  allyCoreHp: number;
  enemyCoreHp: number;
  firstClear: boolean;
};

export default function EventsPage() {
  const { locale, t } = useI18n();
  const [clientReady, setClientReady] = useState(false);
  const resources = useGameStore((state) => state.resources);
  const level = useGameStore((state) => state.account.level);
  const frontlineLoadout = useGameStore((state) => state.frontlineLoadout);
  const playerHeroes = useGameStore((state) => state.heroes);
  const nextSeed = useGameStore((state) => state.nextSeed);
  const recordEventResult = useGameStore((state) => state.recordEventResultOnlineFirst);
  const eventCompletions = useGameStore((state) => state.eventCompletions);

  const operations = useMemo(() => eventOperations((key, params) => translate(locale, key, params)), [locale]);
  const [phase, setPhase] = useState<EventPhase>("list");
  const [activeOperation, setActiveOperation] = useState<FrontlineEventOperation | null>(operations[0] ?? null);
  const [seed, setSeed] = useState(1);
  const [result, setResult] = useState<EventResult | null>(null);

  const today = useMemo(() => todayKey(), []);
  const squadReady = frontlineLoadout.squad.filter(Boolean).length === 3;
  const deckReady = frontlineLoadout.deck.filter(Boolean).length === 8;
  const loadoutReady = squadReady && deckReady;
  const eventFocus = useMemo(
    () =>
      buildEventFocus({
        operations,
        loadoutReady,
        level,
        isDoneToday: (id) => eventCompletions[id] === today,
      }),
    [eventCompletions, level, loadoutReady, operations, today],
  );
  const playerHeroById = useMemo(() => new Map(playerHeroes.map((hero) => [hero.heroId, hero] as const)), [playerHeroes]);
  const battleEntryAllyHeroes = useMemo(
    () => frontlineLoadout.squad.map((heroId) => (heroId ? getFrontlineHeroProfileById(heroId, playerHeroById.get(heroId)) : null)),
    [frontlineLoadout.squad, playerHeroById],
  );
  const battleEntryEnemyHeroes = useMemo(() => {
    if (!activeOperation) return [];
    const preset = FRONTLINE_PRESET_BY_ID[activeOperation.presetId];
    return preset?.squad.map((heroId) => FRONTLINE_UNIT_BY_ID[heroId] ?? null) ?? [];
  }, [activeOperation]);
  const battleEntryBackgroundSrc = activeOperation
    ? getFrontlineBattleBackgroundSrc(activeOperation.threat === "epic" ? "ch1_boss_eclipse_gate" : "ch1_battle_ruins")
    : null;

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    if (phase === "intro" || phase === "battle") {
      audio.setTheme(battleEntryTheme("event"));
      return;
    }
    if (phase === "post") {
      audio.setTheme("postbattle");
      return;
    }
    audio.setTheme("event");
  }, [phase]);

  useEffect(() => {
    if (!activeOperation && operations[0]) setActiveOperation(operations[0]);
  }, [activeOperation, operations]);

  function doneToday(id: string) {
    return eventCompletions[id] === today;
  }

  function startOperation(operation: FrontlineEventOperation) {
    if (!loadoutReady || level < operation.unlockLevel) return;
    setActiveOperation(operation);
    setSeed(nextSeed());
    setResult(null);
    setPhase("intro");
  }

  const enterBattle = useCallback(() => {
    setPhase("battle");
  }, []);

  async function finishOperation(winner: "ally" | "enemy" | "draw", battleState: FrontlineBattleState) {
    if (!activeOperation) return;
    const won = winner === "ally";
    const alreadyDone = doneToday(activeOperation.id);
    const previewRewards = won && !alreadyDone ? mergeRewards(activeOperation.rewards, activeOperation.firstClearRewards) : {};
    const recorded = await recordEventResult({
      eventId: activeOperation.id,
      battleSeed: seed,
      winner,
      turns: battleState.round,
      battleSummary: createFrontlineBattleSummary(battleState),
      rewards: previewRewards,
      source: activeOperation.name,
    });
    if (!recorded) {
      setPhase("list");
      return;
    }

    setResult({
      winner,
      operation: activeOperation,
      rewards: recorded.rewards,
      rounds: battleState.round,
      allyCoreHp: battleState.allyCoreHp,
      enemyCoreHp: battleState.enemyCoreHp,
      firstClear: recorded.firstClear,
    });
    setPhase("post");
  }

  if (phase === "intro" && activeOperation) {
    return (
      <BattleEntryTransition
        mode="event"
        title={activeOperation.name}
        subtitle={activeOperation.mutator}
        allyHeroes={battleEntryAllyHeroes}
        enemyHeroes={battleEntryEnemyHeroes}
        battleBackgroundSrc={battleEntryBackgroundSrc}
        onComplete={enterBattle}
      />
    );
  }

  if (phase === "battle" && activeOperation) {
    return (
      <FrontlineBattleViewport>
        <FrontlineBattle
          seed={seed}
          loadout={frontlineLoadout}
          enemyPresetId={activeOperation.presetId}
          battleBackgroundSrc={battleEntryBackgroundSrc}
          onFinished={finishOperation}
        />
      </FrontlineBattleViewport>
    );
  }

  if (phase === "post" && result) {
    const won = result.winner === "ally";
    return (
      <ScreenScaffold scene="events" dock={false} homeNav={false} hud={false}>
        <EventsTopChrome resources={resources} t={t} />
        <LazyRewardFlightOverlay rewards={result.rewards} active={hasRewardEntries(result.rewards)} nonce={`${result.operation.id}-${result.rounds}`} origin="center" />
        <div className="absolute inset-0 grid place-items-center px-4 py-24">
          <ScreenPanel className="w-full max-w-[42rem] p-5 text-center md:p-7" accent={won}>
            <LazyRewardBurstOverlay rewards={result.rewards} active={hasRewardEntries(result.rewards)} compact />
            <div className="mx-auto w-fit">
              {won ? <ModeIcon name={result.operation.icon} size="xl" /> : <GameIcon kind="battle" tone="ember" size="lg" />}
            </div>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#f5d498]">{t("eventsScreen.result.eyebrow")}</div>
            <div className="mt-3 text-4xl font-black text-white">
              {won ? t("eventsScreen.result.cleared") : result.winner === "draw" ? t("eventsScreen.result.stalemate") : t("eventsScreen.result.failed")}
            </div>
            <div className="mt-2 text-sm text-white/62">
              {t("eventsScreen.result.rounds", { name: result.operation.name, rounds: result.rounds })}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <ResultMetric label={t("eventsScreen.result.allyCore")} value={result.allyCoreHp} />
              <ResultMetric label={t("eventsScreen.result.enemyCore")} value={result.enemyCoreHp} />
              <ResultMetric label={t("eventsScreen.result.status")} value={result.firstClear ? t("eventsScreen.result.dailyClear") : t("eventsScreen.result.replay")} />
            </div>
            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.045] p-4 text-left">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/46">{t("eventsScreen.result.rewards")}</div>
              {hasRewardEntries(result.rewards) ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <RewardChips rewards={result.rewards} t={t} />
                </div>
              ) : (
                <div className="mt-3 rounded-[18px] border border-emerald-200/14 bg-emerald-300/8 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-100/74">
                  {t("eventsScreen.result.dailyPayoutClaimed")}
                </div>
              )}
              {result.firstClear ? <div className="mt-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#f5d498]">{t("eventsScreen.result.dailyPayoutClaimed")}</div> : null}
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <SceneButton onClick={() => setPhase("list")} variant="secondary">
                {t("eventsScreen.result.backToEvents")}
              </SceneButton>
              <SceneButton onClick={() => startOperation(result.operation)} disabled={!loadoutReady || level < result.operation.unlockLevel}>
                {t("eventsScreen.result.replayOperation")}
              </SceneButton>
            </div>
          </ScreenPanel>
        </div>
      </ScreenScaffold>
    );
  }

  const clearedToday = operations.filter((operation) => doneToday(operation.id)).length;

  return (
    <ScreenScaffold scene="events" dock={false} homeNav={false} hud={false}>
      <EventsTopChrome resources={resources} t={t} />
      {!clientReady ? (
        <div className="absolute inset-x-3 bottom-4 top-20 z-20 overflow-hidden md:inset-x-8 md:top-[5.5rem]" aria-busy="true">
          <div className="mx-auto flex max-w-[88rem] flex-col gap-2.5 pb-5">
            <ScreenPanel className="overflow-hidden p-3">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(217,165,255,0.14),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(245,196,81,0.1),transparent_24%)]" />
              <div className="relative z-[1]">
                <div className="h-7 w-32 rounded-full border border-violet-200/20 bg-violet-300/10" />
                <div className="mt-3 h-10 max-w-[28rem] rounded-full bg-white/[0.07]" />
                <div className="mt-3 grid gap-2 md:grid-cols-4">
                  <div className="h-20 rounded-[22px] border border-white/10 bg-white/[0.045]" />
                  <div className="h-20 rounded-[22px] border border-white/10 bg-white/[0.045]" />
                  <div className="h-20 rounded-[22px] border border-white/10 bg-white/[0.045]" />
                  <div className="h-20 rounded-[22px] border border-white/10 bg-white/[0.045]" />
                </div>
              </div>
            </ScreenPanel>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="h-72 rounded-[28px] border border-white/10 bg-white/[0.04]" />
              <div className="h-72 rounded-[28px] border border-white/10 bg-white/[0.04]" />
              <div className="h-72 rounded-[28px] border border-white/10 bg-white/[0.04]" />
            </div>
          </div>
        </div>
      ) : (
      <div className="absolute inset-x-3 bottom-4 top-20 z-20 overflow-y-auto md:inset-x-8 md:top-[5.5rem]">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-2.5 pb-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <ScreenPanel className="overflow-hidden p-3">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(217,165,255,0.18),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(245,196,81,0.14),transparent_24%)]" />
              <div className="relative z-[1]">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="inline-flex rounded-full border border-violet-200/20 bg-violet-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-violet-100">
                      {t("eventsScreen.hero.badge")}
                    </div>
                    <h1 className="mt-2 max-w-[42rem] text-[1.65rem] font-black leading-[0.94] tracking-[-0.04em] text-white md:text-[2.2rem]">
                      {t("eventsScreen.hero.title")}
                    </h1>
                  </div>
                  <div className="hidden max-w-[22rem] rounded-[18px] border border-violet-200/14 bg-black/22 px-3 py-2 text-[11px] leading-4 text-violet-50/62 lg:block">
                    {t("eventsScreen.hero.copy")}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                  <EventMetric icon="events" modeIcon="daily_event" label={t("eventsScreen.metrics.live")} value={operations.length} tone="violet" active />
                  <EventMetric icon="rewards" label={t("eventsScreen.metrics.cleared")} value={`${clearedToday}/${operations.length}`} tone="emerald" />
                  <EventMetric icon="power" label={t("eventsScreen.metrics.level")} value={level} tone="gold" />
                  <EventMetric icon="deck" label={t("eventsScreen.metrics.deck")} value={loadoutReady ? t("eventsScreen.metrics.ready") : t("eventsScreen.metrics.fix")} tone={loadoutReady ? "sky" : "ember"} />
                </div>
                <EventFocusBanner focus={eventFocus} t={t} />
              </div>
            </ScreenPanel>

            <EventEntryPanel squad={frontlineLoadout.squad} loadoutReady={loadoutReady} t={t} />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {operations.map((operation, index) => (
              <EventOperationCard
                key={operation.id}
                operation={operation}
                featured={index === 0}
                unlocked={level >= operation.unlockLevel}
                done={doneToday(operation.id)}
                disabled={!loadoutReady || level < operation.unlockLevel}
                onStart={() => startOperation(operation)}
                t={t}
              />
            ))}
          </div>
        </div>
      </div>
      )}
    </ScreenScaffold>
  );
}

function EventFocusBanner({ focus, t }: { focus: EventFocus; t: TranslateFn }) {
  if (!focus.operation) return null;
  const badgeTone = focus.state === "ready" ? "gold" : focus.state === "deck" ? "ember" : focus.state === "locked" ? "neutral" : "emerald";
  return (
    <div className="mt-2.5 overflow-hidden rounded-[22px] border border-violet-200/16 bg-black/24 p-2.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <ModeIcon name={focus.operation.icon} size="md" />
          <div className="min-w-0">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-100/52">{t("eventsScreen.focus.eyebrow")}</div>
            <div className="mt-0.5 truncate text-base font-black text-white">{focus.operation.name}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ScreenBadge tone={badgeTone}>{t(`eventsScreen.focus.${focus.state}`)}</ScreenBadge>
          <RewardChips rewards={focus.operation.rewards} compact t={t} />
        </div>
      </div>
      <div className="mt-2 text-[11px] leading-4 text-violet-50/62">{t(focus.reasonKey, { level: focus.operation.unlockLevel })}</div>
    </div>
  );
}

function EventsTopChrome({ resources, t }: { resources: { gold: number; dust: number; gems: number }; t: TranslateFn }) {
  return (
    <>
      <GameBackNav />
      <div className="pointer-events-auto fixed right-3 top-3 z-40 flex items-center gap-1.5 md:right-5 md:top-4 md:gap-2">
        <GameResourceBar resources={resources} size="sm" className="max-w-[calc(100vw-9rem)] md:max-w-none" />
      </div>
    </>
  );
}
