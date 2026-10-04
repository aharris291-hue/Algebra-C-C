import type { Difficulty, GeneratorDef } from '../../src/core/curriculum/types';
import { produceProblem, validateProblem, canonicalInput } from '../../src/core/engine/problems';
import { checkAnswer } from '../../src/core/math/answers';
import { createRng } from '../../src/core/engine/rng';

/**
 * Stress-test a generator: many seeds at every difficulty. Each produced problem must
 * validate, its key must be accepted, and the first-choice seed should rarely be rejected.
 */
export function stressGenerator(gen: GeneratorDef, seeds = 300, difficulties: Difficulty[] = [1, 2, 3]) {
  let rejectedFirst = 0;
  const reasons = new Map<string, number>();
  for (const d of difficulties) {
    for (let s = 1; s <= seeds; s++) {
      const { problem, rejected } = produceProblem(gen, s * 7919 + d, d);
      if (rejected.length) {
        rejectedFirst++;
        for (const r of rejected) for (const e of r.errors) reasons.set(e.slice(0, 80), (reasons.get(e.slice(0, 80)) ?? 0) + 1);
      }
      expect(validateProblem(problem, gen)).toEqual([]);
      expect(checkAnswer(problem.answer, canonicalInput(problem.answer)).status).toBe('correct');
      // problems are reproducible from their seed
      const again = gen.generate(createRng(problem.seed), d);
      expect(JSON.stringify(again.answer)).toBe(JSON.stringify(problem.answer));
    }
  }
  const total = seeds * difficulties.length;
  return { rejectRate: rejectedFirst / total, reasons };
}
