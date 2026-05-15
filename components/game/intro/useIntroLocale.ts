"use client";

import { useEffect, useState } from "react";
import { DEFAULT_LOCALE, isLocaleCode, type LocaleCode } from "@/lib/i18n/locales";

/**
 * Resolve the locale used to render intro narrative.
 *  - If the user explicitly chose a non-default language in options, honour it.
 *  - Otherwise (still on DEFAULT_LOCALE), prefer the browser's language so a
 *    Spanish-speaking visitor sees Spanish copy without having to dig into
 *    options first. Doesn't mutate the store so the rest of the app stays
 *    on its persisted setting.
 */
export function useIntroLocale(storeLanguage: LocaleCode): LocaleCode {
  const [browserLocale, setBrowserLocale] = useState<LocaleCode | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.navigator.language || "";
    const base = raw.split("-")[0];
    if (isLocaleCode(raw)) setBrowserLocale(raw as LocaleCode);
    else if (isLocaleCode(base)) setBrowserLocale(base as LocaleCode);
  }, []);
  if (storeLanguage !== DEFAULT_LOCALE) return storeLanguage;
  return browserLocale ?? storeLanguage;
}
