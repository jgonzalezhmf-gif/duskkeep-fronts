"use client";

import { dictionaries, type TranslationTree, type TranslationValue } from "./dictionaries";
import { DEFAULT_LOCALE, LOCALE_BY_CODE } from "./locales";
import { useGameStore } from "@/lib/store";

type Params = Record<string, string | number>;

function lookup(tree: TranslationTree, key: string): TranslationValue | undefined {
  return key.split(".").reduce<TranslationValue | undefined>((current, part) => {
    if (!current || typeof current === "string") return undefined;
    return current[part];
  }, tree);
}

function interpolate(value: string, params?: Params) {
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
}

export function translate(locale: keyof typeof dictionaries, key: string, params?: Params) {
  const value = lookup(dictionaries[locale], key) ?? lookup(dictionaries[DEFAULT_LOCALE], key);
  if (typeof value !== "string") return key;
  return interpolate(value, params);
}

export function useI18n() {
  const language = useGameStore((state) => state.language);
  const locale = LOCALE_BY_CODE[language] ? language : DEFAULT_LOCALE;

  return {
    locale,
    localeInfo: LOCALE_BY_CODE[locale],
    t: (key: string, params?: Params) => translate(locale, key, params),
  };
}
