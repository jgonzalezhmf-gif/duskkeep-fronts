"use client";

import GameAssetIcon from "@/components/ui/GameAssetIcon";
import { cn } from "@/lib/cn";
import type { GameAssetIconSize, StatusAssetIconName } from "@/lib/iconAssets";

export type StatusIconName = StatusAssetIconName;

const TONE_CLASSES: Record<StatusIconName, string> = {
  buff: "from-[#fff0a8]/42 via-[#f5c451]/16 to-transparent",
  debuff: "from-rose-100/34 via-rose-500/14 to-transparent",
  poison: "from-lime-100/36 via-green-500/16 to-transparent",
  burn: "from-orange-100/42 via-red-500/16 to-transparent",
  freeze: "from-cyan-100/38 via-sky-400/14 to-transparent",
  silence: "from-violet-100/36 via-violet-500/14 to-transparent",
  guard: "from-sky-100/40 via-cyan-300/16 to-transparent",
  rush: "from-orange-100/40 via-[#f5c451]/16 to-transparent",
  bleed: "from-red-100/40 via-red-600/16 to-transparent",
  curse: "from-fuchsia-100/34 via-violet-600/14 to-transparent",
  regen: "from-emerald-100/40 via-emerald-400/16 to-transparent",
  armor_break: "from-amber-100/36 via-orange-500/14 to-transparent",
};

export function StatusIcon({
  name,
  size = "sm",
  label,
  className,
  imgClassName,
  fallbackClassName,
  withGlow = true,
}: {
  name: StatusIconName;
  size?: GameAssetIconSize;
  label?: string;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  withGlow?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative isolate inline-grid shrink-0 place-items-center overflow-visible rounded-full bg-black/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        className,
      )}
    >
      {withGlow ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(circle,var(--tw-gradient-stops))] opacity-90 blur-md",
            TONE_CLASSES[name],
          )}
        />
      ) : null}
      <GameAssetIcon
        category="status"
        name={name}
        size={size}
        label={label}
        decorative={!label}
        className="relative z-[1]"
        imgClassName={cn("scale-[1.08] drop-shadow-[0_7px_12px_rgba(0,0,0,0.45)]", imgClassName)}
        fallbackClassName={cn("drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]", fallbackClassName)}
      />
    </span>
  );
}
