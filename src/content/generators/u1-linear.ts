/**
 * Unit 1, Lessons 4-5 generators: writing linear functions, forms of linear equations,
 * intercepts and key features.
 * S1.07 write linear functions, S1.08 convert forms, S1.09 intercepts, S1.10 key features.
 */
import type { GeneratorDef, Rng, Difficulty, Block, GraphSpec, Problem } from '../../core/curriculum/types';
import type { Misconception } from '../../core/math/answers';
import { parseRelation, equationsEquivalent, parseInterval } from '../../core/math/answers';
import { Rational } from '../../core/math/rational';
import { linearTex, linearPlain, decTex, polyTex } from '../../core/math/format';
import { Poly, toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { Q, p, math, makeProblem, numStr, sub, makeChoice, choiceLabel, texToExpr, numberMisconceptions } from './util';
import { buildContext, DECREASING_KEYS, type LinearContext } from './u1-contexts';
import { numStep, choiceStep, finalStep, stepErrors, choiceMisc } from './u1-steps';

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
          misconceptions: numberMisconceptions(b, [
            { value: y1.add(mx1), tag: 'sign-error', feedback: 'Subtract the product from both sides, do not add it.' },
            { value: x1.isZero() ? null : y1, tag: 'equation-setup', feedback: 'A point is only the $y$-intercept if its $x$-coordinate is 0. Solve for $b$.' },
          ]),
          explanation: `The point is on the line, so its coordinates make $y = mx + b$ true; subtracting $${m.toTex()}\\cdot${sub(x1)}$ from both sides leaves $b = ${b.toTex()}$.`,
        },
        {
          prompt: [p(`Now write the equation of the line with $m = ${m.toTex()}$ and $b = ${b.toTex()}$.`)],
          answer: { kind: 'equation', value: yEq(m, b), form: 'slope-intercept' },
          inputHint: SI_HINT,
          hints: ['Use $y = mx + b$.', 'Put the slope in front of $x$.', 'Put $b$ at the end.', 'If $b$ is negative, write "minus".'],
          misconceptions: lineMisconceptions({ m, b }, [{ m, b: b.neg(), tag: 'sign-error', feedback: 'Check the sign of $b$.' }]),
          explanation: `Slope-intercept form needs only the slope and the $y$-intercept, so $${yEqTex(m, b)}$.`,
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
    // steps: b = y - m x from the prompt's numbers, then the line
    errs.push(...stepErrors(pr, [y.sub(m.mul(x)), null]));
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
      steps: [
        numStep(
          `Find the slope: $m = \\dfrac{${y2.toTex()} - ${sub(y1)}}{${x2.toTex()} - ${sub(x1)}}$.`,
          m,
          ['Slope is the change in $y$ divided by the change in $x$.', `Work out the top first: $${y2.toTex()} - ${sub(y1)}$.`, `Then the bottom: $${x2.toTex()} - ${sub(x1)}$.`, 'Divide and simplify. A fraction is fine.'],
          `The change in $y$ is $${dy.toTex()}$ and the change in $x$ is $${dx.toTex()}$, and their quotient is the slope.`,
          [
            { value: dy.isZero() ? null : dx.div(dy), tag: 'rise-run-swap', feedback: 'The change in $y$ goes on top.' },
            { value: m.neg(), tag: 'slope-calc', feedback: 'Subtract in the same order on the top and the bottom.' },
          ],
          'Type the slope. Fractions like -3/4 are fine.',
        ),
        numStep(
          `Substitute the slope and the point $(${x1.toTex()}, ${y1.toTex()})$ into $y = mx + b$. What is $b$?`,
          b,
          [
            `The equation becomes $${y1.toTex()} = ${m.toTex()}\\cdot${sub(x1)} + b$.`,
            `Multiply first: $${m.toTex()}\\cdot${sub(x1)}$.`,
            'Then subtract that product from both sides.',
            'Subtracting a negative is the same as adding.',
          ],
          'The point is on the line, so its coordinates make the equation true, and that leaves only $b$ unknown.',
          [
            { value: x1.isZero() ? null : y1, tag: 'equation-setup', feedback: 'A point is only the $y$-intercept if its $x$-coordinate is 0. Solve for $b$.' },
            { value: y1.add(m.mul(x1)), tag: 'sign-error', feedback: 'Subtract the product from both sides; do not add it.' },
          ],
        ),
        finalStep(
          `Write the equation using your slope and $b$.`,
          { kind: 'equation', value: yEq(m, b), form: 'slope-intercept' },
          ['Use $y = mx + b$.', 'Put the slope in front of $x$.', 'Put $b$ at the end, with its sign.', 'Check: the other point should also fit your equation.'],
          'Slope-intercept form needs exactly the slope and the $y$-intercept, and you found both.',
          lineMisconceptions({ m, b }, [{ m, b: b.neg(), tag: 'sign-error', feedback: 'Check the sign of $b$.' }]),
          SI_HINT,
        ),
      ],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'equation') return ['wrong kind'];
    const text = (pr.prompt[0] as { text: string }).text;
    const pts = [...text.matchAll(/\$\((.+?), (.+?)\)\$/g)].map((mm) => [mm[1], mm[2]].map((t) => toPoly(parseExpression(texToExpr(t))).constantValue()));
    const line = lineOf(pr.answer.value);
    if (pts.length !== 2 || !line) return ['cannot parse'];
    if (!pts.every(([x, y]) => line.m.mul(x).add(line.b).eq(y))) return ['a point is not on the line'];
    // steps: slope with the points in reverse order, b from the second point
    const [[xa, ya], [xb, yb]] = pts;
    const slope = ya.sub(yb).div(xa.sub(xb));
    return stepErrors(pr, [slope, yb.sub(slope.mul(xb)), null]);
  },
};

// ---------------------------------------------------------------------------
// Graphs of real situations (labeled axes, only the inputs that make sense)
// ---------------------------------------------------------------------------

const AXIS_LABELS: Record<string, [string, string]> = {
  tank: ['time (minutes)', 'water left (gallons)'],
  battery: ['time (hours)', 'battery level (%)'],
  candle: ['time (hours)', 'candle height (cm)'],
  gym: ['time (months)', 'total cost (dollars)'],
  savings: ['time (weeks)', 'savings (dollars)'],
  hike: ['time (hours)', 'elevation (feet)'],
};
const GRAPH_KEYS = Object.keys(AXIS_LABELS);

/** Grid step giving at most about 10 grid lines. */
function gridStep(range: number): number {
  for (const st of [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]) if (range / st <= 10) return st;
  return 2000;
}

/**
 * A situation with two marked lattice points on its graph: (0, b) and (X, f(X)). For a
 * draining situation X is where the amount reaches 0, and the graph stops there.
 * Returns null when that point is not a whole number (the caller picks another situation).
 */
function contextGraph(rng: Rng, ctx: LinearContext): { block: Block; X: Rational; Y: Rational } | null {
  const draining = ctx.m.isNegative();
  const X = draining ? ctx.b.neg().div(ctx.m) : Q(rng.int(3, 6));
  if (!X.isInteger()) return null;
  const Y = ctx.m.mul(X).add(ctx.b);
  const xs = gridStep(X.toNumber() * 1.25);
  const xMax = Math.ceil((X.toNumber() * 1.25) / xs) * xs;
  const top = Math.max(ctx.b.toNumber(), ctx.m.mul(xMax).add(ctx.b).toNumber());
  const ys = gridStep(top * 1.15);
  const yMax = Math.ceil((top * 1.15) / ys) * ys;
  const [xLabel, yLabel] = AXIS_LABELS[ctx.key];
  const spec: GraphSpec = {
    xMin: 0,
    xMax,
    yMin: 0,
    yMax,
    xStep: xs,
    yStep: ys,
    xLabel,
    yLabel,
    functions: [{ expr: linearPlain(ctx.m, ctx.b), domain: [0, draining ? X.toNumber() : xMax] }],
    points: [
      { x: 0, y: ctx.b.toNumber(), label: `(0, ${ctx.b.toString()})` },
      { x: X.toNumber(), y: Y.toNumber(), label: `(${X.toString()}, ${Y.toString()})` },
    ],
    ariaLabel: `A line graph with ${xLabel} across and ${yLabel} up, starting at (0, ${ctx.b.toString()}) and passing through (${X.toString()}, ${Y.toString()}).`,
  };
  return { block: { t: 'graph', spec }, X, Y };
}

/** Pick a graphable situation whose marked points are whole numbers. */
function graphableContext(rng: Rng, keys: string[]): { ctx: LinearContext; g: { block: Block; X: Rational; Y: Rational } } {
  for (let i = 0; i < 30; i++) {
    const ctx = buildContext(rng, keys);
    const g = contextGraph(rng, ctx);
    if (g) return { ctx, g };
  }
  throw new Error('no graphable situation');
}

/** The two labeled points on a context graph, read back from the spec. */
function markedPoints(spec: GraphSpec): Array<{ x: Rational; y: Rational }> {
  return (spec.points ?? []).map((pt) => {
    const mm = /^\((-?[\d.]+), (-?[\d.]+)\)$/.exec(pt.label ?? '');
    return mm ? { x: Rational.parse(mm[1]), y: Rational.parse(mm[2]) } : { x: Q(pt.x), y: Q(pt.y) };
  });
}

/** Numbers in a sentence, in order (dollar signs and percent signs ignored). */
function numbersInOrder(s: string): string[] {
  return [...s.replace(/\\\$/g, '').matchAll(/-?\d+(?:\.\d+)?/g)].map((mm) => Rational.parse(mm[0]).toString());
}

/** "What does the point (0, 480) mean?" for a graph of a real situation. */
function pointMeaningProblem(rng: Rng): Problem {
  const { ctx, g } = graphableContext(rng, DECREASING_KEYS);
  const startPt = rng.bool();
  const [px, py] = startPt ? [Q(0), ctx.b] : [g.X, Q(0)];
  const ptTex = `(${px.toTex()}, ${py.toTex()})`;
  const correct = ctx.says(ctx.inWord(px), ctx.outWord(py));
  const swapped = ctx.says(ctx.inWord(py), ctx.outWord(px));
  const rateWrong = `The amount goes down by ${ctx.outWord(startPt ? py : px)} every ${ctx.inUnit}.`;
  const answer = makeChoice(rng, correct, [swapped, rateWrong]);
  const idOf = (label: string) => answer.options.find((o) => o.label === label)!.id;
  return makeProblem({
    skillId: 'S1.09',
    tags: ['real-world', 'graph'],
    prompt: [p(`${ctx.topic} The graph shows ${ctx.outputDesc}.`), g.block, p(`What does the point $${ptTex}$ on the graph mean in this situation?`)],
    answer,
    hints: [
      'Read the axis labels first: the horizontal axis is the input, the vertical axis is the output.',
      `In $${ptTex}$, the first number is the input and the second is the output.`,
      `So $${px.toTex()}$ is measured in ${ctx.inUnits}, and $${py.toTex()}$ is measured in the units of the vertical axis.`,
      startPt ? 'A point on the vertical axis is where the input is 0: the start of the situation.' : 'A point on the horizontal axis is where the output is 0: the moment the amount runs out.',
    ],
    solution: [
      { text: 'Match each coordinate to an axis.', tex: `${ctx.v} = ${px.toTex()}, \\quad ${ctx.f}(${ctx.v}) = ${py.toTex()}`, why: 'Ordered pairs list the input (horizontal axis) first and the output (vertical axis) second.' },
      { text: 'Put it into words with units.', why: `${correct} ${startPt ? `This is the vertical intercept: ${ctx.startMeaning}.` : 'This is the horizontal intercept: the amount has run out.'}` },
    ],
    misconceptions: [
      { answer: idOf(swapped), tag: 'graph-reading', feedback: 'Check the order: the first coordinate is the input on the horizontal axis.' },
      { answer: idOf(rateWrong), tag: 'graph-reading', feedback: 'A single point gives one input and its output, not a rate. A rate compares two points.' },
    ],
    steps: (() => {
      const nums = [px, py].sort((u, w) => (u.lt(w) ? -1 : 1));
      return [
        choiceStep(
          `In the point $${ptTex}$, which number is the input: a number of ${ctx.inUnits}?`,
          nums.map((n) => `$${n.toTex()}$`),
          nums.indexOf(px),
          ['An ordered pair is (input, output).', 'The input is on the horizontal axis.', `Read the horizontal axis label: it measures ${ctx.inUnits}.`, 'The first number in the pair is the input.'],
          `The first coordinate is the input, so the point describes the moment when ${ctx.inWord(px)} have passed.`,
          [{ index: nums.indexOf(py), tag: 'graph-reading', feedback: 'That is the second coordinate, the output on the vertical axis.' }],
        ),
        finalStep(
          `So what does the point $${ptTex}$ mean?`,
          answer,
          ['Use the input you just found and the other number as the output.', 'The right sentence names the input first and then the output.', 'A single point is one moment, not a rate.', startPt ? 'Input 0 is the start of the situation.' : 'Output 0 means the amount has run out.'],
          `The point pairs the input ${ctx.inWord(px)} with the output ${ctx.outWord(py)}.`,
          [
            { answer: idOf(swapped), tag: 'graph-reading', feedback: 'Check the order: the first coordinate is the input on the horizontal axis.' },
            { answer: idOf(rateWrong), tag: 'graph-reading', feedback: 'A single point gives one input and its output, not a rate.' },
          ],
        ),
      ];
    })(),
  });
}

/** Graph of a situation -> write the rule. */
function graphRuleProblem(rng: Rng): Problem {
  const { ctx, g } = graphableContext(rng, GRAPH_KEYS);
  const { f, v, m, b } = ctx;
  const rule = linearPlain(m, b, v);
  const rise = g.Y.sub(b);
  return makeProblem({
    skillId: 'S1.07',
    tags: ['real-world', 'graph'],
    prompt: [p(`${ctx.topic} The graph shows ${ctx.outputDesc}.`), g.block, p(`Write a rule for $${f}(${v})$.`)],
    answer: { kind: 'expression', value: rule, variables: [v] },
    inputHint: `Type the rule using ${v}, like ${linearPlain(Q(-20), Q(480), v)}. You can start with ${f}(${v}) = if you like.`,
    hints: [
      'A linear rule is (rate) $\\times$ (input) $+$ (starting value). Both can be read from the two marked points.',
      'The starting value is the output where the graph meets the vertical axis (input 0).',
      `The rate is the change in output divided by the change in input between the two marked points. ${m.isNegative() ? 'The graph goes down, so the rate is negative.' : 'The graph goes up, so the rate is positive.'}`,
      `Use $\\dfrac{${g.Y.toTex()} - ${sub(b)}}{${g.X.toTex()} - 0}$ for the rate, then write the rule with $${v}$ as the input.`,
    ],
    solution: [
      { text: 'Read the starting value.', tex: `b = ${decTex(b)}`, why: `The graph starts at $(0, ${decTex(b)})$: ${ctx.startMeaning}.` },
      { text: 'Find the rate from the two marked points.', tex: `m = \\dfrac{${g.Y.toTex()} - ${sub(b)}}{${g.X.toTex()} - 0} = \\dfrac{${rise.toTex()}}{${g.X.toTex()}} = ${decTex(m)}`, why: `${ctx.rateMeaning[0].toUpperCase()}${ctx.rateMeaning.slice(1)}: ${decTex(m)} ${ctx.rateUnit}.` },
      { text: 'Write the rule.', tex: `${f}(${v}) = ${linearTex(m, b, v, true)}`, why: 'Rate times the input, plus the starting value.' },
    ],
    misconceptions: stringMisc(rule, [
      { answer: linearPlain(m.neg(), b, v), tag: 'sign-error', feedback: 'Does the graph go up or down from left to right? Check the sign of the rate.' },
      { answer: linearPlain(b, m, v), tag: 'equation-setup', feedback: 'The starting value is not multiplied by the input; the rate is.' },
      ...(rise.isZero() ? [] : [{ answer: linearPlain(g.X.div(rise), b, v), tag: 'rise-run-swap' as const, feedback: 'Check the rate: the change in output goes on top and the change in input on the bottom.' }]),
      { answer: linearPlain(m, g.X, v), tag: 'graph-reading', feedback: 'The starting value is where the graph meets the vertical axis, the output at input 0.' },
    ]),
    steps: [
      numStep(
        `What is the starting value: the output where the graph meets the vertical axis (input 0)?`,
        b,
        ['The starting value is the output when the input is 0.', 'Input 0 is on the vertical axis.', 'Look at the marked point on the vertical axis.', 'Its second coordinate is the output.'],
        `The graph starts at $(0, ${decTex(b)})$: ${ctx.startMeaning}.`,
        [{ value: g.X, tag: 'graph-reading', feedback: 'That is an input. The starting value is an output, on the vertical axis.' }],
      ),
      numStep(
        `Use the two marked points to find the rate of change in ${ctx.rateUnit}.`,
        m,
        ['Rate $= \\dfrac{\\text{change in output}}{\\text{change in input}}$.', `The outputs are $${decTex(b)}$ and $${decTex(g.Y)}$.`, `The inputs are $0$ and $${decTex(g.X)}$.`, m.isNegative() ? 'The graph goes down, so the rate is negative.' : 'The graph goes up, so the rate is positive.'],
        `The output changes by $${decTex(rise)}$ over $${decTex(g.X)}$ ${ctx.inUnits}, which is $${decTex(m)}$ ${ctx.rateUnit}.`,
        [
          { value: m.neg(), tag: 'sign-error', feedback: 'Does the graph go up or down from left to right? Check the sign.' },
          { value: rise, tag: 'slope-calc', feedback: 'That is the total change. Divide by the change in input.' },
          { value: rise.isZero() ? null : g.X.div(rise), tag: 'rise-run-swap', feedback: 'The change in output goes on top.' },
        ],
      ),
      finalStep(
        `Write the rule for $${f}(${v})$.`,
        { kind: 'expression', value: rule, variables: [v] },
        ['A linear rule is (rate) $\\times$ (input) $+$ (starting value).', `Multiply the rate by $${v}$.`, 'Add the starting value.', `Check: the rule should give $${decTex(g.Y)}$ when $${v} = ${decTex(g.X)}$.`],
        'Rate times input, plus the starting value, gives the output for every input.',
        [],
        `Type the rule using ${v}.`,
      ),
    ],
  });
}

function stringMisc(key: string, list: Misconception[]): Misconception[] {
  const k = toPoly(parseExpression(key));
  const seen = [k];
  const out: Misconception[] = [];
  for (const mc of list) {
    const q = toPoly(parseExpression(mc.answer));
    if (seen.some((x) => x.equals(q))) continue;
    seen.push(q);
    out.push(mc);
  }
  return out;
}

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
    if (difficulty === 3 && rng.int(0, 2) === 0) return graphRuleProblem(rng);
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
      steps: [
        numStep(
          `What is the rate of change, in ${ctx.rateUnit}? Use a negative number if the amount goes down.`,
          m,
          [`The rate is the amount that changes every ${ctx.inUnit}.`, `Look for a phrase like "each ${ctx.inUnit}" or "per ${ctx.inUnit}".`, 'Decide whether that amount makes the output go up or down.', 'Going down means a negative rate.'],
          `${ctx.rateMeaning[0].toUpperCase()}${ctx.rateMeaning.slice(1)}, so the rate is ${decTex(m)} ${ctx.rateUnit}.`,
          [
            { value: m.neg(), tag: 'sign-error', feedback: `Is the amount going up or down each ${ctx.inUnit}? Check the sign.` },
            { value: b, tag: 'equation-setup', feedback: `That amount happens once at the start. The rate is the amount that repeats every ${ctx.inUnit}.` },
          ],
        ),
        numStep(
          `What is the starting value: the output when $${v} = 0$?`,
          b,
          [`The starting value is the amount at the very start, before any ${ctx.inUnits} pass.`, 'It happens only once, so it is not multiplied by the input.', 'Look for a one-time fee or a starting amount.', 'A cost you pay at the start makes the starting value negative.'],
          `When $${v} = 0$, ${ctx.startMeaning}.`,
          [
            { value: b.neg(), tag: 'sign-error', feedback: 'Check the sign of the starting value.' },
            { value: m, tag: 'equation-setup', feedback: `That amount repeats every ${ctx.inUnit}, so it is the rate, not the starting value.` },
          ],
        ),
        finalStep(
          `Write the rule for $${f}(${v})$.`,
          { kind: 'expression', value: rule, variables: [v] },
          ['A linear rule is (rate) $\\times$ (input) $+$ (starting value).', `Multiply the rate by $${v}$.`, 'Add the starting value, keeping its sign.', `Check: your rule at $${v} = 0$ should give the starting value.`],
          'The rate is multiplied by the input because it repeats, and the starting value is added once.',
          [],
          `Type the rule using ${v}.`,
        ),
      ],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'expression') return ['wrong kind'];
    const v = pr.answer.variables![0];
    const poly = toPoly(parseExpression(pr.answer.value));
    const graph = pr.prompt.find((b) => b.t === 'graph') as { spec: GraphSpec } | undefined;
    if (graph) {
      // two-point route: the line through the marked points, compared at several inputs
      const pts = markedPoints(graph.spec);
      if (pts.length !== 2) return ['needs two marked points'];
      const [P, R] = pts;
      const slope = R.y.sub(P.y).div(R.x.sub(P.x));
      const drawn = toPoly(parseExpression(graph.spec.functions![0].expr));
      const errs: string[] = [];
      for (const x of [0, 1, 5, 9].map((n) => Q(n))) {
        const want = P.y.add(slope.mul(x.sub(P.x)));
        if (!poly.evaluate({ [v]: x }).eq(want)) errs.push(`rule wrong at ${x}`);
        if (!drawn.evaluate({ x }).eq(want)) errs.push('drawn line misses the marked points');
      }
      if (!graph.spec.xLabel || !graph.spec.yLabel) errs.push('context graph needs axis labels');
      // steps: the starting value is the marked point at input 0, the rate comes from the two points
      const start = pts.find((q) => q.x.isZero());
      errs.push(...stepErrors(pr, [start ? start.y : null, slope, null]));
      return errs;
    }
    const m = poly.coeff(v, 1);
    const b = poly.evaluate({ [v]: Q(0) });
    const nums = numbersIn((pr.prompt[0] as { text: string }).text);
    const errs: string[] = [];
    if (poly.degree() !== 1) errs.push('rule is not linear');
    if (!nums.some((n) => n.eq(m.abs()))) errs.push(`rate ${m} not in situation`);
    if (!nums.some((n) => n.eq(b.abs()))) errs.push(`start ${b} not in situation`);
    // steps: rate and starting value must agree with the final rule
    errs.push(...stepErrors(pr, [m, b, null]));
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
        steps: [
          {
            prompt: [p(`First get the $y$-term alone: ${A.isNegative() ? 'add' : 'subtract'} $${A.abs().toTex()}x$ ${A.isNegative() ? 'to' : 'from'} both sides. The equation becomes $${B.eq(1) ? '' : B.eq(-1) ? '-' : B.toTex()}y = \\;?$ Type the right side.`)],
            answer: { kind: 'expression', value: linearPlain(A.neg(), C), variables: ['x'] },
            inputHint: 'Type an expression in x, like -2x + 6.',
            hints: [
              'Slope-intercept form has $y$ by itself, so the $x$-term has to move to the right side.',
              `To move $${A.toTex()}x$, do the opposite on both sides.`,
              'When a term moves to the other side of the equals sign, its sign changes.',
              `The right side keeps $${C.toTex()}$ and gains the $x$-term with the opposite sign.`,
            ],
            misconceptions: [{ answer: linearPlain(A, C), tag: 'sign-error' as const, feedback: 'When the $x$-term moves to the other side, its sign changes.' }],
            explanation: `Doing the same thing to both sides keeps the equation balanced and leaves only the $y$-term on the left.`,
          },
          finalStep(
            `Now divide every term by $${B.toTex()}$ and write the equation in the form $y = mx + b$.`,
            { kind: 'equation', value: yEq(m, b), form: 'slope-intercept' },
            [
              `Divide both sides by $${B.toTex()}$, the number multiplying $y$.`,
              'Every term on the right must be divided, the $x$-term and the constant.',
              B.eq(1) ? 'Dividing by 1 changes nothing, so you may already be done.' : 'Watch the signs when you divide by a negative number.',
              'Write the $x$-term first, then the constant.',
            ],
            'Dividing every term by the same nonzero number keeps the equation true and leaves $y$ alone.',
            lineMisconceptions({ m, b }, [
              { m: A.neg(), b: C.div(B), tag: 'arithmetic-error', feedback: 'Divide every term by the coefficient of $y$, including the $x$-term.' },
              { m: A.neg().div(B), b: C, tag: 'arithmetic-error', feedback: 'Divide every term by the coefficient of $y$, including the constant.' },
            ]),
            SI_HINT,
          ),
        ],
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
        steps: [
          {
            // the slope is shown in lowest terms, so clear its own denominator
            prompt: [p(`Clear the fraction: multiply every term on both sides by $${Q(m.den).toTex()}$. The equation becomes $${Q(m.den).toTex()}y = \\;?$ Type the right side.`)],
            answer: { kind: 'expression', value: linearPlain(Q(m.num), b.mul(Q(m.den))), variables: ['x'] },
            inputHint: 'Type an expression in x, like 3x - 8.',
            hints: [
              'Standard form needs integer coefficients, so the fraction has to go.',
              `Multiplying by the denominator, $${Q(m.den).toTex()}$, cancels the fraction.`,
              `Multiply the $x$-term: $${Q(m.den).toTex()}\\cdot ${m.toTex()}x$.`,
              `Do not forget to multiply the constant $${b.toTex()}$ by $${Q(m.den).toTex()}$ as well.`,
            ],
            misconceptions: [{ answer: linearPlain(Q(m.num), b), tag: 'arithmetic-error' as const, feedback: 'Multiply **every** term by the denominator, including the constant.' }],
            explanation: 'Multiplying both sides by the same number keeps the equation true and clears the fraction.',
          },
          finalStep(
            'Now move the $x$-term to the left side and write the equation in standard form with $A$ positive.',
            { kind: 'equation', value: standardPlain(A, B, C), form: 'standard' },
            [
              'Standard form is $Ax + By = C$: both variable terms on the left, the constant on the right.',
              `${m.isNegative() ? 'Add' : 'Subtract'} $${Q(m.num).abs().toTex()}x$ on both sides.`,
              'If the $x$ coefficient is negative, multiply every term by $-1$.',
              'If all three numbers share a factor, divide it out.',
            ],
            'Moving the $x$-term keeps the equation balanced, and multiplying every term by $-1$ (if needed) makes $A$ positive without changing the line.',
            [{ answer: standardPlain(Q(m.num), Q(m.den), b.mul(Q(m.den))), tag: 'sign-error' as const, feedback: 'When you move the $x$-term to the other side, its sign changes.' }].filter((mc) => !equationsEquivalent(parseRelation(mc.answer), parseRelation(standardPlain(A, B, C)))),
            'Type an equation like 3x + 4y = 12.',
          ),
        ],
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
        steps: [
          {
            prompt: [p(`Distribute the slope on the right side. What is $${m.toTex()}(${x1.isNegative() ? 'x + ' + x1.abs().toTex() : 'x - ' + x1.toTex()})$ without parentheses?`)],
            answer: { kind: 'expression', value: linearPlain(m, m.mul(x1).neg()), variables: ['x'] },
            inputHint: 'Type an expression in x.',
            hints: [
              'Distributing means multiplying the number outside by each term inside.',
              `Multiply $${m.toTex()}$ by $x$.`,
              `Multiply $${m.toTex()}$ by $${sub(x1.neg())}$.`,
              'A negative times a negative is positive.',
            ],
            misconceptions: m.eq(1) ? [] : [{ answer: linearPlain(m, x1.neg()), tag: 'distribution' as const, feedback: 'Multiply the slope by **both** terms in the parentheses.' }],
            explanation: 'The distributive property multiplies the slope by each term inside the parentheses.',
          },
          finalStep(
            `Now ${y1.isNegative() ? 'subtract ' + y1.abs().toTex() : 'add ' + y1.toTex()} on both sides and write $y = mx + b$.`,
            { kind: 'equation', value: yEq(m, b), form: 'slope-intercept' },
            ['Get $y$ by itself on the left.', `Undo the ${y1.isNegative() ? '$+' + y1.abs().toTex() + '$' : '$-' + y1.toTex() + '$'} next to $y$ by doing the opposite.`, 'Combine the two constant terms on the right.', 'Write the $x$-term first.'],
            'Doing the same to both sides keeps the equation balanced and leaves $y$ alone.',
            lineMisconceptions({ m, b }, [{ m, b: m.mul(x1).neg().sub(y1), tag: 'sign-error', feedback: 'To undo subtracting on the left, add on both sides.' }]),
            SI_HINT,
          ),
        ],
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
    if (!equationsEquivalent(parseRelation(ref), parseRelation(pr.answer.value))) return ['answer is not equivalent to the given line'];
    if (!given || !pr.steps) return [];
    // steps: the first step is the right side after one move, rebuilt from the given equation's coefficients
    const r = parseRelation(ref);
    const lhs = toPoly(r.lhs);
    const rhs = toPoly(r.rhs);
    let first: string;
    if (pr.answer.form === 'standard') {
      // y = mx + b: multiply the right side by the denominator of the slope
      const den = rhs.coeff('x', 1).den;
      first = `${den}*(${ref.split('=')[1]})`;
    } else if (!lhs.coeff('x', 1).isZero()) {
      // Ax + By = C: the y-term equals C - Ax
      first = `${rhs.evaluate({ x: Q(0), y: Q(0) }).toString()} - (${lhs.coeff('x', 1).toString()})*x`;
    } else first = ref.split('=')[1]; // point-slope: the right side, distributed
    return stepErrors(pr, [first, null]);
  },
};

// ---------------------------------------------------------------------------
// S1.09: intercepts
// ---------------------------------------------------------------------------

const X_ZERO = '$x = 0$';
const Y_ZERO = '$y = 0$';

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
      steps: [
        choiceStep(
          `At the ${which}, which variable equals 0?`,
          [X_ZERO, Y_ZERO],
          askX ? 1 : 0,
          [
            askX ? 'The $x$-intercept is the point where the line crosses the $x$-axis.' : 'The $y$-intercept is the point where the line crosses the $y$-axis.',
            askX ? 'Think of any point on the $x$-axis, like $(5, 0)$. What is its height?' : 'Think of any point on the $y$-axis, like $(0, 5)$. How far left or right is it?',
            askX ? 'Points on the $x$-axis have height 0.' : 'Points on the $y$-axis are 0 units left or right of the origin.',
            'The variable that is 0 is the one the intercept is NOT named after.',
          ],
          askX ? 'Every point on the $x$-axis has height 0, so $y = 0$ there.' : 'Every point on the $y$-axis is 0 units from the origin left or right, so $x = 0$ there.',
          [{ index: askX ? 0 : 1, tag: 'graph-reading', feedback: askX ? 'Points on the $x$-axis can have any $x$-value; it is their $y$-value that is 0.' : 'Points on the $y$-axis can have any $y$-value; it is their $x$-value that is 0.' }],
        ),
        numStep(
          askX ? 'Substitute $y = 0$ into the equation and solve. What is $x$?' : 'Substitute $x = 0$ into the equation and solve. What is $y$?',
          askX ? xInt : yInt,
          askX
            ? ['Replace $y$ with 0. That term disappears.', difficulty === 1 ? 'You get $0 = mx + b$. Undo the constant first.' : `You get $${A.toTex()}x = ${C.toTex()}$.`, difficulty === 1 ? 'Then divide by the slope.' : `Divide both sides by $${A.toTex()}$.`, 'A fraction answer is fine.']
            : ['Replace $x$ with 0. That term disappears.', difficulty === 1 ? 'In $y = mx + b$, what is left when $x = 0$?' : `You get $${B.toTex()}y = ${C.toTex()}$.`, difficulty === 1 ? 'Only the constant term is left.' : `Divide both sides by $${B.toTex()}$.`, 'A fraction answer is fine.'],
          askX ? 'With $y = 0$ only the $x$-term and the constant are left, so solving gives the crossing point on the $x$-axis.' : 'With $x = 0$ the $x$-term vanishes, so what is left gives the crossing point on the $y$-axis.',
          askX
            ? [
                { value: xInt.neg(), tag: 'sign-error', feedback: 'Check the signs when you solve for $x$.' },
                { value: yInt, tag: 'graph-reading', feedback: 'That is where the line crosses the $y$-axis. Use $y = 0$ to find the $x$-intercept.' },
              ]
            : [{ value: yInt.neg(), tag: 'sign-error', feedback: 'Check the signs when you solve for $y$.' }],
          'Fractions are fine.',
        ),
        finalStep(
          'Write the intercept as an ordered pair.',
          { kind: 'point', x: numStr(key.x), y: numStr(key.y) },
          ['An ordered pair is $(x, y)$.', askX ? 'You found $x$; the other coordinate is 0.' : 'You found $y$; the other coordinate is 0.', askX ? 'The $x$-intercept has the form $(x, 0)$.' : 'The $y$-intercept has the form $(0, y)$.', 'Put the $x$-coordinate first.'],
          askX ? 'The $x$-intercept is the point $(x, 0)$ where the line meets the $x$-axis.' : 'The $y$-intercept is the point $(0, y)$ where the line meets the $y$-axis.',
          askX ? [{ answer: `(0, ${numStr(xInt)})`, tag: 'graph-reading' as const, feedback: 'Put the coordinates in order: $x$ first, then $y$.' }].filter(() => !xInt.isZero()) : [{ answer: `(${numStr(yInt)}, 0)`, tag: 'graph-reading' as const, feedback: 'Put the coordinates in order: $x$ first, then $y$.' }].filter(() => !yInt.isZero()),
          'Type an ordered pair like (4, 0).',
        ),
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
    // steps: solve L(t) = R(t) on the axis, from the equation's values at two points
    const askX = ask.includes('$x$-intercept');
    const g = (t: Rational) => {
      const pt = askX ? { x: t, y: Q(0) } : { x: Q(0), y: t };
      return toPoly(r.lhs).evaluate(pt).sub(toPoly(r.rhs).evaluate(pt));
    };
    const root = g(Q(0)).neg().div(g(Q(1)).sub(g(Q(0))));
    errs.push(...stepErrors(pr, [askX ? Y_ZERO : X_ZERO, root, null]));
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
    if (difficulty === 1 && rng.int(0, 2) === 0) return pointMeaningProblem(rng);
    const vertical = difficulty === 1;
    const ctx = buildContext(rng, vertical ? ['gym', 'savings', 'hike', 'tank', 'battery'] : [...DECREASING_KEYS, 'carwash']);
    const { f, v, m, b } = ctx;
    const story = `${ctx.setup} The function $${f}(${v}) = ${linearTex(m, b, v, true)}$ gives ${ctx.outputDesc}.`;
    if (vertical) {
      return makeProblem({
        skillId: 'S1.09',
        tags: ['real-world', 'word'],
        prompt: [p(story), p(`What is the vertical intercept, $${f}(0)$? It tells you ${ctx.outputDesc.replace(/,? (after|for a) .*/, '').replace(/, in [a-z]+$/, '')} at the start.`)],
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
        steps: [
          numStep(
            `The vertical intercept is on the vertical axis. What is the input $${v}$ at every point on that axis?`,
            Q(0),
            ['The vertical axis is where the horizontal distance is zero.', `The input $${v}$ is measured along the horizontal axis.`, 'A point on the vertical axis has not moved left or right at all.', `So how many ${ctx.inUnits} have passed there?`],
            `Points on the vertical axis have input 0, which is the start of the situation.`,
            [{ value: b, tag: 'graph-reading', feedback: 'That is an output. The question asks for the input on the vertical axis.' }],
          ),
          finalStep(
            `Substitute $${v} = 0$ into the rule. What is $${f}(0)$?`,
            { kind: 'number', value: numStr(b), unit: ctx.outUnit },
            [`Replace $${v}$ with 0.`, `$${decTex(m)} \\cdot 0 = 0$.`, 'Only the constant term is left.', 'Keep the sign of the constant.'],
            `Any rate times 0 is 0, so $${f}(0)$ is just the constant term: ${ctx.startMeaning}.`,
            m.eq(b) ? [] : [{ answer: numStr(m), tag: 'graph-reading', feedback: 'That is the rate. Multiply it by 0 and keep the constant.' }],
          ),
        ],
      });
    }
    const zero = b.neg().div(m);
    if (ctx.key === 'carwash' && !zero.isInteger()) {
      // cars come in whole numbers: the break-even point itself is not a possible count, so ask for the least whole number of cars
      const need = Q(Math.ceil(zero.toNumber()));
      const below = need.sub(1);
      const rule = linearTex(m, b, v, true);
      return makeProblem({
        skillId: 'S1.09',
        tags: ['real-world', 'word'],
        prompt: [p(story), p(`The band breaks even when the profit is \\$0. What is the least whole number of cars the band must wash so that it breaks even or makes a profit?`)],
        answer: { kind: 'number', value: numStr(need), unit: ctx.inUnits },
        inputHint: `Type a whole number of ${ctx.inUnits}.`,
        hints: [
          'Breaking even means the profit is 0: that is the horizontal intercept of the profit function.',
          `Set the rule equal to 0: $${rule} = 0$, and solve for $${v}$.`,
          'The solution is not a whole number, but the band can only wash whole cars.',
          'Round to a whole number in the direction that makes the profit at least \\$0, then check that number and the one just below it in the rule.',
        ],
        solution: [
          { text: 'Set the profit equal to 0.', tex: `${rule} = 0`, why: 'Breaking even means the money brought in equals the cost of supplies, so the profit is 0.' },
          { text: `Add $${decTex(b.abs())}$, then divide by $${decTex(m)}$.`, tex: `${v} = \\dfrac{${decTex(b.abs())}}{${decTex(m)}} = ${decTex(zero)}`, why: 'Undo the subtraction, then undo the multiplication.' },
          { text: 'Choose a whole number of cars.', tex: `${f}(${decTex(below)}) = ${decTex(m.mul(below).add(b))} < 0, \\quad ${f}(${decTex(need)}) = ${decTex(m.mul(need).add(b))} \\ge 0`, why: `A fraction of a car is not possible. With ${decTex(below)} cars the band is still losing money, so it must wash ${decTex(need)} cars. Here you always round up, even when the decimal part is less than one half.` },
        ],
        misconceptions: numberMisconceptions(need, [
          { value: below, tag: 'other', feedback: 'Check the profit for that many cars: it is still below \\$0. Round so that the band does not lose money.' },
          { value: b.abs(), tag: 'graph-reading', feedback: 'That is the cost of supplies, the starting value. Find how many cars make the profit reach 0.' },
        ]),
        steps: [
          numStep(
            `Set the profit equal to 0: $${rule} = 0$. Add $${decTex(b.abs())}$ to both sides. What does $${linearTex(m, 0, v, true)}$ equal?`,
            b.neg(),
            ['Undo the subtraction first.', `Adding $${decTex(b.abs())}$ to $0$ gives the right side.`, 'Do the same to both sides to keep the equation balanced.', 'The supplies cost has to be earned back.'],
            `Adding the supply cost to both sides shows how much money the cars must bring in.`,
            [{ value: b, tag: 'sign-error', feedback: 'Adding to 0 gives a positive number here.' }],
          ),
          numStep(
            `Divide by $${decTex(m)}$. What is $${v}$? (A fraction or decimal is fine here.)`,
            zero,
            [`Divide both sides by $${decTex(m)}$.`, `Work out $${decTex(b.abs())} \\div ${decTex(m)}$.`, 'It will not be a whole number.', 'You can type a fraction like 15/2.'],
            `Dividing by the price per car gives the exact break-even number of cars, which is not a whole number.`,
            [{ value: b.abs().mul(m), tag: 'inverse-operation', feedback: 'To undo multiplying, divide.' }],
            'Type a fraction or decimal.',
          ),
          finalStep(
            'The band can only wash whole cars. What is the least whole number of cars that breaks even or makes a profit?',
            { kind: 'number', value: numStr(need), unit: ctx.inUnits },
            ['The break-even number is between two whole numbers.', 'Rounding down leaves the band a little short of \\$0.', 'Round up to the next whole number.', 'Check the profit for your number of cars: it should be \\$0 or more.'],
            `With ${decTex(below)} cars the profit is still negative, so the band needs the next whole number of cars.`,
            numberMisconceptions(need, [{ value: below, tag: 'other', feedback: 'Check the profit for that many cars: it is still below \\$0. Round up.' }]),
            `Type a whole number of ${ctx.inUnits}.`,
          ),
        ],
      });
    }
    const zeroText = ctx.key === 'carwash' ? 'the band breaks even (profit is \\$0)' : `${ctx.outputDesc.replace(/,? (after|for a) .*/, '').replace(/, in [a-z]+$/, '')} reaches 0`;
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
      steps: [
        numStep(
          `Set the output to 0: $${linearTex(m, b, v, true)} = 0$. ${b.isNegative() ? 'Add' : 'Subtract'} $${decTex(b.abs())}$ on both sides. What does $${linearTex(m, 0, v, true)}$ equal?`,
          b.neg(),
          ['The horizontal intercept is where the output is 0.', 'Undo the constant term first.', `${b.isNegative() ? 'Adding' : 'Subtracting'} $${decTex(b.abs())}$ from 0 gives the right side.`, 'Do the same to both sides.'],
          'Removing the constant from both sides keeps the equation balanced and leaves the rate term alone.',
          [{ value: b, tag: 'sign-error', feedback: 'Do the opposite of the constant term: check the sign.' }],
        ),
        finalStep(
          `Divide both sides by $${decTex(m)}$. What is $${v}$?`,
          { kind: 'number', value: numStr(zero), unit: ctx.inUnits },
          [`Divide $${decTex(b.neg())}$ by $${decTex(m)}$.`, 'A negative divided by a negative is positive.', 'Decimals and fractions are fine.', `The answer is a number of ${ctx.inUnits}, so it should be positive.`],
          `Dividing undoes multiplying by the rate, so this is when ${zeroText}.`,
          numberMisconceptions(zero, [{ value: zero.neg(), tag: 'sign-error', feedback: 'Check the sign: a negative divided by a negative is positive.' }]),
          `Type the number of ${ctx.inUnits}.`,
        ),
      ],
    });
  },
  verify(pr) {
    const graph = pr.prompt.find((b) => b.t === 'graph') as { spec: GraphSpec } | undefined;
    if (graph) {
      if (pr.answer.kind !== 'choice') return ['wrong kind'];
      const ask = (pr.prompt[2] as { text: string }).text;
      const pm = /the point \$\((-?[\d.]+), (-?[\d.]+)\)\$/.exec(ask);
      if (!pm) return ['cannot parse point'];
      const [px, py] = [Rational.parse(pm[1]), Rational.parse(pm[2])];
      const drawn = toPoly(parseExpression(graph.spec.functions![0].expr));
      const errs: string[] = [];
      if (!drawn.evaluate({ x: px }).eq(py)) errs.push('point is not on the graph');
      if (!graph.spec.xLabel || !graph.spec.yLabel) errs.push('context graph needs axis labels');
      if (px.isNegative() || py.isNegative()) errs.push('point outside the situation');
      // the right statement names the input then the output, as a single moment (no "every")
      const fits = pr.answer.options.filter((o) => !/\bevery\b/.test(o.label) && numbersInOrder(o.label).join(',') === `${px},${py}`);
      if (fits.length !== 1) errs.push(`${fits.length} statements fit the point`);
      else if (fits[0].id !== pr.answer.correct) errs.push('keyed statement does not fit the point');
      errs.push(...stepErrors(pr, [`$${px.toString()}$`, null]));
      return errs;
    }
    if (pr.answer.kind !== 'number') return ['wrong kind'];
    const story = (pr.prompt[0] as { text: string }).text;
    const rm = /\$([A-Z])\(([a-z])\) = (.+?)\$ gives/.exec(story);
    if (!rm) return ['cannot parse'];
    const poly = toPoly(parseExpression(texToExpr(rm[3])));
    const ans = Rational.parse(pr.answer.value);
    const ask = (pr.prompt[1] as { text: string }).text;
    if (ask.includes('vertical intercept')) return poly.evaluate({ [rm[2]]: Q(0) }).eq(ans) ? stepErrors(pr, [Q(0), poly.evaluate({ [rm[2]]: Q(0) })]) : ['f(0) mismatch'];
    // horizontal intercepts: the rate term must equal minus the constant, then divide by the rate
    const c0 = poly.evaluate({ [rm[2]]: Q(0) });
    const rate = poly.evaluate({ [rm[2]]: Q(1) }).sub(c0);
    if (ask.includes('least whole number')) {
      // independent check: the answer is a whole number with profit >= 0, and one fewer gives a loss
      const errs: string[] = [];
      if (!ans.isInteger() || ans.isNegative()) errs.push('not a whole number');
      if (poly.evaluate({ [rm[2]]: ans }).isNegative()) errs.push('profit still negative');
      if (!poly.evaluate({ [rm[2]]: ans.sub(1) }).isNegative()) errs.push('a smaller count already breaks even');
      errs.push(...stepErrors(pr, [c0.neg(), c0.neg().div(rate), null]));
      return errs;
    }
    if (!poly.evaluate({ [rm[2]]: ans }).isZero()) return ['f(answer) is not 0'];
    return ans.isNegative() ? ['negative input'] : stepErrors(pr, [c0.neg(), null]);
  },
};

// ---------------------------------------------------------------------------
// S1.10: increasing / decreasing, positive / negative intervals
// ---------------------------------------------------------------------------

const LETTERS = ['A', 'B', 'C', 'D'] as const;
const INCREASING = 'Increasing';
const DECREASING = 'Decreasing';

/** "Which graph shows y = mx + b?": four labeled line graphs, one of them right. */
function whichGraphProblem(rng: Rng): Problem {
  const m = Q(rng.nonzeroInt(-3, 3));
  let b = Q(rng.nonzeroInt(-4, 4));
  if (b.abs().eq(m.abs())) b = b.isNegative() ? b.sub(1) : b.add(1);
  if (b.abs().gt(4)) b = b.isNegative() ? Q(-1) : Q(1);
  if (b.abs().eq(m.abs())) b = b.isNegative() ? b.sub(1) : b.add(1);
  // the right line plus three common mix-ups (all four are different lines)
  const lines: Array<{ m: Rational; b: Rational; feedback: string }> = [
    { m, b, feedback: '' },
    { m: m.neg(), b, feedback: 'That line crosses the $y$-axis in the right place, but check the direction: a positive slope rises from left to right, and a negative slope falls.' },
    { m, b: b.neg(), feedback: 'That line has the right steepness, but check where it crosses the $y$-axis. The $y$-intercept is the constant term, sign included.' },
    { m: b, b: m, feedback: 'That line has the slope and the $y$-intercept switched. The number multiplying $x$ is the slope.' },
  ];
  const order = rng.shuffle([0, 1, 2, 3]);
  const graphs: Block[] = order.map((k, pos) => {
    const l = lines[k];
    const spec: GraphSpec = {
      xMin: -6,
      xMax: 6,
      yMin: -5,
      yMax: 5,
      xLabel: 'x',
      yLabel: 'y',
      functions: [{ expr: linearPlain(l.m, l.b) }],
      ariaLabel: `Graph ${LETTERS[pos]}: a line crossing the y-axis at (0, ${l.b.toString()}) and passing through (1, ${l.m.add(l.b).toString()}).`,
    };
    return { t: 'graph', spec, caption: `Graph ${LETTERS[pos]}` };
  });
  const correct = LETTERS[order.indexOf(0)];
  const rule = linearTex(m, b);
  return makeProblem({
    skillId: 'S1.10',
    tags: ['graph'],
    prompt: [p(`Which graph shows $y = ${rule}$?`), ...graphs],
    answer: { kind: 'choice', options: LETTERS.map((L) => ({ id: L, label: `Graph ${L}` })), correct },
    hints: [
      'Use the two numbers in $y = mx + b$: $b$ tells you where the line crosses the $y$-axis, and $m$ tells you how steep it is and which way it goes.',
      `Find the $y$-intercept: the line must pass through $(0, ${b.toTex()})$. Cross out any graph that does not.`,
      `Now check the slope $${m.toTex()}$: from the $y$-intercept, move 1 to the right and ${m.isNegative() ? 'down' : 'up'} ${m.abs().toTex()}.`,
      'Check one more point on your choice: substitute its $x$-value into the equation and compare with the graph.',
    ],
    solution: [
      { text: 'Read the slope and the $y$-intercept from the equation.', tex: `m = ${m.toTex()}, \\quad b = ${b.toTex()}`, why: 'In $y = mx + b$, the coefficient of $x$ is the slope and the constant is the $y$-intercept.' },
      { text: `Look for a line through $(0, ${b.toTex()})$ that ${m.isNegative() ? 'falls' : 'rises'} ${m.abs().toTex()} for every 1 step right.`, tex: `(0, ${b.toTex()}) \\to (1, ${m.add(b).toTex()})`, why: `When $x = 1$, $y = ${m.toTex()}(1) ${b.isNegative() ? '-' : '+'} ${b.abs().toTex()} = ${m.add(b).toTex()}$.` },
      { text: `Graph ${correct} is the only graph through both points.`, why: 'The other graphs have the wrong slope sign, the wrong intercept, or the slope and intercept switched.' },
    ],
    misconceptions: order
      .map((k, pos) => ({ k, id: LETTERS[pos] }))
      .filter((o) => o.k !== 0)
      .map((o) => ({ answer: o.id, tag: o.k === 3 ? ('formula-error' as const) : o.k === 1 ? ('sign-error' as const) : ('graph-reading' as const), feedback: lines[o.k].feedback })),
    steps: [
      numStep(
        `Read the equation $y = ${rule}$. What is the $y$-intercept $b$?`,
        b,
        ['In $y = mx + b$, the $y$-intercept is the constant term.', 'It is the number that is not multiplied by $x$.', 'Keep its sign: a minus sign in front of the constant makes $b$ negative.', 'It is the $y$-value where the line crosses the $y$-axis.'],
        `When $x = 0$ the $x$-term is 0, so the line crosses the $y$-axis at $(0, ${b.toTex()})$.`,
        [
          { value: m, tag: 'formula-error', feedback: 'That number multiplies $x$, so it is the slope. The $y$-intercept is the constant term.' },
          { value: b.neg(), tag: 'sign-error', feedback: 'Keep the sign of the constant term.' },
        ],
      ),
      numStep(
        'What is the slope $m$?',
        m,
        ['In $y = mx + b$, the slope is the number multiplied by $x$.', 'If there is only a minus sign in front of $x$, the slope is $-1$.', 'If nothing is written in front of $x$, the slope is 1.', 'A positive slope rises from left to right; a negative slope falls.'],
        `The slope $${m.toTex()}$ means the line ${m.isNegative() ? 'falls' : 'rises'} ${m.abs().toTex()} for every 1 step to the right.`,
        [
          { value: b, tag: 'formula-error', feedback: 'That is the constant term, the $y$-intercept. The slope multiplies $x$.' },
          { value: m.neg(), tag: 'sign-error', feedback: 'Keep the sign of the number in front of $x$.' },
        ],
      ),
      finalStep(
        `Find the graph that crosses the $y$-axis at $(0, ${b.toTex()})$ and has slope $${m.toTex()}$.`,
        { kind: 'choice', options: LETTERS.map((L) => ({ id: L, label: `Graph ${L}` })), correct },
        [`Cross out graphs that do not pass through $(0, ${b.toTex()})$.`, `From $(0, ${b.toTex()})$, move 1 right and ${m.isNegative() ? 'down' : 'up'} ${m.abs().toTex()}.`, `That point is $(1, ${m.add(b).toTex()})$. Which remaining graph passes through it?`, 'Exactly one graph passes through both points.'],
        'Two points fix a line, and only one graph passes through both the intercept and the point one step to the right.',
        order
          .map((k, pos) => ({ k, id: LETTERS[pos] }))
          .filter((o) => o.k !== 0)
          .map((o) => ({ answer: o.id, tag: o.k === 3 ? ('formula-error' as const) : o.k === 1 ? ('sign-error' as const) : ('graph-reading' as const), feedback: lines[o.k].feedback })),
      ),
    ],
  });
}

/** End behavior of a non-constant line: as x -> +/- infinity, f(x) -> +/- infinity. */
function endBehaviorProblem(rng: Rng): Problem {
  const m = Q(rng.nonzeroInt(-5, 5));
  const b = Q(rng.nonzeroInt(-9, 9));
  const right = rng.bool();
  const up = right !== m.isNegative();
  const xTo = right ? '\\infty' : '-\\infty';
  const opts = { up: '$f(x) \\to \\infty$', down: '$f(x) \\to -\\infty$', b: `$f(x) \\to ${b.toTex()}$`, zero: '$f(x) \\to 0$' };
  const answer = makeChoice(rng, up ? opts.up : opts.down, [up ? opts.down : opts.up, opts.b, opts.zero]);
  const idOf = (label: string) => answer.options.find((o) => o.label === label)!.id;
  const rule = linearTex(m, b);
  return makeProblem({
    skillId: 'S1.10',
    tags: [],
    prompt: [p(`End behavior describes what happens to the outputs at the far ends of the graph. For $f(x) = ${rule}$, as $x \\to ${right ? '\\infty' : '-\\infty'}$, what happens to $f(x)$?`)],
    answer,
    hints: [
      `"$x \\to ${right ? '\\infty' : '-\\infty'}$" means $x$ keeps getting ${right ? 'larger (moving right forever)' : 'more negative (moving left forever)'}.`,
      'For a line, only the slope matters far away. The constant term is quickly outweighed.',
      `The slope is $${m.toTex()}$, so the line ${m.isNegative() ? 'falls' : 'rises'} as you move right${right ? '' : ', which means it does the opposite as you move left'}.`,
      `Try a big input: substitute $x = ${right ? '1000' : '-1000'}$ and look at the sign and size of the output.`,
    ],
    solution: [
      { text: 'Find the slope.', tex: `m = ${m.toTex()}`, why: `A ${m.isNegative() ? 'negative' : 'positive'} slope means the line ${m.isNegative() ? 'falls' : 'rises'} from left to right.` },
      { text: 'Test a far-away input.', tex: `f(${right ? '1000' : '-1000'}) = ${m.toTex()}(${right ? '1000' : '-1000'}) ${b.isNegative() ? '-' : '+'} ${b.abs().toTex()} = ${m.mul(right ? 1000 : -1000).add(b).toTex()}`, why: 'Farther out, the output only gets bigger in size with the same sign; the line never levels off.' },
      { text: 'State the end behavior.', tex: `\\text{As } x \\to ${xTo},\\ f(x) \\to ${up ? '\\infty' : '-\\infty'}` },
    ],
    misconceptions: [
      { answer: idOf(up ? opts.down : opts.up), tag: 'sign-error', feedback: `Check the direction: is $x$ moving left or right, and does the line rise or fall that way?` },
      { answer: idOf(opts.b), tag: 'graph-reading', feedback: 'That is the $y$-intercept, the output when $x = 0$. Far from 0, a line keeps going up or down forever.' },
      { answer: idOf(opts.zero), tag: 'graph-reading', feedback: 'A non-horizontal line never levels off toward a number. Substitute a very large input and look at the output.' },
    ],
    steps: [
      numStep(
        `What is the slope of $f(x) = ${rule}$?`,
        m,
        ['The slope is the number multiplied by $x$.', 'It tells you how much $f(x)$ changes for each step of 1 to the right.', 'Keep its sign.', 'The constant term is not the slope.'],
        `The slope $${m.toTex()}$ means the line ${m.isNegative() ? 'falls' : 'rises'} as you move right.`,
        [
          { value: b, tag: 'graph-reading', feedback: 'That is the $y$-intercept. The slope multiplies $x$.' },
          { value: m.neg(), tag: 'sign-error', feedback: 'Keep the sign of the number in front of $x$.' },
        ],
      ),
      numStep(
        `Test a far-away input. What is $f(${right ? '1000' : '-1000'})$?`,
        m.mul(right ? 1000 : -1000).add(b),
        [`Substitute $x = ${right ? '1000' : '-1000'}$.`, `Multiply $${m.toTex()}$ by $${right ? '1000' : '-1000'}$ first.`, `Then ${b.isNegative() ? 'subtract ' + b.abs().toTex() : 'add ' + b.toTex()}.`, 'Look at the sign and size of the result.'],
        'The output is far from 0, because the slope term grows without limit while the constant stays small.',
        [{ value: m.mul(right ? -1000 : 1000).add(b), tag: 'sign-error', feedback: `Check the sign of the input: $x$ is moving ${right ? 'right (positive)' : 'left (negative)'}.` }],
      ),
      finalStep(
        `So as $x \\to ${right ? '\\infty' : '-\\infty'}$, what happens to $f(x)$?`,
        answer,
        ['Use the sign of the output you just found.', 'A huge positive output means the graph heads up forever.', 'A huge negative output means the graph heads down forever.', 'A line never levels off unless its slope is 0.'],
        `Inputs even farther out give outputs even farther from 0 with the same sign, so $f(x) \\to ${up ? '\\infty' : '-\\infty'}$.`,
        [
          { answer: idOf(up ? opts.down : opts.up), tag: 'sign-error', feedback: 'Look at the sign of the output you found for the far-away input.' },
          { answer: idOf(opts.b), tag: 'graph-reading', feedback: 'That is the $y$-intercept, the output at $x = 0$, not far away.' },
        ],
      ),
    ],
  });
}

/** Maximum or minimum of a linear function on a closed interval. */
function maxMinProblem(rng: Rng): Problem {
  const den = rng.pick([1, 1, 2]);
  let num = rng.nonzeroInt(-4, 4);
  while (den === 2 && num % 2 === 0) num = rng.nonzeroInt(-5, 5);
  const m = Q(num, den);
  const b = Q(rng.int(-6, 6));
  const lo = den * rng.int(-4, 0);
  const hi = lo + den * rng.int(2, 4);
  const askMax = rng.bool();
  const [fLo, fHi] = [m.mul(lo).add(b), m.mul(hi).add(b)];
  const best = askMax ? (fLo.gt(fHi) ? fLo : fHi) : fLo.lt(fHi) ? fLo : fHi;
  const atX = best.eq(fLo) ? lo : hi;
  const otherVal = best.eq(fLo) ? fHi : fLo;
  const word = askMax ? 'maximum' : 'minimum';
  const bracket = rng.bool();
  const ivTex = bracket ? `the interval $[${lo}, ${hi}]$` : `the interval $${lo} \\le x \\le ${hi}$`;
  const rule = linearTex(m, b);
  return makeProblem({
    skillId: 'S1.10',
    tags: ['multi-step'],
    prompt: [p(`The function $f(x) = ${rule}$ is used only on ${ivTex}. What is the ${word} value of $f(x)$ on this interval?`)],
    answer: { kind: 'number', value: numStr(best) },
    hints: [
      `A line always rises or falls steadily (or stays flat), so its ${word} on a closed interval happens at one of the two endpoints.`,
      `Is the slope $${m.toTex()}$ positive or negative? That tells you whether $f$ is increasing or decreasing on the interval.`,
      `Evaluate $f(${lo})$ and $f(${hi})$.`,
      `The ${word} value is the ${askMax ? 'larger' : 'smaller'} of those two outputs. Give the output, not the $x$-value.`,
    ],
    solution: [
      { text: 'Decide which way the line goes.', tex: `m = ${m.toTex()}`, why: `The slope is ${m.isNegative() ? 'negative, so $f$ is decreasing: the largest output is at the left end and the smallest at the right end' : 'positive, so $f$ is increasing: the smallest output is at the left end and the largest at the right end'}.` },
      { text: 'Evaluate both endpoints.', tex: `f(${lo}) = ${fLo.toTex()}, \\quad f(${hi}) = ${fHi.toTex()}`, why: 'Every other input in the interval gives an output between these two.' },
      { text: `The ${word} value is $${best.toTex()}$, at $x = ${atX}$.`, tex: `\\text{${word}} = ${best.toTex()}`, why: `It is the ${askMax ? 'larger' : 'smaller'} endpoint output.` },
    ],
    misconceptions: numberMisconceptions(best, [
      { value: otherVal, tag: 'graph-reading', feedback: `That is the output at the other endpoint. Check whether $f$ is increasing or decreasing, and which end gives the ${askMax ? 'largest' : 'smallest'} output.` },
      { value: Q(atX), tag: 'graph-reading', feedback: `That is the $x$-value where the ${word} happens. The question asks for the ${word} **value** of $f(x)$, the output.` },
    ]),
    steps: [
      numStep(`Evaluate the left endpoint. What is $f(${lo})$?`, fLo, [`Substitute $x = ${lo}$.`, 'Multiply first.', 'Then add or subtract the constant.', 'Fractions are fine.'], 'A line is straight, so its extreme values on an interval happen at the endpoints; this is one of them.', [{ value: fLo.neg(), tag: 'sign-error', feedback: 'Check the signs when you substitute.' }]),
      numStep(`Evaluate the right endpoint. What is $f(${hi})$?`, fHi, [`Substitute $x = ${hi}$.`, 'Multiply first.', 'Then add or subtract the constant.', 'Fractions are fine.'], 'This is the output at the other endpoint.', [{ value: fHi.neg(), tag: 'sign-error', feedback: 'Check the signs when you substitute.' }]),
      finalStep(
        `Which output is the ${word} value of $f(x)$ on the interval?`,
        { kind: 'number', value: numStr(best) },
        ['Every output inside the interval is between the two endpoint outputs.', `The ${word} is the ${askMax ? 'larger' : 'smaller'} of the two.`, 'Compare them on a number line if they are negative.', 'Give the output, not the $x$-value.'],
        `A line rises or falls steadily, so the ${word} is the ${askMax ? 'larger' : 'smaller'} endpoint output.`,
        numberMisconceptions(best, [
          { value: otherVal, tag: 'graph-reading', feedback: `That is the ${askMax ? 'smaller' : 'larger'} of the two outputs.` },
          { value: Q(atX), tag: 'graph-reading', feedback: 'That is an $x$-value. Give the output.' },
        ]),
      ),
    ],
  });
}

export const genKeyFeatures: GeneratorDef = {
  id: 'u1.key-features',
  skillId: 'S1.10',
  description: 'Decide whether a linear function is increasing, decreasing or constant; match an equation to its graph; find where it is positive or negative; describe end behavior; find a maximum or minimum on an interval.',
  generate(rng, difficulty) {
    if (difficulty === 1 && rng.bool()) return whichGraphProblem(rng);
    if (difficulty === 2 && rng.int(0, 2) === 0) return endBehaviorProblem(rng);
    if (difficulty === 3 && rng.int(0, 2) === 0) return maxMinProblem(rng);
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
        misconceptions: choiceMisc(answer, [
          { label: 'Increasing', tag: 'sign-error', feedback: 'Trace the line from left to right. Increasing means it goes up as you move right. Does it?' },
          { label: 'Decreasing', tag: 'sign-error', feedback: 'Trace the line from left to right. Decreasing means it goes down as you move right. Does it?' },
          { label: 'Constant', tag: 'graph-reading', feedback: 'A constant function is a flat (horizontal) line. Is this line flat?' },
        ]),
        steps: [
          numStep(
            'Find the slope of the line. (Pick two points where the line crosses grid corners.)',
            m,
            ['Slope is rise over run.', `The line crosses the $y$-axis at $(0, ${b.toTex()})$.`, 'From a point where the line crosses grid corners, move 1 to the right along the line and see how far up or down it goes.', 'Going down counts as negative; a flat line has slope 0.'],
            m.isZero() ? 'The line is flat, so the rise is 0 and the slope is 0.' : `For each step right the line goes ${m.isNegative() ? 'down' : 'up'} ${m.abs().toTex()}, so the slope is $${m.toTex()}$.`,
            [
              { value: m.neg(), tag: 'sign-error', feedback: 'Check the direction: does the line go up or down as you move right?' },
              { value: b, tag: 'graph-reading', feedback: 'That is where the line crosses the $y$-axis. The slope is the rise for each step right.' },
            ],
          ),
          finalStep(
            'So is the function increasing, decreasing, or constant?',
            answer,
            ['Use the sign of the slope you found.', 'A positive slope means the outputs grow as $x$ grows.', 'A negative slope means the outputs shrink as $x$ grows.', 'A slope of 0 means the outputs stay the same.'],
            'The sign of the slope tells whether $y$ goes up, goes down, or stays the same as $x$ increases.',
          ),
        ],
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
      steps: [
        numStep(
          `Find the $x$-intercept: solve $${rule} = 0$. What is $x$?`,
          r,
          ['The $x$-intercept is where the output is 0.', 'Undo the constant term first.', 'Then divide by the slope.', 'A fraction answer is fine.'],
          'A line changes sign only where it crosses the $x$-axis, so this is the boundary of the interval.',
          [
            { value: r.neg(), tag: 'sign-error', feedback: 'Check the signs when you solve.' },
            { value: b, tag: 'graph-reading', feedback: 'That is the $y$-intercept. Solve $f(x) = 0$ for $x$.' },
          ],
          'Fractions are fine.',
        ),
        choiceStep(
          `Is $f$ increasing or decreasing?`,
          [INCREASING, DECREASING],
          m.isNegative() ? 1 : 0,
          ['Look at the slope, the number multiplied by $x$.', 'A positive slope rises from left to right.', 'A negative slope falls from left to right.', `The slope here is $${m.toTex()}$.`],
          `The slope $${m.toTex()}$ is ${m.isNegative() ? 'negative, so $f$ is decreasing' : 'positive, so $f$ is increasing'}.`,
          [{ index: m.isNegative() ? 0 : 1, tag: 'sign-error', feedback: 'Check the sign of the slope.' }],
        ),
        finalStep(
          `So over what interval is $f(x)$ ${word}?`,
          { kind: 'interval', value: iv },
          [
            `Start at the $x$-intercept $${r.toTex()}$.`,
            m.isNegative() ? 'A decreasing line is above the $x$-axis on the left and below it on the right.' : 'An increasing line is below the $x$-axis on the left and above it on the right.',
            `Pick the side where the outputs are ${word}.`,
            'Use a parenthesis at the intercept, because the output there is 0.',
          ],
          `On that side of $x = ${r.toTex()}$ every output is ${word}, and at the intercept itself the output is 0.`,
          [{ answer: other, tag: 'inequality-direction', feedback: `That side has the other sign. Substitute a test value.` }],
          'Type an interval like (2, ∞) or an inequality like x > 2.',
        ),
      ],
    });
  },
  verify(pr) {
    const text = (pr.prompt[0] as { text: string }).text;
    const wg = /^Which graph shows \$y = (.+?)\$\?$/.exec(text);
    if (wg) {
      if (pr.answer.kind !== 'choice') return ['wrong kind'];
      const target = toPoly(parseExpression(texToExpr(wg[1])));
      const graphs = pr.prompt.filter((b) => b.t === 'graph') as Array<{ spec: GraphSpec; caption?: string }>;
      if (graphs.length !== 4) return ['needs four graphs'];
      const same = (expr: string) => {
        const g = toPoly(parseExpression(expr));
        return [-2, 0, 3].every((x) => g.evaluate({ x: Q(x) }).eq(target.evaluate({ x: Q(x) })));
      };
      const matches = graphs.filter((g) => same(g.spec.functions![0].expr)).map((g) => (g.caption ?? '').replace('Graph ', ''));
      if (matches.length !== 1) return [`${matches.length} graphs match`];
      if (matches[0] !== pr.answer.correct) return ['keyed graph does not match'];
      const b0 = target.evaluate({ x: Q(0) });
      return stepErrors(pr, [b0, target.evaluate({ x: Q(1) }).sub(b0), null]);
    }
    const eb = /For \$f\(x\) = (.+?)\$, as \$x \\to (-?)\\infty\$/.exec(text);
    if (eb) {
      if (pr.answer.kind !== 'choice') return ['wrong kind'];
      const poly = toPoly(parseExpression(texToExpr(eb[1])));
      const far = Q(eb[2] === '-' ? -1000000 : 1000000);
      const v = poly.evaluate({ x: far });
      const v2 = poly.evaluate({ x: far.mul(2) });
      // growing without bound in one direction: the output keeps moving away from 0 with the same sign
      const goesUp = v.gt(0) && v2.gt(v);
      const goesDown = v.lt(0) && v2.lt(v);
      if (!goesUp && !goesDown) return ['no end behavior to infinity'];
      const label = choiceLabel(pr.answer);
      if (label !== (goesUp ? '$f(x) \\to \\infty$' : '$f(x) \\to -\\infty$')) return ['end behavior mismatch'];
      return stepErrors(pr, [poly.evaluate({ x: Q(1) }).sub(poly.evaluate({ x: Q(0) })), poly.evaluate({ x: Q(eb[2] === '-' ? -1000 : 1000) }), null]);
    }
    const mm2 = /\$f\(x\) = (.+?)\$ is used only on the interval \$(?:\[(-?\d+), (-?\d+)\]|(-?\d+) \\le x \\le (-?\d+))\$\. What is the (maximum|minimum)/.exec(text);
    if (mm2) {
      if (pr.answer.kind !== 'number') return ['wrong kind'];
      const poly = toPoly(parseExpression(texToExpr(mm2[1])));
      const lo = Q(mm2[2] ?? mm2[4]);
      const hi = Q(mm2[3] ?? mm2[5]);
      // sample the whole interval (13 evenly spaced inputs) and take the extreme output
      const outs = Array.from({ length: 13 }, (_, i) => poly.evaluate({ x: lo.add(hi.sub(lo).mul(i).div(12)) }));
      const best = outs.reduce((a, c) => (mm2[6] === 'maximum' ? (c.gt(a) ? c : a) : c.lt(a) ? c : a));
      if (!best.eq(Rational.parse(pr.answer.value))) return [`expected ${best}`];
      return stepErrors(pr, [outs[0], outs[12], best]);
    }
    if (pr.answer.kind === 'choice') {
      const g = pr.prompt.find((b) => b.t === 'graph') as { spec: { functions: Array<{ expr: string }> } };
      const poly = toPoly(parseExpression(g.spec.functions[0].expr));
      const slope = poly.evaluate({ x: Q(1) }).sub(poly.evaluate({ x: Q(0) }));
      const label = choiceLabel(pr.answer);
      const expect = slope.isZero() ? 'Constant' : slope.isNegative() ? 'Decreasing' : 'Increasing';
      if (label !== expect) return [`expected ${expect}`];
      return stepErrors(pr, [slope, expect]);
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
    // steps: the zero solved from two values of the rule, then the direction from the sign of the slope
    const p0 = poly.evaluate({ x: Q(0) });
    const sl = poly.evaluate({ x: Q(1) }).sub(p0);
    errs.push(...stepErrors(pr, [p0.neg().div(sl), sl.isNegative() ? DECREASING : INCREASING, null]));
    return errs;
  },
};

export const U1_LINEAR_GENERATORS = [genWriteSlopePoint, genWriteTwoPoints, genWriteContext, genConvertForms, genIntercepts, genInterceptsContext, genKeyFeatures];
