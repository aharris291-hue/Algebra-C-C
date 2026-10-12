/**
 * Builders for guided-practice steps in Unit 3 generators (rational and irrational numbers,
 * radicals). The last step of every stepped problem asks for the problem's own answer, so
 * finishing the steps means solving the problem. Option order in step choices comes from a
 * number in the problem (never from the rng), so adding steps never changes what a seed produces.
 */
import type { Problem, ProblemStep } from '../../core/curriculum/types';
import type { MisconceptionTag } from '../../core/math/answers';
import { checkAnswer } from '../../core/math/answers';
import { canonicalInput } from '../../core/engine/problems';
import { p } from './util';

export type ChoiceAnswer = { kind: 'choice'; options: { id: string; label: string }[]; correct: string };

/** A choice answer for a step: the correct label first in the list, rotated by `salt`. */
export function rotChoice(correct: string, distractors: string[], salt: number): ChoiceAnswer {
  const labels = [correct, ...distractors.filter((d, i, all) => d !== correct && all.indexOf(d) === i)];
  const shift = Math.abs(Math.trunc(salt)) % labels.length;
  const order = labels.map((_, i) => (i + shift) % labels.length);
  const options = order.map((k, i) => ({ id: 'abcdefgh'[i], label: labels[k] }));
  return { kind: 'choice', options, correct: 'abcdefgh'[order.indexOf(0)] };
}

/** Id of the option with this label ('' when absent). */
export function idOf(a: ChoiceAnswer, label: string): string {
  return a.options.find((o) => o.label === label)?.id ?? '';
}

/** Correct label of a step's choice answer ('' for other kinds). */
export function stepLabel(st: ProblemStep | undefined): string {
  if (!st || st.answer.kind !== 'choice') return '';
  const a = st.answer;
  return a.options.find((o) => o.id === a.correct)?.label ?? '';
}

/** Every step key is accepted by the checker, and the last step finishes the problem. */
export function stepsFinishErrors(pr: Problem): string[] {
  if (!pr.steps?.length) return [];
  const errs: string[] = [];
  pr.steps.forEach((st, i) => {
    if (checkAnswer(st.answer, canonicalInput(st.answer)).status !== 'correct') errs.push(`step ${i + 1} key is not accepted`);
  });
  const last = pr.steps[pr.steps.length - 1];
  const r = checkAnswer(pr.answer, canonicalInput(last.answer));
  if (r.status !== 'correct') errs.push(`last step answer ${canonicalInput(last.answer)} does not finish the problem (${r.status})`);
  return errs;
}

// ---------------------------------------------------------------------------
// Rational or irrational, one number at a time
// ---------------------------------------------------------------------------

/** The forms of number that appear at difficulty 1 of Lesson U3L01. */
export type NumForm = 'integer' | 'fraction' | 'terminating' | 'perfectRoot' | 'root' | 'pi';

/** Read the form of a number from its TeX. */
export function numForm(tex: string): NumForm {
  if (tex.includes('\\pi')) return 'pi';
  const r = /\\sqrt\{(\d+)\}/.exec(tex);
  if (r) return Number.isInteger(Math.sqrt(Number(r[1]))) ? 'perfectRoot' : 'root';
  if (tex.includes('\\frac')) return 'fraction';
  if (tex.includes('.')) return 'terminating';
  return 'integer';
}

export const RAT = 'Rational';
export const IRR = 'Irrational';

/** Feedback when a number of this form is put in the wrong group. */
export function wrongGroupFeedback(tex: string): string {
  switch (numForm(tex)) {
    case 'integer':
      return `Can $${tex}$ be written as a fraction of two integers? Every integer can: put it over $1$.`;
    case 'fraction':
      return 'A fraction whose top and bottom are integers is exactly what "rational" means.';
    case 'terminating':
      return 'A decimal that ends can be written as a fraction over $10$, $100$ or $1000$.';
    case 'perfectRoot':
      return `Not every square root is irrational. Work out $${tex}$ first: the number under the root is a perfect square.`;
    case 'root':
      return 'Is the number under the root a perfect square? If it is not, its square root never ends and never repeats.';
    case 'pi':
      return '$3.14$ is only a rounded value of $\\pi$. The decimal for $\\pi$ never ends and never repeats.';
  }
}

/** "On its own, is X rational or irrational?" with Rational listed first. */
export function ratStep(tex: string, rational: boolean, why: string, context = ''): ProblemStep {
  const answer: ChoiceAnswer = { kind: 'choice', options: [{ id: 'a', label: RAT }, { id: 'b', label: IRR }], correct: rational ? 'a' : 'b' };
  return {
    prompt: [p(`${context}On its own, is $${tex}$ rational or irrational?`)],
    answer,
    hints: [
      'A **rational** number can be written as a fraction $\\frac{a}{b}$ of two integers ($b \\ne 0$). An **irrational** number cannot.',
      'Integers, fractions and decimals that end or repeat are rational.',
      'For a square root, ask whether the number under the root is a perfect square ($4, 9, 16, 25, \\ldots$).',
      '$\\pi$, and the square root of a whole number that is not a perfect square, never end and never repeat.',
    ],
    misconceptions: [{ answer: rational ? 'b' : 'a', tag: 'other' as MisconceptionTag, feedback: wrongGroupFeedback(tex) }],
    explanation: `$${tex}$ is ${rational ? 'rational' : 'irrational'}. ${why}`,
  };
}

/** Misconceptions for wrong options of a choice answer, looked up by label; absent labels and the key are skipped. */
export function optionMisList(a: ChoiceAnswer, list: Array<[string, MisconceptionTag, string]>): Array<{ answer: string; tag: MisconceptionTag; feedback: string }> {
  const out: Array<{ answer: string; tag: MisconceptionTag; feedback: string }> = [];
  for (const [label, tag, feedback] of list) {
    const o = a.options.find((x) => x.label === label);
    if (o && o.id !== a.correct && !out.some((m) => m.answer === o.id)) out.push({ answer: o.id, tag, feedback });
  }
  return out;
}
