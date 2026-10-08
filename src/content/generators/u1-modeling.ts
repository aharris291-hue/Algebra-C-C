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
    misconceptions: [
      { answer: idOf(rateIn), tag: 'units', feedback: `The rate ${sit.rateText(r)} never changes, so it cannot be the input. It is the slope of the model.` },
      { answer: idOf(reversed), tag: 'units', feedback: 'That uses the quantity the person wants to find as the input. Which quantity is the goal?' },
      { answer: idOf(rateOut), tag: 'units', feedback: 'The rate stays the same, so it is not what the function gives back. What does the person want to know?' },
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
  return fits[0].id === pr.answer.correct ? [] : ['keyed option does not fit the rate units'];
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
    const slopeTex = `\\dfrac{${decTex(y2)} - ${decTex(y1)}}{${decTex(x2)} - ${decTex(x1)}}`;
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
      return makeProblem({
        skillId: 'S1.15',
        tags: ['real-world', 'word'],
        prompt: [...intro, p(`Write a linear model $${f}(${v})$ for this situation.`)],
        answer: { kind: 'expression', value: linearPlain(m, b, v), variables: [v] },
        inputHint: `Type the rule in ${v}, like ${linearPlain(Q(5), Q(20), v)}. You can start with ${f}(${v}) = .`,
        hints: ['A linear model has the form $f(x) = mx + b$: rate times input, plus a starting value.', ...buildHints, 'Check: your model should give both outputs in the table.'],
        solution: buildSteps,
        misconceptions: [
          ...(y1.eq(b) ? [] : [{ answer: linearPlain(m, y1, v), tag: 'equation-setup' as const, feedback: `The first data point is not at $${v} = 0$, so its output is not the starting value. Solve for $b$.` }]),
          ...(m.mul(x2.sub(x1)).eq(m) ? [] : [{ answer: linearPlain(y2.sub(y1), b, v), tag: 'slope-calc' as const, feedback: `The inputs are ${decTex(x2.sub(x1))} ${ctx.inUnits} apart, so divide the change in output by that to get the rate per ${ctx.inUnit}.` }]),
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
      return [0, 1, 7].every((x) => poly.evaluate({ [v]: Q(x) }).eq(model(Q(x)))) ? [] : ['model mismatch'];
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
    misconceptions: numberMisconceptions(ans, [
      { value: amt.mul(lin), tag: 'units', feedback: 'Area is measured in square units. Use the length fact twice: once for the length and once for the width.' },
      { value: amt.div(lin).div(lin), tag: 'units', feedback: 'Check the direction: a bigger unit needs fewer of them, and a smaller unit needs more.' },
    ]),
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
  });
}

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
  return choiceLabel(pr.answer) === expect ? [] : [`expected ${expect}`];
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
    return makeProblem({
      skillId: 'S1.16',
      tags: ['real-world', 'word'],
      prompt: [p(`${task.context(fromText)} Convert this to ${toUnits}.`), p(`Use: ${task.facts.join('; ')}.`)],
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
      misconceptions: numberMisconceptions(ans, [{ value: wrongDir, tag: 'units', feedback: 'Check the direction of each conversion factor. The unit you want to cancel must be on the opposite side of the fraction.' }]),
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
    return errs;
  },
};

export const U1_MODELING_GENERATORS = [genLinearModel, genUnitRates];
