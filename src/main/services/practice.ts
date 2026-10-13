/**
 * Practice engine shared by lessons, reviews and assessments: realizes problems from
 * seeds, grades answers, gives hints, tracks attempts, and builds the renderer view.
 * The renderer never receives the answer key for an open problem.
 */
import type { Difficulty, GeneratorDef, Problem, ProblemRef } from '../../core/curriculum/types';
import { checkAnswer, isNearMiss, answerToText, AnswerSpec, requestedFormIssue, CheckResult, Misconception } from '../../core/math/answers';
import { produceProblem } from '../../core/engine/problems';
import { graphConfig } from '../../core/math/graphAnswer';
import { createRng, deriveSeed } from '../../core/engine/rng';
import { xpForAnswer, XpActivity } from '../../core/engine/xp';
import { GENERATORS, SKILL_BY_ID, generatorsForSkill } from '../../content';
import type { ActivityKind, FeedbackView, PracticeView, ProblemView, AnswerKind } from '../../shared/api';
import { ServiceContext, UserFacingError } from './context';
import { recordAttempt, recordHint, recomputeSkill, awardXp, recentAnswers } from './records';

export interface ProblemState {
  key: string;
  generatorId: string;
  difficulty: Difficulty;
  seed: number;
  skillId: string;
  review: boolean;
  stepIndex: number;
  /** wrong tries over the whole problem (all steps) */
  attempts: number;
  /** wrong tries on the current guided step; XP and "first try" use this, so a slip on step 1 does not make the last step a retry */
  stepAttempts?: number;
  /** deferred sets: the last response refused for its form (saving it again keeps it as written) */
  formRefused?: string;
  /** deferred sets: the last response that was refused (not saved), shown again in the answer box */
  draft?: string;
  /** the response that completed the previous guided step (to recognize a repeated submit) */
  prevStepResponse?: string;
  hintLevel: number;
  maxHintLevel: number;
  hintsUsed: number;
  state: 'open' | 'answered' | 'correct' | 'revealed' | 'incorrect-final';
  lastFeedback?: FeedbackView;
  lastResponse?: string;
  shownAt: number;
  /** quiz grading result, kept for review */
  graded?: { correct: boolean; message?: string; misconception?: string };
}

export interface PracticeState {
  activity: ActivityKind;
  items: ProblemState[];
  current: number;
  deferred: boolean;
  hintsAllowed: boolean;
  /** planned refs not yet realized (independent practice realizes lazily for adaptivity) */
  pending: Array<ProblemRef & { review?: boolean }>;
  requiredCorrect: number;
  extrasLeft: number;
  adapt: Record<string, number>;
  seedBase: number;
  seedCounter: number;
  complete: boolean;
  /** consecutive first-try successes per generator (for raising difficulty) */
  streaks: Record<string, number>;
}

const cache = new Map<string, Problem>();

export function getProblem(generatorId: string, seed: number, difficulty: Difficulty): Problem {
  const k = `${generatorId}:${difficulty}:${seed}`;
  const hit = cache.get(k);
  if (hit) return hit;
  const gen = GENERATORS.get(generatorId);
  if (!gen) throw new UserFacingError(`Problem type ${generatorId} is not available.`);
  const { problem } = produceProblem(gen, seed, difficulty);
  if (cache.size > 2000) cache.clear();
  cache.set(`${generatorId}:${difficulty}:${problem.seed}`, problem);
  cache.set(k, problem);
  return problem;
}

function clampDifficulty(d: number): Difficulty {
  return Math.min(3, Math.max(1, Math.round(d))) as Difficulty;
}

export function newPractice(activity: ActivityKind, opts: { seedBase: number; deferred?: boolean; hintsAllowed?: boolean; requiredCorrect?: number; extras?: number }): PracticeState {
  return {
    activity,
    items: [],
    current: 0,
    deferred: !!opts.deferred,
    hintsAllowed: opts.hintsAllowed ?? !opts.deferred,
    pending: [],
    requiredCorrect: opts.requiredCorrect ?? 0,
    extrasLeft: opts.extras ?? 0,
    adapt: {},
    seedBase: opts.seedBase >>> 0,
    seedCounter: 0,
    complete: false,
    streaks: {},
  };
}

/** Realize one problem from a ref. Rejected generators never crash a lesson: the next valid seed is used. */
export function realize(ctx: ServiceContext, ps: PracticeState, ref: ProblemRef & { review?: boolean; seed?: number }): ProblemState {
  const derived = deriveSeed(ps.seedBase, ps.seedCounter++);
  // a capstone realizes all of its tasks from one shared seed so they describe the same situation
  const seed = ref.seed !== undefined ? ref.seed >>> 0 : derived;
  const difficulty = clampDifficulty(ref.difficulty + (ps.adapt[ref.generator] ?? 0));
  const gen = GENERATORS.get(ref.generator);
  if (!gen) throw new UserFacingError(`Problem type ${ref.generator} is missing from this version of the app.`);
  const { problem, rejected } = produceProblem(gen, seed, difficulty);
  if (rejected.length) ctx.log.warn('problems', `${gen.id} rejected ${rejected.length} seed(s) before a valid problem: ${rejected[0].errors.slice(0, 2).join('; ')}`);
  cache.set(`${gen.id}:${difficulty}:${problem.seed}`, problem);
  return {
    key: `${ps.activity}:${ps.items.length}`,
    generatorId: gen.id,
    difficulty,
    seed: problem.seed,
    skillId: problem.skillId,
    review: !!ref.review,
    stepIndex: 0,
    attempts: 0,
    hintLevel: 0,
    maxHintLevel: 0,
    hintsUsed: 0,
    state: 'open',
    shownAt: ctx.now(),
  };
}

export function addItems(ctx: ServiceContext, ps: PracticeState, refs: Array<ProblemRef & { review?: boolean }>): void {
  for (const r of refs) ps.items.push(realize(ctx, ps, r));
}

/** Weighted, deterministic plan of `count` refs from a mix, each generator used at least once when possible. */
export function planFromMix(mix: Array<ProblemRef & { weight: number }>, count: number, seed: number): ProblemRef[] {
  const rng = createRng(seed);
  const out: ProblemRef[] = [];
  const order = [...mix];
  for (const m of order) if (out.length < count) out.push({ generator: m.generator, difficulty: m.difficulty });
  const total = mix.reduce((a, m) => a + m.weight, 0);
  while (out.length < count) {
    let r = rng.next() * total;
    for (const m of mix) {
      r -= m.weight;
      if (r <= 0) {
        out.push({ generator: m.generator, difficulty: m.difficulty });
        break;
      }
    }
  }
  // sort roughly by difficulty (warm up first), shuffling within the same difficulty
  const shuffled = rng.shuffle(out);
  return shuffled.sort((a, b) => a.difficulty - b.difficulty);
}

/** Spaced-review refs for skills that are due (or weakest) among `candidates`. */
export function reviewRefs(states: Map<string, { stage: string; score: number; nextReviewAt: number | null }>, candidates: string[], count: number, now: number, seed: number): Array<ProblemRef & { review: boolean }> {
  if (count <= 0) return [];
  const rng = createRng(seed);
  const practiced = candidates.filter((s) => states.has(s) && generatorsForSkill(s).length > 0);
  const due = practiced.filter((s) => (states.get(s)!.nextReviewAt ?? 0) <= now);
  const pool = (due.length ? due : practiced).sort((a, b) => states.get(a)!.score - states.get(b)!.score);
  const out: Array<ProblemRef & { review: boolean }> = [];
  for (let i = 0; i < count && pool.length; i++) {
    const skill = pool[i % pool.length];
    const gens = generatorsForSkill(skill);
    const g = gens[rng.int(0, gens.length - 1)];
    const st = states.get(skill)!;
    const d: Difficulty = st.stage === 'MASTERED' ? 3 : st.stage === 'PROFICIENT' ? 2 : 1;
    out.push({ generator: g.id, difficulty: d, review: true });
  }
  return out;
}

function currentSpec(p: Problem, s: ProblemState, stepMode: boolean): { spec: AnswerSpec; hints: string[]; misconceptions: Problem['misconceptions'] } {
  if (stepMode && p.steps && s.stepIndex < p.steps.length) {
    const st = p.steps[s.stepIndex];
    return { spec: st.answer, hints: st.hints, misconceptions: st.misconceptions ?? [] };
  }
  return { spec: p.answer, hints: p.hints, misconceptions: p.misconceptions };
}

function isStepMode(ps: PracticeState, p: Problem): boolean {
  return (ps.activity === 'guided' || ps.activity === 'remediation') && !!p.steps && p.steps.length > 0;
}

/** Neutral encouragement after a wrong answer (rotated by try). */
export const ENCOURAGE = ["Let's take another look.", 'Not quite yet. Check each step.', 'Keep going. A hint can help if you want one.'];
/** Only for a wrong answer that really is close (see isNearMiss). */
export const NEAR_MISS_MESSAGE = 'Close. Look at it once more.';

export interface SubmitOutcome {
  resolved: boolean;
  correct: boolean;
  xp: number;
  skillChange?: { before: string; after: string };
}

function xpActivity(a: ActivityKind): XpActivity {
  if (a === 'corrections') return 'remediation';
  return a as XpActivity;
}

/** Recent answers for the anti-guessing rule ("3 wrong in 30 s"); deferred quiz/assessment/test-out answers are left out. */
export const recentPracticeAnswers = recentAnswers;

/**
 * Time on the current try, measured by the main process from when the problem (or the step, or the
 * previous wrong try) was shown. The renderer's figure only caps it from above (it can be shorter
 * after the app was reopened), so a quick retry is always seen as quick.
 */
export function elapsedFor(ctx: ServiceContext, s: ProblemState, clientMs: number): number {
  const server = Number.isFinite(s.shownAt) ? ctx.now() - s.shownAt : NaN;
  const client = Number.isFinite(clientMs) && clientMs > 0 ? clientMs : NaN;
  const e = Number.isNaN(server) ? client : Number.isNaN(client) ? server : Math.min(server, client);
  return Math.min(30 * 60_000, Math.max(0, Number.isNaN(e) ? 0 : e));
}

/**
 * Grade a typed answer for an open problem in immediate-feedback practice. `stepIndex` is the guided
 * step the student was looking at: an answer sent for a step that is already done (a repeated click)
 * is ignored instead of being graded against the next step.
 */
export function submitImmediate(ctx: ServiceContext, profileId: number, lessonId: string | null, ps: PracticeState, key: string, response: string, elapsedMs: number, stepIndex?: number): SubmitOutcome {
  const s = findItem(ps, key);
  if (s.state !== 'open') return { resolved: true, correct: s.state === 'correct', xp: 0 };
  const p = getProblem(s.generatorId, s.seed, s.difficulty);
  const stepMode = isStepMode(ps, p);
  if (stepMode && typeof stepIndex === 'number' && stepIndex !== s.stepIndex) return { resolved: false, correct: false, xp: 0 };
  const { spec, misconceptions } = currentSpec(p, s, stepMode);
  const result = checkAnswer(spec, response, misconceptions);
  // The same text sent again right after it completed the previous step (no step index from an
  // older renderer): it was meant for that step, so do not grade it against this one.
  if (stepMode && stepIndex === undefined && s.stepIndex > 0 && (s.stepAttempts ?? 0) === 0 && s.prevStepResponse === response && result.status !== 'correct' && s.lastFeedback?.status === 'correct' && ctx.now() - s.shownAt < 15_000) {
    s.prevStepResponse = undefined; // only once: typing it again on purpose is graded
    return { resolved: false, correct: false, xp: 0 };
  }
  s.lastResponse = response;
  const elapsed = elapsedFor(ctx, s, elapsedMs);

  if (result.status === 'invalid') {
    s.lastFeedback = { status: 'invalid', message: result.message ?? 'That answer could not be read.' };
    return { resolved: false, correct: false, xp: 0 };
  }
  if (result.status === 'wrong-form') {
    s.lastFeedback = { status: 'wrong-form', message: result.message ?? 'That is equivalent. Now write it in the requested form.' };
    recordAttempt(ctx, base(profileId, lessonId, ps, s, response, 'wrong-form', false, elapsed, false, 0, false, stepMode ? s.stepIndex : null));
    return { resolved: false, correct: false, xp: 0 };
  }
  const isFinalStep = !stepMode || s.stepIndex >= (p.steps?.length ?? 0) - 1;
  if (result.status === 'incorrect') {
    s.attempts++;
    s.stepAttempts = (s.stepAttempts ?? 0) + 1;
    const tries = stepMode ? s.stepAttempts : s.attempts;
    const msg = result.message ?? (isNearMiss(spec, response) ? NEAR_MISS_MESSAGE : ENCOURAGE[(tries - 1) % ENCOURAGE.length]);
    const extra = ps.hintsAllowed && s.hintLevel < 4 && tries >= 2 ? ' Try a hint if you are stuck.' : '';
    s.lastFeedback = { status: 'incorrect', message: msg + extra, misconception: result.misconception };
    recordAttempt(ctx, base(profileId, lessonId, ps, s, response, 'incorrect', false, elapsed, false, 0, false, stepMode ? s.stepIndex : null, result.misconception));
    s.shownAt = ctx.now();
    return { resolved: false, correct: false, xp: 0 };
  }
  // correct
  if (stepMode && !isFinalStep) {
    s.lastFeedback = { status: 'correct', message: p.steps![s.stepIndex].explanation + ' Now the next step.' };
    recordAttempt(ctx, base(profileId, lessonId, ps, s, response, 'correct', true, elapsed, false, 0, false, s.stepIndex));
    s.stepIndex++;
    s.stepAttempts = 0;
    s.prevStepResponse = response;
    s.hintLevel = 0;
    s.shownAt = ctx.now();
    return { resolved: false, correct: true, xp: 0 };
  }
  // first try / retry is judged on this question (in guided mode, on this step)
  const attemptNumber = (stepMode ? s.stepAttempts ?? 0 : s.attempts) + 1;
  const xpRes = xpForAnswer({
    activity: xpActivity(ps.activity),
    correct: true,
    difficulty: s.difficulty,
    maxHintLevel: s.maxHintLevel,
    attemptNumber,
    isChoice: p.answer.kind === 'choice',
    elapsedMs: elapsed,
    recent: recentPracticeAnswers(ctx, profileId, ctx.now() - 30_000),
    now: ctx.now(),
  });
  s.state = 'correct';
  recordAttempt(ctx, { ...base(profileId, lessonId, ps, s, response, 'correct', true, elapsed, true, xpRes.xp, xpRes.guessingSuspected, stepMode ? s.stepIndex : null), attemptNumber });
  const xp = awardXp(ctx, profileId, xpRes.xp, `answer:${ps.activity}`, lessonId);
  const rc = recomputeSkill(ctx, profileId, s.skillId);
  const praise = s.maxHintLevel > 0 ? 'Correct! Using hints to work it out is how you learn.' : attemptNumber > 1 ? 'Correct! You stuck with it.' : 'Correct!';
  s.lastFeedback = { status: 'correct', message: xpRes.guessingSuspected ? 'Correct. Slow down and work each problem through to earn XP.' : praise, xp: xp + rc.xp };
  updateAdaptivity(ps, s, true, attemptNumber);
  return { resolved: true, correct: true, xp: xp + rc.xp, skillChange: { before: rc.before, after: rc.after.stage } };
}

function updateAdaptivity(ps: PracticeState, s: ProblemState, correct: boolean, attemptNumber: number): void {
  if (ps.activity !== 'independent' && ps.activity !== 'review') return;
  const g = s.generatorId;
  const clean = correct && attemptNumber === 1 && s.maxHintLevel === 0;
  if (clean) {
    ps.streaks[g] = (ps.streaks[g] ?? 0) + 1;
    if (ps.streaks[g] >= 2) {
      ps.adapt[g] = Math.min(1, (ps.adapt[g] ?? 0) + 1);
      ps.streaks[g] = 0;
    }
  } else {
    ps.streaks[g] = 0;
    if (!correct || attemptNumber > 2 || s.maxHintLevel >= 3) ps.adapt[g] = Math.max(-1, (ps.adapt[g] ?? 0) - 1);
  }
}

function base(profileId: number, lessonId: string | null, ps: PracticeState, s: ProblemState, response: string, status: string, correct: boolean, elapsed: number, counted: boolean, xp: number, guessing: boolean, stepIndex: number | null, misconception?: string) {
  return {
    profileId,
    lessonId,
    activity: ps.activity,
    skillId: s.skillId,
    generatorId: s.generatorId,
    seed: s.seed,
    difficulty: s.difficulty,
    problemKey: s.key,
    stepIndex,
    response,
    status,
    correct,
    attemptNumber: (stepIndex !== null ? s.stepAttempts ?? 0 : s.attempts) + (correct ? 1 : 0),
    hintsUsed: s.hintsUsed,
    maxHintLevel: s.maxHintLevel,
    misconception: misconception ?? null,
    elapsedMs: elapsed,
    counted,
    xp,
    guessing,
  };
}

export function findItem(ps: PracticeState, key: string): ProblemState {
  const s = ps.items.find((i) => i.key === key);
  if (!s) throw new UserFacingError('That problem is no longer active. Please reopen the lesson.');
  return s;
}

export function hint(ctx: ServiceContext, profileId: number, lessonId: string | null, ps: PracticeState, key: string): void {
  if (!ps.hintsAllowed) throw new UserFacingError('Hints are not available during a quiz or assessment.');
  const s = findItem(ps, key);
  if (s.state !== 'open') return;
  if (s.hintLevel >= 4) return;
  s.hintLevel++;
  s.hintsUsed++;
  s.maxHintLevel = Math.max(s.maxHintLevel, s.hintLevel);
  const p = getProblem(s.generatorId, s.seed, s.difficulty);
  recordHint(ctx, profileId, lessonId, ps.activity, s.skillId, s.key, isStepMode(ps, p) ? s.stepIndex : null, s.hintLevel);
}

export function canReveal(ps: PracticeState, s: ProblemState): boolean {
  return ps.hintsAllowed && !ps.deferred && s.state === 'open' && (s.hintLevel >= 4 || s.attempts >= 3 || (s.hintLevel >= 2 && s.attempts >= 2));
}

/** Show the full solution after meaningful help (spec §10). Counts as a miss for mastery, never for the grade. */
export function reveal(ctx: ServiceContext, profileId: number, lessonId: string | null, ps: PracticeState, key: string): void {
  const s = findItem(ps, key);
  if (!canReveal(ps, s)) throw new UserFacingError('Try a hint or another attempt first. The full solution unlocks after a few tries.');
  s.state = 'revealed';
  s.attempts = Math.max(1, s.attempts);
  recordAttempt(ctx, base(profileId, lessonId, ps, s, '', 'revealed', false, ctx.now() - s.shownAt, true, 0, false, null));
  // a revealed problem resolves as incorrect evidence: undo the +1 base() adds for correct=false (none) and keep attempts
  recomputeSkill(ctx, profileId, s.skillId);
  updateAdaptivity(ps, s, false, s.attempts);
}

/**
 * In a deferred set, may this response be saved? An unreadable answer, or one not written in the
 * form the question asks for, is not saved: the student gets a message that says what to fix
 * without saying whether the answer is right. Returns null when the response can be saved. Pass the
 * problem's misconceptions: a known misconception answer (e.g. "y < -5" read off the wrong axis) is a
 * readable wrong answer that is saved and graded, not an unreadable one.
 */
export function deferredSaveProblem(spec: AnswerSpec, response: string, misconceptions?: Misconception[], r: CheckResult = checkAnswer(spec, response, misconceptions)): { status: 'invalid' | 'wrong-form'; message: string } | null {
  if (r.status === 'invalid') return { status: 'invalid', message: r.message ?? 'That answer could not be read.' };
  const formMsg = requestedFormIssue(spec, response) ?? (r.status === 'wrong-form' ? 'Write your answer in the form the question asks for.' : null);
  return formMsg ? { status: 'wrong-form', message: formMsg } : null;
}

/**
 * Deferred-feedback answer (quiz/assessment): save the response. An answer that cannot be read or is
 * not in the requested form is not saved (a correct value in the wrong form is never graded wrong;
 * the student rewrites it): the item keeps its earlier saved answer, or stays open if it had none.
 */
export function submitDeferred(ps: PracticeState, key: string, response: string): void {
  const s = findItem(ps, key);
  if (s.state !== 'open' && s.state !== 'answered') return;
  const p = getProblem(s.generatorId, s.seed, s.difficulty);
  if (refuseDeferred(s, p, response, 'save')) return;
  s.lastResponse = response;
  s.state = 'answered';
  s.lastFeedback = undefined;
}

/**
 * The one rule for answers that are not checked right away (quizzes, assessments, test-outs and the
 * diagnostic): an unreadable answer, or one not in the requested form, is refused with a message that
 * says what to fix (the same whether the value is right or wrong). Sending the same wrong-form answer
 * a second time keeps it as written, so no one is ever stuck; an unreadable answer is never accepted.
 * Returns true when the response was refused (the item's lastFeedback says why and `draft` keeps the
 * text); false when it may be saved or scored. `r` is the checker's result when the caller has it.
 */
export function refuseDeferred(s: ProblemState, p: Problem, response: string, verb: 'save' | 'submit', r?: CheckResult): boolean {
  const problem = deferredSaveProblem(p.answer, response, p.misconceptions, r);
  const insisted = problem?.status === 'wrong-form' && s.formRefused === response;
  if (problem && !insisted) {
    const kept = s.state === 'answered' ? ' This was not saved; your earlier answer is still saved.' : verb === 'save' ? ' This answer is not saved yet.' : '';
    const keepAnyway = problem.status === 'wrong-form' ? ` To keep it exactly as it is, ${verb} it again.` : '';
    s.lastFeedback = { status: problem.status, message: problem.message + kept + keepAnyway };
    s.formRefused = problem.status === 'wrong-form' ? response : undefined;
    s.draft = response;
    return true;
  }
  s.formRefused = undefined;
  s.draft = undefined;
  return false;
}

/** Grade every item of a deferred set; records counted attempts. Returns per-item results. */
export function gradeDeferred(ctx: ServiceContext, profileId: number, lessonId: string | null, ps: PracticeState, assessmentId: number | null): Array<{ s: ProblemState; correct: boolean; message?: string; misconception?: string; xp: number }> {
  const out: Array<{ s: ProblemState; correct: boolean; message?: string; misconception?: string; xp: number }> = [];
  for (const s of ps.items) {
    const p = getProblem(s.generatorId, s.seed, s.difficulty);
    const response = s.lastResponse ?? '';
    const r = s.state === 'answered' ? checkAnswer(p.answer, response, p.misconceptions) : { status: 'incorrect' as const, message: 'No answer was given.' };
    const correct = r.status === 'correct';
    const message = r.status === 'wrong-form' ? `Your answer had the right value but was not in the requested form. ${r.message ?? ''}`.trim() : r.message;
    const xpRes = correct
      ? xpForAnswer({ activity: xpActivity(ps.activity), correct, difficulty: s.difficulty, maxHintLevel: 0, attemptNumber: 1, isChoice: p.answer.kind === 'choice', elapsedMs: 60_000, recent: [], now: ctx.now() })
      : { xp: 0, guessingSuspected: false };
    recordAttempt(ctx, {
      profileId,
      lessonId,
      activity: ps.activity,
      assessmentId,
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
      elapsedMs: 0,
      counted: true,
      xp: xpRes.xp,
      guessing: false,
    });
    s.state = correct ? 'correct' : 'incorrect-final';
    s.graded = { correct, message, misconception: 'misconception' in r ? r.misconception : undefined };
    out.push({ s, correct, message, misconception: s.graded.misconception, xp: xpRes.xp });
  }
  return out;
}

export function answerKindOf(spec: AnswerSpec): AnswerKind {
  return spec.kind;
}

export function problemView(ps: PracticeState, s: ProblemState, index: number, suggestion?: string): ProblemView {
  const p = getProblem(s.generatorId, s.seed, s.difficulty);
  const stepMode = isStepMode(ps, p);
  const { spec, hints } = currentSpec(p, s, stepMode);
  const finished = s.state === 'correct' || s.state === 'revealed' || s.state === 'incorrect-final';
  const view: ProblemView = {
    key: s.key,
    index,
    total: ps.items.length + ps.pending.length,
    skillId: s.skillId,
    skillName: SKILL_BY_ID.get(s.skillId)?.name ?? s.skillId,
    difficulty: s.difficulty,
    tags: [...p.tags, ...(s.review ? ['review'] : [])],
    prompt: p.prompt,
    answerKind: p.answer.kind,
    inputHint: p.inputHint,
    choices: p.answer.kind === 'choice' ? p.answer.options : undefined,
    graph: p.answer.kind === 'graph' ? graphConfig(p.answer) : undefined,
    unit: p.answer.kind === 'number' ? p.answer.unit : undefined,
    hintsShown: hints.slice(0, s.hintLevel),
    hintsRemaining: ps.hintsAllowed ? 4 - s.hintLevel : 0,
    hintsAllowed: ps.hintsAllowed,
    attempts: s.attempts,
    state: s.state === 'answered' ? 'open' : s.state,
    lastFeedback: s.lastFeedback,
    lastResponse: s.lastResponse,
    saved: ps.deferred && s.state !== 'open' && !!s.lastResponse,
    draft: ps.deferred && (s.state === 'open' || s.state === 'answered') ? s.draft : undefined,
    canReveal: canReveal(ps, s),
    suggestion,
  };
  if (stepMode && p.steps) {
    const idx = Math.min(s.stepIndex, p.steps.length - 1);
    const st = p.steps[idx];
    view.step = {
      index: idx,
      total: p.steps.length,
      prompt: st.prompt,
      answerKind: st.answer.kind,
      inputHint: st.inputHint,
      choices: st.answer.kind === 'choice' ? st.answer.options : undefined,
      graph: st.answer.kind === 'graph' ? graphConfig(st.answer) : undefined,
      completed: p.steps.slice(0, finished ? p.steps.length : s.stepIndex).map((x) => ({ prompt: x.prompt, explanation: x.explanation })),
    };
    view.answerKind = st.answer.kind;
  }
  if (finished && !(ps.deferred && !s.graded)) {
    view.solution = p.solution;
    view.correctAnswer = answerToText(p.answer);
    if (s.graded && !s.graded.correct) view.lastFeedback = { status: 'incorrect', message: s.graded.message ?? 'Compare your answer with the worked solution.', misconception: s.graded.misconception };
  }
  return view;
}

export function practiceView(ps: PracticeState, suggestion?: (s: ProblemState) => string | undefined): PracticeView {
  return {
    activity: ps.activity,
    problems: ps.items.map((s, i) => problemView(ps, s, i, suggestion?.(s))),
    currentIndex: Math.min(ps.current, Math.max(0, ps.items.length - 1)),
    complete: ps.complete,
    correctCount: ps.items.filter((i) => i.state === 'correct').length,
    requiredCorrect: ps.requiredCorrect || undefined,
    deferredFeedback: ps.deferred,
  };
}

export function allResolved(ps: PracticeState): boolean {
  return ps.pending.length === 0 && ps.items.every((i) => i.state === 'correct' || i.state === 'revealed' || i.state === 'incorrect-final');
}

export function allAnswered(ps: PracticeState): boolean {
  return ps.items.every((i) => i.state === 'answered' || i.state === 'correct' || i.state === 'incorrect-final');
}

/** Move to the next problem, realizing the next planned one (lazily, with current adaptivity). */
export function advance(ctx: ServiceContext, ps: PracticeState, weakestGenerator?: () => ProblemRef | null): void {
  const cur = ps.items[ps.current];
  if (cur && cur.state === 'open' && !ps.deferred) throw new UserFacingError('Finish this problem first (or reveal the solution after trying).');
  if (ps.current < ps.items.length - 1) {
    ps.current++;
    ps.items[ps.current].shownAt = ctx.now();
    return;
  }
  if (ps.pending.length) {
    ps.items.push(realize(ctx, ps, ps.pending.shift()!));
    ps.current = ps.items.length - 1;
    return;
  }
  const correct = ps.items.filter((i) => i.state === 'correct').length;
  if (correct < ps.requiredCorrect && ps.extrasLeft > 0 && weakestGenerator) {
    const ref = weakestGenerator();
    if (ref) {
      ps.extrasLeft--;
      ps.items.push(realize(ctx, ps, ref));
      ps.current = ps.items.length - 1;
      return;
    }
  }
  ps.complete = true;
}

export function generatorDef(id: string): GeneratorDef {
  const g = GENERATORS.get(id);
  if (!g) throw new UserFacingError(`Problem type ${id} is not available.`);
  return g;
}
