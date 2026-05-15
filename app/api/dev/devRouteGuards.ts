import { NextResponse } from "next/server";
import { checkAuthoritativeFetchSite } from "@/features/server/authoritativeRequestGuards";

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
  if (fetchSite.ok) return null;

  return NextResponse.json({ ok: false, message: "Cross-site dev save requests are not allowed." }, { status: 403 });
}
