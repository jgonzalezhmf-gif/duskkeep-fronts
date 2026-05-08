import type { FrontlineLane, FrontlineSide } from "@/lib/types";
import { FRONTLINE_LANES } from "./data";
import { getFrontlineBoss } from "./bosses";
import type { FrontlineBattleState, FrontlineHeroState } from "./types";
import { getHeroInLane, setHeroInLane } from "./frontlineBattleAccessors";
import { pushEvent } from "./frontlineEvents";
import { dealHeroDamage, healHero } from "./frontlineHealthRules";

export function emberCrownBonus(state: FrontlineBattleState, hero: FrontlineHeroState) {
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

export function applyCinderMarkOnHit(
  state: FrontlineBattleState,
  attackerSide: FrontlineSide,
  lane: FrontlineLane,
) {
  if (attackerSide !== "enemy" || !state.bossState) return;
  const boss = getFrontlineBoss(state.bossState.id);
  if (!boss) return;
  const cinder = boss.signatures.find((sig) => sig.type === "cinder_mark");
  if (!cinder) return;
  const isSegmentLane = boss.segments.some((seg) => seg.lane === lane);
  if (!isSegmentLane) return;
  state.bossState.scorch[lane] = (state.bossState.scorch[lane] ?? 0) + 1;
}

export function tickBossSignatures(state: FrontlineBattleState) {
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

export function consumeCinderMark(state: FrontlineBattleState) {
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

export function applyHeroDamageWithVeilArmor(
  state: FrontlineBattleState,
  hero: FrontlineHeroState,
  amount: number,
) {
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

export function applySoulDrain(
  state: FrontlineBattleState,
  attacker: FrontlineHeroState,
  lane: FrontlineLane,
) {
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
