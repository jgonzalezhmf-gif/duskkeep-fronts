"use client";

import { BannerStack } from "./SceneBackdropWorldProps";

export function RosterScene() {
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
