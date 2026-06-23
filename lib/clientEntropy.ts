let fallbackCounter = 0;

function nextFallbackCounter() {
  fallbackCounter = (fallbackCounter + 1) % Number.MAX_SAFE_INTEGER;
  return fallbackCounter;
}

function getRuntimeCrypto() {
  return typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
}

function bytesToBase36(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("");
}

export function createEntropyToken(byteLength = 16) {
  const runtimeCrypto = getRuntimeCrypto();
  if (runtimeCrypto && "randomUUID" in runtimeCrypto && typeof runtimeCrypto.randomUUID === "function") {
    return runtimeCrypto.randomUUID();
  }
  if (runtimeCrypto && "getRandomValues" in runtimeCrypto && typeof runtimeCrypto.getRandomValues === "function") {
    const bytes = new Uint8Array(Math.max(1, byteLength));
    runtimeCrypto.getRandomValues(bytes);
    return bytesToBase36(bytes);
  }
  return `${Date.now().toString(36)}-${nextFallbackCounter().toString(36)}`;
}

export function createEntropySeedMaterial(scope: string) {
  return `${scope}:${Date.now().toString(36)}:${createEntropyToken(8)}`;
}
