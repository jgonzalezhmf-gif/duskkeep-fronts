import type { FrontlineBattleState, FrontlineCardDef, FrontlineEvent } from "@/features/frontline/types";
import {
  frontlineCardEffectSummary,
  frontlineCardName,
  frontlineCardShortTargetLabel,
  type TranslateFn,
} from "@/lib/i18n/frontlineText";
import type { FrontlineLane, FrontlineSide } from "@/lib/types";

export function laneLabel(t: TranslateFn, lane: FrontlineLane) {
  if (lane === "left") return t("frontline.left");
  if (lane === "center") return t("frontline.center");
  return t("frontline.right");
}

export function impactTone(kind: FrontlineBattleState["events"][number]["kind"] | undefined) {
  if (kind === "breach" || kind === "ko") return "high";
  if (kind === "damage" || kind === "power" || kind === "stun") return "mid";
  return "low";
}

export function cardTargetLabel(t: TranslateFn, card: FrontlineCardDef) {
  return frontlineCardShortTargetLabel(t, card);
}

export function cardEffectSummary(t: TranslateFn, card: FrontlineCardDef) {
  return frontlineCardEffectSummary(t, card);
}

export function shouldCoreFlash(event: FrontlineEvent | null | undefined, attackerSide: FrontlineSide) {
  if (!event || event.side !== attackerSide) return false;
  return event.kind === "breach" || event.kind === "damage";
}

export function nextActionLabel(
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
