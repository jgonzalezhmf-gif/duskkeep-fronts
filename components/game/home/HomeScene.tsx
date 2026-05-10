"use client";

import { useEffect, useState } from "react";

import type { HomeEffectsQaEditorState } from "@/components/game/home/HomeEffectsQaTypes";
import { HomeLandmarkLayer, HomeWorldEffectLayer } from "@/components/game/home/HomeSceneLayers";
import {
  BrazierProp,
  BridgeProp,
  CampGlowProp,
  CartProp,
  CrateStackProp,
  CrystalClusterProp,
  ForestPatch,
  FountainProp,
  HouseClusterProp,
  LanternPostProp,
  PennantLineProp,
  RockSpireProp,
  RuinedArchProp,
  RuinProp,
  RuneObeliskProp,
  SignpostProp,
  WatchTowerProp,
  WindmillProp,
} from "@/components/game/home/HomeSceneProps";
import { HomeSceneStyles } from "@/components/game/home/HomeSceneStyles";
import { HomeSkyAtmosphere } from "@/components/game/home/HomeSkyAtmosphere";
import { AssetLandmarkGrounds } from "@/components/game/home/HomeZoneAura";
import { HOME_WORLD_BACKGROUND } from "@/components/game/home/homeComposition";
import { HOME_WORLD_EFFECTS, type HomeLandmarkEffectConfig } from "@/components/game/home/homeEffectLayout";
import { HomeZoneId } from "@/components/game/home/types";
import { type HomeLandmarkId } from "@/lib/homeLandmarkAssets";
import { getHomeBackgroundAsset } from "@/lib/homeLandmarkAssets";

export default function HomeScene({
  activeZone,
  parallax,
  effectsByLandmark,
  worldEffects,
  qaEditor,
}: {
  activeZone: HomeZoneId | null;
  parallax: { x: number; y: number };
  effectsByLandmark?: Partial<Record<HomeLandmarkId, HomeLandmarkEffectConfig[]>>;
  worldEffects?: HomeLandmarkEffectConfig[];
  qaEditor?: HomeEffectsQaEditorState;
}) {
  void parallax;
  const farX = 0;
  const farY = 0;
  const midX = parallax.x * -28;
  const midY = parallax.y * -16;
  const nearX = 0;
  const nearY = 0;
  const backgroundAsset = getHomeBackgroundAsset();
  const deferAtmosphere = !qaEditor;
  const atmosphereReady = useHomeAtmosphereReady(deferAtmosphere);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <HomeSceneStyles />

      {backgroundAsset ? (
        <>
          <picture
            data-home-world-background
            className="absolute left-0 top-0 h-full w-full object-fill"
            style={{
              left: HOME_WORLD_BACKGROUND.x,
              top: HOME_WORLD_BACKGROUND.y,
              width: HOME_WORLD_BACKGROUND.width,
              height: HOME_WORLD_BACKGROUND.height,
            }}
          >
            {backgroundAsset.webpSrc ? <source srcSet={backgroundAsset.webpSrc} type="image/webp" /> : null}
            <img
              src={backgroundAsset.src}
              alt=""
              loading="eager"
              decoding="async"
              fetchPriority="high"
              draggable={false}
              className="h-full w-full object-fill"
            />
          </picture>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,transparent_0%,rgba(5,8,15,0.08)_58%,rgba(3,5,10,0.28)_100%)]" />
        </>
      ) : null}

      {atmosphereReady ? <HomeSkyAtmosphere /> : null}

      {backgroundAsset ? null : (
      <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(104,136,178,0.22),transparent_18%),radial-gradient(circle_at_22%_20%,rgba(86,115,152,0.13),transparent_17%),radial-gradient(circle_at_82%_18%,rgba(54,112,137,0.12),transparent_19%),linear-gradient(180deg,#26395e_0%,#1c2c4a_20%,#16243b_42%,#0d1727_68%,#070b13_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_47%_30%,rgba(255,201,119,0.08),transparent_20%),linear-gradient(180deg,rgba(8,13,24,0.16),transparent_34%,rgba(4,8,15,0.24)_72%,rgba(3,5,10,0.48)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(5,8,14,0.12)_56%,rgba(3,5,10,0.54)_100%)]" />
      <div className="absolute left-[31%] top-[-8%] h-[64%] w-[18%] origin-top rotate-[-6deg] bg-[linear-gradient(180deg,rgba(255,203,128,0.08),transparent_74%)] blur-xl" />
      <div className="absolute right-[17%] top-[-7%] h-[56%] w-[14%] origin-top rotate-[12deg] bg-[linear-gradient(180deg,rgba(100,190,220,0.06),transparent_76%)] blur-xl" />

      <div
        className="absolute left-[9%] top-[11%] h-24 w-56 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,250,226,0.42),rgba(255,250,226,0.08)_58%,transparent_72%)] blur-3xl"
        style={{ transform: `translate3d(${farX * 0.4}px, ${farY * 0.2}px, 0)` }}
      />
      <div
        className="absolute right-[14%] top-[20%] h-20 w-48 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(147,238,255,0.28),rgba(147,238,255,0.08)_58%,transparent_72%)] blur-3xl"
        style={{ transform: `translate3d(${farX * -0.25}px, ${farY * 0.18}px, 0)` }}
      />

      <Cloud className="left-[-8%] top-[7%] h-28 w-[34rem] opacity-28" drift="homeCloudDrift 58s linear infinite" x={farX} y={farY} />
      <Cloud className="right-[-10%] top-[16%] h-32 w-[36rem] opacity-22" drift="homeCloudDriftReverse 64s linear infinite" x={farX * -0.55} y={farY * 0.5} />

      <div className="absolute inset-x-[-10%] bottom-[18%] h-[13%] rounded-[50%] bg-slate-300/6 blur-[38px]" />
      <div className="absolute inset-x-[-10%] bottom-[1%] h-[18%] rounded-[50%] bg-cyan-200/7 blur-[46px]" />

      <div className="absolute inset-x-[12%] bottom-[7%] h-[18%] overflow-hidden rounded-[50%] opacity-80">
        <div
          className="absolute inset-[-12%] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.015)_0,rgba(155,210,235,0.08)_8%,rgba(64,125,158,0.05)_16%,rgba(255,255,255,0.01)_24%)] blur-lg"
        />
      </div>
      <div className="absolute bottom-[12%] left-[18%] h-6 w-[22%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,197,90,0.11),transparent)] blur-lg" />
      <div className="absolute bottom-[11%] right-[19%] h-6 w-[24%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(84,174,205,0.1),transparent)] blur-lg" />

      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="homeGroundBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2b3d55" />
            <stop offset="52%" stopColor="#1f3047" />
            <stop offset="100%" stopColor="#101b2b" />
          </linearGradient>
          <linearGradient id="homeGroundFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#485141" />
            <stop offset="36%" stopColor="#2c382f" />
            <stop offset="100%" stopColor="#101a27" />
          </linearGradient>
          <linearGradient id="homeWaterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#234f74" />
            <stop offset="100%" stopColor="#0d233f" />
          </linearGradient>
          <linearGradient id="homeRoadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8d6f4e" />
            <stop offset="100%" stopColor="#5e4633" />
          </linearGradient>
          <linearGradient id="homeCliffGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#303a48" />
            <stop offset="100%" stopColor="#161f2a" />
          </linearGradient>
          <radialGradient id="homeZoneSoft" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.72)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <g transform={`translate(${farX} ${farY})`}>
          <path
            d="M-30 454 112 368 240 392 372 332 512 370 666 298 850 358 1020 308 1166 364 1316 322 1480 382 1640 346v246H-30Z"
            fill="#223753"
          />
          <path
            d="M-30 520 140 430 278 462 420 394 596 448 790 374 966 436 1140 390 1330 452 1640 406v258H-30Z"
            fill="url(#homeGroundBack)"
          />
          <path d="M116 414h38l22 22h-82ZM992 366h46l28 28h-102ZM1316 344h34l18 18h-70Z" fill="#35495f" opacity=".38" />
          <path d="M104 414h64M986 366h82M1312 344h54" stroke="#5d7894" strokeWidth="6" strokeLinecap="round" opacity=".26" />
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
            opacity=".66"
          />
          <path
            d="M292 534c108 66 188 92 256 98 88 8 166-12 274-58 102-44 201-60 288-56 92 4 186 34 306 108"
            fill="none"
            stroke="#c8aa7a"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".24"
          />
          <path
            d="M712 562c-40 68-80 118-116 146-38 30-82 52-144 72"
            fill="none"
            stroke="url(#homeRoadGradient)"
            strokeWidth="18"
            strokeLinecap="round"
            opacity=".62"
          />
          <path
            d="M882 544c74 30 130 74 180 126"
            fill="none"
            stroke="url(#homeRoadGradient)"
            strokeWidth="18"
            strokeLinecap="round"
            opacity=".62"
          />
          <path
            d="M942 736c-80 32-150 44-218 42-92-2-172-26-258-72-74-40-142-56-214-54-104 3-185 36-270 92v162h1610V724c-116 46-220 62-330 50-116-12-236-50-410-56-148-4-267 18-390 64Z"
            fill="url(#homeWaterGradient)"
          />
          <path
            d="M950 734c-100 38-186 52-262 48-102-4-194-34-294-84-66-34-128-48-198-46-102 3-182 34-270 88"
            fill="none"
            stroke="#78a9c5"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".16"
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

        <AssetLandmarkGrounds activeZone={activeZone} nearX={nearX} nearY={nearY} />
      </svg>

      </>
      )}
      {atmosphereReady ? <HomeWorldEffectLayer effects={worldEffects ?? HOME_WORLD_EFFECTS} qaEditor={qaEditor} /> : null}
      <HomeLandmarkLayer activeZone={activeZone} nearX={nearX} nearY={nearY} effectsByLandmark={atmosphereReady ? effectsByLandmark : undefined} qaEditor={qaEditor} />
    </div>
  );
}

function useHomeAtmosphereReady(defer: boolean) {
  const [ready, setReady] = useState(!defer);

  useEffect(() => {
    if (!defer) {
      setReady(true);
      return;
    }

    if (typeof window === "undefined") return;

    let timeoutId = 0;
    let idleId: number | null = null;
    const activate = () => setReady(true);
    const win = window as typeof window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (win.requestIdleCallback) {
      idleId = win.requestIdleCallback(activate, { timeout: 900 });
    } else {
      timeoutId = window.setTimeout(activate, 420);
    }

    return () => {
      if (idleId !== null && win.cancelIdleCallback) win.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [defer]);

  return ready;
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
        className="h-full w-full rounded-[999px] bg-[radial-gradient(ellipse_at_center,rgba(158,176,198,0.22),rgba(83,101,124,0.1)_48%,rgba(21,30,43,0)_78%)] blur-3xl"
        style={{ animation: drift }}
      />
    </div>
  );
}
