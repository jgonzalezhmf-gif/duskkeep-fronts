export const AUTHORITATIVE_CACHE_CONTROL = "private, no-store, max-age=0";
export const AUTHORITATIVE_PRAGMA = "no-cache";
export const AUTHORITATIVE_REQUEST_ID_HEADER = "X-Request-Id";

export function mergeAuthoritativeResponseHeaders(headers?: HeadersInit, options: { requestId?: string } = {}) {
  const merged = new Headers(headers);
  merged.set("Cache-Control", AUTHORITATIVE_CACHE_CONTROL);
  merged.set("Pragma", AUTHORITATIVE_PRAGMA);
  if (options.requestId) merged.set(AUTHORITATIVE_REQUEST_ID_HEADER, options.requestId);
  return merged;
}
