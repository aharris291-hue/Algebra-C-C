/**
 * Unit 4, Lessons 12-15 generators: quadratic function notation (S4.14), key features of
 * parabolas (S4.15), domain and range (S4.16) and transformations (S4.17). Keys come from the
 * construction; verify() re-reads the printed function (equation, table or graph) and
 * re-derives the answer exactly: vertex from -b/(2a), zeros by substitution, transformations by
 * composing polynomials.
 */
import type { GeneratorDef, Rng, ProblemStep, Problem, GraphSpec, Block } from '../../core/curriculum/types';
import type { Misconception, MisconceptionTag } from '../../core/math/answers';
import { parseInterval, intervalsEqual } from '../../core/math/answers';
import { parseExpression } from '../../core/math/parser';
import { toPoly, Poly } from '../../core/math/poly';
import { Rational } from '../../core/math/rational';
import { p, makeProblem, makeChoice, choiceLabel, numStr, Q, numberMisconceptions } from './util';
import {
  X, pTex, pPlain, texPoly, checkSolutions, quadRoots, ev, vertexOf, vtxTex, vtxPlain, vtxPoly, factTex, factPoly, rhsPoly, mathBlocks, promptText, graphOf, substituteTex, joinNums, tailTex, coefTex,
  fixedChoice, choiceMis, choiceMisList, numMis, gstep, checkSteps, pickLabel,
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

/** Evaluate, or solve f(x) = y, using a table of a quadratic function (A.FGR.7.1). */
function evalFromTable(rng: Rng, difficulty: 1 | 2): Problem {
  const a = rng.pick([1, 2, -1, -2, 3]);
  const h = rng.int(-2, 3);
  const k = rng.int(-8, 8);
  const f = vtxPoly(a, h, k);
  const xs = [-3, -2, -1, 0, 1, 2, 3].map((d) => h + d);
  const table = { t: 'table' as const, headers: ['$x$', '$f(x)$'], rows: xs.map((x) => [`$${x}$`, `$${ev(f, x).toTex()}$`]) };
  if (difficulty === 1) {
    const x0 = rng.pick(xs.filter((x) => x !== h));
    const val = ev(f, x0);
    return makeProblem({
      skillId: 'S4.14',
      tags: [],
      prompt: [p('The table shows some values of a quadratic function $f$.'), table, p(`What is $f(${x0})$?`)],
      answer: numSpec(val),
      hints: [`$f(${x0})$ means the output when the input is $${x0}$.`, 'Inputs are in the $x$ column; outputs are in the $f(x)$ column.', `Find the row where $x = ${x0}$.`, 'Read across that row to the output.'],
      solution: [{ text: `Find the row with $x = ${x0}$.`, why: 'A table pairs each input with its output.' }, { text: 'Read the output.', tex: `f(${x0}) = ${val.toTex()}` }],
      misconceptions: numberMisconceptions(val, [{ value: Q(x0), tag: 'graph-reading', feedback: 'That is the input. $f(' + x0 + ')$ is the output in the same row.' }]),
      steps: [
        gstep(
          `In $f(${x0})$, which number is the **input**?`,
          numSpec(Q(x0)),
          ['Function notation $f(\\text{input}) = \\text{output}$.', 'The input is written inside the parentheses.', 'In the table, inputs are in the $x$ column.', `Read the number inside $f(\\;)$.`],
          `The input is the number inside the parentheses, so look for the row where $x = ${x0}$.`,
          numMis(x0, [{ value: val, tag: 'graph-reading', feedback: 'That number is an output in the table. The input is the number inside the parentheses of $f(\\;)$.' }]),
        ),
        gstep(
          `Find the row where $x = ${x0}$. What is the output $f(x)$ in that row?`,
          numSpec(val),
          ['A table pairs each input with its output in the same row.', 'Go down the $x$ column to the input.', 'Then move across that row to the $f(x)$ column.', `Read the $f(x)$ value next to $x = ${x0}$.`],
          `The row with $x = ${x0}$ has output $${val.toTex()}$, so $f(${x0}) = ${val.toTex()}$.`,
          numberMisconceptions(val, [{ value: Q(x0), tag: 'graph-reading', feedback: 'That is the input. $f(' + x0 + ')$ is the output in the same row.' }]),
        ),
      ],
    });
  }
  const d = rng.int(1, 3);
  const y = ev(f, h + d);
  const others = xs.filter((x) => ev(f, x).eq(y));
  const sols = others.map((x) => Q(x));
  return makeProblem({
    skillId: 'S4.14',
    tags: [],
    prompt: [p('The table shows some values of a quadratic function $f$.'), table, p(`Use the table to find every value of $x$ for which $f(x) = ${y.toTex()}$.`)],
    answer: solSpec(sols),
    inputHint: 'Type every value, separated by a comma, like 3, -1.',
    hints: [
      `$f(x) = ${y.toTex()}$ asks for the **inputs** whose output is $${y.toTex()}$.`,
      `Look down the $f(x)$ column for $${y.toTex()}$.`,
      `A parabola is symmetric about its vertex, here at $x = ${h}$, so an output usually appears twice.`,
      'Read the input in each row where the output matches.',
    ],
    solution: [
      { text: `Find every row with output $${y.toTex()}$.`, tex: sols.map((x) => `f(${x.toTex()}) = ${y.toTex()}`).join(',\\quad '), why: `The outputs are symmetric about $x = ${h}$, where the ${a < 0 ? 'largest' : 'smallest'} output, $${k}$, appears.` },
      { text: 'List the inputs.', tex: `x = ${sols.map((x) => x.toTex()).join(' \\text{ or } x = ')}`, why: 'A quadratic function takes each output (other than the vertex value) at two inputs, and both are in the table.' },
    ],
    misconceptions: [{ answer: sols[0].toString(), tag: 'missing-solution', feedback: 'That input works, but the output appears in another row too. A parabola is symmetric.' }],
  });
}

export const genEvaluateQuadratic: GeneratorDef = {
  id: 'u4.evaluate-quadratic',
  skillId: 'S4.14',
  description: 'Evaluate a quadratic function, or find the inputs that give an output.',
  generate(rng, difficulty) {
    if (difficulty < 3 && rng.int(0, 2) === 0) return evalFromTable(rng, difficulty as 1 | 2);
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
    const tblE = (pr.prompt as Block[]).find((b) => b.t === 'table') as Extract<Block, { t: 'table' }> | undefined;
    if (tblE) {
      const rows = tblE.rows.map((r) => [Q(r[0].replace(/\$/g, '')), Q(r[1].replace(/\$/g, ''))] as [Rational, Rational]);
      const d1 = rows.slice(1).map((r, i) => r[1].sub(rows[i][1]));
      const d2 = d1.slice(1).map((x, i) => x.sub(d1[i]));
      if (rows.some((r, i) => i > 0 && !r[0].sub(rows[i - 1][0]).eq(1)) || d2.some((x) => !x.eq(d2[0])) || d2[0].isZero()) return ['table is not a quadratic'];
      const text = promptText(pr);
      if (pr.answer.kind === 'number') {
        const m = /What is \$f\((-?\d+)\)\$/.exec(text);
        const row = m && rows.find((r) => r[0].eq(Number(m[1])));
        if (!row) return ['input not in table'];
        if (pr.steps) {
          const errs = checkSteps(pr, [m[1], row[1].toString()]);
          if (errs.length) return errs;
        }
        return Q(pr.answer.value).eq(row[1]) ? [] : ['wrong value'];
      }
      if (pr.answer.kind !== 'solutions') return ['unexpected kind'];
      const m = /f\(x\) = (-?\d+)\$\./.exec(text);
      if (!m) return ['cannot read target'];
      const hits = rows.filter((r) => r[1].eq(Number(m[1]))).map((r) => r[0]);
      // a quadratic takes a value at most twice, so two hits in the table are all of them
      if (hits.length !== 2) return ['target should appear exactly twice'];
      const got = pr.answer.values.map((v) => Q(v));
      return got.length === 2 && hits.every((x) => got.some((g) => g.eq(x))) ? [] : ['wrong inputs'];
    }
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
  /** Feedback for each wrong option, with its tag (same order as `wrong`). */
  fb?: Array<[MisconceptionTag, string]>;
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
        {
          ask: 'What does $h(0)$ represent?',
          correct: `The height of ${thing} at the moment it is ${who.verb}`,
          wrong: [`The time when ${thing} hits the ground`, `The greatest height ${thing} reaches`, `The speed of ${thing} when it is ${who.verb}`],
          fb: [
            ['graph-reading', `The $0$ in $h(0)$ is the input, a time of $0$ seconds. Hitting the ground is about the output: it happens when the height is $0$.`],
            ['other', `The greatest height happens at the vertex, partway through the flight, not at $t = 0$. $h(0)$ is the output when the time is $0$ seconds.`],
            ['units', `The function $h$ gives a height in feet, not a speed. $h(0)$ is the value of $h$ when $t = 0$.`],
          ],
        },
        {
          ask: `Which equation would you solve to find when ${thing} hits the ground?`,
          correct: '$h(t) = 0$',
          wrong: ['$h(0) = t$', '$t = 0$', '$h(t) = 16$'],
          fb: [
            ['equation-setup', `$h(0) = t$ mixes up the input and the output: $h(0)$ is the starting height, not a time. When ${thing} lands, which quantity is $0$, the time or the height?`],
            ['equation-setup', `$t = 0$ is the moment ${thing} is ${who.verb}, not when it lands. When it hits the ground, which quantity is $0$, the time or the height?`],
            ['equation-setup', `The $16$ comes from the $-16$ in front of $t^{2}$, which is about gravity, not a height. Ask yourself what the height is when ${thing} is on the ground.`],
          ],
        },
        {
          ask: `Which would you do to find when ${thing} is ${target} feet high?`,
          correct: `Solve $h(t) = ${target}$`,
          wrong: [`Find $h(${target})$`, `Solve $h(t) = 0$`, `Find $h(0) + ${target}$`],
          fb: [
            ['graph-reading', `$h(${target})$ is the height after ${target} seconds, because the number in the parentheses is the time. Here ${target} feet is a height, which is an output of $h$.`],
            ['equation-setup', `Solving $h(t) = 0$ finds when ${thing} hits the ground, at a height of $0$ feet. You want the time for a different height.`],
            ['equation-setup', `$h(0) + ${target}$ is a height, ${target} feet above the starting height. The question asks for a time.`],
          ],
        },
        {
          ask: `What does a solution of $h(t) = ${target}$ tell you?`,
          correct: `A time when ${thing} is ${target} feet above the ground`,
          wrong: [`The height of ${thing} after ${target} seconds`, `How far ${thing} travels in ${target} seconds`, `The greatest height of ${thing}`],
          fb: [
            ['graph-reading', `That would be $h(${target})$, with ${target} as the input. In $h(t) = ${target}$, the ${target} is the output, a height.`],
            ['units', `$h$ gives the height above the ground, not a distance traveled, and the ${target} in $h(t) = ${target}$ is a height, not a number of seconds.`],
            ['other', `Nothing in $h(t) = ${target}$ is about the highest point. Think about what the letter you solve for, $t$, stands for.`],
          ],
        },
      ];
      q = rng.pick(pool);
    }
    const answer = makeChoice(rng, q.correct, q.wrong);
    let steps: ProblemStep[] | undefined;
    if (difficulty === 1) {
      const sec = `${t0} second${t0 === 1 ? '' : 's'}`;
      const measure = fixedChoice('A height, in feet', ['A time, in seconds', 'A speed, in feet per second', `The greatest height ${thing} reaches`]);
      steps = [
        gstep(
          `In $h(${t0}) = ${H.toTex()}$, which number is the **input** $t$, the time in seconds?`,
          numSpec(Q(t0)),
          ['Function notation is $h(\\text{input}) = \\text{output}$.', 'In $h(t)$, the letter inside the parentheses is $t$, the time.', 'The input is the number written inside the parentheses.', `Look inside $h(\\;)$.`],
          `The number inside the parentheses is the input: $t = ${t0}$, a time of ${sec}.`,
          numMis(t0, [{ value: H, tag: 'graph-reading', feedback: 'That number is the output, the value of $h$. The input is the number inside the parentheses.' }]),
        ),
        gstep(
          `So what does the output, $${H.toTex()}$, measure?`,
          measure,
          ['The output of a function is what the function gives back for an input.', 'Read the first sentence: what does $h$ model?', '$h(t)$ is the height of the object at time $t$.', 'Match the output to a quantity and its units.'],
          `$h$ gives the height in feet, so $${H.toTex()}$ is a height of $${H.toTex()}$ feet.`,
          [
            choiceMis(measure, 'A time, in seconds', 'graph-reading', 'Time is the input, inside the parentheses. The output of $h$ is a height.'),
            choiceMis(measure, 'A speed, in feet per second', 'units', 'The function $h$ gives a height in feet, not a speed.'),
            choiceMis(measure, `The greatest height ${thing} reaches`, 'other', `$h(${t0})$ is the height at that one time. Nothing in the notation says it is the highest point.`),
          ],
        ),
        gstep(
          `What does $h(${t0}) = ${H.toTex()}$ mean?`,
          answer,
          ['Put the two pieces together: the input is a time and the output is a height.', `The time is ${sec}.`, `The height at that time is $${H.toTex()}$ feet.`, 'Pick the sentence that says the height at that time, with nothing extra.'],
          `At $t = ${t0}$ seconds the height is $${H.toTex()}$ feet: input time, output height.`,
          [
            choiceMis(answer, q.wrong[0], 'graph-reading', 'That swaps the input and the output. The number inside the parentheses is the time.'),
            choiceMis(answer, q.wrong[1], 'other', 'The notation tells the height at one time. It does not say that this is the highest point.'),
            choiceMis(answer, q.wrong[2], 'units', 'The output of $h$ is a height in feet, not a speed.'),
          ],
        ),
      ];
    }
    return makeProblem({
      skillId: 'S4.14',
      tags: ['real-world'],
      prompt: [story, eq, p(q.ask)],
      answer,
      ...(steps ? { steps } : {}),
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
      misconceptions: q.fb ? choiceMisList(answer, q.wrong.map((w, i): [string, MisconceptionTag, string] => [w, q.fb![i][0], q.fb![i][1]])) : [],
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
      if (pr.steps) errs.push(...checkSteps(pr, [m[1], pickLabel(pr.steps[1].answer, 'A height, in feet'), null]));
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
      const inside = `x ${h.isNegative() ? '+' : '-'} ${h.abs().toTex()}`;
      steps.push(
        gstep(
          `Compare $f(x) = ${ftex}$ with vertex form $a(x - h)^{2} + k$. What is $h$?`,
          numSpec(h),
          ['In vertex form, $h$ is the number **subtracted** from $x$ inside the parentheses.', 'Adding a number is the same as subtracting its opposite: $x + 3 = x - (-3)$.', 'The vertex is where the inside of the parentheses equals $0$.', `Solve $${inside} = 0$.`],
          h.isNegative()
            ? `Rewrite $${inside}$ as $x - (${hTex})$ to match $x - h$, so $h = ${hTex}$: the inside is $0$ when $x = ${hTex}$.`
            : `$${inside}$ matches $x - h$ with $${hTex}$ in the place of $h$, so $h = ${hTex}$: the inside is $0$ when $x = ${hTex}$.`,
          numMis(h, [{ value: h.neg(), tag: 'vertex-sign', feedback: 'Watch the sign: $(x - 3)^{2}$ has $h = 3$, and $(x + 3)^{2}$ has $h = -3$.' }]),
        ),
      );
      if (ask === 'vertex')
        steps.push(
          gstep(
            'What is $k$, the number added at the end?',
            numSpec(k),
            ['In vertex form, $k$ is added after the squared part.', 'A subtraction at the end means $k$ is negative.', k.isZero() ? 'If nothing is added at the end, $k = 0$.' : 'Keep the sign in front of the last number.', 'Read the last term of the function, with its sign.'],
            `$k = ${k.toTex()}$, the ${a < 0 ? 'greatest' : 'least'} output of $f$, since the squared part is $0$ at the vertex.`,
            numMis(k, [k.isZero() ? null : { value: k.neg(), tag: 'sign-error', feedback: 'Keep the sign: a minus sign before the last number makes $k$ negative.' }, { value: A, tag: 'other', feedback: 'That is $a$, the number in front of the parentheses. $k$ is the number added at the end.' }]),
          ),
        );
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
        hints: ['Add the two numbers.', 'Divide by $2$.', `Work out $${r} + ${s < 0 ? `(${s})` : s}$ first.`, 'Halve that.'],
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
      steps.push({
        prompt: [p(`Write the ${what}.`)],
        answer,
        inputHint,
        hints: difficulty === 1 ? (ask === 'vertex' ? ['The vertex is the point $(h, k)$.', 'Use the $h$ and $k$ you found.', 'The $x$-coordinate comes first.', 'Write it as an ordered pair in parentheses.'] : ['The axis of symmetry is the vertical line through the vertex.', 'A vertical line has an equation $x = $ a number.', 'Use the $h$ you found.', 'Write it as $x = h$.']) : hints,
        explanation: ask === 'vertex' ? `$(${hTex}, ${k.toTex()})$.` : `$x = ${hTex}$.`,
        misconceptions: valid,
      });
    return makeProblem({
      skillId: 'S4.15',
      tags: difficulty > 1 && steps.length ? ['multi-step'] : [],
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
      errs.push(...checkSteps(pr, pr.difficulty === 1 ? [numStr(h), numStr(ev(f, h)), null] : undefined));
      return errs;
    }
    if (pr.answer.kind === 'equation') return pr.answer.value === `x = ${numStr(h)}` ? checkSteps(pr, pr.difficulty === 1 ? [numStr(h), null] : undefined) : ['wrong axis'];
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
      // more common slips, kept only when they differ from the key and from each other
      {
        const [c0, b0] = f.coeffsIn('x');
        const extra: Array<{ value: Rational; tag: Misconception['tag']; feedback: string }> =
          form === 'standard'
            ? [{ value: b0, tag: 'other', feedback: 'That is the coefficient of $x$. Substitute $x = 0$: every term with an $x$ becomes $0$.' }, { value: ev(f, 1), tag: 'other', feedback: 'That is $f(1)$. The $y$-intercept is the output when $x = 0$.' }]
            : form === 'factored'
              ? [{ value: c0.div(a), tag: 'arithmetic-error', feedback: 'Multiply by the leading coefficient too: it is a factor of $f(x)$.' }, { value: c0.neg(), tag: 'sign-error', feedback: 'Check the signs: at $x = 0$ the factor $(x - r)$ is $-r$.' }]
              : [{ value: c0.sub(ev(vtxPoly(1, vertexOf(f).h.toNumber(), 0), 0).mul(a - 1)), tag: 'order-of-operations', feedback: 'Square first, then multiply by the leading coefficient, then add $k$.' }];
        const seen = [c0, ...misconceptions.map((m) => Q(m.answer))];
        for (const e of extra) if (a !== 1 || e.tag !== 'arithmetic-error') if (!seen.some((v) => v.eq(e.value))) { seen.push(e.value); misconceptions.push({ answer: numStr(e.value), tag: e.tag, feedback: e.feedback }); }
      }
      const y0 = ev(f, 0);
      const final = gstep(
        `So what is the $y$-intercept, $f(0)$?`,
        numSpec(y0),
        ['The $y$-intercept is the output when $x = 0$.', 'Use the values you found in the earlier steps.', form === 'standard' ? 'Add the constant term to what is left.' : form === 'factored' ? 'Multiply the leading coefficient by both factor values.' : 'Add $k$, the number at the end.', 'Keep track of negative signs.'],
        `$f(0) = ${y0.toTex()}$, so the graph crosses the $y$-axis at $(0, ${y0.toTex()})$.`,
        misconceptions,
        'Type a number like -6.',
      );
      let steps: ProblemStep[];
      if (form === 'standard') {
        const [, b1, a1] = f.coeffsIn('x');
        steps = [
          gstep(
            `Substitute $x = 0$ into $f(x) = ${ftex}$. What do the $x^{2}$ term and the $x$ term add up to?`,
            numSpec(Q(0)),
            ['Every point on the $y$-axis has $x = 0$.', `Replace each $x$ with $0$: $${a1.toTex()}(0)^{2}$ and $${b1.toTex()}(0)$.`, 'Each of those products has a factor of $0$. What does that make each product?', 'Add the two products.'],
            'Both terms have a factor of $x$, so both become $0$ when $x = 0$.',
            numMis(0, [{ value: b1, tag: 'arithmetic-error', feedback: 'Multiply by $0$: any number times $0$ is $0$.' }, { value: a1.add(b1), tag: 'arithmetic-error', feedback: 'Substitute $0$ for $x$ first. Every term with an $x$ becomes $0$.' }]),
          ),
          final,
        ];
      } else if (form === 'factored') {
        // the factors in the order they are printed: (x - r) is -r at x = 0
        const vals = [...ftex.matchAll(/\\left\(x ([+-]) (\d+)\\right\)/g)].map((m) => (m[1] === '-' ? -Number(m[2]) : Number(m[2])));
        steps = vals.map((v, i) =>
          gstep(
            `What is the ${i === 0 ? 'first' : 'second'} factor, $${pTex(X([v, 1]))}$, when $x = 0$?`,
            numSpec(Q(v)),
            ['Every point on the $y$-axis has $x = 0$.', `Replace $x$ with $0$ in $${pTex(X([v, 1]))}$.`, 'Keep the sign that is in the factor.', `Find $0 ${v < 0 ? '-' : '+'} ${Math.abs(v)}$.`],
            `$${pTex(X([v, 1]))}$ at $x = 0$ is $${v}$.`,
            numMis(v, [{ value: -v, tag: 'sign-error', feedback: 'Keep the sign from the factor: $0 - 3 = -3$ and $0 + 3 = 3$.' }]),
          ),
        );
        steps.push(final);
      } else {
        const hv = vertexOf(f).h;
        const sq = hv.mul(hv);
        const inside = pTex(X([hv.neg().toNumber(), 1]));
        steps = [
          gstep(
            `Substitute $x = 0$. What is $(${inside.replace('x', '0')})^{2}$?`,
            numSpec(sq),
            ['Every point on the $y$-axis has $x = 0$.', 'Work inside the parentheses first.', `$${inside.replace('x', '0')} = ${hv.neg().toTex()}$.`, 'Square that number: multiply it by itself.'],
            `$(${inside.replace('x', '0')})^{2} = (${hv.neg().toTex()})^{2} = ${sq.toTex()}$.`,
            numMis(sq, [{ value: sq.neg(), tag: 'sign-error', feedback: 'A number times itself is never negative.' }, { value: hv.abs().mul(2), tag: 'exponent-rule', feedback: 'Squaring means times itself, not times $2$.' }]),
          ),
          ...(a === 1
            ? []
            : [
                gstep(
                  `Multiply by the leading coefficient, $${a}$. What is $${a} \\cdot ${sq.toTex()}$?`,
                  numSpec(sq.mul(a)),
                  ['Order of operations: square first, then multiply.', `The squared part is $${sq.toTex()}$.`, a < 0 ? 'A negative times a positive is negative.' : 'Multiply the two positive numbers.', `Multiply $${a}$ by $${sq.toTex()}$.`],
                  `$${a} \\cdot ${sq.toTex()} = ${sq.mul(a).toTex()}$.`,
                  numMis(sq.mul(a), [{ value: sq.mul(-a), tag: 'sign-error', feedback: 'Check the sign of the leading coefficient.' }]),
                ),
              ]),
          final,
        ];
      }
      return makeProblem({
        skillId: 'S4.15',
        tags: [],
        steps,
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
    const rootsOf = (q: Poly) => {
      const qc = q.coeffsIn('x').map((c) => c.toInt());
      return quadRoots(qc[2], qc[1], qc[0]).values;
    };
    if (m > 0) misconceptions.push({ answer: rootsOf(vtxPoly(a, -h, k)).join(', '), tag: 'vertex-sign', feedback: `Watch the sign inside the square: $(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^{2}$ is $0$ at $x = ${h}$, so the intercepts are centered on $x = ${h}$.` });
    else misconceptions.push({ answer: rootsOf(vtxPoly(a, h, -k)).join(', '), tag: 'sign-error', feedback: `Isolating the square gives a negative number, $${m}$. No real number squared is negative, so there are no $x$-intercepts.` });
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
      if (!Q(pr.answer.value).eq(f.coeff('x', 0))) return ['wrong y-intercept'];
      // steps re-read from the printed form: factor values at x = 0, or the square at x = 0
      const tex = mathBlocks(pr)[0];
      const factors = [...tex.matchAll(/\\left\(x ([+-]) (\d+)\\right\)/g)].map((m) => (m[1] === '-' ? -Number(m[2]) : Number(m[2])));
      const lead = /^f\(x\) = (-?\d*)\\left/.exec(tex)?.[1];
      const A = lead === undefined || lead === '' ? 1 : lead === '-' ? -1 : Number(lead);
      let expected: Array<string | null>;
      if (factors.length === 2) expected = [String(factors[0]), String(factors[1]), null];
      else if (factors.length === 1 && /\\right\)\^\{2\}/.test(tex)) expected = [String(factors[0] ** 2), ...(A === 1 ? [] : [String(A * factors[0] ** 2)]), null];
      else expected = ['0', null];
      return checkSteps(pr, expected);
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
      const dirSpec = makeChoice(rng, cap(kind), [cap(other)]);
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
            answer: dirSpec,
            hints: ['Look at which way it opens.', 'Opening up means a lowest point.', 'Opening down means a highest point.', 'The vertex is that point.'],
            explanation: `It opens ${up ? 'up' : 'down'}, so it has a ${kind}.`,
            misconceptions: [choiceMis(dirSpec, cap(other), 'graph-reading', `A parabola that opens ${up ? 'up has a lowest point, a minimum' : 'down has a highest point, a maximum'}. Which way do the arms point?`)].filter((m): m is Misconception => !!m),
          },
          {
            prompt: [p(`What is the ${kind} value?`), graph],
            answer: numSpec(Q(k)),
            hints: ['Find the vertex.', 'Read its $y$-coordinate.', 'The value is an output, not an input.', `The vertex is at $x = ${h}$.`],
            explanation: `The vertex is $(${h}, ${k})$, so the ${kind} value is $${k}$.`,
            misconceptions: h !== k ? [{ answer: String(h), tag: 'graph-reading', feedback: 'That is the $x$-coordinate of the vertex. The value of the function is the $y$-coordinate.' }] : [],
          },
          gstep(
            'Put your two answers together. Which statement is correct?',
            answer,
            ['The statement needs the right word and the right value.', `The word comes from the direction the parabola opens: it opens ${up ? 'up' : 'down'}.`, 'The value is the $y$-coordinate of the vertex, an output.', 'Choose the statement that matches both of your answers.'],
            `It opens ${up ? 'up' : 'down'}, so the vertex $(${h}, ${k})$ is the ${up ? 'lowest' : 'highest'} point: a ${kind} value of $${k}$.`,
            [
              choiceMis(answer, label(other, k), 'graph-reading', `The parabola opens ${up ? 'up, so its vertex is its lowest point: a minimum' : 'down, so its vertex is its highest point: a maximum'}.`),
              h !== k ? choiceMis(answer, label(kind, h), 'graph-reading', 'That value is the $x$-coordinate of the vertex. The value of the function is the $y$-coordinate.') : null,
              h !== k ? choiceMis(answer, label(other, h), 'graph-reading', 'Check both parts: the value is the $y$-coordinate of the vertex, and the direction the parabola opens decides maximum or minimum.') : null,
            ],
          ),
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
      const mixed = 'That describes a graph that goes one way on the far left and the other way on the far right, like a line. The two arms of a parabola always point the same way.';
      const misconceptions = choiceMisList(answer, [
        [END.upUp, 'graph-reading', 'That describes a parabola that opens up, with both arms pointing up. Look again at which way this graph opens.'],
        [END.downDown, 'graph-reading', 'That describes a parabola that opens down, with both arms pointing down. Look again at which way this graph opens.'],
        [END.downUp, 'graph-reading', mixed],
        [END.upDown, 'graph-reading', mixed],
      ]);
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
        misconceptions,
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
      if (label !== `A ${up ? 'minimum' : 'maximum'} value of $${k.toTex()}$`) return ['wrong extreme'];
      // steps (difficulty 1): direction from the sign of a, value from the vertex, then the same statement
      return pr.steps ? checkSteps(pr, [pickLabel(pr.steps[0].answer, up ? 'Minimum' : 'Maximum'), k.toString(), pickLabel(pr.answer, label)]) : [];
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

/** Domain of a function given only by a table of whole-number inputs (A.FGR.7.1). */
function discreteDomain(rng: Rng): Problem {
  const games = rng.bool();
  const n0 = rng.int(2, 4);
  const count = rng.int(4, 6);
  const ns = Array.from({ length: count }, (_, i) => n0 + i);
  const out = (n: number) => (games ? n * (n - 1) : (n * (n - 1)) / 2);
  const set = (xs: number[]) => `$\\{${xs.join(', ')}\\}$`;
  const correct = set(ns);
  const wrong = [set(ns.map(out)), `Every real number from $${ns[0]}$ to $${ns[ns.length - 1]}$`, 'All real numbers'];
  const story = games
    ? `In a league, every team plays every other team twice. A coach made the table below of the number of games $G(n)$ for leagues with $n$ teams. The table lists all of the coach's data.`
    : `In a group of $n$ students, everyone shakes hands once with everyone else. A class made the table below of the number of handshakes $H(n)$. The table lists all of the class's data.`;
  const fn = games ? 'G' : 'H';
  const answer = makeChoice(rng, correct, wrong);
  const who = games ? 'teams' : 'students';
  const inCol = `The $n$ column, the number of ${who}`;
  const outCol = `The $${fn}(n)$ column, the number of ${games ? 'games' : 'handshakes'}`;
  const colSpec = fixedChoice(inCol, [outCol]);
  const NOT_BETWEEN = `No: the number of ${who} is a whole number, and the table lists all of the data`;
  const BETWEEN = 'Yes: every number between the first and last rows works';
  const betweenSpec = fixedChoice(NOT_BETWEEN, [BETWEEN]);
  const steps: ProblemStep[] = [
    gstep(
      'The domain of a function is its set of **inputs**. Which column of the table lists the inputs?',
      colSpec,
      ['An input is the number you start with; the output is the number the function gives back.', `In $${fn}(n)$, the letter inside the parentheses is the input.`, 'In a function table, the input column usually comes first.', `Which column is $n$, the number of ${who}?`],
      `The inputs are the values of $n$ in the first column; the $${fn}(n)$ values are the outputs.`,
      [choiceMis(colSpec, outCol, 'graph-reading', `Those are the outputs, the values of $${fn}(n)$. The inputs are the values of $n$.`)],
    ),
    gstep(
      `Does the function make sense for an input between the rows, like $n = ${ns[0]}.5$?`,
      betweenSpec,
      ['Think about what $n$ counts in the story.', `Can a ${games ? 'league' : 'group'} have half of one of its ${who}?`, 'The story says the table lists all of the data.', 'A domain can be a list of separate numbers, not always an interval.'],
      `$n$ counts ${who}, so it is a whole number, and the table lists every input there is: the domain is just the listed numbers.`,
      [choiceMis(betweenSpec, BETWEEN, 'other', `$n$ counts ${who}, so a value like $${ns[0]}.5$ makes no sense. The domain is only the listed inputs.`)],
    ),
    gstep(
      'So what is the domain of the function shown in the table?',
      answer,
      ['Use the column you chose.', 'List only the inputs that are in the table.', 'Write them as a set with braces, $\\{\\ \\}$.', 'Do not include the outputs or the numbers between the rows.'],
      `The domain is the set of listed inputs, ${correct}.`,
      [
        choiceMis(answer, wrong[0], 'graph-reading', 'Those are the outputs, which make up the range. The domain is the set of inputs.'),
        choiceMis(answer, wrong[1], 'other', `$n$ counts ${who}, so numbers between the rows (like $${ns[0]}.5$) are not inputs.`),
        choiceMis(answer, wrong[2], 'other', 'The table lists all of the data, so only the listed inputs are in the domain.'),
      ],
    ),
  ];
  return makeProblem({
    skillId: 'S4.16',
    tags: ['real-world'],
    prompt: [
      p(story),
      { t: 'table', headers: ['$n$', `$${fn}(n)$`], rows: ns.map((n) => [`$${n}$`, `$${out(n)}$`]) },
      p(`What is the domain of the function shown in the table?`),
    ],
    answer,
    hints: [
      'The domain is the set of **inputs**.',
      'In the table, the inputs are in the first column; the outputs are in the second.',
      `The number of ${games ? 'teams' : 'students'} must be a whole number, so values between the rows (like $2.5$) do not make sense.`,
      'A function given only by a table has exactly the listed inputs as its domain.',
    ],
    solution: [
      { text: 'Read the inputs from the first column.', tex: ns.join(',\\ '), why: 'The domain is the set of input values.' },
      { text: 'Write them as a set.', tex: `\\{${ns.join(', ')}\\}`, why: `The function is only defined for these whole numbers of ${games ? 'teams' : 'students'}: it is a discrete domain, not an interval. The second column, ${set(ns.map(out))}, is the range.` },
    ],
    misconceptions: [],
    steps,
  });
}

/** Domain and range of a dropped object, read from its graph (A.FGR.7.1, A.FGR.7.4). */
function droppedGraph(rng: Rng): Problem {
  const T = rng.pick([Q(1), Q(3, 2), Q(2), Q(5, 2), Q(3)]);
  const H = T.mul(T).mul(16);
  const thing = rng.pick(['phone', 'stick', 'water balloon', 'paintbrush', 'tennis ball']);
  const from = rng.pick(H.le(36) ? ['a balcony', 'a tree house', 'the top of a tall ladder'] : H.le(100) ? ['a bridge', 'the roof of a parking garage', 'a hotel balcony'] : ['a tall bridge', 'the edge of a cliff']);
  const askDomain = rng.bool();
  const f = Poly.fromCoeffs('x', [H, Q(0), Q(-16)]);
  const step = H.gt(80) ? 20 : H.gt(40) ? 10 : 4;
  const spec: GraphSpec = {
    xMin: 0,
    xMax: Math.ceil(T.toNumber()) + 1,
    yMin: 0,
    yMax: Math.ceil((H.toNumber() * 1.15) / step) * step,
    xStep: T.isInteger() ? 1 : 0.5,
    yStep: step,
    xLabel: 'time t (seconds)',
    yLabel: 'height h (feet)',
    functions: [{ expr: gexpr(f), label: 'h(t)', domain: [0, T.toNumber()] }],
    points: [
      { x: 0, y: H.toNumber(), label: `(0, ${H.toString()})` },
      { x: T.toNumber(), y: 0, label: `(${numStr(T)}, 0)` },
    ],
    ariaLabel: `A curve starting at (0, ${H.toString()}) and falling to (${numStr(T)}, 0), drawn only from t = 0 to t = ${numStr(T)}.`,
  };
  const value = askDomain ? `[0, ${numStr(T)}]` : `[0, ${H.toString()}]`;
  return makeProblem({
    skillId: 'S4.16',
    tags: ['real-world', 'graph'],
    prompt: [
      p(`A ${thing} is dropped from ${from}. The graph shows its height $h$, in feet, $t$ seconds after it is dropped, from the moment it is dropped until it hits the ground.`),
      { t: 'graph', spec },
      p(`What is the ${askDomain ? 'domain' : 'range'} of the function shown in the graph?`),
    ],
    answer: { kind: 'interval', value },
    inputHint: askDomain ? 'Like [0, 4] or 0 <= t <= 4' : 'Like [0, 64] or 0 <= h <= 64',
    hints: askDomain
      ? ['The domain is the set of inputs: here, the times shown on the horizontal axis.', 'Find the leftmost and rightmost points of the graph.', 'The graph starts when the object is dropped and stops when it hits the ground.', 'Both endpoints are on the graph, so use brackets.']
      : ['The range is the set of outputs: here, the heights shown on the vertical axis.', 'Find the lowest and highest points of the graph.', 'The highest point is where it starts; the lowest is the ground.', 'Both endpoints are on the graph, so use brackets.'],
    solution: askDomain
      ? [
          { text: 'Read the inputs from left to right.', why: `The graph starts at $t = 0$ (the drop) and ends at the labeled point $(${numStr(T)}, 0)$, when the ${thing} hits the ground.` },
          { text: 'Write the domain.', tex: `0 \\le t \\le ${T.toTex()}`, why: 'Every time in between is on the graph, and both endpoints are included.' },
        ]
      : [
          { text: 'Read the outputs from bottom to top.', why: `The highest point is the start, $(0, ${H.toString()})$, and the lowest is the ground, height $0$.` },
          { text: 'Write the range.', tex: `0 \\le h \\le ${H.toString()}`, why: `The ${thing} passes through every height in between as it falls.` },
        ],
    misconceptions: askDomain
      ? [
          { answer: `[0, ${H.toString()}]`, tag: 'interval-endpoint', feedback: 'Those are the heights (outputs). The domain is the set of times (inputs).' },
          { answer: '(-inf, inf)', tag: 'interval-endpoint', feedback: 'The formula works for any number, but the graph, and the situation, only go from the drop to the ground.' },
        ]
      : [
          { answer: `[0, ${numStr(T)}]`, tag: 'interval-endpoint', feedback: 'Those are the times (inputs). The range is the set of heights (outputs).' },
          { answer: `(-inf, ${H.toString()}]`, tag: 'interval-endpoint', feedback: 'The graph stops at the ground, so the height is never negative.' },
        ],
  });
}

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
    const roll = rng.int(0, 2);
    if (difficulty === 1 && roll === 0) return discreteDomain(rng);
    if (difficulty === 2 && roll === 0) return droppedGraph(rng);
    const a = rng.pick([1, 2, 3, -1, -2, -3]);
    const h = nz(rng, -6, 6);
    let k = rng.int(-9, 9);
    if (k === h) k = k + 1;
    const f = vtxPoly(a, h, k);
    const ftex = difficulty === 1 ? vtxTex(a, h, k) : pTex(f);
    const askDomain = difficulty === 2 && rng.int(0, 2) === 0;
    const up = a > 0;
    const value = askDomain ? '(-inf, inf)' : up ? `[${k}, inf)` : `(-inf, ${k}]`;
    const OPEN_UP = 'It opens up, so the vertex is the lowest point';
    const OPEN_DOWN = 'It opens down, so the vertex is the highest point';
    const openSpec = fixedChoice(up ? OPEN_UP : OPEN_DOWN, [up ? OPEN_DOWN : OPEN_UP]);
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
        : difficulty === 1
          ? [
              gstep(
                `$f(x) = ${ftex}$ is in vertex form, $a(x - h)^{2} + k$. What is its vertex?`,
                pointSpec(Q(h), Q(k)),
                ['The vertex of $a(x - h)^{2} + k$ is the point $(h, k)$.', '$h$ is the number subtracted from $x$ inside the parentheses; $k$ is the number added at the end.', `Inside the parentheses, $x ${h < 0 ? '+' : '-'} ${Math.abs(h)} = 0$ when $x = ${h}$.`, 'Write the point with the $x$-coordinate first.'],
                `The squared part is $0$ at $x = ${h}$, and then $f(${h}) = ${k}$, so the vertex is $(${h}, ${k})$.`,
                [
                  { answer: `(${-h}, ${k})`, tag: 'vertex-sign', feedback: 'Watch the sign inside the parentheses: $(x - 3)^{2}$ has $h = 3$ and $(x + 3)^{2}$ has $h = -3$.' },
                  { answer: `(${k}, ${h})`, tag: 'graph-reading', feedback: 'A point is written $(x, y)$: the $x$-coordinate $h$ comes first.' },
                ],
                'Type a point like (2, -5).',
              ),
              gstep(
                `$a = ${a}$. Which way does the parabola open, and what does that make the vertex?`,
                openSpec,
                ['The sign of $a$ decides which way a parabola opens.', 'Positive $a$: opens up. Negative $a$: opens down.', 'A parabola that opens up has a lowest point; one that opens down has a highest point.', `Is $${a}$ positive or negative?`],
                `$a = ${a}$ is ${up ? 'positive' : 'negative'}, so the parabola opens ${up ? 'up' : 'down'} and the vertex is its ${up ? 'lowest' : 'highest'} point.`,
                [choiceMis(openSpec, up ? OPEN_DOWN : OPEN_UP, 'sign-error', `$a = ${a}$ is ${up ? 'positive' : 'negative'}, so the parabola opens ${up ? 'up' : 'down'}.`)],
              ),
              {
                prompt: [p('Now write the range: every output the function can give.')],
                answer: { kind: 'interval', value },
                inputHint: IV_HINT,
                hints: ['The range is the set of outputs, the $y$-values.', `The ${up ? 'least' : 'greatest'} output is the $y$-value of the vertex.`, `Every other output is ${up ? 'greater' : 'less'} than that.`, 'The vertex is on the graph, so include its $y$-value with a bracket.'],
                explanation: `Every output is ${up ? 'at least' : 'at most'} $${k}$, and $${k}$ itself happens at the vertex: $y ${up ? '\\ge' : '\\le'} ${k}$.`,
                misconceptions,
              },
            ]
          : [];
    return makeProblem({
      skillId: 'S4.16',
      tags: difficulty === 2 && steps.length ? ['multi-step'] : [],
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
    const text = promptText(pr);
    const tbl0 = (pr.prompt as Block[]).find((b) => b.t === 'table') as Extract<Block, { t: 'table' }> | undefined;
    if (tbl0) {
      if (pr.answer.kind !== 'choice') return ['unexpected kind'];
      const ins = tbl0.rows.map((r) => Number(r[0].replace(/\$/g, '')));
      const outs = tbl0.rows.map((r) => Q(r[1].replace(/\$/g, '')));
      const d1 = outs.slice(1).map((o, i) => o.sub(outs[i]));
      if (d1.slice(1).some((d, i) => !d.sub(d1[i]).eq(d1[1].sub(d1[0])))) return ['table is not quadratic'];
      const m = /^\$\\\{(.+)\\\}\$$/.exec(choiceLabel(pr.answer));
      if (!m) return ['key is not a set'];
      const vals = m[1].split(',').map((x) => Number(x.trim()));
      if (!(vals.length === ins.length && vals.every((v, i) => v === ins[i]))) return ['key is not the set of inputs'];
      // steps: the input column (the one headed n), "no values between the rows", then the same set
      const byPrefix = (i: number, pre: string) => (pr.steps?.[i]?.answer.kind === 'choice' ? (pr.steps[i].answer as { options: { id: string; label: string }[] }).options.find((o) => o.label.startsWith(pre))?.id ?? '#none' : '#none');
      return pr.steps ? checkSteps(pr, [byPrefix(0, 'The $n$ column'), byPrefix(1, 'No:'), pr.answer.correct]) : ['missing steps'];
    }
    const spec0 = graphOf(pr);
    if (spec0) {
      if (pr.answer.kind !== 'interval') return ['unexpected kind'];
      const fn = spec0.functions![0];
      const g = toPoly(parseExpression(fn.expr));
      const [d0, dEnd] = fn.domain!;
      // the graph runs from the drop to the ground: it ends where the height is 0
      if (d0 !== 0 || Math.abs(ev(g, Q(String(dEnd))).toNumber()) > 1e-9) return ['graph does not end on the ground'];
      let lo = Infinity;
      let hi = -Infinity;
      for (let i = 0; i <= 1000; i++) {
        const y = ev(g, Q(String(d0 + ((dEnd - d0) * i) / 1000))).toNumber();
        lo = Math.min(lo, y);
        hi = Math.max(hi, y);
      }
      const got = parseInterval(pr.answer.value);
      const want = /What is the domain/.test(text) ? [d0, dEnd] : [lo, hi];
      if (!got.lo || !got.hi || !got.loClosed || !got.hiClosed) return ['endpoints should be included'];
      return Math.abs(got.lo.toNumber() - want[0]) < 1e-9 && Math.abs(got.hi.toNumber() - want[1]) < 1e-6 ? [] : ['wrong interval'];
    }
    if (pr.answer.kind !== 'interval') return ['unexpected kind'];
    const blocks = mathBlocks(pr);
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
    if (!intervalsEqual(got, want)) return ['wrong range'];
    if (pr.difficulty !== 1) return [];
    // steps (difficulty 1): the vertex by -b/(2a) from the expanded function, the direction from the sign of a, then the range
    const { h } = vertexOf(f, v);
    return checkSteps(pr, [`(${h.toString()}, ${ev(f, h).toString()})`, pickLabel(pr.steps?.[1]?.answer ?? pr.answer, a.sign() > 0 ? 'It opens up, so the vertex is the lowest point' : 'It opens down, so the vertex is the highest point'), pr.answer.value]);
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

/** Feedback for describing g with the transformations `wrong` when the rule really applies `correct`. */
function tfMis(correct: Tf[], wrong: Tf[]): [MisconceptionTag, string] {
  const find = <T extends Tf['t']>(tfs: Tf[], t: T) => tfs.find((x): x is Extract<Tf, { t: T }> => x.t === t);
  const parts: string[] = [];
  let tag: MisconceptionTag | null = null;
  const add = (tg: MisconceptionTag, text: string) => {
    tag ??= tg;
    parts.push(text);
  };
  const [cR, wR] = [find(correct, 'reflect'), find(wrong, 'reflect')];
  const [cV, wV] = [find(correct, 'vscale'), find(wrong, 'vscale')];
  const [cH, wH] = [find(correct, 'hscale'), find(wrong, 'hscale')];
  const [cU, wU] = [find(correct, 'up'), find(wrong, 'up')];
  const [cS, wS] = [find(correct, 'right'), find(wrong, 'right')];
  // a shift offered for a rule that only multiplies f(x): the shift is the whole mistake
  if (wU && !cU && !cS && !wS) return ['other', 'Multiplying $f(x)$ by a number stretches, compresses or flips the graph. It does not shift the graph up or down; that comes from adding a number to $f(x)$.'];
  if (cR && !wR) add('sign-error', 'That choice leaves out the reflection: a negative sign in front of $f(x)$ flips the graph across the $x$-axis.');
  if (!cR && wR) add('sign-error', 'There is no negative sign in front of $f(x)$, so the graph is not reflected across the $x$-axis.');
  if (wV && !cV) {
    if (cH) add('other', 'The number multiplies $x$ inside the parentheses, so it changes the graph horizontally, not vertically.');
    else add('other', 'The rule multiplies $f(x)$ only by $-1$, so the graph keeps its shape: there is no stretch or compression.');
  }
  if (wV && cV && !wV.k.eq(cV.k)) {
    const big = cV.k.gt(1);
    add('other', `Multiplying $f(x)$ by a number whose size is ${big ? 'greater than $1$' : 'between $0$ and $1$'} moves every point ${big ? 'farther from' : 'closer to'} the $x$-axis, so the graph is ${big ? 'stretched, not compressed' : 'compressed, not stretched'}.`);
  }
  if (wH && cH && !wH.c.eq(cH.c)) add('other', 'A number multiplying $x$ inside the parentheses works the opposite way from how it looks: $f(2x)$ squeezes the graph toward the $y$-axis, and $f(\\frac{1}{2}x)$ stretches it away.');
  if (wU && !cU) add('other', 'The change is inside the parentheses with $x$, so the graph moves left or right, not up or down.');
  if (wS && !cS) add('other', 'The change is added outside $f$, so the graph moves up or down, not left or right.');
  if (wS && cS && wS.n !== cS.n) add('vertex-sign', 'Check the horizontal shift: a change inside the parentheses works opposite to how it looks, so $f(x - 3)$ moves the graph right and $f(x + 3)$ moves it left.');
  if (wU && cU && wU.n !== cU.n) add('sign-error', 'Check the vertical shift: adding a positive number to $f(x)$ moves the graph up, and subtracting moves it down.');
  if (!parts.length) add('other', 'Test one point: pick a point on $f$, find where it goes on $g$, and compare with that description.');
  return [tag ?? 'other', parts.join(' ')];
}

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
    // guided steps (difficulty 1: one shift of the parent x^2): where is the change, how far, then the description
    let steps: ProblemStep[] | undefined;
    if (difficulty === 1) {
      const tf = tfs[0] as { t: 'up' | 'right'; n: number };
      const n = tf.n;
      const inside = tf.t === 'right';
      const INSIDE = 'Inside the parentheses, with $x$: it changes the inputs, so the graph moves left or right';
      const OUTSIDE = 'Outside $f$, added to $f(x)$: it changes the outputs, so the graph moves up or down';
      const where = fixedChoice(inside ? INSIDE : OUTSIDE, [inside ? OUTSIDE : INSIDE]);
      const innerTex = n > 0 ? `x - ${n}` : `x + ${-n}`;
      steps = [
        gstep(
          `Look at $${rule}$. Where is the change to $f$?`,
          where,
          ['Compare $g$ with $f(x)$: what was added, and where?', 'A number added to $f(x)$ after the function is outside.', 'A number added to $x$ inside $f(\\;)$ is inside.', 'Inside changes move the graph left or right; outside changes move it up or down.'],
          inside ? 'The number is with $x$ inside the parentheses, so it changes which input gives each output: a horizontal shift.' : 'The number is added after $f$ is applied, so every output changes by the same amount: a vertical shift.',
          [choiceMis(where, inside ? OUTSIDE : INSIDE, 'other', inside ? 'The number is inside the parentheses with $x$, so it changes the inputs, not the outputs.' : 'The number is added to $f(x)$, outside the parentheses, so it changes the outputs.')],
        ),
        inside
          ? gstep(
              `The vertex of $f(x) = x^{2}$ is at $x = 0$, where the inside is $0$. What value of $x$ makes the inside of $f(${innerTex})$ equal to $0$?`,
              numSpec(Q(n)),
              ['The vertex of $g$ is where its inside matches the inside of $f$ at the vertex.', `Set the inside equal to $0$: $${innerTex} = 0$.`, 'Undo the number added to or subtracted from $x$.', n > 0 ? `Add $${n}$ to both sides.` : `Subtract $${-n}$ from both sides.`],
              `$${innerTex} = 0$ when $x = ${n}$, so the vertex moves from $x = 0$ to $x = ${n}$: ${n > 0 ? 'right' : 'left'} $${Math.abs(n)}$.`,
              numMis(n, [{ value: -n, tag: 'vertex-sign', feedback: `Solve $${innerTex} = 0$. A change inside the parentheses works opposite to how it looks.` }]),
            )
          : gstep(
              `The vertex of $f(x) = x^{2}$ is $(0, 0)$. What is the $y$-coordinate of the vertex of $g$, where $g(0) = f(0) ${n > 0 ? '+' : '-'} ${Math.abs(n)}$?`,
              numSpec(Q(n)),
              ['An outside change adds the same number to every output.', 'The vertex of $f$ has output $f(0) = 0$.', `Add $${n}$ to that output.`, 'A negative number moves the point down.'],
              `$0 ${n > 0 ? '+' : '-'} ${Math.abs(n)} = ${n}$, so the vertex moves from $(0, 0)$ to $(0, ${n})$: ${n > 0 ? 'up' : 'down'} $${Math.abs(n)}$.`,
              numMis(n, [{ value: -n, tag: 'sign-error', feedback: 'Adding a positive number moves a point up; adding a negative number moves it down.' }]),
            ),
        gstep(
          'So how does the graph of $g$ compare with the graph of $f$?',
          answer,
          ['Use the direction from step 1 (up/down or left/right).', 'Use the move of the vertex from step 2.', inside ? 'A vertex that moves to a positive $x$ moved right; to a negative $x$, left.' : 'A vertex that moves to a positive $y$ moved up; to a negative $y$, down.', 'The number of units is the distance the vertex moved.'],
          correct,
          wrongs.map((w) => {
            const lab = describe(w);
            const sameKind = w[0].t === tf.t;
            return choiceMis(answer, lab, sameKind ? (inside ? 'vertex-sign' : 'sign-error') : 'other', sameKind ? (inside ? 'Inside changes work opposite to how they look: $f(x - 3)$ moves the graph right, and $f(x + 3)$ moves it left.' : 'Check the sign: adding a positive number moves the graph up, and a negative number moves it down.') : inside ? 'The change is inside the parentheses, so the graph moves left or right, not up or down.' : 'The change is outside $f$, so the graph moves up or down, not left or right.');
          }),
        ),
      ];
    }
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
      misconceptions: choiceMisList(answer, wrongs.map((w): [string, MisconceptionTag, string] => [describe(w), ...tfMis(tfs, w)])),
      ...(steps ? { steps } : {}),
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
    if (errs.length || pr.difficulty !== 1) return errs;
    // steps (difficulty 1): where the change is, read from whether g(x) - f(x) is a constant; the move from the vertex of g
    const diff = g.sub(f);
    const vertical = diff.degreeIn('x') <= 0;
    const vg = vertexOf(g);
    return checkSteps(pr, [
      pickLabel(pr.steps?.[0]?.answer ?? pr.answer, vertical ? 'Outside $f$, added to $f(x)$: it changes the outputs, so the graph moves up or down' : 'Inside the parentheses, with $x$: it changes the inputs, so the graph moves left or right'),
      (vertical ? vg.k : vg.h).toString(),
      pr.answer.correct,
    ]);
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
    // guided steps for g(x) = f(x) + k (difficulty 1): read the two vertex heights, then subtract
    let steps: ProblemStep[] | undefined;
    if (mode === 'add') {
      const vf = vertexOf(f);
      const vg = vertexOf(g);
      const [fx, fy, gy] = [vf.h, vf.k, vg.k];
      steps = [
        gstep(
          'Find the labeled vertex of $f$, the solid parabola. What is its $y$-coordinate?',
          numSpec(fy),
          ['A point is written $(x, y)$.', 'The vertex is the turning point of the parabola, and it is labeled on the graph.', 'The $y$-coordinate is the second number of the label.', 'Read the label next to the vertex of the solid graph.'],
          `The vertex of $f$ is $(${fx.toTex()}, ${fy.toTex()})$, so its height is $${fy.toTex()}$.`,
          numMis(fy, [{ value: fx, tag: 'graph-reading', feedback: 'That is the $x$-coordinate. The $y$-coordinate is the second number in the point.' }, { value: gy, tag: 'graph-reading', feedback: 'That is the vertex of $g$, the dashed graph. Use the solid graph, $f$.' }]),
        ),
        gstep(
          'Now find the labeled vertex of $g$, the dashed parabola. What is its $y$-coordinate?',
          numSpec(gy),
          ['Adding $k$ to $f(x)$ moves every point straight up or down.', 'So the vertex of $g$ is right above or below the vertex of $f$.', 'The $y$-coordinate is the second number of the label.', 'Read the label next to the vertex of the dashed graph.'],
          `The vertex of $g$ is $(${vg.h.toTex()}, ${gy.toTex()})$, so its height is $${gy.toTex()}$.`,
          numMis(gy, [{ value: vg.h, tag: 'graph-reading', feedback: 'That is the $x$-coordinate. The $y$-coordinate is the second number in the point.' }, { value: fy, tag: 'graph-reading', feedback: 'That is the vertex of $f$, the solid graph. Use the dashed graph, $g$.' }]),
        ),
        gstep(
          'Since $g(x) = f(x) + k$, every output of $g$ is $k$ more than the matching output of $f$. What is $k$?',
          numSpec(k),
          ['$k$ is how far each point moved up (positive) or down (negative).', 'Compare the two heights you found.', `Subtract: $k = ${gy.toTex()} - ${fy.isNegative() ? `(${fy.toTex()})` : fy.toTex()}$.`, 'A move down gives a negative $k$.'],
          why,
          misconceptions.filter((mm) => !Q(mm.answer).eq(k)),
        ),
      ];
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
      ...(steps ? { steps } : {}),
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
    if (errs.length || rule !== 'g(x) = f(x) + k') return errs;
    // steps: the vertex heights from -b/(2a) of each graphed function, then their difference (which must be k)
    const kf = vertexOf(f).k;
    const kg = vertexOf(g).k;
    if (!kg.sub(kf).eq(k)) return ['vertex heights do not differ by k'];
    return checkSteps(pr, [kf.toString(), kg.toString(), k.toString()]);
  },
};

export const U4_FUNCTION_GENERATORS: GeneratorDef[] = [genEvaluateQuadratic, genInterpretNotation, genVertexAxis, genIntercepts, genGraphFeatures, genDomainRange, genTransformDescribe, genTransformFindK];

// silence unused-import lint in some builds
void tailTex;
export type { Problem };
