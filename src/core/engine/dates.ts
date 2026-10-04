/**
 * Calendar-date helpers. Streaks and weekly stats use the student's LOCAL calendar date
 * (YYYY-MM-DD), computed once when an event happens and stored, so daylight-saving
 * changes and timezone moves can't break a streak retroactively.
 */

export function localDate(ms: number, tzOffsetMinutes = new Date(ms).getTimezoneOffset()): string {
  const d = new Date(ms - tzOffsetMinutes * 60_000);
  return d.toISOString().slice(0, 10);
}

/** Days between two YYYY-MM-DD strings (b - a). */
export function dayDiff(a: string, b: string): number {
  const ta = Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10));
  const tb = Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10));
  return Math.round((tb - ta) / 86_400_000);
}

export function addDays(date: string, n: number): string {
  const t = Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10)) + n * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/** Monday of the week containing `date` (ISO weeks start Monday). */
export function weekStart(date: string): string {
  const t = Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10));
  const dow = new Date(t).getUTCDay(); // 0 Sun .. 6 Sat
  const back = (dow + 6) % 7;
  return addDays(date, -back);
}

export interface StreakResult {
  current: number;
  longest: number;
  /** true if today already counts */
  todayCounted: boolean;
  lastQualifyingDate: string | null;
}

/**
 * Streak = consecutive qualifying calendar days. The current streak stays alive through
 * today if yesterday qualified (the student still has today to continue it).
 */
export function computeStreak(qualifyingDates: string[], today: string): StreakResult {
  const days = [...new Set(qualifyingDates)].filter((d) => dayDiff(d, today) >= 0).sort();
  if (days.length === 0) return { current: 0, longest: 0, todayCounted: false, lastQualifyingDate: null };
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = dayDiff(days[i - 1], days[i]) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  const last = days[days.length - 1];
  const gap = dayDiff(last, today);
  let current = 0;
  if (gap <= 1) {
    current = 1;
    for (let i = days.length - 1; i > 0 && dayDiff(days[i - 1], days[i]) === 1; i--) current++;
  }
  return { current, longest, todayCounted: gap === 0, lastQualifyingDate: last };
}

/** What counts as a meaningful learning day (spec §32): not just opening the app. */
export const STREAK_RULE = {
  minProblemsAnswered: 5,
  minActiveMinutes: 10,
  // completing any lesson section, quiz, or review set also qualifies
};

export function dayQualifies(stats: { problemsAnswered: number; activeSeconds: number; sectionsCompleted: number }): boolean {
  return stats.sectionsCompleted > 0 || stats.problemsAnswered >= STREAK_RULE.minProblemsAnswered || stats.activeSeconds >= STREAK_RULE.minActiveMinutes * 60;
}
