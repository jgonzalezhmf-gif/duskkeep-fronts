"use client";

import dynamic from "next/dynamic";

import type { RewardFlightOverlayProps } from "./RewardFlightOverlay";

const RewardFlightOverlayImpl = dynamic(
  () => import("./RewardFlightOverlay").then((module) => module.RewardFlightOverlay),
  { ssr: false },
);

export function LazyRewardFlightOverlay(props: RewardFlightOverlayProps) {
  return <RewardFlightOverlayImpl {...props} />;
}
