"use client";

import { CombatIcon } from "@/components/game/frontline/FrontlineCombatIcon";
import { FORTRESS_DEFENSE_BALANCE } from "@/features/fortress-defense/balance";
import type { FortressDefenseActionDef, FortressDefenseActionId } from "@/features/fortress-defense/engine";
import { cn } from "@/lib/cn";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import type { TranslateFn } from "./fortressPageHelpers";

type FortressDefenseActionDockProps = {
  actions: FortressDefenseActionDef[];
  terminal: boolean;
  busy: boolean;
  selectedActionId: FortressDefenseActionId | null;
  targetingActionId: FortressDefenseActionId | null;
  onActionSelect: (action: FortressDefenseActionDef) => void;
  onCancelTargeting: () => void;
  t: TranslateFn;
};

export function FortressDefenseActionDock({
  actions,
  terminal,
  busy,
  selectedActionId,
  targetingActionId,
  onActionSelect,
  onCancelTargeting,
  t,
}: FortressDefenseActionDockProps) {
  const targetingAction = targetingActionId ? actions.find((action) => action.id === targetingActionId) ?? null : null;
  const targetingPrompt = targetingAction?.targetType === "slot" || targetingAction?.targetType === "lane"
    ? t("fortressScreen.defense.selectSlot")
    : t("fortressScreen.defense.selectTarget");
  return (
    <section className="relative z-20 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,9,13,0.62),rgba(8,9,13,0.28))] p-2 shadow-[0_20px_56px_rgba(0,0,0,0.26)] backdrop-blur-[2px]">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/52">
        <span className="flex items-center gap-2 text-[#f5d498]">
          <CombatIcon name="leader_power" size="sm" className="h-5 w-5" />
          {targetingAction ? targetingPrompt : t("fortressScreen.defense.orderPrompt")}
        </span>
        {targetingAction ? (
          <button type="button" className="frontline-motion-action text-white/48 hover:text-white" onClick={onCancelTargeting}>{t("fortressScreen.defense.cancelTargeting")}</button>
        ) : (
          <span className="text-white/40">{t("fortressScreen.defense.orderHint")}</span>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            action={action}
            disabled={terminal || busy || Boolean(action.disabledReason)}
            selected={(selectedActionId === action.id && busy) || targetingActionId === action.id}
            targeting={targetingActionId === action.id}
            onActionSelect={onActionSelect}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}

function ActionButton({
  action,
  disabled,
  selected,
  targeting,
  onActionSelect,
  t,
}: {
  action: FortressDefenseActionDef;
  disabled: boolean;
  selected: boolean;
  targeting: boolean;
  onActionSelect: (action: FortressDefenseActionDef) => void;
  t: TranslateFn;
}) {
  const showTarget = action.targetType === "enemy" || action.targetType === "lane" || action.targetType === "slot";
  const disabledLabel = actionDisabledLabel(action, t);
  const summary = t(`fortressScreen.defense.actions.${action.id}.summary`);
  const statChips = actionStatChips(action, t);
  return (
    <button
      className={cn(
        "frontline-motion-action group relative min-h-[5.05rem] overflow-visible rounded-[24px] border p-2 text-left transition disabled:cursor-not-allowed disabled:hover:translate-y-0",
        disabled
          ? "border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(5,6,10,0.48))] opacity-62 grayscale-[0.55] shadow-none"
          : cn("fortress-defense-action-ready-fx", actionToneClass(action.tone), "shadow-[0_0_24px_rgba(245,196,81,0.11),0_14px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_0_30px_rgba(245,196,81,0.2),0_18px_38px_rgba(0,0,0,0.28)]"),
        selected && "frontline-card-selected-fx border-[#f5c451]/58 bg-[#f5c451]/16",
      )}
      disabled={disabled}
      title={summary}
      aria-label={`${t(`fortressScreen.defense.actions.${action.id}.label`)}. ${summary}`}
      data-fortress-action={action.id}
      data-fortress-action-target-type={action.targetType}
      data-fortress-action-targeting={targeting ? "true" : "false"}
      data-fortress-action-cooldown={action.currentCooldown}
      data-fortress-action-charges={action.charges ?? ""}
      data-fortress-action-max-charges={action.maxCharges ?? ""}
      data-fortress-action-disabled-reason={action.disabledReason ?? ""}
      onClick={() => onActionSelect(action)}
    >
      {disabledLabel ? <span className="pointer-events-none absolute right-2 top-2 z-[2] rounded-full border border-white/12 bg-black/62 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white/80">{disabledLabel}</span> : null}
      <span className="pointer-events-none absolute -top-3 left-3 z-[8] max-w-[15rem] rounded-[14px] border border-[#f5d498]/18 bg-black/82 px-3 py-2 text-[10px] font-bold leading-4 text-white/78 opacity-0 shadow-[0_18px_38px_rgba(0,0,0,0.34)] backdrop-blur-md transition group-hover:-translate-y-full group-hover:opacity-100 group-focus-visible:-translate-y-full group-focus-visible:opacity-100">
        {summary}
      </span>
      <div className="grid grid-cols-[3.6rem_minmax(0,1fr)] items-center gap-2">
        <div className={cn("grid h-14 w-14 place-items-center rounded-[20px] border bg-black/34 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]", disabled ? "border-white/8 text-white/44" : "border-[#f5d498]/20 text-[#ffe4a8] shadow-[0_0_20px_rgba(245,196,81,0.13)]")}>
          <CombatIcon name={actionIcon(action.id)} size="lg" className="h-12 w-12" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-[12px] font-black uppercase tracking-[0.11em] text-white">{t(`fortressScreen.defense.actions.${action.id}.label`)}</div>
            <span className={cn("shrink-0 rounded-full border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-[0.08em]", targeting ? "border-[#f5c451]/38 bg-[#f5c451]/18 text-[#ffe4a8]" : "border-white/10 bg-black/24 text-white/42")}>
              {showTarget ? (targeting ? t("fortressScreen.defense.targetingActive") : t(`fortressScreen.defense.targetTypes.${action.targetType}`)) : t(`fortressScreen.defense.actionOrigins.${action.id}`)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {statChips.map((chip) => <ActionStatChip key={`${chip.label}-${chip.value}`} {...chip} />)}
          </div>
        </div>
      </div>
    </button>
  );
}

type ActionStatChipProps = {
  label: string;
  value: string;
  tone: "damage" | "guard" | "shield" | "heal" | "buff" | "utility";
};

function ActionStatChip({ label, value, tone }: ActionStatChipProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-[10px] border px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em]", actionStatToneClass(tone))}>
      <span className="text-[11px] leading-none text-white">{value}</span>
      <span>{label}</span>
    </span>
  );
}

function actionStatChips(action: FortressDefenseActionDef, t: TranslateFn): ActionStatChipProps[] {
  const balance = FORTRESS_DEFENSE_BALANCE.actions;
  const cd = (value: string): ActionStatChipProps => ({ value, label: t("fortressScreen.defense.actionStats.cooldown"), tone: "utility" });
  const uses = action.maxCharges ? [{ value: `${action.charges ?? 0}/${action.maxCharges}`, label: t("fortressScreen.defense.actionStats.uses"), tone: "utility" as const }] : [];
  if (action.id === "castle_shot") return [{ value: `${balance.castleShot.damage}`, label: t("fortressScreen.defense.actionStats.damage"), tone: "damage" }, cd("1")];
  if (action.id === "deploy_guard") return [{ value: `${balance.deployGuard.hp}`, label: t("fortressScreen.defense.actionStats.hp"), tone: "guard" }, ...uses, cd("4")];
  if (action.id === "deploy_archer") return [{ value: `${balance.deployArcher.hp}`, label: t("fortressScreen.defense.actionStats.hp"), tone: "guard" }, { value: t("fortressScreen.defense.actionStats.lane"), label: t("fortressScreen.defense.actionStats.range"), tone: "damage" }, ...uses, cd("4")];
  if (action.id === "blade_rush") return [{ value: `${balance.bladeRush.damage}`, label: t("fortressScreen.defense.actionStats.damage"), tone: "damage" }, { value: `+${balance.bladeRush.closeRangeBonus}`, label: t("fortressScreen.defense.actionStats.closeBonus"), tone: "damage" }, { value: `+${balance.bladeRush.followUpDamage}`, label: t("fortressScreen.defense.actionStats.combo"), tone: "damage" }, cd("2")];
  if (action.id === "bulwark") return [{ value: `+${balance.bulwark.castleShield}`, label: t("fortressScreen.defense.actionStats.castle"), tone: "shield" }, { value: `+${balance.bulwark.guardShield}`, label: t("fortressScreen.defense.actionStats.unit"), tone: "shield" }, cd("3")];
  if (action.id === "volley") return [{ value: `${balance.volley.damage}`, label: t("fortressScreen.defense.actionStats.area"), tone: "damage" }, cd("2")];
  if (action.id === "arcane_barrage") return [{ value: `${balance.arcaneBarrage.damage}`, label: t("fortressScreen.defense.actionStats.near"), tone: "damage" }, cd("3")];
  if (action.id === "traps") return [{ value: `${balance.trap.damage}`, label: t("fortressScreen.defense.actionStats.damage"), tone: "damage" }, { value: `${balance.trap.stunTurns}`, label: t("fortressScreen.defense.actionStats.stun"), tone: "buff" }, cd("3")];
  if (action.id === "mend") return [{ value: `+${balance.mend.castleHeal}`, label: t("fortressScreen.defense.actionStats.castle"), tone: "heal" }, { value: `+${balance.mend.guardHeal}`, label: t("fortressScreen.defense.actionStats.unit"), tone: "heal" }, ...uses, cd("4")];
  return [{ value: `+${balance.warChant.morale}`, label: t("fortressScreen.defense.actionStats.morale"), tone: "buff" }, { value: `+${balance.warChant.damageBonus}`, label: t("fortressScreen.defense.actionStats.strike"), tone: "buff" }, cd("2")];
}

function actionToneClass(tone: FortressDefenseActionDef["tone"]) {
  if (tone === "emerald") return "border-emerald-200/18 bg-emerald-300/10 hover:bg-emerald-300/14";
  if (tone === "ember") return "border-rose-200/18 bg-rose-400/10 hover:bg-rose-400/14";
  if (tone === "arcane") return "border-violet-200/18 bg-violet-400/10 hover:bg-violet-400/14";
  if (tone === "steel") return "border-cyan-100/16 bg-cyan-200/8 hover:bg-cyan-200/12";
  return "border-[#f5c451]/18 bg-[#f5c451]/10 hover:bg-[#f5c451]/14";
}

function actionStatToneClass(tone: ActionStatChipProps["tone"]) {
  if (tone === "damage") return "border-rose-100/22 bg-rose-400/14 text-rose-50/88";
  if (tone === "guard") return "border-cyan-100/20 bg-cyan-300/12 text-cyan-50/88";
  if (tone === "shield") return "border-cyan-100/24 bg-cyan-300/14 text-cyan-50";
  if (tone === "heal") return "border-emerald-100/22 bg-emerald-300/14 text-emerald-50";
  if (tone === "buff") return "border-[#f5d498]/24 bg-[#f5c451]/14 text-[#ffe4a8]";
  return "border-white/10 bg-black/24 text-white/62";
}

function actionIcon(actionId: FortressDefenseActionId): CombatAssetIconName {
  if (actionId === "deploy_guard") return "shield";
  if (actionId === "deploy_archer") return "attack";
  if (actionId === "blade_rush") return "attack";
  if (actionId === "bulwark") return "shield";
  if (actionId === "mend") return "heal";
  if (actionId === "arcane_barrage") return "skill";
  if (actionId === "traps") return "danger";
  if (actionId === "war_chant") return "leader_power";
  if (actionId === "volley") return "attack";
  return "target";
}

function actionDisabledLabel(action: FortressDefenseActionDef, t: TranslateFn) {
  if (action.disabledReason === "cooldown") return t("fortressScreen.defense.readyIn", { value: action.currentCooldown });
  if (action.disabledReason === "charges") return t("fortressScreen.defense.noCharges");
  if (action.disabledReason === "noTargets") return t("fortressScreen.defense.noTargets");
  if (action.disabledReason === "fullHp") return t("fortressScreen.defense.fullHp");
  if (action.disabledReason === "maxGuards") return t("fortressScreen.defense.maxGuards");
  return "";
}
