import type {
  AdventureCanvasNodeModel,
  AdventureCanvasPartyMarkerModel,
  AdventureCanvasPoint,
  AdventureCanvasPropModel,
  AdventureCanvasRouteModel,
  AdventureCanvasSceneModel,
} from "@/features/canvas-runtime/adventureAdapter";
import type { CanvasRuntimeViewport } from "@/features/canvas-runtime/runtimeConfig";
import { ADVENTURE_MAP_INTERACTION_ASSETS } from "@/lib/adventureMapInteractionAssets";
import { getAdventureNodeAsset, getAdventurePropAsset } from "@/lib/adventureMapAssets";
import type { AdventureCanvasRuntimeApplication } from "./adventureCanvasRuntime";

export type AdventureCanvasRoutePrimitive = {
  id: string;
  points: [AdventureCanvasPoint, AdventureCanvasPoint, AdventureCanvasPoint, AdventureCanvasPoint];
  color: number;
  alpha: number;
  width: number;
};

export type AdventureCanvasBackgroundPrimitive = {
  id: string;
  src: string | null;
  position?: string;
  fallbackColor: number;
  alpha: number;
  zIndex: number;
};

export type AdventureCanvasBackgroundWashPrimitive = {
  id: string;
  color: number;
  alpha: number;
  zIndex: number;
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

export type AdventureCanvasNodeSpritePrimitive = {
  id: string;
  position: AdventureCanvasPoint;
  dimensions: {
    width: number;
    height: number;
  };
  src: string;
  alpha: number;
  selected: boolean;
  locked: boolean;
  zIndex: number;
};

export type AdventureCanvasRouteMarkerPrimitive = {
  id: string;
  position: AdventureCanvasPoint;
  radius: number;
  color: number;
  alpha: number;
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

export type AdventureCanvasPropSpritePrimitive = {
  id: string;
  position: AdventureCanvasPoint;
  dimensions: {
    width: number;
    height: number;
  };
  src: string;
  alpha: number;
  rotationDegrees: number;
  interactive: boolean;
};

export type AdventureCanvasPropEffectPrimitive = {
  id: string;
  position: AdventureCanvasPoint;
  dimensions: {
    width: number;
    height: number;
  };
  color: number;
  alpha: number;
};

export type AdventureCanvasPartyMarkerSpritePrimitive = {
  id: string;
  position: AdventureCanvasPoint;
  dimensions: {
    width: number;
    height: number;
  };
  src: string;
  alpha: number;
  zIndex: number;
};

export type AdventureCanvasPartyMarkerEffectPrimitive = {
  id: string;
  position: AdventureCanvasPoint;
  dimensions: {
    width: number;
    height: number;
  };
  color: number;
  alpha: number;
  zIndex: number;
};

export type AdventureCanvasRenderPlan = {
  designSize: AdventureCanvasSceneModel["designSize"];
  background: AdventureCanvasBackgroundPrimitive;
  backgroundWashes: AdventureCanvasBackgroundWashPrimitive[];
  routes: AdventureCanvasRoutePrimitive[];
  routeMarkers: AdventureCanvasRouteMarkerPrimitive[];
  nodes: AdventureCanvasNodePrimitive[];
  nodeSprites: AdventureCanvasNodeSpritePrimitive[];
  props: AdventureCanvasPropPrimitive[];
  propSprites: AdventureCanvasPropSpritePrimitive[];
  propEffects: AdventureCanvasPropEffectPrimitive[];
  partyMarkerSprites: AdventureCanvasPartyMarkerSpritePrimitive[];
  partyMarkerEffects: AdventureCanvasPartyMarkerEffectPrimitive[];
  focus: AdventureCanvasFocusPrimitive | null;
};

type PixiGraphicsLike = {
  moveTo: (x: number, y: number) => PixiGraphicsLike;
  bezierCurveTo: (cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => PixiGraphicsLike;
  rect: (x: number, y: number, width: number, height: number) => PixiGraphicsLike;
  circle: (x: number, y: number, radius: number) => PixiGraphicsLike;
  stroke: (options: { width: number; color: number; alpha?: number }) => PixiGraphicsLike;
  fill: (options: { color: number; alpha?: number }) => PixiGraphicsLike;
  zIndex?: number;
  destroy?: (options?: { children?: boolean }) => void;
};

type PixiGraphicsCtor = new () => PixiGraphicsLike;

type PixiSpriteLike = {
  anchor?: { set: (x: number, y?: number) => void };
  position?: { set: (x: number, y: number) => void };
  width?: number;
  height?: number;
  alpha?: number;
  rotation?: number;
  zIndex?: number;
  destroy?: (options?: { children?: boolean }) => void;
};

type PixiSpriteFactory = {
  from?: (source: string) => PixiSpriteLike;
};

type PixiStageLike = {
  addChild?: (...children: unknown[]) => unknown;
  removeChildren?: () => Array<{ destroy?: (options?: { children?: boolean }) => void }>;
  sortableChildren?: boolean;
};

type PixiRenderableApplication = AdventureCanvasRuntimeApplication & {
  stage?: PixiStageLike;
};

export type AdventureCanvasPixiModule = {
  Graphics: PixiGraphicsCtor;
  Sprite?: PixiSpriteFactory;
  Assets?: {
    load: (source: string) => Promise<unknown>;
  };
};

const stageRenderTokens = new WeakMap<PixiStageLike, symbol>();

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
    background: toBackgroundPrimitive(sceneModel),
    backgroundWashes: toBackgroundWashPrimitives(),
    routes: sceneModel.routes.map(toRoutePrimitive),
    routeMarkers: sceneModel.routes.flatMap(toRouteMarkerPrimitives),
    nodes: sceneModel.nodes.map(toNodePrimitive),
    nodeSprites: sceneModel.nodes.flatMap(toNodeSpritePrimitive),
    props: sceneModel.props.flatMap(toPropPrimitive),
    propSprites: sceneModel.props.flatMap(toPropSpritePrimitive),
    propEffects: sceneModel.props.flatMap(toPropEffectPrimitive),
    partyMarkerSprites: toPartyMarkerSpritePrimitive(sceneModel.partyMarker),
    partyMarkerEffects: toPartyMarkerEffectPrimitives(sceneModel.partyMarker),
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
  const renderToken = Symbol("adventure-canvas-render");
  stageRenderTokens.set(stage, renderToken);
  const scaleX = viewport.cssWidth / plan.designSize.width;
  const scaleY = viewport.cssHeight / plan.designSize.height;
  const avgScale = (scaleX + scaleY) / 2;
  const renderables: unknown[] = [];
  stage.sortableChildren = true;

  if (plan.background.src) {
    void renderBackgroundSprite({
      stage,
      pixi,
      background: plan.background,
      width: viewport.cssWidth,
      height: viewport.cssHeight,
      renderToken,
    });
  } else {
    const fallback = new pixi.Graphics();
    fallback
      .rect(0, 0, viewport.cssWidth, viewport.cssHeight)
      .fill({ color: plan.background.fallbackColor, alpha: plan.background.alpha });
    renderables.push(withZIndex(fallback, plan.background.zIndex));
  }

  for (const wash of plan.backgroundWashes) {
    const overlay = new pixi.Graphics();
    overlay
      .rect(0, 0, viewport.cssWidth, viewport.cssHeight)
      .fill({ color: wash.color, alpha: wash.alpha });
    renderables.push(withZIndex(overlay, wash.zIndex));
  }

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
    renderables.push(withZIndex(underlay, 4));

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
    renderables.push(withZIndex(line, 5));
  }

  for (const marker of plan.routeMarkers) {
    const shadow = new pixi.Graphics();
    shadow
      .circle(marker.position.x * scaleX, marker.position.y * scaleY, marker.radius * 1.35 * avgScale)
      .fill({ color: COLOR.black, alpha: 0.36 });
    renderables.push(withZIndex(shadow, 6));

    const rune = new pixi.Graphics();
    rune
      .circle(marker.position.x * scaleX, marker.position.y * scaleY, marker.radius * avgScale)
      .fill({ color: marker.color, alpha: marker.alpha })
      .stroke({ width: Math.max(1, 2 * avgScale), color: COLOR.white, alpha: 0.32 });
    renderables.push(withZIndex(rune, 7));
  }

  for (const effect of plan.propEffects) {
    const glow = new pixi.Graphics();
    glow
      .circle(
        effect.position.x * scaleX,
        effect.position.y * scaleY,
        Math.max(effect.dimensions.width * scaleX, effect.dimensions.height * scaleY) * 0.5,
      )
      .fill({ color: effect.color, alpha: effect.alpha });
    renderables.push(withZIndex(glow, 12));
  }

  void renderPropSprites({
    stage,
    pixi,
    sprites: plan.propSprites,
    scaleX,
    scaleY,
    renderToken,
  });

  for (const node of plan.nodes) {
    const halo = new pixi.Graphics();
    halo
      .circle(node.position.x * scaleX, node.position.y * scaleY, node.radius * 1.55 * avgScale)
      .fill({ color: node.haloColor, alpha: node.selected ? 0.26 : node.locked ? 0.05 : 0.11 });
    renderables.push(withZIndex(halo, 20));

    const marker = new pixi.Graphics();
    marker
      .circle(node.position.x * scaleX, node.position.y * scaleY, node.radius * avgScale)
      .fill({ color: node.fillColor, alpha: node.alpha })
      .stroke({
        width: Math.max(2, (node.selected ? 4 : 2) * avgScale),
        color: node.strokeColor,
        alpha: node.selected ? 0.92 : 0.66,
      });
    renderables.push(withZIndex(marker, 21));
  }

  void renderNodeSprites({
    stage,
    pixi,
    sprites: plan.nodeSprites,
    scaleX,
    scaleY,
    renderToken,
  });

  for (const effect of plan.partyMarkerEffects) {
    const glow = new pixi.Graphics();
    glow
      .circle(
        effect.position.x * scaleX,
        effect.position.y * scaleY,
        Math.max(effect.dimensions.width * scaleX, effect.dimensions.height * scaleY) * 0.5,
      )
      .fill({ color: effect.color, alpha: effect.alpha });
    renderables.push(withZIndex(glow, effect.zIndex));
  }

  void renderPartyMarkerSprites({
    stage,
    pixi,
    sprites: plan.partyMarkerSprites,
    scaleX,
    scaleY,
    renderToken,
  });

  for (const prop of plan.props) {
    const marker = new pixi.Graphics();
    marker
      .circle(prop.position.x * scaleX, prop.position.y * scaleY, prop.radius * avgScale)
      .fill({ color: prop.color, alpha: prop.alpha })
      .stroke({ width: Math.max(1, 2 * avgScale), color: COLOR.white, alpha: prop.selected ? 0.54 : 0.18 });
    renderables.push(withZIndex(marker, 34));
  }

  if (plan.focus) {
    const focus = new pixi.Graphics();
    focus
      .circle(plan.focus.position.x * scaleX, plan.focus.position.y * scaleY, plan.focus.radius * avgScale)
      .stroke({ width: Math.max(3, 5 * avgScale), color: plan.focus.color, alpha: 0.88 });
    renderables.push(withZIndex(focus, 35));
  }

  stage.addChild(...renderables);
}

function toBackgroundPrimitive(sceneModel: AdventureCanvasSceneModel): AdventureCanvasBackgroundPrimitive {
  return {
    id: "adventure-background",
    src: sceneModel.background.src ?? null,
    position: sceneModel.background.position,
    fallbackColor: 0x070b12,
    alpha: 1,
    zIndex: 0,
  };
}

function toBackgroundWashPrimitives(): AdventureCanvasBackgroundWashPrimitive[] {
  return [
    {
      id: "adventure-atmosphere-wash",
      color: 0x05080e,
      alpha: 0.1,
      zIndex: 1,
    },
    {
      id: "adventure-vignette-wash",
      color: 0x05080e,
      alpha: 0.2,
      zIndex: 2,
    },
  ];
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

function toRouteMarkerPrimitives(route: AdventureCanvasRouteModel, routeIndex: number): AdventureCanvasRouteMarkerPrimitive[] {
  if (route.state === "locked") return [];
  const [from, , , to] = route.pathPoints;

  return [0.36, 0.64].map((progress, markerIndex) => {
    const offset = (routeIndex + markerIndex) % 2 === 0 ? 10 : -10;
    return {
      id: `${route.id}-rune-${markerIndex}`,
      position: {
        x: from.x + (to.x - from.x) * progress + offset,
        y: from.y + (to.y - from.y) * progress + (markerIndex === 0 ? -8 : 8),
      },
      radius: 6,
      color: COLOR.gold,
      alpha: route.state === "cleared" ? 0.48 : 0.72,
    };
  });
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

function toNodeSpritePrimitive(node: AdventureCanvasNodeModel): AdventureCanvasNodeSpritePrimitive[] {
  const asset = getAdventureNodeAsset(node.assetRef.id);
  if (!asset) return [];

  const visualScale = getCanvasNodeVisualScale(node);
  const assetScale = getCanvasNodeAssetScale(node);
  const size = node.size * visualScale * assetScale;

  return [
    {
      id: node.id,
      position: node.position,
      dimensions: {
        width: size,
        height: size,
      },
      src: asset.src,
      alpha: getCanvasNodeSpriteAlpha(node),
      selected: node.selected,
      locked: node.stateFlags.locked,
      zIndex: Math.max(24, node.zIndex + 20),
    },
  ];
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

function toPropSpritePrimitive(prop: AdventureCanvasPropModel): AdventureCanvasPropSpritePrimitive[] {
  const src = getPropSpriteSource(prop);
  if (!src) return [];

  return [
    {
      id: prop.id,
      position: prop.position,
      dimensions: prop.dimensions,
      src,
      alpha: prop.opacity,
      rotationDegrees: prop.rotation.z,
      interactive: Boolean(prop.interaction),
    },
  ];
}

function toPropEffectPrimitive(prop: AdventureCanvasPropModel): AdventureCanvasPropEffectPrimitive[] {
  const effects: AdventureCanvasPropEffectPrimitive[] = [];

  if (prop.assetRef.manifest === "homeEffect") {
    const effectSize = Math.min(Math.max(Math.min(prop.dimensions.width, prop.dimensions.height), 18), 56);
    effects.push({
      id: `${prop.id}-effect`,
      position: prop.position,
      dimensions: {
        width: effectSize,
        height: effectSize,
      },
      color: getEffectColor(prop.assetRef.id),
      alpha: Math.min(0.34, prop.opacity * 0.28),
    });
  }

  if (prop.interaction?.status === "ready") {
    const dimensions = getReadyInteractionGlowDimensions(prop);
    effects.push({
      id: `${prop.id}-ready-glow`,
      position: prop.position,
      dimensions,
      color: COLOR.gold,
      alpha: prop.interaction.selected ? 0.28 : 0.18,
    });
  }

  return effects;
}

function toPartyMarkerSpritePrimitive(marker: AdventureCanvasPartyMarkerModel | null): AdventureCanvasPartyMarkerSpritePrimitive[] {
  if (!marker) return [];
  const asset = getAdventureNodeAsset("current");
  if (!asset) return [];

  const size = marker.size * 1.34;
  return [
    {
      id: "party-marker",
      position: toPartyMarkerVisualPosition(marker, size),
      dimensions: {
        width: size,
        height: size,
      },
      src: asset.src,
      alpha: 1,
      zIndex: Math.max(marker.zIndex ?? 42, 42),
    },
  ];
}

function toPartyMarkerEffectPrimitives(marker: AdventureCanvasPartyMarkerModel | null): AdventureCanvasPartyMarkerEffectPrimitive[] {
  if (!marker) return [];
  const size = marker.size * 1.34;
  const basePosition = toPartyMarkerVisualPosition(marker, size);
  const floorPosition = {
    x: basePosition.x,
    y: basePosition.y + size * 0.38,
  };

  return [
    {
      id: "party-marker-shadow",
      position: floorPosition,
      dimensions: {
        width: size * 0.74,
        height: size * 0.3,
      },
      color: COLOR.black,
      alpha: 0.42,
      zIndex: Math.max((marker.zIndex ?? 42) - 2, 38),
    },
    {
      id: "party-marker-glow",
      position: floorPosition,
      dimensions: {
        width: size * 0.6,
        height: size * 0.24,
      },
      color: COLOR.gold,
      alpha: 0.18,
      zIndex: Math.max((marker.zIndex ?? 42) - 1, 39),
    },
  ];
}

function toPartyMarkerVisualPosition(marker: AdventureCanvasPartyMarkerModel, size: number): AdventureCanvasPoint {
  return {
    x: marker.position.x,
    y: marker.position.y - size * 0.56,
  };
}

function getPropSpriteSource(prop: AdventureCanvasPropModel) {
  if (prop.assetRef.manifest === "adventureProp") {
    return getAdventurePropAsset(prop.assetRef.id)?.src ?? null;
  }
  if (prop.assetRef.manifest === "adventureMapInteraction") {
    return ADVENTURE_MAP_INTERACTION_ASSETS[prop.assetRef.id] ?? null;
  }
  return null;
}

function getEffectColor(effect: string) {
  if (effect.includes("purple") || effect.includes("crystal")) return COLOR.violet;
  if (effect.includes("blue") || effect.includes("portal")) return COLOR.sky;
  if (effect.includes("lantern") || effect.includes("candle")) return COLOR.gold;
  return COLOR.ember;
}

function getReadyInteractionGlowDimensions(prop: AdventureCanvasPropModel) {
  const base = Math.min(Math.max(Math.min(prop.dimensions.width, prop.dimensions.height), 28), 88);
  return {
    width: base * 1.24,
    height: base,
  };
}

function withZIndex<T extends { zIndex?: number }>(displayObject: T, zIndex: number): T {
  displayObject.zIndex = zIndex;
  return displayObject;
}

async function renderBackgroundSprite({
  stage,
  pixi,
  background,
  width,
  height,
  renderToken,
}: {
  stage: PixiStageLike;
  pixi: AdventureCanvasPixiModule;
  background: AdventureCanvasBackgroundPrimitive;
  width: number;
  height: number;
  renderToken: symbol;
}) {
  if (!pixi.Sprite || !background.src) return;

  let texture: unknown = null;
  try {
    texture = pixi.Assets?.load ? await pixi.Assets.load(background.src) : null;
  } catch {
    texture = null;
  }

  if (stageRenderTokens.get(stage) !== renderToken) {
    return;
  }

  const SpriteCtor = pixi.Sprite as unknown as { new (texture?: unknown): PixiSpriteLike };
  const sprite = texture ? new SpriteCtor(texture) : pixi.Sprite.from?.(background.src);
  if (!sprite) return;

  sprite.anchor?.set(0.5);
  sprite.position?.set(width / 2, height / 2);
  sprite.width = width;
  sprite.height = height;
  sprite.alpha = background.alpha;
  sprite.zIndex = background.zIndex;
  stage.addChild?.(sprite);
}

async function renderPropSprites({
  stage,
  pixi,
  sprites,
  scaleX,
  scaleY,
  renderToken,
}: {
  stage: PixiStageLike;
  pixi: AdventureCanvasPixiModule;
  sprites: AdventureCanvasPropSpritePrimitive[];
  scaleX: number;
  scaleY: number;
  renderToken: symbol;
}) {
  if (!pixi.Sprite || sprites.length === 0) return;

  for (const spritePrimitive of sprites) {
    let texture: unknown = null;
    try {
      texture = pixi.Assets?.load ? await pixi.Assets.load(spritePrimitive.src) : null;
    } catch {
      texture = null;
    }

    if (stageRenderTokens.get(stage) !== renderToken) {
      return;
    }

    const SpriteCtor = pixi.Sprite as unknown as { new (texture?: unknown): PixiSpriteLike };
    const sprite = texture ? new SpriteCtor(texture) : pixi.Sprite.from?.(spritePrimitive.src);
    if (!sprite) continue;

    sprite.anchor?.set(0.5);
    sprite.position?.set(spritePrimitive.position.x * scaleX, spritePrimitive.position.y * scaleY);
    sprite.width = spritePrimitive.dimensions.width * scaleX;
    sprite.height = spritePrimitive.dimensions.height * scaleY;
    sprite.alpha = spritePrimitive.alpha;
    sprite.rotation = (spritePrimitive.rotationDegrees * Math.PI) / 180;
    sprite.zIndex = spritePrimitive.interactive ? 32 : 14;
    stage.addChild?.(sprite);
  }
}

async function renderNodeSprites({
  stage,
  pixi,
  sprites,
  scaleX,
  scaleY,
  renderToken,
}: {
  stage: PixiStageLike;
  pixi: AdventureCanvasPixiModule;
  sprites: AdventureCanvasNodeSpritePrimitive[];
  scaleX: number;
  scaleY: number;
  renderToken: symbol;
}) {
  if (!pixi.Sprite || sprites.length === 0) return;

  for (const spritePrimitive of sprites) {
    let texture: unknown = null;
    try {
      texture = pixi.Assets?.load ? await pixi.Assets.load(spritePrimitive.src) : null;
    } catch {
      texture = null;
    }

    if (stageRenderTokens.get(stage) !== renderToken) {
      return;
    }

    const SpriteCtor = pixi.Sprite as unknown as { new (texture?: unknown): PixiSpriteLike };
    const sprite = texture ? new SpriteCtor(texture) : pixi.Sprite.from?.(spritePrimitive.src);
    if (!sprite) continue;

    sprite.anchor?.set(0.5);
    sprite.position?.set(spritePrimitive.position.x * scaleX, spritePrimitive.position.y * scaleY);
    sprite.width = spritePrimitive.dimensions.width * scaleX;
    sprite.height = spritePrimitive.dimensions.height * scaleY;
    sprite.alpha = spritePrimitive.alpha;
    sprite.zIndex = spritePrimitive.zIndex;
    stage.addChild?.(sprite);
  }
}

async function renderPartyMarkerSprites({
  stage,
  pixi,
  sprites,
  scaleX,
  scaleY,
  renderToken,
}: {
  stage: PixiStageLike;
  pixi: AdventureCanvasPixiModule;
  sprites: AdventureCanvasPartyMarkerSpritePrimitive[];
  scaleX: number;
  scaleY: number;
  renderToken: symbol;
}) {
  if (!pixi.Sprite || sprites.length === 0) return;

  for (const spritePrimitive of sprites) {
    let texture: unknown = null;
    try {
      texture = pixi.Assets?.load ? await pixi.Assets.load(spritePrimitive.src) : null;
    } catch {
      texture = null;
    }

    if (stageRenderTokens.get(stage) !== renderToken) {
      return;
    }

    const SpriteCtor = pixi.Sprite as unknown as { new (texture?: unknown): PixiSpriteLike };
    const sprite = texture ? new SpriteCtor(texture) : pixi.Sprite.from?.(spritePrimitive.src);
    if (!sprite) continue;

    sprite.anchor?.set(0.5);
    sprite.position?.set(spritePrimitive.position.x * scaleX, spritePrimitive.position.y * scaleY);
    sprite.width = spritePrimitive.dimensions.width * scaleX;
    sprite.height = spritePrimitive.dimensions.height * scaleY;
    sprite.alpha = spritePrimitive.alpha;
    sprite.zIndex = spritePrimitive.zIndex;
    stage.addChild?.(sprite);
  }
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

function getCanvasNodeVisualScale(node: AdventureCanvasNodeModel) {
  if (node.selected || node.stateFlags.current) return node.type === "boss" ? 1.38 : 1.34;
  if (node.type === "boss") return 1.28;
  if (node.type === "chest") return 1.22;
  if (node.type === "elite") return 1.18;
  if (node.status === "locked") return 0.86;
  if (node.status === "cleared" || node.status === "claimed" || node.status === "completed") return 1.1;
  return 1.18;
}

function getCanvasNodeAssetScale(node: AdventureCanvasNodeModel) {
  if (node.selected || node.stateFlags.current) return 1.08;
  if (node.type === "boss") return 1.08;
  if (node.type === "chest") return 1.06;
  if (node.status === "locked") return 0.96;
  return 1.04;
}

function getCanvasNodeSpriteAlpha(node: AdventureCanvasNodeModel) {
  if (node.stateFlags.locked) return 0.72;
  if (node.stateFlags.cleared || node.stateFlags.claimed) return 0.88;
  return 1;
}
