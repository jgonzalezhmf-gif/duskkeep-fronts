export type GlyphKind =
  | "gem"
  | "gold"
  | "dust"
  | "tickets"
  | "heart"
  | "offers"
  | "rewards"
  | "events"
  | "shop"
  | "team"
  | "missions"
  | "heroes"
  | "deck"
  | "battle"
  | "quests"
  | "pass"
  | "fortress"
  | "arena"
  | "adventure"
  | "market"
  | "sound-on"
  | "sound-off"
  | "move"
  | "attack"
  | "heal"
  | "shield"
  | "skill"
  | "power"
  | "cfg";

export type GlyphProps = {
  kind: GlyphKind;
  className?: string;
  shell?: "plate" | "none";
};

export type GlyphIds = {
  gold: string;
  goldDeep: string;
  gem: string;
  gemDeep: string;
  violet: string;
  emerald: string;
  ember: string;
  steel: string;
  ivory: string;
  shellOuter: string;
  shellInner: string;
  glowGold: string;
  glowGem: string;
  glowViolet: string;
  glowEmerald: string;
  glowEmber: string;
};
