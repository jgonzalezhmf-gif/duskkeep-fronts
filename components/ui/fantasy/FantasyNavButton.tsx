"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import GameAssetIcon from "@/components/ui/GameAssetIcon";
import GameGlyph, { type GlyphKind } from "@/components/ui/GameGlyph";
import FantasyMedallion, { type FantasyTone } from "@/components/ui/fantasy/FantasyMedallion";
import { resolveGlyphAssetIcon } from "@/lib/iconAssets";

const TAB = "polygon(12% 0%, 88% 0%, 100% 26%, 100% 80%, 82% 100%, 18% 100%, 0% 80%, 0% 26%)";

export default function FantasyNavButton({
  href,
  label,
  short,
  icon,
  active,
  tone = "gold",
}: {
  href: string;
  label: string;
  short: string;
  icon: GlyphKind;
  active?: boolean;
  tone?: FantasyTone;
}) {
  const assetIcon = resolveGlyphAssetIcon(icon);

  return (
    <Link href={href} className="group relative block px-1 py-1.5 md:px-1.5 md:py-2">
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 top-1 transition duration-300",
          active
            ? "bg-[radial-gradient(circle_at_50%_20%,rgba(245,196,81,0.2),transparent_48%),linear-gradient(180deg,rgba(255,244,204,0.08),rgba(255,244,204,0.02))] opacity-100"
            : "bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] opacity-75 group-hover:opacity-100",
        )}
        style={{ clipPath: TAB }}
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-[14%] bottom-[3px] top-[6px] border transition duration-300",
          active ? "border-[#f5c451]/28" : "border-white/8 group-hover:border-white/12",
        )}
        style={{ clipPath: TAB }}
      />
      {active ? (
        <span
          aria-hidden
          className="absolute left-1/2 top-0 h-6 w-14 -translate-x-1/2 rounded-full bg-[#f5c451]/26 blur-[16px]"
        />
      ) : null}

      <div className="relative z-[1] flex flex-col items-center gap-1">
        <FantasyMedallion tone={active ? tone : "slate"} size="lg" active={active}>
          {assetIcon ? (
            <GameAssetIcon
              category={assetIcon.category}
              name={assetIcon.name}
              size="xl"
              className={cn("h-full w-full", active ? "animate-[iconBreath_4.6s_ease-in-out_infinite]" : "")}
              fallback={<GameGlyph kind={icon} shell="none" className={cn("h-full w-full", active ? "animate-[iconBreath_4.6s_ease-in-out_infinite]" : "")} />}
            />
          ) : (
            <GameGlyph kind={icon} shell="none" className={cn("h-full w-full", active ? "animate-[iconBreath_4.6s_ease-in-out_infinite]" : "")} />
          )}
        </FantasyMedallion>
        <span
          className={cn(
            "min-w-[3.6rem] px-2 py-1 text-center text-[8px] font-black uppercase tracking-[0.22em] md:text-[10px]",
            active ? "text-[#f7df9d]" : "text-white/64 group-hover:text-white/82",
          )}
          style={{ clipPath: "polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)" }}
        >
          <span className="md:hidden">{short}</span>
          <span className="hidden md:inline">{label}</span>
        </span>
      </div>
    </Link>
  );
}
