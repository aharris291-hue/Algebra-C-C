/**
 * Backup and restore (spec §29). A backup is a single .accbackup file: a JSON envelope with
 * a SHA-256 checksum around the complete SQLite database. Nothing is changed during a
 * restore until the file has passed every check, and a safety backup is written first.
 */
import crypto from 'node:crypto';
import type { BackupInfo } from '../../shared/api';
import { AppDatabase, isValidSqlite, loadSqlJs, NewerDatabaseError } from '../db/database';
import { currentSchemaVersion } from '../db/schema';
import { ServiceContext, today, saveNow } from './context';
import { logActivity } from './records';
import type { Logger } from '../logger';

export const BACKUP_FORMAT = 'algebra-cc-academy-backup';
export const BACKUP_FORMAT_VERSION = 1;
const MAX_BACKUP_CHARS = 200 * 1024 * 1024;
const NOT_VALID = 'This is not a valid Algebra C&C Academy backup (its data does not match this app). Your current data was not changed.';

interface Envelope {
  format: string;
  formatVersion: number;
  appVersion: string;
  schemaVersion: number;
  createdAt: number;
  profiles: string[];
  sha256: string;
  database: string;
}

function profileNames(db: AppDatabase): string[] {
  return db.all<{ display_name: string }>('SELECT display_name FROM profiles WHERE archived = 0 ORDER BY created_at').map((r) => r.display_name);
}

const lastAutoBackupDate = new WeakMap<ServiceContext, string>();

/**
 * Write today's automatic backup if it has not been written yet. Cheap to call often: it only
 * touches the disk when the local date changes. Never throws (a failure is logged).
 */
export function ensureDailyAutoBackup(ctx: ServiceContext): void {
  let d: string;
  try {
    d = today(ctx);
  } catch {
    return;
  }
  if (lastAutoBackupDate.get(ctx) === d) return;
  // remember the date first so a failing disk is tried once per day (and at startup), not on every call
  lastAutoBackupDate.set(ctx, d);
  try {
    const made = ctx.db.dailyAutoBackup(d);
    if (made) ctx.log.info('backup', 'daily automatic backup written');
  } catch (e) {
    ctx.log.error('backup', 'daily automatic backup failed', e);
  }
}

export function exportBackup(ctx: ServiceContext): { fileName: string; data: string } {
  saveNow(ctx);
  const bytes = ctx.db.exportBytes();
  const env: Envelope = {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    appVersion: ctx.appVersion,
    schemaVersion: ctx.db.schemaVersion(),
    createdAt: ctx.now(),
    profiles: profileNames(ctx.db),
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    database: Buffer.from(bytes).toString('base64'),
  };
  return { fileName: `AlgebraCC-backup-${today(ctx)}.accbackup`, data: JSON.stringify(env) };
}

interface Checked {
  info: BackupInfo;
  bytes?: Uint8Array;
}

async function check(ctx: ServiceContext, data: string): Promise<Checked> {
  return checkBackupData(data, ctx.log);
}

/**
 * Every check a restore makes before anything is changed (format, checksum, SQLite integrity,
 * tables, schema version, this app's columns). Needs no open database, so it is also used to
 * restore at startup when no copy of the student data can be read.
 */
export async function checkBackupData(data: string, log: Logger): Promise<Checked> {
  const fail = (reason: string): Checked => ({ info: { ok: false, reason } });
  if (typeof data !== 'string' || data.length === 0) return fail('The file is empty.');
  if (data.length > MAX_BACKUP_CHARS) return fail('The file is too large to be a backup from this app.');
  let env: Envelope;
  try {
    env = JSON.parse(data);
  } catch {
    return fail('This is not an Algebra C&C Academy backup file (it could not be read).');
  }
  if (!env || env.format !== BACKUP_FORMAT) return fail('This is not an Algebra C&C Academy backup file.');
  if (env.formatVersion > BACKUP_FORMAT_VERSION) return fail('This backup was made by a newer version of the app. Update the app, then restore.');
  if (typeof env.database !== 'string' || typeof env.sha256 !== 'string') return fail('The backup file is incomplete.');
  const bytes = new Uint8Array(Buffer.from(env.database, 'base64'));
  const sum = crypto.createHash('sha256').update(bytes).digest('hex');
  if (sum !== env.sha256) return fail('The backup file is damaged (its checksum does not match). Try another backup.');
  const sql = await loadSqlJs();
  const v = isValidSqlite(sql, bytes);
  if (!v.ok) return fail(`The backup's data failed its integrity check (${v.reason}).`);
  if (v.version! > currentSchemaVersion()) return fail('This backup was made by a newer version of the app. Update the app, then restore.');
  const db = await AppDatabase.fromBytes(bytes, log);
  try {
    let names: string[];
    try {
      // also proves the file has this app's columns, not just its table names
      names = profileNames(db);
    } catch {
      return fail(NOT_VALID);
    }
    return {
      info: { ok: true, createdAt: env.createdAt, appVersion: env.appVersion, schemaVersion: v.version, profiles: names },
      bytes,
    };
  } finally {
    db.close();
  }
}

export async function inspectBackup(ctx: ServiceContext, data: string): Promise<BackupInfo> {
  return (await check(ctx, data)).info;
}

export async function restoreBackup(ctx: ServiceContext, data: string): Promise<{ ok: boolean; message: string; safetyBackup?: string }> {
  const p = await prepareBackup(data, ctx.log, ctx.appVersion);
  if (!p.ok) return { ok: false, message: p.message };
  const finalBytes = p.bytes;
  const safety = ctx.db.safetyBackup('before-restore');
  ctx.db.replaceWith(finalBytes);
  ctx.log.info('backup', 'restored a backup; previous data saved as a safety backup');
  const first = ctx.db.get<{ id: number }>('SELECT id FROM profiles ORDER BY id LIMIT 1');
  if (first) logActivity(ctx, first.id, 'restore', {});
  return { ok: true, message: `Restored ${p.info.profiles?.length ?? 0} student profile(s). Your previous data was saved as a safety backup first.`, safetyBackup: safety };
}

/**
 * Validate a backup file's contents and bring its database up to this app's schema, in memory.
 * Returns the bytes to write, or a friendly reason. Nothing on disk is touched.
 */
export async function prepareBackup(data: string, log: Logger, appVersion: string): Promise<{ ok: true; info: BackupInfo; bytes: Uint8Array } | { ok: false; message: string }> {
  const c = await checkBackupData(data, log);
  if (!c.info.ok || !c.bytes) return { ok: false, message: c.info.reason ?? 'The backup could not be used.' };
  // bring older backups up to date in memory, then re-validate what will be written
  const incoming = await AppDatabase.fromBytes(c.bytes, log);
  let finalBytes: Uint8Array;
  try {
    incoming.upgradeInMemory(appVersion);
    finalBytes = incoming.exportBytes();
  } catch (e) {
    if (e instanceof NewerDatabaseError) return { ok: false, message: e.message };
    // a file whose tables do not match any version of this app (e.g. hand-made or damaged)
    log.warn('backup', 'backup could not be upgraded: ' + (e as Error).message);
    return { ok: false, message: NOT_VALID };
  } finally {
    incoming.close();
  }
  const sql = await loadSqlJs();
  if (!isValidSqlite(sql, finalBytes).ok) return { ok: false, message: 'The backup could not be prepared for this version of the app.' };
  return { ok: true, info: c.info, bytes: finalBytes };
}
