import type { FrontlineHeroState, FrontlineSupportState } from "./types";

export function dealHeroDamage(hero: FrontlineHeroState, amount: number) {
  let remaining = amount;
  if (hero.shield > 0) {
    const absorbed = Math.min(hero.shield, remaining);
    hero.shield -= absorbed;
    remaining -= absorbed;
  }
  if (remaining <= 0) return 0;
  hero.hp = Math.max(0, hero.hp - remaining);
  hero.alive = hero.hp > 0;
  return remaining;
}

export function dealSupportDamage(support: FrontlineSupportState, amount: number) {
  support.hp = Math.max(0, support.hp - amount);
  return amount;
}

export function addShield(hero: FrontlineHeroState, amount: number, temporary = false) {
  hero.shield += amount;
  if (temporary) hero.tempShield += amount;
}

export function healHero(hero: FrontlineHeroState, amount: number) {
  if (!hero.alive) return 0;
  const next = Math.min(hero.maxHp, hero.hp + amount);
  const healed = next - hero.hp;
  hero.hp = next;
  return healed;
}
