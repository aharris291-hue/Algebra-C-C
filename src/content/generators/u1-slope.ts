/**
 * Unit 1, Lesson 3 generators: slope as rate of change.
 * S1.05 slope from two points, a table or a graph. S1.06 rate of change with units in context.
 */
import type { GeneratorDef, Rng, Difficulty } from '../../core/curriculum/types';
import { Rational } from '../../core/math/rational';
import { linearPlain, decTex } from '../../core/math/format';
import { toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { Q, p, makeProblem, numberMisconceptions, numStr, sub, pickDistinct, makeChoice, choiceLabel, texToExpr } from './util';
import { buildContext, ctxStory, type LinearContext } from './u1-contexts';
import { numStep, finalStep, stepErrors, choiceMisc, minusHint, checkMinusHint } from './u1-steps';

const frac = (num: Rational, den: Rational) => `\\frac{${num.toTex()}}{${den.toTex()}}`;

function slopeMisconceptions(dy: Rational, dx: Rational) {
  const m = dy.div(dx);
  return numberMisconceptions(m, [
    { value: dy.isZero() ? null : dx.div(dy), tag: 'rise-run-swap', feedback: 'Slope is rise over run: the change in $y$ goes on top, the change in $x$ on the bottom.' },
    { value: m.neg(), tag: 'slope-calc', feedback: 'Check your order of subtraction. Subtract the coordinates in the same order on the top and the bottom.' },
    { value: dy, tag: 'slope-calc', feedback: 'That is the change in $y$ (the rise). Divide it by the change in $x$ (the run).' },
    { value: dx.isZero() || dy.isZero() ? null : dx.div(dy).neg(), tag: 'rise-run-swap', feedback: 'Put the change in $y$ on top, and keep the subtraction order the same on top and bottom.' },
  ]);
}

// ---------------------------------------------------------------------------
// S1.05: slope from two points
// ---------------------------------------------------------------------------

function pickPoints(rng: Rng, d: Difficulty): [number, number, number, number] {
  for (;;) {
    const lo = d === 1 ? 0 : -9;
    const x1 = rng.int(lo, 9);
    const x2 = rng.int(lo, 9);
    const y1 = rng.int(lo, 12);
    const y2 = rng.int(lo, 12);
    if (x1 === x2) continue;
    const m = Q(y2 - y1, x2 - x1);
    if (d === 1 && (!m.isInteger() || m.isZero() || m.isNegative() || x2 < x1)) continue;
    if (d === 2 && (m.isZero() || [x1, x2, y1, y2].every((v) => v >= 0))) continue;
    if (d === 3 && (m.isInteger() || [x1, x2, y1, y2].filter((v) => v < 0).length < 2)) continue;
    return [x1, y1, x2, y2];
  }
}

export const genSlopePoints: GeneratorDef = {
  id: 'u1.slope-points',
  skillId: 'S1.05',
  description: 'Find the slope of the line through two points.',
  generate(rng, difficulty) {
    // occasionally a horizontal line at the hardest level
    const flat = difficulty === 3 && rng.int(1, 6) === 1;
    let [x1, y1, x2, y2] = pickPoints(rng, difficulty);
    if (flat) y2 = y1;
    const dy = Q(y2 - y1);
    const dx = Q(x2 - x1);
    const m = dy.div(dx);
    const P1 = `(${x1}, ${y1})`;
    const P2 = `(${x2}, ${y2})`;
    return makeProblem({
      skillId: 'S1.05',
      tags: [],
      prompt: [p(`Find the slope of the line through $${P1}$ and $${P2}$.`)],
      answer: { kind: 'number', value: numStr(m) },
      inputHint: 'Type the slope. Use a fraction like -3/4 if it does not divide evenly.',
      hints: [
        'Slope measures steepness: how much $y$ changes for each 1-unit change in $x$. It is rise over run.',
        'Use $m = \\dfrac{y_2 - y_1}{x_2 - x_1}$. Pick one point to be first and keep that order on the top and the bottom.',
        `The rise is $${y2} - ${sub(Q(y1))}$. Work that out first.`,
        `The run is $${x2} - ${sub(Q(x1))}$. Divide the rise by the run and simplify the fraction.`,
      ],
      solution: [
        { text: 'Write the slope formula.', tex: 'm = \\dfrac{y_2 - y_1}{x_2 - x_1}', why: 'Slope is the change in $y$ divided by the change in $x$.' },
        { text: 'Substitute, keeping the same order on top and bottom.', tex: `m = \\dfrac{${y2} - ${sub(Q(y1))}}{${x2} - ${sub(Q(x1))}}`, why: `$${P2}$ is used first in both the numerator and the denominator.` },
        { text: 'Subtract.', tex: `m = ${frac(dy, dx)}`, why: y1 < 0 || x1 < 0 ? 'Subtracting a negative is the same as adding its opposite.' : 'Work out the top and the bottom separately.' },
        { text: 'Simplify.', tex: `m = ${m.toTex()}`, why: m.isZero() ? 'The rise is 0, so the line is horizontal and its slope is 0.' : m.isNegative() ? 'A negative slope means the line falls from left to right.' : 'A positive slope means the line rises from left to right.' },
      ],
      misconceptions: slopeMisconceptions(dy, dx),
      steps: [
        {
          prompt: [p(`Find the rise (change in $y$) from $${P1}$ to $${P2}$: $${y2} - ${sub(Q(y1))}$.`)],
          answer: { kind: 'number', value: numStr(dy) },
          hints: ['The rise is the second $y$-value minus the first $y$-value.', `Compute $${y2} - ${sub(Q(y1))}$.`, minusHint(y2, y1), checkMinusHint(y2, y1)],
          misconceptions: numberMisconceptions(dy, [{ value: dy.neg(), tag: 'sign-error', feedback: 'Subtract in the order shown: second minus first.' }]),
          explanation: `The rise is the change in $y$, second minus first, so it is $${dy.toTex()}$${dy.isNegative() ? ': the line goes down' : ''}.`,
        },
        {
          prompt: [p(`Find the run (change in $x$) in the same order: $${x2} - ${sub(Q(x1))}$.`)],
          answer: { kind: 'number', value: numStr(dx) },
          hints: ['The run uses the $x$-values, in the same order as the rise.', `Compute $${x2} - ${sub(Q(x1))}$.`, minusHint(x2, x1), checkMinusHint(x2, x1)],
          misconceptions: numberMisconceptions(dx, [{ value: dx.neg(), tag: 'sign-error', feedback: 'Keep the same order you used for the rise.' }]),
          explanation: `Subtracting the $x$-values in the same order as the $y$-values keeps the slope's sign right: the run is $${dx.toTex()}$.`,
        },
        {
          prompt: [p(`Divide: slope $= \\dfrac{\\text{rise}}{\\text{run}} = ${frac(dy, dx)}$. Simplify.`)],
          answer: { kind: 'number', value: numStr(m) },
          hints: ['Divide the rise by the run.', dy.isZero() ? 'The rise is 0: the line does not go up or down. Think about what 0 shared among any number of steps gives.' : dy.isNegative() || dx.isNegative() ? 'A negative divided by a positive is negative; a negative divided by a negative is positive.' : 'The rise and the run are both positive, so the slope is positive.', 'Simplify the fraction by dividing top and bottom by a common factor.', 'If it does not divide evenly, a simplified fraction is fine.'],
          misconceptions: slopeMisconceptions(dy, dx),
          explanation: `Rise over run is the change in $y$ for each 1-unit change in $x$, so the slope is $${m.toTex()}$.`,
        },
      ],
    });
  },
  verify(pr) {
    const text = (pr.prompt[0] as { text: string }).text;
    const pts = [...text.matchAll(/\((-?\d+), (-?\d+)\)/g)].map((mm) => [Number(mm[1]), Number(mm[2])]);
    if (pts.length !== 2 || pr.answer.kind !== 'number') return ['cannot parse points'];
    const [[a, b], [c, d]] = pts;
    if (a === c) return ['vertical line'];
    // reverse order on purpose: (y1 - y2)/(x1 - x2)
    const m = Q(b - d, a - c);
    if (!m.eq(Rational.parse(pr.answer.value))) return [`slope should be ${m}`];
    // steps go from the first listed point to the second
    return stepErrors(pr, [Q(d - b), Q(c - a), m]);
  },
};

// ---------------------------------------------------------------------------
// S1.05: slope (rate of change) from a table
// ---------------------------------------------------------------------------

export const genSlopeTable: GeneratorDef = {
  id: 'u1.slope-table',
  skillId: 'S1.05',
  description: 'Find the rate of change of a linear function from a table (x-steps may be uneven).',
  generate(rng, difficulty) {
    const tableDen = rng.pick([2, 3, 4]);
    let tableNum = rng.nonzeroInt(-7, 7);
    while (tableNum % tableDen === 0) tableNum = rng.nonzeroInt(-7, 7);
    const m = difficulty === 3 ? Q(tableNum, tableDen) : Q(rng.nonzeroInt(difficulty === 1 ? 1 : -8, 8));
    const step = difficulty === 1 ? rng.pick([1, 2]) : 0;
    let xs: number[];
    if (difficulty === 1) {
      const x0 = rng.int(0, 3);
      xs = [0, 1, 2, 3].map((k) => x0 + k * step);
    } else {
      const den = m.den === 1n ? 1 : Number(m.den);
      xs = pickDistinct(rng, 4, -4, 10)
        .map((v) => v * den)
        .sort((u, w) => u - w);
      // uneven steps are the point at levels 2-3; make sure the steps are not all equal
      if (xs[1] - xs[0] === xs[2] - xs[1] && xs[2] - xs[1] === xs[3] - xs[2]) xs[3] += den;
    }
    const b = Q(rng.int(-10, 15));
    const ys = xs.map((x) => m.mul(x).add(b));
    const dx = Q(xs[1] - xs[0]);
    const dy = ys[1].sub(ys[0]);
    return makeProblem({
      skillId: 'S1.05',
      tags: [],
      prompt: [
        p('The table shows values of a linear function.'),
        { t: 'table', headers: ['x', 'y'], rows: xs.map((x, k) => [String(x), ys[k].toString()]) },
        p('What is the rate of change (slope) of the function?'),
      ],
      answer: { kind: 'number', value: numStr(m) },
      inputHint: 'Type the slope. Fractions like 5/2 are fine.',
      hints: [
        'Rate of change $= \\dfrac{\\text{change in } y}{\\text{change in } x}$.',
        'Pick any two rows. Find how much $y$ changes and how much $x$ changes between them.',
        `From the first row to the second, $x$ changes by $${dx.toTex()}$. How much does $y$ change?`,
        difficulty === 1 ? 'Divide the change in $y$ by the change in $x$.' : 'The $x$-values do not go up by 1 each time, so you must divide by the change in $x$, not just read the change in $y$.',
      ],
      solution: [
        { text: 'Choose two rows, for example the first two.', tex: `(${xs[0]}, ${ys[0].toTex()}) \\text{ and } (${xs[1]}, ${ys[1].toTex()})`, why: 'For a linear function, any two rows give the same rate of change.' },
        { text: 'Find the changes.', tex: `\\Delta y = ${ys[1].toTex()} - ${sub(ys[0])} = ${dy.toTex()}, \\quad \\Delta x = ${xs[1]} - ${sub(Q(xs[0]))} = ${dx.toTex()}`, why: 'Subtract in the same order for $x$ and $y$.' },
        { text: 'Divide.', tex: `m = ${frac(dy, dx)} = ${m.toTex()}`, why: `$y$ changes by $${m.toTex()}$ for every 1-unit increase in $x$.` },
      ],
      misconceptions: numberMisconceptions(m, [
        { value: dx.eq(1) ? null : dy, tag: 'slope-calc', feedback: 'That is the change in $y$ between two rows. The $x$-values did not change by 1, so divide by the change in $x$.' },
        { value: dy.isZero() ? null : dx.div(dy), tag: 'rise-run-swap', feedback: 'Put the change in $y$ on top and the change in $x$ on the bottom.' },
        { value: m.neg(), tag: 'slope-calc', feedback: 'Check the sign: is $y$ going up or down as $x$ increases?' },
        { value: b, tag: 'graph-reading', feedback: 'That is the $y$-intercept (the value when $x = 0$). The question asks for the rate of change.' },
      ]),
      steps: [
        numStep(
          `Use the first two rows, $x = ${xs[0]}$ and $x = ${xs[1]}$. What is the change in $x$?`,
          dx,
          ['The change in $x$ is how far you move from one input to the next.', 'Subtract in order: the second $x$-value minus the first.', `Compute $${xs[1]} - ${sub(Q(xs[0]))}$.`, minusHint(xs[1], xs[0])],
          `The change in $x$ is the second input minus the first, so it is $${dx.toTex()}$.`,
          [{ value: dx.neg(), tag: 'sign-error', feedback: 'Subtract in order: the second $x$-value minus the first.' }],
        ),
        numStep(
          'In the same two rows, what is the change in $y$?',
          dy,
          ['Use the same two rows and the same order as for $x$.', 'Subtract: the second $y$-value minus the first.', `Compute $${ys[1].toTex()} - ${sub(ys[0])}$.`, 'If $y$ goes down, the change is negative.'],
          `Subtracting in the same order as for $x$ gives a change in $y$ of $${dy.toTex()}$.`,
          [{ value: dy.neg(), tag: 'sign-error', feedback: 'Keep the same order you used for $x$: second minus first.' }],
        ),
        finalStep(
          `Divide: rate of change $= \\dfrac{\\text{change in } y}{\\text{change in } x} = ${frac(dy, dx)}$. Simplify.`,
          { kind: 'number', value: numStr(m) },
          ['Divide the change in $y$ by the change in $x$.', 'The change in $y$ goes on top.', 'Simplify the fraction by dividing top and bottom by a common factor.', 'A fraction answer is fine if it does not divide evenly.'],
          `Dividing gives the change in $y$ for each 1-unit change in $x$, which is the rate of change.`,
          numberMisconceptions(m, [
            { value: dx.eq(1) ? null : dy, tag: 'slope-calc', feedback: 'That is the change in $y$. Divide it by the change in $x$.' },
            { value: dy.isZero() ? null : dx.div(dy), tag: 'rise-run-swap', feedback: 'Put the change in $y$ on top and the change in $x$ on the bottom.' },
          ]),
          'Type the slope. Fractions like 5/2 are fine.',
        ),
      ],
    });
  },
  verify(pr) {
    const table = pr.prompt.find((b) => b.t === 'table') as { rows: string[][] } | undefined;
    if (!table || pr.answer.kind !== 'number') return ['no table'];
    const rows = table.rows.map((r) => [Rational.parse(r[0]), Rational.parse(r[1])] as const);
    const first = rows[0];
    const last = rows[rows.length - 1];
    const m = last[1].sub(first[1]).div(last[0].sub(first[0]));
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i][1].sub(rows[i - 1][1]).div(rows[i][0].sub(rows[i - 1][0])).eq(m)) return ['table is not linear'];
    }
    if (!m.eq(Rational.parse(pr.answer.value))) return [`slope should be ${m}`];
    // steps use the first two rows; the slope itself was found from the first and last rows
    return stepErrors(pr, [rows[1][0].sub(rows[0][0]), rows[1][1].sub(rows[0][1]), m]);
  },
};

// ---------------------------------------------------------------------------
// S1.05: slope from a graph
// ---------------------------------------------------------------------------

export const genSlopeGraph: GeneratorDef = {
  id: 'u1.slope-graph',
  skillId: 'S1.05',
  description: 'Find the slope of a graphed line using two marked lattice points.',
  generate(rng, difficulty) {
    let m: Rational;
    if (difficulty === 1) m = Q(rng.int(1, 3));
    else if (difficulty === 2) m = Q(rng.nonzeroInt(-3, 3));
    else m = Q(rng.pick([1, -1, 2, -2, 3, -3]), rng.pick([2, 3]));
    if (difficulty === 2 && !m.isNegative() && rng.bool()) m = m.neg();
    const b = Q(rng.int(-3, 3));
    const pts: Array<[number, number]> = [];
    for (let x = -6; x <= 6; x++) {
      const y = m.mul(x).add(b);
      if (y.isInteger() && Math.abs(y.toNumber()) <= 6) pts.push([x, y.toInt()]);
    }
    const i = rng.int(0, pts.length - 2);
    const j = rng.int(i + 1, Math.min(pts.length - 1, i + 2));
    const [[x1, y1], [x2, y2]] = [pts[i], pts[j]];
    const dy = Q(y2 - y1);
    const dx = Q(x2 - x1);
    return makeProblem({
      skillId: 'S1.05',
      tags: ['graph'],
      prompt: [
        p('Find the slope of the line. Two points on the line are marked.'),
        {
          t: 'graph',
          spec: {
            xMin: -8, xMax: 8, yMin: -8, yMax: 8,
            functions: [{ expr: linearPlain(m, b) }],
            points: [{ x: x1, y: y1, label: `(${x1}, ${y1})` }, { x: x2, y: y2, label: `(${x2}, ${y2})` }],
            ariaLabel: `A line through the marked points (${x1}, ${y1}) and (${x2}, ${y2}).`,
          },
        },
      ],
      answer: { kind: 'number', value: numStr(m) },
      inputHint: 'Type the slope. Fractions like -2/3 are fine.',
      hints: [
        'Slope is rise over run: how far up or down you go for how far right you go.',
        `Start at the left point $(${x1}, ${y1})$ and move to the right point $(${x2}, ${y2})$.`,
        `Count the run first: from $x = ${x1}$ to $x = ${x2}$ is $${dx.toTex()}$ units to the right.`,
        `Now count the rise from $y = ${y1}$ to $y = ${y2}$. Going down counts as negative. Then divide rise by run.`,
      ],
      solution: [
        { text: 'Move from the left point to the right point.', tex: `(${x1}, ${y1}) \\to (${x2}, ${y2})`, why: 'Moving left to right makes the run positive, so the sign of the slope comes from the rise.' },
        { text: 'Count the rise and run.', tex: `\\text{rise} = ${dy.toTex()}, \\quad \\text{run} = ${dx.toTex()}`, why: dy.isNegative() ? 'The line goes down, so the rise is negative.' : 'The line goes up, so the rise is positive.' },
        { text: 'Divide.', tex: `m = ${frac(dy, dx)} = ${m.toTex()}` },
      ],
      misconceptions: slopeMisconceptions(dy, dx),
      steps: [
        numStep(
          `Move from the left point $(${x1}, ${y1})$ to the right point $(${x2}, ${y2})$. What is the run (how far right)?`,
          dx,
          ['The run is the horizontal distance between the points.', 'Count the grid squares from left to right, or subtract the $x$-values.', `Compute $${x2} - ${sub(Q(x1))}$.`, 'Moving right counts as positive.'],
          `Moving left to right, the $x$-value changes by $${dx.toTex()}$, so the run is $${dx.toTex()}$.`,
          [{ value: dy, tag: 'rise-run-swap', feedback: 'That is the vertical change (the rise). The run is the horizontal change.' }],
        ),
        numStep(
          'What is the rise (how far up or down)? Going down counts as negative.',
          dy,
          ['The rise is the vertical distance between the points.', 'Count the grid squares up or down, or subtract the $y$-values in the same order.', `Compute $${y2} - ${sub(Q(y1))}$.`, 'If the line goes down from left to right, the rise is negative.'],
          dy.isNegative() ? 'The line goes down from the left point to the right point, so the rise is negative.' : dy.isZero() ? 'The points are at the same height, so the rise is 0.' : 'The line goes up from the left point to the right point, so the rise is positive.',
          [
            { value: dy.neg(), tag: 'sign-error', feedback: 'Check the direction: does the line go up or down as you move right?' },
            { value: dx, tag: 'rise-run-swap', feedback: 'That is the horizontal change (the run). The rise is the vertical change.' },
          ],
        ),
        finalStep(
          `Divide: slope $= \\dfrac{\\text{rise}}{\\text{run}} = ${frac(dy, dx)}$. Simplify.`,
          { kind: 'number', value: numStr(m) },
          ['Divide the rise by the run.', 'The rise goes on top.', 'Simplify the fraction if you can.', 'A fraction answer is fine if it does not divide evenly.'],
          'Rise over run tells how much $y$ changes for each 1 unit to the right, which is the slope.',
          slopeMisconceptions(dy, dx),
          'Type the slope. Fractions like -2/3 are fine.',
        ),
      ],
    });
  },
  verify(pr) {
    const g = pr.prompt.find((b) => b.t === 'graph') as { spec: { functions: Array<{ expr: string }>; points: Array<{ x: number; y: number }> } } | undefined;
    if (!g || pr.answer.kind !== 'number') return ['no graph'];
    const poly = toPoly(parseExpression(g.spec.functions[0].expr));
    for (const pt of g.spec.points) if (!poly.evaluate({ x: Q(pt.x) }).eq(pt.y)) return ['marked point not on the line'];
    const [a, c] = g.spec.points;
    const m = Q(c.y - a.y, c.x - a.x);
    const fromRule = poly.evaluate({ x: Q(1) }).sub(poly.evaluate({ x: Q(0) }));
    if (!m.eq(fromRule)) return ['points disagree with rule'];
    if (!m.eq(Rational.parse(pr.answer.value))) return [`slope should be ${m}`];
    // steps: run and rise between the marked points, slope from the drawn rule
    const [left, right] = a.x < c.x ? [a, c] : [c, a];
    return stepErrors(pr, [Q(right.x - left.x), Q(right.y - left.y), fromRule]);
  },
};

// ---------------------------------------------------------------------------
// S1.06: rate of change with units in context
// ---------------------------------------------------------------------------

function ratePair(rng: Rng, ctx: LinearContext): [Rational, Rational] {
  const max = Math.max(4, ctx.maxInput);
  const [a1, a2] = pickDistinct(rng, 2, 1, max).sort((u, w) => u - w);
  return [Q(a1), Q(a2)];
}

export const genRateContext: GeneratorDef = {
  id: 'u1.rate-context',
  skillId: 'S1.06',
  description: 'Find a rate of change with units from two data points, or interpret it in context.',
  generate(rng, difficulty) {
    const ctx = buildContext(rng);
    if (difficulty === 3) {
      const rate = ctx.m;
      const answer = makeChoice(rng, `The slope is $${decTex(rate)}$: ${ctx.rateMeaning}.`, [
        `The slope is $${decTex(ctx.b)}$: ${ctx.startMeaning}.`,
        `The slope is $${decTex(Q(1).div(rate))}$: it takes that many ${ctx.inUnits} for the output to change by 1.`,
        `The slope is $${decTex(rate.add(ctx.b))}$: the output after the first ${ctx.inUnit}.`,
      ]);
      return makeProblem({
        skillId: 'S1.06',
        tags: ['real-world', 'word'],
        prompt: [p(ctxStory(ctx)), p('Which statement correctly gives the slope and what it means in this situation?')],
        answer,
        hints: [
          `In $${ctx.f}(${ctx.v}) = m${ctx.v} + b$, the slope is the number multiplied by $${ctx.v}$.`,
          `The slope is a rate: its units are ${ctx.rateUnit}.`,
          `Ask: when $${ctx.v}$ goes up by 1 ${ctx.inUnit}, how does the output change?`,
          'The constant term is the starting value, not the rate.',
        ],
        solution: [
          { text: 'Find the coefficient of the input variable.', tex: `m = ${decTex(rate)}`, why: 'In slope-intercept form, the coefficient of the input is the slope.' },
          { text: 'Give it units.', why: `The output is measured in ${ctx.outUnit === '%' ? 'percent' : ctx.outUnit} and the input in ${ctx.inUnits}, so the slope is in ${ctx.rateUnit}.` },
          { text: 'Interpret.', why: `${ctx.rateMeaning[0].toUpperCase()}${ctx.rateMeaning.slice(1)}.` },
        ],
        misconceptions: choiceMisc(answer, [
          { label: `The slope is $${decTex(ctx.b)}$: ${ctx.startMeaning}.`, tag: 'graph-reading', feedback: 'That is the starting value, the number added on by itself. The slope is the number multiplied by the input.' },
          { label: `The slope is $${decTex(Q(1).div(rate))}$: it takes that many ${ctx.inUnits} for the output to change by 1.`, tag: 'rise-run-swap', feedback: `That is upside down. The slope is the change in the output for each one ${ctx.inUnit}.` },
          { label: `The slope is $${decTex(rate.add(ctx.b))}$: the output after the first ${ctx.inUnit}.`, tag: 'slope-calc', feedback: 'That is the output after one unit, not the change in the output. The slope is the amount that repeats every unit.' },
        ]),
        steps: [
          numStep(
            `In the rule, what number is multiplied by $${ctx.v}$?`,
            rate,
            [`A linear rule has the form $${ctx.f}(${ctx.v}) = m${ctx.v} + b$.`, `Find the term that contains $${ctx.v}$.`, 'The number in front of the variable multiplies it.', 'Keep its sign: a minus sign in front belongs to the number.'],
            `In $m${ctx.v} + b$, the number multiplied by the input is the slope $m$.`,
            [{ value: ctx.b, tag: 'graph-reading', feedback: 'That number is added on by itself: it is the starting value, not the rate.' }],
          ),
          finalStep(
            'Which statement correctly gives the slope and what it means?',
            answer,
            ['Use the slope you just found.', `The slope is a rate in ${ctx.rateUnit}.`, `It tells how the output changes when $${ctx.v}$ goes up by 1.`, 'The constant term is the starting value, not the rate.'],
            `The slope ${decTex(rate)} is the change in the output for each ${ctx.inUnit}: ${ctx.rateMeaning}.`,
          ),
        ],
      });
    }
    const [a1, a2] = ratePair(rng, ctx);
    const y1 = ctx.m.mul(a1).add(ctx.b);
    const y2 = ctx.m.mul(a2).add(ctx.b);
    const dy = y2.sub(y1);
    const dx = a2.sub(a1);
    const rate = dy.div(dx);
    const intro = `${ctx.topic} The table shows two data points.`;
    const table = { t: 'table' as const, headers: [`${ctx.v} (${ctx.inUnits})`, `${ctx.f}(${ctx.v}) (${ctx.outUnit === '%' ? 'percent' : ctx.outUnit})`], rows: [[decTex(a1), decTex(y1)], [decTex(a2), decTex(y2)]] };
    return makeProblem({
      skillId: 'S1.06',
      tags: ['real-world', 'word'],
      prompt: [p(intro), table, p(`Find the rate of change in ${ctx.rateUnit}.`)],
      answer: { kind: 'number', value: numStr(rate), unit: ctx.rateUnit },
      inputHint: `Type a number (it is in ${ctx.rateUnit}). Use a negative number if the amount is going down.`,
      hints: [
        'Rate of change $= \\dfrac{\\text{change in output}}{\\text{change in input}}$.',
        `The output changes from $${decTex(y1)}$ to $${decTex(y2)}$. Subtract to find the change.`,
        `The input changes from $${decTex(a1)}$ to $${decTex(a2)}$, a change of $${decTex(dx)}$ ${ctx.inUnits}.`,
        `Divide the change in output by $${decTex(dx)}$. If the output went down, the rate is negative.`,
      ],
      solution: [
        { text: 'Find the change in the output.', tex: `${decTex(y2)} - ${y1.isNegative() ? `(${decTex(y1)})` : decTex(y1)} = ${decTex(dy)}`, why: 'Subtract in the same order as the inputs (later minus earlier).' },
        { text: 'Find the change in the input.', tex: `${decTex(a2)} - ${a1.isNegative() ? `(${decTex(a1)})` : decTex(a1)} = ${decTex(dx)}` },
        { text: 'Divide.', tex: `\\frac{${decTex(dy)}}{${decTex(dx)}} = ${decTex(rate)}`, why: `The rate is ${decTex(rate)} ${ctx.rateUnit}: ${ctx.rateMeaning}.` },
      ],
      misconceptions: numberMisconceptions(rate, [
        { value: dy, tag: 'slope-calc', feedback: `That is the total change. Divide by the change in the input (${decTex(dx)} ${ctx.inUnits}) to get the rate per ${ctx.inUnit}.` },
        { value: dy.isZero() ? null : dx.div(dy), tag: 'rise-run-swap', feedback: `The rate is in ${ctx.rateUnit}, so the output change goes on top.` },
        { value: rate.neg(), tag: 'sign-error', feedback: 'Check the sign: is the amount going up or down?' },
        { value: y2.div(a2), tag: 'slope-calc', feedback: 'Dividing one output by its input ignores the starting amount. Use the change between the two rows.' },
      ]),
      steps: [
        numStep(
          `How much does the output change from the first row to the second? (${ctx.outUnit === '%' ? 'percentage points' : ctx.outUnit})`,
          dy,
          ['The change in output is later output minus earlier output.', `The outputs are $${decTex(y1)}$ and $${decTex(y2)}$.`, `Compute $${decTex(y2)} - ${y1.isNegative() ? `(${decTex(y1)})` : decTex(y1)}$.`, 'If the amount goes down, the change is negative.'],
          `Subtracting the earlier output from the later one gives the change, $${decTex(dy)}$.`,
          [{ value: dy.neg(), tag: 'sign-error', feedback: 'Subtract in order: later minus earlier. Is the amount going up or down?' }],
        ),
        numStep(
          `How much does the input change? (${ctx.inUnits})`,
          dx,
          ['The change in input is later input minus earlier input.', `The inputs are $${decTex(a1)}$ and $${decTex(a2)}$.`, `Compute $${decTex(a2)} - ${a1.isNegative() ? `(${decTex(a1)})` : decTex(a1)}$.`, `This is the number of ${ctx.inUnits} that passed.`],
          `Between the two rows, $${decTex(dx)}$ ${ctx.inUnits} pass.`,
          [{ value: dx.neg(), tag: 'sign-error', feedback: 'Subtract in the same order as the outputs: later minus earlier.' }],
        ),
        finalStep(
          `Divide to find the rate of change in ${ctx.rateUnit}.`,
          { kind: 'number', value: numStr(rate), unit: ctx.rateUnit },
          ['Rate of change $= \\dfrac{\\text{change in output}}{\\text{change in input}}$.', `Divide $${decTex(dy)}$ by $${decTex(dx)}$.`, 'Keep the sign of the change in output.', `The answer is in ${ctx.rateUnit}.`],
          `Dividing the total change by the number of ${ctx.inUnits} gives the change for one ${ctx.inUnit}.`,
          numberMisconceptions(rate, [
            { value: dy, tag: 'slope-calc', feedback: `That is the total change. Divide by the change in the input.` },
            { value: dy.isZero() ? null : dx.div(dy), tag: 'rise-run-swap', feedback: `The rate is in ${ctx.rateUnit}, so the output change goes on top.` },
          ]),
          `Type a number (it is in ${ctx.rateUnit}).`,
        ),
      ],
    });
  },
  verify(pr) {
    if (pr.answer.kind === 'choice') {
      const story = (pr.prompt[0] as { text: string }).text;
      const rm = /\$([A-Z])\(([a-z])\) = (.+?)\$ gives/.exec(story);
      if (!rm) return ['cannot parse rule'];
      const poly = toPoly(parseExpression(texToExpr(rm[3])));
      const slope = poly.evaluate({ [rm[2]]: Q(1) }).sub(poly.evaluate({ [rm[2]]: Q(0) }));
      const lm = /^The slope is \$(-?[\d.]+)\$:/.exec(choiceLabel(pr.answer));
      if (!lm || !Rational.parse(lm[1]).eq(slope)) return ['correct choice does not state the slope'];
      if (pr.answer.options.length < 3) return ['too few options'];
      return stepErrors(pr, [slope, null]);
    }
    const table = pr.prompt.find((b) => b.t === 'table') as { rows: string[][] } | undefined;
    if (!table || pr.answer.kind !== 'number') return ['no table'];
    const [[x1, y1], [x2, y2]] = table.rows.map((r) => r.map((c) => Rational.parse(c)));
    const rate = y1.sub(y2).div(x1.sub(x2));
    if (!rate.eq(Rational.parse(pr.answer.value))) return [`rate should be ${rate}`];
    return stepErrors(pr, [y2.sub(y1), x2.sub(x1), rate]);
  },
};

export const U1_SLOPE_GENERATORS = [genSlopePoints, genSlopeTable, genSlopeGraph, genRateContext];

