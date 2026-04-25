"use client";

import GameGlyph, { type GlyphKind } from "@/components/ui/GameGlyph";
import GameAssetIcon from "@/components/ui/GameAssetIcon";
import { resolveGlyphAssetIcon } from "@/lib/iconAssets";
import { cn } from "@/lib/cn";

export type GameIconTone = "gold" | "sky" | "violet" | "emerald" | "ember" | "steel";
export type GameIconFrame = "auto" | "plate" | "spotlight";

const toneClasses: Record<GameIconTone, string> = {
  gold: "border-[#ffe6a8]/34 from-[#fff7d6]/34 via-[#f5c451]/20 to-[#7c3f0d]/40 text-[#ffe4a4] shadow-[#f5c451]/20",
  sky: "border-sky-200/30 from-sky-100/28 via-cyan-300/16 to-blue-950/44 text-sky-100 shadow-sky-300/16",
  violet: "border-violet-200/30 from-violet-100/24 via-violet-400/16 to-violet-950/44 text-violet-100 shadow-violet-300/16",
  emerald: "border-emerald-200/30 from-emerald-100/24 via-emerald-400/16 to-emerald-950/44 text-emerald-100 shadow-emerald-300/16",
  ember: "border-orange-200/32 from-orange-100/26 via-orange-500/18 to-red-950/46 text-orange-100 shadow-orange-300/18",
  steel: "border-white/18 from-white/16 via-white/[0.07] to-slate-950/48 text-white/86 shadow-black/24",
};

const sizeClasses = {
  sm: "h-10 w-10 rounded-[16px] p-1.5",
  md: "h-12 w-12 rounded-[20px] p-1.5",
  lg: "h-14 w-14 rounded-[24px] p-2",
};

const assetSizeClasses = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

const assetAuraClasses: Record<GameIconTone, string> = {
  gold: "from-[#fff0a8]/44 via-[#f5c451]/18 to-transparent",
  sky: "from-sky-100/38 via-cyan-300/16 to-transparent",
  violet: "from-violet-100/36 via-violet-400/16 to-transparent",
  emerald: "from-emerald-100/36 via-emerald-400/16 to-transparent",
  ember: "from-orange-100/38 via-orange-400/18 to-transparent",
  steel: "from-white/26 via-white/10 to-transparent",
};

export default function GameIcon({
  kind,
  tone = "gold",
  size = "md",
  frame = "auto",
  className,
  glyphClassName,
}: {
  kind: GlyphKind;
  tone?: GameIconTone;
  size?: keyof typeof sizeClasses;
  frame?: GameIconFrame;
  className?: string;
  glyphClassName?: string;
}) {
  const assetIcon = resolveGlyphAssetIcon(kind);
  const shouldUseSpotlight = assetIcon && frame !== "plate";

  if (shouldUseSpotlight) {
    return (
      <span
        className={cn(
          "group/icon relative isolate inline-grid shrink-0 place-items-center overflow-visible",
          assetSizeClasses[size],
          className,
        )}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-3 rounded-[999px] bg-[radial-gradient(circle,var(--tw-gradient-stops))] opacity-90 blur-xl transition duration-300 group-hover/icon:opacity-100",
            assetAuraClasses[tone],
          )}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-[999px] bg-[radial-gradient(circle,rgba(255,255,255,0.16),transparent_62%)] opacity-70"
        />
        <GameAssetIcon
          category={assetIcon.category}
          name={assetIcon.name}
          size="xl"
          className={cn("relative z-[1] h-[118%] w-[118%]", glyphClassName)}
          imgClassName="drop-shadow-[0_10px_18px_rgba(0,0,0,0.48)] transition duration-300 group-hover/icon:scale-110 group-hover/icon:drop-shadow-[0_0_18px_rgba(255,230,170,0.42)]"
          fallbackClassName="drop-shadow-[0_7px_10px_rgba(0,0,0,0.46)]"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden border bg-[linear-gradient(145deg,var(--tw-gradient-stops))] shadow-[0_16px_30px_var(--tw-shadow-color),inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-10px_18px_rgba(0,0,0,0.28)]",
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_26%_12%,rgba(255,255,255,0.42),transparent_30%),radial-gradient(circle_at_72%_80%,rgba(0,0,0,0.28),transparent_46%),linear-gradient(180deg,rgba(255,255,255,0.13),transparent_48%)]" />
      <span className="pointer-events-none absolute inset-[4px] rounded-[inherit] border border-white/14" />
      <span className="pointer-events-none absolute left-[13%] top-[13%] h-1.5 w-1.5 rounded-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.45)]" />
      <span className="pointer-events-none absolute right-[13%] top-[13%] h-1.5 w-1.5 rounded-full bg-white/22" />
      <span className="pointer-events-none absolute inset-x-[22%] bottom-1.5 h-px bg-white/30" />
      <span className="pointer-events-none absolute inset-y-[18%] left-0 w-px bg-white/18" />
      <span className="pointer-events-none absolute inset-y-[18%] right-0 w-px bg-black/30" />
      {assetIcon ? (
        <GameAssetIcon
          category={assetIcon.category}
          name={assetIcon.name}
          size="xl"
          className={cn("relative z-[1] h-[88%] w-[88%]", glyphClassName)}
          imgClassName="drop-shadow-[0_8px_14px_rgba(0,0,0,0.38)]"
          fallbackClassName="drop-shadow-[0_7px_10px_rgba(0,0,0,0.46)]"
        />
      ) : (
        <GameGlyph kind={kind} shell="none" className={cn("relative z-[1] h-[76%] w-[76%] drop-shadow-[0_7px_10px_rgba(0,0,0,0.46)]", glyphClassName)} />
      )}
    </span>
  );
}
