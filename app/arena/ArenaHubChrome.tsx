"use client";

import GameBackNav from "@/components/game/shared/GameBackNav";
import { GameResourceBar } from "@/components/game/shared/GameRewardToken";
import { ModeIcon } from "@/components/game/shared/ModeIcon";

export function ArenaTopChrome({
  resources,
}: {
  resources: { gold: number; dust: number; gems: number; arenaTickets: number };
}) {
  return (
    <>
      <GameBackNav />
      <div className="pointer-events-auto fixed right-3 top-3 z-40 flex items-center gap-1.5 md:right-5 md:top-4 md:gap-2">
        <GameResourceBar resources={resources} arenaTickets={resources.arenaTickets} size="sm" className="max-w-[calc(100vw-9rem)] md:max-w-none" />
      </div>
    </>
  );
}

export function ModeSelectCard({
  active,
  onClick,
  icon,
  eyebrow,
  title,
  copy,
  meta,
}: {
  active: boolean;
  onClick: () => void;
  icon: "ladder" | "arena_draft";
  eyebrow: string;
  title: string;
  copy: string;
  meta: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group/mode relative overflow-hidden rounded-[26px] border p-3 text-left transition duration-300 md:p-4",
        active
          ? "border-[#f5c451]/34 bg-[radial-gradient(circle_at_18%_8%,rgba(245,196,81,0.22),transparent_36%),linear-gradient(180deg,rgba(62,39,18,0.62),rgba(8,10,16,0.88))] shadow-[0_18px_44px_rgba(245,196,81,0.12)]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(8,10,16,0.76))] hover:border-white/18 hover:bg-white/[0.07]",
      ].join(" ")}
    >
      <span className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-white/10 blur-2xl transition group-hover/mode:bg-white/14" />
      <span className="relative z-[1] flex items-start gap-3">
        <span className={["grid h-14 w-14 shrink-0 place-items-center rounded-[20px] border", active ? "border-[#f5c451]/28 bg-[#f5c451]/12" : "border-white/10 bg-black/18"].join(" ")}>
          <ModeIcon name={icon} size="lg" />
        </span>
        <span className="min-w-0">
          <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-[#f5d498]/78">{eyebrow}</span>
          <span className="mt-1 block text-lg font-black leading-tight text-white">{title}</span>
          <span className="mt-1 block text-[12px] font-semibold leading-5 text-white/55">{copy}</span>
          <span className={["mt-3 inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em]", active ? "border-[#f5c451]/28 bg-[#f5c451]/12 text-[#ffe3a1]" : "border-white/10 bg-white/[0.045] text-white/46"].join(" ")}>
            {meta}
          </span>
        </span>
      </span>
    </button>
  );
}
