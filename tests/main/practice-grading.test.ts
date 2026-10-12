/**
 * Practice engine regressions (QA follow-up): deferred answers in the wrong form, re-saving a quiz
 * answer with a typo, repeated submits in guided steps, per-step attempts, and the two
 * anti-guessing rules (a quick retry; 3 wrong answers in 30 seconds).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AppDatabase } from '../../src/main/db/database';
import { MemoryLogger } from '../../src/main/logger';
import type { ServiceContext } from '../../src/main/services/context';
import { createProfile } from '../../src/main/services/profiles';
import { newPractice, addItems, submitDeferred, submitImmediate, gradeDeferred, getProblem, practiceView, PracticeState } from '../../src/main/services/practice';
import { canonicalInput } from '../../src/core/engine/problems';
import { checkAnswer } from '../../src/core/math/answers';
import { GENERATORS } from '../../src/content';
import type { Problem } from '../../src/core/curriculum/types';

interface Clock {
  t: number;
  step: number;
}

async function makeCtx(): Promise<{ ctx: ServiceContext; clock: Clock; pid: number }> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acc-practice-'));
  const log = new MemoryLogger();
  const clock: Clock = { t: Date.UTC(2026, 7, 10, 15, 0, 0), step: 0 };
  const { db } = await AppDatabase.open(dir, log, () => clock.t);
  db.persistDelayMs = 0;
  const ctx: ServiceContext = { db, log, now: () => (clock.t += clock.step), tzOffset: () => 240, appVersion: 'test', dataDir: dir };
  const pid = createProfile(ctx, 'Sam', 'spark').id;
  return { ctx, clock, pid };
}

/** First generator (in catalog order) whose problem at difficulty 1 matches. */
function findGenerator(pred: (p: Problem) => boolean): string {
  for (const [id, g] of GENERATORS) {
    try {
      const p = getProblem(id, 1, 1);
      if (pred(p)) return id;
    } catch {
      /* try the next one */
    }
    void g;
  }
  throw new Error('no generator matches');
}

const plainNumber = (p: Problem) => p.answer.kind === 'number' && p.answer.roundTo === undefined && !p.answer.unit && /^-?\d+$/.test(p.answer.value);

function quizWith(ctx: ServiceContext, generator: string, count = 1): PracticeState {
  const ps = newPractice('quiz', { seedBase: 1, deferred: true, hintsAllowed: false });
  addItems(ctx, ps, Array.from({ length: count }, () => ({ generator, difficulty: 1 as const })));
  return ps;
}

describe('deferred answers (quiz, Show What You Know, assessments)', () => {
  it('an answer not in the requested form is not saved; the student is asked to rewrite it, then a valid answer is graded correct', async () => {
    const { ctx, pid } = await makeCtx();
    const gen = findGenerator(plainNumber);
    const ps = quizWith(ctx, gen);
    const s = ps.items[0];
    const p = getProblem(s.generatorId, s.seed, s.difficulty);
    const right = canonicalInput(p.answer);
    expect(checkAnswer(p.answer, `${right} + 0`).status).toBe('wrong-form');

    submitDeferred(ps, s.key, `${right} + 0`);
    expect(s.state).toBe('open');
    expect(s.lastResponse).toBeUndefined();
    expect(s.lastFeedback?.status).toBe('wrong-form');
    const rightValueMsg = s.lastFeedback!.message;
    // the message does not reveal whether the value is right: a wrong value in the same form gets the same one
    submitDeferred(ps, s.key, `${Number(right) + 7} + 0`);
    expect(s.state).toBe('open');
    expect(s.lastFeedback!.message).toBe(rightValueMsg);
    expect(rightValueMsg).not.toMatch(/equivalent|right|correct|equal/i);

    submitDeferred(ps, s.key, right);
    expect(s.state).toBe('answered');
    expect(s.lastFeedback).toBeUndefined();
    const graded = gradeDeferred(ctx, pid, 'U1L01', ps, null);
    expect(graded[0].correct).toBe(true);
  });

  it('saving the same wrong-form answer twice keeps it as written, so a student is never stuck', async () => {
    const { ctx } = await makeCtx();
    const ps = quizWith(ctx, findGenerator(plainNumber));
    const s = ps.items[0];
    const right = canonicalInput(getProblem(s.generatorId, s.seed, s.difficulty).answer);
    submitDeferred(ps, s.key, `${right} + 0`);
    expect(s.state).toBe('open');
    expect(s.lastFeedback!.message).toMatch(/save it again/);
    submitDeferred(ps, s.key, `${right} + 0`);
    expect(s.state).toBe('answered');
    expect(s.lastResponse).toBe(`${right} + 0`);
  });

  it('re-saving with a typo keeps the saved answer, says so, and the item is still graded on the saved answer', async () => {
    const { ctx, pid } = await makeCtx();
    const gen = findGenerator(plainNumber);
    const ps = quizWith(ctx, gen);
    const s = ps.items[0];
    const right = canonicalInput(getProblem(s.generatorId, s.seed, s.difficulty).answer);
    submitDeferred(ps, s.key, right);
    submitDeferred(ps, s.key, '2x+');
    expect(s.state).toBe('answered');
    expect(s.lastResponse).toBe(right);
    expect(s.lastFeedback?.status).toBe('invalid');
    expect(s.lastFeedback!.message).toMatch(/earlier answer is still saved/);
    // the view the renderer sees: the saved answer, not the typo
    expect(practiceView(ps).problems[0].lastResponse).toBe(right);
    expect(gradeDeferred(ctx, pid, 'U1L01', ps, null)[0].correct).toBe(true);
  });

  it('an unreadable first answer leaves the item open (not counted as answered)', async () => {
    const { ctx } = await makeCtx();
    const ps = quizWith(ctx, findGenerator(plainNumber));
    const s = ps.items[0];
    submitDeferred(ps, s.key, '2x+');
    expect(s.state).toBe('open');
    expect(practiceView(ps).problems[0].lastResponse).toBeUndefined();
  });
});

describe('anti-guessing', () => {
  it('a correct retry within 4 seconds of the wrong try is flagged, even when the renderer reports the time since the problem was shown', async () => {
    const { ctx, clock, pid } = await makeCtx();
    const gen = findGenerator(plainNumber);
    const ps = newPractice('independent', { seedBase: 2, hintsAllowed: true });
    addItems(ctx, ps, [{ generator: gen, difficulty: 1 }]);
    const s = ps.items[0];
    const right = canonicalInput(getProblem(s.generatorId, s.seed, s.difficulty).answer);
    clock.t += 10_000;
    submitImmediate(ctx, pid, 'U1L01', ps, s.key, String(Number(right) + 1), 10_000);
    clock.t += 1_000;
    submitImmediate(ctx, pid, 'U1L01', ps, s.key, right, 11_000);
    const row = ctx.db.get<{ guessing: number; xp: number }>("SELECT guessing, xp FROM attempts WHERE problem_key = ? AND status = 'correct'", [s.key])!;
    expect(row.guessing).toBe(1);
    expect(row.xp).toBe(0);
  });

  it('quiz misses graded at one instant do not make a careful correction right after the quiz look like guessing', async () => {
    const { ctx, clock, pid } = await makeCtx();
    const gen = findGenerator(plainNumber);
    const quiz = quizWith(ctx, gen, 3);
    gradeDeferred(ctx, pid, 'U1L01', quiz, null); // 3 unanswered = 3 misses, same timestamp
    const corr = newPractice('corrections', { seedBase: 3, hintsAllowed: true });
    addItems(ctx, corr, [{ generator: gen, difficulty: 1 }]);
    const c = corr.items[0];
    clock.t += 20_000;
    const out = submitImmediate(ctx, pid, 'U1L01', corr, c.key, canonicalInput(getProblem(c.generatorId, c.seed, c.difficulty).answer), 20_000);
    expect(out.correct).toBe(true);
    expect(out.xp).toBeGreaterThan(0);
    expect(c.lastFeedback!.message).not.toMatch(/Slow down/);
  });
});

describe('guided steps', () => {
  /** A guided problem whose step 1 answer is a wrong (gradable) answer for step 2. */
  function stepProblem(): string {
    return findGenerator((p) => {
      if (!p.steps || p.steps.length < 2) return false;
      return checkAnswer(p.steps[1].answer, canonicalInput(p.steps[0].answer), p.steps[1].misconceptions).status === 'incorrect';
    });
  }

  it('a repeated submit for a finished step is ignored, not graded against the next step', async () => {
    const { ctx, clock, pid } = await makeCtx();
    clock.step = 200;
    const ps = newPractice('guided', { seedBase: 4, hintsAllowed: true });
    addItems(ctx, ps, [{ generator: stepProblem(), difficulty: 1 }]);
    const s = ps.items[0];
    const p = getProblem(s.generatorId, s.seed, s.difficulty);
    const step1 = canonicalInput(p.steps![0].answer);
    submitImmediate(ctx, pid, 'U1L01', ps, s.key, step1, 20_000, 0);
    expect(s.stepIndex).toBe(1);
    // with the step index (current renderer)
    submitImmediate(ctx, pid, 'U1L01', ps, s.key, step1, 20_000, 0);
    // and without it (a double click from an older renderer)
    submitImmediate(ctx, pid, 'U1L01', ps, s.key, step1, 20_000);
    expect(s.attempts).toBe(0);
    expect(s.lastFeedback?.status).toBe('correct');
    const rows = ctx.db.all<{ status: string }>('SELECT status FROM attempts WHERE problem_key = ?', [s.key]);
    expect(rows.map((r) => r.status)).toEqual(['correct']);
  });

  it('a slip on an earlier step does not make the final step a retry', async () => {
    const { ctx, clock, pid } = await makeCtx();
    clock.step = 3_000;
    const ps = newPractice('guided', { seedBase: 5, hintsAllowed: true });
    addItems(ctx, ps, [{ generator: stepProblem(), difficulty: 1 }]);
    const s = ps.items[0];
    const p = getProblem(s.generatorId, s.seed, s.difficulty);
    for (let i = 0; i < p.steps!.length; i++) {
      const right = canonicalInput(p.steps![i].answer);
      if (i < p.steps!.length - 1) {
        clock.t += 20_000;
        submitImmediate(ctx, pid, 'U1L01', ps, s.key, '987654321', 20_000, i); // one slip per step
        expect(s.lastFeedback?.status).toBe('incorrect');
      }
      clock.t += 20_000;
      submitImmediate(ctx, pid, 'U1L01', ps, s.key, right, 20_000, i);
    }
    expect(s.state).toBe('correct');
    const last = ctx.db.get<{ attempt_number: number; xp: number }>("SELECT attempt_number, xp FROM attempts WHERE problem_key = ? AND counted = 1", [s.key])!;
    expect(last.attempt_number).toBe(1);
    expect(last.xp).toBeGreaterThan(0);
  });
});
