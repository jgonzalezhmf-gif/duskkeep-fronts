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
  FrontlineSupportState,
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
import { drawInto, seededDeckState } from "./frontlineDeckState";
import { pushEvent, pushResolution } from "./frontlineEvents";
import { createEmptyLanes, initBossState } from "./frontlineBattleSetup";
import { cloneState } from "./frontlineStateClone";
import {
  breachBonus,
  heroDefinition,
  initiativeForHero,
  leaderDefinition,
  livingAllyWithTrait,
  ralliedAllyCount,
} from "./frontlineCombatantRules";
import { addShield, dealHeroDamage, dealSupportDamage, healHero } from "./frontlineHealthRules";
import { chooseEnemyAction } from "./frontlineEnemyAi";

export { getEffectiveCardCost, getFrontlineCard, playableCards, validCardTargets } from "./frontlineCardRules";
export { frontPresenceScore } from "./frontlineCombatantRules";

const COMMAND_PER_TURN = 3;
const DRAW_PER_TURN = 2;
const MAX_ROUNDS = 8;
const BREACH_DAMAGE: Record<FrontlineLane, number> = { left: 2, center: 3, right: 2 };

function battleResolved(state: FrontlineBattleState) {
  return state.allyCoreHp <= 0 || state.enemyCoreHp <= 0 || Boolean(state.winner);
}

function applyDirectDamage(
  state: FrontlineBattleState,
  side: FrontlineSide,
  lane: FrontlineLane,
  amount: number,
  source: string,
) {
  const targetSide = otherSide(side);
  const support = getSupportInLane(state, targetSide, lane);
  if (support) {
    dealSupportDamage(support, amount);
    pushEvent(state, { kind: "damage", side, lane, label: `${source} hits ${support.name}`, amount, emphasis: "mid" });
    pushResolution(state, `${source} cracked ${support.name} on ${lane}.`);
    if (support.hp <= 0) {
      setSupportInLane(state, targetSide, lane, null);
      pushEvent(state, { kind: "ko", side, lane, label: `${support.name} breaks`, emphasis: "high", subKind: "support" });
    }
    return;
  }

  const hero = getHeroInLane(state, targetSide, lane);
  if (hero) {
    const dealt = applyHeroDamageWithVeilArmor(state, hero, amount);
    pushEvent(state, { kind: "damage", side, lane, label: `${source} hits ${hero.name}`, amount: dealt, emphasis: "mid" });
    pushResolution(state, `${source} struck ${hero.name} on ${lane} for ${dealt}.`);
    if (!hero.alive) {
      setHeroInLane(state, targetSide, lane, null);
      pushEvent(state, { kind: "ko", side, lane, label: `${hero.name} falls`, emphasis: "high", subKind: "hero" });
    }
    return;
  }

  const coreKey = sideCoreKey(targetSide);
  state[coreKey] = Math.max(0, state[coreKey] - amount);
  pushEvent(state, { kind: "damage", side, lane, label: `${source} burns the core`, amount, emphasis: "high" });
  pushResolution(state, `${source} burned the ${targetSide} core for ${amount}.`);
}

function cleanupExpiredSupport(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const support = getSupportInLane(state, side, lane);
  if (!support) return;
  support.duration -= 1;
  if (support.duration <= 0 || support.hp <= 0) {
    setSupportInLane(state, side, lane, null);
  }
}

function livingPresence(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  return Boolean(getHeroInLane(state, side, lane)?.alive || getSupportInLane(state, side, lane));
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

function emberCrownBonus(state: FrontlineBattleState, hero: FrontlineHeroState) {
  if (hero.side !== "enemy" || !state.bossState) return 0;
  const boss = getFrontlineBoss(state.bossState.id);
  if (!boss) return 0;
  const ember = boss.signatures.find((sig) => sig.type === "ember_crown");
  if (!ember || ember.type !== "ember_crown") return 0;
  const isSegmentLane = boss.segments.some((seg) => seg.lane === hero.lane);
  if (!isSegmentLane) return 0;
  const aliveCount = boss.segments.filter((seg) => {
    const segHero = getHeroInLane(state, "enemy", seg.lane);
    return Boolean(segHero?.alive);
  }).length;
  return aliveCount >= ember.minSegmentsAlive ? ember.atkBonus : 0;
}

function applyCinderMarkOnHit(state: FrontlineBattleState, attackerSide: FrontlineSide, lane: FrontlineLane) {
  if (attackerSide !== "enemy" || !state.bossState) return;
  const boss = getFrontlineBoss(state.bossState.id);
  if (!boss) return;
  const cinder = boss.signatures.find((sig) => sig.type === "cinder_mark");
  if (!cinder) return;
  const isSegmentLane = boss.segments.some((seg) => seg.lane === lane);
  if (!isSegmentLane) return;
  state.bossState.scorch[lane] = (state.bossState.scorch[lane] ?? 0) + 1;
}

type Actor =
  | { side: FrontlineSide; lane: FrontlineLane; kind: "hero"; hero: FrontlineHeroState }
  | { side: FrontlineSide; lane: FrontlineLane; kind: "support"; support: FrontlineSupportState };

function actorList(state: FrontlineBattleState, lane: FrontlineLane): Actor[] {
  const laneState = state.lanes[lane];
  const actors: Actor[] = [];
  const allyHero = laneState.allyHero;
  const enemyHero = laneState.enemyHero;
  const allySupport = laneState.allySupport;
  const enemySupport = laneState.enemySupport;
  if (allyHero?.alive) actors.push({ side: "ally", lane, kind: "hero", hero: allyHero });
  if (enemyHero?.alive) actors.push({ side: "enemy", lane, kind: "hero", hero: enemyHero });
  if (allySupport && allySupport.hp > 0 && allySupport.atk > 0) actors.push({ side: "ally", lane, kind: "support", support: allySupport });
  if (enemySupport && enemySupport.hp > 0 && enemySupport.atk > 0) actors.push({ side: "enemy", lane, kind: "support", support: enemySupport });

  actors.sort((left, right) => {
    const leftValue = left.kind === "hero" ? initiativeForHero(left.hero) : 1;
    const rightValue = right.kind === "hero" ? initiativeForHero(right.hero) : 1;
    if (leftValue === rightValue) {
      if (left.side === state.turn && right.side !== state.turn) return -1;
      if (right.side === state.turn && left.side !== state.turn) return 1;
      return left.side === "ally" ? -1 : 1;
    }
    return rightValue - leftValue;
  });
  return actors;
}

function resolveActorStrike(state: FrontlineBattleState, actor: Actor) {
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

function applyBreach(state: FrontlineBattleState) {
  for (const lane of FRONTLINE_LANES) {
    const allyPresent = livingPresence(state, "ally", lane);
    const enemyPresent = livingPresence(state, "enemy", lane);
    if (allyPresent && !enemyPresent) {
      const amount = BREACH_DAMAGE[lane] + breachBonus(getHeroInLane(state, "ally", lane));
      state.enemyCoreHp = Math.max(0, state.enemyCoreHp - amount);
      pushEvent(state, { kind: "breach", side: "ally", lane, label: `${lane} breach`, amount, emphasis: "high" });
      pushResolution(state, `Ally breaches ${lane} for ${amount}.`);
    } else if (enemyPresent && !allyPresent) {
      const amount = BREACH_DAMAGE[lane] + breachBonus(getHeroInLane(state, "enemy", lane));
      state.allyCoreHp = Math.max(0, state.allyCoreHp - amount);
      pushEvent(state, { kind: "breach", side: "enemy", lane, label: `${lane} breach`, amount, emphasis: "high" });
      pushResolution(state, `Enemy breaches ${lane} for ${amount}.`);
    }
  }
}

function determineWinner(state: FrontlineBattleState) {
  if (state.allyCoreHp <= 0 && state.enemyCoreHp <= 0) return "draw";
  if (state.enemyCoreHp <= 0) return "ally";
  if (state.allyCoreHp <= 0) return "enemy";
  if (state.round >= state.maxRounds && state.turn === "enemy") {
    if (state.allyCoreHp === state.enemyCoreHp) return "draw";
    return state.allyCoreHp > state.enemyCoreHp ? "ally" : "enemy";
  }
  return null;
}

function prepareTurn(state: FrontlineBattleState, side: FrontlineSide) {
  const next = cloneState(state);
  next.turn = side;
  next.selectedCardId = null;
  next.selectedLeaderPower = false;
  const deck = drawInto(ownDeck(next, side), DRAW_PER_TURN, next.seed + next.round * (side === "ally" ? 23 : 47));
  deck.command = COMMAND_PER_TURN;
  if (side === "enemy" && next.enemyStartCommandBonus > 0) {
    deck.command += next.enemyStartCommandBonus;
    next.enemyStartCommandBonus = 0;
  }
  deck.usedLeaderPower = false;
  deck.powerCooldown = Math.max(0, deck.powerCooldown - 1);
  setOwnDeck(next, side, deck);
  if (side === "ally") next.allyLeaderUsed = false;
  else next.enemyLeaderUsed = false;
  pushEvent(next, { kind: "round", side, label: `${side === "ally" ? "Player" : "Enemy"} turn ${next.round}`, emphasis: "low" });
  if (side === "ally") consumeCinderMark(next);
  if (side === "ally" && next.playerCardCostModTurnsLeft > 0) {
    next.playerCardCostModTurnsLeft -= 1;
    if (next.playerCardCostModTurnsLeft === 0) next.playerCardCostMod = 0;
  }
  if (side === "enemy") tickBossSignatures(next);
  return next;
}

function tickBossSignatures(state: FrontlineBattleState) {
  if (!state.bossState) return;
  const boss = getFrontlineBoss(state.bossState.id);
  if (!boss) return;
  const inferno = boss.signatures.find((sig) => sig.type === "inferno_wave");
  if (inferno && inferno.type === "inferno_wave") {
    state.bossState.infernoCountdown = Math.max(0, state.bossState.infernoCountdown - 1);
    if (state.bossState.infernoCountdown === 0) {
      castInfernoWave(state, inferno.damagePerHero);
      state.bossState.infernoCountdown = inferno.cadenceRounds;
    } else {
      pushEvent(state, {
        kind: "boss_signature",
        side: "enemy",
        label: `Inferno Wave in ${state.bossState.infernoCountdown}`,
        amount: state.bossState.infernoCountdown,
        emphasis: "mid",
        signature: "charge",
        signatureId: "inferno_wave",
      });
    }
  }
  const veil = boss.signatures.find((sig) => sig.type === "twilight_veil");
  if (veil && veil.type === "twilight_veil") {
    state.bossState.twilightCountdown = Math.max(0, state.bossState.twilightCountdown - 1);
    if (state.bossState.twilightCountdown === 0) {
      castTwilightVeil(state, veil.cardCostBonus, veil.durationTurns);
      state.bossState.twilightCountdown = veil.cadenceRounds;
    } else {
      pushEvent(state, {
        kind: "boss_signature",
        side: "enemy",
        label: `Twilight Veil in ${state.bossState.twilightCountdown}`,
        amount: state.bossState.twilightCountdown,
        emphasis: "mid",
        signature: "charge",
        signatureId: "twilight_veil",
      });
    }
  }
}

function castInfernoWave(state: FrontlineBattleState, damagePerHero: number) {
  pushEvent(state, {
    kind: "boss_signature",
    side: "enemy",
    label: "Inferno Wave",
    emphasis: "high",
    signature: "cast",
    signatureId: "inferno_wave",
  });
  for (const lane of FRONTLINE_LANES) {
    const hero = getHeroInLane(state, "ally", lane);
    if (!hero?.alive) continue;
    const dealt = dealHeroDamage(hero, damagePerHero);
    pushEvent(state, {
      kind: "damage",
      side: "enemy",
      lane,
      label: `Inferno burns ${hero.name}`,
      amount: dealt,
      emphasis: "high",
    });
    if (!hero.alive) {
      setHeroInLane(state, "ally", lane, null);
      pushEvent(state, { kind: "ko", side: "enemy", lane, label: `${hero.name} falls`, emphasis: "high", subKind: "hero" });
    }
  }
}

function castTwilightVeil(state: FrontlineBattleState, cardCostBonus: number, durationTurns: number) {
  state.playerCardCostMod = cardCostBonus;
  // +1 so the effect survives the decrement that happens at the next prepareTurn(ally).
  state.playerCardCostModTurnsLeft = durationTurns + 1;
  pushEvent(state, {
    kind: "boss_signature",
    side: "enemy",
    label: "Twilight Veil",
    amount: cardCostBonus,
    emphasis: "high",
    signature: "cast",
    signatureId: "twilight_veil",
  });
}

function consumeCinderMark(state: FrontlineBattleState) {
  if (!state.bossState) return;
  const boss = getFrontlineBoss(state.bossState.id);
  if (!boss) return;
  const cinder = boss.signatures.find((sig) => sig.type === "cinder_mark");
  if (!cinder || cinder.type !== "cinder_mark") return;
  for (const lane of FRONTLINE_LANES) {
    const stacks = state.bossState.scorch[lane] ?? 0;
    if (stacks <= 0) continue;
    const hero = getHeroInLane(state, "ally", lane);
    if (hero?.alive) {
      const damage = stacks * cinder.damagePerStack;
      const dealt = dealHeroDamage(hero, damage);
      pushEvent(state, {
        kind: "damage",
        side: "enemy",
        lane,
        label: `Cinder scorches ${hero.name}`,
        amount: dealt,
        emphasis: "mid",
      });
      if (!hero.alive) {
        setHeroInLane(state, "ally", lane, null);
        pushEvent(state, { kind: "ko", side: "enemy", lane, label: `${hero.name} falls`, emphasis: "high", subKind: "hero" });
      }
    }
    state.bossState.scorch[lane] = 0;
  }
}

function applyHeroDamageWithVeilArmor(state: FrontlineBattleState, hero: FrontlineHeroState, amount: number) {
  return dealHeroDamage(hero, applyVeilArmor(state, hero, amount));
}

function applyVeilArmor(state: FrontlineBattleState, hero: FrontlineHeroState, amount: number) {
  if (hero.side !== "enemy" || !state.bossState) return amount;
  const boss = getFrontlineBoss(state.bossState.id);
  if (!boss) return amount;
  const armor = boss.signatures.find((sig) => sig.type === "veil_armor");
  if (!armor || armor.type !== "veil_armor") return amount;
  const isSegmentLane = boss.segments.some((seg) => seg.lane === hero.lane);
  if (!isSegmentLane) return amount;
  const aliveCount = boss.segments.filter((seg) => {
    const segHero = getHeroInLane(state, "enemy", seg.lane);
    return Boolean(segHero?.alive);
  }).length;
  if (aliveCount < armor.minSegmentsAlive) return amount;
  return Math.max(1, amount - armor.damageReduction);
}

function applySoulDrain(state: FrontlineBattleState, attacker: FrontlineHeroState, lane: FrontlineLane) {
  if (!state.bossState) return;
  const boss = getFrontlineBoss(state.bossState.id);
  if (!boss) return;
  const drain = boss.signatures.find((sig) => sig.type === "soul_drain");
  if (!drain || drain.type !== "soul_drain") return;
  const isSegmentLane = boss.segments.some((seg) => seg.lane === lane);
  if (!isSegmentLane) return;
  // Silent heal: the segment recovers HP but no separate event is emitted; the
  // change is reflected in the snapshot of the strike that triggered it.
  healHero(attacker, drain.healPerHit);
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

function setupEnemyPhase(state: FrontlineBattleState): FrontlineBattleState {
  const next = cloneState(state);
  next.turn = "enemy";
  next.selectedCardId = null;
  next.selectedLeaderPower = false;
  const deck = drawInto(ownDeck(next, "enemy"), DRAW_PER_TURN, next.seed + next.round * 47);
  deck.command = COMMAND_PER_TURN;
  if (next.enemyStartCommandBonus > 0) {
    deck.command += next.enemyStartCommandBonus;
    next.enemyStartCommandBonus = 0;
  }
  deck.usedLeaderPower = false;
  deck.powerCooldown = Math.max(0, deck.powerCooldown - 1);
  setOwnDeck(next, "enemy", deck);
  next.enemyLeaderUsed = false;
  pushEvent(next, { kind: "round", side: "enemy", label: `Enemy turn ${next.round}`, emphasis: "low" });
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

export type FrontlineStrikeOrderEntry = {
  side: FrontlineSide;
  kind: "hero" | "support";
  initiative: number;
  name: string;
};

export function laneStrikeOrder(state: FrontlineBattleState, lane: FrontlineLane): FrontlineStrikeOrderEntry[] {
  return actorList(state, lane).map((actor) => ({
    side: actor.side,
    kind: actor.kind,
    initiative: actor.kind === "hero" ? initiativeForHero(actor.hero) : 1,
    name: actor.kind === "hero" ? actor.hero.name : actor.support.name,
  }));
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
