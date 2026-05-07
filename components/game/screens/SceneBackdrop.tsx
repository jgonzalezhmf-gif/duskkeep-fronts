"use client";

import { cn } from "@/lib/cn";
import {
  BirdLayer,
  CloudLayer,
  ConstellationDust,
  ParticleField,
  SceneAtmosphere,
  SceneSky,
} from "./SceneBackdropAtmosphere";
import {
  ForegroundMist,
  ForegroundSet,
  TextureVeil,
} from "./SceneBackdropForeground";
import {
  ArcaneWarRoomLandmark,
  AshForgeLandmark,
  CitadelLandmark,
  ColiseumLandmark,
  CommandBoardLandmark,
  FestivalPortalLandmark,
  GrandMarketLandmark,
  HeroHallLandmark,
  MoonSanctumLandmark,
} from "./SceneBackdropCoreLandmarks";
import {
  FireworkBursts,
} from "./SceneBackdropSceneEffects";
import {
  AdventureAshScene,
  AdventureMoonScene,
} from "./SceneBackdropAdventureScenes";
import { ArenaScene } from "./SceneBackdropArenaScene";
import { DeckScene } from "./SceneBackdropDeckScene";
import { FortressScene } from "./SceneBackdropFortressScene";
import { ShopScene } from "./SceneBackdropMarketScene";
import { MissionsScene } from "./SceneBackdropMissionsScene";
import { RosterScene } from "./SceneBackdropRosterScene";
import {
  BannerStack,
  CrystalTree,
  FestivalTent,
  GrandArch,
  Moon,
  MountainLayer,
  PortalGlow,
  ProcessionLanterns,
  SignalFire,
} from "./SceneBackdropWorldProps";

export type ScreenScene =
  | "adventureMoon"
  | "adventureAsh"
  | "events"
  | "shop"
  | "deck"
  | "roster"
  | "missions"
  | "fortress"
  | "arena";

export default function SceneBackdrop({
  scene,
  className,
}: {
  scene: ScreenScene;
  className?: string;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <SceneSky scene={scene} />
      <SceneAtmosphere scene={scene} />
      <CloudLayer />
      <ParticleField scene={scene} />
      <ConstellationDust scene={scene} />
      <BirdLayer />
      {scene === "adventureMoon" ? <AdventureMoonScene /> : null}
      {scene === "adventureAsh" ? <AdventureAshScene /> : null}
      {scene === "events" ? <EventsScene /> : null}
      {scene === "shop" ? <ShopScene /> : null}
      {scene === "deck" ? <DeckScene /> : null}
      {scene === "roster" ? <RosterScene /> : null}
      {scene === "missions" ? <MissionsScene /> : null}
      {scene === "fortress" ? <FortressScene /> : null}
      {scene === "arena" ? <ArenaScene /> : null}
      <LandmarkDetailOverlay scene={scene} />
      <ForegroundSet scene={scene} />
      <ForegroundMist />
      <TextureVeil />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,18,0.08),rgba(6,10,18,0.12)_24%,rgba(6,10,18,0.22)_52%,rgba(6,10,18,0.74)_100%)]" />
    </div>
  );
}

function EventsScene() {
  return (
    <>
      <Moon top="11%" left="76%" size="8rem" />
      <BannerStack left="12%" top="28%" tone="sky" />
      <BannerStack left="74%" top="31%" tone="ember" />
      <PortalGlow />
      <FireworkBursts />
      <GrandArch />
      <ProcessionLanterns />
      <FestivalTent left="17%" bottom="19%" tone="sky" />
      <FestivalTent left="41%" bottom="17%" tone="violet" />
      <FestivalTent left="67%" bottom="19%" tone="gold" />
      <CrystalTree left="11%" bottom="21%" tone="sky" />
      <CrystalTree left="79%" bottom="23%" tone="violet" />
      <SignalFire left="31%" bottom="21%" />
      <SignalFire left="61%" bottom="20%" />
      <MountainLayer
        className="absolute bottom-[14%] left-[-8%] right-[-8%] h-[32%]"
        fill="linear-gradient(180deg,#27355d 0%,#16223f 48%,#09111d 100%)"
        points="0,100 12,54 19,62 28,38 36,46 44,30 52,38 60,22 69,40 80,28 89,44 100,26 100,100"
      />
    </>
  );
}

function LandmarkDetailOverlay({ scene }: { scene: ScreenScene }) {
  if (scene === "adventureMoon") return <MoonSanctumLandmark />;
  if (scene === "adventureAsh") return <AshForgeLandmark />;
  if (scene === "events") return <FestivalPortalLandmark />;
  if (scene === "shop") return <GrandMarketLandmark />;
  if (scene === "deck") return <ArcaneWarRoomLandmark />;
  if (scene === "roster") return <HeroHallLandmark />;
  if (scene === "missions") return <CommandBoardLandmark />;
  if (scene === "fortress") return <CitadelLandmark />;
  return <ColiseumLandmark />;
}
