"use client";

import { BannerStack, SignalFire } from "./SceneBackdropWorldProps";

export function MissionsScene() {
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
