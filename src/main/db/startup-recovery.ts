/**
 * What the app can do at startup when no copy of the student database can be read
 * (AppDatabase.open throws NoReadableDatabaseError). Parent Mode cannot be reached then, so the
 * startup error itself offers:
 *   - Restore from a backup file: the file gets every check a normal restore makes; only a file
 *     that passes is written as the new data.
 *   - Start fresh: the app starts with empty progress.
 *   - Quit.
 * Either way the unreadable files are never deleted: they are moved, unchanged, into a folder
 * `unreadable-<time>` inside the data folder, so they can still be sent for diagnosis.
 *
 * Plain functions over a data folder, no Electron, so they are unit-tested directly.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Logger } from '../logger';
import { prepareBackup } from '../services/backup';

export const MAIN_DB_FILE = 'academy.sqlite';
/** largest backup file read at startup (the same limit as the Parent Mode file picker) */
export const MAX_STARTUP_BACKUP_BYTES = 200 * 1024 * 1024;

export const STARTUP_RECOVERY = {
  title: 'Algebra C&C Learning Academy',
  message: 'The student data could not be opened.',
  detail:
    'No readable copy of the student database was found (the current save, the previous save and the daily backups were all checked).\n\n' +
    'You can restore from a backup file (.accbackup), or start fresh with empty progress. Either way the unreadable files are kept, unchanged, in a folder inside the data folder.',
  buttons: ['Restore from a backup file…', 'Start fresh', 'Quit'] as const,
};
export type StartupChoice = 'restore' | 'fresh' | 'quit';
/** Map a message-box button index to the choice (Escape / closing the box means Quit). */
export function startupChoiceFor(buttonIndex: number): StartupChoice {
  return buttonIndex === 0 ? 'restore' : buttonIndex === 1 ? 'fresh' : 'quit';
}

/** Every copy AppDatabase.open() tries, that exists: the main file, an interrupted save, the previous save, daily backups. */
export function dataCopies(dataDir: string): string[] {
  const main = path.join(dataDir, MAIN_DB_FILE);
  const out = [main, main + '.tmp', main + '.prev'].filter((f) => fs.existsSync(f));
  const auto = path.join(dataDir, 'backups', 'auto');
  if (fs.existsSync(auto)) for (const f of fs.readdirSync(auto).sort()) if (f.endsWith('.sqlite')) out.push(path.join(auto, f));
  return out;
}

/**
 * Move every copy the app tries at startup into `<dataDir>/unreadable-<time>/` (daily backups into
 * its `auto` subfolder). Files are renamed, never deleted or changed. Returns the folder, or null
 * when there was nothing to move.
 */
export function keepUnreadableFiles(dataDir: string, now: number): string | null {
  const files = dataCopies(dataDir);
  if (!files.length) return null;
  const stamp = new Date(now).toISOString().replace(/[:.]/g, '-');
  let dir = path.join(dataDir, `unreadable-${stamp}`);
  for (let i = 2; fs.existsSync(dir); i++) dir = path.join(dataDir, `unreadable-${stamp}-${i}`);
  fs.mkdirSync(path.join(dir, 'auto'), { recursive: true });
  const autoDir = path.join(dataDir, 'backups', 'auto');
  for (const f of files) {
    const dest = path.dirname(f) === autoDir ? path.join(dir, 'auto', path.basename(f)) : path.join(dir, path.basename(f));
    fs.renameSync(f, dest);
  }
  return dir;
}

/** "Start fresh": keep the unreadable files in a folder; the next open creates empty data. */
export function startFresh(dataDir: string, log: Logger, now: number): { keptIn: string | null } {
  const keptIn = keepUnreadableFiles(dataDir, now);
  log.warn('startup', `started fresh after unreadable data; unreadable files kept in ${keptIn ? path.basename(keptIn) : '(none)'}`);
  return { keptIn };
}

/**
 * "Restore from a backup file": validate it exactly as a Parent Mode restore does (and bring an
 * older one up to this app's schema). Only if it passes are the unreadable files moved aside and
 * the backup written (atomically) as the new data. A file that fails changes nothing on disk.
 */
export async function restoreAtStartup(
  dataDir: string,
  data: string,
  log: Logger,
  appVersion: string,
  now: number,
): Promise<{ ok: true; keptIn: string | null; profiles: string[] } | { ok: false; message: string }> {
  const p = await prepareBackup(data, log, appVersion);
  if (!p.ok) return { ok: false, message: p.message };
  const keptIn = keepUnreadableFiles(dataDir, now);
  fs.mkdirSync(dataDir, { recursive: true });
  const main = path.join(dataDir, MAIN_DB_FILE);
  const tmp = main + '.tmp';
  const fd = fs.openSync(tmp, 'w');
  try {
    fs.writeSync(fd, p.bytes);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmp, main);
  log.warn('startup', `restored a backup file at startup; unreadable files kept in ${keptIn ? path.basename(keptIn) : '(none)'}`);
  return { ok: true, keptIn, profiles: p.info.profiles ?? [] };
}
