"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ArtPortrait from "@/components/ui/ArtPortrait";
import GameAssetIcon from "@/components/ui/GameAssetIcon";
import GameGlyph from "@/components/ui/GameGlyph";
import { CardTypeIcon } from "@/components/game/shared/CardTypeIcon";
import { ResourceIcon } from "@/components/game/shared/ResourceIcon";
import { StatusIcon, type StatusIconName } from "@/components/game/shared/StatusIcon";
import {
  FRONTLINE_CARD_BY_ID,
  FRONTLINE_LANES,
  FRONTLINE_LEADER_BY_ID,
  FRONTLINE_UNIT_BY_ID,
} from "@/features/frontline/data";
import {
  activateLeaderPower,
  createFrontlineBattleState,
  getEnemyPreset,
  getFrontlineCard,
  playCard,
  resolveTurn,
  runEnemyTurn,
  validCardTargets,
  validLeaderPowerTargets,
} from "@/features/frontline/engine";
import type {
  FrontlineBattleModifiers,
  FrontlineBattleState,
  FrontlineCardDef,
  FrontlineCardProfileMap,
  FrontlineEvent,
  FrontlineSupportProfileMap,
} from "@/features/frontline/types";
import type { FrontlineHeroProfileMap } from "@/features/frontline/heroProfile";
import { previewCardOutcome, type FrontlinePreview } from "@/features/frontline/preview";
import { getBattleBackdrop, getLeaderPortrait } from "@/lib/art";
import { audio, sfx } from "@/lib/audio";
import { cn } from "@/lib/cn";
import {
  getFrontlineEnemyLeaderPortraitForPreset,
  getFrontlineLeaderPortraitSrc,
} from "@/lib/frontlineLeaderPortraitAssets";
import type { CombatAssetIconName, GameAssetIconSize } from "@/lib/iconAssets";
import {
  frontlineCardEffectSummary,
  frontlineCardDescription,
  frontlineCardKindLabel,
  frontlineCardName,
  frontlineCardShortTargetLabel,
  frontlineLeaderName,
  frontlineLeaderPowerDescription,
  frontlineLeaderPowerName,
  frontlinePresetName,
  frontlineSupportName,
  frontlineTraitInfo,
  tx,
  type TranslateFn,
} from "@/lib/i18n/frontlineText";
import { useI18n } from "@/lib/i18n/useI18n";
import type { FrontlineLane, FrontlineLoadout, FrontlineSide } from "@/lib/types";
import { getFrontlineBossAssetSrc, getFrontlineCardVisualAsset, getFrontlineHeroVisualAsset } from "./frontlineVisualAssets";
import { getFrontlineBoss } from "@/features/frontline/bosses";
import type { FrontlineBossConfig, FrontlineBossSegmentConfig } from "@/features/frontline/types";

export type FrontlineEncounterBadgeKind = "elite" | "boss" | "danger";

type Props = {
  seed: number;
  loadout: FrontlineLoadout;
  enemyPresetId: string;
  allyHeroProfiles?: FrontlineHeroProfileMap;
  allyCardProfiles?: FrontlineCardProfileMap;
  allySupportProfiles?: FrontlineSupportProfileMap;
  modifiers?: FrontlineBattleModifiers;
  encounterKind?: FrontlineEncounterBadgeKind | null;
  encounterTitle?: string | null;
  onFinished: (winner: "ally" | "enemy" | "draw", state: FrontlineBattleState) => void;
};

type LaneInsight = {
  lane: FrontlineLane;
  allyScore: number;
  enemyScore: number;
  status: "ally_edge" | "enemy_edge" | "open_breach" | "breach_threat" | "even" | "vacant";
  priority: number;
  allyLow: boolean;
  enemyLow: boolean;
  breachSide: "ally" | "enemy" | null;
};

type ResolutionFx = {
  id: number;
  events: FrontlineEvent[];
  activeIndex: number;
};

type CardPlayFx = {
  id: number;
  cardId: string;
  lane: FrontlineLane | null;
  targetSide: "ally" | "enemy" | "both" | null;
  tone: VisualFxTone;
  events: FrontlineEvent[];
};

type BattleFinishFx = {
  winner: "ally" | "enemy" | "draw";
};

type DeathGhostFx = {
  eventId: string;
  lane: FrontlineLane;
  targetSide: "ally" | "enemy";
  actor: NonNullable<FrontlineBattleState["lanes"]["left"]["allyHero"]>;
};

type VisualFxTone = "damage" | "heal" | "shield" | "breach" | "ko" | "summon" | "stun" | "power";

function combatIconForTone(tone: VisualFxTone): CombatAssetIconName {
  if (tone === "heal") return "heal";
  if (tone === "shield") return "shield";
  if (tone === "breach") return "breach";
  if (tone === "summon") return "summon";
  if (tone === "stun") return "stun";
  if (tone === "power") return "leader_power";
  return "attack";
}

function combatIconForEvent(event: Pick<FrontlineEvent, "kind"> | null | undefined): CombatAssetIconName {
  if (event?.kind === "breach") return "breach";
  if (event?.kind === "shield") return "shield";
  if (event?.kind === "heal") return "heal";
  if (event?.kind === "summon") return "summon";
  if (event?.kind === "stun") return "stun";
  if (event?.kind === "power") return "leader_power";
  if (event?.kind === "ko") return "danger";
  if (event?.kind === "boss_signature") return "leader_power";
  return "attack";
}

function combatIconForLaneStatus(status: LaneInsight["status"]): CombatAssetIconName {
  if (status === "open_breach") return "breach";
  if (status === "breach_threat" || status === "enemy_edge") return "danger";
  if (status === "ally_edge") return "advantage";
  if (status === "vacant") return "target";
  return "clash";
}

function combatIconForCard(card: FrontlineCardDef): CombatAssetIconName {
  if (card.kind === "summon" || card.effect.type === "summon") return "summon";
  if (card.effect.type === "heal_front") return "heal";
  if (card.effect.type === "stun_front") return "stun";
  if (card.effect.type === "hero_strike" && card.effect.shield) return "shield";
  if (card.effect.type === "rally") return "leader_power";
  return "attack";
}

function statusIconForCard(card: FrontlineCardDef): StatusIconName | null {
  if (card.effect.type === "hero_strike") {
    if (card.effect.shield) return "guard";
    if (card.effect.strikeFirst) return "rush";
  }
  if (card.effect.type === "rally") return "buff";
  if (card.effect.type === "heal_front") return "regen";
  if (card.effect.type === "stun_front") return "debuff";
  return null;
}

type HeroVisualState = {
  idle?: boolean;
  selected?: boolean;
  targeted?: boolean;
  attacking?: boolean;
  hit?: boolean;
  shielded?: boolean;
  healed?: boolean;
  ko?: boolean;
  breachSource?: boolean;
  damaged?: boolean;
  summoned?: boolean;
  floatLabel?: string;
  floatTone?: VisualFxTone;
};

function laneEntityScore(
  hero: FrontlineBattleState["lanes"]["left"]["allyHero"],
  support: FrontlineBattleState["lanes"]["left"]["allySupport"],
) {
  const heroScore = hero ? hero.hp + hero.shield + (hero.atk + hero.tempAtk) * 2 + hero.def * 2 : 0;
  const supportScore = support ? support.hp + support.atk * 2 + support.duration * 2 : 0;
  return heroScore + supportScore;
}

function laneBreachValue(lane: FrontlineLane) {
  return lane === "center" ? 3 : 2;
}

function analyzeLane(state: FrontlineBattleState, lane: FrontlineLane): LaneInsight {
  const laneState = state.lanes[lane];
  const allyScore = laneEntityScore(laneState.allyHero, laneState.allySupport);
  const enemyScore = laneEntityScore(laneState.enemyHero, laneState.enemySupport);
  const allyPresent = Boolean(laneState.allyHero || laneState.allySupport);
  const enemyPresent = Boolean(laneState.enemyHero || laneState.enemySupport);
  const allyLow = Boolean(laneState.allyHero && laneState.allyHero.hp <= Math.ceil(laneState.allyHero.maxHp * 0.4));
  const enemyLow = Boolean(laneState.enemyHero && laneState.enemyHero.hp <= Math.ceil(laneState.enemyHero.maxHp * 0.4));

  if (allyPresent && !enemyPresent) {
    return {
      lane,
      allyScore,
      enemyScore,
      status: "open_breach",
      priority: lane === "center" ? 98 : 90,
      allyLow,
      enemyLow,
      breachSide: "ally",
    };
  }
  if (!allyPresent && enemyPresent) {
    return {
      lane,
      allyScore,
      enemyScore,
      status: "breach_threat",
      priority: lane === "center" ? 110 : 100,
      allyLow,
      enemyLow,
      breachSide: "enemy",
    };
  }
  if (!allyPresent && !enemyPresent) {
    return {
      lane,
      allyScore,
      enemyScore,
      status: "vacant",
      priority: lane === "center" ? 38 : 26,
      allyLow,
      enemyLow,
      breachSide: null,
    };
  }

  const diff = allyScore - enemyScore;
  if (diff >= 10) {
    return {
      lane,
      allyScore,
      enemyScore,
      status: "ally_edge",
      priority: allyLow ? 62 : 42,
      allyLow,
      enemyLow,
      breachSide: null,
    };
  }
  if (diff <= -10) {
    return {
      lane,
      allyScore,
      enemyScore,
      status: "enemy_edge",
      priority: lane === "center" ? 92 : 78,
      allyLow,
      enemyLow,
      breachSide: null,
    };
  }

  return {
    lane,
    allyScore,
    enemyScore,
    status: "even",
    priority: lane === "center" ? 60 : 50,
    allyLow,
    enemyLow,
    breachSide: null,
  };
}

function laneStatusTitle(t: TranslateFn, status: LaneInsight["status"]) {
  if (status === "open_breach") return t("frontline.statusBreach");
  if (status === "breach_threat") return t("frontline.statusDanger");
  if (status === "vacant") return t("frontline.statusOpen");
  if (status === "ally_edge") return t("frontline.statusEdge");
  if (status === "enemy_edge") return t("frontline.statusUnder");
  return t("frontline.statusEven");
}

function laneStatusSubtitle(t: TranslateFn, lane: FrontlineLane, status: LaneInsight["status"]) {
  if (status === "open_breach") return t("frontline.subtitleBreach", { amount: laneBreachValue(lane) });
  if (status === "breach_threat") return t("frontline.subtitleDanger", { amount: laneBreachValue(lane) });
  if (status === "vacant") return t("frontline.subtitleVacant");
  if (status === "ally_edge") return t("frontline.subtitleAllyEdge");
  if (status === "enemy_edge") return t("frontline.subtitleEnemyEdge");
  return t("frontline.subtitleEven");
}

function laneLabel(t: TranslateFn, lane: FrontlineLane) {
  if (lane === "left") return t("frontline.left");
  if (lane === "center") return t("frontline.center");
  return t("frontline.right");
}

function impactTone(kind: FrontlineBattleState["events"][number]["kind"] | undefined) {
  if (kind === "breach" || kind === "ko") return "high";
  if (kind === "damage" || kind === "power" || kind === "stun") return "mid";
  return "low";
}

function isResolutionEvent(event: FrontlineEvent) {
  return (
    event.kind === "damage" ||
    event.kind === "breach" ||
    event.kind === "ko" ||
    event.kind === "shield" ||
    event.kind === "heal" ||
    event.kind === "summon" ||
    event.kind === "stun" ||
    (event.kind === "boss_signature" && event.signature === "cast")
  );
}

function oppositeSide(side: "ally" | "enemy") {
  return side === "ally" ? "enemy" : "ally";
}

function eventImpactsSide(event: FrontlineEvent, side: "ally" | "enemy") {
  if (!event.side) return false;
  if (event.kind === "damage" || event.kind === "ko" || event.kind === "stun") return event.side !== side;
  if (event.kind === "heal" || event.kind === "shield") return event.side === side;
  return false;
}

function eventSourcesSide(event: FrontlineEvent, side: "ally" | "enemy") {
  if (!event.side) return false;
  return event.side === side && (event.kind === "damage" || event.kind === "stun" || event.kind === "ko");
}

function eventBoostsSide(event: FrontlineEvent | null, side: "ally" | "enemy") {
  if (!event?.side) return false;
  return event.side === side && (event.kind === "heal" || event.kind === "shield" || event.kind === "summon");
}

function visualToneFromEvent(event: FrontlineEvent): VisualFxTone {
  if (event.kind === "heal") return "heal";
  if (event.kind === "shield") return "shield";
  if (event.kind === "breach") return "breach";
  if (event.kind === "ko") return "ko";
  if (event.kind === "summon") return "summon";
  if (event.kind === "stun") return "stun";
  return "damage";
}

function visualToneFromCard(card: FrontlineCardDef): VisualFxTone {
  if (card.kind === "summon") return "summon";
  if (card.effect.type === "heal_front") return "heal";
  if (card.effect.type === "hero_strike" && card.effect.shield) return "shield";
  if (card.effect.type === "rally") return "power";
  if (card.effect.type === "stun_front") return "stun";
  return "damage";
}

function visualTargetSideForCard(card: FrontlineCardDef): "ally" | "enemy" | "both" | null {
  if (card.target === "ally_front") return "ally";
  if (card.target === "enemy_front") return "enemy";
  if (card.target === "any_front") return "both";
  return null;
}

function visualTargetSideForLeader(effectType: "beam" | "rally"): "ally" | "enemy" {
  return effectType === "beam" ? "enemy" : "ally";
}

function collectNewEvents(previous: FrontlineBattleState, next: FrontlineBattleState) {
  const previousEventIds = new Set(previous.events.map((event) => event.id));
  return next.events.filter((event) => !previousEventIds.has(event.id)).reverse();
}

function eventDuration(event: FrontlineEvent) {
  if (event.kind === "breach") return 1900;
  if (event.kind === "ko") return 1750;
  if (event.kind === "summon") return 1450;
  if (event.kind === "boss_signature" && event.signature === "cast") return 1850;
  if (event.kind === "heal" || event.kind === "shield" || event.kind === "stun") return 1350;
  return 1500;
}

function resolutionSequenceDuration(events: FrontlineEvent[]) {
  const meaningfulEvents = events.filter(isResolutionEvent).slice(0, 12);
  if (!meaningfulEvents.length) return 1800;
  return Math.min(
    15000,
    meaningfulEvents.reduce((total, event) => total + eventDuration(event), 0) + 2300,
  );
}

function collectDeathGhosts(previous: FrontlineBattleState, events: FrontlineEvent[]) {
  return events.flatMap((event) => {
    if (event.kind !== "ko" || !event.lane) return [];
    if (event.subKind && event.subKind !== "hero") return [];
    const targetSide = eventPrimaryTargetSide(event);
    if (!targetSide) return [];
    const actor = targetSide === "ally" ? previous.lanes[event.lane].allyHero : previous.lanes[event.lane].enemyHero;
    if (!actor || !actor.alive) return [];
    return [{ eventId: event.id, lane: event.lane, targetSide, actor }];
  });
}

function sideMatchesTarget(side: "ally" | "enemy", targetSide: CardPlayFx["targetSide"]) {
  return targetSide === "both" || targetSide === side;
}

function eventPrimaryTargetSide(event: FrontlineEvent): "ally" | "enemy" | null {
  if (!event.side) return null;
  if (event.kind === "damage" || event.kind === "ko" || event.kind === "stun") return oppositeSide(event.side);
  if (event.kind === "heal" || event.kind === "shield" || event.kind === "summon") return event.side;
  return null;
}

function cardPlayEventForSide(cardFx: CardPlayFx | null, lane: FrontlineLane, side: "ally" | "enemy") {
  if (!cardFx) return null;
  return (
    cardFx.events.find((event) => event.lane === lane && eventPrimaryTargetSide(event) === side) ??
    (cardFx.lane === lane && sideMatchesTarget(side, cardFx.targetSide) ? cardFx.events[0] ?? null : null)
  );
}

function heroVisualState(input: {
  side: "ally" | "enemy";
  focused: boolean;
  targeted: boolean;
  activeEvent: FrontlineEvent | null;
  cardFx: CardPlayFx | null;
  cardEvent: FrontlineEvent | null;
}) {
  const { side, focused, targeted, activeEvent, cardFx, cardEvent } = input;
  const cardTone = cardFx && cardEvent ? cardFx.tone : null;
  const eventHit = activeEvent ? eventImpactsSide(activeEvent, side) : false;
  const cardHit = cardEvent ? eventImpactsSide(cardEvent, side) : false;
  const shielded = Boolean((activeEvent?.kind === "shield" && eventBoostsSide(activeEvent, side)) || cardTone === "shield");
  const healed = Boolean((activeEvent?.kind === "heal" && eventBoostsSide(activeEvent, side)) || cardTone === "heal");
  const summoned = Boolean((activeEvent?.kind === "summon" && eventBoostsSide(activeEvent, side)) || cardTone === "summon");
  const damaged = Boolean((activeEvent?.kind === "damage" && eventHit) || (cardEvent?.kind === "damage" && cardHit));
  const ko = Boolean((activeEvent?.kind === "ko" && eventHit) || (cardEvent?.kind === "ko" && cardHit));
  const breachSource = Boolean(activeEvent?.kind === "breach" && activeEvent.side === side);
  const attacking = Boolean(
    (activeEvent && (eventSourcesSide(activeEvent, side) || breachSource)) ||
      (cardFx?.lane && cardFx.targetSide === "enemy" && side === "ally"),
  );
  const floatEvent =
    eventHit || eventBoostsSide(activeEvent, side) || breachSource
      ? activeEvent
      : cardHit || eventBoostsSide(cardEvent, side)
        ? cardEvent
        : null;

  return {
    idle: true,
    selected: focused,
    targeted,
    attacking,
    hit: damaged || ko || cardHit,
    shielded,
    healed,
    ko,
    breachSource,
    damaged,
    summoned,
    floatLabel: floatEvent ? eventFloatLabel(floatEvent) : undefined,
    floatTone: floatEvent ? visualToneFromEvent(floatEvent) : cardTone ?? undefined,
  } satisfies HeroVisualState;
}

function eventFloatLabel(event: FrontlineEvent) {
  if (event.kind === "breach") return `BREACH -${event.amount ?? ""}`;
  if (event.kind === "ko") return "KO";
  if (event.kind === "heal") return `+${event.amount ?? ""}`;
  if (event.kind === "shield") return `SHD +${event.amount ?? ""}`;
  if (event.kind === "damage") return `-${event.amount ?? ""}`;
  if (event.kind === "summon") return "SUMMON";
  if (event.kind === "stun") return "STUN";
  return event.label;
}

function playFrontlineCardSfx(cardId: string, tone: VisualFxTone) {
  if (cardId.startsWith("leader:")) {
    sfx.leaderPower();
  } else {
    const card = FRONTLINE_CARD_BY_ID[cardId];
    if (card?.kind === "order") sfx.cardOrder();
    else if (card?.kind === "tactic") sfx.cardTactic();
    else if (card?.kind === "summon") sfx.cardSummon();
    else sfx.ability();
  }
  if (tone === "heal") window.setTimeout(() => sfx.heal(), 260);
  if (tone === "shield") window.setTimeout(() => sfx.shield(), 260);
  if (tone === "breach") window.setTimeout(() => sfx.breach(), 320);
  if (tone === "summon") window.setTimeout(() => sfx.summon(), 260);
}

const FEMALE_HERO_IDS = new Set(["kara", "mira", "tovi", "lyria", "fenra"]);

function playDeathVoiceForGhost(ghost: DeathGhostFx | undefined) {
  if (!ghost) {
    sfx.death();
    return;
  }
  if (ghost.targetSide !== "ally") {
    sfx.deathMonster();
    return;
  }
  if (FEMALE_HERO_IDS.has(ghost.actor.heroId)) {
    sfx.deathHumanFemale();
    return;
  }
  sfx.deathHumanMale();
}

function playFrontlineResolutionSfx(event: FrontlineEvent, ghosts: DeathGhostFx[]) {
  if (event.kind === "damage" || event.kind === "stun") {
    sfx.attack();
    window.setTimeout(() => sfx.hit(), 420);
    return;
  }
  if (event.kind === "ko") {
    sfx.hit();
    const ghost = ghosts.find((entry) => entry.eventId === event.id);
    window.setTimeout(() => playDeathVoiceForGhost(ghost), 360);
    return;
  }
  if (event.kind === "breach") {
    sfx.coreDamage();
    return;
  }
  if (event.kind === "heal") {
    sfx.heal();
    return;
  }
  if (event.kind === "shield") {
    sfx.shield();
    return;
  }
  if (event.kind === "summon") {
    sfx.summon();
    return;
  }
  if (event.kind === "power") {
    sfx.leaderPower();
    return;
  }
  if (event.kind === "boss_signature" && event.signature === "cast") {
    sfx.coreDamage();
    window.setTimeout(() => sfx.breach(), 220);
  }
}

function eventFloatClass(event: FrontlineEvent) {
  if (event.kind === "breach") return "top-[48%] bg-[#f5c451] text-[#221509] shadow-[0_0_28px_rgba(245,196,81,0.44)]";
  if (event.kind === "summon") return "top-[70%] bg-emerald-200 text-[#06140b] shadow-[0_0_24px_rgba(75,224,141,0.36)]";
  if (event.kind === "stun") return "top-[25%] bg-[#f5c451] text-[#221509] shadow-[0_0_24px_rgba(245,196,81,0.36)]";
  if (event.kind === "heal" || event.kind === "shield") {
    return event.side === "ally"
      ? "top-[70%] bg-[#65d2c8] text-[#061414] shadow-[0_0_24px_rgba(101,210,200,0.36)]"
      : "top-[25%] bg-[#65d2c8] text-[#061414] shadow-[0_0_24px_rgba(101,210,200,0.36)]";
  }
  return event.side === "ally"
    ? "top-[25%] bg-[#ff6f7d] text-white shadow-[0_0_24px_rgba(240,95,114,0.38)]"
    : "top-[70%] bg-[#ff6f7d] text-white shadow-[0_0_24px_rgba(240,95,114,0.38)]";
}

function laneStatusMeta(t: TranslateFn, insight: LaneInsight) {
  if (insight.status === "open_breach") {
    return { tone: "ally" as const, label: t("frontline.statusBreach"), detail: `${laneBreachValue(insight.lane)}` };
  }
  if (insight.status === "breach_threat") {
    return { tone: "enemy" as const, label: t("frontline.statusDanger"), detail: `${laneBreachValue(insight.lane)}` };
  }
  if (insight.status === "ally_edge") {
    return { tone: "ally" as const, label: t("frontline.statusEdge"), detail: "" };
  }
  if (insight.status === "enemy_edge") {
    return { tone: "enemy" as const, label: t("frontline.statusUnder"), detail: "" };
  }
  if (insight.status === "vacant") {
    return { tone: "neutral" as const, label: t("frontline.statusOpen"), detail: "" };
  }
  return { tone: "neutral" as const, label: t("frontline.statusEven"), detail: "" };
}

function cardFamilyLabel(t: TranslateFn, card: FrontlineCardDef) {
  return frontlineCardKindLabel(t, card);
}

function cardTargetLabel(t: TranslateFn, card: FrontlineCardDef) {
  return frontlineCardShortTargetLabel(t, card);
}

function cardEffectSummary(t: TranslateFn, card: FrontlineCardDef) {
  return frontlineCardEffectSummary(t, card);
}

function cardTone(card: FrontlineCardDef) {
  if (card.kind === "order") return "order";
  if (card.kind === "tactic") return "tactic";
  return "summon";
}

function shouldCoreFlash(event: FrontlineEvent | null | undefined, attackerSide: FrontlineSide) {
  if (!event || event.side !== attackerSide) return false;
  return event.kind === "breach" || event.kind === "damage";
}

function nextActionLabel(
  state: FrontlineBattleState,
  t: TranslateFn,
  allyLeaderName: string,
  selectedCard: FrontlineCardDef | null,
  selectedLeaderPower: boolean,
) {
  if (state.turn === "enemy") return { title: t("frontline.enemy"), subtitle: t("frontline.resolving") };
  if (selectedLeaderPower) return { title: t("frontline.pickFront"), subtitle: allyLeaderName };
  if (selectedCard) return { title: t("frontline.pickFront"), subtitle: frontlineCardName(t, selectedCard) };
  if (state.allyDeck.command <= 0) return { title: t("frontline.resolve"), subtitle: t("frontline.clashReady") };
  return { title: t("frontline.playCard"), subtitle: t("frontline.spendCommand") };
}

export default function FrontlineBattle({
  seed,
  loadout,
  enemyPresetId,
  allyHeroProfiles,
  allyCardProfiles,
  allySupportProfiles,
  modifiers,
  encounterKind,
  encounterTitle,
  onFinished,
}: Props) {
  const { t } = useI18n();
  const [state, setState] = useState<FrontlineBattleState>(() =>
    createFrontlineBattleState({
      seed,
      allyLoadout: loadout,
      enemyPreset: getEnemyPreset(enemyPresetId),
      allyHeroProfiles,
      allyCardProfiles,
      allySupportProfiles,
      modifiers,
    }),
  );
  const [focusedLane, setFocusedLane] = useState<FrontlineLane | null>(null);
  const [resolutionFx, setResolutionFx] = useState<ResolutionFx | null>(null);
  const [cardPlayFx, setCardPlayFx] = useState<CardPlayFx | null>(null);
  const [finishFx, setFinishFx] = useState<BattleFinishFx | null>(null);
  const [deathGhosts, setDeathGhosts] = useState<DeathGhostFx[]>([]);
  const [coreShock, setCoreShock] = useState<{ side: "ally" | "enemy"; amount: number; key: number } | null>(null);
  const finishedRef = useRef(false);
  const fxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardFxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishOverlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishDoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishDelayRef = useRef(1800);
  const fxIdRef = useRef(0);
  const playedFxEventIdRef = useRef<string | null>(null);
  const finishStingerPlayedRef = useRef(false);
  const prevCoreRef = useRef({ ally: 0, enemy: 0 });
  const coreShockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coreShockIdRef = useRef(0);
  const backdrop = useMemo(() => getBattleBackdrop(seed), [seed]);

  useEffect(() => {
    finishedRef.current = false;
    playedFxEventIdRef.current = null;
    finishStingerPlayedRef.current = false;
    finishDelayRef.current = 1800;
    setFocusedLane(null);
    setResolutionFx(null);
    setCardPlayFx(null);
    setFinishFx(null);
    setDeathGhosts([]);
    if (finishOverlayTimerRef.current) clearTimeout(finishOverlayTimerRef.current);
    if (finishDoneTimerRef.current) clearTimeout(finishDoneTimerRef.current);
    setState(
      createFrontlineBattleState({
        seed,
        allyLoadout: loadout,
        enemyPreset: getEnemyPreset(enemyPresetId),
        allyHeroProfiles,
        allyCardProfiles,
        allySupportProfiles,
        modifiers,
      }),
    );
  }, [allyCardProfiles, allyHeroProfiles, allySupportProfiles, enemyPresetId, loadout, modifiers, seed]);

  useEffect(() => {
    return () => {
      if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
      if (cardFxTimerRef.current) clearTimeout(cardFxTimerRef.current);
      if (finishOverlayTimerRef.current) clearTimeout(finishOverlayTimerRef.current);
      if (finishDoneTimerRef.current) clearTimeout(finishDoneTimerRef.current);
      if (coreShockTimerRef.current) clearTimeout(coreShockTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const ally = state.allyCoreHp;
    const enemy = state.enemyCoreHp;
    const prev = prevCoreRef.current;
    if (prev.ally === 0 && prev.enemy === 0) {
      prevCoreRef.current = { ally, enemy };
      return;
    }
    const allyLoss = Math.max(0, prev.ally - ally);
    const enemyLoss = Math.max(0, prev.enemy - enemy);
    if (allyLoss > 0 || enemyLoss > 0) {
      coreShockIdRef.current += 1;
      const id = coreShockIdRef.current;
      const side: "ally" | "enemy" = allyLoss >= enemyLoss ? "ally" : "enemy";
      const amount = side === "ally" ? allyLoss : enemyLoss;
      setCoreShock({ side, amount, key: id });
      sfx.coreDamage();
      if (coreShockTimerRef.current) clearTimeout(coreShockTimerRef.current);
      coreShockTimerRef.current = setTimeout(() => {
        setCoreShock((current) => (current?.key === id ? null : current));
      }, 950);
    }
    prevCoreRef.current = { ally, enemy };
  }, [state.allyCoreHp, state.enemyCoreHp]);

  function showResolutionFx(events: FrontlineEvent[]) {
    const meaningfulEvents = events.filter(isResolutionEvent).slice(0, 12);
    if (!meaningfulEvents.length) return;
    fxIdRef.current += 1;
    setResolutionFx({ id: fxIdRef.current, events: meaningfulEvents, activeIndex: 0 });
  }

  useEffect(() => {
    if (!resolutionFx) return;
    const activeEvent = resolutionFx.events[resolutionFx.activeIndex];
    if (!activeEvent) {
      setResolutionFx(null);
      return;
    }
    if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
    fxTimerRef.current = setTimeout(() => {
      setResolutionFx((current) => {
        if (!current || current.id !== resolutionFx.id) return current;
        const nextIndex = current.activeIndex + 1;
        return nextIndex < current.events.length ? { ...current, activeIndex: nextIndex } : null;
      });
    }, eventDuration(activeEvent));
    return () => {
      if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
    };
  }, [resolutionFx]);

  useEffect(() => {
    if (state.turn !== "enemy" || state.winner) return;
    const previous = state;
    const timeout = setTimeout(() => {
      const next = runEnemyTurn(previous);
      const newEvents = collectNewEvents(previous, next);
      setDeathGhosts(collectDeathGhosts(previous, newEvents));
      finishDelayRef.current = next.winner ? resolutionSequenceDuration(newEvents) : 1800;
      setState(next);
      showResolutionFx(newEvents);
      if (!next.winner && next.turn === "ally") {
        window.setTimeout(() => sfx.turnStart(), Math.max(380, resolutionSequenceDuration(newEvents) - 420));
      }
    }, 700);
    return () => clearTimeout(timeout);
  }, [state]);

  useEffect(() => {
    if (!state.winner || finishedRef.current) return;
    finishedRef.current = true;
    audio.setTheme("postbattle");
    if (!finishStingerPlayedRef.current) {
      finishStingerPlayedRef.current = true;
      if (state.winner === "ally") window.setTimeout(() => sfx.victory(), 160);
      else if (state.winner === "enemy") window.setTimeout(() => sfx.defeat(), 160);
    }
    const winner = state.winner;
    const finalState = state;
    const delay = finishDelayRef.current;
    if (finishOverlayTimerRef.current) clearTimeout(finishOverlayTimerRef.current);
    if (finishDoneTimerRef.current) clearTimeout(finishDoneTimerRef.current);
    finishOverlayTimerRef.current = setTimeout(() => setFinishFx({ winner }), Math.max(500, delay - 1750));
    finishDoneTimerRef.current = setTimeout(() => onFinished(winner, finalState), delay);
  }, [onFinished, state, state.winner]);

  const allyLeader = FRONTLINE_LEADER_BY_ID[state.allyDeck.leaderId];
  const selectedCard = state.selectedCardId ? state.allyCardProfiles?.[state.selectedCardId] ?? FRONTLINE_CARD_BY_ID[state.selectedCardId] : null;
  const targetableLanes = useMemo(() => {
    if (state.selectedLeaderPower) return validLeaderPowerTargets(state, "ally");
    if (selectedCard) return validCardTargets(state, "ally", selectedCard.id);
    return [];
  }, [selectedCard, state]);

  const laneInsights = useMemo(
    () =>
      FRONTLINE_LANES.map((lane) => analyzeLane(state, lane)).sort((left, right) => right.priority - left.priority),
    [state.lanes], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const priorityLane = laneInsights[0];
  const displayLane = focusedLane ?? priorityLane.lane;
  const displayInsight = laneInsights.find((entry) => entry.lane === displayLane) ?? priorityLane;
  const latestImpact = state.events[0] ?? null;
  const latestFeed = state.events.slice(0, 8);
  const bossConfig = useMemo(() => getFrontlineBoss(state.bossState?.id), [state.bossState?.id]);
  const bossSegmentByLane = useMemo(() => {
    const map: Partial<Record<FrontlineLane, FrontlineBossSegmentConfig>> = {};
    if (bossConfig) for (const seg of bossConfig.segments) map[seg.lane] = seg;
    return map;
  }, [bossConfig]);

  const previewOutcome = useMemo<FrontlinePreview | null>(() => {
    if (state.selectedLeaderPower || !selectedCard) return null;
    if (selectedCard.target === "none") {
      return previewCardOutcome(state, "ally", selectedCard.id);
    }
    const lane = focusedLane && targetableLanes.includes(focusedLane) ? focusedLane : null;
    if (!lane) return null;
    return previewCardOutcome(state, "ally", selectedCard.id, lane);
  }, [focusedLane, selectedCard, state, targetableLanes]);
  const allyLeaderPowerName = frontlineLeaderPowerName(t, allyLeader);
  const allyLeaderPowerDescription = frontlineLeaderPowerDescription(t, allyLeader);
  const actionState = nextActionLabel(state, t, allyLeaderPowerName, selectedCard, state.selectedLeaderPower);
  const activeResolutionEvent = resolutionFx?.events[resolutionFx.activeIndex] ?? null;
  const selectedTargetSide = selectedCard
    ? visualTargetSideForCard(selectedCard)
    : state.selectedLeaderPower
      ? visualTargetSideForLeader(allyLeader.power.effect.type)
      : null;
  const actionsLocked = Boolean(resolutionFx || finishFx) || state.turn !== "ally" || !!state.winner;

  useEffect(() => {
    if (!activeResolutionEvent) return;
    if (playedFxEventIdRef.current === activeResolutionEvent.id) return;
    playedFxEventIdRef.current = activeResolutionEvent.id;
    playFrontlineResolutionSfx(activeResolutionEvent, deathGhosts);
  }, [activeResolutionEvent, deathGhosts]);

  function resetSelection(next: FrontlineBattleState, nextFocusedLane?: FrontlineLane | null) {
    setState({ ...next, selectedCardId: null, selectedLeaderPower: false });
    setFocusedLane(nextFocusedLane ?? null);
  }

  function showCardPlayFx(
    cardId: string,
    lane: FrontlineLane | null,
    targetSide: CardPlayFx["targetSide"],
    tone: VisualFxTone,
    events: FrontlineEvent[],
  ) {
    if (cardFxTimerRef.current) clearTimeout(cardFxTimerRef.current);
    fxIdRef.current += 1;
    setCardPlayFx({ id: fxIdRef.current, cardId, lane, targetSide, tone, events: events.slice(0, 4) });
    playFrontlineCardSfx(cardId, tone);
    cardFxTimerRef.current = setTimeout(() => setCardPlayFx(null), 1900);
  }

  function playInstantCard(cardId: string) {
    if (actionsLocked) return;
    const next = playCard(state, "ally", cardId);
    const card = getFrontlineCard(cardId, state.allyCardProfiles);
    const newEvents = collectNewEvents(state, next);
    setDeathGhosts(collectDeathGhosts(state, newEvents));
    showCardPlayFx(cardId, null, visualTargetSideForCard(card), visualToneFromCard(card), newEvents);
    resetSelection(next, focusedLane);
  }

  function handleCardClick(cardId: string) {
    if (actionsLocked) return;
    const card = getFrontlineCard(cardId, state.allyCardProfiles);
    if (card.target === "none") {
      playInstantCard(cardId);
      return;
    }
    setState((current) => ({
      ...current,
      selectedCardId: current.selectedCardId === cardId ? null : cardId,
      selectedLeaderPower: false,
    }));
  }

  function handleLeaderPowerClick() {
    if (actionsLocked) return;
    const leader = FRONTLINE_LEADER_BY_ID[state.allyDeck.leaderId];
    if (leader.power.effect.type === "rally") {
      const lane = validLeaderPowerTargets(state, "ally")[0];
      if (lane) {
        const next = activateLeaderPower(state, "ally", lane);
        const newEvents = collectNewEvents(state, next);
        setDeathGhosts(collectDeathGhosts(state, newEvents));
        showCardPlayFx(`leader:${leader.id}`, lane, "ally", "power", newEvents);
        resetSelection(next, lane);
      }
      return;
    }
    setState((current) => ({
      ...current,
      selectedLeaderPower: !current.selectedLeaderPower,
      selectedCardId: null,
    }));
  }

  function handleLaneClick(lane: FrontlineLane) {
    if (actionsLocked) {
      setFocusedLane(lane);
      return;
    }
    if (state.selectedLeaderPower) {
      if (!targetableLanes.includes(lane)) {
        setFocusedLane(lane);
        return;
      }
      const leader = FRONTLINE_LEADER_BY_ID[state.allyDeck.leaderId];
      const next = activateLeaderPower(state, "ally", lane);
      const newEvents = collectNewEvents(state, next);
      setDeathGhosts(collectDeathGhosts(state, newEvents));
      showCardPlayFx(`leader:${leader.id}`, lane, visualTargetSideForLeader(leader.power.effect.type), "power", newEvents);
      resetSelection(next, lane);
      return;
    }
    if (selectedCard && targetableLanes.includes(lane)) {
      const next = playCard(state, "ally", selectedCard.id, lane);
      const newEvents = collectNewEvents(state, next);
      setDeathGhosts(collectDeathGhosts(state, newEvents));
      showCardPlayFx(selectedCard.id, lane, visualTargetSideForCard(selectedCard), visualToneFromCard(selectedCard), newEvents);
      resetSelection(next, lane);
      return;
    }
    setFocusedLane((current) => (current === lane ? null : lane));
  }

  function handleResolveClick() {
    if (actionsLocked) return;
    sfx.resolveClash();
    setCardPlayFx(null);
    const next = resolveTurn(state);
    const newEvents = collectNewEvents(state, next);
    setDeathGhosts(collectDeathGhosts(state, newEvents));
    finishDelayRef.current = next.winner ? resolutionSequenceDuration(newEvents) : 1800;
    setState(next);
    showResolutionFx(newEvents);
  }

  const selectedContextTitle = state.selectedLeaderPower
    ? allyLeaderPowerName
    : selectedCard
      ? frontlineCardName(t, selectedCard)
      : `${laneLabel(t, displayLane)} ${t("frontline.front")}`;

  const selectedContextBody = state.selectedLeaderPower
    ? allyLeaderPowerDescription
    : selectedCard
      ? `${cardEffectSummary(t, selectedCard)} - ${cardTargetLabel(t, selectedCard)}`
      : laneStatusSubtitle(t, displayInsight.lane, displayInsight.status);

  const infernoCasting =
    activeResolutionEvent?.kind === "boss_signature" && activeResolutionEvent.signature === "cast";

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-[30px] bg-[#080a0d] shadow-[0_34px_95px_rgba(0,0,0,0.5)]",
        infernoCasting && "frontline-inferno-cast-fx",
      )}
      style={{ backgroundImage: `url('${backdrop}')`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <style>{`
        @keyframes frontline-hit {
          0% { transform: translateX(0) scale(1); filter: brightness(1); box-shadow: 0 0 0 rgba(240,95,114,0); }
          16% { transform: translateX(-10px) scale(1.055); filter: brightness(1.65) saturate(1.18); box-shadow: 0 0 34px rgba(240,95,114,0.42); }
          34% { transform: translateX(9px) scale(1.035); filter: brightness(1.28) saturate(1.1); }
          52% { transform: translateX(-5px) scale(1.02); }
          100% { transform: translateX(0) scale(1); filter: brightness(1); box-shadow: 0 0 0 rgba(240,95,114,0); }
        }
        @keyframes frontline-float {
          0% { opacity: 0; transform: translate(-50%, 18px) scale(0.74); filter: blur(1px); }
          14% { opacity: 1; transform: translate(-50%, -3px) scale(1.22); filter: blur(0); }
          46% { opacity: 1; transform: translate(-50%, -22px) scale(1.05); }
          100% { opacity: 0; transform: translate(-50%, -68px) scale(0.92); }
        }
        @keyframes frontline-breach {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.52) rotate(-8deg); filter: brightness(1); }
          24% { opacity: 1; transform: translate(-50%, -50%) scale(1.08) rotate(0deg); filter: brightness(1.3); }
          64% { opacity: 0.72; transform: translate(-50%, -50%) scale(1.55) rotate(4deg); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2.05) rotate(9deg); }
        }
        @keyframes frontline-idle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.012); }
        }
        @keyframes frontline-attack-ally {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          14% { transform: translate3d(0, 7px, 0) scale(0.97); filter: brightness(1.02); }
          38% { transform: translate3d(0, -24px, 0) scale(1.16); filter: brightness(1.45) drop-shadow(0 0 24px rgba(245,196,81,0.42)); }
          62% { transform: translate3d(0, -20px, 0) scale(1.12); filter: brightness(1.34) drop-shadow(0 0 20px rgba(245,196,81,0.36)); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes frontline-attack-enemy {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          14% { transform: translate3d(0, -7px, 0) scale(0.97); filter: brightness(1.02); }
          38% { transform: translate3d(0, 24px, 0) scale(1.16); filter: brightness(1.45) drop-shadow(0 0 24px rgba(240,95,114,0.42)); }
          62% { transform: translate3d(0, 20px, 0) scale(1.12); filter: brightness(1.34) drop-shadow(0 0 20px rgba(240,95,114,0.36)); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes frontline-shield {
          0% { opacity: 0; transform: scale(0.84); }
          36% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 0; transform: scale(1.18); }
        }
        @keyframes frontline-heal {
          0% { opacity: 0; transform: scale(0.85) translateY(8px); }
          35% { opacity: 1; transform: scale(1.05) translateY(0); }
          100% { opacity: 0; transform: scale(1.18) translateY(-12px); }
        }
        @keyframes frontline-ko {
          0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); filter: blur(0) grayscale(0); }
          100% { opacity: 0.28; transform: translateY(12px) rotate(-3deg) scale(0.88); filter: blur(1px) grayscale(0.6); }
        }
        @keyframes frontline-death-ghost {
          0% { opacity: 0; transform: translate(-50%, -50%) translateY(0) scale(0.94) rotate(0deg); filter: brightness(1.4) saturate(1.15) blur(0); }
          16% { opacity: 1; transform: translate(-50%, -50%) translateY(-3px) scale(1.08) rotate(-1deg); filter: brightness(1.65) saturate(1.25) blur(0); }
          45% { opacity: 0.88; transform: translate(-50%, -50%) translateY(-12px) scale(0.98) rotate(2deg); filter: brightness(1.18) saturate(0.9) grayscale(0.2) blur(0.4px); }
          100% { opacity: 0; transform: translate(-50%, -50%) translateY(-44px) scale(0.68) rotate(8deg); filter: brightness(0.8) saturate(0.35) grayscale(0.85) blur(2px); }
        }
        @keyframes frontline-death-soul {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
          20% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.96); }
          100% { opacity: 0; transform: translate(-50%, -78%) scale(1.48); }
        }
        @keyframes frontline-card-ready {
          0%, 100% { filter: brightness(1); box-shadow: 0 18px 38px rgba(0,0,0,0.3); }
          50% { filter: brightness(1.05); box-shadow: 0 22px 44px rgba(245,196,81,0.1), 0 18px 38px rgba(0,0,0,0.3); }
        }
        @keyframes frontline-card-selected {
          0%, 100% { transform: translateY(-7px) scale(1.035); filter: brightness(1.12); }
          50% { transform: translateY(-10px) scale(1.055); filter: brightness(1.24) saturate(1.08); }
        }
        @keyframes frontline-target-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.92); }
          50% { opacity: 1; transform: scale(1.12); }
        }
        @keyframes frontline-support-pop {
          0% { opacity: 0; transform: translateY(8px) scale(0.72); }
          45% { opacity: 1; transform: translateY(-2px) scale(1.08); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes frontline-core-hit {
          0% { transform: translateX(0) scale(1); filter: brightness(1); }
          18% { transform: translateX(-7px) scale(1.045); filter: brightness(1.45) saturate(1.2); }
          34% { transform: translateX(6px) scale(1.03); }
          52% { transform: translateX(-3px) scale(1.015); }
          100% { transform: translateX(0) scale(1); filter: brightness(1); }
        }
        @keyframes frontline-core-shock {
          0% { opacity: 0; transform: translate(-50%, 24%) scale(0.55); filter: blur(3px); }
          18% { opacity: 1; transform: translate(-50%, -8%) scale(1.18); filter: blur(0); }
          62% { opacity: 1; transform: translate(-50%, -32%) scale(1.06); }
          100% { opacity: 0; transform: translate(-50%, -64%) scale(0.94); }
        }
        @keyframes frontline-core-shock-flash {
          0% { opacity: 0; transform: scale(0.6); }
          22% { opacity: 0.95; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(2.4); }
        }
        .frontline-core-shock-fx { animation: frontline-core-shock 920ms cubic-bezier(0.18,0.89,0.32,1.28) forwards; }
        .frontline-core-shock-flash-fx { animation: frontline-core-shock-flash 720ms ease-out forwards; }
        @keyframes frontline-power-ready-ring {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(245,196,81,0.42)); opacity: 0.85; }
          50% { filter: drop-shadow(0 0 16px rgba(245,196,81,0.78)); opacity: 1; }
        }
        .frontline-power-ready-ring-fx { animation: frontline-power-ready-ring 1.6s ease-in-out infinite; }
        @keyframes frontline-stun-pulse {
          0%, 100% { filter: drop-shadow(0 0 0 rgba(245,196,81,0)) saturate(1); transform: rotate(0deg); }
          25% { filter: drop-shadow(0 0 12px rgba(245,196,81,0.62)) saturate(0.65); transform: rotate(-1.2deg); }
          75% { filter: drop-shadow(0 0 14px rgba(245,196,81,0.48)) saturate(0.7); transform: rotate(1.2deg); }
        }
        .frontline-stun-pulse-fx { animation: frontline-stun-pulse 1.2s ease-in-out infinite; }
        @keyframes frontline-inferno-cast {
          0% { box-shadow: inset 0 0 0 rgba(255,150,80,0); filter: brightness(1) saturate(1); }
          18% { box-shadow: inset 0 0 220px rgba(255,150,80,0.62); filter: brightness(1.18) saturate(1.16); }
          55% { box-shadow: inset 0 0 180px rgba(240,95,114,0.42); filter: brightness(1.08) saturate(1.08); }
          100% { box-shadow: inset 0 0 0 rgba(255,150,80,0); filter: brightness(1) saturate(1); }
        }
        .frontline-inferno-cast-fx { animation: frontline-inferno-cast 820ms ease-out; }
        @keyframes frontline-boss-breath {
          0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 28px 56px rgba(180,70,40,0.42)) brightness(1); }
          50% { transform: translateY(-3px) scale(1.012); filter: drop-shadow(0 36px 72px rgba(245,140,80,0.5)) brightness(1.06); }
        }
        .frontline-boss-breath-fx { animation: frontline-boss-breath 5.4s ease-in-out infinite; }
        html[data-motion="reduced"] .frontline-core-shock-fx,
        html[data-motion="reduced"] .frontline-core-shock-flash-fx { animation-duration: 180ms !important; }
        html[data-motion="reduced"] .frontline-power-ready-ring-fx,
        html[data-motion="reduced"] .frontline-stun-pulse-fx,
        html[data-motion="reduced"] .frontline-inferno-cast-fx,
        html[data-motion="reduced"] .frontline-boss-breath-fx { animation: none !important; opacity: 1; transform: none !important; filter: none !important; }
        @keyframes frontline-lane-impact {
          0% { transform: scale(1); filter: brightness(1); }
          28% { transform: scale(1.018); filter: brightness(1.18) saturate(1.12); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        @keyframes frontline-card-cast {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.42) rotate(-12deg); filter: blur(3px); }
          12% { opacity: 1; transform: translate(-50%, -50%) scale(1.24) rotate(0deg); filter: blur(0); }
          58% { opacity: 1; transform: translate(-50%, -50%) scale(1.06) rotate(1deg); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.88) rotate(4deg); }
        }
        @keyframes frontline-cast-wave {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.38); }
          22% { opacity: 0.95; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2.85); }
        }
        @keyframes frontline-resolve-cta {
          0%, 100% { filter: brightness(1); box-shadow: 0 10px 26px rgba(49,170,107,0.22); }
          50% { filter: brightness(1.14); box-shadow: 0 0 34px rgba(93,211,158,0.34), 0 14px 34px rgba(49,170,107,0.3); }
        }
        @keyframes frontline-clash-spotlight {
          0% { opacity: 0; transform: translateY(-12px) scale(0.94); filter: blur(2px); }
          14% { opacity: 1; transform: translateY(0) scale(1.03); filter: blur(0); }
          84% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-6px) scale(0.98); }
        }
        @keyframes frontline-action-trail-up {
          0% { opacity: 0; transform: translate(-50%, 18px) scaleY(0.08); filter: blur(2px); }
          18% { opacity: 0.95; transform: translate(-50%, 8px) scaleY(0.32); filter: blur(0); }
          44% { opacity: 1; transform: translate(-50%, -8px) scaleY(1); }
          74% { opacity: 0.75; transform: translate(-50%, -18px) scaleY(0.86); }
          100% { opacity: 0; transform: translate(-50%, -26px) scaleY(0.16); }
        }
        @keyframes frontline-action-trail-down {
          0% { opacity: 0; transform: translate(-50%, -18px) scaleY(0.08); filter: blur(2px); }
          18% { opacity: 0.95; transform: translate(-50%, -8px) scaleY(0.32); filter: blur(0); }
          44% { opacity: 1; transform: translate(-50%, 8px) scaleY(1); }
          74% { opacity: 0.75; transform: translate(-50%, 18px) scaleY(0.86); }
          100% { opacity: 0; transform: translate(-50%, 26px) scaleY(0.16); }
        }
        @keyframes frontline-action-impact {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.48) rotate(-8deg); filter: blur(2px); }
          26% { opacity: 1; transform: translate(-50%, -50%) scale(1.14) rotate(0deg); filter: blur(0); }
          58% { opacity: 0.95; transform: translate(-50%, -50%) scale(1) rotate(2deg); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.62) rotate(9deg); }
        }
        @keyframes frontline-card-use-toast {
          0% { opacity: 0; transform: translate(-50%, 16px) scale(0.88); filter: blur(2px); }
          15% { opacity: 1; transform: translate(-50%, 0) scale(1.03); filter: blur(0); }
          78% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -16px) scale(0.96); }
        }
        @keyframes frontline-ko-burst {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.42) rotate(-8deg); filter: blur(2px); }
          18% { opacity: 1; transform: translate(-50%, -50%) scale(1.18) rotate(0deg); filter: blur(0); }
          55% { opacity: 1; transform: translate(-50%, -50%) scale(1.02) rotate(2deg); }
          100% { opacity: 0; transform: translate(-50%, -68%) scale(0.72) rotate(7deg); filter: blur(1px); }
        }
        @keyframes frontline-finish-overlay {
          0% { opacity: 0; backdrop-filter: blur(0); }
          100% { opacity: 1; backdrop-filter: blur(8px); }
        }
        @keyframes frontline-finish-emblem {
          0% { opacity: 0; transform: translateY(18px) scale(0.72); filter: blur(3px); }
          22% { opacity: 1; transform: translateY(-4px) scale(1.08); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .frontline-hit-fx { animation: frontline-hit 620ms cubic-bezier(.22,1,.36,1) both; }
        .frontline-float-fx { animation: frontline-float 1240ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-breach-fx { animation: frontline-breach 1180ms cubic-bezier(.16,1,.3,1) both; transform-origin: center; }
        .frontline-idle-fx { animation: frontline-idle 3.8s ease-in-out infinite; }
        .frontline-attack-ally-fx { animation: frontline-attack-ally 1380ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-attack-enemy-fx { animation: frontline-attack-enemy 1380ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-shield-fx { animation: frontline-shield 900ms ease-out both; }
        .frontline-heal-fx { animation: frontline-heal 900ms ease-out both; }
        .frontline-ko-fx { animation: frontline-ko 820ms ease-out both; }
        .frontline-death-ghost-fx { animation: frontline-death-ghost 1680ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-death-soul-fx { animation: frontline-death-soul 1580ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-card-ready-fx { animation: frontline-card-ready 2.4s ease-in-out infinite; }
        .frontline-card-selected-fx { animation: frontline-card-selected 840ms ease-in-out infinite; }
        .frontline-target-pulse-fx { animation: frontline-target-pulse 760ms ease-in-out infinite; }
        .frontline-support-pop-fx { animation: frontline-support-pop 380ms ease-out both; }
        .frontline-core-hit-fx { animation: frontline-core-hit 720ms cubic-bezier(.22,1,.36,1) both; }
        .frontline-lane-impact-fx { animation: frontline-lane-impact 720ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-card-cast-fx { animation: frontline-card-cast 1780ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-cast-wave-fx { animation: frontline-cast-wave 1600ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-resolve-cta-fx { animation: frontline-resolve-cta 1.45s ease-in-out infinite; }
        .frontline-clash-spotlight-fx { animation: frontline-clash-spotlight 1420ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-action-trail-up-fx { animation: frontline-action-trail-up 1380ms cubic-bezier(.16,1,.3,1) both; transform-origin: bottom center; }
        .frontline-action-trail-down-fx { animation: frontline-action-trail-down 1380ms cubic-bezier(.16,1,.3,1) both; transform-origin: top center; }
        .frontline-action-impact-fx { animation: frontline-action-impact 1320ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-card-use-toast-fx { animation: frontline-card-use-toast 1850ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-ko-burst-fx { animation: frontline-ko-burst 1180ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-finish-overlay-fx { animation: frontline-finish-overlay 520ms cubic-bezier(.16,1,.3,1) both; }
        .frontline-finish-emblem-fx { animation: frontline-finish-emblem 760ms cubic-bezier(.16,1,.3,1) both; }
        html[data-motion="reduced"] .frontline-hit-fx,
        html[data-motion="reduced"] .frontline-float-fx,
        html[data-motion="reduced"] .frontline-breach-fx,
        html[data-motion="reduced"] .frontline-idle-fx,
        html[data-motion="reduced"] .frontline-attack-ally-fx,
        html[data-motion="reduced"] .frontline-attack-enemy-fx,
        html[data-motion="reduced"] .frontline-shield-fx,
        html[data-motion="reduced"] .frontline-heal-fx,
        html[data-motion="reduced"] .frontline-ko-fx,
        html[data-motion="reduced"] .frontline-death-ghost-fx,
        html[data-motion="reduced"] .frontline-death-soul-fx,
        html[data-motion="reduced"] .frontline-card-ready-fx,
        html[data-motion="reduced"] .frontline-card-selected-fx,
        html[data-motion="reduced"] .frontline-target-pulse-fx,
        html[data-motion="reduced"] .frontline-support-pop-fx,
        html[data-motion="reduced"] .frontline-core-hit-fx,
        html[data-motion="reduced"] .frontline-lane-impact-fx,
        html[data-motion="reduced"] .frontline-card-cast-fx,
        html[data-motion="reduced"] .frontline-cast-wave-fx,
        html[data-motion="reduced"] .frontline-resolve-cta-fx,
        html[data-motion="reduced"] .frontline-clash-spotlight-fx,
        html[data-motion="reduced"] .frontline-action-trail-up-fx,
        html[data-motion="reduced"] .frontline-action-trail-down-fx,
        html[data-motion="reduced"] .frontline-action-impact-fx,
        html[data-motion="reduced"] .frontline-card-use-toast-fx,
        html[data-motion="reduced"] .frontline-ko-burst-fx,
        html[data-motion="reduced"] .frontline-finish-overlay-fx,
        html[data-motion="reduced"] .frontline-finish-emblem-fx {
          animation: none !important;
        }
      `}</style>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(245,196,81,0.14),transparent_32%),linear-gradient(180deg,rgba(7,9,12,0.25),rgba(7,9,12,0.58)_42%,rgba(7,9,12,0.9)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(255,213,128,0.16),transparent)]" />
      <div className="absolute inset-x-5 top-[37%] h-28 -skew-y-3 rounded-[999px] bg-[linear-gradient(90deg,rgba(101,210,200,0.08),rgba(245,196,81,0.17),rgba(240,95,114,0.08))] blur-xl" />
      <div className="absolute inset-x-10 bottom-[13rem] h-px bg-[linear-gradient(90deg,transparent,rgba(245,196,81,0.26),transparent)]" />
      <ClashSpotlight event={activeResolutionEvent} index={resolutionFx?.activeIndex ?? 0} total={resolutionFx?.events.length ?? 0} />
      {!activeResolutionEvent && !cardPlayFx && !finishFx ? (
        <PreviewSpotlight preview={previewOutcome} cardName={selectedCard ? frontlineCardName(t, selectedCard) : null} />
      ) : null}
      <CardUseToast fx={cardPlayFx} />
      {finishFx ? <BattleEndOverlay winner={finishFx.winner} /> : null}

      <div className="relative z-[1] flex flex-col gap-4 p-4 md:p-5">
        {encounterKind ? <EncounterBanner kind={encounterKind} title={encounterTitle ?? null} /> : null}
        <header className="grid gap-3 lg:grid-cols-[13rem_minmax(0,1fr)_13rem] xl:grid-cols-[15rem_minmax(0,1fr)_15rem]">
          <div className="relative">
            <CoreTotem
              leaderId={state.enemyDeck.leaderId}
              leaderNameOverride={frontlinePresetName(t, getEnemyPreset(enemyPresetId))}
              portraitSrc={getFrontlineEnemyLeaderPortraitForPreset(getEnemyPreset(enemyPresetId))}
              title={t("frontline.enemyCore")}
              hp={state.enemyCoreHp}
              maxHp={state.enemyCoreMaxHp}
              accent="enemy"
              flash={shouldCoreFlash(activeResolutionEvent ?? latestImpact, "ally")}
              powerCooldown={state.enemyDeck.powerCooldown}
            />
            <CoreShockOverlay shock={coreShock} side="enemy" />
          </div>

          <div className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.025)_42%,rgba(0,0,0,0.22))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_42px_rgba(0,0,0,0.24)]">
            <div className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,196,81,0.55),transparent)]" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CompactPill tone={state.turn === "ally" ? "ally" : "enemy"}>{state.turn === "ally" ? t("frontline.yourTurn") : t("frontline.enemy")}</CompactPill>
                <CompactPill tone="neutral">R{state.round}</CompactPill>
                <CommandPips value={state.allyDeck.command} />
              </div>
              {latestImpact ? (
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] shadow-[0_0_28px_rgba(245,196,81,0.12)]",
                    impactTone(latestImpact.kind) === "high"
                      ? "bg-[#f5c451]/16 text-[#f5d498]"
                      : "bg-white/[0.055] text-white/62",
                  )}
                >
                  <CombatIcon name={combatIconForEvent(latestImpact)} size="xs" fallbackClassName="opacity-90" />
                  <span>
                    {latestImpact.label}
                    {typeof latestImpact.amount === "number" ? ` ${latestImpact.amount}` : ""}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f5d498]/70">{t("frontline.next")}</div>
                <div className="mt-1 text-2xl font-black leading-none text-white">{actionState.title}</div>
                <div className="mt-1 text-[11px] text-white/52">{actionState.subtitle}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <FlowStep icon="target" label={t("frontline.card")} active={state.turn === "ally" && !selectedCard && !state.selectedLeaderPower} done={Boolean(selectedCard || state.selectedLeaderPower)} />
                <FlowStep icon="target" label={t("frontline.front")} active={Boolean(selectedCard || state.selectedLeaderPower)} done={false} />
                <FlowStep icon="clash" label={t("frontline.clashReady")} active={state.turn === "ally" && state.allyDeck.command <= 0 && !selectedCard && !state.selectedLeaderPower} done={false} />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className={cn(
                  "rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition",
                  state.selectedLeaderPower
                    ? "bg-[#f5c451]/16 text-[#f5d498] shadow-[0_0_26px_rgba(245,196,81,0.18)]"
                    : "bg-white/[0.055] text-white/72 hover:bg-white/[0.09]",
                )}
                disabled={
                  actionsLocked ||
                  state.allyDeck.usedLeaderPower ||
                  state.allyDeck.powerCooldown > 0 ||
                  state.allyDeck.command < allyLeader.power.cost
                }
                onClick={handleLeaderPowerClick}
                title={allyLeaderPowerDescription}
              >
                <span className="inline-flex items-center gap-1.5">
                  <CombatIcon name="leader_power" size="xs" fallbackClassName="opacity-90" />
                  {allyLeaderPowerName}
                  <ResourceIcon kind="command" size="small" className="h-4 w-4" />
                  {allyLeader.power.cost}
                </span>
              </button>
              {(selectedCard || state.selectedLeaderPower || focusedLane) ? (
                <button
                  className="rounded-full bg-white/[0.055] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/72 transition hover:bg-white/[0.09]"
                  onClick={() => {
                    if (actionsLocked) return;
                    setFocusedLane(null);
                    setState((current) => ({ ...current, selectedCardId: null, selectedLeaderPower: false }));
                  }}
                  disabled={actionsLocked}
                >
                  {t("frontline.clear")}
                </button>
              ) : null}
              <button
                data-resolve-clash
                className="frontline-resolve-cta-fx rounded-full bg-[linear-gradient(180deg,rgba(74,166,111,0.98),rgba(14,59,38,0.98))] px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_26px_rgba(49,170,107,0.22)] transition hover:-translate-y-0.5 disabled:opacity-40 disabled:[animation:none]"
                disabled={actionsLocked}
                onClick={handleResolveClick}
              >
                <span className="inline-flex items-center gap-1.5">
                  <CombatIcon name="clash" size="xs" fallbackClassName="opacity-95" />
                  {t("frontline.resolveClash")}
                </span>
              </button>
            </div>
          </div>

          <div className="relative">
            <CoreTotem
              leaderId={state.allyDeck.leaderId}
              portraitSrc={getFrontlineLeaderPortraitSrc(state.allyDeck.leaderId)}
              title={t("frontline.yourCore")}
              hp={state.allyCoreHp}
              maxHp={state.allyCoreMaxHp}
              accent="ally"
              flash={shouldCoreFlash(activeResolutionEvent ?? latestImpact, "enemy")}
              powerCooldown={state.allyDeck.powerCooldown}
              powerReadyExtra={state.allyDeck.command >= allyLeader.power.cost && !state.allyDeck.usedLeaderPower}
            />
            <CoreShockOverlay shock={coreShock} side="ally" />
          </div>
        </header>

        {bossConfig && state.bossState ? (
          <BossBanner
            boss={bossConfig}
            bossState={state.bossState}
            modifiers={modifiers ?? null}
            cardCostMod={state.playerCardCostMod}
          />
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="relative grid gap-3 lg:grid-cols-3">
            {bossConfig ? <BossColossusOverlay assetKey={bossConfig.assetKey} /> : null}
            {FRONTLINE_LANES.map((lane) => {
              const laneState = state.lanes[lane];
              const active = targetableLanes.includes(lane);
              const focused = displayLane === lane;
              const insight = laneInsights.find((entry) => entry.lane === lane)!;
              const statusMeta = laneStatusMeta(t, insight);
              const latestHere = latestImpact?.lane === lane;
              const activeLaneEvent = activeResolutionEvent?.lane === lane ? activeResolutionEvent : null;
              const laneFx = activeLaneEvent ? [activeLaneEvent] : [];
              const laneCardFx = cardPlayFx && (cardPlayFx.lane === lane || cardPlayFx.events.some((event) => event.lane === lane)) ? cardPlayFx : null;
              const laneDeathGhost =
                (activeLaneEvent ? deathGhosts.find((ghost) => ghost.eventId === activeLaneEvent.id) : null) ??
                (laneCardFx ? deathGhosts.find((ghost) => ghost.lane === lane && laneCardFx.events.some((event) => event.id === ghost.eventId)) : null) ??
                null;
              const allyCardEvent = cardPlayEventForSide(laneCardFx, lane, "ally");
              const enemyCardEvent = cardPlayEventForSide(laneCardFx, lane, "enemy");
              const allyTargeted = active && (selectedTargetSide === "ally" || selectedTargetSide === "both");
              const enemyTargeted = active && (selectedTargetSide === "enemy" || selectedTargetSide === "both");
              const allyVisualState = heroVisualState({
                side: "ally",
                focused,
                targeted: allyTargeted,
                activeEvent: activeLaneEvent,
                cardFx: laneCardFx,
                cardEvent: allyCardEvent,
              });
              const enemyVisualState = heroVisualState({
                side: "enemy",
                focused,
                targeted: enemyTargeted,
                activeEvent: activeLaneEvent,
                cardFx: laneCardFx,
                cardEvent: enemyCardEvent,
              });
              const breachFx = activeLaneEvent?.kind === "breach";
              return (
                <button
                  key={lane}
                  data-frontline-lane={lane}
                  onClick={() => handleLaneClick(lane)}
                  onMouseEnter={() => setFocusedLane(lane)}
                  onFocus={() => setFocusedLane(lane)}
                  className={cn(
                    "group relative min-h-[25rem] overflow-hidden rounded-[30px] p-3 text-left transition duration-300",
                    laneSurfaceClass(statusMeta.tone, active, focused),
                    latestHere && "ring-2 ring-[#f5c451]/18",
                    latestHere && impactTone(latestImpact?.kind) !== "low" && "frontline-lane-impact-fx",
                    laneCardFx && "frontline-lane-impact-fx ring-2 ring-[#f5c451]/34 shadow-[0_0_44px_rgba(245,196,81,0.22)]",
                    active && "ring-2 ring-[#f5c451]/26",
                    activeResolutionEvent && !activeLaneEvent && "opacity-60 saturate-[0.78] scale-[0.99] transition-[opacity,filter,transform] duration-200",
                    activeLaneEvent && "z-[2] ring-[3px] ring-[#f5c451]/56 shadow-[0_0_72px_rgba(245,196,81,0.32)] transition-[box-shadow,transform] duration-200",
                  )}
                  title={laneStatusSubtitle(t, insight.lane, insight.status)}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),transparent_28%,rgba(0,0,0,0.28))]" />
                  <div className="pointer-events-none absolute inset-x-6 top-11 h-24 rounded-[999px] bg-[radial-gradient(circle,rgba(245,196,81,0.13),transparent_67%)] blur-lg" />
                  <div className="pointer-events-none absolute inset-x-8 top-[46%] h-16 rounded-[999px] bg-[radial-gradient(ellipse,rgba(245,196,81,0.16),transparent_70%)] blur-md" />
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 opacity-0 transition duration-300",
                      active && "opacity-100 bg-[radial-gradient(circle_at_50%_50%,rgba(245,196,81,0.18),transparent_58%)]",
                      laneCardFx && "opacity-100 bg-[radial-gradient(circle_at_50%_52%,rgba(245,196,81,0.2),transparent_64%)]",
                      insight.breachSide === "ally" && !active && "opacity-100 bg-[radial-gradient(circle_at_50%_52%,rgba(101,210,200,0.12),transparent_62%)]",
                      insight.breachSide === "enemy" && !active && "opacity-100 bg-[radial-gradient(circle_at_50%_52%,rgba(240,95,114,0.14),transparent_62%)]",
                    )}
                  />
                  <div className="pointer-events-none absolute inset-x-7 top-[49%] h-1 rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,236,185,0.26),transparent)]" />
                  {breachFx ? (
                    <div className="frontline-breach-fx pointer-events-none absolute left-1/2 top-1/2 h-36 w-36 rounded-full border-2 border-[#f5c451]/70 bg-[#f5c451]/14 shadow-[0_0_48px_rgba(245,196,81,0.42)]" />
                  ) : null}
                  <LaneActionTrail event={activeLaneEvent} />
                  <ResolutionFloat events={laneFx} />
                  <CardCastFx fx={laneCardFx} />
                  <DeathGhost ghost={laneDeathGhost} />
                  <LaneKoFx event={activeLaneEvent} />

                  <div className="relative z-[1] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="text-white/48">{lane}</span>
                      {bossSegmentByLane[lane] ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
                            bossSegmentByLane[lane]?.weakpoint
                              ? "border-rose-200/52 bg-rose-400/16 text-rose-50"
                              : "border-[#f5c451]/52 bg-[#f5c451]/12 text-[#fff0bd]",
                          )}
                          title={bossSegmentByLane[lane]?.weakpoint ? t("frontline.bossSegmentWeakpoint") : t("frontline.bossSegmentTitle")}
                        >
                          <CombatIcon name={bossSegmentByLane[lane]?.weakpoint ? "danger" : "leader_power"} size="xs" fallbackClassName="opacity-90" />
                          <span>{t(bossSegmentByLane[lane]!.titleKey)}</span>
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      {insight.breachSide ? (
                        <div className="inline-flex items-center gap-1 rounded-full bg-black/24 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/72">
                          <CombatIcon name={insight.breachSide === "ally" ? "breach" : "danger"} size="xs" fallbackClassName="opacity-90" />
                          <span>{laneBreachValue(lane)}</span>
                        </div>
                      ) : null}
                      <StatusTag tone={statusMeta.tone} label={statusMeta.label} detail={statusMeta.detail} icon={combatIconForLaneStatus(insight.status)} />
                    </div>
                  </div>

                  <div className="relative z-[1] mt-3">
                    <FrontlineHeroPiece
                      actor={laneState.enemyHero}
                      support={laneState.enemySupport}
                      accent="enemy"
                      pressured={insight.enemyLow}
                      visualState={enemyVisualState}
                    />
                  </div>

                  <div className="relative z-[1] my-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28))]" />
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em]",
                        active
                          ? "bg-[#f5c451]/16 text-[#f5d498] shadow-[0_0_26px_rgba(245,196,81,0.22)]"
                          : insight.breachSide === "ally"
                            ? "bg-emerald-300/12 text-emerald-100"
                            : insight.breachSide === "enemy"
                              ? "bg-rose-300/12 text-rose-100"
                            : "bg-black/24 text-white/44",
                      )}
                    >
                      <CombatIcon
                        name={active ? "target" : insight.breachSide === "ally" ? "breach" : insight.breachSide === "enemy" ? "danger" : "clash"}
                        size="xs"
                        fallbackClassName="opacity-90"
                      />
                      <span>
                        {active
                          ? t("frontline.target")
                          : insight.breachSide === "ally"
                            ? t("frontline.statusBreach")
                            : insight.breachSide === "enemy"
                              ? t("frontline.defend")
                              : t("frontline.clash")}
                      </span>
                    </div>
                    <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0.28),transparent)]" />
                  </div>

                  <div className="relative z-[1]">
                    <FrontlineHeroPiece
                      actor={laneState.allyHero}
                      support={laneState.allySupport}
                      accent="ally"
                      pressured={insight.allyLow}
                      visualState={allyVisualState}
                      scorch={state.bossState?.scorch[lane] ?? 0}
                    />
                  </div>

                  <CompactPressureBar allyScore={insight.allyScore} enemyScore={insight.enemyScore} />
                </button>
              );
            })}
          </div>

          <aside className="grid gap-3">
            <section className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025)_44%,rgba(0,0,0,0.22))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,196,81,0.5),transparent)]" />
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f5d498]">{t("frontline.focus")}</div>
                {focusedLane ? <CompactPill tone="neutral">{laneLabel(t, focusedLane)}</CompactPill> : null}
              </div>

              <div className="mt-3 rounded-[20px] bg-black/16 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2 text-sm font-black text-white">
                    {selectedCard ? <CardTypeIcon type={selectedCard.kind} size="sm" className="h-7 w-7" /> : null}
                    <span className="truncate">{selectedContextTitle}</span>
                  </div>
                  {!selectedCard && !state.selectedLeaderPower ? (
                    (() => {
                      const meta = laneStatusMeta(t, displayInsight);
                      return (
                        <StatusTag
                          tone={meta.tone}
                          label={meta.label}
                          detail={meta.detail}
                          icon={combatIconForLaneStatus(displayInsight.status)}
                        />
                      );
                    })()
                  ) : null}
                </div>
                <div className="mt-2 text-[12px] leading-5 text-white/58">{selectedContextBody}</div>

                {!selectedCard && !state.selectedLeaderPower ? (
                  <div className="mt-3 space-y-2">
                    <MiniActorLine actor={state.lanes[displayLane].allyHero} support={state.lanes[displayLane].allySupport} side="ally" />
                    <MiniActorLine actor={state.lanes[displayLane].enemyHero} support={state.lanes[displayLane].enemySupport} side="enemy" />
                  </div>
                ) : null}

                {(selectedCard || state.selectedLeaderPower) && targetableLanes.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {targetableLanes.map((lane) => (
                      <div
                        key={`target-${lane}`}
                        className="inline-flex items-center gap-1 rounded-full bg-[#f5c451]/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#f5d498]"
                      >
                        <CombatIcon name="target" size="xs" fallbackClassName="opacity-90" />
                        <span>{laneLabel(t, lane)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-3 space-y-1.5">
                {latestFeed.map((entry, index) => {
                  if (entry.kind === "round") {
                    return (
                      <div
                        key={entry.id}
                        className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/44"
                      >
                        <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18))]" />
                        <span className="rounded-full border border-white/14 bg-black/30 px-2 py-0.5">{entry.label}</span>
                        <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0.18),transparent)]" />
                      </div>
                    );
                  }
                  const high = impactTone(entry.kind) === "high";
                  const isTop = index === 0;
                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        "rounded-[14px] border px-3 py-1.5 transition",
                        high
                          ? "border-[#f5c451]/30 bg-[#f5c451]/12 text-[#f5d498]"
                          : "border-white/8 bg-white/[0.045] text-white/72",
                        isTop && high && "shadow-[0_0_18px_rgba(245,196,81,0.22)] ring-1 ring-[#f5c451]/45",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className={cn("flex min-w-0 items-center gap-2 font-black", isTop ? "text-[12px]" : "text-[11px]")}>
                          <CombatIcon name={combatIconForEvent(entry)} size="sm" fallbackClassName="opacity-90 h-4 w-4" className="h-4 w-4" />
                          <span className="truncate">{entry.label}</span>
                        </div>
                        {typeof entry.amount === "number" ? (
                          <div className={cn("font-black tabular-nums", isTop && high ? "text-[13px]" : "text-[11px]")}>
                            {entry.amount}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>

        <section className="relative overflow-visible rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(0,0,0,0.12))] px-3 pb-3 pt-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f5d498]">{t("frontline.hand")}</div>
            <div className="rounded-full bg-white/[0.055] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/62">
              {t("frontline.handFooter", { deck: state.allyDeck.deck.length, discard: state.allyDeck.discard.length })}
            </div>
          </div>

          <div className="-mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-1 xl:mx-0 xl:grid xl:grid-cols-5 xl:overflow-visible xl:px-0 xl:pb-0">
            {state.allyDeck.hand.map((cardId) => {
              const card = state.allyCardProfiles?.[cardId] ?? FRONTLINE_CARD_BY_ID[cardId];
              const selected = state.selectedCardId === card.id;
              const playable = card.cost <= state.allyDeck.command && !actionsLocked;
              const validTargets = validCardTargets(state, "ally", card.id);
              const recommendedLane =
                validTargets.length > 0
                  ? laneInsights.find((entry) => validTargets.includes(entry.lane))?.lane ?? validTargets[0]
                  : null;
              return (
                <FrontlineHandCard
                  key={card.id}
                  card={card}
                  selected={selected}
                  playable={playable}
                  recommendedLane={recommendedLane}
                  command={state.allyDeck.command}
                  onClick={() => handleCardClick(card.id)}
                />
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}

function CombatIcon({
  name,
  size = "sm",
  className,
  imgClassName,
  fallbackClassName,
  label,
}: {
  name: CombatAssetIconName;
  size?: GameAssetIconSize;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  label?: string;
}) {
  return (
    <GameAssetIcon
      category="combat"
      name={name}
      size={size}
      label={label}
      decorative={!label}
      className={className}
      imgClassName={imgClassName}
      fallbackClassName={fallbackClassName}
    />
  );
}

function FrontlineHandCard({
  card,
  selected,
  playable,
  recommendedLane,
  command,
  onClick,
}: {
  card: FrontlineCardDef;
  selected: boolean;
  playable: boolean;
  recommendedLane: FrontlineLane | null;
  command: number;
  onClick: () => void;
}) {
  const { t } = useI18n();
  const visual = getFrontlineCardVisualAsset(card);
  const combatIcon = combatIconForCard(card);
  const statusIcon = statusIconForCard(card);
  const cardName = frontlineCardName(t, card);
  const cardDescription = frontlineCardDescription(t, card);
  const insufficientCommand = card.cost > command;
  return (
    <button
      type="button"
      data-hand-card={card.id}
      title={cardDescription}
      disabled={!playable}
      className={cn(
        "group relative h-[12.75rem] w-[11rem] shrink-0 overflow-hidden rounded-[24px] p-3 text-left shadow-[0_18px_38px_rgba(0,0,0,0.3)] transition duration-300 xl:h-[13.25rem] xl:w-auto",
        cardSurfaceClass(cardTone(card), selected, playable),
        playable
          ? "frontline-card-ready-fx hover:-translate-y-1 hover:shadow-[0_24px_46px_rgba(0,0,0,0.38)]"
          : "opacity-65 grayscale-[0.5] saturate-[0.7]",
        selected && "frontline-card-selected-fx",
      )}
      onClick={onClick}
    >
      <div className="absolute inset-2 z-0 overflow-hidden rounded-[21px] bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.16),transparent_52%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.36))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <VisualAssetImage
          src={visual.cardArtSrc}
          fallbackSrc={visual.fallbackPortraitSrc}
          alt={`${cardName} art`}
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-contain object-center p-1 opacity-95 saturate-[1.12] contrast-[1.04] drop-shadow-[0_14px_18px_rgba(0,0,0,0.34)] transition duration-300 group-hover:scale-[1.025] group-hover:opacity-100"
          fallback={
            <div className="grid h-full w-full place-items-center">
              <CombatIcon name={combatIcon} size="xl" fallbackClassName="opacity-95 drop-shadow-[0_12px_18px_rgba(0,0,0,0.36)] transition duration-300 group-hover:scale-110" />
            </div>
          }
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.62),rgba(0,0,0,0.08)_31%,rgba(0,0,0,0.04)_58%,rgba(0,0,0,0.78))]" />
      </div>
      <div className="absolute inset-x-0 top-0 h-1.5 bg-current opacity-70" />
      <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-white/10 blur-xl transition duration-300 group-hover:bg-white/16" />
      {selected ? (
        <div className="frontline-target-pulse-fx pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(245,196,81,0.28),transparent_54%)]" />
      ) : null}
      {playable && !selected ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-3 h-px bg-[linear-gradient(90deg,transparent,rgba(245,212,152,0.42),transparent)] opacity-70" />
      ) : null}

      <div className="relative z-[1] flex items-start justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em] opacity-80">
            <CardTypeIcon type={card.kind} size="sm" className="h-6 w-6" />
            <span>{cardFamilyLabel(t, card)}</span>
            {card.level && card.level > 1 ? <span className="rounded-full bg-[#f5c451]/18 px-1.5 py-0.5 text-[#ffe5a4]">Lv {card.level}</span> : null}
          </div>
          <div className="mt-1 max-w-[7rem] truncate text-base font-black leading-tight text-white">{cardName}</div>
        </div>
        <div
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg font-black shadow-[0_0_24px_rgba(245,196,81,0.22),inset_0_1px_0_rgba(255,255,255,0.24)]",
            insufficientCommand
              ? "bg-[radial-gradient(circle_at_35%_28%,rgba(255,200,200,0.55),rgba(220,80,90,0.42)_44%,rgba(40,0,0,0.5)_100%)] ring-2 ring-rose-300/60 text-rose-50"
              : "bg-[radial-gradient(circle_at_35%_28%,rgba(255,247,213,0.6),rgba(245,196,81,0.34)_44%,rgba(0,0,0,0.36)_100%)] text-[#ffe7a2]",
          )}
        >
          <span className="relative grid place-items-center">
            <ResourceIcon kind="command" size="small" className={cn("h-7 w-7 opacity-90", insufficientCommand && "opacity-70")} />
            <span className="absolute text-sm font-black text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">{card.cost}</span>
          </span>
        </div>
      </div>

      <div className="relative z-[1] mt-[7.2rem]">
        <div className="flex items-center gap-2 truncate rounded-[16px] bg-black/18 px-3 py-2 text-[12px] font-black leading-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          {statusIcon ? (
            <StatusIcon name={statusIcon} size="sm" className="h-7 w-7" fallbackClassName="opacity-90" />
          ) : (
            <CombatIcon name={combatIcon} size="xs" fallbackClassName="opacity-85" />
          )}
          <span className="truncate">{cardEffectSummary(t, card)}</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <CompactPill tone="neutral">
            <span className="inline-flex items-center gap-1">
              <CombatIcon name="target" size="xs" fallbackClassName="opacity-80" />
              {cardTargetLabel(t, card)}
            </span>
          </CompactPill>
          {recommendedLane ? <CompactPill tone="ally">{laneLabel(t, recommendedLane)}</CompactPill> : null}
          {selected ? (
            <CompactPill tone="ally">
              <span className="inline-flex items-center gap-1">
                <CombatIcon name="target" size="xs" fallbackClassName="opacity-90" />
                {t("frontline.targeting")}
              </span>
            </CompactPill>
          ) : null}
        </div>

        <div className="mt-2 text-[10px] font-black uppercase tracking-[0.14em]">
          <span className={cn(playable ? "text-emerald-200" : "text-rose-200")}>
            {playable ? t("frontline.ready") : t("frontline.needCommand", { amount: Math.max(0, card.cost - command) })}
          </span>
        </div>
      </div>

      {!playable ? (
        <div className="pointer-events-none absolute inset-0 z-[2] grid place-items-center rounded-[24px] bg-[radial-gradient(circle_at_50%_45%,rgba(20,8,8,0.34),rgba(8,5,5,0.62)_72%)] backdrop-blur-[1px]">
          <div className="flex items-center gap-1.5 rounded-full border border-rose-200/40 bg-[#1a0a10]/86 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-rose-100 shadow-[0_8px_22px_rgba(0,0,0,0.4)]">
            <ResourceIcon kind="command" size="small" className="h-4 w-4 opacity-80" />
            <span>{t("frontline.needCommand", { amount: Math.max(0, card.cost - command) })}</span>
          </div>
        </div>
      ) : null}
    </button>
  );
}

function ResolutionFloat({ events }: { events: FrontlineEvent[] }) {
  if (!events.length) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[4]">
      {events.slice(0, 5).map((event, index) => (
        <div
          key={`${event.id}-fx`}
          className={cn(
            "frontline-float-fx absolute left-1/2 rounded-full border border-white/20 px-4 py-2 text-[13px] font-black uppercase tracking-[0.14em]",
            eventFloatClass(event),
          )}
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <span className="inline-flex items-center gap-1.5">
            <CombatIcon name={combatIconForEvent(event)} size="xs" fallbackClassName="opacity-90" />
            <span>{eventFloatLabel(event)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

const CAST_TONE_LABEL_KEY: Record<VisualFxTone, string> = {
  heal: "frontline.castHeal",
  shield: "frontline.castShield",
  summon: "frontline.castSummon",
  stun: "frontline.castStun",
  power: "frontline.castPower",
  damage: "frontline.castStrike",
  breach: "frontline.castStrike",
  ko: "frontline.castStrike",
};

function CardCastFx({ fx }: { fx: CardPlayFx | null }) {
  const { t } = useI18n();
  if (!fx) return null;
  const icon = combatIconForTone(fx.tone);
  const card = fx.cardId.startsWith("leader:") ? null : FRONTLINE_CARD_BY_ID[fx.cardId];
  const fallbackKey = card ? "frontline.castStrike" : "frontline.castCast";
  const label = t(CAST_TONE_LABEL_KEY[fx.tone] ?? fallbackKey).toUpperCase();
  const toneClass =
    fx.tone === "heal"
      ? "border-emerald-200/60 bg-emerald-300/16 text-emerald-50 shadow-[0_0_54px_rgba(75,224,141,0.34)]"
      : fx.tone === "shield"
        ? "border-cyan-100/60 bg-cyan-300/16 text-cyan-50 shadow-[0_0_54px_rgba(101,210,200,0.34)]"
        : fx.tone === "summon"
          ? "border-emerald-100/60 bg-emerald-300/16 text-emerald-50 shadow-[0_0_54px_rgba(75,224,141,0.34)]"
          : fx.tone === "stun" || fx.tone === "power"
            ? "border-[#f5c451]/70 bg-[#f5c451]/16 text-[#fff0b8] shadow-[0_0_58px_rgba(245,196,81,0.38)]"
            : "border-rose-100/60 bg-rose-400/16 text-rose-50 shadow-[0_0_58px_rgba(240,95,114,0.36)]";
  return (
    <div className="pointer-events-none absolute inset-0 z-[6]">
      <div
        className={cn(
          "frontline-cast-wave-fx absolute left-1/2 top-1/2 h-40 w-40 rounded-full border-2",
          fx.tone === "damage" || fx.tone === "ko" ? "border-rose-200/54 bg-rose-300/10" : "border-[#f5c451]/46 bg-[#f5c451]/8",
        )}
      />
      <div
        className={cn(
          "frontline-card-cast-fx absolute left-1/2 top-1/2 grid h-32 w-32 place-items-center rounded-[34px] border-2 backdrop-blur-md",
          toneClass,
        )}
      >
        <div className="grid place-items-center gap-1">
          <CombatIcon name={icon} size="xl" className="h-16 w-16" fallbackClassName="h-16 w-16 drop-shadow-[0_10px_18px_rgba(0,0,0,0.44)]" />
          <div className="rounded-full bg-black/34 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClashSpotlight({ event, index, total }: { event: FrontlineEvent | null; index: number; total: number }) {
  if (!event) return null;
  const tone = visualToneFromEvent(event);
  const icon = combatIconForEvent(event);
  const targetSide = eventPrimaryTargetSide(event);
  const laneLabel = event.lane ? event.lane.toUpperCase() : "CORE";
  const headline =
    event.kind === "breach"
      ? "BREACH"
      : event.kind === "ko"
        ? "KO"
        : event.kind === "heal"
          ? "HEAL"
          : event.kind === "shield"
            ? "SHIELD"
            : event.kind === "summon"
              ? "SUMMON"
              : event.kind === "stun"
                ? "STUN"
                : "HIT";
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[8.8rem] z-[8] hidden justify-center px-4 md:flex">
      <div
        key={event.id}
        className={cn(
          "frontline-clash-spotlight-fx relative min-w-[20rem] max-w-[31rem] overflow-hidden rounded-[26px] border px-4 py-3 shadow-[0_22px_64px_rgba(0,0,0,0.38)] backdrop-blur-md",
          tone === "heal"
            ? "border-emerald-200/42 bg-emerald-300/16 text-emerald-50"
            : tone === "shield"
              ? "border-cyan-100/44 bg-cyan-300/16 text-cyan-50"
              : tone === "breach" || tone === "ko"
                ? "border-[#f5c451]/54 bg-[#f5c451]/18 text-[#fff0bd]"
                : "border-rose-100/42 bg-rose-400/16 text-rose-50",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.16),transparent)]" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-black/26 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_28px_rgba(245,196,81,0.12)]">
            <CombatIcon name={icon} size="lg" className="h-12 w-12" fallbackClassName="h-12 w-12" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/62">
              <span>{laneLabel}</span>
              <span>{Math.min(index + 1, total)}/{Math.max(total, 1)}</span>
              {targetSide ? <span>{targetSide === "ally" ? "ALLY" : "ENEMY"}</span> : null}
            </div>
            <div className="mt-1 flex items-center gap-3">
              <div className="text-2xl font-black uppercase leading-none text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.5)]">{headline}</div>
              {typeof event.amount === "number" ? (
                <div className="rounded-full bg-black/34 px-3 py-1 text-sm font-black text-white">
                  {event.kind === "heal" || event.kind === "shield" ? "+" : "-"}
                  {event.amount}
                </div>
              ) : null}
            </div>
            <div className="mt-1 truncate text-[12px] font-bold text-white/72">{event.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PREVIEW_KIND_META: Record<FrontlinePreview["kind"], { tone: string; icon: CombatAssetIconName; positive: boolean }> = {
  heal: { tone: "border-emerald-200/40 bg-emerald-300/14 text-emerald-50", icon: "heal", positive: true },
  shield: { tone: "border-cyan-100/42 bg-cyan-300/14 text-cyan-50", icon: "shield", positive: true },
  buff: { tone: "border-cyan-100/42 bg-cyan-300/14 text-cyan-50", icon: "advantage", positive: true },
  summon: { tone: "border-emerald-100/40 bg-emerald-200/14 text-emerald-50", icon: "summon", positive: true },
  stun: { tone: "border-[#f5c451]/52 bg-[#f5c451]/16 text-[#fff0bd]", icon: "stun", positive: false },
  core: { tone: "border-rose-100/40 bg-rose-400/14 text-rose-50", icon: "breach", positive: false },
  damage: { tone: "border-rose-100/40 bg-rose-400/14 text-rose-50", icon: "attack", positive: false },
};

function PreviewSpotlight({
  preview,
  cardName,
}: {
  preview: FrontlinePreview | null;
  cardName: string | null;
}) {
  const { t } = useI18n();
  if (!preview || !cardName) return null;
  const meta = PREVIEW_KIND_META[preview.kind];
  const sign = meta.positive ? "+" : "-";
  const detail = preview.targetName
    ? typeof preview.targetHpBefore === "number" && typeof preview.targetHpAfter === "number"
      ? `${preview.targetName} (${preview.targetHpBefore}→${preview.targetHpAfter})`
      : preview.targetName
    : preview.note === "to_core"
      ? t("frontline.enemyCore")
      : preview.scope === "all"
        ? t("frontline.allyPower")
        : null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[8.8rem] z-[6] hidden justify-center px-4 md:flex">
      <div
        className={cn(
          "frontline-clash-spotlight-fx relative min-w-[18rem] max-w-[28rem] overflow-hidden rounded-[24px] border px-4 py-2.5 shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur-md",
          meta.tone,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.16),transparent_36%)]" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-black/26 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
            <CombatIcon name={meta.icon} size="lg" className="h-9 w-9" fallbackClassName="h-9 w-9" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/56">{t("frontline.targeting")}</div>
            <div className="mt-0.5 flex items-center gap-2">
              <div className="rounded-full bg-black/34 px-2.5 py-1 text-base font-black text-white">
                {sign}
                {preview.amount}
                {preview.kind === "stun" ? "T" : ""}
              </div>
              <div className="truncate text-[12px] font-bold text-white/82">{cardName}</div>
            </div>
            {detail ? <div className="mt-0.5 truncate text-[11px] text-white/68">{detail}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardUseToast({ fx }: { fx: CardPlayFx | null }) {
  const { t } = useI18n();
  if (!fx) return null;
  const isLeader = fx.cardId.startsWith("leader:");
  const leaderId = isLeader ? fx.cardId.replace("leader:", "") : "";
  const card = isLeader ? null : FRONTLINE_CARD_BY_ID[fx.cardId];
  const leader = isLeader ? FRONTLINE_LEADER_BY_ID[leaderId] : null;
  const name = card ? frontlineCardName(t, card) : leader ? frontlineLeaderPowerName(t, leader) : t("frontline.power");
  const visual = card ? getFrontlineCardVisualAsset(card) : null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-[7.4rem] z-[9] hidden md:block">
      <div
        key={fx.id}
        className={cn(
          "frontline-card-use-toast-fx flex min-w-[17rem] items-center gap-3 rounded-[24px] border px-3 py-2 shadow-[0_22px_60px_rgba(0,0,0,0.42)] backdrop-blur-md",
          fx.tone === "heal"
            ? "border-emerald-200/40 bg-emerald-300/16"
            : fx.tone === "shield"
              ? "border-cyan-100/40 bg-cyan-300/16"
              : fx.tone === "summon"
                ? "border-emerald-100/40 bg-emerald-300/16"
                : "border-[#f5c451]/44 bg-[#f5c451]/16",
        )}
      >
        <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-[14px] bg-black/26 shadow-[0_12px_28px_rgba(0,0,0,0.34)]">
          {visual ? (
            <VisualAssetImage
              src={visual.cardArtSrc}
              fallbackSrc={visual.fallbackPortraitSrc}
              alt={`${name} art`}
              className="h-full w-full"
              imgClassName="h-full w-full object-contain object-center p-0.5"
              fallback={
                <div className="grid h-full w-full place-items-center">
                  <CombatIcon name={combatIconForTone(fx.tone)} size="md" fallbackClassName="opacity-90" />
                </div>
              }
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <CombatIcon name="leader_power" size="md" fallbackClassName="opacity-90" />
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.38))]" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d498]">{t("frontline.playCard")}</div>
          <div className="mt-1 max-w-[12rem] truncate text-lg font-black leading-none text-white">{name}</div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/72">
            <CombatIcon name={combatIconForTone(fx.tone)} size="xs" fallbackClassName="opacity-90" />
            <span>{card ? cardTargetLabel(t, card) : fx.lane ?? t("frontline.front")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LaneActionTrail({ event }: { event: FrontlineEvent | null }) {
  if (!event || !event.side) return null;
  const targetSide = eventPrimaryTargetSide(event);
  if (!targetSide) return null;
  const tone = visualToneFromEvent(event);
  const isAttack = event.kind === "damage" || event.kind === "stun" || event.kind === "ko";
  const direction = isAttack && event.side === "ally" ? "up" : "down";
  const targetTop = targetSide === "enemy" ? "top-[25%]" : "top-[72%]";
  const trailClass =
    tone === "heal"
      ? "from-emerald-200/0 via-emerald-200/85 to-emerald-200/0 shadow-[0_0_28px_rgba(75,224,141,0.36)]"
      : tone === "shield"
        ? "from-cyan-100/0 via-cyan-100/85 to-cyan-100/0 shadow-[0_0_28px_rgba(101,210,200,0.36)]"
        : tone === "breach" || tone === "ko"
          ? "from-[#f5c451]/0 via-[#f5c451]/90 to-[#f5c451]/0 shadow-[0_0_34px_rgba(245,196,81,0.42)]"
          : "from-rose-200/0 via-rose-200/90 to-rose-200/0 shadow-[0_0_34px_rgba(240,95,114,0.38)]";
  return (
    <div className="pointer-events-none absolute inset-0 z-[6]">
      {isAttack ? (
        <div
          className={cn(
            "absolute left-1/2 top-[31%] h-[38%] w-4 rounded-full bg-gradient-to-b",
            trailClass,
            direction === "up" ? "frontline-action-trail-up-fx" : "frontline-action-trail-down-fx",
          )}
        />
      ) : null}
      <div
        className={cn(
          "frontline-action-impact-fx absolute left-1/2 grid h-24 w-24 place-items-center rounded-full border-2 backdrop-blur-sm",
          targetTop,
          tone === "heal"
            ? "border-emerald-100/55 bg-emerald-300/14 text-emerald-50 shadow-[0_0_44px_rgba(75,224,141,0.34)]"
            : tone === "shield"
              ? "border-cyan-100/55 bg-cyan-300/14 text-cyan-50 shadow-[0_0_44px_rgba(101,210,200,0.34)]"
              : tone === "breach" || tone === "ko"
                ? "border-[#f5c451]/62 bg-[#f5c451]/16 text-[#fff0bd] shadow-[0_0_52px_rgba(245,196,81,0.4)]"
                : "border-rose-100/58 bg-rose-400/16 text-rose-50 shadow-[0_0_50px_rgba(240,95,114,0.38)]",
        )}
      >
        <CombatIcon name={combatIconForEvent(event)} size="lg" className="h-12 w-12" fallbackClassName="h-12 w-12" />
      </div>
    </div>
  );
}

function DeathGhost({ ghost }: { ghost: DeathGhostFx | null }) {
  if (!ghost) return null;
  const visual = getFrontlineHeroVisualAsset(ghost.actor.heroId);
  const topClass = ghost.targetSide === "ally" ? "top-[72%]" : "top-[25%]";
  const sideClass =
    ghost.targetSide === "ally"
      ? "border-cyan-100/28 bg-cyan-200/10 shadow-[0_0_50px_rgba(101,210,200,0.28)]"
      : "border-rose-100/28 bg-rose-300/10 shadow-[0_0_50px_rgba(240,95,114,0.3)]";
  return (
    <div className="pointer-events-none absolute inset-0 z-[8]">
      <div className={cn("frontline-death-soul-fx absolute left-1/2 h-36 w-36 rounded-full border", topClass, sideClass)} />
      <div className={cn("frontline-death-ghost-fx absolute left-1/2 grid place-items-center", topClass)}>
        <div className="relative h-36 w-28">
          <div className="absolute inset-x-1 bottom-0 h-8 rounded-full bg-[#f5c451]/18 blur-md" />
          <VisualAssetImage
            src={visual.standeeSrc}
            fallbackSrc={visual.portraitFallbackSrc}
            alt={ghost.actor.name}
            className="relative h-full w-full rounded-t-[34px] rounded-b-[22px] bg-black/22 shadow-[0_22px_48px_rgba(0,0,0,0.5)]"
            imgClassName={cn("h-full w-full object-top", visual.standeeSrc ? "object-contain" : "object-cover")}
            fallback={
              <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),rgba(0,0,0,0.28))]">
                <GameGlyph kind="heroes" shell="none" className="h-10 w-10" />
              </div>
            }
          />
          <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#f5c451]/48 bg-[#f5c451]/16 text-[#fff0bd] shadow-[0_0_46px_rgba(245,196,81,0.42)]">
            <CombatIcon name="danger" size="lg" className="h-12 w-12" fallbackClassName="h-12 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LaneKoFx({ event }: { event: FrontlineEvent | null }) {
  if (event?.kind !== "ko") return null;
  const targetSide = eventPrimaryTargetSide(event);
  return (
    <div className="pointer-events-none absolute inset-0 z-[7]">
      <div
        className={cn(
          "frontline-ko-burst-fx absolute left-1/2 grid h-28 w-28 place-items-center rounded-full border-2 border-[#f5c451]/64 bg-[#f5c451]/16 text-[#fff0bd] shadow-[0_0_58px_rgba(245,196,81,0.42)] backdrop-blur-sm",
          targetSide === "ally" ? "top-[72%]" : "top-[25%]",
        )}
      >
        <div className="absolute h-40 w-40 rounded-full border border-[#f5c451]/28" />
        <div className="grid place-items-center gap-1">
          <CombatIcon name="danger" size="lg" className="h-12 w-12" fallbackClassName="h-12 w-12" />
          <div className="rounded-full bg-black/40 px-3 py-1 text-sm font-black uppercase tracking-[0.2em] text-white">KO</div>
        </div>
      </div>
    </div>
  );
}

function BattleEndOverlay({ winner }: BattleFinishFx) {
  const { t } = useI18n();
  const allyWin = winner === "ally";
  const title = allyWin ? t("frontline.victory") : winner === "draw" ? t("frontline.draw") : t("frontline.defeat");
  return (
    <div className="frontline-finish-overlay-fx pointer-events-none absolute inset-0 z-[30] grid place-items-center bg-[radial-gradient(circle_at_50%_42%,rgba(245,196,81,0.22),rgba(6,8,13,0.72)_48%,rgba(6,8,13,0.9))]">
      <div
        className={cn(
          "frontline-finish-emblem-fx relative grid min-h-64 w-[min(34rem,90vw)] place-items-center overflow-hidden rounded-[34px] border px-8 py-10 text-center shadow-[0_34px_100px_rgba(0,0,0,0.52)]",
          allyWin
            ? "border-[#f5c451]/50 bg-[#f5c451]/14"
            : winner === "draw"
              ? "border-cyan-200/36 bg-cyan-300/12"
              : "border-rose-200/42 bg-rose-400/14",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />
        <div className="relative grid place-items-center gap-4">
          <div className="grid h-24 w-24 place-items-center rounded-[30px] bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_54px_rgba(245,196,81,0.24)]">
            <CombatIcon name={allyWin ? "advantage" : winner === "draw" ? "clash" : "danger"} size="xl" className="h-20 w-20" fallbackClassName="h-20 w-20" />
          </div>
          <div className="text-[clamp(2.8rem,8vw,6.2rem)] font-black uppercase leading-none tracking-[-0.06em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.7)]">
            {title}
          </div>
          <div className="rounded-full bg-black/32 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#f5d498]">
            {t("frontline.resolveClash")}
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualAssetImage({
  src,
  fallbackSrc,
  alt,
  className,
  imgClassName,
  fallback,
}: {
  src?: string | null;
  fallbackSrc?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallback?: ReactNode;
}) {
  const initialSrc = src ?? fallbackSrc ?? null;
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(initialSrc);
  const [failed, setFailed] = useState(initialSrc === null);

  useEffect(() => {
    const nextSrc = src ?? fallbackSrc ?? null;
    setResolvedSrc(nextSrc);
    setFailed(nextSrc === null);
  }, [fallbackSrc, src]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {resolvedSrc && !failed ? (
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={imgClassName}
          onError={() => {
            if (fallbackSrc && resolvedSrc !== fallbackSrc) {
              setResolvedSrc(fallbackSrc);
              return;
            }
            setFailed(true);
          }}
        />
      ) : (
        fallback ?? null
      )}
    </div>
  );
}

function laneSurfaceClass(tone: "ally" | "enemy" | "neutral", active: boolean, focused: boolean) {
  if (active) {
    return "bg-[radial-gradient(circle_at_50%_46%,rgba(245,196,81,0.22),transparent_46%),linear-gradient(180deg,rgba(111,83,37,0.24),rgba(24,18,13,0.64))] shadow-[0_0_44px_rgba(245,196,81,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]";
  }
  if (tone === "ally") {
    return cn(
      "bg-[radial-gradient(circle_at_50%_50%,rgba(101,210,200,0.12),transparent_55%),linear-gradient(180deg,rgba(53,128,112,0.16),rgba(8,15,15,0.58))] shadow-[inset_0_1px_0_rgba(255,255,255,0.065)]",
      focused && "shadow-[0_0_36px_rgba(94,197,142,0.18),inset_0_1px_0_rgba(255,255,255,0.1)]",
    );
  }
  if (tone === "enemy") {
    return cn(
      "bg-[radial-gradient(circle_at_50%_50%,rgba(240,95,114,0.12),transparent_55%),linear-gradient(180deg,rgba(121,49,58,0.16),rgba(17,10,14,0.6))] shadow-[inset_0_1px_0_rgba(255,255,255,0.065)]",
      focused && "shadow-[0_0_36px_rgba(214,96,104,0.19),inset_0_1px_0_rgba(255,255,255,0.1)]",
    );
  }
  return cn(
    "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.075),transparent_56%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(7,9,12,0.58))] shadow-[inset_0_1px_0_rgba(255,255,255,0.065)]",
    focused && "shadow-[0_0_32px_rgba(255,255,255,0.09),inset_0_1px_0_rgba(255,255,255,0.1)]",
  );
}

function cardSurfaceClass(tone: string, selected: boolean, playable: boolean) {
  const selectedGlow = selected
    ? "-translate-y-1 ring-2 ring-[#f5c451]/34 shadow-[0_0_40px_rgba(245,196,81,0.24),0_22px_48px_rgba(0,0,0,0.42)]"
    : "";
  const base = playable ? "" : "bg-[linear-gradient(180deg,rgba(45,45,48,0.9),rgba(15,15,18,0.96))] text-white/60";
  if (!playable) return cn(base, selectedGlow);
  if (tone === "order") {
    return cn("bg-[radial-gradient(circle_at_72%_30%,rgba(160,222,255,0.22),transparent_35%),linear-gradient(180deg,rgba(50,108,134,0.98),rgba(10,22,32,0.99))] text-sky-100", selectedGlow);
  }
  if (tone === "tactic") {
    return cn("bg-[radial-gradient(circle_at_72%_30%,rgba(255,188,127,0.22),transparent_35%),linear-gradient(180deg,rgba(145,86,55,0.98),rgba(35,18,12,0.99))] text-orange-100", selectedGlow);
  }
  return cn("bg-[radial-gradient(circle_at_72%_30%,rgba(149,242,173,0.2),transparent_35%),linear-gradient(180deg,rgba(77,126,85,0.98),rgba(12,30,18,0.99))] text-emerald-100", selectedGlow);
}

function CoreTotem({
  leaderId,
  leaderNameOverride,
  portraitSrc,
  title,
  hp,
  maxHp,
  accent,
  flash,
  powerCooldown,
  powerReadyExtra,
}: {
  leaderId: string;
  leaderNameOverride?: string | null;
  portraitSrc?: string | null;
  title: string;
  hp: number;
  maxHp: number;
  accent: "ally" | "enemy";
  flash?: boolean;
  powerCooldown?: number;
  powerReadyExtra?: boolean;
}) {
  const { t } = useI18n();
  const leader = FRONTLINE_LEADER_BY_ID[leaderId];
  const leaderName = leaderNameOverride ?? frontlineLeaderName(t, leader);
  const width = Math.max(0, (hp / maxHp) * 100);
  const cooldownMax = leader?.power.cooldown ?? 0;
  const cooldownRemaining = typeof powerCooldown === "number" ? Math.max(0, powerCooldown) : 0;
  const cooldownProgress = cooldownMax > 0 ? Math.min(1, cooldownRemaining / cooldownMax) : 0;
  const cooldownDeg = Math.round((1 - cooldownProgress) * 360);
  const showRing = typeof powerCooldown === "number";
  const powerReady = cooldownRemaining === 0 && (powerReadyExtra ?? true);
  const powerLabel = cooldownRemaining > 0 ? `cd ${cooldownRemaining}` : t("frontline.ready");
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[26px] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_42px_rgba(0,0,0,0.28)]",
        accent === "ally"
          ? "bg-[linear-gradient(180deg,rgba(35,83,112,0.58),rgba(8,12,17,0.86))]"
          : "bg-[linear-gradient(180deg,rgba(110,44,55,0.58),rgba(14,8,13,0.86))]",
        flash && "frontline-core-hit-fx ring-2 ring-[#f5c451]/24 shadow-[0_0_34px_rgba(245,196,81,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]",
      )}
    >
      <div className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.42),transparent)]" />
      <div className="flex items-start gap-3">
        <div className="relative h-16 w-14 shrink-0">
          {showRing ? (
            <div
              className={cn(
                "pointer-events-none absolute -inset-1 rounded-[20px]",
                powerReady && "frontline-power-ready-ring-fx",
              )}
              style={{
                background:
                  cooldownProgress > 0
                    ? `conic-gradient(rgba(245,196,81,0.86) 0deg ${cooldownDeg}deg, rgba(255,255,255,0.08) ${cooldownDeg}deg 360deg)`
                    : powerReady
                      ? "conic-gradient(rgba(245,196,81,0.86) 0deg 360deg)"
                      : "conic-gradient(rgba(255,255,255,0.16) 0deg 360deg)",
                WebkitMask: "radial-gradient(circle, transparent 64%, black 66%)",
                mask: "radial-gradient(circle, transparent 64%, black 66%)",
              }}
              aria-hidden
            />
          ) : null}
          <ArtPortrait
            src={portraitSrc ?? getLeaderPortrait(leaderId)}
            alt={leaderName}
            className="h-16 w-14 rounded-[18px] bg-black/20 object-cover shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
            fallback={<GameGlyph kind="battle" shell="none" className="h-6 w-6" />}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
            <CombatIcon name="core" size="xs" fallbackClassName="opacity-80" />
            <span>{title}</span>
          </div>
          <div className="mt-1 truncate text-lg font-black text-white">{leaderName}</div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/24">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#ff8a5b,#f5d498)]" style={{ width: `${width}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/54">
            <span>{hp}/{maxHp}</span>
            <span className="inline-flex items-center gap-1">
              <CombatIcon name="leader_power" size="xs" fallbackClassName="opacity-75" />
              {powerLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const ENCOUNTER_KIND_META: Record<FrontlineEncounterBadgeKind, { labelKey: string; tone: string; icon: CombatAssetIconName }> = {
  boss: {
    labelKey: "frontline.encounterBoss",
    tone: "border-[#f5c451]/56 bg-[linear-gradient(180deg,rgba(245,196,81,0.22),rgba(40,18,8,0.8))] text-[#fff0bd] shadow-[0_18px_48px_rgba(245,196,81,0.22)]",
    icon: "leader_power",
  },
  elite: {
    labelKey: "frontline.encounterElite",
    tone: "border-violet-300/40 bg-[linear-gradient(180deg,rgba(192,132,252,0.22),rgba(28,12,46,0.78))] text-violet-50 shadow-[0_18px_48px_rgba(192,132,252,0.22)]",
    icon: "advantage",
  },
  danger: {
    labelKey: "frontline.encounterDanger",
    tone: "border-rose-300/42 bg-[linear-gradient(180deg,rgba(240,95,114,0.22),rgba(54,12,20,0.8))] text-rose-50 shadow-[0_18px_48px_rgba(240,95,114,0.22)]",
    icon: "danger",
  },
};

function EncounterBanner({ kind, title }: { kind: FrontlineEncounterBadgeKind; title: string | null }) {
  const { t } = useI18n();
  const meta = ENCOUNTER_KIND_META[kind];
  const label = t(meta.labelKey);
  const tone = meta.tone;
  const icon = meta.icon;
  return (
    <div className={cn("flex items-center justify-center gap-3 rounded-[20px] border px-4 py-2 backdrop-blur-md", tone)}>
      <CombatIcon name={icon} size="md" className="h-7 w-7" fallbackClassName="h-7 w-7" />
      <div className="flex flex-col items-center sm:flex-row sm:items-baseline sm:gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.32em]">{label}</span>
        {title ? <span className="text-sm font-black uppercase tracking-[0.18em] text-white/86">{title}</span> : null}
      </div>
    </div>
  );
}

function BossColossusOverlay({ assetKey }: { assetKey: string }) {
  const src = getFrontlineBossAssetSrc(assetKey);
  if (!src) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-6 bottom-[26%] z-0 flex items-start justify-center overflow-hidden">
      <div className="relative h-full w-full max-w-[58rem]">
        <div className="absolute inset-x-[6%] inset-y-0 rounded-[44px] bg-[radial-gradient(ellipse_at_50%_38%,rgba(245,140,80,0.32),rgba(80,16,12,0.28)_42%,transparent_72%)] blur-md" />
        <img
          src={src}
          alt=""
          aria-hidden
          className="frontline-boss-breath-fx absolute inset-x-0 top-0 mx-auto h-full w-auto max-w-full object-contain object-top opacity-92 mix-blend-screen drop-shadow-[0_28px_56px_rgba(180,70,40,0.42)]"
          loading="eager"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(8,6,12,0.92))]" />
      </div>
    </div>
  );
}

function BossBanner({
  boss,
  bossState,
  modifiers,
  cardCostMod,
}: {
  boss: FrontlineBossConfig;
  bossState: NonNullable<FrontlineBattleState["bossState"]>;
  modifiers: { enemyCoreBonus?: number; enemyStartingCommandBonus?: number } | null;
  cardCostMod: number;
}) {
  const { t } = useI18n();
  const inferno = boss.signatures.find((sig) => sig.type === "inferno_wave");
  const veil = boss.signatures.find((sig) => sig.type === "twilight_veil");
  const bossName = t(boss.nameKey);

  const infernoBadge =
    inferno && inferno.type === "inferno_wave"
      ? (() => {
          const countdown = bossState.infernoCountdown;
          const ready = countdown <= 1;
          return {
            ready,
            label: ready ? t("frontline.infernoReady") : t("frontline.infernoCharge", { amount: countdown }),
          };
        })()
      : null;
  const twilightBadge =
    veil && veil.type === "twilight_veil"
      ? (() => {
          const countdown = bossState.twilightCountdown;
          const ready = countdown <= 1;
          return {
            ready,
            label: ready ? t("frontline.twilightReady") : t("frontline.twilightCharge", { amount: countdown }),
          };
        })()
      : null;

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#f5c451]/56 bg-[linear-gradient(180deg,rgba(245,140,80,0.22),rgba(40,12,8,0.86))] px-4 py-3 text-[#fff0bd] shadow-[0_18px_48px_rgba(245,196,81,0.22)] backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.16),transparent_36%)]" />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CombatIcon name="leader_power" size="md" className="h-7 w-7" fallbackClassName="h-7 w-7" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.32em] text-[#fff0bd]/80">{t("frontline.encounterBoss")}</div>
            <div className="text-base font-black uppercase tracking-[0.16em]">{bossName}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {infernoBadge ? (
            <div
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em]",
                infernoBadge.ready
                  ? "frontline-power-ready-ring-fx border-rose-200/72 bg-rose-400/24 text-rose-50"
                  : "border-[#f5c451]/56 bg-[#1a0a08]/72 text-[#fff0bd]",
              )}
            >
              {infernoBadge.label}
            </div>
          ) : null}
          {twilightBadge ? (
            <div
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em]",
                twilightBadge.ready
                  ? "frontline-power-ready-ring-fx border-violet-200/72 bg-violet-400/24 text-violet-50"
                  : "border-violet-300/56 bg-[#160a1f]/72 text-violet-100",
              )}
            >
              {twilightBadge.label}
            </div>
          ) : null}
          {cardCostMod > 0 ? (
            <div className="rounded-full border border-violet-300/72 bg-violet-500/24 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-violet-50">
              {t("frontline.twilightActive", { amount: cardCostMod })}
            </div>
          ) : null}
        </div>
      </div>
      {modifiers && (modifiers.enemyCoreBonus || modifiers.enemyStartingCommandBonus) ? (
        <div className="relative mt-2 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#fff0bd]/82">
          {modifiers.enemyCoreBonus ? (
            <span className="rounded-full border border-[#f5c451]/40 bg-black/30 px-2 py-0.5">
              {t("frontline.modifierEnemyCore", { amount: modifiers.enemyCoreBonus })}
            </span>
          ) : null}
          {modifiers.enemyStartingCommandBonus ? (
            <span className="rounded-full border border-[#f5c451]/40 bg-black/30 px-2 py-0.5">
              {t("frontline.modifierEnemyCommand", { amount: modifiers.enemyStartingCommandBonus })}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CoreShockOverlay({
  shock,
  side,
}: {
  shock: { side: "ally" | "enemy"; amount: number; key: number } | null;
  side: "ally" | "enemy";
}) {
  if (!shock || shock.side !== side) return null;
  return (
    <div key={shock.key} className="pointer-events-none absolute inset-0 z-[3]">
      <span className="frontline-core-shock-flash-fx absolute inset-0 rounded-[26px] bg-[radial-gradient(circle_at_50%_50%,rgba(245,196,81,0.45),rgba(240,95,114,0.22)_42%,transparent_72%)]" />
      <div className="frontline-core-shock-fx absolute left-1/2 top-1/2 grid place-items-center">
        <div className="rounded-full border-2 border-[#f5c451]/70 bg-[#1a0a08]/82 px-4 py-1.5 text-2xl font-black text-[#fff0bd] shadow-[0_0_42px_rgba(245,196,81,0.46)] backdrop-blur-sm">
          -{shock.amount}
        </div>
      </div>
    </div>
  );
}

function CommandPips({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/[0.055] px-2.5 py-1.5">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={cn(
            "grid h-6 w-6 place-items-center rounded-full transition",
            index < value ? "opacity-100 drop-shadow-[0_0_12px_rgba(245,212,152,0.55)]" : "opacity-28 grayscale",
          )}
        >
          <ResourceIcon kind="command" size="small" className="h-5 w-5" />
        </span>
      ))}
    </div>
  );
}

function CompactPressureBar({ allyScore, enemyScore }: { allyScore: number; enemyScore: number }) {
  const total = Math.max(allyScore + enemyScore, 1);
  const allyWidth = Math.max(6, Math.round((allyScore / total) * 100));
  const enemyWidth = Math.max(6, 100 - allyWidth);
  return (
    <div className="relative z-[1] mt-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.12em] text-white/42">
      <span>{allyScore}</span>
      <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-white/8">
        <div className="bg-[linear-gradient(90deg,#65d2c8,#8adfff)]" style={{ width: `${allyWidth}%` }} />
        <div className="bg-[linear-gradient(90deg,#ffb36d,#f05f72)]" style={{ width: `${enemyWidth}%` }} />
      </div>
      <span>{enemyScore}</span>
    </div>
  );
}

function FrontlineHeroPiece({
  actor,
  support,
  accent,
  pressured,
  visualState,
  scorch,
}: {
  actor: FrontlineBattleState["lanes"]["left"]["allyHero"];
  support: FrontlineBattleState["lanes"]["left"]["allySupport"];
  accent: "ally" | "enemy";
  pressured?: boolean;
  visualState?: HeroVisualState;
  scorch?: number;
}) {
  const { t } = useI18n();
  if (!actor) {
    return (
      <div className="grid h-[9.25rem] place-items-center rounded-[26px] bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.07),transparent_58%)] text-[10px] font-black uppercase tracking-[0.16em] text-white/36">
        <span className="inline-flex items-center gap-1.5">
          <CombatIcon name="breach" size="sm" fallbackClassName="opacity-55" />
          {t("frontline.openFront")}
        </span>
      </div>
    );
  }

  const hpWidth = Math.max(0, (actor.hp / actor.maxHp) * 100);
  const fx = visualState ?? { idle: true };
  const sideGlow =
    accent === "ally"
      ? "bg-[radial-gradient(circle,rgba(101,210,200,0.18),transparent_66%)]"
      : "bg-[radial-gradient(circle,rgba(240,95,114,0.18),transparent_66%)]";
  const visual = getFrontlineHeroVisualAsset(actor.heroId);
  const actorName = tx(t, `frontlineData.heroes.${actor.heroId}.name`, actor.name);
  const actorRole = tx(t, `frontlineData.heroes.${actor.heroId}.role`, actor.role);
  const supportName = support ? frontlineSupportName(t, support) : "";
  const heroDef = FRONTLINE_UNIT_BY_ID[actor.heroId];
  const traitInfo = heroDef ? frontlineTraitInfo(t, heroDef.trait) : null;
  return (
    <div
      title={`${actorName} - ${actorRole}${supportName ? ` - support ${supportName}` : ""}`}
      className={cn(
        "relative min-h-[9.25rem] overflow-visible px-2 pb-2 pt-1",
        pressured && "ring-2 ring-rose-300/24 shadow-[0_0_34px_rgba(244,99,112,0.2)]",
        fx.hit && "frontline-hit-fx",
        fx.ko && "frontline-ko-fx",
      )}
    >
      <div className={cn("absolute left-2 top-0 h-28 w-28 blur-xl", sideGlow)} />
      {fx.selected || fx.targeted ? (
        <div
          className={cn(
            "frontline-target-pulse-fx pointer-events-none absolute left-1 top-0 h-32 w-32 rounded-full blur-md",
            accent === "ally" ? "bg-cyan-300/15" : "bg-rose-300/15",
          )}
        />
      ) : null}
      <div className="absolute left-4 bottom-4 h-4 w-28 rounded-full bg-black/42 blur-sm" />
      <div
        className={cn(
          "absolute bottom-3 left-2 h-7 w-[8.8rem] rounded-[999px] border shadow-[0_10px_24px_rgba(0,0,0,0.32)]",
          accent === "ally"
            ? "border-cyan-200/18 bg-[linear-gradient(90deg,rgba(12,55,62,0.72),rgba(91,221,206,0.2),rgba(10,26,30,0.68))]"
            : "border-rose-200/18 bg-[linear-gradient(90deg,rgba(62,13,23,0.72),rgba(240,95,114,0.2),rgba(25,8,12,0.68))]",
        )}
      />
      <div className="relative z-[1] flex items-end gap-2">
        <div className="relative shrink-0">
          <div
            className={cn(
              "absolute -inset-1 rounded-[26px] blur-sm",
              accent === "ally" ? "bg-cyan-300/13" : "bg-rose-300/13",
              (fx.shielded || fx.healed || fx.breachSource) && "opacity-90",
            )}
          />
          {fx.shielded ? (
            <div className="frontline-shield-fx pointer-events-none absolute -inset-4 z-[2] rounded-[34px] border border-cyan-200/40 bg-cyan-200/10 shadow-[0_0_30px_rgba(101,210,200,0.3)]" />
          ) : null}
          {fx.healed ? (
            <div className="frontline-heal-fx pointer-events-none absolute -inset-4 z-[2] rounded-[34px] border border-emerald-200/36 bg-emerald-200/10 shadow-[0_0_30px_rgba(75,224,141,0.28)]" />
          ) : null}
          {fx.floatLabel ? <HeroFxBadge tone={fx.floatTone ?? "damage"}>{fx.floatLabel}</HeroFxBadge> : null}
          <VisualAssetImage
            src={visual.standeeSrc}
            fallbackSrc={visual.portraitFallbackSrc}
            alt={actorName}
            className={cn(
              "relative h-32 w-24 rounded-t-[34px] rounded-b-[22px] bg-black/20 shadow-[0_22px_44px_rgba(0,0,0,0.46)] transition duration-300 group-hover:scale-[1.045]",
              accent === "ally" ? "ring-2 ring-cyan-200/16" : "ring-2 ring-rose-200/16",
              fx.idle && !fx.attacking && !fx.hit && !fx.ko && "frontline-idle-fx",
              fx.attacking && (accent === "ally" ? "frontline-attack-ally-fx" : "frontline-attack-enemy-fx"),
              fx.selected && "ring-[#f5c451]/40 shadow-[0_0_34px_rgba(245,196,81,0.22),0_22px_44px_rgba(0,0,0,0.46)]",
              fx.targeted && "ring-[#f5c451]/55",
              fx.breachSource && "shadow-[0_0_38px_rgba(245,196,81,0.34),0_22px_44px_rgba(0,0,0,0.46)]",
              actor.stun > 0 && "frontline-stun-pulse-fx",
            )}
            imgClassName={cn("h-full w-full object-top", visual.standeeSrc ? "object-contain" : "object-cover")}
            fallback={
              <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),rgba(0,0,0,0.28))]">
                <GameGlyph kind="heroes" shell="none" className="h-10 w-10" />
              </div>
            }
          />
          <div className="absolute -bottom-1 left-1/2 h-3 w-20 -translate-x-1/2 rounded-full bg-[#f5d498]/22 blur-sm" />
        </div>
        <div className="min-w-0 flex-1 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-lg font-black leading-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]">{actorName}</div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/52">
                <span className="inline-flex items-center gap-1">
                  <CombatIcon name="attack" size="xs" fallbackClassName="opacity-75" />
                  <span>{actor.atk + actor.tempAtk}</span>
                </span>
                {traitInfo ? (
                  <span
                    title={`${traitInfo.label} — ${traitInfo.description}`}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5",
                      accent === "ally"
                        ? "border-cyan-200/30 bg-cyan-300/12 text-cyan-100/82"
                        : "border-rose-200/30 bg-rose-300/12 text-rose-100/82",
                    )}
                  >
                    <StatusIcon name={traitInfo.icon} size="sm" className="h-4 w-4" fallbackClassName="opacity-90" />
                    <span className="truncate max-w-[5.2rem]">{traitInfo.label}</span>
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              {support ? <SupportToken support={support} active={Boolean(fx.summoned)} /> : null}
              {actor.stun > 0 ? (
                <CompactPill tone="enemy">
                  <span className="inline-flex items-center gap-1">
                    <StatusIcon name="debuff" size="sm" className="h-6 w-6" fallbackClassName="opacity-90" />
                    {actor.stun}
                  </span>
                </CompactPill>
              ) : null}
              {scorch && scorch > 0 ? (
                <CompactPill tone="enemy">
                  <span className="inline-flex items-center gap-1">
                    <StatusIcon name="poison" size="sm" className="h-6 w-6" fallbackClassName="opacity-90" />
                    {scorch}
                  </span>
                </CompactPill>
              ) : null}
              {pressured ? (
                <CompactPill tone="enemy">
                  <span className="inline-flex items-center gap-1">
                    <CombatIcon name="danger" size="xs" fallbackClassName="opacity-85" />
                    {t("frontline.low")}
                  </span>
                </CompactPill>
              ) : null}
            </div>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/38 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#ff6d69,#ffd86f)] shadow-[0_0_16px_rgba(255,216,111,0.24)]"
              style={{ width: `${hpWidth}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/72">
            <span>{actor.hp}/{actor.maxHp}</span>
            {actor.shield > 0 ? (
              <span className="inline-flex items-center gap-1">
                <StatusIcon name="guard" size="sm" className="h-6 w-6" fallbackClassName="opacity-90" />
                {actor.shield}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniActorLine({
  actor,
  support,
  side,
}: {
  actor: FrontlineBattleState["lanes"]["left"]["allyHero"];
  support: FrontlineBattleState["lanes"]["left"]["allySupport"];
  side: "ally" | "enemy";
}) {
  const { t } = useI18n();
  const actorName = actor ? tx(t, `frontlineData.heroes.${actor.heroId}.name`, actor.name) : t("frontline.openFront");
  const supportName = support ? frontlineSupportName(t, support) : "";
  return (
    <div className="flex items-center justify-between gap-2 rounded-[14px] bg-black/18 px-3 py-2">
      <div className="flex items-center gap-2">
        <div className={cn("h-2.5 w-2.5 rounded-full", side === "ally" ? "bg-[#65d2c8]" : "bg-[#f05f72]")} />
        <div className="text-[11px] font-black text-white">{actorName}</div>
      </div>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-white/48">
        {!actor ? <CombatIcon name="breach" size="xs" fallbackClassName="opacity-70" /> : null}
        <span>{actor ? `${actor.hp}/${actor.maxHp}${supportName ? ` - ${supportName}` : ""}` : t("frontline.breach")}</span>
      </div>
    </div>
  );
}

function HeroFxBadge({ tone, children }: { tone: VisualFxTone; children: ReactNode }) {
  return (
    <div
      className={cn(
        "frontline-float-fx pointer-events-none absolute left-1/2 top-2 z-[5] -translate-x-1/2 rounded-full border border-white/20 px-3.5 py-1.5 text-[12px] font-black uppercase tracking-[0.14em]",
        tone === "heal"
          ? "bg-emerald-300 text-[#06140b] shadow-[0_0_24px_rgba(75,224,141,0.42)]"
          : tone === "shield"
            ? "bg-cyan-200 text-[#051417] shadow-[0_0_24px_rgba(101,210,200,0.4)]"
            : tone === "breach" || tone === "ko"
              ? "bg-[#f5c451] text-[#221509] shadow-[0_0_28px_rgba(245,196,81,0.48)]"
              : tone === "summon"
                ? "bg-emerald-200 text-[#06140b] shadow-[0_0_24px_rgba(75,224,141,0.34)]"
                : "bg-[#ff6f7d] text-white shadow-[0_0_24px_rgba(240,95,114,0.42)]",
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <CombatIcon name={combatIconForTone(tone)} size="xs" fallbackClassName="opacity-90" />
        <span>{children}</span>
      </span>
    </div>
  );
}

function SupportToken({ support, active }: { support: FrontlineBattleState["lanes"]["left"]["allySupport"]; active?: boolean }) {
  const { t } = useI18n();
  if (!support) return null;
  const icon: CombatAssetIconName = support.effect?.type === "shield" ? "shield" : support.effect?.type === "mark" ? "target" : "summon";
  const supportName = frontlineSupportName(t, support);
  return (
    <div
      title={`${supportName} - ${support.duration}`}
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-[16px] bg-[radial-gradient(circle_at_42%_28%,rgba(255,255,255,0.18),rgba(0,0,0,0.28))] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_18px_rgba(245,196,81,0.14)]",
        active && "frontline-support-pop-fx ring-2 ring-[#f5c451]/28",
      )}
    >
      <CombatIcon name={icon} size="sm" fallbackClassName="opacity-95" />
      <div className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-[#f5c451] text-[9px] font-black text-[#221509] shadow-[0_0_12px_rgba(245,196,81,0.35)]">
        {support.duration}
      </div>
    </div>
  );
}

function FlowStep({ icon, label, active, done }: { icon: CombatAssetIconName; label: string; active?: boolean; done?: boolean }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em]",
        active
          ? "bg-[#f5c451]/12 text-[#f5d498] shadow-[0_0_18px_rgba(245,196,81,0.12)]"
          : done
            ? "bg-emerald-300/10 text-emerald-100"
            : "bg-white/[0.045] text-white/48",
      )}
    >
      <CombatIcon name={icon} size="xs" fallbackClassName="opacity-85" />
      <span>{label}</span>
    </div>
  );
}

function StatusTag({
  tone,
  label,
  detail,
  icon,
}: {
  tone: "ally" | "enemy" | "neutral";
  label: string;
  detail?: string;
  icon?: CombatAssetIconName;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] shadow-[0_0_18px_rgba(255,255,255,0.04)]",
        tone === "ally"
          ? "bg-[#65d2c8]/13 text-cyan-100"
          : tone === "enemy"
            ? "bg-[#f05f72]/14 text-rose-100"
            : "bg-white/[0.055] text-white/62",
      )}
    >
      {icon ? <CombatIcon name={icon} size="xs" fallbackClassName="opacity-85" /> : null}
      <span>
        {label}
        {detail ? ` ${detail}` : ""}
      </span>
    </div>
  );
}

function CompactPill({
  tone,
  children,
}: {
  tone: "ally" | "enemy" | "neutral";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em]",
        tone === "ally"
          ? "bg-[#65d2c8]/13 text-cyan-100"
          : tone === "enemy"
            ? "bg-[#f05f72]/14 text-rose-100"
            : "bg-white/[0.055] text-white/62",
      )}
    >
      {children}
    </div>
  );
}
