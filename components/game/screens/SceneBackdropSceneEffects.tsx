"use client";

export function StarfallLayer({ tone }: { tone: "sky" | "ember" }) {
  const color = tone === "sky" ? "rgba(190,226,255,0.22)" : "rgba(255,190,126,0.22)";
  return (
    <>
      {[18, 31, 57, 83].map((left, index) => (
        <div
          key={left}
          className="absolute top-[14%] h-[1px] w-24 rotate-[-24deg] rounded-full animate-[waterShimmer_6s_ease-in-out_infinite]"
          style={{
            left: `${left}%`,
            background: `linear-gradient(90deg,transparent,${color},transparent)`,
            animationDelay: `${index * 0.7}s`,
          }}
        />
      ))}
    </>
  );
}

export function EmberRain() {
  return (
    <>
      {[12, 24, 39, 52, 68, 81, 92].map((left, index) => (
        <span
          key={left}
          className="absolute top-[12%] h-10 w-[2px] rotate-[18deg] rounded-full bg-[linear-gradient(180deg,rgba(255,205,137,0.4),transparent)] blur-[1px] animate-[particleFloat_9s_ease-in-out_infinite]"
          style={{ left: `${left}%`, animationDelay: `${index * 0.5}s` }}
        />
      ))}
    </>
  );
}

export function FireworkBursts() {
  return (
    <>
      {[
        ["24%", "18%", "#79d8ff"],
        ["57%", "14%", "#ffd57a"],
        ["82%", "23%", "#d698ff"],
      ].map(([left, top, color], index) => (
        <div key={`${left}-${top}`} className="absolute h-16 w-16 rounded-full animate-[iconBreath_5.8s_ease-in-out_infinite]" style={{ left, top, animationDelay: `${index * 0.9}s` }}>
          {[0, 45, 90, 135].map((rotate) => (
            <span
              key={rotate}
              className="absolute left-1/2 top-1/2 h-[2px] w-9 origin-left rounded-full"
              style={{ background: `linear-gradient(90deg,${color},transparent)`, transform: `rotate(${rotate}deg)` }}
            />
          ))}
        </div>
      ))}
    </>
  );
}

export function MarketSilkCeiling() {
  return (
    <>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="absolute top-[8%] h-[17%] w-[44%] rounded-b-[52%] border-b border-white/10 opacity-80"
          style={{
            left: `${index * 28 - 5}%`,
            background:
              index === 0
                ? "linear-gradient(180deg,rgba(255,117,108,0.18),transparent)"
                : index === 1
                  ? "linear-gradient(180deg,rgba(245,196,81,0.16),transparent)"
                  : "linear-gradient(180deg,rgba(121,216,255,0.14),transparent)",
          }}
        />
      ))}
    </>
  );
}

export function ArenaSpotlights() {
  return (
    <>
      <div className="absolute left-[17%] top-[13%] h-[54%] w-[28%] rotate-[12deg] bg-[linear-gradient(180deg,rgba(255,220,160,0.12),transparent)] blur-xl" />
      <div className="absolute right-[17%] top-[13%] h-[54%] w-[28%] rotate-[-12deg] bg-[linear-gradient(180deg,rgba(255,168,100,0.1),transparent)] blur-xl" />
      <div className="absolute left-[39%] top-[7%] h-[50%] w-[22%] bg-[linear-gradient(180deg,rgba(255,236,188,0.09),transparent)] blur-xl" />
    </>
  );
}
