/** Shared helpers for the QA regression tests (qa-*.test.ts). */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AppDatabase } from '../../src/main/db/database';
import { MemoryLogger } from '../../src/main/logger';
import type { ServiceContext } from '../../src/main/services/context';
import { createProfile } from '../../src/main/services/profiles';
import * as L from '../../src/main/services/lessons';
import * as D from '../../src/main/services/days';
import { getProblem } from '../../src/main/services/practice';
import { canonicalInput } from '../../src/core/engine/problems';
import { LESSONS } from '../../src/content';
import type { LessonView } from '../../src/shared/api';
import type { AnswerSpec } from '../../src/core/math/answers';

export { L, D };

export interface Clock {
  t: number;
  step: number;
}

export async function makeCtx(start = Date.UTC(2026, 8, 7, 14, 0, 0)): Promise<{ ctx: ServiceContext; clock: Clock; pid: number; dir: string }> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acc-qa-'));
  const log = new MemoryLogger();
  const clock: Clock = { t: start, step: 5000 };
  const { db } = await AppDatabase.open(dir, log, () => clock.t);
  db.persistDelayMs = 0;
  const ctx: ServiceContext = { db, log, now: () => (clock.t += clock.step), tzOffset: () => 240, appVersion: 'test', dataDir: dir };
  const pid = createProfile(ctx, 'Sam', 'spark').id;
  return { ctx, clock, pid, dir };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rawState(ctx: ServiceContext, pid: number, id: string): any {
  return JSON.parse(ctx.db.get<{ state_json: string }>('SELECT state_json FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?', [pid, id])!.state_json);
}

function specFor(ctx: ServiceContext, pid: number, id: string, key: string): AnswerSpec {
  const st = rawState(ctx, pid, id);
  for (const ps of [st.guided, st.independent, st.quiz, st.corrections, st.remediation?.practice, st.practice].filter(Boolean)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = ps.items.find((i: any) => i.key === key);
    if (!s) continue;
    const p = getProblem(s.generatorId, s.seed, s.difficulty);
    const stepMode = (ps.activity === 'guided' || ps.activity === 'remediation') && p.steps && p.steps.length > 0;
    return stepMode && s.stepIndex < p.steps!.length ? p.steps![s.stepIndex].answer : p.answer;
  }
  throw new Error('no such key ' + key);
}

export function rightFor(ctx: ServiceContext, pid: number, id: string, key: string): string {
  return canonicalInput(specFor(ctx, pid, id, key));
}

export function wrongFor(ctx: ServiceContext, pid: number, id: string, key: string): string {
  return wrongAnswer(specFor(ctx, pid, id, key));
}

export function solve(ctx: ServiceContext, pid: number, id: string, view: LessonView): LessonView {
  let v = view;
  for (let g = 0; g < 300; g++) {
    const pv = v.practice!;
    if (pv.complete) return v;
    const pr = pv.problems[pv.currentIndex];
    if (pr.state === 'open') {
      v = L.submitAnswer(ctx, pid, id, pr.key, rightFor(ctx, pid, id, pr.key), 20_000);
      continue;
    }
    if (v.section === 'guided' && v.canAdvance) return v;
    if (v.section === 'mastery' && v.remediation && !v.remediation.active) return v;
    v = L.nextProblem(ctx, pid, id);
  }
  throw new Error('practice did not finish');
}

/** Open a lesson and work it up to the quiz. */
export function toQuiz(ctx: ServiceContext, pid: number, id: string): LessonView {
  let v = L.openLesson(ctx, pid, id);
  for (let i = 0; i < 4; i++) v = L.advanceSection(ctx, pid, id);
  v = solve(ctx, pid, id, v);
  v = L.advanceSection(ctx, pid, id);
  v = solve(ctx, pid, id, v);
  return L.advanceSection(ctx, pid, id);
}

export function answerQuiz(ctx: ServiceContext, pid: number, id: string, v: LessonView, wrong: number): LessonView {
  for (const [i, p] of v.practice!.problems.map((x) => x.key).entries()) v = L.submitAnswer(ctx, pid, id, p, i < wrong ? wrongFor(ctx, pid, id, p) : rightFor(ctx, pid, id, p), 30_000);
  return L.finishQuiz(ctx, pid, id);
}

export function completeLesson(ctx: ServiceContext, pid: number, id: string): LessonView {
  let v = answerQuiz(ctx, pid, id, toQuiz(ctx, pid, id), 0);
  for (let i = 0; i < 3; i++) v = L.advanceSection(ctx, pid, id);
  return v;
}

/** Mark every day before `id` completed (lessons with practice complete) so `id` can be opened. */
export function unlockUpTo(ctx: ServiceContext, pid: number, id: string, at = 1): void {
  for (const l of LESSONS) {
    if (l.id === id) break;
    const st = l.kind === 'lesson' ? '{"v":1,"quizAttempts":1}' : '{"v":1,"day":true}';
    ctx.db.run(
      "INSERT OR IGNORE INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at, practice_complete) VALUES (?,?,'completed','summary',?,?,?,?,?)",
      [pid, l.id, st, at, at, at, l.kind === 'lesson' ? 1 : 0],
    );
  }
}

export function dayAnswer(ctx: ServiceContext, pid: number, id: string, key: string): string {
  const st = rawState(ctx, pid, id);
  for (const ps of [st.practice, st.corrections]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = ps?.items.find((i: any) => i.key === key);
    if (s) return canonicalInput(getProblem(s.generatorId, s.seed, s.difficulty).answer);
  }
  throw new Error('no such key ' + key);
}

/** A readable but wrong answer for any answer kind. */
export function wrongAnswer(a: AnswerSpec): string {
  switch (a.kind) {
    case 'choice':
      return a.options.find((o) => o.id !== a.correct)!.id;
    case 'point':
    case 'region-point':
      return '(987654, -987654)';
    case 'sequence-terms':
      return a.values.map(() => '987654').join(', ');
    case 'interval':
      return '[987654, 987655]';
    case 'expression':
      return `(${a.value}) + 1`;
    case 'equation':
      // keep the requested form (e.g. slope-intercept) so the answer is read, just wrong
      return /^y\s*=/.test(a.value) ? 'y = 987654x + 1' : `${a.value} + 1`;
    case 'inequality':
      return a.value.replace(/<=|>=|<|>/, (m) => ({ '<': '>=', '>': '<=', '<=': '>', '>=': '<' })[m as '<']);
    default:
      return '987654';
  }
}

function dayWrong(ctx: ServiceContext, pid: number, id: string, key: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = rawState(ctx, pid, id).practice.items.find((i: any) => i.key === key);
  return wrongAnswer(getProblem(s.generatorId, s.seed, s.difficulty).answer);
}

/** Take a unit/semester assessment answering the first `wrong` items wrong. */
export function takeAssessment(ctx: ServiceContext, pid: number, id: string, wrong: number, retake = false) {
  let v = retake ? D.retakeDay(ctx, pid, id) : D.startDay(ctx, pid, id);
  for (const [i, p] of v.practice!.problems.entries()) v = D.daySubmit(ctx, pid, id, p.key, i < wrong ? dayWrong(ctx, pid, id, p.key) : dayAnswer(ctx, pid, id, p.key), 30_000);
  return D.finishDay(ctx, pid, id);
}

/** Work through any open corrections of a day so it can be retaken. */
export function finishDayCorrections(ctx: ServiceContext, pid: number, id: string) {
  let v = D.openDay(ctx, pid, id);
  for (let g = 0; g < 200 && v.corrections && v.corrections.problems.some((p) => p.state === 'open'); g++) {
    const p = v.corrections.problems[v.corrections.currentIndex];
    if (p.state === 'open') v = D.daySubmit(ctx, pid, id, p.key, dayAnswer(ctx, pid, id, p.key), 30_000);
    else v = D.dayNext(ctx, pid, id);
  }
  return v;
}
