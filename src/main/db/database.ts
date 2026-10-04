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
import { MIGRATIONS, CURRENT_SCHEMA_VERSION, REQUIRED_TABLES } from './schema';
import type { Logger } from '../logger';

export type Row = Record<string, SqlValue>;
export type Params = SqlValue[] | Record<string, SqlValue>;

export class NewerDatabaseError extends Error {
  constructor(public readonly found: number) {
    super(`This data was saved by a newer version of the app (schema ${found}). Please update the app.`);
  }
}
export class DatabaseOpenError extends Error {}

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

export class AppDatabase {
  private dirty = false;
  private timer: NodeJS.Timeout | null = null;
  private inTx = false;
  persistDelayMs = 300;
  lastPersistError: Error | null = null;

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
    const autoDir = path.join(dir, 'backups', 'auto');
    if (fs.existsSync(autoDir)) {
      for (const f of fs.readdirSync(autoDir).filter((x) => x.endsWith('.sqlite')).sort().reverse()) candidates.push({ file: path.join(autoDir, f), tag: 'auto-backup' });
    }
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
      if (check.version! > CURRENT_SCHEMA_VERSION) throw new NewerDatabaseError(check.version!);
      const db = new AppDatabase(sql, new sql.Database(bytes), dir, log, now);
      let migratedFrom: number | undefined;
      if (check.version! < CURRENT_SCHEMA_VERSION) {
        db.safetyBackup(`pre-migration-v${check.version}`);
        migratedFrom = check.version;
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
    throw new DatabaseOpenError('No readable copy of the student database was found. Restore from a backup file in Parent Mode.');
  }

  /** Open an in-memory database from bytes (used to inspect backups). */
  static async fromBytes(bytes: Uint8Array, log: Logger): Promise<AppDatabase> {
    const sql = await loadSqlJs();
    return new AppDatabase(sql, new sql.Database(bytes), '', log, Date.now);
  }

  private migrate(from: number, appVersion: string): void {
    for (const m of MIGRATIONS.filter((x) => x.version > from)) {
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
        this.db.exec('ROLLBACK');
        throw e;
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

  private schedulePersist(): void {
    if (!this.dir) return;
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.flushNow();
    }, this.persistDelayMs);
  }

  exportBytes(): Uint8Array {
    return this.db.export();
  }

  /** Write the database to disk now (atomic). */
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
      this.lastPersistError = null;
    } catch (e) {
      this.lastPersistError = e as Error;
      this.log.error('db', 'save failed: ' + (e as Error).message);
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
    fs.writeFileSync(file, this.db.export());
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sqlite')).sort();
    for (const f of files.slice(0, Math.max(0, files.length - keep))) fs.unlinkSync(path.join(dir, f));
    return file;
  }

  /** Replace the whole database with another (validated) database's bytes. */
  replaceWith(bytes: Uint8Array): void {
    const next = new this.sql.Database(bytes);
    this.db.close();
    this.db = next;
    this.dirty = true;
    this.flushNow();
  }

  close(): void {
    this.flushNow();
    this.db.close();
  }
}
