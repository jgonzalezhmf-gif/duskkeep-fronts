import type { FrontlineCardDef, FrontlineEvent } from "@/features/frontline/types";
import type { FrontlineLane } from "@/lib/types";
import type { FrontlineCardPlayFx } from "./FrontlineCardCastFx";
import { eventFloatLabel } from "./FrontlineEventFloats";
import type { HeroVisualState } from "./FrontlineHeroPiece";
import type { FrontlineVisualFxTone } from "./FrontlineLaneActionTrail";

export function oppositeSide(side: "ally" | "enemy") {
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

export function visualToneFromEvent(event: FrontlineEvent): FrontlineVisualFxTone {
  if (event.kind === "heal") return "heal";
  if (event.kind === "shield") return "shield";
  if (event.kind === "breach") return "breach";
  if (event.kind === "ko") return "ko";
  if (event.kind === "summon") return "summon";
  if (event.kind === "stun") return "stun";
  return "damage";
}

export function visualToneFromCard(card: FrontlineCardDef): FrontlineVisualFxTone {
  if (card.kind === "summon") return "summon";
  if (card.effect.type === "heal_front") return "heal";
  if (card.effect.type === "hero_strike" && card.effect.shield) return "shield";
  if (card.effect.type === "rally") return "power";
  if (card.effect.type === "stun_front") return "stun";
  return "damage";
}

export function visualTargetSideForCard(card: FrontlineCardDef): "ally" | "enemy" | "both" | null {
  if (card.target === "ally_front") return "ally";
  if (card.target === "enemy_front") return "enemy";
  if (card.target === "any_front") return "both";
  return null;
}

export function visualTargetSideForLeader(effectType: "beam" | "rally"): "ally" | "enemy" {
  return effectType === "beam" ? "enemy" : "ally";
}

function sideMatchesTarget(side: "ally" | "enemy", targetSide: FrontlineCardPlayFx["targetSide"]) {
  return targetSide === "both" || targetSide === side;
}

export function eventPrimaryTargetSide(event: FrontlineEvent): "ally" | "enemy" | null {
  if (!event.side) return null;
  if (event.kind === "damage" || event.kind === "ko" || event.kind === "stun" || event.kind === "breach") {
    return oppositeSide(event.side);
  }
  if (event.kind === "heal" || event.kind === "shield" || event.kind === "summon") return event.side;
  return null;
}

export function cardPlayEventForSide(cardFx: FrontlineCardPlayFx | null, lane: FrontlineLane, side: "ally" | "enemy") {
  if (!cardFx) return null;
  return (
    cardFx.events.find((event) => event.lane === lane && eventPrimaryTargetSide(event) === side) ??
    (cardFx.lane === lane && sideMatchesTarget(side, cardFx.targetSide) ? cardFx.events[0] ?? null : null)
  );
}

export function heroVisualState(input: {
  side: "ally" | "enemy";
  focused: boolean;
  targeted: boolean;
  activeEvent: FrontlineEvent | null;
  cardFx: FrontlineCardPlayFx | null;
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

  const traitOwnsSide = activeEvent?.trait && eventSourcesSide(activeEvent, side);
  const synergyOwnsSide =
    activeEvent?.signature === "synergy" && activeEvent.side === side && activeEvent.signatureId;
  const synergyLabel = synergyOwnsSide
    ? activeEvent!.label.replace(/^Synergy:\s*/i, "")
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
    trait: traitOwnsSide ? activeEvent!.trait : undefined,
    synergy: synergyOwnsSide && synergyLabel
      ? { id: activeEvent!.signatureId!, label: synergyLabel }
      : undefined,
  } satisfies HeroVisualState;
}
