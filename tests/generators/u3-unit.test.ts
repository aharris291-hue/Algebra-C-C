import { describe, it, expect } from 'vitest';
import { stressGenerator } from './harness';
import { U3_GENERATORS_UNDER_TEST } from './u3-list';

describe('Unit 3 generators', () => {
  for (const gen of U3_GENERATORS_UNDER_TEST) {
    it(`${gen.id} produces verified problems across 900 variations`, () => {
      const { rejectRate, reasons } = stressGenerator(gen, 300);
      if (rejectRate >= 0.2) console.log(gen.id, rejectRate, [...reasons.entries()].slice(0, 5));
      expect(rejectRate).toBeLessThan(0.2);
    });
  }
  it('generator ids are unique', () => {
    const ids = U3_GENERATORS_UNDER_TEST.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
