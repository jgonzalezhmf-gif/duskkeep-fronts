import type { AdventureLevel } from "@/lib/types";
import type { ScreenScene } from "@/components/game/screens/SceneBackdrop";
import type {
  AdventureMapNodeStatus,
  AdventureMapNodeType,
  AdventureMapRouteState,
} from "./adventureMapLayout";

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export type AdventureNodeState = {
  lvl: AdventureLevel;
  cleared: boolean;
  locked: boolean;
  current: boolean;
  claimed?: boolean;
  pausedHere: boolean;
  firstClearAvailable: boolean;
};

export type AdventureLandmark = {
  label: string;
  kind: "camp" | "bridge" | "altar" | "gate" | "spire" | "ruin";
  x: string;
  y: string;
  mobileX: string;
  mobileY: string;
};

export type AdventureCampaignMeta = {
  name: string;
  subtitle: string;
  accent: string;
  scene: ScreenScene;
  hint: string;
  atmosphere: string;
  terrainLabel: string;
  threatLabel: string;
  landmarks: AdventureLandmark[];
};

export type AdventureVisualNode = {
  id: string;
  node: AdventureNodeState;
  x: number;
  y: number;
  size?: number;
  zIndex?: number;
  type: AdventureMapNodeType;
  status: AdventureMapNodeStatus;
  connectsTo: string[];
};

export type AdventureVisualRoute = {
  id: string;
  from: AdventureVisualNode;
  to: AdventureVisualNode;
  state?: AdventureMapRouteState;
  control1?: { x: number; y: number };
  control2?: { x: number; y: number };
};

export type AdventureMapEditorSelection =
  | { kind: "node"; id: string }
  | { kind: "prop"; id: string }
  | { kind: "party"; id: "party" }
  | { kind: "routeControl"; id: string; handle: "control1" | "control2" };
