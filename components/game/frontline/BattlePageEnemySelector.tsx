"use client";

import type { FrontlinePreset } from "@/features/frontline/types";
import { frontlinePresetName } from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import { cn } from "@/lib/cn";
import { getFrontlineEnemyLeaderPortraitForPreset } from "@/lib/frontlineLeaderPortraitAssets";
import { EnemyMini } from "./BattlePageMatchup";
import { Panel } from "./BattlePagePanels";

export function BattlePageEnemySelector({
  presets,
  selectedPresetId,
  onSelect,
}: {
  presets: FrontlinePreset[];
  selectedPresetId: string;
  onSelect: (presetId: string) => void;
}) {
  const { t } = useI18n();

  return (
    <Panel title={t("frontline.chooseEnemy")} variant="enemy">
      <div className="grid gap-3">
        {presets.map((preset) => {
          const leaderPortrait = getFrontlineEnemyLeaderPortraitForPreset(preset);
          return (
            <button
              key={preset.id}
              className={cn(
                "rounded-[24px] border px-4 py-3 text-left transition hover:-translate-y-0.5",
                preset.id === selectedPresetId
                  ? "border-[#f5c451]/28 bg-[linear-gradient(180deg,rgba(245,196,81,0.14),rgba(20,16,18,0.9))] shadow-[0_14px_32px_rgba(245,196,81,0.08)]"
                  : "border-white/10 bg-white/[0.035]",
              )}
              onClick={() => onSelect(preset.id)}
            >
              <div className="flex items-center gap-3">
                <img
                  src={leaderPortrait}
                  alt=""
                  className="h-12 w-10 shrink-0 rounded-[14px] border border-rose-200/16 bg-black/24 object-cover shadow-[0_10px_22px_rgba(0,0,0,0.24)]"
                  loading="lazy"
                  aria-hidden
                />
                <div className="min-w-0">
                  <div className="truncate text-base font-black text-white">{frontlinePresetName(t, preset)}</div>
                  <div className="mt-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#f5d498]/72">
                    {t("frontline.enemy")}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex -space-x-3">
                {preset.squad.map((combatantId, index) => (
                  <EnemyMini key={`${preset.id}-${combatantId}-${index}`} combatantId={combatantId} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
