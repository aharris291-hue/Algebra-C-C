import { describe, it, expect } from 'vitest';
import { LESSON_BY_ID } from '../../src/content';
import { getCourse } from '../../src/main/services/lessons';
import { getStudentDashboard } from '../../src/main/services/dashboard';
import { makeCtx, D, unlockUpTo } from './qa-helpers';
import type { ServiceContext } from '../../src/main/services/context';

function testedOut(ctx: ServiceContext, pid: number, ids: string[]) {
  for (const id of ids) ctx.db.run("UPDATE lesson_progress SET status = 'tested_out', tested_out = 1 WHERE profile_id = ? AND lesson_id = ?", [pid, id]);
}
function setStages(ctx: ServiceContext, pid: number, skills: string[], stage: string) {
  for (const s of skills) ctx.db.run('INSERT OR REPLACE INTO skill_state(profile_id, skill_id, stage, score, evidence_count, updated_at) VALUES (?,?,?,?,?,?)', [pid, s, stage, 0.9, 8, 1]);
}
const day = (ctx: ServiceContext, pid: number, id: string) => getCourse(ctx, pid).flatMap((u) => u.lessons).find((l) => l.id === id)!;

describe('a unit review can be skipped once the unit is shown (L4)', () => {
  it('lessons tested out and every skill Proficient: the review is optional and the assessment opens', async () => {
    const { ctx, pid } = await makeCtx();
    unlockUpTo(ctx, pid, 'U3L04');
    testedOut(ctx, pid, ['U3L01', 'U3L02', 'U3L03']);
    setStages(ctx, pid, LESSON_BY_ID.get('U3L04')!.skillsAssessed, 'PROFICIENT');
    expect(day(ctx, pid, 'U3L04').optional).toBe(true);
    expect(day(ctx, pid, 'U3L04').status).toBe('available'); // still open for extra practice
    expect(day(ctx, pid, 'U3L05').status).toBe('available');
    expect(day(ctx, pid, 'U3L05').optional).toBeUndefined(); // assessments are never optional
    // the assessment really opens, and the home screen points at it rather than the optional review
    expect(getStudentDashboard(ctx, pid).continueLesson?.lessonId).toBe('U3L05');
    D.openDay(ctx, pid, 'U3L05');
    expect(() => D.startDay(ctx, pid, 'U3L05')).not.toThrow();
    // the review can still be done
    D.openDay(ctx, pid, 'U3L04');
  });

  it('a skill below Proficient keeps the review required', async () => {
    const { ctx, pid } = await makeCtx();
    unlockUpTo(ctx, pid, 'U3L04');
    testedOut(ctx, pid, ['U3L01', 'U3L02', 'U3L03']);
    const skills = LESSON_BY_ID.get('U3L04')!.skillsAssessed;
    setStages(ctx, pid, skills, 'PROFICIENT');
    setStages(ctx, pid, [skills[0]], 'DEVELOPING');
    expect(day(ctx, pid, 'U3L04').optional).toBeUndefined();
    expect(day(ctx, pid, 'U3L05').status).toBe('locked');
  });
});
