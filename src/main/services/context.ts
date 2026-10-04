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

/** Errors whose message is safe and useful to show to the user. */
export class UserFacingError extends Error {
  readonly userFacing = true;
}
