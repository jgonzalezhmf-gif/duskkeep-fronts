import HomePageClient from "@/components/game/HomePageClient";

type HomePageSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: HomePageSearchParams;
}) {
  const resolved = searchParams ? await searchParams : {};
  const qa = firstValue(resolved.qa);
  const clean = firstValue(resolved.clean);
  const effectsEditor = firstValue(resolved.effectsEditor);
  const replayIntro = firstValue(resolved.replayIntro) ?? firstValue(resolved.intro);
  const qaClean = qa === "1" || qa === "true" || qa === "clean" || clean === "1";
  const qaEffects = qa === "effects" || effectsEditor === "1" || effectsEditor === "true";
  const forceIntro = replayIntro === "1" || replayIntro === "true";

  return <HomePageClient qaClean={qaClean} qaEffects={qaEffects} forceIntro={forceIntro} />;
}
