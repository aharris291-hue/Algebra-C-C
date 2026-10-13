import { describe, it, expect } from 'vitest';
import { ALL_GENERATORS, CAPSTONE_CONTENT, LESSONS, SKILLS, generatorsForSkill } from '../../src/content';
import { reviewRefs } from '../../src/main/services/practice';
import { makeCtx, D, unlockUpTo, rawState } from './qa-helpers';

describe('capstone project tasks stay in their projects (M2)', () => {
  it('every capstone task generator is project-only, and only those are', () => {
    const capTasks = new Set([...CAPSTONE_CONTENT.values()].flatMap((c) => c.tasks.map((t) => t.generator)));
    for (const g of ALL_GENERATORS) expect(!!g.projectOnly, g.id).toBe(capTasks.has(g.id) || g.id.startsWith('u9.'));
    expect(capTasks.size).toBeGreaterThan(0);
  });

  it('generatorsForSkill never returns a project task, and every skill that had one still has generators', () => {
    for (const s of SKILLS) {
      const gens = generatorsForSkill(s.id);
      expect(gens.filter((g) => g.projectOnly).map((g) => g.id)).toEqual([]);
      if (ALL_GENERATORS.some((g) => g.skillId === s.id)) expect(gens.length, s.id).toBeGreaterThan(0);
    }
  });

  it('spaced review never picks a project task', () => {
    const states = new Map(SKILLS.map((s) => [s.id, { stage: 'MASTERED', score: 0.5, nextReviewAt: 0 }]));
    for (let seed = 1; seed <= 40; seed++) {
      const withTasks = [...new Set(ALL_GENERATORS.filter((g) => g.projectOnly).map((g) => g.skillId))];
      const refs = reviewRefs(states, withTasks, 12, Date.now(), seed);
      expect(refs.filter((r) => r.generator.startsWith('u9.'))).toEqual([]);
    }
  });

  it('no review, checkpoint or assessment day ever realizes a project task', { timeout: 240_000 }, async () => {
    const days = LESSONS.filter((l) => l.kind !== 'lesson' && l.kind !== 'capstone');
    for (const day of days) {
      for (let rep = 0; rep < 3; rep++) {
        const { ctx, pid } = await makeCtx(Date.UTC(2026, 8, 7, 14, 0, 0) + rep * 7919);
        unlockUpTo(ctx, pid, day.id);
        D.openDay(ctx, pid, day.id);
        D.startDay(ctx, pid, day.id);
        const items = rawState(ctx, pid, day.id).practice.items as Array<{ generatorId: string }>;
        expect(items.length).toBeGreaterThan(0);
        expect(items.filter((i) => i.generatorId.startsWith('u9.')).map((i) => `${day.id} ${i.generatorId}`)).toEqual([]);
      }
    }
  });
});
