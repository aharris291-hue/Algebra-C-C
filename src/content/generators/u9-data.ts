/**
 * Capstone U9L03: Investigating Data.
 *
 * One statistical investigation worked through the modeling cycle: Jordan surveys 12 students about
 * this morning's trip to school (bus or car, distance from home, commute time). The tasks define the
 * quantities, measure one student's straight-line distance on a scaled town map (S8.06), compare the
 * bus and car riders' commute times with the right measures (S7.05), write and use the least-squares
 * line and judge its fit from r (S7.08), question a cause-and-effect claim (S7.10) and check a
 * prediction far outside the data (S7.08).
 *
 * Every task builds the same situation from the shared seed by calling scenario(rng) first; scenario
 * redraws internally until every condition the tasks rely on holds (exactly one outlier among the bus
 * times and none among the car times, a strong r, a shown prediction that matches the exact fit at the
 * tenths, and so on), so a task never rejects its draw.
 *
 * Statistics follow the course conventions in stats.ts (median left out of both halves for odd n,
 * 1.5·IQR outlier rule, least-squares line). verify() re-reads the data table, lists and map points
 * from the prompt and recomputes everything with its own routines (quartiles by halves, the normal
 * equations for the line, raw sums for r, the distance formula), then checks the key.
 */
import type { Block, CapstoneContent, GeneratorDef, GraphSpec, Problem, Rng } from '../../core/curriculum/types';
import { Rational } from '../../core/math/rational';
import { parseRelation } from '../../core/math/answers';
import { evalNumeric } from '../../core/math/evaluate';
import { fiveNumber, linearRegression, mean, outliers, rats } from '../../core/math/stats';
import { p, makeProblem, makeChoice, choiceLabel, numStr, Q, numberMisconceptions, stringMisconceptions } from './util';

const N_TASKS = 9;
const head = (k: number, title: string, recap: string): Block => p(`**Part ${k} of ${N_TASKS}: ${title}.** ${recap}`);

// ---------------------------------------------------------------------------
// The shared scenario
// ---------------------------------------------------------------------------

type Ride = 'Bus' | 'Car';
interface Student {
  name: string;
  ride: Ride;
  /** miles, to the tenth */
  dist: Rational;
  /** whole minutes */
  time: number;
}
interface Scenario {
  school: string;
  /** school and the featured student's home on the town map (grid units; each unit is 0.5 mile) */
  S: { x: number; y: number };
  H: { x: number; y: number };
  feat: string;
  students: Student[];
  /** regression output as a calculator shows it: slope and intercept to the hundredth, r to the hundredth */
  a: Rational;
  b: Rational;
  /** r to the hundredth, as text */
  r: string;
  exactA: Rational;
  exactB: Rational;
  newName: string;
  d0: Rational;
  teacher: string;
  far: number;
}

const NAMES = ['Ava', 'Mateo', 'Zoe', 'Liam', 'Priya', 'Elijah', 'Sofia', 'Marcus', 'Hannah', 'Diego', 'Grace', 'Isaiah', 'Chloe', 'Andre', 'Lily', 'Omar'];
const SCHOOLS = ['Riverside High', 'Oak Grove High', 'Pine Ridge High', 'Cedar Creek High', 'Lakeview High'];
const TEACHERS = ['Ms. Rivera', 'Mr. Okafor', 'Ms. Chen', 'Mr. Patel', 'Ms. Brooks'];
const SCALE = Q(1, 2);
const SCALE_TEXT = '0.5 mile';

const tenths = (lo: number, hi: number, rng: Rng) => Q(rng.int(Math.round(lo * 10), Math.round(hi * 10)), 10);

function scenario(rng: Rng): Scenario {
  for (;;) {
    const names = rng.shuffle([...NAMES]);
    const school = rng.pick(SCHOOLS);
    const teacher = rng.pick(TEACHERS);
    const m = rng.pick([2.5, 3, 3.5]);
    const b0 = rng.int(3, 7);
    const S = { x: rng.int(-3, 3), y: rng.int(-3, 3) };
    const dx = rng.nonzeroInt(-8, 8);
    const dy = rng.nonzeroInt(-8, 8);
    const n = dx * dx + dy * dy;
    const H = { x: S.x + dx, y: S.y + dy };
    const featExact = Math.sqrt(n) / 2;
    const frac = (featExact * 10) % 1;
    const far = rng.int(25, 40);
    const d0 = tenths(1.2, 4.8, rng);
    const timeOf = (d: Rational) => Math.round(m * d.toNumber() + b0 + (rng.next() * 6 - 3));
    const featDist = Rational.parse(featExact.toFixed(12)).round(1);
    const busD = [featDist, ...Array.from({ length: 5 }, () => tenths(1.8, 5.5, rng)), tenths(8.5, 11, rng)];
    const carD = Array.from({ length: 5 }, () => tenths(0.6, 3.5, rng));
    const students: Student[] = [
      ...busD.map((d, i) => ({ name: names[i], ride: 'Bus' as Ride, dist: d, time: timeOf(d) })),
      ...carD.map((d, i) => ({ name: names[7 + i], ride: 'Car' as Ride, dist: d, time: timeOf(d) })),
    ];
    // the featured student's distance: not a whole number of grid units, between 2 and 5 miles, not near a rounding boundary
    if (Number.isInteger(Math.sqrt(n)) || featExact < 2 || featExact > 5 || Math.abs(frac - 0.5) < 0.03) continue;
    if (Math.abs(H.x) > 11 || Math.abs(H.y) > 11) continue;
    const busT = rats(students.filter((s) => s.ride === 'Bus').map((s) => s.time));
    const carT = rats(students.filter((s) => s.ride === 'Car').map((s) => s.time));
    const ob = outliers(busT);
    if (ob.length !== 1 || !ob[0].eq(students[6].time) || outliers(carT).length) continue;
    const fb = fiveNumber(busT);
    const fc = fiveNumber(carT);
    if (fb.q1.eq(fb.median) || fb.median.eq(fb.q3) || fc.q1.eq(fc.median) || fc.median.eq(fc.q3)) continue;
    if (!fb.median.gt(fc.median) || fb.q3.sub(fb.q1).eq(fc.q3.sub(fc.q1))) continue;
    // bus riders live farther on average (the lurking variable in Part 8); car times stay realistic
    if (!mean(busD).gt(mean(carD)) || carT.some((t) => t.lt(4))) continue;
    // the new student's distance lies inside the surveyed distances (interpolation)
    if (!students.some((st) => st.dist.lt(d0)) || !students.some((st) => st.dist.gt(d0))) continue;
    const reg = linearRegression(
      students.map((s) => s.dist),
      rats(students.map((s) => s.time)),
    );
    if (reg.r < 0.85 || reg.r > 0.98) continue;
    // r is shown to the hundredth; stay clear of a rounding tie so every route rounds it the same way
    if (Math.abs(((reg.r * 100) % 1) - 0.5) < 1e-6) continue;
    const a = reg.a.round(2);
    const b = reg.b.round(2);
    if (!a.gt(0) || !b.gt(0)) continue;
    // a student who runs the regression on the table gets the same prediction to the tenth
    if (!reg.a.mul(d0).add(reg.b).round(1).eq(a.mul(d0).add(b).round(1))) continue;
    const pred = a.mul(d0).add(b);
    if (pred.mul(10).sub(pred.mul(10).round(0)).abs().eq(Q(1, 2))) continue;
    const order = rng.shuffle(students.map((_, i) => i));
    return {
      school,
      S,
      H,
      feat: names[0],
      students: order.map((i) => students[i]),
      a,
      b,
      r: reg.r.toFixed(2),
      exactA: reg.a,
      exactB: reg.b,
      newName: names[12],
      d0,
      teacher,
      far,
    };
  }
}

// ---------------------------------------------------------------------------
// Prompt pieces
// ---------------------------------------------------------------------------

const survey = (sc: Scenario) => `At ${sc.school}, Jordan surveyed 12 students about their trip to school this morning: how they got there (bus or car), how far they live from school, and how many minutes the trip took.`;
const dist1 = (d: Rational) => d.toDecimalString(1).includes('.') ? d.toDecimalString(1) : `${d.toDecimalString(1)}.0`;
const tableBlock = (sc: Scenario): Block => ({
  t: 'table',
  headers: ['Student', 'Ride', 'Distance (miles)', 'Time (minutes)'],
  rows: sc.students.map((s) => [s.name, s.ride, dist1(s.dist), String(s.time)]),
  caption: 'Jordan’s survey (distances are straight-line distances rounded to the nearest tenth of a mile)',
});
const timesOf = (sc: Scenario, ride: Ride) => sc.students.filter((s) => s.ride === ride).map((s) => s.time);
const listText = (xs: number[]) => xs.join(', ');
function dotPlots(sc: Scenario): Block[] {
  const all = sc.students.map((s) => s.time);
  const min = Math.floor(Math.min(...all) / 5) * 5 - 5;
  const max = Math.ceil(Math.max(...all) / 5) * 5 + 5;
  return (['Bus', 'Car'] as const).map((ride) => ({
    t: 'dataplot',
    spec: { kind: 'dot', min: Math.max(0, min), max, step: 1, axisLabel: `${ride} riders: commute time (minutes)`, values: timesOf(sc, ride), ariaLabel: `Dot plot of the ${ride.toLowerCase()} riders' commute times in minutes: ${listText([...timesOf(sc, ride)].sort((u, v) => u - v))}.` },
  }));
}
function scatterGraph(sc: Scenario, withLine: boolean): GraphSpec {
  const xs = sc.students.map((s) => s.dist.toNumber());
  const ys = sc.students.map((s) => s.time);
  const xMax = Math.ceil(Math.max(...xs)) + 1;
  const yMax = Math.ceil(Math.max(...ys, sc.a.toNumber() * xMax + sc.b.toNumber()) / 5) * 5 + 5;
  return {
    xMin: 0,
    xMax,
    yMin: 0,
    yMax,
    xStep: 1,
    yStep: 5,
    xLabel: 'Distance from school (miles)',
    yLabel: 'Commute time (minutes)',
    scatter: sc.students.map((s) => ({ x: s.dist.toNumber(), y: s.time })),
    ...(withLine ? { showLineOfFit: { m: sc.a.toNumber(), b: sc.b.toNumber() } } : {}),
    ariaLabel: `Scatter plot of commute time in minutes against distance from school in miles for 12 students: ${sc.students.map((s) => `(${dist1(s.dist)}, ${s.time})`).join(', ')}.${withLine ? ' The line of best fit is drawn.' : ''}`,
  };
}
const signed = (b: Rational) => (b.isNegative() ? `- ${numStr(b.abs())}` : `+ ${numStr(b)}`);
const modelTex = (sc: Scenario) => `\\hat{t} = ${numStr(sc.a)}d ${signed(sc.b)},\\quad r = ${sc.r}`;
const modelRecap = (sc: Scenario) => `Jordan's line of best fit is $\\hat{t} = ${numStr(sc.a)}d ${signed(sc.b)}$, where $d$ is the distance from school in miles and $\\hat{t}$ is the predicted commute time in minutes, with correlation coefficient $r = ${sc.r}$.`;

// ---------------------------------------------------------------------------
// Independent routines used by verify()
// ---------------------------------------------------------------------------

const textAll = (pr: Pick<Problem, 'prompt'>) => pr.prompt.map((b) => (b.t === 'p' ? b.text : b.t === 'math' ? b.tex : '')).join(' ');
const labelOf = (pr: Problem) => (pr.answer.kind === 'choice' ? choiceLabel(pr.answer) : '');
interface Row { name: string; ride: string; d: Rational; t: Rational }
function readTable(pr: Pick<Problem, 'prompt'>): Row[] | null {
  for (const b of pr.prompt) if (b.t === 'table' && b.headers[0] === 'Student') return b.rows.map((r) => ({ name: r[0], ride: r[1], d: Rational.parse(r[2]), t: Rational.parse(r[3]) }));
  return null;
}
function readList(text: string, who: string): Rational[] | null {
  const m = new RegExp(`The ${who} riders' commute times, in minutes, are ([\\d, ]+)\\.`).exec(text);
  return m ? m[1].split(',').map((s) => Rational.parse(s.trim())) : null;
}
const vSort = (xs: Rational[]) => [...xs].sort((u, v) => u.toNumber() - v.toNumber());
const vSum = (xs: Rational[]) => xs.reduce((s, x) => s.add(x), Q(0));
const vMean = (xs: Rational[]) => vSum(xs).div(xs.length);
function vMid(s: Rational[]): Rational {
  const k = s.length;
  return k % 2 ? s[(k - 1) / 2] : s[k / 2 - 1].add(s[k / 2]).div(2);
}
/** Q1, median, Q3 by halves of the ordered list, the median left out when the count is odd. */
function vQuart(xs: Rational[]): [Rational, Rational, Rational] {
  const s = vSort(xs);
  const k = s.length;
  const lower = s.slice(0, Math.floor(k / 2));
  const upper = s.slice(Math.ceil(k / 2));
  return [vMid(lower), vMid(s), vMid(upper)];
}
function vHasOutlier(xs: Rational[]): boolean {
  const [q1, , q3] = vQuart(xs);
  const step = q3.sub(q1).mul(Q(3, 2));
  return xs.some((x) => x.lt(q1.sub(step)) || x.gt(q3.add(step)));
}
/** Least-squares line from the normal equations, and r from raw sums. */
function vFit(rows: Row[]): { a: Rational; b: Rational; r: number } {
  const n = rows.length;
  const sx = vSum(rows.map((q) => q.d));
  const sy = vSum(rows.map((q) => q.t));
  const sxx = vSum(rows.map((q) => q.d.mul(q.d)));
  const syy = vSum(rows.map((q) => q.t.mul(q.t)));
  const sxy = vSum(rows.map((q) => q.d.mul(q.t)));
  const num = sxy.mul(n).sub(sx.mul(sy));
  const a = num.div(sxx.mul(n).sub(sx.mul(sx)));
  const b = sy.sub(a.mul(sx)).div(n);
  const r = num.toNumber() / Math.sqrt(sxx.mul(n).sub(sx.mul(sx)).toNumber() * syy.mul(n).sub(sy.mul(sy)).toNumber());
  return { a, b, r };
}
function readModel(text: string): { a: Rational; b: Rational; r: number } | null {
  const m = /\\hat\{t\} = ([\d.]+)d ([+-]) ([\d.]+)\$?,?(?:\\quad)? .*?r = (-?[\d.]+)/.exec(text);
  return m ? { a: Rational.parse(m[1]), b: Rational.parse(m[3]).mul(m[2] === '-' ? -1 : 1), r: Number(m[4]) } : null;
}
/** The shown regression output must be the table's least-squares line, rounded as a calculator shows it. */
function checkOutput(pr: Problem): { rows: Row[]; fit: { a: Rational; b: Rational; r: number }; shown: { a: Rational; b: Rational; r: number } } | string {
  const rows = readTable(pr);
  if (!rows || rows.length !== 12) return 'no data table';
  const fit = vFit(rows);
  const text = textAll(pr);
  const calc = /a = ([\d.]+),\\quad b = (-?[\d.]+),\\quad r = ([\d.]+)/.exec(text);
  const shown = calc ? { a: Rational.parse(calc[1]), b: Rational.parse(calc[2]), r: Number(calc[3]) } : readModel(text);
  if (!shown) return 'no regression output';
  if (!fit.a.round(2).eq(shown.a) || !fit.b.round(2).eq(shown.b) || Math.abs(fit.r - shown.r) > 0.0051) return 'regression output does not match the data';
  return { rows, fit, shown };
}

// ---------------------------------------------------------------------------
// Part 1: define the quantities (S7.08)
// ---------------------------------------------------------------------------

const DEF_OK = 'x = distance from home to school (miles); y = commute time (minutes); groups: bus riders and car riders';
const DEF_WRONG = [
  'x = commute time (minutes); y = distance from home to school (miles); groups: bus riders and car riders',
  'x = distance from home to school (miles); y = commute time (minutes); groups: students who live near school and students who live far away',
  'x = number of students surveyed; y = commute time (minutes); groups: bus riders and car riders',
];

const task1: GeneratorDef = {
  id: 'u9.data.1',
  skillId: 'S7.08',
  description: 'Capstone (data): define the explanatory, response and grouping variables for a statistical question about commutes.',
  generate(rng) {
    const sc = scenario(rng);
    return makeProblem({
      skillId: 'S7.08',
      tags: ['real-world'],
      prompt: [
        head(1, 'Define the quantities', `${survey(sc)} Jordan's statistical question is: "At ${sc.school}, do students who live farther from school tend to take longer to get there, and do bus riders and car riders differ in their commute times?" Jordan plans to make a scatter plot and use distance to predict commute time, and to compare two groups.`),
        p('Which set of definitions fits Jordan’s question and plan?'),
      ],
      answer: makeChoice(rng, DEF_OK, DEF_WRONG),
      hints: [
        'The explanatory variable (x) is the one you use to make the prediction.',
        'The response variable (y) is the one you want to predict.',
        'Jordan wants to predict commute time from distance.',
        'Reread the second half of the question to see which two groups are compared.',
      ],
      solution: [
        { text: 'x is the distance from home to school, in miles.', why: 'Jordan uses distance to predict, so distance is the explanatory variable and goes on the horizontal axis.' },
        { text: 'y is the commute time, in minutes.', why: 'Commute time is the quantity being predicted, so it is the response variable.' },
        { text: 'The groups are bus riders and car riders.', why: 'The question asks whether these two groups differ, so how a student gets to school is the grouping (categorical) variable.' },
        { text: DEF_OK + '.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['kind'];
    const fits = (l: string) => {
      const m = /^x = (.+?) \((\w+)\); y = (.+?) \((\w+)\); groups: (.+)$/.exec(l);
      return !!m && /distance/.test(m[1]) && m[2] === 'miles' && /commute time/.test(m[3]) && m[4] === 'minutes' && /bus/.test(m[5]) && /car/.test(m[5]);
    };
    const text = textAll(pr);
    if (!/use distance to predict commute time/.test(text) || !/bus riders and car riders differ/.test(text)) return ['question not stated'];
    if (pr.answer.options.filter((o) => fits(o.label)).length !== 1) return ['options ambiguous'];
    return fits(labelOf(pr)) ? [] : ['definitions wrong'];
  },
};

// ---------------------------------------------------------------------------
// Part 2: distance on the scaled map (S8.06)
// ---------------------------------------------------------------------------

function mapGraph(sc: Scenario): GraphSpec {
  const xs = [sc.S.x, sc.H.x];
  const ys = [sc.S.y, sc.H.y];
  let xMin = Math.min(-1, Math.min(...xs) - 2);
  let xMax = Math.max(1, Math.max(...xs) + 2);
  let yMin = Math.min(-1, Math.min(...ys) - 2);
  let yMax = Math.max(1, Math.max(...ys) + 2);
  // equal unit lengths on screen (the plot area is about 1.27 times as wide as it is tall)
  const ASPECT = 380 / 300;
  const w = xMax - xMin;
  const h = yMax - yMin;
  if (w / h < ASPECT) {
    const extra = Math.round(h * ASPECT) - w;
    xMin -= Math.floor(extra / 2);
    xMax += Math.ceil(extra / 2);
  } else {
    const extra = Math.round(w / ASPECT) - h;
    yMin -= Math.floor(extra / 2);
    yMax += Math.ceil(extra / 2);
  }
  return {
    xMin,
    xMax,
    yMin,
    yMax,
    xStep: 1,
    yStep: 1,
    points: [
      { x: sc.S.x, y: sc.S.y, label: 'S' },
      { x: sc.H.x, y: sc.H.y, label: 'H' },
    ],
    segments: [{ x1: sc.S.x, y1: sc.S.y, x2: sc.H.x, y2: sc.H.y, dashed: true }],
    ariaLabel: `Town map grid with the school S at (${sc.S.x}, ${sc.S.y}) and the home H at (${sc.H.x}, ${sc.H.y}), joined by a dashed segment.`,
  };
}
const neg = (n: number) => (n < 0 ? `(${n})` : `${n}`);

const task2: GeneratorDef = {
  id: 'u9.data.2',
  skillId: 'S8.06',
  description: 'Capstone (data): find a student’s straight-line distance to school from coordinates on a scaled town map.',
  generate(rng) {
    const sc = scenario(rng);
    const dx = sc.H.x - sc.S.x;
    const dy = sc.H.y - sc.S.y;
    const n = dx * dx + dy * dy;
    const v = Math.sqrt(n) / 2;
    const key = Rational.parse(v.toFixed(12));
    return makeProblem({
      skillId: 'S8.06',
      tags: ['real-world', 'graph'],
      prompt: [
        head(2, 'Measure a distance on the map', `${survey(sc)} To find each distance, Jordan uses a town map drawn on a coordinate grid where each grid unit is ${SCALE_TEXT}. The school is at $S(${sc.S.x}, ${sc.S.y})$ and ${sc.feat}'s home is at $H(${sc.H.x}, ${sc.H.y})$.`),
        { t: 'graph', spec: mapGraph(sc) },
        p(`What is the straight-line distance from ${sc.feat}'s home to the school, in miles? Round to the nearest tenth of a mile.`),
      ],
      answer: { kind: 'number', value: key.toDecimalString(12), roundTo: 1, unit: 'miles' },
      hints: [
        'Find the distance in grid units first, then convert to miles.',
        'Use the distance formula $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$ with S and H.',
        `Keep the square root exact for now. Each grid unit is ${SCALE_TEXT}, so multiply the grid distance by 0.5.`,
        'Round to the nearest tenth only at the very end.',
      ],
      solution: [
        { text: 'Find the horizontal and vertical changes in grid units.', tex: `\\Delta x = ${sc.H.x} - ${neg(sc.S.x)} = ${dx},\\quad \\Delta y = ${sc.H.y} - ${neg(sc.S.y)} = ${dy}`, why: 'Subtract the coordinates in the same order for x and for y.' },
        { text: 'Use the distance formula for the distance in grid units.', tex: `\\sqrt{${neg(dx)}^2 + ${neg(dy)}^2} = \\sqrt{${dx * dx} + ${dy * dy}} = \\sqrt{${n}}`, why: 'The straight-line path is the hypotenuse of a right triangle with legs along the grid.' },
        { text: 'Convert grid units to miles and round.', tex: `\\sqrt{${n}} \\times 0.5 \\approx ${v.toFixed(3)} \\approx ${v.toFixed(1)}\\text{ miles}`, why: 'Each grid unit stands for 0.5 mile; rounding only at the end keeps the tenths digit right.' },
      ],
      misconceptions: numberMisconceptions(key.round(1), [
        { value: Rational.parse(Math.sqrt(n).toFixed(1)), tag: 'units', feedback: `That is the distance in grid units. Each grid unit is ${SCALE_TEXT}, so convert to miles.` },
        { value: Rational.parse((2 * Math.sqrt(n)).toFixed(1)), tag: 'units', feedback: 'Each grid unit is half a mile, so the distance in miles is smaller than the distance in grid units. Multiply by 0.5 instead of dividing.' },
        { value: SCALE.mul(Math.abs(dx) + Math.abs(dy)), tag: 'formula-error', feedback: 'That is the distance along the streets (across, then up or down). The straight-line distance uses the distance formula.' },
      ]),
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const sm = /S\((-?\d+), (-?\d+)\)/.exec(text);
    const hm = /H\((-?\d+), (-?\d+)\)/.exec(text);
    const scale = /each grid unit is ([\d.]+) mile/.exec(text);
    if (!sm || !hm || !scale || pr.answer.kind !== 'number' || pr.answer.roundTo !== 1) return ['cannot read map'];
    // compare squared lengths: (scale)^2 times the dot product of the displacement with itself
    const u = { x: Number(hm[1]) - Number(sm[1]), y: Number(hm[2]) - Number(sm[2]) };
    const sq = Number(scale[1]) ** 2 * (u.x * u.x + u.y * u.y);
    const got = Rational.parse(pr.answer.value).toNumber();
    return Math.abs(got * got - sq) < 1e-6 && got > 0 ? [] : ['distance wrong'];
  },
};

// ---------------------------------------------------------------------------
// Part 3: IQR of the bus riders' times (S7.05)
// ---------------------------------------------------------------------------

const task3: GeneratorDef = {
  id: 'u9.data.3',
  skillId: 'S7.05',
  description: 'Capstone (data): find the interquartile range of one group’s commute times.',
  generate(rng) {
    const sc = scenario(rng);
    const bus = timesOf(sc, 'Bus');
    const R = rats(bus);
    const f = fiveNumber(R);
    const key = f.q3.sub(f.q1);
    const s = [...bus].sort((u, v) => u - v);
    const lower = s.slice(0, 3);
    const upper = s.slice(4);
    // the mistake of keeping the median in both halves (halves of 4)
    const keepMid = vMid(rats(s.slice(3))).sub(vMid(rats(s.slice(0, 4))));
    return makeProblem({
      skillId: 'S7.05',
      tags: ['real-world'],
      prompt: [
        head(3, 'Summarize the bus riders', `${survey(sc)} Seven of the students rode the bus. The bus riders' commute times, in minutes, are ${listText(bus)}.`),
        dotPlots(sc)[0],
        p('Find the interquartile range (IQR) of the bus riders’ commute times.'),
      ],
      answer: { kind: 'number', value: numStr(key), unit: 'minutes' },
      hints: [
        'The IQR measures the spread of the middle half of the data.',
        'Put the seven times in order and find the median (the middle value).',
        'With an odd number of values, leave the median out of both halves. Q1 is the median of the lower three values and Q3 is the median of the upper three.',
        'Subtract: IQR = Q3 − Q1.',
      ],
      solution: [
        { text: 'Order the times.', tex: s.join(',\\ '), why: 'Quartiles are found from ordered data.' },
        { text: 'Find the median.', tex: `\\text{median} = ${numStr(f.median)}`, why: 'With 7 values, the median is the 4th value.' },
        { text: 'Find Q1 and Q3 from the halves.', tex: `\\text{lower: } ${lower.join(', ')} \\Rightarrow Q_1 = ${numStr(f.q1)};\\quad \\text{upper: } ${upper.join(', ')} \\Rightarrow Q_3 = ${numStr(f.q3)}`, why: 'For an odd number of values the median is left out of both halves (the course convention, as on a TI-84).' },
        { text: 'Subtract.', tex: `\\text{IQR} = ${numStr(f.q3)} - ${numStr(f.q1)} = ${numStr(key)}\\text{ minutes}`, why: 'The middle half of the bus riders’ times spans this many minutes. The long trip at the top does not change it.' },
      ],
      misconceptions: numberMisconceptions(key, [
        { value: f.max.sub(f.min), tag: 'statistics-concept', feedback: 'That is the range (maximum minus minimum). The IQR uses the quartiles: Q3 − Q1.' },
        { value: keepMid, tag: 'statistics-concept', feedback: 'With an odd number of values, leave the median out of both halves before finding Q1 and Q3.' },
        { value: f.q3, tag: 'statistics-concept', feedback: 'That is Q3. The IQR is the difference Q3 − Q1.' },
      ]),
    });
  },
  verify(pr) {
    const xs = readList(textAll(pr), 'bus');
    if (!xs || xs.length !== 7 || pr.answer.kind !== 'number') return ['cannot read list'];
    const [q1, , q3] = vQuart(xs);
    return Rational.parse(pr.answer.value).eq(q3.sub(q1)) ? [] : ['IQR wrong'];
  },
};

// ---------------------------------------------------------------------------
// Part 4: compare the groups with the right measures (S7.05)
// ---------------------------------------------------------------------------

function compareLabels(bus: Rational[], car: Rational[]) {
  const [bq1, bm, bq3] = vQuart(bus);
  const [cq1, cm, cq3] = vQuart(car);
  const bi = bq3.sub(bq1);
  const ci = cq3.sub(cq1);
  const wider = bi.gt(ci) ? 'bus' : 'car';
  const other = wider === 'bus' ? 'car' : 'bus';
  const center = `Bus riders typically took longer (median ${numStr(bm)} vs ${numStr(cm)} minutes)`;
  const spread = (w: string) => `the ${w} riders' times varied more in the middle half (IQR ${numStr(bi)} vs ${numStr(ci)} minutes)`;
  const fmt1 = (x: Rational) => x.round(1).toDecimalString(1);
  return {
    correct: `Use medians and IQRs, because the bus times have an outlier. ${center}, and ${spread(wider)}.`,
    wrongSpread: `Use medians and IQRs, because the bus times have an outlier. ${center}, and ${spread(other)}.`,
    wrongReason: `Use medians and IQRs, because the two groups have different numbers of students. ${center}, and ${spread(wider)}.`,
    means: `Use means and standard deviations, because they use every value. The bus riders' mean is about ${fmt1(vMean(bus))} minutes and the car riders' mean is about ${fmt1(vMean(car))} minutes.`,
    bm,
    cm,
    bi,
    ci,
  };
}

const task4: GeneratorDef = {
  id: 'u9.data.4',
  skillId: 'S7.05',
  description: 'Capstone (data): choose measures of center and spread that suit the shapes of two groups and compare the groups.',
  generate(rng) {
    const sc = scenario(rng);
    const bus = timesOf(sc, 'Bus');
    const car = timesOf(sc, 'Car');
    const L = compareLabels(rats(bus), rats(car));
    const fb = fiveNumber(rats(bus));
    const fc = fiveNumber(rats(car));
    return makeProblem({
      skillId: 'S7.05',
      tags: ['real-world', 'graph', 'multi-step'],
      prompt: [
        head(4, 'Compare the bus and car riders', `${survey(sc)} The bus riders' commute times, in minutes, are ${listText(bus)}. The car riders' commute times, in minutes, are ${listText(car)}.`),
        ...dotPlots(sc),
        p('Which comparison uses the right measures, for the correct reason, and is supported by the data?'),
      ],
      answer: makeChoice(rng, L.correct, [L.wrongSpread, L.wrongReason, L.means]),
      hints: [
        'Look at the shape of each dot plot. Is there a value far from the rest?',
        'An outlier pulls the mean and the standard deviation, but not the median or the IQR.',
        'Find the median and the IQR of each group (leave the median out of the halves when the count is odd).',
        'Compare the medians for the center and the IQRs for the spread, then check each sentence against your numbers.',
      ],
      solution: [
        { text: 'Check the shapes.', why: `The bus times include one long trip, ${fb.max.toString()} minutes, beyond Q3 + 1.5·IQR, so it is an outlier. The car times have no outlier. Because one group has an outlier, compare both groups with the resistant measures: median and IQR.` },
        { text: 'Bus riders: five-number summary.', tex: `${[fb.min, fb.q1, fb.median, fb.q3, fb.max].map(numStr).join(',\\ ')} \\Rightarrow \\text{median} = ${numStr(L.bm)},\\ \\text{IQR} = ${numStr(L.bi)}` },
        { text: 'Car riders: five-number summary.', tex: `${[fc.min, fc.q1, fc.median, fc.q3, fc.max].map(numStr).join(',\\ ')} \\Rightarrow \\text{median} = ${numStr(L.cm)},\\ \\text{IQR} = ${numStr(L.ci)}`, why: 'With 5 values the median is the 3rd value, and each half has 2 values.' },
        { text: L.correct, why: 'A full comparison states the measures used, compares the centers and compares the spreads in context.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const bus = readList(text, 'bus');
    const car = readList(text, 'car');
    if (!bus || !car || pr.answer.kind !== 'choice') return ['cannot read lists'];
    if (!vHasOutlier(bus) || vHasOutlier(car)) return ['outlier pattern not as described'];
    const L = compareLabels(bus, car);
    if (!L.bm.gt(L.cm) || L.bi.eq(L.ci)) return ['groups not clearly different'];
    const label = labelOf(pr);
    return label === L.correct && pr.answer.options.filter((o) => o.label === L.correct).length === 1 ? [] : ['comparison wrong'];
  },
};

// ---------------------------------------------------------------------------
// Part 5: write the model (S7.08)
// ---------------------------------------------------------------------------

const calcTex = (sc: Scenario) => `y = ax + b:\\quad a = ${numStr(sc.a)},\\quad b = ${numStr(sc.b)},\\quad r = ${sc.r}`;

const task5: GeneratorDef = {
  id: 'u9.data.5',
  skillId: 'S7.08',
  description: 'Capstone (data): write the least-squares line from technology output using the variables of the situation.',
  generate(rng) {
    const sc = scenario(rng);
    const eq = `t = ${numStr(sc.a)}d ${signed(sc.b)}`;
    return makeProblem({
      skillId: 'S7.08',
      tags: ['real-world', 'graph'],
      prompt: [
        head(5, 'Write the model', `${survey(sc)} Jordan entered the distances as x and the commute times as y in a graphing calculator and ran a linear regression. The data and the calculator's output are below.`),
        tableBlock(sc),
        { t: 'graph', spec: scatterGraph(sc, false) },
        { t: 'math', tex: calcTex(sc) },
        p('Write the equation of the line of best fit using $t$ for the predicted commute time in minutes and $d$ for the distance from school in miles.'),
      ],
      answer: { kind: 'equation', value: eq },
      inputHint: 'Type an equation that starts with t =',
      hints: [
        'The calculator writes the line as y = ax + b.',
        'x stands for the distance and y stands for the commute time.',
        'a is the slope (the number multiplied by the distance), and b is the y-intercept.',
        'Replace y with t and x with d, then put in the values of a and b.',
      ],
      solution: [
        { text: 'Match the calculator’s letters to the situation.', tex: 'x \\to d,\\quad y \\to t', why: 'Jordan entered distance as x and commute time as y.' },
        { text: 'Substitute the slope and intercept.', tex: eq, why: `a = ${numStr(sc.a)} is the slope and b = ${numStr(sc.b)} is the intercept, so the model is t = a·d + b.` },
      ],
      misconceptions: stringMisconceptions(eq, [
        { answer: `t = ${numStr(sc.b)}d ${signed(sc.a)}`, tag: 'equation-setup', feedback: 'In y = ax + b, a multiplies x. Check which number is the slope and which is the intercept.' },
        { answer: `d = ${numStr(sc.a)}t ${signed(sc.b)}`, tag: 'equation-setup', feedback: 'The model predicts commute time from distance, so t is by itself on the left and d is on the right.' },
      ]),
    });
  },
  verify(pr) {
    const c = checkOutput(pr);
    if (typeof c === 'string') return [c];
    if (pr.answer.kind !== 'equation') return ['kind'];
    const rel = parseRelation(pr.answer.value);
    if (rel.lhs.type !== 'var' || rel.lhs.name !== 't') return ['equation not solved for t'];
    // evaluate the right side at two distances and compare with the least-squares line rounded to hundredths
    const at = (d: number) => evalNumeric(rel.rhs, { d });
    const a = c.fit.a.round(2).toNumber();
    const b = c.fit.b.round(2).toNumber();
    return Math.abs(at(0) - b) < 1e-9 && Math.abs(at(10) - (10 * a + b)) < 1e-9 ? [] : ['model equation wrong'];
  },
};

// ---------------------------------------------------------------------------
// Part 6: predict (S7.08)
// ---------------------------------------------------------------------------

const task6: GeneratorDef = {
  id: 'u9.data.6',
  skillId: 'S7.08',
  description: 'Capstone (data): use the line of best fit to predict a commute time within the range of the data.',
  generate(rng) {
    const sc = scenario(rng);
    const y = sc.a.mul(sc.d0).add(sc.b);
    return makeProblem({
      skillId: 'S7.08',
      tags: ['real-world', 'graph'],
      prompt: [
        head(6, 'Use the model to predict', `${survey(sc)} ${modelRecap(sc)}`),
        tableBlock(sc),
        { t: 'graph', spec: scatterGraph(sc, true) },
        { t: 'math', tex: modelTex(sc) },
        p(`${sc.newName}, a new student, lives ${dist1(sc.d0)} miles from school. Use the line of best fit to predict ${sc.newName}'s commute time. Round to the nearest tenth of a minute.`),
      ],
      answer: { kind: 'number', value: numStr(y), roundTo: 1, unit: 'minutes' },
      hints: [
        'The line gives a predicted commute time for any distance d.',
        `Substitute the distance for $d$ in the equation.`,
        'Multiply the slope by the distance first, then add the intercept.',
        'Round only the final answer to the nearest tenth.',
      ],
      solution: [
        { text: 'Substitute the distance.', tex: `\\hat{t} = ${numStr(sc.a)}(${dist1(sc.d0)}) ${signed(sc.b)}`, why: 'The model turns a distance into a predicted time.' },
        { text: 'Simplify and round.', tex: `${numStr(sc.a.mul(sc.d0))} ${signed(sc.b)} = ${numStr(y)} \\approx ${y.round(1).toDecimalString(1)}\\text{ minutes}`, why: `This is a prediction: real students who live ${dist1(sc.d0)} miles away scatter around it.` },
      ],
      misconceptions: numberMisconceptions(y.round(1), [
        { value: sc.a.mul(sc.d0).round(1), tag: 'statistics-concept', feedback: 'Remember to add the intercept after multiplying.' },
        { value: sc.b.mul(sc.d0).add(sc.a).round(1), tag: 'equation-setup', feedback: 'The slope is the number multiplied by d. Check which number is the slope and which is the intercept.' },
      ]),
    });
  },
  verify(pr) {
    const c = checkOutput(pr);
    if (typeof c === 'string') return [c];
    const m = /lives ([\d.]+) miles from school\. Use the line/.exec(textAll(pr));
    if (!m || pr.answer.kind !== 'number' || pr.answer.roundTo !== 1) return ['cannot read distance'];
    const d0 = Rational.parse(m[1]);
    const xs = c.rows.map((q) => q.d.toNumber());
    if (d0.toNumber() < Math.min(...xs) || d0.toNumber() > Math.max(...xs)) return ['prediction is not inside the data'];
    // the exact least-squares line and the rounded line agree at the tenths
    if (!c.fit.a.mul(d0).add(c.fit.b).round(1).eq(c.shown.a.mul(d0).add(c.shown.b).round(1))) return ['rounded line and exact fit disagree'];
    const want = c.shown.b.add(c.shown.a.mul(d0));
    return Rational.parse(pr.answer.value).eq(want) ? [] : ['prediction wrong'];
  },
};

// ---------------------------------------------------------------------------
// Part 7: interpret the slope and judge the fit from r (S7.08)
// ---------------------------------------------------------------------------

const strength = (r: number) => (Math.abs(r) >= 0.8 ? 'strong' : Math.abs(r) >= 0.5 ? 'moderate' : 'weak');
function interpLabels(a: Rational, b: Rational, r: string) {
  return {
    correct: `For each additional mile from school, the predicted commute time increases by about ${numStr(a)} minutes, and r = ${r} shows a strong positive linear association, so the line fits the data well.`,
    intercept: `For each additional mile from school, the predicted commute time increases by about ${numStr(b)} minutes, and r = ${r} shows a strong positive linear association, so the line fits the data well.`,
    swapped: `For each additional minute of commute time, the predicted distance from school increases by about ${numStr(a)} miles, and r = ${r} shows a strong positive linear association, so the line fits the data well.`,
    weak: `For each additional mile from school, the predicted commute time increases by about ${numStr(a)} minutes, but r = ${r} shows only a weak linear association, so the line does not fit the data well.`,
  };
}

const task7: GeneratorDef = {
  id: 'u9.data.7',
  skillId: 'S7.08',
  description: 'Capstone (data): interpret the slope of the line of best fit in context and judge the fit from the correlation coefficient.',
  generate(rng) {
    const sc = scenario(rng);
    const r = sc.r;
    const L = interpLabels(sc.a, sc.b, r);
    return makeProblem({
      skillId: 'S7.08',
      tags: ['real-world', 'graph'],
      prompt: [
        head(7, 'Interpret the model', `${survey(sc)} ${modelRecap(sc)}`),
        tableBlock(sc),
        { t: 'graph', spec: scatterGraph(sc, true) },
        { t: 'math', tex: modelTex(sc) },
        p('Which statement correctly interprets the slope and what r says about the fit?'),
      ],
      answer: makeChoice(rng, L.correct, [L.intercept, L.swapped, L.weak]),
      hints: [
        'The slope is the number multiplied by d. Its units are minutes per mile.',
        'The slope tells how much the predicted y changes when x increases by 1.',
        'The sign of r gives the direction; its size tells how closely the points follow the line.',
        'Use the cutoffs: |r| ≥ 0.8 is strong, 0.5 ≤ |r| < 0.8 is moderate, |r| < 0.5 is weak.',
      ],
      solution: [
        { text: `The slope is ${numStr(sc.a)} minutes per mile.`, why: 'In the model the slope multiplies the distance, so each extra mile adds that many minutes to the predicted time. The intercept is the predicted time at 0 miles, not a rate.' },
        { text: `r = ${r} is positive and close to 1.`, why: 'A positive r means time tends to increase with distance, and |r| ≥ 0.8 means the points stay close to the line.' },
        { text: L.correct },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const c = checkOutput(pr);
    if (typeof c === 'string') return [c];
    if (strength(c.fit.r) !== 'strong' || c.fit.r < 0) return ['association not strong and positive'];
    const L = interpLabels(c.fit.a.round(2), c.fit.b.round(2), c.fit.r.toFixed(2));
    return labelOf(pr) === L.correct ? [] : ['interpretation wrong'];
  },
};

// ---------------------------------------------------------------------------
// Part 8: correlation versus causation (S7.10)
// ---------------------------------------------------------------------------

function causeLabels(bd: Rational, cd: Rational) {
  const f = (x: Rational) => x.round(1).toDecimalString(1);
  return {
    correct: `The claim is not supported. The bus riders in the survey live farther from school on average (about ${f(bd)} miles vs ${f(cd)} miles), so distance could explain their longer times. A survey shows an association, not cause and effect.`,
    median: 'The claim is supported, because the bus riders’ median commute time is greater than the car riders’ median commute time.',
    corr: 'The claim is supported, because the correlation between distance and commute time is strong.',
    none: 'The claim is not supported, because there is no association between how students get to school and their commute times.',
  };
}

const task8: GeneratorDef = {
  id: 'u9.data.8',
  skillId: 'S7.10',
  description: 'Capstone (data): recognize a lurking variable and explain why survey data do not show cause and effect.',
  generate(rng) {
    const sc = scenario(rng);
    const bd = mean(sc.students.filter((s) => s.ride === 'Bus').map((s) => s.dist));
    const cd = mean(sc.students.filter((s) => s.ride === 'Car').map((s) => s.dist));
    const L = causeLabels(bd, cd);
    return makeProblem({
      skillId: 'S7.10',
      tags: ['real-world'],
      prompt: [
        head(8, 'Question cause and effect', `${survey(sc)} Jordan found that the bus riders' median commute time is greater than the car riders'. A friend says: "So riding the bus makes your trip to school longer." The data come from a survey, not an experiment.`),
        tableBlock(sc),
        p('Which response to the friend’s claim is best?'),
      ],
      answer: makeChoice(rng, L.correct, [L.median, L.corr, L.none]),
      hints: [
        'Was anyone randomly assigned to ride the bus or go by car?',
        'Look for another variable that differs between the bus riders and the car riders.',
        'Compare the distances of the two groups in the table.',
        'If one group lives farther away, distance could be a lurking variable for the difference in times.',
      ],
      solution: [
        { text: 'Compare the groups’ average distances.', tex: `\\bar{d}_{\\text{bus}} \\approx ${bd.round(2).toDecimalString(2)},\\quad \\bar{d}_{\\text{car}} \\approx ${cd.round(2).toDecimalString(2)}`, why: 'The bus riders tend to live farther away, and farther trips take longer for anyone.' },
        { text: 'Distance is a lurking variable.', why: 'It is related both to how students get to school and to how long the trip takes, so it could explain the difference in medians.' },
        { text: L.correct, why: 'Only a randomized experiment can show cause and effect; a survey can only show an association.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const rows = readTable(pr);
    if (!rows || pr.answer.kind !== 'choice') return ['no data table'];
    const bus = rows.filter((q) => q.ride === 'Bus');
    const car = rows.filter((q) => q.ride === 'Car');
    const bd = vMean(bus.map((q) => q.d));
    const cd = vMean(car.map((q) => q.d));
    if (!bd.gt(cd)) return ['bus riders do not live farther'];
    if (!vQuart(bus.map((q) => q.t))[1].gt(vQuart(car.map((q) => q.t))[1])) return ['medians do not differ as stated'];
    if (!/survey, not an experiment/.test(textAll(pr))) return ['study type not stated'];
    const L = causeLabels(bd, cd);
    return labelOf(pr) === L.correct && pr.answer.options.filter((o) => /not supported/.test(o.label)).length === 2 ? [] : ['causation response wrong'];
  },
};

// ---------------------------------------------------------------------------
// Part 9: validate (extrapolation) (S7.08)
// ---------------------------------------------------------------------------

function extrapLabels(far: number, lo: string, hi: string, r: string) {
  return {
    correct: `Not much, because ${far} miles is far outside the distances in the data (${lo} to ${hi} miles), so the pattern may not continue; for example, a long trip may be mostly on a fast highway.`,
    rclose: `A lot, because r = ${r} is close to 1, so the line works for any distance.`,
    weak: 'Not much, because the association between distance and commute time is weak.',
    exact: 'A lot, because a line of best fit gives the exact commute time for any distance.',
  };
}

const task9: GeneratorDef = {
  id: 'u9.data.9',
  skillId: 'S7.08',
  description: 'Capstone (data): judge whether a prediction far outside the data is reliable (extrapolation).',
  generate(rng) {
    const sc = scenario(rng);
    const xs = sc.students.map((s) => s.dist);
    const lo = dist1(xs.reduce((u, v) => (v.lt(u) ? v : u)));
    const hi = dist1(xs.reduce((u, v) => (v.gt(u) ? v : u)));
    const pred = sc.a.mul(sc.far).add(sc.b);
    const r = sc.r;
    const L = extrapLabels(sc.far, lo, hi, r);
    return makeProblem({
      skillId: 'S7.08',
      tags: ['real-world', 'graph'],
      prompt: [
        head(9, 'Validate the model', `${survey(sc)} ${modelRecap(sc)}`),
        tableBlock(sc),
        { t: 'graph', spec: scatterGraph(sc, true) },
        { t: 'math', tex: modelTex(sc) },
        p(`${sc.teacher}, a teacher, lives ${sc.far} miles from school. The line predicts $\\hat{t} = ${numStr(sc.a)}(${sc.far}) ${signed(sc.b)} \\approx ${pred.round(1).toDecimalString(1)}$ minutes. How much should Jordan trust this prediction?`),
      ],
      answer: makeChoice(rng, L.correct, [L.rclose, L.weak, L.exact]),
      hints: [
        'A model is only checked against the data used to make it.',
        'Find the smallest and largest distances in the table.',
        `Is ${sc.far} miles inside that range or far outside it?`,
        'r describes how well the line fits the data you have, not what happens beyond them.',
      ],
      solution: [
        { text: `The distances in the data run from ${lo} to ${hi} miles, and r = ${r}.`, why: 'Within that range the line fits well.' },
        { text: `${sc.far} miles is far beyond the largest distance, so this prediction is an extrapolation.`, why: 'Nothing in the data shows how commute time behaves for such long trips; highways, traffic or a different route could change the pattern.' },
        { text: L.correct },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const c = checkOutput(pr);
    if (typeof c === 'string') return [c];
    const m = /lives (\d+) miles from school\. The line predicts/.exec(textAll(pr));
    if (!m) return ['cannot read distance'];
    const far = Number(m[1]);
    const xs = c.rows.map((q) => q.d);
    const lo = xs.reduce((u, v) => (v.lt(u) ? v : u));
    const hi = xs.reduce((u, v) => (v.gt(u) ? v : u));
    if (!(far > hi.toNumber() + (hi.toNumber() - lo.toNumber()) / 2)) return ['not an extrapolation'];
    if (Math.abs(c.fit.r) < 0.8) return ['association not strong'];
    const L = extrapLabels(far, dist1(lo), dist1(hi), c.fit.r.toFixed(2));
    return labelOf(pr) === L.correct ? [] : ['validation wrong'];
  },
};

// ---------------------------------------------------------------------------

export const CAP_DATA_GENERATORS: GeneratorDef[] = [task1, task2, task3, task4, task5, task6, task7, task8, task9];

export const CAP_DATA: CapstoneContent = {
  lessonId: 'U9L03',
  goal: 'Answer a statistical question about your school’s commutes with a map, a comparison of two groups and a line of best fit, and decide what the data can and cannot show.',
  intro: [
    p('Jordan wonders about the trip to school: **Do students who live farther from school take longer to get there, and do bus riders and car riders differ?**'),
    p('Jordan surveys 12 classmates. Each one reports how they got to school this morning (bus or car) and how many minutes the trip took. Jordan finds each student’s straight-line distance to school on a town map drawn on a coordinate grid.'),
    p('You will work through the whole investigation: define the quantities, measure a distance on the scaled map, compare the two groups with the right measures, fit and use a line of best fit, and then check what the model and the data really support.'),
    { t: 'callout', variant: 'tip', title: 'Course conventions', text: 'Quartiles: when the number of values is odd, leave the median out of both halves. Outliers: values beyond Q1 − 1.5·IQR or Q3 + 1.5·IQR. The line of best fit is the least-squares regression line, and r is the correlation coefficient.' },
  ],
  plan: ['Define the quantities', 'Measure a distance on the scaled map', 'Summarize and compare the two groups', 'Write the model', 'Use the model to predict', 'Interpret the slope and r', 'Question cause and effect', 'Validate the model'],
  tasks: [
    { part: 'Define the quantities', generator: 'u9.data.1' },
    { part: 'Measure a distance on the map', generator: 'u9.data.2' },
    { part: 'Summarize the bus riders', generator: 'u9.data.3' },
    { part: 'Compare the bus and car riders', generator: 'u9.data.4' },
    { part: 'Write the model', generator: 'u9.data.5' },
    { part: 'Use the model to predict', generator: 'u9.data.6' },
    { part: 'Interpret the model', generator: 'u9.data.7' },
    { part: 'Question cause and effect', generator: 'u9.data.8' },
    { part: 'Validate the model', generator: 'u9.data.9' },
  ],
  wrapUp: [
    p('The data answered Jordan’s question in two ways. Students who live farther away tend to have longer commutes: the line of best fit has a positive slope, and r close to 1 shows the points stay close to the line. Bus riders typically took longer than car riders, but they also tend to live farther away.'),
    p('The limits matter as much as the answers. A survey shows associations, not causes: distance is a lurking variable for the bus-versus-car difference, and only a randomized experiment could show that one way of getting to school causes longer trips. The line is trustworthy only for distances like those in the data; far outside them, the pattern may change.'),
    { t: 'callout', variant: 'why', title: 'Choose measures that fit the data', text: 'One unusually long bus trip pulled the bus riders’ mean upward but barely moved the median or the IQR. That is why the resistant measures (median and IQR) were the fair way to compare the groups.' },
  ],
};
