/**
 * QA retest regressions (main process):
 * - refused answers in deferred sets (quiz and diagnostic): never "saved", the refused text is kept as a
 *   draft, and the same wrong-form text sent again is kept as written (item 1, item 7)
 * - known misconception answers can be saved in quizzes (item 5)
 * - a quiz, Show What You Know or assessment in progress is closed-book on the server (item 9)
 */
import { makeCtx, L, D, rightFor, toQuiz, answerQuiz, unlockUpTo, rawState } from './qa-helpers';
import * as G from '../../src/main/services/diagnostic';
import { newPractice, realize, submitDeferred, problemView, getProblem } from '../../src/main/services/practice';
import { checkAnswer } from '../../src/core/math/answers';
import { canonicalInput } from '../../src/core/engine/problems';
import type { ServiceContext } from '../../src/main/services/context';

function diagRight(ctx: ServiceContext, pid: number, key: string): string {
  const run = JSON.parse(ctx.db.get<{ onboarding_json: string }>('SELECT onboarding_json FROM profiles WHERE id = ?', [pid])!.onboarding_json).diagnosticRun;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = run.ps.items.find((i: any) => i.key === key);
  return canonicalInput(getProblem(s.generatorId, s.seed, s.difficulty).answer);
}

describe('refused answers in deferred sets', () => {
  it('diagnostic: a refused answer is not saved, keeps its text and message; submitting the same wrong-form text again scores it as written', async () => {
    const { ctx, pid } = await makeCtx();
    let v = G.startDiagnostic(ctx, pid);
    for (let g = 0; v.phase === 'questions' && v.problem!.answerKind !== 'number'; g++) {
      expect(g).toBeLessThan(40);
      v = G.diagnosticSubmit(ctx, pid, v.problem!.key, diagRight(ctx, pid, v.problem!.key), 20_000);
    }
    const p = v.problem!;
    const right = diagRight(ctx, pid, p.key);
    // unreadable: message shown, nothing saved, the text comes back in the box
    v = G.diagnosticSubmit(ctx, pid, p.key, '2+', 20_000);
    expect(v.problem!.key).toBe(p.key);
    expect(v.problem!.saved).toBe(false);
    expect(v.problem!.lastResponse).toBeUndefined();
    expect(v.problem!.draft).toBe('2+');
    expect(v.problem!.lastFeedback?.status).toBe('invalid');
    // wrong form: a neutral message that offers to keep it
    v = G.diagnosticSubmit(ctx, pid, p.key, `${right} + 0`, 20_000);
    expect(v.problem!.key).toBe(p.key);
    expect(v.problem!.saved).toBe(false);
    expect(v.problem!.lastResponse).toBeUndefined();
    expect(v.problem!.draft).toBe(`${right} + 0`);
    expect(v.problem!.lastFeedback?.status).toBe('wrong-form');
    expect(v.problem!.lastFeedback?.message).toMatch(/submit it again/);
    // the same text again: scored as written (an unsimplified value is not the requested answer)
    const n = () => ctx.db.get<{ n: number }>("SELECT COUNT(*) AS n FROM attempts WHERE profile_id = ? AND problem_key = ? AND activity = 'diagnostic'", [pid, p.key])!.n;
    expect(n()).toBe(0);
    v = G.diagnosticSubmit(ctx, pid, p.key, `${right} + 0`, 20_000);
    expect(v.problem?.key).not.toBe(p.key);
    expect(n()).toBe(1);
  });

  it('diagnostic: an unreadable answer sent twice is still never scored', async () => {
    const { ctx, pid } = await makeCtx();
    let v = G.startDiagnostic(ctx, pid);
    const key = v.problem!.key;
    if (v.problem!.answerKind === 'choice') return;
    v = G.diagnosticSubmit(ctx, pid, key, ')))', 20_000);
    v = G.diagnosticSubmit(ctx, pid, key, ')))', 20_000);
    expect(v.problem!.key).toBe(key);
    expect(v.problem!.lastFeedback?.status).toBe('invalid');
  });

  it('quiz: a refused answer keeps its text as a draft (shown again after moving away and back), and a save clears it', async () => {
    const { ctx, pid } = await makeCtx();
    const id = 'U1L01';
    let v = toQuiz(ctx, pid, id);
    const p = v.practice!.problems.find((x) => x.answerKind === 'number' || x.answerKind === 'expression')!;
    expect(p).toBeTruthy();
    const right = rightFor(ctx, pid, id, p.key);
    v = L.submitAnswer(ctx, pid, id, p.key, '2+', 20_000);
    let q = v.practice!.problems.find((x) => x.key === p.key)!;
    expect(q.saved).toBe(false);
    expect(q.draft).toBe('2+');
    // move to another question and back: the draft and its message are still there together
    v = L.selectProblem(ctx, pid, id, (q.index + 1) % v.practice!.problems.length);
    v = L.selectProblem(ctx, pid, id, q.index);
    q = v.practice!.problems.find((x) => x.key === p.key)!;
    expect(q.draft).toBe('2+');
    expect(q.lastFeedback?.status).toBe('invalid');
    v = L.submitAnswer(ctx, pid, id, p.key, right, 20_000);
    q = v.practice!.problems.find((x) => x.key === p.key)!;
    expect(q.saved).toBe(true);
    expect(q.draft).toBeUndefined();
    expect(q.lastResponse).toBe(right);
    // a refused re-save keeps the saved answer and says so
    v = L.submitAnswer(ctx, pid, id, p.key, '2+', 20_000);
    q = v.practice!.problems.find((x) => x.key === p.key)!;
    expect(q.saved).toBe(true);
    expect(q.lastResponse).toBe(right);
    expect(q.draft).toBe('2+');
    expect(q.lastFeedback?.message).toMatch(/earlier answer is still saved/);
  });

  it('quiz: a known misconception answer (e.g. "y < -5" read off the wrong axis) is saved and graded, not refused as unreadable', async () => {
    const { ctx } = await makeCtx();
    let found = 0;
    for (let seed = 1; seed < 60 && found < 3; seed++) {
      const ps = newPractice('quiz', { seedBase: seed * 7919, deferred: true, hintsAllowed: false });
      const s = realize(ctx, ps, { generator: 'u2.ineq-from-graph', difficulty: ((seed % 3) + 1) as 1 | 2 | 3 });
      ps.items.push(s);
      const p = getProblem(s.generatorId, s.seed, s.difficulty);
      for (const m of p.misconceptions ?? []) {
        // only the misconceptions that cannot be read without the list (another variable)
        if (checkAnswer(p.answer, m.answer).status !== 'invalid') continue;
        expect(checkAnswer(p.answer, m.answer, p.misconceptions).misconception).toBe(m.tag);
        submitDeferred(ps, s.key, m.answer);
        const view = problemView(ps, s, 0);
        expect(view.saved, m.answer).toBe(true);
        expect(view.lastResponse).toBe(m.answer);
        found++;
      }
    }
    expect(found).toBeGreaterThan(0);
  });
});

describe('a quiz, Show What You Know or assessment in progress is closed-book', () => {
  it('lesson quiz: once its questions are shown, the lesson pages and Teach Me Again are refused until it is graded', async () => {
    const { ctx, pid } = await makeCtx();
    const id = 'U1L01';
    let v = toQuiz(ctx, pid, id);
    expect(v.section).toBe('quiz');
    // no answer saved yet: still in progress
    expect(() => L.goToSection(ctx, pid, id, 'examples')).toThrow(/Finish the quiz/);
    expect(() => L.teachMeAgain(ctx, pid, id)).toThrow(/after the quiz/);
    expect(v.content.examples).toEqual([]);
    expect(v.content.instruction).toEqual([]);
    expect(v.teachAgainOptions).toEqual([]);
    v = L.openLesson(ctx, pid, id);
    expect(v.content.examples).toEqual([]);
    expect(ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM teach_again_events WHERE profile_id = ?', [pid])!.n).toBe(0);
    // graded: open again
    v = answerQuiz(ctx, pid, id, v, 99);
    expect(v.results).toBeTruthy();
    expect(v.content.examples.length).toBeGreaterThan(0);
    expect(L.teachMeAgain(ctx, pid, id).blocks.length).toBeGreaterThan(0);
    expect(L.goToSection(ctx, pid, id, 'examples').section).toBe('examples');
  });

  it('Show What You Know: Teach Me Again is refused while it is in progress', async () => {
    const { ctx, pid } = await makeCtx();
    const v = L.startTestOut(ctx, pid, 'U1L01');
    expect(v.content.examples).toEqual([]);
    expect(() => L.teachMeAgain(ctx, pid, 'U1L01')).toThrow(/Show What You Know/);
  });

  it('unit assessment: lessons and Teach Me Again are refused until it is graded', async () => {
    const { ctx, pid } = await makeCtx();
    answerQuiz(ctx, pid, 'U1L01', toQuiz(ctx, pid, 'U1L01'), 0);
    unlockUpTo(ctx, pid, 'U1L12');
    D.openDay(ctx, pid, 'U1L12');
    // the overview alone is not in progress
    expect(L.openLesson(ctx, pid, 'U1L01').lessonId).toBe('U1L01');
    let v = D.startDay(ctx, pid, 'U1L12');
    expect(() => L.teachMeAgain(ctx, pid, 'U1L01')).toThrow(/Finish the .* first/);
    expect(() => L.openLesson(ctx, pid, 'U1L01')).toThrow(/Finish the .* first/);
    for (const p of v.practice!.problems) {
      const st = rawState(ctx, pid, 'U1L12');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = st.practice.items.find((i: any) => i.key === p.key);
      v = D.daySubmit(ctx, pid, 'U1L12', p.key, canonicalInput(getProblem(s.generatorId, s.seed, s.difficulty).answer), 30_000);
    }
    D.finishDay(ctx, pid, 'U1L12');
    expect(L.teachMeAgain(ctx, pid, 'U1L01').blocks.length).toBeGreaterThan(0);
    expect(L.openLesson(ctx, pid, 'U1L01').content.examples.length).toBeGreaterThan(0);
  });
});
