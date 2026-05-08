import type { HomeTone } from "@/components/game/home/types";

export const SIDE_ACTIONS = [
  { href: "/shop", labelKey: "nav.offers", sublabelKey: "home.hotDrops", icon: "offers" as const, tone: "rose" as const },
  { href: "/missions", labelKey: "nav.rewards", sublabelKey: "home.claim", icon: "rewards" as const, tone: "gold" as const },
  { href: "/events", labelKey: "nav.events", sublabelKey: "home.liveNow", icon: "events" as const, modeIcon: "daily_event" as const, tone: "violet" as const },
];

export const DOCK_ACTIONS = [
  { href: "/team", labelKey: "nav.team", icon: "team" as const, tone: "sky" as const },
  { href: "/missions", labelKey: "nav.quests", icon: "missions" as const, tone: "gold" as const },
  { href: "/roster", labelKey: "nav.heroes", icon: "heroes" as const, tone: "violet" as const },
  { href: "/deck", labelKey: "nav.deck", icon: "deck" as const, tone: "emerald" as const },
];

export const TONE_STYLES: Record<
  HomeTone,
  {
    ring: string;
    wash: string;
    text: string;
    panel: string;
    solid: string;
    soft: string;
  }
> = {
  gold: {
    ring: "border-[#f0c75a]/45",
    wash: "from-[#f8d47a]/54 via-[#f0c75a]/18 to-transparent",
    text: "text-[#fff1bf]",
    panel: "from-[#2b1c10]/95 via-[#17120c]/96 to-[#100d0a]/98",
    solid: "#f0c75a",
    soft: "rgba(240,199,90,0.22)",
  },
  violet: {
    ring: "border-fuchsia-300/38",
    wash: "from-fuchsia-300/56 via-fuchsia-300/16 to-transparent",
    text: "text-fuchsia-100",
    panel: "from-[#28142f]/95 via-[#18101f]/96 to-[#110b16]/98",
    solid: "#d8a5ff",
    soft: "rgba(216,165,255,0.2)",
  },
  sky: {
    ring: "border-sky-300/38",
    wash: "from-sky-300/52 via-sky-300/16 to-transparent",
    text: "text-sky-100",
    panel: "from-[#0f263b]/95 via-[#0b1824]/96 to-[#081118]/98",
    solid: "#87dcff",
    soft: "rgba(135,220,255,0.22)",
  },
  emerald: {
    ring: "border-emerald-300/38",
    wash: "from-emerald-300/52 via-emerald-300/16 to-transparent",
    text: "text-emerald-100",
    panel: "from-[#14291e]/95 via-[#0d1611]/96 to-[#0a110d]/98",
    solid: "#7de3ac",
    soft: "rgba(125,227,172,0.22)",
  },
  rose: {
    ring: "border-rose-300/38",
    wash: "from-rose-300/52 via-rose-300/16 to-transparent",
    text: "text-rose-100",
    panel: "from-[#30161b]/95 via-[#1a1013]/96 to-[#120c10]/98",
    solid: "#ff9a84",
    soft: "rgba(255,154,132,0.22)",
  },
};

export function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}k`;
  return `${value}`;
}

export function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function msUntilMidnight(now: number) {
  const date = new Date(now);
  const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return midnight.getTime() - now;
}
