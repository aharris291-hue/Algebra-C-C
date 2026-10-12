/**
 * QA regressions: XP farming through retakes, "two honest attempts" unlock, Show What You Know
 * availability and re-rolls, and which lesson sections qualify a streak day.
 */
import { totalXp } from '../../src/main/services/records';
import { XP_POLICY } from '../../src/core/engine/xp';
import type { LessonView } from '../../src/shared/api';
import type { ServiceContext } from '../../src/main/services/context';
import { makeCtx, L, D, rightFor, toQuiz, answerQuiz, unlockUpTo, takeAssessment, finishDayCorrections } from './qa-helpers';

const xpFor = (ctx: ServiceContext, pid: number, reason: string, ref: string) =>
  Number(ctx.db.get<{ s: number }>('SELECT COALESCE(SUM(amount), 0) AS s FROM xp_events WHERE profile_id = ? AND reason = ? AND ref = ?', [pid, reason, ref])!.s);

function remediate(ctx: ServiceContext, pid: number, id: string, v: LessonView, how: 'solve' | 'reveal'): LessonView {
  v = L.advanceSection(ctx, pid, id);
  v = L.startRemediation(ctx, pid, id);
  for (let g = 0; g < 300 && v.remediation?.active; g++) {
    const pr = v.practice!.problems[v.practice!.currentIndex];
    if (pr.state !== 'open') v = L.nextProblem(ctx, pid, id);
    else if (how === 'solve') v = L.submitAnswer(ctx, pid, id, pr.key, rightFor(ctx, pid, id, pr.key), 20_000);
    else v = pr.canReveal ? L.revealSolution(ctx, pid, id, pr.key) : L.requestHint(ctx, pid, id, pr.key);
  }
  return L.retakeQuiz(ctx, pid, id);
}

describe('XP cannot be farmed with retakes', () => {
  it('retaking a passed unit assessment pays no answer XP', async () => {
    const { ctx, pid } = await makeCtx();
    unlockUpTo(ctx, pid, 'U1L12');
    D.openDay(ctx, pid, 'U1L12');
    let v = takeAssessment(ctx, pid, 'U1L12', 0);
    expect(v.results!.passed).toBe(true);
    const paid = xpFor(ctx, pid, 'answer:assessment', 'U1L12');
    expect(paid).toBeGreaterThan(0);
    const gains: number[] = [];
    for (let r = 0; r < 4; r++) {
      const before = totalXp(ctx, pid);
      v = takeAssessment(ctx, pid, 'U1L12', 0, true);
      expect(v.results!.passed).toBe(true);
      gains.push(totalXp(ctx, pid) - before);
    }
    expect(xpFor(ctx, pid, 'answer:assessment', 'U1L12')).toBe(paid);
    // only one-time skill-stage awards can still appear; repeated retakes end at zero
    expect(gains[gains.length - 1]).toBe(0);
  });

  it('a failed assessment retake pays answer XP only for improving on the best attempt', async () => {
    const { ctx, pid } = await makeCtx();
    unlockUpTo(ctx, pid, 'U1L12');
    D.openDay(ctx, pid, 'U1L12');
    takeAssessment(ctx, pid, 'U1L12', 12);
    const first = xpFor(ctx, pid, 'answer:assessment', 'U1L12');
    finishDayCorrections(ctx, pid, 'U1L12');
    takeAssessment(ctx, pid, 'U1L12', 14, true); // worse
    expect(xpFor(ctx, pid, 'answer:assessment', 'U1L12')).toBe(first);
  });

  it('failing a lesson quiz on purpose, over and over, earns less than passing it', async () => {
    const { ctx, pid } = await makeCtx();
    let v = toQuiz(ctx, pid, 'U1L01');
    const start = totalXp(ctx, pid);
    for (let r = 0; r < 6; r++) {
      v = answerQuiz(ctx, pid, 'U1L01', v, 2); // 4/6: a fail
      expect(v.results!.passed).toBe(false);
      v = remediate(ctx, pid, 'U1L01', v, 'solve');
    }
    const failing = totalXp(ctx, pid) - start;
    // the same lesson passed on the first try
    const { ctx: c2, pid: p2 } = await makeCtx();
    let w = toQuiz(c2, p2, 'U1L01');
    const s2 = totalXp(c2, p2);
    w = answerQuiz(c2, p2, 'U1L01', w, 1); // 5/6: a pass with one miss
    expect(w.results!.passed).toBe(true);
    for (let i = 0; i < 3; i++) w = L.advanceSection(c2, p2, 'U1L01');
    const passing = totalXp(c2, p2) - s2;
    expect(failing).toBeLessThan(passing);
    expect(Number(ctx.db.get<{ s: number }>("SELECT COALESCE(SUM(amount),0) AS s FROM xp_events WHERE profile_id = ? AND ref = 'U1L01' AND reason IN ('answer:remediation','answer:corrections')", [pid])!.s)).toBeLessThanOrEqual(XP_POLICY.supportPracticeXpCap);
  });
});

describe('the next lesson unlocks after two honest quiz attempts', () => {
  it('two junk attempts (every practice problem revealed, every quiz answer wrong) do not unlock it', async () => {
    const { ctx, pid } = await makeCtx();
    const id = 'U1L01';
    let v = L.openLesson(ctx, pid, id);
    for (let i = 0; i < 4; i++) v = L.advanceSection(ctx, pid, id);
    for (const section of ['guided', 'independent']) {
      for (let g = 0; g < 400 && !v.canAdvance; g++) {
        const pr = v.practice!.problems[v.practice!.currentIndex];
        if (pr.state === 'open') v = pr.canReveal ? L.revealSolution(ctx, pid, id, pr.key) : L.requestHint(ctx, pid, id, pr.key);
        else v = L.nextProblem(ctx, pid, id);
      }
      expect(v.section).toBe(section);
      v = L.advanceSection(ctx, pid, id);
    }
    v = answerQuiz(ctx, pid, id, v, 99);
    v = remediate(ctx, pid, id, v, 'reveal');
    v = answerQuiz(ctx, pid, id, v, 99);
    expect(v.results!.attemptNumber).toBe(2);
    expect(L.getCourse(ctx, pid)[0].lessons[1].status).toBe('locked');
  });

  it('an honest struggling student (practice solved, quizzes failed) is unlocked after two attempts', async () => {
    const { ctx, pid } = await makeCtx();
    let v = toQuiz(ctx, pid, 'U1L01');
    v = answerQuiz(ctx, pid, 'U1L01', v, 99); // 0%
    expect(L.getCourse(ctx, pid)[0].lessons[1].status).toBe('locked');
    v = remediate(ctx, pid, 'U1L01', v, 'solve');
    v = answerQuiz(ctx, pid, 'U1L01', v, 99); // 0% again
    expect(L.getCourse(ctx, pid)[0].lessons[1].status).toBe('available');
  });

  it('older saved lessons without the honest count keep their unlock', async () => {
    const { ctx, pid } = await makeCtx();
    ctx.db.run("INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at) VALUES (?, 'U1L01', 'in_progress', 'mastery', '{\"v\":1,\"quizAttempts\":2}', 1, 1)", [pid]);
    expect(L.getCourse(ctx, pid)[0].lessons[1].status).toBe('available');
  });

  it('a lesson saved by an older version keeps its unlock after another attempt (the honest count starts from the old attempts)', async () => {
    const { ctx, pid } = await makeCtx();
    const id = 'U1L01';
    let v = toQuiz(ctx, pid, id);
    v = answerQuiz(ctx, pid, id, v, 99);
    v = remediate(ctx, pid, id, v, 'solve');
    v = answerQuiz(ctx, pid, id, v, 99);
    // strip the honest count, as a save from an older version has none
    const st = JSON.parse(ctx.db.get<{ state_json: string }>('SELECT state_json FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?', [pid, id])!.state_json);
    delete st.honestAttempts;
    delete st.retakeHonest;
    ctx.db.run('UPDATE lesson_progress SET state_json = ? WHERE profile_id = ? AND lesson_id = ?', [JSON.stringify(st), pid, id]);
    expect(L.getCourse(ctx, pid)[0].lessons[1].status).toBe('available');
    // a third attempt after the upgrade (scored 0, but honest) never takes the unlock away
    v = L.openLesson(ctx, pid, id);
    v = remediate(ctx, pid, id, v, 'solve');
    v = answerQuiz(ctx, pid, id, v, 99);
    expect(v.results!.attemptNumber).toBe(3);
    expect(L.getCourse(ctx, pid)[0].lessons[1].status).toBe('available');
    const after = JSON.parse(ctx.db.get<{ state_json: string }>('SELECT state_json FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?', [pid, id])!.state_json);
    expect(after.honestAttempts).toBe(3);
  });
});

describe('Show What You Know', () => {
  it('is offered whenever the service allows it, including after peeking at the lesson', async () => {
    const { ctx, pid } = await makeCtx();
    L.openLesson(ctx, pid, 'U1L01');
    const cl = L.getCourse(ctx, pid)[0].lessons[0];
    expect(cl.status).toBe('in_progress');
    expect(cl.canTestOut).toBe(true);
    expect(() => L.startTestOut(ctx, pid, 'U1L01')).not.toThrow();
  });

  it('is not offered after a finished test-out or a quiz attempt', async () => {
    const { ctx, pid } = await makeCtx();
    let v = L.startTestOut(ctx, pid, 'U1L01');
    v = answerQuiz(ctx, pid, 'U1L01', v, 3);
    expect(v.results!.passed).toBe(false);
    expect(L.getCourse(ctx, pid)[0].lessons[0].canTestOut).toBe(false);
    const { ctx: c2, pid: p2 } = await makeCtx();
    answerQuiz(c2, p2, 'U1L01', toQuiz(c2, p2, 'U1L01'), 3);
    expect(L.getCourse(c2, p2)[0].lessons[0].canTestOut).toBe(false);
  });

  it('starting it again before finishing resumes the same questions', async () => {
    const { ctx, pid } = await makeCtx();
    const a = L.startTestOut(ctx, pid, 'U1L01');
    const b = L.startTestOut(ctx, pid, 'U1L01');
    expect(b.practice!.problems.map((p) => p.key)).toEqual(a.practice!.problems.map((p) => p.key));
    expect(b.practice!.problems.map((p) => JSON.stringify(p.prompt))).toEqual(a.practice!.problems.map((p) => JSON.stringify(p.prompt)));
  });
});

describe('streak days', () => {
  it('reading lesson pages does not qualify a day; finishing practice does', async () => {
    const { ctx, pid } = await makeCtx();
    const sections = () => Number(ctx.db.get<{ n: number }>('SELECT COALESCE(SUM(sections_completed), 0) AS n FROM activity_days WHERE profile_id = ?', [pid])!.n);
    let v = L.openLesson(ctx, pid, 'U1L01');
    for (let i = 0; i < 4; i++) v = L.advanceSection(ctx, pid, 'U1L01'); // goal, need to know, instruction, examples
    expect(v.section).toBe('guided');
    expect(sections()).toBe(0);
    expect(Number(ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM activity_days WHERE profile_id = ? AND qualifying = 1', [pid])!.n)).toBe(0);
  });
});
