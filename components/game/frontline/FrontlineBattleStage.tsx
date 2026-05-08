"use client";

import type {
  FrontlineBattleModifiers,
  FrontlineBattleState,
  FrontlineBossConfig,
  FrontlineBossSegmentConfig,
  FrontlineCardDef,
  FrontlineEvent,
  FrontlineLeaderDef,
} from "@/features/frontline/types";
import type { FrontlinePreview } from "@/features/frontline/preview";
import type { FrontlineLane } from "@/lib/types";
import type {
  FrontlineBattleFinishFx,
  FrontlineCardFxState,
  FrontlineCoreShockState,
  FrontlineDeathGhostState,
} from "./FrontlineBattleFxState";
import { FrontlineBattleHeader } from "./FrontlineBattleHeader";
import { FrontlineBattleLanes } from "./FrontlineBattleLanes";
import { FrontlineBattleOverlays } from "./FrontlineBattleOverlays";
import { FrontlineBattleShell } from "./FrontlineBattleShell";
import { FrontlineBattleSidebar } from "./FrontlineBattleSidebar";
import { BossBanner } from "./FrontlineBossBanner";
import { EncounterBanner, type FrontlineEncounterBadgeKind } from "./FrontlineEncounterBanner";
import { FrontlineHandSection } from "./FrontlineHandSection";
import type { LaneInsight } from "./FrontlineLaneInsights";

type ActionState = {
  title: string;
  subtitle: string;
};

type FrontlineBattleStageProps = {
  backdrop: string;
  hasCustomBackdrop: boolean;
  infernoCasting: boolean;
  activeResolutionEvent: FrontlineEvent | null;
  resolutionIndex: number;
  resolutionTotal: number;
  previewOutcome: FrontlinePreview | null;
  selectedCardName: string | null;
  cardPlayFx: FrontlineCardFxState | null;
  finishWinner: FrontlineBattleFinishFx["winner"] | null;
  encounterKind?: FrontlineEncounterBadgeKind | null;
  encounterTitle?: string | null;
  state: FrontlineBattleState;
  displayState: FrontlineBattleState;
  enemyPresetId: string;
  allyLeader: FrontlineLeaderDef;
  allyLeaderPowerName: string;
  allyLeaderPowerDescription: string;
  latestImpact: FrontlineEvent | null;
  resolutionActive: boolean;
  coreShock: FrontlineCoreShockState | null;
  actionState: ActionState;
  actionsLocked: boolean;
  selectedCard: FrontlineCardDef | null;
  focusedLane: FrontlineLane | null;
  focusedLaneActive: boolean;
  bossConfig: FrontlineBossConfig | null;
  bossSegmentByLane: Partial<Record<FrontlineLane, FrontlineBossSegmentConfig>>;
  modifiers?: FrontlineBattleModifiers | null;
  targetableLanes: FrontlineLane[];
  displayLane: FrontlineLane;
  displayInsight: LaneInsight;
  laneInsights: LaneInsight[];
  deathGhosts: FrontlineDeathGhostState[];
  selectedTargetSide: "ally" | "enemy" | "both" | null;
  selectedLeaderPower: boolean;
  selectedContextTitle: string;
  selectedContextBody: string;
  latestFeed: FrontlineEvent[];
  onLeaderPowerClick: () => void;
  onResolveClick: () => void;
  onClearSelection: () => void;
  onLaneClick: (lane: FrontlineLane) => void;
  onLaneFocus: (lane: FrontlineLane) => void;
  onCardClick: (cardId: string) => void;
};

export function FrontlineBattleStage({
  backdrop,
  hasCustomBackdrop,
  infernoCasting,
  activeResolutionEvent,
  resolutionIndex,
  resolutionTotal,
  previewOutcome,
  selectedCardName,
  cardPlayFx,
  finishWinner,
  encounterKind,
  encounterTitle,
  state,
  displayState,
  enemyPresetId,
  allyLeader,
  allyLeaderPowerName,
  allyLeaderPowerDescription,
  latestImpact,
  resolutionActive,
  coreShock,
  actionState,
  actionsLocked,
  selectedCard,
  focusedLane,
  focusedLaneActive,
  bossConfig,
  bossSegmentByLane,
  modifiers,
  targetableLanes,
  displayLane,
  displayInsight,
  laneInsights,
  deathGhosts,
  selectedTargetSide,
  selectedLeaderPower,
  selectedContextTitle,
  selectedContextBody,
  latestFeed,
  onLeaderPowerClick,
  onResolveClick,
  onClearSelection,
  onLaneClick,
  onLaneFocus,
  onCardClick,
}: FrontlineBattleStageProps) {
  return (
    <FrontlineBattleShell
      backdrop={backdrop}
      hasCustomBackdrop={hasCustomBackdrop}
      infernoCasting={infernoCasting}
    >
      <FrontlineBattleOverlays
        activeResolutionEvent={activeResolutionEvent}
        resolutionIndex={resolutionIndex}
        resolutionTotal={resolutionTotal}
        previewOutcome={previewOutcome}
        selectedCardName={selectedCardName}
        cardPlayFx={cardPlayFx}
        finishWinner={finishWinner}
      />

      <div className="relative z-[1] flex flex-col gap-4 p-4 md:p-5">
        {encounterKind && encounterKind !== "boss" ? <EncounterBanner kind={encounterKind} title={encounterTitle ?? null} /> : null}
        <FrontlineBattleHeader
          state={state}
          displayState={displayState}
          enemyPresetId={enemyPresetId}
          allyLeader={allyLeader}
          allyLeaderPowerName={allyLeaderPowerName}
          allyLeaderPowerDescription={allyLeaderPowerDescription}
          activeResolutionEvent={activeResolutionEvent}
          latestImpact={latestImpact}
          resolutionActive={resolutionActive}
          coreShock={coreShock}
          actionState={actionState}
          actionsLocked={actionsLocked}
          selectedCard={selectedCard}
          focusedLaneActive={focusedLaneActive}
          onLeaderPowerClick={onLeaderPowerClick}
          onResolveClick={onResolveClick}
          onClearSelection={onClearSelection}
        />

        {bossConfig && state.bossState ? (
          <BossBanner
            boss={bossConfig}
            bossState={state.bossState}
            modifiers={modifiers ?? null}
            cardCostMod={state.playerCardCostMod}
          />
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_14.5rem]">
          <FrontlineBattleLanes
            state={state}
            displayState={displayState}
            bossConfig={bossConfig}
            bossSegmentByLane={bossSegmentByLane}
            targetableLanes={targetableLanes}
            displayLane={displayLane}
            laneInsights={laneInsights}
            latestImpact={latestImpact}
            activeResolutionEvent={activeResolutionEvent}
            cardPlayFx={cardPlayFx}
            deathGhosts={deathGhosts}
            selectedTargetSide={selectedTargetSide}
            onLaneClick={onLaneClick}
            onLaneFocus={onLaneFocus}
          />

          <FrontlineBattleSidebar
            focusedLane={focusedLane}
            selectedCard={selectedCard}
            selectedLeaderPower={selectedLeaderPower}
            selectedContextTitle={selectedContextTitle}
            selectedContextBody={selectedContextBody}
            displayInsight={displayInsight}
            targetableLanes={targetableLanes}
            latestFeed={latestFeed}
          />
        </div>

        <FrontlineHandSection
          state={state}
          actionsLocked={actionsLocked}
          laneInsights={laneInsights}
          onCardClick={onCardClick}
        />
      </div>
    </FrontlineBattleShell>
  );
}
