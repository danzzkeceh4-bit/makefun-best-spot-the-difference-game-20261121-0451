// Every tuning number, colour and round definition in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it
// to the window, so no rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

// The two picture panels, side by side, with a gap between them.
export const PANEL = { width: 560, height: 420, y: 150, gap: 40 };
export const PANEL_LEFT = { x: 60, y: PANEL.y };
export const PANEL_RIGHT = { x: 60 + PANEL.width + PANEL.gap, y: PANEL.y };

// How close (in panel pixels) a click must land to a difference to count.
export const HIT_RADIUS = 34;

// Points for one find, and the penalty for a wrong click.
export const POINTS = { find: 100, wrong: 25, hint: 50, timeBonusPerSecond: 5 };

// The three rounds: name, time limit in seconds, and how many differences
// the scene hides. Difficulty rises: more differences, less time.
export const ROUNDS = [
  { key: 'garden', name: 'Ronde 1 — Taman Senja', seconds: 150, diffs: 7 },
  { key: 'beach', name: 'Ronde 2 — Pantai Pagi', seconds: 140, diffs: 8 },
  { key: 'market', name: 'Ronde 3 — Pasar Lampion', seconds: 130, diffs: 9 },
];

export const HINTS_PER_ROUND = 3;

export const PALETTE = {
  backdrop: '#171226',
  panelFrame: '#2e2447',
  panelLabel: '#f5efe0',
  hud: '#f5efe0',
  hudMuted: '#b9aecb',
  accent: '#ffd166',
  good: '#58d68d',
  bad: '#ef5350',
  hint: '#ffd166',
  overlay: 'rgba(12, 8, 24, 0.82)',
  button: '#ffd166',
  buttonText: '#241a08',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'cari-bedanya.best';
