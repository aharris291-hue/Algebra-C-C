/**
 * Capstone U9L02: Launches, Growth and Decay. A science-club day with two investigations, each
 * walked through the modeling cycle (A.MM.1): Part A models a model-rocket launch with
 * h(t) = -16t^2 + v0 t + h0 (feet, seconds; the convention of the Unit 4 generators), Part B models
 * the fish population of the club's pond with percent growth y = a(1 + r)^t.
 *
 * Every task calls scenario(rng) first, so all tasks of one seed describe the same rocket and the
 * same pond. scenario() never fails: bad draws are redrawn inside it. verify() re-reads the numbers
 * from the prompt words and re-derives each key by another route (symmetry for the vertex,
 * bisection for the landing time, year-by-year percent steps for the fish).
 */
import type { Block, CapstoneContent, GeneratorDef, GraphSpec, Problem, Rng } from '../../core/curriculum/types';
import type { Misconception, MisconceptionTag } from '../../core/math/answers';
import { checkAnswer } from '../../core/math/answers';
import { parseExpression } from '../../core/math/parser';
import { evalNumeric } from '../../core/math/evaluate';
import { Poly } from '../../core/math/poly';
import { Rational } from '../../core/math/rational';
import { p, makeProblem, makeChoice, choiceLabel, numStr, Q, numberMisconceptions, texToExpr } from './util';
import { pTex, plainPoly, ev } from './u4-common';
import { dTex, pct, textOf } from './u5-common';

type Hints = [string, string, string, string];
const N = 9;

// ---------------------------------------------------------------------------
// The shared situation
// ---------------------------------------------------------------------------

interface Scenario {
  v0: number;
  h0: number;
  /** h(t) = -16t^2 + v0 t + h0 */
  h: Poly;
  /** time of the maximum, v0/32 */
  tv: Rational;
  /** maximum height, h0 + v0^2/64 */
  H: Rational;
  /** positive and negative solutions of h(t) = 0 */
  land: number;
  neg: number;
  species: string;
  a: Rational;
  /** yearly growth rate as a decimal */
  r: Rational;
  b: Rational;
  /** year asked for in the evaluation task */
  te: number;
  /** threshold and the first whole year above it */
  thr: number;
  n: number;
  /** year of the linear comparison and of the long-run check */
  tc: number;
  tl: number;
}

/** exact percent growth after t whole years, one year at a time */
const fishAt = (a: Rational, r: Rational, t: number): Rational => {
  let v = a;
  for (let i = 0; i < t; i++) v = v.add(v.mul(r));
  return v;
};

/** Distance of x from the nearest rounding boundary at `places` decimals, in units of the last place. */
const tieGap = (x: number, places: number): number => {
  const f = Math.abs(x * 10 ** places) % 1;
  return Math.abs(f - 0.5);
};

function scenario(rng: Rng): Scenario {
  for (;;) {
    const v0 = rng.pick([48, 64, 80, 96]);
    const h0 = rng.int(4, 24);
    const species = rng.pick(['bluegill', 'koi', 'goldfish', 'minnows', 'sunfish']);
    const a = Q(rng.pick([40, 50, 60, 80, 100, 120, 150, 200]));
    const r = Q(rng.pick([8, 10, 12, 15, 20, 25]), 100);
    const te = rng.int(3, 6);
    const n = rng.int(5, 10);
    const H = Q(h0).add(Q(v0 * v0, 64));
    const sq = Math.sqrt(H.toNumber());
    if (Number.isInteger(sq)) continue; // keep the landing time irrational, so rounding is real
    const land = v0 / 32 + sq / 4;
    const neg = v0 / 32 - sq / 4;
    if (tieGap(land, 1) < 0.08 || tieGap(neg, 2) < 0.08) continue;
    // the 'back at platform height' time v0/16 must round to a clearly different tenth than the landing
    if (Math.abs(Number(land.toFixed(1)) - Number((v0 / 16).toFixed(1))) < 0.2) continue;
    if (!a.mul(r).isInteger()) continue; // the linear plan adds a whole number of fish
    const b = Q(1).add(r);
    const ve = a.mul(b.pow(te));
    if (tieGap(ve.toNumber(), 0) < 0.06) continue;
    // a friendly threshold strictly between the year before and year n, away from both
    const lo = a.mul(b.pow(n - 1)).toNumber();
    const hi = a.mul(b.pow(n)).toNumber();
    const step = hi > 1500 ? 100 : hi > 400 ? 50 : 25;
    const thr = Math.ceil((lo + 1) / step) * step;
    if (!(thr < hi - 1)) continue;
    // neighbouring years at least 3% of the limit away from it
    if (thr - lo < 0.03 * thr || hi - thr < 0.03 * thr) continue;
    // a table that rounds to whole fish every year must give the same first year
    let yr = a;
    let tr = 0;
    while (!yr.gt(thr) && tr < 100) {
      yr = yr.mul(b).round(0);
      tr++;
    }
    if (tr !== n) continue;
    const tc = 10;
    const tl = 50;
    if (tieGap(a.mul(b.pow(tc)).toNumber(), 0) < 0.02 || tieGap(a.mul(b.pow(tl)).toNumber(), 0) < 0.02) continue;
    const h = Poly.fromCoeffs('t', [Q(h0), Q(v0), Q(-16)]);
    return { v0, h0, h, tv: Q(v0, 32), H, land, neg, species, a, r, b, te, thr, n, tc, tl };
  }
}

// ---------------------------------------------------------------------------
// Shared text and readers
// ---------------------------------------------------------------------------

/** whole number with plain commas, for text outside math ("1,863") */
const commas = (x: Rational | number): string => {
  const v = typeof x === 'number' ? Math.round(x) : Number(x.round(0).toBigInt());
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
const rocketText = (s: Scenario) =>
  `The science club launches a model rocket straight up from a platform $${s.h0}$ feet above the ground, with a launch speed of $${s.v0}$ feet per second.`;
const modelText = (s: Scenario) => ` Its height in feet $t$ seconds after the launch is $h(t) = ${pTex(s.h, 't')}$.`;
const head = (k: number, title: string) => `**Part ${k} of ${N}: ${title}.** `;
const fishText = (s: Scenario) => `The club's pond was stocked with $${numStr(s.a)}$ ${s.species}. The fish population grows by ${pct(s.r)}% each year.`;
const fishModelText = (s: Scenario) => ` A model for the number of fish $t$ years after stocking is $y = ${numStr(s.a)}\\left(${dTex(s.b)}\\right)^{t}$.`;
const numSpec = (v: Rational, unit?: string, roundTo?: number) => ({
  kind: 'number' as const,
  value: v.isTerminatingDecimal() ? v.toDecimalString(400) : v.toString(),
  ...(unit ? { unit } : {}),
  ...(roundTo !== undefined ? { roundTo } : {}),
});

/** launch speed and platform height read back from the words of the prompt */
function readRocket(pr: Pick<Problem, 'prompt'>): { v0: number; h0: number; errs: string[] } | null {
  const text = textOf(pr);
  const m = /from a platform \$(\d+)\$ feet above the ground, with a launch speed of \$(\d+)\$ feet per second/.exec(text);
  if (!m) return null;
  const h0 = Number(m[1]);
  const v0 = Number(m[2]);
  const errs: string[] = [];
  // when the model is printed, it must agree with the words
  const shown = /\$h\(t\) = ([^$_]+)\$/.exec(text);
  if (shown) {
    const g = plainPoly(texToExpr(shown[1]));
    for (const t of [0, 1, 2]) if (!ev(g, t, 't').eq(-16 * t * t + v0 * t + h0)) errs.push('printed model does not match the story');
  }
  return { v0, h0, errs };
}

/** positive landing time by bisection on the height, not the quadratic formula */
function landingByBisection(v0: number, h0: number): number {
  const h = (t: number) => -16 * t * t + v0 * t + h0;
  let lo = v0 / 32; // the rocket is still in the air at its highest point
  let hi = lo + 1;
  while (h(hi) > 0) hi += 1;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (h(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function readFish(pr: Pick<Problem, 'prompt'>): { a: Rational; r: Rational; errs: string[] } | null {
  const text = textOf(pr);
  const m = /stocked with \$(\d+)\$ [a-z]+\. The fish population grows by ([\d.]+)% each year/.exec(text);
  if (!m) return null;
  const a = Q(m[1]);
  const r = Q(m[2]).div(100);
  const errs: string[] = [];
  const shown = /\$y = (\d+)\\left\(([\d.]+)\\right\)\^\{t\}\$/.exec(text);
  if (shown && !(Q(shown[1]).eq(a) && Q(shown[2]).eq(Q(1).add(r)))) errs.push('printed model does not match the story');
  return { a, r, errs };
}

const mis = (value: Rational | null, tag: MisconceptionTag, feedback: string) => ({ value, tag, feedback });

// ---------------------------------------------------------------------------
// Part A: the rocket
// ---------------------------------------------------------------------------

const genWriteH: GeneratorDef = {
  id: 'u9.launch.1',
  skillId: 'S4.20',
  description: 'Capstone launch, part 1: write the height function of the rocket from its launch speed and height.',
  generate(rng) {
    const s = scenario(rng);
    const value = `-16t^2 + ${s.v0}t + ${s.h0}`;
    const misconceptions: Misconception[] = [
      { answer: `-16t^2 + ${s.h0}t + ${s.v0}`, tag: 'equation-setup', feedback: 'The launch speed multiplies $t$. The starting height is the constant term.' },
      { answer: `16t^2 + ${s.v0}t + ${s.h0}`, tag: 'sign-error', feedback: 'Gravity pulls the rocket down, so the $t^{2}$ term is $-16t^{2}$.' },
      { answer: `-16t^2 + ${s.v0}t`, tag: 'equation-setup', feedback: `At $t = 0$ the rocket is on the platform, $${s.h0}$ feet up, so $h(0)$ must be $${s.h0}$.` },
      { answer: `-4.9t^2 + ${s.v0}t + ${s.h0}`, tag: 'units', feedback: 'The heights are in feet, so gravity gives $-16t^{2}$. The $-4.9t^{2}$ version is for meters.' },
    ];
    return makeProblem({
      skillId: 'S4.20',
      tags: ['real-world', 'word'],
      prompt: [
        p(head(1, 'Write the launch model') + rocketText(s)),
        p('Define the quantities: $t$ is the time in seconds since the launch, and $h(t)$ is the height of the rocket in feet. In feet and seconds, the height of an object moving up and down under gravity is $h(t) = -16t^{2} + v_0 t + h_0$.'),
        p('Write the function $h(t)$ for this rocket.'),
      ],
      answer: { kind: 'expression', value, variables: ['t'] },
      inputHint: 'Type an expression in t, like -16t^2 + 20t + 5.',
      hints: [
        '$v_0$ is the launch speed (upward) and $h_0$ is the height where the rocket starts.',
        'Which number in the story is the launch speed? That is $v_0$.',
        'Where does the rocket start, and how high above the ground is that? That height is $h_0$.',
        'Put $v_0$ as the coefficient of $t$ and $h_0$ as the constant term after $-16t^{2}$.',
      ],
      solution: [
        { text: 'Identify the quantities from the story.', why: `The launch speed is $v_0 = ${s.v0}$ ft/s and the starting height is $h_0 = ${s.h0}$ ft.` },
        { text: 'Substitute into the projectile model.', tex: `h(t) = ${pTex(s.h, 't')}`, why: 'The $-16t^{2}$ term is the pull of gravity in feet and seconds; $v_0 t$ is the upward motion; $h_0$ is where it starts.' },
        { text: 'Check at the launch.', tex: `h(0) = ${s.h0}`, why: 'At $t = 0$ the rocket is still on the platform, so the model gives the platform height.' },
      ],
      misconceptions,
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'expression') return ['unexpected kind'];
    const rk = readRocket(pr);
    if (!rk) return ['cannot read the rocket'];
    const g = plainPoly(pr.answer.value);
    const errs = [...rk.errs];
    // physical checks: starts at h0, gravity term -16, first-second change v0 - 16, degree 2
    if (!ev(g, 0, 't').eq(rk.h0)) errs.push('wrong starting height');
    if (!g.coeff('t', 2).eq(-16) || g.degreeIn('t') !== 2) errs.push('wrong gravity term');
    if (!ev(g, 1, 't').sub(ev(g, 0, 't')).eq(rk.v0 - 16)) errs.push('wrong launch speed');
    return errs;
  },
};

const genMaxHeight: GeneratorDef = {
  id: 'u9.launch.2',
  skillId: 'S4.13',
  description: 'Capstone launch, part 2: find when the rocket reaches its maximum height and what that height is.',
  generate(rng) {
    const s = scenario(rng);
    const tvT = dTex(s.tv);
    const Ht = dTex(s.H);
    return makeProblem({
      skillId: 'S4.13',
      tags: ['real-world', 'multi-step'],
      prompt: [
        p(head(2, 'Find the highest point') + rocketText(s) + modelText(s)),
        p('How high does the rocket go? Find the time of the maximum, then give the maximum height in feet.'),
      ],
      answer: numSpec(s.H, 'feet'),
      inputHint: 'Type the height in feet.',
      hints: [
        'The graph of $h$ is a parabola that opens down, so its highest point is the vertex.',
        `The vertex is at $t = -\\frac{b}{2a}$, with $a = -16$ and $b = ${s.v0}$.`,
        'Find that time first, then substitute it into $h(t)$.',
        'Square the time first, multiply by $-16$, then add the other two terms.',
      ],
      solution: [
        { text: 'Find the time of the vertex.', tex: `t = -\\frac{${s.v0}}{2(-16)} = \\frac{${s.v0}}{32} = ${tvT}`, why: 'The parabola opens down ($a < 0$), so the vertex is the highest point.' },
        { text: 'Substitute that time into the model.', tex: `h(${tvT}) = -16(${tvT})^{2} + ${s.v0}(${tvT}) + ${s.h0} = ${dTex(Q(-16).mul(s.tv.pow(2)))} + ${dTex(s.tv.mul(s.v0))} + ${s.h0} = ${Ht}`, why: 'The output at the vertex is the maximum height.' },
        { text: 'Interpret.', why: `The rocket reaches its highest point, $${Ht}$ feet, $${tvT}$ seconds after the launch.` },
      ],
      misconceptions: numberMisconceptions(s.H, [
        mis(s.tv, 'other', 'That is the time of the highest point, in seconds. The question asks for the height: substitute that time into $h(t)$.'),
        mis(Q(s.h0).add(s.tv.mul(s.v0)), 'order-of-operations', 'Include the $-16t^{2}$ term: gravity has been slowing the rocket the whole time.'),
        mis(Q(s.h0).add(s.tv.mul(s.v0)).add(Q(16).mul(s.tv.pow(2))), 'sign-error', 'The $t^{2}$ term is $-16t^{2}$, so it is subtracted.'),
        mis(s.H.sub(s.h0), 'other', 'That is the height above the platform. $h(t)$ measures from the ground, so the platform height is included.'),
      ]),
      steps: [
        {
          prompt: [p('When does the rocket reach its highest point? Use $t = -\\frac{b}{2a}$.')],
          answer: numSpec(s.tv, 'seconds'),
          hints: [`In $h(t)$, $a = -16$ and $b = ${s.v0}$.`, '$2a = -32$.', `Divide $-${s.v0}$ by $-32$.`, 'A negative divided by a negative is positive.'],
          explanation: `$t = -\\frac{${s.v0}}{2(-16)} = ${tvT}$ seconds.`,
        },
        {
          prompt: [p('What is the maximum height?')],
          answer: numSpec(s.H, 'feet'),
          hints: ['Substitute the time of the vertex into $h(t)$.', 'Square the time first.', 'Multiply the square by $-16$.', 'Add the middle term and the platform height.'],
          explanation: `$h(${tvT}) = ${Ht}$ feet.`,
        },
      ],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    const rk = readRocket(pr);
    if (!rk) return ['cannot read the rocket'];
    const h = (t: Rational) => t.mul(t).mul(-16).add(t.mul(rk.v0)).add(rk.h0);
    // symmetry: the rocket is back at the platform height at t = v0/16, so the top is halfway there
    const back = Q(rk.v0, 16);
    if (!h(back).eq(rk.h0)) return ['symmetry check failed'];
    const top = h(back.div(2));
    const errs = [...rk.errs];
    if (!Rational.parse(pr.answer.value).eq(top)) errs.push('maximum height wrong');
    // and it really is the highest: nearby times are lower
    for (const d of ['1/10', '-1/10', '1', '-1']) if (!h(back.div(2).add(Q(d))).lt(top)) errs.push('not a maximum');
    return errs;
  },
};

const genLanding: GeneratorDef = {
  id: 'u9.launch.3',
  skillId: 'S4.13',
  description: 'Capstone launch, part 3: find when the rocket lands with the quadratic formula, rounded to the nearest tenth.',
  generate(rng) {
    const s = scenario(rng);
    const D = s.v0 * s.v0 + 64 * s.h0;
    const sd = Math.sqrt(D);
    const T1 = s.land.toFixed(1);
    return makeProblem({
      skillId: 'S4.13',
      tags: ['real-world', 'multi-step'],
      prompt: [
        p(head(3, 'Find when it lands') + rocketText(s) + modelText(s)),
        p('When does the rocket hit the ground? Use the quadratic formula and round to the nearest tenth of a second.'),
      ],
      answer: { kind: 'number', value: s.land.toFixed(12), roundTo: 1, unit: 'seconds' },
      inputHint: 'Type the time in seconds, rounded to the nearest tenth.',
      hints: [
        'On the ground the height is $0$, so solve $h(t) = 0$.',
        `Use $t = \\frac{-b \\pm \\sqrt{b^{2} - 4ac}}{2a}$ with $a = -16$, $b = ${s.v0}$ and $c = ${s.h0}$.`,
        'You get two solutions. Think about which one is a time after the launch.',
        'Keep the positive solution, and round only at the end.',
      ],
      solution: [
        { text: 'Set the height equal to zero.', tex: `${pTex(s.h, 't')} = 0`, why: 'The rocket is on the ground when its height is $0$ feet.' },
        { text: 'Substitute into the quadratic formula.', tex: `t = \\frac{-${s.v0} \\pm \\sqrt{${s.v0}^{2} - 4(-16)(${s.h0})}}{2(-16)} = \\frac{-${s.v0} \\pm \\sqrt{${D}}}{-32}`, why: `$a = -16$, $b = ${s.v0}$, $c = ${s.h0}$, and $-4ac$ is positive because $a$ is negative.` },
        { text: 'Find both solutions.', tex: `t \\approx \\frac{-${s.v0} + ${sd.toFixed(3)}}{-32} \\approx ${s.neg.toFixed(2)} \\quad\\text{or}\\quad t \\approx \\frac{-${s.v0} - ${sd.toFixed(3)}}{-32} \\approx ${s.land.toFixed(3)}` },
        { text: 'Keep the solution that makes sense.', tex: `t \\approx ${T1}`, why: 'The negative solution is a time before the launch, so the rocket lands after the positive time.' },
      ],
      misconceptions: numberMisconceptions(Rational.parse(T1), [
        mis(Rational.parse(s.neg.toFixed(2)), 'other', 'That solves the equation, but it is a negative time, before the rocket was launched. Choose the solution that fits the situation.'),
        mis(Q(s.v0, 16), 'other', 'At that time the rocket is back at the height of the platform, not on the ground. It still has a little farther to fall.'),
        mis(s.tv, 'other', 'That is when the rocket is highest. It lands later, when the height is $0$.'),
      ]),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'number' || pr.answer.roundTo !== 1) return ['unexpected kind'];
    const rk = readRocket(pr);
    if (!rk) return ['cannot read the rocket'];
    const t = landingByBisection(rk.v0, rk.h0);
    const errs = [...rk.errs];
    const key = Rational.parse(pr.answer.value).toNumber();
    if (!(Math.abs(key - t) <= 1e-9)) errs.push(`expected about ${t.toFixed(4)}`);
    if (tieGap(t, 1) < 0.05) errs.push('landing time is too close to a rounding boundary');
    return errs;
  },
};

function rocketGraph(s: Scenario): GraphSpec {
  const yStep = s.H.toNumber() > 160 ? 50 : s.H.toNumber() > 80 ? 25 : 10;
  const yMax = Math.ceil((s.H.toNumber() * 1.1) / yStep) * yStep;
  const yMin = -yStep;
  // draw the curve where it stays on the grid: solve h(t) = yMin
  const c = s.h0 - yMin;
  const d = Math.sqrt(s.v0 * s.v0 + 64 * c);
  const t1 = (s.v0 - d) / 32;
  const t2 = (s.v0 + d) / 32;
  return {
    xMin: -1,
    xMax: Math.ceil(s.land) + 1,
    yMin,
    yMax,
    xStep: 1,
    yStep,
    xLabel: 't (seconds)',
    yLabel: 'h (feet)',
    functions: [{ expr: `-16x^2 + ${s.v0}x + ${s.h0}`, domain: [Math.max(-1, t1), t2] }],
    points: [
      { x: s.tv.toNumber(), y: s.H.toNumber(), label: 'highest point' },
      { x: s.land, y: 0, label: 'lands' },
      { x: s.neg, y: 0, open: true },
    ],
    ariaLabel: `Graph of the rocket height h(t) = -16t^2 + ${s.v0}t + ${s.h0}. The parabola opens down, crosses the vertical axis at ${s.h0}, peaks at about ${s.tv.toNumber()} seconds and crosses the time axis just left of 0 and at about ${s.land.toFixed(1)} seconds.`,
  };
}

const genDomain: GeneratorDef = {
  id: 'u9.launch.4',
  skillId: 'S4.13',
  description: 'Capstone launch, part 4: validate the model by choosing a reasonable domain and rejecting the negative solution.',
  generate(rng) {
    const s = scenario(rng);
    const T1 = s.land.toFixed(1);
    const n2 = s.neg.toFixed(2);
    const tvT = dTex(s.tv);
    const correct = `$0 \\le t \\le ${T1}$. Time starts at the launch and the model stops when the rocket lands. The solution $t \\approx ${n2}$ is a time before the launch, so it is rejected.`;
    const wrongs = [
      `$${n2} \\le t \\le ${T1}$. Both solutions of $h(t) = 0$ are times when the rocket is on the ground, so both are endpoints.`,
      `$0 \\le t \\le ${tvT}$. The flight ends when the rocket reaches its maximum height.`,
      'All real numbers. Any value of $t$ can be substituted into a quadratic function, so every input makes sense.',
    ];
    return makeProblem({
      skillId: 'S4.13',
      tags: ['real-world', 'graph'],
      prompt: [
        p(head(4, 'Check the model: a reasonable domain') + rocketText(s) + modelText(s) + ` Solving $h(t) = 0$ gives $t \\approx ${n2}$ and $t \\approx ${T1}$.`),
        { t: 'graph', spec: rocketGraph(s) },
        p('The model only describes the rocket while it is flying. Which domain is reasonable for this situation, with the correct reason?'),
      ],
      answer: makeChoice(rng, correct, wrongs),
      hints: [
        'The domain is the set of times $t$ that make sense for the flight.',
        'When does the flight start? That is $t = 0$.',
        'When does the flight end? Look at where the graph meets the time axis on the right.',
        'Ask what a negative time would mean for a rocket that is launched at $t = 0$.',
      ],
      solution: [
        { text: 'The flight starts at the launch.', tex: 't \\ge 0', why: 'Before $t = 0$ the rocket was sitting on the platform, so the formula does not describe it.' },
        { text: 'The flight ends at the landing.', tex: `t \\le ${T1}`, why: 'After the rocket hits the ground the model would give negative heights, which are underground.' },
        { text: 'Reject the negative solution.', tex: `t \\approx ${n2}`, why: 'It solves the equation, but it is a time before the launch, so it does not fit the situation.' },
        { text: 'Reasonable domain.', tex: `0 \\le t \\le ${T1}` },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const rk = readRocket(pr);
    if (!rk) return ['cannot read the rocket'];
    const T = landingByBisection(rk.v0, rk.h0);
    const label = choiceLabel(pr.answer);
    const errs = [...rk.errs];
    if (!label.startsWith(`$0 \\le t \\le ${T.toFixed(1)}$`)) errs.push('domain endpoints wrong');
    if (!/before the launch, so it is rejected/.test(label)) errs.push('reason wrong');
    // the rejected solution is negative: product of roots = h0 / (-16) < 0
    const m = /The solution \$t \\approx (-[\d.]+)\$/.exec(label);
    if (!m || Math.abs(Number(m[1]) * T + rk.h0 / 16) > 0.02 * (rk.h0 / 16) + 0.01 * T) errs.push('negative solution wrong');
    return errs;
  },
};

// ---------------------------------------------------------------------------
// Part B: the pond
// ---------------------------------------------------------------------------

const genWriteFish: GeneratorDef = {
  id: 'u9.launch.5',
  skillId: 'S5.06',
  description: 'Capstone launch, part 5: write the percent-growth model for the fish in the club pond.',
  generate(rng) {
    const s = scenario(rng);
    const key = `y = ${numStr(s.a)}(${numStr(s.b)})^t`;
    const cand: Misconception[] = [
      { answer: `y = ${numStr(s.a)}(${numStr(s.r)})^t`, tag: 'percent-rate', feedback: 'The base is the growth factor $1 + r$, not the rate alone. Multiplying by the rate would shrink the population.' },
      { answer: `y = ${numStr(s.a)}(${numStr(Q(1).sub(s.r))})^t`, tag: 'growth-decay', feedback: 'The population is growing, so the factor must be greater than $1$.' },
      { answer: `y = ${numStr(s.a)}(${numStr(Q(1).add(s.r.mul(100)))})^t`, tag: 'percent-rate', feedback: `Change ${pct(s.r)}% to a decimal before adding it to $1$.` },
      { answer: `y = ${numStr(s.a)} + ${numStr(s.a.mul(s.r))}t`, tag: 'other', feedback: 'That adds the same number of fish every year, which is linear. A percent of a growing population is a different number each year.' },
    ];
    const misconceptions = cand.filter((m) => checkAnswer({ kind: 'equation', value: key }, m.answer).status === 'incorrect');
    return makeProblem({
      skillId: 'S5.06',
      tags: ['real-world', 'word'],
      prompt: [
        p(head(5, 'Write the growth model') + 'For the second investigation, the club studies its pond. ' + fishText(s)),
        p('Define the quantities: $t$ is the number of years since the pond was stocked, and $y$ is the number of fish. Write an equation for $y$ in terms of $t$.'),
      ],
      answer: { kind: 'equation', value: key, form: 'exponential' },
      inputHint: 'Type an equation like y = 500(1.04)^t.',
      hints: [
        'A percent change every year makes an exponential model $y = a(b)^{t}$.',
        '$a$ is the number of fish at the start, when $t = 0$.',
        'Growing by $r$ each year multiplies the population by $1 + r$.',
        `Write ${pct(s.r)}% as a decimal first.`,
      ],
      solution: [
        { text: 'The starting amount.', tex: `a = ${numStr(s.a)}`, why: 'At $t = 0$ the pond has the fish it was stocked with.' },
        { text: 'The growth factor.', tex: `b = 1 + ${dTex(s.r)} = ${dTex(s.b)}`, why: `Each year the pond keeps 100% of its fish and gains ${pct(s.r)}% more.` },
        { text: 'Write the model.', tex: `y = ${numStr(s.a)}\\left(${dTex(s.b)}\\right)^{t}` },
      ],
      misconceptions,
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'equation') return ['unexpected kind'];
    const fk = readFish(pr);
    if (!fk) return ['cannot read the pond'];
    const [lhs, rhs] = pr.answer.value.split('=');
    if (!lhs || lhs.trim() !== 'y' || !rhs) return ['key is not y = ...'];
    const node = parseExpression(rhs);
    const errs = [...fk.errs];
    // the key must give the stocked number at t = 0 and add r% of the current fish every year
    for (let t = 0; t <= 6; t++) {
      const want = fishAt(fk.a, fk.r, t).toNumber();
      if (Math.abs(evalNumeric(node, { t }) - want) > 1e-9 * want) {
        errs.push(`model wrong at t = ${t}`);
        break;
      }
    }
    return errs;
  },
};

const genEvalFish: GeneratorDef = {
  id: 'u9.launch.6',
  skillId: 'S6.10',
  description: 'Capstone launch, part 6: use the growth model to predict the number of fish after several years.',
  generate(rng) {
    const s = scenario(rng);
    const v = s.a.mul(s.b.pow(s.te));
    const round = v.round(0);
    return makeProblem({
      skillId: 'S6.10',
      tags: ['real-world'],
      prompt: [
        p(head(6, 'Use the model') + fishText(s) + fishModelText(s)),
        p(`How many fish does the model predict after ${s.te} years? Round to the nearest whole fish.`),
      ],
      answer: numSpec(v, 'fish', 0),
      inputHint: 'Type a whole number.',
      hints: [
        `"After ${s.te} years" means $t = ${s.te}$.`,
        'Substitute that value for $t$ in the exponent.',
        'Exponents come first: raise the growth factor to the power, then multiply by the starting number.',
        'Round only at the very end.',
      ],
      solution: [
        { text: `Substitute $t = ${s.te}$.`, tex: `y = ${numStr(s.a)}\\left(${dTex(s.b)}\\right)^{${s.te}}`, why: 'The exponent counts the years of growth.' },
        { text: 'Evaluate the power, then multiply.', tex: `\\left(${dTex(s.b)}\\right)^{${s.te}} \\approx ${s.b.pow(s.te).toNumber().toFixed(4)},\\quad ${numStr(s.a)} \\times ${s.b.pow(s.te).toNumber().toFixed(4)} \\approx ${v.toNumber().toFixed(2)}`, why: 'Using all the decimals and rounding at the end keeps the answer accurate.' },
        { text: 'Round to a whole number of fish.', tex: `y \\approx ${numStr(round)}`, why: 'You cannot have part of a fish, so the prediction is a whole number.' },
      ],
      misconceptions: numberMisconceptions(round, [
        mis(s.a.mul(Q(1).add(s.r.mul(s.te))).round(0), 'percent-rate', `That adds ${pct(s.r)}% of the starting fish every year, which is linear growth. Each year the ${pct(s.r)}% is of a larger population.`),
        mis(s.a.mul(s.b).mul(s.te).round(0), 'order-of-operations', 'Raise the growth factor to the power; do not multiply by the number of years.'),
        mis(s.a.mul(s.b).pow(s.te).lt(100000) ? s.a.mul(s.b).pow(s.te).round(0) : null, 'order-of-operations', 'Only the growth factor is raised to the power. Multiply by the starting number after the power.'),
      ]),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'number' || pr.answer.roundTo !== 0) return ['unexpected kind'];
    const fk = readFish(pr);
    if (!fk) return ['cannot read the pond'];
    const m = /after (\d+) years\?/.exec(textOf(pr));
    if (!m) return ['cannot read the year'];
    const want = fishAt(fk.a, fk.r, Number(m[1]));
    const errs = [...fk.errs];
    if (!Rational.parse(pr.answer.value).eq(want)) errs.push('prediction wrong');
    return errs;
  },
};

const genThreshold: GeneratorDef = {
  id: 'u9.launch.7',
  skillId: 'S6.10',
  description: 'Capstone launch, part 7: find the first whole year the fish population passes a threshold.',
  generate(rng) {
    const s = scenario(rng);
    const before = s.a.mul(s.b.pow(s.n - 1));
    const at = s.a.mul(s.b.pow(s.n));
    const thrT = commas(s.thr);
    return makeProblem({
      skillId: 'S6.10',
      tags: ['real-world', 'multi-step'],
      prompt: [
        p(head(7, 'Answer the question') + fishText(s) + fishModelText(s)),
        p(`The pond's filter can handle at most ${thrT} fish. What is the first whole number of years $t$ for which the model predicts more than ${thrT} fish?`),
      ],
      answer: numSpec(Q(s.n), 'years'),
      inputHint: 'Type a whole number of years.',
      hints: [
        `You need the first whole-number $t$ where $y > ${s.thr}$.`,
        'Make a table of $y$ for whole-number values of $t$, or use a graph of the model. Do not round until the end: compute each year from the model, not from a rounded value.',
        `Start with a year you can estimate and move up or down until $y$ crosses ${thrT}.`,
        'Check both neighbouring years: one must be at or below the limit and the next one above it.',
      ],
      solution: [
        { text: 'Write the condition.', tex: `${numStr(s.a)}\\left(${dTex(s.b)}\\right)^{t} > ${s.thr}`, why: 'The question is when the predicted number of fish is more than the filter can handle.' },
        { text: `Check the year before.`, tex: `t = ${s.n - 1}: \\quad y \\approx ${before.toNumber().toFixed(1)} \\le ${s.thr}`, why: 'Not over the limit yet.' },
        { text: 'Check the next year.', tex: `t = ${s.n}: \\quad y \\approx ${at.toNumber().toFixed(1)} > ${s.thr}`, why: 'This is the first whole year over the limit.' },
        { text: 'Interpret.', why: `The model says the pond passes ${thrT} fish during year ${s.n}, so the club should plan for a bigger filter by then.` },
      ],
      misconceptions: numberMisconceptions(Q(s.n), [
        mis(Q(s.n - 1), 'other', `After ${s.n - 1} years the model is still at or below ${thrT}. Check the next year.`),
        mis(Q(s.n + 1), 'other', `Check the year before that one: the model is already over ${thrT} a year earlier.`),
      ]),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    const fk = readFish(pr);
    if (!fk) return ['cannot read the pond'];
    const m = /handle at most ([\d,]+) fish/.exec(textOf(pr));
    if (!m) return ['cannot read the limit'];
    const thr = Q(m[1].replace(/,/g, ''));
    // step year by year until the population passes the limit
    let t = 0;
    let y = fk.a;
    while (!y.gt(thr) && t < 200) {
      y = y.add(y.mul(fk.r));
      t++;
    }
    const errs = [...fk.errs];
    if (!Rational.parse(pr.answer.value).eq(t)) errs.push(`expected year ${t}`);
    // the neighbours are not near the limit, so the answer is not sensitive to rounding
    if (fishAt(fk.a, fk.r, t).sub(thr).toNumber() < 1 || thr.sub(fishAt(fk.a, fk.r, t - 1)).toNumber() < 1) errs.push('too close to the limit');
    return errs;
  },
};

const genCompareLinear: GeneratorDef = {
  id: 'u9.launch.8',
  skillId: 'S5.06',
  description: 'Capstone launch, part 8: compare the percent-growth model with a linear plan and explain the difference.',
  generate(rng) {
    const s = scenario(rng);
    const add = s.a.mul(s.r);
    const E = s.a.mul(s.b.pow(s.tc));
    const L = s.a.add(add.mul(s.tc));
    const P = pct(s.r);
    const correct = `The percent model predicts more: about ${commas(E)} fish compared with ${commas(L)}. Each year it adds ${P}% of a larger population, so the yearly gain keeps growing.`;
    const wrongs = [
      `The two models predict the same number, ${commas(L)} fish, because both add ${P}% each year.`,
      `The linear plan predicts more, because adding ${numStr(add)} fish every year is faster than percent growth.`,
      `The percent model predicts more, because it adds ${P}% of the original ${numStr(s.a)} fish, which is ${numStr(add)} fish, every year.`,
    ];
    return makeProblem({
      skillId: 'S5.06',
      tags: ['real-world'],
      prompt: [
        p(head(8, 'Compare with a linear plan') + fishText(s) + fishModelText(s)),
        p(`Another club member says ${P}% of ${numStr(s.a)} is ${numStr(add)}, so the pond simply gains ${numStr(add)} fish every year: $y = ${numStr(s.a)} + ${numStr(add)}t$. Which statement about the two predictions after ${s.tc} years is correct, with the correct reason?`),
      ],
      answer: makeChoice(rng, correct, wrongs),
      hints: [
        `Compute both predictions for $t = ${s.tc}$.`,
        'The linear plan adds the same number of fish every year.',
        `In the percent model, the ${P}% is taken of the population at the start of that year.`,
        'Compare the yearly gain in year 1 with the yearly gain in a later year for each model.',
      ],
      solution: [
        { text: 'Percent model.', tex: `y = ${numStr(s.a)}\\left(${dTex(s.b)}\\right)^{${s.tc}} \\approx ${commas(E).replace(/,/g, '{,}')}`, why: 'The growth factor is applied once per year.' },
        { text: 'Linear plan.', tex: `y = ${numStr(s.a)} + ${numStr(add)}(${s.tc}) = ${commas(L).replace(/,/g, '{,}')}`, why: `It adds ${numStr(add)} fish every year, no matter how many fish there are.` },
        { text: 'Why they differ.', why: `In year 1 both add ${numStr(add)} fish. After that the percent model adds ${P}% of a bigger population, so its yearly gain grows while the linear gain stays at ${numStr(add)}.` },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const fk = readFish(pr);
    if (!fk) return ['cannot read the pond'];
    const m = /predictions after (\d+) years/.exec(textOf(pr));
    if (!m) return ['cannot read the year'];
    const t = Number(m[1]);
    const E = fishAt(fk.a, fk.r, t);
    const L = fk.a.add(fk.a.mul(fk.r).mul(t));
    const label = choiceLabel(pr.answer);
    const errs = [...fk.errs];
    if (!E.gt(L)) errs.push('percent model should be larger');
    if (!label.startsWith('The percent model predicts more:')) errs.push('comparison wrong');
    if (!label.includes(`about ${commas(E)} fish compared with ${commas(L)}`)) errs.push('values wrong');
    if (!label.includes('of a larger population')) errs.push('reason wrong');
    return errs;
  },
};

const genLimits: GeneratorDef = {
  id: 'u9.launch.9',
  skillId: 'S6.10',
  description: 'Capstone launch, part 9: judge whether the growth model is reasonable far into the future.',
  generate(rng) {
    const s = scenario(rng);
    const far = s.a.mul(s.b.pow(s.tl));
    const correct = 'No. A pond has limited space and food, so the growth has to slow down. The model is only reasonable for the first several years.';
    const wrongs = [
      `Yes. The growth factor is greater than $1$, so the population keeps growing by ${pct(s.r)}% every year forever.`,
      'No. The model eventually predicts a negative number of fish.',
      'Yes. Any whole number of years can be substituted into the equation, so every prediction is reasonable.',
    ];
    return makeProblem({
      skillId: 'S6.10',
      tags: ['real-world'],
      prompt: [
        p(head(9, 'Check the model: its limits') + fishText(s) + fishModelText(s)),
        p(`After ${s.tl} years, the model predicts about ${commas(far)} fish in the club's pond. Is the model reasonable that far into the future? Choose the correct reason.`),
      ],
      answer: makeChoice(rng, correct, wrongs),
      hints: [
        'A model is only useful while the situation behaves the way the model assumes.',
        'This model assumes the population grows by the same percent every year, no matter how many fish there are.',
        'Think about what a small pond can actually hold and feed.',
        'What happens to real growth when space and food run short?',
      ],
      solution: [
        { text: 'Look at the prediction.', why: `About ${commas(far)} fish is far more than a small club pond could hold. The filter can only handle ${commas(s.thr)} fish, and the model already passes that after ${s.n} years.` },
        { text: 'Find the assumption that breaks.', why: `The model assumes ${pct(s.r)}% growth every year forever. A real pond has limited space, food and oxygen, so growth slows as the pond fills up.` },
        { text: 'Conclusion.', why: 'The exponential model is reasonable for the first several years. For long-term predictions the club would need a model in which growth levels off.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const fk = readFish(pr);
    if (!fk) return ['cannot read the pond'];
    const m = /After (\d+) years, the model predicts about ([\d,]+) fish/.exec(textOf(pr));
    if (!m) return ['cannot read the prediction'];
    const errs = [...fk.errs];
    if (commas(fishAt(fk.a, fk.r, Number(m[1]))) !== m[2]) errs.push('long-run prediction wrong');
    const label = choiceLabel(pr.answer);
    if (!/^No\. A pond has limited space and food/.test(label)) errs.push('reason wrong');
    return errs;
  },
};

export const CAP_LAUNCH_GENERATORS: GeneratorDef[] = [genWriteH, genMaxHeight, genLanding, genDomain, genWriteFish, genEvalFish, genThreshold, genCompareLinear, genLimits];

const intro: Block[] = [
  p('It is science-club day, and the club has two investigations. In each one you will use the modeling cycle: define the quantities, write a model, use it to compute, interpret the answer in the situation, and check whether the model makes sense.'),
  p('**Part A: the rocket.** The club launches a model rocket straight up from a platform. How high does it go, and when does it come back down? A quadratic model of its height answers both questions.'),
  p('**Part B: the pond.** The club stocked its pond with fish, and the population grows by the same percent every year. How many fish will there be, and when will the pond need a bigger filter? An exponential model answers these, but only for a while.'),
];

export const CAP_LAUNCH: CapstoneContent = {
  lessonId: 'U9L02',
  goal: 'Model a rocket launch with a quadratic function and a growing fish population with an exponential function, then use, interpret and check both models.',
  intro,
  plan: [
    'Define the quantities and write the launch model',
    'Find the maximum height and the landing time',
    'Check the launch model: a reasonable domain',
    'Write the percent-growth model for the pond',
    'Use the model to predict and to answer the question',
    'Compare with a linear plan and check the limits of the model',
  ],
  tasks: [
    { part: 'Write the launch model', generator: 'u9.launch.1' },
    { part: 'Find the highest point', generator: 'u9.launch.2' },
    { part: 'Find when it lands', generator: 'u9.launch.3' },
    { part: 'Check the model: a reasonable domain', generator: 'u9.launch.4' },
    { part: 'Write the growth model', generator: 'u9.launch.5' },
    { part: 'Use the model', generator: 'u9.launch.6' },
    { part: 'Answer the question', generator: 'u9.launch.7' },
    { part: 'Compare with a linear plan', generator: 'u9.launch.8' },
    { part: 'Check the model: its limits', generator: 'u9.launch.9' },
  ],
  wrapUp: [
    p('Both models came from a rule about how the quantity changes. Gravity slows the rocket by the same amount every second, which makes its height quadratic: it rises, peaks at the vertex and falls back. The fish grow by the same percent every year, which makes the population exponential: the yearly gain keeps getting bigger.'),
    p('Both models also have limits. The launch model only describes the flight, from $t = 0$ until the rocket lands, so the negative solution was rejected; it also ignores air resistance, so a real rocket goes a little less high. The pond model works for the first several years, but no pond can hold fish growing by a percent forever. The same kind of model, with a factor $1 - r$ less than $1$, describes decay, like a phone losing value each year.'),
  ],
};
