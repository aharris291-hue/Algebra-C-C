/**
 * SQLite (sql.js) database with crash-safe persistence.
 *
 * Writes go to the in-memory database inside transactions. The whole database is then
 * written to disk atomically: academy.sqlite.tmp (fsync) -> rename the current file to
 * academy.sqlite.prev -> rename tmp to academy.sqlite. A crash at any point leaves at
 * least one complete, valid file, and open() knows how to find it.
 */
import fs from 'node:fs';
import path from 'node:path';
import initSqlJs, { Database as SqlJsDatabase, SqlJsStatic, SqlValue } from 'sql.js';
import { MIGRATIONS, currentSchemaVersion, REQUIRED_TABLES } from './schema';
import type { Logger } from '../logger';

export type Row = Record<string, SqlValue>;
export type Params = SqlValue[] | Record<string, SqlValue>;

export class NewerDatabaseError extends Error {
  constructor(public readonly found: number) {
    super(`This data was saved by a newer version of the app (schema ${found}). Please update the app.`);
  }
}
export class DatabaseOpenError extends Error {}
/** No copy of the student data (main, interrupted save, previous save, daily backups) could be read. */
export class NoReadableDatabaseError extends DatabaseOpenError {
  constructor() {
    super('No readable copy of the student database was found.');
  }
}
/** A schema migration failed; nothing on disk was changed (a safety backup was written first). */
export class MigrationError extends DatabaseOpenError {
  constructor(
    readonly fromVersion: number,
    readonly failedVersion: number,
    cause: Error,
  ) {
    super(`The student data could not be updated for this version of the app (step ${failedVersion} failed: ${cause.message}). Nothing was changed; the data is still as it was.`);
  }
}

let SQL: SqlJsStatic | null = null;

/** Find sql-wasm.wasm both in development (node_modules) and in the packaged app. */
function wasmCandidates(): string[] {
  const out: string[] = [];
  if (process.env.SQLJS_WASM_PATH) out.push(process.env.SQLJS_WASM_PATH);
  out.push(path.join(__dirname, 'sql-wasm.wasm'));
  const resourcesPath = (process as unknown as { resourcesPath?: string }).resourcesPath;
  if (resourcesPath) out.push(path.join(resourcesPath, 'sql-wasm.wasm'));
  try {
    out.push(require.resolve('sql.js/dist/sql-wasm.wasm'));
  } catch {
    /* not resolvable when bundled */
  }
  return out;
}

export async function loadSqlJs(): Promise<SqlJsStatic> {
  if (SQL) return SQL;
  const file = wasmCandidates().find((p) => fs.existsSync(p));
  if (!file) throw new DatabaseOpenError('sql-wasm.wasm not found');
  const wasmBinary = fs.readFileSync(file);
  SQL = await initSqlJs({ wasmBinary: wasmBinary.buffer.slice(wasmBinary.byteOffset, wasmBinary.byteOffset + wasmBinary.byteLength) as ArrayBuffer });
  return SQL;
}

export interface OpenResult {
  db: AppDatabase;
  /** set when the main file was unreadable and an earlier copy was used */
  recoveredFrom?: 'tmp' | 'prev' | 'auto-backup';
  migratedFrom?: number;
  created: boolean;
}

export function isValidSqlite(sql: SqlJsStatic, bytes: Uint8Array): { ok: boolean; version?: number; reason?: string } {
  let d: SqlJsDatabase | null = null;
  try {
    // SQLite header check
    const header = Buffer.from(bytes.slice(0, 16)).toString('latin1');
    if (header !== 'SQLite format 3\u0000') return { ok: false, reason: 'not a SQLite file' };
    d = new sql.Database(bytes);
    const ic = d.exec('PRAGMA integrity_check');
    if (!ic.length || ic[0].values[0][0] !== 'ok') return { ok: false, reason: 'integrity check failed' };
    const tables = new Set((d.exec("SELECT name FROM sqlite_master WHERE type='table'")[0]?.values ?? []).map((r) => String(r[0])));
    const missing = REQUIRED_TABLES.filter((t) => !tables.has(t));
    if (missing.length) return { ok: false, reason: 'missing tables: ' + missing.join(', ') };
    const v = d.exec("SELECT value FROM meta WHERE key='schema_version'");
    const version = v.length ? Number(v[0].values[0][0]) : NaN;
    if (!Number.isFinite(version)) return { ok: false, reason: 'no schema version' };
    return { ok: true, version };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  } finally {
    d?.close();
  }
}

/** Automatic backups in `dir`, oldest written first (by modification time, then name). */
export function autoBackupsOldestFirst(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sqlite'))
    .map((f) => {
      const full = path.join(dir, f);
      return { full, f, m: fs.statSync(full).mtimeMs };
    })
    .sort((a, b) => a.m - b.m || (a.f < b.f ? -1 : a.f > b.f ? 1 : 0))
    .map((x) => x.full);
}

export class AppDatabase {
  private dirty = false;
  private timer: NodeJS.Timeout | null = null;
  private inTx = false;
  persistDelayMs = 300;
  lastPersistError: Error | null = null;
  /** consecutive failed saves; drives the retry backoff */
  private persistFailures = 0;
  /** retry delays after a failed background save (ms); the last one repeats */
  persistRetryDelaysMs = [1_000, 2_000, 5_000, 10_000, 30_000];

  private constructor(
    private sql: SqlJsStatic,
    private db: SqlJsDatabase,
    readonly dir: string,
    private log: Logger,
    private now: () => number,
  ) {}

  get file(): string {
    return path.join(this.dir, 'academy.sqlite');
  }
  get backupsDir(): string {
    return path.join(this.dir, 'backups');
  }

  static async open(dir: string, log: Logger, now: () => number = Date.now, appVersion = '0.0.0'): Promise<OpenResult> {
    const sql = await loadSqlJs();
    fs.mkdirSync(dir, { recursive: true });
    const main = path.join(dir, 'academy.sqlite');
    const candidates: Array<{ file: string; tag?: OpenResult['recoveredFrom'] }> = [{ file: main }, { file: main + '.tmp', tag: 'tmp' }, { file: main + '.prev', tag: 'prev' }];
    // newest written first (by write order, not by the date in the name: the clock may have moved back)
    for (const f of autoBackupsOldestFirst(path.join(dir, 'backups', 'auto')).reverse()) candidates.push({ file: f, tag: 'auto-backup' });
    const anyExists = candidates.some((c) => fs.existsSync(c.file));
    if (!anyExists) {
      const db = new AppDatabase(sql, new sql.Database(), dir, log, now);
      db.migrate(0, appVersion);
      db.flushNow();
      return { db, created: true };
    }
    for (const c of candidates) {
      if (!fs.existsSync(c.file)) continue;
      const bytes = new Uint8Array(fs.readFileSync(c.file));
      const check = isValidSqlite(sql, bytes);
      if (!check.ok) {
        log.warn('db', `candidate ${path.basename(c.file)} rejected: ${check.reason}`);
        continue;
      }
      if (check.version! > currentSchemaVersion()) throw new NewerDatabaseError(check.version!);
      const db = new AppDatabase(sql, new sql.Database(bytes), dir, log, now);
      let migratedFrom: number | undefined;
      if (check.version! < currentSchemaVersion()) {
        // a copy of the data exactly as it was, before anything is changed
        db.safetyBackup(`pre-migration-v${check.version}`);
        migratedFrom = check.version;
        // the migration runs in memory; nothing is written to disk unless every step succeeds
        db.migrate(check.version!, appVersion);
      }
      if (c.tag) {
        log.warn('db', `recovered database from ${c.tag}`);
        // keep the unreadable main file for diagnosis, then write the recovered data as main
        if (fs.existsSync(main)) fs.renameSync(main, main + `.corrupt-${now()}`);
      }
      db.setMeta('app_version', appVersion);
      db.flushNow();
      return { db, recoveredFrom: c.tag, migratedFrom, created: false };
    }
    throw new NoReadableDatabaseError();
  }

  /** Open an in-memory database from bytes (used to inspect backups). */
  static async fromBytes(bytes: Uint8Array, log: Logger): Promise<AppDatabase> {
    const sql = await loadSqlJs();
    return new AppDatabase(sql, new sql.Database(bytes), '', log, Date.now);
  }

  /** Bring an in-memory database (e.g. a backup being restored) up to the current schema. */
  upgradeInMemory(appVersion: string): number | undefined {
    const v = this.schemaVersion();
    if (v > currentSchemaVersion()) throw new NewerDatabaseError(v);
    if (v === currentSchemaVersion()) return undefined;
    this.migrate(v, appVersion);
    return v;
  }

  private migrate(from: number, appVersion: string): void {
    for (const m of [...MIGRATIONS].sort((a, b) => a.version - b.version).filter((x) => x.version > from)) {
      this.db.exec('BEGIN');
      try {
        this.db.exec(m.sql);
        this.db.run("INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', ?)", [String(m.version)]);
        if (m.version === 1) {
          this.db.run("INSERT OR REPLACE INTO meta(key, value) VALUES ('created_at', ?)", [String(this.now())]);
        }
        this.db.exec('COMMIT');
        this.log.info('db', `migrated to schema ${m.version}: ${m.description}`);
      } catch (e) {
        try {
          this.db.exec('ROLLBACK');
        } catch {
          /* the failed statement already ended the transaction */
        }
        this.log.error('db', `migration to schema ${m.version} failed`, e);
        throw from === 0 ? e : new MigrationError(from, m.version, e as Error);
      }
    }
    this.setMeta('app_version', appVersion);
    this.dirty = true;
  }

  schemaVersion(): number {
    return Number(this.getMeta('schema_version') ?? 0);
  }
  getMeta(key: string): string | null {
    const r = this.get<{ value: string }>('SELECT value FROM meta WHERE key = ?', [key]);
    return r ? r.value : null;
  }
  setMeta(key: string, value: string): void {
    this.run('INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)', [key, value]);
  }

  run(sqlText: string, params: Params = []): void {
    this.db.run(sqlText, params as never);
    this.dirty = true;
    if (!this.inTx) this.schedulePersist();
  }
  /** Insert and return the new rowid. */
  insert(sqlText: string, params: Params = []): number {
    this.db.run(sqlText, params as never);
    this.dirty = true;
    const id = Number(this.db.exec('SELECT last_insert_rowid()')[0].values[0][0]);
    if (!this.inTx) this.schedulePersist();
    return id;
  }
  all<T = Row>(sqlText: string, params: Params = []): T[] {
    const stmt = this.db.prepare(sqlText);
    try {
      stmt.bind(params as never);
      const out: T[] = [];
      while (stmt.step()) out.push(stmt.getAsObject() as T);
      return out;
    } finally {
      stmt.free();
    }
  }
  get<T = Row>(sqlText: string, params: Params = []): T | undefined {
    return this.all<T>(sqlText, params)[0];
  }

  /** Run fn atomically; on any error the database is unchanged. */
  transaction<T>(fn: () => T): T {
    if (this.inTx) return fn();
    this.db.exec('BEGIN');
    this.inTx = true;
    try {
      const r = fn();
      this.db.exec('COMMIT');
      this.inTx = false;
      this.dirty = true;
      this.schedulePersist();
      return r;
    } catch (e) {
      this.inTx = false;
      try {
        this.db.exec('ROLLBACK');
      } catch {
        /* already rolled back */
      }
      throw e;
    }
  }

  private schedulePersist(delayMs = this.persistDelayMs): void {
    if (!this.dir) return;
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      // never throws: a failed background save keeps the data in memory and retries
      this.persistNow();
    }, delayMs);
    // a retry loop for a failing disk must not keep the process alive on its own (quit flushes explicitly)
    if (this.persistFailures > 0) this.timer.unref?.();
  }

  /**
   * Save now without throwing. On failure the change stays in memory (still dirty),
   * `lastPersistError` is set so the UI can warn, and a retry is scheduled with backoff.
   * Returns true when everything is on disk. Services that need an immediate save
   * (finished quiz/assessment/day, PIN changes, new profiles) call this.
   */
  persistNow(): boolean {
    try {
      this.flushNow();
      return true;
    } catch {
      const delays = this.persistRetryDelaysMs;
      const delay = delays[Math.min(delays.length - 1, this.persistFailures - 1)] ?? 1_000;
      this.schedulePersist(delay);
      return false;
    }
  }

  exportBytes(): Uint8Array {
    return this.db.export();
  }

  /** Test harness only: make every save fail, as a full or unplugged disk would. */
  simulateDiskFailure = false;

  /** Called after each successful save (used for the daily automatic backup check). */
  onSaved?: () => void;

  /** Write the database to disk now (atomic). Throws on failure; see persistNow(). */
  flushNow(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (!this.dir || !this.dirty) return;
    const bytes = this.db.export();
    const main = this.file;
    const tmp = main + '.tmp';
    try {
      if (this.simulateDiskFailure) throw new Error('simulated disk failure (test harness)');
      const fd = fs.openSync(tmp, 'w');
      try {
        fs.writeSync(fd, bytes);
        fs.fsyncSync(fd);
      } finally {
        fs.closeSync(fd);
      }
      if (fs.existsSync(main)) fs.renameSync(main, main + '.prev');
      fs.renameSync(tmp, main);
      this.dirty = false;
      if (this.lastPersistError) this.log.info('db', 'save succeeded again after an earlier failure');
      this.lastPersistError = null;
      this.persistFailures = 0;
      this.onSaved?.();
    } catch (e) {
      this.lastPersistError = e as Error;
      this.persistFailures++;
      // log the first failure and then only occasionally, so retries do not flood the log
      if (this.persistFailures === 1 || this.persistFailures % 20 === 0) this.log.error('db', `save failed (${this.persistFailures}x): ` + (e as Error).message);
      throw e;
    }
  }

  /** Copy the current on-disk state into backups/<label>-<time>.sqlite */
  safetyBackup(label: string): string {
    const dir = path.join(this.backupsDir, 'safety');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${label}-${new Date(this.now()).toISOString().replace(/[:.]/g, '-')}.sqlite`);
    fs.writeFileSync(file, this.db.export());
    return file;
  }

  /** One automatic backup per calendar day, keeping the newest `keep`. */
  dailyAutoBackup(localDate: string, keep = 14): string | null {
    if (!this.dir) return null;
    const dir = path.join(this.backupsDir, 'auto');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `academy-${localDate}.sqlite`);
    if (fs.existsSync(file)) return null;
    const existing = autoBackupsOldestFirst(dir);
    fs.writeFileSync(file, this.db.export());
    // Order backups by when they were written, not by the date in the name: after the system
    // clock moves back, the file just written must count as the newest. Its mtime is set past
    // every existing backup so the order survives even when the clock went backwards.
    const newestMs = existing.reduce((m, f) => Math.max(m, fs.statSync(f).mtimeMs), 0);
    const stamp = Math.max(Date.now(), newestMs + 1000);
    fs.utimesSync(file, stamp / 1000, stamp / 1000);
    const files = autoBackupsOldestFirst(dir);
    for (const f of files.slice(0, Math.max(0, files.length - keep))) if (f !== file) fs.unlinkSync(f);
    return file;
  }

  /** Replace the whole database with another (validated) database's bytes. */
  replaceWith(bytes: Uint8Array): void {
    const next = new this.sql.Database(bytes);
    this.db.close();
    this.db = next;
    this.dirty = true;
    this.persistNow();
  }

  close(): void {
    this.flushNow();
    this.db.close();
  }
}
