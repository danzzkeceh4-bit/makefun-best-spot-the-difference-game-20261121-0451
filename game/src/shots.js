// The screenshot scenes behind ?shot=start|play|end. Each one puts the
// real game into a real state — the same state a player reaches by playing
// — and leaves it there for the browser to render, so every screenshot is
// an honest frame of the game itself. The seed is fixed, so the same shot
// always gives the same frame.
import { ROUNDS } from './config.js';
import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, startGame } from './state.js';

/**
 * Set `game` to the named scene (start, play or end; any other name is
 * start) and return the screen to show.
 */
export function stageShot(name, game) {
  if (name === 'play') {
    // Round 2, mid-hunt: four of eight differences already found, the
    // markers on, several still unfound, the counter showing 4 left.
    startGame(game);
    game.roundIndex = 1;
    game.found = new Set([0, 2, 4, 6]);
    game.timeLeft = 87;
    game.score = 400;
    game.hintsLeft = 2;
    game.screen = SCREEN_PLAY;
    for (const index of game.found) game.foundFlash.set(index, -10);
    return SCREEN_PLAY;
  }
  if (name === 'end') {
    // The win screen after all three rounds, with the final score.
    startGame(game);
    game.roundIndex = ROUNDS.length - 1;
    game.found = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    game.score = 3140;
    game.best = 3140;
    game.timeLeft = 41;
    game.screen = SCREEN_WIN;
    return SCREEN_WIN;
  }
  // Start: the title screen over a dimmed garden preview.
  game.screen = SCREEN_TITLE;
  return SCREEN_TITLE;
}
