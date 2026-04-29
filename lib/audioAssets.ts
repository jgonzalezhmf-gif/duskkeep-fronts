"use client";

export type AudioSfxAssetName =
  | "ui_click"
  | "ui_hover"
  | "ui_error"
  | "card_play"
  | "attack"
  | "hit"
  | "death"
  | "death_monster"
  | "death_human_male"
  | "death_human_female"
  | "heal"
  | "shield"
  | "breach"
  | "summon"
  | "leader_power"
  | "core_damage"
  | "resolve_clash"
  | "turn_start"
  | "card_order"
  | "card_tactic"
  | "card_summon"
  | "poison"
  | "burn"
  | "stun"
  | "guard"
  | "regen"
  | "purchase"
  | "claim"
  | "level_up"
  | "unlock"
  | "victory"
  | "defeat";

export type AudioMusicAssetName =
  | "home"
  | "adventure"
  | "battle"
  | "battle_boss"
  | "battle_event"
  | "prebattle"
  | "postbattle"
  | "shop"
  | "event"
  | "victory"
  | "defeat";

export type RegisteredAudioAsset = {
  src: string;
  credit: "elevenlabs" | "internal" | "licensed";
  loop?: boolean;
  gain?: number;
};

type AudioAssetManifest<TName extends string> = Partial<Record<TName, RegisteredAudioAsset>>;

export const AUDIO_SFX_ASSETS: AudioAssetManifest<AudioSfxAssetName> = {
  attack: { src: "/assets/audio/sfx/attack.mp3", credit: "elevenlabs", gain: 0.48 },
  breach: { src: "/assets/audio/sfx/breach.mp3", credit: "elevenlabs", gain: 0.68 },
  card_play: { src: "/assets/audio/sfx/card_play.mp3", credit: "elevenlabs", gain: 0.42 },
  claim: { src: "/assets/audio/sfx/claim.mp3", credit: "elevenlabs", gain: 0.86 },
  death: { src: "/assets/audio/sfx/death.mp3", credit: "elevenlabs", gain: 0.9 },
  death_human_female: { src: "/assets/audio/sfx/death_human_female.mp3", credit: "elevenlabs", gain: 0.84 },
  death_human_male: { src: "/assets/audio/sfx/death_human_male.mp3", credit: "elevenlabs", gain: 0.84 },
  death_monster: { src: "/assets/audio/sfx/death_monster.mp3", credit: "elevenlabs", gain: 0.88 },
  defeat: { src: "/assets/audio/sfx/defeat.mp3", credit: "elevenlabs", gain: 1.04 },
  heal: { src: "/assets/audio/sfx/heal.mp3", credit: "elevenlabs", gain: 0.82 },
  hit: { src: "/assets/audio/sfx/hit.mp3", credit: "elevenlabs", gain: 0.62 },
  burn: { src: "/assets/audio/sfx/burn.mp3", credit: "elevenlabs", gain: 0.58 },
  card_order: { src: "/assets/audio/sfx/card_order.mp3", credit: "elevenlabs", gain: 0.48 },
  card_summon: { src: "/assets/audio/sfx/card_summon.mp3", credit: "elevenlabs", gain: 0.5 },
  card_tactic: { src: "/assets/audio/sfx/card_tactic.mp3", credit: "elevenlabs", gain: 0.46 },
  core_damage: { src: "/assets/audio/sfx/core_damage.mp3", credit: "elevenlabs", gain: 0.72 },
  guard: { src: "/assets/audio/sfx/guard.mp3", credit: "elevenlabs", gain: 0.58 },
  leader_power: { src: "/assets/audio/sfx/leader_power.mp3", credit: "elevenlabs", gain: 0.62 },
  poison: { src: "/assets/audio/sfx/poison.mp3", credit: "elevenlabs", gain: 0.54 },
  purchase: { src: "/assets/audio/sfx/purchase.mp3", credit: "elevenlabs", gain: 0.82 },
  regen: { src: "/assets/audio/sfx/regen.mp3", credit: "elevenlabs", gain: 0.58 },
  resolve_clash: { src: "/assets/audio/sfx/resolve_clash.mp3", credit: "elevenlabs", gain: 0.64 },
  shield: { src: "/assets/audio/sfx/shield.mp3", credit: "elevenlabs", gain: 0.86 },
  stun: { src: "/assets/audio/sfx/stun.mp3", credit: "elevenlabs", gain: 0.58 },
  summon: { src: "/assets/audio/sfx/summon.mp3", credit: "elevenlabs", gain: 0.62 },
  turn_start: { src: "/assets/audio/sfx/turn_start.mp3", credit: "elevenlabs", gain: 0.44 },
  ui_click: { src: "/assets/audio/sfx/ui_click.mp3", credit: "elevenlabs", gain: 0.72 },
  ui_error: { src: "/assets/audio/sfx/ui_error.mp3", credit: "elevenlabs", gain: 0.82 },
  ui_hover: { src: "/assets/audio/sfx/ui_hover.mp3", credit: "elevenlabs", gain: 0.54 },
  victory: { src: "/assets/audio/sfx/victory.mp3", credit: "elevenlabs", gain: 0.9 },
};

export const AUDIO_MUSIC_ASSETS: AudioAssetManifest<AudioMusicAssetName> = {
  adventure: { src: "/assets/audio/music/adventure.mp3", credit: "elevenlabs", loop: true, gain: 0.58 },
  battle: { src: "/assets/audio/music/battle.mp3", credit: "elevenlabs", loop: true, gain: 0.56 },
  battle_boss: { src: "/assets/audio/music/battle_boss.mp3", credit: "elevenlabs", loop: true, gain: 0.56 },
  battle_event: { src: "/assets/audio/music/battle_event.mp3", credit: "elevenlabs", loop: true, gain: 0.56 },
  event: { src: "/assets/audio/music/battle_event.mp3", credit: "elevenlabs", loop: true, gain: 0.54 },
  home: { src: "/assets/audio/music/home.mp3", credit: "elevenlabs", loop: true, gain: 0.54 },
  postbattle: { src: "/assets/audio/music/postbattle.mp3", credit: "elevenlabs", loop: true, gain: 0.54 },
  prebattle: { src: "/assets/audio/music/prebattle.mp3", credit: "elevenlabs", loop: true, gain: 0.54 },
  shop: { src: "/assets/audio/music/shop.mp3", credit: "elevenlabs", loop: true, gain: 0.56 },
};

export function getAudioSfxAsset(name: AudioSfxAssetName) {
  return AUDIO_SFX_ASSETS[name] ?? null;
}

export function getAudioMusicAsset(name: AudioMusicAssetName) {
  return AUDIO_MUSIC_ASSETS[name] ?? null;
}
