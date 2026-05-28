import type { CSSProperties } from "react";
import { CombatIcon } from "@/components/game/frontline/FrontlineCombatIcon";
import { VisualAssetImage } from "@/components/game/frontline/FrontlineVisualAssetImage";
import {
  getFrontlineHeroVisualAsset,
  getFrontlineUnitPlaceholderSrc,
} from "@/components/game/frontline/frontlineVisualAssets";
import { canFortressEnemyAttack, type FortressDefenseEnemy } from "@/features/fortress-defense/engine";
import { fortressDefenseSlot } from "@/features/fortress-defense/grid";
import { cn } from "@/lib/cn";
import { enemyBattlefieldPosition } from "./fortressDefenseBattlefieldLayout";
import {
  fortressDefenseEnemyDisplayName,
  fortressDefenseEnemyIcon,
  fortressDefenseEnemyVisualId,
} from "./fortressDefenseEnemyVisuals";
import type { DefenseVisualPhase, EnemyVisualOrigin, TurnVisualEvent } from "./fortressDefenseVisualEvents";
import type { TranslateFn } from "./fortressPageHelpers";
import { FloatingNumber, RangePips } from "./FortressDefenseUnitPrimitives";

export function EnemyStandee({
  enemy,
  index,
  origin,
  event,
  phase,
  activeEnemyActionId,
  ghost,
  contested,
  targeting,
  hovered,
  shotPreview,
  onTarget,
  onHover,
  t,
}: {
  enemy: FortressDefenseEnemy;
  index: number;
  origin?: EnemyVisualOrigin;
  event: TurnVisualEvent;
  phase: DefenseVisualPhase;
  activeEnemyActionId: string | null;
  ghost: boolean;
  contested: boolean;
  targeting: boolean;
  hovered: boolean;
  shotPreview: number;
  onTarget: (enemyId: string) => void;
  onHover: (enemyId: string | null) => void;
  t: TranslateFn;
}) {
  const visualId = fortressDefenseEnemyVisualId(enemy);
  const visual = getFrontlineHeroVisualAsset(visualId);
  const hpWidth = Math.max(0, (enemy.hp / Math.max(1, enemy.maxHp)) * 100);
  const position = enemyBattlefieldPosition(enemy, index, origin, { contested });
  const range = enemy.range;
  const slot = fortressDefenseSlot(enemy.lane, range);
  const damage = event.damageByEnemyId[enemy.id] ?? 0;
  const hit = phase === "resolvingOrder" && (damage > 0 || event.damagedEnemyIds.includes(enemy.id));
  const defeated = event.defeatedEnemyIds.includes(enemy.id);
  const active = activeEnemyActionId === enemy.id;
  const attacking = phase === "enemyAttacking" && event.attackingEnemyIds.includes(enemy.id) && active;
  const rangedAttack = attacking && enemy.range > 1;
  const advancing = phase === "enemyAdvancing" && event.advancedEnemyIds.includes(enemy.id);
  const entering = phase === "waveIncoming" && event.spawnedEnemyIds.includes(enemy.id);
  const threat = attacking || canFortressEnemyAttack(enemy);
  const far = range >= 4;
  const killPreview = targeting && shotPreview >= enemy.hp;
  const style = {
    "--enemy-left": `${position.mobileLeft}%`,
    "--enemy-left-sm": `${position.desktopLeft}%`,
    "--enemy-top": `${position.mobileTop}%`,
    "--enemy-top-sm": `${position.desktopTop}%`,
    "--enemy-scale": position.scale,
    "--enemy-advance-x": position.advanceX,
    "--enemy-advance-y": position.advanceY,
    animationDelay: `${index * 0.08}s`,
    zIndex: position.zIndex,
  } as CSSProperties;

  return (
    <button
      type="button"
      className={cn(
        "fortress-defense-enemy-standee group absolute left-[var(--enemy-left)] top-[var(--enemy-top)] w-[5.8rem] text-left outline-none transition sm:left-[var(--enemy-left-sm)] sm:top-[var(--enemy-top-sm)] sm:w-[9rem] md:w-[10.6rem]",
        targeting && !ghost && "cursor-crosshair hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#f5c451]/80",
        far && !attacking && "opacity-78 saturate-[0.86]",
        threat && "fortress-defense-enemy-threat-fx",
        advancing && "fortress-defense-enemy-advance-fx",
        attacking && (rangedAttack ? "fortress-defense-enemy-ranged-attack-fx" : "fortress-defense-enemy-attack-fx"),
        entering && "fortress-defense-wave-enter-fx",
        defeated && ghost && "fortress-defense-enemy-defeat-fx",
        targeting && !ghost && "ring-1 ring-[#f5c451]/50",
        hovered && !ghost && "ring-2 ring-[#f5c451]/82 drop-shadow-[0_0_26px_rgba(245,196,81,0.28)]",
        contested && !ghost && "drop-shadow-[0_0_20px_rgba(240,95,114,0.18)]",
      )}
      data-fortress-enemy={enemy.id}
      data-fortress-visual-id={visualId}
      data-fortress-lane={enemy.lane}
      data-fortress-range={range}
      data-fortress-slot-x={slot.xPct}
      data-fortress-slot-y={slot.yPct}
      data-fortress-hp={Math.max(0, enemy.hp)}
      data-fortress-attack-range={enemy.attackRange}
      data-fortress-move-speed={enemy.moveSpeed}
      data-fortress-attack-damage={enemy.attackDamage}
      data-fortress-can-attack={canFortressEnemyAttack(enemy) ? "true" : "false"}
      data-fortress-targetable={targeting ? "true" : "false"}
      data-fortress-hovered={hovered ? "true" : "false"}
      data-fortress-advancing={advancing ? "true" : "false"}
      aria-pressed={hovered}
      disabled={!targeting || ghost}
      onClick={() => onTarget(enemy.id)}
      onMouseEnter={() => targeting && onHover(enemy.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => targeting && onHover(enemy.id)}
      onBlur={() => onHover(null)}
      style={style}
    >
      <div className="absolute bottom-3 left-1/2 h-6 w-[72%] -translate-x-1/2 rounded-[999px] bg-black/50 blur-[1px]" />
      <div className={cn("relative mx-auto transition", hit && "frontline-hit-fx")}>
        {threat ? <div className="absolute -left-1 top-[22%] z-[5] grid h-8 w-8 place-items-center rounded-full border border-rose-100/46 bg-rose-500/20 text-[13px] font-black text-rose-50 shadow-[0_0_24px_rgba(240,95,114,0.38)]">!</div> : null}
        {targeting ? <div className="pointer-events-none absolute bottom-0 left-1/2 z-[3] h-8 w-[76%] -translate-x-1/2 rounded-[50%] border border-[#f5c451]/34 bg-[#f5c451]/12 shadow-[0_0_18px_rgba(245,196,81,0.16)]" /> : null}
        {targeting && hovered ? <div className="absolute left-1/2 top-[8%] z-[6] -translate-x-1/2 rounded-full border border-[#f5c451]/58 bg-[#f5c451]/18 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] text-[#ffe4a8] shadow-[0_10px_22px_rgba(0,0,0,0.28)]">{killPreview ? t("fortressScreen.defense.killPreview") : `-${shotPreview}`}</div> : null}
        {hit ? (
          <div key={`hit-${event.key}-${enemy.id}`} className="frontline-action-impact-fx pointer-events-none absolute left-1/2 top-[44%] z-[4] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-rose-100/58 bg-rose-400/16 shadow-[0_0_42px_rgba(240,95,114,0.34)] sm:h-20 sm:w-20">
            <CombatIcon name="attack" size="lg" className="h-10 w-10" />
          </div>
        ) : null}
        {damage > 0 && phase === "resolvingOrder" ? <FloatingNumber key={`damage-${event.key}-${enemy.id}`} tone={defeated ? "ko" : "damage"} className="left-[54%] top-[18%]">{defeated ? "KO" : `-${damage}`}</FloatingNumber> : null}
        <div className={cn("pointer-events-none absolute left-1/2 top-[24%] h-20 w-20 -translate-x-1/2 rounded-full sm:h-28 sm:w-28", threat ? "bg-rose-400/16 shadow-[0_0_42px_rgba(240,95,114,0.18)]" : "bg-rose-300/8")} />
        <VisualAssetImage
          src={visual.standeeSrc}
          fallbackSrc={visual.portraitFallbackSrc ?? getFrontlineUnitPlaceholderSrc()}
          alt={fortressDefenseEnemyDisplayName(enemy, t)}
          className="relative mx-auto h-28 w-20 overflow-visible sm:h-44 sm:w-32 md:h-[13rem] md:w-[9.5rem]"
          imgClassName="h-full w-full object-contain object-bottom drop-shadow-[0_24px_34px_rgba(0,0,0,0.54)]"
          fallback={
            <div className="grid h-full w-full place-items-center rounded-[28px] border border-rose-200/16 bg-rose-400/10">
              <CombatIcon name={fortressDefenseEnemyIcon(enemy.kind)} size="xl" />
            </div>
          }
        />
      </div>
      <div className={cn("relative mx-auto -mt-4 w-[92%] rounded-[13px] border bg-black/58 px-2 py-1.5 text-center shadow-[0_14px_28px_rgba(0,0,0,0.28)] backdrop-blur-[1px] sm:-mt-5 sm:w-[78%]", threat ? "border-rose-100/34 shadow-[0_0_28px_rgba(240,95,114,0.18)]" : "border-rose-100/14")}>
        <div className="flex items-center justify-between gap-1 text-[8px] font-black uppercase tracking-[0.08em] text-white sm:text-[9px]">
          <span className="truncate">{fortressDefenseEnemyDisplayName(enemy, t)}</span>
          <span className={cn("rounded-full border px-1.5 py-0.5 text-[7px]", threat ? "border-rose-100/34 bg-rose-400/18 text-rose-50" : "border-white/12 bg-white/[0.05] text-white/58")}>R{range}</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/50">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#d95764,#ffab8a)]" style={{ width: `${hpWidth}%` }} />
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 text-[7px] font-black uppercase tracking-[0.08em] text-white/58 sm:text-[8px]">
          <RangePips value={range} />
          <span className={cn(threat && "text-rose-100")}>{threat ? t("fortressScreen.defense.threatReady") : t("fortressScreen.defense.attackRangeShort", { value: enemy.attackRange })}</span>
          <span>{Math.max(0, enemy.hp)}/{enemy.maxHp}</span>
        </div>
      </div>
    </button>
  );
}
