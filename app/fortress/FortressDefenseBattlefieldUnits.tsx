import type { CSSProperties } from "react";
import { CombatIcon } from "@/components/game/frontline/FrontlineCombatIcon";
import { VisualAssetImage } from "@/components/game/frontline/FrontlineVisualAssetImage";
import {
  type FortressDefenseGuard,
  type FortressDefenseTrap,
} from "@/features/fortress-defense/engine";
import { FORTRESS_DEFENSE_UNIT_ASSETS } from "@/features/fortress-defense/assets";
import { fortressDefenseSlot } from "@/features/fortress-defense/grid";
import { cn } from "@/lib/cn";
import {
  slotCssPosition,
  slotStagePoint,
} from "./fortressDefenseBattlefieldLayout";
import type { DefenseVisualPhase, TurnVisualEvent } from "./fortressDefenseVisualEvents";
import type { TranslateFn } from "./fortressPageHelpers";
import {
  FloatingNumber,
  GarrisonUnitFigure,
  SpikeTrapFallbackFigure,
} from "./FortressDefenseUnitPrimitives";

export { CastleKeep } from "./FortressDefenseCastleKeep";
export { EnemyStandee } from "./FortressDefenseEnemyStandee";
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
