import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { getScreenBackgroundAsset, type ScreenBackgroundId } from "@/lib/screenBackgroundAssets";

type ScreenBackgroundProps = {
  screen: ScreenBackgroundId;
  className?: string;
  children?: ReactNode;
  overlayIntensity?: "soft" | "medium" | "strong";
  vignette?: boolean;
  fallback?: ReactNode;
};

const TONE_OVERLAYS: Record<ScreenBackgroundId, string> = {
  market:
    "bg-[radial-gradient(circle_at_26%_18%,rgba(245,196,81,0.16),transparent_26%),radial-gradient(circle_at_76%_18%,rgba(255,139,82,0.12),transparent_24%)]",
  deck:
    "bg-[radial-gradient(circle_at_48%_20%,rgba(142,197,255,0.12),transparent_26%),radial-gradient(circle_at_70%_34%,rgba(170,130,255,0.1),transparent_24%)]",
  fortress:
    "bg-[radial-gradient(circle_at_56%_18%,rgba(188,214,255,0.13),transparent_28%),radial-gradient(circle_at_28%_28%,rgba(245,196,81,0.11),transparent_24%)]",
  events:
    "bg-[radial-gradient(circle_at_50%_18%,rgba(209,151,255,0.15),transparent_28%),radial-gradient(circle_at_76%_30%,rgba(126,191,255,0.1),transparent_24%)]",
  arena:
    "bg-[radial-gradient(circle_at_50%_20%,rgba(255,139,82,0.16),transparent_28%),radial-gradient(circle_at_26%_34%,rgba(245,196,81,0.1),transparent_24%)]",
  adventure:
    "bg-[radial-gradient(circle_at_54%_18%,rgba(142,197,255,0.12),transparent_28%),radial-gradient(circle_at_22%_32%,rgba(245,196,81,0.08),transparent_24%)]",
  missions:
    "bg-[radial-gradient(circle_at_22%_18%,rgba(93,211,158,0.12),transparent_28%),radial-gradient(circle_at_78%_22%,rgba(245,196,81,0.1),transparent_24%)]",
};

const OVERLAY_STRENGTH: Record<NonNullable<ScreenBackgroundProps["overlayIntensity"]>, string> = {
  soft: "bg-[linear-gradient(180deg,rgba(4,7,13,0.28),rgba(4,7,13,0.34)_46%,rgba(4,7,13,0.66)_100%)]",
  medium: "bg-[linear-gradient(180deg,rgba(4,7,13,0.42),rgba(4,7,13,0.5)_48%,rgba(4,7,13,0.78)_100%)]",
  strong: "bg-[linear-gradient(180deg,rgba(4,7,13,0.56),rgba(4,7,13,0.64)_48%,rgba(4,7,13,0.88)_100%)]",
};

export default function ScreenBackground({
  screen,
  className,
  children,
  overlayIntensity = "medium",
  vignette = true,
  fallback,
}: ScreenBackgroundProps) {
  const asset = getScreenBackgroundAsset(screen);

  if (!asset) {
    return <>{fallback ?? null}</>;
  }

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} data-screen-background={screen}>
      <img
        src={asset.src}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: asset.position ?? "50% 50%" }}
      />
      <div className={cn("absolute inset-0", TONE_OVERLAYS[screen])} />
      <div className={cn("absolute inset-0", OVERLAY_STRENGTH[overlayIntensity])} />
      {vignette ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(3,5,10,0.08)_44%,rgba(3,5,10,0.54)_100%)]" />
      ) : null}
      <div className="absolute inset-x-0 top-0 h-36 bg-[linear-gradient(180deg,rgba(4,7,13,0.7),rgba(4,7,13,0.18),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(0deg,rgba(3,5,10,0.92),rgba(3,5,10,0.36),transparent)]" />
      {children}
    </div>
  );
}
