"use client";

import { BattlePhaseBanner, HeaderChip, UtilityBubble } from "@/components/game/deckbattle/DeckBattlePrimitives";

export function DeckBattleCommandPanel({
  round,
  activeSide,
  title,
  body,
  focus,
  hint,
  onClearFocus,
}: {
  round: number;
  activeSide: "ally" | "enemy";
  title: string;
  body: string;
  focus: string;
  hint: string;
  onClearFocus: () => void;
}) {
  return (
    <div className="order-1 col-span-2 rounded-[22px] bg-[linear-gradient(180deg,rgba(11,18,30,0.74),rgba(8,12,18,0.5))] px-3 py-2.5 shadow-[0_12px_22px_rgba(0,0,0,0.16)] backdrop-blur-lg lg:col-span-1 lg:px-3.5 lg:py-3">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <BattlePhaseBanner round={round} activeSide={activeSide} />
          <div className="mt-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-[#f5d498]/66">Combat order</div>
          <div className="mt-1 text-[13px] font-black text-white md:text-[15px]">{title}</div>
          <div className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/58 md:max-w-[42rem]">{body}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <UtilityBubble kind="cfg" compact />
          <UtilityBubble label="AUTO" compact />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <HeaderChip label="Focus" value={focus} tone="neutral" compact />
        <HeaderChip label="Hint" value={hint} tone={activeSide === "ally" ? "ally" : "enemy"} compact />
        <button
          className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-white/68 shadow-[0_10px_18px_rgba(0,0,0,0.16)]"
          onClick={onClearFocus}
        >
          Clear focus
        </button>
      </div>
    </div>
  );
}
