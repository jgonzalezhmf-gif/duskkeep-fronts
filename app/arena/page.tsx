"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import FrontlineBattle from "@/components/game/frontline/FrontlineBattle";
import { FrontlineHeroStandee } from "@/components/game/frontline/FrontlineVisualPrimitives";
import GameBackNav from "@/components/game/shared/GameBackNav";
import GameIcon, { type GameIconTone } from "@/components/game/shared/GameIcon";
import { GameResourceBar, GameRewardToken } from "@/components/game/shared/GameRewardToken";
import { ModeIcon } from "@/components/game/shared/ModeIcon";
import { RewardBurstOverlay } from "@/components/game/shared/RewardBurstOverlay";
import { RewardFlightOverlay } from "@/components/game/shared/RewardFlightOverlay";
import {
  SceneButton,
  ScreenBadge,
  ScreenPanel,
  ScreenScaffold,
  SectionTitle,
} from "@/components/game/screens/ScreenChrome";
import {
  FRONTLINE_LEADER_BY_ID,
  FRONTLINE_PRESET_BY_ID,
  FRONTLINE_UNIT_BY_ID,
} from "@/features/frontline/data";
import { mergeRewards } from "@/features/battle/rewards";
import { cn } from "@/lib/cn";
import { frontlineLeaderName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { useGameStore } from "@/lib/store";
import type { FrontlineBattleState } from "@/features/frontline/types";
import type { Rewards } from "@/lib/types";

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

type ArenaRival = {
  id: string;
  ownerName: string;
  rank: string;
  style: string;
  presetId: string;
  power: number;
  rewards: Rewards;
  tone: GameIconTone;
};

const FRONTLINE_ARENA_RIVALS: ArenaRival[] = [
  {
    id: "arena_bonewood",
    ownerName: "Ironfang",
    rank: "Bronze II",
    style: "Fast breach patrol",
    presetId: "bonewood_raiders",
    power: 110,
    rewards: { gold: 120, gems: 3, accountXp: 8 },
    tone: "ember",
  },
  {
    id: "arena_plague",
    ownerName: "Duskrose",
    rank: "Silver III",
    style: "Sustain pressure",
    presetId: "plague_pack",
    power: 175,
    rewards: { gold: 180, gems: 5, dust: 20, accountXp: 10 },
    tone: "emerald",
  },
  {
    id: "arena_ember",
    ownerName: "Stormking",
    rank: "Gold I",
    style: "Heavy core threat",
    presetId: "ember_court",
    power: 260,
    rewards: { gold: 260, gems: 8, dust: 35, accountXp: 14 },
    tone: "gold",
  },
];

type ArenaPhase = "browse" | "battle" | "post";

type ArenaResult = {
  winner: "ally" | "enemy" | "draw";
  rival: ArenaRival;
  rounds: number;
  rewards: Rewards;
  allyCoreHp: number;
  enemyCoreHp: number;
};

function tx(t: TranslateFn, key: string, fallback: string, params?: Record<string, string | number>) {
  const value = t(key, params);
  return value === key ? fallback : value;
}

function rivalText(t: TranslateFn, rival: ArenaRival, field: "rank" | "style") {
  return tx(t, `arenaScreen.rivals.${rival.id}.${field}`, rival[field]);
}

export default function ArenaPage() {
  const { t } = useI18n();
  const tickets = useGameStore((state) => state.resources.arenaTickets);
  const resources = useGameStore((state) => state.resources);
  const wins = useGameStore((state) => state.arenaWins);
  const losses = useGameStore((state) => state.arenaLosses);
  const frontlineLoadout = useGameStore((state) => state.frontlineLoadout);
  const nextSeed = useGameStore((state) => state.nextSeed);
  const awardRewards = useGameStore((state) => state.awardRewards);
  const recordBattleResult = useGameStore((state) => state.recordBattleResult);
  const refreshTickets = useGameStore((state) => state.refreshArenaTicketsIfNeeded);

  const [phase, setPhase] = useState<ArenaPhase>("browse");
  const [picked, setPicked] = useState<ArenaRival | null>(null);
  const [seed, setSeed] = useState(1);
  const [result, setResult] = useState<ArenaResult | null>(null);

  useEffect(() => {
    refreshTickets();
  }, [refreshTickets]);

  const squadReady = frontlineLoadout.squad.filter(Boolean).length === 3;
  const deckReady = frontlineLoadout.deck.filter(Boolean).length === 8;
  const loadoutReady = squadReady && deckReady;
  const record = wins + losses;
  const winRate = record ? Math.round((wins / record) * 100) : 0;

  function startArenaBattle(rival: ArenaRival) {
    if (tickets <= 0 || !loadoutReady) return;
    useGameStore.setState((state) => ({
      resources: { ...state.resources, arenaTickets: Math.max(0, state.resources.arenaTickets - 1) },
    }));
    setPicked(rival);
    setSeed(nextSeed());
    setResult(null);
    setPhase("battle");
  }

  function finishArenaBattle(winner: "ally" | "enemy" | "draw", battleState: FrontlineBattleState) {
    if (!picked) return;
    const won = winner === "ally";
    const rewards = won ? picked.rewards : winner === "draw" ? { gold: 45, dust: 5, accountXp: 3 } : { gold: 25, accountXp: 2 };
    recordBattleResult(won, "arena");
    awardRewards(
      mergeRewards(rewards),
      won ? t("arenaScreen.result.winSource", { name: picked.ownerName }) : t("arenaScreen.result.resultSource", { name: picked.ownerName }),
    );
    setResult({
      winner,
      rival: picked,
      rounds: battleState.round,
      rewards,
      allyCoreHp: battleState.allyCoreHp,
      enemyCoreHp: battleState.enemyCoreHp,
    });
    setPhase("post");
  }

  if (phase === "battle" && picked) {
    return (
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-3 pb-8 pt-4 md:px-6 md:pb-10 md:pt-6 xl:px-8">
        <FrontlineBattle
          seed={seed}
          loadout={frontlineLoadout}
          enemyPresetId={picked.presetId}
          onFinished={finishArenaBattle}
        />
      </div>
    );
  }

  if (phase === "post" && result) {
    const won = result.winner === "ally";
    return (
      <ScreenScaffold scene="arena" dock={false} homeNav={false} hud={false}>
        <ArenaTopChrome resources={resources} t={t} />
        <RewardFlightOverlay rewards={result.rewards} active nonce={`${result.rival.id}-${result.rounds}`} origin="center" />
        <div className="absolute inset-0 grid place-items-center px-4 py-24">
          <ScreenPanel className="w-full max-w-[42rem] p-5 text-center md:p-7" accent={won}>
            <RewardBurstOverlay rewards={result.rewards} compact />
            <div className="mx-auto w-fit">
              {won ? <ModeIcon name="ladder" size="xl" /> : <GameIcon kind="battle" tone="ember" size="lg" />}
            </div>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#f5d498]">{t("arenaScreen.result.eyebrow")}</div>
            <div className="mt-3 text-4xl font-black text-white">{won ? t("arenaScreen.result.victory") : result.winner === "draw" ? t("arenaScreen.result.draw") : t("arenaScreen.result.defeat")}</div>
            <div className="mt-2 text-sm text-white/62">{t("arenaScreen.result.rounds", { name: result.rival.ownerName, rounds: result.rounds })}</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <ResultMetric label={t("arenaScreen.result.allyCore")} value={result.allyCoreHp} />
              <ResultMetric label={t("arenaScreen.result.enemyCore")} value={result.enemyCoreHp} />
              <ResultMetric label={t("arenaScreen.result.rank")} value={rivalText(t, result.rival, "rank")} />
            </div>
            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.045] p-4 text-left">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/46">{t("arenaScreen.result.rewards")}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <RewardChips rewards={result.rewards} t={t} />
              </div>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <SceneButton onClick={() => setPhase("browse")} variant="secondary">
                {t("arenaScreen.result.backToArena")}
              </SceneButton>
              <SceneButton onClick={() => startArenaBattle(result.rival)} disabled={tickets <= 0 || !loadoutReady}>
                {t("arenaScreen.result.rematch")}
              </SceneButton>
            </div>
          </ScreenPanel>
        </div>
      </ScreenScaffold>
    );
  }

  return (
    <ScreenScaffold scene="arena" dock={false} homeNav={false} hud={false}>
      <ArenaTopChrome resources={resources} t={t} />
      <div className="absolute inset-x-3 bottom-4 top-20 z-20 overflow-y-auto md:inset-x-8 md:top-24">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-4 pb-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_25rem]">
            <ScreenPanel className="overflow-hidden p-4 md:p-5">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(255,151,92,0.18),transparent_24%),radial-gradient(circle_at_88%_12%,rgba(245,196,81,0.13),transparent_22%)]" />
              <div className="relative z-[1]">
                <div className="inline-flex rounded-full border border-[#f5c451]/20 bg-[#f5c451]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d498]">
                  {t("arenaScreen.hero.badge")}
                </div>
                <h1 className="mt-4 max-w-[54rem] text-[1.9rem] font-black leading-[0.92] tracking-[-0.045em] text-white md:text-[2.75rem]">
                  {t("arenaScreen.hero.title")}
                </h1>
                <p className="mt-3 max-w-[43rem] text-[13px] leading-6 text-white/64 md:text-[14px]">
                  {t("arenaScreen.hero.copy")}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                  <ArenaMetric icon="tickets" label={t("arenaScreen.metrics.tickets")} value={tickets} tone="gold" active={tickets > 0} />
                  <ArenaMetric icon="rewards" modeIcon="ladder" label={t("arenaScreen.metrics.wins")} value={wins} tone="emerald" />
                  <ArenaMetric icon="shield" label={t("arenaScreen.metrics.losses")} value={losses} tone="ember" />
                  <ArenaMetric icon="power" label={t("arenaScreen.metrics.rate")} value={`${winRate}%`} tone="sky" />
                </div>
              </div>
            </ScreenPanel>

            <ScreenPanel className="p-4">
              <SectionTitle eyebrow={t("arenaScreen.gate.eyebrow")} title={t("arenaScreen.gate.title")} aside={<ScreenBadge tone={loadoutReady ? "gold" : "ember"}>{loadoutReady ? t("arenaScreen.gate.ready") : t("arenaScreen.gate.deckNeeded")}</ScreenBadge>} />
              <div className="mt-4 grid gap-2">
                <GateLine label={t("arenaScreen.gate.squad")} value={`${frontlineLoadout.squad.filter(Boolean).length}/3`} ok={squadReady} />
                <GateLine label={t("arenaScreen.gate.cards")} value={`${frontlineLoadout.deck.filter(Boolean).length}/8`} ok={deckReady} />
                <GateLine label={t("arenaScreen.gate.ticket")} value={`${tickets}`} ok={tickets > 0} />
              </div>
              {!loadoutReady ? (
                <a href="/deck" className="mt-4 block rounded-[20px] border border-[#f5c451]/22 bg-[#f5c451]/12 px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-[#f5d498]">
                  {t("arenaScreen.gate.fixDeck")}
                </a>
              ) : null}
            </ScreenPanel>
          </div>

          <ScreenPanel className="p-4 md:p-5">
            <SectionTitle
              eyebrow={t("arenaScreen.floor.eyebrow")}
              title={t("arenaScreen.floor.title")}
              aside={<ScreenBadge tone={tickets > 0 ? "gold" : "neutral"}>{tickets > 0 ? t("arenaScreen.floor.entryReady") : t("arenaScreen.floor.noTickets")}</ScreenBadge>}
            />
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {FRONTLINE_ARENA_RIVALS.map((rival, index) => (
                <ArenaRivalCard
                  key={rival.id}
                  rival={rival}
                  featured={index === 1}
                  disabled={tickets <= 0 || !loadoutReady}
                  onChallenge={() => startArenaBattle(rival)}
                  t={t}
                />
              ))}
            </div>
          </ScreenPanel>
        </div>
      </div>
    </ScreenScaffold>
  );
}

function ArenaTopChrome({ resources, t }: { resources: { gold: number; dust: number; gems: number; arenaTickets: number }; t: TranslateFn }) {
  return (
    <>
      <GameBackNav label={t("common.home")} eyebrow={t("nav.arena")} icon="arena" tone="gold" placement="top-left" />
      <div className="pointer-events-auto fixed right-3 top-3 z-40 flex items-center gap-1.5 md:right-5 md:top-4 md:gap-2">
        <GameResourceBar resources={resources} arenaTickets={resources.arenaTickets} size="sm" className="max-w-[calc(100vw-9rem)] md:max-w-none" />
      </div>
    </>
  );
}

function ArenaRivalCard({
  rival,
  featured,
  disabled,
  onChallenge,
  t,
}: {
  rival: ArenaRival;
  featured?: boolean;
  disabled: boolean;
  onChallenge: () => void;
  t: TranslateFn;
}) {
  const preset = FRONTLINE_PRESET_BY_ID[rival.presetId];
  const leader = FRONTLINE_LEADER_BY_ID[preset?.leaderId ?? ""];

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[30px] border p-4 shadow-[0_22px_52px_rgba(0,0,0,0.28)]",
        featured
          ? "border-[#f5c451]/28 bg-[radial-gradient(circle_at_50%_0%,rgba(245,196,81,0.18),transparent_32%),linear-gradient(180deg,rgba(54,34,17,0.58),rgba(8,10,16,0.96))]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(8,10,16,0.94))]",
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/44">{rivalText(t, rival, "rank")}</div>
            <div className="mt-1 text-2xl font-black text-white">{rival.ownerName}</div>
            <div className="mt-1 text-[12px] font-black uppercase tracking-[0.13em] text-[#f5d498]">{rivalText(t, rival, "style")}</div>
          </div>
          <ModeIcon name="arena_draft" size="lg" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {preset?.squad.map((unitId, index) => {
            const unit = FRONTLINE_UNIT_BY_ID[unitId] ?? null;
            return (
              <FrontlineHeroStandee
                key={`${rival.id}-${unitId}-${index}`}
                hero={unit}
                compact
                side="enemy"
                label={index === 0 ? t("arenaScreen.card.left") : index === 1 ? t("arenaScreen.card.center") : t("arenaScreen.card.right")}
                className="min-h-[12.5rem] rounded-[22px] p-2"
              />
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <SmallStat label={t("arenaScreen.card.power")} value={rival.power} />
          <SmallStat label={t("arenaScreen.card.leader")} value={frontlineLeaderName(t, leader)} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <RewardChips rewards={rival.rewards} t={t} />
        </div>

        <SceneButton onClick={onChallenge} disabled={disabled} className="mt-5 w-full">
          {t("arenaScreen.card.challenge")}
        </SceneButton>
      </div>
    </article>
  );
}

function ArenaMetric({
  icon,
  modeIcon,
  label,
  value,
  tone,
  active,
}: {
  icon: "tickets" | "rewards" | "shield" | "power";
  modeIcon?: "ladder" | "arena_draft";
  label: string;
  value: string | number;
  tone: GameIconTone;
  active?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-[20px] border px-3 py-2.5", active ? "border-[#f5c451]/24 bg-[#f5c451]/10" : "border-white/10 bg-white/[0.045]")}>
      {modeIcon ? <ModeIcon name={modeIcon} size="lg" /> : <GameIcon kind={icon} tone={tone} size="md" />}
      <div>
        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
        <div className="mt-0.5 text-base font-black text-white">{value}</div>
      </div>
    </div>
  );
}

function GateLine({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/46">{label}</span>
      <span className={cn("text-sm font-black", ok ? "text-emerald-200" : "text-rose-200")}>{value}</span>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/18 px-3 py-2">
      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
      <div className="mt-1 truncate text-sm font-black text-white">{value}</div>
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.045] px-3 py-3">
      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
      <div className="mt-1 text-lg font-black text-white">{value}</div>
    </div>
  );
}

function RewardChips({ rewards, t }: { rewards: Rewards; t: TranslateFn }) {
  const chips: Array<{ icon: "gold" | "dust" | "gem" | "power"; tone: GameIconTone; value: number }> = [];
  if (rewards.gold) chips.push({ icon: "gold", tone: "gold", value: rewards.gold });
  if (rewards.dust) chips.push({ icon: "dust", tone: "violet", value: rewards.dust });
  if (rewards.gems) chips.push({ icon: "gem", tone: "sky", value: rewards.gems });
  if (rewards.accountXp) chips.push({ icon: "power", tone: "emerald", value: rewards.accountXp });
  return (
    <>
      {chips.map((chip) => (
        <GameRewardToken key={`${chip.icon}-${chip.value}`} icon={chip.icon} tone={chip.tone} label={t(`arenaScreen.rewards.${chip.icon === "gem" ? "gems" : chip.icon}`)} value={chip.value} size="sm" />
      ))}
    </>
  );
}
