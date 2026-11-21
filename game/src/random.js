// A tiny seeded random generator (mulberry32) plus the small helpers the
// scene painters use, so a round always draws the same picture for a
// given seed — both panels identical except for the differences.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random number in [min, max). */
export function range(rng, min, max) {
  return min + rng() * (max - min);
}

/** One item picked from an array. */
export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}

/** An integer in [min, max] inclusive. */
export function int(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}
