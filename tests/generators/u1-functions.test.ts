import { U1_FUNCTION_GENERATORS, genEvalLinear } from '../../src/content/generators/u1-functions';
import { stressGenerator } from './harness';
import { createRng } from '../../src/core/engine/rng';
import { checkAnswer } from '../../src/core/math/answers';

describe('Unit 1 function generators', () => {
  for (const gen of U1_FUNCTION_GENERATORS) {
    it(`${gen.id} produces verified problems across 900 variations`, () => {
      const { rejectRate, reasons } = stressGenerator(gen, 300);
      if (rejectRate > 0.05) console.log(gen.id, rejectRate, [...reasons.entries()].slice(0, 5));
      expect(rejectRate).toBeLessThan(0.2);
    });
  }
  it('eval-linear: spot check a known problem by hand', () => {
    for (let s = 0; s < 50; s++) {
      const pr = genEvalLinear.generate(createRng(s), 2);
      const t = (pr.prompt[0] as { text: string }).text;
      expect(t).toMatch(/find \$[fgh]\(-?\d+\)\$/);
    }
  });
  it('eval-linear: misconception answers trigger targeted feedback', () => {
    const pr = genEvalLinear.generate(createRng(99), 2);
    for (const m of pr.misconceptions) {
      const r = checkAnswer(pr.answer, m.answer, pr.misconceptions);
      expect(r.status).toBe('incorrect');
      expect(r.misconception).toBe(m.tag);
    }
  });
});
