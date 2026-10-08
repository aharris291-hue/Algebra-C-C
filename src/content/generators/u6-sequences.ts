/**
 * Unit 6 generators for sequences and comparing models: linear or exponential (S6.04), geometric
 * sequences (S6.07), geometric sequences as exponential functions (S6.08), comparing linear,
 * quadratic and exponential functions (S6.09) and exponential models in context (S6.10).
 * verify() re-reads the printed numbers and re-derives the answer by a different route:
 * repeated multiplication or addition instead of the closed formulas the generators use.
 */
import type { GeneratorDef, Rng, Block, GraphSpec, Problem } from '../../core/curriculum/types';
import type { Misconception, MisconceptionTag } from '../../core/math/answers';
import { checkAnswer } from '../../core/math/answers';
import { parseExpression } from '../../core/math/parser';
import { evalNumeric } from '../../core/math/evaluate';
import { Rational } from '../../core/math/rational';
import { p, math, makeProblem, makeChoice, choiceLabel, numStr, Q, numberMisconceptions } from './util';
import { moneyText as money } from './u5-models';
import { dTex, commas, pct, texExact } from './u5-common';
import { textAll } from './u6-common';

type Mis = { value: Rational | null; tag: MisconceptionTag; feedback: string };
const exactStr = (v: Rational) => {
  const d = v.isTerminatingDecimal() ? v.toDecimalString(400) : '';
  return d && Rational.parse(d).eq(v) ? d : v.toString();
};
const numSpec = (v: Rational, unit?: string) => ({ kind: 'number' as const, value: exactStr(v), ...(unit ? { unit } : {}) });

/** Term n of a geometric sequence, by repeated multiplication (used by verify). */
function iterGeo(a1: Rational, r: Rational, n: number): Rational {
  let v = a1;
  for (let i = 1; i < n; i++) v = v.mul(r);
  return v;
}
/** Term n by the explicit formula (used by generate). */
const geo = (a1: Rational, r: Rational, n: number) => a1.mul(r.pow(n - 1));
const paren = (r: Rational) => `\\left(${dTex(r)}\\right)`;
const geoTex = (a1: Rational, r: Rational, e = 'n-1') => `${a1.eq(1) ? '' : a1.eq(-1) ? '-' : dTex(a1)}${paren(r)}^{${e}}`;
const geoPlain = (a1: Rational, r: Rational, e = 'n-1') => `${numStr(a1)}*(${numStr(r)})^(${e})`;
const listTex = (ts: Rational[]) => `${ts.map((t) => dTex(t)).join(',\\ ')},\\ \\dots`;
/** Read a listed sequence "3,\ 6,\ 12,\ \dots" back into exact values. */
function readList(tex: string): Rational[] {
  return tex
    .replace(/\\dots/g, '')
    .split(',\\ ')
    .map((t) => t.trim())
    .filter((t) => t.length)
    .map((t) => texExact(t)!);
}
const ratios = (ts: Rational[]) => ts.slice(1).map((t, i) => (ts[i].isZero() ? null : t.div(ts[i])));
const diffs = (ts: Rational[]) => ts.slice(1).map((t, i) => t.sub(ts[i]));
const allEq = (xs: Array<Rational | null>) => xs.every((x) => x !== null && x.eq(xs[0]!));
/** "= 12" for short exact values, otherwise "\approx 656.84". */
const eqv = (v: Rational) => (v.isInteger() || (v.isTerminatingDecimal() && v.mul(100).isInteger()) ? `= ${commas(v)}` : `\\approx ${commas(v.round(2), 2)}`);
const ordinal = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;

/** Keep only expression misconceptions that the checker marks incorrect. */
function exprMis(spec: { kind: 'expression'; value: string; variables: string[] }, list: Misconception[]): Misconception[] {
  return list.filter((m, i) => list.findIndex((o) => o.answer === m.answer) === i && checkAnswer(spec, m.answer).status === 'incorrect');
}

// ---------------------------------------------------------------------------
// S6.04: linear or exponential
// ---------------------------------------------------------------------------

type Pattern = 'linear' | 'exponential' | 'neither';

function patternTable(rng: Rng, kind: Pattern): Rational[] {
  const xs = [0, 1, 2, 3, 4];
  if (kind === 'linear') {
    const m = Q(rng.nonzeroInt(-6, 9));
    const c = Q(rng.int(1, 20));
    return xs.map((x) => c.add(m.mul(x)));
  }
  if (kind === 'exponential') {
    const b = Q(rng.pick(['2', '3', '1/2', '1.5', '2']));
    const a = b.eq(Q(1, 2)) ? Q(rng.pick([32, 48, 64, 80])) : b.eq(Q(3, 2)) ? Q(rng.pick([16, 32, 48])) : Q(rng.int(1, 6));
    return xs.map((x) => a.mul(b.pow(x)));
  }
  // neither: differences grow by a constant (quadratic) but the ratios are not constant
  const c = Q(rng.int(1, 10));
  const s = Q(rng.int(1, 3));
  const t = Q(rng.int(0, 3));
  return xs.map((x) => c.add(t.mul(x)).add(s.mul(x * x)));
}

function classify(ys: Rational[]): Pattern {
  if (allEq(diffs(ys))) return 'linear';
  if (allEq(ratios(ys))) return 'exponential';
  return 'neither';
}

interface Situation { text: string; exp: boolean }
function situations(rng: Rng): Situation[] {
  const n = () => rng.pick([20, 25, 40, 50, 75]);
  const pc = () => rng.pick([3, 5, 8, 10, 15, 20]);
  return [
    { text: `A savings account balance increases by ${money(Q(n()))} each month.`, exp: false },
    { text: `A savings account balance increases by ${pc()}% each month.`, exp: true },
    { text: `The number of people who have heard a rumor doubles every day.`, exp: true },
    { text: `A candle gets ${rng.pick([2, 3, 4])} millimeters shorter every hour.`, exp: false },
    { text: `A car loses ${pc()}% of its value every year.`, exp: true },
    { text: `A tank loses ${rng.pick([3, 5, 8])} gallons of water every minute.`, exp: false },
    { text: `The number of bacteria in a dish triples every hour.`, exp: true },
    { text: `A worker's pay goes up by ${money(Q(rng.pick([1, 2])))} per hour each year.`, exp: false },
    { text: `The amount of a medicine in the blood is cut in half every 4 hours.`, exp: true },
    { text: `A runner adds ${rng.pick([2, 3, 5])} minutes to her run each week.`, exp: false },
  ];
}
const isExpText = (s: string) => /%|doubles|triples|in half/.test(s);

export const genLinearOrExp: GeneratorDef = {
  id: 'u6.linear-or-exp',
  skillId: 'S6.04',
  description: 'Decide whether a table or situation is linear or exponential, using constant differences or constant ratios.',
  generate(rng, difficulty) {
    if (difficulty <= 2) {
      const kind: Pattern = difficulty === 1 ? rng.pick(['linear', 'exponential', 'neither'] as const) : rng.pick(['linear', 'exponential'] as const);
      const ys = patternTable(rng, kind);
      const table: Block = { t: 'table', headers: ['$x$', '$y$'], rows: ys.map((y, i) => [String(i), numStr(y)]) };
      const d = diffs(ys);
      const r = ratios(ys);
      const dRow = `Differences: ${d.map((q) => `$${dTex(q)}$`).join(', ')}.`;
      const rRow = `Ratios: ${r.map((q) => (q ? `$${dTex(q)}$` : 'undefined')).join(', ')}.`;
      if (difficulty === 1) {
        const correct = kind === 'linear' ? 'Linear' : kind === 'exponential' ? 'Exponential' : 'Neither';
        return makeProblem({
          skillId: 'S6.04',
          tags: [],
          prompt: [p('Is the function in the table linear, exponential or neither?'), table],
          answer: makeChoice(rng, correct, ['Linear', 'Exponential', 'Neither'].filter((o) => o !== correct)),
          hints: ['The $x$-values go up by 1 each time, so you can compare neighboring $y$-values.', 'Subtract each $y$-value from the next one. Are the differences all the same?', 'Divide each $y$-value by the one before it. Are the ratios all the same?', 'Constant differences mean linear; constant ratios mean exponential.'],
          solution: [
            { text: 'Find the differences.', why: dRow },
            { text: 'Find the ratios.', why: rRow },
            { text: kind === 'linear' ? 'The differences are constant, so the function is linear.' : kind === 'exponential' ? 'The ratios are constant, so the function is exponential.' : 'Neither the differences nor the ratios are constant, so it is neither linear nor exponential.' },
          ],
          misconceptions: [],
        });
      }
      const key = kind === 'linear' ? d[0] : r[0]!;
      return makeProblem({
        skillId: 'S6.04',
        tags: [],
        prompt: [p('The table shows a function that is either linear or exponential. Decide which. If it is linear, enter the common difference. If it is exponential, enter the common ratio.'), table],
        answer: numSpec(key),
        inputHint: 'Type a number or a fraction.',
        hints: ['Check the differences first: subtract each $y$-value from the next.', 'Then check the ratios: divide each $y$-value by the one before it.', 'Only one of the two will be the same every time.', 'Enter the number that stays the same.'],
        solution: [
          { text: 'Find the differences.', why: dRow },
          { text: 'Find the ratios.', why: rRow },
          { text: kind === 'linear' ? `The differences are all $${dTex(key)}$, so the function is linear with common difference $${dTex(key)}$.` : `The ratios are all $${dTex(key)}$, so the function is exponential with common ratio $${dTex(key)}$.` },
        ],
        misconceptions: numberMisconceptions(key, [
          { value: kind === 'linear' ? r[0] : d[0], tag: 'other', feedback: kind === 'linear' ? 'The ratios are not constant, so the function is not exponential. Look at the differences.' : 'The differences are not constant, so the function is not linear. Look at the ratios.' },
          { value: kind === 'exponential' ? d[1] : null, tag: 'other', feedback: 'The differences change, so the function is not linear. Divide instead of subtracting.' },
          { value: kind === 'exponential' && r[0] && !r[0].isZero() ? r[0].inv() : null, tag: 'other', feedback: 'Divide each $y$-value by the one before it, not the other way around.' },
        ]),
      });
    }
    if (rng.bool()) {
      const all = situations(rng);
      const wantExp = rng.bool();
      const pool = rng.shuffle(all.filter((s) => s.exp === wantExp));
      const others = rng.shuffle(all.filter((s) => s.exp !== wantExp)).slice(0, 3);
      const correct = pool[0].text;
      return makeProblem({
        skillId: 'S6.04',
        tags: ['real-world'],
        prompt: [p(`Which situation is best modeled by ${wantExp ? 'an exponential' : 'a linear'} function?`)],
        answer: makeChoice(rng, correct, others.map((s) => s.text)),
        hints: ['Ask whether the amount changes by adding the same number or by multiplying by the same factor.', 'Adding or subtracting the same amount each time is linear.', 'Changing by the same percent, doubling or halving is multiplying by the same factor.', 'Multiplying by the same factor each time is exponential.'],
        solution: [
          { text: wantExp ? 'An exponential function multiplies by the same factor in each equal time step.' : 'A linear function adds or subtracts the same amount in each equal time step.' },
          { text: correct, why: wantExp ? 'A percent change, doubling, tripling or halving multiplies by the same factor each time.' : 'The same amount is added or taken away each time.' },
        ],
        misconceptions: [],
      });
    }
    // which plan is worth more after n periods
    const S = Q(rng.pick([500, 1000, 2000]));
    const add = S.mul(Q(rng.pick([5, 8, 10]), 100));
    const r = Q(rng.pick([4, 5, 6, 8, 10]), 100);
    const n = rng.int(3, 24);
    const A = S.add(add.mul(n));
    const B = S.mul(r.add(1).pow(n));
    if (B.sub(A).abs().lt(Q(5))) return genLinearOrExp.generate(rng, 3);
    const correct = B.gt(A) ? 'Plan B' : 'Plan A';
    return makeProblem({
      skillId: 'S6.04',
      tags: ['real-world', 'multi-step'],
      prompt: [p(`Two savings plans each start with ${money(S)}. Plan A adds ${money(add)} at the end of every month. Plan B grows by ${pct(r)}% at the end of every month. Which plan has more money after ${n} months?`)],
      answer: makeChoice(rng, correct, [B.gt(A) ? 'Plan A' : 'Plan B', 'They have the same amount']),
      hints: ['Plan A is linear: it adds the same amount each month.', `Plan A after ${n} months: ${money(S)} plus ${n} times ${money(add)}.`, `Plan B is exponential: multiply by $${dTex(r.add(1))}$ each month.`, `Plan B after ${n} months: $${commas(S)}\\left(${dTex(r.add(1))}\\right)^{${n}}$.`],
      solution: [
        { text: 'Plan A adds the same amount each month.', tex: `${commas(S)} + ${commas(add)}(${n}) = ${commas(A)}` },
        { text: 'Plan B multiplies by the same factor each month.', tex: `${commas(S)}\\left(${dTex(r.add(1))}\\right)^{${n}} \\approx ${commas(B.round(2), 2)}`, why: `Growing by ${pct(r)}% means multiplying by $1 + ${dTex(r)} = ${dTex(r.add(1))}$.` },
        { text: `${correct} has more after ${n} months.`, why: 'An exponential plan starts slowly but eventually passes any linear plan.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const table = pr.prompt.find((b) => b.t === 'table');
    if (table && table.t === 'table') {
      const ys = table.rows.map((r) => Q(r[1]));
      // classify again by testing the general linear and exponential models through the first two points
      const isLin = ys.every((y, i) => y.eq(ys[0].add(ys[1].sub(ys[0]).mul(i))));
      const isExp = !ys[0].isZero() && ys.every((y, i) => y.eq(iterGeo(ys[0], ys[1].div(ys[0]), i + 1)));
      if (pr.answer.kind === 'choice') return choiceLabel(pr.answer) === (isLin ? 'Linear' : isExp ? 'Exponential' : 'Neither') ? [] : ['classification wrong'];
      if (pr.answer.kind !== 'number') return ['unexpected kind'];
      if (isLin === isExp) return ['table is not exactly one of linear or exponential'];
      const want = isLin ? ys[1].sub(ys[0]) : ys[1].div(ys[0]);
      return Q(pr.answer.value).eq(want) ? [] : ['constant wrong'];
    }
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const plan = /start with \\\$([\d,]+)\. Plan A adds \\\$([\d,.]+) .* grows by ([\d.]+)% .* after (\d+) months/.exec(text);
    if (plan) {
      const S = Q(plan[1].replace(/,/g, ''));
      const add = Q(plan[2].replace(/,/g, ''));
      const r = Q(plan[3]).div(100);
      const n = Number(plan[4]);
      let a = S;
      let b = S;
      for (let i = 0; i < n; i++) {
        a = a.add(add);
        b = b.add(b.mul(r));
      }
      return choiceLabel(pr.answer) === (b.gt(a) ? 'Plan B' : 'Plan A') ? [] : ['plan comparison wrong'];
    }
    const wantExp = /an exponential/.test(text);
    const good = pr.answer.options.filter((o) => isExpText(o.label) === wantExp);
    return good.length === 1 && good[0].id === pr.answer.correct ? [] : ['situation choice wrong'];
  },
};

// ---------------------------------------------------------------------------
// S6.07: geometric sequences
// ---------------------------------------------------------------------------

function pickGeo(rng: Rng, difficulty: number): { a1: Rational; r: Rational } {
  if (difficulty === 1) return { a1: Q(rng.int(1, 7)), r: Q(rng.pick([2, 3, 4, 5, -2])) };
  const r = Q(rng.pick(['2', '3', '-2', '-3', '1/2', '-1/2', '1/3', '1.5']));
  const den = Number(r.den);
  const a1 = Q(rng.pick([1, 2, 3, 4, 5]) * den ** (r.abs().eq(Q(1, 2)) ? 5 : den === 3 ? 3 : den === 2 ? 4 : 1)).mul(rng.bool() || difficulty < 3 ? 1 : -1);
  return { a1, r };
}

const recLabel = (a1: Rational, rTex: string, rel: string) => `$a_1 = ${dTex(a1)}$ and $a_n = ${rel.replace('R', rTex)}$`;

export const genGeometric: GeneratorDef = {
  id: 'u6.geometric',
  skillId: 'S6.07',
  description: 'Find common ratios, terms, explicit formulas and recursive formulas of geometric sequences.',
  generate(rng, difficulty) {
    const { a1, r } = pickGeo(rng, difficulty);
    const ts = [1, 2, 3, 4].map((n) => geo(a1, r, n));
    const intro: Block[] = [p('Here is a geometric sequence:'), math(listTex(ts))];
    const task = difficulty === 1 ? rng.pick(['ratio', 'next'] as const) : difficulty === 2 ? rng.pick(['formula', 'term'] as const) : rng.pick(['recursive', 'rec2exp', 'which'] as const);
    const rT = dTex(r);
    if (task === 'ratio') {
      return makeProblem({
        skillId: 'S6.07',
        tags: [],
        prompt: [...intro, p('What is the common ratio?')],
        answer: numSpec(r),
        hints: ['In a geometric sequence you multiply by the same number each time.', 'Divide any term by the term before it.', `Try $${dTex(ts[1])} \\div ${dTex(ts[0])}$.`, 'If the signs alternate, the ratio is negative.'],
        solution: [
          { text: 'Divide a term by the one before it.', tex: `\\frac{${dTex(ts[1])}}{${dTex(ts[0])}} = ${rT}`, why: 'The common ratio is the factor that takes one term to the next.' },
          { text: 'Check with the next pair.', tex: `\\frac{${dTex(ts[2])}}{${dTex(ts[1])}} = ${rT}` },
        ],
        misconceptions: numberMisconceptions(r, [
          { value: ts[1].sub(ts[0]), tag: 'other', feedback: 'That is the difference. A geometric sequence multiplies, so divide neighboring terms.' },
          { value: r.inv(), tag: 'other', feedback: 'Divide a term by the term before it, not the other way around.' },
          { value: r.neg(), tag: 'sign-error', feedback: 'Check the sign: do the terms alternate between positive and negative?' },
        ]),
      });
    }
    if (task === 'next') {
      const next = [5, 6, 7].map((n) => geo(a1, r, n));
      return makeProblem({
        skillId: 'S6.07',
        tags: [],
        prompt: [...intro, p('Write the next three terms.')],
        answer: { kind: 'sequence-terms', values: next.map(exactStr) },
        inputHint: 'Type the three terms separated by commas.',
        hints: ['First find the common ratio: divide a term by the one before it.', 'Multiply the last term shown by the ratio to get the next term.', 'Keep multiplying by the ratio.', 'Check the signs if the ratio is negative.'],
        solution: [
          { text: 'Find the common ratio.', tex: `r = \\frac{${dTex(ts[1])}}{${dTex(ts[0])}} = ${rT}` },
          { text: 'Multiply by the ratio three times.', tex: `${dTex(ts[3])} \\cdot ${paren(r)} = ${dTex(next[0])},\\ ${dTex(next[0])} \\cdot ${paren(r)} = ${dTex(next[1])},\\ ${dTex(next[1])} \\cdot ${paren(r)} = ${dTex(next[2])}`, why: 'Each term is the previous term times $r$.' },
        ],
        misconceptions: ([
          { answer: [1, 2, 3].map((i) => numStr(ts[3].add(ts[3].sub(ts[2]).mul(i)))).join(', '), tag: 'other', feedback: 'Those add the same amount each time. A geometric sequence multiplies by the common ratio.' },
        ] as Misconception[]).filter((m) => checkAnswer({ kind: 'sequence-terms', values: next.map(exactStr) }, m.answer).status === 'incorrect'),
      });
    }
    if (task === 'term') {
      const n = rng.int(6, r.abs().eq(2) || r.abs().lt(1) ? 9 : 7);
      const an = geo(a1, r, n);
      return makeProblem({
        skillId: 'S6.07',
        tags: [],
        prompt: [...intro, p(`Find the ${ordinal(n)} term, $a_{${n}}$.`)],
        answer: numSpec(an),
        inputHint: 'Type a number or a fraction.',
        hints: ['Use the explicit formula $a_n = a_1(r)^{n-1}$.', `Here $a_1 = ${dTex(a1)}$ and $r = ${rT}$.`, `From term 1 to term ${n} you multiply by $r$ exactly ${n - 1} times.`, `Compute the power $${paren(r)}^{${n - 1}}$ first, then multiply by $a_1$.`],
        solution: [
          { text: 'Find $a_1$ and $r$.', tex: `a_1 = ${dTex(a1)},\\quad r = ${rT}` },
          { text: 'Substitute into the explicit formula.', tex: `a_{${n}} = ${geoTex(a1, r, String(n - 1))}`, why: `There are ${n - 1} multiplications by $r$ between the 1st and ${ordinal(n)} terms.` },
          { text: 'Evaluate.', tex: `a_{${n}} = ${dTex(a1)} \\cdot ${r.pow(n - 1).toTex()} = ${an.toTex()}` },
        ],
        misconceptions: numberMisconceptions(an, [
          { value: a1.mul(r.pow(n)), tag: 'sequence-index', feedback: `From term 1 to term ${n} there are ${n - 1} multiplications, not ${n}. Use the exponent $n - 1$.` },
          { value: a1.mul(r).pow(n - 1), tag: 'order-of-operations', feedback: 'Only the ratio is raised to the power. Find the power first, then multiply by $a_1$.' },
          { value: a1.add(r.mul(n - 1)), tag: 'other', feedback: 'That adds the ratio each time. A geometric sequence multiplies by it.' },
        ]),
      });
    }
    const spec = { kind: 'expression' as const, value: geoPlain(a1, r), variables: ['n'] };
    const formulaMis = () =>
      exprMis(spec, [
        { answer: geoPlain(a1, r, 'n'), tag: 'sequence-index', feedback: 'Check $n = 1$: your formula should give the first term. Use the exponent $n - 1$.' },
        { answer: `(${numStr(a1.mul(r))})^(n-1)`, tag: 'order-of-operations', feedback: 'Only the ratio is raised to the power. Write $a_1(r)^{n-1}$, not $(a_1 r)^{n-1}$.' },
        { answer: geoPlain(r, a1), tag: 'other', feedback: 'The first term goes in front and the ratio is the base.' },
        { answer: `${numStr(a1)}+(n-1)*${numStr(r)}`, tag: 'other', feedback: 'That is an arithmetic formula. A geometric sequence multiplies by $r$, so $r$ is the base of a power.' },
      ]);
    if (task === 'formula' || task === 'rec2exp') {
      const prompt = task === 'formula' ? [...intro, p('Write an explicit formula for $a_n$.')] : [p('A geometric sequence is defined recursively:'), math(`a_1 = ${dTex(a1)},\\quad a_n = ${r.isInteger() && !r.isNegative() ? rT : paren(r)}\\,a_{n-1}`), p('Write an explicit formula for $a_n$.')];
      return makeProblem({
        skillId: 'S6.07',
        tags: task === 'rec2exp' ? ['multi-step'] : [],
        prompt,
        answer: spec,
        inputHint: 'Type a formula in n, like 3(2)^(n-1). You can start with a_n = .',
        hints: ['The explicit formula for a geometric sequence is $a_n = a_1(r)^{n-1}$.', task === 'formula' ? 'Find $a_1$, then divide neighboring terms to find $r$.' : 'In the recursive formula, $a_{n-1}$ is multiplied by $r$.', `Here $a_1 = ${dTex(a1)}$.`, 'Put the ratio in parentheses as the base, with exponent $n - 1$.'],
        solution: [
          { text: 'Find $a_1$ and $r$.', tex: `a_1 = ${dTex(a1)},\\quad r = ${rT}`, why: task === 'formula' ? 'Divide any term by the one before it.' : 'Each term is $r$ times the term before it.' },
          { text: 'Substitute into the explicit formula.', tex: `a_n = ${geoTex(a1, r)}`, why: 'Term $n$ is the first term multiplied by $r$ a total of $n - 1$ times.' },
          { text: 'Check with $n = 2$.', tex: `${geoTex(a1, r, '1')} = ${dTex(geo(a1, r, 2))}`, why: 'It gives the second term, so the formula is right.' },
        ],
        misconceptions: formulaMis(),
      });
    }
    if (task === 'recursive') {
      const rTex = r.isInteger() && !r.isNegative() ? rT : paren(r);
      const correct = recLabel(a1, rTex, 'R\\,a_{n-1}');
      const wrongs = [recLabel(a1, rTex, 'a_{n-1} + R'), recLabel(r, dTex(a1), r.eq(a1) ? 'a_{n-1} + R' : 'R\\,a_{n-1}'), `$a_1 = ${dTex(a1)}$ and $a_n = ${rTex}\\,a_{n+1}$`];
      return makeProblem({
        skillId: 'S6.07',
        tags: [],
        prompt: [...intro, p('Which recursive formula defines this sequence?')],
        answer: makeChoice(rng, correct, wrongs),
        hints: ['A recursive formula gives the first term and a rule to get each term from the one before it.', 'The term before $a_n$ is $a_{n-1}$.', 'Find the common ratio by dividing neighboring terms.', 'Each term is the ratio times the term before it.'],
        solution: [
          { text: 'The first term is given.', tex: `a_1 = ${dTex(a1)}` },
          { text: 'Find the ratio.', tex: `r = \\frac{${dTex(ts[1])}}{${dTex(ts[0])}} = ${rT}` },
          { text: 'Each term is $r$ times the previous term.', tex: `a_n = ${rTex}\\,a_{n-1}`, why: 'That is the recursive rule for a geometric sequence.' },
        ],
        misconceptions: [],
      });
    }
    // which term equals a value
    const n = rng.int(5, r.abs().eq(2) || r.abs().lt(1) ? 9 : 7);
    const target = geo(a1, r, n);
    return makeProblem({
      skillId: 'S6.07',
      tags: ['multi-step'],
      prompt: [...intro, p(`Which term of the sequence is $${dTex(target)}$? Give the term number $n$.`)],
      answer: numSpec(Q(n)),
      inputHint: 'Type a whole number.',
      hints: ['Write the explicit formula $a_n = a_1(r)^{n-1}$.', `Set it equal to the value.`, `Divide both sides by $a_1 = ${dTex(a1)}$ and write what is left as a power of $${rT}$.`, 'The exponent is $n - 1$, so add 1 to it.'],
      solution: [
        { text: 'Set the explicit formula equal to the value.', tex: `${geoTex(a1, r)} = ${dTex(target)}` },
        { text: `Divide by $${dTex(a1)}$.`, tex: `${paren(r)}^{n-1} = ${r.pow(n - 1).toTex()} = ${paren(r)}^{${n - 1}}` },
        { text: 'Match exponents.', tex: `n - 1 = ${n - 1} \\Rightarrow n = ${n}`, why: 'Equal powers of the same base have equal exponents.' },
      ],
      misconceptions: numberMisconceptions(Q(n), [{ value: Q(n - 1), tag: 'sequence-index', feedback: 'That is the exponent $n - 1$. Add 1 to get the term number.' }]),
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const rec = /a_1 = (.+?),\\quad a_n = (.+?)\\,a_\{n-1\}/.exec(text);
    let a1: Rational;
    let r: Rational;
    let ts: Rational[] = [];
    if (rec) {
      a1 = texExact(rec[1])!;
      r = texExact(rec[2])!;
    } else {
      const listBlock = pr.prompt.find((b) => b.t === 'math');
      if (!listBlock || listBlock.t !== 'math') return ['no sequence'];
      ts = readList(listBlock.tex);
      const rs = ratios(ts);
      if (!allEq(rs)) return ['listed terms are not geometric'];
      a1 = ts[0];
      r = rs[0]!;
    }
    const a = pr.answer;
    if (a.kind === 'sequence-terms') {
      return a.values.every((v, i) => Q(v).eq(iterGeo(a1, r, ts.length + 1 + i))) ? [] : ['next terms wrong'];
    }
    if (a.kind === 'expression') {
      const node = parseExpression(a.value);
      for (let n = 1; n <= 10; n++) if (Math.abs(evalNumeric(node, { n }) - iterGeo(a1, r, n).toNumber()) > 1e-9 * Math.max(1, Math.abs(iterGeo(a1, r, n).toNumber()))) return [`formula wrong at n = ${n}`];
      return [];
    }
    if (a.kind === 'choice') {
      const label = choiceLabel(a);
      const m = /^\$a_1 = (.+?)\$ and \$a_n = (.+?)\\,a_\{n-1\}\$$/.exec(label);
      if (!m) return ['recursive choice is not of the form r a_(n-1)'];
      return texExact(m[1])!.eq(a1) && texExact(m[2])!.eq(r) ? [] : ['recursive formula wrong'];
    }
    if (a.kind !== 'number') return ['unexpected kind'];
    const v = Q(a.value);
    if (/What is the common ratio/.test(text)) return v.eq(r) ? [] : ['ratio wrong'];
    const tm = /\$a_\{(\d+)\}\$/.exec(text);
    if (tm && /Find the/.test(text)) return v.eq(iterGeo(a1, r, Number(tm[1]))) ? [] : ['term wrong'];
    const wm = /Which term of the sequence is \$(.+?)\$/.exec(text);
    if (!wm) return ['cannot read'];
    const target = texExact(wm[1])!;
    const hits = [];
    for (let n = 1; n <= 40; n++) if (iterGeo(a1, r, n).eq(target)) hits.push(n);
    return hits.length === 1 && v.eq(hits[0]) ? [] : ['term number wrong'];
  },
};

// ---------------------------------------------------------------------------
// S6.08: geometric sequences as exponential functions
// ---------------------------------------------------------------------------

export const genGeoFunction: GeneratorDef = {
  id: 'u6.geo-function',
  skillId: 'S6.08',
  description: 'Tell arithmetic and geometric sequences apart, write geometric sequences as exponential functions with domain the positive integers, and compare them with arithmetic sequences.',
  generate(rng, difficulty) {
    if (difficulty === 1) {
      const kind = rng.pick(['arithmetic', 'geometric', 'neither'] as const);
      let ts: Rational[];
      if (kind === 'arithmetic') {
        const a = Q(rng.int(-5, 20));
        const d = Q(rng.nonzeroInt(-8, 9));
        ts = [0, 1, 2, 3, 4].map((i) => a.add(d.mul(i)));
      } else if (kind === 'geometric') {
        const { a1, r } = pickGeo(rng, 2);
        ts = [1, 2, 3, 4, 5].map((n) => geo(a1, r, n));
      } else {
        const a = Q(rng.int(1, 5));
        const s = rng.int(1, 3);
        // differences grow by s: a, a+s, a+3s, a+6s, ... (first ratio may look like doubling)
        ts = [0, 1, 2, 3, 4].map((i) => a.add(Q(s * (i * (i + 1)) / 2)));
      }
      const correct = kind === 'arithmetic' ? 'Arithmetic' : kind === 'geometric' ? 'Geometric' : 'Neither';
      return makeProblem({
        skillId: 'S6.08',
        tags: [],
        prompt: [p('Is the sequence arithmetic, geometric or neither?'), math(listTex(ts))],
        answer: makeChoice(rng, correct, ['Arithmetic', 'Geometric', 'Neither'].filter((o) => o !== correct)),
        hints: ['Subtract each term from the next. Is the difference always the same?', 'Divide each term by the one before it. Is the ratio always the same?', 'Check every pair, not just the first two.', 'A common difference means arithmetic; a common ratio means geometric.'],
        solution: [
          { text: 'Find the differences.', why: `Differences: ${diffs(ts).map((q) => `$${dTex(q)}$`).join(', ')}.` },
          { text: 'Find the ratios.', why: `Ratios: ${ratios(ts).map((q) => (q ? `$${dTex(q)}$` : 'undefined')).join(', ')}.` },
          { text: kind === 'arithmetic' ? 'There is a common difference, so the sequence is arithmetic.' : kind === 'geometric' ? 'There is a common ratio, so the sequence is geometric.' : 'There is no common difference and no common ratio, so it is neither.' },
        ],
        misconceptions: [],
      });
    }
    if (difficulty === 2) {
      const r = Q(rng.pick(['2', '3', '1/2', '4', '1.5']));
      const c = Q(rng.pick([1, 2, 3, 5, 6, 10]));
      const a1 = c.mul(r);
      const ts = [1, 2, 3, 4].map((n) => geo(a1, r, n));
      if (rng.int(0, 2) === 0) {
        const correct = 'The positive integers $1, 2, 3, \\dots$';
        return makeProblem({
          skillId: 'S6.08',
          tags: [],
          prompt: [p(`The geometric sequence $${listTex(ts)}$ can be written as the function $f(n) = ${geoTex(c, r, 'n')}$, where $f(n)$ is the $n$th term. What is the domain of $f$?`)],
          answer: makeChoice(rng, correct, ['All real numbers', 'All integers', 'All real numbers $n \\ge 0$']),
          hints: ['The input $n$ is the term number.', 'Is there a 0th term, or a term number 2.5?', 'The first term is term number 1.', 'Term numbers count 1, 2, 3, and so on.'],
          solution: [{ text: 'The input $n$ is a term number: 1st, 2nd, 3rd and so on.', why: 'Sequences are functions whose domain is a set of whole-number positions.' }, { text: 'So the domain is the positive integers.', why: 'There is no term number 0, no negative term number and no term number like 2.5.' }],
          misconceptions: [],
        });
      }
      const spec = { kind: 'expression' as const, value: geoPlain(c, r, 'n'), variables: ['n'] };
      return makeProblem({
        skillId: 'S6.08',
        tags: [],
        prompt: [p('Write the geometric sequence as an exponential function $f(n) = a(b)^{n}$, where $f(n)$ is the $n$th term and $n = 1, 2, 3, \\dots$.'), math(listTex(ts))],
        answer: spec,
        inputHint: 'Type a formula in n, like 1.5(2)^n.',
        hints: ['The base $b$ is the common ratio.', 'Find the ratio by dividing neighboring terms.', 'At $n = 1$ the function must give the first term, so $a \\cdot b$ is the first term.', 'So $a$ is the first term divided by the ratio.'],
        solution: [
          { text: 'Find the common ratio.', tex: `b = r = \\frac{${dTex(ts[1])}}{${dTex(ts[0])}} = ${dTex(r)}` },
          { text: 'Rewrite the explicit formula.', tex: `a_n = ${geoTex(a1, r)} = \\frac{${dTex(a1)}}{${dTex(r)}}${paren(r)}^{n}`, why: '$a_1(r)^{n-1} = \\frac{a_1}{r}(r)^{n}$: the power has one extra factor of $r$, so divide $a_1$ by $r$ to balance it.' },
          { text: 'Simplify the coefficient.', tex: `f(n) = ${geoTex(c, r, 'n')}`, why: `Check: $f(1) = ${dTex(c)} \\cdot ${dTex(r)} = ${dTex(a1)}$, the first term.` },
        ],
        misconceptions: exprMis(spec, [
          { answer: geoPlain(a1, r, 'n'), tag: 'sequence-index', feedback: 'Check $n = 1$: that gives the second term. Divide the first term by the ratio to get $a$.' },
          { answer: geoPlain(r, a1, 'n'), tag: 'other', feedback: 'The base is the common ratio.' },
        ]),
      });
    }
    // compare an arithmetic and a geometric sequence
    const A0 = Q(rng.pick([20, 30, 50, 100]));
    const d = Q(rng.pick([10, 15, 20, 25, 50]));
    const r = Q(rng.pick([2, 2, 3, '1.5'] as const));
    const G0 = Q(rng.pick([1, 2, 3, 5]));
    const ar = (n: number) => A0.add(d.mul(n - 1));
    let first = 0;
    for (let n = 1; n <= 40 && !first; n++) if (geo(G0, r, n).gt(ar(n))) first = n;
    if (first < 3 || first > 20) return genGeoFunction.generate(rng, 3);
    const seqA = listTex([1, 2, 3, 4].map(ar));
    const seqG = listTex([1, 2, 3, 4].map((n) => geo(G0, r, n)));
    const intro = [p('Sequence A is arithmetic and sequence B is geometric.'), math(`\\text{A: } ${seqA}`), math(`\\text{B: } ${seqG}`)];
    const hints: [string, string, string, string] = ['Write a formula for each: $a_n = a_1 + (n - 1)d$ and $b_n = b_1(r)^{n-1}$.', `For A, the first term is $${dTex(A0)}$ and the common difference is $${dTex(d)}$. For B, the first term is $${dTex(G0)}$ and the common ratio is $${dTex(r)}$.`, 'Make a table of both sequences, term by term.', 'The geometric sequence starts smaller but grows by multiplying.'];
    if (rng.bool()) {
      return makeProblem({
        skillId: 'S6.08',
        tags: ['multi-step'],
        prompt: [...intro, p('What is the first term number $n$ for which the term of B is greater than the term of A?')],
        answer: numSpec(Q(first)),
        inputHint: 'Type a whole number.',
        hints,
        solution: [
          { text: 'Write both formulas.', tex: `a_n = ${dTex(A0)} + ${dTex(d)}(n - 1),\\quad b_n = ${geoTex(G0, r)}` },
          { text: 'Compare terms near the crossing.', tex: `n = ${first - 1}: a ${eqv(ar(first - 1))},\\ b ${eqv(geo(G0, r, first - 1))}\\qquad n = ${first}: a ${eqv(ar(first))},\\ b ${eqv(geo(G0, r, first))}`, why: 'Before this term A is at least as large; at this term B is larger.' },
          { text: `So B first passes A at term ${first}.`, why: 'After that, B multiplies while A only adds, so B stays ahead.' },
        ],
        misconceptions: numberMisconceptions(Q(first), [{ value: Q(first - 1), tag: 'sequence-index', feedback: `At term ${first - 1}, B is not yet greater than A. Check the next term.` }]),
      });
    }
    const n = rng.pick([first - 1, first + 1, first + 2, 2].filter((k) => k >= 2 && !geo(G0, r, k).eq(ar(k))));
    const correct = geo(G0, r, n).gt(ar(n)) ? `Sequence B` : `Sequence A`;
    return makeProblem({
      skillId: 'S6.08',
      tags: ['multi-step'],
      prompt: [...intro, p(`Which sequence has the greater ${ordinal(n)} term?`)],
      answer: makeChoice(rng, correct, [correct === 'Sequence A' ? 'Sequence B' : 'Sequence A', 'They are equal']),
      hints,
      solution: [
        { text: `Find term ${n} of A.`, tex: `a_{${n}} = ${dTex(A0)} + ${dTex(d)}(${n - 1}) = ${dTex(ar(n))}` },
        { text: `Find term ${n} of B.`, tex: `b_{${n}} = ${geoTex(G0, r, String(n - 1))} ${eqv(geo(G0, r, n))}` },
        { text: `${correct} has the greater ${ordinal(n)} term.` },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const lists = pr.prompt.filter((b) => b.t === 'math').map((b) => (b.t === 'math' ? b.tex : ''));
    const a = pr.answer;
    if (lists.length === 2) {
      const A = readList(lists[0].replace('\\text{A: } ', ''));
      const B = readList(lists[1].replace('\\text{B: } ', ''));
      const d = A[1].sub(A[0]);
      const r = B[1].div(B[0]);
      if (!allEq(diffs(A)) || !allEq(ratios(B))) return ['sequences are not arithmetic and geometric'];
      // iterate both recursively
      const at = (n: number) => {
        let x = A[0];
        let y = B[0];
        for (let i = 1; i < n; i++) {
          x = x.add(d);
          y = y.mul(r);
        }
        return [x, y] as const;
      };
      if (a.kind === 'number') {
        const n = Q(a.value).toInt();
        const [x, y] = at(n);
        const [x0, y0] = at(n - 1);
        return y.gt(x) && !y0.gt(x0) ? [] : ['first term number wrong'];
      }
      if (a.kind !== 'choice') return ['unexpected kind'];
      const n = Number(/greater (\d+)/.exec(text)![1]);
      const [x, y] = at(n);
      return choiceLabel(a) === (y.gt(x) ? 'Sequence B' : x.gt(y) ? 'Sequence A' : 'They are equal') ? [] : ['comparison wrong'];
    }
    if (a.kind === 'choice' && /domain/.test(text)) return /positive integers/.test(choiceLabel(a)) ? [] : ['domain wrong'];
    const tex = lists[0] ?? /\$(.+?\\dots)\$/.exec(text)?.[1];
    const ts = readList(tex);
    if (a.kind === 'choice') {
      const kind = allEq(diffs(ts)) ? 'Arithmetic' : allEq(ratios(ts)) ? 'Geometric' : 'Neither';
      return choiceLabel(a) === kind ? [] : ['classification wrong'];
    }
    if (a.kind !== 'expression') return ['unexpected kind'];
    const node = parseExpression(a.value);
    const r = ts[1].div(ts[0]);
    if (r.sign() <= 0) return ['ratio must be positive for an exponential function'];
    for (let n = 1; n <= 8; n++) if (Math.abs(evalNumeric(node, { n }) - iterGeo(ts[0], r, n).toNumber()) > 1e-9 * Math.max(1, iterGeo(ts[0], r, n).abs().toNumber())) return [`f(${n}) wrong`];
    return [];
  },
};

// ---------------------------------------------------------------------------
// S6.09: comparing linear, quadratic and exponential functions
// ---------------------------------------------------------------------------

type Family = 'linear' | 'quadratic' | 'exponential';
interface Fn { family: Family; tex: string; plain: string; at: (x: number) => Rational }

function linFn(m: Rational, c: Rational): Fn {
  const mt = m.eq(1) ? '' : dTex(m);
  return { family: 'linear', tex: c.isZero() ? `${mt}x` : `${mt}x ${c.isNegative() ? '-' : '+'} ${dTex(c.abs())}`, plain: `${numStr(m)}*x+${numStr(c)}`, at: (x) => m.mul(x).add(c) };
}
function quadFn(s: Rational, c: Rational): Fn {
  return { family: 'quadratic', tex: `${s.eq(1) ? '' : dTex(s)}x^{2}${c.isZero() ? '' : ` + ${dTex(c)}`}`, plain: `${numStr(s)}*x^2+${numStr(c)}`, at: (x) => s.mul(x * x).add(c) };
}
function expF(a: Rational, b: Rational): Fn {
  return { family: 'exponential', tex: `${a.eq(1) ? '' : dTex(a)}${a.eq(1) && b.isInteger() ? dTex(b) : paren(b)}^{x}`, plain: `${numStr(a)}*(${numStr(b)})^x`, at: (x) => a.mul(b.pow(x)) };
}
/** Read a function back from its TeX by evaluation through the parser (verify route). */
function evalTex(tex: string, x: number): number {
  return evalNumeric(parseExpression(texToPlain(tex)), { x });
}
function texToPlain(tex: string): string {
  return tex
    .replace(/\\left|\\right/g, '')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))')
    .replace(/\^\{([^{}]+)\}/g, '^($1)')
    .replace(/[{}]/g, '');
}

// ---------------------------------------------------------------------------
// S6.09 (A.FGR.9.5): comparing two functions given in DIFFERENT representations
// (equation, graph, table, verbal description).
// ---------------------------------------------------------------------------

type MixKind = 'lin' | 'quad' | 'exp';
interface MixFn { kind: MixKind; at: (x: number) => Rational; tex: string; plain: string; p: Rational[] }
type Rep = 'eq' | 'graph' | 'table' | 'verbal';
type MixQ = 'yint' | 'value' | 'asym' | 'factor' | 'dec';

const signed = (k: Rational) => (k.isZero() ? '' : ` ${k.isNegative() ? '-' : '+'} ${dTex(k.abs())}`);
function mLin(m: Rational, c: Rational): MixFn {
  const mt = m.eq(1) ? '' : m.eq(-1) ? '-' : dTex(m);
  return { kind: 'lin', at: (x) => m.mul(x).add(c), tex: `${mt}x${signed(c)}`, plain: `${numStr(m)}*x+(${numStr(c)})`, p: [m, c] };
}
function mQuad(s: Rational, c: Rational): MixFn {
  return { kind: 'quad', at: (x) => s.mul(x * x).add(c), tex: `${s.eq(1) ? '' : dTex(s)}x^{2}${signed(c)}`, plain: `${numStr(s)}*x^2+(${numStr(c)})`, p: [s, c] };
}
function mExp(a: Rational, b: Rational, k: Rational = Q(0)): MixFn {
  const head = `${a.eq(1) ? '' : a.eq(-1) ? '-' : dTex(a)}${paren(b)}^{x}`;
  return { kind: 'exp', at: (x) => a.mul(b.pow(x)).add(k), tex: `${head}${signed(k)}`, plain: `${numStr(a)}*(${numStr(b)})^x+(${numStr(k)})`, p: [a, b, k] };
}
const MIX_XS: Record<MixKind, number[]> = { exp: [-1, 0, 1, 2], lin: [-1, 0, 1, 2, 3], quad: [-2, -1, 0, 1, 2] };

function mixGraph(name: string, f: MixFn): Block {
  const xs = MIX_XS[f.kind];
  const ys = xs.map((x) => f.at(x).toNumber());
  if (f.kind === 'exp') ys.push(f.p[2].toNumber());
  let lo = Math.min(...ys, 0);
  let hi = Math.max(...ys, 0);
  const span = Math.max(hi - lo, 4);
  const yStep = span > 80 ? 20 : span > 40 ? 10 : span > 20 ? 5 : span > 10 ? 2 : 1;
  lo = Math.floor((lo - yStep) / yStep) * yStep;
  hi = Math.ceil((hi + yStep) / yStep) * yStep;
  const pts = xs.map((x) => ({ x, y: f.at(x).toNumber(), label: `(${x}, ${numStr(f.at(x))})` }));
  const spec: GraphSpec = {
    xMin: Math.min(...xs) - 2,
    xMax: Math.max(...xs) + 2,
    yMin: lo,
    yMax: hi,
    yStep,
    functions: [{ expr: f.plain }, ...(f.kind === 'exp' ? [{ expr: numStr(f.p[2]), dashed: true, color: '#888888', label: `y = ${numStr(f.p[2])}` }] : [])],
    points: pts,
    ariaLabel: `The graph of ${name}, a ${f.kind === 'exp' ? 'curve' : f.kind === 'lin' ? 'line' : 'parabola'} through ${pts.map((q) => q.label).join(', ')}${f.kind === 'exp' ? `, with a dashed horizontal asymptote at y = ${numStr(f.p[2])}` : ''}.`,
  };
  return { t: 'graph', spec, caption: `The graph of $y = ${name}(x)$.${f.kind === 'exp' ? ' The dashed line is its horizontal asymptote.' : ''}` };
}

function verbalOf(name: string, f: MixFn): string {
  const start = `Function $${name}$ has an output of ${numStr(f.at(0))} when $x = 0$, and its output`;
  if (f.kind === 'lin') return `${start} ${f.p[0].isNegative() ? 'decreases' : 'increases'} by ${numStr(f.p[0].abs())} each time $x$ increases by 1.`;
  const b = f.p[1];
  if (b.isInteger()) return `${start} is multiplied by ${numStr(b)} each time $x$ increases by 1.`;
  return `${start} ${b.gt(1) ? 'increases' : 'decreases'} by ${pct(b.sub(1).abs())}% each time $x$ increases by 1.`;
}

function mixRep(name: string, f: MixFn, rep: Rep): Block[] {
  if (rep === 'eq') return [p(`Function $${name}$ is given by an equation:`), math(`${name}(x) = ${f.tex}`)];
  if (rep === 'graph') return [p(`Function $${name}$ is shown in the graph.`), mixGraph(name, f)];
  if (rep === 'table') return [p(`Function $${name}$ is shown in the table.`), { t: 'table', headers: ['$x$', `$${name}(x)$`], rows: [0, 1, 2, 3].map((x) => [String(x), numStr(f.at(x))]) }];
  return [p(verbalOf(name, f))];
}

/** How a student reads each needed fact from each representation (solution steps). */
function mixRead(name: string, f: MixFn, rep: Rep, q: MixQ, n: number): { text: string; tex?: string; why?: string } {
  const N = `$${name}$`;
  if (q === 'yint') {
    const v = dTex(f.at(0));
    if (rep === 'graph') return { text: `Read the $y$-intercept of ${N} from the graph.`, tex: `${name}(0) = ${v}`, why: 'The $y$-intercept is the labeled point where the graph crosses the $y$-axis, at $x = 0$.' };
    if (rep === 'table') return { text: `Read the row of the table with $x = 0$.`, tex: `${name}(0) = ${v}`, why: 'The $y$-intercept is the output when the input is 0.' };
    if (rep === 'verbal') return { text: `The description gives the output of ${N} at $x = 0$.`, tex: `${name}(0) = ${v}`, why: 'The starting value is the $y$-intercept.' };
    return { text: `Substitute $x = 0$ into the equation of ${N}.`, tex: `${name}(0) = ${v}`, why: f.kind === 'exp' ? 'Any nonzero base to the power 0 is 1, so the $y$-intercept is $a + k$.' : 'At $x = 0$ only the constant term is left.' };
  }
  if (q === 'value') {
    const v = f.at(n);
    const vt = `${name}(${n}) ${eqv(v)}`;
    if (rep === 'eq') return { text: `Substitute $x = ${n}$ into the equation of ${N}.`, tex: vt };
    if (rep === 'verbal')
      return f.kind === 'lin'
        ? { text: `${N} is linear: it changes by the same amount each step.`, tex: `${name}(${n}) = ${dTex(f.at(0))} ${f.p[0].isNegative() ? '-' : '+'} ${dTex(f.p[0].abs())}(${n}) = ${dTex(v)}`, why: `${n} steps of ${dTex(f.p[0].abs())} from the starting value.` }
        : { text: `${N} is exponential: it is multiplied by the same factor each step.`, tex: `${name}(${n}) = ${coef0(f.at(0))}${paren(f.p[1])}^{${n}} ${eqv(v)}`, why: `The factor is $${dTex(f.p[1])}$, used ${n} times.` };
    if (rep === 'table') {
      if (f.kind === 'lin') return { text: `In the table of ${N} the differences are all $${dTex(f.p[0])}$, so ${N} is linear. Keep adding $${dTex(f.p[0])}$.`, tex: vt, why: 'A constant difference means the same amount is added for each step of 1 in $x$.' };
      if (f.kind === 'exp') return { text: `In the table of ${N} the ratios are all $${dTex(f.p[1])}$, so ${N} is exponential. Keep multiplying by $${dTex(f.p[1])}$.`, tex: `${name}(${n}) = ${coef0(f.at(0))}${paren(f.p[1])}^{${n}} ${eqv(v)}`, why: 'A constant ratio means the output is multiplied by the same factor for each step of 1 in $x$.' };
      return { text: `In the table of ${N} the second differences are all $${dTex(f.p[0].mul(2))}$, so ${N} is quadratic: $${name}(x) = ${f.tex}$.`, tex: vt, why: `Check: $${name}(1) = ${dTex(f.at(1))}$ and $${name}(2) = ${dTex(f.at(2))}$ match the table.` };
    }
    return { text: `Use the labeled points to find the rule for ${N}: $${name}(x) = ${f.tex}$.`, tex: vt };
  }
  if (q === 'asym') {
    const k = numStr(f.p[2]);
    return rep === 'graph' ? { text: `The dashed asymptote of ${N} is the line $y = ${k}$.`, why: 'The curve levels off along this line.' } : { text: `In the equation of ${N}, the number added at the end is ${k}, so its asymptote is $y = ${k}$.`, why: 'As the power part shrinks toward 0, the outputs approach the added constant.' };
  }
  if (q === 'factor') {
    if (rep === 'graph') {
      const k = f.p[2];
      return { text: `For ${N}, measure each labeled point from the asymptote $y = ${numStr(k)}$ and divide.`, tex: `\\frac{${dTex(f.at(1))} - ${sub0(k)}}{${dTex(f.at(0))} - ${sub0(k)}} = ${dTex(f.p[1])}`, why: 'Above the asymptote, the distance is multiplied by the growth factor for each step of 1 in $x$.' };
    }
    return { text: `In the equation of ${N}, the base is $${dTex(f.p[1])}$.`, why: 'The base is the growth factor.' };
  }
  // dec
  const dec = f.at(1).lt(f.at(0));
  if (rep === 'graph') return { text: `The graph of ${N} ${dec ? 'falls' : 'rises'} from left to right, so ${N} is ${dec ? 'decreasing' : 'increasing'}.`, why: `Compare the labeled points: $${name}(0) = ${dTex(f.at(0))}$ and $${name}(1) = ${dTex(f.at(1))}$.` };
  return { text: `The output of ${N} ${dec ? 'goes down' : 'goes up'} each step, so ${N} is ${dec ? 'decreasing' : 'increasing'}.`, why: f.kind === 'exp' ? `Multiplying a positive amount by $${dTex(f.p[1])}$ makes it ${f.p[1].lt(1) ? 'smaller' : 'larger'}.` : 'A linear function changes by the same amount every step.' };
}
const coef0 = (a: Rational) => (a.eq(1) ? '' : dTex(a));
const fmtV = (v: Rational) => (v.isInteger() || (v.isTerminatingDecimal() && v.mul(100).isInteger()) ? `$${dTex(v)}$` : `about $${commas(v.round(2), 2)}$`);
const sub0 = (k: Rational) => (k.isNegative() ? `(${dTex(k)})` : dTex(k));

function pickMixed(rng: Rng, difficulty: number): { f: MixFn; g: MixFn; rf: Rep; rg: Rep; q: MixQ; n: number } {
  const combo = difficulty === 2 ? rng.pick(['A', 'B', 'C'] as const) : rng.pick(['D', 'E', 'F'] as const);
  if (combo === 'A') {
    const f = mExp(Q(rng.int(1, 6)), Q(rng.pick(['2', '3', '1.5', '0.5'])));
    const g = rng.bool() ? mExp(Q(rng.int(1, 8)), Q(rng.pick(['2', '3', '1.5', '0.5'])), Q(rng.int(-3, 4))) : mLin(Q(rng.nonzeroInt(-5, 5)), Q(rng.int(-3, 8)));
    return { f, g, rf: 'graph', rg: 'eq', q: 'yint', n: 0 };
  }
  if (combo === 'B') {
    const f = mExp(Q(rng.int(1, 5)), Q(rng.pick([2, 3])));
    const g = mLin(Q(rng.pick([5, 10, 15, 20, 25])), Q(rng.pick([10, 20, 30, 40, 50, 60, 80, 100])));
    return { f, g, rf: 'table', rg: 'verbal', q: 'value', n: rng.int(4, 7) };
  }
  if (combo === 'C') {
    const f = mLin(Q(rng.int(2, 9)), Q(rng.int(1, 20)));
    const g = mExp(Q(rng.int(1, 5)), Q(rng.pick([2, 3])), Q(rng.int(-2, 5)));
    const q = rng.bool() ? 'yint' : 'value';
    return { f, g, rf: 'table', rg: 'eq', q, n: q === 'value' ? rng.int(4, 6) : 0 };
  }
  if (combo === 'D') {
    const q = rng.bool() ? 'asym' : 'factor';
    const b1 = Q(rng.pick(['2', '3', '1.5']));
    const f = mExp(Q(rng.int(1, 3)), b1, Q(rng.int(-5, 5)));
    const g = mExp(Q(rng.int(1, 4)), Q(rng.pick(['2', '3', '4', '1.5', '2.5'].filter((s) => !Q(s).eq(b1)))), Q(rng.int(-6, 6)));
    return { f, g, rf: 'graph', rg: 'eq', q, n: 0 };
  }
  if (combo === 'E') {
    const f = mQuad(Q(rng.int(1, 3)), Q(rng.int(0, 10)));
    const g = mExp(Q(rng.int(1, 3)), Q(rng.pick(['2', '1.5', '3'])));
    return { f, g, rf: 'table', rg: rng.bool() ? 'eq' : 'verbal', q: 'value', n: rng.int(5, 8) };
  }
  const f = rng.bool() ? mExp(Q(rng.pick([100, 200, 400, 800])), Q(rng.pick(['0.75', '0.8', '0.5', '1.25', '1.5', '2']))) : mLin(Q(rng.nonzeroInt(-9, 9)), Q(rng.pick([20, 40, 60])));
  const g = mExp(Q(rng.pick([1, 2, 3, -1, -2, -3])), Q(rng.pick(['2', '3', '0.5'])), Q(rng.int(-2, 3)));
  return { f, g, rf: 'verbal', rg: 'graph', q: 'dec', n: 0 };
}

const MIX_HINTS: Record<MixQ, (n: number) => [string, string, string, string]> = {
  yint: () => ['The $y$-intercept is the output when $x = 0$.', 'For the graph, find where it crosses the $y$-axis.', 'For a table or a description, look for the output at $x = 0$; for an equation, substitute $x = 0$.', 'Compare the two outputs.'],
  value: (n) => ['First decide what kind of function each one is: linear, quadratic or exponential.', 'Constant differences mean linear, constant second differences mean quadratic, constant ratios mean exponential.', `Extend each pattern (or substitute) until $x = ${n}$.`, 'Compare the two outputs.'],
  asym: () => ['A horizontal asymptote is the line $y = k$ that the graph levels off toward.', 'On the graph it is drawn as a dashed line.', 'In $a(b)^{x} + k$ it is the constant $k$ added at the end.', 'Compare the two $k$-values.'],
  factor: () => ['The growth factor is the number the distance from the asymptote is multiplied by each time $x$ increases by 1.', 'In an equation $a(b)^{x} + k$, it is the base $b$.', 'On the graph, subtract the asymptote value from two labeled points one step apart and divide.', 'Compare the two factors.'],
  dec: () => ['A decreasing function has outputs that go down as $x$ goes up.', 'For the description, ask whether each step makes the output bigger or smaller.', 'For the graph, follow the curve from left to right.', 'Decide for each function separately.'],
};

function mixedCompare(rng: Rng, difficulty: number) {
  for (let tries = 0; tries < 60; tries++) {
    const { f, g, rf, rg, q, n } = pickMixed(rng, difficulty);
    let vf: Rational;
    let vg: Rational;
    if (q === 'yint' || q === 'value') {
      vf = f.at(n);
      vg = g.at(n);
    } else if (q === 'asym') {
      vf = f.p[2];
      vg = g.p[2];
    } else if (q === 'factor') {
      vf = f.p[1];
      vg = g.p[1];
    } else {
      vf = Q(0);
      vg = Q(0);
    }
    if (q !== 'dec' && vf.eq(vg)) continue;
    // verbal and table values must be sensible: no zero start for verbal descriptions
    if ((rf === 'verbal' && f.at(0).isZero()) || (rf === 'table' && f.at(0).isZero())) continue;
    const prompt: Block[] = [...mixRep('f', f, rf), ...mixRep('g', g, rg)];
    const question = q === 'yint' ? 'Which function has the greater $y$-intercept?' : q === 'value' ? `Which function has the greater value at $x = ${n}$?` : q === 'asym' ? 'Which function’s graph has the higher horizontal asymptote?' : q === 'factor' ? 'Both functions are exponential. Which one has the greater growth factor?' : 'Which of the two functions are decreasing?';
    prompt.push(p(question));
    let answer;
    let concl: string;
    if (q === 'dec') {
      const df = f.at(1).lt(f.at(0));
      const dg = g.at(1).lt(g.at(0));
      const correct = df && dg ? 'Both $f$ and $g$' : df ? 'Only $f$' : dg ? 'Only $g$' : 'Neither';
      answer = makeChoice(rng, correct, ['Only $f$', 'Only $g$', 'Both $f$ and $g$', 'Neither'].filter((o) => o !== correct));
      concl = `${correct === 'Neither' ? 'Neither function is' : correct === 'Both $f$ and $g$' ? 'Both functions are' : `${correct} is`} decreasing.`;
    } else {
      const correct = vf.gt(vg) ? '$f$' : '$g$';
      answer = makeChoice(rng, correct, [correct === '$f$' ? '$g$' : '$f$', 'They are equal']);
      const what = q === 'yint' ? 'the greater $y$-intercept' : q === 'value' ? `the greater value at $x = ${n}$` : q === 'asym' ? 'the higher horizontal asymptote' : 'the greater growth factor';
      concl = `Compare: ${fmtV(vf)} for $f$ and ${fmtV(vg)} for $g$. So ${correct} has ${what}.`;
    }
    return makeProblem({
      skillId: 'S6.09',
      tags: ['multi-step', ...(rf === 'graph' || rg === 'graph' ? (['graph'] as const) : [])],
      prompt,
      answer,
      hints: MIX_HINTS[q](n),
      solution: [mixRead('f', f, rf, q, n), mixRead('g', g, rg, q, n), { text: concl, why: 'The two functions are given in different ways, so first turn each one into the same kind of fact, then compare.' }],
      misconceptions: [],
    });
  }
  throw new Error('mixedCompare: no untied pair');
}

/** verify(): rebuild each function from its own representation and evaluate it numerically. */
function mixEvaluators(pr: Pick<Problem, 'prompt'>): Map<string, (x: number) => number> | string {
  const out = new Map<string, (x: number) => number>();
  const blocks = pr.prompt;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.t !== 'p') continue;
    const head = /^Function \$([fg])\$ is (given by an equation|shown in the graph|shown in the table)/.exec(b.text);
    const verbal = /^Function \$([fg])\$ has an output of (-?[\d.]+) when \$x = 0\$, and its output (increases by|decreases by|is multiplied by) ([\d.]+)(%?) each time \$x\$ increases by 1\.$/.exec(b.text);
    if (verbal) {
      const start = Q(verbal[2]);
      const amt = Q(verbal[4]);
      const pctg = verbal[5] === '%';
      let step: (v: Rational) => Rational;
      if (verbal[3] === 'is multiplied by') step = (v) => v.mul(amt);
      else if (pctg) step = verbal[3] === 'increases by' ? (v) => v.add(v.mul(amt).div(100)) : (v) => v.sub(v.mul(amt).div(100));
      else step = verbal[3] === 'increases by' ? (v) => v.add(amt) : (v) => v.sub(amt);
      out.set(verbal[1], (x) => {
        let v = start;
        for (let s = 0; s < x; s++) v = step(v);
        return v.toNumber();
      });
      continue;
    }
    if (!head) continue;
    const name = head[1];
    const nxt = blocks[i + 1];
    if (head[2] === 'given by an equation') {
      if (!nxt || nxt.t !== 'math' || !nxt.tex.startsWith(`${name}(x) = `)) return 'equation missing';
      const tex = nxt.tex.slice(`${name}(x) = `.length);
      out.set(name, (x) => evalTex(tex, x));
    } else if (head[2] === 'shown in the graph') {
      if (!nxt || nxt.t !== 'graph') return 'graph missing';
      const fn = nxt.spec.functions!.find((q) => !q.dashed)!;
      const node = parseExpression(fn.expr);
      const F = (x: number) => evalNumeric(node, { x });
      for (const pt of nxt.spec.points ?? []) {
        const lab = /^\((-?\d+), (-?[\d./]+)\)$/.exec(pt.label ?? '');
        if (!lab || Math.abs(Q(lab[2]).toNumber() - F(Number(lab[1]))) > 1e-9 || Math.abs(pt.y - F(pt.x)) > 1e-9) return 'graph label off the curve';
      }
      const dashed = nxt.spec.functions!.find((q) => q.dashed);
      if (dashed) {
        const k = Number(dashed.expr);
        if (Math.abs(F(-60) - k) > 1e-6 && Math.abs(F(60) - k) > 1e-6) return 'dashed line is not the asymptote';
      }
      out.set(name, F);
    } else {
      if (!nxt || nxt.t !== 'table') return 'table missing';
      const xs = nxt.rows.map((r) => Number(r[0]));
      const ys = nxt.rows.map((r) => Q(r[1]));
      if (xs.some((x, j) => x !== j)) return 'table x-values are not 0, 1, 2, ...';
      const d1 = diffs(ys);
      const d2 = diffs(d1);
      let ext: (x: number) => Rational;
      if (allEq(d1)) ext = (x) => { let v = ys[0]; for (let s = 0; s < x; s++) v = v.add(d1[0]); return v; };
      else if (allEq(d2)) ext = (x) => { let v = ys[0]; let d = d1[0]; for (let s = 0; s < x; s++) { v = v.add(d); d = d.add(d2[0]); } return v; };
      else if (allEq(ratios(ys))) ext = (x) => iterGeo(ys[0], ratios(ys)[0]!, x + 1);
      else return 'table pattern unclear';
      out.set(name, (x) => ext(x).toNumber());
    }
  }
  return out.size === 2 ? out : 'functions not found';
}

function verifyMixed(pr: Problem): string[] {
  const ev = mixEvaluators(pr);
  if (typeof ev === 'string') return [ev];
  const F = ev.get('f')!;
  const G = ev.get('g')!;
  const text = textAll(pr);
  const a = pr.answer;
  if (a.kind !== 'choice') return ['unexpected kind'];
  const label = choiceLabel(a);
  if (/decreasing\?/.test(text)) {
    const dec = (H: (x: number) => number) => [0, 1, 2, 3].every((x) => H(x + 1) < H(x));
    const inc = (H: (x: number) => number) => [0, 1, 2, 3].every((x) => H(x + 1) > H(x));
    if (!(dec(F) || inc(F)) || !(dec(G) || inc(G))) return ['not monotone'];
    const want = dec(F) && dec(G) ? 'Both $f$ and $g$' : dec(F) ? 'Only $f$' : dec(G) ? 'Only $g$' : 'Neither';
    return label === want ? [] : ['decreasing choice wrong'];
  }
  let vf: number;
  let vg: number;
  const val = /greater value at \$x = (\d+)\$/.exec(text);
  if (/greater \$y\$-intercept/.test(text)) [vf, vg] = [F(0), G(0)];
  else if (val) [vf, vg] = [F(Number(val[1])), G(Number(val[1]))];
  else if (/horizontal asymptote/.test(text)) {
    const lim = (H: (x: number) => number) => (Math.abs(H(80) - H(81)) < 1e-9 ? H(80) : H(-80));
    [vf, vg] = [lim(F), lim(G)];
  } else if (/growth factor/.test(text)) {
    const fac = (H: (x: number) => number) => (H(2) - H(1)) / (H(1) - H(0));
    [vf, vg] = [fac(F), fac(G)];
  } else return ['unknown question'];
  if (Math.abs(vf - vg) < 1e-9) return label === 'They are equal' ? [] : ['should be equal'];
  return label === (vf > vg ? '$f$' : '$g$') ? [] : ['comparison wrong'];
}

export const genCompareFamilies: GeneratorDef = {
  id: 'u6.compare-families',
  skillId: 'S6.09',
  description: 'Identify and compare linear, quadratic and exponential functions from tables and equations, and see that exponential growth eventually exceeds the others.',
  generate(rng, difficulty) {
    if (difficulty === 1) {
      const fam = rng.pick(['linear', 'quadratic', 'exponential'] as const);
      const f = fam === 'linear' ? linFn(Q(rng.nonzeroInt(2, 9)), Q(rng.int(1, 10))) : fam === 'quadratic' ? quadFn(Q(rng.int(1, 3)), Q(rng.int(0, 8))) : expF(Q(rng.int(1, 5)), Q(rng.pick([2, 3])));
      const xs = [0, 1, 2, 3, 4];
      const ys = xs.map(f.at);
      const d1 = diffs(ys);
      const d2 = diffs(d1);
      const correct = fam[0].toUpperCase() + fam.slice(1);
      return makeProblem({
        skillId: 'S6.09',
        tags: [],
        prompt: [p('Which kind of function does the table show?'), { t: 'table', headers: ['$x$', '$y$'], rows: ys.map((y, i) => [String(i), numStr(y)]) }],
        answer: makeChoice(rng, correct, ['Linear', 'Quadratic', 'Exponential'].filter((o) => o !== correct)),
        hints: ['Find the first differences: subtract each $y$-value from the next.', 'If the first differences are not constant, find the second differences (the differences of the differences).', 'Also check the ratios of neighboring $y$-values.', 'Constant first differences: linear. Constant second differences: quadratic. Constant ratios: exponential.'],
        solution: [
          { text: 'First differences.', why: d1.map((q) => `$${dTex(q)}$`).join(', ') + '.' },
          { text: 'Second differences.', why: d2.map((q) => `$${dTex(q)}$`).join(', ') + '.' },
          { text: 'Ratios.', why: ratios(ys).map((q) => (q ? `$${dTex(q)}$` : 'undefined')).join(', ') + '.' },
          { text: fam === 'linear' ? 'The first differences are constant, so it is linear.' : fam === 'quadratic' ? 'The second differences are constant, so it is quadratic.' : 'The ratios are constant, so it is exponential.' },
        ],
        misconceptions: [],
      });
    }
    // functions given in two different representations (A.FGR.9.5)
    if (difficulty === 2 ? rng.bool() : rng.int(0, 4) < 2) return mixedCompare(rng, difficulty);
    if (difficulty === 2) {
      const lin = linFn(Q(rng.int(3, 12)), Q(rng.int(2, 20)));
      const ex = expF(Q(rng.int(1, 4)), Q(rng.pick([2, 3])));
      const askRate = rng.bool();
      const names = rng.bool() ? ['f', 'g'] : ['g', 'f'];
      const intro = [p(`Let $${names[0]}(x) = ${lin.tex}$ and $${names[1]}(x) = ${ex.tex}$.`)];
      let x1 = 0;
      let x2 = 0;
      let vl: Rational;
      let ve: Rational;
      if (askRate) {
        x1 = rng.int(0, 3);
        x2 = x1 + rng.int(1, 2);
        vl = lin.at(x2).sub(lin.at(x1)).div(x2 - x1);
        ve = ex.at(x2).sub(ex.at(x1)).div(x2 - x1);
      } else {
        x1 = rng.int(1, 6);
        vl = lin.at(x1);
        ve = ex.at(x1);
      }
      if (vl.eq(ve)) return genCompareFamilies.generate(rng, 2);
      const correct = `$${ve.gt(vl) ? names[1] : names[0]}$`;
      return makeProblem({
        skillId: 'S6.09',
        tags: [],
        prompt: [...intro, p(askRate ? `Which function has the greater average rate of change from $x = ${x1}$ to $x = ${x2}$?` : `Which function has the greater value at $x = ${x1}$?`)],
        answer: makeChoice(rng, correct, [`$${ve.gt(vl) ? names[0] : names[1]}$`, 'They are equal']),
        hints: askRate ? ['Average rate of change is change in output divided by change in input.', `Evaluate each function at $x = ${x1}$ and $x = ${x2}$.`, `Divide each change by $${x2 - x1}$.`, 'Compare the two rates.'] : [`Substitute $x = ${x1}$ into each function.`, 'For the exponential function, find the power first.', 'Compare the two outputs.', 'The larger output is the greater value.'],
        solution: askRate
          ? [
              { text: `Rate of $${names[0]}$.`, tex: `\\frac{${dTex(lin.at(x2))} - ${dTex(lin.at(x1))}}{${x2 - x1}} = ${dTex(vl)}`, why: 'A linear function has the same rate on every interval: its slope.' },
              { text: `Rate of $${names[1]}$.`, tex: `\\frac{${dTex(ex.at(x2))} - ${dTex(ex.at(x1))}}{${x2 - x1}} = ${dTex(ve)}`, why: 'An exponential function has a rate that keeps growing.' },
              { text: `${correct} has the greater rate.` },
            ]
          : [
              { text: `Evaluate $${names[0]}(${x1})$.`, tex: `${names[0]}(${x1}) = ${dTex(vl)}` },
              { text: `Evaluate $${names[1]}(${x1})$.`, tex: `${names[1]}(${x1}) = ${dTex(ve)}` },
              { text: `${correct} has the greater value.` },
            ],
        misconceptions: [],
      });
    }
    if (rng.bool()) {
      // first whole x where the exponential passes the line; exp(0) < line(0) so there is one crossing for x > 0
      const ex = expF(Q(rng.pick([1, 2, 3])), Q(rng.pick([2, 2, 3, '1.5'] as const)));
      const lin = linFn(Q(rng.pick([10, 20, 25, 40, 50])), Q(rng.pick([10, 20, 50, 100])));
      let first = 0;
      for (let x = 1; x <= 40 && !first; x++) if (ex.at(x).gt(lin.at(x))) first = x;
      if (first < 3 || first > 18) return genCompareFamilies.generate(rng, 3);
      return makeProblem({
        skillId: 'S6.09',
        tags: ['multi-step'],
        prompt: [p(`Let $f(x) = ${lin.tex}$ and $g(x) = ${ex.tex}$. What is the first whole number $x$ for which $g(x) > f(x)$?`)],
        answer: numSpec(Q(first)),
        inputHint: 'Type a whole number.',
        hints: ['Make a table of both functions for $x = 0, 1, 2, \\dots$.', '$f$ adds the same amount each time; $g$ multiplies by the same factor.', '$g$ starts smaller, but it keeps multiplying.', 'Find the first row where $g$ is bigger.'],
        solution: [
          { text: `At $x = 0$, $g(0) = ${dTex(ex.at(0))}$ is less than $f(0) = ${dTex(lin.at(0))}$.` },
          { text: 'Compare near the crossing.', tex: `x = ${first - 1}: f ${eqv(lin.at(first - 1))},\\ g ${eqv(ex.at(first - 1))}\\qquad x = ${first}: f ${eqv(lin.at(first))},\\ g ${eqv(ex.at(first))}`, why: 'The exponential function grows by a factor, so it eventually passes any linear function.' },
          { text: `The first whole number is $x = ${first}$.` },
        ],
        misconceptions: numberMisconceptions(Q(first), [{ value: Q(first - 1), tag: 'other', feedback: `At $x = ${first - 1}$, $g(x)$ is not yet greater than $f(x)$.` }]),
      });
    }
    // which eventually exceeds: a large linear, a quadratic and a small exponential
    const lin = linFn(Q(rng.pick([50, 100, 200])), Q(rng.pick([0, 10])));
    const quad = quadFn(Q(rng.pick([5, 10, 20])), Q(rng.pick([0, 5])));
    const ex = expF(Q(rng.pick([1, 2])), Q(rng.pick(['1.5', '2', '1.2'] as const)));
    const fns = rng.shuffle([lin, quad, ex]);
    const names = ['f', 'g', 'h'];
    const exName = names[fns.indexOf(ex)];
    const correct = `$${exName}$, because it multiplies by the same factor each time`;
    const others = names.filter((n) => n !== exName);
    return makeProblem({
      skillId: 'S6.09',
      tags: [],
      prompt: [p(`As $x$ gets very large, which function will eventually have the greatest values?`), math(fns.map((f, i) => `${names[i]}(x) = ${f.tex}`).join(',\\quad '))],
      answer: makeChoice(rng, correct, [`$${others[0]}$, because it has the largest value at $x = 1$`, `$${others[1]}$, because it has the largest value at $x = 1$`, 'None of them, because they all keep increasing']),
      hints: ['Identify each function as linear, quadratic or exponential.', 'Small values of $x$ can be misleading.', 'Try a large input, like $x = 100$, in each function.', 'Repeated multiplication by a number greater than 1 eventually beats adding and squaring.'],
      solution: [
        { text: `$${names[fns.indexOf(lin)]}$ is linear, $${names[fns.indexOf(quad)]}$ is quadratic and $${exName}$ is exponential with a base greater than 1.` },
        { text: 'An increasing exponential function eventually exceeds any linear or quadratic function.', why: `For example, at $x = 100$: ${fns.map((f, i) => `$${names[i]}(100) \\approx ${f.at(100).toNumber().toPrecision(3).replace(/e\+(\d+)/, ' \\times 10^{$1}')}$`).join(', ')}.` },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const a = pr.answer;
    if (pr.prompt.some((b) => b.t === 'p' && /^Function \$[fg]\$ /.test(b.text))) return verifyMixed(pr);
    const table = pr.prompt.find((b) => b.t === 'table');
    if (table && table.t === 'table') {
      const ys = table.rows.map((r) => Q(r[1]));
      const fam = allEq(diffs(ys)) ? 'Linear' : allEq(diffs(diffs(ys))) ? 'Quadratic' : allEq(ratios(ys)) ? 'Exponential' : '?';
      return a.kind === 'choice' && choiceLabel(a) === fam ? [] : ['family wrong'];
    }
    const defs = [...text.matchAll(/([fgh])\(x\) = (.+?)(?=\$|,\\quad|$)/g)].map((m) => ({ name: m[1], tex: m[2].trim() }));
    const F = (name: string, x: number) => evalTex(defs.find((d) => d.name === name)!.tex, x);
    if (a.kind === 'number') {
      const x = Q(a.value).toInt();
      return F('g', x) > F('f', x) && !(F('g', x - 1) > F('f', x - 1)) && [...Array(30)].every((_, i) => i < x - 1 || F('g', i + 1) > F('f', i + 1)) && [...Array(x)].every((_, i) => !(F('g', i) > F('f', i)) || i >= x) ? [] : ['first x wrong'];
    }
    if (a.kind !== 'choice') return ['unexpected kind'];
    const label = choiceLabel(a);
    if (/eventually/.test(text)) {
      const big = defs.map((d) => ({ name: d.name, v: F(d.name, 200) }));
      const best = big.reduce((m, d) => (d.v > m.v ? d : m));
      return label.startsWith(`$${best.name}$, because it multiplies`) ? [] : ['eventual winner wrong'];
    }
    const rate = /from \$x = (\d+)\$ to \$x = (\d+)\$/.exec(text);
    const val = (name: string) => (rate ? (F(name, Number(rate[2])) - F(name, Number(rate[1]))) / (Number(rate[2]) - Number(rate[1])) : F(name, Number(/value at \$x = (\d+)\$/.exec(text)![1])));
    const vf = val('f');
    const vg = val('g');
    return label === (vf > vg ? '$f$' : vg > vf ? '$g$' : 'They are equal') ? [] : ['comparison wrong'];
  },
};

// ---------------------------------------------------------------------------
// S6.10: exponential models in context
// ---------------------------------------------------------------------------

const GROW = [
  { what: 'A town has a population of', unit: 'people', noun: 'population', per: 'year', y: 'the population' },
  { what: 'A video has', unit: 'views', noun: 'number of views', per: 'day', y: 'the number of views' },
  { what: 'A small business has', unit: 'customers', noun: 'number of customers', per: 'month', y: 'the number of customers' },
];
const DECAY = [
  { what: 'A new car is worth', unit: 'dollars', noun: 'value', per: 'year', y: 'the value of a car in dollars' },
  { what: 'A lake has', unit: 'fish', noun: 'number of fish', per: 'year', y: 'the number of fish' },
];

export const genExpModel: GeneratorDef = {
  id: 'u6.exp-model',
  skillId: 'S6.10',
  description: 'Write, use, compare and interpret exponential models, including percent rates, doubling times and half-lives.',
  generate(rng, difficulty) {
    if (difficulty === 1) {
      const grow = rng.bool();
      const c = rng.pick(grow ? GROW : DECAY);
      const a = Q(rng.pick(grow ? [500, 1200, 2500, 4000, 8000] : [1500, 6000, 18000, 24000]));
      const byFactor = grow && rng.int(0, 3) === 0;
      const r = byFactor ? Q(rng.pick([2, 3])) : Q(rng.pick(grow ? [2, 3, 4, 5, 8, 10, 12] : [5, 8, 10, 12, 15, 20]), 100);
      const b = byFactor ? r : grow ? r.add(1) : Q(1).sub(r);
      const aText = c.unit === 'dollars' ? money(a) : `${commas(a).replace('{,}', ',')} ${c.unit}`;
      const change = byFactor ? (r.eq(2) ? 'doubles' : 'triples') + ` every ${c.per}` : `${grow ? 'grows' : 'decreases'} by ${pct(r)}% each ${c.per}`;
      const key = `y = ${numStr(a)}*(${numStr(b)})^t`;
      const mis: Misconception[] = ([
        { answer: `y = ${numStr(a)}*(${numStr(r)})^t`, tag: 'percent-rate', feedback: grow ? 'The growth factor is $1 + r$, not $r$ alone.' : 'The decay factor is $1 - r$: what is left after the decrease.' },
        { answer: `y = ${numStr(a)}*(${numStr(grow ? Q(1).sub(r) : r.add(1))})^t`, tag: 'percent-rate', feedback: grow ? 'Growth means the factor is greater than 1.' : 'A decrease means the factor is less than 1.' },
        ...(grow && !byFactor ? [{ answer: `y = ${numStr(a)}*(${numStr(Q(1).add(r.mul(100)))})^t`, tag: 'percent-rate', feedback: 'Change the percent to a decimal before adding it to 1.' }] : []),
        { answer: `y = ${numStr(a)}+${numStr(a.mul(b.sub(1)))}*t`, tag: 'other', feedback: 'That is linear. The amount changes by the same factor each time, so the model is exponential.' },
      ] as Misconception[]).filter((m, i, all) => all.findIndex((o) => o.answer === m.answer) === i && checkAnswer({ kind: 'equation', value: key }, m.answer).status === 'incorrect');
      return makeProblem({
        skillId: 'S6.10',
        tags: ['real-world'],
        prompt: [p(`${c.what} ${aText}. The ${c.noun} ${change}. Write an equation for $y$, ${c.y} after $t$ ${c.per}s.`)],
        answer: { kind: 'equation', value: key },
        inputHint: 'Type an equation like y = 500(1.04)^t.',
        hints: ['Use the form $y = a(b)^{t}$.', 'The starting amount is $a$.', byFactor ? `${r.eq(2) ? 'Doubling' : 'Tripling'} means multiplying by $${dTex(r)}$ each time.` : grow ? 'Growing by $r$ means multiplying by $1 + r$ each time.' : 'Decreasing by $r$ means multiplying by $1 - r$ each time.', byFactor ? 'That factor is $b$.' : `Change ${pct(r)}% to a decimal first.`],
        solution: [
          { text: 'The starting amount is $a$.', tex: `a = ${dTex(a)}` },
          { text: 'Find the factor $b$.', tex: byFactor ? `b = ${dTex(b)}` : `b = 1 ${grow ? '+' : '-'} ${dTex(r)} = ${dTex(b)}`, why: byFactor ? 'Each time step multiplies the amount by the same factor.' : grow ? 'Keeping 100% and adding the growth gives the new amount.' : 'After losing that percent, this part is what is left.' },
          { text: 'Write the model.', tex: `y = ${dTex(a)}\\left(${dTex(b)}\\right)^{t}` },
        ],
        misconceptions: mis,
      });
    }
    if (difficulty === 2) {
      const half = rng.bool();
      const k = rng.pick(half ? [4, 5, 6, 8, 12] : [2, 3, 4, 5, 20]);
      const m = rng.int(2, half ? 5 : 6);
      const a = Q(half ? 2 ** m * rng.pick([5, 10, 25]) : rng.pick([50, 100, 200, 300, 500]));
      const b = Q(half ? '1/2' : '2');
      const T = k * m;
      const v = a.mul(b.pow(m));
      const unitT = half || k < 20 ? 'hours' : 'minutes';
      const story = half ? `A medicine has a half-life of ${k} hours. A patient takes ${commas(a).replace('{,}', ',')} milligrams.` : `A culture of bacteria doubles every ${k} ${unitT}. It starts with ${commas(a).replace('{,}', ',')} bacteria.`;
      const model = `A(t) = ${commas(a)}\\left(${half ? '\\frac{1}{2}' : '2'}\\right)^{t/${k}}`;
      const askValue = rng.bool();
      const why = `In ${T} ${unitT} there are $${T} \\div ${k} = ${m}$ ${half ? 'half-lives' : 'doubling times'}.`;
      if (askValue) {
        return makeProblem({
          skillId: 'S6.10',
          tags: ['real-world'],
          prompt: [p(`${story} The amount after $t$ ${unitT} is modeled by the function below. How many ${half ? 'milligrams are left' : 'bacteria are there'} after ${T} ${unitT}?`), math(model)],
          answer: numSpec(v, half ? 'milligrams' : 'bacteria'),
          hints: ['Substitute the time into the exponent $t/' + k + '$.', `$${T} \\div ${k}$ tells you how many ${half ? 'half-lives' : 'doublings'} pass.`, half ? 'Each half-life cuts the amount in half.' : 'Each doubling time doubles the amount.', `Multiply the starting amount by $${half ? '\\frac{1}{2}' : '2'}$ that many times.`],
          solution: [
            { text: 'Find the exponent.', tex: `\\frac{${T}}{${k}} = ${m}`, why },
            { text: 'Evaluate.', tex: `A(${T}) = ${commas(a)}\\left(${half ? '\\frac{1}{2}' : '2'}\\right)^{${m}} = ${commas(v)}` },
          ],
          misconceptions: numberMisconceptions(v, [
            { value: half ? a.div(2 * m) : a.mul(2 * m), tag: 'exponent-rule', feedback: half ? `Halving ${m} times multiplies by $\\frac{1}{2}$ ${m} times. It does not divide by $${2 * m}$.` : `Doubling ${m} times multiplies by 2 ${m} times, not by $${2 * m}$.` },
            { value: T <= 30 ? a.mul(b.pow(T)) : null, tag: 'exponent-rule', feedback: `The exponent is $t/${k}$, the number of ${half ? 'half-lives' : 'doubling times'}, not $t$ itself.` },
          ]),
        });
      }
      return makeProblem({
        skillId: 'S6.10',
        tags: ['real-world', 'multi-step'],
        prompt: [p(`${story} The amount after $t$ ${unitT} is modeled by the function below. After how many ${unitT} will ${half ? `only ${commas(v).replace('{,}', ',')} milligrams be left` : `there be ${commas(v).replace('{,}', ',')} bacteria`}?`), math(model)],
        answer: numSpec(Q(T), unitT),
        inputHint: 'Type a number.',
        hints: [`Divide ${commas(v).replace('{,}', ',')} by the starting amount, or compare them.`, `Count how many times you ${half ? 'halve' : 'double'} ${commas(a).replace('{,}', ',')} to reach ${commas(v).replace('{,}', ',')}.`, `Each ${half ? 'half-life' : 'doubling'} takes ${k} ${unitT}.`, `Multiply the count by ${k}.`],
        solution: [
          { text: `Count the ${half ? 'halvings' : 'doublings'}.`, tex: `${commas(a)}\\left(${half ? '\\frac{1}{2}' : '2'}\\right)^{${m}} = ${commas(v)}`, why: `It takes ${m} ${half ? 'halvings' : 'doublings'}.` },
          { text: 'Set the exponent equal to that count.', tex: `\\frac{t}{${k}} = ${m} \\Rightarrow t = ${T}`, why: `Each ${half ? 'half-life' : 'doubling time'} is ${k} ${unitT}.` },
        ],
        misconceptions: numberMisconceptions(Q(T), [{ value: Q(m), tag: 'other', feedback: `That is the number of ${half ? 'half-lives' : 'doubling times'}. Multiply by ${k} ${unitT}.` }]),
      });
    }
    if (rng.bool()) {
      // interpret the parts of a model
      const grow = rng.bool();
      const c = rng.pick(grow ? GROW : DECAY);
      const a = Q(rng.pick([1200, 2500, 4000, 18000]));
      const r = Q(rng.pick([3, 4, 6, 8, 12, 15]), 100);
      const b = grow ? r.add(1) : Q(1).sub(r);
      const askB = rng.bool();
      const amt = c.unit === 'dollars' ? money(a) : c.noun.startsWith('number of') ? commas(a).replace('{,}', ',') : `${commas(a).replace('{,}', ',')} ${c.unit}`;
      const correct = askB ? `The ${c.noun} ${grow ? 'increases' : 'decreases'} by ${pct(r)}% each ${c.per}.` : `The ${c.noun} at the start is ${amt}.`;
      const wrongs = askB
        ? [`The ${c.noun} ${grow ? 'increases' : 'decreases'} by ${pct(b)}% each ${c.per}.`, `The ${c.noun} ${grow ? 'decreases' : 'increases'} by ${pct(r)}% each ${c.per}.`, `The ${c.noun} ${grow ? 'increases' : 'decreases'} by ${dTex(b)} each ${c.per}.`]
        : [`The ${c.noun} after 1 ${c.per} is ${amt}.`, `The ${c.noun} changes by ${amt} each ${c.per}.`, `The largest possible ${c.noun} is ${amt}.`];
      return makeProblem({
        skillId: 'S6.10',
        tags: ['real-world'],
        prompt: [p(`The function $y = ${commas(a)}\\left(${dTex(b)}\\right)^{t}$ models ${c.y} after $t$ ${c.per}s. What does the ${askB ? `$${dTex(b)}$` : `$${commas(a)}$`} tell you?`)],
        answer: makeChoice(rng, correct, wrongs),
        hints: ['In $y = a(b)^{t}$, $a$ is the value when $t = 0$.', '$b$ is the factor the amount is multiplied by each time step.', 'A factor greater than 1 is growth; a factor less than 1 is decay.', 'The percent change is the distance of $b$ from 1.'],
        solution: askB
          ? [{ text: `The factor is $${dTex(b)}$, which is ${grow ? 'greater' : 'less'} than 1.`, why: grow ? 'So the amount grows.' : 'So the amount decays.' }, { text: `$${dTex(b)} = 1 ${grow ? '+' : '-'} ${dTex(r)}$, so the rate is ${pct(r)}%.`, why: correct }]
          : [{ text: 'At $t = 0$ the power is 1.', tex: `y = ${commas(a)}(1) = ${commas(a)}` }, { text: correct, why: '$a$ is the starting amount.' }],
        misconceptions: [],
      });
    }
    // two models: first whole period when B passes A
    const aA = Q(rng.pick([6000, 12000, 24000]));
    const aB = aA.mul(Q(rng.pick(['1/2', '2/3', '3/4'] as const)));
    const rA = Q(rng.pick([2, 3, 4]), 100);
    const rB = rA.add(Q(rng.pick([5, 6, 8, 10]), 100));
    const bA = rA.add(1);
    const bB = rB.add(1);
    let first = 0;
    for (let t = 1; t <= 60 && !first; t++) if (aB.mul(bB.pow(t)).gt(aA.mul(bA.pow(t)))) first = t;
    if (first < 2 || first > 15) return genExpModel.generate(rng, 3);
    // avoid near ties at the crossing
    const ratio = aB.mul(bB.pow(first)).div(aA.mul(bA.pow(first))).toNumber();
    if (ratio < 1.0005) return genExpModel.generate(rng, 3);
    return makeProblem({
      skillId: 'S6.10',
      tags: ['real-world', 'multi-step'],
      prompt: [p(`Town A has ${commas(aA).replace('{,}', ',')} people and grows by ${pct(rA)}% each year. Town B has ${commas(aB).replace('{,}', ',')} people and grows by ${pct(rB)}% each year. After how many whole years will Town B first have more people than Town A?`)],
      answer: numSpec(Q(first), 'years'),
      inputHint: 'Type a whole number of years.',
      hints: ['Write a model for each town: $y = a(1 + r)^{t}$.', `Town A: $y = ${commas(aA)}\\left(${dTex(bA)}\\right)^{t}$. Town B: $y = ${commas(aB)}\\left(${dTex(bB)}\\right)^{t}$.`, 'Use a table or graph of both models.', 'Find the first whole year where B is larger.'],
      solution: [
        { text: 'Write both models.', tex: `A(t) = ${commas(aA)}\\left(${dTex(bA)}\\right)^{t},\\quad B(t) = ${commas(aB)}\\left(${dTex(bB)}\\right)^{t}`, why: 'Each town multiplies by its own growth factor every year.' },
        { text: 'Compare near the crossing.', tex: `t = ${first - 1}: A \\approx ${commas(aA.mul(bA.pow(first - 1)).round(0))},\\ B \\approx ${commas(aB.mul(bB.pow(first - 1)).round(0))}\\qquad t = ${first}: A \\approx ${commas(aA.mul(bA.pow(first)).round(0))},\\ B \\approx ${commas(aB.mul(bB.pow(first)).round(0))}`, why: 'Town B starts smaller but has the larger growth factor.' },
        { text: `Town B first has more people after ${first} years.` },
      ],
      misconceptions: numberMisconceptions(Q(first), [{ value: Q(first - 1), tag: 'other', feedback: `After ${first - 1} years, Town B still has fewer people. Check the next year.` }]),
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const a = pr.answer;
    const towns = /Town A has ([\d,]+) people and grows by ([\d.]+)% each year\. Town B has ([\d,]+) people and grows by ([\d.]+)%/.exec(text);
    if (towns) {
      let A = Q(towns[1].replace(/,/g, ''));
      let B = Q(towns[3].replace(/,/g, ''));
      const rA = Q(towns[2]).div(100);
      const rB = Q(towns[4]).div(100);
      let t = 0;
      while (!B.gt(A) && t < 100) {
        A = A.add(A.mul(rA));
        B = B.add(B.mul(rB));
        t++;
      }
      return a.kind === 'number' && Q(a.value).eq(t) ? [] : ['crossing year wrong'];
    }
    const half = /half-life of (\d+) hours\. A patient takes ([\d,]+) milligrams/.exec(text);
    const dbl = /doubles every (\d+) (\w+)\. It starts with ([\d,]+) bacteria/.exec(text);
    if (half || dbl) {
      const k = Number(half ? half[1] : dbl![1]);
      const a0 = Q((half ? half[2] : dbl![3]).replace(/,/g, ''));
      // repeated halving or doubling, one period at a time
      const amountAt = (t: number) => {
        let v = a0;
        for (let i = 0; i < t / k; i++) v = half ? v.div(2) : v.mul(2);
        return v;
      };
      if (a.kind !== 'number') return ['unexpected kind'];
      const after = /after (\d+) (hours|minutes)\?/.exec(text);
      if (after) return Q(a.value).eq(amountAt(Number(after[1]))) ? [] : ['amount wrong'];
      const target = Q(/(?:only|there be) ([\d,]+)/.exec(text)![1].replace(/,/g, ''));
      const t = Q(a.value).toInt();
      return t % k === 0 && amountAt(t).eq(target) ? [] : ['time wrong'];
    }
    if (a.kind === 'equation') {
      const m = /(?:of|has|worth) ([\\$\d,.]+)(?: \w+)?\. The .+? (doubles|triples|grows by ([\d.]+)%|decreases by ([\d.]+)%)/.exec(text);
      if (!m) return ['cannot read story'];
      const a0 = Q(m[1].replace(/[\\$,]/g, ''));
      const b = m[2] === 'doubles' ? Q(2) : m[2] === 'triples' ? Q(3) : m[3] ? Q(1).add(Q(m[3]).div(100)) : Q(1).sub(Q(m[4]).div(100));
      // the key must give a0 at t = 0 and multiply by b each step
      const node = parseExpression(a.value.split('=')[1]);
      for (let t = 0; t <= 5; t++) if (Math.abs(evalNumeric(node, { t }) - a0.mul(b.pow(t)).toNumber()) > 1e-6 * a0.toNumber()) return ['model wrong'];
      return [];
    }
    if (a.kind !== 'choice') return ['unexpected kind'];
    const im = /\$y = ([\d{},]+)\\left\(([\d.]+)\\right\)\^\{t\}\$.*What does the \$([\d{},.]+)\$/.exec(text);
    if (!im) return ['cannot read'];
    const label = choiceLabel(a);
    if (im[3] === im[2]) {
      const b = Q(im[2]);
      const rate = b.sub(1).abs().mul(100);
      return label.includes(`${b.gt(1) ? 'increases' : 'decreases'} by ${rate.toDecimalString(10)}%`) ? [] : ['rate interpretation wrong'];
    }
    return /at the start is/.test(label) && label.replace(/,/g, '').includes(im[1].replace(/\{,\}/g, '')) ? [] : ['initial value interpretation wrong'];
  },
};

void exprMis;

export const U6_SEQUENCE_GENERATORS: GeneratorDef[] = [genLinearOrExp, genGeometric, genGeoFunction, genCompareFamilies, genExpModel];
