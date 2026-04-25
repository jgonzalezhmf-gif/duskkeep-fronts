"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store";
import GameOptionsButton from "@/components/game/options/GameOptionsButton";
import MuteButton from "@/components/ui/MuteButton";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import { useI18n } from "@/lib/i18n/useI18n";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 10_000) return (n / 1_000).toFixed(1) + "k";
  return n.toString();
}

export default function TopBar() {
  const { t } = useI18n();
  const resources = useGameStore((s) => s.resources);
  const hydrated = useGameStore((s) => s.hydrated);

  return (
    <header className="sticky top-0 z-40 border-b border-[#c7a46a]/12 bg-[linear-gradient(180deg,rgba(6,8,12,0.92),rgba(9,11,18,0.78))] backdrop-blur-xl">
      <div className="flex items-center gap-3 px-3 py-3 lg:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="relative">
            <span className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-accent/30 to-accent2/20 blur-sm" />
            <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-accent/95 to-amber-600/90 text-sm font-black text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_24px_rgba(245,196,81,0.18)]">
              FT
            </span>
          </span>
          <div className="min-w-0 leading-none">
            <div className="truncate text-[13px] font-black tracking-[0.16em] text-white/92">
              {t("app.title")}
            </div>
            <div className="mt-1 text-[9px] tracking-[0.22em] text-white/42">{t("app.alpha")}</div>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-2 text-xs">
          <GameResourceBar
            resources={{
              gold: hydrated ? fmt(resources.gold) : "...",
              dust: hydrated ? fmt(resources.dust) : "...",
              gems: hydrated ? fmt(resources.gems) : "...",
            }}
            size="sm"
            className="max-w-[calc(100vw-10rem)]"
          />
          <GameOptionsButton />
          <MuteButton />
        </div>
      </div>
    </header>
  );
}
