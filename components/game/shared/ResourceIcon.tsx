"use client";

import GameAssetIcon from "@/components/ui/GameAssetIcon";
import {
  GAME_ICON_ASSET_MANIFEST,
  getGameAssetIconSrc,
  isResourceAssetIconName,
  type ResourceAssetIconName,
} from "@/lib/iconAssets";
import { cn } from "@/lib/cn";

export type ResourceIconKind = ResourceAssetIconName;
export const RESOURCE_ICON_MANIFEST = GAME_ICON_ASSET_MANIFEST.resources;

const RESOURCE_ICON_SIZES = {
  small: "h-6 w-6",
  medium: "h-8 w-8",
  large: "h-12 w-12",
};

export function isResourceIconKind(kind: string): kind is ResourceIconKind {
  return isResourceAssetIconName(kind);
}

export function getResourceIconSrc(kind: ResourceIconKind) {
  return getGameAssetIconSrc("resources", kind);
}

export function ResourceIcon({
  kind,
  size = "medium",
  className,
  imgClassName,
  fallbackClassName,
}: {
  kind: ResourceIconKind;
  size?: keyof typeof RESOURCE_ICON_SIZES;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
}) {
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center overflow-visible", RESOURCE_ICON_SIZES[size], className)}>
      <GameAssetIcon
        category="resources"
        name={kind}
        size="xl"
        className="h-full w-full"
        imgClassName={cn("drop-shadow-[0_0_16px_rgba(255,229,158,0.34)]", imgClassName)}
        fallbackClassName={fallbackClassName}
      />
    </span>
  );
}
