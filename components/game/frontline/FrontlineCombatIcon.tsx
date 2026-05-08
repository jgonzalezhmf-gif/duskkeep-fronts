"use client";

import GameAssetIcon from "@/components/ui/GameAssetIcon";
import type { CombatAssetIconName, GameAssetIconSize } from "@/lib/iconAssets";

export function CombatIcon({
  name,
  size = "sm",
  className,
  imgClassName,
  fallbackClassName,
  label,
}: {
  name: CombatAssetIconName;
  size?: GameAssetIconSize;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  label?: string;
}) {
  return (
    <GameAssetIcon
      category="combat"
      name={name}
      size={size}
      label={label}
      decorative={!label}
      className={className}
      imgClassName={imgClassName}
      fallbackClassName={fallbackClassName}
    />
  );
}
