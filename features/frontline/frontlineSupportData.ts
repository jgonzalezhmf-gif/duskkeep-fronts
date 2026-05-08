import type { FrontlineSupportDef } from "./types";

export const FRONTLINE_SUPPORTS: FrontlineSupportDef[] = [
  {
    id: "wolf",
    name: "Pack Wolf",
    maxHp: 8,
    atk: 3,
    duration: 2,
    intercepts: true,
    effect: { type: "strike", damage: 2 },
  },
  {
    id: "barrier",
    name: "Arcane Barrier",
    maxHp: 10,
    atk: 0,
    duration: 2,
    intercepts: true,
    effect: { type: "shield", amount: 2 },
  },
  {
    id: "totem",
    name: "War Totem",
    maxHp: 6,
    atk: 2,
    duration: 2,
    intercepts: false,
    effect: { type: "mark", damage: 2 },
  },
  {
    id: "bone_imp",
    name: "Bone Imp",
    maxHp: 6,
    atk: 3,
    duration: 2,
    intercepts: true,
    effect: { type: "strike", damage: 1 },
  },
  {
    id: "rot_ward",
    name: "Rot Ward",
    maxHp: 9,
    atk: 1,
    duration: 2,
    intercepts: true,
    effect: { type: "mark", damage: 2 },
  },
  {
    id: "void_eye",
    name: "Void Eye",
    maxHp: 7,
    atk: 2,
    duration: 2,
    intercepts: false,
    effect: { type: "mark", damage: 3 },
  },
];

export const FRONTLINE_SUPPORT_BY_ID = Object.fromEntries(
  FRONTLINE_SUPPORTS.map((entry) => [entry.id, entry]),
);
