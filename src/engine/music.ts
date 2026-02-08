import type { UrgencyLevel } from "./urgency";

// Tone.js is loaded lazily to avoid creating an AudioContext on page load
type ToneLib = typeof import("tone");
let T: ToneLib | null = null;

// D minor scale notes for our key
const CHORD_PROGRESSIONS = [
  ["D3", "F3", "A3"],   // Dm
  ["Bb2", "D3", "F3"],  // Bb
  ["G3", "Bb3", "D4"],  // Gm
  ["A3", "C#4", "E4"],  // A (dominant)
];

const BASS_NOTES = ["D2", "Bb1", "G2", "A2"];

const ARPEGGIO_NOTES = [
  ["D4", "F4", "A4", "D5"],
  ["Bb3", "D4", "F4", "Bb4"],
  ["G4", "Bb4", "D5", "G5"],
  ["A4", "C#5", "E5", "A5"],
];

let initialized = false;
let playing = false;

// Instruments — typed as any since Tone is loaded dynamically
/* eslint-disable @typescript-eslint/no-explicit-any */
let padSynth: any = null;
let pulseSynth: any = null;
let arpeggioSynth: any = null;
let bassSynth: any = null;
let padFilter: any = null;
let masterVol: any = null;
let arpeggioVol: any = null;
/* eslint-enable @typescript-eslint/no-explicit-any */

// Scheduler state
let schedulerId: ReturnType<typeof setInterval> | null = null;
let fadeTimeoutId: ReturnType<typeof setTimeout> | null = null;
let tick = 0;
let currentBpm = 80;

// Loop counters
let chordIndex = 0;
let pulseCount = 0;
let arpIndex = 0;

// State
let currentIntensity = 0;
let musicEnabled = true;
let musicVolume = 0.7;

export interface MusicState {
  level: number;
  winThreshold: number;
  potentialPoints: number;
  maxPoints: number;
  urgency: UrgencyLevel;
}

export async function initMusic(): Promise<void> {
  if (initialized) return;

  // Lazy-load Tone.js so no AudioContext is created until user gesture
  T = await import("tone");

  // Must be called from a user gesture to unlock AudioContext
  await T.start();

  masterVol = new T.Volume(-12).toDestination();

  // Pad: warm FM synth for harmonic foundation
  padFilter = new T.Filter(800, "lowpass", -24).connect(masterVol);
  padSynth = new T.PolySynth(T.FMSynth, {
    volume: -8,
    envelope: { attack: 0.8, decay: 0.3, sustain: 0.7, release: 1.5 },
    modulationIndex: 2,
    harmonicity: 1.5,
  }).connect(padFilter);

  // Pulse: rhythmic heartbeat tick
  pulseSynth = new T.Synth({
    volume: -18,
    oscillator: { type: "sine" },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 },
  }).connect(masterVol);

  // Arpeggio: tension builder, starts muted
  arpeggioVol = new T.Volume(-Infinity).connect(masterVol);
  arpeggioSynth = new T.MonoSynth({
    volume: -6,
    oscillator: { type: "sawtooth" },
    filter: { Q: 2, type: "lowpass", rolloff: -12 },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.2 },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.3,
      release: 0.2,
      baseFrequency: 400,
      octaves: 2,
    },
  }).connect(arpeggioVol);

  // Bass: sub-foundation
  bassSynth = new T.Synth({
    volume: -10,
    oscillator: { type: "sine" },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.5 },
  }).connect(masterVol);

  initialized = true;
}

/** Compute the interval in ms for one 16th-note at the current BPM */
function tickIntervalMs(): number {
  return 60000 / currentBpm / 4;
}

/** Compute note duration in seconds from beat fraction at current BPM */
function beatDuration(beats: number): number {
  return (60 / currentBpm) * beats;
}

function startScheduler(): void {
  stopScheduler();
  schedulerId = setInterval(onTick, tickIntervalMs());
}

function stopScheduler(): void {
  if (schedulerId !== null) {
    clearInterval(schedulerId);
    schedulerId = null;
  }
}

function onTick(): void {
  if (!T) return;
  const now = T.now();

  // Pad chord: every 32 ticks (2 measures of 4/4 in 16th notes)
  if (tick % 32 === 0 && padSynth) {
    const chord = CHORD_PROGRESSIONS[chordIndex % CHORD_PROGRESSIONS.length];
    padSynth.triggerAttackRelease(chord, beatDuration(8), now, 0.3);
  }

  // Bass note: every 16 ticks (1 measure)
  if (tick % 16 === 0 && bassSynth) {
    const note = BASS_NOTES[chordIndex % BASS_NOTES.length];
    bassSynth.triggerAttackRelease(note, beatDuration(2), now, 0.4);
  }

  // Advance chord index every 32 ticks (aligned with pad)
  if (tick % 32 === 0 && tick > 0) {
    chordIndex++;
  }

  // Pulse: every 4 ticks (quarter note)
  if (tick % 4 === 0 && pulseSynth) {
    const accent = pulseCount % 4 === 0 ? 0.5 : 0.25;
    pulseSynth.triggerAttackRelease("D5", beatDuration(0.125), now, accent);
    pulseCount++;
  }

  // Arpeggio: every tick (16th note)
  if (arpeggioSynth) {
    const notes = ARPEGGIO_NOTES[chordIndex % ARPEGGIO_NOTES.length];
    const note = notes[arpIndex % notes.length];
    arpeggioSynth.triggerAttackRelease(note, beatDuration(0.125), now, 0.4);
    arpIndex++;
  }

  tick++;
}

export function startMusic(): void {
  if (!initialized || !T) return;
  if (!musicEnabled) return;

  // Cancel any pending fade-out so we start clean
  if (fadeTimeoutId !== null) {
    clearTimeout(fadeTimeoutId);
    fadeTimeoutId = null;
  }
  stopScheduler();

  // Reset counters
  chordIndex = 0;
  pulseCount = 0;
  arpIndex = 0;
  tick = 0;
  currentIntensity = 0;
  currentBpm = 80;

  // Start muted to avoid pop, ramp up
  if (masterVol) {
    masterVol.volume.value = -Infinity;
    masterVol.volume.rampTo(volumeToDb(musicVolume) - 12, 1);
  }
  if (arpeggioVol) {
    arpeggioVol.volume.value = -Infinity;
  }

  startScheduler();
  playing = true;
}

export function stopMusic(fadeOutSeconds = 1.5): void {
  if (!playing || !T) return;

  // Cancel any previous pending fade
  if (fadeTimeoutId !== null) {
    clearTimeout(fadeTimeoutId);
    fadeTimeoutId = null;
  }

  if (masterVol) {
    masterVol.volume.rampTo(-Infinity, fadeOutSeconds);
  }

  fadeTimeoutId = setTimeout(() => {
    stopScheduler();
    playing = false;
    fadeTimeoutId = null;
  }, fadeOutSeconds * 1000 + 100);
}

// Endings schedule notes using raw AudioContext time (T.now()), not Transport time.
// All durations must be in seconds — Transport notation ("4n" etc.) is invalid here.

export function playFailureEnding(): void {
  if (!T || !initialized || !musicEnabled) return;

  // Stop the looping scheduler immediately
  stopScheduler();
  if (fadeTimeoutId !== null) {
    clearTimeout(fadeTimeoutId);
    fadeTimeoutId = null;
  }
  playing = false;

  if (masterVol) {
    masterVol.volume.cancelScheduledValues(T.now());
    masterVol.volume.value = volumeToDb(musicVolume) - 4;
  }
  if (arpeggioVol) {
    arpeggioVol.volume.cancelScheduledValues(T.now());
    arpeggioVol.volume.value = -6;
  }

  const now = T.now();

  // --- Phase 1 (0-4s): Initial shock — descending chromatic chords, fast arpeggio run ---
  if (padSynth) {
    padFilter?.frequency.cancelScheduledValues(now);
    padFilter?.frequency.setValueAtTime(2000, now);
    padFilter?.frequency.rampTo(300, 14);

    const phase1Chords = [
      { notes: ["D3", "F3", "A3"], time: 0, dur: 1.2 },
      { notes: ["Db3", "E3", "Ab3"], time: 1.2, dur: 1.3 },
      { notes: ["C3", "Eb3", "G3"], time: 2.5, dur: 1.5 },
    ];
    for (const c of phase1Chords) {
      padSynth.triggerAttackRelease(c.notes, c.dur, now + c.time, 0.35);
    }
  }

  if (arpeggioSynth) {
    const descRun = ["A4", "F4", "D4", "C4", "Bb3", "G3", "F3", "D3"];
    descRun.forEach((note, i) => {
      arpeggioSynth.triggerAttackRelease(note, 0.06, now + 0.2 + i * 0.08, 0.3 - i * 0.025);
    });
  }

  if (bassSynth) {
    bassSynth.triggerAttackRelease("D2", 0.8, now, 0.5);
    bassSynth.triggerAttackRelease("Db2", 0.8, now + 1.2, 0.45);
    bassSynth.triggerAttackRelease("C2", 0.8, now + 2.5, 0.4);
  }

  if (pulseSynth) {
    const pulseHits = [0, 0.25, 0.5, 0.75, 1.1, 1.5, 2.0, 2.6];
    pulseHits.forEach((t, i) => {
      pulseSynth.triggerAttackRelease("D4", 0.03, now + t, 0.3 - i * 0.02);
    });
  }

  // --- Phase 2 (4-8s): Desolation — sustained dark chords, lonely arpeggio fragments ---
  if (padSynth) {
    const phase2Chords = [
      { notes: ["B2", "D3", "F3"], time: 4, dur: 2.5 },
      { notes: ["Bb2", "Db3", "E3"], time: 6.5, dur: 2.0 },
    ];
    for (const c of phase2Chords) {
      padSynth.triggerAttackRelease(c.notes, c.dur, now + c.time, 0.28);
    }
  }

  if (arpeggioSynth) {
    const fragments = [
      { note: "F3", time: 4.5, vel: 0.2 },
      { note: "D3", time: 5.3, vel: 0.18 },
      { note: "Bb2", time: 6.2, vel: 0.15 },
      { note: "F3", time: 7.0, vel: 0.12 },
      { note: "Db3", time: 7.8, vel: 0.1 },
    ];
    for (const f of fragments) {
      arpeggioSynth.triggerAttackRelease(f.note, 0.2, now + f.time, f.vel);
    }
  }

  if (bassSynth) {
    bassSynth.triggerAttackRelease("B1", 1.5, now + 4, 0.4);
    bassSynth.triggerAttackRelease("Bb1", 1.5, now + 6.5, 0.35);
  }

  if (pulseSynth) {
    const slowPulse = [3.5, 4.5, 5.7, 7.0, 8.5];
    slowPulse.forEach((t, i) => {
      pulseSynth.triggerAttackRelease("D4", 0.03, now + t, 0.18 - i * 0.02);
    });
  }

  // --- Phase 3 (8-13s): Dying embers — very slow, quiet, sparse ---
  if (padSynth) {
    padSynth.triggerAttackRelease(["A2", "C3", "E3"], 3.5, now + 8.5, 0.2);
    padSynth.triggerAttackRelease(["D2", "F2", "A2"], 3.0, now + 11, 0.1);
  }

  if (arpeggioSynth) {
    arpeggioSynth.triggerAttackRelease("A2", 0.5, now + 9.5, 0.08);
    arpeggioSynth.triggerAttackRelease("F2", 0.5, now + 11.0, 0.05);
  }

  if (bassSynth) {
    bassSynth.triggerAttackRelease("A1", 2.0, now + 8.5, 0.3);
    bassSynth.triggerAttackRelease("D1", 2.0, now + 11, 0.2);
  }

  if (pulseSynth) {
    pulseSynth.triggerAttackRelease("D3", 0.03, now + 10, 0.08);
    pulseSynth.triggerAttackRelease("D3", 0.03, now + 12, 0.04);
  }

  // --- Fade out (13-15s) ---
  if (masterVol) {
    masterVol.volume.rampTo(-Infinity, 3, now + 12);
  }
}

export function playSuccessEnding(): void {
  if (!T || !initialized || !musicEnabled) return;

  // Stop the looping scheduler immediately
  stopScheduler();
  if (fadeTimeoutId !== null) {
    clearTimeout(fadeTimeoutId);
    fadeTimeoutId = null;
  }
  playing = false;

  if (masterVol) {
    masterVol.volume.cancelScheduledValues(T.now());
    masterVol.volume.value = volumeToDb(musicVolume) - 2;
  }
  if (arpeggioVol) {
    arpeggioVol.volume.cancelScheduledValues(T.now());
    arpeggioVol.volume.value = -4;
  }

  const now = T.now();

  // --- Phase 1 (0-4s): Triumphant key change — D minor resolves to D major ---
  if (padSynth) {
    padFilter?.frequency.cancelScheduledValues(now);
    padFilter?.frequency.setValueAtTime(2000, now);
    padFilter?.frequency.rampTo(8000, 4);

    const phase1Chords = [
      { notes: ["A3", "C#4", "E4"], time: 0, dur: 1.0 },
      { notes: ["D3", "F#3", "A3"], time: 1.0, dur: 1.0 },
      { notes: ["G3", "B3", "D4"], time: 2.0, dur: 1.0 },
      { notes: ["D3", "F#3", "A3", "D4"], time: 3.0, dur: 1.5 },
    ];
    for (const c of phase1Chords) {
      padSynth.triggerAttackRelease(c.notes, c.dur, now + c.time, 0.4);
    }
  }

  if (arpeggioSynth) {
    const ascRun = ["D4", "F#4", "A4", "D5", "F#5", "A5", "D6"];
    ascRun.forEach((note, i) => {
      arpeggioSynth.triggerAttackRelease(note, 0.08, now + 0.1 + i * 0.09, 0.4);
    });
  }

  if (bassSynth) {
    bassSynth.triggerAttackRelease("A1", 0.8, now, 0.5);
    bassSynth.triggerAttackRelease("D2", 0.8, now + 1.0, 0.55);
    bassSynth.triggerAttackRelease("G1", 0.8, now + 2.0, 0.5);
    bassSynth.triggerAttackRelease("D2", 0.8, now + 3.0, 0.6);
  }

  if (pulseSynth) {
    for (let i = 0; i < 8; i++) {
      pulseSynth.triggerAttackRelease("D5", 0.03, now + i * 0.08, 0.35);
    }
    pulseSynth.triggerAttackRelease("D6", 0.2, now + 1.0, 0.5);
  }

  // --- Phase 2 (4-8s): Celebration — joyful arpeggios, bright chords, fanfare ---
  if (padSynth) {
    padFilter?.frequency.rampTo(10000, 4, now + 4);

    const phase2Chords = [
      { notes: ["A3", "D4", "F#4"], time: 4.0, dur: 1.2 },
      { notes: ["B3", "D4", "G4"], time: 5.2, dur: 1.2 },
      { notes: ["A3", "C#4", "E4"], time: 6.4, dur: 0.8 },
      { notes: ["D3", "F#3", "A3", "D4"], time: 7.2, dur: 1.5 },
    ];
    for (const c of phase2Chords) {
      padSynth.triggerAttackRelease(c.notes, c.dur, now + c.time, 0.38);
    }
  }

  if (arpeggioSynth) {
    const run1 = ["A4", "D5", "F#5", "A5"];
    run1.forEach((note, i) => {
      arpeggioSynth.triggerAttackRelease(note, 0.2, now + 4.0 + i * 0.12, 0.35);
    });
    const run2 = ["D5", "F#5", "A5", "D6"];
    run2.forEach((note, i) => {
      arpeggioSynth.triggerAttackRelease(note, 0.2, now + 5.2 + i * 0.12, 0.35);
    });
    const sparkle = ["D6", "A5", "F#5", "D5", "A4", "F#4"];
    sparkle.forEach((note, i) => {
      arpeggioSynth.triggerAttackRelease(note, 0.08, now + 6.4 + i * 0.1, 0.3);
    });
    const finalRun = ["D4", "F#4", "A4", "B4", "D5", "F#5", "A5", "D6"];
    finalRun.forEach((note, i) => {
      arpeggioSynth.triggerAttackRelease(note, 0.08, now + 7.2 + i * 0.08, 0.4);
    });
  }

  if (bassSynth) {
    bassSynth.triggerAttackRelease("D2", 0.8, now + 4.0, 0.55);
    bassSynth.triggerAttackRelease("G1", 0.8, now + 5.2, 0.5);
    bassSynth.triggerAttackRelease("A1", 0.8, now + 6.4, 0.5);
    bassSynth.triggerAttackRelease("D2", 0.8, now + 7.2, 0.6);
  }

  if (pulseSynth) {
    const celebHits = [4.0, 4.3, 4.6, 5.2, 5.5, 5.8, 6.4, 6.7, 7.2, 7.5, 7.8];
    celebHits.forEach((t) => {
      pulseSynth.triggerAttackRelease("D5", 0.03, now + t, 0.3);
    });
  }

  // --- Phase 3 (8-13s): Glorious sustain — warm held chords, gentle arpeggios ---
  if (padSynth) {
    padFilter?.frequency.rampTo(5000, 5, now + 8);
    padSynth.triggerAttackRelease(["D3", "F#3", "A3", "D4"], 2.5, now + 8.5, 0.35);
    padSynth.triggerAttackRelease(["G3", "B3", "D4", "G4"], 2.5, now + 10.5, 0.3);
    padSynth.triggerAttackRelease(["D3", "F#3", "A3", "D4"], 3.0, now + 12, 0.25);
  }

  if (arpeggioSynth) {
    const gentleArp = [
      { note: "D5", time: 8.5, vel: 0.25 },
      { note: "A5", time: 9.0, vel: 0.22 },
      { note: "F#5", time: 9.5, vel: 0.2 },
      { note: "D6", time: 10.0, vel: 0.18 },
      { note: "A5", time: 10.7, vel: 0.16 },
      { note: "D5", time: 11.3, vel: 0.14 },
      { note: "F#5", time: 12.0, vel: 0.11 },
      { note: "A5", time: 12.7, vel: 0.08 },
    ];
    for (const n of gentleArp) {
      arpeggioSynth.triggerAttackRelease(n.note, 0.5, now + n.time, n.vel);
    }
  }

  if (bassSynth) {
    bassSynth.triggerAttackRelease("D2", 1.5, now + 8.5, 0.45);
    bassSynth.triggerAttackRelease("G1", 1.5, now + 10.5, 0.35);
    bassSynth.triggerAttackRelease("D2", 1.5, now + 12, 0.25);
  }

  if (pulseSynth) {
    const restPulse = [8.5, 9.5, 10.7, 12.0];
    restPulse.forEach((t, i) => {
      pulseSynth.triggerAttackRelease("D5", 0.03, now + t, 0.15 - i * 0.03);
    });
  }

  // --- Fade out (13-15s) ---
  if (masterVol) {
    masterVol.volume.rampTo(-Infinity, 3, now + 12);
  }
}

export function updateMusicState(state: MusicState): void {
  if (!playing || !initialized || !T) return;

  const levelProgress = state.winThreshold > 0
    ? state.level / state.winThreshold
    : 0;

  const maxPoints = state.maxPoints > 0 ? state.maxPoints : 1;
  const timeUrgency = 1 - state.potentialPoints / maxPoints;

  let intensity = Math.min(1, Math.max(0,
    levelProgress * 0.6 + timeUrgency * 0.4
  ));

  // Urgency overrides
  if (state.urgency === "critical") intensity = Math.max(intensity, 0.9);
  else if (state.urgency === "danger") intensity = Math.max(intensity, 0.7);
  else if (state.urgency === "warning") intensity = Math.max(intensity, 0.5);

  currentIntensity = intensity;
  applyIntensity(intensity);
}

function applyIntensity(intensity: number): void {
  if (!T) return;
  const rampTime = 2;

  // Tempo: 80 -> 140 BPM — update interval
  const newBpm = 80 + intensity * 60;
  if (Math.abs(newBpm - currentBpm) > 1) {
    currentBpm = newBpm;
    if (schedulerId !== null) {
      startScheduler();
    }
  }

  // Pad filter: 800Hz -> 4000Hz
  if (padFilter) {
    const freq = 800 + intensity * 3200;
    padFilter.frequency.rampTo(freq, rampTime);
  }

  // Arpeggio: silent until intensity > 0.3, then fade in
  if (arpeggioVol) {
    if (intensity < 0.3) {
      arpeggioVol.volume.rampTo(-Infinity, rampTime);
    } else {
      const arpVol = -20 + (intensity - 0.3) * (20 / 0.7);
      arpeggioVol.volume.rampTo(Math.min(arpVol, -2), rampTime);
    }
  }

  // Master volume adjusts slightly with intensity
  if (masterVol) {
    const baseDb = volumeToDb(musicVolume);
    const boost = intensity * 4;
    masterVol.volume.rampTo(baseDb - 12 + boost, rampTime);
  }
}

function volumeToDb(vol: number): number {
  if (vol <= 0) return -Infinity;
  return 20 * Math.log10(vol);
}

export function setMusicEnabled(enabled: boolean): void {
  musicEnabled = enabled;
  if (!enabled && playing) {
    stopMusic(0.5);
  }
}

export function setMusicVolume(vol: number): void {
  musicVolume = Math.max(0, Math.min(1, vol));
  if (playing && masterVol) {
    const baseDb = volumeToDb(musicVolume);
    const boost = currentIntensity * 4;
    masterVol.volume.rampTo(baseDb - 12 + boost, 0.3);
  }
}

export function disposeMusic(): void {
  if (!initialized) return;

  stopScheduler();
  if (fadeTimeoutId !== null) {
    clearTimeout(fadeTimeoutId);
    fadeTimeoutId = null;
  }
  playing = false;

  padSynth?.dispose();
  pulseSynth?.dispose();
  arpeggioSynth?.dispose();
  bassSynth?.dispose();
  padFilter?.dispose();
  masterVol?.dispose();
  arpeggioVol?.dispose();

  padSynth = null;
  pulseSynth = null;
  arpeggioSynth = null;
  bassSynth = null;
  padFilter = null;
  masterVol = null;
  arpeggioVol = null;

  initialized = false;
}

export function isMusicPlaying(): boolean {
  return playing;
}
