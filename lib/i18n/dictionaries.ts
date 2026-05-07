import type { LocaleCode } from "./locales";
import type { TranslationTree, TranslationValue } from "./dictionaryTypes";
import { enDictionary } from "./dictionary-data/en";
import { esDictionary } from "./dictionary-data/es";
import { zhCNDictionary } from "./dictionary-data/zh-CN";
import { jaDictionary } from "./dictionary-data/ja";
import { koDictionary } from "./dictionary-data/ko";
import { ptBRDictionary } from "./dictionary-data/pt-BR";
import { frDictionary } from "./dictionary-data/fr";
import { deDictionary } from "./dictionary-data/de";

export type { TranslationTree, TranslationValue };

export const dictionaries = {
  en: enDictionary,
  es: esDictionary,
  "zh-CN": zhCNDictionary,
  ja: jaDictionary,
  ko: koDictionary,
  "pt-BR": ptBRDictionary,
  fr: frDictionary,
  de: deDictionary,
} as const satisfies Record<LocaleCode, TranslationTree>;
