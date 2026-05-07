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
  ArenaSpotlights,
  EmberRain,
  FireworkBursts,
  StarfallLayer,
} from "./SceneBackdropSceneEffects";
import { DeckScene } from "./SceneBackdropDeckScene";
import { FortressScene } from "./SceneBackdropFortressScene";
import { ShopScene } from "./SceneBackdropMarketScene";
import { MissionsScene } from "./SceneBackdropMissionsScene";
import { RosterScene } from "./SceneBackdropRosterScene";
import {
  BannerStack,
  CrystalCluster,
  CrystalTree,
  FestivalTent,
  ForgeOutpost,
  GrandArch,
  LavaRibbon,
  Moon,
  MoonTempleSteps,
  MountainLayer,
  ObsidianSpire,
  PortalGlow,
  ProcessionLanterns,
  RiverGlow,
  RuinedGate,
  SignalFire,
  SunOrb,
  TorchPair,
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

function AdventureMoonScene() {
  return (
    <>
      <Moon top="13%" left="71%" size="11rem" />
      <StarfallLayer tone="sky" />
      <RiverGlow tone="rgba(129,198,255,0.2)" />
      <MountainLayer
        className="absolute bottom-[29%] left-[-8%] right-[-8%] h-[34%] opacity-95"
        fill="linear-gradient(180deg,#1b294a 0%,#12203a 54%,#0a1120 100%)"
        points="0,100 8,62 16,58 24,40 32,48 41,31 48,44 56,24 63,38 72,16 81,42 90,28 100,38 100,100"
      />
      <MountainLayer
        className="absolute bottom-[18%] left-[-12%] right-[-12%] h-[32%] opacity-100"
        fill="linear-gradient(180deg,#26365f 0%,#16233d 48%,#09111d 100%)"
        points="0,100 10,54 18,66 28,36 36,52 45,30 53,38 60,20 71,46 79,30 88,44 100,24 100,100"
      />
      <RuinedGate left="19%" bottom="29%" scale={1} />
      <RuinedGate left="69%" bottom="31%" scale={0.8} />
      <MoonTempleSteps />
      <CrystalCluster left="54%" bottom="26%" tone="sky" />
      <CrystalCluster left="33%" bottom="23%" tone="amber" />
    </>
  );
}

function AdventureAshScene() {
  return (
    <>
      <SunOrb />
      <EmberRain />
      <LavaRibbon />
      <MountainLayer
        className="absolute bottom-[28%] left-[-8%] right-[-8%] h-[36%] opacity-95"
        fill="linear-gradient(180deg,#56362d 0%,#2f2021 54%,#140f19 100%)"
        points="0,100 8,58 18,66 28,36 36,44 46,22 53,36 60,18 69,40 78,30 86,44 100,20 100,100"
      />
      <MountainLayer
        className="absolute bottom-[16%] left-[-12%] right-[-12%] h-[36%]"
        fill="linear-gradient(180deg,#6a4532 0%,#3e2420 52%,#110d17 100%)"
        points="0,100 8,64 14,50 24,60 30,36 40,48 48,22 58,38 66,26 74,46 83,30 92,44 100,32 100,100"
      />
      <ObsidianSpire left="21%" bottom="25%" />
      <ObsidianSpire left="63%" bottom="28%" />
      <ObsidianSpire left="79%" bottom="22%" scale={0.82} />
      <ForgeOutpost />
    </>
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

function ArenaScene() {
  return (
    <>
      <ArenaSpotlights />
      <CrowdBands />
      <ArenaRim />
      <ArenaFloor />
      <VictoryDais />
      <TorchPair />
      <BannerStack left="15%" top="20%" tone="ember" />
      <BannerStack left="77%" top="18%" tone="gold" />
      <Moon top="8%" left="46%" size="7rem" />
      <ArenaPennants />
      <DustSweep />
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

function ArenaRim() {
  return (
    <div className="absolute bottom-[24%] left-[6%] right-[6%] h-[34%] rounded-[50%] border border-white/8 bg-[radial-gradient(circle_at_50%_64%,rgba(121,89,61,0.3),rgba(62,35,30,0.48)_42%,rgba(14,11,18,0.9)_100%)]" />
  );
}

function ArenaFloor() {
  return (
    <>
      <div className="absolute bottom-[14%] left-[16%] right-[16%] h-[16%] rounded-[48%] bg-[radial-gradient(circle,rgba(255,182,109,0.16)_0%,rgba(85,48,29,0.28)_46%,rgba(15,12,17,0.96)_100%)]" />
      <div className="absolute bottom-[18%] left-[24%] right-[24%] h-[8%] rounded-[999px] bg-amber-100/8 blur-md" />
    </>
  );
}

function CrowdBands() {
  return (
    <>
      <div className="absolute bottom-[32%] left-[4%] right-[4%] h-[18%] rounded-[48%] bg-[radial-gradient(circle_at_50%_60%,rgba(91,53,42,0.22),rgba(28,18,24,0.46)_48%,transparent_100%)]" />
      <div className="absolute bottom-[37%] left-[12%] right-[12%] h-[10%] rounded-[48%] bg-[linear-gradient(180deg,rgba(255,204,142,0.08),rgba(30,17,19,0.26))]" />
      {[14, 22, 31, 43, 56, 67, 78, 86].map((left, index) => (
        <div
          key={left}
          className="absolute bottom-[39%] h-4 w-4 rounded-full bg-amber-200/18 blur-[2px] animate-[iconBreath_4.6s_ease-in-out_infinite]"
          style={{ left: `${left}%`, animationDelay: `${index * 0.35}s` }}
        />
      ))}
    </>
  );
}

function VictoryDais() {
  return (
    <>
      <div className="absolute bottom-[18%] left-1/2 h-[12%] w-[20%] -translate-x-1/2 rounded-[40%] border border-amber-200/12 bg-[radial-gradient(circle,rgba(255,192,118,0.22),rgba(91,53,31,0.28)_42%,rgba(14,12,18,0.96)_100%)]" />
      <div className="absolute bottom-[20%] left-1/2 h-[5%] w-[11%] -translate-x-1/2 rounded-[999px] bg-amber-100/12 blur-md" />
    </>
  );
}

function ArenaPennants() {
  return (
    <>
      <BannerStack left="24%" top="14%" tone="gold" />
      <BannerStack left="63%" top="13%" tone="ember" />
    </>
  );
}

function DustSweep() {
  return (
    <>
      <div className="absolute bottom-[15%] left-[22%] h-10 w-[24%] rounded-[999px] bg-orange-100/8 blur-2xl animate-[cloudDrift_18s_linear_infinite]" />
      <div className="absolute bottom-[16%] right-[18%] h-10 w-[28%] rounded-[999px] bg-orange-100/8 blur-2xl animate-[cloudDriftReverse_20s_linear_infinite]" />
    </>
  );
}
