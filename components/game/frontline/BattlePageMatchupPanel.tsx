"use client";

import type { FrontlineHeroDef } from "@/features/frontline/types";
import { useI18n } from "@/lib/i18n/useI18n";
import { BattlePageMatchupGrid } from "./BattlePageMatchup";
import { Panel } from "./BattlePagePanels";

export function BattlePageMatchupPanel({
  allyHeroes,
  enemyHeroes,
}: {
  allyHeroes: Array<FrontlineHeroDef | null>;
  enemyHeroes: Array<FrontlineHeroDef | null>;
}) {
  const { t } = useI18n();

  return (
    <Panel title={t("frontline.frontlineMatchup")} variant="stage">
      <BattlePageMatchupGrid allyHeroes={allyHeroes} enemyHeroes={enemyHeroes} />
    </Panel>
  );
}
