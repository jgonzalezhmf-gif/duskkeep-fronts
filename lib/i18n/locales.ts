export const SUPPORTED_LOCALES = [
  { code: "en", label: "English", nativeName: "English", dir: "ltr" },
  { code: "es", label: "Spanish", nativeName: "Español", dir: "ltr" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];
export type TextDirection = (typeof SUPPORTED_LOCALES)[number]["dir"];

export const DEFAULT_LOCALE: LocaleCode = "en";

export const LOCALE_BY_CODE: Record<LocaleCode, (typeof SUPPORTED_LOCALES)[number]> = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale.code, locale]),
) as Record<LocaleCode, (typeof SUPPORTED_LOCALES)[number]>;

export function isLocaleCode(value: string): value is LocaleCode {
  return value in LOCALE_BY_CODE;
}
