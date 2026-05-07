"use client";

export function MoonSanctumLandmark() {
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

export function AshForgeLandmark() {
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

export function FestivalPortalLandmark() {
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

export function GrandMarketLandmark() {
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

export function ArcaneWarRoomLandmark() {
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

export function HeroHallLandmark() {
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

export function CommandBoardLandmark() {
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

export function CitadelLandmark() {
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

export function ColiseumLandmark() {
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
