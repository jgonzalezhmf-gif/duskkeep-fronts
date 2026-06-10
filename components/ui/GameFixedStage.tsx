"use client";

import type { ReactNode } from "react";
import { isGameFixedStageEnabled } from "@/lib/gameFixedStage";

export default function GameFixedStage({ children }: { children: ReactNode }) {
  if (!isGameFixedStageEnabled()) return <>{children}</>;

  return (
    <div className="game-fixed-stage" data-game-fixed-stage="enabled">
      <div className="game-fixed-stage__frame">
        <div className="game-fixed-stage__surface" data-game-fixed-stage-surface>
          {children}
        </div>
      </div>
    </div>
  );
}
