"use client";

import GameGlyph from "@/components/ui/GameGlyph";
import type { FrontlineBattleState } from "@/features/frontline/types";
import type { FrontlineLane } from "@/lib/types";
import { cn } from "@/lib/cn";
import { getFrontlineHeroVisualAsset } from "./frontlineVisualAssets";
import { CombatIcon } from "./FrontlineCombatIcon";
import { VisualAssetImage } from "./FrontlineVisualAssetImage";

export type FrontlineDeathGhostFx = {
  eventId: string;
  lane: FrontlineLane;
  targetSide: "ally" | "enemy";
  actor: NonNullable<FrontlineBattleState["lanes"]["left"]["allyHero"]>;
};

export function DeathGhost({ ghost }: { ghost: FrontlineDeathGhostFx | null }) {
  if (!ghost) return null;

  const visual = getFrontlineHeroVisualAsset(ghost.actor.heroId);
  const topClass = ghost.targetSide === "ally" ? "top-[72%]" : "top-[25%]";
  const sideClass =
    ghost.targetSide === "ally"
      ? "border-cyan-100/28 bg-cyan-200/10 shadow-[0_0_50px_rgba(101,210,200,0.28)]"
      : "border-rose-100/28 bg-rose-300/10 shadow-[0_0_50px_rgba(240,95,114,0.3)]";

  return (
    <div className="pointer-events-none absolute inset-0 z-[8]">
      <div className={cn("frontline-death-soul-fx absolute left-1/2 h-36 w-36 rounded-full border", topClass, sideClass)} />
      <div className={cn("frontline-death-ghost-fx absolute left-1/2 grid place-items-center", topClass)}>
        <div className="relative h-36 w-28">
          <div className="absolute inset-x-1 bottom-0 h-8 rounded-full bg-[#f5c451]/18 blur-md" />
          <VisualAssetImage
            src={visual.standeeSrc}
            fallbackSrc={visual.portraitFallbackSrc}
            alt={ghost.actor.name}
            className="relative h-full w-full rounded-t-[34px] rounded-b-[22px] bg-black/22 shadow-[0_22px_48px_rgba(0,0,0,0.5)]"
            imgClassName={cn("h-full w-full object-top", visual.standeeSrc ? "object-contain" : "object-cover")}
            fallback={
              <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),rgba(0,0,0,0.28))]">
                <GameGlyph kind="heroes" shell="none" className="h-10 w-10" />
              </div>
            }
          />
          <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#f5c451]/48 bg-[#f5c451]/16 text-[#fff0bd] shadow-[0_0_46px_rgba(245,196,81,0.42)]">
            <CombatIcon name="danger" size="lg" className="h-12 w-12" fallbackClassName="h-12 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
