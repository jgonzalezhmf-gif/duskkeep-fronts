import GameBackNav from "@/components/game/shared/GameBackNav";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";

export function FortressTopChrome({ resources }: { resources: { gold: number; dust: number; gems: number } }) {
  return (
    <div className="pointer-events-none fixed inset-x-3 top-4 z-30 flex items-start justify-between gap-2 md:inset-x-5 md:gap-3">
      <div className="pointer-events-auto">
        <GameBackNav />
      </div>
      <GameResourceBar resources={resources} size="md" className="pointer-events-auto max-w-[calc(100vw-1.5rem)] pt-16 sm:max-w-[calc(100vw-9rem)] sm:pt-0 md:max-w-none" />
    </div>
  );
}
