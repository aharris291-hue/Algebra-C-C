import { describe, it, expect } from 'vitest';
import type { Difficulty, GeneratorDef, Problem } from '../../src/core/curriculum/types';
import { produceProblem } from '../../src/core/engine/problems';
import { ALL_GENERATORS } from '../../src/content';

/** Variants added for the Units 4-5 standards audit: each must occur often and reject corrupted keys. */
const VARIANTS: { gen: string; d: Difficulty[]; re: RegExp; label: string }[] = [
  { gen: 'u4.quadratic-context', d: [1], re: /most efficient way/, label: 'choose a method' },
  { gen: 'u4.quadratic-context', d: [2, 3], re: /data point/, label: 'is this data point possible' },
  { gen: 'u4.quadratic-context', d: [2, 3], re: /exactly \$\d+\$ feet above/, label: 'both times valid' },
  { gen: 'u4.quadratic-context', d: [2], re: /longer than it is wide|more than twice its width/, label: 'write the area equation' },
  { gen: 'u4.factor-gcf', d: [3], re: /negative GCF/, label: 'negative GCF' },
  { gen: 'u4.interpret-parts', d: [3], re: /R\(p\) = p/, label: 'revenue factor' },
  { gen: 'u4.interpret-parts', d: [3], re: /A\(x\) = \(x/, label: 'area factor' },
  { gen: 'u4.rewrite-forms', d: [2, 3], re: /equivalent\*\* form/, label: 'form that reveals a property' },
  { gen: 'u4.max-min', d: [3], re: /for what value of/, label: 'max or min, and when' },
  { gen: 'u4.avg-rate', d: [2], re: /two labeled/, label: 'rate from a graph' },
  { gen: 'u4.avg-rate', d: [2], re: /linear function \$g\$/, label: 'difference table' },
  { gen: 'u4.compare-functions', d: [3], re: /first whole number/, label: 'quadratic overtakes linear' },
  { gen: 'u4.domain-range', d: [1], re: /The table lists all/, label: 'discrete domain' },
  { gen: 'u4.domain-range', d: [2], re: /is dropped from/, label: 'domain/range from a graph' },
  { gen: 'u4.evaluate-quadratic', d: [1, 2], re: /"t":"table"/, label: 'evaluate from a table' },
  { gen: 'u4.model-situation', d: [2, 3], re: /Which graph correctly shows/, label: 'which graph (quadratic)' },
  { gen: 'u5.write-exponential', d: [2], re: /Which graph correctly shows/, label: 'which graph (exponential)' },
  { gen: 'u5.solve-exponential', d: [3], re: /Write an exponential equation for this situation/, label: 'exponential equation in context' },
  { gen: 'u5.compound-interest', d: [2], re: /in the formula represent/, label: 'interpret a formula part' },
];

const byId = (id: string): GeneratorDef => {
  const g = ALL_GENERATORS.find((x) => x.id === id);
  if (!g) throw new Error(`missing ${id}`);
  return g;
};

function corrupt(p: Problem): Problem | null {
  const a = p.answer;
  const bump = (v: string) => (/^-?\d+(\.\d+)?$/.test(v) ? String(Number(v) + 1) : `(${v}) + 1`);
  switch (a.kind) {
    case 'choice': {
      const other = a.options.find((o) => o.id !== a.correct);
      return other ? { ...p, answer: { ...a, correct: other.id } } : null;
    }
    case 'number':
      return { ...p, answer: { ...a, value: bump(a.value) } };
    case 'solutions':
      return { ...p, answer: { ...a, values: [bump(a.values[0]), ...a.values.slice(1)] } };
    case 'expression':
      return { ...p, answer: { ...a, value: `${a.value} + 1` } };
    case 'interval':
      return { ...p, answer: { ...a, value: a.value.replace(/\d+(\.\d+)?/, (m) => String(Number(m) + 1)) } };
    default:
      return null;
  }
}

describe('Units 4-5 audit variants', () => {
  for (const v of VARIANTS) {
    it(`${v.gen}: "${v.label}" occurs often and rejects corrupted keys`, () => {
      const gen = byId(v.gen);
      for (const d of v.d) {
        let hits = 0;
        let corrupted = 0;
        for (let s = 1; s <= 300; s++) {
          const { problem } = produceProblem(gen, s * 7919 + d, d);
          if (!v.re.test(JSON.stringify(problem.prompt))) continue;
          hits++;
          const bad = corrupt(problem);
          if (bad) {
            corrupted++;
            expect(gen.verify(bad), `${v.gen} d${d} seed ${s}`).not.toEqual([]);
          }
        }
        expect(hits, `${v.label} at d${d}`).toBeGreaterThanOrEqual(30);
        expect(corrupted).toBe(hits);
      }
    });
  }

  it('u4.factor-gcf never exceeds degree 2', () => {
    const gen = byId('u4.factor-gcf');
    for (const d of [1, 2, 3] as Difficulty[])
      for (let s = 1; s <= 300; s++) {
        const { problem } = produceProblem(gen, s * 7919 + d, d);
        expect(JSON.stringify(problem.prompt)).not.toMatch(/x\^\{?[3-9]/);
      }
  });
});
