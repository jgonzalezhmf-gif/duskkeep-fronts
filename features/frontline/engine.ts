import type { FrontlineLane, FrontlineLoadout, FrontlineSide } from "@/lib/types";
import { FRONTLINE_LANES, FRONTLINE_PRESET_BY_ID } from "./data";
import type {
  FrontlineBattleModifiers,
  FrontlineBattleState,
  FrontlineCardProfileMap,
  FrontlineEvent,
  FrontlineHeroState,
  FrontlinePreset,
  FrontlineSnapshot,
  FrontlineTracedResult,
  FrontlineSupportProfileMap,
} from "./types";
import { getFrontlineBoss } from "./bosses";
import type { FrontlineHeroProfileMap } from "./heroProfile";
import {
  getHeroInLane,
  getSupportInLane,
  otherSide,
  ownDeck,
  setHeroInLane,
  setOwnDeck,
  setSupportInLane,
  sideCoreKey,
} from "./frontlineBattleAccessors";
import {
  consumeHandCard,
  effectiveCardCost,
  getFrontlineCard,
  getStateCard,
  getStateSupport,
  playableCards,
  validCardTargets,
} from "./frontlineCardRules";
import { seededDeckState } from "./frontlineDeckState";
import { pushEvent, pushResolution } from "./frontlineEvents";
import { createEmptyLanes, initBossState } from "./frontlineBattleSetup";
import { cloneState } from "./frontlineStateClone";
import {
  heroDefinition,
  leaderDefinition,
  livingAllyWithTrait,
  ralliedAllyCount,
} from "./frontlineCombatantRules";
import { addShield, dealHeroDamage, dealSupportDamage, healHero } from "./frontlineHealthRules";
import { chooseEnemyAction } from "./frontlineEnemyAi";
import {
  applyCinderMarkOnHit,
  applyHeroDamageWithVeilArmor,
  applySoulDrain,
  emberCrownBonus,
  tickBossSignatures,
} from "./frontlineBossSignatures";
import { actorList } from "./frontlineStrikeOrder";
import type { FrontlineActor } from "./frontlineStrikeOrder";
import { applyBreach, livingPresence } from "./frontlineBreachRules";
import { prepareTurn, setupEnemyPhase } from "./frontlineTurnPreparation";
import { battleResolved, determineWinner } from "./frontlineBattleOutcome";
import { applyDirectDamage } from "./frontlineDirectDamage";

export { getEffectiveCardCost, getFrontlineCard, playableCards, validCardTargets } from "./frontlineCardRules";
export { frontPresenceScore } from "./frontlineCombatantRules";
export { laneStrikeOrder } from "./frontlineStrikeOrder";
export type { FrontlineStrikeOrderEntry } from "./frontlineStrikeOrder";

const MAX_ROUNDS = 8;
function cleanupExpiredSupport(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const support = getSupportInLane(state, side, lane);
  if (!support) return;
  support.duration -= 1;
  if (support.duration <= 0 || support.hp <= 0) {
    setSupportInLane(state, side, lane, null);
  }
}

function chantAura(state: FrontlineBattleState, side: FrontlineSide) {
  let bonus = 0;
  for (const lane of FRONTLINE_LANES) {
    const hero = getHeroInLane(state, side, lane);
    if (!hero?.alive) continue;
    const trait = heroDefinition(hero).trait;
    if (trait.type === "chant") bonus += trait.atkAura;
  }
  return bonus;
}

function attackPower(state: FrontlineBattleState, hero: FrontlineHeroState) {
  const trait = heroDefinition(hero).trait;
  let value = hero.atk + hero.tempAtk + chantAura(state, hero.side) + emberCrownBonus(state, hero);
  if (trait.type === "flurry" && hero.hp > hero.maxHp / 2) value += trait.atk;
  return value;
}

function resolveActorStrike(state: FrontlineBattleState, actor: FrontlineActor) {
  if (actor.kind === "hero") {
    const hero = getHeroInLane(state, actor.side, actor.lane);
    if (!hero?.alive || hero.stun > 0) return;
    const targetSide = otherSide(actor.side);
    const support = getSupportInLane(state, targetSide, actor.lane);
    const enemyHero = getHeroInLane(state, targetSide, actor.lane);
    const damage = Math.max(1, attackPower(state, hero));

    if (support) {
      dealSupportDamage(support, damage);
      pushEvent(state, { kind: "damage", side: actor.side, lane: actor.lane, label: `${hero.name} hits ${support.name}`, amount: damage, emphasis: "mid" });
      if (support.hp <= 0) {
        setSupportInLane(state, targetSide, actor.lane, null);
        pushEvent(state, { kind: "ko", side: actor.side, lane: actor.lane, label: `${support.name} breaks`, emphasis: "mid", subKind: "support" });
      }
      return;
    }

    if (enemyHero) {
      let dealt = Math.max(1, damage - Math.floor(enemyHero.def / 2));
      const trait = heroDefinition(hero).trait;
      const ambushTriggered = trait.type === "ambush" && enemyHero.hp < enemyHero.maxHp;
      if (ambushTriggered) dealt += trait.bonusVsWounded;
      dealt = applyHeroDamageWithVeilArmor(state, enemyHero, dealt);
      pushEvent(state, {
        kind: "damage",
        side: actor.side,
        lane: actor.lane,
        label: `${hero.name} hits ${enemyHero.name}`,
        amount: dealt,
        emphasis: "mid",
        ...(ambushTriggered ? { trait: "ambush" as const } : {}),
      });
      if (dealt > 0) applyCinderMarkOnHit(state, actor.side, actor.lane);
      if (dealt > 0 && trait.type === "lifesteal") {
        const healed = healHero(hero, trait.heal);
        if (healed > 0) {
          pushEvent(state, { kind: "heal", side: actor.side, lane: actor.lane, label: `${hero.name} drains life`, amount: healed, emphasis: "low", trait: "lifesteal" });
        }
      }
      if (dealt > 0 && trait.type === "venom" && enemyHero.alive) {
        const venomDealt = applyHeroDamageWithVeilArmor(state, enemyHero, trait.damage);
        pushEvent(state, { kind: "damage", side: actor.side, lane: actor.lane, label: `${hero.name} venom burns`, amount: venomDealt, emphasis: "mid", trait: "venom" });
      }
      if (dealt > 0 && actor.side === "enemy") applySoulDrain(state, hero, actor.lane);
      if (!enemyHero.alive) {
        setHeroInLane(state, targetSide, actor.lane, null);
        pushEvent(state, { kind: "ko", side: actor.side, lane: actor.lane, label: `${enemyHero.name} falls`, emphasis: "high", subKind: "hero" });
      }
    }
    return;
  }

  const support = getSupportInLane(state, actor.side, actor.lane);
  if (!support || support.hp <= 0 || support.atk <= 0) return;
  applyDirectDamage(state, actor.side, actor.lane, support.atk, support.name);
}

function applyHeroAftermath(state: FrontlineBattleState, side: FrontlineSide) {
  for (const lane of FRONTLINE_LANES) {
    const hero = getHeroInLane(state, side, lane);
    if (!hero?.alive) continue;
    const trait = heroDefinition(hero).trait;
    if (trait.type === "bulwark") {
      addShield(hero, trait.shield);
      pushEvent(state, { kind: "shield", side, lane, label: `${hero.name} braces`, amount: trait.shield, emphasis: "low", trait: "bulwark" });
    }
    if (trait.type === "mend") {
      let healed = 0;
      let targetHero: FrontlineHeroState | null = null;
      for (const candidateLane of FRONTLINE_LANES) {
        const candidate = getHeroInLane(state, side, candidateLane);
        if (!candidate?.alive) continue;
        if (!targetHero || candidate.hp / candidate.maxHp < targetHero.hp / targetHero.maxHp) {
          targetHero = candidate;
        }
      }
      if (targetHero) healed = healHero(targetHero, trait.heal);
      if (healed > 0) {
        pushEvent(state, { kind: "heal", side, lane, label: `${hero.name} mends ${targetHero?.name}`, amount: healed, emphasis: "low", trait: "mend" });
      }
    }
  }
}

function applySupportEffectsForLane(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const support = getSupportInLane(state, side, lane);
  if (!support?.effect) return;
  if (support.effect.type === "shield") {
    const hero = getHeroInLane(state, side, lane);
    if (hero?.alive) {
      addShield(hero, support.effect.amount, true);
      pushEvent(state, { kind: "shield", side, lane, label: `${support.name} fortifies ${hero.name}`, amount: support.effect.amount, emphasis: "low" });
    }
  }
  if (support.effect.type === "mark") {
    applyDirectDamage(state, side, lane, support.effect.damage, support.name);
  }
  if (support.effect.type === "strike") {
    applyDirectDamage(state, side, lane, support.effect.damage, support.name);
  }
}

function clearClashTemps(state: FrontlineBattleState) {
  for (const side of ["ally", "enemy"] as const) {
    for (const lane of FRONTLINE_LANES) {
      const hero = getHeroInLane(state, side, lane);
      if (!hero) continue;
      if (hero.tempShield > 0) {
        hero.shield = Math.max(0, hero.shield - hero.tempShield);
      }
      hero.tempShield = 0;
      hero.tempAtk = 0;
      hero.strikeFirst = false;
      if (hero.stun > 0) hero.stun -= 1;
    }
  }
}

export function createFrontlineBattleState(input: {
  seed: number;
  allyLoadout: FrontlineLoadout;
  enemyPreset: FrontlinePreset;
  allyHeroProfiles?: FrontlineHeroProfileMap;
  allyCardProfiles?: FrontlineCardProfileMap;
  allySupportProfiles?: FrontlineSupportProfileMap;
  modifiers?: FrontlineBattleModifiers;
}) {
  const allyLeader = leaderDefinition(input.allyLoadout.leaderId);
  const enemyLeader = leaderDefinition(input.enemyPreset.leaderId);
  const allySquad = input.allyLoadout.squad.map((id, index) => id ?? input.enemyPreset.squad[index]) as [string, string, string];
  const enemySquad = input.enemyPreset.squad;
  const enemyCoreBonus = Math.max(0, input.modifiers?.enemyCoreBonus ?? 0);
  const enemyStartCommandBonus = Math.max(0, input.modifiers?.enemyStartingCommandBonus ?? 0);
  const bossConfig = getFrontlineBoss(input.enemyPreset.bossId);
  const state: FrontlineBattleState = {
    seed: input.seed,
    round: 1,
    turn: "ally",
    winner: null,
    maxRounds: MAX_ROUNDS,
    eventSeq: 0,
    lanes: createEmptyLanes(allySquad, enemySquad, input.allyHeroProfiles),
    allyCoreHp: allyLeader.coreHp,
    enemyCoreHp: enemyLeader.coreHp + enemyCoreBonus,
    allyCoreMaxHp: allyLeader.coreHp,
    enemyCoreMaxHp: enemyLeader.coreHp + enemyCoreBonus,
    allyDeck: seededDeckState(input.allyLoadout.deck.filter(Boolean) as string[], input.allyLoadout.leaderId, input.seed + 11),
    enemyDeck: seededDeckState(input.enemyPreset.deck, input.enemyPreset.leaderId, input.seed + 29),
    allyCardProfiles: input.allyCardProfiles,
    allySupportProfiles: input.allySupportProfiles,
    allyLeaderUsed: false,
    enemyLeaderUsed: false,
    selectedCardId: null,
    selectedLeaderPower: false,
    events: [],
    lastResolution: [],
    enemyStartCommandBonus,
    bossState: initBossState(bossConfig),
    playerCardCostMod: 0,
    playerCardCostModTurnsLeft: 0,
  };
  return prepareTurn(state, "ally");
}

export function validLeaderPowerTargets(state: FrontlineBattleState, side: FrontlineSide): FrontlineLane[] {
  const deck = ownDeck(state, side);
  const leader = leaderDefinition(deck.leaderId);
  if (deck.command < leader.power.cost || deck.powerCooldown > 0 || deck.usedLeaderPower) return [];
  if (leader.power.effect.type === "beam") {
    return FRONTLINE_LANES.filter((lane) => Boolean(getHeroInLane(state, otherSide(side), lane) || getSupportInLane(state, otherSide(side), lane)));
  }
  return [...FRONTLINE_LANES];
}

function emitSynergy(
  state: FrontlineBattleState,
  side: FrontlineSide,
  synergyId: string,
  label: string,
  lane?: FrontlineLane,
) {
  pushEvent(state, {
    kind: "card",
    side,
    lane,
    label: `Synergy: ${label}`,
    emphasis: "mid",
    signature: "synergy",
    signatureId: synergyId,
  });
}

export function playCard(
  state: FrontlineBattleState,
  side: FrontlineSide,
  cardId: string,
  lane?: FrontlineLane,
) {
  const next = cloneState(state);
  const deck = ownDeck(next, side);
  const card = getStateCard(next, side, cardId);
  const cost = effectiveCardCost(next, side, card.cost);
  if (deck.command < cost) return state;
  if (!deck.hand.includes(card.id)) return state;
  if (card.target !== "none" && !lane) return state;
  if (card.target !== "none" && lane && !validCardTargets(next, side, card.id).includes(lane)) return state;

  pushEvent(next, { kind: "card", side, lane, label: `${side === "ally" ? "Play" : "Enemy"} ${card.name}`, emphasis: "low" });
  pushResolution(next, `${side === "ally" ? "You" : "Enemy"} played ${card.name}.`);

  if (card.effect.type === "hero_strike" && lane) {
    const hero = getHeroInLane(next, side, lane);
    if (hero) {
      // Affinity - Twin Slash + Blade Striker: target ally with flurry trait gets +2 ATK extra.
      const bladeAffinity =
        side === "ally" && card.id === "order_twin_slash" && heroDefinition(hero).trait.type === "flurry";
      const atkBonus = bladeAffinity ? 2 : 0;
      hero.tempAtk += card.effect.atk + atkBonus;
      if (card.effect.shield) addShield(hero, card.effect.shield, true);
      if (card.effect.strikeFirst) hero.strikeFirst = true;
      if (bladeAffinity) emitSynergy(next, side, "blade_strike_affinity", "Blade Strike Affinity", lane);
    }
  } else if (card.effect.type === "front_shot" && lane) {
    // Affinity - Archer's Focus: focus_fire while a breach (archer) ally is alive deals +2 damage.
    const archerAffinity =
      side === "ally" && card.id === "order_focus_fire" && livingAllyWithTrait(next, side, "breach");
    const damageBonus = archerAffinity ? 2 : 0;
    if (archerAffinity) emitSynergy(next, side, "archers_focus", "Archer's Focus", lane);
    applyDirectDamage(next, side, lane, card.effect.damage + damageBonus, card.name);
  } else if (card.effect.type === "rally") {
    // Bulwark Cohesion: Battle Hymn with a bulwark ally alive grants +1 ATK extra to the rally.
    const bulwarkBonus =
      side === "ally" && card.id === "tactic_battle_hymn" && livingAllyWithTrait(next, side, "bulwark")
        ? 1
        : 0;
    if (bulwarkBonus > 0) emitSynergy(next, side, "bulwark_cohesion", "Bulwark Cohesion");
    for (const targetLane of FRONTLINE_LANES) {
      const hero = getHeroInLane(next, side, targetLane);
      if (!hero) continue;
      hero.tempAtk += card.effect.atk + bulwarkBonus;
      if (card.effect.shield) addShield(hero, card.effect.shield, true);
    }
    // Howling Pack (echo): Battle Hymn while a friendly support is on the field also bumps the support's ATK.
    if (side === "ally" && card.id === "tactic_battle_hymn") {
      let echoTriggered = false;
      for (const targetLane of FRONTLINE_LANES) {
        const support = getSupportInLane(next, side, targetLane);
        if (!support) continue;
        support.atk += 1;
        echoTriggered = true;
      }
      if (echoTriggered) emitSynergy(next, side, "howling_echo", "Howling Pack Echo");
    }
  } else if (card.effect.type === "heal_front" && lane) {
    const hero = getHeroInLane(next, side, lane);
    if (hero) {
      const healed = healHero(hero, card.effect.heal);
      if (healed > 0) pushEvent(next, { kind: "heal", side, lane, label: `${card.name} heals ${hero.name}`, amount: healed, emphasis: "low" });
    }
    if (card.effect.coreHeal) {
      const coreKey = sideCoreKey(side);
      const maxKey = side === "ally" ? "allyCoreMaxHp" : "enemyCoreMaxHp";
      const before = next[coreKey];
      next[coreKey] = Math.min(next[maxKey], next[coreKey] + card.effect.coreHeal);
      if (next[coreKey] > before) {
        pushEvent(next, { kind: "heal", side, lane, label: `${card.name} steadies the core`, amount: next[coreKey] - before, emphasis: "low" });
      }
    }
    // Affinity - Sanctified Healing: Sanctuary on a mend (healer) hero spreads a softer heal to lateral lanes.
    if (
      side === "ally" &&
      card.id === "tactic_sanctuary" &&
      hero &&
      heroDefinition(hero).trait.type === "mend"
    ) {
      emitSynergy(next, side, "sanctified_healing", "Sanctified Healing", lane);
      for (const sideLane of FRONTLINE_LANES) {
        if (sideLane === lane) continue;
        const sideHero = getHeroInLane(next, side, sideLane);
        if (!sideHero) continue;
        const healed = healHero(sideHero, 3);
        if (healed > 0) {
          pushEvent(next, {
            kind: "heal",
            side,
            lane: sideLane,
            label: `${card.name} steadies ${sideHero.name}`,
            amount: healed,
            emphasis: "low",
          });
        }
      }
    }
  } else if (card.effect.type === "stun_front" && lane) {
    const hero = getHeroInLane(next, otherSide(side), lane);
    if (hero) {
      hero.stun = Math.max(hero.stun, card.effect.turns);
      pushEvent(next, { kind: "stun", side, lane, label: `${hero.name} is stunned`, emphasis: "mid" });
    }
  } else if (card.effect.type === "execute_front" && lane) {
    const enemySide = otherSide(side);
    // Shadow Strike: shadow_dive on an already-stunned enemy hero deals +3 extra.
    const enemyHero = getHeroInLane(next, enemySide, lane);
    const shadowBonus =
      side === "ally" && card.id === "order_shadow_dive" && enemyHero?.alive && enemyHero.stun > 0
        ? 3
        : 0;
    if (shadowBonus > 0) emitSynergy(next, side, "shadow_strike", "Shadow Strike", lane);
    if (livingPresence(next, enemySide, lane)) {
      applyDirectDamage(next, side, lane, card.effect.damage + shadowBonus, card.name);
    } else if (card.effect.bonusOpenCore) {
      const coreKey = sideCoreKey(enemySide);
      next[coreKey] = Math.max(0, next[coreKey] - card.effect.bonusOpenCore);
      pushEvent(next, { kind: "breach", side, lane, label: `${card.name} cracks the core`, amount: card.effect.bonusOpenCore, emphasis: "high" });
    }
  } else if (card.effect.type === "summon" && lane) {
    const supportDef = getStateSupport(next, side, card.effect.supportId);
    if (supportDef) {
      // Howling Pack (forward): summon_wolf with 2+ rallied allies -> wolf enters with +2 HP / +1 ATK.
      const howlingPack =
        side === "ally" && card.id === "summon_wolf" && ralliedAllyCount(next, side) >= 2;
      const hpBonus = howlingPack ? 2 : 0;
      const atkBonus = howlingPack ? 1 : 0;
      setSupportInLane(next, side, lane, {
        id: supportDef.id,
        side,
        lane,
        name: supportDef.name,
        hp: supportDef.maxHp + hpBonus,
        maxHp: supportDef.maxHp + hpBonus,
        atk: supportDef.atk + atkBonus,
        duration: supportDef.duration,
        intercepts: supportDef.intercepts,
        effect: supportDef.effect,
      });
      if (howlingPack) emitSynergy(next, side, "howling_pack", "Howling Pack", lane);
      pushEvent(next, { kind: "summon", side, lane, label: `${supportDef.name} enters ${lane}`, emphasis: "mid" });
    }
  }

  const nextDeck = consumeHandCard({ ...deck, command: deck.command - cost }, card);
  setOwnDeck(next, side, nextDeck);
  const becameExhausted =
    !deck.exhaustedCardIds.includes(card.id) && nextDeck.exhaustedCardIds.includes(card.id);
  if (becameExhausted) {
    pushEvent(next, {
      kind: "card",
      side,
      label: `${card.name} exhausted`,
      emphasis: "mid",
      signature: "exhaust",
      signatureId: card.id,
    });
  }
  return next;
}

export function activateLeaderPower(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const next = cloneState(state);
  const deck = ownDeck(next, side);
  const leader = leaderDefinition(deck.leaderId);
  if (!validLeaderPowerTargets(next, side).includes(lane)) return state;

  if (leader.power.effect.type === "beam") {
    applyDirectDamage(next, side, lane, leader.power.effect.damage, leader.power.name);
    if (leader.power.effect.healCore) {
      const coreKey = sideCoreKey(side);
      const maxKey = side === "ally" ? "allyCoreMaxHp" : "enemyCoreMaxHp";
      next[coreKey] = Math.min(next[maxKey], next[coreKey] + leader.power.effect.healCore);
    }
  } else {
    for (const targetLane of FRONTLINE_LANES) {
      const hero = getHeroInLane(next, side, targetLane);
      if (!hero) continue;
      hero.tempAtk += leader.power.effect.atk;
      addShield(hero, leader.power.effect.shield, true);
    }
  }

  setOwnDeck(next, side, {
    ...deck,
    command: deck.command - leader.power.cost,
    powerCooldown: leader.power.cooldown,
    usedLeaderPower: true,
  });
  if (side === "ally") next.allyLeaderUsed = true;
  else next.enemyLeaderUsed = true;
  pushEvent(next, { kind: "power", side, lane, label: `${leader.name}: ${leader.power.name}`, emphasis: "mid" });
  pushResolution(next, `${leader.name} triggered ${leader.power.name}.`);
  return next;
}

export function resolveTurn(state: FrontlineBattleState) {
  // 1. Switch to enemy phase + setup enemy deck (draw, command, cooldown).
  let next = setupEnemyPhase(state);

  // 2. Tick boss signatures (Inferno / Twilight cooldowns and possible cast).
  tickBossSignatures(next);
  if (battleResolved(next)) {
    next.winner = determineWinner(next) ?? next.winner;
    return next;
  }

  // 3. Enemy plays cards & leader power (silent visually - no snapshots from card events).
  next = runEnemyTurn(next);
  if (battleResolved(next)) {
    next.winner = determineWinner(next) ?? next.winner;
    return next;
  }

  // 4. Clash: every alive actor of every lane strikes once, in initiative order.
  for (const lane of ["center", "left", "right"] as const) {
    if (battleResolved(next)) break;
    applySupportEffectsForLane(next, "ally", lane);
    if (battleResolved(next)) break;
    applySupportEffectsForLane(next, "enemy", lane);
    if (battleResolved(next)) break;
    const actors = actorList(next, lane);
    for (const actor of actors) {
      if (battleResolved(next)) break;
      resolveActorStrike(next, actor);
    }
    cleanupExpiredSupport(next, "ally", lane);
    cleanupExpiredSupport(next, "enemy", lane);
  }

  // 5. End-of-round aftermath + breach.
  if (!battleResolved(next)) {
    applyHeroAftermath(next, "ally");
    applyHeroAftermath(next, "enemy");
    applyBreach(next);
  }
  clearClashTemps(next);

  // 6. Winner check.
  const winner = determineWinner(next);
  if (winner) {
    next.winner = winner;
    return next;
  }

  // 7. Advance round and prepare next ally turn.
  next.round += 1;
  const roundWinner = determineWinner(next);
  if (roundWinner) {
    next.winner = roundWinner;
    return next;
  }
  return prepareTurn(next, "ally");
}

function enemyShouldUsePower(state: FrontlineBattleState) {
  return validLeaderPowerTargets(state, "enemy")[0] ?? null;
}

export function runEnemyTurn(state: FrontlineBattleState) {
  let next = cloneState(state);
  if (next.turn !== "enemy" || next.winner) return state;

  const skipCardIds = new Set<string>();
  const MAX_ITERATIONS = 24;
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations += 1;
    const playable = playableCards(next, "enemy").filter((card) => !skipCardIds.has(card.id));
    if (!playable.length) break;
    if (ownDeck(next, "enemy").command <= 0) break;

    const chosen = chooseEnemyAction(next, playable);
    if (!chosen) break;

    const before = next;
    next = playCard(next, "enemy", chosen.card.id, chosen.lane);
    if (next === before) {
      skipCardIds.add(chosen.card.id);
      continue;
    }
  }

  const powerLane = enemyShouldUsePower(next);
  if (powerLane) {
    next = activateLeaderPower(next, "enemy", powerLane);
  }
  return next;
}

function withTrace<T>(state: FrontlineBattleState, runner: (traced: FrontlineBattleState) => T): { final: T; snapshots: FrontlineSnapshot[] } {
  const snapshots: FrontlineSnapshot[] = [];
  const traced = cloneState(state);
  traced._trace = snapshots;
  const final = runner(traced);
  return { final, snapshots };
}

export function resolveTurnTraced(state: FrontlineBattleState): FrontlineTracedResult {
  const { final, snapshots } = withTrace(state, (traced) => resolveTurn(traced));
  delete (final as { _trace?: FrontlineSnapshot[] })._trace;
  return { final, snapshots };
}

export function runEnemyTurnTraced(state: FrontlineBattleState): FrontlineTracedResult {
  const { final, snapshots } = withTrace(state, (traced) => runEnemyTurn(traced));
  delete (final as { _trace?: FrontlineSnapshot[] })._trace;
  return { final, snapshots };
}

export function createDefaultFrontlineLoadout(): FrontlineLoadout {
  return {
    leaderId: "leader_aurora",
    squad: ["bran", "kara", "mira"],
    deck: [
      "order_guard_wall",
      "order_twin_slash",
      "order_focus_fire",
      "tactic_battle_hymn",
      "tactic_sanctuary",
      "tactic_smokescreen",
      "summon_wolf",
      "summon_barrier",
    ],
  };
}

export function getEnemyPreset(id: string) {
  const preset = FRONTLINE_PRESET_BY_ID[id];
  if (!preset) throw new Error(`Unknown frontline preset ${id}`);
  return preset;
}
