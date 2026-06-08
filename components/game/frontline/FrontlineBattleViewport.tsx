"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const FRONTLINE_BATTLE_VIEWPORT_MAX_WIDTH = "max-w-[1840px]";
export const FRONTLINE_BATTLE_VIEWPORT_PADDING = "px-2 pb-3 pt-2 md:px-3 md:pb-4 md:pt-3 xl:px-4";

export function getFrontlineBattleViewportClassName(className?: string) {
  return cn(
    "relative mx-auto flex min-h-dvh w-full flex-col gap-3",
    FRONTLINE_BATTLE_VIEWPORT_MAX_WIDTH,
    FRONTLINE_BATTLE_VIEWPORT_PADDING,
    className,
  );
}

export function FrontlineBattleViewport({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={getFrontlineBattleViewportClassName(className)}>{children}</div>;
}
