/** Shared helpers for Unit 4 (quadratic expressions and equations) generators. */
import type { Block, Problem, ProblemStep } from '../../core/curriculum/types';
import type { AnswerSpec, Misconception, MisconceptionTag } from '../../core/math/answers';
import { checkAnswer } from '../../core/math/answers';
import { canonicalInput } from '../../core/engine/problems';
import { Poly, toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { polyTex, polyPlain } from '../../core/math/format';
import { Surd, trySurd } from '../../core/math/surd';
import { Rational } from '../../core/math/rational';
import { Q, texToExpr } from './util';
import { splitPower, radPlain, radTex } from './u3-common';

export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const gcdAll = (xs: number[]): number => xs.reduce((g, x) => gcd(g, x), 0);

/** Polynomial in x from coefficients, constant first: X([c, b, a]) = ax^2 + bx + c. */
export const X = (coeffs: number[]): Poly => Poly.fromCoeffs('x', coeffs.map((c) => Q(c)));
/** ax + b */
export const lin = (a: number, b: number): Poly => X([b, a]);

export const pTex = (p: Poly, v = 'x'): string => polyTex(p, [v]);
export const pPlain = (p: Poly, v = 'x'): string => polyPlain(p, [v]);

/** "(2x - 3)" style factor text, plain or TeX. */
export const linPlain = (a: number, b: number): string => polyPlain(lin(a, b), ['x']);
export const linTex = (a: number, b: number): string => polyTex(lin(a, b), ['x']);

/** Polynomial written in generator TeX. */
export function texPoly(tex: string): Poly {
  return toPoly(parseExpression(texToExpr(tex)));
}
export function plainPoly(s: string): Poly {
  return toPoly(parseExpression(s));
}

/** lhs - rhs of an equation written in TeX, "x^{2} - 5x = 14". */
export function texEquation(tex: string): Poly {
  const [l, r] = tex.split('=');
  return texPoly(l).sub(texPoly(r));
}

/** The math block in a problem prompt (the expression or equation being worked on). */
export function mathOf(pr: Pick<Problem, 'prompt'>): string | null {
  for (const b of pr.prompt as Block[]) if (b.t === 'math') return b.tex;
  return null;
}

/** Exact value of a univariate polynomial at a radical number. */
export function polyAtSurd(p: Poly, s: Surd): Surd {
  const cs = p.coeffsIn('x');
  let acc = Surd.rational(Rational.ZERO);
  for (let i = cs.length - 1; i >= 0; i--) acc = acc.mul(s).add(Surd.rational(cs[i]));
  return acc;
}

export interface RootSet {
  /** parser syntax, one per solution */
  values: string[];
  /** TeX like "x = 3 \pm 2\sqrt{5}" */
  tex: string;
  /** typed form a student might use, e.g. "3 ± 2sqrt(5)" */
  display: string;
}

/** Exact real solutions of ax^2 + bx + c = 0 (integers), in simplest form. */
export function quadRoots(a: number, b: number, c: number): RootSet {
  const D = b * b - 4 * a * c;
  if (D < 0) return { values: [], tex: '\\text{no real solutions}', display: 'no real solutions' };
  const s = Math.sqrt(D);
  if (Number.isInteger(s)) {
    const r1 = Q(-b + s, 2 * a);
    const r2 = Q(-b - s, 2 * a);
    if (r1.eq(r2)) return { values: [r1.toString()], tex: `x = ${r1.toTex()}`, display: r1.toString() };
    const [hi, lo] = r1.gt(r2) ? [r1, r2] : [r2, r1];
    return { values: [hi.toString(), lo.toString()], tex: `x = ${hi.toTex()} \\text{ or } x = ${lo.toTex()}`, display: `${hi.toString()}, ${lo.toString()}` };
  }
  const { out: k, inside: m } = splitPower(D, 2);
  let nb = -b;
  let kk = k;
  let den = 2 * a;
  const g = gcdAll([nb, kk, den]);
  nb /= g;
  kk /= g;
  den /= g;
  if (den < 0) {
    nb = -nb;
    den = -den;
  }
  const rp = radPlain(kk, m);
  const rt = radTex(kk, m);
  const plus = nb === 0 ? rp : `${nb} + ${rp}`;
  const minus = nb === 0 ? `-${rp}` : `${nb} - ${rp}`;
  const values = den === 1 ? [plus, minus] : [`(${plus})/${den}`, `(${minus})/${den}`];
  const pmTex = nb === 0 ? `\\pm ${rt}` : `${nb} \\pm ${rt}`;
  const pmPlain = nb === 0 ? `±${rp}` : `${nb} ± ${rp}`;
  return {
    values,
    tex: den === 1 ? `x = ${pmTex}` : `x = \\frac{${pmTex}}{${den}}`,
    display: den === 1 ? pmPlain : `(${pmPlain})/${den}`,
  };
}

/**
 * Independent check of a solution list for p(x) = 0: every value is an exact root, values are
 * distinct, and the count matches the number of real roots found from the vertex height.
 */
export function checkSolutions(p: Poly, values: string[]): string[] {
  const errs: string[] = [];
  const cs = p.coeffsIn('x');
  if (cs.length !== 3 || cs[2].isZero()) return ['equation is not quadratic'];
  const surds = values.map((v) => trySurd(parseExpression(v)));
  if (surds.some((s) => !s)) return ['a solution is not an exact number'];
  surds.forEach((s, i) => {
    if (!polyAtSurd(p, s!).isZero()) errs.push(`${values[i]} is not a solution`);
  });
  for (let i = 0; i < surds.length; i++) for (let j = i + 1; j < surds.length; j++) if (surds[i]!.equals(surds[j]!)) errs.push('repeated solution');
  // vertex height k = c - b^2/(4a): a parabola opening toward k = 0 from the other side crosses twice
  const [c, b, a] = cs;
  const k = c.sub(b.mul(b).div(a.mul(4)));
  const expected = k.isZero() ? 1 : k.sign() !== a.sign() ? 2 : 0;
  if (expected !== values.length) errs.push(`expected ${expected} solutions, key has ${values.length}`);
  return errs;
}

/** Sign-change check that a rounded value is a root of p to the given places. */
export function roundedRootOk(p: Poly, v: number, places: number): boolean {
  const h = 0.5 * Math.pow(10, -places);
  const f = (x: number) => p.coeffsIn('x').reduce((acc, c, i) => acc + c.toNumber() * Math.pow(x, i), 0);
  const lo = f(v - h);
  const hi = f(v + h);
  return lo === 0 || hi === 0 || Math.sign(lo) !== Math.sign(hi);
}

/** Pairs of integers whose product is n (n != 0), as [p, q] with p <= q. */
export function factorPairs(n: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const m = Math.abs(n);
  for (let d = 1; d * d <= m; d++)
    if (m % d === 0) {
      const e = m / d;
      if (n > 0) out.push([d, e], [-e, -d]);
      else out.push([-d, e], [-e, d]);
    }
  return out;
}

export const pairLabel = (p: number, q: number) => `$${p}$ and $${q}$`;

// ---------------------------------------------------------------------------
// Quadratic functions (Unit 4, Lessons 12-19)
// ---------------------------------------------------------------------------

type Num = number | Rational;
const R = (n: Num): Rational => (n instanceof Rational ? n : Q(n));

/** p evaluated at a number. */
export function ev(poly: Poly, x: Num, v = 'x'): Rational {
  return poly.evaluate({ [v]: R(x) });
}

/** a, b, c and the vertex (h, k) of a quadratic in v. */
export function vertexOf(poly: Poly, v = 'x'): { a: Rational; b: Rational; c: Rational; h: Rational; k: Rational } {
  const cs = poly.coeffsIn(v);
  if (cs.length !== 3 || cs[2].isZero()) throw new Error('not quadratic');
  const [c, b, a] = cs;
  const h = b.neg().div(a.mul(2));
  return { a, b, c, h, k: ev(poly, h, v) };
}

/** Leading factor in TeX / parser syntax: 1 -> "", -1 -> "-", 1/2 -> "\frac{1}{2}" / "(1/2)". */
export function coefTex(a: Num): string {
  const r = R(a);
  if (r.eq(1)) return '';
  if (r.eq(-1)) return '-';
  return r.toTex();
}
export function coefPlain(a: Num): string {
  const r = R(a);
  if (r.eq(1)) return '';
  if (r.eq(-1)) return '-';
  return r.isInteger() ? r.toString() : `(${r.toString()})`;
}

/** " + 3" / " - 3" / "" for a trailing constant. */
export function tailTex(k: Num): string {
  const r = R(k);
  return r.isZero() ? '' : r.isNegative() ? ` - ${r.abs().toTex()}` : ` + ${r.toTex()}`;
}
export function tailPlain(k: Num): string {
  const r = R(k);
  return r.isZero() ? '' : r.isNegative() ? ` - ${r.abs().toString()}` : ` + ${r.toString()}`;
}

/** (v - h) in TeX / plain; just v when h = 0. */
const shiftTex = (h: Num, v: string) => (R(h).isZero() ? v : `\\left(${polyTex(Poly.fromCoeffs(v, [R(h).neg(), Q(1)]), [v])}\\right)`);
const shiftPlain = (h: Num, v: string) => (R(h).isZero() ? v : `(${polyPlain(Poly.fromCoeffs(v, [R(h).neg(), Q(1)]), [v])})`);

/** a(x - h)^2 + k */
export function vtxTex(a: Num, h: Num, k: Num, v = 'x'): string {
  return `${coefTex(a)}${shiftTex(h, v)}^{2}${tailTex(k)}`;
}
export function vtxPlain(a: Num, h: Num, k: Num, v = 'x'): string {
  return `${coefPlain(a)}${shiftPlain(h, v)}^2${tailPlain(k)}`;
}
export function vtxPoly(a: Num, h: Num, k: Num, v = 'x'): Poly {
  const s = Poly.fromCoeffs(v, [R(h).neg(), Q(1)]);
  return s.mul(s).scale(R(a)).add(Poly.const(R(k)));
}

/** a(x - r)(x - s); a repeated zero is written as a square. */
export function factTex(a: Num, r: Num, s: Num, v = 'x'): string {
  if (R(s).isZero() && !R(r).isZero()) [r, s] = [s, r]; // a bare x factor goes first: x(x + 3)
  if (R(r).eq(R(s))) return `${coefTex(a)}${shiftTex(r, v)}^{2}`;
  return `${coefTex(a)}${shiftTex(r, v)}${shiftTex(s, v)}`;
}
export function factPlain(a: Num, r: Num, s: Num, v = 'x'): string {
  if (R(s).isZero() && !R(r).isZero()) [r, s] = [s, r]; // a bare x factor goes first: x(x + 3)
  if (R(r).eq(R(s))) return `${coefPlain(a)}${shiftPlain(r, v)}^2`;
  return `${coefPlain(a)}${shiftPlain(r, v)}${shiftPlain(s, v)}`;
}
export function factPoly(a: Num, r: Num, s: Num, v = 'x'): Poly {
  return Poly.fromCoeffs(v, [R(r).neg(), Q(1)]).mul(Poly.fromCoeffs(v, [R(s).neg(), Q(1)])).scale(R(a));
}

/** The polynomial on the right of "f(x) = ..." in generator TeX. */
export function rhsPoly(tex: string): Poly {
  const i = tex.indexOf('=');
  return texPoly(i >= 0 ? tex.slice(i + 1) : tex);
}

/** All math blocks of a prompt, in order. */
export function mathBlocks(pr: Pick<Problem, 'prompt'>): string[] {
  return (pr.prompt as Block[]).filter((b): b is Extract<Block, { t: 'math' }> => b.t === 'math').map((b) => b.tex);
}

/** Text of all paragraph blocks of a prompt. */
export function promptText(pr: Pick<Problem, 'prompt'>): string {
  return (pr.prompt as Block[]).map((b) => (b.t === 'p' ? b.text : '')).join(' ');
}

/** The first graph in a prompt. */
export function graphOf(pr: Pick<Problem, 'prompt'>): Extract<Block, { t: 'graph' }>['spec'] | null {
  for (const b of pr.prompt as Block[]) if (b.t === 'graph') return b.spec;
  return null;
}

/** TeX of a number substituted into an expression: negatives and fractions in parentheses. */
export function subTex(x: Num): string {
  const r = R(x);
  return r.isNegative() || !r.isInteger() ? `\\left(${r.toTex()}\\right)` : r.toTex();
}

/** "3 + 4 - 5" from signed numbers (TeX). */
export function joinNums(ns: Num[]): string {
  return ns.map((n, i) => {
    const r = R(n);
    if (i === 0) return r.toTex();
    return r.isNegative() ? ` - ${r.abs().toTex()}` : ` + ${r.toTex()}`;
  }).join('');
}

/** "f(-3) = 2(-3)^2 - 5(-3) + 1" substitution TeX for a standard-form quadratic. */
export function substituteTex(a: Num, b: Num, c: Num, x: Num): string {
  const A = R(a);
  const B = R(b);
  const C = R(c);
  const px = `\\left(${R(x).toTex()}\\right)`;
  let s = `${coefTex(A)}${px}^{2}`;
  if (!B.isZero()) s += `${B.isNegative() ? ' - ' : ' + '}${B.abs().eq(1) ? '' : B.abs().toTex()}${px}`;
  s += tailTex(C);
  return s;
}

// ---------------------------------------------------------------------------
// Guided steps (lesson audit): helpers shared by the Unit 4 generators
// ---------------------------------------------------------------------------

type Choice = { kind: 'choice'; options: { id: string; label: string }[]; correct: string };

/**
 * A multiple-choice step answer whose option order comes from the labels' text, so building a
 * step never draws from the problem's random number generator (the problem a seed produces is
 * unchanged by adding steps).
 */
export function fixedChoice(correct: string, distractors: string[]): Choice {
  const labels = [correct, ...distractors.filter((d, i, all) => d !== correct && all.indexOf(d) === i)];
  let hash = 0;
  for (const ch of labels.join('|')) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const n = labels.length;
  const at = hash % n; // position of the correct option
  const ids = 'abcdefgh';
  const options = labels.map((_, i) => ({ id: ids[i], label: labels[(i - at + n) % n] }));
  return { kind: 'choice', options, correct: ids[at] };
}

/** Misconception for picking a particular wrong option of a choice step (null if the label is absent or correct). */
export function choiceMis(spec: Choice, label: string, tag: MisconceptionTag, feedback: string): Misconception | null {
  const o = spec.options.find((x) => x.label === label);
  return o && o.id !== spec.correct ? { answer: o.id, tag, feedback } : null;
}

/** Expression misconceptions that differ from the key and from each other (compared as polynomials). */
export function exprMis(key: string, list: Array<{ answer: string; tag: MisconceptionTag; feedback: string } | null>): Misconception[] {
  const seen: Poly[] = [plainPoly(key)];
  const out: Misconception[] = [];
  for (const m of list) {
    if (!m) continue;
    const q = plainPoly(m.answer);
    if (seen.some((s) => s.equals(q))) continue;
    seen.push(q);
    out.push(m);
  }
  return out;
}

/** Number misconceptions that differ from the key and from each other. */
export function numMis(key: Num, list: Array<{ value: Num; tag: MisconceptionTag; feedback: string } | null>): Misconception[] {
  const seen: Rational[] = [R(key)];
  const out: Misconception[] = [];
  for (const m of list) {
    if (!m) continue;
    const v = R(m.value);
    if (seen.some((s) => s.eq(v))) continue;
    seen.push(v);
    out.push({ answer: v.isInteger() || v.isTerminatingDecimal() ? v.toDecimalString(10) : v.toString(), tag: m.tag, feedback: m.feedback });
  }
  return out;
}

/** A guided step. */
export function gstep(text: string, answer: AnswerSpec, hints: [string, string, string, string], explanation: string, misconceptions: Array<Misconception | null> = [], inputHint?: string): ProblemStep {
  const mis = misconceptions.filter((m): m is Misconception => !!m);
  return { prompt: [{ t: 'p', text }], answer, hints, explanation, ...(mis.length ? { misconceptions: mis } : {}), ...(inputHint ? { inputHint } : {}) };
}

/**
 * verify() check for guided steps: the last step's key must be accepted as the problem's
 * final answer, and each expected step value (recomputed by the generator's verify from the
 * prompt) must be accepted by that step's key. `expected[i]` is typed input, or null to skip.
 */
export function checkSteps(pr: Pick<Problem, 'answer' | 'steps'>, expected?: Array<string | null>): string[] {
  const steps = pr.steps ?? [];
  if (!steps.length) return [];
  const errs: string[] = [];
  const last = steps[steps.length - 1];
  if (checkAnswer(pr.answer, canonicalInput(last.answer)).status !== 'correct') errs.push('last step is not the final answer');
  expected?.forEach((e, i) => {
    if (e === null) return;
    if (!steps[i]) errs.push(`missing step ${i + 1}`);
    else if (checkAnswer(steps[i].answer, e).status !== 'correct') errs.push(`step ${i + 1} key does not match ${e}`);
  });
  if (expected && expected.length !== steps.length) errs.push(`expected ${expected.length} steps, got ${steps.length}`);
  return errs;
}

/** Typed input for the option of a choice spec with this label (for checkSteps). */
export function pickLabel(spec: AnswerSpec, label: string): string {
  if (spec.kind !== 'choice') return '#not-a-choice';
  return spec.options.find((o) => o.label === label)?.id ?? '#missing-option';
}

/**
 * Misconceptions for the wrong options of a choice answer: one entry per distractor label, as
 * [label, tag, feedback]. Entries whose label is absent or is the correct option are dropped.
 */
export function choiceMisList(spec: Choice, entries: Array<[string, MisconceptionTag, string]>): Misconception[] {
  const out: Misconception[] = [];
  for (const [label, tag, feedback] of entries) {
    const m = choiceMis(spec, label, tag, feedback);
    if (m && !out.some((o) => o.answer === m.answer)) out.push(m);
  }
  return out;
}
