/**
 * QA regressions: quiz/assessment durations are active time (never negative, overnight gaps
 * excluded), and finished quizzes/assessments are written to disk immediately.
 */
import { vi } from 'vitest';
import { getParentDashboard } from '../../src/main/services/dashboard';
import { ACTIVE_GAP_CAP_MS } from '../../src/main/services/lessons';
import { makeCtx, L, D, rightFor, toQuiz, unlockUpTo, dayAnswer } from './qa-helpers';

describe('assessment durations', () => {
  it('an overnight break in the middle of a quiz is not counted as quiz time', async () => {
    const { ctx, pid, clock } = await makeCtx();
    let v = toQuiz(ctx, pid, 'U1L01');
    const keys = v.practice!.problems.map((p) => p.key);
    keys.slice(0, 3).forEach((k) => (v = L.submitAnswer(ctx, pid, 'U1L01', k, rightFor(ctx, pid, 'U1L01', k), 20_000)));
    clock.t += 14 * 3_600_000; // the app is closed overnight
    keys.slice(3).forEach((k) => (v = L.submitAnswer(ctx, pid, 'U1L01', k, rightFor(ctx, pid, 'U1L01', k), 20_000)));
    v = L.finishQuiz(ctx, pid, 'U1L01');
    expect(v.results!.durationMs).toBeGreaterThan(0);
    expect(v.results!.durationMs).toBeLessThanOrEqual(ACTIVE_GAP_CAP_MS + 60_000);
    const row = getParentDashboard(ctx, pid).assessments.find((a) => a.kind === 'quiz')!;
    expect(row.durationMs).toBe(v.results!.durationMs);
    expect(ctx.db.get<{ a: number }>("SELECT active_ms AS a FROM assessments WHERE kind = 'quiz'")!.a).toBe(v.results!.durationMs);
  });

  it('a clock set back during a test-out never gives a negative duration', async () => {
    const { ctx, pid, clock } = await makeCtx();
    let v = L.startTestOut(ctx, pid, 'U1L01');
    clock.t -= 2 * 3_600_000;
    for (const p of v.practice!.problems) v = L.submitAnswer(ctx, pid, 'U1L01', p.key, rightFor(ctx, pid, 'U1L01', p.key), 20_000);
    v = L.finishQuiz(ctx, pid, 'U1L01');
    expect(v.results!.durationMs).toBeGreaterThanOrEqual(0);
    expect(getParentDashboard(ctx, pid).assessments[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('unit assessment time excludes long gaps and clock changes', async () => {
    const { ctx, pid, clock } = await makeCtx();
    unlockUpTo(ctx, pid, 'U1L12');
    D.openDay(ctx, pid, 'U1L12');
    let v = D.startDay(ctx, pid, 'U1L12');
    v.practice!.problems.forEach((p, i) => {
      if (i === 2) clock.t += 20 * 3_600_000;
      if (i === 4) clock.t -= 3 * 3_600_000;
      v = D.daySubmit(ctx, pid, 'U1L12', p.key, dayAnswer(ctx, pid, 'U1L12', p.key), 20_000);
    });
    v = D.finishDay(ctx, pid, 'U1L12');
    expect(v.results!.durationMs).toBeGreaterThanOrEqual(0);
    expect(v.results!.durationMs).toBeLessThan(3 * ACTIVE_GAP_CAP_MS);
  });
});

describe('immediate save', () => {
  it('finishing a quiz and an assessment writes the database to disk right away', async () => {
    const { ctx, pid } = await makeCtx();
    ctx.db.persistDelayMs = 60_000; // batched writes would wait a minute
    const spy = vi.spyOn(ctx.db, 'flushNow');
    let v = toQuiz(ctx, pid, 'U1L01');
    for (const p of v.practice!.problems) v = L.submitAnswer(ctx, pid, 'U1L01', p.key, rightFor(ctx, pid, 'U1L01', p.key), 20_000);
    spy.mockClear();
    L.finishQuiz(ctx, pid, 'U1L01');
    expect(spy).toHaveBeenCalled();
    unlockUpTo(ctx, pid, 'U1L12');
    D.openDay(ctx, pid, 'U1L12');
    let d = D.startDay(ctx, pid, 'U1L12');
    for (const p of d.practice!.problems) d = D.daySubmit(ctx, pid, 'U1L12', p.key, dayAnswer(ctx, pid, 'U1L12', p.key), 20_000);
    spy.mockClear();
    D.finishDay(ctx, pid, 'U1L12');
    expect(spy).toHaveBeenCalled();
  });
});
