"use client";

import type { ScreenScene } from "./SceneBackdrop";

export function ForegroundMist() {
  return (
    <>
      <div className="absolute bottom-[-2%] left-[-10%] h-[18%] w-[52%] rounded-[999px] bg-white/8 blur-[58px] animate-[cloudDrift_36s_linear_infinite]" />
      <div className="absolute bottom-[1%] right-[-8%] h-[22%] w-[48%] rounded-[999px] bg-sky-200/8 blur-[62px] animate-[cloudDriftReverse_42s_linear_infinite]" />
    </>
  );
}

export function ForegroundSet({ scene }: { scene: ScreenScene }) {
  const warm = scene === "shop" || scene === "arena" || scene === "adventureAsh";
  const emerald = scene === "missions";
  const tone = emerald
    ? "rgba(93,211,158,0.16)"
    : warm
      ? "rgba(255,177,98,0.16)"
      : "rgba(128,194,255,0.14)";

  return (
    <>
      <div
        className="absolute bottom-[-11%] left-[-10%] h-[28%] w-[56%] rounded-[999px] blur-[46px]"
        style={{ background: `radial-gradient(circle,${tone},rgba(5,8,14,0.1) 58%,transparent 76%)` }}
      />
      <div
        className="absolute bottom-[-13%] right-[-12%] h-[30%] w-[58%] rounded-[999px] blur-[54px]"
        style={{ background: `radial-gradient(circle,${tone},rgba(5,8,14,0.12) 60%,transparent 78%)` }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-[linear-gradient(180deg,transparent,rgba(2,5,10,0.56))]" />
    </>
  );
}

export function TextureVeil() {
  return (
    <>
      <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.42)_1px,transparent_1px)] [background-size:46px_46px]" />
      <div className="absolute inset-0 opacity-[0.055] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.7)_1px,transparent_0)] [background-size:18px_18px]" />
    </>
  );
}
