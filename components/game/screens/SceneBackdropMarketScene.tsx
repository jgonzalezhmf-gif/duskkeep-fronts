"use client";

import { MarketSilkCeiling } from "./SceneBackdropSceneEffects";

export function ShopScene() {
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
