import { ALL_GENERATORS, GENERATORS } from '../../src/content';
import { stressGenerator } from './harness';

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
