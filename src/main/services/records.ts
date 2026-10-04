/** Writing learning records and deriving per-skill state. All other services go through here. */
import { ServiceContext, today } from './context';
import { computeSkillState, Evidence, EvidenceActivity, MasteryStage, SkillState, STAGE_ORDER } from '../../core/engine/mastery';
import { dayQualifies } from '../../core/engine/dates';
import { XP_POLICY } from '../../core/engine/xp';
import { SKILL_BY_ID } from '../../content';

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
  bumpDay(ctx, a.profileId, { problems: 1 });
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

export function addStudyTime(ctx: ServiceContext, profileId: number, lessonId: string | null, activity: string, seconds: number): void {
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
  const after = computeSkillState(evidenceFor(ctx, profileId, skillId));
  ctx.db.run(
    `INSERT INTO skill_state(profile_id, skill_id, stage, score, evidence_count, last_practiced_at, next_review_at, mastered_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)
     ON CONFLICT(profile_id, skill_id) DO UPDATE SET stage=excluded.stage, score=excluded.score, evidence_count=excluded.evidence_count,
       last_practiced_at=excluded.last_practiced_at, next_review_at=excluded.next_review_at, mastered_at=excluded.mastered_at, updated_at=excluded.updated_at`,
    [profileId, skillId, after.stage, after.score, after.evidenceCount, after.lastPracticedAt, after.nextReviewAt, after.masteredAt, ctx.now()],
  );
  let xp = 0;
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

/** Recent answers (for anti-guessing). */
export function recentAnswers(ctx: ServiceContext, profileId: number, sinceMs: number): Array<{ at: number; correct: boolean }> {
  return ctx.db
    .all<{ created_at: number; correct: number }>("SELECT created_at, correct FROM attempts WHERE profile_id = ? AND created_at >= ? AND status IN ('correct','incorrect') ORDER BY created_at", [profileId, sinceMs])
    .map((r) => ({ at: r.created_at, correct: !!r.correct }));
}
