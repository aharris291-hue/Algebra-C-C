/** Shared helpers for problem generators. */
import { Rational } from '../../core/math/rational';
import type { Misconception, MisconceptionTag } from '../../core/math/answers';
import { exactValue } from '../../core/math/answers';
import type { Block, Problem, SolutionStep, Rng } from '../../core/curriculum/types';
import { toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';

export const Q = (n: number | bigint | string | Rational, d?: number): Rational => {
  const r = n instanceof Rational ? n : Rational.from(n as never);
  return d === undefined ? r : r.div(Rational.from(d));
};

export const p = (text: string): Block => ({ t: 'p', text });
export const math = (tex: string): Block => ({ t: 'math', tex });

/** Money as display text with an escaped dollar sign, e.g. "\$12.50". */
export function money(x: Rational | number): string {
  const r = Rational.from(x as never);
  const s = r.round(2).toDecimalString(2);
  const [i, f = ''] = s.replace('-', '').split('.');
  const body = f.length === 0 ? i : `${i}.${f.padEnd(2, '0')}`;
  return (r.isNegative() ? '-' : '') + '\\$' + body;
}

/** Plain decimal/fraction string usable as checker input. */
export function numStr(x: Rational): string {
  return x.isInteger() || x.isTerminatingDecimal() ? x.toDecimalString(10) : x.toString();
}

/** Keep only misconceptions whose numeric answers differ from the key and from each other. */
export function numberMisconceptions(correct: Rational, list: Array<{ value: Rational | null; tag: MisconceptionTag; feedback: string }>): Misconception[] {
  const seen: Rational[] = [correct];
  const out: Misconception[] = [];
  for (const m of list) {
    if (!m.value) continue;
    if (seen.some((s) => s.eq(m.value!))) continue;
    seen.push(m.value);
    out.push({ answer: numStr(m.value), tag: m.tag, feedback: m.feedback });
  }
  return out;
}

/** Keep only misconceptions (expression strings) that differ from the key and each other (exact compare when constant). */
export function stringMisconceptions(correct: string, list: Misconception[]): Misconception[] {
  const out: Misconception[] = [];
  const same = (a: string, b: string) => {
    if (a.replace(/\s/g, '') === b.replace(/\s/g, '')) return true;
    try {
      const x = exactValue(a);
      const y = exactValue(b);
      return !!x && !!y && x.equals(y);
    } catch {
      return false;
    }
  };
  for (const m of list) {
    if (same(m.answer, correct)) continue;
    if (out.some((o) => same(o.answer, m.answer))) continue;
    out.push(m);
  }
  return out;
}

export function makeProblem(fields: Omit<Problem, 'id' | 'generatorId' | 'seed' | 'difficulty'> & Partial<Pick<Problem, 'difficulty'>>): Problem {
  return { id: '', generatorId: '', seed: 0, difficulty: 1, ...fields } as Problem;
}

export function steps(...s: SolutionStep[]): SolutionStep[] {
  return s;
}

/** Coefficient display in TeX for a term like m·x where m is printed in front. */
export function texCoef(m: Rational): string {
  if (m.eq(1)) return '';
  if (m.eq(-1)) return '-';
  return m.toTex();
}

/** TeX for a value substituted into an expression: negatives in parentheses. */
export function sub(x: Rational): string {
  return x.isNegative() ? `(${x.toTex()})` : x.toTex();
}

export const FUNC_NAMES = ['f', 'g', 'h'] as const;

export function pickDistinct(rng: Rng, count: number, min: number, max: number, exclude: number[] = []): number[] {
  const out: number[] = [];
  let guard = 0;
  while (out.length < count && guard++ < 1000) {
    const v = rng.int(min, max);
    if (!out.includes(v) && !exclude.includes(v)) out.push(v);
  }
  if (out.length < count) throw new Error('pickDistinct: range too small');
  return out;
}

/** Plain-language sign-aware "add b" phrase for explanations. */
export function addPhrase(b: Rational): string {
  return b.isNegative() ? `subtract ${b.abs().toTex()}` : `add ${b.toTex()}`;
}

/** Shuffle options into a multiple-choice answer; ids are a, b, c, d in display order. */
export function makeChoice(rng: Rng, correct: string, distractors: string[]): { kind: 'choice'; options: { id: string; label: string }[]; correct: string } {
  const labels = [correct, ...distractors.filter((d, i, all) => d !== correct && all.indexOf(d) === i)];
  const order = rng.shuffle(labels.map((_, i) => i));
  const ids = 'abcdefgh';
  const options = order.map((k, i) => ({ id: ids[i], label: labels[k] }));
  return { kind: 'choice', options, correct: ids[order.indexOf(0)] };
}

/** Label of the correct option of a choice answer. */
export function choiceLabel(a: { kind: string; options?: { id: string; label: string }[]; correct?: string }): string {
  return a.options?.find((o) => o.id === a.correct)?.label ?? '';
}

/** Turn generator TeX (fractions, \cdot) back into parser syntax, so verify() can re-read a prompt. */
export function texToExpr(tex: string): string {
  return tex
    .replace(/\\left|\\right/g, '')
    .replace(/\\dfrac|\\tfrac/g, '\\frac')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))')
    .replace(/\\cdot|\\times/g, '*')
    .replace(/\\,|\\;|\\ /g, '')
    .replace(/\{|\}/g, '');
}

/** Exact value of a constant expression written in parser syntax or generator TeX. */
export function texValue(tex: string): Rational {
  return toPoly(parseExpression(texToExpr(tex))).constantValue();
}

/** TeX for a number: a decimal when it terminates, otherwise a fraction. */
export function decimalOrFraction(x: Rational): string {
  return x.isInteger() || x.isTerminatingDecimal() ? x.toDecimalString(10) : x.toTex();
}
