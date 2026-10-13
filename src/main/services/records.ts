/** Writing learning records and deriving per-skill state. All other services go through here. */
import { ServiceContext, today } from './context';
import { computeSkillState, Evidence, EvidenceActivity, MasteryStage, SkillState, STAGE_ORDER } from '../../core/engine/mastery';
import { dayQualifies } from '../../core/engine/dates';
import { XP_POLICY } from '../../core/engine/xp';
import { SKILL_BY_ID, LESSON_CONTENT } from '../../content';
import { summarizeSkills, nextStepFor } from '../../core/engine/results';
import { TEST_OUT_PASS, ASSESSMENT_PASS } from '../../core/engine/grading';
import { isLearningActivity } from '../../shared/api';

export interface AttemptRecord {
  profileId: number;
  lessonId: string | null;
  activity: string;
  assessmentId?: number | null;
  skillId: string;
  generatorId: string;
  seed: number;
  difficulty: number;
  problemKey: string;
  stepIndex?: number | null;
  response: string;
  status: string;
  correct: boolean;
  attemptNumber: number;
  hintsUsed: number;
  maxHintLevel: number;
  misconception?: string | null;
  elapsedMs: number;
  counted: boolean;
  xp: number;
  guessing: boolean;
}

export function recordAttempt(ctx: ServiceContext, a: AttemptRecord): number {
  const at = ctx.now();
  const d = today(ctx, at);
  const id = ctx.db.insert(
    `INSERT INTO attempts(profile_id, lesson_id, activity, assessment_id, skill_id, generator_id, seed, difficulty, problem_key, step_index, response, status, correct,
      attempt_number, hints_used, max_hint_level, misconception, elapsed_ms, counted, xp, guessing, local_date, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      a.profileId, a.lessonId, a.activity, a.assessmentId ?? null, a.skillId, a.generatorId, a.seed, a.difficulty, a.problemKey, a.stepIndex ?? null,
      a.response.slice(0, 500), a.status, a.correct ? 1 : 0, a.attemptNumber, a.hintsUsed, a.maxHintLevel, a.misconception ?? null,
      Math.max(0, Math.round(a.elapsedMs)), a.counted ? 1 : 0, a.xp, a.guessing ? 1 : 0, d, at,
    ],
  );
  // Streak days count resolved problems only (one per problem, the counted attempt), never
  // wrong tries or wrong-form submissions on their own, and never answers flagged as guessing.
  if (a.counted && !a.guessing) bumpDay(ctx, a.profileId, { problems: 1 });
  ctx.db.run('UPDATE profiles SET last_active_at = ? WHERE id = ?', [at, a.profileId]);
  return id;
}

/** Mark an earlier attempt as the counted evidence for its problem. */
export function markCounted(ctx: ServiceContext, attemptId: number): void {
  ctx.db.run('UPDATE attempts SET counted = 1 WHERE id = ?', [attemptId]);
}

export function recordHint(ctx: ServiceContext, profileId: number, lessonId: string | null, activity: string, skillId: string, problemKey: string, stepIndex: number | null, level: number): void {
  const at = ctx.now();
  ctx.db.run('INSERT INTO hint_events(profile_id, lesson_id, activity, skill_id, problem_key, step_index, level, local_date, created_at) VALUES (?,?,?,?,?,?,?,?,?)', [
    profileId, lessonId, activity, skillId, problemKey, stepIndex, level, today(ctx, at), at,
  ]);
}

export function recordTeachAgain(ctx: ServiceContext, profileId: number, lessonId: string, approach: string): void {
  const at = ctx.now();
  ctx.db.run('INSERT INTO teach_again_events(profile_id, lesson_id, approach, local_date, created_at) VALUES (?,?,?,?,?)', [profileId, lessonId, approach, today(ctx, at), at]);
}

export function bumpDay(ctx: ServiceContext, profileId: number, inc: { problems?: number; sections?: number; seconds?: number }): void {
  const d = today(ctx);
  ctx.db.run('INSERT OR IGNORE INTO activity_days(profile_id, local_date) VALUES (?, ?)', [profileId, d]);
  ctx.db.run(
    'UPDATE activity_days SET problems_answered = problems_answered + ?, sections_completed = sections_completed + ?, active_seconds = active_seconds + ? WHERE profile_id = ? AND local_date = ?',
    [inc.problems ?? 0, inc.sections ?? 0, inc.seconds ?? 0, profileId, d],
  );
  const row = ctx.db.get<{ problems_answered: number; sections_completed: number; active_seconds: number }>(
    'SELECT problems_answered, sections_completed, active_seconds FROM activity_days WHERE profile_id = ? AND local_date = ?',
    [profileId, d],
  )!;
  const q = dayQualifies({ problemsAnswered: row.problems_answered, sectionsCompleted: row.sections_completed, activeSeconds: row.active_seconds }) ? 1 : 0;
  ctx.db.run('UPDATE activity_days SET qualifying = ? WHERE profile_id = ? AND local_date = ?', [q, profileId, d]);
}

/**
 * Add active learning time. Only learning activities count (lessons, review/assessment days, the
 * diagnostic, practice): time on the dashboard, course map, skills list or settings is not
 * recorded, so it never adds study minutes and never makes a streak day by itself.
 */
export function addStudyTime(ctx: ServiceContext, profileId: number, lessonId: string | null, activity: string, seconds: number): void {
  if (!isLearningActivity(activity)) return;
  const s = Math.max(0, Math.min(30, Math.round(seconds)));
  if (!s) return;
  const d = today(ctx);
  ctx.db.run('INSERT OR IGNORE INTO study_time(profile_id, local_date, lesson_id, activity, active_seconds) VALUES (?,?,?,?,0)', [profileId, d, lessonId ?? '', activity]);
  ctx.db.run('UPDATE study_time SET active_seconds = active_seconds + ? WHERE profile_id = ? AND local_date = ? AND lesson_id = ? AND activity = ?', [s, profileId, d, lessonId ?? '', activity]);
  bumpDay(ctx, profileId, { seconds: s });
}

export function awardXp(ctx: ServiceContext, profileId: number, amount: number, reason: string, ref: string | null = null): number {
  if (amount <= 0) return 0;
  const at = ctx.now();
  ctx.db.run('INSERT INTO xp_events(profile_id, amount, reason, ref, local_date, created_at) VALUES (?,?,?,?,?,?)', [profileId, Math.round(amount), reason, ref, today(ctx, at), at]);
  return Math.round(amount);
}

/** Award XP only once per (reason, ref). */
export function awardXpOnce(ctx: ServiceContext, profileId: number, amount: number, reason: string, ref: string): number {
  const exists = ctx.db.get('SELECT id FROM xp_events WHERE profile_id = ? AND reason = ? AND ref = ?', [profileId, reason, ref]);
  return exists ? 0 : awardXp(ctx, profileId, amount, reason, ref);
}

export function totalXp(ctx: ServiceContext, profileId: number): number {
  return Number(ctx.db.get<{ s: number }>('SELECT COALESCE(SUM(amount), 0) AS s FROM xp_events WHERE profile_id = ?', [profileId])!.s);
}

/**
 * Store a graded set's results summary with its assessment row (schema v2), so a later look at the
 * assessment (Parent Dashboard) shows the same strengths, practice list and recommended next step.
 */
export function storeResultsSummary(ctx: ServiceContext, assessmentId: number, r: { didWell: string[]; needsPractice: string[]; nextStep: string }): void {
  ctx.db.run('UPDATE assessments SET summary_json = ? WHERE id = ?', [JSON.stringify({ didWell: r.didWell, needsPractice: r.needsPractice, nextStep: r.nextStep }), assessmentId]);
}

export interface ResultsSummary {
  didWell: string[];
  needsPractice: string[];
  nextStep: string;
}

/** The share of a graded set needed to pass it, by assessment kind (a review or project has no pass mark). */
export function passShare(kind: string, refId: string): number {
  if (kind === 'test-out') return TEST_OUT_PASS;
  if (kind === 'quiz') return LESSON_CONTENT.get(refId)?.mastery.quizPassScore ?? 0.8;
  if (kind === 'unit-assessment' || kind === 'semester-assessment') return ASSESSMENT_PASS;
  return 0;
}

export interface AssessmentRow {
  id: number;
  kind: string;
  ref_id: string;
  attempt_number: number;
  score: number;
  max_score: number;
  items_json: string;
  summary_json: string | null;
}

/**
 * The results summary of a graded assessment row: the one stored with it (schema v2), or, for a row
 * saved before summaries were stored (v0.16, schema v1), rebuilt from its saved answers with the
 * same functions that write it (summarizeSkills, nextStepFor). Both the results page of a day or
 * lesson and the Parent Dashboard's assessment detail read it from here, so they always agree.
 */
export function assessmentSummary(ctx: ServiceContext, profileId: number, a: AssessmentRow): ResultsSummary {
  try {
    const s = a.summary_json ? (JSON.parse(a.summary_json) as ResultsSummary) : null;
    if (s && Array.isArray(s.didWell) && Array.isArray(s.needsPractice) && typeof s.nextStep === 'string') return s;
  } catch {
    /* rebuilt below */
  }
  let stored: Array<{ skillId: string; correct: boolean }> = [];
  try {
    stored = JSON.parse(a.items_json);
  } catch {
    stored = [];
  }
  const name = (s: string) => SKILL_BY_ID.get(s)?.name ?? s;
  const sum = summarizeSkills(stored.map((i) => ({ skill: name(i.skillId), correct: !!i.correct })));
  const share = passShare(a.kind, a.ref_id);
  const passes = (score: number, max: number) => max > 0 && score / max >= share - 1e-9;
  const alreadyPassed =
    (a.kind === 'unit-assessment' || a.kind === 'semester-assessment') &&
    ctx.db
      .all<{ score: number; max_score: number }>("SELECT score, max_score FROM assessments WHERE profile_id = ? AND ref_id = ? AND kind = ? AND status = 'completed' AND attempt_number < ?", [profileId, a.ref_id, a.kind, a.attempt_number])
      .some((r) => passes(Number(r.score), Number(r.max_score)));
  return {
    ...sum,
    nextStep: nextStepFor({ kind: a.kind, passed: passes(a.score, a.max_score), needsPractice: sum.needsPractice, missed: stored.filter((i) => !i.correct).length, attemptNumber: a.attempt_number, alreadyPassed }),
  };
}

/**
 * A day's or lesson's saved results with the summary of the assessment row they came from, so the
 * results page and the Parent Dashboard show the same strengths, practice list and next step (a
 * result saved by v0.16 kept its own wording in the lesson state; the row's summary replaces it).
 */
export function withRowSummary<R extends { kind: string; attemptNumber: number } & ResultsSummary>(ctx: ServiceContext, profileId: number, refId: string, rowKind: string, results: R | null): R | null {
  if (!results) return results;
  const row = ctx.db.get<AssessmentRow>(
    "SELECT id, kind, ref_id, attempt_number, score, max_score, items_json, summary_json FROM assessments WHERE profile_id = ? AND ref_id = ? AND kind = ? AND attempt_number = ? AND status = 'completed' ORDER BY id DESC LIMIT 1",
    [profileId, refId, rowKind, results.attemptNumber],
  );
  if (!row) return results;
  const s = assessmentSummary(ctx, profileId, row);
  return { ...results, didWell: s.didWell, needsPractice: s.needsPractice, nextStep: s.nextStep };
}

export function logActivity(ctx: ServiceContext, profileId: number, type: string, detail: Record<string, unknown>): void {
  const at = ctx.now();
  ctx.db.run('INSERT INTO activity_log(profile_id, type, detail_json, local_date, created_at) VALUES (?,?,?,?,?)', [profileId, type, JSON.stringify(detail), today(ctx, at), at]);
}

const ACTIVITY_TO_EVIDENCE: Record<string, EvidenceActivity> = {
  guided: 'guided',
  independent: 'independent',
  review: 'review',
  quiz: 'quiz',
  assessment: 'assessment',
  diagnostic: 'diagnostic',
  testout: 'testout',
  remediation: 'remediation',
  corrections: 'remediation',
};

export function evidenceFor(ctx: ServiceContext, profileId: number, skillId: string): Evidence[] {
  const rows = ctx.db.all<{ created_at: number; correct: number; activity: string; difficulty: number; max_hint_level: number; attempt_number: number }>(
    'SELECT created_at, correct, activity, difficulty, max_hint_level, attempt_number FROM attempts WHERE profile_id = ? AND skill_id = ? AND counted = 1 ORDER BY created_at, id',
    [profileId, skillId],
  );
  return rows.map((r) => ({
    at: r.created_at,
    correct: !!r.correct,
    activity: ACTIVITY_TO_EVIDENCE[r.activity] ?? 'independent',
    difficulty: Math.min(3, Math.max(1, r.difficulty)) as 1 | 2 | 3,
    maxHintLevel: r.max_hint_level,
    attemptNumber: r.attempt_number,
  }));
}

export function storedStage(ctx: ServiceContext, profileId: number, skillId: string): MasteryStage {
  const r = ctx.db.get<{ stage: MasteryStage }>('SELECT stage FROM skill_state WHERE profile_id = ? AND skill_id = ?', [profileId, skillId]);
  return r?.stage ?? 'NOT_STARTED';
}

/** Recompute a skill from its evidence, store it, and award one-time mastery milestone XP. */
export function recomputeSkill(ctx: ServiceContext, profileId: number, skillId: string): { before: MasteryStage; after: SkillState; xp: number } {
  const before = storedStage(ctx, profileId, skillId);
  const evidence = evidenceFor(ctx, profileId, skillId);
  const after = computeSkillState(evidence);
  // A stage set by the placement check alone is a starting point, not an achievement:
  // milestone XP and the "reached Proficient" feed entry wait for lesson work.
  const placementOnly = evidence.every((e) => e.activity === 'diagnostic');
  ctx.db.run(
    `INSERT INTO skill_state(profile_id, skill_id, stage, score, evidence_count, last_practiced_at, next_review_at, mastered_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)
     ON CONFLICT(profile_id, skill_id) DO UPDATE SET stage=excluded.stage, score=excluded.score, evidence_count=excluded.evidence_count,
       last_practiced_at=excluded.last_practiced_at, next_review_at=excluded.next_review_at, mastered_at=excluded.mastered_at, updated_at=excluded.updated_at`,
    [profileId, skillId, after.stage, after.score, after.evidenceCount, after.lastPracticedAt, after.nextReviewAt, after.masteredAt, ctx.now()],
  );
  let xp = 0;
  if (placementOnly) return { before, after, xp };
  const idx = STAGE_ORDER.indexOf(after.stage);
  if (idx >= STAGE_ORDER.indexOf('PROFICIENT')) xp += awardXpOnce(ctx, profileId, XP_POLICY.skillProficient, 'skill-proficient', skillId);
  if (after.stage === 'MASTERED') xp += awardXpOnce(ctx, profileId, XP_POLICY.skillMastered, 'skill-mastered', skillId);
  if (before !== after.stage && STAGE_ORDER.indexOf(after.stage) > STAGE_ORDER.indexOf(before) && idx >= STAGE_ORDER.indexOf('PROFICIENT')) {
    logActivity(ctx, profileId, 'mastery', { skillId, skill: SKILL_BY_ID.get(skillId)?.name ?? skillId, stage: after.stage });
  }
  return { before, after, xp };
}

export function skillStates(ctx: ServiceContext, profileId: number): Map<string, { stage: MasteryStage; score: number; evidence: number; nextReviewAt: number | null }> {
  const rows = ctx.db.all<{ skill_id: string; stage: MasteryStage; score: number; evidence_count: number; next_review_at: number | null }>(
    'SELECT skill_id, stage, score, evidence_count, next_review_at FROM skill_state WHERE profile_id = ?',
    [profileId],
  );
  return new Map(rows.map((r) => [r.skill_id, { stage: r.stage, score: r.score, evidence: r.evidence_count, nextReviewAt: r.next_review_at }]));
}

/** Activities whose answers are graded all at once at the end (their misses share one timestamp). */
const DEFERRED_ACTIVITIES = ['quiz', 'assessment', 'testout'];

/**
 * Recent answers for the anti-guessing rule ("3 wrong in 30 s"). Deferred quiz, assessment and
 * test-out answers are left out: they are all recorded at the same instant when the set is graded,
 * so they say nothing about how fast the student is answering now.
 */
export function recentAnswers(ctx: ServiceContext, profileId: number, sinceMs: number): Array<{ at: number; correct: boolean }> {
  return ctx.db
    .all<{ created_at: number; correct: number }>(
      `SELECT created_at, correct FROM attempts WHERE profile_id = ? AND created_at >= ? AND status IN ('correct','incorrect') AND activity NOT IN (${DEFERRED_ACTIVITIES.map(() => '?').join(',')}) ORDER BY created_at`,
      [profileId, sinceMs, ...DEFERRED_ACTIVITIES],
    )
    .map((r) => ({ at: r.created_at, correct: !!r.correct }));
}
