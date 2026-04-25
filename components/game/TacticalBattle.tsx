"use client";

// Wrapper that owns the tactical state: inits, runs enemy AI, reports result.

import { useEffect, useMemo, useRef, useState } from "react";
import TacticalBoard from "./TacticalBoard";
import { initTactical } from "@/features/tactical/engine";
import { runEnemySide } from "@/features/tactical/ai";
import { sfx } from "@/lib/audio";
import type { TacticalInit, TacticalState } from "@/features/tactical/types";

type TeamEntry = { heroId: string; level: number; stars: number; skillLevel?: number };
type Pos = { x: number; y: number };

export type TacticalResult = {
  winner: "ally" | "enemy" | "draw";
  rounds: number;
  seed: number;
};

type Props = {
  allies: TeamEntry[];
  enemies: TeamEntry[];
  seed: number;
  obstacles?: Pos[];
  initialState?: TacticalState | null;
  onTick?: (s: TacticalState) => void;
  onFinished: (r: TacticalResult) => void;
};

export default function TacticalBattle({
  allies,
  enemies,
  seed,
  obstacles,
  initialState,
  onTick,
  onFinished,
}: Props) {
  const init: TacticalInit = useMemo(
    () => ({ allies, enemies, seed, obstacles }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify({ allies, enemies, seed, obstacles })],
  );

  const [state, setState] = useState<TacticalState>(() =>
    initialState ?? initTactical(init),
  );
  const finishedRef = useRef(false);

  useEffect(() => {
    setState(initialState ?? initTactical(init));
    finishedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [init]);

  const onTickRef = useRef(onTick);
  useEffect(() => {
    onTickRef.current = onTick;
  });

  useEffect(() => {
    onTickRef.current?.(state);
  }, [state]);

  // Enemy side plays faster now — 280ms feels snappier than 500ms.
  useEffect(() => {
    if (state.winner) return;
    if (state.side !== "enemy") return;
    const id = setTimeout(() => {
      setState((s) => (s.side === "enemy" && !s.winner ? runEnemySide(s) : s));
    }, 280);
    return () => clearTimeout(id);
  }, [state.side, state.winner, state.round]);

  const onFinishedRef = useRef(onFinished);
  useEffect(() => {
    onFinishedRef.current = onFinished;
  });

  useEffect(() => {
    if (!state.winner) return;
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (state.winner === "ally") sfx.victory();
    else if (state.winner === "enemy") sfx.defeat();
    const id = setTimeout(() => {
      onFinishedRef.current({ winner: state.winner!, rounds: state.round, seed: state.seed });
    }, 1100);
    return () => clearTimeout(id);
  }, [state.winner, state.round, state.seed]);

  const disabled = state.side !== "ally" || !!state.winner;

  return (
    <div className="space-y-2">
      <TacticalBoard state={state} setState={setState} disabled={disabled} />
    </div>
  );
}
