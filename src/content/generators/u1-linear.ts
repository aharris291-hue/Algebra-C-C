/**
 * Unit 1, Lessons 4-5 generators: writing linear functions, forms of linear equations,
 * intercepts and key features.
 * S1.07 write linear functions, S1.08 convert forms, S1.09 intercepts, S1.10 key features.
 */
import type { GeneratorDef, Rng, Difficulty } from '../../core/curriculum/types';
import type { Misconception } from '../../core/math/answers';
import { parseRelation, equationsEquivalent, parseInterval } from '../../core/math/answers';
import { Rational } from '../../core/math/rational';
import { linearTex, linearPlain, decTex, polyTex } from '../../core/math/format';
import { Poly, toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { Q, p, math, makeProblem, numStr, sub, makeChoice, choiceLabel, texToExpr } from './util';
import { buildContext, DECREASING_KEYS } from './u1-contexts';

/** "y = mx + b" in parser syntax */
const yEq = (m: Rational, b: Rational) => `y = ${linearPlain(m, b)}`;
const yEqTex = (m: Rational, b: Rational) => `y = ${linearTex(m, b)}`;

/** Slope and intercept of a relation that defines a non-vertical line. */
function lineOf(src: string): { m: Rational; b: Rational } | null {
  const r = parseRelation(src);
  const poly = toPoly(r.lhs).sub(toPoly(r.rhs)); // poly = 0
  const cy = poly.coeff('y', 1);
  if (cy.isZero()) return null;
  const cx = poly.coeff('x', 1);
  const c0 = poly.evaluate({ x: Q(0), y: Q(0) });
  return { m: cx.neg().div(cy), b: c0.neg().div(cy) };
}

/** Misconception equations, dropping any that equal the key or each other. */
function lineMisconceptions(key: { m: Rational; b: Rational }, list: Array<{ m: Rational; b: Rational; tag: Misconception['tag']; feedback: string }>): Misconception[] {
  const seen = [key];
  const out: Misconception[] = [];
  for (const l of list) {
    if (seen.some((s) => s.m.eq(l.m) && s.b.eq(l.b))) continue;
    seen.push(l);
    out.push({ answer: yEq(l.m, l.b), tag: l.tag, feedback: l.feedback });
  }
  return out;
}

function pickSlope(rng: Rng, d: Difficulty): Rational {
  if (d === 1) return Q(rng.int(1, 6));
  if (d === 2) return Q(rng.nonzeroInt(-6, 6));
  const den = rng.pick([2, 3, 4]);
  let num = rng.nonzeroInt(-5, 5);
  while (num % den === 0) num = rng.nonzeroInt(-5, 5);
  return Q(num, den);
}

const SI_HINT = 'Type an equation like y = 2x - 5.';

// ---------------------------------------------------------------------------
// S1.07: slope and a point -> y = mx + b
// ---------------------------------------------------------------------------

export const genWriteSlopePoint: GeneratorDef = {
  id: 'u1.write-slope-point',
  skillId: 'S1.07',
  description: 'Write y = mx + b for the line with a given slope through a given point.',
  generate(rng, difficulty) {
    const m = pickSlope(rng, difficulty);
    const den = Number(m.den);
    const x1 = Q(den * (difficulty === 1 ? rng.int(1, 4) : rng.nonzeroInt(-4, 4)));
    const b = Q(rng.int(-9, 9));
    const y1 = m.mul(x1).add(b);
    const mx1 = m.mul(x1);
    return makeProblem({
      skillId: 'S1.07',
      tags: [],
      prompt: [p(`Write the equation, in slope-intercept form, of the line with slope $${m.toTex()}$ that passes through $(${x1.toTex()}, ${y1.toTex()})$.`)],
      answer: { kind: 'equation', value: yEq(m, b), form: 'slope-intercept' },
      inputHint: SI_HINT,
      hints: [
        'Slope-intercept form is $y = mx + b$. You know $m$, so you only need $b$.',
        `Substitute the slope and the point into $y = mx + b$: use $x = ${x1.toTex()}$ and $y = ${y1.toTex()}$.`,
        `$${y1.toTex()} = ${m.toTex()}\\cdot${sub(x1)} + b$. Multiply first.`,
        `$${m.toTex()}\\cdot${sub(x1)}$ is $${mx1.toTex()}$. Solve for $b$, then write the equation using $m$ and $b$.`,
      ],
      solution: [
        { text: 'Start with slope-intercept form and the slope.', tex: `y = ${linearTex(m, 0)} + b`, why: 'The slope is given, so only the $y$-intercept $b$ is unknown.' },
        { text: 'Substitute the point.', tex: `${y1.toTex()} = ${m.toTex()}\\cdot${sub(x1)} + b`, why: 'Every point on the line makes the equation true.' },
        { text: 'Solve for $b$.', tex: `${y1.toTex()} = ${mx1.toTex()} + b \\;\\Rightarrow\\; b = ${b.toTex()}`, why: `Subtract $${mx1.toTex()}$ from both sides.` },
        { text: 'Write the equation.', tex: yEqTex(m, b) },
      ],
      misconceptions: lineMisconceptions(
        { m, b },
        [
          { m, b: y1, tag: 'equation-setup', feedback: 'The point is not the $y$-intercept unless its $x$-coordinate is 0. Substitute the point to find $b$.' },
          { m, b: y1.add(mx1), tag: 'sign-error', feedback: `To find $b$, subtract $${mx1.toTex()}$ from both sides. Check your signs.` },
          { m: m.isZero() ? m : Q(1).div(m), b, tag: 'slope-reciprocal', feedback: 'Use the slope exactly as given.' },
        ],
      ),
      steps: [
        {
          prompt: [p(`Substitute $x = ${x1.toTex()}$, $y = ${y1.toTex()}$ and $m = ${m.toTex()}$ into $y = mx + b$. What is $b$?`)],
          answer: { kind: 'number', value: numStr(b) },
          hints: [
            `The equation becomes $${y1.toTex()} = ${m.toTex()}\\cdot${sub(x1)} + b$.`,
            `Multiply: $${m.toTex()}\\cdot${sub(x1)}$.`,
            `Then subtract that product from $${y1.toTex()}$.`,
            'Be careful subtracting a negative: it is the same as adding.',
          ],
          misconceptions: [
            ...(y1.add(mx1).eq(b) ? [] : [{ answer: numStr(y1.add(mx1)), tag: 'sign-error' as const, feedback: 'Subtract the product from both sides, do not add it.' }]),
          ],
          explanation: `$b = ${b.toTex()}$.`,
        },
        {
          prompt: [p(`Now write the equation of the line with $m = ${m.toTex()}$ and $b = ${b.toTex()}$.`)],
          answer: { kind: 'equation', value: yEq(m, b), form: 'slope-intercept' },
          inputHint: SI_HINT,
          hints: ['Use $y = mx + b$.', 'Put the slope in front of $x$.', 'Put $b$ at the end.', 'If $b$ is negative, write "minus".'],
          explanation: `$${yEqTex(m, b)}$.`,
        },
      ],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'equation') return ['wrong kind'];
    const text = (pr.prompt[0] as { text: string }).text;
    const mm = /slope \$(.+?)\$ that passes through \$\((.+?), (.+?)\)\$/.exec(text);
    if (!mm) return ['cannot parse'];
    const line = lineOf(pr.answer.value);
    if (!line) return ['vertical'];
    const m = toPoly(parseExpression(texToExpr(mm[1]))).constantValue();
    const x = toPoly(parseExpression(texToExpr(mm[2]))).constantValue();
    const y = toPoly(parseExpression(texToExpr(mm[3]))).constantValue();
    const errs: string[] = [];
    if (!line.m.eq(m)) errs.push('slope mismatch');
    if (!line.m.mul(x).add(line.b).eq(y)) errs.push('point not on line');
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S1.07: two points -> y = mx + b
// ---------------------------------------------------------------------------

export const genWriteTwoPoints: GeneratorDef = {
  id: 'u1.write-two-points',
  skillId: 'S1.07',
  description: 'Write y = mx + b for the line through two points.',
  generate(rng, difficulty) {
    const m = pickSlope(rng, difficulty);
    const den = Number(m.den);
    const b = Q(rng.int(-8, 8));
    let k1 = difficulty === 1 ? rng.int(0, 3) : rng.int(-4, 3);
    let k2 = k1 + rng.int(1, 3);
    if (difficulty !== 1 && rng.bool()) [k1, k2] = [k2, k1];
    const [x1, x2] = [Q(k1 * den), Q(k2 * den)];
    const [y1, y2] = [m.mul(x1).add(b), m.mul(x2).add(b)];
    const dy = y2.sub(y1);
    const dx = x2.sub(x1);
    return makeProblem({
      skillId: 'S1.07',
      tags: ['multi-step'],
      prompt: [p(`Write the equation, in slope-intercept form, of the line through $(${x1.toTex()}, ${y1.toTex()})$ and $(${x2.toTex()}, ${y2.toTex()})$.`)],
      answer: { kind: 'equation', value: yEq(m, b), form: 'slope-intercept' },
      inputHint: SI_HINT,
      hints: [
        'You need two things: the slope $m$ and the $y$-intercept $b$.',
        'Find the slope first: $m = \\dfrac{y_2 - y_1}{x_2 - x_1}$.',
        `The slope is $\\dfrac{${y2.toTex()} - ${sub(y1)}}{${x2.toTex()} - ${sub(x1)}}$. Simplify it, then substitute either point into $y = mx + b$.`,
        `Use the point $(${x1.toTex()}, ${y1.toTex()})$: $${y1.toTex()} = m\\cdot${sub(x1)} + b$. Solve for $b$.`,
      ],
      solution: [
        { text: 'Find the slope.', tex: `m = \\dfrac{${y2.toTex()} - ${sub(y1)}}{${x2.toTex()} - ${sub(x1)}} = \\dfrac{${dy.toTex()}}{${dx.toTex()}} = ${m.toTex()}`, why: 'Slope is the change in $y$ over the change in $x$.' },
        { text: 'Substitute one point to find $b$.', tex: `${y1.toTex()} = ${m.toTex()}\\cdot${sub(x1)} + b \\;\\Rightarrow\\; b = ${b.toTex()}`, why: 'The point is on the line, so it satisfies the equation.' },
        { text: 'Write the equation.', tex: yEqTex(m, b) },
        { text: 'Check with the other point.', tex: `${m.toTex()}\\cdot${sub(x2)}${b.isNegative() ? ' - ' + b.abs().toTex() : ' + ' + b.toTex()} = ${y2.toTex()}`, why: 'Both points work, so the equation is right.' },
      ],
      misconceptions: lineMisconceptions({ m, b }, [
        { m: dy.isZero() ? m : dx.div(dy), b: y1.sub(dy.isZero() ? m.mul(x1) : dx.div(dy).mul(x1)), tag: 'rise-run-swap', feedback: 'Check the slope: change in $y$ goes on top.' },
        { m: m.neg(), b: y1.add(m.mul(x1)), tag: 'slope-calc', feedback: 'Check the slope. Subtract in the same order on the top and the bottom.' },
        { m, b: y1, tag: 'equation-setup', feedback: 'A point is only the $y$-intercept if its $x$-coordinate is 0. Substitute a point to find $b$.' },
      ]),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'equation') return ['wrong kind'];
    const text = (pr.prompt[0] as { text: string }).text;
    const pts = [...text.matchAll(/\$\((.+?), (.+?)\)\$/g)].map((mm) => [mm[1], mm[2]].map((t) => toPoly(parseExpression(texToExpr(t))).constantValue()));
    const line = lineOf(pr.answer.value);
    if (pts.length !== 2 || !line) return ['cannot parse'];
    return pts.every(([x, y]) => line.m.mul(x).add(line.b).eq(y)) ? [] : ['a point is not on the line'];
  },
};

// ---------------------------------------------------------------------------
// S1.07: write the rule for a situation
// ---------------------------------------------------------------------------

function numbersIn(s: string): Rational[] {
  return [...s.replace(/\\\$/g, '').matchAll(/\d+(?:\.\d+)?/g)].map((mm) => Rational.parse(mm[0]));
}

export const genWriteContext: GeneratorDef = {
  id: 'u1.write-context',
  skillId: 'S1.07',
  description: 'Write the linear function rule for a real-world situation.',
  generate(rng, difficulty) {
    const keys = difficulty === 1 ? ['gym', 'savings', 'hike'] : difficulty === 2 ? ['rideshare', 'gym', 'savings', 'hike', ...DECREASING_KEYS] : ['carwash', ...DECREASING_KEYS, 'rideshare'];
    const ctx = buildContext(rng, keys);
    const { f, v, m, b } = ctx;
    const rule = linearPlain(m, b, v);
    const wrong = (mm: Rational, bb: Rational, tag: Misconception['tag'], feedback: string): Misconception | null => (mm.eq(m) && bb.eq(b) ? null : { answer: linearPlain(mm, bb, v), tag, feedback });
    return makeProblem({
      skillId: 'S1.07',
      tags: ['real-world', 'word'],
      prompt: [p(ctx.setup), p(`Write a rule for $${f}(${v})$, ${ctx.outputDesc}.`)],
      answer: { kind: 'expression', value: rule, variables: [v] },
      inputHint: `Type the rule using ${v}, like ${linearPlain(Q(3), Q(10), v)}. You can start with ${f}(${v}) = if you like.`,
      hints: [
        'A linear rule has the form (rate) $\\times$ (input) $+$ (starting value).',
        `Which amount changes every ${ctx.inUnit}? That is the rate, and it is multiplied by $${v}$.`,
        `Which amount is there at the start, when $${v} = 0$? That is the constant term.`,
        m.isNegative() || b.isNegative() ? 'Something is going down or is a cost. Decide which number is negative.' : 'Both amounts add to the total.',
      ],
      solution: [
        { text: 'Find the rate of change.', tex: `m = ${decTex(m)}`, why: `${ctx.rateMeaning[0].toUpperCase()}${ctx.rateMeaning.slice(1)}, so the rate is ${decTex(m)} ${ctx.rateUnit}.` },
        { text: 'Find the starting value.', tex: `b = ${decTex(b)}`, why: `When $${v} = 0$, ${ctx.startMeaning}.` },
        { text: 'Write the rule.', tex: `${f}(${v}) = ${linearTex(m, b, v, true)}` },
      ],
      misconceptions: [
        wrong(b, m, 'equation-setup', `The starting value is not multiplied by $${v}$. Only the amount that repeats every ${ctx.inUnit} is.`),
        wrong(m.neg(), b, 'sign-error', `Is the amount going up or down each ${ctx.inUnit}? Check the sign of the rate.`),
        wrong(m, b.neg(), 'sign-error', 'Check the sign of the starting value.'),
        wrong(m.add(b), Q(0), 'equation-setup', 'The starting amount happens once, so it should not be multiplied by the input.'),
      ].filter((x): x is Misconception => x !== null),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'expression') return ['wrong kind'];
    const v = pr.answer.variables![0];
    const poly = toPoly(parseExpression(pr.answer.value));
    const m = poly.coeff(v, 1);
    const b = poly.evaluate({ [v]: Q(0) });
    const nums = numbersIn((pr.prompt[0] as { text: string }).text);
    const errs: string[] = [];
    if (poly.degree() !== 1) errs.push('rule is not linear');
    if (!nums.some((n) => n.eq(m.abs()))) errs.push(`rate ${m} not in situation`);
    if (!nums.some((n) => n.eq(b.abs()))) errs.push(`start ${b} not in situation`);
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S1.08: convert among forms
// ---------------------------------------------------------------------------

/** Ax + By = C as TeX/plain */
function standardTex(A: Rational, B: Rational, C: Rational): string {
  return `${polyTex(Poly.fromCoeffs('x', [Q(0), A]).add(Poly.fromCoeffs('y', [Q(0), B])), ['x', 'y'])} = ${C.toTex()}`;
}
function standardPlain(A: Rational, B: Rational, C: Rational): string {
  return `${A.toString()}x + ${B.toString()}y = ${C.toString()}`.replace(/\+ -/g, '- ');
}
function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
}

export const genConvertForms: GeneratorDef = {
  id: 'u1.convert-forms',
  skillId: 'S1.08',
  description: 'Convert a linear equation among standard, slope-intercept and point-slope forms.',
  generate(rng, difficulty) {
    if (difficulty === 1) {
      // standard -> slope-intercept, B divides A and C
      const B = Q(rng.pick([1, 2, 3, 4, -1, -2]));
      const A = B.mul(rng.nonzeroInt(-4, 4));
      const C = B.mul(rng.int(-6, 6));
      const m = A.neg().div(B);
      const b = C.div(B);
      const given = standardTex(A, B, C);
      const yTerm = linearTex(A.neg(), C, 'x');
      return makeProblem({
        skillId: 'S1.08',
        tags: [],
        prompt: [p('Rewrite this equation in slope-intercept form, $y = mx + b$.'), math(given)],
        answer: { kind: 'equation', value: yEq(m, b), form: 'slope-intercept' },
        inputHint: SI_HINT,
        hints: [
          'Slope-intercept form has $y$ by itself on one side.',
          `Move the $x$-term: ${A.isNegative() ? 'add' : 'subtract'} $${A.abs().toTex()}x$ ${A.isNegative() ? 'to' : 'from'} both sides.`,
          `You should have $${B.eq(1) ? '' : B.eq(-1) ? '-' : B.toTex()}y = ${yTerm}$. Now divide every term by $${B.toTex()}$.`,
          'Divide both the $x$-term and the constant by the coefficient of $y$, then write the $x$-term first.',
        ],
        solution: [
          { text: `${A.isNegative() ? 'Add' : 'Subtract'} $${A.abs().toTex()}x$ on both sides.`, tex: `${B.eq(1) ? '' : B.eq(-1) ? '-' : B.toTex()}y = ${yTerm}`, why: 'Get the $y$-term alone on one side.' },
          { text: `Divide every term by $${B.toTex()}$.`, tex: yEqTex(m, b), why: 'Dividing both sides by the same nonzero number keeps the equation balanced. Every term must be divided.' },
        ],
        misconceptions: lineMisconceptions({ m, b }, [
          { m: A.neg(), b: C.div(B), tag: 'arithmetic-error', feedback: 'Divide every term by the coefficient of $y$, including the $x$-term.' },
          { m: A.neg().div(B), b: C, tag: 'arithmetic-error', feedback: 'Divide every term by the coefficient of $y$, including the constant.' },
          { m: A.div(B), b: C.div(B), tag: 'sign-error', feedback: 'When you move the $x$-term to the other side, its sign changes.' },
        ]),
      });
    }
    if (difficulty === 2) {
      // slope-intercept (fractional slope) -> standard form with integers
      const den = rng.pick([2, 3, 4, 5]);
      let num = rng.nonzeroInt(-6, 6);
      while (num % den === 0) num = rng.nonzeroInt(-6, 6);
      const m = Q(num, den);
      const b = Q(rng.nonzeroInt(-8, 8));
      // y = (num/den)x + b  ->  -num x + den y = den b  ->  normalise so A > 0
      let A = Q(-num);
      let B = Q(den);
      let C = b.mul(den);
      const g = gcd(gcd(A.num, B.num), C.num);
      A = A.div(Q(g));
      B = B.div(Q(g));
      C = C.div(Q(g));
      if (A.isNegative()) [A, B, C] = [A.neg(), B.neg(), C.neg()];
      return makeProblem({
        skillId: 'S1.08',
        tags: [],
        prompt: [p('Rewrite this equation in standard form, $Ax + By = C$, where $A$, $B$ and $C$ are integers and $A$ is positive.'), math(yEqTex(m, b))],
        answer: { kind: 'equation', value: standardPlain(A, B, C), form: 'standard' },
        inputHint: 'Type an equation like 3x + 4y = 12.',
        hints: [
          'Standard form has the $x$- and $y$-terms on the left and the constant on the right, all with integer coefficients.',
          `Clear the fraction first: multiply every term on both sides by $${den}$.`,
          `After multiplying you have $${den}y = ${linearTex(Q(num), b.mul(den))}$. Now move the $x$-term to the left side.`,
          'If the $x$ coefficient is negative, multiply every term by $-1$ so that $A$ is positive.',
        ],
        solution: [
          { text: `Multiply every term by $${den}$.`, tex: `${den}y = ${linearTex(Q(num), b.mul(den))}`, why: 'This clears the fraction so all coefficients are integers.' },
          { text: `${num > 0 ? 'Subtract' : 'Add'} $${Math.abs(num)}x$ on both sides.`, tex: standardTex(Q(-num), Q(den), b.mul(den)), why: 'Standard form keeps both variable terms on the left.' },
          ...(A.eq(-num) ? [] : [{ text: 'Make $A$ positive (and divide out any common factor).', tex: standardTex(A, B, C), why: 'Multiplying or dividing every term by the same nonzero number gives an equivalent equation.' }]),
        ],
        misconceptions: [
          { answer: standardPlain(Q(num).neg(), Q(den), b), tag: 'arithmetic-error' as const, feedback: 'Multiply **every** term by the denominator, including the constant.' },
          { answer: standardPlain(Q(num), Q(den), b.mul(den)), tag: 'sign-error' as const, feedback: 'When you move the $x$-term to the other side, its sign changes.' },
        ].filter((mc) => {
          try {
            return !equationsEquivalent(parseRelation(mc.answer), parseRelation(standardPlain(A, B, C)));
          } catch {
            return false;
          }
        }),
      });
    }
    // difficulty 3: point-slope -> slope-intercept, or write point-slope form
    const m = pickSlope(rng, rng.bool() ? 2 : 3);
    const x1 = Q(rng.nonzeroInt(-6, 6));
    const y1 = Q(rng.nonzeroInt(-8, 8));
    const b = y1.sub(m.mul(x1));
    const pointSlopeTex = `y ${y1.isNegative() ? '+ ' + y1.abs().toTex() : '- ' + y1.toTex()} = ${m.toTex()}(${x1.isNegative() ? 'x + ' + x1.abs().toTex() : 'x - ' + x1.toTex()})`;
    const pointSlopePlain = `y - (${y1.toString()}) = (${m.toString()})(x - (${x1.toString()}))`;
    if (rng.bool()) {
      return makeProblem({
        skillId: 'S1.08',
        tags: [],
        prompt: [p('Rewrite this equation in slope-intercept form, $y = mx + b$.'), math(pointSlopeTex)],
        answer: { kind: 'equation', value: yEq(m, b), form: 'slope-intercept' },
        inputHint: SI_HINT,
        hints: [
          'Distribute the slope on the right side, then get $y$ by itself.',
          `Multiply $${m.toTex()}$ by each term inside the parentheses.`,
          `$${m.toTex()}\\cdot x$ and $${m.toTex()}\\cdot${sub(x1.neg())}$. Then ${y1.isNegative() ? 'subtract ' + y1.abs().toTex() : 'add ' + y1.toTex()} on both sides.`,
          'Combine the constant terms to get $b$.',
        ],
        solution: [
          { text: 'Distribute.', tex: `y ${y1.isNegative() ? '+ ' + y1.abs().toTex() : '- ' + y1.toTex()} = ${linearTex(m, m.mul(x1).neg())}`, why: 'The slope multiplies both terms inside the parentheses.' },
          { text: `${y1.isNegative() ? 'Subtract' : 'Add'} $${y1.abs().toTex()}$ on both sides.`, tex: yEqTex(m, b), why: 'This gets $y$ alone.' },
        ],
        misconceptions: lineMisconceptions({ m, b }, [
          { m, b: y1.add(m.mul(x1)), tag: 'sign-error', feedback: 'Check the signs when you distribute and when you move the constant.' },
          { m, b: m.mul(x1).neg().sub(y1), tag: 'sign-error', feedback: 'To undo subtracting on the left, add on both sides.' },
          { m, b: y1.sub(x1), tag: 'distribution', feedback: 'Distribute the slope to **both** terms in the parentheses.' },
        ]),
      });
    }
    return makeProblem({
      skillId: 'S1.08',
      tags: [],
      prompt: [p(`Write the equation of the line with slope $${m.toTex()}$ through $(${x1.toTex()}, ${y1.toTex()})$ in point-slope form, $y - y_1 = m(x - x_1)$.`)],
      answer: { kind: 'equation', value: pointSlopePlain, form: 'point-slope' },
      inputHint: 'Type an equation like y - 3 = 2(x + 1).',
      hints: [
        'Point-slope form uses one point $(x_1, y_1)$ and the slope $m$.',
        `Here $x_1 = ${x1.toTex()}$, $y_1 = ${y1.toTex()}$ and $m = ${m.toTex()}$.`,
        `Substitute: $y - ${sub(y1)} = ${m.toTex()}(x - ${sub(x1)})$.`,
        'Subtracting a negative becomes adding, so clean up the signs.',
      ],
      solution: [
        { text: 'Substitute the point and slope into point-slope form.', tex: `y - ${sub(y1)} = ${m.toTex()}(x - ${sub(x1)})`, why: 'Point-slope form is built directly from a point and a slope.' },
        { text: 'Simplify the signs.', tex: pointSlopeTex, why: 'Subtracting a negative is the same as adding.' },
      ],
      misconceptions: [
        { answer: `y - (${x1.toString()}) = (${m.toString()})(x - (${y1.toString()}))`, tag: 'graph-reading' as const, feedback: 'The $y$-coordinate goes with $y$, and the $x$-coordinate goes with $x$.' },
        { answer: `y + (${y1.toString()}) = (${m.toString()})(x + (${x1.toString()}))`, tag: 'sign-error' as const, feedback: 'Point-slope form subtracts the coordinates: $y - y_1$ and $x - x_1$.' },
      ].filter((mc) => !equationsEquivalent(parseRelation(mc.answer), parseRelation(pointSlopePlain))),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'equation') return ['wrong kind'];
    const given = pr.prompt.find((b) => b.t === 'math') as { tex: string } | undefined;
    let ref: string;
    if (given) ref = texToExpr(given.tex);
    else {
      const text = (pr.prompt[0] as { text: string }).text;
      const mm = /slope \$(.+?)\$ through \$\((.+?), (.+?)\)\$/.exec(text);
      if (!mm) return ['cannot parse'];
      const [m, x, y] = [mm[1], mm[2], mm[3]].map((t) => toPoly(parseExpression(texToExpr(t))).constantValue());
      ref = `y = ${linearPlain(m, y.sub(m.mul(x)))}`;
    }
    return equationsEquivalent(parseRelation(ref), parseRelation(pr.answer.value)) ? [] : ['answer is not equivalent to the given line'];
  },
};

// ---------------------------------------------------------------------------
// S1.09: intercepts
// ---------------------------------------------------------------------------

export const genIntercepts: GeneratorDef = {
  id: 'u1.intercepts',
  skillId: 'S1.09',
  description: 'Find the x- or y-intercept of a line from its equation.',
  generate(rng, difficulty) {
    const wantX = difficulty === 1 ? rng.bool() : true;
    let eqTex: string;
    let A: Rational, B: Rational, C: Rational; // Ax + By = C
    if (difficulty === 1) {
      // y = mx + b with an integer x-intercept
      const m = Q(rng.nonzeroInt(-5, 5));
      const r = Q(rng.nonzeroInt(-6, 6));
      const b = m.mul(r).neg();
      eqTex = yEqTex(m, b);
      [A, B, C] = [m.neg(), Q(1), b];
    } else {
      A = Q(rng.nonzeroInt(-6, 6));
      B = Q(rng.nonzeroInt(-6, 6));
      const mult = difficulty === 2 ? Number(A.num * B.num) : rng.nonzeroInt(-12, 12);
      C = Q(mult * (difficulty === 2 ? rng.nonzeroInt(-3, 3) : 1));
      if (difficulty === 3 && C.div(A).isInteger()) C = C.add(1).isZero() ? C.add(2) : C.add(1);
      eqTex = standardTex(A, B, C);
    }
    const askX = wantX;
    const xInt = C.div(A);
    const yInt = C.div(B);
    const key = askX ? { x: xInt, y: Q(0) } : { x: Q(0), y: yInt };
    const which = askX ? '$x$-intercept' : '$y$-intercept';
    return makeProblem({
      skillId: 'S1.09',
      tags: [],
      prompt: [p(`Find the ${which} of the line. Write it as an ordered pair.`), math(eqTex)],
      answer: { kind: 'point', x: numStr(key.x), y: numStr(key.y) },
      inputHint: 'Type an ordered pair like (4, 0). Fractions are fine.',
      hints: [
        askX ? 'The $x$-intercept is where the line crosses the $x$-axis. Every point on the $x$-axis has $y = 0$.' : 'The $y$-intercept is where the line crosses the $y$-axis. Every point on the $y$-axis has $x = 0$.',
        askX ? 'Substitute $y = 0$ into the equation.' : 'Substitute $x = 0$ into the equation.',
        askX ? `With $y = 0$ the equation becomes $${A.toTex()}x = ${C.toTex()}$${difficulty === 1 ? ' after you move the constant' : ''}. Solve for $x$.` : `With $x = 0$ the equation becomes $${B.toTex()}y = ${C.toTex()}$. Solve for $y$.`,
        askX ? 'Write the answer as $(x, 0)$.' : 'Write the answer as $(0, y)$.',
      ],
      solution: askX
        ? [
            { text: 'Substitute $y = 0$.', tex: difficulty === 1 ? `0 = ${eqTex.slice(4)}` : `${A.toTex()}x + ${B.toTex()}(0) = ${C.toTex()}`, why: 'On the $x$-axis, $y$ is 0.' },
            { text: 'Solve for $x$.', tex: `x = ${xInt.toTex()}`, why: difficulty === 1 ? 'Undo the constant, then divide by the slope.' : `Divide both sides by $${A.toTex()}$.` },
            { text: 'Write the intercept as a point.', tex: `(${xInt.toTex()}, 0)` },
          ]
        : [
            { text: 'Substitute $x = 0$.', tex: difficulty === 1 ? `y = ${A.neg().toTex()}(0)${C.isNegative() ? ' - ' + C.abs().toTex() : ' + ' + C.toTex()}` : `${A.toTex()}(0) + ${B.toTex()}y = ${C.toTex()}`, why: 'On the $y$-axis, $x$ is 0.' },
            { text: 'Solve for $y$.', tex: `y = ${yInt.toTex()}`, why: difficulty === 1 ? 'In $y = mx + b$, the $y$-intercept is $b$.' : `Divide both sides by $${B.toTex()}$.` },
            { text: 'Write the intercept as a point.', tex: `(0, ${yInt.toTex()})` },
          ],
      misconceptions: [
        ...(askX && !xInt.neg().eq(xInt) ? [{ answer: `(${numStr(xInt.neg())}, 0)`, tag: 'sign-error' as const, feedback: 'Check the signs when you solve for $x$.' }] : []),
        ...(!askX && !yInt.neg().eq(yInt) ? [{ answer: `(0, ${numStr(yInt.neg())})`, tag: 'sign-error' as const, feedback: 'Check the signs when you solve for $y$.' }] : []),
        ...(askX && !yInt.eq(0) ? [{ answer: `(0, ${numStr(yInt)})`, tag: 'graph-reading' as const, feedback: 'That point is on the $y$-axis. The $x$-intercept is on the $x$-axis, where $y = 0$.' }] : []),
      ],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'point') return ['wrong kind'];
    const eq = pr.prompt.find((b) => b.t === 'math') as { tex: string };
    const r = parseRelation(texToExpr(eq.tex));
    const x = Rational.parse(pr.answer.x);
    const y = Rational.parse(pr.answer.y);
    const lhs = toPoly(r.lhs).evaluate({ x, y });
    const rhs = toPoly(r.rhs).evaluate({ x, y });
    const errs: string[] = [];
    if (!lhs.eq(rhs)) errs.push('point not on line');
    const ask = (pr.prompt[0] as { text: string }).text;
    if (ask.includes('$x$-intercept') && !y.isZero()) errs.push('x-intercept must have y = 0');
    if (ask.includes('$y$-intercept') && !x.isZero()) errs.push('y-intercept must have x = 0');
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S1.09: intercepts in context
// ---------------------------------------------------------------------------

export const genInterceptsContext: GeneratorDef = {
  id: 'u1.intercepts-context',
  skillId: 'S1.09',
  description: 'Find and interpret an intercept of a real-world linear function.',
  generate(rng, difficulty) {
    const vertical = difficulty === 1;
    const ctx = buildContext(rng, vertical ? ['gym', 'savings', 'hike', 'tank', 'battery'] : [...DECREASING_KEYS, 'carwash']);
    const { f, v, m, b } = ctx;
    const story = `${ctx.setup} The function $${f}(${v}) = ${linearTex(m, b, v, true)}$ gives ${ctx.outputDesc}.`;
    if (vertical) {
      return makeProblem({
        skillId: 'S1.09',
        tags: ['real-world', 'word'],
        prompt: [p(story), p(`What is the vertical intercept, $${f}(0)$? It tells you ${ctx.outputDesc.replace(/,? (after|for a) .*/, '')} at the start.`)],
        answer: { kind: 'number', value: numStr(b), unit: ctx.outUnit },
        hints: [
          'The vertical intercept is the output when the input is 0.',
          `Substitute $${v} = 0$ into the rule.`,
          `$${decTex(m)} \\cdot 0 = 0$, so only one term is left.`,
          'In $y = mx + b$, the vertical intercept is $b$.',
        ],
        solution: [
          { text: `Substitute $${v} = 0$.`, tex: `${f}(0) = ${decTex(m)}(0)${b.isNegative() ? ' - ' + decTex(b.abs()) : ' + ' + decTex(b)}`, why: 'The vertical axis is where the input is 0.' },
          { text: 'Simplify.', tex: `${f}(0) = ${decTex(b)}`, why: `This means ${ctx.startMeaning}.` },
        ],
        misconceptions: m.eq(b) ? [] : [{ answer: numStr(m), tag: 'graph-reading', feedback: `That is the rate of change (${ctx.rateUnit}). The intercept is the value at the start, when $${v} = 0$.` }],
      });
    }
    const zero = b.neg().div(m);
    const zeroText = ctx.key === 'carwash' ? 'the band breaks even (profit is \\$0)' : `${ctx.outputDesc.replace(/,? (after|for a) .*/, '')} reaches 0`;
    return makeProblem({
      skillId: 'S1.09',
      tags: ['real-world', 'word'],
      prompt: [p(story), p(`Find the horizontal intercept: the value of $${v}$ when ${zeroText}.`)],
      answer: { kind: 'number', value: numStr(zero), unit: ctx.inUnits },
      inputHint: `Type the number of ${ctx.inUnits}. Decimals and fractions are fine.`,
      hints: [
        'The horizontal intercept is the input that makes the output 0.',
        `Set the rule equal to 0: $${linearTex(m, b, v, true)} = 0$.`,
        `${b.isNegative() ? 'Add' : 'Subtract'} $${decTex(b.abs())}$ on both sides.`,
        `Then divide both sides by $${decTex(m)}$.`,
      ],
      solution: [
        { text: 'Set the output equal to 0.', tex: `${linearTex(m, b, v, true)} = 0`, why: 'The horizontal intercept is where the graph meets the input axis, so the output is 0.' },
        { text: `${b.isNegative() ? 'Add' : 'Subtract'} $${decTex(b.abs())}$.`, tex: `${linearTex(m, 0, v, true)} = ${decTex(b.neg())}` },
        { text: `Divide by $${decTex(m)}$.`, tex: `${v} = ${decTex(zero)}`, why: `So ${zeroText} after ${decTex(zero)} ${ctx.inUnits}.` },
      ],
      misconceptions: [
        ...(b.eq(zero) ? [] : [{ answer: numStr(b), tag: 'graph-reading' as const, feedback: 'That is the vertical intercept, the starting value. Find the input that makes the output 0.' }]),
        ...(zero.neg().eq(zero) ? [] : [{ answer: numStr(zero.neg()), tag: 'sign-error' as const, feedback: 'Check your signs: the number of ' + ctx.inUnits + ' should be positive here.' }]),
      ],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'number') return ['wrong kind'];
    const story = (pr.prompt[0] as { text: string }).text;
    const rm = /\$([A-Z])\(([a-z])\) = (.+?)\$ gives/.exec(story);
    if (!rm) return ['cannot parse'];
    const poly = toPoly(parseExpression(texToExpr(rm[3])));
    const ans = Rational.parse(pr.answer.value);
    const ask = (pr.prompt[1] as { text: string }).text;
    if (ask.includes('vertical intercept')) return poly.evaluate({ [rm[2]]: Q(0) }).eq(ans) ? [] : ['f(0) mismatch'];
    if (!poly.evaluate({ [rm[2]]: ans }).isZero()) return ['f(answer) is not 0'];
    return ans.isNegative() ? ['negative input'] : [];
  },
};

// ---------------------------------------------------------------------------
// S1.10: increasing / decreasing, positive / negative intervals
// ---------------------------------------------------------------------------

export const genKeyFeatures: GeneratorDef = {
  id: 'u1.key-features',
  skillId: 'S1.10',
  description: 'Decide whether a linear function is increasing, decreasing or constant; find where it is positive or negative.',
  generate(rng, difficulty) {
    if (difficulty === 1) {
      const kind = rng.pick(['inc', 'dec', 'inc', 'dec', 'const'] as const);
      const m = kind === 'const' ? Q(0) : Q(rng.int(1, 4)).mul(kind === 'dec' ? -1 : 1);
      const b = Q(rng.int(-4, 4));
      const answer = makeChoice(rng, kind === 'inc' ? 'Increasing' : kind === 'dec' ? 'Decreasing' : 'Constant', ['Increasing', 'Decreasing', 'Constant'].filter((l) => l !== (kind === 'inc' ? 'Increasing' : kind === 'dec' ? 'Decreasing' : 'Constant')));
      return makeProblem({
        skillId: 'S1.10',
        tags: ['graph'],
        prompt: [
          p('Is this function increasing, decreasing, or constant?'),
          { t: 'graph', spec: { xMin: -6, xMax: 6, yMin: -6, yMax: 6, functions: [{ expr: linearPlain(m, b), label: 'y = f(x)' }], ariaLabel: `A line through (0, ${b.toString()}) with slope ${m.toString()}.` } },
        ],
        answer,
        hints: [
          'Read the graph from left to right, the way you read a sentence.',
          'If the line goes up as you move right, the function is increasing.',
          'If it goes down as you move right, it is decreasing. If it stays flat, it is constant.',
          'The sign of the slope tells you: positive means increasing, negative means decreasing, zero means constant.',
        ],
        solution: [
          { text: 'Trace the line from left to right.', why: 'Increasing and decreasing describe what happens to $y$ as $x$ gets larger.' },
          { text: kind === 'inc' ? 'The line rises, so $y$ gets larger as $x$ gets larger.' : kind === 'dec' ? 'The line falls, so $y$ gets smaller as $x$ gets larger.' : 'The line is flat, so $y$ stays the same.', tex: `m = ${m.toTex()}` },
          { text: `The function is ${kind === 'inc' ? 'increasing' : kind === 'dec' ? 'decreasing' : 'constant'}.` },
        ],
        misconceptions: [],
      });
    }
    // positive / negative interval for y = mx + b
    let m: Rational;
    let r: Rational; // zero
    if (difficulty === 2) {
      m = Q(rng.nonzeroInt(-4, 4));
      r = Q(rng.int(-6, 6));
    } else {
      const den = rng.pick([2, 3]);
      m = Q(rng.pick([den, -den, 2 * den, -2 * den].filter((x) => Math.abs(x) <= 6)));
      let num = rng.nonzeroInt(-9, 9);
      while (num % den === 0) num = rng.nonzeroInt(-9, 9);
      r = Q(num, den);
      if (rng.bool()) {
        // fractional slope with integer zero
        m = Q(rng.pick([1, -1, 3, -3]), 2);
        r = Q(rng.nonzeroInt(-5, 5));
      }
    }
    const b = m.mul(r).neg();
    const wantPositive = rng.bool();
    const right = m.isNegative() !== wantPositive; // positive & increasing => x > r
    const iv = right ? `(${numStr(r)}, ∞)` : `(-∞, ${numStr(r)})`;
    const other = right ? `(-∞, ${numStr(r)})` : `(${numStr(r)}, ∞)`;
    const word = wantPositive ? 'positive' : 'negative';
    const rule = linearTex(m, b);
    return makeProblem({
      skillId: 'S1.10',
      tags: [],
      prompt: [p(`For $f(x) = ${rule}$, over what interval is $f(x)$ ${word}? Write your answer in interval notation or as an inequality.`)],
      answer: { kind: 'interval', value: iv },
      inputHint: 'Type an interval like (2, ∞) or (-inf, 2), or an inequality like x > 2.',
      hints: [
        `$f(x)$ is ${word} where its graph is ${wantPositive ? 'above' : 'below'} the $x$-axis.`,
        'First find the $x$-intercept: solve $f(x) = 0$. That is where the sign can change.',
        `The function is ${m.isNegative() ? 'decreasing' : 'increasing'} because its slope is ${m.isNegative() ? 'negative' : 'positive'}. Which side of the $x$-intercept has ${word} outputs?`,
        'Test a value on one side of the intercept: substitute it and check the sign of the output. The intercept itself gives 0, which is neither positive nor negative.',
      ],
      solution: [
        { text: 'Find the $x$-intercept.', tex: `${rule} = 0 \\;\\Rightarrow\\; x = ${r.toTex()}`, why: 'A linear function changes sign only where it crosses the $x$-axis.' },
        { text: 'Use the slope to decide which side is ' + word + '.', why: `The slope $${m.toTex()}$ is ${m.isNegative() ? 'negative, so outputs get smaller as $x$ increases: they are positive to the left of the intercept and negative to the right' : 'positive, so outputs get larger as $x$ increases: they are negative to the left of the intercept and positive to the right'}.` },
        { text: 'Write the interval. Use parentheses, because $f(x) = 0$ at the intercept, and 0 is not ' + word + '.', tex: right ? `x > ${r.toTex()} \\quad\\text{or}\\quad (${r.toTex()}, \\infty)` : `x < ${r.toTex()} \\quad\\text{or}\\quad (-\\infty, ${r.toTex()})` },
      ],
      misconceptions: [
        { answer: other, tag: 'inequality-direction', feedback: `Check which side of the intercept is ${word}: substitute a test value.` },
        ...(b.isZero() || r.eq(b) ? [] : [{ answer: right ? `(${numStr(b)}, ∞)` : `(-∞, ${numStr(b)})`, tag: 'graph-reading' as const, feedback: 'The sign changes at the $x$-intercept, not the $y$-intercept.' }]),
      ],
    });
  },
  verify(pr) {
    const text = (pr.prompt[0] as { text: string }).text;
    if (pr.answer.kind === 'choice') {
      const g = pr.prompt.find((b) => b.t === 'graph') as { spec: { functions: Array<{ expr: string }> } };
      const poly = toPoly(parseExpression(g.spec.functions[0].expr));
      const slope = poly.evaluate({ x: Q(1) }).sub(poly.evaluate({ x: Q(0) }));
      const label = choiceLabel(pr.answer);
      const expect = slope.isZero() ? 'Constant' : slope.isNegative() ? 'Decreasing' : 'Increasing';
      return label === expect ? [] : [`expected ${expect}`];
    }
    if (pr.answer.kind !== 'interval') return ['wrong kind'];
    const mm = /\$f\(x\) = (.+?)\$, over what interval is \$f\(x\)\$ (positive|negative)/.exec(text);
    if (!mm) return ['cannot parse'];
    const poly = toPoly(parseExpression(texToExpr(mm[1])));
    const iv = parseInterval(pr.answer.value);
    const end = iv.lo ?? iv.hi!;
    const errs: string[] = [];
    if (!poly.evaluate({ x: end }).isZero()) errs.push('endpoint is not the zero');
    if (iv.loClosed || iv.hiClosed) errs.push('endpoint should be open');
    const inside = iv.lo ? end.add(1) : end.sub(1);
    const outside = iv.lo ? end.sub(1) : end.add(1);
    const sgn = mm[2] === 'positive' ? 1 : -1;
    if (poly.evaluate({ x: inside }).sign() !== sgn) errs.push('test point inside has the wrong sign');
    if (poly.evaluate({ x: outside }).sign() === sgn) errs.push('test point outside has the same sign');
    return errs;
  },
};

export const U1_LINEAR_GENERATORS = [genWriteSlopePoint, genWriteTwoPoints, genWriteContext, genConvertForms, genIntercepts, genInterceptsContext, genKeyFeatures];
