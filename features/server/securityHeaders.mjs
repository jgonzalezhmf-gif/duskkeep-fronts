const DEFAULT_CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  "frame-ancestors": ["'none'"],
  "form-action": ["'self'"],
  "img-src": ["'self'", "data:", "blob:"],
  "font-src": ["'self'", "data:"],
  "media-src": ["'self'", "blob:"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "script-src": ["'self'", "'unsafe-inline'"],
  "worker-src": ["'self'", "blob:"],
  "manifest-src": ["'self'"],
};

export function createSecurityHeaders(env = process.env) {
  return [
    {
      key: "Content-Security-Policy",
      value: createContentSecurityPolicy(env),
    },
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    },
  ];
}

export function createContentSecurityPolicy(env = process.env) {
  const directives = {
    ...DEFAULT_CSP_DIRECTIVES,
    "script-src": [...DEFAULT_CSP_DIRECTIVES["script-src"]],
    "connect-src": createConnectSources(env),
  };

  if (env.NODE_ENV !== "production") {
    directives["script-src"].push("'unsafe-eval'");
  }

  return Object.entries(directives)
    .map(([name, values]) => `${name} ${dedupe(values).join(" ")}`)
    .join("; ");
}

function createConnectSources(env) {
  return [
    "'self'",
    ...getSupabaseSources(env.NEXT_PUBLIC_SUPABASE_URL),
    ...(env.NODE_ENV !== "production"
      ? ["http://localhost:*", "http://127.0.0.1:*", "ws://localhost:*", "ws://127.0.0.1:*"]
      : []),
  ];
}

function getSupabaseSources(rawUrl) {
  if (!rawUrl) return [];
  try {
    const url = new URL(rawUrl);
    const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
    return [url.origin, `${wsProtocol}//${url.host}`];
  } catch {
    return [];
  }
}

function dedupe(values) {
  return [...new Set(values.filter(Boolean))];
}
