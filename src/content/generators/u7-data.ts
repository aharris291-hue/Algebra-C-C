/**
 * Unit 7 generators for one-variable data: center (S7.01), quartiles and box plots (S7.02),
 * standard deviation (S7.03), shape and outliers (S7.04) and comparing distributions (S7.05).
 * Conventions are in src/core/math/stats.ts. verify() re-reads the data shown to the student
 * (list, frequency table, dot plot or box plot) and recomputes every statistic with its own
 * simple routines below, not with stats.ts.
 */
import type { GeneratorDef, Rng, Block, DataPlotSpec, Problem } from '../../core/curriculum/types';
import type { MisconceptionTag } from '../../core/math/answers';
import { parseInterval, intervalsEqual, type Misconception } from '../../core/math/answers';
import { Rational } from '../../core/math/rational';
import { mean, median, fiveNumber, iqr, fences, outliers, variance, stdDev, sorted } from '../../core/math/stats';
import { p, makeProblem, makeChoice, choiceLabel, numStr, Q, numberMisconceptions } from './util';

type Mis = { value: Rational | null; tag: MisconceptionTag; feedback: string };
const R = (xs: number[]) => xs.map((x) => Q(x));
const listTex = (xs: Rational[]) => xs.map((x) => numStr(x)).join(',\\ ');
const fmt = (x: Rational) => numStr(x);
/** Exact answers that terminate within 2 decimals are given exactly; others are rounded to the nearest tenth. */
function numAns(v: Rational, unit?: string) {
  const exact = v.mul(100).isInteger();
  return { spec: { kind: 'number' as const, value: exact ? numStr(v) : numStr(v), ...(exact ? {} : { roundTo: 1 }), ...(unit ? { unit } : {}) }, shown: exact ? numStr(v) : v.round(1).toDecimalString(1), note: exact ? '' : ' Round to the nearest tenth.' };
}

/** lo..hi is the typical range; min..max are hard limits no value (outliers included) may cross. */
interface Ctx { who: string; what: string; unit: string; lo: number; hi: number; min: number; max: number }
const CTX: Ctx[] = [
  { who: 'students', what: 'minutes of screen time before school', unit: 'minutes', lo: 5, hi: 60, min: 0, max: 240 },
  { who: 'players', what: 'points scored in a basketball game', unit: 'points', lo: 2, hi: 30, min: 0, max: 80 },
  { who: 'friends', what: 'hours spent gaming last week', unit: 'hours', lo: 1, hi: 25, min: 0, max: 80 },
  { who: 'phones', what: 'gigabytes of free storage', unit: 'GB', lo: 4, hi: 64, min: 0, max: 256 },
  { who: 'students', what: 'quiz scores (out of 50)', unit: 'points', lo: 20, hi: 50, min: 0, max: 50 },
  { who: 'runners', what: 'minutes to finish a 5K', unit: 'minutes', lo: 18, hi: 45, min: 14, max: 120 },
  { who: 'stores', what: 'headphone prices in dollars', unit: 'dollars', lo: 20, hi: 60, min: 5, max: 200 },
  { who: 'videos in a playlist', what: 'lengths in minutes', unit: 'minutes', lo: 3, hi: 25, min: 1, max: 120 },
];
const fits = (c: Ctx, xs: Array<Rational | number>) => xs.every((x) => { const v = typeof x === 'number' ? x : x.toNumber(); return v >= c.min && v <= c.max; });

function randomData(rng: Rng, n: number, lo: number, hi: number): Rational[] {
  return Array.from({ length: n }, () => Q(rng.int(lo, hi)));
}
const dataBlock = (xs: Rational[]): Block => ({ t: 'math', tex: listTex(xs) });

// ---------- independent routines used by verify() ----------
const vSort = (xs: Rational[]) => xs.map((x) => x).sort((a, b) => a.sub(b).toNumber());
function vMedian(xs: Rational[]): Rational {
  // the value(s) with as many data points on each side
  const s = vSort(xs);
  const lo = s[Math.floor((s.length - 1) / 2)];
  const hi = s[Math.ceil((s.length - 1) / 2)];
  return lo.add(hi).div(2);
}
function vQuartiles(xs: Rational[]): [Rational, Rational, Rational] {
  const s = vSort(xs);
  const n = s.length;
  const lower: Rational[] = [];
  const upper: Rational[] = [];
  s.forEach((x, i) => {
    if (i < Math.floor(n / 2)) lower.push(x);
    if (i >= Math.ceil(n / 2)) upper.push(x);
  });
  return [vMedian(lower), vMedian(s), vMedian(upper)];
}
const vMean = (xs: Rational[]) => xs.reduce((a, b) => a.add(b), Q(0)).div(xs.length);
/** sigma^2 = mean of squares minus square of mean */
const vVar = (xs: Rational[]) => vMean(xs.map((x) => x.mul(x))).sub(vMean(xs).mul(vMean(xs)));
function readList(tex: string): Rational[] {
  return tex.split(',\\ ').map((t) => Rational.parse(t.trim()));
}
function dataOf(pr: Pick<Problem, 'prompt'>): Rational[] | null {
  for (const b of pr.prompt) {
    if (b.t === 'math' && /^-?[\d.]+(,\\ -?[\d.]+)+$/.test(b.tex)) return readList(b.tex);
    if (b.t === 'dataplot' && b.spec.kind === 'dot') return b.spec.values.map((v) => Q(v));
    if (b.t === 'table' && b.headers[1] === 'Frequency') return b.rows.flatMap((r) => Array.from({ length: Number(r[1]) }, () => Rational.parse(r[0])));
  }
  return null;
}
const textAll = (pr: Pick<Problem, 'prompt'>) => pr.prompt.map((b) => (b.t === 'p' ? b.text : b.t === 'math' ? b.tex : '')).join(' ');
const near = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol;

function checkNumber(pr: Problem, want: Rational | number): string[] {
  if (pr.answer.kind !== 'number') return ['unexpected kind'];
  const a = pr.answer;
  const w = typeof want === 'number' ? want : want.toNumber();
  if (a.roundTo !== undefined) {
    const shown = Rational.parse(a.value).toNumber();
    return near(Math.round(shown * 10 ** a.roundTo), Math.round(w * 10 ** a.roundTo), 1e-6) ? [] : [`expected about ${w}`];
  }
  return near(Rational.parse(a.value).toNumber(), w, 1e-9) ? [] : [`expected ${w}`];
}

// ---------------------------------------------------------------------------
// S7.01: mean and median
// ---------------------------------------------------------------------------

export const genCenter: GeneratorDef = {
  id: 'u7.center',
  skillId: 'S7.01',
  description: 'Find the mean and median from lists, dot plots and frequency tables, choose the better measure of center, and find a missing value from a mean.',
  generate(rng, difficulty) {
    const c = rng.pick(CTX);
    if (difficulty === 1) {
      const n = rng.int(5, 9);
      const xs = randomData(rng, n, c.lo, c.hi);
      const askMean = rng.bool();
      if (!askMean && n % 2 === 0) return genCenter.generate(rng, 1);
      const v = askMean ? mean(xs) : median(xs);
      const ans = numAns(v, c.unit);
      const s = sorted(xs);
      const unsortedMiddle = xs[Math.floor(n / 2)];
      return makeProblem({
        skillId: 'S7.01',
        tags: ['real-world'],
        prompt: [p(`The data show the ${c.what} for ${n} ${c.who}. Find the ${askMean ? 'mean' : 'median'}.${askMean ? ans.note : ''}`), dataBlock(xs)],
        answer: ans.spec,
        hints: askMean
          ? ['The mean is the sum of the values divided by how many values there are.', 'Add all the values.', `There are ${n} values.`, `Divide the sum by ${n}.`]
          : ['The median is the middle value of the ordered data.', 'First put the values in order from least to greatest.', `There are ${n} values, an odd number, so one value is in the middle.`, `Count in ${(n - 1) / 2} values from either end.`],
        solution: askMean
          ? [
              { text: 'Add the values.', tex: `${xs.map(fmt).join(' + ')} = ${fmt(xs.reduce((a, b) => a.add(b), Q(0)))}` },
              { text: `Divide by the number of values, ${n}.`, tex: `\\frac{${fmt(xs.reduce((a, b) => a.add(b), Q(0)))}}{${n}} ${ans.note ? '\\approx' : '='} ${ans.shown}`, why: 'The mean shares the total equally among all the values.' },
            ]
          : [
              { text: 'Order the values.', tex: listTex(s), why: 'The median is only the middle once the data are in order.' },
              { text: 'Find the middle value.', tex: `\\text{median} = ${fmt(v)}`, why: `${(n - 1) / 2} values are below it and ${(n - 1) / 2} are above it.` },
            ],
        misconceptions: numberMisconceptions(askMean ? v.round(1) : v, askMean
          ? [
              { value: xs.reduce((a, b) => a.add(b), Q(0)).div(n - 1).round(1), tag: 'statistics-concept', feedback: `Divide by the number of values, ${n}.` },
              { value: median(xs).eq(v) ? null : median(xs), tag: 'statistics-concept', feedback: 'That is the median, the middle value. The mean is the sum divided by the count.' },
            ]
          : [
              { value: unsortedMiddle.eq(v) ? null : unsortedMiddle, tag: 'statistics-concept', feedback: 'Put the data in order before finding the middle value.' },
              { value: mean(xs).eq(v) ? null : mean(xs).round(1), tag: 'statistics-concept', feedback: 'That is the mean. The median is the middle value of the ordered data.' },
            ]),
      });
    }
    if (difficulty === 2) {
      const askMean = rng.bool();
      const useTable = rng.bool();
      // a small spread of values with frequencies
      const base = rng.int(c.lo, Math.max(c.lo, c.hi - 8));
      const values = Array.from({ length: rng.int(4, 5) }, (_, i) => base + i * rng.pick([1, 1, 2]));
      const uniq = [...new Set(values)].sort((a, b) => a - b);
      const freq = uniq.map(() => rng.int(1, 5));
      const xs = uniq.flatMap((v, i) => Array.from({ length: freq[i] }, () => Q(v)));
      const n = xs.length;
      const v = askMean ? mean(xs) : median(xs);
      const ans = numAns(v, c.unit);
      const shown: Block = useTable
        ? { t: 'table', headers: [`${c.what[0].toUpperCase()}${c.what.slice(1)}`, 'Frequency'], rows: uniq.map((u, i) => [String(u), String(freq[i])]) }
        : { t: 'dataplot', spec: { kind: 'dot', min: uniq[0] - 1, max: uniq[uniq.length - 1] + 1, step: 1, axisLabel: c.what, values: xs.map((x) => x.toNumber()), ariaLabel: `Dot plot of ${n} values: ${uniq.map((u, i) => `${freq[i]} at ${u}`).join(', ')}.` } };
      const distinctMean = mean(R(uniq));
      return makeProblem({
        skillId: 'S7.01',
        tags: ['real-world'],
        prompt: [p(`The ${useTable ? 'frequency table' : 'dot plot'} shows the ${c.what} for some ${c.who}. Find the ${askMean ? 'mean' : 'median'}.${askMean ? ans.note : ''}`), shown],
        answer: ans.spec,
        hints: askMean
          ? [`Each value counts as many times as its ${useTable ? 'frequency' : 'number of dots'}.`, 'Multiply each value by how many times it appears, then add.', `Count all the values: there are ${n}.`, 'Divide the total by the number of values.']
          : [`There are ${n} values in all.`, n % 2 === 1 ? `The median is value number ${(n + 1) / 2} in order.` : `With an even count, the median is halfway between values number ${n / 2} and ${n / 2 + 1}.`, `Count up from the smallest value using the ${useTable ? 'frequencies' : 'dots'}.`, useTable ? 'The table already lists the values in order from top to bottom.' : 'The dots are already in order from left to right.'],
        solution: askMean
          ? [
              { text: 'Find the total.', tex: `${uniq.map((u, i) => `${u}(${freq[i]})`).join(' + ')} = ${fmt(xs.reduce((a, b) => a.add(b), Q(0)))}`, why: 'Multiplying by the frequency adds a value as many times as it appears.' },
              { text: `Divide by the number of values, ${n}.`, tex: `\\frac{${fmt(xs.reduce((a, b) => a.add(b), Q(0)))}}{${n}} ${ans.note ? '\\approx' : '='} ${ans.shown}` },
            ]
          : [
              { text: `There are ${n} values.`, why: n % 2 === 1 ? `The middle one is number ${(n + 1) / 2}.` : `The middle two are numbers ${n / 2} and ${n / 2 + 1}.` },
              { text: 'Count to the middle.', tex: `\\text{median} = ${fmt(v)}`, why: n % 2 === 1 ? 'Half the values are on each side of it.' : 'Average the two middle values.' },
            ],
        misconceptions: numberMisconceptions(askMean ? v.round(1) : v, [
          { value: askMean ? (distinctMean.eq(v) ? null : distinctMean.round(1)) : median(R(uniq)).eq(v) ? null : median(R(uniq)), tag: 'statistics-concept', feedback: `Each value has to be counted as many times as it appears, not just once.` },
        ]),
      });
    }
    const kind = rng.pick(['better', 'missing', 'effect'] as const);
    if (kind === 'missing') {
      const n = rng.int(4, 6);
      const target = rng.int(c.lo + 3, c.hi - 3);
      const known = randomData(rng, n - 1, c.lo, c.hi);
      const missing = Q(target * n).sub(known.reduce((a, b) => a.add(b), Q(0)));
      if (missing.lt(c.lo) || missing.gt(c.hi)) return genCenter.generate(rng, 3);
      return makeProblem({
        skillId: 'S7.01',
        tags: ['real-world', 'multi-step'],
        prompt: [p(`The mean of the ${c.what} for ${n} ${c.who} is $${target}$. Here are ${n - 1} of the values. What is the missing value?`), dataBlock(known)],
        answer: { kind: 'number', value: numStr(missing), unit: c.unit },
        hints: ['The mean times the number of values gives the total.', `The total of all ${n} values is $${target} \\times ${n}$.`, 'Add the values you know.', 'Subtract to find the missing value.'],
        solution: [
          { text: 'Find the total of all the values.', tex: `${target} \\times ${n} = ${target * n}`, why: 'Mean = total ÷ count, so total = mean × count.' },
          { text: 'Add the known values.', tex: `${known.map(fmt).join(' + ')} = ${fmt(known.reduce((a, b) => a.add(b), Q(0)))}` },
          { text: 'Subtract.', tex: `${target * n} - ${fmt(known.reduce((a, b) => a.add(b), Q(0)))} = ${fmt(missing)}` },
        ],
        misconceptions: numberMisconceptions(missing, [
          { value: Q(target * (n - 1)).sub(known.reduce((a, b) => a.add(b), Q(0))), tag: 'statistics-concept', feedback: `There are ${n} values in all, including the missing one. Multiply the mean by ${n}.` },
          { value: mean(known).eq(missing) ? null : mean(known).round(1), tag: 'statistics-concept', feedback: 'That is the mean of the known values. The missing value has to bring the total up to the mean times the count.' },
        ]),
      });
    }
    // data with one high outlier
    const n = rng.int(6, 8);
    const xs = randomData(rng, n - 1, c.lo, Math.round((c.lo + c.hi) / 2));
    const out = Q(c.hi + (c.hi - c.lo) * rng.pick([1, 1.5, 2]));
    if (!fits(c, [out])) return genCenter.generate(rng, 3);
    const all = [...xs, out];
    if (kind === 'better') {
      const correct = 'The median, because the outlier pulls the mean up';
      return makeProblem({
        skillId: 'S7.01',
        tags: ['real-world'],
        prompt: [p(`The data show the ${c.what} for ${n} ${c.who}. Which measure of center better describes a typical value?`), dataBlock(all)],
        answer: makeChoice(rng, correct, ['The mean, because it uses every value', 'The mean, because the median ignores the largest value', 'They are always the same, so either one']),
        hints: ['Look for a value far from the others.', `The value $${fmt(out)}$ is much larger than the rest.`, 'An extreme value changes the total, so it moves the mean.', 'The median depends only on the middle of the ordered data.'],
        solution: [
          { text: 'Compare the two measures.', tex: `\\text{mean} \\approx ${mean(all).round(1).toDecimalString(1)},\\quad \\text{median} = ${fmt(median(all))}`, why: `The mean is pulled toward the outlier $${fmt(out)}$.` },
          { text: 'The median is closer to most of the values, so it describes a typical value better.', why: 'The median is resistant to outliers; the mean is not.' },
        ],
        misconceptions: [],
      });
    }
    // effect of adding a value on mean and median
    const before = xs;
    const mb = mean(before);
    const db = median(before);
    const ma = mean(all);
    const da = median(all);
    const word = (a: Rational, b: Rational) => (b.gt(a) ? 'increases' : b.lt(a) ? 'decreases' : 'stays the same');
    const plural = (w: string) => ({ increases: 'increase', decreases: 'decrease', 'stays the same': 'stay the same' })[w] ?? w;
    // the change stated in the key must agree with the rounded means shown in the solution
    if (!ma.sub(mb).abs().round(1).eq(ma.round(1).sub(mb.round(1)).abs())) return genCenter.generate(rng, 3);
    const correct = `The mean ${word(mb, ma)} by about ${ma.sub(mb).abs().round(1).toDecimalString(1)}, and the median ${word(db, da) === 'stays the same' ? 'stays the same' : `${word(db, da)} by ${fmt(da.sub(db).abs())}`}.`;
    if (da.sub(db).abs().mul(3).gt(ma.sub(mb).abs())) return genCenter.generate(rng, 3);
    return makeProblem({
      skillId: 'S7.01',
      tags: ['real-world', 'multi-step'],
      prompt: [p(`The data show the ${c.what} for ${n - 1} ${c.who}. Then one more value, $${fmt(out)}$, is added. How do the mean and median change?`), dataBlock(before)],
      answer: makeChoice(rng, correct, [
        `The mean and the median both ${plural(word(mb, ma))} by about ${ma.sub(mb).abs().round(1).toDecimalString(1)}.`,
        `The mean stays the same, and the median ${word(db, da) === 'stays the same' ? 'increases' : word(db, da)} by ${fmt(ma.sub(mb).abs().round(0))}.`,
        'Neither one changes, because only one value was added.',
      ]),
      hints: ['Find the mean and the median before the new value is added.', 'Then find them again with the new value.', 'The new value is much larger than the others.', 'A large value raises the total a lot, but it only moves the middle by one position.'],
      solution: [
        { text: 'Before.', tex: `\\text{mean} \\approx ${mb.round(1).toDecimalString(1)},\\quad \\text{median} = ${fmt(db)}` },
        { text: 'After.', tex: `\\text{mean} \\approx ${ma.round(1).toDecimalString(1)},\\quad \\text{median} = ${fmt(da)}`, why: 'The large value adds a lot to the total, but the middle of the ordered data shifts by at most half a position.' },
        { text: correct },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const xs = dataOf(pr);
    if (!xs) return ['cannot read data'];
    if (/missing value/.test(text)) {
      const m = /mean of the .+? is \$(\d+)\$/.exec(text)!;
      const n = Number(/for (\d+) /.exec(text)![1]);
      return pr.answer.kind === 'number' && Rational.parse(pr.answer.value).add(xs.reduce((a, b) => a.add(b), Q(0))).div(n).eq(Q(m[1])) ? [] : ['missing value wrong'];
    }
    if (/better describes a typical value/.test(text)) {
      const s = vSort(xs);
      const top = s[s.length - 1];
      const [q1, , q3] = vQuartiles(xs);
      if (!top.gt(q3.add(q3.sub(q1).mul(Q(3, 2))))) return ['largest value is not an outlier'];
      return pr.answer.kind === 'choice' && choiceLabel(pr.answer).startsWith('The median') ? [] : ['should choose median'];
    }
    if (/one more value/.test(text)) {
      const add = Rational.parse(/value, \$([\d.]+)\$/.exec(text)![1]);
      const after = [...xs, add];
      const dm = vMean(after).sub(vMean(xs));
      const dd = vMedian(after).sub(vMedian(xs));
      const label = pr.answer.kind === 'choice' ? choiceLabel(pr.answer) : '';
      const ok = label.includes(`The mean ${dm.sign() > 0 ? 'increases' : 'decreases'} by about ${dm.abs().round(1).toDecimalString(1)}`) && (dd.isZero() ? /median stays the same/.test(label) : label.includes(`median ${dd.sign() > 0 ? 'increases' : 'decreases'} by ${numStr(dd.abs())}`));
      return ok ? [] : ['effect wrong'];
    }
    return checkNumber(pr, /Find the mean/.test(text) ? vMean(xs) : vMedian(xs));
  },
};

// ---------------------------------------------------------------------------
// S7.02: five-number summary, IQR, box plots
// ---------------------------------------------------------------------------

const boxOf = (xs: Rational[], label?: string) => {
  const f = fiveNumber(xs);
  return { ...(label ? { label } : {}), min: f.min.toNumber(), q1: f.q1.toNumber(), median: f.median.toNumber(), q3: f.q3.toNumber(), max: f.max.toNumber() };
};
function axisFor(lo: number, hi: number): { min: number; max: number; step: number } {
  const span = hi - lo;
  const step = span <= 20 ? 1 : span <= 40 ? 2 : span <= 100 ? 5 : 10;
  return { min: Math.floor(lo / step) * step - step, max: Math.ceil(hi / step) * step + step, step };
}
/** Every five-number value lies on a labeled tick (DataPlot labels every tick up to 16 ticks, then every other one). */
function boxReadable(boxes: Array<{ min: number; q1: number; median: number; q3: number; max: number }>, ax: { min: number; max: number; step: number }): boolean {
  const ticks = Math.round((ax.max - ax.min) / ax.step) + 1;
  const every = ax.step * (ticks > 16 ? 2 : 1);
  return boxes.every((b) => [b.min, b.q1, b.median, b.q3, b.max].every((v) => v >= ax.min && v <= ax.max && Math.abs((v - ax.min) / every - Math.round((v - ax.min) / every)) < 1e-9));
}

export const genQuartiles: GeneratorDef = {
  id: 'u7.quartiles',
  skillId: 'S7.02',
  description: 'Find the five-number summary and IQR, read box plots, and match data to a box plot.',
  generate(rng, difficulty) {
    const c = rng.pick(CTX);
    const plotRead = difficulty === 2;
    // box plots to be read: halves of odd size (whole-number quartiles) and a narrow window, so every value sits on a labeled tick
    const n = difficulty === 1 ? rng.int(7, 11) : plotRead ? rng.pick([7, 11, 15]) : rng.int(8, 13);
    const base = rng.int(c.lo, Math.max(c.lo, c.hi - 12));
    const xs = plotRead ? randomData(rng, n, base, base + 12) : randomData(rng, n, c.lo, c.hi);
    const f = fiveNumber(xs);
    if (f.q1.eq(f.median) || f.median.eq(f.q3)) return genQuartiles.generate(rng, difficulty);
    if (plotRead && (f.min.eq(f.q1) || f.q3.eq(f.max) || outliers(xs).length > 0 || !boxReadable([boxOf(xs)], axisFor(f.min.toNumber(), f.max.toNumber())))) return genQuartiles.generate(rng, difficulty);
    const s = sorted(xs);
    const halfNote = n % 2 === 1 ? 'With an odd number of values, leave the median out of both halves.' : 'With an even number of values, the lower half is the first half of the list and the upper half is the second half.';
    if (difficulty === 1 || (difficulty === 3 && rng.bool())) {
      const shownData = difficulty === 1 ? s : xs;
      const askFive = difficulty === 1 && rng.bool();
      const k = iqr(xs);
      return makeProblem({
        skillId: 'S7.02',
        tags: ['real-world'],
        prompt: [p(`The data show the ${c.what} for ${n} ${c.who}${difficulty === 1 ? ', in order' : ''}. ${askFive ? 'Find the five-number summary.' : 'Find the interquartile range (IQR).'}`), dataBlock(shownData)],
        answer: askFive ? { kind: 'sequence-terms', values: [f.min, f.q1, f.median, f.q3, f.max].map((x) => numStr(x)) } : { kind: 'number', value: numStr(k), unit: c.unit },
        inputHint: askFive ? 'Type min, Q1, median, Q3, max separated by commas.' : 'Type a number.',
        hints: [difficulty === 1 ? 'The data are already in order.' : 'First put the data in order.', 'Find the median of the whole data set.', halfNote, askFive ? 'Q1 is the median of the lower half and Q3 is the median of the upper half.' : 'Q1 and Q3 are the medians of the lower and upper halves. IQR = Q3 − Q1.'],
        solution: [
          { text: 'Order the data and find the median.', tex: `${listTex(s)}\\quad\\Rightarrow\\quad \\text{median} = ${fmt(f.median)}` },
          { text: 'Find Q1 and Q3.', tex: `Q_1 = ${fmt(f.q1)},\\quad Q_3 = ${fmt(f.q3)}`, why: halfNote },
          askFive ? { text: 'List the five-number summary.', tex: `${fmt(f.min)},\\ ${fmt(f.q1)},\\ ${fmt(f.median)},\\ ${fmt(f.q3)},\\ ${fmt(f.max)}`, why: 'Minimum, Q1, median, Q3, maximum.' } : { text: 'Subtract.', tex: `\\text{IQR} = ${fmt(f.q3)} - ${fmt(f.q1)} = ${fmt(k)}`, why: 'The IQR is the spread of the middle half of the data.' },
        ],
        misconceptions: askFive
          ? []
          : numberMisconceptions(k, [
              { value: f.max.sub(f.min), tag: 'statistics-concept', feedback: 'That is the range (max − min). The IQR is Q3 − Q1.' },
              { value: n % 2 === 1 ? median(s.slice(Math.floor(n / 2))).sub(median(s.slice(0, Math.floor(n / 2) + 1))) : null, tag: 'statistics-concept', feedback: 'With an odd number of values, leave the median out of both halves.' },
            ]),
      });
    }
    if (difficulty === 2) {
      const ax = axisFor(f.min.toNumber(), f.max.toNumber());
      const spec: DataPlotSpec = { kind: 'box', ...ax, axisLabel: c.what, boxes: [boxOf(xs)], ariaLabel: `Box plot: minimum ${fmt(f.min)}, Q1 ${fmt(f.q1)}, median ${fmt(f.median)}, Q3 ${fmt(f.q3)}, maximum ${fmt(f.max)}.` };
      const ask = rng.pick(['q1', 'median', 'q3', 'iqr', 'range', 'pct'] as const);
      const pct = rng.pick([
        { text: `greater than ${fmt(f.q3)}`, v: 25 },
        { text: `less than ${fmt(f.q1)}`, v: 25 },
        { text: `between ${fmt(f.q1)} and ${fmt(f.q3)}`, v: 50 },
        { text: `greater than ${fmt(f.median)}`, v: 50 },
        { text: `greater than ${fmt(f.q1)}`, v: 75 },
        { text: `less than ${fmt(f.q3)}`, v: 75 },
      ]);
      const val = ask === 'q1' ? f.q1 : ask === 'median' ? f.median : ask === 'q3' ? f.q3 : ask === 'iqr' ? f.q3.sub(f.q1) : ask === 'range' ? f.max.sub(f.min) : Q(pct.v);
      const question = ask === 'q1' ? 'What is the first quartile, Q1?' : ask === 'median' ? 'What is the median?' : ask === 'q3' ? 'What is the third quartile, Q3?' : ask === 'iqr' ? 'What is the interquartile range (IQR)?' : ask === 'range' ? 'What is the range?' : `About what percent of the ${c.who} had ${c.what} ${pct.text}?`;
      return makeProblem({
        skillId: 'S7.02',
        tags: ['graph', 'real-world'],
        prompt: [p(`The box plot shows the ${c.what} for a group of ${c.who}. ${question}`), { t: 'dataplot', spec }],
        answer: { kind: 'number', value: numStr(val), ...(ask === 'pct' ? { unit: '%' } : { unit: c.unit }) },
        hints: ['The box runs from Q1 to Q3, and the line inside the box is the median.', 'The whiskers reach the minimum and the maximum.', ask === 'pct' ? 'Each of the four sections (whisker, half box, half box, whisker) holds about 25% of the data.' : ask === 'iqr' ? 'IQR = Q3 − Q1: the width of the box.' : ask === 'range' ? 'Range = maximum − minimum.' : 'Read the value from the axis.', ask === 'pct' ? 'Count how many 25% sections are in that part.' : 'Use the scale on the axis carefully.'],
        solution: [
          { text: 'Read the five-number summary from the box plot.', tex: `${fmt(f.min)},\\ ${fmt(f.q1)},\\ ${fmt(f.median)},\\ ${fmt(f.q3)},\\ ${fmt(f.max)}`, why: 'Minimum, Q1, median, Q3 and maximum are the five lines of the plot.' },
          { text: ask === 'pct' ? `Values ${pct.text} make up ${pct.v / 25} of the four quarters.` : 'Use the values you need.', tex: ask === 'iqr' ? `${fmt(f.q3)} - ${fmt(f.q1)} = ${fmt(val)}` : ask === 'range' ? `${fmt(f.max)} - ${fmt(f.min)} = ${fmt(val)}` : ask === 'pct' ? `${pct.v / 25} \\times 25\\% = ${pct.v}\\%` : `${fmt(val)}`, why: ask === 'pct' ? 'Each quarter holds about 25% of the data.' : undefined },
        ],
        misconceptions: numberMisconceptions(val, ask === 'iqr' ? [{ value: f.max.sub(f.min), tag: 'statistics-concept', feedback: 'That is the range. The IQR is the width of the box, Q3 − Q1.' }] : ask === 'range' ? [{ value: f.q3.sub(f.q1), tag: 'statistics-concept', feedback: 'That is the IQR. The range uses the whiskers: max − min.' }] : ask === 'pct' ? [{ value: Q(100 - pct.v), tag: 'statistics-concept', feedback: 'Check which side of the value you need.' }] : []),
      });
    }
    // which box plot matches the data (summaries written as text)
    const right = `Min ${fmt(f.min)}, Q1 ${fmt(f.q1)}, median ${fmt(f.median)}, Q3 ${fmt(f.q3)}, max ${fmt(f.max)}`;
    const inclusive = n % 2 === 1 ? { q1: median(s.slice(0, (n + 1) / 2)), q3: median(s.slice((n - 1) / 2)) } : null;
    const wrongs = [
      inclusive ? `Min ${fmt(f.min)}, Q1 ${fmt(inclusive.q1)}, median ${fmt(f.median)}, Q3 ${fmt(inclusive.q3)}, max ${fmt(f.max)}` : `Min ${fmt(f.min)}, Q1 ${fmt(f.q1.sub(1))}, median ${fmt(f.median)}, Q3 ${fmt(f.q3.add(1))}, max ${fmt(f.max)}`,
      `Min ${fmt(f.min)}, Q1 ${fmt(f.q1)}, median ${fmt(mean(xs).round(1))}, Q3 ${fmt(f.q3)}, max ${fmt(f.max)}`,
      `Min ${fmt(xs[0])}, Q1 ${fmt(f.q1)}, median ${fmt(xs[Math.floor(n / 2)])}, Q3 ${fmt(f.q3)}, max ${fmt(xs[n - 1])}`,
    ].filter((w) => w !== right);
    if (wrongs.length < 2) return genQuartiles.generate(rng, 3);
    return makeProblem({
      skillId: 'S7.02',
      tags: ['real-world', 'multi-step'],
      prompt: [p(`The data show the ${c.what} for ${n} ${c.who}. Which five-number summary would a box plot of these data show?`), dataBlock(xs)],
      answer: makeChoice(rng, right, wrongs),
      hints: ['Order the data first.', 'Find the median of all the values.', halfNote, 'Q1 and Q3 are the medians of the two halves.'],
      solution: [
        { text: 'Order the data.', tex: listTex(s) },
        { text: 'Find the median, Q1 and Q3.', tex: `\\text{median} = ${fmt(f.median)},\\ Q_1 = ${fmt(f.q1)},\\ Q_3 = ${fmt(f.q3)}`, why: halfNote },
        { text: right + '.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const plot = pr.prompt.find((b) => b.t === 'dataplot');
    if (plot && plot.t === 'dataplot' && plot.spec.kind === 'box') {
      const b = plot.spec.boxes[0];
      if (!(b.min <= b.q1 && b.q1 <= b.median && b.median <= b.q3 && b.q3 <= b.max)) return ['box not ordered'];
      if (!boxReadable([b], { ...plot.spec, step: plot.spec.step ?? 1 })) return ['box plot values are not on labeled ticks'];
      const pm = / (greater|less) than ([\d.]+)\?| between ([\d.]+) and ([\d.]+)\?/.exec(text);
      let want: number;
      if (pm) {
        // fraction of the plot's quarters on that side
        const marks = [b.min, b.q1, b.median, b.q3, b.max];
        if (pm[3]) want = 25 * (marks.indexOf(Number(pm[4])) - marks.indexOf(Number(pm[3])));
        else {
          const i = marks.indexOf(Number(pm[2]));
          want = pm[1] === 'greater' ? 25 * (4 - i) : 25 * i;
        }
      } else if (/Q1\?/.test(text)) want = b.q1;
      else if (/median\?/.test(text)) want = b.median;
      else if (/Q3\?/.test(text)) want = b.q3;
      else if (/IQR\)\?/.test(text)) want = b.q3 - b.q1;
      else want = b.max - b.min;
      return checkNumber(pr, want);
    }
    const xs = dataOf(pr);
    if (!xs) return ['cannot read data'];
    const [q1, med, q3] = vQuartiles(xs);
    const s = vSort(xs);
    if (pr.answer.kind === 'sequence-terms') {
      const want = [s[0], q1, med, q3, s[s.length - 1]];
      return pr.answer.values.every((v, i) => Rational.parse(v).eq(want[i])) ? [] : ['five-number summary wrong'];
    }
    if (pr.answer.kind === 'choice') return choiceLabel(pr.answer) === `Min ${numStr(s[0])}, Q1 ${numStr(q1)}, median ${numStr(med)}, Q3 ${numStr(q3)}, max ${numStr(s[s.length - 1])}` ? [] : ['summary choice wrong'];
    return checkNumber(pr, q3.sub(q1));
  },
};

// ---------------------------------------------------------------------------
// S7.03: standard deviation
// ---------------------------------------------------------------------------

/** Deviations (sum 0) whose mean square is a perfect square, so sigma is a whole number. */
function niceDeviations(rng: Rng): number[] {
  for (let tries = 0; tries < 2000; tries++) {
    const n = rng.int(4, 8);
    const d = Array.from({ length: n - 1 }, () => rng.int(-6, 6));
    const last = -d.reduce((a, b) => a + b, 0);
    if (Math.abs(last) > 8) continue;
    d.push(last);
    const ms = d.reduce((a, b) => a + b * b, 0) / n;
    const sd = Math.sqrt(ms);
    if (Number.isInteger(ms) && Number.isInteger(sd) && sd >= 2) return d;
  }
  return [-3, -1, -1, -1, 0, 0, 2, 4];
}


// ---------- MAD and standard deviation (A.DSR.10.1) ----------
const madOf = (xs: Rational[]) => mean(xs.map((x) => x.sub(mean(xs)).abs()));
const SIGMA_VS_MAD = ['σ is greater than the MAD', 'σ is equal to the MAD', 'σ is less than the MAD'];

/** Data with a whole-number mean and a MAD that terminates within two decimals. */
function madData(rng: Rng, c: Ctx, equal: boolean): Rational[] {
  for (let t = 0; t < 400; t++) {
    if (equal) {
      const d = rng.int(2, Math.max(2, Math.floor((c.hi - c.lo) / 4)));
      const m = rng.int(c.lo + d, c.hi - d);
      const j = rng.int(2, 3);
      return rng.shuffle([...Array(j).fill(m - d), ...Array(j).fill(m + d)].map((x) => Q(x)));
    }
    const xs = randomData(rng, rng.int(4, 6), c.lo, c.hi);
    const m = mean(xs);
    if (!m.isInteger() || !madOf(xs).mul(100).isInteger() || madOf(xs).isZero()) continue;
    const ds = xs.map((x) => x.sub(m).abs());
    if (ds.every((d) => d.eq(ds[0]))) continue;
    return xs;
  }
  return R([2, 4, 6, 8]);
}

function madCompare(rng: Rng, c: Ctx) {
  const xs = madData(rng, c, rng.int(0, 3) === 0);
  const n = xs.length;
  const m = mean(xs);
  const d = madOf(xs);
  const v = variance(xs);
  const sd = Math.sqrt(v.toNumber());
  const cmp = v.gt(d.mul(d)) ? 0 : v.eq(d.mul(d)) ? 1 : 2;
  const correct = SIGMA_VS_MAD[cmp];
  const sdTex = v.isInteger() && Number.isInteger(sd) ? `= ${sd}` : `= \\sqrt{${v.mul(100).isInteger() ? numStr(v) : v.toTex()}} \\approx ${sd.toFixed(2)}`;
  return makeProblem({
    skillId: 'S7.03',
    tags: ['real-world'],
    prompt: [p(`The data show the ${c.what} for ${n} ${c.who}. The mean is $${numStr(m)}$ and the mean absolute deviation (MAD) is $${numStr(d)}$. Find the standard deviation σ (divide by $n$). How does σ compare with the MAD?`), dataBlock(xs)],
    answer: makeChoice(rng, correct, SIGMA_VS_MAD.filter((o) => o !== correct)),
    hints: ['Both the MAD and σ start from the deviations: value minus mean.', 'The MAD averages the distances. σ squares the deviations, averages the squares, then takes the square root.', 'Find σ: square each deviation, add, divide by $n$, take the square root.', 'Compare your σ with the MAD given.'],
    solution: [
      { text: 'Find the deviations from the mean.', tex: xs.map((x) => numStr(x.sub(m))).join(',\\ '), why: 'Both measures of spread start from how far each value is from the mean.' },
      { text: 'The MAD is the mean of the distances (ignore the signs).', tex: `\\text{MAD} = \\frac{${xs.map((x) => numStr(x.sub(m).abs())).join(' + ')}}{${n}} = ${numStr(d)}` },
      { text: 'For σ, average the squared deviations and take the square root.', tex: `\\sigma = \\sqrt{\\frac{${xs.map((x) => numStr(x.sub(m).mul(x.sub(m)))).join(' + ')}}{${n}}} ${sdTex}`, why: 'Squaring first gives far-away values extra weight.' },
      { text: `So ${correct}.`, why: cmp === 1 ? 'Every value is the same distance from the mean, so both measures equal that distance.' : 'σ is never smaller than the MAD. It is larger when some values are farther from the mean than others, because squaring counts the far values more.' },
    ],
    misconceptions: [],
  });
}

const MAD_MEANING = 'Both describe how far the values typically are from the mean. σ is a little larger because squaring gives values far from the mean more weight.';
function madMeaning(rng: Rng, c: Ctx) {
  const xs = madData(rng, c, false);
  const m = mean(xs);
  const d = madOf(xs);
  const sd = Math.sqrt(variance(xs).toNumber());
  return makeProblem({
    skillId: 'S7.03',
    tags: ['real-world'],
    prompt: [p(`The data show the ${c.what} for ${xs.length} ${c.who}. The mean is $${numStr(m)}$, the mean absolute deviation (MAD) is $${numStr(d)}$ and the standard deviation is σ ≈ $${sd.toFixed(1)}$. Which statement about the MAD and σ is true?`), dataBlock(xs)],
    answer: makeChoice(rng, MAD_MEANING, [
      'Both describe the center of the data, so they should be equal. One of them was calculated wrong.',
      'The MAD describes spread, but σ describes the typical value of the data.',
      'σ is larger, so the values are actually farther from the mean than the data show.',
    ]),
    hints: ['Recall what the MAD measured in 6th grade: the average distance from the mean.', 'σ is built from the same deviations from the mean.', 'Neither one is a measure of center.', 'Squaring makes big deviations count more, which pushes σ up a little.'],
    solution: [
      { text: `The MAD, $${numStr(d)}$, is the average distance of the values from the mean $${numStr(m)}$.`, why: 'It averages the distances without squaring.' },
      { text: `σ ≈ $${sd.toFixed(1)}$ is also a typical distance from the mean, in the same units.`, why: 'It squares the deviations, averages them and takes the square root.' },
      { text: MAD_MEANING, why: 'Squaring counts the values far from the mean more heavily, so σ is at least as large as the MAD.' },
    ],
    misconceptions: [],
  });
}

export const genStdDev: GeneratorDef = {
  id: 'u7.std-dev',
  skillId: 'S7.03',
  description: 'Calculate the (population) standard deviation of small data sets and interpret standard deviation.',
  generate(rng, difficulty) {
    const c = rng.pick(CTX);
    if (difficulty === 2 && rng.int(0, 2) === 0) return madCompare(rng, c);
    if (difficulty <= 2) {
      let xs: Rational[];
      if (difficulty === 1) {
        const d = niceDeviations(rng);
        const m = rng.int(c.lo + 8, Math.max(c.lo + 8, c.hi - 8));
        xs = rng.shuffle(d.map((x) => Q(m + x)));
      } else {
        xs = randomData(rng, rng.int(5, 6), c.lo, c.hi);
        // a terminating mean keeps the deviations table in decimals
        if (!mean(xs).mul(100).isInteger()) return genStdDev.generate(rng, 2);
      }
      const n = xs.length;
      const m = mean(xs);
      const sd = stdDev(xs);
      const exact = difficulty === 1;
      const key = exact ? Q(Math.round(sd)) : Rational.parse(sd.toFixed(12));
      const devRows = xs.map((x) => [numStr(x), numStr(x.sub(m)), numStr(x.sub(m).mul(x.sub(m)))]);
      const ss = variance(xs).mul(n);
      const sx = Math.sqrt(ss.toNumber() / (n - 1));
      return makeProblem({
        skillId: 'S7.03',
        tags: ['real-world'],
        prompt: [p(`The data show the ${c.what} for ${n} ${c.who}. ${exact ? `The mean is $${numStr(m)}$. ` : ''}Find the standard deviation σ (divide by $n$).${exact ? '' : ' Round to the nearest tenth.'}`), dataBlock(xs)],
        answer: exact ? { kind: 'number', value: numStr(key), unit: c.unit } : { kind: 'number', value: key.toDecimalString(12), roundTo: 1, unit: c.unit },
        hints: [exact ? `Subtract the mean, $${numStr(m)}$, from each value.` : 'Find the mean first.', 'Square each deviation.', `Add the squares and divide by $n = ${n}$.`, 'Take the square root.'],
        solution: [
          ...(exact ? [] : [{ text: 'Find the mean.', tex: `\\bar{x} = ${m.mul(100).isInteger() ? numStr(m) : m.toTex()}` }]),
          { text: 'Make a table of deviations and squared deviations.', tex: `\\begin{array}{c|c|c} x & x - \\bar{x} & (x - \\bar{x})^2 \\\\ \\hline ${devRows.map((r) => r.map((v) => (v.includes('/') ? Rational.parse(v).toTex() : v)).join(' & ')).join(' \\\\ ')} \\end{array}`, why: 'Each deviation says how far a value is from the mean. Squaring makes them all positive.' },
          { text: 'Average the squared deviations.', tex: `\\frac{${ss.isInteger() ? numStr(ss) : ss.toTex()}}{${n}} = ${variance(xs).isInteger() || variance(xs).mul(100).isInteger() ? numStr(variance(xs)) : `${variance(xs).toTex()} \\approx ${variance(xs).toNumber().toFixed(2)}`}`, why: 'This is the variance.' },
          { text: 'Take the square root.', tex: `\\sigma ${exact ? '=' : '\\approx'} ${exact ? numStr(key) : sd.toFixed(1)}`, why: 'The square root undoes the squaring, so σ is back in the original units.' },
        ],
        misconceptions: numberMisconceptions(exact ? key : Rational.parse(sd.toFixed(1)), [
          { value: variance(xs).round(1), tag: 'statistics-concept', feedback: 'That is the variance. Take the square root to get the standard deviation.' },
          { value: Rational.parse(sx.toFixed(1)), tag: 'statistics-concept', feedback: `Divide by $n = ${n}$, not $n - 1$. (Dividing by $n - 1$ gives the sample standard deviation $s_x$.)` },
          { value: Rational.parse((xs.reduce((a, x) => a + Math.abs(x.sub(m).toNumber()), 0) / n).toFixed(1)), tag: 'statistics-concept', feedback: 'That is the average of the distances without squaring. Square the deviations, average them, then take the square root.' },
        ]),
      });
    }
    const kind = rng.pick(['compare', 'within', 'shift', 'mad'] as const);
    if (kind === 'mad') return madMeaning(rng, c);
    if (kind === 'compare') {
      const center = rng.int(5, 15);
      const base = Array.from({ length: rng.int(7, 9) }, () => rng.int(-3, 3));
      const wide = base.map((d) => center + d * 2);
      const tight = base.map((d) => center + Math.sign(d) * Math.min(1, Math.abs(d)));
      const swap = rng.bool();
      const A = swap ? tight : wide;
      const B = swap ? wide : tight;
      if (stdDev(R(A)) === stdDev(R(B))) return genStdDev.generate(rng, 3);
      const lo = Math.min(...A, ...B) - 1;
      const hi = Math.max(...A, ...B) + 1;
      const correct = stdDev(R(A)) > stdDev(R(B)) ? 'Data set A, because its values are farther from the mean' : 'Data set B, because its values are farther from the mean';
      return makeProblem({
        skillId: 'S7.03',
        tags: ['graph'],
        prompt: [
          p('Which data set has the greater standard deviation? Decide without calculating.'),
          { t: 'dataplot', spec: { kind: 'dot', min: lo, max: hi, axisLabel: 'Data set A', values: A, ariaLabel: `Dot plot A: ${A.join(', ')}` } },
          { t: 'dataplot', spec: { kind: 'dot', min: lo, max: hi, axisLabel: 'Data set B', values: B, ariaLabel: `Dot plot B: ${B.join(', ')}` } },
        ],
        answer: makeChoice(rng, correct, [correct.includes('set A') ? 'Data set B, because its values are farther from the mean' : 'Data set A, because its values are farther from the mean', 'They are equal, because they have the same number of values', 'They are equal, because they have about the same center']),
        hints: ['Standard deviation measures how far values typically are from the mean.', 'Find the center of each dot plot.', 'Which plot has dots spread out farther from its center?', 'More spread means a greater standard deviation.'],
        solution: [
          { text: 'Both data sets are centered near the same value.' },
          { text: correct.split(', because')[0] + ' has its dots spread farther from the center.', why: 'Standard deviation is a typical distance from the mean, so more spread means a larger standard deviation.' },
        ],
        misconceptions: [],
      });
    }
    if (kind === 'within') {
      const s = rng.int(2, Math.max(2, Math.floor((c.hi - c.lo) / 6)));
      const m = rng.int(c.lo + s, c.hi - s);
      return makeProblem({
        skillId: 'S7.03',
        tags: ['real-world'],
        prompt: [p(`The ${c.what} for a large group of ${c.who} have a mean of $${m}$ and a standard deviation of $${s}$. Which values are within one standard deviation of the mean? Write an interval.`)],
        answer: { kind: 'interval', value: `[${m - s}, ${m + s}]` },
        inputHint: 'Type an interval like [10, 20].',
        hints: ['Within one standard deviation means no farther than one standard deviation from the mean.', 'Subtract the standard deviation from the mean for the low end.', 'Add it for the high end.', 'Both ends count, so use brackets.'],
        solution: [
          { text: 'Low end.', tex: `${m} - ${s} = ${m - s}` },
          { text: 'High end.', tex: `${m} + ${s} = ${m + s}`, why: 'One standard deviation on each side of the mean.' },
          { text: 'The interval is', tex: `[${m - s}, ${m + s}]` },
        ],
        misconceptions: [
          { answer: `[${m - 2 * s}, ${m + 2 * s}]`, tag: 'statistics-concept', feedback: 'That is within two standard deviations. Go one standard deviation each way.' },
          { answer: `[${m}, ${m + s}]`, tag: 'statistics-concept', feedback: 'Go one standard deviation below the mean too.' },
        ] as Misconception[],
      });
    }
    const k = rng.int(2, 10);
    const correct = `The mean increases by ${k}, and the standard deviation stays the same.`;
    return makeProblem({
      skillId: 'S7.03',
      tags: ['real-world'],
      prompt: [p(`A teacher adds ${k} bonus points to every student's quiz score. What happens to the mean and the standard deviation of the scores?`)],
      answer: makeChoice(rng, correct, [`The mean and the standard deviation both increase by ${k}.`, `The mean stays the same, and the standard deviation increases by ${k}.`, 'Neither one changes.']),
      hints: ['Every score moves up by the same amount.', 'The whole data set slides to the right.', 'The center moves with the data.', 'The distances between the scores and the mean do not change.'],
      solution: [
        { text: `Adding ${k} to every value adds ${k} to the total, so the mean goes up by ${k}.` },
        { text: 'Each deviation from the mean is unchanged, so the standard deviation stays the same.', why: 'Standard deviation measures spread, and sliding all the data does not change the spread.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const text = textAll(pr);
    if (/mean absolute deviation \(MAD\) is/.test(text)) {
      // recompute the mean, the MAD (mean of |x - mean|) and sigma^2 from the data list
      const xs = dataOf(pr);
      if (!xs || pr.answer.kind !== 'choice') return ['cannot read'];
      const m = vMean(xs);
      const mad = vMean(xs.map((x) => (x.lt(m) ? m.sub(x) : x.sub(m))));
      const st = /The mean is \$([\d.]+)\$.*\(MAD\) is \$([\d.]+)\$/.exec(text);
      if (!st || !Rational.parse(st[1]).eq(m) || !Rational.parse(st[2]).eq(mad)) return ['stated mean or MAD wrong'];
      const v = vVar(xs);
      const label = choiceLabel(pr.answer);
      if (/How does σ compare/.test(text)) return label === (v.gt(mad.mul(mad)) ? 'σ is greater than the MAD' : v.eq(mad.mul(mad)) ? 'σ is equal to the MAD' : 'σ is less than the MAD') ? [] : ['comparison wrong'];
      const sg = /σ ≈ \$([\d.]+)\$/.exec(text);
      if (!sg || Math.abs(Number(sg[1]) - Math.sqrt(v.toNumber())) > 0.05 + 1e-9) return ['stated sigma wrong'];
      return label.startsWith('Both describe how far the values typically are from the mean') && v.gt(mad.mul(mad)) ? [] : ['meaning wrong'];
    }
    if (/bonus points/.test(text)) {
      const k = Number(/adds (\d+) bonus/.exec(text)![1]);
      const xs = R([60, 70, 75, 90]);
      const ys = xs.map((x) => x.add(k));
      const label = pr.answer.kind === 'choice' ? choiceLabel(pr.answer) : '';
      return vMean(ys).sub(vMean(xs)).eq(k) && vVar(ys).eq(vVar(xs)) && label === `The mean increases by ${k}, and the standard deviation stays the same.` ? [] : ['shift answer wrong'];
    }
    if (/within one standard deviation/.test(text)) {
      const m = Number(/mean of \$(\d+)\$/.exec(text)![1]);
      const s = Number(/deviation of \$(\d+)\$/.exec(text)![1]);
      return pr.answer.kind === 'interval' && intervalsEqual(parseInterval(pr.answer.value), parseInterval(`[${m - s}, ${m + s}]`)) ? [] : ['interval wrong'];
    }
    const plots = pr.prompt.filter((b) => b.t === 'dataplot');
    if (plots.length === 2) {
      const [a, b] = plots.map((x) => (x.t === 'dataplot' && x.spec.kind === 'dot' ? R(x.spec.values) : []));
      const want = vVar(a).gt(vVar(b)) ? 'Data set A' : 'Data set B';
      return pr.answer.kind === 'choice' && choiceLabel(pr.answer).startsWith(want + ',') ? [] : ['comparison wrong'];
    }
    const xs = dataOf(pr);
    if (!xs) return ['cannot read data'];
    const given = /The mean is \$([\d.]+)\$/.exec(text);
    if (given && !Rational.parse(given[1]).eq(vMean(xs))) return ['stated mean wrong'];
    return checkNumber(pr, Math.sqrt(vVar(xs).toNumber()));
  },
};

// ---------------------------------------------------------------------------
// S7.04: shape and outliers
// ---------------------------------------------------------------------------

const SHAPES: Record<'symmetric' | 'right', number[][]> = {
  symmetric: [[1, 3, 5, 3, 1], [2, 4, 6, 6, 4, 2], [1, 2, 4, 6, 4, 2, 1], [2, 3, 5, 3, 2]],
  right: [[6, 5, 3, 2, 1], [3, 7, 5, 3, 2, 1], [5, 6, 4, 2, 1, 1], [2, 6, 4, 3, 1]],
};

function shapeCounts(rng: Rng): { shape: 'Symmetric' | 'Skewed right' | 'Skewed left'; counts: number[] } {
  const k = rng.pick(['Symmetric', 'Skewed right', 'Skewed left'] as const);
  if (k === 'Symmetric') return { shape: k, counts: rng.pick(SHAPES.symmetric) };
  const c = rng.pick(SHAPES.right);
  return { shape: k, counts: k === 'Skewed right' ? c : [...c].reverse() };
}

export const genShapeOutliers: GeneratorDef = {
  id: 'u7.shape-outliers',
  skillId: 'S7.04',
  description: 'Describe the shape of a distribution, find the 1.5·IQR fences and outliers, and explain the effect of outliers.',
  generate(rng, difficulty) {
    const c = rng.pick(CTX);
    if (difficulty === 1 || (difficulty === 3 && rng.int(0, 2) === 0)) {
      const { shape, counts } = shapeCounts(rng);
      const start = rng.int(c.lo, c.lo + 10);
      const width = rng.pick([1, 2, 5]);
      const asHist = rng.bool();
      const values = counts.flatMap((k, i) => Array.from({ length: k }, () => start + i * width));
      if (!fits(c, [start, start + counts.length * width * 2])) return genShapeOutliers.generate(rng, difficulty);
      const plot: Block = asHist
        ? { t: 'dataplot', spec: { kind: 'histogram', bins: counts.map((k, i) => ({ from: start + i * width * 2, to: start + (i + 1) * width * 2, count: k })), xLabel: c.what, yLabel: 'Frequency', ariaLabel: `Histogram with bar heights ${counts.join(', ')} from left to right.` } }
        : { t: 'dataplot', spec: { kind: 'dot', min: start - width, max: start + counts.length * width, step: width, axisLabel: c.what, values, ariaLabel: `Dot plot with ${counts.join(', ')} dots from left to right.` } };
      if (difficulty === 3) {
        if (shape === 'Symmetric' && asHist) return genShapeOutliers.generate(rng, 3);
        const xs = R(values);
        const m = mean(xs);
        const md = median(xs);
        // the key must agree with the rule taught: the tail pulls the mean toward it
        const want = shape === 'Symmetric' ? 0 : shape === 'Skewed right' ? 1 : -1;
        if (m.sub(md).sign() !== want) return genShapeOutliers.generate(rng, 3);
        const correct = m.gt(md) ? 'The mean is greater than the median.' : m.lt(md) ? 'The mean is less than the median.' : 'The mean and the median are equal.';
        return makeProblem({
          skillId: 'S7.04',
          tags: ['graph'],
          prompt: [p(`The ${asHist ? 'histogram' : 'dot plot'} shows the ${c.what} for a group of ${c.who}. How does the mean compare with the median?`), plot],
          answer: makeChoice(rng, correct, ['The mean is greater than the median.', 'The mean is less than the median.', 'The mean and the median are equal.'].filter((o) => o !== correct)),
          hints: ['Describe the shape first.', 'A long tail pulls the mean toward it.', 'The median stays near the middle of the ordered data.', 'In a symmetric distribution the two are equal or close.'],
          solution: [
            { text: `The distribution is ${shape.toLowerCase()}.`, why: shape === 'Symmetric' ? 'Both sides are mirror images.' : `The tail is on the ${shape === 'Skewed right' ? 'right' : 'left'}.` },
            { text: correct, why: shape === 'Symmetric' ? 'With a symmetric shape, the balance point and the middle are the same.' : 'The values in the tail pull the mean toward the tail, but they do not move the median much.' },
          ],
          misconceptions: [],
        });
      }
      return makeProblem({
        skillId: 'S7.04',
        tags: ['graph'],
        prompt: [p(`What is the shape of the distribution of the ${c.what}?`), plot],
        answer: makeChoice(rng, shape, ['Symmetric', 'Skewed right', 'Skewed left'].filter((o) => o !== shape)),
        hints: ['Find where most of the data pile up.', 'Look for a long tail on one side.', 'A distribution is skewed toward its tail: a tail on the right means skewed right.', 'If both sides look like mirror images, it is symmetric.'],
        solution: [
          { text: 'Look at where the data pile up and where they trail off.', why: shape === 'Symmetric' ? 'The left and right sides are mirror images.' : `The data pile up on the ${shape === 'Skewed right' ? 'left' : 'right'} and trail off to the ${shape === 'Skewed right' ? 'right' : 'left'}.` },
          { text: `The shape is ${shape.toLowerCase()}.`, why: 'A skewed distribution is named for the side of its tail.' },
        ],
        misconceptions: [],
      });
    }
    // data with planted outlier(s)
    const n = rng.int(9, 12);
    let xs = randomData(rng, n - 1, c.lo, Math.round((c.lo + c.hi) / 2));
    const high = rng.bool();
    const f0 = fiveNumber(xs);
    const spread = f0.q3.sub(f0.q1).toNumber();
    const out = high ? Math.ceil(f0.q3.toNumber() + 1.5 * spread + rng.int(3, 15)) : Math.floor(f0.q1.toNumber() - 1.5 * spread - rng.int(3, 15));
    if (!fits(c, [out])) return genShapeOutliers.generate(rng, difficulty);
    xs = [...xs, Q(out)];
    const f = fiveNumber(xs);
    const fe = fences(xs);
    const outs = outliers(xs);
    if (!outs.some((o) => o.eq(out)) || f.q3.eq(f.q1)) return genShapeOutliers.generate(rng, difficulty);
    const s = sorted(xs);
    if (difficulty === 2) {
      if (rng.bool()) {
        const askHi = rng.bool();
        const v = askHi ? fe.hi : fe.lo;
        return makeProblem({
          skillId: 'S7.04',
          tags: ['real-world'],
          prompt: [p(`The ${c.what} for ${n} ${c.who} are shown in order. Find the ${askHi ? 'upper fence, $Q_3 + 1.5 \\cdot \\text{IQR}$' : 'lower fence, $Q_1 - 1.5 \\cdot \\text{IQR}$'}.`), dataBlock(s)],
          answer: { kind: 'number', value: numStr(v) },
          hints: ['Find Q1 and Q3.', 'IQR = Q3 − Q1.', 'Multiply the IQR by 1.5.', askHi ? 'Add that to Q3.' : 'Subtract that from Q1.'],
          solution: [
            { text: 'Find the quartiles and the IQR.', tex: `Q_1 = ${fmt(f.q1)},\\ Q_3 = ${fmt(f.q3)},\\ \\text{IQR} = ${fmt(f.q3.sub(f.q1))}` },
            { text: 'Multiply by 1.5.', tex: `1.5 \\times ${fmt(f.q3.sub(f.q1))} = ${fmt(f.q3.sub(f.q1).mul(Q(3, 2)))}` },
            { text: askHi ? 'Add to Q3.' : 'Subtract from Q1.', tex: askHi ? `${fmt(f.q3)} + ${fmt(f.q3.sub(f.q1).mul(Q(3, 2)))} = ${fmt(v)}` : `${fmt(f.q1)} - ${fmt(f.q3.sub(f.q1).mul(Q(3, 2)))} = ${fmt(v)}`, why: 'Values beyond the fences are outliers.' },
          ],
          misconceptions: numberMisconceptions(v, [
            { value: askHi ? f.q3.add(f.q3.sub(f.q1)) : f.q1.sub(f.q3.sub(f.q1)), tag: 'statistics-concept', feedback: 'Multiply the IQR by 1.5 before adding or subtracting.' },
            { value: askHi ? f.median.add(f.q3.sub(f.q1).mul(Q(3, 2))) : f.median.sub(f.q3.sub(f.q1).mul(Q(3, 2))), tag: 'statistics-concept', feedback: `Start from ${askHi ? 'Q3' : 'Q1'}, not the median.` },
          ]),
        });
      }
      const correct = outs.length === 1 ? `Only ${fmt(outs[0])}` : outs.map(fmt).join(' and ');
      const wrongs = [`None of the values`, `${fmt(s[high ? 0 : s.length - 1])} and ${fmt(Q(out))}`, `${fmt(s[high ? s.length - 2 : 1])} and ${fmt(Q(out))}`].filter((w) => w !== correct);
      return makeProblem({
        skillId: 'S7.04',
        tags: ['real-world', 'multi-step'],
        prompt: [p(`The ${c.what} for ${n} ${c.who} are shown in order. Which values are outliers by the 1.5·IQR rule?`), dataBlock(s)],
        answer: makeChoice(rng, correct, wrongs),
        hints: ['Find Q1, Q3 and the IQR.', 'Lower fence: Q1 − 1.5·IQR. Upper fence: Q3 + 1.5·IQR.', 'Outliers are values below the lower fence or above the upper fence.', 'Check the smallest and largest values first.'],
        solution: [
          { text: 'Find the fences.', tex: `Q_1 = ${fmt(f.q1)},\\ Q_3 = ${fmt(f.q3)},\\ \\text{IQR} = ${fmt(f.q3.sub(f.q1))}\\quad\\Rightarrow\\quad ${fmt(fe.lo)} \\text{ and } ${fmt(fe.hi)}` },
          { text: `Values outside the fences: ${outs.map(fmt).join(', ')}.`, why: 'Anything below the lower fence or above the upper fence is an outlier.' },
        ],
        misconceptions: [],
      });
    }
    // effect of removing the outlier
    const without = xs.slice(0, -1);
    const spreadAsk = rng.bool();
    const dMean = mean(xs).sub(mean(without)).abs().toNumber();
    const dMed = median(xs).sub(median(without)).abs().toNumber();
    const dSd = Math.abs(stdDev(xs) - stdDev(without));
    const dIqr = iqr(xs).sub(iqr(without)).abs().toNumber();
    const a = spreadAsk ? dSd : dMean;
    const b = spreadAsk ? dIqr : dMed;
    if (a < 3 * b || a < 1) return genShapeOutliers.generate(rng, 3);
    const correct = spreadAsk ? 'The standard deviation changes much more than the IQR.' : 'The mean changes much more than the median.';
    return makeProblem({
      skillId: 'S7.04',
      tags: ['real-world', 'multi-step'],
      prompt: [p(`The ${c.what} for ${n} ${c.who} are shown. The value $${out}$ is an outlier. If it is removed, which statement is true?`), dataBlock(xs)],
      answer: makeChoice(rng, correct, spreadAsk ? ['The IQR changes much more than the standard deviation.', 'Neither the standard deviation nor the IQR changes.', 'Both change by the same amount.'] : ['The median changes much more than the mean.', 'Neither the mean nor the median changes.', 'Both change by the same amount.']),
      hints: [spreadAsk ? 'The standard deviation uses every value’s distance from the mean.' : 'The mean uses every value.', spreadAsk ? 'The IQR uses only the middle half of the data.' : 'The median uses only the middle of the ordered data.', 'An outlier is far from the rest.', 'Which measure is resistant to outliers?'],
      solution: [
        { text: spreadAsk ? 'Compare the standard deviation and the IQR with and without the outlier.' : 'Compare the mean and the median with and without the outlier.', tex: spreadAsk ? `\\sigma: ${stdDev(xs).toFixed(1)} \\to ${stdDev(without).toFixed(1)},\\quad \\text{IQR}: ${fmt(iqr(xs))} \\to ${fmt(iqr(without))}` : `\\text{mean}: ${mean(xs).round(1).toDecimalString(1)} \\to ${mean(without).round(1).toDecimalString(1)},\\quad \\text{median}: ${fmt(median(xs))} \\to ${fmt(median(without))}` },
        { text: correct, why: spreadAsk ? 'The IQR depends only on the middle half, so it is resistant to outliers.' : 'The median depends only on the middle, so it is resistant to outliers.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const plot = pr.prompt.find((b) => b.t === 'dataplot');
    if (plot && plot.t === 'dataplot') {
      let counts: number[];
      let xs: Rational[];
      if (plot.spec.kind === 'histogram') {
        counts = plot.spec.bins.map((b) => b.count);
        xs = plot.spec.bins.flatMap((b) => Array.from({ length: b.count }, () => Q(b.from).add(Q(b.to)).div(2)));
      } else if (plot.spec.kind === 'dot') {
        xs = R(plot.spec.values);
        const uniq = [...new Set(plot.spec.values)].sort((p2, q) => p2 - q);
        counts = uniq.map((u) => plot.spec.kind === 'dot' ? plot.spec.values.filter((v) => v === u).length : 0);
      } else return ['unexpected plot'];
      const label = pr.answer.kind === 'choice' ? choiceLabel(pr.answer) : '';
      // third central moment decides the direction of skew
      const m = vMean(xs);
      const m3 = vMean(xs.map((x) => x.sub(m).mul(x.sub(m)).mul(x.sub(m))));
      const sym = counts.every((k, i) => k === counts[counts.length - 1 - i]);
      if (/What is the shape/.test(text)) return label === (sym ? 'Symmetric' : m3.sign() > 0 ? 'Skewed right' : 'Skewed left') ? [] : ['shape wrong'];
      const md = vMedian(xs);
      return label === (m.gt(md) ? 'The mean is greater than the median.' : m.lt(md) ? 'The mean is less than the median.' : 'The mean and the median are equal.') ? [] : ['mean vs median wrong'];
    }
    const xs = dataOf(pr);
    if (!xs) return ['cannot read data'];
    const [q1, , q3] = vQuartiles(xs);
    const k = q3.sub(q1);
    const lo = q1.sub(k.mul(Q(3, 2)));
    const hi = q3.add(k.mul(Q(3, 2)));
    if (/upper fence/.test(text)) return checkNumber(pr, hi);
    if (/lower fence/.test(text)) return checkNumber(pr, lo);
    const outs = vSort(xs).filter((x) => x.lt(lo) || x.gt(hi));
    if (/Which values are outliers/.test(text)) {
      const want = outs.length === 1 ? `Only ${numStr(outs[0])}` : outs.map(numStr).join(' and ');
      return pr.answer.kind === 'choice' && choiceLabel(pr.answer) === want ? [] : ['outlier choice wrong'];
    }
    const out = Rational.parse(/The value \$([\d.-]+)\$ is an outlier/.exec(text)![1]);
    if (!outs.some((o) => o.eq(out))) return ['stated value is not an outlier'];
    const idx = xs.findIndex((x) => x.eq(out));
    const without = xs.filter((_, i) => i !== idx);
    const label = pr.answer.kind === 'choice' ? choiceLabel(pr.answer) : '';
    if (/standard deviation changes much more/.test(label)) {
      const [a1, , a3] = vQuartiles(without);
      return Math.abs(Math.sqrt(vVar(xs).toNumber()) - Math.sqrt(vVar(without).toNumber())) > 3 * Math.abs(k.sub(a3.sub(a1)).toNumber()) ? [] : ['spread effect wrong'];
    }
    if (/mean changes much more/.test(label)) return vMean(xs).sub(vMean(without)).abs().gt(vMedian(xs).sub(vMedian(without)).abs().mul(3)) ? [] : ['center effect wrong'];
    return ['unexpected answer'];
  },
};

// ---------------------------------------------------------------------------
// S7.05: comparing distributions
// ---------------------------------------------------------------------------

const GROUPS = [
  { a: 'Team A', b: 'Team B', what: 'points scored per game', more: 'scored more points', unit: 'points', lo: 8, hi: 40 },
  { a: '9th graders', b: '10th graders', what: 'minutes spent on homework each night', more: 'spent more time on homework', unit: 'minutes', lo: 10, hi: 90 },
  { a: 'Phone X', b: 'Phone Y', what: 'hours of battery life in tests', more: 'had longer battery life', unit: 'hours', lo: 8, hi: 30 },
  { a: 'Store 1', b: 'Store 2', what: 'daily sales of a video game', more: 'sold more copies', unit: 'copies', lo: 5, hi: 45 },
  { a: 'Class 1', b: 'Class 2', what: 'scores on the same quiz', more: 'scored higher', unit: 'points', lo: 50, hi: 100 },
];


// ---------- comparing with mean and standard deviation, and three box plots (A.DSR.10.1) ----------
/** Group names like "9th graders" are plural. */
const plural = (who: string) => /s$/.test(who);
const has = (who: string) => (plural(who) ? 'have' : 'has');
const is = (who: string) => (plural(who) ? 'are' : 'is');
const poss = (who: string) => (plural(who) ? `${who}'` : `${who}'s`);
const centerPhrase = (ma: number, mb: number, a: string, b: string) => (ma === mb ? `${a} and ${b} have the same mean` : `${ma > mb ? a : b} ${has(ma > mb ? a : b)} the greater mean`);
const spreadPhrase = (who: string) => `${who} ${is(who)} more consistent (smaller standard deviation)`;

function summaryCompare(rng: Rng) {
  const g = rng.pick(GROUPS);
  const ma = rng.int(g.lo + 8, g.hi - 8);
  const mb = rng.bool() ? ma : ma + rng.nonzeroInt(-6, 6);
  const span = g.hi - g.lo;
  const sds = rng.shuffle(pickTwo(rng, 2, Math.max(6, Math.round(span / 5))));
  const [sa, sb] = sds;
  const tight = sa < sb ? g.a : g.b;
  const loose = sa < sb ? g.b : g.a;
  const center = centerPhrase(ma, mb, g.a, g.b);
  const correct = `${center}, and ${spreadPhrase(tight)}.`;
  const wrongCenter = ma === mb ? `${((w: string) => `${w} ${has(w)}`)(rng.pick([g.a, g.b]))} the greater mean` : rng.bool() ? `${g.a} and ${g.b} have the same mean` : `${ma > mb ? g.b : g.a} ${has(ma > mb ? g.b : g.a)} the greater mean`;
  return makeProblem({
    skillId: 'S7.05',
    tags: ['real-world'],
    prompt: [
      p(`The table summarizes the ${g.what} for ${g.a} and ${g.b} (in ${g.unit}). Both distributions are roughly symmetric with no outliers. Which conclusion is supported by the summaries?`),
      { t: 'table', headers: ['Group', 'Mean', 'Standard deviation'], rows: [[g.a, String(ma), String(sa)], [g.b, String(mb), String(sb)]] },
    ],
    answer: makeChoice(rng, correct, [`${center}, and ${loose} ${is(loose)} more consistent (larger standard deviation).`, `${wrongCenter}, and ${spreadPhrase(tight)}.`, `${loose} ${has(loose)} the greater mean, because ${plural(loose) ? 'their' : 'its'} standard deviation is larger.`]),
    hints: ['Compare centers with the means.', 'Compare spreads with the standard deviations.', 'A smaller standard deviation means the values stay closer to the mean.', 'Values that stay close together are more consistent.'],
    solution: [
      { text: 'Compare the means.', tex: `${ma} \\text{ vs } ${mb}`, why: ma === mb ? 'The means are equal, so the typical values are the same.' : 'The greater mean is the higher typical value.' },
      { text: 'Compare the standard deviations.', tex: `${sa} \\text{ vs } ${sb}`, why: 'The standard deviation is a typical distance from the mean.' },
      { text: correct, why: `${poss(tight)} values are typically only ${Math.min(sa, sb)} ${g.unit} from the mean, while ${poss(loose)} are typically ${Math.max(sa, sb)} ${g.unit} away.` },
    ],
    misconceptions: [],
  });
}
function pickTwo(rng: Rng, lo: number, hi: number): [number, number] {
  const a = rng.int(lo, hi);
  let b = rng.int(lo, hi);
  while (b === a) b = rng.int(lo, hi);
  return [a, b];
}

const THREE = [
  { names: ['Period 1', 'Period 2', 'Period 3'], what: 'quiz scores (out of 100)', lo: 30, hi: 100 },
  { names: ['Store A', 'Store B', 'Store C'], what: 'daily sales of a video game', lo: 0, hi: 90 },
  { names: ['Team 1', 'Team 2', 'Team 3'], what: 'minutes of practice per day', lo: 10, hi: 120 },
];
function threeBoxes(rng: Rng) {
  for (let t = 0; t < 500; t++) {
    const g = rng.pick(THREE);
    const boxes = g.names.map((label) => {
      const med = 5 * rng.int(Math.ceil((g.lo + 25) / 5), Math.floor((g.hi - 25) / 5));
      const q1 = med - 5 * rng.int(1, 4);
      const q3 = med + 5 * rng.int(1, 4);
      return { label, min: q1 - 5 * rng.int(1, 4), q1, median: med, q3, max: q3 + 5 * rng.int(1, 4) };
    });
    const iqrs = boxes.map((b) => b.q3 - b.q1);
    const ranges = boxes.map((b) => b.max - b.min);
    const best = iqrs.indexOf(Math.max(...iqrs));
    if (iqrs.filter((v) => v === iqrs[best]).length > 1) continue;
    // the widest overall spread belongs to a different group, so the whiskers are a trap
    const wide = ranges.indexOf(Math.max(...ranges));
    if (ranges.filter((v) => v === ranges[wide]).length > 1 || wide === best) continue;
    const lo = Math.min(...boxes.map((b) => b.min));
    const hi = Math.max(...boxes.map((b) => b.max));
    if (lo < g.lo || hi > g.hi) continue;
    const ax = axisFor(lo, hi);
    if (!boxReadable(boxes, ax)) continue;
    const correct = g.names[best];
    return makeProblem({
      skillId: 'S7.05',
      tags: ['graph', 'real-world'],
      prompt: [p(`The box plots compare the ${g.what} for three groups. Which group has the greatest interquartile range (IQR)?`), { t: 'dataplot', spec: { kind: 'box', ...ax, axisLabel: g.what, boxes, ariaLabel: `Three box plots. ${boxes.map((b) => `${b.label}: ${b.min}, ${b.q1}, ${b.median}, ${b.q3}, ${b.max}`).join('. ')}.` } }],
      answer: makeChoice(rng, correct, [...g.names.filter((x) => x !== correct), 'They all have the same IQR']),
      hints: ['The IQR is $Q_3 - Q_1$: the width of the box.', 'Do not use the whiskers. They show the whole range, not the middle half.', 'Read $Q_1$ and $Q_3$ for each group from the axis.', 'Subtract for each group and compare.'],
      solution: [
        { text: 'Find each IQR.', tex: boxes.map((b) => `\\text{${b.label}: } ${b.q3} - ${b.q1} = ${b.q3 - b.q1}`).join(',\\quad '), why: 'The IQR is the spread of the middle half of the data.' },
        { text: `${correct} has the greatest IQR.`, why: `${g.names[wide]} has the longest whiskers (the greatest range), but its box is narrower. Range and IQR measure different spreads.` },
      ],
      misconceptions: [],
    });
  }
  throw new Error('threeBoxes');
}

export const genCompare: GeneratorDef = {
  id: 'u7.compare',
  skillId: 'S7.05',
  description: 'Compare the center and spread of two groups from box plots, dot plots and summaries, choosing appropriate measures.',
  generate(rng, difficulty) {
    if (difficulty === 2 && rng.int(0, 2) === 0) return summaryCompare(rng);
    if (difficulty === 3) {
      const k = rng.int(0, 2);
      if (k === 0) return threeBoxes(rng);
      if (k === 1) return summaryCompare(rng);
    }
    const g = rng.pick(GROUPS);
    // halves of odd size give whole-number quartiles; a narrow window keeps every value on a labeled tick
    const n = rng.pick([7, 11, 15]);
    const base = rng.int(g.lo + 6, g.hi - 14);
    const A = randomData(rng, n, base, base + 8);
    const shiftB = rng.nonzeroInt(-3, 3);
    const spreadB = rng.pick([0.5, 1, 1.5]);
    const centerA = base + 4;
    const B = A.map((x) => Q(Math.round(centerA + (x.toNumber() - centerA) * spreadB + shiftB)));
    if ([...A, ...B].some((x) => x.lt(g.lo) || x.gt(g.hi))) return genCompare.generate(rng, difficulty);
    const fa = fiveNumber(A);
    const fb = fiveNumber(B);
    const ia = fa.q3.sub(fa.q1);
    const ib = fb.q3.sub(fb.q1);
    if (fa.median.eq(fb.median) || ia.eq(ib)) return genCompare.generate(rng, difficulty);
    if ([fa, fb].some((f) => f.min.eq(f.q1) || f.q1.eq(f.median) || f.median.eq(f.q3) || f.q3.eq(f.max))) return genCompare.generate(rng, difficulty);
    if (outliers(A).length || outliers(B).length) return genCompare.generate(rng, difficulty);
    const lo = Math.min(fa.min.toNumber(), fb.min.toNumber());
    const hi = Math.max(fa.max.toNumber(), fb.max.toNumber());
    const ax = axisFor(lo, hi);
    if (!boxReadable([boxOf(A), boxOf(B)], ax)) return genCompare.generate(rng, difficulty);
    const plot: Block = { t: 'dataplot', spec: { kind: 'box', ...ax, axisLabel: g.what, boxes: [boxOf(A, g.a), boxOf(B, g.b)], ariaLabel: `Two box plots. ${g.a}: ${[fa.min, fa.q1, fa.median, fa.q3, fa.max].map(fmt).join(', ')}. ${g.b}: ${[fb.min, fb.q1, fb.median, fb.q3, fb.max].map(fmt).join(', ')}.` } };
    const higher = fa.median.gt(fb.median) ? g.a : g.b;
    const wider = ia.gt(ib) ? g.a : g.b;
    const other = (x: string) => (x === g.a ? g.b : g.a);
    if (difficulty === 1) {
      const kind = rng.pick(['median', 'iqr', 'diff'] as const);
      if (kind === 'diff') {
        const d = fa.median.sub(fb.median).abs();
        return makeProblem({
          skillId: 'S7.05',
          tags: ['graph', 'real-world'],
          prompt: [p(`The box plots compare the ${g.what} for ${g.a} and ${g.b}. How much greater is the higher median than the lower median?`), plot],
          answer: { kind: 'number', value: numStr(d), unit: g.unit },
          hints: ['The median is the line inside each box.', `Read the median of ${g.a}.`, `Read the median of ${g.b}.`, 'Subtract the smaller from the larger.'],
          solution: [{ text: 'Read the medians.', tex: `${fmt(fa.median)} \\text{ and } ${fmt(fb.median)}` }, { text: 'Subtract.', tex: `${fmt(fa.median.gt(fb.median) ? fa.median : fb.median)} - ${fmt(fa.median.gt(fb.median) ? fb.median : fa.median)} = ${fmt(d)}`, why: 'The difference of the medians compares typical values.' }],
          misconceptions: numberMisconceptions(d, [{ value: fa.max.sub(fb.max).abs(), tag: 'graph-reading', feedback: 'Use the medians (the lines inside the boxes), not the maximums.' }]),
        });
      }
      const correct = kind === 'median' ? higher : wider;
      return makeProblem({
        skillId: 'S7.05',
        tags: ['graph', 'real-world'],
        prompt: [p(`The box plots compare the ${g.what} for ${g.a} and ${g.b}. Which group has the greater ${kind === 'median' ? 'median' : 'interquartile range (IQR)'}?`), plot],
        answer: makeChoice(rng, correct, [other(correct), 'They are the same']),
        hints: [kind === 'median' ? 'The median is the line inside each box.' : 'The IQR is the width of each box.', 'Read the values from the axis.', 'Compare the two values.', kind === 'median' ? 'A greater median means a higher typical value.' : 'A wider box means more spread in the middle half.'],
        solution: [
          { text: kind === 'median' ? 'Read the medians.' : 'Find each IQR.', tex: kind === 'median' ? `\\text{${g.a}: } ${fmt(fa.median)},\\quad \\text{${g.b}: } ${fmt(fb.median)}` : `${fmt(fa.q3)} - ${fmt(fa.q1)} = ${fmt(ia)},\\quad ${fmt(fb.q3)} - ${fmt(fb.q1)} = ${fmt(ib)}` },
          { text: `${correct} has the greater ${kind === 'median' ? 'median' : 'IQR'}.` },
        ],
        misconceptions: [],
      });
    }
    if (difficulty === 2) {
      if (rng.bool()) {
        const correct = `${ia.lt(ib) ? g.a : g.b}, because its IQR is smaller`;
        return makeProblem({
          skillId: 'S7.05',
          tags: ['graph', 'real-world'],
          prompt: [p(`The box plots compare the ${g.what} for ${g.a} and ${g.b}. Which group is more consistent?`), plot],
          answer: makeChoice(rng, correct, [`${ia.lt(ib) ? g.b : g.a}, because its IQR is larger`, `${higher}, because its median is greater`, `${other(higher)}, because its median is smaller`]),
          hints: ['Consistent means the values are close together.', 'Compare the spreads, not the centers.', 'The IQR is the width of the box.', 'A smaller IQR means more consistent.'],
          solution: [{ text: 'Find each IQR.', tex: `${fmt(ia)} \\text{ and } ${fmt(ib)}` }, { text: correct + '.', why: 'Less spread means the values are more consistent.' }],
          misconceptions: [],
        });
      }
      // measures: one group has an outlier
      const withOut = rng.bool();
      const top = Math.max(...A.map((x) => x.toNumber()));
      const A2 = withOut ? [...A.slice(0, -1), Q(top + 3 * (fa.q3.sub(fa.q1).toNumber() + 2))] : A;
      const correct = withOut ? 'Median and IQR, because one group has an outlier' : 'Mean and standard deviation, because both groups are roughly symmetric with no outliers';
      const symA = R([10, 12, 13, 14, 14, 15, 16, 18]);
      void symA;
      if (!withOut) {
        // two symmetric dot plots
        const base = [-3, -2, -1, -1, 0, 0, 0, 1, 1, 2, 3];
        const ca = rng.int(g.lo + 11, g.hi - 11);
        const cb = ca + rng.nonzeroInt(-4, 4);
        const va = base.map((d) => ca + d);
        const kb = rng.pick([1, 2]);
        const vb = base.map((d) => cb + d * kb);
        const mn = Math.min(...va, ...vb) - 1;
        const mx = Math.max(...va, ...vb) + 1;
        return makeProblem({
          skillId: 'S7.05',
          tags: ['graph', 'real-world'],
          prompt: [p(`The dot plots show the ${g.what} for ${g.a} and ${g.b}. Which measures of center and spread are best for comparing the two groups?`), { t: 'dataplot', spec: { kind: 'dot', min: mn, max: mx, axisLabel: g.a, values: va, ariaLabel: `Dot plot for ${g.a}: ${va.join(', ')}` } }, { t: 'dataplot', spec: { kind: 'dot', min: mn, max: mx, axisLabel: g.b, values: vb, ariaLabel: `Dot plot for ${g.b}: ${vb.join(', ')}` } }],
          answer: makeChoice(rng, correct, ['Median and IQR, because one group has an outlier', 'Mean and IQR, because the groups have different sizes', 'Median and standard deviation, because the data are skewed']),
          hints: ['Look at the shape of each dot plot.', 'Check for outliers.', 'Symmetric data with no outliers: mean and standard deviation.', 'Skewed data or outliers: median and IQR.'],
          solution: [{ text: 'Both dot plots are symmetric with no outliers.' }, { text: correct + '.', why: 'The mean and standard deviation use every value and work well when nothing extreme pulls them.' }],
          misconceptions: [],
        });
      }
      const fa2 = fiveNumber(A2);
      const oa = outliers(A2);
      if (oa.length !== 1 || oa[0].gt(g.hi)) return genCompare.generate(rng, 2);
      const box2: DataPlotSpec = { kind: 'box', ...axisFor(Math.min(fa2.min.toNumber(), fb.min.toNumber()), Math.max(fa2.max.toNumber(), fb.max.toNumber())), axisLabel: g.what, boxes: [{ ...boxOf(A2, g.a), max: Math.max(...A2.filter((x) => !oa.some((o) => o.eq(x))).map((x) => x.toNumber())), outliers: oa.map((x) => x.toNumber()) }, boxOf(B, g.b)], ariaLabel: `Two box plots. ${g.a} has an outlier at ${oa.map(fmt).join(', ')}.` };
      return makeProblem({
        skillId: 'S7.05',
        tags: ['graph', 'real-world'],
        prompt: [p(`The box plots compare the ${g.what} for ${g.a} and ${g.b}. The dot is an outlier. Which measures of center and spread are best for comparing the two groups?`), { t: 'dataplot', spec: box2 }],
        answer: makeChoice(rng, correct, ['Mean and standard deviation, because both groups are roughly symmetric with no outliers', 'Mean and IQR, because the groups have different sizes', 'Median and standard deviation, because the median ignores outliers']),
        hints: ['Check each plot for outliers or a long tail.', 'Outliers pull the mean and the standard deviation.', 'The median and IQR are resistant to outliers.', 'Use the same pair of measures for both groups.'],
        solution: [{ text: `${g.a} has an outlier.` }, { text: correct + '.', why: 'The median and IQR are not pulled by extreme values, so they describe both groups fairly.' }],
        misconceptions: [],
      });
    }
    // full comparison
    const fact = (h: string, w: string) => `${h} typically ${g.more} (greater median), and ${w} had more variability (greater IQR).`;
    const correct = fact(higher, wider);
    return makeProblem({
      skillId: 'S7.05',
      tags: ['graph', 'real-world', 'multi-step'],
      prompt: [p(`The box plots compare the ${g.what} for ${g.a} and ${g.b}. Which conclusion is supported by the box plots?`), plot],
      answer: makeChoice(rng, correct, [fact(other(higher), wider), fact(higher, other(wider)), 'The groups cannot be compared, because their box plots overlap.']),
      hints: ['Compare centers with the medians.', 'Compare spreads with the IQRs.', 'A full comparison talks about center and spread.', 'One extreme value does not describe a whole group.'],
      solution: [
        { text: 'Compare the medians.', tex: `${fmt(fa.median)} \\text{ vs } ${fmt(fb.median)}` },
        { text: 'Compare the IQRs.', tex: `${fmt(ia)} \\text{ vs } ${fmt(ib)}` },
        { text: correct, why: 'A comparison of distributions should describe both the typical value and the variability.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const plots = pr.prompt.filter((b) => b.t === 'dataplot');
    const label = pr.answer.kind === 'choice' ? choiceLabel(pr.answer) : '';
    if (plots.length === 2) {
      const sets = plots.map((x) => (x.t === 'dataplot' && x.spec.kind === 'dot' ? R(x.spec.values) : []));
      // outlier check by the 1.5 IQR rule, and symmetry by the third moment
      for (const xs of sets) {
        const [q1, , q3] = vQuartiles(xs);
        const k = q3.sub(q1).mul(Q(3, 2));
        if (xs.some((x) => x.lt(q1.sub(k)) || x.gt(q3.add(k)))) return ['dot plot has outliers'];
        const m = vMean(xs);
        if (!vMean(xs.map((x) => x.sub(m).mul(x.sub(m)).mul(x.sub(m)))).isZero()) return ['dot plot not symmetric'];
      }
      return label.startsWith('Mean and standard deviation') ? [] : ['measures wrong'];
    }
    const table = pr.prompt.find((x) => x.t === 'table');
    if (table && table.t === 'table' && table.headers[2] === 'Standard deviation') {
      const [ra, rb] = table.rows;
      const [ma, sa, mb, sb] = [Number(ra[1]), Number(ra[2]), Number(rb[1]), Number(rb[2])];
      if (sa === sb) return ['standard deviations tie'];
      const centerOk = ma === mb ? label.startsWith(`${ra[0]} and ${rb[0]} have the same mean,`) : label.startsWith(`${ma > mb ? ra[0] : rb[0]} ${/s$/.test(ma > mb ? ra[0] : rb[0]) ? 'have' : 'has'} the greater mean,`);
      return centerOk && label.endsWith(`and ${sa < sb ? ra[0] : rb[0]} ${/s$/.test(sa < sb ? ra[0] : rb[0]) ? 'are' : 'is'} more consistent (smaller standard deviation).`) ? [] : ['summary conclusion wrong'];
    }
    const plot = plots[0];
    if (!plot || plot.t !== 'dataplot' || plot.spec.kind !== 'box') return ['no box plot'];
    if (plot.spec.boxes.length === 3) {
      if (!boxReadable(plot.spec.boxes, { ...plot.spec, step: plot.spec.step ?? 1 })) return ['box plot values are not on labeled ticks'];
      const iq = plot.spec.boxes.map((x) => x.q3 - x.q1);
      const top = Math.max(...iq);
      if (iq.filter((v) => v === top).length !== 1) return ['IQR tie'];
      return label === plot.spec.boxes[iq.indexOf(top)].label ? [] : ['greatest IQR wrong'];
    }
    const [a, b] = plot.spec.boxes;
    if (/The dot is an outlier/.test(text)) {
      if (!(a.outliers ?? []).length) return ['no outlier drawn'];
      return label.startsWith('Median and IQR') ? [] : ['measures wrong'];
    }
    if (!boxReadable([a, b], { ...plot.spec, step: plot.spec.step ?? 1 })) return ['box plot values are not on labeled ticks'];
    const name = (x: typeof a) => x.label!;
    const higher = a.median > b.median ? name(a) : name(b);
    const wider = a.q3 - a.q1 > b.q3 - b.q1 ? name(a) : name(b);
    const tighter = wider === name(a) ? name(b) : name(a);
    if (/How much greater/.test(text)) return checkNumber(pr, Math.abs(a.median - b.median));
    if (/greater median\?/.test(text)) return label === higher ? [] : ['median comparison wrong'];
    if (/greater interquartile/.test(text)) return label === wider ? [] : ['IQR comparison wrong'];
    if (/more consistent/.test(text)) return label === `${tighter}, because its IQR is smaller` ? [] : ['consistency wrong'];
    if (/conclusion/.test(text)) return label.startsWith(`${higher} typically`) && label.includes(`and ${wider} had more variability`) ? [] : ['conclusion wrong'];
    return ['unknown question'];
  },
};

void iqr;
export const U7_DATA_GENERATORS: GeneratorDef[] = [genCenter, genQuartiles, genStdDev, genShapeOutliers, genCompare];
