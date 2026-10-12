/**
 * QA regressions: practice-completion grade, grade trend, counted assessment score on the course
 * map, minutes totals, weekly report streak and week validation.
 */
import { gradeFor, getParentDashboard, getStudentDashboard, getWeeklyReport } from '../../src/main/services/dashboard';
import { addStudyTime } from '../../src/main/services/records';
import { makeCtx, L, D, completeLesson, unlockUpTo, dayAnswer, takeAssessment, finishDayCorrections, solve } from './qa-helpers';

const practicePct = (g: ReturnType<typeof gradeFor>) => g.categories.find((c) => c.category === 'practice')!.percent;

describe('practice completion (5% of the grade)', () => {
  it('opening the next lesson does not lower the grade, and finishing its practice counts right away', async () => {
    const { ctx, pid } = await makeCtx();
    completeLesson(ctx, pid, 'U1L01');
    const g0 = gradeFor(ctx, pid);
    expect(practicePct(g0)).toBe(100);
    let v = L.openLesson(ctx, pid, 'U1L02');
    expect(gradeFor(ctx, pid)).toEqual(g0);
    for (let i = 0; i < 4; i++) v = L.advanceSection(ctx, pid, 'U1L02');
    v = solve(ctx, pid, 'U1L02', v);
    v = L.advanceSection(ctx, pid, 'U1L02');
    v = solve(ctx, pid, 'U1L02', v);
    expect(v.canAdvance).toBe(true); // independent practice complete, quiz not taken yet
    expect(ctx.db.get<{ p: number }>('SELECT practice_complete AS p FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?', [pid, 'U1L02'])!.p).toBe(1);
    expect(gradeFor(ctx, pid)).toEqual(g0);
  });

  it('review, assessment and project days never count as lessons with unfinished practice', async () => {
    const { ctx, pid } = await makeCtx();
    unlockUpTo(ctx, pid, 'U1L11');
    ctx.db.run("INSERT INTO assessments(profile_id, kind, ref_id, attempt_number, status, started_at, finished_at, duration_ms, score, max_score, items_json, local_date) VALUES (?, 'quiz', 'U1L01', 1, 'completed', 1, 2, 1, 9, 10, '[]', '2026-09-07')", [pid]);
    expect(practicePct(gradeFor(ctx, pid))).toBe(100);
    D.openDay(ctx, pid, 'U1L11');
    let v = D.startDay(ctx, pid, 'U1L11');
    expect(practicePct(gradeFor(ctx, pid))).toBe(100);
    for (let g = 0; g < 200 && v.practice; g++) {
      const p = v.practice.problems[v.practice.currentIndex];
      if (p.state === 'open') v = D.daySubmit(ctx, pid, 'U1L11', p.key, dayAnswer(ctx, pid, 'U1L11', p.key), 20_000);
      else if (v.practice.problems.every((x) => x.state !== 'open')) break;
      else v = D.dayNext(ctx, pid, 'U1L11');
    }
    D.finishDay(ctx, pid, 'U1L11');
    expect(practicePct(gradeFor(ctx, pid))).toBe(100);
  });

  it('a lesson left with unfinished practice while the student moved on still counts as incomplete', async () => {
    const { ctx, pid } = await makeCtx();
    completeLesson(ctx, pid, 'U1L01');
    L.openLesson(ctx, pid, 'U1L02'); // opened, practice never done
    // the student tests out of U1L03 instead (a later day is started)
    ctx.db.run("INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at, tested_out) VALUES (?, 'U1L03', 'tested_out', 'summary', '{\"v\":1}', ?, ?, ?, 1)", [pid, ctx.now(), ctx.now(), ctx.now()]);
    expect(practicePct(gradeFor(ctx, pid))).toBe(66.7);
  });
});

describe('grade trend', () => {
  it('ends at the current grade, with practice as of each point', async () => {
    const { ctx, pid } = await makeCtx();
    completeLesson(ctx, pid, 'U1L01');
    L.openLesson(ctx, pid, 'U1L02');
    const pd = getParentDashboard(ctx, pid);
    expect(pd.gradeTrend.length).toBeGreaterThan(0);
    expect(pd.gradeTrend[pd.gradeTrend.length - 1].percent).toBe(pd.overview.grade.percent);
    expect(getStudentDashboard(ctx, pid).grade.percent).toBe(pd.overview.grade.percent);
  });

  it('adds a point for today when the grade changed after the last graded work', async () => {
    const { ctx, pid, clock } = await makeCtx();
    completeLesson(ctx, pid, 'U1L01');
    const first = getParentDashboard(ctx, pid).gradeTrend;
    // a later day: an earlier abandoned lesson now counts against practice completion
    clock.t += 3 * 86_400_000;
    L.openLesson(ctx, pid, 'U1L02');
    ctx.db.run("INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at) VALUES (?, 'U1L03', 'in_progress', 'goal', '{\"v\":1}', ?, ?)", [pid, ctx.now(), ctx.now()]);
    const pd = getParentDashboard(ctx, pid);
    expect(pd.gradeTrend.length).toBe(first.length + 1);
    expect(pd.gradeTrend[pd.gradeTrend.length - 1].percent).toBe(pd.overview.grade.percent);
    expect(pd.gradeTrend[0]).toEqual(first[0]); // earlier points keep the practice completion of their time
  });
});

describe('course map score for a unit assessment', () => {
  it('shows the graded score (best of the first two attempts), not a later practice retake', async () => {
    const { ctx, pid } = await makeCtx();
    unlockUpTo(ctx, pid, 'U1L12');
    D.openDay(ctx, pid, 'U1L12');
    let v = takeAssessment(ctx, pid, 'U1L12', 14);
    finishDayCorrections(ctx, pid, 'U1L12');
    v = takeAssessment(ctx, pid, 'U1L12', 11, true);
    const second = v.results!.percent;
    finishDayCorrections(ctx, pid, 'U1L12');
    v = takeAssessment(ctx, pid, 'U1L12', 0, true);
    expect(v.results!.percent).toBe(100);
    expect(v.results!.title).toMatch(/practice retake/);
    const counted = gradeFor(ctx, pid).categories.find((c) => c.category === 'unitAssessments')!.items[0].percent;
    const cl = L.getCourse(ctx, pid).flatMap((u) => u.lessons).find((l) => l.id === 'U1L12')!;
    expect(cl.quizBest).toBe(counted);
    expect(cl.quizBest).toBe(Math.max(second, cl.quizBest!));
    expect(cl.quizBest).toBeLessThan(100);
  });
});

describe('time and weekly reports', () => {
  it('all-time minutes equal the sum of the weekly minutes', async () => {
    const { ctx, pid, clock } = await makeCtx();
    clock.step = 0;
    // 40 s on each of 4 days in two weeks: per-range rounding used to give 3 (all-time) vs 2+2
    for (let d = 0; d < 4; d++) {
      addStudyTime(ctx, pid, null, 'dashboard', 20);
      addStudyTime(ctx, pid, null, 'dashboard', 20);
      clock.t += (d === 1 ? 6 : 1) * 86_400_000;
    }
    const pd = getParentDashboard(ctx, pid);
    expect(pd.time.byWeek.reduce((a, w) => a + w.minutes, 0)).toBe(pd.time.totalMinutes);
  });

  it("a past week's report shows that week's streak, not today's", async () => {
    const { ctx, pid, clock } = await makeCtx(Date.UTC(2026, 8, 7, 14, 0, 0)); // Mon Sep 7
    clock.step = 0;
    for (let d = 0; d < 5; d++) {
      for (let i = 0; i < 21; i++) addStudyTime(ctx, pid, null, 'dashboard', 30); // 10.5 min qualifies the day
      clock.t += 86_400_000;
    }
    clock.t = Date.UTC(2026, 8, 30, 14, 0, 0);
    expect(getStudentDashboard(ctx, pid).streak.current).toBe(0);
    expect(getWeeklyReport(ctx, pid, '2026-09-07').streak).toBe(5);
    expect(getWeeklyReport(ctx, pid, '2026-09-28').streak).toBe(0);
  });

  it('rejects a malformed or impossible week with a friendly message', async () => {
    const { ctx, pid } = await makeCtx();
    for (const w of ['abc', '2026-13-45', '2026-02-30', '2026-1-05']) expect(() => getWeeklyReport(ctx, pid, w)).toThrow(/Choose a valid week/);
    expect(getWeeklyReport(ctx, pid, '2026-09-09').weekStart).toBe('2026-09-07');
  });
});
