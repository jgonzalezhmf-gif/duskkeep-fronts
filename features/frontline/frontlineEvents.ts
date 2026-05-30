import type { FrontlineBattleState, FrontlineEvent, FrontlineSnapshot } from "./types";
import { cloneState } from "./frontlineStateClone";

export function pushEvent(state: FrontlineBattleState, event: Omit<FrontlineEvent, "id">) {
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
  if (event.side === "enemy" && (event.kind === "card" || event.kind === "power")) return true;
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

export function pushResolution(state: FrontlineBattleState, line: string) {
  state.lastResolution.unshift(line);
  state.lastResolution = state.lastResolution.slice(0, 8);
}
