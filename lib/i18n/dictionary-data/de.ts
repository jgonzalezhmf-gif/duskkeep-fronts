import type { TranslationTree } from "../dictionaryTypes";

export const deDictionary = {
    app: { title: "Duskkeep Fronts", alpha: "Alpha-Build" },
    nav: { home: "Start", base: "Basis", adventure: "Abenteuer", pve: "PvE", deck: "Deck", cards: "Karten", fortress: "Festung", core: "Kern", arena: "Arena", pvp: "PvP", market: "Markt", shop: "Shop" },
    options: { button: "Optionen", title: "Optionen", subtitle: "Sprache, Audio und Komfort anpassen.", language: "Sprache", languageHint: "UI-Text wird sofort aktualisiert. Die vollständige Inhaltsmigration erfolgt schrittweise.", audio: "Audio", music: "Musik", effects: "Effekte", muted: "Stumm", live: "Aktiv", comfort: "Komfort", reducedMotion: "Bewegung reduzieren", visualEffects: "Visuelle Effekte", textScale: "Textgröße", normal: "Normal", large: "Groß", current: "Aktuell", close: "Schließen" },
    audio: { mixer: "Audio-Mix", mixerSubtitle: "Musik und Effekte", unmute: "Ton aktivieren", audioMixer: "Audio-Mixer", soundOff: "Ton aus", openMixer: "Audio-Mixer öffnen" },
    common: { return: "Zurück", home: "Start" },
  } as const satisfies TranslationTree;
