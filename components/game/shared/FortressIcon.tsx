"use client";

import GameAssetIcon from "@/components/ui/GameAssetIcon";
import { cn } from "@/lib/cn";
import type { FortressAssetIconName, GameAssetIconSize } from "@/lib/iconAssets";

export type FortressIconName = FortressAssetIconName;

const TONE_CLASSES: Record<FortressIconName, string> = {
  keep: "from-[#ffe6a8]/42 via-[#f5c451]/16 to-transparent",
  treasury: "from-emerald-200/36 via-[#f5c451]/14 to-transparent",
  barracks: "from-sky-200/36 via-cyan-300/14 to-transparent",
  integrity: "from-emerald-200/34 via-white/10 to-transparent",
  defense_rating: "from-[#f5d498]/34 via-sky-200/12 to-transparent",
  raid: "from-rose-200/38 via-orange-400/16 to-transparent",
  repair: "from-cyan-100/34 via-emerald-300/14 to-transparent",
  garrison: "from-sky-100/34 via-violet-300/14 to-transparent",
  watchtower: "from-[#fff0bc]/34 via-sky-200/14 to-transparent",
};

export function FortressIcon({
  name,
  size = "md",
  label,
  className,
  imgClassName,
  fallbackClassName,
  withGlow = true,
}: {
  name: FortressIconName;
  size?: GameAssetIconSize;
  label?: string;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  withGlow?: boolean;
}) {
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
        category="fortress"
        name={name}
        size={size}
        label={label}
        decorative={!label}
        className="relative z-[1]"
        imgClassName={cn("drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)]", imgClassName)}
        fallbackClassName={cn("drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]", fallbackClassName)}
      />
    </span>
  );
}
