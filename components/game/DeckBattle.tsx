"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TacticalBoard from "@/components/game/TacticalBoard";
import { BattleHandCard } from "@/components/game/deckbattle/DeckBattleCards";
import {
  BattleContextPanel,
  BattlePhaseBanner,
  HeaderChip,
  LeaderPanel,
  LeaderPowerPanel,
  ManaWellPanel,
  UtilityBubble,
} from "@/components/game/deckbattle/DeckBattlePrimitives";
import { getCard } from "@/data/cards";
import { getLeader } from "@/data/leaders";
import {
  applyLeaderPower,
  castSpellCard,
  createDeckSide,
  createInitialDeckBattleState,
  drawCards,
  finalizeDeckBattleState,
  getLeaderCore,
  playableCards,
  removeCardFromHand,
  starterOpeningHandSize,
  summonHeroCard,
  validLeaderPowerTargets,
  validSummonTiles,
  type DeckSideState,
} from "@/features/deckbattle/engine";
import { runEnemySide } from "@/features/tactical/ai";
import { endSideTurn } from "@/features/tactical/engine";
import type { Pos, TacticalState } from "@/features/tactical/types";
import { getBattleBackdrop, getLeaderPortrait } from "@/lib/art";
import { sfx } from "@/lib/audio";
import type { FortressState, PlayerHero } from "@/lib/types";

type Props = {
  allyDeck: (string | null)[];
  enemyDeck: (string | null)[];
  allyLeaderId: string;
  enemyLeaderId: string;
  allyHeroes: PlayerHero[];
  enemyHeroes: PlayerHero[];
  fortress: FortressState;
  seed: number;
  obstacles?: Pos[];
  onFinished: (winner: "ally" | "enemy" | "draw") => void;
};

type SelectedPlay = { type: "card"; cardId: string } | { type: "power" } | null;

function processTurnStart(side: DeckSideState, turnStamp: string) {
  if (side.processedTurnStamp === turnStamp) return side;
  const maxMana = Math.min(7, side.maxMana + 1);
  return drawCards(
    {
      ...side,
      mana: maxMana,
      maxMana,
      powerCooldown: Math.max(0, side.powerCooldown - 1),
      processedTurnStamp: turnStamp,
    },
    1,
  );
}

function enemyPowerTarget(state: TacticalState, leaderId: string) {
  const leader = getLeader(leaderId);
  const targets = validLeaderPowerTargets(state, leader, "enemy");
  return targets[0] ?? null;
}

function spellTarget(state: TacticalState, side: "ally" | "enemy", cardId: string): Pos | null {
  const card = getCard(cardId);
  if (card.kind !== "spell") return null;

  if (card.effect.type === "damage_aoe") {
    const enemies = state.units.filter((unit) => unit.alive && unit.side !== side);
    return enemies[0]?.pos ?? null;
  }
  if (card.effect.type === "heal_aoe") {
    const allies = state.units
      .filter((unit) => unit.alive && unit.side === side)
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    return allies[0]?.pos ?? null;
  }
  if (card.effect.type === "shield_leader") {
    return state.units.find((unit) => unit.alive && unit.side === side && unit.role === "leader")?.pos ?? null;
  }
  if (card.effect.type === "damage_line") {
    return state.units.find((unit) => unit.alive && unit.side !== side)?.pos ?? null;
  }

  return { x: 0, y: 0 };
}

export default function DeckBattle({
  allyDeck,
  enemyDeck,
  allyLeaderId,
  enemyLeaderId,
  allyHeroes,
  enemyHeroes,
  fortress,
  seed,
  obstacles,
  onFinished,
}: Props) {
  const allyOpeningHand = starterOpeningHandSize(fortress);
  const allyLeader = getLeader(allyLeaderId);
  const enemyLeader = getLeader(enemyLeaderId);
  const backdrop = useMemo(() => getBattleBackdrop(seed), [seed]);

  const [tacticalState, setTacticalState] = useState<TacticalState>(() =>
    createInitialDeckBattleState(allyLeaderId, enemyLeaderId, seed, fortress, obstacles ?? []),
  );
  const [allySide, setAllySide] = useState<DeckSideState>(() =>
    createDeckSide(allyDeck, seed + 11, allyOpeningHand, "1:ally"),
  );
  const [enemySide, setEnemySide] = useState<DeckSideState>(() =>
    createDeckSide(enemyDeck, seed + 97, 3, "1:enemy"),
  );
  const [selectedPlay, setSelectedPlay] = useState<SelectedPlay>(null);
  const finishedRef = useRef(false);

  function updateTacticalState(next: TacticalState | ((current: TacticalState) => TacticalState)) {
    setTacticalState((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      return finalizeDeckBattleState(resolved);
    });
  }

  function clearBoardFocus() {
    updateTacticalState((current) => ({ ...current, selectedUid: null, mode: "idle" }));
  }

  function clearSelections(withSound = true) {
    if (withSound) sfx.tap();
    setSelectedPlay(null);
    clearBoardFocus();
  }

  const turnStamp = `${tacticalState.round}:${tacticalState.side}`;

  useEffect(() => {
    setTacticalState(finalizeDeckBattleState(createInitialDeckBattleState(allyLeaderId, enemyLeaderId, seed, fortress, obstacles ?? [])));
    setAllySide(createDeckSide(allyDeck, seed + 11, allyOpeningHand, "1:ally"));
    setEnemySide(createDeckSide(enemyDeck, seed + 97, 3, "1:enemy"));
    setSelectedPlay(null);
    finishedRef.current = false;
  }, [allyDeck, allyLeaderId, allyOpeningHand, enemyDeck, enemyLeaderId, fortress, obstacles, seed]);

  useEffect(() => {
    if (tacticalState.winner || tacticalState.side !== "enemy") return;
    const timeout = setTimeout(() => {
      let nextState = tacticalState;
      let nextEnemySide = enemySide;

      const leaderTarget = enemyPowerTarget(nextState, enemyLeaderId);
      if (leaderTarget && nextEnemySide.mana >= enemyLeader.power.cost && nextEnemySide.powerCooldown === 0) {
        nextState = applyLeaderPower(nextState, "enemy", enemyLeader.power.effect, leaderTarget);
        nextEnemySide = {
          ...nextEnemySide,
          mana: nextEnemySide.mana - enemyLeader.power.cost,
          powerCooldown: enemyLeader.power.cooldown,
        };
      }

      const playable = playableCards(nextEnemySide).sort((a, b) => b.cost - a.cost);
      const pick = playable[0] ?? null;
      if (pick) {
        if (pick.kind === "hero") {
          const tile = validSummonTiles(nextState, "enemy")[0];
          if (tile) {
            nextState = summonHeroCard(nextState, "enemy", pick.id, tile, enemyHeroes);
            nextEnemySide = removeCardFromHand({ ...nextEnemySide, mana: nextEnemySide.mana - pick.cost }, pick.id);
          }
        } else {
          const target = spellTarget(nextState, "enemy", pick.id);
          if (target) {
            nextState = castSpellCard(nextState, "enemy", pick, target);
            nextEnemySide = removeCardFromHand({ ...nextEnemySide, mana: nextEnemySide.mana - pick.cost }, pick.id);
          }
        }
      }

      setEnemySide(nextEnemySide);
      updateTacticalState(runEnemySide(nextState));
    }, 420);

    return () => clearTimeout(timeout);
  }, [enemyHeroes, enemyLeader, enemyLeaderId, enemySide, tacticalState]);

  useEffect(() => {
    if (tacticalState.winner || finishedRef.current) return;
    setAllySide((side) => processTurnStart(side, tacticalState.side === "ally" ? turnStamp : side.processedTurnStamp));
    setEnemySide((side) => processTurnStart(side, tacticalState.side === "enemy" ? turnStamp : side.processedTurnStamp));
  }, [turnStamp, tacticalState.side, tacticalState.winner]);

  useEffect(() => {
    if (!tacticalState.winner || finishedRef.current) return;
    finishedRef.current = true;
    if (tacticalState.winner === "ally") sfx.victory();
    else if (tacticalState.winner === "enemy") sfx.defeat();
    onFinished(tacticalState.winner);
  }, [onFinished, tacticalState.winner]);

  useEffect(() => {
    if (selectedPlay?.type === "card" && !allySide.hand.includes(selectedPlay.cardId)) {
      setSelectedPlay(null);
    }
  }, [allySide.hand, selectedPlay]);

  useEffect(() => {
    if (tacticalState.side !== "ally" && selectedPlay) {
      setSelectedPlay(null);
    }
  }, [selectedPlay, tacticalState.side]);

  const externalAction = useMemo(() => {
    if (tacticalState.side !== "ally" || tacticalState.winner || !selectedPlay) return null;

    if (selectedPlay.type === "power") {
      return {
        kind: "power" as const,
        tiles: validLeaderPowerTargets(tacticalState, allyLeader, "ally"),
        onTileClick: (pos: Pos) => {
          if (allySide.mana < allyLeader.power.cost || allySide.powerCooldown > 0) return;
          sfx.ability();
          updateTacticalState((state) => applyLeaderPower(state, "ally", allyLeader.power.effect, pos));
          setAllySide((state) => ({
            ...state,
            mana: state.mana - allyLeader.power.cost,
            powerCooldown: allyLeader.power.cooldown,
          }));
          setSelectedPlay(null);
        },
      };
    }

    const card = getCard(selectedPlay.cardId);
    if (card.kind === "hero") {
      return {
        kind: "summon" as const,
        tiles: validSummonTiles(tacticalState, "ally"),
        onTileClick: (pos: Pos) => {
          if (allySide.mana < card.cost) return;
          sfx.ability();
          updateTacticalState((state) => summonHeroCard(state, "ally", card.id, pos, allyHeroes));
          setAllySide((state) => removeCardFromHand({ ...state, mana: state.mana - card.cost }, card.id));
          setSelectedPlay(null);
        },
      };
    }

    return {
      kind: "spell" as const,
      tiles: Array.from({ length: tacticalState.grid.w * tacticalState.grid.h }).map((_, index) => ({
        x: index % tacticalState.grid.w,
        y: Math.floor(index / tacticalState.grid.w),
      })),
      onTileClick: (pos: Pos) => {
        if (allySide.mana < card.cost) return;
        sfx.ability();
        updateTacticalState((state) => castSpellCard(state, "ally", card, pos));
        setAllySide((state) => removeCardFromHand({ ...state, mana: state.mana - card.cost }, card.id));
        setSelectedPlay(null);
      },
    };
  }, [allyHeroes, allyLeader, allySide, selectedPlay, tacticalState]);

  const allyCore = getLeaderCore(tacticalState, "ally");
  const enemyCore = getLeaderCore(tacticalState, "enemy");
  const playableIdSet = useMemo(() => new Set(playableCards(allySide).map((card) => card.id)), [allySide]);
  const selectedCard = selectedPlay?.type === "card" ? getCard(selectedPlay.cardId) : null;
  const focusedUnit = tacticalState.selectedUid
    ? tacticalState.units.find((entry) => entry.uid === tacticalState.selectedUid) ?? null
    : null;

  const commandTitle = selectedPlay?.type === "power"
    ? allyLeader.power.name
    : selectedCard
      ? selectedCard.name
      : focusedUnit
        ? focusedUnit.name
        : tacticalState.side === "ally"
          ? "Command phase"
          : "Enemy phase";

  const commandBody = selectedPlay?.type === "power"
    ? "Aim the leader power on a glowing valid tile."
    : selectedCard
      ? selectedCard.kind === "hero"
        ? "Deploy the selected champion onto a lit summon cell. Battlecries trigger instantly and fresh summons can strike if a target is already in range."
        : "Pick a board tile to cast the selected spell."
      : focusedUnit
        ? "The selected unit can be commanded directly from the board footer."
        : tacticalState.side === "ally"
          ? "Play a card, trigger leader power or command a unit already on the battlefield."
          : "The board is resolving enemy moves, attacks and summons.";

  const commandHint = selectedPlay?.type === "power"
    ? `${allyLeader.power.cost} mana · cooldown ${allySide.powerCooldown}`
    : selectedCard
      ? `${selectedCard.kind === "hero" ? "Summon" : "Spell"} · cost ${selectedCard.cost}`
      : focusedUnit
        ? `${focusedUnit.hp}/${focusedUnit.maxHp} hp · ${focusedUnit.atk} atk · ${focusedUnit.move} move`
        : `${allySide.hand.length} cards in hand · ${allySide.mana}/${allySide.maxMana} mana`;

  return (
    <section
      className="relative min-h-dvh overflow-hidden bg-[#070c14] lg:h-dvh"
      style={{ backgroundImage: `url('${backdrop}')`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,16,0.08),rgba(7,10,16,0.1)_20%,rgba(7,10,16,0.24)_52%,rgba(7,10,16,0.86)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,226,160,0.07),transparent_24%),radial-gradient(circle_at_50%_72%,rgba(73,128,255,0.08),transparent_30%)]" />

      <div className="relative min-h-dvh px-2 py-2 md:px-4 md:py-3 lg:h-full lg:px-6">
        <div className="mx-auto flex min-h-[calc(100dvh-1rem)] max-w-[1440px] flex-col gap-2 md:min-h-[calc(100dvh-1.5rem)] md:gap-2.5 lg:h-full lg:min-h-0">
          <header className="grid shrink-0 grid-cols-2 gap-2 lg:grid-cols-[11.5rem_minmax(0,1fr)_11.5rem] lg:items-start">
            <div className="order-1 col-span-2 rounded-[22px] bg-[linear-gradient(180deg,rgba(11,18,30,0.74),rgba(8,12,18,0.5))] px-3 py-2.5 shadow-[0_12px_22px_rgba(0,0,0,0.16)] backdrop-blur-lg lg:col-span-1 lg:px-3.5 lg:py-3">
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <BattlePhaseBanner round={tacticalState.round} activeSide={tacticalState.side} />
                  <div className="mt-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-[#f5d498]/66">Combat order</div>
                  <div className="mt-1 text-[13px] font-black text-white md:text-[15px]">{commandTitle}</div>
                  <div className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/58 md:max-w-[42rem]">{commandBody}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <UtilityBubble kind="cfg" compact />
                  <UtilityBubble label="AUTO" compact />
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <HeaderChip label="Focus" value={selectedPlay ? "Card" : focusedUnit ? "Unit" : "Board"} tone="neutral" compact />
                <HeaderChip label="Hint" value={commandHint} tone={tacticalState.side === "ally" ? "ally" : "enemy"} compact />
                <button
                  className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-white/68 shadow-[0_10px_18px_rgba(0,0,0,0.16)]"
                  onClick={() => clearSelections()}
                >
                  Clear focus
                </button>
              </div>
            </div>

            <LeaderPanel
              leader={allyLeader}
              portrait={getLeaderPortrait(allyLeaderId)}
              accent="ally"
              mana={allySide.mana}
              maxMana={allySide.maxMana}
              hp={allyCore?.hp ?? 0}
              maxHp={allyCore?.maxHp ?? 0}
              shield={allyCore?.buffs.shield ?? 0}
              alive={allyCore?.alive ?? false}
              className="order-2"
            />

            <LeaderPanel
              leader={enemyLeader}
              portrait={getLeaderPortrait(enemyLeaderId)}
              accent="enemy"
              mana={enemySide.mana}
              maxMana={enemySide.maxMana}
              hp={enemyCore?.hp ?? 0}
              maxHp={enemyCore?.maxHp ?? 0}
              shield={enemyCore?.buffs.shield ?? 0}
              alive={enemyCore?.alive ?? false}
              className="order-3"
            />
          </header>

          <div className="min-h-0 flex-1">
            <TacticalBoard
              state={tacticalState}
              setState={updateTacticalState}
              disabled={tacticalState.side !== "ally" || !!tacticalState.winner}
              externalAction={externalAction}
              immersive
              showEndTurnButton={false}
            />
          </div>

          <section className="rounded-[22px] bg-[linear-gradient(180deg,rgba(12,16,24,0.04),rgba(7,10,16,0.78))] p-2 shadow-[0_14px_24px_rgba(0,0,0,0.22)] backdrop-blur-md md:p-2.5">
            <div className="pointer-events-none absolute inset-x-[20%] bottom-[2.25rem] h-20 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(245,196,81,0.1),transparent_72%)] blur-3xl" />
            <div className="relative grid gap-2 md:grid-cols-[10rem_minmax(0,1fr)_10rem]">
              <div className="grid gap-1.5 sm:grid-cols-2 md:grid-cols-1">
                <ManaWellPanel mana={allySide.mana} maxMana={allySide.maxMana} />
                <LeaderPowerPanel
                  leader={allyLeader}
                  selected={selectedPlay?.type === "power"}
                  disabled={allySide.mana < allyLeader.power.cost || allySide.powerCooldown > 0 || tacticalState.side !== "ally" || !!tacticalState.winner}
                  cooldown={allySide.powerCooldown}
                  manaCost={allyLeader.power.cost}
                  onClick={() => {
                    sfx.tap();
                    clearBoardFocus();
                    setSelectedPlay((current) => (current?.type === "power" ? null : { type: "power" }));
                  }}
                />
              </div>

              <div className="min-w-0 rounded-[20px] bg-[linear-gradient(180deg,rgba(18,23,33,0.34),rgba(10,12,18,0.74))] p-2 shadow-[0_12px_20px_rgba(0,0,0,0.16)]">
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/42">War hand</div>
                    <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/68">
                      {tacticalState.side === "ally" ? "Playable cards and summons" : "Locked while enemy resolves"}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <HeaderChip label="Cards" value={`${allySide.hand.length}`} tone="neutral" compact />
                    <HeaderChip label="Mana" value={`${allySide.mana}/${allySide.maxMana}`} tone="ally" compact />
                  </div>
                </div>

                <div className="rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.06))] p-1.5">
                  <div className="flex items-end gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
                    {allySide.hand.map((cardId) => {
                      const card = getCard(cardId);
                      const selected = selectedPlay?.type === "card" && selectedPlay.cardId === card.id;
                      const playable = tacticalState.side === "ally" && playableIdSet.has(card.id);
                      const manaShort = Math.max(0, card.cost - allySide.mana);
                      const blockedLabel = tacticalState.side !== "ally" ? "Wait" : manaShort > 0 ? `Need ${manaShort}` : null;
                      return (
                        <button
                          key={card.id}
                          disabled={!playable}
                          aria-label={`${card.name}, cost ${card.cost}, ${card.kind}`}
                          data-hand-card={card.id}
                          data-card-kind={card.kind}
                          data-playable={playable ? "true" : "false"}
                          onClick={() => {
                            sfx.tap();
                            clearBoardFocus();
                            setSelectedPlay((current) =>
                              current?.type === "card" && current.cardId === card.id ? null : { type: "card", cardId: card.id },
                            );
                          }}
                          className="min-w-[7.2rem] text-left md:min-w-[8rem]"
                        >
                          <BattleHandCard cardId={card.id} selected={selected} playable={playable} blockedLabel={blockedLabel} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid gap-1.5 md:grid-rows-[auto_auto]">
                <BattleContextPanel
                  title={commandTitle}
                  body={commandBody}
                  hint={selectedPlay?.type === "power" ? "Glow = valid power target" : selectedCard?.kind === "hero" ? "Glow = valid summon cell" : selectedCard ? "Glow = valid spell target" : focusedUnit ? "Selected unit actions live under the board" : "Board and hand now share the same tactical rhythm"}
                />

                <button
                  className="rounded-[18px] border border-emerald-300/24 bg-[linear-gradient(180deg,rgba(34,115,88,0.96),rgba(10,24,18,0.98))] px-3 py-2 text-left shadow-[0_16px_26px_rgba(0,0,0,0.24)] backdrop-blur-xl disabled:opacity-40"
                  disabled={tacticalState.side !== "ally" || !!tacticalState.winner}
                  onClick={() => {
                    sfx.tap();
                    setSelectedPlay(null);
                    updateTacticalState((state) => endSideTurn(state));
                  }}
                >
                  <div className="text-[8px] font-black uppercase tracking-[0.18em] text-emerald-100/70">Flow</div>
                  <div className="mt-0.5 text-[12px] font-black uppercase tracking-[0.16em] text-white">End turn</div>
                  <div className="mt-1 text-[8px] leading-3.5 text-white/56">Resolve enemy actions and refresh the battlefield.</div>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
