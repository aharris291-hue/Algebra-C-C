/**
 * Unit 1, Lesson 1-2 generators: relations, functions, and function notation.
 * Skills S1.01 (function notation / is it a function) and S1.02 (evaluate linear functions).
 */
import type { GeneratorDef, Problem, Difficulty, Rng } from '../../core/curriculum/types';
import { Rational } from '../../core/math/rational';
import { linearTex, linearPlain, linearTexDec, decTex } from '../../core/math/format';
import { toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { Q, p, math, makeProblem, numberMisconceptions, numStr, sub, money, pickDistinct, FUNC_NAMES } from './util';

// ---------------------------------------------------------------------------
// S1.01: Is this relation a function?
// ---------------------------------------------------------------------------

interface RelationData {
  pairs: Array<[number, number]>;
  isFunction: boolean;
  /** the input paired with two outputs (when not a function) */
  badInput?: number;
  /** inputs that share an output with another input (allowed in a function) */
  sharedOutputInputs: number[];
}

function makeRelation(rng: Rng, forceNot: boolean | null): RelationData {
  const n = rng.int(4, 6);
  const xs = pickDistinct(rng, n, -6, 9);
  const ys = xs.map(() => rng.int(-5, 12));
  // make sure at least one output repeats (two inputs, same output) so students meet the "allowed" case
  if (n >= 4) ys[n - 1] = ys[0];
  const isFunction = forceNot === null ? rng.bool() : !forceNot;
  const pairs: Array<[number, number]> = xs.map((x, i) => [x, ys[i]]);
  let badInput: number | undefined;
  if (!isFunction) {
    const idx = rng.int(1, n - 2);
    badInput = xs[idx];
    let other = rng.int(-5, 12);
    while (other === ys[idx]) other = rng.int(-5, 12);
    pairs.splice(rng.int(0, pairs.length), 0, [badInput, other]);
  }
  const shared = pairs
    .filter(([x, y]) => pairs.some(([x2, y2]) => y2 === y && x2 !== x))
    .map(([x]) => x)
    .filter((x) => x !== badInput);
  return { pairs, isFunction, badInput, sharedOutputInputs: [...new Set(shared)] };
}

function relationIsFunction(pairs: Array<[number, number]>): boolean {
  const seen = new Map<number, number>();
  for (const [x, y] of pairs) {
    if (seen.has(x) && seen.get(x) !== y) return false;
    seen.set(x, y);
  }
  return true;
}

function pairsTex(pairs: Array<[number, number]>): string {
  return `\\{${pairs.map(([x, y]) => `(${x}, ${y})`).join(',\\ ')}\\}`;
}

export const genIsFunction: GeneratorDef = {
  id: 'u1.is-function',
  skillId: 'S1.01',
  description: 'Decide whether a set of ordered pairs or a table is a function; find the input with two outputs.',
  generate(rng: Rng, difficulty: Difficulty): Problem {
    const asTable = rng.bool();
    if (difficulty === 1) {
      const rel = makeRelation(rng, null);
      const display = asTable
        ? [p('Here is a relation shown as a table.'), { t: 'table' as const, headers: ['x (input)', 'y (output)'], rows: rel.pairs.map(([x, y]) => [String(x), String(y)]) }]
        : [p('Here is a relation shown as a set of ordered pairs:'), math(pairsTex(rel.pairs))];
      return makeProblem({
        skillId: 'S1.01',
        tags: [],
        prompt: [...display, p('Is this relation a function?')],
        answer: { kind: 'choice', options: [{ id: 'yes', label: 'Yes, it is a function' }, { id: 'no', label: 'No, it is not a function' }], correct: rel.isFunction ? 'yes' : 'no' },
        hints: [
          'A function gives each input exactly one output.',
          'Look only at the x-values (inputs). Does any x-value appear more than once?',
          'If an x-value repeats, check whether it is paired with two different y-values. Repeated y-values are allowed.',
          `The inputs are ${rel.pairs.map(([x]) => x).join(', ')}. Find any input that shows up twice, then compare its outputs.`,
        ],
        solution: rel.isFunction
          ? [
              { text: 'List the inputs (x-values).', tex: rel.pairs.map(([x]) => x).join(',\\ '), why: 'A relation is a function when no input has two different outputs.' },
              { text: 'No input is paired with two different outputs.', why: rel.sharedOutputInputs.length ? 'Some inputs share the same output. That is allowed, like two friends having the same birthday.' : 'Every input appears once.' },
              { text: 'So the relation is a function.' },
            ]
          : [
              { text: 'List the inputs (x-values).', tex: rel.pairs.map(([x]) => x).join(',\\ '), why: 'A relation is a function when no input has two different outputs.' },
              { text: `The input ${rel.badInput} appears twice, with two different outputs.`, tex: rel.pairs.filter(([x]) => x === rel.badInput).map(([x, y]) => `(${x}, ${y})`).join(' \\text{ and } '), why: 'One input with two outputs breaks the rule of a function.' },
              { text: 'So the relation is not a function.' },
            ],
        misconceptions: [],
      });
    }
    // difficulty 2/3: identify the input with two outputs
    const rel = makeRelation(rng, true);
    const display = asTable
      ? [{ t: 'table' as const, headers: ['x (input)', 'y (output)'], rows: rel.pairs.map(([x, y]) => [String(x), String(y)]) }]
      : [math(pairsTex(rel.pairs))];
    const bad = Q(rel.badInput!);
    return makeProblem({
      skillId: 'S1.01',
      tags: [],
      prompt: [p('This relation is **not** a function.'), ...display, p('Which input (x-value) is paired with more than one output?')],
      answer: { kind: 'number', value: String(rel.badInput) },
      inputHint: 'Type the x-value.',
      hints: [
        'In a function, every input has exactly one output. Find where that rule is broken.',
        'Scan the x-values for one that appears twice.',
        'Two different inputs can share an output. You are looking for one input with two different outputs.',
        `Write the pairs in order of x. Which x-value is listed twice with different y-values?`,
      ],
      solution: [
        { text: 'Look for an x-value that appears more than once.', why: 'A function cannot send one input to two outputs.' },
        { text: `The x-value ${rel.badInput} is paired with two outputs.`, tex: rel.pairs.filter(([x]) => x === rel.badInput).map(([x, y]) => `(${x}, ${y})`).join(' \\text{ and } ') },
        { text: `The input is ${rel.badInput}.` },
      ],
      misconceptions: numberMisconceptions(bad, [
        ...rel.sharedOutputInputs.map((x) => ({
          value: Q(x),
          tag: 'other' as const,
          feedback: 'That input shares an output with a different input, and that is allowed in a function. Look for one input with two different outputs.',
        })),
        ...rel.pairs
          .filter(([x]) => x === rel.badInput)
          .map(([, y]) => ({ value: Q(y), tag: 'graph-reading' as const, feedback: 'That is an output (y-value). The question asks for the input (x-value).' })),
      ]),
    });
  },
  verify(pr) {
    const errs: string[] = [];
    const rows: Array<[number, number]> = [];
    for (const b of pr.prompt) {
      if (b.t === 'table') for (const r of b.rows) rows.push([Number(r[0]), Number(r[1])]);
      if (b.t === 'math') {
        for (const m of b.tex.matchAll(/\((-?\d+), (-?\d+)\)/g)) rows.push([Number(m[1]), Number(m[2])]);
      }
    }
    if (rows.length < 4) errs.push('relation not found in prompt');
    const isF = relationIsFunction(rows);
    if (pr.answer.kind === 'choice') {
      if ((pr.answer.correct === 'yes') !== isF) errs.push('function answer disagrees with independent check');
    } else if (pr.answer.kind === 'number') {
      const x = Number(pr.answer.value);
      const outs = new Set(rows.filter(([a]) => a === x).map(([, b]) => b));
      if (outs.size < 2) errs.push('answer input does not have two outputs');
      const others = new Set(rows.map(([a]) => a).filter((a) => a !== x && new Set(rows.filter(([c]) => c === a).map(([, d]) => d)).size > 1));
      if (others.size) errs.push('more than one input has two outputs (ambiguous)');
    }
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S1.02: Evaluate a linear function f(a)
// ---------------------------------------------------------------------------

function pickSlopeIntercept(rng: Rng, d: Difficulty): { m: Rational; b: Rational; a: Rational } {
  if (d === 1) return { m: Q(rng.int(2, 9)), b: Q(rng.nonzeroInt(-9, 12)), a: Q(rng.int(1, 6)) };
  if (d === 2) {
    const m = Q(rng.nonzeroInt(-9, 9));
    const b = Q(rng.nonzeroInt(-12, 12));
    let a = Q(rng.nonzeroInt(-6, 6));
    // make sure negatives are involved at this level
    if (!m.isNegative() && !a.isNegative()) a = a.neg();
    return { m, b, a };
  }
  // difficulty 3: fractional slope with an input that clears the denominator, or a fractional input
  const den = rng.pick([2, 3, 4, 5]);
  let num = rng.nonzeroInt(-7, 7);
  while (num % den === 0) num = rng.nonzeroInt(-7, 7);
  const m = Q(num, den);
  const a = Q(den * rng.nonzeroInt(-4, 4));
  const b = Q(rng.nonzeroInt(-10, 10));
  return { m, b, a };
}

export const genEvalLinear: GeneratorDef = {
  id: 'u1.eval-linear',
  skillId: 'S1.02',
  description: 'Evaluate f(a) for a linear function written in function notation.',
  generate(rng, difficulty) {
    const { m, b, a } = pickSlopeIntercept(rng, difficulty);
    const f = difficulty === 1 ? 'f' : rng.pick(FUNC_NAMES);
    const rule = linearTex(m, b);
    const product = m.mul(a);
    const value = product.add(b);
    const subTex = `${f}(${a.toTex()}) = ${m.toTex()}(${a.toTex()})${b.isNegative() ? ' - ' + b.abs().toTex() : ' + ' + b.toTex()}`;
    const misconceptions = numberMisconceptions(value, [
      { value: a.isNegative() ? m.mul(a.abs()).add(b) : null, tag: 'sign-error', feedback: 'Check the sign when you multiply by a negative input. Use parentheses when you substitute a negative number.' },
      { value: m.add(a).add(b), tag: 'order-of-operations', feedback: `In $${rule}$, the number in front of $x$ is multiplied by $x$, not added to it.` },
      { value: product, tag: 'arithmetic-error', feedback: `You multiplied correctly, but the rule also has a constant term. Don't forget it.` },
      { value: product.sub(b), tag: 'sign-error', feedback: 'Check the sign of the constant term in the rule.' },
      { value: m.isZero() ? null : a.sub(b).div(m), tag: 'inverse-operation', feedback: `$${f}(${a.toTex()})$ asks for the **output** when the input is $${a.toTex()}$. It looks like you found the input that gives an output of $${a.toTex()}$.` },
    ]);
    return makeProblem({
      skillId: 'S1.02',
      tags: [],
      prompt: [p(`For the function $${f}(x) = ${rule}$, find $${f}(${a.toTex()})$.`)],
      answer: { kind: 'number', value: numStr(value) },
      hints: [
        `$${f}(${a.toTex()})$ means "the output of $${f}$ when the input $x$ is $${a.toTex()}$."`,
        `Replace every $x$ in the rule with $${sub(a)}$, then simplify using the order of operations.`,
        `Start with $${subTex}$. Multiply first.`,
        `$${m.toTex()}\\cdot ${sub(a)} = ${product.toTex()}$. Now ${b.isNegative() ? 'subtract ' + b.abs().toTex() : 'add ' + b.toTex()} to finish.`,
      ],
      solution: [
        { text: `Substitute $${a.toTex()}$ for $x$.`, tex: subTex, why: `Function notation $${f}(${a.toTex()})$ tells you the input is $${a.toTex()}$.` },
        { text: 'Multiply.', tex: `${f}(${a.toTex()}) = ${product.toTex()}${b.isNegative() ? ' - ' + b.abs().toTex() : ' + ' + b.toTex()}`, why: 'Order of operations: multiplication comes before addition.' },
        { text: b.isNegative() ? 'Subtract.' : 'Add.', tex: `${f}(${a.toTex()}) = ${value.toTex()}`, why: 'Combine the numbers to get a single output.' },
      ],
      misconceptions,
      steps: [
        {
          prompt: [p(`Substitute $${sub(a)}$ for $x$ in $${f}(x) = ${rule}$. What is $${m.toTex()}\\cdot${sub(a)}$?`)],
          answer: { kind: 'number', value: numStr(product) },
          hints: [
            'Substituting means replacing $x$ with the input value.',
            `The term $${linearTex(m, 0)}$ means $${m.toTex()}$ times $x$.`,
            `Multiply $${m.toTex()}$ by $${sub(a)}$.`,
            a.isNegative() || m.isNegative() ? 'A positive times a negative is negative; a negative times a negative is positive.' : `Think of ${a.toTex()} groups of ${m.toTex()}.`,
          ],
          misconceptions: numberMisconceptions(product, [
            { value: product.neg(), tag: 'sign-error', feedback: 'Check the sign of your product.' },
            { value: m.add(a), tag: 'order-of-operations', feedback: 'The coefficient and $x$ are multiplied, not added.' },
          ]),
          explanation: `$${m.toTex()}\\cdot ${sub(a)} = ${product.toTex()}$.`,
        },
        {
          prompt: [p(`Now finish: $${f}(${a.toTex()}) = ${product.toTex()}${b.isNegative() ? ' - ' + b.abs().toTex() : ' + ' + b.toTex()}$. What is $${f}(${a.toTex()})$?`)],
          answer: { kind: 'number', value: numStr(value) },
          hints: [
            'Combine the two numbers.',
            b.isNegative() ? `Subtract $${b.abs().toTex()}$ from $${product.toTex()}$.` : `Add $${b.toTex()}$ to $${product.toTex()}$.`,
            'Use a number line if the signs are tricky.',
            `Start at $${product.toTex()}$ and move ${b.abs().toTex()} ${b.isNegative() ? 'left' : 'right'}.`,
          ],
          misconceptions: numberMisconceptions(value, [{ value: product.sub(b), tag: 'sign-error', feedback: 'Check the sign of the constant term.' }]),
          explanation: `$${f}(${a.toTex()}) = ${value.toTex()}$.`,
        },
      ],
    });
  },
  verify(pr) {
    // Independent route: parse the rule from the prompt and evaluate exactly with the polynomial engine.
    const errs: string[] = [];
    const text = (pr.prompt[0] as { text: string }).text;
    const m = /\$([fgh])\(x\) = (.+?)\$, find \$\1\((.+?)\)\$/.exec(text);
    if (!m) return ['cannot parse prompt'];
    const rule = m[2].replace(/\\frac\{(-?\d+)\}\{(\d+)\}/g, '($1/$2)').replace(/-\(/g, '-1(');
    const input = m[3].replace(/\\frac\{(-?\d+)\}\{(\d+)\}/g, '($1/$2)');
    const poly = toPoly(parseExpression(rule));
    const x = toPoly(parseExpression(input)).constantValue();
    const val = poly.evaluate({ x });
    if (pr.answer.kind !== 'number' || !Rational.parse(pr.answer.value).eq(val)) errs.push(`answer ${JSON.stringify(pr.answer)} != ${val}`);
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S1.02 in context: evaluate a real-world linear function
// ---------------------------------------------------------------------------

interface Ctx {
  name: string;
  build(rng: Rng): { f: string; v: string; m: Rational; b: Rational; a: Rational; story: string; ask: string; unit: string; isMoney: boolean; meaning: (val: Rational) => string };
}

const CONTEXTS: Ctx[] = [
  {
    name: 'gaming subscription',
    build(rng) {
      const fee = Q(rng.pick([10, 15, 20, 25]));
      const monthly = Q(rng.pick([8, 10, 12, 15]));
      const a = Q(rng.int(3, 12));
      return { f: 'C', v: 'm', m: monthly, b: fee, a, story: `A gaming subscription has a one-time ${money(fee)} sign-up fee plus ${money(monthly)} per month. The total cost after $m$ months is $C(m) = ${linearTexDec(monthly, fee, 'm')}$.`, ask: `Find $C(${a.toTex()})$.`, unit: 'dollars', isMoney: true, meaning: (val) => `The total cost for ${a.toTex()} months is ${money(val)}.` };
    },
  },
  {
    name: 'rideshare',
    build(rng) {
      const base = Q(rng.pick(['2.5', '3', '3.5', '4']));
      const perMile = Q(rng.pick(['1.5', '1.75', '2', '2.25']));
      const a = Q(rng.int(2, 15));
      return { f: 'F', v: 'd', m: perMile, b: base, a, story: `A rideshare app charges a ${money(base)} pickup fee plus ${money(perMile)} per mile. The fare for a $d$-mile ride is $F(d) = ${linearTexDec(perMile, base, 'd')}$.`, ask: `Find $F(${a.toTex()})$.`, unit: 'dollars', isMoney: true, meaning: (val) => `A ${a.toTex()}-mile ride costs ${money(val)}.` };
    },
  },
  {
    name: 'savings',
    build(rng) {
      const start = Q(rng.pick([40, 75, 120, 150, 200]));
      const weekly = Q(rng.pick([15, 20, 25, 30, 35]));
      const a = Q(rng.int(2, 20));
      return { f: 'S', v: 'w', m: weekly, b: start, a, story: `Jordan has ${money(start)} saved and adds ${money(weekly)} from a part-time job every week. After $w$ weeks the savings are $S(w) = ${linearTexDec(weekly, start, 'w')}$.`, ask: `Find $S(${a.toTex()})$.`, unit: 'dollars', isMoney: true, meaning: (val) => `After ${a.toTex()} weeks, Jordan has ${money(val)} saved.` };
    },
  },
  {
    name: 'car wash',
    build(rng) {
      const supplies = Q(rng.pick([30, 40, 45, 60]));
      const price = Q(rng.pick([5, 6, 8, 10]));
      const a = Q(rng.int(4, 30));
      return { f: 'P', v: 'c', m: price, b: supplies.neg(), a, story: `The band holds a car wash. Supplies cost ${money(supplies)}, and each car washed brings in ${money(price)}. The profit after washing $c$ cars is $P(c) = ${linearTexDec(price, supplies.neg(), 'c')}$.`, ask: `Find $P(${a.toTex()})$.`, unit: 'dollars', isMoney: true, meaning: (val) => `After washing ${a.toTex()} cars, the profit is ${money(val)}${val.isNegative() ? ' (a loss)' : ''}.` };
    },
  },
  {
    name: 'phone battery',
    build(rng) {
      const drain = Q(rng.pick([6, 8, 10, 12, 15]));
      const maxH = Math.floor(100 / drain.toNumber());
      const a = Q(rng.int(1, maxH));
      return { f: 'B', v: 'h', m: drain.neg(), b: Q(100), a, story: `A phone starts at 100% battery and, while streaming video, loses ${drain.toTex()}% each hour. The battery level after $h$ hours is $B(h) = ${linearTexDec(drain.neg(), 100, 'h')}$.`, ask: `Find $B(${a.toTex()})$.`, unit: 'percent', isMoney: false, meaning: (val) => `After ${a.toTex()} hours of streaming, the battery is at ${val.toTex()}%.` };
    },
  },
  {
    name: 'basketball points',
    build(rng) {
      const already = Q(rng.int(4, 20));
      const per = Q(rng.pick([2, 3]));
      const a = Q(rng.int(2, 9));
      return { f: 'T', v: 's', m: per, b: already, a, story: `A player has already scored ${already.toTex()} points. Each ${per.eq(3) ? 'three-pointer' : 'two-point shot'} adds ${per.toTex()} points, so after $s$ more shots the total is $T(s) = ${linearTexDec(per, already, 's')}$.`, ask: `Find $T(${a.toTex()})$.`, unit: 'points', isMoney: false, meaning: (val) => `After ${a.toTex()} more shots, the player has ${val.toTex()} points.` };
    },
  },
];

export const genEvalContext: GeneratorDef = {
  id: 'u1.eval-context',
  skillId: 'S1.02',
  description: 'Evaluate a linear function that models a real-world situation.',
  generate(rng, difficulty) {
    const pool = difficulty === 1 ? CONTEXTS.filter((c) => c.name !== 'car wash') : CONTEXTS;
    const ctx = rng.pick(pool).build(rng);
    const { f, v, m, b, a } = ctx;
    const product = m.mul(a);
    const value = product.add(b);
    const unitWord = ctx.unit;
    const ans = numStr(value);
    return makeProblem({
      skillId: 'S1.02',
      tags: ['real-world', 'word'],
      prompt: [p(ctx.story), p(ctx.ask)],
      answer: { kind: 'number', value: ans, unit: unitWord === 'percent' ? '%' : unitWord },
      inputHint: ctx.isMoney ? 'Type a number, like 54.50 (the $ sign is optional).' : 'Type a number.',
      hints: [
        `$${f}(${a.toTex()})$ means the output when $${v} = ${a.toTex()}$.`,
        `Replace $${v}$ with $${a.toTex()}$ in $${f}(${v}) = ${linearTexDec(m, b, v)}$.`,
        `$${f}(${a.toTex()}) = ${decTex(m)}(${a.toTex()})${b.isNegative() ? ' - ' + b.abs().toTex() : ' + ' + decTex(b)}$. Multiply first.`,
        `$${decTex(m)}(${a.toTex()}) = ${decTex(product)}$. Now ${b.isNegative() ? 'subtract ' + b.abs().toTex() : 'add ' + decTex(b)}.`,
      ],
      solution: [
        { text: `Substitute $${a.toTex()}$ for $${v}$.`, tex: `${f}(${a.toTex()}) = ${decTex(m)}(${a.toTex()})${b.isNegative() ? ' - ' + b.abs().toTex() : ' + ' + decTex(b)}`, why: `The input is ${a.toTex()}.` },
        { text: 'Multiply, then combine.', tex: `${f}(${a.toTex()}) = ${decTex(product)}${b.isNegative() ? ' - ' + b.abs().toTex() : ' + ' + decTex(b)} = ${decTex(value)}`, why: 'Multiplication comes before addition and subtraction.' },
        { text: 'Interpret the result.', why: ctx.meaning(value) },
      ],
      misconceptions: numberMisconceptions(value, [
        { value: product, tag: 'arithmetic-error', feedback: 'You found the part that depends on the input. The rule also has a starting amount. Include it.' },
        { value: m.add(b), tag: 'equation-setup', feedback: `That's the output for just 1 unit. Use the input ${a.toTex()}.` },
        { value: product.sub(b), tag: 'sign-error', feedback: 'Check the sign of the constant term.' },
      ]),
    });
  },
  verify(pr) {
    const story = (pr.prompt[0] as { text: string }).text;
    const ask = (pr.prompt[1] as { text: string }).text;
    const rm = /\$([A-Z])\(([a-z])\) = (.+?)\$\./.exec(story);
    const am = /\$([A-Z])\((.+?)\)\$/.exec(ask);
    if (!rm || !am) return ['cannot parse context prompt'];
    const poly = toPoly(parseExpression(rm[3]));
    const val = poly.evaluate({ [rm[2]]: Rational.parse(am[2]) });
    if (pr.answer.kind !== 'number' || !Rational.parse(pr.answer.value).eq(val)) return [`answer ${pr.answer.kind === 'number' ? pr.answer.value : '?'} != ${val}`];
    return [];
  },
};

// ---------------------------------------------------------------------------
// S1.01/S1.02: read function notation from a table or graph
// ---------------------------------------------------------------------------

export const genNotationTable: GeneratorDef = {
  id: 'u1.notation-table',
  skillId: 'S1.01',
  description: 'Read f(a) from a table; combine values like f(a) + f(b).',
  generate(rng, difficulty) {
    const xs = pickDistinct(rng, 5, -4, 8).sort((u, w) => u - w);
    const ys = xs.map(() => rng.int(-9, 15));
    const f = rng.pick(FUNC_NAMES);
    const table = { t: 'table' as const, headers: ['x', `${f}(x)`], rows: xs.map((x, i) => [String(x), String(ys[i])]) };
    if (difficulty === 1) {
      const i = rng.int(0, 4);
      const a = xs[i];
      const val = Q(ys[i]);
      // a misconception: reading the row where f(x) = a (swapping input/output)
      const swapped = ys.indexOf(a) >= 0 ? Q(xs[ys.indexOf(a)]) : null;
      return makeProblem({
        skillId: 'S1.01',
        tags: [],
        prompt: [p(`The table shows some values of the function $${f}$.`), table, p(`What is $${f}(${a})$?`)],
        answer: { kind: 'number', value: String(ys[i]) },
        hints: [
          `$${f}(${a})$ is the output of $${f}$ when the input is $${a}$.`,
          'Inputs are in the $x$ column. Outputs are in the other column.',
          `Find the row where $x = ${a}$.`,
          `In the row with $x = ${a}$, read across to the $${f}(x)$ column.`,
        ],
        solution: [
          { text: `Find the row where $x = ${a}$.`, why: `In $${f}(${a})$, the number in parentheses is the input.` },
          { text: `Read the output in that row: $${f}(${a}) = ${ys[i]}$.` },
        ],
        misconceptions: numberMisconceptions(val, [{ value: swapped, tag: 'graph-reading', feedback: `You found the input whose output is ${a}. In $${f}(${a})$, ${a} is the input.` }]),
      });
    }
    // difficulty 2/3: combination
    const [i, j] = pickDistinct(rng, 2, 0, 4);
    const k = difficulty === 3 ? rng.pick([2, 3, -2]) : 1;
    const op = rng.pick(['+', '-'] as const);
    const value = Q(k).mul(ys[i]).add(op === '+' ? Q(ys[j]) : Q(ys[j]).neg());
    const kTex = k === 1 ? '' : String(k);
    const expr = `${kTex}${f}(${xs[i]}) ${op} ${f}(${xs[j]})`;
    return makeProblem({
      skillId: 'S1.02',
      tags: ['multi-step'],
      prompt: [p(`The table shows some values of the function $${f}$.`), table, p(`Find $${expr}$.`)],
      answer: { kind: 'number', value: numStr(value) },
      hints: [
        'Find each function value first, then do the arithmetic.',
        `Look up $${f}(${xs[i]})$ and $${f}(${xs[j]})$ in the table.`,
        `$${f}(${xs[i]}) = ${ys[i]}$. Now find $${f}(${xs[j]})$.`,
        `Replace each function value with its number: $${kTex}${k === 1 ? '' : '\\cdot'}${sub(Q(ys[i]))} ${op} ${sub(Q(ys[j]))}$. Simplify.`,
      ],
      solution: [
        { text: 'Look up each value in the table.', tex: `${f}(${xs[i]}) = ${ys[i]},\\quad ${f}(${xs[j]}) = ${ys[j]}`, why: 'Each function value is the output in the row of its input.' },
        { text: 'Substitute and simplify.', tex: `${kTex}${k === 1 ? '' : '\\cdot'}${sub(Q(ys[i]))} ${op} ${sub(Q(ys[j]))} = ${value.toTex()}`, why: 'Function values are just numbers, so use normal arithmetic.' },
      ],
      misconceptions: numberMisconceptions(value, [
        { value: Q(k).mul(xs[i]).add(op === '+' ? Q(xs[j]) : Q(xs[j]).neg()), tag: 'graph-reading', feedback: 'It looks like you used the inputs. Replace each function value with its output from the table.' },
        { value: op === '-' ? Q(k).mul(ys[i]).add(ys[j]) : null, tag: 'sign-error', feedback: 'Check the operation between the two function values.' },
      ]),
    });
  },
  verify(pr) {
    const table = pr.prompt.find((b) => b.t === 'table') as { rows: string[][] } | undefined;
    if (!table) return ['no table'];
    const map = new Map(table.rows.map((r) => [Number(r[0]), Number(r[1])]));
    const ask = (pr.prompt[2] as { text: string }).text;
    const expr = /Find \$(.+)\$\.|What is \$(.+)\$\?/.exec(ask);
    if (!expr) return ['cannot parse ask'];
    const e = (expr[1] ?? expr[2]).replace(/[fgh]\((-?\d+)\)/g, (_m, x) => {
      const v = map.get(Number(x));
      if (v === undefined) throw new Error('input not in table');
      return `(${v})`;
    });
    const val = toPoly(parseExpression(e)).constantValue();
    if (pr.answer.kind !== 'number' || !Rational.parse(pr.answer.value).eq(val)) return [`answer mismatch: ${val}`];
    return [];
  },
};

export const genNotationGraph: GeneratorDef = {
  id: 'u1.notation-graph',
  skillId: 'S1.02',
  description: 'Read f(a) from the graph of a line.',
  generate(rng, difficulty) {
    // integer slope (or ±1/2 at level 3) and intercept so lattice points are readable
    const m = difficulty === 3 ? Q(rng.pick([1, -1]), 2) : Q(rng.nonzeroInt(-3, 3));
    const b = Q(rng.int(-4, 4));
    const candidates: number[] = [];
    for (let x = -6; x <= 6; x++) {
      const y = m.mul(x).add(b);
      if (y.isInteger() && Math.abs(y.toNumber()) <= 7 && x !== 0) candidates.push(x);
    }
    const a = rng.pick(candidates);
    const value = m.mul(a).add(b);
    const f = 'f';
    return makeProblem({
      skillId: 'S1.02',
      tags: ['graph'],
      prompt: [
        p(`The graph shows the line $y = ${f}(x)$.`),
        { t: 'graph', spec: { xMin: -8, xMax: 8, yMin: -8, yMax: 8, functions: [{ expr: linearPlain(m, b), label: `y = ${f}(x)` }], ariaLabel: `Graph of a line through (0, ${b.toString()}) with slope ${m.toString()}.` } },
        p(`Use the graph to find $${f}(${a})$.`),
      ],
      answer: { kind: 'number', value: numStr(value) },
      hints: [
        `$${f}(${a})$ is the $y$-value of the point on the line where $x = ${a}$.`,
        `Find $${a}$ on the $x$-axis.`,
        `Move straight ${value.isNegative() ? 'down' : 'up'} from $x = ${a}$ until you reach the line.`,
        `From the point on the line at $x = ${a}$, move straight across to the $y$-axis and read the value there.`,
      ],
      solution: [
        { text: `Locate $x = ${a}$ on the $x$-axis.`, why: 'The input is on the horizontal axis.' },
        { text: 'Move vertically to the line and read the $y$-coordinate.', tex: `(${a}, ${value.toTex()})`, why: 'The output is the height of the graph at that input.' },
        { text: `So $${f}(${a}) = ${value.toTex()}$.` },
      ],
      misconceptions: numberMisconceptions(value, [
        { value: m.isZero() ? null : Q(a).sub(b).div(m), tag: 'graph-reading', feedback: `You found where the output is ${a}. In $${f}(${a})$, ${a} is the input, so start on the $x$-axis.` },
        { value: value.neg(), tag: 'sign-error', feedback: 'Check whether the point is above or below the $x$-axis.' },
      ]),
    });
  },
  verify(pr) {
    const g = pr.prompt.find((b) => b.t === 'graph') as { spec: { functions: Array<{ expr: string }> } };
    const ask = (pr.prompt[2] as { text: string }).text;
    const am = /f\((-?\d+)\)/.exec(ask);
    if (!g || !am) return ['cannot parse'];
    const val = toPoly(parseExpression(g.spec.functions[0].expr)).evaluate({ x: Q(Number(am[1])) });
    if (!val.isInteger()) return ['point not on lattice'];
    if (pr.answer.kind !== 'number' || !Rational.parse(pr.answer.value).eq(val)) return ['answer mismatch'];
    return [];
  },
};

export const U1_FUNCTION_GENERATORS = [genIsFunction, genEvalLinear, genEvalContext, genNotationTable, genNotationGraph];
