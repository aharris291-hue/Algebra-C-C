/**
 * Unit 2, Lesson 4 generators.
 * S2.05 solutions of systems of linear inequalities (test points, find a point in the region).
 * S2.06 model a situation with a system of inequalities and reason about it.
 */
import type { GeneratorDef, Rng, GraphSpec, Block } from '../../core/curriculum/types';
import { toPoly } from '../../core/math/poly';
import { parseExpression } from '../../core/math/parser';
import { Rational } from '../../core/math/rational';
import { linearTex, linearPlain, coefTex } from '../../core/math/format';
import { Q, p, makeProblem, numStr, money, makeChoice, choiceLabel, numberMisconceptions, stringMisconceptions } from './util';
import { Op, OP_TEX, FLIP_OP, isStrict, isGreater, relTexToPlain, holds, latticeSolutions, ptTex } from './u2-common';
import { buildSystem, systemText, SysInstance, SYS_CONTEXTS, countOf, ifThereAre } from './u2-contexts';

interface Line {
  m: Rational;
  b: Rational;
  op: Op;
}

const lineTex = (l: Line) => `y ${OP_TEX[l.op]} ${linearTex(l.m, l.b)}`;
const linePlain = (l: Line) => `y ${l.op} ${linearPlain(l.m, l.b)}`;

/** Two boundary lines crossing at a lattice point near the origin, each with its own symbol. */
function pickSystem(rng: Rng): [Line, Line] {
  for (;;) {
    const h = rng.int(-3, 3);
    const k = rng.int(-3, 3);
    const m1 = rng.nonzeroInt(-3, 3);
    let m2 = rng.int(-3, 3);
    while (m2 === m1) m2 = rng.int(-3, 3);
    const b1 = k - m1 * h;
    const b2 = k - m2 * h;
    if (Math.abs(b1) > 7 || Math.abs(b2) > 7) continue;
    const ops: Op[] = ['<', '>', '<=', '>='];
    return [
      { m: Q(m1), b: Q(b1), op: rng.pick(ops) },
      { m: Q(m2), b: Q(b2), op: rng.pick(ops) },
    ];
  }
}

function systemGraph(lines: Line[]): GraphSpec {
  return {
    xMin: -8,
    xMax: 8,
    yMin: -8,
    yMax: 8,
    inequalities: lines.map((l, i) => ({ boundary: linearPlain(l.m, l.b), side: isGreater(l.op) ? 'above' : 'below', strict: isStrict(l.op), color: i === 0 ? '#3557d4' : '#d4572f' })),
    ariaLabel: `Two shaded inequalities: ${lines.map((l) => `a ${isStrict(l.op) ? 'dashed' : 'solid'} line y = ${linearPlain(l.m, l.b)} shaded ${isGreater(l.op) ? 'above' : 'below'}`).join(', and ')}. The solution region is where the shading overlaps.`,
  };
}

const systemTex = (lines: Line[]) => `\\begin{cases} ${lines.map(lineTex).join(' \\\\ ')} \\end{cases}`;

/** Parse a cases block back into plain relations. */
function parseCases(tex: string): string[] {
  const m = /\\begin\{cases\}(.+)\\end\{cases\}/.exec(tex);
  if (!m) return [];
  return m[1].split('\\\\').map((s) => relTexToPlain(s.trim()));
}

function sideOf(l: Line): string {
  return `${isStrict(l.op) ? 'dashed' : 'solid'} line, shaded ${isGreater(l.op) ? 'above' : 'below'}`;
}

// ---------------------------------------------------------------------------
// S2.05: which point is a solution of the system?
// ---------------------------------------------------------------------------

export const genSystemTest: GeneratorDef = {
  id: 'u2.system-test',
  skillId: 'S2.05',
  description: 'Decide which point is a solution of a system of two linear inequalities.',
  generate(rng, difficulty) {
    if ((difficulty === 2 && rng.next() < 0.3) || (difficulty === 3 && rng.next() < 0.35)) return quadrantGraphChoice(rng, difficulty);
    const lines = pickSystem(rng);
    const rels = lines.map(linePlain);
    const pts: Array<{ x: number; y: number; s1: boolean; s2: boolean; on1: boolean; on2: boolean }> = [];
    const onLine = (l: Line, x: number, y: number) => l.m.mul(Q(x)).add(l.b).eq(Q(y));
    for (let x = -6; x <= 6; x++) for (let y = -7; y <= 7; y++) pts.push({ x, y, s1: holds(rels[0], x, y), s2: holds(rels[1], x, y), on1: onLine(lines[0], x, y), on2: onLine(lines[1], x, y) });
    const both = pts.filter((q) => q.s1 && q.s2 && !q.on1 && !q.on2);
    const only1 = pts.filter((q) => q.s1 && !q.s2 && !q.on1 && !q.on2);
    const only2 = pts.filter((q) => !q.s1 && q.s2 && !q.on1 && !q.on2);
    const neither = pts.filter((q) => !q.s1 && !q.s2 && !q.on1 && !q.on2);
    // a point on a dashed boundary that satisfies the other inequality: looks right, is not
    const dashedTrap = pts.filter((q) => (q.on1 && isStrict(lines[0].op) && q.s2 && !q.on2) || (q.on2 && isStrict(lines[1].op) && q.s1 && !q.on1));
    if (!both.length || !only1.length || !only2.length) return genSystemTest.generate(rng, difficulty);
    const correct = rng.pick(both);
    const fourth = difficulty >= 2 && dashedTrap.length ? rng.pick(dashedTrap) : neither.length ? rng.pick(neither) : null;
    if (!fourth) return genSystemTest.generate(rng, difficulty);
    const distractors = [rng.pick(only1), rng.pick(only2), fourth];
    const showGraph = difficulty < 3;
    const prompt: Block[] = [p(`Which point is a solution of this system?`), { t: 'math', tex: systemTex(lines) }];
    if (showGraph) prompt.push({ t: 'graph', spec: systemGraph(lines), caption: 'Blue shows the first inequality and orange shows the second.' });
    const all = [correct, ...distractors];
    const answer = makeChoice(rng, ptTex(correct.x, correct.y), distractors.map((d) => ptTex(d.x, d.y)));
    const check = (q: { x: number; y: number }) => {
      const r = lines.map((l) => {
        const rhs = l.m.mul(Q(q.x)).add(l.b);
        return `$${q.y} ${OP_TEX[l.op]} ${rhs.toTex()}$ is ${holds(linePlain(l), q.x, q.y) ? 'true' : 'false'}`;
      });
      return { text: `Test ${ptTex(q.x, q.y)}: ${r[0]}; ${r[1]}.`, why: holds(rels[0], q.x, q.y) && holds(rels[1], q.x, q.y) ? 'Both are true, so this point is a solution of the system.' : 'A solution of a system must make **both** inequalities true.' };
    };
    return makeProblem({
      skillId: 'S2.05',
      tags: showGraph ? ['graph'] : [],
      prompt,
      answer,
      hints: [
        'A solution of a system must make **every** inequality in it true.',
        showGraph ? 'On the graph, solutions are in the region where both shadings overlap.' : 'Substitute each point into both inequalities.',
        'A point on a dashed line is **not** a solution of that inequality. A point on a solid line is.',
        'Check each point in both inequalities. Only one point passes both tests.',
      ],
      solution: [...answer.options.map((o) => check(all.find((q) => ptTex(q.x, q.y) === o.label)!)), { text: `The solution is ${ptTex(correct.x, correct.y)}.`, why: 'It is the only option that makes both inequalities true.' }],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    if (pr.prompt.some((b) => b.t === 'p' && /^Which graph shows/.test(b.text))) return verifyQuadrantGraphChoice(pr);
    const m = pr.prompt.find((b) => b.t === 'math') as { tex: string } | undefined;
    const rels = parseCases(m?.tex ?? '');
    if (rels.length !== 2) return ['cannot parse system'];
    const pt = (lab: string) => {
      const q = /^\$\((-?\d+), (-?\d+)\)\$$/.exec(lab)!;
      return [Number(q[1]), Number(q[2])] as const;
    };
    const good = pr.answer.options.filter((o) => rels.every((r) => holds(r, ...pt(o.label))));
    const errs: string[] = [];
    if (good.length !== 1 || good[0].id !== pr.answer.correct) errs.push(`${good.length} options satisfy the system`);
    return errs;
  },
};


// ---------------------------------------------------------------------------
// S2.05 / A.PAR.4.3: which graph shows a constraint together with x >= 0 and y >= 0?
// ---------------------------------------------------------------------------

const GRAPH_LETTERS = ['A', 'B', 'C', 'D'] as const;

/** A grid step that gives about 8 to 12 grid lines up to m. */
function niceStep(m: number): number {
  return m <= 10 ? 1 : m <= 22 ? 2 : m <= 55 ? 5 : 10;
}

/** A first-quadrant window (width/height near 1.27) that shows both intercepts. */
function quadrantWindow(xi: number, yi: number, xLabel?: string, yLabel?: string) {
  const step = niceStep(Math.max(xi, yi));
  const yMax = Math.ceil((Math.max(yi, xi / 1.27) * 1.1) / step) * step + step;
  const xMax = Math.round(((yMax + step) * 1.27) / step) * step - step;
  return { xMin: -step, xMax, yMin: -step, yMax, xStep: step, yStep: step, ...(xLabel ? { xLabel, yLabel } : {}) };
}

interface QuadGraph {
  /** line through (xi, 0) and (0, yi) */
  xi: number;
  yi: number;
  above: boolean;
  strict: boolean;
}

function quadSpec(g: QuadGraph, win: ReturnType<typeof quadrantWindow>, letter: string): GraphSpec {
  const boundary = linearPlain(Q(-g.yi, g.xi), Q(g.yi));
  return {
    ...win,
    inequalities: [
      { boundary, side: g.above ? 'above' : 'below', strict: g.strict, color: '#3557d4' },
      { boundary: '0', side: 'above', strict: false, color: '#8a8f98' },
    ],
    verticalInequalities: [{ x: 0, side: 'right', strict: false, color: '#8a8f98' }],
    ariaLabel: `Graph ${letter}: a ${g.strict ? 'dashed' : 'solid'} line through (${g.xi}, 0) and (0, ${g.yi}), shaded ${g.above ? 'above' : 'below'} the line, together with x at least 0 and y at least 0, so only the first quadrant is shaded.`,
  };
}

function quadrantGraphChoice(rng: Rng, difficulty: number) {
  const context = difficulty === 3;
  let xi: number;
  let yi: number;
  let A: number;
  let B: number;
  let C: number;
  let op: Op;
  let intro: Block[];
  let xLabel: string | undefined;
  let yLabel: string | undefined;
  let moneyWhat = '';
  if (context) {
    const ctx = rng.pick(SYS_CONTEXTS);
    A = rng.int(ctx.a[0], ctx.a[1]);
    B = rng.int(ctx.b[0], ctx.b[1]);
    while (B === A) B = rng.int(ctx.b[0], ctx.b[1]);
    // T a common multiple of both prices, so both intercepts are whole numbers
    const ks: number[] = [];
    // a realistic total for the situation (a theater show brings in hundreds of dollars)
    const minTotal = ctx.key === 'theater' ? 200 : ctx.key === 'jobs' ? 100 : 20;
    for (let k = 1; k <= 30; k++) if (B * k <= 60 && A * k <= 60 && Math.min(A, B) * k >= 3 && A * B * k >= minTotal) ks.push(k);
    if (!ks.length) return quadrantGraphChoice(rng, difficulty);
    const k = rng.pick(ks);
    C = A * B * k;
    xi = C / A;
    yi = C / B;
    op = ctx.moneyOp;
    xLabel = ctx.xNoun;
    yLabel = ctx.yNoun;
    moneyWhat = ctx.moneyWhat;
    intro = [p(`${ctx.moneyText(money(A), money(B), money(C))} Let $x$ be the number of ${ctx.xNoun} and $y$ the number of ${ctx.yNoun}. Neither number can be negative.`), p('Which graph shows the solution region for this situation?')];
  } else {
    xi = rng.int(2, 9);
    yi = rng.int(2, 9);
    while (yi === xi) yi = rng.int(2, 9);
    const g = gcdInt(xi, yi);
    A = yi / g;
    B = xi / g;
    C = (xi * yi) / g;
    op = rng.pick(['<', '<=', '>', '>='] as Op[]);
    intro = [p('Which graph shows the solution region of this system?'), { t: 'math', tex: `\\begin{cases} ${coefTex(Q(A))}x + ${coefTex(Q(B))}y ${OP_TEX[op]} ${C} \\\\ x \\ge 0 \\\\ y \\ge 0 \\end{cases}` }];
  }
  const above = isGreater(op);
  const strict = isStrict(op);
  const correct: QuadGraph = { xi, yi, above, strict };
  const wrongSide: QuadGraph = { ...correct, above: !above };
  const wrongLine: QuadGraph = { ...correct, strict: !strict };
  const swapped: QuadGraph = { ...correct, xi: yi, yi: xi };
  const order = rng.shuffle([0, 1, 2, 3]);
  const graphs = [correct, wrongSide, wrongLine, swapped];
  const win = quadrantWindow(Math.max(xi, yi), Math.max(xi, yi), xLabel, yLabel);
  const blocks: Block[] = order.map((gi, slot) => ({ t: 'graph', spec: quadSpec(graphs[gi], win, GRAPH_LETTERS[slot]), caption: `Graph ${GRAPH_LETTERS[slot]}` }));
  const slotOf = (gi: number) => GRAPH_LETTERS[order.indexOf(gi)];
  const answer = { kind: 'choice' as const, options: GRAPH_LETTERS.map((L, i) => ({ id: 'abcd'[i], label: `Graph ${L}` })), correct: 'abcd'[order.indexOf(0)] };
  const lhsTex = `${coefTex(Q(A))}x + ${coefTex(Q(B))}y`;
  const zeroTrue = holds(`${A}x + ${B}y ${op} ${C}`, 0, 0);
  return makeProblem({
    skillId: 'S2.05',
    tags: context ? ['graph', 'real-world', 'word'] : ['graph'],
    prompt: [...intro, ...blocks],
    answer,
    hints: [
      context ? `First write the inequality: the ${moneyWhat} is (price times how many) for each item, added together. Counts cannot be negative, so also $x \\ge 0$ and $y \\ge 0$.` : 'Graph each inequality and look for the overlap. $x \\ge 0$ and $y \\ge 0$ together keep only the first quadrant.',
      'Find where the boundary line crosses each axis: set $y = 0$ to find the $x$-intercept, and set $x = 0$ to find the $y$-intercept.',
      'A symbol with "or equal to" ($\\le$, $\\ge$) gives a solid line; $<$ or $>$ gives a dashed line.',
      'Test the point $(0, 0)$ in the inequality. If it makes the inequality true, the shading is on the side of the line that contains the origin.',
    ],
    solution: [
      { text: 'Write the system.', tex: `${lhsTex} ${OP_TEX[op]} ${C},\\quad x \\ge 0,\\quad y \\ge 0`, why: context ? 'Each item adds its price times how many, and a count can never be negative.' : 'These are the three inequalities to graph on one grid.' },
      { text: 'Find the intercepts of the boundary line.', tex: `y = 0:\\ ${coefTex(Q(A))}x = ${C} \\Rightarrow x = ${xi}; \\qquad x = 0:\\ ${coefTex(Q(B))}y = ${C} \\Rightarrow y = ${yi}`, why: `So the line goes through $(${xi}, 0)$ and $(0, ${yi})$. Graph ${slotOf(3)} uses a line through $(${yi}, 0)$ and $(0, ${xi})$ instead: the intercepts are switched.` },
      { text: `The symbol is $${OP_TEX[op]}$, so the line is ${strict ? 'dashed' : 'solid'}.`, why: `${strict ? 'Points on the line are not solutions.' : 'Points on the line are solutions.'} Graph ${slotOf(2)} draws it ${strict ? 'solid' : 'dashed'}, which is wrong.` },
      { text: 'Test $(0, 0)$ to choose the side.', tex: `${A}(0) + ${B}(0) = 0 ${OP_TEX[op]} ${C}\\ \\text{is ${zeroTrue ? 'true' : 'false'}}`, why: `So shade the side of the line ${zeroTrue ? 'that contains' : 'away from'} the origin, which is ${above ? 'above' : 'below'} the line. Graph ${slotOf(1)} shades the wrong side.` },
      { text: `The answer is Graph ${slotOf(0)}.`, why: '$x \\ge 0$ and $y \\ge 0$ keep only the first quadrant, so the solution region is the part of that side of the line in the first quadrant.' },
    ],
    misconceptions: [],
  });
}

function gcdInt(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcdInt(b, a % b);
}

/** Is (x, y) in the shaded overlap of a graph spec? Read only from the spec. */
function inShaded(spec: GraphSpec, x: Rational, y: Rational): boolean {
  for (const q of spec.inequalities ?? []) {
    const yb = toPoly(parseExpression(q.boundary)).evaluate({ x });
    const c = y.sub(yb);
    if (c.isZero()) {
      if (q.strict) return false;
    } else if (c.isNegative() !== (q.side === 'below')) return false;
  }
  for (const v of spec.verticalInequalities ?? []) {
    const c = x.sub(Q(v.x));
    if (c.isZero()) {
      if (v.strict) return false;
    } else if (c.isNegative() !== (v.side === 'left')) return false;
  }
  return true;
}

function verifyQuadrantGraphChoice(pr: Parameters<GeneratorDef['verify']>[0]): string[] {
  if (pr.answer.kind !== 'choice') return ['unexpected kind'];
  let rels: string[];
  const m = pr.prompt.find((b) => b.t === 'math') as { tex: string } | undefined;
  if (m) rels = parseCases(m.tex);
  else {
    const text = (pr.prompt[0] as { text: string }).text.replace(/\*\*/g, '');
    const nums = [...text.matchAll(/(\d+(?:\.\d+)?)/g)].map((q) => q[1]);
    if (nums.length < 3) return ['cannot read numbers'];
    const [a, b, t] = nums;
    const op = /at most/.test(text) ? '<=' : /at least/.test(text) ? '>=' : null;
    if (!op) return ['no phrase'];
    rels = [`${a}x + ${b}y ${op} ${t}`, 'x >= 0', 'y >= 0'];
  }
  if (rels.length !== 3) return ['cannot parse system'];
  const graphs = pr.prompt.filter((b): b is Extract<Block, { t: 'graph' }> => b.t === 'graph');
  if (graphs.length !== 4) return ['expected 4 graphs'];
  // the boundary of the first relation, for exact on-line probes
  const [lhs, rhs] = rels[0].split(/<=|>=|<|>/);
  const poly = toPoly(parseExpression(lhs)).sub(toPoly(parseExpression(rhs)));
  const c0 = poly.evaluate({ x: Q(0), y: Q(0) });
  const cy = poly.evaluate({ x: Q(0), y: Q(1) }).sub(c0);
  const cx = poly.evaluate({ x: Q(1), y: Q(0) }).sub(c0);
  const matches = graphs.map((g) => {
    const sp = g.spec;
    const step = sp.xStep ?? 1;
    const probes: Array<[Rational, Rational]> = [];
    for (let x = sp.xMin; x <= sp.xMax; x += step / 2) {
      for (let y = sp.yMin; y <= sp.yMax; y += step / 2) probes.push([Q(Math.round(x * 2), 2), Q(Math.round(y * 2), 2)]);
      // a point exactly on the target boundary
      probes.push([Q(Math.round(x * 2), 2), c0.add(cx.mul(Q(Math.round(x * 2), 2))).neg().div(cy)]);
    }
    return probes.every(([x, y]) => rels.every((r) => holds(r, x, y)) === inShaded(sp, x, y));
  });
  const errs: string[] = [];
  const hits = matches.map((ok, i) => (ok ? i : -1)).filter((i) => i >= 0);
  if (hits.length !== 1) errs.push(`${hits.length} graphs match the system`);
  else {
    const cap = graphs[hits[0]].caption ?? '';
    const lab = choiceLabel(pr.answer);
    if (cap !== lab) errs.push(`matching graph is ${cap}, key is ${lab}`);
  }
  // every graph is labeled, and the options name them in order
  graphs.forEach((g, i) => {
    if (g.caption !== `Graph ${GRAPH_LETTERS[i]}`) errs.push('graph captions out of order');
  });
  return errs;
}

// ---------------------------------------------------------------------------
// S2.05: give any point in the solution region
// ---------------------------------------------------------------------------

export const genSystemPoint: GeneratorDef = {
  id: 'u2.system-point',
  skillId: 'S2.05',
  description: 'Name a point that is a solution of a system of two linear inequalities; any correct point is accepted.',
  generate(rng, difficulty) {
    const lines = pickSystem(rng);
    const rels = lines.map(linePlain);
    const inside = latticeSolutions(rels, 6, true);
    if (inside.length < 3) return genSystemPoint.generate(rng, difficulty);
    const ex = inside[0];
    const showGraph = difficulty < 3;
    const prompt: Block[] = [p('Give one point that is a solution of this system.'), { t: 'math', tex: systemTex(lines) }];
    if (showGraph) prompt.push({ t: 'graph', spec: systemGraph(lines), caption: 'Blue shows the first inequality and orange shows the second.' });
    const exCheck = lines.map((l) => `$${ex.y} ${OP_TEX[l.op]} ${l.m.mul(Q(ex.x)).add(l.b).toTex()}$`).join(' and ');
    return makeProblem({
      skillId: 'S2.05',
      tags: showGraph ? ['graph'] : [],
      prompt,
      answer: { kind: 'region-point', constraints: rels, example: { x: String(ex.x), y: String(ex.y) } },
      inputHint: 'Type a point like (2, -1). Any point that works is correct.',
      hints: [
        'A solution must make **both** inequalities true.',
        showGraph ? 'Look for the region where the two shadings overlap, and pick a grid point inside it, away from the lines.' : 'Sketch both boundary lines, or try a simple point such as $(0, 0)$ in both inequalities and adjust.',
        `The first line is ${sideOf(lines[0])}; the second is ${sideOf(lines[1])}.`,
        'Before you answer, substitute your point into both inequalities. Avoid points on a dashed line.',
      ],
      solution: [
        { text: 'Find the overlap.', why: `Solutions of the first inequality are ${isGreater(lines[0].op) ? 'above' : 'below'} its line; solutions of the second are ${isGreater(lines[1].op) ? 'above' : 'below'} its line. The system's solutions are where both are true.` },
        { text: `One point that works is ${ptTex(ex.x, ex.y)}. Many other points work too.`, why: `Check: ${exCheck} are both true.` },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'region-point') return ['unexpected kind'];
    const m = pr.prompt.find((b) => b.t === 'math') as { tex: string } | undefined;
    const rels = parseCases(m?.tex ?? '');
    const errs: string[] = [];
    if (rels.length !== 2) return ['cannot parse'];
    // the accepted constraints are exactly the displayed ones
    for (let x = -8; x <= 8; x += 2) for (let y = -8; y <= 8; y += 2) if (rels.every((r) => holds(r, x, y)) !== pr.answer.constraints.every((r) => holds(r, x, y))) errs.push(`constraints differ at (${x}, ${y})`);
    const ex = pr.answer.example;
    if (!rels.every((r) => holds(r, Number(ex.x), Number(ex.y)))) errs.push('example is not a solution');
    return errs.slice(0, 1);
  },
};

// ---------------------------------------------------------------------------
// S2.06: model a situation with a system
// ---------------------------------------------------------------------------

function sysTex(s: SysInstance): { count: string; moneyT: string } {
  return { count: `x + y ${OP_TEX[s.ctx.countOp]} ${s.n}`, moneyT: `${coefTex(s.a)}x + ${coefTex(s.b)}y ${OP_TEX[s.ctx.moneyOp]} ${s.t.toTex()}` };
}

const pairLabel = (c: string, m: string) => `$${c}$ and $${m}$`;

export const genModelSystem: GeneratorDef = {
  id: 'u2.model-system',
  skillId: 'S2.06',
  description: 'Write a system of inequalities for a situation with a count limit and a money goal or budget.',
  generate(rng, difficulty) {
    const s = buildSystem(rng);
    const { ctx } = s;
    const tx = sysTex(s);
    const setup = p(`${systemText(s)} Let $x$ be the number of ${ctx.xNoun} and $y$ the number of ${ctx.yNoun}.`);
    const countHelp = `The count of ${ctx.countWhat} is $x + y$, and "${ctx.countOp === '<=' ? 'at most' : 'at least'}" means $${OP_TEX[ctx.countOp]}$.`;
    const moneyHelp = `The ${ctx.moneyWhat} is $${coefTex(s.a)}x + ${coefTex(s.b)}y$ (price times how many, for each kind), and "${ctx.moneyOp === '<=' ? 'at most' : 'at least'}" means $${OP_TEX[ctx.moneyOp]}$.`;
    if (difficulty === 1) {
      const flipC = `x + y ${OP_TEX[FLIP_OP[ctx.countOp]]} ${s.n}`;
      const flipM = `${coefTex(s.a)}x + ${coefTex(s.b)}y ${OP_TEX[FLIP_OP[ctx.moneyOp]]} ${s.t.toTex()}`;
      const swapNums = `x + y ${OP_TEX[ctx.moneyOp]} ${s.t.toTex()}`;
      const swapNums2 = `${coefTex(s.a)}x + ${coefTex(s.b)}y ${OP_TEX[ctx.countOp]} ${s.n}`;
      const correct = pairLabel(tx.count, tx.moneyT);
      return makeProblem({
        skillId: 'S2.06',
        tags: ['real-world', 'word'],
        prompt: [setup, p('Which system models this situation?')],
        answer: makeChoice(rng, correct, [pairLabel(flipC, tx.moneyT), pairLabel(tx.count, flipM), pairLabel(swapNums, swapNums2)]),
        hints: ['There are two limits: one on **how many** and one on **money**.', countHelp, moneyHelp, 'Check that each number is compared with the right total and that each symbol matches its phrase.'],
        solution: [
          { text: 'Count constraint.', tex: tx.count, why: countHelp },
          { text: 'Money constraint.', tex: tx.moneyT, why: moneyHelp },
          { text: `The system is ${correct}.`, why: 'Both conditions must be true at the same time, so they form a system.' },
        ],
        misconceptions: [],
      });
    }
    if (difficulty === 2) {
      const askMoney = rng.bool();
      const value = askMoney ? s.moneyRel : s.countRel;
      const wrong = askMoney ? `${numStr(s.b)}x + ${numStr(s.a)}y ${ctx.moneyOp} ${numStr(s.t)}` : `x + y ${ctx.countOp} ${numStr(s.t)}`;
      return makeProblem({
        skillId: 'S2.06',
        tags: ['real-world', 'word'],
        prompt: [setup, p(`Write the inequality for the **${askMoney ? ctx.moneyWhat : ctx.countWhat}**.`)],
        answer: { kind: 'inequality', value },
        inputHint: 'Type an inequality using x and y.',
        hints: [askMoney ? 'Multiply each price by how many of that item.' : 'Add the two amounts to get the total count.', askMoney ? moneyHelp : countHelp, 'Look for the phrase that sets the limit: "at most" or "at least".', 'Put the total on the left and the limit on the right.'],
        solution: [{ text: askMoney ? 'The money part.' : 'The count part.', tex: askMoney ? tx.moneyT : tx.count, why: askMoney ? moneyHelp : countHelp }],
        misconceptions: stringMisconceptions(value, [{ answer: wrong, tag: 'equation-setup', feedback: askMoney ? 'Match each price with its own variable.' : `The count is compared with $${s.n}$, not with the money amount.` }]),
      });
    }
    // a possible whole-number combination
    const rels = [s.countRel, s.moneyRel, 'x >= 0', 'y >= 0'];
    const sols: Array<{ x: number; y: number }> = [];
    const A = s.a.toNumber();
    const B = s.b.toNumber();
    const T = s.t.toNumber();
    const meets = (x: number, y: number) => (s.ctx.countOp === '<=' ? x + y <= s.n : x + y >= s.n) && (s.ctx.moneyOp === '<=' ? A * x + B * y <= T : A * x + B * y >= T);
    for (let x = 0; x <= s.n * 2; x++) for (let y = 0; y <= s.n * 2; y++) if (meets(x, y)) sols.push({ x, y });
    if (!sols.length) return genModelSystem.generate(rng, 2);
    // prefer a combination that uses both items
    const slack = (q: { x: number; y: number }) => Math.min(Math.abs(q.x + q.y - s.n), Math.abs(A * q.x + B * q.y - T) / Math.max(A, B));
    const ex = sols.filter((q) => q.x > 0 && q.y > 0).sort((u, v) => slack(v) - slack(u))[0] ?? sols[0];
    return makeProblem({
      skillId: 'S2.06',
      tags: ['real-world', 'word', 'multi-step'],
      prompt: [setup, p(`Give one possible combination $(x, y)$ that meets both conditions.`)],
      answer: { kind: 'region-point', constraints: rels, example: { x: String(ex.x), y: String(ex.y) }, wholeNumbers: true },
      inputHint: 'Type a point like (10, 5). Any combination that works is correct.',
      hints: ['Write the two inequalities first: one for the count and one for the money.', countHelp, moneyHelp, 'Pick whole numbers, then check them in both inequalities before you answer.'],
      solution: [
        { text: 'Write the system.', tex: `${tx.count},\\quad ${tx.moneyT},\\quad x \\ge 0,\\ y \\ge 0`, why: 'Counts cannot be negative and must be whole numbers.' },
        { text: `Try ${ptTex(ex.x, ex.y)}.`, tex: `${ex.x} + ${ex.y} = ${ex.x + ex.y},\\quad ${s.a.toTex()}(${ex.x}) + ${s.b.toTex()}(${ex.y}) = ${s.a.mul(Q(ex.x)).add(s.b.mul(Q(ex.y))).toTex()}`, why: 'Both conditions hold, so this combination works. Many others work too.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    const text = (pr.prompt[0] as { text: string }).text.replace(/\*\*/g, '');
    const nums = [...text.matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]));
    const [a, b, n, t] = nums;
    // phrases appear count first, then money
    const atMost = text.indexOf('at most');
    const atLeast = text.indexOf('at least');
    const countOp: Op = atMost < atLeast ? '<=' : '>=';
    const moneyOp: Op = countOp === '<=' ? '>=' : '<=';
    const count = `x + y ${countOp} ${n}`;
    const moneyR = `${a}x + ${b}y ${moneyOp} ${t}`;
    const errs: string[] = [];
    const same = (r1: string, r2: string) => {
      const st = Math.max(3, Math.floor(n / 8));
      for (let x = 0; x <= 2 * n; x += st) for (let y = 0; y <= 2 * n; y += st) if (holds(r1, x, y) !== holds(r2, x, y)) return false;
      return true;
    };
    if (pr.answer.kind === 'choice') {
      const lab = choiceLabel(pr.answer);
      const parts = [...lab.matchAll(/\$(.+?)\$/g)].map((m) => relTexToPlain(m[1]));
      if (!(same(parts[0], count) && same(parts[1], moneyR))) errs.push('chosen system wrong');
    } else if (pr.answer.kind === 'inequality') {
      const q = (pr.prompt[1] as { text: string }).text;
      const isMoney = SYS_CONTEXTS.some((c) => q.includes(c.moneyWhat));
      if (!same(pr.answer.value, isMoney ? moneyR : count)) errs.push('inequality wrong');
    } else if (pr.answer.kind === 'region-point') {
      const ex = pr.answer.example;
      const x = Number(ex.x);
      const y = Number(ex.y);
      if (!(holds(count, x, y) && holds(moneyR, x, y) && x >= 0 && y >= 0)) errs.push('example fails');
      if (!same(pr.answer.constraints[0], count) || !same(pr.answer.constraints[1], moneyR)) errs.push('constraints differ');
    }
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S2.06: greatest or least whole number of one item, given the other
// ---------------------------------------------------------------------------

export const genMaxInContext: GeneratorDef = {
  id: 'u2.max-in-context',
  skillId: 'S2.06',
  description: 'Use both constraints of a system to find the greatest or least whole number of one item, or find the corner of a graphed solution region that gives the greatest profit.',
  generate(rng, difficulty) {
    if ((difficulty === 2 && rng.next() < 0.3) || (difficulty === 3 && rng.next() < 0.45)) return cornerProfit(rng, difficulty);
    const s = buildSystem(rng);
    const { ctx } = s;
    const rels = [s.countRel, s.moneyRel];
    // pick X so that some y works and the answer comes from a real calculation
    for (let guard = 0; guard < 60; guard++) {
      const X = rng.int(1, s.n - 1);
      const ys: number[] = [];
      for (let y = 0; y <= 3 * s.n; y++) if (rels.every((r) => holds(r, X, y))) ys.push(y);
      if (!ys.length) continue;
      // with a lower and an upper bound both present, ask either; otherwise ask the bounded side
      const maxY = ys[ys.length - 1];
      const minY = ys[0];
      const hasMax = maxY < 3 * s.n;
      const hasMin = minY > 0;
      let ask: 'greatest' | 'least';
      if (hasMax && hasMin) ask = difficulty === 1 ? 'greatest' : rng.pick(['greatest', 'least'] as const);
      else if (hasMax) ask = 'greatest';
      else if (hasMin) ask = 'least';
      else continue;
      const y = ask === 'greatest' ? maxY : minY;
      // the two bounds on y from each constraint
      const countBound = Q(s.n - X);
      const moneyBound = s.t.sub(s.a.mul(Q(X))).div(s.b);
      const cOp = ctx.countOp;
      const mOp = ctx.moneyOp;
      const bTex = (v: Rational) => (v.isInteger() ? v.toTex() : `${v.toTex()} \\approx ${v.round(2).toDecimalString(2)}`);
      const showSystem = difficulty < 3;
      const prompt: Block[] = [p(`${systemText(s)} Let $x$ be the number of ${ctx.xNoun} and $y$ the number of ${ctx.yNoun}.`)];
      if (showSystem) prompt.push(p(`The system is $${sysTex(s).count}$ and $${sysTex(s).moneyT}$.`));
      prompt.push(p(`${ifThereAre(ctx, X)}, what is the **${ask}** number of ${ctx.yNoun} that meets both conditions?`));
      const other = ask === 'greatest' ? y + 1 : y - 1;
      return makeProblem({
        skillId: 'S2.06',
        tags: ['real-world', 'word', 'multi-step'],
        prompt,
        answer: { kind: 'number', value: String(y) },
        inputHint: 'Type a whole number.',
        hints: [
          `Substitute $x = ${X}$ into ${showSystem ? 'both inequalities' : 'the count condition and the money condition'}.`,
          `The count condition becomes $${X} + y ${OP_TEX[cOp]} ${s.n}$, so $y ${OP_TEX[cOp]} ${s.n - X}$.`,
          `The money condition becomes $${s.a.mul(Q(X)).toTex()} + ${coefTex(s.b)}y ${OP_TEX[mOp]} ${s.t.toTex()}$. Solve it for $y$ too.`,
          `$y$ has to satisfy **both** results and be a whole number. Then find the ${ask} one.`,
        ],
        solution: [
          { text: 'Count condition.', tex: `${X} + y ${OP_TEX[cOp]} ${s.n} \\;\\Rightarrow\\; y ${OP_TEX[cOp]} ${countBound.toTex()}`, why: `Subtract $${X}$ from both sides.` },
          { text: 'Money condition.', tex: `${s.a.mul(Q(X)).toTex()} + ${coefTex(s.b)}y ${OP_TEX[mOp]} ${s.t.toTex()} \\;\\Rightarrow\\; y ${OP_TEX[mOp]} ${bTex(moneyBound)}`, why: `Subtract $${s.a.mul(Q(X)).toTex()}$, then divide by $${s.b.toTex()}$ (positive, so the symbol stays).` },
          { text: `Whole numbers that satisfy both: from $${minY}$ to ${hasMax ? `$${maxY}$` : 'as many as you like'}.`, why: 'Both conditions must hold at the same time, and you cannot have part of an item.' },
          { text: `The ${ask} is $${y}$.`, why: `Check $${other}$: ${other < 0 ? 'a count cannot be negative' : `it breaks ${rels.filter((r) => !holds(r, X, other)).map((r) => (r === s.countRel ? 'the count condition' : 'the money condition')).join(' and ')}`}.` },
        ],
        misconceptions: numberMisconceptions(
          Q(y),
          [countBound, Q(moneyBound.floor()), Q(moneyBound.floor()).add(Q(1)), Q(other)]
            .filter((v) => !v.isNegative() && !rels.every((r) => holds(r, X, v)))
            .map((v) => {
              const broken = rels.filter((r) => !holds(r, X, v)).map((r) => (r === s.countRel ? 'count' : 'money'));
              return { value: v, tag: 'other' as const, feedback: `Check it: ${countOf(ctx, 'y', v.toTex())} breaks the ${broken.join(' and the ')} condition${broken.length > 1 ? 's' : ''}. The answer has to satisfy both.` };
            }),
        ),
      });
    }
    return genMaxInContext.generate(rng, difficulty);
  },
  verify(pr) {
    if ((pr.prompt[0] as { text?: string }).text?.includes('profit of')) return verifyCornerProfit(pr);
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    const text = (pr.prompt[0] as { text: string }).text.replace(/\*\*/g, '');
    const nums = [...text.matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]));
    const [a, b, n, t] = nums;
    const countOp: Op = text.indexOf('at most') < text.indexOf('at least') ? '<=' : '>=';
    const moneyOp: Op = countOp === '<=' ? '>=' : '<=';
    const q = (pr.prompt[pr.prompt.length - 1] as { text: string }).text;
    const X = Number(/If there (?:are|is) \$(\d+)\$/.exec(q)![1]);
    const greatest = /greatest/.test(q);
    let best: number | null = null;
    for (let y = 0; y <= 1000; y++) {
      if (X + y > n && countOp === '<=') break;
      const ok = (countOp === '<=' ? X + y <= n : X + y >= n) && (moneyOp === '<=' ? a * X + b * y <= t : a * X + b * y >= t);
      if (ok) {
        if (!greatest) {
          best = y;
          break;
        }
        best = y;
      }
    }
    return best === Number(pr.answer.value) ? [] : [`brute force ${best}, key ${pr.answer.value}`];
  },
};


// ---------------------------------------------------------------------------
// S2.06 / A.PAR.4.3: which corner of a graphed region gives the greatest profit?
// ---------------------------------------------------------------------------

interface CornerCtx {
  who: string;
  pron: string;
  place: string;
  xNoun: string;
  yNoun: string;
  xOne: string;
  yOne: string;
}

const CORNER_CONTEXTS: CornerCtx[] = [
  { who: 'Mia', pron: 'She', place: 'a craft fair', xNoun: 'bracelets', yNoun: 'tote bags', xOne: 'bracelet', yOne: 'tote bag' },
  { who: 'Dev', pron: 'He', place: 'the spring market', xNoun: 'birdhouses', yNoun: 'stools', xOne: 'birdhouse', yOne: 'stool' },
  { who: 'Nia', pron: 'She', place: 'a holiday fair', xNoun: 'candles', yNoun: 'soap sets', xOne: 'candle', yOne: 'soap set' },
];

const hoursWord = (n: number) => `$${n}$ hour${n === 1 ? '' : 's'}`;

function cornerProfit(rng: Rng, difficulty: number) {
  const ctx = rng.pick(CORNER_CONTEXTS);
  const [a, b] = rng.pick([[1, 2], [1, 3], [2, 3], [1, 4], [2, 5]] as const);
  // the two boundary lines cross at a whole-number point (xs, ys), and (0, H/b) is whole too
  const unit = b / gcdInt(a, b);
  const xsChoices: number[] = [];
  for (let v = unit; v <= 12; v += unit) if (v >= 2) xsChoices.push(v);
  const xs = rng.pick(xsChoices);
  const ys = rng.int(2, 9);
  const N = xs + ys;
  const H = a * xs + b * ys;
  const corners = [
    { x: 0, y: 0 },
    { x: N, y: 0 },
    { x: xs, y: ys },
    { x: 0, y: H / b },
  ];
  // the profit per item decides which corner wins: the crossing point wins when pp < qq < pp·b/a
  const pp = rng.int(3, 12);
  const crossWins = rng.next() < 0.6;
  const qChoices: number[] = [];
  for (let v = pp + 1; v <= pp * 3; v++) if ((v * a < pp * b) === crossWins) qChoices.push(v);
  if (!qChoices.length) return cornerProfit(rng, difficulty);
  const qq = rng.pick(qChoices);
  const profit = (c: { x: number; y: number }) => pp * c.x + qq * c.y;
  const values = corners.map(profit);
  const best = Math.max(...values);
  if (values.filter((v) => v === best).length !== 1) return cornerProfit(rng, difficulty);
  const win = quadrantWindow(N, N, ctx.xNoun, ctx.yNoun);
  const hoursLine = linearPlain(Q(-a, b), Q(H, b));
  const askChoice = difficulty === 2;
  const letters = ['A', 'B', 'C', 'D'];
  const spec: GraphSpec = {
    ...win,
    functions: [
      { expr: `${N} - x`, label: 'items', color: '#3557d4', domain: [0, N] },
      { expr: hoursLine, label: 'hours', color: '#d4572f', domain: [0, Math.min(win.xMax, H / a)] },
    ],
    inequalities: [
      { boundary: `${N} - x`, side: 'below', strict: false, color: '#3557d4' },
      { boundary: hoursLine, side: 'below', strict: false, color: '#d4572f' },
      { boundary: '0', side: 'above', strict: false, color: '#8a8f98' },
    ],
    verticalInequalities: [{ x: 0, side: 'right', strict: false, color: '#8a8f98' }],
    points: corners.map((c, i) => ({ x: c.x, y: c.y, label: askChoice ? `(${c.x}, ${c.y})` : letters[i] })),
    ariaLabel: `Solid line x + y = ${N} and solid line ${a === 1 ? '' : a}x + ${b}y = ${H}, both shaded below, with x and y at least 0. The solution region has corners ${askChoice ? corners.map((c) => `(${c.x}, ${c.y})`).join(', ') : 'marked A, B, C and D'}.`,
  };
  const setup = p(
    `${ctx.who} makes ${ctx.xNoun} and ${ctx.yNoun} to sell at ${ctx.place}. ${ctx.pron} has room to bring **at most** $${N}$ items. A ${ctx.xOne} takes ${hoursWord(a)} to make and a ${ctx.yOne} takes ${hoursWord(b)}, and ${ctx.pron.toLowerCase()} has **at most** $${H}$ hours to work. ${ctx.pron} makes a profit of \\$${pp} on each ${ctx.xOne} and \\$${qq} on each ${ctx.yOne}.`,
  );
  const sysP = p(`Let $x$ be the number of ${ctx.xNoun} and $y$ the number of ${ctx.yNoun}. The constraints are $x + y \\le ${N}$, $${coefTex(Q(a))}x + ${b}y \\le ${H}$, $x \\ge 0$ and $y \\ge 0$. The graph shows the solution region.`);
  const ask = askChoice ? p('Which corner point of the solution region gives the **greatest** profit?') : p('What is the **greatest** profit possible? (The best plan is always at a corner of the solution region.)');
  const graph: Block = { t: 'graph', spec, caption: `Blue: at most ${N} items. Orange: at most ${H} hours. ${askChoice ? 'The corner points are marked.' : 'The corners are marked A, B, C and D.'}` };
  const profitTex = `P = ${pp}x + ${qq}y`;
  const evalLines = corners.map((c) => `$(${c.x}, ${c.y})$: $${pp}(${c.x}) + ${qq}(${c.y}) = ${profit(c)}$`);
  const bestCorner = corners[values.indexOf(best)];
  const solution = [
    { text: 'Write the profit.', tex: profitTex, why: `Each ${ctx.xOne} earns \\$${pp} and each ${ctx.yOne} earns \\$${qq}.` },
    { text: 'Find the corners of the solution region.', tex: `x + y = ${N} \\text{ and } ${coefTex(Q(a))}x + ${b}y = ${H} \\;\\Rightarrow\\; (${xs}, ${ys})`, why: `Where the two lines cross both are equal: substitute $y = ${N} - x$ into the hours line to get $${a === 1 ? '' : a}x + ${b * N} - ${b}x = ${H}$, so $x = ${xs}$ and $y = ${ys}$. The other corners are on the axes: $(0, 0)$, $(${N}, 0)$ on the items line, and $(0, ${H / b})$ on the hours line.` },
    { text: 'Evaluate the profit at each corner.', why: evalLines.join('; ') + '.' },
    { text: `The greatest profit is \\$${best}, at $(${bestCorner.x}, ${bestCorner.y})$.`, why: 'A linear expression like the profit is greatest at a corner of the region, so checking the corners is enough.' },
  ];
  const hints: [string, string, string, string] = [
    'The greatest (or least) value of a linear expression over a solution region happens at a **corner** of the region.',
    `Write the profit as an expression: \\$${pp} for each ${ctx.xOne} and \\$${qq} for each ${ctx.yOne}.`,
    askChoice ? 'Substitute the coordinates of each corner into the profit expression.' : 'Find each corner. Two are on the axes; one is where the two boundary lines cross, so solve the two equations together.',
    'Compare the profits at the corners and choose the largest.',
  ];
  if (askChoice) {
    const answer = makeChoice(rng, ptTex(bestCorner.x, bestCorner.y), corners.filter((c) => c !== bestCorner).map((c) => ptTex(c.x, c.y)));
    return makeProblem({ skillId: 'S2.06', tags: ['real-world', 'word', 'graph', 'multi-step'], prompt: [setup, sysP, graph, ask], answer, hints, solution, misconceptions: [] });
  }
  return makeProblem({
    skillId: 'S2.06',
    tags: ['real-world', 'word', 'graph', 'multi-step'],
    prompt: [setup, sysP, graph, ask],
    answer: { kind: 'number', value: String(best) },
    inputHint: 'Type the profit in dollars, like 96.',
    hints,
    solution,
    misconceptions: numberMisconceptions(
      Q(best),
      corners
        .filter((c) => c !== bestCorner && profit(c) > 0)
        .map((c) => ({ value: Q(profit(c)), tag: 'other' as const, feedback: 'That is the profit at one corner, but another corner gives more. Check every corner.' })),
    ),
  });
}

function verifyCornerProfit(pr: Parameters<GeneratorDef['verify']>[0]): string[] {
  const text = (pr.prompt[0] as { text: string }).text.replace(/\*\*/g, '');
  const n = /at most \$(\d+)\$ items/.exec(text);
  const t = /takes \$(\d+)\$ hours? to make and an? .+? takes \$(\d+)\$ hours?/.exec(text);
  const h = /at most \$(\d+)\$ hours/.exec(text);
  const pq = /profit of \\\$(\d+) on each .+? and \\\$(\d+) on each/.exec(text);
  if (!n || !t || !h || !pq) return ['cannot parse corner context'];
  const [N, a, b, H, P1, P2] = [n[1], t[1], t[2], h[1], pq[1], pq[2]].map(Number);
  // brute force over every whole-number plan in the region
  let best = -1;
  let arg: Array<[number, number]> = [];
  for (let x = 0; x <= N; x++)
    for (let y = 0; y <= N; y++) {
      if (x + y > N || a * x + b * y > H) continue;
      const v = P1 * x + P2 * y;
      if (v > best) {
        best = v;
        arg = [[x, y]];
      } else if (v === best) arg.push([x, y]);
    }
  const errs: string[] = [];
  if (arg.length !== 1) errs.push('best plan is not unique');
  if (pr.answer.kind === 'number') {
    if (Number(pr.answer.value) !== best) errs.push(`brute force ${best}, key ${pr.answer.value}`);
  } else if (pr.answer.kind === 'choice') {
    const q = /^\$\((\d+), (\d+)\)\$$/.exec(choiceLabel(pr.answer));
    if (!q || Number(q[1]) !== arg[0][0] || Number(q[2]) !== arg[0][1]) errs.push('wrong corner');
  } else return ['unexpected kind'];
  // the marked points are the corners of the region: feasible, with two constraints tight
  const g = pr.prompt.find((b2) => b2.t === 'graph') as Extract<Block, { t: 'graph' }> | undefined;
  for (const pt of g?.spec.points ?? []) {
    const tight = [pt.x === 0, pt.y === 0, pt.x + pt.y === N, a * pt.x + b * pt.y === H].filter(Boolean).length;
    if (pt.x < 0 || pt.y < 0 || pt.x + pt.y > N || a * pt.x + b * pt.y > H || tight < 2) errs.push(`(${pt.x}, ${pt.y}) is not a corner`);
  }
  if ((g?.spec.points ?? []).length !== 4) errs.push('expected 4 corners');
  return errs;
}

export const U2_SYSTEM_GENERATORS: GeneratorDef[] = [genSystemTest, genSystemPoint, genModelSystem, genMaxInContext];
