import { getCard } from "@/data/cards";
import { getLeader } from "@/data/leaders";
import { buildUnit, clone, getAttackTargets, grantShield, recomputeWinner } from "@/features/tactical/engine";
import { posKey, type Pos, type TacticalState, type TacticalUnit } from "@/features/tactical/types";
import type { FortressState, HeroCard, LeaderDef, LeaderPowerEffect, PlayerHero, SpellCard, SummonEffect } from "@/lib/types";
import { fortressBattleBonuses } from "@/lib/store";
export type { DeckSideState } from "./deckSideState";
export {
  createDeckSide,
  drawCards,
  playableCards,
  removeCardFromHand,
  shuffleIds,
  starterOpeningHandSize,
} from "./deckSideState";

function flashTick() {
  return Date.now() + Math.random();
}

export function leaderCorePosition(side: "ally" | "enemy"): Pos {
  return side === "ally" ? { x: 0, y: 2 } : { x: 5, y: 1 };
}

export function summonLaneColumns(side: "ally" | "enemy") {
  return side === "ally" ? [2, 1] : [3, 4];
}

function preferredSummonRows(height: number) {
  return Array.from({ length: height }, (_, index) => index).sort((a, b) => {
    const da = Math.abs(a - (height - 1) / 2);
    const db = Math.abs(b - (height - 1) / 2);
    return da - db || a - b;
  });
}

export function validSummonTiles(state: TacticalState, side: "ally" | "enemy") {
  const occupied = new Set(state.units.filter((unit) => unit.alive).map((unit) => posKey(unit.pos)));
  const blocked = new Set(state.obstacles.map((obstacle) => posKey(obstacle)));
  const columns = summonLaneColumns(side);
  const rows = preferredSummonRows(state.grid.h);
  const tiles: Pos[] = [];
  for (const x of columns) {
    for (const y of rows) {
      const key = posKey({ x, y });
      if (!occupied.has(key) && !blocked.has(key)) tiles.push({ x, y });
    }
  }
  return tiles;
}

function playerHeroState(playerHeroes: PlayerHero[], heroId: string) {
  return playerHeroes.find((hero) => hero.heroId === heroId);
}

export function createLeaderUnit(
  leaderId: string,
  side: "ally" | "enemy",
  fortress: FortressState,
): TacticalUnit {
  const leader = getLeader(leaderId);
  const bonuses = fortressBattleBonuses(fortress);
  const pos = leaderCorePosition(side);
  const tunedHp = Math.max(72, Math.round((leader.baseHp + bonuses.leaderHpBonus) * 0.88));
  const tunedAtk = Math.max(1, Math.round(leader.baseAtk * 1.05));
  const tunedDef = Math.max(8, Math.round(leader.baseDef * 0.8));
  return {
    uid: `${side}_leader_${leader.id}`,
    side,
    heroId: leader.id,
    level: fortress.level,
    stars: 1,
    skillLevel: 1,
    name: leader.name,
    emoji: leader.emoji,
    rarity: leader.rarity,
    role: "leader",
    pos,
    hp: tunedHp,
    maxHp: tunedHp,
    atk: tunedAtk,
    def: tunedDef,
    move: 0,
    range: 1,
    ability: {
      id: `${leader.id}_hold`,
      name: "Hold the Line",
      description: "Leader core remains anchored and defends the fortress.",
      kind: "shield_self",
      range: 0,
      cooldown: 3,
      power: 0.12,
    },
    cooldown: 2,
    buffs: { atkPct: 0, atkTurns: 0, defPct: 0, defTurns: 0, shield: 0, stun: 0 },
    hasMoved: false,
    hasActed: false,
    alive: true,
  };
}

export function createInitialDeckBattleState(
  allyLeaderId: string,
  enemyLeaderId: string,
  seed: number,
  allyFortress: FortressState,
  obstacles: Pos[] = [],
): TacticalState {
  return {
    grid: { w: 6, h: 4 },
    obstacles,
    units: [
      createLeaderUnit(allyLeaderId, "ally", allyFortress),
      createLeaderUnit(enemyLeaderId, "enemy", allyFortress),
    ],
    round: 1,
    side: "ally",
    selectedUid: null,
    mode: "idle",
    log: ["Cards ready. Deploy your champions."],
    winner: null,
    seed,
  };
}

export function getLeaderCore(state: TacticalState, side: "ally" | "enemy") {
  return state.units.find((unit) => unit.side === side && unit.role === "leader") ?? null;
}

export function finalizeDeckBattleState(state: TacticalState): TacticalState {
  const allyCore = getLeaderCore(state, "ally");
  const enemyCore = getLeaderCore(state, "enemy");

  const nextWinner =
    (!allyCore || !allyCore.alive) && (!enemyCore || !enemyCore.alive)
      ? "draw"
      : !allyCore || !allyCore.alive
        ? "enemy"
        : !enemyCore || !enemyCore.alive
          ? "ally"
          : state.winner;

  if (nextWinner === state.winner) return state;
  return { ...state, winner: nextWinner };
}

export function summonHeroCard(
  state: TacticalState,
  side: "ally" | "enemy",
  cardId: string,
  pos: Pos,
  playerHeroes: PlayerHero[],
): TacticalState {
  const card = getCard(cardId);
  if (card.kind !== "hero") return state;
  const heroProgress = playerHeroState(playerHeroes, card.heroId);
  const built = buildUnit(
    {
      heroId: card.heroId,
      level: heroProgress?.level ?? 1,
      stars: heroProgress?.stars ?? 1,
      skillLevel: heroProgress?.skillLevel ?? 1,
    },
    side,
    state.units.length,
    pos,
  );
  const next = clone(state);
  built.hasMoved = true;
  built.hasActed = false;
  built.cooldown = Math.max(1, built.cooldown);
  next.units.push(built);
  next.log.push(`${side === "ally" ? "You" : "Enemy"} deploy ${built.name}.`);
  const flashBefore = next.flash?.t;
  applyHeroSummonEffects(next, side, built, card);
  if (!next.flash || next.flash.t === flashBefore) {
    next.flash = { uid: built.uid, kind: "summon", label: "Deploy", t: flashTick() };
  }
  if (side === "ally" && built.alive) {
    const instantTargets = getAttackTargets(next, built.uid);
    next.selectedUid = built.uid;
    next.mode = instantTargets.length > 0 ? "attack" : "idle";
  }
  recomputeWinner(next);
  return finalizeDeckBattleState(next);
}

function splashTiles(state: TacticalState, center: Pos, radius: number) {
  const tiles: Pos[] = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (Math.abs(dx) + Math.abs(dy) > radius) continue;
      const x = center.x + dx;
      const y = center.y + dy;
      if (x < 0 || y < 0 || x >= state.grid.w || y >= state.grid.h) continue;
      tiles.push({ x, y });
    }
  }
  return tiles;
}

function damageUnit(unit: TacticalUnit, amount: number) {
  let dmg = amount;
  if (unit.buffs.shield > 0) {
    const absorbed = Math.min(unit.buffs.shield, dmg);
    unit.buffs.shield -= absorbed;
    dmg -= absorbed;
  }
  unit.hp = Math.max(0, unit.hp - dmg);
  if (unit.hp === 0) unit.alive = false;
  return dmg;
}

function healUnit(unit: TacticalUnit, amount: number) {
  const before = unit.hp;
  unit.hp = Math.min(unit.maxHp, unit.hp + amount);
  return unit.hp - before;
}

function nearestEnemyUnit(state: TacticalState, side: "ally" | "enemy", from: Pos, sameRow?: boolean) {
  const candidates = state.units
    .filter((unit) => unit.alive && unit.side !== side)
    .filter((unit) => (sameRow ? unit.pos.y === from.y : true))
    .sort((a, b) => {
      const da = Math.abs(a.pos.x - from.x) + Math.abs(a.pos.y - from.y);
      const db = Math.abs(b.pos.x - from.x) + Math.abs(b.pos.y - from.y);
      return da - db || a.hp - b.hp;
    });
  return candidates[0] ?? null;
}

function lowestAllyOrCore(state: TacticalState, side: "ally" | "enemy", includeCore = false) {
  const pool = state.units.filter((unit) => unit.alive && unit.side === side && (includeCore || unit.role !== "leader"));
  return pool.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] ?? null;
}

function applySummonEffect(state: TacticalState, side: "ally" | "enemy", source: TacticalUnit, effect: SummonEffect) {
  switch (effect.type) {
    case "damage_nearest_enemy": {
      const target = nearestEnemyUnit(state, side, source.pos, effect.sameRow);
      if (target) {
        const amount = damageUnit(target, effect.amount);
        state.flash = {
          uid: target.uid,
          kind: target.alive ? "ability" : "death",
          amount,
          label: target.alive ? "Battlecry" : "KO",
          t: flashTick(),
        };
        state.log.push(`${source.name} hits ${target.name} on deploy.`);
        return;
      }
      if (effect.fallbackCore) {
        const core = getLeaderCore(state, side === "ally" ? "enemy" : "ally");
        if (core?.alive) {
          const amount = damageUnit(core, effect.amount);
          state.flash = { uid: core.uid, kind: "ability", amount, label: "Battlecry", t: flashTick() };
          state.log.push(`${source.name} pressures the enemy core on deploy.`);
        }
      }
      return;
    }
    case "damage_enemy_core": {
      const core = getLeaderCore(state, side === "ally" ? "enemy" : "ally");
      if (core?.alive) {
        const amount = damageUnit(core, effect.amount);
        state.flash = { uid: core.uid, kind: "ability", amount, label: "Battlecry", t: flashTick() };
        state.log.push(`${source.name} strikes the enemy core on deploy.`);
      }
      return;
    }
    case "shield_self": {
      const gained = grantShield(source, effect.amount, "stack");
      if (gained > 0) state.flash = { uid: source.uid, kind: "shield", amount: gained, label: "Fortify", t: flashTick() };
      return;
    }
    case "shield_core": {
      const core = getLeaderCore(state, side);
      if (core?.alive) {
        const gained = grantShield(core, effect.amount, "stack");
        if (gained > 0) {
          state.flash = { uid: core.uid, kind: "shield", amount: gained, label: "Fortify", t: flashTick() };
          state.log.push(`${source.name} fortifies your core on deploy.`);
        }
      }
      return;
    }
    case "heal_lowest_ally": {
      const target = lowestAllyOrCore(state, side, effect.includeCore);
      if (target) {
        const amount = healUnit(target, effect.amount);
        if (amount > 0) {
          state.flash = { uid: target.uid, kind: "heal", amount, label: "Battlecry", t: flashTick() };
          state.log.push(`${source.name} restores allied tempo on deploy.`);
        }
      }
      return;
    }
    case "buff_allies": {
      for (const unit of state.units) {
        if (!unit.alive || unit.side !== side) continue;
        unit.buffs.atkPct = Math.max(unit.buffs.atkPct, effect.atkPct);
        unit.buffs.atkTurns = Math.max(unit.buffs.atkTurns, effect.turns);
      }
      const anchor = state.units.find((unit) => unit.alive && unit.side === side && unit.role !== "leader") ?? source;
      state.flash = {
        uid: anchor.uid,
        kind: "buff",
        amount: Math.round(effect.atkPct * 100),
        label: "Rally",
        t: flashTick(),
      };
      state.log.push(`${source.name} rallies the board on deploy.`);
      return;
    }
    case "stun_nearest_enemy": {
      const target = nearestEnemyUnit(state, side, source.pos, effect.sameRow);
      if (target) {
        target.buffs.stun = Math.max(target.buffs.stun, effect.turns);
        state.flash = { uid: target.uid, kind: "ability", amount: effect.turns, label: "Stun", t: flashTick() };
        state.log.push(`${source.name} disrupts ${target.name} on deploy.`);
      }
      return;
    }
  }
}

function applyHeroSummonEffects(state: TacticalState, side: "ally" | "enemy", source: TacticalUnit, card: HeroCard) {
  for (const effect of card.summonEffects ?? []) {
    applySummonEffect(state, side, source, effect);
  }
}

export function castSpellCard(
  state: TacticalState,
  side: "ally" | "enemy",
  spellCard: SpellCard,
  target: Pos,
): TacticalState {
  const next = clone(state);
  switch (spellCard.effect.type) {
    case "damage_aoe": {
      for (const tile of splashTiles(next, target, spellCard.effect.radius)) {
        const targetUnit = next.units.find((unit) => unit.alive && unit.pos.x === tile.x && unit.pos.y === tile.y);
        if (!targetUnit || targetUnit.side === side) continue;
        const amount = damageUnit(targetUnit, spellCard.effect.damage);
        next.flash = {
          uid: targetUnit.uid,
          kind: targetUnit.alive ? "ability" : "death",
          amount,
          label: targetUnit.alive ? spellCard.name : "KO",
          t: flashTick(),
        };
      }
      next.log.push(`${side === "ally" ? "You cast" : "Enemy casts"} ${spellCard.name}.`);
      break;
    }
    case "heal_aoe": {
      for (const tile of splashTiles(next, target, spellCard.effect.radius)) {
        const targetUnit = next.units.find((unit) => unit.alive && unit.pos.x === tile.x && unit.pos.y === tile.y);
        if (!targetUnit || targetUnit.side !== side) continue;
        const amount = healUnit(targetUnit, spellCard.effect.amount);
        if (amount > 0) next.flash = { uid: targetUnit.uid, kind: "heal", amount, label: spellCard.name, t: flashTick() };
      }
      next.log.push(`${spellCard.name} restores your front line.`);
      break;
    }
    case "buff_allies": {
      for (const unit of next.units) {
        if (!unit.alive || unit.side !== side) continue;
        unit.buffs.atkPct = Math.max(unit.buffs.atkPct, spellCard.effect.atkPct);
        unit.buffs.atkTurns = Math.max(unit.buffs.atkTurns, spellCard.effect.turns);
      }
      const anchor = next.units.find((unit) => unit.alive && unit.side === side && unit.role !== "leader") ?? getLeaderCore(next, side);
      if (anchor) {
        next.flash = {
          uid: anchor.uid,
          kind: "buff",
          amount: Math.round(spellCard.effect.atkPct * 100),
          label: spellCard.name,
          t: flashTick(),
        };
      }
      next.log.push(`${spellCard.name} empowers allied cards.`);
      break;
    }
    case "damage_line": {
      for (const unit of next.units) {
        if (!unit.alive || unit.side === side || unit.pos.x !== target.x) continue;
        const amount = damageUnit(unit, spellCard.effect.damage);
        next.flash = {
          uid: unit.uid,
          kind: unit.alive ? "ability" : "death",
          amount,
          label: unit.alive ? spellCard.name : "KO",
          t: flashTick(),
        };
      }
      next.log.push(`${spellCard.name} tears through a lane.`);
      break;
    }
    case "shield_leader": {
      const leader = next.units.find((unit) => unit.side === side && unit.role === "leader" && unit.alive);
      if (leader) {
        const gained = grantShield(leader, spellCard.effect.amount);
        if (gained > 0) {
          next.flash = { uid: leader.uid, kind: "shield", amount: gained, label: spellCard.name, t: flashTick() };
        }
      }
      next.log.push(`${spellCard.name} fortifies your stronghold.`);
      break;
    }
  }
  recomputeWinner(next);
  return finalizeDeckBattleState(next);
}

export function validLeaderPowerTargets(state: TacticalState, leader: LeaderDef, side: "ally" | "enemy") {
  const effect = leader.power.effect;
  if (effect.type === "blast") {
    return state.units.filter((unit) => unit.alive && unit.side !== side).map((unit) => unit.pos);
  }
  if (effect.type === "heal" || effect.type === "shield") {
    return state.units.filter((unit) => unit.alive && unit.side === side).map((unit) => unit.pos);
  }
  if (effect.type === "rally") {
    return state.units.filter((unit) => unit.alive && unit.side === side).map((unit) => unit.pos);
  }
  return [];
}

export function applyLeaderPower(
  state: TacticalState,
  side: "ally" | "enemy",
  effect: LeaderPowerEffect,
  target: Pos,
): TacticalState {
  const next = clone(state);
  switch (effect.type) {
    case "blast": {
      const unit = next.units.find((entry) => entry.alive && entry.pos.x === target.x && entry.pos.y === target.y);
      if (unit && unit.side !== side) {
        const amount = damageUnit(unit, effect.damage);
        next.flash = {
          uid: unit.uid,
          kind: unit.alive ? "ability" : "death",
          amount,
          label: unit.alive ? "Leader power" : "KO",
          t: flashTick(),
        };
      }
      next.log.push("Leader power unleashes a focused blast.");
      break;
    }
    case "heal": {
      const unit = next.units.find((entry) => entry.alive && entry.pos.x === target.x && entry.pos.y === target.y);
      if (unit && unit.side === side) {
        const amount = healUnit(unit, effect.amount);
        next.flash = { uid: unit.uid, kind: "heal", amount, label: "Leader power", t: flashTick() };
      }
      next.log.push("Leader power restores allied resolve.");
      break;
    }
    case "shield": {
      const unit = next.units.find((entry) => entry.alive && entry.pos.x === target.x && entry.pos.y === target.y);
      if (unit && unit.side === side) {
        const gained = grantShield(unit, effect.amount);
        if (gained > 0) {
          next.flash = { uid: unit.uid, kind: "shield", amount: gained, label: "Leader power", t: flashTick() };
        }
      }
      next.log.push("Leader power reinforces a frontline defender.");
      break;
    }
    case "rally": {
      for (const unit of next.units) {
        if (!unit.alive || unit.side !== side) continue;
        unit.buffs.atkPct = Math.max(unit.buffs.atkPct, effect.atkPct);
        unit.buffs.atkTurns = Math.max(unit.buffs.atkTurns, effect.turns);
      }
      const anchor = next.units.find((unit) => unit.alive && unit.side === side && unit.role !== "leader") ?? getLeaderCore(next, side);
      if (anchor) {
        next.flash = {
          uid: anchor.uid,
          kind: "buff",
          amount: Math.round(effect.atkPct * 100),
          label: "Leader power",
          t: flashTick(),
        };
      }
      next.log.push("Leader power rallies the entire board.");
      break;
    }
  }
  recomputeWinner(next);
  return finalizeDeckBattleState(next);
}
