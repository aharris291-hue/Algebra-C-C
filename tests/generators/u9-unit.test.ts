import { describe, it, expect } from 'vitest';
import { stressGenerator } from './harness';
import { ALL_GENERATORS, CAPSTONE_CONTENT, GENERATORS, LESSON_BY_ID } from '../../src/content';
import { createRng } from '../../src/core/engine/rng';
import { produceProblem } from '../../src/core/engine/problems';
import { Rational } from '../../src/core/math/rational';

const U9 = ALL_GENERATORS.filter((g) => g.id.startsWith('u9.'));

describe('Unit 9 capstone generators', () => {
  for (const gen of U9) {
    it(`${gen.id} produces verified problems across 900 variations`, () => {
      const { rejectRate, reasons } = stressGenerator(gen, 300);
      if (rejectRate > 0) console.log(gen.id, rejectRate, [...reasons.entries()].slice(0, 5));
      // capstone tasks share one seed, so a task may never need a different seed than its siblings
      expect(rejectRate).toBe(0);
    });
  }
});

describe('Capstone projects', () => {
  for (const cap of CAPSTONE_CONTENT.values()) {
    it(`${cap.lessonId}: every task exists, is a capstone generator and covers the day's skills`, () => {
      const meta = LESSON_BY_ID.get(cap.lessonId)!;
      expect(meta.kind).toBe('capstone');
      expect(cap.tasks.length).toBeGreaterThanOrEqual(6);
      const skills = new Set<string>();
      for (const t of cap.tasks) {
        const g = GENERATORS.get(t.generator);
        expect(g, t.generator).toBeTruthy();
        expect(t.generator.startsWith('u9.')).toBe(true);
        skills.add(g!.skillId);
      }
      for (const s of meta.skillsAssessed) expect(skills.has(s), `${cap.lessonId} has no task for ${s}`).toBe(true);
    });
    it(`${cap.lessonId}: all tasks built from one seed accept that seed, at every difficulty`, () => {
      for (let s = 1; s <= 200; s++)
        for (const d of [1, 2, 3] as const)
          for (const t of cap.tasks) {
            const { problem, rejected } = produceProblem(GENERATORS.get(t.generator)!, s * 7919 + d, d);
            expect(rejected, `${t.generator} seed ${s * 7919 + d}`).toEqual([]);
            expect(problem.seed).toBe(s * 7919 + d);
          }
    });
  }
});

describe('Unit 9 verify() catches wrong answer keys', () => {
  for (const gen of U9) {
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
          else if (a.kind === 'inequality') a.value = a.value.replace(/(<=|>=|<|>)\s*/, '$1 1+');
          else if (a.kind === 'interval') a.value = /inf/.test(a.value) ? (a.value === '(-inf, 99)' ? '(-inf, 98)' : '(-inf, 99)') : a.value.replace(/^\[/, '(').replace(/\]$/, ')');
          else if (a.kind === 'point') a.x = Rational.parse(a.x).add(Rational.from(1)).toString();
          else if (a.kind === 'region-point') a.constraints[0] = a.constraints[0].replace(/(<=|>=|<|>)\s*/, '$1 1+');
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
