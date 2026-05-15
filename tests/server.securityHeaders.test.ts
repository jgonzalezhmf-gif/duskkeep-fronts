import { describe, expect, it } from "vitest";
import { createContentSecurityPolicy, createSecurityHeaders } from "@/features/server/securityHeaders.mjs";

describe("security headers", () => {
  it("builds baseline browser hardening headers", () => {
    const headers = createSecurityHeaders({ NODE_ENV: "production" });
    const byKey = Object.fromEntries(headers.map((header) => [header.key, header.value]));

    expect(byKey["X-Frame-Options"]).toBe("DENY");
    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(byKey["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["Permissions-Policy"]).toContain("camera=()");
    expect(byKey["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(byKey["Content-Security-Policy"]).toContain("object-src 'none'");
  });

  it("keeps production CSP free of eval while allowing configured Supabase origins", () => {
    const csp = createContentSecurityPolicy({
      NODE_ENV: "production",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    });

    expect(csp).toContain("connect-src 'self' https://example.supabase.co wss://example.supabase.co");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain("Bearer");
    expect(csp).not.toContain("service_role");
  });

  it("allows eval only outside production for Next development tooling", () => {
    expect(createContentSecurityPolicy({ NODE_ENV: "development" })).toContain("'unsafe-eval'");
    expect(createContentSecurityPolicy({ NODE_ENV: "production" })).not.toContain("'unsafe-eval'");
  });
});
