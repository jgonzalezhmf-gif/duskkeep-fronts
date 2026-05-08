"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import GameGlyph from "@/components/ui/GameGlyph";
import { sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";
import {
  ActionButton,
  BoardSideFlag,
  FloatingText,
  LegendPill,
  StatusPill,
  TileHighlight,
  UnitStandee,
  type TacticalFloaterKind,
  type TacticalHighlightKind,
} from "@/components/game/tactical/TacticalBoardPrimitives";
import {
  endSideTurn,
  endUnitTurn,
  getAbilityTiles,
  getAttackTargets,
  getReachable,
  performAbility,
  performAttack,
  performMove,
  selectUnit,
  setMode,
  unit,
  unitAt,
} from "@/features/tactical/engine";
import type { Pos, TacticalState } from "@/features/tactical/types";
import { posKey } from "@/features/tactical/types";

type Props = {
  state: TacticalState;
  setState: (next: TacticalState) => void;
  disabled?: boolean;
  immersive?: boolean;
  showEndTurnButton?: boolean;
  externalAction?: {
    tiles: Pos[];
    kind: "summon" | "spell" | "power";
    onTileClick: (pos: Pos) => void;
  } | null;
};

type FloaterEntry = {
  id: string;
  tileKey: string;
  text: string;
  label?: string;
  kind: TacticalFloaterKind;
};

export default function TacticalBoard({
  state,
  setState,
  disabled,
  immersive,
  showEndTurnButton = true,
  externalAction,
}: Props) {
  const selected = unit(state, state.selectedUid);
  const [floaters, setFloaters] = useState<FloaterEntry[]>([]);
  const lastFlashT = useRef<number | undefined>(state.flash?.t);

  const obstacleSet = useMemo(() => new Set(state.obstacles.map((obstacle) => posKey(obstacle))), [state.obstacles]);

  const cells = useMemo(
    () =>
      Array.from({ length: state.grid.w * state.grid.h }).map((_, index) => ({
        x: index % state.grid.w,
        y: Math.floor(index / state.grid.w),
      })),
    [state.grid.h, state.grid.w],
  );

  useEffect(() => {
    const flash = state.flash;
    if (!flash || flash.t === lastFlashT.current) return;
    lastFlashT.current = flash.t;
    const flashedUnit = unit(state, flash.uid);
    if (!flashedUnit) return;
    const id = `${flash.uid}-${flash.t}`;
    const text =
      flash.kind === "heal"
        ? `+${flash.amount ?? 0}`
        : flash.kind === "shield"
          ? `+${flash.amount ?? 0}`
          : flash.kind === "buff"
            ? `+${flash.amount ?? 0}%`
            : flash.kind === "summon"
              ? (flash.label ?? "Deploy")
              : flash.kind === "death"
                ? "KO"
                : `-${flash.amount ?? 0}`;
    const label = flash.kind === "death" && flash.amount ? `-${flash.amount}` : flash.kind === "summon" ? undefined : flash.label;
    setFloaters((current) => [
      ...current,
      { id, tileKey: posKey(flashedUnit.pos), text, label, kind: flash.kind },
    ]);
    const timeout = setTimeout(() => {
      setFloaters((current) => current.filter((item) => item.id !== id));
    }, 920);
    return () => clearTimeout(timeout);
  }, [state, state.flash]);

  const highlights = useMemo(() => {
    const move = new Set<string>();
    const attack = new Set<string>();
    const ability = new Set<string>();
    const external = new Set<string>();

    if (externalAction) {
      for (const tile of externalAction.tiles) external.add(posKey(tile));
    }

    if (!selected || disabled) return { move, attack, ability, external };

    if (state.mode === "move" && !selected.hasMoved) {
      for (const tile of getReachable(state, selected.uid)) move.add(posKey(tile));
    }
    if (state.mode === "attack" && !selected.hasActed) {
      for (const target of getAttackTargets(state, selected.uid)) attack.add(posKey(target.pos));
    }
    if (state.mode === "ability" && selected.cooldown === 0 && !selected.hasActed) {
      for (const tile of getAbilityTiles(state, selected.uid)) ability.add(posKey(tile));
    }

    return { move, attack, ability, external };
  }, [disabled, externalAction, selected, state]);

  function onTileClick(pos: Pos) {
    if (disabled || state.winner) return;
    const key = posKey(pos);
    if (obstacleSet.has(key)) return;

    if (externalAction && highlights.external.has(key)) {
      externalAction.onTileClick(pos);
      return;
    }

    const target = unitAt(state, pos);

    if (!selected) {
      if (target && target.side === "ally" && target.alive) {
        sfx.tap();
        setState(selectUnit(state, target.uid, "move"));
      }
      return;
    }

    if (target && target.uid === selected.uid) {
      sfx.tap();
      setState(setMode(state, cycleMode(state.mode)));
      return;
    }

    if (target && target.side === "ally" && target.alive) {
      sfx.tap();
      setState(selectUnit(state, target.uid, "move"));
      return;
    }

    if (state.mode === "move" && highlights.move.has(key)) {
      sfx.move();
      setState(performMove(state, selected.uid, pos));
      return;
    }

    if (state.mode === "attack" && target && target.side !== selected.side && target.alive && highlights.attack.has(key)) {
      sfx.attack();
      setState(performAttack(state, selected.uid, target.uid));
      return;
    }

    if (state.mode === "ability" && highlights.ability.has(key)) {
      sfx.ability();
      setState(performAbility(state, selected.uid, pos));
    }
  }

  const footerCopy = externalAction
    ? externalAction.kind === "summon"
      ? "Deploy a champion into a lit war cell. Battlecries trigger on entry."
      : externalAction.kind === "spell"
        ? "Choose the target cell for your spell."
        : "Aim the leader power on a valid battlefield target."
    : selected
      ? `${selected.name} is active. Move first, then strike or use the skill.`
      : state.side === "ally"
        ? "Select a unit on the board or pick a card from the hand."
        : "Enemy phase in progress. Watch the board resolve.";

  const footerHint = selected
    ? selected.buffs.stun > 0
      ? "This unit is stunned and cannot act this turn."
      : selected.hasActed
        ? "The unit has already acted. You can only inspect it or end the side turn."
        : selected.role === "leader"
          ? "Leader cores stay anchored; use them for power timing and lane control."
          : "Valid actions illuminate directly on the board."
    : "Runes mark valid actions: emerald to move, crimson to strike, violet to cast, gold for power.";

  return (
    <section className={cn("relative h-full w-full", immersive ? "" : "rounded-[34px] bg-[#0a111b]/24 p-2 shadow-[0_22px_44px_rgba(0,0,0,0.28)]")}>
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,rgba(10,12,18,0.08),rgba(7,10,16,0.56))] shadow-[0_22px_36px_rgba(0,0,0,0.18)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,229,165,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.16)_44%,rgba(0,0,0,0.4)_100%)]" />
        <div className="pointer-events-none absolute inset-x-[6%] top-[8%] h-[24%] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,206,125,0.12),transparent_72%)] blur-3xl" />
        <div className="pointer-events-none absolute inset-y-[18%] left-[5%] w-[18%] rounded-full bg-[linear-gradient(90deg,rgba(103,193,255,0.11),transparent)] blur-2xl" />
        <div className="pointer-events-none absolute inset-y-[18%] right-[5%] w-[18%] rounded-full bg-[linear-gradient(270deg,rgba(255,120,120,0.11),transparent)] blur-2xl" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-1.5 p-2 md:gap-2 md:p-2.5">
          <div className="relative min-h-[15.5rem] flex-[1.9] overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,rgba(89,65,46,0.14),rgba(43,30,25,0.26)_18%,rgba(14,14,16,0.78)_58%,rgba(8,10,16,0.9))] shadow-[inset_0_1px_0_rgba(255,243,214,0.06),inset_0_-14px_26px_rgba(0,0,0,0.2),0_16px_28px_rgba(0,0,0,0.16)] md:min-h-[19.5rem] lg:min-h-[24rem]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,232,185,0.08),transparent_24%),linear-gradient(180deg,rgba(255,247,221,0.04),rgba(29,19,15,0.06)_30%,rgba(8,10,16,0.16)_100%)]" />
            <div className="pointer-events-none absolute inset-[2%] rounded-[30px] bg-[linear-gradient(180deg,rgba(84,61,44,0.16),rgba(42,31,27,0.38)_22%,rgba(17,14,18,0.88)_100%)] shadow-[inset_0_1px_0_rgba(255,241,209,0.04),inset_0_-12px_18px_rgba(0,0,0,0.18)]" />
            <div className="pointer-events-none absolute inset-x-[4%] top-[7%] h-px bg-[linear-gradient(90deg,transparent,rgba(247,214,164,0.18),transparent)]" />
            <div className="pointer-events-none absolute inset-x-[5%] bottom-[10%] h-px bg-[linear-gradient(90deg,transparent,rgba(0,0,0,0.44),transparent)]" />
            <div className="pointer-events-none absolute inset-y-[18%] left-[8%] w-[28%] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(100,192,255,0.1),transparent_72%)] blur-3xl" />
            <div className="pointer-events-none absolute inset-y-[18%] right-[8%] w-[28%] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,112,130,0.1),transparent_72%)] blur-3xl" />
            <div className="pointer-events-none absolute inset-[5%] rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0)_28%,rgba(0,0,0,0.08)_100%)]" />
            <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
              <BoardSideFlag tone="ally" label="Ally" compact />
              <BoardSideFlag tone="enemy" label="Enemy" compact />
            </div>
            <div className="pointer-events-none absolute right-3 top-3 flex flex-wrap items-center justify-end gap-1.5">
              <StatusPill label="R" value={`${state.round}`} tone="neutral" compact />
              <StatusPill label="P" value={state.side === "ally" ? "Player" : "Enemy"} tone={state.side} compact />
            </div>

            <div className="absolute inset-[clamp(0.45rem,1.1vw,0.8rem)] grid gap-[clamp(0.22rem,0.5vw,0.48rem)]"
              style={{
                gridTemplateColumns: `repeat(${state.grid.w}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${state.grid.h}, minmax(0, 1fr))`,
              }}
            >
              {cells.map((pos) => {
                const key = posKey(pos);
                const tileUnit = unitAt(state, pos);
                const isObstacle = obstacleSet.has(key);
                const isSelectedTile = !!tileUnit && selected?.uid === tileUnit.uid;
                const highlightKind: TacticalHighlightKind = highlights.move.has(key)
                  ? "move"
                  : highlights.attack.has(key)
                    ? "attack"
                    : highlights.ability.has(key)
                      ? "ability"
                      : highlights.external.has(key)
                        ? (externalAction?.kind ?? "power")
                        : null;
                const floatersForTile = floaters.filter((item) => item.tileKey === key);
                const sideZone = pos.x < state.grid.w / 2 ? "ally" : "enemy";

                return (
                  <button
                    key={key}
                    onClick={() => onTileClick(pos)}
                    className="group relative isolate min-h-0 overflow-visible rounded-[22px] text-left transition active:scale-[0.99]"
                    aria-label={tileUnit ? `${tileUnit.side} ${tileUnit.name} tile ${pos.x + 1}-${pos.y + 1}` : `tile ${pos.x + 1}-${pos.y + 1}`}
                    data-board-tile={`${pos.x},${pos.y}`}
                    data-highlight-kind={highlightKind ?? "none"}
                    data-occupied={tileUnit ? "true" : "false"}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 rounded-[22px] shadow-[inset_0_1px_0_rgba(255,241,210,0.05),inset_0_-10px_16px_rgba(0,0,0,0.26),0_4px_10px_rgba(0,0,0,0.1)] transition",
                        sideZone === "ally"
                          ? "bg-[radial-gradient(circle_at_50%_0%,rgba(130,198,255,0.08),transparent_24%),linear-gradient(180deg,rgba(86,73,61,0.16),rgba(45,34,30,0.34)_26%,rgba(18,14,16,0.86))]"
                          : "bg-[radial-gradient(circle_at_50%_0%,rgba(255,146,146,0.08),transparent_24%),linear-gradient(180deg,rgba(86,63,61,0.16),rgba(45,31,31,0.34)_26%,rgba(18,14,16,0.86))]",
                        !tileUnit && "group-hover:brightness-[1.04]",
                        isSelectedTile && "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(245,196,81,0.18),0_18px_32px_rgba(0,0,0,0.26)]",
                      )}
                    />
                    <div
                      className={cn(
                        "pointer-events-none absolute inset-[6.5%] rounded-[18px] shadow-[inset_0_1px_0_rgba(255,243,214,0.06),inset_0_-8px_14px_rgba(0,0,0,0.24)] transition",
                        sideZone === "ally"
                          ? "bg-[linear-gradient(180deg,rgba(31,38,51,0.46),rgba(18,16,18,0.82))]"
                          : "bg-[linear-gradient(180deg,rgba(43,33,37,0.46),rgba(18,16,18,0.82))]",
                        isSelectedTile && "ring-1 ring-[#f5c451]/28",
                      )}
                    />
                    <div className="pointer-events-none absolute inset-x-[23%] top-[11%] h-px bg-[linear-gradient(90deg,transparent,rgba(245,214,164,0.12),transparent)]" />
                    <div className="pointer-events-none absolute inset-x-[20%] bottom-[10%] h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)]" />
                    <div className="pointer-events-none absolute left-[15%] top-[16%] h-2 w-2 rounded-full border border-[#f0d7a9]/10 bg-[#f0d7a9]/3" />
                    <div className="pointer-events-none absolute right-[15%] top-[16%] h-2 w-2 rounded-full border border-[#f0d7a9]/10 bg-[#f0d7a9]/3" />
                    <div className="pointer-events-none absolute inset-x-[18%] bottom-[8%] h-[12%] rounded-full bg-black/18 blur-md" />
                    {highlightKind ? <TileHighlight kind={highlightKind} /> : null}
                    {isObstacle ? (
                      <div className="absolute inset-[16%] grid place-items-center rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,22,32,0.82),rgba(10,12,18,0.98))] shadow-[0_16px_24px_rgba(0,0,0,0.24)]">
                        <div className="absolute inset-x-[18%] top-[12%] h-[20%] rounded-full bg-white/8 blur-sm" />
                        <div className="grid h-12 w-12 place-items-center rounded-[18px] border border-white/10 bg-white/6 p-2 text-white/74">
                          <GameGlyph kind="fortress" shell="none" />
                        </div>
                      </div>
                    ) : null}
                    {floatersForTile.map((floater) => (
                      <FloatingText key={floater.id} text={floater.text} label={floater.label} kind={floater.kind} />
                    ))}
                    {tileUnit ? (
                      <UnitStandee
                        unit={tileUnit}
                        selected={isSelectedTile}
                        active={tileUnit.side === state.side && !tileUnit.hasActed && tileUnit.buffs.stun === 0}
                      />
                    ) : null}
                    <div className="pointer-events-none absolute bottom-[6%] left-[10%] text-[8px] font-black uppercase tracking-[0.18em] text-[#e7d2a2]/26">
                      {pos.x + 1}-{pos.y + 1}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[18px] bg-[linear-gradient(180deg,rgba(12,16,24,0.28),rgba(8,10,16,0.82))] px-3 py-2 shadow-[0_12px_22px_rgba(0,0,0,0.18)] backdrop-blur-lg">
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#f5d498]/72">Battlefield</span>
                  <span className="truncate text-[11px] font-black text-white/88 md:text-[12px]">{footerCopy}</span>
                </div>
                <div className="mt-0.5 truncate text-[9px] text-white/50">{footerHint}</div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <LegendPill kind="move" label="Move" />
                <LegendPill kind="attack" label="Attack" />
                <LegendPill kind="ability" label="Skill" />
              </div>
            </div>

            {selected ? (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex items-center gap-2">
                  <div className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-white/76">{selected.name}</div>
                  <div className="rounded-full border border-white/10 bg-white/6 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.18em] text-white/58">
                    {selected.role}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <ActionButton
                    kind="move"
                    label="Move"
                    active={state.mode === "move"}
                    disabled={disabled || selected.hasMoved || selected.buffs.stun > 0}
                    onClick={() => setState(setMode(state, "move"))}
                  />
                  <ActionButton
                    kind="attack"
                    label="Attack"
                    active={state.mode === "attack"}
                    disabled={disabled || selected.hasActed || selected.buffs.stun > 0}
                    onClick={() => setState(setMode(state, "attack"))}
                  />
                  <ActionButton
                    kind="skill"
                    label={selected.ability.name}
                    active={state.mode === "ability"}
                    disabled={disabled || selected.hasActed || selected.cooldown > 0 || selected.buffs.stun > 0}
                    onClick={() => setState(setMode(state, "ability"))}
                  />
                  <ActionButton
                    kind="power"
                    label="Done"
                    disabled={disabled || state.side !== "ally"}
                    onClick={() => setState(endUnitTurn(state, selected.uid))}
                  />
                </div>
              </div>
            ) : null}

            {showEndTurnButton ? (
              <button
                className="mt-2 inline-flex min-w-[9rem] items-center justify-center gap-2 rounded-[16px] border border-emerald-300/26 bg-[linear-gradient(180deg,rgba(30,104,81,0.94),rgba(10,24,18,0.98))] px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-white shadow-[0_16px_26px_rgba(0,0,0,0.24)] transition hover:border-emerald-200/34 hover:brightness-[1.04] disabled:opacity-40"
                disabled={!!disabled || state.side !== "ally" || !!state.winner}
                onClick={() => setState(endSideTurn(state))}
              >
                <span className="h-4 w-4">
                  <GameGlyph kind="power" shell="none" />
                </span>
                End turn
              </button>
            ) : null}
          </div>
        </div>

        {state.winner ? (
          <div className="absolute inset-0 z-20 grid place-items-center bg-black/28 backdrop-blur-[2px]">
            <div
              className={cn(
                "rounded-[30px] border px-8 py-5 text-center shadow-[0_24px_56px_rgba(0,0,0,0.42)]",
                state.winner === "ally" && "border-emerald-300/44 bg-emerald-400/14",
                state.winner === "enemy" && "border-rose-300/44 bg-rose-400/14",
                state.winner === "draw" && "border-white/16 bg-white/8",
              )}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/56">Battle end</div>
              <div className="mt-2 text-3xl font-black text-white">
                {state.winner === "ally" ? "Victory" : state.winner === "enemy" ? "Defeat" : "Draw"}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function cycleMode(mode: TacticalState["mode"]): TacticalState["mode"] {
  if (mode === "move") return "attack";
  if (mode === "attack") return "ability";
  return "move";
}
