import { useSoundStore } from "../stores/soundStore";

type SoundName =
  | "keyPress"
  | "clear"
  | "backspace"
  | "submit"
  | "correct"
  | "wrong"
  | "countdownTick"
  | "countdownGo"
  | "lowTimeWarning"
  | "lowTimeCritical"
  | "timeExpired";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function playTone(
  ac: AudioContext,
  type: OscillatorType,
  freq: number,
  duration: number,
  gain: number,
  startTime: number,
  endFreq?: number,
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (endFreq !== undefined) {
    osc.frequency.linearRampToValueAtTime(endFreq, startTime + duration);
  }
  g.gain.setValueAtTime(gain, startTime);
  g.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

interface NoteStep {
  type: OscillatorType;
  freq: number;
  duration: number;
  gain: number;
  endFreq?: number;
}

function playSequence(ac: AudioContext, notes: NoteStep[], startTime: number) {
  let t = startTime;
  for (const n of notes) {
    playTone(ac, n.type, n.freq, n.duration, n.gain, t, n.endFreq);
    t += n.duration;
  }
}

const soundMap: Record<SoundName, (ac: AudioContext) => void> = {
  keyPress(ac) {
    playTone(ac, "triangle", 800, 0.03, 0.08, ac.currentTime);
  },

  clear(ac) {
    playTone(ac, "sawtooth", 600, 0.12, 0.12, ac.currentTime, 150);
  },

  backspace(ac) {
    playTone(ac, "triangle", 500, 0.04, 0.08, ac.currentTime);
  },

  submit(ac) {
    playTone(ac, "sine", 400, 0.1, 0.15, ac.currentTime, 600);
  },

  correct(ac) {
    // C5 → E5 → G5 ascending chime
    playSequence(
      ac,
      [
        { type: "sine", freq: 523.25, duration: 0.1, gain: 0.18 },
        { type: "sine", freq: 659.25, duration: 0.1, gain: 0.18 },
        { type: "sine", freq: 783.99, duration: 0.1, gain: 0.18 },
      ],
      ac.currentTime,
    );
  },

  wrong(ac) {
    // E4 → C4 descending buzz
    playSequence(
      ac,
      [
        { type: "square", freq: 329.63, duration: 0.16, gain: 0.12 },
        { type: "square", freq: 261.63, duration: 0.16, gain: 0.12 },
      ],
      ac.currentTime,
    );
  },

  countdownTick(ac) {
    playTone(ac, "sine", 880, 0.08, 0.2, ac.currentTime);
  },

  countdownGo(ac) {
    // G5 → C6 bright chime
    playSequence(
      ac,
      [
        { type: "sine", freq: 783.99, duration: 0.1, gain: 0.22 },
        { type: "sine", freq: 1046.5, duration: 0.13, gain: 0.22 },
      ],
      ac.currentTime,
    );
  },

  lowTimeWarning(ac) {
    playTone(ac, "sine", 660, 0.2, 0.15, ac.currentTime);
  },

  lowTimeCritical(ac) {
    // 4 rapid pips
    const t = ac.currentTime;
    for (let i = 0; i < 4; i++) {
      playTone(ac, "triangle", 800, 0.06, 0.15, t + i * 0.09);
    }
  },

  timeExpired(ac) {
    playTone(ac, "sawtooth", 120, 0.6, 0.18, ac.currentTime);
  },
};

export function playSound(name: SoundName) {
  if (!useSoundStore.getState().soundEnabled) return;
  try {
    const ac = getCtx();
    soundMap[name](ac);
  } catch {
    // Silently ignore audio errors
  }
}
