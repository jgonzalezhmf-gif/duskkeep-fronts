"use client";

import GameAssetIcon from "@/components/ui/GameAssetIcon";
import GameGlyph, { type GlyphKind } from "@/components/ui/GameGlyph";
import { cn } from "@/lib/cn";
import { resolveGlyphAssetIcon } from "@/lib/iconAssets";

export function InlineGlyphIcon({
  kind,
  className,
  imgClassName,
  fallbackClassName,
  label,
}: {
  kind: GlyphKind;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  label?: string;
}) {
  const assetIcon = resolveGlyphAssetIcon(kind);

  return (
    <span className={cn("inline-grid h-4 w-4 shrink-0 place-items-center overflow-visible", className)}>
      {assetIcon ? (
        <GameAssetIcon
          category={assetIcon.category}
          name={assetIcon.name}
          size="xl"
          label={label}
          decorative={!label}
          className="h-full w-full"
          imgClassName={cn("drop-shadow-[0_5px_10px_rgba(0,0,0,0.34)]", imgClassName)}
          fallbackClassName={fallbackClassName}
        />
      ) : (
        <GameGlyph kind={kind} shell="none" className={cn("h-full w-full", fallbackClassName)} />
      )}
    </span>
  );
}
