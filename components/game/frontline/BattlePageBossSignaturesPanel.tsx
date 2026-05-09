"use client";

import type { FrontlineBossConfig } from "@/features/frontline/types";
import { useI18n } from "@/lib/i18n/useI18n";
import { BossSignaturePreview, Panel } from "./BattlePagePanels";

export function BattlePageBossSignaturesPanel({ bossConfig }: { bossConfig: FrontlineBossConfig | null }) {
  const { t } = useI18n();

  if (!bossConfig) return null;

  return (
    <Panel title={t("frontline.bossSignaturesTitle")} variant="enemy">
      <div className="grid gap-2">
        {bossConfig.signatures.map((signature, index) => (
          <BossSignaturePreview key={`sig-${index}-${signature.type}`} signature={signature} />
        ))}
      </div>
    </Panel>
  );
}
