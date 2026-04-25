"use client";

import { useParams } from "next/navigation";
import BattlePageClient from "@/components/game/BattlePageClient";
import { ADVENTURE_BY_ID } from "@/data/adventure";
import { useI18n } from "@/lib/i18n/useI18n";

export default function AdventureFrontlineGatePage() {
  const { t } = useI18n();
  const params = useParams<{ levelId: string }>();
  const level = ADVENTURE_BY_ID[params.levelId];

  if (!level) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[64rem] items-center justify-center px-4 text-sm text-white/70">
        {t("adventure.unknownLevel")}
      </div>
    );
  }

  return <BattlePageClient adventureLevelId={level.id} />;
}
