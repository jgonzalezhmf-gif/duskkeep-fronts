"use client";

import GameAssetIcon from "@/components/ui/GameAssetIcon";
import type { CardAssetIconName, GameAssetIconSize } from "@/lib/iconAssets";
import { cn } from "@/lib/cn";

export type CardTypeIconName = CardAssetIconName;

const TONE_CLASSES: Record<CardTypeIconName, string> = {
  order: "from-sky-100/42 via-cyan-300/16 to-transparent",
  tactic: "from-violet-100/42 via-violet-400/16 to-transparent",
  summon: "from-emerald-100/42 via-emerald-400/16 to-transparent",
  gear: "from-amber-100/42 via-orange-300/16 to-transparent",
  signature: "from-[#fff0a8]/44 via-[#f5c451]/18 to-transparent",
  relic: "from-fuchsia-100/40 via-violet-500/18 to-transparent",
};

export function CardTypeIcon({
  type,
  size = "sm",
  label,
  className,
  imgClassName,
  fallbackClassName,
  withGlow = true,
}: {
  type: CardTypeIconName;
  size?: GameAssetIconSize;
  label?: string;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  withGlow?: boolean;
}) {
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center overflow-visible", className)}>
      {withGlow ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(circle,var(--tw-gradient-stops))] opacity-85 blur-md",
            TONE_CLASSES[type],
          )}
        />
      ) : null}
      <GameAssetIcon
        category="cards"
        name={type}
        size={size}
        label={label}
        decorative={!label}
        className="relative z-[1]"
        imgClassName={cn("drop-shadow-[0_7px_12px_rgba(0,0,0,0.45)]", imgClassName)}
        fallbackClassName={fallbackClassName}
      />
    </span>
  );
}
