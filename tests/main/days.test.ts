/**
 * Unit review and unit assessment days, driven through the services as the UI does.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AppDatabase } from '../../src/main/db/database';
import { MemoryLogger } from '../../src/main/logger';
import type { ServiceContext } from '../../src/main/services/context';
import { setupParent } from '../../src/main/services/parent';
import { createProfile } from '../../src/main/services/profiles';
import * as D from '../../src/main/services/days';
import { lessonStatuses } from '../../src/main/services/lessons';
import { getProblem } from '../../src/main/services/practice';
import { canonicalInput } from '../../src/core/engine/problems';
import { LESSON_BY_ID, SKILL_BY_ID } from '../../src/content';
import { getParentDashboard } from '../../src/main/services/dashboard';

async function makeCtx(): Promise<ServiceContext> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acc-days-'));
  const log = new MemoryLogger();
  let t = Date.UTC(2026, 8, 1, 15, 0, 0);
  const { db } = await AppDatabase.open(dir, log, () => t);
  db.persistDelayMs = 0;
  return { db, log, now: () => (t += 5000), tzOffset: () => 240, appVersion: 'test', dataDir: dir };
}

function dayState(ctx: ServiceContext, pid: number, id: string): D.DayState {
  return JSON.parse(ctx.db.get<{ state_json: string }>('SELECT state_json FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?', [pid, id])!.state_json);
}

function key(ctx: ServiceContext, pid: number, id: string, k: string): string {
  const st = dayState(ctx, pid, id);
  for (const ps of [st.practice, st.corrections]) {
    const s = ps?.items.find((i) => i.key === k);
    if (s) return canonicalInput(getProblem(s.generatorId, s.seed, s.difficulty).answer);
  }
  throw new Error('no key ' + k);
}

function completeLessonsBefore(ctx: ServiceContext, pid: number, day: number) {
  for (const [id, l] of LESSON_BY_ID) {
    if (l.unitId === 'U1' && l.kind === 'lesson' && l.day < day) ctx.db.run("INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,?,?,?,?,?,?)", [pid, id, 'completed', 'summary', '{"v":1,"quizAttempts":1}', 1, 1, 1]);
  }
}

describe('review and assessment days', () => {
  let ctx: ServiceContext;
  let pid: number;
  const REVIEW = 'U1L11';
  const TEST = 'U1L12';
  beforeEach(async () => {
    ctx = await makeCtx();
    setupParent(ctx, '2468');
    pid = createProfile(ctx, 'Sam', 'fox').id;
  });

  it('is locked until the lessons before it are done, then the review works end to end', () => {
    expect(lessonStatuses(ctx, pid).get(REVIEW)!.status).toBe('locked');
    expect(() => D.openDay(ctx, pid, REVIEW)).toThrow(/unlocks/);
    completeLessonsBefore(ctx, pid, LESSON_BY_ID.get(REVIEW)!.day);
    expect(lessonStatuses(ctx, pid).get(REVIEW)!.status).toBe('available');
    let v = D.openDay(ctx, pid, REVIEW);
    expect(v.phase).toBe('overview');
    expect(v.mode).toBe('review');
    expect(v.skills.length).toBe(17);
    v = D.startDay(ctx, pid, REVIEW);
    const practiced = new Set(dayState(ctx, pid, REVIEW).practice!.items.map((i) => i.skillId));
    expect(practiced.size).toBe(17); // every Unit 1 skill appears
    expect(v.practice!.problems.length).toBeLessThanOrEqual(26);
    expect(v.practice!.problems[0].hintsAllowed).toBe(true);
    // a hint and a wrong answer on the first problem, then correct answers everywhere
    const first = v.practice!.problems[0].key;
    v = D.dayHint(ctx, pid, REVIEW, first);
    expect(v.practice!.problems[0].hintsShown.length).toBe(1);
    expect(() => D.finishDay(ctx, pid, REVIEW)).toThrow(/Finish every review problem/);
    while (!v.practice!.complete) {
      const cur = v.practice!.problems[v.practice!.currentIndex];
      if (cur.state === 'open') v = D.daySubmit(ctx, pid, REVIEW, cur.key, key(ctx, pid, REVIEW, cur.key), 20_000);
      else v = D.dayNext(ctx, pid, REVIEW);
    }
    v = D.finishDay(ctx, pid, REVIEW);
    expect(v.phase).toBe('results');
    expect(v.status).toBe('completed');
    expect(v.results!.kind).toBe('review');
    expect(v.results!.score).toBe(v.results!.maxScore - 1); // the hinted one is not a first-try success
    expect(lessonStatuses(ctx, pid).get(TEST)!.status).toBe('available');
  });

  it('assessment: no hints, graded at the end, corrections, retake, best of two counts', () => {
    completeLessonsBefore(ctx, pid, LESSON_BY_ID.get(TEST)!.day);
    ctx.db.run("INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,?,?,?,?,?,?)", [pid, REVIEW, 'completed', 'results', '{"v":1,"day":true}', 1, 1, 1]);
    let v = D.openDay(ctx, pid, TEST);
    expect(v.mode).toBe('assessment');
    expect(v.itemCount).toBe(17 + 6);
    v = D.startDay(ctx, pid, TEST);
    const items = dayState(ctx, pid, TEST).practice!.items;
    expect(items.length).toBe(23);
    for (const s of ['S1.01', 'S1.02', 'S1.03', 'S1.05', 'S1.07', 'S1.12']) expect(items.filter((i) => i.skillId === s).length, s).toBe(2);
    expect(new Set(items.map((i) => i.skillId)).size).toBe(17);
    expect(SKILL_BY_ID.get('S1.12')!.essential).toBe(true);
    const k0 = v.practice!.problems[0].key;
    expect(() => D.dayHint(ctx, pid, TEST, k0)).toThrow(/not available/);
    expect(v.practice!.problems[0].solution).toBeUndefined();
    expect(() => D.finishDay(ctx, pid, TEST)).toThrow(/Answer every question/);
    // attempt 1: get 10 wrong
    v.practice!.problems.forEach((p, i) => {
      const right = key(ctx, pid, TEST, p.key);
      v = D.daySubmit(ctx, pid, TEST, p.key, i < 10 ? (p.answerKind === 'choice' ? '__none__' : '987654') : right, 30_000);
    });
    v = D.finishDay(ctx, pid, TEST);
    expect(v.results!.passed).toBe(false);
    expect(v.results!.score).toBe(13);
    expect(v.status).toBe('in_progress');
    expect(v.corrections!.problems.length).toBe(10);
    expect(v.canRetake).toBe(false);
    expect(() => D.retakeDay(ctx, pid, TEST)).toThrow(/corrections/);
    while (!v.corrections!.complete) {
      const cur = v.corrections!.problems[v.corrections!.currentIndex];
      if (cur.state === 'open') v = D.daySubmit(ctx, pid, TEST, cur.key, key(ctx, pid, TEST, cur.key), 20_000);
      else v = D.dayNext(ctx, pid, TEST);
    }
    expect(v.canRetake).toBe(true);
    v = D.retakeDay(ctx, pid, TEST);
    expect(v.phase).toBe('practice');
    for (const p of v.practice!.problems) v = D.daySubmit(ctx, pid, TEST, p.key, key(ctx, pid, TEST, p.key), 30_000);
    v = D.finishDay(ctx, pid, TEST);
    expect(v.results!.passed).toBe(true);
    expect(v.results!.attemptNumber).toBe(2);
    expect(v.status).toBe('completed');
    const rows = ctx.db.all<{ kind: string; attempt_number: number; score: number; max_score: number }>("SELECT kind, attempt_number, score, max_score FROM assessments WHERE profile_id = ? AND ref_id = ? ORDER BY attempt_number", [pid, TEST]);
    expect(rows.map((r) => [r.kind, r.attempt_number, r.score, r.max_score])).toEqual([
      ['unit-assessment', 1, 13, 23],
      ['unit-assessment', 2, 23, 23],
    ]);
    const pd = getParentDashboard(ctx, pid);
    expect(pd.gradeDetail.categories.find((c) => c.category === 'unitAssessments')?.percent).toBe(100);
  });

  it('a state saved mid-assessment resumes exactly', () => {
    completeLessonsBefore(ctx, pid, LESSON_BY_ID.get(TEST)!.day);
    ctx.db.run("INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,?,?,?,?,?,?)", [pid, REVIEW, 'completed', 'results', '{"v":1,"day":true}', 1, 1, 1]);
    D.openDay(ctx, pid, TEST);
    let v = D.startDay(ctx, pid, TEST);
    const k = v.practice!.problems[3].key;
    v = D.daySubmit(ctx, pid, TEST, k, key(ctx, pid, TEST, k), 1000);
    const again = D.openDay(ctx, pid, TEST);
    expect(again.phase).toBe('practice');
    expect(again.practice!.problems[3].lastResponse).toBe(key(ctx, pid, TEST, k));
    expect(again.practice!.problems.map((p) => p.key)).toEqual(v.practice!.problems.map((p) => p.key));
  });
});

describe('Unit 2 review and assessment days', () => {
  it('cover every Unit 2 skill and pass with correct answers', async () => {
    const ctx = await makeCtx();
    setupParent(ctx, '2468');
    const pid = createProfile(ctx, 'Ana', 'owl').id;
    const review = LESSON_BY_ID.get('U2L05')!;
    for (const [id, l] of LESSON_BY_ID)
      if (l.day < review.day) ctx.db.run("INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,?,?,?,?,?,?)", [pid, id, 'completed', 'summary', '{"v":1,"quizAttempts":1}', 1, 1, 1]);
    D.openDay(ctx, pid, 'U2L05');
    let v = D.startDay(ctx, pid, 'U2L05');
    expect(new Set(dayState(ctx, pid, 'U2L05').practice!.items.map((i) => i.skillId))).toEqual(new Set(review.skillsAssessed));
    while (!v.practice!.complete) {
      const cur = v.practice!.problems[v.practice!.currentIndex];
      if (cur.state === 'open') v = D.daySubmit(ctx, pid, 'U2L05', cur.key, key(ctx, pid, 'U2L05', cur.key), 20_000);
      else v = D.dayNext(ctx, pid, 'U2L05');
    }
    v = D.finishDay(ctx, pid, 'U2L05');
    expect(v.results!.score).toBe(v.results!.maxScore);
    expect(lessonStatuses(ctx, pid).get('U2L06')!.status).toBe('available');
    D.openDay(ctx, pid, 'U2L06');
    v = D.startDay(ctx, pid, 'U2L06');
    const skills = dayState(ctx, pid, 'U2L06').practice!.items.map((i) => i.skillId);
    expect(new Set(skills).size).toBe(6);
    // essential skills (S2.01, S2.03, S2.05) appear twice
    for (const s of ['S2.01', 'S2.03', 'S2.05']) expect(skills.filter((x) => x === s).length).toBe(2);
    for (const p of v.practice!.problems) v = D.daySubmit(ctx, pid, 'U2L06', p.key, key(ctx, pid, 'U2L06', p.key), 30_000);
    v = D.finishDay(ctx, pid, 'U2L06');
    expect(v.results!.passed).toBe(true);
    expect(v.results!.score).toBe(v.results!.maxScore);
    expect(SKILL_BY_ID.get('S2.05')!.essential).toBe(true);
  });
});
