"use client";

import ArtPortrait from "@/components/ui/ArtPortrait";
import GameGlyph from "@/components/ui/GameGlyph";
import { FRONTLINE_LEADERS } from "@/features/frontline/data";
import type { FrontlineLeaderDef } from "@/features/frontline/types";
import { getLeaderPortrait } from "@/lib/art";
import { cn } from "@/lib/cn";
import { frontlineLeaderName, frontlineLeaderPowerName, frontlineLeaderTitle } from "@/lib/i18n/frontlineText";
import { Panel } from "./DeckPrimitives";
import type { TranslateFn } from "./deckPageHelpers";

export function LeaderDoctrinePanel({
  leader,
  onSelectLeader,
  t,
}: {
  leader: FrontlineLeaderDef;
  onSelectLeader: (leaderId: string) => void;
  t: TranslateFn;
}) {
  const leaderName = frontlineLeaderName(t, leader);
  const leaderTitle = frontlineLeaderTitle(t, leader);
  const leaderPowerName = frontlineLeaderPowerName(t, leader);

  return (
    <Panel title={t("deckScreen.panels.leaderDoctrine")}>
      <div className="rounded-[20px] border border-[#f5c451]/20 bg-[linear-gradient(180deg,rgba(245,196,81,0.1),rgba(20,16,18,0.82))] p-2.5">
        <ArtPortrait
          src={getLeaderPortrait(leader.id)}
          alt={leaderName}
          className="aspect-[4/4.6] w-full rounded-[20px] border border-white/10 bg-black/20"
          fallback={<GameGlyph kind="battle" shell="none" className="h-8 w-8" />}
        />
        <div className="mt-2 text-base font-black text-white">{leaderName}</div>
        <div className="mt-1 text-[12px] text-white/58">{leaderTitle}</div>
        <div className="mt-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-white/70">
          {leaderPowerName}
        </div>
      </div>

      <div className="mt-2 grid gap-1.5">
        {FRONTLINE_LEADERS.map((option) => {
          const active = option.id === leader.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelectLeader(option.id)}
              className={cn(
                "frontline-motion-tab rounded-[14px] border px-3 py-1.5 text-left transition",
                active ? "border-[#f5c451]/24 bg-[#f5c451]/10" : "border-white/10 bg-white/[0.03]",
              )}
            >
              <div className="text-sm font-black text-white">{frontlineLeaderName(t, option)}</div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
