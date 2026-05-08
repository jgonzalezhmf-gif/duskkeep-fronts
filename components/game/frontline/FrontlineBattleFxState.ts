import type { FrontlineEvent, FrontlineSnapshot, FrontlineBattleState } from "@/features/frontline/types";
import type { FrontlineCardPlayFx } from "./FrontlineCardCastFx";
import type { FrontlineDeathGhostFx } from "./FrontlineDeathGhost";
import type { FrontlineVisualFxTone } from "./FrontlineLaneActionTrail";
import type { CoreShockChange } from "./FrontlineBattleDerivedState";

export type FrontlineResolutionFx = {
  id: number;
  events: FrontlineEvent[];
  activeIndex: number;
};

export type FrontlineCardFxState = FrontlineCardPlayFx;

export type FrontlineBattleFinishFx = {
  winner: "ally" | "enemy" | "draw";
};

export type FrontlineDeathGhostState = FrontlineDeathGhostFx;

export type FrontlineVisualTone = FrontlineVisualFxTone;

export type FrontlineCoreShockState = CoreShockChange;

export type FrontlinePendingResolution = {
  finalState: FrontlineBattleState;
  snapshots: FrontlineSnapshot[];
};
