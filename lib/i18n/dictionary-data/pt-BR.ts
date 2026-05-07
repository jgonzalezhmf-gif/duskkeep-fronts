import type { TranslationTree } from "../dictionaryTypes";

export const ptBRDictionary = {
    app: { title: "Duskkeep Fronts", alpha: "Versão alfa" },
    nav: { home: "Início", base: "Base", adventure: "Aventura", pve: "PvE", deck: "Deck", cards: "Cartas", fortress: "Fortaleza", core: "Núcleo", arena: "Arena", pvp: "PvP", market: "Mercado", shop: "Loja" },
    options: { button: "Opções", title: "Opções", subtitle: "Ajuste idioma, áudio e conforto.", language: "Idioma", languageHint: "O texto da interface muda imediatamente. A migração completa será gradual.", audio: "Áudio", music: "Música", effects: "Efeitos", muted: "Silenciado", live: "Ativo", comfort: "Conforto", reducedMotion: "Reduzir movimento", visualEffects: "Efeitos visuais", textScale: "Tamanho do texto", normal: "Normal", large: "Grande", current: "Atual", close: "Fechar" },
    audio: { mixer: "Mix de áudio", mixerSubtitle: "Música e efeitos", unmute: "Ativar som", audioMixer: "Mixer de áudio", soundOff: "Som desligado", openMixer: "Abrir mixer de áudio" },
    common: { return: "Voltar", home: "Início" },
  } as const satisfies TranslationTree;
