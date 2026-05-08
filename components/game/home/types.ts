import { type HomeIconKind } from "@/components/game/home/HomeIcon";
import { type ModeIconName } from "@/components/game/shared/ModeIcon";
import { type HomeLandmarkId } from "@/lib/homeLandmarkAssets";

export type HomeZoneId =
  | "fortress"
  | "arena"
  | "events"
  | "deck"
  | "market"
  | "adventure";

export type HomeTone = "gold" | "violet" | "sky" | "emerald" | "rose";

export type HomeHotspot = {
  zoneId: HomeZoneId;
  href: string;
  label: string;
  sublabel: string;
  icon: HomeIconKind;
  modeIcon?: ModeIconName;
  landmarkId?: HomeLandmarkId;
  tone: HomeTone;
  anchorX: string;
  anchorY: string;
  mobileAnchorX?: string;
  mobileAnchorY?: string;
  width?: string;
  height?: string;
  mobileWidth?: string;
  mobileHeight?: string;
  badge?: string | number;
  labelDx?: string;
  labelDy?: string;
  mobileLabelDx?: string;
  mobileLabelDy?: string;
  plaqueWidth?: string;
  mobilePlaqueWidth?: string;
};
