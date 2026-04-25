"use client";

import { HomeZoneId } from "@/components/game/home/types";

const ZONE_COLORS: Record<HomeZoneId, string> = {
  fortress: "#ffd57a",
  arena: "#79d8ff",
  events: "#d698ff",
  deck: "#ffd57a",
  market: "#82f0b8",
  adventure: "#ff9a73",
};

const EVENT_ORBIT_RUNES = [
  { x: 86, y: 50, cx: 90, cy: 54, fill: "#f5dfff" },
  { x: 45, y: 81.18, cx: 49, cy: 85.18, fill: "#79d8ff" },
  { x: -37, y: 81.18, cx: -33, cy: 85.18, fill: "#f5dfff" },
  { x: -78, y: 50, cx: -74, cy: 54, fill: "#79d8ff" },
  { x: -37, y: 18.82, cx: -33, cy: 22.82, fill: "#f5dfff" },
  { x: 45, y: 18.82, cx: 49, cy: 22.82, fill: "#79d8ff" },
] as const;

const ZONE_AURA_OFFSETS = [
  { x: 0.6755, y: -0.36 },
  { x: 0, y: 0.72 },
  { x: -0.6755, y: -0.36 },
  { x: -0.6755, y: -0.36 },
  { x: 0, y: -0.72 },
  { x: 0.6755, y: -0.36 },
] as const;

export default function HomeScene({
  activeZone,
  parallax,
}: {
  activeZone: HomeZoneId | null;
  parallax: { x: number; y: number };
}) {
  const farX = parallax.x * -18;
  const farY = parallax.y * -10;
  const midX = parallax.x * -28;
  const midY = parallax.y * -16;
  const nearX = parallax.x * -44;
  const nearY = parallax.y * -24;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <style jsx global>{`
        @keyframes homeCloudDrift {
          0% { transform: translateX(-5%); }
          100% { transform: translateX(5%); }
        }
        @keyframes homeCloudDriftReverse {
          0% { transform: translateX(5%); }
          100% { transform: translateX(-5%); }
        }
        @keyframes homeFogDrift {
          0% { transform: translateX(-2%) scale(1); opacity: 0.18; }
          50% { opacity: 0.4; }
          100% { transform: translateX(2%) scale(1.06); opacity: 0.18; }
        }
        @keyframes homeWaterPan {
          0% { transform: translateX(-10%) translateY(0); opacity: 0.22; }
          50% { opacity: 0.5; }
          100% { transform: translateX(10%) translateY(2%); opacity: 0.22; }
        }
        @keyframes homeSparkle {
          0%, 100% { opacity: 0.18; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes homeBirdDrift {
          0% { transform: translate3d(0, 0, 0); opacity: 0.28; }
          50% { opacity: 0.72; }
          100% { transform: translate3d(50px, -12px, 0); opacity: 0.28; }
        }
        @keyframes homeBannerWave {
          0%, 100% { transform: rotate(-1deg) skewY(0deg); }
          50% { transform: rotate(2deg) skewY(4deg); }
        }
        @keyframes homePulseWindow {
          0%, 100% { opacity: 0.52; }
          50% { opacity: 1; }
        }
        @keyframes homeTorchFlicker {
          0%, 100% { opacity: 0.54; transform: scale(0.92); filter: drop-shadow(0 0 8px rgba(255,215,122,0.26)); }
          45% { opacity: 0.98; transform: scale(1.08); filter: drop-shadow(0 0 18px rgba(255,215,122,0.48)); }
          72% { opacity: 0.8; transform: scale(1); filter: drop-shadow(0 0 10px rgba(255,215,122,0.32)); }
        }
        @keyframes homeRuneOrbit {
          0%, 100% { opacity: 0.34; transform: translateY(0) rotate(0deg); }
          50% { opacity: 0.88; transform: translateY(-6px) rotate(18deg); }
        }
        @keyframes homeAwningSway {
          0%, 100% { transform: skewX(0deg) translateY(0); }
          50% { transform: skewX(7deg) translateY(1px); }
        }
        @keyframes homeLeafDrift {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.72; }
          60% { transform: translate3d(28px, -18px, 0) rotate(110deg); opacity: 0.92; }
          100% { transform: translate3d(54px, 16px, 0) rotate(200deg); opacity: 0; }
        }
        @keyframes homeSmokeLift {
          0% { transform: translateY(0) scale(0.9); opacity: 0.18; }
          40% { opacity: 0.34; }
          100% { transform: translateY(-24px) scale(1.24); opacity: 0; }
        }
        @keyframes homeWindmillSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes homeBoatBob {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-3px) rotate(1deg); }
        }
        @keyframes homeRunePulse {
          0%, 100% { opacity: 0.22; transform: scale(0.9); }
          50% { opacity: 0.78; transform: scale(1.08); }
        }
        @keyframes homeZoneSweep {
          0%, 100% { opacity: 0.16; transform: scaleX(0.94); }
          50% { opacity: 0.44; transform: scaleX(1.04); }
        }
        @keyframes homeAirshipDrift {
          0% { transform: translate3d(-4vw, 0, 0); }
          100% { transform: translate3d(6vw, -1.5vh, 0); }
        }
        @keyframes homeRaySweep {
          0%, 100% { opacity: 0.1; transform: translateX(-1.5%) rotate(-10deg); }
          50% { opacity: 0.28; transform: translateX(1.5%) rotate(-8deg); }
        }
        @keyframes homeHarborPulse {
          0%, 100% { opacity: 0.18; transform: scaleX(0.92); }
          50% { opacity: 0.48; transform: scaleX(1.06); }
        }
        @keyframes homeBeaconTwinkle {
          0%, 100% { opacity: 0.22; filter: drop-shadow(0 0 4px rgba(255,229,155,0.25)); }
          50% { opacity: 0.9; filter: drop-shadow(0 0 12px rgba(255,229,155,0.52)); }
        }
        .home-flag,
        .home-lantern,
        .home-window,
        .home-awning,
        .home-rune,
        .home-sail,
        .home-smoke,
        .home-windmill,
        .home-boat {
          transform-box: fill-box;
          transform-origin: center;
        }
        .home-flag { animation: homeBannerWave 3.8s ease-in-out infinite; transform-origin: top center; }
        .home-lantern { animation: homeFogDrift 5.2s ease-in-out infinite; }
        .home-window { animation: homePulseWindow 4s ease-in-out infinite; }
        .home-torch { animation: homeTorchFlicker 2.6s ease-in-out infinite; }
        .home-rune { animation: homeRuneOrbit 4.4s ease-in-out infinite; }
        .home-awning { animation: homeAwningSway 3.8s ease-in-out infinite; transform-origin: top center; }
        .home-sail { animation: homeBannerWave 4.4s ease-in-out infinite; transform-origin: left center; }
        .home-smoke { animation: homeSmokeLift 5.4s ease-out infinite; }
        .home-windmill { animation: homeWindmillSpin 10s linear infinite; transform-origin: center; }
        .home-boat { animation: homeBoatBob 4.6s ease-in-out infinite; transform-origin: center; }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(255,234,176,0.42),transparent_16%),radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.18),transparent_18%),radial-gradient(circle_at_80%_18%,rgba(126,214,255,0.14),transparent_18%),linear-gradient(180deg,#8ed2ff_0%,#6ea2e7_16%,#35588b_38%,#162846_62%,#0a1220_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_46%_26%,rgba(255,244,208,0.16),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_32%,rgba(9,14,23,0.08)_68%,rgba(6,8,14,0.3)_100%)]" />
      <div className="absolute left-[20%] top-[-8%] h-[72%] w-[18%] origin-top rotate-[-12deg] bg-[linear-gradient(180deg,rgba(255,246,207,0.28),transparent_72%)] blur-2xl" style={{ animation: "homeRaySweep 12s ease-in-out infinite" }} />
      <div className="absolute left-[43%] top-[-10%] h-[78%] w-[15%] origin-top rotate-[3deg] bg-[linear-gradient(180deg,rgba(255,236,178,0.2),transparent_74%)] blur-2xl" style={{ animation: "homeRaySweep 15s ease-in-out infinite reverse" }} />
      <div className="absolute right-[13%] top-[-6%] h-[64%] w-[16%] origin-top rotate-[12deg] bg-[linear-gradient(180deg,rgba(161,232,255,0.18),transparent_74%)] blur-2xl" style={{ animation: "homeRaySweep 14s ease-in-out infinite" }} />

      <div
        className="absolute left-[9%] top-[11%] h-24 w-56 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,250,226,0.42),rgba(255,250,226,0.08)_58%,transparent_72%)] blur-3xl"
        style={{ transform: `translate3d(${farX * 0.4}px, ${farY * 0.2}px, 0)` }}
      />
      <div
        className="absolute right-[14%] top-[20%] h-20 w-48 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(147,238,255,0.28),rgba(147,238,255,0.08)_58%,transparent_72%)] blur-3xl"
        style={{ transform: `translate3d(${farX * -0.25}px, ${farY * 0.18}px, 0)` }}
      />

      <Cloud className="left-[-8%] top-[6%] h-32 w-[34rem] opacity-60" drift="homeCloudDrift 40s linear infinite" x={farX} y={farY} />
      <Cloud className="right-[-10%] top-[14%] h-36 w-[36rem] opacity-48" drift="homeCloudDriftReverse 46s linear infinite" x={farX * -0.55} y={farY * 0.5} />
      <Cloud className="left-[4%] top-[48%] h-28 w-[28rem] opacity-26" drift="homeCloudDrift 44s linear infinite" x={midX * 0.45} y={midY * 0.18} />
      <Cloud className="right-[9%] top-[58%] h-24 w-[24rem] opacity-24" drift="homeCloudDriftReverse 36s linear infinite" x={midX * -0.4} y={midY * 0.25} />
      <Cloud className="left-[22%] top-[34%] h-24 w-[22rem] opacity-16" drift="homeCloudDrift 38s linear infinite" x={midX * 0.3} y={midY * 0.08} />

      <div className="absolute inset-x-[-12%] bottom-[18%] h-[18%] rounded-[50%] bg-white/8 blur-[70px]" style={{ animation: "homeFogDrift 18s ease-in-out infinite" }} />
      <div className="absolute inset-x-[-12%] bottom-[2%] h-[24%] rounded-[50%] bg-sky-200/10 blur-[88px]" style={{ animation: "homeFogDrift 24s ease-in-out infinite reverse" }} />

      <div className="absolute left-[56%] top-[12%] h-10 w-24 opacity-50" style={{ animation: "homeAirshipDrift 22s ease-in-out infinite" }}>
        <span className="absolute left-1/2 top-1/2 h-4 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(255,224,174,0.28),rgba(255,252,231,0.62),rgba(255,224,174,0.28))] blur-[1px]" />
        <span className="absolute left-1/2 top-[56%] h-5 w-9 -translate-x-1/2 rounded-[999px] bg-[linear-gradient(180deg,#6f4f7d,#2e2140)]" />
        <span className="absolute left-[24%] top-[63%] h-2 w-2 rounded-full bg-[#d2b2ff]" />
        <span className="absolute right-[24%] top-[63%] h-2 w-2 rounded-full bg-[#ffd57a]" />
      </div>
      <div className="absolute left-[18%] top-[16%] h-8 w-20 opacity-34" style={{ animation: "homeAirshipDrift 28s ease-in-out infinite reverse" }}>
        <span className="absolute left-1/2 top-1/2 h-3.5 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(255,224,174,0.18),rgba(255,252,231,0.42),rgba(255,224,174,0.18))] blur-[1px]" />
        <span className="absolute left-1/2 top-[58%] h-4 w-7 -translate-x-1/2 rounded-[999px] bg-[linear-gradient(180deg,#5b7a8c,#24323d)]" />
      </div>

      <div className="absolute inset-x-[12%] bottom-[7%] h-[18%] overflow-hidden rounded-[50%] opacity-80">
        <div
          className="absolute inset-[-12%] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.03)_0,rgba(255,255,255,0.16)_8%,rgba(111,202,255,0.08)_16%,rgba(255,255,255,0.02)_24%)] blur-xl"
          style={{ animation: "homeWaterPan 10s ease-in-out infinite" }}
        />
      </div>
      <div className="absolute bottom-[12%] left-[18%] h-8 w-[22%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,231,174,0.22),transparent)] blur-xl" style={{ animation: "homeHarborPulse 8s ease-in-out infinite" }} />
      <div className="absolute bottom-[11%] right-[19%] h-8 w-[24%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(126,214,255,0.18),transparent)] blur-xl" style={{ animation: "homeHarborPulse 9s ease-in-out infinite reverse" }} />

      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="homeGroundBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5c6980" />
            <stop offset="52%" stopColor="#31445d" />
            <stop offset="100%" stopColor="#162437" />
          </linearGradient>
          <linearGradient id="homeGroundFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6c765c" />
            <stop offset="36%" stopColor="#445043" />
            <stop offset="100%" stopColor="#162535" />
          </linearGradient>
          <linearGradient id="homeWaterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ea7e3" />
            <stop offset="100%" stopColor="#14345b" />
          </linearGradient>
          <linearGradient id="homeRoadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d7b37d" />
            <stop offset="100%" stopColor="#946f49" />
          </linearGradient>
          <linearGradient id="homeCliffGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4f5867" />
            <stop offset="100%" stopColor="#212a35" />
          </linearGradient>
          <radialGradient id="homeZoneSoft" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.72)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <g transform={`translate(${farX} ${farY})`}>
          <path
            d="M-30 454 112 368 240 392 372 332 512 370 666 298 850 358 1020 308 1166 364 1316 322 1480 382 1640 346v246H-30Z"
            fill="#3a5a80"
          />
          <path
            d="M-30 520 140 430 278 462 420 394 596 448 790 374 966 436 1140 390 1330 452 1640 406v258H-30Z"
            fill="url(#homeGroundBack)"
          />
          <path d="M116 414h38l22 22h-82ZM992 366h46l28 28h-102ZM1316 344h34l18 18h-70Z" fill="#506780" opacity=".44" />
          <path d="M104 414h64M986 366h82M1312 344h54" stroke="#89a5c3" strokeWidth="6" strokeLinecap="round" opacity=".36" />
        </g>

        <g transform={`translate(${midX} ${midY})`}>
          <path
            d="M-26 630c110-98 242-114 402-134 134-17 248-88 378-100 122-11 238 32 370 30 144-2 282-58 506 56v240H-26Z"
            fill="url(#homeGroundFront)"
          />
          <path
            d="M-20 710c124-34 238-40 330-10 118 39 242 42 404 4 154-37 278-32 422 14 151 48 303 43 494-14v196H-20Z"
            fill="#122235"
          />
          <path
            d="M292 534c108 66 188 92 256 98 88 8 166-12 274-58 102-44 201-60 288-56 92 4 186 34 306 108"
            fill="none"
            stroke="url(#homeRoadGradient)"
            strokeWidth="22"
            strokeLinecap="round"
            opacity=".84"
          />
          <path
            d="M292 534c108 66 188 92 256 98 88 8 166-12 274-58 102-44 201-60 288-56 92 4 186 34 306 108"
            fill="none"
            stroke="#fce8bf"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".46"
          />
          <path
            d="M712 562c-40 68-80 118-116 146-38 30-82 52-144 72"
            fill="none"
            stroke="url(#homeRoadGradient)"
            strokeWidth="18"
            strokeLinecap="round"
            opacity=".78"
          />
          <path
            d="M882 544c74 30 130 74 180 126"
            fill="none"
            stroke="url(#homeRoadGradient)"
            strokeWidth="18"
            strokeLinecap="round"
            opacity=".78"
          />
          <path
            d="M942 736c-80 32-150 44-218 42-92-2-172-26-258-72-74-40-142-56-214-54-104 3-185 36-270 92v162h1610V724c-116 46-220 62-330 50-116-12-236-50-410-56-148-4-267 18-390 64Z"
            fill="url(#homeWaterGradient)"
          />
          <path
            d="M950 734c-100 38-186 52-262 48-102-4-194-34-294-84-66-34-128-48-198-46-102 3-182 34-270 88"
            fill="none"
            stroke="#b7e9ff"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".28"
          />
          <path
            d="M760 520c22 48 56 90 98 122 34 26 70 44 108 60"
            fill="none"
            stroke="#dff7ff"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".26"
          />
        </g>

        <g transform={`translate(${midX * 0.7} ${midY * 0.8})`}>
          <ForestPatch x={218} y={602} scale={1.1} tone="#29453c" />
          <ForestPatch x={336} y={568} scale={0.92} tone="#23453a" />
          <ForestPatch x={470} y={620} scale={0.76} tone="#29463b" />
          <ForestPatch x={1088} y={606} scale={1.06} tone="#2b4a39" />
          <ForestPatch x={1290} y={530} scale={1.12} tone="#2a4733" />
          <ForestPatch x={1408} y={588} scale={0.74} tone="#29443a" />
          <RuinProp x={612} y={538} scale={0.9} />
          <RuinProp x={908} y={574} scale={0.82} />
          <BridgeProp x={850} y={678} scale={1} />
          <WindmillProp x={1160} y={582} scale={0.92} />
          <WatchTowerProp x={748} y={592} scale={0.86} />
          <CampGlowProp x={522} y={654} scale={0.88} />
          <CampGlowProp x={1228} y={640} scale={0.8} />
          <SignpostProp x={280} y={642} scale={0.8} />
          <SignpostProp x={1012} y={624} scale={0.82} />
          <LanternPostProp x={686} y={646} scale={0.86} />
          <LanternPostProp x={1186} y={618} scale={0.76} />
          <CartProp x={958} y={648} scale={0.86} />
          <CrateStackProp x={272} y={654} scale={0.74} />
          <CrateStackProp x={1068} y={648} scale={0.7} />
          <BrazierProp x={696} y={666} scale={0.78} />
          <BrazierProp x={1208} y={630} scale={0.68} />
          <PennantLineProp x={826} y={614} scale={0.92} tone="#ffd57a" accent="#79d8ff" />
          <RuneObeliskProp x={438} y={646} scale={0.58} tone="#d698ff" />
          <RuneObeliskProp x={1326} y={604} scale={0.5} tone="#82f0b8" />
          <RuinedArchProp x={1364} y={568} scale={0.78} />
          <HouseClusterProp x={756} y={664} scale={0.62} roof="#775640" wall="#9fb5c7" />
          <HouseClusterProp x={560} y={656} scale={0.54} roof="#6f503c" wall="#b2c2d0" />
          <HouseClusterProp x={1134} y={648} scale={0.58} roof="#6c4f39" wall="#c9d3b8" />
          <CrystalClusterProp x={372} y={654} scale={0.54} />
          <CrystalClusterProp x={1268} y={614} scale={0.44} />
          <RockSpireProp x={166} y={644} scale={0.64} />
          <RockSpireProp x={1446} y={614} scale={0.56} />
          <FountainProp x="908" y="648" scale="0.7" />
        </g>

        <g transform={`translate(${nearX} ${nearY})`}>
          <FortressZone active={activeZone === "fortress"} />
          <ArenaZone active={activeZone === "arena"} />
          <EventsZone active={activeZone === "events"} />
          <DeckZone active={activeZone === "deck"} />
          <MarketZone active={activeZone === "market"} />
          <AdventureZone active={activeZone === "adventure"} />
        </g>
      </svg>

      <div className="absolute inset-0">
        <Spark x="15%" y="18%" size="0.34rem" delay="0s" />
        <Spark x="22%" y="56%" size="0.4rem" delay=".5s" />
        <Spark x="36%" y="24%" size="0.3rem" delay="1.2s" />
        <Spark x="49%" y="38%" size="0.42rem" delay=".7s" />
        <Spark x="64%" y="63%" size="0.36rem" delay="1.4s" />
        <Spark x="76%" y="35%" size="0.36rem" delay=".2s" />
        <Spark x="88%" y="52%" size="0.46rem" delay="1.1s" />
        <Spark x="58%" y="50%" size="0.28rem" delay=".9s" />
        <Spark x="31%" y="61%" size="0.34rem" delay="1.8s" />
        <Spark x="18%" y="72%" size="0.28rem" delay="2.2s" />
        <Spark x="44%" y="67%" size="0.32rem" delay="2.7s" />
        <Spark x="72%" y="58%" size="0.3rem" delay="2.4s" />
        <Spark x="84%" y="69%" size="0.32rem" delay="3s" />
        <Firefly left="27%" top="72%" delay="0s" />
        <Firefly left="31%" top="69%" delay="1.2s" />
        <Firefly left="69%" top="75%" delay=".6s" />
        <Firefly left="61%" top="69%" delay="1.6s" />
        <Firefly left="79%" top="67%" delay=".9s" />
        <Bird left="41%" top="13%" delay="0s" />
        <Bird left="46%" top="15%" delay=".8s" />
        <Bird left="52%" top="12%" delay="1.6s" />
        <Bird left="57%" top="18%" delay=".4s" />
        <Leaf left="73%" top="69%" delay="0s" />
        <Leaf left="78%" top="63%" delay="1.4s" />
        <Leaf left="12%" top="74%" delay=".8s" />
        <Leaf left="64%" top="74%" delay="2.1s" />
        <BeaconGlint left="24%" top="52%" delay=".2s" />
        <BeaconGlint left="48%" top="47%" delay="1.4s" />
        <BeaconGlint left="67%" top="54%" delay=".9s" />
        <BeaconGlint left="81%" top="43%" delay="1.9s" />
      </div>
    </div>
  );
}

function Cloud({
  className,
  drift,
  x,
  y,
}: {
  className: string;
  drift: string;
  x: number;
  y: number;
}) {
  return (
    <div className={`absolute transition-transform duration-700 ${className}`} style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}>
      <div
        className="h-full w-full rounded-[999px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.42),rgba(255,255,255,0.14)_48%,rgba(255,255,255,0)_78%)] blur-3xl"
        style={{ animation: drift }}
      />
    </div>
  );
}

function Spark({ x, y, size, delay }: { x: string; y: string; size: string; delay: string }) {
  return (
    <span
      className="absolute rounded-full bg-[#fff5cc] blur-[1px]"
      style={{ left: x, top: y, width: size, height: size, animation: `homeSparkle 3.4s ease-in-out ${delay} infinite` }}
    />
  );
}

function Firefly({ left, top, delay }: { left: string; top: string; delay: string }) {
  return (
    <span
      className="absolute h-3 w-3 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,243,178,0.92),rgba(255,243,178,0.18)_62%,transparent_76%)] blur-[0.4px]"
      style={{ left, top, animation: `homeRunePulse 5s ease-in-out ${delay} infinite` }}
    />
  );
}

function Bird({ left, top, delay }: { left: string; top: string; delay: string }) {
  return (
    <span className="absolute h-3 w-5 opacity-60" style={{ left, top, animation: `homeBirdDrift 9s ease-in-out ${delay} infinite` }}>
      <span className="absolute left-0 top-1 h-[2px] w-3 rotate-[-20deg] rounded-full bg-white/80" />
      <span className="absolute right-0 top-1 h-[2px] w-3 rotate-[20deg] rounded-full bg-white/80" />
    </span>
  );
}

function Leaf({ left, top, delay }: { left: string; top: string; delay: string }) {
  return (
    <span
      className="absolute h-3.5 w-2.5 rounded-[80%_20%_80%_20%] bg-[linear-gradient(180deg,rgba(255,220,150,0.82),rgba(255,145,104,0.56))] blur-[0.4px]"
      style={{ left, top, animation: `homeLeafDrift 7.6s ease-in-out ${delay} infinite` }}
    />
  );
}

function BeaconGlint({ left, top, delay }: { left: string; top: string; delay: string }) {
  return (
    <span className="absolute h-7 w-7 rounded-full" style={{ left, top, animation: `homeBeaconTwinkle 4.8s ease-in-out ${delay} infinite` }}>
      <span className="absolute left-1/2 top-1/2 h-[2px] w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffe59b]/70" />
      <span className="absolute left-1/2 top-1/2 h-7 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffe59b]/64" />
      <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff3c7]" />
    </span>
  );
}

function ZoneAura({
  cx,
  cy,
  rx,
  ry,
  zone,
  active,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  zone: HomeZoneId;
  active: boolean;
}) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={ZONE_COLORS[zone]} opacity={active ? 0.22 : 0.1} />
      <ellipse cx={cx} cy={cy} rx={rx * 0.72} ry={ry * 0.54} fill={ZONE_COLORS[zone]} opacity={active ? 0.16 : 0.06} />
      {active ? (
        <>
          <ellipse cx={cx} cy={cy - ry * 0.18} rx={rx * 0.36} ry={ry * 0.92} fill={ZONE_COLORS[zone]} opacity={0.12} className="home-window" />
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx * 0.82}
            ry={ry * 0.82}
            fill="none"
            stroke={ZONE_COLORS[zone]}
            strokeWidth={2.5}
            opacity={0.32}
            style={{ animation: "homeZoneSweep 2.8s ease-in-out infinite" }}
          />
        </>
      ) : null}
      <ellipse cx={cx} cy={cy} rx={rx * 0.94} ry={ry * 0.9} fill="none" stroke={ZONE_COLORS[zone]} strokeWidth={active ? 8 : 4} opacity={active ? 0.82 : 0.34} />
      {active ? ZONE_AURA_OFFSETS.map((point, index) => {
        const x = Number((cx + point.x * rx).toFixed(2));
        const y = Number((cy + point.y * ry).toFixed(2));
        return (
        <rect
          key={`${zone}-${index}`}
          x={x - 4.5}
          y={y - 4.5}
          width="9"
          height="9"
          rx="1.4"
          transform={`rotate(45 ${x} ${y})`}
          fill={ZONE_COLORS[zone]}
          opacity={0.82}
          className="home-rune"
          style={{ animationDelay: `${index * 0.22}s` }}
        />
        );
      }) : null}
    </g>
  );
}

function FortressZone({ active }: { active: boolean }) {
  return (
    <g transform="translate(804 344)">
      <ZoneAura cx={0} cy={194} rx={216} ry={82} zone="fortress" active={active} />
      <ellipse cx="0" cy="234" rx="234" ry="52" fill="#1c3148" opacity=".92" />
      <path d="M-238 214c58-100 136-150 238-150 104 0 182 50 238 150l-40 34H-198Z" fill="#2e4b68" />
      <path d="M-206 202c66-74 134-112 206-112 74 0 142 38 206 112l-28 26H-178Z" fill="#557597" />
      <path d="M-174 216h348l-24 58H-150Z" fill="#425970" />
      <path d="M-84 216h168l-14 22H-70Z" fill="#2f4154" opacity=".82" />
      <path d="M-30 244c0 30-10 52-18 70h36c-8-18-18-40-18-70Z" fill="#56bff0" opacity=".82" />
      <path d="M-26 236c0 24-6 42-10 56h20c-4-14-10-32-10-56Z" fill="#a8eeff" opacity=".48" />
      <ellipse cx="0" cy="244" rx="88" ry="20" fill="#65cbff" opacity=".28" className="home-window" />
      <path d="M-164 182h328l-8 42H-156Z" fill="#e4edf8" stroke="#31485f" strokeWidth="8" />
      <path d="M-198 196h42v74h-42zM156 196h42v74h-42z" fill="#cfdaea" stroke="#31485f" strokeWidth="8" />
      <path d="M-132 142h48v86h-48zM-74 114h62v114h-62zM-6 86h92v146H-6zM96 118h58v110H96z" fill="#f0f5fb" stroke="#31485f" strokeWidth="8" />
      <path d="M-20 86 20 22l40 64" fill="#f5d68a" stroke="#7b5320" strokeWidth="8" strokeLinejoin="round" />
      <path d="M-78 114-50 72-22 114M96 118l30-46 30 46" fill="#d8e5f3" stroke="#31485f" strokeWidth="8" strokeLinejoin="round" />
      {[-118, -104, -90, -56, -40, -24, 22, 40, 58, 110, 126, 142].map((x, index) => (
        <rect key={`fort-window-${x}`} x={x} y={index < 3 ? 164 : index < 9 ? 138 : 162} width="8" height="14" rx="3" className="home-window" fill="#ffe49a" opacity=".86" />
      ))}
      {[-154, -126, -98, -66, -34, -2, 30, 62, 94, 126, 154].map((x) => (
        <path key={`fort-crenel-${x}`} d={`M${x} 174h14v16h-14Z`} fill="#d8e5f3" stroke="#31485f" strokeWidth="3" />
      ))}
      <path d="M-10 182h36v54h-36zM34 182h36v54H34z" fill="#8e5c3f" stroke="#31485f" strokeWidth="8" />
      <path d="M-72 224h160l-18 28H-54Z" fill="#344a5f" opacity=".92" />
      <path d="M-42 252h84l-10 20H-32Z" fill="#8a6b4d" stroke="#5a4230" strokeWidth="6" strokeLinejoin="round" />
      <path d="M-20 252v20M0 252v22M20 252v20" stroke="#d7b27d" strokeWidth="4" strokeLinecap="round" />
      <path d="M-92 252H92" stroke="#d6b27d" strokeWidth="9" strokeLinecap="round" opacity=".82" />
      <path d="M-126 224-46 282M126 224 46 282" stroke="#8a7456" strokeWidth="6" strokeLinecap="round" opacity=".74" />
      <path d="M-166 186v48M166 186v48" stroke="#31485f" strokeWidth="8" strokeLinecap="round" />
      <path d="M-166 194h22l10 12-10 12h-22ZM166 194h-22l-10 12 10 12h22Z" fill="#f5d48c" stroke="#7b5320" strokeWidth="5" strokeLinejoin="round" />
      <rect x="14" y="130" width="16" height="28" rx="4" className="home-window" fill="#ffe49a" />
      <rect x="-104" y="158" width="12" height="18" rx="4" className="home-window" fill="#ffe49a" />
      <rect x="120" y="158" width="12" height="18" rx="4" className="home-window" fill="#ffe49a" />
      <circle cx="-28" cy="184" r="7" className="home-torch" fill="#ffd57a" opacity=".86" />
      <circle cx="28" cy="184" r="7" className="home-torch" fill="#ffd57a" opacity=".86" />
      <circle cx="-172" cy="210" r="6" className="home-torch" fill="#ffd57a" opacity=".76" />
      <circle cx="172" cy="210" r="6" className="home-torch" fill="#ffd57a" opacity=".76" style={{ animationDelay: "1s" }} />
      <g className="home-flag" style={{ animationDelay: ".1s" }}>
        <path d="M26 34v52" stroke="#31485f" strokeWidth="6" strokeLinecap="round" />
        <path d="M30 38h30l-12 14 12 12H30Z" fill="#ff7f67" stroke="#7d3524" strokeWidth="4" strokeLinejoin="round" />
      </g>
      <g className="home-flag" style={{ animationDelay: ".9s" }}>
        <path d="M-52 74v40" stroke="#31485f" strokeWidth="6" strokeLinecap="round" />
        <path d="M-48 78h24l-8 10 8 8h-24Z" fill="#79d8ff" stroke="#1f4964" strokeWidth="4" strokeLinejoin="round" />
      </g>
      <g className="home-flag" style={{ animationDelay: "1.4s" }}>
        <path d="M116 78v40" stroke="#31485f" strokeWidth="6" strokeLinecap="round" />
        <path d="M120 82h24l-8 10 8 8h-24Z" fill="#ffd57a" stroke="#714f1b" strokeWidth="4" strokeLinejoin="round" />
      </g>
      <Statue x={-214} y={216} tone="#aebbc8" />
      <Statue x={214} y={216} tone="#aebbc8" />
      <WatchTowerProp x={-132} y={232} scale={0.58} />
      <WatchTowerProp x={132} y={232} scale={0.58} />
      <HouseClusterProp x={-204} y={246} scale={0.72} roof="#7d5b43" wall="#a6bacd" />
      <HouseClusterProp x={202} y={248} scale={0.68} roof="#7b5a44" wall="#aabfd1" />
      <LanternPostProp x={-138} y={272} scale={0.86} />
      <LanternPostProp x={142} y={272} scale={0.86} />
      <CartProp x={-82} y={278} scale={0.86} />
      <CartProp x={90} y={278} scale={0.82} />
      <CrateStackProp x={-132} y={286} scale={0.76} />
      <CrateStackProp x={132} y={286} scale={0.72} />
      <BrazierProp x={-64} y={284} scale={0.74} />
      <BrazierProp x={66} y={284} scale={0.74} />
      <PennantLineProp x={0} y={176} scale={0.9} tone="#ff8f69" accent="#79d8ff" />
      <SignpostProp x={-40} y={286} scale={0.84} />
      <SignpostProp x={42} y={286} scale={0.84} />
      <ForestPatch x={-194} y={244} scale={0.58} tone="#2c4c3c" />
      <ForestPatch x={194} y={248} scale={0.54} tone="#2d503d" />
    </g>
  );
}

function ArenaZone({ active }: { active: boolean }) {
  return (
    <g transform="translate(286 420)">
      <ZoneAura cx={0} cy={142} rx={150} ry={60} zone="arena" active={active} />
      <ellipse cx="0" cy="166" rx="124" ry="36" fill="#6c4327" />
      <path d="M-120 152c0-90 54-146 120-146 68 0 120 56 120 146v34H-120Z" fill="#c89663" stroke="#5a341a" strokeWidth="10" />
      <path d="M-100 160c0-64 42-102 100-102 58 0 100 38 100 102v14H-100Z" fill="#6b3f24" stroke="#5a341a" strokeWidth="8" />
      <path d="M-88 98h176M-92 120h184M-96 140h192" stroke="#8e643b" strokeWidth="6" strokeLinecap="round" opacity=".84" />
      {[-86, -64, -42, -20, 20, 42, 64, 86].map((x, index) => (
        <path key={`arena-arch-${x}`} d={`M${x - 7} 104c0-12 14-12 14 0v22h-14Z`} fill="#3d251b" opacity=".74" />
      ))}
      {[-96, -76, -54, -30, -8, 14, 38, 62, 84, 104].map((x, index) => (
        <circle key={`arena-crowd-${x}`} cx={x} cy={82 + (index % 2) * 18} r="4" className="home-window" fill={index % 3 === 0 ? "#ffd57a" : "#ff9a73"} opacity=".58" />
      ))}
      <ellipse cx="0" cy="154" rx="58" ry="20" fill="#d0a169" opacity=".78" />
      <ellipse cx="0" cy="154" rx="38" ry="12" fill="none" stroke="#ffe7bd" strokeWidth="4" opacity=".54" />
      <path d="M-28 150 0 130l28 20" stroke="#ffe9c8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
      <path d="M0 130v34" stroke="#ffe9c8" strokeWidth="4" strokeLinecap="round" opacity=".82" />
      <path d="M-42 164c10-12 24-18 42-18s32 6 42 18" fill="none" stroke="#ffe8c6" strokeWidth="4" strokeLinecap="round" opacity=".56" />
      <g className="home-flag">
        <path d="M-76 44v40" stroke="#5a341a" strokeWidth="6" strokeLinecap="round" />
        <path d="M-72 46h28l-8 12 8 10h-28Z" fill="#79d8ff" stroke="#1f4964" strokeWidth="3" strokeLinejoin="round" />
      </g>
      <g className="home-flag" style={{ animationDelay: "1s" }}>
        <path d="M78 44v40" stroke="#5a341a" strokeWidth="6" strokeLinecap="round" />
        <path d="M82 46h28l-8 12 8 10H82Z" fill="#ff876b" stroke="#7d3524" strokeWidth="3" strokeLinejoin="round" />
      </g>
      <g className="home-flag" style={{ animationDelay: "1.5s" }}>
        <path d="M0 20v26" stroke="#5a341a" strokeWidth="5" strokeLinecap="round" />
        <path d="M4 22h18l-6 8 6 8H4Z" fill="#ffd57a" stroke="#714f1b" strokeWidth="3" strokeLinejoin="round" />
      </g>
      <path d="M-126 154h28l-10 22h-20ZM108 154h28l-10 22h-18Z" fill="#6e4328" />
      <circle cx="-68" cy="68" r="7" className="home-torch" fill="#ffd57a" opacity=".86" />
      <circle cx="68" cy="68" r="7" className="home-torch" fill="#ffd57a" opacity=".86" />
      <Statue x={-140} y={126} tone="#aebbc8" />
      <Statue x={140} y={126} tone="#aebbc8" />
      <path d="M-18 118h36l-6 12H-12Z" fill="#7a4a2a" stroke="#5a341a" strokeWidth="4" strokeLinejoin="round" />
      <path d="M-8 108 0 94l8 14" fill="#79d8ff" stroke="#1f4964" strokeWidth="3" strokeLinejoin="round" />
      <StoneCircleProp x="0" y="146" scale="0.86" />
      <LanternPostProp x={-104} y={176} scale={0.76} />
      <LanternPostProp x={106} y={176} scale={0.76} />
      <CampGlowProp x={-84} y={176} scale={0.5} />
      <CampGlowProp x={84} y={176} scale={0.5} />
      <CrateStackProp x={-122} y={178} scale={0.62} />
      <CrateStackProp x={120} y={178} scale={0.58} />
      <PennantLineProp x={0} y={88} scale={0.82} tone="#79d8ff" accent="#ff8f69" />
      <SignpostProp x={-46} y={182} scale={0.74} />
      <SignpostProp x={46} y={182} scale={0.74} />
    </g>
  );
}

function EventsZone({ active }: { active: boolean }) {
  return (
    <g transform="translate(422 620)">
      <ZoneAura cx={0} cy={82} rx={126} ry={48} zone="events" active={active} />
      <ellipse cx="0" cy="102" rx="108" ry="32" fill="#262247" />
      <ellipse cx="0" cy="88" rx="54" ry="20" fill="#7f68ff" opacity=".22" className="home-window" />
      <path d="M-18 94c0-64 8-118 18-150 16 32 24 88 24 150" fill="#8f73ff" stroke="#33235a" strokeWidth="8" />
      <path d="M-72 88c16-40 34-58 54-58 18 0 34 18 50 58" fill="none" stroke="#58498b" strokeWidth="14" strokeLinecap="round" />
      <path d="M18 20c18-28 36-40 56-40 18 0 34 14 46 42" fill="none" stroke="#7d6cff" strokeWidth="8" strokeLinecap="round" opacity=".86" />
      <path d="M-10 10c40 12 64 40 76 88-24 10-44 10-60 0" fill="none" stroke="#c99bff" strokeWidth="14" strokeLinecap="round" />
      <path d="M10 12c-38 12-62 40-74 88 24 10 44 10 60 0" fill="none" stroke="#73d7ff" strokeWidth="14" strokeLinecap="round" opacity=".82" />
      <path d="M-84 98c18-38 34-56 52-56 14 0 26 18 36 56M18 100c16-50 30-74 48-74 18 0 32 24 46 74" fill="none" stroke="#4c4378" strokeWidth="20" strokeLinecap="round" />
      <ellipse cx="8" cy="54" rx="56" ry="24" fill="none" stroke="#f3dcff" strokeWidth="4" opacity=".58" />
      <ellipse cx="8" cy="54" rx="70" ry="30" fill="none" stroke="#79d8ff" strokeWidth="2.5" opacity=".34" className="home-rune" />
      {EVENT_ORBIT_RUNES.map((rune, index) => (
        <rect key={`event-orbit-${index}`} x={rune.x} y={rune.y} width="8" height="8" rx="1.5" transform={`rotate(45 ${rune.cx} ${rune.cy})`} className="home-rune" fill={rune.fill} opacity=".74" />
      ))}
      <path d="M-60 94-44 24-22 94Z" fill="#8d73ff" stroke="#2a2554" strokeWidth="6" strokeLinejoin="round" />
      <path d="M8 100 30 12l24 88Z" fill="#ce8cff" stroke="#442764" strokeWidth="6" strokeLinejoin="round" />
      <path d="M62 92 82 34l20 58Z" fill="#79d8ff" stroke="#1f4964" strokeWidth="6" strokeLinejoin="round" />
      <circle cx="-44" cy="20" r="6" className="home-window" fill="#f8e0ff" />
      <circle cx="2" cy="8" r="6" className="home-window" fill="#fff0ff" />
      <circle cx="78" cy="28" r="6" className="home-window" fill="#e5f7ff" />
      <rect x="-76" y="16" width="7" height="7" rx="1.2" transform="rotate(45 -72.5 19.5)" className="home-rune" fill="#f6e3ff" opacity=".84" />
      <rect x="-6" y="-4" width="8" height="8" rx="1.2" transform="rotate(45 -2 0)" className="home-rune" fill="#fff3ff" opacity=".9" style={{ animationDelay: ".8s" }} />
      <rect x="80" y="20" width="7" height="7" rx="1.2" transform="rotate(45 83.5 23.5)" className="home-rune" fill="#dff7ff" opacity=".86" style={{ animationDelay: "1.5s" }} />
      <g className="home-rune">
        <ellipse cx="0" cy="46" rx="38" ry="16" fill="none" stroke="#f5dfff" strokeWidth="4" opacity=".64" />
      </g>
      <CrystalClusterProp x={-106} y={98} scale={0.72} />
      <CrystalClusterProp x={112} y={100} scale={0.64} />
      <CampGlowProp x={-92} y={108} scale={0.42} />
      <CampGlowProp x={108} y={112} scale={0.42} />
      <RuneObeliskProp x={-118} y={104} scale={0.62} tone="#79d8ff" />
      <RuneObeliskProp x={124} y={106} scale={0.58} tone="#d698ff" />
      <PennantLineProp x={12} y={78} scale={0.7} tone="#d698ff" accent="#79d8ff" />
      <ForestPatch x={-120} y={98} scale={0.42} tone="#2b4d45" />
      <ForestPatch x={120} y={100} scale={0.38} tone="#2b4d45" />
    </g>
  );
}

function DeckZone({ active }: { active: boolean }) {
  return (
    <g transform="translate(642 698)">
      <ZoneAura cx={0} cy={44} rx={132} ry={40} zone="deck" active={active} />
      <ellipse cx="0" cy="62" rx="116" ry="28" fill="#203d59" />
      <path d="M-118 56h236l-22 26H-96Z" fill="#4b657f" />
      <path d="M-42 10h84v46h-84z" fill="#876243" stroke="#4a2e1b" strokeWidth="6" />
      <path d="M-54 10 0-22l58 32" fill="#cb9564" stroke="#4a2e1b" strokeWidth="6" strokeLinejoin="round" />
      {[-34, -18, 18, 34].map((x) => (
        <rect key={`deck-window-${x}`} x={x - 5} y="22" width="10" height="14" rx="3" className="home-window" fill="#ffe4a4" opacity=".78" />
      ))}
      {[-86, -68, 58, 74].map((x, index) => (
        <g key={`deck-card-${x}`} className="home-rune" style={{ animationDelay: `${index * 0.45}s` }}>
          <rect x={x} y={index % 2 ? 14 : 2} width="16" height="22" rx="4" fill="#dff7ff" stroke="#4b6780" strokeWidth="2" transform={`rotate(${index % 2 ? 12 : -12} ${x + 8} ${index % 2 ? 25 : 13})`} />
          <circle cx={x + 8} cy={index % 2 ? 25 : 13} r="3" fill="#ffd57a" />
        </g>
      ))}
      <path d="M-6 22h18v18H-6z" className="home-window" fill="#ffe4a4" />
      <path d="M-6 -6h12l6 10H-12Z" fill="#ffe5ba" stroke="#6a4c2c" strokeWidth="3" strokeLinejoin="round" />
      <path d="M60 12c26 0 48 4 74 18-16 14-30 32-40 52-12-14-26-28-34-70Z" fill="#5f7fa2" />
      <path d="M84 6v56" stroke="#4a2e1b" strokeWidth="5" strokeLinecap="round" />
      <g className="home-flag">
        <path d="M88 10h26l-8 10 8 10H88Z" fill="#ffd57a" stroke="#714f1b" strokeWidth="3" strokeLinejoin="round" />
      </g>
      <path d="M-76 50h34v10h-34zM-72 62h26v8h-26z" fill="#2b3644" opacity=".68" />
      <circle cx="-24" cy="8" r="5" className="home-lantern" fill="#ffd57a" opacity=".78" />
      <circle cx="22" cy="6" r="5" className="home-lantern" fill="#ffd57a" opacity=".72" style={{ animationDelay: "1s" }} />
      <DockProp x={-122} y={70} scale={0.82} />
      <DockProp x={110} y={70} scale={0.78} reverse />
      <g className="home-boat" style={{ animationDelay: ".4s" }}>
        <path d="M-114 68h64l-12 10h-40Z" fill="#7a573c" />
        <path d="M-80 24v44" stroke="#5b3c26" strokeWidth="4" strokeLinecap="round" />
        <path d="M-78 28h24l-12 20h-12Z" className="home-sail" fill="#f0f5ff" stroke="#7b92ab" strokeWidth="3" strokeLinejoin="round" />
      </g>
      <g className="home-boat" style={{ animationDelay: "1.5s" }}>
        <path d="M54 68h56l-12 10H66Z" fill="#6d4c37" />
        <path d="M82 34v34" stroke="#5b3c26" strokeWidth="4" strokeLinecap="round" />
        <path d="M84 36h22l-8 16H84Z" className="home-sail" fill="#fff4d9" stroke="#b3874a" strokeWidth="3" strokeLinejoin="round" />
      </g>
      <path d="M-48 48h28M-46 56h24" stroke="#f5e0b8" strokeWidth="4" strokeLinecap="round" opacity=".62" />
      <LanternPostProp x={-128} y={72} scale={0.76} />
      <LanternPostProp x={128} y={72} scale={0.76} />
      <CartProp x={-18} y={74} scale={0.76} />
      <CrateStackProp x={-86} y={74} scale={0.6} />
      <CrateStackProp x={92} y={74} scale={0.56} />
      <PennantLineProp x={12} y={26} scale={0.76} tone="#ffd57a" accent="#f4f8ff" />
      <HouseClusterProp x={-10} y={68} scale={0.58} roof="#6a4d37" wall="#96abc0" />
    </g>
  );
}

function MarketZone({ active }: { active: boolean }) {
  return (
    <g transform="translate(1042 690)">
      <ZoneAura cx={0} cy={54} rx={140} ry={42} zone="market" active={active} />
      <ellipse cx="0" cy="70" rx="116" ry="30" fill="#35513d" />
      <path d="M-118 60h236l-16 24H-102Z" fill="#56735a" />
      <path d="M-92 16h62v34h-62z" fill="#9a5c39" stroke="#4a2718" strokeWidth="6" rx="6" />
      <path d="M-98 16h74l-10-22h-54Z" className="home-awning" fill="#ff8d6d" stroke="#4a2718" strokeWidth="6" strokeLinejoin="round" />
      <path d="M-10 22h54v28H-10z" fill="#8f5f38" stroke="#4a2718" strokeWidth="6" rx="5" />
      <path d="M-16 22h66L40 2H2Z" className="home-awning" fill="#6ee0a4" stroke="#2c513b" strokeWidth="6" strokeLinejoin="round" />
      <path d="M54 26h42v28H54z" fill="#8b5a33" stroke="#4a2718" strokeWidth="6" rx="5" />
      <path d="M48 26h54L94 8H56Z" className="home-awning" fill="#79d8ff" stroke="#1f4964" strokeWidth="6" strokeLinejoin="round" />
      <path d="M-110 44h24l8 12h-30ZM102 44h24l8 12h-30Z" fill="#6d4c37" stroke="#4a2718" strokeWidth="4" strokeLinejoin="round" />
      <path d="M-58 18-52-6M-28 18l6-22M26 22l8-22M56 24l8-18" stroke="#ffe1bf" strokeWidth="4" strokeLinecap="round" />
      {[-82, -66, -38, -18, 32, 52, 82].map((x, index) => (
        <circle key={`market-goods-${x}`} cx={x} cy={56 + (index % 2) * 5} r={index % 3 === 0 ? 6 : 4} fill={index % 3 === 0 ? "#ffd57a" : index % 3 === 1 ? "#82f0b8" : "#79d8ff"} opacity=".78" />
      ))}
      {[-76, -48, -14, 44, 74].map((x) => (
        <path key={`market-cloth-${x}`} d={`M${x} 48h18l-4 10h-14Z`} fill="#f3ddbd" opacity=".64" />
      ))}
      <FountainProp x="4" y="62" scale="0.78" />
      <path d="M72 16a22 22 0 1 1 0 44 22 22 0 0 1 0-44Zm0 10v24M60 38h24" fill="none" stroke="#b6f6cd" strokeWidth="6" strokeLinecap="round" opacity=".9" />
      <circle cx="72" cy="38" r="8" className="home-window" fill="#82f0b8" />
      <circle cx="-56" cy="14" r="6" className="home-lantern" fill="#ffd57a" opacity=".76" />
      <circle cx="18" cy="14" r="5" className="home-lantern" fill="#ffd57a" opacity=".72" style={{ animationDelay: "1s" }} />
      <circle cx="58" cy="12" r="5" className="home-lantern" fill="#ffd57a" opacity=".72" style={{ animationDelay: "1.8s" }} />
      <path d="M-92 12h18l-4 10h-10ZM92 12h18l-4 10h-10Z" fill="#ffd57a" stroke="#6f5221" strokeWidth="3" strokeLinejoin="round" />
      <path d="M-52 30h20M-52 40h28" stroke="#ffe1bf" strokeWidth="4" strokeLinecap="round" />
      <path d="M20 34h18M16 42h24" stroke="#d8ffee" strokeWidth="4" strokeLinecap="round" />
      <path d="M58 34h12M54 42h18" stroke="#dff7ff" strokeWidth="4" strokeLinecap="round" />
      <path d="M-104 54h20v10h-20zM-76 56h12v8h-12zM-28 56h14v8h-14zM58 56h14v8H58z" fill="#5d3b28" opacity=".76" />
      <CartProp x={-120} y={72} scale={0.8} />
      <CartProp x={108} y={72} scale={0.74} />
      <LanternPostProp x={-20} y={74} scale={0.74} />
      <CrateStackProp x={-54} y={74} scale={0.64} />
      <CrateStackProp x={92} y={74} scale={0.58} />
      <PennantLineProp x={0} y={20} scale={0.9} tone="#ff8d6d" accent="#79d8ff" />
      <HouseClusterProp x={120} y={68} scale={0.52} roof="#6c4e36" wall="#c7d7bf" />
    </g>
  );
}

function AdventureZone({ active }: { active: boolean }) {
  return (
    <g transform="translate(1294 434)">
      <ZoneAura cx={0} cy={132} rx={152} ry={52} zone="adventure" active={active} />
      <ellipse cx="0" cy="156" rx="118" ry="32" fill="#2f4631" />
      <path d="M-112 154c34-104 82-154 112-154 26 0 72 50 108 154H-112Z" fill="#476344" />
      <path d="M-90 146c22-62 44-100 74-126M92 146C70 84 44 48 12 20" fill="none" stroke="#284f34" strokeWidth="18" strokeLinecap="round" />
      <path d="M-44 146V46h88v100" fill="#8b6a47" stroke="#402b1c" strokeWidth="8" />
      <path d="M-74 146h148l30 28H-104Z" fill="#5d4431" stroke="#402b1c" strokeWidth="8" strokeLinejoin="round" />
      <path d="M-26 46 0 2l26 44" fill="#b4da8a" stroke="#21412c" strokeWidth="8" strokeLinejoin="round" />
      {[-28, -14, 14, 28].map((x) => (
        <rect key={`adv-window-${x}`} x={x - 4} y="64" width="8" height="14" rx="3" className="home-window" fill="#ffd57a" opacity=".74" />
      ))}
      {[0, 1, 2].map((index) => (
        <path key={`adv-claw-${index}`} d={`M${-62 + index * 18} 150c8-12 14-12 22 0`} fill="none" stroke="#ffd8a8" strokeWidth="3" strokeLinecap="round" opacity=".58" />
      ))}
      <path d="M-8 84h16v40H-8z" className="home-window" fill="#ffd57a" />
      <path d="M-22 174c28 12 50 16 68 16 22 0 44-6 72-20" fill="none" stroke="#d6b27d" strokeWidth="6" strokeLinecap="round" opacity=".64" />
      <path d="M-18 182c20 8 38 10 54 10 18 0 36-4 58-14" fill="none" stroke="#ffe7b4" strokeWidth="2.5" strokeLinecap="round" opacity=".52" />
      <circle cx="-28" cy="130" r="6" className="home-torch" fill="#ffd57a" opacity=".84" />
      <circle cx="28" cy="130" r="6" className="home-torch" fill="#ffd57a" opacity=".84" style={{ animationDelay: ".8s" }} />
      <path d="M34 44v38" stroke="#402b1c" strokeWidth="5" strokeLinecap="round" />
      <path d="M38 46h24l-8 10 8 10H38Z" className="home-flag" fill="#ff8f69" stroke="#7d3524" strokeWidth="3" strokeLinejoin="round" />
      <path d="M56 98c10 10 18 26 18 44" fill="none" stroke="#ff9a73" strokeWidth="8" strokeLinecap="round" opacity=".72" />
      <path d="M74 98c18 14 30 34 34 60" fill="none" stroke="#ffd8a8" strokeWidth="4" strokeLinecap="round" opacity=".5" />
      <path d="M-144 154h32l-10 24h-18ZM112 154h32l-10 24h-18Z" fill="#334436" />
      <path d="M98 162h48l40 26" stroke="#7a6249" strokeWidth="6" strokeLinecap="round" />
      <path d="M-94 170H94" stroke="#d0b388" strokeWidth="5" strokeLinecap="round" opacity=".66" />
      <WatchTowerProp x={130} y={134} scale={0.56} />
      <RuinedArchProp x={-128} y={140} scale={0.64} />
      <SignpostProp x={90} y={182} scale={0.82} />
      <SignpostProp x={-90} y={182} scale={0.82} />
      <BrazierProp x={-66} y={182} scale={0.68} />
      <BrazierProp x={68} y={182} scale={0.68} />
      <RuneObeliskProp x={-118} y={172} scale={0.52} tone="#ff9a73" />
      <RuneObeliskProp x={118} y={170} scale={0.48} tone="#ffd57a" />
      <CampGlowProp x={114} y={178} scale={0.42} />
      <CampGlowProp x={-116} y={176} scale={0.38} />
      <RockSpireProp x={-140} y={146} scale={0.66} />
      <RockSpireProp x={146} y={154} scale={0.6} />
    </g>
  );
}

function ForestPatch({ x, y, scale, tone }: { x: number; y: number; scale: number; tone: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="26" rx="46" ry="14" fill="#162732" opacity=".4" />
      <path d="M-32 24-18-10-4 24Z" fill={tone} />
      <path d="M-8 26 6-18 22 26Z" fill={tone} opacity=".96" />
      <path d="M18 24 34-8 48 24Z" fill={tone} opacity=".9" />
      <path d="M-10 28h8v18h-8zM12 30h8v16h-8z" fill="#4f3b2c" />
    </g>
  );
}

function RuinProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="28" rx="36" ry="10" fill="#0f1b26" opacity=".3" />
      <path d="M-30 30V-8h18V30M6 30V-18h18V30" fill="#8fa0b2" stroke="#354050" strokeWidth="6" />
      <path d="M-34 -8H-8M2 -18h26" stroke="#b9c8d6" strokeWidth="6" strokeLinecap="round" />
      <path d="M-14 8h18M10 -2h12" stroke="#354050" strokeWidth="4" strokeLinecap="round" opacity=".7" />
    </g>
  );
}

function BridgeProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-80 18c24-18 46-26 80-26 34 0 56 8 80 26" fill="none" stroke="#7f6547" strokeWidth="12" strokeLinecap="round" />
      <path d="M-84 18c24-18 48-26 84-26 36 0 60 8 84 26" fill="none" stroke="#e7c89a" strokeWidth="3" strokeLinecap="round" opacity=".54" />
      <path d="M-46 10v18M-18 0v24M18 0v24M46 10v18" stroke="#6d5338" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

function WindmillProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="44" rx="42" ry="12" fill="#0f1b26" opacity=".26" />
      <path d="M-18 44h36L8 -8h-16Z" fill="#7c6347" />
      <path d="M0 6v-20" stroke="#3c2a1b" strokeWidth="5" strokeLinecap="round" />
      <g className="home-windmill">
        <path d="M0 -20 26 -6 0 0Z" fill="#f0ead9" stroke="#8b7a67" strokeWidth="3" strokeLinejoin="round" />
        <path d="M0 -20-26 -6 0 0Z" fill="#f0ead9" stroke="#8b7a67" strokeWidth="3" strokeLinejoin="round" />
        <path d="M0 -20 14 -44 0 -30Z" fill="#f0ead9" stroke="#8b7a67" strokeWidth="3" strokeLinejoin="round" />
        <path d="M0 -20-14 -44 0 -30Z" fill="#f0ead9" stroke="#8b7a67" strokeWidth="3" strokeLinejoin="round" />
      </g>
    </g>
  );
}

function WatchTowerProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="36" rx="32" ry="10" fill="#0f1b26" opacity=".26" />
      <path d="M-18 36h36L10 -12H-10Z" fill="#7a6248" />
      <path d="M-26 -12H26L18 -26H-18Z" fill="#9d7854" stroke="#4c3625" strokeWidth="5" />
      <path d="M-10 6h20" stroke="#4c3625" strokeWidth="4" strokeLinecap="round" />
      <circle cx="0" cy="-4" r="5" className="home-torch" fill="#ffd57a" opacity=".82" />
    </g>
  );
}

function CampGlowProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="18" rx="30" ry="10" fill="#101824" opacity=".24" />
      <circle cx="0" cy="4" r="8" className="home-torch" fill="#ffd57a" opacity=".84" />
      <path d="M-10 16 0 0 10 16" fill="none" stroke="#6b4a2f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0 2v18" stroke="#8a6442" strokeWidth="4" strokeLinecap="round" />
      <path d="M-4 -6c0-8 4-12 8-16" className="home-smoke" fill="none" stroke="#c3d2db" strokeWidth="3" strokeLinecap="round" opacity=".5" />
    </g>
  );
}

function SignpostProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="18" rx="22" ry="7" fill="#0e1823" opacity=".2" />
      <path d="M0 18V-8" stroke="#6e553e" strokeWidth="5" strokeLinecap="round" />
      <path d="M0 -2h20l-6 8H0Z" fill="#d7b37d" stroke="#6e553e" strokeWidth="3" strokeLinejoin="round" />
      <path d="M0 8h-18l6 8H0Z" fill="#d7b37d" stroke="#6e553e" strokeWidth="3" strokeLinejoin="round" />
    </g>
  );
}

function LanternPostProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="24" rx="20" ry="7" fill="#0f1721" opacity=".22" />
      <path d="M0 24V-12" stroke="#5b4835" strokeWidth="5" strokeLinecap="round" />
      <path d="M0 -12h12" stroke="#5b4835" strokeWidth="4" strokeLinecap="round" />
      <circle cx="16" cy="-10" r="6" className="home-lantern" fill="#ffd57a" opacity=".82" />
      <circle cx="16" cy="-10" r="10" fill="#ffd57a" opacity=".12" className="home-window" />
    </g>
  );
}

function CartProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="18" rx="24" ry="8" fill="#101824" opacity=".22" />
      <path d="M-20 12h34l6-12h-28Z" fill="#7b573b" stroke="#563b28" strokeWidth="4" strokeLinejoin="round" />
      <path d="M12 6h12" stroke="#8a674a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="-10" cy="18" r="6" fill="#304558" stroke="#8aa1b6" strokeWidth="3" />
      <circle cx="12" cy="18" r="6" fill="#304558" stroke="#8aa1b6" strokeWidth="3" />
    </g>
  );
}

function RuinedArchProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="24" rx="26" ry="8" fill="#0f1b26" opacity=".22" />
      <path d="M-18 24V-4h10v28M8 24V-4h10v28" fill="#97a6b5" stroke="#435061" strokeWidth="4" />
      <path d="M-20 -4c6-10 14-16 24-16s18 6 24 16" fill="none" stroke="#c4d0da" strokeWidth="4" strokeLinecap="round" />
      <path d="M-4 4h8" stroke="#435061" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Statue({ x, y, tone }: { x: number; y: number; tone: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="18" rx="18" ry="6" fill="#172330" opacity=".24" />
      <path d="M-6 16V-16h12V16" fill={tone} stroke="#556474" strokeWidth="4" />
      <circle cx="0" cy="-22" r="6" fill={tone} stroke="#556474" strokeWidth="3" />
      <path d="M-12 16h24" stroke="#556474" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function HouseClusterProp({
  x,
  y,
  scale,
  roof,
  wall,
}: {
  x: number;
  y: number;
  scale: number;
  roof: string;
  wall: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="18" rx="26" ry="8" fill="#101822" opacity=".22" />
      <path d="M-24 16h18V4h-18ZM2 16h20V0H2Z" fill={wall} stroke="#425162" strokeWidth="4" />
      <path d="M-28 4-16-6-4 4ZM-2 0 12-12 26 0" fill={roof} stroke="#4b3526" strokeWidth="4" strokeLinejoin="round" />
      <rect x="-19" y="8" width="6" height="8" rx="2" className="home-window" fill="#ffdca0" />
      <rect x="8" y="6" width="7" height="10" rx="2" className="home-window" fill="#ffe4b5" />
    </g>
  );
}

function CrystalClusterProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="20" rx="24" ry="8" fill="#0f1824" opacity=".2" />
      <path d="M-18 18-10-8-2 18Z" fill="#77d8ff" stroke="#355b8f" strokeWidth="4" strokeLinejoin="round" />
      <path d="M-2 20 8-18 18 20Z" fill="#c88cff" stroke="#5b2a79" strokeWidth="4" strokeLinejoin="round" />
      <path d="M16 18 24 0 30 18Z" fill="#f5d88d" stroke="#7d5a20" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="8" cy="-10" r="5" className="home-window" fill="#fff0ff" opacity=".82" />
    </g>
  );
}

function CrateStackProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="18" rx="24" ry="8" fill="#101822" opacity=".22" />
      <path d="M-22 16h18V2h-18ZM2 16h18V6H2Z" fill="#8b6141" stroke="#5a3f2c" strokeWidth="4" />
      <path d="M-22 8h18M-13 2v14M2 11h18M11 6v10" stroke="#c69a74" strokeWidth="2.5" strokeLinecap="round" opacity=".54" />
      <path d="M16 10c7 0 11 3 11 8 0 4-3 6-9 6" fill="none" stroke="#d6c7a1" strokeWidth="3" strokeLinecap="round" opacity=".68" />
    </g>
  );
}

function BrazierProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="22" rx="20" ry="7" fill="#101821" opacity=".24" />
      <path d="M0 22V8" stroke="#694c34" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M-10 8h20l-4-8H-6Z" fill="#6f5137" stroke="#4c3624" strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="0" cy="0" r="6.5" className="home-torch" fill="#ffd57a" opacity=".86" />
      <path d="M0 -2c2-8 4-12 8-16" className="home-smoke" fill="none" stroke="#d1d7dc" strokeWidth="2.5" strokeLinecap="round" opacity=".42" />
    </g>
  );
}

function PennantLineProp({
  x,
  y,
  scale,
  tone,
  accent,
}: {
  x: number;
  y: number;
  scale: number;
  tone: string;
  accent: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-54 0C-26 10 26 10 54 0" fill="none" stroke="#b89672" strokeWidth="3" strokeLinecap="round" opacity=".78" />
      <g className="home-flag" style={{ animationDelay: ".3s" }}>
        <path d="M-34 0h14l-5 10h-9Z" fill={tone} stroke="#55311f" strokeWidth="2.4" strokeLinejoin="round" />
      </g>
      <g className="home-flag" style={{ animationDelay: "1s" }}>
        <path d="M-4 2H8L3 11h-7Z" fill={accent} stroke="#2b4056" strokeWidth="2.2" strokeLinejoin="round" />
      </g>
      <g className="home-flag" style={{ animationDelay: "1.5s" }}>
        <path d="M24 0h14l-5 10h-9Z" fill={tone} stroke="#55311f" strokeWidth="2.4" strokeLinejoin="round" />
      </g>
    </g>
  );
}

function RuneObeliskProp({ x, y, scale, tone }: { x: number; y: number; scale: number; tone: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="22" rx="18" ry="6" fill="#0f1822" opacity=".22" />
      <path d="M-10 22V-6L0-18 10-6V22Z" fill="#516578" stroke="#324252" strokeWidth="4" strokeLinejoin="round" />
      <rect x="-3.5" y="-2" width="7" height="11" rx="2" className="home-rune" fill={tone} opacity=".86" />
      <circle cx="0" cy="4" r="7" fill={tone} opacity=".12" className="home-window" />
    </g>
  );
}

function StoneCircleProp({ x, y, scale }: { x: string; y: string; scale: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="36" ry="12" fill="none" stroke="#d8c29a" strokeWidth="5" opacity=".58" />
      <ellipse cx="0" cy="0" rx="22" ry="8" fill="none" stroke="#f5e4c8" strokeWidth="3" opacity=".4" />
      <path d="M-16 -10v20M16 -10v20" stroke="#d8c29a" strokeWidth="4" strokeLinecap="round" opacity=".54" />
    </g>
  );
}

function DockProp({ x, y, scale, reverse }: { x: number; y: number; scale: number; reverse?: boolean }) {
  const mirror = reverse ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * mirror} ${scale})`}>
      <path d="M-34 0H34" stroke="#7f6547" strokeWidth="8" strokeLinecap="round" />
      <path d="M-22 0v18M0 0v22M22 0v18" stroke="#5f4a35" strokeWidth="5" strokeLinecap="round" />
      <path d="M-34 8h68" stroke="#c7ab85" strokeWidth="2.5" strokeLinecap="round" opacity=".44" />
    </g>
  );
}

function FountainProp({ x, y, scale }: { x: string; y: string; scale: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="12" rx="18" ry="6" fill="#0f1824" opacity=".2" />
      <path d="M-12 10h24l-4 8H-8Z" fill="#80b3c5" stroke="#456174" strokeWidth="4" />
      <path d="M-6 10V0h12v10" fill="#a7cfdd" stroke="#456174" strokeWidth="4" />
      <path d="M0 0V-8" stroke="#dff8ff" strokeWidth="3" strokeLinecap="round" opacity=".78" />
      <path d="M0 -8c0-8 5-12 8-16" fill="none" stroke="#dff8ff" strokeWidth="2.4" strokeLinecap="round" opacity=".64" />
      <path d="M0 -8c0-8-5-12-8-16" fill="none" stroke="#dff8ff" strokeWidth="2.4" strokeLinecap="round" opacity=".64" />
    </g>
  );
}

function RockSpireProp({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="18" rx="18" ry="7" fill="#111a22" opacity=".2" />
      <path d="M-12 18-4-18 4 18Z" fill="#4b5b54" stroke="#22352d" strokeWidth="4" strokeLinejoin="round" />
      <path d="M2 18 12-6 18 18Z" fill="#61746c" stroke="#22352d" strokeWidth="4" strokeLinejoin="round" />
    </g>
  );
}
