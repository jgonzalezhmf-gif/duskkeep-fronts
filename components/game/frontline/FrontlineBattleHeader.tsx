"use client";

import { ResourceIcon } from "@/components/game/shared/ResourceIcon";
import { getEnemyPreset } from "@/features/frontline/engine";
import type { FrontlineBattleState, FrontlineCardDef, FrontlineEvent, FrontlineLeaderDef } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import {
  getFrontlineEnemyLeaderPortraitForPreset,
  getFrontlineLeaderPortraitSrc,
} from "@/lib/frontlineLeaderPortraitAssets";
import { frontlinePresetName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { CommandPips, CoreShockOverlay, type CoreShockState } from "./FrontlineBattleMeters";
import { impactTone, shouldCoreFlash } from "./FrontlineBattleUiState";
import { CombatIcon } from "./FrontlineCombatIcon";
import { CoreTotem } from "./FrontlineCoreTotem";
import { combatIconForEvent } from "./FrontlineEventFloats";

type ActionState = {
  title: string;
  subtitle: string;
};

type FrontlineBattleHeaderProps = {
  state: FrontlineBattleState;
  displayState: FrontlineBattleState;
  enemyPresetId: string;
  allyLeader: FrontlineLeaderDef;
  allyLeaderPowerName: string;
  allyLeaderPowerDescription: string;
  activeResolutionEvent: FrontlineEvent | null;
  latestImpact: FrontlineEvent | null;
  resolutionActive: boolean;
  coreShock: CoreShockState;
  actionState: ActionState;
  actionsLocked: boolean;
  selectedCard: FrontlineCardDef | null;
  focusedLaneActive: boolean;
  onLeaderPowerClick: () => void;
  onResolveClick: () => void;
  onClearSelection: () => void;
};

export function FrontlineBattleHeader({
  state,
  displayState,
  enemyPresetId,
  allyLeader,
  allyLeaderPowerName,
  allyLeaderPowerDescription,
  activeResolutionEvent,
  latestImpact,
  resolutionActive,
  coreShock,
  actionState,
  actionsLocked,
  selectedCard,
  focusedLaneActive,
  onLeaderPowerClick,
  onResolveClick,
  onClearSelection,
}: FrontlineBattleHeaderProps) {
  const { t } = useI18n();
  const enemyPreset = getEnemyPreset(enemyPresetId);

  return (
    <header className="grid gap-3 lg:grid-cols-[13rem_minmax(0,1fr)_13rem] xl:grid-cols-[15rem_minmax(0,1fr)_15rem]">
      <div className="relative">
        <CoreTotem
          leaderId={state.enemyDeck.leaderId}
          leaderNameOverride={frontlinePresetName(t, enemyPreset)}
          portraitSrc={getFrontlineEnemyLeaderPortraitForPreset(enemyPreset)}
          title={t("frontline.enemyCore")}
          hp={displayState.enemyCoreHp}
          maxHp={state.enemyCoreMaxHp}
          accent="enemy"
          flash={shouldCoreFlash(activeResolutionEvent ?? latestImpact, "ally")}
          powerCooldown={state.enemyDeck.powerCooldown}
        />
        <CoreShockOverlay shock={coreShock} side="enemy" />
      </div>

      <div className="relative self-start overflow-hidden rounded-[24px] border border-[#f5d498]/10 bg-[linear-gradient(135deg,rgba(255,236,185,0.026),rgba(255,255,255,0.006)_45%,rgba(0,0,0,0.055))] px-3 py-2 shadow-[inset_0_1px_0_rgba(245,212,152,0.04),0_10px_26px_rgba(0,0,0,0.1)] backdrop-blur-[1px] md:px-4">
        <div className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,196,81,0.24),transparent)]" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="sr-only">{resolutionActive ? t("frontline.clashLabel") : t("frontline.playerPhase")}</span>
            <span className="rounded-full bg-black/24 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/55">
              {t("frontline.roundLabel", { round: state.round })}
            </span>
            <CommandPips value={state.allyDeck.command} />
          </div>
          {latestImpact ? (
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] shadow-[0_0_28px_rgba(245,196,81,0.12)]",
                impactTone(latestImpact.kind) === "high"
                  ? "bg-[#f5c451]/16 text-[#f5d498]"
                  : "bg-white/[0.055] text-white/62",
              )}
            >
              <CombatIcon name={combatIconForEvent(latestImpact)} size="xs" fallbackClassName="opacity-90" />
              <span>
                {latestImpact.label}
                {typeof latestImpact.amount === "number" ? ` ${latestImpact.amount}` : ""}
              </span>
            </div>
          ) : null}
        </div>

        <span className="sr-only">{actionState.title} - {actionState.subtitle}</span>
        <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
          <button
            className={cn(
              "relative isolate min-h-14 overflow-hidden rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition",
              state.selectedLeaderPower
                ? "border-[#ffe5a4]/70 bg-[radial-gradient(circle_at_28%_20%,rgba(255,248,214,0.9),rgba(245,196,81,0.78)_32%,rgba(86,45,17,0.94)_100%)] text-[#180c05] shadow-[0_0_38px_rgba(245,196,81,0.42)]"
                : "border-[#f5c451]/42 bg-[radial-gradient(circle_at_26%_20%,rgba(255,248,214,0.36),rgba(245,196,81,0.2)_38%,rgba(44,24,12,0.88)_100%)] text-[#fff3c7] shadow-[0_12px_30px_rgba(245,196,81,0.24)] hover:-translate-y-0.5 hover:border-[#ffe5a4]/68 hover:shadow-[0_16px_38px_rgba(245,196,81,0.32)]",
            )}
            disabled={
              actionsLocked ||
              state.allyDeck.usedLeaderPower ||
              state.allyDeck.powerCooldown > 0 ||
              state.allyDeck.command < allyLeader.power.cost
            }
            onClick={onLeaderPowerClick}
            title={allyLeaderPowerDescription}
          >
            <span className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.32),transparent_36%)]" />
            <span className="inline-flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-[#ffe5a4]/48 bg-black/28 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_24px_rgba(245,196,81,0.24)]">
                <CombatIcon name="leader_power" size="lg" className="h-8 w-8" fallbackClassName="opacity-95" />
              </span>
              <span className="hidden max-w-[10rem] truncate sm:inline">{allyLeaderPowerName}</span>
              <ResourceIcon kind="command" size="small" className="h-5 w-5" />
              {allyLeader.power.cost}
            </span>
          </button>
          {(selectedCard || state.selectedLeaderPower || focusedLaneActive) ? (
            <button
              className="rounded-full bg-white/[0.055] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/72 transition hover:bg-white/[0.09]"
              onClick={onClearSelection}
              disabled={actionsLocked}
            >
              {t("frontline.clear")}
            </button>
          ) : null}
          <button
            data-resolve-clash
            className="frontline-resolve-cta-fx rounded-full bg-[linear-gradient(180deg,rgba(74,166,111,0.98),rgba(14,59,38,0.98))] px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_26px_rgba(49,170,107,0.22)] transition hover:-translate-y-0.5 disabled:opacity-40 disabled:[animation:none]"
            disabled={actionsLocked}
            onClick={onResolveClick}
          >
            <span className="inline-flex items-center gap-1.5">
              <CombatIcon name="clash" size="md" className="h-7 w-7" fallbackClassName="opacity-95" />
              {t("frontline.resolveClash")}
            </span>
          </button>
        </div>
      </div>

      <div className="relative">
        <CoreTotem
          leaderId={state.allyDeck.leaderId}
          portraitSrc={getFrontlineLeaderPortraitSrc(state.allyDeck.leaderId)}
          title={t("frontline.yourCore")}
          hp={displayState.allyCoreHp}
          maxHp={state.allyCoreMaxHp}
          accent="ally"
          flash={shouldCoreFlash(activeResolutionEvent ?? latestImpact, "enemy")}
          powerCooldown={state.allyDeck.powerCooldown}
          powerReadyExtra={state.allyDeck.command >= allyLeader.power.cost && !state.allyDeck.usedLeaderPower}
        />
        <CoreShockOverlay shock={coreShock} side="ally" />
      </div>
    </header>
  );
}
