import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AppDatabase, NewerDatabaseError, DatabaseOpenError } from '../../src/main/db/database';
import { MemoryLogger } from '../../src/main/logger';
import { CURRENT_SCHEMA_VERSION } from '../../src/main/db/schema';

const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'acc-db-'));

describe('AppDatabase', () => {
  it('creates a new database with the current schema and persists it', async () => {
    const dir = tmpDir();
    const { db, created } = await AppDatabase.open(dir, new MemoryLogger());
    expect(created).toBe(true);
    expect(db.schemaVersion()).toBe(CURRENT_SCHEMA_VERSION);
    db.insert("INSERT INTO profiles(display_name, created_at) VALUES ('Sam', 1)");
    db.flushNow();
    db.close();
    const again = await AppDatabase.open(dir, new MemoryLogger());
    expect(again.created).toBe(false);
    expect(again.db.all('SELECT display_name FROM profiles')).toEqual([{ display_name: 'Sam' }]);
  });

  it('rolls back a failed transaction completely', async () => {
    const { db } = await AppDatabase.open(tmpDir(), new MemoryLogger());
    expect(() =>
      db.transaction(() => {
        db.insert("INSERT INTO profiles(display_name, created_at) VALUES ('A', 1)");
        throw new Error('boom');
      }),
    ).toThrow('boom');
    expect(db.all('SELECT * FROM profiles')).toEqual([]);
  });

  it('recovers from a corrupted main file using the previous copy', async () => {
    const dir = tmpDir();
    const { db } = await AppDatabase.open(dir, new MemoryLogger());
    db.insert("INSERT INTO profiles(display_name, created_at) VALUES ('Kept', 1)");
    db.flushNow();
    db.insert("INSERT INTO profiles(display_name, created_at) VALUES ('Second', 2)");
    db.flushNow(); // now .prev has 'Kept' only, main has both
    db.close();
    fs.writeFileSync(path.join(dir, 'academy.sqlite'), 'garbage that is not sqlite');
    const log = new MemoryLogger();
    const r = await AppDatabase.open(dir, log);
    expect(r.recoveredFrom).toBe('prev');
    expect(r.db.all('SELECT display_name FROM profiles').map((x) => x.display_name)).toEqual(['Kept']);
    expect(fs.readdirSync(dir).some((f) => f.includes('.corrupt-'))).toBe(true);
  });

  it('recovers when a crash happened between the two renames (only .prev and .tmp exist)', async () => {
    const dir = tmpDir();
    const { db } = await AppDatabase.open(dir, new MemoryLogger());
    db.insert("INSERT INTO profiles(display_name, created_at) VALUES ('X', 1)");
    db.flushNow();
    db.close();
    const main = path.join(dir, 'academy.sqlite');
    fs.copyFileSync(main, main + '.tmp');
    fs.renameSync(main, main + '.prev');
    const r = await AppDatabase.open(dir, new MemoryLogger());
    expect(r.db.all('SELECT display_name FROM profiles')).toEqual([{ display_name: 'X' }]);
  });

  it('refuses to open data from a newer app version without changing it', async () => {
    const dir = tmpDir();
    const { db } = await AppDatabase.open(dir, new MemoryLogger());
    db.setMeta('schema_version', String(CURRENT_SCHEMA_VERSION + 5));
    db.close();
    const before = fs.readFileSync(path.join(dir, 'academy.sqlite'));
    await expect(AppDatabase.open(dir, new MemoryLogger())).rejects.toBeInstanceOf(NewerDatabaseError);
    expect(fs.readFileSync(path.join(dir, 'academy.sqlite')).equals(before)).toBe(true);
  });

  it('errors (does not silently start over) when every copy is unreadable', async () => {
    const dir = tmpDir();
    fs.writeFileSync(path.join(dir, 'academy.sqlite'), 'bad');
    await expect(AppDatabase.open(dir, new MemoryLogger())).rejects.toBeInstanceOf(DatabaseOpenError);
  });

  it('keeps one auto backup per day, newest 14', async () => {
    const { db, } = await AppDatabase.open(tmpDir(), new MemoryLogger());
    for (let d = 1; d <= 20; d++) db.dailyAutoBackup(`2026-09-${String(d).padStart(2, '0')}`);
    expect(db.dailyAutoBackup('2026-09-20')).toBeNull();
    const files = fs.readdirSync(path.join(db.backupsDir, 'auto'));
    expect(files.length).toBe(14);
    expect(files.sort()[0]).toBe('academy-2026-09-07.sqlite');
  });
});
