/**
 * Capstone U9L01: Planning a Budget with Lines and Constraints.
 *
 * One situation worked through the modeling cycle: a club prints T-shirts and tote bags for a
 * festival booth. A linear cost model for T-shirts (S1.15), a budget and a printing-time
 * constraint in two variables (S2.06), testing and choosing plans in the solution region (S2.05),
 * and a check of which points make sense in context.
 *
 * Every task calls scenario(rng) first, so all tasks realized from one seed share the numbers.
 */
import type { Block, CapstoneContent, GeneratorDef, GraphSpec, Problem, Rng } from '../../core/curriculum/types';
import { Rational } from '../../core/math/rational';
import { linearPlain } from '../../core/math/format';
import { Q, p, makeProblem, makeChoice, choiceLabel, money, numStr, numberMisconceptions, stringMisconceptions, texValue } from './util';
import { holds } from './u2-common';

const N_PARTS = 9;

// ---------------------------------------------------------------------------
// The shared situation
// ---------------------------------------------------------------------------

type TestCat = 'ok' | 'budget' | 'time' | 'both';

interface Plan {
  name: string;
  x: number;
  y: number;
}

interface Scenario {
  club: string;
  /** cost per T-shirt, cost per tote bag, setup fee, budget (dollars) */
  a: number;
  b: number;
  F: number;
  B: number;
  /** minutes per T-shirt, minutes per tote bag, hours of press time, minutes of press time */
  t1: number;
  t2: number;
  H: number;
  T: number;
  /** selling prices */
  p1: number;
  p2: number;
  /** part 3 asks about the slope or the intercept */
  ask3: 'slope' | 'intercept';
  /** part 6: a proposed plan and which limits it breaks */
  test: { x: number; y: number; cat: TestCat };
  /** part 7: one possible plan */
  ex: { x: number; y: number };
  /** part 8: four plans, one of them not possible but with the largest profit */
  plans: Plan[];
  /** part 9: a point that satisfies both inequalities but is not a real plan */
  odd: { x: number; y: number; kind: 'fraction' | 'negative' };
}

const CLUBS = ['art club', 'robotics club', 'student council', 'environmental club', 'drama club', 'Spanish club'];

const cost = (s: { a: number; b: number; F: number }, x: number, y: number) => s.a * x + s.b * y + s.F;
const time = (s: { t1: number; t2: number }, x: number, y: number) => s.t1 * x + s.t2 * y;
const fitsBudget = (s: { a: number; b: number; F: number; B: number }, x: number, y: number) => cost(s, x, y) <= s.B;
const fitsTime = (s: { t1: number; t2: number; T: number }, x: number, y: number) => time(s, x, y) <= s.T;
const profit = (s: { a: number; b: number; F: number; p1: number; p2: number }, x: number, y: number) => s.p1 * x + s.p2 * y - cost(s, x, y);

function scenario(rng: Rng): Scenario {
  for (;;) {
    const s = tryScenario(rng);
    if (s) return s;
  }
}

function tryScenario(rng: Rng): Scenario | null {
  const club = rng.pick(CLUBS);
  const a = rng.int(5, 8);
  const b = rng.int(2, 4);
  const F = rng.pick([20, 25, 30, 35, 40, 45, 50]);
  const B = rng.pick([250, 300, 350, 400, 450, 500]);
  const t1 = rng.int(4, 6);
  const t2 = rng.int(2, 3);
  const H = rng.int(3, 5);
  const T = 60 * H;
  const p1 = a + rng.int(5, 10);
  const p2 = b + rng.int(3, 7);
  const ask3 = rng.pick(['slope', 'intercept'] as const);
  const base = { a, b, F, B, t1, t2, T, p1, p2 };
  // the T-shirt-only budget question needs rounding down
  if ((B - F) % a === 0) return null;
  // the two boundary lines must cross in the first quadrant, well away from the axes
  const Xb = (B - F) / a;
  const Yb = (B - F) / b;
  const Xt = T / t1;
  const Yt = T / t2;
  if ((Xb - Xt) * (Yb - Yt) >= 0) return null;
  if (Math.abs(Xb - Xt) < 6 || Math.abs(Yb - Yt) < 6) return null;
  const xMax = Math.max(Xb, Xt);
  const yMax = Math.max(Yb, Yt);
  // grid of friendly plans (multiples of 5, at least 5 of each)
  const grid: Array<{ x: number; y: number }> = [];
  for (let x = 5; x <= xMax + 10; x += 5) for (let y = 5; y <= yMax + 10; y += 5) grid.push({ x, y });
  const catOf = (x: number, y: number): TestCat => {
    const okB = fitsBudget(base, x, y);
    const okT = fitsTime(base, x, y);
    return okB && okT ? 'ok' : !okB && okT ? 'budget' : okB && !okT ? 'time' : 'both';
  };
  // part 6: not on either boundary, so the decision is clear
  const cat = rng.pick(['ok', 'budget', 'time', 'both'] as const);
  const testCands = grid.filter((q) => catOf(q.x, q.y) === cat && cost(base, q.x, q.y) !== B && time(base, q.x, q.y) !== T && q.x <= xMax && q.y <= yMax);
  if (!testCands.length) return null;
  const tp = rng.pick(testCands);
  // part 7: an inside plan with some of each item
  const ex0 = Math.max(1, Math.floor(Math.min(Xb, Xt) / 3));
  let ey = 0;
  while (fitsBudget(base, ex0, ey + 1) && fitsTime(base, ex0, ey + 1)) ey++;
  const ex = { x: ex0, y: Math.max(1, Math.floor(ey / 2)) };
  if (!(fitsBudget(base, ex.x, ex.y) && fitsTime(base, ex.x, ex.y))) return null;
  // part 8: three possible plans with different profits, plus one impossible plan that would earn more
  const feas = rng.shuffle(grid.filter((q) => catOf(q.x, q.y) === 'ok' && profit(base, q.x, q.y) > 0));
  const picked: Array<{ x: number; y: number }> = [];
  for (const q of feas) {
    if (picked.length === 3) break;
    if (picked.some((r) => profit(base, r.x, r.y) === profit(base, q.x, q.y))) continue;
    picked.push(q);
  }
  if (picked.length < 3) return null;
  const best = Math.max(...picked.map((q) => profit(base, q.x, q.y)));
  const tempting = grid
    .filter((q) => catOf(q.x, q.y) !== 'ok' && profit(base, q.x, q.y) > best && q.x <= xMax && q.y <= yMax)
    .sort((u, v) => profit(base, u.x, u.y) - profit(base, v.x, v.y));
  if (!tempting.length) return null;
  const four = rng.shuffle([...picked, tempting[0]]);
  const plans = four.map((q, i) => ({ name: 'ABCD'[i], x: q.x, y: q.y }));
  // part 9: a point that satisfies both inequalities (with room to spare) but is not a real plan
  const kind = rng.pick(['fraction', 'negative'] as const);
  const oddCands: Array<{ x: number; y: number }> = [];
  if (kind === 'fraction') {
    for (let k = 2; k < Math.min(Xb, Xt) - 1; k++)
      for (let y = 5; y <= yMax; y += 5) if (cost(base, k + 0.5, y) < B && time(base, k + 0.5, y) < T) oddCands.push({ x: k + 0.5, y });
  } else {
    for (let m = 2; m <= 6; m++) for (let y = 5; y <= yMax; y += 5) if (cost(base, -m, y) < B && time(base, -m, y) < T) oddCands.push({ x: -m, y });
  }
  if (!oddCands.length) return null;
  const od = rng.pick(oddCands);
  return { club, a, b, F, B, t1, t2, H, T, p1, p2, ask3, test: { ...tp, cat }, ex, plans, odd: { ...od, kind } };
}

// ---------------------------------------------------------------------------
// Text shared by the tasks, and its parser for verify()
// ---------------------------------------------------------------------------

function recap(s: Scenario, opts: { minutes?: boolean; prices?: boolean } = {}): string {
  return (
    `The ${s.club} is selling custom T-shirts and tote bags at a booth at the fall festival. ` +
    `Let $x$ be the number of T-shirts and $y$ the number of tote bags. ` +
    `The print shop charges a one-time setup fee of ${money(s.F)}, plus ${money(s.a)} for each T-shirt and ${money(s.b)} for each tote bag. ` +
    `The club has a supply budget of ${money(s.B)}. ` +
    `It takes ${s.t1} minutes to print each T-shirt and ${s.t2} minutes to print each tote bag, and the club can use the press for at most ${s.H} hours${opts.minutes ? ` (${s.T} minutes)` : ''}.` +
    (opts.prices ? ` The club sells T-shirts for ${money(s.p1)} each and tote bags for ${money(s.p2)} each.` : '')
  );
}

const head = (k: number, title: string, s: Scenario, opts?: { minutes?: boolean; prices?: boolean }) => p(`**Part ${k} of ${N_PARTS}: ${title}.** ${recap(s, opts)}`);

interface Parsed {
  a: number;
  b: number;
  F: number;
  B: number;
  t1: number;
  t2: number;
  T: number;
  p1?: number;
  p2?: number;
}

/** Read the situation's numbers back out of the first prompt block. */
function parseRecap(pr: Problem): Parsed | null {
  const text = (pr.prompt[0] as { text?: string }).text ?? '';
  const num = (re: RegExp) => {
    const m = re.exec(text);
    return m ? Number(m[1]) : NaN;
  };
  const r = {
    F: num(/setup fee of \\\$(\d+)/),
    a: num(/\\\$(\d+) for each T-shirt/),
    b: num(/\\\$(\d+) for each tote bag/),
    B: num(/budget of \\\$(\d+)/),
    t1: num(/(\d+) minutes to print each T-shirt/),
    t2: num(/(\d+) minutes to print each tote bag/),
    T: 60 * num(/at most (\d+) hours/),
  };
  if (Object.values(r).some((v) => !Number.isFinite(v))) return null;
  const p1 = num(/sells T-shirts for \\\$(\d+)/);
  const p2 = num(/tote bags for \\\$(\d+) each/);
  return { ...r, ...(Number.isFinite(p1) && Number.isFinite(p2) ? { p1, p2 } : {}) };
}

/**
 * Does the relation `rel` (in x and y) describe the half-plane A x + By y <= C (or < C when strict)?
 * Probed exactly on the boundary, a hair to each side, and far away, at several x values.
 */
function sameHalfPlane(rel: string, A: number, By: number, C: number, strict = false): boolean {
  const eps = Q(1, 1000);
  for (const xv of [0, 1, 3, 7, 12, 25, -4]) {
    const y0 = Q(C - A * xv).div(Q(By));
    for (const d of [Q(0), eps, eps.neg(), Q(1), Q(-1), Q(40), Q(-40)]) {
      const y = y0.add(d);
      const lhs = Q(A * xv).add(Q(By).mul(y));
      const truth = strict ? lhs.lt(Q(C)) : lhs.le(Q(C));
      if (holds(rel, xv, y) !== truth) return false;
    }
  }
  return true;
}

const budgetRel = (s: { a: number; b: number; F: number; B: number }) => `${s.a}x + ${s.b}y + ${s.F} <= ${s.B}`;
const budgetTex = (s: { a: number; b: number; F: number; B: number }) => `${s.a}x + ${s.b}y + ${s.F} \\le ${s.B}`;
const timeRel = (s: { t1: number; t2: number; T: number }) => `${s.t1}x + ${s.t2}y <= ${s.T}`;
const timeTex = (s: { t1: number; t2: number; T: number }) => `${s.t1}x + ${s.t2}y \\le ${s.T}`;

function regionGraph(s: Scenario, extraPoints: GraphSpec['points'] = []): GraphSpec {
  const xTop = Math.ceil(Math.max((s.B - s.F) / s.a, s.T / s.t1) / 10) * 10 + 10;
  const yTop = Math.ceil(Math.max((s.B - s.F) / s.b, s.T / s.t2) / 10) * 10 + 10;
  return {
    xMin: 0,
    xMax: xTop,
    yMin: 0,
    yMax: yTop,
    xStep: xTop > 100 ? 20 : 10,
    yStep: yTop > 100 ? 20 : 10,
    xLabel: 'T-shirts (x)',
    yLabel: 'tote bags (y)',
    inequalities: [
      { boundary: linearPlain(Q(-s.a, s.b), Q(s.B - s.F, s.b)), side: 'below', strict: false, color: '#3557d4' },
      { boundary: linearPlain(Q(-s.t1, s.t2), Q(s.T, s.t2)), side: 'below', strict: false, color: '#d4572f' },
    ],
    points: extraPoints,
    ariaLabel: `First quadrant with two shaded inequalities. Blue: the budget line ${s.a}x + ${s.b}y + ${s.F} = ${s.B}, solid, shaded below. Orange: the printing-time line ${s.t1}x + ${s.t2}y = ${s.T}, solid, shaded below. The possible plans are where the shading overlaps.`,
  };
}

const graphBlock = (s: Scenario, pts?: GraphSpec['points']): Block => ({ t: 'graph', spec: regionGraph(s, pts), caption: 'Blue shows the budget limit and orange shows the printing-time limit.' });

const dec = (r: Rational) => (r.isInteger() || r.isTerminatingDecimal() ? r.toDecimalString(10) : `\\approx ${r.toDecimalString(2)}`);

// ---------------------------------------------------------------------------
// Part 1 (S1.15): write the cost model for T-shirts
// ---------------------------------------------------------------------------

const task1: GeneratorDef = {
  id: 'u9.budget.1',
  skillId: 'S1.15',
  description: 'Capstone budget, part 1: write a linear cost model for making T-shirts (rate times count plus a fixed fee).',
  generate(rng) {
    const s = scenario(rng);
    const value = `${s.a}x + ${s.F}`;
    return makeProblem({
      skillId: 'S1.15',
      tags: ['real-world', 'word'],
      prompt: [
        head(1, 'Write the cost model', s),
        p('The club starts by pricing T-shirts alone. Write a linear model $C(x)$ for the total cost, in dollars, of making $x$ T-shirts (and no tote bags).'),
      ],
      answer: { kind: 'expression', value, variables: ['x'] },
      inputHint: 'Type the rule in x, like 3x + 15. You can start with C(x) = .',
      hints: [
        'A linear model has the form $C(x) = mx + b$: a rate times the input, plus a starting amount.',
        'Which cost is paid once, no matter how many T-shirts are made? That is the starting amount.',
        'Which cost is paid again for every T-shirt? That is the rate, in dollars per T-shirt.',
        `Multiply the cost of one T-shirt by $x$, then add the one-time fee. Check: making 0 T-shirts should cost ${money(s.F)}.`,
      ],
      solution: [
        { text: 'Rate of change.', tex: `m = ${s.a}`, why: `Each T-shirt adds ${money(s.a)}, so the cost grows by ${s.a} dollars per T-shirt.` },
        { text: 'Starting value.', tex: `b = ${s.F}`, why: `The setup fee is paid once, even before any T-shirt is printed, so it is the cost when $x = 0$.` },
        { text: 'The model.', tex: `C(x) = ${s.a}x + ${s.F}`, why: 'Rate times the number of T-shirts, plus the one-time fee.' },
      ],
      misconceptions: stringMisconceptions(value, [
        { answer: `${s.F}x + ${s.a}`, tag: 'equation-setup', feedback: 'The fee is paid once, and the per-shirt cost is paid for each shirt. Which number should be multiplied by $x$?' },
        { answer: `${s.a}x`, tag: 'equation-setup', feedback: 'This leaves out a cost the club pays even if it prints only a few shirts.' },
        { answer: `${s.a + s.F}x`, tag: 'equation-setup', feedback: 'The setup fee is not paid again for every shirt. Keep it separate from the rate.' },
      ]),
    });
  },
  verify(pr) {
    const r = parseRecap(pr);
    if (!r) return ['recap unreadable'];
    if (pr.answer.kind !== 'expression') return ['unexpected kind'];
    const v = pr.answer.value;
    // the model must give the fee at x = 0 and add the per-shirt cost for each shirt
    const at = (x: number) => texValue(v.replace(/x/g, `(${x})`));
    const errs: string[] = [];
    if (!at(0).eq(r.F)) errs.push('model does not start at the setup fee');
    for (const n of [1, 7, 30]) if (!at(n).eq(r.F + n * r.a)) errs.push(`model wrong at x = ${n}`);
    return errs.slice(0, 1);
  },
};

// ---------------------------------------------------------------------------
// Part 2 (S1.15): use the model with the budget (round down)
// ---------------------------------------------------------------------------

const task2: GeneratorDef = {
  id: 'u9.budget.2',
  skillId: 'S1.15',
  description: 'Capstone budget, part 2: use the cost model to find the greatest whole number of T-shirts the budget allows.',
  generate(rng) {
    const s = scenario(rng);
    const exact = Q(s.B - s.F, s.a);
    const n = Number(exact.floor());
    return makeProblem({
      skillId: 'S1.15',
      tags: ['real-world', 'word', 'multi-step'],
      prompt: [
        head(2, 'Use the model', s),
        p(`The cost model for T-shirts alone is $C(x) = ${s.a}x + ${s.F}$. Looking only at the money (ignore printing time for now), what is the greatest number of T-shirts the club can make without going over its budget?`),
      ],
      answer: { kind: 'number', value: String(n), unit: 'T-shirts' },
      inputHint: 'Type a whole number.',
      hints: [
        'The total cost has to be at most the budget, so write $C(x) \\le$ budget.',
        `Write $${s.a}x + ${s.F} \\le ${s.B}$ and solve it for $x$.`,
        'Undo the steps in reverse order: subtract the setup fee first, then divide by the cost of one T-shirt.',
        'The answer is a count of T-shirts, so it must be a whole number, and it must not push the cost over the budget. Decide which way to round.',
      ],
      solution: [
        { text: 'Set up the inequality.', tex: `${s.a}x + ${s.F} \\le ${s.B}`, why: 'The cost of the T-shirts may not be more than the budget.' },
        { text: 'Subtract the setup fee.', tex: `${s.a}x \\le ${s.B - s.F}`, why: `After the fee, ${money(s.B - s.F)} is left for shirts.` },
        { text: 'Divide by the cost per shirt.', tex: `x \\le \\dfrac{${s.B - s.F}}{${s.a}} ${dec(exact).startsWith('\\approx') ? dec(exact) : '= ' + dec(exact)}`, why: 'Dividing by a positive number keeps the direction of the inequality.' },
        { text: `Round down to $${n}$ T-shirts.`, tex: `C(${n}) = ${cost(s, n, 0)} \\le ${s.B},\\quad C(${n + 1}) = ${cost(s, n + 1, 0)} > ${s.B}`, why: 'Only whole shirts can be printed, and rounding up would go over the budget.' },
      ],
      misconceptions: numberMisconceptions(Q(n), [
        { value: Q(n + 1), tag: 'other', feedback: 'Check the cost of that many shirts. Rounding up puts the club over its budget.' },
        { value: Q(Math.floor(s.B / s.a)), tag: 'equation-setup', feedback: 'The setup fee comes out of the budget too. Subtract it before you divide.' },
        { value: Q(Math.floor((s.B + s.F) / s.a)), tag: 'inverse-operation', feedback: 'To undo adding the fee, subtract it from the budget.' },
      ]),
    });
  },
  verify(pr) {
    const r = parseRecap(pr);
    if (!r) return ['recap unreadable'];
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    // count up shirt by shirt until the next one would go over the budget
    let n = 0;
    while (r.a * (n + 1) + r.F <= r.B) n++;
    return Rational.parse(pr.answer.value).eq(n) ? [] : [`expected ${n}`];
  },
};

// ---------------------------------------------------------------------------
// Part 3 (S1.15): interpret the slope or the intercept
// ---------------------------------------------------------------------------

const SLOPE_KEY = 'Each additional T-shirt adds';
const INTERCEPT_KEY = 'even if it makes 0 T-shirts';

const task3: GeneratorDef = {
  id: 'u9.budget.3',
  skillId: 'S1.15',
  description: 'Capstone budget, part 3: interpret the rate or the starting value of the cost model in context.',
  generate(rng) {
    const s = scenario(rng);
    const N = s.ask3 === 'slope' ? s.a : s.F;
    const correct =
      s.ask3 === 'slope'
        ? `${SLOPE_KEY} ${money(s.a)} to the total cost.`
        : `The club pays ${money(s.F)} ${INTERCEPT_KEY}: it is the one-time setup fee.`;
    const distractors =
      s.ask3 === 'slope'
        ? [`The club pays a one-time setup fee of ${money(s.a)}.`, `The club can make at most ${s.a} T-shirts.`, `The total cost of the T-shirts is always ${money(s.a)}.`]
        : [`Each additional T-shirt adds ${money(s.F)} to the total cost.`, `The club can make at most ${s.F} T-shirts.`, `The club will have ${money(s.F)} left after buying supplies.`];
    const answer = makeChoice(rng, correct, distractors);
    const rateWrongId = answer.options.find((o) => o.label.startsWith(s.ask3 === 'slope' ? 'The club pays a one-time' : 'Each additional'))!.id;
    return makeProblem({
      skillId: 'S1.15',
      tags: ['real-world', 'word'],
      prompt: [
        head(3, 'Interpret the model', s),
        p(`The cost model for T-shirts alone is $C(x) = ${s.a}x + ${s.F}$. What does the number $${N}$ in this model tell you about the situation?`),
      ],
      answer,
      hints: [
        'In $C(x) = mx + b$, $m$ is the rate of change and $b$ is the value when $x = 0$.',
        `Find where $${N}$ sits in the model: is it multiplied by $x$, or added on its own?`,
        'A number multiplied by $x$ is paid again for every T-shirt. A number added on its own is paid once.',
        `Compare $C(0)$ and $C(1)$ to see what each number in the model does.`,
      ],
      solution: [
        { text: 'Compare two inputs.', tex: `C(0) = ${s.F},\\quad C(1) = ${s.a + s.F}`, why: `With no shirts the cost is the fee alone, and each shirt adds ${money(s.a)}.` },
        { text: correct, why: s.ask3 === 'slope' ? `$${s.a}$ is the slope: the rate in dollars per T-shirt.` : `$${s.F}$ is the $y$-intercept: the cost before any T-shirt is printed.` },
      ],
      misconceptions: [
        { answer: rateWrongId, tag: 'other', feedback: s.ask3 === 'slope' ? 'The number multiplied by $x$ is paid once for every shirt, not once in total.' : 'A number that is not multiplied by $x$ is paid only once.' },
      ],
    });
  },
  verify(pr) {
    const r = parseRecap(pr);
    if (!r) return ['recap unreadable'];
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const q = (pr.prompt[1] as { text: string }).text;
    const m = /C\(x\) = (\d+)x \+ (\d+)\$.*number \$(\d+)\$/.exec(q);
    if (!m) return ['question unreadable'];
    const [mm, bb, N] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (mm !== r.a || bb !== r.F) return ['model in the question does not match the situation'];
    const lab = choiceLabel(pr.answer);
    if (N === r.a) return lab.startsWith(SLOPE_KEY) && lab.includes(money(r.a)) ? [] : ['slope meaning wrong'];
    if (N === r.F) return lab.includes(INTERCEPT_KEY) && lab.includes(money(r.F)) ? [] : ['intercept meaning wrong'];
    return ['asked number is not in the model'];
  },
};

// ---------------------------------------------------------------------------
// Part 4 (S2.06): the budget constraint in two variables
// ---------------------------------------------------------------------------

const task4: GeneratorDef = {
  id: 'u9.budget.4',
  skillId: 'S2.06',
  description: 'Capstone budget, part 4: write the budget constraint for both products as a two-variable inequality.',
  generate(rng) {
    const s = scenario(rng);
    const value = budgetRel(s);
    return makeProblem({
      skillId: 'S2.06',
      tags: ['real-world', 'word'],
      prompt: [head(4, 'Write the budget constraint', s), p('Now the club plans to make both T-shirts and tote bags. Write an inequality in $x$ and $y$ that says the total cost stays within the budget.')],
      answer: { kind: 'inequality', value },
      inputHint: 'Type an inequality using x and y, like 2x + 3y <= 50.',
      hints: [
        'Add up every cost the club pays, then compare the total with the budget.',
        'Each kind of item has its own cost: multiply each cost by how many of that item are made.',
        'Do not forget the cost that is paid only once.',
        '"Stays within the budget" means the total may equal the budget but not go over it. Choose the symbol that says that.',
      ],
      solution: [
        { text: 'Total cost.', tex: `${s.a}x + ${s.b}y + ${s.F}`, why: `${money(s.a)} per T-shirt, ${money(s.b)} per tote bag, plus the one-time fee of ${money(s.F)}.` },
        { text: 'Compare with the budget.', tex: budgetTex(s), why: 'The cost may be equal to the budget but not more, so the symbol is $\\le$.' },
        { text: 'An equivalent form.', tex: `${s.a}x + ${s.b}y \\le ${s.B - s.F}`, why: 'Subtracting the fee from both sides shows the money left for items. Either form is correct.' },
      ],
      misconceptions: stringMisconceptions(value, [
        { answer: `${s.a}x + ${s.b}y <= ${s.B}`, tag: 'equation-setup', feedback: 'The setup fee also comes out of the budget.' },
        { answer: `${s.b}x + ${s.a}y + ${s.F} <= ${s.B}`, tag: 'equation-setup', feedback: 'Match each cost with its own variable: $x$ counts T-shirts and $y$ counts tote bags.' },
        { answer: `${s.a}x + ${s.b}y + ${s.F} >= ${s.B}`, tag: 'inequality-direction', feedback: 'The club cannot spend more than its budget. Which way should the symbol point?' },
        { answer: `${s.a}x + ${s.b}y + ${s.F}x <= ${s.B}`, tag: 'equation-setup', feedback: 'The setup fee is paid once, not once for each T-shirt.' },
      ]),
    });
  },
  verify(pr) {
    const r = parseRecap(pr);
    if (!r) return ['recap unreadable'];
    if (pr.answer.kind !== 'inequality') return ['unexpected kind'];
    return sameHalfPlane(pr.answer.value, r.a, r.b, r.B - r.F) ? [] : ['budget inequality wrong'];
  },
};

// ---------------------------------------------------------------------------
// Part 5 (S2.06): the printing-time constraint (convert hours to minutes)
// ---------------------------------------------------------------------------

const task5: GeneratorDef = {
  id: 'u9.budget.5',
  skillId: 'S2.06',
  description: 'Capstone budget, part 5: write the printing-time constraint as a two-variable inequality, converting hours to minutes.',
  generate(rng) {
    const s = scenario(rng);
    const value = timeRel(s);
    return makeProblem({
      skillId: 'S2.06',
      tags: ['real-world', 'word'],
      prompt: [head(5, 'Write the time constraint', s), p('Write an inequality in $x$ and $y$ that says the printing fits in the time the club has. Measure time in **minutes**.')],
      answer: { kind: 'inequality', value },
      inputHint: 'Type an inequality using x and y.',
      hints: [
        'Find the total printing time for all the items, then compare it with the time available.',
        'Each T-shirt and each tote bag takes its own number of minutes: multiply by how many of each.',
        `The time per item is in minutes but the press time is in hours. Change the hours to minutes: there are 60 minutes in an hour.`,
        '"At most" means the total time may equal the limit but not go over it.',
      ],
      solution: [
        { text: 'Convert the time available.', tex: `${s.H} \\text{ h} \\times 60 \\tfrac{\\text{min}}{\\text{h}} = ${s.T} \\text{ min}`, why: 'Both sides of the inequality must use the same unit.' },
        { text: 'Total printing time.', tex: `${s.t1}x + ${s.t2}y`, why: `${s.t1} minutes for each T-shirt plus ${s.t2} minutes for each tote bag.` },
        { text: 'The constraint.', tex: timeTex(s), why: '"At most" means $\\le$.' },
      ],
      misconceptions: stringMisconceptions(value, [
        { answer: `${s.t1}x + ${s.t2}y <= ${s.H}`, tag: 'units', feedback: 'The left side counts minutes, but the limit is still in hours. Use the same unit on both sides.' },
        { answer: `${s.t2}x + ${s.t1}y <= ${s.T}`, tag: 'equation-setup', feedback: 'Match each printing time with its own variable: $x$ counts T-shirts and $y$ counts tote bags.' },
        { answer: `${s.t1}x + ${s.t2}y >= ${s.T}`, tag: 'inequality-direction', feedback: 'The printing cannot take longer than the time the club has. Which way should the symbol point?' },
      ]),
    });
  },
  verify(pr) {
    const r = parseRecap(pr);
    if (!r) return ['recap unreadable'];
    if (pr.answer.kind !== 'inequality') return ['unexpected kind'];
    return sameHalfPlane(pr.answer.value, r.t1, r.t2, r.T) ? [] : ['time inequality wrong'];
  },
};

// ---------------------------------------------------------------------------
// Part 6 (S2.05): test a proposed plan in both constraints
// ---------------------------------------------------------------------------

const TEST_LABELS: Record<TestCat, string> = {
  ok: 'Yes. The plan fits the budget and the printing time.',
  budget: 'No. The plan costs more than the budget, even though there is enough printing time.',
  time: 'No. The plan needs more printing time than the club has, even though it fits the budget.',
  both: 'No. The plan goes over both the budget and the printing time.',
};

const task6: GeneratorDef = {
  id: 'u9.budget.6',
  skillId: 'S2.05',
  description: 'Capstone budget, part 6: test whether a proposed plan satisfies the system and give the correct reason.',
  generate(rng) {
    const s = scenario(rng);
    const { x, y, cat } = s.test;
    const c = cost(s, x, y);
    const t = time(s, x, y);
    const answer = makeChoice(rng, TEST_LABELS[cat], (Object.keys(TEST_LABELS) as TestCat[]).filter((k) => k !== cat).map((k) => TEST_LABELS[k]));
    const ids = (k: TestCat) => answer.options.find((o) => o.label === TEST_LABELS[k])!.id;
    const misc = [];
    if (cat !== 'ok') misc.push({ answer: ids('ok'), tag: 'shading' as const, feedback: 'Substitute the plan into both inequalities. A plan must make every inequality true.' });
    if (cat === 'both') misc.push({ answer: ids('budget'), tag: 'shading' as const, feedback: 'The budget is a problem, but check the printing time too.' }, { answer: ids('time'), tag: 'shading' as const, feedback: 'The time is a problem, but check the cost too.' });
    if (cat === 'ok') misc.push({ answer: ids('budget'), tag: 'arithmetic-error' as const, feedback: 'Recompute the total cost, including the setup fee, and compare it with the budget.' });
    return makeProblem({
      skillId: 'S2.05',
      tags: ['real-world', 'word', 'multi-step'],
      prompt: [
        head(6, 'Test a plan', s, { minutes: true }),
        p(`The system is $${budgetTex(s)}$ and $${timeTex(s)}$. The club treasurer proposes making ${x} T-shirts and ${y} tote bags. Is this plan possible? Choose the answer with the correct reason.`),
      ],
      answer,
      hints: [
        'A plan is possible only if it makes **every** inequality in the system true.',
        `Substitute $x = ${x}$ and $y = ${y}$ into the budget inequality and compute the total cost.`,
        `Then substitute the same values into the time inequality and compute the total minutes.`,
        `Compare the cost with ${money(s.B)} and the time with ${s.T} minutes. Decide which limits, if any, are broken.`,
      ],
      solution: [
        { text: 'Cost of the plan.', tex: `${s.a}(${x}) + ${s.b}(${y}) + ${s.F} = ${c} ${c <= s.B ? '\\le' : '>'} ${s.B}`, why: c <= s.B ? 'The plan fits the budget.' : 'The plan goes over the budget.' },
        { text: 'Printing time of the plan.', tex: `${s.t1}(${x}) + ${s.t2}(${y}) = ${t} ${t <= s.T ? '\\le' : '>'} ${s.T}`, why: t <= s.T ? 'The plan fits in the printing time.' : 'The plan needs more printing time than the club has.' },
        { text: TEST_LABELS[cat], why: 'A plan is in the solution region only when both inequalities are true.' },
      ],
      misconceptions: misc,
    });
  },
  verify(pr) {
    const r = parseRecap(pr);
    if (!r) return ['recap unreadable'];
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const m = /making (\d+) T-shirts and (\d+) tote bags/.exec((pr.prompt[1] as { text: string }).text);
    if (!m) return ['plan unreadable'];
    const [x, y] = [Number(m[1]), Number(m[2])];
    const okB = holds(budgetRel(r), x, y);
    const okT = holds(timeRel(r), x, y);
    const cat: TestCat = okB && okT ? 'ok' : okT ? 'budget' : okB ? 'time' : 'both';
    return choiceLabel(pr.answer) === TEST_LABELS[cat] ? [] : [`expected ${cat}`];
  },
};

// ---------------------------------------------------------------------------
// Part 7 (S2.05): give any possible whole-number plan
// ---------------------------------------------------------------------------

const task7: GeneratorDef = {
  id: 'u9.budget.7',
  skillId: 'S2.05',
  description: 'Capstone budget, part 7: give any whole-number plan with some of each item in the solution region of the system.',
  generate(rng) {
    const s = scenario(rng);
    const { x, y } = s.ex;
    const constraints = [budgetRel(s), timeRel(s), 'x >= 1', 'y >= 1'];
    return makeProblem({
      skillId: 'S2.05',
      tags: ['real-world', 'word', 'graph', 'multi-step'],
      prompt: [
        head(7, 'Find a possible plan', s, { minutes: true }),
        p(`The system is $${budgetTex(s)}$ and $${timeTex(s)}$. The club wants to make at least one of each item. Give one plan $(x, y)$ that fits both limits.`),
        graphBlock(s),
      ],
      answer: { kind: 'region-point', constraints, example: { x: String(x), y: String(y) }, wholeNumbers: true },
      inputHint: 'Type a plan as (T-shirts, tote bags), like (10, 5). Any plan that works is correct.',
      hints: [
        'The possible plans are the points where both shaded regions overlap.',
        'A plan needs whole numbers, and at least 1 of each item.',
        'Pick a point well inside the overlap, not on or near a boundary line, so small mistakes do not matter.',
        'Check your plan in both inequalities before you answer: the cost must be at most the budget and the time at most the limit.',
      ],
      solution: [
        { text: 'The system.', tex: `${budgetTex(s)},\\quad ${timeTex(s)},\\quad x \\ge 1,\\ y \\ge 1`, why: 'Both limits apply at the same time, and the counts are whole numbers.' },
        {
          text: `Try $(${x}, ${y})$.`,
          tex: `${s.a}(${x}) + ${s.b}(${y}) + ${s.F} = ${cost(s, x, y)} \\le ${s.B},\\quad ${s.t1}(${x}) + ${s.t2}(${y}) = ${time(s, x, y)} \\le ${s.T}`,
          why: 'Both inequalities are true, so this plan works. Many other plans work too.',
        },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const r = parseRecap(pr);
    if (!r) return ['recap unreadable'];
    if (pr.answer.kind !== 'region-point') return ['unexpected kind'];
    const [cb, ct, c3, c4] = pr.answer.constraints;
    const errs: string[] = [];
    if (!sameHalfPlane(cb, r.a, r.b, r.B - r.F)) errs.push('budget constraint wrong');
    if (!sameHalfPlane(ct, r.t1, r.t2, r.T)) errs.push('time constraint wrong');
    if (pr.answer.constraints.length !== 4 || !holds(c3, 1, 0) || holds(c3, 0, 5) || !holds(c4, 0, 1) || holds(c4, 5, 0)) errs.push('at-least-one constraints wrong');
    if (!pr.answer.wholeNumbers) errs.push('whole numbers required');
    const x = Number(pr.answer.example.x);
    const y = Number(pr.answer.example.y);
    if (!(Number.isInteger(x) && Number.isInteger(y) && x >= 1 && y >= 1 && r.a * x + r.b * y + r.F <= r.B && r.t1 * x + r.t2 * y <= r.T)) errs.push('example plan fails');
    return errs.slice(0, 1);
  },
};

// ---------------------------------------------------------------------------
// Part 8 (S2.05): choose the most profitable plan that is actually possible
// ---------------------------------------------------------------------------

const planLabel = (q: Plan) => `Plan ${q.name}: ${q.x} T-shirts and ${q.y} tote bags`;

const task8: GeneratorDef = {
  id: 'u9.budget.8',
  skillId: 'S2.05',
  description: 'Capstone budget, part 8: compare the profit of several plans and choose the best one that satisfies the system.',
  generate(rng) {
    const s = scenario(rng);
    const u1 = s.p1 - s.a;
    const u2 = s.p2 - s.b;
    const feasible = (q: Plan) => fitsBudget(s, q.x, q.y) && fitsTime(s, q.x, q.y);
    const bestOk = s.plans.filter(feasible).sort((u, v) => profit(s, v.x, v.y) - profit(s, u.x, u.y))[0];
    const bad = s.plans.find((q) => !feasible(q))!;
    const answer = makeChoice(rng, planLabel(bestOk), s.plans.filter((q) => q !== bestOk).map(planLabel));
    const badId = answer.options.find((o) => o.label === planLabel(bad))!.id;
    const lineFor = (q: Plan) => {
      const c = cost(s, q.x, q.y);
      const t = time(s, q.x, q.y);
      const issues = [c > s.B ? `cost ${money(c)} is over the budget` : '', t > s.T ? `time ${t} min is over the limit` : ''].filter(Boolean);
      return {
        text: `Plan ${q.name}: profit ${money(profit(s, q.x, q.y))}. ${issues.length ? `Not possible: ${issues.join(' and ')}.` : 'Possible: it fits both limits.'}`,
        tex: `P = ${u1}(${q.x}) + ${u2}(${q.y}) - ${s.F} = ${profit(s, q.x, q.y)};\\quad \\text{cost } ${c},\\ \\text{time } ${t}`,
        why: issues.length ? 'A plan outside the solution region cannot be carried out, however much it would earn.' : 'This plan is in the solution region.',
      };
    };
    return makeProblem({
      skillId: 'S2.05',
      tags: ['real-world', 'word', 'multi-step'],
      prompt: [
        head(8, 'Compare plans', s, { minutes: true, prices: true }),
        { t: 'table', headers: ['Plan', 'T-shirts (x)', 'Tote bags (y)'], rows: s.plans.map((q) => [q.name, String(q.x), String(q.y)]) },
        p(`Profit is the money from sales minus all the costs. The club wants the plan with the greatest profit **that it can actually make** within the budget of ${money(s.B)} and ${s.T} minutes of printing time. Which plan should it choose?`),
      ],
      answer,
      hints: [
        'First check each plan in both limits: the total cost (with the setup fee) and the total printing time.',
        `Profit per T-shirt is the selling price minus the cost: ${money(s.p1)} − ${money(s.a)}. Do the same for a tote bag.`,
        `A profit model is $P = (\\text{profit per T-shirt})x + (\\text{profit per tote bag})y - ${s.F}$, because the setup fee is paid once.`,
        'Compute the profit only for the plans that fit both limits, then pick the largest. A plan that breaks a limit is out, even if it would earn more.',
      ],
      solution: [
        { text: 'Profit model.', tex: `P = (${s.p1} - ${s.a})x + (${s.p2} - ${s.b})y - ${s.F} = ${u1}x + ${u2}y - ${s.F}`, why: 'Each item earns its price minus its cost, and the fee is subtracted once.' },
        ...s.plans.map(lineFor),
        { text: `The best possible plan is ${planLabel(bestOk)}.`, why: `It has the greatest profit among the plans that satisfy both inequalities. Plan ${bad.name} would earn more but is not possible.` },
      ],
      misconceptions: [{ answer: badId, tag: 'shading', feedback: 'That plan would earn the most, but check it in both limits first. Can the club actually make it?' }],
    });
  },
  verify(pr) {
    const r = parseRecap(pr);
    if (!r || r.p1 === undefined || r.p2 === undefined) return ['recap unreadable'];
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const table = pr.prompt[1] as { t: string; rows?: string[][] };
    if (table.t !== 'table' || !table.rows) return ['plan table missing'];
    const plans = table.rows.map(([name, x, y]) => ({ name, x: Number(x), y: Number(y) }));
    // revenue and costs computed separately, feasibility checked through the relation checker
    const prof = (q: Plan) => r.p1! * q.x + r.p2! * q.y - (r.a * q.x + r.b * q.y + r.F);
    const ok = plans.filter((q) => holds(budgetRel(r), q.x, q.y) && holds(timeRel(r), q.x, q.y));
    if (!ok.length) return ['no possible plan'];
    const top = Math.max(...ok.map(prof));
    const winners = ok.filter((q) => prof(q) === top);
    if (winners.length !== 1) return ['tie for best plan'];
    const lab = choiceLabel(pr.answer);
    const m = /^Plan ([A-D]): (\d+) T-shirts and (\d+) tote bags$/.exec(lab);
    if (!m) return ['option unreadable'];
    const w = winners[0];
    return m[1] === w.name && Number(m[2]) === w.x && Number(m[3]) === w.y ? [] : [`expected plan ${w.name}`];
  },
};

// ---------------------------------------------------------------------------
// Part 9 (S2.06): validate: which solutions of the system make sense
// ---------------------------------------------------------------------------

const ODD_KEY = { fraction: 'The club cannot print part of a T-shirt', negative: 'The club cannot make a negative number of T-shirts' };

const task9: GeneratorDef = {
  id: 'u9.budget.9',
  skillId: 'S2.06',
  description: 'Capstone budget, part 9: validate the model by deciding why a point that satisfies both inequalities is not a real plan.',
  generate(rng) {
    const s = scenario(rng);
    const { x, y, kind } = s.odd;
    const xs = numStr(Q(x * 2, 2));
    const correct = kind === 'fraction' ? `No. ${ODD_KEY.fraction}, so the counts must be whole numbers.` : `No. ${ODD_KEY.negative}, so the counts must be 0 or more.`;
    const yesLabel = 'Yes. It makes both inequalities true, so it is a possible plan.';
    const answer = makeChoice(rng, correct, [yesLabel, 'No. It costs more than the budget allows.', 'No. It needs more printing time than the club has.']);
    const yesId = answer.options.find((o) => o.label === yesLabel)!.id;
    const xq = Q(x * 2, 2);
    const c = xq.mul(s.a).add(s.b * y + s.F);
    const t = xq.mul(s.t1).add(s.t2 * y);
    return makeProblem({
      skillId: 'S2.06',
      tags: ['real-world', 'word'],
      prompt: [
        head(9, 'Check that the answer makes sense', s, { minutes: true }),
        p(`The system is $${budgetTex(s)}$ and $${timeTex(s)}$. A classmate notices that the point $(${xs}, ${y})$ makes both inequalities true. Is it a possible plan for the club? Choose the answer with the correct reason.`),
      ],
      answer,
      hints: [
        'Start by checking the classmate\'s claim: substitute the point into both inequalities.',
        'An inequality does not know what $x$ and $y$ stand for. The situation does.',
        'Ask what kind of numbers can count T-shirts and tote bags.',
        `Look closely at the value $x = ${xs}$. Could the club really make that many T-shirts?`,
      ],
      solution: [
        { text: 'Check the budget.', tex: `${s.a}(${xs}) + ${s.b}(${y}) + ${s.F} = ${numStr(c)} \\le ${s.B}`, why: 'The point is within the budget.' },
        { text: 'Check the time.', tex: `${s.t1}(${xs}) + ${s.t2}(${y}) = ${numStr(t)} \\le ${s.T}`, why: 'The point is within the printing time.' },
        {
          text: correct,
          why: 'The inequalities describe all real numbers, but a plan counts items, so only whole numbers 0 or more make sense. This is a limit of the model that the context adds.',
        },
      ],
      misconceptions: [{ answer: yesId, tag: 'other', feedback: 'The point does make both inequalities true. Now think about what $x$ counts in this situation.' }],
    });
  },
  verify(pr) {
    const r = parseRecap(pr);
    if (!r) return ['recap unreadable'];
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const m = /point \$\((-?\d+(?:\.\d+)?), (\d+)\)\$/.exec((pr.prompt[1] as { text: string }).text);
    if (!m) return ['point unreadable'];
    const x = Rational.parse(m[1]);
    const y = Rational.parse(m[2]);
    const errs: string[] = [];
    // the point really satisfies both constraints, so the "over the limit" reasons are false
    if (!holds(budgetRel(r), x, y) || !holds(timeRel(r), x, y)) errs.push('point is not in the region');
    const lab = choiceLabel(pr.answer);
    const want = x.isNegative() ? ODD_KEY.negative : !x.isInteger() ? ODD_KEY.fraction : null;
    if (!want) errs.push('point is a real plan');
    else if (!lab.startsWith('No.') || !lab.includes(want)) errs.push('wrong reason chosen');
    return errs.slice(0, 1);
  },
};

// ---------------------------------------------------------------------------

export const CAP_BUDGET_GENERATORS: GeneratorDef[] = [task1, task2, task3, task4, task5, task6, task7, task8, task9];

export const CAP_BUDGET: CapstoneContent = {
  lessonId: 'U9L01',
  goal: 'Use a linear cost model and a system of inequalities to plan a fundraiser booth that fits a budget and a time limit.',
  intro: [
    p('Your school club is running a booth at the fall festival. The club will print custom **T-shirts** and **tote bags** and sell them to raise money.'),
    p('The print shop charges a one-time setup fee plus a cost for each item, and the club has a fixed supply budget. Printing also takes time, and the club can use the press for only a few hours.'),
    p('**The question:** how many of each item should the club make so the plan fits the money and the time, and which plan earns the most?'),
    p('You will work through the modeling cycle: name the quantities, write a model, compute with it, interpret what the numbers mean, and check that the answers make sense in the real situation.'),
  ],
  plan: [
    'Define the quantities: x T-shirts and y tote bags',
    'Write a linear cost model for T-shirts',
    'Use the model with the budget',
    'Interpret the numbers in the model',
    'Write the budget and time constraints as a system',
    'Test plans and find one that works',
    'Compare the profit of possible plans',
    'Validate: which solutions make sense in context',
  ],
  tasks: [
    { part: 'Write the cost model', generator: 'u9.budget.1' },
    { part: 'Use the model', generator: 'u9.budget.2' },
    { part: 'Interpret the model', generator: 'u9.budget.3' },
    { part: 'Write the budget constraint', generator: 'u9.budget.4' },
    { part: 'Write the time constraint', generator: 'u9.budget.5' },
    { part: 'Test a plan', generator: 'u9.budget.6' },
    { part: 'Find a possible plan', generator: 'u9.budget.7' },
    { part: 'Compare plans', generator: 'u9.budget.8' },
    { part: 'Check that the answer makes sense', generator: 'u9.budget.9' },
  ],
  wrapUp: [
    p('A linear model turned a price list into a rule: the slope is the cost of one more item and the intercept is the cost paid once. Two limits, money and time, became a system of inequalities, and every possible plan is a point where both shaded regions overlap.'),
    p('The most profitable plan on paper is not always possible: a plan has to satisfy **every** constraint. And not every point in the region is a real plan, because the club can only make whole, non-negative numbers of items.'),
    p('The model also leaves things out: it assumes every item sells, that prices and costs stay fixed, and that the press never breaks down. A real plan would leave some room for these.'),
  ],
};
