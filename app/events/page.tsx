"use client";

import { useEffect, useMemo, useState } from "react";
import FrontlineBattle from "@/components/game/frontline/FrontlineBattle";
import GameBackNav from "@/components/game/shared/GameBackNav";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import { ModeIcon, type ModeIconName } from "@/components/game/shared/ModeIcon";
import { RewardBurstOverlay } from "@/components/game/shared/RewardBurstOverlay";
import { RewardFlightOverlay } from "@/components/game/shared/RewardFlightOverlay";
import {
  SceneButton,
  ScreenBadge,
  ScreenPanel,
  ScreenScaffold,
} from "@/components/game/screens/ScreenChrome";
import { EVENTS } from "@/data/events";
import { TD_EVENTS } from "@/data/towerDefense";
import { eventUnlockLevel } from "@/data/unlocks";
import { mergeRewards } from "@/features/battle/rewards";
import {
  FRONTLINE_LEADER_BY_ID,
  FRONTLINE_PRESET_BY_ID,
  FRONTLINE_UNIT_BY_ID,
} from "@/features/frontline/data";
import { cn } from "@/lib/cn";
import { frontlineLeaderName, frontlinePresetName } from "@/lib/i18n/frontlineText";
import { translate, useI18n } from "@/lib/i18n/useI18n";
import { hasRewardEntries } from "@/lib/rewardVisibility";
import { useGameStore } from "@/lib/store";
import type { FrontlineBattleState } from "@/features/frontline/types";
import type { Rewards } from "@/lib/types";
import { EnemyLineup, EventMetric, EventSquadChip, ResultMetric, RewardChips, SmallStat } from "./EventsPrimitives";

type EventPhase = "list" | "battle" | "post";
type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

type FrontlineEventOperation = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  presetId: string;
  rewards: Rewards;
  firstClearRewards?: Rewards;
  unlockLevel: number;
  tone: GameIconTone;
  icon: ModeIconName;
  signature: string;
  mutator: string;
  threat: "common" | "rare" | "epic";
};

type EventResult = {
  winner: "ally" | "enemy" | "draw";
  operation: FrontlineEventOperation;
  rewards: Rewards;
  rounds: number;
  allyCoreHp: number;
  enemyCoreHp: number;
  firstClear: boolean;
};

const EVENT_PRESETS: Record<string, string> = {
  gold_rush: "bonewood_raiders",
  arcane_surge: "plague_pack",
};

const EVENT_TONES: Record<string, { tone: GameIconTone; icon: FrontlineEventOperation["icon"] }> = {
  gold_rush: {
    tone: "gold",
    icon: "daily_event",
  },
  arcane_surge: {
    tone: "violet",
    icon: "challenge",
  },
};

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function tx(t: TranslateFn, key: string, fallback: string, params?: Record<string, string | number>) {
  const value = t(key, params);
  return value === key ? fallback : value;
}

function eventOperationText(t: TranslateFn, eventId: string, field: "name" | "description" | "signature" | "mutator", fallback: string) {
  return tx(t, `eventsScreen.operations.${eventId}.${field}`, fallback);
}

function eventOperations(t: TranslateFn): FrontlineEventOperation[] {
  const normal = EVENTS.map((event, index) => {
    const meta = EVENT_TONES[event.id] ?? {
      tone: "sky" as GameIconTone,
      icon: "daily_event" as const,
    };
    return {
      id: event.id,
      name: eventOperationText(t, event.id, "name", event.name),
      eyebrow: t("eventsScreen.operation.rotatingEyebrow"),
      description: eventOperationText(t, event.id, "description", event.description),
      presetId: EVENT_PRESETS[event.id] ?? (index === 0 ? "bonewood_raiders" : "plague_pack"),
      rewards: event.rewards,
      unlockLevel: eventUnlockLevel(event.id) ?? 1,
      tone: meta.tone,
      icon: meta.icon,
      signature: eventOperationText(t, event.id, "signature", t("eventsScreen.operation.rotatingFront")),
      mutator: eventOperationText(t, event.id, "mutator", t("eventsScreen.operation.standardPayout")),
      threat: index === 0 ? "common" : "rare",
    } satisfies FrontlineEventOperation;
  });

  const sieges = TD_EVENTS.map((event) => ({
    id: event.id,
    name: eventOperationText(t, event.id, "name", event.name),
    eyebrow: t("eventsScreen.operation.siegeEyebrow"),
    description: eventOperationText(t, event.id, "description", event.description),
    presetId: "ember_court",
    rewards: event.rewards,
    firstClearRewards: event.firstClearRewards,
    unlockLevel: event.unlockAccountLevel,
    tone: "ember" as GameIconTone,
    icon: "fortress_raid" as const,
    signature: t("eventsScreen.operation.wavePressure", { count: event.waves.length }),
    mutator: t("eventsScreen.operation.highThreatPreset"),
    threat: "epic" as const,
  }));

  return [...normal, ...sieges];
}

export default function EventsPage() {
  const { locale, t } = useI18n();
  const resources = useGameStore((state) => state.resources);
  const level = useGameStore((state) => state.account.level);
  const frontlineLoadout = useGameStore((state) => state.frontlineLoadout);
  const nextSeed = useGameStore((state) => state.nextSeed);
  const awardRewards = useGameStore((state) => state.awardRewards);
  const recordBattleResult = useGameStore((state) => state.recordBattleResult);
  const markEventCompleted = useGameStore((state) => state.markEventCompleted);
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
    setPhase("battle");
  }

  function finishOperation(winner: "ally" | "enemy" | "draw", battleState: FrontlineBattleState) {
    if (!activeOperation) return;
    const won = winner === "ally";
    const alreadyDone = doneToday(activeOperation.id);
    const rewards = won
      ? alreadyDone
        ? {}
        : mergeRewards(activeOperation.rewards, activeOperation.firstClearRewards)
      : winner === "draw"
        ? { gold: 35, accountXp: 2 }
        : { accountXp: 1 };

    recordBattleResult(won, "event");
    if (won && !alreadyDone) {
      awardRewards(rewards, activeOperation.name);
      markEventCompleted(activeOperation.id);
    }

    setResult({
      winner,
      operation: activeOperation,
      rewards,
      rounds: battleState.round,
      allyCoreHp: battleState.allyCoreHp,
      enemyCoreHp: battleState.enemyCoreHp,
      firstClear: won && !alreadyDone,
    });
    setPhase("post");
  }

  if (phase === "battle" && activeOperation) {
    return (
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-3 pb-8 pt-4 md:px-6 md:pb-10 md:pt-6 xl:px-8">
        <FrontlineBattle
          seed={seed}
          loadout={frontlineLoadout}
          enemyPresetId={activeOperation.presetId}
          onFinished={finishOperation}
        />
      </div>
    );
  }

  if (phase === "post" && result) {
    const won = result.winner === "ally";
    return (
      <ScreenScaffold scene="events" dock={false} homeNav={false} hud={false}>
        <EventsTopChrome resources={resources} t={t} />
        <RewardFlightOverlay rewards={result.rewards} active={hasRewardEntries(result.rewards)} nonce={`${result.operation.id}-${result.rounds}`} origin="center" />
        <div className="absolute inset-0 grid place-items-center px-4 py-24">
          <ScreenPanel className="w-full max-w-[42rem] p-5 text-center md:p-7" accent={won}>
            <RewardBurstOverlay rewards={result.rewards} active={hasRewardEntries(result.rewards)} compact />
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
              </div>
            </ScreenPanel>

            <ScreenPanel className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#f5d498]">{t("eventsScreen.entry.eyebrow")}</div>
                  <div className="mt-1 text-lg font-black text-white">{t("eventsScreen.entry.title")}</div>
                </div>
                <ScreenBadge tone={loadoutReady ? "gold" : "ember"}>{loadoutReady ? t("eventsScreen.entry.ready") : t("eventsScreen.entry.deckNeeded")}</ScreenBadge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5 lg:grid-cols-1 lg:gap-2">
                {frontlineLoadout.squad.map((heroId, index) => {
                  const hero = heroId ? FRONTLINE_UNIT_BY_ID[heroId] : null;
                  return (
                    <EventSquadChip
                      key={`${heroId ?? "empty"}-${index}`}
                      hero={hero}
                      label={index === 0 ? t("eventsScreen.entry.left") : index === 1 ? t("eventsScreen.entry.center") : t("eventsScreen.entry.right")}
                      emptyLabel={t("eventsScreen.entry.deckNeeded")}
                      t={t}
                      compact
                    />
                  );
                })}
              </div>
              {!loadoutReady ? (
                <a href="/deck" className="mt-3 block rounded-[18px] border border-[#f5c451]/22 bg-[#f5c451]/12 px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#f5d498]">
                  {t("eventsScreen.entry.fixDeck")}
                </a>
              ) : null}
            </ScreenPanel>
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
    </ScreenScaffold>
  );
}

function EventsTopChrome({ resources, t }: { resources: { gold: number; dust: number; gems: number }; t: TranslateFn }) {
  return (
    <>
      <GameBackNav label={t("common.home")} eyebrow={t("nav.events")} icon="events" tone="violet" placement="top-left" />
      <div className="pointer-events-auto fixed right-3 top-3 z-40 flex items-center gap-1.5 md:right-5 md:top-4 md:gap-2">
        <GameResourceBar resources={resources} size="sm" className="max-w-[calc(100vw-9rem)] md:max-w-none" />
      </div>
    </>
  );
}

function EventOperationCard({
  operation,
  featured,
  unlocked,
  done,
  disabled,
  onStart,
  t,
}: {
  operation: FrontlineEventOperation;
  featured?: boolean;
  unlocked: boolean;
  done: boolean;
  disabled: boolean;
  onStart: () => void;
  t: TranslateFn;
}) {
  const preset = FRONTLINE_PRESET_BY_ID[operation.presetId];
  const leader = FRONTLINE_LEADER_BY_ID[preset?.leaderId ?? ""];
  const buttonLabel = !unlocked
    ? t("eventsScreen.card.unlocksAtLevel", { level: operation.unlockLevel })
    : done
      ? t("eventsScreen.card.replayOperation")
      : t("eventsScreen.card.startOperation");

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[26px] border p-3 shadow-[0_20px_44px_rgba(0,0,0,0.26)]",
        featured
          ? "border-violet-200/24 bg-[radial-gradient(circle_at_48%_0%,rgba(211,167,255,0.18),transparent_34%),linear-gradient(180deg,rgba(40,27,62,0.64),rgba(8,10,16,0.9))]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.052),rgba(8,10,16,0.88))]",
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/8 blur-2xl" />
      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/44">{operation.eyebrow}</div>
            <div className={cn("mt-1 font-black leading-none text-white", featured ? "text-3xl" : "text-2xl")}>{operation.name}</div>
            <div className="mt-2 text-[12px] font-black uppercase tracking-[0.13em] text-[#f5d498]">{operation.signature}</div>
          </div>
          <ModeIcon name={operation.icon} size={featured ? "lg" : "md"} />
        </div>

        {unlocked ? <p className="mt-2 max-w-[42rem] text-[12px] leading-5 text-white/58">{operation.description}</p> : null}

        <div className="mt-3 flex flex-wrap gap-2">
          <ScreenBadge tone={done ? "emerald" : unlocked ? "gold" : "neutral"}>{done ? t("eventsScreen.card.clearedToday") : unlocked ? t("eventsScreen.card.live") : t("eventsScreen.card.locked")}</ScreenBadge>
          <ScreenBadge tone={operation.threat === "epic" ? "ember" : operation.threat === "rare" ? "sky" : "neutral"}>{t(`eventsScreen.card.${operation.threat}`)}</ScreenBadge>
          <ScreenBadge tone="sky">{operation.mutator}</ScreenBadge>
        </div>

        {unlocked ? <EnemyLineup operationId={operation.id} preset={preset} t={t} /> : null}

        {unlocked ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <SmallStat label={t("eventsScreen.card.preset")} value={frontlinePresetName(t, preset)} />
            <SmallStat label={t("eventsScreen.card.leader")} value={frontlineLeaderName(t, leader)} />
            <SmallStat
              label={t("eventsScreen.card.reward")}
              value={
                done ? (
                  <ScreenBadge tone="emerald">{t("eventsScreen.result.dailyPayoutClaimed")}</ScreenBadge>
                ) : (
                  <RewardChips rewards={operation.rewards} compact t={t} />
                )
              }
            />
          </div>
        ) : (
          <div className="mt-3 rounded-[16px] border border-white/10 bg-black/18 px-3 py-2">
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{t("eventsScreen.card.reward")}</div>
            <div className="mt-2">
              <RewardChips rewards={operation.rewards} compact t={t} />
            </div>
          </div>
        )}

        {operation.firstClearRewards && !done ? (
          <div className="mt-2.5 rounded-[16px] border border-[#f5c451]/16 bg-[#f5c451]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#f5d498]">
            {t("eventsScreen.card.firstClearBonus")}
          </div>
        ) : null}

        <SceneButton onClick={onStart} disabled={disabled} className="mt-3 w-full">
          {buttonLabel}
        </SceneButton>
      </div>
    </article>
  );
}
