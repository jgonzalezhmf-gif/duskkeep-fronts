import type { TranslationTree } from "../dictionaryTypes";

export const frDictionary = {
    app: { title: "Duskkeep Fronts", alpha: "Version alpha" },
    nav: { home: "Accueil", base: "Base", adventure: "Aventure", pve: "PvE", deck: "Deck", cards: "Cartes", fortress: "Forteresse", core: "Noyau", arena: "Arène", pvp: "PvP", market: "Marché", shop: "Boutique" },
    options: { button: "Options", title: "Options", subtitle: "Réglez la langue, l'audio et le confort.", language: "Langue", languageHint: "Le texte de l'interface se met à jour immédiatement. La migration complète sera progressive.", audio: "Audio", music: "Musique", effects: "Effets", muted: "Muet", live: "Actif", comfort: "Confort", reducedMotion: "Réduire les animations", visualEffects: "Effets visuels", textScale: "Taille du texte", normal: "Normal", large: "Grand", current: "Actuel", close: "Fermer" },
    audio: { mixer: "Mix audio", mixerSubtitle: "Musique et effets", unmute: "Réactiver le son", audioMixer: "Mixeur audio", soundOff: "Son coupé", openMixer: "Ouvrir le mixeur audio" },
    common: { return: "Retour", home: "Accueil" },
  } as const satisfies TranslationTree;
