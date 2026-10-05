/**
 * Every lesson with written content runs end to end through the lesson services the way a
 * student would: all sections, guided steps, practice, the quiz (all correct), completion.
 * This catches content that references a generator wrongly or a problem that cannot be solved.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AppDatabase } from '../../src/main/db/database';
import { MemoryLogger } from '../../src/main/logger';
import type { ServiceContext } from '../../src/main/services/context';
import { createProfile } from '../../src/main/services/profiles';
import * as L from '../../src/main/services/lessons';
import type { LessonState } from '../../src/main/services/lessons';
import { getProblem } from '../../src/main/services/practice';
import { canonicalInput } from '../../src/core/engine/problems';
import { LESSON_CONTENT, LESSON_BY_ID } from '../../src/content';
import type { LessonView } from '../../src/shared/api';

async function makeCtx(): Promise<ServiceContext> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acc-all-'));
  const log = new MemoryLogger();
  let t = Date.UTC(2026, 7, 10, 15, 0, 0);
  const { db } = await AppDatabase.open(dir, log, () => t);
  db.persistDelayMs = 0;
  return { db, log, now: () => (t += 5000), tzOffset: () => 240, appVersion: 'test', dataDir: dir };
}

function correctInput(ctx: ServiceContext, pid: number, lessonId: string, key: string): string {
  const st: LessonState = JSON.parse(ctx.db.get<{ state_json: string }>('SELECT state_json FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?', [pid, lessonId])!.state_json);
  for (const ps of [st.guided, st.independent, st.quiz, st.corrections, st.remediation?.practice].filter(Boolean)) {
    const s = ps!.items.find((i) => i.key === key);
    if (!s) continue;
    const p = getProblem(s.generatorId, s.seed, s.difficulty);
    const stepMode = (ps!.activity === 'guided' || ps!.activity === 'remediation') && p.steps && p.steps.length > 0;
    return canonicalInput(stepMode && s.stepIndex < p.steps!.length ? p.steps![s.stepIndex].answer : p.answer);
  }
  throw new Error('no such key ' + key);
}

function solve(ctx: ServiceContext, pid: number, id: string, view: LessonView): LessonView {
  let v = view;
  for (let guard = 0; guard < 300; guard++) {
    const pv = v.practice!;
    if (pv.complete) return v;
    const pr = pv.problems[pv.currentIndex];
    if (pr.state === 'open') {
      v = L.submitAnswer(ctx, pid, id, pr.key, correctInput(ctx, pid, id, pr.key), 20_000);
      continue;
    }
    if (v.section === 'guided' && v.canAdvance) return v;
    v = L.nextProblem(ctx, pid, id);
  }
  throw new Error('practice did not finish');
}

describe('every written lesson runs end to end', () => {
  const ids = [...LESSON_CONTENT.keys()];
  for (const id of ids) {
    it(`${id}: ${LESSON_BY_ID.get(id)!.title}`, async () => {
      const ctx = await makeCtx();
      const pid = createProfile(ctx, 'Test', 'spark').id;
      // unlock: mark everything before this day complete
      const day = LESSON_BY_ID.get(id)!.day;
      for (const [lid, l] of LESSON_BY_ID)
        if (l.day < day) ctx.db.run('INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,?,?,?,?,?,?)', [pid, lid, 'completed', 'summary', '{"v":1,"quizAttempts":1}', 1, 1, 1]);
      let v = L.openLesson(ctx, pid, id);
      for (let i = 0; i < 4; i++) v = L.advanceSection(ctx, pid, id);
      expect(v.section).toBe('guided');
      v = solve(ctx, pid, id, v);
      v = L.advanceSection(ctx, pid, id);
      expect(v.section).toBe('independent');
      v = solve(ctx, pid, id, v);
      v = L.advanceSection(ctx, pid, id);
      expect(v.section).toBe('quiz');
      for (const p of v.practice!.problems) v = L.submitAnswer(ctx, pid, id, p.key, correctInput(ctx, pid, id, p.key), 30_000);
      v = L.finishQuiz(ctx, pid, id);
      expect(v.results!.percent).toBe(100);
      v = L.advanceSection(ctx, pid, id);
      v = L.advanceSection(ctx, pid, id);
      v = L.advanceSection(ctx, pid, id);
      expect(v.status).toBe('completed');
    });
  }
});
