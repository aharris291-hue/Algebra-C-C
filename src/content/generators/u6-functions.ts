/**
 * Unit 6 generators for exponential functions: function notation (S6.01), key features (S6.02),
 * domain, range and intervals (S6.03), average rate of change (S6.05) and transformations (S6.06).
 * verify() re-reads the printed function (or graph) and re-derives the answer from a, b and k.
 */
import type { GeneratorDef, Rng, Block, ProblemStep, GraphSpec } from '../../core/curriculum/types';
import type { Misconception, MisconceptionTag } from '../../core/math/answers';
import { parseInterval, intervalsEqual, parseRelation, checkAnswer } from '../../core/math/answers';
import { Rational } from '../../core/math/rational';
import { p, makeProblem, makeChoice, choiceLabel, numStr, Q, numberMisconceptions } from './util';
import { mathBlocks, graphOf } from './u4-common';
import { dTex, commas, texExact } from './u5-common';
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
      ];
      return makeProblem({
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
      });
    }
    const kind = rng.pick(['compute', 'interpret', 'solve'] as const);
    if (kind === 'solve') {
      const b = rng.pick([2, 2, 3, 4, 5]);
      const a = rng.pick([2, 3, 4, 5, 10]);
      const n = rng.int(2, b === 2 ? 6 : 3);
      const f = expFn(a, b);
      const target = valueAt(f, n);
      return makeProblem({
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
      });
    }
    const c = rng.pick(CONTEXTS);
    const f = expFn(rng.pick(c.a), rng.pick(c.b));
    const t = rng.int(2, 6);
    const v = valueAt(f, t);
    const fx = `${c.fn}(${c.v}) = ${rhsTex(f, c.v)}`;
    if (kind === 'compute') {
      const places = c.round;
      return makeProblem({
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
      });
    }
    // interpret a statement P(t) = value
    const shown = c.round === 2 ? v.round(0) : v.round(0);
    const vText = commas(shown);
    const unitWord = c.noun.startsWith('number of') ? '' : ` ${c.unit}`;
    const valPhrase = `about $${vText}$${unitWord}`;
    const vPlain = vText.replace(/\{,\}/g, ',');
    const correct = `${t} ${c.per}s after the start, the ${c.noun} is ${valPhrase}.`;
    return makeProblem({
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
    });
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
      return errs;
    }
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    const ev = /^Evaluate \$\w\((-?\d+)\)\$/.exec(text) ?? /Find \$\w\((\d+)\)\$/.exec(text);
    if (ev) return valueAt(f, Number(ev[1])).eq(Q(pr.answer.value)) ? [] : ['value wrong'];
    const sv = /= ([\d{},]+)\$\./.exec(text);
    if (!sv) return ['cannot read'];
    const x = Q(pr.answer.value).toInt();
    return valueAt(f, x).eq(Q(sv[1])) ? [] : ['x does not give the value'];
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

export const genExpFeatures: GeneratorDef = {
  id: 'u6.exp-features',
  skillId: 'S6.02',
  description: 'Find the y-intercept, horizontal asymptote, increasing or decreasing behavior and end behavior of exponential functions.',
  generate(rng, difficulty) {
    const f = randomFn(rng, difficulty >= 2);
    const yInt = f.a.add(f.k);
    const fx = `f(x) = ${rhsTex(f)}`;
    const ask = difficulty === 3 ? rng.pick(['asym', 'yint', 'end'] as const) : difficulty === 2 ? rng.pick(['asym', 'yint', 'inc'] as const) : rng.pick(['asym', 'yint'] as const);
    const intro: Block[] = difficulty === 3 ? [p('The graph of an exponential function $f$ is shown. Points on the graph are labeled.'), graphBlock(f, 'f')] : [{ t: 'math', tex: fx }];
    if (ask === 'yint') {
      return makeProblem({
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
      });
    }
    if (ask === 'asym') {
      const key = ASYM(f.k);
      return makeProblem({
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
      });
    }
    if (ask === 'inc') {
      const inc = increasing(f);
      return makeProblem({
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
      });
    }
    // end behavior
    const toPlus = rng.bool();
    const grows = (toPlus && f.b.gt(1)) || (!toPlus && f.b.lt(1));
    const limit = grows ? (f.a.sign() > 0 ? '\\infty' : '-\\infty') : numStr(f.k);
    const opts = ['\\infty', '-\\infty', numStr(f.k), numStr(yInt)].map((s) => `$f(x) \\to ${s}$`);
    const correct = `$f(x) \\to ${limit}$`;
    return makeProblem({
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
    });
  },
  verify(pr) {
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
    if (pr.answer.kind === 'number') return Q(pr.answer.value).eq(f.a.add(f.k)) ? [] : ['y-intercept wrong'];
    if (pr.answer.kind === 'equation') {
      const r = parseRelation(pr.answer.value);
      return r.lhs.type === 'var' && r.lhs.name === 'y' && r.rhs.type !== 'var' && checkAnswer(pr.answer, ASYM(f.k)).status === 'correct' ? [] : ['asymptote wrong'];
    }
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const label = choiceLabel(pr.answer);
    if (/increasing or decreasing/.test(text)) return label === (increasing(f) ? 'Increasing' : 'Decreasing') ? [] : ['direction wrong'];
    const toPlus = /x \\to \\infty\$, what/.test(text);
    // numerically: far out, compare with the asymptote
    const far = toPlus ? 60 : -60;
    const val = valueAt(f, far).toNumber();
    const want = Math.abs(val - f.k.toNumber()) < 1e-6 ? numStr(f.k) : val > 0 ? '\\infty' : '-\\infty';
    return label === `$f(x) \\to ${want}$` ? [] : [`expected ${want}`];
  },
};

// ---------------------------------------------------------------------------
// S6.03: domain, range and intervals
// ---------------------------------------------------------------------------

const rangeOf = (f: ExpFn) => (f.a.sign() > 0 ? `(${numStr(f.k)}, inf)` : `(-inf, ${numStr(f.k)})`);

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
        return makeProblem({
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
        });
      }
      const key = rangeOf(f);
      const up = f.a.sign() > 0;
      return makeProblem({
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
      });
    }
    if (rng.bool()) {
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
      return makeProblem({
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
      });
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
    return makeProblem({
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
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'interval') return ['unexpected kind'];
    const text = textAll(pr);
    const got = parseInterval(pr.answer.value);
    const eq = (s: string) => (intervalsEqual(got, parseInterval(s)) ? [] : [`expected ${s}`]);
    const ctx = /\$([CM])\(t\) = (.+?)\$, where/.exec(text);
    if (ctx) {
      const f = readFn(`=${ctx[2]}`, 't')!;
      const T = Number(/to \$t = (\d+)\$/.exec(text)![1]);
      if (/reasonable domain/.test(text)) return eq(`[0, ${T}]`);
      const ys = [valueAt(f, 0), valueAt(f, T)];
      const lo = ys[0].lt(ys[1]) ? ys[0] : ys[1];
      const hi = ys[0].lt(ys[1]) ? ys[1] : ys[0];
      return eq(`[${numStr(lo)}, ${numStr(hi)}]`);
    }
    const f = readFn(mathBlocks(pr)[0]);
    if (!f) return ['cannot read function'];
    if (/domain/.test(text)) return eq('(-inf, inf)');
    if (/range/.test(text)) return eq(rangeOf(f));
    // positive / negative: sample integers and half-integers around the answer
    const pos = /positive/.test(text);
    for (let x = -8; x <= 8; x += 0.5) {
      const v = f.a.toNumber() * Math.pow(f.b.toNumber(), x) + f.k.toNumber();
      const inside = (got.lo === null || x > got.lo.toNumber() || (got.loClosed && x === got.lo.toNumber())) && (got.hi === null || x < got.hi.toNumber() || (got.hiClosed && x === got.hi.toNumber()));
      const good = pos ? v > 1e-12 : v < -1e-12;
      if (inside !== good) return [`interval wrong at x = ${x}`];
    }
    return [];
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
      return makeProblem({
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
      });
    }
    return makeProblem({
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
      return Q(pr.answer.value).eq(want) ? [] : ['rate wrong'];
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
    return Q(pr.answer.value).eq(rateOf(f, x1, x2)) ? [] : ['rate wrong'];
  },
};

// ---------------------------------------------------------------------------
// S6.06: transformations f(x) + k and k·f(x)
// ---------------------------------------------------------------------------

function describe(kind: 'add' | 'mul', k: Rational): string {
  if (kind === 'add') return k.isNegative() ? `The graph shifts down ${dTex(k.abs())} units.` : `The graph shifts up ${dTex(k)} units.`;
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
        ? [describe('add', k.neg()), `The graph shifts ${k.isNegative() ? 'right' : 'left'} ${dTex(k.abs())} units.`, `The graph is vertically stretched by a factor of $${dTex(k.abs())}$.`]
        : [describe('mul', k.isNegative() ? k.abs().eq(1) ? Q(2) : k.abs() : k.neg()), `The graph shifts up $${dTex(k.abs())}$ units.`, k.abs().eq(1) ? 'The graph is reflected across the $y$-axis.' : describe('mul', k.abs().inv())];
      return makeProblem({
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
      });
    }
    if (difficulty === 2) {
      // find k from two graphs with labeled points
      const xs = [0, 1];
      const win = windowFor([f, g], [-1, 0, 1, 2]);
      const pts = [...xs.map((x) => ({ x, y: valueAt(f, x).toNumber(), label: ptLabel(x, valueAt(f, x)), color: '#2b6cb0' })), ...xs.map((x) => ({ x, y: valueAt(g, x).toNumber(), label: ptLabel(x, valueAt(g, x)), color: '#d4572f' }))];
      const rule = kind === 'add' ? 'g(x) = f(x) + k' : 'g(x) = k \\cdot f(x)';
      return makeProblem({
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
          { value: k.neg(), tag: 'sign-error', feedback: 'Subtract (or divide) $g$ by $f$, in that order.' },
        ]),
      });
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
      return pr.answer.kind === 'number' && Q(pr.answer.value).eq(k) ? [] : ['k wrong'];
    }
    const rule = tex[1];
    if (pr.answer.kind === 'choice') {
      const add = /f\(x\) [+-] /.test(rule) && !/[\d-]f\(x\)|cdot f/.test(rule);
      const mAdd = /f\(x\) ([+-]) ([\d.]+)$/.exec(rule);
      const mMul = /g\(x\) = (.*?)(?:\\cdot )?f\(x\)$/.exec(rule);
      const k = add && mAdd ? Q(mAdd[2]).mul(mAdd[1] === '-' ? -1 : 1) : mMul ? (mMul[1] === '-' ? Q(-1) : texExact(mMul[1])) : null;
      if (!k) return ['cannot read rule'];
      return choiceLabel(pr.answer) === describe(add ? 'add' : 'mul', k) ? [] : ['description wrong'];
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
