/**
 * Unit 3, Lessons 2 and 3 generators: simplify square and cube roots (S3.03, S3.04),
 * add and subtract radicals (S3.05), multiply radicals (S3.06), and radicals with
 * variables (S3.07). Answers are built with integer arithmetic; verify() re-reads the
 * prompt and evaluates it exactly with radical arithmetic (or numerically, for variables).
 */
import type { GeneratorDef, Rng, SolutionStep, ProblemStep } from '../../core/curriculum/types';
import type { Misconception } from '../../core/math/answers';
import { parseExpression } from '../../core/math/parser';
import { evalNumeric } from '../../core/math/evaluate';
import { p, makeProblem, stringMisconceptions } from './util';
import { radTexToPlain, texSurd, plainSurd, splitPower, SQUAREFREE, CUBEFREE, radPlain, radTex, joinTerms, surdPlain, isSimplifiedSurd } from './u3-common';
import { Surd } from '../../core/math/surd';
import { Rational } from '../../core/math/rational';

const RAD_HINT = 'Type a root like 6sqrt(2) or 2cbrt(5)';

function expressionOf(pr: { prompt: Array<{ t: string; text?: string; tex?: string }> }): string | null {
  for (const b of pr.prompt) {
    if (b.t === 'math' && b.tex) return b.tex;
  }
  return null;
}

/** Common checks: the prompt expression and the key have the same exact value, and the key is simplified. */
function verifyConstant(pr: Parameters<GeneratorDef['verify']>[0]): string[] {
  if (pr.answer.kind !== 'expression') return ['unexpected kind'];
  const tex = expressionOf(pr as never);
  if (!tex) return ['no expression block'];
  const given = texSurd(tex);
  const key = plainSurd(pr.answer.value);
  if (!given || !key) return ['cannot evaluate'];
  const errs: string[] = [];
  if (!given.equals(key)) errs.push(`value mismatch: ${given.toPlain()} vs ${key.toPlain()}`);
  if (!isSimplifiedSurd(key)) errs.push('key is not simplified');
  // a second, floating-point route
  const a = evalNumeric(parseExpression(radTexToPlain(tex)));
  const b = evalNumeric(parseExpression(pr.answer.value));
  if (!(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a)))) errs.push('numeric mismatch');
  return errs;
}

function squareStep(n: number, k: number, index: 2 | 3): ProblemStep {
  const word = index === 2 ? 'square' : 'cube';
  const smaller: Misconception[] = [];
  for (let j = 2; j < k; j++) if (k % j === 0) smaller.push({ answer: String(Math.pow(j, index)), tag: 'radical-simplify', feedback: `$${Math.pow(j, index)}$ is a perfect ${word} factor, but there is a larger one.` });
  return {
    prompt: [p(`What is the **largest perfect ${word}** that divides $${Math.abs(n)}$?`)],
    answer: { kind: 'number', value: String(Math.pow(k, index)) },
    hints: [
      `Perfect ${word}s: ${index === 2 ? '$4, 9, 16, 25, 36, 49, 64, 81, 100, \\ldots$' : '$8, 27, 64, 125, 216, \\ldots$'}`,
      `Try the largest perfect ${word} that is not bigger than $${Math.abs(n)}$, then work down.`,
      `A factor divides $${Math.abs(n)}$ with no remainder.`,
      `Divide $${Math.abs(n)}$ by your factor. If the result still has a perfect ${word} factor, your factor was not the largest.`,
    ],
    misconceptions: smaller.slice(0, 3),
    explanation: `$${Math.abs(n)} = ${Math.pow(k, index)} \\cdot ${Math.abs(n) / Math.pow(k, index)}$.`,
  };
}

// ---------------------------------------------------------------------------
// S3.03: simplify square roots
// ---------------------------------------------------------------------------

export const genSimplifySqrt: GeneratorDef = {
  id: 'u3.simplify-sqrt',
  skillId: 'S3.03',
  description: 'Simplify a square root of a whole number by taking out the largest perfect square factor.',
  generate(rng, difficulty) {
    const k = difficulty === 1 ? rng.int(2, 5) : rng.int(2, 10);
    const b = rng.pick(difficulty === 1 ? SQUAREFREE.slice(0, 6) : SQUAREFREE.slice(0, 10));
    const c = difficulty === 3 ? rng.int(2, 5) : 1;
    const n = k * k * b;
    const out = c * k;
    const tex = `${c === 1 ? '' : c}\\sqrt{${n}}`;
    const answer = radPlain(out, b);
    const misconceptions = stringMisconceptions(answer, [
      { answer: radPlain(c * k * k, b), tag: 'radical-simplify', feedback: `$${k * k}$ comes out of the root as its square root, $${k}$, not as $${k * k}$.` },
      ...(c > 1 ? [{ answer: radPlain(c + k, b), tag: 'radical-simplify' as const, feedback: `Multiply the $${k}$ that comes out by the $${c}$ already in front. Do not add them.` }] : []),
    ]);
    const solution: SolutionStep[] = [
      { text: `Find the largest perfect square factor of $${n}$.`, tex: `${n} = ${k * k} \\cdot ${b}`, why: `$${k * k}$ is a perfect square and $${b}$ has no perfect square factor other than 1.` },
      { text: 'Split the root.', tex: `${c === 1 ? '' : c}\\sqrt{${n}} = ${c === 1 ? '' : c}\\sqrt{${k * k}} \\cdot \\sqrt{${b}}`, why: '$\\sqrt{ab} = \\sqrt{a} \\cdot \\sqrt{b}$ for $a, b \\ge 0$.' },
      { text: 'Take the square root of the perfect square.', tex: c === 1 ? `= ${radTex(out, b)}` : `= ${c} \\cdot ${k}\\sqrt{${b}} = ${radTex(out, b)}` },
    ];
    return makeProblem({
      skillId: 'S3.03',
      tags: [],
      prompt: [p('Simplify completely.'), { t: 'math', tex }],
      answer: { kind: 'expression', value: answer, form: 'simplified-radical' },
      inputHint: RAD_HINT,
      hints: [
        'Look for a perfect square that divides the number under the root.',
        `Use the **largest** perfect square factor of $${n}$, so you only simplify once.`,
        `Write $${n}$ as (perfect square) $\\cdot$ (what is left), then use $\\sqrt{ab} = \\sqrt{a}\\cdot\\sqrt{b}$.`,
        `The perfect square factor is $${k * k}$. Take its square root and leave $${b}$ under the root.`,
      ],
      solution,
      misconceptions,
      steps: [
        squareStep(n, k, 2),
        {
          prompt: [p(`Now simplify $${tex}$ completely.`)],
          answer: { kind: 'expression', value: answer, form: 'simplified-radical' },
          inputHint: RAD_HINT,
          hints: [`$${n} = ${k * k} \\cdot ${b}$`, `$\\sqrt{${k * k}} = ${k}$`, `Keep $${b}$ under the root.`, c > 1 ? `Multiply the ${k} by the ${c} in front.` : 'Write the whole number in front of the root.'],
          misconceptions,
          explanation: `$${tex} = ${radTex(out, b)}$.`,
        },
      ],
    });
  },
  verify: verifyConstant,
};

// ---------------------------------------------------------------------------
// S3.04: simplify cube roots
// ---------------------------------------------------------------------------

export const genSimplifyCbrt: GeneratorDef = {
  id: 'u3.simplify-cbrt',
  skillId: 'S3.04',
  description: 'Simplify a cube root by taking out the largest perfect cube factor, including negative numbers.',
  generate(rng, difficulty) {
    const k = difficulty === 1 ? rng.int(2, 3) : rng.int(2, 5);
    const b = rng.pick(CUBEFREE.slice(0, difficulty === 1 ? 6 : 12));
    const sign = difficulty >= 2 && rng.bool() ? -1 : 1;
    const c = difficulty === 3 ? rng.int(2, 4) : 1;
    const n = sign * k * k * k * b;
    const out = sign * c * k;
    const tex = `${c === 1 ? '' : c}\\sqrt[3]{${n}}`;
    const answer = radPlain(out, b, 3);
    const misconceptions = stringMisconceptions(answer, [
      { answer: radPlain(sign * c * k * k * k, b, 3), tag: 'radical-simplify', feedback: `$${k ** 3}$ comes out of the cube root as $${k}$, because $${k}^3 = ${k ** 3}$.` },
      ...(sign < 0 ? [{ answer: radPlain(-out, b, 3), tag: 'sign-error' as const, feedback: 'The cube root of a negative number is negative, because a negative number cubed is negative.' }] : []),
    ]);
    const solution: SolutionStep[] = [
      { text: `Find the largest perfect cube factor of $${n}$.`, tex: `${n} = ${sign < 0 ? `-${k ** 3}` : k ** 3} \\cdot ${b}`, why: `$${sign < 0 ? `-${k ** 3} = (-${k})^3` : `${k ** 3} = ${k}^3`}$, and $${b}$ has no perfect cube factor other than 1.` },
      { text: 'Split the root.', tex: `${c === 1 ? '' : c}\\sqrt[3]{${n}} = ${c === 1 ? '' : c}\\sqrt[3]{${sign * k ** 3}} \\cdot \\sqrt[3]{${b}}`, why: '$\\sqrt[3]{ab} = \\sqrt[3]{a} \\cdot \\sqrt[3]{b}$ for any real $a$ and $b$.' },
      { text: 'Take the cube root of the perfect cube.', tex: c === 1 ? `= ${radTex(out, b, 3)}` : `= ${c} \\cdot (${sign * k})\\sqrt[3]{${b}} = ${radTex(out, b, 3)}`, why: sign < 0 ? 'A cube root of a negative number is negative.' : undefined },
    ];
    return makeProblem({
      skillId: 'S3.04',
      tags: [],
      prompt: [p('Simplify completely.'), { t: 'math', tex }],
      answer: { kind: 'expression', value: answer, form: 'simplified-radical' },
      inputHint: RAD_HINT,
      hints: [
        'Look for a perfect **cube** that divides the number under the root: $8, 27, 64, 125, \\ldots$',
        'Use the largest perfect cube factor so you only simplify once.',
        sign < 0 ? 'A negative number has a negative cube root: $(-2)^3 = -8$, so $\\sqrt[3]{-8} = -2$.' : `Write $${n}$ as (perfect cube) $\\cdot$ (what is left).`,
        `The perfect cube factor is $${k ** 3}$, and $\\sqrt[3]{${k ** 3}} = ${k}$.`,
      ],
      solution,
      misconceptions,
      steps: [
        squareStep(n, k, 3),
        {
          prompt: [p(`Now simplify $${tex}$ completely.`)],
          answer: { kind: 'expression', value: answer, form: 'simplified-radical' },
          inputHint: RAD_HINT,
          hints: [`$${Math.abs(n)} = ${k ** 3} \\cdot ${b}$`, `$\\sqrt[3]{${k ** 3}} = ${k}$`, `Keep $${b}$ under the cube root.`, sign < 0 ? 'Remember the negative sign comes out of a cube root.' : 'Write the whole number in front of the root.'],
          misconceptions,
          explanation: `$${tex} = ${radTex(out, b, 3)}$.`,
        },
      ],
    });
  },
  verify: verifyConstant,
};

// ---------------------------------------------------------------------------
// S3.05: add and subtract radicals
// ---------------------------------------------------------------------------

/** A term c·√(k²·b) as shown in the prompt, and its simplified coefficient c·k. */
interface RadTerm {
  shownCoef: number;
  shownRad: number;
  coef: number;
  rad: number;
}

function termTex(t: RadTerm, first: boolean): string {
  const body = radTex(Math.abs(t.shownCoef), t.shownRad);
  if (first) return t.shownCoef < 0 ? `-${body}` : body;
  return t.shownCoef < 0 ? ` - ${body}` : ` + ${body}`;
}

function makeTerm(rng: Rng, b: number, simplifyFirst: boolean, allowNeg: boolean): RadTerm {
  const k = simplifyFirst ? rng.int(1, 4) : 1;
  let c = rng.int(1, simplifyFirst ? 3 : 9);
  if (allowNeg && rng.bool()) c = -c;
  return { shownCoef: c, shownRad: k * k * b, coef: c * k, rad: b };
}

export const genAddRadicals: GeneratorDef = {
  id: 'u3.add-radicals',
  skillId: 'S3.05',
  description: 'Add and subtract radicals, simplifying first to find like radicals.',
  generate(rng, difficulty) {
    const b = rng.pick(SQUAREFREE.slice(0, 7));
    let terms: RadTerm[];
    if (difficulty === 1) terms = [makeTerm(rng, b, false, false), makeTerm(rng, b, false, true)];
    else if (difficulty === 2) {
      terms = [makeTerm(rng, b, true, false), makeTerm(rng, b, true, true)];
      if (terms.every((t) => t.shownRad === b)) terms[1] = { ...terms[1], shownRad: 4 * b, coef: terms[1].shownCoef * 2 };
    } else {
      const other = rng.pick(SQUAREFREE.slice(0, 7).filter((x) => x !== b));
      terms = rng.shuffle([makeTerm(rng, b, true, false), makeTerm(rng, b, true, true), makeTerm(rng, other, true, true)]);
    }
    // combine like radicals
    const byRad = new Map<number, number>();
    for (const t of terms) byRad.set(t.rad, (byRad.get(t.rad) ?? 0) + t.coef);
    const rads = [...byRad.keys()];
    if (rads.every((r) => byRad.get(r) === 0)) return genAddRadicals.generate(rng, difficulty);
    const answer = joinTerms(rads.map((r) => (byRad.get(r) === 0 ? '0' : radPlain(byRad.get(r)!, r))));
    const answerTex = joinTerms(rads.map((r) => (byRad.get(r) === 0 ? '0' : radTex(byRad.get(r)!, r))));
    const tex = terms.map((t, i) => termTex(t, i === 0)).join('');
    const sumShown = terms.reduce((s, t) => s + t.shownRad, 0);
    const misconceptions = stringMisconceptions(answer, [
      ...(rads.length === 1 && terms.length === 2 ? [{ answer: radPlain(byRad.get(b)!, 2 * b), tag: 'radical-simplify' as const, feedback: 'When you combine like radicals, the number under the root stays the same, just as $3x + 2x = 5x$ (not $5x^2$).' }] : []),
      ...(terms.length === 2 && terms.every((t) => t.shownCoef === 1) ? [{ answer: `sqrt(${sumShown})`, tag: 'radical-simplify' as const, feedback: 'You cannot add the numbers under the roots: $\\sqrt{a} + \\sqrt{b} \\ne \\sqrt{a + b}$. Combine like radicals the way you combine like terms.' }] : []),
      ...(difficulty === 2 ? [{ answer: radPlain(terms.reduce((s, t) => s + t.shownCoef, 0), b), tag: 'radical-simplify' as const, feedback: 'Simplify each root first. The number that comes out of the root multiplies the coefficient in front.' }] : []),
    ]);
    const simplified = terms.map((t, i) => {
      const body = radTex(Math.abs(t.coef), t.rad);
      return i === 0 ? (t.coef < 0 ? `-${body}` : body) : t.coef < 0 ? ` - ${body}` : ` + ${body}`;
    });
    const solution: SolutionStep[] = [
      ...(difficulty >= 2 ? [{ text: 'Simplify each root first.', tex: `${tex} = ${simplified.join('')}`, why: 'Take the largest perfect square factor out of each root.' }] : []),
      { text: 'Combine like radicals by adding or subtracting their coefficients.', tex: `= ${answerTex}`, why: rads.length > 1 ? 'Radicals with different numbers under the root are unlike, so they stay separate.' : 'The number under the root stays the same.' },
    ];
    return makeProblem({
      skillId: 'S3.05',
      tags: difficulty === 3 ? ['multi-step'] : [],
      prompt: [p('Simplify completely.'), { t: 'math', tex }],
      answer: { kind: 'expression', value: answer, form: 'simplified-radical' },
      inputHint: 'Type an answer like 3sqrt(2) + 4sqrt(3)',
      hints: [
        'Like radicals have the same number under the root. You can only combine like radicals.',
        difficulty >= 2 ? 'Simplify every root first. Then look for like radicals.' : 'Add or subtract the numbers in front of the roots.',
        'Combine radicals the way you combine like terms: $3\\sqrt{2} + 4\\sqrt{2} = 7\\sqrt{2}$.',
        difficulty >= 2 ? `After simplifying, every root should have $${b}$${difficulty === 3 ? ' or another number with no perfect square factor' : ''} under it.` : 'The number under the root does not change when you add.',
      ],
      solution,
      misconceptions,
    });
  },
  verify: verifyConstant,
};

// ---------------------------------------------------------------------------
// S3.06: multiply radicals
// ---------------------------------------------------------------------------

/** Exact Surd for c·√r (index 2) computed by integer arithmetic. */
function rad(c: number, r: number): Surd {
  return Surd.root(BigInt(r), 2, Rational.from(c as never));
}

export const genMultiplyRadicals: GeneratorDef = {
  id: 'u3.multiply-radicals',
  skillId: 'S3.06',
  description: 'Multiply radicals, including the distributive property and conjugates, and simplify.',
  generate(rng, difficulty) {
    let tex: string;
    let answer: string;
    let solution: SolutionStep[];
    const misc: Misconception[] = [];
    if (difficulty <= 2) {
      // (p√a)(q√b) with ab having a square factor
      const b = rng.pick([2, 3, 5, 7]);
      const us = [1, 2, 3, 5, 6, 7].filter((u) => u % b !== 0);
      const u = rng.pick(us);
      let v = rng.pick(us);
      while (v === u || Number.isInteger(Math.sqrt(u * v))) v = rng.pick(us);
      const a1 = b * u;
      const a2 = b * v;
      const pc = difficulty === 2 ? rng.int(2, 5) : 1;
      const qc = difficulty === 2 ? rng.nonzeroInt(-4, 4) : 1;
      const prod = a1 * a2;
      const { out, inside } = splitPower(prod, 2);
      const coef = pc * qc * out;
      answer = radPlain(coef, inside);
      const f = (c: number, r: number) => (c === 1 ? `\\sqrt{${r}}` : c === -1 ? `-\\sqrt{${r}}` : `${c}\\sqrt{${r}}`);
      tex = difficulty === 1 ? `\\sqrt{${a1}} \\cdot \\sqrt{${a2}}` : `${f(pc, a1)} \\cdot ${qc < 0 ? `\\left(${f(qc, a2)}\\right)` : f(qc, a2)}`;
      solution = [
        { text: difficulty === 1 ? 'Multiply the numbers under the roots.' : 'Multiply the numbers in front, and multiply the numbers under the roots.', tex: `${tex} = ${pc * qc === 1 ? '' : pc * qc}\\sqrt{${prod}}`, why: '$\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$ for $a, b \\ge 0$.' },
        { text: 'Simplify the root.', tex: pc * qc === 1 ? `= ${radTex(coef, inside)}` : `= ${pc * qc} \\cdot ${radTex(out, inside)} = ${radTex(coef, inside)}`, why: `$${prod} = ${out * out} \\cdot ${inside}$.` },
      ];
      if (pc * qc !== 1 && pc + qc !== 0) misc.push({ answer: radPlain((pc + qc) * out, inside), tag: 'arithmetic-error', feedback: 'Multiply the numbers in front of the roots. Do not add them.' });
      misc.push({ answer: radPlain(pc * qc * out, prod), tag: 'radical-simplify', feedback: 'When a factor comes out of the root, it no longer stays inside.' });
    } else {
      const b = rng.pick(SQUAREFREE.slice(0, 6));
      const kind = rng.int(0, 2);
      if (kind === 0) {
        // √b(√c + k)
        const c = rng.pick(SQUAREFREE.slice(0, 7).filter((x) => x !== b));
        const k = rng.nonzeroInt(-6, 6);
        const value = rad(1, b).mul(rad(1, c).add(Surd.rational(Rational.from(k as never))));
        answer = surdPlain(value);
        tex = `\\sqrt{${b}}\\left(\\sqrt{${c}} ${k < 0 ? '-' : '+'} ${Math.abs(k)}\\right)`;
        solution = [
          { text: 'Distribute the root to each term in the parentheses.', tex: `${tex} = \\sqrt{${b}}\\cdot\\sqrt{${c}} ${k < 0 ? '-' : '+'} ${Math.abs(k)}\\sqrt{${b}}`, why: 'The distributive property: $a(b + c) = ab + ac$.' },
          { text: 'Multiply and simplify.', tex: `= ${value.toTex()}`, why: `$\\sqrt{${b}}\\cdot\\sqrt{${c}} = \\sqrt{${b * c}}$.` },
        ];
        misc.push({ answer: `sqrt(${b * c}) ${k < 0 ? '-' : '+'} ${Math.abs(k)}`, tag: 'distribution', feedback: `Multiply **both** terms by $\\sqrt{${b}}$, including the $${Math.abs(k)}$.` });
      } else if (kind === 1) {
        // conjugates (k + √b)(k − √b) = k² − b
        const k = rng.int(1, 7);
        const value = k * k - b;
        answer = String(value);
        tex = `\\left(${k} + \\sqrt{${b}}\\right)\\left(${k} - \\sqrt{${b}}\\right)`;
        solution = [
          { text: 'Multiply each term in the first group by each term in the second.', tex: `${k * k} - ${k}\\sqrt{${b}} + ${k}\\sqrt{${b}} - ${b}`, why: '$\\sqrt{' + b + '}\\cdot\\sqrt{' + b + '} = ' + b + '$.' },
          { text: 'The middle terms cancel.', tex: `= ${k * k} - ${b} = ${value}`, why: 'These are conjugates: $(a + b)(a - b) = a^2 - b^2$, so the result is rational.' },
        ];
        misc.push({ answer: String(k * k + b), tag: 'sign-error', feedback: `The last product is $(+\\sqrt{${b}})(-\\sqrt{${b}}) = -${b}$, so subtract it.` });
        misc.push({ answer: `${k * k} - ${b * b}`, tag: 'radical-simplify', feedback: `$\\sqrt{${b}}\\cdot\\sqrt{${b}} = ${b}$, not $${b * b}$.` });
      } else {
        // (k + √b)² = k² + b + 2k√b
        const k = rng.nonzeroInt(-5, 5);
        const value = Surd.rational(Rational.from((k * k + b) as never)).add(rad(2 * k, b));
        answer = surdPlain(value);
        tex = `\\left(${k} ${'+'} \\sqrt{${b}}\\right)^{2}`;
        solution = [
          { text: 'Write the square as a product and multiply every pair of terms.', tex: `\\left(${k} + \\sqrt{${b}}\\right)\\left(${k} + \\sqrt{${b}}\\right) = ${k * k} ${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}\\sqrt{${b}} ${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}\\sqrt{${b}} + ${b}`, why: 'Squaring means multiplying the expression by itself.' },
          { text: 'Combine like terms.', tex: `= ${value.toTex()}` },
        ];
        misc.push({ answer: String(k * k + b), tag: 'exponent-rule', feedback: `$(a + b)^2 \\ne a^2 + b^2$. You also need the middle terms $2 \\cdot ${k < 0 ? `(${k})` : k} \\cdot \\sqrt{${b}}$.` });
      }
    }
    const misconceptions = stringMisconceptions(answer, misc);
    return makeProblem({
      skillId: 'S3.06',
      tags: difficulty === 3 ? ['multi-step'] : [],
      prompt: [p('Multiply and simplify completely.'), { t: 'math', tex }],
      answer: { kind: 'expression', value: answer, form: 'simplified-radical' },
      inputHint: 'Type an answer like 5 + 2sqrt(3)',
      hints: [
        'Use $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$, and multiply numbers in front of roots together.',
        difficulty === 3 ? 'Multiply every term in the first part by every term in the second part.' : 'Multiply first, then simplify the root you get.',
        'A root times itself is the number under it: $\\sqrt{5} \\cdot \\sqrt{5} = 5$.',
        'Finish by taking any perfect square factor out of each root and combining like terms.',
      ],
      solution,
      misconceptions,
    });
  },
  verify: verifyConstant,
};

// ---------------------------------------------------------------------------
// S3.07: radicals with variables (all variables positive)
// ---------------------------------------------------------------------------

function powTex(v: string, e: number): string {
  return e === 0 ? '' : e === 1 ? v : `${v}^{${e}}`;
}
function powPlain(v: string, e: number): string {
  return e === 0 ? '' : e === 1 ? v : `${v}^${e}`;
}

export const genRadicalVariables: GeneratorDef = {
  id: 'u3.radical-variables',
  skillId: 'S3.07',
  description: 'Simplify square and cube roots of monomials with positive variables.',
  generate(rng, difficulty) {
    const index: 2 | 3 = difficulty === 3 && rng.bool() ? 3 : 2;
    const k = rng.int(index === 3 ? 2 : 2, index === 3 ? 3 : 6);
    const b = rng.pick(index === 3 ? CUBEFREE.slice(0, 6) : SQUAREFREE.slice(0, 7));
    const n = Math.pow(k, index) * (difficulty === 1 && rng.bool() ? 1 : b);
    const inNum = n / Math.pow(k, index);
    const ex = difficulty === 1 ? index * rng.int(1, 4) : rng.int(index + 1, 9);
    const useY = difficulty >= 2 && rng.bool();
    const ey = useY ? rng.int(1, 7) : 0;
    const outX = Math.floor(ex / index);
    const inX = ex % index;
    const outY = Math.floor(ey / index);
    const inY = ey % index;
    const insideVars = powPlain('x', inX) + powPlain('y', inY);
    const insideVarsTex = powTex('x', inX) + powTex('y', inY);
    const outVars = powPlain('x', outX) + powPlain('y', outY);
    const outVarsTex = powTex('x', outX) + powTex('y', outY);
    const fn = index === 2 ? 'sqrt' : 'cbrt';
    const rootTex = (s: string) => (index === 2 ? `\\sqrt{${s}}` : `\\sqrt[3]{${s}}`);
    const insidePlain = inNum === 1 && !insideVars ? '' : `${inNum === 1 && insideVars ? '' : inNum}${insideVars}`;
    const insideTex = inNum === 1 && !insideVarsTex ? '' : `${inNum === 1 && insideVarsTex ? '' : inNum}${insideVarsTex}`;
    const answer = `${k}${outVars}${insidePlain ? `${fn}(${insidePlain})` : ''}`;
    const answerTex = `${k}${outVarsTex}${insideTex ? rootTex(insideTex) : ''}`;
    const tex = rootTex(`${n}${powTex('x', ex)}${powTex('y', ey)}`);
    const misconceptions = stringMisconceptions(answer, [
      { answer: `${k}${powPlain('x', ex - inX)}${powPlain('y', ey - inY)}${insidePlain ? `${fn}(${insidePlain})` : ''}`, tag: 'exponent-rule', feedback: `To take the ${index === 2 ? 'square' : 'cube'} root of a power, **divide** the exponent by ${index}: $\\sqrt${index === 3 ? '[3]' : ''}{x^{${index * 2}}} = x^{2}$.` },
    ]);
    const varLine = (v: string, e: number) => {
      if (e === 0) return '';
      const whole = Math.floor(e / index);
      if (whole === 0) return `$${powTex(v, e)}$ stays under the root`;
      if (e === index) return `$${powTex(v, e)}$ is a perfect ${index === 2 ? 'square' : 'cube'}`;
      const perfect = whole === 1 ? `${v}^{${index}}` : `(${powTex(v, whole)})^{${index}}`;
      return e % index === 0 ? `$${powTex(v, e)} = ${perfect}$` : `$${powTex(v, e)} = ${perfect} \\cdot ${powTex(v, e % index)}$`;
    };
    const numLine = inNum === 1 ? `$${n} = ${k}^{${index}}$` : `$${n} = ${k}^{${index}} \\cdot ${inNum}$`;
    return makeProblem({
      skillId: 'S3.07',
      tags: [],
      prompt: [p(`Simplify completely. Assume all variables are positive.`), { t: 'math', tex }],
      answer: { kind: 'expression', value: answer, form: 'simplified-radical' },
      inputHint: index === 2 ? 'Type an answer like 3x^2sqrt(2x).' : 'Type an answer like 2xcbrt(3x^2).',
      hints: [
        `Simplify the number and each variable separately: $\\sqrt${index === 3 ? '[3]' : ''}{ab} = \\sqrt${index === 3 ? '[3]' : ''}{a}\\cdot\\sqrt${index === 3 ? '[3]' : ''}{b}$.`,
        `For a variable, split the power into a multiple of ${index} and what is left over: $x^{7} = x^{${index === 2 ? 6 : 6}} \\cdot x$.`,
        `$\\sqrt${index === 3 ? '[3]' : ''}{x^{${index * 3}}} = x^{3}$, because $(x^{3})^{${index}} = x^{${index * 3}}$.`,
        `The largest perfect ${index === 2 ? 'square' : 'cube'} factor of $${n}$ is $${Math.pow(k, index)}$.`,
      ],
      solution: [
        { text: 'Split into perfect powers and leftovers.', why: [numLine, varLine('x', ex), varLine('y', ey)].filter(Boolean).join(', ') + '.' },
        { text: `Take the ${index === 2 ? 'square' : 'cube'} root of each perfect power.`, tex: `${tex} = ${answerTex}`, why: `Divide each exponent in the perfect power by ${index}. The leftovers stay under the root.` },
      ],
      misconceptions,
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'expression') return ['unexpected kind'];
    const tex = expressionOf(pr as never);
    if (!tex) return ['no expression block'];
    const given = parseExpression(radTexToPlain(tex));
    const key = parseExpression(pr.answer.value);
    const errs: string[] = [];
    for (const [x, y] of [[1.7, 2.3], [0.4, 5.1], [3.2, 0.9], [2, 7]]) {
      const a = evalNumeric(given, { x, y });
      const b = evalNumeric(key, { x, y });
      if (!(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a)))) errs.push(`mismatch at x=${x}, y=${y}`);
    }
    // simplified: inside the root, the number has no perfect power factor and exponents are below the index
    const m = /(sqrt|cbrt)\(([^)]*)\)/.exec(pr.answer.value);
    if (m) {
      const index = m[1] === 'sqrt' ? 2 : 3;
      const num = Number(/^\d*/.exec(m[2])![0] || '1');
      if (splitPower(num, index).out !== 1) errs.push('number inside root not simplified');
      for (const e of m[2].matchAll(/[xy]\^(\d+)/g)) if (Number(e[1]) >= index) errs.push('exponent inside root too large');
    }
    return errs;
  },
};

export const U3_RADICAL_GENERATORS: GeneratorDef[] = [genSimplifySqrt, genSimplifyCbrt, genAddRadicals, genMultiplyRadicals, genRadicalVariables];

