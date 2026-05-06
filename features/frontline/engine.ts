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
  FrontlineBattleModifiers,
  FrontlineBattleState,
  FrontlineBossConfig,
  FrontlineBossState,
  FrontlineCardDef,
  FrontlineCardProfileMap,
  FrontlineDeckState,
  FrontlineEvent,
  FrontlineHeroDef,
  FrontlineHeroState,
  FrontlineLaneState,
  FrontlineLeaderDef,
  FrontlinePreset,
  FrontlineSnapshot,
  FrontlineTracedResult,
  FrontlineSupportState,
  FrontlineSupportProfileMap,
} from "./types";
import { getFrontlineBoss } from "./bosses";
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
      exhaustedCardIds: [...state.allyDeck.exhaustedCardIds],
      cardUseCounts: { ...state.allyDeck.cardUseCounts },
    },
    enemyDeck: {
      ...state.enemyDeck,
      deck: [...state.enemyDeck.deck],
      hand: [...state.enemyDeck.hand],
      discard: [...state.enemyDeck.discard],
      exhaustedCardIds: [...state.enemyDeck.exhaustedCardIds],
      cardUseCounts: { ...state.enemyDeck.cardUseCounts },
    },
    allyCardProfiles: state.allyCardProfiles,
    allySupportProfiles: state.allySupportProfiles,
    events: [...state.events],
    lastResolution: [...state.lastResolution],
    bossState: state.bossState ? { ...state.bossState, scorch: { ...state.bossState.scorch } } : null,
  };
}

function battleResolved(state: FrontlineBattleState) {
  return state.allyCoreHp <= 0 || state.enemyCoreHp <= 0 || Boolean(state.winner);
}

function initBossState(boss: FrontlineBossConfig | null): FrontlineBossState | null {
  if (!boss) return null;
  const inferno = boss.signatures.find((sig) => sig.type === "inferno_wave");
  const veil = boss.signatures.find((sig) => sig.type === "twilight_veil");
  return {
    id: boss.id,
    infernoCountdown: inferno && inferno.type === "inferno_wave" ? inferno.cadenceRounds : 0,
    twilightCountdown: veil && veil.type === "twilight_veil" ? veil.cadenceRounds : 0,
    scorch: {},
  };
}

function drawInto(deckState: FrontlineDeckState, amount: number, seed: number) {
  const exhaustedSet = new Set(deckState.exhaustedCardIds);
  const next = {
    ...deckState,
    deck: deckState.deck.filter((id) => !exhaustedSet.has(id)),
    hand: [...deckState.hand],
    discard: deckState.discard.filter((id) => !exhaustedSet.has(id)),
    exhaustedCardIds: [...deckState.exhaustedCardIds],
    cardUseCounts: { ...deckState.cardUseCounts },
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
      exhaustedCardIds: [],
      cardUseCounts: {},
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
  const fullEvent: FrontlineEvent = { ...event, id: `${state.round}:${state.turn}:${nextSeq}` };
  state.events.unshift(fullEvent);
  // Keep enough headroom for a full round of events (cards + clash + signatures + aftermath).
  // The UI slices to a smaller window for display; tests need the full history.
  state.events = state.events.slice(0, 64);
  if (state._trace && isVisibleEventKind(fullEvent)) {
    const snapshot = cloneState(state);
    delete (snapshot as { _trace?: FrontlineSnapshot[] })._trace;
    state._trace.push({ eventId: fullEvent.id, state: snapshot });
  }
}

function isVisibleEventKind(event: FrontlineEvent) {
  if (event.kind === "boss_signature") return event.signature === "cast";
  return (
    event.kind === "damage" ||
    event.kind === "heal" ||
    event.kind === "shield" ||
    event.kind === "ko" ||
    event.kind === "breach" ||
    event.kind === "summon" ||
    event.kind === "stun"
  );
}

function pushResolution(state: FrontlineBattleState, line: string) {
  state.lastResolution.unshift(line);
  state.lastResolution = state.lastResolution.slice(0, 8);
}

function heroDefinition(hero: FrontlineHeroState) {
  const definition = FRONTLINE_UNIT_BY_ID[hero.heroId];
  if (!definition) {
    throw new Error(`Unknown frontline combatant in lane ${hero.lane}: ${hero.heroId}`);
  }
  return definition as FrontlineHeroDef;
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
        pushEvent(state, { kind: "ko", side: actor.side, lane: actor.lane, label: `${support.name} breaks`, emphasis: "mid", subKind: "support" });
      }
      return;
    }

    if (enemyHero) {
      let dealt = Math.max(1, damage - Math.floor(enemyHero.def / 2));
      const trait = heroDefinition(hero).trait;
      if (trait.type === "ambush" && enemyHero.hp < enemyHero.maxHp) dealt += trait.bonusVsWounded;
      dealt = applyHeroDamageWithVeilArmor(state, enemyHero, dealt);
      pushEvent(state, { kind: "damage", side: actor.side, lane: actor.lane, label: `${hero.name} hits ${enemyHero.name}`, amount: dealt, emphasis: "mid" });
      if (dealt > 0) applyCinderMarkOnHit(state, actor.side, actor.lane);
      if (dealt > 0 && trait.type === "lifesteal") {
        const healed = healHero(hero, trait.heal);
        if (healed > 0) {
          pushEvent(state, { kind: "heal", side: actor.side, lane: actor.lane, label: `${hero.name} drains life`, amount: healed, emphasis: "low" });
        }
      }
      if (dealt > 0 && trait.type === "venom" && enemyHero.alive) {
        const venomDealt = applyHeroDamageWithVeilArmor(state, enemyHero, trait.damage);
        pushEvent(state, { kind: "damage", side: actor.side, lane: actor.lane, label: `${hero.name} venom burns`, amount: venomDealt, emphasis: "mid" });
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

function effectiveCardCost(state: FrontlineBattleState, side: FrontlineSide, baseCost: number) {
  if (side === "ally" && state.playerCardCostMod > 0) return baseCost + state.playerCardCostMod;
  return baseCost;
}

export function getEffectiveCardCost(state: FrontlineBattleState, side: FrontlineSide, cardId: string) {
  return effectiveCardCost(state, side, getStateCard(state, side, cardId).cost);
}

export function validCardTargets(state: FrontlineBattleState, side: FrontlineSide, cardId: string): FrontlineLane[] {
  const card = getStateCard(state, side, cardId);
  if (ownDeck(state, side).command < effectiveCardCost(state, side, card.cost)) return [];
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
    .filter((card) => effectiveCardCost(state, side, card.cost) <= ownDeck(state, side).command);
}

function consumeHandCard(deck: FrontlineDeckState, card: FrontlineCardDef) {
  const cardId = card.id;
  const handIndex = deck.hand.indexOf(cardId);
  if (handIndex === -1) return deck;

  const nextUseCounts = { ...deck.cardUseCounts, [cardId]: (deck.cardUseCounts[cardId] ?? 0) + 1 };
  const reachedLimit = card.usesPerBattle != null && nextUseCounts[cardId] >= card.usesPerBattle;

  const newHand = [...deck.hand];
  newHand.splice(handIndex, 1);

  if (reachedLimit) {
    // Card hits its battle-wide limit. Remove every remaining copy from
    // hand + deck + discard and add the id to exhaustedCardIds so reshuffles
    // can never pull it again.
    return {
      ...deck,
      hand: newHand.filter((id) => id !== cardId),
      deck: deck.deck.filter((id) => id !== cardId),
      discard: deck.discard.filter((id) => id !== cardId),
      exhaustedCardIds: deck.exhaustedCardIds.includes(cardId)
        ? deck.exhaustedCardIds
        : [...deck.exhaustedCardIds, cardId],
      cardUseCounts: nextUseCounts,
    };
  }

  return {
    ...deck,
    hand: newHand,
    discard: [...deck.discard, cardId],
    cardUseCounts: nextUseCounts,
  };
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

  // 3. Enemy plays cards & leader power (silent visually — no snapshots from card events).
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

  const skipCardIds = new Set<string>();
  const MAX_ITERATIONS = 24;
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations += 1;
    const playable = playableCards(next, "enemy").filter((card) => !skipCardIds.has(card.id));
    if (!playable.length) break;
    if (ownDeck(next, "enemy").command <= 0) break;

    let chosen: { card: FrontlineCardDef; lane: FrontlineLane | undefined } | null = null;

    const healCard = playable.find((card) => card.effect.type === "heal_front");
    if (healCard) {
      const lowLane = FRONTLINE_LANES.find((lane) => {
        const hero = getHeroInLane(next, "enemy", lane);
        return hero && hero.hp <= hero.maxHp / 2;
      });
      if (lowLane) chosen = { card: healCard, lane: lowLane };
    }

    if (!chosen) {
      const summonCard = playable.find((card) => card.kind === "summon");
      const openSummonLane = FRONTLINE_LANES.find((lane) => !getSupportInLane(next, "enemy", lane));
      if (summonCard && openSummonLane) chosen = { card: summonCard, lane: openSummonLane };
    }

    if (!chosen) {
      const priority = [...playable].sort((left, right) => right.cost - left.cost || left.id.localeCompare(right.id))[0];
      if (!priority) break;
      const target = priority.target === "none" ? undefined : chooseEnemyTarget(next, priority) ?? undefined;
      if (priority.target !== "none" && !target) {
        skipCardIds.add(priority.id);
        continue;
      }
      chosen = { card: priority, lane: target };
    }

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
