"use client";

import { useEffect, useRef, useState } from "react";
import { initTD, stepTD, type TDState } from "@/features/td/engine";
import type { TDEventDef } from "@/data/towerDefense";
import { sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";
import Button from "@/components/ui/Button";

type TeamEntry = { heroId: string; level: number; stars: number };

type Props = {
  def: TDEventDef;
  allies: TeamEntry[];
  onFinished: (won: boolean, waves: number) => void;
};

const TICK_MS = 550;

export default function TowerDefenseRun({ def, allies, onFinished }: Props) {
  const [state, setState] = useState<TDState>(() => initTD(def, allies));
  const [running, setRunning] = useState(true);
  const finishedRef = useRef(false);
  const finishedCbRef = useRef(onFinished);
  useEffect(() => {
    finishedCbRef.current = onFinished;
  });

  useEffect(() => {
    if (!running || state.phase === "won" || state.phase === "lost") return;
    const id = setTimeout(() => {
      setState((s) => stepTD(s));
    }, TICK_MS);
    return () => clearTimeout(id);
  }, [state, running]);

  useEffect(() => {
    if (finishedRef.current) return;
    if (state.phase === "won") {
      finishedRef.current = true;
      sfx.victory();
      setTimeout(() => finishedCbRef.current(true, state.def.waves.length), 900);
    } else if (state.phase === "lost") {
      finishedRef.current = true;
      sfx.defeat();
      setTimeout(() => finishedCbRef.current(false, state.waveIdx), 900);
    }
  }, [state.phase, state.waveIdx, state.def.waves.length]);

  const castlePct = state.castleHp / state.maxCastleHp;
  const enemyAlive = state.units.filter((u) => u.isEnemy && u.hp > 0).length;

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-white/10 bg-panel/80 p-3">
        <div className="flex items-center justify-between text-xs">
          <div className="font-bold">
            🏯 {def.name} — Wave {Math.min(state.waveIdx + 1, def.waves.length)}/
            {def.waves.length}
          </div>
          <div
            className={cn(
              "text-[10px] uppercase tracking-widest font-bold",
              state.phase === "prep" && "text-accent",
              state.phase === "wave" && "text-danger",
              state.phase === "won" && "text-success",
              state.phase === "lost" && "text-danger",
            )}
          >
            {state.phase}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] text-muted">Castle</span>
          <div className="flex-1 hpbar h-2 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                castlePct > 0.5 ? "bg-success" : castlePct > 0.25 ? "bg-accent" : "bg-danger",
              )}
              style={{ width: `${castlePct * 100}%` }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-muted">
            {state.castleHp}/{state.maxCastleHp}
          </span>
        </div>
        <div className="mt-1 text-[10px] text-muted">
          Enemies on field: {enemyAlive} · Tick {state.tick}
        </div>
      </div>

      {/* Lanes */}
      <div className="rounded-xl overflow-hidden border border-white/10 scene-ashen p-2">
        <div className="flex flex-col gap-1">
          {Array.from({ length: def.lanes }).map((_, laneIdx) => (
            <Lane
              key={laneIdx}
              state={state}
              laneIdx={laneIdx}
              length={def.laneLength}
            />
          ))}
        </div>
      </div>

      {/* Log */}
      <div className="rounded-md bg-panel/70 border border-white/5 p-2 max-h-24 overflow-y-auto text-[10px] font-mono text-muted space-y-0.5">
        {state.log.slice(-6).map((l, i) => (
          <div key={state.tick * 100 + i}>{l}</div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Resume"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setState((s) => stepTD(s))}
          disabled={running}
        >
          Step
        </Button>
      </div>
    </div>
  );
}

function Lane({
  state,
  laneIdx,
  length,
}: {
  state: TDState;
  laneIdx: number;
  length: number;
}) {
  const cells = Array.from({ length: length + 1 }); // +1 for the wall at col 0
  return (
    <div className="relative grid" style={{ gridTemplateColumns: `repeat(${length + 1}, 1fr)` }}>
      {cells.map((_, col) => (
        <div
          key={col}
          className={cn(
            "aspect-square border border-white/5 m-0.5 rounded-md relative overflow-hidden",
            col === 0
              ? "bg-gradient-to-br from-accent/25 to-amber-700/20 border-accent/40"
              : "bg-black/40",
          )}
        >
          {col === 0 && (
            <div className="absolute inset-0 grid place-items-center text-xs opacity-60">
              🧱
            </div>
          )}
        </div>
      ))}
      {/* units overlayed */}
      {state.units
        .filter((u) => u.lane === laneIdx && u.hp > 0)
        .map((u) => {
          const cellCol = u.isEnemy ? u.col + 1 : 0;
          const pct = u.hp / u.maxHp;
          return (
            <div
              key={u.uid}
              className="absolute top-1/2 -translate-y-1/2 w-[12%] aspect-square pointer-events-none"
              style={{
                left: `calc(${(cellCol * 100) / (length + 1)}% + 2%)`,
                transition: "left 400ms ease-in-out",
              }}
            >
              <div
                className={cn(
                  "relative w-full h-full rounded-md grid place-items-center text-[18px] shadow-lg",
                  u.isEnemy ? "bg-danger/20 border border-danger/40" : "bg-accent/20 border border-accent/50",
                )}
              >
                <span className="drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">{u.hero.emoji}</span>
              </div>
              <div className="absolute -bottom-1 left-0 right-0 h-[3px] bg-black/60 rounded-full overflow-hidden">
                <div
                  className={cn("h-full", u.isEnemy ? "bg-danger" : "bg-success")}
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}
