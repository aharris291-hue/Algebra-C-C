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

describe('Unit 3 review and assessment days', () => {
  it('cover every Unit 3 skill and pass with correct answers', async () => {
    const ctx = await makeCtx();
    setupParent(ctx, '2468');
    const pid = createProfile(ctx, 'Ana', 'owl').id;
    const review = LESSON_BY_ID.get('U3L04')!;
    for (const [id, l] of LESSON_BY_ID)
      if (l.day < review.day) ctx.db.run("INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,?,?,?,?,?,?)", [pid, id, 'completed', 'summary', '{"v":1,"quizAttempts":1}', 1, 1, 1]);
    D.openDay(ctx, pid, 'U3L04');
    let v = D.startDay(ctx, pid, 'U3L04');
    expect(new Set(dayState(ctx, pid, 'U3L04').practice!.items.map((i) => i.skillId))).toEqual(new Set(review.skillsAssessed));
    while (!v.practice!.complete) {
      const cur = v.practice!.problems[v.practice!.currentIndex];
      if (cur.state === 'open') v = D.daySubmit(ctx, pid, 'U3L04', cur.key, key(ctx, pid, 'U3L04', cur.key), 20_000);
      else v = D.dayNext(ctx, pid, 'U3L04');
    }
    v = D.finishDay(ctx, pid, 'U3L04');
    expect(v.results!.score).toBe(v.results!.maxScore);
    expect(lessonStatuses(ctx, pid).get('U3L05')!.status).toBe('available');
    D.openDay(ctx, pid, 'U3L05');
    v = D.startDay(ctx, pid, 'U3L05');
    const skills = dayState(ctx, pid, 'U3L05').practice!.items.map((i) => i.skillId);
    expect(new Set(skills).size).toBe(7);
    // the essential skill (S3.03) appears twice
    expect(skills.filter((x) => x === 'S3.03').length).toBe(2);
    for (const p of v.practice!.problems) v = D.daySubmit(ctx, pid, 'U3L05', p.key, key(ctx, pid, 'U3L05', p.key), 30_000);
    v = D.finishDay(ctx, pid, 'U3L05');
    expect(v.results!.passed).toBe(true);
    expect(v.results!.score).toBe(v.results!.maxScore);
  });
});

describe('Units 1-4 checkpoint day', () => {
  it('mixes every checkpoint skill and passes with correct answers', async () => {
    const ctx = await makeCtx();
    setupParent(ctx, '2468');
    const pid = createProfile(ctx, 'Ana', 'owl').id;
    const cp = LESSON_BY_ID.get('U4L11')!;
    for (const [id, l] of LESSON_BY_ID)
      if (l.day < cp.day) ctx.db.run("INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,?,?,?,?,?,?)", [pid, id, 'completed', 'summary', '{"v":1,"quizAttempts":1}', 1, 1, 1]);
    D.openDay(ctx, pid, 'U4L11');
    let v = D.startDay(ctx, pid, 'U4L11');
    expect(new Set(dayState(ctx, pid, 'U4L11').practice!.items.map((i) => i.skillId))).toEqual(new Set(cp.skillsAssessed));
    while (!v.practice!.complete) {
      const cur = v.practice!.problems[v.practice!.currentIndex];
      if (cur.state === 'open') v = D.daySubmit(ctx, pid, 'U4L11', cur.key, key(ctx, pid, 'U4L11', cur.key), 20_000);
      else v = D.dayNext(ctx, pid, 'U4L11');
    }
    v = D.finishDay(ctx, pid, 'U4L11');
    expect(v.results!.score).toBe(v.results!.maxScore);
    expect(lessonStatuses(ctx, pid).get('U4L11')!.status).toBe('completed');
  });
});

describe('Unit 4 review and assessment days', () => {
  it('cover every Unit 4 skill and pass with correct answers', async () => {
    const ctx = await makeCtx();
    setupParent(ctx, '2468');
    const pid = createProfile(ctx, 'Ana', 'owl').id;
    const review = LESSON_BY_ID.get('U4L20')!;
    for (const [id, l] of LESSON_BY_ID)
      if (l.day < review.day) ctx.db.run("INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,?,?,?,?,?,?)", [pid, id, 'completed', 'summary', '{"v":1,"quizAttempts":1}', 1, 1, 1]);
    D.openDay(ctx, pid, 'U4L20');
    let v = D.startDay(ctx, pid, 'U4L20');
    expect(new Set(dayState(ctx, pid, 'U4L20').practice!.items.map((i) => i.skillId))).toEqual(new Set(review.skillsAssessed));
    while (!v.practice!.complete) {
      const cur = v.practice!.problems[v.practice!.currentIndex];
      if (cur.state === 'open') v = D.daySubmit(ctx, pid, 'U4L20', cur.key, key(ctx, pid, 'U4L20', cur.key), 20_000);
      else v = D.dayNext(ctx, pid, 'U4L20');
    }
    v = D.finishDay(ctx, pid, 'U4L20');
    expect(v.results!.score).toBe(v.results!.maxScore);
    expect(lessonStatuses(ctx, pid).get('U4L21')!.status).toBe('available');
    D.openDay(ctx, pid, 'U4L21');
    v = D.startDay(ctx, pid, 'U4L21');
    const skills = dayState(ctx, pid, 'U4L21').practice!.items.map((i) => i.skillId);
    expect(new Set(skills).size).toBe(21);
    // essential skills appear twice
    for (const s of ['S4.03', 'S4.05', 'S4.06', 'S4.09', 'S4.12', 'S4.15']) expect(skills.filter((x) => x === s).length).toBe(2);
    for (const p of v.practice!.problems) v = D.daySubmit(ctx, pid, 'U4L21', p.key, key(ctx, pid, 'U4L21', p.key), 30_000);
    v = D.finishDay(ctx, pid, 'U4L21');
    expect(v.results!.passed).toBe(true);
    expect(v.results!.score).toBe(v.results!.maxScore);
  });
});

describe('Unit 5 review and assessment days', () => {
  it('cover every Unit 5 skill and pass with correct answers', async () => {
    const ctx = await makeCtx();
    setupParent(ctx, '2468');
    const pid = createProfile(ctx, 'Ana', 'owl').id;
    const review = LESSON_BY_ID.get('U5L07')!;
    for (const [id, l] of LESSON_BY_ID)
      if (l.day < review.day) ctx.db.run("INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,?,?,?,?,?,?)", [pid, id, 'completed', 'summary', '{"v":1,"quizAttempts":1}', 1, 1, 1]);
    D.openDay(ctx, pid, 'U5L07');
    let v = D.startDay(ctx, pid, 'U5L07');
    expect(new Set(dayState(ctx, pid, 'U5L07').practice!.items.map((i) => i.skillId))).toEqual(new Set(review.skillsAssessed));
    while (!v.practice!.complete) {
      const cur = v.practice!.problems[v.practice!.currentIndex];
      if (cur.state === 'open') v = D.daySubmit(ctx, pid, 'U5L07', cur.key, key(ctx, pid, 'U5L07', cur.key), 20_000);
      else v = D.dayNext(ctx, pid, 'U5L07');
    }
    v = D.finishDay(ctx, pid, 'U5L07');
    expect(v.results!.score).toBe(v.results!.maxScore);
    expect(lessonStatuses(ctx, pid).get('U5L08')!.status).toBe('available');
    D.openDay(ctx, pid, 'U5L08');
    v = D.startDay(ctx, pid, 'U5L08');
    const skills = dayState(ctx, pid, 'U5L08').practice!.items.map((i) => i.skillId);
    expect(new Set(skills).size).toBe(6);
    // essential skills appear twice
    for (const s of ['S5.01', 'S5.02', 'S5.03']) expect(skills.filter((x) => x === s).length).toBe(2);
    for (const p of v.practice!.problems) v = D.daySubmit(ctx, pid, 'U5L08', p.key, key(ctx, pid, 'U5L08', p.key), 30_000);
    v = D.finishDay(ctx, pid, 'U5L08');
    expect(v.results!.passed).toBe(true);
    expect(v.results!.score).toBe(v.results!.maxScore);
  });
});


describe('Unit 6 review and assessment days', () => {
  it('play the cumulative review, the unit review and the assessment with every Unit 6 skill', async () => {
    const ctx = await makeCtx();
    setupParent(ctx, '2468');
    const pid = createProfile(ctx, 'Ana', 'owl').id;
    const first = LESSON_BY_ID.get('U6L11')!;
    for (const [id, l] of LESSON_BY_ID)
      if (l.day < first.day) ctx.db.run("INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,?,?,?,?,?,?)", [pid, id, 'completed', 'summary', '{"v":1,"quizAttempts":1}', 1, 1, 1]);
    for (const day of ['U6L11', 'U6L12']) {
      const lesson = LESSON_BY_ID.get(day)!;
      D.openDay(ctx, pid, day);
      let v = D.startDay(ctx, pid, day);
      expect(new Set(dayState(ctx, pid, day).practice!.items.map((i) => i.skillId))).toEqual(new Set(lesson.skillsAssessed));
      while (!v.practice!.complete) {
        const cur = v.practice!.problems[v.practice!.currentIndex];
        if (cur.state === 'open') v = D.daySubmit(ctx, pid, day, cur.key, key(ctx, pid, day, cur.key), 20_000);
        else v = D.dayNext(ctx, pid, day);
      }
      v = D.finishDay(ctx, pid, day);
      expect(v.results!.score).toBe(v.results!.maxScore);
    }
    expect(lessonStatuses(ctx, pid).get('U6L13')!.status).toBe('available');
    D.openDay(ctx, pid, 'U6L13');
    let v = D.startDay(ctx, pid, 'U6L13');
    const skills = dayState(ctx, pid, 'U6L13').practice!.items.map((i) => i.skillId);
    expect(new Set(skills).size).toBe(10);
    // essential skills appear twice
    for (const s of ['S6.02', 'S6.07']) expect(skills.filter((x) => x === s).length).toBe(2);
    for (const p of v.practice!.problems) v = D.daySubmit(ctx, pid, 'U6L13', p.key, key(ctx, pid, 'U6L13', p.key), 30_000);
    v = D.finishDay(ctx, pid, 'U6L13');
    expect(v.results!.passed).toBe(true);
    expect(v.results!.score).toBe(v.results!.maxScore);
  });
});

describe('Unit 7 review and assessment days', () => {
  it('play the unit review and the assessment with every Unit 7 skill', async () => {
    const ctx = await makeCtx();
    setupParent(ctx, '2468');
    const pid = createProfile(ctx, 'Ana', 'owl').id;
    const first = LESSON_BY_ID.get('U7L10')!;
    for (const [id, l] of LESSON_BY_ID)
      if (l.day < first.day) ctx.db.run("INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,?,?,?,?,?,?)", [pid, id, 'completed', 'summary', '{"v":1,"quizAttempts":1}', 1, 1, 1]);
    const review = LESSON_BY_ID.get('U7L10')!;
    D.openDay(ctx, pid, 'U7L10');
    let v = D.startDay(ctx, pid, 'U7L10');
    expect(new Set(dayState(ctx, pid, 'U7L10').practice!.items.map((i) => i.skillId))).toEqual(new Set(review.skillsAssessed));
    while (!v.practice!.complete) {
      const cur = v.practice!.problems[v.practice!.currentIndex];
      if (cur.state === 'open') v = D.daySubmit(ctx, pid, 'U7L10', cur.key, key(ctx, pid, 'U7L10', cur.key), 20_000);
      else v = D.dayNext(ctx, pid, 'U7L10');
    }
    v = D.finishDay(ctx, pid, 'U7L10');
    expect(v.results!.score).toBe(v.results!.maxScore);
    expect(lessonStatuses(ctx, pid).get('U7L11')!.status).toBe('available');
    D.openDay(ctx, pid, 'U7L11');
    v = D.startDay(ctx, pid, 'U7L11');
    const skills = dayState(ctx, pid, 'U7L11').practice!.items.map((i) => i.skillId);
    expect(new Set(skills).size).toBe(10);
    // essential skills appear twice
    for (const s of ['S7.02', 'S7.08']) expect(skills.filter((x) => x === s).length).toBe(2);
    for (const p of v.practice!.problems) v = D.daySubmit(ctx, pid, 'U7L11', p.key, key(ctx, pid, 'U7L11', p.key), 30_000);
    v = D.finishDay(ctx, pid, 'U7L11');
    expect(v.results!.passed).toBe(true);
    expect(v.results!.score).toBe(v.results!.maxScore);
  });
});

describe('Unit 8 review and assessment days', () => {
  it('play the unit review and the assessment with every Unit 8 skill', async () => {
    const ctx = await makeCtx();
    setupParent(ctx, '2468');
    const pid = createProfile(ctx, 'Ana', 'owl').id;
    const first = LESSON_BY_ID.get('U8L07')!;
    for (const [id, l] of LESSON_BY_ID)
      if (l.day < first.day) ctx.db.run("INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,?,?,?,?,?,?)", [pid, id, 'completed', 'summary', '{"v":1,"quizAttempts":1}', 1, 1, 1]);
    const review = LESSON_BY_ID.get('U8L07')!;
    D.openDay(ctx, pid, 'U8L07');
    let v = D.startDay(ctx, pid, 'U8L07');
    expect(new Set(dayState(ctx, pid, 'U8L07').practice!.items.map((i) => i.skillId))).toEqual(new Set(review.skillsAssessed));
    while (!v.practice!.complete) {
      const cur = v.practice!.problems[v.practice!.currentIndex];
      if (cur.state === 'open') v = D.daySubmit(ctx, pid, 'U8L07', cur.key, key(ctx, pid, 'U8L07', cur.key), 20_000);
      else v = D.dayNext(ctx, pid, 'U8L07');
    }
    v = D.finishDay(ctx, pid, 'U8L07');
    expect(v.results!.score).toBe(v.results!.maxScore);
    expect(lessonStatuses(ctx, pid).get('U8L08')!.status).toBe('available');
    D.openDay(ctx, pid, 'U8L08');
    v = D.startDay(ctx, pid, 'U8L08');
    const skills = dayState(ctx, pid, 'U8L08').practice!.items.map((i) => i.skillId);
    expect(new Set(skills).size).toBe(6);
    // essential skills appear twice
    for (const s of ['S8.01', 'S8.03']) expect(skills.filter((x) => x === s).length).toBe(2);
    for (const p of v.practice!.problems) v = D.daySubmit(ctx, pid, 'U8L08', p.key, key(ctx, pid, 'U8L08', p.key), 30_000);
    v = D.finishDay(ctx, pid, 'U8L08');
    expect(v.results!.passed).toBe(true);
    expect(v.results!.score).toBe(v.results!.maxScore);
  });
});
