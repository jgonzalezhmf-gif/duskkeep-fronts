"use client";

import ArtPortrait from "@/components/ui/ArtPortrait";
import GameGlyph from "@/components/ui/GameGlyph";
import FantasyMedallion from "@/components/ui/fantasy/FantasyMedallion";

export default function FantasyCommanderBadge({
  name,
  level,
  xpWidth,
  portrait,
}: {
  name: string;
  level: number;
  xpWidth: number;
  portrait: string;
}) {
  return (
    <div className="relative isolate min-w-[14rem]">
      <div
        aria-hidden
        className="absolute inset-0 border border-[#f5c451]/20 bg-[radial-gradient(circle_at_20%_0%,rgba(245,196,81,0.16),transparent_36%),linear-gradient(180deg,rgba(11,15,21,0.8),rgba(8,11,17,0.98))] shadow-[0_24px_48px_rgba(0,0,0,0.36)]"
        style={{ clipPath: "polygon(10% 0%, 90% 0%, 100% 22%, 100% 100%, 0% 100%, 0% 22%)" }}
      />
      <div
        aria-hidden
        className="absolute inset-x-[7%] top-[7%] h-6 bg-[linear-gradient(180deg,rgba(255,245,212,0.24),transparent)] blur-[6px]"
      />
      <div className="relative flex items-center gap-3 px-3 py-3.5 md:px-4">
        <div className="relative shrink-0">
          <FantasyMedallion tone="gold" size="xl" active>
            <ArtPortrait
              src={portrait}
              alt={name}
              className="h-full w-full rounded-[22%] object-cover"
              fallback={<GameGlyph kind="fortress" className="h-full w-full" shell="none" />}
            />
          </FantasyMedallion>
          <div
            className="absolute -bottom-1 left-1/2 min-w-[3rem] -translate-x-1/2 border border-[#f5c451]/28 bg-[linear-gradient(180deg,#3d250c,#160b05)] px-2 py-0.5 text-center text-[9px] font-black uppercase tracking-[0.18em] text-[#f5dda0] shadow-[0_8px_18px_rgba(0,0,0,0.3)]"
            style={{ clipPath: "polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)" }}
          >
            Lv {level}
          </div>
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <div className="text-[9px] font-black uppercase tracking-[0.34em] text-white/44">War Council</div>
          <div className="mt-1 truncate text-base font-black tracking-[0.03em] text-[#f5deb0] md:text-lg">{name}</div>
          <div className="mt-2 flex items-center gap-2">
            <div
              className="relative h-3 flex-1 overflow-hidden border border-[#f5c451]/18 bg-black/38 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
              style={{ clipPath: "polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%)" }}
            >
              <div
                className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#f5c451,#ffe8a8)] shadow-[0_0_12px_rgba(245,196,81,0.38)]"
                style={{ width: `${xpWidth}%`, clipPath: "polygon(0 0, 98% 0, 100% 50%, 98% 100%, 0 100%)" }}
              />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/52">Realm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
