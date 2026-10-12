import type { AppDatabase } from '../db/database';
import type { Logger } from '../logger';
import { localDate } from '../../core/engine/dates';

export interface ServiceContext {
  db: AppDatabase;
  log: Logger;
  now(): number;
  /** minutes, as returned by Date#getTimezoneOffset (override in tests) */
  tzOffset(at?: number): number;
  appVersion: string;
  dataDir: string;
  recoveredFrom?: string;
  migratedFrom?: number;
}

export function today(ctx: ServiceContext, at = ctx.now()): string {
  return localDate(at, ctx.tzOffset(at));
}

/**
 * Save immediately (e.g. right after a quiz, assessment or day is finished). Never throws:
 * if the disk write fails the data stays in memory, saving is retried with backoff, and the
 * UI is told through persistWarning(). Returns true when the data is on disk.
 */
export function saveNow(ctx: ServiceContext): boolean {
  return ctx.db.persistNow();
}

/** A friendly warning while the latest changes are not on disk (undefined when all is saved). */
export function persistWarning(ctx: ServiceContext): string | undefined {
  const e = ctx.db.lastPersistError as (Error & { code?: string }) | null;
  if (!e) return undefined;
  return `Your latest progress could not be saved to disk${e.code ? ` (${e.code})` : ''}. Keep the app open: your work is kept and saving is retried automatically. Check that the disk is not full and the data folder is not blocked.`;
}

/** Key under which createApi() exposes persistWarning to dispatch() (not an API method). */
export const PERSIST_WARNING = Symbol.for('algebra-cc.persistWarning');

/** Errors whose message is safe and useful to show to the user. */
export class UserFacingError extends Error {
  readonly userFacing = true;
}
