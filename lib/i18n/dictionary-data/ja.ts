import type { TranslationTree } from "../dictionaryTypes";

export const jaDictionary = {
    app: { title: "Duskkeep Fronts", alpha: "アルファ版" },
    nav: { home: "ホーム", base: "拠点", adventure: "冒険", pve: "PvE", deck: "デッキ", cards: "カード", fortress: "要塞", core: "コア", arena: "アリーナ", pvp: "PvP", market: "市場", shop: "ショップ" },
    options: { button: "設定", title: "設定", subtitle: "言語、音量、快適性を調整します。", language: "言語", languageHint: "UIテキストはすぐに更新されます。全コンテンツの移行は段階的に行います。", audio: "オーディオ", music: "音楽", effects: "効果音", muted: "ミュート", live: "オン", comfort: "快適性", reducedMotion: "モーション軽減", visualEffects: "視覚効果", textScale: "文字サイズ", normal: "標準", large: "大", current: "現在", close: "閉じる" },
    audio: { mixer: "音量ミックス", mixerSubtitle: "音楽と効果音", unmute: "ミュート解除", audioMixer: "オーディオミキサー", soundOff: "サウンドオフ", openMixer: "ミキサーを開く" },
    common: { return: "戻る", home: "ホーム" },
  } as const satisfies TranslationTree;
