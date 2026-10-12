import { describe, it, expect } from 'vitest';
import { stressGenerator } from './harness';
import { U5_GENERATORS_UNDER_TEST } from './u5-list';
import { GENERATORS, LESSON_CONTENT } from '../../src/content';
import { produceProblem, validateStep, canonicalInput } from '../../src/core/engine/problems';
import { checkAnswer } from '../../src/core/math/answers';
import type { Difficulty } from '../../src/core/curriculum/types';

describe('Unit 5 generators', () => {
  for (const gen of U5_GENERATORS_UNDER_TEST) {
    it(`${gen.id} produces verified problems across 900 variations`, () => {
      const { rejectRate, reasons } = stressGenerator(gen, 300);
      if (rejectRate >= 0.2) console.log(gen.id, rejectRate, [...reasons.entries()].slice(0, 5));
      expect(rejectRate).toBeLessThan(0.2);
    });
  }
  it('generator ids are unique', () => {
    const ids = U5_GENERATORS_UNDER_TEST.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// Guided practice is step by step (Lesson Quality Audit, C4): every guided generator/difficulty in the
// Unit 5 lessons produces 2-4 steps on every seed, each step's key is accepted by its own checker, and
// finishing the last step answers the problem.
// ---------------------------------------------------------------------------
describe('Unit 5 guided practice is step by step', () => {
  const pairs = new Set<string>();
  for (const [id, l] of LESSON_CONTENT) if (id.startsWith('U5')) for (const r of l.guided) pairs.add(`${r.generator}|${r.difficulty}`);
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
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Error-specific feedback (Lesson Quality Audit): every wrong option of a multiple-choice problem
// names its mistake, and choosing it returns that feedback.
// ---------------------------------------------------------------------------
describe('Unit 5 multiple-choice distractors carry error-specific feedback', () => {
  for (const pair of ['u5.compound-interest|3', 'u5.exponential-constraints|3']) {
    it(`${pair} gives feedback for every wrong option on 60 seeds`, () => {
      const [gid, d] = pair.split('|');
      const gen = GENERATORS.get(gid)!;
      let choices = 0;
      for (let s = 1; s <= 60; s++) {
        const { problem } = produceProblem(gen, s * 7919 + 17 * Number(d), Number(d) as Difficulty);
        const a = problem.answer;
        if (a.kind !== 'choice') continue;
        choices++;
        for (const o of a.options) {
          if (o.id === a.correct) continue;
          const m = problem.misconceptions.find((x) => x.answer === o.id);
          expect(m, `${problem.id} option "${o.label}"`).toBeDefined();
          const r = checkAnswer(a, o.id, problem.misconceptions);
          expect(r.status).toBe('incorrect');
          expect(r.message).toBe(m!.feedback);
        }
      }
      expect(choices).toBeGreaterThan(10);
    });
  }
});
