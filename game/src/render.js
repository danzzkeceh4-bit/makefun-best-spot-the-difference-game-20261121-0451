// Everything the player sees: the two picture panels, the markers on the
// differences found, the counter, the timer, and the title / round-clear /
// win / time-up screens. It only reads game state — it never changes it.
import { BEST_KEY, FIELD, FONT, PALETTE, PANEL, PANEL_LEFT, PANEL_RIGHT, POINTS } from './config.js';
import { currentRound, currentScene, remaining, SCREEN_ROUND_CLEAR, SCREEN_TIME_UP, SCREEN_TITLE, SCREEN_WIN } from './state.js';

/** The on-screen hint button (logical coordinates), shared with input. */
export const HINT_BUTTON = { x: 1080, y: 596, width: 140, height: 44 };
export const MUTE_BUTTON = { x: 60, y: 596, width: 140, height: 44 };

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, fill, align = 'left', weight = '600') {
  ctx.fillStyle = fill;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** Draw one picture panel: the scene for this variant, clipped to its frame. */
function drawPanel(ctx, game, variant) {
  const origin = variant === 0 ? PANEL_LEFT : PANEL_RIGHT;
  ctx.save();
  ctx.beginPath();
  ctx.rect(origin.x, origin.y, PANEL.width, PANEL.height);
  ctx.clip();
  ctx.translate(origin.x, origin.y);
  currentScene(game).paint(ctx, variant);
  ctx.restore();
  ctx.strokeStyle = PALETTE.panelFrame;
  ctx.lineWidth = 4;
  ctx.strokeRect(origin.x, origin.y, PANEL.width, PANEL.height);
  circleBadge(ctx, origin.x + 18, origin.y + 18, variant === 0 ? 'A' : 'B');
}

function circleBadge(ctx, x, y, label) {
  ctx.fillStyle = PALETTE.accent;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, label, x, y + 1, 18, '#241a08', 'center', '800');
}

/** A green ring with a check mark, drawn over a found difference. */
function drawFoundMarker(ctx, origin, diff, age) {
  const pulse = age < 0.45 ? 1 + (0.45 - age) * 0.9 : 1;
  const radius = 24 * pulse;
  ctx.strokeStyle = PALETTE.good;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(origin.x + diff.x, origin.y + diff.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(origin.x + diff.x - 11, origin.y + diff.y);
  ctx.lineTo(origin.x + diff.x - 3, origin.y + diff.y + 8);
  ctx.lineTo(origin.x + diff.x + 12, origin.y + diff.y - 9);
  ctx.stroke();
}

/** A dashed gold ring that breathes around the hinted difference. */
function drawHintMarker(ctx, origin, diff, now, until) {
  const phase = (until - now) / 2.5;
  const radius = 26 + Math.sin(now * 6) * 5;
  ctx.save();
  ctx.globalAlpha = 0.45 + 0.55 * phase;
  ctx.strokeStyle = PALETTE.hint;
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 7]);
  ctx.beginPath();
  ctx.arc(origin.x + diff.x, origin.y + diff.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawWrongMarker(ctx, game) {
  if (game.wrongAt === null || game.now >= game.wrongUntil) return;
  const origin = game.wrongAt.panel === 0 ? PANEL_LEFT : PANEL_RIGHT;
  const x = origin.x + game.wrongAt.x;
  const y = origin.y + game.wrongAt.y;
  ctx.strokeStyle = PALETTE.bad;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 12);
  ctx.lineTo(x + 12, y + 12);
  ctx.moveTo(x + 12, y - 12);
  ctx.lineTo(x - 12, y + 12);
  ctx.stroke();
}

function drawHud(ctx, game) {
  const round = currentRound(game);
  text(ctx, 'CARI BEDANYA', 60, 42, 30, PALETTE.hud, 'left', '800');
  text(ctx, round.name, 60, 76, 18, PALETTE.hudMuted);
  text(ctx, `Skor  ${game.score}`, 640, 42, 26, PALETTE.accent, 'center', '800');
  const left = remaining(game);
  const total = currentScene(game).differences.length;
  text(ctx, `Sisa  ${left}  dari  ${total}`, 1220, 42, 26, left === 0 ? PALETTE.good : PALETTE.hud, 'right', '800');
  text(ctx, `Ketemu ${total - left}/${total}`, 1220, 76, 16, PALETTE.hudMuted, 'right');
  // Timer bar.
  const barX = 470;
  const barW = 340;
  const barY = 104;
  const fraction = Math.max(0, game.timeLeft / round.seconds);
  ctx.fillStyle = '#3a3049';
  roundRect(ctx, barX, barY, barW, 16, 8);
  ctx.fill();
  ctx.fillStyle = fraction < 0.16 ? PALETTE.bad : fraction < 0.35 ? PALETTE.accent : PALETTE.good;
  if (fraction > 0) {
    roundRect(ctx, barX, barY, barW * fraction, 16, 8);
    ctx.fill();
  }
  const seconds = Math.ceil(game.timeLeft);
  text(ctx, `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`, 640, 132, 16, PALETTE.hudMuted, 'center');
  // Found toast.
  if (game.lastFoundLabel !== '' && game.now - game.lastFoundAt < 1.6) {
    text(ctx, `Ketemu: ${game.lastFoundLabel}  +${POINTS.find}`, 640, 592, 20, PALETTE.good, 'center', '700');
  }
}

function drawBottomBar(ctx, game) {
  // Hint button.
  ctx.fillStyle = game.hintsLeft > 0 ? PALETTE.button : '#4a4258';
  roundRect(ctx, HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.width, HINT_BUTTON.height, 10);
  ctx.fill();
  text(ctx, `Petunjuk (${game.hintsLeft})  [H]`, HINT_BUTTON.x + HINT_BUTTON.width / 2, HINT_BUTTON.y + 23, 16,
    game.hintsLeft > 0 ? PALETTE.buttonText : '#8b93a3', 'center', '700');
  // Mute button.
  ctx.fillStyle = '#2e2447';
  roundRect(ctx, MUTE_BUTTON.x, MUTE_BUTTON.y, MUTE_BUTTON.width, MUTE_BUTTON.height, 10);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelFrame;
  ctx.lineWidth = 2;
  roundRect(ctx, MUTE_BUTTON.x, MUTE_BUTTON.y, MUTE_BUTTON.width, MUTE_BUTTON.height, 10);
  ctx.stroke();
  text(ctx, game.muted ? 'Suara: mati  [M]' : 'Suara: hidup  [M]', MUTE_BUTTON.x + MUTE_BUTTON.width / 2, MUTE_BUTTON.y + 23, 16, PALETTE.hud, 'center', '700');
  text(ctx, 'Klik perbedaan di gambar A atau B  •  H: petunjuk  •  R: ulangi ronde', 640, 664, 15, PALETTE.hudMuted, 'center');
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = PALETTE.overlay;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  text(ctx, title, 640, 280, 52, accent, 'center', '800');
  lines.forEach((line, index) => {
    text(ctx, line, 640, 350 + index * 34, 22, PALETTE.hud, 'center');
  });
}

function drawTitle(ctx, game) {
  ctx.fillStyle = PALETTE.backdrop;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  // A little preview: the garden scene, dimmed, behind the title.
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.translate(60, 150);
  currentScene(game).paint(ctx, 0);
  ctx.restore();
  ctx.fillStyle = 'rgba(23, 18, 38, 0.55)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  text(ctx, 'CARI BEDANYA', 640, 190, 64, PALETTE.accent, 'center', '800');
  text(ctx, 'Senja di Taman Kupu  •  Tiga ronde, tiga adegan, 24 perbedaan tersembunyi', 640, 250, 24, PALETTE.hud, 'center');
  text(ctx, 'Dua gambar nyaris sama berdampingan. Klik perbedaan yang kamu temukan —', 640, 320, 20, PALETTE.hudMuted, 'center');
  text(ctx, 'di gambar A atau di gambar B. Klik yang salah mengurangi skor. Waktu terus berjalan!', 640, 350, 20, PALETTE.hudMuted, 'center');
  text(ctx, 'Klik atau tekan Enter untuk mulai', 640, 440, 26, PALETTE.good, 'center', '700');
  const best = Number(window.localStorage.getItem(BEST_KEY) ?? 0);
  if (best > 0) text(ctx, `Skor terbaik: ${best}`, 640, 490, 20, PALETTE.accent, 'center', '700');
  text(ctx, 'H: petunjuk  •  M: suara  •  R: ulangi ronde', 640, 560, 17, PALETTE.hudMuted, 'center');
}

/** Draw the whole frame for the current state. */
export function draw(ctx, game) {
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = PALETTE.backdrop;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  if (game.screen === SCREEN_TITLE) {
    drawTitle(ctx, game);
    return;
  }
  drawHud(ctx, game);
  drawPanel(ctx, game, 0);
  drawPanel(ctx, game, 1);
  const scene = currentScene(game);
  for (const index of game.found) {
    const diff = scene.differences[index];
    const age = game.now - (game.foundFlash.get(index) ?? 0);
    drawFoundMarker(ctx, PANEL_LEFT, diff, age);
    drawFoundMarker(ctx, PANEL_RIGHT, diff, age);
  }
  if (game.hintAt !== null && game.now < game.hintUntil) {
    const diff = scene.differences[game.hintAt];
    drawHintMarker(ctx, PANEL_LEFT, diff, game.now, game.hintUntil);
    drawHintMarker(ctx, PANEL_RIGHT, diff, game.now, game.hintUntil);
  }
  drawWrongMarker(ctx, game);
  drawBottomBar(ctx, game);
  if (game.screen === SCREEN_ROUND_CLEAR) {
    const bonus = Math.ceil(game.timeLeft) * POINTS.timeBonusPerSecond;
    overlay(ctx, 'Ronde selesai!', [
      `Semua ${scene.differences.length} perbedaan ketemu. Bonus waktu: +${bonus}`,
      `Skor: ${game.score}`,
      'Klik atau tekan N untuk ronde berikutnya',
    ], PALETTE.good);
  } else if (game.screen === SCREEN_WIN) {
    overlay(ctx, 'KAMU MENANG!', [
      `Semua 24 perbedaan ketemu. Skor akhir: ${game.score}`,
      `Skor terbaik: ${Math.max(game.best, game.score)}`,
      'Klik atau tekan Enter untuk main lagi',
    ], PALETTE.accent);
  } else if (game.screen === SCREEN_TIME_UP) {
    const total = scene.differences.length;
    overlay(ctx, 'Waktu habis!', [
      `Kamu menemukan ${total - remaining(game)} dari ${total} perbedaan di ronde ini.`,
      `Skor: ${game.score}`,
      'Klik atau tekan R untuk mencoba ronde ini lagi',
    ], PALETTE.bad);
  }
}
