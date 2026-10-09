/**
 * Unit 1 audit fixes: every new variant occurs often enough to be practiced, verify() rejects a
 * corrupted key for each of them, and situations never produce impossible quantities.
 */
import { describe, it, expect } from 'vitest';
import { GENERATORS } from '../../src/content';
import { produceProblem } from '../../src/core/engine/problems';
import type { Difficulty, Problem } from '../../src/core/curriculum/types';
import type { AnswerSpec } from '../../src/core/math/answers';
import { Rational } from '../../src/core/math/rational';

const text = (pr: Problem) => pr.prompt.map((b) => ('text' in b ? b.text : 'tex' in b ? b.tex : '')).join(' | ');

/** A different, wrong key of the same kind. */
function corrupt(a: AnswerSpec): AnswerSpec {
  switch (a.kind) {
    case 'choice':
      return { ...a, correct: a.options.find((o) => o.id !== a.correct)!.id };
    case 'number':
      return { ...a, value: Rational.parse(a.value).add(1).toString() };
    case 'expression':
      return { ...a, value: `${a.value} + 1` };
    case 'solutions':
      return { ...a, values: [...a.values.slice(0, -1), String(Number(a.values[a.values.length - 1]) + 1)] };
    case 'sequence-terms':
      return { ...a, values: [a.values[0], String(Number(a.values[1]) + 1)] };
    case 'interval':
      return { ...a, value: a.value.replace(/-?\d+/, (m) => String(Number(m) + 1)) };
    default:
      throw new Error('unhandled kind ' + a.kind);
  }
}

const VARIANTS: Array<{ gen: string; d: Difficulty; name: string; match: RegExp; min: number }> = [
  { gen: 'u1.parent-functions', d: 1, name: 'cube root equation', match: /sqrt\[3\]/, min: 30 },
  { gen: 'u1.parent-functions', d: 2, name: 'cube root graph', match: /Which parent function is graphed/, min: 200 },
  { gen: 'u1.parent-functions', d: 3, name: 'compare features', match: /Which parent function has this feature/, min: 100 },
  { gen: 'u1.key-features', d: 1, name: 'which graph shows', match: /Which graph shows/, min: 100 },
  { gen: 'u1.key-features', d: 2, name: 'end behavior', match: /End behavior/, min: 60 },
  { gen: 'u1.key-features', d: 3, name: 'max/min on an interval', match: /is used only on the interval/, min: 60 },
  { gen: 'u1.intercepts-context', d: 1, name: 'meaning of a point on a context graph', match: /What does the point/, min: 60 },
  { gen: 'u1.intercepts-context', d: 2, name: 'least whole number of cars', match: /least whole number of cars/, min: 10 },
  { gen: 'u1.write-context', d: 3, name: 'rule from a context graph', match: /The graph shows/, min: 60 },
  { gen: 'u1.domain-range', d: 3, name: 'discrete domain/range', match: /at least 1 and at most/, min: 60 },
  { gen: 'u1.domain-range', d: 3, name: 'set-builder', match: /in set-builder notation/, min: 60 },
  { gen: 'u1.seq-explicit', d: 2, name: 'sequence context formula', match: /theater|bike|Maya|chair/, min: 60 },
  { gen: 'u1.seq-explicit', d: 3, name: 'sequence context term', match: /theater|bike|Maya|chair/, min: 60 },
  { gen: 'u1.seq-recursive', d: 3, name: 'explicit to recursive', match: /Complete its recursive formula/, min: 100 },
  { gen: 'u1.unit-rates', d: 1, name: 'units of a number in a rule', match: /What are the units of the number/, min: 60 },
  { gen: 'u1.unit-rates', d: 2, name: 'area conversion', match: /square [a-z]+\. Convert/, min: 60 },
  { gen: 'u1.linear-model', d: 1, name: 'choosing input and output', match: /Which quantities should be the input/, min: 60 },
];

describe('Unit 1 audit variants', () => {
  for (const v of VARIANTS) {
    it(`${v.gen} d${v.d}: ${v.name} occurs, has zero rejects, and rejects a corrupted key`, () => {
      const gen = GENERATORS.get(v.gen)!;
      let hits = 0;
      let rejects = 0;
      for (let s = 1; s <= 300; s++) {
        const { problem, rejected } = produceProblem(gen, s * 7919 + v.d, v.d);
        if (rejected.length) rejects++;
        if (!v.match.test(text(problem))) continue;
        hits++;
        expect(gen.verify(problem)).toEqual([]);
        expect(gen.verify({ ...problem, answer: corrupt(problem.answer) }).length).toBeGreaterThan(0);
      }
      expect(rejects).toBe(0);
      expect(hits).toBeGreaterThanOrEqual(v.min);
    });
  }

  it('cube root replaces cubic among the parent functions', () => {
    const gen = GENERATORS.get('u1.parent-functions')!;
    for (let s = 1; s <= 300; s++) {
      for (const d of [1, 2, 3] as const) {
        const pr = produceProblem(gen, s * 31 + d, d).problem;
        const labels = pr.answer.kind === 'choice' ? pr.answer.options.map((o) => o.label) : [];
        expect(labels).not.toContain('Cubic');
        expect(text(pr)).not.toMatch(/x\^3/);
      }
    }
  });

  it('draining situations never predict a negative amount, and inputs stay in the situation', () => {
    const gen = GENERATORS.get('u1.linear-model')!;
    for (const d of [1, 2, 3] as const) {
      for (let s = 1; s <= 400; s++) {
        const pr = produceProblem(gen, s * 31 + d, d).problem;
        const t = text(pr);
        if (/profit/.test(t) || pr.answer.kind !== 'number') continue;
        expect(Number(pr.answer.value)).toBeGreaterThanOrEqual(0);
        const target = /= (-?[\d.]+)\$\.?$/.exec(t);
        if (target) expect(Number(target[1])).toBeGreaterThanOrEqual(0);
        const table = pr.prompt.find((b) => b.t === 'table') as { rows: string[][] };
        for (const row of table.rows) expect(Number(row[1])).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('car counts are whole numbers', () => {
    const gen = GENERATORS.get('u1.intercepts-context')!;
    for (const d of [1, 2, 3] as const) {
      for (let s = 1; s <= 400; s++) {
        const pr = produceProblem(gen, s * 13 + d, d).problem;
        if (pr.answer.kind === 'number' && pr.answer.unit === 'cars') expect(Number.isInteger(Number(pr.answer.value))).toBe(true);
      }
    }
  });
});
