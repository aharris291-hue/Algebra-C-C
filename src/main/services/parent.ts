/** Parent PIN (spec §24, §26): PBKDF2-SHA256, lockout after repeated failures, recovery code reset. */
import crypto from 'node:crypto';
import { ServiceContext, UserFacingError } from './context';

const ITERATIONS = 150_000;
const MAX_FAILS = 5;

function hash(secret: string, salt: string, iterations = ITERATIONS): string {
  return crypto.pbkdf2Sync(secret, salt, iterations, 32, 'sha256').toString('hex');
}
function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a, 'hex');
  const y = Buffer.from(b, 'hex');
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function validatePinFormat(pin: string): string | null {
  if (!/^\d{4,8}$/.test(pin)) return 'The PIN must be 4 to 8 digits.';
  if (/^(\d)\1+$/.test(pin)) return 'Choose a PIN that is not one digit repeated.';
  if ('0123456789'.includes(pin) || '9876543210'.includes(pin)) return 'Choose a PIN that is not a simple sequence.';
  return null;
}

/** 12 characters from an unambiguous alphabet, shown as XXXX-XXXX-XXXX. */
export function makeRecoveryCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(12);
  const chars = [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
  return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}
const normCode = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '');

interface ParentRow {
  pin_hash: string;
  pin_salt: string;
  pin_iterations: number;
  recovery_hash: string;
  recovery_salt: string;
  failed_attempts: number;
  locked_until: number;
}

export function hasParent(ctx: ServiceContext): boolean {
  return !!ctx.db.get('SELECT id FROM parent WHERE id = 1');
}

export function setupParent(ctx: ServiceContext, pin: string): { recoveryCode: string } {
  if (hasParent(ctx)) throw new UserFacingError('A Parent PIN already exists. Use Change PIN in Parent Mode.');
  const err = validatePinFormat(pin);
  if (err) throw new UserFacingError(err);
  const salt = crypto.randomBytes(16).toString('hex');
  const code = makeRecoveryCode();
  const rsalt = crypto.randomBytes(16).toString('hex');
  ctx.db.run('INSERT INTO parent(id, pin_hash, pin_salt, pin_iterations, recovery_hash, recovery_salt, created_at, updated_at) VALUES (1, ?, ?, ?, ?, ?, ?, ?)', [
    hash(pin, salt),
    salt,
    ITERATIONS,
    hash(normCode(code), rsalt),
    rsalt,
    ctx.now(),
    ctx.now(),
  ]);
  ctx.db.flushNow();
  ctx.log.info('parent', 'parent PIN created');
  return { recoveryCode: code };
}

export function verifyPin(ctx: ServiceContext, pin: string): { ok: boolean; lockedForSeconds?: number; attemptsLeft?: number } {
  const row = ctx.db.get<ParentRow>('SELECT * FROM parent WHERE id = 1');
  if (!row) return { ok: false };
  const now = ctx.now();
  if (row.locked_until > now) return { ok: false, lockedForSeconds: Math.ceil((row.locked_until - now) / 1000) };
  if (typeof pin === 'string' && /^\d{4,8}$/.test(pin) && safeEqual(hash(pin, row.pin_salt, row.pin_iterations), row.pin_hash)) {
    if (row.failed_attempts) ctx.db.run('UPDATE parent SET failed_attempts = 0, locked_until = 0 WHERE id = 1');
    return { ok: true };
  }
  const fails = row.failed_attempts + 1;
  let lockedUntil = 0;
  if (fails >= MAX_FAILS) lockedUntil = now + 60_000 * Math.pow(2, Math.min(5, fails - MAX_FAILS));
  ctx.db.run('UPDATE parent SET failed_attempts = ?, locked_until = ? WHERE id = 1', [fails, lockedUntil]);
  ctx.log.warn('parent', `failed PIN attempt (${fails})`);
  return lockedUntil ? { ok: false, lockedForSeconds: Math.ceil((lockedUntil - now) / 1000) } : { ok: false, attemptsLeft: MAX_FAILS - fails };
}

/** Throws unless the PIN is correct. Used to guard every Parent Mode operation. */
export function requireParent(ctx: ServiceContext, pin: string): void {
  const r = verifyPin(ctx, pin);
  if (!r.ok) throw new UserFacingError(r.lockedForSeconds ? `Parent Mode is locked for ${r.lockedForSeconds} seconds after too many tries.` : 'That Parent PIN is not correct.');
}

export function changePin(ctx: ServiceContext, current: string, next: string): { ok: boolean; message?: string } {
  const v = verifyPin(ctx, current);
  if (!v.ok) return { ok: false, message: 'The current PIN is not correct.' };
  const err = validatePinFormat(next);
  if (err) return { ok: false, message: err };
  const salt = crypto.randomBytes(16).toString('hex');
  ctx.db.run('UPDATE parent SET pin_hash = ?, pin_salt = ?, pin_iterations = ?, updated_at = ? WHERE id = 1', [hash(next, salt), salt, ITERATIONS, ctx.now()]);
  ctx.db.flushNow();
  return { ok: true };
}

/** Reset with the one-time recovery code; issues a fresh recovery code. Student data is untouched. */
export function resetPin(ctx: ServiceContext, recoveryCode: string, next: string): { ok: boolean; recoveryCode?: string; message?: string } {
  const row = ctx.db.get<ParentRow>('SELECT * FROM parent WHERE id = 1');
  if (!row) return { ok: false, message: 'No Parent PIN has been set up yet.' };
  if (row.locked_until > ctx.now()) return { ok: false, message: 'Too many tries. Please wait a minute and try again.' };
  if (!safeEqual(hash(normCode(recoveryCode), row.recovery_salt), row.recovery_hash)) {
    verifyPin(ctx, '!'); // counts as a failed attempt for lockout purposes
    return { ok: false, message: 'That recovery code is not correct.' };
  }
  const err = validatePinFormat(next);
  if (err) return { ok: false, message: err };
  const salt = crypto.randomBytes(16).toString('hex');
  const code = makeRecoveryCode();
  const rsalt = crypto.randomBytes(16).toString('hex');
  ctx.db.run('UPDATE parent SET pin_hash = ?, pin_salt = ?, pin_iterations = ?, recovery_hash = ?, recovery_salt = ?, failed_attempts = 0, locked_until = 0, updated_at = ? WHERE id = 1', [
    hash(next, salt),
    salt,
    ITERATIONS,
    hash(normCode(code), rsalt),
    rsalt,
    ctx.now(),
  ]);
  ctx.db.flushNow();
  ctx.log.info('parent', 'parent PIN reset with recovery code');
  return { ok: true, recoveryCode: code };
}
