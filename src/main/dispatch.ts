/** Runs one API call and turns errors into a safe result for the UI. */
import type { AcademyApi } from '../shared/api';
import type { Logger } from './logger';
import { validateArgs } from './ipc-schema';

export type CallResult = { ok: true; value: unknown } | { ok: false; error: string; userFacing: boolean };

export async function dispatch(api: AcademyApi, log: Logger, method: string, args: unknown[]): Promise<CallResult> {
  const bad = validateArgs(method, args);
  if (bad) {
    log.warn('ipc', `rejected call: ${bad}`);
    return { ok: false, error: 'The app received an unexpected request.', userFacing: false };
  }
  try {
    const fn = (api as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>)[method];
    return { ok: true, value: await fn(...args) };
  } catch (e) {
    const err = e as Error & { userFacing?: boolean; friendly?: string };
    if (err.userFacing) return { ok: false, error: err.message, userFacing: true };
    if (err.friendly) return { ok: false, error: err.friendly, userFacing: true };
    log.error('ipc', `${method} failed`, e);
    return { ok: false, error: 'Something went wrong, but your work is saved. Please try again.', userFacing: false };
  }
}
