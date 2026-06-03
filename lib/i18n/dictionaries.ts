import type { LocaleCode } from "./locales";
import type { TranslationTree, TranslationValue } from "./dictionaryTypes";
import { enDictionary } from "./dictionary-data/en";
import { esDictionary } from "./dictionary-data/es";

export type { TranslationTree, TranslationValue };

export const dictionaries = {
  en: enDictionary,
  es: esDictionary,
} as const satisfies Record<LocaleCode, TranslationTree>;
