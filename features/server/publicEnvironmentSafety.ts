import { looksLikeSupabaseSecretKey } from "@/features/server/supabasePublicConfig";

export type PublicEnvironmentSafetyIssue = {
  key: string;
  reason: "dangerous_public_name" | "secret_like_value";
};

const DANGEROUS_PUBLIC_NAME_PATTERN = /(^|_)secret($|_)|(^|_)service_?role($|_)|(^|_)password($|_)|(^|_)private_?key($|_)/i;

export function getPublicEnvironmentSafetyIssues(
  env: Record<string, string | undefined> = process.env,
): PublicEnvironmentSafetyIssue[] {
  return Object.entries(env)
    .filter(([key]) => key.startsWith("NEXT_PUBLIC_"))
    .flatMap(([key, value]) => getPublicEnvironmentVariableIssues(key, value));
}

export function isPublicEnvironmentSafe(env: Record<string, string | undefined> = process.env) {
  return getPublicEnvironmentSafetyIssues(env).length === 0;
}

function getPublicEnvironmentVariableIssues(key: string, value: string | undefined): PublicEnvironmentSafetyIssue[] {
  const issues: PublicEnvironmentSafetyIssue[] = [];
  if (DANGEROUS_PUBLIC_NAME_PATTERN.test(key)) {
    issues.push({ key, reason: "dangerous_public_name" });
  }

  if (value && looksLikePublicSecretValue(value)) {
    issues.push({ key, reason: "secret_like_value" });
  }

  return issues;
}

function looksLikePublicSecretValue(value: string) {
  const normalized = value.trim();
  if (!normalized) return false;
  if (looksLikeSupabaseSecretKey(normalized)) return true;
  if (/^sk_(live|test)_/i.test(normalized)) return true;
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(normalized)) return true;
  return false;
}
