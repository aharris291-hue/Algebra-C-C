import { describe, it, expect } from 'vitest';
import { stressGenerator } from './harness';
import { U2_GENERATORS_UNDER_TEST } from './u2-list';
import { produceProblem } from '../../src/core/engine/problems';
import { createRng } from '../../src/core/engine/rng';
import { Rational } from '../../src/core/math/rational';
import type { Difficulty, GeneratorDef, Problem } from '../../src/core/curriculum/types';

/** Change the answer key so it is wrong (a different choice, a shifted number or expression, a flipped symbol). */
function corrupt(answer: Problem['answer']): Problem['answer'] | null {
  const a = JSON.parse(JSON.stringify(answer));
  if (a.kind === 'number') a.value = Rational.parse(a.value).add(Rational.from(1)).toString();
  else if (a.kind === 'choice') a.correct = a.options.find((o: { id: string }) => o.id !== a.correct).id;
  else if (a.kind === 'expression') a.value = `(${a.value})+1`;
  else if (a.kind === 'inequality') {
    const flip: Record<string, string> = { '<=': '>', '>=': '<', '<': '>=', '>': '<=' };
    a.value = a.value.replace(/<=|>=|<|>/, (m: string) => flip[m]);
  } else return null;
  return a;
}

/** Problems from a generator at one difficulty whose prompt text matches a pattern. */
function sample(gen: GeneratorDef, d: Difficulty, re: RegExp, seeds = 300): Problem[] {
  const out: Problem[] = [];
  for (let s = 1; s <= seeds; s++) {
    const pr = gen.generate(createRng(s * 7919 + d), d);
    const text = pr.prompt.map((b) => (b.t === 'p' ? b.text : b.t === 'math' ? b.tex : b.t === 'graph' ? `[graph ${b.caption ?? ''}]` : '')).join(' ');
    if (re.test(text)) out.push(pr);
  }
  return out;
}


describe('Unit 2 generators', () => {
  for (const gen of U2_GENERATORS_UNDER_TEST) {
    it(`${gen.id} produces verified problems across 900 variations`, () => {
      const { rejectRate, reasons } = stressGenerator(gen, 300);
      if (rejectRate >= 0.2) console.log(gen.id, rejectRate, [...reasons.entries()].slice(0, 5));
      expect(rejectRate).toBeLessThan(0.2);
    });
  }
  it('generator ids are unique', () => {
    const ids = U2_GENERATORS_UNDER_TEST.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Unit 2 verify() catches wrong answer keys', () => {
  for (const gen of U2_GENERATORS_UNDER_TEST) {
    it(`${gen.id} rejects a corrupted key`, () => {
      let tried = 0;
      let caught = 0;
      for (const d of [1, 2, 3] as const)
        for (let s = 1; s <= 40; s++) {
          const pr = gen.generate(createRng(s * 31 + d), d);
          if (gen.verify(pr).length) continue;
          const bad = corrupt(pr.answer);
          if (!bad) continue;
          tried++;
          if (gen.verify({ ...pr, answer: bad }).length > 0) caught++;
        }
      expect(caught).toBe(tried);
    });
  }
});

describe('Unit 2 audit variants occur, verify, and reject corrupted keys', () => {
  const cases: Array<[string, Difficulty, RegExp, number, string]> = [
    ['u2.system-test', 2, /^Which graph shows the solution region of this system/, 40, 'which-graph system (bare)'],
    ['u2.system-test', 3, /Which graph shows the solution region for this situation/, 40, 'which-graph system (context, labeled axes)'],
    ['u2.max-in-context', 2, /Which corner point of the solution region gives the \*\*greatest\*\* profit/, 40, 'corner point choice'],
    ['u2.max-in-context', 3, /What is the \*\*greatest\*\* profit possible/, 60, 'greatest profit'],
  ];
  for (const [id, d, re, min, name] of cases) {
    it(`${id} d${d}: ${name}`, () => {
      const gen = U2_GENERATORS_UNDER_TEST.find((g) => g.id === id)!;
      const probs = sample(gen, d, re);
      // the variant is common enough to be practiced (out of 300 seeds)
      expect(probs.length).toBeGreaterThanOrEqual(min);
      for (const pr of probs) {
        expect(gen.verify(pr)).toEqual([]);
        const bad = corrupt(pr.answer)!;
        expect(gen.verify({ ...pr, answer: bad }).length).toBeGreaterThan(0);
      }
      // the variant is produced without rejected seeds
      let rejected = 0;
      for (let s = 1; s <= 120; s++) {
        const r = produceProblem(gen, s * 7919 + d, d);
        if (r.rejected.length) rejected++;
      }
      expect(rejected).toBe(0);
    });
  }
});
