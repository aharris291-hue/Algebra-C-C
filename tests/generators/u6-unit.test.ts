import { describe, it, expect } from 'vitest';
import { stressGenerator } from './harness';
import { U6_GENERATORS_UNDER_TEST } from './u6-list';
import { createRng } from '../../src/core/engine/rng';
import { Rational } from '../../src/core/math/rational';
import { produceProblem } from '../../src/core/engine/problems';
import { ALL_GENERATORS } from '../../src/content';
import type { Difficulty, Problem } from '../../src/core/curriculum/types';

describe('Unit 6 generators', () => {
  for (const gen of U6_GENERATORS_UNDER_TEST) {
    it(`${gen.id} produces verified problems across 900 variations`, () => {
      const { rejectRate, reasons } = stressGenerator(gen, 300);
      if (rejectRate >= 0.2) console.log(gen.id, rejectRate, [...reasons.entries()].slice(0, 5));
      expect(rejectRate).toBeLessThan(0.2);
    });
  }
  it('generator ids are unique', () => {
    const ids = U6_GENERATORS_UNDER_TEST.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Unit 6 verify() catches wrong answer keys', () => {
  for (const gen of U6_GENERATORS_UNDER_TEST) {
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

// ---------------------------------------------------------------------------
// Curriculum-audit variants: each one must actually occur in practice (300 seeds), and verify()
// must reject every wrong key for it (every other choice option, or a number/expression/interval nudged).
// ---------------------------------------------------------------------------
function promptText(pr: Problem): string {
  return pr.prompt.map((b) => (b.t === 'p' ? b.text : b.t === 'math' ? b.tex : b.t === 'graph' ? `[graph ${b.caption ?? ''}]` : b.t === 'table' ? `[table ${b.headers.join('|')}]` : `[${b.t}]`)).join(' ');
}
function wrongKeys(pr: Problem): Problem[] {
  const a = pr.answer;
  const out: Problem[] = [];
  const clone = () => JSON.parse(JSON.stringify(pr)) as Problem;
  if (a.kind === 'choice') {
    for (const o of a.options) if (o.id !== a.correct) { const m = clone(); (m.answer as typeof a).correct = o.id; out.push(m); }
  } else if (a.kind === 'number') {
    for (const d of ['1', '-1', '1/100']) { const m = clone(); (m.answer as typeof a).value = Rational.parse(a.value).add(Rational.parse(d)).toString(); out.push(m); }
  } else if (a.kind === 'expression') {
    const m = clone(); (m.answer as typeof a).value = `(${a.value})+1`; out.push(m);
    const m2 = clone(); (m2.answer as typeof a).value = `(${a.value})*2`; out.push(m2);
  } else if (a.kind === 'interval') {
    const m = clone(); (m.answer as typeof a).value = /^\(-inf/.test(a.value) ? a.value.replace(/, (-?[\d./]+)\)$/, (_s, k) => `, ${Rational.parse(k).add(Rational.from(1)).toString()})`) : a.value.replace(/^\((-?[\d./]+),/, (_s, k) => `(${Rational.parse(k).add(Rational.from(1)).toString()},`); out.push(m);
  }
  return out;
}
function checkVariant(id: string, difficulty: Difficulty, re: RegExp, minCount: number) {
  it(`${id} d${difficulty} variant ${re.source.slice(0, 40)} occurs and rejects wrong keys`, () => {
    const gen = ALL_GENERATORS.find((g) => g.id === id)!;
    let count = 0;
    for (let s = 1; s <= 300; s++) {
      const { problem } = produceProblem(gen, s * 7919 + difficulty, difficulty);
      if (!re.test(promptText(problem))) continue;
      count++;
      expect(gen.verify(problem)).toEqual([]);
      const wrong = wrongKeys(problem);
      expect(wrong.length).toBeGreaterThan(0);
      for (const w of wrong) expect(gen.verify(w).length, JSON.stringify(w.answer)).toBeGreaterThan(0);
    }
    expect(count).toBeGreaterThanOrEqual(minCount);
  });
}

describe('Unit 6 audit variants', () => {
  // A.FGR.9.5: two functions in different representations
  checkVariant('u6.compare-families', 2, /Function \$f\$ is shown in the graph/, 20);
  checkVariant('u6.compare-families', 2, /Function \$f\$ is shown in the table.*has an output of/, 20);
  checkVariant('u6.compare-families', 2, /Function \$f\$ is shown in the table.*given by an equation/, 20);
  checkVariant('u6.compare-families', 3, /horizontal asymptote\?|growth factor\?/, 15);
  checkVariant('u6.compare-families', 3, /Function \$f\$ is shown in the table.*greater value at/, 15);
  checkVariant('u6.compare-families', 3, /are decreasing\?/, 15);
  // A.FGR.9.4: geometric sequences in context, from a graph, explicit to recursive
  checkVariant('u6.geometric', 2, /ball is dropped|share a new video/, 30);
  checkVariant('u6.geometric', 2, /plotted as points/, 30);
  checkVariant('u6.geometric', 3, /ball is dropped|share a new video/, 30);
  checkVariant('u6.geometric', 3, /has this explicit formula/, 30);
  // A.FGR.9.2: x-intercepts, matching an equation to its graph, range from a graph
  checkVariant('u6.exp-features', 2, /\$x\$-intercept/, 40);
  checkVariant('u6.exp-features', 3, /Which graph shows this function/, 40);
  checkVariant('u6.exp-domain-range', 2, /function \$f\$ is shown\. .*range/, 40);
  // A.FGR.9.1: reasonable (including discrete) domains in context
  checkVariant('u6.exp-domain-range', 3, /most reasonable domain/, 50);
});
