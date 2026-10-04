/**
 * Client for the app API. In the desktop app calls go through the preload bridge to the
 * main process; in the test harness (served over http://localhost) they go to the harness
 * server. Either way the same services answer.
 */
import type { AcademyApi } from '../shared/api';
import { API_METHODS } from '../shared/api';

type CallResult = { ok: true; value: unknown } | { ok: false; error: string; userFacing: boolean };

interface Bridge {
  call(method: string, args: unknown[]): Promise<CallResult>;
  saveBackupFile(pin: string): Promise<CallResult>;
  pickBackupFile(): Promise<CallResult>;
  openDataFolder(): Promise<CallResult>;
  print(): Promise<CallResult>;
}

declare global {
  interface Window {
    academyBridge?: Bridge;
  }
}

export class ApiError extends Error {
  constructor(message: string, readonly userFacing: boolean) {
    super(message);
  }
}

const bridge = window.academyBridge;
export const isDesktop = !!bridge;

async function httpCall(method: string, args: unknown[]): Promise<CallResult> {
  const r = await fetch(`/api/${method}`, { method: 'POST', body: JSON.stringify(args) });
  return r.json();
}

function unwrap(r: CallResult): unknown {
  if (!r.ok) throw new ApiError(r.error, r.userFacing);
  return r.value;
}

async function call(method: string, args: unknown[]): Promise<unknown> {
  if (bridge) return unwrap(await bridge.call(method, args));
  if (location.protocol.startsWith('http')) return unwrap(await httpCall(method, args));
  throw new ApiError('The app could not connect to its data.', true);
}

export const api = Object.fromEntries(API_METHODS.map((m) => [m, (...args: unknown[]) => call(m, args)])) as unknown as AcademyApi;

/** Save a backup to a file the parent chooses. */
export async function saveBackupFile(pin: string): Promise<{ saved: boolean; path?: string }> {
  if (bridge) return unwrap(await bridge.saveBackupFile(pin)) as { saved: boolean; path?: string };
  const { fileName, data } = await api.exportBackup(pin);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
  return { saved: true, path: fileName };
}

/** Let the parent choose a backup file; resolves to its contents or null if cancelled. */
export async function pickBackupFile(): Promise<{ name: string; data: string } | null> {
  if (bridge) return unwrap(await bridge.pickBackupFile()) as { name: string; data: string } | null;
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.accbackup';
    input.onchange = async () => {
      const f = input.files?.[0];
      resolve(f ? { name: f.name, data: await f.text() } : null);
    };
    input.click();
  });
}

export async function openDataFolder(): Promise<void> {
  if (bridge) unwrap(await bridge.openDataFolder());
}

export async function printPage(): Promise<void> {
  if (bridge) unwrap(await bridge.print());
  else window.print();
}

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  return 'Something went wrong, but your work is saved. Please try again.';
}
