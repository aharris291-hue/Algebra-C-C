/**
 * Exact statistics for one- and two-variable data, used by the Unit 7 lessons and generators.
 *
 * Course conventions (stated in the Unit 7 lessons):
 * - Quartiles: Q1 and Q3 are the medians of the lower and upper halves of the ordered data; when the
 *   number of values is odd, the middle value (the median) is left out of both halves. This is the
 *   method graphing calculators (TI-84 "1-Var Stats") use.
 * - Standard deviation: the population standard deviation sigma = sqrt(sum((x - mean)^2) / n),
 *   shown as "σx" on a calculator.
 * - Outliers: values below Q1 - 1.5·IQR or above Q3 + 1.5·IQR. Box plots draw outliers as dots and
 *   the whiskers stop at the smallest and largest values that are not outliers.
 * - Linear regression: the least-squares line y = ax + b; r is the correlation coefficient.
 */
import { Rational } from './rational';

const R = (n: number | string | Rational) => (n instanceof Rational ? n : Rational.parse(String(n)));

export function sorted(xs: Rational[]): Rational[] {
  return [...xs].sort((a, b) => (a.lt(b) ? -1 : a.gt(b) ? 1 : 0));
}

export function sum(xs: Rational[]): Rational {
  return xs.reduce((a, b) => a.add(b), Rational.from(0));
}

export function mean(xs: Rational[]): Rational {
  return sum(xs).div(xs.length);
}

export function median(xs: Rational[]): Rational {
  const s = sorted(xs);
  const n = s.length;
  return n % 2 === 1 ? s[(n - 1) / 2] : s[n / 2 - 1].add(s[n / 2]).div(2);
}

export interface FiveNumber {
  min: Rational;
  q1: Rational;
  median: Rational;
  q3: Rational;
  max: Rational;
}

export function fiveNumber(xs: Rational[]): FiveNumber {
  const s = sorted(xs);
  const n = s.length;
  if (n < 4) throw new Error('need at least 4 values for quartiles');
  const half = Math.floor(n / 2);
  const lower = s.slice(0, half);
  const upper = s.slice(n - half);
  return { min: s[0], q1: median(lower), median: median(s), q3: median(upper), max: s[n - 1] };
}

export const iqr = (xs: Rational[]) => {
  const f = fiveNumber(xs);
  return f.q3.sub(f.q1);
};

export function fences(xs: Rational[]): { lo: Rational; hi: Rational } {
  const f = fiveNumber(xs);
  const step = f.q3.sub(f.q1).mul(Rational.parse('1.5'));
  return { lo: f.q1.sub(step), hi: f.q3.add(step) };
}

export function outliers(xs: Rational[]): Rational[] {
  const { lo, hi } = fences(xs);
  return sorted(xs).filter((x) => x.lt(lo) || x.gt(hi));
}

/** Population variance sum((x - mean)^2) / n, exact. */
export function variance(xs: Rational[]): Rational {
  const m = mean(xs);
  return sum(xs.map((x) => x.sub(m).mul(x.sub(m)))).div(xs.length);
}

/** Population standard deviation as a decimal number. */
export function stdDev(xs: Rational[]): number {
  return Math.sqrt(variance(xs).toNumber());
}

export interface Regression {
  /** slope */
  a: Rational;
  /** intercept */
  b: Rational;
  /** correlation coefficient */
  r: number;
}

/** Least-squares line through (x, y) pairs, exact slope and intercept. */
export function linearRegression(xs: Rational[], ys: Rational[]): Regression {
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = Rational.from(0);
  let sxx = Rational.from(0);
  let syy = Rational.from(0);
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i].sub(mx);
    const dy = ys[i].sub(my);
    sxy = sxy.add(dx.mul(dy));
    sxx = sxx.add(dx.mul(dx));
    syy = syy.add(dy.mul(dy));
  }
  const a = sxy.div(sxx);
  const b = my.sub(a.mul(mx));
  const r = syy.isZero() ? 0 : sxy.toNumber() / Math.sqrt(sxx.toNumber() * syy.toNumber());
  return { a, b, r };
}

/** Convenience: numbers to Rationals. */
export const rats = (xs: Array<number | string>) => xs.map((x) => R(x));
