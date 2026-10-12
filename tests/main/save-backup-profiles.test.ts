/**
 * Regression tests (QA follow-up 3, data and reliability):
 * - C1: a failed background save is caught, retried, kept in memory and reported on every call result.
 * - C7/C14: daily automatic backups while the app stays open; pruning keeps the newest written.
 * - C10: two active students never share a name (rename, unarchive).
 * - C11: backups with the right table names but the wrong contents get the friendly message.
 * - C12: changing the PIN during a lockout explains the lockout.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import initSqlJs from 'sql.js';
import crypto from 'node:crypto';
import { boot } from '../../src/main/bootstrap';
import { dispatch } from '../../src/main/dispatch';
import { AppDatabase, autoBackupsOldestFirst } from '../../src/main/db/database';
import { REQUIRED_TABLES } from '../../src/main/db/schema';
import { MemoryLogger } from '../../src/main/logger';

const PIN = '4826';
const tmp = (tag: string) => fs.mkdtempSync(path.join(os.tmpdir(), `acc-${tag}-`));
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('background save failures (C1)', () => {
  it('are caught, reported on every call result and in the status, retried, and cleared after a good save', async () => {
    const uncaught: string[] = [];
    const onErr = (e: Error) => uncaught.push(e.message);
    process.on('uncaughtException', onErr);
    try {
      const dir = tmp('save');
      const log = new MemoryLogger();
      const b = await boot(dir, log, 'test');
      await b.api.setupParent(PIN);
      const p = await b.api.createProfile(PIN, 'Sam', 'spark');
      b.ctx.db.persistDelayMs = 5;
      b.ctx.db.persistRetryDelaysMs = [30];
      const blocker = path.join(dir, 'academy.sqlite.tmp');
      fs.mkdirSync(blocker); // the next write fails (EISDIR), like a file locked by antivirus
      const r1 = await dispatch(b.api, log, 'openLesson', [p.id, 'U1L01']);
      await wait(20);
      const r2 = await dispatch(b.api, log, 'getStudentDashboard', [p.id]);
      expect(r1.ok && r2.ok).toBe(true);
      expect(r2.saveError).toMatch(/could not be saved/);
      expect((await b.api.getStatus()).persistError).toMatch(/could not be saved/);
      expect(uncaught).toEqual([]);
      // still in memory
      expect(b.ctx.db.get('SELECT lesson_id FROM lesson_progress WHERE profile_id = ?', [p.id])).toBeTruthy();
      // the disk recovers: the automatic retry saves and the warning clears
      fs.rmdirSync(blocker);
      await wait(150);
      expect(b.ctx.db.lastPersistError).toBeNull();
      const r3 = await dispatch(b.api, log, 'listProfiles', []);
      expect(r3.saveError).toBeUndefined();
      expect((await b.api.getStatus()).persistError).toBeUndefined();
      b.ctx.db.close();
      const again = await AppDatabase.open(dir, new MemoryLogger());
      expect(again.db.get('SELECT lesson_id FROM lesson_progress WHERE profile_id = ?', [p.id])).toBeTruthy();
      again.db.close();
      expect(uncaught).toEqual([]);
    } finally {
      process.off('uncaughtException', onErr);
    }
  });
});

describe('daily automatic backups (C7, C14)', () => {
  it('are made every day while the app stays open', async () => {
    const dir = tmp('open');
    let t = Date.UTC(2026, 8, 1, 16, 0, 0);
    const b = await boot(dir, new MemoryLogger(), 'test', () => t);
    await b.api.setupParent(PIN);
    const p = await b.api.createProfile(PIN, 'Sam', 'spark');
    for (let d = 0; d < 5; d++) {
      t += 86_400_000;
      await b.api.heartbeat(p.id, null, 'dashboard', 15);
    }
    b.ctx.db.close();
    expect(fs.readdirSync(path.join(dir, 'backups', 'auto')).length).toBe(6);
  });

  it('keep the newest 14 written, even after the clock moves back', async () => {
    const dir = tmp('back');
    let t = Date.UTC(2026, 8, 30, 16, 0, 0);
    for (let i = 0; i < 14; i++) {
      const b = await boot(dir, new MemoryLogger(), 'test', () => t);
      b.ctx.db.close();
      t += 86_400_000;
    }
    t = Date.UTC(2026, 8, 1, 16, 0, 0); // the clock is reset to an earlier month
    const b = await boot(dir, new MemoryLogger(), 'test', () => t);
    b.ctx.db.close();
    const auto = path.join(dir, 'backups', 'auto');
    const names = fs.readdirSync(auto);
    expect(names.length).toBe(14);
    expect(names).toContain('academy-2026-09-01.sqlite'); // just written: kept
    expect(names).not.toContain('academy-2026-09-30.sqlite'); // oldest written: pruned
    expect(path.basename(autoBackupsOldestFirst(auto).at(-1)!)).toBe('academy-2026-09-01.sqlite');
  });
});

describe('student names (C10)', () => {
  it('two active students never share a name', async () => {
    const b = await boot(tmp('names'), new MemoryLogger(), 'test');
    await b.api.setupParent(PIN);
    const sam = await b.api.createProfile(PIN, 'Sam', 'spark');
    const ana = await b.api.createProfile(PIN, 'Ana', 'wave');
    await expect(b.api.updateProfile(PIN, ana.id, { displayName: 'sam' })).rejects.toThrow(/already/);
    await b.api.updateProfile(PIN, sam.id, { archived: true });
    await b.api.createProfile(PIN, 'SAM', 'leaf');
    await expect(b.api.updateProfile(PIN, sam.id, { archived: false })).rejects.toThrow(/Rename one of them/);
    // restoring with a new name works, and so does keeping one's own name with another case
    await b.api.updateProfile(PIN, sam.id, { archived: false, displayName: 'Sam R' });
    await b.api.updateProfile(PIN, ana.id, { displayName: 'ANA' });
    const active = (await b.api.listProfiles()).filter((x) => !x.archived).map((x) => x.displayName.toLowerCase());
    expect(new Set(active).size).toBe(active.length);
    b.ctx.db.close();
  });
});

describe('restoring unusable backups (C11)', () => {
  it('reports "not a valid backup" and leaves data unchanged', async () => {
    const b = await boot(tmp('bad'), new MemoryLogger(), 'test');
    await b.api.setupParent(PIN);
    await b.api.createProfile(PIN, 'Sam', 'spark');
    const env = JSON.parse((await b.api.exportBackup(PIN)).data);
    const SQL = await initSqlJs();
    const wrap = (bytes: Uint8Array) => JSON.stringify({ ...env, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), database: Buffer.from(bytes).toString('base64') });
    const wrongCols = new SQL.Database();
    for (const t of REQUIRED_TABLES) if (t !== 'meta') wrongCols.run(`CREATE TABLE ${t}(id INTEGER, junk TEXT)`);
    wrongCols.run('CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT)');
    wrongCols.run("INSERT INTO meta VALUES('schema_version','1')");
    const v0 = new SQL.Database(new Uint8Array(Buffer.from(env.database, 'base64')));
    v0.run("UPDATE meta SET value='0' WHERE key='schema_version'");
    const before = JSON.stringify(b.ctx.db.all('SELECT * FROM profiles'));
    for (const data of [wrap(wrongCols.export()), wrap(v0.export())]) {
      const r = await b.api.restoreBackup(PIN, data);
      expect(r.ok).toBe(false);
      expect(r.message).toMatch(/not a valid .* backup/);
      expect(JSON.stringify(b.ctx.db.all('SELECT * FROM profiles'))).toBe(before);
    }
    const info = await b.api.inspectBackup(PIN, wrap(wrongCols.export()));
    expect(info.ok).toBe(false);
    b.ctx.db.close();
  });
});

describe('Parent PIN lockout (C12)', () => {
  it('changing the PIN while locked out explains the lockout', async () => {
    let t = Date.UTC(2026, 8, 1, 16, 0, 0);
    const b = await boot(tmp('pin'), new MemoryLogger(), 'test', () => t);
    await b.api.setupParent(PIN);
    for (let i = 0; i < 5; i++) await b.api.verifyParentPin('1357');
    const r = await b.api.changeParentPin(PIN, '2468');
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/locked/);
    t += 61_000;
    expect((await b.api.changeParentPin(PIN, '2468')).ok).toBe(true);
    b.ctx.db.close();
  });
});
