import type { FrontlineCardDef, FrontlineHeroDef, FrontlineHeroTrait, FrontlineLeaderDef, FrontlinePreset, FrontlineSupportDef } from "@/features/frontline/types";
import type { StatusAssetIconName } from "@/lib/iconAssets";

const TRAIT_ICONS: Record<Exclude<FrontlineHeroTrait["type"], "none">, StatusAssetIconName> = {
  bulwark: "guard",
  flurry: "rush",
  breach: "armor_break",
  mend: "regen",
  ambush: "rush",
  chant: "buff",
  lifesteal: "bleed",
  venom: "poison",
};

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function tx(t: TranslateFn, key: string, fallback: string, params?: Record<string, string | number>) {
  const value = t(key, params);
  return value === key ? fallback : value;
}

export function frontlineHeroName(t: TranslateFn, hero: FrontlineHeroDef | null | undefined) {
  if (!hero) return "";
  return tx(t, `frontlineData.heroes.${hero.heroId}.name`, hero.name);
}

export function frontlineHeroRole(t: TranslateFn, hero: FrontlineHeroDef | null | undefined) {
  if (!hero) return "";
  return tx(t, `frontlineData.heroes.${hero.heroId}.role`, hero.role);
}

export function frontlineLeaderName(t: TranslateFn, leader: FrontlineLeaderDef | null | undefined) {
  if (!leader) return "";
  return tx(t, `frontlineData.leaders.${leader.id}.name`, leader.name);
}

export function frontlineLeaderTitle(t: TranslateFn, leader: FrontlineLeaderDef | null | undefined) {
  if (!leader) return "";
  return tx(t, `frontlineData.leaders.${leader.id}.title`, leader.title);
}

export function frontlineLeaderPowerName(t: TranslateFn, leader: FrontlineLeaderDef | null | undefined) {
  if (!leader) return "";
  return tx(t, `frontlineData.leaders.${leader.id}.powerName`, leader.power.name);
}

export function frontlineLeaderPowerDescription(t: TranslateFn, leader: FrontlineLeaderDef | null | undefined) {
  if (!leader) return "";
  return tx(t, `frontlineData.leaders.${leader.id}.powerDescription`, leader.power.description);
}

export function frontlineCardName(t: TranslateFn, card: FrontlineCardDef | null | undefined) {
  if (!card) return "";
  return tx(t, `frontlineData.cards.${card.id}.name`, card.name);
}

export function frontlineCardDescription(t: TranslateFn, card: FrontlineCardDef | null | undefined) {
  if (!card) return "";
  return tx(t, `frontlineData.cards.${card.id}.description`, card.description);
}

export function frontlineSupportName(t: TranslateFn, support: FrontlineSupportDef | null | undefined) {
  if (!support) return "";
  return tx(t, `frontlineData.supports.${support.id}.name`, support.name);
}

export function frontlinePresetName(t: TranslateFn, preset: FrontlinePreset | null | undefined) {
  if (!preset) return "";
  return tx(t, `frontlineData.presets.${preset.id}.name`, preset.name);
}

export function frontlineCardKindLabel(t: TranslateFn, card: FrontlineCardDef) {
  return t(`frontlineData.cardKinds.${card.kind}`);
}

export function frontlineCardTargetLabel(t: TranslateFn, card: FrontlineCardDef) {
  if (card.target === "ally_front") return t("frontlineData.targets.allyFront");
  if (card.target === "enemy_front") return t("frontlineData.targets.enemyFront");
  if (card.target === "any_front") return t("frontlineData.targets.anyFront");
  return t("frontlineData.targets.none");
}

export function frontlineCardShortTargetLabel(t: TranslateFn, card: FrontlineCardDef) {
  if (card.target === "none") return t("frontlineData.targets.now");
  if (card.target === "ally_front") return t("frontlineData.targets.ally");
  if (card.target === "enemy_front") return t("frontlineData.targets.enemy");
  return t("frontlineData.targets.front");
}

export function frontlineCardEffectSummary(t: TranslateFn, card: FrontlineCardDef) {
  switch (card.effect.type) {
    case "hero_strike": {
      const parts = [t("frontlineData.effects.atk", { amount: card.effect.atk })];
      if (card.effect.shield) parts.push(t("frontlineData.effects.shield", { amount: card.effect.shield }));
      if (card.effect.strikeFirst) parts.push(t("frontlineData.effects.first"));
      return parts.join(" / ");
    }
    case "front_shot":
      return t("frontlineData.effects.frontShot", { damage: card.effect.damage });
    case "rally": {
      const parts = [t("frontlineData.effects.teamAtk", { amount: card.effect.atk })];
      if (card.effect.shield) parts.push(t("frontlineData.effects.shield", { amount: card.effect.shield }));
      return parts.join(" / ");
    }
    case "heal_front": {
      const parts = [t("frontlineData.effects.heal", { amount: card.effect.heal })];
      if (card.effect.coreHeal) parts.push(t("frontlineData.effects.core", { amount: card.effect.coreHeal }));
      return parts.join(" / ");
    }
    case "stun_front":
      return t("frontlineData.effects.stunFront", { turns: card.effect.turns });
    case "execute_front": {
      const parts = [t("frontlineData.effects.frontShot", { damage: card.effect.damage })];
      if (card.effect.bonusOpenCore) parts.push(t("frontlineData.effects.core", { amount: card.effect.bonusOpenCore }));
      return parts.join(" / ");
    }
    case "summon":
      return tx(t, `frontlineData.supports.${card.effect.supportId}.name`, t("frontlineData.effects.temporarySupport"));
  }
}

export type FrontlineTraitInfo = {
  type: Exclude<FrontlineHeroTrait["type"], "none">;
  label: string;
  description: string;
  icon: StatusAssetIconName;
};

export function frontlineTraitInfo(t: TranslateFn, trait: FrontlineHeroTrait): FrontlineTraitInfo | null {
  if (trait.type === "none") return null;
  return {
    type: trait.type,
    label: t(`frontlineData.traits.${trait.type}.label`),
    description: t(`frontlineData.traits.${trait.type}.description`),
    icon: TRAIT_ICONS[trait.type],
  };
}
