import { FRONTLINE_CARD_BY_ID, FRONTLINE_HERO_BY_ID, FRONTLINE_LEADERS } from "@/features/frontline/data";
import type { FrontlineHeroDef } from "@/features/frontline/types";
import { frontlineLeaderName } from "@/lib/i18n/frontlineText";

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

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
