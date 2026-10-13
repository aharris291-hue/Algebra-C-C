import { describe, it, expect } from 'vitest';
import { getParentDashboard, getWeeklyReport } from '../../src/main/services/dashboard';
import { makeCtx, L } from './qa-helpers';

describe('repeated Teach Me Again use is a support signal, never a penalty (L1)', () => {
  it('two uses in a lesson are not flagged; three are, in the dashboard and in the weekly report', async () => {
    const { ctx, pid } = await makeCtx();
    L.openLesson(ctx, pid, 'U1L01');
    L.teachMeAgain(ctx, pid, 'U1L01');
    L.teachMeAgain(ctx, pid, 'U1L01');
    expect(getParentDashboard(ctx, pid).supportSignals).toEqual([]);
    const gradeBefore = getParentDashboard(ctx, pid).overview.grade;
    L.teachMeAgain(ctx, pid, 'U1L01');
    const d = getParentDashboard(ctx, pid);
    expect(d.supportSignals.length).toBe(1);
    expect(d.supportSignals[0]).toMatch(/Teach Me Again 3 times/);
    expect(d.supportSignals[0]).toMatch(/not a problem/);
    expect(d.supportSignals[0]).not.toMatch(/penal|bad|warning/i);
    // nothing else changes: no grade, mastery or XP effect
    expect(d.overview.grade).toEqual(gradeBefore);
    const w = getWeeklyReport(ctx, pid);
    expect(w.supportSignals!.length).toBe(1);
    expect(w.summary).toMatch(/support signal/);
  });


});
