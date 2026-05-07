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
import { ShopScene } from "./SceneBackdropMarketScene";
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

function DeckScene() {
  return (
    <>
      <WarTable />
      <CardAurora />
      <MapPedestal left="31%" top="31%" />
      <MapPedestal left="64%" top="33%" scale={0.9} />
      <CandleColumn left="12%" bottom="18%" />
      <CandleColumn left="86%" bottom="18%" />
      <CandleColumn left="20%" bottom="14%" />
      <CandleColumn left="78%" bottom="14%" />
      <ShelfGlow left="11%" top="20%" />
      <ShelfGlow left="83%" top="20%" />
      <BannerStack left="18%" top="16%" tone="ember" />
      <BannerStack left="70%" top="14%" tone="sky" />
      <FloatingCard left="23%" top="29%" rotate={-10} scale={0.96} />
      <FloatingCard left="72%" top="30%" rotate={10} scale={0.9} />
      <ArcaneProjector />
    </>
  );
}

function RosterScene() {
  return (
    <>
      <HeroHallFloor />
      <HallColumns />
      <HeroStatue left="18%" bottom="21%" tone="gold" scale={0.92} />
      <HeroStatue left="34%" bottom="25%" tone="sky" scale={0.82} />
      <HeroStatue left="66%" bottom="25%" tone="violet" scale={0.82} />
      <HeroStatue left="82%" bottom="21%" tone="gold" scale={0.92} />
      <BannerStack left="13%" top="16%" tone="gold" />
      <BannerStack left="76%" top="16%" tone="sky" />
      <RosterRelic left="28%" bottom="17%" />
      <RosterRelic left="70%" bottom="17%" />
      <LineageConstellation />
      <TrainingDummies />
    </>
  );
}

function MissionsScene() {
  return (
    <>
      <MissionMapFloor />
      <ContractBoard />
      <RoutePins />
      <CourierCamp left="16%" bottom="20%" scale={0.92} />
      <CourierCamp left="74%" bottom="19%" scale={0.86} />
      <RewardCrate left="28%" bottom="17%" />
      <RewardCrate left="62%" bottom="18%" />
      <BannerStack left="15%" top="19%" tone="gold" />
      <BannerStack left="73%" top="18%" tone="ember" />
      <SignalFire left="38%" bottom="21%" />
      <SignalFire left="58%" bottom="20%" />
    </>
  );
}

function FortressScene() {
  return (
    <>
      <Moon top="10%" left="74%" size="10rem" />
      <FortressMountainLine />
      <Moat />
      <FortressWalls />
      <CastleKeep />
      <TowerGlow left="32%" bottom="28%" />
      <TowerGlow left="62%" bottom="34%" />
      <TowerGlow left="47%" bottom="40%" />
      <BannerStack left="17%" top="22%" tone="gold" />
      <BannerStack left="78%" top="24%" tone="sky" />
      <WatchFire left="21%" bottom="28%" />
      <WatchFire left="74%" bottom="31%" />
      <SkyBridge />
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

function CardAurora() {
  return (
    <>
      <div className="absolute left-[18%] right-[18%] top-[16%] h-[18%] rounded-[50%] border border-sky-200/8 bg-[radial-gradient(circle,rgba(121,193,255,0.12),transparent_64%)] animate-[waterShimmer_12s_ease-in-out_infinite]" />
      {[34, 44, 56, 66].map((left, index) => (
        <FloatingCard key={left} left={`${left}%`} top={`${18 + (index % 2) * 5}%`} rotate={index % 2 ? 12 : -12} scale={0.68} />
      ))}
    </>
  );
}

function FortressMountainLine() {
  return (
    <>
      <MountainLayer
        className="absolute bottom-[31%] left-[-10%] right-[-10%] h-[34%] opacity-70"
        fill="linear-gradient(180deg,#354573 0%,#182542 58%,#09111d 100%)"
        points="0,100 7,62 14,68 23,42 31,56 40,28 49,46 58,24 67,44 76,30 86,52 100,32 100,100"
      />
      <MountainLayer
        className="absolute bottom-[24%] left-[-12%] right-[-12%] h-[28%] opacity-78"
        fill="linear-gradient(180deg,#25375f 0%,#14213c 58%,#07101d 100%)"
        points="0,100 9,58 18,64 29,38 38,56 48,30 59,48 69,26 80,52 91,34 100,48 100,100"
      />
    </>
  );
}

function WarTable() {
  return (
    <>
      <div className="absolute left-1/2 top-[52%] h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/10 bg-[radial-gradient(circle,rgba(104,74,53,0.34)_0%,rgba(52,33,25,0.56)_34%,rgba(16,16,20,0.92)_72%)] shadow-[0_0_90px_rgba(255,186,97,0.08)]" />
      <div className="absolute left-1/2 top-[53%] h-[23rem] w-[31rem] -translate-x-1/2 -translate-y-1/2 rounded-[48%] border border-cyan-200/8 bg-[radial-gradient(circle,rgba(101,173,255,0.2)_0%,rgba(39,82,139,0.16)_36%,rgba(17,18,23,0.18)_62%,transparent_84%)]" />
      <div className="absolute left-1/2 top-[53%] h-[18.5rem] w-[27rem] -translate-x-1/2 -translate-y-1/2 rounded-[46%] border border-white/10 bg-[radial-gradient(circle,rgba(121,193,255,0.12)_0%,rgba(30,44,82,0.22)_48%,transparent_82%)] animate-[waterShimmer_10s_ease-in-out_infinite]" />
    </>
  );
}

function ArcaneProjector() {
  return (
    <>
      <div className="absolute left-1/2 top-[40%] h-20 w-20 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(190,229,255,0.28),rgba(101,173,255,0.16)_38%,transparent_72%)] blur-md animate-[iconBreath_6s_ease-in-out_infinite]" />
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="absolute left-1/2 top-[40%] h-24 w-24 -translate-x-1/2 rounded-full border border-sky-200/10"
          style={{ transform: `translateX(-50%) scale(${1 + index * 0.22})`, opacity: 0.22 - index * 0.05 }}
        />
      ))}
    </>
  );
}

function FloatingCard({
  left,
  top,
  rotate,
  scale = 1,
}: {
  left: string;
  top: string;
  rotate: number;
  scale?: number;
}) {
  return (
    <div
      className="absolute h-16 w-12 rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,30,43,0.82),rgba(8,10,16,0.96))] shadow-[0_16px_30px_rgba(0,0,0,0.28)] animate-[ribbonFloat_7.4s_ease-in-out_infinite]"
      style={{ left, top, transform: `rotate(${rotate}deg) scale(${scale})` }}
    >
      <div className="absolute inset-2 rounded-[10px] border border-sky-200/10 bg-[radial-gradient(circle_at_50%_30%,rgba(121,193,255,0.22),rgba(32,44,82,0.2)_42%,transparent_74%)]" />
      <div className="absolute inset-x-3 top-3 h-6 rounded-full bg-white/10 blur-md" />
      <div className="absolute bottom-3 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full bg-white/10" />
    </div>
  );
}

function MapPedestal({
  left,
  top,
  scale = 1,
}: {
  left: string;
  top: string;
  scale?: number;
}) {
  return (
    <div className="absolute" style={{ left, top, transform: `scale(${scale})` }}>
      <div className="relative h-16 w-24 rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(42,34,29,0.84),rgba(12,13,18,0.98))] shadow-[0_16px_28px_rgba(0,0,0,0.24)]">
        <div className="absolute inset-2 rounded-[14px] border border-amber-100/10 bg-[linear-gradient(180deg,rgba(184,142,97,0.18),rgba(49,36,26,0.06))]" />
        <div className="absolute left-3 top-4 h-1.5 w-12 rounded-full bg-white/10" />
        <div className="absolute left-3 top-8 h-1.5 w-8 rounded-full bg-sky-200/18" />
        <div className="absolute right-4 top-4 h-6 w-6 rounded-full bg-amber-200/16 blur-md" />
      </div>
    </div>
  );
}

function CandleColumn({ left, bottom }: { left: string; bottom: string }) {
  return (
    <div className="absolute" style={{ left, bottom }}>
      <div className="relative h-28 w-10 rounded-[14px] border border-white/8 bg-[linear-gradient(180deg,rgba(40,31,26,0.84),rgba(12,13,18,0.96))]">
        {[0, 1, 2].map((index) => (
          <div key={index} className="absolute left-1/2 h-10 w-3 -translate-x-1/2 rounded-full bg-[#f9e8cb]" style={{ bottom: `${20 + index * 16}px` }} />
        ))}
        <div className="absolute left-1/2 top-[-8px] h-10 w-10 -translate-x-1/2 rounded-full bg-amber-200/24 blur-xl animate-[iconBreath_4.4s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

function ShelfGlow({ left, top }: { left: string; top: string }) {
  return (
    <div className="absolute h-20 w-24 rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(58,40,29,0.66),rgba(17,16,20,0.96))]" style={{ left, top }}>
      <div className="absolute inset-x-4 top-5 h-2 rounded-full bg-amber-200/22 blur-lg" />
    </div>
  );
}

function HeroHallFloor() {
  return (
    <>
      <div className="absolute bottom-[11%] left-[9%] right-[9%] h-[30%] rounded-[50%] border border-white/8 bg-[radial-gradient(circle_at_50%_34%,rgba(245,196,81,0.14),rgba(87,69,118,0.26)_44%,rgba(7,10,17,0.94)_100%)]" />
      <div className="absolute bottom-[14%] left-[24%] right-[24%] h-[12%] rounded-[999px] bg-[linear-gradient(90deg,transparent,rgba(245,196,81,0.16),rgba(181,218,255,0.12),transparent)] blur-lg animate-[waterShimmer_11s_ease-in-out_infinite]" />
      <div className="absolute bottom-[24%] left-[18%] right-[18%] h-[20%] rounded-[50%] border border-[#f5c451]/10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_60%)]" />
    </>
  );
}

function HallColumns() {
  return (
    <>
      {[10, 23, 77, 90].map((left, index) => (
        <div key={left} className="absolute bottom-[19%] h-[42%] w-14 rounded-t-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(159,142,190,0.32),rgba(35,31,48,0.86)_48%,rgba(8,10,16,0.96))]" style={{ left: `${left}%`, opacity: index === 0 || index === 3 ? 0.72 : 0.9 }}>
          <div className="absolute inset-x-[-8px] bottom-0 h-7 rounded-[18px] bg-white/8" />
          <div className="absolute inset-x-[-6px] top-0 h-8 rounded-[16px] bg-[#f5c451]/12" />
          <div className="absolute left-1/2 top-[18%] h-10 w-10 -translate-x-1/2 rounded-full bg-[#f5c451]/16 blur-xl animate-[iconBreath_5s_ease-in-out_infinite]" style={{ animationDelay: `${index * 0.5}s` }} />
        </div>
      ))}
    </>
  );
}

function HeroStatue({
  left,
  bottom,
  tone,
  scale,
}: {
  left: string;
  bottom: string;
  tone: "gold" | "sky" | "violet";
  scale: number;
}) {
  const fill =
    tone === "gold"
      ? "linear-gradient(180deg,#ffe7aa,#8c6732)"
      : tone === "sky"
        ? "linear-gradient(180deg,#cfeeff,#4e83bc)"
        : "linear-gradient(180deg,#ecd1ff,#7b55a8)";

  return (
    <div className="absolute" style={{ left, bottom, transform: `scale(${scale})` }}>
      <div className="relative h-40 w-28">
        <div className="absolute bottom-0 left-1/2 h-8 w-28 -translate-x-1/2 rounded-[50%] bg-black/28 blur-sm" />
        <div className="absolute bottom-4 left-1/2 h-14 w-24 -translate-x-1/2 rounded-[48%] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(18,18,24,0.9))]" />
        <div className="absolute bottom-12 left-1/2 h-22 w-14 -translate-x-1/2 rounded-t-[24px]" style={{ height: 88, background: fill, clipPath: "polygon(50% 0%,82% 18%,76% 100%,24% 100%,18% 18%)" }} />
        <div className="absolute bottom-[6.6rem] left-1/2 h-10 w-10 -translate-x-1/2 rounded-full border border-white/18" style={{ background: fill }} />
        <div className="absolute bottom-[4.7rem] left-[18px] h-5 w-5 rotate-[-24deg] rounded-full bg-white/12" />
        <div className="absolute bottom-[4.7rem] right-[18px] h-5 w-5 rotate-[24deg] rounded-full bg-white/12" />
      </div>
    </div>
  );
}

function RosterRelic({ left, bottom }: { left: string; bottom: string }) {
  return (
    <div className="absolute" style={{ left, bottom }}>
      <div className="relative h-24 w-24 rounded-full border border-[#f5c451]/14 bg-[radial-gradient(circle,rgba(245,196,81,0.18),rgba(44,33,55,0.22)_44%,rgba(6,8,13,0.82)_100%)]">
        <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[18px] border border-white/14 bg-white/6 animate-[iconBreath_6s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

function LineageConstellation() {
  return (
    <svg className="absolute left-[24%] top-[20%] h-[28%] w-[52%] opacity-75" viewBox="0 0 100 44" preserveAspectRatio="none">
      <path d="M6 32 22 16 38 24 51 9 64 24 79 14 94 30" fill="none" stroke="rgba(245,196,81,0.18)" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="2 2" />
      {[6, 22, 38, 51, 64, 79, 94].map((x, index) => (
        <circle key={x} cx={x} cy={[32, 16, 24, 9, 24, 14, 30][index]} r="1.5" fill="rgba(255,236,186,0.55)" />
      ))}
    </svg>
  );
}

function TrainingDummies() {
  return (
    <>
      {[39, 50, 61].map((left, index) => (
        <div key={left} className="absolute bottom-[18%] h-20 w-9" style={{ left: `${left}%`, transform: `scale(${1 - index * 0.04})` }}>
          <div className="absolute bottom-0 left-1/2 h-9 w-2 -translate-x-1/2 rounded-full bg-[#6d5139]" />
          <div className="absolute bottom-7 left-1/2 h-10 w-8 -translate-x-1/2 rounded-[18px] border border-white/8 bg-[linear-gradient(180deg,#9a7550,#4b3425)]" />
          <div className="absolute bottom-[4.4rem] left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-[#b9976b]" />
        </div>
      ))}
    </>
  );
}

function MissionMapFloor() {
  return (
    <>
      <div className="absolute bottom-[10%] left-[8%] right-[8%] h-[32%] rounded-[50%] border border-emerald-200/10 bg-[radial-gradient(circle_at_50%_36%,rgba(93,211,158,0.16),rgba(58,80,56,0.24)_44%,rgba(5,9,14,0.94)_100%)]" />
      <div className="absolute bottom-[16%] left-[18%] right-[18%] h-[14%] rounded-[999px] bg-[linear-gradient(90deg,transparent,rgba(245,196,81,0.14),rgba(93,211,158,0.16),transparent)] blur-md animate-[waterShimmer_9s_ease-in-out_infinite]" />
    </>
  );
}

function ContractBoard() {
  return (
    <div className="absolute left-1/2 top-[29%] h-48 w-64 -translate-x-1/2 rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(111,78,45,0.72),rgba(35,25,20,0.9)_54%,rgba(8,9,13,0.98))] shadow-[0_28px_70px_rgba(0,0,0,0.28)]">
      <div className="absolute inset-4 rounded-[22px] border border-[#f5c451]/14 bg-[linear-gradient(180deg,rgba(245,196,81,0.14),rgba(255,255,255,0.03))]" />
      {[0, 1, 2].map((index) => (
        <div key={index} className="absolute left-9 right-9 h-8 rounded-[10px] bg-[#ead2a4]/16" style={{ top: `${36 + index * 44}px` }}>
          <div className="absolute left-3 top-3 h-1.5 w-24 rounded-full bg-[#f5d498]/30" />
          <div className="absolute right-3 top-2 h-4 w-4 rounded-full bg-emerald-200/30 blur-[2px]" />
        </div>
      ))}
    </div>
  );
}

function RoutePins() {
  return (
    <>
      <svg className="absolute bottom-[23%] left-[22%] h-[20%] w-[56%]" viewBox="0 0 100 40" preserveAspectRatio="none">
        <path d="M4 30C18 8 31 35 45 18C58 2 70 26 94 10" fill="none" stroke="rgba(245,196,81,0.22)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 3" />
      </svg>
      {[24, 39, 53, 67, 78].map((left, index) => (
        <div key={left} className="absolute bottom-[25%] h-5 w-5 rounded-full border border-[#f5c451]/24 bg-[#f5c451]/18 shadow-[0_0_18px_rgba(245,196,81,0.16)] animate-[iconBreath_4.8s_ease-in-out_infinite]" style={{ left: `${left}%`, animationDelay: `${index * 0.35}s` }} />
      ))}
    </>
  );
}

function CourierCamp({ left, bottom, scale }: { left: string; bottom: string; scale: number }) {
  return (
    <div className="absolute" style={{ left, bottom, transform: `scale(${scale})` }}>
      <div className="relative h-24 w-32">
        <div className="absolute bottom-0 left-3 right-3 h-9 rounded-[16px] border border-white/8 bg-[linear-gradient(180deg,rgba(32,25,20,0.84),rgba(10,11,15,0.96))]" />
        <div className="absolute left-0 right-0 top-1 h-16 bg-[linear-gradient(180deg,#fff0b7,#e59a4d_46%,#68401e)]" style={{ clipPath: "polygon(50% 0%,100% 62%,86% 66%,14% 66%,0 62%)" }} />
        <div className="absolute bottom-5 left-1/2 h-7 w-7 -translate-x-1/2 rounded-full bg-emerald-200/24 blur-lg animate-[iconBreath_4.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

function RewardCrate({ left, bottom }: { left: string; bottom: string }) {
  return (
    <div className="absolute" style={{ left, bottom }}>
      <div className="relative h-16 w-20 rounded-[16px] border border-[#f5c451]/18 bg-[linear-gradient(180deg,rgba(139,91,42,0.82),rgba(51,32,20,0.96))]">
        <div className="absolute left-1/2 top-[-8px] h-9 w-9 -translate-x-1/2 rounded-full bg-[#f5c451]/20 blur-xl animate-[iconBreath_4s_ease-in-out_infinite]" />
        <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-[#f5c451]/18" />
        <div className="absolute left-2 right-2 top-6 h-1.5 rounded-full bg-[#f5d498]/28" />
      </div>
    </div>
  );
}

function Moat() {
  return (
    <div className="absolute bottom-[8%] left-[12%] right-[12%] h-[18%] rounded-[999px] bg-[radial-gradient(circle_at_50%_35%,rgba(94,175,255,0.28),rgba(28,67,124,0.24)_30%,rgba(6,12,22,0.86)_92%)] animate-[waterShimmer_10s_ease-in-out_infinite]" />
  );
}

function CastleKeep() {
  return (
    <div className="absolute left-1/2 bottom-[20%] h-[34%] w-[38%] -translate-x-1/2">
      <div className="absolute bottom-0 left-0 right-0 h-[42%] rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(76,95,144,0.86),rgba(25,34,56,0.96))]" />
      <div className="absolute bottom-[26%] left-[18%] h-[42%] w-[18%] rounded-t-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(84,109,167,0.88),rgba(27,38,63,0.98))]" />
      <div className="absolute bottom-[40%] left-[39%] h-[44%] w-[22%] rounded-t-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(103,132,198,0.9),rgba(32,43,74,0.98))]" />
      <div className="absolute bottom-[26%] right-[18%] h-[42%] w-[18%] rounded-t-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(84,109,167,0.88),rgba(27,38,63,0.98))]" />
      {[24, 50, 76].map((left, index) => (
        <div key={left} className="absolute top-[28%] h-6 w-3 -translate-x-1/2 rounded-full bg-amber-100/24 blur-sm animate-[iconBreath_5.2s_ease-in-out_infinite]" style={{ left: `${left}%`, animationDelay: `${index * 0.7}s` }} />
      ))}
    </div>
  );
}

function FortressWalls() {
  return (
    <>
      <div className="absolute bottom-[17%] left-[15%] right-[15%] h-[18%] rounded-[48%] border border-white/8 bg-[radial-gradient(circle_at_50%_36%,rgba(164,190,255,0.16),rgba(46,63,104,0.26)_44%,rgba(9,12,20,0.9)_100%)]" />
      <div className="absolute bottom-[19%] left-[22%] right-[22%] h-[11%] rounded-[48%] border border-white/8 bg-[linear-gradient(180deg,rgba(82,102,156,0.44),rgba(19,27,44,0.96))]" />
      <div className="absolute bottom-[17%] left-[48%] h-[12%] w-[8%] -translate-x-1/2 rounded-t-[18px] border border-white/8 bg-[linear-gradient(180deg,rgba(90,118,180,0.66),rgba(22,29,47,0.96))]" />
    </>
  );
}

function WatchFire({ left, bottom }: { left: string; bottom: string }) {
  return (
    <div className="absolute" style={{ left, bottom }}>
      <div className="h-6 w-6 rounded-full bg-[radial-gradient(circle,rgba(255,230,169,0.94),rgba(255,166,92,0.46)_38%,transparent_72%)] animate-[iconBreath_4s_ease-in-out_infinite]" />
    </div>
  );
}

function SkyBridge() {
  return (
    <div className="absolute bottom-[28%] left-[30%] right-[30%] h-[4%] rounded-[999px] bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(181,218,255,0.24),rgba(255,255,255,0.08))] blur-[1px]" />
  );
}

function TowerGlow({ left, bottom }: { left: string; bottom: string }) {
  return <div className="absolute h-10 w-10 rounded-full bg-amber-200/22 blur-xl animate-[iconBreath_5s_ease-in-out_infinite]" style={{ left, bottom }} />;
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
