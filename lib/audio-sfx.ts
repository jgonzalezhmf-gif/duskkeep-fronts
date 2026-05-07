"use client";

import type { AudioScoreEvent, AudioStingerName } from "@/lib/audio-score";
import type { AudioSfxAssetName } from "@/lib/audioAssets";
import { nextVariant, type FigureOptions } from "@/lib/audio-runtime";

type SfxAudioRuntime = {
  playSfxAsset(name: AudioSfxAssetName, fallback?: () => void): boolean;
  playFigure(events: AudioScoreEvent[], options: FigureOptions): void;
  playStinger(name: AudioStingerName): void;
  vibrate(pattern: number | number[]): void;
};

export function createSfxController(runtime: SfxAudioRuntime) {
  const playSfx = (name: AudioSfxAssetName, fallback: () => void) => {
    if (!runtime.playSfxAsset(name, fallback)) fallback();
  };

  const sfx = {
    tap: () => {
      playSfx("ui_click", () => {
        const variant = nextVariant("tap", 3);
        const figures: AudioScoreEvent[][] = [
          [
            { beat: 0, len: 0.16, instrument: "mallet", notes: [84], velocity: 0.14, pan: -0.06, send: 0.1 },
            { beat: 0.06, len: 0.12, instrument: "sparkle", notes: [91], velocity: 0.08, pan: 0.08, send: 0.2 },
          ],
          [
            { beat: 0, len: 0.16, instrument: "pluck", notes: [81], velocity: 0.16, pan: -0.04, send: 0.08 },
            { beat: 0.08, len: 0.14, instrument: "bell", notes: [88], velocity: 0.08, pan: 0.1, send: 0.2 },
          ],
          [
            { beat: 0, len: 0.14, instrument: "mallet", notes: [79], velocity: 0.14, pan: 0.02, send: 0.1 },
            { beat: 0.05, len: 0.14, instrument: "sparkle", notes: [86], velocity: 0.08, pan: -0.08, send: 0.18 },
          ],
        ];
        runtime.playFigure(figures[variant], { bus: "sfx", tempo: 184 });
      });
    },
    hover: () => {
      playSfx("ui_hover", () => {
        const variant = nextVariant("hover", 3);
        const figures: AudioScoreEvent[][] = [
          [
            { beat: 0, len: 0.16, instrument: "bell", notes: [88], velocity: 0.09, pan: 0.06, send: 0.34 },
            { beat: 0.08, len: 0.16, instrument: "sparkle", notes: [95], velocity: 0.06, pan: -0.04, send: 0.44 },
          ],
          [
            { beat: 0, len: 0.14, instrument: "mallet", notes: [84], velocity: 0.08, pan: -0.04, send: 0.22 },
            { beat: 0.1, len: 0.15, instrument: "sparkle", notes: [91], velocity: 0.06, pan: 0.06, send: 0.4 },
          ],
          [
            { beat: 0, len: 0.18, instrument: "bell", notes: [91], velocity: 0.08, pan: 0.04, send: 0.34 },
            { beat: 0.12, len: 0.14, instrument: "sparkle", notes: [98], velocity: 0.05, pan: -0.06, send: 0.42 },
          ],
        ];
        runtime.playFigure(figures[variant], { bus: "sfx", tempo: 168 });
      });
    },
    move: () => {
      const variant = nextVariant("move", 2);
      const figures: AudioScoreEvent[][] = [
        [
          { beat: 0, len: 0.18, instrument: "hat", velocity: 0.12, pan: -0.1 },
          { beat: 0, len: 0.24, instrument: "pluck", notes: [69], velocity: 0.16, pan: -0.08, send: 0.14 },
          { beat: 0.14, len: 0.16, instrument: "sparkle", notes: [76], velocity: 0.1, pan: 0.08, send: 0.24 },
        ],
        [
          { beat: 0, len: 0.16, instrument: "hat", velocity: 0.12, pan: 0.1 },
          { beat: 0, len: 0.2, instrument: "mallet", notes: [72], velocity: 0.14, pan: -0.06, send: 0.14 },
          { beat: 0.12, len: 0.18, instrument: "bell", notes: [79], velocity: 0.08, pan: 0.08, send: 0.28 },
        ],
      ];
      runtime.playFigure(figures[variant], { bus: "sfx", tempo: 142, duck: 0.06 });
    },
    attack: () => {
      runtime.vibrate(12);
      playSfx("attack", () => {
        const variant = nextVariant("attack", 3);
        const figures: AudioScoreEvent[][] = [
          [
            { beat: 0, len: 0.22, instrument: "impact", velocity: 0.76, pan: -0.12 },
            { beat: 0.04, len: 0.18, instrument: "snare", velocity: 0.24, pan: 0.1 },
            { beat: 0.08, len: 0.26, instrument: "brass", notes: [50, 57], velocity: 0.14, pan: 0.12, send: 0.06 },
          ],
          [
            { beat: 0, len: 0.24, instrument: "impact", velocity: 0.72, pan: 0.08 },
            { beat: 0.02, len: 0.14, instrument: "tom", velocity: 0.22, pan: -0.06 },
            { beat: 0.08, len: 0.22, instrument: "lead", notes: [57], velocity: 0.1, pan: 0.12, send: 0.08 },
          ],
          [
            { beat: 0, len: 0.2, instrument: "impact", velocity: 0.7, pan: -0.08 },
            { beat: 0.05, len: 0.14, instrument: "snare", velocity: 0.22, pan: 0.08 },
            { beat: 0.1, len: 0.24, instrument: "brass", notes: [55, 62], velocity: 0.12, pan: -0.04, send: 0.06 },
          ],
        ];
        runtime.playFigure(figures[variant], { bus: "sfx", tempo: 150, duck: 0.16 });
      });
    },
    hit: () => {
      runtime.vibrate(20);
      playSfx("hit", () => {
        const variant = nextVariant("hit", 2);
        const figures: AudioScoreEvent[][] = [
          [
            { beat: 0, len: 0.2, instrument: "impact", velocity: 0.56, pan: -0.04 },
            { beat: 0.05, len: 0.14, instrument: "snare", velocity: 0.18, pan: 0.08 },
          ],
          [
            { beat: 0, len: 0.18, instrument: "impact", velocity: 0.54, pan: 0.04 },
            { beat: 0.04, len: 0.14, instrument: "tom", velocity: 0.16, pan: -0.08 },
          ],
        ];
        runtime.playFigure(figures[variant], { bus: "sfx", tempo: 132, duck: 0.12 });
      });
    },
    heal: () =>
      playSfx("heal", () =>
        runtime.playFigure(
          [
            { beat: 0, len: 0.36, instrument: "bell", notes: [79], velocity: 0.16, send: 0.48 },
            { beat: 0.18, len: 0.38, instrument: "mallet", notes: [83], velocity: 0.14, send: 0.34 },
            { beat: 0.36, len: 0.42, instrument: "bell", notes: [86], velocity: 0.16, send: 0.56 },
            { beat: 0.54, len: 0.44, instrument: "sparkle", notes: [91], velocity: 0.1, send: 0.7 },
          ],
          { bus: "sfx", tempo: 116, duck: 0.1 },
        )),
    shield: () =>
      playSfx("shield", () =>
        runtime.playFigure(
          [
            { beat: 0, len: 0.16, instrument: "impact", velocity: 0.22, pan: -0.08 },
            { beat: 0.04, len: 0.28, instrument: "pulse", notes: [60, 67], velocity: 0.12, send: 0.16 },
            { beat: 0.1, len: 0.46, instrument: "lead", notes: [72], velocity: 0.08, pan: -0.04, send: 0.1 },
            { beat: 0.12, len: 0.48, instrument: "bell", notes: [79], velocity: 0.1, pan: 0.1, send: 0.38 },
          ],
          { bus: "sfx", tempo: 122, duck: 0.08 },
        )),
    ability: () =>
      playSfx("card_play", () =>
        runtime.playFigure(
          [
            { beat: 0, len: 0.22, instrument: "sparkle", notes: [76], velocity: 0.14, pan: -0.1, send: 0.7 },
            { beat: 0.08, len: 0.34, instrument: "lead", notes: [71], velocity: 0.12, pan: 0.04, send: 0.18 },
            { beat: 0.16, len: 0.44, instrument: "brass", notes: [64, 71], velocity: 0.16, pan: 0.06, send: 0.2 },
            { beat: 0.46, len: 0.38, instrument: "bell", notes: [88], velocity: 0.1, pan: 0.12, send: 0.64 },
          ],
          { bus: "sfx", tempo: 128, duck: 0.12 },
        )),
    victory: () => {
      runtime.vibrate([40, 40, 80]);
      runtime.playStinger("victory");
    },
    defeat: () => {
      runtime.vibrate([24, 40, 80]);
      runtime.playStinger("defeat");
    },
    claim: () => {
      runtime.vibrate(18);
      playSfx("claim", () => {
        runtime.playFigure(
          [
            { beat: 0, len: 0.18, instrument: "mallet", notes: [83], velocity: 0.16, send: 0.24 },
            { beat: 0.14, len: 0.2, instrument: "bell", notes: [90], velocity: 0.16, send: 0.42 },
            { beat: 0.28, len: 0.24, instrument: "bell", notes: [95], velocity: 0.16, send: 0.48 },
            { beat: 0.42, len: 0.18, instrument: "sparkle", notes: [100], velocity: 0.08, send: 0.72 },
          ],
          { bus: "sfx", tempo: 136, duck: 0.1 },
        );
      });
    },
    levelUp: () => {
      runtime.vibrate([30, 30, 60]);
      playSfx("level_up", () => {
        runtime.playFigure(
          [
            { beat: 0, len: 0.2, instrument: "bell", notes: [72], velocity: 0.18, send: 0.42 },
            { beat: 0.18, len: 0.22, instrument: "bell", notes: [76], velocity: 0.18, send: 0.44 },
            { beat: 0.36, len: 0.26, instrument: "bell", notes: [79], velocity: 0.2, send: 0.5 },
            { beat: 0.54, len: 0.5, instrument: "choir", notes: [84, 88], velocity: 0.12, send: 0.72 },
          ],
          { bus: "sfx", tempo: 126, duck: 0.16 },
        );
      });
    },
    error: () =>
      playSfx("ui_error", () =>
        runtime.playFigure(
          [
            { beat: 0, len: 0.26, instrument: "lead", notes: [62], velocity: 0.12, send: 0.08 },
            { beat: 0.18, len: 0.28, instrument: "brass", notes: [58], velocity: 0.1, send: 0.1 },
            { beat: 0.34, len: 0.18, instrument: "impact", velocity: 0.18 },
          ],
          { bus: "sfx", tempo: 108, duck: 0.06 },
        )),
    purchase: () => {
      runtime.vibrate(14);
      playSfx("purchase", () => {
        runtime.playFigure(
          [
            { beat: 0, len: 0.16, instrument: "mallet", notes: [76], velocity: 0.16, send: 0.18 },
            { beat: 0.1, len: 0.18, instrument: "pluck", notes: [81], velocity: 0.14, send: 0.14 },
            { beat: 0.22, len: 0.22, instrument: "bell", notes: [88], velocity: 0.14, send: 0.38 },
            { beat: 0.38, len: 0.24, instrument: "sparkle", notes: [95], velocity: 0.08, send: 0.72 },
          ],
          { bus: "sfx", tempo: 142, duck: 0.12 },
        );
      });
    },
    unlock: () => {
      runtime.vibrate([30, 40, 30]);
      playSfx("unlock", () => {
        runtime.playFigure(
          [
            { beat: 0, len: 0.22, instrument: "bell", notes: [74], velocity: 0.18, send: 0.42 },
            { beat: 0.18, len: 0.24, instrument: "bell", notes: [79], velocity: 0.18, send: 0.46 },
            { beat: 0.38, len: 0.26, instrument: "bell", notes: [83], velocity: 0.18, send: 0.5 },
            { beat: 0.62, len: 0.7, instrument: "brass", notes: [86, 91], velocity: 0.16, send: 0.2 },
          ],
          { bus: "sfx", tempo: 124, duck: 0.18 },
        );
      });
    },
    death: () => playSfx("death", () => sfx.hit()),
    deathMonster: () => playSfx("death_monster", () => sfx.death()),
    deathHumanMale: () => playSfx("death_human_male", () => sfx.death()),
    deathHumanFemale: () => playSfx("death_human_female", () => sfx.death()),
    breach: () => playSfx("breach", () => sfx.hit()),
    summon: () => playSfx("summon", () => sfx.ability()),
    leaderPower: () => playSfx("leader_power", () => sfx.ability()),
    coreDamage: () => playSfx("core_damage", () => sfx.breach()),
    resolveClash: () => playSfx("resolve_clash", () => sfx.attack()),
    turnStart: () => playSfx("turn_start", () => sfx.tap()),
    cardOrder: () => playSfx("card_order", () => sfx.ability()),
    cardTactic: () => playSfx("card_tactic", () => sfx.ability()),
    cardSummon: () => playSfx("card_summon", () => sfx.summon()),
    poison: () => playSfx("poison", () => sfx.hit()),
    burn: () => playSfx("burn", () => sfx.hit()),
    stun: () => playSfx("stun", () => sfx.hit()),
    guard: () => playSfx("guard", () => sfx.shield()),
    regen: () => playSfx("regen", () => sfx.heal()),
  };

  return sfx;
}

export type SfxController = ReturnType<typeof createSfxController>;
