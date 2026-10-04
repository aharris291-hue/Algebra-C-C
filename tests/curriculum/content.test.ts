import { LESSON_CONTENT, GENERATORS, LESSON_BY_ID } from '../../src/content';
import { parseExpression } from '../../src/core/math/parser';

describe('lesson content integrity', () => {
  for (const [id, c] of LESSON_CONTENT) {
    describe(id, () => {
      const meta = LESSON_BY_ID.get(id)!;
      it('belongs to a catalog lesson', () => expect(meta).toBeDefined());
      it('has every required section (spec §7)', () => {
        expect(c.goal.length).toBeGreaterThan(10);
        expect(c.needToKnow.length).toBeGreaterThan(0);
        expect(c.instruction.length).toBeGreaterThan(3);
        expect(c.examples.length).toBeGreaterThanOrEqual(3);
        expect(c.guided.length).toBeGreaterThanOrEqual(3);
        expect(c.independent.count).toBeGreaterThanOrEqual(6);
        expect(c.quiz.items.length).toBeGreaterThanOrEqual(5);
        expect(c.summary.length).toBeGreaterThanOrEqual(3);
        expect(c.teachMeAgain.length).toBeGreaterThanOrEqual(3);
        expect(new Set(c.teachMeAgain.map((t) => t.approach)).size).toBe(c.teachMeAgain.length);
      });
      it('worked examples explain why (spec §8)', () => {
        const kinds = new Set(c.examples.map((e) => e.kind));
        expect(kinds.has('real-world')).toBe(true);
        expect(kinds.has('common-mistake')).toBe(true);
        for (const e of c.examples) {
          expect(e.steps.length).toBeGreaterThan(1);
          expect(e.steps.some((s) => s.why)).toBe(true);
        }
      });
      it('references only registered generators whose skills the lesson teaches', () => {
        const refs = [...c.guided, ...c.independent.mix, ...c.quiz.items];
        for (const r of refs) {
          const g = GENERATORS.get(r.generator);
          expect(g, r.generator).toBeDefined();
          expect([...meta.skillsTaught, ...meta.reviewSkills].includes(g!.skillId), `${r.generator} skill ${g!.skillId}`).toBe(true);
        }
      });
      it('quiz covers every skill taught', () => {
        const quizSkills = new Set(c.quiz.items.map((r) => GENERATORS.get(r.generator)!.skillId));
        for (const s of meta.skillsTaught) expect(quizSkills.has(s), s).toBe(true);
      });
      it('graph blocks use valid expressions', () => {
        const blocks = [...c.instruction, ...c.examples.flatMap((e) => e.problem), ...c.teachMeAgain.flatMap((t) => t.blocks)];
        for (const b of blocks) if (b.t === 'graph') for (const f of b.spec.functions ?? []) expect(() => parseExpression(f.expr)).not.toThrow();
      });
    });
  }
});
