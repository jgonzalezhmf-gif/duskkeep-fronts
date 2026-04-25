import type { FortressBuildingDef } from "@/lib/types";

export const FORTRESS_BUILDINGS: FortressBuildingDef[] = [
  {
    id: "treasury",
    name: "Royal Treasury",
    emoji: "💰",
    description: "Generates gold while you are away.",
    maxLevel: 10,
    baseCost: { gold: 250 },
    scaling: 1.55,
    bonusText: "+40 gold per hour per level",
  },
  {
    id: "arcane_spire",
    name: "Arcane Spire",
    emoji: "🔮",
    description: "Distills dust used for spells and upgrades.",
    maxLevel: 10,
    baseCost: { gold: 200, dust: 30 },
    scaling: 1.6,
    bonusText: "+8 dust per hour per level",
  },
  {
    id: "bastion_walls",
    name: "Bastion Walls",
    emoji: "🏰",
    description: "Improves the endurance of your leader core.",
    maxLevel: 10,
    baseCost: { gold: 300 },
    scaling: 1.65,
    bonusText: "+10 leader HP per level",
  },
  {
    id: "war_academy",
    name: "War Academy",
    emoji: "⚔",
    description: "Sharpens command tempo and opening draws.",
    maxLevel: 10,
    baseCost: { gold: 240, dust: 20 },
    scaling: 1.6,
    bonusText: "+1 starting hand size every 3 levels",
  },
  {
    id: "market_square",
    name: "Market Square",
    emoji: "🏪",
    description: "Improves trading routes and premium income.",
    maxLevel: 10,
    baseCost: { gold: 200, gems: 5 },
    scaling: 1.7,
    bonusText: "+1 gem per 3 hours per 2 levels",
  },
];

export const FORTRESS_BUILDING_BY_ID = Object.fromEntries(
  FORTRESS_BUILDINGS.map((building) => [building.id, building]),
);
