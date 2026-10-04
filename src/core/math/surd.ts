/**
 * Exact real numbers of the form  q0 + q1·√a + q2·√b + ... + r1·∛c + ...
 * with rational q's, square-free a, b (and cube-free c). This is the number
 * system of Unit 3 (A.NR.5) and of exact quadratic solutions.
 *
 * Canonical form makes equality checking exact: 2√18 and 6√2 have the same form.
 */
import { Rational } from './rational';
import type { Node } from './parser';
import { exactRoot } from './poly';

export class NotSurd extends Error {}

/** Key "index:radicand"; rational part uses "1:1". */
function key(index: number, radicand: bigint): string {
  return `${index}:${radicand}`;
}
function parse(k: string): [number, bigint] {
  const [i, r] = k.split(':');
  return [Number(i), BigInt(r)];
}

/** Split |n| = s^k * f with f k-th-power-free. Returns [s, f]. */
export function extractPower(n: bigint, k: number): [bigint, bigint] {
  if (n < 0n) throw new RangeError('extractPower expects n >= 0');
  if (n === 0n) return [0n, 1n];
  if (n > 1_000_000_000_000n) throw new NotSurd('radicand too large to simplify');
  let outside = 1n;
  let inside = n;
  const K = BigInt(k);
  for (let p = 2n; p ** K <= inside; p++) {
    const pk = p ** K;
    while (inside % pk === 0n) {
      inside /= pk;
      outside *= p;
    }
  }
  return [outside, inside];
}

export class Surd {
  readonly terms: ReadonlyMap<string, Rational>;
  constructor(terms: Map<string, Rational>) {
    for (const [k, c] of terms) if (c.isZero()) terms.delete(k);
    this.terms = terms;
  }

  static rational(q: Rational | number): Surd {
    return new Surd(new Map([[key(1, 1n), Rational.from(q)]]));
  }

  /** Simplified q·ⁱ√n for integer n. */
  static root(n: bigint, index: 2 | 3, coef: Rational = Rational.ONE): Surd {
    if (index === 2 && n < 0n) throw new NotSurd('square root of a negative number is not real');
    let sign = 1n;
    let m = n;
    if (m < 0n) {
      sign = -1n;
      m = -m;
    }
    if (m === 0n) return Surd.rational(0);
    const [out, inside] = extractPower(m, index);
    const c = coef.mul(Rational.of(out * sign, 1n));
    if (inside === 1n) return Surd.rational(c);
    return new Surd(new Map([[key(index, inside), c]]));
  }

  /** ⁱ√(q) for rational q: √(a/b) = √(ab)/b, ∛(a/b) = ∛(ab²)/b. */
  static rootOfRational(q: Rational, index: 2 | 3): Surd {
    const exact = exactRoot(q, index);
    if (exact) return Surd.rational(exact);
    if (index === 2) return Surd.root(q.num * q.den, 2, Rational.of(1n, q.den));
    return Surd.root(q.num * q.den * q.den, 3, Rational.of(1n, q.den));
  }

  add(o: Surd): Surd {
    const m = new Map(this.terms);
    for (const [k, c] of o.terms) m.set(k, (m.get(k) ?? Rational.ZERO).add(c));
    return new Surd(m);
  }
  neg(): Surd {
    const m = new Map<string, Rational>();
    for (const [k, c] of this.terms) m.set(k, c.neg());
    return new Surd(m);
  }
  sub(o: Surd): Surd {
    return this.add(o.neg());
  }
  scale(q: Rational): Surd {
    const m = new Map<string, Rational>();
    for (const [k, c] of this.terms) m.set(k, c.mul(q));
    return new Surd(m);
  }
  mul(o: Surd): Surd {
    let acc = Surd.rational(0);
    for (const [k1, c1] of this.terms) {
      const [i1, r1] = parse(k1);
      for (const [k2, c2] of o.terms) {
        const [i2, r2] = parse(k2);
        const c = c1.mul(c2);
        let t: Surd;
        if (i1 === 1) t = new Surd(new Map([[k2, c]]));
        else if (i2 === 1) t = new Surd(new Map([[k1, c]]));
        else if (i1 === i2) t = Surd.root(r1 * r2, i1 as 2 | 3, c);
        else throw new NotSurd('mixed square and cube roots');
        acc = acc.add(t);
      }
    }
    return acc;
  }
  isRational(): boolean {
    return [...this.terms.keys()].every((k) => k === key(1, 1n));
  }
  rationalPart(): Rational {
    return this.terms.get(key(1, 1n)) ?? Rational.ZERO;
  }
  isZero(): boolean {
    return this.terms.size === 0;
  }
  /** Divide by a surd. Supported: rational divisor, or a single-term radical divisor. */
  div(o: Surd): Surd {
    if (o.isZero()) throw new RangeError('Division by zero');
    if (o.isRational()) return this.scale(o.rationalPart().inv());
    if (o.terms.size === 1) {
      const [[k, c]] = [...o.terms.entries()];
      const [idx, r] = parse(k);
      // 1/(c·√r) = √r/(c·r);  1/(c·∛r) = ∛(r²)/(c·r)
      const inv = idx === 2 ? Surd.root(r, 2, Rational.of(1n, r).div(c)) : Surd.root(r * r, 3, Rational.of(1n, r).div(c));
      return this.mul(inv);
    }
    throw new NotSurd('denominator with more than one term');
  }
  pow(e: number): Surd {
    if (!Number.isInteger(e)) throw new NotSurd('fractional exponent');
    if (e < 0) return Surd.rational(1).div(this.pow(-e));
    let r = Surd.rational(1);
    for (let i = 0; i < e; i++) r = r.mul(this);
    return r;
  }
  equals(o: Surd): boolean {
    if (this.terms.size !== o.terms.size) return false;
    for (const [k, c] of this.terms) {
      const d = o.terms.get(k);
      if (!d || !d.eq(c)) return false;
    }
    return true;
  }
  toNumber(): number {
    let s = 0;
    for (const [k, c] of this.terms) {
      const [i, r] = parse(k);
      const rv = i === 1 ? 1 : i === 2 ? Math.sqrt(Number(r)) : Math.cbrt(Number(r));
      s += c.toNumber() * rv;
    }
    return s;
  }
  /** Sorted parts for display: rational first, then square roots, then cube roots. */
  parts(): Array<{ index: number; radicand: bigint; coef: Rational }> {
    const arr = [...this.terms.entries()].map(([k, c]) => {
      const [index, radicand] = parse(k);
      return { index, radicand, coef: c };
    });
    arr.sort((a, b) => a.index - b.index || (a.radicand < b.radicand ? -1 : a.radicand > b.radicand ? 1 : 0));
    return arr;
  }

  toTex(): string {
    const ps = this.parts();
    if (ps.length === 0) return '0';
    let out = '';
    ps.forEach((p, idx) => {
      const neg = p.coef.isNegative();
      const a = p.coef.abs();
      let body: string;
      const rad = p.index === 1 ? '' : p.index === 2 ? `\\sqrt{${p.radicand}}` : `\\sqrt[3]{${p.radicand}}`;
      if (p.index === 1) body = a.toTex();
      else if (a.isInteger()) body = (a.eq(1) ? '' : a.toString()) + rad;
      else body = `\\frac{${a.num === 1n ? '' : a.num.toString()}${rad}}{${a.den}}`;
      if (idx === 0) out += (neg ? '-' : '') + body;
      else out += (neg ? ' - ' : ' + ') + body;
    });
    return out;
  }

  toPlain(): string {
    const ps = this.parts();
    if (ps.length === 0) return '0';
    let out = '';
    ps.forEach((p, idx) => {
      const neg = p.coef.isNegative();
      const a = p.coef.abs();
      const rad = p.index === 1 ? '' : p.index === 2 ? `√${p.radicand}` : `∛${p.radicand}`;
      let body: string;
      if (p.index === 1) body = a.toString();
      else if (a.isInteger()) body = (a.eq(1) ? '' : a.toString()) + rad;
      else body = `${a.num === 1n ? '' : a.num.toString()}${rad}/${a.den}`;
      if (idx === 0) out += (neg ? '-' : '') + body;
      else out += (neg ? ' - ' : ' + ') + body;
    });
    return out;
  }
}

/** Evaluate a constant AST exactly as a Surd. Throws NotSurd for anything outside the system. */
export function toSurd(n: Node): Surd {
  switch (n.type) {
    case 'num':
      return Surd.rational(n.value);
    case 'var':
      throw new NotSurd('contains a variable');
    case 'neg':
      return toSurd(n.arg).neg();
    case 'add':
      return toSurd(n.left).add(toSurd(n.right));
    case 'sub':
      return toSurd(n.left).sub(toSurd(n.right));
    case 'mul':
      return toSurd(n.left).mul(toSurd(n.right));
    case 'div':
      return toSurd(n.left).div(toSurd(n.right));
    case 'pow': {
      const e = toSurd(n.exp);
      if (!e.isRational()) throw new NotSurd('irrational exponent');
      const ev = e.rationalPart();
      const b = toSurd(n.base);
      if (ev.isInteger()) {
        const ei = ev.toInt();
        if (Math.abs(ei) > 12) throw new NotSurd('exponent too large');
        return b.pow(ei);
      }
      // b^(1/2), b^(1/3), b^(p/q) for rational b
      if (!b.isRational()) throw new NotSurd('fractional power of a radical');
      if (ev.den !== 2n && ev.den !== 3n) throw new NotSurd('unsupported fractional exponent');
      const rootOf = Surd.rootOfRational(b.rationalPart(), Number(ev.den) as 2 | 3);
      return rootOf.pow(Number(ev.num));
    }
    case 'func': {
      const a = toSurd(n.arg);
      if (n.name === 'abs') {
        const v = a.toNumber();
        return v < 0 ? a.neg() : a;
      }
      if (!a.isRational()) throw new NotSurd('nested radical');
      return Surd.rootOfRational(a.rationalPart(), n.name === 'sqrt' ? 2 : 3);
    }
  }
}

export function trySurd(n: Node): Surd | null {
  try {
    return toSurd(n);
  } catch (e) {
    if (e instanceof NotSurd || e instanceof RangeError) return null;
    throw e;
  }
}
