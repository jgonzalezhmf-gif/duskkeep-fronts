declare module "@/features/server/securityHeaders.mjs" {
  export type SecurityHeader = {
    key: string;
    value: string;
  };

  export function createSecurityHeaders(env?: Record<string, string | undefined>): SecurityHeader[];

  export function createContentSecurityPolicy(env?: Record<string, string | undefined>): string;
}
