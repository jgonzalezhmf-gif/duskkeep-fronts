import type { FrontlineBattleState, FrontlineEvent, FrontlineSnapshot } from "@/features/frontline/types";
import type { FrontlineDeathGhostFx } from "./FrontlineDeathGhost";
import { eventPrimaryTargetSide } from "./FrontlineVisualState";

export function isResolutionEvent(event: FrontlineEvent) {
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

export function truncateAtWinner(final: FrontlineBattleState, snapshots: FrontlineSnapshot[]) {
  if (!final.winner || snapshots.length === 0) {
    return { snapshots, allowedEventIds: new Set(snapshots.map((s) => s.eventId).concat(snapshots.flatMap((s) => s.state.events.map((e) => e.id)))) };
  }
  const killSnapshotIndex = snapshots.findIndex(
    (snap) => snap.state.allyCoreHp <= 0 || snap.state.enemyCoreHp <= 0,
  );
  if (killSnapshotIndex < 0) {
    return { snapshots, allowedEventIds: new Set(snapshots.map((s) => s.eventId)) };
  }
  const trimmed = snapshots.slice(0, killSnapshotIndex + 1);
  return { snapshots: trimmed, allowedEventIds: new Set(trimmed.map((s) => s.eventId)) };
}

export function collectNewEvents(previous: FrontlineBattleState, next: FrontlineBattleState) {
  const previousEventIds = new Set(previous.events.map((event) => event.id));
  return next.events.filter((event) => !previousEventIds.has(event.id)).reverse();
}

export function eventDuration(event: FrontlineEvent) {
  if (event.kind === "breach") return 1100;
  if (event.kind === "ko") return 950;
  if (event.kind === "summon") return 850;
  if (event.kind === "boss_signature" && event.signature === "cast") return 1100;
  if (event.kind === "heal" || event.kind === "shield" || event.kind === "stun") return 720;
  return 700;
}

export function resolutionSequenceDuration(events: FrontlineEvent[]) {
  const meaningfulEvents = events.filter(isResolutionEvent).slice(0, 12);
  if (!meaningfulEvents.length) return 1800;
  return Math.min(
    15000,
    meaningfulEvents.reduce((total, event) => total + eventDuration(event), 0) + 2300,
  );
}

export function collectDeathGhosts(previous: FrontlineBattleState, events: FrontlineEvent[]): FrontlineDeathGhostFx[] {
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
