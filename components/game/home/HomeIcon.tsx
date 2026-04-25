"use client";

import GameGlyph, { type GlyphKind } from "@/components/ui/GameGlyph";
import GameAssetIcon from "@/components/ui/GameAssetIcon";
import { resolveGlyphAssetIcon } from "@/lib/iconAssets";
import { cn } from "@/lib/cn";

export type HomeIconKind = Extract<
  GlyphKind,
  | "gem"
  | "gold"
  | "dust"
  | "offers"
  | "rewards"
  | "events"
  | "shop"
  | "team"
  | "missions"
  | "heroes"
  | "deck"
  | "quests"
  | "pass"
  | "battle"
  | "fortress"
  | "arena"
  | "market"
  | "adventure"
>;

type IconProps = {
  kind: HomeIconKind;
  className?: string;
};

type PaletteIds = {
  gold: string;
  amber: string;
  jade: string;
  sky: string;
  violet: string;
  ember: string;
  ivory: string;
  steel: string;
  obsidian: string;
  glow: string;
  shadow: string;
};

type IconFamily = "resource" | "action" | "roster" | "world";

function makePaletteIds(prefix: string): PaletteIds {
  return {
    gold: `${prefix}-gold`,
    amber: `${prefix}-amber`,
    jade: `${prefix}-jade`,
    sky: `${prefix}-sky`,
    violet: `${prefix}-violet`,
    ember: `${prefix}-ember`,
    ivory: `${prefix}-ivory`,
    steel: `${prefix}-steel`,
    obsidian: `${prefix}-obsidian`,
    glow: `${prefix}-glow`,
    shadow: `${prefix}-shadow`,
  };
}

const PALETTE_IDS: Record<HomeIconKind, PaletteIds> = {
  gem: makePaletteIds("home-icon-gem"),
  gold: makePaletteIds("home-icon-gold"),
  dust: makePaletteIds("home-icon-dust"),
  offers: makePaletteIds("home-icon-offers"),
  rewards: makePaletteIds("home-icon-rewards"),
  events: makePaletteIds("home-icon-events"),
  shop: makePaletteIds("home-icon-shop"),
  team: makePaletteIds("home-icon-team"),
  missions: makePaletteIds("home-icon-missions"),
  heroes: makePaletteIds("home-icon-heroes"),
  deck: makePaletteIds("home-icon-deck"),
  quests: makePaletteIds("home-icon-quests"),
  pass: makePaletteIds("home-icon-pass"),
  battle: makePaletteIds("home-icon-battle"),
  fortress: makePaletteIds("home-icon-fortress"),
  arena: makePaletteIds("home-icon-arena"),
  market: makePaletteIds("home-icon-market"),
  adventure: makePaletteIds("home-icon-adventure"),
};

const FAMILY_BY_KIND: Record<HomeIconKind, IconFamily> = {
  gem: "resource",
  gold: "resource",
  dust: "resource",
  offers: "action",
  rewards: "action",
  events: "action",
  shop: "action",
  team: "roster",
  missions: "roster",
  heroes: "roster",
  deck: "roster",
  quests: "roster",
  pass: "roster",
  battle: "world",
  fortress: "world",
  arena: "world",
  market: "world",
  adventure: "world",
};

const AURA_CLASS: Record<HomeIconKind, string> = {
  gem: "bg-[radial-gradient(circle_at_50%_45%,rgba(138,241,255,0.54),transparent_72%)]",
  gold: "bg-[radial-gradient(circle_at_50%_45%,rgba(255,214,118,0.56),transparent_72%)]",
  dust: "bg-[radial-gradient(circle_at_50%_45%,rgba(224,176,255,0.54),transparent_72%)]",
  offers: "bg-[radial-gradient(circle_at_50%_45%,rgba(255,154,124,0.54),transparent_72%)]",
  rewards: "bg-[radial-gradient(circle_at_50%_45%,rgba(255,224,142,0.56),transparent_72%)]",
  events: "bg-[radial-gradient(circle_at_50%_45%,rgba(213,170,255,0.54),transparent_72%)]",
  shop: "bg-[radial-gradient(circle_at_50%_45%,rgba(137,240,184,0.52),transparent_72%)]",
  team: "bg-[radial-gradient(circle_at_50%_45%,rgba(138,227,255,0.5),transparent_72%)]",
  missions: "bg-[radial-gradient(circle_at_50%_45%,rgba(255,219,145,0.5),transparent_72%)]",
  heroes: "bg-[radial-gradient(circle_at_50%_45%,rgba(220,184,255,0.5),transparent_72%)]",
  deck: "bg-[radial-gradient(circle_at_50%_45%,rgba(255,219,145,0.5),transparent_72%)]",
  quests: "bg-[radial-gradient(circle_at_50%_45%,rgba(255,225,166,0.5),transparent_72%)]",
  pass: "bg-[radial-gradient(circle_at_50%_45%,rgba(219,186,255,0.5),transparent_72%)]",
  battle: "bg-[radial-gradient(circle_at_50%_45%,rgba(255,171,126,0.56),transparent_72%)]",
  fortress: "bg-[radial-gradient(circle_at_50%_45%,rgba(255,221,137,0.56),transparent_72%)]",
  arena: "bg-[radial-gradient(circle_at_50%_45%,rgba(146,222,255,0.5),transparent_72%)]",
  market: "bg-[radial-gradient(circle_at_50%_45%,rgba(144,241,188,0.5),transparent_72%)]",
  adventure: "bg-[radial-gradient(circle_at_50%_45%,rgba(255,165,124,0.56),transparent_72%)]",
};

const GLYPH_INSET: Record<HomeIconKind, string> = {
  gem: "16.8%",
  gold: "16.8%",
  dust: "16.8%",
  offers: "17.2%",
  rewards: "16.9%",
  events: "17%",
  shop: "17%",
  team: "17%",
  missions: "17%",
  heroes: "16.8%",
  deck: "16.8%",
  quests: "16.8%",
  pass: "16.8%",
  battle: "16.5%",
  fortress: "15.2%",
  arena: "15.2%",
  market: "15.2%",
  adventure: "15.2%",
};

function refUrl(id: string) {
  return `url(#${id})`;
}

function iconDefs(ids: PaletteIds) {
  return (
    <defs>
      <linearGradient id={ids.gold} x1="14" y1="10" x2="62" y2="68" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFF8D8" />
        <stop offset="0.34" stopColor="#F6D26A" />
        <stop offset="1" stopColor="#9C601B" />
      </linearGradient>
      <linearGradient id={ids.amber} x1="16" y1="10" x2="60" y2="68" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFF0E0" />
        <stop offset="0.38" stopColor="#FF9B74" />
        <stop offset="1" stopColor="#A73320" />
      </linearGradient>
      <linearGradient id={ids.jade} x1="14" y1="12" x2="60" y2="66" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F1FFF4" />
        <stop offset="0.4" stopColor="#7DE3AC" />
        <stop offset="1" stopColor="#1A734E" />
      </linearGradient>
      <linearGradient id={ids.sky} x1="14" y1="12" x2="60" y2="66" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F0FCFF" />
        <stop offset="0.4" stopColor="#8ADFFF" />
        <stop offset="1" stopColor="#1E66BE" />
      </linearGradient>
      <linearGradient id={ids.violet} x1="14" y1="10" x2="60" y2="66" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFF3FF" />
        <stop offset="0.42" stopColor="#D8A4FF" />
        <stop offset="1" stopColor="#6D2FB9" />
      </linearGradient>
      <linearGradient id={ids.ember} x1="14" y1="10" x2="62" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFF1E5" />
        <stop offset="0.34" stopColor="#FFBA86" />
        <stop offset="1" stopColor="#B53D1F" />
      </linearGradient>
      <linearGradient id={ids.ivory} x1="18" y1="10" x2="56" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFDF2" />
        <stop offset="1" stopColor="#DDD1B4" />
      </linearGradient>
      <linearGradient id={ids.steel} x1="18" y1="12" x2="58" y2="62" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EEF3FB" />
        <stop offset="0.46" stopColor="#A0B1C7" />
        <stop offset="1" stopColor="#32475F" />
      </linearGradient>
      <linearGradient id={ids.obsidian} x1="16" y1="8" x2="60" y2="68" gradientUnits="userSpaceOnUse">
        <stop stopColor="#243447" />
        <stop offset="0.5" stopColor="#141C29" />
        <stop offset="1" stopColor="#0A1018" />
      </linearGradient>
      <radialGradient id={ids.glow} cx="50%" cy="34%" r="64%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.62)" />
        <stop offset="48%" stopColor="rgba(255,255,255,0.14)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
      <filter id={ids.shadow} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="5" stdDeviation="3.8" floodColor="#08101a" floodOpacity="0.42" />
      </filter>
    </defs>
  );
}

function renderPlate(kind: HomeIconKind, ids: PaletteIds) {
  switch (kind) {
    case "gem":
      return (
        <>
          <path d="M40 10 60 24 54 52 40 70 26 52 20 24Z" fill={refUrl(ids.obsidian)} opacity="0.96" />
          <path d="M40 16 54 26 50 48 40 61 30 48 26 26Z" fill={refUrl(ids.sky)} opacity="0.24" />
        </>
      );
    case "gold":
      return (
        <>
          <ellipse cx="40" cy="41" rx="22" ry="13.5" fill={refUrl(ids.obsidian)} opacity="0.96" />
          <ellipse cx="40" cy="34" rx="19" ry="11.2" fill={refUrl(ids.gold)} opacity="0.22" />
          <ellipse cx="40" cy="41" rx="16" ry="8.4" stroke="#F7DFA0" strokeWidth="2" opacity="0.42" />
        </>
      );
    case "dust":
      return (
        <>
          <path d="M31 12H49L46 22 52 30V49C52 57 46.2 63 40 63S28 57 28 49V30l6-8-3-10Z" fill={refUrl(ids.obsidian)} opacity="0.96" />
          <path d="M33 28h14l2 19c0 6-3.8 10-9 10s-9-4-9-10l2-19Z" fill={refUrl(ids.violet)} opacity="0.2" />
        </>
      );
    case "offers":
      return (
        <>
          <path d="M24 22H48L58 32 40 56 20 36l4-14Z" fill={refUrl(ids.obsidian)} opacity="0.96" />
          <path d="M29 26h14l7 7-11 16-13-13 3-10Z" fill={refUrl(ids.amber)} opacity="0.24" />
        </>
      );
    case "rewards":
      return (
        <>
          <path d="M22 22h36v22c0 9-7.4 16-18 20-10.6-4-18-11-18-20V22Z" fill={refUrl(ids.obsidian)} opacity="0.97" />
          <path d="M27 28h26v17c0 5.6-5.2 10.2-13 13.3-7.8-3.1-13-7.7-13-13.3V28Z" fill={refUrl(ids.gold)} opacity="0.18" />
        </>
      );
    case "events":
      return (
        <>
          <path d="M40 10 59 24 54 48 40 60 26 48 21 24Z" fill={refUrl(ids.obsidian)} opacity="0.96" />
          <circle cx="40" cy="35" r="15" fill={refUrl(ids.violet)} opacity="0.18" />
        </>
      );
    case "shop":
    case "market":
      return (
        <>
          <path d="M22 30h36l-4 22H26l-4-22Z" fill={refUrl(ids.obsidian)} opacity="0.96" />
          <path d="M27 21h26l-4 9H31l-4-9Z" fill={refUrl(ids.amber)} opacity="0.28" />
          <path d="M28 30c0-5.4 4.4-9.8 9.8-9.8h4.4c5.4 0 9.8 4.4 9.8 9.8" stroke="#F4FFF8" strokeWidth="3" strokeLinecap="round" opacity="0.56" />
        </>
      );
    case "team":
      return (
        <>
          <path d="M40 14 57 24v16c0 10-7 16.8-17 21-10-4.2-17-11-17-21V24l17-10Z" fill={refUrl(ids.obsidian)} opacity="0.96" />
          <path d="M40 19 52 26v12c0 7-5.4 12.6-12 15.8C33.4 50.6 28 45 28 38V26l12-7Z" fill={refUrl(ids.sky)} opacity="0.18" />
        </>
      );
    case "missions":
      return (
        <>
          <path d="M26 14h22l6 8v34l-14-7-14 7V22l6-8Z" fill={refUrl(ids.obsidian)} opacity="0.96" />
          <path d="M31 20h18v24l-9-4.6-9 4.6V20Z" fill={refUrl(ids.gold)} opacity="0.16" />
        </>
      );
    case "heroes":
      return (
        <>
          <path d="M40 12 56 20v17c0 11-7 18-16 22-9-4-16-11-16-22V20l16-8Z" fill={refUrl(ids.obsidian)} opacity="0.96" />
          <path d="M40 17 51 23v13c0 8-4.6 13.8-11 17-6.4-3.2-11-9-11-17V23l11-6Z" fill={refUrl(ids.violet)} opacity="0.18" />
        </>
      );
    case "deck":
      return (
        <>
          <rect x="24" y="24" width="18" height="26" rx="5.5" fill={refUrl(ids.obsidian)} opacity="0.88" />
          <rect x="38" y="18" width="20" height="28" rx="5.8" fill={refUrl(ids.obsidian)} opacity="0.97" />
          <rect x="40.5" y="22" width="15" height="20" rx="4.2" fill={refUrl(ids.gold)} opacity="0.14" />
        </>
      );
    case "quests":
      return (
        <>
          <circle cx="40" cy="38" r="20" fill={refUrl(ids.obsidian)} opacity="0.96" />
          <circle cx="40" cy="38" r="14" fill={refUrl(ids.gold)} opacity="0.18" />
        </>
      );
    case "pass":
      return (
        <>
          <path d="M24 21h32v20c0 9-6.2 16-16 21-9.8-5-16-12-16-21V21Z" fill={refUrl(ids.obsidian)} opacity="0.96" />
          <path d="M28 27h24v13c0 5.6-4.6 10.2-12 13.8-7.4-3.6-12-8.2-12-13.8V27Z" fill={refUrl(ids.violet)} opacity="0.16" />
        </>
      );
    case "battle":
      return (
        <>
          <path d="M40 10 58 22 62 40 58 58 40 70 22 58 18 40 22 22Z" fill={refUrl(ids.obsidian)} opacity="0.97" />
          <path d="M40 16 53 25 56 40 53 55 40 64 27 55 24 40 27 25Z" fill={refUrl(ids.amber)} opacity="0.18" />
        </>
      );
    case "fortress":
      return (
        <>
          <path d="M22 26h36v24H22Z" fill={refUrl(ids.obsidian)} opacity="0.97" />
          <path d="M24 20h8v10h-8ZM36 16h8v14h-8ZM48 20h8v10h-8Z" fill={refUrl(ids.steel)} opacity="0.66" />
          <path d="M38 35h4v15h-4Z" fill={refUrl(ids.gold)} opacity="0.24" />
        </>
      );
    case "arena":
      return (
        <>
          <path d="M20 45c0-16 8.6-25 20-25s20 9 20 25" stroke={refUrl(ids.obsidian)} strokeWidth="10" strokeLinecap="round" />
          <ellipse cx="40" cy="46" rx="16.5" ry="8.3" fill={refUrl(ids.sky)} opacity="0.18" />
          <path d="M22 21v8M58 21v8" stroke="#F1FCFF" strokeWidth="2.4" strokeLinecap="round" opacity="0.54" />
        </>
      );
    case "adventure":
      return (
        <>
          <path d="M40 10 58 28 54 54 40 68 26 54 22 28Z" fill={refUrl(ids.obsidian)} opacity="0.97" />
          <path d="M40 16 52 28 49 49 40 58 31 49 28 28Z" fill={refUrl(ids.amber)} opacity="0.2" />
        </>
      );
  }
}

function renderFrame(family: IconFamily, ids: PaletteIds) {
  switch (family) {
    case "resource":
      return (
        <>
          <path
            d="M40 6 60 16 66 38 58 60 40 72 22 60 14 38 20 16Z"
            fill={refUrl(ids.obsidian)}
            opacity="0.72"
            stroke="#F2E5C3"
            strokeWidth="1.8"
          />
          <path
            d="M40 12 56 20 60 38 54 56 40 66 26 56 20 38 24 20Z"
            fill={refUrl(ids.ivory)}
            opacity="0.08"
          />
        </>
      );
    case "action":
      return (
        <>
          <path
            d="M16 22 28 10H54L64 22 60 52 48 64H24L14 52Z"
            fill={refUrl(ids.obsidian)}
            opacity="0.76"
            stroke="#F4E2BF"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M24 18H50L56 24 52 48 44 56H28L20 48 18 24Z" fill={refUrl(ids.ivory)} opacity="0.08" />
        </>
      );
    case "roster":
      return (
        <>
          <path
            d="M40 8 60 18 62 44 40 72 18 44 20 18Z"
            fill={refUrl(ids.obsidian)}
            opacity="0.76"
            stroke="#F0E6CA"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M40 14 54 22 56 42 40 62 24 42 26 22Z" fill={refUrl(ids.ivory)} opacity="0.08" />
        </>
      );
    case "world":
      return (
        <>
          <path
            d="M40 6 58 12 68 28 64 50 52 66 28 66 16 50 12 28 22 12Z"
            fill={refUrl(ids.obsidian)}
            opacity="0.8"
            stroke="#F2E1BD"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          <path
            d="M26 18 40 12 54 18 60 30 56 48 46 58H34L24 48 20 30Z"
            fill={refUrl(ids.ivory)}
            opacity="0.08"
          />
          <path d="M18 44 10 48 16 54M62 44 70 48 64 54" stroke="#F1D18A" strokeWidth="2.4" strokeLinecap="round" opacity="0.46" />
        </>
      );
  }
}

export default function HomeIcon({ kind, className }: IconProps) {
  const ids = PALETTE_IDS[kind];
  const family = FAMILY_BY_KIND[kind];
  const assetIcon = resolveGlyphAssetIcon(kind);
  const shellShadow =
    family === "resource"
      ? "drop-shadow-[0_10px_20px_rgba(7,12,20,0.32)]"
      : family === "world"
        ? "drop-shadow-[0_12px_22px_rgba(7,12,20,0.36)]"
        : "drop-shadow-[0_9px_18px_rgba(7,12,20,0.32)]";

  if (assetIcon) {
    return (
      <span className={cn("relative block h-full w-full overflow-visible", className)}>
        <span
          className={cn("absolute -inset-[28%] rounded-full opacity-80 blur-xl", AURA_CLASS[kind])}
          style={{ animation: "homeIconAura 4.8s ease-in-out infinite" }}
        />
        <span
          className="absolute inset-x-[8%] top-[2%] h-[24%] rounded-full bg-white/18 opacity-70 blur-sm"
          style={{ animation: "homeIconSweep 3.8s ease-in-out infinite" }}
        />
        <span className="absolute inset-x-[12%] bottom-[-10%] h-[18%] rounded-full bg-black/32 blur-md" />
        <GameAssetIcon
          category={assetIcon.category}
          name={assetIcon.name}
          size="xl"
          className="absolute -inset-[9%] h-auto w-auto transition duration-300 group-hover:scale-[1.08] group-focus-visible:scale-[1.08]"
          imgClassName="h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.42)]"
          fallback={<GameGlyph kind={kind} shell="none" className="h-full w-full" />}
        />
      </span>
    );
  }

  return (
    <span className={cn("relative block h-full w-full", className)}>
      <span
        className={cn("absolute inset-[4%] rounded-full opacity-92 blur-lg", AURA_CLASS[kind])}
        style={{ animation: "homeIconAura 4.8s ease-in-out infinite" }}
      />
      <span
        className="absolute inset-x-[14%] top-[6%] h-[20%] rounded-full bg-white/16 blur-sm"
        style={{ animation: "homeIconSweep 3.8s ease-in-out infinite" }}
      />
      <svg viewBox="0 0 80 80" className={cn("relative z-[1] h-full w-full", shellShadow)} fill="none" aria-hidden>
        {iconDefs(ids)}
        <ellipse cx="40" cy="67" rx="18" ry="5.6" fill="rgba(6,10,16,0.28)" />
        <g filter={refUrl(ids.shadow)}>
          {renderFrame(family, ids)}
          {renderPlate(kind, ids)}
          <ellipse cx="40" cy="22" rx="18" ry="10" fill={refUrl(ids.glow)} opacity="0.4" />
        </g>
      </svg>
      <span
        className="absolute z-[2]"
        style={{
          inset: GLYPH_INSET[kind],
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.28))",
        }}
      >
        <GameGlyph kind={kind} shell="none" className="h-full w-full" />
      </span>
    </span>
  );
}
