"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

const OCTAGON = "polygon(18% 0%, 82% 0%, 100% 18%, 100% 82%, 82% 100%, 18% 100%, 0% 82%, 0% 18%)";
const GEM = "polygon(50% 0%, 86% 18%, 100% 50%, 86% 82%, 50% 100%, 14% 82%, 0% 50%, 14% 18%)";

const TONE_STYLES = {
  gold: {
    bezel:
      "bg-[linear-gradient(180deg,#fff0bc_0%,#f3c867_20%,#a76b19_100%)] shadow-[0_12px_24px_rgba(214,150,50,0.34)]",
    inner:
      "bg-[radial-gradient(circle_at_50%_22%,rgba(255,250,225,0.92),rgba(255,239,196,0.28)_26%,transparent_34%),linear-gradient(180deg,#5e4014_0%,#251508_100%)]",
    core:
      "bg-[radial-gradient(circle_at_35%_30%,#fff3c5_0%,#f2d175_22%,#b57923_65%,#523110_100%)] text-[#fff4c9]",
    glow: "shadow-[0_0_24px_rgba(245,196,81,0.28)]",
    studs: "bg-[#ffe49a]",
  },
  arcane: {
    bezel:
      "bg-[linear-gradient(180deg,#f4dbff_0%,#b77dff_20%,#532083_100%)] shadow-[0_12px_24px_rgba(157,86,255,0.34)]",
    inner:
      "bg-[radial-gradient(circle_at_50%_24%,rgba(255,241,255,0.84),rgba(219,192,255,0.26)_24%,transparent_34%),linear-gradient(180deg,#311046_0%,#12071d_100%)]",
    core:
      "bg-[radial-gradient(circle_at_35%_30%,#f6e8ff_0%,#d5b6ff_24%,#874be3_64%,#2a1145_100%)] text-[#f8ecff]",
    glow: "shadow-[0_0_24px_rgba(157,86,255,0.28)]",
    studs: "bg-[#e8ccff]",
  },
  crystal: {
    bezel:
      "bg-[linear-gradient(180deg,#dffcff_0%,#8acbff_22%,#19578e_100%)] shadow-[0_12px_24px_rgba(77,170,255,0.3)]",
    inner:
      "bg-[radial-gradient(circle_at_50%_24%,rgba(243,253,255,0.8),rgba(197,236,255,0.26)_24%,transparent_34%),linear-gradient(180deg,#12324a_0%,#07131c_100%)]",
    core:
      "bg-[radial-gradient(circle_at_35%_30%,#ecfdff_0%,#bbecff_24%,#4ca4e8_64%,#11395e_100%)] text-[#f3feff]",
    glow: "shadow-[0_0_24px_rgba(77,170,255,0.24)]",
    studs: "bg-[#c9f3ff]",
  },
  ember: {
    bezel:
      "bg-[linear-gradient(180deg,#ffd9c8_0%,#ff8b60_22%,#8c2414_100%)] shadow-[0_12px_24px_rgba(255,106,74,0.34)]",
    inner:
      "bg-[radial-gradient(circle_at_50%_24%,rgba(255,242,236,0.8),rgba(255,203,184,0.24)_24%,transparent_34%),linear-gradient(180deg,#47140e_0%,#180706_100%)]",
    core:
      "bg-[radial-gradient(circle_at_35%_30%,#fff0e6_0%,#ffc4aa_24%,#ec7149_64%,#631b13_100%)] text-[#fff3ea]",
    glow: "shadow-[0_0_24px_rgba(255,106,74,0.26)]",
    studs: "bg-[#ffd2c1]",
  },
  jade: {
    bezel:
      "bg-[linear-gradient(180deg,#dfffe4_0%,#68db9e_22%,#14563b_100%)] shadow-[0_12px_24px_rgba(65,217,138,0.3)]",
    inner:
      "bg-[radial-gradient(circle_at_50%_24%,rgba(238,255,243,0.82),rgba(202,255,220,0.24)_24%,transparent_34%),linear-gradient(180deg,#163b2a_0%,#09130f_100%)]",
    core:
      "bg-[radial-gradient(circle_at_35%_30%,#f1fff4_0%,#bdf4cf_24%,#44c983_64%,#154c33_100%)] text-[#effff3]",
    glow: "shadow-[0_0_24px_rgba(65,217,138,0.22)]",
    studs: "bg-[#d8ffe5]",
  },
  slate: {
    bezel:
      "bg-[linear-gradient(180deg,#f2f5fd_0%,#9faec7_20%,#3a4459_100%)] shadow-[0_12px_24px_rgba(42,56,83,0.28)]",
    inner:
      "bg-[radial-gradient(circle_at_50%_24%,rgba(255,255,255,0.76),rgba(225,232,244,0.18)_24%,transparent_34%),linear-gradient(180deg,#202836_0%,#0b0f16_100%)]",
    core:
      "bg-[radial-gradient(circle_at_35%_30%,#fdfdff_0%,#d4dcec_22%,#7a8ea9_58%,#243042_100%)] text-[#f7fbff]",
    glow: "shadow-[0_0_20px_rgba(160,176,202,0.2)]",
    studs: "bg-[#eff3fb]",
  },
} as const;

const SIZE_STYLES = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
  xl: "h-16 w-16",
} as const;

export type FantasyTone = keyof typeof TONE_STYLES;

export default function FantasyMedallion({
  children,
  tone = "gold",
  size = "md",
  active = false,
  className,
}: {
  children: ReactNode;
  tone?: FantasyTone;
  size?: keyof typeof SIZE_STYLES;
  active?: boolean;
  className?: string;
}) {
  const style = TONE_STYLES[tone];

  return (
    <span className={cn("relative isolate inline-grid place-items-center", SIZE_STYLES[size], className)}>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 transition duration-300",
          style.bezel,
          active ? cn("scale-[1.03]", style.glow) : "opacity-95",
        )}
        style={{ clipPath: OCTAGON }}
      />
      <span
        aria-hidden
        className="absolute inset-[7%] border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]"
        style={{ clipPath: GEM }}
      />
      <span aria-hidden className={cn("absolute inset-[8.5%]", style.inner)} style={{ clipPath: GEM }} />
      <span
        aria-hidden
        className={cn(
          "absolute inset-[17%] border border-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
          style.core,
        )}
        style={{ clipPath: GEM }}
      />
      <span aria-hidden className="absolute left-[18%] right-[18%] top-[11%] h-[16%] rounded-full bg-white/22 blur-[2px]" />
      <span aria-hidden className="absolute bottom-[14%] left-[22%] right-[22%] h-[10%] rounded-full bg-black/28 blur-[4px]" />

      {[
        "left-[50%] top-[5%] -translate-x-1/2",
        "right-[5%] top-[50%] -translate-y-1/2",
        "left-[50%] bottom-[5%] -translate-x-1/2",
        "left-[5%] top-[50%] -translate-y-1/2",
      ].map((position) => (
        <span
          key={position}
          aria-hidden
          className={cn(
            "absolute h-[10%] w-[10%] rotate-45 rounded-[20%] border border-white/26 shadow-[0_0_8px_rgba(255,255,255,0.16)]",
            position,
            style.studs,
          )}
        />
      ))}

      <span className="relative z-[1] grid h-[56%] w-[56%] place-items-center">{children}</span>
    </span>
  );
}
