/**
 * Helpers for the guided-practice steps of the Unit 7 and Unit 8 generators (no generators here).
 *
 * Steps are attached after a problem is built (`withSteps`), so building them never draws from the
 * rng and the problems a seed produces are unchanged. Choice steps in the middle of a problem list
 * their options in a fixed (alphabetical) order; the last step of a choice problem reuses the
 * problem's own choice answer, so finishing the steps means answering the problem.
 */
import type { Block, GeneratorDef, Problem, ProblemStep } from '../../core/curriculum/types';
import type { AnswerSpec, Misconception, MisconceptionTag } from '../../core/math/answers';
import { checkAnswer } from '../../core/math/answers';
import { canonicalInput } from '../../core/engine/problems';
import { Rational } from '../../core/math/rational';
import { p, numStr } from './util';

export type H4 = [string, string, string, string];
export interface StepMis {
  value: Rational | null;
  tag: MisconceptionTag;
  feedback: string;
}
const blocks = (x: string | Block[]): Block[] => (typeof x === 'string' ? [p(x)] : x);

/** Keep only misconceptions the checker really grades as wrong (and drop repeats). */
function realMistakes(spec: AnswerSpec, list: Misconception[]): Misconception[] {
  const out: Misconception[] = [];
  for (const m of list) {
    if (out.some((o) => o.answer === m.answer)) continue;
    try {
      // misconceptions for points and lists are written "a|b" (not typeable input), so only a key match is excluded
      const r = checkAnswer(spec, m.answer);
      if (r.status !== 'correct' && r.status !== 'wrong-form') out.push(m);
    } catch {
      /* unreadable misconception: skip */
    }
  }
  return out;
}

/** A step whose answer is a number. `value` is exact (a Rational) or a long decimal string for an irrational value. */
export function numStep(prompt: string | Block[], value: Rational | string, hints: H4, explanation: string, mis: StepMis[] = [], opts: { roundTo?: number; unit?: string; inputHint?: string } = {}): ProblemStep {
  const spec: AnswerSpec = { kind: 'number', value: typeof value === 'string' ? value : numStr(value), ...(opts.roundTo !== undefined ? { roundTo: opts.roundTo } : {}), ...(opts.unit ? { unit: opts.unit } : {}) };
  const ms = mis.filter((m) => m.value).map((m) => ({ answer: numStr(m.value!), tag: m.tag, feedback: m.feedback }));
  return { prompt: blocks(prompt), answer: spec, ...(opts.inputHint ? { inputHint: opts.inputHint } : {}), hints, misconceptions: realMistakes(spec, ms), explanation };
}

/** A step with any answer spec (point, expression, interval, ...) and misconceptions written in that spec's language. */
export function specStep(prompt: string | Block[], spec: AnswerSpec, hints: H4, explanation: string, mis: Misconception[] = [], inputHint?: string): ProblemStep {
  return { prompt: blocks(prompt), answer: spec, ...(inputHint ? { inputHint } : {}), hints, misconceptions: realMistakes(spec, mis), explanation };
}

/**
 * A decision step with its own options, listed alphabetically (ids a, b, c, ...). `feedback` maps a
 * wrong option's label to the targeted feedback a student who picks it should get.
 */
export function choiceStep(prompt: string | Block[], correct: string, others: string[], hints: H4, explanation: string, feedback: Record<string, string> = {}, tag: MisconceptionTag = 'statistics-concept'): ProblemStep {
  const labels = [...new Set([correct, ...others])].sort((a, b) => a.localeCompare(b));
  const ids = 'abcdefgh';
  const options = labels.map((label, i) => ({ id: ids[i], label }));
  const spec: AnswerSpec = { kind: 'choice', options, correct: ids[labels.indexOf(correct)] };
  const mis: Misconception[] = options.filter((o) => o.label !== correct && feedback[o.label]).map((o) => ({ answer: o.id, tag, feedback: feedback[o.label] }));
  return { prompt: blocks(prompt), answer: spec, hints, misconceptions: mis, explanation };
}

/** Misconceptions for a choice answer, from a map of wrong option labels to feedback. */
export function choiceMis(answer: AnswerSpec, feedback: Record<string, string>, tag: MisconceptionTag = 'statistics-concept'): Misconception[] {
  if (answer.kind !== 'choice') return [];
  return answer.options.filter((o) => o.id !== answer.correct && feedback[o.label]).map((o) => ({ answer: o.id, tag, feedback: feedback[o.label] }));
}

/**
 * The last step: answers the problem itself, so it reuses the problem's answer spec. Misconceptions
 * default to the problem's own; for a choice problem, `feedback` maps wrong labels to feedback.
 */
export function finalStep(pr: Problem, prompt: string | Block[], hints: H4, explanation: string, extra: { feedback?: Record<string, string>; misconceptions?: Misconception[]; tag?: MisconceptionTag } = {}): ProblemStep {
  const mis = extra.misconceptions ?? (pr.answer.kind === 'choice' ? choiceMis(pr.answer, extra.feedback ?? {}, extra.tag) : pr.misconceptions);
  return { prompt: blocks(prompt), answer: pr.answer, ...(pr.inputHint ? { inputHint: pr.inputHint } : {}), hints, misconceptions: realMistakes(pr.answer, mis), explanation };
}

/** Attach steps to a finished problem (no rng is used, so the problem itself is unchanged). */
export function withSteps(pr: Problem, build: (pr: Problem) => ProblemStep[]): Problem {
  const steps = build(pr);
  // a choice problem without its own error feedback borrows the last step's (same options, same ids)
  const last = steps[steps.length - 1];
  const borrow = pr.answer.kind === 'choice' && pr.misconceptions.length === 0 && last && last.answer === pr.answer && last.misconceptions?.length;
  return { ...pr, steps, ...(borrow ? { misconceptions: last.misconceptions! } : {}) };
}

/** Generic step checks: 2-4 steps, and the last step's key answers the problem. */
export function stepShapeErrors(pr: Problem): string[] {
  const st = pr.steps;
  if (!st || !st.length) return [];
  const errs: string[] = [];
  if (st.length < 2 || st.length > 4) errs.push(`expected 2-4 steps, got ${st.length}`);
  const last = st[st.length - 1];
  if (checkAnswer(pr.answer, canonicalInput(last.answer)).status !== 'correct') errs.push('last step does not answer the problem');
  return errs;
}

/** The exact value of a number step (by index), or null. */
export function stepNum(pr: Problem, i: number): Rational | null {
  const a = pr.steps?.[i]?.answer;
  return a && a.kind === 'number' ? Rational.parse(a.value) : null;
}
/** The label of the correct option of a choice step (by index). */
export function stepLabel(pr: Problem, i: number): string {
  const a = pr.steps?.[i]?.answer;
  return a && a.kind === 'choice' ? a.options.find((o) => o.id === a.correct)?.label ?? '' : '';
}

/**
 * Compare a problem's number steps, in order, with values recomputed by verify(). A `null` in `want`
 * skips that step (a choice or other step checked separately). Rounded steps compare at their rounding.
 */
export function expectSteps(pr: Problem, want: Array<Rational | number | null>): string[] {
  const st = pr.steps;
  if (!st) return ['missing steps'];
  if (st.length !== want.length) return [`expected ${want.length} steps, got ${st.length}`];
  const errs: string[] = [];
  want.forEach((w, i) => {
    if (w === null) return;
    const a = st[i].answer;
    if (a.kind !== 'number') {
      errs.push(`step ${i + 1} is not a number`);
      return;
    }
    const got = Rational.parse(a.value).toNumber();
    const wn = typeof w === 'number' ? w : w.toNumber();
    const ok = a.roundTo !== undefined ? Math.round(got * 10 ** a.roundTo) === Math.round(wn * 10 ** a.roundTo) : Math.abs(got - wn) < 1e-9;
    if (!ok) errs.push(`step ${i + 1}: ${a.value} != ${wn}`);
  });
  return errs;
}

/**
 * Extend a generator's verify(): after the answer checks pass, every problem must have steps of the
 * right shape whose last step answers the problem, and `stepChecks` (which recomputes the step
 * answers from the prompt by its own route) must find nothing wrong.
 */
export function addStepChecks(gen: GeneratorDef, stepChecks: (pr: Problem) => string[]): void {
  const base = gen.verify.bind(gen);
  gen.verify = (pr: Problem) => {
    const errs = base(pr);
    if (errs.length) return errs;
    if (!pr.steps?.length) return ['missing guided steps'];
    return [...stepShapeErrors(pr), ...stepChecks(pr)];
  };
}
