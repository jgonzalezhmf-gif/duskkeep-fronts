import { NextResponse } from "next/server";
import {
  checkAuthoritativeBodySize,
  checkAuthoritativeContentType,
  checkAuthoritativeFetchSite,
} from "@/features/server/authoritativeRequestGuards";

const DEV_SAVE_MAX_BODY_BYTES = 512 * 1024;

export function getDevSaveRouteDisabledResponse(featureName: string, nodeEnv: string | undefined = process.env.NODE_ENV) {
  if (nodeEnv !== "production") return null;
  return NextResponse.json({ ok: false, message: `Saving ${featureName} is disabled in production.` }, { status: 403 });
}

export function getDevSaveRouteRejectedResponse({
  featureName,
  headers,
  nodeEnv = process.env.NODE_ENV,
}: {
  featureName: string;
  headers: Pick<Headers, "get">;
  nodeEnv?: string;
}) {
  const disabledResponse = getDevSaveRouteDisabledResponse(featureName, nodeEnv);
  if (disabledResponse) return disabledResponse;

  const fetchSite = checkAuthoritativeFetchSite({ headers });
  if (!fetchSite.ok) {
    return NextResponse.json({ ok: false, message: "Cross-site dev save requests are not allowed." }, { status: 403 });
  }

  const contentType = checkAuthoritativeContentType({ headers });
  if (!contentType.ok) {
    return NextResponse.json({ ok: false, message: "Dev save requests must use application/json." }, { status: 415 });
  }

  const bodySize = checkAuthoritativeBodySize({ headers, maxBytes: DEV_SAVE_MAX_BODY_BYTES });
  if (!bodySize.ok) {
    return NextResponse.json({ ok: false, message: "Dev save request body is too large." }, { status: 413 });
  }

  return null;
}
