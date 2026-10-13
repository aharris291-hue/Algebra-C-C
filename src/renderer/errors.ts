/**
 * Forward renderer errors to the main-process log (window errors, unhandled promise rejections and
 * errors caught by the error boundary). Only the error's message and stack are sent; the main
 * process scrubs and truncates them (services/client-errors.ts). Reporting never throws.
 */
import { api } from './api';

const MAX_SEND = 4000;
let lastKey = '';
let lastAt = 0;

export function reportError(kind: 'error' | 'unhandledrejection' | 'boundary', err: unknown, componentStack?: string | null): void {
  try {
    const e = err instanceof Error ? err : null;
    const message = (e ? `${e.name}: ${e.message}` : typeof err === 'string' ? err : 'Non-error value thrown').slice(0, MAX_SEND);
    const detail = `${e?.stack ?? ''}\n${componentStack ?? ''}`.slice(0, MAX_SEND);
    // the same error repeating (e.g. on every render) is reported once every few seconds
    const key = `${kind}|${message}`;
    const now = Date.now();
    if (key === lastKey && now - lastAt < 5_000) return;
    lastKey = key;
    lastAt = now;
    api.reportClientError(kind, message, detail).catch(() => undefined);
  } catch {
    /* reporting must never cause another error */
  }
}

let installed = false;
export function installGlobalErrorReporting(): void {
  if (installed) return;
  installed = true;
  window.addEventListener('error', (ev) => reportError('error', ev.error ?? ev.message));
  window.addEventListener('unhandledrejection', (ev) => reportError('unhandledrejection', ev.reason));
}
