/**
 * Regression tests (QA follow-up 3):
 * - B7: a streak day counts resolved problems only, never wrong tries or answers flagged as guessing.
 * - B10: the diagnostic establishes starting mastery: shown course skills start PROFICIENT
 *   (not listed as needing work, no milestone XP), weak ones stay LEARNING.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AppDatabase } from '../../src/main/db/database';
import { MemoryLogger } from '../../src/main/logger';
import type { ServiceContext } from '../../src/main/services/context';
import { setupParent } from '../../src/main/services/parent';
import { createProfile } from '../../src/main/services/profiles';
import * as G from '../../src/main/services/diagnostic';
import { getProblem } from '../../src/main/services/practice';
import { recordAttempt, AttemptRecord, skillStates, totalXp } from '../../src/main/services/records';
import { getStudentDashboard } from '../../src/main/services/dashboard';
import { canonicalInput } from '../../src/core/engine/problems';

async function makeCtx(): Promise<{ ctx: ServiceContext; pid: number }> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acc-streak-'));
  const log = new MemoryLogger();
  let t = Date.UTC(2026, 8, 1, 15, 0, 0);
  const { db } = await AppDatabase.open(dir, log, () => t);
  db.persistDelayMs = 0;
  const ctx: ServiceContext = { db, log, now: () => (t += 1_000), tzOffset: () => 240, appVersion: 'test', dataDir: dir };
  setupParent(ctx, '2580');
  return { ctx, pid: createProfile(ctx, 'Jordan', 'spark').id };
}

function attempt(pid: number, o: Partial<AttemptRecord>): AttemptRecord {
  return {
    profileId: pid, lessonId: 'U1L01', activity: 'independent', skillId: 'S1.01', generatorId: 'g', seed: 1, difficulty: 1, problemKey: 'independent:0',
    response: '9001', status: 'incorrect', correct: false, attemptNumber: 1, hintsUsed: 0, maxHintLevel: 0, elapsedMs: 1000, counted: false, xp: 0, guessing: false, ...o,
  };
}

const day = (ctx: ServiceContext, pid: number) => ctx.db.get<{ problems_answered: number; qualifying: number }>('SELECT problems_answered, qualifying FROM activity_days WHERE profile_id = ?', [pid]);

describe('streak days (B7)', () => {
  it('wrong tries and wrong-form submissions alone never qualify a day', async () => {
    const { ctx, pid } = await makeCtx();
    for (let i = 0; i < 8; i++) recordAttempt(ctx, attempt(pid, { response: String(9000 + i) }));
    for (let i = 0; i < 3; i++) recordAttempt(ctx, attempt(pid, { status: 'wrong-form' }));
    expect(day(ctx, pid)?.problems_answered ?? 0).toBe(0);
    expect(day(ctx, pid)?.qualifying ?? 0).toBe(0);
  });
  it('answers flagged as guessing do not count; resolved problems do', async () => {
    const { ctx, pid } = await makeCtx();
    for (let i = 0; i < 5; i++) recordAttempt(ctx, attempt(pid, { status: 'correct', correct: true, counted: true, guessing: true, problemKey: `independent:${i}` }));
    expect(day(ctx, pid)?.qualifying ?? 0).toBe(0);
    for (let i = 0; i < 5; i++) recordAttempt(ctx, attempt(pid, { status: i % 2 ? 'correct' : 'revealed', correct: i % 2 === 1, counted: true, problemKey: `independent:${10 + i}` }));
    expect(day(ctx, pid)!.problems_answered).toBe(5);
    expect(day(ctx, pid)!.qualifying).toBe(1);
  });
});

function playDiagnostic(ctx: ServiceContext, pid: number, right: (skillId: string) => boolean): void {
  let v = G.startDiagnostic(ctx, pid);
  for (let g = 0; v.phase === 'questions'; g++) {
    expect(g).toBeLessThan(200);
    const run = JSON.parse(ctx.db.get<{ onboarding_json: string }>('SELECT onboarding_json FROM profiles WHERE id = ?', [pid])!.onboarding_json).diagnosticRun;
    const s = run.ps.items.find((i: { key: string }) => i.key === v.problem!.key);
    const answer = canonicalInput(getProblem(s.generatorId, s.seed, s.difficulty).answer);
    v = right(s.skillId) ? G.diagnosticSubmit(ctx, pid, v.problem!.key, answer, 20_000) : G.diagnosticNotLearned(ctx, pid, v.problem!.key);
  }
}

describe('diagnostic sets starting mastery (B10)', () => {
  it('a perfect diagnostic starts the course skills at PROFICIENT, not as needing work, without milestone XP', async () => {
    const { ctx, pid } = await makeCtx();
    playDiagnostic(ctx, pid, () => true);
    const states = skillStates(ctx, pid);
    for (const sk of G.COURSE_PROBES) expect(states.get(sk)?.stage, sk).toBe('PROFICIENT');
    expect(getStudentDashboard(ctx, pid).developingSkills.filter((s) => G.COURSE_PROBES.includes(s.skillId))).toEqual([]);
    expect(ctx.db.get<{ n: number }>("SELECT COUNT(*) AS n FROM xp_events WHERE profile_id = ? AND reason LIKE 'skill-%'", [pid])!.n).toBe(0);
    expect(totalXp(ctx, pid)).toBeGreaterThan(0); // answer XP is still given
  });
});
