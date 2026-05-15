import type { GameIconTone } from "@/components/game/shared/GameIcon";
import type { ModeIconName } from "@/components/game/shared/ModeIcon";
import { EVENTS } from "@/data/events";
import { TD_EVENTS } from "@/data/towerDefense";
import { eventUnlockLevel } from "@/data/unlocks";
import { FRONTLINE_EVENT_PRESET_BY_EVENT_ID } from "@/features/frontline/encounterPresets";
import type { Rewards } from "@/lib/types";

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export type FrontlineEventOperation = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  presetId: string;
  rewards: Rewards;
  firstClearRewards?: Rewards;
  unlockLevel: number;
  tone: GameIconTone;
  icon: ModeIconName;
  signature: string;
  mutator: string;
  threat: "common" | "rare" | "epic";
};

const EVENT_TONES: Record<string, { tone: GameIconTone; icon: FrontlineEventOperation["icon"] }> = {
  gold_rush: {
    tone: "gold",
    icon: "daily_event",
  },
  arcane_surge: {
    tone: "violet",
    icon: "challenge",
  },
};

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function tx(t: TranslateFn, key: string, fallback: string, params?: Record<string, string | number>) {
  const value = t(key, params);
  return value === key ? fallback : value;
}

function eventOperationText(t: TranslateFn, eventId: string, field: "name" | "description" | "signature" | "mutator", fallback: string) {
  return tx(t, `eventsScreen.operations.${eventId}.${field}`, fallback);
}

export function eventOperations(t: TranslateFn): FrontlineEventOperation[] {
  const normal = EVENTS.map((event, index) => {
    const meta = EVENT_TONES[event.id] ?? {
      tone: "sky" as GameIconTone,
      icon: "daily_event" as const,
    };
    return {
      id: event.id,
      name: eventOperationText(t, event.id, "name", event.name),
      eyebrow: t("eventsScreen.operation.rotatingEyebrow"),
      description: eventOperationText(t, event.id, "description", event.description),
      presetId: FRONTLINE_EVENT_PRESET_BY_EVENT_ID[event.id] ?? (index === 0 ? "bonewood_raiders" : "plague_pack"),
      rewards: event.rewards,
      unlockLevel: eventUnlockLevel(event.id) ?? 1,
      tone: meta.tone,
      icon: meta.icon,
      signature: eventOperationText(t, event.id, "signature", t("eventsScreen.operation.rotatingFront")),
      mutator: eventOperationText(t, event.id, "mutator", t("eventsScreen.operation.standardPayout")),
      threat: index === 0 ? "common" : "rare",
    } satisfies FrontlineEventOperation;
  });

  const sieges = TD_EVENTS.map((event) => ({
    id: event.id,
    name: eventOperationText(t, event.id, "name", event.name),
    eyebrow: t("eventsScreen.operation.siegeEyebrow"),
    description: eventOperationText(t, event.id, "description", event.description),
    presetId: FRONTLINE_EVENT_PRESET_BY_EVENT_ID[event.id] ?? "ember_court",
    rewards: event.rewards,
    firstClearRewards: event.firstClearRewards,
    unlockLevel: event.unlockAccountLevel,
    tone: "ember" as GameIconTone,
    icon: "fortress_raid" as const,
    signature: t("eventsScreen.operation.wavePressure", { count: event.waves.length }),
    mutator: t("eventsScreen.operation.highThreatPreset"),
    threat: "epic" as const,
  }));

  return [...normal, ...sieges];
}
