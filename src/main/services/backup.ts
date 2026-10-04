/**
 * Backup and restore (spec §29). A backup is a single .accbackup file: a JSON envelope with
 * a SHA-256 checksum around the complete SQLite database. Nothing is changed during a
 * restore until the file has passed every check, and a safety backup is written first.
 */
import crypto from 'node:crypto';
import type { BackupInfo } from '../../shared/api';
import { AppDatabase, isValidSqlite, loadSqlJs, NewerDatabaseError } from '../db/database';
import { CURRENT_SCHEMA_VERSION } from '../db/schema';
import { ServiceContext, today } from './context';
import { logActivity } from './records';

export const BACKUP_FORMAT = 'algebra-cc-academy-backup';
export const BACKUP_FORMAT_VERSION = 1;
const MAX_BACKUP_CHARS = 200 * 1024 * 1024;

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

export function exportBackup(ctx: ServiceContext): { fileName: string; data: string } {
  ctx.db.flushNow();
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
  if (v.version! > CURRENT_SCHEMA_VERSION) return fail('This backup was made by a newer version of the app. Update the app, then restore.');
  const db = await AppDatabase.fromBytes(bytes, ctx.log);
  try {
    return {
      info: { ok: true, createdAt: env.createdAt, appVersion: env.appVersion, schemaVersion: v.version, profiles: profileNames(db) },
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
  const c = await check(ctx, data);
  if (!c.info.ok || !c.bytes) return { ok: false, message: c.info.reason ?? 'The backup could not be used.' };
  // bring older backups up to date in memory, then re-validate what will be written
  const incoming = await AppDatabase.fromBytes(c.bytes, ctx.log);
  let finalBytes: Uint8Array;
  try {
    incoming.upgradeInMemory(ctx.appVersion);
    finalBytes = incoming.exportBytes();
  } catch (e) {
    if (e instanceof NewerDatabaseError) return { ok: false, message: e.message };
    throw e;
  } finally {
    incoming.close();
  }
  const sql = await loadSqlJs();
  if (!isValidSqlite(sql, finalBytes).ok) return { ok: false, message: 'The backup could not be prepared for this version of the app.' };
  const safety = ctx.db.safetyBackup('before-restore');
  ctx.db.replaceWith(finalBytes);
  ctx.log.info('backup', 'restored a backup; previous data saved as a safety backup');
  const first = ctx.db.get<{ id: number }>('SELECT id FROM profiles ORDER BY id LIMIT 1');
  if (first) logActivity(ctx, first.id, 'restore', {});
  return { ok: true, message: `Restored ${c.info.profiles?.length ?? 0} student profile(s). Your previous data was saved as a safety backup first.`, safetyBackup: safety };
}
