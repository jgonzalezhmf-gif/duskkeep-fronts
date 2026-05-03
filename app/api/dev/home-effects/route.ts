import { writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse, type NextRequest } from "next/server";

import { HOME_EFFECT_IDS, type HomeEffectId } from "@/lib/homeEffectAssets";
import type { HomeLandmarkId } from "@/lib/homeLandmarkAssets";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type HomeEffectAnchorId = HomeLandmarkId | "world";

type HomeEffectConfigInput = {
  id: string;
  landmark: HomeEffectAnchorId;
  effect: HomeEffectId;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  opacity: number;
  frameCount: number;
  durationMs: number;
  enabled: boolean;
  rotationDeg?: number;
  yawDeg?: number;
  originXPercent?: number;
  originYPercent?: number;
  anchorXPercent?: number;
  anchorYPercent?: number;
  flipX?: boolean;
  flipY?: boolean;
  backgroundY?: string;
  mobileDisabled?: boolean;
};

const VALID_ANCHORS = new Set<HomeEffectAnchorId>(["world", "fortress", "adventure", "arena", "market", "events", "deck"]);
const VALID_EFFECTS = new Set<HomeEffectId>(HOME_EFFECT_IDS);
const TARGET_FILE = path.join(process.cwd(), "components", "game", "home", "homeEffectLayout.ts");

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function toRoundedNumber(value: number) {
  return Math.round(value * 10) / 10;
}

function normalizeEffect(value: unknown): HomeEffectConfigInput | null {
  if (!value || typeof value !== "object") return null;
  const effect = value as Partial<HomeEffectConfigInput>;

  if (
    typeof effect.id !== "string" ||
    !VALID_ANCHORS.has(effect.landmark as HomeEffectAnchorId) ||
    !VALID_EFFECTS.has(effect.effect as HomeEffectId) ||
    !isFiniteNumber(effect.xPercent) ||
    !isFiniteNumber(effect.yPercent) ||
    !isFiniteNumber(effect.widthPercent) ||
    !isFiniteNumber(effect.heightPercent) ||
    !isFiniteNumber(effect.opacity) ||
    !isFiniteNumber(effect.frameCount) ||
    !isFiniteNumber(effect.durationMs) ||
    typeof effect.enabled !== "boolean"
  ) {
    return null;
  }

  return {
    id: effect.id,
    landmark: effect.landmark as HomeEffectAnchorId,
    effect: effect.effect as HomeEffectId,
    xPercent: toRoundedNumber(effect.xPercent),
    yPercent: toRoundedNumber(effect.yPercent),
    widthPercent: toRoundedNumber(effect.widthPercent),
    heightPercent: toRoundedNumber(effect.heightPercent),
    opacity: Math.round(Math.min(1, Math.max(0, effect.opacity)) * 100) / 100,
    frameCount: Math.max(1, Math.round(effect.frameCount)),
    durationMs: Math.max(80, Math.round(effect.durationMs)),
    enabled: effect.enabled,
    ...(isFiniteNumber(effect.rotationDeg) ? { rotationDeg: toRoundedNumber(effect.rotationDeg) } : {}),
    ...(isFiniteNumber(effect.yawDeg) ? { yawDeg: toRoundedNumber(effect.yawDeg) } : {}),
    ...(isFiniteNumber(effect.originXPercent) ? { originXPercent: toRoundedNumber(Math.min(100, Math.max(0, effect.originXPercent))) } : {}),
    ...(isFiniteNumber(effect.originYPercent) ? { originYPercent: toRoundedNumber(Math.min(100, Math.max(0, effect.originYPercent))) } : {}),
    ...(isFiniteNumber(effect.anchorXPercent) ? { anchorXPercent: toRoundedNumber(Math.min(100, Math.max(0, effect.anchorXPercent))) } : {}),
    ...(isFiniteNumber(effect.anchorYPercent) ? { anchorYPercent: toRoundedNumber(Math.min(100, Math.max(0, effect.anchorYPercent))) } : {}),
    ...(typeof effect.flipX === "boolean" ? { flipX: effect.flipX } : {}),
    ...(typeof effect.flipY === "boolean" ? { flipY: effect.flipY } : {}),
    ...(typeof effect.backgroundY === "string" ? { backgroundY: effect.backgroundY } : {}),
    ...(typeof effect.mobileDisabled === "boolean" ? { mobileDisabled: effect.mobileDisabled } : {}),
  };
}

function effectKeyToTs(value: string) {
  return /^[a-zA-Z_$][\w$]*$/.test(value) ? value : JSON.stringify(value);
}

function serializeValue(value: unknown, indent = 4): string {
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    const nextIndent = indent + 2;
    return `[\n${value.map((item) => `${" ".repeat(nextIndent)}${serializeValue(item, nextIndent)}`).join(",\n")}\n${" ".repeat(indent)}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, item]) => item !== undefined);
    const nextIndent = indent + 2;
    return `{\n${entries.map(([key, item]) => `${" ".repeat(nextIndent)}${effectKeyToTs(key)}: ${serializeValue(item, nextIndent)}`).join(",\n")}\n${" ".repeat(indent)}}`;
  }

  return JSON.stringify(value);
}

function renderHomeEffectLayout(effects: HomeEffectConfigInput[]) {
  return `import type { HomeEffectId } from "@/lib/homeEffectAssets";
import type { HomeLandmarkId } from "@/lib/homeLandmarkAssets";

export type HomeEffectAnchorId = HomeLandmarkId | "world";

export type HomeLandmarkEffectConfig = {
  id: string;
  landmark: HomeEffectAnchorId;
  effect: HomeEffectId;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  opacity: number;
  frameCount: number;
  durationMs: number;
  enabled: boolean;
  rotationDeg?: number;
  yawDeg?: number;
  originXPercent?: number;
  originYPercent?: number;
  anchorXPercent?: number;
  anchorYPercent?: number;
  flipX?: boolean;
  flipY?: boolean;
  backgroundY?: string;
  mobileDisabled?: boolean;
};

export function isHomeLandmarkEffectAnchor(anchor: HomeEffectAnchorId): anchor is HomeLandmarkId {
  return anchor !== "world";
}

export const HOME_LANDMARK_EFFECT_DEFS: HomeLandmarkEffectConfig[] = ${serializeValue(effects, 0)};

export function groupHomeLandmarkEffects(effects: HomeLandmarkEffectConfig[]) {
  return effects.reduce<Partial<Record<HomeLandmarkId, HomeLandmarkEffectConfig[]>>>((groups, effect) => {
    if (!effect.enabled || !isHomeLandmarkEffectAnchor(effect.landmark)) return groups;
    groups[effect.landmark] = [...(groups[effect.landmark] ?? []), effect];
    return groups;
  }, {});
}

export function getHomeWorldEffects(effects: HomeLandmarkEffectConfig[]) {
  return effects.filter((effect) => effect.enabled && effect.landmark === "world");
}

export const HOME_LANDMARK_EFFECTS = groupHomeLandmarkEffects(HOME_LANDMARK_EFFECT_DEFS);
export const HOME_WORLD_EFFECTS = getHomeWorldEffects(HOME_LANDMARK_EFFECT_DEFS);
`;
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, message: "Saving Home effects is disabled in production." }, { status: 403 });
  }

  const payload = (await request.json()) as { effects?: unknown };
  if (!Array.isArray(payload.effects)) {
    return NextResponse.json({ ok: false, message: "Invalid effects payload." }, { status: 400 });
  }

  const normalized = payload.effects.map(normalizeEffect);
  if (normalized.some((effect) => effect === null)) {
    return NextResponse.json({ ok: false, message: "Effects payload contains invalid entries." }, { status: 400 });
  }

  const ids = normalized.map((effect) => effect?.id);
  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ ok: false, message: "Effect ids must be unique before saving." }, { status: 400 });
  }

  const effects = normalized as HomeEffectConfigInput[];
  await writeFile(TARGET_FILE, renderHomeEffectLayout(effects), "utf8");

  return NextResponse.json({
    ok: true,
    message: `Saved ${effects.length} Home effects to homeEffectLayout.ts`,
  });
}
