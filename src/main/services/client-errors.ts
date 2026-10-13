/**
 * Renderer errors (window.onerror, unhandled promise rejections, the React error boundary) are
 * forwarded here and written to the local log, so a crash on a student's PC can be diagnosed.
 * Only the error's message and code locations are kept: quoted text (which could be a student's
 * answer or name) and long digit runs (a PIN) are removed, everything is truncated, and the number
 * of reports per session is capped so a render loop cannot flood the log.
 */
import type { ServiceContext } from './context';

export const CLIENT_ERROR_KINDS = ['error', 'unhandledrejection', 'boundary'] as const;
export const MAX_CLIENT_MESSAGE = 300;
export const MAX_CLIENT_DETAIL = 1500;
export const MAX_CLIENT_FRAMES = 10;
export const MAX_CLIENT_REPORTS = 50;

const reported = new WeakMap<ServiceContext, number>();

/** Remove anything that could be student data from an error message. */
export function scrubMessage(raw: unknown): string {
  let s = typeof raw === 'string' ? raw : '';
  s = s.replace(/[\u0000-\u001f\u007f]+/g, ' ');
  // quoted text: "…", '…', `…`, “…”
  s = s.replace(/"[^"]*"|'[^']*'|`[^`]*`|“[^”]*”/g, '"…"');
  // a PIN or other long number
  s = s.replace(/\d{4,}/g, '#');
  s = s.replace(/\s+/g, ' ').trim();
  return s.length > MAX_CLIENT_MESSAGE ? s.slice(0, MAX_CLIENT_MESSAGE - 1) + '…' : s;
}

/**
 * Keep only stack / component-stack frames ("at Name (file:line:col)"), with each URL cut to the
 * file name. Any other line (which could carry a message with student text) is dropped.
 */
export function scrubFrames(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const frames: string[] = [];
  for (const line of raw.slice(0, 20_000).split('\n')) {
    const m = /^\s*at\s+([\w$.<>\[\] ]{0,80}?)\s*\(?((?:[a-z-]+:\/\/[^\s)]*\/)?([^\s/()]+?)(?::(\d+))?(?::(\d+))?)?\)?\s*$/i.exec(line);
    if (!m) continue;
    const name = (m[1] || '').trim() || '<anonymous>';
    const file = m[3] ? `${m[3]}${m[4] ? `:${m[4]}` : ''}${m[5] ? `:${m[5]}` : ''}` : '';
    frames.push(file ? `${name} (${file})` : name);
    if (frames.length >= MAX_CLIENT_FRAMES) break;
  }
  const s = frames.join(' < ').replace(/[^\w$.<>()\[\]:\- ]/g, '');
  return s.length > MAX_CLIENT_DETAIL ? s.slice(0, MAX_CLIENT_DETAIL - 1) + '…' : s;
}

export function reportClientError(ctx: ServiceContext, kind: string, message: string, detail?: string | null): { logged: boolean } {
  const n = reported.get(ctx) ?? 0;
  if (n >= MAX_CLIENT_REPORTS) return { logged: false };
  reported.set(ctx, n + 1);
  const k = (CLIENT_ERROR_KINDS as readonly string[]).includes(kind) ? kind : 'other';
  const frames = scrubFrames(detail);
  ctx.log.error('renderer', `${k}: ${scrubMessage(message) || '(no message)'}${frames ? ` | at ${frames}` : ''}${n + 1 === MAX_CLIENT_REPORTS ? ' | further renderer errors are not logged this session' : ''}`);
  return { logged: true };
}
