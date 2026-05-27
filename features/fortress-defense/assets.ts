export const FORTRESS_DEFENSE_UNIT_ASSETS = {
  garrisonGuard: {
    id: "garrison_guard",
    src: "/assets/fortress/units/garrison_guard.webp",
  },
  garrisonArcher: {
    id: "garrison_archer",
    src: "/assets/fortress/units/garrison_archer.webp",
  },
  spikeTrap: {
    id: "spike_trap",
    src: "/assets/fortress/traps/spike_trap.webp",
  },
} as const;

export const FORTRESS_DEFENSE_SCENE_ASSETS = {
  lastBastionBackdrop: {
    id: "last_bastion_defense",
    src: "/assets/fortress/backgrounds/last_bastion_defense.webp",
    fallbackSrc: "/assets/backgrounds/fortress_bg.png",
  },
} as const;
