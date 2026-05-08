"use client";

import { getFrontlineBossAssetSrc } from "./frontlineVisualAssets";

export function BossColossusOverlay({ assetKey }: { assetKey: string }) {
  const src = getFrontlineBossAssetSrc(assetKey);

  if (!src) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 -top-2 bottom-[60%] z-[1] flex items-start justify-center overflow-visible">
      <div className="relative flex h-full w-full max-w-[60rem] items-start justify-center">
        <div className="absolute inset-x-[10%] -top-2 bottom-[-4%] rounded-[60px] bg-[radial-gradient(ellipse_at_50%_42%,rgba(245,140,80,0.4),rgba(80,16,12,0.28)_46%,transparent_78%)] blur-lg" />
        <img
          src={src}
          alt=""
          aria-hidden
          className="frontline-boss-breath-fx relative z-[1] h-full w-auto max-w-full object-contain object-top drop-shadow-[0_36px_60px_rgba(180,70,40,0.52)]"
          loading="eager"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-12 bg-[linear-gradient(180deg,transparent,rgba(8,6,12,0.85))]" />
      </div>
    </div>
  );
}
