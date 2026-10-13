/**
 * Graph-building problems from a situation (A.FGR.2.2 / A.MM.1, A.PAR.4.1, A.FGR.7.6, A.PAR.8.3:
 * "graph ... on coordinate axes with labels and scales"). The student labels both axes, chooses a
 * scale for each, places points on the grid and, for an inequality, picks the boundary type and the
 * shaded side. Grading is exact (see core/math/graphAnswer.ts).
 *
 * Every situation is built so that, with ANY accepted scale, the key points (starting value,
 * intercepts, vertex) land on grid intersections; graphSpecErrors() checks it and a seed that fails is
 * rejected. verify() re-reads the numbers from the prompt and rebuilds the graph independently.
 */
import type { Difficulty, GeneratorDef, Problem, ProblemStep, Rng } from '../../core/curriculum/types';
import type { Misconception } from '../../core/math/answers';
import { parseRelation, relationHolds, inequalitiesEquivalent, exactValue, checkAnswer } from '../../core/math/answers';
import { type GraphAnswer, type GraphAxis, type GraphTarget, graphSpecErrors, drawableGraphMisconceptions, canonicalGraphInput, checkGraph, targetY, acceptedScales } from '../../core/math/graphAnswer';
import { Rational } from '../../core/math/rational';
import { Q, p, money, numStr, makeProblem, steps, coefPlain } from './util';

type H4 = [string, string, string, string];

const GRID = 10;
const INPUT_HINT = 'Label both axes, choose a scale for each, then place points with the mouse or with the arrow keys and Enter.';

const text = (pr: Problem) => pr.prompt.map((b) => (b.t === 'p' ? b.text : '')).join(' ');

/**
 * `words` name the quantity (see GraphAxis.words: a "*" stem matches every inflection, a unit word
 * counts only when listed here); `units` are the units it may be written in, [] for a count.
 */
function axis(options: string[], need: Rational, keys: Rational[], label: string, q: Quantity): GraphAxis {
  return { options, need: numStr(need), keys: keys.map(numStr), label, words: q.words, units: q.units };
}

interface Quantity {
  words: string[];
  units: string[];
}

/** The quantities on the axes, with the words a student may reasonably use for each. */
const QTY = {
  rentalHours: { words: ['time', 'hour', 'hr', 'length', 'duration', 'rental*', 'rented'], units: ['hour'] },
  rentalCost: { words: ['cost*', 'dollar', 'price*', 'charge*', 'money', 'total*', 'pay*', 'paid', 'amount', 'spen*', 'fee*'], units: ['dollar'] },
  drainMinutes: { words: ['time', 'minute', 'min', 'duration', 'elapsed'], units: ['minute'] },
  water: { words: ['water', 'gallon', 'gal', 'volume', 'amount'], units: ['gallon'] },
  babysitting: { words: ['babysit*', 'babysat', 'baby sit*', 'baby sat', 'baby-sit*', 'baby-sat', 'sitting'], units: ['hour'] },
  tutoring: { words: ['tutor*'], units: ['hour'] },
  sketchbooks: { words: ['sketch*', 'book*'], units: [] },
  paintSets: { words: ['paint*', 'set', 'kit'], units: [] },
  kickTime: { words: ['time', 'second', 'sec', 'elapsed'], units: ['second'] },
  height: { words: ['height', 'high', 'tall', 'elevation', 'altitude'], units: ['foot'] },
  side: { words: ['side', 'length', 'width', 'wide', 'long', 'dimension', 'base'], units: ['foot'] },
  area: { words: ['area', 'square feet', 'square foot', 'sq ft', 'sq. ft', 'sqft', 'ft²', 'ft^2', 'space'], units: ['sqft'] },
  growHours: { words: ['time', 'hour', 'hr', 'elapsed'], units: ['hour'] },
  bacteria: { words: ['bacteri*', 'population', 'cell*', 'colon*', 'germ*', 'microbe*', 'organism*'], units: [] },
  medicine: { words: ['medic*', 'drug*', 'mg', 'milligram', 'dose*', 'dosage', 'amount'], units: ['mg'] },
} satisfies Record<string, Quantity>;

function graphSpec(target: GraphTarget, rule: string, x: GraphAxis, y: GraphAxis, minPoints: number, cols = GRID): GraphAnswer {
  const spec: GraphAnswer = { kind: 'graph', target, rule, cols, rows: GRID, x, y, minPoints };
  const errs = graphSpecErrors(spec);
  if (errs.length) throw new Error('graph does not fit its grid: ' + errs.join('; '));
  return spec;
}

/** "y = 15x + 40", "y = -20x + 200" */
function lineRule(m: Rational, b: Rational): string {
  const mx = m.eq(1) ? 'x' : m.eq(-1) ? '-x' : `${numStr(m)}x`;
  if (b.isZero()) return `y = ${mx}`;
  return `y = ${mx} ${b.isNegative() ? '-' : '+'} ${numStr(b.abs())}`;
}

function graphStep(spec: GraphAnswer, prompt: string, hints: H4, explanation: string, misconceptions: Misconception[]): ProblemStep {
  return { prompt: [p(prompt)], answer: spec, inputHint: INPUT_HINT, hints, misconceptions, explanation };
}

/** Draw new numbers until the situation fits its grid with every accepted scale (deterministic: the same rng). */
function retry(f: () => Problem): Problem {
  let last: unknown;
  for (let i = 0; i < 40; i++) {
    try {
      return f();
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

const swapLabels = (feedback: string): Misconception => ({ answer: JSON.stringify({ swapLabels: true }), tag: 'axis-labels', feedback });

/** The answer key's own drawing must be correct and every listed misconception must be drawable and wrong. */
function graphChecks(pr: Problem, want: GraphTarget): string[] {
  const errs: string[] = [];
  if (pr.answer.kind !== 'graph') return ['answer is not a graph'];
  const a = pr.answer;
  const t = a.target;
  if (t.type !== want.type) return [`target is a ${t.type}, the situation gives a ${want.type}`];
  // compare the two targets as functions at several inputs (and the symbol for an inequality)
  for (const x of [0, 1, 2, 3, 5, 7]) {
    const u = targetY(t, Q(x));
    const v = targetY(want, Q(x));
    if ((u === null) !== (v === null) || (u && v && !u.eq(v))) errs.push(`target differs from the situation at x = ${x}`);
  }
  if (t.type === 'inequality' && want.type === 'inequality' && t.op !== want.op) errs.push('inequality symbol differs from the situation');
  errs.push(...graphSpecErrors(a));
  if (pr.steps?.length && JSON.stringify(pr.steps[pr.steps.length - 1].answer) !== JSON.stringify(a)) errs.push('the last guided step is not the graph itself');
  try {
    if (checkGraph(a, canonicalGraphInput(a)).status !== 'correct') errs.push('the key drawing is not graded correct');
  } catch (e) {
    errs.push('the key cannot be drawn: ' + (e as Error).message);
  }
  return errs;
}

// ---------------------------------------------------------------------------
// Linear function from a situation (S1.15)
// ---------------------------------------------------------------------------

const LIN_X = ['0.5', '1', '2', '5'];
const LIN_Y = ['1', '2', '5', '10', '20', '25', '50', '100'];

function linearProblem(rng: Rng, d: Difficulty): Problem {
  const drain = d === 3 || (d === 2 && rng.bool());
  let m: Rational, b: Rational, xNeed: Rational, xKeys: Rational[], story: string, xl: [string, Quantity], yl: [string, Quantity], slopeWords: string, startWords: string;
  if (!drain) {
    const fee = rng.pick([10, 20, 30, 40, 50]);
    const rate = rng.pick([5, 10, 15, 20]);
    const hours = rng.pick([4, 5, 6, 8]);
    m = Q(rate);
    b = Q(fee);
    xNeed = Q(hours);
    xKeys = [];
    story = `A bike rental shop charges a ${money(fee)} fee plus ${money(rate)} per hour. Let $x$ be the number of hours and $y$ the total cost in dollars. Graph the total cost for rentals from 0 to ${hours} hours.`;
    xl = ['Time (hours)', QTY.rentalHours];
    yl = ['Total cost (dollars)', QTY.rentalCost];
    slopeWords = `each hour adds ${money(rate)}`;
    startWords = `the fee, ${money(fee)}, is what you pay at 0 hours`;
  } else {
    const rate = rng.pick([5, 10, 20, 25, 50]);
    const minutes = rng.pick([4, 5, 6, 8, 10]);
    const full = rate * minutes;
    m = Q(-rate);
    b = Q(full);
    xNeed = Q(minutes);
    xKeys = [Q(minutes)];
    story = `A tank holds ${full} gallons of water. It drains at a steady ${rate} gallons per minute. Let $x$ be the time in minutes and $y$ the gallons of water left. Graph the water left from the moment it starts draining until the tank is empty.`;
    xl = ['Time (minutes)', QTY.drainMinutes];
    yl = ['Water left (gallons)', QTY.water];
    slopeWords = `each minute takes away ${rate} gallons`;
    startWords = `the tank starts with ${full} gallons at 0 minutes`;
  }
  const yNeed = drain ? b : b.add(m.mul(xNeed));
  const rule = lineRule(m, b);
  const spec = graphSpec({ type: 'line', m: numStr(m), b: numStr(b) }, rule, axis(LIN_X, xNeed, xKeys, xl[0], xl[1]), axis(LIN_Y, yNeed, [b], yl[0], yl[1]), 2);
  const mis = drawableGraphMisconceptions<Misconception>(spec, [
    { answer: JSON.stringify({ target: { m: numStr(b), b: numStr(m) } }), tag: 'equation-setup', feedback: 'Check which number is the starting value (the output when the input is 0) and which is the rate (the change for each 1 more of the input).' },
    { answer: JSON.stringify({ target: { b: '0' } }), tag: 'equation-setup', feedback: 'Your line starts at the origin. What is the output when the input is 0 in this situation?' },
    { answer: JSON.stringify({ target: { m: numStr(m.neg()) } }), tag: 'sign-error', feedback: drain ? 'The tank is draining, so the water goes down as time goes on. Check the direction of your line.' : 'The cost grows as the hours go up. Check the direction of your line.' },
    swapLabels('Your labels are swapped. Time is the input, so it goes across the bottom; the quantity that depends on time goes up the side.'),
  ]);
  const hints: H4 = [
    'Write the rule first: what is the output when the input is 0, and how much does it change for each 1 more of the input?',
    `Label the axes: the input (${xl[0].toLowerCase()}) goes across the bottom and the output (${yl[0].toLowerCase()}) goes up the side. Then pick a scale for each axis so the whole situation fits in ${GRID} squares and the starting value lands on a grid line.`,
    `Plot the starting point first: ${startWords}.`,
    `From the starting point, ${slopeWords}. Work out the output for a few inputs and plot two of those points that land on grid intersections.`,
  ];
  const sample = [0, 1, 2, 4].map((x) => `(${x}, ${numStr(m.mul(x).add(b))})`).join(', ');
  return makeProblem({
    skillId: 'S1.15',
    tags: ['real-world', 'graph', 'application'],
    prompt: [p(story)],
    answer: spec,
    inputHint: INPUT_HINT,
    hints,
    solution: steps(
      { text: 'Write the rule.', tex: rule, why: `The starting value is ${numStr(b)} and the rate is ${numStr(m)} per unit of input.` },
      { text: `Label the axes "${xl[0]}" (across) and "${yl[0]}" (up).`, why: 'The input goes on the horizontal axis and the output on the vertical axis, each with its unit.' },
      { text: `Choose scales: ${acceptedScales(spec.x, GRID).join(' or ')} per square across, ${acceptedScales(spec.y, GRID).join(' or ')} per square up.`, why: `The graph needs inputs up to ${numStr(xNeed)} and outputs up to ${numStr(yNeed)}; these scales fit them in ${GRID} squares and put the key points on grid lines.` },
      { text: `Plot points such as ${sample} and draw the line through them.`, why: 'Two points determine a line; a third is a good check.' },
    ),
    misconceptions: mis,
    steps: [
      {
        prompt: [p('Write the rule as an equation in $x$ and $y$.')],
        answer: { kind: 'equation', value: rule },
        inputHint: 'Type an equation like y = 3x + 10.',
        hints: ['The rule has the form $y = mx + b$.', '$b$ is the output when the input is 0.', '$m$ is the change in the output for each 1 more of the input.', `Here ${startWords}, and ${slopeWords}.`],
        misconceptions: m.abs().eq(b) ? [] : [{ answer: `y = ${numStr(b)}x ${m.isNegative() ? '-' : '+'} ${numStr(m.abs())}`, tag: 'equation-setup', feedback: 'The rate multiplies $x$; the starting value is added on its own.' }],
        explanation: `$${rule}$: start at ${numStr(b)} and change by ${numStr(m)} for each 1 more of the input.`,
      },
      graphStep(spec, 'Now graph it: label both axes, choose a scale for each, and place at least two points on the line.', [hints[1], 'Count how far each axis must reach, then pick the smallest offered scale that reaches it.', hints[2], hints[3]], `The line starts at $(0, ${numStr(b)})$ and changes by ${numStr(m)} for each 1 more of the input.`, mis),
    ],
  });
}

function verifyLinear(pr: Problem): string[] {
  const s = text(pr);
  const rent = /charges a \\\$(\d+) fee plus \\\$(\d+) per hour/.exec(s);
  const tank = /holds (\d+) gallons .* drains at a steady (\d+) gallons per minute/.exec(s);
  let want: GraphTarget;
  if (rent) want = { type: 'line', m: rent[2], b: rent[1] };
  else if (tank) want = { type: 'line', m: String(-Number(tank[2])), b: tank[1] };
  else return ['cannot read the situation'];
  const errs = graphChecks(pr, want);
  const eq = pr.steps?.[0].answer;
  if (eq?.kind === 'equation') {
    const rel = parseRelation(eq.value);
    for (const x of [0, 3]) if (!relationHolds(rel, Q(x), targetY(want, Q(x))!)) errs.push('step 1 rule does not match the situation');
  } else errs.push('step 1 is not the equation');
  return errs;
}

// ---------------------------------------------------------------------------
// Linear inequality from a situation (S2.03)
// ---------------------------------------------------------------------------

const INEQ_SCALES = ['0.5', '1', '2', '5'];
type Op = '<' | '<=' | '>' | '>=';
const OP_TEXT: Record<Op, string> = { '<': '<', '<=': '≤', '>': '>', '>=': '≥' };

function lcm(a: number, b: number): number {
  const g = (x: number, y: number): number => (y ? g(y, x % y) : x);
  return (a * b) / g(a, b);
}

function inequalityProblem(rng: Rng, d: Difficulty): Problem {
  const X = rng.pick([4, 5, 6, 8, 10]);
  const Y = rng.pick([4, 5, 6, 8, 10].filter((v) => v !== X));
  const earn = rng.bool();
  const strict = d === 1 ? false : d === 3 ? true : rng.bool();
  const op: Op = earn ? (strict ? '>' : '>=') : strict ? '<' : '<=';
  const c = rng.pick(earn ? [2, 3, 4] : [1, 2, 3]);
  const T = lcm(X, Y) * c;
  const px = T / X;
  const py = T / Y;
  let story: string, xl: [string, Quantity], yl: [string, Quantity], goal: string, testWords: string;
  if (earn) {
    const phrase = strict ? 'more than' : 'at least';
    story = `You want to earn ${phrase} ${money(T)} this month. Babysitting pays ${money(px)} per hour and tutoring pays ${money(py)} per hour. Let $x$ be the hours of babysitting and $y$ the hours of tutoring. Graph the inequality that shows every combination of hours that meets your goal.`;
    xl = ['Hours babysitting', QTY.babysitting];
    yl = ['Hours tutoring', QTY.tutoring];
    goal = `${phrase} ${money(T)}`;
    testWords = 'Does working 0 hours of each meet the goal?';
  } else {
    const phrase = strict ? 'less than' : 'at most';
    story = `You can spend ${phrase} ${money(T)} on art supplies. Sketchbooks cost ${money(px)} each and paint sets cost ${money(py)} each. Let $x$ be the number of sketchbooks and $y$ the number of paint sets. Graph the inequality that shows every combination you can buy.`;
    xl = ['Number of sketchbooks', QTY.sketchbooks];
    yl = ['Number of paint sets', QTY.paintSets];
    goal = `${phrase} ${money(T)}`;
    testWords = 'Does buying nothing at all fit the budget?';
  }
  const m = Q(-Y, X);
  const b = Q(Y);
  const target: GraphTarget = { type: 'inequality', m: numStr(m), b: numStr(b), op };
  const lhs = `${coefPlain(px)}x + ${coefPlain(py)}y`;
  const rule = `${lhs} ${OP_TEXT[op]} ${T}`;
  const spec = graphSpec(target, rule, axis(INEQ_SCALES, Q(X), [Q(X)], xl[0], xl[1]), axis(INEQ_SCALES, Q(Y), [Q(Y)], yl[0], yl[1]), 2);
  const flipDir: Record<Op, Op> = { '<': '>', '<=': '>=', '>': '<', '>=': '<=' };
  const flipStrict: Record<Op, Op> = { '<': '<=', '<=': '<', '>': '>=', '>=': '>' };
  const mis = drawableGraphMisconceptions<Misconception>(spec, [
    { answer: JSON.stringify({ target: { op: flipDir[op] } }), tag: 'shading', feedback: `Test a point that is not on the line, like $(0, 0)$. ${testWords} Shade the side whose points work.` },
    { answer: JSON.stringify({ target: { op: flipStrict[op] } }), tag: 'boundary-line', feedback: `A point on the boundary line is a combination that totals exactly ${money(T)}. Does exactly ${money(T)} count as ${goal}? That decides solid or dashed.` },
    { answer: JSON.stringify({ target: { m: numStr(Q(-X, Y)), b: numStr(Q(X)) } }), tag: 'equation-setup', feedback: 'Your intercepts are swapped. Find the most you could have of the $x$ item when $y$ is 0, and mark it on the horizontal axis.' },
    swapLabels('Your labels are swapped: $x$ goes across the bottom and $y$ goes up the side.'),
  ]);
  const hints: H4 = [
    `Write the inequality: (price or pay per unit) times $x$, plus the same for $y$, compared with ${money(T)}. Which symbol means "${goal.replace(/ \\\$\d+$/, '')}"?`,
    `Label the axes with the two quantities ($x$ across, $y$ up). The boundary line is easiest to draw from its intercepts: set $y = 0$ to find one and $x = 0$ to find the other. Choose scales that put both on grid lines.`,
    `Place two points on the boundary line (the intercepts work). Then decide: does a combination that totals exactly ${money(T)} count? That decides solid or dashed.`,
    `To pick the side, test a point that is not on the line, like $(0, 0)$. ${testWords} Shade the side whose points make the inequality true.`,
  ];
  return makeProblem({
    skillId: 'S2.03',
    tags: ['real-world', 'graph', 'application'],
    prompt: [p(story)],
    answer: spec,
    inputHint: INPUT_HINT,
    hints,
    solution: steps(
      { text: 'Write the inequality.', tex: rule.replace('≤', '\\le').replace('≥', '\\ge'), why: `Pay or cost per unit times the number of units, for each item, compared with ${money(T)}: "${goal}".` },
      { text: `Find the intercepts of the boundary: $(${X}, 0)$ and $(0, ${Y})$.`, tex: `${px}(${X}) = ${T}, \\quad ${py}(${Y}) = ${T}`, why: 'On the horizontal axis $y = 0$; on the vertical axis $x = 0$.' },
      { text: `Label the axes "${xl[0]}" and "${yl[0]}", with ${acceptedScales(spec.x, GRID).join(' or ')} per square across and ${acceptedScales(spec.y, GRID).join(' or ')} per square up.`, why: 'These scales fit both intercepts on the grid, on grid lines.' },
      { text: `Draw a ${strict ? 'dashed' : 'solid'} line through the intercepts.`, why: strict ? `Exactly ${money(T)} is not ${goal}, so points on the line are not solutions.` : `Exactly ${money(T)} counts as ${goal}, so points on the line are solutions.` },
      { text: `Shade ${earn ? 'above' : 'below'} the line.`, why: `Test $(0, 0)$: $0 ${OP_TEXT[op]} ${T}$ is ${earn ? 'false, so the solutions are on the other side, away from the origin' : 'true, so shade the side with the origin'}.` },
    ),
    misconceptions: mis,
    steps: [
      {
        prompt: [p('Write the inequality in $x$ and $y$.')],
        answer: { kind: 'inequality', value: `${lhs} ${op} ${T}` },
        inputHint: 'Type an inequality like 3x + 5y >= 60.',
        hints: ['Each part of the total is a price (or pay rate) times a number of units.', `The $x$ part is ${money(px)} times $x$; the $y$ part is ${money(py)} times $y$.`, `Add the two parts and compare the sum with ${money(T)}.`, `"${goal.replace(/ \\\$\d+$/, '')}" ${strict ? 'leaves out the boundary amount itself' : 'includes the boundary amount itself'}.`],
        misconceptions: [{ answer: `${lhs} ${flipDir[op]} ${T}`, tag: 'inequality-direction', feedback: `Read the goal again: "${goal}". Should the total be bigger or smaller than ${money(T)}?` }],
        explanation: `$${rule.replace('≤', '\\le').replace('≥', '\\ge')}$`,
      },
      graphStep(spec, 'Now graph it: label both axes, choose the scales, place two points on the boundary line, then choose solid or dashed and the side to shade.', [hints[1], 'The intercepts are where one of the two amounts is 0.', hints[2], hints[3]], `Boundary through $(${X}, 0)$ and $(0, ${Y})$, ${strict ? 'dashed' : 'solid'}, shaded ${earn ? 'above' : 'below'}.`, mis),
    ],
  });
}

function verifyInequality(pr: Problem): string[] {
  const s = text(pr);
  const earn = /earn (at least|more than) \\\$(\d+) .* pays \\\$(\d+) per hour .* pays \\\$(\d+) per hour/.exec(s);
  const spend = /spend (at most|less than) \\\$(\d+) .* cost \\\$(\d+) each .* cost \\\$(\d+) each/.exec(s);
  const g = earn ?? spend;
  if (!g) return ['cannot read the situation'];
  const [T, px, py] = [Q(g[2]), Q(g[3]), Q(g[4])];
  const op: Op = earn ? (g[1] === 'at least' ? '>=' : '>') : g[1] === 'at most' ? '<=' : '<';
  // px·x + py·y op T  ⇔  y op' -(px/py)x + T/py (py > 0, no flip)
  const want: GraphTarget = { type: 'inequality', m: numStr(px.div(py).neg()), b: numStr(T.div(py)), op };
  const errs = graphChecks(pr, want);
  // a point inside the region must satisfy the original inequality
  const rel = parseRelation(`${numStr(px)}x + ${numStr(py)}y ${op} ${numStr(T)}`);
  const inside = earn ? [Q(20), Q(20)] : [Q(0), Q(0)];
  if (!relationHolds(rel, inside[0], inside[1])) errs.push('test point check failed');
  const st = pr.steps?.[0]?.answer;
  if (st?.kind !== 'inequality' || !inequalitiesEquivalent(parseRelation(st.value), rel)) errs.push('step 1 inequality does not match the situation');
  return errs;
}

// ---------------------------------------------------------------------------
// Quadratic from a situation (S4.20)
// ---------------------------------------------------------------------------

function quadraticProblem(rng: Rng, d: Difficulty): Problem {
  const ball = d === 1 || (d === 2 && rng.bool());
  let target: GraphTarget, rule: string, story: string, xA: GraphAxis, yA: GraphAxis, vertex: [Rational, Rational], landing: Rational, form: string, vertexHint: string;
  if (ball) {
    const k = rng.pick([1, 2, 3]);
    const v = 32 * k;
    const top = 16 * k * k;
    target = { type: 'parabola', a: '-16', h: String(k), k: String(top) };
    rule = `h = -16t^2 + ${v}t`;
    form = `-16t^2 + ${v}t`;
    story = `A ball is kicked straight up from the ground at ${v} feet per second. Its height in feet after $t$ seconds is $h(t) = -16t^2 + ${v}t$. Graph its height from the kick until it lands.`;
    xA = axis(['0.25', '0.5', '1', '2'], Q(2 * k), [Q(k), Q(2 * k)], 'Time (seconds)', QTY.kickTime);
    yA = axis(['2', '4', '5', '8', '10', '16', '20', '25', '40', '50', '100'], Q(top), [Q(top)], 'Height (feet)', QTY.height);
    vertex = [Q(k), Q(top)];
    landing = Q(2 * k);
    vertexHint = `The ball is at height 0 when $-16t^2 + ${v}t = 0$, that is $-16t(t - ${2 * k}) = 0$. The highest point is halfway between those two times.`;
  } else {
    const s = rng.pick([5, 10, 15, 20]);
    const P = 4 * s;
    target = { type: 'parabola', a: '-1', h: String(s), k: String(s * s) };
    rule = `A = x(${2 * s} - x)`;
    form = `x(${2 * s} - x)`;
    story = `You have ${P} feet of fencing to make a rectangular pen. If one side is $x$ feet long, the side next to it is $${2 * s} - x$ feet, so the area is $A(x) = x(${2 * s} - x)$ square feet. Graph the area for every side length from 0 to ${2 * s} feet.`;
    xA = axis(['1', '2', '5', '10'], Q(2 * s), [Q(s), Q(2 * s)], 'Side length (feet)', QTY.side);
    yA = axis(['1', '2', '5', '10', '25', '50', '100'], Q(s * s), [Q(s * s)], 'Area (square feet)', QTY.area);
    vertex = [Q(s), Q(s * s)];
    landing = Q(2 * s);
    vertexHint = `The area is 0 when $x = 0$ and when $x = ${2 * s}$. The greatest area is halfway between those side lengths.`;
  }
  const spec = graphSpec(target, rule, xA, yA, 3);
  const h2 = landing; // a peak placed at the second zero
  const mis = drawableGraphMisconceptions<Misconception>(spec, [
    { answer: JSON.stringify({ target: { h: numStr(h2) } }), tag: 'vertex-sign', feedback: 'Your highest point is where the graph should be back at 0. The vertex is halfway between the two zeros.' },
    swapLabels(ball ? 'Your labels are swapped: time is the input, so it goes across the bottom; height goes up the side.' : 'Your labels are swapped: the side length is the input, so it goes across the bottom; the area goes up the side.'),
  ]);
  const hints: H4 = [
    `Find the key points first: where the output is 0, and the vertex. ${vertexHint}`,
    `Label the axes (${xA.label.toLowerCase()} across, ${yA.label.toLowerCase()} up) and choose scales so the zeros and the vertex fit in ${GRID} squares and land on grid lines.`,
    'Plot the vertex: its input is halfway between the zeros, and its output is the function evaluated there.',
    'Plot at least one more point on each side of the vertex, such as the two zeros. A parabola is symmetric, so a point on one side has a partner at the same height on the other side.',
  ];
  const [vx, vy] = vertex;
  const stepsList: ProblemStep[] = [
    {
      prompt: [p(`Find the vertex of the graph: the ${ball ? 'time and height of the highest point' : 'side length and the greatest area'}. Type it as an ordered pair.`)],
      answer: { kind: 'point', x: numStr(vx), y: numStr(vy) },
      inputHint: 'Type an ordered pair like (3, 40).',
      hints: [vertexHint, 'Find the input halfway between the two zeros.', `Evaluate $${form}$ at that input.`, 'Write the input first and the output second.'],
      misconceptions: [{ answer: `(${numStr(landing)}, 0)`, tag: 'vertex-sign', feedback: 'That is where the output is back at 0. The vertex is halfway between the zeros.' }],
      explanation: `The vertex is $(${numStr(vx)}, ${numStr(vy)})$, halfway between the zeros $0$ and $${numStr(landing)}$.`,
    },
    graphStep(spec, 'Now graph it: label both axes, choose a scale for each, and place the vertex and at least one point on each side of it.', [hints[1], 'The graph runs from input 0 to the second zero; its tallest point is the vertex.', hints[2], hints[3]], `The parabola rises from $(0, 0)$ to the vertex $(${numStr(vx)}, ${numStr(vy)})$ and falls back to $(${numStr(landing)}, 0)$.`, mis),
  ];
  return makeProblem({
    skillId: 'S4.20',
    tags: ['real-world', 'graph', 'application'],
    prompt: [p(story)],
    answer: spec,
    inputHint: INPUT_HINT,
    hints,
    solution: steps(
      { text: 'Find the zeros.', tex: `${form} = 0 \\Rightarrow ${ball ? 't' : 'x'} = 0 \\text{ or } ${numStr(landing)}`, why: 'A product is 0 when one factor is 0.' },
      { text: 'Find the vertex halfway between the zeros.', tex: `(${numStr(vx)},\\ ${numStr(vy)})`, why: 'A parabola is symmetric about the vertical line through its vertex.' },
      { text: `Label the axes "${xA.label}" and "${yA.label}", with ${acceptedScales(spec.x, GRID).join(' or ')} per square across and ${acceptedScales(spec.y, GRID).join(' or ')} per square up.`, why: 'These fit the zeros and the vertex on the grid, on grid lines.' },
      { text: `Plot $(0, 0)$, $(${numStr(vx)}, ${numStr(vy)})$ and $(${numStr(landing)}, 0)$ and draw the parabola through them.`, why: 'The vertex and a point on each side show the shape.' },
    ),
    misconceptions: mis,
    steps: stepsList,
  });
}

function verifyQuadratic(pr: Problem): string[] {
  const s = text(pr);
  const ball = /h\(t\) = -16t\^2 \+ (\d+)t/.exec(s);
  const pen = /A\(x\) = x\((\d+) - x\)/.exec(s);
  let want: GraphTarget;
  if (ball) {
    // -16t² + vt = -16(t - v/32)² + v²/64
    const v = Q(ball[1]);
    want = { type: 'parabola', a: '-16', h: numStr(v.div(32)), k: numStr(v.mul(v).div(64)) };
  } else if (pen) {
    // x(L - x) = -(x - L/2)² + L²/4
    const L = Q(pen[1]);
    want = { type: 'parabola', a: '-1', h: numStr(L.div(2)), k: numStr(L.mul(L).div(4)) };
  } else return ['cannot read the situation'];
  const errs = graphChecks(pr, want);
  const st = pr.steps?.[0]?.answer;
  const vx = st?.kind === 'point' ? exactValue(st.x) : null;
  const vy = st?.kind === 'point' ? exactValue(st.y) : null;
  if (!vx || !vy || !vx.rationalPart().eq(Q(want.h)) || !vy.rationalPart().eq(Q(want.k))) errs.push('step 1 vertex does not match the situation');
  return errs;
}

// ---------------------------------------------------------------------------
// Exponential from a situation (S5.03)
// ---------------------------------------------------------------------------

const EXP_X = ['0.5', '1', '2'];
/** a few hours across, many units up: a narrower grid */
const EXP_COLS = 6;
const EXP_Y = ['1', '2', '5', '10', '20', '25', '50', '100', '200', '250', '500', '1000'];

function exponentialProblem(rng: Rng, d: Difficulty): Problem {
  const kind = d === 1 ? 'double' : d === 2 ? rng.pick(['double', 'half'] as const) : rng.pick(['triple', 'half'] as const);
  let a: number, b: Rational, n: number, story: string, yl: [string, Quantity], bText: string, change: string;
  if (kind === 'double') {
    a = rng.pick([5, 10, 20, 25, 50]);
    n = rng.pick([3, 4]);
    b = Q(2);
    bText = '2';
    change = 'doubles every hour';
    story = `A colony starts with ${a} bacteria and doubles every hour. Let $x$ be the time in hours and $y$ the number of bacteria. Write $y = a(b)^x$ and graph it for the first ${n} hours.`;
    yl = ['Number of bacteria', QTY.bacteria];
  } else if (kind === 'triple') {
    a = rng.pick([5, 10, 20]);
    n = 2;
    b = Q(3);
    bText = '3';
    change = 'triples every hour';
    story = `A colony starts with ${a} bacteria and triples every hour. Let $x$ be the time in hours and $y$ the number of bacteria. Write $y = a(b)^x$ and graph it for the first ${n} hours.`;
    yl = ['Number of bacteria', QTY.bacteria];
  } else {
    n = rng.pick([3, 4]);
    a = rng.pick([5, 10, 25]) * 2 ** n;
    b = Q(1, 2);
    bText = '0.5';
    change = 'is cut in half every hour';
    story = `A patient takes ${/^(8|11|18)/.test(String(a)) ? 'an' : 'a'} ${a} mg dose of a medicine. The amount in the body is cut in half every hour. Let $x$ be the time in hours and $y$ the milligrams left. Write $y = a(b)^x$ and graph it for the first ${n} hours.`;
    yl = ['Medicine left (mg)', QTY.medicine];
  }
  const A = Q(a);
  const yNeed = kind === 'half' ? A : A.mul(b.pow(n));
  const rule = `y = ${a}(${bText})^x`;
  const spec = graphSpec({ type: 'exponential', a: String(a), b: numStr(b) }, rule, axis(EXP_X, Q(n), [Q(1)], 'Time (hours)', QTY.growHours), axis(EXP_Y, yNeed, [A], yl[0], yl[1]), 3, EXP_COLS);
  const lin = kind === 'half' ? A.div(2).neg() : A.mul(b.sub(1));
  const mis = drawableGraphMisconceptions<Misconception>(spec, [
    { answer: JSON.stringify({ target: { type: 'line', m: numStr(lin), b: String(a) } }), tag: 'growth-decay', feedback: `Your points change by the same amount each hour, which makes a line. Here the amount ${change}: it is multiplied by the same factor each hour.` },
    swapLabels('Your labels are swapped: time is the input, so it goes across the bottom.'),
  ]);
  const hints: H4 = [
    `Write the rule $y = a(b)^x$: $a$ is the amount at the start, and $b$ is the number the amount is multiplied by each hour. Here the amount ${change}.`,
    `Label the axes (time across, ${yl[0].toLowerCase()} up). Find the largest amount you need to show in the first ${n} hours and choose scales that fit it on the grid (${EXP_COLS} squares across, ${GRID} up), with the starting amount on a grid line.`,
    'Plot the starting point first: at 0 hours the amount is $a$.',
    'Multiply by $b$ to get the amount one hour later, and again for the next hour. Plot at least three points that land on grid intersections.',
  ];
  const table = Array.from({ length: n + 1 }, (_, x) => `(${x}, ${numStr(A.mul(b.pow(x)))})`).join(', ');
  return makeProblem({
    skillId: 'S5.03',
    tags: ['real-world', 'graph', 'application'],
    prompt: [p(story)],
    answer: spec,
    inputHint: INPUT_HINT,
    hints,
    solution: steps(
      { text: 'Write the rule.', tex: `y = ${a}(${bText})^{x}`, why: `The start is ${a} and the amount ${change}, so the factor is ${bText}.` },
      { text: `Make a table: ${table}.`, why: `Each output is the one before it times ${bText}.` },
      { text: `Label the axes "Time (hours)" and "${yl[0]}", with ${acceptedScales(spec.x, EXP_COLS).join(' or ')} per square across and ${acceptedScales(spec.y, GRID).join(' or ')} per square up.`, why: `These scales fit amounts up to ${numStr(yNeed)} and put the plotted points on grid lines.` },
      { text: 'Plot the points and draw a smooth curve through them.', why: 'An exponential graph curves: equal steps in $x$ multiply $y$ by the same factor.' },
    ),
    misconceptions: mis,
    steps: [
      {
        prompt: [p('Write the equation $y = a(b)^x$.')],
        answer: { kind: 'equation', value: rule, form: 'exponential' },
        inputHint: 'Type an equation like y = 50(2)^x.',
        hints: ['Use the form $y = a(b)^{x}$.', '$a$ is the amount at the start (0 hours).', `$b$ is what the amount is multiplied by each hour: it ${change}.`, 'Put the factor $b$ in parentheses as the base and keep $x$ as the exponent.'],
        misconceptions: [{ answer: `y = ${numStr(b)}(${a})^x`, tag: 'growth-decay', feedback: 'The starting amount goes in front; the factor is the base that is raised to the power $x$.' }],
        explanation: `$y = ${a}(${bText})^{x}$: start at ${a} and multiply by ${bText} each hour.`,
      },
      graphStep(spec, 'Now graph it: label both axes, choose a scale for each, and place at least three points on the curve, including the starting point.', [hints[1], 'The largest amount on the graph is at the start for decay and at the end for growth.', hints[2], hints[3]], `Points such as ${table} lie on the curve.`, mis),
    ],
  });
}

function verifyExponential(pr: Problem): string[] {
  const s = text(pr);
  const grow = /starts with (\d+) bacteria and (doubles|triples) every hour/.exec(s);
  const dose = /takes an? (\d+) mg dose .* cut in half every hour/.exec(s);
  let want: GraphTarget;
  if (grow) want = { type: 'exponential', a: grow[1], b: grow[2] === 'doubles' ? '2' : '3' };
  else if (dose) want = { type: 'exponential', a: dose[1], b: '0.5' };
  else return ['cannot read the situation'];
  const errs = graphChecks(pr, want);
  const st = pr.steps?.[0]?.answer;
  if (st?.kind !== 'equation') errs.push('step 1 is not the equation');
  else {
    // the equation built from the numbers read off the prompt must be accepted against the step's key
    if (checkAnswer(st, `y = ${want.a}(${want.b})^x`).status !== 'correct') errs.push('step 1 equation does not match the situation');
  }
  return errs;
}

export const GRAPH_LINEAR_CONTEXT: GeneratorDef = { id: 'u1.graph-linear-context', skillId: 'S1.15', description: 'Graph a linear function from a situation, with axis labels and scales', generate: (rng, d) => retry(() => linearProblem(rng, d)), verify: verifyLinear };
export const GRAPH_INEQUALITY_CONTEXT: GeneratorDef = { id: 'u2.graph-ineq-context', skillId: 'S2.03', description: 'Graph a linear inequality from a situation, with axis labels, scales, boundary and shading', generate: (rng, d) => retry(() => inequalityProblem(rng, d)), verify: verifyInequality };
export const GRAPH_QUADRATIC_CONTEXT: GeneratorDef = { id: 'u4.graph-quadratic-context', skillId: 'S4.20', description: 'Graph a quadratic function from a situation, with axis labels and scales', generate: (rng, d) => retry(() => quadraticProblem(rng, d)), verify: verifyQuadratic };
export const GRAPH_EXPONENTIAL_CONTEXT: GeneratorDef = { id: 'u5.graph-exponential-context', skillId: 'S5.03', description: 'Graph an exponential function from a situation, with axis labels and scales', generate: (rng, d) => retry(() => exponentialProblem(rng, d)), verify: verifyExponential };

export const GRAPH_CONTEXT_GENERATORS: GeneratorDef[] = [GRAPH_LINEAR_CONTEXT, GRAPH_INEQUALITY_CONTEXT, GRAPH_QUADRATIC_CONTEXT, GRAPH_EXPONENTIAL_CONTEXT];
