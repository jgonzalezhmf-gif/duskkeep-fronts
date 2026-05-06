"use client";

import GameAssetIcon from "@/components/ui/GameAssetIcon";
import { cn } from "@/lib/cn";
import type { CombatAssetIconName, GameAssetIconSize } from "@/lib/iconAssets";

export type CombatIconName = CombatAssetIconName;

export function CombatIcon({
  name,
  size = "md",
  label,
  className,
  imgClassName,
  fallbackClassName,
}: {
  name: CombatIconName;
  size?: GameAssetIconSize;
  label?: string;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
}) {
  return (
    <GameAssetIcon
      category="combat"
      name={name}
      size={size}
      label={label}
      decorative={!label}
      className={cn("relative z-[1]", className)}
      imgClassName={cn("drop-shadow-[0_7px_12px_rgba(0,0,0,0.45)]", imgClassName)}
      fallbackClassName={fallbackClassName}
    />
  );
}
