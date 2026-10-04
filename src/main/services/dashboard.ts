/**
 * Student dashboard, parent dashboard, weekly report and the grade (spec §21, §22, §24, §25).
 * Every number shown anywhere is computed here from the same records, so the student view,
 * the parent view and the report always agree.
 */
import type { StudentDashboard, ParentDashboard, WeeklyReport, SkillMasteryView, CourseLesson, ResultsView } from '../../shared/api';
import { LESSONS, LESSON_BY_ID, SKILLS, SKILL_BY_ID, UNITS, UNIT_BY_ID, STANDARDS } from '../../content';
import { computeGrade, GradeResult, ScoredItem } from '../../core/engine/grading';
import { levelForXp, levelTitle } from '../../core/engine/xp';
import { computeStreak, weekStart, addDays, dayDiff, localDate } from '../../core/engine/dates';
import { STAGE_ORDER, MasteryStage } from '../../core/engine/mastery';
import { ServiceContext, UserFacingError, today } from './context';
import { getProfile, getGoals } from './profiles';
import { totalXp, skillStates } from './records';
import { getCourse } from './lessons';
import { listAchievements } from './achievements';
import { getProblem } from './practice';
import { answerToText } from '../../core/math/answers';

export const MISCONCEPTION_LABELS: Record<string, string> = {
  'sign-error': 'Sign errors (positive/negative)',
  'arithmetic-error': 'Arithmetic slips',
  'inverse-operation': 'Using the wrong inverse operation',
  distribution: 'Distributing to only part of an expression',
  'unlike-terms': 'Combining unlike terms',
  'slope-calc': 'Calculating slope',
  'slope-reciprocal': 'Using the reciprocal of the slope',
  'rise-run-swap': 'Swapping rise and run',
  'graph-reading': 'Reading values from a graph',
  'equation-setup': 'Setting up equations from words',
  'order-of-operations': 'Order of operations',
  'exponent-rule': 'Exponent rules',
  'radical-simplify': 'Simplifying radicals',
  'interval-endpoint': 'Open vs. closed endpoints',
  'inequality-direction': 'Inequality direction',
  'boundary-line': 'Solid vs. dashed boundary lines',
  shading: 'Shading the solution region',
  'sequence-index': 'Counting terms in a sequence',
  'growth-decay': 'Growth vs. decay',
  'percent-rate': 'Converting percents and rates',
  'vertex-sign': 'Signs in vertex form',
  factoring: 'Factoring',
  'missing-solution': 'Missing a solution',
  'formula-error': 'Using a formula',
  'statistics-concept': 'Statistics concepts',
  units: 'Units',
  'function-input-output': 'Mixing up inputs and outputs',
  other: 'Other errors',
};

// ---------------------------------------------------------------------------
// Shared calculations
// ---------------------------------------------------------------------------

export function gradeFor(ctx: ServiceContext, profileId: number): GradeResult {
  const rows = ctx.db.all<{ kind: string; ref_id: string; score: number; max_score: number; finished_at: number }>(
    "SELECT kind, ref_id, score, max_score, finished_at FROM assessments WHERE profile_id = ? AND status = 'completed' AND max_score > 0",
    [profileId],
  );
  const pick = (kinds: string[]): ScoredItem[] => rows.filter((r) => kinds.includes(r.kind)).map((r) => ({ refId: r.ref_id, score: r.score, maxScore: r.max_score, finishedAt: r.finished_at }));
  // A passed test-out stands in for that lesson's quiz; a failed test-out is practice, not a grade.
  const testOuts = rows.filter((r) => r.kind === 'test-out' && r.score / r.max_score >= 0.85 - 1e-9).map((r) => ({ refId: r.ref_id, score: r.score, maxScore: r.max_score, finishedAt: r.finished_at }));
  const prog = ctx.db.get<{ started: number; done: number }>(
    "SELECT COUNT(*) AS started, SUM(CASE WHEN practice_complete = 1 OR status = 'tested_out' THEN 1 ELSE 0 END) AS done FROM lesson_progress WHERE profile_id = ?",
    [profileId],
  )!;
  return computeGrade({
    quizAttempts: [...pick(['quiz']), ...testOuts],
    unitAssessmentAttempts: pick(['unit-assessment']),
    semesterAssessmentAttempts: pick(['semester-assessment']),
    practice: { lessonsStarted: Number(prog.started), lessonsPracticeComplete: Number(prog.done ?? 0) },
  });
}

export function skillViews(ctx: ServiceContext, profileId: number): SkillMasteryView[] {
  const st = skillStates(ctx, profileId);
  const now = ctx.now();
  return SKILLS.map((s) => {
    const x = st.get(s.id);
    return {
      skillId: s.id,
      name: s.name,
      unitId: s.unitId,
      standards: s.standards,
      stage: (x?.stage ?? 'NOT_STARTED') as MasteryStage,
      score: Math.round((x?.score ?? 0) * 100) / 100,
      evidence: x?.evidence ?? 0,
      dueForReview: !!x && x.nextReviewAt !== null && x.nextReviewAt <= now && STAGE_ORDER.indexOf(x.stage) >= STAGE_ORDER.indexOf('DEVELOPING'),
    };
  });
}

function atLeast(stage: MasteryStage, min: MasteryStage): boolean {
  return STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf(min);
}

function minutesBetween(ctx: ServiceContext, profileId: number, from: string, to: string): number {
  const r = ctx.db.get<{ s: number }>('SELECT COALESCE(SUM(active_seconds), 0) AS s FROM study_time WHERE profile_id = ? AND local_date >= ? AND local_date <= ?', [profileId, from, to])!;
  return Math.round(Number(r.s) / 60);
}

function completedBetween(ctx: ServiceContext, profileId: number, fromMs: number, toMs: number): Array<{ id: string; title: string }> {
  return ctx.db
    .all<{ lesson_id: string }>("SELECT lesson_id FROM lesson_progress WHERE profile_id = ? AND status IN ('completed','tested_out') AND completed_at >= ? AND completed_at < ? ORDER BY completed_at", [profileId, fromMs, toMs])
    .map((r) => ({ id: r.lesson_id, title: LESSON_BY_ID.get(r.lesson_id)?.title ?? r.lesson_id }));
}

/** ms timestamp of local midnight at the start of a local date (inverse of localDate for this context). */
function startOfLocalDate(ctx: ServiceContext, date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  const utcMidnight = Date.UTC(y, m - 1, d);
  // local = utc - offset; so the instant of local midnight is utcMidnight + offset minutes
  let t = utcMidnight + ctx.tzOffset(utcMidnight) * 60_000;
  // correct for a DST change between the guess and the real instant
  t = utcMidnight + ctx.tzOffset(t) * 60_000;
  return t;
}

function accuracyBetween(ctx: ServiceContext, profileId: number, fromDate: string, toDate: string): number | null {
  const r = ctx.db.get<{ n: number; c: number }>(
    "SELECT COUNT(*) AS n, SUM(correct) AS c FROM attempts WHERE profile_id = ? AND counted = 1 AND local_date >= ? AND local_date <= ? AND activity != 'diagnostic'",
    [profileId, fromDate, toDate],
  )!;
  return Number(r.n) ? Math.round((100 * Number(r.c ?? 0)) / Number(r.n)) : null;
}

export interface Pace {
  status: 'ahead' | 'on-track' | 'behind' | 'not-started';
  plannedDay: number;
  completedDays: number;
  detail: string;
}

/** Pace against the parent's weekly lesson goal, counted from the first day of study. */
export function paceFor(ctx: ServiceContext, profileId: number): Pace {
  const goals = getGoals(ctx, profileId);
  const completedDays = Number(ctx.db.get<{ n: number }>("SELECT COUNT(*) AS n FROM lesson_progress WHERE profile_id = ? AND status IN ('completed','tested_out')", [profileId])!.n);
  const first = ctx.db.get<{ t: number | null }>('SELECT MIN(started_at) AS t FROM lesson_progress WHERE profile_id = ?', [profileId])!.t;
  if (first === null || first === undefined) return { status: 'not-started', plannedDay: 0, completedDays: 0, detail: 'The course has not been started yet.' };
  const weeks = Math.floor(dayDiff(localDate(first, ctx.tzOffset(first)), today(ctx)) / 7) + 1;
  const plannedDay = Math.min(LESSONS.length, weeks * goals.weeklyLessons);
  const diff = completedDays - plannedDay;
  // within one lesson of the plan counts as on track; the current week isn't over yet
  const status = diff >= 2 ? 'ahead' : diff <= -(goals.weeklyLessons + 1) ? 'behind' : 'on-track';
  const detail =
    status === 'ahead'
      ? `${diff} lesson${diff === 1 ? '' : 's'} ahead of the ${goals.weeklyLessons}-per-week plan.`
      : status === 'behind'
        ? `${-diff} lessons behind the ${goals.weeklyLessons}-per-week plan.`
        : `On track for ${goals.weeklyLessons} lessons per week.`;
  return { status, plannedDay, completedDays, detail };
}

function streakFor(ctx: ServiceContext, profileId: number) {
  const days = ctx.db.all<{ local_date: string }>('SELECT local_date FROM activity_days WHERE profile_id = ? AND qualifying = 1', [profileId]).map((r) => r.local_date);
  return computeStreak(days, today(ctx));
}

function xpBetween(ctx: ServiceContext, profileId: number, fromDate: string, toDate: string): number {
  return Number(ctx.db.get<{ s: number }>('SELECT COALESCE(SUM(amount), 0) AS s FROM xp_events WHERE profile_id = ? AND local_date >= ? AND local_date <= ?', [profileId, fromDate, toDate])!.s);
}

function continueLesson(ctx: ServiceContext, profileId: number, course: CourseLesson[]): StudentDashboard['continueLesson'] {
  const inProgress = ctx.db.get<{ lesson_id: string; section: string }>("SELECT lesson_id, section FROM lesson_progress WHERE profile_id = ? AND status = 'in_progress' ORDER BY updated_at DESC LIMIT 1", [profileId]);
  const mk = (id: string, section: string, resume: boolean) => {
    const l = LESSON_BY_ID.get(id)!;
    const u = UNIT_BY_ID.get(l.unitId)!;
    return { lessonId: id, title: l.title, section, unitTitle: `Unit ${u.number}: ${u.title}`, resume, kind: l.kind };
  };
  if (inProgress && course.find((c) => c.id === inProgress.lesson_id)?.hasContent) return mk(inProgress.lesson_id, inProgress.section, true);
  const next = course.find((c) => c.status === 'available' && c.hasContent);
  return next ? mk(next.id, 'goal', false) : null;
}

// ---------------------------------------------------------------------------
// Student dashboard
// ---------------------------------------------------------------------------

export function getStudentDashboard(ctx: ServiceContext, profileId: number): StudentDashboard {
  const profile = getProfile(ctx, profileId);
  const units = getCourse(ctx, profileId);
  const course = units.flatMap((u) => u.lessons);
  const done = course.filter((c) => c.status === 'completed' || c.status === 'tested_out').length;
  const xp = totalXp(ctx, profileId);
  const lv = levelForXp(xp);
  const t = today(ctx);
  const ws = weekStart(t);
  const goals = getGoals(ctx, profileId);
  const skills = skillViews(ctx, profileId);
  const count = (s: MasteryStage) => skills.filter((k) => k.stage === s).length;
  const streak = streakFor(ctx, profileId);
  const pace = paceFor(ctx, profileId);
  const firstOpen = course.find((c) => c.status !== 'completed' && c.status !== 'tested_out');
  const curUnit = firstOpen ? units.find((u) => u.lessons.some((l) => l.id === firstOpen.id)) : units[units.length - 1];
  const grade = gradeFor(ctx, profileId);
  const weekLessons = completedBetween(ctx, profileId, startOfLocalDate(ctx, ws), startOfLocalDate(ctx, addDays(ws, 7))).length;
  const todayMinutes = minutesBetween(ctx, profileId, t, t);
  const cont = continueLesson(ctx, profileId, course);
  const todayGoal =
    todayMinutes >= goals.dailyMinutes
      ? `Daily goal met: ${todayMinutes} minutes today. Nice work!`
      : cont
        ? `${cont.resume ? 'Pick up' : 'Start'} "${cont.title}" (${goals.dailyMinutes - todayMinutes} more minutes reaches today's goal).`
        : `Study ${goals.dailyMinutes} minutes today.`;
  return {
    profile,
    continueLesson: cont,
    todayGoal,
    semester: { completedLessons: done, totalLessons: course.length, percent: Math.round((100 * done) / course.length), currentWeek: firstOpen?.week ?? 18, plannedWeek: Math.max(1, Math.ceil(pace.plannedDay / 5)) },
    currentUnit: curUnit ? { id: curUnit.id, number: curUnit.number, title: curUnit.title, percent: Math.round((100 * curUnit.completedCount) / curUnit.lessons.length) } : null,
    xp: { total: xp, level: lv.level, title: levelTitle(lv.level), progress: lv.progress, current: lv.current, needed: lv.needed, thisWeek: xpBetween(ctx, profileId, ws, addDays(ws, 6)) },
    streak: { current: streak.current, longest: streak.longest, todayCounted: streak.todayCounted },
    weeklyGoal: { lessonsTarget: goals.weeklyLessons, lessonsDone: weekLessons, minutesTarget: goals.dailyMinutes * 5, minutesDone: minutesBetween(ctx, profileId, ws, addDays(ws, 6)) },
    todayMinutes,
    skills: { mastered: count('MASTERED'), proficient: count('PROFICIENT'), developing: count('DEVELOPING'), learning: count('LEARNING'), notStarted: count('NOT_STARTED'), total: skills.length },
    developingSkills: skills.filter((s) => s.stage === 'LEARNING' || s.stage === 'DEVELOPING').slice(0, 6),
    masteredSkills: skills.filter((s) => s.stage === 'MASTERED'),
    upcoming: course.filter((c) => c.status !== 'completed' && c.status !== 'tested_out').slice(0, 5),
    suggestedReview: skills.filter((s) => s.dueForReview).slice(0, 5),
    achievements: listAchievements(ctx, profileId),
    grade: { percent: grade.percent, letter: grade.letter },
  };
}

// ---------------------------------------------------------------------------
// Parent dashboard
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<string, string> = { quizzes: 'Lesson quizzes', unitAssessments: 'Unit assessments', semesterAssessment: 'Semester assessment', practice: 'Practice completion' };

function refTitle(refId: string): string {
  const l = LESSON_BY_ID.get(refId);
  if (l) return l.title;
  const u = UNIT_BY_ID.get(refId);
  if (u) return `Unit ${u.number}: ${u.title}`;
  return refId;
}

function assessmentTitle(kind: string, refId: string): string {
  const k: Record<string, string> = { quiz: 'Quiz', 'test-out': 'Show What You Know', 'unit-assessment': 'Unit Assessment', 'semester-assessment': 'Semester Assessment', diagnostic: 'Diagnostic', checkpoint: 'Checkpoint', 'unit-review': 'Unit Review', 'cumulative-review': 'Cumulative Review' };
  return `${k[kind] ?? kind}: ${refTitle(refId)}`;
}

export function getParentDashboard(ctx: ServiceContext, profileId: number): ParentDashboard {
  const profile = getProfile(ctx, profileId);
  const units = getCourse(ctx, profileId);
  const course = units.flatMap((u) => u.lessons);
  const done = course.filter((c) => c.status === 'completed' || c.status === 'tested_out').length;
  const grade = gradeFor(ctx, profileId);
  const pace = paceFor(ctx, profileId);
  const skills = skillViews(ctx, profileId);
  const streak = streakFor(ctx, profileId);
  const xp = totalXp(ctx, profileId);
  const t = today(ctx);
  const ws = weekStart(t);
  const goals = getGoals(ctx, profileId);
  const firstOpen = course.find((c) => c.status !== 'completed' && c.status !== 'tested_out');
  const curUnit = firstOpen ? units.find((u) => u.lessons.some((l) => l.id === firstOpen.id)) : null;

  const assessRows = ctx.db.all<{ id: number; kind: string; ref_id: string; finished_at: number; score: number; max_score: number; duration_ms: number; attempt_number: number }>(
    "SELECT id, kind, ref_id, finished_at, score, max_score, duration_ms, attempt_number FROM assessments WHERE profile_id = ? AND status = 'completed' ORDER BY finished_at DESC",
    [profileId],
  );
  const assessments = assessRows.map((a) => ({
    id: a.id,
    kind: a.kind,
    refId: a.ref_id,
    title: assessmentTitle(a.kind, a.ref_id),
    date: a.finished_at,
    percent: a.max_score ? Math.round((1000 * a.score) / a.max_score) / 10 : 0,
    durationMs: a.duration_ms ?? 0,
    attemptNumber: a.attempt_number,
    missed: a.max_score - a.score,
  }));

  // grade trend: the grade as it stood after each graded assessment
  const gradeTrend: Array<{ date: string; percent: number }> = [];
  {
    const rows = [...assessRows].reverse();
    const prog = { started: 0, done: 0 };
    const acc: Record<string, ScoredItem[]> = { quiz: [], unit: [], sem: [] };
    for (const r of rows) {
      const item = { refId: r.ref_id, score: r.score, maxScore: r.max_score, finishedAt: r.finished_at };
      if (r.kind === 'quiz' || (r.kind === 'test-out' && r.score / r.max_score >= 0.85 - 1e-9)) acc.quiz.push(item);
      else if (r.kind === 'unit-assessment') acc.unit.push(item);
      else if (r.kind === 'semester-assessment') acc.sem.push(item);
      else continue;
      const g = computeGrade({ quizAttempts: acc.quiz, unitAssessmentAttempts: acc.unit, semesterAssessmentAttempts: acc.sem, practice: { lessonsStarted: prog.started, lessonsPracticeComplete: prog.done } });
      if (g.percent !== null) {
        const d = localDate(r.finished_at, ctx.tzOffset(r.finished_at));
        const last = gradeTrend[gradeTrend.length - 1];
        if (last && last.date === d) last.percent = g.percent;
        else gradeTrend.push({ date: d, percent: g.percent });
      }
    }
  }

  const masteryByUnit = UNITS.map((u) => {
    const us = skills.filter((s) => s.unitId === u.id);
    return { unitId: u.id, title: `Unit ${u.number}: ${u.title}`, standards: u.standards, skills: us, percentProficient: us.length ? Math.round((100 * us.filter((s) => atLeast(s.stage, 'PROFICIENT')).length) / us.length) : 0 };
  });

  // needs attention: started skills that are weak, or flagged by recent misses
  const needsAttention = skills
    .filter((s) => s.evidence > 0 && !atLeast(s.stage, 'PROFICIENT'))
    .sort((a, b) => a.score - b.score)
    .slice(0, 8);
  const strengths = skills.filter((s) => atLeast(s.stage, 'PROFICIENT')).sort((a, b) => b.score - a.score).slice(0, 8);

  // time by week (last 8 weeks)
  const byWeek: Array<{ weekStart: string; minutes: number; lessons: number }> = [];
  for (let i = 7; i >= 0; i--) {
    const w = addDays(ws, -7 * i);
    byWeek.push({ weekStart: w, minutes: minutesBetween(ctx, profileId, w, addDays(w, 6)), lessons: completedBetween(ctx, profileId, startOfLocalDate(ctx, w), startOfLocalDate(ctx, addDays(w, 7))).length });
  }
  const totalMinutes = Math.round(Number(ctx.db.get<{ s: number }>('SELECT COALESCE(SUM(active_seconds),0) AS s FROM study_time WHERE profile_id = ?', [profileId])!.s) / 60);

  const att = ctx.db.get<{ n: number; first: number; firstOk: number }>(
    "SELECT COUNT(*) AS n, SUM(CASE WHEN counted = 1 THEN 1 ELSE 0 END) AS first, SUM(CASE WHEN counted = 1 AND correct = 1 AND attempt_number = 1 AND max_hint_level = 0 THEN 1 ELSE 0 END) AS firstOk FROM attempts WHERE profile_id = ? AND status != 'invalid'",
    [profileId],
  )!;
  const hints = Number(ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM hint_events WHERE profile_id = ?', [profileId])!.n);
  const ta = ctx.db.all<{ lesson_id: string; n: number }>('SELECT lesson_id, COUNT(*) AS n FROM teach_again_events WHERE profile_id = ? GROUP BY lesson_id ORDER BY n DESC', [profileId]);
  const errs = ctx.db.all<{ misconception: string; n: number }>(
    "SELECT misconception, COUNT(*) AS n FROM attempts WHERE profile_id = ? AND misconception IS NOT NULL AND misconception != '' GROUP BY misconception HAVING n >= 2 ORDER BY n DESC LIMIT 6",
    [profileId],
  );

  const recent = ctx.db.all<{ type: string; detail_json: string; created_at: number }>('SELECT type, detail_json, created_at FROM activity_log WHERE profile_id = ? ORDER BY created_at DESC, id DESC LIMIT 25', [profileId]).map((r) => ({
    at: r.created_at,
    text: describeActivity(r.type, safeParse(r.detail_json)),
  }));

  const headline =
    pace.status === 'not-started'
      ? `${profile.displayName} has not started the course yet.`
      : `${profile.displayName} has completed ${done} of ${course.length} course days${grade.percent !== null ? ` with a ${grade.percent}% (${grade.letter})` : ''}. ${pace.detail}`;

  return {
    profile,
    overview: {
      semesterPercent: Math.round((100 * done) / course.length),
      grade: { percent: grade.percent, letter: grade.letter },
      lessonsCompleted: done,
      lessonsRemaining: course.length - done,
      currentUnit: curUnit ? `Unit ${curUnit.number}: ${curUnit.title}` : null,
      paceStatus: pace.status,
      paceDetail: pace.detail,
      headline,
    },
    gradeDetail: {
      categories: grade.categories.map((c) => ({ category: c.category, label: CATEGORY_LABELS[c.category], weight: c.weight, percent: c.percent, items: c.items.map((i) => ({ ...i, label: refTitle(i.refId) })) })),
      effectiveWeights: grade.effectiveWeights as Record<string, number>,
    },
    gradeTrend,
    assessments,
    masteryByUnit,
    needsAttention,
    strengths,
    time: { totalMinutes, thisWeekMinutes: minutesBetween(ctx, profileId, ws, addDays(ws, 6)), byWeek },
    engagement: { streak: streak.current, longestStreak: streak.longest, xp, level: levelForXp(xp).level, weeklyLessons: byWeek[byWeek.length - 1].lessons },
    support: {
      attempts: Number(att.n),
      hintsUsed: hints,
      teachAgainUses: ta.reduce((a, r) => a + Number(r.n), 0),
      teachAgainByLesson: ta.map((r) => ({ lessonId: r.lesson_id, title: refTitle(r.lesson_id), count: Number(r.n) })),
      repeatedErrors: errs.map((e) => ({ misconception: e.misconception, label: MISCONCEPTION_LABELS[e.misconception] ?? e.misconception, count: Number(e.n) })),
      firstTryAccuracy: Number(att.first) ? Math.round((100 * Number(att.firstOk)) / Number(att.first)) : null,
    },
    recentActivity: recent,
    upcoming: course.filter((c) => c.status !== 'completed' && c.status !== 'tested_out').slice(0, 5),
    goals,
  };
}

function safeParse(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

export function describeActivity(type: string, d: Record<string, unknown>): string {
  const title = String(d.title ?? d.lessonId ?? '');
  switch (type) {
    case 'lesson-start':
      return `Started "${title}"`;
    case 'lesson-complete':
      return `Completed "${title}"`;
    case 'quiz':
      return `${d.passed ? 'Passed' : 'Took'} the "${title}" quiz (${d.percent}%)`;
    case 'test-out':
      return `Tested out of "${title}" (${d.percent}%)`;
    case 'test-out-try':
      return `Tried to test out of "${title}" (${d.percent}%) and is working through the lesson`;
    case 'test-out-start':
      return `Started Show What You Know for "${title}"`;
    case 'mastery':
      return `Reached ${d.stage === 'MASTERED' ? 'Mastered' : 'Proficient'} on "${d.skill}"`;
    case 'assessment':
      return `${d.passed ? 'Passed' : 'Took'} "${title}" (${d.percent}%, attempt ${d.attempt})`;
    case 'review':
      return `Finished "${title}" (${d.percent}% right on the first try)`;
    case 'achievement':
      return `Earned the "${d.title}" achievement`;
    case 'restore':
      return 'Data was restored from a backup';
    default:
      return type;
  }
}

// ---------------------------------------------------------------------------
// Weekly report (spec §25)
// ---------------------------------------------------------------------------

export function getWeeklyReport(ctx: ServiceContext, profileId: number, week?: string): WeeklyReport {
  const profile = getProfile(ctx, profileId);
  const ws = week ? weekStart(week) : weekStart(today(ctx));
  if (week && !/^\d{4}-\d{2}-\d{2}$/.test(week)) throw new UserFacingError('Choose a valid week.');
  const we = addDays(ws, 6);
  const from = startOfLocalDate(ctx, ws);
  const to = startOfLocalDate(ctx, addDays(ws, 7));
  const lessons = completedBetween(ctx, profileId, from, to);
  const minutes = minutesBetween(ctx, profileId, ws, we);
  const accuracy = accuracyBetween(ctx, profileId, ws, we);
  const pws = addDays(ws, -7);
  const prevLessons = completedBetween(ctx, profileId, startOfLocalDate(ctx, pws), from).length;
  const prevMinutes = minutesBetween(ctx, profileId, pws, addDays(pws, 6));
  const prevAcc = accuracyBetween(ctx, profileId, pws, addDays(pws, 6));
  const assessments = ctx.db
    .all<{ kind: string; ref_id: string; score: number; max_score: number }>("SELECT kind, ref_id, score, max_score FROM assessments WHERE profile_id = ? AND status = 'completed' AND finished_at >= ? AND finished_at < ? ORDER BY finished_at", [profileId, from, to])
    .map((a) => ({ title: assessmentTitle(a.kind, a.ref_id), percent: a.max_score ? Math.round((1000 * a.score) / a.max_score) / 10 : 0 }));
  const masteredRows = ctx.db.all<{ detail_json: string }>("SELECT detail_json FROM activity_log WHERE profile_id = ? AND type = 'mastery' AND created_at >= ? AND created_at < ?", [profileId, from, to]);
  const skillsMastered = [...new Set(masteredRows.map((r) => safeParse(r.detail_json)).filter((d) => d.stage === 'MASTERED').map((d) => String(d.skill)))];
  const improvements = [...new Set(masteredRows.map((r) => safeParse(r.detail_json)).filter((d) => d.stage === 'PROFICIENT').map((d) => String(d.skill)))];
  const views = skillViews(ctx, profileId);
  const weak = views.filter((s) => s.evidence > 0 && !atLeast(s.stage, 'PROFICIENT')).sort((a, b) => a.score - b.score);
  const needsAttention = weak.slice(0, 5).map((s) => s.name);
  const due = views.filter((s) => s.dueForReview).map((s) => s.name);
  const course = getCourse(ctx, profileId).flatMap((u) => u.lessons);
  const next = course.find((c) => c.status !== 'completed' && c.status !== 'tested_out');
  const recommendedFocus = [...needsAttention.slice(0, 2).map((n) => `Practice: ${n}`), ...due.slice(0, 2).map((n) => `Review: ${n}`), ...(next ? [`Next lesson: ${next.title}`] : [])];
  const streak = streakFor(ctx, profileId);
  const xpEarned = xpBetween(ctx, profileId, ws, we);
  const parts: string[] = [];
  parts.push(lessons.length ? `${profile.displayName} completed ${lessons.length} lesson${lessons.length === 1 ? '' : 's'} and studied ${minutes} minutes this week.` : `${profile.displayName} did not complete a lesson this week (${minutes} minutes of study).`);
  if (accuracy !== null) parts.push(`Accuracy on graded work was ${accuracy}%${prevAcc !== null ? ` (${accuracy >= prevAcc ? 'up' : 'down'} from ${prevAcc}% last week)` : ''}.`);
  if (skillsMastered.length) parts.push(`Mastered: ${skillsMastered.join(', ')}.`);
  if (needsAttention.length) parts.push(`Needs attention: ${needsAttention.slice(0, 3).join(', ')}.`);
  const report: WeeklyReport = {
    profileId,
    studentName: profile.displayName,
    weekStart: ws,
    weekEnd: we,
    generatedAt: ctx.now(),
    lessonsCompleted: lessons,
    minutes,
    previous: { lessons: prevLessons, minutes: prevMinutes, accuracy: prevAcc },
    accuracy,
    assessments,
    skillsMastered,
    improvements,
    needsAttention,
    recommendedFocus,
    streak: streak.current,
    xpEarned,
    summary: parts.join(' '),
  };
  ctx.db.run('INSERT OR REPLACE INTO weekly_reports(profile_id, week_start, report_json, generated_at) VALUES (?,?,?,?)', [profileId, ws, JSON.stringify(report), report.generatedAt]);
  return report;
}

// ---------------------------------------------------------------------------
// Standards & assessment detail
// ---------------------------------------------------------------------------

export function getStandards(): Array<{ code: string; text: string; parent?: string; lessons: string[] }> {
  return STANDARDS.map((s) => ({ code: s.code, text: s.text, parent: s.parent, lessons: LESSONS.filter((l) => l.standards.includes(s.code) || (s.parent === undefined && l.standards.some((c) => c.startsWith(s.code + '.')))).map((l) => l.id) }));
}

export function getAssessmentDetail(ctx: ServiceContext, profileId: number, assessmentId: number): ResultsView {
  const a = ctx.db.get<{ kind: string; ref_id: string; attempt_number: number; score: number; max_score: number; duration_ms: number; items_json: string; mastery_before_json: string | null; mastery_after_json: string | null }>(
    "SELECT kind, ref_id, attempt_number, score, max_score, duration_ms, items_json, mastery_before_json, mastery_after_json FROM assessments WHERE id = ? AND profile_id = ? AND status = 'completed'",
    [assessmentId, profileId],
  );
  if (!a) throw new UserFacingError('That assessment was not found.');
  const stored = JSON.parse(a.items_json) as Array<{ skillId: string; correct: boolean; response: string; generatorId: string; seed: number; difficulty: 1 | 2 | 3; misconception: string | null }>;
  const items = stored.map((it, index) => {
    let prompt: ResultsView['items'][number]['prompt'] = [];
    let solution: ResultsView['items'][number]['solution'] = [];
    let correctAnswer = '';
    try {
      // problems are regenerated exactly from their generator, seed and difficulty
      const p = getProblem(it.generatorId, it.seed, it.difficulty);
      prompt = p.prompt;
      solution = p.solution;
      correctAnswer = answerToText(p.answer);
    } catch {
      prompt = [{ t: 'p', text: 'This problem type is no longer available in this version.' }];
    }
    return { index, skillId: it.skillId, skillName: SKILL_BY_ID.get(it.skillId)?.name ?? it.skillId, correct: it.correct, response: it.response, correctAnswer, prompt, solution, misconception: it.misconception ?? undefined };
  });
  const before = a.mastery_before_json ? (JSON.parse(a.mastery_before_json) as Record<string, MasteryStage>) : {};
  const after = a.mastery_after_json ? (JSON.parse(a.mastery_after_json) as Record<string, MasteryStage>) : {};
  const percent = a.max_score ? Math.round((1000 * a.score) / a.max_score) / 10 : 0;
  const missed = [...new Set(items.filter((i) => !i.correct).map((i) => i.skillName))];
  return {
    kind: (a.kind === 'test-out' ? 'test-out' : a.kind) as ResultsView['kind'],
    title: assessmentTitle(a.kind, a.ref_id),
    score: a.score,
    maxScore: a.max_score,
    percent,
    passed: percent >= (a.kind === 'test-out' ? 85 : a.kind === 'quiz' ? 80 : 70),
    passPercent: a.kind === 'test-out' ? 85 : a.kind === 'quiz' ? 80 : 70,
    durationMs: a.duration_ms ?? 0,
    attemptNumber: a.attempt_number,
    items,
    didWell: [...new Set(items.filter((i) => i.correct).map((i) => i.skillName))].filter((n) => !missed.includes(n)),
    needsPractice: missed,
    nextStep: '',
    skillChanges: Object.keys(after).map((s) => ({ skillId: s, skillName: SKILL_BY_ID.get(s)?.name ?? s, before: before[s] ?? 'NOT_STARTED', after: after[s], score: 0 })),
    xpEarned: 0,
    canRetake: false,
  };
}
