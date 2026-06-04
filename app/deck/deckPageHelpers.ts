import { FRONTLINE_CARD_BY_ID, FRONTLINE_HERO_BY_ID, FRONTLINE_LEADERS } from "@/features/frontline/data";
import type { FrontlineHeroDef } from "@/features/frontline/types";
import { frontlineLeaderName } from "@/lib/i18n/frontlineText";

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;
export type PackageFocus = "orders" | "tactics" | "summons" | "mixed";

export const FRONTLINE_DECK_TARGET_SIZE = 8;

export function buildDeckReadiness({
  leaderId,
  squadIds,
  deckIds,
  t,
}: {
  leaderId: string | null;
  squadIds: Array<string | null>;
  deckIds: string[];
  t: TranslateFn;
}) {
  const squadCount = squadIds.filter(Boolean).length;
  const deckCount = deckIds.length;
  const checks = [
    {
      id: "leader",
      label: t("deckScreen.readiness.leader"),
      value: leaderId ? t("deckScreen.readiness.readyMark") : t("deckScreen.readiness.missing"),
      ready: Boolean(leaderId),
    },
    {
      id: "squad",
      label: t("deckScreen.readiness.squad"),
      value: `${squadCount}/3`,
      ready: squadCount === 3,
    },
    {
      id: "deck",
      label: t("deckScreen.readiness.deck"),
      value: `${deckCount}/${FRONTLINE_DECK_TARGET_SIZE}`,
      ready: deckCount === FRONTLINE_DECK_TARGET_SIZE,
    },
  ];
  const completed = checks.filter((check) => check.ready).length;
  const ready = completed === checks.length;

  return {
    ready,
    completed,
    total: checks.length,
    checks,
    label: ready ? t("deckScreen.readiness.battleReady") : t("deckScreen.readiness.arming"),
    nextAction:
      checks.find((check) => !check.ready)?.label ?? t("deckScreen.readiness.readyCue"),
  };
}

export function buildPackageProfile(deckIds: string[]) {
  const counts = {
    orders: deckIds.filter((id) => FRONTLINE_CARD_BY_ID[id]?.kind === "order").length,
    tactics: deckIds.filter((id) => FRONTLINE_CARD_BY_ID[id]?.kind === "tactic").length,
    summons: deckIds.filter((id) => FRONTLINE_CARD_BY_ID[id]?.kind === "summon").length,
  };
  const commandCost = deckIds.reduce((sum, id) => sum + (FRONTLINE_CARD_BY_ID[id]?.cost ?? 0), 0);
  const missingSlots = Math.max(0, FRONTLINE_DECK_TARGET_SIZE - deckIds.length);
  const focus: PackageFocus =
    counts.orders >= 4
      ? "orders"
      : counts.tactics >= 3
        ? "tactics"
        : counts.summons >= 3
          ? "summons"
          : "mixed";

  return {
    counts,
    commandCost,
    missingSlots,
    focus,
    full: missingSlots === 0,
  };
}

export function buildPlan(
  leaderId: string,
  squadIds: Array<string | null>,
  deckIds: string[],
  t: TranslateFn,
) {
  const heroes = squadIds
    .map((id) => (id ? FRONTLINE_HERO_BY_ID[id] : null))
    .filter((hero): hero is FrontlineHeroDef => Boolean(hero));
  const counts = {
    orders: deckIds.filter((id) => FRONTLINE_CARD_BY_ID[id]?.kind === "order").length,
    tactics: deckIds.filter((id) => FRONTLINE_CARD_BY_ID[id]?.kind === "tactic").length,
    summons: deckIds.filter((id) => FRONTLINE_CARD_BY_ID[id]?.kind === "summon").length,
  };
  const roles = heroes.map((hero) => hero.role.toLowerCase()).join(" ");
  const leader = FRONTLINE_LEADERS.find((entry) => entry.id === leaderId);
  const leaderName = frontlineLeaderName(t, leader);

  let doctrine = t("deckScreen.buildPlan.flexibleDoctrine");
  let plan = t("deckScreen.buildPlan.flexiblePlan");
  if (roles.includes("tank") && roles.includes("healer")) {
    doctrine = t("deckScreen.buildPlan.stableDoctrine", { leader: leaderName || t("deckScreen.metrics.leader") });
    plan = t("deckScreen.buildPlan.stablePlan");
  } else if (roles.includes("finisher") || roles.includes("archer")) {
    doctrine = t("deckScreen.buildPlan.burstDoctrine", { leader: leaderName || t("deckScreen.metrics.leader") });
    plan = t("deckScreen.buildPlan.burstPlan");
  }
  if (counts.summons >= 2) {
    plan += t("deckScreen.buildPlan.summonAddon");
  }
  return { doctrine, plan, counts };
}
