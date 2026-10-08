import { describe, it, expect } from 'vitest';
import { stressGenerator } from './harness';
import { U7_GENERATORS_UNDER_TEST } from './u7-list';
import { createRng } from '../../src/core/engine/rng';
import { Rational } from '../../src/core/math/rational';
import { produceProblem } from '../../src/core/engine/problems';
import { ALL_GENERATORS } from '../../src/content';
import type { Difficulty, Problem } from '../../src/core/curriculum/types';

describe('Unit 7 generators', () => {
  for (const gen of U7_GENERATORS_UNDER_TEST) {
    it(`${gen.id} produces verified problems across 900 variations`, () => {
      const { rejectRate, reasons } = stressGenerator(gen, 300);
      if (rejectRate >= 0.2) console.log(gen.id, rejectRate, [...reasons.entries()].slice(0, 5));
      expect(rejectRate).toBeLessThan(0.2);
    });
  }
  it('generator ids are unique', () => {
    const ids = U7_GENERATORS_UNDER_TEST.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Unit 7 verify() catches wrong answer keys', () => {
  for (const gen of U7_GENERATORS_UNDER_TEST) {
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

describe('Unit 7 audit variants', () => {
  // A.DSR.10.1: MAD and standard deviation; comparing with mean and standard deviation; three box plots
  checkVariant('u7.std-dev', 2, /How does σ compare with the MAD/, 50);
  checkVariant('u7.std-dev', 3, /Which statement about the MAD and σ/, 40);
  checkVariant('u7.compare', 2, /table Group\|Mean\|Standard deviation/, 50);
  checkVariant('u7.compare', 3, /table Group\|Mean\|Standard deviation/, 50);
  checkVariant('u7.compare', 3, /for three groups/, 50);
  // A.DSR.10.3: representing data on a scatter plot
  checkVariant('u7.scatter', 1, /Which scatter plot shows these data/, 50);
  checkVariant('u7.scatter', 2, /Which scatter plot shows these data/, 40);
  // A.DSR.10.5: line of best fit with technology
  checkVariant('u7.regression', 2, /Use the graphing tool/, 50);
  checkVariant('u7.regression', 3, /Use the graphing tool/, 50);
  it('u7.regression technology item: x = 1..6, y = 3, 5, 6, 9, 10, 12 has slope 1.8, intercept 1.2, r ≈ 0.9930', () => {
    const gen = ALL_GENERATORS.find((g) => g.id === 'u7.regression')!;
    let base: Problem | null = null;
    for (let s = 1; s <= 300 && !base; s++) {
      const pr = produceProblem(gen, s * 7919 + 2, 2).problem;
      if (/Use the graphing tool/.test(promptText(pr))) base = pr;
    }
    const pr = JSON.parse(JSON.stringify(base)) as Problem;
    const table = pr.prompt.find((b) => b.t === 'table')!;
    if (table.t === 'table') table.rows = [[1, 3], [2, 5], [3, 6], [4, 9], [5, 10], [6, 12]].map((r) => r.map(String));
    const set = (v: string) => { if (pr.answer.kind === 'number') pr.answer.value = v; };
    set('1.8');
    expect(gen.verify(pr)).toEqual([]);
    set('1.77');
    expect(gen.verify(pr).length).toBeGreaterThan(0);
    const para = pr.prompt.find((b) => b.t === 'p')!;
    if (para.t === 'p') para.text = para.text.replace('the slope $a$', 'the $y$-intercept $b$');
    set('1.2');
    expect(gen.verify(pr)).toEqual([]);
    if (para.t === 'p') para.text = para.text.replace('the $y$-intercept $b$', 'the correlation coefficient $r$');
    set(String(31.5 / Math.sqrt(17.5 * 57.5)));
    expect(gen.verify(pr)).toEqual([]);
    expect(31.5 / Math.sqrt(17.5 * 57.5)).toBeCloseTo(0.993, 4);
  });
});
