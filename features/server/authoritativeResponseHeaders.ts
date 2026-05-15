export const AUTHORITATIVE_CACHE_CONTROL = "private, no-store, max-age=0";
export const AUTHORITATIVE_PRAGMA = "no-cache";

export function mergeAuthoritativeResponseHeaders(headers?: HeadersInit) {
  const merged = new Headers(headers);
  merged.set("Cache-Control", AUTHORITATIVE_CACHE_CONTROL);
  merged.set("Pragma", AUTHORITATIVE_PRAGMA);
  return merged;
}
