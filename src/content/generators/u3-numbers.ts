/**
 * Unit 3, Lesson 1 generators: rational and irrational numbers (S3.01) and
 * closure of sums and products (S3.02).
 */
import type { GeneratorDef, Rng, Difficulty, SolutionStep } from '../../core/curriculum/types';
import { p, makeProblem, makeChoice, choiceLabel } from './util';
import { texSurd, SQUAREFREE, CUBEFREE, radTex } from './u3-common';

// ---------------------------------------------------------------------------
// Number pool
// ---------------------------------------------------------------------------

export interface NumItem {
  tex: string;
  rational: boolean;
  /** one-sentence reason, shown in the worked solution */
  why: string;
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

function fracTex(n: number, d: number): string {
  return `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`;
}

function properFraction(rng: Rng): { n: number; d: number } {
  for (;;) {
    const d = rng.int(2, 9);
    const n = rng.nonzeroInt(-11, 11);
    if (gcd(n, d) === 1) return { n, d };
  }
}

/** Repeating digits that do not collapse to a shorter period ("33" is "3"). */
function repeatingDecimal(rng: Rng): string {
  const whole = rng.int(0, 4);
  if (rng.bool()) {
    const digit = rng.int(1, 9);
    return `${whole}.\\overline{${digit}}`;
  }
  let a = rng.int(0, 9);
  let b = rng.int(0, 9);
  while (a === b) b = rng.int(0, 9);
  const lead = rng.bool() ? String(rng.int(1, 9)) : '';
  return `${whole}.${lead}\\overline{${a}${b}}`;
}

/** A decimal whose digits follow a pattern that never repeats: 0.1010010001... */
function patternDecimal(rng: Rng): string {
  const one = rng.int(1, 9);
  let zero = rng.int(0, 9);
  while (zero === one) zero = rng.int(0, 9);
  let s = '';
  for (let k = 1; s.length < 12; k++) s += String(one) + String(zero).repeat(k);
  return `${rng.int(0, 3)}.${s.slice(0, 12)}\\ldots`;
}

const RATIONAL_WHY = {
  integer: 'Every integer can be written as a fraction with denominator 1.',
  fraction: 'It is already a fraction of two integers.',
  terminating: 'A decimal that ends can be written as a fraction over a power of 10.',
  repeating: 'A decimal that repeats forever can always be written as a fraction.',
  perfectRoot: 'The number under the square root is a perfect square, so the root is an integer.',
  perfectCbrt: 'The number under the cube root is a perfect cube, so the root is an integer.',
  fractionRoot: 'The top and bottom are both perfect squares, so the root is a fraction.',
  combo: 'After simplifying, the result is a fraction of two integers.',
};
const IRRATIONAL_WHY = {
  root: 'The number under the square root is not a perfect square, so its decimal never ends and never repeats.',
  scaledRoot: 'The number under the square root is not a perfect square, so the root is irrational, and a nonzero rational number times an irrational number is irrational.',
  cbrt: 'The number under the cube root is not a perfect cube, so its decimal never ends and never repeats.',
  scaledPi: '$\\pi$ is irrational, and a nonzero rational number times an irrational number is irrational.',
  pi: '$\\pi$ is irrational: its decimal never ends and never repeats.',
  pattern: 'The digits follow a pattern, but the pattern never repeats, so the decimal never ends and never repeats.',
  combo: 'A nonzero rational number times an irrational number, or plus an irrational number, is irrational.',
};

type Kind = 'integer' | 'fraction' | 'terminating' | 'repeating' | 'perfectRoot' | 'perfectCbrt' | 'fractionRoot' | 'ratCombo' | 'root' | 'cbrt' | 'pi' | 'pattern' | 'irrCombo';

function makeItem(rng: Rng, kind: Kind): NumItem {
  switch (kind) {
    case 'integer':
      return { tex: String(rng.int(-20, 20)), rational: true, why: RATIONAL_WHY.integer };
    case 'fraction': {
      const f = properFraction(rng);
      return { tex: fracTex(f.n, f.d), rational: true, why: RATIONAL_WHY.fraction };
    }
    case 'terminating': {
      const v = (rng.int(1, 999) * (rng.bool() ? 1 : -1)) / rng.pick([10, 100, 1000]);
      return { tex: String(v), rational: true, why: RATIONAL_WHY.terminating };
    }
    case 'repeating':
      return { tex: repeatingDecimal(rng), rational: true, why: RATIONAL_WHY.repeating };
    case 'perfectRoot': {
      const k = rng.int(2, 13);
      return { tex: `${rng.bool() ? '-' : ''}\\sqrt{${k * k}}`, rational: true, why: RATIONAL_WHY.perfectRoot };
    }
    case 'perfectCbrt': {
      const k = rng.int(2, 5) * (rng.bool() ? 1 : -1);
      return { tex: `\\sqrt[3]{${k * k * k}}`, rational: true, why: RATIONAL_WHY.perfectCbrt };
    }
    case 'fractionRoot': {
      let a = rng.int(1, 7);
      const b = rng.int(2, 9);
      while (gcd(a, b) !== 1) a = rng.int(1, 7);
      return { tex: `\\sqrt{\\frac{${a * a}}{${b * b}}}`, rational: true, why: RATIONAL_WHY.fractionRoot };
    }
    case 'ratCombo': {
      // radicals that simplify to rational numbers
      const b = rng.pick(SQUAREFREE.slice(0, 6));
      const m = rng.int(2, 3);
      const choice = rng.int(0, 2);
      if (choice === 0) return { tex: `\\sqrt{${b}} \\cdot \\sqrt{${b * m * m}}`, rational: true, why: `$\\sqrt{${b}} \\cdot \\sqrt{${b * m * m}} = \\sqrt{${b * b * m * m}} = ${b * m}$, an integer.` };
      if (choice === 1) return { tex: `\\frac{\\sqrt{${b * m * m}}}{\\sqrt{${b}}}`, rational: true, why: `$\\frac{\\sqrt{${b * m * m}}}{\\sqrt{${b}}} = \\sqrt{${m * m}} = ${m}$, an integer.` };
      const k = rng.int(1, 9);
      return { tex: `${k} + \\sqrt{${b}} - \\sqrt{${b}}`, rational: true, why: `The two roots cancel, leaving $${k}$.` };
    }
    case 'root': {
      const b = rng.pick(SQUAREFREE);
      const c = rng.pick([1, 1, 2, 3, -1]);
      return { tex: radTex(c, b), rational: false, why: c === 1 ? IRRATIONAL_WHY.root : IRRATIONAL_WHY.scaledRoot };
    }
    case 'cbrt': {
      const b = rng.pick(CUBEFREE);
      return { tex: `\\sqrt[3]{${rng.bool() ? '-' : ''}${b}}`, rational: false, why: IRRATIONAL_WHY.cbrt };
    }
    case 'pi': {
      const tex = rng.pick(['\\pi', '2\\pi', '3\\pi', '\\frac{\\pi}{2}']);
      return { tex, rational: false, why: tex === '\\pi' ? IRRATIONAL_WHY.pi : IRRATIONAL_WHY.scaledPi };
    }
    case 'pattern':
      return { tex: patternDecimal(rng), rational: false, why: IRRATIONAL_WHY.pattern };
    case 'irrCombo': {
      const b = rng.pick(SQUAREFREE.slice(0, 8));
      const k = rng.int(1, 9);
      const choice = rng.int(0, 2);
      if (choice === 0) return { tex: `${k} + \\sqrt{${b}}`, rational: false, why: IRRATIONAL_WHY.combo };
      if (choice === 1) return { tex: `\\sqrt{${b}} + \\sqrt{${b}}`, rational: false, why: `$\\sqrt{${b}} + \\sqrt{${b}} = 2\\sqrt{${b}}$, a nonzero rational number times an irrational number.` };
      const m = rng.pick([2, 3, 5].filter((x) => x !== b));
      return { tex: `\\sqrt{${b}} \\cdot \\sqrt{${m}}`, rational: false, why: `$\\sqrt{${b}} \\cdot \\sqrt{${m}} = \\sqrt{${b * m}}$, and $${b * m}$ is not a perfect square.` };
    }
  }
}

const KINDS: Record<Difficulty, { rational: Kind[]; irrational: Kind[] }> = {
  1: { rational: ['integer', 'fraction', 'terminating', 'perfectRoot'], irrational: ['root', 'pi'] },
  2: { rational: ['repeating', 'perfectRoot', 'perfectCbrt', 'fractionRoot', 'terminating'], irrational: ['root', 'cbrt', 'pi', 'pattern'] },
  3: { rational: ['ratCombo', 'fractionRoot', 'repeating', 'perfectCbrt'], irrational: ['irrCombo', 'cbrt', 'pattern'] },
};

/**
 * Independent classification from the printed number: \pi means irrational (no item divides
 * by pi), an \overline decimal is rational, a \ldots pattern decimal is irrational; anything else
 * is evaluated exactly with radical arithmetic.
 */
export function classifyTex(tex: string): boolean | null {
  if (tex.includes('\\pi')) return false;
  if (tex.includes('\\overline')) return true;
  if (tex.includes('\\ldots')) {
    // a pattern decimal: the digits must follow "a b a bb a bbb ..." with a != b, which never repeats
    const digits = tex.replace(/\\ldots/, '').split('.')[1] ?? '';
    const [a, b] = digits;
    if (!a || !b || a === b) return null;
    let want = '';
    for (let k = 1; want.length < digits.length; k++) want += a + b.repeat(k);
    if (!want.startsWith(digits)) return null;
    return false;
  }
  const s = texSurd(tex);
  return s ? s.isRational() : null;
}

const PATTERN_NOTE = ' (The dots mean the digits keep following the pattern shown.)';

const RATIONAL_LABEL = 'Rational, because it can be written as a fraction of two integers';
const IRRATIONAL_LABEL = 'Irrational, because its decimal never ends and never repeats';
const WRONG_ROOT = 'Irrational, because every square root is irrational';
const WRONG_DECIMAL = 'Rational, because a calculator shows it as a decimal';

const CLASSIFY_HINTS: [string, string, string, string] = [
  'A **rational** number can be written as $\\frac{a}{b}$ with integers $a$ and $b$ ($b \\ne 0$). An **irrational** number cannot.',
  'Decimals that end, or repeat forever, are rational. Decimals that never end and never repeat are irrational.',
  'For a root, ask whether the number inside is a perfect square (or a perfect cube for $\\sqrt[3]{\\ }$). Simplify first if the expression combines roots.',
  'A calculator rounds every number to a few digits, so the screen alone cannot tell you whether the decimal stops or repeats.',
];

export const genClassifyNumber: GeneratorDef = {
  id: 'u3.classify-number',
  skillId: 'S3.01',
  description: 'Classify a number as rational or irrational and give the reason.',
  generate(rng, difficulty) {
    const wantRational = rng.bool();
    const pool = KINDS[difficulty];
    const item = makeItem(rng, rng.pick(wantRational ? pool.rational : pool.irrational));
    const correct = item.rational ? RATIONAL_LABEL : IRRATIONAL_LABEL;
    const other = item.rational ? IRRATIONAL_LABEL : RATIONAL_LABEL;
    const answer = makeChoice(rng, correct, [other, WRONG_ROOT, WRONG_DECIMAL]);
    const solution: SolutionStep[] = [
      { text: `Look at $${item.tex}$.`, why: item.why },
      { text: item.rational ? `So $${item.tex}$ is **rational**.` : `So $${item.tex}$ is **irrational**.`, why: item.rational ? 'It can be written as a fraction of two integers.' : 'It cannot be written as a fraction of two integers.' },
    ];
    return makeProblem({
      skillId: 'S3.01',
      tags: [],
      prompt: [p(`Is $${item.tex}$ rational or irrational? Choose the correct answer **and** reason.${item.tex.includes('\\ldots') ? PATTERN_NOTE : ''}`)],
      answer,
      hints: CLASSIFY_HINTS,
      solution,
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const m = /^Is \$(.+)\$ rational or irrational\?/.exec((pr.prompt[0] as { text: string }).text);
    if (!m) return ['cannot parse'];
    const rational = classifyTex(m[1]);
    if (rational === null) return [`cannot classify ${m[1]}`];
    const errs: string[] = [];
    if (choiceLabel(pr.answer) !== (rational ? RATIONAL_LABEL : IRRATIONAL_LABEL)) errs.push('wrong key');
    if (pr.answer.options.length !== 4) errs.push('expected 4 options');
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S3.01: pick the one irrational (or rational) number
// ---------------------------------------------------------------------------

export const genWhichIrrational: GeneratorDef = {
  id: 'u3.which-irrational',
  skillId: 'S3.01',
  description: 'Pick the one irrational (or the one rational) number from a list.',
  generate(rng, difficulty) {
    const askRational = difficulty >= 2 && rng.int(0, 2) === 0;
    const pool = KINDS[difficulty];
    const odd = makeItem(rng, rng.pick(askRational ? pool.rational : pool.irrational));
    const rest: NumItem[] = [];
    const used = new Set([odd.tex]);
    const otherKinds = rng.shuffle([...(askRational ? pool.irrational : pool.rational)]);
    for (let guard = 0; rest.length < 3 && guard < 50; guard++) {
      const it = makeItem(rng, otherKinds[guard % otherKinds.length]);
      if (used.has(it.tex)) continue;
      used.add(it.tex);
      rest.push(it);
    }
    const lab = (t: string) => `$${t}$`;
    const answer = makeChoice(rng, lab(odd.tex), rest.map((r) => lab(r.tex)));
    const word = askRational ? 'rational' : 'irrational';
    const all = answer.options.map((o) => [odd, ...rest].find((i) => lab(i.tex) === o.label)!);
    return makeProblem({
      skillId: 'S3.01',
      tags: [],
      prompt: [p(`Which number is **${word}**?${[odd, ...rest].some((i) => i.tex.includes('\\ldots')) ? PATTERN_NOTE : ''}`)],
      answer,
      hints: [
        CLASSIFY_HINTS[0],
        'Check each choice one at a time. Simplify any roots first.',
        'Perfect squares like $4, 9, 16, 25, 36$ have whole-number square roots. Perfect cubes like $8, 27, 64$ have whole-number cube roots.',
        `Exactly one choice is ${word}. Rule out the other three by showing they are ${askRational ? 'irrational' : 'rational'}.`,
      ],
      solution: [
        ...all.map((i) => ({ text: `$${i.tex}$ is ${i.rational ? 'rational' : 'irrational'}.`, why: i.why })),
        { text: `The ${word} number is $${odd.tex}$.` },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const m = /^Which number is \*\*(rational|irrational)\*\*\?/.exec((pr.prompt[0] as { text: string }).text);
    if (!m) return ['cannot parse'];
    const want = m[1] === 'rational';
    const errs: string[] = [];
    const classes = pr.answer.options.map((o) => classifyTex(o.label.slice(1, -1)));
    if (classes.some((c) => c === null)) return ['cannot classify an option'];
    const hits = pr.answer.options.filter((_, i) => classes[i] === want);
    if (hits.length !== 1) errs.push(`${hits.length} options are ${m[1]}`);
    else if (hits[0].id !== pr.answer.correct) errs.push('wrong key');
    if (pr.answer.options.length !== 4) errs.push('expected 4 options');
    return errs;
  },
};

// ---------------------------------------------------------------------------
// S3.02: closure of sums and products
// ---------------------------------------------------------------------------

type Op = 'sum' | 'product';
type Type = 'rational' | 'irrational' | 'nonzero rational';
interface Rule {
  a: Type;
  b: Type;
  op: Op;
  result: 'always rational' | 'always irrational' | 'sometimes';
  why: string;
}

const RULES: Rule[] = [
  { a: 'rational', b: 'rational', op: 'sum', result: 'always rational', why: '$\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$, which is again a fraction of integers.' },
  { a: 'rational', b: 'rational', op: 'product', result: 'always rational', why: '$\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{ac}{bd}$, which is again a fraction of integers.' },
  { a: 'rational', b: 'irrational', op: 'sum', result: 'always irrational', why: 'If the sum were rational, subtracting the rational number would make the irrational number rational, which is impossible.' },
  { a: 'nonzero rational', b: 'irrational', op: 'product', result: 'always irrational', why: 'If the product were rational, dividing by the nonzero rational number would make the irrational number rational, which is impossible.' },
  { a: 'irrational', b: 'irrational', op: 'sum', result: 'sometimes', why: '$\\sqrt{2} + \\sqrt{3}$ is irrational, but $\\sqrt{2} + (-\\sqrt{2}) = 0$ is rational.' },
  { a: 'irrational', b: 'irrational', op: 'product', result: 'sometimes', why: '$\\sqrt{2} \\cdot \\sqrt{3} = \\sqrt{6}$ is irrational, but $\\sqrt{2} \\cdot \\sqrt{8} = 4$ is rational.' },
];

const RESULT_LABEL = { 'always rational': 'Always rational', 'always irrational': 'Always irrational', sometimes: 'Sometimes rational and sometimes irrational' } as const;

const article = (t: Type) => (t === 'irrational' ? 'an' : 'a');

function ruleText(r: Rule): string {
  if (r.a === r.b) return `the ${r.op} of two ${r.a} numbers`;
  return `the ${r.op} of ${article(r.a)} ${r.a} number and ${article(r.b)} ${r.b} number`;
}

/** Sample numbers for brute-force checking of closure claims. */
const SAMPLES: Record<Type, string[]> = {
  rational: ['0', '1', '-3', '\\frac{1}{2}', '\\frac{-5}{3}', '7'],
  'nonzero rational': ['1', '-3', '\\frac{1}{2}', '\\frac{-5}{3}', '7'],
  irrational: ['\\sqrt{2}', '-\\sqrt{2}', '\\sqrt{3}', '1 + \\sqrt{2}', '1 - \\sqrt{2}', '\\sqrt{8}', '2\\sqrt{3}', '\\sqrt{6}'],
};

/** What the samples show: every result rational, every result irrational, or a mix. */
export function sampleClosure(a: Type, b: Type, op: Op): Rule['result'] {
  let rat = 0;
  let irr = 0;
  for (const x of SAMPLES[a])
    for (const y of SAMPLES[b]) {
      const s = texSurd(op === 'sum' ? `\\left(${x}\\right) + \\left(${y}\\right)` : `\\left(${x}\\right) \\cdot \\left(${y}\\right)`);
      if (!s) throw new Error('sample outside surd system');
      if (s.isRational()) rat++;
      else irr++;
    }
  return irr === 0 ? 'always rational' : rat === 0 ? 'always irrational' : 'sometimes';
}

interface Pair {
  x: string;
  y: string;
}

function pairLabel(op: Op, q: Pair): string {
  return op === 'sum' ? `$${q.x}$ and $${q.y}$` : `$${q.x}$ and $${q.y}$`;
}

function combineTex(op: Op, q: Pair): string {
  const y = q.y.startsWith('-') ? `\\left(${q.y}\\right)` : q.y;
  return op === 'sum' ? `${q.x} + ${y}` : `${q.x} \\cdot ${y}`;
}

export const genClosureType: GeneratorDef = {
  id: 'u3.closure-type',
  skillId: 'S3.02',
  description: 'Decide whether sums and products of rational and irrational numbers are rational or irrational.',
  generate(rng, difficulty) {
    if (difficulty === 1) {
      // one specific sum or product
      const op: Op = rng.bool() ? 'sum' : 'product';
      const b = rng.pick(SQUAREFREE.slice(0, 8));
      const f = properFraction(rng);
      const r = rng.bool() ? String(rng.nonzeroInt(-9, 9)) : fracTex(f.n, f.d);
      const kind = rng.int(0, 3);
      let q: Pair;
      let rational: boolean;
      let why: string;
      if (kind === 0) {
        q = { x: r, y: `\\sqrt{${b}}` };
        rational = false;
        why = op === 'sum' ? 'A rational number plus an irrational number is always irrational.' : 'A nonzero rational number times an irrational number is always irrational.';
      } else if (kind === 1) {
        const k = rng.int(2, 9);
        q = { x: r, y: `\\sqrt{${k * k}}` };
        rational = true;
        why = `$\\sqrt{${k * k}} = ${k}$ is rational, and ${op === 'sum' ? 'a sum' : 'a product'} of two rational numbers is rational.`;
      } else if (kind === 2) {
        q = op === 'sum' ? { x: `\\sqrt{${b}}`, y: `-\\sqrt{${b}}` } : { x: `\\sqrt{${b}}`, y: `\\sqrt{${b * 4}}` };
        rational = true;
        why = op === 'sum' ? 'The two irrational numbers are opposites, so the sum is $0$, which is rational.' : `$\\sqrt{${b}} \\cdot \\sqrt{${b * 4}} = \\sqrt{${b * b * 4}} = ${b * 2}$, which is rational.`;
      } else {
        const c = rng.pick(SQUAREFREE.filter((x) => x !== b && x * b !== 4 && Math.sqrt(x * b) % 1 !== 0).slice(0, 6));
        q = { x: `\\sqrt{${b}}`, y: `\\sqrt{${c}}` };
        rational = false;
        why = op === 'sum' ? `$\\sqrt{${b}}$ and $\\sqrt{${c}}$ are unlike radicals, so they cannot combine into a rational number.` : `$\\sqrt{${b}} \\cdot \\sqrt{${c}} = \\sqrt{${b * c}}$, and $${b * c}$ is not a perfect square.`;
      }
      const expr = combineTex(op, q);
      const answer = makeChoice(rng, rational ? 'Rational' : 'Irrational', [rational ? 'Irrational' : 'Rational']);
      return makeProblem({
        skillId: 'S3.02',
        tags: [],
        prompt: [p(`Is $${expr}$ rational or irrational?`)],
        answer,
        hints: [
          'First decide whether each number on its own is rational or irrational.',
          `Rational ${op === 'sum' ? '+' : '×'} rational is rational. ${op === 'sum' ? 'Rational + irrational is irrational.' : 'Nonzero rational × irrational is irrational.'}`,
          'Two irrational numbers need a closer look: try simplifying the result.',
          'A square root of a perfect square is a whole number, so it is rational.',
        ],
        solution: [
          { text: `Classify the parts of $${expr}$.`, why },
          { text: `So $${expr}$ is **${rational ? 'rational' : 'irrational'}**.` },
        ],
        misconceptions: [],
      });
    }
    if (difficulty === 2) {
      const rule = rng.pick(RULES);
      const answer = makeChoice(rng, RESULT_LABEL[rule.result], Object.values(RESULT_LABEL).filter((l) => l !== RESULT_LABEL[rule.result]));
      return makeProblem({
        skillId: 'S3.02',
        tags: [],
        prompt: [p(`What can you say about ${ruleText(rule)}?`)],
        answer,
        hints: [
          'Try a few examples, including ones you think might break the pattern.',
          'Rational numbers are fractions of integers. Adding or multiplying fractions gives another fraction.',
          'Adding a rational number to an irrational number, or multiplying an irrational number by a **nonzero** rational number, keeps the "never ends, never repeats" decimal.',
          'Two irrational numbers can cancel: think about $\\sqrt{2}$ and $-\\sqrt{2}$, or $\\sqrt{2}$ and $\\sqrt{8}$.',
        ],
        solution: [
          { text: `Think about ${ruleText(rule)}.`, why: rule.why },
          { text: `The answer is: ${RESULT_LABEL[rule.result].toLowerCase()}.` },
        ],
        misconceptions: [],
      });
    }
    // difficulty 3: choose the counterexample showing two irrationals can give a rational result
    const op: Op = rng.bool() ? 'sum' : 'product';
    const b = rng.pick(SQUAREFREE.slice(0, 6));
    const k = rng.int(1, 5);
    let correct: Pair;
    if (op === 'sum') correct = rng.bool() ? { x: `${k} + \\sqrt{${b}}`, y: `${k} - \\sqrt{${b}}` } : { x: `\\sqrt{${b}}`, y: `-\\sqrt{${b}}` };
    else correct = rng.bool() ? { x: `\\sqrt{${b}}`, y: `\\sqrt{${b * 9}}` } : { x: `${k > 1 ? k : 2}\\sqrt{${b}}`, y: `\\sqrt{${b}}` };
    const others = SQUAREFREE.filter((x) => x !== b && Math.sqrt(x * b) % 1 !== 0);
    const c = rng.pick(others.slice(0, 6));
    const distractors: Pair[] =
      op === 'sum'
        ? [
            { x: `\\sqrt{${b}}`, y: `\\sqrt{${b}}` },
            { x: `\\sqrt{${b}}`, y: `\\sqrt{${c}}` },
            { x: `${k} + \\sqrt{${b}}`, y: `${k} + \\sqrt{${c}}` },
          ]
        : [
            { x: `\\sqrt{${b}}`, y: `\\sqrt{${c}}` },
            { x: `\\sqrt{${b}}`, y: `\\sqrt{${b * 2 === 4 ? 6 : b * 2}}` },
            { x: `${k} + \\sqrt{${b}}`, y: `\\sqrt{${b}}` },
          ];
    const answer = makeChoice(rng, pairLabel(op, correct), distractors.map((q) => pairLabel(op, q)));
    const all = [correct, ...distractors];
    const ordered = answer.options.map((o) => all.find((q) => pairLabel(op, q) === o.label)!);
    return makeProblem({
      skillId: 'S3.02',
      tags: ['multi-step'],
      prompt: [p(`Each choice is a pair of irrational numbers. Which pair shows that the **${op}** of two irrational numbers can be **rational**?`)],
      answer,
      hints: [
        `Find the ${op} for each pair.`,
        op === 'sum' ? 'Look for a pair whose irrational parts cancel when you add.' : 'Look for a pair whose product is the square root of a perfect square.',
        op === 'sum' ? 'Like radicals add like like terms: $\\sqrt{3} + \\sqrt{3} = 2\\sqrt{3}$.' : 'Use $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$.',
        'Exactly one pair gives a rational result. The others stay irrational.',
      ],
      solution: [
        ...ordered.map((q) => {
          const s = texSurd(combineTex(op, q))!;
          return { text: `$${combineTex(op, q)} = ${s.toTex()}$`, why: s.isRational() ? 'This is rational.' : 'This is irrational.' };
        }),
        { text: `So ${pairLabel(op, correct)} is the pair that works.` },
      ],
      misconceptions: [],
    });
  },
  verify(pr) {
    if (pr.answer.kind !== 'choice') return ['unexpected kind'];
    const text = (pr.prompt[0] as { text: string }).text;
    const key = choiceLabel(pr.answer);
    const one = /^Is \$(.+)\$ rational or irrational\?$/.exec(text);
    if (one) {
      const s = texSurd(one[1]);
      if (!s) return ['cannot evaluate'];
      return key === (s.isRational() ? 'Rational' : 'Irrational') ? [] : ['wrong key'];
    }
    const rule = /^What can you say about the (sum|product) of (?:two (rational|irrational) numbers|an? (rational|nonzero rational) number and an? (irrational) number)\?$/.exec(text);
    if (rule) {
      const op = rule[1] as Op;
      const a = (rule[2] ?? rule[3]) as Type;
      const b = (rule[2] ?? rule[4]) as Type;
      const found = sampleClosure(a, b, op);
      return key === RESULT_LABEL[found] ? [] : [`samples say ${found}`];
    }
    const pair = /^Each choice is a pair of irrational numbers\. Which pair shows that the \*\*(sum|product)\*\*/.exec(text);
    if (pair) {
      const op = pair[1] as Op;
      const errs: string[] = [];
      const ok = pr.answer.options.filter((o) => {
        const m = /^\$(.+)\$ and \$(.+)\$$/.exec(o.label);
        if (!m) return false;
        const xs = texSurd(m[1]);
        const ys = texSurd(m[2]);
        if (!xs || !ys || xs.isRational() || ys.isRational()) errs.push(`option ${o.label} is not two irrationals`);
        const s = texSurd(combineTex(op, { x: m[1], y: m[2] }));
        return !!s && s.isRational();
      });
      if (ok.length !== 1) errs.push(`${ok.length} pairs give a rational ${op}`);
      else if (ok[0].id !== pr.answer.correct) errs.push('wrong key');
      if (pr.answer.options.length !== 4) errs.push('expected 4 options');
      return errs;
    }
    return ['cannot parse'];
  },
};

export const U3_NUMBER_GENERATORS: GeneratorDef[] = [genClassifyNumber, genWhichIrrational, genClosureType];
