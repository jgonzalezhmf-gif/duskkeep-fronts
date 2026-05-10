"use client";

import dynamic from "next/dynamic";

import type { RewardBurstOverlayProps } from "./RewardBurstOverlay";

const RewardBurstOverlayImpl = dynamic(
  () => import("./RewardBurstOverlay").then((module) => module.RewardBurstOverlay),
  { ssr: false },
);

export function LazyRewardBurstOverlay(props: RewardBurstOverlayProps) {
  return <RewardBurstOverlayImpl {...props} />;
}
