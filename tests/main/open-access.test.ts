/**
 * Open access (owner request 2026-10-13): every course day can be opened, started and finished at any
 * time, in any order. Progress numbers, grades, XP, mastery and spaced review stay right, and the
 * student and parent dashboards agree, whatever the order.
 */
import { describe, it, expect } from 'vitest';
import { LESSONS, GENERATORS, LESSON_BY_ID } from '../../src/content';
import { getStudentDashboard, getParentDashboard, getWeeklyReport, gradeFor, paceFor } from '../../src/main/services/dashboard';
import { totalXp } from '../../src/main/services/records';
import { isDoneForProgress } from '../../src/shared/progress';
import type { ServiceContext } from '../../src/main/services/context';
import { makeCtx, L, D, completeLesson, takeAssessment, rawState, rightFor, solve } from './qa-helpers';

const U2_TEST = LESSONS.find((l) => l.unitId === 'U2' && l.kind === 'unit-assessment')!.id;
const course = (ctx: ServiceContext, pid: number) => L.getCourse(ctx, pid).flatMap((u) => u.lessons);
const xpRows = (ctx: ServiceContext, pid: number, reason: string) => ctx.db.all<{ ref: string; amount: number }>('SELECT ref, amount FROM xp_events WHERE profile_id = ? AND reason = ?', [pid, reason]);

/** Every number both dashboards show for progress agrees, and agrees with isDoneForProgress on the course map. */
function expectDashboardsAgree(ctx: ServiceContext, pid: number) {
  const units = L.getCourse(ctx, pid);
  const all = units.flatMap((u) => u.lessons);
  const done = all.filter(isDoneForProgress);
  const sd = getStudentDashboard(ctx, pid);
  const pd = getParentDashboard(ctx, pid);
  expect(sd.semester.completedLessons).toBe(done.length);
  expect(pd.overview.lessonsCompleted).toBe(done.length);
  expect(pd.overview.lessonsRemaining).toBe(all.length - done.length);
  expect(sd.semester.percent).toBe(pd.overview.semesterPercent);
  expect(units.reduce((a, u) => a + u.completedCount, 0)).toBe(done.length);
  const firstOpen = all.find((c) => !isDoneForProgress(c))!;
  const unit = units.find((u) => u.lessons.some((l) => l.id === firstOpen.id))!;
  expect(sd.currentUnit!.id).toBe(unit.id);
  expect(pd.overview.currentUnit).toBe(`Unit ${unit.number}: ${unit.title}`);
  expect(sd.semester.currentWeek).toBe(firstOpen.week);
  expect(sd.upcoming.map((c) => c.id)).toEqual(pd.upcoming.map((c) => c.id));
  expect(pd.comingUp.nextLessons.map((c) => c.id)).toEqual(all.filter((c) => !isDoneForProgress(c)).slice(0, 5).map((c) => c.id));
  expect(sd.upcoming.some(isDoneForProgress)).toBe(false);
  expect(paceFor(ctx, pid).completedDays).toBe(done.length);
  expect(sd.grade).toEqual(pd.overview.grade);
  expect(sd.continueLesson!.lessonId).toBe(all.find((c) => c.suggestedNext)!.id);
  expect(sd.continueLesson!.lessonId).toBe(firstOpen.id);
  expect(getWeeklyReport(ctx, pid).recommendedFocus).toContain(`Next lesson: ${firstOpen.title}`);
  return { sd, pd };
}

describe('open access: any day, any order', () => {
  it('every day is open on a fresh profile; only the first is marked as the suggested next day', async () => {
    const { ctx, pid } = await makeCtx();
    const all = course(ctx, pid);
    expect(all).toHaveLength(LESSONS.length);
    expect(all.every((l) => l.status === 'available' && l.hasContent)).toBe(true);
    expect(all.filter((l) => l.suggestedNext).map((l) => l.id)).toEqual([LESSONS[0].id]);
    // a late lesson, a capstone, the semester review and the semester assessment all open directly
    expect(L.openLesson(ctx, pid, 'U8L03').lessonId).toBe('U8L03');
    for (const id of ['U9L02', 'U9L05', 'U9L06']) expect(D.openDay(ctx, pid, id).phase).toBe('overview');
    expect(D.startDay(ctx, pid, 'U9L06').phase).toBe('practice');
  });

  it('U5L03 first, then the Unit 2 assessment, then U1L01: each counts normally and the dashboards agree after every step', async () => {
    const { ctx, pid } = await makeCtx();

    // 1. a Unit 5 lesson first
    let v = completeLesson(ctx, pid, 'U5L03');
    expect(v.status).toBe('completed');
    expect(course(ctx, pid).find((l) => l.id === 'U5L03')!.status).toBe('completed');
    let { sd } = expectDashboardsAgree(ctx, pid);
    expect(sd.semester.completedLessons).toBe(1);
    expect(sd.currentUnit!.id).toBe('U1'); // the suggested next day is still the first one
    expect(sd.continueLesson!.lessonId).toBe('U1L01');
    expect(sd.continueLesson!.resume).toBe(false);
    expect(gradeFor(ctx, pid).categories.find((c) => c.category === 'quizzes')!.percent).toBe(100);
    const u5 = L.getCourse(ctx, pid).find((u) => u.id === 'U5')!;
    expect(u5.completedCount).toBe(1);
    expect(u5.masteryPercent).toBeGreaterThan(0);
    // mastery: the lesson's skills moved off Not started
    const skills = getStudentDashboard(ctx, pid);
    expect(skills.skills.notStarted).toBeLessThan(skills.skills.total);

    // 2. the Unit 2 assessment before any Unit 2 lesson or review
    D.openDay(ctx, pid, U2_TEST);
    const r = takeAssessment(ctx, pid, U2_TEST, 0);
    expect(r.results!.passed).toBe(true);
    expect(r.status).toBe('completed');
    ({ sd } = expectDashboardsAgree(ctx, pid));
    expect(sd.semester.completedLessons).toBe(2);
    const g = gradeFor(ctx, pid);
    expect(g.categories.find((c) => c.category === 'unitAssessments')!.percent).toBe(100);
    expect(course(ctx, pid).find((l) => l.id === U2_TEST)!.quizBest).toBe(100);
    // the parent's "Coming up" names the Unit 1 assessment as the next one (Unit 2's is done)
    expect(getParentDashboard(ctx, pid).comingUp.nextAssessment!.id).toBe(LESSONS.find((l) => l.unitId === 'U1' && l.kind === 'unit-assessment')!.id);

    // 3. back to the very first lesson: opening it changes no grade, finishing it counts normally
    const before = gradeFor(ctx, pid);
    L.openLesson(ctx, pid, 'U1L01');
    expect(gradeFor(ctx, pid)).toEqual(before);
    completeLesson(ctx, pid, 'U1L01');
    ({ sd } = expectDashboardsAgree(ctx, pid));
    expect(sd.semester.completedLessons).toBe(3);
    expect(sd.continueLesson!.lessonId).toBe('U1L02');
    expect(gradeFor(ctx, pid).categories.find((c) => c.category === 'quizzes')!.items).toHaveLength(2);
    // practice completion stays 100%: every lesson started had its practice finished
    expect(gradeFor(ctx, pid).categories.find((c) => c.category === 'practice')!.percent).toBe(100);

    // XP: each one-time award once per day, never doubled by the order
    const lessonComplete = xpRows(ctx, pid, 'lesson-complete').map((x) => x.ref).sort();
    expect(lessonComplete).toEqual(['U1L01', 'U5L03']);
    expect(xpRows(ctx, pid, 'assessment-pass').map((x) => x.ref)).toEqual([U2_TEST]);
    expect(totalXp(ctx, pid)).toBe(getStudentDashboard(ctx, pid).xp.total);
    expect(totalXp(ctx, pid)).toBe(getParentDashboard(ctx, pid).engagement.xp);
  });

  it('spaced review reaches skills learned out of order (a Unit 5 lesson reviewed inside Unit 1)', async () => {
    const { ctx, pid } = await makeCtx();
    completeLesson(ctx, pid, 'U5L03');
    let v = L.openLesson(ctx, pid, 'U1L02');
    v = L.goToSection(ctx, pid, 'U1L02', 'independent');
    v = solve(ctx, pid, 'U1L02', v);
    const indep = rawState(ctx, pid, 'U1L02').independent;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviewed = [...indep.items, ...indep.pending].filter((x: any) => x.review).map((x: any) => x.skillId ?? GENERATORS.get(x.generator)!.skillId);
    expect(reviewed.length).toBeGreaterThan(0);
    const u5 = LESSON_BY_ID.get('U5L03')!.skillsTaught;
    expect(reviewed.every((s: string) => u5.includes(s))).toBe(true);
  });

  it('opening a lesson out of order never lowers the grade; leaving one unfinished for another day still counts as incomplete', async () => {
    const { ctx, pid } = await makeCtx();
    completeLesson(ctx, pid, 'U5L03');
    const g0 = gradeFor(ctx, pid);
    L.openLesson(ctx, pid, 'U1L01'); // an earlier lesson opened after a later one
    expect(gradeFor(ctx, pid)).toEqual(g0);
    L.openLesson(ctx, pid, 'U3L02'); // moved on to another day: U1L01's practice counts as incomplete
    expect(gradeFor(ctx, pid).categories.find((c) => c.category === 'practice')!.percent).toBe(50);
  });

  it('Home: "Continue learning" goes to the suggested next day; a different day in progress is offered too', async () => {
    const { ctx, pid } = await makeCtx();
    L.openLesson(ctx, pid, 'U5L03');
    const sd = getStudentDashboard(ctx, pid);
    expect(sd.continueLesson).toMatchObject({ lessonId: 'U1L01', resume: false });
    expect(sd.recentLesson).toMatchObject({ lessonId: 'U5L03', resume: true });
    L.openLesson(ctx, pid, 'U1L01');
    const sd2 = getStudentDashboard(ctx, pid);
    expect(sd2.continueLesson).toMatchObject({ lessonId: 'U1L01', resume: true });
    expect(sd2.recentLesson).toBeNull();
  });

  it('inside a lesson any section can be opened; reaching the quiz without guided practice shows a tip, never a block', async () => {
    const { ctx, pid } = await makeCtx();
    let v = L.openLesson(ctx, pid, 'U2L02');
    v = L.goToSection(ctx, pid, 'U2L02', 'summary');
    expect(v.section).toBe('summary');
    expect(v.canAdvance).toBe(false); // the lesson is finished from the summary only after a passed quiz
    v = L.goToSection(ctx, pid, 'U2L02', 'quiz');
    expect(v.section).toBe('quiz');
    expect(v.practice!.activity).toBe('quiz');
    expect(v.suggestion).toMatch(/Guided Practice/);
    // pass the quiz without any practice: the lesson completes normally
    for (const p of v.practice!.problems) v = L.submitAnswer(ctx, pid, 'U2L02', p.key, rightFor(ctx, pid, 'U2L02', p.key), 30_000);
    v = L.finishQuiz(ctx, pid, 'U2L02');
    expect(v.results!.passed).toBe(true);
    expect(v.suggestion).toBeUndefined();
    for (let i = 0; i < 3; i++) v = L.advanceSection(ctx, pid, 'U2L02');
    expect(v.status).toBe('completed');
    expect(course(ctx, pid).find((l) => l.id === 'U2L02')!.status).toBe('completed');
  });
});

