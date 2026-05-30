import type { FrontlineBattleState } from "@/features/frontline/types";
import { frontlineBreachAmount, frontlineLaneBaseBreachValue } from "@/features/frontline/frontlineBreachMath";
import type { CombatAssetIconName } from "@/lib/iconAssets";
import type { TranslateFn } from "@/lib/i18n/frontlineText";
import type { FrontlineLane } from "@/lib/types";

export type LaneInsight = {
  lane: FrontlineLane;
  allyScore: number;
  enemyScore: number;
  status: "ally_edge" | "enemy_edge" | "open_breach" | "breach_threat" | "even" | "vacant";
  priority: number;
  allyLow: boolean;
  enemyLow: boolean;
  breachSide: "ally" | "enemy" | null;
  breachAmount: number | null;
};

export function combatIconForLaneStatus(status: LaneInsight["status"]): CombatAssetIconName {
  if (status === "open_breach") return "breach";
  if (status === "breach_threat" || status === "enemy_edge") return "danger";
  if (status === "ally_edge") return "advantage";
  if (status === "vacant") return "target";
  return "clash";
}

function laneEntityScore(
  hero: FrontlineBattleState["lanes"]["left"]["allyHero"],
  support: FrontlineBattleState["lanes"]["left"]["allySupport"],
) {
  const heroScore = hero ? hero.hp + hero.shield + (hero.atk + hero.tempAtk) * 2 + hero.def * 2 : 0;
  const supportScore = support ? support.hp + support.atk * 2 + support.duration * 2 : 0;
  return heroScore + supportScore;
}

export function laneBreachValue(lane: FrontlineLane) {
  return frontlineLaneBaseBreachValue(lane);
}

export function analyzeLane(state: FrontlineBattleState, lane: FrontlineLane): LaneInsight {
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
      breachAmount: frontlineBreachAmount(state, "ally", lane),
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
      breachAmount: frontlineBreachAmount(state, "enemy", lane),
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
      breachAmount: null,
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
      breachAmount: null,
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
      breachAmount: null,
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
    breachAmount: null,
  };
}

export function laneStatusTitle(t: TranslateFn, status: LaneInsight["status"]) {
  if (status === "open_breach") return t("frontline.statusBreach");
  if (status === "breach_threat") return t("frontline.statusDanger");
  if (status === "vacant") return t("frontline.statusOpen");
  if (status === "ally_edge") return t("frontline.statusEdge");
  if (status === "enemy_edge") return t("frontline.statusUnder");
  return t("frontline.statusEven");
}

export function laneStatusSubtitle(
  t: TranslateFn,
  lane: FrontlineLane,
  status: LaneInsight["status"],
  breachAmount = laneBreachValue(lane),
) {
  if (status === "open_breach") return t("frontline.subtitleBreach", { amount: breachAmount });
  if (status === "breach_threat") return t("frontline.subtitleDanger", { amount: breachAmount });
  if (status === "vacant") return t("frontline.subtitleVacant");
  if (status === "ally_edge") return t("frontline.subtitleAllyEdge");
  if (status === "enemy_edge") return t("frontline.subtitleEnemyEdge");
  return t("frontline.subtitleEven");
}

export function laneStatusMeta(t: TranslateFn, insight: LaneInsight) {
  if (insight.status === "open_breach") {
    return { tone: "ally" as const, label: t("frontline.statusBreach"), detail: `${insight.breachAmount ?? laneBreachValue(insight.lane)}` };
  }
  if (insight.status === "breach_threat") {
    return { tone: "enemy" as const, label: t("frontline.statusDanger"), detail: `${insight.breachAmount ?? laneBreachValue(insight.lane)}` };
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
