import { describe, it, expect } from 'vitest';
import { ALL_GENERATORS, GENERATORS, LESSON_CONTENT } from '../../src/content';
import { stressGenerator } from './harness';
import { produceProblem, validateStep, canonicalInput } from '../../src/core/engine/problems';
import { checkAnswer, type AnswerSpec } from '../../src/core/math/answers';
import { Rational } from '../../src/core/math/rational';
import type { Difficulty, Problem } from '../../src/core/curriculum/types';

describe('Unit 1 generators', () => {
  it('generator ids are unique', () => expect(GENERATORS.size).toBe(ALL_GENERATORS.length));
  // other units have their own stress tests (u2-unit, u3-unit, u4-unit)
  for (const gen of ALL_GENERATORS.filter((g) => g.id.startsWith('u1.') && !['u1.is-function', 'u1.eval-linear', 'u1.eval-context', 'u1.notation-table', 'u1.notation-graph'].includes(g.id))) {
    it(`${gen.id} produces verified problems across 900 variations`, () => {
      const { rejectRate, reasons } = stressGenerator(gen, 300);
      if (rejectRate > 0.05) console.log(gen.id, rejectRate, [...reasons.entries()].slice(0, 5));
      expect(rejectRate).toBeLessThan(0.2);
    });
  }
});

// ---------------------------------------------------------------------------
// Guided practice is step by step (Lesson Quality Audit, C4): every guided generator/difficulty in the
// Unit 1 lessons produces 2-4 steps on every seed, each step's key is accepted by its own checker, and
// finishing the last step answers the problem. verify() re-derives the steps independently, so a
// corrupted first step must be caught.
// ---------------------------------------------------------------------------
describe('Unit 1 guided practice is step by step', () => {
  const pairs = new Set<string>();
  for (const [id, l] of LESSON_CONTENT) if (id.startsWith('U1')) for (const r of l.guided) pairs.add(`${r.generator}|${r.difficulty}`);
  it('covers every Unit 1 lesson', () => expect(pairs.size).toBeGreaterThanOrEqual(30));
  for (const pair of [...pairs].sort()) {
    it(`${pair} gives checked steps on 60 seeds`, () => {
      const [gid, d] = pair.split('|');
      const gen = GENERATORS.get(gid)!;
      for (let s = 1; s <= 60; s++) {
        const { problem } = produceProblem(gen, s * 7919 + 17 * Number(d), Number(d) as Difficulty);
        const steps = problem.steps ?? [];
        expect(steps.length, `${problem.id} has steps`).toBeGreaterThanOrEqual(2);
        expect(steps.length).toBeLessThanOrEqual(4);
        steps.forEach((st, i) => expect(validateStep(st, `${problem.id} step ${i + 1}`)).toEqual([]));
        expect(checkAnswer(problem.answer, canonicalInput(steps[steps.length - 1].answer)).status, `${problem.id} last step`).toBe('correct');
        // a wrong first-step key must be caught by verify()
        const first = steps[0].answer;
        let bad: AnswerSpec | null = null;
        if (first.kind === 'number') bad = { ...first, value: Rational.parse(first.value).add(Rational.from(1)).toString() };
        else if (first.kind === 'choice') bad = { ...first, correct: first.options.find((o) => o.id !== first.correct)!.id };
        else if (first.kind === 'expression') bad = { ...first, value: `(${first.value}) + 1` };
        if (bad) {
          const broken: Problem = { ...problem, steps: [{ ...steps[0], answer: bad }, ...steps.slice(1)] };
          expect(gen.verify(broken).length, `${problem.id}: verify() misses a wrong first step`).toBeGreaterThan(0);
        }
      }
    });
  }
});
