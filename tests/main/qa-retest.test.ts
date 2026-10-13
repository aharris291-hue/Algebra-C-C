/**
 * QA retest regressions (main process):
 * - refused answers in deferred sets (quiz and diagnostic): never "saved", the refused text is kept as a
 *   draft, and the same wrong-form text sent again is kept as written (item 1, item 7)
 * - known misconception answers can be saved in quizzes (item 5)
 * - a quiz, Show What You Know or assessment in progress is closed-book on the server inside it (item 9);
 *   since open access (2026-10-13) the student may leave it, and the visit is noted on the attempt
 */
import { makeCtx, L, D, rightFor, toQuiz, answerQuiz, unlockUpTo, rawState } from './qa-helpers';
import * as G from '../../src/main/services/diagnostic';
import { newPractice, realize, submitDeferred, problemView, getProblem } from '../../src/main/services/practice';
import { checkAnswer } from '../../src/core/math/answers';
import { canonicalInput } from '../../src/core/engine/problems';
import { getParentDashboard, getAssessmentDetail, gradeFor } from '../../src/main/services/dashboard';
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

describe('a quiz, Show What You Know or assessment in progress is closed-book inside, and can be left (open access)', () => {
  it('lesson quiz: inside it the pages and Teach Me Again are closed; leaving for them is allowed, noted on the attempt, and the quiz resumes', async () => {
    const { ctx, pid } = await makeCtx();
    const id = 'U1L01';
    let v = toQuiz(ctx, pid, id);
    expect(v.section).toBe('quiz');
    // inside the quiz: closed-book on the server
    expect(() => L.teachMeAgain(ctx, pid, id)).toThrow(/after the quiz/);
    expect(() => L.requestHint(ctx, pid, id, v.practice!.problems[0].key)).toThrow(/Hints are not available/);
    expect(v.content.examples).toEqual([]);
    expect(v.content.instruction).toEqual([]);
    expect(v.teachAgainOptions).toEqual([]);
    v = L.openLesson(ctx, pid, id);
    expect(v.content.examples).toEqual([]);
    expect(ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM teach_again_events WHERE profile_id = ?', [pid])!.n).toBe(0);
    const keys = v.practice!.problems.map((p) => p.key);
    v = L.submitAnswer(ctx, pid, id, keys[0], rightFor(ctx, pid, id, keys[0]), 30_000);
    // leaving the quiz for the worked examples is allowed; Teach Me Again works from there
    v = L.goToSection(ctx, pid, id, 'examples');
    expect(v.content.examples.length).toBeGreaterThan(0);
    expect(L.teachMeAgain(ctx, pid, id).blocks.length).toBeGreaterThan(0);
    // back to the quiz: the same questions, the saved answer kept
    v = L.goToSection(ctx, pid, id, 'quiz');
    expect(v.practice!.problems.map((p) => p.key)).toEqual(keys);
    expect(v.practice!.problems[0].saved).toBe(true);
    expect(v.content.examples).toEqual([]);
    // graded normally (all right = 100%), with the visits noted for the parent
    v = answerQuiz(ctx, pid, id, v, 0);
    expect(v.results!.percent).toBe(100);
    expect(v.results!.passed).toBe(true);
    expect(v.results!.leftDuring).toEqual([`${v.title}: Worked Examples`, `${v.title}: Teach Me Again`]);
    const pd = getParentDashboard(ctx, pid);
    const row = pd.assessments.find((a) => a.kind === 'quiz')!;
    expect(row.leftDuring).toBe(2);
    expect(getAssessmentDetail(ctx, pid, row.id).leftDuring).toEqual(v.results!.leftDuring);
    // the next attempt starts with no notes
    expect(rawState(ctx, pid, id).leftDuring).toEqual([]);
    // graded: open again
    expect(v.content.examples.length).toBeGreaterThan(0);
    expect(L.goToSection(ctx, pid, id, 'examples').section).toBe('examples');
  });

  it('Show What You Know: Teach Me Again is refused while it is in progress', async () => {
    const { ctx, pid } = await makeCtx();
    const v = L.startTestOut(ctx, pid, 'U1L01');
    expect(v.content.examples).toEqual([]);
    expect(() => L.teachMeAgain(ctx, pid, 'U1L01')).toThrow(/Show What You Know/);
  });

  it('unit assessment: the student may leave it for a lesson; the visit is noted, it resumes where it was left, and the grade is unchanged', async () => {
    const { ctx, pid } = await makeCtx();
    answerQuiz(ctx, pid, 'U1L01', toQuiz(ctx, pid, 'U1L01'), 0);
    unlockUpTo(ctx, pid, 'U1L12');
    D.openDay(ctx, pid, 'U1L12');
    // the overview alone is not in progress: nothing is noted
    expect(L.openLesson(ctx, pid, 'U1L01').lessonId).toBe('U1L01');
    let v = D.startDay(ctx, pid, 'U1L12');
    const keys = v.practice!.problems.map((p) => p.key);
    const right = (k: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = rawState(ctx, pid, 'U1L12').practice.items.find((i: any) => i.key === k);
      return canonicalInput(getProblem(s.generatorId, s.seed, s.difficulty).answer);
    };
    v = D.daySubmit(ctx, pid, 'U1L12', keys[0], right(keys[0]), 30_000);
    // leave for a lesson and Teach Me Again: allowed (open access), noted on the assessment
    expect(L.openLesson(ctx, pid, 'U1L02').content.examples.length).toBeGreaterThan(0);
    expect(L.teachMeAgain(ctx, pid, 'U1L01').blocks.length).toBeGreaterThan(0);
    expect(rawState(ctx, pid, 'U1L12').leftDuring.map((n: { ref: string; what: string }) => `${n.ref} ${n.what}`)).toEqual(['U1L02 opened the lesson', 'U1L01 Teach Me Again']);
    // inside the assessment hints stay refused
    expect(() => D.dayHint(ctx, pid, 'U1L12', keys[1])).toThrow(/Hints are not available/);
    // coming back resumes the same questions with the saved answer
    v = D.openDay(ctx, pid, 'U1L12');
    expect(v.phase).toBe('practice');
    expect(v.practice!.problems.map((p) => p.key)).toEqual(keys);
    expect(v.practice!.problems[0].saved).toBe(true);
    for (const k of keys.slice(1)) v = D.daySubmit(ctx, pid, 'U1L12', k, right(k), 30_000);
    v = D.finishDay(ctx, pid, 'U1L12');
    expect(v.results!.percent).toBe(100);
    expect(v.results!.passed).toBe(true);
    expect(v.results!.leftDuring).toHaveLength(2);
    expect(v.results!.leftDuring![0]).toMatch(/opened the lesson/);
    // the grade counts it normally; the parent sees the note as information
    expect(gradeFor(ctx, pid).categories.find((c) => c.category === 'unitAssessments')!.percent).toBe(100);
    const row = getParentDashboard(ctx, pid).assessments.find((a) => a.kind === 'unit-assessment')!;
    expect(row.leftDuring).toBe(2);
    expect(getAssessmentDetail(ctx, pid, row.id).leftDuring).toEqual(v.results!.leftDuring);
    // after grading, opening lessons notes nothing more
    L.openLesson(ctx, pid, 'U1L03');
    expect(getAssessmentDetail(ctx, pid, row.id).leftDuring).toHaveLength(2);
  });
});
