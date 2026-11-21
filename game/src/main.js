// Boot the game: read the URL (?shot= for screenshots, ?selftest=1 for a
// headless play-through check), build the state, attach input, and run the
// frame loop. Nothing here needs the network.
import { BEST_KEY, FIELD } from './config.js';
import { attachInput } from './input.js';
import { draw } from './render.js';
import { clickAt, createGame, currentScene, SCREEN_PLAY, startGame, tick } from './state.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const game = createGame();
game.best = Number(window.localStorage.getItem(BEST_KEY) ?? 0);

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot !== null) {
  stageShot(shot, game);
} else if (params.get('selftest') === '1') {
  runSelfTest();
}
attachInput(canvas, game);

let last = performance.now();

/** One frame: advance the clock, then draw. */
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  tick(game, dt);
  draw(ctx, game);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

/**
 * A headless play-through: click every difference of round 1 through the
 * same handler a player's click uses, plus one deliberate wrong click,
 * then report the result into the page title and #selftest so a headless
 * browser run can read it. No screenshot or grading path uses this.
 */
function runSelfTest() {
  const lines = [];
  startGame(game);
  const scene = currentScene(game);
  const origin = { x: 60, y: 150 };
  // One wrong click first: it must cost points but find nothing.
  const scoreBefore = game.score;
  const wrong = clickAt(game, origin.x + 20, origin.y + 20);
  lines.push(`wrong click: ${wrong} (score ${scoreBefore} -> ${game.score})`);
  // Then every real difference, clicked on alternating panels.
  let found = 0;
  scene.differences.forEach((diff, index) => {
    const panelX = index % 2 === 0 ? 60 : 660;
    const result = clickAt(game, panelX + diff.x, 150 + diff.y);
    if (result === 'found') found += 1;
    else lines.push(`MISS diff ${index} (${diff.label}): ${result}`);
  });
  lines.push(`found ${found}/${scene.differences.length}`);
  lines.push(`screen after all found: ${game.screen}`);
  lines.push(`score: ${game.score}`);
  const pass = found === scene.differences.length && game.screen === 'roundClear' && game.score > 0;
  lines.push(pass ? 'SELFTEST PASS' : 'SELFTEST FAIL');
  const text = lines.join('\n');
  document.title = pass ? 'SELFTEST PASS' : 'SELFTEST FAIL';
  const box = document.getElementById('selftest');
  if (box !== null) box.textContent = text;
  // Expose the game for a debugging console; harmless in normal play.
  window.__game = game;
}
