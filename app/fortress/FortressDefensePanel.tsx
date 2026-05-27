"use client";

import { FortressIcon } from "@/components/game/shared/FortressIcon";
import {
  createFortressDefenseClaimPayload,
  getFortressDefenseActions,
  getFortressDefenseOutcome,
  type FortressDefenseActionId,
  type FortressDefenseState,
} from "@/features/fortress-defense/engine";
import { cn } from "@/lib/cn";
import type { FrontlineFortressOutcome, Rewards } from "@/lib/types";
import { outcomeMeta, type TranslateFn } from "./fortressPageHelpers";
import { PressureBar, RewardRow } from "./FortressPrimitives";

export function FortressDefensePanel({
  raidReady,
  nextAttackLabel,
  forecast,
  defenseRewards,
  defenseState,
  claimPending,
  onStartDefense,
  onAction,
  onClaim,
  t,
}: {
  raidReady: boolean;
  nextAttackLabel: string;
  forecast: { attackPower: number; defensePower: number; outcome: FrontlineFortressOutcome; rewards: Rewards };
  defenseRewards?: Rewards;
  defenseState: FortressDefenseState | null;
  claimPending: boolean;
  onStartDefense: () => void;
  onAction: (actionId: FortressDefenseActionId, targetId?: string) => void;
  onClaim: () => void;
  t: TranslateFn;
}) {
  if (!defenseState) {
    const forecastState = outcomeMeta(forecast.outcome, t);
    const max = Math.max(forecast.attackPower, forecast.defensePower, 1);
    return (
      <div className={cn("relative overflow-hidden rounded-[22px] border p-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.22)]", forecastState.panel)}>
        <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/14 blur-2xl" />
        <div className="relative z-[1] flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/44">{t("fortressScreen.defense.watch")}</div>
            <div className="mt-1 text-lg font-black text-white">{raidReady ? t("fortressScreen.defense.ready") : nextAttackLabel}</div>
          </div>
          <FortressIcon name="raid" size="lg" />
        </div>

        <div className="relative z-[1] mt-2.5 space-y-2">
          <PressureBar label={t("fortressScreen.metrics.raid")} value={forecast.attackPower} max={max} tone="enemy" />
          <PressureBar label={t("fortressScreen.metrics.walls")} value={forecast.defensePower} max={max} tone="ally" />
        </div>

        <RewardRow rewards={forecast.rewards} className="relative z-[1] mt-2.5" t={t} />

        <div className="relative z-[1] mt-2.5 grid grid-cols-3 gap-1.5 text-center text-[8px] font-black uppercase tracking-[0.12em] text-white/54">
          <span className="rounded-full border border-white/10 bg-black/22 px-2 py-1">{t("fortressScreen.defense.ruleWaves")}</span>
          <span className="rounded-full border border-white/10 bg-black/22 px-2 py-1">{t("fortressScreen.defense.ruleCastle")}</span>
          <span className="rounded-full border border-white/10 bg-black/22 px-2 py-1">{t("fortressScreen.defense.ruleGuards")}</span>
        </div>

        <button
          className="frontline-motion-action frontline-feedback-claim relative z-[1] mt-2.5 w-full overflow-hidden rounded-[18px] border border-[#f8d57b]/28 bg-[linear-gradient(180deg,#fff0bc_0%,#f5c451_46%,#b96d1f_100%)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#221102] shadow-[0_16px_30px_rgba(245,196,81,0.2)] transition disabled:opacity-40 disabled:hover:translate-y-0"
          disabled={!raidReady}
          onClick={onStartDefense}
        >
          {raidReady ? t("fortressScreen.defense.start") : t("fortressScreen.raid.notReady")}
        </button>
      </div>
    );
  }

  const outcome = getFortressDefenseOutcome(defenseState);
  const terminal = defenseState.status !== "active";
  const outcomeState = outcomeMeta(outcome, t);
  const hpMax = Math.max(1, defenseState.maxCastleHp);
  const claimPayload = terminal ? createFortressDefenseClaimPayload(defenseState) : null;

  return (
    <div className={cn("relative overflow-hidden rounded-[22px] border p-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.24)]", terminal ? outcomeState.panel : "border-[#f5c451]/18 bg-[linear-gradient(180deg,rgba(245,196,81,0.12),rgba(8,11,18,0.88))]")}>
      <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#f5c451]/16 blur-2xl" />
      <div className="relative z-[1] flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]/78">{t("fortressScreen.defense.title")}</div>
          <div className="mt-1 text-lg font-black text-white">
            {terminal ? outcomeState.headline : t("fortressScreen.defense.wave", { current: defenseState.wave, total: defenseState.maxWaves })}
          </div>
        </div>
        <FortressIcon name={terminal && outcome === "breach" ? "repair" : "watchtower"} size="lg" />
      </div>

      <div className="relative z-[1] mt-2.5 space-y-2">
        <PressureBar label={t("fortressScreen.defense.castleLife")} value={defenseState.castleHp} max={hpMax} tone={outcome === "breach" ? "enemy" : "ally"} />
        {defenseState.shield > 0 ? <PressureBar label={t("fortressScreen.defense.shield")} value={defenseState.shield} max={32} tone="ally" /> : null}
      </div>

      <div className="relative z-[1] mt-2.5 grid gap-1.5">
        {defenseState.enemies.slice(0, 4).map((enemy) => (
          <div key={enemy.id} className="grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-2 rounded-[14px] border border-white/10 bg-black/24 px-2 py-1.5">
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.1em]">
                <span className="truncate text-white">{enemy.name}</span>
                <span className="text-white/48">{t("fortressScreen.defense.distance", { value: enemy.range })}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/42">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#d95764,#ffab8a)]" style={{ width: `${Math.max(7, (enemy.hp / enemy.maxHp) * 100)}%` }} />
              </div>
            </div>
            <div className="text-right text-[10px] font-black text-white/62">
              {Math.max(0, enemy.hp)}/{enemy.maxHp}
            </div>
          </div>
        ))}
      </div>

      {terminal && claimPayload ? (
        <>
          <RewardRow rewards={defenseRewards ?? forecast.rewards} className="relative z-[1] mt-2.5" t={t} />
          <button
            className="frontline-motion-action frontline-feedback-claim relative z-[1] mt-2.5 w-full rounded-[18px] border border-[#f8d57b]/28 bg-[linear-gradient(180deg,#fff0bc_0%,#f5c451_46%,#b96d1f_100%)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#221102] transition disabled:opacity-50"
            disabled={claimPending}
            onClick={onClaim}
          >
            {claimPending ? t("fortressScreen.defense.claiming") : t("fortressScreen.defense.claim")}
          </button>
        </>
      ) : (
        <div className="relative z-[1] mt-2.5 grid grid-cols-2 gap-1.5">
          {getFortressDefenseActions(defenseState).map((action) => (
            <button
              key={action.id}
              className={cn(
                "frontline-motion-action rounded-[16px] border px-2 py-2 text-left transition",
                action.tone === "emerald"
                  ? "border-emerald-200/18 bg-emerald-300/10 hover:bg-emerald-300/14"
                  : action.tone === "ember"
                    ? "border-rose-200/18 bg-rose-400/10 hover:bg-rose-400/14"
                    : action.tone === "arcane"
                      ? "border-violet-200/18 bg-violet-400/10 hover:bg-violet-400/14"
                      : "border-[#f5c451]/16 bg-[#f5c451]/8 hover:bg-[#f5c451]/12",
              )}
              onClick={() => onAction(action.id)}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white">{t(`fortressScreen.defense.actions.${action.id}.label`)}</div>
              <div className="mt-1 line-clamp-2 text-[9px] leading-3 text-white/48">{t(`fortressScreen.defense.actions.${action.id}.summary`)}</div>
            </button>
          ))}
        </div>
      )}

      <div className="relative z-[1] mt-2 max-h-16 overflow-hidden rounded-[14px] border border-white/8 bg-black/18 px-2 py-1.5 text-[9px] leading-4 text-white/46">
        {defenseState.log.slice(-2).map((entry) => (
          <div key={`${entry.turn}-${entry.title}`}>
            <span className="font-black text-white/66">{entry.title}:</span> {entry.detail}
          </div>
        ))}
      </div>
    </div>
  );
}
