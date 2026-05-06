"use client";

import GameAssetIcon from "@/components/ui/GameAssetIcon";
import { cn } from "@/lib/cn";
import type { GameAssetIconSize, UiAssetIconName } from "@/lib/iconAssets";

export type UiIconName = UiAssetIconName;

export function UiIcon({
  name,
  size = "md",
  label,
  className,
  imgClassName,
  fallbackClassName,
}: {
  name: UiIconName;
  size?: GameAssetIconSize;
  label?: string;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
}) {
  return (
    <GameAssetIcon
      category="ui"
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
