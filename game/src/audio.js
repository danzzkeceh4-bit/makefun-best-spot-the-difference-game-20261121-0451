// All sound is synthesised with WebAudio — no audio files, no network.
// The context is created lazily on the first user gesture, so loading the
// page never needs permission.
let context = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function audio() {
  if (context === null) {
    const AudioContext = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

/** One short oscillator note. */
function note(frequency, seconds, type, gainValue, when = 0) {
  if (muted) return;
  const ctx = audio();
  if (ctx === null) return;
  const start = ctx.currentTime + when;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + seconds + 0.05);
}

/** A soft tick for any click. */
export function playClick() {
  note(660, 0.06, 'sine', 0.08);
}

/** A bright two-note chime when a difference is found. */
export function playFound() {
  note(523.25, 0.14, 'triangle', 0.16);
  note(783.99, 0.22, 'triangle', 0.16, 0.09);
}

/** A low buzz for a wrong click. */
export function playWrong() {
  note(160, 0.18, 'sawtooth', 0.07);
  note(110, 0.22, 'sawtooth', 0.06, 0.05);
}

/** A rising arpeggio when a round is cleared. */
export function playRoundClear() {
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    note(frequency, 0.24, 'triangle', 0.15, index * 0.11);
  });
}

/** A longer fanfare for winning the whole game. */
export function playWin() {
  [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5].forEach((frequency, index) => {
    note(frequency, 0.26, 'triangle', 0.15, index * 0.12);
  });
}

/** A gentle shimmer when a hint is spent. */
export function playHint() {
  note(880, 0.3, 'sine', 0.1);
  note(1174.66, 0.3, 'sine', 0.08, 0.08);
}
