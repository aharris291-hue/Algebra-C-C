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
import { rotChoice, idOf, stepLabel, stepsFinishErrors } from './u3-steps';

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

/** Step checks for a single root: the factor step is the largest perfect power factor (found by trial), and the steps finish the problem. */
function simplifyStepErrors(pr: Parameters<GeneratorDef['verify']>[0]): string[] {
  if (!pr.steps?.length) return [];
  const tex = expressionOf(pr as never) ?? '';
  const m = /\\sqrt(\[3\])?\{(-?\d+)\}/.exec(tex);
  const a = pr.steps[0].answer;
  if (!m || a.kind !== 'number') return ['cannot read the factor step'];
  const index = m[1] ? 3 : 2;
  const n = Math.abs(Number(m[2]));
  let best = 1;
  for (let j = 2; Math.pow(j, index) <= n; j++) if (n % Math.pow(j, index) === 0) best = Math.pow(j, index);
  return [...(Number(a.value) === best ? [] : [`factor step ${a.value}, largest perfect power is ${best}`]), ...stepsFinishErrors(pr)];
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
          hints: [
            `Split $${n}$ into (the perfect square you found) $\\cdot$ (what is left).`,
            'Use $\\sqrt{ab} = \\sqrt{a} \\cdot \\sqrt{b}$: the square root of the perfect square comes out in front as a whole number.',
            'The factor that is left has no perfect square factor, so it stays under the root.',
            c > 1 ? `$\\sqrt{${k * k}} = ${k}$. Multiply it by the $${c}$ already in front.` : `$\\sqrt{${k * k}} = ${k}$. Write it in front of the root, with no times sign.`,
          ],
          misconceptions,
          explanation: `$${tex} = ${radTex(out, b)}$.`,
        },
      ],
    });
  },
  verify: (pr) => [...verifyConstant(pr), ...simplifyStepErrors(pr)],
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
          hints: [
            `Split $${Math.abs(n)}$ into (the perfect cube you found) $\\cdot$ (what is left).`,
            'Use $\\sqrt[3]{ab} = \\sqrt[3]{a} \\cdot \\sqrt[3]{b}$: the cube root of the perfect cube comes out in front as a whole number.',
            `The factor that is left has no perfect cube factor, so it stays under the cube root.${sign < 0 ? ' A negative number has a negative cube root, so the sign comes out too.' : ''}`,
            `$\\sqrt[3]{${k ** 3}} = ${k}$. ${c > 1 ? `Multiply it by the $${c}$ already in front.` : 'Write it in front of the root, with no times sign.'}`,
          ],
          misconceptions,
          explanation: `$${tex} = ${radTex(out, b, 3)}$.`,
        },
      ],
    });
  },
  verify: (pr) => [...verifyConstant(pr), ...simplifyStepErrors(pr)],
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

// ---------------------------------------------------------------------------
// Guided steps for adding like radicals (difficulty 1)
// ---------------------------------------------------------------------------

const rootOf = (r: number, index: 2 | 3) => (index === 2 ? `\\sqrt{${r}}` : `\\sqrt[3]{${r}}`);
const LIKE_YES = (r: number, index: 2 | 3) => `Yes: both terms have $${rootOf(r, index)}$, so they are like radicals. Combine the numbers in front.`;
const LIKE_ADD_INSIDE = (r: number, index: 2 | 3) => `Yes: add the numbers under the roots to get $${rootOf(2 * r, index)}$.`;
const LIKE_NO = 'No: two roots can never be combined.';

/** Steps for c1·root(b) ± c2·root(b): like radicals?, the new coefficient, the answer. */
function addLikeSteps(tex: string, c1: number, c2: number, r: number, index: 2 | 3, answer: string, answerTex: string, finalMisc: Misconception[]): ProblemStep[] {
  const like = rotChoice(LIKE_YES(r, index), [LIKE_ADD_INSIDE(r, index), LIKE_NO], c1 + r);
  const sum = c1 + c2;
  const c2Tex = c2 < 0 ? `(${c2})` : String(c2);
  const word = index === 2 ? 'root' : 'cube root';
  return [
    {
      prompt: [p(`Look at $${tex}$. Can the two terms be combined into one term?`)],
      answer: like,
      hints: [
        'Like radicals have the same index and the same number under the root.',
        'Like radicals combine the way like terms do: $3x + 4x = 7x$.',
        `Compare the number under each ${word}.`,
        'When you combine like terms, the variable part stays the same.',
      ],
      misconceptions: [
        { answer: idOf(like, LIKE_ADD_INSIDE(r, index)), tag: 'radical-simplify', feedback: `The number under the root stays the same, just as $3x + 4x = 7x$, not $7x^2$. Here $\\sqrt{a} + \\sqrt{b} \\ne \\sqrt{a + b}$.` },
        { answer: idOf(like, LIKE_NO), tag: 'radical-simplify', feedback: `Roots with the same number inside are like radicals, so they **can** be combined, like $3x + 4x$.` },
      ],
      explanation: `Both terms have $${rootOf(r, index)}$, so they are like radicals, the way $3x$ and $4x$ are like terms.`,
    },
    {
      prompt: [p(`Combine the numbers in front of $${rootOf(r, index)}$. What is $${c1} + ${c2Tex}$?`)],
      answer: { kind: 'number', value: String(sum) },
      hints: [
        `A root with no number in front has an invisible $1$ in front of it, just like $x$ means $1x$.`,
        `The numbers in front are $${c1}$ and $${c2}$.`,
        c2 < 0 ? 'Adding a negative number is the same as subtracting.' : 'Add the two numbers.',
        `Leave $${rootOf(r, index)}$ out of this step: just combine $${c1}$ and $${c2}$.`,
      ],
      misconceptions: numberMisconceptionsInt(sum, [
        { value: c1 * c2, feedback: 'Add the numbers in front, do not multiply them.' },
        { value: c2 < 0 ? c1 - c2 : null, feedback: 'The second term is subtracted. Keep its minus sign.' },
      ]),
      explanation: `$${c1} + ${c2Tex} = ${sum}$.`,
    },
    {
      prompt: [p(`Now write $${tex}$ in simplest form.`)],
      answer: { kind: 'expression', value: answer, form: 'simplified-radical' },
      inputHint: index === 2 ? 'Type an answer like 7sqrt(3)' : 'Type an answer like 7cbrt(2)',
      hints: [
        `Put your combined number in front of $${rootOf(r, index)}$.`,
        `The number under the ${word} stays $${r}$.`,
        sum === 1 || sum === -1 ? `A $1$ in front does not need to be written: $1${rootOf(r, index)} = ${rootOf(r, index)}$.` : 'Write the number, then the root, with no times sign.',
        `Check: your answer keeps $${r}$ under the ${word}, and its number in front is the one you found in the last step.`,
      ],
      misconceptions: finalMisc,
      explanation: `$${tex} = ${answerTex}$.`,
    },
  ];
}

/** Integer misconceptions: drop nulls, the key itself and duplicates. */
function numberMisconceptionsInt(key: number, list: Array<{ value: number | null; feedback: string }>): Misconception[] {
  const seen = new Set<number>([key]);
  const out: Misconception[] = [];
  for (const m of list) {
    if (m.value === null || seen.has(m.value)) continue;
    seen.add(m.value);
    out.push({ answer: String(m.value), tag: 'radical-simplify', feedback: m.feedback });
  }
  return out;
}

/** Independent step checks for like-radical sums: the radicands in the prompt really match, and coefficient times root is the prompt's value. */
function addLikeStepErrors(pr: Parameters<GeneratorDef['verify']>[0]): string[] {
  if (pr.steps?.length !== 3) return [];
  const tex = expressionOf(pr as never) ?? '';
  const rads = [...tex.matchAll(/\\sqrt(\[3\])?\{(\d+)\}/g)].map((m) => `${m[1] ?? ''}${m[2]}`);
  const errs: string[] = [];
  if (!(rads.length === 2 && rads[0] === rads[1]) || !stepLabel(pr.steps[0]).startsWith('Yes: both')) errs.push('like-radicals step wrong');
  const c = pr.steps[1].answer;
  const m = /\\sqrt(\[3\])?\{(\d+)\}/.exec(tex);
  const given = texSurd(tex);
  if (c.kind !== 'number' || !m || !given || !Surd.root(BigInt(m[2]), m[1] ? 3 : 2, Rational.parse(c.value)).equals(given)) errs.push('coefficient step wrong');
  return [...errs, ...stepsFinishErrors(pr)];
}

// ---------------------------------------------------------------------------
// Guided steps for multiplying two roots (difficulty 1)
// ---------------------------------------------------------------------------

/** Steps for root(u)·root(v): the product under one root, its largest perfect power factor, the answer. */
function multiplySteps(tex: string, u: number, v: number, index: 2 | 3, answer: string, answerTex: string, finalMisc: Misconception[]): ProblemStep[] {
  const prod = u * v;
  const { out } = splitPower(prod, index);
  const word = index === 2 ? 'square' : 'cube';
  return [
    {
      prompt: [p(`Use $${index === 2 ? '\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}' : '\\sqrt[3]{a} \\cdot \\sqrt[3]{b} = \\sqrt[3]{ab}'}$: $${tex} = ${index === 2 ? '\\sqrt{N}' : '\\sqrt[3]{N}'}$. What is $N$?`)],
      answer: { kind: 'number', value: String(prod) },
      hints: [
        'Two roots with the same index multiply into one root.',
        `Multiply the numbers ${index === 2 ? 'under' : 'inside'} the roots.`,
        `The numbers are $${u}$ and $${v}$.`,
        `Work out $${u} \\cdot ${v}$.`,
      ],
      misconceptions: numberMisconceptionsInt(prod, [{ value: u + v, feedback: 'Multiply the numbers under the roots. Do not add them.' }]),
      explanation: `$${u} \\cdot ${v} = ${prod}$, so $${tex} = ${rootOf(prod, index)}$.`,
    },
    squareStep(prod, out, index),
    {
      prompt: [p(`Now simplify $${rootOf(prod, index)}$ completely to finish $${tex}$.`)],
      answer: { kind: 'expression', value: answer, form: 'simplified-radical' },
      inputHint: index === 2 ? RAD_HINT : 'Type an answer like 2cbrt(3)',
      hints: [
        `Split $${prod}$ into (perfect ${word}) $\\cdot$ (what is left).`,
        `Take the ${word} root of the perfect ${word}: it comes out in front.`,
        `What is left stays ${index === 2 ? 'under' : 'inside'} the root.`,
        `$\\${index === 2 ? 'sqrt' : 'sqrt[3]'}{${Math.pow(out, index)}} = ${out}$.`,
      ],
      misconceptions: finalMisc,
      explanation: `$${prod} = ${Math.pow(out, index)} \\cdot ${prod / Math.pow(out, index)}$, so $${rootOf(prod, index)} = ${answerTex}$.`,
    },
  ];
}

/** Independent step checks for a product of two roots. */
function multiplyStepErrors(pr: Parameters<GeneratorDef['verify']>[0]): string[] {
  if (pr.steps?.length !== 3) return [];
  const tex = expressionOf(pr as never) ?? '';
  const index: 2 | 3 = tex.includes('[3]') ? 3 : 2;
  const errs: string[] = [];
  const a1 = pr.steps[0].answer;
  const a2 = pr.steps[1].answer;
  const given = texSurd(tex);
  const N = a1.kind === 'number' ? Number(a1.value) : NaN;
  const asRoot = Number.isInteger(N) ? texSurd(rootOf(N, index)) : null;
  if (!given || !asRoot || !asRoot.equals(given)) errs.push('product step wrong');
  const f = a2.kind === 'number' ? Number(a2.value) : NaN;
  const r = Math.round(Math.pow(f, 1 / index));
  // a perfect power that divides N and leaves nothing with a perfect power factor
  if (!(Math.pow(r, index) === f && N % f === 0 && splitPower(N / f, index).out === 1)) errs.push('largest perfect power step wrong');
  return [...errs, ...stepsFinishErrors(pr)];
}

/** Parser text for a sum of terms coef·root(rad), like radicals combined (first-appearance order), zero terms dropped. */
function combinedPlain(parts: Array<{ coef: number; rad: number }>, index: 2 | 3): string {
  const byRad = new Map<number, number>();
  for (const q of parts) byRad.set(q.rad, (byRad.get(q.rad) ?? 0) + q.coef);
  return joinTerms([...byRad.entries()].filter(([, c]) => c !== 0).map(([r, c]) => radPlain(c, r, index)));
}

/**
 * Wrong answers for a three-term sum of radicals that must be simplified first (difficulty 3):
 * the factor that comes out of a root not multiplied in, the perfect power itself taken out
 * instead of its root, a lost sign, unlike radicals combined, and radicands added.
 */
function addRadicalsD3Misconceptions(terms: Array<{ shownCoef: number; shownRad: number; coef: number; rad: number }>, index: 2 | 3): Misconception[] {
  const word = index === 2 ? 'square' : 'cube';
  const out = (t: (typeof terms)[number]) => Math.round(Math.pow(Math.abs(t.shownRad) / t.rad, 1 / index));
  const sign = (t: (typeof terms)[number]) => Math.sign(t.shownRad);
  const rads = [...new Set(terms.map((t) => t.rad))];
  const like = rads.find((r) => terms.filter((t) => t.rad === r).length >= 2)!;
  const other = rads.find((r) => r !== like)!;
  const total = terms.reduce((acc, t) => acc + t.coef, 0);
  const likeSum = terms.filter((t) => t.rad === like).reduce((acc, t) => acc + t.coef, 0);
  const otherSum = terms.filter((t) => t.rad === other).reduce((acc, t) => acc + t.coef, 0);
  const rootTex = (r: number) => (index === 2 ? `\\sqrt{${r}}` : `\\sqrt[3]{${r}}`);
  const list: Array<Misconception | null> = [
    terms.some((t) => out(t) > 1)
      ? { answer: combinedPlain(terms.map((t) => ({ coef: t.shownCoef * sign(t), rad: t.rad })), index), tag: 'radical-simplify', feedback: `When you simplify a root, the number that comes out multiplies the coefficient already in front of it. Check each term you simplified.` }
      : null,
    terms.some((t) => out(t) > 1)
      ? { answer: combinedPlain(terms.map((t) => ({ coef: t.shownCoef * sign(t) * Math.pow(out(t), index), rad: t.rad })), index), tag: 'radical-simplify', feedback: `The number that comes out of the root is the ${word} root of the perfect ${word} factor, not the factor itself.` }
      : null,
    terms.some((t) => t.shownRad < 0)
      ? { answer: combinedPlain(terms.map((t) => ({ coef: t.shownCoef * out(t), rad: t.rad })), index), tag: 'sign-error', feedback: 'The cube root of a negative number is negative, for example $\\sqrt[3]{-8} = -2$. Keep that sign when you take the factor out.' }
      : null,
    { answer: combinedPlain(terms.map((t) => ({ coef: Math.abs(t.coef), rad: t.rad })), index), tag: 'sign-error', feedback: `Check the signs: a minus in front of a term subtracts its coefficient${index === 3 ? ', and so does a cube root of a negative number' : ''}. Keep each sign with its term.` },
    { answer: radPlain(total, like, index), tag: 'unlike-terms', feedback: `$${rootTex(like)}$ and $${rootTex(other)}$ are unlike radicals, so they cannot be combined into one term. Only terms with the same number under the root combine.` },
    { answer: radPlain(total, other, index), tag: 'unlike-terms', feedback: `$${rootTex(like)}$ and $${rootTex(other)}$ are unlike radicals, so they cannot be combined into one term. Only terms with the same number under the root combine.` },
    likeSum !== 0
      ? { answer: joinTerms([radPlain(likeSum, 2 * like, index), radPlain(otherSum, other, index)]), tag: 'radical-simplify', feedback: 'When you combine like radicals, the number under the root stays the same, just as $3x + 2x = 5x$. Do not add the numbers under the roots.' }
      : null,
  ];
  return list.filter((m): m is Misconception => m !== null && m.answer !== '0' && m.answer !== '');
}

export const genAddRadicals: GeneratorDef = {
  id: 'u3.add-radicals',
  skillId: 'S3.05',
  description: 'Add and subtract radicals, simplifying first to find like radicals.',
  generate(rng, difficulty) {
    if (rng.next() < (difficulty === 1 ? 0.25 : 0.35)) return addCubeRoots(rng, difficulty);
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
      ...(difficulty === 3 ? addRadicalsD3Misconceptions(terms, 2) : []),
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
      steps: difficulty === 1 ? addLikeSteps(tex, terms[0].coef, terms[1].coef, b, 2, answer, answerTex, misconceptions) : undefined,
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
  verify: (pr) => [...verifyConstant(pr), ...addLikeStepErrors(pr)],
};


/** Cube-root terms c·∛(k³·b) as shown, and simplified c·k·∛b. A negative radicand is allowed at difficulty 3. */
interface CubeTerm {
  shownCoef: number;
  shownRad: number;
  coef: number;
  rad: number;
}

function cubeTermTex(t: CubeTerm, first: boolean): string {
  const body = t.shownCoef === 1 || t.shownCoef === -1 ? `\\sqrt[3]{${t.shownRad}}` : `${Math.abs(t.shownCoef)}\\sqrt[3]{${t.shownRad}}`;
  if (first) return t.shownCoef < 0 ? `-${body}` : body;
  return t.shownCoef < 0 ? ` - ${body}` : ` + ${body}`;
}

function addCubeRoots(rng: Rng, difficulty: number) {
  const b = rng.pick([2, 3, 4, 5]);
  const mk = (simplify: boolean, allowNeg: boolean, negRad: boolean, rad = b): CubeTerm => {
    const k = simplify ? rng.int(2, 3) : 1;
    let c = rng.int(1, simplify ? 3 : 8);
    if (allowNeg && rng.bool()) c = -c;
    const sign = negRad ? -1 : 1;
    return { shownCoef: c, shownRad: sign * k * k * k * rad, coef: c * k * sign, rad };
  };
  let terms: CubeTerm[];
  if (difficulty === 1) terms = [mk(false, false, false), mk(false, true, false)];
  else if (difficulty === 2) terms = rng.shuffle([mk(true, false, false), mk(false, true, false)]);
  else {
    const other = rng.pick([2, 3, 4, 5].filter((x) => x !== b));
    terms = rng.shuffle([mk(true, false, rng.bool()), mk(true, true, false), mk(rng.bool(), true, false, other)]);
  }
  if (new Set(terms.map((t) => `${t.shownCoef}:${t.shownRad}`)).size !== terms.length && difficulty > 1) return addCubeRoots(rng, difficulty);
  const byRad = new Map<number, number>();
  for (const t of terms) byRad.set(t.rad, (byRad.get(t.rad) ?? 0) + t.coef);
  const rads = [...byRad.keys()];
  if (rads.some((r) => byRad.get(r) === 0)) return addCubeRoots(rng, difficulty);
  const answer = joinTerms(rads.map((r) => radPlain(byRad.get(r)!, r, 3)));
  const answerTex = joinTerms(rads.map((r) => radTex(byRad.get(r)!, r, 3)));
  const tex = terms.map((t, i) => cubeTermTex(t, i === 0)).join('');
  const simplified = terms
    .map((t, i) => {
      const body = radTex(Math.abs(t.coef), t.rad, 3);
      return i === 0 ? (t.coef < 0 ? `-${body}` : body) : t.coef < 0 ? ` - ${body}` : ` + ${body}`;
    })
    .join('');
  const shownSum = terms.reduce((acc, t) => acc + t.shownCoef, 0);
  const misc: Misconception[] = [];
  if (difficulty === 2 && shownSum !== 0) misc.push({ answer: radPlain(shownSum, b, 3), tag: 'radical-simplify', feedback: 'Simplify each cube root first. The number that comes out of the cube root multiplies the coefficient in front.' });
  if (rads.length === 1 && terms.length === 2) misc.push({ answer: radPlain(byRad.get(b)!, 2 * b, 3), tag: 'radical-simplify', feedback: 'When you combine like radicals, the number under the root stays the same, just as $3x + 2x = 5x$.' });
  // pulling out a square root instead of a cube root, e.g. ∛54 → 3∛6
  const sqWrong = terms.find((t) => Math.abs(t.shownRad) !== t.rad && splitPower(Math.abs(t.shownRad), 2).out > 1);
  if (sqWrong && rads.length === 1 && terms.length === 2) {
    const sp = splitPower(Math.abs(sqWrong.shownRad), 2);
    if (sp.inside !== b && sp.inside > 1) misc.push({ answer: joinTerms(terms.map((t) => (t === sqWrong ? radPlain(t.shownCoef * sp.out * Math.sign(t.shownRad), sp.inside, 3) : radPlain(t.coef, t.rad, 3)))), tag: 'radical-simplify', feedback: 'For a **cube** root, look for a perfect **cube** factor ($8, 27, 64, \\ldots$), not a perfect square.' });
  }
  if (difficulty === 3) misc.push(...addRadicalsD3Misconceptions(terms, 3));
  const solution: SolutionStep[] = [
    ...(difficulty >= 2 ? [{ text: 'Simplify each cube root first.', tex: `${tex} = ${simplified}`, why: `Take the largest perfect cube factor out of each root: ${terms.filter((t) => Math.abs(t.shownRad) !== t.rad).map((t) => `$${t.shownRad} = ${t.shownRad < 0 ? '-' : ''}${Math.abs(t.shownRad) / t.rad} \\cdot ${t.rad}$ and $\\sqrt[3]{${t.shownRad < 0 ? '-' : ''}${Math.abs(t.shownRad) / t.rad}} = ${Math.round(Math.cbrt(t.shownRad / t.rad))}$`).join('; ')}.` }] : []),
    { text: 'Combine like radicals by adding or subtracting their coefficients.', tex: `= ${answerTex}`, why: rads.length > 1 ? 'Cube roots with different numbers inside are unlike, so they stay separate.' : 'Like cube roots combine the way like terms do, and the number inside stays the same.' },
  ];
  return makeProblem({
    skillId: 'S3.05',
    tags: difficulty === 3 ? ['multi-step'] : [],
    prompt: [p('Simplify completely.'), { t: 'math', tex }],
    answer: { kind: 'expression', value: answer, form: 'simplified-radical' },
    inputHint: 'Type an answer like 7cbrt(2) or 3cbrt(2) + cbrt(5)',
    steps: difficulty === 1 ? addLikeSteps(tex, terms[0].coef, terms[1].coef, b, 3, answer, answerTex, stringMisconceptions(answer, misc)) : undefined,
    hints: [
      'Like radicals have the same index **and** the same number inside. Only like radicals combine.',
      difficulty >= 2 ? 'Simplify every cube root first: look for a perfect cube factor, $8, 27, 64, \\ldots$' : 'Add or subtract the numbers in front of the cube roots.',
      'Combine cube roots the way you combine like terms: $2\\sqrt[3]{5} + 4\\sqrt[3]{5} = 6\\sqrt[3]{5}$.',
      difficulty === 3 ? 'A cube root of a negative number is negative: $\\sqrt[3]{-8} = -2$. After simplifying, group the terms with the same number inside.' : 'The number inside the cube root does not change when you add.',
    ],
    solution,
    misconceptions: stringMisconceptions(answer, misc),
  });
}

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
    let stepPair: [number, number] | null = null;
    let stepAnswerTex = '';
    if (rng.next() < (difficulty === 3 ? 0.25 : 0.35)) return multiplyCubeRoots(rng, difficulty);
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
      stepPair = [a1, a2];
      stepAnswerTex = radTex(coef, inside);
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
        let k = rng.int(1, 7);
        // k² = 2b would make the answer equal b, which the feedback below mentions
        while (k * k === 2 * b) k = rng.int(1, 7);
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
    const steps = difficulty === 1 && stepPair ? multiplySteps(tex, stepPair[0], stepPair[1], 2, answer, stepAnswerTex, misconceptions) : undefined;
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
      steps,
    });
  },
  verify: (pr) => [...verifyConstant(pr), ...multiplyStepErrors(pr)],
};


/** Cube-free radicands used for products of cube roots. */
const CUBE_FACTORS = [2, 3, 4, 5, 6, 9, 10, 12, 18, 25];

function multiplyCubeRoots(rng: Rng, difficulty: number) {
  const misc: Misconception[] = [];
  let cubePair: [number, number] | null = null;
  let cubeAnswerTex = '';
  let tex: string;
  let answer: string;
  let solution: SolutionStep[];
  if (difficulty <= 2) {
    // (p∛u)(q∛v): u·v has a perfect cube factor; at difficulty 2 it may be a perfect cube
    const pairs: Array<[number, number]> = [];
    for (const u of CUBE_FACTORS)
      for (const v of CUBE_FACTORS) {
        if (u >= v) continue;
        const sp = splitPower(u * v, 3);
        if (sp.out > 1 && (difficulty === 2 || sp.inside > 1) && u * v <= 250) pairs.push([u, v]);
      }
    const [u, v] = rng.shuffle([...rng.pick(pairs)]);
    const pc = difficulty === 2 ? rng.int(2, 4) : 1;
    const qc = difficulty === 2 ? rng.nonzeroInt(-4, 4) : 1;
    const prod = u * v;
    const { out, inside } = splitPower(prod, 3);
    const coef = pc * qc * out;
    answer = radPlain(coef, inside, 3);
    const f = (c: number, r: number) => (c === 1 ? `\\sqrt[3]{${r}}` : c === -1 ? `-\\sqrt[3]{${r}}` : `${c}\\sqrt[3]{${r}}`);
    tex = difficulty === 1 ? `\\sqrt[3]{${u}} \\cdot \\sqrt[3]{${v}}` : `${f(pc, u)} \\cdot ${qc < 0 ? `\\left(${f(qc, v)}\\right)` : f(qc, v)}`;
    solution = [
      { text: difficulty === 1 ? 'Multiply the numbers inside the cube roots.' : 'Multiply the numbers in front, and multiply the numbers inside the cube roots.', tex: `${tex} = ${pc * qc === 1 ? '' : pc * qc}\\sqrt[3]{${prod}}`, why: '$\\sqrt[3]{a} \\cdot \\sqrt[3]{b} = \\sqrt[3]{ab}$ for any real numbers $a$ and $b$.' },
      { text: inside === 1 ? 'The product is a perfect cube, so the cube root is a whole number.' : 'Simplify the cube root.', tex: pc * qc === 1 ? `= ${radTex(coef, inside, 3)}` : `= ${pc * qc} \\cdot ${radTex(out, inside, 3)} = ${radTex(coef, inside, 3)}`, why: inside === 1 ? `$${prod} = ${out}^3$.` : `$${prod} = ${out ** 3} \\cdot ${inside}$ and $\\sqrt[3]{${out ** 3}} = ${out}$.` },
    ];
    misc.push({ answer: radPlain(pc * qc, prod, 3), tag: 'radical-simplify', feedback: 'Simplify at the end: look for a perfect cube factor of the number inside.' });
    const sq = splitPower(prod, 2);
    if (sq.out > 1 && (sq.out !== out || sq.inside !== inside)) misc.push({ answer: radPlain(pc * qc * sq.out, sq.inside, 3), tag: 'radical-simplify', feedback: 'For a **cube** root, take out a perfect **cube** factor ($8, 27, 64, 125, \\ldots$), not a perfect square.' });
    if (pc * qc !== 1 && pc + qc !== 0) misc.push({ answer: radPlain((pc + qc) * out, inside, 3), tag: 'arithmetic-error', feedback: 'Multiply the numbers in front of the roots. Do not add them.' });
    cubePair = [u, v];
    cubeAnswerTex = radTex(coef, inside, 3);
  } else {
    // ∛b(∛c + k): distribute
    const b = rng.pick([2, 3, 4, 5]);
    const c = rng.pick(CUBE_FACTORS.filter((x) => x !== b && splitPower(x * b, 3).out > 1 && x * b <= 250));
    const k = rng.nonzeroInt(-6, 6);
    const prod = b * c;
    const { out, inside } = splitPower(prod, 3);
    const value = Surd.root(BigInt(prod), 3).add(Surd.root(BigInt(b), 3, Rational.from(k as never)));
    answer = surdPlain(value);
    tex = `\\sqrt[3]{${b}}\\left(\\sqrt[3]{${c}} ${k < 0 ? '-' : '+'} ${Math.abs(k)}\\right)`;
    solution = [
      { text: 'Distribute the cube root to each term in the parentheses.', tex: `${tex} = \\sqrt[3]{${b}}\\cdot\\sqrt[3]{${c}} ${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}\\sqrt[3]{${b}}`, why: 'The distributive property: $a(b + c) = ab + ac$.' },
      { text: 'Multiply and simplify.', tex: `= \\sqrt[3]{${prod}} ${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}\\sqrt[3]{${b}} = ${value.toTex()}`, why: inside === 1 ? `$${prod} = ${out}^3$, so $\\sqrt[3]{${prod}} = ${out}$.` : `$${prod} = ${out ** 3} \\cdot ${inside}$, so $\\sqrt[3]{${prod}} = ${radTex(out, inside, 3)}$.` },
    ];
    misc.push({ answer: `${radPlain(out, inside, 3)} ${k < 0 ? '-' : '+'} ${Math.abs(k)}`, tag: 'distribution', feedback: `Multiply **both** terms by $\\sqrt[3]{${b}}$, including the $${Math.abs(k)}$.` });
  }
  return makeProblem({
    skillId: 'S3.06',
    tags: difficulty === 3 ? ['multi-step'] : [],
    prompt: [p('Multiply and simplify completely.'), { t: 'math', tex }],
    answer: { kind: 'expression', value: answer, form: 'simplified-radical' },
    inputHint: 'Type an answer like 2cbrt(3) or 2 + 3cbrt(2)',
    steps: difficulty === 1 && cubePair ? multiplySteps(tex, cubePair[0], cubePair[1], 3, answer, cubeAnswerTex, stringMisconceptions(answer, misc)) : undefined,
    hints: [
      'Use $\\sqrt[3]{a} \\cdot \\sqrt[3]{b} = \\sqrt[3]{ab}$, and multiply numbers in front of the roots together.',
      difficulty === 3 ? 'Multiply the cube root by every term in the parentheses.' : 'Multiply first, then simplify the cube root you get.',
      'Perfect cubes to look for inside the root: $8$, $27$, $64$, $125$, $216$.',
      'Finish by taking any perfect cube factor out of the cube root.',
    ],
    solution,
    misconceptions: stringMisconceptions(answer, misc),
  });
}

// ---------------------------------------------------------------------------
// S3.07: radicals with variables (all variables positive)
// ---------------------------------------------------------------------------

function powTex(v: string, e: number): string {
  return e === 0 ? '' : e === 1 ? v : `${v}^{${e}}`;
}
function powPlain(v: string, e: number): string {
  return e === 0 ? '' : e === 1 ? v : `${v}^${e}`;
}

/** Guided steps for √(n·x^e) with e even (difficulty 1): the number part, the variable part, the answer. */
function variableSteps(tex: string, n: number, k: number, ex: number, answer: string, answerTex: string, finalMisc: Misconception[]): ProblemStep[] {
  const half = ex / 2;
  const xHalf = powPlain('x', half);
  const xHalfTex = powTex('x', half);
  return [
    squareStep(n, k, 2),
    {
      prompt: [p(`Now the variable part. What is $\\sqrt{${powTex('x', ex)}}$? (Remember that $x$ is positive.)`)],
      answer: { kind: 'expression', value: xHalf, variables: ['x'] },
      inputHint: 'Type a power like x^3.',
      hints: [
        `$\\sqrt{${powTex('x', ex)}}$ asks: what times itself is $${powTex('x', ex)}$?`,
        'When you multiply powers of the same base, you add the exponents: $x^{a} \\cdot x^{a} = x^{2a}$.',
        `So you need an exponent that, added to itself, gives $${ex}$.`,
        `Divide the exponent $${ex}$ by $2$.`,
      ],
      misconceptions: stringMisconceptions(xHalf, [
        { answer: powPlain('x', ex), tag: 'exponent-rule', feedback: 'The square root changes the power: divide the exponent by $2$.' },
        ...(ex - 2 !== half && ex > 2 ? [{ answer: powPlain('x', ex - 2), tag: 'exponent-rule' as const, feedback: 'Divide the exponent by $2$; do not subtract $2$.' }] : []),
        ...(ex > 2 ? [{ answer: `x^${ex * 2}`, tag: 'exponent-rule' as const, feedback: 'A square root makes the exponent smaller: divide by $2$, do not multiply.' }] : []),
      ]),
      explanation: `$${xHalfTex} \\cdot ${xHalfTex} = ${powTex('x', ex)}$, so $\\sqrt{${powTex('x', ex)}} = ${xHalfTex}$.`,
    },
    {
      prompt: [p(`Put the parts together: simplify $${tex}$ completely.`)],
      answer: { kind: 'expression', value: answer, form: 'simplified-radical' },
      inputHint: 'Type an answer like 3x^2sqrt(2).',
      hints: [
        '$\\sqrt{ab} = \\sqrt{a} \\cdot \\sqrt{b}$, so simplify each part and multiply.',
        `The square root of the perfect square factor of $${n}$ comes out in front.`,
        `$\\sqrt{${powTex('x', ex)}} = ${xHalfTex}$ comes out in front too.`,
        n === k * k ? 'Nothing is left under the root, so no root is needed in the answer.' : `What is left of $${n}$ stays under the root.`,
      ],
      misconceptions: finalMisc,
      explanation: `$${tex} = ${answerTex}$.`,
    },
  ];
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
    const steps = difficulty === 1 ? variableSteps(tex, n, k, ex, answer, answerTex, misconceptions) : undefined;
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
      steps,
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
    if (pr.steps?.length === 3) {
      // the number step: a perfect square that divides n and leaves no perfect square factor
      const n = Number(/\\sqrt\{(\d+)/.exec(tex)?.[1]);
      const f = pr.steps[0].answer.kind === 'number' ? Number(pr.steps[0].answer.value) : NaN;
      const r = Math.round(Math.sqrt(f));
      if (!(r * r === f && n % f === 0 && splitPower(n / f, 2).out === 1)) errs.push('perfect square step wrong');
      // the variable step: its square is the power of x under the root
      const ex = Number(/x\^\{(\d+)\}/.exec(tex)?.[1] ?? (/x/.test(tex) ? 1 : 0));
      const s2 = pr.steps[1].answer;
      if (s2.kind !== 'expression') errs.push('variable step kind');
      else
        for (const x of [1.3, 2.2, 0.7]) {
          const v = evalNumeric(parseExpression(s2.value), { x });
          if (!(v > 0 && Math.abs(v * v - Math.pow(x, ex)) <= 1e-9 * Math.pow(x, ex))) errs.push('variable step wrong');
        }
      errs.push(...stepsFinishErrors(pr));
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

