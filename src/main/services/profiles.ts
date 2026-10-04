/** Student profiles, per-profile settings, onboarding state and parent goals (spec §23, §39). */
import { ServiceContext, UserFacingError } from './context';
import { DEFAULT_SETTINGS, OnboardingState, ProfileSummary, Settings } from '../../shared/api';
import { totalXp } from './records';
import { levelForXp } from '../../core/engine/xp';

interface ProfileRow {
  id: number;
  display_name: string;
  avatar: string;
  created_at: number;
  archived: number;
  settings_json: string;
  onboarding_json: string;
  last_active_at: number | null;
}

export const AVATARS = ['spark', 'rocket', 'wave', 'mountain', 'planet', 'bolt', 'leaf', 'compass'];

function safeJson<T>(s: string, fallback: T): T {
  try {
    return { ...fallback, ...JSON.parse(s) };
  } catch {
    return fallback;
  }
}

function toSummary(ctx: ServiceContext, r: ProfileRow): ProfileSummary {
  const xp = totalXp(ctx, r.id);
  return {
    id: r.id,
    displayName: r.display_name,
    avatar: r.avatar,
    createdAt: r.created_at,
    lastActiveAt: r.last_active_at,
    archived: !!r.archived,
    xp,
    level: levelForXp(xp).level,
    onboarding: safeJson<OnboardingState>(r.onboarding_json, {}),
  };
}

export function requireProfile(ctx: ServiceContext, id: number): ProfileRow {
  if (!Number.isInteger(id)) throw new UserFacingError('Unknown student profile.');
  const r = ctx.db.get<ProfileRow>('SELECT * FROM profiles WHERE id = ?', [id]);
  if (!r) throw new UserFacingError('Unknown student profile.');
  return r;
}

export function listProfiles(ctx: ServiceContext): ProfileSummary[] {
  return ctx.db.all<ProfileRow>('SELECT * FROM profiles ORDER BY archived, created_at').map((r) => toSummary(ctx, r));
}

export function getProfile(ctx: ServiceContext, id: number): ProfileSummary {
  return toSummary(ctx, requireProfile(ctx, id));
}

export function validateName(name: string): string {
  const n = (name ?? '').replace(/\s+/g, ' ').trim();
  if (n.length < 1 || n.length > 30) throw new UserFacingError('Use a first name or nickname of 1 to 30 characters.');
  return n;
}

export function createProfile(ctx: ServiceContext, name: string, avatar: string): ProfileSummary {
  const n = validateName(name);
  if (ctx.db.get('SELECT id FROM profiles WHERE lower(display_name) = lower(?) AND archived = 0', [n])) throw new UserFacingError('A student with that name already exists.');
  const av = AVATARS.includes(avatar) ? avatar : AVATARS[0];
  const id = ctx.db.transaction(() => {
    const pid = ctx.db.insert('INSERT INTO profiles(display_name, avatar, created_at, settings_json, onboarding_json) VALUES (?,?,?,?,?)', [n, av, ctx.now(), JSON.stringify(DEFAULT_SETTINGS), JSON.stringify({ diagnostic: 'offered' })]);
    ctx.db.run('INSERT INTO goals(profile_id, weekly_lessons, daily_minutes, updated_at) VALUES (?, 5, 30, ?)', [pid, ctx.now()]);
    return pid;
  });
  ctx.db.flushNow();
  ctx.log.info('profiles', `profile ${id} created`);
  return getProfile(ctx, id);
}

export function updateProfile(ctx: ServiceContext, id: number, changes: { displayName?: string; avatar?: string; archived?: boolean }): ProfileSummary {
  requireProfile(ctx, id);
  if (changes.displayName !== undefined) ctx.db.run('UPDATE profiles SET display_name = ? WHERE id = ?', [validateName(changes.displayName), id]);
  if (changes.avatar !== undefined && AVATARS.includes(changes.avatar)) ctx.db.run('UPDATE profiles SET avatar = ? WHERE id = ?', [changes.avatar, id]);
  if (changes.archived !== undefined) ctx.db.run('UPDATE profiles SET archived = ? WHERE id = ?', [changes.archived ? 1 : 0, id]);
  return getProfile(ctx, id);
}

export function getSettings(ctx: ServiceContext, id: number): Settings {
  return safeJson<Settings>(requireProfile(ctx, id).settings_json, DEFAULT_SETTINGS);
}

export function updateSettings(ctx: ServiceContext, id: number, s: Partial<Settings>): Settings {
  const cur = getSettings(ctx, id);
  const next: Settings = {
    sound: typeof s.sound === 'boolean' ? s.sound : cur.sound,
    reducedMotion: typeof s.reducedMotion === 'boolean' ? s.reducedMotion : cur.reducedMotion,
    textScale: typeof s.textScale === 'number' && s.textScale >= 0.9 && s.textScale <= 1.4 ? Math.round(s.textScale * 100) / 100 : cur.textScale,
    theme: s.theme === 'light' || s.theme === 'dark' || s.theme === 'system' ? s.theme : cur.theme,
    dailyGoalMinutes: typeof s.dailyGoalMinutes === 'number' && s.dailyGoalMinutes >= 10 && s.dailyGoalMinutes <= 120 ? Math.round(s.dailyGoalMinutes) : cur.dailyGoalMinutes,
  };
  ctx.db.run('UPDATE profiles SET settings_json = ? WHERE id = ?', [JSON.stringify(next), id]);
  return next;
}

export function setOnboarding(ctx: ServiceContext, id: number, o: Partial<OnboardingState>): OnboardingState {
  const cur = safeJson<OnboardingState>(requireProfile(ctx, id).onboarding_json, {});
  const next: OnboardingState = { ...cur };
  if (typeof o.introSeen === 'boolean') next.introSeen = o.introSeen;
  if (o.diagnostic && ['offered', 'skipped', 'in_progress', 'completed'].includes(o.diagnostic)) next.diagnostic = o.diagnostic;
  if (typeof o.recommendedLessonId === 'string') next.recommendedLessonId = o.recommendedLessonId;
  ctx.db.run('UPDATE profiles SET onboarding_json = ? WHERE id = ?', [JSON.stringify(next), id]);
  return next;
}

export function getGoals(ctx: ServiceContext, id: number): { weeklyLessons: number; dailyMinutes: number } {
  const r = ctx.db.get<{ weekly_lessons: number; daily_minutes: number }>('SELECT weekly_lessons, daily_minutes FROM goals WHERE profile_id = ?', [id]);
  return { weeklyLessons: r?.weekly_lessons ?? 5, dailyMinutes: r?.daily_minutes ?? 30 };
}

export function setGoals(ctx: ServiceContext, id: number, g: { weeklyLessons: number; dailyMinutes: number }): void {
  requireProfile(ctx, id);
  const wl = Math.round(g.weeklyLessons);
  const dm = Math.round(g.dailyMinutes);
  if (!(wl >= 1 && wl <= 10)) throw new UserFacingError('Weekly lessons must be between 1 and 10.');
  if (!(dm >= 10 && dm <= 120)) throw new UserFacingError('Daily minutes must be between 10 and 120.');
  ctx.db.run('INSERT OR REPLACE INTO goals(profile_id, weekly_lessons, daily_minutes, updated_at) VALUES (?,?,?,?)', [id, wl, dm, ctx.now()]);
}
