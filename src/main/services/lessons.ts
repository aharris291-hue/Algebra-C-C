/**
 * Lesson player (spec §7-§12, §16, §17, §19, §28, §35). The whole lesson state is saved
 * after every action (autosave), so closing the app at any moment resumes exactly.
 */
import crypto from 'node:crypto';
import type { LessonContent, LessonMeta, ProblemRef } from '../../core/curriculum/types';
import { LESSON_CONTENT, LESSON_BY_ID, LESSONS, UNIT_BY_ID, STANDARD_BY_CODE, SKILL_BY_ID, generatorsForSkill, GENERATORS, CAPSTONE_CONTENT } from '../../content';
import { XP_POLICY } from '../../core/engine/xp';
import { MAX_UNIT_ASSESSMENT_ATTEMPTS } from '../../core/engine/grading';
import { isStruggling, STAGE_ORDER } from '../../core/engine/mastery';
import type { LessonView, ResultsView, SectionId, TeachAgainView, CourseUnit, CourseLesson, LessonStatus, SkillChange, OnboardingState } from '../../shared/api';
import { LESSON_SECTIONS } from '../../shared/api';
import { ServiceContext, UserFacingError, today, saveNow } from './context';
import { requireProfile } from './profiles';
import {
  PracticeState,
  newPractice,
  addItems,
  planFromMix,
  reviewRefs,
  submitImmediate,
  submitDeferred,
  gradeDeferred,
  hint,
  reveal,
  practiceView,
  allResolved,
  allAnswered,
  advance,
  findItem,
  getProblem,
} from './practice';
import { recordTeachAgain, bumpDay, awardXp, awardXpOnce, logActivity, skillStates, evidenceFor, storedStage, recomputeSkill } from './records';
import { answerToText } from '../../core/math/answers';
import { checkAchievements } from './achievements';

export interface LessonState {
  v: 1;
  baseSeed: number;
  seedCounter: number;
  mode: 'normal' | 'testout';
  section: SectionId;
  sectionsDone: SectionId[];
  guided: PracticeState | null;
  independent: PracticeState | null;
  quiz: PracticeState | null;
  quizStartedAt: number | null;
  corrections: PracticeState | null;
  results: ResultsView | null;
  quizAttempts: number;
  passed: boolean;
  remediation: { reason: string; skills: string[]; practice: PracticeState; done: boolean } | null;
  teachAgainUsed: string[];
  xp: number;
  testOutResult: { passed: boolean; percent: number } | null;
  /** when independent practice was completed (counts toward the practice-completion grade from then on) */
  practiceCompletedAt?: number | null;
  /** active time spent in the quiz in progress: gaps between actions, each capped (see ACTIVE_GAP_CAP_MS) */
  quizActiveMs?: number;
  quizLastActionAt?: number | null;
  /**
   * Quiz attempts that count toward unlocking the next lesson ("two honest attempts").
   * Missing in states saved by older versions: then every attempt counts, so no one is stranded.
   */
  honestAttempts?: number;
  /** set by retakeQuiz: whether the targeted practice before this retake had a problem the student solved */
  retakeHonest?: boolean;
}

interface ProgressRow {
  status: 'in_progress' | 'completed' | 'tested_out';
  section: string;
  state_json: string;
  quiz_best: number | null;
  started_at: number;
  completed_at: number | null;
}

export const TEST_OUT_PASS = 0.85;
/**
 * Timed activities (quizzes, assessments) record active time, not wall-clock time: each gap
 * between two actions counts up to this much, and a gap that runs backwards (the clock was
 * changed) counts as zero. Closing the app overnight mid-quiz therefore adds at most a few minutes.
 */
export const ACTIVE_GAP_CAP_MS = 10 * 60_000;

/** Add the time since the last action (capped, never negative) to an active-time counter. */
export function tickActive(activeMs: number | undefined, lastAt: number | null | undefined, now: number): { activeMs: number; lastAt: number } {
  const gap = lastAt === null || lastAt === undefined ? 0 : Math.min(ACTIVE_GAP_CAP_MS, Math.max(0, now - lastAt));
  return { activeMs: Math.max(0, activeMs ?? 0) + gap, lastAt: now };
}

/**
 * Write the database to disk right away (assessment results must survive a crash). saveNow never
 * throws: on a disk error the result stays in memory, a retry is scheduled and the UI is warned.
 */
export function flushImmediately(ctx: ServiceContext): void {
  saveNow(ctx);
}

/**
 * Support-practice XP (remediation and corrections answers) is capped per lesson/day so repeating
 * fail -> remediate -> retake cycles can never earn more than passing (see XP_POLICY.supportPracticeXpCap).
 * Call after the answer was recorded; trims the XP just awarded beyond the cap. Returns the XP removed.
 */
export function capSupportXp(ctx: ServiceContext, profileId: number, ref: string, priorTotal: number, sinceXpId: number): number {
  const reasons = ['answer:remediation', 'answer:corrections'];
  const after = supportXp(ctx, profileId, ref);
  const allowed = Math.max(0, XP_POLICY.supportPracticeXpCap - priorTotal);
  let excess = after - priorTotal - allowed;
  if (excess <= 0) return 0;
  const removed = excess;
  const rows = ctx.db.all<{ id: number; amount: number }>(
    `SELECT id, amount FROM xp_events WHERE profile_id = ? AND ref = ? AND id > ? AND reason IN (${reasons.map(() => '?').join(',')}) ORDER BY id DESC`,
    [profileId, ref, sinceXpId, ...reasons],
  );
  for (const r of rows) {
    if (excess <= 0) break;
    const cut = Math.min(excess, r.amount);
    if (cut === r.amount) ctx.db.run('DELETE FROM xp_events WHERE id = ?', [r.id]);
    else ctx.db.run('UPDATE xp_events SET amount = ? WHERE id = ?', [r.amount - cut, r.id]);
    excess -= cut;
  }
  // keep the attempt row's XP in step with the ledger
  const att = ctx.db.get<{ id: number; xp: number }>('SELECT id, xp FROM attempts WHERE profile_id = ? ORDER BY id DESC LIMIT 1', [profileId]);
  if (att) ctx.db.run('UPDATE attempts SET xp = ? WHERE id = ?', [Math.max(0, Number(att.xp) - removed), att.id]);
  return removed;
}

export function supportXp(ctx: ServiceContext, profileId: number, ref: string): number {
  return Number(ctx.db.get<{ s: number }>("SELECT COALESCE(SUM(amount), 0) AS s FROM xp_events WHERE profile_id = ? AND ref = ? AND reason IN ('answer:remediation','answer:corrections')", [profileId, ref])!.s);
}

export function lastXpId(ctx: ServiceContext, profileId: number): number {
  return Number(ctx.db.get<{ m: number | null }>('SELECT MAX(id) AS m FROM xp_events WHERE profile_id = ?', [profileId])!.m ?? 0);
}

/** XP for a graded attempt's answers: only the improvement over the best earlier attempt is paid. */
export function answerXpImprovement(ctx: ServiceContext, profileId: number, reason: string, ref: string, attemptXp: number): number {
  const already = Number(ctx.db.get<{ s: number }>('SELECT COALESCE(SUM(amount), 0) AS s FROM xp_events WHERE profile_id = ? AND reason = ? AND ref = ?', [profileId, reason, ref])!.s);
  return Math.max(0, Math.round(attemptXp) - already);
}

export function lessonMeta(id: string): LessonMeta {
  const m = LESSON_BY_ID.get(id);
  if (!m) throw new UserFacingError('Unknown lesson.');
  return m;
}

function lessonContent(id: string): LessonContent {
  const c = LESSON_CONTENT.get(id);
  if (!c) throw new UserFacingError('This lesson is not available in this version yet.');
  return c;
}

function newSeed(): number {
  return crypto.randomBytes(4).readUInt32LE(0);
}

function loadRow(ctx: ServiceContext, profileId: number, lessonId: string): ProgressRow | undefined {
  return ctx.db.get<ProgressRow>('SELECT status, section, state_json, quiz_best, started_at, completed_at FROM lesson_progress WHERE profile_id = ? AND lesson_id = ?', [profileId, lessonId]);
}

function parseState(row: ProgressRow, lessonId: string, ctx: ServiceContext): LessonState | null {
  try {
    const s = JSON.parse(row.state_json) as LessonState;
    if (s.v !== 1) return null;
    return s;
  } catch (e) {
    ctx.log.error('lessons', `unreadable state for ${lessonId}; starting the lesson fresh`, e);
    return null;
  }
}

function freshState(): LessonState {
  return {
    v: 1,
    baseSeed: newSeed(),
    seedCounter: 0,
    mode: 'normal',
    section: 'goal',
    sectionsDone: [],
    guided: null,
    independent: null,
    quiz: null,
    quizStartedAt: null,
    corrections: null,
    results: null,
    quizAttempts: 0,
    passed: false,
    remediation: null,
    teachAgainUsed: [],
    xp: 0,
    testOutResult: null,
  };
}

function nextSeed(st: LessonState): number {
  return (st.baseSeed ^ Math.imul(++st.seedCounter, 0x9e3779b1)) >>> 0;
}

function save(ctx: ServiceContext, profileId: number, lessonId: string, st: LessonState, status?: 'in_progress' | 'completed' | 'tested_out'): void {
  const row = loadRow(ctx, profileId, lessonId);
  const now = ctx.now();
  if (!row) {
    ctx.db.run('INSERT INTO lesson_progress(profile_id, lesson_id, status, section, state_json, started_at, updated_at) VALUES (?,?,?,?,?,?,?)', [profileId, lessonId, status ?? 'in_progress', st.section, JSON.stringify(st), now, now]);
  } else {
    const newStatus = row.status === 'completed' || row.status === 'tested_out' ? row.status : status ?? row.status;
    ctx.db.run('UPDATE lesson_progress SET status = ?, section = ?, state_json = ?, updated_at = ? WHERE profile_id = ? AND lesson_id = ?', [newStatus, st.section, JSON.stringify(st), now, profileId, lessonId]);
  }
}

// ---------------------------------------------------------------------------
// Availability / course map
// ---------------------------------------------------------------------------

export interface LessonStatusInfo {
  status: LessonStatus;
  quizBest: number | null;
  quizAttempts: number;
  /** attempts that count toward unlocking the next day ("two honest attempts") */
  unlockAttempts: number;
  /** a Show What You Know was already finished for this lesson */
  testOutTried: boolean;
}

export function lessonStatuses(ctx: ServiceContext, profileId: number): Map<string, LessonStatusInfo> {
  const rows = ctx.db.all<{ lesson_id: string; status: string; quiz_best: number | null; state_json: string }>('SELECT lesson_id, status, quiz_best, state_json FROM lesson_progress WHERE profile_id = ?', [profileId]);
  const byId = new Map(rows.map((r) => [r.lesson_id, r]));
  const out = new Map<string, LessonStatusInfo>();
  let prevUnlocks = true; // first lesson is available
  for (const l of LESSONS) {
    const r = byId.get(l.id);
    let attempts = 0;
    let unlockAttempts = 0;
    let testOutTried = false;
    if (r) {
      try {
        const js = JSON.parse(r.state_json) as Partial<LessonState>;
        attempts = js.quizAttempts ?? 0;
        // states from older versions (and review/assessment days) have no honest count: every attempt counts
        unlockAttempts = typeof js.honestAttempts === 'number' ? js.honestAttempts : attempts;
        testOutTried = !!js.testOutResult;
      } catch {
        attempts = 0;
      }
    }
    let status: LessonStatus;
    const hasContent = isLessonPlayable(l);
    if (r && (r.status === 'completed' || r.status === 'tested_out')) status = r.status as LessonStatus;
    else if (r) status = 'in_progress';
    else if (!prevUnlocks) status = 'locked';
    else status = hasContent ? 'available' : 'coming_soon';
    out.set(l.id, { status, quizBest: r?.quiz_best ?? null, quizAttempts: attempts, unlockAttempts, testOutTried });
    // the next lesson unlocks when this one is finished, or after two honest quiz attempts so a student is never stuck
    prevUnlocks = status === 'completed' || status === 'tested_out' || unlockAttempts >= 2;
  }
  return out;
}

export function isLessonPlayable(l: LessonMeta): boolean {
  if (l.kind === 'lesson') return LESSON_CONTENT.has(l.id);
  // a capstone project is playable when its task list exists and every task's generator is in this version
  if (l.kind === 'capstone') {
    const cap = CAPSTONE_CONTENT.get(l.id);
    return !!cap && cap.tasks.length > 0 && cap.tasks.every((t) => GENERATORS.has(t.generator));
  }
  // review/assessment days are assembled from the skills they cover
  return l.skillsAssessed.length > 0 && l.skillsAssessed.every((s) => generatorsForSkill(s).length > 0);
}

function diagnosticTestOuts(onboardingJson: string): Set<string> {
  try {
    const ids = (JSON.parse(onboardingJson) as OnboardingState).diagnosticSummary?.testOutLessonIds;
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

export function getCourse(ctx: ServiceContext, profileId: number): CourseUnit[] {
  const suggested = diagnosticTestOuts(requireProfile(ctx, profileId).onboarding_json);
  const st = lessonStatuses(ctx, profileId);
  const states = skillStates(ctx, profileId);
  const counted = countedAssessmentScores(ctx, profileId);
  const units = new Map<string, CourseUnit>();
  for (const l of LESSONS) {
    const u = UNIT_BY_ID.get(l.unitId)!;
    if (!units.has(u.id)) units.set(u.id, { id: u.id, number: u.number, title: u.title, lessons: [], completedCount: 0, masteryPercent: 0 });
    const s = st.get(l.id)!;
    const prereqOk = l.prerequisites.every((p) => ['completed', 'tested_out'].includes(st.get(p)!.status));
    const cl: CourseLesson = {
      id: l.id,
      title: l.title,
      kind: l.kind,
      week: l.week,
      day: l.day,
      status: s.status,
      hasContent: isLessonPlayable(l),
      // exactly the rule startTestOut enforces: before any quiz attempt and before a finished test-out
      canTestOut:
        l.kind === 'lesson' &&
        LESSON_CONTENT.has(l.id) &&
        s.quizAttempts === 0 &&
        !s.testOutTried &&
        (s.status === 'available' || s.status === 'in_progress' || (s.status === 'locked' && prereqOk)),
      suggestedTestOut: suggested.has(l.id) && s.status !== 'completed' && s.status !== 'tested_out' ? true : undefined,
      // unit/semester assessments show the score that counts toward the grade, not a later practice retake
      quizBest: l.kind === 'unit-assessment' || l.kind === 'semester-assessment' ? (counted.get(l.id) ?? null) : s.quizBest,
      standards: l.standards,
    };
    const unit = units.get(u.id)!;
    unit.lessons.push(cl);
    if (s.status === 'completed' || s.status === 'tested_out') unit.completedCount++;
  }
  for (const unit of units.values()) {
    const skills = LESSONS.filter((l) => l.unitId === unit.id).flatMap((l) => l.skillsTaught);
    const prof = skills.filter((s) => STAGE_ORDER.indexOf(states.get(s)?.stage ?? 'NOT_STARTED') >= STAGE_ORDER.indexOf('PROFICIENT')).length;
    unit.masteryPercent = skills.length ? Math.round((100 * prof) / skills.length) : 0;
  }
  return [...units.values()];
}

/**
 * The graded score of each unit/semester assessment, by the same rule as the course grade:
 * best of the first two attempts for a unit assessment, best attempt for the semester assessment.
 */
function countedAssessmentScores(ctx: ServiceContext, profileId: number): Map<string, number> {
  const rows = ctx.db.all<{ kind: string; ref_id: string; score: number; max_score: number }>(
    "SELECT kind, ref_id, score, max_score FROM assessments WHERE profile_id = ? AND status = 'completed' AND kind IN ('unit-assessment','semester-assessment') AND max_score > 0 ORDER BY finished_at, id",
    [profileId],
  );
  const seen = new Map<string, number>();
  const out = new Map<string, number>();
  for (const r of rows) {
    const n = (seen.get(r.ref_id) ?? 0) + 1;
    seen.set(r.ref_id, n);
    if (r.kind === 'unit-assessment' && n > MAX_UNIT_ASSESSMENT_ATTEMPTS) continue;
    const pct = Math.round((1000 * r.score) / r.max_score) / 10;
    out.set(r.ref_id, Math.max(out.get(r.ref_id) ?? 0, pct));
  }
  return out;
}

function assertCanOpen(ctx: ServiceContext, profileId: number, lessonId: string): void {
  const st = lessonStatuses(ctx, profileId).get(lessonId);
  if (!st) throw new UserFacingError('Unknown lesson.');
  if (st.status === 'locked') throw new UserFacingError('This lesson unlocks after you finish the one before it. You can also try "Show What You Know" to test out.');
  if (st.status === 'coming_soon') throw new UserFacingError('This lesson is not available in this version yet.');
}

// ---------------------------------------------------------------------------
// Opening and navigating
// ---------------------------------------------------------------------------

export function openLesson(ctx: ServiceContext, profileId: number, lessonId: string): LessonView {
  requireProfile(ctx, profileId);
  const meta = lessonMeta(lessonId);
  if (meta.kind !== 'lesson') throw new UserFacingError('Open review and assessment days from the course map.');
  const row = loadRow(ctx, profileId, lessonId);
  let st = row ? parseState(row, lessonId, ctx) : null;
  if (!row) assertCanOpen(ctx, profileId, lessonId);
  lessonContent(lessonId);
  if (!st) {
    st = freshState();
    save(ctx, profileId, lessonId, st);
    logActivity(ctx, profileId, 'lesson-start', { lessonId, title: meta.title });
  }
  return buildView(ctx, profileId, lessonId, st);
}

function withState<T>(ctx: ServiceContext, profileId: number, lessonId: string, fn: (st: LessonState, meta: LessonMeta, content: LessonContent) => T): LessonView {
  requireProfile(ctx, profileId);
  const meta = lessonMeta(lessonId);
  const content = lessonContent(lessonId);
  const row = loadRow(ctx, profileId, lessonId);
  if (!row) throw new UserFacingError('Open the lesson first.');
  const st = parseState(row, lessonId, ctx) ?? freshState();
  ctx.db.transaction(() => {
    // active quiz time: every action while a quiz is open adds the (capped) time since the last one
    if (st.quiz && !st.results && st.quizStartedAt !== null) {
      const t = tickActive(st.quizActiveMs, st.quizLastActionAt ?? st.quizStartedAt, ctx.now());
      st.quizActiveMs = t.activeMs;
      st.quizLastActionAt = t.lastAt;
    }
    fn(st, meta, content);
    markPracticeComplete(ctx, profileId, lessonId, st);
    save(ctx, profileId, lessonId, st);
  });
  return buildView(ctx, profileId, lessonId, st);
}

/** Independent practice counts toward the practice-completion grade as soon as it is complete. */
function markPracticeComplete(ctx: ServiceContext, profileId: number, lessonId: string, st: LessonState): void {
  if (!st.independent?.complete || st.practiceCompletedAt) return;
  st.practiceCompletedAt = ctx.now();
  ctx.db.run('UPDATE lesson_progress SET practice_complete = 1 WHERE profile_id = ? AND lesson_id = ?', [profileId, lessonId]);
}

/** Sections whose completion is real practice work and so counts toward the daily streak (the quiz counts in finishQuiz). */
const STREAK_SECTIONS: SectionId[] = ['guided', 'independent'];

function ensurePractice(ctx: ServiceContext, profileId: number, st: LessonState, meta: LessonMeta, content: LessonContent, section: SectionId): void {
  if (section === 'guided' && !st.guided) {
    st.guided = newPractice('guided', { seedBase: nextSeed(st), hintsAllowed: true });
    addItems(ctx, st.guided, content.guided);
  }
  if (section === 'independent' && !st.independent) {
    const ps = newPractice('independent', { seedBase: nextSeed(st), hintsAllowed: true, requiredCorrect: content.mastery.practiceMinCorrect, extras: 4 });
    const plan: Array<ProblemRef & { review?: boolean }> = planFromMix(content.independent.mix, content.independent.count, ps.seedBase);
    const candidates = LESSONS.filter((l) => l.day < meta.day).flatMap((l) => l.skillsTaught).concat(meta.reviewSkills);
    const review = reviewRefs(skillStates(ctx, profileId), [...new Set(candidates)], content.independent.reviewCount, ctx.now(), ps.seedBase ^ 0x5bd1e995);
    // spread review items through the set
    review.forEach((r, i) => plan.splice(Math.min(plan.length, 2 + i * 3), 0, r));
    ps.pending = plan;
    advance(ctx, ps);
    st.independent = ps;
  }
  if (section === 'quiz' && !st.quiz) startQuiz(ctx, st, content, false);
}

function startQuiz(ctx: ServiceContext, st: LessonState, content: LessonContent, testOut: boolean): void {
  const ps = newPractice(testOut ? 'testout' : 'quiz', { seedBase: nextSeed(st), deferred: true, hintsAllowed: false });
  const items: ProblemRef[] = [...content.quiz.items];
  if (testOut) {
    // two extra, harder items so a test-out shows real mastery
    for (const r of content.quiz.items.slice(0, 2)) items.push({ generator: r.generator, difficulty: 3 });
  }
  addItems(ctx, ps, items);
  st.quiz = ps;
  st.quizStartedAt = ctx.now();
  st.quizActiveMs = 0;
  st.quizLastActionAt = st.quizStartedAt;
  // results from an earlier attempt (e.g. a Show What You Know try) belong to that attempt
  st.results = null;
}

function sectionComplete(st: LessonState, s: SectionId): boolean {
  switch (s) {
    case 'guided':
      return !!st.guided && allResolved(st.guided);
    case 'independent':
      return !!st.independent && st.independent.complete;
    case 'quiz':
      return !!st.results;
    case 'mastery':
      return st.passed;
    default:
      return true;
  }
}

function blockedReason(st: LessonState, s: SectionId): string | undefined {
  if (sectionComplete(st, s)) return undefined;
  switch (s) {
    case 'guided':
      return 'Finish each guided problem first. Use hints whenever you need them.';
    case 'independent':
      return 'Finish the practice set to unlock the quiz.';
    case 'quiz':
      return 'Answer every question, then select Finish quiz.';
    case 'mastery':
      return st.remediation && !st.remediation.done ? 'Finish the targeted practice, then retake the quiz.' : 'Review what you missed, practice, and retake the quiz when you are ready.';
    default:
      return undefined;
  }
}

export function goToSection(ctx: ServiceContext, profileId: number, lessonId: string, section: SectionId): LessonView {
  return withState(ctx, profileId, lessonId, (st, meta, content) => {
    if (!LESSON_SECTIONS.includes(section)) throw new UserFacingError('Unknown section.');
    const target = LESSON_SECTIONS.indexOf(section);
    const furthest = Math.max(LESSON_SECTIONS.indexOf(st.section), ...st.sectionsDone.map((s) => LESSON_SECTIONS.indexOf(s)));
    if (target > furthest) throw new UserFacingError('Finish the current section first.');
    if (st.mode === 'testout' && section !== 'quiz') throw new UserFacingError('Finish the Show What You Know quiz first.');
    // A quiz in progress can't be left to look at the lesson (it would turn into an open-book quiz).
    if (st.section === 'quiz' && !st.results && section !== 'quiz' && st.quiz && st.quiz.items.some((i) => i.state === 'answered')) {
      throw new UserFacingError('Finish the quiz before going back to the lesson.');
    }
    st.section = section;
    ensurePractice(ctx, profileId, st, meta, content, section);
  });
}

export function advanceSection(ctx: ServiceContext, profileId: number, lessonId: string): LessonView {
  return withState(ctx, profileId, lessonId, (st, meta, content) => {
    const cur = st.section;
    if (!sectionComplete(st, cur)) throw new UserFacingError(blockedReason(st, cur) ?? 'Finish this section first.');
    if (!st.sectionsDone.includes(cur)) {
      st.sectionsDone.push(cur);
      // reading pages (goal, instruction, examples...) does not make a streak day; practice does
      if (STREAK_SECTIONS.includes(cur)) bumpDay(ctx, profileId, { sections: 1 });
    }
    const idx = LESSON_SECTIONS.indexOf(cur);
    if (cur === 'summary') {
      finishLessonIfPassed(ctx, profileId, meta, st);
      return;
    }
    const next = LESSON_SECTIONS[idx + 1];
    st.section = next;
    ensurePractice(ctx, profileId, st, meta, content, next);
  });
}

function finishLessonIfPassed(ctx: ServiceContext, profileId: number, meta: LessonMeta, st: LessonState): void {
  if (!st.passed) return;
  const row = loadRow(ctx, profileId, meta.id)!;
  if (row.status === 'completed' || row.status === 'tested_out') return;
  ctx.db.run("UPDATE lesson_progress SET status = 'completed', completed_at = ? WHERE profile_id = ? AND lesson_id = ?", [ctx.now(), profileId, meta.id]);
  st.xp += awardXpOnce(ctx, profileId, XP_POLICY.lessonComplete, 'lesson-complete', meta.id);
  logActivity(ctx, profileId, 'lesson-complete', { lessonId: meta.id, title: meta.title });
  checkAchievements(ctx, profileId);
}

// ---------------------------------------------------------------------------
// Problems
// ---------------------------------------------------------------------------

function activePractice(st: LessonState, key: string): PracticeState {
  const prefix = key.split(':')[0];
  const candidates = [st.guided, st.independent, st.quiz, st.corrections, st.remediation?.practice].filter(Boolean) as PracticeState[];
  const ps = candidates.find((p) => p.activity === prefix && p.items.some((i) => i.key === key));
  if (!ps) throw new UserFacingError('That problem is no longer active.');
  return ps;
}

export function submitAnswer(ctx: ServiceContext, profileId: number, lessonId: string, key: string, response: string, elapsedMs: number): LessonView {
  if (typeof response !== 'string' || response.length > 300) throw new UserFacingError('That answer is too long.');
  return withState(ctx, profileId, lessonId, (st) => {
    const ps = activePractice(st, key);
    if (ps.deferred) {
      if (st.results) throw new UserFacingError('This quiz is already finished.');
      submitDeferred(ps, key, response);
      return;
    }
    const support = ps.activity === 'remediation' || ps.activity === 'corrections';
    const prior = support ? supportXp(ctx, profileId, lessonId) : 0;
    const sinceId = support ? lastXpId(ctx, profileId) : 0;
    const out = submitImmediate(ctx, profileId, lessonId, ps, key, response, elapsedMs);
    if (support) {
      const cut = capSupportXp(ctx, profileId, lessonId, prior, sinceId);
      if (cut) {
        out.xp = Math.max(0, out.xp - cut);
        const item = findItem(ps, key);
        if (item.lastFeedback && typeof item.lastFeedback.xp === 'number') item.lastFeedback.xp = Math.max(0, item.lastFeedback.xp - cut);
      }
    }
    st.xp += out.xp;
    if (out.resolved) afterResolved(ctx, profileId, st, ps);
  });
}

function afterResolved(ctx: ServiceContext, profileId: number, st: LessonState, ps: PracticeState): void {
  if (ps === st.remediation?.practice && allResolved(ps)) {
    st.remediation.done = true;
    ps.complete = true;
  }
  if (ps === st.corrections && allResolved(ps)) ps.complete = true;
  if (ps === st.guided && allResolved(ps)) ps.complete = true;
  checkAchievements(ctx, profileId);
}

export function requestHint(ctx: ServiceContext, profileId: number, lessonId: string, key: string): LessonView {
  return withState(ctx, profileId, lessonId, (st) => hint(ctx, profileId, lessonId, activePractice(st, key), key));
}

export function revealSolution(ctx: ServiceContext, profileId: number, lessonId: string, key: string): LessonView {
  return withState(ctx, profileId, lessonId, (st) => {
    const ps = activePractice(st, key);
    reveal(ctx, profileId, lessonId, ps, key);
    afterResolved(ctx, profileId, st, ps);
  });
}

function weakestRef(ctx: ServiceContext, profileId: number, ps: PracticeState): () => ProblemRef | null {
  return () => {
    const misses = ps.items.filter((i) => i.state !== 'correct');
    const pick = misses.length ? misses[misses.length - 1] : ps.items[0];
    if (!pick) return null;
    return { generator: pick.generatorId, difficulty: Math.max(1, pick.difficulty - 1) as 1 | 2 | 3 };
  };
}

export function nextProblem(ctx: ServiceContext, profileId: number, lessonId: string): LessonView {
  return withState(ctx, profileId, lessonId, (st) => {
    const ps = currentPractice(st);
    if (!ps) throw new UserFacingError('There is no practice set open.');
    advance(ctx, ps, weakestRef(ctx, profileId, ps));
    if (ps === st.remediation?.practice && ps.complete) st.remediation.done = true;
  });
}

export function selectProblem(ctx: ServiceContext, profileId: number, lessonId: string, index: number): LessonView {
  return withState(ctx, profileId, lessonId, (st) => {
    const ps = currentPractice(st);
    if (!ps) throw new UserFacingError('There is no practice set open.');
    if (!Number.isInteger(index) || index < 0 || index >= ps.items.length) throw new UserFacingError('Unknown problem.');
    // in immediate-feedback practice you can look back at finished problems; quizzes allow free movement
    if (!ps.deferred && index > ps.current) throw new UserFacingError('Finish this problem first.');
    ps.current = index;
  });
}

function currentPractice(st: LessonState): PracticeState | null {
  if (st.remediation && !st.remediation.done && st.section === 'mastery') return st.remediation.practice;
  switch (st.section) {
    case 'guided':
      return st.guided;
    case 'independent':
      return st.independent;
    case 'quiz':
      return st.quiz;
    case 'feedback':
      return st.corrections;
    case 'mastery':
      return st.remediation?.practice ?? null;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Quiz, results, remediation, test-out
// ---------------------------------------------------------------------------

export function finishQuiz(ctx: ServiceContext, profileId: number, lessonId: string): LessonView {
  const view = withState(ctx, profileId, lessonId, (st, meta, content) => {
    const ps = st.quiz;
    if (!ps || st.results) throw new UserFacingError('There is no quiz in progress.');
    if (!allAnswered(ps)) {
      const left = ps.items.filter((i) => i.state === 'open').length;
      throw new UserFacingError(`Answer every question first (${left} left).`);
    }
    const testOut = st.mode === 'testout';
    const skills = [...new Set(ps.items.map((i) => i.skillId))];
    const before = new Map(skills.map((s) => [s, storedStage(ctx, profileId, s)]));
    const attemptNumber = testOut ? 1 : st.quizAttempts + 1;
    const startedAt = st.quizStartedAt ?? ctx.now();
    const assessmentId = ctx.db.insert(
      'INSERT INTO assessments(profile_id, kind, ref_id, attempt_number, status, started_at, items_json, skills_json, standards_json, mastery_before_json, local_date) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [profileId, testOut ? 'test-out' : 'quiz', lessonId, attemptNumber, 'in_progress', startedAt, '[]', JSON.stringify(skills), JSON.stringify(meta.standards), JSON.stringify(Object.fromEntries(before)), today(ctx)],
    );
    const graded = gradeDeferred(ctx, profileId, lessonId, ps, assessmentId);
    let attemptXp = 0;
    for (const g of graded) attemptXp += g.xp;
    // a retake pays answer XP only for improving on the best earlier attempt, so failing on purpose
    // and retaking can never farm XP (the total paid for a lesson's quiz answers = its best attempt)
    const answerReason = testOut ? 'answer:testout' : 'answer:quiz';
    let xp = answerXpImprovement(ctx, profileId, answerReason, lessonId, attemptXp);
    if (xp) awardXp(ctx, profileId, xp, answerReason, lessonId);
    const changes: SkillChange[] = [];
    for (const s of skills) {
      const rc = recomputeSkill(ctx, profileId, s);
      xp += rc.xp;
      changes.push({ skillId: s, skillName: SKILL_BY_ID.get(s)?.name ?? s, before: before.get(s)!, after: rc.after.stage, score: Math.round(rc.after.score * 100) / 100 });
    }
    const score = graded.filter((g) => g.correct).length;
    const max = graded.length;
    const percent = Math.round((1000 * score) / max) / 10;
    const pass = testOut ? TEST_OUT_PASS : content.mastery.quizPassScore;
    const passed = score / max >= pass - 1e-9;
    const finishedAt = ctx.now();
    // active time (never negative, overnight gaps excluded), not wall-clock time
    const activeMs = st.quizActiveMs ?? 0;
    const items = graded.map((g, i) => {
      const p = getProblem(g.s.generatorId, g.s.seed, g.s.difficulty);
      return {
        index: i,
        skillId: g.s.skillId,
        skillName: SKILL_BY_ID.get(g.s.skillId)?.name ?? g.s.skillId,
        correct: g.correct,
        response: g.s.lastResponse ?? '',
        correctAnswer: answerToText(p.answer),
        prompt: p.prompt,
        solution: p.solution,
        feedback: g.message,
        misconception: g.misconception,
      };
    });
    ctx.db.run('UPDATE assessments SET status = ?, finished_at = ?, duration_ms = ?, active_ms = ?, score = ?, max_score = ?, items_json = ?, mastery_after_json = ? WHERE id = ?', [
      'completed',
      finishedAt,
      activeMs,
      activeMs,
      score,
      max,
      JSON.stringify(items.map((it) => ({ skillId: it.skillId, correct: it.correct, response: it.response, generatorId: graded[it.index].s.generatorId, seed: graded[it.index].s.seed, difficulty: graded[it.index].s.difficulty, misconception: it.misconception ?? null }))),
      JSON.stringify(Object.fromEntries(changes.map((c) => [c.skillId, c.after]))),
      assessmentId,
    ]);

    const missedSkills = [...new Set(items.filter((i) => !i.correct).map((i) => i.skillId))];
    const didWell = [...new Set(items.filter((i) => i.correct).map((i) => i.skillName))].filter((n) => !missedSkills.map((s) => SKILL_BY_ID.get(s)?.name).includes(n));
    const needsPractice = missedSkills.map((s) => SKILL_BY_ID.get(s)?.name ?? s);

    if (testOut) {
      st.testOutResult = { passed, percent };
      if (passed) {
        xp += awardXpOnce(ctx, profileId, XP_POLICY.testOutPass, 'test-out', lessonId);
        st.passed = true;
        st.sectionsDone = [...LESSON_SECTIONS];
        st.section = 'summary';
        ctx.db.run("UPDATE lesson_progress SET status = 'tested_out', tested_out = 1, completed_at = ?, quiz_best = MAX(COALESCE(quiz_best, 0), ?) WHERE profile_id = ? AND lesson_id = ?", [finishedAt, percent, profileId, lessonId]);
        logActivity(ctx, profileId, 'test-out', { lessonId, title: meta.title, percent });
      } else {
        // no penalty: learn the lesson normally
        st.mode = 'normal';
        st.section = 'goal';
        st.quiz = null;
        st.quizStartedAt = null;
        logActivity(ctx, profileId, 'test-out-try', { lessonId, title: meta.title, percent });
      }
    } else {
      st.quizAttempts = attemptNumber;
      st.passed = st.passed || passed;
      // "two honest attempts" unlock the next lesson. An attempt is honest when the student scored at
      // least half, or solved (not just revealed) at least one problem in the practice before it:
      // hints always lead to a solved problem, so an honest struggling student is never stuck.
      const practiceBefore = attemptNumber === 1 ? solvedAny(st.guided) || solvedAny(st.independent) : !!st.retakeHonest;
      const honest = practiceBefore || score / max >= HONEST_QUIZ_SCORE - 1e-9;
      st.honestAttempts = (st.honestAttempts ?? 0) + (honest ? 1 : 0);
      st.retakeHonest = undefined;
      ctx.db.run('UPDATE lesson_progress SET quiz_best = MAX(COALESCE(quiz_best, 0), ?) WHERE profile_id = ? AND lesson_id = ?', [percent, profileId, lessonId]);
      if (passed) {
        xp += awardXpOnce(ctx, profileId, XP_POLICY.quizPass, 'quiz-pass', lessonId);
        if (percent >= 90) xp += awardXpOnce(ctx, profileId, XP_POLICY.quizExcellentBonus, 'quiz-excellent', lessonId);
      }
      if (!st.sectionsDone.includes('quiz')) st.sectionsDone.push('quiz');
      st.section = 'feedback';
      bumpDay(ctx, profileId, { sections: 1 });
      // corrections: a fresh, similar problem for each miss, with hints
      st.corrections = null;
      const misses = graded.filter((g) => !g.correct);
      if (misses.length) {
        const cps = newPractice('corrections', { seedBase: nextSeed(st), hintsAllowed: true });
        addItems(ctx, cps, misses.map((g) => ({ generator: g.s.generatorId, difficulty: g.s.difficulty })));
        st.corrections = cps;
      }
      st.remediation = null;
      logActivity(ctx, profileId, 'quiz', { lessonId, title: meta.title, percent, passed });
    }
    st.xp += xp;
    const nextStep = testOut
      ? passed
        ? 'You tested out! Move on to the next lesson.'
        : 'No problem. Work through the lesson; it will make the quiz much easier.'
      : passed
        ? missedSkills.length
          ? `Review the corrections for ${needsPractice.join(', ')}, then finish the lesson.`
          : 'Great work. Finish the lesson and move on.'
        : `Use Teach Me Again and the targeted practice on ${needsPractice.join(', ')}, then retake the quiz.`;
    st.results = {
      kind: testOut ? 'test-out' : 'quiz',
      title: testOut ? `Show What You Know: ${meta.title}` : `${meta.title} Quiz`,
      score,
      maxScore: max,
      percent,
      passed,
      passPercent: Math.round(pass * 100),
      durationMs: activeMs,
      attemptNumber,
      items,
      didWell,
      needsPractice,
      nextStep,
      skillChanges: changes,
      xpEarned: xp,
      canRetake: !testOut && !passed,
    };
    st.quizLastActionAt = null;
    checkAchievements(ctx, profileId);
  });
  // ARCHITECTURE.md: assessment results are written to disk immediately, not batched
  flushImmediately(ctx);
  return view;
}

/** Score at which a quiz attempt counts as honest on its own (see finishQuiz). */
export const HONEST_QUIZ_SCORE = 0.5;

function solvedAny(ps: PracticeState | null | undefined): boolean {
  return !!ps && ps.items.some((i) => i.state === 'correct');
}

/** Adaptive remediation (spec §17): targeted easier practice on missed skills, then reassess. */
export function startRemediation(ctx: ServiceContext, profileId: number, lessonId: string): LessonView {
  return withState(ctx, profileId, lessonId, (st) => {
    if (!st.results || st.results.passed) throw new UserFacingError('Remediation is offered after a quiz that needs another try.');
    const missed = st.results.items.filter((i) => !i.correct);
    const skills = [...new Set(missed.map((m) => m.skillId))];
    const ps = newPractice('remediation', { seedBase: nextSeed(st), hintsAllowed: true });
    const refs: ProblemRef[] = [];
    for (const s of skills) {
      // check prerequisite readiness: if the skill is still LEARNING, start at the easiest level
      const stage = storedStage(ctx, profileId, s);
      const quizRefs = st.quiz?.items.filter((i) => i.skillId === s) ?? [];
      const gen = quizRefs[0]?.generatorId ?? generatorsForSkill(s)[0]?.id;
      if (!gen) continue;
      const d = stage === 'LEARNING' || stage === 'NOT_STARTED' ? 1 : Math.max(1, (quizRefs[0]?.difficulty ?? 2) - 1);
      refs.push({ generator: gen, difficulty: d as 1 | 2 | 3 }, { generator: gen, difficulty: Math.min(3, d + 1) as 1 | 2 | 3 });
    }
    addItems(ctx, ps, refs);
    const struggling = skills.some((s) => isStruggling(evidenceFor(ctx, profileId, s)));
    st.remediation = {
      reason: struggling ? 'These skills need a different explanation and some extra practice.' : 'A little targeted practice before the retake.',
      skills,
      practice: ps,
      done: false,
    };
    st.section = 'mastery';
  });
}

export function retakeQuiz(ctx: ServiceContext, profileId: number, lessonId: string): LessonView {
  return withState(ctx, profileId, lessonId, (st, _meta, content) => {
    if (!st.results || st.results.passed) throw new UserFacingError('There is no quiz to retake.');
    if (!st.remediation || !st.remediation.done) throw new UserFacingError('Finish the targeted practice first. It is what makes the retake go better.');
    st.retakeHonest = solvedAny(st.remediation.practice);
    st.results = null;
    st.corrections = null;
    st.remediation = null;
    st.section = 'quiz';
    startQuiz(ctx, st, content, false);
  });
}

export function startTestOut(ctx: ServiceContext, profileId: number, lessonId: string): LessonView {
  requireProfile(ctx, profileId);
  const meta = lessonMeta(lessonId);
  const content = lessonContent(lessonId);
  const row = loadRow(ctx, profileId, lessonId);
  const existing = row ? parseState(row, lessonId, ctx) : null;
  if (existing && (existing.quizAttempts > 0 || existing.testOutResult)) throw new UserFacingError('You have already started this lesson\'s quiz, so finish the lesson instead.');
  const course = getCourse(ctx, profileId).flatMap((u) => u.lessons);
  const cl = course.find((l) => l.id === lessonId);
  if (!cl || !cl.canTestOut) throw new UserFacingError('Show What You Know is available once the lesson before this one is finished.');
  // a Show What You Know already under way is resumed, never re-rolled with new questions
  if (existing && existing.mode === 'testout' && existing.quiz && !existing.results) return buildView(ctx, profileId, lessonId, existing);
  const st = existing ?? freshState();
  st.mode = 'testout';
  st.section = 'quiz';
  st.results = null;
  ctx.db.transaction(() => {
    startQuiz(ctx, st, content, true);
    save(ctx, profileId, lessonId, st);
  });
  logActivity(ctx, profileId, 'test-out-start', { lessonId, title: meta.title });
  return buildView(ctx, profileId, lessonId, st);
}

// ---------------------------------------------------------------------------
// Teach Me Again (spec §11): a different approach each time, tracked, never penalized
// ---------------------------------------------------------------------------

export function teachMeAgain(ctx: ServiceContext, profileId: number, lessonId: string, approach?: string): TeachAgainView {
  requireProfile(ctx, profileId);
  const content = lessonContent(lessonId);
  const row = loadRow(ctx, profileId, lessonId);
  const st = row ? parseState(row, lessonId, ctx) ?? freshState() : freshState();
  let variant = approach ? content.teachMeAgain.find((t) => t.approach === approach) : undefined;
  if (!variant) {
    variant = content.teachMeAgain.find((t) => !st.teachAgainUsed.includes(t.approach)) ?? content.teachMeAgain[st.teachAgainUsed.length % content.teachMeAgain.length];
  }
  st.teachAgainUsed.push(variant.approach);
  ctx.db.transaction(() => {
    recordTeachAgain(ctx, profileId, lessonId, variant!.approach);
    if (row) save(ctx, profileId, lessonId, st);
  });
  return { approach: variant.approach, title: variant.title, blocks: variant.blocks, timesUsedThisLesson: st.teachAgainUsed.length };
}

// ---------------------------------------------------------------------------
// View
// ---------------------------------------------------------------------------

export function buildView(ctx: ServiceContext, profileId: number, lessonId: string, st: LessonState): LessonView {
  const meta = lessonMeta(lessonId);
  const content = lessonContent(lessonId);
  const row = loadRow(ctx, profileId, lessonId);
  const unit = UNIT_BY_ID.get(meta.unitId)!;
  const ps = currentPractice(st);
  const suggestion = (s: { skillId: string; state: string; attempts: number; hintLevel: number }) =>
    s.state === 'open' && s.attempts >= 2 && !(st.teachAgainUsed.length > 0) ? 'Stuck? Teach Me Again explains this a different way.' : undefined;
  const view: LessonView = {
    lessonId,
    title: meta.title,
    unitId: unit.id,
    unitTitle: `Unit ${unit.number}: ${unit.title}`,
    kind: meta.kind,
    week: meta.week,
    day: meta.day,
    durationMinutes: meta.durationMinutes,
    standards: meta.standards.map((c) => ({ code: c, text: STANDARD_BY_CODE.get(c)?.text ?? '' })),
    objectives: meta.objectives,
    status: row?.status ?? 'in_progress',
    section: st.section,
    sections: LESSON_SECTIONS,
    sectionsDone: st.sectionsDone,
    content: {
      goal: content.goal,
      needToKnow: content.needToKnow,
      instruction: content.instruction,
      examples: content.examples,
      vocabulary: content.vocabulary ?? [],
      summary: content.summary,
    },
    teachAgainOptions: content.teachMeAgain.map((t) => ({ approach: t.approach, title: t.title, used: st.teachAgainUsed.includes(t.approach) })),
    practice: ps && ps !== st.corrections && ps !== st.remediation?.practice ? practiceView(ps, suggestion) : null,
    results: st.results,
    corrections: st.corrections ? practiceView(st.corrections) : null,
    remediation: st.remediation ? { active: !st.remediation.done, reason: st.remediation.reason, skills: st.remediation.skills.map((s) => SKILL_BY_ID.get(s)?.name ?? s) } : null,
    xpThisLesson: st.xp,
    canAdvance: sectionComplete(st, st.section) && st.mode !== 'testout' && !(st.section === 'summary' && (row?.status === 'completed' || row?.status === 'tested_out')),
    advanceBlockedReason: blockedReason(st, st.section),
  };
  if (st.section === 'mastery' && st.remediation) view.practice = practiceView(st.remediation.practice, suggestion);
  return view;
}

export function previewKeySafe(lessonId: string, key: string, st: LessonState): boolean {
  try {
    findItem(activePractice(st, key), key);
    return true;
  } catch {
    return false;
  }
}
