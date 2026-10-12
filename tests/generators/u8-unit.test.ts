import { describe, it, expect } from 'vitest';
import { stressGenerator } from './harness';
import { U8_GENERATORS_UNDER_TEST } from './u8-list';
import { createRng } from '../../src/core/engine/rng';
import { Rational } from '../../src/core/math/rational';
import { produceProblem, validateStep, canonicalInput } from '../../src/core/engine/problems';
import { ALL_GENERATORS, GENERATORS, LESSON_CONTENT } from '../../src/content';
import { checkAnswer, answerToText } from '../../src/core/math/answers';
import type { Difficulty, Problem } from '../../src/core/curriculum/types';

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

describe('Unit 8 audit variants', () => {
  // A.GSR.3.1: areas of parallelograms, rhombuses and squares; unknown side lengths
  checkVariant('u8.perim-area', 2, /area of (parallelogram|rhombus|square) \$ABCD\$/, 50);
  checkVariant('u8.perim-area', 3, /Its (perimeter|area) is \$\d+\$/, 60);
});

// ---------------------------------------------------------------------------
// Guided practice is step by step (Lesson Quality Audit, C4): every guided generator/difficulty in the
// Unit 8 lessons produces 2-4 steps on every seed, each step's key is accepted by its own checker, and
// finishing the last step answers the problem. verify() recomputes the step answers from the prompt, so
// a corrupted number step must be caught.
// ---------------------------------------------------------------------------
describe('Unit 8 guided practice is step by step', () => {
  const pairs = new Set<string>();
  for (const [id, l] of LESSON_CONTENT) if (id.startsWith('U8')) for (const r of l.guided) pairs.add(`${r.generator}|${r.difficulty}`);
  it('the Unit 8 lessons have guided activities', () => expect(pairs.size).toBeGreaterThan(5));
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
        expect(gen.verify(problem), problem.id).toEqual([]);
      }
    });
  }
  it('verify() rejects a corrupted number step', () => {
    let tried = 0;
    let caught = 0;
    for (const gid of [...new Set([...pairs].map((p) => p.split('|')[0]))])
      for (const d of [1, 2, 3] as const)
        for (let s = 1; s <= 20; s++) {
          const gen = GENERATORS.get(gid)!;
          const { problem } = produceProblem(gen, s * 104729 + d, d);
          // only intermediate steps: the last step is the problem's own answer, checked elsewhere
          problem.steps!.slice(0, -1).forEach((st, i) => {
            if (st.answer.kind !== 'number') return;
            const m = JSON.parse(JSON.stringify(problem)) as Problem;
            const a = m.steps![i].answer as { value: string; roundTo?: number };
            a.value = Rational.parse(a.value).add(Rational.from(1)).toString();
            tried++;
            if (gen.verify(m).length > 0) caught++;
          });
        }
    expect(tried).toBeGreaterThan(100);
    expect(caught).toBe(tried);
  });
});

describe('answerToText units', () => {
  const show = (value: string, unit: string) => answerToText({ kind: 'number', value, unit });
  it('uses the singular unit for exactly 1', () => {
    expect(show('1', 'miles')).toBe('1 mile');
    expect(show('1', 'feet')).toBe('1 foot');
    expect(show('1', 'units')).toBe('1 unit');
    expect(show('1', 'dollars')).toBe('1 dollar');
    expect(show('1', 'hours')).toBe('1 hour');
    expect(show('1', 'square feet')).toBe('1 square foot');
    expect(show('1', 'inches')).toBe('1 inch');
    expect(show('1', 'people')).toBe('1 person');
    expect(show('1', 'milligrams per hour')).toBe('1 milligram per hour');
  });
  it('keeps the plural for other values and leaves non-plural units alone', () => {
    expect(show('2', 'miles')).toBe('2 miles');
    expect(show('0', 'feet')).toBe('0 feet');
    expect(show('1.5', 'hours')).toBe('1.5 hours');
    expect(show('-1', 'dollars')).toBe('-1 dollars');
    expect(show('1', '%')).toBe('1 %');
    expect(show('1', 'percent')).toBe('1 percent');
    expect(show('1', 'thousand dollars')).toBe('1 thousand dollars');
    expect(answerToText({ kind: 'number', value: '1', unit: 'miles', roundTo: 1 })).toBe('1.0 miles');
  });
});
