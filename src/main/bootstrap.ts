/**
 * Opens the student database and builds the service API. Shared by the Electron main
 * process and the test harness so both run exactly the same code.
 */
import { AppDatabase } from './db/database';
import type { Logger } from './logger';
import type { ServiceContext } from './services/context';
import { createApi } from './services/api';
import type { AcademyApi } from '../shared/api';
import { localDate } from '../core/engine/dates';

export interface Booted {
  ctx: ServiceContext;
  api: AcademyApi;
}

export async function boot(dataDir: string, log: Logger, appVersion: string, now: () => number = Date.now): Promise<Booted> {
  const opened = await AppDatabase.open(dataDir, log, now, appVersion);
  const ctx: ServiceContext = {
    db: opened.db,
    log,
    now,
    tzOffset: (at?: number) => new Date(at ?? now()).getTimezoneOffset(),
    appVersion,
    dataDir,
    recoveredFrom: opened.recoveredFrom,
    migratedFrom: opened.migratedFrom,
  };
  try {
    const made = opened.db.dailyAutoBackup(localDate(now()));
    if (made) log.info('backup', 'daily automatic backup written');
  } catch (e) {
    log.error('backup', 'daily automatic backup failed', e);
  }
  return { ctx, api: createApi(ctx) };
}
