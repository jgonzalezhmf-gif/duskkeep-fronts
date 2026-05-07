import type { TranslationTree } from "../dictionaryTypes";

export const zhCNDictionary = {
    app: { title: "Duskkeep Fronts", alpha: "Alpha 版本" },
    nav: { home: "主页", base: "基地", adventure: "冒险", pve: "PvE", deck: "卡组", cards: "卡牌", fortress: "要塞", core: "核心", arena: "竞技场", pvp: "PvP", market: "市场", shop: "商店" },
    options: { button: "选项", title: "选项", subtitle: "调整语言、音频和舒适度。", language: "语言", languageHint: "界面文字会立即更新。完整内容迁移将逐步完成。", audio: "音频", music: "音乐", effects: "音效", muted: "静音", live: "开启", comfort: "舒适度", reducedMotion: "减少动画", visualEffects: "视觉效果", textScale: "文字大小", normal: "普通", large: "大", current: "当前", close: "关闭" },
    audio: { mixer: "音频混合", mixerSubtitle: "音乐和音效", unmute: "取消静音", audioMixer: "音频混合器", soundOff: "声音关闭", openMixer: "打开音频混合器" },
    common: { return: "返回", home: "主页" },
  } as const satisfies TranslationTree;
