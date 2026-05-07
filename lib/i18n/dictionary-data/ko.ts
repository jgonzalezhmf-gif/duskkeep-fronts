import type { TranslationTree } from "../dictionaryTypes";

export const koDictionary = {
    app: { title: "Duskkeep Fronts", alpha: "알파 빌드" },
    nav: { home: "홈", base: "기지", adventure: "모험", pve: "PvE", deck: "덱", cards: "카드", fortress: "요새", core: "코어", arena: "아레나", pvp: "PvP", market: "시장", shop: "상점" },
    options: { button: "옵션", title: "옵션", subtitle: "언어, 오디오, 편의 설정을 조정합니다.", language: "언어", languageHint: "UI 텍스트는 즉시 업데이트됩니다. 전체 콘텐츠 이전은 단계적으로 진행됩니다.", audio: "오디오", music: "음악", effects: "효과음", muted: "음소거", live: "활성", comfort: "편의", reducedMotion: "움직임 줄이기", visualEffects: "시각 효과", textScale: "글자 크기", normal: "보통", large: "크게", current: "현재", close: "닫기" },
    audio: { mixer: "오디오 믹스", mixerSubtitle: "음악 및 효과음", unmute: "음소거 해제", audioMixer: "오디오 믹서", soundOff: "소리 꺼짐", openMixer: "오디오 믹서 열기" },
    common: { return: "돌아가기", home: "홈" },
  } as const satisfies TranslationTree;
