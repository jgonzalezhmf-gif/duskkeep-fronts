import type { CSSProperties } from "react";
import { CombatIcon } from "@/components/game/frontline/FrontlineCombatIcon";
import type { FortressDefenseEnemy } from "@/features/fortress-defense/engine";
import { fortressDefenseSlot } from "@/features/fortress-defense/grid";
import { cn } from "@/lib/cn";
import {
  enemyBattlefieldPosition,
  findOrderFxTarget,
  slotCssPosition,
} from "./fortressDefenseBattlefieldLayout";
import type { DefenseVisualPhase, TurnVisualEvent } from "./fortressDefenseVisualEvents";

export function OrderFx({ event, phase, enemies }: { event: TurnVisualEvent; phase: DefenseVisualPhase; enemies: FortressDefenseEnemy[] }) {
  if (phase !== "resolvingOrder" || !event.actionId) return null;
  const target = findOrderFxTarget(event, enemies);
  const targetStyle = {
    "--fx-target-left": `${target?.position.mobileLeft ?? 70}%`,
    "--fx-target-left-sm": `${target?.position.desktopLeft ?? 70}%`,
    "--fx-target-top": `${target?.position.mobileTop ?? 48}%`,
    "--fx-target-top-sm": `${target?.position.desktopTop ?? 48}%`,
  } as CSSProperties;
  if (event.actionId === "castle_shot") {
    return (
      <div className="pointer-events-none absolute inset-0 z-[16]" style={targetStyle}>
        <div className="fortress-defense-bolt-fx absolute left-[10%] top-[57%] h-2 w-[66%] origin-left -rotate-[7deg] rounded-full bg-[linear-gradient(90deg,rgba(245,196,81,0),rgba(245,196,81,0.98),rgba(255,232,164,0.9))] shadow-[0_0_24px_rgba(245,196,81,0.42)]" />
        <div className="fortress-defense-impact-pop-fx absolute left-[var(--fx-target-left)] top-[var(--fx-target-top)] grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#f5c451]/56 bg-[#f5c451]/14 shadow-[0_0_42px_rgba(245,196,81,0.36)] sm:left-[var(--fx-target-left-sm)] sm:top-[var(--fx-target-top-sm)]">
          <CombatIcon name="attack" size="lg" className="h-11 w-11" />
        </div>
      </div>
    );
  }

  if (event.actionId === "blade_rush") {
    return (
      <div className="pointer-events-none absolute inset-0 z-[16]" style={targetStyle}>
        <div className="fortress-defense-slash-fx absolute left-[var(--fx-target-left)] top-[var(--fx-target-top)] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-[42%] border border-rose-100/46 bg-rose-400/12 shadow-[0_0_42px_rgba(240,95,114,0.34)] sm:left-[var(--fx-target-left-sm)] sm:top-[var(--fx-target-top-sm)]" />
      </div>
    );
  }

  if (event.actionId === "volley") {
    const volleyTargets = enemies.slice(0, 5).map((enemy, index) => ({ enemy, position: enemyBattlefieldPosition(enemy, index) }));
    return (
      <div className="pointer-events-none absolute inset-0 z-[16]">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="fortress-defense-arrow-fx absolute left-[8%] h-1.5 w-[72%] origin-left rounded-full bg-[linear-gradient(90deg,rgba(245,196,81,0),rgba(255,232,164,0.94),rgba(240,95,114,0.5))] shadow-[0_0_18px_rgba(245,196,81,0.32)]"
            style={{ top: `${34 + index * 7}%`, animationDelay: `${index * 70}ms` }}
          />
        ))}
        {volleyTargets.map(({ enemy, position }, index) => (
          <div
            key={`impact-${enemy.id}`}
            className="fortress-defense-impact-pop-fx absolute grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-rose-100/42 bg-rose-400/12 shadow-[0_0_34px_rgba(240,95,114,0.3)]"
            style={{ left: `${position.mobileLeft}%`, top: `${position.mobileTop}%`, animationDelay: `${index * 80 + 160}ms` }}
          />
        ))}
      </div>
    );
  }

  if (event.actionId === "arcane_barrage") {
    return <div className="fortress-defense-arcane-fx pointer-events-none absolute left-[62%] top-[47%] z-[16] h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-100/38 bg-violet-400/12" />;
  }

  if (event.actionId === "traps") {
    const slot = event.targetSlot ? fortressDefenseSlot(event.targetSlot.lane, event.targetSlot.range) : null;
    return (
      <div
        className="fortress-defense-trap-fx pointer-events-none absolute z-[16] h-12 w-12 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[14px] border border-violet-100/42 bg-violet-400/14 shadow-[0_0_34px_rgba(167,139,250,0.3)]"
        style={slot ? slotCssPosition(slot, { yOffset: 2 }) : { left: "50%", top: "56%" }}
      />
    );
  }

  if (event.actionId === "war_chant") {
    return <div className="fortress-defense-chant-fx pointer-events-none absolute left-[10%] top-[53%] z-[16] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-[42%] border border-[#f5c451]/34 bg-[#f5c451]/8" />;
  }

  return null;
}

export function EnemyAssaultFx({
  event,
  phase,
  enemies,
  activeEnemyActionId,
}: {
  event: TurnVisualEvent;
  phase: DefenseVisualPhase;
  enemies: FortressDefenseEnemy[];
  activeEnemyActionId: string | null;
}) {
  if (phase !== "enemyAttacking" && phase !== "castleHit") return null;
  if (event.attackingEnemyIds.length === 0) return null;
  const attacker = enemies.find((enemy) => enemy.id === activeEnemyActionId) ?? enemies.find((enemy) => event.attackingEnemyIds.includes(enemy.id));
  const rangedAttack = attacker ? attacker.range > 1 : false;
  return (
    <div className="pointer-events-none absolute inset-0 z-[16]">
      <div className={cn("fortress-defense-enemy-trail-fx absolute left-[10%] h-5 origin-right rounded-full bg-[linear-gradient(90deg,rgba(240,95,114,0),rgba(255,226,164,0.94),rgba(240,95,114,0.9))] shadow-[0_0_34px_rgba(240,95,114,0.46)]", rangedAttack ? "top-[48%] w-[68%] -rotate-[2deg]" : "top-[58%] w-[58%] -rotate-[4deg]")} />
      {[0, 1].map((index) => (
        <div
          key={index}
          className="fortress-defense-enemy-slash-fx absolute left-[10%] h-2.5 w-[54%] origin-right rounded-full bg-[linear-gradient(90deg,rgba(240,95,114,0),rgba(255,245,211,0.96),rgba(240,95,114,0.88))] shadow-[0_0_28px_rgba(255,170,116,0.42)]"
          style={{ "--slash-rotate": `${index === 0 ? -9 : 5}deg`, top: `${52 + index * 7}%`, animationDelay: `${index * 90}ms` } as CSSProperties}
        />
      ))}
      <div className="fortress-defense-gate-flash-fx absolute left-[10%] top-[54%] h-28 w-24 -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-rose-100/52 bg-rose-400/22 shadow-[0_0_58px_rgba(240,95,114,0.48)]" />
    </div>
  );
}
