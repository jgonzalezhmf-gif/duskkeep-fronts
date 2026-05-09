import { writeFile } from "node:fs/promises";

import { NextResponse, type NextRequest } from "next/server";

import {
  normalizeHomeEffect,
  renderHomeEffectLayout,
  TARGET_FILE,
  type HomeEffectConfigInput,
} from "./homeEffectsRouteUtils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, message: "Saving Home effects is disabled in production." }, { status: 403 });
  }

  const payload = (await request.json()) as { effects?: unknown };
  if (!Array.isArray(payload.effects)) {
    return NextResponse.json({ ok: false, message: "Invalid effects payload." }, { status: 400 });
  }

  const normalized = payload.effects.map(normalizeHomeEffect);
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
