import { describe, it, expect } from 'vitest';
import { stressGenerator } from './harness';
import { U2_GENERATORS_UNDER_TEST } from './u2-list';
import { produceProblem, validateStep, canonicalInput } from '../../src/core/engine/problems';
import { GENERATORS, LESSON_CONTENT } from '../../src/content';
import { checkAnswer } from '../../src/core/math/answers';
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

// ---------------------------------------------------------------------------
// Guided practice is step by step (Lesson Quality Audit, C4): every guided generator/difficulty in the
// Unit 2 lessons produces 2-4 steps on every seed, each step is well formed and its key is accepted by
// its own checker, the problem's verify() (which recomputes the steps) passes, and finishing the last
// step answers the problem.
// ---------------------------------------------------------------------------
describe('Unit 2 guided practice is step by step', () => {
  const pairs = new Set<string>();
  for (const [id, l] of LESSON_CONTENT) if (id.startsWith('U2')) for (const r of l.guided) pairs.add(`${r.generator}|${r.difficulty}`);
  for (const pair of [...pairs].sort()) {
    it(`${pair} gives checked steps on 60 seeds`, () => {
      const [gid, d] = pair.split('|');
      const gen = GENERATORS.get(gid)!;
      for (let s = 1; s <= 60; s++) {
        const { problem } = produceProblem(gen, s * 7919 + 17 * Number(d), Number(d) as Difficulty);
        const steps = problem.steps ?? [];
        expect(steps.length, `${problem.id} has steps`).toBeGreaterThanOrEqual(2);
        expect(steps.length).toBeLessThanOrEqual(4);
        steps.forEach((st, i) => {
          expect(validateStep(st, `${problem.id} step ${i + 1}`)).toEqual([]);
          expect(checkAnswer(st.answer, canonicalInput(st.answer)).status, `${problem.id} step ${i + 1} key`).toBe('correct');
        });
        expect(gen.verify(problem), `${problem.id} verify`).toEqual([]);
        expect(checkAnswer(problem.answer, canonicalInput(steps[steps.length - 1].answer)).status, `${problem.id} last step`).toBe('correct');
      }
    });
  }
});

describe('Unit 2 verify() checks every guided step', () => {
  const pairs = new Set<string>();
  for (const [id, l] of LESSON_CONTENT) if (id.startsWith('U2')) for (const r of l.guided) pairs.add(`${r.generator}|${r.difficulty}`);
  for (const pair of [...pairs].sort()) {
    it(`${pair} rejects a corrupted step key`, () => {
      const [gid, d] = pair.split('|');
      const gen = GENERATORS.get(gid)!;
      for (let s = 1; s <= 12; s++) {
        const { problem } = produceProblem(gen, s * 6151 + Number(d), Number(d) as Difficulty);
        (problem.steps ?? []).forEach((st, i) => {
          const bad = corrupt(st.answer);
          if (!bad) return;
          const steps = problem.steps!.map((x, j) => (j === i ? { ...x, answer: bad } : x));
          expect(gen.verify({ ...problem, steps }).length, `${problem.id} step ${i + 1} corrupted`).toBeGreaterThan(0);
        });
      }
    });
  }
});
