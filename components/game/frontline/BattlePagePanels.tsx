"use client";

import type { ReactNode } from "react";
import type { FrontlineBossSignature } from "@/features/frontline/types";
import { cn } from "@/lib/cn";
import type { FrontlineBattleStats } from "@/lib/frontlineBattleStats";
import { useI18n } from "@/lib/i18n/useI18n";
import { ProgressionIcon, type ProgressionIconName } from "@/components/game/shared/ProgressionIcon";
import { ResourceIcon, type ResourceIconKind } from "@/components/game/shared/ResourceIcon";

export function Panel({ title, children, variant = "neutral" }: { title: string; children: ReactNode; variant?: "neutral" | "stage" | "enemy" }) {
  const surface =
    variant === "stage"
      ? "border-[#f5d498]/14 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,196,81,0.11),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.052),rgba(8,10,16,0.9))]"
      : variant === "enemy"
        ? "border-rose-200/12 bg-[radial-gradient(ellipse_at_50%_0%,rgba(240,95,114,0.11),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(8,8,14,0.92))]"
        : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(8,10,16,0.9))]";
  return (
    <section className={cn("rounded-[30px] border p-4 shadow-[0_20px_44px_rgba(0,0,0,0.24)]", surface)}>
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]">{title}</div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function EmptyCard() {
  const { t } = useI18n();
  return (
    <div className="grid min-h-[12rem] place-items-center rounded-[24px] border border-dashed border-white/12 bg-white/[0.025] px-3 text-center">
      <div>
        <div className="mx-auto h-12 w-12 rounded-[18px] border border-white/10 bg-white/[0.04]" />
        <div className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/42">{t("frontline.emptyCardSlot")}</div>
      </div>
    </div>
  );
}

export function BattleStatsPanel({ stats }: { stats: FrontlineBattleStats }) {
  const { t } = useI18n();
  return (
    <div className="mt-3 rounded-[18px] border border-white/10 bg-black/22 px-3 py-3">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/52">
        <ProgressionIcon name="reward_chest" size="sm" />
        {t("frontline.statsTitle")}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <BattleStatTile label={t("frontline.statsRounds")} value={stats.rounds} />
        <BattleStatTile label={t("frontline.statsDamageDealt")} value={stats.damageDealtByAlly} />
        <BattleStatTile label={t("frontline.statsDamageTaken")} value={stats.damageDealtByEnemy} />
        <BattleStatTile label={t("frontline.statsHealing")} value={stats.healingByAlly} />
        <BattleStatTile label={t("frontline.statsKnockouts")} value={stats.knockoutsByAlly} />
        <BattleStatTile label={t("frontline.statsBreaches")} value={stats.breachesByAlly} />
        {stats.bossSignaturesFired > 0 ? (
          <BattleStatTile label={t("frontline.statsBossSignatures")} value={stats.bossSignaturesFired} />
        ) : null}
        {stats.cardsExhausted > 0 ? (
          <BattleStatTile label={t("frontline.statsExhausted")} value={stats.cardsExhausted} />
        ) : null}
      </div>
    </div>
  );
}

function BattleStatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[14px] border border-white/8 bg-white/[0.03] px-2.5 py-2">
      <div className="text-[9px] uppercase tracking-[0.16em] text-white/44">{label}</div>
      <div className="mt-0.5 text-base font-black text-white tabular-nums">{value}</div>
    </div>
  );
}

export function BossSignaturePreview({ signature }: { signature: FrontlineBossSignature }) {
  const { t } = useI18n();
  const meta = describeSignature(t, signature);
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-violet-200/24 bg-[linear-gradient(180deg,rgba(120,80,180,0.3),rgba(14,8,22,0.94))] px-3 py-3 shadow-[0_14px_26px_rgba(0,0,0,0.22)]">
      <div className="pointer-events-none absolute -right-5 -top-6 h-14 w-14 rounded-full bg-violet-300/16 blur-xl" />
      <div className="relative z-[1] flex items-center gap-2">
        <ProgressionIcon name={meta.icon} size="md" />
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-100/72">{meta.tagline}</div>
          <div className="text-[13px] font-black leading-tight text-white">{meta.label}</div>
        </div>
      </div>
      <div className="relative z-[1] mt-2 text-[11px] leading-snug text-violet-50/82">{meta.description}</div>
    </div>
  );
}

function describeSignature(t: (key: string, params?: Record<string, string | number>) => string, signature: FrontlineBossSignature): {
  label: string;
  description: string;
  tagline: string;
  icon: ProgressionIconName;
} {
  switch (signature.type) {
    case "inferno_wave":
      return {
        label: t("frontline.signatureInfernoLabel"),
        description: t("frontline.signatureInfernoDescription", { cadence: signature.cadenceRounds, damage: signature.damagePerHero }),
        tagline: t("frontline.signatureCadenceTagline"),
        icon: "level_up",
      };
    case "twilight_veil":
      return {
        label: t("frontline.signatureTwilightLabel"),
        description: t("frontline.signatureTwilightDescription", { cadence: signature.cadenceRounds, bonus: signature.cardCostBonus, duration: signature.durationTurns }),
        tagline: t("frontline.signatureCadenceTagline"),
        icon: "tier_up",
      };
    case "ember_crown":
      return {
        label: t("frontline.signatureEmberLabel"),
        description: t("frontline.signatureEmberDescription", { count: signature.minSegmentsAlive, atk: signature.atkBonus }),
        tagline: t("frontline.signaturePassiveTagline"),
        icon: "star",
      };
    case "soul_drain":
      return {
        label: t("frontline.signatureSoulDrainLabel"),
        description: t("frontline.signatureSoulDrainDescription", { heal: signature.healPerHit }),
        tagline: t("frontline.signaturePassiveTagline"),
        icon: "claim",
      };
    case "veil_armor":
      return {
        label: t("frontline.signatureVeilArmorLabel"),
        description: t("frontline.signatureVeilArmorDescription", { count: signature.minSegmentsAlive, reduction: signature.damageReduction }),
        tagline: t("frontline.signaturePassiveTagline"),
        icon: "evolve",
      };
    case "cinder_mark":
      return {
        label: t("frontline.signatureCinderMarkLabel"),
        description: t("frontline.signatureCinderMarkDescription", { damage: signature.damagePerStack }),
        tagline: t("frontline.signaturePassiveTagline"),
        icon: "unlock",
      };
  }
}

export function RewardPreview({
  label,
  value,
  icon,
  progressionIcon,
  tone,
}: {
  label: string;
  value: number;
  icon?: ResourceIconKind;
  progressionIcon?: ProgressionIconName;
  tone: "gold" | "dust" | "gems" | "xp" | "card";
}) {
  const surface =
    tone === "gold"
      ? "border-amber-200/18 bg-[radial-gradient(circle_at_50%_20%,rgba(255,225,130,0.24),rgba(52,33,10,0.9))]"
      : tone === "gems"
        ? "border-sky-200/18 bg-[radial-gradient(circle_at_50%_20%,rgba(101,211,255,0.24),rgba(10,30,52,0.9))]"
        : tone === "dust"
          ? "border-violet-200/18 bg-[radial-gradient(circle_at_50%_20%,rgba(204,173,255,0.22),rgba(28,14,52,0.9))]"
          : tone === "card"
            ? "border-[#f5c451]/20 bg-[radial-gradient(circle_at_50%_20%,rgba(245,196,81,0.2),rgba(48,30,11,0.9))]"
            : "border-emerald-200/18 bg-[radial-gradient(circle_at_50%_20%,rgba(96,255,174,0.2),rgba(8,42,30,0.9))]";

  return (
    <div className={cn("flex items-center gap-2 rounded-[20px] border px-3 py-3 shadow-[0_12px_24px_rgba(0,0,0,0.18)]", surface)}>
      {icon ? <ResourceIcon kind={icon} size="medium" className="h-9 w-9" /> : null}
      {progressionIcon ? <ProgressionIcon name={progressionIcon} size="md" /> : null}
      <div>
        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/48">{label}</div>
        <div className="mt-1 text-2xl font-black text-white">{value}</div>
      </div>
    </div>
  );
}

export function ResultMetric({ label, value, finalValue, icon }: { label: string; value: number; finalValue?: number; icon?: ProgressionIconName }) {
  const { t } = useI18n();
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/42">
        {icon ? <ProgressionIcon name={icon} size="sm" /> : null}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-black text-white">{value}</div>
      {typeof finalValue === "number" ? (
        <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/40">{t("frontline.finalLabel")} {finalValue}</div>
      ) : null}
    </div>
  );
}
