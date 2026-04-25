import { createRng } from "@/lib/rng";
import type { FrontlineLane, FrontlineLoadout, FrontlineSide } from "@/lib/types";
import {
  FRONTLINE_CARD_BY_ID,
  FRONTLINE_LANES,
  FRONTLINE_LEADER_BY_ID,
  FRONTLINE_PRESET_BY_ID,
  FRONTLINE_SUPPORT_BY_ID,
  FRONTLINE_UNIT_BY_ID,
} from "./data";
import type {
  FrontlineBattleState,
  FrontlineCardDef,
  FrontlineCardProfileMap,
  FrontlineDeckState,
  FrontlineEvent,
  FrontlineHeroDef,
  FrontlineHeroState,
  FrontlineLaneState,
  FrontlineLeaderDef,
  FrontlinePreset,
  FrontlineSupportState,
  FrontlineSupportProfileMap,
} from "./types";
import type { FrontlineHeroProfileMap } from "./heroProfile";

const COMMAND_PER_TURN = 3;
const HAND_MAX = 5;
const DRAW_PER_TURN = 2;
const OPENING_HAND = 3;
const MAX_ROUNDS = 8;
const BREACH_DAMAGE: Record<FrontlineLane, number> = { left: 2, center: 3, right: 2 };

function cloneHero(hero: FrontlineHeroState | null) {
  return hero ? { ...hero } : null;
}

function cloneSupport(support: FrontlineSupportState | null) {
  return support ? { ...support } : null;
}

function cloneLane(lane: FrontlineLaneState): FrontlineLaneState {
  return {
    allyHero: cloneHero(lane.allyHero),
    enemyHero: cloneHero(lane.enemyHero),
    allySupport: cloneSupport(lane.allySupport),
    enemySupport: cloneSupport(lane.enemySupport),
  };
}

function cloneState(state: FrontlineBattleState): FrontlineBattleState {
  return {
    ...state,
    lanes: {
      left: cloneLane(state.lanes.left),
      center: cloneLane(state.lanes.center),
      right: cloneLane(state.lanes.right),
    },
    allyDeck: {
      ...state.allyDeck,
      deck: [...state.allyDeck.deck],
      hand: [...state.allyDeck.hand],
      discard: [...state.allyDeck.discard],
    },
    enemyDeck: {
      ...state.enemyDeck,
      deck: [...state.enemyDeck.deck],
      hand: [...state.enemyDeck.hand],
      discard: [...state.enemyDeck.discard],
    },
    allyCardProfiles: state.allyCardProfiles,
    allySupportProfiles: state.allySupportProfiles,
    events: [...state.events],
    lastResolution: [...state.lastResolution],
  };
}

function drawInto(deckState: FrontlineDeckState, amount: number, seed: number) {
  const next = {
    ...deckState,
    deck: [...deckState.deck],
    hand: [...deckState.hand],
    discard: [...deckState.discard],
  };
  const rng = createRng(seed);
  for (let draw = 0; draw < amount && next.hand.length < HAND_MAX; draw += 1) {
    if (next.deck.length === 0 && next.discard.length > 0) {
      const pool = [...next.discard];
      const reshuffled: string[] = [];
      while (pool.length) {
        const pickIndex = rng.int(pool.length);
        reshuffled.push(pool.splice(pickIndex, 1)[0]);
      }
      next.deck = reshuffled;
      next.discard = [];
    }
    const cardId = next.deck.shift();
    if (!cardId) break;
    next.hand.push(cardId);
  }
  return next;
}

function seededDeckState(deckIds: string[], leaderId: string, seed: number): FrontlineDeckState {
  const pool = deckIds.filter((id): id is string => Boolean(FRONTLINE_CARD_BY_ID[id]));
  const rng = createRng(seed);
  const shuffled = [...pool];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = rng.int(index + 1);
    const temp = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = temp;
  }
  return drawInto(
    {
      leaderId,
      deck: shuffled,
      hand: [],
      discard: [],
      command: 0,
      powerCooldown: 0,
      usedLeaderPower: false,
    },
    OPENING_HAND,
    seed + 17,
  );
}

function resolveHeroDefinition(heroId: string, side: FrontlineSide, allyHeroProfiles?: FrontlineHeroProfileMap) {
  return side === "ally" ? allyHeroProfiles?.[heroId] ?? FRONTLINE_UNIT_BY_ID[heroId] : FRONTLINE_UNIT_BY_ID[heroId];
}

function buildHeroState(
  heroId: string,
  side: FrontlineSide,
  lane: FrontlineLane,
  allyHeroProfiles?: FrontlineHeroProfileMap,
): FrontlineHeroState {
  const definition = resolveHeroDefinition(heroId, side, allyHeroProfiles);
  if (!definition) {
    throw new Error(`Unknown frontline combatant ${heroId}`);
  }
  return {
    heroId,
    side,
    lane,
    name: definition.name,
    role: definition.role,
    hp: definition.maxHp,
    maxHp: definition.maxHp,
    atk: definition.atk,
    def: definition.def,
    speed: definition.speed,
    shield: 0,
    alive: true,
    stun: 0,
    tempAtk: 0,
    tempShield: 0,
    strikeFirst: false,
  };
}

function createEmptyLanes(
  allySquad: [string, string, string],
  enemySquad: [string, string, string],
  allyHeroProfiles?: FrontlineHeroProfileMap,
) {
  return {
    left: {
      allyHero: buildHeroState(allySquad[0], "ally", "left", allyHeroProfiles),
      enemyHero: buildHeroState(enemySquad[0], "enemy", "left"),
      allySupport: null,
      enemySupport: null,
    },
    center: {
      allyHero: buildHeroState(allySquad[1], "ally", "center", allyHeroProfiles),
      enemyHero: buildHeroState(enemySquad[1], "enemy", "center"),
      allySupport: null,
      enemySupport: null,
    },
    right: {
      allyHero: buildHeroState(allySquad[2], "ally", "right", allyHeroProfiles),
      enemyHero: buildHeroState(enemySquad[2], "enemy", "right"),
      allySupport: null,
      enemySupport: null,
    },
  } satisfies Record<FrontlineLane, FrontlineLaneState>;
}

function pushEvent(state: FrontlineBattleState, event: Omit<FrontlineEvent, "id">) {
  const nextSeq = state.eventSeq + 1;
  state.eventSeq = nextSeq;
  state.events.unshift({ ...event, id: `${state.round}:${state.turn}:${nextSeq}` });
  state.events = state.events.slice(0, 12);
}

function pushResolution(state: FrontlineBattleState, line: string) {
  state.lastResolution.unshift(line);
  state.lastResolution = state.lastResolution.slice(0, 8);
}

function heroDefinition(hero: FrontlineHeroState) {
  return FRONTLINE_UNIT_BY_ID[hero.heroId] as FrontlineHeroDef;
}

function leaderDefinition(leaderId: string) {
  const leader = FRONTLINE_LEADER_BY_ID[leaderId];
  if (!leader) throw new Error(`Unknown frontline leader ${leaderId}`);
  return leader as FrontlineLeaderDef;
}

function otherSide(side: FrontlineSide): FrontlineSide {
  return side === "ally" ? "enemy" : "ally";
}

function ownDeck(state: FrontlineBattleState, side: FrontlineSide) {
  return side === "ally" ? state.allyDeck : state.enemyDeck;
}

function setOwnDeck(state: FrontlineBattleState, side: FrontlineSide, deckState: FrontlineDeckState) {
  if (side === "ally") state.allyDeck = deckState;
  else state.enemyDeck = deckState;
}

function sideCoreKey(side: FrontlineSide) {
  return side === "ally" ? "allyCoreHp" : "enemyCoreHp";
}

function getHeroInLane(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const laneState = state.lanes[lane];
  return side === "ally" ? laneState.allyHero : laneState.enemyHero;
}

function getSupportInLane(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane) {
  const laneState = state.lanes[lane];
  return side === "ally" ? laneState.allySupport : laneState.enemySupport;
}

function setHeroInLane(state: FrontlineBattleState, side: FrontlineSide, lane: FrontlineLane, hero: FrontlineHeroState | null) {
  if (side === "ally") state.lanes[lane].allyHero = hero;
  else state.lanes[lane].enemyHero = hero;
}

function setSupportInLane(
  state: FrontlineBattleState,
  side: FrontlineSide,
  lane: FrontlineLane,
  support: FrontlineSupportState | null,
) {
  if (side === "ally") state.lanes[lane].allySupport = support;
  else state.lanes[lane].enemySupport = support;
}

function dealHeroDamage(hero: FrontlineHeroState, amount: number) {
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

function dealSupportDamage(support: FrontlineSupportState, amount: number) {
  support.hp = Math.max(0, support.hp - amount);
  return amount;
}

function addShield(hero: FrontlineHeroState, amount: number, temporary = false) {
  hero.shield += amount;
  if (temporary) hero.tempShield += amount;
}

function healHero(hero: FrontlineHeroState, amount: number) {
  if (!hero.alive) return 0;
  const next = Math.min(hero.maxHp, hero.hp + amount);
  const healed = next - hero.hp;
  hero.hp = next;
  return healed;
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
      pushEvent(state, { kind: "ko", side, lane, label: `${support.name} breaks`, emphasis: "high" });
    }
    return;
  }

  const hero = getHeroInLane(state, targetSide, lane);
  if (hero) {
    const dealt = dealHeroDamage(hero, amount);
    pushEvent(state, { kind: "damage", side, lane, label: `${source} hits ${hero.name}`, amount: dealt, emphasis: "mid" });
    pushResolution(state, `${source} struck ${hero.name} on ${lane} for ${dealt}.`);
    if (!hero.alive) {
      setHeroInLane(state, targetSide, lane, null);
      pushEvent(state, { kind: "ko", side, lane, label: `${hero.name} falls`, emphasis: "high" });
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
  let value = hero.atk + hero.tempAtk + chantAura(state, hero.side);
  if (trait.type === "flurry" && hero.hp > hero.maxHp / 2) value += trait.atk;
  return value;
}

function breachBonus(hero: FrontlineHeroState | null) {
  if (!hero) return 0;
  const trait = heroDefinition(hero).trait;
  return trait.type === "breach" ? trait.extra : 0;
}

function initiativeForHero(hero: FrontlineHeroState) {
  return (hero.strikeFirst ? 100 : 0) + hero.speed;
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
        pushEvent(state, { kind: "ko", side: actor.side, lane: actor.lane, label: `${support.name} breaks`, emphasis: "mid" });
      }
      return;
    }

    if (enemyHero) {
      let dealt = Math.max(1, damage - Math.floor(enemyHero.def / 2));
      const trait = heroDefinition(hero).trait;
      if (trait.type === "ambush" && enemyHero.hp < enemyHero.maxHp) dealt += trait.bonusVsWounded;
      dealt = dealHeroDamage(enemyHero, dealt);
      pushEvent(state, { kind: "damage", side: actor.side, lane: actor.lane, label: `${hero.name} hits ${enemyHero.name}`, amount: dealt, emphasis: "mid" });
      if (dealt > 0 && trait.type === "lifesteal") {
        const healed = healHero(hero, trait.heal);
        if (healed > 0) {
          pushEvent(state, { kind: "heal", side: actor.side, lane: actor.lane, label: `${hero.name} drains life`, amount: healed, emphasis: "low" });
        }
      }
      if (dealt > 0 && trait.type === "venom" && enemyHero.alive) {
        const venomDealt = dealHeroDamage(enemyHero, trait.damage);
        pushEvent(state, { kind: "damage", side: actor.side, lane: actor.lane, label: `${hero.name} venom burns`, amount: venomDealt, emphasis: "mid" });
      }
      if (!enemyHero.alive) {
        setHeroInLane(state, targetSide, actor.lane, null);
        pushEvent(state, { kind: "ko", side: actor.side, lane: actor.lane, label: `${enemyHero.name} falls`, emphasis: "high" });
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
      pushEvent(state, { kind: "shield", side, lane, label: `${hero.name} braces`, amount: trait.shield, emphasis: "low" });
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
        pushEvent(state, { kind: "heal", side, lane, label: `${hero.name} mends ${targetHero?.name}`, amount: healed, emphasis: "low" });
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
  deck.usedLeaderPower = false;
  deck.powerCooldown = Math.max(0, deck.powerCooldown - 1);
  setOwnDeck(next, side, deck);
  if (side === "ally") next.allyLeaderUsed = false;
  else next.enemyLeaderUsed = false;
  pushEvent(next, { kind: "round", side, label: `${side === "ally" ? "Player" : "Enemy"} turn ${next.round}`, emphasis: "low" });
  return next;
}

export function createFrontlineBattleState(input: {
  seed: number;
  allyLoadout: FrontlineLoadout;
  enemyPreset: FrontlinePreset;
  allyHeroProfiles?: FrontlineHeroProfileMap;
  allyCardProfiles?: FrontlineCardProfileMap;
  allySupportProfiles?: FrontlineSupportProfileMap;
}) {
  const allyLeader = leaderDefinition(input.allyLoadout.leaderId);
  const enemyLeader = leaderDefinition(input.enemyPreset.leaderId);
  const allySquad = input.allyLoadout.squad.map((id, index) => id ?? input.enemyPreset.squad[index]) as [string, string, string];
  const enemySquad = input.enemyPreset.squad;
  const state: FrontlineBattleState = {
    seed: input.seed,
    round: 1,
    turn: "ally",
    winner: null,
    maxRounds: MAX_ROUNDS,
    eventSeq: 0,
    lanes: createEmptyLanes(allySquad, enemySquad, input.allyHeroProfiles),
    allyCoreHp: allyLeader.coreHp,
    enemyCoreHp: enemyLeader.coreHp,
    allyCoreMaxHp: allyLeader.coreHp,
    enemyCoreMaxHp: enemyLeader.coreHp,
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
  };
  return prepareTurn(state, "ally");
}

export function getFrontlineCard(cardId: string, cardProfiles?: FrontlineCardProfileMap) {
  const card = cardProfiles?.[cardId] ?? FRONTLINE_CARD_BY_ID[cardId];
  if (!card) throw new Error(`Unknown frontline card ${cardId}`);
  return card as FrontlineCardDef;
}

function getStateCard(state: FrontlineBattleState, side: FrontlineSide, cardId: string) {
  return getFrontlineCard(cardId, side === "ally" ? state.allyCardProfiles : undefined);
}

function getStateSupport(state: FrontlineBattleState, side: FrontlineSide, supportId: string) {
  return side === "ally" ? state.allySupportProfiles?.[supportId] ?? FRONTLINE_SUPPORT_BY_ID[supportId] : FRONTLINE_SUPPORT_BY_ID[supportId];
}

export function validCardTargets(state: FrontlineBattleState, side: FrontlineSide, cardId: string): FrontlineLane[] {
  const card = getStateCard(state, side, cardId);
  if (ownDeck(state, side).command < card.cost) return [];
  if (!ownDeck(state, side).hand.includes(card.id)) return [];
  if (card.target === "none") return [];
  if (card.target === "ally_front") {
    return FRONTLINE_LANES.filter((lane) => {
      if (card.kind === "summon") return !getSupportInLane(state, side, lane);
      return Boolean(getHeroInLane(state, side, lane));
    });
  }
  if (card.target === "enemy_front") {
    return FRONTLINE_LANES.filter((lane) =>
      card.effect.type === "execute_front"
        ? true
        : Boolean(getHeroInLane(state, otherSide(side), lane) || getSupportInLane(state, otherSide(side), lane)),
    );
  }
  return [...FRONTLINE_LANES];
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

export function playableCards(state: FrontlineBattleState, side: FrontlineSide) {
  return ownDeck(state, side).hand
    .map((cardId) => getStateCard(state, side, cardId))
    .filter((card) => card.cost <= ownDeck(state, side).command);
}

function removeHandCard(deck: FrontlineDeckState, cardId: string) {
  const handIndex = deck.hand.indexOf(cardId);
  if (handIndex === -1) return deck;
  const next = {
    ...deck,
    hand: [...deck.hand],
    discard: [...deck.discard, cardId],
  };
  next.hand.splice(handIndex, 1);
  return next;
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
  if (deck.command < card.cost) return state;
  if (!deck.hand.includes(card.id)) return state;
  if (card.target !== "none" && !lane) return state;
  if (card.target !== "none" && lane && !validCardTargets(next, side, card.id).includes(lane)) return state;

  pushEvent(next, { kind: "card", side, lane, label: `${side === "ally" ? "Play" : "Enemy"} ${card.name}`, emphasis: "low" });
  pushResolution(next, `${side === "ally" ? "You" : "Enemy"} played ${card.name}.`);

  if (card.effect.type === "hero_strike" && lane) {
    const hero = getHeroInLane(next, side, lane);
    if (hero) {
      hero.tempAtk += card.effect.atk;
      if (card.effect.shield) addShield(hero, card.effect.shield, true);
      if (card.effect.strikeFirst) hero.strikeFirst = true;
    }
  } else if (card.effect.type === "front_shot" && lane) {
    applyDirectDamage(next, side, lane, card.effect.damage, card.name);
  } else if (card.effect.type === "rally") {
    for (const targetLane of FRONTLINE_LANES) {
      const hero = getHeroInLane(next, side, targetLane);
      if (!hero) continue;
      hero.tempAtk += card.effect.atk;
      if (card.effect.shield) addShield(hero, card.effect.shield, true);
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
  } else if (card.effect.type === "stun_front" && lane) {
    const hero = getHeroInLane(next, otherSide(side), lane);
    if (hero) {
      hero.stun = Math.max(hero.stun, card.effect.turns);
      pushEvent(next, { kind: "stun", side, lane, label: `${hero.name} is stunned`, emphasis: "mid" });
    }
  } else if (card.effect.type === "execute_front" && lane) {
    const enemySide = otherSide(side);
    if (livingPresence(next, enemySide, lane)) {
      applyDirectDamage(next, side, lane, card.effect.damage, card.name);
    } else if (card.effect.bonusOpenCore) {
      const coreKey = sideCoreKey(enemySide);
      next[coreKey] = Math.max(0, next[coreKey] - card.effect.bonusOpenCore);
      pushEvent(next, { kind: "breach", side, lane, label: `${card.name} cracks the core`, amount: card.effect.bonusOpenCore, emphasis: "high" });
    }
  } else if (card.effect.type === "summon" && lane) {
    const supportDef = getStateSupport(next, side, card.effect.supportId);
    if (supportDef) {
      setSupportInLane(next, side, lane, {
        id: supportDef.id,
        side,
        lane,
        name: supportDef.name,
        hp: supportDef.maxHp,
        maxHp: supportDef.maxHp,
        atk: supportDef.atk,
        duration: supportDef.duration,
        intercepts: supportDef.intercepts,
        effect: supportDef.effect,
      });
      pushEvent(next, { kind: "summon", side, lane, label: `${supportDef.name} enters ${lane}`, emphasis: "mid" });
    }
  }

  const nextDeck = removeHandCard({ ...deck, command: deck.command - card.cost }, card.id);
  setOwnDeck(next, side, nextDeck);
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
  const next = cloneState(state);
  for (const lane of ["center", "left", "right"] as const) {
    applySupportEffectsForLane(next, "ally", lane);
    applySupportEffectsForLane(next, "enemy", lane);
    const actors = actorList(next, lane);
    for (const actor of actors) resolveActorStrike(next, actor);
    cleanupExpiredSupport(next, "ally", lane);
    cleanupExpiredSupport(next, "enemy", lane);
  }

  applyHeroAftermath(next, "ally");
  applyHeroAftermath(next, "enemy");
  applyBreach(next);
  clearClashTemps(next);

  const winner = determineWinner(next);
  if (winner) {
    next.winner = winner;
    return next;
  }

  if (next.turn === "ally") {
    return prepareTurn(next, "enemy");
  }

  next.round += 1;
  const roundWinner = determineWinner(next);
  if (roundWinner) {
    next.winner = roundWinner;
    return next;
  }
  return prepareTurn(next, "ally");
}

function enemyPreferredLanes(state: FrontlineBattleState) {
  return [...FRONTLINE_LANES].sort((left, right) => {
    const leftTarget = getHeroInLane(state, "ally", left);
    const rightTarget = getHeroInLane(state, "ally", right);
    const leftScore = left === "center" ? 4 : 0;
    const rightScore = right === "center" ? 4 : 0;
    const leftHp = leftTarget?.hp ?? 0;
    const rightHp = rightTarget?.hp ?? 0;
    return leftHp - rightHp || rightScore - leftScore;
  });
}

function chooseEnemyTarget(state: FrontlineBattleState, card: FrontlineCardDef): FrontlineLane | null {
  const valid = validCardTargets(state, "enemy", card.id);
  if (!valid.length) return null;
  const preferred = enemyPreferredLanes(state);
  for (const lane of preferred) {
    if (valid.includes(lane)) return lane;
  }
  return valid[0];
}

function enemyShouldUsePower(state: FrontlineBattleState) {
  return validLeaderPowerTargets(state, "enemy")[0] ?? null;
}

export function runEnemyTurn(state: FrontlineBattleState) {
  let next = cloneState(state);
  if (next.turn !== "enemy" || next.winner) return state;
  let playable = playableCards(next, "enemy");
  while (playable.length) {
    const healCard = playable.find((card) => card.effect.type === "heal_front");
    if (healCard) {
      const lowLane = FRONTLINE_LANES.find((lane) => {
        const hero = getHeroInLane(next, "enemy", lane);
        return hero && hero.hp <= hero.maxHp / 2;
      });
      if (lowLane) {
        next = playCard(next, "enemy", healCard.id, lowLane);
        playable = playableCards(next, "enemy");
        continue;
      }
    }

    const summonCard = playable.find((card) => card.kind === "summon");
    const openSummonLane = FRONTLINE_LANES.find((lane) => !getSupportInLane(next, "enemy", lane));
    if (summonCard && openSummonLane) {
      next = playCard(next, "enemy", summonCard.id, openSummonLane);
      playable = playableCards(next, "enemy");
      continue;
    }

    const priority = [...playable].sort((left, right) => right.cost - left.cost || left.id.localeCompare(right.id))[0];
    if (!priority) break;
    const target =
      priority.target === "none"
        ? undefined
        : chooseEnemyTarget(next, priority) ?? undefined;
    next = playCard(next, "enemy", priority.id, target);
    playable = playableCards(next, "enemy");
    if (ownDeck(next, "enemy").command <= 0) break;
  }

  const powerLane = enemyShouldUsePower(next);
  if (powerLane) {
      next = activateLeaderPower(next, "enemy", powerLane);
  }
  return resolveTurn(next);
}

export function frontPresenceScore(heroId: string, heroProfiles?: FrontlineHeroProfileMap) {
  const hero = heroProfiles?.[heroId] ?? FRONTLINE_UNIT_BY_ID[heroId];
  if (!hero) return 0;
  return hero.maxHp + hero.atk * 2 + hero.def * 2 + hero.speed;
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
