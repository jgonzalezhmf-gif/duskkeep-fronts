import type { GlyphKind } from "@/components/ui/GameGlyph";

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

export type PaletteIds = {
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

export type IconFamily = "resource" | "action" | "roster" | "world";

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

export const PALETTE_IDS: Record<HomeIconKind, PaletteIds> = {
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

export const FAMILY_BY_KIND: Record<HomeIconKind, IconFamily> = {
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

export const AURA_CLASS: Record<HomeIconKind, string> = {
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

export const GLYPH_INSET: Record<HomeIconKind, string> = {
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
