/**
 * Multivariate polynomials with exact rational coefficients.
 * Used to decide whether two polynomial answers are identical (e.g. (x+2)(x-3) vs x^2-x-6).
 */
import { Rational } from './rational';
import type { Node } from './parser';

/** Monomial key: "" for constant, otherwise "x^2*y" style with sorted variable names. */
type Mono = Record<string, number>;

function monoKey(m: Mono): string {
  return Object.keys(m)
    .filter((v) => m[v] !== 0)
    .sort()
    .map((v) => (m[v] === 1 ? v : `${v}^${m[v]}`))
    .join('*');
}

function parseKey(k: string): Mono {
  const m: Mono = {};
  if (k === '') return m;
  for (const part of k.split('*')) {
    const [v, e] = part.split('^');
    m[v] = e ? Number(e) : 1;
  }
  return m;
}

export class Poly {
  /** monomial key -> nonzero coefficient */
  readonly terms: ReadonlyMap<string, Rational>;

  constructor(terms: Map<string, Rational>) {
    for (const [k, c] of terms) if (c.isZero()) terms.delete(k);
    this.terms = terms;
  }

  static const(c: Rational | number): Poly {
    return new Poly(new Map([['', Rational.from(c)]]));
  }
  static variable(name: string): Poly {
    return new Poly(new Map([[name, Rational.ONE]]));
  }
  /** Univariate from coefficients [c0, c1, c2, ...] (constant first). */
  static fromCoeffs(v: string, coeffs: (Rational | number)[]): Poly {
    const m = new Map<string, Rational>();
    coeffs.forEach((c, i) => {
      const r = Rational.from(c);
      if (!r.isZero()) m.set(i === 0 ? '' : monoKey({ [v]: i }), r);
    });
    return new Poly(m);
  }

  isZero(): boolean {
    return this.terms.size === 0;
  }

  add(o: Poly): Poly {
    const m = new Map(this.terms);
    for (const [k, c] of o.terms) m.set(k, (m.get(k) ?? Rational.ZERO).add(c));
    return new Poly(m);
  }
  neg(): Poly {
    const m = new Map<string, Rational>();
    for (const [k, c] of this.terms) m.set(k, c.neg());
    return new Poly(m);
  }
  sub(o: Poly): Poly {
    return this.add(o.neg());
  }
  scale(r: Rational): Poly {
    const m = new Map<string, Rational>();
    for (const [k, c] of this.terms) m.set(k, c.mul(r));
    return new Poly(m);
  }
  mul(o: Poly): Poly {
    const m = new Map<string, Rational>();
    for (const [k1, c1] of this.terms) {
      const m1 = parseKey(k1);
      for (const [k2, c2] of o.terms) {
        const m2 = parseKey(k2);
        const prod: Mono = { ...m1 };
        for (const v of Object.keys(m2)) prod[v] = (prod[v] ?? 0) + m2[v];
        const key = monoKey(prod);
        m.set(key, (m.get(key) ?? Rational.ZERO).add(c1.mul(c2)));
      }
    }
    return new Poly(m);
  }
  pow(e: number): Poly {
    if (!Number.isInteger(e) || e < 0) throw new RangeError('Poly.pow needs a non-negative integer');
    let r = Poly.const(1);
    for (let i = 0; i < e; i++) r = r.mul(this);
    return r;
  }

  equals(o: Poly): boolean {
    if (this.terms.size !== o.terms.size) return false;
    for (const [k, c] of this.terms) {
      const d = o.terms.get(k);
      if (!d || !d.eq(c)) return false;
    }
    return true;
  }

  /** If this == c * o for a single nonzero rational c, return c. */
  ratioTo(o: Poly): Rational | null {
    if (this.isZero() || o.isZero()) return null;
    if (this.terms.size !== o.terms.size) return null;
    let ratio: Rational | null = null;
    for (const [k, c] of this.terms) {
      const d = o.terms.get(k);
      if (!d) return null;
      const r = c.div(d);
      if (ratio === null) ratio = r;
      else if (!ratio.eq(r)) return null;
    }
    return ratio;
  }

  isConstant(): boolean {
    return this.terms.size === 0 || (this.terms.size === 1 && this.terms.has(''));
  }
  constantValue(): Rational {
    return this.terms.get('') ?? Rational.ZERO;
  }

  variables(): string[] {
    const s = new Set<string>();
    for (const k of this.terms.keys()) for (const v of Object.keys(parseKey(k))) s.add(v);
    return [...s].sort();
  }

  /** Total degree (-Infinity for the zero polynomial). */
  degree(): number {
    let d = -Infinity;
    for (const k of this.terms.keys()) {
      const m = parseKey(k);
      const t = Object.values(m).reduce((a, b) => a + b, 0);
      d = Math.max(d, t);
    }
    return d;
  }

  degreeIn(v: string): number {
    let d = this.isZero() ? -Infinity : 0;
    for (const k of this.terms.keys()) d = Math.max(d, parseKey(k)[v] ?? 0);
    return d;
  }

  /** Coefficient of v^e treating other variables as absent (univariate use). */
  coeff(v: string, e: number): Rational {
    const key = e === 0 ? '' : monoKey({ [v]: e });
    return this.terms.get(key) ?? Rational.ZERO;
  }

  /** Coefficient of an arbitrary monomial given as {x:1, y:1}. */
  coeffOf(m: Record<string, number>): Rational {
    return this.terms.get(monoKey(m)) ?? Rational.ZERO;
  }

  evaluate(env: Record<string, Rational>): Rational {
    let total = Rational.ZERO;
    for (const [k, c] of this.terms) {
      let t = c;
      const m = parseKey(k);
      for (const v of Object.keys(m)) {
        const val = env[v];
        if (!val) throw new Error(`No value for ${v}`);
        t = t.mul(val.pow(m[v]));
      }
      total = total.add(t);
    }
    return total;
  }

  /** Univariate coefficient list, constant first. Throws if multivariate. */
  coeffsIn(v: string): Rational[] {
    const vars = this.variables();
    if (vars.some((x) => x !== v)) throw new Error('Polynomial is not univariate in ' + v);
    const d = this.degreeIn(v);
    const out: Rational[] = [];
    for (let i = 0; i <= Math.max(d, 0); i++) out.push(this.coeff(v, i));
    return out;
  }

  /** Iterate terms as [monomial, coefficient], sorted by degree descending then name. */
  sortedTerms(): Array<[Record<string, number>, Rational]> {
    const arr = [...this.terms.entries()].map(([k, c]) => [parseKey(k), c] as [Mono, Rational]);
    const deg = (m: Mono) => Object.values(m).reduce((a, b) => a + b, 0);
    arr.sort((a, b) => {
      const d = deg(b[0]) - deg(a[0]);
      if (d !== 0) return d;
      return monoKey(a[0]) < monoKey(b[0]) ? -1 : 1;
    });
    return arr;
  }
}

export class NotPolynomial extends Error {}

const MAX_POW = 12;

/**
 * Convert an AST to a polynomial. Allows division by nonzero constants and
 * non-negative integer exponents. Anything else (variables in a denominator,
 * radicals of variables, fractional exponents) throws NotPolynomial.
 * Radicals of constants are allowed only if they simplify to rationals (sqrt(9/4)).
 */
export function toPoly(n: Node): Poly {
  switch (n.type) {
    case 'num':
      return Poly.const(n.value);
    case 'var':
      return Poly.variable(n.name);
    case 'neg':
      return toPoly(n.arg).neg();
    case 'add':
      return toPoly(n.left).add(toPoly(n.right));
    case 'sub':
      return toPoly(n.left).sub(toPoly(n.right));
    case 'mul':
      return toPoly(n.left).mul(toPoly(n.right));
    case 'div': {
      const d = toPoly(n.right);
      if (!d.isConstant()) throw new NotPolynomial('variable denominator');
      const c = d.constantValue();
      if (c.isZero()) throw new NotPolynomial('division by zero');
      return toPoly(n.left).scale(c.inv());
    }
    case 'pow': {
      const e = toPoly(n.exp);
      if (!e.isConstant()) throw new NotPolynomial('variable exponent');
      const ev = e.constantValue();
      const b = toPoly(n.base);
      if (!ev.isInteger()) throw new NotPolynomial('fractional exponent');
      const ei = ev.toInt();
      if (ei < 0) {
        if (!b.isConstant() || b.constantValue().isZero()) throw new NotPolynomial('negative exponent');
        return Poly.const(b.constantValue().pow(ei));
      }
      if (ei > MAX_POW) throw new NotPolynomial('exponent too large');
      if (ei === 0 && b.isZero()) throw new NotPolynomial('0^0');
      return b.pow(ei);
    }
    case 'func': {
      const a = toPoly(n.arg);
      if (!a.isConstant()) throw new NotPolynomial('function of a variable');
      const v = a.constantValue();
      if (n.name === 'abs') return Poly.const(v.abs());
      const r = exactRoot(v, n.name === 'sqrt' ? 2 : 3);
      if (!r) throw new NotPolynomial('irrational root');
      return Poly.const(r);
    }
  }
}

/** Exact integer root of a bigint, or null. */
export function intRoot(x: bigint, k: number): bigint | null {
  if (x < 0n) {
    if (k % 2 === 0) return null;
    const r = intRoot(-x, k);
    return r === null ? null : -r;
  }
  if (x < 2n) return x;
  // Newton's method on bigint
  const K = BigInt(k);
  let r = BigInt(Math.floor(Math.pow(Number(x), 1 / k)));
  if (r < 1n) r = 1n;
  for (let i = 0; i < 200; i++) {
    const nr = ((K - 1n) * r + x / r ** (K - 1n)) / K;
    if (nr === r) break;
    r = nr;
  }
  for (const c of [r - 1n, r, r + 1n]) if (c >= 0n && c ** K === x) return c;
  return null;
}

/** Exact rational k-th root if one exists (k = 2 requires non-negative). */
export function exactRoot(v: Rational, k: number): Rational | null {
  if (k % 2 === 0 && v.isNegative()) return null;
  const n = intRoot(v.num, k);
  const d = intRoot(v.den, k);
  if (n === null || d === null) return null;
  return Rational.of(n, d);
}

export function tryPoly(n: Node): Poly | null {
  try {
    return toPoly(n);
  } catch (e) {
    if (e instanceof NotPolynomial || e instanceof RangeError) return null;
    throw e;
  }
}
