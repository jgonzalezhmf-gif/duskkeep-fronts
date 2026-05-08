"use client";

import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import type { FrontlineBattleState, FrontlineBossConfig } from "@/features/frontline/types";
import { CombatIcon } from "./FrontlineCombatIcon";

export function BossBanner({
  boss,
  bossState,
  modifiers,
  cardCostMod,
}: {
  boss: FrontlineBossConfig;
  bossState: NonNullable<FrontlineBattleState["bossState"]>;
  modifiers: { enemyCoreBonus?: number; enemyStartingCommandBonus?: number } | null;
  cardCostMod: number;
}) {
  const { t } = useI18n();
  const inferno = boss.signatures.find((sig) => sig.type === "inferno_wave");
  const veil = boss.signatures.find((sig) => sig.type === "twilight_veil");
  const bossName = t(boss.nameKey);
  const modifierLabels = [
    modifiers?.enemyCoreBonus ? t("frontline.modifierEnemyCore", { amount: modifiers.enemyCoreBonus }) : null,
    modifiers?.enemyStartingCommandBonus ? t("frontline.modifierEnemyCommand", { amount: modifiers.enemyStartingCommandBonus }) : null,
  ].filter(Boolean);

  const infernoBadge =
    inferno && inferno.type === "inferno_wave"
      ? (() => {
          const countdown = bossState.infernoCountdown;
          const ready = countdown <= 1;
          return {
            ready,
            label: ready ? t("frontline.infernoReady") : t("frontline.infernoCharge", { amount: countdown }),
          };
        })()
      : null;
  const twilightBadge =
    veil && veil.type === "twilight_veil"
      ? (() => {
          const countdown = bossState.twilightCountdown;
          const ready = countdown <= 1;
          return {
            ready,
            label: ready ? t("frontline.twilightReady") : t("frontline.twilightCharge", { amount: countdown }),
          };
        })()
      : null;

  return (
    <div
      data-boss-status-banner={boss.id}
      className="relative overflow-hidden rounded-[18px] border border-[#f5c451]/30 bg-[linear-gradient(180deg,rgba(245,140,80,0.1),rgba(40,12,8,0.34))] px-3 py-1.5 text-[#fff0bd] shadow-[0_10px_26px_rgba(245,196,81,0.1)] backdrop-blur-[1px]"
      title={[bossName, ...modifierLabels].join(" | ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.16),transparent_36%)]" />
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <CombatIcon name="leader_power" size="sm" className="h-6 w-6" fallbackClassName="h-6 w-6" />
          <div className="min-w-0 truncate text-[12px] font-black uppercase tracking-[0.18em] md:text-sm">
            {bossName}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {infernoBadge ? (
            <div
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-[10px] font-black uppercase tracking-[0.12em]",
                infernoBadge.ready
                  ? "frontline-power-ready-ring-fx border-rose-200/72 bg-rose-400/24 text-rose-50"
                  : "border-[#f5c451]/56 bg-[#1a0a08]/72 text-[#fff0bd]",
              )}
              title={infernoBadge.label}
            >
              <CombatIcon name="danger" size="xs" fallbackClassName="opacity-90" />
              <span className="ml-1">{infernoBadge.ready ? "!" : bossState.infernoCountdown}</span>
            </div>
          ) : null}
          {twilightBadge ? (
            <div
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-[10px] font-black uppercase tracking-[0.12em]",
                twilightBadge.ready
                  ? "frontline-power-ready-ring-fx border-violet-200/72 bg-violet-400/24 text-violet-50"
                  : "border-violet-300/56 bg-[#160a1f]/72 text-violet-100",
              )}
              title={twilightBadge.label}
            >
              <CombatIcon name="skill" size="xs" fallbackClassName="opacity-90" />
              <span className="ml-1">{twilightBadge.ready ? "!" : bossState.twilightCountdown}</span>
            </div>
          ) : null}
          {cardCostMod > 0 ? (
            <div
              className="inline-flex h-8 items-center justify-center rounded-full border border-violet-300/72 bg-violet-500/24 px-2 text-[10px] font-black uppercase tracking-[0.12em] text-violet-50"
              title={t("frontline.twilightActive", { amount: cardCostMod })}
            >
              +{cardCostMod}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
