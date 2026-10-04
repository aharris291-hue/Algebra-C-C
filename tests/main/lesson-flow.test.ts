/**
 * Drives the complete first lesson through the main-process services exactly as the UI
 * does: every section, guided steps, practice, quiz (fail -> remediation -> retake -> pass),
 * completion, unlocking, autosave/resume, test-out, and the records written along the way.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AppDatabase } from '../../src/main/db/database';
import { MemoryLogger } from '../../src/main/logger';
import type { ServiceContext } from '../../src/main/services/context';
import { setupParent } from '../../src/main/services/parent';
import { createProfile } from '../../src/main/services/profiles';
import * as L from '../../src/main/services/lessons';
import type { LessonState } from '../../src/main/services/lessons';
import { getProblem } from '../../src/main/services/practice';
import { canonicalInput } from '../../src/core/engine/problems';
import { listAchievements } from '../../src/main/services/achievements';
import { totalXp } from '../../src/main/services/records';
import type { LessonView } from '../../src/shared/api';

const LESSON = 'U1L01';

async function makeCtx(): Promise<ServiceContext> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acc-flow-'));
  const log = new MemoryLogger();
  let t = Date.UTC(2026, 7, 10, 15, 0, 0);
  const { db } = await AppDatabase.open(dir, log, () => t);
  db.persistDelayMs = 0;
  return { db, log, now: () => (t += 5000), tzOffset: () => 240, appVersion: 'test', dataDir: dir };
}

function state(ctx: ServiceContext, pid: number, lessonId = LESSON): LessonState {
  const r = ctx.db.get<{ state_json: string }>('SELECT state_json FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?', [pid, lessonId])!;
  return JSON.parse(r.state_json);
}

/** The exact correct input for the problem's current step (what a strong student types). */
function correctInput(ctx: ServiceContext, pid: number, key: string): string {
  const st = state(ctx, pid);
  const all = [st.guided, st.independent, st.quiz, st.corrections, st.remediation?.practice].filter(Boolean);
  for (const ps of all) {
    const s = ps!.items.find((i) => i.key === key);
    if (!s) continue;
    const p = getProblem(s.generatorId, s.seed, s.difficulty);
    const stepMode = (ps!.activity === 'guided' || ps!.activity === 'remediation') && p.steps && p.steps.length > 0;
    return canonicalInput(stepMode && s.stepIndex < p.steps!.length ? p.steps![s.stepIndex].answer : p.answer);
  }
  throw new Error('no such key ' + key);
}

function wrongInput(ctx: ServiceContext, pid: number, key: string): string {
  const right = correctInput(ctx, pid, key);
  if (/^-?\d+(\.\d+)?$/.test(right)) return String(Number(right) + 1);
  if (right === 'yes') return 'no';
  if (right === 'no') return 'yes';
  return '999';
}

/** Answer every open problem in the current practice set correctly, advancing as the UI would. */
function solvePractice(ctx: ServiceContext, pid: number, view: LessonView, opts: { wrongFirst?: boolean } = {}): LessonView {
  let v = view;
  for (let guard = 0; guard < 200; guard++) {
    const pv = v.practice!;
    if (pv.complete) return v;
    const pr = pv.problems[pv.currentIndex];
    if (pr.state === 'open') {
      if (opts.wrongFirst && pr.attempts === 0 && !pr.step) v = L.submitAnswer(ctx, pid, LESSON, pr.key, wrongInput(ctx, pid, pr.key), 20_000);
      v = L.submitAnswer(ctx, pid, LESSON, pr.key, correctInput(ctx, pid, pr.key), 20_000);
      continue;
    }
    if (v.section === 'guided' && v.canAdvance) return v;
    v = L.nextProblem(ctx, pid, LESSON);
  }
  throw new Error('practice did not finish');
}

function answerQuiz(ctx: ServiceContext, pid: number, v: LessonView, wrongCount: number): LessonView {
  const keys = v.practice!.problems.map((p) => p.key);
  keys.forEach((k, i) => {
    v = L.submitAnswer(ctx, pid, LESSON, k, i < wrongCount ? wrongInput(ctx, pid, k) : correctInput(ctx, pid, k), 30_000);
  });
  return v;
}

describe('lesson player: U1L01 end to end', () => {
  it('runs every section, remediates a failed quiz, passes the retake, completes and unlocks the next lesson', async () => {
    const ctx = await makeCtx();
    setupParent(ctx, '2580');
    const pid = createProfile(ctx, 'Jordan', 'spark').id;

    // before starting: lesson 1 is available, lesson 2 is locked
    let course = L.getCourse(ctx, pid).flatMap((u) => u.lessons);
    expect(course.find((l) => l.id === 'U1L01')!.status).toBe('available');
    expect(course.find((l) => l.id === 'U1L02')!.status).not.toBe('available');

    let v = L.openLesson(ctx, pid, LESSON);
    expect(v.section).toBe('goal');
    expect(v.practice).toBeNull();
    // cannot skip ahead
    expect(() => L.goToSection(ctx, pid, LESSON, 'quiz')).toThrow(/Finish the current section/);

    for (const s of ['goal', 'needToKnow', 'instruction', 'examples'] as const) {
      expect(v.section).toBe(s);
      v = L.advanceSection(ctx, pid, LESSON);
    }
    expect(v.section).toBe('guided');
    expect(v.canAdvance).toBe(false);
    expect(() => L.advanceSection(ctx, pid, LESSON)).toThrow(/guided/);

    // guided: a hint then the work, step by step
    const first = v.practice!.problems[0];
    v = L.requestHint(ctx, pid, LESSON, first.key);
    expect(v.practice!.problems[0].hintsShown.length).toBe(1);
    v = solvePractice(ctx, pid, v);
    expect(v.canAdvance).toBe(true);
    v = L.advanceSection(ctx, pid, LESSON);

    // independent practice (some wrong first tries)
    expect(v.section).toBe('independent');
    expect(v.practice!.problems[0].solution).toBeUndefined(); // no solution leaks before it is finished
    v = solvePractice(ctx, pid, v, { wrongFirst: true });
    expect(v.canAdvance).toBe(true);
    v = L.advanceSection(ctx, pid, LESSON);

    // quiz: deferred feedback, no hints
    expect(v.section).toBe('quiz');
    expect(v.practice!.deferredFeedback).toBe(true);
    expect(() => L.requestHint(ctx, pid, LESSON, v.practice!.problems[0].key)).toThrow(/Hints are not available/);
    expect(() => L.finishQuiz(ctx, pid, LESSON)).toThrow(/Answer every question/);
    v = answerQuiz(ctx, pid, v, 3); // 3 of 6 wrong -> 50%, fails the 80% bar
    // during the quiz the answers are not revealed
    expect(v.practice!.problems.every((p) => p.correctAnswer === undefined)).toBe(true);
    expect(() => L.goToSection(ctx, pid, LESSON, 'instruction')).toThrow(/Finish the quiz/);
    v = L.finishQuiz(ctx, pid, LESSON);
    expect(v.section).toBe('feedback');
    expect(v.results!.passed).toBe(false);
    expect(v.results!.percent).toBe(50);
    expect(v.results!.items.filter((i) => !i.correct).length).toBe(3);
    expect(v.results!.items.every((i) => i.correctAnswer.length > 0 && i.solution.length > 0)).toBe(true);
    expect(v.corrections!.problems.length).toBe(3);
    expect(v.results!.canRetake).toBe(true);

    // feedback -> mastery; mastery is blocked until passed
    v = L.advanceSection(ctx, pid, LESSON);
    expect(v.section).toBe('mastery');
    expect(v.canAdvance).toBe(false);
    expect(() => L.retakeQuiz(ctx, pid, LESSON)).toThrow(/targeted practice/);

    // Teach Me Again gives a different approach each time
    const t1 = L.teachMeAgain(ctx, pid, LESSON);
    const t2 = L.teachMeAgain(ctx, pid, LESSON);
    expect(t1.approach).not.toBe(t2.approach);
    expect(ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM teach_again_events WHERE profile_id = ?', [pid])!.n).toBe(2);

    v = L.startRemediation(ctx, pid, LESSON);
    expect(v.remediation!.active).toBe(true);
    expect(v.practice!.activity).toBe('remediation');
    v = solvePractice(ctx, pid, v);
    expect(state(ctx, pid).remediation!.done).toBe(true);

    v = L.retakeQuiz(ctx, pid, LESSON);
    expect(v.section).toBe('quiz');
    v = answerQuiz(ctx, pid, v, 0);
    v = L.finishQuiz(ctx, pid, LESSON);
    expect(v.results!.passed).toBe(true);
    expect(v.results!.percent).toBe(100);
    expect(v.results!.attemptNumber).toBe(2);

    v = L.advanceSection(ctx, pid, LESSON); // feedback -> mastery
    expect(v.section).toBe('mastery');
    expect(v.canAdvance).toBe(true);
    v = L.advanceSection(ctx, pid, LESSON); // -> summary
    expect(v.section).toBe('summary');
    v = L.advanceSection(ctx, pid, LESSON); // finish
    expect(v.status).toBe('completed');

    const row = ctx.db.get<{ status: string; quiz_best: number }>('SELECT status, quiz_best FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?', [pid, LESSON])!;
    expect(row).toEqual({ status: 'completed', quiz_best: 100 });
    const quizzes = ctx.db.all<{ attempt_number: number; score: number; max_score: number }>("SELECT attempt_number, score, max_score FROM assessments WHERE profile_id = ? AND kind = 'quiz' ORDER BY id", [pid]);
    expect(quizzes).toEqual([
      { attempt_number: 1, score: 3, max_score: 6 },
      { attempt_number: 2, score: 6, max_score: 6 },
    ]);

    course = L.getCourse(ctx, pid).flatMap((u) => u.lessons);
    expect(course.find((l) => l.id === 'U1L01')!.status).toBe('completed');
    expect(['available', 'coming_soon']).toContain(course.find((l) => l.id === 'U1L02')!.status);

    expect(totalXp(ctx, pid)).toBeGreaterThan(0);
    const earned = listAchievements(ctx, pid).filter((a) => a.earnedAt).map((a) => a.id);
    expect(earned).toEqual(expect.arrayContaining(['first-correct', 'first-lesson', 'first-quiz', 'perfect-quiz', 'comeback']));
    // XP for lesson completion is awarded once only
    expect(ctx.db.get<{ n: number }>("SELECT COUNT(*) AS n FROM xp_events WHERE profile_id = ? AND reason = 'lesson-complete'", [pid])!.n).toBe(1);
  });

  it('autosaves after every action and resumes on the same problem after a restart', async () => {
    const ctx = await makeCtx();
    const pid = createProfile(ctx, 'Riley', 'spark').id;
    let v = L.openLesson(ctx, pid, LESSON);
    for (let i = 0; i < 4; i++) v = L.advanceSection(ctx, pid, LESSON);
    const key = v.practice!.problems[0].key;
    v = L.requestHint(ctx, pid, LESSON, key);
    ctx.db.close();
    const { db } = await AppDatabase.open(ctx.dataDir, new MemoryLogger(), ctx.now);
    const ctx2 = { ...ctx, db };
    const resumed = L.openLesson(ctx2, pid, LESSON);
    expect(resumed.section).toBe('guided');
    expect(resumed.practice!.problems[0].key).toBe(key);
    expect(resumed.practice!.problems[0].hintsShown.length).toBe(1);
  });

  it('a strong student can test out; a failed test-out sends them to the lesson with no penalty', async () => {
    const ctx = await makeCtx();
    const pid = createProfile(ctx, 'Avery', 'spark').id;
    let v = L.startTestOut(ctx, pid, LESSON);
    expect(v.section).toBe('quiz');
    expect(v.practice!.problems.length).toBe(8); // 6 quiz items + 2 harder
    v = answerQuiz(ctx, pid, v, 0);
    v = L.finishQuiz(ctx, pid, LESSON);
    expect(v.results!.passed).toBe(true);
    expect(v.status).toBe('tested_out');

    const pid2 = createProfile(ctx, 'Casey', 'spark').id;
    let w = L.startTestOut(ctx, pid2, LESSON);
    w = answerQuiz(ctx, pid2, w, 2); // 6/8 = 75% < 85%
    w = L.finishQuiz(ctx, pid2, LESSON);
    expect(w.results!.passed).toBe(false);
    expect(w.section).toBe('goal');
    expect(w.status).toBe('in_progress');
    expect(() => L.startTestOut(ctx, pid2, LESSON)).toThrow(/already/);
  });

  it('invalid input is explained and never counted as a wrong answer', async () => {
    const ctx = await makeCtx();
    const pid = createProfile(ctx, 'Morgan', 'spark').id;
    let v = L.openLesson(ctx, pid, LESSON);
    for (let i = 0; i < 5; i++) v = i < 4 ? L.advanceSection(ctx, pid, LESSON) : v;
    const pr = v.practice!.problems[0];
    if (pr.answerKind === 'choice') return; // choice inputs can't be malformed from the UI
    v = L.submitAnswer(ctx, pid, LESSON, pr.key, '3 +* 4', 10_000);
    expect(v.practice!.problems[0].lastFeedback!.status).toBe('invalid');
    expect(v.practice!.problems[0].attempts).toBe(0);
    expect(ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM attempts WHERE profile_id = ?', [pid])!.n).toBe(0);
  });
});
