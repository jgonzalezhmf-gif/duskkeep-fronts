import type { AdventureMapChapterLayout, AdventureMapPropLayout, AdventureMapPropType, AdventureMapRouteLayout } from "./mapLayout";
import type { AdventureVisualNode, AdventureVisualRoute } from "./campaignTypes";
import type { HomeEffectId } from "@/lib/homeEffectAssets";

export function buildRoutes(nodes: AdventureVisualNode[], routeLayouts: AdventureMapRouteLayout[] = []): AdventureVisualRoute[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  if (routeLayouts.length) {
    return routeLayouts
      .map((route) => {
        const from = byId.get(route.from);
        const to = byId.get(route.to);
        if (!from || !to) return null;
        return { ...route, from, to };
      })
      .filter((route): route is AdventureVisualRoute => Boolean(route));
  }
  return nodes.flatMap((from) =>
    from.connectsTo
      .map((id) => byId.get(id))
      .filter((to): to is AdventureVisualNode => Boolean(to))
      .map((to) => ({ id: `${from.id}-${to.id}`, from, to })),
  );
}

export function curvedRoute(route: AdventureVisualRoute) {
  const { from, to } = route;
  const controls = getRouteControls(route);
  return `M ${from.x} ${from.y} C ${controls.control1.x} ${controls.control1.y}, ${controls.control2.x} ${controls.control2.y}, ${to.x} ${to.y}`;
}

export function getRouteControls(route: AdventureVisualRoute) {
  const { from, to } = route;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return {
    control1: route.control1 ?? { x: Math.round(from.x + dx * 0.38), y: Math.round(from.y + dy * 0.12 - 28) },
    control2: route.control2 ?? { x: Math.round(from.x + dx * 0.62), y: Math.round(from.y + dy * 0.88 + 28) },
  };
}

export function getEditableRoutes(layout: AdventureMapChapterLayout, nodes: AdventureVisualNode[]): AdventureMapRouteLayout[] {
  if (layout.routes?.length) return layout.routes;
  return buildRoutes(nodes).map((route) => {
    const controls = getRouteControls(route);
    return {
      id: route.id,
      from: route.from.id,
      to: route.to.id,
      state: route.state,
      control1: controls.control1,
      control2: controls.control2,
    };
  });
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function getPropWidth(prop: AdventureMapPropLayout) {
  return prop.width ?? prop.size ?? getDefaultPropDimensions(prop.type).width;
}

export function getPropHeight(prop: AdventureMapPropLayout) {
  return prop.height ?? prop.size ?? getDefaultPropDimensions(prop.type).height;
}

export function getPropVisualOpacity(prop: AdventureMapPropLayout) {
  const base = prop.opacity ?? 1;
  if (prop.type === "hidden_glow" || prop.type === "hidden_glow_alt") return Math.min(base, 0.42);
  if (prop.type === "campfire" || prop.type === "road_lantern") return Math.min(base, 0.82);
  if (prop.type === "merchant_cart") return Math.min(base, 0.78);
  return base;
}

export function getDefaultPropDimensions(type: AdventureMapPropType) {
  if (type === "key_chest") return { width: 118, height: 84 };
  if (type === "clouds_dark_layer") return { width: 220, height: 92 };
  if (type === "campfire") return { width: 54, height: 54 };
  if (type === "small_camp") return { width: 82, height: 68 };
  if (type === "road_lantern") return { width: 38, height: 56 };
  if (type === "merchant_cart") return { width: 92, height: 74 };
  if (type === "ruin_marker") return { width: 70, height: 72 };
  if (type === "hidden_glow" || type === "hidden_glow_alt") return { width: 52, height: 52 };
  return { width: 72, height: 72 };
}

export function getDefaultPropEffect(type: AdventureMapPropType): AdventureMapPropLayout["effect"] {
  if (type === "campfire") {
    return {
      type: "flame_loop",
      xPercent: 50,
      yPercent: 35,
      widthPercent: 46,
      heightPercent: 46,
      opacity: 0.95,
      durationMs: 720,
      enabled: true,
    };
  }
  if (type === "road_lantern" || type === "small_camp" || type === "merchant_cart") {
    return {
      type: "lantern_warm_loop",
      xPercent: 52,
      yPercent: 38,
      widthPercent: 34,
      heightPercent: 34,
      opacity: 0.74,
      durationMs: 980,
      enabled: true,
    };
  }
  if (type === "hidden_glow" || type === "hidden_glow_alt") {
    return {
      type: "purple_flame_loop",
      xPercent: 50,
      yPercent: 50,
      widthPercent: 42,
      heightPercent: 42,
      opacity: 0.5,
      durationMs: 820,
      enabled: false,
    };
  }
  return undefined;
}

export function getEffectDuration(effect: HomeEffectId) {
  if (effect === "clouds_dark_layer") return 90000;
  if (effect === "crow_fly_loop") return 720;
  if (effect === "lantern_warm_loop") return 980;
  if (effect === "candle_loop") return 760;
  return 720;
}
