/**
 * Unit 5 generators for the properties of exponents (S5.01) and solving exponential equations
 * (S5.04). verify() re-reads the printed expression or equation: numerical powers are evaluated
 * exactly, monomials are compared with the key at sample points, and equations are checked by
 * substituting the key.
 */
import type { GeneratorDef, Rng, SolutionStep, ProblemStep } from '../../core/curriculum/types';
import type { Misconception, MisconceptionTag } from '../../core/math/answers';
import { expressionsEquivalent, isExponentSimplified } from '../../core/math/answers';
import { parseExpression } from '../../core/math/parser';
import { evalNumeric } from '../../core/math/evaluate';
import { Rational } from '../../core/math/rational';
import { p, makeProblem, numStr, Q, numberMisconceptions } from './util';
import { texToParser, texExact, powTex, mono, monoMul, monoDiv, monoPow, monoRawTex, monoPlain, monoTex, VAR_SETS, type Mono } from './u5-common';
import { mathBlocks } from './u4-common';

type Hints = [string, string, string, string];
type Mis = { value: Rational | null; tag: MisconceptionTag; feedback: string };
const fracStr = (r: Rational) => r.toString();

// ---------------------------------------------------------------------------
// S5.01: evaluate numerical powers
// ---------------------------------------------------------------------------

interface PowItem {
  tex: string;
  value: Rational;
  mis: Mis[];
  hints: Hints;
  solution: SolutionStep[];
}

const RULES_HINT = 'Product rule: add exponents. Quotient rule: subtract exponents. Power rule: multiply exponents. All three need the same base.';

function powSmall(b: number, e: number, limit: number): boolean {
  return Math.abs(b) ** Math.abs(e) <= limit;
}

function evalD1(rng: Rng): PowItem {
  const kind = rng.pick(['zero', 'neg', 'neg', 'frac', 'negbase', 'ten'] as const);
  if (kind === 'zero') {
    const bare = rng.bool();
    const b = rng.pick([rng.int(2, 15), -rng.int(2, 9), 0]);
    if (bare && b > 0) {
      return {
        tex: `-${b}^{0}`,
        value: Q(-1),
        mis: [
          { value: Q(1), tag: 'exponent-rule', feedback: 'The exponent belongs only to the number right under it. The negative sign is in front of the whole power.' },
          { value: Q(0), tag: 'exponent-rule', feedback: 'A nonzero number to the zero power is not 0.' },
        ],
        hints: ['What does the exponent $0$ do to a nonzero base?', `The exponent sits on $${b}$ only, not on the negative sign.`, `First find $${b}^{0}$, then apply the negative sign.`, `$-${b}^{0}$ means $-(${b}^{0})$.`],
        solution: [
          { text: 'The exponent applies only to the base right next to it.', tex: `-${b}^{0} = -\\left(${b}^{0}\\right)`, why: 'Order of operations: exponents come before the negative sign (which means multiplying by $-1$).' },
          { text: 'Any nonzero number to the zero power is 1.', tex: `-\\left(1\\right) = -1` },
        ],
      };
    }
    const base = b === 0 ? Q(rng.int(1, 4), rng.pick([3, 5, 7])) : Q(b);
    return {
      tex: powTex(base, 0),
      value: Q(1),
      mis: [
        { value: Q(0), tag: 'exponent-rule', feedback: 'A nonzero number to the zero power is not 0. Think about the pattern $2^{3}, 2^{2}, 2^{1}, 2^{0}$: each step divides by 2.' },
        { value: base, tag: 'exponent-rule', feedback: 'An exponent of 1 leaves the base unchanged, but this exponent is 0.' },
      ],
      hints: ['Look at the pattern $3^{3} = 27$, $3^{2} = 9$, $3^{1} = 3$, $3^{0} = ?$', 'Each time the exponent goes down by 1, you divide by the base.', 'The zero power is the base divided by itself.', 'Any nonzero number divided by itself is the same number every time.'],
      solution: [
        { text: 'Use the quotient pattern.', tex: `${powTex(base, 0)} = \\frac{${powTex(base, 1)}}{${powTex(base, 1)}}`, why: 'Subtracting equal exponents gives 0, and a number divided by itself is 1.' },
        { text: 'Any nonzero number to the zero power is 1.', tex: `${powTex(base, 0)} = 1` },
      ],
    };
  }
  if (kind === 'neg' || kind === 'ten') {
    const b = kind === 'ten' ? 10 : rng.int(2, 6);
    let n = rng.int(1, 3);
    while (!powSmall(b, n, kind === 'ten' ? 1000 : 216)) n--;
    const v = Q(1).div(Q(b).pow(n));
    return {
      tex: `${b}^{-${n}}`,
      value: v,
      mis: [
        { value: Q(b).pow(n).neg(), tag: 'exponent-rule', feedback: 'A negative exponent does not make the number negative. It means "one over" the positive power.' },
        { value: Q(-b * n), tag: 'exponent-rule', feedback: 'An exponent is not multiplication. Also, a negative exponent does not make the answer negative.' },
        { value: n === 1 ? null : Q(1, b * n), tag: 'exponent-rule', feedback: `$${b}^{${n}}$ means $${b}$ multiplied by itself ${n} times, not $${b} \\times ${n}$.` },
      ],
      hints: ['A negative exponent means "one over" the same power with a positive exponent.', `Rewrite $${b}^{-${n}}$ as $\\frac{1}{${b}^{${n}}}$.`, `Work out $${b}^{${n}}$ by repeated multiplication.`, 'The answer is a positive fraction.'],
      solution: [
        { text: 'A negative exponent means the reciprocal of the positive power.', tex: `${b}^{-${n}} = \\frac{1}{${b}^{${n}}}`, why: `Following the pattern down past $${b}^{0} = 1$, each step divides by ${b} again.` },
        { text: 'Evaluate the power.', tex: `\\frac{1}{${b}^{${n}}} = ${v.toTex()}` },
      ],
    };
  }
  if (kind === 'frac') {
    let a = rng.int(1, 5);
    const c = rng.int(2, 5);
    while (a === c || gcd(a, c) !== 1) a = rng.int(1, 5);
    let n = rng.int(1, 3);
    while (!powSmall(Math.max(a, c), n, 125)) n--;
    const base = Q(a, c);
    const v = base.inv().pow(n);
    return {
      tex: powTex(base, `-${n}`),
      value: v,
      mis: [
        { value: base.pow(n), tag: 'exponent-rule', feedback: 'With a negative exponent, flip the fraction first, then use the positive exponent.' },
        { value: v.neg(), tag: 'exponent-rule', feedback: 'A negative exponent does not make the number negative.' },
      ],
      hints: ['A negative exponent means take the reciprocal.', `The reciprocal of $${base.toTex()}$ is $${base.inv().toTex()}$.`, `Rewrite it as the flipped fraction raised to the power ${n}.`, 'Raise the top and the bottom to the power.'],
      solution: [
        { text: 'Flip the fraction and make the exponent positive.', tex: `${powTex(base, `-${n}`)} = ${powTex(base.inv(), n)}`, why: `$\\frac{1}{${base.toTex()}} = ${base.inv().toTex()}$, so the reciprocal of a fraction is the fraction flipped.` },
        { text: 'Raise the numerator and denominator to the power.', tex: `${powTex(base.inv(), n)} = ${v.toTex()}` },
      ],
    };
  }
  // negbase: (-b)^n versus -b^n
  const b = rng.int(2, 5);
  let n = rng.int(2, 4);
  while (!powSmall(b, n, 125)) n--;
  const paren = rng.bool();
  if (!paren && n % 2 === 1) n = n === 3 && b <= 3 ? 4 : 2;
  const tex = paren ? `(-${b})^{${n}}` : `-${b}^{${n}}`;
  const v = paren ? Q(-b).pow(n) : Q(b).pow(n).neg();
  const other = paren ? Q(b).pow(n).neg() : Q(-b).pow(n);
  return {
    tex,
    value: v,
    mis: [
      { value: other, tag: 'order-of-operations', feedback: paren ? 'The parentheses make $-' + b + '$ the base, so the negative is multiplied too.' : `Without parentheses the base is just $${b}$. The negative sign is applied after the power.` },
      { value: Q(-b * n), tag: 'exponent-rule', feedback: 'An exponent means repeated multiplication of the base, not multiplying the base by the exponent.' },
    ],
    hints: ['Decide exactly what the base is.', paren ? `The base is $-${b}$, because of the parentheses.` : `There are no parentheses, so the base is $${b}$; the negative is applied last.`, `Write out the repeated multiplication ${n} times.`, paren ? 'An even number of negative factors gives a positive product; an odd number gives a negative product.' : `Find $${b}^{${n}}$, then make it negative.`],
    solution: paren
      ? [
          { text: `The base is $-${b}$.`, tex: `(-${b})^{${n}} = ${Array(n).fill(`(-${b})`).join('')}`, why: 'Parentheses put the negative sign inside the base.' },
          { text: 'Multiply.', tex: `= ${v.toTex()}`, why: n % 2 === 0 ? 'An even number of negative factors makes a positive product.' : 'An odd number of negative factors makes a negative product.' },
        ]
      : [
          { text: `The base is $${b}$, not $-${b}$.`, tex: `-${b}^{${n}} = -\\left(${Array(n).fill(b).join(' \\cdot ')}\\right)`, why: 'Exponents come before the negative sign in the order of operations.' },
          { text: 'Multiply, then apply the negative.', tex: `= ${v.toTex()}` },
        ],
  };
}

function evalD2(rng: Rng): PowItem {
  const kind = rng.pick(['product', 'quotient', 'power'] as const);
  const b = rng.pick([2, 2, 3, 3, 5, 10]);
  const limit = b === 2 ? 4 : b === 3 ? 3 : 2;
  const e = rng.int(-limit, limit);
  const v = Q(b).pow(e);
  if (kind === 'power') {
    // (b^m)^n with m*n = e; pick divisors
    const pairs: Array<[number, number]> = [];
    for (let m = -6; m <= 6; m++) for (let n = -4; n <= 4; n++) if (m !== 0 && n !== 0 && m * n === e && Math.abs(m) !== 1 && n !== 1 && (m < 0 || n < 0)) pairs.push([m, n]);
    if (pairs.length === 0) return evalD2(rng);
    const [m, n] = rng.pick(pairs);
    const tex = `\\left(${b}^{${m}}\\right)^{${n}}`;
    return {
      tex,
      value: v,
      mis: [
        { value: Math.abs(m + n) <= 6 ? Q(b).pow(m + n) : null, tag: 'exponent-rule', feedback: 'For a power of a power, multiply the exponents. Adding is for multiplying powers with the same base.' },
        { value: v.neg(), tag: 'exponent-rule', feedback: 'A negative exponent means a reciprocal, not a negative number.' },
      ],
      hints: [RULES_HINT, 'This is a power raised to a power.', `Multiply the exponents: $${m} \\cdot ${n < 0 ? `(${n})` : n}$.`, 'If the new exponent is negative, write one over the positive power.'],
      solution: [
        { text: 'Power of a power: multiply the exponents.', tex: `${tex} = ${b}^{${m} \\cdot ${n < 0 ? `(${n})` : n}} = ${b}^{${e}}`, why: n > 0 ? `$\\left(${b}^{${m}}\\right)^{${n}}$ is ${n} copies of $${b}^{${m}}$ multiplied together, so the exponent ${m} is counted ${n} times.` : `A negative outside exponent means the reciprocal of ${Math.abs(n) === 1 ? `$${b}^{${m}}$` : `${Math.abs(n)} copies of $${b}^{${m}}$`}, which multiplies the exponent ${m} by ${n}.` },
        { text: 'Evaluate.', tex: `${b}^{${e}} = ${v.toTex()}` },
      ],
    };
  }
  // product / quotient with at least one negative exponent
  let m = 0;
  let n = 0;
  for (let guard = 0; guard < 100; guard++) {
    m = rng.int(-6, 7);
    n = kind === 'product' ? e - m : m - e;
    if (m !== 0 && n !== 0 && (m < 0 || n < 0) && Math.abs(n) <= 7) break;
  }
  if (m === 0 || n === 0 || (m >= 0 && n >= 0)) return evalD2(rng);
  const pn = (k: number) => (k < 0 ? `(${k})` : `${k}`);
  if (kind === 'product') {
    const tex = `${b}^{${m}} \\cdot ${b}^{${n}}`;
    return {
      tex,
      value: v,
      mis: [
        { value: Math.abs(m * n) <= limit + 2 ? Q(b).pow(m * n) : null, tag: 'exponent-rule', feedback: 'When you multiply powers with the same base, add the exponents. Multiplying exponents is for a power of a power.' },
        { value: Q(b * b).pow(e), tag: 'exponent-rule', feedback: 'Keep the same base. Do not multiply the bases together.' },
        { value: v.neg(), tag: 'exponent-rule', feedback: 'A negative exponent means a reciprocal, not a negative number.' },
      ],
      hints: [RULES_HINT, 'The bases are the same and the powers are multiplied, so add the exponents.', `$${m} + ${pn(n)}$ is the new exponent.`, 'If the new exponent is negative, write one over the positive power.'],
      solution: [
        { text: 'Same base, multiplying: add the exponents.', tex: `${tex} = ${b}^{${m} + ${pn(n)}} = ${b}^{${e}}`, why: 'Each exponent counts factors of the base (a negative exponent counts factors in the denominator), so the counts add.' },
        { text: 'Evaluate.', tex: `${b}^{${e}} = ${v.toTex()}` },
      ],
    };
  }
  const tex = `\\frac{${b}^{${m}}}{${b}^{${n}}}`;
  return {
    tex,
    value: v,
    mis: [
      { value: Math.abs(m + n) <= limit + 2 ? Q(b).pow(m + n) : null, tag: 'exponent-rule', feedback: 'When you divide powers with the same base, subtract the exponents (top minus bottom).' },
      { value: Q(b).pow(n - m), tag: 'exponent-rule', feedback: 'Subtract in the right order: the top exponent minus the bottom exponent.' },
      { value: v.neg(), tag: 'exponent-rule', feedback: 'A negative exponent means a reciprocal, not a negative number.' },
    ],
    hints: [RULES_HINT, 'The bases are the same and the powers are divided, so subtract the exponents.', `Top exponent minus bottom exponent: $${m} - ${pn(n)}$.`, 'If the new exponent is negative, write one over the positive power.'],
    solution: [
      { text: 'Same base, dividing: subtract the exponents.', tex: `${tex} = ${b}^{${m} - ${pn(n)}} = ${b}^{${e}}`, why: 'Factors of the base on the bottom cancel factors on the top, so the exponents subtract.' },
      { text: 'Evaluate.', tex: `${b}^{${e}} = ${v.toTex()}` },
    ],
  };
}

function evalD3(rng: Rng): PowItem {
  const kind = rng.pick(['combo', 'combo', 'sum', 'zero-sum'] as const);
  if (kind === 'sum') {
    const b = rng.pick([2, 3, 4, 5]);
    const v = Q(1, b).add(Q(1, b * b));
    return {
      tex: `${b}^{-1} + ${b}^{-2}`,
      value: v,
      mis: [
        { value: Q(1, b * b * b), tag: 'exponent-rule', feedback: 'You can add exponents only when multiplying powers. Here the powers are added, so evaluate each one first.' },
        { value: Q(-b - b * b), tag: 'exponent-rule', feedback: 'A negative exponent means a reciprocal, not a negative number.' },
      ],
      hints: ['There is no exponent rule for adding powers. Evaluate each power separately.', `$${b}^{-1} = \\frac{1}{${b}}$.`, `$${b}^{-2} = \\frac{1}{${b * b}}$.`, `Add the fractions using the common denominator $${b * b}$.`],
      solution: [
        { text: 'Evaluate each power.', tex: `${b}^{-1} + ${b}^{-2} = \\frac{1}{${b}} + \\frac{1}{${b * b}}`, why: 'The exponent rules are for multiplying and dividing powers, not adding them.' },
        { text: 'Add with a common denominator.', tex: `\\frac{${b}}{${b * b}} + \\frac{1}{${b * b}} = ${v.toTex()}` },
      ],
    };
  }
  if (kind === 'zero-sum') {
    const c = rng.int(2, 12);
    const b = rng.pick([2, 3, 4, 5]);
    const n = b === 2 ? rng.int(1, 3) : rng.int(1, 2);
    const v = Q(1).add(Q(1).div(Q(b).pow(n)));
    return {
      tex: `${c}^{0} + ${b}^{-${n}}`,
      value: v,
      mis: [
        { value: Q(1).div(Q(b).pow(n)), tag: 'exponent-rule', feedback: `$${c}^{0}$ is not 0. Any nonzero number to the zero power is 1.` },
        { value: Q(1).sub(Q(b).pow(n)), tag: 'exponent-rule', feedback: 'A negative exponent means a reciprocal, not a negative number.' },
        { value: Q(c).add(Q(1).div(Q(b).pow(n))), tag: 'exponent-rule', feedback: `$${c}^{0}$ is 1, not ${c}.` },
      ],
      hints: ['Evaluate each power separately, then add.', `What is $${c}^{0}$?`, `$${b}^{-${n}} = \\frac{1}{${b}^{${n}}}$.`, 'Write the sum as one fraction.'],
      solution: [
        { text: 'Evaluate each power.', tex: `${c}^{0} + ${b}^{-${n}} = 1 + \\frac{1}{${Q(b).pow(n).toTex()}}`, why: 'Any nonzero number to the zero power is 1, and a negative exponent means a reciprocal.' },
        { text: 'Add.', tex: `= ${v.toTex()}` },
      ],
    };
  }
  // combo: (b^m * b^n)^k / b^j
  const b = rng.pick([2, 2, 3]);
  const limit = b === 2 ? 4 : 3;
  for (let guard = 0; guard < 200; guard++) {
    const m = rng.int(-3, 5);
    const n = rng.int(-4, 4);
    const k = rng.pick([2, 3, -1, -2]);
    const j = rng.int(-4, 6);
    const e = (m + n) * k - j;
    if (m === 0 || n === 0 || j === 0 || m + n === 0 || Math.abs(e) > limit) continue;
    if (!(m < 0 || n < 0 || k < 0 || j < 0)) continue;
    const pn = (x: number) => (x < 0 ? `(${x})` : `${x}`);
    const v = Q(b).pow(e);
    const tex = `\\frac{\\left(${b}^{${m}} \\cdot ${b}^{${n}}\\right)^{${k}}}{${b}^{${j}}}`;
    const s = m + n;
    return {
      tex,
      value: v,
      mis: [
        { value: Math.abs(s + k - j) <= 6 ? Q(b).pow(s + k - j) : null, tag: 'exponent-rule', feedback: 'For a power of a power, multiply the exponents; do not add.' },
        { value: Math.abs(s * k + j) <= 6 ? Q(b).pow(s * k + j) : null, tag: 'exponent-rule', feedback: 'When dividing, subtract the bottom exponent.' },
        { value: v.neg(), tag: 'exponent-rule', feedback: 'A negative exponent means a reciprocal, not a negative number.' },
      ],
      hints: [RULES_HINT, 'Work inside the parentheses first: add the exponents being multiplied.', `Then raise to the power ${k} by multiplying exponents, then subtract the bottom exponent ${j}.`, 'Evaluate the single power you end with.'],
      solution: [
        { text: 'Inside the parentheses, add the exponents.', tex: `${b}^{${m}} \\cdot ${b}^{${n}} = ${b}^{${s}}`, why: 'Same base, multiplying: add exponents.' },
        { text: 'Power of a power: multiply the exponents.', tex: `\\left(${b}^{${s}}\\right)^{${k}} = ${b}^{${s * k}}`, why: 'Same base raised to a power: multiply exponents.' },
        { text: 'Divide: subtract the exponents.', tex: `\\frac{${b}^{${s * k}}}{${b}^{${j}}} = ${b}^{${s * k} - ${pn(j)}} = ${b}^{${e}} = ${v.toTex()}` },
      ],
    };
  }
  return evalD2(rng);
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

export const genEvaluatePowers: GeneratorDef = {
  id: 'u5.evaluate-powers',
  skillId: 'S5.01',
  description: 'Evaluate numerical powers with zero and negative exponents and the product, quotient and power rules.',
  generate(rng, difficulty) {
    const it = difficulty === 1 ? evalD1(rng) : difficulty === 2 ? evalD2(rng) : evalD3(rng);
    return makeProblem({
      skillId: 'S5.01',
      tags: difficulty === 3 ? ['multi-step'] : [],
      prompt: [p('Evaluate. Write your answer as an integer or a fraction.'), { t: 'math', tex: it.tex }],
      answer: { kind: 'number', value: fracStr(it.value) },
      inputHint: 'Type an integer or a fraction, like -9 or 1/8.',
      hints: it.hints,
      solution: it.solution,
      misconceptions: numberMisconceptions(it.value, it.mis),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    const tex = mathBlocks(pr)[0];
    const v = texExact(tex);
    if (!v) return ['could not evaluate the printed expression'];
    return v.eq(Q(pr.answer.value)) ? [] : [`expected ${v.toString()}`];
  },
};

// ---------------------------------------------------------------------------
// S5.01: simplify monomial expressions
// ---------------------------------------------------------------------------

interface SimpItem {
  tex: string;
  result: Mono;
  wrong: Array<{ m: Mono; tag: MisconceptionTag; feedback: string }>;
  hints: Hints;
  solution: SolutionStep[];
}

const nzInt = (rng: Rng, lo: number, hi: number) => rng.nonzeroInt(lo, hi);

function simpD1(rng: Rng, v: string, w: string): SimpItem {
  const kind = rng.pick(['product', 'quotient', 'power', 'power', 'zero'] as const);
  const order = [v, w];
  if (kind === 'product') {
    const c1 = rng.pick([1, 2, 3, 4, 5]);
    const c2 = rng.pick([1, 2, 3, 4, 5]);
    const m = rng.int(2, 7);
    const n = rng.int(2, 7);
    const A = mono(c1, { [v]: m });
    const B = mono(c2, { [v]: n });
    const r = monoMul(A, B);
    const tex = `${monoRawTex(A, order)} \\cdot ${monoRawTex(B, order)}`;
    return {
      tex,
      result: r,
      wrong: [
        { m: mono(c1 * c2, { [v]: m * n }), tag: 'exponent-rule', feedback: 'When you multiply powers with the same base, add the exponents.' },
        { m: mono(c1 + c2, { [v]: m + n }), tag: 'exponent-rule', feedback: 'Multiply the coefficients; only the exponents are added.' },
      ],
      hints: ['Multiply the numbers, then combine the powers of the same variable.', `$${v}^{${m}}$ has ${m} factors of $${v}$ and $${v}^{${n}}$ has ${n}.`, 'Product rule: same base, multiplying, so add the exponents.', `Multiply $${c1} \\cdot ${c2}$ for the coefficient.`],
      solution: [
        { text: 'Group the numbers and the powers.', tex: `(${c1} \\cdot ${c2})(${v}^{${m}} \\cdot ${v}^{${n}})`, why: 'Multiplication can be done in any order.' },
        { text: 'Multiply the numbers and add the exponents.', tex: `${monoTex(r, order)}`, why: `There are ${m} + ${n} = ${m + n} factors of $${v}$ in all.` },
      ],
    };
  }
  if (kind === 'quotient') {
    const c2 = rng.pick([1, 2, 3, 4]);
    const q = rng.pick([1, 2, 3, 4, 5]);
    const c1 = c2 * q;
    const m = rng.int(5, 10);
    const n = rng.int(2, m - 1);
    const A = mono(c1, { [v]: m });
    const B = mono(c2, { [v]: n });
    const r = monoDiv(A, B);
    return {
      tex: `\\frac{${monoRawTex(A, order)}}{${monoRawTex(B, order)}}`,
      result: r,
      wrong: [
        { m: mono(q, { [v]: m + n }), tag: 'exponent-rule', feedback: 'When you divide powers with the same base, subtract the exponents.' },
        ...(m % n === 0 && m / n !== m - n ? [{ m: mono(q, { [v]: m / n }), tag: 'exponent-rule' as MisconceptionTag, feedback: 'Subtract the exponents; do not divide them.' }] : []),
      ],
      hints: ['Divide the numbers, then deal with the variable.', `${n} of the ${m} factors of $${v}$ cancel.`, 'Quotient rule: same base, dividing, so subtract the exponents (top minus bottom).', `$${c1} \\div ${c2}$ gives the coefficient.`],
      solution: [
        { text: 'Divide the coefficients.', tex: `\\frac{${c1}}{${c2}} = ${q}` },
        { text: 'Subtract the exponents.', tex: `\\frac{${v}^{${m}}}{${v}^{${n}}} = ${v}^{${m} - ${n}} = ${v}^{${m - n}}`, why: `Each factor of $${v}$ on the bottom cancels one on the top, leaving ${m - n}.` },
        { text: 'Put it together.', tex: monoTex(r, order) },
      ],
    };
  }
  if (kind === 'power') {
    const c = rng.pick([1, 2, 2, 3, 3, -2]);
    const m = rng.int(2, 5);
    let n = rng.int(2, 4);
    while (Math.abs(c) ** n > 81) n--;
    const A = mono(c, { [v]: m });
    const r = monoPow(A, n);
    const cTex = c < 0 ? `(${c})` : `${c}`;
    return {
      tex: `\\left(${monoRawTex(A, order)}\\right)^{${n}}`,
      result: r,
      wrong: [
        { m: mono(c, { [v]: m * n }), tag: 'exponent-rule', feedback: 'The power applies to every factor inside the parentheses, including the number.' },
        { m: mono(Q(c).pow(n), { [v]: m + n }), tag: 'exponent-rule', feedback: 'For a power of a power, multiply the exponents; do not add them.' },
        { m: mono(c * n, { [v]: m * n }), tag: 'exponent-rule', feedback: `Raising $${c}$ to the power ${n} means multiplying ${n} copies of it, not $${cTex} \\times ${n}$.` },
      ],
      hints: ['Raise every factor inside the parentheses to the power.', `$(${monoRawTex(A, order)})^{${n}}$ means ${n} copies of $${monoRawTex(A, order)}$ multiplied.`, `Power of a power: multiply the exponents, $${m} \\cdot ${n}$.`, `Do not forget $${cTex}^{${n}}$.`],
      solution: [
        { text: 'Apply the power to each factor.', tex: `${cTex}^{${n}} \\cdot (${v}^{${m}})^{${n}}`, why: `$(ab)^{n} = a^{n}b^{n}$ because each copy of the product contributes one $a$ and one $b$.` },
        { text: 'Evaluate the number and multiply the exponents.', tex: monoTex(r, order), why: `${n} copies of $${v}^{${m}}$ give ${m} \\cdot ${n} = ${m * n} factors of $${v}$.` },
      ],
    };
  }
  // zero exponent
  const c = rng.int(2, 9);
  const m = rng.int(2, 6);
  if (rng.bool()) {
    const A = mono(c, { [v]: m, [w]: 0 });
    const r = mono(c, { [v]: m });
    return {
      tex: `${c}${v}^{${m}}${w}^{0}`,
      result: r,
      wrong: [
        { m: mono(0, {}), tag: 'exponent-rule', feedback: `$${w}^{0}$ is 1, not 0, so the product is not 0.` },
        { m: mono(c, { [v]: m, [w]: 1 }), tag: 'exponent-rule', feedback: `$${w}^{0}$ is 1, not $${w}$.` },
      ],
      hints: ['What is any nonzero number to the zero power?', `$${w}^{0} = 1$ (assume $${w} \\neq 0$).`, 'Multiplying by 1 changes nothing.', 'Drop the factor that equals 1.'],
      solution: [
        { text: 'Any nonzero base to the zero power is 1.', tex: `${w}^{0} = 1`, why: `$\\frac{${w}^{k}}{${w}^{k}} = ${w}^{k-k} = ${w}^{0}$, and anything nonzero divided by itself is 1.` },
        { text: 'Multiply by 1.', tex: `${monoRawTex(A, order).replace(`${w}^{0}`, '')} \\cdot 1 = ${monoTex(r, order)}` },
      ],
    };
  }
  const n = rng.int(1, 5);
  const A = mono(c, { [v]: m, [w]: n });
  return {
    tex: `\\left(${monoRawTex(A, order)}\\right)^{0}`,
    result: mono(1, {}),
    wrong: [
      { m: mono(0, {}), tag: 'exponent-rule', feedback: 'A nonzero quantity to the zero power is 1, not 0.' },
      { m: mono(c, {}), tag: 'exponent-rule', feedback: 'The zero power applies to everything inside the parentheses, including the number.' },
    ],
    hints: ['The whole quantity in parentheses is the base.', 'What is any nonzero number to the zero power?', 'Assume the variables are not zero.', 'The answer is a single number.'],
    solution: [
      { text: 'The base is everything in the parentheses.', tex: `\\left(${monoRawTex(A, order)}\\right)^{0}`, why: 'The exponent 0 is outside the parentheses.' },
      { text: 'Any nonzero base to the zero power is 1.', tex: '= 1' },
    ],
  };
}

function randomExps(rng: Rng, v: string, w: string, lo: number, hi: number): Record<string, number> {
  return { [v]: nzInt(rng, lo, hi), [w]: nzInt(rng, lo, hi) };
}

function simpD2(rng: Rng, v: string, w: string): SimpItem {
  const order = [v, w];
  for (let guard = 0; guard < 200; guard++) {
    if (rng.bool()) {
      // quotient of two-variable monomials
      const c1 = rng.int(2, 12);
      const c2 = rng.int(2, 12);
      const A = mono(c1, { [v]: rng.int(1, 8), [w]: rng.int(1, 8) });
      const B = mono(c2, { [v]: rng.int(1, 8), [w]: rng.int(1, 8) });
      const r = monoDiv(A, B);
      const ev = Object.values(r.exps);
      if (!ev.some((e) => e < 0) || ev.every((e) => e === 0) || c1 === c2) continue;
      const swapped: Mono = { coef: r.coef, exps: Object.fromEntries(Object.entries(r.exps).map(([k, e]) => [k, -e])) };
      return {
        tex: `\\frac{${monoRawTex(A, order)}}{${monoRawTex(B, order)}}`,
        result: r,
        wrong: [
          { m: swapped, tag: 'exponent-rule', feedback: 'Subtract in the right order: the top exponent minus the bottom exponent. A negative result means the variable ends up in the denominator.' },
          { m: { coef: Q(c1 - c2), exps: r.exps }, tag: 'arithmetic-error', feedback: 'Divide the coefficients; do not subtract them.' },
        ],
        hints: ['Handle the numbers, then each variable separately.', `Simplify the coefficient $\\frac{${c1}}{${c2}}$ if you can.`, 'For each variable, subtract exponents: top minus bottom.', 'A negative exponent means that variable belongs in the denominator with a positive exponent.'],
        solution: [
          { text: r.coef.eq(Q(c1, 1).div(c2)) && gcd(c1, c2) === 1 ? 'The coefficient is already in lowest terms.' : 'Simplify the coefficient.', tex: gcd(c1, c2) === 1 ? `\\frac{${c1}}{${c2}}` : `\\frac{${c1}}{${c2}} = ${r.coef.toTex()}` },
          { text: 'Subtract exponents for each variable.', tex: order.map((x) => `${x}^{${A.exps[x]} - ${B.exps[x]}} = ${x}^{${r.exps[x]}}`).join(',\\quad '), why: 'Same base, dividing: subtract the exponents.' },
          { text: 'Write negative exponents as positive exponents in the denominator.', tex: monoTex(r, order), why: `$${v}^{-n} = \\frac{1}{${v}^{n}}$.` },
        ],
      };
    }
    const c1 = rng.pick([2, 3, 4, 5, -2, -3]);
    const c2 = rng.pick([2, 3, 4, 5, 6]);
    const A = mono(c1, randomExps(rng, v, w, -5, 7));
    const B = mono(c2, randomExps(rng, v, w, -5, 7));
    const neg = [...Object.values(A.exps), ...Object.values(B.exps)].filter((e) => e < 0).length;
    if (neg === 0) continue;
    const r = monoMul(A, B);
    const ev = Object.values(r.exps);
    if (ev.every((e) => e === 0) || ev.some((e) => Math.abs(e) > 10)) continue;
    const multiplied = mono(c1 * c2, Object.fromEntries(order.map((x) => [x, A.exps[x] * B.exps[x]])));
    return {
      tex: `\\left(${monoRawTex(A, order)}\\right)\\left(${monoRawTex(B, order)}\\right)`,
      result: r,
      wrong: [
        { m: multiplied, tag: 'exponent-rule', feedback: 'When you multiply powers with the same base, add the exponents; do not multiply them.' },
        { m: { coef: r.coef.neg(), exps: r.exps }, tag: 'sign-error', feedback: 'Check the sign of the coefficient.' },
      ],
      hints: ['Multiply the coefficients, then combine each variable separately.', 'Product rule: add the exponents of the same base.', 'Watch the signs when adding a negative exponent.', 'Rewrite any negative exponent as a positive exponent in the denominator.'],
      solution: [
        { text: 'Multiply the coefficients.', tex: `${c1 < 0 ? `(${c1})` : c1} \\cdot ${c2} = ${c1 * c2}` },
        { text: 'Add exponents for each variable.', tex: order.map((x) => `${x}^{${A.exps[x]} + ${B.exps[x] < 0 ? `(${B.exps[x]})` : B.exps[x]}} = ${x}^{${r.exps[x]}}`).join(',\\quad '), why: 'Same base, multiplying: add the exponents.' },
        { text: 'Use positive exponents only.', tex: monoTex(r, order), why: 'A factor with a negative exponent moves to the denominator with a positive exponent.' },
      ],
    };
  }
  return simpD1(rng, v, w);
}

function simpD3(rng: Rng, v: string, w: string): SimpItem {
  const order = [v, w];
  const kind = rng.pick(['quotient', 'negpow', 'fracpow'] as const);
  for (let guard = 0; guard < 200; guard++) {
    if (kind === 'quotient') {
      const c = rng.pick([1, 2, 3]);
      const n = rng.pick([2, 3]);
      const A = mono(c, randomExps(rng, v, w, -3, 4));
      if (!Object.values(A.exps).some((e) => e < 0)) continue;
      const d = rng.pick([1, 2, 3, 4, 6, 8]);
      const B = mono(d, { [v]: rng.int(1, 4), [w]: rng.int(1, 4) });
      const r = monoDiv(monoPow(A, n), B);
      if (Object.values(r.exps).every((e) => e === 0) || r.coef.den > 27n || r.coef.num > 27n) continue;
      const P = monoPow(A, n);
      const noCoef = monoDiv({ coef: A.coef, exps: P.exps }, B);
      const added = monoDiv({ coef: P.coef, exps: Object.fromEntries(order.map((x) => [x, A.exps[x] + n])) }, B);
      return {
        tex: `\\frac{\\left(${monoRawTex(A, order)}\\right)^{${n}}}{${monoRawTex(B, order)}}`,
        result: r,
        wrong: [
          { m: noCoef, tag: 'exponent-rule', feedback: 'Raise the coefficient to the power too.' },
          { m: added, tag: 'exponent-rule', feedback: 'For a power of a power, multiply the exponents; do not add them.' },
        ],
        hints: ['Start with the parentheses: raise every factor to the power.', 'Multiply each exponent inside by the outside exponent.', 'Then divide: subtract exponents for each variable and reduce the numbers.', 'Finish with positive exponents only.'],
        solution: [
          { text: 'Apply the power to every factor.', tex: `\\left(${monoRawTex(A, order)}\\right)^{${n}} = ${monoRawTex(P, order)}`, why: 'Power of a product: each factor is raised to the power; power of a power: multiply exponents.' },
          { text: 'Divide: subtract exponents and reduce the coefficient.', tex: `\\frac{${monoRawTex(P, order)}}{${monoRawTex(B, order)}} = ${monoRawTex(r, order)}`, why: 'Same base, dividing: subtract the exponents.' },
          { text: 'Write with positive exponents.', tex: monoTex(r, order) },
        ],
      };
    }
    if (kind === 'negpow') {
      const c = rng.pick([1, 1, 2, 3]);
      const n = rng.pick([1, 2, 2, 3]);
      if (c === 3 && n === 3) continue;
      const A = mono(c, randomExps(rng, v, w, -4, 4));
      if (!Object.values(A.exps).some((e) => e < 0) && n === 1) continue;
      const r = monoPow(A, -n);
      const added = { coef: A.coef.pow(-n), exps: Object.fromEntries(order.map((x) => [x, A.exps[x] - n])) };
      const noRecip = { coef: A.coef.pow(n).neg(), exps: r.exps };
      return {
        tex: `\\left(${monoRawTex(A, order)}\\right)^{-${n}}`,
        result: r,
        wrong: [
          { m: added, tag: 'exponent-rule', feedback: 'For a power of a power, multiply the exponents; do not add them.' },
          { m: noRecip, tag: 'exponent-rule', feedback: 'A negative exponent means a reciprocal, not a negative number.' },
          ...(c !== 1 ? [{ m: { coef: A.coef, exps: r.exps }, tag: 'exponent-rule' as MisconceptionTag, feedback: 'The outside exponent applies to the coefficient too.' }] : []),
        ],
        hints: ['Multiply every exponent inside the parentheses by the outside exponent.', `Every exponent gets multiplied by $-${n}$, which changes its sign.`, c === 1 ? 'There is no number in front to raise, so only the variables change.' : `The coefficient becomes $${c}^{-${n}}$, which is a fraction.`, 'Finish with positive exponents only.'],
        solution: [
          { text: 'Power of a product, power of a power.', tex: `\\left(${monoRawTex(A, order)}\\right)^{-${n}} = ${c === 1 ? '' : `${c}^{-${n}}`}${order.map((x) => `${x}^{${A.exps[x] * -n}}`).join('')}`, why: 'Each factor is raised to the power, and powers of powers multiply.' },
          { text: 'Write with positive exponents.', tex: monoTex(r, order), why: 'A factor with a negative exponent moves across the fraction bar with a positive exponent.' },
        ],
      };
    }
    // (c v^a / w^b)^-2
    const c = rng.pick([1, 2, 3, 4]);
    const a = rng.int(1, 4);
    const b = rng.int(1, 4);
    const n = rng.pick([2, 2, 3]);
    if (c ** n > 64) continue;
    const inner = mono(c, { [v]: a, [w]: -b });
    const r = monoPow(inner, -n);
    const vp = (x: string, e: number) => (e === 1 ? x : `${x}^{${e}}`);
    const topTex = `${c === 1 ? '' : c}${vp(v, a)}`;
    return {
      tex: `\\left(\\frac{${topTex}}{${vp(w, b)}}\\right)^{-${n}}`,
      result: r,
      wrong: [
        { m: monoPow(inner, n), tag: 'exponent-rule', feedback: 'A negative exponent means take the reciprocal: flip the fraction.' },
        ...(c !== 1 ? [{ m: { coef: Q(c).pow(-1), exps: r.exps }, tag: 'exponent-rule' as MisconceptionTag, feedback: 'Raise the coefficient to the power too.' }] : []),
      ],
      hints: ['A negative exponent on a fraction: flip the fraction and make the exponent positive.', `$\\left(\\frac{A}{B}\\right)^{-${n}} = \\left(\\frac{B}{A}\\right)^{${n}}$.`, 'Raise every factor, top and bottom, to the power.', 'Multiply the exponents.'],
      solution: [
        { text: 'Flip the fraction to make the exponent positive.', tex: `\\left(\\frac{${vp(w, b)}}{${topTex}}\\right)^{${n}}`, why: 'A negative exponent means the reciprocal.' },
        { text: 'Raise each factor to the power.', tex: monoTex(r, order), why: 'Power of a quotient and power of a power: multiply each exponent by the outside exponent.' },
      ],
    };
  }
  return simpD2(rng, v, w);
}

export const genSimplifyExponents: GeneratorDef = {
  id: 'u5.simplify-exponents',
  skillId: 'S5.01',
  description: 'Simplify monomial expressions with the product, quotient, power, zero and negative exponent rules.',
  generate(rng, difficulty) {
    const [v, w] = rng.pick(VAR_SETS);
    const order = [v, w];
    const it = difficulty === 1 ? simpD1(rng, v, w) : difficulty === 2 ? simpD2(rng, v, w) : simpD3(rng, v, w);
    const key = monoPlain(it.result, order);
    const keyNode = parseExpression(key);
    const mis: Misconception[] = [];
    for (const x of it.wrong) {
      const s = monoPlain(x.m, order);
      const n = parseExpression(s);
      if (expressionsEquivalent(n, keyNode) || mis.some((m) => expressionsEquivalent(parseExpression(m.answer), n))) continue;
      mis.push({ answer: s, tag: x.tag, feedback: x.feedback });
    }
    return makeProblem({
      skillId: 'S5.01',
      tags: difficulty === 3 ? ['multi-step'] : [],
      prompt: [p(`Simplify. Use only positive exponents. Assume no variable equals $0$.`), { t: 'math', tex: it.tex }],
      answer: { kind: 'expression', value: key, form: 'exponent-simplified', variables: order },
      inputHint: `Type exponents with ^ and fractions with /, like 3${v}^4/${w}^2 or 2${v}^5/(9${w}^3).`,
      hints: it.hints,
      solution: it.solution,
      misconceptions: mis,
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'expression') return ['unexpected kind'];
    const given = parseExpression(texToParser(mathBlocks(pr)[0]));
    const key = parseExpression(pr.answer.value);
    const errs: string[] = [];
    if (!expressionsEquivalent(given, key)) errs.push('key is not equivalent to the printed expression');
    const s = isExponentSimplified(key);
    if (!s.ok) errs.push(`key is not simplified: ${s.reason}`);
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S5.04: solve exponential equations with a common base
// ---------------------------------------------------------------------------

const MAXPOW: Record<number, number> = { 2: 7, 3: 5, 5: 4, 6: 3, 7: 3, 10: 4 };

/** "2x - 1", "x + 3", "x" as TeX for p*x + q. */
function linExp(pc: number, q: number, v = 'x'): string {
  const head = pc === 1 ? v : pc === -1 ? `-${v}` : `${pc}${v}`;
  return q === 0 ? head : `${head} ${q < 0 ? '-' : '+'} ${Math.abs(q)}`;
}
const linPlainExp = (pc: number, q: number) => linExp(pc, q);

function valueTex(r: Rational): string {
  return r.isInteger() ? r.toTex() : r.toTex();
}

export const genSolveExponential: GeneratorDef = {
  id: 'u5.solve-exponential',
  skillId: 'S5.04',
  description: 'Solve exponential equations by rewriting both sides as powers of a common base.',
  generate(rng, difficulty) {
    let tex = '';
    let x0 = Q(0);
    let hints: Hints;
    let solution: SolutionStep[];
    let mis: Mis[] = [];
    let steps: ProblemStep[] | undefined;
    if (difficulty === 1) {
      const g = rng.pick([2, 2, 3, 3, 5, 10, 6, 7]);
      const max = MAXPOW[g];
      let pc = 1;
      let q = 0;
      let x = 0;
      let n = 0;
      for (let guard = 0; guard < 200; guard++) {
        pc = rng.pick([1, 1, 2, 3]);
        q = rng.int(-3, 3);
        x = rng.int(-1, 5);
        n = pc * x + q;
        if (n >= 2 && n <= max && !(pc === 1 && q === 0 && x === n && rng.bool() && false)) break;
      }
      if (n < 2 || n > max) {
        pc = 1;
        q = 0;
        n = 2;
        x = 2;
      }
      const value = Q(g).pow(n);
      tex = `${g}^{${linExp(pc, q)}} = ${value.toTex()}`;
      x0 = Q(x);
      mis = [
        { value: pc === 1 && q === 0 ? null : Q(n), tag: 'inverse-operation', feedback: `That is the value of the whole exponent, $${linExp(pc, q)}$. Now solve for $x$.` },
        { value: value.div(g), tag: 'exponent-rule', feedback: `Dividing $${value.toTex()}$ by $${g}$ does not undo an exponent. Write $${value.toTex()}$ as a power of $${g}$.` },
      ];
      hints = [`Write $${value.toTex()}$ as a power of $${g}$.`, `Count how many factors of $${g}$ multiply to $${value.toTex()}$.`, 'When the bases are the same, the exponents must be equal.', `Set $${linExp(pc, q)}$ equal to the exponent you found, and solve.`];
      solution = [
        { text: `Write the right side as a power of ${g}.`, tex: `${value.toTex()} = ${g}^{${n}}`, why: `$${Array(n).fill(g).join(' \\cdot ')} = ${value.toTex()}$.` },
        { text: 'Same base, so set the exponents equal.', tex: `${linExp(pc, q)} = ${n}`, why: `Different exponents would give different powers of ${g}, so equal powers need equal exponents.` },
        ...(pc === 1 && q === 0 ? [] : [{ text: 'Solve.', tex: `x = ${x}` }]),
        { text: 'Check by substituting.', tex: `${g}^{${linExp(pc, q).replace('x', `(${x})`)}} = ${g}^{${n}} = ${value.toTex()}`, why: 'The solution makes both sides equal.' },
      ];
    } else if (difficulty === 2) {
      const g = rng.pick([2, 2, 3, 5]);
      const us = g === 2 ? [2, 3, 4] : g === 3 ? [2, 3] : [2];
      const u = rng.pick(us);
      const B = g ** u;
      const max = MAXPOW[g];
      let n = 0;
      for (let guard = 0; guard < 100; guard++) {
        n = rng.nonzeroInt(-max + 2, max);
        if (n !== u && (n % u !== 0 || rng.int(0, 3) === 0)) break;
      }
      let q = rng.pick([0, 0, 1, -1, 2]);
      if (Q(n, u).sub(q).den > 3n || Q(n, u).sub(q).abs().gt(6)) q = 0;
      if (Q(n, u).den > 3n) n = u + (n > 0 ? 1 : -1) * (u === 2 ? 1 : u - 1);
      const R = Q(g).pow(n);
      x0 = Q(n, u).sub(q);
      tex = `${B}^{${linExp(1, q)}} = ${valueTex(R)}`;
      const inside = q === 0 ? 'x' : `(${linExp(1, q)})`;
      mis = [
        { value: R.isInteger() && R.num % BigInt(B) === 0n ? R.div(B).sub(q) : null, tag: 'exponent-rule', feedback: `Dividing by $${B}$ does not undo the exponent. Write both sides as powers of $${g}$.` },
        { value: Q(n).sub(q), tag: 'exponent-rule', feedback: `$${B}$ is $${g}^{${u}}$, so the left side is $${g}^{${u}${inside}}$. Multiply the exponent by ${u}.` },
        { value: Q(n * u).sub(q), tag: 'exponent-rule', feedback: `Set the exponents equal, then divide by ${u}; do not multiply.` },
      ];
      hints = [`Both $${B}$ and $${valueTex(R)}$ are powers of $${g}$.`, `$${B}$ is $${g}^{${u}}$, and $${valueTex(R)}$ is $${g}^{${n}}$.`, `The left side becomes $\\left(${g}^{${u}}\\right)^{${linExp(1, q)}}$, which is $${g}^{${u}${inside}}$.`, `Set the two exponents equal to each other and solve for $x$.`];
      solution = [
        { text: `Write both sides as powers of ${g}.`, tex: `\\left(${g}^{${u}}\\right)^{${linExp(1, q)}} = ${g}^{${n}}`, why: `$${B} = ${g}^{${u}}$${n < 0 ? `, and a negative exponent gives the fraction $${R.toTex()}$` : ''}.` },
        { text: 'Power of a power: multiply the exponents.', tex: `${g}^{${u}${inside}} = ${g}^{${n}}` },
        { text: 'Same base, so set the exponents equal and solve.', tex: `${u}${inside} = ${n} \\Rightarrow x = ${x0.toTex()}`, why: 'Equal powers of the same base (not 0, 1 or negative) have equal exponents.' },
      ];
      steps = [
        { prompt: [p(`Write $${B}$ as a power of $${g}$. What is the exponent?`)], answer: { kind: 'number', value: String(u) }, hints: [`Multiply $${g}$ by itself until you reach $${B}$.`, `Count the factors of $${g}$.`, `$${g} \\cdot ${g} = ${g * g}$.`, 'The exponent is the number of factors.'], explanation: `$${B} = ${g}^{${u}}$.` },
        { prompt: [p(`Now solve $${tex}$ for $x$.`)], answer: { kind: 'number', value: numStr(x0) }, hints: hints.slice(1) as unknown as Hints, explanation: `$x = ${x0.toTex()}$.` },
      ];
      (steps[1].hints as string[]).push('Solve the linear equation for $x$.');
    } else {
      const kind = rng.pick(['two', 'two', 'frac', 'coef'] as const);
      if (kind === 'two') {
        const g = rng.pick([2, 2, 3]);
        let u = 2;
        let w = 3;
        let q1 = 1;
        let q2 = -1;
        for (let guard = 0; guard < 200; guard++) {
          [u, w] = rng.pick(g === 2 ? [[1, 2], [2, 3], [1, 3], [2, 1], [3, 2], [2, 5], [3, 4], [4, 3]] : [[1, 2], [2, 1], [1, 3], [2, 3], [3, 2]]);
          q1 = rng.int(-3, 3);
          q2 = rng.int(-3, 3);
          const xx = Q(w * q2 - u * q1, u - w);
          if (q1 !== 0 || q2 !== 0) {
            if (xx.den <= 2n && xx.abs().le(6)) break;
          }
        }
        const B1 = g ** u;
        const B2 = g ** w;
        x0 = Q(w * q2 - u * q1, u - w);
        tex = `${B1}^{${linExp(1, q1)}} = ${B2}^{${linExp(1, q2)}}`;
        const scaled = (k: number, q: number) => (k === 1 ? linExp(1, q) : q === 0 ? `${k}x` : `${k}(${linExp(1, q)})`);
        const ex1 = scaled(u, q1);
        const ex2 = scaled(w, q2);
        const eqPlain = `${ex1} = ${ex2}`;
        mis = [
          { value: Q(w * q2 - u * q1, w - u), tag: 'sign-error', feedback: 'Check the signs when you collect the $x$-terms on one side.' },
          { value: Q(w * q2 - q1, u - w), tag: 'distribution', feedback: 'Multiply the whole exponent by the new power: distribute to both terms in the parentheses.' },
        ];
        hints = [`Write $${B1}$ and $${B2}$ as powers of the same base, $${g}$.`, `$${B1}$ is $${g}^{${u}}$, and $${B2}$ is $${g}^{${w}}$.`, 'Power of a power: multiply each outside exponent by the inside exponent.', 'Set the two exponents equal to each other, then distribute and solve.'];
        solution = [
          { text: `Write both bases as powers of ${g}.`, tex: `\\left(${g}^{${u}}\\right)^{${linExp(1, q1)}} = \\left(${g}^{${w}}\\right)^{${linExp(1, q2)}}`, why: `$${B1} = ${g}^{${u}}$ and $${B2} = ${g}^{${w}}$.` },
          { text: 'Multiply the exponents.', tex: `${g}^{${ex1}} = ${g}^{${ex2}}`, why: 'Power of a power.' },
          { text: 'Same base, so the exponents are equal.', tex: eqPlain.replace(/\(/g, '\\left(').replace(/\)/g, '\\right)'), why: 'Equal powers of the same base have equal exponents.' },
          { text: 'Distribute and solve.', tex: `x = ${x0.toTex()}` },
        ];
        steps = [
          { prompt: [p(`Rewrite both sides of $${tex}$ as powers of $${g}$ and set the exponents equal. Type the equation you get (in $x$).`)], answer: { kind: 'equation', value: eqPlain }, inputHint: `Type an equation like 2(x + 1) = 3(x - 1).`, hints: [hints[0], hints[1], 'Power of a power: multiply the exponents.', 'Write "left exponent = right exponent".'], explanation: `$${eqPlain.replace(/\(/g, '\\left(').replace(/\)/g, '\\right)')}$.` },
          { prompt: [p('Solve that equation for $x$.')], answer: { kind: 'number', value: numStr(x0) }, hints: ['Distribute on both sides.', 'Collect the $x$-terms on one side.', 'Collect the numbers on the other side.', 'Divide by the coefficient of $x$.'], explanation: `$x = ${x0.toTex()}$.` },
        ];
      } else if (kind === 'frac') {
        const g = rng.pick([2, 2, 3, 5]);
        const u = g === 2 ? rng.pick([1, 2, 3]) : g === 3 ? rng.pick([1, 2]) : 1;
        const max = MAXPOW[g];
        let n = rng.nonzeroInt(-3, max);
        if (n === -u) n = max;
        const R = Q(g).pow(n);
        x0 = Q(-n, u);
        tex = `\\left(\\frac{1}{${g ** u}}\\right)^{x} = ${R.toTex()}`;
        mis = [
          { value: Q(n, u), tag: 'sign-error', feedback: `$\\frac{1}{${g ** u}}$ is $${g}^{-${u}}$. The exponent is negative, so check the sign of $x$.` },
          { value: Q(-n), tag: 'exponent-rule', feedback: `$\\frac{1}{${g ** u}}$ is $${g}^{-${u}}$; remember to divide by ${u}.` },
        ];
        hints = [`Write $\\frac{1}{${g ** u}}$ as a power of $${g}$ with a negative exponent.`, `$\\frac{1}{${g ** u}}$ is $${g}^{-${u}}$, and $${R.toTex()}$ is $${g}^{${n}}$.`, 'Multiply the exponents on the left side.', 'Set the exponents equal and solve for $x$.'];
        solution = [
          { text: `Write both sides as powers of ${g}.`, tex: `\\left(${g}^{-${u}}\\right)^{x} = ${g}^{${n}}`, why: 'A reciprocal is a negative exponent.' },
          { text: 'Multiply exponents and set them equal.', tex: `-${u === 1 ? '' : u}x = ${n}`, why: 'Same base, so equal exponents.' },
          { text: 'Solve.', tex: `x = ${x0.toTex()}` },
        ];
      } else {
        const g = rng.pick([2, 3, 5]);
        const k = rng.int(2, 7);
        const q = rng.int(-2, 2);
        const n = rng.int(2, Math.min(MAXPOW[g], g === 2 ? 6 : 4));
        const right = Q(g).pow(n).mul(k);
        x0 = Q(n - q);
        tex = `${k} \\cdot ${g}^{${linExp(1, q)}} = ${right.toTex()}`;
        mis = [
          { value: q === 0 ? null : Q(n), tag: 'inverse-operation', feedback: `That is the exponent $${linExp(1, q)}$. Now solve for $x$.` },
          { value: right.div(k * g).sub(q), tag: 'exponent-rule', feedback: `After dividing by ${k}, write the result as a power of $${g}$; do not divide by $${g}$.` },
        ];
        hints = [`Undo the multiplication by ${k} first.`, `Divide both sides by ${k}. The right side becomes $${Q(g).pow(n).toTex()}$.`, `Write $${Q(g).pow(n).toTex()}$ as a power of $${g}$.`, 'Set the exponents equal and solve.'];
        solution = [
          { text: `Divide both sides by ${k}.`, tex: `${g}^{${linExp(1, q)}} = ${Q(g).pow(n).toTex()}`, why: `The ${k} multiplies the power; it is not part of the base. Do not multiply ${k} and ${g}.` },
          { text: `Write the right side as a power of ${g}.`, tex: `${g}^{${linExp(1, q)}} = ${g}^{${n}}` },
          { text: q === 0 ? 'Set the exponents equal.' : 'Set the exponents equal and solve.', tex: q === 0 ? `x = ${n}` : `${linExp(1, q)} = ${n} \\Rightarrow x = ${x0.toTex()}` },
        ];
      }
    }
    void linPlainExp;
    return makeProblem({
      skillId: 'S5.04',
      tags: difficulty === 3 ? ['multi-step'] : [],
      prompt: [p('Solve for $x$.'), { t: 'math', tex }],
      answer: { kind: 'number', value: numStr(x0) },
      inputHint: 'Type an integer or a fraction, like 5 or 3/2.',
      hints: hints!,
      solution: solution!,
      misconceptions: numberMisconceptions(x0, mis),
      ...(steps ? { steps } : {}),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    const [l, r] = mathBlocks(pr)[0].split(' = ');
    const L = parseExpression(texToParser(l));
    const R = parseExpression(texToParser(r));
    const x = Q(pr.answer.value).toNumber();
    const f = (t: number) => evalNumeric(L, { x: t }) - evalNumeric(R, { x: t });
    const scale = Math.max(1, Math.abs(evalNumeric(R, { x })));
    const errs: string[] = [];
    if (Math.abs(f(x)) > 1e-9 * scale) errs.push(`x = ${pr.answer.value} does not satisfy the equation`);
    // a single solution: the difference changes sign across the key and nowhere else nearby
    const rel = (t: number) => Math.abs(f(t)) / Math.max(Math.abs(evalNumeric(L, { x: t })), Math.abs(evalNumeric(R, { x: t })), 1e-300);
    for (const d of [0.25, 1, 3]) if (rel(x + d) < 1e-9 || rel(x - d) < 1e-9) errs.push('another solution nearby');
    if (Math.sign(f(x + 0.25)) === Math.sign(f(x - 0.25))) errs.push('not a crossing');
    return errs;
  },
};

export const U5_EXPONENT_GENERATORS: GeneratorDef[] = [genEvaluatePowers, genSimplifyExponents, genSolveExponential];
