import { randomUUID } from "node:crypto";

const REQUEST_ID_PREFIX = "authreq";

export function createAuthoritativeRequestId(now = Date.now(), uuid = randomUUID()) {
  return sanitizeAuthoritativeRequestId(`${REQUEST_ID_PREFIX}_${now.toString(36)}_${uuid}`);
}

export function sanitizeAuthoritativeRequestId(requestId: string) {
  return requestId.trim().slice(0, 96).replace(/[^a-zA-Z0-9:._-]/g, "_");
}
