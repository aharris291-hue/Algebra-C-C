/**
 * Unit 7 generators for two-variable data: scatter plots and association (S7.06), linear models in
 * context (S7.07), lines of best fit and correlation (S7.08), choosing a model (S7.09) and
 * correlation versus causation (S7.10).
 *
 * Data are generated from a line (or curve) plus noise and kept only when the correlation lands
 * clearly inside the intended band (strong |r| >= 0.85, moderate 0.55-0.75, weak 0.2-0.42, none < 0.15),
 * so the course cutoffs (0.8 and 0.5) are never borderline. Regression output is computed exactly
 * from the plotted points with stats.ts and shown rounded, as technology would show it; verify()
 * re-reads the plotted points and recomputes slope, intercept and r with the raw-sum formulas.
 */
import type { GeneratorDef, Rng, Block, GraphSpec, Problem } from '../../core/curriculum/types';
import { Rational } from '../../core/math/rational';
import { linearRegression, rats } from '../../core/math/stats';
import { p, makeProblem, makeChoice, choiceLabel, numStr, Q, numberMisconceptions } from './util';
import { numStep, choiceStep, finalStep, withSteps, expectSteps, stepLabel, addStepChecks, type H4 } from './u7-steps';

// ---------- independent routines used by verify() ----------
type Pt = { x: number; y: number };
function sums(pts: Pt[]) {
  const xs = rats(pts.map((q) => String(q.x)));
  const ys = rats(pts.map((q) => String(q.y)));
  const z = Q(0);
  const sx = xs.reduce((a, b) => a.add(b), z);
  const sy = ys.reduce((a, b) => a.add(b), z);
  const sxx = xs.reduce((a, b) => a.add(b.mul(b)), z);
  const syy = ys.reduce((a, b) => a.add(b.mul(b)), z);
  const sxy = xs.reduce((a, b, i) => a.add(b.mul(ys[i])), z);
  return { n: pts.length, sx, sy, sxx, syy, sxy };
}
/** Slope and intercept from the normal equations n·Σxy − ΣxΣy over n·Σx² − (Σx)². */
function vLine(pts: Pt[]): { a: Rational; b: Rational } {
  const s = sums(pts);
  const a = s.sxy.mul(s.n).sub(s.sx.mul(s.sy)).div(s.sxx.mul(s.n).sub(s.sx.mul(s.sx)));
  return { a, b: s.sy.sub(a.mul(s.sx)).div(s.n) };
}
function vR(pts: Pt[]): number {
  const s = sums(pts);
  const num = s.sxy.mul(s.n).sub(s.sx.mul(s.sy)).toNumber();
  const den = Math.sqrt(s.sxx.mul(s.n).sub(s.sx.mul(s.sx)).toNumber() * s.syy.mul(s.n).sub(s.sy.mul(s.sy)).toNumber());
  return den === 0 ? 0 : num / den;
}
function scatterOf(pr: Pick<Problem, 'prompt'>): Pt[] | null {
  for (const b of pr.prompt) if (b.t === 'graph' && b.spec.scatter) return b.spec.scatter;
  for (const b of pr.prompt) if (b.t === 'table' && b.headers[0] === 'x') return b.rows.map((r) => ({ x: Number(r[0]), y: Number(r[1]) }));
  return null;
}
const textAll = (pr: Pick<Problem, 'prompt'>) => pr.prompt.map((b) => (b.t === 'p' ? b.text : b.t === 'math' ? b.tex : '')).join(' ');
const labelOf = (pr: Problem) => (pr.answer.kind === 'choice' ? choiceLabel(pr.answer) : '');
const strengthWord = (r: number) => (Math.abs(r) >= 0.8 ? 'Strong' : Math.abs(r) >= 0.5 ? 'Moderate' : 'Weak');

// ---------- data contexts ----------
interface SCtx {
  xLabel: string;
  yLabel: string;
  xName: string;
  yName: string;
  xLo: number;
  xHi: number;
  m: number;
  b: number;
  dec: 0 | 1;
  yLo: number;
  yHi: number;
  /** the y quantity is a plural noun ("sales tend") */
  plural?: boolean;
}
const SC: SCtx[] = [
  { xLabel: 'Hours studied', yLabel: 'Test score (points)', xName: 'the number of hours studied', yName: 'the test score', xLo: 0, xHi: 10, m: 4, b: 58, dec: 0, yLo: 30, yHi: 100 },
  { xLabel: 'Temperature (°F)', yLabel: 'Ice cream sales ($)', xName: 'the temperature', yName: 'ice cream sales', xLo: 60, xHi: 100, m: 10, b: -350, dec: 0, yLo: 50, yHi: 900, plural: true },
  { xLabel: 'Age of car (years)', yLabel: 'Value (thousands of $)', xName: 'the age of the car', yName: 'the value of the car', xLo: 1, xHi: 11, m: -2.2, b: 30, dec: 1, yLo: 1, yHi: 40 },
  { xLabel: 'Phone use (hours per day)', yLabel: 'Sleep (hours)', xName: 'daily phone use', yName: 'hours of sleep', xLo: 1, xHi: 8, m: -0.4, b: 9.4, dec: 1, yLo: 4, yHi: 11, plural: true },
  { xLabel: 'Distance from school (miles)', yLabel: 'Commute time (minutes)', xName: 'the distance from school', yName: 'the commute time', xLo: 1, xHi: 15, m: 2.4, b: 6, dec: 0, yLo: 2, yHi: 60 },
  { xLabel: 'Arm span (cm)', yLabel: 'Height (cm)', xName: 'arm span', yName: 'height', xLo: 145, xHi: 190, m: 0.9, b: 17, dec: 0, yLo: 130, yHi: 200 },
  { xLabel: 'Battery age (months)', yLabel: 'Battery health (%)', xName: 'the age of the battery', yName: 'battery health', xLo: 1, xHi: 24, m: -0.9, b: 99, dec: 0, yLo: 50, yHi: 100 },
];
/** Contexts where the two variables have no real connection. */
const NONE: SCtx[] = [
  { xLabel: 'Jersey number', yLabel: 'Points per game', xName: 'jersey number', yName: 'points per game', xLo: 0, xHi: 50, m: 0, b: 12, dec: 0, yLo: 0, yHi: 30 },
  { xLabel: 'Shoe size', yLabel: 'Math test score', xName: 'shoe size', yName: 'math test score', xLo: 5, xHi: 13, m: 0, b: 76, dec: 0, yLo: 40, yHi: 100 },
  { xLabel: 'Day of the month born', yLabel: 'Sleep last night (hours)', xName: 'the day of the month a student was born', yName: 'hours of sleep', xLo: 1, xHi: 31, m: 0, b: 7.5, dec: 1, yLo: 4, yHi: 11, plural: true },
];
const NONE_SPREAD: Record<string, number> = { 'Jersey number': 14, 'Shoe size': 36, 'Day of the month born': 4 };

type Band = 'strong' | 'moderate' | 'weak' | 'none';
const inBand = (r: number, band: Band) => {
  const a = Math.abs(r);
  return band === 'strong' ? a >= 0.85 && a < 0.995 : band === 'moderate' ? a >= 0.55 && a <= 0.75 : band === 'weak' ? a >= 0.2 && a <= 0.42 : a < 0.15;
};
const NOISE: Record<Band, number[]> = { strong: [0.1, 0.18], moderate: [0.35, 0.5], weak: [0.6, 0.9], none: [0.5, 0.5] };

function makeData(rng: Rng, c: SCtx, band: Band): Pt[] {
  const scale = 10 ** c.dec;
  for (let tries = 0; tries < 400; tries++) {
    const n = rng.int(10, 14);
    const span = c.m === 0 ? NONE_SPREAD[c.xLabel] : Math.abs(c.m) * (c.xHi - c.xLo);
    const [lo, hi] = NOISE[band];
    const amp = span * (lo + (hi - lo) * rng.next());
    const pts: Pt[] = [];
    for (let i = 0; i < n; i++) {
      const x = rng.int(c.xLo, c.xHi);
      const y = Math.round((c.m * x + c.b + (rng.next() * 2 - 1) * amp) * scale) / scale;
      pts.push({ x, y });
    }
    if (pts.some((q) => q.y < c.yLo || q.y > c.yHi)) continue;
    if (new Set(pts.map((q) => q.x)).size < 5) continue;
    const r = linearRegression(rats(pts.map((q) => String(q.x))), rats(pts.map((q) => String(q.y)))).r;
    if (inBand(r, band)) return pts.sort((u, v) => u.x - v.x);
  }
  throw new Error('could not generate data in band');
}

function niceStep(span: number, cells = 10): number {
  const raw = span / cells;
  for (const s of [0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500]) if (s >= raw) return s;
  return 1000;
}
function scatterGraph(c: SCtx, pts: Pt[], line?: { m: number; b: number }, extraX?: number): GraphSpec {
  const xs = pts.map((q) => q.x).concat(extraX !== undefined ? [extraX] : []);
  let ys = pts.map((q) => q.y);
  const xStep = niceStep(Math.max(...xs) - Math.min(...xs));
  const xMin = Math.max(0, Math.floor(Math.min(...xs) / xStep) * xStep - (Math.min(...xs) <= 0 ? 0 : xStep));
  const xMax = Math.ceil(Math.max(...xs) / xStep) * xStep + xStep;
  if (line) ys = ys.concat([line.m * xMin + line.b, line.m * xMax + line.b]);
  const yStep = niceStep(Math.max(...ys) - Math.min(...ys));
  const yMin = Math.max(Math.min(...ys) < 0 ? -Infinity : 0, Math.floor(Math.min(...ys) / yStep) * yStep - yStep);
  const yMax = Math.ceil(Math.max(...ys) / yStep) * yStep + yStep;
  return {
    xMin,
    xMax,
    yMin,
    yMax,
    xStep,
    yStep,
    xLabel: c.xLabel,
    yLabel: c.yLabel,
    scatter: pts,
    ...(line ? { showLineOfFit: line } : {}),
    ariaLabel: `Scatter plot of ${c.yLabel.toLowerCase()} against ${c.xLabel.toLowerCase()} with ${pts.length} points: ${pts.map((q) => `(${q.x}, ${q.y})`).join(', ')}.`,
  };
}
const tends = (c: SCtx) => (c.plural ? 'tend' : 'tends');
const pickCtx = (rng: Rng, sign?: 1 | -1) => rng.pick(SC.filter((c) => sign === undefined || Math.sign(c.m) === sign));

// ---------------------------------------------------------------------------
// S7.06: scatter plots and association
// ---------------------------------------------------------------------------

const assocLabel = (band: Band, m: number) => (band === 'none' ? 'No association' : m > 0 ? 'Positive association' : 'Negative association');


// ---------- representing data on a scatter plot (A.DSR.10.3) ----------
/** A small table of whole-number data near the context's line. */
function smallData(rng: Rng, c: SCtx, n: number, noise: number): Pt[] | null {
  const pool = Array.from({ length: c.xHi - c.xLo + 1 }, (_, i) => c.xLo + i);
  const xs = rng.shuffle(pool).slice(0, n).sort((u, v) => u - v);
  const scale = 10 ** c.dec;
  const amp = Math.abs(c.m) * (c.xHi - c.xLo) * noise;
  const pts = xs.map((x) => ({ x, y: Math.round((c.m * x + c.b + (rng.next() * 2 - 1) * amp) * scale) / scale }));
  return pts.some((q) => q.y < c.yLo || q.y > c.yHi) ? null : pts;
}
const ptKey = (pts: Pt[]) => pts.map((q) => `${q.x},${q.y}`).sort().join(';');

function whichPlot(rng: Rng, difficulty: number) {
  for (let t = 0; t < 300; t++) {
    const c = rng.pick(SC.filter((x) => x.dec === 0));
    const n = difficulty === 1 ? 5 : 7;
    const pts = smallData(rng, c, n, 0.12);
    if (!pts) continue;
    const step0 = scatterGraph(c, pts).yStep!;
    const move = (i: number, k: number): Pt[] => pts.map((q, j) => (j === i ? { x: q.x, y: q.y + k * step0 } : q));
    const i1 = rng.int(0, n - 1);
    let i2 = rng.int(0, n - 1);
    if (i2 === i1) i2 = (i1 + 1 + rng.int(0, n - 2)) % n;
    const s1 = rng.bool() ? 1 : -1;
    // swapping the y-values of two points that are far apart in height
    const pairs: Array<[number, number]> = [];
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (Math.abs(pts[a].y - pts[b].y) >= 2 * step0) pairs.push([a, b]);
    if (!pairs.length) continue;
    const [sa, sb] = rng.pick(pairs);
    const swapped = pts.map((q, j) => (j === sa ? { x: q.x, y: pts[sb].y } : j === sb ? { x: q.x, y: pts[sa].y } : q));
    const cands = [pts, move(i1, 2 * s1), swapped, move(i2, -2 * s1)];
    if (cands.some((cd) => cd.some((q) => q.y < 0))) continue;
    if (new Set(cands.map(ptKey)).size !== 4) continue;
    const all = cands.flat();
    const win = scatterGraph(c, all);
    if (win.yStep! < step0) continue;
    const order = rng.shuffle([0, 1, 2, 3]);
    const L = ['A', 'B', 'C', 'D'];
    const graphs: Block[] = order.map((ci, i) => ({ t: 'graph', spec: { ...win, scatter: cands[ci], ariaLabel: `Graph ${L[i]}: scatter plot with points ${cands[ci].map((q) => `(${q.x}, ${q.y})`).join(', ')}.` }, caption: `Graph ${L[i]}` }));
    const correct = L[order.indexOf(0)];
    return withSteps(makeProblem({
      skillId: 'S7.06',
      tags: ['graph', 'real-world'],
      prompt: [p(`The table shows ${c.yName} and ${c.xName} for ${n} cases. Which scatter plot shows these data?`), { t: 'table', headers: [c.xLabel, c.yLabel], rows: pts.map((q) => [String(q.x), String(q.y)]) }, ...graphs],
      answer: { kind: 'choice', options: L.map((l) => ({ id: l.toLowerCase(), label: `Graph ${l}` })), correct: correct.toLowerCase() },
      hints: ['Each row of the table is one point: (x-value, y-value).', 'The first column goes on the horizontal axis and the second on the vertical axis.', 'Check every point, not just the first one: the wrong plots each have one or two points in the wrong place.', 'Use the grid to estimate each point, then compare with the table.'],
      solution: [
        { text: 'Each row of the table becomes one point.', tex: pts.map((q) => `(${q.x}, ${q.y})`).join(',\\ '), why: `$x$ is ${c.xName} (across) and $y$ is ${c.yName} (up).` },
        { text: `Check each plot point by point. Graph ${correct} has every point in the right place.`, why: 'In the other graphs, one point is too high or too low, or two y-values have been switched.' },
      ],
      misconceptions: [],
    }), (pr) => [
      choiceStep(`Which axis shows ${c.xLabel.toLowerCase()}, the first column of the table?`, 'The horizontal axis', ['The vertical axis'], ['In a pair (x, y), x comes first.', 'The first column of the table holds the x-values.', 'x-values are read across the bottom of the graph.', 'y-values are read up the side.'], `${c.xLabel} is x, so it goes across, on the horizontal axis.`, { 'The vertical axis': 'The first column is x, and x is read across the bottom, on the horizontal axis.' }, 'graph-reading'),
      numStep(`Find the row of the table whose x-value is ${pts[i1].x}. What y-value should the point above x = ${pts[i1].x} have?`, Q(pts[i1].y), ['Each row of the table is one point.', `Look down the first column for ${pts[i1].x}.`, 'Read the second number in that row.', 'That number is how high the point should be.'], `The point is $(${pts[i1].x}, ${pts[i1].y})$; one of the wrong graphs puts it somewhere else.`),
      finalStep(pr, 'Which scatter plot shows these data?', ['Check the point you just found in each graph.', 'Then check the other points the same way.', 'Cross off any graph with a point in the wrong place.', 'Only one graph has every point right.'], `Graph ${correct} has every point of the table in the right place.`, { feedback: Object.fromEntries(L.filter((l) => l !== correct).map((l) => [`Graph ${l}`, `Check Graph ${l} point by point against the table: at least one point is too high or too low, or two y-values are switched.`])), tag: 'graph-reading' }),
    ]);
  }
  throw new Error('whichPlot');
}

// ---------- line of best fit with technology (A.DSR.10.5) ----------
/** Distance of v·10^p from the nearest rounding boundary (half-integer), to avoid borderline rounding. */
const roundMargin = (v: number, places: number) => {
  const t = v * 10 ** places;
  return Math.abs(t - Math.floor(t) - 0.5);
};
function techFit(rng: Rng, difficulty: number) {
  for (let t = 0; t < 400; t++) {
    const c = pickCtx(rng);
    const n = rng.int(6, 8);
    const pts = smallData(rng, c, n, 0.1);
    if (!pts) continue;
    const reg = linearRegression(rats(pts.map((q) => String(q.x))), rats(pts.map((q) => String(q.y))));
    if (Math.abs(reg.r) < 0.85 || Math.abs(reg.r) > 0.999) continue;
    const ask = difficulty === 2 ? 'slope' : rng.pick(['intercept', 'r'] as const);
    const val = ask === 'slope' ? reg.a.toNumber() : ask === 'intercept' ? reg.b.toNumber() : reg.r;
    if (roundMargin(val, 2) < 0.05) continue;
    const exact = ask === 'slope' ? reg.a : ask === 'intercept' ? reg.b : null;
    const value = exact ? numStr(exact) : reg.r.toFixed(12);
    const shown = val.toFixed(2);
    const what = ask === 'slope' ? 'the slope $a$' : ask === 'intercept' ? 'the $y$-intercept $b$' : 'the correlation coefficient $r$';
    const twoPt = (pts[n - 1].y - pts[0].y) / (pts[n - 1].x - pts[0].x);
    return withSteps(makeProblem({
      skillId: 'S7.08',
      tags: ['real-world'],
      prompt: [
        p(`The table shows ${c.yName} ($y$) and ${c.xName} ($x$). Use the graphing tool (or Desmos or a graphing calculator) to find the line of best fit $\\hat{y} = ax + b$. What is ${what}, rounded to the nearest hundredth?`),
        { t: 'table', headers: [c.xLabel, c.yLabel], rows: pts.map((q) => [String(q.x), String(q.y)]) },
      ],
      answer: { kind: 'number', value, roundTo: 2 },
      inputHint: 'Type a number rounded to the nearest hundredth.',
      hints: ['Enter the first column as the x-values and the second column as the y-values.', 'Run a linear regression: in Desmos type y1 ~ m x1 + b under the table; on a calculator use STAT, CALC, LinReg(ax+b).', ask === 'r' ? 'Read r from the output (on a calculator, turn on Diagnostics if r is not shown).' : `Read ${ask === 'slope' ? 'the slope (a or m)' : 'the intercept (b)'} from the output.`, 'Round to two decimal places only at the end.'],
      solution: [
        { text: 'Enter the data and run a linear regression.', tex: `\\hat{y} \\approx ${reg.a.toNumber().toFixed(4)}x ${reg.b.isNegative() ? '-' : '+'} ${Math.abs(reg.b.toNumber()).toFixed(4)},\\quad r \\approx ${reg.r.toFixed(4)}`, why: 'Technology finds the least-squares line: the line that makes the sum of the squared vertical distances from the points as small as possible.' },
        { text: `Round ${what} to the nearest hundredth.`, tex: `${ask === 'slope' ? 'a' : ask === 'intercept' ? 'b' : 'r'} \\approx ${shown}` },
      ],
      misconceptions: numberMisconceptions(Rational.parse(shown), [
        { value: ask === 'slope' ? Rational.parse(twoPt.toFixed(2)) : null, tag: 'statistics-concept', feedback: 'That is the slope through the first and last points only. The line of best fit uses every point: run a linear regression.' },
        { value: ask === 'slope' ? Rational.parse(reg.b.toNumber().toFixed(2)) : ask === 'intercept' ? Rational.parse(reg.a.toNumber().toFixed(2)) : null, tag: 'statistics-concept', feedback: ask === 'slope' ? 'That is the intercept b. The slope is the number multiplied by x.' : 'That is the slope a. The intercept is the constant term b.' },
        { value: ask === 'r' ? Rational.parse((reg.r * reg.r).toFixed(2)) : null, tag: 'statistics-concept', feedback: 'That is $r^2$. Take the value labeled r.' },
      ]),
    }), (pr) => [
        choiceStep('Which regression gives the line of best fit $\\hat{y} = ax + b$?', 'Linear regression', ['Exponential regression', 'Quadratic regression'], ['The equation $\\hat{y} = ax + b$ is a line.', 'A line is a linear function.', 'On a calculator this is LinReg(ax+b).', 'In Desmos type y1 ~ m x1 + b.'], 'A line of best fit comes from a linear regression.', { 'Exponential regression': 'That fits a curve $ab^x$, not a line.', 'Quadratic regression': 'That fits a parabola, not a line.' }),
        numStep(`Enter the data and run the regression. What is ${what}, to four decimal places?`, exact ?? reg.r.toFixed(12), ['Enter the first column as x and the second as y.', 'Run the linear regression.', ask === 'r' ? 'Read r from the output (on a calculator, turn on Diagnostics if r is not shown).' : `Read ${ask === 'slope' ? 'a (the slope)' : 'b (the intercept)'} from the output.`, 'Keep four decimal places for now.'], 'Keeping extra decimal places until the end avoids rounding errors.', [], { roundTo: 4 }),
        finalStep(pr, `Round ${what} to the nearest hundredth.`, ['Look at the third decimal place.', 'If it is 5 or more, round up.', 'Otherwise keep the second decimal place as it is.', 'Use the value from the last step.'], 'Rounding only at the end keeps the answer accurate.'),
      ]);
  }
  throw new Error('techFit');
}

export const genScatter: GeneratorDef = {
  id: 'u7.scatter',
  skillId: 'S7.06',
  description: 'Describe the direction, strength and form of the association in a scatter plot and match scatter plots to correlation coefficients.',
  generate(rng, difficulty) {
    if ((difficulty === 1 && rng.int(0, 2) === 0) || (difficulty === 2 && rng.int(0, 3) === 0)) return whichPlot(rng, difficulty);
    if (difficulty === 1) {
      const kind = rng.pick(['pos', 'neg', 'none'] as const);
      const c = kind === 'none' ? rng.pick(NONE) : pickCtx(rng, kind === 'pos' ? 1 : -1);
      const band: Band = kind === 'none' ? 'none' : rng.pick(['strong', 'moderate'] as const);
      const pts = makeData(rng, c, band);
      const correct = assocLabel(band, c.m);
      return withSteps(makeProblem({
        skillId: 'S7.06',
        tags: ['graph', 'real-world'],
        prompt: [p(`The scatter plot shows ${c.yName} and ${c.xName} for a group. What kind of association does it show?`), { t: 'graph', spec: scatterGraph(c, pts) }],
        answer: makeChoice(rng, correct, ['Positive association', 'Negative association', 'No association']),
        hints: ['Read the plot from left to right.', 'If the points tend to rise, the association is positive.', 'If the points tend to fall, the association is negative.', 'If there is no upward or downward trend, there is no association.'],
        solution: [
          { text: 'Look at the overall trend from left to right.', why: correct === 'No association' ? 'The points are scattered with no upward or downward pattern.' : `As ${c.xName} increases, ${c.yName} ${tends(c)} to ${c.m > 0 ? 'increase' : 'decrease'}.` },
          { text: `${correct}.`, why: correct === 'No association' ? 'Knowing x does not help predict y.' : 'The direction of an association is the direction of the trend.' },
        ],
        misconceptions: [],
      }), (pr) => {
        const trend = kind === 'pos' ? 'They tend to rise' : kind === 'neg' ? 'They tend to fall' : 'They neither rise nor fall';
        return [
          choiceStep('Read the plot from left to right. What do the points tend to do?', trend, ['They tend to rise', 'They tend to fall', 'They neither rise nor fall'].filter((o) => o !== trend), ['Look at the whole cloud of points, not one point.', 'Compare the heights of the points on the left with those on the right.', 'Higher on the right means rising.', 'If the heights look about the same everywhere, there is no trend.'], kind === 'none' ? 'The points are scattered with no upward or downward pattern.' : `As ${c.xName} increases, ${c.yName} ${tends(c)} to ${c.m > 0 ? 'increase' : 'decrease'}.`, { 'They tend to rise': 'Compare the points on the left with those on the right again.', 'They tend to fall': 'Compare the points on the left with those on the right again.', 'They neither rise nor fall': 'There is a clear trend; check the left side against the right side.' }, 'graph-reading'),
          finalStep(pr, 'What kind of association does the scatter plot show?', ['Use your answer from the last step.', 'Rising points: positive association.', 'Falling points: negative association.', 'No trend: no association.'], 'The direction of an association is the direction of the trend.', { feedback: { 'Positive association': 'Positive means the points tend to rise from left to right.', 'Negative association': 'Negative means the points tend to fall from left to right.', 'No association': 'There is a trend, so there is an association.' } }),
        ];
      });
    }
    if (difficulty === 2) {
      const c = pickCtx(rng);
      const band = rng.pick(['strong', 'moderate', 'weak'] as const);
      const pts = makeData(rng, c, band);
      const dir = c.m > 0 ? 'positive' : 'negative';
      const other = c.m > 0 ? 'negative' : 'positive';
      const S = band[0].toUpperCase() + band.slice(1);
      const correct = `${S} ${dir} linear association`;
      const others = (['Strong', 'Moderate', 'Weak'] as const).filter((x) => x !== S);
      return withSteps(makeProblem({
        skillId: 'S7.06',
        tags: ['graph', 'real-world'],
        prompt: [p(`Describe the association between ${c.xName} and ${c.yName} shown in the scatter plot.`), { t: 'graph', spec: scatterGraph(c, pts) }],
        answer: makeChoice(rng, correct, [`${S} ${other} linear association`, `${others[0]} ${dir} linear association`, `${others[1]} ${dir} linear association`]),
        hints: ['Describe direction, strength and form.', 'Direction: do the points rise or fall from left to right?', 'Strength: how closely do the points follow a line? Tightly packed means strong; loosely spread means weak.', 'Form: do the points follow a straight-line pattern?'],
        solution: [
          { text: `Direction: ${dir}.`, why: `As ${c.xName} increases, ${c.yName} ${tends(c)} to ${c.m > 0 ? 'increase' : 'decrease'}.` },
          { text: `Strength: ${band}.`, why: band === 'strong' ? 'The points stay close to a line.' : band === 'moderate' ? 'The points follow a line, but with a fair amount of scatter.' : 'There is a slight trend, but the points are very spread out.' },
          { text: `Form: linear. So it is a ${correct.toLowerCase()}.` },
        ],
        misconceptions: [],
      }), (pr) => {
        const dirL = c.m > 0 ? 'Positive: the points tend to rise' : 'Negative: the points tend to fall';
        const ST: Record<string, string> = { Strong: 'Strong: the points stay close to a line', Moderate: 'Moderate: a clear trend, with a fair amount of scatter', Weak: 'Weak: a slight trend, with the points very spread out' };
        return [
          choiceStep('Direction: from left to right, do the points tend to rise or fall?', dirL, ['Positive: the points tend to rise', 'Negative: the points tend to fall'].filter((o) => o !== dirL), ['Look at the whole cloud of points.', 'Compare the left side with the right side.', 'Rising from left to right is positive.', 'Falling from left to right is negative.'], `As ${c.xName} increases, ${c.yName} ${tends(c)} to ${c.m > 0 ? 'increase' : 'decrease'}.`, {}, 'graph-reading'),
          choiceStep('Strength: how closely do the points follow a line?', ST[S], Object.values(ST).filter((o) => o !== ST[S]), ['Imagine a line through the middle of the points.', 'Are the points packed close to it or spread far from it?', 'Tightly packed means strong; loosely spread means weak.', 'In between is moderate.'], band === 'strong' ? 'The points stay close to a line.' : band === 'moderate' ? 'The points follow a line, but with a fair amount of scatter.' : 'There is a slight trend, but the points are very spread out.', { [ST.Strong]: 'Look again: the points are farther from a line than that.', [ST.Moderate]: 'Compare how far the points are from a line once more.', [ST.Weak]: 'Look again: the points follow a line more closely than that.' }),
          finalStep(pr, 'Describe the association: direction, strength and form.', ['Use your answers from the last two steps.', 'The points follow a straight-line pattern, so the form is linear.', 'Put the strength first, then the direction.', 'Check both words in your choice.'], 'A full description gives the direction, the strength and the form.', { feedback: { [`${S} ${other} linear association`]: 'Check the direction again.', [`${others[0]} ${dir} linear association`]: 'Check the strength again.', [`${others[1]} ${dir} linear association`]: 'Check the strength again.' } }),
        ];
      });
    }
    if (rng.bool()) {
      // match the plot to r
      const c = pickCtx(rng);
      const band = rng.pick(['strong', 'moderate', 'weak'] as const);
      const pts = makeData(rng, c, band);
      const r = linearRegression(rats(pts.map((q) => String(q.x))), rats(pts.map((q) => String(q.y)))).r;
      const shown = Math.round(r * 100) / 100;
      // distractors look like real r values too: the opposite sign, and two more at least 0.3 from r
      const picks = [-shown];
      for (let t = 0; picks.length < 3 && t < 500; t++) {
        const v = Math.round((rng.next() * 1.96 - 0.98) * 100) / 100;
        if (Math.abs(v - shown) >= 0.3 && picks.every((w) => Math.abs(w - v) >= 0.15)) picks.push(v);
      }
      const fmtR = (v: number) => `r = ${v.toFixed(2)}`;
      return withSteps(makeProblem({
        skillId: 'S7.06',
        tags: ['graph', 'real-world'],
        prompt: [p(`Which correlation coefficient best matches the scatter plot of ${c.yName} against ${c.xName}?`), { t: 'graph', spec: scatterGraph(c, pts) }],
        answer: makeChoice(rng, fmtR(shown), picks.map(fmtR)),
        hints: ['The sign of r matches the direction of the trend.', 'The closer the points are to a line, the closer r is to 1 or −1.', 'r near 0 means no linear trend.', 'Decide the sign first, then the size.'],
        solution: [
          { text: `The trend is ${c.m > 0 ? 'positive' : 'negative'}, so r is ${c.m > 0 ? 'positive' : 'negative'}.` },
          { text: `The association is ${band}, so $|r|$ is ${band === 'strong' ? 'close to 1' : band === 'moderate' ? 'between 0.5 and 0.8' : 'less than 0.5'}.`, tex: fmtR(shown) },
        ],
        misconceptions: [],
      }), (pr) => {
        // read from the plotted data (its r), not from the context's intended direction
        const signL = r > 0 ? 'Positive, because the trend rises' : 'Negative, because the trend falls';
        const sz = strengthWord(r).toLowerCase();
        const SZ: Record<string, string> = { strong: '|r| close to 1 (strong)', moderate: '|r| between 0.5 and 0.8 (moderate)', weak: '|r| less than 0.5 (weak)' };
        return [
          choiceStep('Should r be positive or negative?', signL, ['Positive, because the trend rises', 'Negative, because the trend falls'].filter((o) => o !== signL), ['The sign of r matches the direction of the trend.', 'Read the plot from left to right.', 'Rising points give a positive r.', 'Falling points give a negative r.'], 'The sign of r is the direction of the trend.', { [r > 0 ? 'Negative, because the trend falls' : 'Positive, because the trend rises']: `Read the plot from left to right again: the points tend to ${r > 0 ? 'rise' : 'fall'}.` }, 'graph-reading'),
          choiceStep('How big should |r| be?', SZ[sz], Object.values(SZ).filter((o) => o !== SZ[sz]), ['|r| measures how closely the points follow a line.', 'Points packed tightly around a line give |r| near 1.', 'Very spread-out points give |r| near 0.', 'A clear trend with some scatter is in between.'], 'The closer the points are to a line, the closer |r| is to 1.', { [SZ.strong]: 'The points are more spread out than that.', [SZ.moderate]: 'Compare how close the points are to a line once more.', [SZ.weak]: 'The points follow a line more closely than that.' }),
          finalStep(pr, 'Which correlation coefficient best matches the scatter plot?', ['Use your answers from the last two steps.', 'First keep only the choices with the right sign.', 'Then pick the one with the right size.', 'The other choices are far from the plot.'], 'Decide the sign from the direction, then the size from the strength.', { feedback: Object.fromEntries(picks.map((v) => [fmtR(v), v === -shown ? 'That has the right size but the wrong sign.' : 'Check the sign and the size of r against the plot again.'])) }),
        ];
      });
    }
    // describe in context
    const c = pickCtx(rng);
    const pts = makeData(rng, c, rng.pick(['strong', 'moderate'] as const));
    const up = c.m > 0;
    const correct = `As ${c.xName} increases, ${c.yName} ${tends(c)} to ${up ? 'increase' : 'decrease'}.`;
    return withSteps(makeProblem({
      skillId: 'S7.06',
      tags: ['graph', 'real-world'],
      prompt: [p('Which statement best describes the scatter plot in context?'), { t: 'graph', spec: scatterGraph(c, pts) }],
      answer: makeChoice(rng, correct, [`As ${c.xName} increases, ${c.yName} ${tends(c)} to ${up ? 'decrease' : 'increase'}.`, `As ${c.xName} increases, ${c.yName} always ${c.plural ? (up ? 'increase' : 'decrease') : up ? 'increases' : 'decreases'}.`, `There is no relationship between ${c.xName} and ${c.yName}.`]),
      hints: ['Look at the direction of the trend.', 'Do all the points follow the trend exactly?', 'An association describes what tends to happen.', 'Some points go against the trend, so "always" is too strong.'],
      solution: [
        { text: `The trend is ${up ? 'upward' : 'downward'} from left to right.` },
        { text: correct, why: 'The points do not all lie on a line, so the trend is what tends to happen, not what always happens.' },
      ],
      misconceptions: [],
    }), (pr) => [
      choiceStep('Read the plot from left to right. What do the points tend to do?', up ? 'They tend to rise' : 'They tend to fall', [up ? 'They tend to fall' : 'They tend to rise', 'They neither rise nor fall'], ['Look at the whole cloud of points.', 'Compare the left side with the right side.', 'Higher on the right means rising.', 'Ignore one or two points that go against the rest.'], `The trend is ${up ? 'upward' : 'downward'} from left to right.`, {}, 'graph-reading'),
      choiceStep('Do all the points follow the trend exactly?', 'No, some points go against the trend', ['Yes, every point follows the trend'], ['Look for points above or below the overall pattern.', 'Is there any pair of points where the one on the right is lower (or higher) than the trend says?', 'Real data almost always scatter.', 'An association describes what tends to happen.'], 'The points do not all lie on a line, so the trend is what tends to happen, not what always happens.', { 'Yes, every point follows the trend': 'Look again: some points are out of step with the trend.' }),
      finalStep(pr, 'Which statement best describes the scatter plot in context?', ['Use your answers from the last two steps.', 'Use the direction you found.', 'Use "tends to", because not every point follows the trend.', '"Always" is too strong for scattered data.'], 'An association says what tends to happen as x increases.', { feedback: { [`As ${c.xName} increases, ${c.yName} ${tends(c)} to ${up ? 'decrease' : 'increase'}.`]: 'Check the direction of the trend again.', [`As ${c.xName} increases, ${c.yName} always ${c.plural ? (up ? 'increase' : 'decrease') : up ? 'increases' : 'decreases'}.`]: 'Some points go against the trend, so "always" is too strong.', [`There is no relationship between ${c.xName} and ${c.yName}.`]: 'There is a clear trend, so there is a relationship.' } }),
    ]);
  },
  verify(pr) {
    const graphs = pr.prompt.filter((b): b is Extract<Block, { t: 'graph' }> => b.t === 'graph');
    if (graphs.length === 4) {
      const table = pr.prompt.find((b) => b.t === 'table');
      if (!table || table.t !== 'table' || pr.answer.kind !== 'choice') return ['cannot read'];
      const want = table.rows.map((r) => `${Number(r[0])},${Number(r[1])}`).sort().join(';');
      const hits = graphs.filter((g) => (g.spec.scatter ?? []).map((q) => `${q.x},${q.y}`).sort().join(';') === want);
      for (const g of graphs) for (const q of g.spec.scatter ?? []) if (q.x < g.spec.xMin || q.x > g.spec.xMax || q.y < g.spec.yMin || q.y > g.spec.yMax) return ['point outside the window'];
      return hits.length === 1 && hits[0].caption === choiceLabel(pr.answer) ? [] : ['plot match wrong'];
    }
    const pts = scatterOf(pr);
    if (!pts) return ['no scatter'];
    const r = vR(pts);
    const label = labelOf(pr);
    const text = textAll(pr);
    if (/What kind of association/.test(text)) return label === (Math.abs(r) < 0.2 ? 'No association' : Math.abs(r) >= 0.5 && r > 0 ? 'Positive association' : Math.abs(r) >= 0.5 ? 'Negative association' : '?') ? [] : ['direction wrong'];
    if (/Describe the association/.test(text)) return label === `${strengthWord(r)} ${r > 0 ? 'positive' : 'negative'} linear association` ? [] : ['description wrong'];
    if (/correlation coefficient best matches/.test(text)) {
      if (pr.answer.kind !== 'choice') return ['kind'];
      const vals = pr.answer.options.map((o) => Number(o.label.replace('r = ', '')));
      const best = vals.reduce((a, b) => (Math.abs(b - r) < Math.abs(a - r) ? b : a));
      if (vals.some((v) => v !== best && Math.abs(v - r) < 0.25)) return ['distractor too close'];
      return Math.abs(Number(label.replace('r = ', '')) - r) < 0.006 && Number(label.replace('r = ', '')) === best ? [] : ['r match wrong'];
    }
    if (Math.abs(r) < 0.5) return ['association too weak for context statement'];
    return new RegExp(`tends? to ${r > 0 ? 'increase' : 'decrease'}\\.$`).test(label) && label.startsWith('As ') ? [] : ['context statement wrong'];
  },
};

// ---------------------------------------------------------------------------
// S7.07: linear models in context
// ---------------------------------------------------------------------------

interface LCtx {
  xDef: string;
  xOne: string;
  yName: string;
  yUnit: string;
  as: number[];
  bs: number[];
  zero: string;
  meaningful: boolean;
  why?: string;
  xr: [number, number];
  /** yName already names the unit ("hours of sleep"), so "in hours" is not added after it */
  unitInName?: boolean;
}
const LM: LCtx[] = [
  { xDef: 'the number of hours a student studies', xOne: 'hour studied', yName: 'test score', yUnit: 'points', as: [3, 4, 5, 6], bs: [52, 55, 58, 60], zero: 'a student studies 0 hours', meaningful: true, xr: [1, 7] },
  { xDef: 'the age of a car in years', xOne: 'year of age', yName: 'value of the car', yUnit: 'thousand dollars', as: [-1.5, -2, -2.5, -3], bs: [30, 32, 34], zero: 'the car is 0 years old (new)', meaningful: true, xr: [1, 9] },
  { xDef: 'the temperature in degrees Fahrenheit', xOne: 'degree Fahrenheit', yName: 'ice cream sales', yUnit: 'dollars', as: [8, 10, 12, 15], bs: [-300, -350, -400, -450], zero: 'the temperature is 0°F', meaningful: false, why: 'sales cannot be negative, and 0°F is far outside the data', xr: [60, 95] },
  { xDef: 'a person’s height in inches', xOne: 'inch of height', yName: 'shoe size', yUnit: 'sizes', unitInName: true, as: [0.45, 0.5], bs: [-20, -22, -24], zero: 'a person is 0 inches tall', meaningful: false, why: 'no person is 0 inches tall, and a shoe size cannot be negative', xr: [60, 74] },
  { xDef: 'the number of minutes a player practices each day', xOne: 'minute of practice', yName: 'number of free throws made out of 20', yUnit: 'free throws', unitInName: true, as: [0.1, 0.15, 0.2], bs: [5, 6, 7], zero: 'a player practices 0 minutes a day', meaningful: true, xr: [10, 60] },
  { xDef: 'the hours of phone use per day', xOne: 'hour of phone use per day', yName: 'hours of sleep', yUnit: 'hours', unitInName: true, as: [-0.3, -0.4, -0.5], bs: [8.5, 9, 9.5], zero: 'a student uses a phone 0 hours a day', meaningful: true, xr: [1, 8] },
  { xDef: 'the number of miles driven since filling up', xOne: 'mile driven', yName: 'gallons of gas left in the tank', yUnit: 'gallons', unitInName: true, as: [-0.03, -0.04, -0.05], bs: [12, 14, 15], zero: '0 miles have been driven since filling up', meaningful: true, xr: [20, 200] },
  { xDef: 'the number of games a player has played this season', xOne: 'game played', yName: 'total points scored', yUnit: 'points', unitInName: true, as: [14, 18, 22], bs: [-5, -8], zero: '0 games have been played', meaningful: false, why: 'a player who has played 0 games has 0 points, not a negative number', xr: [2, 20] },
];
const modelTex = (a: Rational, b: Rational) => `\\hat{y} = ${numStr(a)}x ${b.isNegative() ? '-' : '+'} ${numStr(b.abs())}`;
function readModel(pr: Pick<Problem, 'prompt'>): { a: Rational; b: Rational } | null {
  for (const blk of pr.prompt) {
    if (blk.t !== 'math') continue;
    const m = /^\\hat\{y\} = (-?[\d.]+)x ([+-]) ([\d.]+)/.exec(blk.tex);
    if (m) return { a: Rational.parse(m[1]), b: Rational.parse(m[3]).mul(m[2] === '-' ? -1 : 1) };
  }
  return null;
}
const slopeSentence = (c: LCtx, a: Rational) => `For each additional ${c.xOne}, the predicted ${c.yName} ${a.isNegative() ? 'decreases' : 'increases'} by ${numStr(a.abs())} ${c.yUnit}.`;
const interceptSentence = (c: LCtx, v: Rational, meaningful: boolean) => `When ${c.zero}, the predicted ${c.yName} is ${numStr(v)} ${c.yUnit}. ${meaningful ? 'This makes sense in the context.' : `This does not make sense, because ${c.why ?? 'the value is not possible'}.`}`;

export const genLinearModel: GeneratorDef = {
  id: 'u7.linear-model',
  skillId: 'S7.07',
  description: 'Interpret the slope and y-intercept of a linear model in context, and use the model to predict values and changes.',
  generate(rng, difficulty) {
    const c = rng.pick(LM);
    const a = Q(String(rng.pick(c.as)));
    const b = Q(String(rng.pick(c.bs)));
    if (a.abs().eq(b.abs())) return genLinearModel.generate(rng, difficulty);
    const intro = p(`A linear model for the ${c.yName} is shown below, where $x$ is ${c.xDef} and $\\hat{y}$ is the predicted ${c.yName}${c.unitInName ? '' : ` in ${c.yUnit}`}. The model was made from data with $x$ from $${c.xr[0]}$ to $${c.xr[1]}$.`);
    const model: Block = { t: 'math', tex: modelTex(a, b) };
    if (difficulty === 1) {
      const correct = slopeSentence(c, a);
      return withSteps(makeProblem({
        skillId: 'S7.07',
        tags: ['real-world'],
        prompt: [intro, model, p('Which statement interprets the slope?')],
        answer: makeChoice(rng, correct, [slopeSentence(c, a.neg()), `For each additional ${c.xOne}, the predicted ${c.yName} ${a.isNegative() ? 'decreases' : 'increases'} by ${numStr(b.abs())} ${c.yUnit}.`, `When ${c.zero}, the predicted ${c.yName} is ${numStr(a)} ${c.yUnit}.`]),
        hints: ['The slope is the number multiplied by $x$.', `Here the slope is $${numStr(a)}$.`, 'Slope is the change in the predicted y for each increase of 1 in x.', `A ${a.isNegative() ? 'negative' : 'positive'} slope means the prediction ${a.isNegative() ? 'goes down' : 'goes up'}.`],
        solution: [
          { text: 'Find the slope.', tex: `a = ${numStr(a)}`, why: 'In $\\hat{y} = ax + b$, the slope is $a$.' },
          { text: correct, why: 'The slope is the predicted change in y for each 1-unit increase in x.' },
        ],
        misconceptions: [],
      }), (pr) => [
        numStep('What is the slope of the model?', a, ['In $\\hat{y} = ax + b$, the slope is $a$.', 'The slope is the number multiplied by $x$.', 'Include its sign.', 'The constant term is the y-intercept, not the slope.'], `The slope is $${numStr(a)}$.`, [{ value: b, tag: 'statistics-concept', feedback: 'That is the y-intercept, the constant term. The slope is the number multiplied by $x$.' }, { value: a.neg(), tag: 'sign-error', feedback: 'Check the sign of the slope.' }]),
        choiceStep('What does the slope of any linear model tell you?', 'The change in the predicted y for each increase of 1 in x', ['The predicted y when x is 0', 'The largest possible value of y'], ['Slope is a rate of change.', 'It compares a change in y with a change in x.', 'It is the change in y per 1 unit of x.', 'The value when x is 0 is the y-intercept.'], 'The slope is the predicted change in y for each 1-unit increase in x.', { 'The predicted y when x is 0': 'That is the y-intercept.', 'The largest possible value of y': 'A slope is a rate of change, not a largest value.' }),
        finalStep(pr, 'Which statement interprets the slope?', ['Use your answers from the last two steps.', `A ${a.isNegative() ? 'negative' : 'positive'} slope means the prediction ${a.isNegative() ? 'goes down' : 'goes up'}.`, 'The size of the change is the slope without its sign.', 'Look for "for each additional".'], 'The slope is the predicted change in y for each 1-unit increase in x, in context.', { feedback: { [slopeSentence(c, a.neg())]: 'Check the sign of the slope: does the prediction go up or down?', [`For each additional ${c.xOne}, the predicted ${c.yName} ${a.isNegative() ? 'decreases' : 'increases'} by ${numStr(b.abs())} ${c.yUnit}.`]: 'That uses the y-intercept as the change. The change comes from the slope.', [`When ${c.zero}, the predicted ${c.yName} is ${numStr(a)} ${c.yUnit}.`]: 'That describes a y-intercept, but uses the slope.' } }),
      ]);
    }
    if (difficulty === 2) {
      const correct = interceptSentence(c, b, c.meaningful);
      return withSteps(makeProblem({
        skillId: 'S7.07',
        tags: ['real-world'],
        prompt: [intro, model, p('Which statement interprets the y-intercept and says whether it is meaningful?')],
        answer: makeChoice(rng, correct, [
          `When ${c.zero}, the predicted ${c.yName} is ${numStr(b)} ${c.yUnit}. ${!c.meaningful ? 'This makes sense in the context.' : 'This does not make sense, because the model only works for values of x greater than 0.'}`,
          `When ${c.zero}, the predicted ${c.yName} is ${numStr(a)} ${c.yUnit}. ${c.meaningful ? 'This makes sense in the context.' : `This does not make sense, because ${c.why}.`}`,
          `For each additional ${c.xOne}, the predicted ${c.yName} changes by ${numStr(b.abs())} ${c.yUnit}.`,
        ]),
        hints: ['The y-intercept is the constant term.', `Here it is $${numStr(b)}$.`, 'The y-intercept is the predicted y when x = 0.', `Ask: is it possible that ${c.zero}, and is the prediction a possible value?`],
        solution: [
          { text: 'Find the y-intercept.', tex: `b = ${numStr(b)}`, why: 'Substituting $x = 0$ leaves only $b$.' },
          { text: correct, why: c.meaningful ? 'An x-value of 0 is possible here, and the prediction is reasonable.' : 'An intercept is only meaningful if x = 0 makes sense and the prediction is possible.' },
        ],
        misconceptions: [],
      }), (pr) => {
        const yes = 'Yes: that x-value is possible and the prediction is a possible value';
        const no = 'No: that x-value or the prediction is not possible here';
        return [
          numStep('What is the y-intercept of the model?', b, ['In $\\hat{y} = ax + b$, the y-intercept is $b$.', 'It is the constant term.', 'Include its sign.', 'Substituting $x = 0$ leaves only $b$.'], `The y-intercept is $${numStr(b)}$.`, [{ value: a, tag: 'statistics-concept', feedback: 'That is the slope. The y-intercept is the constant term.' }, { value: b.neg(), tag: 'sign-error', feedback: 'Check the sign of the constant term.' }]),
          choiceStep(`The y-intercept is the prediction when ${c.zero}. Does that make sense here?`, c.meaningful ? yes : no, [c.meaningful ? no : yes], ['Ask: can x really be 0 in this situation?', 'Then ask: is the predicted value possible?', 'A negative amount of something like sales or points is not possible.', 'Both must make sense for the intercept to be meaningful.'], c.meaningful ? 'An x-value of 0 is possible here, and the prediction is reasonable.' : `It does not make sense, because ${c.why}.`, { [yes]: `Look again: ${c.why ?? ''}.`, [no]: 'Here x = 0 is possible and the prediction is a reasonable value.' }),
          finalStep(pr, 'Which statement interprets the y-intercept and says whether it is meaningful?', ['Use your answers from the last two steps.', 'The intercept is the prediction when x = 0.', 'Check the number in the statement.', 'Check the reason in the statement.'], 'The y-intercept is the prediction at x = 0, and it is only meaningful if x = 0 and that prediction both make sense.', { feedback: { [`When ${c.zero}, the predicted ${c.yName} is ${numStr(a)} ${c.yUnit}. ${c.meaningful ? 'This makes sense in the context.' : `This does not make sense, because ${c.why}.`}`]: 'That uses the slope as the prediction at x = 0.', [`For each additional ${c.xOne}, the predicted ${c.yName} changes by ${numStr(b.abs())} ${c.yUnit}.`]: 'That describes a slope. The y-intercept is a single prediction at x = 0.' } }),
        ];
      });
    }
    if (rng.bool()) {
      const k = rng.pick(c.xr[1] - c.xr[0] > 20 ? [5, 10, 20, 25] : [2, 3, 4, 5]);
      const ch = a.abs().mul(k);
      const word = a.isNegative() ? 'decrease' : 'increase';
      return withSteps(makeProblem({
        skillId: 'S7.07',
        tags: ['real-world'],
        prompt: [intro, model, p(`According to the model, by how much does the predicted ${c.yName} ${word} when ${c.xDef} increases by ${k}?`)],
        answer: { kind: 'number', value: numStr(ch), unit: c.yUnit },
        hints: ['Use the slope.', `Each increase of 1 in x changes the prediction by $${numStr(a)}$.`, `An increase of ${k} changes it ${k} times as much.`, 'The y-intercept does not affect a change.'],
        solution: [
          { text: 'Multiply the slope by the change in x.', tex: `${numStr(a.abs())} \\times ${k} = ${numStr(ch)}`, why: 'The slope is the change per 1 unit of x.' },
          { text: `The predicted ${c.yName} would ${word} by ${numStr(ch)} ${c.yUnit}.` },
        ],
        misconceptions: numberMisconceptions(ch, [
          { value: a.mul(k).add(b).abs(), tag: 'statistics-concept', feedback: 'That is a predicted value, not a change. For a change, multiply the slope by the change in x and leave out the intercept.' },
          { value: a.abs(), tag: 'statistics-concept', feedback: `That is the change for 1 unit. The change in x is ${k}.` },
        ]),
      }), (pr) => [
        numStep('What is the slope of the model?', a, ['In $\\hat{y} = ax + b$, the slope is $a$.', 'The slope is the number multiplied by $x$.', 'Include its sign.', 'The constant term is the y-intercept.'], 'The slope is the predicted change in y for each increase of 1 in x.', [{ value: b, tag: 'statistics-concept', feedback: 'That is the y-intercept. The slope is the number multiplied by $x$.' }]),
        finalStep(pr, `By how much does the predicted ${c.yName} ${word} when x increases by ${k}?`, ['Each increase of 1 in x changes the prediction by the slope.', `An increase of ${k} changes it ${k} times as much.`, 'Multiply the size of the slope by the change in x.', 'The y-intercept does not affect a change.'], 'The slope is the change per 1 unit of x, so a change of k units gives k times the slope.'),
      ]);
    }
    const x0 = rng.int(c.xr[0], c.xr[1]);
    const yv = a.mul(x0).add(b);
    if (yv.isNegative() || yv.isZero()) return genLinearModel.generate(rng, 3);
    return withSteps(makeProblem({
      skillId: 'S7.07',
      tags: ['real-world'],
      prompt: [intro, model, p(`Use the model to predict the ${c.yName} when $x = ${x0}$.`)],
      answer: { kind: 'number', value: numStr(yv), unit: c.yUnit },
      hints: ['Substitute the x-value into the model.', `Replace $x$ with $${x0}$.`, 'Multiply first.', b.isNegative() ? 'Then subtract.' : 'Then add.'],
      solution: [
        { text: 'Substitute.', tex: `\\hat{y} = ${numStr(a)}(${x0}) ${b.isNegative() ? '-' : '+'} ${numStr(b.abs())}`, why: 'The model gives the predicted y for any x.' },
        { text: 'Simplify.', tex: `${numStr(a.mul(x0))} ${b.isNegative() ? '-' : '+'} ${numStr(b.abs())} = ${numStr(yv)}` },
      ],
      misconceptions: numberMisconceptions(yv, [
        { value: a.mul(x0), tag: 'statistics-concept', feedback: 'Remember to include the y-intercept.' },
        { value: Q(x0).sub(b).div(a).round(2), tag: 'equation-setup', feedback: `$x$ is ${c.xDef}. Substitute ${x0} for $x$; do not solve for $x$.` },
      ]),
    }), (pr) => [
        numStep(`Substitute $x = ${x0}$. What is $${numStr(a)} \\cdot ${x0}$?`, a.mul(x0), ['Replace $x$ with the given value.', 'Multiply the slope by that value.', a.isNegative() ? 'The slope is negative, so the product is negative.' : 'The slope and the value are both positive, so the product is positive.', 'Multiply as with whole numbers, then place the decimal point.'], `$${numStr(a)} \\cdot ${x0} = ${numStr(a.mul(x0))}$.`, [{ value: a.mul(x0).neg(), tag: 'sign-error', feedback: 'Check the sign of the product.' }]),
        finalStep(pr, `Now add the y-intercept, $${numStr(b)}$${b.isNegative() ? ` (adding a negative number means subtracting ${numStr(b.abs())})` : ''}. What is the predicted ${c.yName}?`, ['The model is slope times x plus the y-intercept.', 'Use your product from the last step.', b.isNegative() ? `Subtract ${numStr(b.abs())}.` : `Add ${numStr(b)}.`, 'Check that your prediction is a sensible value.'], 'The model gives the predicted y for any x.'),
      ]);
  },
  verify(pr) {
    const mdl = readModel(pr);
    if (!mdl) return ['no model'];
    const text = textAll(pr);
    const c = LM.find((x) => text.includes(`$x$ is ${x.xDef} `));
    if (!c) return ['no context'];
    const label = labelOf(pr);
    if (/interprets the slope/.test(text)) return label === slopeSentence(c, mdl.a) ? [] : ['slope sentence wrong'];
    if (/interprets the y-intercept/.test(text)) {
      if (mdl.b.isNegative() && !/does not make sense/.test(label)) return ['negative intercept called meaningful'];
      return label.startsWith(`When ${c.zero}, the predicted ${c.yName} is ${numStr(mdl.b)} `) && label === interceptSentence(c, mdl.b, c.meaningful) ? [] : ['intercept sentence wrong'];
    }
    if (pr.answer.kind !== 'number') return ['kind'];
    const got = Rational.parse(pr.answer.value);
    const ch = /increases by (\d+)\?/.exec(text);
    if (ch) {
      // two predictions k apart
      const x1 = Q(3);
      const diff = mdl.a.mul(x1.add(Number(ch[1]))).add(mdl.b).sub(mdl.a.mul(x1).add(mdl.b)).abs();
      return got.eq(diff) && (mdl.a.isNegative() ? /decrease when/.test(text) : /increase when/.test(text)) ? [] : ['change wrong'];
    }
    const x0 = Number(/when \$x = (\d+)\$/.exec(text)![1]);
    return got.eq(mdl.b.add(mdl.a.mul(x0))) ? [] : ['prediction wrong'];
  },
};

// ---------------------------------------------------------------------------
// S7.08: lines of best fit (technology output) and correlation
// ---------------------------------------------------------------------------

function regOutput(pts: Pt[]) {
  const reg = linearRegression(rats(pts.map((q) => String(q.x))), rats(pts.map((q) => String(q.y))));
  const a = reg.a.round(4);
  const b = reg.b.round(4);
  return { a, b, r: Math.round(reg.r * 100) / 100, rawR: reg.r, exactA: reg.a, exactB: reg.b };
}
const outTex = (a: Rational, b: Rational, r: number) => `\\hat{y} = ${numStr(a)}x ${b.isNegative() ? '-' : '+'} ${numStr(b.abs())},\\quad r = ${r.toFixed(2)}`;
function readOut(pr: Pick<Problem, 'prompt'>) {
  for (const blk of pr.prompt) {
    if (blk.t !== 'math') continue;
    const m = /^\\hat\{y\} = (-?[\d.]+)x ([+-]) ([\d.]+),\\quad r = (-?[\d.]+)$/.exec(blk.tex);
    if (m) return { a: Rational.parse(m[1]), b: Rational.parse(m[3]).mul(m[2] === '-' ? -1 : 1), r: Number(m[4]) };
  }
  return null;
}
const REASON = {
  extrap: (x0: number) => `Not reliable, because ${x0} is far outside the range of the data (extrapolation).`,
  good: (x0: number) => `Reasonable, because ${x0} is within the range of the data and the association is strong.`,
  weak: 'Not very reliable, because the association is weak.',
  exact: 'Reasonable, because a line of best fit always gives exact values.',
};

export const genRegression: GeneratorDef = {
  id: 'u7.regression',
  skillId: 'S7.08',
  description: 'Use technology output for a line of best fit to make predictions, interpret r, and judge whether predictions are reasonable.',
  generate(rng, difficulty) {
    if (difficulty >= 2 && rng.int(0, 2) === 0) return techFit(rng, difficulty);
    const c = pickCtx(rng);
    if (difficulty === 2 && rng.bool()) {
      // strongest r among four
      const cands = rng.shuffle([-0.97, -0.91, -0.86, -0.72, -0.64, -0.45, -0.18, 0.12, 0.33, 0.58, 0.69, 0.81, 0.89, 0.94]);
      const four = [cands[0]];
      for (const v of cands.slice(1)) if (four.length < 4 && four.every((w) => Math.abs(Math.abs(w) - Math.abs(v)) >= 0.04)) four.push(v);
      const best = four.reduce((x, y) => (Math.abs(y) > Math.abs(x) ? y : x));
      const f = (v: number) => `r = ${v.toFixed(2)}`;
      return withSteps(makeProblem({
        skillId: 'S7.08',
        tags: [],
        prompt: [p('Four data sets have these correlation coefficients. Which data set has the strongest linear association?')],
        answer: makeChoice(rng, f(best), four.filter((v) => v !== best).map(f)),
        hints: ['Strength depends on how close r is to 1 or −1.', 'The sign only tells the direction.', 'Compare the absolute values $|r|$.', 'The largest $|r|$ is the strongest.'],
        solution: [
          { text: 'Compare the absolute values.', tex: four.map((v) => `|${v.toFixed(2)}| = ${Math.abs(v).toFixed(2)}`).join(',\\ ') },
          { text: `${f(best)} is closest to ${best < 0 ? '−1' : '1'}, so it shows the strongest linear association.`, why: 'A negative r can show a strong association too; the sign gives the direction.' },
        ],
        misconceptions: [],
      }), (pr) => {
        const top = Math.max(...four);
        return [
          numStep('Strength depends on $|r|$, the size of r without its sign. What is the largest $|r|$ among the four?', Rational.parse(Math.abs(best).toFixed(2)), ['Drop the sign of each r.', 'Compare the sizes.', 'A negative r can be large in size.', 'Pick the size closest to 1.'], 'The closer $|r|$ is to 1, the stronger the linear association.', [{ value: top !== best ? Rational.parse(top.toFixed(2)) : null, tag: 'statistics-concept', feedback: 'That is the largest r, but strength uses $|r|$. A negative r can be strong too.' }]),
          finalStep(pr, 'Which data set has the strongest linear association?', ['Use your answer from the last step.', 'Find the r with that size.', 'Keep its sign.', 'The sign only gives the direction.'], 'The largest $|r|$ shows the strongest linear association.', { feedback: Object.fromEntries(four.filter((v) => v !== best).map((v) => [f(v), v === top ? 'That is the largest r, but strength uses $|r|$, the size without the sign.' : 'Compare $|r|$ for every choice.'])) }),
        ];
      });
    }
    const band: Band = difficulty === 3 ? rng.pick(['strong', 'strong', 'weak'] as const) : difficulty === 2 ? rng.pick(['strong', 'moderate', 'weak'] as const) : rng.pick(['strong', 'moderate'] as const);
    const pts = makeData(rng, c, band);
    const out = regOutput(pts);
    if (out.a.isZero() || Math.abs(out.r) === 1) return genRegression.generate(rng, difficulty);
    const lineOut: Block = { t: 'math', tex: outTex(out.a, out.b, out.r) };
    const intro = p(`A student entered the data into a graphing calculator. Here are ${c.yName} ($y$) and ${c.xName} ($x$), with the calculator's line of best fit.`);
    const xs = pts.map((q) => q.x);
    const lo = Math.min(...xs);
    const hi = Math.max(...xs);
    if (difficulty === 1) {
      const x0 = rng.int(lo, hi);
      const yv = out.a.mul(x0).add(out.b);
      // a student who runs the regression on the plotted points gets the same answer to the tenth
      if (!out.exactA.mul(x0).add(out.exactB).round(1).eq(yv.round(1))) return genRegression.generate(rng, 1);
      return withSteps(makeProblem({
        skillId: 'S7.08',
        tags: ['graph', 'real-world'],
        prompt: [intro, { t: 'graph', spec: scatterGraph(c, pts, { m: out.a.toNumber(), b: out.b.toNumber() }) }, lineOut, p(`Use the line of best fit to predict ${c.yName} when $x = ${x0}$. Round to the nearest tenth.`)],
        answer: { kind: 'number', value: numStr(yv), roundTo: 1 },
        hints: ['Use the equation exactly as the calculator shows it.', `Substitute $${x0}$ for $x$.`, 'Multiply, then add the intercept.', 'Round only the final answer.'],
        solution: [
          { text: 'Substitute into the line of best fit.', tex: `\\hat{y} = ${numStr(out.a)}(${x0}) ${out.b.isNegative() ? '-' : '+'} ${numStr(out.b.abs())}` },
          { text: 'Simplify and round.', tex: `${numStr(yv)} \\approx ${yv.round(1).toDecimalString(1)}`, why: 'The line gives a predicted value; real data points scatter around it.' },
        ],
        misconceptions: numberMisconceptions(yv.round(1), [
          { value: out.a.mul(x0).round(1), tag: 'statistics-concept', feedback: 'Remember to include the y-intercept.' },
          { value: Q(x0).sub(out.b).div(out.a).round(1), tag: 'equation-setup', feedback: `Substitute ${x0} for $x$; do not solve for $x$.` },
        ]),
      }), (pr) => [
          numStep(`Substitute $x = ${x0}$. What is $${numStr(out.a)} \\cdot ${x0}$?`, out.a.mul(x0), ['Use the slope exactly as the calculator shows it.', `Multiply it by ${x0}.`, 'Do not round yet.', out.a.isNegative() ? 'The slope is negative, so the product is negative.' : 'The slope and the value are both positive, so the product is positive.'], `$${numStr(out.a)} \\cdot ${x0} = ${numStr(out.a.mul(x0))}$.`, [{ value: out.a.mul(x0).neg(), tag: 'sign-error', feedback: 'Check the sign of the product.' }]),
          finalStep(pr, `Now add the intercept, $${numStr(out.b)}$${out.b.isNegative() ? ` (adding a negative number means subtracting ${numStr(out.b.abs())})` : ''}. What is the predicted value? Round to the nearest tenth.`, ['The line is slope times x plus the intercept.', 'Use your product from the last step.', out.b.isNegative() ? `Subtract ${numStr(out.b.abs())}.` : `Add ${numStr(out.b)}.`, 'Round only the final answer.'], 'The line gives a predicted value; real data points scatter around it.'),
        ]);
    }
    if (difficulty === 2) {
      const dir = out.r > 0 ? 'positive' : 'negative';
      const S = strengthWord(out.r);
      const correct = `${S} ${dir} linear association`;
      const others = ['Strong', 'Moderate', 'Weak'].filter((x) => x !== S);
      return withSteps(makeProblem({
        skillId: 'S7.08',
        tags: ['graph', 'real-world'],
        prompt: [intro, { t: 'graph', spec: scatterGraph(c, pts, { m: out.a.toNumber(), b: out.b.toNumber() }) }, lineOut, p('What does the correlation coefficient tell you about the data?')],
        answer: makeChoice(rng, correct, [`${S} ${dir === 'positive' ? 'negative' : 'positive'} linear association`, `${others[0]} ${dir} linear association`, `${others[1]} ${dir} linear association`]),
        hints: ['The sign of r gives the direction.', '$|r| \\ge 0.8$ is strong.', '$0.5 \\le |r| < 0.8$ is moderate.', '$|r| < 0.5$ is weak.'],
        solution: [
          { text: `The sign of r is ${dir}.`, why: 'A positive r means y tends to increase with x; a negative r means it tends to decrease.' },
          { text: `$|r| = ${Math.abs(out.r).toFixed(2)}$, so the association is ${S.toLowerCase()}.`, why: 'The closer |r| is to 1, the closer the points are to the line.' },
        ],
        misconceptions: [],
      }), (pr) => {
        const dirL = out.r > 0 ? 'Positive: y tends to increase as x increases' : 'Negative: y tends to decrease as x increases';
        const SL: Record<string, string> = { Strong: 'Strong, because |r| ≥ 0.8', Moderate: 'Moderate, because 0.5 ≤ |r| < 0.8', Weak: 'Weak, because |r| < 0.5' };
        return [
          choiceStep('What does the sign of r tell you?', dirL, ['Positive: y tends to increase as x increases', 'Negative: y tends to decrease as x increases'].filter((o) => o !== dirL), ['Look at the sign of r.', 'The sign of r is the direction of the trend.', 'Positive r: rising trend.', 'Negative r: falling trend.'], `r is ${dir}, so the trend is ${dir}.`, {}),
          choiceStep('How strong is the association?', SL[S], Object.values(SL).filter((o) => o !== SL[S]), ['Look at $|r|$, the size of r.', '$|r| \\ge 0.8$ is strong.', '$0.5 \\le |r| < 0.8$ is moderate.', '$|r| < 0.5$ is weak.'], `$|r| = ${Math.abs(out.r).toFixed(2)}$, so the association is ${S.toLowerCase()}.`, Object.fromEntries(Object.values(SL).filter((o) => o !== SL[S]).map((o) => [o, `Compare $|r| = ${Math.abs(out.r).toFixed(2)}$ with the cutoffs again.`]))),
          finalStep(pr, 'What does the correlation coefficient tell you about the data?', ['Use your answers from the last two steps.', 'Put the strength first, then the direction.', 'The form is linear.', 'Check both words in your choice.'], 'The sign of r gives the direction and $|r|$ gives the strength.', { feedback: { [`${S} ${dir === 'positive' ? 'negative' : 'positive'} linear association`]: 'Check the sign of r again.', [`${others[0]} ${dir} linear association`]: 'Check the size of $|r|$ against the cutoffs again.', [`${others[1]} ${dir} linear association`]: 'Check the size of $|r|$ against the cutoffs again.' } }),
        ];
      });
    }
    const extrap = band === 'strong' && rng.bool();
    const span = hi - lo;
    const x0 = extrap ? hi + Math.round(span * (1 + rng.next())) : rng.int(lo + 1, hi - 1);
    const correct = extrap ? REASON.extrap(x0) : band === 'strong' ? REASON.good(x0) : REASON.weak;
    return withSteps(makeProblem({
      skillId: 'S7.08',
      tags: ['graph', 'real-world'],
      prompt: [intro, { t: 'graph', spec: scatterGraph(c, pts, { m: out.a.toNumber(), b: out.b.toNumber() }, extrap ? x0 : undefined) }, lineOut, p(`Maya uses the line to predict ${c.yName} when $x = ${x0}$. How reliable is her prediction?`)],
      answer: makeChoice(rng, correct, [REASON.extrap(x0), REASON.good(x0), REASON.weak, REASON.exact].filter((o) => o !== correct).slice(0, 3)),
      hints: ['Check whether the x-value is inside the range of the data.', `The data go from $x = ${lo}$ to $x = ${hi}$.`, 'Check how strong the association is using r.', 'Predictions far outside the data, or from weak associations, are not reliable.'],
      solution: [
        { text: `The data run from $x = ${lo}$ to $x = ${hi}$, and $r = ${out.r.toFixed(2)}$.` },
        { text: correct, why: extrap ? 'The pattern might not continue far beyond the data.' : band === 'strong' ? 'Interpolating within the data with a strong association gives a reasonable prediction.' : 'With a weak association, the points are far from the line, so a prediction can be far off.' },
      ],
      misconceptions: [],
    }), (pr) => {
      const inside = x0 >= lo && x0 <= hi;
      const inL = inside ? 'Yes, it is inside the range of the data' : 'No, it is far outside the range of the data';
      const SL: Record<string, string> = { Strong: 'Strong, because |r| ≥ 0.8', Moderate: 'Moderate, because 0.5 ≤ |r| < 0.8', Weak: 'Weak, because |r| < 0.5' };
      const sw = strengthWord(out.r);
      return [
        choiceStep(`The data run from $x = ${lo}$ to $x = ${hi}$. Is $x = ${x0}$ inside that range?`, inL, [inside ? 'No, it is far outside the range of the data' : 'Yes, it is inside the range of the data'], ['Compare the x-value with the smallest x in the data.', 'Compare it with the largest x in the data.', 'Inside means between the two.', 'Predicting outside the data is called extrapolation.'], inside ? 'The x-value is between the smallest and largest x in the data.' : 'The x-value is far beyond the data, so the pattern might not continue there.', {}),
        choiceStep('How strong is the association?', SL[sw], Object.values(SL).filter((o) => o !== SL[sw]), ['Look at $|r|$.', '$|r| \\ge 0.8$ is strong.', '$0.5 \\le |r| < 0.8$ is moderate.', '$|r| < 0.5$ is weak.'], `$|r| = ${Math.abs(out.r).toFixed(2)}$.`, Object.fromEntries(Object.values(SL).filter((o) => o !== SL[sw]).map((o) => [o, `Compare $|r| = ${Math.abs(out.r).toFixed(2)}$ with the cutoffs again.`]))),
        finalStep(pr, 'How reliable is the prediction?', ['Use your answers from the last two steps.', 'Predictions far outside the data are not reliable.', 'Predictions from weak associations are not very reliable.', 'Inside the data with a strong association: reasonable.'], 'A prediction is reasonable only inside the data and with a strong association.', { feedback: { [REASON.exact]: 'A line of best fit gives predictions, not exact values; real points scatter around it.', [REASON.extrap(x0)]: 'Check whether the x-value is inside the range of the data.', [REASON.good(x0)]: inside ? 'Check the strength of the association.' : 'The x-value is outside the data.', [REASON.weak]: 'Check the strength of the association and the range of the data again.' } }),
      ];
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const label = labelOf(pr);
    if (/Four data sets/.test(text)) {
      if (pr.answer.kind !== 'choice') return ['kind'];
      const vals = pr.answer.options.map((o) => Math.abs(Number(o.label.replace('r = ', ''))));
      return Math.abs(Number(label.replace('r = ', ''))) === Math.max(...vals) && vals.filter((v) => v === Math.max(...vals)).length === 1 ? [] : ['strongest wrong'];
    }
    if (/Use the graphing tool/.test(text)) {
      const table = pr.prompt.find((b) => b.t === 'table');
      if (!table || table.t !== 'table' || pr.answer.kind !== 'number' || pr.answer.roundTo !== 2) return ['cannot read'];
      const tp = table.rows.map((r) => ({ x: Number(r[0]), y: Number(r[1]) }));
      const ln = vLine(tp);
      const v = Rational.parse(pr.answer.value);
      if (/the slope \$a\$/.test(text)) return v.eq(ln.a) ? [] : ['slope wrong'];
      if (/the \$y\$-intercept \$b\$/.test(text)) return v.eq(ln.b) ? [] : ['intercept wrong'];
      if (/correlation coefficient \$r\$/.test(text)) return Math.abs(v.toNumber() - vR(tp)) < 1e-9 ? [] : ['r wrong'];
      return ['unknown request'];
    }
    const pts = scatterOf(pr);
    const out = readOut(pr);
    if (!pts || !out) return ['cannot read'];
    const ln = vLine(pts);
    const r = vR(pts);
    if (!ln.a.round(4).eq(out.a) || !ln.b.round(4).eq(out.b) || Math.abs(r - out.r) > 0.0051) return ['technology output does not match data'];
    if (/predict .+ when \$x = \d+\$\. Round/.test(text)) {
      const x0 = Number(/when \$x = (\d+)\$\. Round/.exec(text)![1]);
      if (pr.answer.kind !== 'number') return ['kind'];
      if (!ln.a.mul(x0).add(ln.b).round(1).eq(out.a.mul(x0).add(out.b).round(1))) return ['shown equation and exact fit disagree at the tenths'];
      return Math.abs(Rational.parse(pr.answer.value).toNumber() - (out.a.toNumber() * x0 + out.b.toNumber())) < 1e-9 ? [] : ['prediction wrong'];
    }
    if (/correlation coefficient tell/.test(text)) return label === `${strengthWord(r)} ${r > 0 ? 'positive' : 'negative'} linear association` ? [] : ['r interpretation wrong'];
    const x0 = Number(/when \$x = (\d+)\$\. How reliable/.exec(text)![1]);
    const xs = pts.map((q) => q.x);
    const lo = Math.min(...xs);
    const hi = Math.max(...xs);
    const want = x0 > hi + (hi - lo) / 2 || x0 < lo - (hi - lo) / 2 ? REASON.extrap(x0) : x0 >= lo && x0 <= hi && Math.abs(r) >= 0.8 ? REASON.good(x0) : x0 >= lo && x0 <= hi && Math.abs(r) < 0.5 ? REASON.weak : '?';
    return label === want ? [] : ['reasonableness wrong'];
  },
};

// ---------------------------------------------------------------------------
// S7.09: choosing a model (linear, quadratic, exponential)
// ---------------------------------------------------------------------------

type Fam = 'Linear' | 'Quadratic' | 'Exponential';
interface MCtx { fam: Fam; text: string; xLabel: string; yLabel: string }
const MCTX: MCtx[] = [
  { fam: 'Linear', text: 'The data show the distance (in miles) a cyclist has ridden after $x$ hours.', xLabel: 'Time (hours)', yLabel: 'Distance (miles)' },
  { fam: 'Linear', text: 'The data show the amount (in dollars) left on a gift card after $x$ weeks.', xLabel: 'Time (weeks)', yLabel: 'Amount left ($)' },
  { fam: 'Quadratic', text: 'The data show the height (in feet) of a ball $x$ tenths of a second after it is thrown up.', xLabel: 'Time (tenths of a second)', yLabel: 'Height (feet)' },
  { fam: 'Quadratic', text: 'The data show the daily profit (in dollars) of a food truck when a taco costs $x$ dollars.', xLabel: 'Price ($)', yLabel: 'Profit ($)' },
  { fam: 'Exponential', text: 'The data show the number of followers of a new account $x$ weeks after it starts.', xLabel: 'Time (weeks)', yLabel: 'Followers' },
  { fam: 'Exponential', text: 'The data show the number of bacteria (in hundreds) in a sample after $x$ hours.', xLabel: 'Time (hours)', yLabel: 'Bacteria (hundreds)' },
];

function famData(rng: Rng, fam: Fam, opts: { decreasingLinear?: boolean; upQuadratic?: boolean } = {}): Pt[] {
  for (let tries = 0; tries < 300; tries++) {
    const n = rng.int(6, 8);
    const xs = Array.from({ length: n }, (_, i) => i);
    let ys: number[];
    if (fam === 'Linear') {
      const m = rng.int(4, 10) * (opts.decreasingLinear ? -1 : 1);
      const c = opts.decreasingLinear ? rng.int(80, 120) : rng.int(0, 10);
      ys = xs.map((x) => Math.round(m * x + c + (rng.next() * 2 - 1) * Math.abs(m) * 0.25));
    } else if (fam === 'Exponential') {
      const A = rng.int(2, 6);
      const g = rng.pick([1.8, 2, 2.5]);
      ys = xs.map((x) => Math.round(A * g ** x * (1 + (rng.next() * 2 - 1) * 0.04)));
    } else {
      const h = (n - 1) / 2 + rng.pick([-0.5, 0, 0.5]);
      const k = rng.int(2, 5);
      const up = !!opts.upQuadratic;
      const base = up ? rng.int(3, 10) : Math.ceil(k * h * h) + rng.int(5, 15);
      ys = xs.map((x) => Math.round((up ? k * (x - h) ** 2 + base : -k * (x - h) ** 2 + base) + (rng.next() * 2 - 1)));
    }
    if (ys.some((y) => y <= 0)) continue;
    const pts = xs.map((x, i) => ({ x, y: ys[i] }));
    if (fam === 'Quadratic') return pts;
    // keep linear and exponential data whose best fit is clear (SSE at least 3 times smaller)
    const lin = linearRegression(rats(xs.map(String)), rats(ys.map(String)));
    const sseL = ys.reduce((s, y, i) => s + (y - (lin.a.toNumber() * xs[i] + lin.b.toNumber())) ** 2, 0);
    const lg = linearRegression(rats(xs.map(String)), ys.map((y) => Rational.parse(Math.log(y).toFixed(12))));
    const sseE = ys.reduce((s, y, i) => s + (y - Math.exp(lg.a.toNumber() * xs[i] + lg.b.toNumber())) ** 2, 0);
    if (fam === 'Linear' ? sseL * 3 < sseE : sseE * 3 < sseL) return pts;
  }
  throw new Error('famData');
}
/** verify(): the family the data follow, by a turning point or by comparing least-squares errors. */
function vFamily(pts: Pt[]): Fam | null {
  const ys = pts.map((q) => q.y);
  const range = Math.max(...ys) - Math.min(...ys);
  for (const ext of [Math.max(...ys), Math.min(...ys)]) {
    const i = ys.indexOf(ext);
    if (i > 0 && i < ys.length - 1 && Math.abs(ys[0] - ext) >= 0.3 * range && Math.abs(ys[ys.length - 1] - ext) >= 0.3 * range) return 'Quadratic';
  }
  const sse = (f: (x: number) => number) => pts.reduce((s, q) => s + (q.y - f(q.x)) ** 2, 0);
  const l = vLine(pts);
  const sL = sse((x) => l.a.toNumber() * x + l.b.toNumber());
  const lg = vLine(pts.map((q) => ({ x: q.x, y: Number(Math.log(q.y).toFixed(12)) })));
  const sE = sse((x) => Math.exp(lg.a.toNumber() * x + lg.b.toNumber()));
  if (sL * 2 < sE) return 'Linear';
  if (sE * 2 < sL) return 'Exponential';
  return null;
}
function famReason(fam: Fam, pts: Pt[]): string {
  if (fam === 'Linear') return 'Linear, because the y-values change by about the same amount each time';
  if (fam === 'Exponential') return 'Exponential, because the y-values are multiplied by about the same number each time';
  const ys = pts.map((q) => q.y);
  const up = ys.indexOf(Math.min(...ys)) > 0 && ys.indexOf(Math.min(...ys)) < ys.length - 1;
  return `Quadratic, because the y-values ${up ? 'go down and then go up' : 'go up and then come down'}`;
}

export const genChooseModel: GeneratorDef = {
  id: 'u7.choose-model',
  skillId: 'S7.09',
  description: 'Choose a linear, quadratic or exponential model for data from a scatter plot, a table or a context.',
  generate(rng, difficulty) {
    if (difficulty === 1) {
      const fam = rng.pick(['Linear', 'Quadratic', 'Exponential'] as const);
      const pts = famData(rng, fam, { decreasingLinear: rng.bool(), upQuadratic: rng.bool() });
      const c: SCtx = { xLabel: 'x', yLabel: 'y', xName: 'x', yName: 'y', xLo: 0, xHi: 0, m: 1, b: 0, dec: 0, yLo: 0, yHi: 0 };
      return withSteps(makeProblem({
        skillId: 'S7.09',
        tags: ['graph'],
        prompt: [p('Which type of function best models the data in the scatter plot?'), { t: 'graph', spec: scatterGraph(c, pts) }],
        answer: makeChoice(rng, fam, ['Linear', 'Quadratic', 'Exponential']),
        hints: ['Do the points follow a straight line?', 'Do they rise and then fall, or fall and then rise?', 'Do they rise slowly at first and then faster and faster?', 'Straight: linear. Turns around: quadratic. Grows faster and faster: exponential.'],
        solution: [
          { text: 'Look at the shape of the points.', why: fam === 'Linear' ? 'They follow a straight line.' : fam === 'Quadratic' ? 'They turn around, like a parabola.' : 'They curve upward more and more steeply.' },
          { text: `${fam}.` },
        ],
        misconceptions: [],
      }), (pr) => {
        const SH: Record<string, string> = { Linear: 'They follow a straight line', Quadratic: 'They turn around: they rise and then fall, or fall and then rise', Exponential: 'They curve, changing faster and faster' };
        return [
          choiceStep('Which description fits the points?', SH[fam], Object.values(SH).filter((o) => o !== SH[fam]), ['Follow the points from left to right.', 'Could a ruler pass close to all of them?', 'Does the pattern turn around somewhere in the middle?', 'Does it get steeper and steeper?'], fam === 'Linear' ? 'They follow a straight line.' : fam === 'Quadratic' ? 'They turn around, like a parabola.' : 'They curve upward more and more steeply.', Object.fromEntries(Object.values(SH).filter((o) => o !== SH[fam]).map((o) => [o, 'Follow the points from left to right once more.'])), 'graph-reading'),
          finalStep(pr, 'Which type of function best models the data?', ['Use your answer from the last step.', 'Straight: linear.', 'Turns around: quadratic.', 'Faster and faster: exponential.'], 'The shape of the points matches the shape of the function family.', { feedback: { Linear: 'A linear model is a straight line; these points are not.', Quadratic: 'A quadratic model turns around; check whether these points do.', Exponential: 'An exponential model gets steeper and steeper; check whether these points do.' } }),
        ];
      });
    }
    const ctx = difficulty === 3 ? rng.pick(MCTX) : null;
    const fam: Fam = ctx ? ctx.fam : rng.pick(['Linear', 'Quadratic', 'Exponential'] as const);
    const raw = famData(rng, fam, { decreasingLinear: ctx ? /gift card/.test(ctx.text) : rng.bool(), upQuadratic: ctx ? false : rng.bool() });
    // a taco price starts at 1 dollar, not 0
    const pts = ctx && /taco/.test(ctx.text) ? raw.map((q) => ({ x: q.x + 1, y: q.y })) : raw;
    const correct = famReason(fam, pts);
    const pool = [famReason('Linear', pts), famReason('Exponential', pts), famReason('Quadratic', pts), fam === 'Exponential' ? 'Linear, because the y-values are multiplied by about the same number each time' : 'Exponential, because the y-values change by about the same amount each time'];
    const show: Block = ctx
      ? { t: 'graph', spec: scatterGraph({ xLabel: ctx.xLabel, yLabel: ctx.yLabel, xName: '', yName: '', xLo: 0, xHi: 0, m: 1, b: 0, dec: 0, yLo: 0, yHi: 0 }, pts) }
      : { t: 'table', headers: ['x', 'y'], rows: pts.map((q) => [String(q.x), String(q.y)]) };
    const diffs = pts.slice(1).map((q, i) => q.y - pts[i].y);
    return withSteps(makeProblem({
      skillId: 'S7.09',
      tags: ctx ? ['graph', 'real-world'] : [],
      prompt: [p(ctx ? `${ctx.text} Which type of function best models the data, and why?` : 'Which type of function best models the data in the table, and why?'), show],
      answer: makeChoice(rng, correct, pool.filter((o) => o !== correct).slice(0, 3)),
      hints: ['Find the differences between consecutive y-values.', 'About the same differences: linear.', 'About the same ratios (each y divided by the one before): exponential.', 'Values that rise then fall (or fall then rise): quadratic.'],
      solution: [
        { text: 'Find the first differences.', tex: diffs.join(',\\ '), why: 'The x-values go up by 1 each time.' },
        ...(fam === 'Exponential' ? [{ text: 'Find the ratios of consecutive y-values.', tex: pts.slice(1).map((q, i) => (q.y / pts[i].y).toFixed(2)).join(',\\ '), why: 'Each ratio is close to the same number, so each y-value is about the same multiple of the one before.' }] : []),
        { text: correct + '.', why: fam === 'Linear' ? 'Nearly constant differences mean a constant rate of change.' : fam === 'Exponential' ? 'The differences keep growing, and each y-value is about the same multiple of the one before.' : 'The differences change sign, so the values turn around like a parabola.' },
      ],
      misconceptions: [],
    }), (pr) => {
      const PAT: Record<Fam, string> = { Linear: 'They stay about the same', Exponential: 'They keep growing, with the same sign', Quadratic: 'They change sign: up then down, or down then up' };
      const pattern = choiceStep(ctx ? 'Look at how the heights of the points change from one point to the next. What do those changes do?' : 'Look at the first differences (each y-value minus the one before it). What do they do?', PAT[fam], Object.values(PAT).filter((o) => o !== PAT[fam]), ['A difference is how much y changes when x goes up by 1.', ctx ? 'Compare the changes from the left of the plot to the right.' : 'Compare the differences across the table.', 'About the same each time: a constant rate.', 'Growing and growing, or switching sign, are other patterns.'], fam === 'Linear' ? 'Nearly constant differences mean a constant rate of change.' : fam === 'Exponential' ? 'The differences keep growing because each y-value is about the same multiple of the one before.' : 'The differences switch sign, so the values turn around like a parabola.', Object.fromEntries(Object.values(PAT).filter((o) => o !== PAT[fam]).map((o) => [o, ctx ? 'Find the changes again and compare them across all the points.' : 'Find the differences again and compare them across the whole table.'])));
      const last = finalStep(pr, 'Which type of function best models the data, and why?', ['Use your answer from the last step.', 'About the same differences: linear.', 'Differences that keep growing, with about the same ratio each time: exponential.', 'Differences that change sign: quadratic.'], 'The pattern of the differences tells you the family.', { feedback: Object.fromEntries(pool.filter((o) => o !== correct).map((o) => [o, /multiplied/.test(o) && /^Linear/.test(o) ? 'Multiplying by the same number each time is exponential, not linear.' : /same amount/.test(o) && /^Exponential/.test(o) ? 'Changing by the same amount each time is linear, not exponential.' : 'Compare that reason with the pattern of the differences you found.'])) });
      return ctx
        ? [pattern, last]
        : [numStep('What is the first difference: the second y-value minus the first?', Q(diffs[0]), ['The x-values go up by 1 each time.', 'Take the y-value in the second row.', 'Subtract the y-value in the first row.', 'Keep the sign: a decrease is negative.'], `The first difference is $${diffs[0]}$.`, [{ value: Q(-diffs[0]), tag: 'sign-error', feedback: 'Subtract in order: the second y-value minus the first.' }]), pattern, last];
    });
  },
  verify(pr) {
    const pts = scatterOf(pr);
    if (!pts) return ['no data'];
    const fam = vFamily(pts);
    if (!fam) return ['family unclear'];
    const label = labelOf(pr);
    if (/best models the data in the scatter plot\?/.test(textAll(pr))) return label === fam ? [] : ['family wrong'];
    return label.startsWith(fam + ', because') && label === famReason(fam, pts) ? [] : ['family reason wrong'];
  },
};

// ---------------------------------------------------------------------------
// S7.10: correlation and causation
// ---------------------------------------------------------------------------

interface Corr { a: string; b: string; units: string; lurking: string; wrong: string[] }
const CORR: Corr[] = [
  { a: 'ice cream sales', b: 'the number of sunburns', units: 'days at a beach town', lurking: 'Hot, sunny weather', wrong: ['The flavor of the ice cream', 'The price of a cone', 'The number of ice cream shops in other states'] },
  { a: 'the number of firefighters at a fire', b: 'the amount of damage', units: 'fires', lurking: 'The size of the fire', wrong: ['The color of the fire trucks', 'How far the firefighters live from the station', 'The day of the week'] },
  { a: 'shoe size', b: 'reading level', units: 'elementary school students', lurking: 'The age of the student', wrong: ['The brand of the shoes', 'The color of the books', 'The number of pages in a book'] },
  { a: 'hot chocolate sales', b: 'the number of people with colds', units: 'weeks in a town', lurking: 'Winter, when people spend more time indoors together', wrong: ['The price of hot chocolate', 'The number of mugs sold', 'The brand of tissues'] },
  { a: 'lemonade sales', b: 'the number of swimming pool visits', units: 'days in a city', lurking: 'Hot summer weather', wrong: ['The price of lemons', 'The color of the pool', 'The number of lifeguards in other cities'] },
  { a: 'the number of hospitals', b: 'the number of car accidents', units: 'cities', lurking: 'The population of the city', wrong: ['The number of doctors who drive', 'The color of ambulances', 'The speed limit near hospitals'] },
  { a: 'the number of libraries', b: 'the number of restaurants', units: 'towns', lurking: 'The population of the town', wrong: ['The number of books per library', 'The type of food served', 'The opening hours of the libraries'] },
  { a: 'children’s height', b: 'the number of words they know', units: 'children ages 2 to 12', lurking: 'The age of the child', wrong: ['The color of their clothes', 'The number of siblings in other families', 'The brand of their shoes'] },
];
interface Exp { q: string; correct: string; wrong: string[] }
const EXPS: Exp[] = [
  { q: 'whether a new study app raises quiz scores', correct: 'Randomly assign students to use the app or not, then compare their quiz scores.', wrong: ['Compare the quiz scores of students who already chose to use the app with students who did not.', 'Ask students whether they think the app helps.', 'Look at the quiz scores of the 10 students who use the app the most.'] },
  { q: 'whether a sports drink improves sprint times', correct: 'Randomly assign athletes to drink the sports drink or water, then compare their sprint times.', wrong: ['Compare the sprint times of athletes who already drink sports drinks with those who do not.', 'Survey coaches about which drink they prefer.', 'Time the fastest runners on a team and ask what they drink.'] },
  { q: 'whether listening to music while studying changes test scores', correct: 'Randomly assign students to study with music or in silence, then compare their test scores.', wrong: ['Compare the test scores of students who say they like music with those who do not.', 'Ask students if music helps them focus.', 'Record the test scores of students in the school band.'] },
  { q: 'whether a new fertilizer makes tomato plants grow taller', correct: 'Randomly assign plants to get the fertilizer or no fertilizer, then compare their heights.', wrong: ['Compare the heights of plants in gardens whose owners chose the fertilizer with gardens that did not.', 'Ask gardeners whether the fertilizer works.', 'Measure only the plants that got the fertilizer.'] },
];
interface Claim { claim: string; lurk: string }
const CLAIMS: Claim[] = [
  { claim: 'Students who eat breakfast have higher grades, so eating breakfast raises grades.', lurk: 'how much sleep students get' },
  { claim: 'People who own more books live longer, so buying books makes you live longer.', lurk: 'income' },
  { claim: 'Teens who play a musical instrument have higher test scores, so learning an instrument raises test scores.', lurk: 'how much support students get at home' },
];
const CORRECT_CORR = (c: Corr) => `${c.a[0].toUpperCase()}${c.a.slice(1)} and ${c.b} are associated, but the data do not show that one causes the other.`;
const claimCorrect = (c: Claim) => `The data only show an association; a lurking variable such as ${c.lurk} could explain it, so the claim of cause and effect is not supported.`;

export const genCausation: GeneratorDef = {
  id: 'u7.causation',
  skillId: 'S7.10',
  description: 'Distinguish correlation from causation, identify lurking variables, and recognize that a randomized experiment is needed to show cause and effect.',
  generate(rng, difficulty) {
    if (difficulty === 1 || difficulty === 2) {
      const c = rng.pick(CORR);
      const A = c.a[0].toUpperCase() + c.a.slice(1);
      const B = c.b[0].toUpperCase() + c.b.slice(1);
      const lead = `A study of ${c.units} found a strong positive correlation between ${c.a} and ${c.b}.`;
      if (difficulty === 1) {
        const correct = CORRECT_CORR(c);
        return withSteps(makeProblem({
          skillId: 'S7.10',
          tags: ['real-world'],
          prompt: [p(`${lead} Which statement is correct?`)],
          answer: makeChoice(rng, correct, [`${A} causes ${c.b} to increase.`, `${B} causes ${c.a} to increase.`, `There is no relationship between ${c.a} and ${c.b}.`]),
          hints: ['A correlation says two variables tend to change together.', 'Does it say why they change together?', 'Something else could be causing both.', 'Correlation does not imply causation.'],
          solution: [
            { text: 'The correlation shows that the two variables are associated.' },
            { text: correct, why: `A third variable, such as ${c.lurking.toLowerCase()}, could cause both to increase.` },
          ],
          misconceptions: [],
        }), (pr) => [
          choiceStep('Does a correlation tell you why two variables change together?', 'No, it only shows that they tend to change together', ['Yes, it shows that one causes the other'], ['A correlation measures how two variables move together.', 'It is calculated from the data only.', 'It cannot see what is going on behind the data.', 'Correlation does not imply causation.'], 'A correlation describes a pattern; it does not explain it.', { 'Yes, it shows that one causes the other': 'A correlation only shows the variables move together. Something else could cause both.' }),
          choiceStep(`Which of these could make both ${c.a} and ${c.b} go up?`, c.lurking, c.wrong.slice(0, 2), ['Think of something that affects both variables.', `What could make ${c.a} go up?`, `What could also make ${c.b} go up?`, 'Look for one cause that does both.'], `${c.lurking} could increase both, so neither variable has to cause the other.`, Object.fromEntries(c.wrong.slice(0, 2).map((w) => [w, `That would not make both ${c.a} and ${c.b} go up.`]))),
          finalStep(pr, 'Which statement is correct?', ['Use your answers from the last two steps.', 'An association is not proof of cause.', 'A third variable could explain the pattern.', 'There is a relationship, but not a proven cause.'], 'Correlation does not imply causation: a lurking variable could explain the pattern.', { feedback: { [`${A} causes ${c.b} to increase.`]: 'The data only show an association. Something else could cause both.', [`${B} causes ${c.a} to increase.`]: 'The data only show an association. Something else could cause both.', [`There is no relationship between ${c.a} and ${c.b}.`]: 'There is a strong correlation, so the variables are related; it just is not proven to be cause and effect.' } }),
        ]);
      }
      return withSteps(makeProblem({
        skillId: 'S7.10',
        tags: ['real-world'],
        prompt: [p(`${lead} Which is the most likely lurking variable that could explain this?`)],
        answer: makeChoice(rng, c.lurking, c.wrong),
        hints: ['A lurking variable affects both variables.', `Ask: what could make ${c.a} go up?`, `Ask: what could also make ${c.b} go up?`, 'Look for one thing that does both.'],
        solution: [{ text: `${c.lurking} increases both ${c.a} and ${c.b}.`, why: 'So the two variables rise together even though neither causes the other.' }, { text: `The lurking variable is ${c.lurking.toLowerCase()}.` }],
        misconceptions: [],
      }), (pr) => [
        choiceStep('A lurking variable is a third variable that...', 'Affects both variables in the study', ['Affects only one of the variables', 'Is one of the two variables in the study'], ['It is not one of the two variables measured.', 'It explains why the two variables move together.', 'To do that, it has to change both of them.', 'It "lurks" behind the data.'], 'A lurking variable affects both variables, so they move together even if neither causes the other.', { 'Affects only one of the variables': 'Then it could not make the two variables move together.', 'Is one of the two variables in the study': 'A lurking variable is a third variable, not one of the two measured.' }),
        finalStep(pr, 'Which is the most likely lurking variable?', ['Use your answer from the last step.', `Ask: what could make ${c.a} go up?`, `Ask: what could also make ${c.b} go up?`, 'Pick the one that does both.'], `${c.lurking} increases both ${c.a} and ${c.b}.`, { feedback: Object.fromEntries(c.wrong.map((w) => [w, `That would not make both ${c.a} and ${c.b} go up.`])) }),
      ]);
    }
    if (rng.bool()) {
      const e = rng.pick(EXPS);
      return withSteps(makeProblem({
        skillId: 'S7.10',
        tags: ['real-world'],
        prompt: [p(`A researcher wants to find out ${e.q}. Which study could show cause and effect?`)],
        answer: makeChoice(rng, e.correct, e.wrong),
        hints: ['Only an experiment can show cause and effect.', 'In an experiment, the researcher decides who gets the treatment.', 'Random assignment makes the groups alike in every other way.', 'Look for "randomly assign".'],
        solution: [{ text: e.correct }, { text: 'Random assignment balances lurking variables between the groups, so a difference in results can be blamed on the treatment.', why: 'Observational studies and surveys can only show association.' }],
        misconceptions: [],
      }), (pr) => [
        choiceStep('Which kind of study can show cause and effect?', 'A randomized experiment', ['An observational study', 'A survey'], ['Think about who decides who gets the treatment.', 'In an experiment, the researcher decides.', 'Random assignment makes the groups alike in every other way.', 'Observational studies and surveys only show association.'], 'Random assignment balances lurking variables, so a difference in results can be blamed on the treatment.', { 'An observational study': 'People choose for themselves, so lurking variables can explain the results.', 'A survey': 'A survey only shows what people report; it cannot show cause and effect.' }),
        finalStep(pr, 'Which study could show cause and effect?', ['Use your answer from the last step.', 'Look for a study where the researcher assigns the treatment.', 'The assignment must be random.', 'Look for "randomly assign".'], 'Only a randomized experiment can show cause and effect.', { feedback: Object.fromEntries(e.wrong.map((w) => [w, /already|chose/.test(w) ? 'People who chose the treatment may differ in other ways. Assign the treatment at random.' : /Ask|Survey/.test(w) ? 'Opinions are not evidence of cause and effect.' : 'Without a comparison group chosen at random, this cannot show cause and effect.'])) }),
      ]);
    }
    const cl = rng.pick(CLAIMS);
    const correct = claimCorrect(cl);
    return withSteps(makeProblem({
      skillId: 'S7.10',
      tags: ['real-world'],
      prompt: [p(`A news story says: "${cl.claim}" The data came from a survey, not an experiment. Which response is best?`)],
      answer: makeChoice(rng, correct, ['The claim is correct, because the association is strong.', 'The claim is correct, because the survey included many people.', 'The data show there is no relationship at all.']),
      hints: ['Was anyone randomly assigned to a treatment?', 'A survey is an observational study.', 'Could another variable explain both?', 'An association alone does not prove cause and effect.'],
      solution: [{ text: 'A survey shows only an association.' }, { text: correct, why: 'Only a randomized experiment can show cause and effect.' }],
      misconceptions: [],
    }), (pr) => [
      choiceStep('Was anyone randomly assigned to a treatment in this study?', 'No, it was a survey, so it only shows an association', ['Yes, so it can show cause and effect'], ['How were the data collected?', 'A survey asks people about what they already do.', 'Nobody was told what to do.', 'A survey is an observational study.'], 'A survey is an observational study, so it can only show an association.', { 'Yes, so it can show cause and effect': 'The data came from a survey; nobody was assigned to anything.' }),
      finalStep(pr, 'Which response is best?', ['Use your answer from the last step.', 'Could another variable explain both?', 'A strong association or a big survey is still only an association.', 'Look for the response that names a lurking variable.'], 'Only a randomized experiment can show cause and effect.', { feedback: { 'The claim is correct, because the association is strong.': 'A strong association still does not show cause and effect.', 'The claim is correct, because the survey included many people.': 'A bigger survey is still only an observational study.', 'The data show there is no relationship at all.': 'The data do show an association; they just do not show cause.' } }),
    ]);
  },
  verify(pr) {
    const text = textAll(pr);
    const label = labelOf(pr);
    if (pr.answer.kind !== 'choice') return ['kind'];
    const opts = pr.answer.options.map((o) => o.label);
    if (/Which study could show cause and effect/.test(text)) {
      const ok = /^Randomly assign/.test(label) && opts.filter((o) => /^Randomly assign/.test(o)).length === 1;
      return ok && EXPS.some((e) => text.includes(e.q) && e.correct === label) ? [] : ['experiment wrong'];
    }
    if (/A news story says/.test(text)) {
      const cl = CLAIMS.find((c) => text.includes(c.claim));
      return cl && label === claimCorrect(cl) && opts.filter((o) => /not supported/.test(o)).length === 1 ? [] : ['claim response wrong'];
    }
    const c = CORR.find((x) => text.includes(`between ${x.a} and ${x.b}`));
    if (!c) return ['scenario not found'];
    if (/lurking variable/.test(text)) return label === c.lurking && !c.wrong.includes(label) ? [] : ['lurking wrong'];
    return /do not show that one causes the other/.test(label) && opts.filter((o) => /causes/.test(o) && !/do not show/.test(o)).length === 2 ? [] : ['causation statement wrong'];
  },
};

// ---------------------------------------------------------------------------
// Guided steps: verify() also recomputes each step from the prompt (the plotted points, the table, the
// printed model or calculator output) and checks that the last step answers the problem.
// ---------------------------------------------------------------------------
const labelIs = (pr: Problem, i: number, want: string): string[] => (stepLabel(pr, i) === want ? [] : [`step ${i + 1} should be "${want}", got "${stepLabel(pr, i)}"`]);
const STRENGTH_STEP: Record<string, string> = { Strong: 'Strong, because |r| ≥ 0.8', Moderate: 'Moderate, because 0.5 ≤ |r| < 0.8', Weak: 'Weak, because |r| < 0.5' };
const stepText = (pr: Problem, i: number) => (pr.steps?.[i]?.prompt ?? []).map((b) => (b.t === 'p' ? b.text : '')).join(' ');

addStepChecks(genScatter, (pr) => {
  const text = textAll(pr);
  const graphs = pr.prompt.filter((b) => b.t === 'graph');
  if (graphs.length === 4) {
    const table = pr.prompt.find((b) => b.t === 'table');
    const x = Number(/whose x-value is (-?[\d.]+)/.exec(stepText(pr, 1))?.[1]);
    const row = table && table.t === 'table' ? table.rows.find((r) => Number(r[0]) === x) : undefined;
    if (!row) return ['step 2 names no row of the table'];
    return [...expectSteps(pr, [null, Number(row[1]), null]), ...labelIs(pr, 0, 'The horizontal axis')];
  }
  const pts = scatterOf(pr)!;
  const r = vR(pts);
  const dir = r > 0 ? 'rise' : 'fall';
  if (/What kind of association/.test(text)) return [...expectSteps(pr, [null, null]), ...labelIs(pr, 0, Math.abs(r) < 0.2 ? 'They neither rise nor fall' : `They tend to ${dir}`)];
  if (/Describe the association/.test(text)) {
    const ST: Record<string, string> = { Strong: 'Strong: the points stay close to a line', Moderate: 'Moderate: a clear trend, with a fair amount of scatter', Weak: 'Weak: a slight trend, with the points very spread out' };
    return [...expectSteps(pr, [null, null, null]), ...labelIs(pr, 0, r > 0 ? 'Positive: the points tend to rise' : 'Negative: the points tend to fall'), ...labelIs(pr, 1, ST[strengthWord(r)])];
  }
  if (/correlation coefficient best matches/.test(text)) {
    const SZ: Record<string, string> = { Strong: '|r| close to 1 (strong)', Moderate: '|r| between 0.5 and 0.8 (moderate)', Weak: '|r| less than 0.5 (weak)' };
    return [...expectSteps(pr, [null, null, null]), ...labelIs(pr, 0, r > 0 ? 'Positive, because the trend rises' : 'Negative, because the trend falls'), ...labelIs(pr, 1, SZ[strengthWord(r)])];
  }
  // "some points go against the trend": some pair of points, in x order, moves the other way
  const byX = [...pts].sort((p1, p2) => p1.x - p2.x);
  const against = byX.some((q, i) => byX.slice(i + 1).some((w) => w.x > q.x && Math.sign(w.y - q.y) === -Math.sign(r)));
  if (!against) return ['every point follows the trend, so "always" would describe these data too'];
  return [...expectSteps(pr, [null, null, null]), ...labelIs(pr, 0, `They tend to ${dir}`), ...labelIs(pr, 1, 'No, some points go against the trend')];
});

addStepChecks(genLinearModel, (pr) => {
  const mdl = readModel(pr)!;
  const text = textAll(pr);
  const c = LM.find((x) => text.includes(`$x$ is ${x.xDef} `))!;
  if (/interprets the slope/.test(text)) return [...expectSteps(pr, [mdl.a, null, null]), ...labelIs(pr, 1, 'The change in the predicted y for each increase of 1 in x')];
  if (/interprets the y-intercept/.test(text)) return [...expectSteps(pr, [mdl.b, null, null]), ...labelIs(pr, 1, c.meaningful && !mdl.b.isNegative() ? 'Yes: that x-value is possible and the prediction is a possible value' : 'No: that x-value or the prediction is not possible here')];
  if (/increases by (\d+)\?/.test(text)) return expectSteps(pr, [mdl.a, null]);
  // the product is the prediction minus the intercept
  const x0 = Number(/when \$x = (\d+)\$/.exec(text)![1]);
  return expectSteps(pr, [Rational.parse(pr.answer.kind === 'number' ? pr.answer.value : '0').sub(mdl.b), null]).concat(mdl.a.mul(x0).add(mdl.b).eq(Rational.parse(pr.answer.kind === 'number' ? pr.answer.value : '0')) ? [] : ['prediction and product disagree']);
});

addStepChecks(genRegression, (pr) => {
  const text = textAll(pr);
  if (/Four data sets/.test(text)) {
    const vals = pr.answer.kind === 'choice' ? pr.answer.options.map((o) => Math.abs(Number(o.label.replace('r = ', '')))) : [];
    return expectSteps(pr, [Math.max(...vals), null]);
  }
  if (/Use the graphing tool/.test(text)) {
    const table = pr.prompt.find((b) => b.t === 'table');
    if (!table || table.t !== 'table') return ['cannot read'];
    const tp = table.rows.map((r) => ({ x: Number(r[0]), y: Number(r[1]) }));
    const ln = vLine(tp);
    const want = /the slope \$a\$/.test(text) ? ln.a.toNumber() : /the \$y\$-intercept \$b\$/.test(text) ? ln.b.toNumber() : vR(tp);
    return [...expectSteps(pr, [null, want, null]), ...labelIs(pr, 0, 'Linear regression')];
  }
  const out = readOut(pr)!;
  const pts = scatterOf(pr)!;
  if (/predict .+ when \$x = \d+\$\. Round/.test(text)) {
    const x0 = Number(/when \$x = (\d+)\$\. Round/.exec(text)![1]);
    return expectSteps(pr, [out.a.toNumber() * x0, null]);
  }
  if (/correlation coefficient tell/.test(text)) return [...expectSteps(pr, [null, null, null]), ...labelIs(pr, 0, out.r > 0 ? 'Positive: y tends to increase as x increases' : 'Negative: y tends to decrease as x increases'), ...labelIs(pr, 1, STRENGTH_STEP[strengthWord(out.r)])];
  const x0 = Number(/when \$x = (\d+)\$\. How reliable/.exec(text)![1]);
  const xs = pts.map((q) => q.x);
  const inside = x0 >= Math.min(...xs) && x0 <= Math.max(...xs);
  return [...expectSteps(pr, [null, null, null]), ...labelIs(pr, 0, inside ? 'Yes, it is inside the range of the data' : 'No, it is far outside the range of the data'), ...labelIs(pr, 1, STRENGTH_STEP[strengthWord(out.r)])];
});

addStepChecks(genChooseModel, (pr) => {
  const pts = scatterOf(pr)!;
  const fam = vFamily(pts)!;
  if (/best models the data in the scatter plot\?/.test(textAll(pr))) {
    const SH: Record<Fam, string> = { Linear: 'They follow a straight line', Quadratic: 'They turn around: they rise and then fall, or fall and then rise', Exponential: 'They curve, changing faster and faster' };
    return [...expectSteps(pr, [null, null]), ...labelIs(pr, 0, SH[fam])];
  }
  const PAT: Record<Fam, string> = { Linear: 'They stay about the same', Exponential: 'They keep growing, with the same sign', Quadratic: 'They change sign: up then down, or down then up' };
  const table = pr.prompt.find((b) => b.t === 'table');
  if (table && table.t === 'table') return [...expectSteps(pr, [Number(table.rows[1][1]) - Number(table.rows[0][1]), null, null]), ...labelIs(pr, 1, PAT[fam])];
  return [...expectSteps(pr, [null, null]), ...labelIs(pr, 0, PAT[fam])];
});

addStepChecks(genCausation, (pr) => {
  const text = textAll(pr);
  if (/Which study could show cause and effect/.test(text)) return [...expectSteps(pr, [null, null]), ...labelIs(pr, 0, 'A randomized experiment')];
  if (/A news story says/.test(text)) return [...expectSteps(pr, [null, null]), ...labelIs(pr, 0, 'No, it was a survey, so it only shows an association')];
  const c = CORR.find((x) => text.includes(`between ${x.a} and ${x.b}`))!;
  if (/lurking variable/.test(text)) return [...expectSteps(pr, [null, null]), ...labelIs(pr, 0, 'Affects both variables in the study')];
  return [...expectSteps(pr, [null, null, null]), ...labelIs(pr, 0, 'No, it only shows that they tend to change together'), ...labelIs(pr, 1, c.lurking)];
});

export const U7_BIVARIATE_GENERATORS: GeneratorDef[] = [genScatter, genLinearModel, genRegression, genChooseModel, genCausation];
