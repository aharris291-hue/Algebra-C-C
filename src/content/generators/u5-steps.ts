/**
 * Builders and checks for the guided-practice steps of the Unit 5 and Unit 6 generators.
 * A step is one small piece of the method the lesson teaches (substitute, find the factor, divide
 * the outputs, ...). The last step of every problem asks for the problem's own answer with the same
 * answer spec, so finishing the steps means solving the problem.
 *
 * Steps never call the random generator, so attaching them leaves every seed's problem unchanged.
 */
import type { ProblemStep, Block, Problem } from '../../core/curriculum/types';
import type { AnswerSpec, Misconception, MisconceptionTag } from '../../core/math/answers';
import { checkAnswer } from '../../core/math/answers';
import { canonicalInput } from '../../core/engine/problems';
import { Rational } from '../../core/math/rational';
import { p, numberMisconceptions } from './util';

export type Hints4 = [string, string, string, string];
export interface StepMis {
  value: Rational | null;
  tag: MisconceptionTag;
  feedback: string;
}

function blocks(prompt: string | Block[]): Block[] {
  return typeof prompt === 'string' ? [p(prompt)] : prompt;
}

/** Every decimal digit of a terminating decimal, otherwise a fraction. */
function exact(v: Rational): string {
  const d = v.isTerminatingDecimal() ? v.toDecimalString(400) : '';
  return d && Rational.parse(d).eq(v) ? d : v.toString();
}

/** A step whose answer is a number. Misconceptions equal to the key (or to each other) are dropped. */
export function numStep(prompt: string | Block[], value: Rational, hints: Hints4, explanation: string, mis: StepMis[] = [], opts: { unit?: string; inputHint?: string; roundTo?: number } = {}): ProblemStep {
  return {
    prompt: blocks(prompt),
    answer: { kind: 'number', value: exact(value), ...(opts.unit ? { unit: opts.unit } : {}), ...(opts.roundTo !== undefined ? { roundTo: opts.roundTo } : {}) },
    ...(opts.inputHint ? { inputHint: opts.inputHint } : {}),
    hints,
    misconceptions: numberMisconceptions(opts.roundTo !== undefined ? value.round(opts.roundTo) : value, mis),
    explanation,
  };
}

/** A step with any answer spec (expression, equation, interval ...). */
export function specStep(prompt: string | Block[], answer: AnswerSpec, hints: Hints4, explanation: string, misconceptions: Misconception[] = [], inputHint?: string): ProblemStep {
  return { prompt: blocks(prompt), answer, ...(inputHint ? { inputHint } : {}), hints, misconceptions, explanation };
}

/**
 * A decision step with fixed option ids a, b, c ... in the order given (no randomness).
 * `wrong` gives feedback for a wrong option, by index.
 */
export function choiceStep(prompt: string | Block[], labels: string[], correct: number, hints: Hints4, explanation: string, wrong: Array<{ index: number; tag: MisconceptionTag; feedback: string }> = []): ProblemStep {
  const ids = 'abcdefgh';
  return {
    prompt: blocks(prompt),
    answer: { kind: 'choice', options: labels.map((label, i) => ({ id: ids[i], label })), correct: ids[correct] },
    hints,
    misconceptions: wrong.filter((w) => w.index !== correct && w.index < labels.length).map((w) => ({ answer: ids[w.index], tag: w.tag, feedback: w.feedback })),
    explanation,
  };
}

/** The last step: the problem's own answer spec and misconceptions, so it is graded like the problem. */
export function finalStep(pr: Pick<Problem, 'answer' | 'misconceptions' | 'inputHint'>, prompt: string | Block[], hints: Hints4, explanation: string): ProblemStep {
  return { prompt: blocks(prompt), answer: pr.answer, ...(pr.inputHint ? { inputHint: pr.inputHint } : {}), hints, misconceptions: pr.misconceptions, explanation };
}

/** Attach steps built from the finished problem (the last one usually comes from finalStep). */
export function withSteps(pr: Problem, build: (pr: Problem) => ProblemStep[]): Problem {
  return { ...pr, steps: build(pr) };
}

/** Text of a step's key: the number, or the label of the correct option. */
function keyText(st: ProblemStep): string {
  const a = st.answer;
  if (a.kind === 'choice') return a.options.find((o) => o.id === a.correct)?.label ?? '';
  return canonicalInput(a);
}

/**
 * verify() helper. `expected[i]` is step i's key recomputed independently by the caller: a Rational
 * for a number step, or the correct label for a choice step (null skips that step). Also checks
 * that the last step's key is accepted as the problem's own answer.
 */
export function stepErrors(pr: Problem, expected: Array<Rational | string | null>): string[] {
  const steps = pr.steps;
  if (!steps || steps.length === 0) return [];
  const errs: string[] = [];
  if (steps.length < 2 || steps.length > 4) errs.push(`${steps.length} steps`);
  steps.forEach((st, i) => {
    const want = expected[i];
    if (want === null || want === undefined) return;
    if (typeof want === 'string') {
      if (keyText(st) !== want) errs.push(`step ${i + 1}: expected "${want}"`);
    } else if (st.answer.kind !== 'number' || !Rational.parse(st.answer.value).eq(want)) errs.push(`step ${i + 1}: expected ${want.toString()}`);
  });
  const last = steps[steps.length - 1];
  if (checkAnswer(pr.answer, canonicalInput(last.answer)).status !== 'correct') errs.push('last step does not give the final answer');
  return errs;
}
