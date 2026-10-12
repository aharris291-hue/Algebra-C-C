/**
 * QA follow-up: the guided-step index reaches the lesson service (bug A8), and one-time skill
 * milestone XP is paid at most once per skill, even after a drop and a re-climb.
 */
import { makeCtx, rawState, L } from './qa-helpers';
import { createApi } from '../../src/main/services/api';
import { getProblem } from '../../src/main/services/practice';
import { recordAttempt, recomputeSkill } from '../../src/main/services/records';
import { canonicalInput } from '../../src/core/engine/problems';
import { GENERATORS } from '../../src/content';
import type { ServiceContext } from '../../src/main/services/context';

function steppedGenerator(): string {
  for (const [id] of GENERATORS) {
    try {
      const q = getProblem(id, 1, 1);
      if (q.steps && q.steps.length >= 2 && q.steps[1].answer.kind === 'number') return id;
    } catch {
      /* next */
    }
  }
  throw new Error('no stepped generator');
}

describe('guided step index (A8)', () => {
  it('a lesson submit for a step that is already done is ignored, not graded against the next step', async () => {
    const { ctx, pid } = await makeCtx();
    const id = 'U1L01';
    let v = L.openLesson(ctx, pid, id);
    for (let i = 0; i < 4 && v.section !== 'guided'; i++) v = L.advanceSection(ctx, pid, id);
    expect(v.section).toBe('guided');
    // make the current guided problem one with steps (independent of the lesson's own plan)
    const gen = steppedGenerator();
    const st = rawState(ctx, pid, id);
    const item = st.guided.items[st.guided.current];
    Object.assign(item, { generatorId: gen, seed: 1, difficulty: 1, stepIndex: 0, stepAttempts: 0, attempts: 0, state: 'open' });
    ctx.db.run('UPDATE lesson_progress SET state_json = ? WHERE profile_id = ? AND lesson_id = ?', [JSON.stringify(st), pid, id]);
    const prob = getProblem(gen, 1, 1);
    const api = createApi(ctx);
    v = await api.submitAnswer(pid, id, item.key, canonicalInput(prob.steps![0].answer), 20_000, 0);
    expect(v.practice!.problems[v.practice!.currentIndex].step!.index).toBe(1);
    // a late second click for step 0 carrying another answer: ignored because of the step index
    v = await api.submitAnswer(pid, id, item.key, '987654321', 20_000, 0);
    const p = v.practice!.problems[v.practice!.currentIndex];
    expect(p.step!.index).toBe(1);
    expect(p.lastFeedback?.status).toBe('correct');
    expect(ctx.db.all<{ status: string }>('SELECT status FROM attempts WHERE profile_id = ? AND problem_key = ?', [pid, item.key]).map((r) => r.status)).toEqual(['correct']);
    // the same answer sent for the current step is graded
    v = await api.submitAnswer(pid, id, item.key, '987654321', 20_000, 1);
    expect(v.practice!.problems[v.practice!.currentIndex].lastFeedback?.status).toBe('incorrect');
  });
});

describe('one-time skill milestone XP', () => {
  function answer(ctx: ServiceContext, pid: number, activity: string, correct: boolean, n: number) {
    for (let i = 0; i < n; i++) {
      recordAttempt(ctx, { profileId: pid, lessonId: 'U1L01', activity, skillId: 'S1.01', generatorId: 'g', seed: i, difficulty: 2, problemKey: `${activity}:${i}`, response: '1', status: correct ? 'correct' : 'incorrect', correct, attemptNumber: 1, hintsUsed: 0, maxHintLevel: 0, elapsedMs: 30_000, counted: true, xp: 0, guessing: false });
      recomputeSkill(ctx, pid, 'S1.01');
    }
  }
  const paid = (ctx: ServiceContext, pid: number, reason: string) => ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM xp_events WHERE profile_id = ? AND reason = ? AND ref = ?', [pid, reason, 'S1.01'])!.n;
  const stage = (ctx: ServiceContext, pid: number) => ctx.db.get<{ stage: string }>("SELECT stage FROM skill_state WHERE profile_id = ? AND skill_id = 'S1.01'", [pid])!.stage;

  it('Proficient and Mastered are each paid once per skill, also after the skill drops and climbs back (e.g. an assessment retake)', async () => {
    const { ctx, clock, pid } = await makeCtx();
    answer(ctx, pid, 'independent', true, 4);
    expect(stage(ctx, pid)).toBe('PROFICIENT');
    clock.t += 24 * 3600_000;
    answer(ctx, pid, 'independent', true, 2);
    answer(ctx, pid, 'quiz', true, 2);
    expect(stage(ctx, pid)).toBe('MASTERED');
    expect([paid(ctx, pid, 'skill-proficient'), paid(ctx, pid, 'skill-mastered')]).toEqual([1, 1]);
    // a bad stretch drops it
    answer(ctx, pid, 'independent', false, 8);
    expect(['LEARNING', 'DEVELOPING']).toContain(stage(ctx, pid));
    // climbing back, including with assessment answers from a retake after a pass
    clock.t += 24 * 3600_000;
    answer(ctx, pid, 'independent', true, 8);
    clock.t += 24 * 3600_000;
    answer(ctx, pid, 'assessment', true, 4);
    expect(stage(ctx, pid)).toBe('MASTERED');
    expect([paid(ctx, pid, 'skill-proficient'), paid(ctx, pid, 'skill-mastered')]).toEqual([1, 1]);
  });
});
