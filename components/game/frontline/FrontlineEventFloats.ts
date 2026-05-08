import type { FrontlineEvent } from "@/features/frontline/types";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import type { ResolutionFloatItem } from "./FrontlineResolutionFloat";

export function combatIconForEvent(event: Pick<FrontlineEvent, "kind"> | null | undefined): CombatAssetIconName {
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

export function eventFloatLabel(event: FrontlineEvent) {
  if (event.kind === "breach") return `BREACH -${event.amount ?? ""}`;
  if (event.kind === "ko") return "KO";
  if (event.kind === "heal") return `+${event.amount ?? ""}`;
  if (event.kind === "shield") return `SHD +${event.amount ?? ""}`;
  if (event.kind === "damage") return `-${event.amount ?? ""}`;
  if (event.kind === "summon") return "SUMMON";
  if (event.kind === "stun") return "STUN";
  return event.label;
}

export function eventFloatClass(event: FrontlineEvent) {
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

export function toResolutionFloatItems(events: FrontlineEvent[]): ResolutionFloatItem[] {
  return events.slice(0, 5).map((event) => ({
    id: event.id,
    icon: combatIconForEvent(event),
    label: eventFloatLabel(event),
    className: eventFloatClass(event),
  }));
}
