"use client";

import type { FrontlinePreview } from "@/features/frontline/preview";
import type { FrontlineEvent } from "@/features/frontline/types";
import { BattleEndOverlay } from "./FrontlineBattleEndOverlay";
import { CardUseToast } from "./FrontlineCardUseToast";
import { ClashSpotlight } from "./FrontlineClashSpotlight";
import { combatIconForEvent } from "./FrontlineEventFloats";
import type { FrontlineCardPlayFx } from "./FrontlineCardCastFx";
import { PreviewSpotlight } from "./FrontlinePreviewSpotlight";
import { SynergyGlobalToast } from "./FrontlineSynergyFeedback";
import { eventPrimaryTargetSide, visualToneFromEvent } from "./FrontlineVisualState";

type FrontlineBattleOverlaysProps = {
  activeResolutionEvent: FrontlineEvent | null;
  resolutionIndex: number;
  resolutionTotal: number;
  previewOutcome: FrontlinePreview | null;
  selectedCardName: string | null;
  cardPlayFx: FrontlineCardPlayFx | null;
  finishWinner: "ally" | "enemy" | "draw" | null;
};

export function FrontlineBattleOverlays({
  activeResolutionEvent,
  resolutionIndex,
  resolutionTotal,
  previewOutcome,
  selectedCardName,
  cardPlayFx,
  finishWinner,
}: FrontlineBattleOverlaysProps) {
  return (
    <>
      <ClashSpotlight
        event={activeResolutionEvent}
        index={resolutionIndex}
        total={resolutionTotal}
        tone={activeResolutionEvent ? visualToneFromEvent(activeResolutionEvent) : null}
        icon={activeResolutionEvent ? combatIconForEvent(activeResolutionEvent) : null}
        targetSide={activeResolutionEvent ? eventPrimaryTargetSide(activeResolutionEvent) : null}
      />
      {!activeResolutionEvent && !cardPlayFx && !finishWinner ? (
        <PreviewSpotlight preview={previewOutcome} cardName={selectedCardName} />
      ) : null}
      <CardUseToast fx={cardPlayFx} />
      <SynergyGlobalToast event={activeResolutionEvent} />
      {finishWinner ? <BattleEndOverlay winner={finishWinner} /> : null}
    </>
  );
}
