import { CombatIcon } from "@/components/game/frontline/FrontlineCombatIcon";
import {
  isFortressDefenseGuardSlotAvailable,
  isFortressDefenseTrapSlotAvailable,
  type FortressDefenseActionDef,
  type FortressDefenseActionId,
  type FortressDefenseLane,
  type FortressDefenseRange,
  type FortressDefenseState,
  type FortressDefenseTargetType,
} from "@/features/fortress-defense/engine";
import { FORTRESS_DEFENSE_SLOTS } from "@/features/fortress-defense/grid";
import { cn } from "@/lib/cn";
import { RANGE_MARKERS, slotCssPosition, slotStagePoint } from "./fortressDefenseBattlefieldLayout";
import type { DefenseVisualPhase, TurnVisualEvent } from "./fortressDefenseVisualEvents";
import type { TranslateFn } from "./fortressPageHelpers";

export function FlowCue({ event, phase, t }: { event: TurnVisualEvent; phase: DefenseVisualPhase; t: TranslateFn }) {
  if (phase === "idle") return null;
  const orderLabel = event.actionId ? t(`fortressScreen.defense.actions.${event.actionId}.label`) : null;
  const headline = phase === "resolvingOrder" && orderLabel ? orderLabel : t(`fortressScreen.defense.phases.${phase}`);
  return (
    <div className="pointer-events-none absolute left-1/2 top-[6%] z-[22] grid -translate-x-1/2 place-items-center gap-1 text-center">
      <div className="fortress-defense-phase-banner-fx rounded-[22px] border border-[#f5c451]/26 bg-[linear-gradient(180deg,rgba(245,196,81,0.24),rgba(8,9,13,0.54))] px-5 py-2 shadow-[0_18px_46px_rgba(0,0,0,0.28)] backdrop-blur-[2px]">
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ffe4a8] sm:text-xs">{headline}</div>
      </div>
    </div>
  );
}

export function TargetingCue({ action, t, onCancel }: { action: FortressDefenseActionDef | null; t: TranslateFn; onCancel: () => void }) {
  if (!action || (action.targetType !== "enemy" && action.targetType !== "lane" && action.targetType !== "slot")) return null;
  return (
    <div className="absolute left-1/2 top-[7%] z-[23] flex -translate-x-1/2 items-center gap-2 rounded-[20px] border border-[#f5c451]/28 bg-black/52 px-3 py-2 text-center shadow-[0_18px_38px_rgba(0,0,0,0.28)] backdrop-blur-[2px]" data-fortress-targeting-mode={action.targetType}>
      <CombatIcon name={action.targetType === "enemy" ? "target" : "move"} size="sm" className="h-4 w-4 text-[#ffe4a8]" />
      <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#ffe4a8] sm:text-[10px]">
        {action.targetType === "enemy" ? t("fortressScreen.defense.selectTarget") : t("fortressScreen.defense.selectSlot")}
      </div>
      <button
        type="button"
        className="frontline-motion-action rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white/62 hover:text-white"
        onClick={onCancel}
      >
        {t("fortressScreen.defense.cancelTargeting")}
      </button>
    </div>
  );
}

export function TargetSlotLayer({
  targetType,
  validSlotKeys,
  onTarget,
  t,
}: {
  targetType: FortressDefenseTargetType;
  validSlotKeys?: ReadonlySet<string>;
  onTarget: (lane: FortressDefenseLane, range: FortressDefenseRange) => void;
  t: TranslateFn;
}) {
  if (targetType !== "slot" && targetType !== "lane") return null;
  const slots = targetType === "lane"
    ? FORTRESS_DEFENSE_SLOTS.filter((slot) => slot.range === 3)
    : validSlotKeys
      ? FORTRESS_DEFENSE_SLOTS.filter((slot) => validSlotKeys.has(`${slot.lane}:${slot.range}`))
      : FORTRESS_DEFENSE_SLOTS;
  return (
    <div className="absolute inset-0 z-[18]" data-fortress-slot-targeting={targetType}>
      {slots.map((slot) => {
        const key = `${slot.lane}:${slot.range}`;
        const valid = !validSlotKeys || validSlotKeys.has(key);
        const label = `${slot.lane} ${t("fortressScreen.defense.range", { value: slot.range })}`;
        return (
          <button
            key={`${slot.lane}-${slot.range}`}
            type="button"
            className={cn(
              "absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border shadow-[0_0_18px_rgba(245,196,81,0.18)] transition-[background-color,border-color,box-shadow,filter] duration-150 sm:h-7 sm:w-7",
              valid
                ? "border-[#f5c451]/52 bg-[#f5c451]/14 hover:bg-[#f5c451]/24 hover:shadow-[0_0_22px_rgba(245,196,81,0.28)] hover:brightness-110"
                : "border-white/10 bg-black/26 opacity-45",
            )}
            style={slotCssPosition(slot)}
            data-fortress-target-slot={key}
            data-fortress-target-slot-valid={valid ? "true" : "false"}
            disabled={!valid}
            aria-label={label}
            title={label}
            onClick={() => valid && onTarget(slot.lane, slot.range)}
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-2.5 w-2.5 rounded-full border",
                valid
                  ? "border-[#ffe4a8]/70 bg-[#ffe4a8]/86 shadow-[0_0_14px_rgba(245,196,81,0.42)]"
                  : "border-white/18 bg-white/18",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function validTargetSlotKeys(state: FortressDefenseState, actionId: FortressDefenseActionId) {
  if (actionId === "deploy_guard" || actionId === "deploy_archer") {
    return new Set(FORTRESS_DEFENSE_SLOTS
      .filter((slot) => slot.range <= 2)
      .filter((slot) => isFortressDefenseGuardSlotAvailable(state, slot.lane, slot.range))
      .map((slot) => `${slot.lane}:${slot.range}`));
  }
  if (actionId === "traps") {
    return new Set(FORTRESS_DEFENSE_SLOTS
      .filter((slot) => slot.range >= 2 && slot.range <= 4)
      .filter((slot) => isFortressDefenseTrapSlotAvailable(state, slot.lane, slot.range))
      .map((slot) => `${slot.lane}:${slot.range}`));
  }
  return undefined;
}

export function AdvancePath({ phase, targetingType }: { phase: DefenseVisualPhase; targetingType: FortressDefenseTargetType }) {
  const active = phase === "enemyAdvancing" || phase === "enemyAttacking";
  const hideRangeMarkers = targetingType === "slot" || targetingType === "lane";
  const lanes: FortressDefenseLane[] = ["top", "middle", "bottom"];
  const ranges: FortressDefenseRange[] = [1, 2, 3, 4, 5];
  const stagePoints = FORTRESS_DEFENSE_SLOTS.map((slot) => slotStagePoint(slot));
  const stageLeft = Math.min(...stagePoints.map((point) => point.left)) - 3;
  const stageRight = Math.max(...stagePoints.map((point) => point.left)) + 2;
  const stageTop = Math.min(...stagePoints.map((point) => point.top)) - 11;
  const stageBottom = Math.max(...stagePoints.map((point) => point.top)) + 11;
  return (
    <div className="pointer-events-none absolute inset-0 z-[4]" aria-hidden="true">
      <div
        className={cn("absolute rounded-[34px] bg-[linear-gradient(90deg,rgba(245,196,81,0.03),rgba(240,95,114,0.035),transparent)] opacity-38", active && "fortress-defense-path-pulse-fx")}
        style={{ left: `${stageLeft}%`, top: `${stageTop}%`, width: `${stageRight - stageLeft}%`, height: `${stageBottom - stageTop}%` }}
      />
      {lanes.map((lane) => {
        const laneSlots = FORTRESS_DEFENSE_SLOTS.filter((slot) => slot.lane === lane);
        const points = laneSlots.map((slot) => slotStagePoint(slot));
        const left = Math.min(...points.map((point) => point.left));
        const right = Math.max(...points.map((point) => point.left));
        const top = points[0]?.top ?? 54;
        return <div key={lane} className="absolute h-px bg-[linear-gradient(90deg,rgba(245,196,81,0.42),rgba(255,255,255,0.18),rgba(245,196,81,0.22))]" style={{ left: `${left}%`, top: `${top}%`, width: `${right - left}%` }} />;
      })}
      {ranges.map((range) => {
        const rangeSlots = FORTRESS_DEFENSE_SLOTS.filter((slot) => slot.range === range);
        const points = rangeSlots.map((slot) => slotStagePoint(slot));
        const x = points[0]?.left ?? 62;
        const top = Math.min(...points.map((point) => point.top));
        const bottom = Math.max(...points.map((point) => point.top));
        return <div key={range} className="absolute w-px bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(245,196,81,0.2),rgba(255,255,255,0.12))]" style={{ left: `${x}%`, top: `${top}%`, height: `${bottom - top}%` }} />;
      })}
      {FORTRESS_DEFENSE_SLOTS.map((slot) => (
        <div
          key={`${slot.lane}-${slot.range}`}
          className={cn("absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-[0_0_16px_rgba(245,196,81,0.12)]", active ? "border-[#f5c451]/36 bg-[#f5c451]/22" : "border-white/14 bg-black/36")}
          style={slotCssPosition(slot)}
        />
      ))}
      {!hideRangeMarkers && RANGE_MARKERS.map((marker) => (
        <div
          key={marker.range}
          className={cn("absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-[7px] font-black uppercase tracking-[0.08em] shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur-[1px] sm:text-[8px]", active ? "border-[#f5c451]/30 bg-[#f5c451]/14 text-[#ffe4a8]" : "border-white/10 bg-black/22 text-white/36")}
          style={{ left: `${marker.left}%`, top: `${marker.top}%`, width: `${marker.size}rem`, height: `${marker.size}rem` }}
        >
          R{marker.range}
        </div>
      ))}
    </div>
  );
}

export function WaveBanner({
  state,
  event,
  phase,
  t,
}: {
  state: FortressDefenseState;
  event: TurnVisualEvent;
  phase: DefenseVisualPhase;
  t: TranslateFn;
}) {
  const showIncoming = phase === "waveIncoming";
  if (!showIncoming) return null;
  const label = phase === "waveIncoming" ? t("fortressScreen.defense.waveIncoming", { value: event.wave || state.wave }) : t("fortressScreen.defense.wave", { current: state.wave, total: state.maxWaves });
  return (
    <div className="frontline-clash-spotlight-fx pointer-events-none absolute left-1/2 top-[18%] z-[17] -translate-x-1/2 rounded-[22px] border border-[#f5c451]/28 bg-[linear-gradient(180deg,rgba(245,196,81,0.22),rgba(8,9,13,0.54))] px-5 py-2 text-center shadow-[0_18px_44px_rgba(0,0,0,0.26)] backdrop-blur-[2px]">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ffe4a8]">{label}</div>
    </div>
  );
}
