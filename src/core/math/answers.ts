/**
 * Answer specifications and the checker that grades a student's typed response.
 *
 * Every check returns one of:
 *   correct          - mathematically right and in an acceptable form
 *   wrong-form       - mathematically equivalent but not in the requested form (no penalty, asked to rewrite)
 *   incorrect        - not equivalent (may carry a misconception tag + targeted feedback)
 *   invalid          - could not be read; the student is told why and the attempt is not counted
 */
import { Rational } from './rational';
import { MathSyntaxError, Node, normalizeInput, parseExpression, variablesOf, isPlainNumberLiteral, isSimpleFraction } from './parser';
import { Poly, tryPoly } from './poly';
import { Surd, trySurd, extractPower } from './surd';
import { numericallyEquivalent, evalNumeric, hasVariableRadical } from './evaluate';

export type ExpressionForm =
  | 'any'
  | 'expanded' // sum of monomials, like terms combined
  | 'factored' // completely factored over the integers
  | 'vertex' // a(x-h)^2 + k
  | 'simplified-radical';

export type EquationForm = 'any' | 'slope-intercept' | 'point-slope' | 'standard' | 'vertex' | 'factored' | 'quadratic-standard';

export interface Misconception {
  /** Answer the misconception produces, written in the same spec language as the correct answer. */
  answer: string;
  tag: MisconceptionTag;
  /** Targeted, non-revealing feedback. */
  feedback: string;
}

export type MisconceptionTag =
  | 'sign-error'
  | 'arithmetic-error'
  | 'inverse-operation'
  | 'distribution'
  | 'unlike-terms'
  | 'slope-calc'
  | 'slope-reciprocal'
  | 'rise-run-swap'
  | 'graph-reading'
  | 'equation-setup'
  | 'order-of-operations'
  | 'exponent-rule'
  | 'radical-simplify'
  | 'interval-endpoint'
  | 'inequality-direction'
  | 'boundary-line'
  | 'shading'
  | 'sequence-index'
  | 'growth-decay'
  | 'percent-rate'
  | 'vertex-sign'
  | 'factoring'
  | 'missing-solution'
  | 'formula-error'
  | 'statistics-concept'
  | 'units'
  | 'other';

export type AnswerSpec =
  | {
      kind: 'number';
      /** exact value as parser input, e.g. "-7/2", "3" or "2.5" */
      value: string;
      /** If set, an approximation rounded to this many decimal places is expected (exact also accepted). */
      roundTo?: number;
      unit?: string;
    }
  | { kind: 'expression'; value: string; form?: ExpressionForm; variables?: string[] }
  | { kind: 'equation'; value: string; form?: EquationForm }
  | { kind: 'inequality'; value: string }
  | { kind: 'point'; x: string; y: string }
  /** Any point that satisfies every constraint (inequalities in x and y) is correct; `example` is one such point. */
  | { kind: 'region-point'; constraints: string[]; example: { x: string; y: string }; wholeNumbers?: boolean }
  | { kind: 'solutions'; values: string[]; variable?: string; roundTo?: number }
  | { kind: 'interval'; value: string } // interval notation, set-builder or inequality accepted
  | { kind: 'choice'; options: { id: string; label: string }[]; correct: string }
  | { kind: 'sequence-terms'; values: string[] };

export type CheckStatus = 'correct' | 'wrong-form' | 'incorrect' | 'invalid';

export interface CheckResult {
  status: CheckStatus;
  /** Shown to the student. Never contains the correct answer for 'incorrect'. */
  message?: string;
  misconception?: MisconceptionTag;
}

const ok = (message?: string): CheckResult => ({ status: 'correct', message });
const bad = (message?: string, misconception?: MisconceptionTag): CheckResult => ({ status: 'incorrect', message, misconception });
const invalid = (message: string): CheckResult => ({ status: 'invalid', message });
const form = (message: string): CheckResult => ({ status: 'wrong-form', message });

function parseSafe(s: string): Node | MathSyntaxError {
  try {
    return parseExpression(s);
  } catch (e) {
    if (e instanceof MathSyntaxError) return e;
    return new MathSyntaxError('Something in the answer could not be read.');
  }
}

// ---------------------------------------------------------------------------
// Exact value of a constant expression: Surd if possible, otherwise null.
// ---------------------------------------------------------------------------

export function exactValue(s: string | Node): Surd | null {
  const n = typeof s === 'string' ? parseExpression(s) : s;
  return trySurd(n);
}

/** Decide equivalence of two expressions (any variables). */
export function expressionsEquivalent(a: Node, b: Node): boolean {
  const pa = tryPoly(a);
  const pb = tryPoly(b);
  if (pa && pb) return pa.equals(pb);
  const va = [...variablesOf(a)];
  const vb = [...variablesOf(b)];
  if (va.length === 0 && vb.length === 0) {
    const sa = trySurd(a);
    const sb = trySurd(b);
    if (sa && sb) return sa.equals(sb);
  }
  const vars = [...new Set([...va, ...vb])].sort();
  // Course convention (stated in Unit 3): variables under a radical represent non-negative numbers.
  const r = numericallyEquivalent(a, b, vars, hasVariableRadical(a) || hasVariableRadical(b));
  return r === true;
}

// ---------------------------------------------------------------------------
// Form checks
// ---------------------------------------------------------------------------

/** Split a sum into signed terms. */
function additiveTerms(n: Node, sign = 1, out: Array<{ sign: number; node: Node }> = []) {
  if (n.type === 'add') {
    additiveTerms(n.left, sign, out);
    additiveTerms(n.right, sign, out);
  } else if (n.type === 'sub') {
    additiveTerms(n.left, sign, out);
    additiveTerms(n.right, -sign, out);
  } else if (n.type === 'neg') {
    additiveTerms(n.arg, -sign, out);
  } else out.push({ sign, node: n });
  return out;
}

function multiplicativeFactors(n: Node, out: Node[] = []): Node[] {
  if (n.type === 'mul') {
    multiplicativeFactors(n.left, out);
    multiplicativeFactors(n.right, out);
  } else if (n.type === 'neg') {
    multiplicativeFactors(n.arg, out);
  } else out.push(n);
  return out;
}

/** A monomial: product of number literals / fractions and variable powers, no sums inside. */
function isMonomial(n: Node): boolean {
  switch (n.type) {
    case 'num':
    case 'var':
      return true;
    case 'neg':
      return isMonomial(n.arg);
    case 'mul':
      return isMonomial(n.left) && isMonomial(n.right);
    case 'div':
      return isMonomial(n.left) && n.right.type === 'num';
    case 'pow':
      return n.base.type === 'var' && n.exp.type === 'num' && n.exp.value.isInteger();
    default:
      return false;
  }
}

export function isExpandedForm(n: Node): boolean {
  const terms = additiveTerms(n);
  if (!terms.every((t) => isMonomial(t.node))) return false;
  // like terms combined: each monomial key appears once
  const keys = new Set<string>();
  for (const t of terms) {
    const p = tryPoly(t.node);
    if (!p) return false;
    if (p.isZero()) return terms.length === 1;
    const [[mono]] = p.sortedTerms();
    const k = JSON.stringify(Object.entries(mono).sort());
    if (keys.has(k)) return false;
    keys.add(k);
  }
  return true;
}

function contentOf(p: Poly): Rational {
  // gcd of numerators / lcm of denominators (rational content)
  let g = 0n;
  let l = 1n;
  for (const c of p.terms.values()) {
    let a = c.num < 0n ? -c.num : c.num;
    let b = g;
    while (b) [a, b] = [b, a % b];
    g = a;
    const d = c.den;
    let x = l;
    let y = d;
    while (y) [x, y] = [y, x % y];
    l = (l * d) / x;
  }
  return Rational.of(g, l);
}

/** True if a univariate polynomial with rational coefficients has no factor of degree 1..deg-1 over Q (deg <= 2 only). */
function irreducibleOverQ(p: Poly, v: string): boolean {
  const d = p.degreeIn(v);
  if (d <= 1) return true;
  if (d === 2) {
    const a = p.coeff(v, 2);
    const b = p.coeff(v, 1);
    const c = p.coeff(v, 0);
    const disc = b.mul(b).sub(a.mul(c).mul(4));
    if (disc.isNegative()) return true;
    // rational roots iff discriminant is a perfect square of a rational
    const n = disc.num;
    const dd = disc.den;
    const isSq = (x: bigint) => {
      if (x < 0n) return false;
      const [out, inside] = extractPower(x, 2);
      return inside === 1n || out * out === x;
    };
    return !(isSq(n) && isSq(dd));
  }
  return false; // degree >= 3 never counts as completely factored in this course
}

export function isCompletelyFactored(n: Node): boolean {
  const factors = multiplicativeFactors(n);
  let nonConst = 0;
  for (const f of factors) {
    const base = f.type === 'pow' ? f.base : f;
    if (f.type === 'pow' && !(f.exp.type === 'num' && f.exp.value.isInteger())) return false;
    const p = tryPoly(base);
    if (!p) return false;
    if (p.isConstant()) continue;
    nonConst++;
    const vars = p.variables();
    if (vars.length !== 1) {
      // multivariate: accept only if it's degree 1 (e.g. x + y)
      if (p.degree() !== 1) return false;
    } else if (!irreducibleOverQ(p, vars[0])) return false;
    // no common numeric factor left inside a factor (2x + 4 is not completely factored)
    const allInt = [...p.terms.values()].every((c) => c.isInteger());
    if (allInt && contentOf(p).gt(1)) return false;
    // a bare monomial factor such as 3x is fine; a factor like x^2 written as x·x is fine too
  }
  return nonConst >= 1;
}

/** a(x - h)^2 + k with a, h, k numbers. */
export function isVertexForm(n: Node, v = 'x'): boolean {
  const terms = additiveTerms(n);
  let squareTerms = 0;
  for (const t of terms) {
    const factors = multiplicativeFactors(t.node);
    const squares = factors.filter((f) => f.type === 'pow' && f.exp.type === 'num' && f.exp.value.eq(2));
    const others = factors.filter((f) => !squares.includes(f));
    if (squares.length === 1) {
      const sq = squares[0] as Extract<Node, { type: 'pow' }>;
      const inner = tryPoly(sq.base);
      if (!inner || inner.degreeIn(v) !== 1 || inner.variables().length !== 1 || !inner.coeff(v, 1).eq(1)) return false;
      if (!others.every((o) => tryPoly(o)?.isConstant())) return false;
      squareTerms++;
    } else {
      const p = tryPoly(t.node);
      if (!p || !p.isConstant()) return false;
    }
  }
  return squareTerms === 1 && terms.length <= 2;
}

/** Simplified radical form: integer, square-free radicands; no radicals in denominators; like radicals combined. */
export function isSimplifiedRadical(n: Node): { ok: boolean; reason?: string } {
  let reason: string | undefined;
  const radicands = new Map<string, number>();
  let rationalTerms = 0;

  const checkRadicals = (x: Node, inDenominator: boolean): void => {
    switch (x.type) {
      case 'func': {
        if (x.name === 'abs') return checkRadicals(x.arg, inDenominator);
        if (inDenominator) {
          reason = 'There is still a radical in the denominator. Rationalize it.';
          return;
        }
        const idx = x.name === 'sqrt' ? 2 : 3;
        const argPoly = tryPoly(x.arg);
        if (!argPoly) {
          reason = 'Simplify what is inside the radical.';
          return;
        }
        if (argPoly.isConstant()) {
          const v = argPoly.constantValue();
          if (!v.isInteger()) {
            reason = 'There is a fraction inside the radical. Rewrite it without a fraction under the root.';
            return;
          }
          const absV = v.abs().toBigInt();
          if (absV === 0n || absV === 1n) {
            reason = 'A root of 0 or 1 can be simplified.';
            return;
          }
          try {
            const [outside] = extractPower(absV, idx);
            if (outside > 1n) {
              reason = `There is still a perfect ${idx === 2 ? 'square' : 'cube'} factor inside the radical.`;
              return;
            }
          } catch {
            reason = 'That radicand is too large to check.';
            return;
          }
        } else {
          // algebraic radicand: every variable exponent must be < index
          for (const [k] of argPoly.terms) {
            const m = k.split('*').filter(Boolean);
            for (const part of m) {
              const e = part.includes('^') ? Number(part.split('^')[1]) : 1;
              if (e >= idx) {
                reason = 'A variable inside the radical can still be pulled out.';
                return;
              }
            }
          }
          const c = [...argPoly.terms.values()];
          if (c.length === 1 && c[0].isInteger()) {
            const [outside] = extractPower(c[0].abs().toBigInt(), idx);
            if (outside > 1n) {
              reason = `There is still a perfect ${idx === 2 ? 'square' : 'cube'} factor inside the radical.`;
              return;
            }
          }
        }
        return;
      }
      case 'div':
        checkRadicals(x.left, inDenominator);
        checkRadicals(x.right, true);
        return;
      case 'neg':
        return checkRadicals(x.arg, inDenominator);
      case 'pow':
        if (x.exp.type !== 'num' || !x.exp.value.isInteger()) {
          reason = 'Write the answer with radical signs instead of fractional exponents.';
          return;
        }
        return checkRadicals(x.base, inDenominator);
      case 'add':
      case 'sub':
      case 'mul':
        checkRadicals(x.left, inDenominator);
        checkRadicals(x.right, inDenominator);
        return;
      default:
        return;
    }
  };
  checkRadicals(n, false);
  if (reason) return { ok: false, reason };

  // like radicals combined & rational part combined
  for (const t of additiveTerms(n)) {
    const s = trySurd(t.node);
    if (s && s.isRational()) {
      rationalTerms++;
      continue;
    }
    if (s && s.terms.size === 1) {
      const [[k]] = [...s.terms.entries()];
      radicands.set(k, (radicands.get(k) ?? 0) + 1);
      continue;
    }
    if (!s) {
      // algebraic term: key by its numeric shape
      const vars = [...variablesOf(t.node)].sort().join(',');
      const key = 'alg:' + vars + ':' + collectRadicands(t.node).join(',');
      radicands.set(key, (radicands.get(key) ?? 0) + 1);
      continue;
    }
    return { ok: false, reason: 'Multiply out and combine the terms.' };
  }
  if (rationalTerms > 1) return { ok: false, reason: 'Combine the whole-number parts.' };
  for (const c of radicands.values()) if (c > 1) return { ok: false, reason: 'Combine the like radicals.' };
  return { ok: true };
}

function collectRadicands(n: Node, out: string[] = []): string[] {
  if (n.type === 'func' && n.name !== 'abs') {
    const p = tryPoly(n.arg);
    out.push(n.name + ':' + (p ? JSON.stringify([...p.terms.entries()].map(([k, v]) => [k, v.toString()])) : '?'));
    return out;
  }
  if (n.type === 'neg' || n.type === 'func') collectRadicands(n.arg, out);
  else if (n.type === 'pow') collectRadicands(n.base, out);
  else if (n.type !== 'num' && n.type !== 'var') {
    collectRadicands(n.left, out);
    collectRadicands(n.right, out);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Relations (equations / inequalities)
// ---------------------------------------------------------------------------

export type RelOp = '=' | '<' | '>' | '<=' | '>=';
export interface Relation {
  lhs: Node;
  op: RelOp;
  rhs: Node;
  lhsText: string;
  rhsText: string;
}

const FUNC_PREFIX = /^\s*([a-zA-Z])\s*\(\s*([a-zA-Z])\s*\)\s*/;

/** Replace a leading "f(x)" / "g(x)" with "y" so function-notation answers can be compared as equations. */
export function stripFunctionNotation(s: string): string {
  return s.replace(FUNC_PREFIX, 'y ');
}

export function parseRelations(src: string): { parts: Node[]; texts: string[]; ops: RelOp[] } {
  const s = normalizeInput(stripFunctionNotation(src)).replace(/=</g, '<=').replace(/=>/g, '>=');
  const re = /(<=|>=|<|>|=)/g;
  const ops: RelOp[] = [];
  const texts: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    texts.push(s.slice(last, m.index));
    ops.push(m[1] as RelOp);
    last = m.index + m[1].length;
  }
  texts.push(s.slice(last));
  if (ops.length === 0) throw new MathSyntaxError('Write a full equation or inequality, with =, <, >, <= or >=.');
  const parts = texts.map((t) => {
    if (!t.trim()) throw new MathSyntaxError('One side of the equation or inequality is empty.');
    return parseExpression(t);
  });
  return { parts, texts, ops };
}

export function parseRelation(src: string): Relation {
  const { parts, texts, ops } = parseRelations(src);
  if (ops.length !== 1) throw new MathSyntaxError('Use only one =, <, or > sign here.');
  return { lhs: parts[0], op: ops[0], rhs: parts[1], lhsText: texts[0], rhsText: texts[1] };
}

const FLIP: Record<RelOp, RelOp> = { '=': '=', '<': '>', '>': '<', '<=': '>=', '>=': '<=' };

/** Equation equivalence: (L1-R1) = c (L2-R2) for polynomial relations, else compare isolated forms. */
export function equationsEquivalent(a: Relation, b: Relation): boolean {
  return equationsEquivalentImpl(a, b);
}

function equationsEquivalentImpl(a: Relation, b: Relation): boolean {
  const la = tryPoly(a.lhs);
  const ra = tryPoly(a.rhs);
  const lb = tryPoly(b.lhs);
  const rb = tryPoly(b.rhs);
  if (la && ra && lb && rb) {
    const pa = la.sub(ra);
    const pb = lb.sub(rb);
    if (pa.isZero() || pb.isZero()) return pa.isZero() && pb.isZero();
    return pa.ratioTo(pb) !== null;
  }
  // Non-polynomial: compare "v = expr" forms (e.g. y = 3(2)^x).
  const iso = (r: Relation): { v: string; e: Node } | null => {
    if (r.lhs.type === 'var' && !variablesOf(r.rhs).has(r.lhs.name)) return { v: r.lhs.name, e: r.rhs };
    if (r.rhs.type === 'var' && !variablesOf(r.lhs).has(r.rhs.name)) return { v: r.rhs.name, e: r.lhs };
    return null;
  };
  const ia = iso(a);
  const ib = iso(b);
  if (ia && ib && ia.v === ib.v) return expressionsEquivalent(ia.e, ib.e);
  return false;
}

/** Does (x, y) satisfy the relation? */
export function relationHolds(r: Relation, x: Rational, y: Rational): boolean {
  const vals = { x, y };
  const lp = tryPoly(r.lhs);
  const rp = tryPoly(r.rhs);
  if (!lp || !rp) throw new Error('constraint must be polynomial');
  const l = lp.evaluate(vals);
  const rr = rp.evaluate(vals);
  const c = l.sub(rr).sign();
  switch (r.op) {
    case '=':
      return c === 0;
    case '<':
      return c < 0;
    case '>':
      return c > 0;
    case '<=':
      return c <= 0;
    case '>=':
      return c >= 0;
  }
}

/** Light TeX for a typed relation ("y <= 2x + 1" to "y \le 2x + 1"). */
export function relationTex(src: string): string {
  return src.replace(/<=/g, ' \\le ').replace(/>=/g, ' \\ge ').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
}

/** Inequality equivalence: same half-plane / half-line. */
export function inequalitiesEquivalent(a: Relation, b: Relation): boolean {
  const la = tryPoly(a.lhs);
  const ra = tryPoly(a.rhs);
  const lb = tryPoly(b.lhs);
  const rb = tryPoly(b.rhs);
  if (!(la && ra && lb && rb)) return false;
  const pa = la.sub(ra);
  const pb = lb.sub(rb);
  const c = pa.ratioTo(pb);
  if (!c) return false;
  return c.sign() > 0 ? a.op === b.op : a.op === FLIP[b.op];
}

// ---------------------------------------------------------------------------
// Intervals (interval notation, set-builder notation, inequalities)
// ---------------------------------------------------------------------------

export interface Interval {
  lo: Rational | null; // null = -infinity
  loClosed: boolean;
  hi: Rational | null; // null = +infinity
  hiClosed: boolean;
}

function parseEndpoint(s: string): Rational | null | 'neginf' | 'posinf' {
  const t = s.trim().toLowerCase().replace(/\s+/g, '');
  if (['-∞', '-inf', '-infinity', '-oo'].includes(t)) return 'neginf';
  if (['∞', 'inf', 'infinity', '+∞', '+inf', 'oo', '+infinity'].includes(t)) return 'posinf';
  const n = parseExpression(t);
  const v = trySurd(n);
  if (!v || !v.isRational()) throw new MathSyntaxError('Interval endpoints must be numbers (fractions are fine).');
  return v.rationalPart();
}

export function parseInterval(src: string): Interval {
  const s0 = normalizeInput(src).replace(/−/g, '-');
  const s = s0.trim();
  const lower = s.toLowerCase();
  if (/^(all real numbers|all reals|ℝ|r|\(-(∞|inf|infinity),\s*(∞|inf|infinity|\+∞)\))$/.test(lower.replace(/\s+/g, ' '))) {
    return { lo: null, loClosed: false, hi: null, hiClosed: false };
  }
  // set-builder: {x | ...} or {x : ...}
  const sb = /^\{\s*([a-zA-Z])\s*[|:]\s*(.+)\}$/.exec(s);
  if (sb) {
    const body = sb[2].trim();
    if (/^[a-zA-Z]\s*(∈|in)\s*(ℝ|r|reals|real numbers)$/i.test(body)) return { lo: null, loClosed: false, hi: null, hiClosed: false };
    return intervalFromInequality(body, sb[1]);
  }
  const m = /^([[(])\s*(.+?)\s*,\s*(.+?)\s*([\])])$/.exec(s);
  if (m) {
    const lo = parseEndpoint(m[2]);
    const hi = parseEndpoint(m[3]);
    if (lo === 'posinf' || hi === 'neginf') throw new MathSyntaxError('The smaller endpoint goes first.');
    if (lo === 'neginf' && m[1] === '[') throw new MathSyntaxError('Infinity always gets a round parenthesis, never a bracket.');
    if (hi === 'posinf' && m[4] === ']') throw new MathSyntaxError('Infinity always gets a round parenthesis, never a bracket.');
    const loV = lo === 'neginf' ? null : (lo as Rational);
    const hiV = hi === 'posinf' ? null : (hi as Rational);
    if (loV && hiV && loV.gt(hiV)) throw new MathSyntaxError('The smaller endpoint goes first.');
    return { lo: loV, loClosed: m[1] === '[', hi: hiV, hiClosed: m[4] === ']' };
  }
  if (/[<>]/.test(s)) {
    const vars = s.match(/[a-zA-Z]/g);
    return intervalFromInequality(s, vars ? vars[0] : 'x');
  }
  throw new MathSyntaxError('Write the answer in interval notation like [2, ∞), set-builder notation like {x | x ≥ 2}, or as an inequality.');
}

function intervalFromInequality(s: string, v: string): Interval {
  const { parts, ops } = parseRelations(s);
  const constVal = (n: Node): Rational => {
    const sv = trySurd(n);
    if (!sv || !sv.isRational()) throw new MathSyntaxError('Compare the variable to numbers only.');
    return sv.rationalPart();
  };
  const isV = (n: Node) => n.type === 'var' && n.name === v;
  const res: Interval = { lo: null, loClosed: false, hi: null, hiClosed: false };
  const apply = (op: RelOp, value: Rational, varOnLeft: boolean) => {
    const eff = varOnLeft ? op : FLIP[op];
    if (eff === '>' || eff === '>=') {
      res.lo = value;
      res.loClosed = eff === '>=';
    } else if (eff === '<' || eff === '<=') {
      res.hi = value;
      res.hiClosed = eff === '<=';
    } else {
      res.lo = value;
      res.hi = value;
      res.loClosed = res.hiClosed = true;
    }
  };
  if (ops.length === 1) {
    if (isV(parts[0])) apply(ops[0], constVal(parts[1]), true);
    else if (isV(parts[1])) apply(ops[0], constVal(parts[0]), false);
    else throw new MathSyntaxError(`Write the inequality with ${v} by itself on one side.`);
  } else if (ops.length === 2 && isV(parts[1])) {
    apply(ops[0], constVal(parts[0]), false);
    apply(ops[1], constVal(parts[2]), true);
  } else throw new MathSyntaxError(`Write the inequality with ${v} in the middle, like -2 ≤ ${v} < 5.`);
  if (res.lo && res.hi && res.lo.gt(res.hi)) throw new MathSyntaxError('That inequality has no numbers that satisfy it.');
  return res;
}

export function intervalsEqual(a: Interval, b: Interval): boolean {
  const eqEnd = (x: Rational | null, y: Rational | null) => (x === null ? y === null : y !== null && x.eq(y));
  return eqEnd(a.lo, b.lo) && eqEnd(a.hi, b.hi) && (a.lo === null || a.loClosed === b.loClosed) && (a.hi === null || a.hiClosed === b.hiClosed);
}

export function intervalToText(iv: Interval): string {
  if (iv.lo === null && iv.hi === null) return '(-∞, ∞)';
  const lo = iv.lo === null ? '(-∞' : `${iv.loClosed ? '[' : '('}${iv.lo.toString()}`;
  const hi = iv.hi === null ? '∞)' : `${iv.hi.toString()}${iv.hiClosed ? ']' : ')'}`;
  return `${lo}, ${hi}`;
}
export function intervalToTex(iv: Interval): string {
  if (iv.lo === null && iv.hi === null) return '(-\\infty, \\infty)';
  const lo = iv.lo === null ? '(-\\infty' : `${iv.loClosed ? '[' : '('}${iv.lo.toTex()}`;
  const hi = iv.hi === null ? '\\infty)' : `${iv.hi.toTex()}${iv.hiClosed ? ']' : ')'}`;
  return `${lo}, ${hi}`;
}

// ---------------------------------------------------------------------------
// Solution lists ("x = 3 or x = -2", "3, -2", "x = 1 ± √5", "no real solutions")
// ---------------------------------------------------------------------------

const NO_SOLUTION = /^(no( real)? (solution|solutions|roots|zeros)|none|∅|\{\s*\}|no solution\.?)$/i;

export function parseSolutionList(src: string, variable = 'x'): Node[] | 'none' {
  const s = normalizeInput(src).trim();
  if (NO_SOLUTION.test(s)) return 'none';
  let body = s.replace(/^\{(.*)\}$/, '$1');
  // remove "x =" prefixes everywhere
  const varRe = new RegExp(`\\b${variable}\\s*=`, 'g');
  body = body.replace(varRe, '');
  const pieces = body
    .split(/\s*(?:,|;|\bor\b|\band\b)\s*/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (pieces.length === 0) throw new MathSyntaxError('Type each solution, separated by commas or "or".');
  const out: Node[] = [];
  for (const p of pieces) {
    const pm = p.replace(/\+\/-|\+-|±/g, '±');
    if (pm.includes('±')) {
      if ((pm.match(/±/g) || []).length > 1) throw new MathSyntaxError('Use ± only once in each solution.');
      out.push(parseExpression(pm.replace('±', '+')));
      out.push(parseExpression(pm.replace('±', '-')));
    } else {
      if (/[=<>]/.test(p)) throw new MathSyntaxError(`Write each solution as a value, like ${variable} = 3.`);
      out.push(parseExpression(p));
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Main checker
// ---------------------------------------------------------------------------

function numberValueOf(input: string): { value: Rational | null; literal: boolean; node: Node | null; error?: string } {
  const s = normalizeInput(input);
  // mixed number "2 1/2" or "-2 1/2"
  const mixed = /^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(s);
  if (mixed) {
    const whole = Rational.parse(mixed[2]);
    const frac = Rational.of(BigInt(mixed[3]), BigInt(mixed[4]));
    const v = whole.add(frac);
    return { value: mixed[1] === '-' ? v.neg() : v, literal: true, node: null };
  }
  const n = parseSafe(s.replace(/,(?=\d{3}\b)/g, ''));
  if (n instanceof MathSyntaxError) return { value: null, literal: false, node: null, error: n.friendly };
  const sv = trySurd(n);
  const literal = isPlainNumberLiteral(n) || isSimpleFraction(n);
  if (sv && sv.isRational()) return { value: sv.rationalPart(), literal, node: n };
  return { value: null, literal, node: n };
}

function stripUnit(input: string, unit?: string): string {
  let s = input.trim().replace(/^\$/, '');
  if (unit) {
    const u = unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp(`\\s*${u}\\.?$`, 'i'), '');
  }
  // strip trailing common unit words/symbols the student might add
  s = s.replace(/\s*(?:per|\/)\s*(?:hours?|hr|h|minutes?|min|seconds?|sec|s|days?|weeks?|wk|months?|mo|years?|yr|miles?|mi|cars?|tickets?|items?|gallons?|gal)\.?$/i, '');
  s = s.replace(/\s*(%|dollars?|units?|square units|sq units|feet|ft|meters?|m|inches|in|cm|miles?|mi|seconds?|sec|s|hours?|hr|minutes?|min|days?|weeks?|months?|years?|yr|points?|pts|degrees?|gallons?|gal|centimeters?|meters? per second|feet per second|cars?|tickets?)\.?$/i, '');
  return s;
}

function checkMisconceptions(spec: AnswerSpec, input: string, list: Misconception[] | undefined): CheckResult | null {
  if (!list) return null;
  for (const m of list) {
    const alt: AnswerSpec = withValue(spec, m.answer);
    const r = checkCore(alt, input, true);
    if (r.status === 'correct' || r.status === 'wrong-form') return bad(m.feedback, m.tag);
  }
  return null;
}

function withValue(spec: AnswerSpec, value: string): AnswerSpec {
  switch (spec.kind) {
    case 'number':
    case 'expression':
    case 'equation':
    case 'inequality':
    case 'interval':
      return { ...spec, value } as AnswerSpec;
    case 'point': {
      const [x, y] = value.split('|');
      return { ...spec, x, y };
    }
    case 'region-point': {
      // a misconception is one specific wrong point
      const [x, y] = value.split('|');
      return { kind: 'point', x, y };
    }
    case 'solutions':
    case 'sequence-terms':
      return { ...spec, values: value === '' ? [] : value.split('|') } as AnswerSpec;
    case 'choice':
      return { ...spec, correct: value };
  }
}

export function checkAnswer(spec: AnswerSpec, input: string, misconceptions?: Misconception[]): CheckResult {
  if (input.trim() === '') return invalid('Type an answer first.');
  let r: CheckResult;
  try {
    r = checkCore(spec, input, false);
  } catch (e) {
    if (e instanceof MathSyntaxError) return invalid(e.friendly);
    return invalid('That answer could not be read. Check how it is typed.');
  }
  if (r.status === 'incorrect') {
    let m: CheckResult | null = null;
    try {
      m = checkMisconceptions(spec, input, misconceptions);
    } catch {
      m = null;
    }
    if (m) return m;
  }
  return r;
}

function checkCore(spec: AnswerSpec, rawInput: string, quiet: boolean): CheckResult {
  switch (spec.kind) {
    case 'choice':
      return rawInput === spec.correct ? ok() : bad();

    case 'number': {
      const input = stripUnit(rawInput, spec.unit);
      const exact = exactValue(spec.value);
      if (!exact || !exact.isRational()) throw new Error('number spec must be rational: ' + spec.value);
      const target = exact.rationalPart();
      const got = numberValueOf(input);
      if (got.error) return invalid(got.error);
      if (got.value === null) {
        if (got.node) {
          const sv = trySurd(got.node);
          if (sv && !sv.isRational()) return bad();
          if (variablesOf(got.node).size > 0) return invalid('This answer should be a number, without variables.');
        }
        return invalid('Type a number, like 12, -3.5, or 7/4.');
      }
      const v = got.value;
      if (spec.roundTo !== undefined) {
        const rounded = target.round(spec.roundTo);
        if (v.eq(target) || v.eq(rounded)) return got.literal ? ok() : form('That has the right value. Now simplify it to a single number.');
        // accept a value rounded to more places than asked when it rounds to the right answer
        if (v.round(spec.roundTo).eq(rounded) && v.sub(target).abs().le(Rational.of(1n, 10n ** BigInt(spec.roundTo)))) {
          return ok(`Correct. Rounded to ${spec.roundTo} decimal place${spec.roundTo === 1 ? '' : 's'}, that's ${rounded.toDecimalString(spec.roundTo)}.`);
        }
        return bad();
      }
      if (v.eq(target)) {
        if (!got.literal) return form("That's equal to the answer, but simplify it to a single number.");
        if (got.node && isSimpleFraction(got.node)) {
          const core = got.node.type === 'neg' ? got.node.arg : got.node;
          if (core.type === 'div' && core.left.type === 'num' && core.right.type === 'num') {
            const raw = Rational.of(core.left.value.num, 1n);
            const den = core.right.value.num;
            const g = (() => {
              let a = raw.num < 0n ? -raw.num : raw.num;
              let b = den < 0n ? -den : den;
              while (b) [a, b] = [b, a % b];
              return a;
            })();
            if (g > 1n) return ok(`Correct! You could also simplify that fraction to ${target.toString()}.`);
          }
        }
        return ok();
      }
      // repeating decimal typed as a rounded decimal
      if (!target.isTerminatingDecimal() && v.sub(target).abs().lt(Rational.of(1n, 100n)) && /\./.test(input)) {
        return bad('Very close. This answer is a repeating decimal, so type it exactly as a fraction.', 'other');
      }
      return bad();
    }

    case 'expression': {
      // Expression answers never contain "=", so a leading "y =", "f(x) =", "C(m) =" or "a_n =" is just a label.
      const input = stripFunctionNotation(rawInput)
        .replace(/^\s*y\s*=\s*/i, '')
        .replace(/^\s*[a-zA-Z](?:_?\{?[a-zA-Z0-9]{1,3}\}?)?\s*(?:\(\s*[a-zA-Z0-9]+\s*\))?\s*=\s*/, '');
      const n = parseExpression(input);
      const target = parseExpression(spec.value);
      const allowed = spec.variables ?? [...variablesOf(target)];
      const used = [...variablesOf(n)];
      const extra = used.filter((u) => !allowed.includes(u));
      if (extra.length > 0) {
        return quiet ? bad() : invalid(`Use only the variable${allowed.length === 1 ? '' : 's'} ${allowed.join(', ') || '(none)'} in this answer. I see ${extra.join(', ')}.`);
      }
      if (!expressionsEquivalent(n, target)) return bad();
      const f = spec.form ?? 'any';
      if (f === 'expanded' && !isExpandedForm(n)) return form("That's equivalent. Now multiply out and combine like terms.");
      if (f === 'factored' && !isCompletelyFactored(n)) return form("That's equivalent, but it isn't completely factored yet.");
      if (f === 'vertex' && !isVertexForm(n, allowed[0] ?? 'x')) return form("That's equivalent. Now write it in vertex form, a(x - h)² + k.");
      if (f === 'simplified-radical') {
        const sr = isSimplifiedRadical(n);
        if (!sr.ok) return form(`That's equal to the answer, but it can be simplified further. ${sr.reason ?? ''}`.trim());
      }
      return ok();
    }

    case 'equation': {
      const target = parseRelation(spec.value);
      let got: Relation;
      try {
        got = parseRelation(rawInput);
      } catch (e) {
        // A bare expression typed for "y = ..." answers: treat as y = expr when the target isolates y.
        if (e instanceof MathSyntaxError && !/[=<>]/.test(rawInput) && target.lhs.type === 'var') {
          got = parseRelation(`${target.lhs.name} = ${rawInput}`);
        } else throw e;
      }
      if (got.op !== '=') return quiet ? bad() : invalid('This answer should be an equation with an = sign.');
      const tVars = new Set([...variablesOf(target.lhs), ...variablesOf(target.rhs)]);
      const gVars = new Set([...variablesOf(got.lhs), ...variablesOf(got.rhs)]);
      const extra = [...gVars].filter((v) => !tVars.has(v));
      if (extra.length && !quiet) return invalid(`Use the variables ${[...tVars].sort().join(' and ')}. I see ${extra.join(', ')}.`);
      if (!equationsEquivalentImpl(got, target)) return bad();
      const f = spec.form ?? 'any';
      const fm = equationFormCheck(got, f);
      return fm ?? ok();
    }

    case 'inequality': {
      const target = parseRelation(spec.value);
      const got = parseRelation(rawInput);
      if (got.op === '=') return quiet ? bad() : invalid('Use an inequality symbol: <, >, <= (≤) or >= (≥).');
      {
        const tVars = new Set([...variablesOf(target.lhs), ...variablesOf(target.rhs)]);
        const extra = [...variablesOf(got.lhs), ...variablesOf(got.rhs)].filter((v) => !tVars.has(v));
        if (extra.length && !quiet) return invalid(`Use the variable${tVars.size === 1 ? '' : 's'} ${[...tVars].sort().join(' and ')}. I see ${[...new Set(extra)].join(', ')}.`);
      }
      if (inequalitiesEquivalent(got, target)) return ok();
      // same boundary, wrong symbol: give a targeted nudge
      const la = tryPoly(got.lhs)?.sub(tryPoly(got.rhs)!);
      const lb = tryPoly(target.lhs)?.sub(tryPoly(target.rhs)!);
      if (la && lb && la.ratioTo(lb)) {
        const c = la.ratioTo(lb)!;
        const tOp = c.sign() > 0 ? target.op : FLIP[target.op];
        const strict = (o: RelOp) => o === '<' || o === '>';
        const dir = (o: RelOp) => (o === '<' || o === '<=' ? -1 : 1);
        if (dir(tOp) !== dir(got.op)) return bad('The boundary is right. Check the direction of the inequality symbol.', 'inequality-direction');
        if (strict(tOp) !== strict(got.op)) return bad('The boundary is right. Should the boundary itself be included?', 'boundary-line');
      }
      return bad();
    }

    case 'region-point': {
      const s = normalizeInput(rawInput).trim().replace(/^\(/, '').replace(/\)$/, '');
      const parts = s.split(',');
      if (parts.length !== 2) return invalid('Type an ordered pair like (3, -2).');
      const x = exactValue(parts[0]);
      const y = exactValue(parts[1]);
      if (!x || !y || !x.isRational() || !y.isRational()) return invalid('Each coordinate should be a number.');
      const xv = x.rationalPart();
      const yv = y.rationalPart();
      if (spec.wholeNumbers && (!xv.isInteger() || !yv.isInteger() || xv.isNegative() || yv.isNegative()))
        return bad('In this situation both numbers have to be whole numbers (0, 1, 2, ...).', 'other');
      for (const c of spec.constraints) {
        if (!relationHolds(parseRelation(c), xv, yv)) {
          return bad(quiet ? undefined : `$(${xv.toTex()}, ${yv.toTex()})$ does not make $${relationTex(c)}$ true. Substitute it to see why, then pick a point inside the region where all the shading overlaps.`, 'shading');
        }
      }
      return ok();
    }

    case 'point': {
      const s = normalizeInput(rawInput).trim().replace(/^\(/, '').replace(/\)$/, '');
      const parts = s.split(',');
      if (parts.length !== 2) return invalid('Type an ordered pair like (3, -2).');
      const x = exactValue(parts[0]);
      const y = exactValue(parts[1]);
      if (!x || !y) return invalid('Each coordinate should be a number.');
      const tx = exactValue(spec.x)!;
      const ty = exactValue(spec.y)!;
      if (x.equals(tx) && y.equals(ty)) return ok();
      if (x.equals(ty) && y.equals(tx) && !tx.equals(ty)) return bad('Check the order: the x-coordinate comes first.', 'graph-reading');
      return bad();
    }

    case 'solutions': {
      const variable = spec.variable ?? 'x';
      const got = parseSolutionList(rawInput, variable);
      const target = spec.values.map((v) => parseExpression(v));
      if (got === 'none') return target.length === 0 ? ok() : bad();
      if (target.length === 0) return bad();
      const used = got.flatMap((g) => [...variablesOf(g)]);
      if (used.length) return invalid('Each solution should be a number.');
      const matches = (g: Node, t: Node): boolean => {
        const gs = trySurd(g);
        const ts = trySurd(t);
        if (gs && ts && gs.equals(ts)) return true;
        if (spec.roundTo !== undefined) {
          const tv = ts ? ts.toNumber() : evalNumeric(t);
          const gv = gs ? gs.toNumber() : evalNumeric(g);
          const factor = Math.pow(10, spec.roundTo);
          const tr = Math.round(tv * factor) / factor;
          return Math.abs(gv - tr) < 1e-9 || (Math.abs(gv - tv) <= 0.5 / factor + 1e-12 && Math.round(gv * factor) / factor === tr);
        }
        if (!gs || !ts) {
          const a = evalNumeric(g);
          const b = evalNumeric(t);
          return Number.isFinite(a) && Math.abs(a - b) < 1e-12 * Math.max(1, Math.abs(b));
        }
        return false;
      };
      // dedupe target (double roots)
      const uniqT: Node[] = [];
      for (const t of target) if (!uniqT.some((u) => matches(u, t) && matches(t, u))) uniqT.push(t);
      const uniqG: Node[] = [];
      const sameExact = (u: Node, g: Node) => {
        const a = trySurd(u);
        const b = trySurd(g);
        return a !== null && b !== null && a.equals(b);
      };
      for (const g of got) if (!uniqG.some((u) => sameExact(u, g))) uniqG.push(g);
      const allGotValid = uniqG.every((g) => uniqT.some((t) => matches(g, t)));
      const allTargetsFound = uniqT.every((t) => uniqG.some((g) => matches(g, t)));
      if (allGotValid && allTargetsFound) return ok();
      if (allGotValid && !allTargetsFound) return bad('What you found is a solution, but there is another one. Look for every solution.', 'missing-solution');
      return bad();
    }

    case 'interval': {
      const got = parseInterval(rawInput);
      const target = parseInterval(spec.value);
      if (intervalsEqual(got, target)) return ok();
      const sameEnds =
        ((got.lo === null && target.lo === null) || (got.lo !== null && target.lo !== null && got.lo.eq(target.lo))) &&
        ((got.hi === null && target.hi === null) || (got.hi !== null && target.hi !== null && got.hi.eq(target.hi)));
      if (sameEnds) return bad('The endpoints are right. Check whether each endpoint is included (bracket) or not (parenthesis).', 'interval-endpoint');
      return bad();
    }

    case 'sequence-terms': {
      const parts = normalizeInput(rawInput)
        .split(/\s*,\s*/)
        .filter((p) => p.length > 0);
      if (parts.length !== spec.values.length) return invalid(`Type ${spec.values.length} terms separated by commas.`);
      for (let i = 0; i < parts.length; i++) {
        const g = exactValue(parts[i]);
        const t = exactValue(spec.values[i])!;
        if (!g) return invalid(`Term ${i + 1} should be a number.`);
        if (!g.equals(t)) return bad();
      }
      return ok();
    }
  }
}

function equationFormCheck(got: Relation, f: EquationForm): CheckResult | null {
  if (f === 'any') return null;
  const yIsolated = (side: Node) => side.type === 'var' && side.name === 'y';
  const otherSide = yIsolated(got.lhs) ? got.rhs : yIsolated(got.rhs) ? got.lhs : null;
  switch (f) {
    case 'slope-intercept': {
      if (!otherSide) return form('That equation is equivalent. Now solve it for y, so it reads y = mx + b.');
      const p = tryPoly(otherSide);
      if (!p || p.degree() > 1 || p.variables().some((v) => v !== 'x')) return form('Write it as y = mx + b.');
      if (!isExpandedForm(otherSide)) return form("That's equivalent. Now simplify the right side to mx + b.");
      return null;
    }
    case 'standard': {
      // Ax + By = C, integers, variables on the left only
      const l = tryPoly(got.lhs);
      const r = tryPoly(got.rhs);
      if (!l || !r) return form('Write it as Ax + By = C.');
      if (!r.isConstant() || l.terms.has('') || !isExpandedForm(got.lhs)) return form("That's equivalent. Now write it in standard form, Ax + By = C, with x and y on the left.");
      const all = [...l.terms.values(), r.constantValue()];
      if (!all.every((c) => c.isInteger())) return form('In standard form, A, B and C are integers. Clear the fractions.');
      return null;
    }
    case 'point-slope': {
      // y - y1 = m(x - x1)
      const l = tryPoly(got.lhs);
      if (!l || l.degreeIn('x') !== 0 || !l.coeff('y', 1).eq(1)) return form("That's equivalent. Write it in point-slope form, y - y₁ = m(x - x₁).");
      const rhs = got.rhs;
      const rp = tryPoly(rhs);
      if (!rp || rp.degreeIn('y') !== 0) return form('Write it as y - y₁ = m(x - x₁).');
      if (rp.isConstant()) return null; // horizontal line y - b = 0 accepted
      const factors = multiplicativeFactors(rhs);
      const hasBinomial = factors.some((fct) => {
        const p = tryPoly(fct);
        return p && p.degreeIn('x') === 1 && p.coeff('x', 1).eq(1) && !(fct.type === 'var');
      });
      const isBareX = factors.some((fct) => fct.type === 'var' && fct.name === 'x');
      if (!hasBinomial && !isBareX) return form("That's equivalent. Write it in point-slope form, y - y₁ = m(x - x₁).");
      return null;
    }
    case 'vertex': {
      if (!otherSide) return form('Write it as y = a(x - h)² + k.');
      return isVertexForm(otherSide) ? null : form("That's equivalent. Now write it in vertex form, y = a(x - h)² + k.");
    }
    case 'factored': {
      if (!otherSide) return form('Write it as y = a(x - p)(x - q).');
      return isCompletelyFactored(otherSide) ? null : form("That's equivalent. Now write the right side in factored form.");
    }
    case 'quadratic-standard': {
      if (!otherSide) return form('Write it as y = ax² + bx + c.');
      return isExpandedForm(otherSide) ? null : form("That's equivalent. Now expand it to y = ax² + bx + c.");
    }
  }
  return null;
}

/** Plain-text rendering of the correct answer (for review screens, never shown before help is exhausted). */
export function answerToText(spec: AnswerSpec): string {
  switch (spec.kind) {
    case 'number': {
      const v = exactValue(spec.value)!.rationalPart();
      const base = spec.roundTo !== undefined ? v.round(spec.roundTo).toDecimalString(spec.roundTo) : v.isInteger() || v.isTerminatingDecimal() ? v.toDecimalString(8) : v.toString();
      return spec.unit ? `${base} ${spec.unit}` : base;
    }
    case 'expression':
      return spec.value;
    case 'equation':
    case 'inequality':
      return spec.value;
    case 'point':
      return `(${spec.x}, ${spec.y})`;
    case 'region-point':
      return `any point that makes ${spec.constraints.join(' and ')} true${spec.wholeNumbers ? ' (whole numbers)' : ''}, for example (${spec.example.x}, ${spec.example.y})`;
    case 'solutions':
      return spec.values.length === 0 ? 'no real solutions' : spec.values.map((v) => `${spec.variable ?? 'x'} = ${v}`).join(' or ');
    case 'interval':
      return spec.value;
    case 'choice':
      return spec.options.find((o) => o.id === spec.correct)?.label ?? spec.correct;
    case 'sequence-terms':
      return spec.values.join(', ');
  }
}

export { Surd, Poly };
