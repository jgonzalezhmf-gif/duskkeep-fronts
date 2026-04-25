import { getHero } from "@/data/heroes";
import { LEVEL_STAT_MULT, MAX_SKILL_LEVEL, SKILL_COOLDOWN_REDUCTION_AT_MAX, SKILL_MULTIPLIER_BONUS, STAR_STAT_MULT } from "@/lib/constants";
import { createRng, type Rng } from "@/lib/rng";
import type { Ability, DamageType, Hero } from "@/lib/types";
import type { BattleEvent, BattleInput, BattleResult, Side, Unit } from "./types";

const MAX_TURNS = 40;

// Stat scaling: baseStats in data/heroes.ts are kept large for fidelity, but
// the player-facing numbers are divided here so HP/ATK/DEF feel readable
// (e.g. 140 HP, 16 ATK instead of 1400 HP, 160 ATK).
export const STAT_SCALE = 0.1;

export function computeUnit(
  hero: Hero,
  level: number,
  stars: number,
  side: Side,
  idx: number,
  skillLevel: number = 1,
): Unit {
  const lm = LEVEL_STAT_MULT(level);
  const sm = STAR_STAT_MULT(stars);
  const m = lm * sm * STAT_SCALE;
  const maxHp = Math.max(10, Math.round(hero.baseStats.hp * m));
  return {
    uid: `${side}_${idx}_${hero.id}`,
    side,
    hero,
    level,
    stars,
    skillLevel,
    maxHp,
    hp: maxHp,
    atk: Math.max(1, Math.round(hero.baseStats.atk * m)),
    def: Math.max(1, Math.round(hero.baseStats.def * m)),
    spd: Math.round(hero.baseStats.spd),
    crit: hero.baseStats.crit,
    cooldown: hero.active.cooldown ?? 0,
    stun: 0,
    shield: 0,
    atkBuffPct: 0,
    atkBuffTurns: 0,
    defBuffPct: 0,
    defBuffTurns: 0,
    power: Math.max(
      1,
      Math.round(
        (hero.baseStats.hp * m * 0.2 +
          hero.baseStats.atk * m * 1.5 +
          hero.baseStats.def * m * 1.0 +
          hero.baseStats.spd * 0.5),
      ),
    ),
  };
}

export function computeTeamPower(team: { heroId: string; level: number; stars: number }[]): number {
  return team.reduce(
    (sum, t, i) => sum + computeUnit(getHero(t.heroId), t.level, t.stars, "ally", i).power,
    0,
  );
}

function effectiveAtk(u: Unit) {
  return Math.round(u.atk * (1 + u.atkBuffPct));
}
function effectiveDef(u: Unit) {
  return Math.round(u.def * (1 + u.defBuffPct));
}
function alive(u: Unit) {
  return u.hp > 0;
}

function applyDamage(
  from: Unit,
  to: Unit,
  raw: number,
  type: DamageType,
  crit: boolean,
  events: BattleEvent[],
): number {
  // defense reduces physical/magic, not true damage
  let dmg = raw;
  if (type !== "true") {
    const def = effectiveDef(to);
    dmg = Math.max(1, Math.round(raw * (100 / (100 + def))));
  }
  if (to.shield > 0) {
    const absorbed = Math.min(to.shield, dmg);
    to.shield -= absorbed;
    dmg -= absorbed;
  }
  to.hp = Math.max(0, to.hp - dmg);
  events.push({ type: "damage", from: from.uid, to: to.uid, damage: dmg, damageType: type, crit });

  // thorns passive
  const thorns = from.hero.passive.effect.type === "passive_thorns" ? 0 : 0; // placeholder — we handle reflector via TO unit
  void thorns;
  if (to.hero.passive.effect.type === "passive_thorns" && dmg > 0 && alive(to)) {
    const pct = to.hero.passive.effect.pct;
    if (pct > 0 && from.side !== to.side) {
      const reflect = Math.max(1, Math.round(dmg * pct));
      from.hp = Math.max(0, from.hp - reflect);
      events.push({
        type: "damage", from: to.uid, to: from.uid,
        damage: reflect, damageType: "true", crit: false,
      });
      events.push({ type: "passive_trigger", on: to.uid, kind: "thorns", amount: reflect });
    }
  }
  // lifesteal on from
  if (from.hero.passive.effect.type === "passive_lifesteal" && dmg > 0 && alive(from)) {
    const heal = Math.round(dmg * from.hero.passive.effect.pct);
    const before = from.hp;
    from.hp = Math.min(from.maxHp, from.hp + heal);
    const gained = from.hp - before;
    if (gained > 0) {
      events.push({ type: "heal", from: from.uid, to: from.uid, amount: gained });
      events.push({ type: "passive_trigger", on: from.uid, kind: "lifesteal", amount: gained });
    }
  }

  if (!alive(to)) events.push({ type: "death", uid: to.uid });
  return dmg;
}

function heal(from: Unit, to: Unit, amount: number, events: BattleEvent[]) {
  if (!alive(to)) return;
  const before = to.hp;
  to.hp = Math.min(to.maxHp, to.hp + amount);
  const gained = to.hp - before;
  if (gained > 0) events.push({ type: "heal", from: from.uid, to: to.uid, amount: gained });
}

function pickTargets(actor: Unit, ability: Ability, allies: Unit[], enemies: Unit[], rng: Rng): Unit[] {
  const target = ability.target ?? (ability.effect.type === "heal" ? "ally_lowest_hp" : "enemy_single");
  const allyPool = allies.filter(alive);
  const enemyPool = enemies.filter(alive);
  switch (target) {
    case "self":
      return [actor];
    case "ally_single":
    case "ally_lowest_hp":
      if (allyPool.length === 0) return [];
      // if ability says ally_single but effect is aoe heal, hit all
      if (ability.effect.type === "heal" && ability.effect.aoe) return allyPool;
      return [allyPool.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]];
    case "enemy_all":
      return enemyPool;
    case "enemy_lowest_hp":
      if (enemyPool.length === 0) return [];
      return [enemyPool.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]];
    case "enemy_single":
    default:
      if (enemyPool.length === 0) return [];
      // prefer lowest-HP backliners (archer/mage/support)
      const priority = enemyPool.slice().sort((a, b) => {
        const w = (u: Unit) => (["archer", "mage", "support", "summoner"].includes(u.hero.role) ? 0 : 1);
        return w(a) - w(b) || a.hp - b.hp;
      });
      // small rng tweak to avoid determinism predictability between identical picks
      if (priority.length > 1 && rng.chance(0.1)) return [priority[1]];
      return [priority[0]];
  }
}

function doBasicAttack(actor: Unit, enemies: Unit[], rng: Rng, events: BattleEvent[]) {
  const target = pickTargets(actor, { ...actor.hero.active, target: "enemy_single" }, [], enemies, rng)[0];
  if (!target) return;
  const crit = rng.chance(actor.crit);
  const critMult = crit ? 1.5 + (actor.hero.passive.id === "vex_p" ? 0.3 : 0) : 1;
  const raw = Math.round(effectiveAtk(actor) * 1.0 * critMult);
  events.push({ type: "basic_attack", from: actor.uid, to: target.uid, damage: 0, crit });
  applyDamage(actor, target, raw, "physical", crit, events);
}

function doAbility(actor: Unit, allies: Unit[], enemies: Unit[], rng: Rng, events: BattleEvent[]) {
  const ab = actor.hero.active;
  const targets = pickTargets(actor, ab, allies, enemies, rng);
  events.push({ type: "ability", from: actor.uid, ability: ab, targets: targets.map((t) => t.uid) });
  const eff = ab.effect;
  // Skill enhancement: bonus multiplier from Arcane Dust upgrades
  const skillBonus = (actor.skillLevel - 1) * SKILL_MULTIPLIER_BONUS;
  switch (eff.type) {
    case "damage": {
      for (const t of targets) {
        const crit = rng.chance(actor.crit);
        const critMult = crit ? 1.5 : 1;
        const raw = Math.round(effectiveAtk(actor) * (eff.multiplier + skillBonus) * critMult);
        // Kara "twin strike" special case: multiplier 2.2 split into two hits
        if (ab.id === "kara_a") {
          const halfMult = ((eff.multiplier + skillBonus) / 2);
          applyDamage(actor, t, Math.round(effectiveAtk(actor) * halfMult * critMult), eff.damageType, crit, events);
          if (alive(t)) {
            const crit2 = rng.chance(actor.crit);
            const critMult2 = crit2 ? 1.5 : 1;
            applyDamage(actor, t, Math.round(effectiveAtk(actor) * halfMult * critMult2), eff.damageType, crit2, events);
          }
        } else {
          applyDamage(actor, t, raw, eff.damageType, crit, events);
        }
      }
      break;
    }
    case "heal": {
      const amount = Math.round(effectiveAtk(actor) * (eff.multiplier + skillBonus));
      for (const t of targets) heal(actor, t, amount, events);
      break;
    }
    case "buff_atk": {
      for (const t of targets) {
        t.atkBuffPct = Math.max(t.atkBuffPct, eff.pct);
        t.atkBuffTurns = Math.max(t.atkBuffTurns, eff.turns);
        events.push({ type: "buff", on: t.uid, kind: "atk", pct: eff.pct, turns: eff.turns });
      }
      break;
    }
    case "buff_def": {
      for (const t of targets) {
        t.defBuffPct = Math.max(t.defBuffPct, eff.pct);
        t.defBuffTurns = Math.max(t.defBuffTurns, eff.turns);
        events.push({ type: "buff", on: t.uid, kind: "def", pct: eff.pct, turns: eff.turns });
      }
      break;
    }
    case "shield": {
      for (const t of targets) {
        const amount = Math.round(t.maxHp * eff.pct);
        t.shield = Math.max(t.shield, amount);
        events.push({ type: "shield_applied", on: t.uid, amount });
      }
      break;
    }
    case "stun": {
      for (const t of targets) {
        t.stun = Math.max(t.stun, eff.turns);
        // small side-damage on stun abilities
        const raw = Math.round(effectiveAtk(actor) * 0.8);
        applyDamage(actor, t, raw, "physical", false, events);
        events.push({ type: "stun_applied", on: t.uid, turns: eff.turns });
      }
      break;
    }
    default:
      // passives should never come through here
      break;
  }
  // Skill enhancement at max level: reduce cooldown by 1
  let cd = ab.cooldown ?? 0;
  if (actor.skillLevel >= MAX_SKILL_LEVEL && cd > 1) cd -= SKILL_COOLDOWN_REDUCTION_AT_MAX;
  actor.cooldown = cd;
}

function applyAurasAtStart(allies: Unit[], enemies: Unit[], events: BattleEvent[]) {
  for (const team of [allies, enemies]) {
    for (const u of team) {
      const eff = u.hero.passive.effect;
      if (eff.type === "buff_atk" && eff.turns >= 99) {
        for (const a of team) {
          a.atkBuffPct = Math.max(a.atkBuffPct, eff.pct);
          a.atkBuffTurns = 99;
        }
        events.push({ type: "passive_trigger", on: u.uid, kind: "aura_atk" });
      }
      if (eff.type === "buff_def" && eff.turns >= 99) {
        for (const a of team) {
          a.defBuffPct = Math.max(a.defBuffPct, eff.pct);
          a.defBuffTurns = 99;
        }
        events.push({ type: "passive_trigger", on: u.uid, kind: "aura_def" });
      }
      // Ren: +10% crit starting
      if (u.hero.id === "ren") u.crit += 0.1;
    }
  }
}

function applyTurnStartPassives(u: Unit, events: BattleEvent[]) {
  const eff = u.hero.passive.effect;
  if (eff.type === "passive_regen") {
    const amount = Math.round(u.maxHp * eff.pct);
    const before = u.hp;
    u.hp = Math.min(u.maxHp, u.hp + amount);
    const gained = u.hp - before;
    if (gained > 0) {
      events.push({ type: "heal", from: u.uid, to: u.uid, amount: gained });
      events.push({ type: "passive_trigger", on: u.uid, kind: "regen", amount: gained });
    }
    // Mira team-wide regen handled separately (caller)
  }
}

function applyMiraRegen(allies: Unit[], events: BattleEvent[]) {
  const mira = allies.find((u) => u.hero.id === "mira" && alive(u));
  if (!mira) return;
  const pct = 0.04;
  for (const a of allies.filter(alive)) {
    if (a.uid === mira.uid) continue;
    const amount = Math.round(a.maxHp * pct);
    const before = a.hp;
    a.hp = Math.min(a.maxHp, a.hp + amount);
    const gained = a.hp - before;
    if (gained > 0) events.push({ type: "heal", from: mira.uid, to: a.uid, amount: gained });
  }
}

function tickBuffs(u: Unit) {
  if (u.atkBuffTurns > 0 && u.atkBuffTurns < 99) {
    u.atkBuffTurns -= 1;
    if (u.atkBuffTurns === 0) u.atkBuffPct = 0;
  }
  if (u.defBuffTurns > 0 && u.defBuffTurns < 99) {
    u.defBuffTurns -= 1;
    if (u.defBuffTurns === 0) u.defBuffPct = 0;
  }
  if (u.stun > 0) u.stun -= 1;
  if (u.cooldown > 0) u.cooldown -= 1;
}

export function simulateBattle(input: BattleInput): BattleResult {
  const rng = createRng(input.seed);
  const allies: Unit[] = input.allies.map((a, i) => computeUnit(getHero(a.heroId), a.level, a.stars, "ally", i, a.skillLevel ?? 1));
  const enemies: Unit[] = input.enemies.map((e, i) => computeUnit(getHero(e.heroId), e.level, e.stars, "enemy", i, e.skillLevel ?? 1));

  const events: BattleEvent[] = [];
  events.push({ type: "battle_start", allies, enemies });
  applyAurasAtStart(allies, enemies, events);

  let turnCount = 0;
  let winner: Side | "draw" = "draw";

  outer: while (turnCount < MAX_TURNS) {
    turnCount += 1;

    // Team-wide tick passives at start of round
    applyMiraRegen(allies, events);
    applyMiraRegen(enemies, events); // symmetrical if enemy has Mira

    // turn order = descending spd, stable
    const order = [...allies, ...enemies]
      .filter(alive)
      .sort((a, b) => b.spd - a.spd || a.uid.localeCompare(b.uid));

    for (const actor of order) {
      if (!alive(actor)) continue;
      events.push({ type: "turn", uid: actor.uid, actor: actor.hero.name });

      applyTurnStartPassives(actor, events);

      if (actor.stun > 0) {
        // skip action but still tick buffs
        tickBuffs(actor);
        continue;
      }

      const ownAllies = actor.side === "ally" ? allies : enemies;
      const ownEnemies = actor.side === "ally" ? enemies : allies;

      if (actor.cooldown <= 0) {
        doAbility(actor, ownAllies, ownEnemies, rng, events);
      } else {
        doBasicAttack(actor, ownEnemies, rng, events);
      }

      tickBuffs(actor);

      const aliveAllies = allies.some(alive);
      const aliveEnemies = enemies.some(alive);
      if (!aliveAllies || !aliveEnemies) {
        winner = aliveAllies && !aliveEnemies ? "ally" : !aliveAllies && aliveEnemies ? "enemy" : "draw";
        events.push({ type: "battle_end", winner, turns: turnCount });
        break outer;
      }
    }
  }

  if (winner === "draw" && turnCount >= MAX_TURNS) {
    // enemy wins on timeout — prevent infinite stalls
    const allySumHp = allies.reduce((s, u) => s + u.hp, 0);
    const enemySumHp = enemies.reduce((s, u) => s + u.hp, 0);
    winner = allySumHp > enemySumHp ? "ally" : enemySumHp > allySumHp ? "enemy" : "draw";
    events.push({ type: "battle_end", winner, turns: turnCount });
  }

  return { winner, turns: turnCount, events, endState: { allies, enemies } };
}
