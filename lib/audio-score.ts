"use client";

export type AudioThemeName =
  | "home"
  | "intro"
  | "battle"
  | "boss"
  | "adventure"
  | "event"
  | "shop"
  | "prebattle"
  | "postbattle";

export type AudioInstrument =
  | "pad"
  | "choir"
  | "string"
  | "lead"
  | "mallet"
  | "bell"
  | "pluck"
  | "bass"
  | "pulse"
  | "brass"
  | "sparkle"
  | "kick"
  | "snare"
  | "hat"
  | "tom"
  | "impact";

export type AudioScoreEvent = {
  beat: number;
  len: number;
  instrument: AudioInstrument;
  notes?: number[];
  velocity?: number;
  pan?: number;
  send?: number;
  accent?: number;
  glideTo?: number;
};

export type AudioScoreBar = {
  tempo: number;
  beats: number;
  events: AudioScoreEvent[];
};

export type AudioThemeScore = {
  bars: AudioScoreBar[];
  entryBars?: number[];
  loopFromBar?: number;
};

export type AudioStingerName = "victory" | "defeat";

export type AudioStingerScore = {
  bars: AudioScoreBar[];
};

type Harmony = {
  root: number;
  chord: number[];
  color?: number[];
};

type MelodyTone = number | null;

function major(root: number) {
  return [root, root + 4, root + 7];
}

function minor(root: number) {
  return [root, root + 3, root + 7];
}

function major9(root: number) {
  return [...major(root), root + 14];
}

function minor9(root: number) {
  return [...minor(root), root + 14];
}

function add6(root: number) {
  return [...major(root), root + 9];
}

function sus2(root: number) {
  return [root, root + 2, root + 7, root + 14];
}

function power(root: number) {
  return [root, root + 7, root + 12];
}

function push(events: AudioScoreEvent[], event: AudioScoreEvent) {
  events.push(event);
}

function addKickPattern(events: AudioScoreEvent[], beats: number[], velocity = 0.85) {
  for (const beat of beats) {
    push(events, { beat, len: 0.28, instrument: "kick", velocity, notes: [36] });
  }
}

function addSnarePattern(events: AudioScoreEvent[], beats: number[], velocity = 0.64) {
  for (const beat of beats) {
    push(events, { beat, len: 0.22, instrument: "snare", velocity, notes: [38] });
  }
}

function addHatPattern(events: AudioScoreEvent[], beats: number[], velocity = 0.22, panSpread = 0.16) {
  for (const beat of beats) {
    push(events, {
      beat,
      len: 0.08,
      instrument: "hat",
      velocity,
      notes: [72],
      pan: beat % 1 === 0 ? -panSpread : panSpread,
    });
  }
}

function addTomPattern(events: AudioScoreEvent[], beats: number[], velocity = 0.46) {
  for (const beat of beats) {
    push(events, { beat, len: 0.24, instrument: "tom", velocity, notes: [43] });
  }
}

function addImpact(events: AudioScoreEvent[], beat: number, velocity = 0.52) {
  push(events, { beat, len: 0.32, instrument: "impact", velocity, notes: [36] });
}

function addPad(events: AudioScoreEvent[], harmony: Harmony, velocity = 0.38, send = 0.56) {
  push(events, {
    beat: 0,
    len: 4,
    instrument: "pad",
    notes: harmony.chord,
    velocity,
    send,
  });
}

function addChoir(events: AudioScoreEvent[], harmony: Harmony, velocity = 0.16, send = 0.68) {
  push(events, {
    beat: 0,
    len: 4,
    instrument: "choir",
    notes: harmony.color ?? harmony.chord.map((note) => note + 12),
    velocity,
    send,
  });
}

function addStrings(
  events: AudioScoreEvent[],
  harmony: Harmony,
  velocity = 0.2,
  send = 0.42,
  beat = 0,
  len = 4,
) {
  push(events, {
    beat,
    len,
    instrument: "string",
    notes: (harmony.color ?? harmony.chord).map((note) => note + 12),
    velocity,
    send,
    pan: 0.04,
  });
}

function addBass(events: AudioScoreEvent[], harmony: Harmony, variant = 0, velocity = 0.56) {
  const root = harmony.root - 12;
  const patterns = [
    [
      { beat: 0, len: 1.05, note: root, vel: 1 },
      { beat: 1.5, len: 0.7, note: root + 7, vel: 0.84 },
      { beat: 2.25, len: 0.85, note: root + 12, vel: 0.92 },
      { beat: 3.25, len: 0.4, note: root + 7, vel: 0.7 },
    ],
    [
      { beat: 0, len: 0.85, note: root, vel: 1 },
      { beat: 1, len: 0.6, note: root + 7, vel: 0.86 },
      { beat: 2, len: 0.9, note: root + 12, vel: 0.9 },
      { beat: 3, len: 0.55, note: root, vel: 0.76 },
    ],
    [
      { beat: 0, len: 0.7, note: root, vel: 1 },
      { beat: 0.75, len: 0.55, note: root + 7, vel: 0.82 },
      { beat: 1.5, len: 0.55, note: root + 10, vel: 0.76 },
      { beat: 2.5, len: 0.8, note: root + 12, vel: 0.94 },
      { beat: 3.5, len: 0.28, note: root + 7, vel: 0.72 },
    ],
  ];
  const pattern = patterns[variant % patterns.length];
  for (const step of pattern) {
    push(events, {
      beat: step.beat,
      len: step.len,
      instrument: "bass",
      notes: [step.note],
      velocity: velocity * step.vel,
      pan: -0.1,
    });
  }
}

function addMalletOstinato(
  events: AudioScoreEvent[],
  harmony: Harmony,
  variant = 0,
  velocity = 0.22,
  density: "sparse" | "medium" | "busy" = "medium",
) {
  const notes = (harmony.color ?? harmony.chord).map((note) => note + 12);
  const sparse = [
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 1],
  ];
  const medium = [
    [0, 0],
    [0.5, 1],
    [1, 2],
    [1.5, 1],
    [2, 3],
    [2.5, 2],
    [3, 1],
    [3.5, 0],
  ];
  const busy = [
    [0, 0],
    [0.5, 2],
    [0.75, 1],
    [1, 3],
    [1.5, 2],
    [2, 1],
    [2.25, 3],
    [2.5, 2],
    [3, 1],
    [3.5, 0],
  ];
  const variants = [sparse, medium, busy];
  const pattern =
    density === "sparse" ? sparse : density === "busy" ? busy : variants[(variant % 2) + 1];

  for (let index = 0; index < pattern.length; index += 1) {
    const [beat, tone] = pattern[index];
    push(events, {
      beat,
      len: 0.3,
      instrument: "mallet",
      notes: [notes[(tone + variant) % notes.length]],
      velocity: velocity * (index % 2 === 0 ? 1.08 : 0.86),
      pan: -0.16 + index * 0.04,
      send: 0.34,
    });
  }
}

function addArp(
  events: AudioScoreEvent[],
  harmony: Harmony,
  instrument: "pluck" | "sparkle",
  variant = 0,
  velocity = 0.22,
) {
  const notes = [...harmony.chord, harmony.chord[1] + 12];
  const patterns = [
    [0, 1, 2, 1, 3, 2, 1, 0],
    [0, 2, 1, 3, 2, 1, 0, 2],
    [1, 2, 3, 2, 1, 0, 1, 2],
    [0, 1, 3, 2, 1, 2, 3, 1],
  ];
  const pattern = patterns[variant % patterns.length];
  for (let index = 0; index < pattern.length; index += 1) {
    push(events, {
      beat: index * 0.5,
      len: 0.32,
      instrument,
      notes: [notes[pattern[index] % notes.length] + 12],
      velocity: velocity * (index % 2 === 0 ? 1 : 0.84),
      pan: -0.16 + index * 0.05,
      send: instrument === "sparkle" ? 0.72 : 0.36,
    });
  }
}

function addBellMotif(
  events: AudioScoreEvent[],
  notes: number[],
  offset = 0,
  velocity = 0.26,
  variant = 0,
) {
  const phrases = [
    [0, 1, 2, 1, 3],
    [0, 2, 1, 3, 2],
    [1, 2, 3, 2, 1],
  ];
  const beatPatterns = [
    [0, 0.75, 1.5, 2.5, 3],
    [0.25, 1, 1.75, 2.5, 3.25],
    [0, 0.5, 1.5, 2.25, 3.25],
  ];
  const phrase = phrases[variant % phrases.length];
  const beats = beatPatterns[variant % beatPatterns.length];
  for (let index = 0; index < phrase.length; index += 1) {
    push(events, {
      beat: offset + beats[index],
      len: index === phrase.length - 1 ? 0.7 : 0.38,
      instrument: "bell",
      notes: [notes[phrase[index] % notes.length] + 12],
      velocity: velocity * (index === 0 ? 1.06 : 0.92),
      pan: -0.12 + index * 0.06,
      send: 0.72,
    });
  }
}

function addLeadPhrase(
  events: AudioScoreEvent[],
  notes: MelodyTone[],
  beats: number[],
  instrument: "lead" | "brass",
  velocity = 0.28,
  send = 0.24,
  panBias = 0.1,
) {
  for (let index = 0; index < Math.min(notes.length, beats.length); index += 1) {
    const note = notes[index];
    if (note == null) continue;
    const nextBeat = beats[index + 1] ?? 4;
    push(events, {
      beat: beats[index],
      len: Math.max(0.22, nextBeat - beats[index] - 0.06),
      instrument,
      notes: [note],
      velocity: velocity * (index === 0 ? 1.08 : 1),
      pan: panBias - index * 0.03,
      send,
    });
  }
}

function addPulseChord(events: AudioScoreEvent[], harmony: Harmony, beats: number[], velocity = 0.3) {
  const chord = harmony.chord.map((note) => note + 7);
  for (const beat of beats) {
    push(events, {
      beat,
      len: 0.3,
      instrument: "pulse",
      notes: chord,
      velocity,
      pan: 0.08,
      send: 0.18,
    });
  }
}

function addRiseStrings(events: AudioScoreEvent[], harmony: Harmony, velocity = 0.22) {
  push(events, {
    beat: 1.5,
    len: 2.2,
    instrument: "string",
    notes: (harmony.color ?? harmony.chord).map((note) => note + 12),
    velocity,
    send: 0.36,
    pan: 0.08,
  });
}

function addCounterLine(
  events: AudioScoreEvent[],
  harmony: Harmony,
  variant = 0,
  instrument: "pluck" | "sparkle" | "bell" = "pluck",
  velocity = 0.16,
  offset = 0,
) {
  const notes = [...(harmony.color ?? harmony.chord), harmony.root + 24];
  const phrases = [
    {
      beats: [0.25, 1.25, 2.25, 3.25],
      tones: [0, 2, 1, 3],
    },
    {
      beats: [0.5, 1.5, 2.75, 3.25],
      tones: [1, 3, 2, 4],
    },
    {
      beats: [0.25, 0.75, 2, 3],
      tones: [2, 1, 3, 0],
    },
  ];
  const phrase = phrases[variant % phrases.length];
  phrase.beats.forEach((beat, index) => {
    push(events, {
      beat: offset + beat,
      len: instrument === "bell" ? 0.5 : 0.34,
      instrument,
      notes: [notes[phrase.tones[index] % notes.length] + (instrument === "bell" ? 0 : 12)],
      velocity: velocity * (index === 0 ? 1.08 : 0.92),
      pan: -0.18 + index * 0.1,
      send: instrument === "sparkle" ? 0.54 : instrument === "bell" ? 0.62 : 0.26,
    });
  });
}

function addHornStabs(
  events: AudioScoreEvent[],
  harmony: Harmony,
  beats: number[],
  velocity = 0.22,
  send = 0.18,
) {
  const notes = [
    harmony.root + 12,
    (harmony.color ?? harmony.chord)[1] + 12,
    (harmony.color ?? harmony.chord)[2] + 12,
  ];
  beats.forEach((beat, index) => {
    push(events, {
      beat,
      len: index === beats.length - 1 ? 0.4 : 0.28,
      instrument: "brass",
      notes,
      velocity: velocity * (index === 0 ? 1.08 : 0.94),
      pan: 0.08 - index * 0.04,
      send,
    });
  });
}

function addSnareLift(events: AudioScoreEvent[], startBeat = 2.5, velocity = 0.2) {
  const pattern = [startBeat, startBeat + 0.25, startBeat + 0.5, startBeat + 0.75, startBeat + 1];
  pattern.forEach((beat, index) => {
    push(events, {
      beat,
      len: 0.16,
      instrument: index % 2 === 0 ? "snare" : "hat",
      velocity: velocity * (0.84 + index * 0.06),
      pan: index % 2 === 0 ? -0.06 : 0.08,
    });
  });
}

function melodyPool(harmony: Harmony, octave = 12) {
  const source = harmony.color ?? harmony.chord;
  return [harmony.root + octave, ...source.map((note) => note + octave), harmony.root + octave + 12];
}

function addMotifPhrase(
  events: AudioScoreEvent[],
  harmony: Harmony,
  tonePattern: MelodyTone[],
  beats: number[],
  instrument: AudioInstrument,
  velocity = 0.18,
  send = 0.2,
  octave = 12,
  panBias = 0.08,
) {
  const pool = melodyPool(harmony, octave);
  for (let index = 0; index < Math.min(tonePattern.length, beats.length); index += 1) {
    const tone = tonePattern[index];
    if (tone == null) continue;
    const note = pool[((tone % pool.length) + pool.length) % pool.length];
    const nextBeat = beats[index + 1] ?? 4;
    push(events, {
      beat: beats[index],
      len: Math.max(instrument === "bell" ? 0.28 : 0.22, nextBeat - beats[index] - 0.06),
      instrument,
      notes: [note],
      velocity: velocity * (index === 0 ? 1.1 : index === tonePattern.length - 1 ? 0.94 : 1),
      pan: panBias - index * 0.03,
      send,
    });
  }
}

function addRhythmicPedal(
  events: AudioScoreEvent[],
  harmony: Harmony,
  beats: number[],
  instrument: "pulse" | "pluck",
  velocity = 0.18,
  octave = 0,
) {
  const source = melodyPool(harmony, octave);
  beats.forEach((beat, index) => {
    push(events, {
      beat,
      len: instrument === "pulse" ? 0.32 : 0.24,
      instrument,
      notes: [source[index % 2 === 0 ? 0 : 2]],
      velocity: velocity * (index % 2 === 0 ? 1.04 : 0.9),
      pan: -0.06 + index * 0.04,
      send: instrument === "pulse" ? 0.14 : 0.18,
    });
  });
}

function addDrumAccent(
  events: AudioScoreEvent[],
  beat: number,
  velocity = 0.2,
  pan = 0,
  note = 74,
) {
  push(events, {
    beat,
    len: 0.18,
    instrument: "impact",
    velocity: velocity * 0.68,
    pan,
  });
  push(events, {
    beat: beat + 0.05,
    len: 0.2,
    instrument: "brass",
    notes: [note],
    velocity: velocity * 0.36,
    pan: pan * -0.5,
    send: 0.1,
  });
}

function createHomeScore(): AudioThemeScore {
  const mistwake: Harmony[] = [
    { root: 50, chord: major9(50), color: [62, 66, 69, 76] },
    { root: 45, chord: add6(45), color: [57, 61, 64, 69] },
    { root: 47, chord: minor9(47), color: [59, 62, 66, 73] },
    { root: 43, chord: major9(43), color: [55, 59, 62, 69] },
    { root: 50, chord: major9(50), color: [62, 66, 69, 76] },
    { root: 45, chord: major9(45), color: [57, 61, 64, 71] },
    { root: 43, chord: sus2(43), color: [55, 57, 62, 69] },
    { root: 45, chord: major9(45), color: [57, 61, 64, 71] },
  ];
  const crossroads: Harmony[] = [
    { root: 42, chord: minor9(42), color: [54, 57, 61, 68] },
    { root: 43, chord: major9(43), color: [55, 59, 62, 69] },
    { root: 50, chord: major9(50), color: [62, 66, 69, 76] },
    { root: 45, chord: add6(45), color: [57, 61, 64, 69] },
    { root: 47, chord: minor9(47), color: [59, 62, 66, 73] },
    { root: 43, chord: major9(43), color: [55, 59, 62, 69] },
    { root: 50, chord: major9(50), color: [62, 66, 69, 76] },
    { root: 45, chord: major9(45), color: [57, 61, 64, 71] },
  ];
  const lanterns: Harmony[] = [
    { root: 52, chord: add6(52), color: [64, 68, 71, 76] },
    { root: 47, chord: minor9(47), color: [59, 62, 66, 73] },
    { root: 45, chord: major9(45), color: [57, 61, 64, 71] },
    { root: 50, chord: major9(50), color: [62, 66, 69, 76] },
    { root: 52, chord: add6(52), color: [64, 68, 71, 76] },
    { root: 48, chord: major9(48), color: [60, 64, 67, 74] },
    { root: 45, chord: sus2(45), color: [57, 59, 64, 71] },
    { root: 50, chord: major9(50), color: [62, 66, 69, 76] },
  ];
  const summit: Harmony[] = [
    { root: 47, chord: minor9(47), color: [59, 62, 66, 73] },
    { root: 45, chord: major9(45), color: [57, 61, 64, 71] },
    { root: 50, chord: major9(50), color: [62, 66, 69, 76] },
    { root: 43, chord: major9(43), color: [55, 59, 62, 69] },
    { root: 42, chord: minor9(42), color: [54, 57, 61, 68] },
    { root: 45, chord: major9(45), color: [57, 61, 64, 71] },
    { root: 47, chord: minor9(47), color: [59, 62, 66, 73] },
    { root: 50, chord: major9(50), color: [62, 66, 69, 76] },
  ];
  const festival: Harmony[] = [
    { root: 55, chord: major9(55), color: [67, 71, 74, 81] },
    { root: 50, chord: major9(50), color: [62, 66, 69, 76] },
    { root: 52, chord: minor9(52), color: [64, 67, 71, 78] },
    { root: 48, chord: major9(48), color: [60, 64, 67, 74] },
    { root: 55, chord: major9(55), color: [67, 71, 74, 81] },
    { root: 52, chord: minor9(52), color: [64, 67, 71, 78] },
    { root: 50, chord: major9(50), color: [62, 66, 69, 76] },
    { root: 48, chord: major9(48), color: [60, 64, 67, 74] },
  ];
  const skyport: Harmony[] = [
    { root: 57, chord: major9(57), color: [69, 73, 76, 83] },
    { root: 52, chord: minor9(52), color: [64, 67, 71, 78] },
    { root: 55, chord: major9(55), color: [67, 71, 74, 81] },
    { root: 50, chord: major9(50), color: [62, 66, 69, 76] },
    { root: 48, chord: add6(48), color: [60, 64, 67, 72] },
    { root: 52, chord: minor9(52), color: [64, 67, 71, 78] },
    { root: 55, chord: major9(55), color: [67, 71, 74, 81] },
    { root: 57, chord: major9(57), color: [69, 73, 76, 83] },
  ];

  const phraseA: MelodyTone[] = [0, 1, 3, 4, 3, 1];
  const phraseB: MelodyTone[] = [0, 2, 3, 4, 3, 2];
  const phraseLift: MelodyTone[] = [1, 2, 4, 5, 4, 2];
  const phraseReturn: MelodyTone[] = [4, 3, 2, 1, 0, 1];
  const beatPhrase = [0, 0.5, 1.25, 2, 2.75, 3.25];
  const beatReply = [0.25, 0.75, 1.5, 2.25, 3, 3.5];

  const sections = [
    { name: "mistwake", progression: mistwake, tempo: 86 },
    { name: "crossroads", progression: crossroads, tempo: 92 },
    { name: "lanterns", progression: lanterns, tempo: 96 },
    { name: "summit", progression: summit, tempo: 98 },
    { name: "festival", progression: festival, tempo: 102 },
    { name: "skyport", progression: skyport, tempo: 104 },
  ];

  const bars = sections.flatMap((section, sectionIndex) =>
    section.progression.map((harmony, barIndex) => {
      const events: AudioScoreEvent[] = [];
      const globalIndex = sectionIndex * 8 + barIndex;
      const isIntro = section.name === "mistwake";
      const isBright = section.name === "festival" || section.name === "skyport";
      const isLyrical = section.name === "lanterns" || section.name === "summit";
      const isBreezy = section.name === "crossroads" || isBright;
      const motif =
        section.name === "summit"
          ? phraseLift
          : section.name === "skyport"
            ? phraseB
            : barIndex < 4
              ? phraseA
              : phraseReturn;
      const reply = barIndex % 2 === 0 ? phraseB : phraseReturn;

      addPad(events, harmony, isBright ? 0.4 : isLyrical ? 0.36 : 0.32, isBright ? 0.54 : isLyrical ? 0.5 : 0.44);
      addStrings(events, harmony, isBright ? 0.24 : isLyrical ? 0.22 : 0.16, isBright ? 0.42 : 0.34);
      addChoir(events, harmony, isLyrical ? 0.18 : isBright ? 0.14 : 0.12, isLyrical ? 0.76 : 0.64);
      addBass(events, harmony, globalIndex, isBright ? 0.6 : isBreezy ? 0.52 : 0.46);

      if (isIntro) {
        addMalletOstinato(events, harmony, globalIndex, 0.14, barIndex >= 4 ? "medium" : "sparse");
      } else if (section.name === "crossroads") {
        addMalletOstinato(events, harmony, globalIndex, 0.2, "medium");
        addArp(events, harmony, barIndex % 2 === 0 ? "pluck" : "sparkle", globalIndex, 0.16);
      } else if (isLyrical) {
        addMalletOstinato(events, harmony, globalIndex, 0.18, "medium");
        addCounterLine(events, harmony, globalIndex, barIndex % 3 === 0 ? "bell" : "pluck", 0.14, 0.04);
      } else {
        addMalletOstinato(events, harmony, globalIndex, 0.22, "busy");
        addArp(events, harmony, barIndex % 2 === 0 ? "pluck" : "sparkle", globalIndex, 0.2);
        addCounterLine(events, harmony, globalIndex + 1, "sparkle", 0.12, 0.08);
      }

      if (isIntro) {
        addMotifPhrase(events, harmony, barIndex < 4 ? phraseA : phraseB, beatPhrase, "bell", 0.14, 0.54, 24, 0.1);
        if (barIndex >= 4) {
          addMotifPhrase(events, harmony, reply, beatReply, "mallet", 0.12, 0.22, 12, -0.02);
        }
      } else if (section.name === "crossroads") {
        addMotifPhrase(events, harmony, motif, beatPhrase, "mallet", 0.16, 0.18, 12, 0.04);
        addMotifPhrase(events, harmony, reply, beatReply, barIndex % 2 === 0 ? "bell" : "pluck", 0.14, 0.34, 24, -0.04);
      } else if (isLyrical) {
        addMotifPhrase(events, harmony, motif, beatPhrase, barIndex % 3 === 0 ? "brass" : "lead", 0.18, 0.18, 12, 0.1);
        addMotifPhrase(events, harmony, reply, beatReply, "bell", 0.14, 0.5, 24, -0.05);
      } else {
        addMotifPhrase(events, harmony, motif, beatPhrase, barIndex % 3 === 0 ? "brass" : "lead", 0.24, 0.18, 12, 0.12);
        addMotifPhrase(events, harmony, barIndex % 4 === 3 ? phraseLift : reply, beatReply, "bell", 0.18, 0.54, 24, -0.04);
        addHornStabs(events, harmony, barIndex % 2 === 0 ? [1.5, 3] : [2, 3.25], 0.16, 0.12);
      }

      if (!isIntro || barIndex >= 4) {
        addKickPattern(events, isBright ? [0, 1.5, 2.5] : isLyrical ? [0, 2.5] : [0, 2], isBright ? 0.34 : 0.22);
      }
      if (sectionIndex >= 1) {
        addHatPattern(events, isBright ? [0.5, 1, 1.5, 2.5, 3, 3.5] : [0.5, 1.5, 2.5, 3.5], isBright ? 0.16 : 0.1, 0.1);
      }
      if (isLyrical && barIndex % 4 === 3) {
        addTomPattern(events, [3.25], 0.24);
      }
      if (isBright && barIndex % 4 === 3) {
        addSnareLift(events, 2.5, 0.16);
      }
      if (barIndex % 8 === 7 && sectionIndex < sections.length - 1) {
        addImpact(events, 3.5, isBright ? 0.36 : 0.24);
        addRiseStrings(events, harmony, isBright ? 0.24 : 0.16);
      }

      return { tempo: section.tempo, beats: 4, events };
    }),
  );

  return { bars, entryBars: [0, 8, 16, 24, 32, 40], loopFromBar: 8 };
}

function createAdventureScore(): AudioThemeScore {
  const progression: Harmony[] = [
    { root: 47, chord: minor9(47), color: [59, 62, 66, 73] },
    { root: 43, chord: major9(43), color: [55, 59, 62, 69] },
    { root: 45, chord: major9(45), color: [57, 61, 64, 71] },
    { root: 40, chord: minor9(40), color: [52, 55, 59, 66] },
    { root: 48, chord: add6(48), color: [60, 64, 67, 72] },
    { root: 43, chord: major9(43), color: [55, 59, 62, 69] },
    { root: 45, chord: sus2(45), color: [57, 59, 64, 71] },
    { root: 50, chord: major9(50), color: [62, 66, 69, 76] },
  ];

  const bars = [...progression, ...progression, ...progression].map((harmony, index) => {
    const events: AudioScoreEvent[] = [];
    addPad(events, harmony, 0.32, 0.46);
    addStrings(events, harmony, index >= 8 ? 0.2 : 0.15, 0.38);
    addBass(events, harmony, index, 0.48);
    addMalletOstinato(events, harmony, index, 0.18, index >= 16 ? "busy" : "medium");
    addArp(events, harmony, index % 3 === 0 ? "sparkle" : "pluck", index, 0.16);
    if (index % 2 === 0) {
      addBellMotif(events, harmony.chord, 0.2, 0.18, index);
    }
    if (index >= 8) {
      const leads = [
        [74, 76, null, 78, 76, 74],
        [71, 74, 76, null, 78, 76],
        [69, null, 71, 74, 76, 78],
      ];
      addLeadPhrase(events, leads[index % leads.length], [0, 0.5, 1.25, 2, 2.5, 3.25], "lead", 0.14, 0.16, 0.08);
    }
    if (index >= 12) {
      addKickPattern(events, [0, 2], 0.18);
      addHatPattern(events, [0.5, 1.5, 2.5, 3.5], 0.1, 0.1);
    }
    return { tempo: index >= 16 ? 102 : 96, beats: 4, events };
  });

  return { bars, entryBars: [0, 8, 16], loopFromBar: 8 };
}

function createBattleScore(): AudioThemeScore {
  const muster: Harmony[] = [
    { root: 40, chord: minor9(40), color: [52, 55, 59, 66] },
    { root: 36, chord: major9(36), color: [48, 52, 55, 62] },
    { root: 43, chord: major9(43), color: [55, 59, 62, 69] },
    { root: 38, chord: major9(38), color: [50, 54, 57, 64] },
    { root: 45, chord: power(45).concat([57]), color: [57, 64, 69, 74] },
    { root: 40, chord: minor9(40), color: [52, 55, 59, 66] },
    { root: 43, chord: major9(43), color: [55, 59, 62, 69] },
    { root: 47, chord: minor9(47), color: [59, 62, 66, 73] },
  ];
  const ambush: Harmony[] = [
    { root: 43, chord: major9(43), color: [55, 59, 62, 69] },
    { root: 38, chord: major9(38), color: [50, 54, 57, 64] },
    { root: 45, chord: power(45).concat([57]), color: [57, 64, 69, 74] },
    { root: 40, chord: minor9(40), color: [52, 55, 59, 66] },
    { root: 47, chord: minor9(47), color: [59, 62, 66, 73] },
    { root: 43, chord: major9(43), color: [55, 59, 62, 69] },
    { root: 45, chord: power(45).concat([57]), color: [57, 64, 69, 74] },
    { root: 50, chord: minor9(50), color: [62, 65, 69, 76] },
  ];
  const breach: Harmony[] = [
    { root: 38, chord: major9(38), color: [50, 54, 57, 64] },
    { root: 40, chord: minor9(40), color: [52, 55, 59, 66] },
    { root: 35, chord: minor9(35), color: [47, 50, 54, 61] },
    { root: 43, chord: major9(43), color: [55, 59, 62, 69] },
    { root: 33, chord: power(33).concat([45]), color: [45, 52, 57, 62] },
    { root: 40, chord: minor9(40), color: [52, 55, 59, 66] },
    { root: 35, chord: minor9(35), color: [47, 50, 54, 61] },
    { root: 45, chord: power(45).concat([57]), color: [57, 64, 69, 74] },
  ];
  const onslaught: Harmony[] = [
    { root: 45, chord: power(45).concat([57]), color: [57, 64, 69, 74] },
    { root: 47, chord: minor9(47), color: [59, 62, 66, 73] },
    { root: 43, chord: major9(43), color: [55, 59, 62, 69] },
    { root: 50, chord: minor9(50), color: [62, 65, 69, 76] },
    { root: 45, chord: power(45).concat([57]), color: [57, 64, 69, 74] },
    { root: 52, chord: minor9(52), color: [64, 67, 71, 78] },
    { root: 47, chord: minor9(47), color: [59, 62, 66, 73] },
    { root: 55, chord: power(55).concat([67]), color: [67, 74, 79, 84] },
  ];
  const hook: MelodyTone[] = [0, 2, 3, 4, 3, 2];
  const hookLift: MelodyTone[] = [0, 2, 4, 5, 4, 2];
  const answer: MelodyTone[] = [4, 3, 2, 1, 0, 1];
  const menace: MelodyTone[] = [1, 2, 1, 3, 2, 0];
  const beatHook = [0, 0.5, 1.25, 2, 2.5, 3.25];
  const beatAnswer = [0.25, 1, 1.5, 2.25, 3, 3.5];

  const sections = [
    { name: "muster", progression: muster, tempo: 106 },
    { name: "ambush", progression: ambush, tempo: 112 },
    { name: "clash", progression: ambush, tempo: 118 },
    { name: "breach", progression: breach, tempo: 110 },
    { name: "onslaught", progression: onslaught, tempo: 122 },
    { name: "finale", progression: onslaught, tempo: 126 },
  ];

  const bars = sections.flatMap((section, sectionIndex) =>
    section.progression.map((harmony, barIndex) => {
      const index = sectionIndex * 8 + barIndex;
      const events: AudioScoreEvent[] = [];
      const isIntro = section.name === "muster";
      const isBreak = section.name === "breach";
      const isClimax = section.name === "clash" || section.name === "onslaught" || section.name === "finale";
      const isFinale = section.name === "finale";
      const motif =
        isBreak ? menace : isClimax ? (barIndex % 4 === 3 ? hookLift : hook) : barIndex % 2 === 0 ? hook : menace;
      const reply = isBreak ? answer : barIndex % 3 === 0 ? answer : menace;

      addPad(events, harmony, isClimax ? 0.16 : isBreak ? 0.14 : 0.12, isBreak ? 0.22 : 0.14);
      addStrings(events, harmony, isClimax ? 0.16 : 0.12, isClimax ? 0.18 : 0.1);
      addBass(events, harmony, index, isFinale ? 0.8 : isClimax ? 0.72 : 0.6);
      addRhythmicPedal(
        events,
        harmony,
        isBreak ? [0.5, 1.75, 3] : isClimax ? [0.5, 1.5, 2.25, 3.25] : [0.75, 2, 3.25],
        "pulse",
        isClimax ? 0.24 : 0.18,
        0,
      );

      if (isIntro) {
        addMotifPhrase(events, harmony, motif, beatHook, "lead", 0.16, 0.12, 12, 0.1);
        addMotifPhrase(events, harmony, reply, beatAnswer, "pluck", 0.12, 0.12, 12, -0.06);
      } else if (isBreak) {
        addMotifPhrase(events, harmony, menace, beatHook, "brass", 0.18, 0.12, 12, 0.08);
        addMotifPhrase(events, harmony, answer, beatAnswer, "bell", 0.12, 0.42, 24, -0.08);
        addCounterLine(events, harmony, index, "bell", 0.1, 0.08);
      } else if (isClimax) {
        addMotifPhrase(events, harmony, motif, beatHook, barIndex % 2 === 0 ? "brass" : "lead", isFinale ? 0.28 : 0.24, 0.14, 12, 0.12);
        addMotifPhrase(events, harmony, reply, beatAnswer, "lead", 0.14, 0.1, 12, -0.04);
        addHornStabs(events, harmony, isFinale ? [1.5, 2.5, 3.5] : [2, 3.25], isFinale ? 0.22 : 0.18, 0.08);
      } else {
        addMotifPhrase(events, harmony, motif, beatHook, "lead", 0.18, 0.12, 12, 0.08);
        addMotifPhrase(events, harmony, reply, beatAnswer, "pluck", 0.12, 0.08, 12, -0.06);
      }

      if (!isBreak) {
        addKickPattern(
          events,
          isIntro ? [0, 2.25] : isClimax ? [0, 1.5, 2, 2.75] : [0, 1.25, 2.5, 3.25],
          isFinale ? 0.9 : isClimax ? 0.8 : 0.68,
        );
        addSnarePattern(events, isIntro ? [1.5, 3.25] : isClimax ? [1, 2.5, 3.5] : [1.5, 3], isClimax ? 0.56 : 0.42);
        addHatPattern(
          events,
          isIntro ? [0.5, 1.5, 2.5, 3.5] : isClimax ? [0.5, 1, 1.5, 2.5, 3, 3.5] : [0.75, 1.5, 2.5, 3.5],
          isFinale ? 0.28 : 0.18,
          0.08,
        );
      } else {
        addTomPattern(events, [0, 2.25], 0.3);
        addHatPattern(events, [1.25, 3.25], 0.1, 0.06);
        if (barIndex % 2 === 1) addSnareLift(events, 2.5, 0.14);
      }

      if (isClimax && barIndex % 2 === 0) {
        addTomPattern(events, [3.25], isFinale ? 0.46 : 0.34);
      }
      if ((barIndex % 4 === 3 && sectionIndex >= 1) || isFinale) {
        addImpact(events, 3.5, isFinale ? 0.56 : 0.34);
      }
      if (isClimax && barIndex % 4 === 3) {
        addRiseStrings(events, harmony, isFinale ? 0.26 : 0.18);
        addDrumAccent(events, 3.1, isFinale ? 0.24 : 0.18, 0.04, 76);
      }
      if (barIndex % 8 === 7 && sectionIndex < sections.length - 1) {
        addSnareLift(events, 2.5, isClimax ? 0.2 : 0.14);
      }

      return { tempo: section.tempo, beats: 4, events };
    }),
  );

  return { bars, entryBars: [0, 8, 16, 32, 40], loopFromBar: 8 };
}

function createEventScore(): AudioThemeScore {
  const progression: Harmony[] = [
    { root: 55, chord: major9(55), color: [67, 71, 74, 81] },
    { root: 50, chord: major9(50), color: [62, 66, 69, 76] },
    { root: 52, chord: minor9(52), color: [64, 67, 71, 78] },
    { root: 48, chord: major9(48), color: [60, 64, 67, 74] },
    { root: 57, chord: add6(57), color: [69, 73, 76, 81] },
    { root: 55, chord: major9(55), color: [67, 71, 74, 81] },
    { root: 52, chord: minor9(52), color: [64, 67, 71, 78] },
    { root: 50, chord: major9(50), color: [62, 66, 69, 76] },
  ];

  const bars = [...progression, ...progression].map((harmony, index) => {
    const events: AudioScoreEvent[] = [];
    addPad(events, harmony, 0.3, 0.42);
    addStrings(events, harmony, 0.16, 0.34);
    addBass(events, harmony, index, 0.42);
    addArp(events, harmony, "pluck", index + 1, 0.22);
    addBellMotif(events, harmony.chord, index % 2 === 0 ? 0 : 0.5, 0.2, index);
    addHatPattern(events, [0.5, 1.5, 2.5, 3.5], 0.16);
    addKickPattern(events, [0, 2], 0.24);
    return { tempo: 98, beats: 4, events };
  });

  return { bars, entryBars: [0, 8], loopFromBar: 4 };
}

function createShopScore(): AudioThemeScore {
  const progression: Harmony[] = [
    { root: 60, chord: major9(60), color: [72, 76, 79, 86] },
    { root: 55, chord: major9(55), color: [67, 71, 74, 81] },
    { root: 57, chord: minor9(57), color: [69, 72, 76, 83] },
    { root: 53, chord: major9(53), color: [65, 69, 72, 79] },
  ];

  const bars = [...progression, ...progression, ...progression, ...progression].map((harmony, index) => {
    const events: AudioScoreEvent[] = [];
    addPad(events, harmony, 0.22, 0.28);
    addStrings(events, harmony, 0.14, 0.24);
    addMalletOstinato(events, harmony, index, 0.2, "medium");
    addArp(events, harmony, index % 2 === 0 ? "sparkle" : "pluck", index, 0.22);
    addBellMotif(events, harmony.chord, 0.25, 0.18, index);
    addKickPattern(events, [0, 2], 0.18);
    addHatPattern(events, [0.5, 1.5, 2.5, 3.5], 0.12);
    return { tempo: 94, beats: 4, events };
  });

  return { bars, entryBars: [0, 4, 8, 12], loopFromBar: 4 };
}

function createVictoryStinger(): AudioStingerScore {
  return {
    bars: [
      {
        tempo: 118,
        beats: 4,
        events: [
          { beat: 0, len: 1.1, instrument: "impact", velocity: 0.84, notes: [48] },
          { beat: 0, len: 1.4, instrument: "brass", velocity: 0.44, notes: [67, 71, 74], send: 0.28 },
          { beat: 0.25, len: 0.5, instrument: "bell", velocity: 0.3, notes: [79], send: 0.66 },
          { beat: 0.75, len: 0.5, instrument: "bell", velocity: 0.28, notes: [83], send: 0.68 },
          { beat: 1.25, len: 0.44, instrument: "mallet", velocity: 0.24, notes: [86], send: 0.28 },
          { beat: 1.5, len: 1.2, instrument: "choir", velocity: 0.24, notes: [74, 79, 83], send: 0.76 },
          { beat: 2.25, len: 0.4, instrument: "lead", velocity: 0.22, notes: [86], send: 0.18 },
          { beat: 2.5, len: 0.44, instrument: "bell", velocity: 0.26, notes: [91], send: 0.74 },
          { beat: 3, len: 0.9, instrument: "brass", velocity: 0.34, notes: [79, 83, 86], send: 0.32 },
        ],
      },
      {
        tempo: 118,
        beats: 4,
        events: [
          { beat: 0, len: 2.8, instrument: "pad", velocity: 0.28, notes: [74, 79, 83], send: 0.54 },
          { beat: 0, len: 3.2, instrument: "string", velocity: 0.18, notes: [86, 91, 95], send: 0.42 },
          { beat: 0, len: 3.2, instrument: "choir", velocity: 0.18, notes: [86, 91, 95], send: 0.78 },
          { beat: 0.5, len: 0.42, instrument: "bell", velocity: 0.22, notes: [91], send: 0.76 },
          { beat: 1, len: 0.42, instrument: "bell", velocity: 0.2, notes: [95], send: 0.76 },
          { beat: 1.5, len: 1.6, instrument: "sparkle", velocity: 0.2, notes: [98], send: 0.88 },
          { beat: 2.5, len: 0.8, instrument: "lead", velocity: 0.16, notes: [103], send: 0.22 },
        ],
      },
    ],
  };
}

function createDefeatStinger(): AudioStingerScore {
  return {
    bars: [
      {
        tempo: 74,
        beats: 4,
        events: [
          { beat: 0, len: 0.8, instrument: "impact", velocity: 0.72, notes: [36] },
          { beat: 0, len: 2.1, instrument: "brass", velocity: 0.28, notes: [52, 55, 59], send: 0.2 },
          { beat: 0.25, len: 0.46, instrument: "mallet", velocity: 0.18, notes: [64], send: 0.22 },
          { beat: 1, len: 1.8, instrument: "choir", velocity: 0.18, notes: [47, 52, 55], send: 0.58 },
          { beat: 2, len: 0.44, instrument: "snare", velocity: 0.24, notes: [38] },
          { beat: 2.5, len: 1.2, instrument: "string", velocity: 0.14, notes: [45, 48, 52], send: 0.28 },
          { beat: 3, len: 0.9, instrument: "brass", velocity: 0.18, notes: [45, 48, 52], send: 0.18 },
        ],
      },
      {
        tempo: 74,
        beats: 4,
        events: [
          { beat: 0, len: 3.2, instrument: "pad", velocity: 0.18, notes: [40, 47, 52], send: 0.44 },
          { beat: 0, len: 3.2, instrument: "string", velocity: 0.14, notes: [52, 55, 59], send: 0.28 },
          { beat: 0.5, len: 2.8, instrument: "choir", velocity: 0.14, notes: [52, 55, 59], send: 0.68 },
          { beat: 1.5, len: 0.6, instrument: "bell", velocity: 0.12, notes: [64], send: 0.56 },
          { beat: 2.25, len: 0.8, instrument: "lead", velocity: 0.1, notes: [47], send: 0.18 },
        ],
      },
    ],
  };
}

export const THEME_SCORES: Record<AudioThemeName, AudioThemeScore> = {
  home: createHomeScore(),
  intro: createHomeScore(),
  battle: createBattleScore(),
  boss: createBattleScore(),
  adventure: createAdventureScore(),
  event: createEventScore(),
  shop: createShopScore(),
  prebattle: createBattleScore(),
  postbattle: createAdventureScore(),
};

export const STINGER_SCORES: Record<AudioStingerName, AudioStingerScore> = {
  victory: createVictoryStinger(),
  defeat: createDefeatStinger(),
};
