import { describe, it, expect } from 'vitest';
import { stressGenerator } from './harness';
import { U8_GENERATORS_UNDER_TEST } from './u8-list';
import { createRng } from '../../src/core/engine/rng';
import { Rational } from '../../src/core/math/rational';

describe('Unit 8 generators', () => {
  for (const gen of U8_GENERATORS_UNDER_TEST) {
    it(`${gen.id} produces verified problems across 900 variations`, () => {
      const { rejectRate, reasons } = stressGenerator(gen, 300);
      if (rejectRate >= 0.2) console.log(gen.id, rejectRate, [...reasons.entries()].slice(0, 5));
      expect(rejectRate).toBeLessThan(0.2);
    });
  }
  it('generator ids are unique', () => {
    const ids = U8_GENERATORS_UNDER_TEST.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Unit 8 verify() catches wrong answer keys', () => {
  for (const gen of U8_GENERATORS_UNDER_TEST) {
    it(`${gen.id} rejects a corrupted key`, () => {
      let tried = 0;
      let caught = 0;
      for (const d of [1, 2, 3] as const)
        for (let s = 1; s <= 40; s++) {
          const pr = gen.generate(createRng(s * 31 + d), d);
          if (gen.verify(pr).length) continue;
          const m = JSON.parse(JSON.stringify(pr));
          const a = m.answer;
          if (a.kind === 'number') a.value = Rational.parse(a.value).add(Rational.from(1)).toString();
          else if (a.kind === 'choice') a.correct = a.options.find((o: { id: string }) => o.id !== a.correct).id;
          else if (a.kind === 'expression') a.value = `(${a.value})+1`;
          else if (a.kind === 'equation') a.value = a.value.replace(/=\s*/, '= 1+');
          else if (a.kind === 'interval') a.value = /inf/.test(a.value) ? (a.value === '(-inf, 99)' ? '(-inf, 98)' : '(-inf, 99)') : a.value.replace(/^\[/, '(').replace(/\]$/, ')');
          else if (a.kind === 'point') a.x = Rational.parse(a.x).add(Rational.from(1)).toString();
          else if (a.kind === 'solutions') a.values[0] = Rational.parse(a.values[0]).add(Rational.from(1)).toString();
          else if (a.kind === 'sequence-terms') a.values[0] = Rational.parse(a.values[0]).add(Rational.from(1)).toString();
          else continue;
          tried++;
          if (gen.verify(m).length > 0) caught++;
        }
      expect(tried).toBeGreaterThan(60);
      expect(caught).toBe(tried);
    });
  }
});
