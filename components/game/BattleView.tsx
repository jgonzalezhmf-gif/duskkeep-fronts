"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { BattleEvent, BattleResult, Unit } from "@/features/battle/types";
import { simulateBattle } from "@/features/battle/engine";
import type { BattleInput } from "@/features/battle/types";

type UiState = {
  units: Record<string, Unit>;
  log: string[];
  lastHit?: { uid: string; crit: boolean };
  lastHeal?: string;
};

type Props = {
  input: BattleInput;
  onFinished: (result: BattleResult) => void;
  auto?: boolean;
  stepMs?: number;
};

export default function BattleView({ input, onFinished, auto = true, stepMs = 550 }: Props) {
  // Memo key on seed + serialized teams so rerenders don't resimulate.
  const key = useMemo(
    () => JSON.stringify({ s: input.seed, a: input.allies, e: input.enemies }),
    [input.seed, input.allies, input.enemies],
  );
  const result = useMemo(() => simulateBattle(input), [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const [idx, setIdx] = useState(0);
  const [ui, setUi] = useState<UiState>(() => buildInitialUi(result));
  const [speed, setSpeed] = useState(1);
  const finishedRef = useRef(false);

  useEffect(() => {
    // reset when a new battle comes in
    setIdx(0);
    setUi(buildInitialUi(result));
    finishedRef.current = false;
  }, [result]);

  useEffect(() => {
    if (!auto) return;
    if (idx >= result.events.length) return;
    const id = setTimeout(() => setIdx((i) => i + 1), Math.max(80, stepMs / speed));
    return () => clearTimeout(id);
  }, [idx, auto, stepMs, speed, result.events.length]);

  useEffect(() => {
    setUi(applyUpTo(result, idx));
    if (!finishedRef.current && idx >= result.events.length) {
      finishedRef.current = true;
      onFinished(result);
    }
  }, [idx, result, onFinished]);

  const allies = useMemo(() => Object.values(ui.units).filter((u) => u.side === "ally"), [ui.units]);
  const enemies = useMemo(() => Object.values(ui.units).filter((u) => u.side === "enemy"), [ui.units]);

  const endEvent = result.events[result.events.length - 1];
  const finalTurns = endEvent?.type === "battle_end" ? endEvent.turns : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          Event {Math.min(idx, result.events.length)}/{result.events.length}
          {finalTurns ? ` · ${finalTurns} turns` : ""}
        </span>
        <div className="flex gap-1">
          {[1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={cn(
                "px-2 py-0.5 rounded text-xs",
                speed === s ? "bg-accent text-black" : "bg-panel2",
              )}
            >
              {s}x
            </button>
          ))}
          <button
            onClick={() => setIdx(result.events.length)}
            className="px-2 py-0.5 rounded text-xs bg-panel2"
            title="Skip"
          >
            ⏭
          </button>
        </div>
      </div>

      <TeamRow team={enemies} lastHit={ui.lastHit} lastHeal={ui.lastHeal} />
      <div className="h-px bg-white/5" />
      <TeamRow team={allies} lastHit={ui.lastHit} lastHeal={ui.lastHeal} />

      <div className="card p-2 max-h-40 overflow-y-auto text-xs font-mono">
        {ui.log.slice(-30).map((line, i) => (
          <div key={i} className="leading-5">{line}</div>
        ))}
      </div>
    </div>
  );
}

function TeamRow({
  team,
  lastHit,
  lastHeal,
}: {
  team: Unit[];
  lastHit?: UiState["lastHit"];
  lastHeal?: string;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {team.map((u) => (
        <UnitCard
          key={u.uid}
          unit={u}
          hit={lastHit?.uid === u.uid ? lastHit : undefined}
          healed={lastHeal === u.uid}
        />
      ))}
      {Array.from({ length: Math.max(0, 4 - team.length) }).map((_, i) => (
        <div key={`pad_${i}`} />
      ))}
    </div>
  );
}

function UnitCard({ unit, hit, healed }: { unit: Unit; hit?: { crit: boolean }; healed?: boolean }) {
  const pct = Math.max(0, Math.min(1, unit.hp / unit.maxHp));
  const dead = unit.hp <= 0;
  return (
    <div
      className={cn(
        "card p-1.5 flex flex-col items-center gap-1 relative transition",
        dead && "opacity-30 grayscale",
        hit && "ring-2 ring-danger",
        healed && "ring-2 ring-success",
      )}
    >
      <div className="text-2xl">{unit.hero.emoji}</div>
      <div className="text-[10px] font-semibold leading-none truncate max-w-full">
        {unit.hero.name.split(" ")[0]}
      </div>
      <div className="w-full hpbar h-1.5 rounded-full overflow-hidden">
        <div
          className={cn("h-full", pct > 0.5 ? "bg-success" : pct > 0.25 ? "bg-accent" : "bg-danger")}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <div className="flex items-center gap-1 text-[9px] text-muted">
        <span>{unit.hp}</span>
        {unit.shield > 0 && <span className="text-accent2">🛡{unit.shield}</span>}
        {unit.stun > 0 && <span className="text-danger">💫</span>}
        {unit.cooldown > 0 && <span>CD{unit.cooldown}</span>}
      </div>
    </div>
  );
}

function buildInitialUi(result: BattleResult): UiState {
  const start = result.events.find((e) => e.type === "battle_start") as Extract<
    BattleEvent,
    { type: "battle_start" }
  >;
  const units: Record<string, Unit> = {};
  [...start.allies, ...start.enemies].forEach((u) => (units[u.uid] = clone(u)));
  return { units, log: [] };
}

function applyUpTo(result: BattleResult, idx: number): UiState {
  const ui = buildInitialUi(result);
  for (let i = 0; i < idx && i < result.events.length; i++) {
    applyEvent(ui, result.events[i]);
  }
  return ui;
}

function applyEvent(ui: UiState, ev: BattleEvent) {
  switch (ev.type) {
    case "battle_start":
      ui.log.push("Battle start.");
      break;
    case "basic_attack":
      ui.log.push(`${nameOf(ui, ev.from)} strikes ${nameOf(ui, ev.to)}${ev.crit ? " (CRIT)" : ""}.`);
      break;
    case "ability":
      ui.log.push(`${nameOf(ui, ev.from)} uses ${ev.ability.name}.`);
      break;
    case "damage": {
      const target = ui.units[ev.to];
      if (target) {
        if (target.shield > 0) {
          const absorbed = Math.min(target.shield, ev.damage);
          target.shield -= absorbed;
        }
        target.hp = Math.max(0, target.hp - ev.damage);
      }
      ui.lastHit = { uid: ev.to, crit: ev.crit };
      ui.log.push(`→ ${ev.damage} ${ev.damageType}${ev.crit ? " (CRIT)" : ""} to ${nameOf(ui, ev.to)}`);
      break;
    }
    case "heal": {
      const target = ui.units[ev.to];
      if (target) target.hp = Math.min(target.maxHp, target.hp + ev.amount);
      ui.lastHeal = ev.to;
      ui.log.push(`+${ev.amount} HP → ${nameOf(ui, ev.to)}`);
      break;
    }
    case "shield_applied": {
      const t = ui.units[ev.on];
      if (t) t.shield = Math.max(t.shield, ev.amount);
      ui.log.push(`Shield ${ev.amount} on ${nameOf(ui, ev.on)}`);
      break;
    }
    case "buff": {
      const t = ui.units[ev.on];
      if (t) {
        if (ev.kind === "atk") {
          t.atkBuffPct = Math.max(t.atkBuffPct, ev.pct);
          t.atkBuffTurns = Math.max(t.atkBuffTurns, ev.turns);
        } else {
          t.defBuffPct = Math.max(t.defBuffPct, ev.pct);
          t.defBuffTurns = Math.max(t.defBuffTurns, ev.turns);
        }
      }
      ui.log.push(`${ev.kind.toUpperCase()} +${Math.round(ev.pct * 100)}% on ${nameOf(ui, ev.on)}`);
      break;
    }
    case "stun_applied": {
      const t = ui.units[ev.on];
      if (t) t.stun = ev.turns;
      ui.log.push(`Stunned ${nameOf(ui, ev.on)}`);
      break;
    }
    case "death": {
      const t = ui.units[ev.uid];
      if (t) t.hp = 0;
      ui.log.push(`${nameOf(ui, ev.uid)} falls.`);
      break;
    }
    case "battle_end":
      ui.log.push(
        `Battle ends — ${ev.winner === "ally" ? "Victory!" : ev.winner === "enemy" ? "Defeat." : "Draw."}`,
      );
      break;
    default:
      break;
  }
}

function nameOf(ui: UiState, uid: string) {
  return ui.units[uid]?.hero.name ?? uid;
}

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}
