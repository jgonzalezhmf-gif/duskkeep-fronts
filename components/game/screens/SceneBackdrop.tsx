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

function ShopScene() {
  return (
    <>
      <LanternCluster />
      <MarketSilkCeiling />
      <Roofline />
      <BazaarStall left="10%" bottom="22%" tone="rose" scale={1.06} />
      <BazaarStall left="28%" bottom="25%" tone="gold" scale={1} />
      <VaultPavilion />
      <BazaarStall left="71%" bottom="24%" tone="sky" scale={0.98} />
      <BazaarStall left="84%" bottom="20%" tone="violet" scale={0.86} />
      <HangingSigns />
      <CoinGlints />
      <CarpetRow />
      <MarketWalkway />
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

function MoonSanctumLandmark() {
  return (
    <div className="absolute bottom-[18%] left-1/2 h-[34%] w-[44rem] max-w-[86vw] -translate-x-1/2 opacity-95">
      <div className="absolute bottom-0 left-1/2 h-[18%] w-[80%] -translate-x-1/2 rounded-[50%] bg-sky-100/12 blur-xl" />
      <div className="absolute bottom-[8%] left-1/2 h-[42%] w-[52%] -translate-x-1/2 rounded-t-[999px] border border-sky-100/16 bg-[linear-gradient(180deg,rgba(122,164,220,0.34),rgba(18,28,48,0.84))] shadow-[0_0_70px_rgba(129,198,255,0.1)]" />
      <div className="absolute bottom-[8%] left-1/2 h-[62%] w-[2.8rem] -translate-x-1/2 rounded-t-[999px] bg-[linear-gradient(180deg,rgba(218,239,255,0.26),rgba(38,57,90,0.86))]" />
      {[-1, 1].map((side) => (
        <div key={side} className="absolute bottom-[8%] h-[54%] w-[2.2rem] rounded-t-[999px] bg-[linear-gradient(180deg,rgba(181,218,255,0.22),rgba(27,41,70,0.9))]" style={{ left: `calc(50% + ${side * 9.8}rem)` }}>
          <div className="absolute left-1/2 top-[-1.9rem] h-16 w-16 -translate-x-1/2 rounded-full border border-sky-100/18 bg-[radial-gradient(circle,rgba(210,236,255,0.18),transparent_68%)]" />
          {[0, 1, 2].map((index) => (
            <span key={index} className="absolute left-1/2 h-5 w-2 -translate-x-1/2 rounded-full bg-sky-100/24 blur-[1px]" style={{ top: `${30 + index * 22}%` }} />
          ))}
        </div>
      ))}
      {[18, 28, 38, 62, 72, 82].map((left, index) => (
        <span key={left} className="absolute bottom-[18%] h-9 w-3 rounded-full bg-sky-100/18 animate-[iconBreath_5s_ease-in-out_infinite]" style={{ left: `${left}%`, animationDelay: `${index * 0.35}s` }} />
      ))}
      <div className="absolute left-1/2 top-[8%] h-28 w-28 -translate-x-1/2 rounded-full border border-sky-100/18 bg-[radial-gradient(circle,rgba(226,243,255,0.24),rgba(115,171,232,0.08)_55%,transparent_72%)] animate-[iconBreath_8s_ease-in-out_infinite]" />
    </div>
  );
}

function AshForgeLandmark() {
  return (
    <div className="absolute bottom-[17%] left-1/2 h-[37%] w-[46rem] max-w-[90vw] -translate-x-1/2 opacity-95">
      <div className="absolute bottom-0 left-1/2 h-[26%] w-[78%] -translate-x-1/2 rounded-[50%] bg-orange-300/13 blur-2xl" />
      <div className="absolute bottom-[6%] left-1/2 h-[40%] w-[44%] -translate-x-1/2 rounded-t-[32px] border border-orange-200/12 bg-[linear-gradient(180deg,rgba(111,58,35,0.76),rgba(21,11,14,0.96))]" />
      {[20, 32, 50, 68, 80].map((left, index) => (
        <div key={left} className="absolute bottom-[10%] w-12 rounded-t-[26px] bg-[linear-gradient(180deg,rgba(123,65,43,0.9),rgba(21,12,15,0.98))]" style={{ left: `${left}%`, height: `${44 + (index % 3) * 16}%` }}>
          <div className="absolute left-1/2 top-[-2rem] h-16 w-12 -translate-x-1/2 rounded-full bg-white/8 blur-2xl" />
          <div className="absolute left-1/2 bottom-5 h-9 w-5 -translate-x-1/2 rounded-full bg-orange-200/30 blur-md animate-[iconBreath_4.2s_ease-in-out_infinite]" style={{ animationDelay: `${index * 0.35}s` }} />
        </div>
      ))}
      <div className="absolute bottom-[13%] left-1/2 h-20 w-40 -translate-x-1/2 rounded-[50%] border border-orange-100/18 bg-[radial-gradient(circle,rgba(255,178,91,0.48),rgba(255,99,53,0.14)_48%,rgba(18,10,13,0.68)_78%)] animate-[waterShimmer_6s_ease-in-out_infinite]" />
      {[31, 39, 61, 69].map((left) => (
        <span key={left} className="absolute bottom-[26%] h-8 w-2 rounded-full bg-orange-200/34 blur-[2px]" style={{ left: `${left}%` }} />
      ))}
    </div>
  );
}

function FestivalPortalLandmark() {
  return (
    <div className="absolute bottom-[16%] left-1/2 h-[39%] w-[48rem] max-w-[92vw] -translate-x-1/2">
      <div className="absolute bottom-[5%] left-1/2 h-[72%] w-[24rem] -translate-x-1/2 rounded-t-[999px] border border-sky-100/18 bg-[radial-gradient(circle_at_50%_46%,rgba(121,216,255,0.22),rgba(126,93,255,0.13)_42%,rgba(8,12,22,0.76)_72%,transparent_78%)] shadow-[0_0_90px_rgba(121,216,255,0.1)] animate-[iconBreath_7s_ease-in-out_infinite]" />
      <div className="absolute bottom-[9%] left-1/2 h-[55%] w-[16rem] -translate-x-1/2 rounded-t-[999px] border border-[#ffd57a]/18 bg-[radial-gradient(circle,rgba(255,213,122,0.17),transparent_60%)]" />
      {[-1, 1].map((side) => (
        <div key={side} className="absolute bottom-[5%] h-[54%] w-16 rounded-t-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(62,78,132,0.72),rgba(11,14,24,0.94))]" style={{ left: `calc(50% + ${side * 13.5}rem)` }}>
          {[0, 1, 2].map((index) => (
            <span key={index} className="absolute left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-[#ffd57a]/22 blur-sm" style={{ top: `${20 + index * 24}%` }} />
          ))}
        </div>
      ))}
      <div className="absolute bottom-[0%] left-[9%] right-[9%] h-[16%] rounded-[50%] bg-[linear-gradient(90deg,transparent,rgba(214,152,255,0.17),rgba(121,216,255,0.16),transparent)] blur-xl" />
      {[12, 24, 76, 88].map((left, index) => (
        <div key={left} className="absolute bottom-[13%] h-28 w-9" style={{ left: `${left}%` }}>
          <div className="h-full w-[3px] rounded-full bg-white/16" />
          <div className="absolute left-[3px] top-0 h-16 w-10 origin-top-left animate-[ribbonFloat_5s_ease-in-out_infinite]" style={{ background: index % 2 ? "linear-gradient(180deg,#ffd57a,#8c541f)" : "linear-gradient(180deg,#79d8ff,#284b82)" }} />
        </div>
      ))}
    </div>
  );
}

function GrandMarketLandmark() {
  return (
    <div className="absolute bottom-[15%] left-1/2 h-[40%] w-[54rem] max-w-[96vw] -translate-x-1/2">
      <div className="absolute bottom-0 left-1/2 h-[22%] w-[78%] -translate-x-1/2 rounded-[50%] bg-amber-200/14 blur-2xl" />
      <div className="absolute bottom-[7%] left-1/2 h-[52%] w-[28rem] -translate-x-1/2 rounded-t-[46px] border border-amber-100/14 bg-[linear-gradient(180deg,rgba(120,74,37,0.78),rgba(23,15,18,0.94))]" />
      <div className="absolute left-1/2 top-[2%] h-[32%] w-[35rem] -translate-x-1/2 bg-[linear-gradient(180deg,#ffe2a5,#dc844c_48%,#5a2d27)]" style={{ clipPath: "polygon(50% 0%,100% 78%,91% 86%,9% 86%,0 78%)" }} />
      {[23, 34, 45, 55, 66, 77].map((left, index) => (
        <span key={left} className="absolute bottom-[26%] h-12 w-8 rounded-[16px] border border-amber-100/20 bg-[radial-gradient(circle,rgba(255,233,173,0.58),rgba(211,115,59,0.3)_50%,rgba(58,32,24,0.84))] shadow-[0_0_22px_rgba(255,190,91,0.16)] animate-[iconBreath_4.8s_ease-in-out_infinite]" style={{ left: `${left}%`, animationDelay: `${index * 0.35}s` }} />
      ))}
      {[16, 84].map((left) => (
        <div key={left} className="absolute bottom-[7%] h-[42%] w-[9rem] rounded-t-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(58,38,34,0.78),rgba(11,10,14,0.96))]" style={{ left: `${left}%`, transform: "translateX(-50%)" }}>
          <div className="absolute inset-x-4 top-5 h-8 rounded-full bg-amber-200/12 blur-lg" />
          <div className="absolute left-1/2 top-16 h-12 w-12 -translate-x-1/2 rounded-full border border-amber-100/16 bg-amber-200/10" />
        </div>
      ))}
    </div>
  );
}

function ArcaneWarRoomLandmark() {
  return (
    <div className="absolute bottom-[13%] left-1/2 h-[43%] w-[52rem] max-w-[94vw] -translate-x-1/2">
      <div className="absolute bottom-[0%] left-1/2 h-[48%] w-[42rem] -translate-x-1/2 rounded-[50%] border border-cyan-100/10 bg-[radial-gradient(circle,rgba(121,193,255,0.16),rgba(98,63,37,0.12)_46%,rgba(6,8,13,0.9)_100%)] animate-[waterShimmer_12s_ease-in-out_infinite]" />
      <div className="absolute left-1/2 top-[2%] h-[18rem] w-[18rem] -translate-x-1/2 rounded-full border border-[#f5c451]/13 bg-[radial-gradient(circle,rgba(245,196,81,0.14),rgba(121,193,255,0.1)_44%,transparent_68%)]" />
      {[0, 1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="absolute left-1/2 top-[12%] h-28 w-20 rounded-[18px] border border-white/12 bg-[linear-gradient(180deg,rgba(30,39,62,0.84),rgba(8,10,16,0.96))] shadow-[0_18px_36px_rgba(0,0,0,0.24)] animate-[ribbonFloat_7s_ease-in-out_infinite]"
          style={{ transform: `translateX(-50%) rotate(${-32 + index * 16}deg) translateY(${Math.abs(index - 2) * 10}px)`, transformOrigin: "50% 130%", animationDelay: `${index * 0.35}s` }}
        >
          <div className="absolute inset-3 rounded-[12px] bg-[radial-gradient(circle_at_50%_28%,rgba(121,193,255,0.22),transparent_62%)]" />
          <div className="absolute bottom-4 left-1/2 h-2 w-10 -translate-x-1/2 rounded-full bg-[#f5c451]/24" />
        </div>
      ))}
      {[12, 88].map((left) => (
        <div key={left} className="absolute bottom-[4%] h-[54%] w-28 rounded-t-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(74,47,34,0.72),rgba(14,13,18,0.95))]" style={{ left: `${left}%`, transform: "translateX(-50%)" }}>
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className="absolute left-4 right-4 h-2 rounded-full bg-amber-100/13" style={{ top: `${20 + index * 17}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function HeroHallLandmark() {
  return (
    <div className="absolute bottom-[12%] left-1/2 h-[45%] w-[56rem] max-w-[96vw] -translate-x-1/2">
      <div className="absolute bottom-0 left-1/2 h-[26%] w-[80%] -translate-x-1/2 rounded-[50%] bg-violet-200/12 blur-2xl" />
      <div className="absolute bottom-[8%] left-1/2 h-[58%] w-[34rem] -translate-x-1/2 rounded-t-[60px] border border-white/10 bg-[linear-gradient(180deg,rgba(75,63,108,0.64),rgba(12,13,22,0.96))]" />
      {[16, 28, 40, 60, 72, 84].map((left, index) => (
        <div key={left} className="absolute bottom-[9%] h-[58%] w-14 rounded-t-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(160,137,194,0.36),rgba(34,30,48,0.9))]" style={{ left: `${left}%`, transform: "translateX(-50%)" }}>
          <div className="absolute left-1/2 top-[-1rem] h-12 w-16 -translate-x-1/2 rounded-[16px] bg-[#f5c451]/10" />
          <span className="absolute left-1/2 top-[32%] h-16 w-7 -translate-x-1/2 rounded-t-[18px] bg-[linear-gradient(180deg,rgba(245,196,81,0.26),rgba(255,255,255,0.06))]" />
          <span className="absolute left-1/2 top-[24%] h-8 w-8 -translate-x-1/2 rounded-full bg-white/12 animate-[iconBreath_5s_ease-in-out_infinite]" style={{ animationDelay: `${index * 0.3}s` }} />
        </div>
      ))}
      <div className="absolute left-1/2 top-[4%] h-32 w-32 -translate-x-1/2 rotate-45 rounded-[28px] border border-[#f5c451]/16 bg-[#f5c451]/8 animate-[iconBreath_6.5s_ease-in-out_infinite]" />
    </div>
  );
}

function CommandBoardLandmark() {
  return (
    <div className="absolute bottom-[13%] left-1/2 h-[42%] w-[52rem] max-w-[94vw] -translate-x-1/2">
      <div className="absolute bottom-[2%] left-1/2 h-[24%] w-[76%] -translate-x-1/2 rounded-[50%] bg-emerald-200/12 blur-2xl" />
      <div className="absolute bottom-[9%] left-1/2 h-[66%] w-[25rem] -translate-x-1/2 rounded-[32px] border border-[#f5c451]/16 bg-[linear-gradient(180deg,rgba(111,78,45,0.78),rgba(18,17,18,0.96))] shadow-[0_28px_70px_rgba(0,0,0,0.28)]" />
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="absolute left-1/2 h-12 w-[19rem] -translate-x-1/2 rounded-[14px] border border-white/8 bg-[linear-gradient(90deg,rgba(245,196,81,0.1),rgba(93,211,158,0.08))]" style={{ top: `${20 + index * 15}%` }}>
          <span className="absolute left-4 top-4 h-2 w-28 rounded-full bg-[#f5d498]/28" />
          <span className="absolute right-5 top-3 h-6 w-6 rounded-full bg-emerald-200/18 blur-sm" />
        </div>
      ))}
      {[19, 31, 69, 81].map((left, index) => (
        <div key={left} className="absolute bottom-[8%] h-[42%] w-12 rounded-t-[24px] bg-[linear-gradient(180deg,rgba(44,66,53,0.72),rgba(8,11,14,0.94))]" style={{ left: `${left}%` }}>
          <div className="absolute left-1/2 top-[-1rem] h-10 w-10 -translate-x-1/2 rounded-full bg-emerald-200/16 blur-xl animate-[iconBreath_4.8s_ease-in-out_infinite]" style={{ animationDelay: `${index * 0.4}s` }} />
        </div>
      ))}
    </div>
  );
}

function CitadelLandmark() {
  return (
    <div className="absolute bottom-[11%] left-1/2 h-[48%] w-[58rem] max-w-[98vw] -translate-x-1/2">
      <div className="absolute bottom-0 left-1/2 h-[22%] w-[82%] -translate-x-1/2 rounded-[50%] bg-sky-200/12 blur-2xl" />
      <div className="absolute bottom-[7%] left-1/2 h-[38%] w-[44rem] -translate-x-1/2 rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(78,98,150,0.62),rgba(16,23,38,0.96))]" />
      {[18, 30, 42, 50, 58, 70, 82].map((left, index) => (
        <div key={left} className="absolute bottom-[9%] w-[4.4rem] rounded-t-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(105,132,196,0.74),rgba(22,31,52,0.98))]" style={{ left: `${left}%`, height: `${48 + (index % 3) * 12}%`, transform: "translateX(-50%)" }}>
          <div className="absolute inset-x-[-6px] top-[-8px] h-8 rounded-t-[18px] bg-[linear-gradient(180deg,rgba(188,214,255,0.32),rgba(88,112,170,0.44))]" />
          {[0, 1, 2].map((windowIndex) => (
            <span key={windowIndex} className="absolute left-1/2 h-5 w-2 -translate-x-1/2 rounded-full bg-amber-100/24 blur-[1px] animate-[iconBreath_5s_ease-in-out_infinite]" style={{ top: `${28 + windowIndex * 20}%`, animationDelay: `${index * 0.25}s` }} />
          ))}
        </div>
      ))}
      <div className="absolute left-1/2 top-[3%] h-28 w-24 -translate-x-1/2 rounded-t-[999px] border border-[#f5c451]/16 bg-[linear-gradient(180deg,rgba(245,196,81,0.18),rgba(76,93,138,0.28))]" />
    </div>
  );
}

function ColiseumLandmark() {
  return (
    <div className="absolute bottom-[12%] left-1/2 h-[44%] w-[58rem] max-w-[98vw] -translate-x-1/2">
      <div className="absolute bottom-0 left-1/2 h-[24%] w-[82%] -translate-x-1/2 rounded-[50%] bg-orange-200/13 blur-2xl" />
      <div className="absolute bottom-[5%] left-1/2 h-[54%] w-[52rem] -translate-x-1/2 rounded-t-[50%] border border-orange-100/12 bg-[radial-gradient(circle_at_50%_74%,rgba(255,180,104,0.13),rgba(97,54,35,0.3)_46%,rgba(13,11,17,0.94)_100%)]" />
      <div className="absolute bottom-[12%] left-1/2 h-[34%] w-[42rem] -translate-x-1/2 rounded-t-[50%] border border-amber-100/10 bg-[linear-gradient(180deg,rgba(99,56,42,0.44),rgba(20,13,16,0.84))]" />
      {[13, 21, 29, 37, 45, 55, 63, 71, 79, 87].map((left, index) => (
        <div key={left} className="absolute bottom-[18%] h-[24%] w-9 rounded-t-[18px] border border-orange-100/10 bg-[linear-gradient(180deg,rgba(255,190,122,0.16),rgba(36,21,19,0.88))]" style={{ left: `${left}%`, transform: "translateX(-50%)" }}>
          <span className="absolute left-1/2 top-[38%] h-5 w-3 -translate-x-1/2 rounded-full bg-orange-200/20 blur-[1px] animate-[iconBreath_4.2s_ease-in-out_infinite]" style={{ animationDelay: `${index * 0.18}s` }} />
        </div>
      ))}
      <div className="absolute bottom-[17%] left-1/2 h-[18%] w-[28rem] -translate-x-1/2 rounded-[50%] border border-[#f5c451]/13 bg-[radial-gradient(circle,rgba(245,196,81,0.16),transparent_68%)]" />
    </div>
  );
}

function StarfallLayer({ tone }: { tone: "sky" | "ember" }) {
  const color = tone === "sky" ? "rgba(190,226,255,0.22)" : "rgba(255,190,126,0.22)";
  return (
    <>
      {[18, 31, 57, 83].map((left, index) => (
        <div
          key={left}
          className="absolute top-[14%] h-[1px] w-24 rotate-[-24deg] rounded-full animate-[waterShimmer_6s_ease-in-out_infinite]"
          style={{
            left: `${left}%`,
            background: `linear-gradient(90deg,transparent,${color},transparent)`,
            animationDelay: `${index * 0.7}s`,
          }}
        />
      ))}
    </>
  );
}

function EmberRain() {
  return (
    <>
      {[12, 24, 39, 52, 68, 81, 92].map((left, index) => (
        <span
          key={left}
          className="absolute top-[12%] h-10 w-[2px] rotate-[18deg] rounded-full bg-[linear-gradient(180deg,rgba(255,205,137,0.4),transparent)] blur-[1px] animate-[particleFloat_9s_ease-in-out_infinite]"
          style={{ left: `${left}%`, animationDelay: `${index * 0.5}s` }}
        />
      ))}
    </>
  );
}

function MoonTempleSteps() {
  return (
    <div className="absolute bottom-[20%] left-1/2 h-28 w-72 -translate-x-1/2">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="absolute left-1/2 -translate-x-1/2 rounded-[50%] border border-sky-100/8 bg-[linear-gradient(180deg,rgba(135,167,204,0.12),rgba(12,18,31,0.84))]"
          style={{ bottom: `${index * 12}px`, width: `${280 - index * 42}px`, height: `${34 - index * 3}px` }}
        />
      ))}
      <div className="absolute left-1/2 top-1 h-16 w-16 -translate-x-1/2 rounded-full bg-sky-200/12 blur-2xl animate-[iconBreath_6s_ease-in-out_infinite]" />
    </div>
  );
}

function ForgeOutpost() {
  return (
    <div className="absolute bottom-[21%] left-[42%] h-32 w-48">
      <div className="absolute bottom-0 left-4 right-4 h-16 rounded-[20px] border border-orange-200/8 bg-[linear-gradient(180deg,rgba(76,42,29,0.8),rgba(11,9,13,0.96))]" />
      {[24, 72, 124].map((left, index) => (
        <div key={left} className="absolute bottom-12 h-24 w-8 rounded-t-[18px] bg-[linear-gradient(180deg,#6f3f2d,#1a1014)]" style={{ left }}>
          <div className="absolute left-1/2 top-[-18px] h-10 w-10 -translate-x-1/2 rounded-full bg-orange-300/18 blur-xl animate-[iconBreath_4.4s_ease-in-out_infinite]" style={{ animationDelay: `${index * 0.4}s` }} />
          <div className="absolute left-1/2 top-[-26px] h-12 w-7 -translate-x-1/2 rounded-full bg-white/8 blur-xl" />
        </div>
      ))}
      <div className="absolute bottom-5 left-1/2 h-10 w-20 -translate-x-1/2 rounded-full bg-orange-300/18 blur-xl animate-[iconBreath_3.8s_ease-in-out_infinite]" />
    </div>
  );
}

function FireworkBursts() {
  return (
    <>
      {[
        ["24%", "18%", "#79d8ff"],
        ["57%", "14%", "#ffd57a"],
        ["82%", "23%", "#d698ff"],
      ].map(([left, top, color], index) => (
        <div key={`${left}-${top}`} className="absolute h-16 w-16 rounded-full animate-[iconBreath_5.8s_ease-in-out_infinite]" style={{ left, top, animationDelay: `${index * 0.9}s` }}>
          {[0, 45, 90, 135].map((rotate) => (
            <span
              key={rotate}
              className="absolute left-1/2 top-1/2 h-[2px] w-9 origin-left rounded-full"
              style={{ background: `linear-gradient(90deg,${color},transparent)`, transform: `rotate(${rotate}deg)` }}
            />
          ))}
        </div>
      ))}
    </>
  );
}

function MarketSilkCeiling() {
  return (
    <>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="absolute top-[8%] h-[17%] w-[44%] rounded-b-[52%] border-b border-white/10 opacity-80"
          style={{
            left: `${index * 28 - 5}%`,
            background:
              index === 0
                ? "linear-gradient(180deg,rgba(255,117,108,0.18),transparent)"
                : index === 1
                  ? "linear-gradient(180deg,rgba(245,196,81,0.16),transparent)"
                  : "linear-gradient(180deg,rgba(121,216,255,0.14),transparent)",
          }}
        />
      ))}
    </>
  );
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

function ArenaSpotlights() {
  return (
    <>
      <div className="absolute left-[17%] top-[13%] h-[54%] w-[28%] rotate-[12deg] bg-[linear-gradient(180deg,rgba(255,220,160,0.12),transparent)] blur-xl" />
      <div className="absolute right-[17%] top-[13%] h-[54%] w-[28%] rotate-[-12deg] bg-[linear-gradient(180deg,rgba(255,168,100,0.1),transparent)] blur-xl" />
      <div className="absolute left-[39%] top-[7%] h-[50%] w-[22%] bg-[linear-gradient(180deg,rgba(255,236,188,0.09),transparent)] blur-xl" />
    </>
  );
}

function Moon({ top, left, size }: { top: string; left: string; size: string }) {
  return (
    <div
      className="absolute rounded-full bg-[radial-gradient(circle,rgba(242,248,255,0.95)_0%,rgba(196,223,255,0.55)_38%,rgba(159,205,255,0.1)_62%,transparent_72%)] blur-[1px] animate-[iconBreath_9s_ease-in-out_infinite]"
      style={{ top, left, width: size, height: size }}
    />
  );
}

function SunOrb() {
  return (
    <div className="absolute left-[70%] top-[13%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,236,163,0.96)_0%,rgba(255,179,91,0.7)_32%,rgba(255,143,69,0.12)_60%,transparent_72%)] animate-[iconBreath_9s_ease-in-out_infinite]" />
  );
}

function MountainLayer({
  className,
  fill,
  points,
}: {
  className?: string;
  fill: string;
  points: string;
}) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className}>
      <polygon points={points} fill={fill} />
    </svg>
  );
}

function RiverGlow({ tone }: { tone: string }) {
  return (
    <>
      <div
        className="absolute bottom-[9%] left-[20%] h-[22%] w-[52%] rotate-[-10deg] rounded-[999px] blur-2xl"
        style={{ background: `linear-gradient(90deg,transparent,${tone},transparent)` }}
      />
      <div className="absolute bottom-[7%] left-[22%] h-10 w-[48%] rounded-[999px] bg-white/10 blur-lg animate-[waterShimmer_8s_ease-in-out_infinite]" />
    </>
  );
}

function LavaRibbon() {
  return (
    <>
      <div className="absolute bottom-[8%] left-[16%] h-[16%] w-[58%] rotate-[-8deg] rounded-[999px] bg-[linear-gradient(90deg,rgba(255,110,48,0.12),rgba(255,176,94,0.3),rgba(255,96,56,0.08))] blur-2xl" />
      <div className="absolute bottom-[10%] left-[18%] h-8 w-[50%] rounded-[999px] bg-[linear-gradient(90deg,rgba(255,159,83,0.18),rgba(255,215,152,0.4),rgba(255,126,78,0.18))] animate-[waterShimmer_6s_ease-in-out_infinite]" />
    </>
  );
}

function CrystalCluster({
  left,
  bottom,
  tone,
}: {
  left: string;
  bottom: string;
  tone: "sky" | "amber";
}) {
  const fill =
    tone === "sky"
      ? "linear-gradient(180deg,#d9f3ff 0%,#7bc3ff 45%,#295cb8 100%)"
      : "linear-gradient(180deg,#ffe7a8 0%,#ffb85e 44%,#7e4116 100%)";

  return (
    <div className="absolute" style={{ left, bottom }}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="absolute rounded-[8px] shadow-[0_0_18px_rgba(255,255,255,0.18)] animate-[iconBreath_4.8s_ease-in-out_infinite]"
          style={{
            left: `${index * 18}px`,
            bottom: `${index % 2 === 0 ? 0 : 8}px`,
            width: 16,
            height: 40 - index * 5,
            clipPath: "polygon(50% 0%,100% 34%,76% 100%,24% 100%,0% 34%)",
            background: fill,
            animationDelay: `${index * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

function RuinedGate({ left, bottom, scale }: { left: string; bottom: string; scale: number }) {
  return (
    <div className="absolute opacity-90" style={{ left, bottom, transform: `scale(${scale})` }}>
      <div className="relative h-20 w-28 rounded-t-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(56,73,114,0.82),rgba(15,23,39,0.96))]">
        <div className="absolute inset-x-4 bottom-0 top-6 rounded-t-[14px] border border-white/8 bg-[#0b1220]" />
        <div className="absolute -left-2 top-3 h-10 w-4 rounded-full bg-white/10" />
        <div className="absolute -right-2 top-8 h-8 w-4 rounded-full bg-white/8" />
      </div>
    </div>
  );
}

function ObsidianSpire({ left, bottom, scale = 1 }: { left: string; bottom: string; scale?: number }) {
  return (
    <div className="absolute" style={{ left, bottom, transform: `scale(${scale})` }}>
      <div className="h-24 w-16 bg-[linear-gradient(180deg,#74515c_0%,#29151c_38%,#0d0b14_100%)]" style={{ clipPath: "polygon(42% 0%,58% 8%,100% 100%,0% 100%)" }} />
      <div className="absolute left-1/2 top-[24%] h-8 w-3 -translate-x-1/2 rounded-full bg-amber-300/30 blur-md" />
    </div>
  );
}

function BannerStack({
  left,
  top,
  tone,
}: {
  left: string;
  top: string;
  tone: "sky" | "gold" | "ember";
}) {
  const fill =
    tone === "sky"
      ? "linear-gradient(180deg,#b9ddff 0%,#5c95ff 46%,#233968 100%)"
      : tone === "gold"
        ? "linear-gradient(180deg,#ffe9a6 0%,#ffb549 42%,#714214 100%)"
        : "linear-gradient(180deg,#ffc198 0%,#f56a43 42%,#672214 100%)";

  return (
    <div className="absolute flex gap-3" style={{ left, top }}>
      {[0, 1, 2].map((index) => (
        <div key={index} className="relative" style={{ opacity: 1 - index * 0.16 }}>
          <div className="h-24 w-[3px] rounded-full bg-white/16" />
          <div
            className="absolute left-[2px] top-0 h-16 w-10 origin-top-left animate-[ribbonFloat_6s_ease-in-out_infinite]"
            style={{
              background: fill,
              clipPath: "polygon(0 0,100% 10%,100% 82%,68% 100%,36% 84%,0 92%)",
              animationDelay: `${index * 0.6}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function PortalGlow() {
  return (
    <div className="absolute left-1/2 top-[34%] h-36 w-28 -translate-x-1/2 rounded-[999px] border border-sky-200/20 bg-[radial-gradient(circle,rgba(170,222,255,0.46)_0%,rgba(90,145,255,0.22)_42%,rgba(26,35,74,0.02)_76%,transparent_82%)] blur-[1px] animate-[iconBreath_6s_ease-in-out_infinite]" />
  );
}

function FestivalTent({
  left,
  bottom,
  tone,
}: {
  left: string;
  bottom: string;
  tone: "sky" | "violet" | "gold";
}) {
  const canopy =
    tone === "sky"
      ? "linear-gradient(180deg,#d7f0ff 0%,#71c1ff 44%,#2f4c92 100%)"
      : tone === "gold"
        ? "linear-gradient(180deg,#fff1ad 0%,#ffca65 44%,#7b4e16 100%)"
        : "linear-gradient(180deg,#f0d4ff 0%,#bb7cff 44%,#43215d 100%)";

  return (
    <div className="absolute" style={{ left, bottom }}>
      <div className="relative h-24 w-28">
        <div className="absolute bottom-0 left-2 right-2 h-10 rounded-t-[12px] bg-[linear-gradient(180deg,rgba(18,23,35,0.84),rgba(9,12,19,0.96))]" />
        <div className="absolute left-0 right-0 top-0 h-16" style={{ clipPath: "polygon(50% 0%,100% 52%,88% 56%,12% 56%,0 52%)", background: canopy }} />
        <div className="absolute left-1/2 top-[28%] h-9 w-[2px] -translate-x-1/2 bg-white/16" />
      </div>
    </div>
  );
}

function LanternCluster() {
  return (
    <>
      {[18, 43, 62, 81].map((left, index) => (
        <div key={left} className="absolute top-[16%]" style={{ left: `${left}%` }}>
          <div className="h-12 w-[2px] bg-white/12" />
          <div
            className="absolute left-1/2 top-10 h-10 w-8 -translate-x-1/2 rounded-[18px] border border-amber-100/24 bg-[radial-gradient(circle,rgba(255,236,164,0.8)_0%,rgba(255,193,91,0.5)_36%,rgba(134,67,23,0.68)_100%)] shadow-[0_0_24px_rgba(255,190,96,0.24)] animate-[iconBreath_4.2s_ease-in-out_infinite]"
            style={{ animationDelay: `${index * 0.6}s` }}
          />
        </div>
      ))}
    </>
  );
}

function BazaarStall({
  left,
  bottom,
  tone,
  scale,
}: {
  left: string;
  bottom: string;
  tone: "rose" | "gold" | "emerald" | "sky" | "violet";
  scale: number;
}) {
  const canopyMap = {
    rose: "linear-gradient(180deg,#ffd3d0 0%,#ff7a77 42%,#7a2631 100%)",
    gold: "linear-gradient(180deg,#fff2b0 0%,#ffc85f 44%,#7b471a 100%)",
    emerald: "linear-gradient(180deg,#dbffe3 0%,#6fe2a8 44%,#225443 100%)",
    sky: "linear-gradient(180deg,#e0f4ff 0%,#78c3ff 44%,#214a79 100%)",
    violet: "linear-gradient(180deg,#efd5ff 0%,#bf8bff 42%,#452763 100%)",
  } as const;

  return (
    <div className="absolute" style={{ left, bottom, transform: `scale(${scale})` }}>
      <div className="relative h-32 w-32">
        <div className="absolute bottom-0 left-0 right-0 h-14 rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,18,24,0.78),rgba(10,11,16,0.96))]" />
        <div className="absolute left-[14px] top-3 h-20 w-[3px] bg-white/12" />
        <div className="absolute right-[14px] top-3 h-20 w-[3px] bg-white/12" />
        <div className="absolute inset-x-0 top-0 h-14" style={{ clipPath: "polygon(7% 100%,50% 0%,93% 100%)", background: canopyMap[tone] }} />
        <div className="absolute left-1/2 top-[38%] h-7 w-7 -translate-x-1/2 rounded-full bg-white/10 blur-lg animate-[iconBreath_5.2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

function VaultPavilion() {
  return (
    <div className="absolute bottom-[19%] left-[45%]">
      <div className="relative h-40 w-44">
        <div className="absolute inset-x-5 bottom-0 h-20 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,28,0.86),rgba(9,10,16,0.98))]" />
        <div className="absolute left-[18px] right-[18px] top-0 h-20 bg-[linear-gradient(180deg,#fff1b6_0%,#f5c058_42%,#7b4318_100%)]" style={{ clipPath: "polygon(50% 0%,100% 54%,88% 60%,12% 60%,0% 54%)" }} />
        <div className="absolute left-1/2 top-[34%] h-10 w-10 -translate-x-1/2 rounded-full bg-amber-100/28 blur-xl animate-[iconBreath_4.8s_ease-in-out_infinite]" />
        <div className="absolute bottom-4 left-1/2 h-14 w-16 -translate-x-1/2 rounded-[18px] border border-amber-100/16 bg-[linear-gradient(180deg,rgba(92,61,28,0.92),rgba(28,18,13,0.98))]" />
      </div>
    </div>
  );
}

function MarketWalkway() {
  return (
    <div className="absolute bottom-[8%] left-[8%] right-[8%] h-[26%] rounded-[999px] bg-[radial-gradient(circle_at_50%_40%,rgba(255,210,132,0.16),rgba(56,32,22,0.3)_48%,rgba(9,10,14,0.9)_100%)] blur-[1px]" />
  );
}

function Roofline() {
  return (
    <>
      <div className="absolute left-[-6%] right-[-6%] top-[22%] h-16 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),transparent)]" />
      {[8, 22, 37, 54, 71, 86].map((left, index) => (
        <div
          key={left}
          className="absolute top-[22%] h-16 w-20"
          style={{
            left: `${left}%`,
            transform: `scale(${1 - index * 0.04})`,
            clipPath: "polygon(0 100%,50% 0,100% 100%)",
            background:
              "linear-gradient(180deg,rgba(255,226,170,0.08),rgba(93,53,35,0.46) 34%,rgba(12,10,14,0.92) 100%)",
          }}
        />
      ))}
    </>
  );
}

function HangingSigns() {
  return (
    <>
      {[18, 34, 58, 74].map((left, index) => (
        <div key={left} className="absolute top-[28%]" style={{ left: `${left}%` }}>
          <div className="h-9 w-[2px] bg-white/14" />
          <div
            className="absolute left-1/2 top-8 h-8 w-11 -translate-x-1/2 rounded-[12px] border border-white/10 bg-[linear-gradient(180deg,rgba(32,24,20,0.86),rgba(11,10,14,0.98))] shadow-[0_10px_18px_rgba(0,0,0,0.26)] animate-[ribbonFloat_5.4s_ease-in-out_infinite]"
            style={{ animationDelay: `${index * 0.6}s` }}
          />
        </div>
      ))}
    </>
  );
}

function CoinGlints() {
  return (
    <>
      {[20, 27, 49, 66, 82].map((left, index) => (
        <div
          key={left}
          className="absolute bottom-[20%] h-4 w-4 rounded-full bg-amber-200/28 blur-[3px] animate-[iconBreath_3.8s_ease-in-out_infinite]"
          style={{ left: `${left}%`, animationDelay: `${index * 0.4}s` }}
        />
      ))}
    </>
  );
}

function CarpetRow() {
  return (
    <>
      <div className="absolute bottom-[12%] left-[14%] h-[8%] w-[22%] rounded-[999px] bg-[linear-gradient(90deg,rgba(255,118,118,0.16),rgba(255,184,120,0.22),rgba(255,118,118,0.16))] blur-[2px]" />
      <div className="absolute bottom-[12.5%] left-[39%] h-[10%] w-[24%] rounded-[999px] bg-[linear-gradient(90deg,rgba(121,193,255,0.14),rgba(186,160,255,0.24),rgba(121,193,255,0.14))] blur-[2px]" />
      <div className="absolute bottom-[11.8%] left-[64%] h-[8%] w-[18%] rounded-[999px] bg-[linear-gradient(90deg,rgba(96,224,165,0.14),rgba(255,222,148,0.22),rgba(96,224,165,0.14))] blur-[2px]" />
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

function GrandArch() {
  return (
    <div className="absolute left-1/2 top-[30%] h-32 w-64 -translate-x-1/2 rounded-t-[999px] border border-white/10 bg-[linear-gradient(180deg,rgba(26,38,62,0.5),rgba(8,11,18,0))]" />
  );
}

function ProcessionLanterns() {
  return (
    <>
      {[28, 39, 50, 61, 72].map((left, index) => (
        <div key={left} className="absolute top-[26%]" style={{ left: `${left}%` }}>
          <div className="h-8 w-[2px] bg-white/10" />
          <div
            className="absolute left-1/2 top-7 h-5 w-5 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,240,186,0.78),rgba(255,181,109,0.36)_36%,transparent_72%)] animate-[iconBreath_4.2s_ease-in-out_infinite]"
            style={{ animationDelay: `${index * 0.4}s` }}
          />
        </div>
      ))}
    </>
  );
}

function SignalFire({ left, bottom }: { left: string; bottom: string }) {
  return (
    <div className="absolute" style={{ left, bottom }}>
      <div className="h-7 w-7 rounded-full bg-[radial-gradient(circle,rgba(255,232,173,0.84),rgba(255,151,80,0.42)_36%,transparent_72%)] animate-[iconBreath_4s_ease-in-out_infinite]" />
    </div>
  );
}

function CrystalTree({
  left,
  bottom,
  tone,
}: {
  left: string;
  bottom: string;
  tone: "sky" | "violet";
}) {
  const glow = tone === "sky" ? "rgba(129,198,255,0.34)" : "rgba(190,120,255,0.3)";
  return (
    <div className="absolute" style={{ left, bottom }}>
      <div className="absolute bottom-0 left-1/2 h-14 w-[3px] -translate-x-1/2 bg-white/10" />
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="absolute rounded-full blur-[3px] animate-[iconBreath_5s_ease-in-out_infinite]"
          style={{
            left: `${index * 12}px`,
            bottom: `${18 + index * 8}px`,
            width: 20 - index * 2,
            height: 20 - index * 2,
            background: glow,
            animationDelay: `${index * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

function TorchPair() {
  return (
    <>
      <Torch left="22%" bottom="23%" />
      <Torch left="76%" bottom="23%" />
    </>
  );
}

function Torch({ left, bottom }: { left: string; bottom: string }) {
  return (
    <div className="absolute" style={{ left, bottom }}>
      <div className="h-20 w-3 rounded-full bg-white/14" />
      <div className="absolute left-1/2 top-[-4px] h-10 w-10 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,233,170,0.84)_0%,rgba(255,165,86,0.44)_36%,rgba(255,124,52,0.1)_64%,transparent_72%)] animate-[iconBreath_4.2s_ease-in-out_infinite]" />
    </div>
  );
}
