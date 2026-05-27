import { FortressIcon } from "@/components/game/shared/FortressIcon";
import { cn } from "@/lib/cn";
import type { FrontlineFortressOutcome, Rewards } from "@/lib/types";
import type { TranslateFn } from "./fortressPageHelpers";
import { RewardRow } from "./FortressPrimitives";

type FortressDefenseOutcomeOverlayProps = {
  outcome: FrontlineFortressOutcome;
  headline: string;
  panelClassName: string;
  rewards: Rewards;
  claimPending: boolean;
  onClaim: () => void;
  t: TranslateFn;
};

export function FortressDefenseOutcomeOverlay({
  outcome,
  headline,
  panelClassName,
  rewards,
  claimPending,
  onClaim,
  t,
}: FortressDefenseOutcomeOverlayProps) {
  return (
    <div className="frontline-finish-overlay-fx absolute inset-0 z-30 grid place-items-center bg-black/56 p-4 backdrop-blur-[6px]">
      <div className={cn("frontline-finish-emblem-fx w-full max-w-[32rem] overflow-hidden rounded-[30px] border p-4 text-center shadow-[0_24px_70px_rgba(0,0,0,0.48)]", panelClassName)}>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[24px] border border-white/14 bg-black/30">
          <FortressIcon name={outcome === "breach" ? "repair" : "watchtower"} size="xl" />
        </div>
        <div className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/56">{t("fortressScreen.defense.outcomeEyebrow")}</div>
        <div className="mt-1 text-2xl font-black text-white">{headline}</div>
        <RewardRow rewards={rewards} className="mt-4" t={t} />
        <button
          className="frontline-motion-action frontline-feedback-claim mt-4 w-full rounded-[20px] border border-[#f8d57b]/28 bg-[linear-gradient(180deg,#fff0bc_0%,#f5c451_46%,#b96d1f_100%)] px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[#221102] shadow-[0_18px_34px_rgba(245,196,81,0.24)] transition disabled:opacity-50"
          disabled={claimPending}
          onClick={onClaim}
        >
          {claimPending ? t("fortressScreen.defense.claiming") : t("fortressScreen.defense.claim")}
        </button>
      </div>
    </div>
  );
}
