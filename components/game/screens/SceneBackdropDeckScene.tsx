"use client";

import { BannerStack } from "./SceneBackdropWorldProps";

export function DeckScene() {
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
