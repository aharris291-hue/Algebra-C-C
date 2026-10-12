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

// ---------------------------------------------------------------------------
// Error-specific feedback (Lesson Quality Audit): in these multiple-choice generator/difficulties every
// wrong option is built from a specific mistake, so each one carries a misconception whose feedback
// is what the student sees after picking it.
// ---------------------------------------------------------------------------
describe('Unit 4 multiple-choice distractors give error-specific feedback', () => {
  const pairs = [
    'u4.avg-rate|2', 'u4.avg-rate|3', 'u4.compare-functions|2', 'u4.graph-features|3', 'u4.interpret-notation|3',
    'u4.interpret-parts|2', 'u4.interpret-parts|3', 'u4.max-min|3', 'u4.model-situation|3', 'u4.quadratic-context|2',
    'u4.quadratic-context|3', 'u4.rewrite-forms|3', 'u4.transform-describe|2', 'u4.transform-describe|3',
  ];
  for (const pair of pairs) {
    it(`${pair}: every wrong option has feedback on 60 seeds`, () => {
      const [gid, d] = pair.split('|');
      const gen = GENERATORS.get(gid)!;
      let choices = 0;
      for (let s = 1; s <= 60; s++) {
        const { problem } = produceProblem(gen, s * 7919 + 17 * Number(d), Number(d) as Difficulty);
        if (problem.answer.kind !== 'choice') continue;
        choices++;
        for (const o of problem.answer.options) {
          if (o.id === problem.answer.correct) continue;
          const m = problem.misconceptions.find((x) => x.answer === o.id);
          expect(m, `${problem.id} option "${o.label}" has a misconception`).toBeTruthy();
          const r = checkAnswer(problem.answer, o.id, problem.misconceptions);
          expect(r.status).toBe('incorrect');
          expect(r.message, `${problem.id} option ${o.id}`).toBe(m!.feedback);
        }
      }
      expect(choices).toBeGreaterThan(0);
    });
  }
});
