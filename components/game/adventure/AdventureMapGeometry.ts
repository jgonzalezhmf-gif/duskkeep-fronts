import type { CSSProperties } from "react";

import { ADVENTURE_MAP_DESIGN } from "@/features/adventure/mapLayout";

export * from "@/features/adventure/mapGeometry";

const DESIGN_WIDTH = ADVENTURE_MAP_DESIGN.width;
const DESIGN_HEIGHT = ADVENTURE_MAP_DESIGN.height;

export function nodeStyle(x: number, y: number): CSSProperties {
  return {
    left: `${(x / DESIGN_WIDTH) * 100}%`,
    top: `${(y / DESIGN_HEIGHT) * 100}%`,
  };
}
