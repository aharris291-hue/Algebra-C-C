import { describe, it, expect } from 'vitest';
import { SKILL_BY_ID } from '../../src/content';
import { makeCtx, L, toQuiz, answerQuiz, unlockUpTo, rawState } from './qa-helpers';
import type { ServiceContext } from '../../src/main/services/context';

const LESSON = 'U1L02'; // S1.03 builds on S1.02 and P.SOLVE1; S1.04 builds on S1.02

function setStage(ctx: ServiceContext, pid: number, skill: string, stage: string) {
  ctx.db.run('INSERT OR REPLACE INTO skill_state(profile_id, skill_id, stage, score, evidence_count, updated_at) VALUES (?,?,?,?,?,?)', [pid, skill, stage, stage === 'PROFICIENT' ? 0.8 : 0.3, 6, 1]);
}

async function failedQuiz() {
  const { ctx, pid } = await makeCtx();
  unlockUpTo(ctx, pid, LESSON);
  const q = toQuiz(ctx, pid, LESSON);
  const v = answerQuiz(ctx, pid, LESSON, q, q.practice!.problems.length);
  expect(v.results!.passed).toBe(false);
  return { ctx, pid };
}

describe('remediation refreshes weak prerequisites (M3)', () => {
  it('a prerequisite below Proficient gets one easy refresher problem first, with its worked example', async () => {
    const { ctx, pid } = await failedQuiz();
    setStage(ctx, pid, 'S1.02', 'LEARNING');
    setStage(ctx, pid, 'P.SOLVE1', 'PROFICIENT');
    const v = L.startRemediation(ctx, pid, LESSON);
    const rem = v.remediation!;
    expect(rem.refreshers.map((r) => r.skillId)).toEqual(['S1.02']);
    expect(rem.refreshers[0].example).toBeTruthy();
    expect(rem.refreshers[0].lessonId).toBe('U1L01');
    const items = rawState(ctx, pid, LESSON).remediation.practice.items as Array<{ skillId: string; difficulty: number }>;
    // the refresher comes first, at the easiest level; the missed skills still get their own practice
    expect(items[0].skillId).toBe('S1.02');
    expect(items[0].difficulty).toBe(1);
    const missed = new Set(v.results!.items.filter((i) => !i.correct).map((i) => i.skillId));
    for (const s of missed) expect(items.some((i) => i.skillId === s)).toBe(true);
  });

  it('prerequisites at Proficient or above get no refresher', async () => {
    const { ctx, pid } = await failedQuiz();
    for (const s of ['S1.02', 'P.SOLVE1']) setStage(ctx, pid, s, 'PROFICIENT');
    const v = L.startRemediation(ctx, pid, LESSON);
    expect(v.remediation!.refreshers).toEqual([]);
    const items = rawState(ctx, pid, LESSON).remediation.practice.items as Array<{ skillId: string }>;
    for (const it of items) expect(['S1.03', 'S1.04']).toContain(it.skillId);
  });

  it('never more than two refreshers, and only real prerequisites of the missed skills', async () => {
    const { ctx, pid } = await failedQuiz();
    const v = L.startRemediation(ctx, pid, LESSON);
    const refreshers = v.remediation!.refreshers.map((r) => r.skillId);
    expect(refreshers.length).toBeGreaterThan(0);
    expect(refreshers.length).toBeLessThanOrEqual(2);
    const prereqs = new Set(['S1.03', 'S1.04'].flatMap((s) => SKILL_BY_ID.get(s)!.prerequisites));
    for (const r of refreshers) expect(prereqs.has(r)).toBe(true);
  });
});
