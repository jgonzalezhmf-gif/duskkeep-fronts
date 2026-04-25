import BattlePageClient from "@/components/game/BattlePageClient";

type BattlePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BattlePage({ searchParams }: BattlePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const startParam = resolvedSearchParams.start;
  const presetParam = resolvedSearchParams.preset;
  const adventureParam = resolvedSearchParams.adventure;
  const autostart = Array.isArray(startParam) ? startParam.includes("1") : startParam === "1";
  const enemyPresetId = Array.isArray(presetParam) ? presetParam[0] : presetParam;
  const adventureLevelId = Array.isArray(adventureParam) ? adventureParam[0] : adventureParam;

  return <BattlePageClient autostart={autostart} enemyPresetId={enemyPresetId} adventureLevelId={adventureLevelId} />;
}
