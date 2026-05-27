import type { ReactNode } from "react";
import { CombatIcon } from "@/components/game/frontline/FrontlineCombatIcon";
import { VisualAssetImage } from "@/components/game/frontline/FrontlineVisualAssetImage";
import { FORTRESS_DEFENSE_MAX_RANGE, type FortressDefenseGuard } from "@/features/fortress-defense/engine";
import { FORTRESS_DEFENSE_UNIT_ASSETS } from "@/features/fortress-defense/assets";
import { cn } from "@/lib/cn";

export function SpikeTrapFallbackFigure() {
  return (
    <div className="relative grid h-10 w-10 rotate-45 place-items-center rounded-[14px] border border-violet-100/34 bg-[radial-gradient(circle_at_50%_50%,rgba(216,180,254,0.2),rgba(14,8,24,0.7))] shadow-[0_0_24px_rgba(167,139,250,0.22)]" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 bg-violet-100/54" />
      <div className="absolute left-1/2 top-1/2 h-px w-8 -translate-x-1/2 -translate-y-1/2 bg-violet-100/54" />
      <CombatIcon name="danger" size="sm" className="relative z-[2] h-4 w-4 -rotate-45 text-violet-100" />
    </div>
  );
}

export function GarrisonUnitFigure({ alt, unitType }: { alt: string; unitType: FortressDefenseGuard["unitType"] }) {
  const asset = unitType === "archer" ? FORTRESS_DEFENSE_UNIT_ASSETS.garrisonArcher : FORTRESS_DEFENSE_UNIT_ASSETS.garrisonGuard;
  return (
    <VisualAssetImage
      src={asset.src}
      alt={alt}
      className="relative z-[2] h-full w-full overflow-visible"
      imgClassName="fortress-defense-guard-image h-full w-full object-cover object-[50%_58%] drop-shadow-[0_20px_24px_rgba(0,0,0,0.5)]"
      fallback={<GarrisonGuardFallbackFigure />}
    />
  );
}

export function RangePips({ value }: { value: number }) {
  const closeness = FORTRESS_DEFENSE_MAX_RANGE + 1 - Math.max(1, Math.min(FORTRESS_DEFENSE_MAX_RANGE, Math.round(value)));
  return (
    <div className="flex justify-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((pip) => (
        <span key={pip} className={cn("h-1 w-2 rounded-full", pip <= closeness ? "bg-rose-200/82" : "bg-white/12")} />
      ))}
    </div>
  );
}

export function FloatingNumber({
  tone,
  className,
  children,
}: {
  tone: "damage" | "heal" | "shield" | "ko";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("frontline-float-fx pointer-events-none absolute z-[8] -translate-x-1/2 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] shadow-[0_12px_26px_rgba(0,0,0,0.34)]", floatingToneClass(tone), className)}>
      {children}
    </div>
  );
}

function GarrisonGuardFallbackFigure() {
  return (
    <div className="relative z-[2] h-[3.65rem] w-[2.85rem] sm:h-[4.8rem] sm:w-[3.3rem]" aria-hidden="true">
      <div className="absolute left-1/2 top-0 h-5 w-7 -translate-x-1/2 rounded-t-[16px] border border-cyan-100/34 bg-[linear-gradient(180deg,#d9f5ff,#627586_62%,#1d2732)] shadow-[0_0_14px_rgba(101,210,200,0.24)] sm:h-6 sm:w-8" />
      <div className="absolute left-1/2 top-3 h-5 w-8 -translate-x-1/2 rounded-[12px] border border-cyan-100/22 bg-[linear-gradient(180deg,#80909f,#23313f)] sm:top-4 sm:h-6 sm:w-9" />
      <div className="absolute left-1/2 top-[1.7rem] h-7 w-9 -translate-x-1/2 rounded-b-[14px] rounded-t-[10px] border border-cyan-100/28 bg-[linear-gradient(180deg,#425466,#111923)] sm:top-[2.15rem] sm:h-9 sm:w-10" />
      <div className="absolute left-[-0.1rem] top-[1.55rem] h-9 w-5 -rotate-12 rounded-b-[13px] rounded-t-[9px] border border-[#f5d498]/34 bg-[linear-gradient(180deg,#f5d498,#8f5d2c_64%,#281c12)] shadow-[0_0_14px_rgba(245,196,81,0.18)] sm:top-[2rem] sm:h-10 sm:w-6" />
      <div className="absolute right-[-0.05rem] top-[1.65rem] h-8 w-2.5 rotate-12 rounded-full bg-[linear-gradient(180deg,#d7e8f0,#465969)] sm:top-[2.1rem] sm:h-10" />
      <div className="absolute right-[-0.25rem] top-[1.05rem] h-9 w-1 rotate-[24deg] rounded-full bg-[#d8e9ef] shadow-[0_0_10px_rgba(216,233,239,0.16)] sm:top-[1.45rem] sm:h-11" />
      <div className="absolute bottom-0 left-[0.95rem] h-3 w-1.5 rounded-full bg-[#1c2630] sm:h-4" />
      <div className="absolute bottom-0 right-[0.95rem] h-3 w-1.5 rounded-full bg-[#1c2630] sm:h-4" />
    </div>
  );
}

function floatingToneClass(tone: "damage" | "heal" | "shield" | "ko") {
  if (tone === "heal") return "border-emerald-100/42 bg-emerald-300/18 text-emerald-50";
  if (tone === "shield") return "border-cyan-100/42 bg-cyan-300/16 text-cyan-50";
  if (tone === "ko") return "border-[#f5c451]/48 bg-[#f5c451]/18 text-[#ffe4a8]";
  return "border-rose-100/48 bg-rose-400/18 text-rose-50";
}
