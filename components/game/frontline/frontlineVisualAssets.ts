import type { GlyphKind } from "@/components/ui/GameGlyph";
import type { FrontlineCardDef } from "@/features/frontline/types";
import { getHeroPortrait } from "@/lib/art";

const FRONTLINE_ASSET_ROOT = "/assets/frontline";

type FrontlineAssetManifest = Partial<Record<string, string>>;

// Optional production art must be registered here before the UI will request it.
// This prevents speculative requests to placeholder filenames that do not exist yet.
const FRONTLINE_HERO_STANDEE_ASSETS: FrontlineAssetManifest = {
  bran: `${FRONTLINE_ASSET_ROOT}/heroes/bran.png`,
  kara: `${FRONTLINE_ASSET_ROOT}/heroes/kara.png`,
  mira: `${FRONTLINE_ASSET_ROOT}/heroes/mira.png`,
  vex: `${FRONTLINE_ASSET_ROOT}/heroes/vex.png`,
  drak: `${FRONTLINE_ASSET_ROOT}/heroes/drak.png`,
  tovi: `${FRONTLINE_ASSET_ROOT}/heroes/tovi.png`,
  lyria: `${FRONTLINE_ASSET_ROOT}/heroes/lyria_spellweaver.png`,
  morr: `${FRONTLINE_ASSET_ROOT}/heroes/morth_the_cursed.png`,
  ursa: `${FRONTLINE_ASSET_ROOT}/heroes/ursa_stoneheart.png`,
  fenra: `${FRONTLINE_ASSET_ROOT}/heroes/fenra_wolfcaller.png`,
  sol: `${FRONTLINE_ASSET_ROOT}/heroes/sol_the_radiant.png`,
  noct: `${FRONTLINE_ASSET_ROOT}/heroes/noct_the_eclipse.png`,
  enemy_bone_archer: `${FRONTLINE_ASSET_ROOT}/heroes/Enemy1.png`,
  enemy_plague_troll: `${FRONTLINE_ASSET_ROOT}/heroes/Enemy2.png`,
  enemy_ember_ogre: `${FRONTLINE_ASSET_ROOT}/heroes/Enemy3.png`,
  enemy_blood_duelist: `${FRONTLINE_ASSET_ROOT}/heroes/Enemy4.png`,
  enemy_rotmaw: `${FRONTLINE_ASSET_ROOT}/heroes/Enemy5.png`,
  enemy_void_acolyte: `${FRONTLINE_ASSET_ROOT}/heroes/Enemy6.png`,
};

const FRONTLINE_CARD_ART_ASSETS: FrontlineAssetManifest = {
  order_guard_wall: `${FRONTLINE_ASSET_ROOT}/cards/order_guard_wall.png`,
  order_twin_slash: `${FRONTLINE_ASSET_ROOT}/cards/order_twin_slash.png`,
  order_shadow_dive: `${FRONTLINE_ASSET_ROOT}/cards/order_shadow_dive.png`,
  order_focus_fire: `${FRONTLINE_ASSET_ROOT}/cards/order_focus_fire.png`,
  guard_break: `${FRONTLINE_ASSET_ROOT}/cards/guard_break.png`,
  quick_step: `${FRONTLINE_ASSET_ROOT}/cards/quick_step.png`,
  holy_ward: `${FRONTLINE_ASSET_ROOT}/cards/holy_ward.png`,
  blood_pact: `${FRONTLINE_ASSET_ROOT}/cards/blood_pact.png`,
  dark_bolt: `${FRONTLINE_ASSET_ROOT}/cards/dark_bolt.png`,
  iron_skin: `${FRONTLINE_ASSET_ROOT}/cards/iron_skin.png`,
  piercing_shot: `${FRONTLINE_ASSET_ROOT}/cards/piercing_shot.png`,
  war_drums: `${FRONTLINE_ASSET_ROOT}/cards/war_drums.png`,
  soul_chain: `${FRONTLINE_ASSET_ROOT}/cards/soul_chain.png`,
  frost_trap: `${FRONTLINE_ASSET_ROOT}/cards/frost_trap.png`,
  rending_blow: `${FRONTLINE_ASSET_ROOT}/cards/rending_blow.png`,
  last_stand: `${FRONTLINE_ASSET_ROOT}/cards/last_stand.png`,
  tactic_battle_hymn: `${FRONTLINE_ASSET_ROOT}/cards/tactic_battle_hymn.png`,
  tactic_sanctuary: `${FRONTLINE_ASSET_ROOT}/cards/tactic_sanctuary.png`,
  tactic_smokescreen: `${FRONTLINE_ASSET_ROOT}/cards/tactic_smokescreen.png`,
  tactic_core_burst: `${FRONTLINE_ASSET_ROOT}/cards/tactic_core_burst.png`,
  tactic_rally_cry: `${FRONTLINE_ASSET_ROOT}/cards/tactic_rally_cry.png`,
  tactic_poisoned_dagger: `${FRONTLINE_ASSET_ROOT}/cards/tactic_poisoned_dagger.png`,
  summon_wolf: `${FRONTLINE_ASSET_ROOT}/cards/summon_wolf.png`,
  summon_barrier: `${FRONTLINE_ASSET_ROOT}/cards/summon_barrier.png`,
};

const FRONTLINE_EFFECT_ASSETS: FrontlineAssetManifest = {
  // breach: `${FRONTLINE_ASSET_ROOT}/effects/breach.png`,
};

const FRONTLINE_BOSS_ASSETS: FrontlineAssetManifest = {
  // The PNG was originally added under crown_of_ashes.png but is the art for The Eclipse (c1l12).
  the_eclipse: `${FRONTLINE_ASSET_ROOT}/bosses/crown_of_ashes.png`,
  // crown_of_ashes (c2l8) currently has no boss art and falls back to per-segment readouts.
};

const FRONTLINE_UNIT_PLACEHOLDER_ASSET = `${FRONTLINE_ASSET_ROOT}/unit_placeholder.png`;

export function getFrontlineBossAssetSrc(assetKey: string | null | undefined): string | null {
  if (!assetKey) return null;
  return FRONTLINE_BOSS_ASSETS[assetKey] ?? null;
}

export function getFrontlineUnitPlaceholderSrc() {
  return FRONTLINE_UNIT_PLACEHOLDER_ASSET;
}

const CARD_FALLBACK_HERO: Partial<Record<string, string>> = {
  order_twin_slash: "kara",
  order_guard_wall: "bran",
  order_focus_fire: "vex",
  tactic_sanctuary: "mira",
  enemy_order_bone_arrow: "enemy_bone_archer",
  enemy_order_crushing_swing: "enemy_ember_ogre",
  enemy_order_infernal_cleave: "enemy_ember_ogre",
  enemy_tactic_plague_spit: "enemy_rotmaw",
  enemy_tactic_blood_rite: "enemy_blood_duelist",
  enemy_tactic_war_howl: "enemy_void_acolyte",
  enemy_summon_bone_imp: "enemy_bone_archer",
  enemy_summon_void_eye: "enemy_void_acolyte",
};

export type FrontlineHeroVisualAsset = {
  artKey: string;
  standeeSrc: string | null;
  portraitFallbackSrc: string | null;
};

export type FrontlineCardVisualAsset = {
  artKey: string;
  cardArtSrc: string | null;
  fallbackPortraitSrc: string | null;
  iconKind: GlyphKind;
};

export function getFrontlineHeroVisualAsset(heroId: string): FrontlineHeroVisualAsset {
  return {
    artKey: heroId,
    standeeSrc: FRONTLINE_HERO_STANDEE_ASSETS[heroId] ?? null,
    portraitFallbackSrc: getHeroPortrait(heroId) ?? FRONTLINE_UNIT_PLACEHOLDER_ASSET,
  };
}

export function getFrontlineCardVisualAsset(card: FrontlineCardDef): FrontlineCardVisualAsset {
  const fallbackHeroId = CARD_FALLBACK_HERO[card.id] ?? "";
  const fallbackStandee = fallbackHeroId ? FRONTLINE_HERO_STANDEE_ASSETS[fallbackHeroId] : null;
  return {
    artKey: card.id,
    cardArtSrc: FRONTLINE_CARD_ART_ASSETS[card.id] ?? null,
    fallbackPortraitSrc: fallbackStandee ?? getHeroPortrait(fallbackHeroId),
    iconKind: cardGlyphKind(card),
  };
}

export function getFrontlineEffectAssetPath(effectKey: string) {
  return FRONTLINE_EFFECT_ASSETS[effectKey] ?? null;
}

function cardGlyphKind(card: FrontlineCardDef): GlyphKind {
  switch (card.effect.type) {
    case "heal_front":
      return "heal";
    case "hero_strike":
    case "front_shot":
    case "execute_front":
      return "attack";
    case "rally":
      return "power";
    case "stun_front":
      return "skill";
    case "summon":
      return "heroes";
  }
}
