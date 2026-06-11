import { writeFile } from "node:fs/promises";

import { NextResponse, type NextRequest } from "next/server";

import { ADVENTURE_MAP_CHAPTER_LAYOUTS } from "@/features/adventure/mapLayout";
import { getDevSaveRouteRejectedResponse } from "../devRouteGuards";
import {
  isFiniteNumber,
  normalizeLayout,
  renderAdventureMapLayout,
  TARGET_FILE,
} from "./adventureMapLayoutRouteUtils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rejectedResponse = getDevSaveRouteRejectedResponse({
    featureName: "Adventure map layout",
    headers: request.headers,
  });
  if (rejectedResponse) return rejectedResponse;

  const payload = (await request.json()) as { chapter?: unknown; layout?: unknown };
  if (!isFiniteNumber(payload.chapter)) {
    return NextResponse.json({ ok: false, message: "Invalid chapter." }, { status: 400 });
  }

  const chapter = Math.round(payload.chapter);
  const layout = normalizeLayout(payload.layout);
  if (!layout) {
    return NextResponse.json({ ok: false, message: "Invalid Adventure map layout payload." }, { status: 400 });
  }

  const nextLayouts = {
    ...ADVENTURE_MAP_CHAPTER_LAYOUTS,
    [chapter]: layout,
  };

  await writeFile(TARGET_FILE, renderAdventureMapLayout(nextLayouts), "utf8");

  return NextResponse.json({
    ok: true,
    message: `Saved Adventure chapter ${chapter} layout to adventureMapLayout.ts`,
  });
}
