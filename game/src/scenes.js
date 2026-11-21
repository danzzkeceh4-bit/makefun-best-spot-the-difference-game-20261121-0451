// The three scenes. Every scene paints one 560x420 picture and hides its
// differences in plain sight: each difference is a small detail that the
// painter draws one way in variant 0 (the left picture) and another way
// in variant 1 (the right picture). The base of the picture is identical
// in both variants, so the two panels only ever differ where a listed
// difference says so. All art is drawn with canvas shapes — no images,
// no files, nothing borrowed.
import { mulberry32, range } from './random.js';

export const PANEL_W = 560;
export const PANEL_H = 420;

function circle(ctx, x, y, radius, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function star(ctx, x, y, radius, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? radius : radius * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function cloud(ctx, x, y, scale, fill) {
  circle(ctx, x, y, 18 * scale, fill);
  circle(ctx, x + 20 * scale, y - 8 * scale, 22 * scale, fill);
  circle(ctx, x + 44 * scale, y, 18 * scale, fill);
  circle(ctx, x + 22 * scale, y + 8 * scale, 20 * scale, fill);
}

function bird(ctx, x, y, scale, stroke) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.5 * scale;
  ctx.beginPath();
  ctx.arc(x - 8 * scale, y, 8 * scale, Math.PI * 1.15, Math.PI * 1.85);
  ctx.arc(x + 8 * scale, y, 8 * scale, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

function flower(ctx, x, y, petal, centre) {
  for (let i = 0; i < 5; i += 1) {
    const a = (i * Math.PI * 2) / 5;
    circle(ctx, x + Math.cos(a) * 7, y + Math.sin(a) * 7, 5, petal);
  }
  circle(ctx, x, y, 5, centre);
}

function duck(ctx, x, y, scale) {
  ellipse(ctx, x, y, 16 * scale, 10 * scale, '#f7d154');
  circle(ctx, x + 13 * scale, y - 8 * scale, 8 * scale, '#f7d154');
  poly(ctx, [[x + 20 * scale, y - 9 * scale], [x + 27 * scale, y - 6 * scale], [x + 20 * scale, y - 5 * scale]], '#f08a24');
  circle(ctx, x + 15 * scale, y - 10 * scale, 1.8 * scale, '#222');
}

function cat(ctx, x, y, scale, fill) {
  ellipse(ctx, x, y, 16 * scale, 11 * scale, fill);
  circle(ctx, x + 13 * scale, y - 10 * scale, 9 * scale, fill);
  poly(ctx, [[x + 7 * scale, y - 17 * scale], [x + 10 * scale, y - 25 * scale], [x + 13 * scale, y - 17 * scale]], fill);
  poly(ctx, [[x + 14 * scale, y - 18 * scale], [x + 18 * scale, y - 25 * scale], [x + 20 * scale, y - 17 * scale]], fill);
  ctx.strokeStyle = fill;
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.arc(x - 14 * scale, y - 2 * scale, 8 * scale, Math.PI * 0.9, Math.PI * 1.9);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Round 1 — Taman Senja (a park at dusk). 7 differences.
// ---------------------------------------------------------------------------
function paintGardenBase(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, 240);
  sky.addColorStop(0, '#5b4a8a');
  sky.addColorStop(0.55, '#d96a5f');
  sky.addColorStop(1, '#ffc46b');
  rect(ctx, 0, 0, PANEL_W, 250, '#000');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 250);
  cloud(ctx, 90, 55, 1, 'rgba(255, 225, 200, 0.85)');
  cloud(ctx, 330, 40, 0.8, 'rgba(255, 225, 200, 0.7)');
  ellipse(ctx, 110, 300, 330, 120, '#5d8a4a');
  ellipse(ctx, 480, 310, 300, 130, '#4c7a3e');
  rect(ctx, 0, 300, PANEL_W, 120, '#6fa055');
  // Winding path.
  ctx.fillStyle = '#e8d3a0';
  ctx.beginPath();
  ctx.moveTo(250, 420);
  ctx.quadraticCurveTo(270, 330, 300, 300);
  ctx.quadraticCurveTo(320, 280, 330, 260);
  ctx.lineTo(360, 260);
  ctx.quadraticCurveTo(350, 290, 330, 330);
  ctx.quadraticCurveTo(310, 380, 320, 420);
  ctx.closePath();
  ctx.fill();
  // Pond.
  ellipse(ctx, 440, 355, 95, 32, '#4f9fd8');
  ellipse(ctx, 440, 352, 80, 24, '#6db7e8');
  // Big tree on the left.
  rect(ctx, 82, 190, 16, 110, '#7a4a2b');
  circle(ctx, 90, 160, 62, '#3f7a34');
  circle(ctx, 50, 185, 42, '#4c8a3e');
  circle(ctx, 130, 185, 44, '#35702c');
  // Bench.
  rect(ctx, 225, 295, 70, 8, '#8a5a2b');
  rect(ctx, 225, 278, 70, 8, '#8a5a2b');
  rect(ctx, 230, 295, 6, 26, '#5e3a1a');
  rect(ctx, 284, 295, 6, 26, '#5e3a1a');
  // Flower bed along the bottom.
  for (let i = 0; i < 9; i += 1) {
    const x = 30 + i * 26;
    rect(ctx, x + 5, 398, 3, 14, '#2f6b25');
    flower(ctx, x + 6, 396, '#ffd94d', '#c96a1e');
  }
  flower(ctx, 400, 392, '#ffd94d', '#c96a1e');
  rect(ctx, 400, 398, 3, 14, '#2f6b25');
}

function paintGardenDiff(ctx, index, variant) {
  if (index === 0) {
    // The sun: shining in the left picture, gone in the right one.
    if (variant === 0) {
      circle(ctx, 470, 70, 34, '#ffe08a');
      circle(ctx, 470, 70, 26, '#ffdf6b');
    }
  } else if (index === 1) {
    // Birds in the sky: three on the left, two on the right.
    bird(ctx, 180, 60, 1, '#3a2b4d');
    bird(ctx, 230, 85, 0.9, '#3a2b4d');
    if (variant === 0) bird(ctx, 300, 58, 1, '#3a2b4d');
  } else if (index === 2) {
    // Apples on the tree: four on the left, three on the right.
    circle(ctx, 62, 150, 6, '#e23b3b');
    circle(ctx, 108, 138, 6, '#e23b3b');
    circle(ctx, 132, 172, 6, '#e23b3b');
    if (variant === 0) circle(ctx, 78, 182, 6, '#e23b3b');
  } else if (index === 3) {
    // Ducks on the pond: two on the left, three on the right.
    duck(ctx, 410, 352, 1);
    duck(ctx, 452, 362, 0.9);
    if (variant === 1) duck(ctx, 490, 350, 0.85);
  } else if (index === 4) {
    // A grey cat napping on the bench — only in the left picture.
    if (variant === 0) cat(ctx, 258, 272, 0.9, '#8d8d9e');
  } else if (index === 5) {
    // One red flower among the yellow ones — only in the left picture.
    if (variant === 0) flower(ctx, 190, 396, '#e23b3b', '#7a1d1d');
  } else if (index === 6) {
    // A butterfly resting on a flower — only in the left picture.
    if (variant === 0) {
      ellipse(ctx, 404, 384, 8, 5, '#ff8fd0');
      ellipse(ctx, 404, 392, 8, 5, '#ff8fd0');
      circle(ctx, 404, 388, 2, '#333');
    }
  }
}

const GARDEN_DIFFS = [
  { x: 470, y: 70, label: 'Matahari' },
  { x: 300, y: 58, label: 'Burung ketiga' },
  { x: 78, y: 182, label: 'Apel keempat' },
  { x: 490, y: 350, label: 'Bebek ketiga' },
  { x: 258, y: 272, label: 'Kucing di bangku' },
  { x: 190, y: 396, label: 'Bunga merah' },
  { x: 404, y: 388, label: 'Kupu-kupu' },
];

// ---------------------------------------------------------------------------
// Round 2 — Pantai Pagi (a beach in the morning). 8 differences.
// ---------------------------------------------------------------------------
function paintBeachBase(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, 160);
  sky.addColorStop(0, '#7ec8f2');
  sky.addColorStop(1, '#dff3ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 160);
  circle(ctx, 90, 70, 30, '#fff3a0');
  circle(ctx, 90, 70, 22, '#ffe45c');
  cloud(ctx, 200, 50, 1, '#ffffff');
  cloud(ctx, 420, 80, 0.8, '#ffffff');
  // Sea.
  rect(ctx, 0, 160, PANEL_W, 100, '#2f8fd0');
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(20 + i * 40, 185 + i * 18);
    ctx.quadraticCurveTo(90 + i * 40, 175 + i * 18, 160 + i * 40, 185 + i * 18);
    ctx.stroke();
  }
  // Boat.
  poly(ctx, [[350, 215], [430, 215], [415, 238], [365, 238]], '#8a4a2b');
  rect(ctx, 388, 150, 5, 66, '#5e3a1a');
  // Sand.
  rect(ctx, 0, 260, PANEL_W, 160, '#f2dd9e');
  ellipse(ctx, 120, 410, 200, 26, '#e8cf8a');
  // Palm tree on the right.
  ctx.strokeStyle = '#7a4a2b';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(495, 330);
  ctx.quadraticCurveTo(480, 260, 490, 205);
  ctx.stroke();
  ctx.strokeStyle = '#2f8a3a';
  ctx.lineWidth = 9;
  for (let i = 0; i < 5; i += 1) {
    const a = Math.PI * (0.15 + i * 0.18);
    ctx.beginPath();
    ctx.moveTo(490, 205);
    ctx.quadraticCurveTo(490 + Math.cos(a) * 55, 205 - Math.sin(a) * 40, 490 + Math.cos(a) * 80, 205 - Math.sin(a) * 18 + 18);
    ctx.stroke();
  }
  // Umbrella.
  ctx.strokeStyle = '#7a6a55';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(130, 300);
  ctx.lineTo(130, 380);
  ctx.stroke();
  // Bucket and spade.
  poly(ctx, [[205, 350], [235, 350], [230, 380], [210, 380]], '#e2574c');
  rect(ctx, 205, 346, 30, 6, '#c74338');
  ctx.strokeStyle = '#4a7a9e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(245, 352);
  ctx.lineTo(258, 382);
  ctx.stroke();
  poly(ctx, [[252, 380], [266, 380], [259, 394]], '#4a7a9e');
}

function paintBeachDiff(ctx, index, variant) {
  if (index === 0) {
    // The boat's sail: red on the left, blue on the right.
    poly(ctx, [[393, 152], [393, 212], [432, 212]], variant === 0 ? '#e23b3b' : '#2f6fd0');
  } else if (index === 1) {
    // Umbrella stripes: five on the left, four on the right.
    const colours = ['#e2574c', '#ffd94d', '#e2574c', '#ffd94d', '#e2574c'];
    for (let i = 0; i < 5; i += 1) {
      if (variant === 1 && i === 4) break;
      poly(ctx, [[130 - 55 + i * 22, 300], [130 - 55 + (i + 1) * 22, 300], [130, 262]], colours[i]);
    }
    circle(ctx, 130, 260, 5, '#8a5a2b');
  } else if (index === 2) {
    // A starfish on the sand — only in the left picture.
    if (variant === 0) star(ctx, 300, 382, 14, '#ff8a5c');
  } else if (index === 3) {
    // Coconuts under the palm: three on the left, two on the right.
    circle(ctx, 468, 332, 9, '#6b4a2f');
    circle(ctx, 488, 336, 9, '#6b4a2f');
    if (variant === 0) circle(ctx, 505, 330, 9, '#6b4a2f');
  } else if (index === 4) {
    // A little red crab — only in the left picture.
    if (variant === 0) {
      ellipse(ctx, 90, 392, 14, 9, '#e2574c');
      circle(ctx, 78, 384, 4, '#e2574c');
      circle(ctx, 102, 384, 4, '#e2574c');
      ctx.strokeStyle = '#e2574c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(78, 398);
      ctx.lineTo(70, 406);
      ctx.moveTo(102, 398);
      ctx.lineTo(110, 406);
      ctx.stroke();
    }
  } else if (index === 5) {
    // Clouds: three on the left, two on the right.
    if (variant === 0) cloud(ctx, 300, 110, 0.7, '#ffffff');
  } else if (index === 6) {
    // Shells on the sand: four on the left, three on the right.
    for (let i = 0; i < 3; i += 1) {
      const x = 400 + i * 26;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, 396, 8, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#d98a8a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 5, 396);
      ctx.lineTo(x, 388);
      ctx.lineTo(x + 5, 396);
      ctx.stroke();
    }
    if (variant === 0) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(340, 396, 8, Math.PI, 0);
      ctx.fill();
    }
  } else if (index === 7) {
    // Footprints in the sand — only in the left picture.
    if (variant === 0) {
      ctx.fillStyle = 'rgba(150, 110, 60, 0.7)';
      for (let i = 0; i < 4; i += 1) {
        ellipse(ctx, 330 + i * 14, 330 + (i % 2 === 0 ? 0 : 8), 6, 9, 'rgba(150, 110, 60, 0.7)');
      }
    }
  }
}

const BEACH_DIFFS = [
  { x: 410, y: 182, label: 'Warna layar perahu' },
  { x: 130, y: 285, label: 'Garis payung' },
  { x: 300, y: 382, label: 'Bintang laut' },
  { x: 505, y: 330, label: 'Kelapa ketiga' },
  { x: 90, y: 392, label: 'Kepiting' },
  { x: 300, y: 110, label: 'Awan ketiga' },
  { x: 340, y: 396, label: 'Kerang keempat' },
  { x: 356, y: 334, label: 'Jejak kaki' },
];

// ---------------------------------------------------------------------------
// Round 3 — Pasar Lampion (a lantern night market). 9 differences.
// ---------------------------------------------------------------------------
function paintMarketBase(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, 200);
  sky.addColorStop(0, '#141a3a');
  sky.addColorStop(1, '#3a2a5e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 210);
  const rng = mulberry32(20261121);
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 26; i += 1) {
    circle(ctx, range(rng, 10, 550), range(rng, 8, 150), range(rng, 1, 2.2), '#fff');
  }
  // String of lanterns across the top.
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 30);
  ctx.quadraticCurveTo(280, 62, 560, 30);
  ctx.stroke();
  // Ground.
  rect(ctx, 0, 330, PANEL_W, 90, '#4a3a55');
  rect(ctx, 0, 330, PANEL_W, 8, '#5d4a6e');
  // Left stall: fruit.
  rect(ctx, 60, 210, 150, 120, '#6b3a2a');
  poly(ctx, [[50, 210], [220, 210], [205, 165], [65, 165]], '#c0392b');
  for (let i = 0; i < 5; i += 1) {
    rect(ctx, 62 + i * 30, 165, 28, 45, i % 2 === 0 ? '#e8e0d0' : '#c0392b');
  }
  rect(ctx, 70, 240, 130, 8, '#8a5a2b');
  // Fruit pile on the counter.
  for (let i = 0; i < 4; i += 1) circle(ctx, 95 + i * 26, 232, 11, '#f08a24');
  for (let i = 0; i < 3; i += 1) circle(ctx, 108 + i * 26, 214, 11, '#f08a24');
  // Right stall: cloth and pots.
  rect(ctx, 350, 210, 150, 120, '#2a4a5e');
  poly(ctx, [[340, 210], [510, 210], [495, 165], [355, 165]], '#1f8a70');
  for (let i = 0; i < 5; i += 1) {
    rect(ctx, 352 + i * 30, 165, 28, 45, i % 2 === 0 ? '#e8e0d0' : '#1f8a70');
  }
  rect(ctx, 360, 240, 130, 8, '#8a5a2b');
  for (let i = 0; i < 3; i += 1) {
    ellipse(ctx, 385 + i * 40, 228, 16, 12, '#b5651d');
    ellipse(ctx, 385 + i * 40, 222, 12, 6, '#d98a4a');
  }
  // Vendor behind the right stall.
  circle(ctx, 425, 195, 16, '#f2c9a0');
  poly(ctx, [[405, 240], [445, 240], [438, 205], [412, 205]], '#3a6ea8');
  // Basket on the ground, left.
  ellipse(ctx, 95, 372, 26, 16, '#8a6a3a');
  rect(ctx, 72, 356, 46, 8, '#6b4a2f');
  // Bunting flags between the stalls.
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(220, 120);
  ctx.quadraticCurveTo(280, 145, 340, 120);
  ctx.stroke();
}

function paintMarketDiff(ctx, index, variant) {
  if (index === 0) {
    // The moon: a crescent on the left, full on the right.
    if (variant === 0) {
      circle(ctx, 480, 60, 22, '#ffe9a8');
      circle(ctx, 488, 54, 19, '#3a2a5e');
    } else {
      circle(ctx, 480, 60, 22, '#ffe9a8');
    }
  } else if (index === 1) {
    // Lanterns on the string: one burns red on the left, yellow on the right.
    const spots = [70, 140, 210, 280, 350, 420, 490];
    spots.forEach((x, i) => {
      const t = (x - 0) / 560;
      const y = 30 + 4 * 62 * t * (1 - t) * 1.0 + 8;
      const yy = 30 + Math.sin((x / 560) * Math.PI) * 24;
      void y;
      circle(ctx, x, yy + 12, 9, i === 3 && variant === 0 ? '#ff5a4e' : '#ffd166');
      rect(ctx, x - 2, yy + 2, 4, 4, '#8a6a3a');
    });
  } else if (index === 2) {
    // The left stall's sign: a star on the left, a crescent on the right.
    circle(ctx, 135, 150, 13, '#ffd166');
    if (variant === 0) star(ctx, 135, 150, 8, '#7a1d1d');
    else {
      circle(ctx, 135, 150, 7, '#7a1d1d');
      circle(ctx, 138, 147, 6, '#ffd166');
    }
  } else if (index === 3) {
    // Oranges on the counter: five on the left, four on the right.
    if (variant === 0) circle(ctx, 190, 214, 11, '#f08a24');
  } else if (index === 4) {
    // A black cat on the right stall's roof — only in the left picture.
    if (variant === 0) cat(ctx, 430, 160, 0.8, '#22222e');
  } else if (index === 5) {
    // Bunting flags: five on the left, four on the right.
    const colours = ['#ff5a4e', '#ffd166', '#58d68d', '#4fc3f7', '#c58aff'];
    for (let i = 0; i < 5; i += 1) {
      if (variant === 1 && i === 2) continue;
      const x = 232 + i * 27;
      const y = 120 + Math.sin(((x - 220) / 120) * Math.PI) * 18;
      poly(ctx, [[x - 10, y], [x + 10, y], [x, y + 18]], colours[i]);
    }
  } else if (index === 6) {
    // The vendor's hat: red on the left, green on the right.
    poly(ctx, [[408, 182], [442, 182], [425, 162]], variant === 0 ? '#c0392b' : '#2f8a3a');
    circle(ctx, 425, 182, 17, variant === 0 ? '#c0392b' : '#2f8a3a');
  } else if (index === 7) {
    // Baskets on the ground: two on the left, one on the right.
    if (variant === 0) {
      ellipse(ctx, 155, 378, 22, 13, '#8a6a3a');
      rect(ctx, 136, 364, 38, 7, '#6b4a2f');
    }
  } else if (index === 8) {
    // A puddle catching the lantern light — only in the left picture.
    if (variant === 0) ellipse(ctx, 270, 392, 46, 10, 'rgba(255, 209, 102, 0.5)');
  }
}

const MARKET_DIFFS = [
  { x: 480, y: 60, label: 'Bulan sabit' },
  { x: 280, y: 66, label: 'Lampion merah' },
  { x: 135, y: 150, label: 'Tanda di papan' },
  { x: 190, y: 214, label: 'Jeruk kelima' },
  { x: 430, y: 160, label: 'Kucing di atap' },
  { x: 286, y: 138, label: 'Bendera hilang' },
  { x: 425, y: 172, label: 'Topi penjual' },
  { x: 155, y: 378, label: 'Keranjang kedua' },
  { x: 270, y: 392, label: 'Genangan air' },
];

// ---------------------------------------------------------------------------
// Public surface: one entry per round key.
// ---------------------------------------------------------------------------
export const SCENES = {
  garden: {
    paint(ctx, variant) {
      paintGardenBase(ctx);
      for (let i = 0; i < GARDEN_DIFFS.length; i += 1) paintGardenDiff(ctx, i, variant);
    },
    differences: GARDEN_DIFFS,
  },
  beach: {
    paint(ctx, variant) {
      paintBeachBase(ctx);
      for (let i = 0; i < BEACH_DIFFS.length; i += 1) paintBeachDiff(ctx, i, variant);
    },
    differences: BEACH_DIFFS,
  },
  market: {
    paint(ctx, variant) {
      paintMarketBase(ctx);
      for (let i = 0; i < MARKET_DIFFS.length; i += 1) paintMarketDiff(ctx, i, variant);
    },
    differences: MARKET_DIFFS,
  },
};
