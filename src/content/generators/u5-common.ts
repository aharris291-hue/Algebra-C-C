/** Shared helpers for the Unit 5 generators: exponent TeX, exact evaluation, monomials and y = a(b)^x models. */
import type { Rng, Problem } from '../../core/curriculum/types';
import type { Node } from '../../core/math/parser';
import { parseExpression } from '../../core/math/parser';
import { Rational } from '../../core/math/rational';
import { Q, numStr } from './util';

// ---------------------------------------------------------------------------
// TeX -> parser syntax (brace-aware, unlike texToExpr) and exact evaluation
// ---------------------------------------------------------------------------

/** Convert generator TeX (\frac, ^{...}, \left( \right), \cdot) to parser syntax, matching braces properly. */
export function texToParser(tex: string): string {
  let i = 0;
  const s = tex.replace(/\\left|\\right/g, '').replace(/\\cdot|\\times/g, '*').replace(/\\,|\\;|\\ /g, '').replace(/\\dfrac|\\tfrac/g, '\\frac');
  const group = (): string => {
    // expects s[i] === '{'
    i++;
    const out = seq('}');
    i++;
    return out;
  };
  const seq = (end: string | null): string => {
    let out = '';
    while (i < s.length && s[i] !== end) {
      if (s.startsWith('\\frac', i)) {
        i += 5;
        const a = group();
        const b = group();
        out += `((${a})/(${b}))`;
      } else if (s[i] === '^' && s[i + 1] === '{') {
        i++;
        out += `^(${group()})`;
      } else if (s[i] === '{') {
        out += `(${group()})`;
      } else {
        out += s[i++];
      }
    }
    return out;
  };
  return seq(null);
}

/** Exact value of a constant expression with integer exponents (null when it is not one). */
export function exactRational(n: Node): Rational | null {
  switch (n.type) {
    case 'num':
      return n.value;
    case 'neg': {
      const a = exactRational(n.arg);
      return a && a.neg();
    }
    case 'add':
    case 'sub':
    case 'mul':
    case 'div': {
      const a = exactRational(n.left);
      const b = exactRational(n.right);
      if (!a || !b) return null;
      if (n.type === 'add') return a.add(b);
      if (n.type === 'sub') return a.sub(b);
      if (n.type === 'mul') return a.mul(b);
      return b.isZero() ? null : a.div(b);
    }
    case 'pow': {
      const a = exactRational(n.base);
      const e = exactRational(n.exp);
      if (!a || !e || !e.isInteger()) return null;
      if (a.isZero() && e.sign() <= 0) return null;
      return a.pow(e.toInt());
    }
    default:
      return null;
  }
}

export const texExact = (tex: string): Rational | null => exactRational(parseExpression(texToParser(tex)));

/** Parenthesize a base for a power in TeX when it is negative or a fraction. */
export function baseTex(b: Rational): string {
  return b.isNegative() || !b.isInteger() ? `\\left(${b.toTex()}\\right)` : b.toTex();
}
export const powTex = (b: Rational | number, e: number | string): string => `${baseTex(Q(b))}^{${e}}`;

// ---------------------------------------------------------------------------
// Monomials c * x^a * y^b (integer exponents, possibly negative)
// ---------------------------------------------------------------------------

export interface Mono {
  coef: Rational;
  exps: Record<string, number>;
}

export const mono = (coef: number | Rational, exps: Record<string, number>): Mono => ({ coef: Q(coef), exps: { ...exps } });

export function monoMul(a: Mono, b: Mono): Mono {
  const exps: Record<string, number> = { ...a.exps };
  for (const [v, e] of Object.entries(b.exps)) exps[v] = (exps[v] ?? 0) + e;
  return { coef: a.coef.mul(b.coef), exps };
}
export function monoDiv(a: Mono, b: Mono): Mono {
  const exps: Record<string, number> = { ...a.exps };
  for (const [v, e] of Object.entries(b.exps)) exps[v] = (exps[v] ?? 0) - e;
  return { coef: a.coef.div(b.coef), exps };
}
export function monoPow(a: Mono, n: number): Mono {
  const exps: Record<string, number> = {};
  for (const [v, e] of Object.entries(a.exps)) exps[v] = e * n;
  return { coef: a.coef.pow(n), exps };
}

const varPart = (v: string, e: number, tex: boolean) => (e === 1 ? v : tex ? `${v}^{${e}}` : `${v}^${e}`);

/**
 * A monomial exactly as written, possibly with negative or zero exponents (for prompts), e.g. 3x^{-2}y^{4}.
 * Variables listed in `order` are printed in that order.
 */
export function monoRawTex(m: Mono, order: string[]): string {
  const c = m.coef;
  const parts = order.filter((v) => m.exps[v] !== undefined).map((v) => varPart(v, m.exps[v], true));
  if (parts.length === 0) return c.toTex();
  const lead = c.eq(1) ? '' : c.eq(-1) ? '-' : c.isInteger() ? c.toTex() : `${c.toTex()}`;
  return lead + parts.join('');
}

/** Simplified form: positive exponents only, as {top, bottom} pieces. */
function simplifiedParts(m: Mono, order: string[], tex: boolean) {
  const top: string[] = [];
  const bottom: string[] = [];
  for (const v of order) {
    const e = m.exps[v] ?? 0;
    if (e > 0) top.push(varPart(v, e, tex));
    if (e < 0) bottom.push(varPart(v, -e, tex));
  }
  const neg = m.coef.isNegative();
  const cn = m.coef.abs().num;
  const cd = m.coef.abs().den;
  return { neg, cn, cd, top, bottom };
}

/** Simplified answer in parser syntax, e.g. "12x^3", "x^5/y^5", "-3a^2/(4b^3)", "1/(8x^6)". */
export function monoPlain(m: Mono, order: string[]): string {
  const { neg, cn, cd, top, bottom } = simplifiedParts(m, order, false);
  const numer = (cn === 1n && top.length ? '' : String(cn)) + top.join('');
  const denomBody = (cd === 1n ? '' : String(cd)) + bottom.join('');
  const sign = neg ? '-' : '';
  if (!denomBody) return sign + numer;
  const wrapped = denomBody.length > 1 && (bottom.length > 1 || cd !== 1n || /\^/.test(denomBody)) ? `(${denomBody})` : denomBody;
  return `${sign}${numer}/${wrapped}`;
}

/** Simplified answer in TeX. */
export function monoTex(m: Mono, order: string[]): string {
  const { neg, cn, cd, top, bottom } = simplifiedParts(m, order, true);
  const numer = (cn === 1n && top.length ? '' : String(cn)) + top.join('');
  const denomBody = (cd === 1n ? '' : String(cd)) + bottom.join('');
  const sign = neg ? '-' : '';
  return denomBody ? `${sign}\\frac{${numer}}{${denomBody}}` : sign + numer;
}

export const VAR_SETS: ReadonlyArray<[string, string]> = [
  ['x', 'y'],
  ['a', 'b'],
  ['m', 'n'],
];

// ---------------------------------------------------------------------------
// Exponential models y = a(b)^x
// ---------------------------------------------------------------------------

/** "y = 50(2)^x" in parser syntax; b printed as a decimal or fraction in parentheses. */
export function expPlain(a: Rational, b: Rational, x = 'x', y = 'y'): string {
  return `${y} = ${numStr(a)}(${numStr(b)})^${x}`;
}
export function expTex(a: Rational, b: Rational, x = 'x', y = 'y'): string {
  const bt = b.isInteger() || b.isTerminatingDecimal() ? b.toDecimalString(10) : b.toTex();
  const at = a.isInteger() || a.isTerminatingDecimal() ? a.toDecimalString(10) : a.toTex();
  return `${y} = ${at}\\left(${bt}\\right)^{${x}}`;
}

/** Decimal or fraction TeX of a value. */
export function dTex(x: Rational): string {
  return x.isInteger() || x.isTerminatingDecimal() ? x.toDecimalString(10) : x.toTex();
}

/** Comma-grouped whole number or decimal for display ("12,500"). */
export function commas(x: Rational | number, places?: number): string {
  const r = Q(x);
  const s = places === undefined ? r.toDecimalString(10) : r.round(places).toDecimalString(places);
  const [i, f] = s.replace('-', '').split('.');
  const grouped = i.replace(/\B(?=(\d{3})+(?!\d))/g, '{,}');
  return (r.isNegative() ? '-' : '') + grouped + (f ? '.' + (places !== undefined ? f.padEnd(places, '0') : f) : '');
}

/** Percent from a rate given as a decimal, e.g. 0.035 -> "3.5". */
export const pct = (r: Rational): string => r.mul(100).toDecimalString(10);

/** Find a single number in prompt text after a marker (verify helpers). */
export function textOf(pr: Pick<Problem, 'prompt'>): string {
  return pr.prompt.map((b) => (b.t === 'p' ? b.text : b.t === 'math' ? b.tex : '')).join(' ');
}

export const rngSign = (rng: Rng) => (rng.bool() ? 1 : -1);
