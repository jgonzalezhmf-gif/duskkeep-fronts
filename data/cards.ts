import { HEROES, getHero } from "@/data/heroes";
import type { DeckCard, HeroCard, SpellCard, SummonEffect } from "@/lib/types";

const HERO_SUMMON_EFFECTS: Partial<Record<string, SummonEffect[]>> = {
  bran: [
    { type: "shield_core", amount: 12 },
    { type: "shield_self", amount: 8 },
  ],
  kara: [{ type: "damage_nearest_enemy", amount: 12, fallbackCore: true, sameRow: true }],
  vex: [{ type: "damage_nearest_enemy", amount: 14, fallbackCore: true }],
  lyria: [{ type: "damage_nearest_enemy", amount: 12, fallbackCore: true }],
  mira: [{ type: "heal_lowest_ally", amount: 14, includeCore: true }],
  drak: [{ type: "damage_nearest_enemy", amount: 18, fallbackCore: true }],
  morr: [{ type: "damage_nearest_enemy", amount: 16, fallbackCore: true }],
  ursa: [
    { type: "shield_core", amount: 10 },
    { type: "shield_self", amount: 10 },
  ],
  fenra: [{ type: "buff_allies", atkPct: 0.12, turns: 1 }],
  ren: [{ type: "stun_nearest_enemy", turns: 1 }],
  tovi: [{ type: "buff_allies", atkPct: 0.18, turns: 1 }],
  grom: [{ type: "damage_nearest_enemy", amount: 16, fallbackCore: true, sameRow: true }],
};

export const HERO_CARDS: HeroCard[] = HEROES.map((heroDef) => {
  const heroId = heroDef.id;
  const hero = getHero(heroId);
  return {
    id: `card_${heroId}`,
    heroId,
    kind: "hero",
    name: hero.name,
    cost:
      hero.rarity === "legendary"
        ? 5
        : hero.rarity === "epic"
          ? 4
          : hero.rarity === "rare"
            ? 3
            : 2,
    rarity: hero.rarity,
    emoji: hero.emoji,
    description: `${hero.role} card. Deploys ${hero.name.split(" ")[0]} onto the battlefield.`,
    summonEffects: HERO_SUMMON_EFFECTS[heroId],
  };
});

export const SPELL_CARDS: SpellCard[] = [
  {
    id: "spell_meteor",
    kind: "spell",
    name: "Meteor Rain",
    cost: 3,
    rarity: "epic",
    emoji: "M",
    description: "Blast a target tile and adjacent units for fast pressure.",
    effect: { type: "damage_aoe", damage: 26, radius: 1 },
  },
  {
    id: "spell_battle_hymn",
    kind: "spell",
    name: "Battle Hymn",
    cost: 1,
    rarity: "rare",
    emoji: "B",
    description: "Empower all allied units with a sharp tempo spike for 2 turns.",
    effect: { type: "buff_allies", atkPct: 0.3, turns: 2 },
  },
  {
    id: "spell_sanctuary",
    kind: "spell",
    name: "Sanctuary",
    cost: 2,
    rarity: "rare",
    emoji: "S",
    description: "Heal allied units around a target tile and stabilize tempo.",
    effect: { type: "heal_aoe", amount: 16, radius: 1 },
  },
  {
    id: "spell_guardian_aegis",
    kind: "spell",
    name: "Guardian Aegis",
    cost: 1,
    rarity: "common",
    emoji: "G",
    description: "Shield your leader core to force a tempo swing.",
    effect: { type: "shield_leader", amount: 20 },
  },
];

export const ALL_CARDS: DeckCard[] = [...HERO_CARDS, ...SPELL_CARDS];
export const CARD_BY_ID = Object.fromEntries(ALL_CARDS.map((card) => [card.id, card]));

export const STARTER_DECK = [
  "card_bran",
  "card_kara",
  "card_vex",
  "card_mira",
  "card_tovi",
  "spell_battle_hymn",
  "spell_sanctuary",
  "spell_guardian_aegis",
];

export function getCard(id: string): DeckCard {
  const card = CARD_BY_ID[id];
  if (!card) throw new Error(`Unknown card: ${id}`);
  return card;
}
