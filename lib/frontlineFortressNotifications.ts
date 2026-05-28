import type { NotificationKind } from "@/lib/storeTypes";
import type { FrontlineFortressOutcome } from "@/lib/types";

export function getFrontlineFortressOutcomeNotification(outcome: FrontlineFortressOutcome): {
  kind: NotificationKind;
  message: string;
} {
  if (outcome === "full_repel") {
    return { kind: "success", message: "Fortress held the line" };
  }

  if (outcome === "partial_hold") {
    return { kind: "success", message: "Fortress held with damage" };
  }

  return { kind: "error", message: "Fortress was breached" };
}
