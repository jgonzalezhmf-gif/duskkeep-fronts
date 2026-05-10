"use client";

import type { ReactNode } from "react";
import GameGlyph from "@/components/ui/GameGlyph";
import {
  GAME_ASSET_ICON_FALLBACK_GLYPH,
  getGameAssetIconSrc,
  getGameAssetIconWebpSrc,
  type GameAssetIconCategory,
  type GameAssetIconName,
  type GameAssetIconSize,
} from "@/lib/iconAssets";
import { cn } from "@/lib/cn";

const SIZE_CLASSES: Record<GameAssetIconSize, string> = {
  xs: "h-[18px] w-[18px]",
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export default function GameAssetIcon({
  category,
  name,
  size = "md",
  label,
  decorative = true,
  className,
  imgClassName,
  fallback,
  fallbackClassName,
}: {
  category: GameAssetIconCategory;
  name: GameAssetIconName;
  size?: GameAssetIconSize;
  label?: string;
  decorative?: boolean;
  className?: string;
  imgClassName?: string;
  fallback?: ReactNode;
  fallbackClassName?: string;
}) {
  const src = getGameAssetIconSrc(category, name);
  const webpSrc = getGameAssetIconWebpSrc(category, name);
  const fallbackGlyph = GAME_ASSET_ICON_FALLBACK_GLYPH[name];

  return (
    <span className={cn("frontline-motion-icon relative inline-grid shrink-0 place-items-center overflow-visible", SIZE_CLASSES[size], className)}>
      {src ? (
        <picture className="contents">
          {webpSrc ? <source srcSet={webpSrc} type="image/webp" /> : null}
          <img
            src={src}
            alt={decorative ? "" : label ?? name}
            aria-hidden={decorative ? "true" : undefined}
            loading="lazy"
            decoding="async"
            className={cn("h-full w-full object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.34)]", imgClassName)}
          />
        </picture>
      ) : (
        fallback ?? <GameGlyph kind={fallbackGlyph} shell="none" className={cn("h-full w-full", fallbackClassName)} />
      )}
    </span>
  );
}
