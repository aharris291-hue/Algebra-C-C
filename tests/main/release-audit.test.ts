/**
 * Regression tests for the independent release audit:
 * - H1: only learning activities add study time; dashboard/settings time never makes a streak day.
 * - H2: the Parent Overview's "Coming up" data (next days, next assessment, milestones).
 * - M1: after a PIN change, calls still carrying the old PIN never count as wrong PINs.
 * - M2: when no copy of the data can be read: restore from a backup file or start fresh at startup,
 *       without ever deleting the unreadable files.
 * - M3: renderer errors are logged through a validated, scrubbed, truncated API method.
 * - L4/L6: one daily goal (the parent's), with the limits the Parent Mode inputs use; the old
 *       student-side dailyGoalMinutes setting is ignored and dropped.
 * - L7: a schema migration beyond v1: safety backup first, runs once, a failure changes nothing.
 * - L10: "Close. Look at it once more." only for an answer that is actually close.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { boot } from '../../src/main/bootstrap';
import { dispatch } from '../../src/main/dispatch';
import { validateArgs } from '../../src/main/ipc-schema';
import { AppDatabase, DatabaseOpenError, MigrationError, NoReadableDatabaseError, isValidSqlite, loadSqlJs } from '../../src/main/db/database';
import { MIGRATIONS, currentSchemaVersion } from '../../src/main/db/schema';
import { MemoryLogger } from '../../src/main/logger';
import { dataCopies, keepUnreadableFiles, restoreAtStartup, startFresh, startupChoiceFor, STARTUP_RECOVERY } from '../../src/main/db/startup-recovery';
import { scrubFrames, scrubMessage, MAX_CLIENT_MESSAGE, MAX_CLIENT_REPORTS } from '../../src/main/services/client-errors';
import { addStudyTime } from '../../src/main/services/records';
import { getParentDashboard, getStudentDashboard } from '../../src/main/services/dashboard';
import { getSettings, updateSettings, setGoals, getGoals } from '../../src/main/services/profiles';
import { DEFAULT_SETTINGS, GOAL_LIMITS, isLearningActivity, LESSON_SECTIONS } from '../../src/shared/api';
import { isNearMiss } from '../../src/core/math/answers';
import { NEAR_MISS_MESSAGE, ENCOURAGE, submitImmediate, getProblem } from '../../src/main/services/practice';
import { STREAK_RULE } from '../../src/core/engine/dates';
import { makeCtx } from './qa-helpers';
import { LESSONS, GENERATORS } from '../../src/content';

const PIN = '4826';
const tmp = (tag: string) => fs.mkdtempSync(path.join(os.tmpdir(), `acc-${tag}-`));

describe('H1: learning time only', () => {
  it('dashboard, course map, skills and settings time adds no minutes and never makes a streak day', async () => {
    const { ctx, pid, clock } = await makeCtx();
    clock.step = 0;
    for (const a of ['dashboard', 'course', 'skills', 'settings', 'profiles', 'parent', 'anything']) {
      expect(isLearningActivity(a), a).toBe(false);
      for (let i = 0; i < 25; i++) addStudyTime(ctx, pid, null, a, 30); // 12.5 min each
    }
    expect(ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM study_time')!.n).toBe(0);
    const sd = getStudentDashboard(ctx, pid);
    expect(sd.todayMinutes).toBe(0);
    expect(sd.streak.todayCounted).toBe(false);
    expect(getParentDashboard(ctx, pid).time.totalMinutes).toBe(0);
  });

  it('10 minutes of lesson, day, diagnostic or practice time make a streak day, and both dashboards agree', async () => {
    for (const a of [...LESSON_SECTIONS, 'review', 'assessment', 'diagnostic', 'practice']) expect(isLearningActivity(a), a).toBe(true);
    const { ctx, pid, clock } = await makeCtx();
    clock.step = 0;
    const seconds = STREAK_RULE.minActiveMinutes * 60;
    for (let s = 0; s < seconds - 30; s += 30) addStudyTime(ctx, pid, 'U1L01', s % 60 ? 'instruction' : 'guided', 30);
    expect(getStudentDashboard(ctx, pid).streak.todayCounted).toBe(false); // 9.5 min
    addStudyTime(ctx, pid, null, 'diagnostic', 30);
    const sd = getStudentDashboard(ctx, pid);
    const pd = getParentDashboard(ctx, pid);
    expect(sd.streak.todayCounted).toBe(true);
    expect(sd.todayMinutes).toBe(10);
    expect(pd.time.thisWeekMinutes).toBe(sd.weeklyGoal.minutesDone);
    expect(pd.time.totalMinutes).toBe(10);
  });

  it('non-learning time saved by an older version is left out of every total', async () => {
    const { ctx, pid, clock } = await makeCtx();
    clock.step = 0;
    ctx.db.run("INSERT INTO study_time(profile_id, local_date, lesson_id, activity, active_seconds) VALUES (?, '2026-09-07', '', 'dashboard', 1200)", [pid]);
    addStudyTime(ctx, pid, 'U1L01', 'independent', 30);
    addStudyTime(ctx, pid, 'U1L01', 'independent', 30);
    const sd = getStudentDashboard(ctx, pid);
    const pd = getParentDashboard(ctx, pid);
    expect(sd.todayMinutes).toBe(1);
    expect(pd.time.totalMinutes).toBe(1);
    expect(pd.time.byWeek.reduce((a, w) => a + w.minutes, 0)).toBe(1);
  });

  it('the heartbeat API ignores a non-learning activity', async () => {
    const b = await boot(tmp('hb'), new MemoryLogger(), 'test');
    await b.api.setupParent(PIN);
    const p = await b.api.createProfile(PIN, 'Sam', 'spark');
    for (let i = 0; i < 30; i++) await b.api.heartbeat(p.id, null, 'dashboard', 30);
    await b.api.heartbeat(p.id, 'U1L01', 'guided', 30);
    expect(b.ctx.db.all('SELECT activity, active_seconds FROM study_time')).toEqual([{ activity: 'guided', active_seconds: 30 }]);
    b.ctx.db.close();
  });
});

describe('H2: Parent Overview "Coming up"', () => {
  it('lists the next course days, the next unit assessment and milestones', async () => {
    const { ctx, pid } = await makeCtx();
    let c = getParentDashboard(ctx, pid).comingUp;
    expect(c.nextLessons.map((l) => l.day)).toEqual([1, 2, 3, 4, 5]);
    const ua = LESSONS.find((l) => l.kind === 'unit-assessment')!;
    expect(c.nextAssessment).toMatchObject({ id: ua.id, kind: 'unit-assessment', daysBefore: ua.day - 1 });
    expect(c.nextAssessment!.weeksAtGoal).toBe(Math.ceil(ua.day / 5));
    expect(c.milestones[0]).toMatch(/^Level 2 in 100 XP/);
    expect(c.milestones.some((m) => /^Unit 1 .* is finished after \d+ more course days/.test(m))).toBe(true);
    expect(c.milestones.some((m) => /^Halfway through the course after 45 more course days/.test(m))).toBe(true);
    // finish the days before the unit assessment: it is next up
    for (const l of LESSONS.filter((x) => x.day < ua.day))
      ctx.db.run("INSERT OR REPLACE INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at, completed_at) VALUES (?,?,'completed','summary','{}',1,1,1)", [pid, l.id]);
    c = getParentDashboard(ctx, pid).comingUp;
    expect(c.nextLessons[0].id).toBe(ua.id);
    expect(c.nextAssessment).toMatchObject({ id: ua.id, daysBefore: 0, weeksAtGoal: 1 });
    // XP and this week's lessons are in the engagement data the Overview shows
    const pd = getParentDashboard(ctx, pid);
    expect(typeof pd.engagement.xp).toBe('number');
    expect(typeof pd.engagement.weeklyLessons).toBe('number');
  });
});

describe('M1: changing the Parent PIN', () => {
  it('calls still carrying the old PIN are refused without counting as wrong PINs or locking Parent Mode', async () => {
    let t = Date.UTC(2026, 8, 1, 16, 0, 0);
    const b = await boot(tmp('pinchange'), new MemoryLogger(), 'test', () => t);
    await b.api.setupParent('2580');
    const p = await b.api.createProfile('2580', 'Sam', 'spark');
    expect((await b.api.changeParentPin('2580', PIN)).ok).toBe(true);
    for (let i = 0; i < 8; i++) {
      const r = await dispatch(b.api, new MemoryLogger(), 'getParentDashboard', ['2580', p.id]);
      expect(r.ok).toBe(false);
      expect(!r.ok && r.error).toMatch(/PIN was just changed/);
    }
    expect(b.ctx.db.get<{ failed_attempts: number; locked_until: number }>('SELECT failed_attempts, locked_until FROM parent')).toEqual({ failed_attempts: 0, locked_until: 0 });
    expect(await b.api.verifyParentPin(PIN)).toEqual({ ok: true });
    expect((await b.api.getParentDashboard(PIN, p.id)).profile.id).toBe(p.id);
    // a truly wrong PIN still counts
    await expect(b.api.getParentDashboard('1357', p.id)).rejects.toThrow(/not correct/);
    expect(b.ctx.db.get<{ failed_attempts: number }>('SELECT failed_attempts FROM parent')!.failed_attempts).toBe(1);
    // long after the change, the old PIN is just a wrong PIN again
    t += 31 * 60_000;
    await expect(b.api.getParentDashboard('2580', p.id)).rejects.toThrow(/not correct/);
    b.ctx.db.close();
  });
});

describe('M2: no readable copy of the data at startup', () => {
  async function brokenDataDir(): Promise<{ dir: string; backupData: string }> {
    // a real data folder with a backup file, then every copy damaged
    const dir = tmp('allbad');
    const b = await boot(dir, new MemoryLogger(), 'test');
    await b.api.setupParent(PIN);
    await b.api.createProfile(PIN, 'Riley', 'rocket');
    const backupData = (await b.api.exportBackup(PIN)).data;
    b.ctx.db.close();
    fs.writeFileSync(path.join(dir, 'academy.sqlite'), 'not a database');
    fs.writeFileSync(path.join(dir, 'academy.sqlite.prev'), 'SQLite format 3\u0000garbage');
    const auto = path.join(dir, 'backups', 'auto');
    for (const f of fs.readdirSync(auto)) fs.writeFileSync(path.join(auto, f), 'truncated');
    return { dir, backupData };
  }
  const snapshot = (dir: string) => Object.fromEntries(dataCopies(dir).map((f) => [path.relative(dir, f), fs.readFileSync(f, 'latin1')]));

  it('the error no longer points to Parent Mode, and offers restore / start fresh / quit', async () => {
    const { dir } = await brokenDataDir();
    const err = await AppDatabase.open(dir, new MemoryLogger()).catch((e) => e);
    expect(err).toBeInstanceOf(NoReadableDatabaseError);
    expect(err).toBeInstanceOf(DatabaseOpenError);
    expect(err.message).not.toMatch(/Parent Mode/);
    expect(STARTUP_RECOVERY.buttons).toEqual(['Restore from a backup file…', 'Start fresh', 'Quit']);
    expect([0, 1, 2, -1].map(startupChoiceFor)).toEqual(['restore', 'fresh', 'quit', 'quit']);
    expect(`${STARTUP_RECOVERY.message} ${STARTUP_RECOVERY.detail}`).not.toMatch(/Parent Mode/);
  });

  it('a bad backup file is refused with the normal restore checks and nothing on disk changes', async () => {
    const { dir, backupData } = await brokenDataDir();
    const before = snapshot(dir);
    const env = JSON.parse(backupData);
    for (const bad of ['', 'not json', JSON.stringify({ ...env, sha256: '0'.repeat(64) }), JSON.stringify({ ...env, format: 'other' })]) {
      const r = await restoreAtStartup(dir, bad, new MemoryLogger(), 'test', Date.now());
      expect(r.ok).toBe(false);
    }
    expect(snapshot(dir)).toEqual(before);
    expect(fs.readdirSync(dir).some((f) => f.startsWith('unreadable-'))).toBe(false);
  });

  it('a good backup file is restored; the unreadable files are kept, unchanged, in a folder', async () => {
    const { dir, backupData } = await brokenDataDir();
    const before = snapshot(dir);
    const r = await restoreAtStartup(dir, backupData, new MemoryLogger(), 'test', Date.UTC(2026, 9, 1));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.profiles).toEqual(['Riley']);
    // every unreadable copy is still there, byte for byte
    const kept = Object.fromEntries(Object.entries(before).map(([rel]) => [rel, fs.readFileSync(path.join(r.keptIn!, rel.startsWith('backups') ? path.join('auto', path.basename(rel)) : rel), 'latin1')]));
    expect(kept).toEqual(before);
    const b = await boot(dir, new MemoryLogger(), 'test');
    expect((await b.api.listProfiles()).map((p) => p.displayName)).toEqual(['Riley']);
    expect(await b.api.verifyParentPin(PIN)).toEqual({ ok: true });
    b.ctx.db.close();
  });

  it('start fresh keeps the unreadable files in a folder and opens empty data', async () => {
    const { dir } = await brokenDataDir();
    const before = snapshot(dir);
    const { keptIn } = startFresh(dir, new MemoryLogger(), Date.UTC(2026, 9, 1));
    expect(keptIn).toMatch(/unreadable-2026-10-01/);
    expect(fs.readFileSync(path.join(keptIn!, 'academy.sqlite'), 'latin1')).toBe(before['academy.sqlite']);
    expect(fs.readFileSync(path.join(keptIn!, 'academy.sqlite.prev'), 'latin1')).toBe(before['academy.sqlite.prev']);
    expect(fs.readdirSync(path.join(keptIn!, 'auto')).length).toBe(Object.keys(before).filter((k) => k.startsWith('backups')).length);
    const b = await boot(dir, new MemoryLogger(), 'test');
    expect((await b.api.getStatus()).firstRun).toBe(true);
    b.ctx.db.close();
    // a second start-fresh on the same second never overwrites the first folder
    expect(keepUnreadableFiles(dir, Date.UTC(2026, 9, 1))).not.toBe(keptIn);
    expect(fs.existsSync(path.join(keptIn!, 'academy.sqlite'))).toBe(true);
  });
});

describe('M3: renderer errors reach the main-process log', () => {
  it('validates the arguments', () => {
    expect(validateArgs('reportClientError', ['error', 'TypeError: x is undefined'])).toBeNull();
    expect(validateArgs('reportClientError', ['boundary', 'Error: boom', '    at Home (index.js:1:2)'])).toBeNull();
    expect(validateArgs('reportClientError', ['error', 'x'.repeat(20_001)])).not.toBeNull();
    expect(validateArgs('reportClientError', ['error', 1])).not.toBeNull();
    expect(validateArgs('reportClientError', [{}, 'x'])).not.toBeNull();
  });

  it('logs a scrubbed, truncated message with code locations only, and stops after a cap', async () => {
    const log = new MemoryLogger();
    const b = await boot(tmp('clienterr'), log, 'test');
    const stack = [
      'TypeError: Cannot read properties of undefined (reading "Riley answered 3x+5")',
      '    at Home (http://127.0.0.1:5410/assets/index-abc.js:40:1234)',
      '    at http://127.0.0.1:5410/assets/index-abc.js:12:7',
      '    secret line with PIN 2580',
    ].join('\n');
    await b.api.reportClientError('boundary', 'TypeError: "Riley answered 3x+5" with PIN 25801 ' + 'z'.repeat(1000), stack);
    const line = log.lines.find((l) => l.includes('[renderer]'))!;
    expect(line).toMatch(/^ERROR \[renderer\] boundary: TypeError: "…" with PIN # z+…/);
    expect(line).not.toMatch(/Riley|3x\+5|2580/);
    expect(line).toContain('Home (index-abc.js:40:1234) < <anonymous> (index-abc.js:12:7)');
    expect(line).not.toContain('127.0.0.1');
    expect(scrubMessage('a'.repeat(5000)).length).toBe(MAX_CLIENT_MESSAGE);
    expect(scrubFrames('no frames here "Riley"')).toBe('');
    await b.api.reportClientError('weird-kind', 'x');
    expect(log.lines.filter((l) => l.includes('[renderer]')).pop()).toMatch(/\] other: x$/);
    for (let i = 0; i < MAX_CLIENT_REPORTS + 10; i++) await b.api.reportClientError('error', `e${i}`);
    expect(log.lines.filter((l) => l.includes('[renderer]')).length).toBe(MAX_CLIENT_REPORTS);
    b.ctx.db.close();
  });
});

describe('L4/L6: one daily goal, owned by the parent', () => {
  it('the goal limits are the ones the Parent Mode inputs use', async () => {
    const { ctx, pid } = await makeCtx();
    setGoals(ctx, pid, { weeklyLessons: GOAL_LIMITS.weeklyLessons.max, dailyMinutes: GOAL_LIMITS.dailyMinutes.max });
    expect(getGoals(ctx, pid)).toEqual({ weeklyLessons: 10, dailyMinutes: 120 });
    expect(() => setGoals(ctx, pid, { weeklyLessons: 5, dailyMinutes: GOAL_LIMITS.dailyMinutes.max + 1 })).toThrow(/between 10 and 120/);
    expect(() => setGoals(ctx, pid, { weeklyLessons: 5, dailyMinutes: GOAL_LIMITS.dailyMinutes.min - 1 })).toThrow(/between 10 and 120/);
    const src = fs.readFileSync(path.resolve(__dirname, '../../src/renderer/screens/Parent.tsx'), 'utf8');
    expect(src).toContain('max={GOAL_LIMITS.dailyMinutes.max}');
    expect(src).not.toMatch(/max=\{180\}/);
  });

  it('settings have no daily goal; an old save with one still reads, and the field is dropped on the next save', async () => {
    const { ctx, pid } = await makeCtx();
    expect(Object.keys(DEFAULT_SETTINGS).sort()).toEqual(['reducedMotion', 'sound', 'textScale', 'theme']);
    ctx.db.run('UPDATE profiles SET settings_json = ? WHERE id = ?', [JSON.stringify({ sound: true, reducedMotion: false, textScale: 1.2, theme: 'dark', dailyGoalMinutes: 45 }), pid]);
    expect(getSettings(ctx, pid)).toEqual({ sound: true, reducedMotion: false, textScale: 1.2, theme: 'dark' });
    updateSettings(ctx, pid, { sound: false, dailyGoalMinutes: 60 } as never);
    const stored = JSON.parse(ctx.db.get<{ settings_json: string }>('SELECT settings_json FROM profiles WHERE id = ?', [pid])!.settings_json);
    expect(stored).toEqual({ sound: false, reducedMotion: false, textScale: 1.2, theme: 'dark' });
    // garbage in an old save falls back to the defaults
    ctx.db.run('UPDATE profiles SET settings_json = ? WHERE id = ?', ['{"theme":"neon","textScale":9}', pid]);
    expect(getSettings(ctx, pid)).toEqual(DEFAULT_SETTINGS);
  });
});

describe('L7: a migration beyond the current schema', () => {
  // the newest real schema version; the fake migrations come after it
  const BASE = MIGRATIONS[MIGRATIONS.length - 1].version;
  const BASE_COUNT = MIGRATIONS.length;
  const fakeV2 = { version: BASE + 1, description: 'test: add a column', sql: 'ALTER TABLE profiles ADD COLUMN test_color TEXT; UPDATE profiles SET test_color = \'blue\';' };
  afterEach(() => {
    while (MIGRATIONS.length > BASE_COUNT) MIGRATIONS.pop();
  });

  async function v1DataDir(): Promise<string> {
    const dir = tmp('mig');
    const { db } = await AppDatabase.open(dir, new MemoryLogger());
    db.insert("INSERT INTO profiles(display_name, created_at) VALUES ('Sam', 1)");
    db.close();
    return dir;
  }

  it('writes a pre-migration safety backup, migrates, and runs the migration only once', async () => {
    const dir = await v1DataDir();
    const original = fs.readFileSync(path.join(dir, 'academy.sqlite'));
    MIGRATIONS.push(fakeV2);
    expect(currentSchemaVersion()).toBe(BASE + 1);
    const log = new MemoryLogger();
    const opened = await AppDatabase.open(dir, log);
    expect(opened.migratedFrom).toBe(BASE);
    expect(opened.db.schemaVersion()).toBe(BASE + 1);
    expect(opened.db.all('SELECT display_name, test_color FROM profiles')).toEqual([{ display_name: 'Sam', test_color: 'blue' }]);
    const safety = fs.readdirSync(path.join(dir, 'backups', 'safety'));
    expect(safety).toHaveLength(1);
    expect(safety[0]).toMatch(new RegExp(`^pre-migration-v${BASE}-`));
    const sb = fs.readFileSync(path.join(dir, 'backups', 'safety', safety[0]));
    const sql = await loadSqlJs();
    expect(isValidSqlite(sql, new Uint8Array(sb)).version).toBe(BASE);
    expect(sb.equals(original)).toBe(true);
    opened.db.close();
    // on disk it is version 2 now; opening again does not migrate (or back up) again
    const log2 = new MemoryLogger();
    const again = await AppDatabase.open(dir, log2);
    expect(again.migratedFrom).toBeUndefined();
    expect(log2.lines.some((l) => l.includes('migrated'))).toBe(false);
    expect(again.db.get('SELECT test_color FROM profiles')).toEqual({ test_color: 'blue' });
    expect(fs.readdirSync(path.join(dir, 'backups', 'safety'))).toHaveLength(1);
    again.db.close();
    expect(log.lines.filter((l) => l.includes(`migrated to schema ${BASE + 1}`))).toHaveLength(1);
  });

  it('a failing migration leaves the original data intact (on disk and when opened by the old schema)', async () => {
    const dir = await v1DataDir();
    const files = () => Object.fromEntries(['academy.sqlite', 'academy.sqlite.prev'].filter((f) => fs.existsSync(path.join(dir, f))).map((f) => [f, fs.readFileSync(path.join(dir, f)).toString('base64')]));
    const before = files();
    MIGRATIONS.push(fakeV2, { version: BASE + 2, description: 'test: broken', sql: 'UPDATE profiles SET display_name = \'changed\'; INSERT INTO no_such_table VALUES (1);' });
    const err = await AppDatabase.open(dir, new MemoryLogger()).catch((e) => e);
    expect(err).toBeInstanceOf(MigrationError);
    expect(err.message).toMatch(/Nothing was changed/);
    // wait past the save delay: nothing may be written later either
    await new Promise((r) => setTimeout(r, 400));
    expect(files()).toEqual(before);
    expect(fs.readdirSync(path.join(dir, 'backups', 'safety')).filter((f) => f.startsWith(`pre-migration-v${BASE}-`))).toHaveLength(1);
    // with the broken migration fixed (removed), the data opens and migrates normally
    MIGRATIONS.pop();
    const ok = await AppDatabase.open(dir, new MemoryLogger());
    expect(ok.db.all('SELECT display_name, test_color FROM profiles')).toEqual([{ display_name: 'Sam', test_color: 'blue' }]);
    ok.db.close();
  });

  it('an older backup is migrated in memory when restored', async () => {
    const dir = tmp('migrestore');
    const b = await boot(dir, new MemoryLogger(), 'test');
    await b.api.setupParent(PIN);
    await b.api.createProfile(PIN, 'Sam', 'spark');
    const v1Backup = (await b.api.exportBackup(PIN)).data;
    MIGRATIONS.push(fakeV2);
    const r = await b.api.restoreBackup(PIN, v1Backup);
    expect(r.ok).toBe(true);
    expect(b.ctx.db.schemaVersion()).toBe(BASE + 1);
    expect(b.ctx.db.get('SELECT test_color FROM profiles')).toEqual({ test_color: 'blue' });
    b.ctx.db.close();
  });
});

describe('L10: "Close" only when the answer is close', () => {
  it('isNearMiss: within 5% with the same sign, numeric answers only', () => {
    const n = (value: string, roundTo?: number) => ({ kind: 'number' as const, value, roundTo });
    expect(isNearMiss(n('100'), '98')).toBe(true);
    expect(isNearMiss(n('100'), '105')).toBe(true);
    expect(isNearMiss(n('100'), '106')).toBe(false);
    expect(isNearMiss(n('100'), '100')).toBe(false); // right is not "close"
    expect(isNearMiss(n('-7/2'), '-3.4')).toBe(true);
    expect(isNearMiss(n('-7/2'), '3.5')).toBe(false); // a sign error is not close
    expect(isNearMiss(n('12'), '21')).toBe(false);
    expect(isNearMiss(n('0'), '0.01')).toBe(false);
    expect(isNearMiss(n('12'), 'abc')).toBe(false);
    expect(isNearMiss({ kind: 'expression', value: '2x+1' }, '2x+1.01')).toBe(false);
    expect(isNearMiss({ kind: 'choice', options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], correct: 'a' }, 'b')).toBe(false);
  });

  it('practice feedback says "Close" only for a near miss, otherwise neutral encouragement', async () => {
    expect(ENCOURAGE.join(' ')).not.toMatch(/Close/);
    const { ctx, pid } = await makeCtx();
    // a practice set with a numeric problem, driven directly through the practice service
    const ps = {
      activity: 'independent',
      hintsAllowed: true,
      items: [{ key: 'k1', generatorId: '', seed: 1, difficulty: 1, skillId: '', review: false, state: 'open', attempts: 0, hintLevel: 0, maxHintLevel: 0, hintsUsed: 0, stepIndex: 0, shownAt: ctx.now() }],
      streaks: {},
      adapt: {},
    };
    // find a generator whose answer is a whole number above 20 (the wrong tries below are not listed misconceptions)
    let gen: string | null = null;
    let value = 0;
    for (const g of GENERATORS.values()) {
      const p = getProblem(g.id, 1, 1);
      const v = Number(p.answer.kind === 'number' ? p.answer.value : NaN);
      const tries = [v * 3 + 7, v + 1, -v].map(String);
      if (p.answer.kind === 'number' && !p.answer.roundTo && !p.answer.unit && v > 20 && Number.isInteger(v) && !p.steps?.length && !p.misconceptions.some((m) => tries.includes(m.answer.trim()))) {
        gen = g.id;
        ps.items[0].skillId = g.skillId;
        value = Number(p.answer.value);
        break;
      }
    }
    expect(gen).not.toBeNull();
    ps.items[0].generatorId = gen!;
    const msgs: string[] = [];
    for (const resp of [String(value * 3 + 7), String(value + 1), String(-value)]) {
      submitImmediate(ctx, pid, 'U1L01', ps as never, 'k1', resp, 20_000);
      msgs.push((ps.items[0] as unknown as { lastFeedback: { message: string } }).lastFeedback.message);
    }
    expect(msgs[0]).not.toMatch(/Close/);
    expect(msgs[1]).toMatch(new RegExp('^' + NEAR_MISS_MESSAGE.replace('.', '\\.')));
    expect(msgs[2]).not.toMatch(/Close/);
  });
});
