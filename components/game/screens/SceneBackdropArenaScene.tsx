"use client";

import { ArenaSpotlights } from "./SceneBackdropSceneEffects";
import { BannerStack, Moon, TorchPair } from "./SceneBackdropWorldProps";

export function ArenaScene() {
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
