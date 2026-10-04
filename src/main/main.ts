/**
 * Electron main process: one window, one instance, local data only.
 */
import { app, BrowserWindow, ipcMain, dialog, shell, Menu, session } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { FileLogger } from './logger';
import { boot, Booted } from './bootstrap';
import { dispatch } from './dispatch';
import { NewerDatabaseError, DatabaseOpenError } from './db/database';

const log = new FileLogger(path.join(app.getPath('userData'), 'logs'));
let booted: Booted | null = null;
let win: BrowserWindow | null = null;

process.on('uncaughtException', (e) => log.error('process', 'uncaught exception', e));
process.on('unhandledRejection', (e) => log.error('process', 'unhandled rejection', e));

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
  app.whenReady().then(start).catch((e) => {
    log.error('startup', 'fatal startup error', e);
    dialog.showErrorBox('Algebra C&C Learning Academy', 'The app could not start. Details were written to the log file.');
    app.quit();
  });
}

async function start(): Promise<void> {
  const dataDir = path.join(app.getPath('userData'), 'data');
  try {
    booted = await boot(dataDir, log, app.getVersion());
  } catch (e) {
    log.error('startup', 'database open failed', e);
    const msg =
      e instanceof NewerDatabaseError
        ? e.message
        : e instanceof DatabaseOpenError
          ? `${e.message}\n\nYour data folder is:\n${dataDir}`
          : 'The student data could not be opened. Details were written to the log file.';
    dialog.showErrorBox('Algebra C&C Learning Academy', msg);
    app.quit();
    return;
  }
  log.info('startup', `started v${app.getVersion()}${booted.ctx.recoveredFrom ? ` (recovered from ${booted.ctx.recoveredFrom})` : ''}`);

  // Nothing is ever loaded from the network.
  session.defaultSession.webRequest.onBeforeRequest((details, cb) => {
    const u = details.url;
    const allowed = u.startsWith('file://') || u.startsWith('devtools://') || u.startsWith('data:') || (process.env.VITE_DEV_SERVER_URL && u.startsWith(process.env.VITE_DEV_SERVER_URL)) || u.startsWith('ws://localhost');
    cb({ cancel: !allowed });
  });
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));

  ipcMain.handle('academy:call', async (_e, method: unknown, args: unknown) => {
    if (typeof method !== 'string' || !Array.isArray(args)) return { ok: false, error: 'Bad request', userFacing: false };
    return dispatch(booted!.api, log, method, args);
  });
  ipcMain.handle('academy:saveBackupFile', async (_e, parentPin: unknown) => {
    if (typeof parentPin !== 'string') return { ok: false, error: 'Bad request', userFacing: false };
    const r = await dispatch(booted!.api, log, 'exportBackup', [parentPin]);
    if (!r.ok) return r;
    const { fileName, data } = r.value as { fileName: string; data: string };
    const res = await dialog.showSaveDialog(win!, { title: 'Save backup', defaultPath: path.join(app.getPath('documents'), fileName), filters: [{ name: 'Academy backup', extensions: ['accbackup'] }] });
    if (res.canceled || !res.filePath) return { ok: true, value: { saved: false } };
    try {
      const tmp = res.filePath + '.tmp';
      fs.writeFileSync(tmp, data);
      fs.renameSync(tmp, res.filePath);
      // read it back and verify before telling the parent it worked
      const check = await dispatch(booted!.api, log, 'inspectBackup', [parentPin, fs.readFileSync(res.filePath, 'utf8')]);
      if (!check.ok || !(check.value as { ok: boolean }).ok) return { ok: false, error: 'The backup file could not be verified after saving. Try another location.', userFacing: true };
      return { ok: true, value: { saved: true, path: res.filePath } };
    } catch (e) {
      log.error('backup', 'writing backup failed', e);
      return { ok: false, error: 'The backup could not be written to that location.', userFacing: true };
    }
  });
  ipcMain.handle('academy:pickBackupFile', async () => {
    const res = await dialog.showOpenDialog(win!, { title: 'Choose a backup file', properties: ['openFile'], filters: [{ name: 'Academy backup', extensions: ['accbackup'] }] });
    if (res.canceled || !res.filePaths[0]) return { ok: true, value: null };
    try {
      const stat = fs.statSync(res.filePaths[0]);
      if (stat.size > 200 * 1024 * 1024) return { ok: false, error: 'That file is too large to be a backup.', userFacing: true };
      return { ok: true, value: { name: path.basename(res.filePaths[0]), data: fs.readFileSync(res.filePaths[0], 'utf8') } };
    } catch {
      return { ok: false, error: 'That file could not be read.', userFacing: true };
    }
  });
  ipcMain.handle('academy:openDataFolder', async () => {
    await shell.openPath(dataDir);
    return { ok: true, value: null };
  });
  ipcMain.handle('academy:print', async () => {
    win?.webContents.print({ silent: false, printBackground: true });
    return { ok: true, value: null };
  });

  Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}

function createWindow(): void {
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'Algebra C&C Learning Academy',
    backgroundColor: '#f7f8fc',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      devTools: !app.isPackaged,
    },
  });
  win.once('ready-to-show', () => win?.show());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://') && !(process.env.VITE_DEV_SERVER_URL && url.startsWith(process.env.VITE_DEV_SERVER_URL))) e.preventDefault();
  });
  win.webContents.on('render-process-gone', (_e, d) => {
    log.error('renderer', `renderer gone: ${d.reason}`);
    if (d.reason !== 'clean-exit') win?.reload();
  });
  if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL);
  else win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
}

app.on('window-all-closed', () => {
  try {
    booted?.ctx.db.close();
  } catch (e) {
    log.error('shutdown', 'final save failed', e);
  }
  app.quit();
});
app.on('before-quit', () => {
  try {
    booted?.ctx.db.flushNow();
  } catch (e) {
    log.error('shutdown', 'save on quit failed', e);
  }
});
