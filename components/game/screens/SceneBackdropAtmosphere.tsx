"use client";

import { cn } from "@/lib/cn";
import type { ScreenScene } from "./SceneBackdrop";

type Particle = {
  left: string;
  top: string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
};

const COMMON_PARTICLES: Particle[] = [
  { left: "8%", top: "18%", size: 4, opacity: 0.52, duration: 18, delay: 0 },
  { left: "16%", top: "28%", size: 6, opacity: 0.34, duration: 22, delay: 2 },
  { left: "23%", top: "12%", size: 3, opacity: 0.4, duration: 17, delay: 5 },
  { left: "34%", top: "26%", size: 5, opacity: 0.28, duration: 23, delay: 7 },
  { left: "47%", top: "16%", size: 4, opacity: 0.38, duration: 19, delay: 3 },
  { left: "59%", top: "24%", size: 6, opacity: 0.3, duration: 21, delay: 8 },
  { left: "71%", top: "18%", size: 4, opacity: 0.46, duration: 18, delay: 1 },
  { left: "82%", top: "28%", size: 5, opacity: 0.24, duration: 24, delay: 10 },
  { left: "90%", top: "14%", size: 3, opacity: 0.48, duration: 20, delay: 6 },
];

const BIRDS = [
  { left: "18%", top: "21%", scale: 1, delay: 0 },
  { left: "22%", top: "24%", scale: 0.76, delay: 0.8 },
  { left: "74%", top: "18%", scale: 0.84, delay: 1.6 },
];

export function SceneSky({ scene }: { scene: ScreenScene }) {
  const gradients: Record<ScreenScene, string> = {
    adventureMoon:
      "bg-[radial-gradient(circle_at_74%_20%,rgba(195,222,255,0.22),transparent_10%),linear-gradient(180deg,#20345a_0%,#14203b_30%,#0b1425_62%,#071019_100%)]",
    adventureAsh:
      "bg-[radial-gradient(circle_at_72%_18%,rgba(255,189,104,0.22),transparent_12%),linear-gradient(180deg,#54302b_0%,#37202c_28%,#181423_62%,#071019_100%)]",
    events:
      "bg-[radial-gradient(circle_at_68%_20%,rgba(126,191,255,0.18),transparent_10%),linear-gradient(180deg,#24325a_0%,#1a2348_28%,#0f1730_60%,#071019_100%)]",
    shop:
      "bg-[radial-gradient(circle_at_24%_18%,rgba(255,213,132,0.14),transparent_12%),linear-gradient(180deg,#4b2f2b_0%,#2b2035_34%,#171425_66%,#071019_100%)]",
    deck:
      "bg-[radial-gradient(circle_at_50%_16%,rgba(255,217,148,0.12),transparent_10%),linear-gradient(180deg,#362826_0%,#1f1b28_26%,#101420_60%,#071019_100%)]",
    roster:
      "bg-[radial-gradient(circle_at_23%_16%,rgba(245,196,81,0.16),transparent_12%),radial-gradient(circle_at_76%_19%,rgba(170,130,255,0.14),transparent_14%),linear-gradient(180deg,#30264a_0%,#1d1b31_30%,#0e1323_62%,#071019_100%)]",
    missions:
      "bg-[radial-gradient(circle_at_24%_17%,rgba(93,211,158,0.16),transparent_13%),radial-gradient(circle_at_78%_14%,rgba(245,196,81,0.13),transparent_13%),linear-gradient(180deg,#173a32_0%,#142934_31%,#0c1724_62%,#071019_100%)]",
    fortress:
      "bg-[radial-gradient(circle_at_72%_18%,rgba(188,214,255,0.2),transparent_10%),linear-gradient(180deg,#29345d_0%,#1a2444_30%,#0d1731_58%,#071019_100%)]",
    arena:
      "bg-[radial-gradient(circle_at_52%_18%,rgba(255,176,96,0.16),transparent_10%),linear-gradient(180deg,#402b28_0%,#271b24_28%,#141421_60%,#071019_100%)]",
  };

  return <div className={cn("absolute inset-0", gradients[scene])} />;
}

export function SceneAtmosphere({ scene }: { scene: ScreenScene }) {
  const accent =
    scene === "shop"
      ? "rgba(255,196,92,0.18)"
      : scene === "missions"
        ? "rgba(93,211,158,0.16)"
        : scene === "roster"
          ? "rgba(196,149,255,0.16)"
          : scene === "arena" || scene === "adventureAsh"
            ? "rgba(255,139,82,0.17)"
            : "rgba(121,193,255,0.15)";

  return (
    <>
      <div
        className="absolute left-[-18%] top-[6%] h-[46%] w-[54%] rotate-[-12deg] rounded-[999px] blur-[84px]"
        style={{ background: `radial-gradient(circle,${accent},transparent 66%)` }}
      />
      <div className="absolute right-[-14%] top-[10%] h-[42%] w-[48%] rounded-[999px] bg-white/6 blur-[92px]" />
      <div className="absolute left-[12%] right-[10%] top-[20%] h-[34%] rotate-[-8deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.075),transparent)] blur-2xl" />
      <div className="absolute left-[20%] right-[18%] top-[34%] h-[20%] rotate-[9deg] bg-[linear-gradient(90deg,transparent,rgba(255,226,169,0.06),transparent)] blur-2xl" />
    </>
  );
}

export function CloudLayer() {
  return (
    <>
      <Cloud top="11%" left="-18%" width="44rem" height="8rem" opacity={0.22} delay={0} reverse={false} />
      <Cloud top="17%" left="22%" width="32rem" height="6rem" opacity={0.16} delay={7} reverse />
      <Cloud top="26%" left="-10%" width="26rem" height="5rem" opacity={0.12} delay={12} reverse={false} />
      <Cloud top="8%" left="62%" width="28rem" height="6rem" opacity={0.18} delay={4} reverse />
    </>
  );
}

function Cloud({
  top,
  left,
  width,
  height,
  opacity,
  delay,
  reverse,
}: {
  top: string;
  left: string;
  width: string;
  height: string;
  opacity: number;
  delay: number;
  reverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute rounded-[999px] bg-white blur-3xl",
        reverse ? "animate-[cloudDriftReverse_64s_linear_infinite]" : "animate-[cloudDrift_72s_linear_infinite]",
      )}
      style={{
        top,
        left,
        width,
        height,
        opacity,
        animationDelay: `-${delay}s`,
      }}
    />
  );
}

export function ParticleField({ scene }: { scene: ScreenScene }) {
  const tone =
    scene === "shop"
      ? "rgba(255,206,130,0.9)"
      : scene === "missions"
        ? "rgba(122,255,197,0.82)"
        : scene === "roster"
          ? "rgba(216,181,255,0.82)"
      : scene === "adventureAsh" || scene === "arena"
        ? "rgba(255,170,108,0.85)"
        : "rgba(181,218,255,0.85)";

  return (
    <>
      {COMMON_PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="absolute rounded-full blur-[1px] animate-[particleFloat_18s_ease-in-out_infinite]"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            background: tone,
            animationDelay: `-${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </>
  );
}

export function ConstellationDust({ scene }: { scene: ScreenScene }) {
  const points =
    scene === "missions"
      ? [
          ["18%", "28%"],
          ["28%", "22%"],
          ["42%", "29%"],
          ["55%", "20%"],
          ["70%", "27%"],
          ["82%", "21%"],
        ]
      : [
          ["16%", "20%"],
          ["31%", "27%"],
          ["45%", "18%"],
          ["59%", "25%"],
          ["72%", "17%"],
          ["86%", "26%"],
        ];
  const lineTone =
    scene === "shop" || scene === "arena" || scene === "adventureAsh"
      ? "rgba(255,200,126,0.12)"
      : scene === "missions"
        ? "rgba(132,255,207,0.12)"
        : "rgba(181,218,255,0.12)";

  return (
    <>
      <svg className="absolute inset-x-[8%] top-[12%] h-[26%] w-[84%] opacity-70" viewBox="0 0 100 32" preserveAspectRatio="none">
        <path d="M8 18C20 9 28 22 39 15C51 7 61 20 72 12C82 5 88 15 96 10" fill="none" stroke={lineTone} strokeWidth="0.45" strokeDasharray="1.2 1.8" />
      </svg>
      {points.map(([left, top], index) => (
        <span
          key={`${left}-${top}`}
          className="absolute h-1.5 w-1.5 rounded-full bg-white/42 blur-[1px] animate-[iconBreath_5s_ease-in-out_infinite]"
          style={{ left, top, animationDelay: `${index * 0.45}s` }}
        />
      ))}
    </>
  );
}

export function BirdLayer() {
  return (
    <>
      {BIRDS.map((bird, index) => (
        <div
          key={index}
          className="absolute text-white/20 animate-[cloudDrift_54s_linear_infinite]"
          style={{
            left: bird.left,
            top: bird.top,
            transform: `scale(${bird.scale})`,
            animationDelay: `-${bird.delay}s`,
          }}
        >
          <svg width="34" height="16" viewBox="0 0 34 16" fill="none">
            <path d="M1 12C4.6 8.4 7.9 7 10.8 7.8C13.7 8.5 16 10.5 17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M17 12C20.2 7.8 23.4 6.5 26.2 7.1C29.1 7.8 31.2 9.3 33 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      ))}
    </>
  );
}
