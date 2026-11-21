// The game's state: which screen is showing, which round is running, what
// has been found, the score and the clock. Pure logic — no drawing here,
// no DOM here. The renderer reads this state; input writes to it.
import { HIT_RADIUS, HINTS_PER_ROUND, PANEL, PANEL_LEFT, PANEL_RIGHT, POINTS, ROUNDS } from './config.js';
import { SCENES } from './scenes.js';
import { playFound, playHint, playRoundClear, playWin, playWrong } from './audio.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_ROUND_CLEAR = 'roundClear';
export const SCREEN_WIN = 'win';
export const SCREEN_TIME_UP = 'timeUp';

export function createGame() {
  return {
    screen: SCREEN_TITLE,
    roundIndex: 0,
    found: new Set(),
    score: 0,
    best: 0,
    timeLeft: ROUNDS[0].seconds,
    hintsLeft: HINTS_PER_ROUND,
    hintAt: null,
    hintUntil: 0,
    wrongAt: null,
    wrongUntil: 0,
    foundFlash: new Map(),
    lastFoundLabel: '',
    lastFoundAt: 0,
    now: 0,
    muted: false,
    startedAt: 0,
  };
}

export function currentRound(game) {
  return ROUNDS[game.roundIndex];
}

export function currentScene(game) {
  return SCENES[currentRound(game).key];
}

export function remaining(game) {
  return currentScene(game).differences.length - game.found.size;
}

export function startGame(game) {
  game.roundIndex = 0;
  game.score = 0;
  game.found = new Set();
  game.hintsLeft = HINTS_PER_ROUND;
  game.hintAt = null;
  game.wrongAt = null;
  game.lastFoundLabel = '';
  game.timeLeft = ROUNDS[0].seconds;
  game.screen = SCREEN_PLAY;
  game.startedAt = game.now;
}

export function startRound(game, roundIndex) {
  game.roundIndex = roundIndex;
  game.found = new Set();
  game.hintsLeft = HINTS_PER_ROUND;
  game.hintAt = null;
  game.wrongAt = null;
  game.lastFoundLabel = '';
  game.timeLeft = ROUNDS[roundIndex].seconds;
  game.screen = SCREEN_PLAY;
}

/** Advance the clock; call once per frame with the elapsed seconds. */
export function tick(game, dt) {
  game.now += dt;
  if (game.screen !== SCREEN_PLAY) return;
  game.timeLeft -= dt;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.screen = SCREEN_TIME_UP;
  }
}

function panelOf(x, y) {
  if (x >= PANEL_LEFT.x && x < PANEL_LEFT.x + PANEL.width && y >= PANEL.y && y < PANEL.y + PANEL.height) {
    return { panel: 0, px: x - PANEL_LEFT.x, py: y - PANEL.y };
  }
  if (x >= PANEL_RIGHT.x && x < PANEL_RIGHT.x + PANEL.width && y >= PANEL.y && y < PANEL.y + PANEL.height) {
    return { panel: 1, px: x - PANEL_RIGHT.x, py: y - PANEL.y };
  }
  return null;
}

/**
 * Handle a click at logical coordinates (x, y). Returns 'found', 'wrong',
 * 'none' or 'ui'. A click on a panel is measured against the differences
 * of the current scene; a click on either panel counts.
 */
export function clickAt(game, x, y) {
  if (game.screen !== SCREEN_PLAY) return 'none';
  const hit = panelOf(x, y);
  if (hit === null) return 'none';
  const { panel, px: panelX, py: panelY } = hit;
  const scene = currentScene(game);
  let bestIndex = -1;
  let bestDistance = Infinity;
  for (let i = 0; i < scene.differences.length; i += 1) {
    if (game.found.has(i)) continue;
    const diff = scene.differences[i];
    const dx = panelX - diff.x;
    const dy = panelY - diff.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }
  if (bestIndex >= 0 && bestDistance <= HIT_RADIUS) {
    game.found.add(bestIndex);
    game.foundFlash.set(bestIndex, game.now);
    game.lastFoundLabel = scene.differences[bestIndex].label;
    game.lastFoundAt = game.now;
    game.score += POINTS.find;
    playFound();
    if (game.found.size === scene.differences.length) {
      const bonus = Math.ceil(game.timeLeft) * POINTS.timeBonusPerSecond;
      game.score += bonus;
      if (game.roundIndex === ROUNDS.length - 1) {
        game.screen = SCREEN_WIN;
        if (game.score > game.best) game.best = game.score;
        playWin();
      } else {
        game.screen = SCREEN_ROUND_CLEAR;
        playRoundClear();
      }
    }
    return 'found';
  }
  game.score = Math.max(0, game.score - POINTS.wrong);
  game.wrongAt = { x: panelX, y: panelY, panel };
  game.wrongUntil = game.now + 0.6;
  playWrong();
  return 'wrong';
}

/** Spend a hint: briefly pulse one difference that is still unfound. */
export function useHint(game) {
  if (game.screen !== SCREEN_PLAY || game.hintsLeft <= 0) return false;
  const scene = currentScene(game);
  const unfound = [];
  for (let i = 0; i < scene.differences.length; i += 1) {
    if (!game.found.has(i)) unfound.push(i);
  }
  if (unfound.length === 0) return false;
  const pick = unfound[Math.floor(Math.random() * unfound.length)];
  game.hintAt = pick;
  game.hintUntil = game.now + 2.5;
  game.hintsLeft -= 1;
  game.score = Math.max(0, game.score - POINTS.hint);
  playHint();
  return true;
}

/** Move on after a cleared round, or restart after time ran out. */
export function advance(game) {
  if (game.screen === SCREEN_ROUND_CLEAR) {
    startRound(game, game.roundIndex + 1);
  } else if (game.screen === SCREEN_TIME_UP) {
    startRound(game, game.roundIndex);
  } else if (game.screen === SCREEN_WIN) {
    startGame(game);
  }
}
