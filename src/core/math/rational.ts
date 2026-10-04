/**
 * Exact rational arithmetic on BigInt. Every answer the app grades is compared
 * exactly; floating point is only used for drawing graphs and for decimal
 * approximations that a problem explicitly asks for.
 */

function bigAbs(a: bigint): bigint {
  return a < 0n ? -a : a;
}

export function gcd(a: bigint, b: bigint): bigint {
  a = bigAbs(a);
  b = bigAbs(b);
  while (b !== 0n) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

export type RationalLike = Rational | number | bigint | string;

export class Rational {
  readonly num: bigint;
  readonly den: bigint;

  private constructor(num: bigint, den: bigint) {
    this.num = num;
    this.den = den;
  }

  static of(num: bigint | number, den: bigint | number = 1n): Rational {
    let n = typeof num === 'number' ? Rational.intToBig(num) : num;
    let d = typeof den === 'number' ? Rational.intToBig(den) : den;
    if (d === 0n) throw new RangeError('Division by zero');
    if (d < 0n) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    if (g > 1n) {
      n /= g;
      d /= g;
    }
    return new Rational(n, d);
  }

  private static intToBig(x: number): bigint {
    if (!Number.isInteger(x)) throw new RangeError(`Expected integer, got ${x}`);
    return BigInt(x);
  }

  /** Convert a JS number exactly when it is an integer or a short decimal literal. */
  static from(x: RationalLike): Rational {
    if (x instanceof Rational) return x;
    if (typeof x === 'bigint') return Rational.of(x, 1n);
    if (typeof x === 'number') {
      if (!Number.isFinite(x)) throw new RangeError('Non-finite number');
      if (Number.isInteger(x)) return Rational.of(BigInt(x), 1n);
      return Rational.parseDecimal(String(x));
    }
    return Rational.parse(x);
  }

  /** Parse "3", "-2.75", "4/6", "-1/3", ".5". Returns exact value. */
  static parse(s: string): Rational {
    const t = s.trim();
    const frac = /^([+-]?\d+)\s*\/\s*([+-]?\d+)$/.exec(t);
    if (frac) return Rational.of(BigInt(frac[1]), BigInt(frac[2]));
    return Rational.parseDecimal(t);
  }

  static parseDecimal(s: string): Rational {
    const m = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(s.trim());
    if (!m || (m[2] === '' && (m[3] === undefined || m[3] === ''))) {
      throw new SyntaxError(`Not a number: ${s}`);
    }
    const sign = m[1] === '-' ? -1n : 1n;
    const intPart = m[2] || '0';
    const fracPart = m[3] || '';
    let num = BigInt(intPart + fracPart) * sign;
    let den = 10n ** BigInt(fracPart.length);
    if (m[4]) {
      const e = Number(m[4]);
      if (e >= 0) num *= 10n ** BigInt(e);
      else den *= 10n ** BigInt(-e);
    }
    return Rational.of(num, den);
  }

  static readonly ZERO = new Rational(0n, 1n);
  static readonly ONE = new Rational(1n, 1n);

  add(o: RationalLike): Rational {
    const b = Rational.from(o);
    return Rational.of(this.num * b.den + b.num * this.den, this.den * b.den);
  }
  sub(o: RationalLike): Rational {
    const b = Rational.from(o);
    return Rational.of(this.num * b.den - b.num * this.den, this.den * b.den);
  }
  mul(o: RationalLike): Rational {
    const b = Rational.from(o);
    return Rational.of(this.num * b.num, this.den * b.den);
  }
  div(o: RationalLike): Rational {
    const b = Rational.from(o);
    if (b.num === 0n) throw new RangeError('Division by zero');
    return Rational.of(this.num * b.den, this.den * b.num);
  }
  neg(): Rational {
    return new Rational(-this.num, this.den);
  }
  abs(): Rational {
    return this.num < 0n ? this.neg() : this;
  }
  inv(): Rational {
    return Rational.ONE.div(this);
  }
  /** Integer power (negative allowed for nonzero bases). */
  pow(e: number): Rational {
    if (!Number.isInteger(e)) throw new RangeError('Rational.pow needs an integer exponent');
    if (e === 0) {
      if (this.isZero()) throw new RangeError('0^0 is undefined');
      return Rational.ONE;
    }
    if (e < 0) return this.inv().pow(-e);
    const E = BigInt(e);
    return Rational.of(this.num ** E, this.den ** E);
  }

  cmp(o: RationalLike): number {
    const b = Rational.from(o);
    const l = this.num * b.den;
    const r = b.num * this.den;
    return l < r ? -1 : l > r ? 1 : 0;
  }
  eq(o: RationalLike): boolean {
    const b = Rational.from(o);
    return this.num === b.num && this.den === b.den;
  }
  lt(o: RationalLike): boolean {
    return this.cmp(o) < 0;
  }
  gt(o: RationalLike): boolean {
    return this.cmp(o) > 0;
  }
  le(o: RationalLike): boolean {
    return this.cmp(o) <= 0;
  }
  ge(o: RationalLike): boolean {
    return this.cmp(o) >= 0;
  }
  isZero(): boolean {
    return this.num === 0n;
  }
  isInteger(): boolean {
    return this.den === 1n;
  }
  isNegative(): boolean {
    return this.num < 0n;
  }
  sign(): number {
    return this.num < 0n ? -1 : this.num > 0n ? 1 : 0;
  }

  toNumber(): number {
    return Number(this.num) / Number(this.den);
  }

  /** Exact integer value; throws if not an integer. */
  toBigInt(): bigint {
    if (this.den !== 1n) throw new RangeError(`${this.toString()} is not an integer`);
    return this.num;
  }
  toInt(): number {
    return Number(this.toBigInt());
  }

  floor(): bigint {
    const q = this.num / this.den;
    return this.num < 0n && q * this.den !== this.num ? q - 1n : q;
  }

  /** True if this value has a terminating decimal expansion. */
  isTerminatingDecimal(): boolean {
    let d = this.den;
    while (d % 2n === 0n) d /= 2n;
    while (d % 5n === 0n) d /= 5n;
    return d === 1n;
  }

  /** Round to `places` decimal places, half away from zero. Returns a Rational. */
  round(places: number): Rational {
    const scale = 10n ** BigInt(places);
    const scaled = this.abs().mul(Rational.of(scale, 1n));
    const twice = scaled.num * 2n;
    // floor(scaled + 1/2) for non-negative values
    const q = (twice + scaled.den) / (2n * scaled.den);
    return Rational.of(this.isNegative() ? -q : q, scale);
  }

  /** "3", "-2/5" */
  toString(): string {
    return this.den === 1n ? this.num.toString() : `${this.num}/${this.den}`;
  }

  /** Exact decimal string if terminating, otherwise rounded to `maxPlaces`. */
  toDecimalString(maxPlaces = 6): string {
    let places = 0;
    if (this.isTerminatingDecimal()) {
      let d = this.den;
      let twos = 0;
      let fives = 0;
      while (d % 2n === 0n) {
        d /= 2n;
        twos++;
      }
      while (d % 5n === 0n) {
        d /= 5n;
        fives++;
      }
      places = Math.max(twos, fives);
      if (places > maxPlaces) places = maxPlaces;
    } else {
      places = maxPlaces;
    }
    const r = this.round(places);
    const neg = r.isNegative();
    const scale = 10n ** BigInt(places);
    const absNum = (neg ? -r.num : r.num) * (scale / r.den);
    const intPart = absNum / scale;
    let fracStr = places > 0 ? (absNum % scale).toString().padStart(places, '0') : '';
    fracStr = fracStr.replace(/0+$/, '');
    const body = fracStr ? `${intPart}.${fracStr}` : `${intPart}`;
    return neg && body !== '0' ? `-${body}` : body;
  }

  /** LaTeX: integers plain, fractions as \frac (sign in front). */
  toTex(): string {
    if (this.den === 1n) return this.num.toString();
    const sign = this.num < 0n ? '-' : '';
    return `${sign}\\frac{${bigAbs(this.num)}}{${this.den}}`;
  }
}

export const R = (n: RationalLike, d?: RationalLike): Rational =>
  d === undefined ? Rational.from(n) : Rational.from(n).div(Rational.from(d));
