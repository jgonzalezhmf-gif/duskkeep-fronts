"use client";

import GameAssetIcon from "@/components/ui/GameAssetIcon";
import { cn } from "@/lib/cn";
import type { GameAssetIconSize, ShopAssetIconName } from "@/lib/iconAssets";

export type ShopIconName = ShopAssetIconName;

const TONE_CLASSES: Record<ShopIconName, string> = {
  daily_offer: "from-sky-100/40 via-cyan-300/16 to-transparent",
  bundle: "from-[#fff0a8]/42 via-[#f5c451]/16 to-transparent",
  hot_deal: "from-orange-100/46 via-red-500/18 to-transparent",
  best_value: "from-[#fff8d6]/48 via-[#f5c451]/18 to-transparent",
  limited_time: "from-violet-100/38 via-sky-400/15 to-transparent",
  owned: "from-emerald-100/40 via-emerald-400/16 to-transparent",
  sold_out: "from-rose-100/36 via-rose-500/15 to-transparent",
  refresh: "from-cyan-100/38 via-[#f5c451]/14 to-transparent",
  premium_pack: "from-fuchsia-100/38 via-[#f5c451]/16 to-transparent",
  free_claim: "from-emerald-100/42 via-[#f5c451]/16 to-transparent",
  featured: "from-[#fff4c9]/46 via-[#f5c451]/18 to-transparent",
  discount: "from-orange-100/40 via-[#f5c451]/18 to-transparent",
};

export function ShopIcon({
  name,
  size = "md",
  label,
  className,
  imgClassName,
  fallbackClassName,
  withGlow = true,
}: {
  name: ShopIconName;
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
        category="shop"
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
