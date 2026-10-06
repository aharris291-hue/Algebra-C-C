/**
 * Unit 4, Lessons 12-15 generators: quadratic function notation (S4.14), key features of
 * parabolas (S4.15), domain and range (S4.16) and transformations (S4.17). Keys come from the
 * construction; verify() re-reads the printed function (equation, table or graph) and
 * re-derives the answer exactly: vertex from -b/(2a), zeros by substitution, transformations by
 * composing polynomials.
 */
import type { GeneratorDef, Rng, ProblemStep, Problem, GraphSpec } from '../../core/curriculum/types';
import type { Misconception } from '../../core/math/answers';
import { parseInterval, intervalsEqual } from '../../core/math/answers';
import { parseExpression } from '../../core/math/parser';
import { toPoly, Poly } from '../../core/math/poly';
import { Rational } from '../../core/math/rational';
import { p, makeProblem, makeChoice, choiceLabel, numStr, Q } from './util';
import {
  X, pTex, pPlain, texPoly, checkSolutions, quadRoots, ev, vertexOf, vtxTex, vtxPlain, vtxPoly, factTex, factPoly, rhsPoly, mathBlocks, promptText, graphOf, substituteTex, joinNums, tailTex, coefTex,
} from './u4-common';

const SOL_HINT = 'Like x = 3, -5 or 2 ± sqrt(5), or none';
const nz = (rng: Rng, lo: number, hi: number) => rng.nonzeroInt(lo, hi);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
type Hints = [string, string, string, string];

const numSpec = (v: Rational, unit?: string) => ({ kind: 'number' as const, value: numStr(v), ...(unit ? { unit } : {}) });
const solSpec = (values: Rational[]) => ({ kind: 'solutions' as const, values: [...values].sort((x, y) => y.cmp(x)).map((v) => v.toString()) });
const pointSpec = (x: Rational, y: Rational) => ({ kind: 'point' as const, x: numStr(x), y: numStr(y) });

/** Plain-text graph function for a polynomial in x (parser syntax). */
const gexpr = (poly: Poly) => pPlain(poly).replace(/\s+/g, '');

/** A window around a parabola with vertex (h, k) and its other key points. */
function windowFor(xs: number[], ys: number[], padX = 2, padY = 2): Pick<GraphSpec, 'xMin' | 'xMax' | 'yMin' | 'yMax' | 'xStep' | 'yStep'> {
  const xMin = Math.floor(Math.min(...xs, 0) - padX);
  const xMax = Math.ceil(Math.max(...xs, 0) + padX);
  const yMin = Math.floor(Math.min(...ys, 0) - padY);
  const yMax = Math.ceil(Math.max(...ys, 0) + padY);
  const span = yMax - yMin;
  const yStep = span > 40 ? 10 : span > 20 ? 5 : span > 12 ? 2 : 1;
  return { xMin, xMax, yMin: Math.floor(yMin / yStep) * yStep, yMax: Math.ceil(yMax / yStep) * yStep, xStep: 1, yStep };
}

// ---------------------------------------------------------------------------
// S4.14: evaluate and interpret quadratic functions
// ---------------------------------------------------------------------------

export const genEvaluateQuadratic: GeneratorDef = {
  id: 'u4.evaluate-quadratic',
  skillId: 'S4.14',
  description: 'Evaluate a quadratic function, or find the inputs that give an output.',
  generate(rng, difficulty) {
    if (difficulty === 3) {
      const sqrtMode = rng.bool();
      let f: Poly;
      let target: number;
      let roots: Rational[];
      if (sqrtMode) {
        const a = rng.pick([1, 2, 3]);
        const c = nz(rng, -9, 9);
        const m = rng.int(1, 6);
        f = X([c, 0, a]);
        target = a * m * m + c;
        roots = [Q(m), Q(-m)];
      } else {
        let r1: number;
        let r2: number;
        do {
          r1 = rng.int(-6, 6);
          r2 = rng.int(-6, 6);
        } while (r1 === r2 || r1 + r2 === 0);
        target = nz(rng, -12, 20);
        f = factPoly(1, r1, r2).add(X([target]));
        roots = [Q(r1), Q(r2)];
      }
      const g = f.sub(X([target]));
      const ftex = `f(x) = ${pTex(f)}`;
      const misconceptions: Misconception[] = sqrtMode
        ? [{ answer: String(roots[0].abs().toString()), tag: 'missing-solution', feedback: 'A positive number has two square roots. Did you forget the negative one?' }]
        : [{ answer: roots.map((r) => r.neg().toString()).join(', '), tag: 'sign-error', feedback: 'Check the signs. If $x - 4 = 0$, then $x = 4$: each solution has the opposite sign of the number in its factor.' }];
      const isolated = sqrtMode ? `${coefTex(g.coeff('x', 2))}x^{2} = ${target - g.coeff('x', 0).toInt() - target === 0 ? '' : ''}${Q(target).sub(f.coeff('x', 0)).toTex()}` : '';
      const steps: ProblemStep[] = [
        {
          prompt: [p(`Set the function equal to $${target}$ and move everything to one side. What is the left side of the equation ${sqrtMode ? '' : 'in standard form '}$\\ldots = 0$?`)],
          answer: { kind: 'expression', value: pPlain(g), form: 'expanded' },
          inputHint: 'Type an expression like x^2 - 2x - 15.',
          hints: [`Write $${pTex(f)} = ${target}$.`, `${target < 0 ? 'Add' : 'Subtract'} $${Math.abs(target)}$ ${target < 0 ? 'to' : 'from'} both sides.`, 'Combine the constant terms.', 'Keep the $x^{2}$ and $x$ terms as they are.'],
          explanation: `$${pTex(f)} = ${target}$ becomes $${pTex(g)} = 0$.`,
        },
        {
          prompt: [p(`Solve $${pTex(g)} = 0$.`)],
          answer: solSpec(roots),
          inputHint: SOL_HINT,
          hints: sqrtMode ? ['Isolate $x^{2}$.', 'Take the square root of both sides.', 'Remember the $\\pm$.', 'Check both answers in the original equation.'] : ['Factor the expression.', 'Find two numbers that multiply to the constant and add to the $x$-coefficient.', 'Set each factor equal to zero.', 'Check both answers in the original equation.'],
          explanation: sqrtMode ? `$${isolated}$, so $x = \\pm ${roots[0].abs().toTex()}$.` : `$${factTex(1, roots[0], roots[1])} = 0$, so $x = ${roots[0].toTex()}$ or $x = ${roots[1].toTex()}$.`,
        },
      ];
      return makeProblem({
        skillId: 'S4.14',
        tags: ['multi-step'],
        prompt: [p('Use the function below.'), { t: 'math', tex: ftex }, p(`For what values of $x$ is $f(x) = ${target}$?`)],
        answer: solSpec(roots),
        inputHint: SOL_HINT,
        hints: [
          '$f(x) = ' + target + '$ asks for the inputs whose output is ' + target + '. It is an equation to solve, not a value to plug in.',
          `Write the equation $${pTex(f)} = ${target}$.`,
          sqrtMode ? 'Isolate $x^{2}$, then take square roots.' : 'Move everything to one side so the equation equals $0$, then factor.',
          'A quadratic equation can have two solutions. Check each one in $f$.',
        ],
        solution: [
          { text: 'Set the output equal to the target value.', tex: `${pTex(f)} = ${target}`, why: `$f(x) = ${target}$ means the output is $${target}$.` },
          { text: 'Move everything to one side.', tex: `${pTex(g)} = 0` },
          sqrtMode
            ? { text: 'Isolate $x^{2}$ and take square roots.', tex: `${isolated} \\Rightarrow x = \\pm ${roots[0].abs().toTex()}`, why: 'Both a positive and a negative number square to the same value.' }
            : { text: 'Factor and use the zero product property.', tex: `${factTex(1, roots[0], roots[1])} = 0 \\Rightarrow x = ${roots[0].toTex()} \\text{ or } x = ${roots[1].toTex()}` },
          { text: 'Check by substituting each solution into $f$.', why: `$f(${roots[0].toTex()}) = ${ev(f, roots[0]).toTex()}$ and $f(${roots[1].toTex()}) = ${ev(f, roots[1]).toTex()}$.` },
        ],
        misconceptions,
        steps,
      });
    }
    const a = difficulty === 1 ? rng.pick([1, 2, 3]) : rng.pick([-3, -2, -1, 1, 2]);
    const b = difficulty === 1 ? rng.int(-6, 6) : nz(rng, -6, 6);
    const c = rng.int(-9, 9);
    const x0 = difficulty === 1 ? rng.int(1, 5) : rng.int(-5, -1);
    const f = X([c, b, a]);
    const val = ev(f, x0);
    const sq = x0 * x0;
    const termTex = joinNums([a * sq, ...(b ? [b * x0] : []), ...(c ? [c] : [])]);
    const misconceptions: Misconception[] = [];
    if (x0 < 0) {
      const negSq = Q(a * -sq + b * x0 + c);
      if (!negSq.eq(val)) misconceptions.push({ answer: numStr(negSq), tag: 'order-of-operations', feedback: 'A negative number squared is positive. Put the input in parentheses before squaring.' });
      const lostSign = Q(a * sq + b * -x0 + c);
      if (!lostSign.eq(val) && !lostSign.eq(negSq)) misconceptions.push({ answer: numStr(lostSign), tag: 'sign-error', feedback: `Check the $x$ term: $${b}$ times a negative input changes sign.` });
    }
    const swapped = Q(a * (2 * x0) + b * x0 + c);
    if (!swapped.eq(val) && !misconceptions.some((m) => m.answer === numStr(swapped)) && x0 !== 2)
      misconceptions.push({ answer: numStr(swapped), tag: 'exponent-rule', feedback: '$x^{2}$ means $x \\cdot x$, not $2x$.' });
    return makeProblem({
      skillId: 'S4.14',
      tags: [],
      prompt: [p('Use the function below.'), { t: 'math', tex: `f(x) = ${pTex(f)}` }, p(`Find $f(${x0})$.`)],
      answer: numSpec(val),
      hints: [
        `$f(${x0})$ means: replace every $x$ with $${x0}$.`,
        x0 < 0 ? `Put the input in parentheses: $(${x0})^{2}$.` : 'Do the exponent first, then multiply, then add and subtract.',
        `$(${x0})^{2} = ${sq}$.`,
        [a === 1 ? '' : `Multiply $${a}$ by $${sq}$.`, b ? `Multiply $${b}$ by $${x0}$.` : '', `Then add${c ? ' the constant and' : ''} the results.`].filter(Boolean).join(' '),
      ],
      solution: [
        { text: `Substitute $${x0}$ for every $x$.`, tex: `f(${x0}) = ${substituteTex(a, b, c, x0)}`, why: 'Parentheses keep the sign of the input with it.' },
        { text: 'Square first, then multiply.', tex: `= ${termTex}`, why: Math.abs(a) === 1 ? `Order of operations: square first, $(${x0})^{2} = ${sq}$${a === -1 ? ', then apply the negative sign' : ''}.` : `Order of operations: $(${x0})^{2} = ${sq}$ before multiplying by $${a}$.` },
        { text: 'Add and subtract.', tex: `= ${val.toTex()}` },
      ],
      misconceptions,
      steps: [
        {
          prompt: [p(`What is $(${x0})^{2}$?`)],
          answer: numSpec(Q(sq)),
          hints: ['Squaring means multiplying a number by itself.', `$(${x0})^{2} = (${x0})(${x0})$.`, x0 < 0 ? 'A negative times a negative is positive.' : 'Multiply.', `It is ${x0 < 0 ? 'positive' : 'the product'}.`],
          explanation: `$(${x0})^{2} = ${sq}$.`,
        },
        {
          prompt: [p(`Now finish: $f(${x0}) = ${substituteTex(a, b, c, x0)}$.`)],
          answer: numSpec(val),
          hints: ['Multiply each term.', `The first term is $${a} \\cdot ${sq}$.`, b ? `The $x$ term is $${b} \\cdot (${x0})$.` : 'There is no $x$ term.', 'Add the results.'],
          explanation: `$${termTex} = ${val.toTex()}$.`,
        },
      ],
    });
  },
  verify(pr) {
    if (pr.answer.kind === 'solutions') {
      const f = rhsPoly(mathBlocks(pr)[0]);
      const m = /f\(x\) = (-?\d+)\$\?/.exec(promptText(pr));
      if (!m) return ['cannot read target'];
      return checkSolutions(f.sub(X([Number(m[1])])), pr.answer.values);
    }
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    const f = rhsPoly(mathBlocks(pr)[0]);
    const m = /Find \$f\((-?\d+)\)\$/.exec(promptText(pr));
    if (!m) return ['cannot read input'];
    // Horner's rule, a different route from Poly.evaluate
    const x = Number(m[1]);
    const [c, b, a] = f.coeffsIn('x').map((r) => r.toNumber());
    const want = (a * x + b) * x + c;
    return Q(pr.answer.value).eq(Q(want)) ? [] : [`expected ${want}`];
  },
};

interface Launch {
  thing: string;
  verb: string;
}
const LAUNCHES: Launch[] = [
  { thing: 'soccer ball', verb: 'kicked' },
  { thing: 'water balloon', verb: 'launched' },
  { thing: 'baseball', verb: 'hit' },
  { thing: 'pumpkin', verb: 'launched from a catapult' },
  { thing: 'volleyball', verb: 'served' },
  { thing: 'model rocket', verb: 'launched' },
];

/** -16t^2 + vt + h0 with nice numbers: returns the polynomial in t and its parts. */
function pickLaunch(rng: Rng): { v: number; h0: number; h: Poly; who: Launch } {
  const v = rng.pick([32, 48, 64, 80]);
  const h0 = rng.int(0, 8);
  return { v, h0, h: Poly.fromCoeffs('t', [Q(h0), Q(v), Q(-16)]), who: rng.pick(LAUNCHES) };
}
const tTex = (h: Poly) => pTex(h, 't');

interface ConceptQ {
  ask: string;
  correct: string;
  wrong: string[];
}

export const genInterpretNotation: GeneratorDef = {
  id: 'u4.interpret-notation',
  skillId: 'S4.14',
  description: 'Interpret quadratic function notation in a context.',
  generate(rng, difficulty) {
    let L = pickLaunch(rng);
    const okTimes = (L0: typeof L) => [1, 2, 3, 4].filter((t) => ev(L0.h, t, 't').gt(0) && !Q(t).eq(Q(L0.v, 32)) && !ev(L0.h, t, 't').eq(t));
    while (okTimes(L).length === 0) L = pickLaunch(rng);
    const { v, h, who } = L;
    const thing = `the ${who.thing}`;
    const story = p(`The height of a ${who.thing}, in feet, $t$ seconds after it is ${who.verb} is modeled by the function below.`);
    const eq = { t: 'math' as const, tex: `h(t) = ${tTex(h)}` };
    const tv = Q(v, 32);
    // times while the object is still in the air, not at the top
    const times = [1, 2, 3, 4].filter((t) => ev(h, t, 't').gt(0) && !Q(t).eq(tv) && !ev(h, t, 't').eq(t));
    const t0 = rng.pick(times);
    const H = ev(h, t0, 't');
    if (difficulty === 2) {
      return makeProblem({
        skillId: 'S4.14',
        tags: ['real-world'],
        prompt: [story, eq, p(`Find $h(${t0})$ and explain what it means.`)],
        answer: numSpec(H, 'feet'),
        hints: [
          `$h(${t0})$ is the output when the input is $t = ${t0}$.`,
          `Substitute $${t0}$ for every $t$.`,
          `$-16(${t0})^{2} = ${-16 * t0 * t0}$.`,
          `Then add $${v}(${t0}) = ${v * t0}$ and the constant.`,
        ],
        solution: [
          { text: `Substitute $t = ${t0}$.`, tex: `h(${t0}) = ${substituteTex(-16, v, h.coeff('t', 0), t0)}` },
          { text: 'Simplify.', tex: `= ${joinNums([-16 * t0 * t0, v * t0, ...(h.coeff('t', 0).isZero() ? [] : [h.coeff('t', 0)])])} = ${H.toTex()}` },
          { text: 'Interpret.', why: `${t0} second${t0 === 1 ? '' : 's'} after it is ${who.verb}, ${thing} is $${H.toTex()}$ feet above the ground.` },
        ],
        misconceptions: [{ answer: numStr(Q(16 * t0 * t0 + v * t0).add(h.coeff('t', 0))), tag: 'order-of-operations', feedback: 'The $-16$ multiplies $t^{2}$, so that term is negative.' }],
      });
    }
    let q: ConceptQ;
    if (difficulty === 1) {
      q = {
        ask: `What does $h(${t0}) = ${H.toTex()}$ mean?`,
        correct: `${t0} second${t0 === 1 ? '' : 's'} after it is ${who.verb}, ${thing} is ${H.toTex()} feet above the ground.`,
        wrong: [
          `${H.toTex()} seconds after it is ${who.verb}, ${thing} is ${t0} ${t0 === 1 ? 'foot' : 'feet'} above the ground.`,
          `${cap(thing)} reaches its highest point, ${H.toTex()} feet, after ${t0} second${t0 === 1 ? '' : 's'}.`,
          `${cap(thing)} is rising at ${H.toTex()} feet per second after ${t0} second${t0 === 1 ? '' : 's'}.`,
        ],
      };
    } else {
      const target = rng.pick([16, 20, 24, 30, 40].filter((x) => Q(x).lt(ev(h, tv, 't'))));
      const pool: ConceptQ[] = [
        { ask: 'What does $h(0)$ represent?', correct: `The height of ${thing} at the moment it is ${who.verb}`, wrong: [`The time when ${thing} hits the ground`, `The greatest height ${thing} reaches`, `The speed of ${thing} when it is ${who.verb}`] },
        { ask: `Which equation would you solve to find when ${thing} hits the ground?`, correct: '$h(t) = 0$', wrong: ['$h(0) = t$', '$t = 0$', '$h(t) = 16$'] },
        { ask: `Which would you do to find when ${thing} is ${target} feet high?`, correct: `Solve $h(t) = ${target}$`, wrong: [`Find $h(${target})$`, `Solve $h(t) = 0$`, `Find $h(0) + ${target}$`] },
        { ask: `What does a solution of $h(t) = ${target}$ tell you?`, correct: `A time when ${thing} is ${target} feet above the ground`, wrong: [`The height of ${thing} after ${target} seconds`, `How far ${thing} travels in ${target} seconds`, `The greatest height of ${thing}`] },
      ];
      q = rng.pick(pool);
    }
    const answer = makeChoice(rng, q.correct, q.wrong);
    return makeProblem({
      skillId: 'S4.14',
      tags: ['real-world'],
      prompt: [story, eq, p(q.ask)],
      answer,
      hints: [
        'In $h(t)$, the input $t$ is the time in seconds and the output $h(t)$ is the height in feet.',
        'Inside the parentheses is always the input (time). The value of $h$ is always the output (height).',
        difficulty === 1 ? 'Read $h(\\text{time}) = \\text{height}$.' : 'Hitting the ground means the height is $0$.',
        'Be careful with any statement about the highest point or speed: the notation alone does not tell you those.',
      ],
      solution: [
        { text: 'Identify the input and output.', why: '$t$ is time in seconds; $h(t)$ is height in feet.' },
        { text: `So the answer is: ${q.correct}`, why: difficulty === 1 ? `The input inside the parentheses is the time, and the value $${H.toTex()}$ is the height at that time.` : 'Match each part of the notation to time or height.' },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind === 'number') {
      const h = rhsPoly(mathBlocks(pr)[0]);
      const m = /Find \$h\((\d+)\)\$/.exec(promptText(pr));
      if (!m) return ['cannot read input'];
      const t = Number(m[1]);
      const [c, b, a] = h.coeffsIn('t').map((r) => r.toNumber());
      return Q(pr.answer.value).eq(Q((a * t + b) * t + c)) ? [] : ['wrong height'];
    }
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const text = promptText(pr);
    const h = rhsPoly(mathBlocks(pr)[0]);
    const label = choiceLabel(pr.answer);
    const m = /What does \$h\((\d+)\) = (\d+)\$ mean/.exec(text);
    if (m) {
      const t = Number(m[1]);
      const errs: string[] = [];
      if (!ev(h, t, 't').eq(Number(m[2]))) errs.push('h(t0) is not the stated height');
      if (!label.startsWith(`${t} second${t === 1 ? '' : 's'} after`) || !label.includes(`is ${m[2]} feet above`)) errs.push('wrong key');
      const { h: tv } = vertexOf(h, 't');
      if (tv.eq(t)) errs.push('t0 is the vertex time, so the highest-point distractor is true');
      return errs;
    }
    const expected: Array<[RegExp, RegExp]> = [
      [/What does \$h\(0\)\$ represent/, /^The height of .* at the moment/],
      [/hits the ground\?/, /^\$h\(t\) = 0\$$/],
      [/Which would you do to find when .* is (\d+) feet high/, /^Solve \$h\(t\) = \d+\$$/],
      [/What does a solution of \$h\(t\) = (\d+)\$ tell you/, /^A time when .* feet above the ground$/],
    ];
    for (const [qre, are] of expected) if (qre.test(text)) return are.test(label) ? [] : ['wrong key'];
    return ['unknown question'];
  },
};

// ---------------------------------------------------------------------------
// S4.15: vertex, axis of symmetry, intercepts, graph features
// ---------------------------------------------------------------------------

export const genVertexAxis: GeneratorDef = {
  id: 'u4.vertex-axis',
  skillId: 'S4.15',
  description: 'Find the vertex or axis of symmetry from vertex, standard or factored form.',
  generate(rng, difficulty) {
    const a = difficulty === 1 ? rng.pick([1, 2, 3, -1, -2, 0.5]) : rng.pick([1, 2, 3, -1, -2, -3]);
    const A = Q(a);
    let h: Rational;
    let k: Rational;
    let ftex: string;
    let r = 0;
    let s = 0;
    if (difficulty === 3) {
      do {
        r = rng.int(-7, 7);
        s = rng.int(-7, 7);
      } while (r === s || (r + s) % 2 !== 0);
      h = Q((r + s) / 2);
      k = ev(factPoly(A, r, s), h);
      ftex = factTex(A, r, s);
    } else {
      h = Q(nz(rng, -6, 6));
      k = Q(rng.int(-9, 9));
      ftex = difficulty === 1 ? vtxTex(A, h, k) : pTex(vtxPoly(A, h, k));
    }
    const ask: 'vertex' | 'axis' = difficulty === 1 ? (rng.int(0, 3) === 0 ? 'axis' : 'vertex') : rng.bool() ? 'axis' : 'vertex';
    const f = rhsPoly(`f(x) = ${ftex}`);
    const { b } = vertexOf(f);
    const answer = ask === 'vertex' ? pointSpec(h, k) : { kind: 'equation' as const, value: `x = ${numStr(h)}` };
    const misconceptions: Misconception[] = [];
    if (difficulty === 1 && !h.isZero()) misconceptions.push({ answer: ask === 'vertex' ? `${numStr(h.neg())}|${numStr(k)}` : `x = ${numStr(h.neg())}`, tag: 'vertex-sign', feedback: 'In $a(x - h)^{2} + k$ the vertex is $(h, k)$. For $(x - 3)^{2}$, $h = 3$; for $(x + 3)^{2}$, $h = -3$.' });
    if (difficulty === 2 && !b.isZero()) misconceptions.push(ask === 'vertex' ? { answer: `${numStr(h.neg())}|${numStr(ev(f, h.neg()))}`, tag: 'sign-error', feedback: 'The formula is $x = -\\frac{b}{2a}$. Check the sign of $b$ and the negative in front.' } : { answer: `x = ${numStr(h.neg())}`, tag: 'sign-error', feedback: 'The formula is $x = -\\frac{b}{2a}$. Check the sign of $b$ and the negative in front.' });
    if (difficulty === 3) misconceptions.push(ask === 'vertex' ? { answer: `${numStr(h.neg())}|${numStr(ev(f, h.neg()))}`, tag: 'sign-error', feedback: 'The zeros of $(x - r)(x - s)$ are $r$ and $s$, not $-r$ and $-s$.' } : { answer: `x = ${numStr(h.neg())}`, tag: 'sign-error', feedback: 'The zeros of $(x - r)(x - s)$ are $r$ and $s$, not $-r$ and $-s$.' });
    const valid = misconceptions.filter((m) => !(ask === 'vertex' ? m.answer === `${numStr(h)}|${numStr(k)}` : m.answer === `x = ${numStr(h)}`));
    const what = ask === 'vertex' ? 'vertex' : 'axis of symmetry';
    const inputHint = ask === 'vertex' ? 'Type a point like (2, -5).' : 'Type an equation like x = 3.';
    const hTex = h.toTex();
    const steps: ProblemStep[] = [];
    let solution;
    let hints: Hints;
    if (difficulty === 1) {
      hints = ['Vertex form is $f(x) = a(x - h)^{2} + k$, and the vertex is $(h, k)$.', 'Read $h$ from inside the parentheses. Watch the sign: $x - h$.', 'Read $k$ from the number added at the end.', ask === 'axis' ? 'The axis of symmetry is the vertical line through the vertex, $x = h$.' : 'Write the vertex as an ordered pair.'];
      solution = [
        { text: 'Compare with $a(x - h)^{2} + k$.', tex: `f(x) = ${ftex}`, why: `Here $h = ${hTex}$ and $k = ${k.toTex()}$.` },
        { text: ask === 'vertex' ? 'Write the vertex.' : 'The axis of symmetry passes through the vertex.', tex: ask === 'vertex' ? `(${hTex}, ${k.toTex()})` : `x = ${hTex}` },
      ];
    } else if (difficulty === 2) {
      hints = ['For $ax^{2} + bx + c$, the vertex has $x = -\\frac{b}{2a}$.', `Here $a = ${A.toTex()}$ and $b = ${b.toTex()}$.`, ask === 'vertex' ? 'Substitute that $x$-value into $f$ to get the $y$-value.' : 'The axis of symmetry is the vertical line through the vertex.', 'Be careful with the negative sign in $-\\frac{b}{2a}$.'];
      solution = [
        { text: 'Use $x = -\\frac{b}{2a}$.', tex: `x = -\\frac{${b.toTex()}}{2(${A.toTex()})} = ${hTex}`, why: 'The vertex is halfway between any two points with the same height, which is where this formula comes from.' },
        ...(ask === 'vertex' ? [{ text: 'Substitute to find the $y$-value.', tex: `f(${hTex}) = ${k.toTex()}` }, { text: 'Write the vertex.', tex: `(${hTex}, ${k.toTex()})` }] : [{ text: 'Write the axis of symmetry.', tex: `x = ${hTex}` }]),
      ];
      steps.push({
        prompt: [p(`What is $-\\frac{b}{2a}$ for $f(x) = ${ftex}$?`)],
        answer: numSpec(h),
        hints: [`$a = ${A.toTex()}$, $b = ${b.toTex()}$.`, `$2a = ${A.mul(2).toTex()}$.`, 'Divide $b$ by $2a$, then take the opposite.', 'Check the sign.'],
        explanation: `$-\\frac{${b.toTex()}}{${A.mul(2).toTex()}} = ${hTex}$.`,
      });
    } else {
      hints = ['The zeros of $a(x - r)(x - s)$ are $x = r$ and $x = s$.', 'The axis of symmetry is halfway between the zeros.', 'Average the two zeros: $\\frac{r + s}{2}$.', ask === 'vertex' ? 'Substitute that $x$-value into $f$ to get the $y$-value of the vertex.' : 'Write the axis as $x = $ that number.'];
      solution = [
        { text: 'Find the zeros.', tex: `x = ${r} \\text{ and } x = ${s}`, why: 'Each factor is zero at one of these.' },
        { text: 'Average the zeros.', tex: `x = \\frac{${r} + ${s < 0 ? `(${s})` : s}}{2} = ${hTex}`, why: 'A parabola is symmetric, so the axis is exactly halfway between the zeros.' },
        ...(ask === 'vertex' ? [{ text: 'Substitute to find the $y$-value.', tex: `f(${hTex}) = ${k.toTex()}` }, { text: 'Write the vertex.', tex: `(${hTex}, ${k.toTex()})` }] : []),
      ];
      steps.push({
        prompt: [p(`What are the zeros of $f(x) = ${ftex}$?`)],
        answer: solSpec([Q(r), Q(s)]),
        inputHint: 'Like x = 3, -5',
        hints: ['Set each factor equal to zero.', 'Solve each small equation.', 'Watch the signs.', 'There are two zeros.'],
        explanation: `$x = ${r}$ and $x = ${s}$.`,
      });
      steps.push({
        prompt: [p(`What number is halfway between $${r}$ and $${s}$?`)],
        answer: numSpec(h),
        hints: ['Add the two numbers.', 'Divide by $2$.', `$${r} + ${s < 0 ? `(${s})` : s} = ${r + s}$.`, 'Halve that.'],
        explanation: `$\\frac{${r + s}}{2} = ${hTex}$.`,
      });
    }
    if (ask === 'vertex' && difficulty !== 1)
      steps.push({
        prompt: [p(`Find $f(${hTex})$.`)],
        answer: numSpec(k),
        hints: [`Substitute $${hTex}$ for $x$.`, 'Square first.', 'Then multiply and add.', 'This is the $y$-value of the vertex.'],
        explanation: `$f(${hTex}) = ${k.toTex()}$.`,
      });
    if (steps.length)
      steps.push({ prompt: [p(`Write the ${what}.`)], answer, inputHint, hints: hints, explanation: ask === 'vertex' ? `$(${hTex}, ${k.toTex()})$.` : `$x = ${hTex}$.`, misconceptions: valid });
    return makeProblem({
      skillId: 'S4.15',
      tags: steps.length ? ['multi-step'] : [],
      prompt: [p(`Find the ${what} of the parabola.`), { t: 'math', tex: `f(x) = ${ftex}` }],
      answer,
      inputHint,
      hints,
      solution,
      misconceptions: valid,
      ...(steps.length ? { steps } : {}),
    });
  },
  verify(pr) {
    const f = rhsPoly(mathBlocks(pr)[0]);
    // Independent route: the vertex is the midpoint of two points with equal height, f(h - 1) = f(h + 1),
    // and it is the only such center. Solve f(x - 1) = f(x + 1): a((x+1)^2 - (x-1)^2) + 2b = 0.
    const [c, b, a] = f.coeffsIn('x');
    void c;
    const h = b.neg().div(a.mul(2));
    if (!ev(f, h.sub(1)).eq(ev(f, h.add(1)))) return ['vertex is not the center of symmetry'];
    if (pr.answer.kind === 'point') {
      const errs: string[] = [];
      if (!Q(pr.answer.x).eq(h)) errs.push('wrong x');
      if (!Q(pr.answer.y).eq(ev(f, h))) errs.push('wrong y');
      // the vertex is the extreme value: nearby points are all higher (a > 0) or lower (a < 0)
      for (const d of [Q(1, 3), Q(1), Q(5)]) if (ev(f, h.add(d)).sub(ev(f, h)).sign() !== a.sign()) errs.push('not an extreme point');
      return errs;
    }
    if (pr.answer.kind === 'equation') return pr.answer.value === `x = ${numStr(h)}` ? [] : ['wrong axis'];
    return ['unexpected kind'];
  },
};

export const genIntercepts: GeneratorDef = {
  id: 'u4.intercepts',
  skillId: 'S4.15',
  description: 'Find the y-intercept or the x-intercepts of a quadratic function.',
  generate(rng, difficulty) {
    if (difficulty === 1) {
      const form = rng.pick(['standard', 'factored', 'vertex'] as const);
      const a = rng.pick([1, 2, -1, 3, -2]);
      let ftex: string;
      let f: Poly;
      const misconceptions: Misconception[] = [];
      if (form === 'standard') {
        f = X([rng.int(-12, 12), nz(rng, -8, 8), a]);
        ftex = pTex(f);
      } else if (form === 'factored') {
        const r = nz(rng, -6, 6);
        let s = nz(rng, -6, 6);
        while (s === r) s = nz(rng, -6, 6);
        f = factPoly(a, r, s);
        ftex = factTex(a, r, s);
        const wrong = Q(r * s);
        if (!wrong.eq(ev(f, 0))) misconceptions.push({ answer: numStr(wrong), tag: 'sign-error', feedback: 'Substitute $x = 0$ into every factor, including the signs and the leading coefficient.' });
      } else {
        const h = nz(rng, -5, 5);
        const k = nz(rng, -9, 9);
        f = vtxPoly(a, h, k);
        ftex = vtxTex(a, h, k);
        if (!Q(k).eq(ev(f, 0))) misconceptions.push({ answer: String(k), tag: 'graph-reading', feedback: 'That is the $y$-value of the vertex. The $y$-intercept is where $x = 0$.' });
      }
      const y0 = ev(f, 0);
      return makeProblem({
        skillId: 'S4.15',
        tags: [],
        prompt: [p('What is the $y$-intercept of the graph of this function? Type its $y$-value.'), { t: 'math', tex: `f(x) = ${ftex}` }],
        answer: numSpec(y0),
        inputHint: 'Type a number like -6.',
        hints: ['The $y$-intercept is where the graph crosses the $y$-axis.', 'On the $y$-axis, $x = 0$.', 'Find $f(0)$.', form === 'standard' ? 'In standard form, every term with $x$ becomes $0$.' : 'Substitute $0$ for $x$ everywhere, then simplify.'],
        solution: [
          { text: 'Substitute $x = 0$.', tex: `f(0) = ${form === 'standard' ? substituteTex(a, f.coeff('x', 1), f.coeff('x', 0), 0) : ftex.replace(/x/g, '0')}`, why: 'Every point on the $y$-axis has $x = 0$.' },
          { text: 'Simplify.', tex: `f(0) = ${y0.toTex()}`, why: `The graph crosses the $y$-axis at $(0, ${y0.toTex()})$.` },
        ],
        misconceptions,
      });
    }
    if (difficulty === 2) {
      const factored = rng.bool();
      const a = factored ? rng.pick([1, 2, -1, 3]) : rng.pick([1, 1, -1]);
      let r: number;
      let s: number;
      do {
        r = rng.int(-7, 7);
        s = rng.int(-7, 7);
      } while (r === s || r + s === 0);
      const f = factPoly(a, r, s);
      const ftex = factored ? factTex(a, r, s) : pTex(f);
      const zeros = [Q(r), Q(s)];
      const flipped = zeros.map((z) => z.neg());
      return makeProblem({
        skillId: 'S4.15',
        tags: factored ? [] : ['multi-step'],
        prompt: [p('Find the $x$-intercepts of the graph of this function.'), { t: 'math', tex: `f(x) = ${ftex}` }],
        answer: solSpec(zeros),
        inputHint: 'Type the x-values, like 3, -5',
        hints: ['The $x$-intercepts are where the graph crosses the $x$-axis, so $f(x) = 0$.', factored ? 'The function is already factored. Set each factor with $x$ equal to zero.' : 'Factor the expression.', 'Use the zero product property.', 'Each factor gives one $x$-intercept.'],
        solution: [
          { text: 'Set $f(x) = 0$.', tex: `${ftex} = 0`, why: 'On the $x$-axis, $y = 0$.' },
          ...(factored ? [] : [{ text: 'Factor.', tex: `${factTex(a, r, s)} = 0` }]),
          { text: 'Set each factor equal to zero.', tex: `x = ${r} \\text{ or } x = ${s}`, why: `The graph crosses the $x$-axis at $(${r}, 0)$ and $(${s}, 0)$.` },
        ],
        misconceptions: [{ answer: flipped.map((z) => z.toString()).join(', '), tag: 'sign-error', feedback: 'Check the signs. The factor $x + 4$ is zero when $x = -4$.' }],
      });
    }
    // vertex form a(x - h)^2 + k: zeros h ± sqrt(-k/a)
    const a = rng.pick([1, 2, -1, -2, 3]);
    const h = nz(rng, -5, 5);
    const kind = rng.pick(['square', 'radical', 'none', 'square', 'radical'] as const);
    const m = kind === 'square' ? rng.pick([1, 4, 9, 16]) : kind === 'radical' ? rng.pick([2, 3, 5, 6, 7, 8, 12]) : -rng.pick([1, 2, 4, 5]);
    const k = -a * m;
    const f = vtxPoly(a, h, k);
    const ftex = vtxTex(a, h, k);
    const cs = f.coeffsIn('x').map((c) => c.toInt());
    const roots = quadRoots(cs[2], cs[1], cs[0]);
    const misconceptions: Misconception[] = [];
    if (kind === 'square') misconceptions.push({ answer: String(h + Math.sqrt(m)), tag: 'missing-solution', feedback: 'Taking a square root gives a positive and a negative answer. Use $\\pm$.' });
    return makeProblem({
      skillId: 'S4.15',
      tags: ['multi-step'],
      prompt: [p('Find the $x$-intercepts of the graph of this function. Give exact values. If the graph never crosses the $x$-axis, type none.'), { t: 'math', tex: `f(x) = ${ftex}` }],
      answer: { kind: 'solutions', values: roots.values },
      inputHint: SOL_HINT,
      hints: ['Set $f(x) = 0$.', `Isolate the squared part: move $${k}$ to the other side, then divide by $${a}$.`, 'Take the square root of both sides, with $\\pm$.', 'If the squared part would have to equal a negative number, there are no $x$-intercepts.'],
      solution: [
        { text: 'Set $f(x) = 0$ and isolate the square.', tex: `${coefTex(a)}\\left(x ${h < 0 ? '+' : '-'} ${Math.abs(h)}\\right)^{2} = ${-k} \\Rightarrow \\left(x ${h < 0 ? '+' : '-'} ${Math.abs(h)}\\right)^{2} = ${m}`, why: 'Undo the $+k$ first, then the multiplication by $a$.' },
        m < 0
          ? { text: 'A square is never negative.', why: `No real number squared equals $${m}$, so the graph has no $x$-intercepts. Its vertex $(${h}, ${k})$ is ${a > 0 ? 'above' : 'below'} the $x$-axis and it opens ${a > 0 ? 'up' : 'down'}.` }
          : { text: 'Take square roots and solve.', tex: roots.tex, why: 'Both the positive and negative square root work.' },
      ],
      misconceptions,
    });
  },
  verify(pr) {
    const f = rhsPoly(mathBlocks(pr)[0]);
    if (pr.answer.kind === 'number') {
      // y-intercept: the constant coefficient
      return Q(pr.answer.value).eq(f.coeff('x', 0)) ? [] : ['wrong y-intercept'];
    }
    if (pr.answer.kind !== 'solutions') return ['unexpected kind'];
    return checkSolutions(f, pr.answer.values);
  },
};

/** A parabola a(x - h)^2 + k with a = ±1 and zeros h ± m (integers) to graph. */
function graphedParabola(rng: Rng, allowNoZeros = false): { a: number; h: number; k: number; m: number; f: Poly; spec: GraphSpec } {
  const a = rng.pick([1, -1]);
  const h = rng.int(-4, 4);
  const m = allowNoZeros ? rng.int(0, 3) : rng.int(1, 3);
  const k = m === 0 ? a * -rng.int(1, 4) * -1 : -a * m * m;
  const f = vtxPoly(a, h, k);
  const xs = [h - 4, h + 4];
  const ys = [k, ev(f, h - 3).toNumber()];
  const w = windowFor(xs, ys, 0, 1);
  const pts = m > 0 ? [{ x: h, y: k }, { x: h - m, y: 0 }, { x: h + m, y: 0 }] : [{ x: h, y: k }];
  return {
    a,
    h,
    k,
    m,
    f,
    spec: {
      ...w,
      functions: [{ expr: gexpr(f), label: 'y = f(x)' }],
      points: pts,
      ariaLabel: `A parabola opening ${a > 0 ? 'up' : 'down'} with vertex at (${h}, ${k})${m > 0 ? ` crossing the x-axis at ${h - m} and ${h + m}` : ''}.`,
    },
  };
}

const INF = '∞';
const iv = (lo: number | null, hi: number | null, closed = false) => `${lo === null ? `(-${INF}` : `${closed ? '[' : '('}${lo}`}, ${hi === null ? `${INF})` : `${hi}${closed ? ']' : ')'}`}`;
const END = {
  upUp: 'As $x \\to -\\infty$, $f(x) \\to \\infty$, and as $x \\to \\infty$, $f(x) \\to \\infty$.',
  downDown: 'As $x \\to -\\infty$, $f(x) \\to -\\infty$, and as $x \\to \\infty$, $f(x) \\to -\\infty$.',
  downUp: 'As $x \\to -\\infty$, $f(x) \\to -\\infty$, and as $x \\to \\infty$, $f(x) \\to \\infty$.',
  upDown: 'As $x \\to -\\infty$, $f(x) \\to \\infty$, and as $x \\to \\infty$, $f(x) \\to -\\infty$.',
};
const IV_HINT = 'Like (-∞, 3), (2, ∞) or x < 3';

export const genGraphFeatures: GeneratorDef = {
  id: 'u4.graph-features',
  skillId: 'S4.15',
  description: 'Read the maximum or minimum, intervals of increase and decrease, end behavior and sign from a graph.',
  generate(rng, difficulty) {
    const G = graphedParabola(rng);
    const { a, h, k, m, spec } = G;
    const graph = { t: 'graph' as const, spec };
    const up = a > 0;
    if (difficulty === 1) {
      const kind = up ? 'minimum' : 'maximum';
      const other = up ? 'maximum' : 'minimum';
      const label = (w: string, v: number) => `A ${w} value of $${v}$`;
      const distractors = [label(other, k), ...(h !== k ? [label(kind, h), label(other, h)] : [label(kind, k + 1), label(kind, k - 1)])];
      const answer = makeChoice(rng, label(kind, k), distractors);
      return makeProblem({
        skillId: 'S4.15',
        tags: ['graph'],
        prompt: [p('Does the function have a maximum or a minimum value, and what is it?'), graph],
        answer,
        hints: ['A parabola that opens up has a lowest point; one that opens down has a highest point.', 'That point is the vertex.', 'The maximum or minimum value is a $y$-value (an output), not an $x$-value.', 'Find the vertex on the graph and read its $y$-coordinate.'],
        solution: [
          { text: `The parabola opens ${up ? 'up' : 'down'}.`, why: `So its vertex is its ${up ? 'lowest' : 'highest'} point and $f$ has a ${kind}.` },
          { text: `The vertex is $(${h}, ${k})$.`, why: `The ${kind} value is the $y$-coordinate, $${k}$. It happens at $x = ${h}$.` },
        ],
        misconceptions: [],
        steps: [
          {
            prompt: [p('Does the parabola have a maximum or a minimum?'), graph],
            answer: makeChoice(rng, cap(kind), [cap(other)]),
            hints: ['Look at which way it opens.', 'Opening up means a lowest point.', 'Opening down means a highest point.', 'The vertex is that point.'],
            explanation: `It opens ${up ? 'up' : 'down'}, so it has a ${kind}.`,
          },
          {
            prompt: [p(`What is the ${kind} value?`), graph],
            answer: numSpec(Q(k)),
            hints: ['Find the vertex.', 'Read its $y$-coordinate.', 'The value is an output, not an input.', `The vertex is at $x = ${h}$.`],
            explanation: `The vertex is $(${h}, ${k})$, so the ${kind} value is $${k}$.`,
            misconceptions: h !== k ? [{ answer: String(h), tag: 'graph-reading', feedback: 'That is the $x$-coordinate of the vertex. The value of the function is the $y$-coordinate.' }] : [],
          },
        ],
      });
    }
    if (difficulty === 2) {
      const askInc = rng.bool();
      // increasing left of the vertex when it opens down, right of it when it opens up
      const rightSide = askInc === up;
      const word = askInc ? 'increasing' : 'decreasing';
      const value = rightSide ? iv(h, null) : iv(null, h);
      const misconceptions: Misconception[] = [
        { answer: rightSide ? iv(null, h) : iv(h, null), tag: 'graph-reading', feedback: `Read the graph from left to right. ${cap(word)} means going ${askInc ? 'up' : 'down'} as you move right.` },
        { answer: rightSide ? `[${h}, ${INF})` : `(-${INF}, ${h}]`, tag: 'interval-endpoint', feedback: 'At the vertex the graph is turning around, so we leave the vertex out of the interval. Use a parenthesis, or < instead of ≤.' },
      ];
      if (k !== h) misconceptions.push({ answer: rightSide ? iv(k, null) : iv(null, k), tag: 'graph-reading', feedback: 'Intervals of increase and decrease are written with $x$-values. Use the $x$-coordinate of the vertex.' });
      return makeProblem({
        skillId: 'S4.15',
        tags: ['graph'],
        prompt: [p(`On what interval is the function ${word}?`), graph],
        answer: { kind: 'interval', value: value.replace(INF, 'inf').replace(INF, 'inf') },
        inputHint: IV_HINT,
        hints: [`${cap(word)} means the graph goes ${askInc ? 'up' : 'down'} as you move from left to right.`, 'A parabola changes direction at its vertex.', `The vertex is at $x = ${h}$.`, 'Use $x$-values, and leave the vertex itself out.'],
        solution: [
          { text: `Find the vertex: $(${h}, ${k})$.`, why: 'The graph changes direction there.' },
          { text: `The graph goes ${askInc ? 'up' : 'down'} ${rightSide ? 'to the right' : 'to the left'} of $x = ${h}$.`, tex: rightSide ? `x > ${h}` : `x < ${h}`, why: `The parabola opens ${up ? 'up' : 'down'}.` },
          { text: 'In interval notation:', tex: rightSide ? `(${h}, \\infty)` : `(-\\infty, ${h})` },
        ],
        misconceptions: misconceptions.map((mm) => ({ ...mm, answer: mm.answer.split(INF).join('inf') })),
      });
    }
    if (rng.bool()) {
      const correct = up ? END.upUp : END.downDown;
      const answer = makeChoice(rng, correct, Object.values(END).filter((e) => e !== correct));
      return makeProblem({
        skillId: 'S4.15',
        tags: ['graph'],
        prompt: [p('Describe the end behavior of the function.'), graph],
        answer,
        hints: ['End behavior describes what $f(x)$ does as $x$ moves far left and far right.', 'Look at both arms of the parabola.', 'A parabola has both arms pointing the same way.', 'Up means $f(x) \\to \\infty$; down means $f(x) \\to -\\infty$.'],
        solution: [
          { text: `The parabola opens ${up ? 'up' : 'down'}.`, why: `Its leading coefficient is ${up ? 'positive' : 'negative'}.` },
          { text: `Both arms point ${up ? 'up' : 'down'}.`, why: correct },
        ],
        misconceptions: [],
      });
    }
    const askPos = !up; // opens down: positive between zeros; opens up: negative between zeros
    const lo = h - m;
    const hi = h + m;
    return makeProblem({
      skillId: 'S4.15',
      tags: ['graph'],
      prompt: [p(`On what interval is $f(x) ${askPos ? '> 0' : '< 0'}$ (the graph ${askPos ? 'above' : 'below'} the $x$-axis)?`), graph],
      answer: { kind: 'interval', value: `(${lo}, ${hi})` },
      inputHint: 'Like (-2, 4) or -2 < x < 4',
      hints: [`$f(x) ${askPos ? '> 0' : '< 0'}$ where the graph is ${askPos ? 'above' : 'below'} the $x$-axis.`, 'Find where the graph crosses the $x$-axis.', 'The graph is on one side of the axis between the zeros.', 'At the zeros $f(x) = 0$, which is neither positive nor negative.'],
      solution: [
        { text: `The zeros are $x = ${lo}$ and $x = ${hi}$.`, why: 'That is where the graph crosses the $x$-axis.' },
        { text: `Between them the graph is ${askPos ? 'above' : 'below'} the axis.`, tex: `${lo} < x < ${hi}`, why: `It opens ${up ? 'up' : 'down'} with vertex $(${h}, ${k})$.` },
        { text: 'In interval notation:', tex: `(${lo}, ${hi})` },
      ],
      misconceptions: [{ answer: `[${lo}, ${hi}]`, tag: 'interval-endpoint', feedback: 'At the zeros, $f(x) = 0$, and $0$ is neither positive nor negative. Leave the zeros out.' }],
    });
  },
  verify(pr) {
    const spec = graphOf(pr);
    if (!spec?.functions?.length) return ['no graph'];
    const f = toPoly(parseExpression(spec.functions[0].expr));
    const { a, h, k } = vertexOf(f);
    const up = a.sign() > 0;
    const text = promptText(pr);
    if (pr.answer.kind === 'choice') {
      const label = choiceLabel(pr.answer);
      if (/end behavior/.test(text)) return label === (up ? END.upUp : END.downDown) ? [] : ['wrong end behavior'];
      return label === `A ${up ? 'minimum' : 'maximum'} value of $${k.toTex()}$` ? [] : ['wrong extreme'];
    }
    if (pr.answer.kind !== 'interval') return ['unexpected kind'];
    const got = parseInterval(pr.answer.value);
    // sample the graph: where is it increasing / positive?
    const errs: string[] = [];
    const inside = (x: number) => (got.lo === null || x > got.lo.toNumber()) && (got.hi === null || x < got.hi.toNumber());
    for (let x = h.toNumber() - 6; x <= h.toNumber() + 6; x += 0.25) {
      if (/increasing|decreasing/.test(text)) {
        const rising = ev(f, x + 0.01).gt(ev(f, x));
        const want = /increasing/.test(text) ? rising : !rising;
        if (Math.abs(x - h.toNumber()) > 0.02 && want !== inside(x)) errs.push(`x = ${x} misclassified`);
      } else {
        const y = ev(f, x);
        const want = /> 0/.test(text) ? y.gt(0) : y.lt(0);
        if (want !== inside(x)) errs.push(`x = ${x} misclassified`);
      }
    }
    return errs.slice(0, 3);
  },
};

// ---------------------------------------------------------------------------
// S4.16: domain and range
// ---------------------------------------------------------------------------

export const genDomainRange: GeneratorDef = {
  id: 'u4.domain-range',
  skillId: 'S4.16',
  description: 'Find the domain and range of a quadratic function, including a restricted domain in context.',
  generate(rng, difficulty) {
    if (difficulty === 3) {
      // h(t) = -16(t - n/2)^2 + 16 m^2: lands at t = n/2 + m
      const [n, mm] = rng.pick([[1, 2], [2, 2], [3, 2], [1, 3], [2, 3], [3, 3], [4, 3], [2, 4], [4, 4]] as const);
      const v = 16 * n;
      const h0 = 16 * mm * mm - 4 * n * n;
      const hp = Poly.fromCoeffs('t', [Q(h0), Q(v), Q(-16)]);
      const tv = Q(n, 2);
      const H = Q(16 * mm * mm);
      const T = tv.add(mm);
      const who = rng.pick([
        { thing: 'ball', verb: 'thrown', where: 'thrown upward from the top of a building' },
        { thing: 'model rocket', verb: 'launched', where: 'launched from a platform' },
        { thing: 'water balloon', verb: 'launched', where: 'launched from a rooftop' },
        { thing: 'stone', verb: 'tossed', where: 'tossed upward from the edge of a cliff' },
      ]);
      const askDomain = rng.bool();
      const story = [
        p(`A ${who.thing} is ${who.where}, $${h0}$ feet above the ground. Its height in feet after $t$ seconds is modeled by the function below, from the moment it is ${who.verb} until it lands on the ground.`),
        { t: 'math' as const, tex: `h(t) = ${tTex(hp)}` },
        p(`What is a reasonable ${askDomain ? 'domain' : 'range'} for this situation?`),
      ];
      const value = askDomain ? `[0, ${numStr(T)}]` : `[0, ${numStr(H)}]`;
      const misconceptions: Misconception[] = askDomain
        ? [
            { answer: `[0, ${numStr(tv)}]`, tag: 'interval-endpoint', feedback: `That is when the ${who.thing} reaches its highest point. The model continues until it lands.` },
            { answer: '(-inf, inf)', tag: 'interval-endpoint', feedback: 'The function works for any number, but in this situation time starts at $0$ and stops when it lands.' },
          ]
        : [
            { answer: `[${h0}, ${numStr(H)}]`, tag: 'interval-endpoint', feedback: `The ${who.thing} falls all the way back to the ground before the model stops.` },
            { answer: `(-inf, ${numStr(H)}]`, tag: 'interval-endpoint', feedback: 'The height cannot be negative here. It stops at the ground.' },
          ];
      if (h0 === 0) misconceptions.splice(0, 1);
      const steps: ProblemStep[] = askDomain
        ? [
            {
              prompt: [p(`Solve $h(t) = 0$ to find when the ${who.thing} lands. Give the positive solution.`)],
              answer: numSpec(T),
              hints: ['Set the height equal to $0$.', 'Divide every term by $-16$ or use the quadratic formula.', 'One solution is negative, which is before the launch.', 'Keep the positive solution.'],
              explanation: `$h(t) = 0$ when $t = ${T.toTex()}$ (the other solution, $t = ${tv.sub(mm).toTex()}$, is before the launch).`,
            },
            { prompt: [p('Write the reasonable domain.')], answer: { kind: 'interval', value }, inputHint: 'Like [0, 4] or 0 <= t <= 4', hints: ['Time starts at $0$.', 'Time ends when it lands.', 'Both endpoints are included.', 'Use brackets.'], explanation: `$0 \\le t \\le ${T.toTex()}$.` },
          ]
        : [
            {
              prompt: [p('When does it reach its highest point? Use $t = -\\frac{b}{2a}$.')],
              answer: numSpec(tv),
              hints: [`$a = -16$, $b = ${v}$.`, `$2a = -32$.`, `$-\\frac{${v}}{-32}$.`, 'Simplify the fraction.'],
              explanation: `$t = -\\frac{${v}}{2(-16)} = ${tv.toTex()}$ seconds.`,
            },
            {
              prompt: [p('What is the maximum height?')],
              answer: numSpec(H, 'feet'),
              hints: ['Substitute that time into $h(t)$.', 'Square the time first.', 'Then multiply and add.', 'This is the greatest output.'],
              explanation: `$h(${tv.toTex()}) = ${H.toTex()}$ feet.`,
            },
            { prompt: [p('Write the reasonable range.')], answer: { kind: 'interval', value }, inputHint: 'Like [0, 64] or 0 <= h <= 64', hints: ['The lowest height is the ground.', 'The greatest height is the maximum.', 'Both are included.', 'Use brackets.'], explanation: `$0 \\le h \\le ${H.toTex()}$.` },
          ];
      return makeProblem({
        skillId: 'S4.16',
        tags: ['real-world', 'multi-step'],
        prompt: story,
        answer: { kind: 'interval', value },
        inputHint: askDomain ? 'Like [0, 4] or 0 <= t <= 4' : 'Like [0, 64] or 0 <= h <= 64',
        hints: askDomain
          ? ['The domain is the set of times that make sense.', `Time starts at $t = 0$ when it is ${who.verb}.`, 'It ends when the height is $0$ again.', 'Solve $h(t) = 0$ and keep the positive solution.']
          : ['The range is the set of heights that make sense.', 'The greatest height is at the vertex.', `The lowest height is when it lands on the ground.`, 'Find the vertex with $t = -\\frac{b}{2a}$.'],
        solution: askDomain
          ? [
              { text: 'Find when it lands by solving $h(t) = 0$.', tex: `${tTex(hp)} = 0 \\Rightarrow t = ${T.toTex()} \\text{ or } t = ${tv.sub(mm).toTex()}`, why: 'A negative time is before the launch, so only the positive solution fits.' },
              { text: 'Time runs from the launch to the landing.', tex: `0 \\le t \\le ${T.toTex()}`, why: 'So the domain is $[0, ' + T.toTex() + ']$.' },
            ]
          : [
              { text: 'Find the time of the maximum.', tex: `t = -\\frac{${v}}{2(-16)} = ${tv.toTex()}` },
              { text: 'Find the maximum height.', tex: `h(${tv.toTex()}) = ${H.toTex()}` },
              { text: 'The height goes from the ground up to the maximum.', tex: `0 \\le h(t) \\le ${H.toTex()}`, why: `It starts at $${h0}$ feet, rises to $${H.toTex()}$ feet and falls back to $0$, so every height from $0$ to $${H.toTex()}$ happens.` },
            ],
        misconceptions,
        steps,
      });
    }
    const a = rng.pick([1, 2, 3, -1, -2, -3]);
    const h = nz(rng, -6, 6);
    let k = rng.int(-9, 9);
    if (k === h) k = k + 1;
    const f = vtxPoly(a, h, k);
    const ftex = difficulty === 1 ? vtxTex(a, h, k) : pTex(f);
    const askDomain = difficulty === 2 && rng.int(0, 2) === 0;
    const up = a > 0;
    const value = askDomain ? '(-inf, inf)' : up ? `[${k}, inf)` : `(-inf, ${k}]`;
    const misconceptions: Misconception[] = askDomain
      ? [{ answer: value === '(-inf, inf)' ? (up ? `[${k}, inf)` : `(-inf, ${k}]`) : '', tag: 'interval-endpoint', feedback: 'That is the range (the outputs). The domain is the set of inputs you can use.' }]
      : [
          { answer: up ? `[${h}, inf)` : `(-inf, ${h}]`, tag: 'interval-endpoint', feedback: 'The range is about $y$-values. Use the $y$-coordinate of the vertex.' },
          { answer: up ? `(-inf, ${k}]` : `[${k}, inf)`, tag: 'inequality-direction', feedback: `The parabola opens ${up ? 'up' : 'down'}. Are the outputs above or below the vertex?` },
          { answer: up ? `(${k}, inf)` : `(-inf, ${k})`, tag: 'interval-endpoint', feedback: 'The vertex is on the graph, so its $y$-value is in the range. Use a bracket.' },
        ];
    const steps: ProblemStep[] =
      difficulty === 2 && !askDomain
        ? [
            { prompt: [p(`Find the vertex of $f(x) = ${ftex}$.`)], answer: pointSpec(Q(h), Q(k)), inputHint: 'Type a point like (2, -5).', hints: ['Use $x = -\\frac{b}{2a}$.', `$a = ${a}$, $b = ${f.coeff('x', 1).toTex()}$.`, 'Substitute that $x$-value into $f$.', 'Write the point.'], explanation: `The vertex is $(${h}, ${k})$.` },
            { prompt: [p('Now write the range.')], answer: { kind: 'interval', value }, inputHint: IV_HINT, hints: [`The parabola opens ${up ? 'up' : 'down'}.`, `The ${up ? 'least' : 'greatest'} output is the $y$-value of the vertex.`, 'Include that value.', 'Use brackets for included endpoints.'], explanation: `$y ${up ? '\\ge' : '\\le'} ${k}$.`, misconceptions },
          ]
        : [];
    return makeProblem({
      skillId: 'S4.16',
      tags: steps.length ? ['multi-step'] : [],
      prompt: [p(`What is the ${askDomain ? 'domain' : 'range'} of this function?`), { t: 'math', tex: `f(x) = ${ftex}` }],
      answer: { kind: 'interval', value },
      inputHint: askDomain ? 'Like (-inf, inf) or all real numbers' : 'Like [3, inf) or y >= 3',
      hints: askDomain
        ? ['The domain is the set of inputs ($x$-values) you are allowed to use.', 'Can you square any number and multiply and add?', 'Is there any number you could not substitute for $x$?', 'A parabola keeps spreading left and right forever.']
        : ['The range is the set of outputs ($y$-values).', difficulty === 1 ? 'In vertex form $a(x - h)^{2} + k$, the vertex is $(h, k)$.' : 'Find the vertex first, using $x = -\\frac{b}{2a}$.', `The sign of $a$ tells you whether the vertex is the lowest or highest point.`, 'Include the vertex value; use a bracket.'],
      solution: askDomain
        ? [{ text: 'Any real number can be squared, multiplied and added.', tex: '(-\\infty, \\infty)', why: 'There is no input that fails, so the domain is all real numbers.' }]
        : [
            { text: `Find the vertex: $(${h}, ${k})$.`, ...(difficulty === 2 ? { tex: `x = -\\frac{${f.coeff('x', 1).toTex()}}{2(${a})} = ${h},\\ f(${h}) = ${k}` } : {}) },
            { text: `$a = ${a}$ is ${up ? 'positive' : 'negative'}, so the parabola opens ${up ? 'up' : 'down'}.`, why: `The vertex is the ${up ? 'lowest' : 'highest'} point, so every output is ${up ? 'at least' : 'at most'} $${k}$.` },
            { text: 'Write the range.', tex: up ? `y \\ge ${k} \\text{, or } [${k}, \\infty)` : `y \\le ${k} \\text{, or } (-\\infty, ${k}]` },
          ],
      misconceptions: misconceptions.filter((mm) => mm.answer),
      ...(steps.length ? { steps } : {}),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'interval') return ['unexpected kind'];
    const blocks = mathBlocks(pr);
    const text = promptText(pr);
    const got = parseInterval(pr.answer.value);
    if (/domain/.test(text) && !/reasonable/.test(text)) return got.lo === null && got.hi === null ? [] : ['domain should be all reals'];
    const v = /h\(t\)/.test(blocks[0]) ? 't' : 'x';
    const f = rhsPoly(blocks[0]);
    const { a, k } = vertexOf(f, v);
    if (/reasonable domain/.test(text)) {
      // landing time: the root where the graph comes down through 0, found by sign checks
      const cs = f.coeffsIn('t').map((c) => c.toInt());
      const roots = quadRoots(cs[2], cs[1], cs[0]).values.map((s) => Q(s));
      const T = roots.find((r) => r.gt(0));
      if (!T || roots.some((r) => r.gt(0) && !r.eq(T))) return ['landing time unclear'];
      return intervalsEqual(got, { lo: Q(0), loClosed: true, hi: T, hiClosed: true }) ? [] : ['wrong domain'];
    }
    if (/reasonable range/.test(text)) {
      if (ev(f, 0, 't').lt(0)) return ['starts underground'];
      return intervalsEqual(got, { lo: Q(0), loClosed: true, hi: k, hiClosed: true }) ? [] : ['wrong range'];
    }
    const want = a.sign() > 0 ? { lo: k, loClosed: true, hi: null, hiClosed: false } : { lo: null, loClosed: false, hi: k, hiClosed: true };
    return intervalsEqual(got, want) ? [] : ['wrong range'];
  },
};

// ---------------------------------------------------------------------------
// S4.17: transformations
// ---------------------------------------------------------------------------

type Tf =
  | { t: 'up'; n: number }
  | { t: 'right'; n: number } // negative n means left
  | { t: 'vscale'; k: Rational } // k*f(x), k > 0
  | { t: 'reflect' }
  | { t: 'hscale'; c: Rational }; // x-coordinates multiplied by c: g(x) = f(x / c)

/** f(inner(x)) for polynomials. */
function compose(f: Poly, inner: Poly): Poly {
  const cs = f.coeffsIn('x');
  let acc = Poly.const(Q(0));
  for (let i = cs.length - 1; i >= 0; i--) acc = acc.mul(inner).add(Poly.const(cs[i]));
  return acc;
}

function applyTf(f: Poly, tf: Tf): Poly {
  switch (tf.t) {
    case 'up':
      return f.add(X([tf.n]));
    case 'right':
      return compose(f, X([-tf.n, 1]));
    case 'vscale':
      return f.scale(tf.k);
    case 'reflect':
      return f.scale(Q(-1));
    case 'hscale':
      return compose(f, Poly.fromCoeffs('x', [Q(0), Q(1).div(tf.c)]));
  }
}

const fracWord = (r: Rational) => `$${r.toTex()}$`;
function tfLabel(tf: Tf): string {
  switch (tf.t) {
    case 'up':
      return `shifts ${tf.n > 0 ? 'up' : 'down'} ${Math.abs(tf.n)} unit${Math.abs(tf.n) === 1 ? '' : 's'}`;
    case 'right':
      return `shifts ${tf.n > 0 ? 'right' : 'left'} ${Math.abs(tf.n)} unit${Math.abs(tf.n) === 1 ? '' : 's'}`;
    case 'vscale':
      return `is vertically ${tf.k.gt(1) ? 'stretched' : 'compressed'} by a factor of ${fracWord(tf.k)}`;
    case 'reflect':
      return 'is reflected across the $x$-axis';
    case 'hscale':
      return `is horizontally ${tf.c.gt(1) ? 'stretched' : 'compressed'} by a factor of ${fracWord(tf.c)}`;
  }
}
const describe = (tfs: Tf[]) => `The graph of $f$ ${tfs.map(tfLabel).join(' and ')}.`;

/** Parse a description back into transformations (verify's independent reading of the label). */
function parseDescription(label: string): Tf[] {
  const body = label.replace(/^The graph of \$f\$ /, '').replace(/\.$/, '');
  return body.split(' and ').map((part): Tf => {
    let m = /^shifts (up|down|left|right) (\d+) units?$/.exec(part);
    if (m) {
      const n = Number(m[2]);
      if (m[1] === 'up' || m[1] === 'down') return { t: 'up', n: m[1] === 'up' ? n : -n };
      return { t: 'right', n: m[1] === 'right' ? n : -n };
    }
    if (part === 'is reflected across the $x$-axis') return { t: 'reflect' };
    m = /^is (vertically|horizontally) (stretched|compressed) by a factor of \$(.+)\$$/.exec(part);
    if (m) {
      const r = toPoly(parseExpression(m[3].replace(/\\frac\{(\d+)\}\{(\d+)\}/, '($1/$2)'))).constantValue();
      if ((m[2] === 'stretched') !== r.gt(1)) throw new Error('stretch/compress word does not match factor');
      return m[1] === 'vertically' ? { t: 'vscale', k: r } : { t: 'hscale', c: r };
    }
    throw new Error(`cannot parse "${part}"`);
  });
}

/** The rule g(x) = ... in terms of f, as TeX, for a list of transformations. */
function ruleTex(tfs: Tf[]): string {
  let inner = 'x';
  let outer = 1 as number | Rational;
  let shift = 0;
  let neg = false;
  for (const tf of tfs) {
    if (tf.t === 'up') shift += tf.n;
    else if (tf.t === 'right') inner = tf.n > 0 ? `x - ${tf.n}` : `x + ${-tf.n}`;
    else if (tf.t === 'vscale') outer = tf.k;
    else if (tf.t === 'reflect') neg = true;
    else inner = `${Q(1).div(tf.c).toTex()}x`;
  }
  const o = outer instanceof Rational ? outer : Q(outer);
  const coef = (neg ? '-' : '') + (o.eq(1) ? '' : o.toTex());
  return `g(x) = ${coef}f(${inner})${shift ? (shift > 0 ? ` + ${shift}` : ` - ${-shift}`) : ''}`;
}

/** g as a polynomial, read back from the printed rule g(x) = c f(inner) + d. */
function ruleToPoly(f: Poly, tex: string): Poly {
  const m = /^g\(x\) = (-?)(\\frac\{\d+\}\{\d+\}|\d*)f\((.+?)\)(?: ([+-]) (\d+))?$/.exec(tex);
  if (!m) throw new Error(`cannot read rule ${tex}`);
  const coef = (m[1] ? Q(-1) : Q(1)).mul(m[2] ? toPoly(parseExpression(m[2].replace(/\\frac\{(\d+)\}\{(\d+)\}/, '($1/$2)'))).constantValue() : Q(1));
  const inner = toPoly(parseExpression(m[3].replace(/\\frac\{(\d+)\}\{(\d+)\}/, '($1/$2)')));
  const d = m[4] ? Number(m[5]) * (m[4] === '-' ? -1 : 1) : 0;
  return compose(f, inner).scale(coef).add(X([d]));
}

const PARENT = X([0, 0, 1]);

export const genTransformDescribe: GeneratorDef = {
  id: 'u4.transform-describe',
  skillId: 'S4.17',
  description: 'Describe how g(x) = f(x) + k, f(x + k), k f(x) or f(kx) compares with f(x).',
  generate(rng, difficulty) {
    let f = PARENT;
    let tfs: Tf[];
    let wrongs: Tf[][];
    if (difficulty === 1) {
      const n = nz(rng, -6, 6);
      if (rng.bool()) {
        tfs = [{ t: 'up', n }];
        wrongs = [[{ t: 'up', n: -n }], [{ t: 'right', n }], [{ t: 'right', n: -n }]];
      } else {
        tfs = [{ t: 'right', n }];
        wrongs = [[{ t: 'right', n: -n }], [{ t: 'up', n }], [{ t: 'up', n: -n }]];
      }
    } else if (difficulty === 2) {
      const k = rng.pick([Q(2), Q(3), Q(4), Q(1, 2), Q(1, 3), Q(1, 4), Q(-1), Q(-2), Q(-3), Q(-1, 2)]);
      const pos = k.abs();
      tfs = [...(k.isNegative() ? [{ t: 'reflect' } as Tf] : []), ...(pos.eq(1) ? [] : [{ t: 'vscale', k: pos } as Tf])];
      const flip = pos.eq(1) ? [] : [{ t: 'vscale', k: Q(1).div(pos) } as Tf];
      wrongs = [
        k.isNegative() ? [...(pos.eq(1) ? [{ t: 'vscale', k: Q(1, 2) } as Tf] : [{ t: 'vscale', k: pos } as Tf])] : [{ t: 'reflect' }, ...(pos.eq(1) ? [] : [{ t: 'vscale', k: pos } as Tf])],
        [...(k.isNegative() ? [{ t: 'reflect' } as Tf] : []), ...(flip.length ? flip : [{ t: 'vscale', k: Q(2) } as Tf])],
        [{ t: 'up', n: k.isInteger() ? k.toInt() : k.isNegative() ? -1 : 1 }],
      ];
    } else if (rng.bool()) {
      // f(kx) with a vertex off the y-axis so it differs from a vertical stretch
      const h0 = nz(rng, -4, 4);
      const k0 = rng.int(-4, 4);
      f = vtxPoly(1, h0, k0);
      const k = rng.pick([Q(2), Q(3), Q(1, 2), Q(1, 3)]);
      const c = Q(1).div(k);
      tfs = [{ t: 'hscale', c }];
      wrongs = [[{ t: 'hscale', c: k }], [{ t: 'vscale', k }], [{ t: 'vscale', k: c }]];
    } else {
      const n = nz(rng, -5, 5);
      const d = nz(rng, -6, 6);
      tfs = [{ t: 'right', n }, { t: 'up', n: d }];
      wrongs = [[{ t: 'right', n: -n }, { t: 'up', n: d }], [{ t: 'right', n }, { t: 'up', n: -d }], [{ t: 'right', n: -n }, { t: 'up', n: -d }]];
    }
    const g = tfs.reduce(applyTf, f);
    const rule = ruleTex(tfs);
    const correct = describe(tfs);
    const answer = makeChoice(rng, correct, wrongs.map(describe));
    const fTex = `f(x) = ${f.equals(PARENT) ? 'x^{2}' : vtxTex(1, vertexOf(f).h, vertexOf(f).k)}`;
    const hasH = tfs.some((t) => t.t === 'right' || t.t === 'hscale');
    const hasScale = tfs.some((t) => t.t === 'hscale');
    const vOnly = tfs.every((t) => t.t === 'vscale' || t.t === 'reflect');
    return makeProblem({
      skillId: 'S4.17',
      tags: [],
      prompt: [p('How does the graph of $g$ compare with the graph of $f$?'), { t: 'math', tex: fTex }, { t: 'math', tex: rule }],
      answer,
      hints: [
        'A change outside $f$ (added to or multiplied by $f(x)$) affects the $y$-values: up, down, stretch or reflect.',
        'A change inside the parentheses with $x$ affects the $x$-values, and it works the opposite way from how it looks.',
        hasScale
          ? '$g$ matches $f$ when $kx$ equals the old input, so each $x$-coordinate is divided by $k$. $f(2x)$ squeezes the graph toward the $y$-axis; $f(\\frac{1}{2}x)$ stretches it.'
          : hasH
            ? 'Ask: what input makes the inside equal to what it was before? $f(x - 3)$ needs $x = 3$ to match $f(0)$, so the graph moves right.'
            : vOnly
              ? 'Multiplying $f(x)$ by a number whose absolute value is greater than $1$ stretches the graph away from the $x$-axis; between $0$ and $1$ it compresses it; a negative sign flips it over the $x$-axis.'
              : 'Adding a positive number to $f(x)$ moves every point up; adding a negative number moves every point down.',
        'Test one point: pick a point on $f$ and find where it goes on $g$.',
      ],
      solution: [
        { text: 'Look at where the change is.', tex: rule, why: hasScale ? 'A number multiplying $x$ inside changes the inputs: $f(kx)$ squeezes the graph toward the $y$-axis when $k > 1$ and stretches it away when $0 < k < 1$, the opposite of what the number suggests.' : hasH ? 'A change inside the parentheses changes the inputs, so it moves the graph horizontally, opposite to the sign you see.' : 'A change outside $f$ changes the outputs, so it moves or stretches the graph vertically.' },
        { text: correct, why: tfs.some((t) => t.t === 'hscale') ? `For example, $g$ reaches the vertex value when the inside equals ${vertexOf(f).h.toTex()}, which happens at $x = ${vertexOf(g).h.toTex()}$.` : tfs.every((t) => t.t === 'vscale' || t.t === 'reflect') ? `For example, the point $(1, ${ev(f, 1).toTex()})$ on $f$ moves to $(1, ${ev(g, 1).toTex()})$: every $y$-value is multiplied by the same number.` : `For example, the vertex of $f$ at $(${vertexOf(f).h.toTex()}, ${vertexOf(f).k.toTex()})$ moves to $(${vertexOf(g).h.toTex()}, ${vertexOf(g).k.toTex()})$.` },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const [fTex, rule] = mathBlocks(pr);
    const f = rhsPoly(fTex);
    const g = ruleToPoly(f, rule);
    const errs: string[] = [];
    for (const o of pr.answer.options) {
      const h = parseDescription(o.label).reduce(applyTf, f);
      const matches = h.equals(g);
      if (o.id === pr.answer.correct && !matches) errs.push('key does not produce g');
      if (o.id !== pr.answer.correct && matches) errs.push(`distractor "${o.label}" also produces g`);
    }
    return errs;
  },
};

export const genTransformFindK: GeneratorDef = {
  id: 'u4.transform-find-k',
  skillId: 'S4.17',
  description: 'Find k from the graphs of f and g = f(x) + k, f(x + k), k f(x) or f(kx).',
  generate(rng, difficulty) {
    const mode = difficulty === 1 ? 'add' : difficulty === 2 ? rng.pick(['inside', 'times'] as const) : 'kx';
    let f: Poly;
    let g: Poly;
    let k: Rational;
    let rule: string;
    let fPts: Array<{ x: number; y: number; label: string }>;
    let gPts: Array<{ x: number; y: number; label: string }>;
    const misconceptions: Misconception[] = [];
    let why: string;
    if (mode === 'add' || mode === 'inside') {
      const h0 = rng.int(-3, 3);
      const k0 = rng.int(-3, 3);
      f = vtxPoly(rng.pick([1, -1]), h0, k0);
      const n = nz(rng, -4, 4);
      k = Q(n);
      if (mode === 'add') {
        g = f.add(X([n]));
        rule = 'g(x) = f(x) + k';
        why = `Every point moves ${n > 0 ? 'up' : 'down'} $${Math.abs(n)}$, so $k = ${n}$.`;
        misconceptions.push({ answer: String(-n), tag: 'sign-error', feedback: 'Moving up means adding a positive number; moving down means adding a negative number.' });
      } else {
        g = compose(f, X([n, 1]));
        rule = 'g(x) = f(x + k)';
        why = `The graph moves ${n > 0 ? 'left' : 'right'} $${Math.abs(n)}$. $f(x + k)$ moves the graph left when $k > 0$, so $k = ${n}$.`;
        misconceptions.push({ answer: String(-n), tag: 'vertex-sign', feedback: 'A change inside the parentheses works opposite to how it looks: $f(x + 2)$ moves the graph LEFT 2.' });
      }
      const vf = vertexOf(f);
      const vg = vertexOf(g);
      fPts = [{ x: vf.h.toInt(), y: vf.k.toInt(), label: `(${vf.h.toInt()}, ${vf.k.toInt()})` }];
      gPts = [{ x: vg.h.toInt(), y: vg.k.toInt(), label: `(${vg.h.toInt()}, ${vg.k.toInt()})` }];
    } else if (mode === 'times') {
      f = PARENT;
      k = rng.pick([Q(2), Q(3), Q(-1), Q(-2), Q(1, 2), Q(-3)]);
      g = f.scale(k);
      rule = 'g(x) = k \\cdot f(x)';
      const x1 = 2;
      fPts = [{ x: x1, y: 4, label: '(2, 4)' }];
      gPts = [{ x: x1, y: k.mul(4).toNumber(), label: `(2, ${k.mul(4).toString()})` }];
      why = `At $x = 2$, $f(2) = 4$ and $g(2) = ${k.mul(4).toTex()}$. Since $g(2) = k \\cdot f(2)$, $k = \\frac{${k.mul(4).toTex()}}{4} = ${k.toTex()}$.`;
      misconceptions.push({ answer: numStr(k.mul(4).sub(4)), tag: 'arithmetic-error', feedback: '$k$ multiplies the outputs. Divide the $g$ value by the $f$ value instead of subtracting.' });
    } else {
      // f(x) = x^2 - 4 with zeros ±2; f(kx) has zeros ±2/k
      f = X([-4, 0, 1]);
      k = rng.pick([Q(2), Q(1, 2)]);
      g = compose(f, Poly.fromCoeffs('x', [Q(0), k]));
      rule = 'g(x) = f(kx)';
      const z = Q(2).div(k);
      fPts = [{ x: 2, y: 0, label: '(2, 0)' }, { x: -2, y: 0, label: '(-2, 0)' }];
      gPts = [{ x: z.toNumber(), y: 0, label: `(${z.toString()}, 0)` }, { x: -z.toNumber(), y: 0, label: `(-${z.toString()}, 0)` }];
      why = `$f(2) = 0$, so $g(x) = f(kx) = 0$ when $kx = 2$. The graph of $g$ crosses at $x = ${z.toTex()}$, so $k \\cdot ${z.toTex()} = 2$ and $k = ${k.toTex()}$.`;
      misconceptions.push({ answer: numStr(Q(1).div(k)), tag: 'other', feedback: 'With $f(kx)$ the $x$-values are divided by $k$, not multiplied. Check: does $k$ times the new zero give the old zero?' });
    }
    const all = [...fPts, ...gPts];
    const ys = [...all.map((q) => q.y), vertexOf(f).k.toNumber(), vertexOf(g).k.toNumber(), ev(f, -3).toNumber(), ev(g, -3).toNumber(), ev(f, 3).toNumber(), ev(g, 3).toNumber()];
    const opens = (q: Poly) => (q.coeff('x', 2).sign() > 0 ? 4 : -4);
    const extra = [f, g].map((q) => vertexOf(q).k.toNumber() + opens(q)).filter((y) => Math.abs(y) < 20);
    const w = windowFor(all.map((q) => q.x).concat([-5, 5]), ys.filter((y) => Math.abs(y) < 20).concat(extra), 1, 1);
    const spec: GraphSpec = {
      ...w,
      functions: [
        { expr: gexpr(f), label: 'f' },
        { expr: gexpr(g), label: 'g', dashed: true },
      ],
      points: [...fPts, ...gPts],
      ariaLabel: `Two parabolas: f through ${fPts.map((q) => q.label).join(' and ')}, and g (dashed) through ${gPts.map((q) => q.label).join(' and ')}.`,
    };
    return makeProblem({
      skillId: 'S4.17',
      tags: ['graph'],
      prompt: [p('The graphs of $f$ (solid) and $g$ (dashed) are shown. The rule for $g$ is below. Find $k$.'), { t: 'math', tex: rule }, { t: 'graph', spec }],
      answer: numSpec(k),
      inputHint: 'Type a number like -3 or 1/2.',
      hints: [
        'Compare a labeled point on $f$ with the matching point on $g$.',
        mode === 'add' ? 'How far up or down did the vertex move?' : mode === 'inside' ? 'How far left or right did the vertex move? Inside changes work opposite to their sign.' : mode === 'times' ? 'The $x$-value stays the same; the $y$-value is multiplied by $k$.' : 'The $y$-value stays the same; compare the $x$-values where each graph crosses the $x$-axis.',
        mode === 'add' ? '$k$ is positive for up and negative for down.' : mode === 'inside' ? '$f(x + 3)$ moves the graph left 3, and $f(x - 3)$ moves it right 3.' : mode === 'times' ? 'Divide the $g$ value by the $f$ value.' : '$g(x) = f(kx)$, so $g$ crosses where $kx$ equals a zero of $f$.',
        'Check your $k$ by applying the rule to the labeled point on $f$.',
      ],
      solution: [
        { text: 'Compare matching points.', why },
        { text: 'Check.', why: 'Applying the rule with this $k$ to every point of $f$ gives the dashed graph.' },
      ],
      misconceptions: misconceptions.filter((mm) => !Q(mm.answer).eq(k)),
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    const spec = graphOf(pr)!;
    const f = toPoly(parseExpression(spec.functions![0].expr));
    const g = toPoly(parseExpression(spec.functions![1].expr));
    const rule = mathBlocks(pr)[0];
    const k = Q(pr.answer.value);
    let want: Poly;
    if (rule === 'g(x) = f(x) + k') want = f.add(Poly.const(k));
    else if (rule === 'g(x) = f(x + k)') want = compose(f, Poly.fromCoeffs('x', [k, Q(1)]));
    else if (rule === 'g(x) = k \\cdot f(x)') want = f.scale(k);
    else if (rule === 'g(x) = f(kx)') want = compose(f, Poly.fromCoeffs('x', [Q(0), k]));
    else return ['unknown rule'];
    const errs = want.equals(g) ? [] : ['k does not map f onto g'];
    // labeled points must lie on their graphs
    for (const q of spec.points ?? []) if (!ev(f, Q(String(q.x))).eq(Q(String(q.y))) && !ev(g, Q(String(q.x))).eq(Q(String(q.y)))) errs.push(`point (${q.x}, ${q.y}) is on neither graph`);
    return errs;
  },
};

export const U4_FUNCTION_GENERATORS: GeneratorDef[] = [genEvaluateQuadratic, genInterpretNotation, genVertexAxis, genIntercepts, genGraphFeatures, genDomainRange, genTransformDescribe, genTransformFindK];

// silence unused-import lint in some builds
void tailTex;
export type { Problem };
