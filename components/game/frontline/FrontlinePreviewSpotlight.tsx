"use client";

import type { FrontlinePreview } from "@/features/frontline/preview";
import { cn } from "@/lib/cn";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import { useI18n } from "@/lib/i18n/useI18n";
import { CombatIcon } from "./FrontlineCombatIcon";

const PREVIEW_KIND_META: Record<FrontlinePreview["kind"], { tone: string; icon: CombatAssetIconName; positive: boolean }> = {
  heal: { tone: "border-emerald-200/40 bg-emerald-300/14 text-emerald-50", icon: "heal", positive: true },
  shield: { tone: "border-cyan-100/42 bg-cyan-300/14 text-cyan-50", icon: "shield", positive: true },
  buff: { tone: "border-cyan-100/42 bg-cyan-300/14 text-cyan-50", icon: "advantage", positive: true },
  summon: { tone: "border-emerald-100/40 bg-emerald-200/14 text-emerald-50", icon: "summon", positive: true },
  stun: { tone: "border-[#f5c451]/52 bg-[#f5c451]/16 text-[#fff0bd]", icon: "stun", positive: false },
  core: { tone: "border-rose-100/40 bg-rose-400/14 text-rose-50", icon: "breach", positive: false },
  damage: { tone: "border-rose-100/40 bg-rose-400/14 text-rose-50", icon: "attack", positive: false },
};

type PreviewSpotlightProps = {
  preview: FrontlinePreview | null;
  cardName: string | null;
};

export function PreviewSpotlight({ preview, cardName }: PreviewSpotlightProps) {
  const { t } = useI18n();

  if (!preview || !cardName) return null;

  const meta = PREVIEW_KIND_META[preview.kind];
  const sign = meta.positive ? "+" : "-";
  const detail = preview.targetName
    ? typeof preview.targetHpBefore === "number" && typeof preview.targetHpAfter === "number"
      ? `${preview.targetName} (${preview.targetHpBefore}\u2192${preview.targetHpAfter})`
      : preview.targetName
    : preview.note === "to_core"
      ? t("frontline.enemyCore")
      : preview.scope === "all"
        ? t("frontline.allyPower")
        : null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[8.8rem] z-[6] hidden justify-center px-4 md:flex">
      <div
        className={cn(
          "frontline-clash-spotlight-fx relative min-w-[18rem] max-w-[28rem] overflow-hidden rounded-[24px] border px-4 py-2.5 shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur-md",
          meta.tone,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.16),transparent_36%)]" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-black/26 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
            <CombatIcon name={meta.icon} size="lg" className="h-9 w-9" fallbackClassName="h-9 w-9" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/56">{t("frontline.targeting")}</div>
            <div className="mt-0.5 flex items-center gap-2">
              <div className="rounded-full bg-black/34 px-2.5 py-1 text-base font-black text-white">
                {sign}
                {preview.amount}
                {preview.kind === "stun" ? "T" : ""}
              </div>
              <div className="truncate text-[12px] font-bold text-white/82">{cardName}</div>
            </div>
            {detail ? <div className="mt-0.5 truncate text-[11px] text-white/68">{detail}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
