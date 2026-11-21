# Cari Bedanya: Senja di Taman Kupu

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/danzzkeceh4-bit/makefun-best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/danzzkeceh4-bit/makefun-best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A make.fun entry for [best-spot-the-difference-game-20261121-0451](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451):
a complete spot-the-difference game that runs in a desktop browser from
static files, with no network request.

## The game

Two near-identical pictures stand side by side. Find every difference —
click it in picture A or picture B — and a green ring marks it on both.
The counter shows how many remain, the timer bar shows how long you have,
and a wrong click costs 25 points.

Three rounds, three original scenes drawn entirely in code (canvas shapes,
no image files):

1. **Taman Senja** — a park at dusk: 7 differences, 150 seconds.
2. **Pantai Pagi** — a beach in the morning: 8 differences, 140 seconds.
3. **Pasar Lampion** — a lantern night market: 9 differences, 130 seconds.

24 differences in all. Each round adds a time bonus for the seconds left
when you clear it. Hints (H, or the button) pulse one unfound difference
for 2.5 seconds and cost 50 points; three per round. Sounds are
synthesised with WebAudio — a chime on each find, a buzz on a wrong click,
a fanfare on the win — and M mutes them.

## How to play

```sh
node serve.ts
# open http://localhost:8080 in desktop Chrome
```

Mouse: click a difference in either picture. Keyboard: H hint, R restart
the round, N next round after clearing one, M mute, Enter start / play
again.

## How it works

`main.ts` (Node 22, standard library only) copies `game/` and
`screenshots/` to the output directory and writes `dossier.json` with the
vendored make.fun library (`vendor/makefun-game.ts`), so two runs always
write the same bytes:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The game is split into files with one clear job each: `config.js` holds
every tuning number, `random.js` the seeded generator, `scenes.js` the
three painters and their differences, `state.js` the rules, `render.js`
everything on screen, `input.js` mouse and keyboard, `audio.js` the
synthesised sounds, `shots.js` the three screenshot scenes, and `main.js`
the boot and frame loop.

## Screenshots

`screenshots/` holds three real renders of the game's own code in a
browser: the title screen, round 2 mid-hunt with four differences found
and marked, and the win screen after all three rounds.
