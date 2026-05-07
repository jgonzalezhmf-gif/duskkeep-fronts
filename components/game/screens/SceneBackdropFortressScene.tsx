"use client";

import { BannerStack, Moon, MountainLayer } from "./SceneBackdropWorldProps";

export function FortressScene() {
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
