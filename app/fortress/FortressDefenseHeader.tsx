import { CombatIcon } from "@/components/game/frontline/FrontlineCombatIcon";
import { FortressIcon } from "@/components/game/shared/FortressIcon";
import type { FortressDefenseState } from "@/features/fortress-defense/engine";
import { cn } from "@/lib/cn";
import type { DefenseVisualPhase } from "./fortressDefenseVisualEvents";
import type { TranslateFn } from "./fortressPageHelpers";

type FortressDefenseHeaderProps = {
  state: FortressDefenseState;
  visualPhase: DefenseVisualPhase;
  terminal: boolean;
  outcomeHeadline: string;
  onRetreat: () => void;
  t: TranslateFn;
};

export function FortressDefenseHeader({
  state,
  visualPhase,
  terminal,
  outcomeHeadline,
  onRetreat,
  t,
}: FortressDefenseHeaderProps) {
  return (
    <header className="relative z-30 grid gap-2 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,9,13,0.38),rgba(8,9,13,0.12))] p-2.5 shadow-[0_18px_42px_rgba(0,0,0,0.18)] backdrop-blur-[2px] lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
      <button
        className="frontline-motion-action inline-flex justify-self-start rounded-[18px] border border-white/12 bg-black/32 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/72 transition hover:border-[#f5c451]/24 hover:text-[#ffe4a8]"
        onClick={onRetreat}
      >
        {t("fortressScreen.defense.retreat")}
      </button>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#f5d498]/76">
          <span>{t("fortressScreen.defense.wave", { current: state.wave, total: state.maxWaves })}</span>
          <span className="rounded-full border border-white/10 bg-black/24 px-2 py-0.5 text-white/58">{t(`fortressScreen.defense.phases.${visualPhase}`)}</span>
        </div>
        <h1 className="mt-0.5 truncate text-[1.22rem] font-black leading-none text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.42)] sm:text-[1.45rem] md:text-[2.1rem]">
          {terminal ? outcomeHeadline : t("fortressScreen.defense.battleTitle")}
        </h1>
      </div>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 lg:min-w-[29rem]">
        <HudPip icon="keep" label={t("fortressScreen.defense.castleLife")} value={`${Math.max(0, state.castleHp)}/${state.maxCastleHp}`} tone="gold" />
        <HudPip icon="watchtower" label={t("fortressScreen.defense.shield")} value={state.shield} tone="cyan" />
        <HudPip icon="garrison" label={t("fortressScreen.defense.morale")} value={state.morale} tone="emerald" />
        <HudPip icon="raid" label={t("fortressScreen.defense.pressure")} value={state.raidPressure} tone="ember" />
      </div>
      <PhaseTrack phase={visualPhase} />
    </header>
  );
}

function HudPip({
  icon,
  label,
  value,
  tone,
}: {
  icon: "keep" | "watchtower" | "garrison" | "raid";
  label: string;
  value: string | number;
  tone: "gold" | "cyan" | "emerald" | "ember";
}) {
  return (
    <div className={cn("rounded-[16px] border bg-black/22 px-2 py-1.5 backdrop-blur-[1px]", hudToneClass(tone))}>
      <div className="flex items-center justify-center gap-1.5 sm:justify-start">
        <FortressIcon name={icon} size="sm" />
        <div className="min-w-0 text-center sm:text-left">
          <div className="hidden truncate text-[8px] font-black uppercase tracking-[0.12em] text-white/42 sm:block">{label}</div>
          <div className="text-[10px] font-black text-white sm:mt-0.5 sm:text-sm">{value}</div>
        </div>
      </div>
    </div>
  );
}

function PhaseTrack({ phase }: { phase: DefenseVisualPhase }) {
  const steps: Array<{ key: "resolvingOrder" | "enemyAdvancing" | "castleHit"; icon: "attack" | "move" | "danger" }> = [
    { key: "resolvingOrder", icon: "attack" },
    { key: "enemyAdvancing", icon: "move" },
    { key: "castleHit", icon: "danger" },
  ];
  const activeKey = phase === "enemyAttacking" ? "castleHit" : phase === "idle" || phase === "waveIncoming" ? null : phase;

  return (
    <div className="flex items-center gap-2 rounded-[18px] border border-white/10 bg-black/20 px-2.5 py-1.5 lg:col-span-3">
      {steps.map((step, index) => (
        <div key={step.key} className="flex flex-1 items-center gap-2">
          <span className={cn("grid h-7 w-7 place-items-center rounded-full border transition", activeKey === step.key ? "border-[#f5c451]/44 bg-[#f5c451]/16 text-[#ffe4a8] shadow-[0_0_18px_rgba(245,196,81,0.18)]" : "border-white/10 bg-white/[0.04] text-white/32")}>
            <CombatIcon name={step.icon} size="sm" className="h-4 w-4" />
          </span>
          {index < steps.length - 1 ? <span className={cn("h-px flex-1", activeKey === steps[index + 1]?.key || activeKey === step.key ? "bg-[#f5c451]/34" : "bg-white/10")} /> : null}
        </div>
      ))}
    </div>
  );
}

function hudToneClass(tone: "gold" | "cyan" | "emerald" | "ember") {
  if (tone === "cyan") return "border-cyan-100/12 shadow-[inset_0_1px_0_rgba(101,210,200,0.06)]";
  if (tone === "emerald") return "border-emerald-100/12 shadow-[inset_0_1px_0_rgba(93,211,158,0.06)]";
  if (tone === "ember") return "border-rose-100/12 shadow-[inset_0_1px_0_rgba(240,95,114,0.06)]";
  return "border-[#f5c451]/14 shadow-[inset_0_1px_0_rgba(245,196,81,0.08)]";
}
