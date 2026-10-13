import { describe, it, expect } from 'vitest';
import { ALL_GENERATORS, GENERATORS } from '../../src/content';
import { leaksAnswer, produceProblem, validateProblem } from '../../src/core/engine/problems';
import { createRng } from '../../src/core/engine/rng';
import type { Difficulty } from '../../src/core/curriculum/types';

const num = (value: string) => ({ kind: 'number' as const, value });

describe('leaksAnswer (hints must not state the answer)', () => {
  it('catches a bound that is the answer, in TeX or Unicode, at the end of a sentence', () => {
    expect(leaksAnswer('The count condition becomes $1 + y \\le 103$, so $y \\le 102$.', num('102'))).toBe(true);
    expect(leaksAnswer('so $y \\geq 7$', num('7'))).toBe(true);
    expect(leaksAnswer('so y ≤ 102 tickets', num('102'))).toBe(true);
    expect(leaksAnswer('so $x > -3$.', num('-3'))).toBe(true);
    expect(leaksAnswer('$x \\ne 4$', num('4'))).toBe(true);
    expect(leaksAnswer('$-2 + 2 = 0$.', num('0'))).toBe(true);
    expect(leaksAnswer('So the greatest number is 102.', num('102'))).toBe(true);
    expect(leaksAnswer('the answer is $12$', num('12'))).toBe(true);
  });
  it('does not flag other numbers or expressions that only start with the key', () => {
    expect(leaksAnswer('$y \\le 3x + 2$', num('3'))).toBe(false);
    expect(leaksAnswer('$y \\le 102.5$', num('102'))).toBe(false);
    expect(leaksAnswer('$y \\le 1020$', num('102'))).toBe(false);
    expect(leaksAnswer('$x = 102$', num('102'))).toBe(false); // an input being assigned
    expect(leaksAnswer('$x^{a} \\cdot x^{a} = x^{2a}$', { kind: 'expression', value: 'x' })).toBe(false);
    expect(leaksAnswer('Subtract $32$ from both sides to get a bound on $y$.', num('3'))).toBe(false);
  });
});

describe('u2.max-in-context hints stop before the bound', () => {
  it('no hint (problem or step) states the bound that is the answer, 600 problems', () => {
    const g = GENERATORS.get('u2.max-in-context')!;
    for (const d of [1, 2, 3] as const) {
      for (let s = 1; s <= 200; s++) {
        const p = g.generate(createRng(s * 1543 + d), d);
        const key = p.answer.kind === 'number' ? p.answer.value : null;
        if (key === null) continue;
        for (const h of p.hints) {
          expect(h).not.toMatch(new RegExp(`y \\\\(le|ge) ${key}\\$`));
          expect(leaksAnswer(h, p.answer)).toBe(false);
        }
      }
    }
  });
});

describe('every generator: hints rarely collide with the answer', () => {
  // A hint that states the answer makes the problem rejected (another seed is used). A collision
  // that happens by coincidence of numbers is rare; a hint written to give the answer would be
  // rejected far more often, so any generator above 10% has a hint to rewrite.
  it('raw leak rate per generator is at most 10%', { timeout: 300_000 }, () => {
    const bad: string[] = [];
    for (const g of ALL_GENERATORS) {
      let n = 0;
      let leaks = 0;
      for (const d of [1, 2, 3] as Difficulty[]) {
        for (let s = 1; s <= 30; s++) {
          let p;
          try {
            p = g.generate(createRng(s * 7919 + d), d);
          } catch {
            continue;
          }
          n++;
          const errs = validateProblem({ ...p, generatorId: g.id, difficulty: d }, g).filter((e) => /states the|reveals the answer/.test(e));
          if (errs.length) leaks++;
        }
      }
      if (n && leaks / n > 0.1) bad.push(`${g.id}: ${leaks}/${n}`);
    }
    expect(bad).toEqual([]);
  });
  it('every generator still produces a problem at every difficulty', () => {
    for (const g of ALL_GENERATORS) for (const d of [1, 2, 3] as Difficulty[]) expect(() => produceProblem(g, 4242 + d, d)).not.toThrow();
  });
});
