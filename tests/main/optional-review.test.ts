import { describe, it, expect } from 'vitest';
import { LESSON_BY_ID } from '../../src/content';
import { getCourse } from '../../src/main/services/lessons';
import { getStudentDashboard, getParentDashboard, getWeeklyReport, paceFor } from '../../src/main/services/dashboard';
import { LESSONS, SKILLS } from '../../src/content';
import { isDoneForProgress } from '../../src/shared/progress';
import { makeCtx, D, unlockUpTo, completeLesson, takeAssessment } from './qa-helpers';
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
    // the review stays the suggested next day; the assessment is open anyway (open access)
    expect(day(ctx, pid, 'U3L04').suggestedNext).toBe(true);
    expect(getStudentDashboard(ctx, pid).continueLesson?.lessonId).toBe('U3L04');
    expect(day(ctx, pid, 'U3L05').status).toBe('available');
    D.openDay(ctx, pid, 'U3L05');
    expect(() => D.startDay(ctx, pid, 'U3L05')).not.toThrow();
  });

  it('a skipped optional review counts as done everywhere progress is shown, and student and parent agree', async () => {
    const { ctx, pid } = await makeCtx();
    unlockUpTo(ctx, pid, 'U3L01');
    for (const id of ['U3L01', 'U3L02', 'U3L03']) completeLesson(ctx, pid, id);
    setStages(ctx, pid, LESSON_BY_ID.get('U3L04')!.skillsAssessed, 'PROFICIENT');
    D.openDay(ctx, pid, 'U3L05');
    expect(takeAssessment(ctx, pid, 'U3L05', 0).results?.passed).toBe(true);
    for (const id of ['U4L01', 'U4L02']) completeLesson(ctx, pid, id);
    expect(day(ctx, pid, 'U3L04').optional).toBe(true);
    expect(day(ctx, pid, 'U3L04').status).toBe('available'); // skipped, still open for extra practice

    const units = getCourse(ctx, pid);
    const u3 = units.find((u) => u.id === 'U3')!;
    expect(u3.completedCount).toBe(u3.lessons.length); // the course map shows Unit 3 finished
    const course = units.flatMap((u) => u.lessons);
    const done = course.filter(isDoneForProgress).length;
    const sd = getStudentDashboard(ctx, pid);
    const pd = getParentDashboard(ctx, pid);
    expect(sd.currentUnit?.id).toBe('U4');
    expect(pd.overview.currentUnit).toBe(`Unit 4: ${sd.currentUnit?.title}`);
    expect(sd.semester.currentWeek).toBe(LESSON_BY_ID.get('U4L03')!.week);
    expect(sd.semester.completedLessons).toBe(done);
    expect(pd.overview.lessonsCompleted).toBe(done);
    expect(pd.overview.semesterPercent).toBe(sd.semester.percent);
    expect(paceFor(ctx, pid).completedDays).toBe(done);
    expect(sd.upcoming.map((c) => c.id)).not.toContain('U3L04');
    expect(pd.upcoming.map((c) => c.id)).not.toContain('U3L04');
    expect(pd.comingUp.nextLessons[0].id).toBe('U4L03');
    expect(pd.comingUp.milestones.join(' ')).toMatch(/Unit 4 .* is finished after/);
    expect(pd.comingUp.milestones.join(' ')).not.toMatch(/Unit 3/);
    expect(getWeeklyReport(ctx, pid).recommendedFocus).toContain(`Next lesson: ${LESSON_BY_ID.get('U4L03')!.title}`);
  });

  it('with every other day done and the unit reviews skipped, the semester reaches 100%', async () => {
    const { ctx, pid } = await makeCtx();
    unlockUpTo(ctx, pid, 'U1L01');
    const now = Date.now();
    for (const l of LESSONS)
      if (l.kind !== 'unit-review')
        ctx.db.run("INSERT OR REPLACE INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,'completed','summary','{}',?,?,?)", [pid, l.id, now, now, now]);
    setStages(ctx, pid, SKILLS.map((s) => s.id), 'PROFICIENT');
    const reviews = LESSONS.filter((l) => l.kind === 'unit-review');
    expect(reviews.length).toBeGreaterThan(0);
    for (const r of reviews) expect(day(ctx, pid, r.id).optional).toBe(true);
    const sd = getStudentDashboard(ctx, pid);
    const pd = getParentDashboard(ctx, pid);
    expect(sd.semester.percent).toBe(100);
    expect(pd.overview.semesterPercent).toBe(100);
    expect(pd.overview.lessonsRemaining).toBe(0);
    expect(pd.comingUp.milestones).toContain('Every course day is finished.');
  });
});
