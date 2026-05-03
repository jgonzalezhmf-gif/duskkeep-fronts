"use client";

import GameAssetIcon from "@/components/ui/GameAssetIcon";
import { cn } from "@/lib/cn";
import type { GameAssetIconSize, ModeAssetIconName } from "@/lib/iconAssets";

export type ModeIconName = ModeAssetIconName;

const TONE_CLASSES: Record<ModeIconName, string> = {
  campaign: "from-orange-100/42 via-[#f5c451]/16 to-transparent",
  ladder: "from-sky-100/38 via-cyan-300/16 to-transparent",
  arena_draft: "from-[#fff0a8]/42 via-orange-400/16 to-transparent",
  daily_event: "from-violet-100/40 via-fuchsia-400/16 to-transparent",
  boss_event: "from-rose-100/44 via-red-500/18 to-transparent",
  fortress_raid: "from-orange-100/40 via-rose-500/17 to-transparent",
  challenge: "from-[#fff0a8]/38 via-sky-300/14 to-transparent",
  dungeon_run: "from-emerald-100/36 via-teal-400/15 to-transparent",
  boss_rush: "from-red-100/42 via-[#f5c451]/18 to-transparent",
};

export function ModeIcon({
  name,
  size = "md",
  label,
  className,
  imgClassName,
  fallbackClassName,
  withGlow = true,
}: {
  name: ModeIconName;
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
            "pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(circle,var(--tw-gradient-stops))] opacity-90 blur-lg",
            TONE_CLASSES[name],
          )}
        />
      ) : null}
      <GameAssetIcon
        category="modes"
        name={name}
        size={size}
        label={label}
        decorative={!label}
        className="relative z-[1]"
        imgClassName={cn("scale-[1.06] drop-shadow-[0_8px_14px_rgba(0,0,0,0.48)]", imgClassName)}
        fallbackClassName={cn("drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]", fallbackClassName)}
      />
    </span>
  );
}
