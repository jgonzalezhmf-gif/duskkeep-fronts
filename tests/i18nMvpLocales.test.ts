import { describe, expect, it } from "vitest";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { isLocaleCode, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import type { TranslationTree, TranslationValue } from "@/lib/i18n/dictionaryTypes";

function flattenKeys(tree: TranslationTree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") return [nextKey];
    return flattenKeys(value as Record<string, TranslationValue>, nextKey);
  });
}

describe("MVP localization support", () => {
  it("only exposes English and Spanish locales", () => {
    expect(SUPPORTED_LOCALES.map((locale) => locale.code)).toEqual(["en", "es"]);
    expect(Object.keys(dictionaries).sort()).toEqual(["en", "es"]);
    expect(isLocaleCode("en")).toBe(true);
    expect(isLocaleCode("es")).toBe(true);
    expect(isLocaleCode("zh-CN")).toBe(false);
    expect(isLocaleCode("ja")).toBe(false);
    expect(isLocaleCode("ko")).toBe(false);
    expect(isLocaleCode("pt-BR")).toBe(false);
    expect(isLocaleCode("fr")).toBe(false);
    expect(isLocaleCode("de")).toBe(false);
  });

  it("keeps English and Spanish dictionaries structurally aligned", () => {
    const englishKeys = flattenKeys(dictionaries.en).sort();
    const spanishKeys = flattenKeys(dictionaries.es).sort();

    expect(spanishKeys).toEqual(englishKeys);
  });
});
