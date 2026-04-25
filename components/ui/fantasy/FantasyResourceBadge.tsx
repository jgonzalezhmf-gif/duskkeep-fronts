"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import GameGlyph, { type GlyphKind } from "@/components/ui/GameGlyph";
import GameAssetIcon from "@/components/ui/GameAssetIcon";
import FantasyMedallion, { type FantasyTone } from "@/components/ui/fantasy/FantasyMedallion";
import { resolveGlyphAssetIcon } from "@/lib/iconAssets";

const BANNER = "polygon(6% 0%, 94% 0%, 100% 26%, 100% 74%, 94% 100%, 6% 100%, 0% 74%, 0% 26%)";

export default function FantasyResourceBadge({
  href,
  label,
  short,
  value,
  tone,
  icon,
  className,
}: {
  href: string;
  label: string;
  short: string;
  value: string;
  tone: FantasyTone;
  icon: GlyphKind;
  className?: string;
}) {
  const assetIcon = resolveGlyphAssetIcon(icon);

  return (
    <Link
      href={href}
      className={cn("group relative inline-flex items-center gap-2 pr-2.5 pl-0.5 transition hover:-translate-y-0.5", className)}
    >
      <span
        aria-hidden
        className="absolute inset-y-[2px] left-5 right-0 border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,22,0.88),rgba(7,10,16,0.98))] shadow-[0_14px_26px_rgba(0,0,0,0.28)]"
        style={{ clipPath: BANNER }}
      />
      <span
        aria-hidden
        className="absolute inset-y-[5px] left-7 right-2 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] opacity-70"
        style={{ clipPath: BANNER }}
      />
      <FantasyMedallion tone={tone} size="md" className="shrink-0">
        {assetIcon ? (
          <GameAssetIcon
            category={assetIcon.category}
            name={assetIcon.name}
            size="xl"
            className="h-full w-full"
            fallback={<GameGlyph kind={icon} shell="none" className="h-full w-full" />}
          />
        ) : (
          <GameGlyph kind={icon} shell="none" className="h-full w-full" />
        )}
      </FantasyMedallion>
      <span className="relative z-[1] min-w-0 pr-2">
        <span className="block text-[8px] font-black uppercase tracking-[0.28em] text-white/42 md:hidden">{short}</span>
        <span className="hidden text-[9px] font-black uppercase tracking-[0.26em] text-white/38 md:block">{label}</span>
        <span className="mt-0.5 block text-[11px] font-black tracking-[0.04em] text-white md:text-[13px]">{value}</span>
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
      >
        <span className="absolute inset-y-[3px] left-5 right-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] blur-[10px]" />
      </span>
    </Link>
  );
}
