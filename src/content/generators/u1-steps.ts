/**
 * Builders for guided-practice steps in Unit 1 generators.
 * A step is one small piece of the method the lesson teaches (find the rise, read the input,
 * undo the constant ...). The last step of every problem asks for the problem's own answer,
 * so finishing the steps means solving the problem.
 */
import type { ProblemStep, Block, Problem } from '../../core/curriculum/types';
import type { AnswerSpec, Misconception, MisconceptionTag } from '../../core/math/answers';
import { checkAnswer } from '../../core/math/answers';
import { Rational } from '../../core/math/rational';
import { p, numStr, numberMisconceptions } from './util';

type Hints = [string, string, string, string];

/** Prompt text or blocks. */
function blocks(prompt: string | Block[]): Block[] {
  return typeof prompt === 'string' ? [p(prompt)] : prompt;
}

/** A step whose answer is a number. Misconceptions equal to the key (or to each other) are dropped. */
export function numStep(
  prompt: string | Block[],
  value: Rational,
  hints: Hints,
  explanation: string,
  misc: Array<{ value: Rational | null; tag: MisconceptionTag; feedback: string }> = [],
  inputHint?: string,
): ProblemStep {
  return {
    prompt: blocks(prompt),
    answer: { kind: 'number', value: numStr(value) },
    ...(inputHint ? { inputHint } : {}),
    hints,
    misconceptions: numberMisconceptions(value, misc),
    explanation,
  };
}

/**
 * A decision step with fixed option ids a, b, c ... in the order given (no randomness, so adding
 * steps never changes the problems a seed produces). `wrong` maps an option index to feedback.
 */
export function choiceStep(
  prompt: string | Block[],
  labels: string[],
  correct: number,
  hints: Hints,
  explanation: string,
  wrong: Array<{ index: number; tag: MisconceptionTag; feedback: string }> = [],
): ProblemStep {
  const ids = 'abcdefgh';
  return {
    prompt: blocks(prompt),
    answer: { kind: 'choice', options: labels.map((label, i) => ({ id: ids[i], label })), correct: ids[correct] },
    hints,
    misconceptions: wrong.filter((w) => w.index !== correct && w.index < labels.length).map((w) => ({ answer: ids[w.index], tag: w.tag, feedback: w.feedback })),
    explanation,
  };
}

/** The last step: it asks for the problem's own answer (same spec, so it is graded the same way). */
export function finalStep(prompt: string | Block[], answer: AnswerSpec, hints: Hints, explanation: string, misconceptions: Misconception[] = [], inputHint?: string): ProblemStep {
  return { prompt: blocks(prompt), answer, ...(inputHint ? { inputHint } : {}), hints, misconceptions, explanation };
}

/** "+ 5" or "- 5" for TeX after a term. */
export function plusTex(b: Rational, tex: (x: Rational) => string = (x) => x.toTex()): string {
  return b.isNegative() ? ` - ${tex(b.abs())}` : ` + ${tex(b)}`;
}

/** Text the checker accepts as the key of a spec (mirrors the engine's canonical input). */
export function keyText(a: AnswerSpec): string {
  switch (a.kind) {
    case 'number':
      return a.value;
    case 'point':
      return `(${a.x}, ${a.y})`;
    case 'choice':
      return a.correct;
    case 'solutions':
      return a.values.length === 0 ? 'no real solutions' : a.values.join(', ');
    case 'sequence-terms':
      return a.values.join(', ');
    case 'region-point':
      return `(${a.example.x}, ${a.example.y})`;
    default:
      return (a as { value: string }).value;
  }
}

/**
 * Independent check of guided steps for verify(): `expected[i]` is the value step i must have,
 * recomputed by the caller from the prompt (a Rational for a number step, the correct option's
 * label for a choice step, any accepted input text otherwise, or null to skip). The last step
 * must also be equivalent to the problem's final answer.
 */
export function stepErrors(pr: Problem, expected: Array<Rational | string | null>): string[] {
  const st = pr.steps;
  if (!st || st.length === 0) return [];
  const errs: string[] = [];
  if (st.length !== expected.length) errs.push(`expected ${expected.length} steps, found ${st.length}`);
  st.forEach((s, i) => {
    const want = expected[i];
    if (want === null || want === undefined) return;
    if (want instanceof Rational) {
      if (s.answer.kind !== 'number' || !Rational.parse(s.answer.value).eq(want)) errs.push(`step ${i + 1} should be ${want}`);
    } else if (s.answer.kind === 'choice') {
      const label = s.answer.options.find((o) => o.id === (s.answer as { correct: string }).correct)?.label;
      if (label !== want) errs.push(`step ${i + 1} should choose "${want}"`);
    } else if (checkAnswer(s.answer, want).status !== 'correct') errs.push(`step ${i + 1} does not accept ${want}`);
  });
  const last = st[st.length - 1];
  if (checkAnswer(pr.answer, keyText(last.answer)).status !== 'correct') errs.push('last step is not the final answer');
  return errs;
}
