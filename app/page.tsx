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
  const qaClean = qa === "1" || qa === "true" || qa === "clean" || clean === "1";

  return <HomePageClient qaClean={qaClean} />;
}
