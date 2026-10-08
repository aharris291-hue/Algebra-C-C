/**
 * Unit 8 generators: distance (S8.01), midpoint (S8.02), parallel and perpendicular lines (S8.03),
 * perimeter and area (S8.04), classifying figures (S8.05) and coordinate geometry in context (S8.06).
 *
 * Every point a student needs is written in the prompt as a labeled point like $A(3, -2)$ (and drawn
 * on a graph where it helps). verify() re-reads those points and re-derives each answer by a
 * different route: squared distances compared exactly, areas by the shoelace formula, figure types
 * from cross and dot products of side vectors, and lines from their parsed equations.
 */
import type { GeneratorDef, Rng, Block, GraphSpec, Problem } from '../../core/curriculum/types';
import type { Misconception } from '../../core/math/answers';
import { parseRelation } from '../../core/math/answers';
import { Rational } from '../../core/math/rational';
import { linearTex, linearPlain } from '../../core/math/format';
import { toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { evalNumeric } from '../../core/math/evaluate';
import { p, makeProblem, makeChoice, choiceLabel, numStr, Q, numberMisconceptions, stringMisconceptions, texToExpr, money } from './util';
import { splitPower, radPlain, radTex, plainSurd } from './u3-common';

interface Pt { x: number; y: number; label: string }
const pt = (label: string, x: number, y: number): Pt => ({ label, x, y });
const ptTex = (a: Pt) => `${a.label}(${a.x}, ${a.y})`;
const d2 = (a: { x: number; y: number }, b: { x: number; y: number }) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
const neg = (n: number) => (n < 0 ? `(${n})` : `${n}`);
const halfStr = (n: number) => numStr(Q(n, 2));
/** sqrt(n) in simplest radical form, as answer text and TeX */
function root(n: number): { plain: string; tex: string; out: number; inside: number } {
  const { out, inside } = splitPower(n, 2);
  return { plain: radPlain(out, inside), tex: radTex(out, inside), out, inside };
}
const TRIPLES: Array<[number, number, number]> = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
  [8, 15, 17],
  [9, 12, 15],
  [12, 9, 15],
];

function graphOf(points: Pt[], segments: Array<[Pt, Pt]> = [], dashed = false): GraphSpec {
  const xs = points.map((q) => q.x);
  const ys = points.map((q) => q.y);
  let xMin = Math.min(-1, Math.min(...xs) - 2);
  let xMax = Math.max(1, Math.max(...xs) + 2);
  let yMin = Math.min(-1, Math.min(...ys) - 2);
  let yMax = Math.max(1, Math.max(...ys) + 2);
  // The graph's plot area is about 1.27 times as wide as it is tall. Widen the shorter direction so one x-unit and
  // one y-unit look the same length on screen; otherwise right angles and squares would look skewed.
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
    points: points.map((q) => ({ x: q.x, y: q.y, label: q.label })),
    segments: segments.map(([a, b]) => ({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, ...(dashed ? { dashed: true } : {}) })),
    ariaLabel: `Coordinate grid with ${points.map((q) => `${q.label} at (${q.x}, ${q.y})`).join(', ')}${segments.length ? `, and segments ${segments.map(([a, b]) => a.label + b.label).join(', ')}` : ''}.`,
  };
}
const polygonSegments = (ps: Pt[]): Array<[Pt, Pt]> => ps.map((a, i) => [a, ps[(i + 1) % ps.length]]);
const fitsGrid = (ps: Array<{ x: number; y: number }>, lim = 10) => ps.every((q) => Math.abs(q.x) <= lim && Math.abs(q.y) <= lim);

// ---------- independent routines used by verify() ----------
const textAll = (pr: Pick<Problem, 'prompt'>) => pr.prompt.map((b) => (b.t === 'p' ? b.text : b.t === 'math' ? b.tex : '')).join(' ');
function readPts(pr: Pick<Problem, 'prompt'>): Map<string, { x: number; y: number }> {
  const out = new Map<string, { x: number; y: number }>();
  for (const m of textAll(pr).matchAll(/\b([A-Z])\((-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\)/g)) out.set(m[1], { x: Number(m[2]), y: Number(m[3]) });
  return out;
}
const labelOf = (pr: Problem) => (pr.answer.kind === 'choice' ? choiceLabel(pr.answer) : '');
const numVal = (s: string) => evalNumeric(parseExpression(s));
/** Twice the signed area (shoelace). */
function shoelace2(ps: Array<{ x: number; y: number }>): number {
  let s = 0;
  ps.forEach((a, i) => {
    const b = ps[(i + 1) % ps.length];
    s += a.x * b.y - b.x * a.y;
  });
  return s;
}
const vec = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: b.x - a.x, y: b.y - a.y });
const cross = (u: { x: number; y: number }, v: { x: number; y: number }) => u.x * v.y - u.y * v.x;
const dot = (u: { x: number; y: number }, v: { x: number; y: number }) => u.x * v.x + u.y * v.y;
type Quad = 'Square' | 'Rectangle' | 'Rhombus' | 'Parallelogram' | 'Trapezoid' | 'None';
function vClassify(ps: Array<{ x: number; y: number }>): Quad {
  const [A, B, C, D] = ps;
  const ab = vec(A, B);
  const bc = vec(B, C);
  const dc = vec(D, C);
  const ad = vec(A, D);
  const par1 = cross(ab, dc) === 0;
  const par2 = cross(ad, bc) === 0;
  if (par1 && par2) {
    const right = dot(ab, ad) === 0;
    const equal = d2(A, B) === d2(A, D);
    return right && equal ? 'Square' : right ? 'Rectangle' : equal ? 'Rhombus' : 'Parallelogram';
  }
  return par1 !== par2 ? 'Trapezoid' : 'None';
}

// ---------------------------------------------------------------------------
// S8.01: distance
// ---------------------------------------------------------------------------

export const genDistance: GeneratorDef = {
  id: 'u8.distance',
  skillId: 'S8.01',
  description: 'Find the distance between two points: horizontal and vertical distances, exact distances in simplest radical form, rounded distances, and missing coordinates.',
  generate(rng, difficulty) {
    const A = pt('A', rng.int(-8, 4), rng.int(-8, 4));
    if (difficulty === 1) {
      if (rng.bool()) {
        const horiz = rng.bool();
        const len = rng.int(3, 12);
        const B = horiz ? pt('B', A.x + len, A.y) : pt('B', A.x, A.y + len);
        if (!fitsGrid([B])) return genDistance.generate(rng, 1);
        const [a, b] = horiz ? [A.x, B.x] : [A.y, B.y];
        return makeProblem({
          skillId: 'S8.01',
          tags: ['graph'],
          prompt: [p(`Find the distance between $${ptTex(A)}$ and $${ptTex(B)}$.`), { t: 'graph', spec: graphOf([A, B], [[A, B]]) }],
          answer: { kind: 'number', value: String(len) },
          hints: [`The segment is ${horiz ? 'horizontal' : 'vertical'}.`, `Only the ${horiz ? 'x' : 'y'}-coordinates change.`, 'Subtract the coordinates and take the absolute value.', 'You can also count the grid squares.'],
          solution: [
            { text: `The ${horiz ? 'y' : 'x'}-coordinates are the same, so the segment is ${horiz ? 'horizontal' : 'vertical'}.` },
            { text: 'Subtract the other coordinates.', tex: `|${b} - ${neg(a)}| = ${len}`, why: 'Distance is never negative, so take the absolute value.' },
          ],
          misconceptions: numberMisconceptions(Q(len), [{ value: Q(Math.abs(a + b)), tag: 'sign-error', feedback: 'Subtract the coordinates; do not add them.' }]),
        });
      }
      const [dx, dy, c] = rng.pick(TRIPLES);
      const B = pt('B', A.x + dx * rng.pick([1, -1]), A.y + dy * rng.pick([1, -1]));
      if (!fitsGrid([B], 12)) return genDistance.generate(rng, 1);
      return makeProblem({
        skillId: 'S8.01',
        tags: ['graph'],
        prompt: [p(`Find the distance between $${ptTex(A)}$ and $${ptTex(B)}$.`), { t: 'graph', spec: graphOf([A, B], [[A, B]]) }],
        answer: { kind: 'number', value: String(c) },
        hints: ['Use $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.', 'Find the change in x and the change in y.', 'Square each change and add.', 'Take the square root of the sum.'],
        solution: [
          { text: 'Find the changes in x and y.', tex: `\\Delta x = ${B.x} - ${neg(A.x)} = ${B.x - A.x},\\quad \\Delta y = ${B.y} - ${neg(A.y)} = ${B.y - A.y}`, why: 'They are the legs of a right triangle with the segment as its hypotenuse.' },
          { text: 'Use the distance formula.', tex: `d = \\sqrt{${neg(B.x - A.x)}^2 + ${neg(B.y - A.y)}^2} = \\sqrt{${dx * dx} + ${dy * dy}} = \\sqrt{${c * c}} = ${c}`, why: 'The distance formula is the Pythagorean theorem on the coordinate grid.' },
        ],
        misconceptions: numberMisconceptions(Q(c), [
          { value: Q(dx + dy), tag: 'formula-error', feedback: 'Do not add the legs. Square them, add, then take the square root.' },
          { value: Q(c * c), tag: 'formula-error', feedback: 'You found the sum of the squares. Take its square root.' },
        ]),
      });
    }
    if (difficulty === 2) {
      const dx = rng.nonzeroInt(-9, 9);
      const dy = rng.nonzeroInt(-9, 9);
      const n = dx * dx + dy * dy;
      const r = root(n);
      if (r.inside === 1 || (r.out === 1 && rng.int(0, 3) > 0)) return genDistance.generate(rng, 2);
      const B = pt('B', A.x + dx, A.y + dy);
      if (!fitsGrid([B], 12)) return genDistance.generate(rng, 2);
      return makeProblem({
        skillId: 'S8.01',
        tags: [],
        prompt: [p(`Find the exact distance between $${ptTex(A)}$ and $${ptTex(B)}$. Write it in simplest radical form.`)],
        answer: { kind: 'expression', value: r.plain, form: 'simplified-radical' },
        inputHint: 'Type sqrt( ) for a square root, like 3sqrt(5).',
        hints: ['Use $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.', 'Find the change in x and the change in y, then square each one.', 'Add the squares; the distance is the square root of the sum.', 'Look for a perfect-square factor inside the root.'],
        solution: [
          { text: 'Substitute into the distance formula.', tex: `d = \\sqrt{(${B.x} - ${neg(A.x)})^2 + (${B.y} - ${neg(A.y)})^2} = \\sqrt{${neg(dx)}^2 + ${neg(dy)}^2}`, why: 'Subtract in the same order for x and y.' },
          { text: 'Square and add.', tex: `\\sqrt{${dx * dx} + ${dy * dy}} = \\sqrt{${n}}`, why: 'A negative change gives a positive square.' },
          ...(r.out > 1 ? [{ text: 'Simplify the radical.', tex: `\\sqrt{${n}} = \\sqrt{${r.out * r.out} \\cdot ${r.inside}} = ${r.tex}`, why: `$${r.out * r.out}$ is the largest perfect square factor of $${n}$.` }] : []),
        ],
        misconceptions: stringMisconceptions(r.plain, [
          { answer: String(n), tag: 'formula-error', feedback: 'That is the sum of the squares. Take its square root.' },
          { answer: radPlain(1, Math.abs(dx) + Math.abs(dy)) === String(Math.abs(dx) + Math.abs(dy)) ? String(Math.abs(dx) + Math.abs(dy)) : `sqrt(${Math.abs(dx) + Math.abs(dy)})`, tag: 'formula-error', feedback: 'Square each change before adding.' },
          ...(dx + dy !== 0 ? [{ answer: `sqrt(${(dx + dy) ** 2})`, tag: 'formula-error' as const, feedback: 'Square the change in x and the change in y separately, then add.' }] : []),
        ] as Misconception[]),
      });
    }
    const kind = rng.pick(['round', 'closer', 'missing'] as const);
    if (kind === 'round') {
      const dx = rng.nonzeroInt(-9, 9);
      const dy = rng.nonzeroInt(-9, 9);
      const n = dx * dx + dy * dy;
      if (Number.isInteger(Math.sqrt(n))) return genDistance.generate(rng, 3);
      const B = pt('B', A.x + dx, A.y + dy);
      if (!fitsGrid([B], 12)) return genDistance.generate(rng, 3);
      const v = Math.sqrt(n);
      return makeProblem({
        skillId: 'S8.01',
        tags: [],
        prompt: [p(`Find the distance between $${ptTex(A)}$ and $${ptTex(B)}$. Round to the nearest tenth.`)],
        answer: { kind: 'number', value: v.toFixed(12), roundTo: 1 },
        hints: ['Use $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.', 'Find the changes in x and y and square them.', 'Add, then take the square root with a calculator.', 'Round only at the end.'],
        solution: [
          { text: 'Substitute and simplify.', tex: `d = \\sqrt{${neg(dx)}^2 + ${neg(dy)}^2} = \\sqrt{${n}}` },
          { text: 'Use a calculator and round.', tex: `\\sqrt{${n}} \\approx ${v.toFixed(3)} \\approx ${v.toFixed(1)}`, why: 'Rounding to the nearest tenth keeps one decimal place.' },
        ],
        misconceptions: numberMisconceptions(Rational.parse(v.toFixed(1)), [{ value: Q(Math.abs(dx) + Math.abs(dy)), tag: 'formula-error', feedback: 'That adds the changes. Square them, add, then take the square root.' }]),
      });
    }
    if (kind === 'closer') {
      const B = pt('B', A.x + rng.nonzeroInt(-7, 7), A.y + rng.nonzeroInt(-7, 7));
      const C = pt('C', A.x + rng.nonzeroInt(-7, 7), A.y + rng.nonzeroInt(-7, 7));
      const db = d2(A, B);
      const dc = d2(A, C);
      if (db === dc || !fitsGrid([B, C], 12) || Math.abs(db - dc) < 3 || (B.x === C.x && B.y === C.y)) return genDistance.generate(rng, 3);
      // the closer point should not be obvious from one coordinate alone
      const sumB = Math.abs(B.x - A.x) + Math.abs(B.y - A.y);
      const sumC = Math.abs(C.x - A.x) + Math.abs(C.y - A.y);
      // the 'smaller total change' shortcut is offered only when it names the wrong point
      const shortcut = (sumB < sumC) !== (db < dc) && sumB !== sumC ? [`${sumB < sumC ? 'B' : 'C'}, because its coordinates change by less in total`] : [];
      const correct = `${db < dc ? 'B' : 'C'}, because its distance from A is $${db < dc ? root(db).tex : root(dc).tex}$ and the other distance is $${db < dc ? root(dc).tex : root(db).tex}$`;
      return makeProblem({
        skillId: 'S8.01',
        tags: [],
        prompt: [p(`Which point is closer to $${ptTex(A)}$: $${ptTex(B)}$ or $${ptTex(C)}$? Choose the answer with the correct reason.`)],
        answer: makeChoice(rng, correct, [`${db < dc ? 'C' : 'B'}, because its distance from A is $${db < dc ? root(db).tex : root(dc).tex}$ and the other distance is $${db < dc ? root(dc).tex : root(db).tex}$`, 'They are the same distance from A', ...shortcut].filter((o) => o !== correct)),
        hints: ['Find the distance from A to each point.', 'You can compare the squared distances; the smaller one is closer.', `For B: square the changes in x and y and add.`, 'Do the same for C, then compare.'],
        solution: [
          { text: 'Squared distance from A to B.', tex: `${neg(B.x - A.x)}^2 + ${neg(B.y - A.y)}^2 = ${db}` },
          { text: 'Squared distance from A to C.', tex: `${neg(C.x - A.x)}^2 + ${neg(C.y - A.y)}^2 = ${dc}` },
          { text: `${db < dc ? 'B' : 'C'} is closer.`, tex: `${root(Math.min(db, dc)).tex} < ${root(Math.max(db, dc)).tex}`, why: 'A smaller square means a smaller distance, since distances are positive.' },
        ],
        misconceptions: [],
      });
    }
    const [a, b, c] = rng.pick(TRIPLES);
    const y0 = A.y + a * rng.pick([1, -1]);
    if (!fitsGrid([{ x: A.x + b, y: y0 }, { x: A.x - b, y: y0 }], 16)) return genDistance.generate(rng, 3);
    const xs = [A.x - b, A.x + b];
    return makeProblem({
      skillId: 'S8.01',
      tags: ['multi-step'],
      prompt: [p(`The point $(x, ${y0})$ is $${c}$ units from $${ptTex(A)}$. Find every possible value of $x$.`)],
      answer: { kind: 'solutions', values: xs.map(String), variable: 'x' },
      inputHint: 'Type all values separated by commas.',
      hints: ['Write the distance formula with the unknown x.', `Set it equal to $${c}$ and square both sides.`, `The change in y is known: $${y0} - ${neg(A.y)}$.`, 'Solve for the change in x; it can be positive or negative.'],
      solution: [
        { text: 'Set up the distance formula.', tex: `\\sqrt{(x - ${neg(A.x)})^2 + (${y0} - ${neg(A.y)})^2} = ${c}`, why: 'The two points must be exactly this far apart.' },
        { text: 'Square both sides.', tex: `(x - ${neg(A.x)})^2 + ${a * a} = ${c * c}\\ \\Rightarrow\\ (x - ${neg(A.x)})^2 = ${c * c - a * a}` },
        { text: 'Take the square root of both sides.', tex: `x - ${neg(A.x)} = \\pm ${b}\\ \\Rightarrow\\ x = ${xs[0]} \\text{ or } x = ${xs[1]}`, why: 'Both a positive and a negative change in x work: one point is to the left of A and one to the right.' },
      ],
      misconceptions: [{ answer: String(xs[0]), tag: 'missing-solution' as const, feedback: 'There is a second point on the other side. Remember the ± when you take the square root.' }, { answer: String(xs[1]), tag: 'missing-solution', feedback: 'There is a second point on the other side. Remember the ± when you take the square root.' }],
    });
  },
  verify(pr) {
    const ps = readPts(pr);
    const A = ps.get('A');
    if (!A) return ['no A'];
    const text = textAll(pr);
    const mm = /The point \$\(x, (-?\d+)\)\$ is \$(\d+)\$ units/.exec(text);
    if (mm) {
      if (pr.answer.kind !== 'solutions') return ['kind'];
      const y0 = Number(mm[1]);
      const c = Number(mm[2]);
      const vals = pr.answer.values.map(Number);
      const ok = vals.length === 2 && vals[0] !== vals[1] && vals.every((x) => d2(A, { x, y: y0 }) === c * c);
      return ok ? [] : ['missing coordinate wrong'];
    }
    const B = ps.get('B');
    if (!B) return ['no B'];
    const C = ps.get('C');
    if (C) {
      const want = d2(A, B) < d2(A, C) ? 'B' : 'C';
      return labelOf(pr).startsWith(`${want}, because its distance from A is`) && d2(A, B) !== d2(A, C) ? [] : ['closer wrong'];
    }
    const n = d2(A, B);
    if (pr.answer.kind === 'number') {
      if (pr.answer.roundTo !== undefined) return Math.abs(Number(pr.answer.value) - Math.sqrt(n)) < 1e-9 ? [] : ['rounded distance wrong'];
      const v = Rational.parse(pr.answer.value);
      return v.mul(v).eq(n) && !v.isNegative() ? [] : ['distance wrong'];
    }
    if (pr.answer.kind === 'expression') {
      const s = plainSurd(pr.answer.value);
      return s && Math.abs(numVal(pr.answer.value) ** 2 - n) < 1e-9 && numVal(pr.answer.value) > 0 ? [] : ['exact distance wrong'];
    }
    return ['unexpected answer'];
  },
};

// ---------------------------------------------------------------------------
// S8.02: midpoint
// ---------------------------------------------------------------------------

export const genMidpoint: GeneratorDef = {
  id: 'u8.midpoint',
  skillId: 'S8.02',
  description: 'Find midpoints (whole-number and half-unit coordinates), missing endpoints, and centers of circles from a diameter.',
  generate(rng, difficulty) {
    const A = pt('A', rng.int(-9, 9), rng.int(-9, 9));
    if (difficulty <= 2) {
      const B = pt('B', rng.int(-9, 9), rng.int(-9, 9));
      const evenX = (A.x + B.x) % 2 === 0;
      const evenY = (A.y + B.y) % 2 === 0;
      if ((difficulty === 1) !== (evenX && evenY) || (A.x === B.x && A.y === B.y) || A.x === B.x || A.y === B.y) return genMidpoint.generate(rng, difficulty);
      const mx = (A.x + B.x) / 2;
      const my = (A.y + B.y) / 2;
      const showGraph = difficulty === 2 && rng.bool();
      return makeProblem({
        skillId: 'S8.02',
        tags: showGraph ? ['graph'] : [],
        prompt: [p(`Find the midpoint of the segment with endpoints $${ptTex(A)}$ and $${ptTex(B)}$.`), ...(showGraph ? [{ t: 'graph', spec: graphOf([A, B], [[A, B]]) } as Block] : [])],
        answer: { kind: 'point', x: numStr(Q(A.x + B.x, 2)), y: numStr(Q(A.y + B.y, 2)) },
        inputHint: 'Type a point like (2, -3.5).',
        hints: ['The midpoint is the average of the endpoints.', 'Add the x-coordinates and divide by 2.', 'Add the y-coordinates and divide by 2.', difficulty === 2 ? 'A coordinate can end in .5.' : 'Write the answer as an ordered pair.'],
        solution: [
          { text: 'Average the x-coordinates.', tex: `\\frac{${A.x} + ${neg(B.x)}}{2} = \\frac{${A.x + B.x}}{2} = ${halfStr(A.x + B.x)}`, why: 'Halfway between two numbers is their average.' },
          { text: 'Average the y-coordinates.', tex: `\\frac{${A.y} + ${neg(B.y)}}{2} = \\frac{${A.y + B.y}}{2} = ${halfStr(A.y + B.y)}` },
          { text: 'Write the midpoint.', tex: `M(${numStr(Q(mx))}, ${numStr(Q(my))})` },
        ],
        misconceptions: [
          { answer: `(${halfStr(B.x - A.x)}, ${halfStr(B.y - A.y)})`, tag: 'formula-error', feedback: 'Add the coordinates before dividing by 2; do not subtract them.' },
          { answer: `(${A.x + B.x}, ${A.y + B.y})`, tag: 'formula-error', feedback: 'Divide each sum by 2.' },
        ].filter((m) => m.answer !== `(${halfStr(A.x + B.x)}, ${halfStr(A.y + B.y)})`) as Misconception[],
      });
    }
    if (rng.bool()) {
      const M = pt('M', rng.int(-6, 6), rng.int(-6, 6));
      if (A.x === M.x || A.y === M.y) return genMidpoint.generate(rng, 3);
      const B = { x: 2 * M.x - A.x, y: 2 * M.y - A.y };
      if (!fitsGrid([B], 20)) return genMidpoint.generate(rng, 3);
      return makeProblem({
        skillId: 'S8.02',
        tags: ['multi-step'],
        prompt: [p(`$${ptTex(M)}$ is the midpoint of $\\overline{AB}$. One endpoint is $${ptTex(A)}$. Find the other endpoint, $B$.`)],
        answer: { kind: 'point', x: String(B.x), y: String(B.y) },
        inputHint: 'Type a point like (4, -1).',
        hints: ['M is halfway from A to B.', 'Find the step from A to M in x and in y.', 'Take the same step again from M.', 'Or solve (x + A’s x)/2 = M’s x for x, and the same for y.'],
        solution: [
          { text: 'Find the step from A to M.', tex: `\\Delta x = ${M.x} - ${neg(A.x)} = ${M.x - A.x},\\quad \\Delta y = ${M.y} - ${neg(A.y)} = ${M.y - A.y}`, why: 'The midpoint is halfway, so B is the same step past M.' },
          { text: 'Take the same step from M.', tex: `B = (${M.x} + ${neg(M.x - A.x)},\\ ${M.y} + ${neg(M.y - A.y)}) = (${B.x}, ${B.y})` },
          { text: 'Check with the midpoint formula.', tex: `\\left(\\frac{${A.x} + ${neg(B.x)}}{2}, \\frac{${A.y} + ${neg(B.y)}}{2}\\right) = (${M.x}, ${M.y})` },
        ],
        misconceptions: [
          { answer: `(${halfStr(A.x + M.x)}, ${halfStr(A.y + M.y)})`, tag: 'formula-error', feedback: 'That is the midpoint of A and M. B is past M, the same distance from M as A is.' },
          { answer: `(${M.x - A.x}, ${M.y - A.y})`, tag: 'formula-error', feedback: 'That is only the step from A to M. Add it to M.' },
        ] as Misconception[],
      });
    }
    const B = pt('B', rng.int(-9, 9), rng.int(-9, 9));
    if ((A.x + B.x) % 2 !== 0 || (A.y + B.y) % 2 !== 0 || A.x === B.x || A.y === B.y) return genMidpoint.generate(rng, 3);
    return makeProblem({
      skillId: 'S8.02',
      tags: ['real-world'],
      prompt: [p(`A circular garden is drawn on a grid. The endpoints of one diameter are $${ptTex(A)}$ and $${ptTex(B)}$. What are the coordinates of the center of the circle?`)],
      answer: { kind: 'point', x: String((A.x + B.x) / 2), y: String((A.y + B.y) / 2) },
      inputHint: 'Type a point like (2, -3).',
      hints: ['A diameter passes through the center of the circle.', 'The center is halfway along the diameter.', 'So the center is the midpoint of the two endpoints.', 'Average the x-coordinates and average the y-coordinates.'],
      solution: [
        { text: 'The center is the midpoint of the diameter.', why: 'The center is the same distance (the radius) from both ends of a diameter.' },
        { text: 'Average the coordinates.', tex: `\\left(\\frac{${A.x} + ${neg(B.x)}}{2}, \\frac{${A.y} + ${neg(B.y)}}{2}\\right) = (${(A.x + B.x) / 2}, ${(A.y + B.y) / 2})` },
      ],
      misconceptions: [{ answer: `(${halfStr(B.x - A.x)}, ${halfStr(B.y - A.y)})`, tag: 'formula-error', feedback: 'Add the coordinates before dividing by 2.' }] as Misconception[],
    });
  },
  verify(pr) {
    const ps = readPts(pr);
    const A = ps.get('A');
    if (!A || pr.answer.kind !== 'point') return ['cannot read'];
    const ans = { x: Number(pr.answer.x), y: Number(pr.answer.y) };
    const M = ps.get('M');
    if (M) return A.x + ans.x === 2 * M.x && A.y + ans.y === 2 * M.y ? [] : ['endpoint wrong'];
    const B = ps.get('B');
    if (!B) return ['no B'];
    // the answer must be the same distance from both endpoints and lie on the segment
    const onSeg = cross(vec(A, B), vec(A, ans)) === 0;
    return onSeg && Math.abs(d2(A, ans) - d2(B, ans)) < 1e-9 ? [] : ['midpoint wrong'];
  },
};

// ---------------------------------------------------------------------------
// S8.03: parallel and perpendicular lines
// ---------------------------------------------------------------------------

const SLOPES = [Q(2), Q(3), Q(-2), Q(-3), Q(1, 2), Q(-1, 2), Q(2, 3), Q(-2, 3), Q(3, 4), Q(-3, 4), Q(4), Q(-1, 3), Q(5, 2), Q(-4, 5)];
const yEq = (m: Rational, b: Rational) => `y = ${linearPlain(m, b)}`;
const yTex = (m: Rational, b: Rational) => `y = ${linearTex(m, b)}`;
/** Ax + By = C with integers, A > 0, for slope m and intercept b. */
function standardTex(m: Rational, b: Rational): string {
  // y = mx + b  ->  -m x + y = b ; clear denominators
  const den = (Number(m.den) * Number(b.den)) / gcd(m.den, b.den);
  let A = m.neg().mul(den).toNumber();
  let B = den;
  let C = b.mul(den).toNumber();
  if (A < 0 || (A === 0 && B < 0)) [A, B, C] = [-A, -B, -C];
  const term = (k: number, v: string, first: boolean) => (k === 0 ? '' : `${first ? (k < 0 ? '-' : '') : k < 0 ? ' - ' : ' + '}${Math.abs(k) === 1 ? '' : Math.abs(k)}${v}`);
  return `${term(A, 'x', true)}${term(B, 'y', A === 0)} = ${C}`;
}
function gcd(a: number | bigint, b: number | bigint): number {
  let x = Math.abs(Number(a));
  let y = Math.abs(Number(b));
  while (y) [x, y] = [y, x % y];
  return x;
}
/** slope and intercept of a printed line (TeX in a math block), or null when vertical */
function lineFromTex(tex: string): { m: Rational; b: Rational } | null {
  const r = parseRelation(texToExpr(tex));
  const poly = toPoly(r.lhs).sub(toPoly(r.rhs));
  const cy = poly.coeff('y', 1);
  if (cy.isZero()) return null;
  return { m: poly.coeff('x', 1).neg().div(cy), b: poly.evaluate({ x: Q(0), y: Q(0) }).neg().div(cy) };
}
const lineBlock = (name: string, tex: string): Block => ({ t: 'math', tex: `\\text{${name}: } ${tex}` });
function readLines(pr: Pick<Problem, 'prompt'>): Array<{ m: Rational; b: Rational } | null> {
  return pr.prompt.filter((b) => b.t === 'math' && /^\\text\{(Line \d|Given line)\: \}/.test(b.tex)).map((b) => lineFromTex((b as { tex: string }).tex.replace(/^\\text\{[^}]*\} /, '')));
}

export const genParallelPerp: GeneratorDef = {
  id: 'u8.parallel-perp',
  skillId: 'S8.03',
  description: 'Use slopes to find parallel and perpendicular slopes, decide whether two lines are parallel, perpendicular or neither, and write equations of parallel and perpendicular lines.',
  generate(rng, difficulty) {
    const m = rng.pick(SLOPES);
    const b = Q(rng.int(-8, 8));
    if (difficulty === 1) {
      if (rng.int(0, 3) === 0) {
        const k = rng.nonzeroInt(-6, 6);
        const horizontal = rng.bool();
        const ask = rng.pick(['parallel', 'perpendicular'] as const);
        const isHoriz = horizontal === (ask === 'parallel');
        const correct = isHoriz ? 'A horizontal line, with slope 0' : 'A vertical line, with undefined slope';
        return makeProblem({
          skillId: 'S8.03',
          tags: [],
          prompt: [p(`A line is ${ask} to the line $${horizontal ? `y = ${k}` : `x = ${k}`}$. What kind of line is it?`)],
          answer: makeChoice(rng, correct, ['A horizontal line, with slope 0', 'A vertical line, with undefined slope', 'A line with slope 1', 'A line with slope −1'].filter((o) => o !== correct)),
          hints: [`$${horizontal ? `y = ${k}` : `x = ${k}`}$ is a ${horizontal ? 'horizontal' : 'vertical'} line.`, 'Parallel lines point the same way.', 'Perpendicular lines meet at a right angle.', 'Horizontal and vertical lines are perpendicular to each other.'],
          solution: [
            { text: `$${horizontal ? `y = ${k}` : `x = ${k}`}$ is ${horizontal ? 'horizontal (slope 0)' : 'vertical (undefined slope)'}.` },
            { text: correct + '.', why: ask === 'parallel' ? 'A parallel line points the same way.' : 'Horizontal and vertical lines meet at right angles.' },
          ],
          misconceptions: [],
        });
      }
      const ask = rng.pick(['parallel', 'perpendicular'] as const);
      const key = ask === 'parallel' ? m : Q(-1).div(m);
      return makeProblem({
        skillId: 'S8.03',
        tags: [],
        prompt: [p(`What is the slope of a line ${ask} to the given line?`), lineBlock('Given line', yTex(m, b))],
        answer: { kind: 'number', value: numStr(key) },
        hints: [`The given line has slope $${m.toTex()}$.`, ask === 'parallel' ? 'Parallel lines have the same slope.' : 'Perpendicular slopes are opposite reciprocals.', ask === 'parallel' ? 'Copy the slope.' : 'Flip the fraction and change its sign.', ask === 'parallel' ? 'The y-intercept does not matter.' : 'Check: the product of perpendicular slopes is −1.'],
        solution: [
          { text: 'Read the slope of the given line.', tex: `m = ${m.toTex()}`, why: 'In y = mx + b, m is the slope.' },
          ask === 'parallel'
            ? { text: 'Parallel lines have equal slopes.', tex: `m_{\\parallel} = ${key.toTex()}` }
            : { text: 'Take the opposite reciprocal.', tex: `m_{\\perp} = -\\frac{1}{${m.isNegative() ? `\\left(${m.toTex()}\\right)` : m.toTex()}} = ${key.toTex()}`, why: `Check: $${m.toTex()} \\cdot ${key.isNegative() ? `\\left(${key.toTex()}\\right)` : key.toTex()} = -1$.` },
        ],
        misconceptions: numberMisconceptions(key, ask === 'parallel'
          ? [{ value: Q(-1).div(m), tag: 'slope-reciprocal', feedback: 'That is the perpendicular slope. Parallel lines have the same slope.' }, { value: m.neg(), tag: 'sign-error', feedback: 'Parallel lines have exactly the same slope, including the sign.' }]
          : [{ value: Q(1).div(m), tag: 'slope-reciprocal', feedback: 'Flip the slope and also change its sign.' }, { value: m.neg(), tag: 'slope-reciprocal', feedback: 'Change the sign and also flip the fraction.' }, { value: m, tag: 'slope-reciprocal', feedback: 'That is the parallel slope.' }]),
      });
    }
    if (difficulty === 2) {
      const rel = rng.pick(['Parallel', 'Perpendicular', 'Neither'] as const);
      let m2: Rational;
      if (rel === 'Parallel') m2 = m;
      else if (rel === 'Perpendicular') m2 = Q(-1).div(m);
      else m2 = rng.pick([Q(1).div(m), m.neg()]);
      if (rel === 'Neither' && (m2.eq(m) || m2.mul(m).eq(-1))) return genParallelPerp.generate(rng, 2);
      const b2 = rel === 'Parallel' ? b.add(rng.nonzeroInt(-5, 5)) : Q(rng.int(-8, 8));
      if (rng.bool()) {
        // two pairs of points
        const P = (label: string, mm: Rational, bb: Rational, x: number) => pt(label, x, mm.mul(x).add(bb).toNumber());
        const xs1 = [0, Number(m.den) * rng.pick([1, 2]) * rng.pick([1, -1])];
        const xs2 = [Number(m2.den) * rng.pick([-1, 1]), Number(m2.den) * rng.pick([2, 3])];
        const A = P('A', m, b, xs1[0]);
        const B = P('B', m, b, xs1[1]);
        const C = P('C', m2, b2, xs2[0]);
        const D = P('D', m2, b2, xs2[1]);
        if (![A, B, C, D].every((q) => Number.isInteger(q.y)) || !fitsGrid([A, B, C, D], 15) || xs2[0] === xs2[1]) return genParallelPerp.generate(rng, 2);
        const s1 = Q(B.y - A.y).div(B.x - A.x);
        const s2 = Q(D.y - C.y).div(D.x - C.x);
        return makeProblem({
          skillId: 'S8.03',
          tags: ['multi-step'],
          prompt: [p(`Line 1 passes through $${ptTex(A)}$ and $${ptTex(B)}$. Line 2 passes through $${ptTex(C)}$ and $${ptTex(D)}$. Are the lines parallel, perpendicular or neither?`)],
          answer: makeChoice(rng, rel, ['Parallel', 'Perpendicular', 'Neither']),
          hints: ['Find the slope of each line with $m = \\frac{y_2 - y_1}{x_2 - x_1}$.', 'Equal slopes: parallel.', 'Slopes whose product is −1: perpendicular.', 'Otherwise: neither.'],
          solution: [
            { text: 'Slope of line 1.', tex: `\\frac{${B.y} - ${neg(A.y)}}{${B.x} - ${neg(A.x)}} = ${s1.toTex()}` },
            { text: 'Slope of line 2.', tex: `\\frac{${D.y} - ${neg(C.y)}}{${D.x} - ${neg(C.x)}} = ${s2.toTex()}` },
            { text: `${rel}.`, tex: rel === 'Parallel' ? `${s1.toTex()} = ${s2.toTex()}` : `${s1.toTex()} \\cdot ${s2.isNegative() ? `\\left(${s2.toTex()}\\right)` : s2.toTex()} = ${s1.mul(s2).toTex()}`, why: rel === 'Parallel' ? 'Equal slopes and different lines.' : rel === 'Perpendicular' ? 'The product of the slopes is −1.' : 'The slopes are not equal and their product is not −1.' },
          ],
          misconceptions: [],
        });
      }
      const std1 = rng.bool();
      const std2 = rng.bool();
      const t1 = std1 ? standardTex(m, b) : yTex(m, b);
      const t2 = std2 ? standardTex(m2, b2) : yTex(m2, b2);
      return makeProblem({
        skillId: 'S8.03',
        tags: [],
        prompt: [p('Are the two lines parallel, perpendicular or neither?'), lineBlock('Line 1', t1), lineBlock('Line 2', t2)],
        answer: makeChoice(rng, rel, ['Parallel', 'Perpendicular', 'Neither']),
        hints: ['Find the slope of each line.', std1 || std2 ? 'Solve a standard-form equation for y to see its slope.' : 'In y = mx + b, m is the slope.', 'Equal slopes: parallel. Product −1: perpendicular.', 'Opposite alone or reciprocal alone is not enough for perpendicular.'],
        solution: [
          { text: 'Slope of line 1.', tex: std1 ? `${t1}\\ \\Rightarrow\\ ${yTex(m, b)},\\quad m_1 = ${m.toTex()}` : `m_1 = ${m.toTex()}`, why: std1 ? 'Solve for y: the coefficient of x is the slope.' : 'In y = mx + b, m is the slope.' },
          { text: 'Slope of line 2.', tex: std2 ? `${t2}\\ \\Rightarrow\\ ${yTex(m2, b2)},\\quad m_2 = ${m2.toTex()}` : `m_2 = ${m2.toTex()}`, why: std2 ? 'Solve for y: the coefficient of x is the slope.' : 'In y = mx + b, m is the slope.' },
          { text: `${rel}.`, why: rel === 'Parallel' ? 'The slopes are equal and the y-intercepts are different.' : rel === 'Perpendicular' ? 'The slopes multiply to −1.' : 'The slopes are not equal and do not multiply to −1.' },
        ],
        misconceptions: [],
      });
    }
    // write the equation through a point
    const ask = rng.pick(['parallel', 'perpendicular'] as const);
    const k = ask === 'parallel' ? m : Q(-1).div(m);
    const x0 = Number(k.den) * rng.nonzeroInt(-3, 3);
    const y0 = rng.int(-6, 6);
    const P = pt('P', Number(x0), y0);
    const b0 = Q(y0).sub(k.mul(Number(x0)));
    if (b0.eq(b) || !fitsGrid([P], 12)) return genParallelPerp.generate(rng, 3);
    const given = rng.bool() ? standardTex(m, b) : yTex(m, b);
    return makeProblem({
      skillId: 'S8.03',
      tags: ['multi-step'],
      prompt: [p(`Write the equation of the line through $${ptTex(P)}$ that is ${ask} to the given line. Use slope-intercept form.`), lineBlock('Given line', given)],
      answer: { kind: 'equation', value: yEq(k, b0), form: 'slope-intercept' },
      inputHint: 'Type an equation like y = 2x - 3.',
      hints: ['Find the slope of the given line.', ask === 'parallel' ? 'Use the same slope.' : 'Use the opposite reciprocal of that slope.', `Substitute the point into $y = mx + b$ to find b.`, 'Write the final equation as y = mx + b.'],
      solution: [
        ...(given !== yTex(m, b) ? [{ text: 'Solve the given equation for y to find its slope.', tex: `${given}\\ \\Rightarrow\\ ${yTex(m, b)}`, why: 'In y = mx + b form, the coefficient of x is the slope.' }] : []),
        { text: 'Find the new slope.', tex: ask === 'parallel' ? `m = ${k.toTex()}` : `m = -\\frac{1}{${m.isNegative() ? `\\left(${m.toTex()}\\right)` : m.toTex()}} = ${k.toTex()}`, why: ask === 'parallel' ? 'Parallel lines have equal slopes.' : 'Perpendicular slopes are opposite reciprocals.' },
        { text: 'Substitute the point to find b.', tex: `${y0} = ${k.toTex()}(${x0}) + b\\ \\Rightarrow\\ b = ${b0.toTex()}`, why: 'The line has to pass through P.' },
        { text: 'Write the equation.', tex: yTex(k, b0) },
      ],
      misconceptions: stringMisconceptions(yEq(k, b0), [
        ...(ask === 'perpendicular' ? [{ answer: yEq(m, Q(y0).sub(m.mul(Number(x0)))), tag: 'slope-reciprocal' as const, feedback: 'That line is parallel. A perpendicular slope is the opposite reciprocal.' }, { answer: yEq(Q(1).div(m), Q(y0).sub(Q(1).div(m).mul(Number(x0)))), tag: 'slope-reciprocal' as const, feedback: 'Flip the slope and also change its sign.' }] : []),
        { answer: yEq(k, b), tag: 'equation-setup' as const, feedback: 'Use the point to find a new y-intercept; the given line’s intercept does not apply.' },
      ]),
    });
  },
  verify(pr) {
    const text = textAll(pr);
    const label = labelOf(pr);
    if (/What kind of line is it\?/.test(text)) {
      const horizontal = /to the line \$y = /.test(text);
      const par = /is parallel to/.test(text);
      return label === (horizontal === par ? 'A horizontal line, with slope 0' : 'A vertical line, with undefined slope') ? [] : ['horizontal/vertical wrong'];
    }
    const ps = readPts(pr);
    const rel = (m1: Rational, m2: Rational, same: boolean) => (m1.eq(m2) ? (same ? 'Same' : 'Parallel') : m1.mul(m2).eq(-1) ? 'Perpendicular' : 'Neither');
    if (ps.has('D')) {
      const [A, B, C, D] = ['A', 'B', 'C', 'D'].map((k) => ps.get(k)!);
      const u = vec(A, B);
      const v = vec(C, D);
      const want = cross(u, v) === 0 ? (cross(u, vec(A, C)) === 0 ? 'Same' : 'Parallel') : dot(u, v) === 0 ? 'Perpendicular' : 'Neither';
      return label === want ? [] : ['relationship wrong'];
    }
    const lines = readLines(pr);
    if (lines.some((l) => !l)) return ['vertical line in prompt'];
    if (lines.length === 2) return label === rel(lines[0]!.m, lines[1]!.m, lines[0]!.b.eq(lines[1]!.b)) ? [] : ['relationship wrong'];
    const g = lines[0]!;
    if (pr.answer.kind === 'number') {
      const v = Rational.parse(pr.answer.value);
      return (/parallel to/.test(text) ? v.eq(g.m) : v.mul(g.m).eq(-1)) ? [] : ['slope wrong'];
    }
    if (pr.answer.kind !== 'equation') return ['kind'];
    const ans = lineFromTex(pr.answer.value);
    const P = ps.get('P')!;
    if (!ans || !ans.m.mul(P.x).add(ans.b).eq(P.y)) return ['line misses the point'];
    return (/that is parallel/.test(text) ? ans.m.eq(g.m) && !ans.b.eq(g.b) : ans.m.mul(g.m).eq(-1)) ? [] : ['line has the wrong slope'];
  },
};

// ---------------------------------------------------------------------------
// S8.04: perimeter and area
// ---------------------------------------------------------------------------

export const genPerimArea: GeneratorDef = {
  id: 'u8.perim-area',
  skillId: 'S8.04',
  description: 'Find perimeters and areas of rectangles, triangles and other polygons from their vertices, with exact radical or rounded perimeters and the box method for areas.',
  generate(rng, difficulty) {
    if (difficulty === 1) {
      const x1 = rng.int(-8, 2);
      const y1 = rng.int(-8, 2);
      const w = rng.int(2, 9);
      const h = rng.int(2, 8);
      if (w === h) return genPerimArea.generate(rng, 1);
      const ps = [pt('A', x1, y1), pt('B', x1 + w, y1), pt('C', x1 + w, y1 + h), pt('D', x1, y1 + h)];
      const askArea = rng.bool();
      const key = askArea ? w * h : 2 * (w + h);
      return makeProblem({
        skillId: 'S8.04',
        tags: ['graph'],
        prompt: [p(`Rectangle $ABCD$ has vertices $${ps.map(ptTex).join('$, $')}$. Find its ${askArea ? 'area' : 'perimeter'}.`), { t: 'graph', spec: graphOf(ps, polygonSegments(ps)) }],
        answer: { kind: 'number', value: String(key), unit: askArea ? 'square units' : 'units' },
        hints: ['Find the length of a horizontal side by subtracting x-coordinates.', 'Find the length of a vertical side by subtracting y-coordinates.', askArea ? 'Area = length × width.' : 'Perimeter = 2 × length + 2 × width.', askArea ? 'Area is in square units.' : 'Perimeter is in units.'],
        solution: [
          { text: 'Find the side lengths.', tex: `AB = ${x1 + w} - ${neg(x1)} = ${w},\\quad BC = ${y1 + h} - ${neg(y1)} = ${h}` },
          askArea ? { text: 'Multiply.', tex: `A = ${w} \\cdot ${h} = ${key}`, why: 'The area of a rectangle is length times width.' } : { text: 'Add all four sides.', tex: `P = 2(${w}) + 2(${h}) = ${key}`, why: 'Opposite sides of a rectangle are equal.' },
        ],
        misconceptions: numberMisconceptions(Q(key), [{ value: Q(askArea ? 2 * (w + h) : w * h), tag: 'formula-error', feedback: askArea ? 'That is the perimeter. Area is length times width.' : 'That is the area. Perimeter adds the side lengths.' }, { value: Q(w + h), tag: 'formula-error', feedback: askArea ? 'Multiply the side lengths.' : 'A rectangle has four sides; add all of them.' }]),
      });
    }
    if (difficulty === 2) {
      if (rng.bool()) {
        // triangle with a horizontal or vertical base
        const horiz = rng.bool();
        const x1 = rng.int(-8, 0);
        const y1 = rng.int(-8, 0);
        const base = rng.int(3, 10);
        const h = rng.nonzeroInt(-8, 8);
        const off = rng.int(-2, base + 2);
        const raw = horiz ? [[x1, y1], [x1 + base, y1], [x1 + off, y1 + h]] : [[x1, y1], [x1, y1 + base], [x1 + h, y1 + off]];
        const ps = raw.map(([x, y], i) => pt('ABC'[i], x, y));
        if (!fitsGrid(ps, 11)) return genPerimArea.generate(rng, 2);
        const key = Q(base * Math.abs(h), 2);
        return makeProblem({
          skillId: 'S8.04',
          tags: ['graph'],
          prompt: [p(`Find the area of triangle $ABC$ with vertices $${ps.map(ptTex).join('$, $')}$.`), { t: 'graph', spec: graphOf(ps, polygonSegments(ps)) }],
          answer: { kind: 'number', value: numStr(key), unit: 'square units' },
          hints: [`Side AB is ${horiz ? 'horizontal' : 'vertical'}; use it as the base.`, 'The height is the perpendicular distance from C to the line through A and B.', horiz ? 'The height is the difference of the y-coordinates.' : 'The height is the difference of the x-coordinates.', 'Area = ½ · base · height.'],
          solution: [
            { text: 'Find the base.', tex: `b = AB = ${base}`, why: `A and B have the same ${horiz ? 'y' : 'x'}-coordinate.` },
            { text: 'Find the height.', tex: `h = |${horiz ? ps[2].y : ps[2].x} - ${neg(horiz ? y1 : x1)}| = ${Math.abs(h)}`, why: 'The height is measured straight across to the base line, not along a slanted side.' },
            { text: 'Use the area formula.', tex: `A = \\frac{1}{2}(${base})(${Math.abs(h)}) = ${numStr(key)}` },
          ],
          misconceptions: numberMisconceptions(key, [{ value: Q(base * Math.abs(h)), tag: 'formula-error', feedback: 'Remember the ½ in the triangle area formula.' }]),
        });
      }
      if (rng.bool()) {
        // perimeter of a parallelogram with horizontal sides and slanted sides: exact or rounded
        const w = rng.int(3, 8);
        const dx = rng.nonzeroInt(-4, 4);
        const dy = rng.int(2, 6);
        const n = dx * dx + dy * dy;
        const r = root(n);
        if (r.inside === 1) return genPerimArea.generate(rng, 2);
        const A = pt('A', rng.int(-7, 1), rng.int(-7, 1));
        const ps = [A, pt('B', A.x + w, A.y), pt('C', A.x + w + dx, A.y + dy), pt('D', A.x + dx, A.y + dy)];
        if (!fitsGrid(ps, 11)) return genPerimArea.generate(rng, 2);
        const exact = rng.bool();
        const two = root(4 * n);
        const plain = `${2 * w}+${two.plain}`;
        const v = 2 * w + 2 * Math.sqrt(n);
        return makeProblem({
          skillId: 'S8.04',
          tags: ['graph', 'multi-step'],
          prompt: [p(`Find the perimeter of parallelogram $ABCD$ with vertices $${ps.map(ptTex).join('$, $')}$. ${exact ? 'Give an exact answer in simplest radical form.' : 'Round to the nearest tenth.'}`), { t: 'graph', spec: graphOf(ps, polygonSegments(ps)) }],
          answer: exact ? { kind: 'expression', value: plain, form: 'simplified-radical' } : { kind: 'number', value: v.toFixed(12), roundTo: 1, unit: 'units' },
          ...(exact ? { inputHint: 'Type an answer like 10 + 4sqrt(5).' } : {}),
          hints: ['Opposite sides of a parallelogram are equal, so you only need two side lengths.', 'AB is horizontal, so subtract x-coordinates.', 'BC is slanted, so use the distance formula.', 'Perimeter = 2 · AB + 2 · BC.'],
          solution: [
            { text: 'Find AB.', tex: `AB = ${A.x + w} - ${neg(A.x)} = ${w}`, why: 'A and B have the same y-coordinate.' },
            { text: 'Find BC with the distance formula.', tex: `BC = \\sqrt{${neg(dx)}^2 + ${dy}^2} = \\sqrt{${n}}${r.out > 1 ? ` = ${r.tex}` : ''}` },
            { text: 'Add all four sides.', tex: exact ? `P = 2(${w}) + 2(${r.tex}) = ${2 * w} + ${two.tex}` : `P = 2(${w}) + 2\\sqrt{${n}} \\approx ${v.toFixed(3)} \\approx ${v.toFixed(1)}`, why: exact ? 'CD = AB and DA = BC. A whole number and a radical are unlike terms, so they stay separate.' : 'CD = AB and DA = BC. Round only at the end.' },
          ],
          misconceptions: exact
            ? stringMisconceptions(plain, [{ answer: `${w}+${r.plain}`, tag: 'formula-error', feedback: 'That is only two sides. A parallelogram has four: add AB + BC + CD + DA.' }, { answer: String(2 * w + 2 * (Math.abs(dx) + dy)), tag: 'formula-error', feedback: 'A slanted side is not the sum of its changes. Use the distance formula.' }])
            : numberMisconceptions(Rational.parse(v.toFixed(1)), [{ value: Rational.parse((w + Math.sqrt(n)).toFixed(1)), tag: 'formula-error', feedback: 'That is only two sides. A parallelogram has four.' }, { value: Q(2 * w + 2 * (Math.abs(dx) + dy)), tag: 'formula-error', feedback: 'A slanted side is not the sum of its changes. Use the distance formula.' }]),
        });
      }
      // perimeter of a right triangle with legs on grid lines: exact or rounded
      const [x1, y1] = [rng.int(-7, 1), rng.int(-7, 1)];
      const a = rng.int(2, 8);
      const b = rng.int(2, 8);
      const n = a * a + b * b;
      const r = root(n);
      if (r.inside === 1) return genPerimArea.generate(rng, 2);
      const ps = [pt('A', x1, y1), pt('B', x1 + a, y1), pt('C', x1, y1 + b)];
      const exact = rng.bool();
      const plain = `${a + b}+${r.plain}`;
      const v = a + b + Math.sqrt(n);
      return makeProblem({
        skillId: 'S8.04',
        tags: ['graph'],
        prompt: [p(`Find the perimeter of triangle $ABC$ with vertices $${ps.map(ptTex).join('$, $')}$. ${exact ? 'Give an exact answer in simplest radical form.' : 'Round to the nearest tenth.'}`), { t: 'graph', spec: graphOf(ps, polygonSegments(ps)) }],
        answer: exact ? { kind: 'expression', value: plain, form: 'simplified-radical' } : { kind: 'number', value: v.toFixed(12), roundTo: 1, unit: 'units' },
        ...(exact ? { inputHint: 'Type an answer like 7 + 2sqrt(5).' } : {}),
        hints: ['Find the length of each side.', 'AB and AC are on grid lines, so count or subtract.', 'Use the distance formula for BC.', 'Add the three lengths.'],
        solution: [
          { text: 'Find the two legs.', tex: `AB = ${a},\\quad AC = ${b}` },
          { text: 'Find BC with the distance formula.', tex: `BC = \\sqrt{${a}^2 + ${b}^2} = \\sqrt{${n}}${r.out > 1 ? ` = ${r.tex}` : ''}`, why: 'BC is slanted, so counting squares does not work.' },
          { text: 'Add the sides.', tex: exact ? `P = ${a} + ${b} + ${r.tex} = ${a + b} + ${r.tex}` : `P = ${a + b} + \\sqrt{${n}} \\approx ${v.toFixed(1)}`, why: exact ? 'Whole numbers and radicals are unlike terms, so they cannot be combined.' : 'Round only at the end.' },
        ],
        misconceptions: exact
          ? stringMisconceptions(plain, [{ answer: `${a + b + r.out}sqrt(${r.inside})`, tag: 'radical-simplify', feedback: 'A whole number and a radical are unlike terms; they cannot be added into one radical.' }, { answer: String(a + b + a + b), tag: 'formula-error', feedback: 'The slanted side is not the sum of the legs. Use the distance formula.' }])
          : numberMisconceptions(Rational.parse(v.toFixed(1)), [{ value: Q(2 * (a + b)), tag: 'formula-error', feedback: 'The slanted side is not the sum of the legs. Use the distance formula.' }]),
      });
    }
    if (rng.int(0, 2) > 0) {
      // tilted rectangle with sides 2(a, b) and k(-b, a), k = 1 or 3 (k = 2 would be a square), or the right triangle on two of its sides
      const a = rng.int(1, 3);
      const b = rng.int(1, 3);
      const k = rng.pick([1, 3]);
      const triangle = rng.bool();
      const A = pt('A', rng.int(-4, 2), rng.int(-6, 0));
      const B = pt('B', A.x + a * 2, A.y + b * 2);
      const D = pt(triangle ? 'C' : 'D', A.x - b * k, A.y + a * k);
      const C = pt('C', B.x + D.x - A.x, B.y + D.y - A.y);
      const ps = triangle ? [A, B, D] : [A, B, C, D];
      if (!fitsGrid(ps, 11)) return genPerimArea.generate(rng, 3);
      const ab = d2(A, B);
      const ad = d2(A, D);
      const prod = Math.sqrt(ab * ad);
      if (!Number.isInteger(prod)) return genPerimArea.generate(rng, 3);
      const key = triangle ? Q(prod, 2) : Q(prod);
      const rab = root(ab);
      const rad = root(ad);
      const side = triangle ? 'AC' : 'AD';
      const mAB = Q(B.y - A.y, B.x - A.x);
      const mAD = Q(D.y - A.y, D.x - A.x);
      return makeProblem({
        skillId: 'S8.04',
        tags: ['graph', 'multi-step'],
        prompt: [p(triangle ? `Find the area of right triangle $ABC$ with vertices $${ps.map(ptTex).join('$, $')}$. The right angle is at $A$.` : `$ABCD$ is a rectangle with vertices $${ps.map(ptTex).join('$, $')}$. Find its area.`), { t: 'graph', spec: graphOf(ps, polygonSegments(ps)) }],
        answer: { kind: 'number', value: numStr(key), unit: 'square units' },
        hints: ['The sides are slanted, so use the distance formula.', 'Find the length AB.', `Find the length ${side}, the side that meets AB at a right angle.`, triangle ? 'The legs are the base and height: area = ½ · AB · AC.' : 'Multiply the two lengths and simplify.'],
        solution: [
          ...(triangle ? [{ text: 'Check the right angle at A.', tex: `m_{AB} \\cdot m_{AC} = ${mAB.toTex()} \\cdot ${mAD.isNegative() ? `\\left(${mAD.toTex()}\\right)` : mAD.toTex()} = -1`, why: 'The legs AB and AC are perpendicular, so they are a base and its height.' }] : []),
          { text: 'Find AB.', tex: `AB = \\sqrt{${B.x - A.x}^2 + ${B.y - A.y}^2} = \\sqrt{${ab}} = ${rab.tex}` },
          { text: `Find ${side}.`, tex: `${side} = \\sqrt{${neg(D.x - A.x)}^2 + ${neg(D.y - A.y)}^2} = \\sqrt{${ad}} = ${rad.tex}`, why: triangle ? 'AC is the other leg.' : 'AB and AD are adjacent sides, so they are the length and the width.' },
          triangle
            ? { text: 'Use the triangle area formula.', tex: `A = \\frac{1}{2} \\cdot \\sqrt{${ab}} \\cdot \\sqrt{${ad}} = \\frac{1}{2}\\sqrt{${ab * ad}} = \\frac{1}{2}(${prod}) = ${numStr(key)}` }
            : { text: 'Multiply.', tex: `A = \\sqrt{${ab}} \\cdot \\sqrt{${ad}} = \\sqrt{${ab * ad}} = ${prod}` },
        ],
        misconceptions: numberMisconceptions(key, [
          { value: Q(Math.abs(B.x - A.x) * Math.abs(D.y - A.y)), tag: 'formula-error', feedback: 'The sides are slanted. Find their lengths with the distance formula.' },
          ...(triangle ? [{ value: Q(prod), tag: 'formula-error' as const, feedback: 'Remember the ½ in the triangle area formula.' }] : []),
        ]),
      });
    }
    // box method for a triangle with no horizontal or vertical side
    const ps = [pt('A', rng.int(-8, 8), rng.int(-8, 8)), pt('B', rng.int(-8, 8), rng.int(-8, 8)), pt('C', rng.int(-8, 8), rng.int(-8, 8))];
    const [A, B, C] = ps;
    const xs = ps.map((q) => q.x);
    const ys = ps.map((q) => q.y);
    const W = Math.max(...xs) - Math.min(...xs);
    const H = Math.max(...ys) - Math.min(...ys);
    // exactly one vertex on each side of the box keeps the method to three corner triangles
    const onEdge = (q: Pt) => [q.x === Math.min(...xs), q.x === Math.max(...xs), q.y === Math.min(...ys), q.y === Math.max(...ys)].filter(Boolean).length;
    if (new Set(xs).size < 3 || new Set(ys).size < 3 || W < 4 || H < 4 || W > 12 || H > 12 || ps.some((q) => onEdge(q) === 0)) return genPerimArea.generate(rng, 3);
    const tri = (u: Pt, v: Pt) => Math.abs(u.x - v.x) * Math.abs(u.y - v.y);
    const corners = [tri(A, B), tri(B, C), tri(C, A)];
    const key = Q(W * H * 2 - corners.reduce((s, c) => s + c, 0), 2);
    if (!key.gt(0)) return genPerimArea.generate(rng, 3);
    return makeProblem({
      skillId: 'S8.04',
      tags: ['graph', 'multi-step'],
      prompt: [p(`Find the area of triangle $ABC$ with vertices $${ps.map(ptTex).join('$, $')}$.`), { t: 'graph', spec: graphOf(ps, polygonSegments(ps)) }],
      answer: { kind: 'number', value: numStr(key), unit: 'square units' },
      hints: ['No side is horizontal or vertical, so use the box method.', 'Draw the smallest rectangle with horizontal and vertical sides that holds the triangle.', 'Find the area of each right triangle between the box and triangle ABC.', 'Subtract those areas from the area of the box.'],
      solution: [
        { text: 'Area of the box.', tex: `${W} \\times ${H} = ${W * H}`, why: 'The box runs from the smallest to the largest x and y.' },
        { text: 'Areas of the three corner triangles.', tex: corners.map((c) => `\\frac{1}{2}(${c}) = ${numStr(Q(c, 2))}`).join(',\\quad '), why: 'Each one is a right triangle whose legs are the horizontal and vertical changes along one side of ABC.' },
        { text: 'Subtract.', tex: `${W * H} - ${corners.map((c) => numStr(Q(c, 2))).join(' - ')} = ${numStr(key)}` },
      ],
      misconceptions: numberMisconceptions(key, [{ value: Q(W * H, 2), tag: 'formula-error', feedback: 'Half the box is only right when a side of the triangle is a side of the box. Subtract the corner triangles instead.' }]),
    });
  },
  verify(pr) {
    const ps = readPts(pr);
    const order = ['A', 'B', 'C', 'D'].filter((k) => ps.has(k)).map((k) => ps.get(k)!);
    const text = textAll(pr);
    if (/area/.test(text)) {
      if (pr.answer.kind !== 'number') return ['kind'];
      if (order.length === 4 && vClassify(order) !== 'Rectangle' && vClassify(order) !== 'Square') return ['not a rectangle'];
      return Math.abs(Number(Rational.parse(pr.answer.value).toNumber()) - Math.abs(shoelace2(order)) / 2) < 1e-9 ? [] : ['area wrong'];
    }
    const per = order.reduce((s, a, i) => s + Math.sqrt(d2(a, order[(i + 1) % order.length])), 0);
    if (pr.answer.kind === 'number') return Math.abs((pr.answer.roundTo !== undefined ? Number(pr.answer.value) : Rational.parse(pr.answer.value).toNumber()) - per) < 1e-9 ? [] : ['perimeter wrong'];
    if (pr.answer.kind === 'expression') return Math.abs(numVal(pr.answer.value) - per) < 1e-9 ? [] : ['exact perimeter wrong'];
    return ['kind'];
  },
};

// ---------------------------------------------------------------------------
// S8.05: classifying figures
// ---------------------------------------------------------------------------

const REASON: Record<Exclude<Quad, 'None'>, string> = {
  Square: 'Square: all four sides are equal and adjacent sides are perpendicular',
  Rectangle: 'Rectangle: opposite sides are parallel and adjacent sides are perpendicular, but not all four sides are equal',
  Rhombus: 'Rhombus: all four sides are equal, but adjacent sides are not perpendicular',
  Parallelogram: 'Parallelogram: both pairs of opposite sides are parallel, but there are no right angles and not all sides are equal',
  Trapezoid: 'Trapezoid: exactly one pair of opposite sides is parallel',
};
function makeQuad(rng: Rng, kind: Exclude<Quad, 'None'>): Pt[] | null {
  const a = rng.nonzeroInt(-4, 4);
  const b = rng.nonzeroInt(-4, 4);
  const u = { x: a, y: b };
  let v: { x: number; y: number };
  if (kind === 'Square') v = { x: -b, y: a };
  else if (kind === 'Rectangle') v = { x: -b * 2, y: a * 2 };
  else if (kind === 'Rhombus') v = rng.bool() ? { x: b, y: a } : { x: -a, y: b };
  else v = { x: rng.nonzeroInt(-4, 4), y: rng.nonzeroInt(-4, 4) };
  const A = { x: rng.int(-5, 1), y: rng.int(-5, 1) };
  const B = { x: A.x + u.x, y: A.y + u.y };
  const D = { x: A.x + v.x, y: A.y + v.y };
  const C = kind === 'Trapezoid' ? { x: D.x + 2 * u.x, y: D.y + 2 * u.y } : { x: B.x + v.x, y: B.y + v.y };
  const ps = [A, B, C, D].map((q, i) => pt('ABCD'[i], q.x, q.y));
  if (!fitsGrid(ps, 10) || cross(u, v) === 0 || vClassify(ps) !== kind) return null;
  // keep the shape a convex quadrilateral named in order
  const s = [0, 1, 2, 3].map((i) => cross(vec(ps[i], ps[(i + 1) % 4]), vec(ps[(i + 1) % 4], ps[(i + 2) % 4])));
  if (!(s.every((x) => x > 0) || s.every((x) => x < 0))) return null;
  return ps;
}

export const genClassify: GeneratorDef = {
  id: 'u8.classify',
  skillId: 'S8.05',
  description: 'Use slopes and distances to classify triangles (right, isosceles, scalene) and quadrilaterals (square, rectangle, rhombus, parallelogram, trapezoid), and find a missing vertex of a parallelogram.',
  generate(rng, difficulty) {
    if (difficulty === 1) {
      const A = pt('A', rng.int(-5, 3), rng.int(-5, 3));
      if (rng.bool()) {
        const a = rng.nonzeroInt(-4, 4);
        const b = rng.nonzeroInt(-4, 4);
        const k = rng.pick([1, 2]);
        const right = rng.bool();
        const B = pt('B', A.x + a, A.y + b);
        const C = pt('C', A.x - b * k + (right ? 0 : rng.pick([1, -1])), A.y + a * k);
        const ps = [A, B, C];
        const pairs: Array<[Pt, Pt, Pt]> = [[A, B, C], [B, C, A], [C, A, B]];
        const hasRight = pairs.some(([p1, p2, p3]) => dot(vec(p1, p2), vec(p1, p3)) === 0);
        if (hasRight !== right || !fitsGrid(ps, 10) || cross(vec(A, B), vec(A, C)) === 0 || ps.some((q) => q.x === A.x && q !== A && q.y === A.y)) return genClassify.generate(rng, 1);
        if (ps.some((q, i) => ps.some((r, j) => i < j && (q.x === r.x || q.y === r.y)))) return genClassify.generate(rng, 1);
        const sAB = Q(B.y - A.y).div(B.x - A.x);
        const sAC = Q(C.y - A.y).div(C.x - A.x);
        const sBC = Q(C.y - B.y).div(C.x - B.x);
        const correct = right ? 'Yes, because two of its sides are perpendicular' : 'No, because no two of its sides are perpendicular';
        return makeProblem({
          skillId: 'S8.05',
          tags: ['graph'],
          prompt: [p(`Is triangle $ABC$ with vertices $${ps.map(ptTex).join('$, $')}$ a right triangle? Choose the answer with the correct reason.`), { t: 'graph', spec: graphOf(ps, polygonSegments(ps)) }],
          answer: makeChoice(rng, correct, [right ? 'No, because no two of its sides are perpendicular' : 'Yes, because two of its sides are perpendicular', 'Yes, because two of its sides have the same length', 'No, because two of its sides are parallel']),
          hints: ['A right triangle has two perpendicular sides.', 'Find the slope of each side.', 'Perpendicular slopes multiply to −1.', 'Check all three pairs of sides.'],
          solution: [
            { text: 'Find the slopes.', tex: `m_{AB} = ${sAB.toTex()},\\quad m_{AC} = ${sAC.toTex()},\\quad m_{BC} = ${sBC.toTex()}` },
            { text: right ? 'Two slopes multiply to −1.' : 'No two slopes multiply to −1.', tex: right ? (() => { const pr2: Array<[string, Rational, Rational]> = [['m_{AB} \\cdot m_{AC}', sAB, sAC], ['m_{AB} \\cdot m_{BC}', sAB, sBC], ['m_{AC} \\cdot m_{BC}', sAC, sBC]]; const hit = pr2.find(([, u, v]) => u.mul(v).eq(-1))!; return `${hit[0]} = ${hit[1].toTex()} \\cdot ${hit[2].isNegative() ? `\\left(${hit[2].toTex()}\\right)` : hit[2].toTex()} = -1`; })() : undefined, why: right ? 'Those sides are perpendicular, so the triangle has a right angle.' : 'No pair of sides is perpendicular, so there is no right angle.' },
          ],
          misconceptions: [],
        });
      }
      const iso = rng.bool();
      const a = rng.nonzeroInt(-5, 5);
      const b = rng.nonzeroInt(-5, 5);
      const B = pt('B', A.x + a, A.y + b);
      const C = iso ? pt('C', A.x + rng.pick([b, -b]), A.y + rng.pick([a, -a])) : pt('C', A.x + rng.nonzeroInt(-5, 5), A.y + rng.nonzeroInt(-5, 5));
      const ps = [A, B, C];
      const L = [d2(A, B), d2(B, C), d2(C, A)];
      const isIso = new Set(L).size < 3;
      if (isIso !== iso || cross(vec(A, B), vec(A, C)) === 0 || !fitsGrid(ps, 10) || (C.x === B.x && C.y === B.y)) return genClassify.generate(rng, 1);
      const correct = iso ? 'Isosceles' : 'Scalene';
      return makeProblem({
        skillId: 'S8.05',
        tags: ['graph'],
        prompt: [p(`Classify triangle $ABC$ with vertices $${ps.map(ptTex).join('$, $')}$ by its side lengths.`), { t: 'graph', spec: graphOf(ps, polygonSegments(ps)) }],
        answer: makeChoice(rng, correct, ['Isosceles', 'Scalene', 'Equilateral']),
        hints: ['Find the length of each side with the distance formula.', 'You can compare squared lengths instead.', 'Two equal sides: isosceles. No equal sides: scalene.', 'Three equal sides: equilateral.'],
        solution: [
          { text: 'Squared side lengths.', tex: `AB^2 = ${L[0]},\\quad BC^2 = ${L[1]},\\quad CA^2 = ${L[2]}`, why: 'Equal squares mean equal lengths.' },
          { text: `${correct}.`, why: iso ? 'Two sides have the same length.' : 'All three sides have different lengths.' },
        ],
        misconceptions: [],
      });
    }
    if (difficulty === 2 || rng.bool()) {
      const kind = rng.pick(['Square', 'Rectangle', 'Rhombus', 'Parallelogram', 'Trapezoid'] as const);
      const ps = makeQuad(rng, kind);
      if (!ps) return genClassify.generate(rng, difficulty);
      const withReason = difficulty === 3;
      const correct = withReason ? REASON[kind] : kind;
      const opts = withReason ? Object.values(REASON) : ['Square', 'Rectangle', 'Rhombus', 'Parallelogram', 'Trapezoid'];
      const s = (i: number) => {
        const u = vec(ps[i], ps[(i + 1) % 4]);
        return u.x === 0 ? '\\text{undefined}' : Q(u.y, u.x).toTex();
      };
      return makeProblem({
        skillId: 'S8.05',
        tags: ['graph', 'multi-step'],
        prompt: [p(`Quadrilateral $ABCD$ has vertices $${ps.map(ptTex).join('$, $')}$. What is the most specific name for $ABCD$${withReason ? ', and why' : ''}?`), { t: 'graph', spec: graphOf(ps, polygonSegments(ps)) }],
        answer: makeChoice(rng, correct, rng.shuffle(opts.filter((o) => o !== correct)).slice(0, 3)),
        hints: ['Find the slope of each side to check for parallel and perpendicular sides.', 'Find the length of each side (or its square).', 'Opposite sides parallel: a parallelogram. Then check for right angles and equal sides.', 'Only one pair of parallel sides: a trapezoid.'],
        solution: [
          { text: 'Slopes of the sides.', tex: `m_{AB} = ${s(0)},\\ m_{BC} = ${s(1)},\\ m_{CD} = ${s(2)},\\ m_{DA} = ${s(3)}` },
          { text: 'Squared side lengths.', tex: `AB^2 = ${d2(ps[0], ps[1])},\\ BC^2 = ${d2(ps[1], ps[2])},\\ CD^2 = ${d2(ps[2], ps[3])},\\ DA^2 = ${d2(ps[3], ps[0])}` },
          { text: REASON[kind] + '.', why: 'Use the most specific name that fits all the facts.' },
        ],
        misconceptions: [],
      });
    }
    // fourth vertex of a parallelogram
    const A = pt('A', rng.int(-6, 2), rng.int(-6, 2));
    const B = pt('B', A.x + rng.nonzeroInt(-5, 5), A.y + rng.nonzeroInt(-5, 5));
    const C = pt('C', B.x + rng.nonzeroInt(-5, 5), B.y + rng.nonzeroInt(-5, 5));
    const D = { x: A.x + C.x - B.x, y: A.y + C.y - B.y };
    if (cross(vec(A, B), vec(B, C)) === 0 || !fitsGrid([B, C, D], 10)) return genClassify.generate(rng, 3);
    return makeProblem({
      skillId: 'S8.05',
      tags: ['graph', 'multi-step'],
      prompt: [p(`Three vertices of parallelogram $ABCD$ are $${ptTex(A)}$, $${ptTex(B)}$ and $${ptTex(C)}$. Find vertex $D$.`), { t: 'graph', spec: graphOf([A, B, C], [[A, B], [B, C]]) }],
      answer: { kind: 'point', x: String(D.x), y: String(D.y) },
      inputHint: 'Type a point like (1, -2).',
      hints: ['In parallelogram ABCD, side AD is parallel to and the same length as side BC.', 'Find the step from B to C.', 'Take the same step from A.', 'Check: the diagonals AC and BD should have the same midpoint.'],
      solution: [
        { text: 'Find the step from B to C.', tex: `(${C.x - B.x}, ${C.y - B.y})`, why: 'Opposite sides of a parallelogram are parallel and equal, so AD has the same step as BC.' },
        { text: 'Take the same step from A.', tex: `D = (${A.x} + ${neg(C.x - B.x)}, ${A.y} + ${neg(C.y - B.y)}) = (${D.x}, ${D.y})` },
        { text: 'Check with the midpoints of the diagonals.', tex: `M_{AC} = M_{BD} = \\left(${halfStr(A.x + C.x)}, ${halfStr(A.y + C.y)}\\right)`, why: 'The diagonals of a parallelogram bisect each other.' },
      ],
      misconceptions: [{ answer: `(${C.x + B.x - A.x}, ${C.y + B.y - A.y})`, tag: 'formula-error', feedback: 'That makes A, B, D, C a parallelogram in a different order. Go around the vertices in order A, B, C, D.' }] as Misconception[],
    });
  },
  verify(pr) {
    const ps = readPts(pr);
    const label = labelOf(pr);
    const text = textAll(pr);
    const [A, B, C] = ['A', 'B', 'C'].map((k) => ps.get(k)!);
    if (/Find vertex \$D\$/.test(text)) {
      if (pr.answer.kind !== 'point') return ['kind'];
      const D = { x: Number(pr.answer.x), y: Number(pr.answer.y) };
      // diagonals bisect each other
      return A.x + C.x === B.x + D.x && A.y + C.y === B.y + D.y ? [] : ['vertex D wrong'];
    }
    if (/right triangle/.test(text)) {
      const right = [[A, B, C], [B, C, A], [C, A, B]].some(([p1, p2, p3]) => d2(p2, p3) === d2(p1, p2) + d2(p1, p3)); // converse of Pythagoras
      return label === (right ? 'Yes, because two of its sides are perpendicular' : 'No, because no two of its sides are perpendicular') ? [] : ['right triangle wrong'];
    }
    if (/by its side lengths/.test(text)) {
      const L = [d2(A, B), d2(B, C), d2(C, A)];
      return label === (new Set(L).size === 1 ? 'Equilateral' : new Set(L).size === 2 ? 'Isosceles' : 'Scalene') ? [] : ['side classification wrong'];
    }
    const D = ps.get('D')!;
    const k = vClassify([A, B, C, D]);
    if (k === 'None') return ['not a named quadrilateral'];
    return label === k || label === REASON[k] ? [] : ['quadrilateral wrong'];
  },
};

// ---------------------------------------------------------------------------
// S8.06: coordinate geometry in context
// ---------------------------------------------------------------------------

interface Map8 { place1: string; place2: string; l1: string; l2: string; unit: string; scale: Rational; scaleText: string }
const MAPS: Map8[] = [
  { place1: "Maya's home", place2: 'her school', l1: 'H', l2: 'S', unit: 'miles', scale: Q(1, 4), scaleText: '0.25 mile' },
  { place1: 'the library', place2: 'the skate park', l1: 'L', l2: 'K', unit: 'meters', scale: Q(100), scaleText: '100 meters' },
  { place1: 'the gym', place2: 'the pizza shop', l1: 'G', l2: 'P', unit: 'miles', scale: Q(1, 2), scaleText: '0.5 mile' },
  { place1: 'the stadium', place2: 'the bus station', l1: 'T', l2: 'B', unit: 'kilometers', scale: Q(2), scaleText: '2 kilometers' },
  { place1: 'the campsite', place2: 'the lake', l1: 'C', l2: 'L', unit: 'yards', scale: Q(50), scaleText: '50 yards' },
];
const scaleOf = (text: string): Rational => {
  const m = /each grid unit is ([\d.]+) (mile|meter|kilometer|yard|feet|foot)/.exec(text)!;
  return Rational.parse(m[1]);
};

export const genGeoContext: GeneratorDef = {
  id: 'u8.geo-context',
  skillId: 'S8.06',
  description: 'Solve real-world problems on a scaled grid: straight-line distances, meeting points, fencing and area with costs, street routes versus straight paths, and parallel or perpendicular paths.',
  generate(rng, difficulty) {
    const mp = rng.pick(MAPS);
    const P1 = pt(mp.l1, rng.int(-6, 2), rng.int(-6, 2));
    if (difficulty === 1) {
      if (rng.int(0, 2) === 0) {
        // not a Pythagorean triple: round the scaled distance to the nearest tenth
        const dx = rng.nonzeroInt(-7, 7);
        const dy = rng.nonzeroInt(-7, 7);
        const n = dx * dx + dy * dy;
        const P2 = pt(mp.l2, P1.x + dx, P1.y + dy);
        if (Number.isInteger(Math.sqrt(n)) || !fitsGrid([P2], 12)) return genGeoContext.generate(rng, 1);
        const v = mp.scale.toNumber() * Math.sqrt(n);
        return makeProblem({
          skillId: 'S8.06',
          tags: ['real-world', 'graph'],
          prompt: [p(`On a map, ${mp.place1} is at $${ptTex(P1)}$ and ${mp.place2} is at $${ptTex(P2)}$, and each grid unit is ${mp.scaleText}. What is the straight-line distance between them, in ${mp.unit}? Round to the nearest tenth.`), { t: 'graph', spec: graphOf([P1, P2], [[P1, P2]], true) }],
          answer: { kind: 'number', value: v.toFixed(12), roundTo: 1, unit: mp.unit },
          hints: ['First find the distance in grid units.', 'Use the distance formula and leave it as a square root for now.', `Then convert: each grid unit is ${mp.scaleText}.`, 'Multiply by the scale, then round only at the end.'],
          solution: [
            { text: 'Distance in grid units.', tex: `\\sqrt{${neg(dx)}^2 + ${neg(dy)}^2} = \\sqrt{${n}}` },
            { text: 'Convert with the scale, then round.', tex: `\\sqrt{${n}} \\times ${numStr(mp.scale)} \\approx ${v.toFixed(3)} \\approx ${v.toFixed(1)}`, why: 'Rounding before multiplying can change the tenths digit.' },
          ],
          misconceptions: numberMisconceptions(Rational.parse(v.toFixed(1)), [{ value: Rational.parse(Math.sqrt(n).toFixed(1)), tag: 'units', feedback: `That is the distance in grid units. Multiply by ${mp.scaleText}.` }, { value: mp.scale.mul(Math.abs(dx) + Math.abs(dy)), tag: 'formula-error', feedback: 'That is the distance along the streets. The straight-line distance uses the distance formula.' }]),
        });
      }
      const [a0, b0, c] = rng.pick(TRIPLES);
      const a = a0 * rng.pick([1, -1]);
      const b = b0 * rng.pick([1, -1]);
      const P2 = pt(mp.l2, P1.x + a, P1.y + b);
      if (!fitsGrid([P2], 12)) return genGeoContext.generate(rng, 1);
      const key = mp.scale.mul(c);
      return makeProblem({
        skillId: 'S8.06',
        tags: ['real-world', 'graph'],
        prompt: [p(`On a map, ${mp.place1} is at $${ptTex(P1)}$ and ${mp.place2} is at $${ptTex(P2)}$, and each grid unit is ${mp.scaleText}. What is the straight-line distance between them, in ${mp.unit}?`), { t: 'graph', spec: graphOf([P1, P2], [[P1, P2]], true) }],
        answer: { kind: 'number', value: numStr(key), unit: mp.unit },
        hints: ['First find the distance in grid units.', 'Use the distance formula.', `Then convert: each grid unit is ${mp.scaleText}.`, 'Multiply the number of grid units by the scale.'],
        solution: [
          { text: 'Distance in grid units.', tex: `\\sqrt{${neg(a)}^2 + ${neg(b)}^2} = \\sqrt{${c * c}} = ${c}` },
          { text: 'Convert with the scale.', tex: `${c} \\times ${numStr(mp.scale)} = ${numStr(key)}`, why: 'Each grid unit stands for the same real distance.' },
        ],
        misconceptions: numberMisconceptions(key, [{ value: Q(c), tag: 'units', feedback: `That is the distance in grid units. Multiply by ${mp.scaleText}.` }, { value: mp.scale.mul(a0 + b0), tag: 'formula-error', feedback: 'That is the distance along the streets. The straight-line distance uses the distance formula.' }]),
      });
    }
    if (difficulty === 2) {
      if (rng.bool()) {
        const P2 = pt(mp.l2, rng.int(-8, 8), rng.int(-8, 8));
        if ((P1.x + P2.x) % 2 || (P1.y + P2.y) % 2 || P1.x === P2.x || P1.y === P2.y) return genGeoContext.generate(rng, 2);
        return makeProblem({
          skillId: 'S8.06',
          tags: ['real-world'],
          prompt: [p(`Two friends want to meet halfway between ${mp.place1} at $${ptTex(P1)}$ and ${mp.place2} at $${ptTex(P2)}$ on a grid map. At what point should they meet?`)],
          answer: { kind: 'point', x: String((P1.x + P2.x) / 2), y: String((P1.y + P2.y) / 2) },
          inputHint: 'Type a point like (2, -1).',
          hints: ['Halfway between two points is their midpoint.', 'Average the x-coordinates.', 'Average the y-coordinates.', 'Write the meeting point as an ordered pair.'],
          solution: [{ text: 'Use the midpoint formula.', tex: `\\left(\\frac{${P1.x} + ${neg(P2.x)}}{2}, \\frac{${P1.y} + ${neg(P2.y)}}{2}\\right) = (${(P1.x + P2.x) / 2}, ${(P1.y + P2.y) / 2})`, why: 'The midpoint is the same distance from both places.' }],
          misconceptions: [{ answer: `(${halfStr(P2.x - P1.x)}, ${halfStr(P2.y - P1.y)})`, tag: 'formula-error', feedback: 'Add the coordinates before dividing by 2.' }] as Misconception[],
        });
      }
      // fencing or sod for a rectangular park, with a cost
      const w = rng.int(2, 8);
      const h = rng.int(2, 6);
      const ps = [pt('A', P1.x, P1.y), pt('B', P1.x + w, P1.y), pt('C', P1.x + w, P1.y + h), pt('D', P1.x, P1.y + h)];
      const s = rng.pick([5, 10, 20]);
      const fence = rng.bool();
      const price = fence ? rng.pick([Q(12), Q(15), Q(25, 2)]) : rng.pick([Q(1, 2), Q(3, 4), Q(2)]);
      const amount = fence ? 2 * (w + h) * s : w * h * s * s;
      const cost = price.mul(amount);
      return makeProblem({
        skillId: 'S8.06',
        tags: ['real-world', 'graph', 'multi-step'],
        prompt: [p(`A rectangular park $ABCD$ is drawn on a grid with vertices $${ps.map(ptTex).join('$, $')}$, and each grid unit is ${s} feet. ${fence ? `Fencing costs ${money(price)} per foot. How much does it cost to fence the whole park?` : `Sod costs ${money(price)} per square foot. How much does it cost to cover the park with sod?`}`), { t: 'graph', spec: graphOf(ps, polygonSegments(ps)) }],
        answer: { kind: 'number', value: numStr(cost), unit: 'dollars' },
        hints: ['Find the side lengths in grid units.', `Convert each side to feet: multiply by ${s}.`, fence ? 'Fencing goes around the park: find the perimeter.' : 'Sod covers the inside: find the area in square feet.', fence ? 'Multiply the perimeter by the price per foot.' : 'Multiply the area by the price per square foot.'],
        solution: [
          { text: 'Side lengths in feet.', tex: `AB = ${w} \\times ${s} = ${w * s},\\quad BC = ${h} \\times ${s} = ${h * s}`, why: 'Convert lengths first, then compute.' },
          fence ? { text: 'Perimeter.', tex: `2(${w * s}) + 2(${h * s}) = ${amount}` } : { text: 'Area.', tex: `${w * s} \\times ${h * s} = ${amount}`, why: 'Each grid square is ' + s + ' by ' + s + ' feet, which is ' + s * s + ' square feet.' },
          { text: 'Cost.', tex: `${amount} \\times ${money(price)} = ${money(cost)}` },
        ],
        misconceptions: numberMisconceptions(cost, [
          { value: price.mul(fence ? 2 * (w + h) : w * h), tag: 'units', feedback: 'Convert the grid units to feet before finding the cost.' },
          ...(fence ? [] : [{ value: price.mul(w * h * s), tag: 'units' as const, feedback: `Each grid square is ${s} feet by ${s} feet, so multiply the area by ${s * s}, not ${s}.` }]),
        ]),
      });
    }
    const pick3 = rng.int(0, 2);
    if (pick3 === 0) {
      // area of an irregular lot by the box method, with a scale
      const s = rng.pick([5, 10, 20]);
      const W = rng.int(4, 9);
      const H = rng.int(4, 8);
      const x0 = rng.int(-6, 0);
      const y0 = rng.int(-6, 0);
      const ps = [pt('A', x0 + rng.int(1, W - 1), y0), pt('B', x0 + W, y0 + rng.int(1, H - 1)), pt('C', x0 + rng.int(1, W - 1), y0 + H), pt('D', x0, y0 + rng.int(1, H - 1))];
      const corners = ps.map((u, i) => Math.abs(u.x - ps[(i + 1) % 4].x) * Math.abs(u.y - ps[(i + 1) % 4].y));
      const grid = Q(2 * W * H - corners.reduce((t, c) => t + c, 0), 2);
      const key = grid.mul(s * s);
      return makeProblem({
        skillId: 'S8.06',
        tags: ['real-world', 'graph', 'multi-step'],
        prompt: [p(`A builder draws a four-sided lot $ABCD$ on a grid with vertices $${ps.map(ptTex).join('$, $')}$, and each grid unit is ${s} meters. What is the area of the lot, in square meters?`), { t: 'graph', spec: graphOf(ps, polygonSegments(ps)) }],
        answer: { kind: 'number', value: numStr(key), unit: 'square meters' },
        hints: ['No side is horizontal or vertical, so use the box method.', 'Enclose the lot in the smallest rectangle with horizontal and vertical sides.', 'Subtract the four corner right triangles to get the area in square grid units.', `Each square grid unit is ${s} m by ${s} m, which is ${s * s} square meters.`],
        solution: [
          { text: 'Area of the box.', tex: `${W} \\times ${H} = ${W * H}`, why: 'The box runs from the smallest to the largest x and y.' },
          { text: 'Areas of the four corner triangles.', tex: corners.map((c) => `\\frac{1}{2}(${c}) = ${numStr(Q(c, 2))}`).join(',\\quad ') },
          { text: 'Subtract.', tex: `${W * H} - ${corners.map((c) => numStr(Q(c, 2))).join(' - ')} = ${numStr(grid)}`, why: 'This is the area in square grid units.' },
          { text: 'Convert with the scale.', tex: `${numStr(grid)} \\times ${s}^2 = ${numStr(grid)} \\times ${s * s} = ${numStr(key)}`, why: 'Areas scale by the square of the length scale.' },
        ],
        misconceptions: numberMisconceptions(key, [{ value: grid.mul(s), tag: 'units', feedback: `Each square grid unit is ${s} m by ${s} m, so multiply by ${s * s}, not ${s}.` }, { value: grid, tag: 'units', feedback: 'That is the area in square grid units. Convert to square meters.' }]),
      });
    }
    if (pick3 === 1) {
      // streets vs straight path
      const [a0, b0, c] = rng.pick(TRIPLES);
      const [a, b] = [a0 * rng.pick([1, -1]), b0 * rng.pick([1, -1])];
      const P2 = pt(mp.l2, P1.x + a, P1.y + b);
      if (!fitsGrid([P2], 12)) return genGeoContext.generate(rng, 3);
      const key = mp.scale.mul(a0 + b0 - c);
      return makeProblem({
        skillId: 'S8.06',
        tags: ['real-world', 'multi-step'],
        prompt: [p(`On a grid map, ${mp.place1} is at $${ptTex(P1)}$ and ${mp.place2} is at $${ptTex(P2)}$, and each grid unit is ${mp.scaleText}. The streets run only east–west and north–south. How many ${mp.unit} shorter is a straight path than walking along the streets?`), { t: 'graph', spec: graphOf([P1, P2], [[P1, P2]], true) }],
        answer: { kind: 'number', value: numStr(key), unit: mp.unit },
        hints: ['Walking along the streets means going across and then up (or down).', 'The street distance is the horizontal change plus the vertical change.', 'The straight path uses the distance formula.', 'Subtract, then convert with the scale.'],
        solution: [
          { text: 'Street distance in grid units.', tex: `${a0} + ${b0} = ${a0 + b0}`, why: 'Distances along the streets are positive, whichever direction you walk.' },
          { text: 'Straight-line distance in grid units.', tex: `\\sqrt{${neg(a)}^2 + ${neg(b)}^2} = ${c}` },
          { text: 'Difference, converted.', tex: `(${a0 + b0} - ${c}) \\times ${numStr(mp.scale)} = ${numStr(key)}`, why: 'The straight path is the hypotenuse, which is shorter than the two legs together.' },
        ],
        misconceptions: numberMisconceptions(key, [{ value: Q(a0 + b0 - c), tag: 'units', feedback: `That is in grid units. Multiply by ${mp.scaleText}.` }]),
      });
    }
    // is a new path parallel or perpendicular to a road?
    const m = rng.pick(SLOPES.filter((x) => x.den <= 2 && x.abs().num <= 3));
    const R1 = pt('R', rng.int(-6, 0), rng.int(-6, 0));
    const R2 = pt('S', R1.x + Number(m.den) * 2, R1.y + Number(m.num) * 2);
    const rel = rng.pick(['Perpendicular', 'Parallel', 'Neither'] as const);
    const m2 = rel === 'Parallel' ? m : rel === 'Perpendicular' ? Q(-1).div(m) : Q(1).div(m);
    if (rel === 'Neither' && (m2.eq(m) || m2.mul(m).eq(-1))) return genGeoContext.generate(rng, 3);
    const T1 = pt('T', R1.x + rng.int(1, 4), R1.y + rng.int(3, 6));
    const T2 = pt('U', T1.x + Number(m2.den) * 2, T1.y + Number(m2.num) * 2);
    if (!fitsGrid([R2, T1, T2], 12) || cross(vec(R1, R2), vec(R1, T1)) === 0) return genGeoContext.generate(rng, 3);
    return makeProblem({
      skillId: 'S8.06',
      tags: ['real-world', 'graph'],
      prompt: [p(`A straight road runs through $${ptTex(R1)}$ and $${ptTex(R2)}$ on a grid map. A new bike path will run through $${ptTex(T1)}$ and $${ptTex(T2)}$. How is the bike path related to the road?`), { t: 'graph', spec: graphOf([R1, R2, T1, T2], [[R1, R2], [T1, T2]]) }],
      answer: makeChoice(rng, rel, ['Parallel', 'Perpendicular', 'Neither']),
      hints: ['Find the slope of the road.', 'Find the slope of the bike path.', 'Equal slopes: parallel.', 'Slopes that multiply to −1: perpendicular.'],
      solution: [
        { text: 'Slope of the road.', tex: `\\frac{${R2.y} - ${neg(R1.y)}}{${R2.x} - ${neg(R1.x)}} = ${m.toTex()}` },
        { text: 'Slope of the path.', tex: `\\frac{${T2.y} - ${neg(T1.y)}}{${T2.x} - ${neg(T1.x)}} = ${m2.toTex()}` },
        { text: `${rel}.`, why: rel === 'Parallel' ? 'The slopes are equal.' : rel === 'Perpendicular' ? 'The slopes multiply to −1.' : 'The slopes are not equal and do not multiply to −1.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const ps = readPts(pr);
    const text = textAll(pr);
    const label = labelOf(pr);
    if (/bike path/.test(text)) {
      const [R, S, T, U] = ['R', 'S', 'T', 'U'].map((k) => ps.get(k)!);
      const u = vec(R, S);
      const v = vec(T, U);
      return label === (cross(u, v) === 0 ? 'Parallel' : dot(u, v) === 0 ? 'Perpendicular' : 'Neither') ? [] : ['path relation wrong'];
    }
    if (/meet halfway/.test(text)) {
      const [P1, P2] = [...ps.values()];
      if (pr.answer.kind !== 'point') return ['kind'];
      const M = { x: Number(pr.answer.x), y: Number(pr.answer.y) };
      return d2(P1, M) === d2(P2, M) && cross(vec(P1, P2), vec(P1, M)) === 0 ? [] : ['meeting point wrong'];
    }
    if (pr.answer.kind !== 'number') return ['kind'];
    const got = Rational.parse(pr.answer.value);
    if (/four-sided lot/.test(text)) {
      const order = ['A', 'B', 'C', 'D'].map((k) => ps.get(k)!);
      const s = Number(/each grid unit is (\d+) meters/.exec(text)![1]);
      return Math.abs(got.toNumber() - (Math.abs(shoelace2(order)) / 2) * s * s) < 1e-9 ? [] : ['lot area wrong'];
    }
    if (/rectangular park/.test(text)) {
      const order = ['A', 'B', 'C', 'D'].map((k) => ps.get(k)!);
      const s = Number(/each grid unit is (\d+) feet/.exec(text)![1]);
      const price = Rational.parse(/\\\$([\d.]+) per/.exec(text)![1]);
      const per = order.reduce((acc, a, i) => acc + Math.sqrt(d2(a, order[(i + 1) % 4])), 0) * s;
      const area = (Math.abs(shoelace2(order)) / 2) * s * s;
      const want = /fence/.test(text) ? per : area;
      return Math.abs(got.toNumber() - price.toNumber() * want) < 1e-9 ? [] : ['cost wrong'];
    }
    const [P1, P2] = [...ps.values()];
    const sc = scaleOf(text).toNumber();
    const straight = Math.sqrt(d2(P1, P2));
    if (/shorter is a straight path/.test(text)) return Math.abs(got.toNumber() - sc * (Math.abs(P2.x - P1.x) + Math.abs(P2.y - P1.y) - straight)) < 1e-9 ? [] : ['difference wrong'];
    return Math.abs(got.toNumber() - sc * straight) < 1e-9 ? [] : ['distance wrong'];
  },
};

export const U8_GENERATORS: GeneratorDef[] = [genDistance, genMidpoint, genParallelPerp, genPerimArea, genClassify, genGeoContext];
