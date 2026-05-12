"use client";

import HomeWorldMap, { type HomeHotspot } from "@/components/game/HomeWorldMap";
import { HOME_LANDMARK_LAYOUT, toPx } from "@/components/game/home/homeComposition";
import { GameIntro } from "@/components/game/intro/GameIntro";
import { useI18n } from "@/lib/i18n/useI18n";
import { nextUnlockedLevel, useGameStore } from "@/lib/store";

export default function HomePageClient({ qaClean = false, qaEffects = false }: { qaClean?: boolean; qaEffects?: boolean }) {
  const { t } = useI18n();
  const store = useGameStore();
  const nextLevel = nextUnlockedLevel(store);
  const hasSeenIntro = useGameStore((state) => state.hasSeenIntro);
  const markIntroSeen = useGameStore((state) => state.markIntroSeen);
  const showIntro = store.hydrated && !hasSeenIntro && !qaClean && !qaEffects;

  const hotspots: HomeHotspot[] = [
    {
      zoneId: "fortress",
      href: "/fortress",
      label: t("home.hotspots.fortress.label"),
      sublabel: t("home.hotspots.fortress.sublabel"),
      icon: "fortress",
      landmarkId: "fortress",
      tone: "gold",
      ...getHomeHotspotLayout("fortress"),
    },
    {
      zoneId: "arena",
      href: "/arena",
      label: t("home.hotspots.arena.label"),
      sublabel: t("home.hotspots.arena.sublabel"),
      icon: "arena",
      modeIcon: "arena_draft",
      landmarkId: "arena",
      tone: "sky",
      ...getHomeHotspotLayout("arena"),
    },
    {
      zoneId: "events",
      href: "/events",
      label: t("home.hotspots.events.label"),
      sublabel: t("home.hotspots.events.sublabel"),
      icon: "events",
      modeIcon: "daily_event",
      landmarkId: "events",
      tone: "violet",
      ...getHomeHotspotLayout("events"),
    },
    {
      zoneId: "deck",
      href: "/deck",
      label: t("home.hotspots.deck.label"),
      sublabel: t("home.hotspots.deck.sublabel"),
      icon: "deck",
      landmarkId: "deck",
      tone: "gold",
      ...getHomeHotspotLayout("deck"),
    },
    {
      zoneId: "market",
      href: "/shop",
      label: t("home.hotspots.market.label"),
      sublabel: t("home.hotspots.market.sublabel"),
      icon: "market",
      landmarkId: "market",
      tone: "emerald",
      ...getHomeHotspotLayout("market"),
    },
    {
      zoneId: "adventure",
      href: "/adventure",
      label: t("home.hotspots.adventure.label"),
      sublabel: t("home.hotspots.adventure.sublabel"),
      icon: "adventure",
      modeIcon: "campaign",
      landmarkId: "adventure",
      tone: "rose",
      ...getHomeHotspotLayout("adventure"),
      badge: nextLevel ? `${nextLevel.chapter}-${nextLevel.index}` : "OK",
    },
  ];

  return (
    <>
      <HomeWorldMap hotspots={hotspots} tutorialOpen={!store.onboarding.completed} qaClean={qaClean} qaEffects={qaEffects} />
      {showIntro ? <GameIntro onDone={markIntroSeen} /> : null}
    </>
  );
}

function getHomeHotspotLayout(id: keyof typeof HOME_LANDMARK_LAYOUT) {
  const layout = HOME_LANDMARK_LAYOUT[id];

  return {
    anchorX: toPx(layout.x + layout.hotspotDx),
    anchorY: toPx(layout.y + layout.hotspotDy),
    mobileAnchorX: toPx(layout.x + layout.hotspotDx),
    mobileAnchorY: toPx(layout.y + layout.hotspotDy),
    width: toPx(layout.hotspotWidth),
    height: toPx(layout.hotspotHeight),
    mobileWidth: toPx(layout.hotspotWidth),
    mobileHeight: toPx(layout.hotspotHeight),
    plaqueWidth: toPx(layout.plaqueWidth),
    mobilePlaqueWidth: toPx(layout.plaqueWidth),
    labelDx: toPx(layout.labelDx),
    labelDy: toPx(layout.labelDy),
    mobileLabelDx: toPx(layout.labelDx),
    mobileLabelDy: toPx(layout.labelDy),
  };
}
