/**
 * Review and assessment days (spec §13-§15): unit reviews, checkpoints and cumulative reviews
 * are mixed practice with hints and immediate feedback; unit and semester assessments are
 * graded at the end with no hints, then corrected and (if needed) retaken.
 * Items are assembled from the skills the day assesses, so every Unit's review and test
 * work as soon as that unit's generators exist. Capstone projects (Unit 9) are played the same way
 * as a review: one situation, a fixed sequence of tasks realized from one shared seed, with hints.
 * State autosaves after every action.
 */
import crypto from 'node:crypto';
import type { Difficulty, LessonKind, LessonMeta, ProblemRef } from '../../core/curriculum/types';
import { LESSON_BY_ID, UNIT_BY_ID, STANDARD_BY_CODE, SKILL_BY_ID, GENERATORS, CAPSTONE_CONTENT, generatorsForSkill } from '../../content';
import { XP_POLICY } from '../../core/engine/xp';
import { createRng } from '../../core/engine/rng';
import { summarizeSkills, nextStepFor } from '../../core/engine/results';
import { answerToText } from '../../core/math/answers';
import type { DayView, ResultsView, SkillChange } from '../../shared/api';
import { ServiceContext, UserFacingError, today } from './context';
import { requireProfile } from './profiles';
import { PracticeState, newPractice, realize, submitImmediate, submitDeferred, gradeDeferred, hint, reveal, practiceView, allResolved, allAnswered, advance, getProblem } from './practice';
import { awardXp, awardXpOnce, bumpDay, logActivity, skillStates, storedStage, recomputeSkill, storeResultsSummary, withRowSummary, storeLeftNotes, leftDuringLines, type LeftNote } from './records';
import { lessonStatuses, tickActive, flushImmediately, capSupportXp, supportXp, lastXpId, answerXpImprovement, noteLeftAttempts } from './lessons';
import { MAX_UNIT_ASSESSMENT_ATTEMPTS, ASSESSMENT_PASS } from '../../core/engine/grading';
import { checkAchievements } from './achievements';

export const REVIEW_KINDS: LessonKind[] = ['unit-review', 'checkpoint', 'cumulative-review', 'semester-review'];
export const ASSESSMENT_KINDS: LessonKind[] = ['unit-assessment', 'semester-assessment'];
/** score needed to pass a unit or semester assessment */
export { ASSESSMENT_PASS };
const REVIEW_MAX_ITEMS = 26;

export interface DayState {
  v: 1;
  day: true;
  baseSeed: number;
  seedCounter: number;
  phase: 'overview' | 'practice' | 'results';
  practice: PracticeState | null;
  startedAt: number | null;
  results: ResultsView | null;
  corrections: PracticeState | null;
  /** graded assessment attempts (named like the lesson field so the course map reads it the same way) */
  quizAttempts: number;
  passed: boolean;
  xp: number;
  /** active time in the set in progress (capped gaps between actions; see ACTIVE_GAP_CAP_MS) */
  activeMs?: number;
  lastActionAt?: number | null;
  /** an assessment in progress: what the student left it to look at (open access; see LeftNote) */
  leftDuring?: LeftNote[];
}

export function isReviewKind(k: LessonKind): boolean {
  return REVIEW_KINDS.includes(k);
}
export function isAssessmentKind(k: LessonKind): boolean {
  return ASSESSMENT_KINDS.includes(k);
}
/** Capstone projects play like a review (hints, immediate feedback) but follow their own task list. */
export function isCapstoneKind(k: LessonKind): boolean {
  return k === 'capstone';
}

function dayMeta(id: string): LessonMeta {
  const m = LESSON_BY_ID.get(id);
  if (!m) throw new UserFacingError('Unknown lesson.');
  if (!isReviewKind(m.kind) && !isAssessmentKind(m.kind) && !isCapstoneKind(m.kind)) throw new UserFacingError('This day is not a review, a project or an assessment.');
  return m;
}

function freshState(): DayState {
  return { v: 1, day: true, baseSeed: crypto.randomBytes(4).readUInt32LE(0), seedCounter: 0, phase: 'overview', practice: null, startedAt: null, results: null, corrections: null, quizAttempts: 0, passed: false, xp: 0 };
}

function nextSeed(st: DayState): number {
  return (st.baseSeed ^ Math.imul(++st.seedCounter, 0x9e3779b1)) >>> 0;
}

function load(ctx: ServiceContext, profileId: number, id: string): { status: string; st: DayState } | null {
  const row = ctx.db.get<{ status: string; state_json: string }>('SELECT status, state_json FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?', [profileId, id]);
  if (!row) return null;
  try {
    const st = JSON.parse(row.state_json) as DayState;
    if (st.v === 1 && st.day) return { status: row.status, st };
  } catch (e) {
    ctx.log.error('days', `unreadable state for ${id}; starting fresh`, e);
  }
  return { status: row.status, st: freshState() };
}

function save(ctx: ServiceContext, profileId: number, id: string, st: DayState): void {
  const now = ctx.now();
  const exists = ctx.db.get('SELECT 1 AS x FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?', [profileId, id]);
  if (!exists) ctx.db.run('INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at) VALUES (?,?,?,?,?,?,?)', [profileId, id, 'in_progress', st.phase, JSON.stringify(st), now, now]);
  else ctx.db.run('UPDATE lesson_progress SET section = ?, state_json = ?, updated_at = ? WHERE profile_id = ? AND lesson_id = ?', [st.phase, JSON.stringify(st), now, profileId, id]);
}

function markCompleted(ctx: ServiceContext, profileId: number, meta: LessonMeta): void {
  ctx.db.run("UPDATE lesson_progress SET status = 'completed', completed_at = COALESCE(completed_at, ?) WHERE profile_id = ? AND lesson_id = ? AND status != 'completed'", [ctx.now(), profileId, meta.id]);
}

/** Skills a day covers that have problem generators (for a capstone: the skills its tasks practice). */
function coveredSkills(meta: LessonMeta): string[] {
  const cap = CAPSTONE_CONTENT.get(meta.id);
  if (isCapstoneKind(meta.kind)) return cap ? [...new Set(cap.tasks.map((t) => GENERATORS.get(t.generator)?.skillId).filter((s): s is string => !!s))] : [];
  return meta.skillsAssessed.filter((s) => generatorsForSkill(s).length > 0);
}

// ---------------------------------------------------------------------------
// Building the problem sets
// ---------------------------------------------------------------------------

/**
 * Realize one item that really practices `skillId`. Some generators label harder variants with
 * a neighbouring skill, so try the skill's other generators until the realized skill matches.
 */
function realizeForSkill(ctx: ServiceContext, ps: PracticeState, skillId: string, difficulty: Difficulty, preferred: number, review: boolean) {
  const gens = generatorsForSkill(skillId);
  for (let k = 0; k < gens.length; k++) {
    const g = gens[(preferred + k) % gens.length];
    const item = realize(ctx, ps, { generator: g.id, difficulty, review });
    if (item.skillId === skillId) return item;
  }
  return realize(ctx, ps, { generator: gens[preferred % gens.length].id, difficulty, review });
}

function stageDifficulty(stage: string): Difficulty {
  if (stage === 'MASTERED') return 3;
  if (stage === 'PROFICIENT' || stage === 'DEVELOPING') return 2;
  return 1;
}

function buildReview(ctx: ServiceContext, profileId: number, meta: LessonMeta, st: DayState): PracticeState {
  const ps = newPractice('review', { seedBase: nextSeed(st), hintsAllowed: true });
  const states = skillStates(ctx, profileId);
  const rng = createRng(ps.seedBase);
  const plan: Array<{ skill: string; d: Difficulty; pref: number }> = [];
  const skills = coveredSkills(meta);
  for (const s of skills) plan.push({ skill: s, d: stageDifficulty(states.get(s)?.stage ?? 'NOT_STARTED'), pref: rng.int(0, 7) });
  // weak skills get a second, different problem: below Proficient, or a low recent score
  const weak = skills.filter((s) => {
    const x = states.get(s);
    return !x || x.stage === 'NOT_STARTED' || x.stage === 'LEARNING' || x.stage === 'DEVELOPING' || x.score < 0.75;
  });
  for (const s of weak) if (plan.length < REVIEW_MAX_ITEMS) plan.push({ skill: s, d: Math.min(3, stageDifficulty(states.get(s)?.stage ?? 'NOT_STARTED') + 1) as Difficulty, pref: rng.int(0, 7) + 1 });
  // interleave: mixed practice helps students pick the right method, not just repeat one
  for (const p of rng.shuffle(plan)) ps.items.push(realizeForSkill(ctx, ps, p.skill, p.d, p.pref, true));
  ps.current = 0;
  return ps;
}

function buildCapstone(ctx: ServiceContext, meta: LessonMeta, st: DayState): PracticeState {
  const cap = CAPSTONE_CONTENT.get(meta.id);
  if (!cap) throw new UserFacingError('This project is not available in this version yet.');
  const ps = newPractice('review', { seedBase: nextSeed(st), hintsAllowed: true });
  // one situation for the whole project: every task is realized from the same seed
  const seed = ps.seedBase;
  for (const t of cap.tasks) {
    const item = realize(ctx, ps, { generator: t.generator, difficulty: meta.difficulty, seed });
    if (item.seed !== seed) ctx.log.warn('days', `${t.generator} needed a different seed in ${meta.id}; its numbers may not match the other parts`);
    ps.items.push(item);
  }
  ps.current = 0;
  return ps;
}

function buildAssessment(ctx: ServiceContext, meta: LessonMeta, st: DayState): PracticeState {
  const ps = newPractice('assessment', { seedBase: nextSeed(st), deferred: true, hintsAllowed: false });
  const rng = createRng(ps.seedBase);
  const items: Array<{ skill: string; d: Difficulty; pref: number }> = [];
  for (const s of coveredSkills(meta)) {
    const pref = rng.int(0, 7);
    items.push({ skill: s, d: 2, pref });
    // essential skills get a second, harder item from a different problem type when one exists
    if (SKILL_BY_ID.get(s)?.essential) items.push({ skill: s, d: 3, pref: pref + 1 });
  }
  for (const it of items) ps.items.push(realizeForSkill(ctx, ps, it.skill, it.d, it.pref, false));
  ps.current = 0;
  return ps;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function withDay(ctx: ServiceContext, profileId: number, id: string, fn: (st: DayState, meta: LessonMeta, status: string) => void): DayView {
  requireProfile(ctx, profileId);
  const meta = dayMeta(id);
  const loaded = load(ctx, profileId, id);
  if (!loaded) throw new UserFacingError('Open this day from the course map first.');
  ctx.db.transaction(() => {
    const st = loaded.st;
    if (st.phase === 'practice' && st.startedAt !== null) {
      const t = tickActive(st.activeMs, st.lastActionAt ?? st.startedAt, ctx.now());
      st.activeMs = t.activeMs;
      st.lastActionAt = t.lastAt;
    }
    fn(st, meta, loaded.status);
    save(ctx, profileId, id, st);
  });
  return buildDayView(ctx, profileId, id, loaded.st);
}

/**
 * Open access (owner request 2026-10-13): any review, project or assessment day can be opened and
 * started at any time, in any order (an assessment before its lessons or review too). Opening a
 * review or project while a quiz or assessment is in progress elsewhere is noted on that attempt.
 */
export function openDay(ctx: ServiceContext, profileId: number, id: string): DayView {
  requireProfile(ctx, profileId);
  const meta = dayMeta(id);
  const loaded = load(ctx, profileId, id);
  if (!isAssessmentKind(meta.kind)) ctx.db.transaction(() => noteLeftAttempts(ctx, profileId, { ref: id, what: isCapstoneKind(meta.kind) ? 'opened the project' : 'opened the review', at: ctx.now() }, id));
  if (!loaded) {
    const s = lessonStatuses(ctx, profileId).get(id);
    if (!s) throw new UserFacingError('Unknown lesson.');
    if (s.status === 'coming_soon') throw new UserFacingError('This day is not available in this version yet.');
    const st = freshState();
    save(ctx, profileId, id, st);
    logActivity(ctx, profileId, 'lesson-start', { lessonId: id, title: meta.title });
    return buildDayView(ctx, profileId, id, st);
  }
  return buildDayView(ctx, profileId, id, loaded.st);
}

export function startDay(ctx: ServiceContext, profileId: number, id: string): DayView {
  return withDay(ctx, profileId, id, (st, meta) => {
    if (st.phase !== 'overview') return;
    if (coveredSkills(meta).length === 0) throw new UserFacingError('This day has no problems available yet.');
    st.practice = isAssessmentKind(meta.kind) ? buildAssessment(ctx, meta, st) : isCapstoneKind(meta.kind) ? buildCapstone(ctx, meta, st) : buildReview(ctx, profileId, meta, st);
    st.startedAt = ctx.now();
    st.activeMs = 0;
    st.lastActionAt = st.startedAt;
    st.leftDuring = [];
    st.phase = 'practice';
  });
}

function activeSet(st: DayState, key: string): PracticeState {
  const prefix = key.split(':')[0];
  const ps = [st.practice, st.corrections].find((p) => p && p.activity === prefix && p.items.some((i) => i.key === key));
  if (!ps) throw new UserFacingError('That problem is no longer active.');
  return ps;
}

/** The set the student is working in right now. */
function currentSet(st: DayState): PracticeState | null {
  if (st.phase === 'practice') return st.practice;
  if (st.phase === 'results') return st.corrections;
  return null;
}

export function daySubmit(ctx: ServiceContext, profileId: number, id: string, key: string, response: string, elapsedMs: number, stepIndex?: number): DayView {
  if (typeof response !== 'string' || response.length > 300) throw new UserFacingError('That answer is too long.');
  return withDay(ctx, profileId, id, (st) => {
    const ps = activeSet(st, key);
    if (ps.deferred) {
      if (st.phase !== 'practice') throw new UserFacingError('This assessment is already finished.');
      submitDeferred(ps, key, response);
      return;
    }
    const support = ps === st.corrections;
    const prior = support ? supportXp(ctx, profileId, id) : 0;
    const sinceId = support ? lastXpId(ctx, profileId) : 0;
    const out = submitImmediate(ctx, profileId, id, ps, key, response, elapsedMs, stepIndex);
    if (support) {
      // correction XP is capped per day so failing and retaking an assessment cannot farm XP
      const cut = capSupportXp(ctx, profileId, id, prior, sinceId);
      if (cut) {
        out.xp = Math.max(0, out.xp - cut);
        const item = ps.items.find((i) => i.key === key);
        if (item?.lastFeedback && typeof item.lastFeedback.xp === 'number') item.lastFeedback.xp = Math.max(0, item.lastFeedback.xp - cut);
      }
    }
    st.xp += out.xp;
    if (out.resolved && ps === st.corrections && allResolved(ps)) ps.complete = true;
    if (out.resolved) checkAchievements(ctx, profileId);
  });
}

export function dayHint(ctx: ServiceContext, profileId: number, id: string, key: string): DayView {
  return withDay(ctx, profileId, id, (st) => hint(ctx, profileId, id, activeSet(st, key), key));
}

export function dayReveal(ctx: ServiceContext, profileId: number, id: string, key: string): DayView {
  return withDay(ctx, profileId, id, (st) => {
    const ps = activeSet(st, key);
    reveal(ctx, profileId, id, ps, key);
    if (ps === st.corrections && allResolved(ps)) ps.complete = true;
  });
}

export function dayNext(ctx: ServiceContext, profileId: number, id: string): DayView {
  return withDay(ctx, profileId, id, (st) => {
    const ps = currentSet(st);
    if (!ps) throw new UserFacingError('There is no practice set open.');
    advance(ctx, ps);
  });
}

export function daySelect(ctx: ServiceContext, profileId: number, id: string, index: number): DayView {
  return withDay(ctx, profileId, id, (st) => {
    const ps = currentSet(st);
    if (!ps) throw new UserFacingError('There is no practice set open.');
    if (!Number.isInteger(index) || index < 0 || index >= ps.items.length) throw new UserFacingError('Unknown problem.');
    if (!ps.deferred && index > ps.current) throw new UserFacingError('Finish this problem first.');
    ps.current = index;
  });
}

function skillName(s: string): string {
  return SKILL_BY_ID.get(s)?.name ?? s;
}

/** Finish the day: grade an assessment, or close out a finished review set. */
export function finishDay(ctx: ServiceContext, profileId: number, id: string): DayView {
  const view = withDay(ctx, profileId, id, (st, meta) => {
    const ps = st.practice;
    if (st.phase !== 'practice' || !ps) throw new UserFacingError('There is nothing to finish right now.');
    const assessment = isAssessmentKind(meta.kind);
    if (assessment && !allAnswered(ps)) throw new UserFacingError(`Answer every question first (${ps.items.filter((i) => i.state === 'open').length} left).`);
    if (!assessment && !(ps.complete || allResolved(ps))) throw new UserFacingError(isCapstoneKind(meta.kind) ? 'Finish every part of the project first.' : 'Finish every review problem first.');
    const skills = [...new Set(ps.items.map((i) => i.skillId))];
    const before = new Map(skills.map((s) => [s, storedStage(ctx, profileId, s)]));
    const attemptNumber = assessment ? st.quizAttempts + 1 : 1 + Number(ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM assessments WHERE profile_id = ? AND ref_id = ? AND status = ?', [profileId, id, 'completed'])!.n);
    const startedAt = st.startedAt ?? ctx.now();
    const assessmentId = ctx.db.insert(
      'INSERT INTO assessments(profile_id, kind, ref_id, attempt_number, status, started_at, items_json, skills_json, standards_json, mastery_before_json, local_date) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [profileId, meta.kind, id, attemptNumber, 'in_progress', startedAt, '[]', JSON.stringify(skills), JSON.stringify(meta.standards), JSON.stringify(Object.fromEntries(before)), today(ctx)],
    );
    let xp = 0;
    let rows: Array<{ s: (typeof ps.items)[number]; correct: boolean; message?: string; misconception?: string }>;
    const wasPassed = st.passed;
    if (assessment) {
      const graded = gradeDeferred(ctx, profileId, id, ps, assessmentId);
      let attemptXp = 0;
      for (const g of graded) attemptXp += g.xp;
      // no answer XP once the assessment is passed; before that, a retake pays only for improving
      // on the best earlier attempt (so repeated retakes cannot farm XP)
      xp = wasPassed ? 0 : answerXpImprovement(ctx, profileId, 'answer:assessment', id, attemptXp);
      if (xp) awardXp(ctx, profileId, xp, 'answer:assessment', id);
      rows = graded;
    } else {
      // a review is scored by first-try, no-hint answers: it shows where to focus, it is not a grade
      rows = ps.items.map((s) => ({ s, correct: s.state === 'correct' && s.attempts === 0 && s.maxHintLevel === 0, message: s.state === 'correct' ? (s.attempts || s.maxHintLevel ? 'Correct, with some help or a second try.' : undefined) : 'You saw the full solution for this one.' }));
    }
    const changes: SkillChange[] = [];
    for (const s of skills) {
      const rc = recomputeSkill(ctx, profileId, s);
      xp += rc.xp;
      changes.push({ skillId: s, skillName: skillName(s), before: before.get(s)!, after: rc.after.stage, score: Math.round(rc.after.score * 100) / 100 });
    }
    const score = rows.filter((r) => r.correct).length;
    const max = rows.length;
    const percent = Math.round((1000 * score) / max) / 10;
    const passed = assessment ? score / max >= ASSESSMENT_PASS - 1e-9 : true;
    const finishedAt = ctx.now();
    // active time (never negative, overnight gaps excluded), not wall-clock time
    const activeMs = st.activeMs ?? 0;
    const items = rows.map((r, i) => {
      const p = getProblem(r.s.generatorId, r.s.seed, r.s.difficulty);
      return { index: i, skillId: r.s.skillId, skillName: skillName(r.s.skillId), correct: r.correct, response: r.s.lastResponse ?? '', correctAnswer: answerToText(p.answer), prompt: p.prompt, solution: p.solution, feedback: r.message, misconception: r.misconception };
    });
    ctx.db.run('UPDATE assessments SET status = ?, finished_at = ?, duration_ms = ?, active_ms = ?, score = ?, max_score = ?, items_json = ?, mastery_after_json = ? WHERE id = ?', [
      'completed',
      finishedAt,
      activeMs,
      activeMs,
      score,
      max,
      JSON.stringify(rows.map((r) => ({ skillId: r.s.skillId, correct: r.correct, response: r.s.lastResponse ?? '', generatorId: r.s.generatorId, seed: r.s.seed, difficulty: r.s.difficulty, misconception: r.misconception ?? null }))),
      JSON.stringify(Object.fromEntries(changes.map((c) => [c.skillId, c.after]))),
      assessmentId,
    ]);
    const summary = summarizeSkills(items.map((i) => ({ skill: i.skillId, correct: i.correct })));
    const missed = summary.needsPractice;
    const didWell = summary.didWell.map(skillName);
    const needsPractice = missed.map(skillName);

    if (assessment) {
      st.quizAttempts = attemptNumber;
      st.passed = st.passed || passed;
      // quiz_best holds the score that counts toward the grade: a unit assessment's later practice retakes don't
      if (countsTowardGrade(meta.kind, attemptNumber)) ctx.db.run('UPDATE lesson_progress SET quiz_best = MAX(COALESCE(quiz_best, 0), ?) WHERE profile_id = ? AND lesson_id = ?', [percent, profileId, id]);
      st.corrections = null;
      const misses = rows.filter((r) => !r.correct);
      if (misses.length) {
        const cps = newPractice('corrections', { seedBase: nextSeed(st), hintsAllowed: true });
        for (const m of misses) cps.items.push(realize(ctx, cps, { generator: m.s.generatorId, difficulty: Math.max(1, m.s.difficulty - 1) as Difficulty }));
        st.corrections = cps;
      }
      if (passed) {
        markCompleted(ctx, profileId, meta);
        xp += awardXpOnce(ctx, profileId, XP_POLICY.unitAssessmentComplete, 'assessment-pass', id);
      }
      logActivity(ctx, profileId, 'assessment', { lessonId: id, title: meta.title, percent, passed, attempt: attemptNumber });
    } else {
      markCompleted(ctx, profileId, meta);
      xp += awardXpOnce(ctx, profileId, XP_POLICY.lessonComplete, 'lesson-complete', id);
      logActivity(ctx, profileId, isCapstoneKind(meta.kind) ? 'project' : 'review', { lessonId: id, title: meta.title, percent });
    }
    bumpDay(ctx, profileId, { sections: 1 });
    st.xp += xp;
    const practiceRetake = assessment && !countsTowardGrade(meta.kind, attemptNumber);
    st.results = {
      kind: assessment ? (meta.kind === 'semester-assessment' ? 'semester-assessment' : 'unit-assessment') : 'review',
      title: practiceRetake ? `${meta.title} (practice retake, not graded)` : meta.title,
      score,
      maxScore: max,
      percent,
      passed,
      passPercent: assessment ? Math.round(ASSESSMENT_PASS * 100) : 0,
      durationMs: activeMs,
      attemptNumber,
      items,
      didWell,
      needsPractice,
      nextStep: nextStepFor({ kind: meta.kind, passed, needsPractice, missed: rows.filter((r) => !r.correct).length, attemptNumber, alreadyPassed: assessment && wasPassed }),
      skillChanges: changes,
      xpEarned: xp,
      canRetake: assessment,
    };
    // the summary is stored with the row, so the Parent Dashboard shows the same next step later
    storeResultsSummary(ctx, assessmentId, st.results);
    // what the student left the assessment to look at: stored with the row for the parent (not a penalty)
    if (assessment) {
      storeLeftNotes(ctx, assessmentId, st.leftDuring);
      const left = leftDuringLines(st.leftDuring);
      if (left.length) st.results.leftDuring = left;
    }
    st.leftDuring = [];
    st.phase = 'results';
    st.lastActionAt = null;
    checkAchievements(ctx, profileId);
  });
  // ARCHITECTURE.md: assessment results are written to disk immediately, not batched
  flushImmediately(ctx);
  return view;
}

/** Whether this attempt can count toward the course grade (grading.ts: unit = first two, semester = all). */
function countsTowardGrade(kind: LessonKind, attemptNumber: number): boolean {
  return kind !== 'unit-assessment' || attemptNumber <= MAX_UNIT_ASSESSMENT_ATTEMPTS;
}

export function retakeDay(ctx: ServiceContext, profileId: number, id: string): DayView {
  return withDay(ctx, profileId, id, (st, meta) => {
    if (!isAssessmentKind(meta.kind)) throw new UserFacingError('Only assessments can be retaken. Open the lessons to review again.');
    if (st.phase !== 'results') throw new UserFacingError('Finish the assessment first.');
    if (st.corrections && !allResolved(st.corrections)) throw new UserFacingError('Finish the corrections first. They are what make the retake go better.');
    st.results = null;
    st.corrections = null;
    st.practice = buildAssessment(ctx, meta, st);
    st.startedAt = ctx.now();
    st.activeMs = 0;
    st.lastActionAt = st.startedAt;
    st.leftDuring = [];
    st.phase = 'practice';
  });
}

// ---------------------------------------------------------------------------
// View
// ---------------------------------------------------------------------------

export function buildDayView(ctx: ServiceContext, profileId: number, id: string, st: DayState): DayView {
  const meta = dayMeta(id);
  const unit = UNIT_BY_ID.get(meta.unitId)!;
  const status = ctx.db.get<{ status: string }>('SELECT status FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?', [profileId, id])?.status ?? 'in_progress';
  const states = skillStates(ctx, profileId);
  const assessment = isAssessmentKind(meta.kind);
  const skills = coveredSkills(meta).map((s) => ({ skillId: s, name: skillName(s), stage: states.get(s)?.stage ?? 'NOT_STARTED', essential: !!SKILL_BY_ID.get(s)?.essential }));
  const ps = currentSet(st);
  const correctionsOpen = !!st.corrections && !allResolved(st.corrections);
  const cap = isCapstoneKind(meta.kind) ? CAPSTONE_CONTENT.get(id) : undefined;
  return {
    lessonId: id,
    title: meta.title,
    kind: meta.kind,
    mode: assessment ? 'assessment' : 'review',
    unitTitle: `Unit ${unit.number}: ${unit.title}`,
    week: meta.week,
    day: meta.day,
    durationMinutes: meta.durationMinutes,
    standards: meta.standards.map((c) => ({ code: c, text: STANDARD_BY_CODE.get(c)?.text ?? '' })),
    objectives: meta.objectives,
    status: status as DayView['status'],
    phase: st.phase,
    skills,
    itemCount: st.practice?.items.length ?? (assessment ? skills.reduce((a, s) => a + (s.essential ? 2 : 1), 0) : cap ? cap.tasks.length : null),
    project: cap ? { goal: cap.goal, intro: cap.intro, plan: cap.plan, parts: cap.tasks.map((t) => t.part), wrapUp: cap.wrapUp } : undefined,
    passPercent: assessment ? Math.round(ASSESSMENT_PASS * 100) : null,
    practice: st.phase === 'practice' && ps ? practiceView(ps) : null,
    results: withRowSummary(ctx, profileId, id, meta.kind, st.results),
    corrections: st.phase === 'results' && st.corrections ? practiceView(st.corrections) : null,
    attempts: st.quizAttempts,
    canRetake: assessment && st.phase === 'results' && !correctionsOpen,
    retakeBlockedReason: assessment && st.phase === 'results' && correctionsOpen ? 'Finish the corrections first.' : undefined,
    startedAt: st.startedAt,
    xpThisDay: st.xp,
  };
}

/** Problem refs a day would use (for tests and the parent's curriculum view). */
export function dayPlanSkills(id: string): string[] {
  return coveredSkills(dayMeta(id));
}

export type { ProblemRef };
