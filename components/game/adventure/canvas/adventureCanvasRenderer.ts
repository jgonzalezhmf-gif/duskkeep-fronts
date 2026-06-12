import type {
  AdventureCanvasNodeModel,
  AdventureCanvasPoint,
  AdventureCanvasPropModel,
  AdventureCanvasRouteModel,
  AdventureCanvasSceneModel,
} from "@/features/canvas-runtime/adventureAdapter";
import type { CanvasRuntimeViewport } from "@/features/canvas-runtime/runtimeConfig";
import type { AdventureCanvasRuntimeApplication } from "./adventureCanvasRuntime";

export type AdventureCanvasRoutePrimitive = {
  id: string;
  points: [AdventureCanvasPoint, AdventureCanvasPoint, AdventureCanvasPoint, AdventureCanvasPoint];
  color: number;
  alpha: number;
  width: number;
};

export type AdventureCanvasNodePrimitive = {
  id: string;
  position: AdventureCanvasPoint;
  radius: number;
  fillColor: number;
  strokeColor: number;
  haloColor: number;
  alpha: number;
  selected: boolean;
  locked: boolean;
};

export type AdventureCanvasFocusPrimitive = {
  id: string;
  position: AdventureCanvasPoint;
  radius: number;
  color: number;
};

export type AdventureCanvasPropPrimitive = {
  id: string;
  position: AdventureCanvasPoint;
  radius: number;
  color: number;
  alpha: number;
  selected: boolean;
};

export type AdventureCanvasRenderPlan = {
  designSize: AdventureCanvasSceneModel["designSize"];
  routes: AdventureCanvasRoutePrimitive[];
  nodes: AdventureCanvasNodePrimitive[];
  props: AdventureCanvasPropPrimitive[];
  focus: AdventureCanvasFocusPrimitive | null;
};

type PixiGraphicsLike = {
  moveTo: (x: number, y: number) => PixiGraphicsLike;
  bezierCurveTo: (cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => PixiGraphicsLike;
  circle: (x: number, y: number, radius: number) => PixiGraphicsLike;
  stroke: (options: { width: number; color: number; alpha?: number }) => PixiGraphicsLike;
  fill: (options: { color: number; alpha?: number }) => PixiGraphicsLike;
  destroy?: (options?: { children?: boolean }) => void;
};

type PixiGraphicsCtor = new () => PixiGraphicsLike;

type PixiStageLike = {
  addChild?: (...children: unknown[]) => unknown;
  removeChildren?: () => Array<{ destroy?: (options?: { children?: boolean }) => void }>;
};

type PixiRenderableApplication = AdventureCanvasRuntimeApplication & {
  stage?: PixiStageLike;
};

export type AdventureCanvasPixiModule = {
  Graphics: PixiGraphicsCtor;
};

const COLOR = {
  amber: 0xeeb456,
  gold: 0xf5c451,
  ember: 0xff784e,
  sky: 0x8fd5ff,
  emerald: 0x6ee7b7,
  steel: 0x344055,
  violet: 0xb58cff,
  black: 0x030201,
  white: 0xffffff,
};

export function buildAdventureCanvasRenderPlan(sceneModel: AdventureCanvasSceneModel): AdventureCanvasRenderPlan {
  const selectedNode = sceneModel.nodes.find((node) => node.selected) ?? null;

  return {
    designSize: sceneModel.designSize,
    routes: sceneModel.routes.map(toRoutePrimitive),
    nodes: sceneModel.nodes.map(toNodePrimitive),
    props: sceneModel.props.flatMap(toPropPrimitive),
    focus: selectedNode
      ? {
          id: `${selectedNode.id}-focus`,
          position: selectedNode.position,
          radius: selectedNode.size * 0.72,
          color: getNodeHaloColor(selectedNode),
        }
      : null,
  };
}

export function renderAdventureCanvasScene({
  app,
  pixi,
  sceneModel,
  viewport,
}: {
  app: AdventureCanvasRuntimeApplication;
  pixi: AdventureCanvasPixiModule;
  sceneModel: AdventureCanvasSceneModel;
  viewport: CanvasRuntimeViewport;
}) {
  const stage = (app as PixiRenderableApplication).stage;
  if (!stage?.addChild) return;

  const previousChildren = stage.removeChildren?.() ?? [];
  for (const child of previousChildren) {
    child.destroy?.({ children: true });
  }

  const plan = buildAdventureCanvasRenderPlan(sceneModel);
  const scaleX = viewport.cssWidth / plan.designSize.width;
  const scaleY = viewport.cssHeight / plan.designSize.height;
  const avgScale = (scaleX + scaleY) / 2;
  const graphics: PixiGraphicsLike[] = [];

  for (const route of plan.routes) {
    const underlay = new pixi.Graphics();
    underlay
      .moveTo(route.points[0].x * scaleX, route.points[0].y * scaleY)
      .bezierCurveTo(
        route.points[1].x * scaleX,
        route.points[1].y * scaleY,
        route.points[2].x * scaleX,
        route.points[2].y * scaleY,
        route.points[3].x * scaleX,
        route.points[3].y * scaleY,
      )
      .stroke({ width: Math.max(6, route.width * 2.5 * avgScale), color: COLOR.black, alpha: 0.38 });
    graphics.push(underlay);

    const line = new pixi.Graphics();
    line
      .moveTo(route.points[0].x * scaleX, route.points[0].y * scaleY)
      .bezierCurveTo(
        route.points[1].x * scaleX,
        route.points[1].y * scaleY,
        route.points[2].x * scaleX,
        route.points[2].y * scaleY,
        route.points[3].x * scaleX,
        route.points[3].y * scaleY,
      )
      .stroke({ width: Math.max(2, route.width * avgScale), color: route.color, alpha: route.alpha });
    graphics.push(line);
  }

  for (const node of plan.nodes) {
    const halo = new pixi.Graphics();
    halo
      .circle(node.position.x * scaleX, node.position.y * scaleY, node.radius * 1.55 * avgScale)
      .fill({ color: node.haloColor, alpha: node.selected ? 0.26 : node.locked ? 0.05 : 0.11 });
    graphics.push(halo);

    const marker = new pixi.Graphics();
    marker
      .circle(node.position.x * scaleX, node.position.y * scaleY, node.radius * avgScale)
      .fill({ color: node.fillColor, alpha: node.alpha })
      .stroke({
        width: Math.max(2, (node.selected ? 4 : 2) * avgScale),
        color: node.strokeColor,
        alpha: node.selected ? 0.92 : 0.66,
      });
    graphics.push(marker);
  }

  for (const prop of plan.props) {
    const marker = new pixi.Graphics();
    marker
      .circle(prop.position.x * scaleX, prop.position.y * scaleY, prop.radius * avgScale)
      .fill({ color: prop.color, alpha: prop.alpha })
      .stroke({ width: Math.max(1, 2 * avgScale), color: COLOR.white, alpha: prop.selected ? 0.54 : 0.18 });
    graphics.push(marker);
  }

  if (plan.focus) {
    const focus = new pixi.Graphics();
    focus
      .circle(plan.focus.position.x * scaleX, plan.focus.position.y * scaleY, plan.focus.radius * avgScale)
      .stroke({ width: Math.max(3, 5 * avgScale), color: plan.focus.color, alpha: 0.88 });
    graphics.push(focus);
  }

  stage.addChild(...graphics);
}

function toRoutePrimitive(route: AdventureCanvasRouteModel): AdventureCanvasRoutePrimitive {
  const locked = route.state === "locked";
  const cleared = route.state === "cleared";

  return {
    id: route.id,
    points: route.pathPoints,
    color: locked ? COLOR.steel : cleared ? COLOR.emerald : COLOR.amber,
    alpha: locked ? 0.18 : cleared ? 0.48 : 0.92,
    width: locked ? 2 : 4.5,
  };
}

function toNodePrimitive(node: AdventureCanvasNodeModel): AdventureCanvasNodePrimitive {
  const locked = node.stateFlags.locked;
  const fillColor = getNodeFillColor(node);

  return {
    id: node.id,
    position: node.position,
    radius: node.size / 2,
    fillColor,
    strokeColor: node.selected ? COLOR.white : getNodeHaloColor(node),
    haloColor: getNodeHaloColor(node),
    alpha: locked ? 0.34 : node.stateFlags.cleared || node.stateFlags.claimed ? 0.58 : 0.78,
    selected: node.selected,
    locked,
  };
}

function toPropPrimitive(prop: AdventureCanvasPropModel): AdventureCanvasPropPrimitive[] {
  if (!prop.interaction) return [];
  return [
    {
      id: prop.id,
      position: prop.position,
      radius: Math.max(12, Math.min(prop.dimensions.width, prop.dimensions.height) * 0.22),
      color: prop.interaction.status === "ready" ? COLOR.gold : prop.interaction.status === "claimed" ? COLOR.emerald : COLOR.violet,
      alpha: prop.interaction.status === "locked" ? 0.22 : prop.interaction.selected ? 0.72 : 0.48,
      selected: prop.interaction.selected,
    },
  ];
}

function getNodeFillColor(node: AdventureCanvasNodeModel) {
  if (node.stateFlags.locked) return COLOR.steel;
  if (node.stateFlags.cleared || node.stateFlags.claimed) return COLOR.emerald;
  if (node.type === "boss") return COLOR.ember;
  if (node.type === "chest") return COLOR.gold;
  if (node.selected || node.stateFlags.current) return COLOR.gold;
  return COLOR.sky;
}

function getNodeHaloColor(node: AdventureCanvasNodeModel) {
  if (node.stateFlags.locked) return COLOR.steel;
  if (node.type === "boss") return COLOR.ember;
  if (node.type === "chest") return COLOR.gold;
  if (node.stateFlags.cleared || node.stateFlags.claimed) return COLOR.emerald;
  return node.selected || node.stateFlags.current ? COLOR.gold : COLOR.sky;
}
