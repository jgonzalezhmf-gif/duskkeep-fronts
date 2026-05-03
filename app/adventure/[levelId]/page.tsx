"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import BattlePageClient from "@/components/game/BattlePageClient";
import { ADVENTURE_BY_ID } from "@/data/adventure";
import { getAdventureNodeDefinition, isAdventureCombatNode } from "@/features/adventure/nodeResolution";
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

  const definition = getAdventureNodeDefinition(level);
  if (!isAdventureCombatNode(definition.type)) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[42rem] flex-col items-center justify-center gap-4 px-4 text-center text-sm text-white/70">
        <div className="rounded-[28px] border border-[#f5d498]/18 bg-black/48 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d498]">{definition.type}</div>
          <h1 className="mt-2 text-2xl font-black text-white">{level.name}</h1>
          <p className="mt-2 text-white/62">{t("adventure.directMapResolution")}</p>
          <Link
            href="/adventure"
            className="mt-5 inline-flex rounded-full border border-[#f5d498]/22 bg-[#f5c451]/12 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498] transition hover:bg-[#f5c451]/18"
          >
            {t("adventure.returnToMap")}
          </Link>
        </div>
      </div>
    );
  }

  return <BattlePageClient adventureLevelId={level.id} />;
}
