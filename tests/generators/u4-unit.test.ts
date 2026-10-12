import { describe, it, expect } from 'vitest';
import { stressGenerator } from './harness';
import { U4_GENERATORS_UNDER_TEST } from './u4-list';
import { GENERATORS, LESSON_CONTENT } from '../../src/content';
import { produceProblem, validateStep, canonicalInput } from '../../src/core/engine/problems';
import { checkAnswer } from '../../src/core/math/answers';
import type { Difficulty } from '../../src/core/curriculum/types';

describe('Unit 4 generators', () => {
  for (const gen of U4_GENERATORS_UNDER_TEST) {
    it(`${gen.id} produces verified problems across 900 variations`, () => {
      const { rejectRate, reasons } = stressGenerator(gen, 300);
      if (rejectRate >= 0.2) console.log(gen.id, rejectRate, [...reasons.entries()].slice(0, 5));
      expect(rejectRate).toBeLessThan(0.2);
    });
  }
  it('generator ids are unique', () => {
    const ids = U4_GENERATORS_UNDER_TEST.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// Guided practice is step by step (Lesson Quality Audit, C4): every guided generator/difficulty in the
// Unit 4 lessons produces 2-4 steps on every seed, each step's key is accepted by its own checker, the
// generator's verify() (which re-derives the step answers from the prompt) passes, and finishing the
// last step answers the problem.
// ---------------------------------------------------------------------------
describe('Unit 4 guided practice is step by step', () => {
  const pairs = new Set<string>();
  for (const [id, l] of LESSON_CONTENT) if (id.startsWith('U4')) for (const r of l.guided) pairs.add(`${r.generator}|${r.difficulty}`);
  it('covers the guided generators of the Unit 4 lessons', () => {
    expect(pairs.size).toBeGreaterThanOrEqual(30);
  });
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
        expect(gen.verify(problem), `${problem.id} verify`).toEqual([]);
      }
    });
  }
});
