"use client";

import {
  STINGER_SCORES,
  THEME_SCORES,
  type AudioInstrument,
  type AudioScoreBar,
  type AudioScoreEvent,
  type AudioStingerName,
  type AudioThemeName,
} from "@/lib/audio-score";
import {
  getAudioMusicAsset,
  getAudioSfxAsset,
  type AudioSfxAssetName,
} from "@/lib/audioAssets";
import {
  disposeMusicElement,
  fadeHtmlAudio,
  registerMusicElement,
  stopUntrackedMusicElements,
} from "@/lib/audio-music-assets";
import { createSfxController } from "@/lib/audio-sfx";
import {
  STORAGE_KEYS,
  THEME_MIX,
  clamp01,
  midiToFrequency,
  readStoredMuted,
  readStoredNumber,
  type AudioGraph,
  type FigureOptions,
  type MusicAssetChannel,
  type ThemeChannel,
  type ThemeName,
} from "@/lib/audio-runtime";

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private themeGain: GainNode | null = null;
  private musicDuckGain: GainNode | null = null;
  private stingerGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicVerbIn: GainNode | null = null;
  private musicDelayIn: GainNode | null = null;
  private sfxVerbIn: GainNode | null = null;
  private musicVerbNode: ConvolverNode | null = null;
  private musicDelayNode: DelayNode | null = null;
  private musicDelayFeedback: GainNode | null = null;
  private musicDelayFilter: BiquadFilterNode | null = null;
  private sfxVerbNode: ConvolverNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted = false;
  private ready = false;
  private primed = false;
  private primingBound = false;
  private visibilityBound = false;
  private theme: ThemeName = null;
  private activeThemeChannel: ThemeChannel | null = null;
  private activeMusicAssetChannel: MusicAssetChannel | null = null;
  private sfxAssetBuffers = new Map<AudioSfxAssetName, Promise<AudioBuffer | null>>();
  private themeEntryCursor: Partial<Record<AudioThemeName, number>> = {};
  private musicVolume = 0.78;
  private sfxVolume = 0.92;

  init() {
    if (typeof window === "undefined" || this.ready) return;
    this.muted = readStoredMuted(this.muted);
    this.musicVolume = readStoredNumber(STORAGE_KEYS.music, this.musicVolume);
    this.sfxVolume = readStoredNumber(STORAGE_KEYS.sfx, this.sfxVolume);
    this.bindPriming();
    this.bindVisibility();
    this.ready = true;
  }

  private bindPriming() {
    if (typeof window === "undefined" || this.primingBound) return;
    const prime = () => {
      if (this.primed) return;
      this.primed = true;
      this.ensureGraph();
      this.refreshMix();
      if (!this.muted && this.theme) this.crossfadeTheme(this.theme);
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", prime);
    };
    window.addEventListener("pointerdown", prime, { passive: true });
    window.addEventListener("keydown", prime, { passive: true });
    this.primingBound = true;
  }

  private bindVisibility() {
    if (typeof document === "undefined" || this.visibilityBound) return;
    document.addEventListener("visibilitychange", () => {
      const graph = this.ensureGraph();
      if (!graph) return;
      const now = graph.ctx.currentTime;
      const visible = document.visibilityState === "visible";
      graph.masterGain.gain.cancelScheduledValues(now);
      graph.masterGain.gain.linearRampToValueAtTime(
        this.muted ? 0 : visible ? 1 : 0.55,
        now + (visible ? 0.24 : 0.12),
      );
      this.applyMusicAssetVolume(visible ? 0.18 : 0.08);
    });
    this.visibilityBound = true;
  }

  syncFromStore(input: { muted: boolean; musicVolume: number; sfxVolume: number }) {
    this.muted = input.muted;
    this.musicVolume = clamp01(input.musicVolume);
    this.sfxVolume = clamp01(input.sfxVolume);
    this.persistPrefs();
    this.refreshMix();
    if (this.muted) {
      this.crossfadeTheme(null);
      return;
    }
    if (this.theme) this.crossfadeTheme(this.theme);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.persistPrefs();
    this.refreshMix();
    if (muted) this.crossfadeTheme(null);
    else if (this.theme) this.crossfadeTheme(this.theme);
  }

  setMusicVolume(volume: number) {
    this.musicVolume = clamp01(volume);
    this.persistPrefs();
    this.refreshMix();
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = clamp01(volume);
    this.persistPrefs();
    this.refreshMix();
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  getSfxVolume() {
    return this.sfxVolume;
  }

  setTheme(theme: ThemeName) {
    if (this.theme === theme) {
      if (!theme || this.muted || !this.primed) return;
      if (this.activeMusicAssetChannel?.theme === theme) {
        this.applyMusicAssetVolume(0.18);
        return;
      }
      if (this.activeThemeChannel?.theme === theme) return;
    }
    this.theme = theme;
    this.crossfadeTheme(theme);
  }

  vibrate(pattern: number | number[]) {
    if (typeof navigator === "undefined") return;
    (navigator as unknown as { vibrate?: (p: number | number[]) => void }).vibrate?.(pattern);
  }

  private persistPrefs() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.muted, this.muted ? "1" : "0");
      window.localStorage.setItem(STORAGE_KEYS.music, String(this.musicVolume));
      window.localStorage.setItem(STORAGE_KEYS.sfx, String(this.sfxVolume));
    } catch {}
  }

  private ensureGraph(): AudioGraph | null {
    if (typeof window === "undefined") return null;
    const Ctor =
      // @ts-expect-error legacy webkit prefix
      window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;

    if (!this.ctx) {
      this.ctx = new Ctor();
    }

    if (
      !this.masterGain ||
      !this.musicGain ||
      !this.themeGain ||
      !this.musicDuckGain ||
      !this.stingerGain ||
      !this.sfxGain ||
      !this.musicVerbIn ||
      !this.musicDelayIn ||
      !this.sfxVerbIn ||
      !this.musicVerbNode ||
      !this.musicDelayNode ||
      !this.musicDelayFeedback ||
      !this.musicDelayFilter ||
      !this.sfxVerbNode
    ) {
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.themeGain = this.ctx.createGain();
      this.musicDuckGain = this.ctx.createGain();
      this.stingerGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicVerbIn = this.ctx.createGain();
      this.musicDelayIn = this.ctx.createGain();
      this.sfxVerbIn = this.ctx.createGain();
      this.musicVerbNode = this.ctx.createConvolver();
      this.musicDelayNode = this.ctx.createDelay(1.1);
      this.musicDelayFeedback = this.ctx.createGain();
      this.musicDelayFilter = this.ctx.createBiquadFilter();
      this.sfxVerbNode = this.ctx.createConvolver();

      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -20;
      compressor.knee.value = 24;
      compressor.ratio.value = 2.4;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.22;

      this.themeGain.connect(this.musicDuckGain);
      this.musicDuckGain.connect(this.musicGain);
      this.stingerGain.connect(this.musicGain);
      this.musicGain.connect(compressor);
      this.sfxGain.connect(compressor);
      compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.musicVerbNode.buffer = this.createImpulseBuffer(this.ctx, 2.6, 2.4);
      this.musicVerbIn.connect(this.musicVerbNode);
      this.musicVerbNode.connect(this.musicGain);

      this.musicDelayNode.delayTime.value = 0.375;
      this.musicDelayFeedback.gain.value = 0.22;
      this.musicDelayFilter.type = "lowpass";
      this.musicDelayFilter.frequency.value = 2400;
      this.musicDelayIn.connect(this.musicDelayNode);
      this.musicDelayNode.connect(this.musicDelayFeedback);
      this.musicDelayFeedback.connect(this.musicDelayFilter);
      this.musicDelayFilter.connect(this.musicDelayNode);
      this.musicDelayNode.connect(this.musicGain);

      this.sfxVerbNode.buffer = this.createImpulseBuffer(this.ctx, 0.72, 4.1);
      this.sfxVerbIn.connect(this.sfxVerbNode);
      this.sfxVerbNode.connect(this.sfxGain);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return {
      ctx: this.ctx,
      masterGain: this.masterGain,
      musicGain: this.musicGain,
      themeGain: this.themeGain,
      musicDuckGain: this.musicDuckGain,
      stingerGain: this.stingerGain,
      sfxGain: this.sfxGain,
      musicVerbIn: this.musicVerbIn,
      musicDelayIn: this.musicDelayIn,
      sfxVerbIn: this.sfxVerbIn,
    };
  }

  private refreshMix() {
    const graph = this.ensureGraph();
    if (!graph) return;
    const now = graph.ctx.currentTime;
    const visible = typeof document === "undefined" || document.visibilityState === "visible";
    graph.masterGain.gain.cancelScheduledValues(now);
    graph.masterGain.gain.setValueAtTime(this.muted ? 0 : visible ? 1 : 0.55, now);
    graph.musicGain.gain.cancelScheduledValues(now);
    graph.musicGain.gain.setValueAtTime(this.muted ? 0 : this.musicVolume, now);
    graph.stingerGain.gain.cancelScheduledValues(now);
    graph.stingerGain.gain.setValueAtTime(1, now);
    graph.sfxGain.gain.cancelScheduledValues(now);
    graph.sfxGain.gain.setValueAtTime(this.muted ? 0 : this.sfxVolume, now);
    graph.musicDuckGain.gain.cancelScheduledValues(now);
    graph.musicDuckGain.gain.setValueAtTime(1, now);
    this.applyMusicAssetVolume(0.12);
  }

  private getMusicAssetVolume(theme: AudioThemeName) {
    const visible = typeof document === "undefined" || document.visibilityState === "visible";
    const asset = getAudioMusicAsset(theme);
    return this.muted ? 0 : this.musicVolume * (asset?.gain ?? 1) * (visible ? 1 : 0.55);
  }

  private applyMusicAssetVolume(fadeSeconds = 0.12) {
    const channel = this.activeMusicAssetChannel;
    if (!channel) return;
    fadeHtmlAudio(channel, this.getMusicAssetVolume(channel.theme), fadeSeconds);
  }

  private stopActiveProceduralTheme(fadeSeconds = 0.45) {
    if (!this.activeThemeChannel) return;
    this.stopThemeChannel(this.activeThemeChannel, fadeSeconds);
    this.activeThemeChannel = null;
  }

  private stopMusicAssetChannel(fadeSeconds = 0.5) {
    const channel = this.activeMusicAssetChannel;
    if (!channel) return;
    this.activeMusicAssetChannel = null;
    if (fadeSeconds <= 0) {
      if (channel.timer !== null) {
        window.clearInterval(channel.timer);
        channel.timer = null;
      }
      channel.audio.pause();
      disposeMusicElement(channel.audio);
      return;
    }
    fadeHtmlAudio(channel, 0, fadeSeconds, () => {
      disposeMusicElement(channel.audio);
    });
  }

  private playMusicAsset(theme: AudioThemeName) {
    if (typeof window === "undefined" || !this.primed || this.muted) return false;
    const asset = getAudioMusicAsset(theme);
    if (!asset) return false;
    if (this.activeMusicAssetChannel?.theme === theme) {
      this.stopActiveProceduralTheme(0.22);
      stopUntrackedMusicElements(this.activeMusicAssetChannel.audio);
      this.applyMusicAssetVolume(0.18);
      return true;
    }
    if (this.activeMusicAssetChannel?.audio.currentSrc.endsWith(asset.src)) {
      this.stopActiveProceduralTheme(0.22);
      stopUntrackedMusicElements(this.activeMusicAssetChannel.audio);
      this.activeMusicAssetChannel.theme = theme;
      this.applyMusicAssetVolume(0.18);
      return true;
    }

    this.stopActiveProceduralTheme(0.22);
    this.stopMusicAssetChannel(0);
    stopUntrackedMusicElements();
    const audio = new Audio(asset.src);
    audio.loop = asset.loop ?? true;
    audio.preload = "auto";
    audio.volume = 0;
    const channel: MusicAssetChannel = { theme, audio, timer: null };
    this.activeMusicAssetChannel = channel;
    registerMusicElement(audio);
    audio.play().then(
      () => fadeHtmlAudio(channel, this.getMusicAssetVolume(theme), 0.75),
      () => {
        if (this.activeMusicAssetChannel === channel) this.activeMusicAssetChannel = null;
        disposeMusicElement(audio);
        this.crossfadeProceduralTheme(theme);
      },
    );
    return true;
  }

  private createImpulseBuffer(ctx: AudioContext, seconds: number, decay: number) {
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let index = 0; index < length; index += 1) {
        const envelope = Math.pow(1 - index / length, decay);
        data[index] = (Math.random() * 2 - 1) * envelope;
      }
    }
    return impulse;
  }

  private getNoiseBuffer(ctx: AudioContext) {
    if (this.noiseBuffer) return this.noiseBuffer;
    const length = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  private connectVoiceOutput(
    node: AudioNode,
    dryBus: AudioNode,
    fxBus: AudioNode | null,
    send = 0,
    extraDelaySend = 0,
  ) {
    const graph = this.ensureGraph();
    if (!graph || !this.ctx) return;
    node.connect(dryBus);

    if (fxBus && send > 0) {
      const wet = this.ctx.createGain();
      wet.gain.value = send;
      node.connect(wet);
      wet.connect(fxBus);
    }

    if (extraDelaySend > 0) {
      const wet = this.ctx.createGain();
      wet.gain.value = extraDelaySend;
      node.connect(wet);
      wet.connect(graph.musicDelayIn);
    }
  }

  private createPostNode(pan = 0): AudioNode {
    if (!this.ctx) {
      throw new Error("AudioContext not initialized");
    }
    const panner = (this.ctx as AudioContext & { createStereoPanner: () => StereoPannerNode }).createStereoPanner();
    panner.pan.value = pan;
    return panner;
  }

  private scheduleEnvelope(gain: GainNode, start: number, peak: number, attack: number, hold: number, release: number) {
    gain.gain.cancelScheduledValues(start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(Math.max(0.0001, peak), start + attack);
    gain.gain.setValueAtTime(Math.max(0.0001, peak), start + attack + hold);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + hold + release);
  }

  private scheduleOscillator(
    target: AudioNode,
    frequency: number,
    type: OscillatorType,
    start: number,
    stop: number,
    detune = 0,
    glideTo?: number,
  ) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, frequency), start);
    osc.detune.setValueAtTime(detune, start);
    if (glideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, glideTo), stop);
    }
    osc.connect(target);
    osc.start(start);
    osc.stop(stop);
  }

  private scheduleNoise(
    target: AudioNode,
    start: number,
    stop: number,
    type: BiquadFilterType,
    frequency: number,
    q: number,
  ) {
    if (!this.ctx) return;
    const source = this.ctx.createBufferSource();
    source.buffer = this.getNoiseBuffer(this.ctx);
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(frequency, start);
    filter.Q.value = q;
    source.connect(filter).connect(target);
    source.start(start);
    source.stop(stop);
  }

  private scheduleTonalVoice(
    notes: number[],
    instrument: AudioInstrument,
    start: number,
    duration: number,
    velocity: number,
    dryBus: AudioNode,
    fxBus: AudioNode | null,
    pan = 0,
    send = 0,
    glideTo?: number,
  ) {
    if (!this.ctx || !notes.length) return;

    const mix = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();
    const post = this.createPostNode(pan);

    mix.connect(filter);
    filter.connect(env);
    env.connect(post);
    const delaySend =
      instrument === "sparkle"
        ? send * 0.5
        : instrument === "lead"
          ? send * 0.22
          : instrument === "brass"
            ? send * 0.18
            : instrument === "bell"
              ? send * 0.12
              : 0;
    this.connectVoiceOutput(post, dryBus, fxBus, send, delaySend);

    switch (instrument) {
      case "pad": {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1800, start);
        filter.frequency.linearRampToValueAtTime(760, start + duration * 0.74);
        filter.Q.value = 0.82;
        this.scheduleEnvelope(env, start, velocity * 0.16, 0.22, duration * 0.62, 1.48);
        notes.forEach((note, index) => {
          const freq = midiToFrequency(note);
          const spread = (index - (notes.length - 1) / 2) * 4;
          this.scheduleOscillator(mix, freq, "triangle", start, start + duration + 1.6, spread);
          this.scheduleOscillator(mix, freq * 0.5, "sine", start, start + duration + 1.8, -spread * 0.5);
          this.scheduleOscillator(mix, freq * 2, "sine", start, start + duration + 1.4, -spread * 0.8);
          this.scheduleOscillator(mix, freq * 1.01, "sawtooth", start, start + duration + 1.12, spread * 0.3);
        });
        break;
      }
      case "choir": {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1280, start);
        filter.frequency.linearRampToValueAtTime(860, start + duration * 0.82);
        this.scheduleEnvelope(env, start, velocity * 0.12, 0.32, duration * 0.54, 1.62);
        notes.forEach((note, index) => {
          const freq = midiToFrequency(note);
          const spread = (index - (notes.length - 1) / 2) * 6;
          this.scheduleOscillator(mix, freq, "triangle", start, start + duration + 1.8, spread);
          this.scheduleOscillator(mix, freq * 0.5, "sine", start, start + duration + 1.6, -spread * 0.5);
          this.scheduleOscillator(mix, freq * 1.5, "sine", start, start + duration + 1.24, spread * 0.2);
          this.scheduleOscillator(mix, freq * 2.01, "triangle", start, start + duration + 0.9, -spread * 0.16);
        });
        break;
      }
      case "bell": {
        filter.type = "highpass";
        filter.frequency.setValueAtTime(420, start);
        this.scheduleEnvelope(env, start, velocity * 0.16, 0.01, duration * 0.08, duration * 1.85);
        notes.forEach((note) => {
          const freq = midiToFrequency(note);
          this.scheduleOscillator(mix, freq, "sine", start, start + duration * 2.2);
          this.scheduleOscillator(mix, freq * 2.01, "sine", start, start + duration * 1.85);
          this.scheduleOscillator(mix, freq * 3.12, "sine", start, start + duration * 1.45);
          this.scheduleOscillator(mix, freq * 4.24, "sine", start, start + duration * 1.1);
        });
        break;
      }
      case "mallet": {
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1650, start);
        filter.Q.value = 1.35;
        this.scheduleEnvelope(env, start, velocity * 0.16, 0.004, duration * 0.06, duration * 1.15);
        notes.forEach((note, index) => {
          const freq = midiToFrequency(note);
          const spread = (index - (notes.length - 1) / 2) * 4;
          this.scheduleOscillator(mix, freq, "triangle", start, start + duration + 0.7, spread);
          this.scheduleOscillator(mix, freq * 3, "sine", start, start + duration + 0.45, -spread * 0.5);
          this.scheduleOscillator(mix, freq * 4.8, "sine", start, start + duration + 0.24, spread * 0.4);
        });
        break;
      }
      case "pluck":
      case "sparkle": {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(instrument === "sparkle" ? 3600 : 2800, start);
        filter.frequency.exponentialRampToValueAtTime(700, start + duration * 0.9);
        this.scheduleEnvelope(env, start, velocity * (instrument === "sparkle" ? 0.15 : 0.18), 0.006, duration * 0.1, duration * 0.85);
        notes.forEach((note, index) => {
          const freq = midiToFrequency(note);
          const spread = (index - (notes.length - 1) / 2) * 4;
          this.scheduleOscillator(mix, freq, "triangle", start, start + duration + 0.6, spread);
          this.scheduleOscillator(mix, freq * 2, "square", start, start + duration + 0.4, -spread);
        });
        break;
      }
      case "string": {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2400, start);
        filter.frequency.linearRampToValueAtTime(980, start + duration * 0.9);
        filter.Q.value = 1.3;
        this.scheduleEnvelope(env, start, velocity * 0.15, 0.12, duration * 0.58, 0.95);
        notes.forEach((note, index) => {
          const freq = midiToFrequency(note);
          const spread = (index - (notes.length - 1) / 2) * 5;
          this.scheduleOscillator(mix, freq, "sawtooth", start, start + duration + 1.1, spread);
          this.scheduleOscillator(mix, freq * 0.5, "triangle", start, start + duration + 0.9, -spread * 0.4);
          this.scheduleOscillator(mix, freq * 2, "triangle", start, start + duration + 0.78, spread * 0.3);
        });
        break;
      }
      case "bass": {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(560, start);
        filter.frequency.exponentialRampToValueAtTime(280, start + duration * 0.8);
        this.scheduleEnvelope(env, start, velocity * 0.22, 0.01, duration * 0.5, Math.max(0.18, duration * 0.4));
        notes.forEach((note) => {
          const freq = midiToFrequency(note);
          this.scheduleOscillator(mix, freq, "triangle", start, start + duration + 0.35, 0, glideTo ? midiToFrequency(glideTo) : undefined);
          this.scheduleOscillator(mix, freq * 0.5, "square", start, start + duration + 0.28, -8);
        });
        break;
      }
      case "pulse": {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2200, start);
        filter.frequency.exponentialRampToValueAtTime(850, start + duration * 0.6);
        this.scheduleEnvelope(env, start, velocity * 0.12, 0.012, duration * 0.12, duration * 0.52);
        notes.forEach((note, index) => {
          const freq = midiToFrequency(note);
          const spread = (index - (notes.length - 1) / 2) * 5;
          this.scheduleOscillator(mix, freq, "sawtooth", start, start + duration + 0.3, spread);
          this.scheduleOscillator(mix, freq * 0.5, "triangle", start, start + duration + 0.26, -spread * 0.4);
        });
        break;
      }
      case "lead": {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2800, start);
        filter.frequency.exponentialRampToValueAtTime(940, start + duration * 0.82);
        filter.Q.value = 2.8;
        this.scheduleEnvelope(env, start, velocity * 0.16, 0.02, duration * 0.34, duration * 0.66);
        notes.forEach((note, index) => {
          const freq = midiToFrequency(note);
          const spread = (index - (notes.length - 1) / 2) * 6;
          this.scheduleOscillator(mix, freq, "triangle", start, start + duration + 0.5, spread, glideTo ? midiToFrequency(glideTo) : undefined);
          this.scheduleOscillator(mix, freq * 1.01, "sawtooth", start, start + duration + 0.42, -spread * 0.26);
          this.scheduleOscillator(mix, freq * 0.5, "sine", start, start + duration + 0.44, spread * 0.18);
          this.scheduleOscillator(mix, freq * 2, "sine", start, start + duration + 0.24, -spread * 0.4);
        });
        break;
      }
      case "brass": {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2400, start);
        filter.frequency.exponentialRampToValueAtTime(920, start + duration * 0.8);
        filter.Q.value = 2.2;
        this.scheduleEnvelope(env, start, velocity * 0.2, 0.018, duration * 0.26, duration * 0.8);
        notes.forEach((note, index) => {
          const freq = midiToFrequency(note);
          const spread = (index - (notes.length - 1) / 2) * 7;
          this.scheduleOscillator(mix, freq, "sawtooth", start, start + duration + 0.54, spread, glideTo ? midiToFrequency(glideTo) : undefined);
          this.scheduleOscillator(mix, freq * 1.01, "sawtooth", start, start + duration + 0.48, -spread * 0.32);
          this.scheduleOscillator(mix, freq * 0.5, "square", start, start + duration + 0.4, -spread * 0.36);
          this.scheduleOscillator(mix, freq * 1.5, "triangle", start, start + duration + 0.34, spread * 0.22);
        });
        break;
      }
      default:
        break;
    }
  }

  private schedulePercussion(
    instrument: AudioInstrument,
    start: number,
    duration: number,
    velocity: number,
    dryBus: AudioNode,
    fxBus: AudioNode | null,
    pan = 0,
  ) {
    if (!this.ctx) return;

    if (instrument === "kick") {
      const env = this.ctx.createGain();
      const post = this.createPostNode(pan);
      env.connect(post);
      this.connectVoiceOutput(post, dryBus, fxBus, 0.04);
      this.scheduleEnvelope(env, start, velocity * 0.36, 0.002, duration * 0.12, 0.24);
      this.scheduleOscillator(env, 108, "sine", start, start + 0.34, 0, 38);
      this.scheduleOscillator(env, 52, "triangle", start, start + 0.28, 0, 32);
      this.scheduleNoise(env, start, start + 0.03, "highpass", 2300, 0.7);
      return;
    }

    if (instrument === "snare") {
      const env = this.ctx.createGain();
      const post = this.createPostNode(pan);
      env.connect(post);
      this.connectVoiceOutput(post, dryBus, fxBus, 0.12);
      this.scheduleEnvelope(env, start, velocity * 0.24, 0.002, duration * 0.02, 0.18);
      this.scheduleNoise(env, start, start + 0.18, "bandpass", 1550, 0.84);
      this.scheduleNoise(env, start, start + 0.12, "highpass", 3600, 0.64);
      this.scheduleOscillator(env, 178, "triangle", start, start + 0.16, 0, 104);
      return;
    }

    if (instrument === "hat") {
      const env = this.ctx.createGain();
      const post = this.createPostNode(pan);
      env.connect(post);
      this.connectVoiceOutput(post, dryBus, fxBus, 0.06);
      this.scheduleEnvelope(env, start, velocity * 0.16, 0.001, duration * 0.01, 0.06);
      this.scheduleNoise(env, start, start + 0.08, "highpass", 6200, 0.7);
      return;
    }

    if (instrument === "tom") {
      const env = this.ctx.createGain();
      const post = this.createPostNode(pan);
      env.connect(post);
      this.connectVoiceOutput(post, dryBus, fxBus, 0.08);
      this.scheduleEnvelope(env, start, velocity * 0.22, 0.002, duration * 0.08, 0.18);
      this.scheduleOscillator(env, 136, "triangle", start, start + 0.24, 0, 78);
      return;
    }

    if (instrument === "impact") {
      const env = this.ctx.createGain();
      const post = this.createPostNode(pan);
      env.connect(post);
      this.connectVoiceOutput(post, dryBus, fxBus, 0.16);
      this.scheduleEnvelope(env, start, velocity * 0.34, 0.003, duration * 0.06, 0.38);
      this.scheduleOscillator(env, 70, "triangle", start, start + 0.38, 0, 38);
      this.scheduleOscillator(env, 44, "sine", start, start + 0.42, 0, 26);
      this.scheduleNoise(env, start, start + 0.16, "bandpass", 820, 1.15);
    }
  }

  private scheduleScoreEvent(
    event: AudioScoreEvent,
    start: number,
    beatDuration: number,
    dryBus: AudioNode,
    fxBus: AudioNode | null,
  ) {
    const absoluteStart = start + event.beat * beatDuration;
    const duration = Math.max(0.05, event.len * beatDuration);
    const velocity = event.velocity ?? 0.3;
    const pan = event.pan ?? 0;
    const send = event.send ?? 0;

    if (event.instrument === "kick" || event.instrument === "snare" || event.instrument === "hat" || event.instrument === "tom" || event.instrument === "impact") {
      this.schedulePercussion(event.instrument, absoluteStart, duration, velocity, dryBus, fxBus, pan);
      return;
    }

    this.scheduleTonalVoice(
      event.notes ?? [],
      event.instrument,
      absoluteStart,
      duration,
      velocity * (event.accent ?? 1),
      dryBus,
      fxBus,
      pan,
      send,
      event.glideTo,
    );
  }

  private scheduleBar(bar: AudioScoreBar, start: number, dryBus: AudioNode, fxBus: AudioNode | null) {
    const beatDuration = 60 / bar.tempo;
    for (const event of bar.events) {
      this.scheduleScoreEvent(event, start, beatDuration, dryBus, fxBus);
    }
    return beatDuration * bar.beats;
  }

  private createThemeChannel(theme: AudioThemeName) {
    const graph = this.ensureGraph();
    if (!graph || !this.primed || this.muted || !this.ctx) return null;
    const score = THEME_SCORES[theme];
    const profile = THEME_MIX[theme];
    const entryBars = score.entryBars?.length ? score.entryBars : [0];
    const entryCursor = this.themeEntryCursor[theme] ?? 0;
    const startBar = entryBars[entryCursor % entryBars.length] ?? 0;
    this.themeEntryCursor[theme] = entryCursor + 1;

    const dry = this.ctx.createGain();
    const fx = this.ctx.createGain();
    dry.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    fx.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    dry.connect(graph.themeGain);
    fx.connect(graph.musicVerbIn);
    fx.connect(graph.musicDelayIn);

    return {
      theme,
      profile,
      dry,
      fx,
      timer: null,
      bar: startBar,
      nextBarAt: this.ctx.currentTime + profile.preRoll,
      alive: true,
    } satisfies ThemeChannel;
  }

  private stopThemeChannel(channel: ThemeChannel, fadeSeconds = channel.profile.fadeOut) {
    const graph = this.ensureGraph();
    channel.alive = false;
    if (channel.timer !== null) {
      window.clearTimeout(channel.timer);
      channel.timer = null;
    }
    if (!graph) return;
    const now = graph.ctx.currentTime;
    channel.dry.gain.cancelScheduledValues(now);
    channel.fx.gain.cancelScheduledValues(now);
    channel.dry.gain.setValueAtTime(Math.max(0.0001, channel.dry.gain.value), now);
    channel.fx.gain.setValueAtTime(Math.max(0.0001, channel.fx.gain.value), now);
    channel.dry.gain.linearRampToValueAtTime(0.0001, now + fadeSeconds);
    channel.fx.gain.linearRampToValueAtTime(0.0001, now + fadeSeconds);
    window.setTimeout(() => {
      try {
        channel.dry.disconnect();
        channel.fx.disconnect();
      } catch {}
    }, Math.round((fadeSeconds + 0.12) * 1000));
  }

  private scheduleThemeBar(channel: ThemeChannel) {
    if (!channel.alive || this.muted || !this.primed || !this.ctx) return;
    const score = THEME_SCORES[channel.theme];
    const bar = score.bars[channel.bar];
    if (!bar) return;
    const start = Math.max(channel.nextBarAt, this.ctx.currentTime + 0.03);
    const duration = this.scheduleBar(bar, start, channel.dry, channel.fx);
    channel.nextBarAt = start + duration;
    const nextBar = channel.bar + 1;
    channel.bar = nextBar >= score.bars.length ? (score.loopFromBar ?? 0) : nextBar;
    const wait = Math.max(120, Math.round((channel.nextBarAt - this.ctx.currentTime - 0.16) * 1000));
    channel.timer = window.setTimeout(() => this.scheduleThemeBar(channel), wait);
  }

  private crossfadeTheme(theme: ThemeName) {
    if (typeof window === "undefined") return;
    if (!this.primed || this.muted) {
      this.stopActiveProceduralTheme(0.35);
      this.stopMusicAssetChannel(0.35);
      stopUntrackedMusicElements();
      return;
    }

    if (!theme) {
      this.stopActiveProceduralTheme(0.58);
      this.stopMusicAssetChannel(0.58);
      stopUntrackedMusicElements();
      return;
    }

    if (getAudioMusicAsset(theme)) {
      this.stopActiveProceduralTheme(0.45);
      if (this.playMusicAsset(theme)) return;
    } else {
      this.stopMusicAssetChannel(0.45);
      stopUntrackedMusicElements();
    }

    this.crossfadeProceduralTheme(theme);
  }

  private crossfadeProceduralTheme(theme: AudioThemeName) {
    if (this.activeThemeChannel?.theme === theme) return;

    const next = this.createThemeChannel(theme);
    const graph = this.ensureGraph();
    if (!next || !graph || !this.ctx) return;

    const previous = this.activeThemeChannel;
    this.activeThemeChannel = next;
    const now = this.ctx.currentTime;
    next.dry.gain.linearRampToValueAtTime(next.profile.dryLevel, now + next.profile.fadeIn);
    next.fx.gain.linearRampToValueAtTime(next.profile.fxLevel, now + next.profile.fadeIn + 0.12);
    if (previous) this.playThemeBridge(previous.theme, theme);
    this.scheduleThemeBar(next);

    if (previous) this.stopThemeChannel(previous, Math.max(previous.profile.fadeOut, next.profile.fadeOut));
  }

  private duckTheme(amount = 0.16, holdSeconds = 0.28) {
    const graph = this.ensureGraph();
    if (!graph || this.muted) return;
    const now = graph.ctx.currentTime;
    const target = Math.max(0.56, 1 - amount);
    const releaseAt = now + holdSeconds + 0.16;
    graph.musicDuckGain.gain.cancelScheduledValues(now);
    graph.musicDuckGain.gain.setValueAtTime(graph.musicDuckGain.gain.value || 1, now);
    graph.musicDuckGain.gain.linearRampToValueAtTime(target, now + 0.03);
    graph.musicDuckGain.gain.setValueAtTime(target, now + Math.max(0.08, holdSeconds * 0.45));
    graph.musicDuckGain.gain.linearRampToValueAtTime(1, releaseAt);
  }

  private playThemeBridge(from: AudioThemeName, to: AudioThemeName) {
    if (from === to) return;

    if (to === "battle") {
      this.playFigure(
        [
          { beat: 0, len: 0.28, instrument: "impact", velocity: 0.24, pan: -0.08, send: 0.12 },
          { beat: 0.08, len: 0.36, instrument: "string", notes: [55, 62], velocity: 0.1, send: 0.14 },
          { beat: 0.18, len: 0.48, instrument: "brass", notes: [57, 64, 69], velocity: 0.14, send: 0.1 },
        ],
        { bus: "music", tempo: 118, startDelay: 0.02 },
      );
      return;
    }

    if (from === "battle") {
      this.playFigure(
        [
          { beat: 0, len: 0.26, instrument: "bell", notes: [79], velocity: 0.1, send: 0.4 },
          { beat: 0.16, len: 0.56, instrument: "choir", notes: [74, 79, 83], velocity: 0.1, send: 0.52 },
          { beat: 0.44, len: 0.34, instrument: "sparkle", notes: [91], velocity: 0.08, send: 0.62 },
        ],
        { bus: "music", tempo: 108, startDelay: 0.02 },
      );
      return;
    }

    if (to === "shop") {
      this.playFigure(
        [
          { beat: 0, len: 0.18, instrument: "mallet", notes: [83], velocity: 0.09, send: 0.22 },
          { beat: 0.12, len: 0.18, instrument: "bell", notes: [88], velocity: 0.08, send: 0.34 },
          { beat: 0.28, len: 0.22, instrument: "sparkle", notes: [95], velocity: 0.06, send: 0.64 },
        ],
        { bus: "music", tempo: 122, startDelay: 0.02 },
      );
      return;
    }

    if (to === "home") {
      this.playFigure(
        [
          { beat: 0, len: 0.2, instrument: "bell", notes: [79], velocity: 0.08, send: 0.34 },
          { beat: 0.18, len: 0.36, instrument: "mallet", notes: [83], velocity: 0.08, send: 0.22 },
          { beat: 0.4, len: 0.42, instrument: "pad", notes: [74, 79], velocity: 0.05, send: 0.28 },
        ],
        { bus: "music", tempo: 102, startDelay: 0.02 },
      );
    }
  }

  playFigure(events: AudioScoreEvent[], options: FigureOptions) {
    const graph = this.ensureGraph();
    if (!graph || this.muted || !this.ctx) return;
    const tempo = options.tempo ?? 120;
    const start = this.ctx.currentTime + (options.startDelay ?? 0.02);
    const beatDuration = 60 / tempo;
    const dryBus = options.bus === "music" ? graph.stingerGain : graph.sfxGain;
    const fxBus = options.bus === "music" ? graph.musicVerbIn : graph.sfxVerbIn;

    for (const event of events) {
      this.scheduleScoreEvent(event, start, beatDuration, dryBus, fxBus);
    }

    if ((options.duck ?? 0) > 0) {
      const length = Math.max(...events.map((event) => event.beat + event.len), 0.4) * beatDuration;
      this.duckTheme(options.duck, Math.max(0.26, Math.min(1.2, length + 0.12)));
    }
  }

  playStinger(name: AudioStingerName) {
    if (this.playSfxAsset(name)) return;
    const graph = this.ensureGraph();
    if (!graph || this.muted || !this.ctx) return;
    const score = STINGER_SCORES[name];
    let cursor = this.ctx.currentTime + 0.03;
    let total = 0;
    for (const bar of score.bars) {
      const duration = this.scheduleBar(bar, cursor, graph.stingerGain, graph.musicVerbIn);
      cursor += duration;
      total += duration;
    }
    this.duckTheme(name === "victory" ? 0.48 : 0.54, Math.min(2.8, total + 0.35));
  }

  private loadSfxAsset(name: AudioSfxAssetName) {
    const existing = this.sfxAssetBuffers.get(name);
    if (existing) return existing;
    const asset = getAudioSfxAsset(name);
    if (!asset) return Promise.resolve(null);

    const pending = fetch(asset.src)
      .then((response) => {
        if (!response.ok) throw new Error(`Audio asset failed: ${asset.src}`);
        return response.arrayBuffer();
      })
      .then((buffer) => {
        const graph = this.ensureGraph();
        if (!graph) return null;
        return graph.ctx.decodeAudioData(buffer.slice(0));
      })
      .catch(() => null);

    this.sfxAssetBuffers.set(name, pending);
    return pending;
  }

  playSfxAsset(name: AudioSfxAssetName, fallback?: () => void) {
    const graph = this.ensureGraph();
    const asset = getAudioSfxAsset(name);
    if (!graph || !asset || this.muted || !this.ctx) return false;

    this.loadSfxAsset(name).then((buffer) => {
      if (!buffer) {
        fallback?.();
        return;
      }
      if (this.muted || !this.ctx || !this.sfxGain) return;
      const source = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      source.buffer = buffer;
      gain.gain.value = asset.gain ?? 1;
      source.connect(gain).connect(this.sfxGain);
      source.start();
    });
    return true;
  }
}

type DuskkeepAudioGlobal = typeof globalThis & {
  __duskkeepAudioManager?: AudioManager;
};

const audioGlobal = globalThis as DuskkeepAudioGlobal;
const mgr = audioGlobal.__duskkeepAudioManager ?? new AudioManager();
Object.setPrototypeOf(mgr, AudioManager.prototype);
audioGlobal.__duskkeepAudioManager = mgr;

if (typeof window !== "undefined") mgr.init();

export const audio = mgr;
export const sfx = createSfxController(mgr);
