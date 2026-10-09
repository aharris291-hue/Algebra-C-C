/**
 * Service API: parent guard, dashboards agree with records, weekly report, backup/restore.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AppDatabase } from '../../src/main/db/database';
import { MemoryLogger } from '../../src/main/logger';
import type { ServiceContext } from '../../src/main/services/context';
import { createApi } from '../../src/main/services/api';
import { API_METHODS } from '../../src/shared/api';
import { getProblem } from '../../src/main/services/practice';
import { canonicalInput } from '../../src/core/engine/problems';

const PIN = '4826';

async function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acc-api-'));
  let t = Date.UTC(2026, 8, 7, 14, 0, 0); // Monday 10:00 in UTC-4
  const { db } = await AppDatabase.open(dir, new MemoryLogger(), () => t);
  const ctx: ServiceContext = { db, log: new MemoryLogger(), now: () => (t += 3000), tzOffset: () => 240, appVersion: 'test', dataDir: dir };
  const api = createApi(ctx);
  return { ctx, api, dir };
}

describe('AcademyApi', () => {
  it('implements every declared method', async () => {
    const { api } = await setup();
    for (const m of API_METHODS) expect(typeof api[m]).toBe('function');
  });

  it('first run, parent PIN guard and lockout', async () => {
    const { api } = await setup();
    expect((await api.getStatus()).firstRun).toBe(true);
    const { recoveryCode } = await api.setupParent(PIN);
    expect(recoveryCode).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect((await api.getStatus()).firstRun).toBe(false);
    await expect(api.createProfile('1111', 'Sam', 'spark')).rejects.toThrow();
    const p = await api.createProfile(PIN, 'Sam', 'spark');
    await expect(api.getParentDashboard('0000', p.id)).rejects.toThrow();
    // resetting with the recovery code works and issues a new code
    const r = await api.resetParentPin(recoveryCode, '7391');
    expect(r.ok).toBe(true);
    expect(r.recoveryCode).not.toBe(recoveryCode);
    await expect(api.getParentDashboard(PIN, p.id)).rejects.toThrow();
    await expect(api.getParentDashboard('7391', p.id)).resolves.toBeTruthy();
  });

  it('dashboards and the weekly report agree with the recorded work', async () => {
    const { ctx, api } = await setup();
    await api.setupParent(PIN);
    const p = await api.createProfile(PIN, 'Lee', 'rocket');
    let s = await api.getStudentDashboard(p.id);
    expect(s.continueLesson).toMatchObject({ lessonId: 'U1L01', resume: false });
    expect(s.grade.percent).toBeNull(); // nothing graded yet
    expect(s.semester.completedLessons).toBe(0);

    // test out of lesson 1 with all answers correct
    let v = await api.startTestOut(p.id, 'U1L01');
    const st = JSON.parse(ctx.db.get<{ state_json: string }>('SELECT state_json FROM lesson_progress')!.state_json);
    for (const it of st.quiz.items) v = await api.submitAnswer(p.id, 'U1L01', it.key, canonicalInput(getProblem(it.generatorId, it.seed, it.difficulty).answer), 25_000);
    v = await api.finishQuiz(p.id, 'U1L01');
    expect(v.status).toBe('tested_out');
    await api.heartbeat(p.id, 'U1L01', 'quiz', 30);
    await api.heartbeat(p.id, 'U1L01', 'quiz', 999); // clamped to 30

    s = await api.getStudentDashboard(p.id);
    const pd = await api.getParentDashboard(PIN, p.id);
    expect(s.semester.completedLessons).toBe(1);
    expect(pd.overview.lessonsCompleted).toBe(1);
    expect(s.grade).toEqual(pd.overview.grade);
    expect(s.grade.percent).toBe(100);
    expect(pd.assessments[0]).toMatchObject({ kind: 'test-out', percent: 100, missed: 0 });
    expect(pd.time.totalMinutes).toBe(1);
    expect(s.xp.total).toBe(pd.engagement.xp);
    expect(pd.recentActivity.some((a) => a.text.startsWith('Tested out of'))).toBe(true);

    const rep = await api.getWeeklyReport(PIN, p.id);
    expect(rep.weekStart).toBe('2026-09-07');
    expect(rep.lessonsCompleted.map((l) => l.id)).toEqual(['U1L01']);
    expect(rep.minutes).toBe(1);
    expect(rep.accuracy).toBe(100);
    expect(rep.summary).toContain('Lee completed 1 lesson');

    const detail = await api.getAssessmentDetail(PIN, p.id, pd.assessments[0].id);
    expect(detail.items.length).toBe(8);
    expect(detail.items.every((i) => i.correct && i.correctAnswer && i.prompt.length)).toBe(true);
  });

  it('backup round trip, rejection of damaged files, and restore with a safety backup', async () => {
    const { api, dir } = await setup();
    await api.setupParent(PIN);
    await api.createProfile(PIN, 'Kai', 'wave');
    const b = await api.exportBackup(PIN);
    expect(b.fileName).toMatch(/\.accbackup$/);
    const info = await api.inspectBackup(PIN, b.data);
    expect(info).toMatchObject({ ok: true, profiles: ['Kai'] });

    const env = JSON.parse(b.data);
    const tampered = JSON.stringify({ ...env, database: Buffer.from('garbage').toString('base64') });
    expect((await api.inspectBackup(PIN, tampered)).ok).toBe(false);
    expect((await api.inspectBackup(PIN, 'not json')).ok).toBe(false);
    expect((await api.restoreBackup(PIN, tampered)).ok).toBe(false);

    // change data, then restore the earlier backup
    await api.createProfile(PIN, 'Extra', 'leaf');
    expect((await api.listProfiles()).length).toBe(2);
    const r = await api.restoreBackup(PIN, b.data);
    expect(r.ok).toBe(true);
    expect(fs.existsSync(r.safetyBackup!)).toBe(true);
    expect((await api.listProfiles()).map((x) => x.displayName)).toEqual(['Kai']);
    // the restore is on disk
    const reopened = await AppDatabase.open(dir, new MemoryLogger());
    expect(reopened.db.all('SELECT display_name FROM profiles')).toEqual([{ display_name: 'Kai' }]);
  });

  it('previews typed math without judging it', async () => {
    const { api } = await setup();
    expect((await api.previewAnswer('2x^2-3x+1', 'expression')).tex).toBeTruthy();
    expect((await api.previewAnswer('y=2x+1', 'equation')).tex).toContain('=');
    expect((await api.previewAnswer('x2', 'expression')).error).toMatch(/\^/);
    expect((await api.previewAnswer('[2, 5)', 'interval')).tex).toBe('[2, 5)');
    expect((await api.previewAnswer('(3,-2)', 'point')).error).toBeNull();
  });

  it('standards view: every expectation, where it is taught, and the student\'s progress (parent only)', async () => {
    const { api, ctx } = await setup();
    await api.setupParent(PIN);
    const p = await api.createProfile(PIN, 'Ana', 'spark');
    await expect(api.getStandardsProgress('0000', p.id)).rejects.toThrow();
    let rows = await api.getStandardsProgress(PIN, p.id);
    const { EXPECTATIONS, LESSON_BY_ID } = await import('../../src/content');
    expect(rows.map((r) => r.code)).toEqual(EXPECTATIONS.map((e) => e.code));
    for (const r of rows) {
      expect(r.skills.length, r.code).toBeGreaterThan(0);
      expect(r.taught.length, r.code).toBeGreaterThan(0);
      expect(r.assessed.length, r.code).toBeGreaterThan(0);
      for (const l of [...r.taught, ...r.reviewed, ...r.assessed]) expect(LESSON_BY_ID.get(l.id)!.title).toBe(l.title);
      expect(r.percentProficient).toBe(0);
    }
    expect(rows.find((r) => r.code === 'A.FGR.2.4')!.taught[0]).toMatchObject({ id: 'U1L01', status: 'available' });
    // progress follows the student's skill states
    ctx.db.run("INSERT INTO skill_state(profile_id, skill_id, stage, score, evidence_count, updated_at) VALUES (?, 'S1.01', 'PROFICIENT', 0.9, 5, 0)", [p.id]);
    rows = await api.getStandardsProgress(PIN, p.id);
    const fgr24 = rows.find((r) => r.code === 'A.FGR.2.4')!;
    const n = fgr24.skills.length;
    expect(fgr24.skills.find((s) => s.skillId === 'S1.01')!.stage).toBe('PROFICIENT');
    expect(fgr24.percentProficient).toBe(Math.round(100 / n));
  });
});
