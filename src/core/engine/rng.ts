/** Seeded PRNG (mulberry32). Same seed => same problem, so every attempt can be regenerated for review and audits. */
import type { Rng } from '../curriculum/types';

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  return {
    next,
    int,
    pick: <T>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)],
    nonzeroInt: (min: number, max: number) => {
      for (;;) {
        const v = int(min, max);
        if (v !== 0) return v;
      }
    },
    shuffle: <T>(arr: T[]) => {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    bool: () => next() < 0.5,
  };
}

/** Derive a fresh seed (e.g. for the next problem in a set) deterministically. */
export function deriveSeed(base: number, index: number): number {
  let h = (base ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}
