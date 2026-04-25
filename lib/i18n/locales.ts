export const SUPPORTED_LOCALES = [
  { code: "en", label: "English", nativeName: "English", dir: "ltr" },
  { code: "es", label: "Spanish", nativeName: "Español", dir: "ltr" },
  { code: "zh-CN", label: "Chinese", nativeName: "简体中文", dir: "ltr" },
  { code: "ja", label: "Japanese", nativeName: "日本語", dir: "ltr" },
  { code: "ko", label: "Korean", nativeName: "한국어", dir: "ltr" },
  { code: "pt-BR", label: "Portuguese", nativeName: "Português BR", dir: "ltr" },
  { code: "fr", label: "French", nativeName: "Français", dir: "ltr" },
  { code: "de", label: "German", nativeName: "Deutsch", dir: "ltr" },
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
