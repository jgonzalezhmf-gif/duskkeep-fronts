export type RegistrationPasswordStrength = "weak" | "medium" | "strong";

export const REGISTRATION_PASSWORD_MIN_LENGTH = 9;

export type RegistrationPasswordStrengthResult = {
  level: RegistrationPasswordStrength;
  score: number;
  meetsLength: boolean;
};

export function isRegistrationPasswordFormatValid(password: string) {
  return password.length >= REGISTRATION_PASSWORD_MIN_LENGTH;
}

export function doRegistrationPasswordsMatch(password: string, confirmation: string) {
  return confirmation.length > 0 && password === confirmation;
}

export function getRegistrationPasswordStrength(password: string): RegistrationPasswordStrengthResult {
  const meetsLength = isRegistrationPasswordFormatValid(password);
  let score = meetsLength ? 1 : 0;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length >= 14) score += 1;

  return {
    level: score >= 4 ? "strong" : score >= 3 ? "medium" : "weak",
    score,
    meetsLength,
  };
}
