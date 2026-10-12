/**
 * Unit 6 generators for exponential functions: function notation (S6.01), key features (S6.02),
 * domain, range and intervals (S6.03), average rate of change (S6.05) and transformations (S6.06).
 * verify() re-reads the printed function (or graph) and re-derives the answer from a, b and k.
 */
import type { GeneratorDef, Rng, Block, ProblemStep, GraphSpec, Problem } from '../../core/curriculum/types';
import type { Misconception, MisconceptionTag } from '../../core/math/answers';
import { parseInterval, intervalsEqual, parseRelation, checkAnswer } from '../../core/math/answers';
import { Rational } from '../../core/math/rational';
import { p, makeProblem, makeChoice, choiceLabel, numStr, Q, numberMisconceptions } from './util';
import { parseExpression } from '../../core/math/parser';
import { evalNumeric } from '../../core/math/evaluate';
import { mathBlocks, graphOf } from './u4-common';
import { dTex, commas, texExact } from './u5-common';
import { numStep, specStep, choiceStep, finalStep, withSteps, stepErrors } from './u5-steps';
import { type ExpFn, expFn, valueAt, rhsTex, rhsPlain, readFn, increasing, windowFor, ptLabel, parseLabel, textAll } from './u6-common';

type Mis = { value: Rational | null; tag: MisconceptionTag; feedback: string };
const exactStr = (v: Rational) => {
  const d = v.isTerminatingDecimal() ? v.toDecimalString(400) : '';
  return d && Rational.parse(d).eq(v) ? d : v.toString();
};
const numSpec = (v: Rational, unit?: string, roundTo?: number) => ({ kind: 'number' as const, value: exactStr(v), ...(unit ? { unit } : {}), ...(roundTo !== undefined ? { roundTo } : {}) });
const coefTex = (a: Rational) => (a.eq(1) ? '' : a.eq(-1) ? '-' : dTex(a));
const subX = (x: number) => (x < 0 ? `(${x})` : `${x}`);

/** Keep only interval misconceptions that are valid and differ from the key. */
function intervalMis(key: string, list: Misconception[]): Misconception[] {
  const k = parseInterval(key);
  const out: Misconception[] = [];
  for (const m of list) {
    try {
      if (!intervalsEqual(parseInterval(m.answer), k) && !out.some((o) => o.answer === m.answer)) out.push(m);
    } catch {
      /* skip */
    }
  }
  return out;
}

/** Keep only equation misconceptions that the checker marks incorrect. */
function equationMis(key: string, list: Misconception[]): Misconception[] {
  return list.filter((m, i) => list.findIndex((o) => o.answer === m.answer) === i && checkAnswer({ kind: 'equation', value: key }, m.answer).status === 'incorrect');
}

// ---------------------------------------------------------------------------
// S6.01: evaluate and interpret exponential functions
// ---------------------------------------------------------------------------

const CONTEXTS = [
  { fn: 'P', v: 't', what: 'the population of a town $t$ years after 2020', noun: 'population', unit: 'people', per: 'year', a: [1200, 2500, 4000, 8000], b: ['1.03', '1.05', '1.1'], round: 0 },
  { fn: 'V', v: 't', what: 'the value of a used car, in dollars, $t$ years after it was bought', noun: 'value', unit: 'dollars', per: 'year', a: [16000, 20000, 24000], b: ['0.85', '0.9', '0.8'], round: 2 },
  { fn: 'B', v: 'h', what: 'the number of bacteria in a sample $h$ hours after it was collected', noun: 'number of bacteria', unit: 'bacteria', per: 'hour', a: [50, 200, 500], b: ['2', '3', '1.5'], round: 0 },
  { fn: 'S', v: 'w', what: 'the number of followers of a new account $w$ weeks after it was created', noun: 'number of followers', unit: 'followers', per: 'week', a: [80, 150, 300], b: ['1.4', '1.25', '2'], round: 0 },
];

export const genEvaluateExp: GeneratorDef = {
  id: 'u6.evaluate-exp',
  skillId: 'S6.01',
  description: 'Evaluate exponential functions, including negative inputs, and interpret function notation in context.',
  generate(rng, difficulty) {
    const name = rng.pick(['f', 'g', 'h']);
    if (difficulty <= 2) {
      let f: ExpFn;
      let x: number;
      if (difficulty === 1) {
        const b = rng.pick([2, 3, 4, 5]);
        f = expFn(rng.pick([1, 2, 3, 4, 5, 10]), b);
        x = rng.int(2, b === 2 ? 5 : b === 3 ? 4 : 3);
      } else if (rng.bool()) {
        const b = rng.pick([2, 3, 4]);
        f = expFn(rng.pick([2, 3, 5, 6, 8, 12, 16]), b);
        x = rng.pick([0, -1, -1, -2, -2, -3].filter((t) => b ** -t <= 64));
      } else {
        const b = rng.pick(['1/2', '1/3', '0.5', '1/4']);
        const inv = Number(Q(b).inv().num);
        x = rng.int(1, inv === 2 ? 4 : 2);
        f = expFn(inv ** x * rng.pick([1, 2, 3, 5]), b);
      }
      const v = valueAt(f, x);
      const fx = `${name}(x) = ${rhsTex(f)}`;
      const bx = f.b.pow(x);
      const mis: Mis[] = [
        { value: f.a.mul(f.b).mul(x), tag: 'exponent-rule', feedback: 'The exponent means repeated multiplication of the base, not multiplying the base by $x$.' },
        { value: f.a.isInteger() && f.b.isInteger() && x >= 0 && x <= 6 ? f.a.mul(f.b).pow(x) : null, tag: 'order-of-operations', feedback: 'Only the base is raised to the power. Find the power first, then multiply by the number in front.' },
        { value: x < 0 ? f.a.mul(f.b.pow(-x)).neg() : null, tag: 'exponent-rule', feedback: 'A negative exponent means a reciprocal, not a negative number.' },
        { value: x === 0 ? Q(0) : null, tag: 'exponent-rule', feedback: 'Any nonzero number to the zero power is 1, not 0.' },
        { value: !f.b.isInteger() && x > 0 ? f.a.mul(f.b.inv().pow(x)) : null, tag: 'growth-decay', feedback: 'The base is less than 1, so each factor makes the value smaller. Multiply by the base itself; do not divide by it.' },
        { value: !f.a.eq(1) ? bx : null, tag: 'order-of-operations', feedback: 'You found the power but did not multiply it by the number in front.' },
        { value: x >= 2 ? f.a.mul(f.b.pow(x - 1)) : null, tag: 'exponent-rule', feedback: `Count the factors: the exponent ${x} means ${x} factors of the base, so you used one too few.` },
      ];
      return withSteps(makeProblem({
        skillId: 'S6.01',
        tags: [],
        prompt: [p(`Evaluate $${name}(${x})$.`), { t: 'math', tex: fx }],
        answer: numSpec(v),
        inputHint: 'Type a number or a fraction.',
        hints: [`Replace $x$ with $${x}$.`, 'Exponents come before multiplication.', x < 0 ? 'A negative exponent means one over the positive power.' : x === 0 ? 'Any nonzero number to the zero power is 1.' : `Find $${f.b.isInteger() ? f.b.toTex() : `\\left(${dTex(f.b)}\\right)`}^{${x}}$ first.`, 'Then multiply by the number in front.'],
        solution: [
          { text: `Substitute $x = ${x}$.`, tex: `${name}(${x}) = ${f.a.eq(1) ? '' : dTex(f.a)}\\left(${dTex(f.b)}\\right)^{${x}}`, why: `$${name}(${x})$ means the output of $${name}$ when the input is $${x}$.` },
          { text: 'Evaluate the power.', tex: `\\left(${dTex(f.b)}\\right)^{${x}} = ${bx.toTex()}`, why: x < 0 ? 'A negative exponent means the reciprocal of the positive power.' : x === 0 ? 'Any nonzero number to the zero power is 1.' : `That is ${x} factor${x === 1 ? '' : 's'} of $${dTex(f.b)}$.` },
          { text: 'Multiply.', tex: `${dTex(f.a)} \\cdot ${bx.toTex()} = ${v.toTex()}` },
        ],
        misconceptions: numberMisconceptions(v, mis),
      }), (pr) => [
        numStep(`Substitute $x = ${x}$. Exponents come first: what is $${f.b.isInteger() ? dTex(f.b) : `\\left(${dTex(f.b)}\\right)`}^{${x}}$?`, bx, [x < 0 ? 'A negative exponent means one over the positive power.' : x === 0 ? 'Think about the pattern of powers: each time the exponent goes down by 1, you divide by the base.' : `The exponent ${x} means ${x} factors of the base multiplied together.`, x < 0 ? `First find $${f.b.isInteger() ? dTex(f.b) : `\\left(${dTex(f.b)}\\right)`}^{${-x}}$.` : x === 0 ? 'Any nonzero number to the zero power has the same value.' : `Write out the ${x} factors of $${dTex(f.b)}$.`, x < 0 ? 'Then take the reciprocal of that result.' : x === 0 ? 'It is not 0.' : 'Multiply them in order.', 'Leave the number in front for the next step.'], x < 0 ? `$${f.b.isInteger() ? dTex(f.b) : `\\left(${dTex(f.b)}\\right)`}^{${x}} = \\frac{1}{${f.b.isInteger() ? dTex(f.b) : `\\left(${dTex(f.b)}\\right)`}^{${-x}}} = ${bx.toTex()}$: a negative exponent means a reciprocal.` : x === 0 ? 'Any nonzero number to the zero power is 1.' : `${x} factors of $${dTex(f.b)}$ multiply to $${bx.toTex()}$.`, [{ value: f.b.mul(x), tag: 'exponent-rule', feedback: 'The exponent means repeated multiplication of the base, not the base times the exponent.' }, { value: x < 0 ? f.b.pow(-x).neg() : null, tag: 'exponent-rule', feedback: 'A negative exponent means a reciprocal, not a negative number.' }, { value: x === 0 ? Q(0) : null, tag: 'exponent-rule', feedback: 'Any nonzero number to the zero power is 1, not 0.' }, { value: !f.b.isInteger() && x > 0 ? f.b.inv().pow(x) : null, tag: 'growth-decay', feedback: 'The base is less than 1, so its powers get smaller. Multiply the base by itself; do not flip it over.' }], { inputHint: 'Type a number or a fraction.' }),
        finalStep(pr, f.a.eq(1) ? `The number in front is 1. What is $${name}(${x})$?` : `Now multiply by the number in front, $${dTex(f.a)}$. What is $${name}(${x})$?`, ['The function is the number in front times the power.', 'Use the value of the power from the last step.', f.a.eq(1) ? 'Multiplying by 1 changes nothing.' : `Multiply $${dTex(f.a)}$ by that value.`, 'Simplify any fraction.'], `$${name}(${x}) = ${dTex(f.a)} \\cdot ${bx.toTex()} = ${v.toTex()}$.`),
      ]);
    }
    const kind = rng.pick(['compute', 'interpret', 'solve'] as const);
    if (kind === 'solve') {
      const b = rng.pick([2, 2, 3, 4, 5]);
      const a = rng.pick([2, 3, 4, 5, 10]);
      const n = rng.int(2, b === 2 ? 6 : 3);
      const f = expFn(a, b);
      const target = valueAt(f, n);
      return withSteps(makeProblem({
        skillId: 'S6.01',
        tags: ['multi-step'],
        prompt: [p(`For the function below, find $x$ so that $${name}(x) = ${target.toTex()}$.`), { t: 'math', tex: `${name}(x) = ${rhsTex(f)}` }],
        answer: numSpec(Q(n)),
        hints: [`Set $${rhsTex(f)} = ${target.toTex()}$.`, `Divide both sides by $${a}$ first.`, `Write the result as a power of $${b}$.`, 'Same base, so the exponents are equal.'],
        solution: [
          { text: 'Set the output equal to the value.', tex: `${rhsTex(f)} = ${target.toTex()}` },
          { text: `Divide both sides by ${a}.`, tex: `${b}^{x} = ${Q(b).pow(n).toTex()}`, why: `The ${a} multiplies the power, so undo it first.` },
          { text: `Write the right side as a power of ${b} and match exponents.`, tex: `${b}^{x} = ${b}^{${n}} \\Rightarrow x = ${n}`, why: 'Equal powers of the same base have equal exponents.' },
        ],
        misconceptions: numberMisconceptions(Q(n), [
          { value: target.div(a * b), tag: 'exponent-rule', feedback: `After dividing by ${a}, write the result as a power of ${b}. Dividing by ${b} does not undo the exponent.` },
          { value: target.div(a), tag: 'inverse-operation', feedback: `That is the value of $${b}^{x}$. Now find the exponent $x$.` },
        ]),
      }), (pr) => [
        numStep(`Set $${rhsTex(f)} = ${target.toTex()}$ and divide both sides by ${a}. What does $${b}^{x}$ equal?`, target.div(a), [`The ${a} multiplies the power, so undo it first.`, `Divide both sides by ${a}.`, `Find $${target.toTex()} \\div ${a}$.`, 'The power is now alone on the left.'], `$${b}^{x} = ${target.toTex()} \\div ${a} = ${target.div(a).toTex()}$.`, [{ value: target.sub(a), tag: 'inverse-operation', feedback: `The ${a} multiplies the power. Undo it by dividing, not subtracting.` }, { value: target.div(a * b), tag: 'exponent-rule', feedback: `Only divide by ${a}; the base ${b} is part of the power.` }]),
        finalStep(pr, `Write $${target.div(a).toTex()}$ as a power of $${b}$. What is $x$?`, [`Multiply $${b}$ by itself until you reach $${target.div(a).toTex()}$.`, `Count the factors of $${b}$.`, 'Equal powers of the same base have equal exponents.', 'Check by substituting your answer.'], `$${target.div(a).toTex()} = ${b}^{${n}}$, so $x = ${n}$.`),
      ]);
    }
    const c = rng.pick(CONTEXTS);
    const f = expFn(rng.pick(c.a), rng.pick(c.b));
    const t = rng.int(2, 6);
    const v = valueAt(f, t);
    const fx = `${c.fn}(${c.v}) = ${rhsTex(f, c.v)}`;
    if (kind === 'compute') {
      const places = c.round;
      return withSteps(makeProblem({
        skillId: 'S6.01',
        tags: ['real-world'],
        prompt: [p(`The function below gives ${c.what}.`), { t: 'math', tex: fx }, p(`Find $${c.fn}(${t})$. ${places === 2 ? 'Round to the nearest cent.' : 'Round to the nearest whole number.'}`)],
        answer: numSpec(v, c.unit === 'dollars' ? 'dollars' : undefined, places),
        inputHint: places === 2 ? 'Type an amount like 1234.56.' : 'Type a whole number.',
        hints: [`Substitute $${c.v} = ${t}$.`, `Raise $${dTex(f.b)}$ to the power ${t} first.`, `Then multiply by $${dTex(f.a)}$.`, 'Round only at the very end.'],
        solution: [
          { text: `Substitute $${c.v} = ${t}$.`, tex: `${c.fn}(${t}) = ${dTex(f.a)}\\left(${dTex(f.b)}\\right)^{${t}}`, why: `$${c.fn}(${t})$ is the ${c.noun} when $${c.v} = ${t}$.` },
          { text: 'Evaluate and round.', tex: `${c.fn}(${t}) \\approx ${places === 2 ? v.round(2).toDecimalString(2) : commas(v.round(0))}`, why: 'Exponents first, then multiply.' },
        ],
        misconceptions: numberMisconceptions(v.round(places), [{ value: f.a.mul(f.b).mul(t).round(places), tag: 'exponent-rule', feedback: 'Raise the factor to the power; do not multiply it by the input.' }]),
      }), (pr) => [
        numStep(`Substitute $${c.v} = ${t}$. Exponents come first: what is $\\left(${dTex(f.b)}\\right)^{${t}}$?${f.b.pow(t).mul(10000).isInteger() ? '' : ' Round to 4 decimal places.'}`, f.b.pow(t), [`$${c.fn}(${t})$ means the output when $${c.v} = ${t}$.`, `The exponent ${t} means ${t} factors of $${dTex(f.b)}$.`, 'Use the power key on a calculator, or multiply step by step.', 'Do not multiply by the number in front yet.'], `$\\left(${dTex(f.b)}\\right)^{${t}} ${f.b.pow(t).mul(10000).isInteger() ? '=' : '\\approx'} ${f.b.pow(t).mul(10000).isInteger() ? dTex(f.b.pow(t)) : f.b.pow(t).round(4).toDecimalString(4)}$.`, [{ value: f.b.mul(t), tag: 'exponent-rule', feedback: 'The exponent means repeated multiplication, not the factor times the input.' }], f.b.pow(t).mul(10000).isInteger() ? {} : { roundTo: 4 }),
        finalStep(pr, `Multiply by $${dTex(f.a)}$. What is $${c.fn}(${t})$? ${places === 2 ? 'Round to the nearest cent.' : 'Round to the nearest whole number.'}`, ['The output is the number in front times the power.', 'Use the unrounded power if you can.', `Multiply by $${dTex(f.a)}$.`, 'Round only at the very end.'], `$${c.fn}(${t}) = ${dTex(f.a)}\\left(${dTex(f.b)}\\right)^{${t}} \\approx ${places === 2 ? v.round(2).toDecimalString(2) : commas(v.round(0))}$, the ${c.noun} after ${t} ${c.per}s.`),
      ]);
    }
    // interpret a statement P(t) = value
    const shown = c.round === 2 ? v.round(0) : v.round(0);
    const vText = commas(shown);
    const unitWord = c.noun.startsWith('number of') ? '' : ` ${c.unit}`;
    const valPhrase = `about $${vText}$${unitWord}`;
    const vPlain = vText.replace(/\{,\}/g, ',');
    const correct = `${t} ${c.per}s after the start, the ${c.noun} is ${valPhrase}.`;
    return withSteps(makeProblem({
      skillId: 'S6.01',
      tags: ['real-world'],
      prompt: [p(`The function below gives ${c.what}.`), { t: 'math', tex: fx }, p(`What does the statement $${c.fn}(${t}) \\approx ${vText}$ mean?`)],
      answer: makeChoice(rng, correct, [
        `${vPlain} ${c.per}s after the start, the ${c.noun} is ${t}.`,
        `The ${c.noun} increases by ${valPhrase.replace('about ', '')} every ${t} ${c.per}s.`,
        `${t} ${c.per}s before the start, the ${c.noun} was ${valPhrase}.`,
      ]),
      hints: [`In $${c.fn}(${c.v})$, the input $${c.v}$ is the number of ${c.per}s.`, 'The number inside the parentheses is the input.', 'The number after the equals sign is the output.', `The output is the ${c.noun}.`],
      solution: [
        { text: `The input is $${c.v} = ${t}$.`, why: `$${c.v}$ counts ${c.per}s since the start.` },
        { text: `The output is $${vText}$.`, why: `$${c.fn}(${c.v})$ is the ${c.noun}.` },
        { text: correct },
      ],
      misconceptions: [],
    }), (pr) => [
      numStep(`In $${c.fn}(${t}) \\approx ${vText}$, the number inside the parentheses is the input. What is the value of $${c.v}$?`, Q(t), ['Function notation is name(input) = output.', 'The input goes inside the parentheses.', `In this model the input $${c.v}$ counts ${c.per}s since the start.`, 'Read the number inside the parentheses.'], `The input is $${c.v} = ${t}$: ${t} ${c.per}s after the start.`, [{ value: shown, tag: 'other', feedback: 'That number is after the equals sign, so it is the output. The input is inside the parentheses.' }]),
      choiceStep(`What does the output $${vText}$ measure?`, [`The ${c.noun}`, `The number of ${c.per}s`], 0, ['The output is the value the function gives back.', `$${c.fn}(${c.v})$ is defined as ${c.what.replace(/ \$\w\$ .*$/, '')}.`, `The input counts ${c.per}s, so the output is the other quantity.`, 'Read the first sentence of the problem again.'], `$${c.fn}$ gives the ${c.noun}, so $${vText}$ is the ${c.noun}.`, [{ index: 1, tag: 'other', feedback: `The input counts ${c.per}s. The output is the ${c.noun}.` }]),
      finalStep(pr, `Put the two parts together. What does $${c.fn}(${t}) \\approx ${vText}$ mean?`, [`The input ${t} tells when.`, `The output ${vPlain} tells how much.`, 'The statement is about one moment, not a change.', 'Pick the sentence that uses the input as the time and the output as the amount.'], correct),
    ]);
  },
  verify(pr) {
    const text = textAll(pr);
    const tex = mathBlocks(pr)[0];
    const v = /^(\w)\((\w)\)/.exec(tex)![2];
    const f = readFn(tex, v);
    if (!f) return ['cannot read function'];
    if (pr.answer.kind === 'choice') {
      const m = /\$\w\((\d+)\) \\approx ([\d{},]+)\$/.exec(text)!;
      const t = Number(m[1]);
      const shown = Q(m[2].replace(/\{,\}/g, ''));
      const errs = valueAt(f, t).round(0).eq(shown) ? [] : ['statement value wrong'];
      if (!new RegExp(`^${t} \\w+s after the start, the .+ is about \\$${m[2].replace(/[{}]/g, '\\$&')}\\$`).test(choiceLabel(pr.answer))) errs.push('choice wrong');
      return [...errs, ...stepErrors(pr, [Q(t), null, null])];
    }
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    const ev = /^Evaluate \$\w\((-?\d+)\)\$/.exec(text) ?? /Find \$\w\((\d+)\)\$/.exec(text);
    // step 1 is the power b^x, recomputed by repeated multiplication (or division for x < 0)
    const powIter = (b: Rational, x: number) => {
      let v = Q(1);
      for (let i = 0; i < Math.abs(x); i++) v = x > 0 ? v.mul(b) : v.div(b);
      return v;
    };
    if (ev) return [...(valueAt(f, Number(ev[1])).eq(Q(pr.answer.value)) ? [] : ['value wrong']), ...stepErrors(pr, [powIter(f.b, Number(ev[1])), null])];
    const sv = /= ([\d{},]+)\$\./.exec(text);
    if (!sv) return ['cannot read'];
    const x = Q(pr.answer.value).toInt();
    return [...(valueAt(f, x).eq(Q(sv[1])) ? [] : ['x does not give the value']), ...stepErrors(pr, [Q(sv[1]).sub(f.k).div(f.a), null])];
  },
};

// ---------------------------------------------------------------------------
// S6.02: key features (intercept, asymptote, increasing/decreasing, end behavior)
// ---------------------------------------------------------------------------

function randomFn(rng: Rng, shifted: boolean): ExpFn {
  const b = rng.pick(['2', '3', '1/2', '2', '1/3', '4']);
  const a = rng.pick([1, 2, 3, 4, -1, -2, -3, 1, 2]);
  const k = shifted ? rng.nonzeroInt(-6, 6) : 0;
  return expFn(a, b, k);
}

const ASYM = (k: Rational) => `y = ${numStr(k)}`;

function graphBlock(f: ExpFn, name: string): Block {
  const xs = [-2, -1, 0, 1, 2];
  const win = windowFor([f], xs);
  const pts = [-1, 0, 1].map((x) => ({ x, y: valueAt(f, x).toNumber(), label: ptLabel(x, valueAt(f, x)) }));
  const spec: GraphSpec = {
    ...win,
    functions: [{ expr: rhsPlain(f) }, { expr: numStr(f.k), dashed: true, color: '#888888' }],
    points: pts,
    ariaLabel: `The graph of ${name}, an exponential curve through ${pts.map((q) => q.label).join(', ')}, with a dashed horizontal line at y = ${numStr(f.k)}.`,
  };
  return { t: 'graph', spec, caption: `The graph of $${name}$. The dashed line is the horizontal asymptote.` };
}


/** x-intercept of a(b)^x + k, built so that b^x = -k/a is a whole power of b (A.FGR.9.2). */
function xIntercept(rng: Rng) {
  const b = Q(rng.pick(['2', '3', '1/2', '1/3', '4', '2']));
  const a = Q(rng.pick([1, 2, 3, -1, -2]));
  const big = b.eq(2) || b.eq(Q(1, 2));
  const n = (b.gt(1) ? 1 : -1) * rng.int(1, big ? 4 : 2);
  const k = a.mul(b.pow(n)).neg();
  const f: ExpFn = { a, b, k };
  const target = k.neg().div(a);
  const fx = `f(x) = ${rhsTex(f)}`;
  const powT = `\\left(${dTex(b)}\\right)^{x}`;
  return withSteps(makeProblem({
    skillId: 'S6.02',
    tags: ['multi-step'],
    prompt: [p('What is the $x$-intercept of the graph of $f$? Give the $x$-value.'), { t: 'math', tex: fx }],
    answer: numSpec(Q(n)),
    inputHint: 'Type a number.',
    hints: ['At an $x$-intercept the output is 0, so set $f(x) = 0$.', 'Move the constant to the other side.', a.eq(1) ? 'Now the power is alone.' : `Divide both sides by $${dTex(a)}$ so the power is alone.`, `Write the other side as a power of $${dTex(b)}$ and match exponents.`],
    solution: [
      { text: 'Set the function equal to 0.', tex: `${rhsTex(f)} = 0`, why: 'The graph crosses the $x$-axis where the output is 0.' },
      { text: 'Isolate the power.', tex: `${powT} = ${dTex(target)}`, why: a.eq(1) ? 'Move the constant to the other side.' : `Move the constant, then divide by $${dTex(a)}$.` },
      { text: `Write $${dTex(target)}$ as a power of $${dTex(b)}$.`, tex: `${powT} = \\left(${dTex(b)}\\right)^{${n}} \\Rightarrow x = ${n}`, why: 'Equal powers of the same base have equal exponents.' },
    ],
    misconceptions: numberMisconceptions(Q(n), [
      { value: target, tag: 'exponent-rule', feedback: 'That is the value of the power. Find the exponent that gives it.' },
      { value: a.add(k), tag: 'graph-reading', feedback: 'That is the $y$-intercept. The $x$-intercept is where the output is 0.' },
      { value: Q(-n), tag: 'sign-error', feedback: 'Check by substituting your answer: the output should be 0.' },
      { value: k.neg(), tag: 'inverse-operation', feedback: 'After moving the constant, divide by the number in front, then find the exponent.' },
    ]),
  }), (pr) => [
    numStep(`At the $x$-intercept, $f(x) = 0$. Set $${rhsTex(f)} = 0$ and get the power alone. What does $${powT}$ equal?`, target, ['The graph crosses the $x$-axis where the output is 0.', `Move the constant to the other side by ${k.isNegative() ? 'adding' : 'subtracting'} $${dTex(k.abs())}$.`, a.eq(1) ? 'Now the power is alone.' : `Then divide both sides by $${dTex(a)}$.`, 'Simplify the fraction.'], `$${powT} = ${dTex(target)}$.`, [{ value: k.neg(), tag: 'inverse-operation', feedback: a.eq(1) ? 'Check the sign when you move the constant.' : `You also need to divide by $${dTex(a)}$.` }, { value: k.div(a), tag: 'sign-error', feedback: 'Moving the constant to the other side changes its sign.' }]),
    finalStep(pr, `Write $${dTex(target)}$ as a power of $${dTex(b)}$. What is the $x$-intercept?`, [`Try small whole-number exponents of $${dTex(b)}$, including negative ones.`, 'A negative exponent means one over the positive power.', 'Equal powers of the same base have equal exponents.', 'Check: substituting your answer should make $f(x) = 0$.'], `$${dTex(target)} = \\left(${dTex(b)}\\right)^{${n}}$, so $x = ${n}$.`),
  ]);
}

/** "Which graph is f(x) = ...?" with four labeled candidate graphs (A.FGR.9.2). */
function matchGraph(rng: Rng, f: ExpFn) {
  const cands: Array<{ fn: ExpFn; why: string }> = [
    { fn: f, why: '' },
    { fn: { a: f.a.neg(), b: f.b, k: f.k }, why: 'the sign of $a$ is flipped (reflected)' },
    { fn: { a: f.a, b: f.b.inv(), k: f.k }, why: 'the base is $\\frac{1}{b}$ (it grows the other way)' },
    { fn: { a: f.a, b: f.b, k: f.k.neg() }, why: 'the asymptote is on the other side of the $x$-axis' },
  ];
  const order = rng.shuffle([0, 1, 2, 3]);
  const all = cands.map((c) => c.fn);
  const xs = [-2, -1, 0, 1, 2];
  const win = windowFor(all, xs);
  const letters = ['A', 'B', 'C', 'D'];
  const graphs: Block[] = order.map((ci, i) => {
    const g = cands[ci].fn;
    const pts = [0, 1].map((x) => ({ x, y: valueAt(g, x).toNumber(), label: ptLabel(x, valueAt(g, x)) }));
    return { t: 'graph', spec: { ...win, functions: [{ expr: rhsPlain(g) }, { expr: numStr(g.k), dashed: true, color: '#888888' }], points: pts, ariaLabel: `Graph ${letters[i]}: an exponential curve through ${pts.map((q) => q.label).join(' and ')}, with a dashed asymptote at y = ${numStr(g.k)}.` }, caption: `Graph ${letters[i]}` } as Block;
  });
  const correct = letters[order.indexOf(0)];
  const inc = increasing(f);
  return withSteps(makeProblem({
    skillId: 'S6.02',
    tags: ['graph'],
    prompt: [p('Which graph shows this function?'), { t: 'math', tex: `f(x) = ${rhsTex(f)}` }, ...graphs],
    answer: { kind: 'choice' as const, options: letters.map((l) => ({ id: l.toLowerCase(), label: `Graph ${l}` })), correct: correct.toLowerCase() },
    hints: ['Find the horizontal asymptote first: it is the number added at the end.', 'Find the $y$-intercept: substitute $x = 0$.', 'Decide whether the function increases or decreases from the base and the sign of $a$.', 'Find the one graph that has all three features.'],
    solution: [
      { text: 'Asymptote.', tex: `y = ${numStr(f.k)}`, why: 'The power part approaches 0, so the outputs approach the constant.' },
      { text: '$y$-intercept.', tex: `f(0) = ${dTex(f.a)} + ${f.k.isNegative() ? `(${dTex(f.k)})` : dTex(f.k)} = ${dTex(f.a.add(f.k))}`, why: 'Any nonzero base to the power 0 is 1.' },
      { text: `Direction: $f$ is ${inc ? 'increasing' : 'decreasing'}.`, why: `$b = ${dTex(f.b)}$ is ${f.b.gt(1) ? 'greater than 1' : 'between 0 and 1'} and $a = ${dTex(f.a)}$ is ${f.a.sign() > 0 ? 'positive' : 'negative'}.` },
      { text: `Graph ${correct} is the only graph with all three features.`, why: `In the others, ${order.filter((ci) => ci !== 0).map((ci) => cands[ci].why).join('; ')}.` },
    ],
    misconceptions: [],
  }), (pr) => [
    numStep('Find the horizontal asymptote $y = k$. What is $k$?', f.k, ['In $a(b)^{x} + k$, the power part gets closer and closer to 0 on one side.', 'Then the outputs get close to the number added at the end.', 'If nothing is added, that number is 0.', 'Watch the sign of the added number.'], `The asymptote is $y = ${numStr(f.k)}$.`, [{ value: f.k.neg(), tag: 'sign-error', feedback: 'Check the sign of the number added at the end.' }, { value: f.a, tag: 'graph-reading', feedback: 'The number in front stretches the graph. The asymptote comes from the number added.' }]),
    numStep('Find the $y$-intercept: what is $f(0)$?', f.a.add(f.k), ['Substitute $x = 0$.', 'Any nonzero base to the power 0 is 1.', 'So the power part is just the number in front.', 'Then add the constant at the end.'], `$f(0) = ${dTex(f.a)}(1) ${f.k.isNegative() ? '-' : '+'} ${dTex(f.k.abs())} = ${dTex(f.a.add(f.k))}$.`, [{ value: f.k.isZero() ? null : f.a, tag: 'graph-reading', feedback: 'Do not forget to add the constant at the end.' }, { value: f.a.mul(f.b).add(f.k), tag: 'exponent-rule', feedback: 'At $x = 0$ the power is 1, not the base.' }]),
    choiceStep('Is $f$ increasing or decreasing?', ['Increasing', 'Decreasing'], inc ? 0 : 1, ['Look at the base and the sign of the number in front.', '$b > 1$ makes the power grow; $0 < b < 1$ makes it shrink.', 'A negative number in front flips the graph upside down, which reverses the direction.', `Here $b = ${dTex(f.b)}$ and $a = ${dTex(f.a)}$.`], `$b = ${dTex(f.b)}$ is ${f.b.gt(1) ? 'greater than 1' : 'between 0 and 1'} and $a$ is ${f.a.sign() > 0 ? 'positive' : 'negative'}, so $f$ is ${inc ? 'increasing' : 'decreasing'}.`, [{ index: inc ? 1 : 0, tag: 'growth-decay', feedback: f.a.sign() < 0 ? 'A negative number in front reverses the direction of the power.' : 'Compare the base with 1.' }]),
    finalStep(pr, 'Which graph has this asymptote, this $y$-intercept and this direction?', ['Check the dashed line of each graph first.', 'Then check the labeled point at $x = 0$.', 'Then check whether the curve rises or falls from left to right.', 'Only one graph has all three features.'], `Graph ${correct} is the only graph with all three features.`),
  ]);
}

/** Read an exponential a(b)^x + k back from its graph: dashed asymptote and labeled points (verify route). */
function fnFromGraph(g: GraphSpec): ExpFn | string {
  const pts = (g.points ?? []).map((q) => parseLabel(q.label!)!);
  const dashed = g.functions?.find((fn) => fn.dashed);
  if (!dashed) return 'no asymptote drawn';
  const k = Q(dashed.expr);
  const y = (x: number) => pts.find((q) => q.x.eq(x))?.y;
  const y0 = y(0);
  const y1 = y(1);
  if (!y0 || !y1) return 'missing labeled points';
  const a = y0.sub(k);
  const b = y1.sub(k).div(a);
  for (const q of g.points ?? []) if (Math.abs(q.y - a.mul(b.pow(q.x)).add(k).toNumber()) > 1e-9) return 'graph point off the curve';
  return { a, b, k };
}

export const genExpFeatures: GeneratorDef = {
  id: 'u6.exp-features',
  skillId: 'S6.02',
  description: 'Find the y-intercept, horizontal asymptote, increasing or decreasing behavior and end behavior of exponential functions.',
  generate(rng, difficulty) {
    const f = randomFn(rng, difficulty >= 2);
    const yInt = f.a.add(f.k);
    const fx = `f(x) = ${rhsTex(f)}`;
    const ask = difficulty === 3 ? rng.pick(['asym', 'yint', 'end', 'match'] as const) : difficulty === 2 ? rng.pick(['asym', 'yint', 'inc', 'xint'] as const) : rng.pick(['asym', 'yint'] as const);
    if (ask === 'xint') return xIntercept(rng);
    if (ask === 'match') return matchGraph(rng, f);
    const intro: Block[] = difficulty === 3 ? [p('The graph of an exponential function $f$ is shown. Points on the graph are labeled.'), graphBlock(f, 'f')] : [{ t: 'math', tex: fx }];
    if (ask === 'yint') {
      return withSteps(makeProblem({
        skillId: 'S6.02',
        tags: difficulty === 3 ? ['graph'] : [],
        prompt: [p(difficulty === 3 ? 'What is the $y$-intercept of the graph? Give the $y$-value.' : 'What is the $y$-intercept of the graph of $f$? Give the $y$-value.'), ...intro],
        answer: numSpec(yInt),
        hints: difficulty === 3 ? ['The $y$-intercept is where the graph crosses the $y$-axis.', 'On the $y$-axis, $x = 0$.', 'Find the labeled point whose $x$-coordinate is 0.', 'Give its $y$-coordinate.'] : ['The $y$-intercept is where $x = 0$.', 'Substitute $x = 0$.', 'Any nonzero number to the zero power is 1.', f.k.isZero() ? 'So the $y$-intercept is the number in front.' : 'Multiply by $a$, then add the vertical shift.'],
        solution: difficulty === 3 ? [{ text: 'The graph crosses the $y$-axis where $x = 0$.', why: 'Every point on the $y$-axis has $x$-coordinate 0.' }, { text: 'Read the labeled point with $x = 0$.', tex: `(0, ${numStr(yInt)})`, why: 'Its $y$-coordinate is the $y$-intercept.' }] : [
          { text: 'Substitute $x = 0$.', tex: `f(0) = ${f.a.eq(1) ? '' : f.a.eq(-1) ? '-' : dTex(f.a)}\\left(${dTex(f.b)}\\right)^{0}${f.k.isZero() ? '' : ` ${f.k.isNegative() ? '-' : '+'} ${dTex(f.k.abs())}`}`, why: 'The $y$-intercept is the point where the graph crosses the $y$-axis, where $x = 0$.' },
          { text: 'Evaluate.', tex: `f(0) = ${dTex(f.a)}(1)${f.k.isZero() ? '' : ` ${f.k.isNegative() ? '-' : '+'} ${dTex(f.k.abs())}`} = ${dTex(yInt)}` },
        ],
        misconceptions: numberMisconceptions(yInt, [
          { value: f.b, tag: 'graph-reading', feedback: 'That is the base. The $y$-intercept is the output when $x = 0$.' },
          { value: f.k.isZero() ? null : f.a, tag: 'graph-reading', feedback: 'Do not forget to add the vertical shift.' },
          { value: f.k.isZero() ? null : f.k, tag: 'graph-reading', feedback: 'That is the asymptote. The $y$-intercept is $f(0)$.' },
          { value: f.a.mul(f.b).add(f.k), tag: 'exponent-rule', feedback: 'At $x = 0$ the power $b^{0}$ is 1, not $b$.' },
        ]),
      }), (pr) => difficulty === 3
        ? [
            numStep('The $y$-intercept is on the $y$-axis. What is the $x$-coordinate of every point on the $y$-axis?', Q(0), ['The $y$-axis is the vertical axis.', 'It crosses the $x$-axis at the origin.', 'Points on it are not to the left or right of the origin.', 'So their $x$-coordinate is the same small number.'], 'Every point on the $y$-axis has $x = 0$.', [{ value: Q(1), tag: 'graph-reading', feedback: 'A point with $x = 1$ is one unit to the right of the $y$-axis.' }]),
            finalStep(pr, 'Find the labeled point with $x = 0$. What is the $y$-intercept?', ['Look for the label that starts with $(0,$.', 'The second coordinate is the $y$-value.', 'Do not use the dashed line; that is the asymptote.', 'Give just the $y$-value.'], `The point $(0, ${numStr(yInt)})$ is on the $y$-axis, so the $y$-intercept is $${dTex(yInt)}$.`),
          ]
        : [
            numStep(`Substitute $x = 0$. What is $\\left(${dTex(f.b)}\\right)^{0}$?`, Q(1), ['The $y$-intercept is where $x = 0$.', 'Think of the pattern: each time the exponent goes down by 1, you divide by the base.', 'Any nonzero number to the zero power has the same value.', 'It is not 0.'], 'Any nonzero number to the zero power is 1.', [{ value: Q(0), tag: 'exponent-rule', feedback: 'The zero power is 1, not 0.' }, { value: f.b, tag: 'exponent-rule', feedback: 'That is the power with exponent 1. Use exponent 0.' }]),
            finalStep(pr, f.k.isZero() ? `So $f(0) = ${dTex(f.a)} \\cdot 1$. What is the $y$-intercept?` : `So $f(0) = ${dTex(f.a)} \\cdot 1 ${f.k.isNegative() ? '-' : '+'} ${dTex(f.k.abs())}$. What is the $y$-intercept?`, ['Multiply the number in front by 1.', f.k.isZero() ? 'Nothing is added at the end.' : 'Then add the number at the end, keeping its sign.', 'Watch negative signs.', 'Give just the $y$-value.'], `$f(0) = ${dTex(yInt)}$.`),
          ]);
    }
    if (ask === 'asym') {
      const key = ASYM(f.k);
      return withSteps(makeProblem({
        skillId: 'S6.02',
        tags: difficulty === 3 ? ['graph'] : [],
        prompt: [p('Write the equation of the horizontal asymptote of the graph of $f$.'), ...intro],
        answer: { kind: 'equation', value: key },
        inputHint: 'Type an equation like y = 3.',
        hints: difficulty === 3
          ? ['The horizontal asymptote is the dashed line.', 'The curve gets closer and closer to it but never touches it.', 'A horizontal line has an equation like $y = c$.', 'Read where the dashed line crosses the $y$-axis.']
          : ['A horizontal asymptote is a line $y = c$ that the graph gets closer and closer to.', 'As $x$ goes far to one side, $b^{x}$ gets closer and closer to 0.', 'Think about what the whole expression gets close to then.', f.k.isZero() ? 'A number close to 0 times $a$ is still close to 0.' : 'The power part shrinks toward 0, but the number added at the end stays.'],
        solution: difficulty === 3
          ? [{ text: 'The dashed line is horizontal, so its equation is $y = c$ for some number $c$.' }, { text: 'It crosses the $y$-axis at its $y$-value.', tex: key, why: 'The curve flattens out along this line but never reaches it.' }]
          : [
              { text: `The power $\\left(${dTex(f.b)}\\right)^{x}$ gets close to 0 as $x \\to ${f.b.gt(1) ? '-\\infty' : '\\infty'}$.`, why: f.b.gt(1) ? 'Negative exponents make reciprocals of bigger and bigger powers.' : 'Multiplying by a number between 0 and 1 again and again shrinks toward 0.' },
              { text: f.k.isZero() ? 'So the outputs approach 0 but never reach it.' : 'So the outputs approach the number added at the end but never reach it.', tex: key, why: 'The graph flattens out along this line.' },
            ],
        misconceptions: equationMis(key, [
          { answer: ASYM(yInt), tag: 'graph-reading', feedback: 'That is the $y$-intercept. The asymptote is the line the graph approaches.' },
          { answer: 'x = 0', tag: 'graph-reading', feedback: 'A horizontal asymptote is a line $y = c$, not a vertical line.' },
          { answer: ASYM(f.a), tag: 'graph-reading', feedback: 'The number in front stretches the graph; the asymptote comes from the number added at the end.' },
          { answer: ASYM(f.k.neg()), tag: 'sign-error', feedback: 'Check the sign of the number added at the end.' },
        ]),
      }), (pr) => difficulty === 3
        ? [
            choiceStep('Which part of the picture is the horizontal asymptote?', ['The dashed horizontal line', 'The $y$-axis', 'A horizontal line through the $y$-intercept'], 0, ['An asymptote is a line the curve gets closer and closer to but never touches.', 'Look at where the curve flattens out.', 'The graph marks the asymptote in a special way.', 'Read the caption under the graph.'], 'The caption says the dashed line is the horizontal asymptote; the curve flattens out along it.', [{ index: 1, tag: 'graph-reading', feedback: 'The $y$-axis is vertical. A horizontal asymptote is a horizontal line.' }, { index: 2, tag: 'graph-reading', feedback: 'The curve passes through the $y$-intercept, so that line is not one it approaches without touching.' }]),
            finalStep(pr, 'At what height is the dashed line? Write its equation.', ['A horizontal line has an equation like $y = c$.', 'Read where the dashed line crosses the $y$-axis.', 'Use the grid labels on the $y$-axis.', 'Write $y =$ that number.'], `The dashed line is $${ASYM(f.k)}$.`),
          ]
        : [
            numStep(`As $x \\to ${f.b.gt(1) ? '-\\infty' : '\\infty'}$, what number does $\\left(${dTex(f.b)}\\right)^{x}$ get closer and closer to?`, Q(0), [f.b.gt(1) ? 'Try $x = -1, -2, -3$: negative exponents give reciprocals.' : 'Try $x = 1, 2, 3$: you keep multiplying by a number less than 1.', 'The values get smaller and smaller but stay positive.', 'They never reach that number.', 'Think about what tiny positive numbers are close to.'], `The power gets as close to 0 as you like, but it is never 0.`, [{ value: Q(1), tag: 'exponent-rule', feedback: 'The power equals 1 only at $x = 0$. Keep going far out.' }]),
            finalStep(pr, f.k.isZero() ? 'So the whole expression gets close to 0 times the number in front. Write the equation of the horizontal asymptote.' : 'So the power part gets close to 0. What does the whole expression get close to? Write the equation of the horizontal asymptote.', ['A horizontal asymptote is a line $y = c$.', f.k.isZero() ? 'A number close to 0 times $a$ is still close to 0.' : 'The power part shrinks toward 0, but the number added at the end stays.', 'Watch the sign of the number added.', 'Write $y =$ that number.'], `The outputs approach $${numStr(f.k)}$, so the asymptote is $${ASYM(f.k)}$.`),
          ]);
    }
    if (ask === 'inc') {
      const inc = increasing(f);
      return withSteps(makeProblem({
        skillId: 'S6.02',
        tags: [],
        prompt: [p('Is the function increasing or decreasing?'), ...intro],
        answer: makeChoice(rng, inc ? 'Increasing' : 'Decreasing', [inc ? 'Decreasing' : 'Increasing', 'Increasing, then decreasing', 'Constant']),
        hints: ['Look at the base $b$ and the sign of $a$.', '$b > 1$ makes $b^{x}$ grow; $0 < b < 1$ makes it shrink.', 'A negative $a$ flips the graph across a horizontal line, which turns growth into falling.', 'The vertical shift does not change whether it rises or falls.'],
        solution: [
          { text: `$b = ${dTex(f.b)}$, so $\\left(${dTex(f.b)}\\right)^{x}$ ${f.b.gt(1) ? 'increases' : 'decreases'}.` },
          { text: `$a = ${dTex(f.a)}$ is ${f.a.sign() > 0 ? 'positive, so that stays the same' : 'negative, which reverses it'}.`, why: inc ? 'So the function is increasing.' : 'So the function is decreasing.' },
        ],
        misconceptions: [],
      }), (pr) => [
        choiceStep(`Look at the base $b = ${dTex(f.b)}$. What does the power $\\left(${dTex(f.b)}\\right)^{x}$ do as $x$ increases?`, ['It increases', 'It decreases'], f.b.gt(1) ? 0 : 1, ['Compare the base with 1.', 'Multiplying a positive number by more than 1 makes it bigger.', 'Multiplying by a number between 0 and 1 makes it smaller.', `Is $${dTex(f.b)}$ greater than 1?`], `$${dTex(f.b)}$ is ${f.b.gt(1) ? 'greater than 1, so the power increases' : 'between 0 and 1, so the power decreases'}.`, [{ index: f.b.gt(1) ? 1 : 0, tag: 'growth-decay', feedback: 'Compare the base with 1.' }]),
        choiceStep(`Now look at $a = ${dTex(f.a)}$. Does it keep or reverse that direction?`, ['Keeps it ($a$ is positive)', 'Reverses it ($a$ is negative)'], f.a.sign() > 0 ? 0 : 1, ['A positive number in front stretches the graph but keeps its direction.', 'A negative number in front flips the graph across a horizontal line.', 'Flipping turns rising into falling.', 'The number added at the end only moves the graph up or down.'], f.a.sign() > 0 ? 'A positive $a$ keeps the direction.' : 'A negative $a$ flips the graph, which reverses the direction.', [{ index: f.a.sign() > 0 ? 1 : 0, tag: 'sign-error', feedback: 'Check the sign of the number in front.' }]),
        finalStep(pr, 'Put the two facts together. Is the function increasing or decreasing?', ['Start with the direction of the power.', 'Reverse it only if $a$ is negative.', 'The vertical shift does not change the direction.', 'Two facts give one direction.'], inc ? 'So the function is increasing.' : 'So the function is decreasing.'),
      ]);
    }
    // end behavior
    const toPlus = rng.bool();
    const grows = (toPlus && f.b.gt(1)) || (!toPlus && f.b.lt(1));
    const limit = grows ? (f.a.sign() > 0 ? '\\infty' : '-\\infty') : numStr(f.k);
    const opts = ['\\infty', '-\\infty', numStr(f.k), numStr(yInt)].map((s) => `$f(x) \\to ${s}$`);
    const correct = `$f(x) \\to ${limit}$`;
    return withSteps(makeProblem({
      skillId: 'S6.02',
      tags: ['graph'],
      prompt: [p(`Describe the end behavior: as $x \\to ${toPlus ? '\\infty' : '-\\infty'}$, what happens to $f(x)$?`), ...intro],
      answer: makeChoice(rng, correct, opts.filter((o) => o !== correct).filter((o, i, all) => all.indexOf(o) === i).slice(0, 3)),
      hints: [`Imagine moving far to the ${toPlus ? 'right' : 'left'} on the graph.`, 'One side of an exponential graph flattens toward the asymptote; the other side shoots up or down.', `The asymptote is $y = ${numStr(f.k)}$.`, `Does the curve flatten out or keep going on the ${toPlus ? 'right' : 'left'}?`],
      solution: [
        { text: `Follow the curve far to the ${toPlus ? 'right' : 'left'}.`, why: grows ? `On that side the curve does not flatten out: the gaps between the labeled points get bigger as you move ${toPlus ? 'right' : 'left'}.` : 'On that side the curve flattens out along the dashed asymptote.' },
        { text: grows ? (f.a.sign() > 0 ? 'The outputs keep going up without bound.' : 'The outputs keep going down without bound.') : `The outputs approach the asymptote $y = ${numStr(f.k)}$ but never reach it.`, tex: correct.replace(/\$/g, '') },
      ],
      misconceptions: [],
    }), (pr) => [
      choiceStep(`Follow the curve far to the ${toPlus ? 'right' : 'left'}. What does it do?`, ['It flattens out along the dashed line', 'It keeps going up', 'It keeps going down'], grows ? (f.a.sign() > 0 ? 1 : 2) : 0, ['One side of an exponential graph flattens out; the other side does not.', `Compare the gaps between the labeled points as you move ${toPlus ? 'right' : 'left'}.`, 'If the gaps get bigger, the curve is running away from the asymptote.', 'If the curve hugs the dashed line, it is flattening out.'], grows ? `On the ${toPlus ? 'right' : 'left'} the curve moves away from the dashed line and keeps going ${f.a.sign() > 0 ? 'up' : 'down'}.` : `On the ${toPlus ? 'right' : 'left'} the curve flattens out along the dashed line.`, [{ index: grows ? 0 : f.a.sign() > 0 ? 1 : 2, tag: 'graph-reading', feedback: `Look again at the ${toPlus ? 'right' : 'left'} side of the graph, not the other side.` }]),
      finalStep(pr, `So as $x \\to ${toPlus ? '\\infty' : '-\\infty'}$, what happens to $f(x)$?`, ['Flattening out along a line means the outputs approach that line\'s $y$-value.', 'Going up without bound means $f(x) \\to \\infty$.', 'Going down without bound means $f(x) \\to -\\infty$.', 'Use what the curve did in the last step.'], grows ? (f.a.sign() > 0 ? 'The outputs keep going up without bound.' : 'The outputs keep going down without bound.') : `The outputs approach $${numStr(f.k)}$ but never reach it.`),
    ]);
  },
  verify(pr) {
    const graphs = pr.prompt.filter((b): b is Extract<Block, { t: 'graph' }> => b.t === 'graph');
    if (graphs.length === 4) {
      // which graph: evaluate each drawn curve against the printed equation
      const f0 = readFn(mathBlocks(pr)[0]);
      if (!f0 || pr.answer.kind !== 'choice') return ['cannot read'];
      const matches: string[] = [];
      for (const gb of graphs) {
        const fg = fnFromGraph(gb.spec);
        if (typeof fg === 'string') return [fg];
        const node = parseExpression(gb.spec.functions!.find((q) => !q.dashed)!.expr);
        if ([-2, -1, 0, 1, 2].some((x) => Math.abs(evalNumeric(node, { x }) - valueAt(fg, x).toNumber()) > 1e-9)) return ['labels do not match the drawn curve'];
        if ([-2, -1, 0, 1, 2, 3].every((x) => Math.abs(evalNumeric(node, { x }) - valueAt(f0, x).toNumber()) < 1e-9)) matches.push(gb.caption ?? '');
      }
      return [...(matches.length === 1 && matches[0] === choiceLabel(pr.answer) ? [] : ['graph match wrong']), ...stepErrors(pr, [f0.k, valueAt(f0, 0), increasing(f0) ? 'Increasing' : 'Decreasing', null])];
    }
    if (/\$x\$-intercept/.test(textAll(pr))) {
      const f0 = readFn(mathBlocks(pr)[0]);
      if (!f0 || pr.answer.kind !== 'number') return ['cannot read'];
      const zeros: number[] = [];
      for (let x = -12; x <= 12; x++) if (valueAt(f0, x).isZero()) zeros.push(x);
      // step 1: the power alone, b^x = -k/a, checked as the value of the power at the zero
      return [...(zeros.length === 1 && Q(pr.answer.value).eq(zeros[0]) ? [] : ['x-intercept wrong']), ...stepErrors(pr, [zeros.length === 1 ? f0.b.pow(zeros[0]) : null, null])];
    }
    const g = graphOf(pr);
    let f: ExpFn | null;
    if (g) {
      // re-derive a, b, k from three labeled points: y(0) - k = a, (y(1) - k)/(y(0) - k) = b, k from the dashed line
      const pts = (g.points ?? []).map((q) => parseLabel(q.label!)!);
      const dashed = g.functions!.find((fn) => fn.dashed)!;
      const k = Q(dashed.expr);
      const y = (x: number) => pts.find((q) => q.x.eq(x))!.y;
      const a = y(0).sub(k);
      const b = y(1).sub(k).div(a);
      if (!y(-1).sub(k).eq(a.div(b))) return ['labeled points are not on one exponential with this asymptote'];
      for (const q of g.points ?? []) if (Math.abs(q.y - a.mul(b.pow(q.x)).add(k).toNumber()) > 1e-9) return ['graph point off the curve'];
      f = { a, b, k };
    } else f = readFn(mathBlocks(pr)[0]);
    if (!f) return ['cannot read function'];
    const text = textAll(pr);
    if (pr.answer.kind === 'number') return [...(Q(pr.answer.value).eq(f.a.add(f.k)) ? [] : ['y-intercept wrong']), ...stepErrors(pr, [g ? Q(0) : f.b.pow(0), null])];
    if (pr.answer.kind === 'equation') {
      const r = parseRelation(pr.answer.value);
      return [...(r.lhs.type === 'var' && r.lhs.name === 'y' && r.rhs.type !== 'var' && checkAnswer(pr.answer, ASYM(f.k)).status === 'correct' ? [] : ['asymptote wrong']), ...stepErrors(pr, [g ? 'The dashed horizontal line' : Q(0), null])];
    }
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const label = choiceLabel(pr.answer);
    if (/increasing or decreasing/.test(text)) {
      // steps: the power's own direction (compare b^1 with b^0), then whether a reverses it
      const powUp = f.b.pow(1).gt(f.b.pow(0));
      return [...(label === (increasing(f) ? 'Increasing' : 'Decreasing') ? [] : ['direction wrong']), ...stepErrors(pr, [powUp ? 'It increases' : 'It decreases', f.a.sign() > 0 ? 'Keeps it ($a$ is positive)' : 'Reverses it ($a$ is negative)', null])];
    }
    const toPlus = /x \\to \\infty\$, what/.test(text);
    // numerically: far out, compare with the asymptote
    const far = toPlus ? 60 : -60;
    const val = valueAt(f, far).toNumber();
    const want = Math.abs(val - f.k.toNumber()) < 1e-6 ? numStr(f.k) : val > 0 ? '\\infty' : '-\\infty';
    const look = want === '\\infty' ? 'It keeps going up' : want === '-\\infty' ? 'It keeps going down' : 'It flattens out along the dashed line';
    return [...(label === `$f(x) \\to ${want}$` ? [] : [`expected ${want}`]), ...stepErrors(pr, [look, null])];
  },
};

// ---------------------------------------------------------------------------
// S6.03: domain, range and intervals
// ---------------------------------------------------------------------------

const rangeOf = (f: ExpFn) => (f.a.sign() > 0 ? `(${numStr(f.k)}, inf)` : `(-inf, ${numStr(f.k)})`);


/** Reasonable domains in context, including discrete ones (A.FGR.9.1). */
function discreteDomain(rng: Rng) {
  const kind = rng.pick(['tournament', 'bounce', 'engines', 'continuous'] as const);
  let story: string;
  let correct: string;
  let wrongs: string[];
  let why: string;
  if (kind === 'tournament') {
    const R = rng.int(4, 7);
    const T0 = 2 ** R;
    story = `A single-elimination tournament starts with ${T0} teams. Half of the teams are knocked out in each round, so after $r$ rounds $T(r) = ${T0}\\left(\\frac{1}{2}\\right)^{r}$ teams are left. The tournament ends when one team is left.`;
    correct = `The integers $0, 1, 2, \\dots, ${R}$`;
    wrongs = [`All real numbers $r$ with $0 \\le r \\le ${R}$`, 'The whole numbers $0, 1, 2, 3, \\dots$', 'All real numbers'];
    why = `Rounds are counted in whole numbers, from $r = 0$ (before any games) to $r = ${R}$, when $T(${R}) = 1$ team is left. There is no round 2.5.`;
  } else if (kind === 'bounce') {
    const H = rng.pick([5, 6, 8, 10]);
    const b = rng.pick(['0.8', '0.75', '0.6']);
    story = `A ball is dropped, and the height it reaches on its $n$th bounce is $h(n) = ${H}(${b})^{n}$ feet.`;
    correct = 'The positive integers $1, 2, 3, \\dots$';
    wrongs = ['All real numbers $n \\ge 0$', 'All real numbers', 'All integers'];
    why = 'The input counts bounces: 1st, 2nd, 3rd and so on. There is no bounce number 0, $-2$ or 1.5.';
  } else if (kind === 'engines') {
    const N = rng.pick([10, 12, 20, 25]);
    const H = rng.pick([50, 80, 100]);
    story = `A factory builds an order of ${N} engines. As the workers get faster, building the $n$th engine takes $h(n) = ${H}(0.9)^{n}$ person-hours.`;
    correct = `The integers $1, 2, 3, \\dots, ${N}$`;
    wrongs = [`All real numbers $n$ with $0 \\le n \\le ${N}$`, 'The positive integers $1, 2, 3, \\dots$', 'All real numbers $n > 0$'];
    why = `$n$ counts engines in the order, so it is a whole number from 1 to ${N}. Half an engine is not an engine, and there is no engine number ${N + 1}.`;
  } else {
    const a = rng.pick([50, 100, 200]);
    const T = rng.int(4, 12);
    story = `A scientist watches a bacteria culture continuously. The number of bacteria $t$ hours after the start is $B(t) = ${a}(2)^{t}$, and the experiment lasts ${T} hours.`;
    correct = `All real numbers $t$ with $0 \\le t \\le ${T}$`;
    wrongs = [`The integers $0, 1, 2, \\dots, ${T}$`, 'The positive integers $1, 2, 3, \\dots$', 'All real numbers'];
    why = `Time passes continuously, so any time from the start, $t = 0$, to the end, $t = ${T}$, makes sense, including times like 2.5 hours.`;
  }
  return withSteps(makeProblem({
    skillId: 'S6.03',
    tags: ['real-world'],
    prompt: [p(story), p('What is the most reasonable domain for this situation?')],
    answer: makeChoice(rng, correct, wrongs),
    hints: ['The domain is the set of inputs that make sense in the situation, not just in the formula.', 'Ask what the input counts or measures.', 'Things you count (rounds, bounces, engines) take whole-number values; time can take any value in between.', 'Check where the inputs start and whether they stop.'],
    solution: [
      { text: 'Decide what the input stands for.', why },
      { text: `So the reasonable domain is: ${correct}.`, why: 'The formula works for every real number, but the situation only uses these inputs.' },
    ],
    misconceptions: [],
  }), (pr) => [
    choiceStep('What kind of quantity is the input?', ['Something counted in whole numbers', 'Time, which can take any value in between'], kind === 'continuous' ? 1 : 0, ['Read what the input letter stands for.', 'Ask: could the input be 2.5 in this situation?', 'Rounds, bounces and engines are counted one at a time.', 'Time keeps passing between whole hours.'], kind === 'continuous' ? 'The input is time watched continuously, so in-between values like 2.5 hours make sense.' : 'The input counts things one at a time, so only whole numbers make sense.', [{ index: kind === 'continuous' ? 0 : 1, tag: 'interval-endpoint', feedback: kind === 'continuous' ? 'The culture is watched continuously, so times between whole hours count too.' : 'You cannot have half a round, half a bounce or half an engine.' }]),
    numStep('What is the smallest input that makes sense in the situation?', Q(kind === 'tournament' || kind === 'continuous' ? 0 : 1), ['Think about where the situation starts.', kind === 'tournament' ? 'Before any games, no rounds have been played.' : kind === 'continuous' ? 'The experiment starts when the clock starts.' : 'Counting starts with the first one.', 'Negative inputs do not make sense here.', kind === 'bounce' ? 'The first bounce is bounce number one; there is no bounce before it.' : kind === 'engines' ? 'The first engine is engine number one; there is no engine before it.' : 'The start is before anything has changed.'], kind === 'tournament' ? 'The count of rounds starts at $r = 0$, before any games.' : kind === 'continuous' ? 'Time starts at $t = 0$.' : 'The first one is number 1.', [{ value: kind === 'tournament' || kind === 'continuous' ? Q(1) : Q(0), tag: 'interval-endpoint', feedback: kind === 'tournament' || kind === 'continuous' ? 'The situation starts before anything has happened, at 0.' : 'There is no number 0 here; counting starts at the first one.' }]),
    finalStep(pr, kind === 'bounce' ? 'Do the inputs ever stop? What is the most reasonable domain?' : 'Now find where the inputs stop. What is the most reasonable domain?', ['Use the kind of quantity from the first step.', 'Use the starting input from the second step.', 'Check the story for an end: a last round, a last engine or the end of the experiment.', 'The formula works for every real number, but the situation only uses some inputs.'], why),
  ]);
}

/** Guided steps for the range of a(b)^x + k: the asymptote, the side the curve is on, then the interval. */
function rangeSteps(pr: Problem, f: ExpFn, graph: boolean): ProblemStep[] {
  const up = f.a.sign() > 0;
  return [
    numStep(graph ? 'Read the dashed line. The asymptote is $y = k$. What is $k$?' : 'Find the horizontal asymptote $y = k$. What is $k$?', f.k, graph ? ['The dashed line is the horizontal asymptote.', 'A horizontal line has the same $y$-value everywhere.', 'Read where it crosses the $y$-axis.', 'Give just the number.'] : ['The power part gets closer and closer to 0 on one side.', 'Then the outputs get close to the number added at the end.', 'If nothing is added at the end, think about what the power part alone approaches.', 'Watch the sign.'], `The asymptote is $y = ${numStr(f.k)}$.`, [{ value: f.a.add(f.k), tag: 'graph-reading', feedback: 'That is the $y$-intercept. The asymptote is the line the curve levels off along.' }, { value: f.k.neg(), tag: 'sign-error', feedback: 'Check the sign.' }]),
    choiceStep('Are the outputs above or below the asymptote?', [`All above $y = ${numStr(f.k)}$`, `All below $y = ${numStr(f.k)}$`], up ? 0 : 1, graph ? ['Look at the labeled points.', 'Compare each $y$-value with the dashed line.', 'The curve never crosses its asymptote.', 'Is the $y$-intercept above or below the dashed line?'] : ['The power part is always positive.', 'Multiplying by a positive $a$ keeps it positive; a negative $a$ makes it negative.', 'Then the constant is added to that.', `Here $a = ${dTex(f.a)}$.`], graph ? `The labeled points are all ${up ? 'above' : 'below'} the dashed line, and the curve never crosses it, so every output is ${up ? 'above' : 'below'} $${numStr(f.k)}$.` : up ? `The power part times $a = ${dTex(f.a)}$ is always positive, so every output is above $${numStr(f.k)}$.` : `The power part times $a = ${dTex(f.a)}$ is always negative, so every output is below $${numStr(f.k)}$.`, [{ index: up ? 1 : 0, tag: 'inequality-direction', feedback: graph ? 'Compare the labeled points with the dashed line.' : 'Check the sign of the number in front.' }]),
    finalStep(pr, 'The curve gets as close as you like to the asymptote and goes on forever the other way. What is the range?', ['The range is the set of outputs.', 'The asymptote value itself is never reached, so use a parenthesis there.', 'The other end goes on without bound, to infinity.', 'You can type an inequality like y > 3 instead of an interval.'], up ? `The range is $y > ${numStr(f.k)}$, or $(${numStr(f.k)}, \\infty)$.` : `The range is $y < ${numStr(f.k)}$, or $(-\\infty, ${numStr(f.k)})$.`),
  ];
}

export const genExpDomainRange: GeneratorDef = {
  id: 'u6.exp-domain-range',
  skillId: 'S6.03',
  description: 'Write the domain, range and positive or negative intervals of exponential functions, including reasonable domains and ranges in context.',
  generate(rng, difficulty) {
    if (difficulty <= 2) {
      const f = randomFn(rng, difficulty === 2);
      const askDomain = difficulty === 1 && rng.int(0, 2) === 0;
      const fx = `f(x) = ${rhsTex(f)}`;
      if (askDomain) {
        return withSteps(makeProblem({
          skillId: 'S6.03',
          tags: [],
          prompt: [p('What is the domain of $f$?'), { t: 'math', tex: fx }],
          answer: { kind: 'interval', value: '(-inf, inf)' },
          inputHint: 'Type interval notation like (-inf, inf), or "all real numbers".',
          hints: ['The domain is the set of inputs you are allowed to use.', 'Can you raise a positive base to any power: positive, negative, zero, fractions?', 'There is no input that breaks the formula.', 'Do not confuse the domain (inputs) with the range (outputs).'],
          solution: [{ text: 'Any real number can be an exponent of a positive base.', why: 'Positive, negative and zero exponents all give a value, and so do fractions.' }, { text: 'So the domain is all real numbers.', tex: '(-\\infty, \\infty)' }],
          misconceptions: intervalMis('(-inf, inf)', [
            { answer: rangeOf(f), tag: 'interval-endpoint', feedback: 'That is the range (the outputs). The domain is the inputs.' },
            { answer: '[0, inf)', tag: 'interval-endpoint', feedback: 'Negative inputs are allowed too: they give reciprocals.' },
          ]),
        }), (pr) => [
          numStep('Test a negative input. What is $f(-1)$?', valueAt(f, -1), ['Substitute $x = -1$.', 'A negative exponent means one over the positive power.', 'So the power is the reciprocal of the base: flip the base over.', 'Multiply by the number in front, then add any constant.'], `$f(-1) = ${valueAt(f, -1).toTex()}$: a negative input works fine.`, [{ value: f.a.mul(f.b).neg().add(f.k), tag: 'exponent-rule', feedback: 'A negative exponent means a reciprocal, not a negative number.' }], { inputHint: 'Type a number or a fraction.' }),
          choiceStep('Is there any real number that cannot be used as the exponent $x$?', ['No: positive, negative, zero and fraction exponents all give a value', 'Yes: negative inputs do not work', 'Yes: only whole numbers work'], 0, ['You just used a negative input.', 'Zero works too: any nonzero base to the zero power is 1.', 'Fraction exponents of a positive base also give a value.', 'Nothing in the formula divides by $x$ or takes a square root of $x$.'], 'A positive base can be raised to any real power, so every real number is a valid input.', [{ index: 1, tag: 'interval-endpoint', feedback: 'You just found $f(-1)$, so negative inputs work.' }, { index: 2, tag: 'interval-endpoint', feedback: 'The graph is a smooth curve with no gaps, so in-between inputs work too.' }]),
          finalStep(pr, 'So what is the domain of $f$?', ['The domain is the set of all inputs that work.', 'Use what you decided in the last step.', 'In interval notation, a set with no ends is written with infinity on both sides.', 'Do not confuse the domain (inputs) with the range (outputs).'], 'The domain is all real numbers, $(-\\infty, \\infty)$.'),
        ]);
      }
      const key = rangeOf(f);
      const up = f.a.sign() > 0;
      if (difficulty === 2 && rng.int(0, 2) === 0) {
        // read the range from a graph (A.FGR.9.2)
        return withSteps(makeProblem({
          skillId: 'S6.03',
          tags: ['graph'],
          prompt: [p('The graph of an exponential function $f$ is shown. Points on the graph are labeled. What is the range of $f$?'), graphBlock(f, 'f')],
          answer: { kind: 'interval', value: key },
          inputHint: 'Type an interval like (3, inf) or an inequality like y > 3.',
          hints: ['The range is the set of outputs: look up and down the graph.', 'The dashed line is the horizontal asymptote. The graph gets close to it but never touches it.', 'Is the whole curve above the dashed line or below it?', 'The other end of the curve keeps going without bound.'],
          solution: [
            { text: 'Read the asymptote.', tex: `y = ${numStr(f.k)}`, why: 'The curve levels off along the dashed line but never reaches it.' },
            { text: up ? 'The whole curve is above the dashed line and rises without bound.' : 'The whole curve is below the dashed line and falls without bound.', tex: up ? `y > ${numStr(f.k)}` : `y < ${numStr(f.k)}`, why: 'Every output on that side of the asymptote is reached, but the asymptote value itself is not.' },
            { text: 'In interval notation:', tex: up ? `(${numStr(f.k)}, \\infty)` : `(-\\infty, ${numStr(f.k)})` },
          ],
          misconceptions: intervalMis(key, [
            { answer: up ? `[${numStr(f.k)}, inf)` : `(-inf, ${numStr(f.k)}]`, tag: 'interval-endpoint', feedback: 'The graph never reaches its asymptote, so that value is not included.' },
            { answer: '(-inf, inf)', tag: 'interval-endpoint', feedback: 'That is the domain. The outputs stay on one side of the dashed line.' },
            { answer: up ? `(-inf, ${numStr(f.k)})` : `(${numStr(f.k)}, inf)`, tag: 'inequality-direction', feedback: 'Check which side of the dashed line the curve is on.' },
          ]),
        }), (pr) => rangeSteps(pr, f, true));
      }
      return withSteps(makeProblem({
        skillId: 'S6.03',
        tags: [],
        prompt: [p('What is the range of $f$?'), { t: 'math', tex: fx }],
        answer: { kind: 'interval', value: key },
        inputHint: 'Type an interval like (3, inf) or an inequality like y > 3.',
        hints: ['The range is the set of outputs.', `The horizontal asymptote is $y = ${numStr(f.k)}$: the outputs get close to it but never reach it.`, up ? 'With $a > 0$, every output is above the asymptote.' : 'With $a < 0$, every output is below the asymptote.', 'The asymptote value is not included, so use a parenthesis.'],
        solution: [
          { text: 'Find the asymptote.', tex: `y = ${numStr(f.k)}`, why: `$b^{x}$ is always positive and gets as close to 0 as you like, so $${coefTex(f.a)}b^{x}$ gets close to 0 too.` },
          { text: up ? 'With $a > 0$ the outputs are all above it.' : 'With $a < 0$ the outputs are all below it.', tex: up ? `y > ${numStr(f.k)}` : `y < ${numStr(f.k)}`, why: 'The value of the asymptote itself is never reached.' },
        ],
        misconceptions: intervalMis(key, [
          { answer: up ? `[${numStr(f.k)}, inf)` : `(-inf, ${numStr(f.k)}]`, tag: 'interval-endpoint', feedback: 'The graph never actually reaches its asymptote, so that value is not included.' },
          { answer: '(-inf, inf)', tag: 'interval-endpoint', feedback: 'That is the domain. The outputs never cross the asymptote.' },
          { answer: up ? `(${numStr(f.a.add(f.k))}, inf)` : `(-inf, ${numStr(f.a.add(f.k))})`, tag: 'graph-reading', feedback: 'That uses the $y$-intercept. The outputs go all the way down (or up) toward the asymptote.' },
          { answer: up ? `(-inf, ${numStr(f.k)})` : `(${numStr(f.k)}, inf)`, tag: 'inequality-direction', feedback: up ? 'With $a > 0$ the outputs are above the asymptote.' : 'With $a < 0$ the outputs are below the asymptote.' },
        ]),
      }), (pr) => rangeSteps(pr, f, false));
    }
    const d3kind = rng.int(0, 2);
    if (d3kind === 2) return discreteDomain(rng);
    if (d3kind === 0) {
      // positive or negative interval of a(b)^x + k with a > 0, k < 0 and a nice crossing
      const bStr = rng.pick(['2', '3', '1/2', '2', '4']);
      const b = Q(bStr);
      const a = rng.pick([1, 1, 2, 3]);
      const n = rng.int(1, b.eq(2) || b.eq(Q(1, 2)) ? 4 : 2);
      const k = Q(a).mul(b.pow(b.gt(1) ? n : -n)).neg();
      const cross = b.gt(1) ? n : -n;
      const f: ExpFn = { a: Q(a), b, k };
      const askPos = rng.bool();
      const rightSide = askPos === b.gt(1); // positive to the right when growing
      const key = rightSide ? `(${cross}, inf)` : `(-inf, ${cross})`;
      return withSteps(makeProblem({
        skillId: 'S6.03',
        tags: ['multi-step'],
        prompt: [p(`On what interval is $f(x)$ ${askPos ? 'positive' : 'negative'}?`), { t: 'math', tex: `f(x) = ${rhsTex(f)}` }],
        answer: { kind: 'interval', value: key },
        inputHint: 'Type interval notation like (3, inf) or an inequality like x > 3.',
        hints: ['First find the $x$-intercept: solve $f(x) = 0$.', `Move the constant: $${rhsTex({ ...f, k: Q(0) })} = ${dTex(k.neg())}$.`, 'Rewrite with a common base to find $x$.', `Then decide which side of that $x$-value has outputs ${askPos ? 'above' : 'below'} 0.`],
        solution: [
          { text: 'Find where $f(x) = 0$.', tex: `${rhsTex({ ...f, k: Q(0) })} = ${dTex(k.neg())} \\Rightarrow x = ${cross}`, why: `$\\left(${dTex(b)}\\right)^{${cross}} = ${b.pow(cross).toTex()}$.` },
          { text: `The function is ${b.gt(1) ? 'increasing' : 'decreasing'}, so it is ${askPos ? 'positive' : 'negative'} on one side of $x = ${cross}$.`, tex: rightSide ? `x > ${cross}` : `x < ${cross}`, why: `Check a test point: $f(${rightSide ? cross + 1 : cross - 1}) = ${valueAt(f, rightSide ? cross + 1 : cross - 1).toTex()}$.` },
        ],
        misconceptions: intervalMis(key, [
          { answer: rightSide ? `(-inf, ${cross})` : `(${cross}, inf)`, tag: 'inequality-direction', feedback: 'Test a point on your interval: is the output really on that side of 0?' },
          { answer: rightSide ? `[${cross}, inf)` : `(-inf, ${cross}]`, tag: 'interval-endpoint', feedback: `At $x = ${cross}$ the output is exactly 0, which is neither positive nor negative.` },
        ]),
      }), (pr) => [
        numStep('First find the $x$-intercept: solve $f(x) = 0$. What is $x$?', Q(cross), [`Move the constant: $${rhsTex({ ...f, k: Q(0) })} = ${dTex(k.neg())}$.`, a === 1 ? 'The power is alone now.' : `Divide both sides by ${a}.`, `Write the right side as a power of $${dTex(b)}$.`, 'Equal powers of the same base have equal exponents.'], `$\\left(${dTex(b)}\\right)^{${cross}} = ${b.pow(cross).toTex()}$, so $f(${cross}) = 0$.`, [{ value: Q(-cross), tag: 'sign-error', feedback: 'Substitute your answer to check: the output should be 0.' }, { value: k.neg().div(a), tag: 'exponent-rule', feedback: 'That is the value of the power. Find the exponent that gives it.' }]),
        choiceStep(`Test a point. Is $f(${cross + 1})$ positive or negative?`, ['Positive', 'Negative'], valueAt(f, cross + 1).sign() > 0 ? 0 : 1, [`Substitute $x = ${cross + 1}$.`, 'Find the power first, then multiply and add the constant.', 'Compare the result with 0.', 'It is one step to the right of the $x$-intercept.'], `$f(${cross + 1}) = ${valueAt(f, cross + 1).toTex()}$, which is ${valueAt(f, cross + 1).sign() > 0 ? 'positive' : 'negative'}.`, [{ index: valueAt(f, cross + 1).sign() > 0 ? 1 : 0, tag: 'sign-error', feedback: 'Compute the value again: power first, then multiply, then add.' }]),
        finalStep(pr, `So on which interval is $f(x)$ ${askPos ? 'positive' : 'negative'}?`, ['The function is always increasing or always decreasing, so it changes sign only at the $x$-intercept.', 'Every point on the same side as your test point has the same sign.', 'The $x$-intercept itself gives 0, so leave it out.', 'Use a parenthesis at the $x$-intercept.'], rightSide ? `$f(x)$ is ${askPos ? 'positive' : 'negative'} for $x > ${cross}$.` : `$f(x)$ is ${askPos ? 'positive' : 'negative'} for $x < ${cross}$.`),
      ]);
    }
    // reasonable domain or range in context
    const grow = rng.bool();
    const T = rng.int(3, 6);
    const b = grow ? Q(rng.pick([2, 3].filter((q) => q ** T <= 729))) : Q(1, 2);
    const a = grow ? rng.pick([20, 50, 100, 200]) : 2 ** T * rng.pick([5, 10, 25]);
    const f: ExpFn = { a: Q(a), b, k: Q(0) };
    const end = valueAt(f, T);
    const askRange = rng.bool();
    const lo = grow ? Q(a) : end;
    const hi = grow ? end : Q(a);
    const key = askRange ? `[${numStr(lo)}, ${numStr(hi)}]` : `[0, ${T}]`;
    const story = grow ? `A biologist models the number of cells in a dish with $C(t) = ${rhsTex(f, 't')}$, where $t$ is the number of hours. The experiment runs from $t = 0$ to $t = ${T}$.` : `The milligrams of a medicine in a patient's body are modeled by $M(t) = ${rhsTex(f, 't')}$, where $t$ is the number of hours after the dose. The model is used from $t = 0$ to $t = ${T}$.`;
    return withSteps(makeProblem({
      skillId: 'S6.03',
      tags: ['real-world'],
      prompt: [p(story), p(`What is the reasonable ${askRange ? 'range' : 'domain'} of the function in this situation?`)],
      answer: { kind: 'interval', value: key },
      inputHint: `Type an interval like [0, 5] or an inequality like 0 <= ${askRange ? 'y' : 't'} <= 5.`,
      hints: [askRange ? 'The range is the set of outputs over the times used.' : 'The domain is the set of times the model is used.', askRange ? `Find the output at $t = 0$ and at $t = ${T}$.` : 'The situation starts and stops at given times.', askRange ? (grow ? 'The function is increasing, so the smallest output is at the start.' : 'The function is decreasing, so the largest output is at the start.') : `The first time is $t = 0$ and the last is $t = ${T}$.`, 'Both endpoints happen, so use brackets.'],
      solution: askRange
        ? [
            { text: 'Find the outputs at the ends.', tex: `${grow ? 'C' : 'M'}(0) = ${a},\\quad ${grow ? 'C' : 'M'}(${T}) = ${numStr(end)}`, why: grow ? 'The model is increasing, so these are the smallest and largest values.' : 'The model is decreasing, so these are the largest and smallest values.' },
            { text: 'Both values occur, so include them.', tex: `[${numStr(lo)}, ${numStr(hi)}]` },
          ]
        : [
            { text: 'The model is used from the start to the end of the time given.', tex: `0 \\le t \\le ${T}`, why: 'Times before 0 or after the end are outside the situation, even though the formula still works there.' },
            { text: 'In interval notation:', tex: `[0, ${T}]` },
          ],
      misconceptions: intervalMis(key, [
        { answer: askRange ? `(0, ${numStr(hi)}]` : '(-inf, inf)', tag: 'interval-endpoint', feedback: askRange ? 'In this situation the outputs only come from the times used.' : 'The formula works for every input, but the situation only uses some of them.' },
        { answer: askRange ? `(${numStr(lo)}, ${numStr(hi)})` : `(0, ${T})`, tag: 'interval-endpoint', feedback: 'Both endpoints are part of the situation, so use brackets.' },
        { answer: askRange ? `[0, ${T}]` : `[${numStr(lo)}, ${numStr(hi)}]`, tag: 'interval-endpoint', feedback: askRange ? 'That is the domain (the times). The range is the outputs.' : 'That is the range (the outputs). The domain is the times.' },
      ]),
    }), (pr) => askRange
      ? [
          numStep(`Find the output at the start: what is $${grow ? 'C' : 'M'}(0)$?`, Q(a), ['Substitute $t = 0$.', 'Any nonzero base to the power 0 is 1.', 'So the output is the number in front times 1.', 'Read the number in front.'], `$${grow ? 'C' : 'M'}(0) = ${a}$.`, [{ value: Q(0), tag: 'exponent-rule', feedback: 'The zero power is 1, so the output at $t = 0$ is not 0.' }]),
          numStep(`Find the output at the end: what is $${grow ? 'C' : 'M'}(${T})$?`, end, [`Substitute $t = ${T}$.`, `Find $\\left(${dTex(b)}\\right)^{${T}}$ first.`, `Then multiply by ${a}.`, 'Exponents come before multiplication.'], `$${grow ? 'C' : 'M'}(${T}) = ${a}\\left(${dTex(b)}\\right)^{${T}} = ${numStr(end)}$.`, [{ value: Q(a).mul(b).mul(T), tag: 'exponent-rule', feedback: 'The exponent means repeated multiplication by the base, not multiplying by the time.' }]),
          finalStep(pr, `The model is ${grow ? 'increasing' : 'decreasing'}, so the outputs run between these two values. What is the reasonable range?`, ['The range is the set of outputs over the times used.', grow ? 'The smallest output is at the start and the largest at the end.' : 'The largest output is at the start and the smallest at the end.', 'Write the smaller value first.', 'Both endpoints happen, so use brackets.'], `The range is $[${numStr(lo)}, ${numStr(hi)}]$.`),
        ]
      : [
          numStep('What is the first time $t$ the model is used?', Q(0), ['Read the story for the start.', '$t$ counts hours after the start.', 'At the start, no time has passed.', 'Look for the words "from $t =$".'], 'The model starts at $t = 0$.', [{ value: Q(1), tag: 'interval-endpoint', feedback: 'The start is before any hours have passed.' }]),
          numStep('What is the last time $t$ the model is used?', Q(T), ['Read the story for the end.', 'Look for the words "to $t =$".', 'Times after that are outside the situation.', 'Give just the number of hours.'], `The model stops at $t = ${T}$.`, [{ value: end, tag: 'interval-endpoint', feedback: 'That is an output. The domain is about the times (inputs).' }]),
          finalStep(pr, 'Every time between the start and the end is used. What is the reasonable domain?', ['The domain is the set of times the model is used.', 'Time passes continuously, so all times in between count.', 'Both endpoints are used, so use brackets.', 'Write the start first.'], `The domain is $0 \\le t \\le ${T}$, or $[0, ${T}]$.`),
        ]);
  },
  verify(pr) {
    const text = textAll(pr);
    if (/most reasonable domain/.test(text)) {
      if (pr.answer.kind !== 'choice') return ['unexpected kind'];
      const label = choiceLabel(pr.answer);
      const tour = /starts with (\d+) teams/.exec(text);
      const eng = /order of (\d+) engines/.exec(text);
      const lasts = /experiment lasts (\d+) hours/.exec(text);
      let want: string;
      if (tour) {
        let teams = Number(tour[1]);
        let rounds = 0;
        while (teams > 1) {
          teams /= 2;
          rounds++;
        }
        want = `The integers $0, 1, 2, \\dots, ${rounds}$`;
      } else if (eng) want = `The integers $1, 2, 3, \\dots, ${eng[1]}$`;
      else if (lasts) want = `All real numbers $t$ with $0 \\le t \\le ${lasts[1]}$`;
      else if (/\$n\$th bounce/.test(text)) want = 'The positive integers $1, 2, 3, \\dots$';
      else return ['unknown context'];
      const cont = !!lasts;
      return [...(label === want && pr.answer.options.filter((o) => o.label === want).length === 1 ? [] : ['domain choice wrong']), ...stepErrors(pr, [cont ? 'Time, which can take any value in between' : 'Something counted in whole numbers', Q(tour || cont ? 0 : 1), null])];
    }
    if (pr.answer.kind !== 'interval') return ['unexpected kind'];
    const graphR = graphOf(pr);
    if (graphR) {
      const fg = fnFromGraph(graphR);
      if (typeof fg === 'string') return [fg];
      const got = parseInterval(pr.answer.value);
      // the labeled points lie on one side of the asymptote; the curve runs off to infinity on that side
      const side = valueAt(fg, 0).gt(fg.k) ? `(${numStr(fg.k)}, inf)` : `(-inf, ${numStr(fg.k)})`;
      return [...(intervalsEqual(got, parseInterval(side)) ? [] : [`expected ${side}`]), ...stepErrors(pr, [fg.k, valueAt(fg, 0).gt(fg.k) ? `All above $y = ${numStr(fg.k)}$` : `All below $y = ${numStr(fg.k)}$`, null])];
    }
    const got = parseInterval(pr.answer.value);
    const eq = (s: string) => (intervalsEqual(got, parseInterval(s)) ? [] : [`expected ${s}`]);
    const ctx = /\$([CM])\(t\) = (.+?)\$, where/.exec(text);
    if (ctx) {
      const f = readFn(`=${ctx[2]}`, 't')!;
      const T = Number(/to \$t = (\d+)\$/.exec(text)![1]);
      if (/reasonable domain/.test(text)) return [...eq(`[0, ${T}]`), ...stepErrors(pr, [Q(0), Q(T), null])];
      // the end values by repeated multiplication
      let yT = f.a;
      for (let i = 0; i < T; i++) yT = yT.mul(f.b);
      const ys = [valueAt(f, 0), valueAt(f, T)];
      const lo = ys[0].lt(ys[1]) ? ys[0] : ys[1];
      const hi = ys[0].lt(ys[1]) ? ys[1] : ys[0];
      return [...eq(`[${numStr(lo)}, ${numStr(hi)}]`), ...stepErrors(pr, [f.a, yT, null])];
    }
    const f = readFn(mathBlocks(pr)[0]);
    if (!f) return ['cannot read function'];
    if (/domain/.test(text)) return [...eq('(-inf, inf)'), ...stepErrors(pr, [f.a.div(f.b).add(f.k), 'No: positive, negative, zero and fraction exponents all give a value', null])];
    if (/range/.test(text)) return [...eq(rangeOf(f)), ...stepErrors(pr, [f.k, valueAt(f, 0).gt(f.k) ? `All above $y = ${numStr(f.k)}$` : `All below $y = ${numStr(f.k)}$`, null])];
    // positive / negative: sample integers and half-integers around the answer
    const pos = /positive/.test(text);
    for (let x = -8; x <= 8; x += 0.5) {
      const v = f.a.toNumber() * Math.pow(f.b.toNumber(), x) + f.k.toNumber();
      const inside = (got.lo === null || x > got.lo.toNumber() || (got.loClosed && x === got.lo.toNumber())) && (got.hi === null || x < got.hi.toNumber() || (got.hiClosed && x === got.hi.toNumber()));
      const good = pos ? v > 1e-12 : v < -1e-12;
      if (inside !== good) return [`interval wrong at x = ${x}`];
    }
    // steps: the integer zero, then the sign one step to its right
    let zero: number | null = null;
    for (let x = -12; x <= 12; x++) if (valueAt(f, x).isZero()) zero = x;
    return zero === null ? ['no integer zero'] : stepErrors(pr, [Q(zero), valueAt(f, zero + 1).sign() > 0 ? 'Positive' : 'Negative', null]);
  },
};

// ---------------------------------------------------------------------------
// S6.05: average rate of change
// ---------------------------------------------------------------------------

const rateOf = (f: ExpFn, x1: number, x2: number) => valueAt(f, x2).sub(valueAt(f, x1)).div(x2 - x1);

export const genExpRate: GeneratorDef = {
  id: 'u6.exp-rate',
  skillId: 'S6.05',
  description: 'Find and compare average rates of change of exponential functions from equations, tables, graphs and contexts.',
  generate(rng, difficulty) {
    const b = rng.pick(['2', '3', '2', '1/2']);
    const bq = Q(b);
    const a = bq.lt(1) ? rng.pick([16, 32, 64]) : rng.pick([1, 2, 3, 4, 5]);
    const f = expFn(a, b);
    const name = rng.pick(['f', 'g']);
    const maxX = bq.eq(3) ? 4 : 5;
    if (difficulty === 3 && rng.bool()) {
      // compare two intervals of the same length
      const len = rng.int(1, 2);
      const x1 = rng.int(0, 1);
      const x2 = x1 + len + rng.int(0, 1);
      if (x2 + len > maxX) return genExpRate.generate(rng, 2);
      const r1 = rateOf(f, x1, x1 + len);
      const r2 = rateOf(f, x2, x2 + len);
      const i1 = `from $x = ${x1}$ to $x = ${x1 + len}$`;
      const i2 = `from $x = ${x2}$ to $x = ${x2 + len}$`;
      const correct = r1.gt(r2) ? `The interval ${i1}` : `The interval ${i2}`;
      return makeProblem({
        skillId: 'S6.05',
        tags: ['multi-step'],
        prompt: [p(`On which interval is the average rate of change of $${name}$ greater?`), { t: 'math', tex: `${name}(x) = ${rhsTex(f)}` }],
        answer: makeChoice(rng, correct, [r1.gt(r2) ? `The interval ${i2}` : `The interval ${i1}`, 'They are the same, because the intervals have the same length']),
        hints: ['Find each average rate of change: change in output divided by change in input.', `Evaluate $${name}$ at the endpoints of both intervals.`, 'Divide each change in output by the length of the interval.', bq.gt(1) ? 'Compare the two rates as numbers.' : 'Compare the two rates as numbers: a less negative number is greater.'],
        solution: [
          { text: 'First interval.', tex: `\\frac{${name}(${x1 + len}) - ${name}(${x1})}{${len}} = \\frac{${valueAt(f, x1 + len).toTex()} - ${valueAt(f, x1).toTex()}}{${len}} = ${r1.toTex()}` },
          { text: 'Second interval.', tex: `\\frac{${name}(${x2 + len}) - ${name}(${x2})}{${len}} = \\frac{${valueAt(f, x2 + len).toTex()} - ${valueAt(f, x2).toTex()}}{${len}} = ${r2.toTex()}`, why: bq.gt(1) ? 'An exponential function multiplies, so the same step in $x$ adds more and more later on.' : 'For decay, the drops get smaller later on, so the rate gets closer to 0.' },
          { text: correct.replace('The interval', 'Greater:') },
        ],
        misconceptions: [],
      });
    }
    let x1 = rng.int(0, maxX - 2);
    let x2 = rng.int(x1 + 1, Math.min(maxX, x1 + 3));
    if (x2 === x1) x2 = x1 + 1;
    const r = rateOf(f, x1, x2);
    const f1 = valueAt(f, x1);
    const f2 = valueAt(f, x2);
    let prompt: Block[];
    let unit: string | undefined;
    const tags: Array<'graph' | 'real-world'> = [];
    if (difficulty === 1) prompt = [p(`Find the average rate of change of $${name}$ from $x = ${x1}$ to $x = ${x2}$.`), { t: 'math', tex: `${name}(x) = ${rhsTex(f)}` }];
    else if (difficulty === 2) {
      const xs = [0, 1, 2, 3, 4, 5].filter((x) => x <= maxX);
      if (rng.bool()) prompt = [p(`The table shows values of an exponential function $${name}$. Find the average rate of change from $x = ${x1}$ to $x = ${x2}$.`), { t: 'table', headers: ['$x$', `$${name}(x)$`], rows: xs.map((x) => [String(x), numStr(valueAt(f, x))]) }];
      else {
        tags.push('graph');
        const win = windowFor([f], [0, 1, 2, 3, maxX]);
        prompt = [
          p(`Find the average rate of change of $${name}$ from $x = ${x1}$ to $x = ${x2}$ using the labeled points.`),
          { t: 'graph', spec: { ...win, xMin: -1, functions: [{ expr: rhsPlain(f) }], points: [x1, x2].map((x) => ({ x, y: valueAt(f, x).toNumber(), label: ptLabel(x, valueAt(f, x)) })), ariaLabel: `An exponential curve through ${ptLabel(x1, f1)} and ${ptLabel(x2, f2)}.` } },
        ];
      }
    } else {
      tags.push('real-world');
      const ctx = bq.gt(1) ? { fn: 'B', v: 't', what: `The number of bacteria in a sample after $t$ hours is $B(t) = ${rhsTex(expFn(f.a.mul(100), b), 't')}$.`, unit: 'bacteria per hour', scale: 100 } : { fn: 'M', v: 't', what: `The milligrams of a medicine left in the body after $t$ hours is $M(t) = ${rhsTex(expFn(f.a.mul(10), b), 't')}$.`, unit: 'milligrams per hour', scale: 10 };
      const g = expFn(f.a.mul(ctx.scale), b);
      const rr = rateOf(g, x1, x2);
      unit = ctx.unit;
      prompt = [p(`${ctx.what} Find the average rate of change from $t = ${x1}$ to $t = ${x2}$, in ${ctx.unit}.`)];
      return withSteps(makeProblem({
        skillId: 'S6.05',
        tags,
        prompt,
        answer: numSpec(rr, unit),
        inputHint: 'Type a number (negative if the amount is going down).',
        hints: ['Average rate of change is change in output over change in input.', `Find $${ctx.fn}(${x1})$ and $${ctx.fn}(${x2})$.`, `Subtract, then divide by $${x2} - ${x1}$.`, bq.gt(1) ? 'The amount is growing, so the rate is positive.' : 'The amount is going down, so the rate is negative.'],
        solution: [
          { text: 'Evaluate at both times.', tex: `${ctx.fn}(${x1}) = ${valueAt(g, x1).toTex()},\\quad ${ctx.fn}(${x2}) = ${valueAt(g, x2).toTex()}` },
          { text: 'Divide the change in output by the change in time.', tex: `\\frac{${valueAt(g, x2).toTex()} - ${valueAt(g, x1).toTex()}}{${x2} - ${x1}} = ${rr.toTex()}`, why: `On average, the amount changes by ${rr.abs().toTex()} ${ctx.unit.split(' per ')[0]} each hour over this interval.` },
        ],
        misconceptions: numberMisconceptions(rr, [
          { value: valueAt(g, x2).sub(valueAt(g, x1)), tag: 'slope-calc', feedback: 'Divide the change in output by the change in time.' },
          { value: rr.neg(), tag: 'sign-error', feedback: 'Subtract in the same order on the top and the bottom.' },
        ]),
      }), (pr) => [
        numStep(`Find $${ctx.fn}(${x1})$.`, valueAt(g, x1), [`Substitute $t = ${x1}$.`, 'Find the power first.', `Then multiply by $${dTex(g.a)}$.`, x1 === 0 ? 'Any nonzero base to the power 0 is 1.' : `The power has ${x1} factor${x1 === 1 ? '' : 's'} of the base.`], `$${ctx.fn}(${x1}) = ${valueAt(g, x1).toTex()}$.`, [{ value: g.a.mul(g.b).mul(x1), tag: 'exponent-rule', feedback: 'The exponent means repeated multiplication of the base, not the base times the input.' }]),
        numStep(`Find $${ctx.fn}(${x2})$.`, valueAt(g, x2), [`Substitute $t = ${x2}$.`, 'Find the power first.', `Then multiply by $${dTex(g.a)}$.`, `The power has ${x2} factors of the base.`], `$${ctx.fn}(${x2}) = ${valueAt(g, x2).toTex()}$.`, [{ value: g.a.mul(g.b).mul(x2), tag: 'exponent-rule', feedback: 'The exponent means repeated multiplication of the base, not the base times the input.' }]),
        finalStep(pr, `Divide the change in output by the change in time. What is the average rate of change, in ${ctx.unit}?`, ['Average rate of change is change in output over change in input.', `Subtract: later output minus earlier output.`, `Divide by $${x2} - ${x1} = ${x2 - x1}$.`, bq.gt(1) ? 'The amount is growing, so the rate is positive.' : 'The amount is going down, so the rate is negative.'], `$\\frac{${valueAt(g, x2).toTex()} - ${valueAt(g, x1).toTex()}}{${x2} - ${x1}} = ${rr.toTex()}$ ${ctx.unit}.`),
      ]);
    }
    return withSteps(makeProblem({
      skillId: 'S6.05',
      tags,
      prompt,
      answer: numSpec(r),
      inputHint: 'Type a number or a fraction.',
      hints: ['Average rate of change is $\\frac{f(x_2) - f(x_1)}{x_2 - x_1}$.', `Find $${name}(${x1})$ and $${name}(${x2})$.`, 'Subtract the outputs in the same order as the inputs.', `Divide by $${x2} - ${x1} = ${x2 - x1}$.`],
      solution: [
        { text: 'Find the outputs.', tex: `${name}(${x1}) = ${f1.toTex()},\\quad ${name}(${x2}) = ${f2.toTex()}` },
        { text: 'Use the formula.', tex: `\\frac{${f2.toTex()} - ${f1.isNegative() ? `(${f1.toTex()})` : f1.toTex()}}{${x2} - ${subX(x1)}} = ${r.toTex()}`, why: 'It is the slope of the line through the two points on the graph.' },
      ],
      misconceptions: numberMisconceptions(r, [
        { value: f2.sub(f1), tag: 'slope-calc', feedback: 'Divide the change in output by the change in input.' },
        { value: r.isZero() ? null : Q(x2 - x1).div(f2.sub(f1)), tag: 'rise-run-swap', feedback: 'Put the change in output on top.' },
        { value: f2.div(x2).sub(f1.div(x1 === 0 ? 1 : x1)).isZero() ? null : rateOf({ ...f, b: f.b }, x1, x2).neg(), tag: 'sign-error', feedback: 'Subtract in the same order on the top and the bottom.' },
      ]),
    }), (pr) => {
      const how = (x: number) => (difficulty === 1 ? [`Substitute $x = ${x}$.`, 'Find the power first.', `Then multiply by $${dTex(f.a)}$.`, x === 0 ? 'Any nonzero base to the power 0 is 1.' : `The power has ${x} factor${x === 1 ? '' : 's'} of the base.`] : tags.includes('graph') ? ['Find the labeled point for this input.', `Its first coordinate is $${x}$.`, 'The second coordinate is the output.', 'Give just the output.'] : [`Find the row with $x = ${x}$.`, 'Read across to the output column.', `That number is $${name}(${x})$.`, 'Give just the output.']) as [string, string, string, string];
      return [
        numStep(`Find $${name}(${x1})$.`, f1, how(x1), `$${name}(${x1}) = ${f1.toTex()}$.`, [{ value: Q(x1), tag: 'graph-reading', feedback: 'That is the input. Find the output.' }, { value: difficulty === 1 ? f.a.mul(f.b).mul(x1) : null, tag: 'exponent-rule', feedback: 'The exponent means repeated multiplication of the base, not the base times the input.' }], { inputHint: 'Type a number or a fraction.' }),
        numStep(`Find $${name}(${x2})$.`, f2, how(x2), `$${name}(${x2}) = ${f2.toTex()}$.`, [{ value: Q(x2), tag: 'graph-reading', feedback: 'That is the input. Find the output.' }, { value: difficulty === 1 ? f.a.mul(f.b).mul(x2) : null, tag: 'exponent-rule', feedback: 'The exponent means repeated multiplication of the base, not the base times the input.' }], { inputHint: 'Type a number or a fraction.' }),
        finalStep(pr, `Divide the change in output by the change in input. What is the average rate of change from $x = ${x1}$ to $x = ${x2}$?`, ['Average rate of change is $\\frac{f(x_2) - f(x_1)}{x_2 - x_1}$.', 'Subtract the outputs in the same order as the inputs.', `Divide by $${x2} - ${x1} = ${x2 - x1}$.`, 'Simplify the fraction.'], `$\\frac{${f2.toTex()} - ${f1.toTex()}}{${x2} - ${x1}} = ${r.toTex()}$: the slope of the line through the two points.`),
      ];
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const m = [...text.matchAll(/\$[xt] = (\d+)\$/g)].map((q) => Number(q[1]));
    let f: ExpFn | null = null;
    const table = pr.prompt.find((b) => b.t === 'table');
    const g = graphOf(pr);
    const ctx = /\$([BM])\(t\) = (.+?)\$\./.exec(text);
    if (ctx) f = readFn(`=${ctx[2]}`, 't');
    else if (table && table.t === 'table') {
      const rows = table.rows.map((r) => [Number(r[0]), Q(r[1])] as const);
      const b = rows[1][1].div(rows[0][1]);
      f = { a: rows[0][1], b, k: Q(0) };
      for (const [x, y] of rows) if (!valueAt(f, x).eq(y)) return ['table is not exponential'];
    } else if (g) {
      const pts = (g.points ?? []).map((q) => parseLabel(q.label!)!);
      if (pr.answer.kind !== 'number') return ['unexpected kind'];
      const want = pts[1].y.sub(pts[0].y).div(pts[1].x.sub(pts[0].x));
      const fn = readFn(`=${g.functions![0].expr}`);
      for (const q of pts) if (!fn || !valueAt(fn, q.x.toInt()).eq(q.y)) return ['graph point off curve'];
      return [...(Q(pr.answer.value).eq(want) ? [] : ['rate wrong']), ...stepErrors(pr, [pts[0].y, pts[1].y, null])];
    } else f = readFn(mathBlocks(pr)[0]);
    if (!f) return ['cannot read'];
    if (pr.answer.kind === 'choice') {
      const iv = [...choiceLabel(pr.answer).matchAll(/x = (\d+)/g)].map((q) => Number(q[1]));
      const all = [...text.matchAll(/x = (\d+)/g)].map((q) => Number(q[1]));
      void all;
      const opts = pr.answer.options.map((o) => [...o.label.matchAll(/x = (\d+)/g)].map((q) => Number(q[1]))).filter((xs) => xs.length === 2);
      const best = opts.reduce((acc, xs) => (rateOf(f!, xs[0], xs[1]).gt(rateOf(f!, acc[0], acc[1])) ? xs : acc));
      return iv.length === 2 && iv[0] === best[0] && iv[1] === best[1] ? [] : ['comparison wrong'];
    }
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    const [x1, x2] = m.slice(-2);
    // steps: the two outputs, by repeated multiplication
    const out = (x: number) => {
      let v = f!.a;
      for (let i = 0; i < x; i++) v = v.mul(f!.b);
      return v.add(f!.k);
    };
    return [...(Q(pr.answer.value).eq(rateOf(f, x1, x2)) ? [] : ['rate wrong']), ...stepErrors(pr, [out(x1), out(x2), null])];
  },
};

// ---------------------------------------------------------------------------
// S6.06: transformations f(x) + k and k·f(x)
// ---------------------------------------------------------------------------

/** "1 unit", "3 units". */
const unitsOf = (v: Rational) => (v.eq(1) ? 'unit' : 'units');

function describe(kind: 'add' | 'mul', k: Rational): string {
  if (kind === 'add') return k.isNegative() ? `The graph shifts down ${dTex(k.abs())} ${unitsOf(k.abs())}.` : `The graph shifts up ${dTex(k)} ${unitsOf(k)}.`;
  if (k.eq(-1)) return 'The graph is reflected across the $x$-axis.';
  if (k.isNegative()) return `The graph is reflected across the $x$-axis and vertically ${k.abs().gt(1) ? 'stretched' : 'compressed'} by a factor of $${dTex(k.abs())}$.`;
  return k.gt(1) ? `The graph is vertically stretched by a factor of $${dTex(k)}$.` : `The graph is vertically compressed by a factor of $${dTex(k)}$.`;
}

export const genExpTransform: GeneratorDef = {
  id: 'u6.exp-transform',
  skillId: 'S6.06',
  description: 'Describe and find k for the transformations f(x) + k and k·f(x) of exponential functions, and their effect on the asymptote and y-intercept.',
  generate(rng, difficulty) {
    const b = rng.pick(['2', '3', '1/2', '2']);
    const a = rng.pick([1, 1, 2, 3]);
    const f = expFn(a, b);
    const fx = `f(x) = ${rhsTex(f)}`;
    const kind = rng.pick(['add', 'mul'] as const);
    const k = kind === 'add' ? Q(rng.nonzeroInt(-6, 6)) : Q(rng.pick(['2', '3', '4', '1/2', '1/3', '-1', '-2', '0.5']));
    const g: ExpFn = kind === 'add' ? { ...f, k } : { a: f.a.mul(k), b: f.b, k: Q(0) };
    const ruleTex = kind === 'add' ? `g(x) = f(x) ${k.isNegative() ? '-' : '+'} ${dTex(k.abs())}` : `g(x) = ${k.eq(-1) ? '-' : k.isInteger() ? k.toTex() : `${dTex(k)}`}${k.eq(-1) || k.isInteger() ? '' : '\\cdot '}f(x)`;
    if (difficulty === 1) {
      const correct = describe(kind, k);
      const wrongs = kind === 'add'
        ? [describe('add', k.neg()), `The graph shifts ${k.isNegative() ? 'right' : 'left'} ${dTex(k.abs())} ${unitsOf(k.abs())}.`, `The graph is vertically stretched by a factor of $${dTex(k.abs())}$.`]
        : [describe('mul', k.isNegative() ? k.abs().eq(1) ? Q(2) : k.abs() : k.neg()), `The graph shifts up $${dTex(k.abs())}$ ${unitsOf(k.abs())}.`, k.abs().eq(1) ? 'The graph is reflected across the $y$-axis.' : describe('mul', k.abs().inv())];
      return withSteps(makeProblem({
        skillId: 'S6.06',
        tags: [],
        prompt: [p('How does the graph of $g$ compare with the graph of $f$?'), { t: 'math', tex: fx }, { t: 'math', tex: ruleTex }],
        answer: makeChoice(rng, correct, wrongs),
        hints: ['Is the number added to the output, or multiplied by the output?', 'Adding to $f(x)$ moves every point up or down.', 'Multiplying $f(x)$ by $k$ multiplies every $y$-value by $k$.', kind === 'add' ? 'A positive number added moves the graph up; a negative one moves it down.' : '$k > 1$ stretches, $0 < k < 1$ compresses, and a negative $k$ also reflects across the $x$-axis.'],
        solution: [
          { text: kind === 'add' ? `Every output is ${k.isNegative() ? 'decreased' : 'increased'} by $${dTex(k.abs())}$.` : `Every output is multiplied by $${dTex(k)}$.`, why: kind === 'add' ? 'The $x$-values stay the same and each $y$-value changes by the same amount.' : 'The $x$-values stay the same and each $y$-value is scaled.' },
          { text: correct },
        ],
        misconceptions: [],
      }), (pr) => [
        choiceStep('Look at the rule for $g$. What happens to each output $f(x)$?', [`A number is added to it`, `It is multiplied by a number`], kind === 'add' ? 0 : 1, ['Read the rule for $g$ carefully.', 'If the number is written after $f(x)$ with a plus or minus sign, it is added.', 'If the number is written right in front of $f(x)$, it multiplies.', 'Either way, only the outputs ($y$-values) change.'], kind === 'add' ? `$g(x) = f(x) ${k.isNegative() ? '-' : '+'} ${dTex(k.abs())}$ adds $${dTex(k)}$ to every output.` : `$g(x)$ multiplies every output of $f$ by $${dTex(k)}$.`, [{ index: kind === 'add' ? 1 : 0, tag: 'other', feedback: kind === 'add' ? 'The number comes after $f(x)$ with a plus or minus sign, so it is added.' : 'The number is written in front of $f(x)$, so it multiplies.' }]),
        numStep(`Track one point. $f(0) = ${valueAt(f, 0).toTex()}$. What is $g(0)$?`, valueAt(g, 0), ['Apply the rule for $g$ to the output $f(0)$.', kind === 'add' ? `Add $${dTex(k)}$ to $f(0)$.` : `Multiply $f(0)$ by $${dTex(k)}$.`, 'The input stays $x = 0$; only the output changes.', 'Watch negative signs.'], kind === 'add' ? `$g(0) = ${valueAt(f, 0).toTex()} ${k.isNegative() ? '-' : '+'} ${dTex(k.abs())} = ${valueAt(g, 0).toTex()}$.` : `$g(0) = ${dTex(k)} \\cdot ${valueAt(f, 0).toTex()} = ${valueAt(g, 0).toTex()}$.`, [{ value: kind === 'add' ? valueAt(f, 0).mul(k) : valueAt(f, 0).add(k), tag: 'other', feedback: kind === 'add' ? 'The rule adds the number; it does not multiply.' : 'The rule multiplies by the number; it does not add.' }, { value: kind === 'add' ? valueAt(f, 0).sub(k) : null, tag: 'sign-error', feedback: 'Check the sign of the number added.' }], { inputHint: 'Type a number or a fraction.' }),
        finalStep(pr, `The point $(0, ${valueAt(f, 0).toTex()})$ moved to $(0, ${valueAt(g, 0).toTex()})$, and every other point changes the same way. How does the graph of $g$ compare with the graph of $f$?`, ['Adding to every output moves the graph up or down.', 'Multiplying every output by a number greater than 1 stretches the graph away from the $x$-axis; a number between 0 and 1 compresses it.', 'A negative multiplier also flips the graph across the $x$-axis.', 'The $x$-values do not change, so nothing moves left or right.'], correct),
      ]);
    }
    if (difficulty === 2) {
      // find k from two graphs with labeled points
      const xs = [0, 1];
      const win = windowFor([f, g], [-1, 0, 1, 2]);
      const pts = [...xs.map((x) => ({ x, y: valueAt(f, x).toNumber(), label: ptLabel(x, valueAt(f, x)), color: '#2b6cb0' })), ...xs.map((x) => ({ x, y: valueAt(g, x).toNumber(), label: ptLabel(x, valueAt(g, x)), color: '#d4572f' }))];
      const rule = kind === 'add' ? 'g(x) = f(x) + k' : 'g(x) = k \\cdot f(x)';
      return withSteps(makeProblem({
        skillId: 'S6.06',
        tags: ['graph'],
        prompt: [
          p(`The graphs of $${fx}$ (blue) and $g$ (orange) are shown. The rule is $${rule}$. Find $k$.`),
          { t: 'graph', spec: { ...win, functions: [{ expr: rhsPlain(f), color: '#2b6cb0', label: 'f' }, { expr: rhsPlain(g), color: '#d4572f', label: 'g' }], points: pts, ariaLabel: `Two exponential curves. f passes through ${pts[0].label} and ${pts[1].label}; g passes through ${pts[2].label} and ${pts[3].label}.` } },
        ],
        answer: numSpec(k),
        hints: ['Compare points with the same $x$-value.', kind === 'add' ? 'With $f(x) + k$, every $y$-value changes by the same amount.' : 'With $k \\cdot f(x)$, every $y$-value is multiplied by the same number.', kind === 'add' ? 'Subtract: $g(0) - f(0)$.' : 'Divide: $g(0) \\div f(0)$.', 'Check with the points at $x = 1$.'],
        solution: [
          { text: 'Compare the $y$-intercepts.', tex: kind === 'add' ? `k = g(0) - f(0) = ${valueAt(g, 0).toTex()} - ${valueAt(f, 0).toTex()} = ${k.toTex()}` : `k = \\frac{g(0)}{f(0)} = \\frac{${valueAt(g, 0).toTex()}}{${valueAt(f, 0).toTex()}} = ${k.toTex()}`, why: kind === 'add' ? 'Adding $k$ changes every output by $k$.' : 'Multiplying by $k$ scales every output by $k$.' },
          { text: 'Check at $x = 1$.', tex: kind === 'add' ? `${valueAt(g, 1).toTex()} - ${valueAt(f, 1).toTex()} = ${k.toTex()}` : `\\frac{${valueAt(g, 1).toTex()}}{${valueAt(f, 1).toTex()}} = ${k.toTex()}` },
        ],
        misconceptions: numberMisconceptions(k, [
          { value: kind === 'add' ? null : valueAt(g, 0).sub(valueAt(f, 0)), tag: 'other', feedback: 'For $k \\cdot f(x)$, divide the outputs instead of subtracting.' },
          { value: kind === 'add' ? (valueAt(f, 0).isZero() ? null : valueAt(g, 0).div(valueAt(f, 0))) : null, tag: 'other', feedback: 'For $f(x) + k$, subtract the outputs instead of dividing.' },
          { value: k.neg(), tag: 'sign-error', feedback: kind === 'add' ? 'Find $g(0) - f(0)$, in that order: $g$ first, then $f$.' : 'Check the sign: find $g(0) \\div f(0)$ and keep the sign of the result.' },
        ]),
      }), (pr) => [
        numStep('Read the blue graph. What is $f(0)$?', valueAt(f, 0), ['$f$ is the blue curve.', 'Find its labeled point with $x = 0$.', 'The second coordinate is the output.', 'Give just the $y$-value.'], `$f(0) = ${valueAt(f, 0).toTex()}$.`, [{ value: valueAt(g, 0), tag: 'graph-reading', feedback: 'That point is on the orange graph, $g$. Use the blue graph.' }]),
        numStep('Read the orange graph. What is $g(0)$?', valueAt(g, 0), ['$g$ is the orange curve.', 'Find its labeled point with $x = 0$.', 'The second coordinate is the output.', 'Give just the $y$-value.'], `$g(0) = ${valueAt(g, 0).toTex()}$.`, [{ value: valueAt(f, 0), tag: 'graph-reading', feedback: 'That point is on the blue graph, $f$. Use the orange graph.' }]),
        finalStep(pr, kind === 'add' ? 'The rule is $g(x) = f(x) + k$. What is $k$?' : 'The rule is $g(x) = k \\cdot f(x)$. What is $k$?', [kind === 'add' ? 'Adding $k$ changes every output by the same amount.' : 'Multiplying by $k$ scales every output by the same factor.', kind === 'add' ? 'Subtract: $g(0) - f(0)$.' : 'Divide: $g(0) \\div f(0)$.', 'Keep the order: $g$ first, then $f$.', 'Check with the points at $x = 1$.'], kind === 'add' ? `$k = ${valueAt(g, 0).toTex()} - ${valueAt(f, 0).toTex()} = ${k.toTex()}$.` : `$k = ${valueAt(g, 0).toTex()} \\div ${valueAt(f, 0).toTex()} = ${k.toTex()}$.`),
      ]);
    }
    // difficulty 3: new asymptote or y-intercept, possibly with both transformations
    const m = rng.nonzeroInt(-5, 5);
    const km = Q(rng.pick([2, 3, -1, -2, '1/2'] as const));
    const h: ExpFn = { a: f.a.mul(km), b: f.b, k: Q(m) };
    const rule = `g(x) = ${km.eq(-1) ? '-' : km.isInteger() ? km.toTex() : dTex(km)}${km.eq(-1) || km.isInteger() ? '' : '\\cdot '}f(x) ${m < 0 ? '-' : '+'} ${Math.abs(m)}`;
    const askAsym = rng.bool();
    if (askAsym) {
      const key = ASYM(Q(m));
      return makeProblem({
        skillId: 'S6.06',
        tags: ['multi-step'],
        prompt: [p('Write the equation of the horizontal asymptote of the graph of $g$.'), { t: 'math', tex: fx }, { t: 'math', tex: rule }],
        answer: { kind: 'equation', value: key },
        inputHint: 'Type an equation like y = 3.',
        hints: ['The asymptote of $f$ is $y = 0$.', 'Multiplying by a number keeps the asymptote at $y = 0$ (0 times anything is 0).', 'Adding a number moves the asymptote up or down by that amount.', 'A horizontal line has an equation like $y = c$.'],
        solution: [
          { text: 'Start with the asymptote of $f$.', tex: 'y = 0' },
          { text: `Multiplying by $${dTex(km)}$ keeps it at $y = 0$; adding $${m}$ moves it.`, tex: key, why: 'Every $y$-value, including the level the graph approaches, shifts by the same amount.' },
        ],
        misconceptions: equationMis(key, [
          { answer: ASYM(km), tag: 'graph-reading', feedback: 'Multiplying stretches the graph but does not move the asymptote away from $y = 0$.' },
          { answer: 'y = 0', tag: 'graph-reading', feedback: 'Adding a number moves the asymptote.' },
          { answer: ASYM(km.mul(m)), tag: 'graph-reading', feedback: 'The number added is not multiplied by the stretch factor.' },
          { answer: ASYM(Q(-m)), tag: 'sign-error', feedback: 'Check the sign of the number added.' },
        ]),
      });
    }
    const yi = valueAt(h, 0);
    return makeProblem({
      skillId: 'S6.06',
      tags: ['multi-step'],
      prompt: [p('What is the $y$-intercept of the graph of $g$? Give the $y$-value.'), { t: 'math', tex: fx }, { t: 'math', tex: rule }],
      answer: numSpec(yi),
      hints: ['Find $f(0)$ first.', `$f(0) = ${valueAt(f, 0).toTex()}$.`, 'Then apply the rule for $g$ to that output.', 'Multiply first, then add.'],
      solution: [
        { text: 'Find $f(0)$.', tex: `f(0) = ${valueAt(f, 0).toTex()}` },
        { text: 'Apply the rule.', tex: `g(0) = ${dTex(km)}(${valueAt(f, 0).toTex()}) ${m < 0 ? '-' : '+'} ${Math.abs(m)} = ${yi.toTex()}`, why: 'The rule acts on the output $f(0)$.' },
      ],
      misconceptions: numberMisconceptions(yi, [
        { value: valueAt(f, 0).add(m).mul(km), tag: 'order-of-operations', feedback: 'Multiply $f(x)$ first, then add.' },
        { value: valueAt(f, 0).mul(km), tag: 'other', feedback: 'Do not forget the number added at the end.' },
        { value: Q(m), tag: 'graph-reading', feedback: 'That is the asymptote, not the $y$-intercept.' },
      ]),
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const tex = mathBlocks(pr);
    const g = graphOf(pr);
    const f = readFn(g ? /\$(f\(x\) = .+?)\$ \(blue\)/.exec(text)![1] : tex[0]);
    if (!f) return ['cannot read f'];
    if (g) {
      const pts = (g.points ?? []).map((q) => parseLabel(q.label!)!);
      const [f0, f1, g0, g1] = pts.map((q) => q.y);
      if (!f0.eq(valueAt(f, 0)) || !f1.eq(valueAt(f, 1))) return ['f points wrong'];
      const add = /f\(x\) \+ k/.test(text);
      const k = add ? g0.sub(f0) : g0.div(f0);
      if (add ? !g1.sub(f1).eq(k) : !g1.div(f1).eq(k)) return ['g points inconsistent with the rule'];
      return [...(pr.answer.kind === 'number' && Q(pr.answer.value).eq(k) ? [] : ['k wrong']), ...stepErrors(pr, [f0, g0, null])];
    }
    const rule = tex[1];
    if (pr.answer.kind === 'choice') {
      const add = /f\(x\) [+-] /.test(rule) && !/[\d-]f\(x\)|cdot f/.test(rule);
      const mAdd = /f\(x\) ([+-]) ([\d.]+)$/.exec(rule);
      const mMul = /g\(x\) = (.*?)(?:\\cdot )?f\(x\)$/.exec(rule);
      const k = add && mAdd ? Q(mAdd[2]).mul(mAdd[1] === '-' ? -1 : 1) : mMul ? (mMul[1] === '-' ? Q(-1) : texExact(mMul[1])) : null;
      if (!k) return ['cannot read rule'];
      return [...(choiceLabel(pr.answer) === describe(add ? 'add' : 'mul', k) ? [] : ['description wrong']), ...stepErrors(pr, [add ? 'A number is added to it' : 'It is multiplied by a number', add ? valueAt(f, 0).add(k) : valueAt(f, 0).mul(k), null])];
    }
    const mm = /g\(x\) = (.*?)(?:\\cdot )?f\(x\) ([+-]) (\d+)$/.exec(rule);
    if (!mm) return ['cannot read rule'];
    const km = mm[1] === '-' ? Q(-1) : texExact(mm[1]);
    if (!km) return ['cannot read rule'];
    const m = Q(mm[3]).mul(mm[2] === '-' ? -1 : 1);
    // apply the rule to sample outputs of f
    const gAt = (x: number) => km.mul(valueAt(f, x)).add(m);
    if (pr.answer.kind === 'number') return Q(pr.answer.value).eq(gAt(0)) ? [] : ['y-intercept wrong'];
    if (pr.answer.kind === 'equation') return checkAnswer(pr.answer, ASYM(m)).status === 'correct' && gAt(-40).sub(m).abs().lt(Q(1, 1000000)) === f.b.gt(1) ? [] : ['asymptote wrong'];
    return ['unexpected kind'];
  },
};

void ([] as ProblemStep[]);

export const U6_FUNCTION_GENERATORS: GeneratorDef[] = [genEvaluateExp, genExpFeatures, genExpDomainRange, genExpRate, genExpTransform];
