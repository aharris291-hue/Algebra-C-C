import { describe, it, expect } from 'vitest';
import { makeCtx, L, rightFor, wrongFor } from './qa-helpers';

describe('a passed Show What You Know shows its results first (L5)', () => {
  it('results with the missed item, its correct answer and the next step; then the summary', async () => {
    const { ctx, pid } = await makeCtx();
    let v = L.startTestOut(ctx, pid, 'U1L01');
    const keys = v.practice!.problems.map((p) => p.key);
    // 7 of 8 right: 87.5%, a pass with one miss
    for (const [i, k] of keys.entries()) v = L.submitAnswer(ctx, pid, 'U1L01', k, i === 0 ? wrongFor(ctx, pid, 'U1L01', k) : rightFor(ctx, pid, 'U1L01', k), 30_000);
    v = L.finishQuiz(ctx, pid, 'U1L01');
    expect(v.status).toBe('tested_out');
    expect(v.section).toBe('feedback');
    const r = v.results!;
    expect(r.passed).toBe(true);
    expect(r.percent).toBe(87.5);
    const missed = r.items.filter((i) => !i.correct);
    expect(missed.length).toBe(1);
    expect(missed[0].correctAnswer).not.toBe('');
    expect(missed[0].solution.length).toBeGreaterThan(0);
    expect(r.nextStep).toMatch(/tested out/i);
    expect(r.nextStep).toMatch(/missed/);
    v = L.advanceSection(ctx, pid, 'U1L01');
    expect(v.section).toBe('summary');
    expect(v.status).toBe('tested_out');
  });
});
