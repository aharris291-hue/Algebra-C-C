/**
 * Diagnostic (placement) assessment (spec §33-§34). Offered after the first profile is created.
 * It checks the earlier-grade prerequisite skills and probes a few key course skills, one
 * question at a time with no hints and no right/wrong feedback, and decides each skill on
 * enough evidence that a single slip never decides it:
 *   - prerequisite skill: a first correct answer shows it; after a miss, two more answers are
 *     needed to agree (miss, miss = needs work; miss, right = a third question decides);
 *   - course skill: two correct answers show it; two misses mean it is still to learn; a split
 *     goes to a third question.
 * A student can say "I haven't learned this yet": that skill is marked not learned and no wrong
 * answer is recorded. Every answer counts as diagnostic evidence for mastery. A parent can skip
 * the diagnostic with the Parent PIN. State autosaves after every answer, so it can be paused.
 */
import crypto from 'node:crypto';
import type { Difficulty } from '../../core/curriculum/types';
import { LESSONS, PREREQ_SKILLS, SKILL_BY_ID, generatorsForSkill } from '../../content';
import { checkAnswer } from '../../core/math/answers';
import { xpForAnswer } from '../../core/engine/xp';
import { deriveSeed } from '../../core/engine/rng';
import type { DiagnosticSkillResult, DiagnosticSummary, DiagnosticVerdict, DiagnosticView, OnboardingState } from '../../shared/api';
import { ServiceContext, UserFacingError } from './context';
import { requireProfile } from './profiles';
import { PracticeState, ProblemState, newPractice, realize, getProblem, problemView, practiceView, submitImmediate, hint, reveal, advance, allResolved } from './practice';
import { awardXp, logActivity, recomputeSkill, recordAttempt, recentAnswers, bumpDay } from './records';
import { lessonStatuses } from './lessons';

/** Course skills the diagnostic probes: the foundations of Units 1-3 and 5 a student may already know. */
export const COURSE_PROBES = ['S1.02', 'S1.05', 'S1.07', 'S1.09', 'S1.12', 'S2.01', 'S3.03', 'S5.01'];
/** Most questions any one skill can take (the third breaks a tie). */
export const MAX_PER_SKILL = 3;
const REVIEW_PER_SKILL = 2;
const REVIEW_MAX_ITEMS = 12;
/** difficulty of the 1st, 2nd and 3rd question on a skill */
const PREREQ_DIFFICULTY: Difficulty[] = [2, 1, 2];
const COURSE_DIFFICULTY: Difficulty[] = [2, 2, 2];

interface SkillRun {
  skillId: string;
  group: 'prereq' | 'course';
  answers: boolean[];
  notLearned: boolean;
  /** rotates through the skill's generators so follow-up questions are a different type */
  pref: number;
}

interface DiagnosticRun {
  v: 1;
  phase: 'questions' | 'results' | 'review';
  baseSeed: number;
  seedCounter: number;
  skills: SkillRun[];
  /** index of the skill being asked */
  cursor: number;
  ps: PracticeState;
  startedAt: number;
  review: PracticeState | null;
}

type StoredOnboarding = OnboardingState & { diagnosticRun?: DiagnosticRun };

// ---------------------------------------------------------------------------
// The evidence rule (pure, exported for tests)
// ---------------------------------------------------------------------------

/** The verdict for a skill's answers so far, or null when another question is needed. */
export function decideSkill(group: 'prereq' | 'course', answers: boolean[], notLearned = false): DiagnosticVerdict | null {
  if (notLearned) return 'not-learned';
  if (group === 'prereq' && answers[0] === true) return 'strong';
  const right = answers.filter((a) => a).length;
  const wrong = answers.length - right;
  if (right >= 2) return 'strong';
  if (wrong >= 2) return 'needs-work';
  if (answers.length >= MAX_PER_SKILL) return right > wrong ? 'strong' : 'needs-work';
  return null;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

function readOnboarding(ctx: ServiceContext, profileId: number): StoredOnboarding {
  const row = requireProfile(ctx, profileId);
  try {
    return JSON.parse(row.onboarding_json) as StoredOnboarding;
  } catch (e) {
    ctx.log.error('diagnostic', 'unreadable onboarding state; starting fresh', e);
    return {};
  }
}

function writeOnboarding(ctx: ServiceContext, profileId: number, o: StoredOnboarding): void {
  ctx.db.run('UPDATE profiles SET onboarding_json = ? WHERE id = ?', [JSON.stringify(o), profileId]);
}

function validRun(r: DiagnosticRun | undefined): DiagnosticRun | null {
  return r && r.v === 1 && Array.isArray(r.skills) && r.ps ? r : null;
}

function status(o: StoredOnboarding): DiagnosticView['status'] {
  return o.diagnostic ?? 'offered';
}

// ---------------------------------------------------------------------------
// Building the run
// ---------------------------------------------------------------------------

/** Skills the diagnostic covers, in the order it asks them: prerequisites first, then course skills. */
export function diagnosticPlan(): Array<{ skillId: string; group: 'prereq' | 'course' }> {
  const pre = PREREQ_SKILLS.filter((s) => generatorsForSkill(s.id).length > 0).map((s) => ({ skillId: s.id, group: 'prereq' as const }));
  const course = COURSE_PROBES.filter((s) => generatorsForSkill(s).length > 0).map((s) => ({ skillId: s, group: 'course' as const }));
  return [...pre, ...course];
}

function nextItem(ctx: ServiceContext, run: DiagnosticRun): void {
  const sk = run.skills[run.cursor];
  const k = sk.answers.length;
  const difficulty = (sk.group === 'prereq' ? PREREQ_DIFFICULTY : COURSE_DIFFICULTY)[Math.min(k, MAX_PER_SKILL - 1)];
  const gens = generatorsForSkill(sk.skillId);
  // some generators label harder variants with a neighbouring skill: keep the one that matches
  let item: ProblemState | null = null;
  for (let j = 0; j < gens.length && !item; j++) {
    const cand = realize(ctx, run.ps, { generator: gens[(sk.pref + k + j) % gens.length].id, difficulty });
    if (cand.skillId === sk.skillId) item = cand;
  }
  if (!item) item = realize(ctx, run.ps, { generator: gens[(sk.pref + k) % gens.length].id, difficulty });
  run.ps.items.push(item);
  run.ps.current = run.ps.items.length - 1;
}

function newRun(ctx: ServiceContext): DiagnosticRun {
  const baseSeed = crypto.randomBytes(4).readUInt32LE(0);
  const plan = diagnosticPlan();
  if (!plan.length) throw new UserFacingError('The diagnostic is not available in this version.');
  const run: DiagnosticRun = {
    v: 1,
    phase: 'questions',
    baseSeed,
    seedCounter: 0,
    skills: plan.map((p, i) => ({ ...p, answers: [], notLearned: false, pref: deriveSeed(baseSeed, 1000 + i) % 8 })),
    cursor: 0,
    ps: newPractice('diagnostic', { seedBase: deriveSeed(baseSeed, 1), deferred: true, hintsAllowed: false }),
    startedAt: ctx.now(),
    review: null,
  };
  nextItem(ctx, run);
  return run;
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

function teachingLesson(skillId: string) {
  return LESSONS.find((l) => l.kind === 'lesson' && l.skillsTaught.includes(skillId));
}

function summarize(ctx: ServiceContext, profileId: number, run: DiagnosticRun): DiagnosticSummary {
  const skills: DiagnosticSkillResult[] = run.skills.map((s) => {
    const lesson = s.group === 'course' ? teachingLesson(s.skillId) : undefined;
    return {
      skillId: s.skillId,
      name: SKILL_BY_ID.get(s.skillId)?.name ?? s.skillId,
      group: s.group,
      verdict: decideSkill(s.group, s.answers, s.notLearned) ?? 'needs-work',
      correct: s.answers.filter((a) => a).length,
      answered: s.answers.length,
      lessonId: lesson?.id,
      lessonTitle: lesson?.title,
    };
  });
  const statuses = lessonStatuses(ctx, profileId);
  const firstOpen = LESSONS.find((l) => {
    const st = statuses.get(l.id)?.status;
    return st === 'available' || st === 'in_progress';
  }) ?? LESSONS[0];
  const testOut = [...new Set(skills.filter((s) => s.group === 'course' && s.verdict === 'strong' && s.lessonId).map((s) => s.lessonId!))].sort(
    (a, b) => LESSONS.findIndex((l) => l.id === a) - LESSONS.findIndex((l) => l.id === b),
  );
  const weakPre = skills.filter((s) => s.group === 'prereq' && s.verdict !== 'strong');
  const strongCourse = skills.filter((s) => s.group === 'course' && s.verdict === 'strong');
  const headline =
    weakPre.length === 0 && strongCourse.length === 0
      ? 'Your earlier-grade skills look solid. Start at the beginning of the course.'
      : weakPre.length === 0
        ? `Your earlier-grade skills look solid, and you already know some of this course. Try Show What You Know on ${testOut.length === 1 ? 'the marked lesson' : `the ${testOut.length} marked lessons`} when you reach them.`
        : `A few earlier-grade skills need a refresh (${weakPre.map((s) => s.name).join(', ')}). The warm-up practice below helps, and lessons will review them as they come up.`;
  return { completedAt: ctx.now(), skills, testOutLessonIds: testOut, recommendedLessonId: firstOpen.id, recommendedLessonTitle: firstOpen.title, headline };
}

function finishRun(ctx: ServiceContext, profileId: number, o: StoredOnboarding, run: DiagnosticRun): void {
  // starting mastery: every answer is diagnostic evidence (milestone XP is awarded inside)
  for (const s of new Set(run.ps.items.map((i) => i.skillId))) recomputeSkill(ctx, profileId, s);
  const summary = summarize(ctx, profileId, run);
  run.phase = 'results';
  o.diagnostic = 'completed';
  o.diagnosticSummary = summary;
  o.recommendedLessonId = summary.recommendedLessonId;
  bumpDay(ctx, profileId, { sections: 1 });
  logActivity(ctx, profileId, 'diagnostic', {
    strong: summary.skills.filter((s) => s.verdict === 'strong').length,
    total: summary.skills.length,
    testOut: summary.testOutLessonIds.length,
  });
}

/** Move past the current skill if it is decided; ask the next question or finish. */
function step(ctx: ServiceContext, profileId: number, o: StoredOnboarding, run: DiagnosticRun): void {
  const sk = run.skills[run.cursor];
  if (decideSkill(sk.group, sk.answers, sk.notLearned) === null) return nextItem(ctx, run);
  run.cursor++;
  if (run.cursor >= run.skills.length) return finishRun(ctx, profileId, o, run);
  nextItem(ctx, run);
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function withRun(ctx: ServiceContext, profileId: number, fn: (o: StoredOnboarding, run: DiagnosticRun) => void): DiagnosticView {
  ctx.db.transaction(() => {
    const o = readOnboarding(ctx, profileId);
    const run = validRun(o.diagnosticRun);
    if (!run) throw new UserFacingError('Start the diagnostic first.');
    fn(o, run);
    o.diagnosticRun = run;
    writeOnboarding(ctx, profileId, o);
  });
  return getDiagnostic(ctx, profileId);
}

export function startDiagnostic(ctx: ServiceContext, profileId: number): DiagnosticView {
  ctx.db.transaction(() => {
    const o = readOnboarding(ctx, profileId);
    const st = status(o);
    if (st === 'skipped') throw new UserFacingError('A parent skipped the diagnostic. A parent can offer it again in Parent Mode.');
    if (st === 'completed') throw new UserFacingError('The diagnostic is already done. A parent can offer it again in Parent Mode.');
    if (st === 'in_progress' && validRun(o.diagnosticRun)) return; // resume
    o.diagnosticRun = newRun(ctx);
    o.diagnostic = 'in_progress';
    writeOnboarding(ctx, profileId, o);
    logActivity(ctx, profileId, 'diagnostic-start', {});
  });
  return getDiagnostic(ctx, profileId);
}

function currentItem(run: DiagnosticRun, key: string): ProblemState {
  const cur = run.ps.items[run.ps.current];
  if (run.phase !== 'questions' || !cur || cur.key !== key || cur.state !== 'open') throw new UserFacingError('That question is no longer active.');
  return cur;
}

export function diagnosticSubmit(ctx: ServiceContext, profileId: number, key: string, response: string, elapsedMs: number): DiagnosticView {
  if (typeof response !== 'string' || response.length > 300) throw new UserFacingError('That answer is too long.');
  return withRun(ctx, profileId, (o, run) => {
    const s = currentItem(run, key);
    const p = getProblem(s.generatorId, s.seed, s.difficulty);
    const r = checkAnswer(p.answer, response, p.misconceptions);
    s.lastResponse = response;
    if (r.status === 'invalid') {
      s.lastFeedback = { status: 'invalid', message: r.message ?? 'That answer could not be read.' };
      return;
    }
    const correct = r.status === 'correct';
    const elapsed = Math.min(30 * 60_000, Math.max(0, elapsedMs || ctx.now() - s.shownAt));
    const xpRes = correct
      ? xpForAnswer({ activity: 'diagnostic', correct, difficulty: s.difficulty, maxHintLevel: 0, attemptNumber: 1, isChoice: p.answer.kind === 'choice', elapsedMs: elapsed, recent: recentAnswers(ctx, profileId, ctx.now() - 30_000), now: ctx.now() })
      : { xp: 0, guessingSuspected: false };
    recordAttempt(ctx, {
      profileId,
      lessonId: null,
      activity: 'diagnostic',
      skillId: s.skillId,
      generatorId: s.generatorId,
      seed: s.seed,
      difficulty: s.difficulty,
      problemKey: s.key,
      response,
      status: correct ? 'correct' : 'incorrect',
      correct,
      attemptNumber: 1,
      hintsUsed: 0,
      maxHintLevel: 0,
      misconception: 'misconception' in r ? r.misconception ?? null : null,
      elapsedMs: elapsed,
      counted: true,
      xp: xpRes.xp,
      guessing: xpRes.guessingSuspected,
    });
    if (xpRes.xp) awardXp(ctx, profileId, xpRes.xp, 'answer:diagnostic', null);
    // no right/wrong feedback during the diagnostic: it is a check of what is known, not a test
    s.state = correct ? 'correct' : 'incorrect-final';
    s.lastFeedback = undefined;
    run.skills[run.cursor].answers.push(correct);
    step(ctx, profileId, o, run);
  });
}

export function diagnosticNotLearned(ctx: ServiceContext, profileId: number, key: string): DiagnosticView {
  return withRun(ctx, profileId, (o, run) => {
    const s = currentItem(run, key);
    s.state = 'revealed';
    s.lastResponse = '';
    run.skills[run.cursor].notLearned = true;
    step(ctx, profileId, o, run);
  });
}

// --- optional warm-up practice on prerequisite skills that need work ---

function weakPrereqs(o: StoredOnboarding): string[] {
  return (o.diagnosticSummary?.skills ?? []).filter((s) => s.group === 'prereq' && s.verdict !== 'strong').map((s) => s.skillId);
}

export function startDiagnosticReview(ctx: ServiceContext, profileId: number): DiagnosticView {
  return withRun(ctx, profileId, (o, run) => {
    if (run.phase === 'review') return;
    if (run.phase !== 'results') throw new UserFacingError('Finish the diagnostic first.');
    const weak = weakPrereqs(o);
    if (!weak.length) throw new UserFacingError('Every earlier-grade skill looked solid, so there is nothing to warm up on.');
    const ps = newPractice('remediation', { seedBase: deriveSeed(run.baseSeed, 2 + run.seedCounter++), hintsAllowed: true });
    const perSkill = Math.max(1, Math.min(REVIEW_PER_SKILL, Math.floor(REVIEW_MAX_ITEMS / weak.length)));
    for (let k = 0; k < perSkill; k++)
      for (const skill of weak) {
        if (ps.items.length + ps.pending.length >= REVIEW_MAX_ITEMS) break;
        const gens = generatorsForSkill(skill);
        ps.pending.push({ generator: gens[k % gens.length].id, difficulty: 1 });
      }
    ps.items.push(realize(ctx, ps, ps.pending.shift()!));
    ps.current = 0;
    run.review = ps;
    run.phase = 'review';
  });
}

function reviewSet(run: DiagnosticRun): PracticeState {
  if (run.phase !== 'review' || !run.review) throw new UserFacingError('The warm-up practice is not open.');
  return run.review;
}

export function diagnosticReviewSubmit(ctx: ServiceContext, profileId: number, key: string, response: string, elapsedMs: number): DiagnosticView {
  if (typeof response !== 'string' || response.length > 300) throw new UserFacingError('That answer is too long.');
  return withRun(ctx, profileId, (_o, run) => {
    const ps = reviewSet(run);
    submitImmediate(ctx, profileId, null, ps, key, response, elapsedMs);
    if (allResolved(ps)) ps.complete = true;
  });
}

export function diagnosticReviewHint(ctx: ServiceContext, profileId: number, key: string): DiagnosticView {
  return withRun(ctx, profileId, (_o, run) => hint(ctx, profileId, null, reviewSet(run), key));
}

export function diagnosticReviewReveal(ctx: ServiceContext, profileId: number, key: string): DiagnosticView {
  return withRun(ctx, profileId, (_o, run) => {
    const ps = reviewSet(run);
    reveal(ctx, profileId, null, ps, key);
    if (allResolved(ps)) ps.complete = true;
  });
}

export function diagnosticReviewNext(ctx: ServiceContext, profileId: number): DiagnosticView {
  return withRun(ctx, profileId, (_o, run) => {
    const ps = reviewSet(run);
    advance(ctx, ps);
  });
}

export function closeDiagnosticReview(ctx: ServiceContext, profileId: number): DiagnosticView {
  return withRun(ctx, profileId, (_o, run) => {
    if (run.phase !== 'review') return;
    run.review = null;
    run.phase = 'results';
  });
}

// --- parent controls (the PIN is checked by the API layer) ---

export function skipDiagnostic(ctx: ServiceContext, profileId: number): DiagnosticView {
  ctx.db.transaction(() => {
    const o = readOnboarding(ctx, profileId);
    if (status(o) === 'completed') throw new UserFacingError('The diagnostic is already done.');
    o.diagnostic = 'skipped';
    delete o.diagnosticRun;
    writeOnboarding(ctx, profileId, o);
    logActivity(ctx, profileId, 'diagnostic-skip', {});
  });
  return getDiagnostic(ctx, profileId);
}

/** Offer the diagnostic again. Earlier answers stay in the record; the new run decides the new summary. */
export function reofferDiagnostic(ctx: ServiceContext, profileId: number): DiagnosticView {
  ctx.db.transaction(() => {
    const o = readOnboarding(ctx, profileId);
    if (status(o) === 'in_progress') return;
    o.diagnostic = 'offered';
    delete o.diagnosticRun;
    writeOnboarding(ctx, profileId, o);
  });
  return getDiagnostic(ctx, profileId);
}

// ---------------------------------------------------------------------------
// View
// ---------------------------------------------------------------------------

export function getDiagnostic(ctx: ServiceContext, profileId: number): DiagnosticView {
  const o = readOnboarding(ctx, profileId);
  const st = status(o);
  const run = validRun(o.diagnosticRun);
  const total = run?.skills.length ?? diagnosticPlan().length;
  const answered = run ? run.skills.reduce((a, s) => a + s.answers.length + (s.notLearned ? 1 : 0), 0) : 0;
  const base: DiagnosticView = {
    status: st,
    phase: 'intro',
    part: null,
    progress: { skillsDone: 0, skillsTotal: total, answered },
    problem: null,
    summary: st === 'completed' ? o.diagnosticSummary ?? null : null,
    review: null,
    canReview: false,
  };
  if (st === 'completed' && !run) return { ...base, phase: 'results', progress: { skillsDone: total, skillsTotal: total, answered } };
  if (!run || st === 'skipped' || st === 'offered') return base;
  if (run.phase === 'questions') {
    const cur = run.ps.items[run.ps.current];
    const view = problemView(run.ps, cur, answered);
    // the total is not known in advance (it adapts), so the card shows only the question number
    view.total = 0;
    return { ...base, phase: 'questions', part: run.skills[run.cursor].group, progress: { skillsDone: run.cursor, skillsTotal: total, answered }, problem: view };
  }
  const canReview = weakPrereqs(o).length > 0;
  return {
    ...base,
    phase: run.phase,
    progress: { skillsDone: total, skillsTotal: total, answered },
    review: run.phase === 'review' && run.review ? practiceView(run.review) : null,
    canReview,
  };
}
