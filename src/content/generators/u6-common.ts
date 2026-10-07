/** Shared helpers for the Unit 6 generators: exponential functions f(x) = a(b)^x + k. */
import type { GraphSpec, Problem } from '../../core/curriculum/types';
import type { Node } from '../../core/math/parser';
import { parseExpression } from '../../core/math/parser';
import { Rational } from '../../core/math/rational';
import { Q, numStr } from './util';
import { texToParser, exactRational, dTex } from './u5-common';

export interface ExpFn {
  a: Rational;
  b: Rational;
  k: Rational;
}

export const expFn = (a: number | string | Rational, b: number | string | Rational, k: number | string | Rational = 0): ExpFn => ({ a: Q(a as never), b: Q(b as never), k: Q(k as never) });

/** Exact value at an integer input. */
export function valueAt(f: ExpFn, x: number): Rational {
  return f.a.mul(f.b.pow(x)).add(f.k);
}

/** TeX of the right side, e.g. 3\left(2\right)^{x} - 4, 2^{x}, -\left(\frac{1}{2}\right)^{x} + 5. */
export function rhsTex(f: ExpFn, v = 'x'): string {
  const bInt = f.b.isInteger();
  const base = bInt ? `${f.b.toTex()}^{${v}}` : `\\left(${dTex(f.b)}\\right)^{${v}}`;
  let head: string;
  if (f.a.eq(1)) head = base;
  else if (f.a.eq(-1)) head = `-\\left(${dTex(f.b)}\\right)^{${v}}`;
  else head = `${dTex(f.a)}\\left(${dTex(f.b)}\\right)^{${v}}`;
  if (f.k.isZero()) return head;
  return `${head} ${f.k.isNegative() ? '-' : '+'} ${dTex(f.k.abs())}`;
}

/** Parser syntax, for graphs and answer keys: "3*(2)^x-4". */
export function rhsPlain(f: ExpFn, v = 'x'): string {
  const head = `${numStr(f.a)}*(${numStr(f.b)})^${v}`;
  return f.k.isZero() ? head : `${head}${f.k.isNegative() ? '-' : '+'}${numStr(f.k.abs())}`;
}

/** Decompose a parsed a*(b)^v + k (any order of the constant term) back into a, b, k. */
export function decompose(n: Node, v = 'x'): ExpFn | null {
  const constant = (m: Node) => exactRational(m);
  const power = (m: Node): { a: Rational; b: Rational } | null => {
    if (m.type === 'pow' && m.exp.type === 'var' && m.exp.name === v) {
      const b = constant(m.base);
      return b ? { a: Q(1), b } : null;
    }
    if (m.type === 'neg') {
      const p = power(m.arg);
      return p ? { a: p.a.neg(), b: p.b } : null;
    }
    if (m.type === 'mul') {
      const c = constant(m.left);
      const p = power(m.right);
      if (c && p) return { a: c.mul(p.a), b: p.b };
    }
    return null;
  };
  const p0 = power(n);
  if (p0) return { ...p0, k: Q(0) };
  if (n.type === 'add' || n.type === 'sub') {
    const p = power(n.left);
    const c = constant(n.right);
    if (p && c) return { ...p, k: n.type === 'add' ? c : c.neg() };
    const p2 = power(n.right);
    const c2 = constant(n.left);
    if (p2 && c2) return n.type === 'add' ? { ...p2, k: c2 } : { a: p2.a.neg(), b: p2.b, k: c2 };
  }
  return null;
}

/** Read "f(x) = ..." TeX into a, b, k. */
export function readFn(tex: string, v = 'x'): ExpFn | null {
  const rhs = tex.slice(tex.indexOf('=') + 1);
  try {
    return decompose(parseExpression(texToParser(rhs)), v);
  } catch {
    return null;
  }
}

/** Is f increasing everywhere? */
export const increasing = (f: ExpFn) => (f.a.sign() > 0) === f.b.gt(1);

/** A graph window that shows the integer points x = -2..3 (clipped to sensible heights) and the asymptote. */
export function windowFor(fs: ExpFn[], xs: number[] = [-2, -1, 0, 1, 2, 3]): Pick<GraphSpec, 'xMin' | 'xMax' | 'yMin' | 'yMax' | 'yStep'> {
  const ys: number[] = [];
  for (const f of fs) {
    ys.push(f.k.toNumber());
    for (const x of xs) ys.push(valueAt(f, x).toNumber());
  }
  let lo = Math.min(...ys);
  let hi = Math.max(...ys);
  const span = Math.max(hi - lo, 4);
  const yStep = span > 80 ? 20 : span > 40 ? 10 : span > 20 ? 5 : span > 10 ? 2 : 1;
  lo = Math.floor((lo - yStep) / yStep) * yStep;
  hi = Math.ceil((hi + yStep) / yStep) * yStep;
  return { xMin: Math.min(...xs) - 1, xMax: Math.max(...xs) + 1, yMin: lo, yMax: hi, yStep };
}

export const ptLabel = (x: number, y: Rational) => `(${x}, ${numStr(y)})`;

/** Parse a "(x, y)" label back to numbers. */
export function parseLabel(label: string): { x: Rational; y: Rational } | null {
  const m = /^\((-?[\d./]+), (-?[\d./]+)\)$/.exec(label);
  return m ? { x: Q(m[1]), y: Q(m[2]) } : null;
}

export function textAll(pr: Pick<Problem, 'prompt'>): string {
  return pr.prompt.map((b) => (b.t === 'p' ? b.text : b.t === 'math' ? b.tex : '')).join(' ');
}

/** Bases with friendly integer values at small integer inputs. */
export const NICE_BASES = ['2', '3', '4', '5', '1/2', '1/3', '1.5', '0.5'];

export { dTex };
