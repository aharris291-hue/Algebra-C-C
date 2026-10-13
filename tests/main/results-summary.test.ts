import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import initSqlJs from 'sql.js';
import { summarizeSkills } from '../../src/core/engine/results';
import { getAssessmentDetail } from '../../src/main/services/dashboard';
import { AppDatabase } from '../../src/main/db/database';
import { MIGRATIONS } from '../../src/main/db/schema';
import { MemoryLogger } from '../../src/main/logger';
import { makeCtx, toQuiz, answerQuiz, unlockUpTo, takeAssessment, D } from './qa-helpers';

describe('did well / needs practice (L3)', () => {
  it('a 4/6 set where every skill had one miss still names its strengths', () => {
    const items = ['A', 'A', 'A', 'B', 'B', 'B'].map((skill, i) => ({ skill, correct: i !== 0 && i !== 3 }));
    expect(summarizeSkills(items)).toEqual({ didWell: ['A', 'B'], needsPractice: ['A', 'B'] });
  });
  it('a skill that was mostly wrong is not called a strength', () => {
    const s = summarizeSkills([
      { skill: 'A', correct: true },
      { skill: 'A', correct: true },
      { skill: 'B', correct: false },
      { skill: 'B', correct: false },
      { skill: 'B', correct: true },
    ]);
    expect(s).toEqual({ didWell: ['A'], needsPractice: ['B'] });
  });
  it('when nothing is two-thirds right, half-right skills are named', () => {
    const s = summarizeSkills([
      { skill: 'A', correct: true },
      { skill: 'A', correct: false },
      { skill: 'B', correct: false },
    ]);
    expect(s).toEqual({ didWell: ['A'], needsPractice: ['A', 'B'] });
  });
});

describe('the recommended next step is stored with the assessment (M4)', () => {
  it('a quiz: the Parent Dashboard detail shows the same summary and next step as the results screen', async () => {
    const { ctx, pid } = await makeCtx();
    const v = answerQuiz(ctx, pid, 'U1L01', toQuiz(ctx, pid, 'U1L01'), 2);
    const r = v.results!;
    expect(r.nextStep).not.toBe('');
    const id = ctx.db.get<{ id: number }>("SELECT id FROM assessments WHERE profile_id = ? AND kind = 'quiz' ORDER BY id DESC", [pid])!.id;
    const d = getAssessmentDetail(ctx, pid, id);
    expect(d.nextStep).toBe(r.nextStep);
    expect(d.didWell).toEqual(r.didWell);
    expect(d.needsPractice).toEqual(r.needsPractice);
  });

  it('a unit assessment stores it too', async () => {
    const { ctx, pid } = await makeCtx();
    unlockUpTo(ctx, pid, 'U1L12');
    D.openDay(ctx, pid, 'U1L12');
    const v = takeAssessment(ctx, pid, 'U1L12', 3);
    const id = ctx.db.get<{ id: number }>("SELECT id FROM assessments WHERE profile_id = ? AND ref_id = 'U1L12' ORDER BY id DESC", [pid])!.id;
    const d = getAssessmentDetail(ctx, pid, id);
    expect(d.nextStep).toBe(v.results!.nextStep);
    expect(d.nextStep.length).toBeGreaterThan(10);
  });

  it('a row saved before the summary was stored gets a sensible rebuilt next step', async () => {
    const { ctx, pid } = await makeCtx();
    answerQuiz(ctx, pid, 'U1L01', toQuiz(ctx, pid, 'U1L01'), 3);
    const id = ctx.db.get<{ id: number }>("SELECT id FROM assessments WHERE profile_id = ? AND kind = 'quiz' ORDER BY id DESC", [pid])!.id;
    ctx.db.run('UPDATE assessments SET summary_json = NULL WHERE id = ?', [id]);
    const d = getAssessmentDetail(ctx, pid, id);
    expect(d.nextStep).toMatch(/retake the quiz|move on/i);
    expect(d.needsPractice.length).toBeGreaterThan(0);
  });

  it('a version-1 database is migrated: the column is added, old rows keep working', async () => {
    const SQL = await initSqlJs();
    const raw = new SQL.Database();
    raw.exec(MIGRATIONS[0].sql);
    raw.run("INSERT INTO meta(key, value) VALUES ('schema_version', '1')");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acc-mig-'));
    fs.writeFileSync(path.join(dir, 'academy.sqlite'), Buffer.from(raw.export()));
    const log = new MemoryLogger();
    const { db, migratedFrom } = await AppDatabase.open(dir, log);
    expect(migratedFrom).toBe(1);
    expect(db.schemaVersion()).toBe(MIGRATIONS[MIGRATIONS.length - 1].version);
    const cols = db.all<{ name: string }>('PRAGMA table_info(assessments)').map((c) => c.name);
    expect(cols).toContain('summary_json');
    // a safety backup was written before migrating
    expect(JSON.stringify(fs.readdirSync(path.join(dir, 'backups'), { recursive: true }))).toMatch(/pre-migration-v1/);
    db.close();
  });
});
