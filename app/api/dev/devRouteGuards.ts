import { NextResponse } from "next/server";

export function getDevSaveRouteDisabledResponse(featureName: string, nodeEnv = process.env.NODE_ENV) {
  if (nodeEnv !== "production") return null;
  return NextResponse.json({ ok: false, message: `Saving ${featureName} is disabled in production.` }, { status: 403 });
}
