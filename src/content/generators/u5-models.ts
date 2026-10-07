/**
 * Unit 5 generators for exponential models: interpreting a(b)^x (S5.02), writing growth and decay
 * equations (S5.03), constraints and viable values (S5.05), percent change and compound interest
 * (S5.06). verify() re-reads the printed model, story numbers, table or graph and re-derives the
 * answer exactly (values are checked as exact rationals, money is checked before rounding).
 */
import type { GeneratorDef, Rng, ProblemStep, Block, SolutionStep } from '../../core/curriculum/types';
import type { Misconception, MisconceptionTag } from '../../core/math/answers';
import { parseRelation, checkAnswer, fixedPlaces } from '../../core/math/answers';
import { parseExpression } from '../../core/math/parser';
import { Rational } from '../../core/math/rational';
import { p, makeProblem, makeChoice, choiceLabel, numStr, Q, numberMisconceptions } from './util';
import { texToParser, exactRational, expPlain, expTex, dTex, commas, pct, textOf } from './u5-common';
import { mathBlocks, graphOf } from './u4-common';

type Hints = [string, string, string, string];

/** Money in text: "\\$1,500" or "\\$1,234.56". */
export function moneyText(x: Rational): string {
  const s = x.isInteger() ? x.toDecimalString(0) : fixedPlaces(x, 2);
  const [i, f] = s.split('.');
  return '\\$' + i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : '');
}
type Mis = { value: Rational | null; tag: MisconceptionTag; feedback: string };

/** Read "y = a(b)^x" or "P(t) = a(b)^t" from TeX: returns a, b and the input variable. */
export function readModel(tex: string): { a: Rational; b: Rational; v: string } | null {
  const m = /=\s*(.+?)\\left\((.+?)\\right\)\^\{(\w)\}\s*$/.exec(tex);
  if (!m) return null;
  const a = exactRational(parseExpression(texToParser(m[1].replace(/\{,\}/g, ''))));
  const b = exactRational(parseExpression(texToParser(m[2])));
  return a && b ? { a, b, v: m[3] } : null;
}

/** Exact value string: every decimal digit of a terminating decimal, otherwise a fraction. */
const exactStr = (v: Rational) => {
  const d = v.isTerminatingDecimal() ? v.toDecimalString(400) : '';
  return d && Rational.parse(d).eq(v) ? d : v.toString();
};
const numSpec = (v: Rational, unit?: string, roundTo?: number) => ({ kind: 'number' as const, value: exactStr(v), ...(unit ? { unit } : {}), ...(roundTo !== undefined ? { roundTo } : {}) });

// ---------------------------------------------------------------------------
// S5.02: interpret exponential expressions
// ---------------------------------------------------------------------------

const GROWTH_B = ['2', '3', '1.5', '1.2', '1.05', '1.08', '1.25', '1.1', '1.03', '4'];
const DECAY_B = ['0.5', '0.8', '0.75', '0.9', '0.95', '0.6', '0.85', '0.4', '0.98'];

interface Ctx {
  fn: string;
  v: string;
  /** "the value of a car, in dollars" */
  what: string;
  unitNoun: string;
  per: string;
  a: number;
  b: string;
}

function context(rng: Rng): Ctx {
  return rng.pick<Ctx>([
    { fn: 'V', v: 't', what: 'the value of a car, in dollars, $t$ years after it was bought', unitNoun: 'value', per: 'year', a: rng.pick([18000, 24000, 30000, 21000]), b: rng.pick(['0.85', '0.8', '0.9']) },
    { fn: 'P', v: 't', what: 'the population of a town $t$ years after 2020', unitNoun: 'population', per: 'year', a: rng.pick([1200, 4500, 8000, 2400]), b: rng.pick(['1.04', '1.03', '1.06', '1.02']) },
    { fn: 'B', v: 'h', what: 'the number of bacteria in a dish $h$ hours after an experiment starts', unitNoun: 'number of bacteria', per: 'hour', a: rng.pick([300, 50, 120, 400]), b: rng.pick(['2', '3', '1.5']) },
    { fn: 'M', v: 'h', what: 'the milligrams of a medicine left in the body $h$ hours after a dose', unitNoun: 'amount of medicine', per: 'hour', a: rng.pick([400, 200, 500, 800]), b: rng.pick(['0.75', '0.8', '0.5']) },
    { fn: 'S', v: 'd', what: 'the number of views of a video $d$ days after it was posted', unitNoun: 'number of views', per: 'day', a: rng.pick([1500, 600, 2000]), b: rng.pick(['1.2', '1.5', '1.25']) },
    { fn: 'T', v: 'm', what: 'the temperature difference, in degrees, between a cup of tea and the room $m$ minutes after it is poured', unitNoun: 'temperature difference', per: 'minute', a: rng.pick([140, 120, 150]), b: rng.pick(['0.95', '0.9', '0.96']) },
  ]);
}

function changeWord(b: Rational) {
  return b.gt(1) ? 'increases' : 'decreases';
}

export const genInterpretExponential: GeneratorDef = {
  id: 'u5.interpret-exponential',
  skillId: 'S5.02',
  description: 'Identify the initial value, growth or decay factor and percent rate of an exponential expression, and interpret them in context.',
  generate(rng, difficulty) {
    if (difficulty === 3) {
      const c = context(rng);
      const a = Q(c.a);
      const b = Q(c.b);
      const r = b.sub(1).abs();
      const fx = `${c.fn}(${c.v}) = ${c.a}\\left(${dTex(b)}\\right)^{${c.v}}`;
      const askA = rng.bool();
      const growth = b.gt(1);
      const story = [p(`The function below gives ${c.what}.`), { t: 'math' as const, tex: fx }];
      if (askA) {
        const ans = makeChoice(rng, `The ${c.unitNoun} at the start, when $${c.v} = 0$`, [`How much the ${c.unitNoun} changes each ${c.per}`, `The ${c.unitNoun} after 1 ${c.per}`, `The percent the ${c.unitNoun} changes each ${c.per}`]);
        return makeProblem({
          skillId: 'S5.02',
          tags: ['real-world'],
          prompt: [...story, p(`What does the number $${c.a}$ represent?`)],
          answer: ans,
          hints: [`Substitute $${c.v} = 0$ into the function.`, `Any nonzero number to the zero power is 1, so $\\left(${dTex(b)}\\right)^{0} = 1$.`, `So $${c.fn}(0)$ is the number in front.`, `In $a(b)^{${c.v}}$, $a$ is the initial value.`],
          solution: [
            { text: `Substitute $${c.v} = 0$.`, tex: `${c.fn}(0) = ${c.a}\\left(${dTex(b)}\\right)^{0} = ${c.a}(1) = ${c.a}`, why: 'The zero power is 1.' },
            { text: `So $${c.a}$ is the ${c.unitNoun} at the start.`, why: 'The initial value $a$ is the output when the input is 0.' },
          ],
          misconceptions: [],
        });
      }
      const rp = pct(r);
      const correct = `The ${c.unitNoun} ${changeWord(b)} by ${rp}% each ${c.per}.`;
      const wrongs = growth
        ? [`The ${c.unitNoun} increases by ${pct(b)}% each ${c.per}.`, `The ${c.unitNoun} increases by ${dTex(b)} each ${c.per}.`, `The ${c.unitNoun} decreases by ${rp}% each ${c.per}.`]
        : [`The ${c.unitNoun} decreases by ${pct(b)}% each ${c.per}.`, `The ${c.unitNoun} decreases by ${dTex(b)} each ${c.per}.`, `The ${c.unitNoun} increases by ${rp}% each ${c.per}.`];
      return makeProblem({
        skillId: 'S5.02',
        tags: ['real-world'],
        prompt: [...story, p(`What does the number $${dTex(b)}$ tell you?`)],
        answer: makeChoice(rng, correct, wrongs),
        hints: [`Is $${dTex(b)}$ greater than 1 or less than 1?`, growth ? 'A factor greater than 1 means growth: $b = 1 + r$.' : 'A factor between 0 and 1 means decay: $b = 1 - r$.', growth ? `Solve $1 + r = ${dTex(b)}$ for the rate $r$.` : `Solve $1 - r = ${dTex(b)}$ for the rate $r$.`, 'Change the rate from a decimal to a percent.'],
        solution: [
          { text: growth ? 'The factor is greater than 1, so this is growth.' : 'The factor is between 0 and 1, so this is decay.', tex: growth ? `${dTex(b)} = 1 + ${dTex(r)}` : `${dTex(b)} = 1 - ${dTex(r)}`, why: `Each ${c.per} the ${c.unitNoun} is multiplied by $${dTex(b)}$, which ${growth ? 'adds' : 'takes away'} $${dTex(r)}$ of the current amount.` },
          { text: 'Write the rate as a percent.', tex: `${dTex(r)} = ${rp}\\%`, why: growth ? '' : `Multiplying by $${dTex(b)}$ keeps ${pct(b)}% of the ${c.unitNoun}, so ${rp}% is lost.` },
        ],
        misconceptions: [],
      });
    }
    const growth = rng.bool();
    const b = Q(growth ? rng.pick(GROWTH_B) : rng.pick(DECAY_B));
    const a = Q(rng.pick([3, 5, 8, 12, 20, 25, 40, 50, 60, 75, 100, 150, 200, 250, 400, 500, 1000, 1200]));
    const tex = expTex(a, b);
    if (difficulty === 1) {
      const ask = rng.pick(['a', 'b', 'type'] as const);
      if (ask === 'type') {
        return makeProblem({
          skillId: 'S5.02',
          tags: [],
          prompt: [p('Does this equation show exponential growth or exponential decay?'), { t: 'math', tex }],
          answer: makeChoice(rng, growth ? 'Exponential growth' : 'Exponential decay', [growth ? 'Exponential decay' : 'Exponential growth', 'Linear growth', 'Neither: it stays the same']),
          hints: ['In $y = a(b)^{x}$, look at the base $b$.', 'If $b > 1$, each step multiplies by more than 1.', 'If $0 < b < 1$, each step multiplies by less than 1.', `Compare $${dTex(b)}$ with 1.`],
          solution: [
            { text: 'Find the base.', tex: `b = ${dTex(b)}` },
            { text: growth ? '$b > 1$, so the values grow.' : '$0 < b < 1$, so the values shrink.', why: growth ? 'Multiplying by a number greater than 1 makes a positive number bigger.' : 'Multiplying by a number between 0 and 1 makes a positive number smaller.' },
          ],
          misconceptions: [],
        });
      }
      const target = ask === 'a' ? a : b;
      const other = ask === 'a' ? b : a;
      return makeProblem({
        skillId: 'S5.02',
        tags: [],
        prompt: [p(ask === 'a' ? 'What is the initial value (the value of $y$ when $x = 0$)?' : `What is the ${growth ? 'growth' : 'decay'} factor?`), { t: 'math', tex }],
        answer: numSpec(target),
        hints: ['Compare the equation with $y = a(b)^{x}$.', '$a$ is the initial value and $b$ is the growth or decay factor.', ask === 'a' ? 'The initial value is the number multiplied in front.' : 'The factor is the base that is raised to the power $x$.', ask === 'a' ? 'At $x = 0$, the power equals 1.' : 'Each time $x$ goes up by 1, $y$ is multiplied by this number.'],
        solution: [
          { text: 'Match the equation with $y = a(b)^{x}$.', tex: `a = ${dTex(a)},\\quad b = ${dTex(b)}`, why: ask === 'a' ? `When $x = 0$, $y = ${dTex(a)}(${dTex(b)})^{0} = ${dTex(a)}$.` : `Each step in $x$ multiplies $y$ by $${dTex(b)}$.` },
          { text: ask === 'a' ? `The initial value is $${dTex(a)}$.` : `The ${growth ? 'growth' : 'decay'} factor is $${dTex(b)}$.` },
        ],
        misconceptions: numberMisconceptions(target, [{ value: other, tag: 'growth-decay', feedback: ask === 'a' ? 'That is the base $b$. The initial value is the number in front.' : 'That is the initial value $a$. The factor is the base raised to the power.' }]),
      });
    }
    // difficulty 2: factor <-> percent
    if (rng.bool()) {
      const r = b.sub(1).abs();
      const word = growth ? 'grows' : 'decays';
      return makeProblem({
        skillId: 'S5.02',
        tags: [],
        prompt: [p(`The amount $y$ ${word} according to the equation below. By what percent does $y$ ${growth ? 'increase' : 'decrease'} each time $x$ increases by 1?`), { t: 'math', tex }],
        answer: numSpec(r.mul(100), '%'),
        inputHint: 'Type the percent as a number, like 12 for 12%.',
        hints: [growth ? 'For growth, $b = 1 + r$.' : 'For decay, $b = 1 - r$.', growth ? `Solve $1 + r = ${dTex(b)}$.` : `Solve $1 - r = ${dTex(b)}$.`, 'The rate $r$ is a decimal. Multiply by 100 for a percent.', growth ? 'The 1 stands for keeping what you had; the rest is the increase.' : 'The factor is the part that remains; the rate is the part that is lost.'],
        solution: [
          { text: growth ? 'Use $b = 1 + r$.' : 'Use $b = 1 - r$.', tex: `r = ${growth ? `${dTex(b)} - 1` : `1 - ${dTex(b)}`} = ${dTex(r)}`, why: growth ? 'Multiplying by $1 + r$ keeps the whole amount and adds $r$ of it.' : 'Multiplying by $1 - r$ keeps only part of the amount, losing $r$ of it.' },
          { text: 'Write it as a percent.', tex: `${dTex(r)} = ${pct(r)}\\%` },
        ],
        misconceptions: numberMisconceptions(r.mul(100), [
          { value: b.mul(100), tag: 'percent-rate', feedback: growth ? `$${dTex(b)}$ is the whole new amount compared with the old one (${pct(b)}%). Subtract the original 100%.` : `$${dTex(b)}$ is the part that remains (${pct(b)}%). The question asks for the part that is lost.` },
          { value: r, tag: 'percent-rate', feedback: 'That is the rate as a decimal. Write it as a percent.' },
        ]),
      });
    }
    const rr = Q(rng.pick(growth ? [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 35] : [2, 4, 5, 8, 10, 12, 15, 20, 25, 30, 40]), 100);
    const factor = growth ? Q(1).add(rr) : Q(1).sub(rr);
    const thing = rng.pick(growth ? ['a savings account balance', 'the number of members of a club', 'the population of a city', 'the number of trees in a forest'] : ['the value of a laptop', 'the number of fish in a lake', 'the amount of water in a leaking tank', 'the brightness of a fading light']);
    return makeProblem({
      skillId: 'S5.02',
      tags: ['word'],
      prompt: [p(`Each year, ${thing} ${growth ? 'increases' : 'decreases'} by ${pct(rr)}%. What is the ${growth ? 'growth' : 'decay'} factor $b$ in the model $y = a(b)^{x}$?`)],
      answer: numSpec(factor),
      inputHint: 'Type a decimal, like 1.07 or 0.93.',
      hints: [growth ? 'For growth, $b = 1 + r$.' : 'For decay, $b = 1 - r$.', `Write ${pct(rr)}% as a decimal.`, growth ? 'Add the rate to 1.' : 'Subtract the rate from 1.', growth ? 'The factor should be greater than 1.' : 'The factor should be between 0 and 1.'],
      solution: [
        { text: 'Write the percent as a decimal.', tex: `${pct(rr)}\\% = ${dTex(rr)}` },
        { text: growth ? 'Add it to 1.' : 'Subtract it from 1.', tex: `b = ${growth ? `1 + ${dTex(rr)}` : `1 - ${dTex(rr)}`} = ${dTex(factor)}`, why: growth ? `After a year you have all of it (1) plus ${pct(rr)}% more.` : `After a year you keep ${pct(factor)}% of it.` },
      ],
      misconceptions: numberMisconceptions(factor, [
        { value: rr, tag: 'percent-rate', feedback: 'That is the rate. The factor tells what you multiply by each year, which includes the amount you already had.' },
        { value: growth ? Q(1).sub(rr) : Q(1).add(rr), tag: 'growth-decay', feedback: growth ? 'An increase needs a factor greater than 1.' : 'A decrease needs a factor less than 1.' },
        { value: rr.mul(100), tag: 'percent-rate', feedback: 'Write the rate as a decimal first.' },
      ]),
    });
  },
  verify(pr) {
    const text = textOf(pr);
    const tex = mathBlocks(pr)[0];
    if (!tex) {
      // percent -> factor
      const m = /(increases|decreases) by ([\d.]+)%/.exec(text);
      if (!m || pr.answer.kind !== 'number') return ['cannot read story'];
      const r = Q(m[2]).div(100);
      const want = m[1] === 'increases' ? Q(1).add(r) : Q(1).sub(r);
      return Q(pr.answer.value).eq(want) ? [] : [`expected ${want.toString()}`];
    }
    const md = readModel(tex);
    if (!md) return ['cannot read model'];
    const { a, b } = md;
    if (pr.answer.kind === 'number') {
      if (/initial value/.test(text)) return Q(pr.answer.value).eq(a) ? [] : ['initial value wrong'];
      if (/factor\?/.test(text)) return Q(pr.answer.value).eq(b) ? [] : ['factor wrong'];
      if (/By what percent/.test(text)) {
        const errs = Q(pr.answer.value).eq(b.sub(1).abs().mul(100)) ? [] : ['percent wrong'];
        if (/increase each/.test(text) !== b.gt(1)) errs.push('direction wrong');
        return errs;
      }
      return ['unknown question'];
    }
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const label = choiceLabel(pr.answer);
    if (/growth or exponential decay/.test(text)) return label === (b.gt(1) ? 'Exponential growth' : 'Exponential decay') ? [] : ['type wrong'];
    if (/represent\?/.test(text)) return /at the start/.test(label) && text.includes(`number $${numStr(a)}$`) ? [] : ['meaning of a wrong'];
    const want = `${changeWord(b)} by ${pct(b.sub(1).abs())}%`;
    return label.includes(want) ? [] : [`expected "${want}"`];
  },
};

// ---------------------------------------------------------------------------
// S5.03: write exponential equations
// ---------------------------------------------------------------------------

const WORD_B: Array<{ b: Rational; phrase: string }> = [
  { b: Q(2), phrase: 'doubles' },
  { b: Q(3), phrase: 'triples' },
  { b: Q(4), phrase: 'quadruples (is multiplied by 4)' },
  { b: Q(1, 2), phrase: 'is cut in half' },
  { b: Q(1, 3), phrase: 'is divided by 3' },
  { b: Q(10), phrase: 'is multiplied by 10' },
];

const STORIES = [
  { start: 'A colony of bacteria starts with', unit: 'bacteria', per: 'hour', grow: true },
  { start: 'A rumor is known by', unit: 'students', per: 'day', grow: true },
  { start: 'A sample of a radioactive substance has a mass of', unit: 'grams', per: 'half-life period', grow: false },
  { start: 'A ball is dropped and its first bounce reaches a height of', unit: 'inches', per: 'bounce', grow: false },
];

function yAt(a: Rational, b: Rational, x: number) {
  return a.mul(b.pow(x));
}

export const genWriteExponential: GeneratorDef = {
  id: 'u5.write-exponential',
  skillId: 'S5.03',
  description: 'Write y = a(b)^x from words, a table, a graph or two points.',
  generate(rng, difficulty) {
    let a: Rational;
    let b: Rational;
    let prompt: Block[];
    let hints: Hints;
    let solution: SolutionStep[];
    let steps: ProblemStep[] | undefined;
    const tags: Array<'real-world' | 'word' | 'graph' | 'multi-step'> = [];
    if (difficulty === 1) {
      const story = rng.pick(STORIES);
      const opt = story.per === 'half-life period' ? WORD_B[3] : rng.pick(WORD_B.filter((w) => w.b.gt(1) === story.grow));
      b = opt.b;
      const mult = b.lt(1) ? Number(b.inv().pow(3).num) : 1;
      a = Q(rng.int(1, story.grow ? 60 : 12) * mult * (story.grow ? 1 : 1));
      if (story.unit === 'inches') a = Q(rng.pick([81, 54, 108, 64, 96, 128, 162]));
      if (!b.inv().isInteger() || (b.lt(1) && !a.div(b.inv().pow(2)).isInteger())) a = Q(b.lt(1) ? b.inv().pow(3).mul(rng.int(1, 6)) : a);
      tags.push('real-world', 'word');
      const xName = story.per === 'bounce' ? 'bounces after the first' : `${story.per}s`;
      prompt = [p(`${story.start} $${numStr(a)}$ ${story.unit}. The number ${opt.phrase} every ${story.per === 'bounce' ? 'bounce' : story.per}. Write an equation for $y$, the number of ${story.unit} after $x$ ${xName}.`)];
      if (story.unit === 'grams' || story.unit === 'inches') prompt = [p(`${story.start} $${numStr(a)}$ ${story.unit}. The ${story.unit === 'grams' ? 'mass' : 'height'} ${opt.phrase} every ${story.per}. Write an equation for $y$, the ${story.unit === 'grams' ? 'mass in grams' : 'bounce height in inches'} ${story.unit === 'grams' ? `after $x$ ${xName}` : '$x$ bounces after the first bounce'}.`)];
      hints = ['An exponential model has the form $y = a(b)^{x}$.', '$a$ is the starting amount, when $x = 0$.', '$b$ is what you multiply by each time $x$ increases by 1.', `"${opt.phrase}" means multiply by $${dTex(b)}$ each time.`];
      solution = [
        { text: 'Find the starting amount.', tex: `a = ${numStr(a)}`, why: 'It is the amount when $x = 0$, before any change.' },
        { text: 'Find the factor.', tex: `b = ${dTex(b)}`, why: `"${opt.phrase}" means multiply by $${dTex(b)}$ each ${story.per}.` },
        { text: 'Write the equation.', tex: expTex(a, b) },
      ];
    } else if (difficulty === 2) {
      b = Q(rng.pick(['2', '3', '1.5', '0.5', '0.25', '2.5', '4', '0.2']));
      const den = Number(b.den);
      const scale = b.isInteger() ? 1 : den ** 3;
      a = Q(rng.pick([2, 3, 4, 5, 6, 10, 12]) * scale);
      if (b.eq(2.5)) a = Q(rng.pick([8, 16, 24]));
      if (b.eq(4) || b.eq(3)) a = Q(rng.int(1, 6));
      if (rng.bool()) {
        prompt = [p('The table shows an exponential function. Write its equation in the form $y = a(b)^{x}$.'), { t: 'table', headers: ['$x$', '$y$'], rows: [0, 1, 2, 3].map((x) => [String(x), commas(yAt(a, b, x))]) }];
        hints = ['Find $y$ when $x = 0$. That is $a$.', 'Divide each $y$-value by the one before it.', 'The ratio you get every time is $b$.', 'Check: multiply by $b$ to get from one row to the next.'];
        solution = [
          { text: 'Read the initial value at $x = 0$.', tex: `a = ${numStr(a)}` },
          { text: 'Divide consecutive outputs.', tex: `\\frac{${numStr(yAt(a, b, 1))}}{${numStr(a)}} = \\frac{${numStr(yAt(a, b, 2))}}{${numStr(yAt(a, b, 1))}} = ${dTex(b)}`, why: 'In an exponential function, each output is the previous output times the same factor $b$.' },
          { text: 'Write the equation.', tex: expTex(a, b) },
        ];
      } else {
        tags.push('graph');
        const ys = [0, 1, 2, 3].map((x) => yAt(a, b, x).toNumber());
        const top = Math.max(...ys.slice(0, b.gt(1) ? 3 : 1), ...ys);
        const yStep = top > 400 ? 100 : top > 160 ? 50 : top > 80 ? 20 : top > 32 ? 10 : top > 16 ? 4 : 2;
        const yMax = Math.ceil((b.gt(1) ? ys[2] : ys[0]) * 1.25 / yStep) * yStep;
        const pts = [0, 1, 2].map((x) => ({ x, y: ys[x], label: `(${x}, ${commas(yAt(a, b, x)).replace(/\{,\}/g, ',')})` }));
        prompt = [
          p('The graph shows an exponential function through the labeled points. Write its equation in the form $y = a(b)^{x}$.'),
          { t: 'graph', spec: { xMin: -1, xMax: 4, yMin: 0, yMax, yStep, functions: [{ expr: `${numStr(a)}*(${numStr(b)})^x` }], points: pts, ariaLabel: `An exponential curve through ${pts.map((q) => q.label).join(', ')}.` } },
        ];
        hints = ['The $y$-intercept, where $x = 0$, is $a$.', 'Divide the $y$-value at $x = 1$ by the $y$-value at $x = 0$.', 'That ratio is $b$. Check it with the next point.', b.gt(1) ? 'The graph rises, so $b > 1$.' : 'The graph falls, so $0 < b < 1$.'];
        solution = [
          { text: 'Read the $y$-intercept.', tex: `a = ${numStr(a)}`, why: 'At $x = 0$, $b^{0} = 1$, so $y = a$.' },
          { text: 'Divide consecutive $y$-values.', tex: `b = \\frac{${numStr(yAt(a, b, 1))}}{${numStr(a)}} = ${dTex(b)}` },
          { text: 'Write the equation.', tex: expTex(a, b) },
        ];
      }
    } else {
      tags.push('multi-step');
      const gap = rng.pick([1, 2, 2]);
      const bChoices = gap === 2 ? ['2', '3', '0.5', '1.5'] : ['2', '3', '0.5', '1.5', '4', '0.25'];
      b = Q(rng.pick(bChoices));
      const x1 = rng.int(1, 2);
      const x2 = x1 + gap;
      const den = Number(b.den);
      const num = Number(b.num);
      a = Q(rng.pick([2, 3, 5]) * den ** x2);
      void num;
      const y1 = yAt(a, b, x1);
      const y2 = yAt(a, b, x2);
      prompt = [p(`An exponential function $y = a(b)^{x}$ passes through the points $(${x1}, ${numStr(y1)})$ and $(${x2}, ${numStr(y2)})$. Write its equation.`)];
      const ratio = y2.div(y1);
      hints = ['Neither point has $x = 0$, so $a$ is not one of the $y$-values.', `Divide the $y$-values: $\\frac{${numStr(y2)}}{${numStr(y1)}}$. Going from $x = ${x1}$ to $x = ${x2}$ multiplies by $b$ ${gap === 1 ? 'once' : 'twice'}.`, gap === 2 ? `So $b^{2}$ equals that ratio. Take the positive square root.` : 'So $b$ equals that ratio.', `Then work backward from $(${x1}, ${numStr(y1)})$, dividing by $b$ ${x1 === 1 ? 'once' : 'twice'} to reach $x = 0$.`];
      solution = [
        { text: 'Divide the outputs.', tex: `${gap === 1 ? 'b' : `b^{${gap}}`} = \\frac{${numStr(y2)}}{${numStr(y1)}} = ${dTex(ratio)}`, why: `From $x = ${x1}$ to $x = ${x2}$ the output is multiplied by $b$ ${gap === 1 ? 'once' : 'twice'}.` },
        ...(gap === 2 ? [{ text: 'Take the positive square root.', tex: `b = ${dTex(b)}`, why: 'The base of an exponential model must be positive.' }] : []),
        { text: `Find $a$ from $(${x1}, ${numStr(y1)})$.`, tex: `${numStr(y1)} = a\\left(${dTex(b)}\\right)^{${x1}} \\Rightarrow a = ${numStr(a)}`, why: `Dividing by $${x1 === 1 ? 'b' : `b^{${x1}}`}$ undoes the change from $x = 0$ to $x = ${x1}$.` },
        { text: 'Write the equation.', tex: expTex(a, b) },
      ];
      steps = [
        { prompt: [p(`Find $b$ for the exponential function through $(${x1}, ${numStr(y1)})$ and $(${x2}, ${numStr(y2)})$.`)], answer: numSpec(b), hints: [hints[1], hints[2], 'The base must be positive.', 'Check: multiply the first $y$-value by $b$ the right number of times.'], explanation: `$b = ${dTex(b)}$.`, misconceptions: numberMisconceptions(b, [{ value: gap === 2 ? ratio : null, tag: 'growth-decay', feedback: 'The $x$-values are 2 apart, so the ratio is $b^{2}$. Take the square root.' }, { value: y2.sub(y1).div(gap), tag: 'growth-decay', feedback: 'That is a slope. Exponential functions multiply, so divide the outputs.' }]) },
        { prompt: [p('Now find $a$, the value at $x = 0$.')], answer: numSpec(a), hints: [`Start from $(${x1}, ${numStr(y1)})$.`, `Divide by $b$ for each step back to $x = 0$.`, `$a = ${numStr(y1)} \\div \\left(${dTex(b)}\\right)^{${x1}}$.`, 'Check with the other point.'], explanation: `$a = ${numStr(a)}$.`, misconceptions: numberMisconceptions(a, [{ value: y1, tag: 'growth-decay', feedback: `That is the value at $x = ${x1}$, not $x = 0$.` }]) },
        { prompt: [p('Write the equation.')], answer: { kind: 'equation', value: expPlain(a, b), form: 'exponential' }, hints: ['Use $y = a(b)^{x}$.', 'Substitute the $a$ you found.', 'Substitute the $b$ you found.', 'Keep $x$ as the exponent.'], explanation: `$${expTex(a, b)}$.` },
      ];
    }
    const key = expPlain(a, b);
    const mis: Misconception[] = [];
    const add = (s: string, tag: MisconceptionTag, feedback: string) => {
      try {
        const r = checkAnswer({ kind: 'equation', value: key }, s);
        if (r.status === 'incorrect' && !mis.some((m) => m.answer === s)) mis.push({ answer: s, tag, feedback });
      } catch {
        /* skip */
      }
    };
    add(`y = ${numStr(b)}(${numStr(a)})^x`, 'growth-decay', 'The starting amount goes in front, and the factor is the base raised to the power $x$.');
    add(`y = ${numStr(a)} + ${numStr(a.mul(b).sub(a))}x`, 'growth-decay', 'That adds the same amount each step, which is linear. This situation multiplies by the same factor each step, so it is exponential.');
    if (difficulty === 3) add(`y = ${numStr(yAt(a, b, Number(/\((\d)/.exec(textOf({ prompt: prompt! }))?.[1] ?? 1)))}(${numStr(b)})^x`, 'growth-decay', 'The first point given is not at $x = 0$, so its $y$-value is not $a$.');
    return makeProblem({
      skillId: 'S5.03',
      tags,
      prompt: prompt!,
      answer: { kind: 'equation', value: key, form: 'exponential' },
      inputHint: 'Type an equation like y = 50(2)^x or y = 80(0.5)^x.',
      hints: hints!,
      solution: solution!,
      misconceptions: mis,
      ...(steps ? { steps } : {}),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'equation') return ['unexpected kind'];
    const rel = parseRelation(pr.answer.value);
    const rhs = rel.rhs;
    const yOf = (x: number) => {
      const sub = (n: typeof rhs): typeof rhs => (n.type === 'var' ? { type: 'num', value: Q(x), text: String(x) } : n.type === 'num' ? n : n.type === 'neg' || n.type === 'func' ? { ...n, arg: sub(n.arg) } : n.type === 'pow' ? { ...n, base: sub(n.base), exp: sub(n.exp) } : { ...n, left: sub(n.left), right: sub(n.right) });
      return exactRational(sub(rhs))!;
    };
    const pts: Array<[number, Rational]> = [];
    const table = pr.prompt.find((b) => b.t === 'table');
    const graph = graphOf(pr);
    const text = textOf(pr);
    if (table && table.t === 'table') for (const r of table.rows) pts.push([Number(r[0]), Q(r[1].replace(/\{,\}/g, ''))]);
    else if (graph) for (const q of graph.points ?? []) pts.push([q.x, Q(q.label!.replace(/^\(\d+, /, '').replace(/[),]/g, ''))]);
    else {
      const m = [...text.matchAll(/\((\d+), (\d+(?:\.\d+)?)\)/g)];
      if (m.length >= 2) for (const x of m) pts.push([Number(x[1]), Q(x[2])]);
      else {
        const a = /\$(\d+)\$/.exec(text);
        const w = WORD_B.find((o) => text.includes(o.phrase));
        if (!a || !w) return ['cannot read story'];
        pts.push([0, Q(a[1])], [1, Q(a[1]).mul(w.b)], [2, Q(a[1]).mul(w.b).mul(w.b)]);
      }
    }
    const errs: string[] = [];
    for (const [x, y] of pts) if (!yOf(x).eq(y)) errs.push(`(${x}, ${y.toString()}) not on the key`);
    if (graph) for (const q of graph.points ?? []) if (Math.abs(q.y - yOf(q.x).toNumber()) > 1e-9) errs.push('graph point off the curve');
    if (pts.length < 2) errs.push('not enough data');
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S5.05: exponential constraints, viable and nonviable values
// ---------------------------------------------------------------------------

const YES = 'Yes, the model reaches that value at some time after it starts.';
const NEVER_NONPOS = 'No. A positive number times powers of a positive number is always positive, so it can never be 0 or negative.';
const NEVER_BELOW = (a: string) => `No. After it starts, a growth model never goes below its starting value, $${a}$.`;
const NEVER_ABOVE = (a: string) => `No. After it starts, a decay model never goes above its starting value, $${a}$.`;

export const genExponentialConstraints: GeneratorDef = {
  id: 'u5.exponential-constraints',
  skillId: 'S5.05',
  description: 'Decide whether values and data points are viable under an exponential model.',
  generate(rng, difficulty) {
    const c = context(rng);
    const a = Q(c.a);
    const b = Q(c.b);
    const growth = b.gt(1);
    const fx = `${c.fn}(${c.v}) = ${c.a}\\left(${dTex(b)}\\right)^{${c.v}}`;
    if (difficulty <= 2) {
      let V: Rational;
      let correct: string;
      if (difficulty === 1) {
        const yes = rng.int(0, 2) === 0;
        V = yes ? (growth ? a.mul(rng.pick([2, 3, 4])) : a.div(rng.pick([2, 4, 5]))) : rng.bool() ? Q(0) : Q(-rng.pick([10, 50, 100, 5]));
        correct = yes ? YES : NEVER_NONPOS;
      } else {
        const kind = rng.int(0, 2);
        if (kind === 0) {
          // possible
          V = growth ? a.mul(rng.pick([2, 3, 5])) : a.div(rng.pick([2, 4, 5]));
          correct = YES;
        } else if (kind === 1) {
          V = growth ? a.mul(rng.pick(['0.5', '0.75', '0.9'])) : a.mul(rng.pick(['1.5', '2', '1.25']));
          correct = growth ? NEVER_BELOW(String(c.a)) : NEVER_ABOVE(String(c.a));
        } else {
          V = rng.bool() ? Q(0) : Q(-rng.pick([10, 50, 100]));
          correct = NEVER_NONPOS;
        }
      }
      const third = V.le(0) ? 'No. It can never reach 0, but it can be negative.' : growth ? NEVER_BELOW(String(c.a)) : NEVER_ABOVE(String(c.a));
      const others = [YES, NEVER_NONPOS, third, 'Yes, because an exponential model can take any value.'];
      const story = c.what.replace(/\$t\$/, '$t$');
      return makeProblem({
        skillId: 'S5.05',
        tags: ['real-world'],
        prompt: [p(`The function below models ${story} (with $${c.v} \\ge 0$).`), { t: 'math', tex: fx }, p(`Could the ${c.unitNoun} ever be $${commas(V)}$ according to this model?`)],
        answer: makeChoice(rng, correct, others.filter((o) => o !== correct).slice(0, 3)),
        hints: [`What is $${c.fn}(0)$?`, growth ? `With $b > 1$, the values get bigger as $${c.v}$ increases.` : `With $0 < b < 1$, the values get smaller as $${c.v}$ increases, but they never reach 0.`, `Is $a(b)^{${c.v}}$ ever 0 or negative when $a > 0$ and $b > 0$?`, 'Compare the value in the question with the starting value and with 0.'],
        solution: [
          { text: 'Find the starting value.', tex: `${c.fn}(0) = ${c.a}`, why: 'Any nonzero number to the zero power is 1.' },
          { text: growth ? 'Growth: after it starts, the values are all at least the starting value.' : 'Decay: after it starts, the values are at most the starting value and always above 0.', why: growth ? 'Each step multiplies by a factor greater than 1, so the value only goes up, and a positive number times a positive factor stays positive.' : 'Each step multiplies by a factor between 0 and 1, so the value only goes down, but a positive number times a positive factor stays positive.' },
          { text: correct.replace(/^No\. |^Yes, /, (m) => (m.startsWith('No') ? 'Not viable: ' : 'Viable: ')) },
        ],
        misconceptions: [],
      });
    }
    // difficulty 3: whole-number outputs, or does a table fit an exponential model
    if (rng.bool()) {
      const base = rng.pick([2, 3]);
      const a0 = rng.pick([50, 100, 25, 40, 60, 10]);
      const n = rng.int(2, base === 2 ? 6 : 4);
      const good = Q(a0 * base ** n);
      const isPow = (v: Rational) => {
        for (let k = 0; k <= 20; k++) if (Q(a0).mul(Q(base).pow(k)).eq(v)) return true;
        return false;
      };
      const cands = [good.add(a0), Q(a0 * base * n), good.sub(Q(a0 * base)), Q(a0).mul(base ** n + base ** (n - 1)), Q(a0 * (n + 1) * base), good.add(Q(a0 * base))];
      const wrongs: string[] = [];
      for (const v of cands) {
        const s = `$${commas(v)}$`;
        if (v.gt(0) && v.isInteger() && !isPow(v) && !wrongs.includes(s)) wrongs.push(s);
      }
      return makeProblem({
        skillId: 'S5.05',
        tags: ['real-world'],
        prompt: [p(`A biologist models the number of cells in a sample with $C(h) = ${a0}\\left(${base}\\right)^{h}$, where $h$ is the number of whole hours since the start. The cells are counted only on the hour. Which count is possible under this model?`)],
        answer: makeChoice(rng, `$${commas(good)}$`, wrongs.slice(0, 3)),
        hints: ['$h$ must be a whole number: 0, 1, 2, 3, ...', `List the outputs: $C(0) = ${a0}$, then multiply by ${base} each hour.`, `A possible count is $${a0}$ times a power of ${base}.`, `Divide each option by $${a0}$ and see whether you get a power of ${base}.`],
        solution: [
          { text: 'List the outputs for whole-number inputs.', tex: [0, 1, 2, 3, 4, 5, 6].slice(0, n + 2).map((h) => `C(${h}) = ${commas(Q(a0 * base ** h))}`).join(',\\ '), why: 'The count only exists at whole hours, so only these outputs are viable.' },
          { text: `Only $${commas(good)}$ is on the list.`, tex: `${commas(good)} = ${a0} \\cdot ${base}^{${n}}`, why: 'The other numbers are not $' + a0 + '$ times a power of ' + base + ', so they are not viable.' },
        ],
        misconceptions: [],
      });
    }
    const kind = rng.pick(['exp', 'exp', 'linear', 'neither'] as const);
    const a0 = rng.pick([2, 3, 4, 5, 6, 8, 10]);
    const r0 = rng.pick([2, 3]);
    let ys: number[];
    if (kind === 'exp') ys = [0, 1, 2, 3].map((x) => a0 * r0 ** x);
    else if (kind === 'linear') {
      const d = rng.pick([3, 4, 5, 6, 8]);
      ys = [0, 1, 2, 3].map((x) => a0 + d * x);
    } else ys = [a0, a0 * r0, a0 * r0 * r0 + rng.pick([1, 2, -1]), a0 * r0 ** 3];
    if (rng.bool()) ys.reverse();
    const ratios = ys.slice(1).map((y, i) => Q(y, ys[i]));
    const constant = ratios.every((r) => r.eq(ratios[0]));
    const correct = constant ? `Yes. The ratio of consecutive outputs is always $${dTex(ratios[0])}$, so $y = ${ys[0]}(${dTex(ratios[0])})^{x}$ fits.` : 'No. The ratios of consecutive outputs are not all the same, so no exponential model fits exactly.';
    const distract = constant
      ? ['No. The differences between outputs are not constant, so it cannot be exponential.', `Yes. The difference between outputs is always $${ys[1] - ys[0]}$.`, 'No. Exponential data must decrease.']
      : [`Yes. The outputs change in the same direction every time, so $y = ${ys[0]}(${dTex(ratios[0])})^{x}$ fits.`, 'Yes. Any data that always increases or always decreases can be modeled exactly by an exponential function.', 'No. Exponential data must decrease.'];
    return makeProblem({
      skillId: 'S5.05',
      tags: [],
      prompt: [p('A student says an exponential model $y = a(b)^{x}$ fits this data exactly. Is that possible?'), { t: 'table', headers: ['$x$', '$y$'], rows: ys.map((y, x) => [String(x), String(y)]) }],
      answer: makeChoice(rng, correct, distract),
      hints: ['Exponential data has a constant ratio: each output is the one before it times $b$.', 'Divide each $y$-value by the one before it.', `$\\frac{${ys[1]}}{${ys[0]}}$, $\\frac{${ys[2]}}{${ys[1]}}$, $\\frac{${ys[3]}}{${ys[2]}}$`, 'If every ratio is the same, an exponential model fits.'],
      solution: [
        { text: 'Find the ratios of consecutive outputs.', tex: ratios.map((r, i) => `\\frac{${ys[i + 1]}}{${ys[i]}} = ${dTex(r)}`).join(',\\quad '), why: 'An exponential function multiplies by the same factor $b$ for each step of 1 in $x$.' },
        { text: constant ? 'The ratios match, so an exponential model fits.' : 'The ratios do not all match, so an exponential model is not viable.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const label = choiceLabel(pr.answer);
    const text = textOf(pr);
    const table = pr.prompt.find((b) => b.t === 'table');
    if (table && table.t === 'table') {
      const ys = table.rows.map((r) => Q(r[1]));
      const ratios = ys.slice(1).map((y, i) => y.div(ys[i]));
      const constant = ratios.every((r) => r.eq(ratios[0]));
      return label.startsWith(constant ? 'Yes. The ratio' : 'No. The ratios') ? [] : ['table judgement wrong'];
    }
    const cm = /C\(h\) = (\d+)\\left\((\d)\\right\)/.exec(text);
    if (cm) {
      const a0 = Q(cm[1]);
      const base = Q(cm[2]);
      const ok = (s: string) => {
        const v = Q(s.replace(/[${},]/g, ''));
        for (let k = 0; k <= 30; k++) if (a0.mul(base.pow(k)).eq(v)) return true;
        return false;
      };
      const good = pr.answer.options.filter((o) => ok(o.label));
      return good.length === 1 && good[0].id === pr.answer.correct ? [] : ['whole-hour options wrong'];
    }
    const md = readModel(mathBlocks(pr)[0]);
    const vm = /ever be \$(-?[\d{},.]+)\$/.exec(text);
    if (!md || !vm) return ['cannot read'];
    const V = Q(vm[1].replace(/\{,\}/g, ''));
    const { a, b } = md;
    let want: string;
    if (V.le(0)) want = NEVER_NONPOS;
    else if (b.gt(1) ? V.lt(a) : V.gt(a)) want = b.gt(1) ? NEVER_BELOW(numStr(a)) : NEVER_ABOVE(numStr(a));
    else want = YES;
    return label === want ? [] : [`expected ${want}`];
  },
};

// ---------------------------------------------------------------------------
// S5.06: percent growth and decay
// ---------------------------------------------------------------------------

const PCT_STORIES = [
  { who: 'The population of a town is', unit: 'people', grow: true, round: 0, per: 'year', subj: 'The population', ask: 'What will the population be' },
  { who: 'A city has', unit: 'electric cars registered', grow: true, round: 0, per: 'year', subj: 'The number of electric cars', ask: 'How many electric cars will be registered' },
  { who: 'A new phone costs', unit: 'dollars', grow: false, round: 2, per: 'year', subj: 'Its value', ask: 'What will the phone be worth' },
  { who: 'A lake contains', unit: 'fish', grow: false, round: 0, per: 'year', subj: 'The number of fish', ask: 'How many fish will be in the lake' },
  { who: 'A house is worth', unit: 'dollars', grow: true, round: 2, per: 'year', subj: 'Its value', ask: 'What will the house be worth' },
  { who: 'A company has', unit: 'employees', grow: true, round: 0, per: 'year', subj: 'The number of employees', ask: 'How many employees will the company have' },
];

export const genPercentChange: GeneratorDef = {
  id: 'u5.percent-change',
  skillId: 'S5.06',
  description: 'Model percent growth and decay, find values after several periods and total percent change.',
  generate(rng, difficulty) {
    if (difficulty === 3) {
      if (rng.bool()) {
        const r = Q(rng.pick([5, 10, 20, 25, 30, 40, 50]), 100);
        const word = rng.pick(['the price of a jacket', 'the number of subscribers to a channel', 'the value of a stock']);
        const upFirst = rng.bool();
        const net = Q(1).add(r).mul(Q(1).sub(r));
        const drop = Q(1).sub(net).mul(100);
        return makeProblem({
          skillId: 'S5.06',
          tags: ['real-world', 'multi-step'],
          prompt: [p(`First, ${word} ${upFirst ? 'increases' : 'decreases'} by ${pct(r)}%. Then it ${upFirst ? 'decreases' : 'increases'} by ${pct(r)}%. Overall, by what percent did it decrease from where it started?`)],
          answer: numSpec(drop, '%'),
          inputHint: 'Type the percent as a number, like 4 for 4%.',
          hints: ['Each percent change multiplies by a factor.', upFirst ? `The factors are $${dTex(Q(1).add(r))}$ and then $${dTex(Q(1).sub(r))}$.` : `The factors are $${dTex(Q(1).sub(r))}$ and then $${dTex(Q(1).add(r))}$.`, 'Multiply the two factors to get the overall factor.', 'Compare the overall factor with 1 to find the percent lost.'],
          solution: [
            { text: 'Write each change as a factor.', tex: `${upFirst ? `${dTex(Q(1).add(r))} \\cdot ${dTex(Q(1).sub(r))}` : `${dTex(Q(1).sub(r))} \\cdot ${dTex(Q(1).add(r))}`} = ${dTex(net)}`, why: 'The second percent is taken of the new amount, not the original amount, so the changes do not cancel.' },
            { text: 'Find the percent decrease.', tex: `1 - ${dTex(net)} = ${dTex(Q(1).sub(net))} = ${dTex(drop)}\\%` },
          ],
          misconceptions: numberMisconceptions(drop, [{ value: Q(0), tag: 'percent-rate', feedback: `The ${pct(r)}% decrease and the ${pct(r)}% increase are percents of different amounts, so they do not cancel.` }, { value: r.mul(100), tag: 'percent-rate', feedback: 'Multiply the two factors to see the overall change.' }]),
        });
      }
      const r = Q(rng.pick([5, 10, 20, 8, 4, 15]), 100);
      const n = rng.int(2, 4);
      const total = Q(1).add(r).pow(n).sub(1).mul(100);
      const roundNeeded = !total.isTerminatingDecimal() || total.mul(100).den !== 1n;
      return makeProblem({
        skillId: 'S5.06',
        tags: ['real-world', 'multi-step'],
        prompt: [p(`A savings balance grows by ${pct(r)}% each year, and no money is added or taken out. By what total percent does the balance grow over ${n} years?${roundNeeded ? ' Round to the nearest hundredth of a percent.' : ''}`)],
        answer: numSpec(total, '%', roundNeeded ? 2 : undefined),
        inputHint: 'Type the percent as a number, like 21 for 21%.',
        hints: ['Each year multiplies the balance by $1 + r$.', `Over ${n} years the factor is $\\left(${dTex(Q(1).add(r))}\\right)^{${n}}$.`, 'Subtract 1 from that factor to get the total growth as a decimal.', 'Multiply by 100 for a percent.'],
        solution: [
          { text: 'Find the factor for all the years.', tex: `\\left(${dTex(Q(1).add(r))}\\right)^{${n}} = ${dTex(Q(1).add(r).pow(n))}`, why: 'Each year the growth is a percent of a bigger balance, so the growth compounds.' },
          { text: 'Subtract 1 and write as a percent.', tex: `${dTex(Q(1).add(r).pow(n))} - 1 = ${dTex(total.div(100))} \\to ${roundNeeded ? fixedPlaces(total, 2) : dTex(total)}\\%` },
        ],
        misconceptions: numberMisconceptions(total, [{ value: r.mul(100 * n), tag: 'percent-rate', feedback: `The growth is not just ${n} times ${pct(r)}%. Each year earns ${pct(r)}% of a larger amount.` }]),
      });
    }
    const s = rng.pick(PCT_STORIES);
    const r = Q(rng.pick(s.grow ? [2, 3, 4, 5, 6, 8, 10, 12, 15] : [5, 8, 10, 12, 15, 20, 25]), 100);
    const a = Q(s.unit === 'dollars' ? rng.pick(s.grow ? [180000, 250000, 320000] : [800, 1000, 1200, 950]) : rng.pick([1200, 2400, 5000, 8000, 15000, 650, 900]));
    const b = s.grow ? Q(1).add(r) : Q(1).sub(r);
    const aShow = s.unit === 'dollars' ? moneyText(a) : `$${commas(a)}$`;
    const unitText = s.unit === 'dollars' ? '' : ` ${s.unit}`;
    if (difficulty === 1) {
      const key = expPlain(a, b);
      const mis: Misconception[] = [];
      const add = (eq: string, tag: MisconceptionTag, fb: string) => {
        if (checkAnswer({ kind: 'equation', value: key }, eq).status === 'incorrect') mis.push({ answer: eq, tag, feedback: fb });
      };
      add(`y = ${numStr(a)}(${numStr(r)})^x`, 'percent-rate', 'The base is the factor $1 \\pm r$, not the rate itself.');
      add(`y = ${numStr(a)}(${numStr(s.grow ? Q(1).sub(r) : Q(1).add(r))})^x`, 'growth-decay', s.grow ? 'An increase needs a factor greater than 1.' : 'A decrease needs a factor less than 1.');
      const slip = s.grow ? Q(1).add(r.mul(10)) : Q(1).sub(r.mul(10));
      if (slip.gt(0)) add(`y = ${numStr(a)}(${numStr(slip)})^x`, 'percent-rate', `Check the decimal: ${pct(r)}% is $${dTex(r)}$.`);
      return makeProblem({
        skillId: 'S5.06',
        tags: ['real-world', 'word'],
        prompt: [p(`${s.who} ${aShow}${unitText}. ${s.subj} ${s.grow ? 'increases' : 'decreases'} by ${pct(r)}% each ${s.per}. Write an equation for $y$, the ${s.unit === 'dollars' ? 'value in dollars' : `number of ${s.unit.split(' ')[0]}`}, after $x$ ${s.per}s.`)],
        answer: { kind: 'equation', value: key, form: 'exponential' },
        inputHint: 'Type an equation like y = 500(1.04)^x.',
        hints: ['Use $y = a(b)^{x}$.', '$a$ is the starting amount.', s.grow ? 'For growth, $b = 1 + r$.' : 'For decay, $b = 1 - r$.', `Write ${pct(r)}% as a decimal first.`],
        solution: [
          { text: 'Starting amount.', tex: `a = ${numStr(a)}` },
          { text: 'Growth or decay factor.', tex: `b = ${s.grow ? `1 + ${dTex(r)}` : `1 - ${dTex(r)}`} = ${dTex(b)}`, why: s.grow ? 'Each year you keep all of it and add the percent.' : 'Each year you keep what is left after the percent is lost.' },
          { text: 'Write the model.', tex: expTex(a, b) },
        ],
        misconceptions: mis,
      });
    }
    const t = rng.int(3, 10);
    const value = a.mul(b.pow(t));
    const places = s.round;
    const linear = a.mul(s.grow ? Q(1).add(r.mul(t)) : Q(1).sub(r.mul(t)));
    return makeProblem({
      skillId: 'S5.06',
      tags: ['real-world'],
      prompt: [p(`${s.who} ${aShow}${unitText}. ${s.subj} ${s.grow ? 'increases' : 'decreases'} by ${pct(r)}% each ${s.per}. ${s.ask} after ${t} ${s.per}s? ${places === 2 ? 'Round to the nearest cent.' : 'Round to the nearest whole number.'}`)],
      answer: numSpec(value, s.unit === 'dollars' ? 'dollars' : undefined, places),
      inputHint: places === 2 ? 'Type an amount like 1234.56.' : 'Type a whole number.',
      hints: ['Write the model $y = a(b)^{x}$ first.', `$a = ${numStr(a)}$ and $b = ${s.grow ? `1 + ${dTex(r)}` : `1 - ${dTex(r)}`}$.`, `Substitute $x = ${t}$ and use a calculator: raise the factor to the power first, then multiply.`, 'Round only at the very end.'],
      solution: [
        { text: 'Write the model.', tex: expTex(a, b) },
        { text: `Substitute $x = ${t}$.`, tex: `y = ${numStr(a)}\\left(${dTex(b)}\\right)^{${t}} \\approx ${places === 2 ? fixedPlaces(value, 2) : commas(value.round(0))}`, why: 'Exponents come before multiplication in the order of operations.' },
      ],
      misconceptions: numberMisconceptions(value.round(places), [{ value: linear.round(places), tag: 'percent-rate', feedback: `Taking ${pct(r)}% of the starting amount each ${s.per} is linear. The percent applies to the new amount each ${s.per}.` }, { value: a.mul(b).mul(t).round(places), tag: 'order-of-operations', feedback: 'Raise the factor to the power; do not multiply by the number of years.' }]),
    });
  },
  verify(pr) {
    const text = textOf(pr);
    if (/First, /.test(text)) {
      const m = /by (\d+)%/.exec(text)!;
      const r = Q(m[1]).div(100);
      const want = Q(1).sub(Q(1).add(r).mul(Q(1).sub(r))).mul(100);
      return pr.answer.kind === 'number' && Q(pr.answer.value).eq(want) ? [] : ['net change wrong'];
    }
    if (/total percent/.test(text)) {
      const m = /grows by ([\d.]+)% each year.*over (\d) years/.exec(text)!;
      const want = Q(1).add(Q(m[1]).div(100)).pow(Number(m[2])).sub(1).mul(100);
      return pr.answer.kind === 'number' && Q(pr.answer.value).eq(want) ? [] : ['total growth wrong'];
    }
    const m = /(?:is|has|costs|contains|worth) (?:\\\$)?\$?([\d{},]+)\$?[^.]*\. [A-Z][\w ]*? (increases|decreases) by ([\d.]+)%/.exec(text);
    if (!m) return ['cannot read story'];
    const a = Q(m[1].replace(/\{,\}|,/g, ''));
    const r = Q(m[3]).div(100);
    const b = m[2] === 'increases' ? Q(1).add(r) : Q(1).sub(r);
    if (pr.answer.kind === 'equation') return checkAnswer(pr.answer, expPlain(a, b)).status === 'correct' ? [] : ['equation wrong'];
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    const t = Number(/after (\d+) /.exec(text)![1]);
    return Q(pr.answer.value).eq(a.mul(b.pow(t))) ? [] : ['value wrong'];
  },
};

// ---------------------------------------------------------------------------
// S5.06: compound interest A = P(1 + r/n)^(nt)
// ---------------------------------------------------------------------------

const COMPOUND: Array<{ n: number; word: string }> = [
  { n: 1, word: 'annually' },
  { n: 2, word: 'semiannually' },
  { n: 4, word: 'quarterly' },
  { n: 12, word: 'monthly' },
];

function amount(P: Rational, r: Rational, n: number, t: number): Rational {
  return P.mul(Q(1).add(r.div(n)).pow(n * t));
}

export const genCompoundInterest: GeneratorDef = {
  id: 'u5.compound-interest',
  skillId: 'S5.06',
  description: 'Use the compound interest formula A = P(1 + r/n)^(nt).',
  generate(rng, difficulty) {
    const P = Q(rng.pick([500, 800, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000]));
    const r = Q(rng.pick(['0.02', '0.025', '0.03', '0.035', '0.04', '0.045', '0.05', '0.06']));
    const t = rng.int(2, 10);
    const name = rng.pick(['Maya', 'Jordan', 'Luis', 'Priya', 'Sam', 'Aaliyah', 'Chris', 'Kenji']);
    const formula = 'A = P\\left(1 + \\frac{r}{n}\\right)^{nt}';
    if (difficulty === 3 && rng.bool()) {
      // compare two accounts
      let o1 = rng.pick(COMPOUND);
      let o2 = rng.pick(COMPOUND);
      let r1 = r;
      let r2 = r.add(rng.pick(['0.005', '-0.005', '0.0025', '-0.0025']));
      for (let guard = 0; guard < 50 && amount(P, r1, o1.n, t).sub(amount(P, r2, o2.n, t)).abs().lt(1); guard++) {
        o1 = rng.pick(COMPOUND);
        o2 = rng.pick(COMPOUND);
        r2 = r.add(rng.pick(['0.005', '-0.005', '0.0025', '-0.0025']));
      }
      if (amount(P, r1, o1.n, t).sub(amount(P, r2, o2.n, t)).abs().lt(1)) r1 = r.add('0.01');
      const A1 = amount(P, r1, o1.n, t);
      const A2 = amount(P, r2, o2.n, t);
      const correct = A1.gt(A2) ? 'Account A' : 'Account B';
      return makeProblem({
        skillId: 'S5.06',
        tags: ['real-world', 'multi-step'],
        prompt: [p(`${name} has ${moneyText(P)} to deposit for ${t} years. Account A pays ${pct(r1)}% interest compounded ${o1.word}. Account B pays ${pct(r2)}% interest compounded ${o2.word}. Which account will have more money after ${t} years?`), { t: 'math', tex: formula }],
        answer: makeChoice(rng, correct, [correct === 'Account A' ? 'Account B' : 'Account A', 'They end with the same amount']),
        hints: ['Use the formula for each account.', 'Write each rate as a decimal and match $n$ to the compounding: annually 1, semiannually 2, quarterly 4, monthly 12.', 'Compute both amounts with a calculator, rounding only at the end.', 'Compare the two amounts.'],
        solution: [
          { text: 'Account A.', tex: `A = ${numStr(P)}\\left(1 + \\frac{${dTex(r1)}}{${o1.n}}\\right)^{${o1.n}(${t})} \\approx ${fixedPlaces(A1, 2)}` },
          { text: 'Account B.', tex: `A = ${numStr(P)}\\left(1 + \\frac{${dTex(r2)}}{${o2.n}}\\right)^{${o2.n}(${t})} \\approx ${fixedPlaces(A2, 2)}`, why: 'A higher rate and more frequent compounding both help, so you have to compute to see which matters more here.' },
          { text: `${correct} ends with more.` },
        ],
        misconceptions: [],
      });
    }
    const o = difficulty === 1 ? COMPOUND[0] : rng.pick(COMPOUND.slice(1));
    const A = amount(P, r, o.n, t);
    const earned = difficulty === 3;
    const value = earned ? A.sub(P) : A;
    const simple = P.mul(Q(1).add(r.mul(t)));
    const mis: Mis[] = [
      { value: (earned ? simple.sub(P) : simple).round(2), tag: 'formula-error', feedback: 'That is simple interest. Compound interest earns interest on the interest too.' },
      { value: o.n === 1 ? null : (earned ? amount(P, r, 1, t).sub(P) : amount(P, r, 1, t)).round(2), tag: 'formula-error', feedback: `The interest is compounded ${o.word}, so use $n = ${o.n}$.` },
      { value: o.n === 1 ? null : (earned ? P.mul(Q(1).add(r.div(o.n)).pow(t)).sub(P) : P.mul(Q(1).add(r.div(o.n)).pow(t))).round(2), tag: 'formula-error', feedback: 'The exponent is $nt$, the total number of times interest is added.' },
      { value: earned ? A.round(2) : A.sub(P).round(2), tag: 'other', feedback: earned ? 'That is the total in the account. The interest earned is the amount minus the deposit.' : 'That is only the interest. The question asks for the total in the account.' },
    ];
    return makeProblem({
      skillId: 'S5.06',
      tags: ['real-world'],
      prompt: [p(`${name} deposits ${moneyText(P)} in an account that pays ${pct(r)}% interest compounded ${o.word}. No other money is added or taken out. ${earned ? `How much interest will the account earn in ${t} years?` : `How much will be in the account after ${t} years?`} Round to the nearest cent.`), { t: 'math', tex: formula }],
      answer: numSpec(value, 'dollars', 2),
      inputHint: 'Type an amount like 1234.56.',
      hints: [`$P = ${numStr(P)}$, $r = ${dTex(r)}$, $t = ${t}$.`, `Compounded ${o.word} means $n = ${o.n}$.`, `Compute $1 + \\frac{${dTex(r)}}{${o.n}}$, raise it to the power $${o.n} \\cdot ${t} = ${o.n * t}$, then multiply by ${numStr(P)}.`, earned ? 'Subtract the deposit to get the interest. Round only at the end.' : 'Round only at the end.'],
      solution: [
        { text: 'Substitute into the formula.', tex: `A = ${numStr(P)}\\left(1 + \\frac{${dTex(r)}}{${o.n}}\\right)^{${o.n}(${t})}`, why: `$n = ${o.n}$ because interest is added ${o.word}, and $nt = ${o.n * t}$ is the number of times it is added.` },
        { text: 'Evaluate, rounding at the end.', tex: `A \\approx ${fixedPlaces(A, 2)}` },
        ...(earned ? [{ text: 'Subtract the deposit.', tex: `${fixedPlaces(A, 2)} - ${numStr(P)} \\approx ${fixedPlaces(value, 2)}`, why: 'Interest earned is the amount in the account minus the money you put in.' }] : []),
      ],
      misconceptions: numberMisconceptions(value.round(2), mis),
    });
  },
  verify(pr) {
    const text = textOf(pr);
    const accts = [...text.matchAll(/pays ([\d.]+)% interest compounded (\w+)/g)];
    const P = Q(/\\\$([\d,]+)/.exec(text)![1].replace(/,/g, ''));
    const t = Number(/(?:for|in|after) (\d+) years/.exec(text)![1]);
    const nOf = (w: string) => COMPOUND.find((c) => c.word === w)!.n;
    // independent route: repeated multiplication period by period
    const grow = (rate: Rational, n: number) => {
      let A = P;
      for (let k = 0; k < n * t; k++) A = A.add(A.mul(rate).div(n));
      return A;
    };
    if (pr.answer.kind === 'choice') {
      const A1 = grow(Q(accts[0][1]).div(100), nOf(accts[0][2]));
      const A2 = grow(Q(accts[1][1]).div(100), nOf(accts[1][2]));
      return choiceLabel(pr.answer) === (A1.gt(A2) ? 'Account A' : 'Account B') ? [] : ['comparison wrong'];
    }
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    const A = grow(Q(accts[0][1]).div(100), nOf(accts[0][2]));
    const want = /interest will the account earn/.test(text) ? A.sub(P) : A;
    return Q(pr.answer.value).eq(want) ? [] : [`expected ${want.toNumber()}`];
  },
};

export const U5_MODEL_GENERATORS: GeneratorDef[] = [genInterpretExponential, genWriteExponential, genExponentialConstraints, genPercentChange, genCompoundInterest];
