/**
 * Unit 4, Lessons 6-10 generators: solving quadratic equations by factoring (S4.09), square
 * roots (S4.10), completing the square (S4.11), the quadratic formula and discriminant (S4.12),
 * and quadratics in context (S4.13). Keys come from the construction; verify() re-reads the
 * printed equation and substitutes every solution back in with exact radical arithmetic.
 */
import type { GeneratorDef, Rng, ProblemStep } from '../../core/curriculum/types';
import type { Misconception } from '../../core/math/answers';
import { isVertexForm } from '../../core/math/answers';
import { parseExpression } from '../../core/math/parser';
import { toPoly, Poly } from '../../core/math/poly';
import { Rational } from '../../core/math/rational';
import { p, makeProblem, makeChoice, choiceLabel, numStr, Q, texToExpr, numberMisconceptions } from './util';
import { radPlain, radTex, splitPower, SQUAREFREE } from './u3-common';
import { X, lin, pTex, pPlain, linPlain, linTex, texPoly, plainPoly, texEquation, mathOf, quadRoots, checkSolutions, roundedRootOk, gcdAll, gcd, subTex, promptText } from './u4-common';

const SOL_HINT = 'Like x = 3, -5 or 2 ± sqrt(5), or none';
const nz = (rng: Rng, lo: number, hi: number) => rng.nonzeroInt(lo, hi);

interface Sols {
  values: string[];
  tex: string;
}

/** x = c ± sqrt(m) for a rational center c and a non-negative integer m. */
function shiftRoots(c: number, m: number): Sols {
  if (m < 0) return { values: [], tex: '\\text{no real solutions}' };
  if (m === 0) return { values: [String(c)], tex: `x = ${c}` };
  const r = Math.sqrt(m);
  if (Number.isInteger(r)) {
    const [hi, lo] = [c + r, c - r];
    return { values: [String(hi), String(lo)], tex: `x = ${hi} \\text{ or } x = ${lo}` };
  }
  const { out, inside } = splitPower(m, 2);
  const rp = radPlain(out, inside);
  const rt = radTex(out, inside);
  if (c === 0) return { values: [rp, `-${rp}`], tex: `x = \\pm ${rt}` };
  return { values: [`${c} + ${rp}`, `${c} - ${rp}`], tex: `x = ${c} \\pm ${rt}` };
}

const solSpec = (values: string[]) => ({ kind: 'solutions' as const, values });
const solMis = (values: string[], feedback: string, tag: Misconception['tag'] = 'sign-error'): Misconception[] => (values.length ? [{ answer: values.join(', '), tag, feedback }] : []);

function verifyEquation(pr: Parameters<GeneratorDef['verify']>[0]): string[] {
  if (pr.answer.kind !== 'solutions') return ['unexpected kind'];
  const tex = mathOf(pr);
  if (!tex) return ['no equation'];
  const poly = texEquation(tex);
  if (pr.answer.roundTo !== undefined) {
    const errs: string[] = [];
    const cs = poly.coeffsIn('x');
    const [c, b, a] = cs;
    const k = c.sub(b.mul(b).div(a.mul(4)));
    const expected = k.isZero() ? 1 : k.sign() !== a.sign() ? 2 : 0;
    if (expected !== pr.answer.values.length) errs.push('wrong number of solutions');
    for (const v of pr.answer.values) if (!roundedRootOk(poly, Number(v), pr.answer.roundTo)) errs.push(`${v} is not a root to ${pr.answer.roundTo} places`);
    return errs;
  }
  return checkSolutions(poly, pr.answer.values);
}

// ---------------------------------------------------------------------------
// S4.09: solve by factoring
// ---------------------------------------------------------------------------

export const genSolveFactoring: GeneratorDef = {
  id: 'u4.solve-factoring',
  skillId: 'S4.09',
  description: 'Solve quadratic equations by factoring and the zero product property.',
  generate(rng, difficulty) {
    let a1 = 1;
    let p1: number;
    let q1: number;
    let mode: 'factored' | 'trinomial' | 'gcfx' | 'rearranged' | 'ax2';
    if (difficulty === 1) mode = 'factored';
    else if (difficulty === 2) mode = rng.int(0, 2) === 0 ? 'gcfx' : 'trinomial';
    else mode = rng.bool() ? 'rearranged' : 'ax2';
    for (;;) {
      p1 = nz(rng, -9, 9);
      q1 = mode === 'gcfx' ? 0 : nz(rng, -9, 9);
      if (p1 === q1 || p1 + q1 === 0) continue;
      break;
    }
    if (mode === 'ax2') {
      a1 = rng.pick([2, 3, 5]);
      while (gcd(a1, p1) !== 1) p1 = nz(rng, -9, 9);
    }
    if (mode === 'gcfx') {
      a1 = rng.int(1, 4);
      while (gcd(a1, p1) !== 1) p1 = nz(rng, -9, 9);
    }
    // lhs = (a1 x + p1)(x + q1)
    const lhs = lin(a1, p1).mul(lin(1, q1));
    const r1 = Q(-p1, a1);
    const r2 = Q(-q1);
    const [hi, lo] = r1.gt(r2) ? [r1, r2] : [r2, r1];
    const values = [hi.toString(), lo.toString()];
    // roots in the order of the factors they come from
    const first = mode === 'gcfx' ? Q(0) : r1;
    const second = mode === 'gcfx' ? r1 : r2;
    let tex: string;
    const factoredTex = mode === 'gcfx' ? `x\\left(${linTex(a1, p1)}\\right)` : `\\left(${linTex(a1, p1)}\\right)\\left(${linTex(1, q1)}\\right)`;
    const factoredPlain = mode === 'gcfx' ? `x(${linPlain(a1, p1)})` : `(${linPlain(a1, p1)})(${linPlain(1, q1)})`;
    if (mode === 'factored') tex = `${factoredTex} = 0`;
    else if (mode === 'rearranged') {
      // x^2 = bx' + c' with everything moved to the right
      const rhs = X([0, 0, 1]).sub(lhs);
      tex = `x^{2} = ${pTex(rhs)}`;
    } else tex = `${pTex(lhs)} = 0`;
    const flipped = [numStr(lo.neg()), numStr(hi.neg())].filter((v, i, all) => all.indexOf(v) === i);
    const misconceptions: Misconception[] = [];
    if (mode === 'gcfx') misconceptions.push({ answer: numStr(r1), tag: 'missing-solution', feedback: 'Never divide both sides by $x$: that throws away the solution that makes $x$ itself zero. Factor out $x$ instead.' });
    else if (!(flipped.length === 2 && ((flipped[0] === values[0] && flipped[1] === values[1]) || (flipped[0] === values[1] && flipped[1] === values[0]))))
      misconceptions.push(...solMis(flipped, 'Check the signs. If $x + 3 = 0$, then $x = -3$: each solution has the **opposite** sign of the number in its factor.'));
    const steps: ProblemStep[] = [];
    if (mode !== 'factored')
      steps.push({
        prompt: [p(mode === 'rearranged' ? `First rewrite $${tex}$ so one side is $0$, then factor that side. What is the factored form?` : `Factor the left side of $${tex}$ completely.`)],
        answer: { kind: 'expression', value: factoredPlain, form: 'factored' },
        inputHint: 'Type an answer like (x - 3)(x + 5) or x(2x - 7).',
        hints: [
          mode === 'rearranged' ? `Subtract every term on the right from both sides: $${pTex(lhs)} = 0$.` : 'Look for a common factor first.',
          mode === 'gcfx' ? 'Every term has an $x$, so factor out $x$.' : 'Find two binomials that multiply back to the trinomial.',
          'For $x^{2} + bx + c$, find two numbers that multiply to $c$ and add to $b$.',
          'Check by multiplying your factors back out.',
        ],
        explanation: `$${pTex(lhs)} = ${factoredTex}$.`,
      });
    steps.push({
      prompt: [p(`Use the zero product property on $${factoredTex} = 0$. What are the solutions?`)],
      answer: solSpec(values),
      inputHint: SOL_HINT,
      hints: ['If a product is zero, at least one factor is zero.', 'Set each factor equal to zero.', 'Solve each small equation.', 'There are two solutions.'],
      explanation: `$x = ${first.toTex()}$ or $x = ${second.toTex()}$.`,
    });
    return makeProblem({
      skillId: 'S4.09',
      tags: mode === 'rearranged' ? ['multi-step'] : [],
      prompt: [p('Solve by factoring.'), { t: 'math', tex }],
      answer: solSpec(values),
      inputHint: SOL_HINT,
      hints: [
        mode === 'rearranged' ? 'First move every term to one side so the equation equals $0$.' : 'The zero product property: if $AB = 0$, then $A = 0$ or $B = 0$.',
        mode === 'factored' ? 'The left side is already factored. Set each factor equal to zero.' : 'Factor the side that is not zero.',
        'Solve each of those small equations for $x$.',
        'Check each solution by substituting it back into the original equation.',
      ],
      solution: [
        ...(mode === 'rearranged' ? [{ text: 'Move every term to the left side.', tex: `${pTex(lhs)} = 0`, why: 'The zero product property only works when one side is $0$.' }] : []),
        ...(mode !== 'factored' ? [{ text: 'Factor.', tex: `${factoredTex} = 0` }] : []),
        { text: 'Set each factor equal to zero.', tex: `${mode === 'gcfx' ? 'x' : linTex(a1, p1)} = 0 \\quad\\text{or}\\quad ${mode === 'gcfx' ? linTex(a1, p1) : linTex(1, q1)} = 0`, why: 'A product is zero only when one of its factors is zero.' },
        { text: 'Solve each equation.', tex: `x = ${first.toTex()} \\quad\\text{or}\\quad x = ${second.toTex()}` },
        { text: 'Check by substituting into the original equation.', why: `Both $x = ${first.toTex()}$ and $x = ${second.toTex()}$ make the left side equal the right side (each makes one factor zero).` },
      ],
      misconceptions,
      steps,
    });
  },
  verify: verifyEquation,
};

// ---------------------------------------------------------------------------
// S4.10: solve by square roots
// ---------------------------------------------------------------------------

const NONSQUARE = [2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15, 18, 20, 24, 27, 28, 32, 40, 45, 48, 50];

export const genSolveSqrt: GeneratorDef = {
  id: 'u4.solve-sqrt',
  skillId: 'S4.10',
  description: 'Solve quadratic equations of the form a(x - h)^2 = k by taking square roots.',
  generate(rng, difficulty) {
    let a = 1;
    let h = 0;
    let m: number; // (x - h)^2 = m
    let tex: string;
    if (difficulty === 1) {
      const n = rng.int(2, 12);
      m = n * n;
      if (rng.bool()) tex = `x^{2} = ${m}`;
      else {
        const c = nz(rng, -20, 20);
        tex = `x^{2} ${c < 0 ? '-' : '+'} ${Math.abs(c)} = ${m + c}`;
      }
    } else if (difficulty === 2) {
      if (rng.bool()) {
        a = rng.int(2, 5);
        m = rng.pick(NONSQUARE);
        tex = `${a}x^{2} = ${a * m}`;
      } else {
        h = nz(rng, -6, 6);
        m = rng.int(2, 10) ** 2;
        tex = `\\left(${linTex(1, -h)}\\right)^{2} = ${m}`;
      }
    } else {
      a = rng.int(1, 4);
      h = nz(rng, -6, 6);
      m = rng.int(0, 3) === 0 ? -rng.int(1, 9) : rng.pick(NONSQUARE);
      const k = -a * m;
      tex = `${a === 1 ? '' : a}\\left(${linTex(1, -h)}\\right)^{2} ${k < 0 ? '-' : '+'} ${Math.abs(k)} = 0`;
    }
    const sols = shiftRoots(h, m);
    const sq = h === 0 ? 'x^{2}' : `\\left(${linTex(1, -h)}\\right)^{2}`;
    const isolated = tex === `${sq} = ${m}`;
    const kConst = -a * m;
    const steps: ProblemStep[] = [];
    if (!isolated)
      steps.push({
        prompt: [p(`Isolate the square in $${tex}$. What does $${sq}$ equal?`)],
        answer: { kind: 'number', value: String(m) },
        hints: ['Undo addition or subtraction first.', 'Then divide by the number multiplying the square.', 'Work in the reverse order of operations.', `You should get $${sq} = $ a single number.`],
        explanation: `$${sq} = ${m}$.`,
      });
    steps.push({
        prompt: [p(`Now take the square root of both sides of $${sq} = ${m}$ and solve.`)],
        answer: solSpec(sols.values),
        inputHint: SOL_HINT,
        hints: [m < 0 ? 'Can a real number squared be negative?' : 'Taking a square root gives a positive **and** a negative answer: use $\\pm$.', 'Simplify the square root if you can.', h === 0 ? 'Write both solutions.' : `Then add or subtract to get $x$ by itself.`, 'Check each solution in the original equation.'],
        explanation: m < 0 ? 'A square cannot be negative, so there are no real solutions.' : `$${sols.tex}$.`,
      });
    const posOnly = sols.values.length === 2 ? [sols.values[0]] : [];
    return makeProblem({
      skillId: 'S4.10',
      tags: [],
      prompt: [p('Solve by taking square roots. Give exact answers.'), { t: 'math', tex }],
      answer: solSpec(sols.values),
      inputHint: SOL_HINT,
      hints: [
        isolated ? 'The squared part is already by itself on one side.' : 'Get the squared part by itself on one side of the equation.',
        'Then take the square root of both sides.',
        m < 0 ? 'Think about which numbers can be the value of a square.' : 'A positive number has **two** square roots, so write $\\pm$.',
        m < 0 ? 'Check the sign of the number the square equals.' : 'Simplify any radical, then solve for $x$.',
      ],
      solution: [
        ...(isolated ? [] : [{ text: 'Isolate the square.', tex: difficulty === 3 ? `${a === 1 ? '' : a}${sq} = ${-kConst} \\;\\Rightarrow\\; ${sq} = ${m}` : `${sq} = ${m}`, why: 'Undo the operations around the square in reverse order: first add or subtract, then divide.' }]),
        m < 0
          ? { text: 'A real number squared is never negative.', why: `No real number squared equals $${m}$, so there are **no real solutions**.` }
          : { text: 'Take the square root of both sides.', tex: `${h === 0 ? 'x' : linTex(1, -h)} = \\pm\\sqrt{${m}}`, why: 'Both a positive and a negative number square to the same value.' },
        ...(m >= 0 ? [{ text: 'Simplify and solve.', tex: sols.tex }] : []),
      ],
      misconceptions: posOnly.length
        ? [{ answer: posOnly[0], tag: 'missing-solution', feedback: 'Taking a square root gives two answers, one positive and one negative. Use $\\pm$.' }]
        : m < 0
          ? [{ answer: shiftRoots(h, -m).values.join(', '), tag: 'sign-error', feedback: `Isolate the square carefully: $${sq} = ${m}$, a negative number, not $${-m}$. No real number squared is negative.` }]
          : [],
      steps,
    });
  },
  verify: verifyEquation,
};

// ---------------------------------------------------------------------------
// S4.11: completing the square
// ---------------------------------------------------------------------------

export const genCompleteSquareSolve: GeneratorDef = {
  id: 'u4.complete-square-solve',
  skillId: 'S4.11',
  description: 'Solve x^2 + bx + c = 0 by completing the square.',
  generate(rng, difficulty) {
    const h = nz(rng, -6, 6); // x^2 + 2h x + c = 0  ->  (x + h)^2 = h^2 - c
    let m: number;
    if (difficulty === 3) m = rng.pick(NONSQUARE.slice(0, 14));
    else m = rng.int(1, 9) ** 2;
    const c = h * h - m;
    if (c === 0) return genCompleteSquareSolve.generate(rng, difficulty);
    const b = 2 * h;
    const moved = difficulty === 2 || (difficulty === 3 && rng.bool());
    const tex = moved ? `${pTex(X([0, b, 1]))} = ${-c}` : `${pTex(X([c, b, 1]))} = 0`;
    const sols = shiftRoots(-h, m);
    const sq = `\\left(${linTex(1, h)}\\right)^{2}`;
    const steps: ProblemStep[] = [
      {
        prompt: [p(`To complete the square for $${pTex(X([0, b, 1]))}$, what number do you add to both sides?`)],
        answer: { kind: 'number', value: String(h * h) },
        hints: ['Take half of the coefficient of $x$.', `Half of $${b}$ is $${h}$.`, 'Square that number.', 'A square is never negative.'],
        explanation: `$\\left(\\frac{${b}}{2}\\right)^{2} = ${h * h}$.`,
      },
      {
        prompt: [p(`After adding it, the left side is $${sq}$. What number is on the right side?`)],
        answer: { kind: 'number', value: String(m) },
        hints: ['First move the constant term to the right side.', `Then add $${h * h}$ to the right side too.`, `Start from $${pTex(X([0, b, 1]))} = ${-c}$.`, `Compute $${-c} + ${h * h}$.`],
        explanation: `$${sq} = ${m}$.`,
      },
      {
        prompt: [p(`Solve $${sq} = ${m}$.`)],
        answer: solSpec(sols.values),
        inputHint: SOL_HINT,
        hints: ['Take the square root of both sides, using $\\pm$.', 'Simplify the radical if you can.', `Then subtract $${h}$ from both sides.`, 'There are two solutions.'],
        explanation: `$${sols.tex}$.`,
      },
    ];
    return makeProblem({
      skillId: 'S4.11',
      tags: ['multi-step'],
      prompt: [p('Solve by completing the square. Give exact answers.'), { t: 'math', tex }],
      answer: solSpec(sols.values),
      inputHint: SOL_HINT,
      hints: [
        moved ? 'The constant is already on the right side.' : 'Move the constant term to the right side first.',
        'Add $\\left(\\frac{b}{2}\\right)^{2}$ to **both** sides.',
        'The left side is now a perfect square: $\\left(x + \\frac{b}{2}\\right)^{2}$.',
        'Take square roots (with $\\pm$) and solve for $x$.',
      ],
      solution: [
        ...(moved ? [] : [{ text: 'Move the constant to the right side.', tex: `${pTex(X([0, b, 1]))} = ${-c}` }]),
        { text: `Add $\\left(\\frac{${b}}{2}\\right)^{2} = ${h * h}$ to both sides.`, tex: `${pTex(X([h * h, b, 1]))} = ${-c + h * h}`, why: 'This makes the left side a perfect square trinomial.' },
        { text: 'Write the left side as a square.', tex: `${sq} = ${m}` },
        { text: 'Take square roots of both sides.', tex: `${linTex(1, h)} = \\pm\\sqrt{${m}}`, why: 'Use $\\pm$ because both a positive and a negative number square to the same value.' },
        { text: h > 0 ? `Subtract $${h}$ from both sides.` : `Add $${-h}$ to both sides.`, tex: sols.tex },
      ],
      misconceptions: [
        ...(-c > 0 && -c !== m ? [{ answer: shiftRoots(-h, -c).values.join(', '), tag: 'inverse-operation' as const, feedback: `Add $${h * h}$ to **both** sides. The right side becomes $${-c} + ${h * h} = ${m}$.` }] : []),
        { answer: sols.values[0], tag: 'missing-solution', feedback: 'Taking a square root gives two answers. Use $\\pm$ to find both solutions.' },
      ],
      steps,
    });
  },
  verify: verifyEquation,
};

export const genCompleteSquareVertex: GeneratorDef = {
  id: 'u4.complete-square-vertex',
  skillId: 'S4.11',
  description: 'Rewrite a quadratic in vertex form by completing the square.',
  generate(rng, difficulty) {
    const a = difficulty === 3 ? rng.pick([2, 3, -1, -2, 4]) : 1;
    const h = nz(rng, -6, 6); // a(x + h)^2 + k
    const k = rng.int(-15, 15);
    const full = lin(1, h).mul(lin(1, h)).scale(Q(a)).add(X([k]));
    const tex = pTex(full);
    const kPart = k === 0 ? '' : k < 0 ? ` - ${-k}` : ` + ${k}`;
    const answer = `${a === 1 ? '' : a === -1 ? '-' : a}(${linPlain(1, h)})^2${kPart}`;
    const ansTex = `${a === 1 ? '' : a === -1 ? '-' : a}\\left(${linTex(1, h)}\\right)^{2}${kPart}`;
    const b0 = 2 * h; // inside coefficient after factoring a
    const c = full.coeff('x', 0).toInt();
    const steps: ProblemStep[] = [
      ...(a !== 1
        ? [
            {
              prompt: [p(`Factor $${a}$ out of the first two terms of $${tex}$. What is inside the parentheses?`)],
              answer: { kind: 'expression' as const, value: pPlain(X([0, b0, 1])), form: 'expanded' as const },
              hints: ['Divide the $x^{2}$ term and the $x$ term by $a$.', `$${pTex(X([0, 0, a]))} \\div ${a} = x^{2}$.`, `Divide the $x$ term by $${a}$ too.`, 'Leave the constant term outside.'] as [string, string, string, string],
              explanation: `$${tex} = ${a}\\left(${pTex(X([0, b0, 1]))}\\right) ${c < 0 ? '-' : '+'} ${Math.abs(c)}$.`,
            },
          ]
        : []),
      {
        prompt: [p(`What number completes the square for $${pTex(X([0, b0, 1]))}$?`)],
        answer: { kind: 'number', value: String(h * h) },
        hints: ['Take half of the coefficient of $x$.', `Half of $${b0}$ is $${h}$.`, 'Square it.', 'A square is never negative.'],
        explanation: `$\\left(\\frac{${b0}}{2}\\right)^{2} = ${h * h}$.`,
      },
      {
        prompt: [p(`Write $${tex}$ in vertex form.`)],
        answer: { kind: 'expression', value: answer, form: 'vertex' },
        inputHint: 'Type an answer like 2(x - 3)^2 + 1.',
        hints: [`Add and subtract $${h * h}$${a !== 1 ? ' inside the parentheses' : ''}.`, `The perfect square is $\\left(${linTex(1, h)}\\right)^{2}$.`, a !== 1 ? `The subtracted $${h * h}$ is multiplied by $${a}$ when it leaves the parentheses.` : 'Combine the leftover constants.', 'Check by expanding your answer.'],
        explanation: `$${tex} = ${ansTex}$.`,
      },
    ];
    return makeProblem({
      skillId: 'S4.11',
      tags: ['multi-step'],
      prompt: [p('Write the quadratic in vertex form, $a(x - h)^{2} + k$, by completing the square.'), { t: 'math', tex }],
      answer: { kind: 'expression', value: answer, form: 'vertex' },
      inputHint: 'Type an answer like 2(x - 3)^2 + 1.',
      hints: [
        a !== 1 ? `Factor $${a}$ out of the $x^{2}$ and $x$ terms first.` : 'Focus on the $x^{2}$ and $x$ terms.',
        'Take half the coefficient of $x$ and square it.',
        'Add and subtract that number so the value does not change.',
        'Group the perfect square trinomial and combine the constants.',
      ],
      solution: [
        ...(a !== 1 ? [{ text: `Factor $${a}$ out of the first two terms.`, tex: `${a}\\left(${pTex(X([0, b0, 1]))}\\right) ${c < 0 ? '-' : '+'} ${Math.abs(c)}` }] : []),
        { text: `Add and subtract $\\left(\\frac{${b0}}{2}\\right)^{2} = ${h * h}$ inside.`, tex: `${a === 1 ? '' : a}\\left(${pTex(X([h * h, b0, 1]))} - ${h * h}\\right) ${c < 0 ? '-' : '+'} ${Math.abs(c)}`, why: 'Adding and subtracting the same number keeps the expression equal.' },
        { text: 'Write the perfect square and combine the constants.', tex: `= ${ansTex}`, why: a !== 1 ? `The $-${h * h}$ inside is multiplied by $${a}$: $${a} \\cdot (-${h * h}) + ${c < 0 ? `(${c})` : c} = ${k}$.` : `$-${h * h} + ${c < 0 ? `(${c})` : c} = ${k}$.` },
      ],
      misconceptions: [],
      steps,
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'expression') return ['unexpected kind'];
    const tex = mathOf(pr)!;
    const errs: string[] = [];
    if (!texPoly(tex).equals(plainPoly(pr.answer.value))) errs.push('not equal');
    if (!isVertexForm(parseExpression(pr.answer.value))) errs.push('not vertex form');
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S4.12: quadratic formula and discriminant
// ---------------------------------------------------------------------------

function pickQuad(rng: Rng, want: 'rational' | 'irrational' | 'none' | 'one'): [number, number, number] {
  for (let guard = 0; guard < 500; guard++) {
    if (want === 'rational') {
      const a1 = rng.int(1, 3);
      const a2 = rng.int(1, 2);
      const p1 = nz(rng, -7, 7);
      const q1 = nz(rng, -7, 7);
      const P = lin(a1, p1).mul(lin(a2, q1));
      const cs = P.coeffsIn('x').map((c) => c.toInt());
      if (gcdAll(cs) !== 1 || cs[1] === 0) continue;
      const D = cs[1] * cs[1] - 4 * cs[2] * cs[0];
      if (D === 0) continue;
      return [cs[2], cs[1], cs[0]];
    }
    if (want === 'one') {
      const a1 = rng.int(1, 3);
      const p1 = nz(rng, -7, 7);
      if (gcd(a1, p1) !== 1) continue;
      const cs = lin(a1, p1).mul(lin(a1, p1)).coeffsIn('x').map((c) => c.toInt());
      return [cs[2], cs[1], cs[0]];
    }
    const a = rng.int(1, 4) * (rng.int(0, 4) === 0 ? -1 : 1);
    const b = rng.int(-9, 9);
    const c = nz(rng, -9, 9);
    if (gcdAll([a, b, c]) !== 1) continue;
    const D = b * b - 4 * a * c;
    if (want === 'none' && D < 0) return [a, b, c];
    if (want === 'irrational' && D > 0 && !Number.isInteger(Math.sqrt(D))) return [a, b, c];
  }
  throw new Error('no quadratic found');
}

/** The printed equation: standard form, or rearranged with some terms on the right. */
function equationTex(rng: Rng, a: number, b: number, c: number, rearrange: boolean): string {
  if (!rearrange) return `${pTex(X([c, b, a]))} = 0`;
  // move the x term and constant to the right: ax^2 = -bx - c
  return `${pTex(X([0, 0, a]))} = ${pTex(X([-c, -b]))}`;
}

export const genQuadraticFormula: GeneratorDef = {
  id: 'u4.quadratic-formula',
  skillId: 'S4.12',
  description: 'Solve quadratic equations with the quadratic formula, exactly or rounded.',
  generate(rng, difficulty) {
    const round = difficulty === 3 && rng.bool();
    const want = difficulty === 1 ? 'rational' : difficulty === 2 && rng.int(0, 9) === 0 ? 'none' : 'irrational';
    const [a, b, c] = pickQuad(rng, want);
    const rearrange = difficulty === 3 && !round;
    const tex = equationTex(rng, a, b, c, rearrange);
    const D = b * b - 4 * a * c;
    const exact = quadRoots(a, b, c);
    let values = exact.values;
    if (round) {
      const nums = [(-b + Math.sqrt(D)) / (2 * a), (-b - Math.sqrt(D)) / (2 * a)].sort((x, y) => y - x);
      // stay clear of rounding ties
      if (nums.some((v) => Math.abs(Math.abs(v * 100) % 1 - 0.5) < 0.05)) return genQuadraticFormula.generate(rng, difficulty);
      values = nums.map((v) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2)));
    }
    const answer = round ? { kind: 'solutions' as const, values, roundTo: 2 } : solSpec(values);
    const flipped = quadRoots(a, -b, c).values;
    const formulaTex = `x = \\frac{${b === 0 ? '0' : `-${b < 0 ? `(${b})` : b}`} \\pm \\sqrt{${D}}}{2 \\cdot ${a < 0 ? `(${a})` : a}}`;
    const steps: ProblemStep[] = [
      ...(rearrange
        ? [
            {
              prompt: [p(`Write $${tex}$ in standard form, $ax^{2} + bx + c = 0$. What is the left side?`)],
              answer: { kind: 'expression' as const, value: pPlain(X([c, b, a])), form: 'expanded' as const },
              hints: ['Move every term to the left side.', 'Subtracting a term from both sides changes its sign on the left.', 'Write the terms from the highest power down.', 'The right side should be $0$.'] as [string, string, string, string],
              explanation: `$${pTex(X([c, b, a]))} = 0$, so $a = ${a}$, $b = ${b}$, $c = ${c}$.`,
            },
          ]
        : []),
      {
        prompt: [p(`For $${tex}$, what is the discriminant $b^{2} - 4ac$?`)],
        answer: { kind: 'number', value: String(D) },
        hints: [rearrange ? `First write the equation in standard form: $${pTex(X([c, b, a]))} = 0$.` : 'Read $a$, $b$ and $c$ from standard form, including their signs.', `$a = ${a}$, $b = ${b}$, $c = ${c}$.`, `Compute $${b < 0 ? `(${b})` : b}^{2} - 4(${a})(${c})$.`, 'Be careful: $b^{2}$ is never negative.'],
        explanation: `$b^{2} - 4ac = ${b * b} - ${4 * a * c < 0 ? `(${4 * a * c})` : 4 * a * c} = ${D}$.`,
      },
      {
        prompt: [p(`Now use $x = \\frac{-b \\pm \\sqrt{b^{2} - 4ac}}{2a}$ to solve $${tex}$${round ? '. Round to the nearest hundredth.' : '. Give exact answers.'}`)],
        answer,
        inputHint: SOL_HINT,
        hints: [D < 0 ? 'What does a negative discriminant mean?' : `Substitute: $${formulaTex}$.`, 'Simplify the square root.', round ? 'Use a calculator for the two values, then round.' : 'Reduce the fraction if every term shares a factor.', 'There are two solutions when the discriminant is positive.'],
        explanation: D < 0 ? 'The discriminant is negative, so there are no real solutions.' : `$${exact.tex}$${round ? `, so $x \\approx ${values.join('$ or $x \\approx ')}$` : ''}.`,
      },
    ];
    return makeProblem({
      skillId: 'S4.12',
      tags: rearrange ? ['multi-step'] : [],
      prompt: [p(round ? 'Solve using the quadratic formula. Round to the nearest hundredth.' : 'Solve using the quadratic formula. Give exact answers.'), { t: 'math', tex }],
      answer,
      inputHint: SOL_HINT,
      hints: [
        rearrange ? 'First write the equation in standard form, $ax^{2} + bx + c = 0$.' : 'Identify $a$, $b$ and $c$, including their signs.',
        'The quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^{2} - 4ac}}{2a}$.',
        'Compute the discriminant $b^{2} - 4ac$ first.',
        'Simplify the radical and reduce the fraction.',
      ],
      solution: [
        ...(rearrange ? [{ text: 'Write the equation in standard form.', tex: `${pTex(X([c, b, a]))} = 0`, why: 'The formula needs $ax^{2} + bx + c = 0$.' }] : []),
        { text: 'Identify the coefficients and the discriminant.', tex: `a = ${a},\\ b = ${b},\\ c = ${c},\\quad b^{2} - 4ac = ${D}` },
        D < 0
          ? { text: 'The discriminant is negative.', why: 'The square root of a negative number is not real, so there are **no real solutions**.' }
          : { text: 'Substitute into the formula.', tex: formulaTex },
        ...(D >= 0 ? [{ text: 'Simplify.', tex: exact.tex + (round ? `\\approx ${values.join(',\\ ')}` : '') }] : []),
      ],
      misconceptions: !round && difficulty <= 2 && flipped.length === 2 && !(flipped.includes(values[0]) && flipped.includes(values[1])) ? solMis(flipped, 'Check the sign at the start of the formula: it is $-b$. Since $b$ here is $' + b + '$, $-b = ' + -b + '$.') : [],
      steps,
    });
  },
  verify: verifyEquation,
};

const COUNT_LABEL = ['No real solutions', 'One real solution', 'Two real solutions'] as const;

export const genDiscriminant: GeneratorDef = {
  id: 'u4.discriminant',
  skillId: 'S4.12',
  description: 'Use the discriminant to find the number of real solutions.',
  generate(rng, difficulty) {
    const want = rng.pick(['rational', 'irrational', 'none', 'one', 'none', 'one'] as const);
    const [a, b, c] = pickQuad(rng, want);
    const tex = equationTex(rng, a, b, c, difficulty === 3);
    const D = b * b - 4 * a * c;
    const count = D > 0 ? 2 : D === 0 ? 1 : 0;
    const answer = makeChoice(rng, COUNT_LABEL[count], COUNT_LABEL.filter((_, i) => i !== count));
    return makeProblem({
      skillId: 'S4.12',
      tags: [],
      prompt: [p('How many real solutions does the equation have? Use the discriminant.'), { t: 'math', tex }],
      answer,
      hints: [
        difficulty === 3 ? 'First write the equation in standard form, $ax^{2} + bx + c = 0$.' : 'Identify $a$, $b$ and $c$, including their signs.',
        'The discriminant is $b^{2} - 4ac$.',
        'Positive: two real solutions. Zero: one real solution. Negative: no real solutions.',
        'Remember that $b^{2}$ is never negative, even when $b$ is.',
      ],
      solution: [
        ...(difficulty === 3 ? [{ text: 'Write the equation in standard form.', tex: `${pTex(X([c, b, a]))} = 0` }] : []),
        { text: 'Compute the discriminant.', tex: `b^{2} - 4ac = ${b < 0 ? `(${b})` : b}^{2} - 4(${a})(${c}) = ${D}`, why: D > 0 ? 'It is positive.' : D === 0 ? 'It is zero.' : 'It is negative.' },
        { text: `So the equation has ${COUNT_LABEL[count].toLowerCase()}.`, why: D > 0 ? 'A positive number has two square roots, so the $\\pm$ gives two different solutions.' : D === 0 ? 'The $\\pm \\sqrt{0}$ adds nothing, so both solutions are the same number.' : 'A negative number has no real square root.' },
      ],
      misconceptions: [],
      steps: [
        {
          prompt: [p(`What is the discriminant of $${tex}$?`)],
          answer: { kind: 'number', value: String(D) },
          hints: [`$a = ${a}$, $b = ${b}$, $c = ${c}$.`, 'Compute $b^{2} - 4ac$.', `$b^{2} = ${b * b}$.`, `$4ac = ${4 * a * c}$.`],
          explanation: `$b^{2} - 4ac = ${D}$.`,
        },
        {
          prompt: [p(`The discriminant is $${D}$. How many real solutions are there?`)],
          answer: makeChoice(rng, COUNT_LABEL[count], COUNT_LABEL.filter((_, i) => i !== count)),
          hints: ['Positive means two.', 'Zero means one.', 'Negative means none.', `Is $${D}$ positive, zero or negative?`],
          explanation: `${COUNT_LABEL[count]}.`,
        },
      ],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const poly = texEquation(mathOf(pr)!);
    const [c, b, a] = poly.coeffsIn('x');
    // vertex height, an independent route from the discriminant
    const k = c.sub(b.mul(b).div(a.mul(4)));
    const count = k.isZero() ? 1 : k.sign() !== a.sign() ? 2 : 0;
    return choiceLabel(pr.answer) === COUNT_LABEL[count] ? [] : ['wrong key'];
  },
};

// ---------------------------------------------------------------------------
// S4.13: quadratics in context
// ---------------------------------------------------------------------------

/** Positive root of h(t) on (0, 30) found by bisection. */
function positiveRoot(h: Poly, target = 0): number {
  const f = (t: number) => h.coeffsIn('t').reduce((acc, c, i) => acc + c.toNumber() * Math.pow(t, i), 0) - target;
  let lo = 0;
  let hi = 30;
  if (f(lo) <= 0 || f(hi) >= 0) return NaN;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// Method labels for "which method is most efficient" (the order of the U4L10 table).
const METHOD = {
  sqrt: 'Square roots: isolate the square, then take the square root of both sides',
  factor: 'Factoring: the quadratic factors over the integers',
  cts: 'Completing the square: $a = 1$ and $b$ is even, but it does not factor',
  formula: 'The quadratic formula: it does not factor, and $a \\ne 1$ or $b$ is odd',
} as const;
type MethodKey = keyof typeof METHOD;

const isSquare = (n: number) => n >= 0 && Number.isInteger(Math.sqrt(n));

// "Is this data point possible?" labels (A.PAR.6.4): exactly one describes each point.
const POINT = {
  yes: 'Possible: the point is on the graph of the model, at a time while the ball is in the air.',
  otherTime: 'Not possible: the ball does reach that height, but at a different time.',
  tooHigh: 'Not possible: the ball never gets that high, because that height is above its maximum height.',
  domain: 'Not possible: the point fits the equation, but that time is outside the domain (the ball is not in the air then).',
} as const;
type PointKey = keyof typeof POINT;

/** Landing time of h(t) = -16t^2 + vt + h0 (h0 >= 0), as a decimal. */
const landing = (v: number, h0: number) => (v + Math.sqrt(v * v + 64 * h0)) / 32;
const hAt = (v: number, h0: number, t: Rational) => t.mul(t).mul(-16).add(t.mul(v)).add(h0);
const tStr = (t: Rational) => numStr(t);
const ptTex = (t: Rational, y: Rational) => `(${t.toTex()}, ${y.toTex()})`;

export const genQuadraticContext: GeneratorDef = {
  id: 'u4.quadratic-context',
  skillId: 'S4.13',
  description: 'Choose a method, create and solve quadratic models in context, and keep only the solutions and data points that make sense.',
  generate(rng, difficulty) {
    const roll = rng.int(0, 9);
    const kind =
      difficulty === 1 ? (roll < 5 ? 'ball' : 'method') : difficulty === 2 ? (roll < 4 ? 'area' : roll < 7 ? 'twice' : 'point') : roll < 4 ? 'ball' : roll < 7 ? 'twice' : 'point';
    if (kind === 'method') {
      const key = rng.pick<MethodKey>(['sqrt', 'factor', 'cts', 'formula']);
      let tex = '';
      let a = 1;
      let b = 0;
      let c = 0;
      let shape: 'plain' | 'square' = 'plain';
      let hh = 0;
      let mm = 0;
      if (key === 'sqrt') {
        mm = rng.pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 18, 20]);
        if (rng.bool()) {
          a = rng.pick([1, 2, 3, 4, 5]);
          [b, c] = [0, -a * mm];
          tex = `${a === 1 ? '' : a}x^{2} - ${a * mm} = 0`;
        } else {
          shape = 'square';
          hh = nz(rng, -6, 6);
          [a, b, c] = [1, -2 * hh, hh * hh - mm];
          tex = `\\left(${linTex(1, -hh)}\\right)^{2} = ${mm}`;
        }
      } else if (key === 'factor') {
        let r = 0;
        let s2 = 0;
        do {
          r = nz(rng, -9, 9);
          s2 = nz(rng, -9, 9);
        } while (r === s2 || r + s2 === 0);
        [a, b, c] = [1, -(r + s2), r * s2];
        tex = `${pTex(X([c, b, a]))} = 0`;
      } else if (key === 'cts') {
        do {
          b = 2 * nz(rng, -6, 6);
          c = nz(rng, -12, 12);
        } while (b * b - 4 * c <= 0 || isSquare(b * b - 4 * c));
        a = 1;
        tex = `${pTex(X([c, b, a]))} = 0`;
      } else {
        do {
          a = rng.pick([2, 3, 4, 5]);
          b = nz(rng, -9, 9);
          c = nz(rng, -9, 9);
        } while (b * b - 4 * a * c <= 0 || isSquare(b * b - 4 * a * c) || gcdAll([a, b, c]) !== 1);
        tex = `${pTex(X([c, b, a]))} = 0`;
      }
      const roots = quadRoots(a, b, c);
      const D = b * b - 4 * a * c;
      const why: Record<MethodKey, string> = {
        sqrt: shape === 'square' ? 'The left side is already a perfect square, so undo the square with a square root.' : 'There is no $x$-term, so $x^{2}$ can be isolated directly.',
        factor: `The discriminant $b^{2} - 4ac = ${D}$ is a perfect square, so the trinomial factors over the integers.`,
        cts: `$b^{2} - 4ac = ${D}$ is not a perfect square, so it does not factor, but $a = 1$ and $b = ${b}$ is even, so half of $b$ is a whole number.`,
        formula: `$b^{2} - 4ac = ${D}$ is not a perfect square, so it does not factor, and $a = ${a}$ would make completing the square use fractions.`,
      };
      const solveStep =
        key === 'sqrt'
          ? shape === 'square'
            ? { text: 'Take the square root of both sides.', tex: `${linTex(1, -hh)} = \\pm \\sqrt{${mm}} \\Rightarrow ${roots.tex}`, why: 'Both the positive and the negative root square to the right side.' }
            : { text: 'Isolate $x^{2}$ and take square roots.', tex: `x^{2} = ${mm} \\Rightarrow ${roots.tex}`, why: `Add $${a * mm}$${a === 1 ? '' : ` and divide by $${a}$`}; a positive number has two square roots.` }
          : key === 'factor'
            ? { text: 'Factor and use the zero product property.', tex: `${roots.tex}`, why: `Two numbers that multiply to $${c}$ and add to $${b}$ give the factors.` }
            : key === 'cts'
              ? { text: 'Complete the square.', tex: `\\left(${linTex(1, b / 2)}\\right)^{2} = ${b * b / 4 - c} \\Rightarrow ${roots.tex}`, why: `Add $\\left(\\frac{${b}}{2}\\right)^{2} = ${b * b / 4}$ to both sides after moving the constant.` }
              : { text: 'Use the quadratic formula.', tex: `x = \\frac{${-b} \\pm \\sqrt{${D}}}{${2 * a}} \\Rightarrow ${roots.tex}`, why: `$a = ${a}$, $b = ${b}$, $c = ${c}$.` };
      const opts = (['sqrt', 'factor', 'cts', 'formula'] as MethodKey[]).map((k) => METHOD[k]);
      const answer = makeChoice(rng, METHOD[key], opts.filter((o) => o !== METHOD[key]));
      return makeProblem({
        skillId: 'S4.13',
        tags: [],
        prompt: [p('Which method is the most efficient way to solve this equation?'), { t: 'math', tex }],
        answer,
        hints: [
          'Look at the equation before you start: is there an $x$-term? Is it already a square?',
          'If there is no $x$-term (or the left side is a perfect square), square roots is quickest.',
          'Otherwise compute $b^{2} - 4ac$: a perfect square means the quadratic factors over the integers.',
          'If it does not factor, completing the square is neat when $a = 1$ and $b$ is even; otherwise use the formula.',
        ],
        solution: [
          { text: 'Look at the form of the equation.', why: why[key] },
          { text: `So the most efficient method is ${METHOD[key].split(':')[0].replace(/^The q/, 'the q').toLowerCase()}.`, why: 'Every method gives the same solutions; this one takes the fewest steps here.' },
          solveStep,
        ],
        misconceptions: [],
        steps: [
          { prompt: [p(`Which method is the most efficient way to solve $${tex}$?`)], answer: makeChoice(rng, METHOD[key], opts.filter((o) => o !== METHOD[key])), hints: ['Is there an $x$-term?', 'Is $b^{2} - 4ac$ a perfect square?', 'Is $a = 1$ with an even $b$?', 'Match the equation to a row of the method table.'], explanation: why[key] },
          { prompt: [p(`Now solve $${tex}$.`)], answer: solSpec(roots.values), inputHint: SOL_HINT, hints: ['Use the method you chose.', 'Keep both signs of a square root.', 'Simplify any radical.', 'Check by substituting.'], explanation: `$${roots.tex}$.` },
        ],
      });
    }
    if (kind === 'area') {
      const m = rng.pick([1, 1, 2]);
      const w = rng.int(3, m === 2 ? 10 : 14);
      const k = rng.int(2, 9);
      const L = m * w + k;
      const A = w * L;
      const askWidth = rng.bool();
      const ans = askWidth ? w : L;
      const thing = rng.pick(['phone screen protector', 'garden bed', 'poster', 'rug', 'patio']);
      const unit = thing === 'phone screen protector' ? 'centimeters' : 'feet';
      const sq = `square ${unit}`;
      const negRoot = Q(-A).div(m * w); // product of the roots is -A/m
      const relation = m === 1 ? `$${k}$ ${unit} longer than it is wide` : `$${k}$ ${unit} more than twice its width`;
      const lenTex = m === 1 ? `w + ${k}` : `2w + ${k}`;
      const eqPlain = `w(${lenTex}) = ${A}`;
      const stdTex = `${m === 1 ? '' : '2'}w^{2} + ${k}w - ${A} = 0`;
      const factored = m === 1 ? `(w - ${w})(w + ${w + k})` : `(w - ${w})(2w + ${L})`;
      return makeProblem({
        skillId: 'S4.13',
        tags: ['real-world', 'multi-step'],
        prompt: [p(`The length of a rectangular ${thing} is ${relation}. Its area is $${A}$ ${sq}.`), p(`Write and solve an equation to find the **${askWidth ? 'width' : 'length'}** of the ${thing}, in ${unit}.`)],
        answer: { kind: 'number', value: String(ans), unit },
        hints: [
          'Let $w$ be the width. Write the length in terms of $w$.',
          `Area is width times length, so the equation is $w(${lenTex}) = ${A}$.`,
          'Multiply out, move everything to one side and solve by factoring or the formula.',
          askWidth ? 'A width cannot be negative, so keep the positive solution.' : 'Keep the positive width, then use it to find the length.',
        ],
        solution: [
          { text: 'Let $w$ be the width and write the length.', tex: `\\text{length} = ${lenTex}`, why: m === 1 ? `The length is $${k}$ more than the width.` : `"Twice the width" is $2w$, and the length is $${k}$ more than that.` },
          { text: 'Write the area equation and put it in standard form.', tex: `w(${lenTex}) = ${A} \\Rightarrow ${stdTex}`, why: 'Area of a rectangle is width times length.' },
          { text: 'Factor and solve.', tex: `${factored} = 0 \\Rightarrow w = ${w} \\text{ or } w = ${negRoot.toTex()}`, why: `Check: $${w}(${L}) = ${A}$.` },
          { text: 'Keep only the solution that makes sense.', why: `A width cannot be negative, so $w = ${w}$ ${unit}.` },
          ...(askWidth ? [] : [{ text: 'Find the length.', tex: `${m === 1 ? '' : `2(${w}) + `}${m === 1 ? `${w} + ` : ''}${k} = ${L}`, why: m === 1 ? `The length is $${k}$ more than the width.` : `The length is $${k}$ more than twice the width.` }]),
        ],
        misconceptions: numberMisconceptions(Q(ans), [
          { value: askWidth ? negRoot : negRoot.mul(m).add(k), tag: 'statistics-concept', feedback: 'That solves the equation, but a length cannot be negative. Choose the solution that makes sense.' },
          { value: askWidth ? Q(L) : Q(w), tag: 'other', feedback: askWidth ? 'That is the length. The question asks for the width.' : 'That is the width. The question asks for the length.' },
        ]),
        steps: [
          { prompt: [p(`Let $w$ be the width. Write an equation for the area of the ${thing}.`)], answer: { kind: 'equation', value: eqPlain }, inputHint: `Type an equation in w, like w(w + 3) = 40.`, hints: ['Write the length in terms of $w$.', m === 1 ? `The length is $w + ${k}$.` : `The length is $2w + ${k}$.`, 'Area is width times length.', `Set the product equal to $${A}$.`], explanation: `$${eqPlain}$.` },
          { prompt: [p(`Solve the equation. What is the ${askWidth ? 'width' : 'length'}, in ${unit}?`)], answer: { kind: 'number', value: String(ans), unit }, hints: ['Write the equation in standard form.', 'Factor or use the quadratic formula.', 'Reject the negative solution.', askWidth ? 'The width is the positive solution.' : 'Substitute the width into the length expression.'], explanation: `The width is $${w}$ and the length is $${L}$.` },
        ],
      });
    }
    if (kind === 'twice') {
      const [t1, t2] = difficulty === 2 ? rng.pick([[1, 2], [1, 3], [1, 4], [2, 3], [1, 5], [2, 4]] as const).map((x) => Q(x)) : rng.pick([['1/2', '3/2'], ['1/2', '5/2'], ['3/2', '5/2'], ['1/2', '7/2'], ['3/2', '3'], ['1', '5/2'], ['1/2', '2']] as const).map((x) => Q(x));
      const h0 = rng.int(2, 15);
      const v = Q(16).mul(t1.add(t2)).toInt();
      const H = Q(16).mul(t1).mul(t2).add(h0).toInt();
      const thing = rng.pick(['ball', 'water balloon', 'beanbag', 'softball']);
      const hPoly = Poly.fromCoeffs('t', [Q(h0), Q(v), Q(-16)]);
      const tex = `h(t) = ${pTex(hPoly, 't')}`;
      const T = landing(v, h0);
      const stdTex = `-16t^{2} + ${v}t - ${H - h0} = 0`;
      const divTex = pTex(Poly.fromCoeffs('t', [t1.mul(t2), t1.add(t2).neg(), Q(1)]), 't');
      return makeProblem({
        skillId: 'S4.13',
        tags: ['real-world', 'multi-step'],
        prompt: [
          p(`A ${thing} is thrown upward from a height of $${h0}$ feet. Its height, in feet, after $t$ seconds is`),
          { t: 'math', tex },
          p(`At what times is the ${thing} exactly $${H}$ feet above the ground? Give every time that makes sense, in seconds.`),
        ],
        answer: { kind: 'solutions', values: [tStr(t2), tStr(t1)], variable: 't' },
        inputHint: 'Type every time, separated by a comma, like 1, 3.',
        hints: [
          `Set the height equal to $${H}$: solve $h(t) = ${H}$.`,
          `Subtract $${H}$ so one side is $0$, then divide every term by $-16$.`,
          'Factor (or use the formula). You will get two times.',
          `Check each time against the situation: is it after the throw and before the ${thing} lands?`,
        ],
        solution: [
          { text: 'Set the height equal to the target and write standard form.', tex: `-16t^{2} + ${v}t + ${h0} = ${H} \\Rightarrow ${stdTex}`, why: `Subtract $${H}$ from both sides.` },
          { text: 'Divide by $-16$ and solve.', tex: `${divTex} = 0 \\Rightarrow t = ${t1.toTex()} \\text{ or } t = ${t2.toTex()}`, why: `The two times multiply to $${t1.mul(t2).toTex()}$ and add to $${t1.add(t2).toTex()}$.` },
          { text: 'Check each time against the situation.', why: `The ${thing} is in the air from $t = 0$ until it lands at about $t \\approx ${T.toFixed(2)}$, so both times fit: it passes $${H}$ feet once on the way up and once on the way down. Neither solution is rejected.` },
        ],
        misconceptions: [
          { answer: tStr(t1), tag: 'missing-solution', feedback: 'That time works, but the ball passes that height twice: once going up and once coming down. Check the other solution before rejecting it.' },
          { answer: `${tStr(t1.neg())}, ${tStr(t2.neg())}`, tag: 'sign-error', feedback: 'Negative times are before the throw. Check the signs when you factor.' },
        ],
      });
    }
    if (kind === 'point') {
      const v = difficulty === 2 ? rng.pick([32, 48, 64]) : rng.pick([24, 40, 56]);
      const h0 = rng.int(difficulty === 2 ? 2 : 3, 12);
      const T = landing(v, h0);
      const tv = Q(v, 32);
      const K = hAt(v, h0, tv);
      const inAir: Rational[] = [];
      for (let t = 1; t < T - 1e-9; t++) inAir.push(Q(t));
      if (difficulty === 3) for (let t = 1; t < T - 1e-9; t++) if (t - 0.5 > 0 && !tv.eq(Q(2 * t - 1, 2))) inAir.push(Q(2 * t - 1, 2));
      const which = rng.pick<PointKey>(['yes', 'otherTime', 'tooHigh', 'domain']);
      let t = rng.pick(inAir);
      let y: Rational;
      if (which === 'yes') y = hAt(v, h0, t);
      else if (which === 'otherTime') {
        const others = inAir.map((u) => hAt(v, h0, u)).filter((z) => !z.eq(hAt(v, h0, t)) && z.ge(0));
        if (!t.eq(tv)) others.push(K);
        y = rng.pick(others);
      } else if (which === 'tooHigh') y = K.add(rng.pick([4, 6, 10, 15, 20]));
      else {
        t = rng.bool() ? Q(-1) : Q(Math.ceil(T + 1e-9) + rng.int(0, 1));
        y = hAt(v, h0, t);
      }
      const hPoly = Poly.fromCoeffs('t', [Q(h0), Q(v), Q(-16)]);
      const tex = `h(t) = ${pTex(hPoly, 't')}`;
      const thing = 'ball';
      const answer = makeChoice(rng, POINT[which], (Object.keys(POINT) as PointKey[]).filter((k) => k !== which).map((k) => POINT[k]));
      const ht = hAt(v, h0, t);
      return makeProblem({
        skillId: 'S4.13',
        tags: ['real-world'],
        prompt: [
          p(`A ${thing} is thrown upward from a height of $${h0}$ feet. Its height, in feet, after $t$ seconds is modeled by the function below, from the throw until it lands.`),
          { t: 'math', tex },
          p(`A student lists the data point $${ptTex(t, y)}$, meaning a height of $${y.toTex()}$ feet at $t = ${t.toTex()}$ seconds. Is this data point possible according to the model?`),
        ],
        answer,
        hints: [
          'A data point is possible only if it is a solution of the model **and** it fits the situation.',
          `Substitute $t = ${t.toTex()}$ into $h(t)$ and compare with $${y.toTex()}$.`,
          `The ${thing} is in the air from $t = 0$ until it lands, when $h(t) = 0$. Find that landing time.`,
          'The highest the ball gets is the vertex: $t = -\\frac{b}{2a}$, then substitute.',
        ],
        solution: [
          { text: 'Find the domain and the maximum height.', tex: `t = -\\frac{${v}}{2(-16)} = ${tv.toTex()},\\quad h(${tv.toTex()}) = ${K.toTex()},\\quad h(t) = 0 \\text{ at } t \\approx ${T.toFixed(2)}`, why: `So the ${thing} is in the air for $0 \\le t \\le ${T.toFixed(2)}$, and every height it reaches is between $0$ and $${K.toTex()}$ feet.` },
          { text: `Substitute $t = ${t.toTex()}$.`, tex: `h(${t.toTex()}) = -16\\left(${t.toTex()}\\right)^{2} + ${v}\\left(${t.toTex()}\\right) + ${h0} = ${ht.toTex()}` },
          {
            text: POINT[which],
            why:
              which === 'yes'
                ? `$h(${t.toTex()}) = ${y.toTex()}$ and $t = ${t.toTex()}$ is during the flight, so the point is a solution that makes sense.`
                : which === 'otherTime'
                  ? `$h(${t.toTex()}) = ${ht.toTex()}$, not $${y.toTex()}$. A height of $${y.toTex()}$ feet does happen during the flight, just at another time.`
                  : which === 'tooHigh'
                    ? `$${y.toTex()}$ is more than the maximum height, $${K.toTex()}$ feet, so no time gives that height.`
                    : `$h(${t.toTex()}) = ${ht.toTex()}$, so the point is a solution of the equation, but $t = ${t.toTex()}$ is ${t.isNegative() ? 'before the throw' : 'after the ball has landed'}. A negative height is not possible here.`,
          },
        ],
        misconceptions: [],
      });
    }
    // a ball thrown upward: h(t) = -16t^2 + v t + h0
    let v: number;
    let h0: number;
    let T: number | null = null;
    if (difficulty === 1) {
      T = rng.int(2, 5);
      const r = rng.pick([Q(1, 4), Q(1, 2), Q(1)]);
      // -16(t - T)(t + r) = -16t^2 + 16(T - r)t + 16Tr
      v = Q(16).mul(Q(T).sub(r)).toInt();
      h0 = Q(16 * T).mul(r).toInt();
    } else {
      v = rng.int(20, 64);
      h0 = rng.int(3, 40);
    }
    const tex = `h(t) = -16t^{2} + ${v}t + ${h0}`;
    const hPoly = toPoly(parseExpression(`-16t^2 + ${v}t + ${h0}`));
    let value: string;
    let roundTo: number | undefined;
    if (T !== null) value = String(T);
    else {
      const root = (v + Math.sqrt(v * v + 64 * h0)) / 32;
      if (Math.abs(Math.abs(root * 100) % 1 - 0.5) < 0.05) return genQuadraticContext.generate(rng, difficulty);
      value = root.toFixed(2);
      roundTo = 2;
    }
    const negRoot = T !== null ? Q(h0).div(Q(-16 * T)) : null; // product of roots = -h0/16
    const D = v * v + 64 * h0;
    return makeProblem({
      skillId: 'S4.13',
      tags: ['real-world', 'multi-step'],
      prompt: [
        p(`A ball is thrown upward from a height of $${h0}$ feet. Its height, in feet, after $t$ seconds is`),
        { t: 'math', tex },
        p(`After how many seconds does the ball hit the ground?${roundTo ? ' Round to the nearest hundredth.' : ''}`),
      ],
      answer: { kind: 'number', value, ...(roundTo ? { roundTo } : {}), unit: 'seconds' },
      hints: [
        'The ball hits the ground when its height is $0$: solve $h(t) = 0$.',
        T !== null ? 'Factor out a common factor (such as $-8$) first, or use the quadratic formula.' : 'Use the quadratic formula with $a = -16$.',
        'You will get two solutions. Time after the throw cannot be negative.',
        'Keep the positive solution.',
      ],
      solution: [
        { text: 'Set the height equal to zero.', tex: `-16t^{2} + ${v}t + ${h0} = 0` },
        { text: 'Use the quadratic formula.', tex: `t = \\frac{-${v} \\pm \\sqrt{${v}^{2} - 4(-16)(${h0})}}{2(-16)} = \\frac{-${v} \\pm \\sqrt{${D}}}{-32}`, why: '$a = -16$, $b = ' + v + '$, $c = ' + h0 + '$.' },
        ...(T === null ? [{ text: 'Find both solutions.', tex: `t \\approx \\frac{-${v} + ${Math.sqrt(D).toFixed(2)}}{-32} \\approx ${((-v + Math.sqrt(D)) / -32).toFixed(2)} \\quad\\text{or}\\quad t \\approx \\frac{-${v} - ${Math.sqrt(D).toFixed(2)}}{-32} \\approx ${value}` }] : []),
        ...(T !== null ? [{ text: 'Simplify both solutions.', tex: `t = \\frac{-${v} + ${Math.sqrt(D)}}{-32} = ${numStr(negRoot!).replace(/^(-?)(\d+)\/(\d+)$/, '$1\\frac{$2}{$3}')} \\quad\\text{or}\\quad t = \\frac{-${v} - ${Math.sqrt(D)}}{-32} = ${T}` }] : []),
        { text: 'Keep the positive solution.', tex: `t ${roundTo ? '\\approx' : '='} ${value}`, why: 'The other solution is negative, which would be a time before the ball was thrown.' },
      ],
      misconceptions: negRoot || T === null ? [{ answer: negRoot ? numStr(negRoot) : ((-v + Math.sqrt(D)) / -32).toFixed(2), tag: 'statistics-concept', feedback: 'That solves the equation, but it is a negative time, before the ball was thrown. Choose the solution that makes sense.' }] : [],
    });
  },
  verify(pr) {
    const text = promptText(pr);
    const tex = mathOf(pr);
    if (/most efficient way/.test(text)) {
      if (pr.answer.kind !== 'choice' || !tex) return ['unexpected kind'];
      const poly = texEquation(tex);
      const [c, b, a] = poly.coeffsIn('x').map((r) => r.toNumber());
      const D = b * b - 4 * a * c;
      if (!(D > 0)) return ['needs two real solutions'];
      // the U4L10 method table, applied in order to the printed equation
      let want: MethodKey;
      if (/^\\left\(x/.test(tex) || b === 0) {
        if (isSquare(D)) return ['square-root equation also factors: ambiguous'];
        want = 'sqrt';
      } else if (isSquare(D)) want = 'factor';
      else if (a === 1 && b % 2 === 0) want = 'cts';
      else want = 'formula';
      if (new Set(pr.answer.options.map((o) => o.label)).size !== 4) return ['options'];
      return choiceLabel(pr.answer) === METHOD[want] ? [] : [`expected ${want}`];
    }
    if (/data point/.test(text)) {
      if (pr.answer.kind !== 'choice' || !tex) return ['unexpected kind'];
      const h = toPoly(parseExpression(texToExpr(tex.split('=')[1])));
      const m = /data point \$\((-?[\d\\{}frac]+), (-?[\d\\{}frac]+)\)\$/.exec(text);
      if (!m) return ['cannot read point'];
      const rd = (s: string) => toPoly(parseExpression(texToExpr(s))).constantValue();
      const t = rd(m[1]);
      const y = rd(m[2]);
      const T = positiveRoot(h);
      // greatest height on [0, T] by a fine scan (a different route from the vertex formula)
      const hn = h.coeffsIn('t').map((r) => r.toNumber());
      let top = -Infinity;
      for (let i = 0; i <= 20000; i++) {
        const u = (i * T) / 20000;
        top = Math.max(top, hn[0] + hn[1] * u + hn[2] * u * u);
      }
      const onCurve = h.evaluate({ t }).eq(y);
      const inDomain = t.toNumber() >= 0 && t.toNumber() <= T;
      const truths: PointKey[] = [];
      if (onCurve && inDomain) truths.push('yes');
      if (inDomain && !onCurve && y.toNumber() >= 0 && y.toNumber() <= top + 0.5) truths.push('otherTime');
      if (y.toNumber() > top + 0.5) truths.push('tooHigh');
      if (onCurve && !inDomain) truths.push('domain');
      if (truths.length !== 1) return [`${truths.length} labels describe the point`];
      if (truths[0] === 'domain' && y.toNumber() >= 0) return ['outside-domain point should have an impossible height'];
      return choiceLabel(pr.answer) === POINT[truths[0]] ? [] : [`expected ${truths[0]}`];
    }
    if (/exactly \$(\d+)\$ feet above/.test(text)) {
      if (pr.answer.kind !== 'solutions' || !tex) return ['unexpected kind'];
      const H = Number(/exactly \$(\d+)\$ feet above/.exec(text)![1]);
      const h = toPoly(parseExpression(texToExpr(tex.split('=')[1])));
      const cs = h.coeffsIn('t').map((r) => r.toInt());
      const T = positiveRoot(h);
      const roots = quadRoots(cs[2], cs[1], cs[0] - H).values.map((v) => Q(v));
      const keep = roots.filter((r) => r.toNumber() >= 0 && r.toNumber() <= T);
      const got = pr.answer.values.map((v) => Q(v));
      if (keep.length !== 2) return ['expected two times in the air'];
      if (got.length !== keep.length || !keep.every((r) => got.some((g) => g.eq(r)))) return ['wrong times'];
      return [];
    }
    if (pr.answer.kind !== 'number') return ['unexpected kind'];
    if (tex && tex.startsWith('h(t)')) {
      const h = toPoly(parseExpression(texToExpr(tex.split('=')[1])));
      const root = positiveRoot(h);
      if (pr.answer.roundTo === undefined) {
        const t = Rational.parse(pr.answer.value);
        if (!h.evaluate({ t }).isZero()) return ['key is not a root'];
        return Math.abs(t.toNumber() - root) < 1e-9 ? [] : ['key is not the positive root'];
      }
      return Math.abs(Number(pr.answer.value) - Math.round(root * 100) / 100) < 1e-9 ? [] : [`expected ${root.toFixed(4)}`];
    }
    const m = /is \$(\d+)\$ \w+ (longer than it is wide|more than twice its width)\. Its area is \$(\d+)\$/.exec(text);
    if (!m) return ['cannot parse'];
    const k = Number(m[1]);
    const mult = m[2].startsWith('more') ? 2 : 1;
    const A = Number(m[3]);
    // positive width by search
    const ws: number[] = [];
    for (let x = 1; x <= 200; x++) if (x * (mult * x + k) === A) ws.push(x);
    if (ws.length !== 1) return ['no unique whole-number width'];
    const want = /\*\*width\*\*/.test(text) ? ws[0] : mult * ws[0] + k;
    return Number(pr.answer.value) === want ? [] : ['wrong key'];
  },
};

export const U4_SOLVE_GENERATORS: GeneratorDef[] = [genSolveFactoring, genSolveSqrt, genCompleteSquareSolve, genCompleteSquareVertex, genQuadraticFormula, genDiscriminant, genQuadraticContext];

