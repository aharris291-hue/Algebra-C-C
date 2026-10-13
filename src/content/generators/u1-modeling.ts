/**
 * Unit 1, Lesson 9 generators: modeling with linear functions (S1.15) and units and rates (S1.16).
 */
import type { GeneratorDef, Rng, Problem } from '../../core/curriculum/types';
import { Rational } from '../../core/math/rational';
import { linearPlain, linearTex, decTex } from '../../core/math/format';
import { toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { Q, p, makeProblem, numberMisconceptions, numStr, pickDistinct, makeChoice, choiceLabel } from './util';
import { buildContext, ctxStory, type LinearContext } from './u1-contexts';
import { numStep, choiceStep, finalStep, stepErrors } from './u1-steps';

// ---------------------------------------------------------------------------
// S1.15: build a model from two data points and use it
// ---------------------------------------------------------------------------

/**
 * Two data inputs in 1..top. Every input used in a problem (data, prediction, solved-for input)
 * stays within the context's sensible domain 1..maxInput, so a draining battery, tank or candle
 * never shows a negative level. `room` leaves space above the second point for a prediction.
 */
function dataPoints(rng: Rng, ctx: LinearContext, room = 0): [Rational, Rational] {
  const top = Math.max(2, ctx.maxInput - room);
  const [a, b] = pickDistinct(rng, 2, 1, top).sort((u, w) => u - w);
  return [Q(a), Q(b)];
}

/** An input beyond the second data point, at most `span` further and never past maxInput. */
function laterInput(rng: Rng, ctx: LinearContext, x2: Rational, span: number): Rational {
  const lo = x2.toNumber() + 1;
  const hi = Math.max(lo, Math.min(ctx.maxInput, x2.toNumber() + span));
  return Q(rng.int(lo, hi));
}

function tableBlock(ctx: LinearContext, xs: Rational[], ys: Rational[]) {
  return { t: 'table' as const, headers: [`${ctx.v} (${ctx.inUnits})`, `${ctx.f}(${ctx.v}) (${ctx.outUnit === '%' ? 'percent' : ctx.outUnit})`], rows: xs.map((x, i) => [decTex(x), decTex(ys[i])]) };
}

// ---------------------------------------------------------------------------
// S1.15 (A.MM.1.5): choosing the input and output quantities for a model
// ---------------------------------------------------------------------------

const QUANTITY_SITUATIONS: Array<{ setup: (r: string) => string; rates: string[]; rateText: (r: string) => string; goal: string; inName: string; inUnits: string; outName: string; outUnits: string; rateName: string }> = [
  { setup: (r) => `A hose fills a pool at a steady ${r} gallons per minute.`, rates: ['15', '20', '25', '30'], rateText: (r) => `${r} gallons per minute`, goal: 'Jordan wants a function that tells how much water is in the pool at any moment while it fills.', inName: 'time since filling started', inUnits: 'minutes', outName: 'water in the pool', outUnits: 'gallons', rateName: 'the fill rate' },
  { setup: (r) => `A taxi charges a \\$3 pickup fee plus \\$${r} per mile.`, rates: ['2', '3', '4'], rateText: (r) => `${r} dollars per mile`, goal: 'Sam wants a function that predicts the fare for a ride of any length.', inName: 'length of the ride', inUnits: 'miles', outName: 'the fare', outUnits: 'dollars', rateName: 'the charge per mile' },
  { setup: (r) => `A plant is 4 inches tall and grows ${r} inches per week.`, rates: ['1.5', '2', '2.5'], rateText: (r) => `${r} inches per week`, goal: 'Lena wants a function that gives the height of the plant at any time.', inName: 'time since the first measurement', inUnits: 'weeks', outName: 'height of the plant', outUnits: 'inches', rateName: 'the growth rate' },
  { setup: (r) => `A phone plan charges \\$${r} for each gigabyte of data used in a month.`, rates: ['8', '10', '12'], rateText: (r) => `${r} dollars per gigabyte`, goal: 'Ari wants a function that gives the data charge for any amount of data used.', inName: 'data used', inUnits: 'gigabytes', outName: 'the data charge', outUnits: 'dollars', rateName: 'the price per gigabyte' },
];

function quantitiesProblem(rng: Rng): Problem {
  const sit = rng.pick(QUANTITY_SITUATIONS);
  const r = rng.pick(sit.rates);
  const rateUnits = `${sit.outUnits} per ${sit.inUnits.replace(/s$/, '')}`;
  const opt = (inp: string, out: string) => `Input: ${inp}; output: ${out}`;
  const right = opt(`${sit.inName} (${sit.inUnits})`, `${sit.outName} (${sit.outUnits})`);
  const rateIn = opt(`${sit.rateName} (${sit.rateText(r)})`, `${sit.outName} (${sit.outUnits})`);
  const reversed = opt(`${sit.outName} (${sit.outUnits})`, `${sit.rateName} (${rateUnits})`);
  const rateOut = opt(`${sit.inName} (${sit.inUnits})`, `${sit.rateName} (${rateUnits})`);
  const answer = makeChoice(rng, right, [rateIn, reversed, rateOut]);
  const idOf = (label: string) => answer.options.find((o) => o.label === label)!.id;
  const misconceptions = [
    { answer: idOf(rateIn), tag: 'units' as const, feedback: `The rate ${sit.rateText(r)} never changes, so it cannot be the input. It is the slope of the model.` },
    { answer: idOf(reversed), tag: 'units' as const, feedback: 'That uses the quantity the person wants to find as the input. Which quantity is the goal?' },
    { answer: idOf(rateOut), tag: 'units' as const, feedback: 'The rate stays the same, so it is not what the function gives back. What does the person want to know?' },
  ];
  // the three quantities in the story, in a fixed order (no randomness, so seeds keep their problems)
  const qty = [`${sit.inName} (${sit.inUnits})`, `${sit.outName} (${sit.outUnits})`, `${sit.rateName} (${sit.rateText(r)})`];
  return makeProblem({
    skillId: 'S1.15',
    tags: ['real-world', 'word'],
    prompt: [p(`${sit.setup(r)} ${sit.goal}`), p('Which quantities should be the input and the output of the function?')],
    answer,
    hints: [
      'The input is the quantity you choose or that changes freely; the output is the quantity you want to find.',
      `Read the goal again: what does the person want to know? That is the output.`,
      `A rate like ${sit.rateText(r)} stays the same the whole time. A number that never changes is part of the rule, not an input or an output.`,
      `Check the units: the rate's units are (output units) per (input unit).`,
    ],
    solution: [
      { text: 'Find what the person wants to know.', why: `The goal asks for ${sit.outName}, measured in ${sit.outUnits}. That is the output.` },
      { text: 'Find what it depends on.', why: `${sit.outName[0].toUpperCase()}${sit.outName.slice(1)} changes as the ${sit.inName} changes, so the ${sit.inName}, in ${sit.inUnits}, is the input.` },
      { text: 'Check with the rate.', tex: `\\text{${rateUnits}} = \\dfrac{\\text{${sit.outUnits}}}{\\text{${sit.inUnits.replace(/s$/, '')}}}`, why: `The rate is a constant: it becomes the slope of the model, with output units on top and input units on the bottom.` },
    ],
    misconceptions,
    steps: [
      choiceStep(
        'Start with the goal. Which quantity does the person want the function to tell them? (That quantity is the output.)',
        qty,
        1,
        ['The output is the answer the function gives back.', 'Reread the sentence that says what the person wants.', 'It names something the person wants to know at any moment or for any amount.', `Look for the quantity measured in ${sit.outUnits}.`],
        `The goal asks for ${sit.outName}, so that is what the function must give back: the output.`,
        [
          { index: 0, tag: 'units', feedback: 'That is what the person chooses or what changes freely. Which quantity do they want to find out?' },
          { index: 2, tag: 'units', feedback: `The rate ${sit.rateText(r)} never changes, so it is not what the person wants to find.` },
        ],
      ),
      choiceStep(
        `${sit.outName[0].toUpperCase()}${sit.outName.slice(1)} changes when something else changes. Which quantity is that? (That quantity is the input.)`,
        qty,
        0,
        ['The input is the quantity you can pick freely, like how long or how much.', 'A number that stays the same the whole time is part of the rule, not the input.', `Ask: ${sit.outName} depends on what?`, `Look for the quantity measured in ${sit.inUnits}.`],
        `${sit.outName[0].toUpperCase()}${sit.outName.slice(1)} depends on the ${sit.inName}, so the ${sit.inName} is the input.`,
        [
          { index: 1, tag: 'units', feedback: 'You already chose that one as the output. The input is what the output depends on.' },
          { index: 2, tag: 'units', feedback: `The rate ${sit.rateText(r)} stays the same, so it cannot be the input. It becomes the slope.` },
        ],
      ),
      finalStep(
        'So which quantities should be the input and the output of the function?',
        answer,
        ['Use the input and the output you just found.', 'The input is listed first in each choice.', 'The rate is not the input or the output.', `Check the units: the rate is in ${rateUnits}, which is (output units) per (one input unit).`],
        `The rate's units are ${rateUnits}: output units per one input unit, which confirms the choice.`,
        misconceptions,
      ),
    ],
  });
}

function verifyQuantities(pr: Problem): string[] {
  if (pr.answer.kind !== 'choice') return ['wrong kind'];
  const text = (pr.prompt[0] as { text: string }).text;
  // the rate in the story: "<n> <out units> per <in unit>" or "\$<n> per <in unit>"
  const rm = /(?:\\\$[\d.]+|[\d.]+ ([a-z]+)) (?:for each|per) ([a-z]+)/.exec(text);
  if (!rm) return ['cannot parse rate'];
  const outU = rm[1] ?? 'dollars';
  const inU = `${rm[2]}s`;
  const fits = pr.answer.options.filter((o) => {
    const mm = /^Input: .*\(([^()]*)\); output: .*\(([^()]*)\)$/.exec(o.label);
    return !!mm && mm[1] === inU && mm[2] === outU;
  });
  if (fits.length !== 1) return [`${fits.length} options fit`];
  if (fits[0].id !== pr.answer.correct) return ['keyed option does not fit the rate units'];
  // steps: the output is the quantity in the rate's top units, the input the one in its bottom units
  const unitOption = (i: number, unit: string): string => {
    const a = pr.steps?.[i]?.answer;
    if (!a || a.kind !== 'choice') return '(none)';
    const hits = a.options.filter((o) => o.label.endsWith(`(${unit})`));
    return hits.length === 1 ? hits[0].label : '(ambiguous)';
  };
  return stepErrors(pr, [unitOption(0, outU), unitOption(1, inU), null]);
}

export const genLinearModel: GeneratorDef = {
  id: 'u1.linear-model',
  skillId: 'S1.15',
  description: 'Choose the input and output quantities for a model; build a linear model from two data points in a situation, then use it to predict an output or an input.',
  generate(rng, difficulty) {
    if (difficulty === 1 && rng.int(0, 2) === 0) return quantitiesProblem(rng);
    const ctx = buildContext(rng);
    const { f, v, m, b } = ctx;
    const [x1, x2] = dataPoints(rng, ctx, difficulty === 1 ? 0 : 1);
    const [y1, y2] = [m.mul(x1).add(b), m.mul(x2).add(b)];
    const dsub = (v: Rational) => (v.isNegative() ? `(${decTex(v)})` : decTex(v));
    const slopeTex = `\\dfrac{${decTex(y2)} - ${dsub(y1)}}{${decTex(x2)} - ${dsub(x1)}}`;
    const modelTex = linearTex(m, b, v, true);
    const intro = [p(`${ctx.topic} The table shows two data points, and the relationship is linear.`), tableBlock(ctx, [x1, x2], [y1, y2])];
    const buildSteps = [
      { text: 'Find the rate of change (slope).', tex: `m = ${slopeTex} = ${decTex(m)}`, why: `The output changes by ${decTex(m)} for each ${ctx.inUnit}, so the rate is ${decTex(m)} ${ctx.rateUnit}.` },
      { text: 'Find the starting value $b$ by substituting one data point.', tex: `${decTex(y1)} = ${decTex(m)}(${decTex(x1)}) + b \\;\\Rightarrow\\; b = ${decTex(b)}`, why: 'The data point must fit the model.' },
      { text: 'Write the model.', tex: `${f}(${v}) = ${modelTex}`, why: `The starting value means ${ctx.startMeaning}.` },
    ];
    const buildHints: [string, string] = [
      `Find the rate of change from the two rows: $m = ${slopeTex}$.`,
      `Then substitute one row into $${f}(${v}) = m${v} + b$ to find $b$.`,
    ];
    if (difficulty === 1) {
      const modelMisc = [
        ...(y1.eq(b) ? [] : [{ answer: linearPlain(m, y1, v), tag: 'equation-setup' as const, feedback: `The first data point is not at $${v} = 0$, so its output is not the starting value. Solve for $b$.` }]),
        ...(m.mul(x2.sub(x1)).eq(m) ? [] : [{ answer: linearPlain(y2.sub(y1), b, v), tag: 'slope-calc' as const, feedback: `The inputs are ${decTex(x2.sub(x1))} ${ctx.inUnits} apart, so divide the change in output by that to get the rate per ${ctx.inUnit}.` }]),
      ];
      return makeProblem({
        skillId: 'S1.15',
        tags: ['real-world', 'word'],
        prompt: [...intro, p(`Write a linear model $${f}(${v})$ for this situation.`)],
        answer: { kind: 'expression', value: linearPlain(m, b, v), variables: [v] },
        inputHint: `Type the rule in ${v}, like ${linearPlain(Q(5), Q(20), v)}. You can start with ${f}(${v}) = .`,
        hints: ['A linear model has the form $f(x) = mx + b$: rate times input, plus a starting value.', ...buildHints, 'Check: your model should give both outputs in the table.'],
        solution: buildSteps,
        misconceptions: modelMisc,
        steps: [
          numStep(
            `Find the rate of change from the two rows: $m = ${slopeTex}$. (Give it in ${ctx.rateUnit}.)`,
            m,
            ['The rate of change is the change in output divided by the change in input.', `Work out the top: $${decTex(y2)} - ${dsub(y1)}$.`, `Work out the bottom: $${decTex(x2)} - ${dsub(x1)}$.`, 'Divide the top by the bottom. Keep the sign: a falling amount has a negative rate.'],
            `The output changes by $${decTex(y2.sub(y1))}$ over $${decTex(x2.sub(x1))}$ ${ctx.inUnits}, which is $${decTex(m)}$ for each ${ctx.inUnit}.`,
            [
              { value: x2.sub(x1).eq(1) ? null : y2.sub(y1), tag: 'slope-calc', feedback: `That is the total change. The inputs are ${decTex(x2.sub(x1))} ${ctx.inUnits} apart, so divide by that.` },
              { value: y2.sub(y1).isZero() ? null : x2.sub(x1).div(y2.sub(y1)), tag: 'rise-run-swap', feedback: 'The change in output goes on top and the change in input on the bottom.' },
              { value: m.neg(), tag: 'sign-error', feedback: 'Subtract in the same order on top and bottom. Is the amount going up or down?' },
            ],
          ),
          numStep(
            `Substitute the first row into $${f}(${v}) = ${decTex(m)}${v} + b$: $${decTex(y1)} = ${decTex(m)}(${decTex(x1)}) + b$. What is the starting value $b$?`,
            b,
            ['The data point is on the line, so its numbers make the equation true.', `Multiply first: $${decTex(m)} \\cdot ${decTex(x1)}$.`, 'Then subtract that product from both sides to get $b$ alone.', `Check: $b$ is the output at $${v} = 0$, which is not in the table.`],
            `Undoing the rate term leaves the value at $${v} = 0$: ${ctx.startMeaning}.`,
            [
              { value: y1, tag: 'equation-setup', feedback: `The first row is not at $${v} = 0$, so its output is not the starting value. Subtract the rate term.` },
              { value: y1.add(m.mul(x1)), tag: 'sign-error', feedback: 'To get $b$ alone, subtract the product from both sides; do not add it.' },
            ],
          ),
          finalStep(
            `Write the linear model $${f}(${v})$.`,
            { kind: 'expression', value: linearPlain(m, b, v), variables: [v] },
            ['A linear model is (rate) $\\times$ (input) $+$ (starting value).', `Put the rate in front of $${v}$.`, 'Add the starting value, keeping its sign.', 'Check: your model should give both outputs in the table.'],
            'The rate multiplies the input because it repeats every unit, and the starting value is added once.',
            modelMisc,
            `Type the rule in ${v}.`,
          ),
        ],
      });
    }
    if (difficulty === 2) {
      const xp = laterInput(rng, ctx, x2, 10);
      const yp = m.mul(xp).add(b);
      return makeProblem({
        skillId: 'S1.15',
        tags: ['real-world', 'word', 'multi-step'],
        prompt: [...intro, p(`Use a linear model to predict $${f}(${decTex(xp)})$.`)],
        answer: { kind: 'number', value: numStr(yp), unit: ctx.outUnit },
        hints: ['First build the model $f(x) = mx + b$ from the two data points.', ...buildHints, `Then evaluate your model at $${v} = ${decTex(xp)}$.`],
        solution: [...buildSteps, { text: 'Evaluate the model.', tex: `${f}(${decTex(xp)}) = ${decTex(m)}(${decTex(xp)})${b.isNegative() ? ' - ' + decTex(b.abs()) : ' + ' + decTex(b)} = ${decTex(yp)}`, why: ctx.says(ctx.inWord(xp), ctx.outWord(yp)) }],
        misconceptions: numberMisconceptions(yp, [
          { value: m.mul(xp), tag: 'equation-setup', feedback: 'Remember the starting value $b$ in the model.' },
          { value: m.mul(xp).add(y1), tag: 'equation-setup', feedback: `The first data point is not the starting value, because it is not at $${v} = 0$.` },
          { value: y2.sub(y1).mul(xp).add(b), tag: 'slope-calc', feedback: 'Check the rate: divide the change in output by the change in input.' },
        ]),
      });
    }
    // predict the input that gives a target output
    const xt = laterInput(rng, ctx, x2, 8);
    const yt = m.mul(xt).add(b);
    return makeProblem({
      skillId: 'S1.15',
      tags: ['real-world', 'word', 'multi-step'],
      prompt: [...intro, p(`Use a linear model to find the value of $${v}$ when $${f}(${v}) = ${decTex(yt)}$.`)],
      answer: { kind: 'number', value: numStr(xt), unit: ctx.inUnits },
      hints: ['First build the model from the two data points.', ...buildHints, `Then set your model equal to $${decTex(yt)}$ and solve for $${v}$.`],
      solution: [...buildSteps, { text: 'Solve for the input.', tex: `${modelTex} = ${decTex(yt)} \\;\\Rightarrow\\; ${v} = ${decTex(xt)}`, why: ctx.says(ctx.inWord(xt), ctx.outWord(yt)) }],
      misconceptions: numberMisconceptions(xt, [
        { value: m.mul(yt).add(b), tag: 'inverse-operation', feedback: `That is $${f}(${decTex(yt)})$. Here $${decTex(yt)}$ is the output; solve for the input.` },
        { value: yt.div(m), tag: 'equation-setup', feedback: 'Subtract the starting value before you divide by the rate.' },
      ]),
    });
  },
  verify(pr) {
    if (pr.answer.kind === 'choice') return verifyQuantities(pr);
    const table = pr.prompt.find((b) => b.t === 'table') as { rows: string[][] };
    const [[x1, y1], [x2, y2]] = table.rows.map((r) => r.map((c) => Rational.parse(c)));
    // point-slope route: y = y2 + m(x - x2)
    const m = y2.sub(y1).div(x2.sub(x1));
    const model = (x: Rational) => y2.add(m.mul(x.sub(x2)));
    const ask = (pr.prompt[pr.prompt.length - 1] as { text: string }).text;
    const a = pr.answer;
    if (a.kind === 'expression') {
      const v = a.variables![0];
      const poly = toPoly(parseExpression(a.value));
      if (![0, 1, 7].every((x) => poly.evaluate({ [v]: Q(x) }).eq(model(Q(x))))) return ['model mismatch'];
      // steps: slope from the rows, b from the second row (the steps use the first)
      return stepErrors(pr, [m, y2.sub(m.mul(x2)), null]);
    }
    if (a.kind !== 'number') return ['wrong kind'];
    const pm = /predict \$[A-Z]\((.+?)\)\$/.exec(ask);
    if (pm) return model(Rational.parse(pm[1])).eq(Rational.parse(a.value)) ? [] : ['prediction mismatch'];
    const im = /when \$[A-Z]\([a-z]\) = (.+?)\$/.exec(ask);
    if (im) return model(Rational.parse(a.value)).eq(Rational.parse(im[1])) ? [] : ['input mismatch'];
    return ['cannot parse ask'];
  },
};

// ---------------------------------------------------------------------------
// S1.16: units and rates
// ---------------------------------------------------------------------------

/** Exact conversion factors to base units (centimeters, seconds, cents, cups). */
const BASE: Record<string, { dim: string; toBase: Rational; plural: string; singular: string }> = {
  inch: { dim: 'L', toBase: Q('2.54'), plural: 'inches', singular: 'inch' },
  foot: { dim: 'L', toBase: Q('30.48'), plural: 'feet', singular: 'foot' },
  yard: { dim: 'L', toBase: Q('91.44'), plural: 'yards', singular: 'yard' },
  mile: { dim: 'L', toBase: Q('160934.4'), plural: 'miles', singular: 'mile' },
  centimeter: { dim: 'L', toBase: Q(1), plural: 'centimeters', singular: 'centimeter' },
  meter: { dim: 'L', toBase: Q(100), plural: 'meters', singular: 'meter' },
  kilometer: { dim: 'L', toBase: Q(100000), plural: 'kilometers', singular: 'kilometer' },
  second: { dim: 'T', toBase: Q(1), plural: 'seconds', singular: 'second' },
  minute: { dim: 'T', toBase: Q(60), plural: 'minutes', singular: 'minute' },
  hour: { dim: 'T', toBase: Q(3600), plural: 'hours', singular: 'hour' },
  day: { dim: 'T', toBase: Q(86400), plural: 'days', singular: 'day' },
  dollar: { dim: 'M', toBase: Q(100), plural: 'dollars', singular: 'dollar' },
  cent: { dim: 'M', toBase: Q(1), plural: 'cents', singular: 'cent' },
  gallon: { dim: 'V', toBase: Q(16), plural: 'gallons', singular: 'gallon' },
  quart: { dim: 'V', toBase: Q(4), plural: 'quarts', singular: 'quart' },
  cup: { dim: 'V', toBase: Q(1), plural: 'cups', singular: 'cup' },
};

/** A conversion task: amount in units (num per den) -> (num2 per den2). Factors listed are the ones a student uses. */
interface Task {
  from: [string, string | null];
  to: [string, string | null];
  /** generate an amount that converts to a "nice" (terminating) answer */
  amount(rng: Rng): Rational;
  facts: string[];
  context: (amt: string) => string;
}

const TASKS_1: Task[] = [
  { from: ['foot', null], to: ['inch', null], amount: (r) => Q(r.int(3, 15)), facts: ['1 foot = 12 inches'], context: (a) => `A shelf has a length of ${a}.` },
  { from: ['minute', null], to: ['hour', null], amount: (r) => Q(r.pick([30, 45, 90, 150, 135, 210, 75])), facts: ['1 hour = 60 minutes'], context: (a) => `A movie marathon lasts ${a}.` },
  { from: ['inch', null], to: ['centimeter', null], amount: (r) => Q(r.int(4, 30)), facts: ['1 inch = 2.54 centimeters (exactly)'], context: (a) => `The diagonal of a phone screen is ${a}.` },
  { from: ['gallon', null], to: ['quart', null], amount: (r) => Q(r.int(2, 12)), facts: ['1 gallon = 4 quarts'], context: (a) => `A water cooler holds ${a}.` },
  { from: ['yard', null], to: ['foot', null], amount: (r) => Q(r.int(5, 100)), facts: ['1 yard = 3 feet'], context: (a) => `A football drive gains ${a}.` },
];

const TASKS_2: Task[] = [
  { from: ['mile', 'hour'], to: ['foot', 'second'], amount: (r) => Q(15 * r.int(1, 5)), facts: ['1 mile = 5280 feet', '1 hour = 3600 seconds'], context: (a) => `A car drives at ${a}.` },
  { from: ['meter', 'second'], to: ['kilometer', 'hour'], amount: (r) => Q(r.int(2, 30)), facts: ['1 kilometer = 1000 meters', '1 hour = 3600 seconds'], context: (a) => `A cyclist rides at ${a}.` },
  { from: ['gallon', 'minute'], to: ['gallon', 'hour'], amount: (r) => Q(r.int(3, 25)), facts: ['1 hour = 60 minutes'], context: (a) => `A garden hose fills a pool at ${a}.` },
  { from: ['dollar', 'hour'], to: ['cent', 'minute'], amount: (r) => Q(3 * r.int(3, 8)), facts: ['1 dollar = 100 cents', '1 hour = 60 minutes'], context: (a) => `A summer job pays ${a}.` },
];

const TASKS_3: Task[] = [
  { from: ['foot', 'second'], to: ['mile', 'hour'], amount: (r) => Q(22 * r.int(1, 4)), facts: ['1 mile = 5280 feet', '1 hour = 3600 seconds'], context: (a) => `A cheetah sprints at ${a}.` },
  { from: ['kilometer', 'hour'], to: ['meter', 'second'], amount: (r) => Q(18 * r.int(1, 6)), facts: ['1 kilometer = 1000 meters', '1 hour = 3600 seconds'], context: (a) => `A train travels at ${a}.` },
  { from: ['cup', 'day'], to: ['gallon', 'day'], amount: (r) => Q(4 * r.int(2, 12)), facts: ['1 gallon = 16 cups'], context: (a) => `A family drinks milk at a rate of ${a}.` },
  { from: ['inch', 'minute'], to: ['foot', 'hour'], amount: (r) => Q(r.int(1, 10)), facts: ['1 foot = 12 inches', '1 hour = 60 minutes'], context: (a) => `Floodwater rises at ${a}.` },
];

/** A conversion factor as a fraction equal to 1: `num` of unit `top` over `den` of unit `bottom`. */
function factorTex(num: Rational, top: string, den: Rational, bottom: string): string {
  const word = (u: string, n: Rational) => (n.eq(1) ? BASE[u].singular : BASE[u].plural);
  return `\\dfrac{${decTex(num)}\\text{ ${word(top, num)}}}{${decTex(den)}\\text{ ${word(bottom, den)}}}`;
}

/** The factor that turns unit `from` into unit `to` (from cancels on the bottom), and its upside-down twin. */
function factorPair(from: string, to: string): [string, string] {
  const r = BASE[from].toBase.div(BASE[to].toBase); // number of `to` units in one `from` unit
  const [nTo, nFrom] = r.ge(1) ? [r, Q(1)] : [Q(1), Q(1).div(r)];
  return [factorTex(nTo, to, nFrom, from), factorTex(nFrom, from, nTo, to)];
}

/** Read a factor label "$\dfrac{a\text{ u}}{b\text{ w}}$" back as numbers and units. */
export function parseFactor(label: string): { num: Rational; top: string; den: Rational; bottom: string } | null {
  const mm = /\\dfrac\{([\d.]+)\\text\{ ([a-z]+)\}\}\{([\d.]+)\\text\{ ([a-z]+)\}\}/.exec(label);
  return mm ? { num: Rational.parse(mm[1]), top: mm[2], den: Rational.parse(mm[3]), bottom: mm[4] } : null;
}

const FACTOR_HINTS: [string, string, string, string] = [
  'A conversion factor is a fraction equal to 1, like $\\frac{12\\text{ inches}}{1\\text{ foot}}$.',
  'The unit you want to get rid of must be on the opposite side of the fraction, so it cancels.',
  'If the old unit is on top of your amount, it must be on the bottom of the factor (and the other way around).',
  'The new unit you want should be left over after the cancelling.',
];

/**
 * Guided steps for a conversion. One factor: choose the factor, then convert. Two factors: convert one
 * unit first (whichever keeps the numbers whole), choose the factor for the other unit, then finish.
 * The option order depends only on the amount, so no random numbers are used.
 */
function conversionSteps(task: Task, amt: Rational, ans: Rational, fromText: string, toUnits: string, misc: ReturnType<typeof numberMisconceptions>): NonNullable<Problem['steps']> {
  const topChanges = task.from[0] !== task.to[0];
  const bottomChanges = !!task.from[1] && task.from[1] !== task.to[1];
  const flip = amt.toNumber() % 2 === 1;
  const choose = (prompt: string, pair: [string, string], why: string) =>
    choiceStep(prompt, (flip ? [pair[1], pair[0]] : pair).map((t) => `$${t}$`), flip ? 1 : 0, FACTOR_HINTS, why, [
      { index: flip ? 0 : 1, tag: 'units', feedback: 'With that factor the old unit does not cancel. Put the unit you want to get rid of on the opposite side from where it is now.' },
    ]);
  const finish = (prompt: string, start?: Rational) =>
    finalStep(
      prompt,
      { kind: 'number', value: numStr(ans), unit: toUnits },
      ['Multiply your amount by the factor.', 'Multiply by the number on top of the factor.', 'Divide by the number on the bottom of the factor.', 'Cross out the units that cancel and check that the units left are the ones you want.'],
      `The old unit cancels and only ${toUnits} are left, so the number is the same amount in the new units.`,
      // from a partial result, the likely slip is using the second factor upside down
      start ? [...misc, ...numberMisconceptions(ans, [{ value: start.mul(start).div(ans), tag: 'units', feedback: 'That factor was used upside down. The old unit must cancel.' }]).filter((m) => !misc.some((x) => x.answer === m.answer))] : misc,
      `Type the number of ${toUnits}. Decimals are fine.`,
    );
  if (topChanges && bottomChanges) {
    const [F0, F1, T0, T1] = [task.from[0], task.from[1]!, task.to[0], task.to[1]!];
    const viaTop = amt.mul(BASE[F0].toBase).div(BASE[T0].toBase);
    const viaBottom = amt.mul(BASE[T1].toBase).div(BASE[F1].toBase);
    const topFirst = viaTop.isInteger();
    const mid = topFirst ? viaTop : viaBottom;
    const midUnits = topFirst ? `${BASE[T0].plural} per ${BASE[F1].singular}` : `${BASE[F0].plural} per ${BASE[T1].singular}`;
    const first = topFirst
      ? numStep(
          `Change one unit at a time. First change ${BASE[F0].plural} to ${BASE[T0].plural}: ${fromText} is how many ${midUnits}?`,
          mid,
          [`Only the ${BASE[F0].plural} change in this step; the "per ${BASE[F1].singular}" stays.`, `Use the fact about ${BASE[F0].plural} and ${BASE[T0].plural}.`, BASE[F0].toBase.gt(BASE[T0].toBase) ? `A ${BASE[F0].singular} is bigger than a ${BASE[T0].singular}, so you get more of them: multiply.` : `A ${BASE[F0].singular} is smaller than a ${BASE[T0].singular}, so you get fewer of them: divide.`, 'Use the number in the fact.'],
          `Converting the top unit with a factor equal to 1 does not change the rate, only how it is written: ${decTex(mid)} ${midUnits}.`,
          [{ value: amt.mul(BASE[T0].toBase).div(BASE[F0].toBase), tag: 'units', feedback: 'Check the direction: a bigger unit gives fewer of them, a smaller unit gives more.' }],
        )
      : numStep(
          `Change one unit at a time. First change "per ${BASE[F1].singular}" to "per ${BASE[T1].singular}": ${fromText} is how many ${midUnits}?`,
          mid,
          [`Only the time unit changes in this step; the ${BASE[F0].plural} stay.`, `Ask: how many ${BASE[F1].plural} are in one ${BASE[T1].singular}?`, BASE[T1].toBase.gt(BASE[F1].toBase) ? `A ${BASE[T1].singular} is longer than a ${BASE[F1].singular}, so more is covered in one ${BASE[T1].singular}: multiply.` : `A ${BASE[T1].singular} is shorter than a ${BASE[F1].singular}, so less is covered in one ${BASE[T1].singular}: divide.`, 'Use the number in the fact.'],
          `In one ${BASE[T1].singular} the amount covered is ${decTex(mid)} ${BASE[F0].plural}, so the rate is ${decTex(mid)} ${midUnits}.`,
          [{ value: amt.mul(BASE[F1].toBase).div(BASE[T1].toBase), tag: 'units', feedback: `Check the direction: in a longer time you cover more, in a shorter time less.` }],
        );
    const second = topFirst
      ? choose(`Now change the time unit. Which factor turns ${midUnits} into ${toUnits}?`, factorPair(T1, F1), `The ${BASE[F1].plural} on the bottom of the rate must cancel, so ${BASE[F1].plural} go on top of the factor.`)
      : choose(`Now change the other unit. Which factor turns ${midUnits} into ${toUnits}?`, factorPair(F0, T0), `The ${BASE[F0].plural} on top of the rate must cancel, so ${BASE[F0].plural} go on the bottom of the factor.`);
    return [first, second, finish(`Multiply ${decTex(mid)} ${midUnits} by that factor. What is the rate in ${toUnits}?`, mid)];
  }
  const pair = topChanges ? factorPair(task.from[0], task.to[0]) : factorPair(task.to[1]!, task.from[1]!);
  const what = topChanges ? `${BASE[task.from[0]].plural} into ${BASE[task.to[0]].plural}` : `"per ${BASE[task.from[1]!].singular}" into "per ${BASE[task.to[1]!].singular}"`;
  return [
    choose(
      `Which conversion factor turns ${what}?`,
      pair,
      topChanges ? `${BASE[task.from[0]].plural[0].toUpperCase()}${BASE[task.from[0]].plural.slice(1)} are on top of the amount, so they go on the bottom of the factor and cancel.` : `The ${BASE[task.from[1]!].plural} are on the bottom of the rate, so they go on top of the factor and cancel.`,
    ),
    finish(`Multiply ${fromText} by that factor. What is the answer in ${toUnits}?`),
  ];
}

function unitText(u: [string, string | null], amount: Rational): string {
  const top = amount.eq(1) ? BASE[u[0]].singular : BASE[u[0]].plural;
  return u[1] ? `${top} per ${BASE[u[1]].singular}` : top;
}

function convert(amount: Rational, from: [string, string | null], to: [string, string | null]): Rational {
  let v = amount.mul(BASE[from[0]].toBase).div(BASE[to[0]].toBase);
  if (from[1] && to[1]) v = v.div(BASE[from[1]].toBase).mul(BASE[to[1]].toBase);
  return v;
}

// Area conversions: the length fact is given, and the student squares it.
const AREA_TASKS: Array<{ from: string; to: string; fact: string; amount: (r: Rng) => Rational; context: (a: string) => string }> = [
  { from: 'feet', to: 'yards', fact: '1 yard = 3 feet', amount: (r) => Q(9 * r.int(2, 12)), context: (a) => `A rug covers ${a}.` },
  { from: 'yards', to: 'feet', fact: '1 yard = 3 feet', amount: (r) => Q(r.int(4, 30)), context: (a) => `The carpet for a bedroom floor covers ${a}.` },
  { from: 'feet', to: 'inches', fact: '1 foot = 12 inches', amount: (r) => Q(r.int(2, 6)), context: (a) => `A window pane has an area of ${a}.` },
  { from: 'meters', to: 'centimeters', fact: '1 meter = 100 centimeters', amount: (r) => Q(r.int(2, 5)), context: (a) => `A poster has an area of ${a}.` },
];
const SINGLE: Record<string, string> = { inches: 'inch', feet: 'foot', yards: 'yard', centimeters: 'centimeter', meters: 'meter' };
const LENGTH_IN_CM: Record<string, Rational> = { inches: Q('2.54'), feet: Q('30.48'), yards: Q('91.44'), centimeters: Q(1), meters: Q(100) };

function areaProblem(rng: Rng): Problem {
  const task = rng.pick(AREA_TASKS);
  const amt = task.amount(rng);
  const lin = LENGTH_IN_CM[task.from].div(LENGTH_IN_CM[task.to]); // one "from" length in "to" lengths
  const ans = amt.mul(lin).mul(lin);
  const [one, many] = task.fact.split(' = ');
  const big = Q(many.split(' ')[0]);
  const bigSq = big.mul(big);
  const toUnits = `square ${task.to}`;
  const fromText = `${decTex(amt)} square ${task.from}`;
  const shrinking = lin.lt(1);
  const smallUnit = many.replace(/^[\d.]+ /, '');
  const areaMisc = numberMisconceptions(ans, [
    { value: amt.mul(lin), tag: 'units', feedback: 'Area is measured in square units. Use the length fact twice: once for the length and once for the width.' },
    { value: amt.div(lin).div(lin), tag: 'units', feedback: 'Check the direction: a bigger unit needs fewer of them, and a smaller unit needs more.' },
  ]);
  return makeProblem({
    skillId: 'S1.16',
    tags: ['real-world', 'word'],
    prompt: [p(`${task.context(fromText)} Convert this to ${toUnits}.`), p(`Use: ${task.fact}.`)],
    answer: { kind: 'number', value: numStr(ans), unit: toUnits },
    inputHint: `Type the number of ${toUnits}.`,
    hints: [
      'A square unit is a square that is 1 unit long on each side, so area conversions use the length fact twice.',
      `Draw ${one.replace(/^1 /, '1 square ')}: it is ${many} long and ${many} wide.`,
      `So ${one.replace(/^1 /, '1 square ')} is $${big.toTex()} \\times ${big.toTex()}$ ${many.replace(/^[\d.]+ /, 'square ')}.`,
      shrinking ? `You are changing to a bigger unit, so you need fewer of them: divide by $${bigSq.toTex()}$.` : `You are changing to a smaller unit, so you need more of them: multiply by $${bigSq.toTex()}$.`,
    ],
    solution: [
      { text: 'Square the length fact.', tex: `1\\text{ square ${one.replace(/^1 /, '')}} = ${big.toTex()} \\times ${big.toTex()}\\text{ square ${many.replace(/^[\d.]+ /, '')}} = ${bigSq.toTex()}\\text{ square ${many.replace(/^[\d.]+ /, '')}}`, why: 'A square that is 1 unit on a side is split into a grid with that many smaller squares along each side.' },
      { text: shrinking ? `Divide by $${bigSq.toTex()}$.` : `Multiply by $${bigSq.toTex()}$.`, tex: `${decTex(amt)} ${shrinking ? '\\div' : '\\times'} ${bigSq.toTex()} = ${decTex(ans)}`, why: `Each conversion factor is equal to 1, so the area itself does not change; only the units do. So ${fromText} is ${decTex(ans)} ${toUnits}.` },
    ],
    misconceptions: areaMisc,
    steps: [
      numStep(
        `${one.replace(/^1 /, '1 square ')} is a square ${many} on each side. How many square ${smallUnit} are in ${one.replace(/^1 /, '1 square ')}?`,
        bigSq,
        ['A square unit is a 1-by-1 square.', `Picture the big square split into a grid of small squares: ${big.toTex()} along each side.`, 'The number of small squares is (squares along the length) times (squares along the width).', `Multiply $${big.toTex()} \\times ${big.toTex()}$.`],
        `The big square is a ${big.toTex()}-by-${big.toTex()} grid of small squares, so it holds $${bigSq.toTex()}$ of them.`,
        [
          { value: big, tag: 'units', feedback: 'That is the length fact. A square has a length and a width, so use the fact twice.' },
          { value: big.mul(2), tag: 'units', feedback: 'Multiply the length by the width; do not add them.' },
        ],
      ),
      choiceStep(
        `You are changing ${fromText} into ${toUnits}. Do you multiply or divide by $${bigSq.toTex()}$?`,
        [`Multiply by $${bigSq.toTex()}$`, `Divide by $${bigSq.toTex()}$`],
        shrinking ? 1 : 0,
        [`Which unit is bigger: a square ${SINGLE[task.from]} or a square ${SINGLE[task.to]}?`, 'Changing to a smaller unit takes more of them to cover the same area.', 'Changing to a bigger unit takes fewer of them.', 'More of them means multiply; fewer means divide.'],
        shrinking ? `A square ${SINGLE[task.to]} is bigger, so you need fewer of them: divide.` : `A square ${SINGLE[task.to]} is smaller, so you need more of them: multiply.`,
        [{ index: shrinking ? 0 : 1, tag: 'units', feedback: 'Check the direction: a bigger unit needs fewer of them, and a smaller unit needs more.' }],
      ),
      finalStep(
        `Do it. How many ${toUnits} is ${fromText}?`,
        { kind: 'number', value: numStr(ans), unit: toUnits },
        [`Use the number of small squares in one big square from the first step.`, 'Use the operation you just chose.', shrinking ? `Divide $${decTex(amt)}$ by $${bigSq.toTex()}$.` : `Multiply $${decTex(amt)}$ by $${bigSq.toTex()}$.`, 'The area itself has not changed; only the units have.'],
        'Each conversion factor equals 1, so the area stays the same and only the units change.',
        areaMisc,
        `Type the number of ${toUnits}.`,
      ),
    ],
  });
}

/** "In C(m) = 15m + 50, what are the units of 15?" */
function unitsOfNumberProblem(rng: Rng): Problem {
  let ctx = buildContext(rng, ['gym', 'savings', 'battery', 'tank', 'hike', 'rideshare', 'candle']);
  // the rate and the starting value must be different numbers, or "the number 20" would be ambiguous
  while (ctx.m.abs().eq(ctx.b.abs())) ctx = buildContext(rng, ['gym', 'savings', 'battery', 'tank', 'hike', 'rideshare', 'candle']);
  const askRate = rng.bool();
  const outWord = ctx.outUnit === '%' ? 'percent' : ctx.outUnit;
  const outSingular: Record<string, string> = { dollars: 'dollar', percent: 'percent', gallons: 'gallon', feet: 'foot', centimeters: 'centimeter' };
  const num = askRate ? ctx.m : ctx.b;
  const rateLabel = ctx.rateUnit;
  const inverse = `${ctx.inUnits} per ${outSingular[outWord]}`;
  const answer = makeChoice(rng, askRate ? rateLabel : outWord, askRate ? [inverse, outWord, ctx.inUnits] : [rateLabel, ctx.inUnits, inverse]);
  const idOf = (label: string) => answer.options.find((o) => o.label === label)!.id;
  return makeProblem({
    skillId: 'S1.16',
    tags: ['real-world', 'word'],
    prompt: [p(`${ctxStory(ctx)} Here $${ctx.v}$ is measured in ${ctx.inUnits} and $${ctx.f}(${ctx.v})$ in ${outWord}.`), p(`What are the units of the number $${decTex(num)}$ in this rule?`)],
    answer,
    hints: [
      'Every number in a model has units. Ask what the number measures in the situation.',
      `Is $${decTex(num)}$ multiplied by the input $${ctx.v}$, or is it added on by itself?`,
      'A number multiplied by the input is a rate: (output units) per (one input unit). A number added by itself has the same units as the output.',
      `Check: (${ctx.rateUnit}) $\\times$ (${ctx.inUnits}) gives ${outWord}, the units of the output.`,
    ],
    solution: [
      { text: askRate ? `$${decTex(num)}$ multiplies the input.` : `$${decTex(num)}$ is added on its own.`, tex: `${ctx.f}(${ctx.v}) = ${linearTex(ctx.m, ctx.b, ctx.v, true)}`, why: askRate ? `It tells how much the output changes for each ${ctx.inUnit}: ${ctx.rateMeaning}.` : `It is the output when $${ctx.v} = 0$: ${ctx.startMeaning}.` },
      { text: `So its units are ${askRate ? rateLabel : outWord}.`, why: askRate ? `Multiplying ${rateLabel} by a number of ${ctx.inUnits} cancels the ${ctx.inUnits} and leaves ${outWord}, so every term in the rule is in ${outWord}.` : 'Every term in the rule must have the same units as the output, so the terms can be added.' },
    ],
    misconceptions: askRate
      ? [
          { answer: idOf(inverse), tag: 'units', feedback: 'Flip it: a rate in a model is (output units) per (one input unit).' },
          { answer: idOf(outWord), tag: 'units', feedback: `That number is multiplied by the number of ${ctx.inUnits}, so it counts ${outWord} for each ${ctx.inUnit}.` },
        ]
      : [{ answer: idOf(rateLabel), tag: 'units', feedback: 'That number is not multiplied by the input, so it is not a rate. It is the starting amount of the output.' }],
    steps: [
      choiceStep(
        `Look at the rule $${ctx.f}(${ctx.v}) = ${linearTex(ctx.m, ctx.b, ctx.v, true)}$. What does the number $${decTex(num)}$ do?`,
        [MULTIPLIES, ADDED_ON],
        askRate ? 0 : 1,
        ['Find the number in the rule.', `Is it written right next to $${ctx.v}$, or does it stand alone?`, `A number written next to $${ctx.v}$ is multiplied by $${ctx.v}$.`, 'A number after a plus or minus sign, with no variable, is added on by itself.'],
        askRate ? `$${decTex(num)}$ is multiplied by $${ctx.v}$, so it counts ${outWord} for each ${ctx.inUnit}: it is a rate.` : `$${decTex(num)}$ stands alone, so it is the starting amount of the output.`,
        [{ index: askRate ? 1 : 0, tag: 'units', feedback: `Look again at where $${decTex(num)}$ sits in the rule: is it next to $${ctx.v}$ or alone?` }],
      ),
      finalStep(
        `So what are the units of $${decTex(num)}$?`,
        answer,
        [
          askRate ? 'A rate has units (output units) per (one input unit).' : 'A number added by itself has the same units as the output.',
          `The output is measured in ${outWord}.`,
          `The input is measured in ${ctx.inUnits}.`,
          `Check: (${ctx.rateUnit}) $\\times$ (${ctx.inUnits}) gives ${outWord}.`,
        ],
        askRate ? `Multiplying ${rateLabel} by ${ctx.inUnits} leaves ${outWord}, so every term of the rule is in ${outWord}.` : 'Terms can only be added when they have the same units, so the constant is in the output units.',
        askRate
          ? [
              { answer: idOf(inverse), tag: 'units', feedback: 'Flip it: a rate in a model is (output units) per (one input unit).' },
              { answer: idOf(outWord), tag: 'units', feedback: `That number is multiplied by the number of ${ctx.inUnits}, so it counts ${outWord} for each ${ctx.inUnit}.` },
            ]
          : [{ answer: idOf(rateLabel), tag: 'units', feedback: 'That number is not multiplied by the input, so it is not a rate.' }],
      ),
    ],
  });
}

const MULTIPLIES = 'It is multiplied by the input, so it is a rate.';
const ADDED_ON = 'It is added on by itself, so it is a starting amount.';

function verifyUnitsOfNumber(pr: Problem): string[] {
  if (pr.answer.kind !== 'choice') return ['wrong kind'];
  const text = (pr.prompt[0] as { text: string }).text;
  const rm = /\$([A-Z])\(([a-z])\) = (.+?)\$ gives/.exec(text);
  const um = /Here \$([a-z])\$ is measured in ([a-z]+) and \$[A-Z]\([a-z]\)\$ in ([a-z]+)\./.exec(text);
  const nm = /units of the number \$(.+?)\$/.exec((pr.prompt[1] as { text: string }).text);
  if (!rm || !um || !nm) return ['cannot parse'];
  const poly = toPoly(parseExpression(rm[3].replace(/\\,|\{,\}/g, '')));
  const n = Rational.parse(nm[1]);
  const coef = poly.coeff(rm[2], 1);
  const constant = poly.evaluate({ [rm[2]]: Q(0) });
  const isRate = coef.eq(n);
  if (isRate === constant.eq(n)) return ['number is not exactly one of the rate and the constant'];
  const expect = isRate ? `${um[3]} per ${um[2].replace(/s$/, '')}` : um[3];
  if (choiceLabel(pr.answer) !== expect) return [`expected ${expect}`];
  return stepErrors(pr, [isRate ? MULTIPLIES : ADDED_ON, null]);
}

export const genUnitRates: GeneratorDef = {
  id: 'u1.unit-rates',
  skillId: 'S1.16',
  description: 'Convert a measurement or a rate using conversion factors (dimensional analysis).',
  generate(rng, difficulty) {
    if (difficulty === 1 && rng.int(0, 2) === 0) return unitsOfNumberProblem(rng);
    if (difficulty === 2 && rng.int(0, 2) === 0) return areaProblem(rng);
    const pool = difficulty === 1 ? TASKS_1 : difficulty === 2 ? TASKS_2 : TASKS_3;
    const task = rng.pick(pool);
    const amt = task.amount(rng);
    const ans = convert(amt, task.from, task.to);
    const fromText = `${decTex(amt)} ${unitText(task.from, amt)}`;
    const toUnits = unitText(task.to, Q(2));
    const isRate = !!task.from[1];
    // build the factor chain the solution shows
    const chain: string[] = [`\\frac{${decTex(amt)}\\text{ ${BASE[task.from[0]].plural}}}{${isRate ? '1\\text{ ' + BASE[task.from[1]!].singular + '}' : '1'}}`];
    if (task.from[0] !== task.to[0]) {
      const r = BASE[task.from[0]].toBase.div(BASE[task.to[0]].toBase);
      chain.push(r.gt(1) || r.eq(1) ? `\\frac{${decTex(r)}\\text{ ${BASE[task.to[0]].plural}}}{1\\text{ ${BASE[task.from[0]].singular}}}` : `\\frac{1\\text{ ${BASE[task.to[0]].singular}}}{${decTex(Q(1).div(r))}\\text{ ${BASE[task.from[0]].plural}}}`);
    }
    if (isRate && task.from[1] !== task.to[1]) {
      // the old time unit must end up on top so it cancels the one on the bottom
      const [F, T] = [BASE[task.from[1]!], BASE[task.to[1]!]];
      const r = T.toBase.div(F.toBase); // old time units in one new time unit
      chain.push(r.ge(1) ? `\\frac{${decTex(r)}\\text{ ${F.plural}}}{1\\text{ ${T.singular}}}` : `\\frac{1\\text{ ${F.singular}}}{${decTex(Q(1).div(r))}\\text{ ${T.plural}}}`);
    }
    // the "wrong direction" mistake: multiplying where you should divide
    const wrongDir = (() => {
      let v = amt;
      if (task.from[0] !== task.to[0]) v = v.mul(BASE[task.to[0]].toBase).div(BASE[task.from[0]].toBase);
      if (isRate && task.from[1] !== task.to[1]) v = v.mul(BASE[task.from[1]!].toBase).div(BASE[task.to[1]!].toBase);
      return v;
    })();
    const convMisc = numberMisconceptions(ans, [{ value: wrongDir, tag: 'units', feedback: 'Check the direction of each conversion factor. The unit you want to cancel must be on the opposite side of the fraction.' }]);
    return makeProblem({
      skillId: 'S1.16',
      tags: ['real-world', 'word'],
      prompt: [p(`${task.context(fromText)} Convert this to ${toUnits}.`), p(`Use: ${task.facts.join('; ')}.`)],
      steps: conversionSteps(task, amt, ans, fromText, toUnits, convMisc),
      answer: { kind: 'number', value: numStr(ans), unit: toUnits },
      inputHint: `Type the number of ${toUnits}. Decimals are fine.`,
      hints: [
        'Multiply by conversion factors written as fractions equal to 1, such as $\\frac{12\\text{ in}}{1\\text{ ft}}$.',
        'Arrange each fraction so the unit you want to get rid of appears once on top and once on the bottom, so it cancels.',
        `Start with $${fromText.replace(/ /g, '\\ ')}$ and ${isRate ? 'convert the top unit and the bottom unit one at a time' : 'use one conversion factor'}.`,
        'After the units cancel, multiply the numbers on top and divide by the numbers on the bottom.',
      ],
      solution: [
        { text: 'Write the amount and multiply by conversion factors.', tex: chain.join(' \\cdot '), why: 'Each factor equals 1, so the amount does not change; only the units do. Units cancel when they appear on both top and bottom.' },
        { text: 'Multiply and simplify.', tex: `= ${decTex(ans)}\\text{ ${toUnits}}`, why: `So ${fromText} is the same as ${decTex(ans)} ${toUnits}.` },
      ],
      misconceptions: convMisc,
    });
  },
  verify(pr) {
    if (pr.answer.kind === 'choice') return verifyUnitsOfNumber(pr);
    // Independent route: re-read the amount and units from the prompt and convert with base factors.
    const text = (pr.prompt[0] as { text: string }).text;
    const am = /([\d.]+) square ([a-z]+)\. Convert this to square ([a-z]+)\./.exec(text);
    if (am) {
      // area: read the length fact "1 big = k small" from the prompt and square it
      if (pr.answer.kind !== 'number') return ['wrong kind'];
      const fm = /Use: 1 ([a-z]+) = ([\d.]+) ([a-z]+)\./.exec((pr.prompt[1] as { text: string }).text);
      if (!fm) return ['cannot parse fact'];
      const plural = (w: string) => ({ yard: 'yards', foot: 'feet', meter: 'meters' })[w] ?? w;
      const k = Rational.parse(fm[2]);
      const amt = Rational.parse(am[1]);
      let expect: Rational;
      if (am[2] === plural(fm[1]) && am[3] === fm[3]) expect = amt.mul(k).mul(k);
      else if (am[2] === fm[3] && am[3] === plural(fm[1])) expect = amt.div(k).div(k);
      else return ['fact does not match the units'];
      const errs: string[] = [];
      if (!expect.eq(Rational.parse(pr.answer.value))) errs.push(`expected ${expect}`);
      if (!expect.isInteger()) errs.push('area answer is not a whole number');
      // steps: k^2 small squares in a big one; multiply when going to the smaller unit
      const toSmall = am[2] === plural(fm[1]);
      errs.push(...stepErrors(pr, [k.mul(k), `${toSmall ? 'Multiply' : 'Divide'} by $${k.mul(k).toTex()}$`, null]));
      return errs;
    }
    const mm = /([\d.]+) ([a-z]+)(?: per ([a-z]+))?\. Convert this to ([a-z]+)(?: per ([a-z]+))?\./.exec(text);
    if (!mm || pr.answer.kind !== 'number') return ['cannot parse'];
    const find = (w: string) => Object.keys(BASE).find((k) => BASE[k].plural === w || BASE[k].singular === w);
    const [fa, fb, ta, tb] = [find(mm[2]), mm[3] ? find(mm[3]) : null, find(mm[4]), mm[5] ? find(mm[5]) : null];
    if (!fa || !ta || (mm[3] && !fb) || (mm[5] && !tb)) return ['unknown unit'];
    if (BASE[fa].dim !== BASE[ta].dim || (fb && tb && BASE[fb].dim !== BASE[tb].dim)) return ['dimension mismatch'];
    const amt = Rational.parse(mm[1]);
    const factor = BASE[fa].toBase.div(BASE[ta].toBase).mul(fb && tb ? BASE[tb].toBase.div(BASE[fb].toBase) : Q(1));
    const expect = amt.mul(factor);
    const errs: string[] = [];
    if (!expect.eq(Rational.parse(pr.answer.value))) errs.push(`expected ${expect}`);
    if (!expect.isTerminatingDecimal()) errs.push('answer is not a terminating decimal');
    // steps: the keyed factor must equal 1, cancel the old unit, and carry the amount (or the
    // first step's partial result) to the answer
    const st = pr.steps;
    if (st) {
      const ci = st.findIndex((x) => x.answer.kind === 'choice');
      const ca = ci >= 0 ? st[ci].answer : null;
      const fct = ca && ca.kind === 'choice' ? parseFactor(choiceLabel(ca)) : null;
      if (!fct) return [...errs, 'no conversion-factor step'];
      const [top, bottom] = [find(fct.top), find(fct.bottom)];
      if (!top || !bottom || !fct.num.mul(BASE[top].toBase).eq(fct.den.mul(BASE[bottom].toBase))) errs.push('keyed factor is not equal to 1');
      const convertsTop = bottom === fa && top === ta;
      const convertsTime = !!fb && top === fb && bottom === tb;
      if (!convertsTop && !convertsTime) errs.push('keyed factor does not cancel the old unit');
      const before = expect.mul(fct.den).div(fct.num); // the amount the factor is applied to
      if (ci === 0) {
        if (!before.eq(amt)) errs.push('factor does not turn the amount into the answer');
        errs.push(...stepErrors(pr, [null, expect]));
      } else {
        // the other unit was converted first: the partial result is the amount with that unit changed
        const other = convertsTop ? amt.mul(BASE[tb!].toBase).div(BASE[fb!].toBase) : amt.mul(BASE[fa].toBase).div(BASE[ta].toBase);
        if (!before.eq(other)) errs.push('partial result does not match');
        errs.push(...stepErrors(pr, [other, null, expect]));
      }
    }
    return errs;
  },
};

export const U1_MODELING_GENERATORS = [genLinearModel, genUnitRates];
