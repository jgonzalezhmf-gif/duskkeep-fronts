"use client";

export function MoonTempleSteps() {
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

export function ForgeOutpost() {
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

export function Moon({ top, left, size }: { top: string; left: string; size: string }) {
  return (
    <div
      className="absolute rounded-full bg-[radial-gradient(circle,rgba(242,248,255,0.95)_0%,rgba(196,223,255,0.55)_38%,rgba(159,205,255,0.1)_62%,transparent_72%)] blur-[1px] animate-[iconBreath_9s_ease-in-out_infinite]"
      style={{ top, left, width: size, height: size }}
    />
  );
}

export function SunOrb() {
  return (
    <div className="absolute left-[70%] top-[13%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,236,163,0.96)_0%,rgba(255,179,91,0.7)_32%,rgba(255,143,69,0.12)_60%,transparent_72%)] animate-[iconBreath_9s_ease-in-out_infinite]" />
  );
}

export function MountainLayer({
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

export function RiverGlow({ tone }: { tone: string }) {
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

export function LavaRibbon() {
  return (
    <>
      <div className="absolute bottom-[8%] left-[16%] h-[16%] w-[58%] rotate-[-8deg] rounded-[999px] bg-[linear-gradient(90deg,rgba(255,110,48,0.12),rgba(255,176,94,0.3),rgba(255,96,56,0.08))] blur-2xl" />
      <div className="absolute bottom-[10%] left-[18%] h-8 w-[50%] rounded-[999px] bg-[linear-gradient(90deg,rgba(255,159,83,0.18),rgba(255,215,152,0.4),rgba(255,126,78,0.18))] animate-[waterShimmer_6s_ease-in-out_infinite]" />
    </>
  );
}

export function CrystalCluster({
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

export function RuinedGate({ left, bottom, scale }: { left: string; bottom: string; scale: number }) {
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

export function ObsidianSpire({ left, bottom, scale = 1 }: { left: string; bottom: string; scale?: number }) {
  return (
    <div className="absolute" style={{ left, bottom, transform: `scale(${scale})` }}>
      <div className="h-24 w-16 bg-[linear-gradient(180deg,#74515c_0%,#29151c_38%,#0d0b14_100%)]" style={{ clipPath: "polygon(42% 0%,58% 8%,100% 100%,0% 100%)" }} />
      <div className="absolute left-1/2 top-[24%] h-8 w-3 -translate-x-1/2 rounded-full bg-amber-300/30 blur-md" />
    </div>
  );
}

export function BannerStack({
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

export function PortalGlow() {
  return (
    <div className="absolute left-1/2 top-[34%] h-36 w-28 -translate-x-1/2 rounded-[999px] border border-sky-200/20 bg-[radial-gradient(circle,rgba(170,222,255,0.46)_0%,rgba(90,145,255,0.22)_42%,rgba(26,35,74,0.02)_76%,transparent_82%)] blur-[1px] animate-[iconBreath_6s_ease-in-out_infinite]" />
  );
}

export function FestivalTent({
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

export function GrandArch() {
  return (
    <div className="absolute left-1/2 top-[30%] h-32 w-64 -translate-x-1/2 rounded-t-[999px] border border-white/10 bg-[linear-gradient(180deg,rgba(26,38,62,0.5),rgba(8,11,18,0))]" />
  );
}

export function ProcessionLanterns() {
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

export function SignalFire({ left, bottom }: { left: string; bottom: string }) {
  return (
    <div className="absolute" style={{ left, bottom }}>
      <div className="h-7 w-7 rounded-full bg-[radial-gradient(circle,rgba(255,232,173,0.84),rgba(255,151,80,0.42)_36%,transparent_72%)] animate-[iconBreath_4s_ease-in-out_infinite]" />
    </div>
  );
}

export function CrystalTree({
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

export function TorchPair() {
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
