"use client";

import GameAssetIcon from "@/components/ui/GameAssetIcon";
import { cn } from "@/lib/cn";
import type { GameAssetIconSize, ProgressionAssetIconName } from "@/lib/iconAssets";

export type ProgressionIconName = ProgressionAssetIconName;

const TONE_CLASSES: Record<ProgressionIconName, string> = {
  upgrade: "from-[#fff0a8]/42 via-[#f5c451]/16 to-transparent",
  evolve: "from-violet-100/36 via-cyan-300/14 to-transparent",
  star: "from-[#fff8d6]/48 via-[#f5c451]/18 to-transparent",
  unlock: "from-emerald-100/36 via-[#f5c451]/14 to-transparent",
  claim: "from-[#fff0a8]/44 via-emerald-300/14 to-transparent",
  level_up: "from-sky-100/36 via-[#f5c451]/14 to-transparent",
  tier_up: "from-violet-100/38 via-[#f5c451]/16 to-transparent",
  reward_chest: "from-[#fff0bc]/46 via-[#f5c451]/18 to-transparent",
};

const ASSET_SIZE_OVERRIDES: Partial<Record<ProgressionIconName, Partial<Record<GameAssetIconSize, GameAssetIconSize>>>> = {
  reward_chest: {
    xs: "sm",
    sm: "md",
    md: "lg",
  },
  tier_up: {
    xs: "sm",
    sm: "md",
    md: "lg",
  },
};

export function ProgressionIcon({
  name,
  size = "md",
  label,
  className,
  imgClassName,
  fallbackClassName,
  withGlow = true,
}: {
  name: ProgressionIconName;
  size?: GameAssetIconSize;
  label?: string;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  withGlow?: boolean;
}) {
  const assetSize = ASSET_SIZE_OVERRIDES[name]?.[size] ?? size;

  return (
    <span className={cn("relative isolate inline-grid shrink-0 place-items-center overflow-visible", className)}>
      {withGlow ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(circle,var(--tw-gradient-stops))] opacity-85 blur-lg",
            TONE_CLASSES[name],
          )}
        />
      ) : null}
      <GameAssetIcon
        category="progression"
        name={name}
        size={assetSize}
        label={label}
        decorative={!label}
        className="relative z-[1]"
        imgClassName={cn("drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)]", imgClassName)}
        fallbackClassName={cn("drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]", fallbackClassName)}
      />
    </span>
  );
}
