/**
 * Practice engine shared by lessons, reviews and assessments: realizes problems from
 * seeds, grades answers, gives hints, tracks attempts, and builds the renderer view.
 * The renderer never receives the answer key for an open problem.
 */
import type { Difficulty, GeneratorDef, Problem, ProblemRef } from '../../core/curriculum/types';
import { checkAnswer, answerToText, AnswerSpec } from '../../core/math/answers';
import { produceProblem } from '../../core/engine/problems';
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
  attempts: number;
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
export function realize(ctx: ServiceContext, ps: PracticeState, ref: ProblemRef & { review?: boolean }): ProblemState {
  const seed = deriveSeed(ps.seedBase, ps.seedCounter++);
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

const ENCOURAGE = ["Let's take another look.", 'Not quite yet. Check each step.', 'Close. Look at it once more.', 'Keep going. A hint can help if you want one.'];

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

/** Grade a typed answer for an open problem in immediate-feedback practice. */
export function submitImmediate(ctx: ServiceContext, profileId: number, lessonId: string | null, ps: PracticeState, key: string, response: string, elapsedMs: number): SubmitOutcome {
  const s = findItem(ps, key);
  if (s.state !== 'open') return { resolved: true, correct: s.state === 'correct', xp: 0 };
  const p = getProblem(s.generatorId, s.seed, s.difficulty);
  const stepMode = isStepMode(ps, p);
  const { spec, misconceptions } = currentSpec(p, s, stepMode);
  const result = checkAnswer(spec, response, misconceptions);
  s.lastResponse = response;
  const elapsed = Math.min(30 * 60_000, Math.max(0, elapsedMs || ctx.now() - s.shownAt));

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
    const msg = result.message ?? ENCOURAGE[(s.attempts - 1) % ENCOURAGE.length];
    const extra = ps.hintsAllowed && s.hintLevel < 4 && s.attempts >= 2 ? ' Try a hint if you are stuck.' : '';
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
    s.hintLevel = 0;
    s.shownAt = ctx.now();
    return { resolved: false, correct: true, xp: 0 };
  }
  const attemptNumber = s.attempts + 1;
  const xpRes = xpForAnswer({
    activity: xpActivity(ps.activity),
    correct: true,
    difficulty: s.difficulty,
    maxHintLevel: s.maxHintLevel,
    attemptNumber,
    isChoice: p.answer.kind === 'choice',
    elapsedMs: elapsed,
    recent: recentAnswers(ctx, profileId, ctx.now() - 30_000),
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
    attemptNumber: s.attempts + (correct ? 1 : 0),
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

/** Deferred-feedback answer (quiz/assessment): store the response; only unreadable input gets a message. */
export function submitDeferred(ps: PracticeState, key: string, response: string): void {
  const s = findItem(ps, key);
  if (s.state !== 'open' && s.state !== 'answered') return;
  const p = getProblem(s.generatorId, s.seed, s.difficulty);
  const r = checkAnswer(p.answer, response);
  if (r.status === 'invalid') {
    s.lastFeedback = { status: 'invalid', message: r.message ?? 'That answer could not be read.' };
    s.lastResponse = response;
    return;
  }
  s.lastResponse = response;
  s.state = 'answered';
  s.lastFeedback = undefined;
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
    unit: p.answer.kind === 'number' ? p.answer.unit : undefined,
    hintsShown: hints.slice(0, s.hintLevel),
    hintsRemaining: ps.hintsAllowed ? 4 - s.hintLevel : 0,
    hintsAllowed: ps.hintsAllowed,
    attempts: s.attempts,
    state: s.state === 'answered' ? 'open' : s.state,
    lastFeedback: s.lastFeedback,
    lastResponse: s.lastResponse,
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
