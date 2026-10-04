/**
 * Formatting helpers. Generators build every displayed expression through these
 * functions so that coefficient/sign formatting (1x -> x, + -3 -> - 3, 0 terms
 * dropped) is handled in one tested place.
 */
import { Rational } from './rational';
import { Poly } from './poly';
import type { Node } from './parser';

type Q = Rational | number;
const q = (x: Q) => Rational.from(x);

function monoTex(m: Record<string, number>, order: string[]): string {
  const vars = Object.keys(m).sort((a, b) => order.indexOf(a) - order.indexOf(b) || (a < b ? -1 : 1));
  return vars.map((v) => (m[v] === 1 ? v : `${v}^{${m[v]}}`)).join('');
}
function monoPlain(m: Record<string, number>, order: string[]): string {
  const vars = Object.keys(m).sort((a, b) => order.indexOf(a) - order.indexOf(b) || (a < b ? -1 : 1));
  return vars.map((v) => (m[v] === 1 ? v : `${v}^${m[v]}`)).join('');
}

/** Coefficient TeX: fraction by default, or a terminating decimal when `decimals` is set (money, rates). */
function coefBody(a: Rational, decimals: boolean): string {
  return decimals && a.isTerminatingDecimal() ? a.toDecimalString(10) : a.toTex();
}

/** LaTeX for a polynomial in descending degree order, e.g. "2x^{2} - x + \frac{1}{2}". */
export function polyTex(p: Poly, order: string[] = ['x', 'y'], decimals = false): string {
  const ts = p.sortedTerms();
  if (ts.length === 0) return '0';
  let out = '';
  ts.forEach(([m, c], i) => {
    const neg = c.isNegative();
    const a = c.abs();
    const mono = monoTex(m, order);
    let body: string;
    if (mono === '') body = coefBody(a, decimals);
    else if (a.eq(1)) body = mono;
    else body = coefBody(a, decimals) + mono;
    out += i === 0 ? (neg ? '-' : '') + body : (neg ? ' - ' : ' + ') + body;
  });
  return out;
}

/** Plain text, e.g. "2x^2 - x + 1/2" (fractions as a/b). Also valid parser input. */
export function polyPlain(p: Poly, order: string[] = ['x', 'y']): string {
  const ts = p.sortedTerms();
  if (ts.length === 0) return '0';
  let out = '';
  ts.forEach(([m, c], i) => {
    const neg = c.isNegative();
    const a = c.abs();
    const mono = monoPlain(m, order);
    let body: string;
    if (mono === '') body = a.toString();
    else if (a.eq(1)) body = mono;
    else if (a.isInteger()) body = a.toString() + mono;
    else body = `(${a.toString()})${mono}`;
    out += i === 0 ? (neg ? '-' : '') + body : (neg ? ' - ' : ' + ') + body;
  });
  return out;
}

/** "mx + b" LaTeX from slope and intercept (any variable). */
export function linearTex(m: Q, b: Q, v = 'x', decimals = false): string {
  return polyTex(Poly.fromCoeffs(v, [q(b), q(m)]), [v], decimals);
}
/** Decimal coefficients (for money and measured rates): 1.75d + 3.5 */
export function linearTexDec(m: Q, b: Q, v = 'x'): string {
  return linearTex(m, b, v, true);
}
/** TeX for a number as a decimal when it terminates, otherwise a fraction. */
export function decTex(x: Q): string {
  const r = q(x);
  return r.isTerminatingDecimal() ? r.toDecimalString(10) : r.toTex();
}
export function linearPlain(m: Q, b: Q, v = 'x'): string {
  return polyPlain(Poly.fromCoeffs(v, [q(b), q(m)]), [v]);
}
/** ax^2 + bx + c */
export function quadTex(a: Q, b: Q, c: Q, v = 'x'): string {
  return polyTex(Poly.fromCoeffs(v, [q(c), q(b), q(a)]), [v]);
}
export function quadPlain(a: Q, b: Q, c: Q, v = 'x'): string {
  return polyPlain(Poly.fromCoeffs(v, [q(c), q(b), q(a)]), [v]);
}

/** Number as TeX; wraps negatives in parentheses when `paren` (for substitution displays). */
export function numTex(x: Q, paren = false): string {
  const r = q(x);
  const t = r.toTex();
  return paren && r.isNegative() ? `(${t})` : t;
}
export function numPlain(x: Q, paren = false): string {
  const r = q(x);
  const t = r.toString();
  return paren && r.isNegative() ? `(${t})` : t;
}

/** "x - 3" / "x + 3" / "x" for (x - h). */
export function shiftTex(v: string, h: Q): string {
  const r = q(h);
  if (r.isZero()) return v;
  return r.isNegative() ? `${v} + ${r.abs().toTex()}` : `${v} - ${r.toTex()}`;
}
/** " + 5" / " - 5" / "" for adding a constant at the end of an expression. */
export function plusTex(k: Q): string {
  const r = q(k);
  if (r.isZero()) return '';
  return r.isNegative() ? ` - ${r.abs().toTex()}` : ` + ${r.toTex()}`;
}
/** Coefficient in front of something: 1 -> "", -1 -> "-", 3 -> "3", 1/2 -> \frac12 */
export function coefTex(a: Q): string {
  const r = q(a);
  if (r.eq(1)) return '';
  if (r.eq(-1)) return '-';
  return r.toTex();
}

/** Vertex form a(x - h)^2 + k */
export function vertexFormTex(a: Q, h: Q, k: Q, v = 'x'): string {
  const inner = q(h).isZero() ? `${v}^{2}` : `(${shiftTex(v, h)})^{2}`;
  return `${coefTex(a)}${inner}${plusTex(k)}`;
}

/** Ordered pair TeX */
export function pairTex(x: Q, y: Q): string {
  return `(${numTex(x)}, ${numTex(y)})`;
}

const PREC: Record<string, number> = { add: 1, sub: 1, neg: 2, mul: 3, div: 3, pow: 5 };

/** Render a parsed student answer as LaTeX for the "you typed" preview. */
export function astTex(n: Node, parentPrec = 0): string {
  const wrap = (s: string, prec: number) => (prec < parentPrec ? `\\left(${s}\\right)` : s);
  switch (n.type) {
    case 'num':
      return n.text;
    case 'var':
      return n.name;
    case 'neg':
      return wrap(`-${astTex(n.arg, 3)}`, 2);
    case 'add':
      return wrap(`${astTex(n.left, 1)} + ${astTex(n.right, 2)}`, 1);
    case 'sub':
      return wrap(`${astTex(n.left, 1)} - ${astTex(n.right, 2)}`, 1);
    case 'mul': {
      const l = astTex(n.left, 3);
      const r = astTex(n.right, 4);
      const needDot = !n.implicit || /^[0-9.]/.test(r);
      return wrap(needDot ? `${l} \\cdot ${r}` : `${l}${r}`, 3);
    }
    case 'div':
      return wrap(`\\frac{${astTex(n.left, 0)}}{${astTex(n.right, 0)}}`, 4);
    case 'pow':
      return wrap(`{${astTex(n.base, 6)}}^{${astTex(n.exp, 0)}}`, PREC.pow);
    case 'func':
      if (n.name === 'sqrt') return `\\sqrt{${astTex(n.arg, 0)}}`;
      if (n.name === 'cbrt') return `\\sqrt[3]{${astTex(n.arg, 0)}}`;
      return `\\left|${astTex(n.arg, 0)}\\right|`;
  }
}
