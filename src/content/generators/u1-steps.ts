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
import { realMistakes } from './u7-steps';

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

/** The last step: it asks for the problem's own answer (same spec, so it is graded the same way). Misconceptions equal to the key are dropped. */
export function finalStep(prompt: string | Block[], answer: AnswerSpec, hints: Hints, explanation: string, misconceptions: Misconception[] = [], inputHint?: string): ProblemStep {
  return { prompt: blocks(prompt), answer, ...(inputHint ? { inputHint } : {}), hints, misconceptions: realMistakes(answer, misconceptions), explanation };
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

/**
 * Error-specific feedback for the wrong options of a choice answer, looked up by label. Labels that
 * are not among the options (makeChoice drops duplicates) or that are the key are skipped.
 */
export function choiceMisc(answer: { options: { id: string; label: string }[]; correct: string }, list: Array<{ label: string; tag: MisconceptionTag; feedback: string }>): Misconception[] {
  const out: Misconception[] = [];
  for (const m of list) {
    const o = answer.options.find((x) => x.label === m.label);
    if (o && o.id !== answer.correct && !out.some((x) => x.answer === o.id)) out.push({ answer: o.id, tag: m.tag, feedback: m.feedback });
  }
  return out;
}


/**
 * A sign hint for computing a - b that fits the actual numbers: it talks about subtracting a
 * negative only when b is negative, and about a negative result only when there is one.
 */
export function minusHint(a: Rational | number, b: Rational | number): string {
  const A = Rational.from(a);
  const B = Rational.from(b);
  if (B.isNegative()) return `Subtracting a negative means adding: $${A.toTex()} - (${B.toTex()})$ is the same as $${A.toTex()} + ${B.abs().toTex()}$.`;
  if (B.isZero()) return 'Subtracting 0 leaves the first number unchanged.';
  if (A.isNegative()) return 'You start below zero and take away more, so the result is further below zero.';
  if (A.eq(B)) return 'The two numbers are equal, so the result is 0.';
  if (A.lt(B)) return 'You take away more than you start with, so the result is negative.';
  return 'Neither number is negative and the first is larger, so the result is positive.';
}

/** A sign hint for computing a + b that mentions negatives only when one is involved. */
export function plusHint(a: Rational | number, b: Rational | number): string {
  const A = Rational.from(a);
  const B = Rational.from(b);
  if (B.isNegative()) return `Adding a negative is the same as subtracting: $${A.toTex()} + (${B.toTex()})$ is $${A.toTex()} - ${B.abs().toTex()}$.`;
  if (A.isNegative()) return `Start at $${A.toTex()}$ on a number line and move $${B.toTex()}$ to the right.`;
  return `Neither number is negative, so this is ordinary addition: $${A.toTex()} + ${B.toTex()}$.`;
}

/** "Use a number line" when a negative is involved; otherwise a check by counting up. */
export function checkMinusHint(a: Rational | number, b: Rational | number): string {
  const A = Rational.from(a);
  const B = Rational.from(b);
  return A.isNegative() || B.isNegative() || A.lt(B) ? 'Use a number line if the signs are tricky.' : `Check: count up from $${B.toTex()}$ to $${A.toTex()}$.`;
}
