// Mouse and keyboard input. Pointer coordinates are converted from the
// canvas element's size to the fixed 1280x720 logical field, so clicks
// land on the same spot whatever the window size is.
import { BEST_KEY, FIELD } from './config.js';
import { setMuted } from './audio.js';
import { HINT_BUTTON, MUTE_BUTTON } from './render.js';
import {
  advance,
  clickAt,
  SCREEN_PLAY,
  SCREEN_ROUND_CLEAR,
  SCREEN_TIME_UP,
  SCREEN_TITLE,
  SCREEN_WIN,
  startGame,
  startRound,
  useHint,
} from './state.js';

function toLogical(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * FIELD.width,
    y: ((clientY - rect.top) / rect.height) * FIELD.height,
  };
}

function inside(point, box) {
  return point.x >= box.x && point.x < box.x + box.width && point.y >= box.y && point.y < box.y + box.height;
}

/** Wire the canvas and the keyboard to the game. */
export function attachInput(canvas, game) {
  canvas.addEventListener('pointerdown', (event) => {
    const point = toLogical(canvas, event.clientX, event.clientY);
    if (game.screen === SCREEN_TITLE) {
      startGame(game);
      return;
    }
    if (game.screen === SCREEN_ROUND_CLEAR || game.screen === SCREEN_TIME_UP || game.screen === SCREEN_WIN) {
      if (game.screen === SCREEN_WIN) {
        window.localStorage.setItem(BEST_KEY, String(Math.max(game.best, game.score)));
      }
      advance(game);
      return;
    }
    if (game.screen === SCREEN_PLAY) {
      if (inside(point, HINT_BUTTON)) {
        useHint(game);
        return;
      }
      if (inside(point, MUTE_BUTTON)) {
        game.muted = !game.muted;
        setMuted(game.muted);
        return;
      }
      clickAt(game, point.x, point.y);
    }
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'enter' || key === ' ') {
      if (game.screen === SCREEN_TITLE) startGame(game);
      else if (game.screen === SCREEN_WIN) startGame(game);
      else if (game.screen === SCREEN_ROUND_CLEAR) advance(game);
      event.preventDefault();
    } else if (key === 'h') {
      useHint(game);
    } else if (key === 'n' && game.screen === SCREEN_ROUND_CLEAR) {
      advance(game);
    } else if (key === 'r') {
      if (game.screen === SCREEN_TIME_UP) advance(game);
      else if (game.screen === SCREEN_PLAY) startRound(game, game.roundIndex);
    } else if (key === 'm') {
      game.muted = !game.muted;
      setMuted(game.muted);
    }
  });
}
