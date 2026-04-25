import type { ArenaSnapshot } from "@/lib/types";

// Mocked snapshots. In a real backend, these come from arena_snapshots table.
export const ARENA_OPPONENTS: ArenaSnapshot[] = [
  {
    id: "op_ironfang",
    ownerName: "Ironfang",
    power: 90,
    team: [
      { heroId: "bran", level: 5, stars: 1 },
      { heroId: "kara", level: 5, stars: 1 },
      { heroId: "vex", level: 5, stars: 1 },
    ],
  },
  {
    id: "op_duskrose",
    ownerName: "Duskrose",
    power: 145,
    team: [
      { heroId: "ursa", level: 7, stars: 2 },
      { heroId: "lyria", level: 7, stars: 1 },
      { heroId: "ren", level: 7, stars: 2 },
    ],
  },
  {
    id: "op_stormking",
    ownerName: "Stormking",
    power: 220,
    team: [
      { heroId: "fenra", level: 9, stars: 2 },
      { heroId: "grom", level: 9, stars: 2 },
      { heroId: "vex", level: 9, stars: 2 },
    ],
  },
  {
    id: "op_voidqueen",
    ownerName: "Voidqueen",
    power: 310,
    team: [
      { heroId: "noct", level: 12, stars: 3 },
      { heroId: "drak", level: 12, stars: 2 },
      { heroId: "sol", level: 11, stars: 2 },
    ],
  },
];
