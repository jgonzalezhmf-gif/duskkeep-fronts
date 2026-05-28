import type { CSSProperties } from "react";
import { CombatIcon } from "@/components/game/frontline/FrontlineCombatIcon";
import { VisualAssetImage } from "@/components/game/frontline/FrontlineVisualAssetImage";
import {
  getFrontlineHeroVisualAsset,
  getFrontlineUnitPlaceholderSrc,
} from "@/components/game/frontline/frontlineVisualAssets";
import {
  canFortressEnemyAttack,
  type FortressDefenseEnemy,
  type FortressDefenseGuard,
  type FortressDefenseTrap,
} from "@/features/fortress-defense/engine";
import { FORTRESS_DEFENSE_UNIT_ASSETS } from "@/features/fortress-defense/assets";
import { fortressDefenseSlot } from "@/features/fortress-defense/grid";
import { cn } from "@/lib/cn";
import {
  enemyBattlefieldPosition,
  slotCssPosition,
  slotStagePoint,
} from "./fortressDefenseBattlefieldLayout";
import {
  fortressDefenseEnemyDisplayName,
  fortressDefenseEnemyIcon,
  fortressDefenseEnemyVisualId,
} from "./fortressDefenseEnemyVisuals";
import type { DefenseVisualPhase, EnemyVisualOrigin, TurnVisualEvent } from "./fortressDefenseVisualEvents";
import type { TranslateFn } from "./fortressPageHelpers";
import {
  FloatingNumber,
  GarrisonUnitFigure,
  RangePips,
  SpikeTrapFallbackFigure,
} from "./FortressDefenseUnitPrimitives";

export { CastleKeep } from "./FortressDefenseCastleKeep";
export { EnemyAssaultFx, OrderFx } from "./FortressDefenseBattlefieldFx";

export function TrapMarker({
  trap,
  event,
  phase,
  ghost,
  t,
}: {
  trap: FortressDefenseTrap;
  event: TurnVisualEvent;
  phase: DefenseVisualPhase;
  ghost: boolean;
  t: TranslateFn;
}) {
  const slot = fortressDefenseSlot(trap.lane, trap.range);
  const deployed = phase === "resolvingOrder" && event.deployedTrapIds.includes(trap.id);
  const triggered = ghost || event.triggeredTrapIds.includes(trap.id);
  const asset = FORTRESS_DEFENSE_UNIT_ASSETS.spikeTrap;
  return (
    <div
      className={cn(
        "fortress-defense-trap-marker absolute grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[18px] text-center drop-shadow-[0_0_22px_rgba(167,139,250,0.38)] sm:h-24 sm:w-24",
        deployed && "fortress-defense-trap-arm-fx",
        triggered && "fortress-defense-trap-spring-fx",
      )}
      style={{ ...slotCssPosition(slot, { yOffset: 2 }), zIndex: slot.z + 12 } as CSSProperties}
      data-fortress-trap={trap.id}
      data-fortress-trap-lane={trap.lane}
      data-fortress-trap-range={trap.range}
      data-fortress-trap-triggered={triggered ? "true" : "false"}
      data-fortress-trap-asset={asset.id}
      aria-label={t("fortressScreen.defense.trapMarker")}
    >
      <VisualAssetImage
        src={asset.src}
        alt=""
        className="relative z-[2] h-full w-full overflow-visible"
        imgClassName="h-full w-full scale-[1.18] object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.46)]"
        fallback={<SpikeTrapFallbackFigure />}
      />
      {triggered ? <FloatingNumber key={`trap-${event.key}-${trap.id}`} tone="damage" className="left-[50%] top-[-35%]">{t("fortressScreen.defense.trapTriggered")}</FloatingNumber> : null}
    </div>
  );
}

export function GuardStandee({
  guard,
  index,
  event,
  phase,
  ghost,
  contested,
  t,
}: {
  guard: FortressDefenseGuard;
  index: number;
  event: TurnVisualEvent;
  phase: DefenseVisualPhase;
  ghost: boolean;
  contested: boolean;
  t: TranslateFn;
}) {
  const slot = fortressDefenseSlot(guard.lane, guard.range);
  const hpWidth = Math.max(0, (guard.hp / Math.max(1, guard.maxHp)) * 100);
  const deployed = phase === "resolvingOrder" && event.deployedGuardIds.includes(guard.id);
  const striking = phase === "resolvingOrder" && event.guardStrikeSlots.includes(`${guard.lane}:${guard.range}`);
  const hit = (phase === "enemyAttacking" || phase === "castleHit" || phase === "idle") && event.damagedGuardIds.includes(guard.id);
  const defeated = ghost || event.defeatedGuardIds.includes(guard.id);
  const damage = event.guardDamageById[guard.id] ?? 0;
  const heal = event.guardHealById[guard.id] ?? 0;
  const shieldGain = event.guardShieldGainById[guard.id] ?? 0;
  const shieldVisible = (guard.shield ?? 0) > 0 || shieldGain > 0;
  const inspired = (guard.inspiredTurns ?? 0) > 0;
  const point = slotStagePoint(slot, contested ? { xOffset: -3.2, yOffset: 3.2 } : undefined);
  const asset = guard.unitType === "archer" ? FORTRESS_DEFENSE_UNIT_ASSETS.garrisonArcher : FORTRESS_DEFENSE_UNIT_ASSETS.garrisonGuard;
  const style = {
    "--guard-left": `${point.left}%`,
    "--guard-top": `${point.top}%`,
    zIndex: slot.z + 24 + index,
  } as CSSProperties;

  return (
    <div
      className={cn(
        "fortress-defense-guard-standee absolute left-[var(--guard-left)] top-[var(--guard-top)] w-32 -translate-x-1/2 -translate-y-1/2 text-center sm:w-44 md:w-52",
        deployed && "fortress-defense-guard-enter-fx",
        striking && "fortress-defense-guard-strike-fx",
        hit && "fortress-defense-guard-block-fx",
        defeated && "fortress-defense-guard-defeat-fx",
        shieldVisible && "drop-shadow-[0_0_20px_rgba(101,210,200,0.18)]",
        contested && "drop-shadow-[0_0_18px_rgba(101,210,200,0.16)]",
      )}
      style={style}
      data-fortress-guard={guard.id}
      data-fortress-guard-lane={guard.lane}
      data-fortress-guard-range={guard.range}
      data-fortress-guard-hp={Math.max(0, guard.hp)}
      data-fortress-guard-shield={Math.max(0, guard.shield ?? 0)}
      data-fortress-guard-asset={asset.id}
      data-fortress-guard-unit-type={guard.unitType}
    >
      <div className="relative mx-auto h-36 w-32 overflow-visible sm:h-48 sm:w-40 md:h-56 md:w-48">
        <div className="absolute bottom-1 left-1/2 h-5 w-[78%] -translate-x-1/2 rounded-[50%] bg-black/56 blur-[3px]" />
        <GarrisonUnitFigure alt={guard.name} unitType={guard.unitType} />
        {inspired ? <div className="fortress-defense-chant-fx pointer-events-none absolute inset-[14%] rounded-full border border-[#f5d498]/24 bg-[#f5c451]/8 shadow-[0_0_30px_rgba(245,196,81,0.18)]" aria-hidden="true" /> : null}
        {shieldVisible ? <div className="pointer-events-none absolute inset-[18%] rounded-full border border-cyan-100/24 bg-cyan-300/8 shadow-[0_0_24px_rgba(101,210,200,0.16)]" aria-hidden="true" /> : null}
        <div className={cn("absolute right-0 top-2 grid h-5 w-5 place-items-center rounded-full border shadow-[0_0_14px_rgba(101,210,200,0.18)] sm:h-6 sm:w-6", guard.unitType === "archer" ? "border-[#f5d498]/40 bg-[#f5c451]/18" : "border-cyan-100/38 bg-cyan-300/18")}>
          <CombatIcon name={guard.unitType === "archer" ? "attack" : "shield"} size="sm" className="h-3.5 w-3.5" />
        </div>
        {hit ? <FloatingNumber key={`guard-block-${event.key}-${guard.id}`} tone="shield" className="left-[52%] top-[-18%]">{t("fortressScreen.defense.blocked")}</FloatingNumber> : null}
        {striking ? <FloatingNumber key={`guard-strike-${event.key}-${guard.id}`} tone="shield" className="left-[62%] top-[-20%]">{t("fortressScreen.defense.strike")}</FloatingNumber> : null}
        {heal > 0 ? <FloatingNumber key={`guard-heal-${event.key}-${guard.id}`} tone="heal" className="left-[42%] top-[-18%]">+{heal}</FloatingNumber> : null}
        {shieldGain > 0 ? <FloatingNumber key={`guard-shield-${event.key}-${guard.id}`} tone="shield" className="left-[36%] top-[-23%]">+{shieldGain}</FloatingNumber> : null}
        {damage > 0 ? <FloatingNumber key={`guard-damage-${event.key}-${guard.id}`} tone={defeated ? "ko" : "damage"} className="left-[74%] top-[18%]">{defeated ? "KO" : `-${damage}`}</FloatingNumber> : null}
      </div>
      <div className="mx-auto mt-1 w-[4.25rem] rounded-full border border-white/10 bg-black/52 px-1 py-0.5 sm:w-[4.75rem]">
        <div className="h-1 overflow-hidden rounded-full bg-black/60">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#65d2c8,#f5d498)]" style={{ width: `${hpWidth}%` }} />
        </div>
        <div className="mt-0.5 text-[7px] font-black uppercase tracking-[0.1em] text-cyan-50/72">{Math.max(0, guard.hp)}/{guard.maxHp}</div>
        {shieldVisible ? <div className="text-[7px] font-black uppercase tracking-[0.1em] text-cyan-100/78">+{Math.max(0, guard.shield ?? 0)} {t("fortressScreen.defense.actionStats.shield")}</div> : null}
      </div>
    </div>
  );
}

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
