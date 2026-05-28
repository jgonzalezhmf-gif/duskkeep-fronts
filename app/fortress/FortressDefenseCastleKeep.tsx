import { cn } from "@/lib/cn";
import type { FrontlineFortressOutcome } from "@/lib/types";
import type { DefenseVisualPhase, TurnVisualEvent } from "./fortressDefenseVisualEvents";
import type { TranslateFn } from "./fortressPageHelpers";
import { FloatingNumber } from "./FortressDefenseUnitPrimitives";

export function CastleKeep({
  state,
  outcome,
  phase,
  event,
  t,
}: {
  state: {
    castleHp: number;
    maxCastleHp: number;
    shield: number;
  };
  outcome: FrontlineFortressOutcome;
  phase: DefenseVisualPhase;
  event: TurnVisualEvent;
  t: TranslateFn;
}) {
  const hpWidth = Math.max(0, (state.castleHp / Math.max(1, state.maxCastleHp)) * 100);
  const shieldVisible = state.shield > 0 || event.shieldGain > 0 || event.shieldAbsorbed > 0;
  const lowHp = state.castleHp / Math.max(1, state.maxCastleHp) <= 0.32;
  const hit = phase === "castleHit" && event.castleDamage > 0;
  const incomingAttack = phase === "enemyAttacking" && event.attackingEnemyIds.length > 0;
  const mending = phase === "resolvingOrder" && event.heal > 0;
  const shielding = (phase === "resolvingOrder" && event.shieldGain > 0) || event.shieldAbsorbed > 0;
  return (
    <div
      className={cn(
        "pointer-events-none absolute left-[1.5%] top-[39%] z-[14] w-[min(20rem,78vw)] sm:left-[2.25%] sm:top-[40%] sm:w-[22rem] lg:left-[2.75%]",
        hit && "fortress-defense-castle-hit-fx",
        lowHp && "fortress-defense-castle-alarm-fx",
      )}
      data-fortress-castle-hp={Math.max(0, state.castleHp)}
      data-fortress-castle-shield={state.shield}
    >
      <div className="relative h-[8.75rem] sm:h-[10rem]">
        <div className="pointer-events-none absolute left-[8%] top-[9%] h-[5.9rem] w-[3.4rem] rounded-[16px] border-l border-r border-[#f5c451]/20 bg-[linear-gradient(180deg,rgba(245,196,81,0.1),rgba(5,7,11,0.16))] shadow-[inset_0_0_22px_rgba(245,196,81,0.05),0_18px_34px_rgba(0,0,0,0.24)] sm:h-[7rem] sm:w-[4rem]" />
        <div className="pointer-events-none absolute left-[6%] top-[13%] h-[5.25rem] w-px bg-[linear-gradient(180deg,transparent,rgba(245,196,81,0.48),transparent)]" />
        <div className="pointer-events-none absolute left-[19%] top-[13%] h-[5.25rem] w-px bg-[linear-gradient(180deg,transparent,rgba(245,196,81,0.32),transparent)]" />
        {shieldVisible ? <div className={cn("pointer-events-none absolute left-[3%] top-[4%] z-[3] h-[7.1rem] w-[6.9rem] rounded-[24px] border border-cyan-100/38 bg-cyan-200/8 shadow-[0_0_34px_rgba(110,220,230,0.14)] sm:h-[8.2rem] sm:w-[7.8rem]", shielding && "fortress-defense-shield-dome-fx")} /> : null}
        {incomingAttack ? <div className="fortress-defense-gate-panel-flash-fx pointer-events-none absolute left-[3%] top-[4%] z-[4] h-[7.1rem] w-[6.9rem] rounded-[24px] border border-rose-100/46 bg-rose-400/18 shadow-[0_0_44px_rgba(240,95,114,0.34)] sm:h-[8.2rem] sm:w-[7.8rem]" /> : null}
        {mending ? <div className="fortress-defense-mend-glow-fx pointer-events-none absolute left-[3%] top-[12%] z-[4] h-[5.4rem] w-[6.4rem] rounded-[24px] bg-emerald-300/14 shadow-[0_0_42px_rgba(93,211,158,0.24)] sm:h-[6.2rem] sm:w-[7.2rem]" /> : null}
        <div className="absolute left-[10%] top-[27%] z-[5] h-8 w-8 rotate-45 rounded-[9px] border border-[#f5c451]/34 bg-[linear-gradient(135deg,rgba(245,196,81,0.34),rgba(5,7,11,0.62))] shadow-[0_0_24px_rgba(245,196,81,0.16)] sm:h-9 sm:w-9">
          <span className="absolute inset-2 rounded-[6px] border border-white/14 bg-black/28" />
        </div>
        {hit ? <FloatingNumber key={`castle-damage-${event.key}`} tone="damage" className="left-[13%] top-[-6%]">-{event.castleDamage}</FloatingNumber> : null}
        {event.shieldAbsorbed > 0 && phase === "castleHit" ? <FloatingNumber key={`castle-absorb-${event.key}`} tone="shield" className="left-[28%] top-[11%]">{t("fortressScreen.defense.absorbPopup", { value: event.shieldAbsorbed })}</FloatingNumber> : null}
        {mending ? <FloatingNumber key={`castle-heal-${event.key}`} tone="heal" className="left-[13%] top-[-2%]">+{event.heal}</FloatingNumber> : null}
      </div>
      <div className="relative -mt-10 ml-0 w-[min(19rem,86vw)] rounded-[16px] border border-[#f5c451]/16 bg-black/54 px-3 py-2 shadow-[0_18px_36px_rgba(0,0,0,0.34)] backdrop-blur-[2px] sm:-mt-11 sm:w-[20rem]">
        <div className="flex items-center justify-between gap-1 text-[8px] font-black uppercase tracking-[0.12em] text-white/66 sm:gap-2 sm:text-[9px] sm:tracking-[0.14em]">
          <span>{t("fortressScreen.defense.castleCore")}</span>
          <span className="whitespace-nowrap">{t("fortressScreen.defense.hp", { current: Math.max(0, state.castleHp), max: state.maxCastleHp })}</span>
        </div>
        <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-black/50">
          <div className={cn("h-full rounded-full transition-[width] duration-300", outcome === "breach" || lowHp ? "bg-[linear-gradient(90deg,#f05f72,#ff9f67)]" : "bg-[linear-gradient(90deg,#ff8a5b,#f5d498,#66d6a1)]")} style={{ width: `${hpWidth}%` }} />
        </div>
        {shieldVisible ? (
          <div className="mt-1.5 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.12em] text-cyan-100/74">
            <span>{t("fortressScreen.defense.shield")}</span>
            <span>{state.shield}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
