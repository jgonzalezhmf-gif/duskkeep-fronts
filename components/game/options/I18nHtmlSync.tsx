"use client";

import { useEffect } from "react";
import { DEFAULT_LOCALE, LOCALE_BY_CODE } from "@/lib/i18n/locales";
import { useGameStore } from "@/lib/store";

export default function I18nHtmlSync() {
  const language = useGameStore((state) => state.language);
  const reducedMotion = useGameStore((state) => state.reducedMotion);
  const visualEffects = useGameStore((state) => state.visualEffects);
  const textScale = useGameStore((state) => state.textScale);

  useEffect(() => {
    const locale = LOCALE_BY_CODE[language] ?? LOCALE_BY_CODE[DEFAULT_LOCALE];
    document.documentElement.lang = locale.code;
    document.documentElement.dir = locale.dir;
    document.documentElement.dataset.motion = reducedMotion ? "reduced" : "full";
    document.documentElement.dataset.visualEffects = visualEffects ? "on" : "off";
    document.documentElement.dataset.textScale = textScale;
  }, [language, reducedMotion, textScale, visualEffects]);

  return null;
}
