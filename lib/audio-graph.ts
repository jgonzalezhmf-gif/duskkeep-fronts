"use client";

import type { AudioGraph } from "@/lib/audio-runtime";

function createNoiseSample(seed: number) {
  const nextSeed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return {
    seed: nextSeed,
    sample: (nextSeed / 2147483648 - 1),
  };
}

function createImpulseBuffer(ctx: AudioContext, seconds: number, decay: number) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  let seed = 0x9e3779b9;
  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let index = 0; index < length; index += 1) {
      const envelope = Math.pow(1 - index / length, decay);
      const next = createNoiseSample(seed);
      seed = next.seed;
      data[index] = next.sample * envelope;
    }
  }
  return impulse;
}

export function createAudioGraph(ctx: AudioContext): AudioGraph {
  const masterGain = ctx.createGain();
  const musicGain = ctx.createGain();
  const themeGain = ctx.createGain();
  const musicDuckGain = ctx.createGain();
  const stingerGain = ctx.createGain();
  const sfxGain = ctx.createGain();
  const musicVerbIn = ctx.createGain();
  const musicDelayIn = ctx.createGain();
  const sfxVerbIn = ctx.createGain();
  const musicVerbNode = ctx.createConvolver();
  const musicDelayNode = ctx.createDelay(1.1);
  const musicDelayFeedback = ctx.createGain();
  const musicDelayFilter = ctx.createBiquadFilter();
  const sfxVerbNode = ctx.createConvolver();

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -20;
  compressor.knee.value = 24;
  compressor.ratio.value = 2.4;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.22;

  themeGain.connect(musicDuckGain);
  musicDuckGain.connect(musicGain);
  stingerGain.connect(musicGain);
  musicGain.connect(compressor);
  sfxGain.connect(compressor);
  compressor.connect(masterGain);
  masterGain.connect(ctx.destination);

  musicVerbNode.buffer = createImpulseBuffer(ctx, 2.6, 2.4);
  musicVerbIn.connect(musicVerbNode);
  musicVerbNode.connect(musicGain);

  musicDelayNode.delayTime.value = 0.375;
  musicDelayFeedback.gain.value = 0.22;
  musicDelayFilter.type = "lowpass";
  musicDelayFilter.frequency.value = 2400;
  musicDelayIn.connect(musicDelayNode);
  musicDelayNode.connect(musicDelayFeedback);
  musicDelayFeedback.connect(musicDelayFilter);
  musicDelayFilter.connect(musicDelayNode);
  musicDelayNode.connect(musicGain);

  sfxVerbNode.buffer = createImpulseBuffer(ctx, 0.72, 4.1);
  sfxVerbIn.connect(sfxVerbNode);
  sfxVerbNode.connect(sfxGain);

  return {
    ctx,
    masterGain,
    musicGain,
    themeGain,
    musicDuckGain,
    stingerGain,
    sfxGain,
    musicVerbIn,
    musicDelayIn,
    sfxVerbIn,
  };
}
